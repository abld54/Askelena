import os
import json
import re
import sqlite3
import secrets
import hashlib
import uuid
import urllib.request
from datetime import datetime, timedelta, date
from flask import Flask, send_from_directory, request, jsonify, redirect, session, url_for, Response
from authlib.integrations.flask_client import OAuth
from pathlib import Path
from functools import wraps

app = Flask(__name__, static_folder='out', static_url_path='')
app.secret_key = os.environ.get('NEXTAUTH_SECRET', secrets.token_hex(32))

DB_PATH = os.environ.get('DATABASE_URL', 'file:./dev.db').replace('file:', '').replace('./', '')

# ─────────────────────────────────────────────
# Google OAuth setup
# ─────────────────────────────────────────────
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=os.environ.get('GOOGLE_CLIENT_ID', ''),
    client_secret=os.environ.get('GOOGLE_CLIENT_SECRET', ''),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'},
)

AUTO_HOST_EMAILS = ['anaelb90@gmail.com']

def init_db():
    """Create tables if they don't exist."""
    db = sqlite3.connect(DB_PATH)
    db.execute('''CREATE TABLE IF NOT EXISTS Message (
        id TEXT PRIMARY KEY,
        bookingId TEXT,
        senderEmail TEXT,
        senderName TEXT,
        content TEXT,
        isHost INTEGER DEFAULT 0,
        createdAt TEXT
    )''')
    db.execute('''CREATE TABLE IF NOT EXISTS CalendarSync (
        id TEXT PRIMARY KEY,
        listingId TEXT,
        url TEXT,
        lastSyncAt TEXT
    )''')
    # Add columns that may not exist yet
    for stmt in [
        'ALTER TABLE Listing ADD COLUMN airbnbUrl TEXT DEFAULT ""',
        'ALTER TABLE Booking ADD COLUMN guests INTEGER DEFAULT 1',
    ]:
        try:
            db.execute(stmt)
        except Exception:
            pass
    db.commit()
    db.close()

init_db()

def get_db():
    """Get SQLite connection."""
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    return db

def ensure_user(email, name, image=None):
    """Create or update user in DB, return user dict."""
    db = get_db()
    user = db.execute('SELECT * FROM User WHERE email = ?', (email,)).fetchone()
    if user:
        user = dict(user)
        db.close()
    else:
        from datetime import datetime
        uid = hashlib.sha256(email.encode()).hexdigest()[:25]
        role = 'host' if email in AUTO_HOST_EMAILS else 'guest'
        now = datetime.utcnow().isoformat()
        db.execute(
            'INSERT INTO User (id, email, name, image, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (uid, email, name, image, role, now, now)
        )
        db.commit()
        user = dict(db.execute('SELECT * FROM User WHERE id = ?', (uid,)).fetchone())
        db.close()
    return user

# ─────────────────────────────────────────────
# Auth routes
# ─────────────────────────────────────────────
@app.route('/api/auth/signin/google')
def google_login():
    """Redirect to Google OAuth."""
    redirect_uri = url_for('google_callback', _external=True, _scheme='https')
    return google.authorize_redirect(redirect_uri)

@app.route('/api/auth/callback/google')
def google_callback():
    """Handle Google OAuth callback."""
    try:
        token = google.authorize_access_token()
        userinfo = token.get('userinfo')
        if not userinfo:
            userinfo = google.userinfo()

        email = userinfo.get('email')
        name = userinfo.get('name', email)
        picture = userinfo.get('picture')

        user = ensure_user(email, name, picture)
        session['user'] = {
            'id': user['id'],
            'email': user['email'],
            'name': user['name'],
            'image': user.get('image'),
            'role': user.get('role', 'guest'),
        }
        return redirect('/')
    except Exception as e:
        print(f"OAuth error: {e}")
        return redirect('/login?error=OAuthCallbackError')

@app.route('/api/auth/session')
def get_session():
    """Return current session (compatible with NextAuth client)."""
    user = session.get('user')
    if user:
        return jsonify({'user': user, 'expires': (datetime.utcnow() + timedelta(days=30)).isoformat()})
    return jsonify({})

@app.route('/api/auth/signout', methods=['GET', 'POST'])
def signout():
    """Sign out."""
    session.pop('user', None)
    return redirect('/')

# ─────────────────────────────────────────────
# Static files (Next.js export)
# ─────────────────────────────────────────────
@app.route('/')
def index():
    return send_from_directory('out', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    """Serve static files, fallback to index.html for client-side routing."""
    # Don't intercept API routes
    if path.startswith('api/'):
        return jsonify({'error': 'Not found'}), 404

    file_path = Path('out') / path
    if file_path.exists():
        return send_from_directory('out', path)
    if (Path('out') / f'{path}.html').exists():
        return send_from_directory('out', f'{path}.html')
    return send_from_directory('out', 'index.html')

# ─────────────────────────────────────────────
# API routes
# ─────────────────────────────────────────────
@app.route('/api/listing')
def get_listing():
    try:
        db = get_db()
        listing = db.execute(
            'SELECT * FROM Listing WHERE isPublished = 1 LIMIT 1'
        ).fetchone()
        db.close()
        if not listing:
            return jsonify({
                'id': 'default',
                'title': 'Askelena',
                'pricePerNight': 280,
                'capacity': 6,
            })
        return jsonify(dict(listing))
    except Exception:
        return jsonify({
            'id': 'default',
            'title': 'Askelena',
            'pricePerNight': 280,
            'capacity': 6,
        })

@app.route('/api/availability')
def get_availability():
    try:
        db = get_db()
        blocked = db.execute(
            'SELECT date FROM BlockedDate WHERE listingId = (SELECT id FROM Listing WHERE isPublished = 1 LIMIT 1)'
        ).fetchall()
        bookings = db.execute(
            """SELECT startDate, endDate FROM Booking
            WHERE listingId = (SELECT id FROM Listing WHERE isPublished = 1 LIMIT 1)
            AND status IN ('confirmed', 'pending')"""
        ).fetchall()
        db.close()

        dates = set()
        for row in blocked:
            d = row['date'][:10] if isinstance(row['date'], str) else row['date'].strftime('%Y-%m-%d')
            dates.add(d)
        for booking in bookings:
            start = datetime.fromisoformat(booking['startDate'][:10])
            end = datetime.fromisoformat(booking['endDate'][:10])
            current = start
            while current < end:
                dates.add(current.strftime('%Y-%m-%d'))
                current += timedelta(days=1)

        return jsonify(sorted(list(dates)))
    except Exception:
        return jsonify([])

@app.route('/api/reviews')
def get_reviews():
    try:
        db = get_db()
        reviews = db.execute(
            """SELECT r.id, r.rating, r.comment, r.createdAt, u.name as authorName
            FROM Review r
            JOIN User u ON r.authorId = u.id
            WHERE r.listingId = (SELECT id FROM Listing WHERE isPublished = 1 LIMIT 1)
            ORDER BY r.createdAt DESC
            LIMIT 10"""
        ).fetchall()
        db.close()
        return jsonify([dict(r) for r in reviews])
    except Exception:
        return jsonify([])

@app.route('/api/bookings', methods=['GET', 'POST'])
def bookings_public():
    if request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Donnees requises'}), 400
        try:
            bid = secrets.token_urlsafe(16)
            now = datetime.utcnow().isoformat()
            start = data.get('startDate', '')
            end = data.get('endDate', '')
            # Calculate nights
            try:
                d1 = datetime.fromisoformat(start[:10])
                d2 = datetime.fromisoformat(end[:10])
                nights = (d2 - d1).days
            except Exception:
                nights = 0
            guest_email = data.get('guestEmail', '')
            guest_name = data.get('guestName', '')
            # Find or create guest user
            db = get_db()
            user = db.execute('SELECT id FROM User WHERE email = ?', (guest_email,)).fetchone()
            if user:
                guest_id = user['id']
            else:
                guest_id = secrets.token_urlsafe(16)
                db.execute(
                    'INSERT INTO User (id, email, name, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
                    (guest_id, guest_email, guest_name, 'guest', now, now)
                )
            db.execute(
                '''INSERT INTO Booking (id, listingId, guestId, startDate, endDate, nights, totalPrice, status, guestEmail, guestName, guests, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                (bid, data.get('listingId', ''), guest_id, start, end, nights,
                 data.get('totalPrice', 0), 'pending', guest_email, guest_name,
                 data.get('guests', 1), now, now)
            )
            db.commit()
            booking = dict(db.execute('SELECT * FROM Booking WHERE id = ?', (bid,)).fetchone())
            db.close()
            return jsonify(booking), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    # GET — filter by userId or guestEmail
    try:
        db = get_db()
        user_id = request.args.get('userId')
        guest_email = request.args.get('guestEmail')
        if user_id:
            rows = db.execute('SELECT * FROM Booking WHERE guestId = ? ORDER BY createdAt DESC', (user_id,)).fetchall()
        elif guest_email:
            rows = db.execute('SELECT * FROM Booking WHERE guestEmail = ? ORDER BY createdAt DESC', (guest_email,)).fetchall()
        else:
            rows = db.execute('SELECT * FROM Booking ORDER BY createdAt DESC').fetchall()
        db.close()
        return jsonify([dict(r) for r in rows])
    except Exception:
        return jsonify([])

# ─────────────────────────────────────────────
# Messagerie host/guest
# ─────────────────────────────────────────────
@app.route('/api/messages', methods=['GET', 'POST'])
def messages():
    if request.method == 'POST':
        data = request.get_json()
        if not data or not data.get('bookingId') or not data.get('content'):
            return jsonify({'error': 'bookingId et content requis'}), 400
        msg_id = uuid.uuid4().hex[:25]
        now = datetime.utcnow().isoformat()
        db = get_db()
        db.execute(
            'INSERT INTO Message (id, bookingId, senderEmail, senderName, content, isHost, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (msg_id, data['bookingId'], data.get('senderEmail', ''), data.get('senderName', ''), data['content'], 1 if data.get('isHost') else 0, now)
        )
        db.commit()
        msg = dict(db.execute('SELECT * FROM Message WHERE id = ?', (msg_id,)).fetchone())
        db.close()
        return jsonify(msg), 201

    # GET
    booking_id = request.args.get('bookingId')
    if not booking_id:
        return jsonify({'error': 'bookingId requis'}), 400
    db = get_db()
    rows = db.execute('SELECT * FROM Message WHERE bookingId = ? ORDER BY createdAt ASC', (booking_id,)).fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])

# ─────────────────────────────────────────────
# iCal export & sync
# ─────────────────────────────────────────────
@app.route('/api/calendar/export/<listing_id>')
def calendar_export(listing_id):
    db = get_db()
    bookings = db.execute(
        "SELECT id, startDate, endDate FROM Booking WHERE listingId = ? AND status = 'confirmed'",
        (listing_id,)
    ).fetchall()
    listing = db.execute('SELECT title FROM Listing WHERE id = ?', (listing_id,)).fetchone()
    db.close()

    cal_name = listing['title'] if listing else 'Askelena'
    lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Askelena//Calendar//FR',
        f'X-WR-CALNAME:{cal_name}',
    ]
    for b in bookings:
        b = dict(b)
        dtstart = b['startDate'][:10].replace('-', '')
        dtend = b['endDate'][:10].replace('-', '')
        lines += [
            'BEGIN:VEVENT',
            f'UID:{b["id"]}@askelena',
            f'DTSTART;VALUE=DATE:{dtstart}',
            f'DTEND;VALUE=DATE:{dtend}',
            f'SUMMARY:Reservation Askelena',
            'STATUS:CONFIRMED',
            'END:VEVENT',
        ]
    lines.append('END:VCALENDAR')
    ics_content = '\r\n'.join(lines) + '\r\n'
    return Response(ics_content, mimetype='text/calendar', headers={'Content-Disposition': f'attachment; filename=askelena-{listing_id}.ics'})


def parse_ical_events(ics_text):
    """Parse VEVENT blocks from iCal text, return list of (start_date, end_date) as date objects."""
    events = []
    in_event = False
    dtstart = None
    dtend = None
    for line in ics_text.replace('\r\n', '\n').replace('\r', '\n').split('\n'):
        line = line.strip()
        if line == 'BEGIN:VEVENT':
            in_event = True
            dtstart = dtend = None
        elif line == 'END:VEVENT':
            if in_event and dtstart:
                if not dtend:
                    dtend = dtstart + timedelta(days=1)
                events.append((dtstart, dtend))
            in_event = False
        elif in_event:
            if line.startswith('DTSTART'):
                dtstart = _parse_ical_date(line)
            elif line.startswith('DTEND'):
                dtend = _parse_ical_date(line)
    return events


def _parse_ical_date(line):
    """Extract a date from an iCal DTSTART/DTEND line."""
    val = line.split(':', 1)[-1].strip()
    val = val[:8]  # Take YYYYMMDD part
    try:
        return date(int(val[:4]), int(val[4:6]), int(val[6:8]))
    except (ValueError, IndexError):
        return None


@app.route('/api/calendar/sync/<listing_id>', methods=['POST'])
def calendar_sync(listing_id):
    data = request.get_json()
    if not data or not data.get('url'):
        return jsonify({'error': 'url requis'}), 400
    ical_url = data['url']

    try:
        req = urllib.request.Request(ical_url, headers={'User-Agent': 'Askelena/1.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            ics_text = resp.read().decode('utf-8', errors='replace')
    except Exception as e:
        return jsonify({'error': f'Impossible de telecharger le calendrier: {e}'}), 400

    events = parse_ical_events(ics_text)

    db = get_db()
    # Remove old ical-sync blocked dates for this listing from this URL
    db.execute("DELETE FROM BlockedDate WHERE listingId = ? AND source = 'ical-sync'", (listing_id,))
    inserted = 0
    for start_d, end_d in events:
        current = start_d
        while current < end_d:
            date_str = current.strftime('%Y-%m-%d')
            try:
                bd_id = uuid.uuid4().hex[:25]
                db.execute(
                    'INSERT OR IGNORE INTO BlockedDate (id, listingId, date, source) VALUES (?, ?, ?, ?)',
                    (bd_id, listing_id, date_str, 'ical-sync')
                )
                inserted += 1
            except Exception:
                pass
            current += timedelta(days=1)

    # Upsert CalendarSync record
    now = datetime.utcnow().isoformat()
    existing = db.execute('SELECT id FROM CalendarSync WHERE listingId = ? AND url = ?', (listing_id, ical_url)).fetchone()
    if existing:
        db.execute('UPDATE CalendarSync SET lastSyncAt = ? WHERE id = ?', (now, existing['id']))
    else:
        sync_id = uuid.uuid4().hex[:25]
        db.execute('INSERT INTO CalendarSync (id, listingId, url, lastSyncAt) VALUES (?, ?, ?, ?)', (sync_id, listing_id, ical_url, now))
    db.commit()
    db.close()

    return jsonify({'success': True, 'eventsFound': len(events), 'datesBlocked': inserted})


@app.route('/api/admin/calendar-syncs/<listing_id>')
def admin_calendar_syncs(listing_id):
    db = get_db()
    rows = db.execute('SELECT * FROM CalendarSync WHERE listingId = ? ORDER BY lastSyncAt DESC', (listing_id,)).fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])


# ─────────────────────────────────────────────
# Admin Listings CRUD
# ─────────────────────────────────────────────
@app.route('/api/admin/listings', methods=['GET'])
def admin_list_listings():
    try:
        db = get_db()
        rows = db.execute('SELECT * FROM Listing ORDER BY createdAt DESC').fetchall()
        db.close()
        return jsonify([dict(r) for r in rows])
    except Exception:
        return jsonify([])


@app.route('/api/admin/listings', methods=['POST'])
def admin_create_listing():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Données requises'}), 400
        lid = secrets.token_urlsafe(16)
        now = datetime.utcnow().isoformat()
        db = get_db()
        db.execute(
            '''INSERT INTO Listing (id, title, description, type, location, address, latitude, longitude,
            pricePerNight, capacity, amenities, airbnbUrl, isPublished, hostId, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (lid, data.get('title', ''), data.get('description', ''), data.get('type', 'other'),
             data.get('location', ''), data.get('address', ''), data.get('latitude'), data.get('longitude'),
             data.get('pricePerNight', 0), data.get('capacity', 1), json.dumps(data.get('amenities', [])),
             data.get('airbnbUrl', ''), 1 if data.get('isPublished') else 0,
             data.get('hostId', session.get('user', {}).get('id', '')), now, now)
        )
        db.commit()
        listing = dict(db.execute('SELECT * FROM Listing WHERE id = ?', (lid,)).fetchone())
        db.close()
        return jsonify(listing), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/listings/<lid>', methods=['GET'])
def admin_get_listing(lid):
    try:
        db = get_db()
        listing = db.execute('SELECT * FROM Listing WHERE id = ?', (lid,)).fetchone()
        if not listing:
            db.close()
            return jsonify({'error': 'Not found'}), 404
        result = dict(listing)
        # Include images
        images = db.execute('SELECT * FROM Image WHERE listingId = ? ORDER BY "order" ASC', (lid,)).fetchall()
        result['images'] = [dict(img) for img in images]
        db.close()
        return jsonify(result)
    except Exception:
        return jsonify({}), 500


@app.route('/api/admin/listings/<lid>', methods=['PATCH'])
def admin_update_listing(lid):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Données requises'}), 400
        fields = ['title', 'description', 'type', 'location', 'address', 'latitude', 'longitude',
                  'pricePerNight', 'capacity', 'amenities', 'airbnbUrl', 'isPublished']
        updates = []
        values = []
        for f in fields:
            if f in data:
                val = data[f]
                if f == 'amenities' and isinstance(val, list):
                    val = json.dumps(val)
                if f == 'isPublished':
                    val = 1 if val else 0
                updates.append(f'{f} = ?')
                values.append(val)
        if not updates:
            return jsonify({'error': 'Rien à mettre à jour'}), 400
        updates.append('updatedAt = ?')
        values.append(datetime.utcnow().isoformat())
        values.append(lid)
        db = get_db()
        db.execute(f'UPDATE Listing SET {", ".join(updates)} WHERE id = ?', values)
        db.commit()
        listing = dict(db.execute('SELECT * FROM Listing WHERE id = ?', (lid,)).fetchone())
        db.close()
        return jsonify(listing)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/listings/<lid>', methods=['DELETE'])
def admin_delete_listing(lid):
    try:
        db = get_db()
        db.execute('DELETE FROM Image WHERE listingId = ?', (lid,))
        db.execute('DELETE FROM BlockedDate WHERE listingId = ?', (lid,))
        db.execute('DELETE FROM CalendarSync WHERE listingId = ?', (lid,))
        db.execute('DELETE FROM Listing WHERE id = ?', (lid,))
        db.commit()
        db.close()
        return jsonify({'success': True})
    except Exception:
        return jsonify({'error': 'Erreur suppression'}), 500


# ─────────────────────────────────────────────
# Admin Listings Images
# ─────────────────────────────────────────────
@app.route('/api/admin/listings/<lid>/images', methods=['GET'])
def admin_list_images(lid):
    try:
        db = get_db()
        rows = db.execute('SELECT * FROM Image WHERE listingId = ? ORDER BY "order" ASC', (lid,)).fetchall()
        db.close()
        return jsonify([dict(r) for r in rows])
    except Exception:
        return jsonify([])


@app.route('/api/admin/listings/<lid>/images', methods=['POST'])
def admin_add_image(lid):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Données requises'}), 400
        img_id = secrets.token_urlsafe(16)
        db = get_db()
        db.execute(
            'INSERT INTO Image (id, listingId, url, alt, "order") VALUES (?, ?, ?, ?, ?)',
            (img_id, lid, data.get('url', ''), data.get('alt', ''), data.get('order', 0))
        )
        db.commit()
        img = dict(db.execute('SELECT * FROM Image WHERE id = ?', (img_id,)).fetchone())
        db.close()
        return jsonify(img), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/listings/<lid>/images/<image_id>', methods=['DELETE'])
def admin_delete_image(lid, image_id):
    try:
        db = get_db()
        db.execute('DELETE FROM Image WHERE id = ? AND listingId = ?', (image_id, lid))
        db.commit()
        db.close()
        return jsonify({'success': True})
    except Exception:
        return jsonify({'error': 'Erreur suppression'}), 500


# ─────────────────────────────────────────────
# Admin Listings Calendar Syncs
# ─────────────────────────────────────────────
@app.route('/api/admin/listings/<lid>/calendar-syncs', methods=['GET'])
def admin_listing_calendar_syncs(lid):
    try:
        db = get_db()
        rows = db.execute('SELECT * FROM CalendarSync WHERE listingId = ? ORDER BY lastSyncAt DESC', (lid,)).fetchall()
        db.close()
        return jsonify([dict(r) for r in rows])
    except Exception:
        return jsonify([])


@app.route('/api/admin/listings/<lid>/calendar-syncs', methods=['POST'])
def admin_add_calendar_sync(lid):
    try:
        data = request.get_json()
        if not data or not data.get('url'):
            return jsonify({'error': 'url requis'}), 400
        sync_id = secrets.token_urlsafe(16)
        now = datetime.utcnow().isoformat()
        db = get_db()
        db.execute(
            'INSERT INTO CalendarSync (id, listingId, url, lastSyncAt) VALUES (?, ?, ?, ?)',
            (sync_id, lid, data['url'], now)
        )
        db.commit()
        sync = dict(db.execute('SELECT * FROM CalendarSync WHERE id = ?', (sync_id,)).fetchone())
        db.close()
        return jsonify(sync), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/listings/<lid>/calendar-syncs/<sync_id>', methods=['DELETE'])
def admin_delete_calendar_sync(lid, sync_id):
    try:
        db = get_db()
        db.execute('DELETE FROM CalendarSync WHERE id = ? AND listingId = ?', (sync_id, lid))
        db.commit()
        db.close()
        return jsonify({'success': True})
    except Exception:
        return jsonify({'error': 'Erreur suppression'}), 500


# ─────────────────────────────────────────────
# Admin Listings Blocked Dates
# ─────────────────────────────────────────────
@app.route('/api/admin/listings/<lid>/blocked-dates', methods=['GET'])
def admin_list_blocked_dates(lid):
    try:
        db = get_db()
        rows = db.execute('SELECT * FROM BlockedDate WHERE listingId = ? ORDER BY date ASC', (lid,)).fetchall()
        db.close()
        return jsonify([dict(r) for r in rows])
    except Exception:
        return jsonify([])


@app.route('/api/admin/listings/<lid>/blocked-dates', methods=['POST'])
def admin_add_blocked_date(lid):
    try:
        data = request.get_json()
        if not data or not data.get('date'):
            return jsonify({'error': 'date requis'}), 400
        bd_id = secrets.token_urlsafe(16)
        db = get_db()
        db.execute(
            'INSERT OR IGNORE INTO BlockedDate (id, listingId, date, source) VALUES (?, ?, ?, ?)',
            (bd_id, lid, data['date'], data.get('source', 'manual'))
        )
        db.commit()
        bd = db.execute('SELECT * FROM BlockedDate WHERE id = ?', (bd_id,)).fetchone()
        db.close()
        if bd:
            return jsonify(dict(bd)), 201
        return jsonify({'success': True, 'id': bd_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/listings/<lid>/blocked-dates/<bd_id>', methods=['DELETE'])
def admin_delete_blocked_date(lid, bd_id):
    try:
        db = get_db()
        db.execute('DELETE FROM BlockedDate WHERE id = ? AND listingId = ?', (bd_id, lid))
        db.commit()
        db.close()
        return jsonify({'success': True})
    except Exception:
        return jsonify({'error': 'Erreur suppression'}), 500


# ─────────────────────────────────────────────
# Admin Bookings
# ─────────────────────────────────────────────
@app.route('/api/admin/bookings', methods=['GET'])
def admin_list_bookings():
    try:
        db = get_db()
        rows = db.execute(
            '''SELECT b.*, u.name as guestUserName, u.email as guestUserEmail
            FROM Booking b
            LEFT JOIN User u ON b.guestId = u.id
            ORDER BY b.createdAt DESC'''
        ).fetchall()
        db.close()
        return jsonify([dict(r) for r in rows])
    except Exception:
        return jsonify([])


@app.route('/api/admin/bookings/<bid>', methods=['PATCH'])
def admin_update_booking(bid):
    try:
        data = request.get_json()
        if not data or 'status' not in data:
            return jsonify({'error': 'status requis'}), 400
        status = data['status']
        if status not in ('confirmed', 'cancelled', 'pending', 'completed'):
            return jsonify({'error': 'Status invalide'}), 400
        now = datetime.utcnow().isoformat()
        db = get_db()
        extra = ''
        if status == 'confirmed':
            extra = ', confirmedAt = ?'
        elif status == 'cancelled':
            extra = ', cancelledAt = ?'
        sql = f'UPDATE Booking SET status = ?, updatedAt = ?{extra} WHERE id = ?'
        params = [status, now]
        if extra:
            params.append(now)
        params.append(bid)
        db.execute(sql, params)
        db.commit()
        booking = db.execute('SELECT * FROM Booking WHERE id = ?', (bid,)).fetchone()
        db.close()
        if not booking:
            return jsonify({'error': 'Not found'}), 404
        return jsonify(dict(booking))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────
# Admin Dashboard
# ─────────────────────────────────────────────
@app.route('/api/admin/dashboard', methods=['GET'])
def admin_dashboard():
    try:
        db = get_db()
        total_bookings = db.execute('SELECT COUNT(*) as c FROM Booking').fetchone()['c']
        total_revenue = db.execute("SELECT COALESCE(SUM(totalPrice), 0) as s FROM Booking WHERE status = 'confirmed'").fetchone()['s']
        pending_bookings = db.execute("SELECT COUNT(*) as c FROM Booking WHERE status = 'pending'").fetchone()['c']
        # Occupancy: ratio of confirmed booking days to total days in current month
        now = datetime.utcnow()
        month_start = now.replace(day=1).strftime('%Y-%m-%d')
        if now.month == 12:
            month_end = now.replace(year=now.year + 1, month=1, day=1).strftime('%Y-%m-%d')
        else:
            month_end = now.replace(month=now.month + 1, day=1).strftime('%Y-%m-%d')
        confirmed = db.execute(
            "SELECT startDate, endDate FROM Booking WHERE status = 'confirmed' AND endDate >= ? AND startDate < ?",
            (month_start, month_end)
        ).fetchall()
        listing_count = db.execute('SELECT COUNT(*) as c FROM Listing').fetchone()['c']
        days_in_month = (datetime.fromisoformat(month_end) - datetime.fromisoformat(month_start)).days
        booked_days = 0
        for b in confirmed:
            s = max(datetime.fromisoformat(b['startDate'][:10]), datetime.fromisoformat(month_start))
            e = min(datetime.fromisoformat(b['endDate'][:10]), datetime.fromisoformat(month_end))
            booked_days += max(0, (e - s).days)
        total_available = days_in_month * max(listing_count, 1)
        occupancy_rate = round((booked_days / total_available) * 100, 1) if total_available > 0 else 0
        recent = db.execute(
            '''SELECT b.*, u.name as guestUserName
            FROM Booking b LEFT JOIN User u ON b.guestId = u.id
            ORDER BY b.createdAt DESC LIMIT 5'''
        ).fetchall()
        db.close()
        return jsonify({
            'totalBookings': total_bookings,
            'totalRevenue': total_revenue,
            'occupancyRate': occupancy_rate,
            'pendingBookings': pending_bookings,
            'recentBookings': [dict(r) for r in recent],
        })
    except Exception:
        return jsonify({
            'totalBookings': 0, 'totalRevenue': 0, 'occupancyRate': 0,
            'pendingBookings': 0, 'recentBookings': [],
        })


# ─────────────────────────────────────────────
# Listings publics
# ─────────────────────────────────────────────
@app.route('/api/listings', methods=['GET'])
def public_list_listings():
    try:
        db = get_db()
        rows = db.execute('SELECT * FROM Listing WHERE isPublished = 1 ORDER BY createdAt DESC').fetchall()
        results = []
        for r in rows:
            d = dict(r)
            images = db.execute('SELECT * FROM Image WHERE listingId = ? ORDER BY "order" ASC', (d['id'],)).fetchall()
            d['images'] = [dict(img) for img in images]
            results.append(d)
        db.close()
        return jsonify(results)
    except Exception:
        return jsonify([])


@app.route('/api/listings/<lid>', methods=['GET'])
def public_get_listing(lid):
    try:
        db = get_db()
        listing = db.execute('SELECT * FROM Listing WHERE id = ? AND isPublished = 1', (lid,)).fetchone()
        if not listing:
            db.close()
            return jsonify({'error': 'Not found'}), 404
        result = dict(listing)
        images = db.execute('SELECT * FROM Image WHERE listingId = ? ORDER BY "order" ASC', (lid,)).fetchall()
        result['images'] = [dict(img) for img in images]
        db.close()
        return jsonify(result)
    except Exception:
        return jsonify({}), 500


@app.route('/api/listings/<lid>', methods=['DELETE'])
def public_delete_listing(lid):
    try:
        user = session.get('user')
        if not user:
            return jsonify({'error': 'Non autorisé'}), 401
        db = get_db()
        listing = db.execute('SELECT * FROM Listing WHERE id = ?', (lid,)).fetchone()
        if not listing:
            db.close()
            return jsonify({'error': 'Not found'}), 404
        if listing['hostId'] != user['id'] and user.get('role') != 'host':
            db.close()
            return jsonify({'error': 'Non autorisé'}), 403
        db.execute('DELETE FROM Image WHERE listingId = ?', (lid,))
        db.execute('DELETE FROM BlockedDate WHERE listingId = ?', (lid,))
        db.execute('DELETE FROM CalendarSync WHERE listingId = ?', (lid,))
        db.execute('DELETE FROM Listing WHERE id = ?', (lid,))
        db.commit()
        db.close()
        return jsonify({'success': True})
    except Exception:
        return jsonify({'error': 'Erreur suppression'}), 500


# ─────────────────────────────────────────────
# Admin Scrape
# ─────────────────────────────────────────────
@app.route('/api/admin/scrape', methods=['POST'])
def admin_scrape():
    data = request.get_json()
    if not data or not data.get('url'):
        return jsonify({'title': '', 'description': '', 'pricePerNight': 0, 'images': []})
    url = data['url']
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='replace')
        # Extract og:title
        title_match = re.search(r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
        if not title_match:
            title_match = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:title["\']', html, re.IGNORECASE)
        title = title_match.group(1) if title_match else ''
        # Extract og:description
        desc_match = re.search(r'<meta[^>]+property=["\']og:description["\'][^>]+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
        if not desc_match:
            desc_match = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:description["\']', html, re.IGNORECASE)
        description = desc_match.group(1) if desc_match else ''
        # Extract price
        price_match = re.search(r'[\u20ac$€]\s*(\d+)', html)
        if not price_match:
            price_match = re.search(r'(\d+)\s*[\u20ac$€]', html)
        price = int(price_match.group(1)) if price_match else 0
        # Extract og:image
        images = []
        img_matches = re.findall(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
        if not img_matches:
            img_matches = re.findall(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']', html, re.IGNORECASE)
        images = img_matches[:10]
        return jsonify({
            'title': title,
            'description': description,
            'pricePerNight': price,
            'images': images,
        })
    except Exception:
        return jsonify({'title': '', 'description': '', 'pricePerNight': 0, 'images': []})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

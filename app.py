import os
import json
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

@app.route('/api/bookings', methods=['POST'])
def create_booking():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Donnees requises'}), 400

    return jsonify({
        'success': True,
        'message': 'Demande de reservation recue. Nous vous contacterons sous 24h.',
        'booking': {
            'startDate': data.get('startDate'),
            'endDate': data.get('endDate'),
            'guests': data.get('guests', 1),
        }
    })

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


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

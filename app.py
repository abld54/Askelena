import os
import json
import sqlite3
import secrets
import hashlib
from datetime import datetime, timedelta
from flask import Flask, send_from_directory, request, jsonify, redirect, session, url_for
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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

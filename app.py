import os
import json
import sqlite3
from datetime import datetime, timedelta
from flask import Flask, send_from_directory, request, jsonify
from pathlib import Path

app = Flask(__name__, static_folder='out', static_url_path='')

DB_PATH = os.environ.get('DATABASE_URL', 'file:./dev.db').replace('file:', '').replace('./', '')

def get_db():
    """Get SQLite connection."""
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    return db

# Serve Next.js static export
@app.route('/')
def index():
    return send_from_directory('out', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    """Serve static files, fallback to index.html for client-side routing."""
    file_path = Path('out') / path
    if file_path.exists():
        return send_from_directory('out', path)
    # Try with .html extension
    if (Path('out') / f'{path}.html').exists():
        return send_from_directory('out', f'{path}.html')
    # Fallback to index.html for SPA routing
    return send_from_directory('out', 'index.html')

# API: Get listing info
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

# API: Get unavailable dates
@app.route('/api/availability')
def get_availability():
    try:
        db = get_db()
        # Get blocked dates
        blocked = db.execute(
            'SELECT date FROM BlockedDate WHERE listingId = (SELECT id FROM Listing WHERE isPublished = 1 LIMIT 1)'
        ).fetchall()
        # Get confirmed/pending booking dates
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

# API: Get reviews
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

# API: Create booking
@app.route('/api/bookings', methods=['POST'])
def create_booking():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Donnees requises'}), 400

    # For now, just acknowledge the booking request
    # In production, this would integrate with Stripe
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

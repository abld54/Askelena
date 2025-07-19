from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import os
from blueprints.estimation import estimation_bp
from datetime import datetime
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Configuration de sécurité HTTPS pour la production
if os.environ.get('FLASK_ENV') == 'production' or not os.environ.get('FLASK_ENV'):
    app.config['SESSION_COOKIE_SECURE'] = True
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['PREFERRED_URL_SCHEME'] = 'https'
    app.config['PERMANENT_SESSION_LIFETIME'] = 1800  # 30 minutes
else:
    # Configuration pour le développement local
    app.config['SESSION_COOKIE_SECURE'] = False

# Register blueprints
app.register_blueprint(estimation_bp, url_prefix='/estimation')

# En-têtes de sécurité pour HTTPS
@app.after_request
def add_security_headers(response):
    """Ajouter des en-têtes de sécurité pour HTTPS"""
    if os.environ.get('FLASK_ENV') == 'production' or not os.environ.get('FLASK_ENV'):
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    return response

# Middleware pour les redirections HTTPS et suppression du préfixe www
@app.before_request
def force_https_and_no_www():
    """Force HTTPS et redirige www.askelena.fr vers askelena.fr"""
    
    # Récupérer l'URL complète de la requête
    url = request.url
    host = request.host.lower()
    scheme = request.scheme
    
    # Vérifier si on est en production (pas en développement local)
    is_production = not (host.startswith('localhost') or host.startswith('127.0.0.1'))
    
    if is_production:
        redirect_needed = False
        new_url = url
        
        # 1. Redirection HTTP vers HTTPS
        if scheme == 'http':
            new_url = new_url.replace('http://', 'https://', 1)
            redirect_needed = True
        
        # 2. Redirection www.askelena.fr vers askelena.fr
        if host.startswith('www.'):
            new_host = host[4:]  # Supprimer 'www.'
            new_url = new_url.replace(f'://{host}', f'://{new_host}', 1)
            redirect_needed = True
        
        # Effectuer la redirection si nécessaire
        if redirect_needed:
            return redirect(new_url, code=301)  # Redirection permanente
    
    # Pas de redirection nécessaire
    return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/simulateur', methods=['POST'])
def simulateur():
    """API endpoint for LMNP simulator"""
    try:
        data = request.get_json()
        
        location = data.get('location')
        surface = int(data.get('surface', 0))
        occupancy = int(data.get('occupancy', 0))
        
        # Pricing data per location
        pricing_data = {
            'paris': {'price_per_m2': 4.5, 'renovation_cost': 1200},
            'neuilly': {'price_per_m2': 5.2, 'renovation_cost': 1400},
            'puteaux': {'price_per_m2': 4.8, 'renovation_cost': 1300},
            'courbevoie': {'price_per_m2': 4.6, 'renovation_cost': 1250},
            'boulogne': {'price_per_m2': 4.9, 'renovation_cost': 1350},
            'levallois': {'price_per_m2': 5.0, 'renovation_cost': 1380}
        }
        
        if location not in pricing_data:
            return jsonify({'error': 'Localisation non supportée'}), 400
        
        if not (20 <= surface <= 200):
            return jsonify({'error': 'La surface doit être entre 20 et 200 m²'}), 400
        
        pricing = pricing_data[location]
        
        # Calculate revenues
        daily_rate = surface * pricing['price_per_m2']
        occupancy_rate = 0.75  # 75% occupancy rate
        days_per_month = 30 * occupancy_rate
        monthly_gross = daily_rate * days_per_month
        platform_fees = monthly_gross * 0.15  # 15% platform fees
        monthly_net = monthly_gross - platform_fees
        
        # Calculate annual revenue
        annual_net = monthly_net * occupancy
        
        # Calculate ROI
        renovation_cost = surface * pricing['renovation_cost']
        roi_months = int(renovation_cost / monthly_net) if monthly_net > 0 else 0
        
        return jsonify({
            'monthly_revenue': round(monthly_net),
            'annual_revenue': round(annual_net),
            'roi_months': roi_months,
            'renovation_cost': renovation_cost,
            'daily_rate': round(daily_rate)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        # Traitement du formulaire de contact
        return jsonify({'status': 'success', 'message': 'Message envoyé avec succès!'})
    # Rediriger vers la page principale avec l'ancre contact
    return redirect('/#contact')

@app.route('/blog')
def blog():
    # Pour l'instant, rediriger vers la page principale - sera connecté à Supabase plus tard
    return redirect('/')

@app.route('/blog/<slug>')
def blog_post(slug):
    # Pour l'instant, rediriger vers la page principale - sera connecté à Supabase plus tard
    return redirect('/')

# Service pages routes
@app.route('/services/travaux-design')
def travaux_design():
    return render_template('services/travaux-design.html')

@app.route('/services/revenue-management')
def revenue_management():
    return render_template('services/revenue-management.html')

@app.route('/services/relation-voyageurs')
def relation_voyageurs():
    return render_template('services/relation-voyageurs.html')

@app.route('/services/maintenance-menage')
def maintenance_menage():
    return render_template('services/maintenance-menage.html')

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500

if __name__ == '__main__':
    app.run(debug=True)

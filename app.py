from flask import Flask, render_template, request, jsonify
import os
from datetime import datetime
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'

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
    return render_template('contact.html')

@app.route('/blog')
def blog():
    # Pour l'instant, retourne une page vide - sera connecté à Supabase plus tard
    posts = []
    return render_template('blog.html', posts=posts)

@app.route('/blog/<slug>')
def blog_post(slug):
    # Sera connecté à Supabase plus tard
    return render_template('blog_post.html', post={})

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

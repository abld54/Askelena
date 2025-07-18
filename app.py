from flask import Flask, render_template, request, jsonify, flash, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import StringField, TextAreaField, SelectField, IntegerField
from wtforms.validators import DataRequired, Email, NumberRange
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///askelena.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

db = SQLAlchemy(app)

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Models
class Lead(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text)
    files = db.Column(db.Text)  # JSON string of uploaded files
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Lead {self.name}>'

class BlogPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    slug = db.Column(db.String(120), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.Text)
    image_url = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    published = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f'<BlogPost {self.title}>'

# Forms
class ContactForm(FlaskForm):
    name = StringField('Nom complet', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    message = TextAreaField('Message')
    files = FileField('Photos ou documents', 
                     validators=[FileAllowed(['jpg', 'jpeg', 'png', 'pdf'], 
                                           'Seuls les fichiers JPG, PNG et PDF sont autorisés')])

class SimulatorForm(FlaskForm):
    location = SelectField('Localisation', 
                          choices=[
                              ('', 'Sélectionnez une ville'),
                              ('paris', 'Paris'),
                              ('neuilly', 'Neuilly-sur-Seine'),
                              ('puteaux', 'Puteaux'),
                              ('courbevoie', 'Courbevoie'),
                              ('boulogne', 'Boulogne-Billancourt'),
                              ('levallois', 'Levallois-Perret')
                          ],
                          validators=[DataRequired()])
    surface = IntegerField('Surface (m²)', 
                          validators=[DataRequired(), NumberRange(min=20, max=200)])
    occupancy = SelectField('Mois d\'occupation',
                           choices=[
                               ('', 'Sélectionnez'),
                               ('6', '6 mois'),
                               ('8', '8 mois'),
                               ('10', '10 mois'),
                               ('12', '12 mois')
                           ],
                           validators=[DataRequired()])

# Routes
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
    form = ContactForm()
    
    if form.validate_on_submit():
        # Handle file upload
        uploaded_files = []
        if form.files.data:
            filename = secure_filename(form.files.data.filename)
            if filename:
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                form.files.data.save(file_path)
                uploaded_files.append(filename)
        
        # Save lead to database
        lead = Lead(
            name=form.name.data,
            email=form.email.data,
            message=form.message.data,
            files=json.dumps(uploaded_files)
        )
        
        db.session.add(lead)
        db.session.commit()
        
        flash('Votre demande a été envoyée avec succès ! Nous vous contacterons sous 24h.', 'success')
        return redirect(url_for('index'))
    
    return render_template('contact.html', form=form)

@app.route('/blog')
def blog():
    posts = BlogPost.query.filter_by(published=True).order_by(BlogPost.created_at.desc()).all()
    return render_template('blog.html', posts=posts)

@app.route('/blog/<slug>')
def blog_post(slug):
    post = BlogPost.query.filter_by(slug=slug, published=True).first_or_404()
    return render_template('blog_post.html', post=post)

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

@app.route('/admin')
def admin():
    # Simple admin dashboard (in production, add proper authentication)
    leads = Lead.query.order_by(Lead.created_at.desc()).limit(50).all()
    posts = BlogPost.query.order_by(BlogPost.created_at.desc()).limit(20).all()
    
    return render_template('admin.html', leads=leads, posts=posts)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('500.html'), 500

# Initialize database
def init_db():
    """Initialize database and create sample data"""
    with app.app_context():
        db.create_all()
        
        # Create sample blog posts if none exist
        if BlogPost.query.count() == 0:
            sample_posts = [
                {
                    'title': 'Guide LMNP 2025 : Optimisez vos revenus',
                    'slug': 'guide-lmnp-2025',
                    'content': 'Découvrez les nouvelles opportunités fiscales et les stratégies gagnantes pour 2025...',
                    'excerpt': 'Découvrez les nouvelles opportunités fiscales et les stratégies gagnantes pour 2025.',
                    'image_url': '/static/images/blog-lmnp-2025.jpg',
                    'published': True
                },
                {
                    'title': 'Checklist DPE : Préparez vos biens',
                    'slug': 'checklist-dpe',
                    'content': 'Tous les points à vérifier pour optimiser la performance énergétique de vos biens...',
                    'excerpt': 'Tous les points à vérifier pour optimiser la performance énergétique de vos biens.',
                    'image_url': '/static/images/blog-dpe-checklist.jpg',
                    'published': True
                },
                {
                    'title': 'Tendances location courte durée 2025',
                    'slug': 'tendances-2025',
                    'content': 'Les nouvelles attentes des voyageurs et comment s\'adapter pour maximiser vos revenus...',
                    'excerpt': 'Les nouvelles attentes des voyageurs et comment s\'adapter pour maximiser vos revenus.',
                    'image_url': '/static/images/blog-tendances-2025.jpg',
                    'published': True
                }
            ]
            
            for post_data in sample_posts:
                post = BlogPost(**post_data)
                db.session.add(post)
            
            db.session.commit()
            print("✅ Base de données initialisée avec succès!")

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)

from flask import Blueprint, render_template, request, session, redirect, url_for, jsonify, flash
from flask_wtf.csrf import validate_csrf
from wtforms import ValidationError
import uuid
from datetime import datetime
import json

from forms.estimation_forms import PropertyStepForm, FinancialStepForm, ContactStepForm
from services.estimation_service import EstimationService

estimation_bp = Blueprint('estimation', __name__, url_prefix='/estimation')

# Service d'estimation
estimation_service = EstimationService()

@estimation_bp.route('/start')
def start():
    """Démarrer une nouvelle estimation - initialise la session"""
    # Générer un ID unique pour cette estimation
    estimation_id = str(uuid.uuid4())
    
    # Initialiser la session
    session['estimation_id'] = estimation_id
    session['estimation_data'] = {}
    session['current_step'] = 1
    
    return redirect(url_for('estimation.step', step_num=1))

@estimation_bp.route('/step/<int:step_num>', methods=['GET', 'POST'])
def step(step_num):
    """Gestion des étapes du formulaire multistep"""
    
    # Vérifier que l'estimation est initialisée
    if 'estimation_id' not in session:
        return redirect(url_for('estimation.start'))
    
    # Vérifier que l'étape est valide
    if step_num not in [1, 2, 3]:
        return redirect(url_for('estimation.step', step_num=1))
    
    # Récupérer les données de session
    estimation_data = session.get('estimation_data', {})
    
    # Sélectionner le bon formulaire
    if step_num == 1:
        form = PropertyStepForm()
        template = 'estimation/step1_property.html'
    elif step_num == 2:
        form = FinancialStepForm()
        template = 'estimation/step2_financial.html'
    else:  # step_num == 3
        form = ContactStepForm()
        template = 'estimation/step3_contact.html'
    
    # Pré-remplir le formulaire avec les données de session
    if request.method == 'GET':
        step_key = f'step_{step_num}'
        if step_key in estimation_data:
            for field_name, value in estimation_data[step_key].items():
                if hasattr(form, field_name):
                    getattr(form, field_name).data = value
    
    # Traitement POST
    if request.method == 'POST':
        if form.validate_on_submit():
            # Sauvegarder les données de l'étape
            step_key = f'step_{step_num}'
            estimation_data[step_key] = {}
            
            for field in form:
                if field.name != 'csrf_token':
                    estimation_data[step_key][field.name] = field.data
            
            session['estimation_data'] = estimation_data
            session['current_step'] = step_num
            
            # Redirection selon l'étape
            if step_num < 3:
                return redirect(url_for('estimation.step', step_num=step_num + 1))
            else:
                # Dernière étape - calculer l'estimation et afficher le résultat
                return redirect(url_for('estimation.result'))
        
        else:
            # Erreurs de validation
            for field, errors in form.errors.items():
                for error in errors:
                    flash(f"{getattr(form, field).label.text}: {error}", 'error')
    
    # Calculer le pourcentage de progression
    progress_percent = (step_num / 3) * 100
    
    # Données pour le template
    context = {
        'form': form,
        'step_num': step_num,
        'progress_percent': progress_percent,
        'estimation_id': session['estimation_id']
    }
    
    # Ajouter des insights marché pour l'étape 2
    if step_num == 2 and 'step_1' in estimation_data:
        try:
            address = estimation_data['step_1'].get('address', '')
            property_type = estimation_data['step_1'].get('property_type', '')
            
            # Géocodage pour obtenir la zone
            geo_data = estimation_service.geocode_address(address)
            if geo_data:
                lat, lon, insee_code = geo_data
                zone = estimation_service._determine_zone_from_coordinates(lat, lon)
                insights = estimation_service.get_market_insights(zone, property_type)
                context['market_insights'] = insights
        except Exception as e:
            # En cas d'erreur, continuer sans insights
            pass
    
    return render_template(template, **context)

@estimation_bp.route('/result')
def result():
    """Affichage du résultat de l'estimation"""
    
    # Vérifier que toutes les étapes sont complètes
    estimation_data = session.get('estimation_data', {})
    if not all(f'step_{i}' in estimation_data for i in [1, 2, 3]):
        flash('Veuillez compléter toutes les étapes', 'error')
        return redirect(url_for('estimation.start_estimation'))
    
    try:
        # Récupérer les données des 3 étapes
        step1 = estimation_data['step_1']
        step2 = estimation_data['step_2']
        step3 = estimation_data['step_3']
        
        # Calculer l'estimation
        estimation_result = estimation_service.calculate_estimation(
            address=step1['address'],
            property_type=step1['property_type'],
            surface=int(step1['surface']),
            rooms=int(step1['rooms']),
            condition=step1['condition'],
            purchase_price=int(step2['purchase_price']),
            target_rent=int(step2['target_rent'])
        )
        
        # Sauvegarder le résultat en session pour génération PDF ultérieure
        session['estimation_result'] = {
            'monthly_rent': estimation_result.monthly_rent,
            'annual_rent': estimation_result.annual_rent,
            'gross_yield': estimation_result.gross_yield,
            'net_yield': estimation_result.net_yield,
            'market_rent_min': estimation_result.market_rent_min,
            'market_rent_max': estimation_result.market_rent_max,
            'confidence_score': estimation_result.confidence_score,
            'renovation_cost': estimation_result.renovation_cost,
            'calculated_at': datetime.now().isoformat()
        }
        
        # TODO: Sauvegarder en base de données
        # TODO: Envoyer notification Slack/CRM
        
        context = {
            'estimation': estimation_result,
            'property_data': step1,
            'financial_data': step2,
            'contact_data': step3,
            'estimation_id': session['estimation_id']
        }
        
        return render_template('estimation/result.html', **context)
        
    except Exception as e:
        flash(f'Erreur lors du calcul de l\'estimation: {str(e)}', 'error')
        return redirect(url_for('estimation.step', step_num=3))

@estimation_bp.route('/api/market-data')
def api_market_data():
    """API pour récupérer les données de marché en temps réel (AJAX)"""
    
    address = request.args.get('address', '')
    property_type = request.args.get('property_type', 'apartment')
    
    if not address:
        return jsonify({'error': 'Adresse requise'}), 400
    
    try:
        # Géocodage
        geo_data = estimation_service.geocode_address(address)
        if not geo_data:
            return jsonify({'error': 'Adresse non trouvée'}), 404
        
        lat, lon, insee_code = geo_data
        
        # Récupération données marché
        market_data = estimation_service.get_market_data_dvf(lat, lon, property_type, 50)  # Surface moyenne
        zone = estimation_service._determine_zone_from_coordinates(lat, lon)
        insights = estimation_service.get_market_insights(zone, property_type)
        
        return jsonify({
            'success': True,
            'zone': zone,
            'average_rent_per_m2': market_data['average_rent_per_m2'],
            'confidence': market_data['confidence'],
            'insights': insights
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@estimation_bp.route('/download-pdf')
def download_pdf():
    """Génération et téléchargement du rapport PDF"""
    
    # Vérifier que l'estimation est complète
    if 'estimation_result' not in session:
        flash('Aucune estimation trouvée', 'error')
        return redirect(url_for('estimation.start_estimation'))
    
    # TODO: Implémenter génération PDF avec WeasyPrint
    # Pour l'instant, rediriger vers le résultat
    flash('Génération PDF en cours de développement', 'info')
    return redirect(url_for('estimation.result'))

@estimation_bp.route('/back/<int:step_num>')
def back_to_step(step_num):
    """Retour à une étape précédente"""
    
    if step_num in [1, 2] and 'estimation_id' in session:
        return redirect(url_for('estimation.step', step_num=step_num))
    
    return redirect(url_for('estimation.start_estimation'))

# Gestion d'erreurs spécifiques au blueprint
@estimation_bp.errorhandler(ValidationError)
def handle_csrf_error(e):
    flash('Erreur de sécurité. Veuillez réessayer.', 'error')
    return redirect(url_for('estimation.start_estimation'))

@estimation_bp.errorhandler(404)
def handle_not_found(e):
    return redirect(url_for('estimation.start_estimation'))

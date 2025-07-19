from flask_wtf import FlaskForm
from wtforms import StringField, SelectField, IntegerField, FloatField, BooleanField, TextAreaField
from wtforms.validators import DataRequired, Email, NumberRange, Length, Optional
from wtforms.widgets import NumberInput

class PropertyStepForm(FlaskForm):
    """Étape 1 : Informations sur la propriété"""
    
    # Adresse avec autocomplete BAN INSEE
    address = StringField(
        'Adresse complète',
        validators=[DataRequired(message="L'adresse est obligatoire")],
        render_kw={
            'placeholder': 'Ex: 15 rue de la Paix, 75001 Paris',
            'class': 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-400 focus:border-transparent',
            'autocomplete': 'street-address'
        }
    )
    
    # Type de bien
    property_type = SelectField(
        'Type de bien',
        choices=[
            ('', 'Sélectionnez le type'),
            ('apartment', 'Appartement'),
            ('house', 'Maison'),
            ('studio', 'Studio'),
            ('loft', 'Loft')
        ],
        validators=[DataRequired(message="Veuillez sélectionner le type de bien")],
        render_kw={'class': 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-400 focus:border-transparent'}
    )
    
    # Surface habitable
    surface = IntegerField(
        'Surface habitable (m²)',
        validators=[
            DataRequired(message="La surface est obligatoire"),
            NumberRange(min=10, max=500, message="La surface doit être entre 10 et 500 m²")
        ],
        widget=NumberInput(),
        render_kw={
            'placeholder': '45',
            'class': 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-400 focus:border-transparent',
            'min': '10',
            'max': '500'
        }
    )
    
    # Nombre de pièces
    rooms = SelectField(
        'Nombre de pièces',
        choices=[
            ('', 'Nombre de pièces'),
            ('1', '1 pièce'),
            ('2', '2 pièces'),
            ('3', '3 pièces'),
            ('4', '4 pièces'),
            ('5', '5 pièces'),
            ('6', '6+ pièces')
        ],
        validators=[DataRequired(message="Veuillez indiquer le nombre de pièces")],
        render_kw={'class': 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-400 focus:border-transparent'}
    )
    
    # État général du bien
    condition = SelectField(
        'État général',
        choices=[
            ('', 'État du bien'),
            ('excellent', 'Excellent - Rénové récemment'),
            ('good', 'Bon - Quelques travaux mineurs'),
            ('average', 'Moyen - Travaux nécessaires'),
            ('poor', 'À rénover entièrement')
        ],
        validators=[DataRequired(message="Veuillez indiquer l'état du bien")],
        render_kw={'class': 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-400 focus:border-transparent'}
    )


class FinancialStepForm(FlaskForm):
    """Étape 2 : Informations financières"""
    
    # Prix d'achat
    purchase_price = IntegerField(
        'Prix d\'achat (€)',
        validators=[
            DataRequired(message="Le prix d'achat est obligatoire"),
            NumberRange(min=50000, max=5000000, message="Le prix doit être entre 50 000€ et 5 000 000€")
        ],
        widget=NumberInput(),
        render_kw={
            'placeholder': '350000',
            'class': 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-400 focus:border-transparent',
            'min': '50000',
            'max': '5000000'
        }
    )
    
    # Loyer mensuel visé
    target_rent = IntegerField(
        'Loyer mensuel visé (€)',
        validators=[
            DataRequired(message="Le loyer visé est obligatoire"),
            NumberRange(min=300, max=10000, message="Le loyer doit être entre 300€ et 10 000€")
        ],
        widget=NumberInput(),
        render_kw={
            'placeholder': '1500',
            'class': 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-400 focus:border-transparent',
            'min': '300',
            'max': '10000'
        }
    )
    
    # Apport personnel
    down_payment = IntegerField(
        'Apport personnel (€)',
        validators=[
            DataRequired(message="L'apport est obligatoire"),
            NumberRange(min=0, max=2000000, message="L'apport doit être entre 0€ et 2 000 000€")
        ],
        widget=NumberInput(),
        render_kw={
            'placeholder': '70000',
            'class': 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-400 focus:border-transparent',
            'min': '0',
            'max': '2000000'
        }
    )
    
    # Durée du crédit
    loan_duration = SelectField(
        'Durée du crédit (années)',
        choices=[
            ('', 'Durée du crédit'),
            ('10', '10 ans'),
            ('15', '15 ans'),
            ('20', '20 ans'),
            ('25', '25 ans'),
            ('30', '30 ans')
        ],
        validators=[DataRequired(message="Veuillez sélectionner la durée du crédit")],
        render_kw={'class': 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-400 focus:border-transparent'}
    )


class ContactStepForm(FlaskForm):
    """Étape 3 : Contact et résultat"""
    
    # Email
    email = StringField(
        'Adresse email',
        validators=[
            DataRequired(message="L'email est obligatoire"),
            Email(message="Veuillez entrer une adresse email valide")
        ],
        render_kw={
            'placeholder': 'votre.email@exemple.com',
            'class': 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-400 focus:border-transparent',
            'type': 'email'
        }
    )
    
    # Téléphone
    phone = StringField(
        'Numéro de téléphone',
        validators=[
            DataRequired(message="Le téléphone est obligatoire"),
            Length(min=10, max=15, message="Numéro de téléphone invalide")
        ],
        render_kw={
            'placeholder': '06 12 34 56 78',
            'class': 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-400 focus:border-transparent',
            'type': 'tel'
        }
    )
    
    # Opt-in rappel
    optin_callback = BooleanField(
        'J\'accepte d\'être recontacté(e) par AskElena pour un conseil personnalisé',
        validators=[DataRequired(message="Vous devez accepter d'être recontacté pour continuer")],
        render_kw={'class': 'w-4 h-4 text-gold-600 bg-gray-100 border-gray-300 rounded focus:ring-gold-500'}
    )
    
    # Opt-in RGPD
    optin_rgpd = BooleanField(
        'J\'accepte que mes données soient utilisées pour me recontacter (obligatoire)',
        validators=[DataRequired(message="Vous devez accepter le traitement de vos données")],
        render_kw={'class': 'w-4 h-4 text-gold-600 bg-gray-100 border-gray-300 rounded focus:ring-gold-500'}
    )
    
    # Message optionnel
    message = TextAreaField(
        'Message (optionnel)',
        validators=[Optional(), Length(max=500, message="Le message ne peut pas dépasser 500 caractères")],
        render_kw={
            'placeholder': 'Décrivez votre projet ou posez vos questions...',
            'class': 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-400 focus:border-transparent',
            'rows': '4'
        }
    )

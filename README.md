# AskElena - Conciergerie Haut de Gamme

Site web premium pour AskElena, conciergerie haut de gamme spécialisée dans la gestion locative Airbnb à Paris.

## 🚀 Fonctionnalités

### Frontend
- **Landing page immersive** avec vidéo hero et animations
- **Simulateur LMNP** interactif avec calculs en temps réel
- **Slider avant/après** pour présenter les transformations
- **Carrousel témoignages** avec notes 4,9/5
- **Formulaire de contact** avec upload de fichiers
- **Design responsive** mobile-first avec Tailwind CSS
- **Animations micro-interactions** avec Lava Icons

### Backend
- **API Flask** pour le simulateur de rentabilité
- **Base de données SQLite** pour les leads et articles
- **Gestion des uploads** de fichiers (photos, PDF)
- **Dashboard admin** pour gérer les leads
- **Blog intégré** pour le content marketing
- **SEO optimisé** avec meta tags et JSON-LD

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd askelena
```

2. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

3. **Lancer l'application**
```bash
python app.py
```

4. **Accéder au site**
- Site web : http://localhost:5000
- Dashboard admin : http://localhost:5000/admin

## 📁 Structure du projet

```
askelena/
├── app.py                 # Application Flask principale
├── requirements.txt       # Dépendances Python
├── README.md             # Documentation
├── templates/            # Templates HTML
│   ├── base.html        # Template de base
│   └── index.html       # Page d'accueil
├── static/              # Fichiers statiques
│   ├── js/              # JavaScript
│   │   ├── main.js      # Script principal
│   │   ├── carousel.js  # Carrousel témoignages
│   │   ├── before-after-slider.js  # Slider avant/après
│   │   └── simulator.js # Simulateur LMNP
│   ├── css/             # Styles CSS (Tailwind)
│   ├── images/          # Images du site
│   └── uploads/         # Fichiers uploadés
└── instance/            # Base de données SQLite
```

## 🎨 Design System

### Palette de couleurs
- **Mocha** : Tons chauds et élégants (#af723d à #613e29)
- **Gold** : Accents dorés premium (#f59e0b à #78350f)
- **Gris** : Neutrals modernes pour le texte et backgrounds

### Typographie
- **Titres** : Playfair Display (serif élégant)
- **Corps** : Inter (sans-serif moderne)

### Composants
- Boutons avec gradients et micro-animations
- Cards avec hover effects et shadows
- Formulaires avec focus states personnalisés
- Carrousels avec navigation tactile

## 📊 Simulateur LMNP

Le simulateur calcule automatiquement :
- **Revenus mensuels** basés sur la surface et localisation
- **Revenus annuels** selon les mois d'occupation
- **ROI en mois** incluant les coûts de rénovation
- **Taux d'occupation** optimisé par IA (75%)

### Données de pricing par ville
- Paris : 4,5€/m²/nuit
- Neuilly : 5,2€/m²/nuit  
- Puteaux : 4,8€/m²/nuit
- Courbevoie : 4,6€/m²/nuit
- Boulogne : 4,9€/m²/nuit
- Levallois : 5,0€/m²/nuit

## 🔧 Configuration

### Variables d'environnement
```python
SECRET_KEY = 'your-secret-key-here'
SQLALCHEMY_DATABASE_URI = 'sqlite:///askelena.db'
UPLOAD_FOLDER = 'static/uploads'
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
```

### Base de données
La base de données est créée automatiquement au premier lancement avec :
- Table `leads` pour les contacts
- Table `blog_posts` pour les articles
- Données d'exemple pré-remplies

## 📱 Responsive Design

- **Mobile First** : Optimisé pour smartphones
- **Breakpoints** : sm (640px), md (768px), lg (1024px), xl (1280px)
- **Navigation** : Menu hamburger sur mobile
- **Touch** : Gestes tactiles pour carrousels et sliders

## 🚀 Déploiement

### Hébergement recommandé
- **Render** ou **Railway** pour le backend Flask
- **Netlify** ou **Vercel** pour les assets statiques
- **Cloudinary** pour l'optimisation des images

### Optimisations production
- Minification CSS/JS
- Compression des images
- CDN pour les assets
- Cache headers appropriés

## 📈 Analytics & SEO

### SEO
- Meta tags optimisés
- Open Graph et Twitter Cards
- JSON-LD Schema.org
- Sitemap XML automatique

### Analytics
- Google Analytics 4 ready
- Événements personnalisés pour le simulateur
- Tracking des conversions leads

## 🎯 Objectifs de conversion

- **Taux de conversion lead** : > 22%
- **Temps sur la page** : > 3 minutes
- **Taux de rebond** : < 40%
- **Score PageSpeed** : > 90

## 📞 Support

Pour toute question technique ou demande de fonctionnalité :
- Email : dev@askelena.com
- Documentation : [Wiki interne]
- Issues : [GitHub Issues]

---

**AskElena** - La conciergerie pensée pour les propriétaires exigeants ✨

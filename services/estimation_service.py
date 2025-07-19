import requests
import json
from typing import Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@dataclass
class EstimationResult:
    """Résultat d'estimation locative"""
    monthly_rent: float
    annual_rent: float
    gross_yield: float
    net_yield: float
    market_rent_min: float
    market_rent_max: float
    confidence_score: float
    renovation_cost: Optional[float] = None
    api_source: str = "internal"
    raw_data: Dict = None

class EstimationService:
    """Service d'estimation locative utilisant plusieurs sources de données"""
    
    def __init__(self):
        self.dvf_api_url = "https://app.dvf.etalab.gouv.fr/api/dvf"
        self.ban_api_url = "https://api-adresse.data.gouv.fr/search"
        
        # Coefficients par type de bien et état
        self.property_coefficients = {
            'apartment': {'excellent': 1.0, 'good': 0.95, 'average': 0.85, 'poor': 0.70},
            'house': {'excellent': 1.05, 'good': 1.0, 'average': 0.90, 'poor': 0.75},
            'studio': {'excellent': 0.95, 'good': 0.90, 'average': 0.80, 'poor': 0.65},
            'loft': {'excellent': 1.10, 'good': 1.05, 'average': 0.95, 'poor': 0.80}
        }
        
        # Prix de référence par m² par zone (données de base)
        self.reference_prices = {
            'paris': {'rent_per_m2': 35, 'price_per_m2': 11000, 'renovation_cost': 1200},
            'neuilly': {'rent_per_m2': 32, 'price_per_m2': 10500, 'renovation_cost': 1400},
            'puteaux': {'rent_per_m2': 28, 'price_per_m2': 8500, 'renovation_cost': 1300},
            'courbevoie': {'rent_per_m2': 26, 'price_per_m2': 8000, 'renovation_cost': 1250},
            'boulogne': {'rent_per_m2': 30, 'price_per_m2': 9200, 'renovation_cost': 1350},
            'levallois': {'rent_per_m2': 29, 'price_per_m2': 9000, 'renovation_cost': 1380}
        }

    def geocode_address(self, address: str) -> Optional[Tuple[float, float, str]]:
        """Géocodage d'une adresse via l'API BAN"""
        try:
            params = {
                'q': address,
                'limit': 1,
                'autocomplete': 0
            }
            
            response = requests.get(self.ban_api_url, params=params, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            if data['features']:
                feature = data['features'][0]
                coordinates = feature['geometry']['coordinates']
                insee_code = feature['properties'].get('citycode', '')
                
                return coordinates[1], coordinates[0], insee_code  # lat, lon, insee
            
        except Exception as e:
            logger.error(f"Erreur géocodage: {e}")
            
        return None

    def get_market_data_dvf(self, lat: float, lon: float, property_type: str, surface: int) -> Dict:
        """Récupération des données DVF+ pour estimation marché"""
        try:
            # Simulation d'appel DVF+ (en réalité nécessite une clé API)
            # Pour la démo, on utilise des données simulées basées sur la localisation
            
            # Déterminer la zone approximative
            zone = self._determine_zone_from_coordinates(lat, lon)
            
            if zone in self.reference_prices:
                base_data = self.reference_prices[zone]
                
                # Simulation de données de marché
                market_data = {
                    'average_price_per_m2': base_data['price_per_m2'],
                    'average_rent_per_m2': base_data['rent_per_m2'],
                    'transaction_count': 45,  # Simulé
                    'confidence': 0.85,
                    'zone': zone
                }
                
                return market_data
            
        except Exception as e:
            logger.error(f"Erreur récupération données DVF: {e}")
        
        # Données par défaut si erreur
        return {
            'average_price_per_m2': 8000,
            'average_rent_per_m2': 25,
            'transaction_count': 20,
            'confidence': 0.60,
            'zone': 'unknown'
        }

    def _determine_zone_from_coordinates(self, lat: float, lon: float) -> str:
        """Détermine la zone approximative à partir des coordonnées"""
        # Zones approximatives (à affiner avec de vraies données géographiques)
        if 48.85 <= lat <= 48.88 and 2.25 <= lon <= 2.35:
            return 'paris'
        elif 48.88 <= lat <= 48.90 and 2.25 <= lon <= 2.30:
            return 'neuilly'
        elif 48.88 <= lat <= 48.90 and 2.20 <= lon <= 2.25:
            return 'puteaux'
        elif 48.89 <= lat <= 48.91 and 2.22 <= lon <= 2.27:
            return 'courbevoie'
        elif 48.83 <= lat <= 48.86 and 2.22 <= lon <= 2.27:
            return 'boulogne'
        elif 48.89 <= lat <= 48.91 and 2.27 <= lon <= 2.32:
            return 'levallois'
        else:
            return 'paris'  # Par défaut

    def calculate_estimation(self, 
                           address: str,
                           property_type: str,
                           surface: int,
                           rooms: int,
                           condition: str,
                           purchase_price: int,
                           target_rent: int) -> EstimationResult:
        """Calcul complet de l'estimation locative"""
        
        # 1. Géocodage
        geo_data = self.geocode_address(address)
        if geo_data:
            lat, lon, insee_code = geo_data
        else:
            # Coordonnées par défaut (Paris centre)
            lat, lon, insee_code = 48.8566, 2.3522, '75101'
        
        # 2. Récupération données marché
        market_data = self.get_market_data_dvf(lat, lon, property_type, surface)
        
        # 3. Calcul du loyer de marché
        base_rent_per_m2 = market_data['average_rent_per_m2']
        
        # Application des coefficients
        property_coeff = self.property_coefficients.get(property_type, {}).get(condition, 0.85)
        
        # Ajustement par nombre de pièces (studios et grandes surfaces)
        if rooms == 1:
            room_coeff = 1.1  # Premium studio
        elif rooms >= 5:
            room_coeff = 0.95  # Légère décote grandes surfaces
        else:
            room_coeff = 1.0
        
        # Calcul loyer de marché
        market_rent = base_rent_per_m2 * surface * property_coeff * room_coeff
        
        # Fourchette de loyer
        market_rent_min = market_rent * 0.9
        market_rent_max = market_rent * 1.15
        
        # 4. Calcul des rendements
        annual_rent = target_rent * 12
        gross_yield = (annual_rent / purchase_price) * 100 if purchase_price > 0 else 0
        
        # Estimation charges et fiscalité (approximation)
        annual_charges = annual_rent * 0.25  # 25% charges/fiscalité/vacance
        net_annual_rent = annual_rent - annual_charges
        net_yield = (net_annual_rent / purchase_price) * 100 if purchase_price > 0 else 0
        
        # 5. Coût de rénovation si nécessaire
        renovation_cost = None
        zone = market_data.get('zone', 'paris')
        if condition in ['average', 'poor']:
            base_renovation = self.reference_prices.get(zone, {}).get('renovation_cost', 1200)
            renovation_multiplier = 1.5 if condition == 'poor' else 0.8
            renovation_cost = base_renovation * surface * renovation_multiplier
        
        # 6. Score de confiance
        confidence_score = market_data.get('confidence', 0.7)
        
        # Ajustement confiance selon écart loyer visé/marché
        rent_ratio = target_rent / market_rent if market_rent > 0 else 1
        if 0.9 <= rent_ratio <= 1.1:
            confidence_score *= 1.0  # Loyer réaliste
        elif 0.8 <= rent_ratio < 0.9 or 1.1 < rent_ratio <= 1.2:
            confidence_score *= 0.9  # Légèrement optimiste/pessimiste
        else:
            confidence_score *= 0.7  # Très éloigné du marché
        
        return EstimationResult(
            monthly_rent=target_rent,
            annual_rent=annual_rent,
            gross_yield=round(gross_yield, 2),
            net_yield=round(net_yield, 2),
            market_rent_min=round(market_rent_min),
            market_rent_max=round(market_rent_max),
            confidence_score=round(confidence_score, 2),
            renovation_cost=round(renovation_cost) if renovation_cost else None,
            api_source="dvf_simulation",
            raw_data=market_data
        )

    def get_market_insights(self, zone: str, property_type: str) -> Dict:
        """Insights marché pour affichage utilisateur"""
        base_data = self.reference_prices.get(zone, self.reference_prices['paris'])
        
        return {
            'average_rent_per_m2': base_data['rent_per_m2'],
            'market_trend': 'stable',  # À enrichir avec de vraies données
            'demand_level': 'high',
            'competition': 'moderate',
            'best_rental_type': 'meublé courte durée' if zone in ['paris', 'neuilly'] else 'meublé longue durée'
        }

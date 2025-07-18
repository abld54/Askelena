// LMNP Simulator functionality
class LMNPSimulator {
    constructor() {
        this.form = document.getElementById('simulator-form');
        this.results = document.getElementById('simulator-results');
        this.monthlyRevenue = document.getElementById('monthly-revenue');
        this.annualRevenue = document.getElementById('annual-revenue');
        this.roiMonths = document.getElementById('roi-months');
        
        // Pricing data per location (price per m² per night)
        this.pricingData = {
            'paris': { pricePerM2: 4.5, renovationCost: 1200 },
            'neuilly': { pricePerM2: 5.2, renovationCost: 1400 },
            'puteaux': { pricePerM2: 4.8, renovationCost: 1300 },
            'courbevoie': { pricePerM2: 4.6, renovationCost: 1250 },
            'boulogne': { pricePerM2: 4.9, renovationCost: 1350 },
            'levallois': { pricePerM2: 5.0, renovationCost: 1380 }
        };
        
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time calculation on input change
        const inputs = this.form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => this.calculateIfComplete());
        });
    }
    
    handleSubmit(e) {
        e.preventDefault();
        this.calculate();
    }
    
    calculateIfComplete() {
        const location = this.form.location.value;
        const surface = parseInt(this.form.surface.value);
        const occupancy = parseInt(this.form.occupancy.value);
        
        if (location && surface && occupancy) {
            this.calculate();
        }
    }
    
    calculate() {
        const location = this.form.location.value;
        const surface = parseInt(this.form.surface.value);
        const occupancy = parseInt(this.form.occupancy.value);
        
        if (!location || !surface || !occupancy) {
            this.showError('Veuillez remplir tous les champs');
            return;
        }
        
        if (surface < 20 || surface > 200) {
            this.showError('La surface doit être entre 20 et 200 m²');
            return;
        }
        
        const pricing = this.pricingData[location];
        if (!pricing) {
            this.showError('Localisation non supportée');
            return;
        }
        
        // Calculate revenues
        const dailyRate = surface * pricing.pricePerM2;
        const occupancyRate = 0.75; // 75% occupancy rate
        const daysPerMonth = 30 * occupancyRate;
        const monthlyGross = dailyRate * daysPerMonth;
        const platformFees = monthlyGross * 0.15; // 15% platform fees
        const monthlyNet = monthlyGross - platformFees;
        
        // Calculate annual revenue
        const annualNet = monthlyNet * occupancy;
        
        // Calculate ROI
        const renovationCost = surface * pricing.renovationCost;
        const roiMonths = Math.ceil(renovationCost / monthlyNet);
        
        // Display results with animation
        this.displayResults(monthlyNet, annualNet, roiMonths);
        
        // Track event (if analytics is available)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'simulator_calculation', {
                'location': location,
                'surface': surface,
                'occupancy': occupancy,
                'monthly_revenue': monthlyNet,
                'annual_revenue': annualNet
            });
        }
    }
    
    displayResults(monthly, annual, roi) {
        // Show results container
        this.results.classList.remove('hidden');
        
        // Animate numbers
        this.animateNumber(this.monthlyRevenue, monthly, (value) => formatCurrency(value));
        this.animateNumber(this.annualRevenue, annual, (value) => formatCurrency(value));
        this.animateNumber(this.roiMonths, roi, (value) => `${value} mois`);
        
        // Scroll to results
        setTimeout(() => {
            this.results.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 500);
    }
    
    animateNumber(element, targetValue, formatter) {
        const duration = 1500;
        const startValue = 0;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = startValue + (targetValue - startValue) * easeOut;
            
            element.textContent = formatter(Math.round(currentValue));
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    showError(message) {
        // Hide results if showing
        this.results.classList.add('hidden');
        
        // Show error notification
        showNotification(message, 'error');
    }
}

// Utility function for currency formatting
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Initialize simulator when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new LMNPSimulator();
});

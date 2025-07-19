// Validation temps réel du formulaire de contact
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const successMessage = document.getElementById('success-message');
    
    if (!form) return;
    
    // Configuration de validation
    const validators = {
        fullname: {
            required: true,
            minLength: 2,
            pattern: /^[a-zA-ZÀ-ÿ\s-']+$/,
            message: 'Veuillez entrer un nom valide (lettres uniquement)'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Veuillez entrer une adresse email valide'
        },
        location_or_phone: {
            required: true,
            minLength: 3,
            message: 'Veuillez indiquer la ville du bien ou votre téléphone'
        }
    };
    
    // Fonction de validation d'un champ
    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        const validator = validators[fieldName];
        const errorDiv = field.parentNode.querySelector('.error-message');
        
        if (!validator) return true;
        
        // Vérifier si requis
        if (validator.required && !value) {
            showError(field, errorDiv, 'Ce champ est obligatoire');
            return false;
        }
        
        // Vérifier la longueur minimale
        if (validator.minLength && value.length < validator.minLength) {
            showError(field, errorDiv, `Minimum ${validator.minLength} caractères requis`);
            return false;
        }
        
        // Vérifier le pattern
        if (validator.pattern && value && !validator.pattern.test(value)) {
            showError(field, errorDiv, validator.message);
            return false;
        }
        
        // Validation spécifique pour le champ location_or_phone
        if (fieldName === 'location_or_phone' && value) {
            const isPhone = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(value.replace(/\s/g, ''));
            const isLocation = /^[a-zA-ZÀ-ÿ\s-'0-9èéêëàâäôöùûüÿç]+$/.test(value);
            
            if (!isPhone && !isLocation) {
                showError(field, errorDiv, 'Veuillez entrer une ville valide ou un numéro de téléphone');
                return false;
            }
        }
        
        // Si tout est OK
        hideError(field, errorDiv);
        return true;
    }
    
    // Afficher une erreur
    function showError(field, errorDiv, message) {
        field.classList.add('border-red-400');
        field.classList.remove('border-white/30');
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
    
    // Masquer une erreur
    function hideError(field, errorDiv) {
        field.classList.remove('border-red-400');
        field.classList.add('border-white/30');
        errorDiv.classList.add('hidden');
    }
    
    // Validation en temps réel
    Object.keys(validators).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            // Validation à la saisie (avec délai)
            let timeout;
            field.addEventListener('input', function() {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    validateField(field);
                    updateSubmitButton();
                }, 300);
            });
            
            // Validation à la perte de focus
            field.addEventListener('blur', function() {
                validateField(field);
                updateSubmitButton();
            });
        }
    });
    
    // Mettre à jour l'état du bouton de soumission
    function updateSubmitButton() {
        const isValid = Object.keys(validators).every(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            return field && validateField(field);
        });
        
        submitBtn.disabled = !isValid;
    }
    
    // Gestion de la soumission du formulaire
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Valider tous les champs
        let isValid = true;
        Object.keys(validators).forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field && !validateField(field)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            return;
        }
        
        // Afficher le loading
        const submitText = submitBtn.querySelector('.submit-text');
        const loadingText = submitBtn.querySelector('.loading-text');
        
        submitBtn.disabled = true;
        submitText.classList.add('hidden');
        loadingText.classList.remove('hidden');
        
        // Simuler l'envoi (remplacer par votre logique d'envoi)
        setTimeout(() => {
            // Masquer le formulaire et afficher le message de succès
            form.style.display = 'none';
            successMessage.classList.remove('hidden');
            
            // Optionnel: envoyer les données à votre backend
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            console.log('Données du formulaire:', data);
            
            // Ici vous pouvez ajouter l'appel à votre API
            // fetch('/contact', { method: 'POST', body: formData })
            
        }, 2000);
    });
    
    // Validation initiale
    updateSubmitButton();
});

// Fonction utilitaire pour formater les numéros de téléphone
function formatPhoneNumber(input) {
    const value = input.value.replace(/\D/g, '');
    const formatted = value.replace(/(\d{2})(?=\d)/g, '$1 ');
    input.value = formatted;
}

// Auto-formatage du téléphone si détecté
document.addEventListener('DOMContentLoaded', function() {
    const locationField = document.getElementById('location_or_phone');
    if (locationField) {
        locationField.addEventListener('input', function() {
            const value = this.value.trim();
            // Si ça ressemble à un numéro de téléphone, on le formate
            if (/^\d/.test(value) && value.length > 2) {
                formatPhoneNumber(this);
            }
        });
    }
});

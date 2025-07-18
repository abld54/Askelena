// Before/After slider functionality
class BeforeAfterSlider {
    constructor(selector) {
        this.container = document.querySelector(selector);
        if (!this.container) return;
        
        this.afterImage = this.container.querySelector('.after-image');
        this.handle = this.container.querySelector('.slider-handle');
        
        this.isDragging = false;
        this.containerRect = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updatePosition(50); // Start at 50%
    }
    
    bindEvents() {
        // Mouse events
        this.handle.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.onDrag(e));
        document.addEventListener('mouseup', () => this.stopDrag());
        
        // Touch events
        this.handle.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]));
        document.addEventListener('touchmove', (e) => this.onDrag(e.touches[0]));
        document.addEventListener('touchend', () => this.stopDrag());
        
        // Prevent default drag behavior
        this.handle.addEventListener('dragstart', (e) => e.preventDefault());
        
        // Click on container to move handle
        this.container.addEventListener('click', (e) => {
            if (e.target === this.handle || this.handle.contains(e.target)) return;
            
            this.containerRect = this.container.getBoundingClientRect();
            const x = e.clientX - this.containerRect.left;
            const percentage = (x / this.containerRect.width) * 100;
            this.updatePosition(Math.max(0, Math.min(100, percentage)));
        });
        
        // Keyboard navigation
        this.handle.addEventListener('keydown', (e) => {
            let percentage = parseFloat(this.handle.style.left) || 50;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    percentage = Math.max(0, percentage - 5);
                    this.updatePosition(percentage);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    percentage = Math.min(100, percentage + 5);
                    this.updatePosition(percentage);
                    break;
            }
        });
        
        // Make handle focusable
        this.handle.setAttribute('tabindex', '0');
        this.handle.setAttribute('role', 'slider');
        this.handle.setAttribute('aria-label', 'Glissez pour comparer avant et après');
        this.handle.setAttribute('aria-valuemin', '0');
        this.handle.setAttribute('aria-valuemax', '100');
        this.handle.setAttribute('aria-valuenow', '50');
    }
    
    startDrag(e) {
        this.isDragging = true;
        this.containerRect = this.container.getBoundingClientRect();
        this.container.style.cursor = 'ew-resize';
        
        // Add visual feedback
        this.handle.style.transform = 'translateX(-50%) scale(1.1)';
    }
    
    onDrag(e) {
        if (!this.isDragging || !this.containerRect) return;
        
        const x = e.clientX - this.containerRect.left;
        const percentage = (x / this.containerRect.width) * 100;
        
        this.updatePosition(Math.max(0, Math.min(100, percentage)));
    }
    
    stopDrag() {
        this.isDragging = false;
        this.containerRect = null;
        this.container.style.cursor = '';
        
        // Remove visual feedback
        this.handle.style.transform = 'translateX(-50%) scale(1)';
    }
    
    updatePosition(percentage) {
        // Update handle position
        this.handle.style.left = `${percentage}%`;
        
        // Update clip path for after image
        this.afterImage.style.clipPath = `polygon(${percentage}% 0%, 100% 0%, 100% 100%, ${percentage}% 100%)`;
        
        // Update ARIA attributes
        this.handle.setAttribute('aria-valuenow', Math.round(percentage));
        
        // Add smooth transition when not dragging
        if (!this.isDragging) {
            this.handle.style.transition = 'transform 0.2s ease';
            this.afterImage.style.transition = 'clip-path 0.2s ease';
        } else {
            this.handle.style.transition = 'none';
            this.afterImage.style.transition = 'none';
        }
    }
}

// Initialize before/after slider when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new BeforeAfterSlider('#before-after-slider');
});

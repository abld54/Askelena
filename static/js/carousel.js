// Carousel functionality for testimonials
class Carousel {
    constructor(selector) {
        this.container = document.querySelector(selector);
        if (!this.container) return;
        
        this.track = this.container.querySelector('.carousel-track');
        this.slides = this.container.querySelectorAll('.carousel-slide');
        this.prevBtn = this.container.querySelector('.carousel-prev');
        this.nextBtn = this.container.querySelector('.carousel-next');
        
        this.currentIndex = 0;
        this.slideWidth = this.slides[0]?.offsetWidth || 0;
        this.visibleSlides = this.getVisibleSlides();
        
        this.init();
    }
    
    init() {
        if (this.slides.length === 0) return;
        
        this.updateSlideWidth();
        this.bindEvents();
        this.updateButtons();
        
        // Auto-play
        this.startAutoPlay();
    }
    
    getVisibleSlides() {
        const containerWidth = this.container.offsetWidth;
        if (containerWidth >= 1024) return 3; // lg
        if (containerWidth >= 768) return 2;  // md
        return 1; // sm
    }
    
    updateSlideWidth() {
        this.slideWidth = this.container.offsetWidth / this.visibleSlides;
        this.slides.forEach(slide => {
            slide.style.minWidth = `${this.slideWidth}px`;
        });
    }
    
    bindEvents() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        // Touch/swipe support
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            this.pauseAutoPlay();
        });
        
        this.track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
                isDragging = false;
            }
        });
        
        this.track.addEventListener('touchend', () => {
            isDragging = false;
            this.startAutoPlay();
        });
        
        // Pause on hover
        this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
        this.container.addEventListener('mouseleave', () => this.startAutoPlay());
        
        // Responsive handling
        window.addEventListener('resize', () => {
            this.visibleSlides = this.getVisibleSlides();
            this.updateSlideWidth();
            this.updatePosition();
        });
    }
    
    nextSlide() {
        const maxIndex = this.slides.length - this.visibleSlides;
        this.currentIndex = this.currentIndex >= maxIndex ? 0 : this.currentIndex + 1;
        this.updatePosition();
        this.updateButtons();
    }
    
    prevSlide() {
        const maxIndex = this.slides.length - this.visibleSlides;
        this.currentIndex = this.currentIndex <= 0 ? maxIndex : this.currentIndex - 1;
        this.updatePosition();
        this.updateButtons();
    }
    
    updatePosition() {
        const translateX = -this.currentIndex * this.slideWidth;
        this.track.style.transform = `translateX(${translateX}px)`;
    }
    
    updateButtons() {
        const maxIndex = this.slides.length - this.visibleSlides;
        
        if (this.prevBtn) {
            this.prevBtn.style.opacity = this.currentIndex === 0 ? '0.5' : '1';
        }
        
        if (this.nextBtn) {
            this.nextBtn.style.opacity = this.currentIndex >= maxIndex ? '0.5' : '1';
        }
    }
    
    startAutoPlay() {
        this.pauseAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }
    
    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new Carousel('.carousel-container');
});

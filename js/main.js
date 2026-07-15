/**
 * MAIN.JS - PORTFOLIO DE ISABEL STERLING
 * Todas las funcionalidades centralizadas
 * Versión 3.0 - Unificado
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ===== INICIALIZAR AOS =====
    initAOS();
    
    // ===== MENÚ HAMBURGUESA =====
    initMobileMenu();
    
    // ===== BOTÓN SUBIR ARRIBA =====
    initScrollTop();
    
    // ===== AÑO ACTUAL EN FOOTER =====
    updateCurrentYear();
    
    // ===== EFECTO DE TIPEO (solo en index) =====
    initTypewriter();
    
    // ===== NAVBAR SCROLL EFFECT =====
    initNavbarScroll();
    
    // ===== FILTROS DE PROYECTOS (solo en proyectos.html) =====
    initProjectFilters();
    
    // ===== FAQ ACORDEÓN (solo en contacto.html) =====
    initFaqAccordion();
    
    // ===== FORMULARIO DE CONTACTO (solo en contacto.html) =====
    initContactForm();
    
    // ===== VALIDACIÓN DE FORMULARIO =====
    initFormValidation();
    
    // ===== IMÁGENES LAZY LOAD =====
    initLazyLoad();
    
    // ===== SMOOTH SCROLL =====
    initSmoothScroll();
    
    // ===== CONSOLA BIENVENIDA =====
    showConsoleWelcome();
});

// ============================================
// 1. INICIALIZAR AOS
// ============================================
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });
    }
}

// ============================================
// 2. MENÚ HAMBURGUESA
// ============================================
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const menu = document.getElementById('menu');
    const navbar = document.querySelector('.navbar');
    
    if (!menuToggle || !menu) return;
    
    // Toggle del menú
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
        // Prevenir scroll
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });
    
    // Cerrar menú al hacer clic en un enlace
    document.querySelectorAll('.menu a').forEach(link => {
        link.addEventListener('click', () => {
            closeMenu(menuToggle, menu);
        });
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (navbar && !navbar.contains(e.target)) {
            closeMenu(menuToggle, menu);
        }
    });
    
    // Cerrar menú con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
            closeMenu(menuToggle, menu);
        }
    });
}

function closeMenu(menuToggle, menu) {
    menu.classList.remove('active');
    const icon = menuToggle.querySelector('i');
    if (icon) {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
    document.body.style.overflow = '';
}

// ============================================
// 3. BOTÓN SUBIR ARRIBA
// ============================================
function initScrollTop() {
    if (document.querySelector('.scroll-top')) return;
    
    const scrollBtn = document.createElement('div');
    scrollBtn.className = 'scroll-top';
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.setAttribute('aria-label', 'Volver arriba');
    document.body.appendChild(scrollBtn);
    
    let isVisible = false;
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', () => {
        const shouldShow = window.scrollY > 300;
        if (shouldShow !== isVisible) {
            isVisible = shouldShow;
            scrollBtn.classList.toggle('show', isVisible);
        }
    });
}

// ============================================
// 4. AÑO ACTUAL EN FOOTER
// ============================================
function updateCurrentYear() {
    const currentYear = new Date().getFullYear();
    
    document.querySelectorAll('.current-year').forEach(el => {
        el.textContent = currentYear;
    });
    
    const footerCopy = document.querySelector('.footer-bottom p');
    if (footerCopy) {
        footerCopy.innerHTML = `&copy; ${currentYear} Isabel Sterling - Todos los derechos reservados`;
    }
}

// ============================================
// 5. EFECTO DE TIPEO (Typewriter)
// ============================================
function initTypewriter() {
    const typewriterElement = document.querySelector('.typewriter');
    if (!typewriterElement) return;
    
    const texts = [
        'Ingeniería de Software',
        'Inteligencia Artificial',
        'Desarrollo Web',
        'Machine Learning',
        'Análisis de Datos'
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function type() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            typewriterElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typewriterElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }
        
        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            setTimeout(type, 2500);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            setTimeout(type, 500);
        } else {
            setTimeout(type, isDeleting ? 50 : 100);
        }
    }
    
    type();
}

// ============================================
// 6. NAVBAR SCROLL EFFECT
// ============================================
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    let isScrolled = false;
    
    window.addEventListener('scroll', () => {
        const shouldScrolled = window.scrollY > 50;
        if (shouldScrolled !== isScrolled) {
            isScrolled = shouldScrolled;
            navbar.classList.toggle('scrolled', isScrolled);
        }
    });
}

// ============================================
// 7. FILTROS DE PROYECTOS
// ============================================
function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const categoryWrappers = document.querySelectorAll('.category-wrapper');
    
    if (filterBtns.length === 0 || categoryWrappers.length === 0) return;
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            categoryWrappers.forEach(wrapper => {
                if (filterValue === 'all') {
                    wrapper.style.display = 'block';
                } else {
                    const category = wrapper.getAttribute('data-category');
                    wrapper.style.display = category === filterValue ? 'block' : 'none';
                }
            });
        });
    });
}

// ============================================
// 8. FAQ ACORDEÓN
// ============================================
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems.length === 0) return;
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;
        
        question.addEventListener('click', () => {
            // Cerrar otros
            faqItems.forEach(other => {
                if (other !== item && other.classList.contains('active')) {
                    other.classList.remove('active');
                }
            });
            item.classList.toggle('active');
        });
    });
}

// ============================================
// 9. FORMULARIO DE CONTACTO
// ============================================
function initContactForm() {
    const form = document.getElementById('contacto-form');
    const submitBtn = document.getElementById('submitBtn');
    
    if (!form || !submitBtn) return;
    
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    form.addEventListener('submit', (e) => {
        // Mostrar loading
        if (btnText && btnLoading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-flex';
            submitBtn.disabled = true;
        }
        
        // Restaurar después de 5 segundos (por si falla)
        setTimeout(() => {
            if (btnText && btnLoading) {
                btnText.style.display = 'inline-flex';
                btnLoading.style.display = 'none';
                submitBtn.disabled = false;
            }
        }, 5000);
    });
}

// ============================================
// 10. VALIDACIÓN DE FORMULARIO
// ============================================
function initFormValidation() {
    const form = document.querySelector('form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        const nombre = document.getElementById('nombre');
        const email = document.getElementById('email');
        const mensaje = document.getElementById('mensaje');
        
        let hasError = false;
        
        // Limpiar errores anteriores
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        
        if (nombre && nombre.value.trim() === '') {
            showError(nombre, 'Por favor, ingresa tu nombre');
            hasError = true;
        }
        
        if (email && email.value.trim() === '') {
            showError(email, 'Por favor, ingresa tu email');
            hasError = true;
        } else if (email && !isValidEmail(email.value)) {
            showError(email, 'Por favor, ingresa un email válido');
            hasError = true;
        }
        
        if (mensaje && mensaje.value.trim() === '') {
            showError(mensaje, 'Por favor, escribe tu mensaje');
            hasError = true;
        }
        
        if (hasError) {
            e.preventDefault();
        }
    });
}

function showError(input, message) {
    input.classList.add('input-error');
    const error = document.createElement('span');
    error.className = 'error-message';
    error.style.cssText = `
        color: #EF4444;
        font-size: 0.75rem;
        margin-top: 0.25rem;
        display: block;
    `;
    error.textContent = message;
    input.parentNode.appendChild(error);
    
    input.addEventListener('input', () => {
        input.classList.remove('input-error');
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) existingError.remove();
    }, { once: true });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================
// 11. IMÁGENES LAZY LOAD
// ============================================
function initLazyLoad() {
    const images = document.querySelectorAll('img:not(.no-lazy)');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    imageObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '50px 0px' });
        
        images.forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    } else {
        images.forEach(img => img.classList.add('loaded'));
    }
}

// ============================================
// 12. SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// 13. CONSOLA DE BIENVENIDA
// ============================================
function showConsoleWelcome() {
    console.log('%c🚀 Portafolio de Isabel Sterling', 'color: #6C63FF; font-size: 18px; font-weight: bold;');
    console.log('%c📌 Ingeniería de Software con Inteligencia Artificial', 'color: #FF6584; font-size: 14px;');
    console.log('%c💻 GitHub: https://github.com/isabelsterling', 'color: #94A3B8; font-size: 12px;');
    console.log('%c📧 Email: 1663551@senati.pe', 'color: #94A3B8; font-size: 12px;');
    console.log('%c✨ ¡Gracias por visitar mi portafolio!', 'color: #22C55E; font-size: 14px; font-weight: bold;');
}
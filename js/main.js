// js/main.js
// Funcionalidades generales para todo el portafolio

document.addEventListener('DOMContentLoaded', () => {
    
    // ===== 1. MENÚ HAMBURGUESA =====
    initMobileMenu();
    
    // ===== 2. BOTÓN SUBIR ARRIBA =====
    initScrollTop();
    
    // ===== 3. AÑO ACTUAL EN FOOTER =====
    updateCurrentYear();
    
    // ===== 4. EFECTO DE TIPEO (solo en index) =====
    initTypewriter();
    
    // ===== 5. NAVBAR SCROLL EFFECT =====
    initNavbarScroll();
    
    // ===== 6. VALIDACIÓN DE FORMULARIO (backup) =====
    initFormValidation();
});

// Menú hamburguesa - Versión mejorada
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const menu = document.getElementById('menu');
    
    if (menuToggle && menu) {
        // Cerrar menú al hacer clic en un enlace
        const menuLinks = menu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
                // Cambiar ícono de vuelta a hamburguesa
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
        
        // Toggle del menú
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('active');
            
            // Cambiar ícono
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (menu.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target)) {
                menu.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
});

// Botón subir arriba
function initScrollTop() {
    // Crear botón si no existe
    if (!document.querySelector('.scroll-top')) {
        const scrollBtn = document.createElement('div');
        scrollBtn.className = 'scroll-top';
        scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(scrollBtn);
        
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollBtn.classList.add('show');
            } else {
                scrollBtn.classList.remove('show');
            }
        });
    }
}

// Actualizar año en footer
function updateCurrentYear() {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    yearElements.forEach(el => {
        el.textContent = currentYear;
    });
    
    // También actualizar footer si tiene año fijo
    const footerCopy = document.querySelector('.footer-bottom p');
    if (footerCopy) {
        footerCopy.innerHTML = `&copy; ${currentYear} Isabel Sterling - Todos los derechos reservados`;
    }
}

// Efecto de tipeo
function initTypewriter() {
    const typewriterElement = document.querySelector('.typewriter');
    if (!typewriterElement) return;
    
    const texts = [
        'Ingeniería de Software',
        'Inteligencia Artificial',
        'Desarrollo Web',
        'Machine Learning'
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
            setTimeout(type, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            setTimeout(type, 500);
        } else {
            setTimeout(type, isDeleting ? 100 : 150);
        }
    }
    
    type();
}

// Efecto de scroll en navbar
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(10, 25, 47, 0.98)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'rgba(10, 25, 47, 0.95)';
        }
    });
}

// Validación de formulario
function initFormValidation() {
    const form = document.querySelector('form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        // No prevenir aquí porque Firebase ya lo maneja
        const nombre = document.getElementById('nombre');
        const email = document.getElementById('email');
        const mensaje = document.getElementById('mensaje');
        
        let hasError = false;
        
        // Limpiar errores anteriores
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        
        // Validar nombre
        if (nombre && nombre.value.trim() === '') {
            showError(nombre, 'Por favor, ingresa tu nombre');
            hasError = true;
        }
        
        // Validar email
        if (email && email.value.trim() === '') {
            showError(email, 'Por favor, ingresa tu email');
            hasError = true;
        } else if (email && !isValidEmail(email.value)) {
            showError(email, 'Por favor, ingresa un email válido');
            hasError = true;
        }
        
        // Validar mensaje
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
    error.style.color = '#FF6584';
    error.style.fontSize = '0.8rem';
    error.style.marginTop = '0.25rem';
    error.style.display = 'block';
    error.textContent = message;
    input.parentNode.appendChild(error);
    
    // Remover error al escribir
    input.addEventListener('input', () => {
        input.classList.remove('input-error');
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) existingError.remove();
    });
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Efecto de carga de imágenes lazy
const images = document.querySelectorAll('img');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.classList.add('loaded');
            observer.unobserve(img);
        }
    });
});

images.forEach(img => {
    img.classList.add('lazy');
    imageObserver.observe(img);
});

// Smooth scroll para enlaces internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Detectar si el usuario está en modo oscuro del sistema
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
}

// Mostrar mensaje de bienvenida en consola (developer friendly)
console.log('%c🚀 Portafolio de Isabel Sterling | Ingeniería de Software con IA', 'color: #6C63FF; font-size: 16px; font-weight: bold;');
console.log('%c💻 GitHub: https://github.com/isabelsterling', 'color: #8892B0; font-size: 12px;');
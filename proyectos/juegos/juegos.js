/**
 * SECTOR DE VIDEOJUEGOS
 * Filtros, estadísticas y funcionalidades generales
 */

document.addEventListener('DOMContentLoaded', () => {
    // ========== FILTROS ==========
    const filterBtns = document.querySelectorAll('.filter-btn');
    const gameCards = document.querySelectorAll('.game-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Actualizar botón activo
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            
            gameCards.forEach(card => {
                const categories = card.dataset.category.split(' ');
                if (filter === 'all' || categories.includes(filter)) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // ========== CONTADOR DE JUEGOS ==========
    const totalGames = document.getElementById('totalGames');
    if (totalGames) {
        const visibleGames = document.querySelectorAll('.game-card:not([style*="display: none"])').length;
        totalGames.textContent = visibleGames;
    }
    
    // ========== EFECTO DE CARGA ==========
    const cards = document.querySelectorAll('.game-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + index * 100);
    });
});

// ========== ESTILOS DINÁMICOS ==========
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);
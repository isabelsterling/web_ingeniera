/**
 * RELOJ MUNDIAL
 * Muestra hora en múltiples ciudades, diferencia horaria y recomendaciones para conversar según el horario local de cada ciudad. Permite agregar amigos con su ciudad y ver consejos personalizados.
 */

class WorldClock {
    constructor() {
        // Ciudades disponibles
        this.cities = [
            // América
            { name: "Lima", country: "Perú", timezone: "America/Lima", flag: "🇵🇪", continent: "americas", highlight: true },
            { name: "Ciudad de México", country: "México", timezone: "America/Mexico_City", flag: "🇲🇽", continent: "americas" },
            { name: "Bogotá", country: "Colombia", timezone: "America/Bogota", flag: "🇨🇴", continent: "americas" },
            { name: "Santiago", country: "Chile", timezone: "America/Santiago", flag: "🇨🇱", continent: "americas" },
            { name: "Buenos Aires", country: "Argentina", timezone: "America/Buenos_Aires", flag: "🇦🇷", continent: "americas" },
            { name: "São Paulo", country: "Brasil", timezone: "America/Sao_Paulo", flag: "🇧🇷", continent: "americas" },
            { name: "Nueva York", country: "EE.UU.", timezone: "America/New_York", flag: "🇺🇸", continent: "americas" },
            { name: "Los Ángeles", country: "EE.UU.", timezone: "America/Los_Angeles", flag: "🇺🇸", continent: "americas" },
            { name: "Toronto", country: "Canadá", timezone: "America/Toronto", flag: "🇨🇦", continent: "americas" },
            { name: "Miami", country: "EE.UU.", timezone: "America/New_York", flag: "🇺🇸", continent: "americas" },
            // Europa
            { name: "Madrid", country: "España", timezone: "Europe/Madrid", flag: "🇪🇸", continent: "europe" },
            { name: "Londres", country: "Reino Unido", timezone: "Europe/London", flag: "🇬🇧", continent: "europe" },
            { name: "París", country: "Francia", timezone: "Europe/Paris", flag: "🇫🇷", continent: "europe" },
            { name: "Berlín", country: "Alemania", timezone: "Europe/Berlin", flag: "🇩🇪", continent: "europe" },
            { name: "Roma", country: "Italia", timezone: "Europe/Rome", flag: "🇮🇹", continent: "europe" },
            { name: "Moscú", country: "Rusia", timezone: "Europe/Moscow", flag: "🇷🇺", continent: "europe" },
            { name: "Barcelona", country: "España", timezone: "Europe/Madrid", flag: "🇪🇸", continent: "europe" },
            // Asia
            { name: "Tokio", country: "Japón", timezone: "Asia/Tokyo", flag: "🇯🇵", continent: "asia" },
            { name: "Seúl", country: "Corea del Sur", timezone: "Asia/Seoul", flag: "🇰🇷", continent: "asia" },
            { name: "Shanghái", country: "China", timezone: "Asia/Shanghai", flag: "🇨🇳", continent: "asia" },
            { name: "Dubái", country: "UAE", timezone: "Asia/Dubai", flag: "🇦🇪", continent: "asia" },
            { name: "Bangkok", country: "Tailandia", timezone: "Asia/Bangkok", flag: "🇹🇭", continent: "asia" },
            { name: "Nueva Delhi", country: "India", timezone: "Asia/Kolkata", flag: "🇮🇳", continent: "asia" },
            { name: "Singapur", country: "Singapur", timezone: "Asia/Singapore", flag: "🇸🇬", continent: "asia" },
            // Oceanía
            { name: "Sídney", country: "Australia", timezone: "Australia/Sydney", flag: "🇦🇺", continent: "oceania" },
            { name: "Auckland", country: "Nueva Zelanda", timezone: "Pacific/Auckland", flag: "🇳🇿", continent: "oceania" },
            { name: "Melbourne", country: "Australia", timezone: "Australia/Melbourne", flag: "🇦🇺", continent: "oceania" }
        ];
        
        this.friends = [];
        this.favorites = [];
        this.currentContinent = 'all';
        this.updateInterval = null;
        
        // Elementos DOM
        this.citiesGrid = document.getElementById('citiesGrid');
        this.friendsList = document.getElementById('friendsList');
        this.tipsGrid = document.getElementById('tipsGrid');
        this.continentBtns = document.querySelectorAll('.continent-btn');
        this.addFriendBtn = document.getElementById('addFriendBtn');
        this.friendModal = document.getElementById('friendModal');
        this.yourHours = document.getElementById('yourHours');
        this.yourMinutes = document.getElementById('yourMinutes');
        this.yourSeconds = document.getElementById('yourSeconds');
        this.myLocalTime = document.getElementById('myLocalTime');
        
        this.init();
    }
    
    async init() {
        this.cargarDatos();
        this.eventListeners();
        this.obtenerUbicacion();
        this.renderizarCiudades();
        this.renderizarAmigos();
        this.actualizarTiempo();
        this.actualizarTips();
        
        // Actualizar cada segundo
        this.updateInterval = setInterval(() => {
            this.actualizarTiempo();
            this.actualizarTips();
            this.updateUserClock();
        }, 1000);
    }
    
    // Obtener ubicación del usuario
    obtenerUbicacion() {
        try {
            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const userTime = this.getTimeInTimezone(userTimezone);
            
            document.getElementById('yourLocation').textContent = this.getLocationName(userTimezone);
            document.getElementById('yourTimezone').textContent = userTimezone;
            
            this.updateUserClock();
        } catch (error) {
            console.error('Error obteniendo ubicación:', error);
            document.getElementById('yourLocation').textContent = 'Perú (Lima)';
            document.getElementById('yourTimezone').textContent = 'America/Lima';
        }
    }
    
    updateUserClock() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        if (this.yourHours) this.yourHours.textContent = hours;
        if (this.yourMinutes) this.yourMinutes.textContent = minutes;
        if (this.yourSeconds) this.yourSeconds.textContent = seconds;
        if (this.myLocalTime) this.myLocalTime.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    getLocationName(timezone) {
        const locationMap = {
            'America/Lima': 'Perú (Lima)',
            'America/Mexico_City': 'México (CDMX)',
            'America/Bogota': 'Colombia (Bogotá)',
            'America/Santiago': 'Chile (Santiago)',
            'America/Buenos_Aires': 'Argentina (Buenos Aires)',
            'America/Sao_Paulo': 'Brasil (São Paulo)',
            'America/New_York': 'EE.UU. (Nueva York)',
            'America/Los_Angeles': 'EE.UU. (Los Ángeles)',
            'America/Toronto': 'Canadá (Toronto)',
            'Europe/Madrid': 'España (Madrid)',
            'Europe/London': 'Reino Unido (Londres)',
            'Europe/Paris': 'Francia (París)',
            'Europe/Berlin': 'Alemania (Berlín)',
            'Europe/Rome': 'Italia (Roma)',
            'Europe/Moscow': 'Rusia (Moscú)',
            'Asia/Tokyo': 'Japón (Tokio)',
            'Asia/Seoul': 'Corea del Sur (Seúl)',
            'Asia/Shanghai': 'China (Shanghái)',
            'Asia/Dubai': 'Emiratos Árabes (Dubái)',
            'Australia/Sydney': 'Australia (Sídney)',
            'Pacific/Auckland': 'Nueva Zelanda (Auckland)'
        };
        return locationMap[timezone] || timezone.split('/')[1]?.replace('_', ' ') || timezone;
    }
    
    getTimeInTimezone(timezone) {
        try {
            return new Date().toLocaleString('es-ES', { timeZone: timezone });
        } catch {
            return new Date().toLocaleString();
        }
    }
    
    getFormattedTime(timezone) {
        try {
            const date = new Date();
            const options = {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            };
            let timeStr = date.toLocaleTimeString('es-ES', options);
            
            let period = '';
            if (timeStr.includes('a. m.') || timeStr.includes('a.m.')) {
                period = 'AM';
                timeStr = timeStr.replace(/\s*[a.]*\s*m\.?\s*/gi, '');
            } else if (timeStr.includes('p. m.') || timeStr.includes('p.m.')) {
                period = 'PM';
                timeStr = timeStr.replace(/\s*[p.]*\s*m\.?\s*/gi, '');
            }
            
            return { time: timeStr.trim(), period };
        } catch {
            const date = new Date();
            return { time: `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`, period: date.getHours() >= 12 ? 'PM' : 'AM' };
        }
    }
    
    getFormattedDate(timezone) {
        try {
            const date = new Date();
            const options = {
                timeZone: timezone,
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            };
            return date.toLocaleDateString('es-ES', options);
        } catch {
            const date = new Date();
            const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
        }
    }
    
    getTimeDifference(timezone) {
        try {
            const localDate = new Date();
            const targetDate = new Date().toLocaleString('en-US', { timeZone: timezone });
            const targetTime = new Date(targetDate);
            
            const diffHours = Math.round((targetTime - localDate) / (1000 * 60 * 60));
            
            if (diffHours === 0) return { text: 'Misma hora', class: '' };
            if (diffHours > 0) return { text: `+${diffHours}h`, class: 'positive' };
            return { text: `${diffHours}h`, class: 'negative' };
        } catch {
            return { text: '--', class: '' };
        }
    }
    
    getHourFromTimezone(timezone) {
        try {
            const date = new Date();
            const options = {
                timeZone: timezone,
                hour: '2-digit',
                hour12: false
            };
            return parseInt(date.toLocaleTimeString('es-ES', options));
        } catch {
            return new Date().getHours();
        }
    }
    
    getCallStatus(hour) {
        if (isNaN(hour)) return { status: 'good', text: '🟢 Puedes conversar' };
        
        if (hour >= 9 && hour <= 12) return { status: 'good', text: '🟢 Excelente momento para conversar ☀️' };
        if (hour >= 12 && hour <= 14) return { status: 'warning', text: '🟡 Hora de almuerzo 🍽️' };
        if (hour >= 15 && hour <= 18) return { status: 'good', text: '🟢 Buena hora para conversar 📞' };
        if (hour >= 18 && hour <= 21) return { status: 'warning', text: '🟡 Horario nocturno 🌙' };
        if (hour >= 21 || hour <= 7) return { status: 'bad', text: '🔴 Probablemente durmiendo 😴' };
        return { status: 'good', text: '🟢 Puedes conversar' };
    }
    
    renderizarCiudades() {
        if (!this.citiesGrid) return;
        
        const filtered = this.currentContinent === 'all' 
            ? this.cities 
            : this.cities.filter(c => c.continent === this.currentContinent);
        
        this.citiesGrid.innerHTML = filtered.map(city => {
            const { time, period } = this.getFormattedTime(city.timezone);
            const date = this.getFormattedDate(city.timezone);
            const diff = this.getTimeDifference(city.timezone);
            const hour = this.getHourFromTimezone(city.timezone);
            const callStatus = this.getCallStatus(hour);
            const isFavorite = this.favorites.includes(city.timezone);
            
            return `
                <div class="city-card ${city.highlight ? 'highlight' : ''}" data-timezone="${city.timezone}">
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-timezone="${city.timezone}">
                        <i class="fas ${isFavorite ? 'fa-star' : 'fa-star-o'}"></i>
                    </button>
                    <div class="city-header">
                        <div class="city-flag">${city.flag}</div>
                        <div class="city-info">
                            <h3>${city.name}</h3>
                            <div class="city-country">${city.country}</div>
                        </div>
                    </div>
                    <div class="city-time">
                        <span class="time-digits">${time}</span>
                        <span class="time-period">${period}</span>
                    </div>
                    <div class="city-date">${date}</div>
                    <div class="diff-info">
                        <div class="time-diff ${diff.class}">
                            <i class="fas ${diff.class === 'positive' ? 'fa-arrow-up' : diff.class === 'negative' ? 'fa-arrow-down' : 'fa-clock'}"></i>
                            ${diff.text}
                        </div>
                        <div class="call-status ${callStatus.status}">
                            ${callStatus.text}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Event listeners para favoritos
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const timezone = btn.dataset.timezone;
                this.toggleFavorite(timezone);
            });
        });
    }
    
    renderizarAmigos() {
        if (!this.friendsList) return;
        
        if (this.friends.length === 0) {
            this.friendsList.innerHTML = `
                <div class="empty-friends">
                    <i class="fas fa-user-friends"></i>
                    <p>No tienes amigos agregados</p>
                    <p class="hint">Agrega amigos para ver sus horarios favoritos</p>
                </div>
            `;
            return;
        }
        
        this.friendsList.innerHTML = this.friends.map(friend => {
            const { time, period } = this.getFormattedTime(friend.timezone);
            const hour = this.getHourFromTimezone(friend.timezone);
            const callStatus = this.getCallStatus(hour);
            const city = this.cities.find(c => c.timezone === friend.timezone);
            
            return `
                <div class="friend-card" data-id="${friend.id}">
                    <div class="friend-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="friend-info">
                        <div class="friend-name">${friend.name}</div>
                        <div class="friend-city">${city ? `${city.flag} ${city.name}` : friend.timezone.split('/')[1]}</div>
                    </div>
                    <div class="friend-time">
                        <div class="time">${time} ${period}</div>
                        <div class="period ${callStatus.status}">${callStatus.text.substring(0, 20)}...</div>
                    </div>
                    <button class="remove-friend" data-id="${friend.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
        }).join('');
        
        document.querySelectorAll('.remove-friend').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                this.eliminarAmigo(id);
            });
        });
    }
    
    actualizarTiempo() {
        this.renderizarCiudades();
        this.renderizarAmigos();
    }
    
    actualizarTips() {
        if (!this.tipsGrid) return;
        
        // Mostrar tips para las ciudades más relevantes
        const topCities = this.cities.filter(c => c.highlight || this.favorites.includes(c.timezone)).slice(0, 4);
        
        if (topCities.length === 0) {
            this.tipsGrid.innerHTML = `
                <div class="tip-card">
                    <i class="fas fa-lightbulb"></i>
                    <div class="tip-content">
                        <div class="tip-city">Consejo</div>
                        <div class="tip-message">Agrega ciudades a favoritos para ver consejos personalizados</div>
                    </div>
                </div>
            `;
            return;
        }
        
        this.tipsGrid.innerHTML = topCities.map(city => {
            const hour = this.getHourFromTimezone(city.timezone);
            let mensaje = '';
            let icono = '';
            
            if (hour >= 9 && hour <= 12) {
                mensaje = '¡Excelente momento para conversar! Está en horario laboral/matutino.';
                icono = '🌞';
            } else if (hour >= 12 && hour <= 14) {
                mensaje = 'Está en hora de almuerzo. Espera un poco para conversar.';
                icono = '🍽️';
            } else if (hour >= 15 && hour <= 18) {
                mensaje = 'Buena hora para contactar. Sigue en horario laboral.';
                icono = '💼';
            } else if (hour >= 18 && hour <= 21) {
                mensaje = 'Horario nocturno. Puedes conversar pero con consideración.';
                icono = '🌙';
            } else if (hour >= 21 || hour <= 7) {
                mensaje = 'Probablemente está durmiendo. Mejor espera unas horas.';
                icono = '😴';
            } else {
                mensaje = 'Puedes conversar sin problema.';
                icono = '📞';
            }
            
            return `
                <div class="tip-card">
                    <i class="fas ${icono === '🌞' ? 'fa-sun' : icono === '🍽️' ? 'fa-utensils' : icono === '💼' ? 'fa-briefcase' : icono === '🌙' ? 'fa-moon' : icono === '😴' ? 'fa-bed' : 'fa-phone'}"></i>
                    <div class="tip-content">
                        <div class="tip-city">${city.flag} ${city.name}</div>
                        <div class="tip-message">${mensaje}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    toggleFavorite(timezone) {
        const index = this.favorites.indexOf(timezone);
        if (index === -1) {
            this.favorites.push(timezone);
            this.mostrarNotificacion('Agregado a favoritos', 'success');
        } else {
            this.favorites.splice(index, 1);
            this.mostrarNotificacion('Eliminado de favoritos', 'info');
        }
        this.guardarFavoritos();
        this.renderizarCiudades();
    }
    
    agregarAmigo(nombre, timezone) {
        if (!nombre || !timezone) {
            this.mostrarNotificacion('Completa todos los campos', 'error');
            return false;
        }
        
        const exists = this.friends.some(f => f.name.toLowerCase() === nombre.toLowerCase());
        if (exists) {
            this.mostrarNotificacion('Ya tienes un amigo con ese nombre', 'warning');
            return false;
        }
        
        this.friends.push({
            id: Date.now(),
            name: nombre,
            timezone: timezone
        });
        
        this.guardarAmigos();
        this.renderizarAmigos();
        this.mostrarNotificacion(`Amigo ${nombre} agregado`, 'success');
        return true;
    }
    
    eliminarAmigo(id) {
        this.friends = this.friends.filter(f => f.id !== id);
        this.guardarAmigos();
        this.renderizarAmigos();
        this.mostrarNotificacion('Amigo eliminado', 'info');
    }
    
    guardarAmigos() {
        localStorage.setItem('worldclock_friends', JSON.stringify(this.friends));
    }
    
    guardarFavoritos() {
        localStorage.setItem('worldclock_favorites', JSON.stringify(this.favorites));
    }
    
    cargarDatos() {
        const friendsSaved = localStorage.getItem('worldclock_friends');
        if (friendsSaved) {
            this.friends = JSON.parse(friendsSaved);
        }
        
        const favoritesSaved = localStorage.getItem('worldclock_favorites');
        if (favoritesSaved) {
            this.favorites = JSON.parse(favoritesSaved);
        }
    }
    
    mostrarNotificacion(mensaje, tipo) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${tipo}`;
        notification.innerHTML = `
            <i class="fas ${tipo === 'success' ? 'fa-check-circle' : tipo === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${mensaje}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${tipo === 'success' ? '#28A745' : tipo === 'error' ? '#DC3545' : '#6C63FF'};
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            font-size: 0.9rem;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    abrirModalAgregarAmigo() {
        if (!this.friendModal) return;
        
        const modal = this.friendModal;
        const friendName = document.getElementById('friendName');
        const friendCity = document.getElementById('friendCity');
        
        modal.classList.add('active');
        friendName.value = '';
        friendCity.value = '';
        
        const saveBtn = modal.querySelector('.save-friend');
        const cancelBtn = modal.querySelector('.cancel-modal');
        const closeBtn = modal.querySelector('.close-modal');
        
        const saveHandler = () => {
            const name = friendName.value.trim();
            const timezone = friendCity.value;
            if (this.agregarAmigo(name, timezone)) {
                modal.classList.remove('active');
            }
            cleanup();
        };
        
        const closeHandler = () => {
            modal.classList.remove('active');
            cleanup();
        };
        
        const cleanup = () => {
            saveBtn.removeEventListener('click', saveHandler);
            cancelBtn.removeEventListener('click', closeHandler);
            closeBtn.removeEventListener('click', closeHandler);
        };
        
        saveBtn.addEventListener('click', saveHandler);
        cancelBtn.addEventListener('click', closeHandler);
        closeBtn.addEventListener('click', closeHandler);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeHandler();
            }
        });
    }
    
    eventListeners() {
        // Filtros por continente
        this.continentBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.continentBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentContinent = btn.dataset.continent;
                this.renderizarCiudades();
            });
        });
        
        // Agregar amigo
        if (this.addFriendBtn) {
            this.addFriendBtn.addEventListener('click', () => this.abrirModalAgregarAmigo());
        }
    }
}

// Estilos para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    new WorldClock();
});
/**
 * 🎂 AGENDA DE CUMPLEAÑOS
 * Gestiona cumpleaños con recordatorios y organización por meses
 */

class BirthdayAgenda {
    constructor() {
        this.birthdays = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.currentId = null;
        
        // Meses
        this.months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        this.monthColors = {
            0: '#FF6584', 1: '#6C63FF', 2: '#28A745', 3: '#FFC107',
            4: '#17A2B8', 5: '#6F42C1', 6: '#FD7E14', 7: '#E83E8C',
            8: '#20C997', 9: '#007BFF', 10: '#FF6B6B', 11: '#4ECDC4'
        };
        this.monthEmojis = ['🎄', '❤️', '🌸', '🌺', '🌿', '☀️', '🌈', '🍂', '🍁', '🎃', '🦃', '❄️'];
        
        // Elementos DOM
        this.birthdaysList = document.getElementById('birthdaysList');
        this.searchInput = document.getElementById('searchInput');
        this.newBirthdayBtn = document.getElementById('newBirthdayBtn');
        this.monthBtns = document.querySelectorAll('.month-btn');
        this.totalBirthdaysSpan = document.getElementById('totalBirthdays');
        this.birthdaysThisMonthSpan = document.getElementById('birthdaysThisMonth');
        this.upcomingBirthdaysSpan = document.getElementById('upcomingBirthdays');
        
        // Modal
        this.modal = document.getElementById('birthdayModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.personName = document.getElementById('personName');
        this.birthDay = document.getElementById('birthDay');
        this.birthMonth = document.getElementById('birthMonth');
        this.personNote = document.getElementById('personNote');
        this.sendReminder = document.getElementById('sendReminder');
        this.reminderDays = document.getElementById('reminderDays');
        this.colorBtns = document.querySelectorAll('.color-btn');
        this.saveBtn = document.getElementById('saveBirthdayBtn');
        this.deleteBtn = document.getElementById('deleteBirthdayBtn');
        this.selectedColor = '#FF6584';
        
        // Inicializar
        this.init();
    }
    
    init() {
        this.cargarDatos();
        this.eventListeners();
        this.generarDias();
        this.renderizarLista();
        this.actualizarEstadisticas();
        this.verificarCumpleaños();
    }
    
    cargarDatos() {
        const saved = localStorage.getItem('birthdayAgenda_data');
        if (saved) {
            try {
                this.birthdays = JSON.parse(saved);
            } catch {
                this.birthdays = [];
            }
        }
        
        // Agregar ejemplos si está vacío
        if (this.birthdays.length === 0) {
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentDay = today.getDate();
            
            // Ejemplos con fechas cercanas para mostrar funcionalidad
            this.birthdays = [
                {
                    id: Date.now() + 1,
                    name: 'Ana García',
                    day: currentDay,
                    month: currentMonth,
                    color: '#FF6584',
                    note: '🎁 Le gustan los libros de ciencia ficción',
                    reminder: true,
                    reminderDays: 3,
                    createdAt: new Date().toISOString()
                },
                {
                    id: Date.now() + 2,
                    name: 'Carlos Pérez',
                    day: currentDay + 5 > 28 ? currentDay - 10 : currentDay + 5,
                    month: currentMonth,
                    color: '#6C63FF',
                    note: '🍰 Pastel de chocolate',
                    reminder: true,
                    reminderDays: 7,
                    createdAt: new Date().toISOString()
                },
                {
                    id: Date.now() + 3,
                    name: 'María López',
                    day: 15,
                    month: 11, // Diciembre
                    color: '#28A745',
                    note: '🎄 Le encanta la navidad',
                    reminder: true,
                    reminderDays: 14,
                    createdAt: new Date().toISOString()
                },
                {
                    id: Date.now() + 4,
                    name: 'Juan Martínez',
                    day: 1,
                    month: 0, // Enero
                    color: '#FFC107',
                    note: '🎉 Año nuevo',
                    reminder: false,
                    reminderDays: 3,
                    createdAt: new Date().toISOString()
                }
            ];
            this.guardarDatos();
        }
    }
    
    guardarDatos() {
        localStorage.setItem('birthdayAgenda_data', JSON.stringify(this.birthdays));
        this.actualizarEstadisticas();
    }
    
    generarDias() {
        const select = this.birthDay;
        select.innerHTML = '';
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            select.appendChild(option);
        }
    }
    
    eventListeners() {
        // Buscar
        this.searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderizarLista();
        });
        
        // Nuevo cumpleaños
        this.newBirthdayBtn.addEventListener('click', () => this.abrirModal());
        
        // Filtros por mes
        this.monthBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.monthBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.month;
                this.renderizarLista();
            });
        });
        
        // Modal
        document.querySelector('.close-modal').addEventListener('click', () => this.cerrarModal());
        document.querySelector('.cancel-btn').addEventListener('click', () => this.cerrarModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.cerrarModal();
        });
        
        // Colores
        this.colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.colorBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedColor = btn.dataset.color;
            });
        });
        
        // Guardar
        this.saveBtn.addEventListener('click', () => this.guardarCumpleaños());
        
        // Eliminar
        this.deleteBtn.addEventListener('click', () => {
            if (confirm('¿Eliminar este cumpleaños?')) {
                this.eliminarCumpleaños();
            }
        });
        
        // Enter para guardar
        this.personName.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.guardarCumpleaños();
        });
    }
    
    abrirModal(id = null) {
        if (id) {
            // Editar
            const birthday = this.birthdays.find(b => b.id === id);
            if (!birthday) return;
            
            this.currentId = id;
            this.modalTitle.textContent = 'Editar Cumpleaños';
            this.personName.value = birthday.name;
            this.birthDay.value = birthday.day;
            this.birthMonth.value = birthday.month;
            this.personNote.value = birthday.note || '';
            this.sendReminder.checked = birthday.reminder || false;
            this.reminderDays.value = birthday.reminderDays || 3;
            this.selectedColor = birthday.color || '#FF6584';
            
            this.colorBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.color === this.selectedColor);
            });
            
            this.deleteBtn.style.display = 'block';
        } else {
            // Nuevo
            this.currentId = null;
            this.modalTitle.textContent = 'Agregar Cumpleaños';
            this.personName.value = '';
            this.personNote.value = '';
            this.sendReminder.checked = true;
            this.reminderDays.value = 3;
            this.selectedColor = '#FF6584';
            
            this.colorBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.color === this.selectedColor);
            });
            
            this.deleteBtn.style.display = 'none';
        }
        
        this.modal.classList.add('active');
        setTimeout(() => this.personName.focus(), 100);
    }
    
    cerrarModal() {
        this.modal.classList.remove('active');
        this.currentId = null;
    }
    
    guardarCumpleaños() {
        const name = this.personName.value.trim();
        const day = parseInt(this.birthDay.value);
        const month = parseInt(this.birthMonth.value);
        const note = this.personNote.value.trim();
        const reminder = this.sendReminder.checked;
        const reminderDays = parseInt(this.reminderDays.value);
        const color = this.selectedColor;
        
        if (!name) {
            this.personName.style.borderColor = '#FF6584';
            this.personName.placeholder = '⚠️ El nombre es obligatorio';
            setTimeout(() => {
                this.personName.style.borderColor = '';
                this.personName.placeholder = 'Ej: Juan Pérez';
            }, 2000);
            return;
        }
        
        if (this.currentId) {
            // Editar
            const index = this.birthdays.findIndex(b => b.id === this.currentId);
            if (index !== -1) {
                this.birthdays[index] = {
                    ...this.birthdays[index],
                    name,
                    day,
                    month,
                    note,
                    reminder,
                    reminderDays,
                    color
                };
            }
        } else {
            // Crear
            const newBirthday = {
                id: Date.now(),
                name,
                day,
                month,
                note,
                reminder,
                reminderDays,
                color,
                createdAt: new Date().toISOString()
            };
            this.birthdays.push(newBirthday);
        }
        
        this.guardarDatos();
        this.cerrarModal();
        this.renderizarLista();
        this.actualizarEstadisticas();
    }
    
    eliminarCumpleaños() {
        if (!this.currentId) return;
        this.birthdays = this.birthdays.filter(b => b.id !== this.currentId);
        this.guardarDatos();
        this.cerrarModal();
        this.renderizarLista();
        this.actualizarEstadisticas();
    }
    
    renderizarLista() {
        let filtered = [...this.birthdays];
        
        // Filtro por búsqueda
        if (this.searchTerm) {
            filtered = filtered.filter(b => 
                b.name.toLowerCase().includes(this.searchTerm) ||
                (b.note && b.note.toLowerCase().includes(this.searchTerm))
            );
        }
        
        // Filtro por mes
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(b => b.month === parseInt(this.currentFilter));
        }
        
        // Ordenar: primero los que están más cerca (próximos)
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();
        
        filtered.sort((a, b) => {
            const aDays = this.diasHastaCumpleaños(a.day, a.month, currentDay, currentMonth);
            const bDays = this.diasHastaCumpleaños(b.day, b.month, currentDay, currentMonth);
            return aDays - bDays;
        });
        
        if (filtered.length === 0) {
            this.birthdaysList.innerHTML = `
                <div class="empty-birthdays">
                    <i class="fas fa-birthday-cake"></i>
                    <h3>No hay cumpleaños</h3>
                    <p>${this.searchTerm ? 'No se encontraron resultados' : 'Agrega tus primeros cumpleaños con el botón "Agregar Cumpleaños"'}</p>
                </div>
            `;
            return;
        }
        
        this.birthdaysList.innerHTML = filtered.map(birthday => {
            const date = new Date();
            date.setMonth(birthday.month);
            date.setDate(birthday.day);
            
            const monthName = this.months[birthday.month];
            const monthEmoji = this.monthEmojis[birthday.month];
            const daysUntil = this.diasHastaCumpleaños(birthday.day, birthday.month, currentDay, currentMonth);
            
            let statusClass = '';
            let statusText = '';
            
            if (daysUntil === 0) {
                statusClass = 'today';
                statusText = '🎉 ¡Hoy es su cumpleaños!';
            } else if (daysUntil <= 7) {
                statusClass = 'soon';
                statusText = `📅 En ${daysUntil} días`;
            } else {
                statusClass = 'passed';
                statusText = `📅 En ${daysUntil} días`;
            }
            
            // Iniciales para el avatar
            const initials = birthday.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
            
            return `
                <div class="birthday-item" data-id="${birthday.id}" style="border-left-color: ${birthday.color || '#FF6584'};">
                    <div class="avatar" style="background: ${birthday.color || '#FF6584'}">
                        ${initials}
                    </div>
                    <div class="birthday-info">
                        <div class="birthday-name">${birthday.name}</div>
                        <div class="birthday-date">
                            ${monthEmoji} ${date.getDate()} de ${monthName}
                            <span class="date-badge ${statusClass}">${statusText}</span>
                            ${birthday.reminder ? '<span style="font-size:0.6rem; color: var(--warning);">🔔</span>' : ''}
                        </div>
                        ${birthday.note ? `<div class="birthday-note">📝 ${birthday.note}</div>` : ''}
                    </div>
                    <div class="birthday-actions">
                        <button class="edit-btn" data-id="${birthday.id}">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="delete-btn" data-id="${birthday.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Event listeners para editar y eliminar
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                this.abrirModal(id);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                if (confirm('¿Eliminar este cumpleaños?')) {
                    this.birthdays = this.birthdays.filter(b => b.id !== id);
                    this.guardarDatos();
                    this.renderizarLista();
                    this.actualizarEstadisticas();
                }
            });
        });
        
        // Click en la tarjeta para editar
        document.querySelectorAll('.birthday-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.abrirModal(id);
            });
        });
    }
    
    diasHastaCumpleaños(day, month, currentDay, currentMonth) {
        // Calcular días hasta el próximo cumpleaños
        let days = 0;
        
        if (month > currentMonth || (month === currentMonth && day >= currentDay)) {
            // Este año
            const date = new Date();
            date.setMonth(month);
            date.setDate(day);
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            days = Math.ceil((date - currentDate) / (1000 * 60 * 60 * 24));
        } else {
            // El próximo año
            const date = new Date();
            date.setFullYear(date.getFullYear() + 1);
            date.setMonth(month);
            date.setDate(day);
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            days = Math.ceil((date - currentDate) / (1000 * 60 * 60 * 24));
        }
        
        return days;
    }
    
    actualizarEstadisticas() {
        const total = this.birthdays.length;
        this.totalBirthdaysSpan.textContent = total;
        
        // Cumpleaños este mes
        const today = new Date();
        const currentMonth = today.getMonth();
        const thisMonth = this.birthdays.filter(b => b.month === currentMonth).length;
        this.birthdaysThisMonthSpan.textContent = thisMonth;
        
        // Próximos cumpleaños (en los próximos 7 días)
        const currentDay = today.getDate();
        let upcoming = 0;
        this.birthdays.forEach(b => {
            const days = this.diasHastaCumpleaños(b.day, b.month, currentDay, currentMonth);
            if (days <= 7 && days > 0) upcoming++;
        });
        this.upcomingBirthdaysSpan.textContent = upcoming;
    }
    
    verificarCumpleaños() {
        // Verificar si hoy es cumpleaños de alguien
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();
        
        const todaysBirthdays = this.birthdays.filter(b => 
            b.day === currentDay && b.month === currentMonth
        );
        
        if (todaysBirthdays.length > 0) {
            const names = todaysBirthdays.map(b => b.name).join(', ');
            // Mostrar notificación
            this.mostrarNotificacion(`🎉 ¡Hoy es el cumpleaños de ${names}!`, 'success');
            
            // Si tiene recordatorio, mostrar notificación especial
            todaysBirthdays.forEach(b => {
                if (b.reminder) {
                    setTimeout(() => {
                        this.mostrarNotificacion(`🔔 ¡No olvides felicitar a ${b.name}!`, 'info');
                    }, 3000);
                }
            });
        }
        
        // Verificar cumpleaños próximos (para recordatorios)
        const upcomingBirthdays = this.birthdays.filter(b => {
            if (!b.reminder) return false;
            const days = this.diasHastaCumpleaños(b.day, b.month, currentDay, currentMonth);
            return days > 0 && days <= b.reminderDays;
        });
        
        upcomingBirthdays.forEach(b => {
            const days = this.diasHastaCumpleaños(b.day, b.month, currentDay, currentMonth);
            // Usar setTimeout para mostrar notificaciones escalonadas
            setTimeout(() => {
                this.mostrarNotificacion(`🔔 Recordatorio: El cumpleaños de ${b.name} es en ${days} días`, 'info');
            }, 1000 + b.id % 5000);
        });
    }
    
    mostrarNotificacion(mensaje, tipo) {
        const notification = document.createElement('div');
        notification.className = `notification ${tipo}`;
        notification.textContent = mensaje;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 14px 24px;
            border-radius: 12px;
            background: ${tipo === 'success' ? '#28A745' : tipo === 'error' ? '#DC3545' : '#6C63FF'};
            color: white;
            z-index: 2000;
            animation: slideInRight 0.4s ease;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            font-weight: 500;
            max-width: 400px;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.4s ease';
            setTimeout(() => notification.remove(), 400);
        }, 5000);
    }
}

// ========== ESTILOS PARA NOTIFICACIONES ==========
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(60px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(60px);
        }
    }
`;
document.head.appendChild(style);

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', () => {
    new BirthdayAgenda();
});
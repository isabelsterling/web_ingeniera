/**
 * AGENDA / CALENDARIO
 * Funcionalidades: Vistas mensual/semanal/diaria, eventos CRUD, drag & drop, localStorage
 */

class CalendarApp {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.currentView = 'month';
        this.events = [];
        this.selectedEventId = null;
        this.draggedEvent = null;
        
        // Elementos DOM
        this.currentDateDisplay = document.getElementById('currentDate');
        this.daysGrid = document.getElementById('daysGrid');
        this.weekGrid = document.getElementById('weekGrid');
        this.daySchedule = document.getElementById('daySchedule');
        this.eventsList = document.getElementById('eventsList');
        
        // Botones
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.todayBtn = document.getElementById('todayBtn');
        this.viewBtns = document.querySelectorAll('.view-btn');
        this.addEventBtn = document.getElementById('addEventBtn');
        
        // Modal
        this.modal = document.getElementById('eventModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.eventTitle = document.getElementById('eventTitle');
        this.eventDate = document.getElementById('eventDate');
        this.eventStart = document.getElementById('eventStart');
        this.eventEnd = document.getElementById('eventEnd');
        this.eventDescription = document.getElementById('eventDescription');
        this.eventReminder = document.getElementById('eventReminder');
        this.colorBtns = document.querySelectorAll('.color-btn');
        this.saveBtn = document.getElementById('saveEventBtn');
        this.deleteBtn = document.getElementById('deleteEventBtn');
        this.selectedColor = '#6C63FF';
        
        // Recordatorio
        this.reminderNotification = document.getElementById('reminderNotification');
        this.reminderTitle = document.getElementById('reminderTitle');
        this.reminderText = document.getElementById('reminderText');
        
        this.init();
    }
    
    init() {
        this.cargarEventos();
        this.eventListeners();
        this.renderizar();
        this.verificarRecordatorios();
    }
    
    // ========== EVENT LISTENERS ==========
    eventListeners() {
        // Navegación
        this.prevBtn.addEventListener('click', () => {
            this.navegar(-1);
        });
        this.nextBtn.addEventListener('click', () => {
            this.navegar(1);
        });
        this.todayBtn.addEventListener('click', () => {
            this.currentDate = new Date();
            this.selectedDate = new Date();
            this.renderizar();
        });
        
        // Vistas
        this.viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentView = btn.dataset.view;
                this.renderizar();
            });
        });
        
        // Eventos
        this.addEventBtn.addEventListener('click', () => this.abrirModal());
        this.saveBtn.addEventListener('click', () => this.guardarEvento());
        this.deleteBtn.addEventListener('click', () => this.eliminarEvento());
        
        // Cerrar modal
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
        
        // Cerrar recordatorio
        document.querySelector('.reminder-close').addEventListener('click', () => {
            this.reminderNotification.style.display = 'none';
        });
    }
    
    // ========== NAVEGACIÓN ==========
    navegar(direction) {
        if (this.currentView === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        } else if (this.currentView === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
        } else {
            this.currentDate.setDate(this.currentDate.getDate() + direction);
        }
        this.renderizar();
    }
    
    // ========== RENDERIZAR ==========
    renderizar() {
        this.actualizarTitulo();
        
        document.getElementById('monthView').style.display = this.currentView === 'month' ? 'block' : 'none';
        document.getElementById('weekView').style.display = this.currentView === 'week' ? 'block' : 'none';
        document.getElementById('dayView').style.display = this.currentView === 'day' ? 'block' : 'none';
        
        if (this.currentView === 'month') this.renderizarMes();
        else if (this.currentView === 'week') this.renderizarSemana();
        else this.renderizarDia();
        
        this.renderizarListaEventos();
    }
    
    actualizarTitulo() {
        const options = { month: 'long', year: 'numeric' };
        let titulo = this.currentDate.toLocaleDateString('es-ES', options);
        titulo = titulo.charAt(0).toUpperCase() + titulo.slice(1);
        
        if (this.currentView === 'week') {
            const start = new Date(this.currentDate);
            start.setDate(start.getDate() - start.getDay() + 1);
            const end = new Date(start);
            end.setDate(end.getDate() + 6);
            titulo = `${start.getDate()} - ${end.getDate()} ${this.currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
        } else if (this.currentView === 'day') {
            titulo = this.currentDate.toLocaleDateString('es-ES', { 
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
            });
            titulo = titulo.charAt(0).toUpperCase() + titulo.slice(1);
        }
        
        this.currentDateDisplay.textContent = titulo;
    }
    
    // ========== VISTA MENSUAL ==========
    renderizarMes() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay() || 7; // 1 = Lunes, 7 = Domingo
        
        let html = '';
        const today = new Date();
        
        // Días del mes anterior
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDay - 1; i > 0; i--) {
            const day = prevMonthLastDay - i + 1;
            const date = new Date(year, month - 1, day);
            html += this.crearCeldaDia(date, true);
        }
        
        // Días del mes actual
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = date.toDateString() === this.selectedDate.toDateString();
            html += this.crearCeldaDia(date, false, isToday, isSelected);
        }
        
        // Días del mes siguiente
        const remainingDays = 42 - (startDay - 1 + daysInMonth);
        for (let day = 1; day <= remainingDays; day++) {
            const date = new Date(year, month + 1, day);
            html += this.crearCeldaDia(date, true);
        }
        
        this.daysGrid.innerHTML = html;
        
        // Agregar event listeners a las celdas
        document.querySelectorAll('.day-cell').forEach(cell => {
            cell.addEventListener('click', () => {
                const date = new Date(cell.dataset.date);
                this.selectedDate = date;
                this.renderizar();
            });
        });
    }
    
    crearCeldaDia(date, isOtherMonth, isToday = false, isSelected = false) {
        const dayEvents = this.obtenerEventosPorFecha(date);
        const hasEvents = dayEvents.length > 0;
        const maxDisplay = 3;
        const displayEvents = dayEvents.slice(0, maxDisplay);
        const hasMore = dayEvents.length > maxDisplay;
        
        let eventsHtml = '';
        if (hasEvents) {
            eventsHtml = displayEvents.map(event => `
                <div class="day-event-dot" style="background: ${event.color};"></div>
            `).join('');
            if (hasMore) {
                eventsHtml += `<div class="day-event-dot has-more">+${dayEvents.length - maxDisplay} más</div>`;
            }
        }
        
        return `
            <div class="day-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" 
                 data-date="${date.toISOString()}">
                <span class="day-number">${date.getDate()}</span>
                <div class="day-events">${eventsHtml}</div>
            </div>
        `;
    }
    
    // ========== VISTA SEMANAL ==========
    renderizarSemana() {
        const start = new Date(this.currentDate);
        start.setDate(start.getDate() - start.getDay() + 1);
        
        let html = '<div class="week-hour">Hora</div>';
        const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        
        // Encabezados de días
        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            const isToday = date.toDateString() === new Date().toDateString();
            html += `
                <div class="week-hour" style="${isToday ? 'color: var(--primary); font-weight: 700;' : ''}">
                    ${weekDays[i]}<br>${date.getDate()}
                </div>
            `;
        }
        
        // Horas (8:00 - 20:00)
        for (let hour = 8; hour <= 20; hour++) {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            html += `<div class="week-hour">${timeStr}</div>`;
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(start);
                date.setDate(date.getDate() + i);
                date.setHours(hour, 0, 0, 0);
                
                const dayEvents = this.obtenerEventosPorFecha(date);
                const eventsInHour = dayEvents.filter(e => {
                    const eventStart = new Date(`${date.toDateString()} ${e.start}`);
                    return eventStart.getHours() === hour;
                });
                
                html += `
                    <div class="week-cell" data-date="${date.toISOString()}" data-hour="${hour}">
                        ${eventsInHour.map(event => `
                            <div class="week-event" style="background: ${event.color}; color: white;">
                                ${event.title}
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }
        
        this.weekGrid.innerHTML = html;
        
        // Event listeners para celdas semanales
        document.querySelectorAll('.week-cell').forEach(cell => {
            cell.addEventListener('click', () => {
                const date = new Date(cell.dataset.date);
                this.selectedDate = date;
                this.currentView = 'day';
                this.viewBtns.forEach(b => b.classList.remove('active'));
                document.querySelector('[data-view="day"]').classList.add('active');
                this.renderizar();
            });
            
            // Drag & Drop para eventos
            cell.addEventListener('dragover', (e) => {
                e.preventDefault();
                cell.style.background = 'rgba(108, 99, 255, 0.2)';
            });
            
            cell.addEventListener('dragleave', () => {
                cell.style.background = '';
            });
            
            cell.addEventListener('drop', (e) => {
                e.preventDefault();
                cell.style.background = '';
                const eventId = parseInt(e.dataTransfer.getData('text/plain'));
                const date = new Date(cell.dataset.date);
                const hour = parseInt(cell.dataset.hour);
                this.moverEvento(eventId, date, hour);
            });
        });
    }
    
    // ========== VISTA DIARIA ==========
    renderizarDia() {
        const date = this.selectedDate;
        const dayEvents = this.obtenerEventosPorFecha(date);
        
        let html = '';
        for (let hour = 6; hour <= 22; hour++) {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            const eventsInHour = dayEvents.filter(e => {
                const eventStart = new Date(`${date.toDateString()} ${e.start}`);
                return eventStart.getHours() === hour;
            });
            
            html += `
                <div class="hour-label">${timeStr}</div>
                <div class="hour-slot" data-date="${date.toISOString()}" data-hour="${hour}">
                    ${eventsInHour.map(event => `
                        <div class="slot-event" style="background: ${event.color}; color: white; padding: 4px 8px; border-radius: 4px; margin: 2px 0;">
                            <strong>${event.start}</strong> - ${event.title}
                            ${event.description ? `<br><small>${event.description}</small>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        this.daySchedule.innerHTML = html;
        
        // Event listeners para slots diarios
        document.querySelectorAll('.hour-slot').forEach(slot => {
            slot.addEventListener('click', (e) => {
                if (e.target === slot || e.target.classList.contains('hour-slot')) {
                    const date = new Date(slot.dataset.date);
                    const hour = parseInt(slot.dataset.hour);
                    this.abrirModal(date, `${hour.toString().padStart(2, '0')}:00`);
                }
            });
            
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.style.background = 'rgba(108, 99, 255, 0.2)';
            });
            
            slot.addEventListener('dragleave', () => {
                slot.style.background = '';
            });
            
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.style.background = '';
                const eventId = parseInt(e.dataTransfer.getData('text/plain'));
                const date = new Date(slot.dataset.date);
                const hour = parseInt(slot.dataset.hour);
                this.moverEvento(eventId, date, hour);
            });
        });
    }
    
    // ========== LISTA DE EVENTOS ==========
    renderizarListaEventos() {
        const date = this.selectedDate;
        const dayEvents = this.obtenerEventosPorFecha(date);
        
        if (dayEvents.length === 0) {
            this.eventsList.innerHTML = `
                <div class="empty-events">
                    <i class="fas fa-calendar-plus"></i>
                    <p>No hay eventos para este día</p>
                    <span>Haz clic en "Nuevo evento" para agregar uno</span>
                </div>
            `;
            return;
        }
        
        // Ordenar eventos por hora
        dayEvents.sort((a, b) => a.start.localeCompare(b.start));
        
        this.eventsList.innerHTML = dayEvents.map(event => `
            <div class="event-item" draggable="true" data-id="${event.id}" style="border-left-color: ${event.color};">
                <div class="event-color" style="background: ${event.color};"></div>
                <div class="event-time">${event.start} - ${event.end}</div>
                <div class="event-title">${event.title}</div>
                ${event.description ? `<div class="event-desc" style="font-size: 0.7rem; color: var(--gray);">${event.description}</div>` : ''}
                <div class="event-actions">
                    <button class="edit-btn" data-id="${event.id}"><i class="fas fa-pencil-alt"></i></button>
                    <button class="delete-btn" data-id="${event.id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `).join('');
        
        // Event listeners para editar y eliminar
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                this.abrirModal(null, null, id);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                if (confirm('¿Estás seguro de eliminar este evento?')) {
                    this.eliminarEvento(id);
                }
            });
        });
        
        // Drag & Drop para eventos
        document.querySelectorAll('.event-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.id);
                item.style.opacity = '0.5';
            });
            
            item.addEventListener('dragend', () => {
                item.style.opacity = '1';
            });
        });
    }
    
    // ========== EVENTOS CRUD ==========
    obtenerEventosPorFecha(date) {
        const dateStr = date.toDateString();
        return this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === dateStr;
        });
    }
    
    abrirModal(date = null, hour = null, eventId = null) {
        if (date) this.selectedDate = date;
        
        if (eventId) {
            // Editar evento existente
            const event = this.events.find(e => e.id === eventId);
            if (!event) return;
            
            this.selectedEventId = eventId;
            this.modalTitle.textContent = 'Editar Evento';
            this.eventTitle.value = event.title;
            this.eventDate.value = event.date;
            this.eventStart.value = event.start;
            this.eventEnd.value = event.end;
            this.eventDescription.value = event.description || '';
            this.eventReminder.checked = event.reminder || false;
            this.selectedColor = event.color;
            
            this.colorBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.color === event.color);
            });
            
            this.deleteBtn.style.display = 'block';
        } else {
            // Nuevo evento
            this.selectedEventId = null;
            this.modalTitle.textContent = 'Nuevo Evento';
            this.eventTitle.value = '';
            this.eventDescription.value = '';
            this.eventReminder.checked = false;
            this.deleteBtn.style.display = 'none';
            
            // Fecha
            const dateStr = this.selectedDate.toISOString().split('T')[0];
            this.eventDate.value = dateStr;
            
            // Hora
            if (hour) {
                this.eventStart.value = hour;
                const endHour = parseInt(hour.split(':')[0]) + 1;
                this.eventEnd.value = `${endHour.toString().padStart(2, '0')}:00`;
            } else {
                const now = new Date();
                this.eventStart.value = `${now.getHours().toString().padStart(2, '0')}:00`;
                this.eventEnd.value = `${(now.getHours() + 1).toString().padStart(2, '0')}:00`;
            }
            
            this.colorBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.color === this.selectedColor);
            });
        }
        
        this.modal.classList.add('active');
    }
    
    cerrarModal() {
        this.modal.classList.remove('active');
        this.selectedEventId = null;
    }
    
    guardarEvento() {
        const title = this.eventTitle.value.trim();
        const date = this.eventDate.value;
        const start = this.eventStart.value;
        const end = this.eventEnd.value;
        const description = this.eventDescription.value.trim();
        const reminder = this.eventReminder.checked;
        const color = this.selectedColor;
        
        if (!title) {
            this.mostrarNotificacion('El título es obligatorio', 'error');
            return;
        }
        
        if (!date || !start || !end) {
            this.mostrarNotificacion('Fecha y hora son obligatorios', 'error');
            return;
        }
        
        if (start >= end) {
            this.mostrarNotificacion('La hora de inicio debe ser menor que la de fin', 'error');
            return;
        }
        
        if (this.selectedEventId) {
            // Actualizar evento existente
            const index = this.events.findIndex(e => e.id === this.selectedEventId);
            if (index !== -1) {
                this.events[index] = {
                    ...this.events[index],
                    title,
                    date,
                    start,
                    end,
                    description,
                    reminder,
                    color
                };
                this.mostrarNotificacion('Evento actualizado', 'success');
            }
        } else {
            // Crear nuevo evento
            const newEvent = {
                id: Date.now(),
                title,
                date,
                start,
                end,
                description,
                reminder,
                color
            };
            this.events.push(newEvent);
            
            if (reminder) {
                this.programarRecordatorio(newEvent);
            }
            
            this.mostrarNotificacion('Evento creado', 'success');
        }
        
        this.guardarEventos();
        this.cerrarModal();
        this.renderizar();
    }
    
    eliminarEvento(eventId = null) {
        const id = eventId || this.selectedEventId;
        if (!id) return;
        
        this.events = this.events.filter(e => e.id !== id);
        this.guardarEventos();
        this.cerrarModal();
        this.renderizar();
        this.mostrarNotificacion('Evento eliminado', 'success');
    }
    
    moverEvento(eventId, newDate, newHour) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;
        
        const dateStr = newDate.toISOString().split('T')[0];
        const startHour = newHour.toString().padStart(2, '0');
        const endHour = (newHour + 1).toString().padStart(2, '0');
        
        event.date = dateStr;
        event.start = `${startHour}:00`;
        event.end = `${endHour}:00`;
        
        this.guardarEventos();
        this.renderizar();
        this.mostrarNotificacion('Evento movido', 'success');
    }
    
    // ========== PERSISTENCIA ==========
    guardarEventos() {
        localStorage.setItem('calendar_events', JSON.stringify(this.events));
    }
    
    cargarEventos() {
        const saved = localStorage.getItem('calendar_events');
        if (saved) {
            try {
                this.events = JSON.parse(saved);
            } catch {
                this.events = [];
            }
        }
    }
    
    // ========== RECORDATORIOS ==========
    programarRecordatorio(event) {
        const eventDate = new Date(`${event.date}T${event.start}`);
        const now = new Date();
        const timeDiff = eventDate.getTime() - now.getTime();
        
        // Si el evento es en el futuro (más de 1 minuto)
        if (timeDiff > 60000) {
            setTimeout(() => {
                this.mostrarRecordatorio(event);
            }, timeDiff - 60000); // 1 minuto antes
        }
    }
    
    verificarRecordatorios() {
        const now = new Date();
        const nowStr = now.toISOString().split('T')[0];
        const nowTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        this.events.forEach(event => {
            if (event.reminder && event.date === nowStr) {
                const eventTime = event.start;
                // Si el evento es dentro de los próximos 5 minutos
                const eventMinutes = this.tiempoAMinutos(eventTime);
                const nowMinutes = this.tiempoAMinutos(nowTime);
                const diff = eventMinutes - nowMinutes;
                
                if (diff > 0 && diff <= 5) {
                    this.mostrarRecordatorio(event);
                }
            }
        });
        
        // Revisar cada minuto
        setInterval(() => {
            this.verificarRecordatorios();
        }, 60000);
    }
    
    tiempoAMinutos(time) {
        const parts = time.split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    
    mostrarRecordatorio(event) {
        this.reminderTitle.textContent = '🔔 Recordatorio';
        this.reminderText.textContent = `${event.title} - ${event.start}`;
        this.reminderNotification.style.display = 'block';
        
        // Cerrar automáticamente después de 10 segundos
        setTimeout(() => {
            this.reminderNotification.style.display = 'none';
        }, 10000);
        
        // Sonido de notificación (si está disponible)
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRlwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoAAACBhYqFhYWFiYmGiYmJhoaGiYaGhoeIiImJh4eHhoeHh4eIiIeHh4eHhoaGh4eHhoWFhYaGhYWFhoWFhYWFhYaFhQ==');
            audio.play().catch(() => {});
        } catch (e) {
            // Silenciar error si no se puede reproducir sonido
        }
    }
    
    // ========== NOTIFICACIONES ==========
    mostrarNotificacion(mensaje, tipo) {
        const notification = document.createElement('div');
        notification.className = `notification ${tipo}`;
        notification.textContent = mensaje;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 12px;
            background: ${tipo === 'success' ? '#28A745' : tipo === 'error' ? '#DC3545' : '#6C63FF'};
            color: white;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', () => {
    new CalendarApp();
});

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
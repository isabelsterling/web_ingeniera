/**
 * PLANIFICADOR SEMANAL
 * Organiza tareas por día, drag & drop, persistencia
 */

class WeeklyPlanner {
    constructor() {
        this.tasks = {};
        this.currentWeekStart = this.getWeekStart(new Date());
        this.draggedTask = null;
        this.draggedFromDay = null;
        
        // Días de la semana
        this.dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        this.dayShort = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        
        // Elementos DOM
        this.weekGrid = document.getElementById('weekGrid');
        this.weekRange = document.getElementById('weekRange');
        this.totalTasksSpan = document.getElementById('totalTasks');
        this.completedTasksSpan = document.getElementById('completedTasks');
        
        // Modal
        this.modal = document.getElementById('taskModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.taskTitle = document.getElementById('taskTitle');
        this.taskDescription = document.getElementById('taskDescription');
        this.taskTime = document.getElementById('taskTime');
        this.taskPriority = document.getElementById('taskPriority');
        this.taskCompleted = document.getElementById('taskCompleted');
        this.colorBtns = document.querySelectorAll('.color-btn');
        this.saveBtn = document.getElementById('saveTaskBtn');
        this.deleteBtn = document.getElementById('deleteTaskBtn');
        this.selectedColor = '#6C63FF';
        this.currentDay = null;
        this.currentTaskId = null;
        
        // Inicializar
        this.init();
    }
    
    getWeekStart(date) {
        const day = date.getDay() || 7;
        const diff = day - 1;
        const start = new Date(date);
        start.setDate(date.getDate() - diff);
        start.setHours(0, 0, 0, 0);
        return start;
    }
    
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    getDayKey(date) {
        return this.formatDate(date);
    }
    
    init() {
        this.cargarTareas();
        this.eventListeners();
        this.renderizarSemana();
        this.actualizarEstadisticas();
    }
    
    cargarTareas() {
        const saved = localStorage.getItem('weeklyPlanner_tasks');
        if (saved) {
            try {
                this.tasks = JSON.parse(saved);
            } catch {
                this.tasks = {};
            }
        }
        
        // Si no hay tareas, agregar algunas de ejemplo
        if (Object.keys(this.tasks).length === 0) {
            const today = new Date();
            const weekStart = this.getWeekStart(today);
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(weekStart);
                date.setDate(weekStart.getDate() + i);
                const key = this.getDayKey(date);
                this.tasks[key] = [];
            }
            
            // Agregar tareas de ejemplo
            const todayKey = this.getDayKey(today);
            if (this.tasks[todayKey]) {
                this.tasks[todayKey].push({
                    id: Date.now() + 1,
                    title: 'Revisar correos',
                    description: 'Responder correos importantes del día',
                    time: '09:00',
                    priority: 'media',
                    color: '#6C63FF',
                    completed: false
                });
                this.tasks[todayKey].push({
                    id: Date.now() + 2,
                    title: 'Reunión con equipo',
                    description: 'Sprint planning semanal',
                    time: '11:00',
                    priority: 'alta',
                    color: '#FF6584',
                    completed: false
                });
            }
            
            this.guardarTareas();
        }
    }
    
    guardarTareas() {
        localStorage.setItem('weeklyPlanner_tasks', JSON.stringify(this.tasks));
    }
    
    eventListeners() {
        // Navegación
        document.getElementById('prevWeekBtn').addEventListener('click', () => {
            this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
            this.renderizarSemana();
            this.actualizarEstadisticas();
        });
        
        document.getElementById('nextWeekBtn').addEventListener('click', () => {
            this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
            this.renderizarSemana();
            this.actualizarEstadisticas();
        });
        
        document.getElementById('todayBtn').addEventListener('click', () => {
            this.currentWeekStart = this.getWeekStart(new Date());
            this.renderizarSemana();
            this.actualizarEstadisticas();
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
        
        // Guardar tarea
        this.saveBtn.addEventListener('click', () => this.guardarTarea());
        
        // Eliminar tarea
        this.deleteBtn.addEventListener('click', () => {
            if (confirm('¿Eliminar esta tarea?')) {
                this.eliminarTarea();
            }
        });
        
        // Enter para guardar
        this.taskTitle.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.guardarTarea();
        });
    }
    
    renderizarSemana() {
        const weekStart = this.currentWeekStart;
        const today = new Date();
        const todayKey = this.getDayKey(today);
        
        // Actualizar título
        const endDate = new Date(weekStart);
        endDate.setDate(weekStart.getDate() + 6);
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        this.weekRange.textContent = `Semana del ${weekStart.toLocaleDateString('es-ES', options)} al ${endDate.toLocaleDateString('es-ES', options)}`;
        
        let html = '';
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const key = this.getDayKey(date);
            const isToday = key === todayKey;
            const dayName = this.dayNames[i];
            const dayNumber = date.getDate();
            
            // Asegurar que existe el array para este día
            if (!this.tasks[key]) {
                this.tasks[key] = [];
                this.guardarTareas();
            }
            
            const dayTasks = this.tasks[key] || [];
            const completed = dayTasks.filter(t => t.completed).length;
            const total = dayTasks.length;
            
            html += `
                <div class="day-column ${isToday ? 'today' : ''}" data-day="${key}" data-date="${date.toISOString()}">
                    <div class="day-header">
                        <span class="day-name">${dayName}</span>
                        <span class="day-number">${dayNumber}</span>
                    </div>
                    <div class="day-tasks" data-day="${key}">
                        ${this.renderizarTareas(dayTasks, key)}
                        <button class="add-task-btn" data-day="${key}">
                            <i class="fas fa-plus"></i> Agregar tarea
                        </button>
                    </div>
                    <div style="font-size:0.6rem; color:var(--gray); margin-top:8px; text-align:center;">
                        ${completed}/${total} completadas
                    </div>
                </div>
            `;
        }
        
        this.weekGrid.innerHTML = html;
        
        // Event listeners para agregar tarea
        document.querySelectorAll('.add-task-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.abrirModal(btn.dataset.day);
            });
        });
        
        // Event listeners para tareas (editar y check)
        document.querySelectorAll('.task-item').forEach(item => {
            // Editar al hacer clic
            item.addEventListener('click', (e) => {
                if (e.target.closest('.task-check')) return;
                const day = item.dataset.day;
                const taskId = parseInt(item.dataset.id);
                this.abrirModal(day, taskId);
            });
            
            // Check de completado
            const checkBtn = item.querySelector('.task-check');
            if (checkBtn) {
                checkBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const day = item.dataset.day;
                    const taskId = parseInt(item.dataset.id);
                    this.toggleTaskCompleted(day, taskId);
                });
            }
            
            // Drag & Drop
            item.setAttribute('draggable', 'true');
            item.addEventListener('dragstart', (e) => {
                this.draggedTask = parseInt(item.dataset.id);
                this.draggedFromDay = item.dataset.day;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', `${item.dataset.day}|${item.dataset.id}`);
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });
        
        // Event listeners para drop en columnas
        document.querySelectorAll('.day-column').forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.classList.add('drag-over');
            });
            
            column.addEventListener('dragleave', () => {
                column.classList.remove('drag-over');
            });
            
            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');
                
                const targetDay = column.dataset.day;
                if (this.draggedTask && this.draggedFromDay !== targetDay) {
                    this.moverTarea(this.draggedFromDay, targetDay, this.draggedTask);
                }
                this.draggedTask = null;
                this.draggedFromDay = null;
            });
        });
        
        // Event listeners para drop en day-tasks
        document.querySelectorAll('.day-tasks').forEach(container => {
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                container.closest('.day-column').classList.add('drag-over');
            });
            
            container.addEventListener('dragleave', () => {
                container.closest('.day-column').classList.remove('drag-over');
            });
            
            container.addEventListener('drop', (e) => {
                e.preventDefault();
                container.closest('.day-column').classList.remove('drag-over');
                
                const targetDay = container.dataset.day;
                if (this.draggedTask && this.draggedFromDay !== targetDay) {
                    this.moverTarea(this.draggedFromDay, targetDay, this.draggedTask);
                }
                this.draggedTask = null;
                this.draggedFromDay = null;
            });
        });
    }
    
    renderizarTareas(tasks, dayKey) {
        if (!tasks || tasks.length === 0) {
            return `
                <div class="empty-tasks" data-day="${dayKey}">
                    <i class="fas fa-plus-circle"></i>
                    <p>Sin tareas</p>
                </div>
            `;
        }
        
        // Ordenar por hora
        const sorted = [...tasks].sort((a, b) => {
            if (a.time && b.time) return a.time.localeCompare(b.time);
            if (a.time) return -1;
            if (b.time) return 1;
            return 0;
        });
        
        return sorted.map(task => {
            const priorityLabel = {
                alta: '🔴 Alta',
                media: '🟡 Media',
                baja: '🟢 Baja'
            };
            
            return `
                <div class="task-item ${task.completed ? 'completed' : ''}" 
                     data-day="${dayKey}" data-id="${task.id}" 
                     style="border-left-color: ${task.color || '#6C63FF'}">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        ${task.time ? `<span class="task-time"><i class="far fa-clock"></i> ${task.time}</span>` : ''}
                        <span class="task-priority priority-${task.priority}">${priorityLabel[task.priority] || task.priority}</span>
                    </div>
                    ${task.description ? `<div style="font-size:0.65rem; color:var(--gray); margin-top:2px;">${task.description}</div>` : ''}
                    <button class="task-check ${task.completed ? 'done' : ''}">
                        <i class="fas ${task.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                    </button>
                </div>
            `;
        }).join('');
    }
    
    abrirModal(day, taskId = null) {
        this.currentDay = day;
        this.currentTaskId = taskId;
        
        if (taskId) {
            // Editar tarea existente
            const tasks = this.tasks[day] || [];
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;
            
            this.modalTitle.textContent = 'Editar Tarea';
            this.taskTitle.value = task.title;
            this.taskDescription.value = task.description || '';
            this.taskTime.value = task.time || '09:00';
            this.taskPriority.value = task.priority || 'media';
            this.taskCompleted.checked = task.completed || false;
            this.selectedColor = task.color || '#6C63FF';
            
            this.colorBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.color === this.selectedColor);
            });
            
            this.deleteBtn.style.display = 'block';
        } else {
            // Nueva tarea
            this.modalTitle.textContent = 'Nueva Tarea';
            this.taskTitle.value = '';
            this.taskDescription.value = '';
            this.taskTime.value = '09:00';
            this.taskPriority.value = 'media';
            this.taskCompleted.checked = false;
            this.selectedColor = '#6C63FF';
            
            this.colorBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.color === this.selectedColor);
            });
            
            this.deleteBtn.style.display = 'none';
        }
        
        this.modal.classList.add('active');
        setTimeout(() => this.taskTitle.focus(), 100);
    }
    
    cerrarModal() {
        this.modal.classList.remove('active');
        this.currentDay = null;
        this.currentTaskId = null;
    }
    
    guardarTarea() {
        const title = this.taskTitle.value.trim();
        const description = this.taskDescription.value.trim();
        const time = this.taskTime.value;
        const priority = this.taskPriority.value;
        const completed = this.taskCompleted.checked;
        const color = this.selectedColor;
        
        if (!title) {
            this.taskTitle.style.borderColor = '#FF6584';
            this.taskTitle.placeholder = '⚠️ El título es obligatorio';
            setTimeout(() => {
                this.taskTitle.style.borderColor = '';
                this.taskTitle.placeholder = 'Ej: Reunión con equipo';
            }, 2000);
            return;
        }
        
        if (!this.currentDay) return;
        
        if (!this.tasks[this.currentDay]) {
            this.tasks[this.currentDay] = [];
        }
        
        if (this.currentTaskId) {
            // Actualizar tarea existente
            const index = this.tasks[this.currentDay].findIndex(t => t.id === this.currentTaskId);
            if (index !== -1) {
                this.tasks[this.currentDay][index] = {
                    ...this.tasks[this.currentDay][index],
                    title,
                    description,
                    time,
                    priority,
                    completed,
                    color
                };
            }
        } else {
            // Crear nueva tarea
            const newTask = {
                id: Date.now(),
                title,
                description,
                time,
                priority,
                completed,
                color
            };
            this.tasks[this.currentDay].push(newTask);
        }
        
        this.guardarTareas();
        this.cerrarModal();
        this.renderizarSemana();
        this.actualizarEstadisticas();
    }
    
    eliminarTarea() {
        if (!this.currentDay || !this.currentTaskId) return;
        
        const tasks = this.tasks[this.currentDay] || [];
        this.tasks[this.currentDay] = tasks.filter(t => t.id !== this.currentTaskId);
        
        this.guardarTareas();
        this.cerrarModal();
        this.renderizarSemana();
        this.actualizarEstadisticas();
    }
    
    toggleTaskCompleted(day, taskId) {
        const tasks = this.tasks[day] || [];
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.guardarTareas();
            this.renderizarSemana();
            this.actualizarEstadisticas();
        }
    }
    
    moverTarea(fromDay, toDay, taskId) {
        // Encontrar y eliminar tarea del día origen
        const fromTasks = this.tasks[fromDay] || [];
        const taskIndex = fromTasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;
        
        const task = fromTasks[taskIndex];
        fromTasks.splice(taskIndex, 1);
        this.tasks[fromDay] = fromTasks;
        
        // Agregar al día destino
        if (!this.tasks[toDay]) {
            this.tasks[toDay] = [];
        }
        this.tasks[toDay].push(task);
        
        this.guardarTareas();
        this.renderizarSemana();
        this.actualizarEstadisticas();
    }
    
    actualizarEstadisticas() {
        let total = 0;
        let completed = 0;
        
        for (const day in this.tasks) {
            const tasks = this.tasks[day] || [];
            total += tasks.length;
            completed += tasks.filter(t => t.completed).length;
        }
        
        this.totalTasksSpan.textContent = total;
        this.completedTasksSpan.textContent = completed;
    }
}

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', () => {
    new WeeklyPlanner();
});
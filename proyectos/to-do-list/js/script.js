/**
 * LISTA DE TAREAS COMPLETA
 * Funcionalidades: CRUD, localStorage, filtros, búsqueda, estadísticas, prioridades, categorías
 */

// Clase Tarea
class Tarea {
    constructor(id, titulo, prioridad, categoria, completada = false, fechaCreacion = null) {
        this.id = id;
        this.titulo = titulo;
        this.prioridad = prioridad; // 'alta', 'media', 'baja'
        this.categoria = categoria; // 'personal', 'trabajo', 'estudio', 'hogar'
        this.completada = completada;
        this.fechaCreacion = fechaCreacion || new Date().toISOString();
    }
}

// Clase principal de la aplicación
class TodoApp {
    constructor() {
        this.tareas = [];
        this.filtroActual = 'all'; // 'all', 'pending', 'completed'
        this.busquedaActual = '';
        
        // Elementos del DOM
        this.taskInput = document.getElementById('taskInput');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.categorySelect = document.getElementById('categorySelect');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.tasksList = document.getElementById('tasksList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.searchInput = document.getElementById('searchInput');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.deleteAllBtn = document.getElementById('deleteAllBtn');
        this.totalTasksSpan = document.getElementById('totalTasks');
        this.completedTasksSpan = document.getElementById('completedTasks');
        this.pendingTasksSpan = document.getElementById('pendingTasks');
        this.progressFill = document.getElementById('progressFill');
        this.progressPercent = document.getElementById('progressPercent');
        
        // Modal de edición
        this.editModal = null;
        this.editInput = null;
        this.currentEditId = null;
        
        this.init();
    }
    
    init() {
        this.cargarTareas();
        this.renderizarTareas();
        this.actualizarEstadisticas();
        this.eventListeners();
        this.crearModal();
    }
    
    // Cargar tareas desde localStorage
    cargarTareas() {
        const tareasGuardadas = localStorage.getItem('todoApp_tareas');
        if (tareasGuardadas) {
            const tareasRaw = JSON.parse(tareasGuardadas);
            this.tareas = tareasRaw.map(t => new Tarea(
                t.id, t.titulo, t.prioridad, t.categoria, t.completada, t.fechaCreacion
            ));
        } else {
            // Tareas de ejemplo
            this.tareas = [
                new Tarea(1, 'Aprender JavaScript avanzado', 'alta', 'estudio', false),
                new Tarea(2, 'Crear portafolio web', 'alta', 'trabajo', false),
                new Tarea(3, 'Hacer ejercicio', 'media', 'personal', true),
                new Tarea(4, 'Limpiar la casa', 'baja', 'hogar', false),
            ];
            this.guardarTareas();
        }
    }
    
    // Guardar tareas en localStorage
    guardarTareas() {
        localStorage.setItem('todoApp_tareas', JSON.stringify(this.tareas));
    }
    
    // Agregar nueva tarea
    agregarTarea() {
        const titulo = this.taskInput.value.trim();
        if (!titulo) {
            this.mostrarNotificacion('Por favor, escribe una tarea', 'error');
            return;
        }
        
        const prioridad = this.prioritySelect.value;
        const categoria = this.categorySelect.value;
        const newId = Date.now();
        
        const nuevaTarea = new Tarea(newId, titulo, prioridad, categoria, false);
        this.tareas.unshift(nuevaTarea);
        this.guardarTareas();
        
        this.taskInput.value = '';
        this.taskInput.focus();
        
        this.renderizarTareas();
        this.actualizarEstadisticas();
        this.mostrarNotificacion('Tarea agregada correctamente', 'success');
    }
    
    // Eliminar tarea
    eliminarTarea(id) {
        if (confirm('¿Estás seguro de eliminar esta tarea?')) {
            this.tareas = this.tareas.filter(t => t.id !== id);
            this.guardarTareas();
            this.renderizarTareas();
            this.actualizarEstadisticas();
            this.mostrarNotificacion('Tarea eliminada', 'success');
        }
    }
    
    // Alternar estado completada
    toggleCompletar(id) {
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            tarea.completada = !tarea.completada;
            this.guardarTareas();
            this.renderizarTareas();
            this.actualizarEstadisticas();
            
            const mensaje = tarea.completada ? '¡Tarea completada! 🎉' : 'Tarea marcada como pendiente';
            this.mostrarNotificacion(mensaje, 'info');
        }
    }
    
    // Editar tarea
    editarTarea(id) {
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            this.currentEditId = id;
            this.editInput.value = tarea.titulo;
            this.editModal.classList.add('active');
            this.editInput.focus();
        }
    }
    
    // Guardar edición
    guardarEdicion() {
        const nuevoTitulo = this.editInput.value.trim();
        if (!nuevoTitulo) {
            this.mostrarNotificacion('El título no puede estar vacío', 'error');
            return;
        }
        
        const tarea = this.tareas.find(t => t.id === this.currentEditId);
        if (tarea) {
            tarea.titulo = nuevoTitulo;
            this.guardarTareas();
            this.renderizarTareas();
            this.mostrarNotificacion('Tarea actualizada', 'success');
        }
        
        this.cerrarModal();
    }
    
    // Cerrar modal
    cerrarModal() {
        this.editModal.classList.remove('active');
        this.currentEditId = null;
        this.editInput.value = '';
    }
    
    // Limpiar tareas completadas
    limpiarCompletadas() {
        const completadas = this.tareas.filter(t => t.completada).length;
        if (completadas === 0) {
            this.mostrarNotificacion('No hay tareas completadas', 'info');
            return;
        }
        
        if (confirm(`¿Eliminar las ${completadas} tareas completadas?`)) {
            this.tareas = this.tareas.filter(t => !t.completada);
            this.guardarTareas();
            this.renderizarTareas();
            this.actualizarEstadisticas();
            this.mostrarNotificacion('Tareas completadas eliminadas', 'success');
        }
    }
    
    // Eliminar todas las tareas
    eliminarTodas() {
        if (this.tareas.length === 0) {
            this.mostrarNotificacion('No hay tareas para eliminar', 'info');
            return;
        }
        
        if (confirm(`¿Eliminar todas las ${this.tareas.length} tareas? Esta acción no se puede deshacer.`)) {
            this.tareas = [];
            this.guardarTareas();
            this.renderizarTareas();
            this.actualizarEstadisticas();
            this.mostrarNotificacion('Todas las tareas fueron eliminadas', 'success');
        }
    }
    
    // Filtrar tareas según criterios
    filtrarTareas() {
        let filtradas = [...this.tareas];
        
        if (this.filtroActual === 'pending') {
            filtradas = filtradas.filter(t => !t.completada);
        } else if (this.filtroActual === 'completed') {
            filtradas = filtradas.filter(t => t.completada);
        }
        
        if (this.busquedaActual) {
            const busquedaLower = this.busquedaActual.toLowerCase();
            filtradas = filtradas.filter(t => 
                t.titulo.toLowerCase().includes(busquedaLower)
            );
        }
        
        return filtradas;
    }
    
    // Renderizar tareas en el DOM
    renderizarTareas() {
        const tareasFiltradas = this.filtrarTareas();
        
        if (tareasFiltradas.length === 0) {
            this.tasksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No hay tareas</h3>
                    <p>${this.busquedaActual ? 'No se encontraron resultados para tu búsqueda' : 'Agrega tu primera tarea usando el formulario de arriba'}</p>
                </div>
            `;
            return;
        }
        
        const ordenadas = [...tareasFiltradas].sort((a, b) => {
            if (a.completada !== b.completada) return a.completada ? 1 : -1;
            const prioridadOrder = { 'alta': 0, 'media': 1, 'baja': 2 };
            if (prioridadOrder[a.prioridad] !== prioridadOrder[b.prioridad]) {
                return prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad];
            }
            return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
        });
        
        this.tasksList.innerHTML = ordenadas.map(tarea => this.crearTarjetaTarea(tarea)).join('');
        this.agregarEventosDinamicos();
    }
    
    // Crear HTML de una tarea
    crearTarjetaTarea(tarea) {
        const prioridadTexto = {
            'alta': '🔴 Alta',
            'media': '🟡 Media',
            'baja': '🟢 Baja'
        };
        
        const categoriaIcono = {
            'personal': '👤',
            'trabajo': '💼',
            'estudio': '📚',
            'hogar': '🏠'
        };
        
        const categoriaTexto = {
            'personal': 'Personal',
            'trabajo': 'Trabajo',
            'estudio': 'Estudio',
            'hogar': 'Hogar'
        };
        
        const fecha = new Date(tarea.fechaCreacion);
        const fechaFormateada = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
        
        return `
            <div class="task-item ${tarea.completada ? 'completed' : ''}" data-id="${tarea.id}">
                <input type="checkbox" class="task-checkbox" ${tarea.completada ? 'checked' : ''}>
                <div class="task-content">
                    <div class="task-title">${this.escapeHtml(tarea.titulo)}</div>
                    <div class="task-meta">
                        <span class="task-priority priority-${tarea.prioridad}">${prioridadTexto[tarea.prioridad]}</span>
                        <span class="task-category">${categoriaIcono[tarea.categoria]} ${categoriaTexto[tarea.categoria]}</span>
                        <span class="task-date"><i class="far fa-calendar-alt"></i> ${fechaFormateada}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-task" data-action="edit"><i class="fas fa-pencil-alt"></i></button>
                    <button class="delete-task" data-action="delete"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    }
    
    // Escapar HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Agregar event listeners a elementos dinámicos
    agregarEventosDinamicos() {
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskItem = e.target.closest('.task-item');
                const id = parseInt(taskItem.dataset.id);
                this.toggleCompletar(id);
            });
        });
        
        document.querySelectorAll('.edit-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskItem = e.target.closest('.task-item');
                const id = parseInt(taskItem.dataset.id);
                this.editarTarea(id);
            });
        });
        
        document.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskItem = e.target.closest('.task-item');
                const id = parseInt(taskItem.dataset.id);
                this.eliminarTarea(id);
            });
        });
    }
    
    // Actualizar estadísticas y barra de progreso
    actualizarEstadisticas() {
        const total = this.tareas.length;
        const completadas = this.tareas.filter(t => t.completada).length;
        const pendientes = total - completadas;
        const porcentaje = total === 0 ? 0 : Math.round((completadas / total) * 100);
        
        this.totalTasksSpan.textContent = total;
        this.completedTasksSpan.textContent = completadas;
        this.pendingTasksSpan.textContent = pendientes;
        this.progressFill.style.width = `${porcentaje}%`;
        this.progressPercent.textContent = `${porcentaje}%`;
    }
    
    // Mostrar notificación
    mostrarNotificacion(mensaje, tipo) {
        // Crear notificación flotante
        const notification = document.createElement('div');
        notification.className = `notification notification-${tipo}`;
        notification.innerHTML = `
            <i class="fas ${tipo === 'success' ? 'fa-check-circle' : tipo === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${mensaje}</span>
        `;
        
        // Estilos de la notificación
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
    
    // Configurar event listeners principales
    eventListeners() {
        this.addTaskBtn.addEventListener('click', () => this.agregarTarea());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.agregarTarea();
        });
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filtroActual = btn.dataset.filter;
                this.renderizarTareas();
            });
        });
        
        this.searchInput.addEventListener('input', (e) => {
            this.busquedaActual = e.target.value;
            this.renderizarTareas();
        });
        
        this.clearCompletedBtn.addEventListener('click', () => this.limpiarCompletadas());
        this.deleteAllBtn.addEventListener('click', () => this.eliminarTodas());
    }
    
    // Crear modal de edición
    crearModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Editar tarea</h3>
                <input type="text" id="editTaskInput" placeholder="Nuevo título de la tarea">
                <div class="modal-buttons">
                    <button class="cancel-edit">Cancelar</button>
                    <button class="save-edit">Guardar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        this.editModal = modal;
        this.editInput = document.getElementById('editTaskInput');
        
        const saveBtn = modal.querySelector('.save-edit');
        const cancelBtn = modal.querySelector('.cancel-edit');
        
        saveBtn.addEventListener('click', () => this.guardarEdicion());
        cancelBtn.addEventListener('click', () => this.cerrarModal());
        
        this.editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.guardarEdicion();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.cerrarModal();
        });
    }
}

// Estilos animaciones para notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
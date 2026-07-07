/**
 * APLICACIÓN DE NOTAS CON LOCALSTORAGE
 * Funcionalidades: CRUD completo, categorías, búsqueda, notas fijadas, exportar/importar
 */

class NotesApp {
    constructor() {
        this.notes = [];
        this.currentCategory = 'all';
        this.searchTerm = '';
        this.currentNoteId = null;
        this.noteToDelete = null;
        
        // Elementos DOM
        this.notesGrid = document.getElementById('notesGrid');
        this.searchInput = document.getElementById('searchInput');
        this.newNoteBtn = document.getElementById('newNoteBtn');
        this.categoryBtns = document.querySelectorAll('.category-btn');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.importFile = document.getElementById('importFile');
        
        // Modal de nota
        this.noteModal = document.getElementById('noteModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.noteTitle = document.getElementById('noteTitle');
        this.noteCategory = document.getElementById('noteCategory');
        this.notePinned = document.getElementById('notePinned');
        this.noteContent = document.getElementById('noteContent');
        this.charCount = document.getElementById('charCount');
        this.saveNoteBtn = document.getElementById('saveNoteBtn');
        
        // Modal de confirmación
        this.confirmModal = document.getElementById('confirmModal');
        this.confirmMessage = document.getElementById('confirmMessage');
        
        this.init();
    }
    
    init() {
        this.cargarNotas();
        this.eventListeners();
        this.renderizarNotas();
        this.actualizarEstadisticas();
    }
    
    // Cargar notas desde localStorage
    cargarNotas() {
        const notasGuardadas = localStorage.getItem('notes_app');
        if (notasGuardadas) {
            this.notes = JSON.parse(notasGuardadas);
        } else {
            // Notas de ejemplo
            this.notes = [
                {
                    id: Date.now() + 1,
                    title: '¡Bienvenido a tu bloc de notas!',
                    content: 'Esta es una nota de ejemplo. Puedes crear, editar, eliminar y organizar tus notas por categorías.',
                    category: 'personal',
                    pinned: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: Date.now() + 2,
                    title: 'Tareas pendientes',
                    content: '✓ Terminar el proyecto de portafolio\n✓ Estudiar JavaScript\n✓ Hacer ejercicio',
                    category: 'personal',
                    pinned: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: Date.now() + 3,
                    title: 'Ideas para nuevos proyectos',
                    content: '• App de clima\n• Juego de memoria\n• Conversor de monedas\n• Chatbot con IA',
                    category: 'ideas',
                    pinned: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            this.guardarNotas();
        }
    }
    
    // Guardar notas en localStorage
    guardarNotas() {
        localStorage.setItem('notes_app', JSON.stringify(this.notes));
        this.actualizarEstadisticas();
    }
    
    // Obtener notas filtradas
    getFilteredNotes() {
        let filtered = [...this.notes];
        
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(n => n.category === this.currentCategory);
        }
        
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(n => 
                n.title.toLowerCase().includes(term) || 
                n.content.toLowerCase().includes(term)
            );
        }
        
        filtered.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
        
        return filtered;
    }
    
    // Renderizar notas
    renderizarNotas() {
        const filteredNotes = this.getFilteredNotes();
        
        if (filteredNotes.length === 0) {
            this.notesGrid.innerHTML = `
                <div class="empty-notes">
                    <i class="fas fa-sticky-note"></i>
                    <h3>No hay notas</h3>
                    <p>${this.searchTerm ? 'No se encontraron resultados' : 'Crea tu primera nota'}</p>
                </div>
            `;
            return;
        }
        
        this.notesGrid.innerHTML = filteredNotes.map(note => `
            <div class="note-card ${note.pinned ? 'pinned' : ''}" data-id="${note.id}">
                <div class="note-header">
                    <div class="note-title">
                        ${this.escapeHtml(note.title || 'Sin título')}
                        ${note.pinned ? '<i class="fas fa-thumbtack pin-icon"></i>' : ''}
                    </div>
                </div>
                <div class="note-category category-${note.category}">
                    ${this.getCategoryIcon(note.category)} ${this.getCategoryName(note.category)}
                </div>
                <div class="note-content">
                    ${this.escapeHtml(note.content.substring(0, 150))}${note.content.length > 150 ? '...' : ''}
                </div>
                <div class="note-footer">
                    <span>${this.formatDate(note.updatedAt)}</span>
                    <div class="note-actions">
                        <button class="edit-note" data-id="${note.id}">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="delete-note" data-id="${note.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        document.querySelectorAll('.edit-note').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                this.editarNota(id);
            });
        });
        
        document.querySelectorAll('.delete-note').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                this.confirmarEliminar(id);
            });
        });
        
        document.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.note-actions')) {
                    const id = parseInt(card.dataset.id);
                    this.editarNota(id);
                }
            });
        });
    }
    
    getCategoryIcon(category) {
        const icons = {
            personal: '👤',
            trabajo: '💼',
            estudio: '📚',
            ideas: '💡'
        };
        return icons[category] || '📝';
    }
    
    getCategoryName(category) {
        const names = {
            personal: 'Personal',
            trabajo: 'Trabajo',
            estudio: 'Estudio',
            ideas: 'Ideas'
        };
        return names[category] || category;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Justo ahora';
        if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
        if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} h`;
        if (diff < 604800000) return `Hace ${Math.floor(diff / 86400000)} d`;
        
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
    
    crearNota() {
        this.currentNoteId = null;
        this.modalTitle.textContent = 'Nueva Nota';
        this.noteTitle.value = '';
        this.noteCategory.value = 'personal';
        this.notePinned.checked = false;
        this.noteContent.value = '';
        this.charCount.textContent = '0';
        this.noteModal.classList.add('active');
        this.noteTitle.focus();
    }
    
    editarNota(id) {
        const note = this.notes.find(n => n.id === id);
        if (!note) return;
        
        this.currentNoteId = id;
        this.modalTitle.textContent = 'Editar Nota';
        this.noteTitle.value = note.title;
        this.noteCategory.value = note.category;
        this.notePinned.checked = note.pinned;
        this.noteContent.value = note.content;
        this.charCount.textContent = note.content.length;
        this.noteModal.classList.add('active');
    }
    
    guardarNota() {
        const title = this.noteTitle.value.trim() || 'Sin título';
        const content = this.noteContent.value;
        const category = this.noteCategory.value;
        const pinned = this.notePinned.checked;
        const now = new Date().toISOString();
        
        if (!content.trim()) {
            this.mostrarNotificacion('La nota no puede estar vacía', 'error');
            return;
        }
        
        if (this.currentNoteId) {
            const index = this.notes.findIndex(n => n.id === this.currentNoteId);
            if (index !== -1) {
                this.notes[index] = {
                    ...this.notes[index],
                    title,
                    content,
                    category,
                    pinned,
                    updatedAt: now
                };
                this.mostrarNotificacion('Nota actualizada', 'success');
            }
        } else {
            this.notes.unshift({
                id: Date.now(),
                title,
                content,
                category,
                pinned,
                createdAt: now,
                updatedAt: now
            });
            this.mostrarNotificacion('Nota creada', 'success');
        }
        
        this.guardarNotas();
        this.renderizarNotas();
        this.cerrarModal();
    }
    
    confirmarEliminar(id) {
        const note = this.notes.find(n => n.id === id);
        if (!note) return;
        
        this.noteToDelete = id;
        this.confirmMessage.textContent = `¿Eliminar "${note.title || 'Sin título'}"?`;
        this.confirmModal.classList.add('active');
    }
    
    eliminarNota() {
        if (this.noteToDelete) {
            this.notes = this.notes.filter(n => n.id !== this.noteToDelete);
            this.guardarNotas();
            this.renderizarNotas();
            this.mostrarNotificacion('Nota eliminada', 'success');
            this.noteToDelete = null;
        }
        this.cerrarConfirmModal();
    }
    
    exportarNotas() {
        const data = JSON.stringify(this.notes, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notas_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.mostrarNotificacion('Notas exportadas', 'success');
    }
    
    importarNotas(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    this.notes = [...this.notes, ...imported];
                    this.guardarNotas();
                    this.renderizarNotas();
                    this.mostrarNotificacion(`${imported.length} notas importadas`, 'success');
                }
            } catch {
                this.mostrarNotificacion('Error al importar', 'error');
            }
        };
        reader.readAsText(file);
    }
    
    actualizarEstadisticas() {
        const total = this.notes.length;
        const pinned = this.notes.filter(n => n.pinned).length;
        const personal = this.notes.filter(n => n.category === 'personal').length;
        const trabajo = this.notes.filter(n => n.category === 'trabajo').length;
        const estudio = this.notes.filter(n => n.category === 'estudio').length;
        const ideas = this.notes.filter(n => n.category === 'ideas').length;
        
        document.getElementById('totalNotes').textContent = total;
        document.getElementById('pinnedNotes').textContent = pinned;
        document.getElementById('allCount').textContent = total;
        document.getElementById('personalCount').textContent = personal;
        document.getElementById('workCount').textContent = trabajo;
        document.getElementById('studyCount').textContent = estudio;
        document.getElementById('ideasCount').textContent = ideas;
    }
    
    cambiarCategoria(category) {
        this.currentCategory = category;
        this.categoryBtns.forEach(btn => {
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        this.renderizarNotas();
    }
    
    mostrarNotificacion(mensaje, tipo) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${tipo}`;
        notification.innerHTML = `
            <i class="fas ${tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${mensaje}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${tipo === 'success' ? '#28A745' : '#DC3545'};
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
    
    cerrarModal() {
        this.noteModal.classList.remove('active');
        this.currentNoteId = null;
    }
    
    cerrarConfirmModal() {
        this.confirmModal.classList.remove('active');
        this.noteToDelete = null;
    }
    
    eventListeners() {
        this.newNoteBtn.addEventListener('click', () => this.crearNota());
        this.searchInput.addEventListener('input', () => {
            this.searchTerm = this.searchInput.value;
            this.renderizarNotas();
        });
        this.noteContent.addEventListener('input', () => {
            this.charCount.textContent = this.noteContent.value.length;
        });
        this.saveNoteBtn.addEventListener('click', () => this.guardarNota());
        this.exportBtn.addEventListener('click', () => this.exportarNotas());
        this.importBtn.addEventListener('click', () => this.importFile.click());
        this.importFile.addEventListener('change', (e) => {
            if (e.target.files[0]) this.importarNotas(e.target.files[0]);
        });
        
        this.categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.cambiarCategoria(btn.dataset.category);
            });
        });
        
        // Cerrar modales
        document.querySelectorAll('.close-modal, .cancel-btn').forEach(btn => {
            btn.addEventListener('click', () => this.cerrarModal());
        });
        document.querySelectorAll('.close-confirm, .cancel-confirm').forEach(btn => {
            btn.addEventListener('click', () => this.cerrarConfirmModal());
        });
        document.querySelector('.confirm-delete')?.addEventListener('click', () => this.eliminarNota());
        
        // Cerrar modal al hacer clic fuera
        this.noteModal.addEventListener('click', (e) => {
            if (e.target === this.noteModal) this.cerrarModal();
        });
        this.confirmModal.addEventListener('click', (e) => {
            if (e.target === this.confirmModal) this.cerrarConfirmModal();
        });
    }
}

// Estilos para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    new NotesApp();
});
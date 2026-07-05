/**
 * ORGANIZADOR DE APUNTES
 * Notas con categorías, etiquetas, búsqueda y persistencia
 */

class NotesOrganizer {
    constructor() {
        this.notes = [];
        this.categories = ['general', 'trabajo', 'estudio', 'personal', 'ideas', 'proyectos'];
        this.currentView = 'grid';
        this.searchTerm = '';
        this.currentNoteId = null;
        this.noteToDelete = null;
        this.tags = [];
        
        // Elementos DOM
        this.notesGrid = document.getElementById('notesGrid');
        this.searchInput = document.getElementById('searchInput');
        this.newNoteBtn = document.getElementById('newNoteBtn');
        this.viewBtns = document.querySelectorAll('.view-btn');
        this.totalNotesSpan = document.getElementById('totalNotes');
        this.totalCategoriesSpan = document.getElementById('totalCategories');
        
        // Modal de nota
        this.noteModal = document.getElementById('noteModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.noteTitle = document.getElementById('noteTitle');
        this.noteContent = document.getElementById('noteContent');
        this.noteCategory = document.getElementById('noteCategory');
        this.newCategoryInput = document.getElementById('newCategoryInput');
        this.addCategoryBtn = document.getElementById('addCategoryBtn');
        this.tagInput = document.getElementById('tagInput');
        this.tagsContainer = document.getElementById('tagsContainer');
        this.colorBtns = document.querySelectorAll('.color-btn');
        this.saveBtn = document.getElementById('saveNoteBtn');
        this.deleteBtn = document.getElementById('deleteNoteBtn');
        this.selectedColor = '#6C63FF';
        
        // Modal de confirmación
        this.confirmModal = document.getElementById('confirmModal');
        this.confirmMessage = document.getElementById('confirmMessage');
        
        this.init();
    }
    
    init() {
        this.cargarNotas();
        this.cargarCategorias();
        this.eventListeners();
        this.renderizarNotas();
        this.actualizarEstadisticas();
        this.actualizarSelectCategorias();
    }
    
    cargarNotas() {
        const saved = localStorage.getItem('notesOrganizer_notes');
        if (saved) {
            try {
                this.notes = JSON.parse(saved);
            } catch {
                this.notes = [];
            }
        }
        
        // Si no hay notas, agregar algunas de ejemplo
        if (this.notes.length === 0) {
            this.notes = [
                {
                    id: Date.now() + 1,
                    title: 'Bienvenido al Organizador de Apuntes',
                    content: 'Esta es una nota de ejemplo. Puedes crear, editar y organizar tus apuntes por categorías y etiquetas. ¡Pruébalo!',
                    category: 'general',
                    tags: ['ejemplo', 'bienvenida'],
                    color: '#6C63FF',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: Date.now() + 2,
                    title: 'Ideas para proyectos',
                    content: '• App de clima\n• Juego de memoria\n• Conversor de monedas\n• Chatbot con IA',
                    category: 'ideas',
                    tags: ['proyectos', 'ideas'],
                    color: '#FFC107',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: Date.now() + 3,
                    title: 'Apuntes de JavaScript',
                    content: 'Temas importantes:\n- Closures\n- Promesas y async/await\n- Manipulación del DOM\n- Eventos',
                    category: 'estudio',
                    tags: ['javascript', 'programacion'],
                    color: '#28A745',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            this.guardarNotas();
        }
    }
    
    cargarCategorias() {
        const saved = localStorage.getItem('notesOrganizer_categories');
        if (saved) {
            try {
                this.categories = JSON.parse(saved);
            } catch {
                this.categories = ['general', 'trabajo', 'estudio', 'personal', 'ideas', 'proyectos'];
            }
        }
    }
    
    guardarNotas() {
        localStorage.setItem('notesOrganizer_notes', JSON.stringify(this.notes));
        this.actualizarEstadisticas();
    }
    
    guardarCategorias() {
        localStorage.setItem('notesOrganizer_categories', JSON.stringify(this.categories));
        this.actualizarSelectCategorias();
        this.actualizarEstadisticas();
    }
    
    actualizarSelectCategorias() {
        const select = this.noteCategory;
        const currentValue = select.value;
        select.innerHTML = '';
        
        this.categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            const icons = {
                general: '📋',
                trabajo: '💼',
                estudio: '📚',
                personal: '👤',
                ideas: '💡',
                proyectos: '🚀'
            };
            option.textContent = `${icons[cat] || '📌'} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
            select.appendChild(option);
        });
        
        if (currentValue && this.categories.includes(currentValue)) {
            select.value = currentValue;
        }
    }
    
    eventListeners() {
        // Buscar
        this.searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderizarNotas();
        });
        
        // Nueva nota
        this.newNoteBtn.addEventListener('click', () => this.crearNota());
        
        // Vista
        this.viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentView = btn.dataset.view;
                this.renderizarNotas();
            });
        });
        
        // Modal - cerrar
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.cerrarModal());
        });
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', () => this.cerrarModal());
        });
        this.noteModal.addEventListener('click', (e) => {
            if (e.target === this.noteModal) this.cerrarModal();
        });
        
        // Colores
        this.colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.colorBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedColor = btn.dataset.color;
            });
        });
        
        // Guardar nota
        this.saveBtn.addEventListener('click', () => this.guardarNota());
        
        // Eliminar nota
        this.deleteBtn.addEventListener('click', () => {
            if (this.currentNoteId) {
                this.confirmarEliminar(this.currentNoteId);
            }
        });
        
        // Confirmación
        document.querySelector('.close-confirm').addEventListener('click', () => this.cerrarConfirmModal());
        document.querySelector('.cancel-confirm').addEventListener('click', () => this.cerrarConfirmModal());
        this.confirmModal.addEventListener('click', (e) => {
            if (e.target === this.confirmModal) this.cerrarConfirmModal();
        });
        document.querySelector('.confirm-delete').addEventListener('click', () => this.eliminarNota());
        
        // Agregar categoría
        this.addCategoryBtn.addEventListener('click', () => this.agregarCategoria());
        this.newCategoryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.agregarCategoria();
        });
        
        // Etiquetas
        this.tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.agregarTag();
            }
        });
        
        // Ctrl+Enter para guardar en textarea
        this.noteContent.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.guardarNota();
            }
        });
    }
    
    agregarCategoria() {
        const newCat = this.newCategoryInput.value.trim().toLowerCase();
        if (!newCat) return;
        if (this.categories.includes(newCat)) {
            this.newCategoryInput.value = '';
            this.newCategoryInput.placeholder = '⚠️ Categoría ya existe';
            setTimeout(() => {
                this.newCategoryInput.placeholder = 'Nueva categoría...';
            }, 1500);
            return;
        }
        this.categories.push(newCat);
        this.guardarCategorias();
        this.newCategoryInput.value = '';
        this.noteCategory.value = newCat;
    }
    
    agregarTag() {
        const tag = this.tagInput.value.trim().toLowerCase();
        if (!tag) return;
        if (this.tags.includes(tag)) {
            this.tagInput.value = '';
            this.tagInput.placeholder = '⚠️ Etiqueta ya existe';
            setTimeout(() => {
                this.tagInput.placeholder = 'Escribe una etiqueta...';
            }, 1500);
            return;
        }
        this.tags.push(tag);
        this.tagInput.value = '';
        this.renderizarTags();
    }
    
    eliminarTag(tag) {
        this.tags = this.tags.filter(t => t !== tag);
        this.renderizarTags();
    }
    
    renderizarTags() {
        if (this.tags.length === 0) {
            this.tagsContainer.innerHTML = '';
            return;
        }
        this.tagsContainer.innerHTML = this.tags.map(tag => `
            <span class="tag-item">
                #${tag}
                <button class="remove-tag" data-tag="${tag}">&times;</button>
            </span>
        `).join('');
        
        document.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', () => {
                this.eliminarTag(btn.dataset.tag);
            });
        });
    }
    
    crearNota() {
        this.currentNoteId = null;
        this.modalTitle.textContent = 'Nueva Nota';
        this.noteTitle.value = '';
        this.noteContent.value = '';
        this.noteCategory.value = 'general';
        this.tags = [];
        this.renderizarTags();
        this.selectedColor = '#6C63FF';
        this.colorBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === this.selectedColor);
        });
        this.deleteBtn.style.display = 'none';
        this.noteModal.classList.add('active');
        setTimeout(() => this.noteTitle.focus(), 100);
    }
    
    editarNota(id) {
        const note = this.notes.find(n => n.id === id);
        if (!note) return;
        
        this.currentNoteId = id;
        this.modalTitle.textContent = 'Editar Nota';
        this.noteTitle.value = note.title;
        this.noteContent.value = note.content;
        this.noteCategory.value = note.category || 'general';
        this.tags = note.tags || [];
        this.renderizarTags();
        this.selectedColor = note.color || '#6C63FF';
        this.colorBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === this.selectedColor);
        });
        this.deleteBtn.style.display = 'block';
        this.noteModal.classList.add('active');
        setTimeout(() => this.noteTitle.focus(), 100);
    }
    
    guardarNota() {
        const title = this.noteTitle.value.trim();
        const content = this.noteContent.value.trim();
        const category = this.noteCategory.value;
        const tags = [...this.tags];
        const color = this.selectedColor;
        const now = new Date().toISOString();
        
        if (!title) {
            this.noteTitle.style.borderColor = '#FF6584';
            this.noteTitle.placeholder = '⚠️ El título es obligatorio';
            setTimeout(() => {
                this.noteTitle.style.borderColor = '';
                this.noteTitle.placeholder = 'Título de la nota';
            }, 2000);
            return;
        }
        
        if (!content) {
            this.noteContent.style.borderColor = '#FF6584';
            this.noteContent.placeholder = '⚠️ Escribe algo en tu nota';
            setTimeout(() => {
                this.noteContent.style.borderColor = '';
                this.noteContent.placeholder = 'Escribe tu apunte aquí...';
            }, 2000);
            return;
        }
        
        if (this.currentNoteId) {
            // Editar nota existente
            const index = this.notes.findIndex(n => n.id === this.currentNoteId);
            if (index !== -1) {
                this.notes[index] = {
                    ...this.notes[index],
                    title,
                    content,
                    category,
                    tags,
                    color,
                    updatedAt: now
                };
            }
        } else {
            // Crear nueva nota
            const newNote = {
                id: Date.now(),
                title,
                content,
                category,
                tags,
                color,
                createdAt: now,
                updatedAt: now
            };
            this.notes.unshift(newNote);
        }
        
        this.guardarNotas();
        this.cerrarModal();
        this.renderizarNotas();
        this.actualizarEstadisticas();
    }
    
    confirmarEliminar(id) {
        const note = this.notes.find(n => n.id === id);
        if (!note) return;
        
        this.noteToDelete = id;
        this.confirmMessage.textContent = `¿Eliminar la nota "${note.title}"?`;
        this.confirmModal.classList.add('active');
    }
    
    eliminarNota() {
        if (this.noteToDelete) {
            this.notes = this.notes.filter(n => n.id !== this.noteToDelete);
            this.guardarNotas();
            this.renderizarNotas();
            this.actualizarEstadisticas();
            this.noteToDelete = null;
        }
        this.cerrarConfirmModal();
        this.cerrarModal();
    }
    
    cerrarModal() {
        this.noteModal.classList.remove('active');
        this.currentNoteId = null;
    }
    
    cerrarConfirmModal() {
        this.confirmModal.classList.remove('active');
        this.noteToDelete = null;
    }
    
    renderizarNotas() {
        let filtered = [...this.notes];
        
        // Filtrar por búsqueda
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(n => 
                n.title.toLowerCase().includes(term) || 
                n.content.toLowerCase().includes(term) ||
                (n.tags && n.tags.some(t => t.includes(term)))
            );
        }
        
        // Ordenar por fecha de actualización (más reciente primero)
        filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        if (filtered.length === 0) {
            this.notesGrid.innerHTML = `
                <div class="empty-notes">
                    <i class="fas fa-sticky-note"></i>
                    <h3>No hay apuntes</h3>
                    <p>${this.searchTerm ? 'No se encontraron resultados para tu búsqueda' : 'Crea tu primer apunte con el botón "Nueva Nota"'}</p>
                </div>
            `;
            this.notesGrid.className = 'notes-grid';
            return;
        }
        
        // Aplicar vista
        this.notesGrid.className = `notes-grid ${this.currentView === 'list' ? 'list-view' : ''}`;
        
        this.notesGrid.innerHTML = filtered.map(note => {
            const date = new Date(note.updatedAt);
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
            const categoryIcon = {
                general: '📋',
                trabajo: '💼',
                estudio: '📚',
                personal: '👤',
                ideas: '💡',
                proyectos: '🚀'
            };
            const catIcon = categoryIcon[note.category] || '📌';
            const catName = note.category.charAt(0).toUpperCase() + note.category.slice(1);
            
            // Limitar contenido a 100 caracteres para preview
            const preview = note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content;
            
            return `
                <div class="note-card" data-id="${note.id}" style="border-color: ${note.color || '#6C63FF'}40;">
                    <div class="note-color-bar" style="background: ${note.color || '#6C63FF'};"></div>
                    <div class="note-header">
                        <span class="note-title">${this.escapeHtml(note.title)}</span>
                        <span class="note-category">${catIcon} ${catName}</span>
                    </div>
                    <div class="note-content-preview">${this.escapeHtml(preview)}</div>
                    ${note.tags && note.tags.length > 0 ? `
                        <div class="note-tags">
                            ${note.tags.map(tag => `<span class="note-tag">#${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    <div class="note-footer">
                        <span class="note-date"><i class="far fa-clock"></i> ${formattedDate}</span>
                        <div class="note-actions">
                            <button class="edit-btn" data-id="${note.id}"><i class="fas fa-pencil-alt"></i></button>
                            <button class="delete-btn" data-id="${note.id}"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Event listeners para editar y eliminar
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                this.editarNota(id);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                this.confirmarEliminar(id);
            });
        });
        
        // Click en la tarjeta para editar
        document.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.id);
                this.editarNota(id);
            });
        });
    }
    
    actualizarEstadisticas() {
        const total = this.notes.length;
        const totalCategories = this.categories.length;
        this.totalNotesSpan.textContent = total;
        this.totalCategoriesSpan.textContent = totalCategories;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', () => {
    new NotesOrganizer();
});
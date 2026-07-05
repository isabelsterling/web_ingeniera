/**
 * ADMINISTRADOR DE HÁBITOS DIARIOS
 * Registra, sigue y analiza tus hábitos diarios
 */

class HabitTracker {
    constructor() {
        this.habits = [];
        this.currentFilter = 'all';
        this.today = this.getToday();
        this.categories = {
            salud: { icon: '💪', label: 'Salud' },
            productividad: { icon: '📊', label: 'Productividad' },
            aprendizaje: { icon: '📚', label: 'Aprendizaje' },
            social: { icon: '🤝', label: 'Social' },
            bienestar: { icon: '🧘', label: 'Bienestar' }
        };
        
        // Elementos DOM
        this.habitsList = document.getElementById('habitsList');
        this.habitInput = document.getElementById('habitInput');
        this.habitCategory = document.getElementById('habitCategory');
        this.addHabitBtn = document.getElementById('addHabitBtn');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.resetTodayBtn = document.getElementById('resetTodayBtn');
        this.totalHabitsSpan = document.getElementById('totalHabits');
        this.completedTodaySpan = document.getElementById('completedToday');
        this.streakDaysSpan = document.getElementById('streakDays');
        this.weekGrid = document.getElementById('weekGrid');
        
        this.init();
    }
    
    init() {
        this.cargarHabits();
        this.eventListeners();
        this.renderizarHabits();
        this.actualizarEstadisticas();
        this.renderizarSemana();
        this.verificarReinicioDiario();
    }
    
    getToday() {
        return new Date().toISOString().split('T')[0];
    }
    
    cargarHabits() {
        const saved = localStorage.getItem('habits_data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.habits = data.habits || [];
                this.today = data.today || this.getToday();
            } catch {
                this.habits = [];
            }
        }
        
        // Si no hay hábitos, agregar algunos de ejemplo
        if (this.habits.length === 0) {
            this.habits = [
                { id: Date.now() + 1, name: 'Hacer ejercicio 30 min', category: 'salud', history: [] },
                { id: Date.now() + 2, name: 'Leer 20 minutos', category: 'aprendizaje', history: [] },
                { id: Date.now() + 3, name: 'Meditar 10 minutos', category: 'bienestar', history: [] }
            ];
            this.guardarHabits();
        }
    }
    
    guardarHabits() {
        const data = {
            habits: this.habits,
            today: this.today
        };
        localStorage.setItem('habits_data', JSON.stringify(data));
    }
    
    verificarReinicioDiario() {
        const today = this.getToday();
        if (this.today !== today) {
            // Reiniciar el estado de "hecho" para el nuevo día
            this.today = today;
            this.guardarHabits();
            this.renderizarHabits();
            this.actualizarEstadisticas();
            this.renderizarSemana();
        }
    }
    
    eventListeners() {
        // Agregar hábito
        this.addHabitBtn.addEventListener('click', () => this.agregarHabit());
        this.habitInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.agregarHabit();
        });
        
        // Filtros
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.renderizarHabits();
            });
        });
        
        // Reiniciar hoy
        this.resetTodayBtn.addEventListener('click', () => {
            if (confirm('¿Reiniciar todos los hábitos de hoy?')) {
                this.habits.forEach(habit => {
                    habit.history = habit.history.filter(h => h.date !== this.today);
                });
                this.guardarHabits();
                this.renderizarHabits();
                this.actualizarEstadisticas();
                this.renderizarSemana();
            }
        });
    }
    
    agregarHabit() {
        const name = this.habitInput.value.trim();
        const category = this.habitCategory.value;
        
        if (!name) {
            this.habitInput.style.borderColor = '#FF6584';
            this.habitInput.placeholder = '⚠️ Escribe un hábito...';
            setTimeout(() => {
                this.habitInput.style.borderColor = '';
                this.habitInput.placeholder = 'Ej: Hacer ejercicio, Leer 30 min...';
            }, 2000);
            return;
        }
        
        const newHabit = {
            id: Date.now(),
            name: name,
            category: category,
            history: []
        };
        
        this.habits.push(newHabit);
        this.guardarHabits();
        this.habitInput.value = '';
        this.habitInput.focus();
        this.renderizarHabits();
        this.actualizarEstadisticas();
        this.renderizarSemana();
    }
    
    toggleHabit(id) {
        const habit = this.habits.find(h => h.id === id);
        if (!habit) return;
        
        const today = this.today;
        const index = habit.history.findIndex(h => h.date === today);
        
        if (index === -1) {
            habit.history.push({ date: today, done: true });
        } else {
            habit.history[index].done = !habit.history[index].done;
        }
        
        this.guardarHabits();
        this.renderizarHabits();
        this.actualizarEstadisticas();
        this.renderizarSemana();
    }
    
    eliminarHabit(id) {
        if (confirm('¿Eliminar este hábito?')) {
            this.habits = this.habits.filter(h => h.id !== id);
            this.guardarHabits();
            this.renderizarHabits();
            this.actualizarEstadisticas();
            this.renderizarSemana();
        }
    }
    
    getHabitStatus(habit, date) {
        const entry = habit.history.find(h => h.date === date);
        return entry ? entry.done : false;
    }
    
    getHabitStreak(habit) {
        let streak = 0;
        const date = new Date();
        
        // Verificar desde hoy hacia atrás
        for (let i = 0; i < 365; i++) {
            const dateStr = date.toISOString().split('T')[0];
            const done = this.getHabitStatus(habit, dateStr);
            
            if (done) {
                streak++;
            } else {
                break;
            }
            date.setDate(date.getDate() - 1);
        }
        
        return streak;
    }
    
    getCompletedToday() {
        const today = this.today;
        let completed = 0;
        
        this.habits.forEach(habit => {
            const entry = habit.history.find(h => h.date === today);
            if (entry && entry.done) completed++;
        });
        
        return completed;
    }
    
    getTotalStreak() {
        // Racha general: días con todos los hábitos completados
        let streak = 0;
        const date = new Date();
        
        for (let i = 0; i < 365; i++) {
            const dateStr = date.toISOString().split('T')[0];
            let allDone = true;
            
            this.habits.forEach(habit => {
                const entry = habit.history.find(h => h.date === dateStr);
                if (!entry || !entry.done) allDone = false;
            });
            
            if (allDone && this.habits.length > 0) {
                streak++;
            } else {
                break;
            }
            date.setDate(date.getDate() - 1);
        }
        
        return streak;
    }
    
    actualizarEstadisticas() {
        this.totalHabitsSpan.textContent = this.habits.length;
        this.completedTodaySpan.textContent = this.getCompletedToday();
        this.streakDaysSpan.textContent = this.getTotalStreak();
    }
    
    renderizarHabits() {
        const filtered = this.currentFilter === 'all' 
            ? this.habits 
            : this.habits.filter(h => h.category === this.currentFilter);
        
        if (filtered.length === 0) {
            this.habitsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>${this.habits.length === 0 ? 'No tienes hábitos' : 'No hay hábitos en esta categoría'}</h3>
                    <p>${this.habits.length === 0 ? 'Agrega tu primer hábito usando el formulario de arriba' : 'Prueba con otra categoría'}</p>
                </div>
            `;
            return;
        }
        
        this.habitsList.innerHTML = filtered.map(habit => {
            const done = this.getHabitStatus(habit, this.today);
            const streak = this.getHabitStreak(habit);
            const categoryInfo = this.categories[habit.category] || { icon: '📌', label: 'General' };
            
            return `
                <div class="habit-item ${done ? 'done' : ''}" data-id="${habit.id}">
                    <button class="habit-check ${done ? 'done' : ''}" data-id="${habit.id}">
                        ${done ? '<i class="fas fa-check"></i>' : ''}
                    </button>
                    <span class="habit-category">${categoryInfo.icon} ${categoryInfo.label}</span>
                    <span class="habit-name">${habit.name}</span>
                    ${streak > 0 ? `<span class="habit-streak">🔥 ${streak}</span>` : ''}
                    <button class="habit-delete" data-id="${habit.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
        }).join('');
        
        // Event listeners para botones dinámicos
        document.querySelectorAll('.habit-check').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                this.toggleHabit(id);
            });
        });
        
        document.querySelectorAll('.habit-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                this.eliminarHabit(id);
            });
        });
    }
    
    renderizarSemana() {
        const days = [];
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1); // Lunes
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            days.push(date);
        }
        
        const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        
        this.weekGrid.innerHTML = days.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0];
            const isToday = dateStr === this.today;
            
            // Contar hábitos completados este día
            let completed = 0;
            let total = this.habits.length;
            
            this.habits.forEach(habit => {
                const entry = habit.history.find(h => h.date === dateStr);
                if (entry && entry.done) completed++;
            });
            
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            const isCompleted = percentage === 100 && total > 0;
            
            return `
                <div class="week-day ${isToday ? 'today' : ''} ${isCompleted ? 'completed' : ''}">
                    <div class="day-name">${dayNames[index]}</div>
                    <div class="day-number">${date.getDate()}</div>
                    <div class="day-habits">${completed}/${total}</div>
                    <div class="day-status">${isCompleted ? '✅' : percentage > 0 ? '⏳' : '⬜'}</div>
                </div>
            `;
        }).join('');
    }
}

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', () => {
    new HabitTracker();
});
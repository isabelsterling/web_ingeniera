/**
 * ✊ PIEDRA, PAPEL O TIJERA
 * Juego clásico contra la IA con estadísticas y historial
 */

class PiedraPapelTijera {
    constructor() {
        // Opciones del juego
        this.opciones = ['piedra', 'papel', 'tijera'];
        this.emojiMap = {
            'piedra': '✊',
            'papel': '✋',
            'tijera': '✌️'
        };
        this.nombreMap = {
            'piedra': 'Piedra',
            'papel': 'Papel',
            'tijera': 'Tijera'
        };
        
        // Estado del juego
        this.score = { player: 0, computer: 0, draws: 0 };
        this.history = [];
        this.isPlaying = false;
        this.streak = 0;
        this.totalGames = 0;
        
        // Elementos DOM
        this.playerScoreSpan = document.getElementById('playerScore');
        this.computerScoreSpan = document.getElementById('computerScore');
        this.drawsSpan = document.getElementById('draws');
        this.playerChoiceDiv = document.getElementById('playerChoice');
        this.computerChoiceDiv = document.getElementById('computerChoice');
        this.resultDisplay = document.getElementById('resultDisplay');
        this.historyList = document.getElementById('historyList');
        this.winRateSpan = document.getElementById('winRate');
        this.totalGamesSpan = document.getElementById('totalGames');
        this.streakSpan = document.getElementById('currentStreak');
        
        // Botones
        this.choiceBtns = document.querySelectorAll('.choice-btn');
        this.resetBtn = document.getElementById('resetBtn');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        
        this.init();
    }
    
    init() {
        this.cargarDatos();
        this.eventListeners();
        this.actualizarUI();
    }
    
    // ========== CARGA DE DATOS ==========
    cargarDatos() {
        const saved = localStorage.getItem('ppt_data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.score = data.score || { player: 0, computer: 0, draws: 0 };
                this.history = data.history || [];
                this.totalGames = data.totalGames || 0;
                this.streak = data.streak || 0;
            } catch {
                this.resetData();
            }
        }
    }
    
    guardarDatos() {
        localStorage.setItem('ppt_data', JSON.stringify({
            score: this.score,
            history: this.history,
            totalGames: this.totalGames,
            streak: this.streak
        }));
    }
    
    resetData() {
        this.score = { player: 0, computer: 0, draws: 0 };
        this.history = [];
        this.totalGames = 0;
        this.streak = 0;
        this.guardarDatos();
    }
    
    // ========== EVENT LISTENERS ==========
    eventListeners() {
        // Botones de elección
        this.choiceBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const choice = btn.dataset.choice;
                this.jugar(choice);
            });
        });
        
        // Reiniciar
        this.resetBtn.addEventListener('click', () => {
            if (confirm('¿Reiniciar todas las estadísticas?')) {
                this.resetData();
                this.actualizarUI();
                this.renderizarHistorial();
                this.mostrarResultado('Elige tu jugada', '');
                this.playerChoiceDiv.textContent = '❓';
                this.computerChoiceDiv.textContent = '❓';
            }
        });
        
        // Limpiar historial
        this.clearHistoryBtn.addEventListener('click', () => {
            if (this.history.length === 0) {
                this.mostrarNotificacion('No hay historial para limpiar', 'info');
                return;
            }
            if (confirm('¿Limpiar todo el historial?')) {
                this.history = [];
                this.guardarDatos();
                this.renderizarHistorial();
                this.mostrarNotificacion('Historial limpiado', 'success');
            }
        });
        
        // Teclado
        document.addEventListener('keydown', (e) => {
            const key = e.key;
            if (key === '1' || key === 'r' || key === 'R') {
                this.jugar('piedra');
            } else if (key === '2' || key === 'p' || key === 'P') {
                this.jugar('papel');
            } else if (key === '3' || key === 't' || key === 'T') {
                this.jugar('tijera');
            } else if (key === 'r' || key === 'R') {
                // Solo si no es una tecla de elección
                if (!['1', '2', '3'].includes(key)) {
                    this.resetBtn.click();
                }
            }
        });
    }
    
    // ========== LÓGICA DEL JUEGO ==========
    jugar(choice) {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        
        // Deshabilitar botones
        this.choiceBtns.forEach(btn => btn.disabled = true);
        
        // Elegir jugada de la IA
        const computerChoice = this.opciones[Math.floor(Math.random() * this.opciones.length)];
        
        // Mostrar elección del jugador con animación
        this.playerChoiceDiv.textContent = this.emojiMap[choice];
        this.playerChoiceDiv.className = 'choice-icon pop';
        setTimeout(() => {
            this.playerChoiceDiv.className = 'choice-icon';
        }, 500);
        
        // Mostrar elección de la IA con animación
        this.computerChoiceDiv.textContent = '❓';
        this.computerChoiceDiv.className = 'choice-icon pulse';
        
        // Determinar resultado
        setTimeout(() => {
            this.computerChoiceDiv.textContent = this.emojiMap[computerChoice];
            this.computerChoiceDiv.className = 'choice-icon';
            
            const result = this.determinarGanador(choice, computerChoice);
            this.actualizarResultado(result, choice, computerChoice);
            
            // Guardar en historial
            this.guardarEnHistorial(choice, computerChoice, result);
            
            // Actualizar UI
            this.actualizarUI();
            this.renderizarHistorial();
            
            // Habilitar botones
            this.choiceBtns.forEach(btn => btn.disabled = false);
            this.isPlaying = false;
        }, 600);
    }
    
    determinarGanador(jugador, computadora) {
        if (jugador === computadora) return 'draw';
        
        if (
            (jugador === 'piedra' && computadora === 'tijera') ||
            (jugador === 'papel' && computadora === 'piedra') ||
            (jugador === 'tijera' && computadora === 'papel')
        ) {
            return 'win';
        }
        
        return 'lose';
    }
    
    actualizarResultado(result, playerChoice, computerChoice) {
        const mensajes = {
            win: {
                text: '🎉 ¡Ganaste!',
                class: 'win',
                emoji: '😄'
            },
            lose: {
                text: '😅 Perdiste',
                class: 'lose',
                emoji: '😢'
            },
            draw: {
                text: '🤝 Empate',
                class: 'draw',
                emoji: '😐'
            }
        };
        
        const info = mensajes[result];
        
        // Actualizar puntaje
        if (result === 'win') {
            this.score.player++;
            this.streak = this.streak > 0 ? this.streak + 1 : 1;
        } else if (result === 'lose') {
            this.score.computer++;
            this.streak = this.streak < 0 ? this.streak - 1 : -1;
        } else {
            this.score.draws++;
            this.streak = 0;
        }
        
        this.totalGames++;
        
        // Mostrar resultado
        this.mostrarResultado(info.text, info.class);
        
        // Guardar datos
        this.guardarDatos();
    }
    
    mostrarResultado(text, className) {
        this.resultDisplay.innerHTML = `<span class="result-text ${className}">${text}</span>`;
    }
    
    guardarEnHistorial(player, computer, result) {
        const resultadoMap = {
            win: '✅ Ganaste',
            lose: '❌ Perdiste',
            draw: '🤝 Empate'
        };
        
        this.history.unshift({
            player: this.emojiMap[player],
            computer: this.emojiMap[computer],
            result: result,
            resultText: resultadoMap[result],
            playerName: this.nombreMap[player],
            computerName: this.nombreMap[computer],
            date: new Date().toISOString()
        });
        
        // Limitar historial a 50
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        this.guardarDatos();
    }
    
    // ========== UI ==========
    actualizarUI() {
        this.playerScoreSpan.textContent = this.score.player;
        this.computerScoreSpan.textContent = this.score.computer;
        this.drawsSpan.textContent = this.score.draws;
        
        // Calcular tasa de victoria
        const total = this.score.player + this.score.computer + this.score.draws;
        const winRate = total > 0 ? Math.round((this.score.player / total) * 100) : 0;
        this.winRateSpan.textContent = `${winRate}%`;
        this.totalGamesSpan.textContent = this.totalGames;
        
        // Mostrar racha
        let streakText = '0';
        if (this.streak > 0) {
            streakText = `+${this.streak}`;
        } else if (this.streak < 0) {
            streakText = `${this.streak}`;
        }
        this.streakSpan.textContent = streakText;
        
        // Cambiar color de la racha
        if (this.streak > 0) {
            this.streakSpan.style.color = 'var(--success)';
        } else if (this.streak < 0) {
            this.streakSpan.style.color = 'var(--danger)';
        } else {
            this.streakSpan.style.color = 'var(--primary)';
        }
    }
    
    renderizarHistorial() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-hourglass-start"></i>
                    <p>No hay partidas jugadas aún</p>
                </div>
            `;
            return;
        }
        
        this.historyList.innerHTML = this.history.map(item => {
            const resultClass = item.result === 'win' ? 'win' : item.result === 'lose' ? 'lose' : 'draw';
            const resultEmoji = item.result === 'win' ? '✅' : item.result === 'lose' ? '❌' : '🤝';
            
            return `
                <div class="history-item">
                    <span class="choices-text">
                        ${item.player} vs ${item.computer}
                    </span>
                    <span class="result ${resultClass}">
                        ${resultEmoji} ${item.resultText}
                    </span>
                </div>
            `;
        }).join('');
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
    new PiedraPapelTijera();
});

// Estilos para animaciones de notificaciones
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
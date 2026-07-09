/**
 * 🔢 ADIVINA EL NÚMERO
 * Juego interactivo de adivinanza con persistencia
 */

class GuessGame {
    constructor() {
        // Configuración
        this.minRange = 1;
        this.maxRange = 100;
        this.secretNumber = 0;
        this.attempts = 0;
        this.highScore = parseInt(localStorage.getItem('guessGameHighScore')) || 0;
        this.gameOver = false;
        this.history = [];
        this.startTime = null;
        this.timerInterval = null;
        this.seconds = 0;
        
        // Elementos DOM
        this.secretDisplay = document.getElementById('secretNumber');
        this.hintText = document.getElementById('hintText');
        this.attemptsDisplay = document.getElementById('attempts');
        this.highScoreDisplay = document.getElementById('highScore');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.guessInput = document.getElementById('guessInput');
        this.guessBtn = document.getElementById('guessBtn');
        this.historyList = document.getElementById('historyList');
        this.minRangeDisplay = document.getElementById('minRange');
        this.maxRangeDisplay = document.getElementById('maxRange');
        this.secretRangeDisplay = document.getElementById('secretRange');
        
        // Overlays
        this.victoryOverlay = document.getElementById('victoryOverlay');
        this.settingsOverlay = document.getElementById('settingsOverlay');
        this.victoryNumber = document.getElementById('victoryNumber');
        this.victoryAttempts = document.getElementById('victoryAttempts');
        this.victoryTime = document.getElementById('victoryTime');
        this.victoryMessage = document.getElementById('victoryMessage');
        this.minRangeInput = document.getElementById('minRangeInput');
        this.maxRangeInput = document.getElementById('maxRangeInput');
        
        // Inicializar
        this.init();
    }
    
    init() {
        this.eventListeners();
        this.cargarHighScore();
        this.nuevoJuego();
    }
    
    eventListeners() {
        // Botón adivinar
        this.guessBtn.addEventListener('click', () => this.adivinar());
        
        // Enter para adivinar
        this.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.adivinar();
            }
        });
        
        // Reiniciar
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.nuevoJuego();
        });
        
        // Jugar de nuevo
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.victoryOverlay.style.display = 'none';
            this.nuevoJuego();
        });
        
        // Cambiar rango
        document.getElementById('changeRangeBtn').addEventListener('click', () => {
            this.victoryOverlay.style.display = 'none';
            this.settingsOverlay.style.display = 'flex';
            this.minRangeInput.value = this.minRange;
            this.maxRangeInput.value = this.maxRange;
            setTimeout(() => this.minRangeInput.focus(), 100);
        });
        
        // Settings
        document.getElementById('settingsCancel').addEventListener('click', () => {
            this.settingsOverlay.style.display = 'none';
        });
        
        document.getElementById('settingsSave').addEventListener('click', () => {
            this.guardarRango();
        });
        
        // Cerrar settings con clic fuera
        this.settingsOverlay.addEventListener('click', (e) => {
            if (e.target === this.settingsOverlay) {
                this.settingsOverlay.style.display = 'none';
            }
        });
        
        // Teclado - R para reiniciar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                if (!this.victoryOverlay.style.display || this.victoryOverlay.style.display === 'none') {
                    this.nuevoJuego();
                }
            }
        });
    }
    
    nuevoJuego() {
        // Generar número secreto
        this.secretNumber = Math.floor(Math.random() * (this.maxRange - this.minRange + 1)) + this.minRange;
        this.attempts = 0;
        this.gameOver = false;
        this.history = [];
        this.seconds = 0;
        this.startTime = null;
        
        // Limpiar timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Actualizar UI
        this.secretDisplay.textContent = '?';
        this.secretDisplay.className = 'secret-number';
        this.hintText.textContent = `💡 Ingresa un número entre ${this.minRange} y ${this.maxRange}`;
        this.hintText.className = 'hint-text';
        this.attemptsDisplay.textContent = '0';
        this.statusIndicator.textContent = '🟢 Jugando';
        this.statusIndicator.style.color = '#28A745';
        this.guessInput.value = '';
        this.guessInput.disabled = false;
        this.guessBtn.disabled = false;
        this.guessInput.focus();
        
        // Actualizar rango
        this.minRangeDisplay.textContent = this.minRange;
        this.maxRangeDisplay.textContent = this.maxRange;
        this.secretRangeDisplay.textContent = `${this.minRange}-${this.maxRange}`;
        
        // Limpiar historial
        this.historyList.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-hourglass-start"></i>
                <p>No hay intentos aún</p>
            </div>
        `;
        
        // Ocultar victoria
        this.victoryOverlay.style.display = 'none';
    }
    
    adivinar() {
        if (this.gameOver) return;
        
        const guess = parseInt(this.guessInput.value);
        
        // Validación
        if (isNaN(guess) || guess < this.minRange || guess > this.maxRange) {
            this.hintText.textContent = `⚠️ Ingresa un número entre ${this.minRange} y ${this.maxRange}`;
            this.hintText.className = 'hint-text error';
            this.guessInput.value = '';
            this.guessInput.focus();
            return;
        }
        
        // Iniciar timer en el primer intento válido
        if (!this.startTime) {
            this.startTime = Date.now();
            this.timerInterval = setInterval(() => {
                this.seconds++;
            }, 1000);
        }
        
        // Registrar intento
        this.attempts++;
        this.attemptsDisplay.textContent = this.attempts;
        this.guessInput.value = '';
        
        // Verificar
        let result = '';
        let resultClass = '';
        
        if (guess === this.secretNumber) {
            result = '🎯 ¡Correcto!';
            resultClass = 'correct';
            this.ganarJuego();
        } else if (guess < this.secretNumber) {
            result = '📈 Más alto';
            resultClass = 'low';
        } else {
            result = '📉 Más bajo';
            resultClass = 'high';
        }
        
        // Agregar al historial
        this.history.push({ number: guess, result, resultClass });
        this.renderizarHistorial();
        
        // Actualizar hint
        if (!this.gameOver) {
            this.hintText.textContent = result;
            this.hintText.className = `hint-text ${resultClass}`;
        }
        
        // Enfocar input
        this.guessInput.focus();
    }
    
    ganarJuego() {
        this.gameOver = true;
        this.guessInput.disabled = true;
        this.guessBtn.disabled = true;
        
        // Detener timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Mostrar número secreto
        this.secretDisplay.textContent = this.secretNumber;
        this.secretDisplay.className = 'secret-number revealed';
        this.statusIndicator.textContent = '🏆 Ganaste';
        this.statusIndicator.style.color = '#FFC107';
        this.hintText.textContent = '🎉 ¡Felicidades! Has adivinado el número';
        this.hintText.className = 'hint-text success';
        
        // Actualizar high score
        if (this.attempts < this.highScore || this.highScore === 0) {
            this.highScore = this.attempts;
            localStorage.setItem('guessGameHighScore', this.highScore);
            this.highScoreDisplay.textContent = this.highScore;
        }
        
        // Mostrar overlay de victoria
        setTimeout(() => {
            this.victoryNumber.textContent = this.secretNumber;
            this.victoryAttempts.textContent = this.attempts;
            this.victoryTime.textContent = this.formatearTiempo(this.seconds);
            
            // Mensaje personalizado
            let message = '';
            if (this.attempts <= 5) {
                message = '⭐ ¡Excelente! Eres un genio de las adivinanzas';
            } else if (this.attempts <= 10) {
                message = '👍 ¡Muy bien! Has hecho un gran trabajo';
            } else if (this.attempts <= 15) {
                message = '💪 Buen intento, sigue practicando';
            } else {
                message = '🤔 No te rindas, la práctica hace al maestro';
            }
            this.victoryMessage.textContent = message;
            
            this.victoryOverlay.style.display = 'flex';
        }, 500);
    }
    
    renderizarHistorial() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-hourglass-start"></i>
                    <p>No hay intentos aún</p>
                </div>
            `;
            return;
        }
        
        this.historyList.innerHTML = this.history.map((item, index) => `
            <div class="history-item">
                <span class="number">#${index + 1}: ${item.number}</span>
                <span class="result ${item.resultClass}">${item.result}</span>
            </div>
        `).join('');
        
        // Scroll al último elemento
        this.historyList.scrollTop = this.historyList.scrollHeight;
    }
    
    cargarHighScore() {
        this.highScoreDisplay.textContent = this.highScore;
    }
    
    guardarRango() {
        const min = parseInt(this.minRangeInput.value);
        const max = parseInt(this.maxRangeInput.value);
        
        // Validaciones
        if (isNaN(min) || isNaN(max) || min >= max || min < 1) {
            this.hintText.textContent = '⚠️ Rango inválido. El mínimo debe ser menor que el máximo y mayor a 0';
            this.hintText.className = 'hint-text error';
            return;
        }
        
        if (max - min < 5) {
            this.hintText.textContent = '⚠️ El rango debe tener al menos 5 números de diferencia';
            this.hintText.className = 'hint-text error';
            return;
        }
        
        this.minRange = min;
        this.maxRange = max;
        this.settingsOverlay.style.display = 'none';
        this.nuevoJuego();
    }
    
    formatearTiempo(segundos) {
        const mins = Math.floor(segundos / 60);
        const secs = segundos % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', () => {
    new GuessGame();
});
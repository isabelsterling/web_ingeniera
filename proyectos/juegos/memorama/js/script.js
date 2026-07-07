/**
 * 🎴 JUEGO DE MEMORAMA
 * Encuentra todas las parejas de emojis
 */

class MemoramaGame {
    constructor() {
        // Configuración
        this.boardSize = 4; // 4x4 por defecto
        this.emojis = [
            '🚀', '🌈', '🎮', '🎯', '🎨', '🎵', '📚', '🧠',
            '💻', '🤖', '🦄', '🍕', '🎸', '🏆', '🚗', '🌺',
            '🐉', '⚡', '🍀', '🌍', '🎭', '🎪', '🏀', '🎱'
        ];
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.attempts = 0;
        this.isLocked = false;
        this.timerInterval = null;
        this.seconds = 0;
        this.gameStarted = false;
        
        // High score por dificultad
        this.highScores = {
            4: parseInt(localStorage.getItem('memorama_high_4')) || 0,
            6: parseInt(localStorage.getItem('memorama_high_6')) || 0,
            8: parseInt(localStorage.getItem('memorama_high_8')) || 0
        };
        
        // Elementos DOM
        this.board = document.getElementById('board');
        this.pairsFoundDisplay = document.getElementById('pairsFound');
        this.attemptsDisplay = document.getElementById('attempts');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.highScoreDisplay = document.getElementById('highScore');
        this.victoryOverlay = document.getElementById('victoryOverlay');
        this.victoryAttempts = document.getElementById('victoryAttempts');
        this.victoryTime = document.getElementById('victoryTime');
        this.diffBtns = document.querySelectorAll('.diff-btn');
        
        // Inicializar
        this.init();
    }
    
    init() {
        this.eventListeners();
        this.cargarHighScore();
        this.iniciarJuego();
    }
    
    eventListeners() {
        // Botones de dificultad
        this.diffBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.diffBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.boardSize = parseInt(btn.dataset.size);
                this.iniciarJuego();
            });
        });
        
        // Botón reiniciar
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.iniciarJuego();
        });
        
        // Botón jugar de nuevo
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.iniciarJuego();
        });
        
        // Teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.iniciarJuego();
            }
        });
    }
    
    cargarHighScore() {
        const high = this.highScores[this.boardSize] || 0;
        this.highScoreDisplay.textContent = high;
    }
    
    iniciarJuego() {
        // Detener timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Resetear estado
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = (this.boardSize * this.boardSize) / 2;
        this.attempts = 0;
        this.seconds = 0;
        this.isLocked = false;
        this.gameStarted = false;
        this.victoryOverlay.style.display = 'none';
        
        // Actualizar UI
        this.pairsFoundDisplay.textContent = '0';
        this.attemptsDisplay.textContent = '0';
        this.timerDisplay.textContent = '00:00';
        this.cargarHighScore();
        
        // Generar cartas
        this.generarCartas();
        this.renderizarTablero();
    }
    
    generarCartas() {
        const totalCards = this.boardSize * this.boardSize;
        const pairsNeeded = totalCards / 2;
        
        // Seleccionar emojis aleatorios
        const shuffledEmojis = [...this.emojis].sort(() => Math.random() - 0.5);
        const selectedEmojis = shuffledEmojis.slice(0, pairsNeeded);
        
        // Crear parejas y mezclar
        let cards = [];
        selectedEmojis.forEach(emoji => {
            cards.push({ id: Math.random().toString(36).substr(2, 9), emoji, matched: false });
            cards.push({ id: Math.random().toString(36).substr(2, 9), emoji, matched: false });
        });
        
        // Mezclar cartas
        this.cards = cards.sort(() => Math.random() - 0.5);
    }
    
    renderizarTablero() {
        this.board.innerHTML = '';
        this.board.dataset.size = this.boardSize;
        
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.index = index;
            
            // Parte frontal (contenido)
            const front = document.createElement('div');
            front.className = 'card-front';
            front.textContent = card.emoji;
            
            // Parte trasera (dorso)
            const back = document.createElement('div');
            back.className = 'card-back';
            
            cardElement.appendChild(front);
            cardElement.appendChild(back);
            
            cardElement.addEventListener('click', () => this.seleccionarCarta(index));
            
            this.board.appendChild(cardElement);
        });
    }
    
    seleccionarCarta(index) {
        // Validaciones
        if (this.isLocked) return;
        if (this.cards[index].matched) return;
        
        const cardElement = this.board.children[index];
        if (cardElement.classList.contains('flipped')) return;
        
        // Iniciar timer en el primer click
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.iniciarTimer();
        }
        
        // Voltear carta
        cardElement.classList.add('flipped');
        this.flippedCards.push(index);
        
        // Si hay dos cartas volteadas
        if (this.flippedCards.length === 2) {
            this.attempts++;
            this.attemptsDisplay.textContent = this.attempts;
            this.verificarPareja();
        }
    }
    
    verificarPareja() {
        this.isLocked = true;
        
        const index1 = this.flippedCards[0];
        const index2 = this.flippedCards[1];
        const card1 = this.cards[index1];
        const card2 = this.cards[index2];
        const element1 = this.board.children[index1];
        const element2 = this.board.children[index2];
        
        if (card1.emoji === card2.emoji && index1 !== index2) {
            // ¡Pareja encontrada!
            setTimeout(() => {
                card1.matched = true;
                card2.matched = true;
                element1.classList.add('matched');
                element2.classList.add('matched');
                
                this.matchedPairs++;
                this.pairsFoundDisplay.textContent = this.matchedPairs;
                
                this.flippedCards = [];
                this.isLocked = false;
                
                // Verificar victoria
                if (this.matchedPairs === this.totalPairs) {
                    this.ganarJuego();
                }
            }, 400);
        } else {
            // No coinciden
            setTimeout(() => {
                element1.classList.remove('flipped');
                element2.classList.remove('flipped');
                this.flippedCards = [];
                this.isLocked = false;
            }, 600);
        }
    }
    
    iniciarTimer() {
        this.seconds = 0;
        this.timerInterval = setInterval(() => {
            this.seconds++;
            this.timerDisplay.textContent = this.formatearTiempo(this.seconds);
        }, 1000);
    }
    
    formatearTiempo(segundos) {
        const mins = Math.floor(segundos / 60);
        const secs = segundos % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    ganarJuego() {
        // Detener timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Actualizar high score (menos intentos y menos tiempo = mejor)
        const currentHigh = this.highScores[this.boardSize] || 0;
        const score = this.attempts;
        
        // Guardar high score si es mejor (menos intentos)
        if (currentHigh === 0 || score < currentHigh) {
            this.highScores[this.boardSize] = score;
            localStorage.setItem(`memorama_high_${this.boardSize}`, score);
            this.cargarHighScore();
        }
        
        // Mostrar overlay de victoria
        this.victoryAttempts.textContent = this.attempts;
        this.victoryTime.textContent = this.formatearTiempo(this.seconds);
        this.victoryOverlay.style.display = 'flex';
    }
}

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', () => {
    new MemoramaGame();
});
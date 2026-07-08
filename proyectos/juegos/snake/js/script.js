/**
 * 🐍 JUEGO DE SNAKE
 * Clásico juego de la serpiente con controles de teclado y táctiles
 */

class SnakeGame {
    constructor() {
        // Canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Tamaño del tablero
        this.gridSize = 20;
        this.tileCount = 20;
        this.canvasSize = 400;
        
        // Estado del juego
        this.snake = [];
        this.food = {};
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.speed = 100; // ms entre frames
        this.speedLevels = {
            'Lento': 150,
            'Normal': 100,
            'Rápido': 65,
            'Muy Rápido': 40
        };
        this.speedNames = ['Lento', 'Normal', 'Rápido', 'Muy Rápido'];
        this.currentSpeedIndex = 1;
        this.gameLoop = null;
        
        // Elementos DOM
        this.scoreDisplay = document.getElementById('score');
        this.lengthDisplay = document.getElementById('length');
        this.speedDisplay = document.getElementById('speedDisplay');
        this.highScoreDisplay = document.getElementById('highScore');
        this.finalScoreDisplay = document.getElementById('finalScore');
        this.finalLengthDisplay = document.getElementById('finalLength');
        this.pauseOverlay = document.getElementById('pauseOverlay');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        
        // Inicializar
        this.init();
    }
    
    init() {
        // Mostrar high score
        this.highScoreDisplay.textContent = this.highScore;
        this.speedDisplay.textContent = this.speedNames[this.currentSpeedIndex];
        
        // Event listeners
        this.eventListeners();
        
        // Iniciar juego
        this.reset();
        this.start();
    }
    
    eventListeners() {
        // Teclado
        document.addEventListener('keydown', (e) => {
            const key = e.key;
            
            // Pausa con espacio
            if (key === ' ' || key === 'Space') {
                e.preventDefault();
                this.togglePause();
                return;
            }
            
            // Reiniciar con R
            if (key === 'r' || key === 'R') {
                this.reset();
                if (!this.gameRunning || this.gameOver) {
                    this.start();
                }
                return;
            }
            
            // Direcciones
            if (this.gamePaused || this.gameOver || !this.gameRunning) return;
            
            switch(key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    if (this.direction.y !== 1) {
                        this.nextDirection = { x: 0, y: -1 };
                    }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    if (this.direction.y !== -1) {
                        this.nextDirection = { x: 0, y: 1 };
                    }
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    if (this.direction.x !== 1) {
                        this.nextDirection = { x: -1, y: 0 };
                    }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    if (this.direction.x !== -1) {
                        this.nextDirection = { x: 1, y: 0 };
                    }
                    break;
            }
        });
        
        // Botones de control
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.reset();
            if (!this.gameRunning || this.gameOver) {
                this.start();
            }
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.reset();
            this.start();
        });
        
        document.getElementById('speedToggle').addEventListener('click', () => {
            this.cycleSpeed();
        });
        
        // Controles táctiles
        document.querySelectorAll('.touch-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.handleTouchDirection(direction);
            });
            
            // Para dispositivos táctiles, prevenir scroll
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.handleTouchDirection(direction);
            });
        });
        
        // Cerrar overlays con clic fuera
        this.pauseOverlay.addEventListener('click', (e) => {
            if (e.target === this.pauseOverlay) {
                this.togglePause();
            }
        });
        
        this.gameOverOverlay.addEventListener('click', (e) => {
            if (e.target === this.gameOverOverlay) {
                this.reset();
                this.start();
            }
        });
    }
    
    handleTouchDirection(direction) {
        if (this.gamePaused || this.gameOver || !this.gameRunning) return;
        
        switch(direction) {
            case 'up':
                if (this.direction.y !== 1) {
                    this.nextDirection = { x: 0, y: -1 };
                }
                break;
            case 'down':
                if (this.direction.y !== -1) {
                    this.nextDirection = { x: 0, y: 1 };
                }
                break;
            case 'left':
                if (this.direction.x !== 1) {
                    this.nextDirection = { x: -1, y: 0 };
                }
                break;
            case 'right':
                if (this.direction.x !== -1) {
                    this.nextDirection = { x: 1, y: 0 };
                }
                break;
        }
    }
    
    togglePause() {
        if (this.gameOver || !this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        this.pauseOverlay.style.display = this.gamePaused ? 'flex' : 'none';
        document.getElementById('pauseBtn').innerHTML = this.gamePaused ? 
            '<i class="fas fa-play"></i>' : 
            '<i class="fas fa-pause"></i>';
    }
    
    cycleSpeed() {
        this.currentSpeedIndex = (this.currentSpeedIndex + 1) % this.speedNames.length;
        this.speed = this.speedLevels[this.speedNames[this.currentSpeedIndex]];
        this.speedDisplay.textContent = this.speedNames[this.currentSpeedIndex];
        
        // Reiniciar el loop con nueva velocidad
        if (this.gameRunning && !this.gamePaused && !this.gameOver) {
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.speed);
        }
    }
    
    reset() {
        // Detener loop
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        // Resetear estado
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        
        // Ocultar overlays
        this.pauseOverlay.style.display = 'none';
        this.gameOverOverlay.style.display = 'none';
        document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
        
        // Generar comida
        this.generateFood();
        
        // Actualizar UI
        this.updateUI();
        this.draw();
    }
    
    start() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gameOver = false;
        this.gamePaused = false;
        this.pauseOverlay.style.display = 'none';
        this.gameOverOverlay.style.display = 'none';
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        
        this.gameLoop = setInterval(() => this.update(), this.speed);
    }
    
    generateFood() {
        let newFood;
        let valid = false;
        
        while (!valid) {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            
            valid = !this.snake.some(segment => 
                segment.x === newFood.x && segment.y === newFood.y
            );
        }
        
        this.food = newFood;
    }
    
    update() {
        if (this.gamePaused || this.gameOver || !this.gameRunning) return;
        
        // Actualizar dirección
        this.direction = { ...this.nextDirection };
        
        // Calcular nueva cabeza
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Verificar colisión con paredes
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.endGame();
            return;
        }
        
        // Verificar colisión con sí misma
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.endGame();
            return;
        }
        
        // Agregar nueva cabeza
        this.snake.unshift(head);
        
        // Verificar si comió comida
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.generateFood();
            this.updateUI();
        } else {
            // Eliminar cola si no comió
            this.snake.pop();
        }
        
        // Actualizar UI
        this.updateUI();
        this.draw();
    }
    
    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        // Actualizar high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.highScoreDisplay.textContent = this.highScore;
        }
        
        // Mostrar game over
        this.finalScoreDisplay.textContent = this.score;
        this.finalLengthDisplay.textContent = this.snake.length;
        this.gameOverOverlay.style.display = 'flex';
        
        this.draw();
    }
    
    updateUI() {
        this.scoreDisplay.textContent = this.score;
        this.lengthDisplay.textContent = this.snake.length;
        this.highScoreDisplay.textContent = this.highScore;
    }
    
    draw() {
        const ctx = this.ctx;
        const tileSize = this.canvasSize / this.tileCount;
        
        // Limpiar canvas
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        
        // Dibujar grid (sutil)
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * tileSize, 0);
            ctx.lineTo(i * tileSize, this.canvasSize);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * tileSize);
            ctx.lineTo(this.canvasSize, i * tileSize);
            ctx.stroke();
        }
        
        // Dibujar comida
        ctx.shadowColor = '#FF6584';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#FF6584';
        ctx.beginPath();
        ctx.arc(
            this.food.x * tileSize + tileSize / 2,
            this.food.y * tileSize + tileSize / 2,
            tileSize / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Dibujar serpiente
        this.snake.forEach((segment, index) => {
            const x = segment.x * tileSize;
            const y = segment.y * tileSize;
            const padding = index === 0 ? 1 : 2;
            const radius = 4;
            
            // Color: gradiente de verde a morado
            const ratio = index / this.snake.length;
            const r = Math.round(40 + ratio * 60);
            const g = Math.round(200 - ratio * 100);
            const b = Math.round(120 + ratio * 80);
            
            ctx.shadowColor = 'rgba(108, 99, 255, 0.3)';
            ctx.shadowBlur = index === 0 ? 15 : 5;
            
            // Redondear esquinas
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + tileSize - radius, y);
            ctx.quadraticCurveTo(x + tileSize, y, x + tileSize, y + radius);
            ctx.lineTo(x + tileSize, y + tileSize - radius);
            ctx.quadraticCurveTo(x + tileSize, y + tileSize, x + tileSize - radius, y + tileSize);
            ctx.lineTo(x + radius, y + tileSize);
            ctx.quadraticCurveTo(x, y + tileSize, x, y + tileSize - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
            
            // Ojos en la cabeza
            if (index === 0) {
                ctx.shadowBlur = 0;
                ctx.fillStyle = 'white';
                const eyeSize = 4;
                let eyeX1, eyeY1, eyeX2, eyeY2;
                
                if (this.direction.x === 1) {
                    eyeX1 = x + tileSize - 8;
                    eyeY1 = y + 5;
                    eyeX2 = x + tileSize - 8;
                    eyeY2 = y + tileSize - 5;
                } else if (this.direction.x === -1) {
                    eyeX1 = x + 8;
                    eyeY1 = y + 5;
                    eyeX2 = x + 8;
                    eyeY2 = y + tileSize - 5;
                } else if (this.direction.y === -1) {
                    eyeX1 = x + 5;
                    eyeY1 = y + 8;
                    eyeX2 = x + tileSize - 5;
                    eyeY2 = y + 8;
                } else {
                    eyeX1 = x + 5;
                    eyeY1 = y + tileSize - 8;
                    eyeX2 = x + tileSize - 5;
                    eyeY2 = y + tileSize - 8;
                }
                
                ctx.beginPath();
                ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Pupilas
                ctx.fillStyle = '#1a1a2e';
                const pupilSize = 2;
                ctx.beginPath();
                ctx.arc(eyeX1 + this.direction.x * 2, eyeY1 + this.direction.y * 2, pupilSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(eyeX2 + this.direction.x * 2, eyeY2 + this.direction.y * 2, pupilSize, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        ctx.shadowBlur = 0;
    }
}

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
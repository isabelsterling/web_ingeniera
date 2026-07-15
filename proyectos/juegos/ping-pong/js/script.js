/**
 * 🏓 JUEGO DE PING PONG
 * Tenis de mesa contra IA o multijugador
 */

class PingPongGame {
    constructor() {
        // Canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Dimensiones
        this.width = 800;
        this.height = 500;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Configuración
        this.winScore = 5;
        this.mode = 'ai'; // 'ai' o 'pvp'
        this.gamePaused = false;
        this.gameOver = false;
        this.gameRunning = false;
        this.animationId = null;
        
        // Jugadores
        this.player1 = {
            x: 20,
            y: this.height / 2 - 50,
            width: 12,
            height: 100,
            speed: 6,
            score: 0,
            color: '#6C63FF'
        };
        
        this.player2 = {
            x: this.width - 20 - 12,
            y: this.height / 2 - 50,
            width: 12,
            height: 100,
            speed: 6,
            score: 0,
            color: '#FF6584'
        };
        
        // Pelota
        this.ball = {
            x: this.width / 2,
            y: this.height / 2,
            radius: 8,
            speedX: 4,
            speedY: 3,
            baseSpeed: 4,
            maxSpeed: 10
        };
        
        // IA
        this.ai = {
            speed: 4,
            reactionDelay: 0,
            reactionTimer: 0,
            difficulty: 0.7 // 0-1, más alto = más difícil
        };
        
        // Teclas presionadas
        this.keys = {
            w: false,
            s: false,
            arrowup: false,
            arrowdown: false
        };
        
        // Elementos DOM
        this.player1ScoreDisplay = document.getElementById('player1Score');
        this.player2ScoreDisplay = document.getElementById('player2Score');
        this.finalScore1Display = document.getElementById('finalScore1');
        this.finalScore2Display = document.getElementById('finalScore2');
        this.winnerText = document.getElementById('winnerText');
        this.pauseOverlay = document.getElementById('pauseOverlay');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.player2Label = document.getElementById('player2Label');
        this.modeBtns = document.querySelectorAll('.mode-btn');
        
        // Inicializar
        this.init();
    }
    
    init() {
        this.eventListeners();
        this.reset();
        this.start();
    }
    
    eventListeners() {
        // Teclado
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            
            // Pausa
            if (key === ' ' || key === 'space') {
                e.preventDefault();
                this.togglePause();
                return;
            }
            
            // Reiniciar
            if (key === 'r') {
                this.resetGame();
                return;
            }
            
            // Controles Jugador 1
            if (key === 'w') {
                this.keys.w = true;
                e.preventDefault();
            }
            if (key === 's') {
                this.keys.s = true;
                e.preventDefault();
            }
            
            // Controles Jugador 2
            if (key === 'arrowup') {
                this.keys.arrowup = true;
                e.preventDefault();
            }
            if (key === 'arrowdown') {
                this.keys.arrowdown = true;
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            
            if (key === 'w') this.keys.w = false;
            if (key === 's') this.keys.s = false;
            if (key === 'arrowup') this.keys.arrowup = false;
            if (key === 'arrowdown') this.keys.arrowdown = false;
        });
        
        // Botones
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.resetGame();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.resetGame();
        });
        
        // Modos
        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.mode = btn.dataset.mode;
                this.player2Label.textContent = this.mode === 'ai' ? 'IA' : 'Jugador 2';
                this.resetGame();
            });
        });
        
        // Controles táctiles
        document.getElementById('touchUp1').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.w = true;
        });
        document.getElementById('touchUp1').addEventListener('touchend', () => {
            this.keys.w = false;
        });
        
        document.getElementById('touchDown1').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.s = true;
        });
        document.getElementById('touchDown1').addEventListener('touchend', () => {
            this.keys.s = false;
        });
        
        document.getElementById('touchUp2').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.arrowup = true;
        });
        document.getElementById('touchUp2').addEventListener('touchend', () => {
            this.keys.arrowup = false;
        });
        
        document.getElementById('touchDown2').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.arrowdown = true;
        });
        document.getElementById('touchDown2').addEventListener('touchend', () => {
            this.keys.arrowdown = false;
        });
        
        // Click en canvas para pausa
        this.canvas.addEventListener('click', () => {
            if (!this.gameOver && this.gameRunning) {
                this.togglePause();
            }
        });
        
        // Cerrar overlays
        this.pauseOverlay.addEventListener('click', (e) => {
            if (e.target === this.pauseOverlay) {
                this.togglePause();
            }
        });
    }
    
    togglePause() {
        if (this.gameOver || !this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        this.pauseOverlay.style.display = this.gamePaused ? 'flex' : 'none';
        document.getElementById('pauseBtn').innerHTML = this.gamePaused ? 
            '<i class="fas fa-play"></i>' : 
            '<i class="fas fa-pause"></i>';
    }
    
    reset() {
        // Resetear posiciones
        this.player1.y = this.height / 2 - 50;
        this.player2.y = this.height / 2 - 50;
        this.player1.score = 0;
        this.player2.score = 0;
        
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2;
        this.ball.speedX = this.ball.baseSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.speedY = (Math.random() - 0.5) * 4;
        
        this.gameOver = false;
        this.gamePaused = false;
        this.gameOverOverlay.style.display = 'none';
        this.pauseOverlay.style.display = 'none';
        document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
        
        this.updateScore();
    }
    
    resetGame() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.gameRunning = false;
        this.reset();
        this.start();
    }
    
    start() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gameOver = false;
        this.gamePaused = false;
        this.pauseOverlay.style.display = 'none';
        this.gameOverOverlay.style.display = 'none';
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        if (this.gamePaused || this.gameOver) return;
        
        // ===== MOVIMIENTO JUGADOR 1 =====
        if (this.keys.w && this.player1.y > 0) {
            this.player1.y -= this.player1.speed;
        }
        if (this.keys.s && this.player1.y + this.player1.height < this.height) {
            this.player1.y += this.player1.speed;
        }
        
        // ===== MOVIMIENTO JUGADOR 2 =====
        if (this.mode === 'pvp') {
            // Control manual
            if (this.keys.arrowup && this.player2.y > 0) {
                this.player2.y -= this.player2.speed;
            }
            if (this.keys.arrowdown && this.player2.y + this.player2.height < this.height) {
                this.player2.y += this.player2.speed;
            }
        } else {
            // IA
            this.updateAI();
        }
        
        // ===== MOVIMIENTO PELOTA =====
        this.ball.x += this.ball.speedX;
        this.ball.y += this.ball.speedY;
        
        // Colisión con paredes superior e inferior
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.y = this.ball.radius;
            this.ball.speedY = -this.ball.speedY;
        }
        if (this.ball.y + this.ball.radius > this.height) {
            this.ball.y = this.height - this.ball.radius;
            this.ball.speedY = -this.ball.speedY;
        }
        
        // Colisión con pala del jugador 1
        if (this.ball.x - this.ball.radius < this.player1.x + this.player1.width &&
            this.ball.x + this.ball.radius > this.player1.x &&
            this.ball.y > this.player1.y &&
            this.ball.y < this.player1.y + this.player1.height) {
            
            this.ball.speedX = Math.abs(this.ball.speedX);
            this.ball.x = this.player1.x + this.player1.width + this.ball.radius;
            
            // Cambiar ángulo según donde golpeó
            const hitPos = (this.ball.y - this.player1.y) / this.player1.height;
            this.ball.speedY = (hitPos - 0.5) * 8;
            
            // Aumentar velocidad
            this.increaseSpeed();
        }
        
        // Colisión con pala del jugador 2
        if (this.ball.x + this.ball.radius > this.player2.x &&
            this.ball.x - this.ball.radius < this.player2.x + this.player2.width &&
            this.ball.y > this.player2.y &&
            this.ball.y < this.player2.y + this.player2.height) {
            
            this.ball.speedX = -Math.abs(this.ball.speedX);
            this.ball.x = this.player2.x - this.ball.radius;
            
            const hitPos = (this.ball.y - this.player2.y) / this.player2.height;
            this.ball.speedY = (hitPos - 0.5) * 8;
            
            this.increaseSpeed();
        }
        
        // Punto para jugador 1
        if (this.ball.x + this.ball.radius > this.width) {
            this.player1.score++;
            this.updateScore();
            this.checkWin();
            if (!this.gameOver) this.resetBall();
        }
        
        // Punto para jugador 2
        if (this.ball.x - this.ball.radius < 0) {
            this.player2.score++;
            this.updateScore();
            this.checkWin();
            if (!this.gameOver) this.resetBall();
        }
    }
    
    updateAI() {
        const ai = this.ai;
        const player2 = this.player2;
        const ball = this.ball;
        
        // Calcular hacia dónde debe moverse
        const targetY = ball.y - player2.height / 2;
        const diff = targetY - player2.y;
        
        // Añadir retraso y dificultad
        ai.reactionTimer++;
        if (ai.reactionTimer > ai.reactionDelay) {
            ai.reactionTimer = 0;
            
            // Movimiento con cierta imperfección
            const moveAmount = Math.abs(diff) * ai.difficulty;
            const moveSpeed = Math.min(moveAmount, ai.speed);
            
            if (Math.abs(diff) > 10) {
                player2.y += Math.sign(diff) * moveSpeed;
            }
        }
        
        // Ajustar dificultad según la velocidad de la pelota
        const ballSpeed = Math.abs(ball.speedX);
        ai.speed = 4 + (ballSpeed - 4) * 0.3;
        ai.reactionDelay = Math.floor(10 - 8 * ai.difficulty);
        
        // Limitar posición
        player2.y = Math.max(0, Math.min(this.height - player2.height, player2.y));
        
        // Si la pelota va hacia el jugador 1, la IA se relaja un poco
        if (ball.speedX < 0) {
            // La IA se mueve más lento cuando la pelota no viene hacia ella
            ai.speed *= 0.7;
        }
    }
    
    increaseSpeed() {
        // Aumentar velocidad gradualmente
        const speed = Math.sqrt(this.ball.speedX * this.ball.speedX + this.ball.speedY * this.ball.speedY);
        if (speed < this.ball.maxSpeed) {
            const factor = 1.05;
            this.ball.speedX *= factor;
            this.ball.speedY *= factor;
            
            // Limitar velocidad máxima
            const newSpeed = Math.sqrt(this.ball.speedX * this.ball.speedX + this.ball.speedY * this.ball.speedY);
            if (newSpeed > this.ball.maxSpeed) {
                const ratio = this.ball.maxSpeed / newSpeed;
                this.ball.speedX *= ratio;
                this.ball.speedY *= ratio;
            }
        }
    }
    
    resetBall() {
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2;
        this.ball.speedX = this.ball.baseSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.speedY = (Math.random() - 0.5) * 4;
    }
    
    checkWin() {
        if (this.player1.score >= this.winScore) {
            this.gameOver = true;
            this.winnerText.textContent = '🏆 ¡Jugador 1 Gana!';
            this.showGameOver();
        } else if (this.player2.score >= this.winScore) {
            this.gameOver = true;
            this.winnerText.textContent = this.mode === 'ai' ? '🤖 ¡La IA Gana!' : '🏆 ¡Jugador 2 Gana!';
            this.showGameOver();
        }
    }
    
    showGameOver() {
        this.finalScore1Display.textContent = this.player1.score;
        this.finalScore2Display.textContent = this.player2.score;
        this.gameOverOverlay.style.display = 'flex';
        this.gameRunning = false;
    }
    
    updateScore() {
        this.player1ScoreDisplay.textContent = this.player1.score;
        this.player2ScoreDisplay.textContent = this.player2.score;
    }
    
    draw() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        
        // ===== FONDO =====
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, w, h);
        
        // Línea central
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 15]);
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.stroke();
        ctx.setLineDash([]);

        // Círculo central
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 60, 0, Math.PI * 2);
        ctx.stroke();

        // ===== JUGADORES =====
        // Sombra jugador 1
        ctx.shadowColor = 'rgba(108, 99, 255, 0.3)';
        ctx.shadowBlur = 15;
        ctx.fillStyle = this.player1.color;
        ctx.fillRect(this.player1.x, this.player1.y, this.player1.width, this.player1.height);
        ctx.shadowBlur = 0;

        // Sombra jugador 2
        ctx.shadowColor = 'rgba(255, 101, 132, 0.3)';
        ctx.shadowBlur = 15;
        ctx.fillStyle = this.player2.color;
        ctx.fillRect(this.player2.x, this.player2.y, this.player2.width, this.player2.height);
        ctx.shadowBlur = 0;

        // ===== PELOTA =====
        // Sombra de la pelota
        ctx.shadowColor = 'rgba(255,255,255,0.2)';
        ctx.shadowBlur = 20;
        
        // Gradiente de la pelota
        const gradient = ctx.createRadialGradient(
            this.ball.x - 3, this.ball.y - 3, 2,
            this.ball.x, this.ball.y, this.ball.radius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#e0e0e0');
        gradient.addColorStop(1, '#a0a0a0');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Brillo de la pelota
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(this.ball.x - 2, this.ball.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();

        // ===== EFECTO DE ESTELA (si la pelota va rápido) =====
        const speed = Math.sqrt(this.ball.speedX * this.ball.speedX + this.ball.speedY * this.ball.speedY);
        if (speed > 7) {
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            for (let i = 1; i <= 3; i++) {
                const trailX = this.ball.x - this.ball.speedX * i * 2;
                const trailY = this.ball.y - this.ball.speedY * i * 2;
                const radius = this.ball.radius - i * 1.5;
                if (radius > 1) {
                    ctx.beginPath();
                    ctx.arc(trailX, trailY, radius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // ===== MARCADOR EN EL CANVAS =====
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.font = 'bold 60px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(this.player1.score, w / 2 - 60, 20);
        ctx.fillText(this.player2.score, w / 2 + 60, 20);

        // ===== MENSAJE DE INICIO (si no hay movimiento) =====
        if (!this.gameRunning && !this.gameOver) {
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.font = '20px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Presiona "Jugar" para comenzar', w / 2, h / 2 - 30);
        }
    }
}

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', () => {
    new PingPongGame();
});
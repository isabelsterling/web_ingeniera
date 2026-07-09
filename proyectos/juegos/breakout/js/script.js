/**
 * 🧱 BREAKOUT
 * Rompe todos los ladrillos con la pelota
 */

class BreakoutGame {
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
        this.paddleWidth = 100;
        this.paddleHeight = 14;
        this.ballRadius = 8;
        this.brickRows = 5;
        this.brickCols = 8;
        this.brickWidth = 0;
        this.brickHeight = 0;
        this.brickPadding = 4;
        this.brickOffsetTop = 40;
        this.brickOffsetLeft = 0;
        
        // Estado del juego
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.highScore = parseInt(localStorage.getItem('breakoutHighScore')) || 0;
        this.gameState = 'start'; // 'start', 'playing', 'paused', 'gameover', 'victory'
        this.animationId = null;
        this.combo = 0;
        
        // Jugador
        this.paddle = {
            x: this.width / 2 - this.paddleWidth / 2,
            y: this.height - 40,
            width: this.paddleWidth,
            height: this.paddleHeight,
            speed: 8
        };
        
        // Pelota
        this.ball = {
            x: this.width / 2,
            y: this.height - 40 - this.ballRadius - 5,
            radius: this.ballRadius,
            speedX: 4,
            speedY: -4,
            baseSpeed: 4,
            stuck: true // Pegada a la paleta
        };
        
        // Ladrillos
        this.bricks = [];
        this.brickColors = [
            '#FF6584', '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF',
            '#FF6584', '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF'
        ];
        
        // Teclas
        this.keys = {
            left: false,
            right: false
        };
        
        // Elementos DOM
        this.scoreDisplay = document.getElementById('score');
        this.livesDisplay = document.getElementById('lives');
        this.levelDisplay = document.getElementById('level');
        this.highScoreDisplay = document.getElementById('highScore');
        this.finalScoreDisplay = document.getElementById('finalScore');
        this.finalLevelDisplay = document.getElementById('finalLevel');
        this.victoryScoreDisplay = document.getElementById('victoryScore');
        this.victoryLevelDisplay = document.getElementById('victoryLevel');
        this.startOverlay = document.getElementById('startOverlay');
        this.pauseOverlay = document.getElementById('pauseOverlay');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.victoryOverlay = document.getElementById('victoryOverlay');
        
        // Inicializar
        this.init();
    }
    
    init() {
        this.highScoreDisplay.textContent = this.highScore;
        this.calcularDimensionesLadrillos();
        this.eventListeners();
        this.renderizarLadrillos();
        this.draw();
    }
    
    calcularDimensionesLadrillos() {
        this.brickWidth = (this.width - (this.brickCols + 1) * this.brickPadding) / this.brickCols;
        this.brickHeight = 20;
        this.brickOffsetLeft = (this.width - (this.brickCols * this.brickWidth + (this.brickCols + 1) * this.brickPadding)) / 2;
    }
    
    renderizarLadrillos() {
        this.bricks = [];
        const rows = Math.min(this.brickRows + Math.floor((this.level - 1) / 2), 8);
        const cols = Math.min(this.brickCols + Math.floor((this.level - 1) / 3), 10);
        
        // Recalcular dimensiones
        this.brickCols = cols;
        this.brickRows = rows;
        this.calcularDimensionesLadrillos();
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Ladrillos más resistentes según nivel
                let hp = 1;
                if (this.level > 2 && row < 2) hp = 2;
                if (this.level > 4 && row === 0) hp = 3;
                
                this.bricks.push({
                    x: this.brickOffsetLeft + col * (this.brickWidth + this.brickPadding) + this.brickPadding,
                    y: this.brickOffsetTop + row * (this.brickHeight + this.brickPadding) + this.brickPadding,
                    width: this.brickWidth,
                    height: this.brickHeight,
                    color: this.brickColors[row % this.brickColors.length],
                    hp: hp,
                    maxHp: hp,
                    alive: true
                });
            }
        }
    }
    
    eventListeners() {
        // Teclado
        document.addEventListener('keydown', (e) => {
            const key = e.key;
            
            if (key === ' ' || key === 'Space') {
                e.preventDefault();
                this.handleSpace();
                return;
            }
            
            if (key === 'r' || key === 'R') {
                this.reiniciarJuego();
                return;
            }
            
            if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
                this.keys.left = true;
                e.preventDefault();
            }
            if (key === 'ArrowRight' || key === 'd' || key === 'D') {
                this.keys.right = true;
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.key;
            if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
                this.keys.left = false;
                e.preventDefault();
            }
            if (key === 'ArrowRight' || key === 'd' || key === 'D') {
                this.keys.right = false;
                e.preventDefault();
            }
        });
        
        // Botones
        document.getElementById('startBtn').addEventListener('click', () => {
            this.iniciarJuego();
        });
        
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.reiniciarJuego();
        });
        
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            this.siguienteNivel();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePausa();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.reiniciarJuego();
        });
        
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // Controles táctiles
        document.getElementById('touchLeft').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.left = true;
        });
        document.getElementById('touchLeft').addEventListener('touchend', () => {
            this.keys.left = false;
        });
        
        document.getElementById('touchRight').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.right = true;
        });
        document.getElementById('touchRight').addEventListener('touchend', () => {
            this.keys.right = false;
        });
        
        document.getElementById('touchLaunch').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSpace();
        });
        document.getElementById('touchLaunch').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleSpace();
        });
        
        // Redimensionar canvas
        window.addEventListener('resize', () => {
            this.draw();
        });
        
        // Cerrar overlays al hacer clic fuera
        this.pauseOverlay.addEventListener('click', (e) => {
            if (e.target === this.pauseOverlay) {
                this.togglePausa();
            }
        });
    }
    
    handleSpace() {
        if (this.gameState === 'start') {
            this.iniciarJuego();
            return;
        }
        
        if (this.gameState === 'playing') {
            // Lanzar pelota si está pegada
            if (this.ball.stuck) {
                this.lanzarPelota();
                return;
            }
            // Pausar
            this.togglePausa();
        }
        
        if (this.gameState === 'paused') {
            this.togglePausa();
        }
        
        if (this.gameState === 'gameover' || this.gameState === 'victory') {
            // No hacer nada en game over / victory
        }
    }
    
    iniciarJuego() {
        if (this.gameState === 'start' || this.gameState === 'gameover') {
            this.reiniciarJuego();
        }
        this.gameState = 'playing';
        this.startOverlay.style.display = 'none';
        this.gameOverOverlay.style.display = 'none';
        this.victoryOverlay.style.display = 'none';
        this.pauseOverlay.style.display = 'none';
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.gameLoop();
    }
    
    togglePausa() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.pauseOverlay.style.display = 'flex';
            document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-play"></i>';
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.pauseOverlay.style.display = 'none';
            document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
            if (!this.animationId) {
                this.gameLoop();
            }
        }
    }
    
    lanzarPelota() {
        if (this.ball.stuck) {
            this.ball.stuck = false;
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
            const speed = this.ball.baseSpeed + this.level * 0.2;
            this.ball.speedX = Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1);
            this.ball.speedY = Math.sin(angle) * speed;
        }
    }
    
    reiniciarJuego() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.combo = 0;
        this.gameState = 'start';
        
        this.paddle.x = this.width / 2 - this.paddleWidth / 2;
        this.resetBall();
        this.renderizarLadrillos();
        
        this.startOverlay.style.display = 'flex';
        this.gameOverOverlay.style.display = 'none';
        this.victoryOverlay.style.display = 'none';
        this.pauseOverlay.style.display = 'none';
        document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.actualizarUI();
        this.draw();
    }
    
    siguienteNivel() {
        this.level++;
        this.combo = 0;
        this.resetBall();
        this.renderizarLadrillos();
        this.victoryOverlay.style.display = 'none';
        this.gameState = 'playing';
        this.actualizarUI();
        this.gameLoop();
    }
    
    resetBall() {
        this.ball.x = this.width / 2;
        this.ball.y = this.paddle.y - this.ballRadius - 2;
        this.ball.stuck = true;
        this.ball.speedX = 0;
        this.ball.speedY = 0;
    }
    
    gameLoop() {
        if (this.gameState === 'paused' || this.gameState === 'gameover' || this.gameState === 'victory') {
            return;
        }
        
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // ===== MOVER PALETA =====
        if (this.keys.left && this.paddle.x > 0) {
            this.paddle.x -= this.paddle.speed;
        }
        if (this.keys.right && this.paddle.x + this.paddle.width < this.width) {
            this.paddle.x += this.paddle.speed;
        }
        
        // ===== PELOTA PEGADA =====
        if (this.ball.stuck) {
            this.ball.x = this.paddle.x + this.paddle.width / 2;
            this.ball.y = this.paddle.y - this.ballRadius - 2;
            return;
        }
        
        // ===== MOVER PELOTA =====
        this.ball.x += this.ball.speedX;
        this.ball.y += this.ball.speedY;
        
        // Colisión con paredes
        if (this.ball.x - this.ballRadius < 0) {
            this.ball.x = this.ballRadius;
            this.ball.speedX = Math.abs(this.ball.speedX);
        }
        if (this.ball.x + this.ballRadius > this.width) {
            this.ball.x = this.width - this.ballRadius;
            this.ball.speedX = -Math.abs(this.ball.speedX);
        }
        if (this.ball.y - this.ballRadius < 0) {
            this.ball.y = this.ballRadius;
            this.ball.speedY = Math.abs(this.ball.speedY);
        }
        
        // Colisión con el suelo (pérdida de vida)
        if (this.ball.y + this.ballRadius > this.height) {
            this.perderVida();
            return;
        }
        
        // ===== COLISIÓN CON PALETA =====
        if (this.ball.y + this.ballRadius > this.paddle.y &&
            this.ball.y - this.ballRadius < this.paddle.y + this.paddle.height &&
            this.ball.x + this.ballRadius > this.paddle.x &&
            this.ball.x - this.ballRadius < this.paddle.x + this.paddle.width) {
            
            // Rebote con ángulo según posición
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            const angle = (hitPos - 0.5) * Math.PI * 0.7;
            const speed = Math.sqrt(this.ball.speedX * this.ball.speedX + this.ball.speedY * this.ball.speedY);
            
            this.ball.speedX = Math.sin(angle) * speed;
            this.ball.speedY = -Math.cos(angle) * speed;
            
            this.ball.y = this.paddle.y - this.ballRadius;
            this.combo = 0;
            
            // Efecto de sonido visual
            this.paddleEffect = 1;
        }
        
        // ===== COLISIÓN CON LADRILLOS =====
        for (const brick of this.bricks) {
            if (!brick.alive) continue;
            
            if (this.ball.x + this.ballRadius > brick.x &&
                this.ball.x - this.ballRadius < brick.x + brick.width &&
                this.ball.y + this.ballRadius > brick.y &&
                this.ball.y - this.ballRadius < brick.y + brick.height) {
                
                // Reducir HP del ladrillo
                brick.hp--;
                if (brick.hp <= 0) {
                    brick.alive = false;
                    this.combo++;
                    const comboBonus = Math.min(this.combo, 10);
                    const points = 10 + (this.level - 1) * 2 + comboBonus * 2;
                    this.score += points;
                    this.actualizarUI();
                    
                    // Efecto de partículas
                    this.createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color);
                } else {
                    // Cambiar color cuando se daña
                    brick.color = this.darkenColor(brick.color, 0.6);
                }
                
                // Rebote
                if (this.ball.x < brick.x || this.ball.x > brick.x + brick.width) {
                    this.ball.speedX = -this.ball.speedX;
                } else {
                    this.ball.speedY = -this.ball.speedY;
                }
                
                // Aumentar velocidad ligeramente
                const currentSpeed = Math.sqrt(this.ball.speedX * this.ball.speedX + this.ball.speedY * this.ball.speedY);
                if (currentSpeed < 8) {
                    const factor = 1.03;
                    this.ball.speedX *= factor;
                    this.ball.speedY *= factor;
                }
                
                break; // Salir del bucle para evitar múltiples colisiones
            }
        }
        
        // ===== VERIFICAR VICTORIA =====
        const bricksAlive = this.bricks.filter(b => b.alive);
        if (bricksAlive.length === 0) {
            this.victoria();
            return;
        }
        
        // ===== ACTUALIZAR PARTÍCULAS =====
        this.updateParticles();
    }
    
    perderVida() {
        this.lives--;
        this.combo = 0;
        this.actualizarUI();
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.resetBall();
            this.paddle.x = this.width / 2 - this.paddleWidth / 2;
        }
    }
    
    gameOver() {
        this.gameState = 'gameover';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Actualizar high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('breakoutHighScore', this.highScore);
            this.highScoreDisplay.textContent = this.highScore;
        }
        
        this.finalScoreDisplay.textContent = this.score;
        this.finalLevelDisplay.textContent = this.level;
        this.gameOverOverlay.style.display = 'flex';
        this.draw();
    }
    
    victoria() {
        this.gameState = 'victory';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Bonus por nivel completado
        const bonus = this.level * 50;
        this.score += bonus;
        this.actualizarUI();
        
        this.victoryScoreDisplay.textContent = this.score;
        this.victoryLevelDisplay.textContent = this.level;
        this.victoryOverlay.style.display = 'flex';
        this.draw();
    }
    
    // ===== PARTÍCULAS =====
    createParticles(x, y, color) {
        if (!this.particles) this.particles = [];
        
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                life: 1,
                decay: 0.01 + Math.random() * 0.02,
                size: 3 + Math.random() * 4,
                color: color
            });
        }
    }
    
    updateParticles() {
        if (!this.particles) return;
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05; // Gravedad
            p.life -= p.decay;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    darkenColor(color, factor) {
        // Convertir color hex a RGB y oscurecer
        const hex = color.replace('#', '');
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        
        r = Math.floor(r * factor);
        g = Math.floor(g * factor);
        b = Math.floor(b * factor);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
    
    // ===== UI =====
    actualizarUI() {
        this.scoreDisplay.textContent = this.score;
        this.livesDisplay.textContent = this.lives;
        this.levelDisplay.textContent = this.level;
        this.highScoreDisplay.textContent = this.highScore;
    }
    
    // ===== DIBUJAR =====
    draw() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, w, h);
        
        // Fondo
        ctx.fillStyle = '#0F0F1A';
        ctx.fillRect(0, 0, w, h);
        
        // Fondo con gradiente sutil
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, 'rgba(108, 99, 255, 0.05)');
        gradient.addColorStop(1, 'rgba(255, 101, 132, 0.05)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        
        // ===== LADRILLOS =====
        for (const brick of this.bricks) {
            if (!brick.alive) continue;
            
            const x = brick.x;
            const y = brick.y;
            const bw = brick.width;
            const bh = brick.height;
            
            // Sombra del ladrillo
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetY = 2;
            
            // Cuerpo del ladrillo
            ctx.fillStyle = brick.color;
            ctx.beginPath();
            ctx.roundRect(x, y, bw, bh, 4);
            ctx.fill();
            
            // Brillo
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.beginPath();
            ctx.roundRect(x + 3, y + 2, bw - 6, bh / 3, 2);
            ctx.fill();
            
            // Indicador de HP (si tiene más de 1)
            if (brick.maxHp > 1) {
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.font = '10px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(brick.hp, x + bw / 2, y + bh / 2 + 1);
            }
            
            ctx.shadowBlur = 0;
        }
        
        // ===== PALETA =====
        const p = this.paddle;
        
        // Sombra de la paleta
        ctx.shadowColor = 'rgba(108, 99, 255, 0.3)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 0;
        
        // Gradiente de la paleta
        const paddleGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
        paddleGrad.addColorStop(0, '#8B83FF');
        paddleGrad.addColorStop(1, '#6C63FF');
        ctx.fillStyle = paddleGrad;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.width, p.height, 8);
        ctx.fill();
        
        // Brillo de la paleta
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.roundRect(p.x + 10, p.y + 3, p.width - 20, p.height / 3, 4);
        ctx.fill();
        
        // Borde de la paleta
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.width, p.height, 8);
        ctx.stroke();
        
        // ===== PELOTA =====
        const b = this.ball;
        
        // Sombra de la pelota
        ctx.shadowColor = 'rgba(255,255,255,0.2)';
        ctx.shadowBlur = 15;
        
        // Gradiente de la pelota
        const ballGrad = ctx.createRadialGradient(
            b.x - 3, b.y - 3, 2,
            b.x, b.y, b.radius
        );
        ballGrad.addColorStop(0, '#FFFFFF');
        ballGrad.addColorStop(0.5, '#F1F5F9');
        ballGrad.addColorStop(1, '#94A3B8');
        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Brillo de la pelota
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(b.x - 2, b.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // ===== PARTÍCULAS =====
        if (this.particles) {
            for (const p of this.particles) {
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 5;
                ctx.shadowColor = 'rgba(255,255,255,0.1)';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }
        
        // ===== INFO ADICIONAL =====
        // Mostrar "Presiona espacio para lanzar" si la pelota está pegada
        if (this.ball.stuck && this.gameState === 'playing') {
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText('Presiona Espacio para lanzar', this.width / 2, this.height - 60);
        }
        
        // Mostrar combo
        if (this.combo > 2 && this.gameState === 'playing') {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
            ctx.font = 'bold 20px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';
            ctx.fillText(`🔥 x${this.combo}`, this.width - 20, 10);
        }
    }
}

// ========== POLYFILL PARA ROUNDRECT ==========
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (r > w/2) r = w/2;
        if (r > h/2) r = h/2;
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        return this;
    };
}

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', () => {
    new BreakoutGame();
});
/**
 * 🏎️ CARRERAS
 * Juego de carreras con obstáculos y sistema de velocidad
 */

class RacingGame {
    constructor() {
        // Canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Dimensiones
        this.width = 400;
        this.height = 700;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Configuración del coche
        this.carWidth = 40;
        this.carHeight = 70;
        this.carX = this.width / 2 - this.carWidth / 2;
        this.carY = this.height - this.carHeight - 30;
        this.carSpeed = 5;
        
        // Configuración de carretera
        this.roadOffset = 0;
        this.roadSpeed = 3;
        this.maxSpeed = 15;
        this.minSpeed = 2;
        this.currentSpeed = 5;
        
        // Obstáculos
        this.obstacles = [];
        this.obstacleWidth = 35;
        this.obstacleHeight = 60;
        this.spawnTimer = 0;
        this.spawnInterval = 60;
        this.maxObstacles = 8;
        
        // Estado del juego
        this.distance = 0;
        this.highScore = parseInt(localStorage.getItem('racingHighScore')) || 0;
        this.gameState = 'start'; // 'start', 'playing', 'paused', 'gameover'
        this.animationId = null;
        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false
        };
        
        // Partículas
        this.particles = [];
        
        // Elementos DOM
        this.distanceDisplay = document.getElementById('distance');
        this.speedDisplay = document.getElementById('speed');
        this.highScoreDisplay = document.getElementById('highScore');
        this.finalDistanceDisplay = document.getElementById('finalDistance');
        this.finalSpeedDisplay = document.getElementById('finalSpeed');
        this.startOverlay = document.getElementById('startOverlay');
        this.pauseOverlay = document.getElementById('pauseOverlay');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        
        // Inicializar
        this.init();
    }
    
    init() {
        this.highScoreDisplay.textContent = this.highScore;
        this.eventListeners();
        this.draw();
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
                this.reset();
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
            if (key === 'ArrowUp' || key === 'w' || key === 'W') {
                this.keys.up = true;
                e.preventDefault();
            }
            if (key === 'ArrowDown' || key === 's' || key === 'S') {
                this.keys.down = true;
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
            if (key === 'ArrowUp' || key === 'w' || key === 'W') {
                this.keys.up = false;
                e.preventDefault();
            }
            if (key === 'ArrowDown' || key === 's' || key === 'S') {
                this.keys.down = false;
                e.preventDefault();
            }
        });
        
        // Botones
        document.getElementById('startBtn').addEventListener('click', () => {
            this.start();
        });
        
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.reset();
            this.start();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.reset();
            this.start();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.handleSpace();
        });
        
        // Controles táctiles
        const touchBtns = {
            'touchLeft': 'left',
            'touchRight': 'right',
            'touchUp': 'up',
            'touchDown': 'down'
        };
        
        for (const [id, key] of Object.entries(touchBtns)) {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.keys[key] = true;
                });
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.keys[key] = false;
                });
                btn.addEventListener('mousedown', () => {
                    this.keys[key] = true;
                });
                btn.addEventListener('mouseup', () => {
                    this.keys[key] = false;
                });
                btn.addEventListener('mouseleave', () => {
                    this.keys[key] = false;
                });
            }
        }
    }
    
    handleSpace() {
        if (this.gameState === 'start') {
            this.start();
        } else if (this.gameState === 'playing') {
            this.pause();
        } else if (this.gameState === 'paused') {
            this.resume();
        }
    }
    
    start() {
        if (this.gameState === 'start' || this.gameState === 'gameover') {
            this.reset();
        }
        this.gameState = 'playing';
        this.startOverlay.style.display = 'none';
        this.gameOverOverlay.style.display = 'none';
        this.pauseOverlay.style.display = 'none';
        document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.gameLoop();
    }
    
    pause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.pauseOverlay.style.display = 'flex';
            document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-play"></i>';
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }
    }
    
    resume() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.pauseOverlay.style.display = 'none';
            document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
            if (!this.animationId) {
                this.gameLoop();
            }
        }
    }
    
    reset() {
        this.carX = this.width / 2 - this.carWidth / 2;
        this.carY = this.height - this.carHeight - 30;
        this.currentSpeed = 5;
        this.distance = 0;
        this.obstacles = [];
        this.particles = [];
        this.spawnTimer = 0;
        this.gameState = 'start';
        
        this.startOverlay.style.display = 'flex';
        this.gameOverOverlay.style.display = 'none';
        this.pauseOverlay.style.display = 'none';
        document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.updateUI();
        this.draw();
    }
    
    gameLoop() {
        if (this.gameState === 'paused') return;
        if (this.gameState === 'gameover') return;
        
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // ===== MOVIMIENTO DEL COCHE =====
        if (this.keys.left && this.carX > 10) {
            this.carX -= this.carSpeed;
        }
        if (this.keys.right && this.carX + this.carWidth < this.width - 10) {
            this.carX += this.carSpeed;
        }
        
        // ===== VELOCIDAD =====
        if (this.keys.up && this.currentSpeed < this.maxSpeed) {
            this.currentSpeed += 0.2;
        }
        if (this.keys.down && this.currentSpeed > this.minSpeed) {
            this.currentSpeed -= 0.2;
        }
        
        // ===== CARRETERA =====
        this.roadOffset = (this.roadOffset + this.currentSpeed) % 80;
        
        // ===== DISTANCIA =====
        this.distance += this.currentSpeed * 0.1;
        
        // ===== GENERAR OBSTÁCULOS =====
        this.spawnTimer++;
        const spawnRate = Math.max(20, this.spawnInterval - this.distance * 0.001);
        if (this.spawnTimer > spawnRate && this.obstacles.length < this.maxObstacles) {
            this.spawnObstacle();
            this.spawnTimer = 0;
        }
        
        // ===== ACTUALIZAR OBSTÁCULOS =====
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.y += this.currentSpeed;
            
            // Colisión con el coche
            if (this.checkCollision(obs)) {
                this.gameOver();
                return;
            }
            
            // Eliminar obstáculos fuera de pantalla
            if (obs.y > this.height + 50) {
                this.obstacles.splice(i, 1);
                // Bonus por esquivar
                this.distance += 5;
            }
        }
        
        // ===== PARTÍCULAS =====
        this.updateParticles();
        
        // ===== UI =====
        this.updateUI();
    }
    
    spawnObstacle() {
        const lane = Math.floor(Math.random() * 3);
        const x = 20 + lane * (this.width - 40) / 3 + (this.width - 40) / 6 - this.obstacleWidth / 2;
        const colors = ['#DC3545', '#FF6B6B', '#E74C3C', '#C0392B'];
        
        this.obstacles.push({
            x: x,
            y: -this.obstacleHeight - 20,
            width: this.obstacleWidth,
            height: this.obstacleHeight,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    
    checkCollision(obs) {
        const carLeft = this.carX + 5;
        const carRight = this.carX + this.carWidth - 5;
        const carTop = this.carY + 5;
        const carBottom = this.carY + this.carHeight - 5;
        
        const obsLeft = obs.x + 3;
        const obsRight = obs.x + obs.width - 3;
        const obsTop = obs.y + 3;
        const obsBottom = obs.y + obs.height - 3;
        
        return carLeft < obsRight &&
               carRight > obsLeft &&
               carTop < obsBottom &&
               carBottom > obsTop;
    }
    
    gameOver() {
        this.gameState = 'gameover';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Crear explosión de partículas
        this.createExplosion(this.carX + this.carWidth / 2, this.carY + this.carHeight / 2);
        
        // Actualizar high score
        const finalDistance = Math.floor(this.distance);
        if (finalDistance > this.highScore) {
            this.highScore = finalDistance;
            localStorage.setItem('racingHighScore', this.highScore);
            this.highScoreDisplay.textContent = this.highScore;
        }
        
        this.finalDistanceDisplay.textContent = finalDistance;
        this.finalSpeedDisplay.textContent = Math.round(this.currentSpeed * 10);
        this.gameOverOverlay.style.display = 'flex';
        this.draw();
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                life: 1,
                decay: 0.01 + Math.random() * 0.02,
                size: 3 + Math.random() * 6,
                color: ['#FF6B6B', '#FFD93D', '#FF8C00', '#FF4444', '#FFFFFF'][Math.floor(Math.random() * 5)]
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.life -= p.decay;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateUI() {
        this.distanceDisplay.textContent = Math.floor(this.distance);
        this.speedDisplay.textContent = Math.round(this.currentSpeed * 10);
    }
    
    draw() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        
        // ===== FONDO =====
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, w, h);
        
        // ===== CARRETERA =====
        ctx.fillStyle = '#2a2a4a';
        ctx.fillRect(20, 0, w - 40, h);
        
        // Líneas de la carretera
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        const lineWidth = 4;
        const lineHeight = 30;
        const gap = 40;
        const totalHeight = lineHeight + gap;
        const offset = this.roadOffset % totalHeight;
        
        for (let y = -totalHeight + offset; y < h + totalHeight; y += totalHeight) {
            ctx.fillRect(w / 2 - lineWidth / 2, y, lineWidth, lineHeight);
        }
        
        // Líneas laterales
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(22, 0, 3, h);
        ctx.fillRect(w - 25, 0, 3, h);
        
        // ===== COCHE DEL JUGADOR =====
        const car = {
            x: this.carX,
            y: this.carY,
            w: this.carWidth,
            h: this.carHeight
        };
        
        // Sombra del coche
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 5;
        
        // Cuerpo del coche
        const carGrad = ctx.createLinearGradient(car.x, car.y, car.x, car.y + car.h);
        carGrad.addColorStop(0, '#6C63FF');
        carGrad.addColorStop(0.5, '#4F46E5');
        carGrad.addColorStop(1, '#3B32A0');
        ctx.fillStyle = carGrad;
        ctx.beginPath();
        ctx.roundRect(car.x, car.y, car.w, car.h, 10);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        
        // Ventanas
        ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
        ctx.beginPath();
        ctx.roundRect(car.x + 6, car.y + 8, 8, 20, 4);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(car.x + car.w - 14, car.y + 8, 8, 20, 4);
        ctx.fill();
        
        // Ventana trasera
        ctx.fillStyle = 'rgba(100, 200, 255, 0.2)';
        ctx.beginPath();
        ctx.roundRect(car.x + 10, car.y + 32, car.w - 20, 12, 4);
        ctx.fill();
        
        // Faros delanteros
        ctx.fillStyle = '#FFD93D';
        ctx.shadowColor = '#FFD93D';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(car.x + 8, car.y + car.h - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(car.x + car.w - 8, car.y + car.h - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Faros traseros
        ctx.fillStyle = '#FF4444';
        ctx.shadowColor = '#FF4444';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(car.x + 8, car.y + 5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(car.x + car.w - 8, car.y + 5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Línea decorativa del coche
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(car.x + 5, car.y + car.h / 2);
        ctx.lineTo(car.x + car.w - 5, car.y + car.h / 2);
        ctx.stroke();
        
        // Detalles del coche (parachoques)
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.roundRect(car.x + 2, car.y + car.h - 6, car.w - 4, 4, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(car.x + 2, car.y + 2, car.w - 4, 4, 2);
        ctx.fill();
        
        // ===== OBSTÁCULOS =====
        for (const obs of this.obstacles) {
            // Sombra del obstáculo
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 3;
            
            // Cuerpo del obstáculo (coche enemigo)
            const obsGrad = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + obs.height);
            obsGrad.addColorStop(0, obs.color);
            obsGrad.addColorStop(1, this.darkenColor(obs.color, 0.7));
            ctx.fillStyle = obsGrad;
            ctx.beginPath();
            ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 8);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            
            // Ventanas del obstáculo
            ctx.fillStyle = 'rgba(100, 200, 255, 0.2)';
            ctx.beginPath();
            ctx.roundRect(obs.x + 4, obs.y + 6, 6, 16, 3);
            ctx.fill();
            ctx.beginPath();
            ctx.roundRect(obs.x + obs.width - 10, obs.y + 6, 6, 16, 3);
            ctx.fill();
            
            // Faros del obstáculo (rojos, vienen hacia ti)
            ctx.fillStyle = '#FF6B6B';
            ctx.shadowColor = '#FF6B6B';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(obs.x + 6, obs.y + 4, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(obs.x + obs.width - 6, obs.y + 4, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        // ===== PARTÍCULAS =====
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
        
        // ===== EFECTO DE VELOCIDAD (líneas de movimiento) =====
        if (this.currentSpeed > 8) {
            const intensity = (this.currentSpeed - 8) / 7;
            ctx.fillStyle = `rgba(255,255,255,${intensity * 0.05})`;
            for (let i = 0; i < 10; i++) {
                const x = 20 + Math.random() * (this.width - 40);
                const y = Math.random() * this.height;
                const h = 2 + Math.random() * 8;
                ctx.fillRect(x, y, 1, h);
            }
        }
        
        // ===== BORDE DE LA CARRETERA (efecto de velocidad) =====
        if (this.currentSpeed > 5) {
            const speedFactor = (this.currentSpeed - 5) / 10;
            ctx.fillStyle = `rgba(255,255,255,${speedFactor * 0.1})`;
            for (let i = 0; i < 5; i++) {
                const y = (i * 80 + this.roadOffset * 2) % this.height;
                ctx.fillRect(22, y, 2, 30);
                ctx.fillRect(this.width - 24, y, 2, 30);
            }
        }
    }
    
    // ===== UTILIDADES DE COLOR =====
    darkenColor(color, factor) {
        let r, g, b;
        if (color.startsWith('#')) {
            const hex = color.replace('#', '');
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else {
            return color;
        }
        r = Math.floor(r * factor);
        g = Math.floor(g * factor);
        b = Math.floor(b * factor);
        return `rgb(${r}, ${g}, ${b})`;
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
    new RacingGame();
});
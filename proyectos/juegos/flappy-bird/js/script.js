/**
 * 🐦 JUEGO DE FLAPPY BIRD
 * Clásico juego de volar entre tuberías
 */

class FlappyBirdGame {
    constructor() {
        // Canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Dimensiones
        this.width = 400;
        this.height = 600;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Configuración del pájaro
        this.bird = {
            x: 80,
            y: this.height / 2,
            radius: 15,
            velocity: 0,
            gravity: 0.5,
            jump: -9,
            rotation: 0,
            flapAngle: 0
        };
        
        // Configuración de tuberías
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 150;
        this.pipeSpeed = 3;
        this.pipeSpawnInterval = 90; // frames entre tuberías
        this.frameCount = 0;
        
        // Estado del juego
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('flappyHighScore')) || 0;
        this.gameState = 'start'; // 'start', 'playing', 'gameover'
        this.animationId = null;
        
        // Fondo - nubes decorativas
        this.clouds = [
            { x: 50, y: 50, size: 30 },
            { x: 150, y: 80, size: 40 },
            { x: 300, y: 40, size: 25 },
            { x: 350, y: 120, size: 35 }
        ];
        
        // Elementos DOM
        this.scoreDisplay = document.getElementById('score');
        this.highScoreDisplay = document.getElementById('highScore');
        this.finalScoreDisplay = document.getElementById('finalScore');
        this.finalHighScoreDisplay = document.getElementById('finalHighScore');
        this.startOverlay = document.getElementById('startOverlay');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        
        // Inicializar
        this.init();
    }
    
    init() {
        // Mostrar high score
        this.highScoreDisplay.textContent = this.highScore;
        
        // Event listeners
        this.eventListeners();
        
        // Dibujar estado inicial
        this.draw();
    }
    
    eventListeners() {
        // Teclado
        document.addEventListener('keydown', (e) => {
            const key = e.key;
            
            if (key === ' ' || key === 'Space' || key === 'ArrowUp') {
                e.preventDefault();
                this.handleAction();
                return;
            }
            
            if (key === 'r' || key === 'R') {
                this.resetGame();
            }
        });
        
        // Click en canvas
        this.canvas.addEventListener('click', (e) => {
            this.handleAction();
        });
        
        // Touch en canvas
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleAction();
        });
        
        // Botón de inicio
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        // Botón de reinicio
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });
        
        // Botón de reinicio
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.resetGame();
            if (this.gameState === 'gameover') {
                this.startGame();
            }
        });
        
        // Botón táctil
        document.getElementById('touchFlap').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleAction();
        });
        
        document.getElementById('touchFlap').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleAction();
        });
    }
    
    handleAction() {
        if (this.gameState === 'start') {
            this.startGame();
        } else if (this.gameState === 'playing') {
            this.flap();
        } else if (this.gameState === 'gameover') {
            this.resetGame();
            this.startGame();
        }
    }
    
    flap() {
        this.bird.velocity = this.bird.jump;
        this.bird.flapAngle = -0.5;
    }
    
    startGame() {
        if (this.gameState === 'playing') return;
        
        this.gameState = 'playing';
        this.startOverlay.style.display = 'none';
        this.gameOverOverlay.style.display = 'none';
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.gameLoop();
    }
    
    resetGame() {
        // Reiniciar pájaro
        this.bird.y = this.height / 2;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        this.bird.flapAngle = 0;
        
        // Reiniciar tuberías
        this.pipes = [];
        this.frameCount = 0;
        this.score = 0;
        this.scoreDisplay.textContent = this.score;
        
        // Ocultar overlays
        this.startOverlay.style.display = 'none';
        this.gameOverOverlay.style.display = 'none';
        
        this.gameState = 'start';
        this.startOverlay.style.display = 'flex';
        
        this.draw();
    }
    
    gameLoop() {
        this.update();
        this.draw();
        
        if (this.gameState === 'playing' || this.gameState === 'gameover') {
            this.animationId = requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Actualizar pájaro
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Rotación del pájaro según velocidad
        this.bird.rotation = Math.min(Math.max(this.bird.velocity * 0.05, -0.8), 1.2);
        
        // Animación de aleteo
        this.bird.flapAngle = Math.sin(Date.now() / 150) * 0.3;
        
        // Colisión con el suelo o techo
        if (this.bird.y + this.bird.radius > this.height - 20) {
            this.bird.y = this.height - 20 - this.bird.radius;
            this.gameOver();
            return;
        }
        
        if (this.bird.y - this.bird.radius < 0) {
            this.bird.y = this.bird.radius;
            this.bird.velocity = 0;
        }
        
        // Generar tuberías
        this.frameCount++;
        if (this.frameCount % this.pipeSpawnInterval === 0) {
            const minY = 80;
            const maxY = this.height - this.pipeGap - 80;
            const pipeY = Math.random() * (maxY - minY) + minY;
            
            this.pipes.push({
                x: this.width,
                y: pipeY,
                width: this.pipeWidth,
                gap: this.pipeGap,
                scored: false
            });
        }
        
        // Actualizar tuberías
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            
            // Eliminar tuberías fuera de pantalla
            if (pipe.x + pipe.width < 0) {
                this.pipes.splice(i, 1);
                continue;
            }
            
            // Colisión con tuberías
            if (this.checkCollision(pipe)) {
                this.gameOver();
                return;
            }
            
            // Puntaje
            if (!pipe.scored && pipe.x + pipe.width < this.bird.x) {
                pipe.scored = true;
                this.score++;
                this.scoreDisplay.textContent = this.score;
            }
        }
    }
    
    checkCollision(pipe) {
        const bird = this.bird;
        const radius = bird.radius;
        const birdLeft = bird.x - radius;
        const birdRight = bird.x + radius;
        const birdTop = bird.y - radius;
        const birdBottom = bird.y + radius;
        
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + pipe.width;
        const pipeTop = pipe.y;
        const pipeBottom = pipe.y + pipe.gap;
        
        // Colisión con la tubería superior
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            if (birdTop < pipeTop || birdBottom > pipeBottom) {
                return true;
            }
        }
        
        return false;
    }
    
    gameOver() {
        if (this.gameState === 'gameover') return;
        
        this.gameState = 'gameover';
        
        // Actualizar high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('flappyHighScore', this.highScore);
            this.highScoreDisplay.textContent = this.highScore;
        }
        
        // Mostrar game over
        this.finalScoreDisplay.textContent = this.score;
        this.finalHighScoreDisplay.textContent = this.highScore;
        this.gameOverOverlay.style.display = 'flex';
        
        // Dibujar último frame
        this.draw();
    }
    
    draw() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        
        // ===== FONDO =====
        // Cielo degradado
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#1a2a5e');
        gradient.addColorStop(0.5, '#2a4a8e');
        gradient.addColorStop(0.8, '#4a8a5e');
        gradient.addColorStop(1, '#2a4a2e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        
        // Suelo
        ctx.fillStyle = '#2a5a2a';
        ctx.fillRect(0, h - 20, w, 20);
        ctx.fillStyle = '#3a7a3a';
        ctx.fillRect(0, h - 20, w, 5);
        
        // Líneas del suelo
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 2;
        for (let i = 0; i < w; i += 30) {
            ctx.beginPath();
            ctx.moveTo(i, h - 15);
            ctx.lineTo(i + 15, h - 15);
            ctx.stroke();
        }
        
        // ===== NUBES =====
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        for (const cloud of this.clouds) {
            const x = (cloud.x + Date.now() * 0.01) % (w + 50) - 25;
            ctx.beginPath();
            ctx.arc(x, cloud.y, cloud.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + cloud.size * 0.6, cloud.y - cloud.size * 0.3, cloud.size * 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x - cloud.size * 0.6, cloud.y - cloud.size * 0.2, cloud.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // ===== TUBERÍAS =====
        for (const pipe of this.pipes) {
            // Tubería superior
            const gradientPipe = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
            gradientPipe.addColorStop(0, '#2a7a2a');
            gradientPipe.addColorStop(0.5, '#4aaa4a');
            gradientPipe.addColorStop(1, '#2a7a2a');
            
            ctx.fillStyle = gradientPipe;
            ctx.fillRect(pipe.x, 0, pipe.width, pipe.y);
            
            // Borde de la tubería superior
            ctx.fillStyle = '#3a8a3a';
            ctx.fillRect(pipe.x - 5, pipe.y - 30, pipe.width + 10, 30);
            ctx.fillStyle = '#2a7a2a';
            ctx.fillRect(pipe.x - 3, pipe.y - 25, pipe.width + 6, 20);
            
            // Tubería inferior
            ctx.fillStyle = gradientPipe;
            ctx.fillRect(pipe.x, pipe.y + pipe.gap, pipe.width, h - pipe.y - pipe.gap);
            
            // Borde de la tubería inferior
            ctx.fillStyle = '#3a8a3a';
            ctx.fillRect(pipe.x - 5, pipe.y + pipe.gap, pipe.width + 10, 30);
            ctx.fillStyle = '#2a7a2a';
            ctx.fillRect(pipe.x - 3, pipe.y + pipe.gap + 5, pipe.width + 6, 20);
            
            // Brillo interior
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillRect(pipe.x + 5, 0, 8, pipe.y);
            ctx.fillRect(pipe.x + 5, pipe.y + pipe.gap, 8, h - pipe.y - pipe.gap);
        }
        
        // ===== PÁJARO =====
        const bird = this.bird;
        
        ctx.save();
        ctx.translate(bird.x, bird.y);
        ctx.rotate(bird.rotation);
        
        // Sombra del pájaro
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 3;
        
        // Cuerpo del pájaro
        const gradientBird = ctx.createRadialGradient(-5, -5, 5, 0, 0, bird.radius);
        gradientBird.addColorStop(0, '#FFD93D');
        gradientBird.addColorStop(0.7, '#F6C700');
        gradientBird.addColorStop(1, '#D4A800');
        ctx.fillStyle = gradientBird;
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(255, 200, 50, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Ala
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.fillStyle = '#D4A800';
        ctx.beginPath();
        ctx.ellipse(-8, -5 + bird.flapAngle * 5, 12, 8 + bird.flapAngle * 3, -0.3 + bird.flapAngle * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Ojo
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(5, -4, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(7, -3, 3.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Brillo del ojo
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(8, -5, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Pico
        ctx.fillStyle = '#FF6B00';
        ctx.beginPath();
        ctx.moveTo(bird.radius - 2, 2);
        ctx.lineTo(bird.radius + 8, 5);
        ctx.lineTo(bird.radius - 2, 8);
        ctx.closePath();
        ctx.fill();
        
        // Línea del pico
        ctx.strokeStyle = '#CC5500';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bird.radius - 2, 5);
        ctx.lineTo(bird.radius + 6, 5);
        ctx.stroke();
        
        // Cola
        ctx.fillStyle = '#D4A800';
        ctx.beginPath();
        ctx.moveTo(-bird.radius + 2, -3);
        ctx.lineTo(-bird.radius - 10, -8 + bird.flapAngle * 2);
        ctx.lineTo(-bird.radius - 8, 0);
        ctx.lineTo(-bird.radius - 10, 8 - bird.flapAngle * 2);
        ctx.lineTo(-bird.radius + 2, 3);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
        
        // ===== PUNTAJE =====
        if (this.gameState === 'playing' || this.gameState === 'gameover') {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.roundRect(10, 10, 80, 40, 10);
            ctx.fill();
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 1.5rem Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 10;
            ctx.fillText(this.score, 50, 32);
            ctx.shadowBlur = 0;
        }
    }
}

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', () => {
    new FlappyBirdGame();
});

// Polyfill para roundRect si no existe
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
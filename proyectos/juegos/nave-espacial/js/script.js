/**
 * 🚀 NAVE ESPACIAL
 * Destruye asteroides y sobrevive en el espacio
 */

class SpaceShipGame {
    constructor() {
        // Canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Dimensiones
        this.width = 800;
        this.height = 600;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Jugador
        this.player = {
            x: this.width / 2,
            y: this.height / 2,
            radius: 20,
            speed: 4,
            turboSpeed: 7,
            lives: 3,
            invincible: false,
            invincibleTimer: 0,
            angle: 0,
            shootCooldown: 0,
            shootDelay: 12
        };
        
        // Asteroides
        this.asteroids = [];
        this.maxAsteroids = 12;
        this.spawnTimer = 0;
        this.spawnInterval = 60;
        this.asteroidKills = 0;
        
        // Balas
        this.bullets = [];
        this.bulletSpeed = 8;
        this.bulletRadius = 4;
        this.bulletLife = 120;
        
        // Partículas
        this.particles = [];
        this.stars = [];
        
        // Estado del juego
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('spaceShipHighScore')) || 0;
        this.gameState = 'start';
        this.animationId = null;
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            shift: false
        };
        
        // Mouse
        this.mouse = { x: this.width / 2, y: this.height / 2 };
        this.shooting = false;
        
        // Elementos DOM
        this.scoreDisplay = document.getElementById('score');
        this.livesDisplay = document.getElementById('lives');
        this.asteroidsDisplay = document.getElementById('asteroids');
        this.highScoreDisplay = document.getElementById('highScore');
        this.finalAsteroidsDisplay = document.getElementById('finalAsteroids');
        this.finalScoreDisplay = document.getElementById('finalScore');
        this.startOverlay = document.getElementById('startOverlay');
        this.pauseOverlay = document.getElementById('pauseOverlay');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        
        this.init();
    }
    
    init() {
        this.highScoreDisplay.textContent = this.highScore;
        this.generateStars();
        this.eventListeners();
        this.draw();
    }
    
    generateStars() {
        this.stars = [];
        for (let i = 0; i < 150; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: 0.5 + Math.random() * 2,
                speed: 0.2 + Math.random() * 0.5
            });
        }
    }
    
    eventListeners() {
        // Teclado
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            
            if (key === ' ' || key === 'space') {
                e.preventDefault();
                this.handleSpace();
                return;
            }
            
            if (key === 'shift') {
                this.keys.shift = true;
                e.preventDefault();
                return;
            }
            
            if (key === 'w') this.keys.w = true;
            if (key === 'a') this.keys.a = true;
            if (key === 's') this.keys.s = true;
            if (key === 'd') this.keys.d = true;
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'shift') {
                this.keys.shift = false;
                e.preventDefault();
                return;
            }
            if (key === 'w') this.keys.w = false;
            if (key === 'a') this.keys.a = false;
            if (key === 's') this.keys.s = false;
            if (key === 'd') this.keys.d = false;
        });
        
        // Ratón
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.width / rect.width;
            const scaleY = this.height / rect.height;
            this.mouse.x = (e.clientX - rect.left) * scaleX;
            this.mouse.y = (e.clientY - rect.top) * scaleY;
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0 && this.gameState === 'playing') {
                this.shooting = true;
            }
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.shooting = false;
            }
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.shooting = false;
        });
        
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
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
        const touchKeys = {
            'touchUp': 'w',
            'touchDown': 's',
            'touchLeft': 'a',
            'touchRight': 'd'
        };
        
        for (const [id, key] of Object.entries(touchKeys)) {
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
                btn.addEventListener('mousedown', () => { this.keys[key] = true; });
                btn.addEventListener('mouseup', () => { this.keys[key] = false; });
            }
        }
        
        document.getElementById('touchShoot').addEventListener('click', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') {
                this.shoot();
            }
        });
        document.getElementById('touchShoot').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') {
                this.shoot();
            }
        });
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
        this.player.x = this.width / 2;
        this.player.y = this.height / 2;
        this.player.lives = 3;
        this.player.invincible = false;
        this.player.invincibleTimer = 0;
        this.player.shootCooldown = 0;
        
        this.asteroids = [];
        this.bullets = [];
        this.particles = [];
        this.asteroidKills = 0;
        this.score = 0;
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
        
        // ===== MOVIMIENTO DEL JUGADOR =====
        let dx = 0, dy = 0;
        if (this.keys.w) dy = -this.player.speed;
        if (this.keys.s) dy = this.player.speed;
        if (this.keys.a) dx = -this.player.speed;
        if (this.keys.d) dx = this.player.speed;
        
        // Turbo
        const speed = this.keys.shift ? this.player.turboSpeed : this.player.speed;
        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx = (dx / len) * speed;
            dy = (dy / len) * speed;
        }
        
        this.player.x += dx;
        this.player.y += dy;
        
        // Límites
        const r = this.player.radius;
        this.player.x = Math.max(r, Math.min(this.width - r, this.player.x));
        this.player.y = Math.max(r, Math.min(this.height - r, this.player.y));
        
        // Ángulo
        this.player.angle = Math.atan2(
            this.mouse.y - this.player.y,
            this.mouse.x - this.player.x
        );
        
        // Invincibilidad
        if (this.player.invincible) {
            this.player.invincibleTimer--;
            if (this.player.invincibleTimer <= 0) {
                this.player.invincible = false;
            }
        }
        
        // Cooldown de disparo
        if (this.player.shootCooldown > 0) {
            this.player.shootCooldown--;
        }
        
        // Disparo continuo con mouse
        if (this.shooting) {
            this.shoot();
        }
        
        // ===== GENERAR ASTEROIDES =====
        this.spawnTimer++;
        const spawnRate = Math.max(30, this.spawnInterval - this.score * 0.02);
        if (this.spawnTimer > spawnRate && this.asteroids.length < this.maxAsteroids) {
            this.spawnAsteroid();
            this.spawnTimer = 0;
        }
        
        // ===== ACTUALIZAR ASTEROIDES =====
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            asteroid.x += asteroid.vx;
            asteroid.y += asteroid.vy;
            asteroid.angle += asteroid.rotation;
            
            // Rebote en bordes
            if (asteroid.x - asteroid.radius < 0) {
                asteroid.x = asteroid.radius;
                asteroid.vx = Math.abs(asteroid.vx);
            }
            if (asteroid.x + asteroid.radius > this.width) {
                asteroid.x = this.width - asteroid.radius;
                asteroid.vx = -Math.abs(asteroid.vx);
            }
            if (asteroid.y - asteroid.radius < 0) {
                asteroid.y = asteroid.radius;
                asteroid.vy = Math.abs(asteroid.vy);
            }
            if (asteroid.y + asteroid.radius > this.height) {
                asteroid.y = this.height - asteroid.radius;
                asteroid.vy = -Math.abs(asteroid.vy);
            }
            
            // Colisión con jugador
            if (!this.player.invincible) {
                const dxA = this.player.x - asteroid.x;
                const dyA = this.player.y - asteroid.y;
                if (dxA * dxA + dyA * dyA < (this.player.radius + asteroid.radius) ** 2) {
                    this.playerHit();
                    return;
                }
            }
        }
        
        // ===== ACTUALIZAR BALAS =====
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            bullet.life--;
            
            if (bullet.life <= 0 || bullet.x < -10 || bullet.x > this.width + 10 ||
                bullet.y < -10 || bullet.y > this.height + 10) {
                this.bullets.splice(i, 1);
                continue;
            }
            
            // Colisión con asteroides
            let hit = false;
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                const asteroid = this.asteroids[j];
                const dxB = bullet.x - asteroid.x;
                const dyB = bullet.y - asteroid.y;
                if (dxB * dxB + dyB * dyB < (asteroid.radius + this.bulletRadius) ** 2) {
                    this.destroyAsteroid(j);
                    hit = true;
                    break;
                }
            }
            
            if (hit) {
                this.bullets.splice(i, 1);
            }
        }
        
        // ===== PARTÍCULAS =====
        this.updateParticles();
        
        // ===== UI =====
        this.updateUI();
    }
    
    spawnAsteroid() {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        const padding = 30;
        
        switch(side) {
            case 0: x = Math.random() * this.width; y = -padding; break;
            case 1: x = Math.random() * this.width; y = this.height + padding; break;
            case 2: x = -padding; y = Math.random() * this.height; break;
            case 3: x = this.width + padding; y = Math.random() * this.height; break;
        }
        
        // Evitar que aparezca encima del jugador
        const dist = Math.sqrt((x - this.player.x) ** 2 + (y - this.player.y) ** 2);
        if (dist < 200) {
            x = Math.random() * this.width;
            y = -padding;
        }
        
        const size = 20 + Math.random() * 25;
        const speed = 0.5 + Math.random() * 1.5 + this.score * 0.005;
        const angle = Math.random() * Math.PI * 2;
        
        this.asteroids.push({
            x: x,
            y: y,
            radius: size,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            angle: Math.random() * Math.PI * 2,
            rotation: (Math.random() - 0.5) * 0.05,
            color: `hsl(${30 + Math.random() * 20}, 50%, ${40 + Math.random() * 20}%)`,
            points: Math.floor(size / 5)
        });
    }
    
    destroyAsteroid(index) {
        const asteroid = this.asteroids[index];
        
        // Explosión
        this.createExplosion(asteroid.x, asteroid.y, asteroid.color);
        
        // Puntos
        this.asteroidKills++;
        this.score += asteroid.points + 5;
        
        // Dividir en asteroides más pequeños (si es lo suficientemente grande)
        if (asteroid.radius > 25) {
            const newSize = asteroid.radius / 1.8;
            if (newSize > 12) {
                for (let i = 0; i < 2; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 0.5 + Math.random() * 1.5;
                    this.asteroids.push({
                        x: asteroid.x + (Math.random() - 0.5) * 10,
                        y: asteroid.y + (Math.random() - 0.5) * 10,
                        radius: newSize,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        angle: Math.random() * Math.PI * 2,
                        rotation: (Math.random() - 0.5) * 0.05,
                        color: `hsl(${30 + Math.random() * 20}, 50%, ${40 + Math.random() * 20}%)`,
                        points: Math.floor(newSize / 5)
                    });
                }
            }
        }
        
        this.asteroids.splice(index, 1);
        this.updateUI();
    }
    
    shoot() {
        if (this.player.shootCooldown > 0) return;
        if (this.gameState !== 'playing') return;
        
        this.player.shootCooldown = this.player.shootDelay;
        
        const angle = this.player.angle;
        const spread = 0.05;
        
        // Disparo triple con power-up (cuando el puntaje es múltiplo de 100)
        const tripleShot = this.score > 0 && this.score % 100 === 0;
        const shots = tripleShot ? 3 : 1;
        
        for (let i = 0; i < shots; i++) {
            const offset = tripleShot ? (i - 1) * spread : 0;
            const bulletAngle = angle + offset;
            
            this.bullets.push({
                x: this.player.x + Math.cos(angle) * (this.player.radius + 5),
                y: this.player.y + Math.sin(angle) * (this.player.radius + 5),
                vx: Math.cos(bulletAngle) * this.bulletSpeed,
                vy: Math.sin(bulletAngle) * this.bulletSpeed,
                radius: this.bulletRadius,
                life: this.bulletLife,
                color: tripleShot ? '#FFD93D' : '#6C63FF'
            });
        }
        
        // Partículas de disparo
        for (let i = 0; i < 3; i++) {
            const spreadP = (Math.random() - 0.5) * 0.3;
            const speed = 1 + Math.random() * 2;
            this.particles.push({
                x: this.player.x + Math.cos(angle) * (this.player.radius + 5),
                y: this.player.y + Math.sin(angle) * (this.player.radius + 5),
                vx: Math.cos(angle + spreadP) * speed,
                vy: Math.sin(angle + spreadP) * speed,
                life: 1,
                decay: 0.05 + Math.random() * 0.03,
                size: 2 + Math.random() * 3,
                color: '#6C63FF'
            });
        }
    }
    
    playerHit() {
        if (this.player.invincible) return;
        
        this.player.lives--;
        this.updateUI();
        
        // Explosión
        this.createExplosion(this.player.x, this.player.y, '#FF6B6B');
        
        if (this.player.lives <= 0) {
            this.gameOver();
        } else {
            this.player.invincible = true;
            this.player.invincibleTimer = 120; // 2 segundos
            this.player.x = this.width / 2;
            this.player.y = this.height / 2;
            
            // Efecto de invencibilidad (parpadeo)
            setTimeout(() => {
                this.player.invincible = false;
            }, 2000);
        }
    }
    
    createExplosion(x, y, color) {
        const count = 30 + Math.random() * 20;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 5;
            const colors = [color, '#FFD93D', '#FF6B6B', '#FFFFFF', '#FF8C00'];
            this.particles.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                life: 1,
                decay: 0.01 + Math.random() * 0.02,
                size: 3 + Math.random() * 6,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.02;
            p.life -= p.decay;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    gameOver() {
        this.gameState = 'gameover';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Explosión final
        this.createExplosion(this.player.x, this.player.y, '#FF4444');
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            this.particles.push({
                x: this.player.x + (Math.random() - 0.5) * 20,
                y: this.player.y + (Math.random() - 0.5) * 20,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                life: 1,
                decay: 0.008 + Math.random() * 0.02,
                size: 4 + Math.random() * 8,
                color: ['#FF4444', '#FF6B6B', '#FFD93D', '#FF8C00', '#FFFFFF'][Math.floor(Math.random() * 5)]
            });
        }
        
        // Actualizar high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('spaceShipHighScore', this.highScore);
            this.highScoreDisplay.textContent = this.highScore;
        }
        
        this.finalAsteroidsDisplay.textContent = this.asteroidKills;
        this.finalScoreDisplay.textContent = this.score;
        this.gameOverOverlay.style.display = 'flex';
        this.draw();
    }
    
    updateUI() {
        this.scoreDisplay.textContent = this.score;
        this.livesDisplay.textContent = '❤️'.repeat(this.player.lives);
        this.asteroidsDisplay.textContent = this.asteroids.length;
        this.highScoreDisplay.textContent = this.highScore;
    }
    
    draw() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        
        // ===== FONDO =====
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, w, h);
        
        // ===== ESTRELLAS =====
        for (const star of this.stars) {
            ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
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
        
        // ===== ASTEROIDES =====
        for (const asteroid of this.asteroids) {
            ctx.save();
            ctx.translate(asteroid.x, asteroid.y);
            ctx.rotate(asteroid.angle);
            
            // Sombra
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 10;
            
            // Cuerpo del asteroide
            ctx.fillStyle = asteroid.color;
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 2;
            
            // Forma irregular
            ctx.beginPath();
            const points = 6 + Math.floor(Math.random() * 4);
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const radius = asteroid.radius * (0.7 + Math.random() * 0.3);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Detalles del asteroide (cráteres)
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            for (let i = 0; i < 3; i++) {
                const cx = (Math.random() - 0.5) * asteroid.radius * 0.6;
                const cy = (Math.random() - 0.5) * asteroid.radius * 0.6;
                const cr = 2 + Math.random() * 4;
                ctx.beginPath();
                ctx.arc(cx, cy, cr, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
        
        // ===== BALAS =====
        for (const bullet of this.bullets) {
            ctx.shadowColor = bullet.color || '#6C63FF';
            ctx.shadowBlur = 15;
            ctx.fillStyle = bullet.color || '#6C63FF';
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Estela
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(108, 99, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(bullet.x - bullet.vx * 0.5, bullet.y - bullet.vy * 0.5, bullet.radius * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        
        // ===== JUGADOR =====
        const p = this.player;
        
        // Parpadeo de invencibilidad
        if (p.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        
        // Sombra de la nave
        ctx.shadowColor = 'rgba(108, 99, 255, 0.3)';
        ctx.shadowBlur = 20;
        
        // Cuerpo principal
        const grad = ctx.createLinearGradient(-20, -10, 20, 10);
        grad.addColorStop(0, '#6C63FF');
        grad.addColorStop(0.5, '#8B83FF');
        grad.addColorStop(1, '#4F46E5');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(25, 0);
        ctx.lineTo(-15, -12);
        ctx.lineTo(-10, -4);
        ctx.lineTo(-10, 4);
        ctx.lineTo(-15, 12);
        ctx.closePath();
        ctx.fill();
        
        // Cabina
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(100, 200, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(10, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(100, 200, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(12, -2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Alas
        ctx.fillStyle = '#5A52D6';
        ctx.beginPath();
        ctx.moveTo(-5, -10);
        ctx.lineTo(-18, -18);
        ctx.lineTo(-10, -8);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(-5, 10);
        ctx.lineTo(-18, 18);
        ctx.lineTo(-10, 8);
        ctx.closePath();
        ctx.fill();
        
        // Motor (llama)
        if (this.keys.w || this.keys.s || this.keys.a || this.keys.d || this.keys.shift) {
            const flameLength = 8 + Math.random() * 12;
            const flameGrad = ctx.createLinearGradient(-15, 0, -15 - flameLength, 0);
            flameGrad.addColorStop(0, '#FF6B6B');
            flameGrad.addColorStop(0.5, '#FF8C00');
            flameGrad.addColorStop(1, 'rgba(255, 200, 0, 0)');
            ctx.fillStyle = flameGrad;
            ctx.beginPath();
            ctx.moveTo(-15, -6);
            ctx.lineTo(-15 - flameLength, 0);
            ctx.lineTo(-15, 6);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
        ctx.globalAlpha = 1;
        
        // ===== INFO EN CANVAS =====
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`💥 Asteroides: ${this.asteroids.length}`, 10, 10);
        
        // Indicador de turbo
        if (this.keys.shift) {
            ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText('⚡ TURBO', this.width / 2, this.height - 10);
        }
        
        // Indicador de disparo triple
        if (this.score > 0 && this.score % 100 === 0) {
            ctx.fillStyle = 'rgba(255, 217, 61, 0.3)';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';
            ctx.fillText('💥 TRIPLE DISPARO', this.width - 10, 10);
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
    new SpaceShipGame();
});
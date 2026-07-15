/**
 * 🧟 ZOMBIE SURVIVAL
 * Sobrevive a la horda de zombies
 */

class ZombieSurvival {
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
            radius: 18,
            speed: 4,
            health: 100,
            maxHealth: 100,
            ammo: 30,
            maxAmmo: 30,
            reloading: false,
            reloadTime: 0,
            reloadDuration: 60,
            angle: 0,
            shootCooldown: 0,
            shootDelay: 10
        };
        
        // Zombies
        this.zombies = [];
        this.maxZombies = 20;
        this.spawnTimer = 0;
        this.spawnInterval = 90;
        this.zombieSpeed = 1.2;
        this.zombieKills = 0;
        
        // Balas
        this.bullets = [];
        this.bulletSpeed = 10;
        this.bulletRadius = 4;
        
        // Partículas
        this.particles = [];
        
        // Estado del juego
        this.score = 0;
        this.survivalTime = 0;
        this.gameState = 'start';
        this.animationId = null;
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        };
        
        // Mouse
        this.mouse = { x: this.width / 2, y: this.height / 2 };
        
        // Elementos DOM
        this.healthDisplay = document.getElementById('health');
        this.ammoDisplay = document.getElementById('ammo');
        this.zombiesDisplay = document.getElementById('zombies');
        this.scoreDisplay = document.getElementById('score');
        this.finalZombiesDisplay = document.getElementById('finalZombies');
        this.finalScoreDisplay = document.getElementById('finalScore');
        this.finalTimeDisplay = document.getElementById('finalTime');
        this.startOverlay = document.getElementById('startOverlay');
        this.pauseOverlay = document.getElementById('pauseOverlay');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        
        this.init();
    }
    
    init() {
        this.eventListeners();
        this.draw();
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
            
            if (key === 'r') {
                this.reload();
                return;
            }
            
            if (key === 'w') this.keys.w = true;
            if (key === 'a') this.keys.a = true;
            if (key === 's') this.keys.s = true;
            if (key === 'd') this.keys.d = true;
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
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
        
        this.canvas.addEventListener('click', (e) => {
            if (this.gameState === 'playing') {
                this.shoot();
            }
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
            if (this.gameState === 'playing') this.shoot();
        });
        document.getElementById('touchShoot').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') this.shoot();
        });
        
        document.getElementById('touchReload').addEventListener('click', (e) => {
            e.preventDefault();
            this.reload();
        });
        document.getElementById('touchReload').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.reload();
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
    
    reload() {
        if (this.player.reloading || this.player.ammo === this.player.maxAmmo) return;
        this.player.reloading = true;
        this.player.reloadTime = 0;
        this.showNotification('Recargando...', 'info');
    }
    
    reset() {
        this.player.x = this.width / 2;
        this.player.y = this.height / 2;
        this.player.health = 100;
        this.player.ammo = 30;
        this.player.reloading = false;
        this.player.reloadTime = 0;
        this.player.shootCooldown = 0;
        
        this.zombies = [];
        this.bullets = [];
        this.particles = [];
        this.zombieKills = 0;
        this.score = 0;
        this.survivalTime = 0;
        this.spawnTimer = 0;
        this.zombieSpeed = 1.2;
        
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
        
        // ===== TIEMPO DE SUPERVIVENCIA =====
        this.survivalTime += 1/60;
        
        // ===== JUGADOR - MOVIMIENTO =====
        let dx = 0, dy = 0;
        if (this.keys.w) dy = -this.player.speed;
        if (this.keys.s) dy = this.player.speed;
        if (this.keys.a) dx = -this.player.speed;
        if (this.keys.d) dx = this.player.speed;
        
        // Normalizar movimiento diagonal
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }
        
        this.player.x += dx;
        this.player.y += dy;
        
        // Límites del jugador
        const r = this.player.radius;
        this.player.x = Math.max(r, Math.min(this.width - r, this.player.x));
        this.player.y = Math.max(r, Math.min(this.height - r, this.player.y));
        
        // ===== JUGADOR - ÁNGULO =====
        const angle = Math.atan2(
            this.mouse.y - this.player.y,
            this.mouse.x - this.player.x
        );
        this.player.angle = angle;
        
        // ===== JUGADOR - RECARGA =====
        if (this.player.reloading) {
            this.player.reloadTime++;
            if (this.player.reloadTime >= this.player.reloadDuration) {
                this.player.ammo = this.player.maxAmmo;
                this.player.reloading = false;
                this.player.reloadTime = 0;
                this.showNotification('¡Recargado!', 'success');
                this.updateUI();
            }
        }
        
        // ===== JUGADOR - COOLDOWN DE DISPARO =====
        if (this.player.shootCooldown > 0) {
            this.player.shootCooldown--;
        }
        
        // ===== GENERAR ZOMBIES =====
        this.spawnTimer++;
        const spawnRate = Math.max(30, this.spawnInterval - this.survivalTime * 0.5);
        if (this.spawnTimer > spawnRate && this.zombies.length < this.maxZombies) {
            this.spawnZombie();
            this.spawnTimer = 0;
        }
        
        // ===== ACTUALIZAR ZOMBIES =====
        for (let i = this.zombies.length - 1; i >= 0; i--) {
            const zombie = this.zombies[i];
            
            // Movimiento hacia el jugador
            const dxZ = this.player.x - zombie.x;
            const dyZ = this.player.y - zombie.y;
            const dist = Math.sqrt(dxZ * dxZ + dyZ * dyZ);
            
            if (dist > 0) {
                const speed = this.zombieSpeed + (this.survivalTime * 0.01);
                zombie.x += (dxZ / dist) * speed;
                zombie.y += (dyZ / dist) * speed;
            }
            
            // Colisión con jugador
            if (dist < this.player.radius + zombie.radius) {
                this.player.health -= 0.5;
                this.updateUI();
                if (this.player.health <= 0) {
                    this.player.health = 0;
                    this.gameOver();
                    return;
                }
            }
            
            // Eliminar zombies fuera de pantalla (no debería pasar)
            if (zombie.x < -50 || zombie.x > this.width + 50 ||
                zombie.y < -50 || zombie.y > this.height + 50) {
                this.zombies.splice(i, 1);
            }
        }
        
        // ===== ACTUALIZAR BALAS =====
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            
            // Eliminar balas fuera de pantalla
            if (bullet.x < -10 || bullet.x > this.width + 10 ||
                bullet.y < -10 || bullet.y > this.height + 10) {
                this.bullets.splice(i, 1);
                continue;
            }
            
            // Colisión con zombies
            let hit = false;
            for (let j = this.zombies.length - 1; j >= 0; j--) {
                const zombie = this.zombies[j];
                const dxB = bullet.x - zombie.x;
                const dyB = bullet.y - zombie.y;
                if (dxB * dxB + dyB * dyB < (zombie.radius + this.bulletRadius) ** 2) {
                    // Eliminar zombie
                    this.createExplosion(zombie.x, zombie.y, '#44FF44');
                    this.zombies.splice(j, 1);
                    this.zombieKills++;
                    this.score += 10;
                    this.updateUI();
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
    
    spawnZombie() {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        const padding = 20;
        
        switch(side) {
            case 0: // Arriba
                x = Math.random() * this.width;
                y = -padding;
                break;
            case 1: // Abajo
                x = Math.random() * this.width;
                y = this.height + padding;
                break;
            case 2: // Izquierda
                x = -padding;
                y = Math.random() * this.height;
                break;
            case 3: // Derecha
                x = this.width + padding;
                y = Math.random() * this.height;
                break;
        }
        
        // Evitar que aparezca encima del jugador
        const dist = Math.sqrt((x - this.player.x) ** 2 + (y - this.player.y) ** 2);
        if (dist < 200) {
            x = Math.random() * this.width;
            y = -padding;
        }
        
        const colors = ['#2d8a4e', '#3a9a5e', '#1a7a3e', '#4aaa6e'];
        this.zombies.push({
            x: x,
            y: y,
            radius: 16,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: 0.5 + Math.random() * 0.5
        });
    }
    
    shoot() {
        if (this.gameState !== 'playing') return;
        if (this.player.reloading) return;
        if (this.player.ammo <= 0) {
            this.reload();
            return;
        }
        if (this.player.shootCooldown > 0) return;
        
        this.player.ammo--;
        this.player.shootCooldown = this.player.shootDelay;
        
        // Crear bala
        const angle = this.player.angle;
        this.bullets.push({
            x: this.player.x + Math.cos(angle) * this.player.radius,
            y: this.player.y + Math.sin(angle) * this.player.radius,
            vx: Math.cos(angle) * this.bulletSpeed,
            vy: Math.sin(angle) * this.bulletSpeed,
            radius: this.bulletRadius,
            life: 60
        });
        
        // Efecto de disparo (partículas)
        for (let i = 0; i < 5; i++) {
            const spread = (Math.random() - 0.5) * 0.5;
            const speed = 1 + Math.random() * 2;
            this.particles.push({
                x: this.player.x + Math.cos(angle) * this.player.radius,
                y: this.player.y + Math.sin(angle) * this.player.radius,
                vx: Math.cos(angle + spread) * speed,
                vy: Math.sin(angle + spread) * speed,
                life: 1,
                decay: 0.03 + Math.random() * 0.02,
                size: 2 + Math.random() * 3,
                color: '#FFD93D'
            });
        }
        
        this.updateUI();
        
        // Auto-recargar si es necesario
        if (this.player.ammo === 0) {
            setTimeout(() => this.reload(), 300);
        }
    }
    
    createExplosion(x, y, color) {
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                life: 1,
                decay: 0.015 + Math.random() * 0.02,
                size: 3 + Math.random() * 5,
                color: color || '#44FF44'
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
            const speed = 2 + Math.random() * 5;
            this.particles.push({
                x: this.player.x,
                y: this.player.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                life: 1,
                decay: 0.01 + Math.random() * 0.02,
                size: 3 + Math.random() * 6,
                color: ['#FF4444', '#FF6B6B', '#FF8C00', '#FFD93D', '#FFFFFF'][Math.floor(Math.random() * 5)]
            });
        }
        
        this.finalZombiesDisplay.textContent = this.zombieKills;
        this.finalScoreDisplay.textContent = this.score;
        this.finalTimeDisplay.textContent = Math.floor(this.survivalTime);
        this.gameOverOverlay.style.display = 'flex';
        this.draw();
    }
    
    updateUI() {
        // Salud
        this.healthDisplay.textContent = Math.round(this.player.health);
        this.healthDisplay.className = 'stat-value';
        if (this.player.health < 30) {
            this.healthDisplay.classList.add('danger');
        } else if (this.player.health < 60) {
            this.healthDisplay.classList.add('warning');
        }
        
        // Munición
        const ammoText = this.player.reloading ? 
            '🔄' : 
            `${this.player.ammo}/${this.player.maxAmmo}`;
        this.ammoDisplay.textContent = ammoText;
        
        // Zombies
        this.zombiesDisplay.textContent = this.zombies.length;
        
        // Puntaje
        this.scoreDisplay.textContent = this.score;
    }
    
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 12px;
            background: ${type === 'success' ? '#28A745' : type === 'error' ? '#DC3545' : '#6C63FF'};
            color: white;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    draw() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        
        // ===== FONDO =====
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, w, h);
        
        // Patrón de suelo
        ctx.fillStyle = 'rgba(255,255,255,0.02)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37 + 13) % w;
            const y = (i * 53 + 7) % h;
            ctx.fillRect(x, y, 2, 2);
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
        
        // ===== ZOMBIES =====
        for (const zombie of this.zombies) {
            const x = zombie.x;
            const y = zombie.y;
            const r = zombie.radius;
            
            // Sombra
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 10;
            
            // Cuerpo del zombie
            const grad = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, r);
            grad.addColorStop(0, '#4aaa6e');
            grad.addColorStop(0.7, zombie.color);
            grad.addColorStop(1, '#1a5a2e');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            
            // Ojos (rojos)
            const eyeAngle = Math.atan2(
                this.player.y - y,
                this.player.x - x
            );
            const eyeDist = 6;
            for (let side = -1; side <= 1; side += 2) {
                const ex = x + Math.cos(eyeAngle + side * 0.5) * eyeDist;
                const ey = y + Math.sin(eyeAngle + side * 0.5) * eyeDist;
                
                ctx.fillStyle = '#FF0000';
                ctx.shadowColor = '#FF0000';
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.arc(ex, ey, 3, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#1a1a2e';
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.arc(ex + Math.cos(eyeAngle) * 1.5, ey + Math.sin(eyeAngle) * 1.5, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
            
            // Boca
            ctx.strokeStyle = '#1a3a2a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x + Math.cos(eyeAngle) * 4, y + Math.sin(eyeAngle) * 4 + 3, 5, 0.1, Math.PI - 0.1);
            ctx.stroke();
        }
        
        // ===== BALAS =====
        for (const bullet of this.bullets) {
            ctx.shadowColor = '#FFD93D';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#FFD93D';
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Estela
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255, 217, 61, 0.3)';
            ctx.beginPath();
            ctx.arc(bullet.x - bullet.vx * 0.5, bullet.y - bullet.vy * 0.5, bullet.radius * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        
        // ===== JUGADOR =====
        const p = this.player;
        
        // Sombra del jugador
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 15;
        
        // Cuerpo del jugador
        const playerGrad = ctx.createRadialGradient(
            p.x - 5, p.y - 5, 3,
            p.x, p.y, p.radius
        );
        playerGrad.addColorStop(0, '#8B83FF');
        playerGrad.addColorStop(0.7, '#6C63FF');
        playerGrad.addColorStop(1, '#3B32A0');
        ctx.fillStyle = playerGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        // Ojos del jugador (mirando al mouse)
        const eyeAngle = this.player.angle;
        const eyeDist = 7;
        for (let side = -1; side <= 1; side += 2) {
            const ex = p.x + Math.cos(eyeAngle + side * 0.5) * eyeDist;
            const ey = p.y + Math.sin(eyeAngle + side * 0.5) * eyeDist;
            
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(ex, ey, 4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#1a1a2e';
            ctx.beginPath();
            ctx.arc(ex + Math.cos(eyeAngle) * 2, ey + Math.sin(eyeAngle) * 2, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Arma (pistola)
        const gunLength = 25;
        const gunWidth = 6;
        const gunX = p.x + Math.cos(eyeAngle) * p.radius;
        const gunY = p.y + Math.sin(eyeAngle) * p.radius;
        
        ctx.save();
        ctx.translate(gunX, gunY);
        ctx.rotate(eyeAngle);
        
        // Cuerpo del arma
        ctx.fillStyle = '#444466';
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 5;
        ctx.fillRect(0, -gunWidth/2, gunLength, gunWidth);
        ctx.fillRect(gunLength - 6, -gunWidth/2 - 2, 6, gunWidth + 4);
        ctx.shadowBlur = 0;
        
        // Detalle del arma
        ctx.fillStyle = '#666688';
        ctx.fillRect(4, -gunWidth/2 + 1, 8, gunWidth - 2);
        
        ctx.restore();
        
        // ===== LÍNEA DE APUNTE =====
        ctx.setLineDash([4, 8]);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x + Math.cos(eyeAngle) * (p.radius + 10), p.y + Math.sin(eyeAngle) * (p.radius + 10));
        const aimDist = 80;
        ctx.lineTo(p.x + Math.cos(eyeAngle) * aimDist, p.y + Math.sin(eyeAngle) * aimDist);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Punto de mira
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.arc(
            p.x + Math.cos(eyeAngle) * aimDist,
            p.y + Math.sin(eyeAngle) * aimDist,
            3, 0, Math.PI * 2
        );
        ctx.fill();
        
        // ===== BARRA DE SALUD SOBRE EL JUGADOR =====
        const healthBarWidth = 40;
        const healthBarHeight = 5;
        const healthBarX = p.x - healthBarWidth / 2;
        const healthBarY = p.y - p.radius - 15;
        
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.roundRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight, 3);
        ctx.fill();
        
        const healthPercent = p.health / p.maxHealth;
        const healthColor = healthPercent > 0.5 ? '#28A745' : healthPercent > 0.25 ? '#FFC107' : '#DC3545';
        ctx.fillStyle = healthColor;
        ctx.beginPath();
        ctx.roundRect(healthBarX + 1, healthBarY + 1, (healthBarWidth - 2) * healthPercent, healthBarHeight - 2, 2);
        ctx.fill();
        
        // ===== INDICADOR DE RECARGA =====
        if (this.player.reloading) {
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            const progress = this.player.reloadTime / this.player.reloadDuration;
            ctx.fillText(`🔄 ${Math.round(progress * 100)}%`, p.x, p.y - p.radius - 25);
        }
        
        // ===== INFO EN CANVAS =====
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`🧟 Zombies: ${this.zombies.length}`, 10, 10);
        ctx.fillText(`⚡ Tiempo: ${Math.floor(this.survivalTime)}s`, 10, 28);
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
    new ZombieSurvival();
});

// Estilos para animaciones
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
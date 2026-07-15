/**
 * 🎱 BILLIARDS
 * Juego de billar con física básica y colisiones
 */

class BilliardsGame {
    constructor() {
        // Canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Dimensiones
        this.width = 900;
        this.height = 500;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Configuración
        this.ballRadius = 10;
        this.friction = 0.985;
        this.minSpeed = 0.1;
        this.maxPower = 25;
        
        // Estado del juego
        this.balls = [];
        this.cueBall = null;
        this.shots = 0;
        this.pocketed = 0;
        this.highScore = parseInt(localStorage.getItem('billiardsHighScore')) || 0;
        this.isAiming = false;
        this.isDragging = false;
        this.shooting = false;
        this.gameOver = false;
        this.animationId = null;
        
        // Posiciones de inicio
        this.startX = this.width / 2;
        this.startY = this.height / 2 + 50;
        
        // Colores de bolas
        this.ballColors = [
            null, // 0 - vacío
            '#FFD700', // 1 - Amarillo
            '#0000FF', // 2 - Azul
            '#FF0000', // 3 - Rojo
            '#800080', // 4 - Púrpura
            '#FF8C00', // 5 - Naranja
            '#008000', // 6 - Verde
            '#8B0000', // 7 - Granate
            '#000000', // 8 - Negro
            '#FFD700', // 9 - Amarillo
            '#0000FF', // 10 - Azul
            '#FF0000', // 11 - Rojo
            '#800080', // 12 - Púrpura
            '#FF8C00', // 13 - Naranja
            '#008000', // 14 - Verde
            '#8B0000'  // 15 - Granate
        ];
        
        // Posiciones de las bolas
        this.ballPositions = this.getBallPositions();
        
        // Elementos DOM
        this.shotsDisplay = document.getElementById('shots');
        this.ballsRemainingDisplay = document.getElementById('ballsRemaining');
        this.accuracyDisplay = document.getElementById('accuracy');
        this.highScoreDisplay = document.getElementById('highScore');
        this.finalShotsDisplay = document.getElementById('finalShots');
        this.finalPocketedDisplay = document.getElementById('finalPocketed');
        this.powerFill = document.getElementById('powerFill');
        this.powerIndicator = document.getElementById('powerIndicator');
        this.startOverlay = document.getElementById('startOverlay');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        
        // Variables de arrastre
        this.dragStart = null;
        this.dragEnd = null;
        this.power = 0;
        
        this.init();
    }
    
    init() {
        this.highScoreDisplay.textContent = this.highScore;
        this.eventListeners();
        this.reset();
    }
    
    getBallPositions() {
        // Configuración de triángulo para las bolas
        const positions = [];
        const rows = 5;
        const spacing = 22;
        const offsetX = 160;
        const offsetY = this.height / 2;
        
        let ballNumber = 1;
        for (let row = 0; row < rows; row++) {
            const cols = row + 1;
            const startCol = -(cols - 1) / 2;
            for (let col = 0; col < cols; col++) {
                const x = this.width - offsetX + row * spacing * 0.866;
                const y = offsetY + (startCol + col) * spacing;
                positions.push({ x, y, number: ballNumber });
                ballNumber++;
            }
        }
        return positions;
    }
    
    reset() {
        // Crear bolas
        this.balls = [];
        this.pocketed = 0;
        this.shots = 0;
        this.gameOver = false;
        this.shooting = false;
        this.isAiming = false;
        this.isDragging = false;
        this.dragStart = null;
        this.dragEnd = null;
        this.power = 0;
        this.powerIndicator.style.display = 'none';
        this.gameOverOverlay.style.display = 'none';
        this.startOverlay.style.display = 'flex';
        
        // Bola blanca
        this.cueBall = {
            x: 150,
            y: this.height / 2,
            vx: 0,
            vy: 0,
            radius: this.ballRadius,
            color: '#FFFFFF',
            number: 0,
            isCue: true
        };
        
        // Bolas de colores
        for (const pos of this.ballPositions) {
            this.balls.push({
                x: pos.x,
                y: pos.y,
                vx: 0,
                vy: 0,
                radius: this.ballRadius,
                color: this.ballColors[pos.number],
                number: pos.number,
                isCue: false,
                pocketed: false
            });
        }
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.updateUI();
        this.draw();
    }
    
    startGame() {
        this.startOverlay.style.display = 'none';
        this.gameLoop();
    }
    
    eventListeners() {
        // Ratón
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.gameOver) return;
            if (this.startOverlay.style.display !== 'none') return;
            if (this.shooting) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.width / rect.width;
            const scaleY = this.height / rect.height;
            
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;
            
            // Verificar si el clic es en la bola blanca
            const dx = mouseX - this.cueBall.x;
            const dy = mouseY - this.cueBall.y;
            if (dx * dx + dy * dy < (this.cueBall.radius + 10) ** 2) {
                this.isDragging = true;
                this.dragStart = { x: mouseX, y: mouseY };
                this.isAiming = true;
                this.powerIndicator.style.display = 'flex';
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.width / rect.width;
            const scaleY = this.height / rect.height;
            
            this.dragEnd = {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
            
            // Calcular potencia
            const dx = this.dragEnd.x - this.dragStart.x;
            const dy = this.dragEnd.y - this.dragStart.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            this.power = Math.min(distance / 5, this.maxPower);
            
            // Actualizar barra de potencia
            this.powerFill.style.width = `${(this.power / this.maxPower) * 100}%`;
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            if (!this.isDragging) return;
            
            this.isDragging = false;
            this.isAiming = false;
            this.powerIndicator.style.display = 'none';
            
            if (this.power > 0.5) {
                this.shoot();
            }
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.isAiming = false;
                this.powerIndicator.style.display = 'none';
            }
        });
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameOver) return;
            if (this.startOverlay.style.display !== 'none') return;
            if (this.shooting) return;
            
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.width / rect.width;
            const scaleY = this.height / rect.height;
            
            const touchX = (touch.clientX - rect.left) * scaleX;
            const touchY = (touch.clientY - rect.top) * scaleY;
            
            const dx = touchX - this.cueBall.x;
            const dy = touchY - this.cueBall.y;
            if (dx * dx + dy * dy < (this.cueBall.radius + 15) ** 2) {
                this.isDragging = true;
                this.dragStart = { x: touchX, y: touchY };
                this.isAiming = true;
                this.powerIndicator.style.display = 'flex';
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.isDragging) return;
            
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.width / rect.width;
            const scaleY = this.height / rect.height;
            
            this.dragEnd = {
                x: (touch.clientX - rect.left) * scaleX,
                y: (touch.clientY - rect.top) * scaleY
            };
            
            const dx = this.dragEnd.x - this.dragStart.x;
            const dy = this.dragEnd.y - this.dragStart.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            this.power = Math.min(distance / 5, this.maxPower);
            
            this.powerFill.style.width = `${(this.power / this.maxPower) * 100}%`;
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!this.isDragging) return;
            
            this.isDragging = false;
            this.isAiming = false;
            this.powerIndicator.style.display = 'none';
            
            if (this.power > 0.5) {
                this.shoot();
            }
        }, { passive: false });
        
        // Botones
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.reset();
            this.startGame();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
            this.startGame();
        });
        
        document.getElementById('powerBtn').addEventListener('click', () => {
            // Mostrar/ocultar barra de potencia
        });
        
        // Teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.reset();
                this.startGame();
            }
        });
    }
    
    shoot() {
        if (this.shooting) return;
        
        const dx = this.dragStart.x - this.dragEnd.x;
        const dy = this.dragStart.y - this.dragEnd.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) return;
        
        const power = this.power;
        const angle = Math.atan2(dy, dx);
        
        this.cueBall.vx = Math.cos(angle) * power;
        this.cueBall.vy = Math.sin(angle) * power;
        
        this.shots++;
        this.shooting = true;
        this.isAiming = false;
        this.power = 0;
        
        this.updateUI();
    }
    
    gameLoop() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        if (this.gameOver) return;
        if (this.shooting) {
            this.updatePhysics();
        }
        
        // Verificar si todas las bolas se han detenido
        if (this.shooting && this.allBallsStopped()) {
            this.shooting = false;
            // Verificar si la bola blanca está en el hoyo
            if (this.cueBall.pocketed) {
                this.cueBall.pocketed = false;
                this.cueBall.x = 150;
                this.cueBall.y = this.height / 2;
                this.cueBall.vx = 0;
                this.cueBall.vy = 0;
                this.pocketed--;
            }
            
            // Verificar victoria
            const remaining = this.balls.filter(b => !b.pocketed).length;
            if (remaining === 0) {
                this.gameOver = true;
                this.finalShotsDisplay.textContent = this.shots;
                this.finalPocketedDisplay.textContent = this.pocketed;
                this.gameOverOverlay.style.display = 'flex';
                
                if (this.shots < this.highScore || this.highScore === 0) {
                    this.highScore = this.shots;
                    localStorage.setItem('billiardsHighScore', this.highScore);
                    this.highScoreDisplay.textContent = this.highScore;
                }
            }
            
            this.updateUI();
        }
    }
    
    updatePhysics() {
        // Aplicar fricción a todas las bolas
        for (const ball of [this.cueBall, ...this.balls]) {
            if (ball.pocketed) continue;
            ball.vx *= this.friction;
            ball.vy *= this.friction;
            ball.x += ball.vx;
            ball.y += ball.vy;
            
            // Detener si está muy lento
            if (Math.abs(ball.vx) < this.minSpeed && Math.abs(ball.vy) < this.minSpeed) {
                ball.vx = 0;
                ball.vy = 0;
            }
        }
        
        // Colisiones con paredes
        for (const ball of [this.cueBall, ...this.balls]) {
            if (ball.pocketed) continue;
            this.wallCollision(ball);
        }
        
        // Colisiones entre bolas
        const allBalls = [this.cueBall, ...this.balls];
        for (let i = 0; i < allBalls.length; i++) {
            for (let j = i + 1; j < allBalls.length; j++) {
                const a = allBalls[i];
                const b = allBalls[j];
                if (a.pocketed || b.pocketed) continue;
                this.ballCollision(a, b);
            }
        }
    }
    
    wallCollision(ball) {
        const r = ball.radius;
        if (ball.x - r < 0) {
            ball.x = r;
            ball.vx = Math.abs(ball.vx);
        }
        if (ball.x + r > this.width) {
            ball.x = this.width - r;
            ball.vx = -Math.abs(ball.vx);
        }
        if (ball.y - r < 0) {
            ball.y = r;
            ball.vy = Math.abs(ball.vy);
        }
        if (ball.y + r > this.height) {
            // Revisar si está en un hoyo
            const holes = [
                { x: 0, y: 0 },
                { x: this.width / 2, y: 0 },
                { x: this.width, y: 0 },
                { x: 0, y: this.height },
                { x: this.width / 2, y: this.height },
                { x: this.width, y: this.height }
            ];
            
            let pocketed = false;
            for (const hole of holes) {
                const dx = ball.x - hole.x;
                const dy = ball.y - hole.y;
                if (dx * dx + dy * dy < 400) {
                    ball.pocketed = true;
                    if (!ball.isCue) {
                        this.pocketed++;
                    }
                    pocketed = true;
                    break;
                }
            }
            
            if (!pocketed) {
                ball.y = this.height - r;
                ball.vy = -Math.abs(ball.vy);
            }
        }
    }
    
    ballCollision(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDist = a.radius + b.radius;
        
        if (distance < minDist && distance > 0) {
            // Separar las bolas
            const overlap = (minDist - distance) / 2;
            const angle = Math.atan2(dy, dx);
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            
            a.x -= cosA * overlap;
            a.y -= sinA * overlap;
            b.x += cosA * overlap;
            b.y += sinA * overlap;
            
            // Intercambiar velocidades (elástico)
            const dvx = a.vx - b.vx;
            const dvy = a.vy - b.vy;
            const dot = dvx * cosA + dvy * sinA;
            
            if (dot > 0) {
                a.vx -= dot * cosA;
                a.vy -= dot * sinA;
                b.vx += dot * cosA;
                b.vy += dot * sinA;
            }
        }
    }
    
    allBallsStopped() {
        if (this.cueBall.vx !== 0 || this.cueBall.vy !== 0) return false;
        for (const ball of this.balls) {
            if (!ball.pocketed && (ball.vx !== 0 || ball.vy !== 0)) return false;
        }
        return true;
    }
    
    updateUI() {
        this.shotsDisplay.textContent = this.shots;
        const remaining = this.balls.filter(b => !b.pocketed).length;
        this.ballsRemainingDisplay.textContent = remaining;
        
        const total = this.pocketed + remaining;
        const accuracy = total > 0 ? Math.round((this.pocketed / total) * 100) : 0;
        this.accuracyDisplay.textContent = `${accuracy}%`;
    }
    
    draw() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, w, h);
        
        // Fondo de la mesa
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#1a7a2a');
        gradient.addColorStop(0.5, '#1a8a2a');
        gradient.addColorStop(1, '#1a7a2a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        
        // Borde de la mesa
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.8)';
        ctx.lineWidth = 8;
        ctx.strokeRect(0, 0, w, h);
        
        // Borde interior más claro
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(4, 4, w - 8, h - 8);
        
        // Línea de salida
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(200, 20);
        ctx.lineTo(200, h - 20);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Dibujar hoyos
        const holes = [
            { x: 0, y: 0 },
            { x: w / 2, y: 0 },
            { x: w, y: 0 },
            { x: 0, y: h },
            { x: w / 2, y: h },
            { x: w, y: h }
        ];
        
        for (const hole of holes) {
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#0a1a0a';
            ctx.beginPath();
            ctx.arc(hole.x, hole.y, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Borde del hoyo
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(hole.x, hole.y, 18, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Sombra de la mesa (efecto 3D)
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 30;
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, w, h);
        ctx.shadowBlur = 0;
        
        // ===== DIBUJAR BOLAS =====
        const allBalls = [this.cueBall, ...this.balls];
        
        // Ordenar por profundidad (para efecto de superposición)
        allBalls.sort((a, b) => a.y - b.y);
        
        for (const ball of allBalls) {
            if (ball.pocketed) continue;
            
            const x = ball.x;
            const y = ball.y;
            const r = ball.radius;
            
            // Sombra de la bola
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            // Gradiente para efecto 3D
            const grad = ctx.createRadialGradient(
                x - r * 0.3, y - r * 0.3, r * 0.1,
                x, y, r
            );
            
            if (ball.isCue) {
                grad.addColorStop(0, '#FFFFFF');
                grad.addColorStop(0.7, '#F0F0F0');
                grad.addColorStop(1, '#CCCCCC');
            } else {
                grad.addColorStop(0, this.lightenColor(ball.color, 40));
                grad.addColorStop(0.7, ball.color);
                grad.addColorStop(1, this.darkenColor(ball.color, 0.6));
            }
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            // Brillo de la bola
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            // Número de la bola
            if (!ball.isCue && ball.number > 0) {
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.font = `${r}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Círculo blanco para el número
                ctx.shadowBlur = 0;
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.beginPath();
                ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#1a1a2e';
                ctx.font = `bold ${r * 0.9}px Inter, sans-serif`;
                ctx.fillText(ball.number, x, y + 1);
            }
        }
        
        // ===== LÍNEA DE APUNTE =====
        if (this.isAiming && this.dragStart && this.dragEnd) {
            const dx = this.dragStart.x - this.dragEnd.x;
            const dy = this.dragStart.y - this.dragEnd.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                const angle = Math.atan2(dy, dx);
                const power = Math.min(distance / 5, this.maxPower);
                
                // Línea de dirección
                ctx.setLineDash([8, 8]);
                ctx.strokeStyle = `rgba(255,255,255,${0.2 + power / this.maxPower * 0.3})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.cueBall.x, this.cueBall.y);
                ctx.lineTo(
                    this.cueBall.x + Math.cos(angle) * 80,
                    this.cueBall.y + Math.sin(angle) * 80
                );
                ctx.stroke();
                ctx.setLineDash([]);
                
                // Flecha de dirección
                const arrowSize = 10;
                const arrowX = this.cueBall.x + Math.cos(angle) * 70;
                const arrowY = this.cueBall.y + Math.sin(angle) * 70;
                ctx.fillStyle = `rgba(255,255,255,${0.3 + power / this.maxPower * 0.3})`;
                ctx.beginPath();
                ctx.moveTo(arrowX + Math.cos(angle) * arrowSize, arrowY + Math.sin(angle) * arrowSize);
                ctx.lineTo(arrowX - Math.sin(angle) * arrowSize * 0.5, arrowY + Math.cos(angle) * arrowSize * 0.5);
                ctx.lineTo(arrowX + Math.sin(angle) * arrowSize * 0.5, arrowY - Math.cos(angle) * arrowSize * 0.5);
                ctx.closePath();
                ctx.fill();
                
                // Círculo de potencia
                const powerRadius = 20 + power * 1.5;
                ctx.strokeStyle = `rgba(255,255,255,${0.1 + power / this.maxPower * 0.3})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(this.cueBall.x, this.cueBall.y, powerRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        // ===== EFECTO DE MOVIMIENTO (estela) =====
        for (const ball of allBalls) {
            if (ball.pocketed) continue;
            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            if (speed > 1) {
                for (let i = 1; i <= 3; i++) {
                    ctx.fillStyle = `rgba(255,255,255,${0.05 / i})`;
                    ctx.beginPath();
                    ctx.arc(
                        ball.x - ball.vx * i * 1.5,
                        ball.y - ball.vy * i * 1.5,
                        ball.radius - i * 1.5,
                        0, Math.PI * 2
                    );
                    ctx.fill();
                }
            }
        }
    }
    
    // ===== UTILIDADES DE COLOR =====
    lightenColor(color, amount) {
        if (!color) return '#FFFFFF';
        let r, g, b;
        if (color.startsWith('#')) {
            const hex = color.replace('#', '');
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else {
            return color;
        }
        r = Math.min(255, r + amount);
        g = Math.min(255, g + amount);
        b = Math.min(255, b + amount);
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    darkenColor(color, factor) {
        if (!color) return '#000000';
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

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', () => {
    new BilliardsGame();
});
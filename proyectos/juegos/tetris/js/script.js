/**
 * 🧩 JUEGO DE TETRIS
 * Clásico puzzle de bloques con todas las piezas y mecánicas
 */

class TetrisGame {
    constructor() {
        // Canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        // Dimensiones
        this.cols = 10;
        this.rows = 20;
        this.blockSize = 30;
        this.nextBlockSize = 24;
        
        // Estado del juego
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.highScore = parseInt(localStorage.getItem('tetrisHighScore')) || 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.dropInterval = null;
        this.dropSpeed = 500; // ms entre caídas
        
        // Piezas de Tetris
        this.pieces = {
            'I': { shape: [[1,1,1,1]], color: '#00f0f0' },
            'O': { shape: [[1,1],[1,1]], color: '#f0f000' },
            'T': { shape: [[0,1,0],[1,1,1]], color: '#a000f0' },
            'S': { shape: [[0,1,1],[1,1,0]], color: '#00f000' },
            'Z': { shape: [[1,1,0],[0,1,1]], color: '#f00000' },
            'L': { shape: [[1,0,0],[1,1,1]], color: '#f0a000' },
            'J': { shape: [[0,0,1],[1,1,1]], color: '#0000f0' }
        };
        
        this.pieceNames = ['I', 'O', 'T', 'S', 'Z', 'L', 'J'];
        
        // Elementos DOM
        this.scoreDisplay = document.getElementById('score');
        this.linesDisplay = document.getElementById('lines');
        this.levelDisplay = document.getElementById('level');
        this.highScoreDisplay = document.getElementById('highScore');
        this.finalScoreDisplay = document.getElementById('finalScore');
        this.finalLinesDisplay = document.getElementById('finalLines');
        this.pauseOverlay = document.getElementById('pauseOverlay');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        
        // Inicializar
        this.init();
    }
    
    init() {
        // Mostrar high score
        this.highScoreDisplay.textContent = this.highScore;
        
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
            
            // Pausa
            if (key === ' ' || key === 'Space' || key === 'p' || key === 'P') {
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
            
            if (this.gamePaused || this.gameOver || !this.gameRunning) return;
            
            switch(key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.rotatePiece();
                    break;
                case ' ':
                case 'Space':
                    e.preventDefault();
                    this.hardDrop();
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
        
        // Controles táctiles
        document.querySelectorAll('.touch-btn[data-direction]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.handleTouchDirection(direction);
            });
            
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.handleTouchDirection(direction);
            });
        });
        
        document.getElementById('touchRotate').addEventListener('click', (e) => {
            e.preventDefault();
            if (!this.gamePaused && !this.gameOver && this.gameRunning) {
                this.rotatePiece();
            }
        });
        
        document.getElementById('touchDrop').addEventListener('click', (e) => {
            e.preventDefault();
            if (!this.gamePaused && !this.gameOver && this.gameRunning) {
                this.hardDrop();
            }
        });
        
        // Cerrar overlays
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
            case 'left':
                this.movePiece(-1, 0);
                break;
            case 'right':
                this.movePiece(1, 0);
                break;
            case 'down':
                this.movePiece(0, 1);
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
    
    reset() {
        // Limpiar tablero
        this.board = Array.from({ length: this.rows }, () => 
            Array.from({ length: this.cols }, () => 0)
        );
        
        // Resetear estado
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropSpeed = 500;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.currentPiece = null;
        this.nextPiece = null;
        
        // Ocultar overlays
        this.pauseOverlay.style.display = 'none';
        this.gameOverOverlay.style.display = 'none';
        document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
        
        // Actualizar UI
        this.updateUI();
        this.draw();
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
    }
    
    start() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gameOver = false;
        this.gamePaused = false;
        this.pauseOverlay.style.display = 'none';
        this.gameOverOverlay.style.display = 'none';
        
        // Generar primera pieza
        this.nextPiece = this.createRandomPiece();
        this.spawnPiece();
        
        // Iniciar caída automática
        if (this.dropInterval) {
            clearInterval(this.dropInterval);
        }
        this.dropInterval = setInterval(() => {
            if (!this.gamePaused && !this.gameOver) {
                this.movePiece(0, 1);
            }
        }, this.dropSpeed);
        
        this.draw();
    }
    
    createRandomPiece() {
        const name = this.pieceNames[Math.floor(Math.random() * this.pieceNames.length)];
        const piece = this.pieces[name];
        return {
            name: name,
            shape: piece.shape.map(row => [...row]),
            color: piece.color,
            x: Math.floor((this.cols - piece.shape[0].length) / 2),
            y: 0
        };
    }
    
    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.currentPiece.x = Math.floor((this.cols - this.currentPiece.shape[0].length) / 2);
        this.currentPiece.y = 0;
        
        this.nextPiece = this.createRandomPiece();
        this.drawNextPiece();
        
        // Verificar game over
        if (!this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
            this.endGame();
        }
    }
    
    isValidPosition(shape, offsetX, offsetY) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] !== 0) {
                    const boardX = offsetX + col;
                    const boardY = offsetY + row;
                    
                    if (boardX < 0 || boardX >= this.cols || boardY >= this.rows || boardY < 0) {
                        return false;
                    }
                    if (boardY >= 0 && this.board[boardY][boardX] !== 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    movePiece(dx, dy) {
        if (!this.currentPiece || this.gamePaused || this.gameOver) return;
        
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        if (this.isValidPosition(this.currentPiece.shape, newX, newY)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            this.draw();
            return true;
        }
        
        // Si no puede moverse hacia abajo, fijar la pieza
        if (dy === 1) {
            this.lockPiece();
        }
        
        return false;
    }
    
    rotatePiece() {
        if (!this.currentPiece || this.gamePaused || this.gameOver) return;
        
        const shape = this.currentPiece.shape;
        const rotated = shape[0].map((val, index) => 
            shape.map(row => row[index]).reverse()
        );
        
        // Kiick de rotación (intentar mover si la rotación no es válida)
        const kicks = [0, -1, 1, -2, 2];
        for (const kick of kicks) {
            if (this.isValidPosition(rotated, this.currentPiece.x + kick, this.currentPiece.y)) {
                this.currentPiece.shape = rotated;
                this.currentPiece.x += kick;
                this.draw();
                return;
            }
        }
    }
    
    lockPiece() {
        if (!this.currentPiece) return;
        
        // Fijar pieza en el tablero
        const shape = this.currentPiece.shape;
        const offsetX = this.currentPiece.x;
        const offsetY = this.currentPiece.y;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] !== 0) {
                    const boardX = offsetX + col;
                    const boardY = offsetY + row;
                    if (boardY >= 0 && boardY < this.rows && boardX >= 0 && boardX < this.cols) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        // Verificar líneas completas
        this.checkLines();
        
        // Generar nueva pieza
        this.spawnPiece();
        this.draw();
    }
    
    checkLines() {
        let linesCleared = 0;
        let rowsToClear = [];
        
        for (let row = 0; row < this.rows; row++) {
            if (this.board[row].every(cell => cell !== 0)) {
                rowsToClear.push(row);
            }
        }
        
        if (rowsToClear.length > 0) {
            // Eliminar líneas
            for (const row of rowsToClear.sort((a, b) => b - a)) {
                this.board.splice(row, 1);
                this.board.unshift(Array(this.cols).fill(0));
            }
            
            linesCleared = rowsToClear.length;
            
            // Actualizar puntaje
            const points = [0, 100, 300, 500, 800];
            this.score += points[linesCleared] * this.level;
            this.lines += linesCleared;
            
            // Actualizar nivel
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropSpeed = Math.max(100, 500 - (this.level - 1) * 30);
            
            // Actualizar intervalo
            if (this.dropInterval) {
                clearInterval(this.dropInterval);
                this.dropInterval = setInterval(() => {
                    if (!this.gamePaused && !this.gameOver) {
                        this.movePiece(0, 1);
                    }
                }, this.dropSpeed);
            }
            
            // Actualizar UI
            this.updateUI();
        }
    }
    
    hardDrop() {
        if (!this.currentPiece || this.gamePaused || this.gameOver) return;
        
        let dropped = false;
        while (this.movePiece(0, 1)) {
            dropped = true;
        }
        if (dropped) {
            this.lockPiece();
        }
    }
    
    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
        
        if (this.dropInterval) {
            clearInterval(this.dropInterval);
            this.dropInterval = null;
        }
        
        // Actualizar high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('tetrisHighScore', this.highScore);
            this.highScoreDisplay.textContent = this.highScore;
        }
        
        // Mostrar game over
        this.finalScoreDisplay.textContent = this.score;
        this.finalLinesDisplay.textContent = this.lines;
        this.gameOverOverlay.style.display = 'flex';
        
        this.draw();
    }
    
    updateUI() {
        this.scoreDisplay.textContent = this.score;
        this.linesDisplay.textContent = this.lines;
        this.levelDisplay.textContent = this.level;
        this.highScoreDisplay.textContent = this.highScore;
    }
    
    draw() {
        const ctx = this.ctx;
        const blockSize = this.blockSize;
        
        // Limpiar canvas
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar grid (sutil)
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 0.5;
        for (let row = 0; row <= this.rows; row++) {
            ctx.beginPath();
            ctx.moveTo(0, row * blockSize);
            ctx.lineTo(this.canvas.width, row * blockSize);
            ctx.stroke();
        }
        for (let col = 0; col <= this.cols; col++) {
            ctx.beginPath();
            ctx.moveTo(col * blockSize, 0);
            ctx.lineTo(col * blockSize, this.canvas.height);
            ctx.stroke();
        }
        
        // Dibujar piezas fijas
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const color = this.board[row][col];
                if (color !== 0) {
                    this.drawBlock(ctx, col, row, color, blockSize);
                }
            }
        }
        
        // Dibujar pieza actual
        if (this.currentPiece) {
            const piece = this.currentPiece;
            for (let row = 0; row < piece.shape.length; row++) {
                for (let col = 0; col < piece.shape[row].length; col++) {
                    if (piece.shape[row][col] !== 0) {
                        const boardX = piece.x + col;
                        const boardY = piece.y + row;
                        if (boardY >= 0 && boardY < this.rows) {
                            this.drawBlock(ctx, boardX, boardY, piece.color, blockSize);
                        }
                    }
                }
            }
        }
    }
    
    drawBlock(ctx, x, y, color, size) {
        const padding = 1;
        ctx.fillStyle = color;
        ctx.shadowColor = 'rgba(255,255,255,0.1)';
        ctx.shadowBlur = 5;
        ctx.fillRect(x * size + padding, y * size + padding, size - padding * 2, size - padding * 2);
        ctx.shadowBlur = 0;
        
        // Efecto de brillo
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x * size + padding, y * size + padding, size - padding * 2, 3);
    }
    
    drawNextPiece() {
        const ctx = this.nextCtx;
        const size = this.nextBlockSize;
        const canvasSize = this.nextCanvas.width;
        
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvasSize, canvasSize);
        
        if (!this.nextPiece) return;
        
        const shape = this.nextPiece.shape;
        const cols = shape[0].length;
        const rows = shape.length;
        const offsetX = (canvasSize - cols * size) / 2;
        const offsetY = (canvasSize - rows * size) / 2;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (shape[row][col] !== 0) {
                    const x = offsetX + col * size;
                    const y = offsetY + row * size;
                    ctx.fillStyle = this.nextPiece.color;
                    ctx.shadowColor = 'rgba(255,255,255,0.1)';
                    ctx.shadowBlur = 5;
                    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
                    ctx.shadowBlur = 0;
                    
                    // Efecto de brillo
                    ctx.fillStyle = 'rgba(255,255,255,0.15)';
                    ctx.fillRect(x + 1, y + 1, size - 2, 3);
                }
            }
        }
    }
}

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', () => {
    new TetrisGame();
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
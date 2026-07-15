/**
 * 🧩 2048
 * Combina números iguales para llegar a 2048
 */

class Game2048 {
    constructor() {
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('game2048_highScore')) || 0;
        this.gameOver = false;
        this.won = false;
        this.continue = false;
        
        // Historial para deshacer
        this.history = [];
        this.maxHistory = 20;
        
        // Elementos DOM
        this.board = document.getElementById('board');
        this.scoreDisplay = document.getElementById('score');
        this.highScoreDisplay = document.getElementById('highScore');
        this.finalScoreDisplay = document.getElementById('finalScore');
        this.victoryScoreDisplay = document.getElementById('victoryScore');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.victoryOverlay = document.getElementById('victoryOverlay');
        
        this.init();
    }
    
    init() {
        this.highScoreDisplay.textContent = this.highScore;
        this.eventListeners();
        this.reset();
    }
    
    eventListeners() {
        // Teclado
        document.addEventListener('keydown', (e) => {
            const key = e.key;
            
            if (key === 'r' || key === 'R') {
                this.reset();
                return;
            }
            
            if (key === 'z' || key === 'Z') {
                if (e.ctrlKey || e.metaKey) return;
                this.undo();
                return;
            }
            
            let direction = null;
            if (key === 'ArrowUp' || key === 'w' || key === 'W') direction = 'up';
            else if (key === 'ArrowDown' || key === 's' || key === 'S') direction = 'down';
            else if (key === 'ArrowLeft' || key === 'a' || key === 'A') direction = 'left';
            else if (key === 'ArrowRight' || key === 'd' || key === 'D') direction = 'right';
            
            if (direction) {
                e.preventDefault();
                this.move(direction);
            }
        });
        
        // Botones
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.reset();
        });
        
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undo();
        });
        
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.reset();
        });
        
        document.getElementById('continueBtn').addEventListener('click', () => {
            this.continue = true;
            this.victoryOverlay.style.display = 'none';
        });
        
        document.getElementById('victoryRestartBtn').addEventListener('click', () => {
            this.reset();
        });
        
        // Controles táctiles
        document.querySelectorAll('.touch-btn[data-direction]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.move(direction);
            });
            
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.move(direction);
            });
        });
        
        // Soporte para swipe en móvil
        let startX, startY;
        const board = this.board;
        
        board.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        }, { passive: true });
        
        board.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        board.addEventListener('touchend', (e) => {
            if (startX === undefined || startY === undefined) return;
            
            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            
            const diffX = endX - startX;
            const diffY = endY - startY;
            
            if (Math.abs(diffX) < 20 && Math.abs(diffY) < 20) return;
            
            let direction = null;
            if (Math.abs(diffX) > Math.abs(diffY)) {
                direction = diffX > 0 ? 'right' : 'left';
            } else {
                direction = diffY > 0 ? 'down' : 'up';
            }
            
            this.move(direction);
            
            startX = undefined;
            startY = undefined;
        }, { passive: true });
    }
    
    reset() {
        this.grid = Array.from({ length: this.size }, () => 
            Array.from({ length: this.size }, () => 0)
        );
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.continue = false;
        this.history = [];
        
        this.gameOverOverlay.style.display = 'none';
        this.victoryOverlay.style.display = 'none';
        
        this.addRandomTile();
        this.addRandomTile();
        this.render();
        this.updateUI();
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length === 0) return false;
        
        const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        this.grid[cell.row][cell.col] = value;
        
        // Guardar estado para deshacer
        this.saveHistory();
        
        return true;
    }
    
    saveHistory() {
        const state = {
            grid: this.grid.map(row => [...row]),
            score: this.score
        };
        this.history.push(state);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }
    
    undo() {
        if (this.history.length === 0 || this.gameOver) return;
        
        const state = this.history.pop();
        this.grid = state.grid;
        this.score = state.score;
        this.gameOver = false;
        
        this.render();
        this.updateUI();
    }
    
    move(direction) {
        if (this.gameOver) return;
        
        const moved = this.moveGrid(direction);
        if (!moved) return;
        
        // Verificar si se alcanzó 2048
        if (!this.won && !this.continue) {
            for (let row = 0; row < this.size; row++) {
                for (let col = 0; col < this.size; col++) {
                    if (this.grid[row][col] === 2048) {
                        this.won = true;
                        this.victoryScoreDisplay.textContent = this.score;
                        this.victoryOverlay.style.display = 'flex';
                        return;
                    }
                }
            }
        }
        
        this.addRandomTile();
        this.render();
        this.updateUI();
        
        // Verificar game over
        if (this.isGameOver()) {
            this.gameOver = true;
            this.finalScoreDisplay.textContent = this.score;
            this.gameOverOverlay.style.display = 'flex';
        }
    }
    
    moveGrid(direction) {
        let moved = false;
        const newGrid = this.grid.map(row => [...row]);
        
        const rows = this.size;
        const cols = this.size;
        
        // Orden de iteración según dirección
        const rowStart = direction === 'down' ? rows - 1 : 0;
        const rowEnd = direction === 'down' ? -1 : rows;
        const rowStep = direction === 'down' ? -1 : 1;
        
        const colStart = direction === 'right' ? cols - 1 : 0;
        const colEnd = direction === 'right' ? -1 : cols;
        const colStep = direction === 'right' ? -1 : 1;
        
        // Determinar si iteramos por filas o columnas
        const isVertical = direction === 'up' || direction === 'down';
        
        for (let i = 0; i < rows; i++) {
            const row = isVertical ? i : (direction === 'left' ? i : rows - 1 - i);
            const col = isVertical ? (direction === 'up' ? i : rows - 1 - i) : i;
            
            // Obtener los valores en la línea
            const line = [];
            const positions = [];
            
            if (isVertical) {
                for (let j = 0; j < rows; j++) {
                    const r = direction === 'up' ? j : rows - 1 - j;
                    positions.push({ row: r, col: col });
                    line.push(this.grid[r][col]);
                }
            } else {
                for (let j = 0; j < cols; j++) {
                    const c = direction === 'left' ? j : cols - 1 - j;
                    positions.push({ row: row, col: c });
                    line.push(this.grid[row][c]);
                }
            }
            
            // Filtrar ceros
            const filtered = line.filter(val => val !== 0);
            
            // Combinar
            const merged = [];
            let scoreGain = 0;
            
            for (let j = 0; j < filtered.length; j++) {
                if (j + 1 < filtered.length && filtered[j] === filtered[j + 1]) {
                    const value = filtered[j] * 2;
                    merged.push(value);
                    scoreGain += value;
                    j++; // Saltar el siguiente
                } else {
                    merged.push(filtered[j]);
                }
            }
            
            // Rellenar con ceros
            while (merged.length < rows) {
                merged.push(0);
            }
            
            // Actualizar grid
            for (let j = 0; j < positions.length; j++) {
                const pos = positions[j];
                const newValue = merged[j];
                if (this.grid[pos.row][pos.col] !== newValue) {
                    moved = true;
                }
                this.grid[pos.row][pos.col] = newValue;
            }
            
            this.score += scoreGain;
        }
        
        return moved;
    }
    
    isGameOver() {
        // Verificar celdas vacías
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] === 0) return false;
            }
        }
        
        // Verificar si hay números iguales adyacentes
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const current = this.grid[row][col];
                // Derecha
                if (col + 1 < this.size && this.grid[row][col + 1] === current) return false;
                // Abajo
                if (row + 1 < this.size && this.grid[row + 1][col] === current) return false;
            }
        }
        
        return true;
    }
    
    render() {
        this.board.innerHTML = '';
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                const value = this.grid[row][col];
                cell.dataset.value = value;
                cell.textContent = value > 0 ? value : '';
                this.board.appendChild(cell);
            }
        }
    }
    
    updateUI() {
        this.scoreDisplay.textContent = this.score;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('game2048_highScore', this.highScore);
        }
        this.highScoreDisplay.textContent = this.highScore;
    }
}

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
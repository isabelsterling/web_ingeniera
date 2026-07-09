/**
 * 🎨 PIXEL ART
 * Dibuja en una cuadrícula estilo Minecraft
 */

class PixelArt {
    constructor() {
        // Canvas
        this.canvas = document.getElementById('pixelCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Configuración
        this.gridSize = 16;
        this.pixelSize = 0;
        this.colors = [];
        this.currentColor = '#6C63FF';
        this.currentTool = 'pencil';
        this.isDrawing = false;
        this.history = [];
        this.maxHistory = 30;
        
        // Estado del grid
        this.grid = [];
        this.originalGrid = [];
        
        // Paleta de colores predefinida (colores Minecraft)
        this.paletteColors = [
            '#FFFFFF', '#D4D4D4', '#8B8B8B', '#000000',
            '#FF6B6B', '#FF4444', '#CC0000', '#880000',
            '#FF9F43', '#FF6B00', '#CC5500', '#883300',
            '#FECA57', '#FFD93D', '#CCAA00', '#887700',
            '#6BCB77', '#44AA44', '#228822', '#115511',
            '#4D96FF', '#3366CC', '#224488', '#112244',
            '#9B59B6', '#7D3C98', '#5B2D6E', '#3D1D4A',
            '#FF85A1', '#E84393', '#B8206A', '#8A104A'
        ];
        
        // Elementos DOM
        this.colorPalette = document.getElementById('colorPalette');
        this.colorPreview = document.getElementById('colorPreview');
        this.colorHex = document.getElementById('colorHex');
        this.pixelCount = document.getElementById('pixelCount');
        this.pixelPosition = document.getElementById('pixelPosition');
        
        this.init();
    }
    
    init() {
        this.setupColors();
        this.setupGrid();
        this.eventListeners();
        this.render();
    }
    
    setupColors() {
        this.colorPalette.innerHTML = '';
        this.paletteColors.forEach(color => {
            const btn = document.createElement('button');
            btn.className = 'color-btn';
            if (color === this.currentColor) btn.classList.add('active');
            btn.style.background = color;
            btn.dataset.color = color;
            btn.addEventListener('click', () => {
                this.selectColor(color);
            });
            this.colorPalette.appendChild(btn);
        });
    }
    
    selectColor(color) {
        this.currentColor = color;
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === color);
        });
        this.colorPreview.style.background = color;
        this.colorHex.textContent = color;
    }
    
    setupGrid() {
        this.pixelSize = this.calculatePixelSize();
        this.canvas.width = this.gridSize * this.pixelSize;
        this.canvas.height = this.gridSize * this.pixelSize;
        
        this.grid = Array.from({ length: this.gridSize }, () =>
            Array.from({ length: this.gridSize }, () => '#1a1a2e')
        );
        
        this.originalGrid = this.grid.map(row => [...row]);
        this.history = [];
        this.updatePixelCount();
    }
    
    calculatePixelSize() {
        const maxSize = 500;
        const size = Math.floor(maxSize / this.gridSize);
        return Math.min(size, 30);
    }
    
    eventListeners() {
        // Ratón
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDrawing = true;
            const pos = this.getPixelPosition(e);
            if (pos) {
                this.handleDraw(pos.x, pos.y);
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const pos = this.getPixelPosition(e);
            if (pos) {
                this.pixelPosition.textContent = `Posición: (${pos.x}, ${pos.y})`;
                this.canvas.style.cursor = 'crosshair';
                
                if (this.isDrawing) {
                    this.handleDraw(pos.x, pos.y);
                }
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            if (this.isDrawing) {
                this.isDrawing = false;
                this.saveHistory();
            }
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            if (this.isDrawing) {
                this.isDrawing = false;
                this.saveHistory();
            }
        });
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isDrawing = true;
            const touch = e.touches[0];
            const pos = this.getPixelPositionTouch(touch);
            if (pos) {
                this.handleDraw(pos.x, pos.y);
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const pos = this.getPixelPositionTouch(touch);
            if (pos) {
                this.pixelPosition.textContent = `Posición: (${pos.x}, ${pos.y})`;
                if (this.isDrawing) {
                    this.handleDraw(pos.x, pos.y);
                }
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.isDrawing) {
                this.isDrawing = false;
                this.saveHistory();
            }
        }, { passive: false });
        
        // Botones de herramienta
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
                this.canvas.style.cursor = this.currentTool === 'picker' ? 'crosshair' : 'crosshair';
            });
        });
        
        // Botones de tamaño
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.gridSize = parseInt(btn.dataset.size);
                this.setupGrid();
                this.render();
                this.updatePixelCount();
            });
        });
        
        // Botones de control
        document.getElementById('clearBtn').addEventListener('click', () => {
            if (confirm('¿Limpiar todo el dibujo?')) {
                this.clearGrid();
            }
        });
        
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undo();
        });
        
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveToLocalStorage();
        });
        
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportPNG();
        });
        
        // Teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.undo();
            }
            if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.saveToLocalStorage();
            }
        });
    }
    
    getPixelPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const x = Math.floor(((e.clientX - rect.left) * scaleX) / this.pixelSize);
        const y = Math.floor(((e.clientY - rect.top) * scaleY) / this.pixelSize);
        
        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            return { x, y };
        }
        return null;
    }
    
    getPixelPositionTouch(touch) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const x = Math.floor(((touch.clientX - rect.left) * scaleX) / this.pixelSize);
        const y = Math.floor(((touch.clientY - rect.top) * scaleY) / this.pixelSize);
        
        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            return { x, y };
        }
        return null;
    }
    
    handleDraw(x, y) {
        if (this.currentTool === 'pencil') {
            this.grid[y][x] = this.currentColor;
        } else if (this.currentTool === 'eraser') {
            this.grid[y][x] = '#1a1a2e';
        } else if (this.currentTool === 'fill') {
            this.floodFill(x, y, this.grid[y][x], this.currentColor);
        } else if (this.currentTool === 'picker') {
            const color = this.grid[y][x];
            if (color !== '#1a1a2e') {
                this.selectColor(color);
            }
        }
        this.render();
        this.updatePixelCount();
    }
    
    floodFill(x, y, targetColor, newColor) {
        if (targetColor === newColor) return;
        if (targetColor === '#1a1a2e') return;
        
        const stack = [{ x, y }];
        const visited = new Set();
        
        while (stack.length > 0) {
            const current = stack.pop();
            const key = `${current.x},${current.y}`;
            
            if (visited.has(key)) continue;
            if (current.x < 0 || current.x >= this.gridSize) continue;
            if (current.y < 0 || current.y >= this.gridSize) continue;
            if (this.grid[current.y][current.x] !== targetColor) continue;
            
            visited.add(key);
            this.grid[current.y][current.x] = newColor;
            
            stack.push({ x: current.x + 1, y: current.y });
            stack.push({ x: current.x - 1, y: current.y });
            stack.push({ x: current.x, y: current.y + 1 });
            stack.push({ x: current.x, y: current.y - 1 });
        }
    }
    
    saveHistory() {
        const state = this.grid.map(row => [...row]);
        this.history.push(state);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }
    
    undo() {
        if (this.history.length === 0) return;
        this.grid = this.history.pop();
        this.render();
        this.updatePixelCount();
    }
    
    clearGrid() {
        this.grid = Array.from({ length: this.gridSize }, () =>
            Array.from({ length: this.gridSize }, () => '#1a1a2e')
        );
        this.history = [];
        this.render();
        this.updatePixelCount();
    }
    
    render() {
        const ctx = this.ctx;
        const size = this.pixelSize;
        
        // Dibujar cada píxel
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                ctx.fillStyle = this.grid[row][col];
                ctx.fillRect(col * size, row * size, size, size);
            }
        }
        
        // Dibujar líneas de cuadrícula (solo si el tamaño es adecuado)
        if (this.gridSize <= 32) {
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 0.5;
            for (let i = 0; i <= this.gridSize; i++) {
                ctx.beginPath();
                ctx.moveTo(i * size, 0);
                ctx.lineTo(i * size, this.canvas.height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * size);
                ctx.lineTo(this.canvas.width, i * size);
                ctx.stroke();
            }
        }
    }
    
    updatePixelCount() {
        let count = 0;
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] !== '#1a1a2e') count++;
            }
        }
        this.pixelCount.textContent = `Píxeles: ${count}/${this.gridSize * this.gridSize}`;
    }
    
    saveToLocalStorage() {
        const data = {
            grid: this.grid,
            gridSize: this.gridSize,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('pixelArt_data', JSON.stringify(data));
        this.showNotification('¡Dibujo guardado!', 'success');
    }
    
    loadFromLocalStorage() {
        const saved = localStorage.getItem('pixelArt_data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.gridSize = data.gridSize;
                this.grid = data.grid;
                this.setupGrid();
                this.render();
                this.updatePixelCount();
                this.showNotification('¡Dibujo cargado!', 'success');
            } catch {
                this.showNotification('Error al cargar', 'error');
            }
        } else {
            this.showNotification('No hay dibujo guardado', 'info');
        }
    }
    
    exportPNG() {
        // Crear imagen en alta resolución
        const exportSize = 512;
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = exportSize;
        exportCanvas.height = exportSize;
        const exportCtx = exportCanvas.getContext('2d');
        
        const pixelSize = exportSize / this.gridSize;
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                exportCtx.fillStyle = this.grid[row][col];
                exportCtx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
            }
        }
        
        const link = document.createElement('a');
        link.download = `pixel-art-${Date.now()}.png`;
        link.href = exportCanvas.toDataURL('image/png');
        link.click();
        this.showNotification('¡Imagen exportada!', 'success');
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
        }, 3000);
    }
}

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', () => {
    new PixelArt();
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
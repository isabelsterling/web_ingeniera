/**
 * CONVERSOR DE MONEDAS COMPLETO
 * Funcionalidades: API en tiempo real, historial, favoritos, gráfico, modo oscuro
 */

class CurrencyConverter {
    constructor() {
        // Tasas de cambio
        this.rates = {};
        this.history = [];
        this.favorites = [];
        this.chart = null;
        this.lastUpdate = null;
        
        // Elementos DOM
        this.amountInput = document.getElementById('amount');
        this.fromCurrency = document.getElementById('fromCurrency');
        this.toCurrency = document.getElementById('toCurrency');
        this.fromFlag = document.getElementById('fromFlag');
        this.toFlag = document.getElementById('toFlag');
        this.resultAmount = document.getElementById('resultAmount');
        this.resultSymbol = document.getElementById('resultSymbol');
        this.rateInfo = document.getElementById('rateInfo');
        this.lastUpdateSpan = document.getElementById('lastUpdate');
        this.swapBtn = document.getElementById('swapCurrencies');
        this.refreshBtn = document.getElementById('refreshRates');
        this.themeToggle = document.getElementById('themeToggle');
        
        // Tabs
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');
        
        // Historial
        this.clearHistoryBtn = document.getElementById('clearHistory');
        this.historyList = document.getElementById('historyList');
        
        // Favoritos
        this.addFavoriteBtn = document.getElementById('addFavorite');
        this.favoritesList = document.getElementById('favoritesList');
        
        // Gráfico
        this.chartPeriod = document.getElementById('chartPeriod');
        
        // Loading
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        this.init();
    }
    
    async init() {
        this.cargarDatos();
        this.eventListeners();
        await this.obtenerTasas();
        this.convertir();
        this.actualizarTasasReferencia();
        this.initChart();
    }
    
    // Cargar datos desde localStorage
    cargarDatos() {
        const historySaved = localStorage.getItem('converter_history');
        if (historySaved) {
            this.history = JSON.parse(historySaved);
            this.renderHistory();
        }
        
        const favoritesSaved = localStorage.getItem('converter_favorites');
        if (favoritesSaved) {
            this.favorites = JSON.parse(favoritesSaved);
            this.renderFavorites();
        }
        
        const theme = localStorage.getItem('converter_theme');
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            if (this.themeToggle) this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
    
    // Guardar datos
    guardarHistorial() {
        localStorage.setItem('converter_history', JSON.stringify(this.history));
    }
    
    guardarFavoritos() {
        localStorage.setItem('converter_favorites', JSON.stringify(this.favorites));
    }
    
    // Obtener tasas de cambio
    async obtenerTasas() {
        this.mostrarLoading(true);
        
        const from = this.fromCurrency.value;
        
        try {
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
            const data = await response.json();
            this.rates = data.rates;
            this.lastUpdate = new Date();
            this.lastUpdateSpan.textContent = `Última actualización: ${this.lastUpdate.toLocaleTimeString()}`;
            this.mostrarLoading(false);
        } catch (error) {
            console.error('Error:', error);
            // Fallback
            this.rates = {
                'PEN': 1, 'USD': 0.27, 'EUR': 0.25, 'MXN': 4.6,
                'CLP': 253, 'ARS': 98, 'COP': 1080, 'BRL': 1.38,
                'GBP': 0.21, 'JPY': 41
            };
            this.mostrarLoading(false);
            this.mostrarNotificacion('Usando tasas locales', 'warning');
        }
    }
    
    // Convertir moneda
    convertir() {
        const amount = parseFloat(this.amountInput.value);
        const from = this.fromCurrency.value;
        const to = this.toCurrency.value;
        
        if (isNaN(amount) || amount <= 0) {
            this.resultAmount.textContent = '0.00';
            return;
        }
        
        const fromRate = this.rates[from] || 1;
        const toRate = this.rates[to] || 1;
        const result = (amount / fromRate) * toRate;
        
        const toOption = this.toCurrency.options[this.toCurrency.selectedIndex];
        const symbol = toOption.getAttribute('data-symbol') || '';
        
        this.resultAmount.textContent = result.toFixed(2);
        this.resultSymbol.textContent = symbol;
        
        const rate = (1 / fromRate) * toRate;
        this.rateInfo.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
        
        this.guardarEnHistorial(amount, from, to, result);
        this.actualizarFlags();
        this.actualizarTasasReferencia();
    }
    
    // Guardar en historial
    guardarEnHistorial(amount, from, to, result) {
        const conversion = {
            id: Date.now(),
            amount: amount,
            from: from,
            to: to,
            result: result,
            date: new Date().toISOString()
        };
        
        this.history.unshift(conversion);
        if (this.history.length > 20) this.history.pop();
        this.guardarHistorial();
        this.renderHistory();
    }
    
    // Renderizar historial
    renderHistory() {
        if (!this.historyList) return;
        
        if (this.history.length === 0) {
            this.historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-history"></i>
                    <p>No hay conversiones recientes</p>
                </div>
            `;
            return;
        }
        
        this.historyList.innerHTML = this.history.map(item => {
            const date = new Date(item.date);
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
            
            return `
                <div class="history-item" data-id="${item.id}">
                    <div class="history-info">
                        <span class="history-conversion">${item.amount} ${item.from} → ${item.result.toFixed(2)} ${item.to}</span>
                        <span class="history-date">${formattedDate}</span>
                    </div>
                    <div class="history-actions">
                        <button class="use-history" data-from="${item.from}" data-to="${item.to}">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="remove-history" data-id="${item.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Event listeners
        document.querySelectorAll('.use-history').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const from = btn.dataset.from;
                const to = btn.dataset.to;
                this.fromCurrency.value = from;
                this.toCurrency.value = to;
                this.actualizarFlags();
                await this.obtenerTasas();
                this.convertir();
            });
        });
        
        document.querySelectorAll('.remove-history').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                this.history = this.history.filter(h => h.id !== id);
                this.guardarHistorial();
                this.renderHistory();
                this.mostrarNotificacion('Conversión eliminada', 'info');
            });
        });
    }
    
    // Renderizar favoritos
    renderFavorites() {
        if (!this.favoritesList) return;
        
        if (this.favorites.length === 0) {
            this.favoritesList.innerHTML = `
                <div class="empty-favorites">
                    <i class="fas fa-star"></i>
                    <p>No hay favoritos</p>
                    <p class="hint">Agrega el par actual como favorito</p>
                </div>
            `;
            return;
        }
        
        this.favoritesList.innerHTML = this.favorites.map(item => {
            const rate = (1 / (this.rates[item.from] || 1)) * (this.rates[item.to] || 1);
            
            return `
                <div class="favorite-item" data-id="${item.id}">
                    <div class="favorite-info">
                        <span class="favorite-pair">${item.from} → ${item.to}</span>
                        <span class="favorite-rate">1 ${item.from} = ${rate.toFixed(4)} ${item.to}</span>
                    </div>
                    <div class="favorite-actions">
                        <button class="use-favorite" data-from="${item.from}" data-to="${item.to}">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="remove-favorite" data-id="${item.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        document.querySelectorAll('.use-favorite').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const from = btn.dataset.from;
                const to = btn.dataset.to;
                this.fromCurrency.value = from;
                this.toCurrency.value = to;
                this.actualizarFlags();
                await this.obtenerTasas();
                this.convertir();
                this.mostrarNotificacion(`Cambiado a ${from} → ${to}`, 'success');
            });
        });
        
        document.querySelectorAll('.remove-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                this.favorites = this.favorites.filter(f => f.id !== id);
                this.guardarFavoritos();
                this.renderFavorites();
                this.mostrarNotificacion('Favorito eliminado', 'info');
            });
        });
    }
    
    // Agregar favorito
    agregarFavorito() {
        const from = this.fromCurrency.value;
        const to = this.toCurrency.value;
        
        const exists = this.favorites.some(f => f.from === from && f.to === to);
        
        if (exists) {
            this.mostrarNotificacion('Este par ya está en favoritos', 'warning');
            return;
        }
        
        this.favorites.push({
            id: Date.now(),
            from: from,
            to: to
        });
        
        this.guardarFavoritos();
        this.renderFavorites();
        this.mostrarNotificacion('Agregado a favoritos', 'success');
    }
    
    // Intercambiar monedas
    swapCurrencies() {
        const fromValue = this.fromCurrency.value;
        const toValue = this.toCurrency.value;
        
        this.fromCurrency.value = toValue;
        this.toCurrency.value = fromValue;
        
        this.actualizarFlags();
        this.obtenerTasas().then(() => this.convertir());
        this.mostrarNotificacion('Monedas intercambiadas', 'info');
    }
    
    // Actualizar banderas
    actualizarFlags() {
        const fromCode = this.fromCurrency.value.toLowerCase();
        const toCode = this.toCurrency.value.toLowerCase();
        
        this.fromFlag.src = `https://flagicons.lipis.dev/flags/4x3/${fromCode.slice(0,2)}.svg`;
        this.toFlag.src = `https://flagicons.lipis.dev/flags/4x3/${toCode.slice(0,2)}.svg`;
    }
    
    // Actualizar tasas de referencia
    actualizarTasasReferencia() {
        const base = this.fromCurrency.value;
        const baseRate = this.rates[base] || 1;
        
        const currencies = ['USD', 'EUR', 'MXN', 'CLP'];
        currencies.forEach(currency => {
            const rate = (1 / baseRate) * (this.rates[currency] || 1);
            const element = document.getElementById(`${currency.toLowerCase()}Rate`);
            if (element) {
                element.textContent = rate.toFixed(4);
            }
        });
    }
    
    // Inicializar gráfico
    initChart() {
        const ctx = document.getElementById('rateChart');
        if (!ctx) return;
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Tasa de cambio',
                    data: [],
                    borderColor: '#6C63FF',
                    backgroundColor: 'rgba(108, 99, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: { color: '#888' }
                    }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(136, 146, 176, 0.1)' },
                        ticks: { color: '#888' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#888' }
                    }
                }
            }
        });
        
        this.actualizarGrafico();
        this.chartPeriod.addEventListener('change', () => this.actualizarGrafico());
    }
    
    // Actualizar gráfico
    async actualizarGrafico() {
        const from = this.fromCurrency.value;
        const to = this.toCurrency.value;
        const days = parseInt(this.chartPeriod.value);
        
        // Simular datos históricos
        const labels = [];
        const data = [];
        const today = new Date();
        
        const fromRate = this.rates[from] || 1;
        const currentRate = (1 / fromRate) * (this.rates[to] || 1);
        
        for (let i = days; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
            
            // Simular variación del ±5%
            const variation = 1 + (Math.sin(i * 0.5) * 0.05);
            data.push(currentRate * variation);
        }
        
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.data.datasets[0].label = `${from}/${to}`;
        this.chart.update();
    }
    
    // Limpiar historial
    limpiarHistorial() {
        if (this.history.length === 0) {
            this.mostrarNotificacion('No hay historial para limpiar', 'info');
            return;
        }
        
        if (confirm('¿Eliminar todo el historial de conversiones?')) {
            this.history = [];
            this.guardarHistorial();
            this.renderHistory();
            this.mostrarNotificacion('Historial limpiado', 'success');
        }
    }
    
    // Cambiar tema
    toggleTheme() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        
        if (isLight) {
            this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('converter_theme', 'light');
        } else {
            this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('converter_theme', 'dark');
        }
        
        // Actualizar colores del gráfico
        if (this.chart) {
            this.chart.options.plugins.legend.labels.color = isLight ? '#666' : '#888';
            this.chart.update();
        }
    }
    
    // Mostrar notificación
    mostrarNotificacion(mensaje, tipo) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${tipo}`;
        notification.innerHTML = `
            <i class="fas ${tipo === 'success' ? 'fa-check-circle' : tipo === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${mensaje}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${tipo === 'success' ? '#28A745' : tipo === 'error' ? '#DC3545' : '#6C63FF'};
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            font-size: 0.9rem;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Mostrar/ocultar loading
    mostrarLoading(show) {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }
    
    // Cambiar pestaña
    cambiarTab(tabId) {
        this.tabBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            }
        });
        
        this.tabPanels.forEach(panel => {
            panel.classList.remove('active');
        });
        
        const activePanel = document.getElementById(`${tabId}Panel`);
        if (activePanel) activePanel.classList.add('active');
        
        if (tabId === 'chart' && this.chart) {
            setTimeout(() => this.chart.update(), 100);
        }
    }
    
    // Event listeners
    eventListeners() {
        this.amountInput.addEventListener('input', () => this.convertir());
        this.fromCurrency.addEventListener('change', async () => {
            await this.obtenerTasas();
            this.convertir();
        });
        this.toCurrency.addEventListener('change', () => this.convertir());
        this.swapBtn.addEventListener('click', () => this.swapCurrencies());
        this.refreshBtn.addEventListener('click', async () => {
            await this.obtenerTasas();
            this.convertir();
            this.mostrarNotificacion('Tasas actualizadas', 'success');
        });
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        if (this.clearHistoryBtn) {
            this.clearHistoryBtn.addEventListener('click', () => this.limpiarHistorial());
        }
        
        if (this.addFavoriteBtn) {
            this.addFavoriteBtn.addEventListener('click', () => this.agregarFavorito());
        }
        
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                this.cambiarTab(tabId);
            });
        });
        
        if (this.chartPeriod) {
            this.chartPeriod.addEventListener('change', () => this.actualizarGrafico());
        }
    }
}

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

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    new CurrencyConverter();
});
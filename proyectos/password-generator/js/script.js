/**
 * GENERADOR DE CONTRASEÑAS SEGURAS
 * Funcionalidades: Personalización, análisis de seguridad, historial, copiado
 */

class PasswordGenerator {
    constructor() {
        // Elementos DOM
        this.passwordDisplay = document.getElementById('generatedPassword');
        this.lengthSlider = document.getElementById('lengthSlider');
        this.lengthDisplay = document.getElementById('lengthDisplay');
        this.generateBtn = document.getElementById('generateBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.regenerateBtn = document.getElementById('regenerateBtn');
        this.historyList = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        
        // Checkboxes
        this.includeUppercase = document.getElementById('includeUppercase');
        this.includeLowercase = document.getElementById('includeLowercase');
        this.includeNumbers = document.getElementById('includeNumbers');
        this.includeSymbols = document.getElementById('includeSymbols');
        this.excludeSimilar = document.getElementById('excludeSimilar');
        this.excludeAmbiguous = document.getElementById('excludeAmbiguous');
        
        // Elementos de seguridad
        this.strengthFill = document.getElementById('strengthFill');
        this.strengthLabel = document.getElementById('strengthLabel');
        this.strengthScore = document.getElementById('strengthScore');
        this.entropyInfo = document.getElementById('entropyInfo');
        this.crackTimeInfo = document.getElementById('crackTimeInfo');
        
        // Estado
        this.history = [];
        this.currentPassword = '';
        
        // Caracteres
        this.charSets = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
        
        this.similarChars = 'il1LO0o';
        this.ambiguousChars = '{}[]()/\\\'"`~,;:.<>';
        
        this.init();
    }
    
    init() {
        this.cargarHistorial();
        this.eventListeners();
        this.generarContraseña();
    }
    
    eventListeners() {
        // Slider de longitud
        this.lengthSlider.addEventListener('input', () => {
            this.lengthDisplay.textContent = this.lengthSlider.value;
            this.generarContraseña();
        });
        
        // Checkboxes
        const checkboxes = [this.includeUppercase, this.includeLowercase, this.includeNumbers, 
                           this.includeSymbols, this.excludeSimilar, this.excludeAmbiguous];
        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => this.generarContraseña());
        });
        
        // Botón generar
        this.generateBtn.addEventListener('click', () => this.generarContraseña());
        
        // Botón regenerar
        this.regenerateBtn.addEventListener('click', () => this.generarContraseña());
        
        // Botón copiar
        this.copyBtn.addEventListener('click', () => this.copiarContraseña());
        
        // Limpiar historial
        this.clearHistoryBtn.addEventListener('click', () => this.limpiarHistorial());
    }
    
    obtenerCaracteres() {
        let chars = '';
        
        if (this.includeUppercase.checked) chars += this.charSets.uppercase;
        if (this.includeLowercase.checked) chars += this.charSets.lowercase;
        if (this.includeNumbers.checked) chars += this.charSets.numbers;
        if (this.includeSymbols.checked) chars += this.charSets.symbols;
        
        // Excluir caracteres similares
        if (this.excludeSimilar.checked) {
            for (const char of this.similarChars) {
                chars = chars.replaceAll(char, '');
            }
        }
        
        // Excluir caracteres ambiguos
        if (this.excludeAmbiguous.checked) {
            for (const char of this.ambiguousChars) {
                chars = chars.replaceAll(char, '');
            }
        }
        
        return chars;
    }
    
    generarContraseña() {
        const length = parseInt(this.lengthSlider.value);
        const charSet = this.obtenerCaracteres();
        
        if (!charSet) {
            this.passwordDisplay.textContent = 'Selecciona al menos un tipo de caracter';
            this.passwordDisplay.style.color = '#FF6584';
            this.currentPassword = '';
            this.actualizarSeguridad('');
            return;
        }
        
        this.passwordDisplay.style.color = 'var(--white)';
        
        // Asegurar al menos un caracter de cada tipo seleccionado
        let password = '';
        const selectedTypes = [];
        
        if (this.includeUppercase.checked) selectedTypes.push(this.charSets.uppercase);
        if (this.includeLowercase.checked) selectedTypes.push(this.charSets.lowercase);
        if (this.includeNumbers.checked) selectedTypes.push(this.charSets.numbers);
        if (this.includeSymbols.checked) selectedTypes.push(this.charSets.symbols);
        
        // Asegurar al menos un caracter de cada tipo
        for (const type of selectedTypes) {
            const availableChars = [...type].filter(c => {
                if (this.excludeSimilar.checked && this.similarChars.includes(c)) return false;
                if (this.excludeAmbiguous.checked && this.ambiguousChars.includes(c)) return false;
                return true;
            });
            if (availableChars.length > 0) {
                password += availableChars[Math.floor(Math.random() * availableChars.length)];
            }
        }
        
        // Completar el resto
        const remainingLength = length - password.length;
        const availableChars = [...charSet];
        
        for (let i = 0; i < remainingLength; i++) {
            if (availableChars.length === 0) break;
            const char = availableChars[Math.floor(Math.random() * availableChars.length)];
            password += char;
        }
        
        // Mezclar la contraseña
        password = this.shuffleString(password);
        
        // Si la contraseña tiene menos caracteres de los solicitados, agregar más
        while (password.length < length && availableChars.length > 0) {
            password += availableChars[Math.floor(Math.random() * availableChars.length)];
        }
        
        // Limitar a la longitud deseada
        password = password.slice(0, length);
        
        this.currentPassword = password;
        this.passwordDisplay.textContent = password;
        
        // Análisis de seguridad
        this.actualizarSeguridad(password);
        
        // Guardar en historial
        this.guardarEnHistorial(password);
    }
    
    shuffleString(str) {
        const array = str.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }
    
    actualizarSeguridad(password) {
        if (!password) {
            this.strengthFill.style.width = '0%';
            this.strengthFill.style.background = '#3A3A50';
            this.strengthLabel.textContent = 'Sin contraseña';
            this.strengthScore.textContent = '0/100';
            this.entropyInfo.textContent = 'Entropía: 0 bits';
            this.crackTimeInfo.textContent = 'Tiempo de crackeo: --';
            return;
        }
        
        // Calcular entropía
        const length = password.length;
        const charSet = this.obtenerCaracteres();
        const charSetSize = [...new Set(charSet)].length;
        
        // Entropía = log2(charSetSize^length)
        const entropy = length * Math.log2(charSetSize || 1);
        const score = Math.min(Math.round((entropy / 128) * 100), 100);
        
        // Determinar nivel de seguridad
        let level, color, label;
        
        if (score < 30) {
            level = 'Muy Débil';
            color = '#DC3545';
            label = '🔴 Muy Débil';
        } else if (score < 50) {
            level = 'Débil';
            color = '#FFC107';
            label = '🟡 Débil';
        } else if (score < 70) {
            level = 'Media';
            color = '#FF6584';
            label = '🟠 Media';
        } else if (score < 85) {
            level = 'Fuerte';
            color = '#6C63FF';
            label = '🟣 Fuerte';
        } else {
            level = 'Muy Fuerte';
            color = '#28A745';
            label = '🟢 Muy Fuerte';
        }
        
        // Actualizar barra
        this.strengthFill.style.width = `${score}%`;
        this.strengthFill.style.background = color;
        this.strengthLabel.textContent = label;
        this.strengthScore.textContent = `${score}/100`;
        this.entropyInfo.textContent = `Entropía: ${entropy.toFixed(1)} bits`;
        
        // Calcular tiempo de crackeo
        const crackTime = this.calcularTiempoCrackeo(entropy);
        this.crackTimeInfo.textContent = `Tiempo de crackeo: ${crackTime}`;
    }
    
    calcularTiempoCrackeo(entropy) {
        // Estimación basada en entropía (suponiendo 10^9 intentos por segundo)
        const attemptsPerSecond = 1e9;
        const seconds = Math.pow(2, entropy) / attemptsPerSecond;
        
        if (seconds < 1) return 'Menos de 1 segundo';
        if (seconds < 60) return `${Math.round(seconds)} segundos`;
        if (seconds < 3600) return `${Math.round(seconds / 60)} minutos`;
        if (seconds < 86400) return `${Math.round(seconds / 3600)} horas`;
        if (seconds < 2592000) return `${Math.round(seconds / 86400)} días`;
        if (seconds < 31536000) return `${Math.round(seconds / 2592000)} meses`;
        if (seconds < 31536000000) return `${Math.round(seconds / 31536000)} años`;
        return 'Más de 1000 años';
    }
    
    copiarContraseña() {
        if (!this.currentPassword) {
            this.mostrarNotificacion('No hay contraseña para copiar', 'error');
            return;
        }
        
        navigator.clipboard.writeText(this.currentPassword).then(() => {
            this.copyBtn.classList.add('copied');
            this.copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            this.mostrarNotificacion('¡Contraseña copiada al portapapeles!', 'success');
            
            setTimeout(() => {
                this.copyBtn.classList.remove('copied');
                this.copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        }).catch(() => {
            // Fallback para navegadores sin clipboard API
            const textarea = document.createElement('textarea');
            textarea.value = this.currentPassword;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.mostrarNotificacion('¡Contraseña copiada al portapapeles!', 'success');
        });
    }
    
    guardarEnHistorial(password) {
        if (!password) return;
        
        const entry = {
            password: password,
            date: new Date().toISOString()
        };
        
        this.history.unshift(entry);
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        this.guardarHistorial();
        this.renderizarHistorial();
    }
    
    renderizarHistorial() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-clock"></i>
                    <p>No hay contraseñas en el historial</p>
                </div>
            `;
            return;
        }
        
        this.historyList.innerHTML = this.history.map(item => {
            const date = new Date(item.date);
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
            
            return `
                <div class="history-item">
                    <span class="history-password">${item.password}</span>
                    <span class="history-date">${formattedDate}</span>
                </div>
            `;
        }).join('');
    }
    
    guardarHistorial() {
        localStorage.setItem('password_history', JSON.stringify(this.history));
    }
    
    cargarHistorial() {
        const saved = localStorage.getItem('password_history');
        if (saved) {
            try {
                this.history = JSON.parse(saved);
                this.renderizarHistorial();
            } catch {
                this.history = [];
            }
        }
    }
    
    limpiarHistorial() {
        if (this.history.length === 0) {
            this.mostrarNotificacion('El historial ya está vacío', 'info');
            return;
        }
        
        if (confirm('¿Estás seguro de limpiar todo el historial?')) {
            this.history = [];
            this.guardarHistorial();
            this.renderizarHistorial();
            this.mostrarNotificacion('Historial limpiado', 'success');
        }
    }
    
    mostrarNotificacion(mensaje, tipo) {
        const notification = document.createElement('div');
        notification.className = `notification ${tipo}`;
        notification.textContent = mensaje;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', () => {
    new PasswordGenerator();
});

// Estilos para animación de salida de notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
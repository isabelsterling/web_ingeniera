// Clase Calculadora
class Calculadora {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    // Limpiar todo
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }

    // Eliminar último dígito
    delete() {
        if (this.currentOperand === '0') return;
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
    }

    // Agregar número
    appendNumber(number) {
        // Evitar múltiples puntos decimales
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        // Reemplazar cero inicial
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
    }

    // Elegir operación
    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        
        if (this.previousOperand !== '') {
            this.compute();
        }
        
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
    }

    // Realizar cálculo
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.currentOperand = 'Error';
                    this.previousOperand = '';
                    this.operation = undefined;
                    this.updateDisplay();
                    setTimeout(() => this.clear(), 1500);
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        // Limitar decimales
        this.currentOperand = parseFloat(computation.toFixed(8)).toString();
        this.operation = undefined;
        this.previousOperand = '';
    }

    // Formatear número para mostrar
    getDisplayNumber(number) {
        if (number === 'Error') return 'Error';
        
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('es', {
                maximumFractionDigits: 0
            });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    // Actualizar pantalla
    updateDisplay() {
        this.currentOperandElement.textContent = this.getDisplayNumber(this.currentOperand);
        
        if (this.operation != null) {
            this.previousOperandElement.textContent = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.getDisplayOperator(this.operation)}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
    }

    // Mostrar operador legible
    getDisplayOperator(operation) {
        switch (operation) {
            case '+': return '+';
            case '-': return '-';
            case '*': return '×';
            case '/': return '÷';
            default: return '';
        }
    }
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    const previousOperandElement = document.getElementById('previousOperand');
    const currentOperandElement = document.getElementById('currentOperand');
    const calculator = new Calculadora(previousOperandElement, currentOperandElement);
    
    // Botones de números
    const numberButtons = document.querySelectorAll('[data-number]');
    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            const number = button.getAttribute('data-number');
            calculator.appendNumber(number);
            calculator.updateDisplay();
        });
    });
    
    // Botones de operadores
    const operatorButtons = document.querySelectorAll('[data-operator]');
    operatorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const operator = button.getAttribute('data-operator');
            calculator.chooseOperation(operator);
            calculator.updateDisplay();
        });
    });
    
    // Botón igual
    const equalsButton = document.querySelector('[data-action="equals"]');
    equalsButton.addEventListener('click', () => {
        calculator.compute();
        calculator.updateDisplay();
    });
    
    // Botón clear (AC)
    const clearButton = document.querySelector('[data-action="clear"]');
    clearButton.addEventListener('click', () => {
        calculator.clear();
        calculator.updateDisplay();
    });
    
    // Botón delete (⌫)
    const deleteButton = document.querySelector('[data-action="delete"]');
    deleteButton.addEventListener('click', () => {
        calculator.delete();
        calculator.updateDisplay();
    });
    
    // Soporte para teclado
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        
        // Números y punto
        if (/[0-9.]/.test(key)) {
            e.preventDefault();
            calculator.appendNumber(key);
            calculator.updateDisplay();
        }
        
        // Operadores
        if (key === '+' || key === '-' || key === '*' || key === '/') {
            e.preventDefault();
            let operator = key;
            if (key === '*') operator = '*';
            if (key === '/') operator = '/';
            calculator.chooseOperation(operator);
            calculator.updateDisplay();
        }
        
        // Enter o = para calcular
        if (key === 'Enter' || key === '=') {
            e.preventDefault();
            calculator.compute();
            calculator.updateDisplay();
        }
        
        // Escape para limpiar
        if (key === 'Escape') {
            e.preventDefault();
            calculator.clear();
            calculator.updateDisplay();
        }
        
        // Backspace para borrar
        if (key === 'Backspace') {
            e.preventDefault();
            calculator.delete();
            calculator.updateDisplay();
        }
    });
    
    // Efecto visual al presionar tecla
    const allButtons = document.querySelectorAll('.btn');
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        let selector = '';
        
        if (/[0-9.]/.test(key)) selector = `[data-number="${key}"]`;
        if (key === '+') selector = '[data-operator="+"]';
        if (key === '-') selector = '[data-operator="-"]';
        if (key === '*') selector = '[data-operator="*"]';
        if (key === '/') selector = '[data-operator="/"]';
        if (key === 'Enter' || key === '=') selector = '[data-action="equals"]';
        if (key === 'Escape') selector = '[data-action="clear"]';
        if (key === 'Backspace') selector = '[data-action="delete"]';
        
        const button = document.querySelector(selector);
        if (button) {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 100);
        }
    });
});
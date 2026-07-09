/**
 * TRIVIA INTERACTIVA
 * Preguntas de tecnología, puntaje, temporizador, múltiples modos y categorías
 */

class TriviaGame {
    constructor() {
        // Banco de preguntas
        this.questionsBank = [
            // Programación
            { id: 1, text: "¿Qué significa HTML?", category: "programacion", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], correct: 0 },
            { id: 2, text: "¿Cuál de estos es un lenguaje de programación?", category: "programacion", options: ["HTML", "CSS", "JavaScript", "XML"], correct: 2 },
            { id: 3, text: "¿Qué significa CSS?", category: "programacion", options: ["Creative Style Sheets", "Computer Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"], correct: 2 },
            { id: 4, text: "¿Qué símbolo se usa para comentarios en JavaScript?", category: "programacion", options: ["<!-- -->", "//", "/* */", "Ambos B y C"], correct: 3 },
            { id: 5, text: "¿Qué framework de JavaScript es desarrollado por Facebook?", category: "programacion", options: ["Angular", "Vue.js", "React", "Svelte"], correct: 2 },
            
            // Inteligencia Artificial
            { id: 6, text: "¿Qué significa IA?", category: "ia", options: ["Informática Avanzada", "Inteligencia Artificial", "Interfaz Automática", "Innovación Aplicada"], correct: 1 },
            { id: 7, text: "¿Qué empresa desarrolló ChatGPT?", category: "ia", options: ["Google", "Microsoft", "OpenAI", "Meta"], correct: 2 },
            { id: 8, text: "¿Qué es el Machine Learning?", category: "ia", options: ["Un tipo de hardware", "Un algoritmo de búsqueda", "Un subcampo de la IA que permite a las máquinas aprender", "Un lenguaje de programación"], correct: 2 },
            { id: 9, text: "¿Qué es una red neuronal?", category: "ia", options: ["Un tipo de cableado", "Un sistema inspirado en el cerebro humano", "Un virus informático", "Un sistema operativo"], correct: 1 },
            { id: 10, text: "¿Qué lenguaje es más usado en IA?", category: "ia", options: ["Java", "C++", "Python", "Ruby"], correct: 2 },
            
            // Desarrollo Web
            { id: 11, text: "¿Qué es React?", category: "web", options: ["Un framework de CSS", "Una biblioteca de JavaScript", "Un servidor web", "Una base de datos"], correct: 1 },
            { id: 12, text: "¿Qué hace Node.js?", category: "web", options: ["Ejecuta JavaScript en el servidor", "Diseña interfaces", "Gestiona bases de datos", "Crea estilos CSS"], correct: 0 },
            { id: 13, text: "¿Qué es una API?", category: "web", options: ["Aplicación de Programación Independiente", "Interfaz de Programación de Aplicaciones", "Archivo de Protocolo de Internet", "Algoritmo de Procesamiento de Información"], correct: 1 },
            { id: 14, text: "¿Qué significa responsive design?", category: "web", options: ["Diseño rápido", "Diseño que se adapta a diferentes dispositivos", "Diseño con responsabilidades", "Diseño automático"], correct: 1 },
            { id: 15, text: "¿Qué es un CDN?", category: "web", options: ["Red de distribución de contenido", "Centro de datos nacional", "Código de desarrollo nuevo", "Control de dominio web"], correct: 0 },
            
            // Seguridad
            { id: 16, text: "¿Qué es un firewall?", category: "seguridad", options: ["Un antivirus", "Un sistema que filtra el tráfico de red", "Un tipo de virus", "Un navegador web"], correct: 1 },
            { id: 17, text: "¿Qué significa phishing?", category: "seguridad", options: ["Un tipo de pesca", "Un ataque de suplantación de identidad", "Un método de encriptación", "Un software malicioso"], correct: 1 },
            { id: 18, text: "¿Qué es un ataque DDoS?", category: "seguridad", options: ["Ataque de denegación de servicio distribuido", "Ataque de datos", "Virus de sistema", "Fallo de hardware"], correct: 0 },
            { id: 19, text: "¿Qué es la autenticación 2FA?", category: "seguridad", options: ["Dos archivos adjuntos", "Dos factores de autenticación", "Dos firewalls activos", "Dos antivirus"], correct: 1 },
            { id: 20, text: "¿Qué es un certificado SSL?", category: "seguridad", options: ["Un tipo de servidor", "Un protocolo de seguridad para sitios web", "Un antivirus", "Un firewall"], correct: 1 }
        ];
        
        this.currentMode = 'medium';
        this.currentCategory = 'all';
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.timeLeft = 20;
        this.timerInterval = null;
        this.answerLocked = false;
        this.startTime = null;
        
        // Configuraciones por modo
        this.modeConfig = {
            easy: { questionsCount: 10, timePerQuestion: 30, pointsCorrect: 10 },
            medium: { questionsCount: 15, timePerQuestion: 20, pointsCorrect: 15 },
            hard: { questionsCount: 20, timePerQuestion: 15, pointsCorrect: 20 }
        };
        
        // Elementos DOM
        this.startScreen = document.getElementById('startScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.resultScreen = document.getElementById('resultScreen');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.homeBtn = document.getElementById('homeBtn');
        this.questionText = document.getElementById('questionText');
        this.optionsGrid = document.getElementById('optionsGrid');
        this.currentScoreSpan = document.getElementById('currentScore');
        this.currentQuestionSpan = document.getElementById('currentQuestion');
        this.totalQuestionsSpan = document.getElementById('totalQuestions');
        this.timerSpan = document.getElementById('timer');
        this.progressFill = document.getElementById('progressFill');
        this.feedbackDiv = document.getElementById('feedback');
        this.feedbackIcon = document.getElementById('feedbackIcon');
        this.feedbackMessage = document.getElementById('feedbackMessage');
        
        // Resultados
        this.finalScoreSpan = document.getElementById('finalScore');
        this.correctCountSpan = document.getElementById('correctCount');
        this.incorrectCountSpan = document.getElementById('incorrectCount');
        this.timeUsedSpan = document.getElementById('timeUsed');
        this.accuracySpan = document.getElementById('accuracy');
        this.resultMessage = document.getElementById('resultMessage');
        this.highScoreSpan = document.getElementById('highScore');
        
        this.init();
    }
    
    init() {
        this.cargarHighScore();
        this.eventListeners();
        this.seleccionarModo();
        this.seleccionarCategoria();
    }
    
    eventListeners() {
        this.startBtn.addEventListener('click', () => this.iniciarJuego());
        this.restartBtn.addEventListener('click', () => this.reiniciarJuego());
        this.homeBtn.addEventListener('click', () => this.irAlInicio());
        
        // Selección de modo
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.currentMode = card.dataset.mode;
            });
        });
        
        // Selección de categoría
        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
            });
        });
    }
    
    seleccionarModo() {
        const defaultMode = document.querySelector('.mode-card[data-mode="medium"]');
        if (defaultMode) defaultMode.classList.add('selected');
    }
    
    seleccionarCategoria() {
        const defaultCat = document.querySelector('.cat-btn[data-category="all"]');
        if (defaultCat) defaultCat.classList.add('active');
    }
    
    filtrarPreguntas() {
        let filtered = [...this.questionsBank];
        
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(q => q.category === this.currentCategory);
        }
        
        // Mezclar preguntas
        for (let i = filtered.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
        }
        
        const config = this.modeConfig[this.currentMode];
        return filtered.slice(0, config.questionsCount);
    }
    
    iniciarJuego() {
        this.questions = this.filtrarPreguntas();
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.startTime = Date.now();
        
        const config = this.modeConfig[this.currentMode];
        this.totalQuestionsSpan.textContent = this.questions.length;
        this.timeLeft = config.timePerQuestion;
        this.currentScoreSpan.textContent = this.score;
        
        this.startScreen.style.display = 'none';
        this.gameScreen.style.display = 'block';
        this.resultScreen.style.display = 'none';
        
        this.cargarPregunta();
    }
    
    cargarPregunta() {
        this.answerLocked = false;
        this.feedbackDiv.style.display = 'none';
        
        const config = this.modeConfig[this.currentMode];
        this.timeLeft = config.timePerQuestion;
        this.timerSpan.textContent = this.timeLeft;
        this.timerSpan.classList.remove('warning', 'danger');
        
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.iniciarTimer();
        
        const question = this.questions[this.currentQuestionIndex];
        this.questionText.textContent = question.text;
        this.currentQuestionSpan.textContent = this.currentQuestionIndex + 1;
        
        // Actualizar progress bar
        const progress = ((this.currentQuestionIndex) / this.questions.length) * 100;
        this.progressFill.style.width = `${progress}%`;
        
        // Renderizar opciones
        this.optionsGrid.innerHTML = '';
        const letters = ['A', 'B', 'C', 'D'];
        
        question.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `
                <span class="option-prefix">${letters[index]}</span>
                <span class="option-text">${this.escapeHtml(option)}</span>
            `;
            btn.addEventListener('click', () => this.responder(index));
            this.optionsGrid.appendChild(btn);
        });
    }
    
    iniciarTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.answerLocked) {
                this.timeLeft--;
                this.timerSpan.textContent = this.timeLeft;
                
                if (this.timeLeft <= 5) {
                    this.timerSpan.classList.add('danger');
                } else if (this.timeLeft <= 10) {
                    this.timerSpan.classList.add('warning');
                }
                
                if (this.timeLeft <= 0) {
                    clearInterval(this.timerInterval);
                    this.tiempoAgotado();
                }
            }
        }, 1000);
    }
    
    tiempoAgotado() {
        this.answerLocked = true;
        
        const config = this.modeConfig[this.currentMode];
        const question = this.questions[this.currentQuestionIndex];
        const correctAnswer = question.options[question.correct];
        
        this.mostrarFeedback(false, `⏰ Tiempo agotado! La respuesta correcta era: ${correctAnswer}`);
        
        // Marcar respuesta correcta
        const correctBtn = this.optionsGrid.children[question.correct];
        correctBtn.classList.add('correct');
        
        setTimeout(() => this.siguientePregunta(), 2000);
    }
    
    responder(selectedIndex) {
        if (this.answerLocked) return;
        
        this.answerLocked = true;
        clearInterval(this.timerInterval);
        
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = (selectedIndex === question.correct);
        const config = this.modeConfig[this.currentMode];
        
        // Marcar opciones
        const buttons = this.optionsGrid.children;
        buttons[question.correct].classList.add('correct');
        
        if (!isCorrect) {
            buttons[selectedIndex].classList.add('incorrect');
        } else {
            this.score += config.pointsCorrect;
            this.correctAnswers++;
            this.currentScoreSpan.textContent = this.score;
        }
        
        const message = isCorrect 
            ? `✅ ¡Correcto! +${config.pointsCorrect} puntos`
            : `❌ Incorrecto. La respuesta correcta era: ${question.options[question.correct]}`;
        
        this.mostrarFeedback(isCorrect, message);
        
        setTimeout(() => this.siguientePregunta(), 1500);
    }
    
    mostrarFeedback(isCorrect, message) {
        this.feedbackDiv.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        this.feedbackIcon.className = `fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}`;
        this.feedbackMessage.textContent = message;
        this.feedbackDiv.style.display = 'flex';
    }
    
    siguientePregunta() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex < this.questions.length) {
            this.cargarPregunta();
        } else {
            this.finalizarJuego();
        }
    }
    
    finalizarJuego() {
        const totalTime = Math.floor((Date.now() - this.startTime) / 1000);
        const totalQuestions = this.questions.length;
        const incorrectAnswers = totalQuestions - this.correctAnswers;
        const accuracy = Math.round((this.correctAnswers / totalQuestions) * 100);
        
        // Guardar high score
        const highScore = localStorage.getItem('trivia_highscore') || 0;
        if (this.score > highScore) {
            localStorage.setItem('trivia_highscore', this.score);
            this.highScoreSpan.textContent = this.score;
        } else {
            this.highScoreSpan.textContent = highScore;
        }
        
        // Mostrar resultados
        this.finalScoreSpan.textContent = this.score;
        this.correctCountSpan.textContent = this.correctAnswers;
        this.incorrectCountSpan.textContent = incorrectAnswers;
        this.timeUsedSpan.textContent = totalTime;
        this.accuracySpan.textContent = accuracy;
        
        // Mensaje según puntuación
        let message = '';
        let icon = '';
        
        if (accuracy >= 90) {
            message = '🎉 ¡Excelente! Eres un verdadero experto en tecnología. ¡Sigue así!';
            icon = '🏆';
        } else if (accuracy >= 70) {
            message = '👍 ¡Muy bien! Tienes buen conocimiento tecnológico. ¡Sigue aprendiendo!';
            icon = '📚';
        } else if (accuracy >= 50) {
            message = '📝 ¡Buen intento! Revisa los temas donde fallaste y vuelve a intentarlo.';
            icon = '💪';
        } else {
            message = '🌱 ¡Sigue practicando! La tecnología es un campo amplio, cada día se aprende algo nuevo.';
            icon = '🌟';
        }
        
        this.resultMessage.innerHTML = `${icon} ${message}`;
        
        // Dibujar gráfico circular
        this.dibujarGrafico(accuracy);
        
        // Ocultar game screen y mostrar result screen
        this.gameScreen.style.display = 'none';
        this.resultScreen.style.display = 'block';
        
        // Limpiar timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
    
    dibujarGrafico(percentage) {
        const canvas = document.getElementById('resultChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 60;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Fondo del círculo (gris)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#2A2A40';
        ctx.fill();
        
        // Círculo de progreso (gradiente)
        const endAngle = (percentage / 100) * 2 * Math.PI;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + endAngle);
        
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#6C63FF');
        gradient.addColorStop(1, '#FF6584');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 12;
        ctx.stroke();
        
        // Círculo interior
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#1E1E2F';
        ctx.fill();
    }
    
    reiniciarJuego() {
        this.iniciarJuego();
    }
    
    irAlInicio() {
        // Limpiar timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Resetear variables
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.answerLocked = false;
        
        // Mostrar pantalla de inicio
        this.resultScreen.style.display = 'none';
        this.gameScreen.style.display = 'none';
        this.startScreen.style.display = 'block';
    }
    
    cargarHighScore() {
        const highScore = localStorage.getItem('trivia_highscore') || 0;
        this.highScoreSpan.textContent = highScore;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar el juego
document.addEventListener('DOMContentLoaded', () => {
    new TriviaGame();
});
/**
 * CHATBOT CON PROCESAMIENTO DE LENGUAJE NATURAL (NLP)
 * Reconocimiento de intenciones y respuestas automáticas
 */

// ========== BASE DE CONOCIMIENTO ==========
const knowledgeBase = {
    // Intenciones y palabras clave
    intents: [
        {
            intent: "saludo",
            keywords: ["hola", "buenos días", "buenas tardes", "buenas noches", "hey", "holi", "que tal", "cómo estás", "saludos"],
            responses: [
                "¡Hola! 😊 ¿En qué puedo ayudarte hoy?",
                "¡Hey! Bienvenido/a. ¿Qué te gustaría saber sobre mí?",
                "¡Hola! Soy tu asistente virtual. ¿Cómo puedo asistirte?"
            ]
        },
        {
            intent: "despedida",
            keywords: ["adiós", "chao", "hasta luego", "nos vemos", "bye", "hasta pronto", "me voy"],
            responses: [
                "¡Hasta luego! Fue un placer ayudarte. 😊",
                "¡Adiós! No dudes en volver si necesitas algo más.",
                "¡Nos vemos pronto! Que tengas un excelente día."
            ]
        },
        {
            intent: "presentacion",
            keywords: ["quién eres", "quien eres", "qué eres", "eres", "presentate", "tu nombre", "quien soy", "eres un bot"],
            responses: [
                "Soy un asistente virtual creado por Isabel Sterling, una estudiante de Ingeniería de Software con Inteligencia Artificial en SENATI.",
                "¡Me presento! Soy un chatbot diseñado para responder preguntas sobre Isabel y su portafolio. 🤖",
                "Soy tu asistente IA. Mi función es ayudarte a conocer más sobre Isabel, sus habilidades, proyectos y cómo contactarla."
            ]
        },
        {
            intent: "isabel_quien",
            keywords: ["quien es isabel", "quién es isabel", "isabel sterling", "sobre isabel", "conóceme", "quien soy yo"],
            responses: [
                "Isabel Sterling es una estudiante apasionada de Ingeniería de Software con Inteligencia Artificial en SENATI. Le encanta crear soluciones tecnológicas innovadoras.",
                "Isabel es una desarrolladora en formación que combina código, creatividad e innovación. Actualmente está en 2do semestre de su carrera.",
                "¡Es la creadora de este portafolio! Isabel se especializa en desarrollo web, fundamentos de IA y está siempre aprendiendo nuevas tecnologías."
            ]
        },
        {
            intent: "habilidades",
            keywords: ["habilidades", "sabes hacer", "tecnologías", "lenguajes", "que sabes", "skills", "competencias", "manejas", "conoces"],
            responses: [
                "Isabel maneja: HTML5, CSS3, JavaScript, Bootstrap, Python, y fundamentos de IA como Machine Learning y NLP. 🚀",
                "¡Aquí tienes sus habilidades! Desarrollo web frontend, diseño responsive, JavaScript interactivo, y conocimientos en ciencia de datos e inteligencia artificial.",
                "Actualmente domina HTML/CSS/JS, Bootstrap, y está aprendiendo Python y Machine Learning para proyectos más avanzados."
            ]
        },
        {
            intent: "proyectos",
            keywords: ["proyectos", "que has hecho", "portafolio", "trabajos", "desarrollos", "creaste", "aplicaciones", "webs"],
            responses: [
                "Isabel tiene varios proyectos como: Página web personal, Blog de tecnología, Clon de landing page, Calculadora, Lista de tareas y más. Puedes verlos en la sección 'Proyectos' del portafolio.",
                "¡Claro! Algunos de sus proyectos incluyen: Calculadora interactiva, Chatbot con NLP, Juego de memoria, Conversor de monedas, y formularios con Firebase.",
                "En su portafolio encontrarás proyectos de HTML/CSS, JavaScript, Bootstrap y próximamente con Python e IA. ¡Todos muy interesantes!"
            ]
        },
        {
            intent: "contacto",
            keywords: ["contacto", "como contactarte", "email", "teléfono", "whatsapp", "escribirte", "ubicación", "ubicacion", "donde estas", "redes sociales"],
            responses: [
                "Puedes contactar a Isabel por email: 1663551@senati.pe, WhatsApp: +51 953 870 664, o a través del formulario en la sección 'Contacto'.",
                "📞 Vía WhatsApp: +51 953 870 664\n📧 Email: 1663551@senati.pe\n📍 Ubicación: Arequipa, Perú\n🔗 Redes: Facebook, Instagram, LinkedIn, GitHub",
                "¡Escríbele por WhatsApp al +51 953 870 664 o completa el formulario de contacto en su portafolio! Responde muy rápido."
            ]
        },
        {
            intent: "formacion",
            keywords: ["formación", "estudios", "carrera", "universidad", "senati", "estudiante", "que estudias", "cursos", "certificados"],
            responses: [
                "Isabel estudia Ingeniería de Software con Inteligencia Artificial en SENATI. Está en 2do semestre y tiene certificaciones en Ciberseguridad, Conciencia Digital y Ciencia de Datos.",
                "¡Su formación incluye! Técnico en desarrollo web y actualmente ingeniería con enfoque en IA. Tiene certificados de Cisco, Google e IBM.",
                "Está en segundo semestre de su carrera, combinando desarrollo de software con fundamentos de inteligencia artificial y ciencia de datos."
            ]
        },
        {
            intent: "servicios",
            keywords: ["servicios", "ofreces", "puedes hacer", "colaborar", "trabajar", "contratar", "ayudar"],
            responses: [
                "Isabel ofrece: Desarrollo web frontend, integración de APIs, diseño responsivo, chatbots básicos, asesoría tecnológica y soluciones con IA.",
                "¡Puede ayudarte con! Creación de páginas web, aplicaciones interactivas, formularios con Firebase, y proyectos educativos de IA.",
                "Está abierta a colaboraciones, pasantías y proyectos freelance pequeños. ¡No dudes en contactarla!"
            ]
        },
        {
            intent: "gracias",
            keywords: ["gracias", "thank you", "thanks", "agradecido", "te lo agradezco", "muy amable"],
            responses: [
                "¡De nada! Me alegra poder ayudarte. 😊 ¿Necesitas algo más?",
                "¡Es un placer! Si tienes más preguntas, aquí estoy.",
                "¡Gracias a ti por usar mi asistente! 🙌"
            ]
        }
    ],
    
    // Respuestas por defecto
    defaultResponses: [
        "No estoy seguro de haber entendido. ¿Podrías reformular tu pregunta?",
        "Lo siento, no tengo información sobre eso. ¿Te interesaría saber sobre mis habilidades o proyectos?",
        "No conozco la respuesta a eso aún. Estoy aprendiendo constantemente. ¿Pruebas preguntándome sobre Isabel, sus proyectos o cómo contactarla?",
        "¡Interesante pregunta! Aún no tengo esa información. ¿Qué tal si hablamos de mis habilidades o proyectos?"
    ]
};

// ========== CLASE CHATBOT ==========
class Chatbot {
    constructor() {
        this.messagesContainer = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.suggestionBtns = document.querySelectorAll('.suggestion-btn');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Botón enviar
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Enter para enviar
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Botones de sugerencias
        this.suggestionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.getAttribute('data-question');
                this.userInput.value = question;
                this.sendMessage();
            });
        });
    }
    
    // Enviar mensaje del usuario
    async sendMessage() {
        const message = this.userInput.value.trim();
        
        if (message === '') return;
        
        // Mostrar mensaje del usuario
        this.addMessage(message, 'user');
        this.userInput.value = '';
        
        // Mostrar indicador de escritura
        this.showTypingIndicator();
        
        // Procesar respuesta (simulando tiempo de procesamiento)
        setTimeout(() => {
            const response = this.processMessage(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
            this.scrollToBottom();
        }, 500 + Math.random() * 500);
    }
    
    // Procesar mensaje con NLP básico
    processMessage(message) {
        const normalizedMessage = message.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Eliminar tildes
            .replace(/[¿?¡!]/g, '');
        
        // Buscar la mejor intención
        let bestMatch = null;
        let maxScore = 0;
        
        for (const intent of knowledgeBase.intents) {
            let score = 0;
            
            for (const keyword of intent.keywords) {
                if (normalizedMessage.includes(keyword)) {
                    // Puntuación: palabras exactas suman más
                    if (normalizedMessage.split(' ').includes(keyword)) {
                        score += 2;
                    } else {
                        score += 1;
                    }
                }
            }
            
            if (score > maxScore) {
                maxScore = score;
                bestMatch = intent;
            }
        }
        
        // Si hay coincidencia y es relevante (score > 0)
        if (bestMatch && maxScore > 0) {
            const randomIndex = Math.floor(Math.random() * bestMatch.responses.length);
            return bestMatch.responses[randomIndex];
        }
        
        // Si no hay coincidencia, respuesta por defecto
        const randomIndex = Math.floor(Math.random() * knowledgeBase.defaultResponses.length);
        return knowledgeBase.defaultResponses[randomIndex];
    }
    
    // Agregar mensaje al chat
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender === 'user' ? 'user-message' : 'bot-message'}`;
        
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        // Procesar texto (convertir saltos de línea a <br>)
        const formattedText = text.replace(/\n/g, '<br>');
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="${sender === 'user' ? 'fas fa-user' : 'fas fa-robot'}"></i>
            </div>
            <div class="message-content">
                ${formattedText}
            </div>
            <div class="message-time">${timeString}</div>
        `;
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    // Mostrar indicador de escritura
    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }
    
    // Ocultar indicador de escritura
    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }
    
    // Scroll al final del chat
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// ========== INICIALIZAR CHATBOT ==========
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
});

// Efecto de bienvenida en consola
console.log('%c🤖 Chatbot IA Iniciado', 'color: #6C63FF; font-size: 14px; font-weight: bold;');
console.log('%c💬 Procesamiento de Lenguaje Natural (NLP) activo', 'color: #8892B0; font-size: 12px;');
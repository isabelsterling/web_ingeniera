/**
 * CHATBOT CON PROCESAMIENTO DE LENGUAJE NATURAL (NLP)
 * Reconocimiento de intenciones, respuestas automáticas, contexto y comandos rápidos
 */

// ========== BASE DE CONOCIMIENTO ==========
const knowledgeBase = {
    // Intenciones y palabras clave
    intents: [
        {
            intent: "saludo",
            keywords: ["hola", "buenos días", "buenas tardes", "buenas noches", "hey", "holi", "que tal", "cómo estás", "saludos", "hola", "aló", "buenas"],
            responses: [
                "¡Hola! 😊 ¿En qué puedo ayudarte hoy?",
                "¡Hey! Bienvenido/a. ¿Qué te gustaría saber sobre mí?",
                "¡Hola! Soy tu asistente virtual. ¿Cómo puedo asistirte?",
                "¡Saludos! Cuéntame, ¿qué te trae por aquí? 🚀"
            ]
        },
        {
            intent: "despedida",
            keywords: ["adiós", "chao", "hasta luego", "nos vemos", "bye", "hasta pronto", "me voy", "chau", "hasta la vista", "nos vemos"],
            responses: [
                "¡Hasta luego! Fue un placer ayudarte. 😊",
                "¡Adiós! No dudes en volver si necesitas algo más.",
                "¡Nos vemos pronto! Que tengas un excelente día.",
                "¡Chao! Recuerda que siempre estoy aquí para ayudarte. 👋"
            ]
        },
        {
            intent: "presentacion",
            keywords: ["quién eres", "quien eres", "qué eres", "eres", "presentate", "tu nombre", "quien soy", "eres un bot", "quien te creó", "te creó", "creador"],
            responses: [
                "Soy un asistente virtual creado por Isabel Sterling, una estudiante de Ingeniería de Software con Inteligencia Artificial en SENATI.",
                "¡Me presento! Soy un chatbot diseñado para responder preguntas sobre Isabel y su portafolio. 🤖",
                "Soy tu asistente IA. Mi función es ayudarte a conocer más sobre Isabel, sus habilidades, proyectos y cómo contactarla.",
                "Me llaman 'Asistente IA', pero soy solo un bot con NLP básico. ¡Creado con mucho código y amor por Isabel! 💜"
            ]
        },
        {
            intent: "isabel_quien",
            keywords: ["quien es isabel", "quién es isabel", "isabel sterling", "sobre isabel", "conóceme", "quien soy yo", "isabel", "sterling", "desarrolladora"],
            responses: [
                "Isabel Sterling es una estudiante apasionada de Ingeniería de Software con Inteligencia Artificial en SENATI. Le encanta crear soluciones tecnológicas innovadoras.",
                "Isabel es una desarrolladora en formación que combina código, creatividad e innovación. Actualmente está en 2do semestre de su carrera.",
                "¡Es la creadora de este portafolio! Isabel se especializa en desarrollo web, fundamentos de IA y está siempre aprendiendo nuevas tecnologías.",
                "Isabel es una apasionada por la tecnología que transforma el mundo. Su objetivo es crear soluciones inteligentes y escalables. 🚀"
            ]
        },
        {
            intent: "habilidades",
            keywords: ["habilidades", "sabes hacer", "tecnologías", "lenguajes", "que sabes", "skills", "competencias", "manejas", "conoces", "programas", "herramientas"],
            responses: [
                "Isabel maneja: HTML5, CSS3, JavaScript, Bootstrap, Python, y fundamentos de IA como Machine Learning y NLP. 🚀",
                "¡Aquí tienes sus habilidades! Desarrollo web frontend, diseño responsive, JavaScript interactivo, y conocimientos en ciencia de datos e inteligencia artificial.",
                "Actualmente domina HTML/CSS/JS, Bootstrap, y está aprendiendo Python y Machine Learning para proyectos más avanzados.",
                "Tecnologías clave: \n• 🌐 HTML5, CSS3, JavaScript\n• ⚡ Bootstrap, React (aprendiendo)\n• 🐍 Python, Flask\n• 🤖 IA, NLP, Machine Learning"
            ]
        },
        {
            intent: "proyectos",
            keywords: ["proyectos", "que has hecho", "portafolio", "trabajos", "desarrollos", "creaste", "aplicaciones", "webs", "proyecto", "trabajaste"],
            responses: [
                "Isabel tiene varios proyectos como: Página web personal, Blog de tecnología, Clon de landing page, Calculadora, Lista de tareas y más. Puedes verlos en la sección 'Proyectos' del portafolio.",
                "¡Claro! Algunos de sus proyectos incluyen: Calculadora interactiva, Chatbot con NLP, Juego de memoria, Conversor de monedas, y formularios con Firebase.",
                "En su portafolio encontrarás proyectos de HTML/CSS, JavaScript, Bootstrap y próximamente con Python e IA. ¡Todos muy interesantes!",
                "Proyectos destacados:\n• 🤖 Chatbot con NLP\n• 💱 Conversor de Monedas\n• 📝 Lista de Tareas\n• 🧠 Trivia Interactiva\n• 📒 Notas con LocalStorage"
            ]
        },
        {
            intent: "contacto",
            keywords: ["contacto", "como contactarte", "email", "teléfono", "whatsapp", "escribirte", "ubicación", "ubicacion", "donde estas", "redes sociales", "escribir", "llamar"],
            responses: [
                "Puedes contactar a Isabel por email: 1663551@senati.pe, WhatsApp: +51 953 870 664, o a través del formulario en la sección 'Contacto'.",
                "📞 Vía WhatsApp: +51 953 870 664\n📧 Email: 1663551@senati.pe\n📍 Ubicación: Arequipa, Perú\n🔗 Redes: Facebook, Instagram, LinkedIn, GitHub",
                "¡Escríbele por WhatsApp al +51 953 870 664 o completa el formulario de contacto en su portafolio! Responde muy rápido.",
                "Redes sociales:\n• 📘 Facebook: @isabelsterlingg\n• 📸 Instagram: @isabelsterlingg\n• 💼 LinkedIn: @isabelsterling\n• 💻 GitHub: @isabelsterling"
            ]
        },
        {
            intent: "formacion",
            keywords: ["formación", "estudios", "carrera", "universidad", "senati", "estudiante", "que estudias", "cursos", "certificados", "estudias", "título"],
            responses: [
                "Isabel estudia Ingeniería de Software con Inteligencia Artificial en SENATI. Está en 2do semestre y tiene certificaciones en Ciberseguridad, Conciencia Digital y Ciencia de Datos.",
                "¡Su formación incluye! Técnico en desarrollo web y actualmente ingeniería con enfoque en IA. Tiene certificados de Cisco, Google e IBM.",
                "Está en segundo semestre de su carrera, combinando desarrollo de software con fundamentos de inteligencia artificial y ciencia de datos.",
                "Certificaciones:\n• 🔒 Ciberseguridad Essentials (Cisco)\n• 🌐 Conciencia Digital (Google)\n• 📊 Introducción a Ciencia de Datos (IBM)"
            ]
        },
        {
            intent: "servicios",
            keywords: ["servicios", "ofreces", "puedes hacer", "colaborar", "trabajar", "contratar", "ayudar", "freelance", "proyecto"],
            responses: [
                "Isabel ofrece: Desarrollo web frontend, integración de APIs, diseño responsivo, chatbots básicos, asesoría tecnológica y soluciones con IA.",
                "¡Puede ayudarte con! Creación de páginas web, aplicaciones interactivas, formularios con Firebase, y proyectos educativos de IA.",
                "Está abierta a colaboraciones, pasantías y proyectos freelance pequeños. ¡No dudes en contactarla!",
                "Servicios disponibles:\n• 💻 Desarrollo web\n• 🤖 Soluciones IA\n• 📱 Aplicaciones interactivas\n• 🔌 Integración de APIs\n• 📋 Formularios y bases de datos"
            ]
        },
        {
            intent: "gracias",
            keywords: ["gracias", "thank you", "thanks", "agradecido", "te lo agradezco", "muy amable", "gracias por todo", "genial", "excelente"],
            responses: [
                "¡De nada! Me alegra poder ayudarte. 😊 ¿Necesitas algo más?",
                "¡Es un placer! Si tienes más preguntas, aquí estoy.",
                "¡Gracias a ti por usar mi asistente! 🙌",
                "¡Qué amable! Siempre estoy aquí para lo que necesites. 💜"
            ]
        },
        // ========== NUEVAS INTENCIONES ==========
        {
            intent: "edad",
            keywords: ["edad", "cuantos años", "años", "nacimiento", "naciste", "viejo", "joven", "antigüedad"],
            responses: [
                "Soy un asistente virtual, no tengo edad física. Pero fui creado en 2025. 🎂",
                "¡No envejezco! Soy un programa creado para ayudarte, mi fecha de nacimiento es el día que me programaron.",
                "Los chatbots no envejecemos, pero mi creadora Isabel me dio vida en 2025. ¿Te imaginas tener 0 años siempre? 😄"
            ]
        },
        {
            intent: "clima",
            keywords: ["clima", "temperatura", "calor", "frío", "lluvia", "tiempo", "clima", "soleado", "nublado", "temperatura", "grados"],
            responses: [
                "No tengo acceso a información del clima en tiempo real. Te recomiendo usar Weather.com o AccuWeather. 🌤️",
                "¡Ojalá pudiera decirte el clima! Necesito una API de clima para eso. ¿Qué tal si pruebas mi Weather App?",
                "Como no tengo sensores, no sé el clima actual. Pero en Arequipa suele ser soleado de día y frío de noche. 🌞❄️"
            ]
        },
        {
            intent: "comida",
            keywords: ["comida", "restaurante", "almuerzo", "cena", "comer", "hambre", "que como", "receta", "cocinar", "gastronomía"],
            responses: [
                "¿Hambre? ¡Yo no como, pero sé de tecnología! 😄 Prueba apps como Rappi o PedidosYa para comida a domicilio.",
                "Como soy un chatbot, no necesito comer. Pero si buscas recetas, Pinterest tiene miles. ¿Qué te gusta cocinar? 🍳",
                "¡En Arequipa hay excelente comida! Te recomiendo probar el rocoto relleno o el adobo arequipeño. 🍽️"
            ]
        },
        {
            intent: "musica",
            keywords: ["música", "canciones", "spotify", "playlist", "genero", "artista", "rock", "pop", "reggaeton", "cancion", "melodía"],
            responses: [
                "¡Me encanta la música! Aunque no puedo escucharla, sé que el rock, pop y electrónica son populares. ¿Cuál es tu favorito? 🎵",
                "Soy un bot sin oídos, pero si quieres recomendaciones, Spotify tiene playlists geniales según tu estado de ánimo.",
                "Isabel escucha de todo, pero especialmente música para programar como Lo-Fi o música clásica. 🎧"
            ]
        },
        {
            intent: "futuro",
            keywords: ["futuro", "tecnología", "avances", "proximo", "nuevo", "innovación", "tendencias", "metaverso", "ia", "próximo"],
            responses: [
                "El futuro de la tecnología es emocionante: IA generativa, computación cuántica, realidad aumentada y más. 🚀",
                "Las tendencias tecnológicas apuntan a agentes de IA autónomos, web3 y neurotecnología. ¿Qué área te interesa más?",
                "En 2025 veremos más IA integrada en dispositivos cotidianos y asistentes más inteligentes como yo. 😉"
            ]
        },
        {
            intent: "gustos",
            keywords: ["gustos", "hobbies", "pasatiempos", "que te gusta", "que le gusta", "intereses", "aficiones", "gusta hacer"],
            responses: [
                "A Isabel le gusta programar, leer sobre tecnología, hacer ejercicio y explorar nuevas herramientas de IA. 🧠",
                "Sus hobbies incluyen aprender nuevos lenguajes de programación, jugar videojuegos y escuchar música mientras trabaja.",
                "Le encanta viajar y conocer nuevas culturas, y siempre está buscando cómo aplicar tecnología para resolver problemas."
            ]
        },
        {
            intent: "precio",
            keywords: ["precio", "costo", "cuanto cuesta", "gratis", "pagas", "dinero", "tarifa", "valor", "costos", "pagado"],
            responses: [
                "¡Soy completamente gratuito! Este chatbot es de código abierto y parte del portafolio de Isabel. 💰",
                "No cobro nada, soy un proyecto educativo. Isabel comparte todo su trabajo de forma gratuita para aprendizaje.",
                "El portafolio y todos sus proyectos son de acceso libre. ¡Solo necesitas conexión a internet!"
            ]
        },
        {
            intent: "ayuda",
            keywords: ["ayuda", "que haces", "funciones", "como usas", "que puedes hacer", "comandos", "para que sirves", "utilidad"],
            responses: [
                "Puedo ayudarte con información sobre Isabel, sus habilidades, proyectos, formación, contacto y más. Pregúntame cualquier cosa. 🤖",
                "¡Mis funciones son limitadas pero útiles! Respondo preguntas sobre el portafolio y temas de tecnología en general.",
                "Puedes preguntarme sobre: Isabel, habilidades, proyectos, contacto, formación, servicios, y curiosidades tecnológicas.",
                "Escribe /help para ver todos los comandos disponibles. 🚀"
            ]
        },
        {
            intent: "curiosidad",
            keywords: ["curiosidad", "dato curioso", "curioso", "sabías", "sabias", "dato", "interesante", "fun fact"],
            responses: [
                "¿Sabías que el primer chatbot se llamó ELIZA y fue creado en 1966? ¡La IA ha avanzado muchísimo desde entonces! 🤖",
                "Dato curioso: El 90% de los datos del mundo se han creado en los últimos 2 años. ¡La tecnología avanza muy rápido! 📊",
                "¿Sabías que Python es el lenguaje más usado para IA y Machine Learning? ¡Por eso Isabel lo está aprendiendo! 🐍",
                "Fun fact: El primer sitio web sigue online. Fue creado por Tim Berners-Lee en 1991. 🌐"
            ]
        }
    ],
    
    // Respuestas por defecto
    defaultResponses: [
        "No estoy seguro de haber entendido. ¿Podrías reformular tu pregunta?",
        "Lo siento, no tengo información sobre eso. ¿Te interesaría saber sobre mis habilidades o proyectos?",
        "No conozco la respuesta a eso aún. Estoy aprendiendo constantemente. ¿Pruebas preguntándome sobre Isabel, sus proyectos o cómo contactarla?",
        "¡Interesante pregunta! Aún no tengo esa información. ¿Qué tal si hablamos de mis habilidades o proyectos?",
        "Uy, esa es una pregunta difícil para mí. ¡Pero puedo ayudarte con información sobre Isabel o tecnología! 💡"
    ]
};

// ========== CLASE CHATBOT MEJORADA ==========
class Chatbot {
    constructor() {
        this.messagesContainer = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.suggestionBtns = document.querySelectorAll('.suggestion-btn');
        
        // Nuevas propiedades para contexto
        this.conversationContext = [];
        this.lastIntent = null;
        this.messageCount = 0;
        
        // Mensajes de bienvenida dinámicos
        this.mensajesBienvenida = [
            "¡Hola! Soy tu asistente virtual. 🤖 ¿En qué puedo ayudarte hoy?",
            "¡Bienvenido/a! Soy el chatbot de Isabel Sterling. Pregúntame sobre tecnología, proyectos o cómo contactarla. 💬",
            "¡Hey! Estoy aquí para resolver tus dudas sobre el portafolio de Isabel. ¿Qué te gustaría saber? 🚀",
            "¡Saludos! Soy un asistente con NLP básico. Pregúntame sobre desarrollo web, IA, proyectos o lo que necesites. ✨"
        ];
        
        this.initEventListeners();
        this.mostrarBienvenidaAleatoria();
        this.mostrarComandoAyuda();
    }
    
    // Mostrar bienvenida aleatoria después del mensaje inicial
    mostrarBienvenidaAleatoria() {
        const randomIndex = Math.floor(Math.random() * this.mensajesBienvenida.length);
        const mensaje = this.mensajesBienvenida[randomIndex];
        
        setTimeout(() => {
            this.addMessage(mensaje, 'bot');
        }, 800);
    }
    
    // Mostrar comando de ayuda después de un tiempo
    mostrarComandoAyuda() {
        setTimeout(() => {
            const mensaje = "💡 Tip: Escribe /help para ver todos los comandos disponibles.";
            this.addMessage(mensaje, 'bot');
        }, 3000);
    }
    
    initEventListeners() {
        // Botón enviar
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Enter para enviar
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
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
        
        // Focus en input al cargar
        this.userInput.focus();
    }
    
    // Enviar mensaje del usuario
    async sendMessage() {
        const message = this.userInput.value.trim();
        
        // Validación con feedback visual
        if (message === '') {
            this.userInput.style.borderColor = '#FF6584';
            this.userInput.style.boxShadow = '0 0 20px rgba(255, 101, 132, 0.3)';
            this.userInput.placeholder = '✍️ ¡Escribe algo!';
            setTimeout(() => {
                this.userInput.style.borderColor = '';
                this.userInput.style.boxShadow = '';
                this.userInput.placeholder = 'Escribe tu mensaje aquí...';
            }, 2000);
            return;
        }
        
        // Mostrar mensaje del usuario
        this.addMessage(message, 'user');
        this.userInput.value = '';
        this.userInput.focus();
        
        // Mostrar indicador de escritura
        this.showTypingIndicator();
        
        // Procesar respuesta (simulando tiempo de procesamiento)
        setTimeout(() => {
            const response = this.processMessage(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
            this.scrollToBottom();
        }, 500 + Math.random() * 600);
    }
    
    // Procesar mensaje con NLP y contexto
    processMessage(message) {
        // Guardar mensaje en contexto
        this.conversationContext.push({ role: 'user', content: message });
        if (this.conversationContext.length > 20) {
            this.conversationContext.shift();
        }
        this.messageCount++;
        
        // ========== COMANDOS RÁPIDOS ==========
        if (message.startsWith('/')) {
            const command = message.slice(1).toLowerCase().trim();
            
            const commands = {
                'help': `📋 **Comandos disponibles:**\n\n` +
                       `/help - Mostrar esta ayuda\n` +
                       `/habilidades - Ver habilidades de Isabel\n` +
                       `/proyectos - Ver proyectos destacados\n` +
                       `/contacto - Información de contacto\n` +
                       `/formacion - Información académica\n` +
                       `/servicios - Servicios ofrecidos\n` +
                       `/clear - Limpiar el chat\n` +
                       `/saludo - Saludo personalizado\n` +
                       `/curiosidad - Dato curioso de tecnología`,
                
                'habilidades': `💻 **Habilidades de Isabel:**\n\n` +
                              `• 🌐 HTML5, CSS3, JavaScript\n` +
                              `• ⚡ Bootstrap, React (aprendiendo)\n` +
                              `• 🐍 Python, Flask\n` +
                              `• 🤖 IA, NLP, Machine Learning\n` +
                              `• 📊 Ciencia de Datos\n` +
                              `• 🔒 Ciberseguridad básica`,
                
                'proyectos': `📂 **Proyectos destacados:**\n\n` +
                             `• 🤖 Chatbot con NLP\n` +
                             `• 💱 Conversor de Monedas\n` +
                             `• 📝 Lista de Tareas\n` +
                             `• 🧠 Trivia Interactiva\n` +
                             `• 📒 Notas con LocalStorage\n` +
                             `• 🌐 Portafolio Web\n` +
                             `• ⏰ Reloj Mundial\n` +
                             `• 🔐 Generador de Contraseñas (Python)`,
                
                'contacto': `📞 **Información de contacto:**\n\n` +
                            `📧 Email: 1663551@senati.pe\n` +
                            `📱 WhatsApp: +51 953 870 664\n` +
                            `📍 Ubicación: Arequipa, Perú\n\n` +
                            `🔗 **Redes Sociales:**\n` +
                            `• 📘 Facebook: @isabelsterlingg\n` +
                            `• 📸 Instagram: @isabelsterlingg\n` +
                            `• 💼 LinkedIn: @isabelsterling\n` +
                            `• 💻 GitHub: @isabelsterling`,
                
                'formacion': `🎓 **Formación académica:**\n\n` +
                             `• 📚 Ingeniería de Software con IA - SENATI (2do semestre)\n` +
                             `• 🔒 Ciberseguridad Essentials - Cisco\n` +
                             `• 🌐 Conciencia Digital - Google\n` +
                             `• 📊 Introducción a Ciencia de Datos - IBM`,
                
                'servicios': `💼 **Servicios ofrecidos:**\n\n` +
                             `• 💻 Desarrollo web frontend\n` +
                             `• 🤖 Soluciones con IA\n` +
                             `• 📱 Aplicaciones interactivas\n` +
                             `• 🔌 Integración de APIs\n` +
                             `• 📋 Formularios y bases de datos\n` +
                             `• 📚 Asesoría tecnológica`,
                
                'clear': 'clear',
                
                'saludo': `¡Hola! 👋 Soy tu asistente virtual. ¿Cómo estás hoy? ¿En qué puedo ayudarte?`,
                
                'curiosidad': `🧠 **Dato curioso:**\n\n` +
                              `¿Sabías que el primer sitio web sigue online? Fue creado por Tim Berners-Lee en 1991.\n\n` +
                              `Otro dato: El 90% de los datos del mundo se han creado en los últimos 2 años. ¡La tecnología avanza muy rápido! 📊`
            };
            
            if (command === 'clear') {
                this.messagesContainer.innerHTML = '';
                this.addMessage('🧹 Chat limpiado. ¿En qué puedo ayudarte?', 'bot');
                return '';
            }
            
            if (commands[command]) {
                return commands[command];
            }
            
            return `❌ Comando no reconocido. Escribe /help para ver los comandos disponibles.`;
        }
        
        // ========== PROCESAMIENTO NLP NORMAL ==========
        const normalizedMessage = message.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
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
        
        // ========== CONTEXTO DE CONVERSACIÓN ==========
        // Si no hay coincidencia clara, usar contexto
        if (!bestMatch || maxScore < 1) {
            // Si la última intención fue "proyectos" y pregunta sobre el mejor
            if (this.lastIntent === 'proyectos' && 
                (normalizedMessage.includes('mejor') || normalizedMessage.includes('recomiendas') || 
                 normalizedMessage.includes('cuál') || normalizedMessage.includes('cual'))) {
                return "¡Mi favorito es el Chatbot con NLP! Es el que me da vida. También recomiendo la Calculadora y el Conversor de Monedas. ¿Qué tipo de proyecto te interesa más? 🚀";
            }
            
            // Si la última intención fue "habilidades" y pregunta sobre la más importante
            if (this.lastIntent === 'habilidades' && 
                (normalizedMessage.includes('importante') || normalizedMessage.includes('principal') || 
                 normalizedMessage.includes('esencial'))) {
                return "Para Isabel, JavaScript es fundamental porque es el lenguaje más versátil para web. Pero Python es crucial para IA. ¡Ambos son clave! 💻";
            }
            
            // Si la última intención fue "contacto" y pregunta sobre tiempo de respuesta
            if (this.lastIntent === 'contacto' && 
                (normalizedMessage.includes('cuando') || normalizedMessage.includes('tiempo') || 
                 normalizedMessage.includes('demora') || normalizedMessage.includes('responde'))) {
                return "Isabel suele responder en menos de 24 horas. Por WhatsApp es más rápido, ¡en minutos! 📱";
            }
            
            // Si la última intención fue "proyectos" y pregunta sobre tecnologías
            if (this.lastIntent === 'proyectos' && 
                (normalizedMessage.includes('tecnologia') || normalizedMessage.includes('tecnologías') || 
                 normalizedMessage.includes('herramientas'))) {
                return "Los proyectos usan: HTML, CSS, JS, Bootstrap, Python, Firebase y APIs REST. ¡Tecnologías modernas! 🛠️";
            }

            // Respuesta por defecto con contexto
            const defaultResponses = [
                "No estoy seguro de haber entendido. ¿Podrías reformular tu pregunta?",
                "Lo siento, no tengo información sobre eso. ¿Te interesaría saber sobre mis habilidades o proyectos?",
                "¡Interesante pregunta! Aún no tengo esa información. ¿Qué tal si hablamos de mis habilidades o proyectos?",
                "Uy, esa es una pregunta difícil para mí. ¡Puedo ayudarte con información sobre Isabel o tecnología! 💡"
            ];
            const randomIndex = Math.floor(Math.random() * defaultResponses.length);
            return defaultResponses[randomIndex];
        }
        
        // Guardar última intención para contexto
        this.lastIntent = bestMatch.intent;
        
        // Elegir respuesta aleatoria
        const randomIndex = Math.floor(Math.random() * bestMatch.responses.length);
        const response = bestMatch.responses[randomIndex];
        
        // Guardar respuesta en contexto
        this.conversationContext.push({ role: 'assistant', content: response });
        
        return response;
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
console.log('%c🤖 Chatbot IA Iniciado', 'color: #6C63FF; font-size: 16px; font-weight: bold;');
console.log('%c💬 Procesamiento de Lenguaje Natural (NLP) activo', 'color: #8892B0; font-size: 12px;');
console.log('%c📋 Escribe /help para ver los comandos disponibles', 'color: #FF6584; font-size: 12px;');
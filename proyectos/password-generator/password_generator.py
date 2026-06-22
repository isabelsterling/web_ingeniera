#!/usr/bin/env python3
"""
GENERADOR DE CONTRASEÑAS SEGURAS
Aplicación de consola que genera contraseñas aleatorias seguras
con múltiples opciones de personalización.
"""

import random
import string
import sys
import os
from datetime import datetime

# Colores para terminal (ANSI)
class Colors:
    """Colores para la terminal"""
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

class PasswordGenerator:
    """Clase principal del generador de contraseñas"""
    
    def __init__(self):
        self.version = "1.0.0"
        self.history = []
        
    def limpiar_pantalla(self):
        """Limpia la pantalla de la terminal"""
        os.system('cls' if os.name == 'nt' else 'clear')
    
    def mostrar_banner(self):
        """Muestra el banner del programa"""
        banner = f"""
{Colors.CYAN}{'='*60}{Colors.END}
{Colors.BOLD}{Colors.GREEN}   🔐 GENERADOR DE CONTRASEÑAS SEGURAS v{self.version}{Colors.END}
{Colors.CYAN}{'='*60}{Colors.END}
{Colors.YELLOW}   Creado por: Isabel Sterling
   GitHub: @isabelsterling
   Seguridad y Criptografía{Colors.END}
{Colors.CYAN}{'='*60}{Colors.END}
"""
        print(banner)
    
    def mostrar_menu_principal(self):
        """Muestra el menú principal"""
        print(f"\n{Colors.BOLD}{Colors.BLUE}📋 MENÚ PRINCIPAL{Colors.END}")
        print(f"{Colors.CYAN}1.{Colors.END} 🔐 Generar contraseña")
        print(f"{Colors.CYAN}2.{Colors.END} 📜 Ver historial de contraseñas")
        print(f"{Colors.CYAN}3.{Colors.END} 🗑️  Limpiar historial")
        print(f"{Colors.CYAN}4.{Colors.END} ℹ️  Acerca de")
        print(f"{Colors.CYAN}5.{Colors.END} 🚪 Salir")
        print(f"{Colors.CYAN}{'-'*40}{Colors.END}")
    
    def obtener_longitud(self):
        """Obtiene la longitud de la contraseña del usuario"""
        while True:
            try:
                print(f"\n{Colors.BOLD}📏 Longitud de la contraseña:{Colors.END}")
                print(f"   {Colors.YELLOW}Recomendado: 12-16 caracteres para máxima seguridad{Colors.END}")
                longitud = int(input(f"   {Colors.GREEN}➜{Colors.END} Ingrese longitud (8-64): "))
                
                if 8 <= longitud <= 64:
                    return longitud
                else:
                    print(f"   {Colors.RED}❌ La longitud debe estar entre 8 y 64 caracteres{Colors.END}")
            except ValueError:
                print(f"   {Colors.RED}❌ Por favor, ingrese un número válido{Colors.END}")
    
    def obtener_opciones(self):
        """Obtiene las opciones de personalización"""
        print(f"\n{Colors.BOLD}🔧 PERSONALIZACIÓN{Colors.END}")
        print(f"   {Colors.YELLOW}Seleccione qué caracteres incluir:{Colors.END}")
        
        while True:
            mayusculas = input(f"   {Colors.CYAN}¿Incluir mayúsculas? (s/n): {Colors.END}").lower() == 's'
            minusculas = input(f"   {Colors.CYAN}¿Incluir minúsculas? (s/n): {Colors.END}").lower() == 's'
            numeros = input(f"   {Colors.CYAN}¿Incluir números? (s/n): {Colors.END}").lower() == 's'
            simbolos = input(f"   {Colors.CYAN}¿Incluir símbolos? (s/n): {Colors.END}").lower() == 's'
            
            if mayusculas or minusculas or numeros or simbolos:
                return mayusculas, minusculas, numeros, simbolos
            else:
                print(f"   {Colors.RED}❌ Debe seleccionar al menos un tipo de caracter{Colors.END}")
    
    def construir_conjunto_caracteres(self, mayusculas, minusculas, numeros, simbolos):
        """Construye el conjunto de caracteres según opciones"""
        caracteres = ""
        
        if minusculas:
            caracteres += string.ascii_lowercase
        if mayusculas:
            caracteres += string.ascii_uppercase
        if numeros:
            caracteres += string.digits
        if simbolos:
            caracteres += "!@#$%^&*()_+-=[]{}|;:,.<>?"
        
        return caracteres
    
    def calcular_entropia(self, longitud, conjunto_tamano):
        """
        Calcula la entropía de la contraseña
        Entropía = log2(conjunto_tamano^longitud) = longitud * log2(conjunto_tamano)
        """
        if conjunto_tamano == 0:
            return 0
        import math
        entropia = longitud * math.log2(conjunto_tamano)
        return entropia
    
    def obtener_nivel_seguridad(self, entropia):
        """Determina el nivel de seguridad según la entropía"""
        if entropia < 30:
            return "MUY DÉBIL", Colors.RED
        elif entropia < 50:
            return "DÉBIL", Colors.YELLOW
        elif entropia < 70:
            return "MEDIO", Colors.CYAN
        elif entropia < 90:
            return "FUERTE", Colors.GREEN
        else:
            return "MUY FUERTE", Colors.BOLD + Colors.GREEN
    
    def generar_contrasena(self, longitud, caracteres):
        """Genera la contraseña aleatoria"""
        if not caracteres:
            return None
        
        # Asegurar al menos un carácter de cada tipo seleccionado
        contrasena = []
        
        # Generar el resto de caracteres aleatoriamente
        for _ in range(longitud):
            contrasena.append(random.choice(caracteres))
        
        # Mezclar para mayor aleatoriedad
        random.shuffle(contrasena)
        
        return ''.join(contrasena)
    
    def verificar_contrasena(self, contrasena):
        """Verifica la fortaleza de la contraseña"""
        criterios = {
            'longitud': len(contrasena) >= 12,
            'mayusculas': any(c.isupper() for c in contrasena),
            'minusculas': any(c.islower() for c in contrasena),
            'numeros': any(c.isdigit() for c in contrasena),
            'simbolos': any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in contrasena)
        }
        
        puntaje = sum(criterios.values())
        
        if puntaje == 5:
            return "Excelente", "green"
        elif puntaje >= 4:
            return "Buena", "cyan"
        elif puntaje >= 3:
            return "Regular", "yellow"
        else:
            return "Débil", "red"
    
    def guardar_en_historial(self, contrasena, entropia, nivel):
        """Guarda la contraseña generada en el historial"""
        registro = {
            'fecha': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'contrasena': contrasena,
            'longitud': len(contrasena),
            'entropia': round(entropia, 2),
            'nivel': nivel
        }
        self.history.append(registro)
        
        # Guardar también en archivo
        self.guardar_historial_archivo()
    
    def guardar_historial_archivo(self):
        """Guarda el historial en un archivo JSON"""
        import json
        try:
            with open('historial_contrasenas.json', 'w', encoding='utf-8') as f:
                json.dump(self.history, f, indent=2, ensure_ascii=False)
        except Exception as e:
            pass  # Silenciar errores de escritura
    
    def cargar_historial_archivo(self):
        """Carga el historial desde el archivo JSON"""
        import json
        try:
            with open('historial_contrasenas.json', 'r', encoding='utf-8') as f:
                self.history = json.load(f)
        except FileNotFoundError:
            self.history = []
        except Exception as e:
            self.history = []
    
    def mostrar_historial(self):
        """Muestra el historial de contraseñas generadas"""
        self.cargar_historial_archivo()
        
        if not self.history:
            print(f"\n{Colors.YELLOW}📭 No hay contraseñas en el historial{Colors.END}")
            return
        
        print(f"\n{Colors.BOLD}{Colors.CYAN}📜 HISTORIAL DE CONTRASEÑAS{Colors.END}")
        print(f"{Colors.CYAN}{'-'*60}{Colors.END}")
        
        for i, registro in enumerate(reversed(self.history[-10:]), 1):
            print(f"\n{Colors.GREEN}[{i}]{Colors.END} 📅 {registro['fecha']}")
            print(f"   🔐 Contraseña: {Colors.YELLOW}{registro['contrasena']}{Colors.END}")
            print(f"   📏 Longitud: {registro['longitud']}")
            print(f"   🔒 Entropía: {registro['entropia']} bits")
            print(f"   ⚡ Nivel: {registro['nivel']}")
        
        print(f"\n{Colors.CYAN}{'-'*60}{Colors.END}")
        print(f"{Colors.YELLOW}📊 Total de contraseñas generadas: {len(self.history)}{Colors.END}")
    
    def limpiar_historial(self):
        """Limpia todo el historial"""
        confirmar = input(f"\n{Colors.RED}⚠️  ¿Está seguro de eliminar todo el historial? (s/n): {Colors.END}").lower()
        
        if confirmar == 's':
            self.history = []
            self.guardar_historial_archivo()
            print(f"{Colors.GREEN}✅ Historial limpiado correctamente{Colors.END}")
        else:
            print(f"{Colors.CYAN}❌ Operación cancelada{Colors.END}")
    
    def mostrar_acerca_de(self):
        """Muestra información sobre el programa"""
        info = f"""
{Colors.BOLD}{Colors.BLUE}ℹ️ ACERCA DEL PROGRAMA{Colors.END}

📌 Nombre: Generador de Contraseñas Seguras
🔢 Versión: {self.version}
🐍 Lenguaje: Python 3.x
👩‍💻 Desarrolladora: Isabel Sterling
📧 Contacto: 1663551@senati.pe

{Colors.BOLD}🎯 CARACTERÍSTICAS:{Colors.END}
   • Generación de contraseñas aleatorias seguras
   • Personalización de caracteres (mayúsculas, minúsculas, números, símbolos)
   • Cálculo de entropía para medir seguridad
   • Verificación de fortaleza de contraseñas
   • Historial de contraseñas generadas
   • Interfaz amigable con colores

{Colors.BOLD}🔐 RECOMENDACIONES DE SEGURIDAD:{Colors.END}
   • Use contraseñas de al menos 12 caracteres
   • Combine mayúsculas, minúsculas, números y símbolos
   • No use la misma contraseña en múltiples sitios
   • Cambie sus contraseñas periódicamente
   • Use un gestor de contraseñas para almacenarlas

{Colors.BOLD}📚 RECURSOS:{Colors.END}
   • GitHub: https://github.com/isabelsterling
   • Documentación: https://docs.python.org/3/library/random.html
"""
        print(info)
    
    def generar_y_mostrar(self):
        """Genera y muestra una nueva contraseña"""
        print(f"\n{Colors.BOLD}{Colors.GREEN}🔐 INICIO DE GENERACIÓN{Colors.END}")
        
        # Obtener parámetros
        longitud = self.obtener_longitud()
        mayusculas, minusculas, numeros, simbolos = self.obtener_opciones()
        
        # Construir conjunto de caracteres
        caracteres = self.construir_conjunto_caracteres(mayusculas, minusculas, numeros, simbolos)
        tamano_conjunto = len(caracteres)
        
        if tamano_conjunto == 0:
            print(f"{Colors.RED}❌ Error: No hay caracteres para generar la contraseña{Colors.END}")
            return
        
        # Generar contraseña
        contrasena = self.generar_contrasena(longitud, caracteres)
        
        if contrasena is None:
            print(f"{Colors.RED}❌ Error al generar la contraseña{Colors.END}")
            return
        
        # Calcular entropía
        entropia = self.calcular_entropia(longitud, tamano_conjunto)
        nivel_seguridad, color_nivel = self.obtener_nivel_seguridad(entropia)
        
        # Verificar fortaleza
        fortaleza, color_fortaleza = self.verificar_contrasena(contrasena)
        color_fortaleza_map = {
            'green': Colors.GREEN,
            'cyan': Colors.CYAN,
            'yellow': Colors.YELLOW,
            'red': Colors.RED
        }
        
        # Mostrar resultado
        print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.END}")
        print(f"{Colors.BOLD}🔐 CONTRASEÑA GENERADA{Colors.END}")
        print(f"{Colors.CYAN}{'='*60}{Colors.END}")
        
        print(f"\n{Colors.BOLD}📝 Contraseña:{Colors.END}")
        print(f"   {Colors.GREEN}{contrasena}{Colors.END}")
        
        print(f"\n{Colors.BOLD}📊 ANÁLISIS DE SEGURIDAD:{Colors.END}")
        print(f"   📏 Longitud: {longitud} caracteres")
        print(f"   🔢 Espacio de caracteres: {tamano_conjunto}")
        print(f"   🔒 Entropía: {entropia:.2f} bits")
        print(f"   ⚡ Nivel de seguridad: {color_nivel}{nivel_seguridad}{Colors.END}")
        print(f"   🛡️  Fortaleza: {color_fortaleza_map[color_fortaleza]}{fortaleza}{Colors.END}")
        
        # Tiempo estimado para crackear
        tiempo_crackeo = self.calcular_tiempo_crackeo(entropia)
        print(f"   ⏰ Tiempo estimado para crackear: {tiempo_crackeo}")
        
        # Guardar en historial
        self.guardar_en_historial(contrasena, entropia, nivel_seguridad)
        
        print(f"\n{Colors.GREEN}✅ Contraseña guardada en el historial{Colors.END}")
        print(f"{Colors.CYAN}{'='*60}{Colors.END}")
        
        # Preguntar si desea guardar en archivo
        guardar = input(f"\n{Colors.YELLOW}💾 ¿Guardar esta contraseña en un archivo? (s/n): {Colors.END}").lower()
        if guardar == 's':
            self.guardar_en_archivo(contrasena)
        
        input(f"\n{Colors.CYAN}Presione Enter para continuar...{Colors.END}")
    
    def calcular_tiempo_crackeo(self, entropia):
        """Calcula el tiempo estimado para crackear la contraseña"""
        if entropia < 30:
            return "menos de 1 segundo"
        elif entropia < 40:
            return "minutos"
        elif entropia < 50:
            return "horas"
        elif entropia < 60:
            return "días"
        elif entropia < 70:
            return "meses"
        elif entropia < 80:
            return "años"
        elif entropia < 90:
            return "siglos"
        else:
            return "miles de años"
    
    def guardar_en_archivo(self, contrasena):
        """Guarda la contraseña en un archivo de texto"""
        try:
            with open('contrasenas_generadas.txt', 'a', encoding='utf-8') as f:
                f.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {contrasena}\n")
            print(f"{Colors.GREEN}✅ Contraseña guardada en 'contrasenas_generadas.txt'{Colors.END}")
        except Exception as e:
            print(f"{Colors.RED}❌ Error al guardar: {e}{Colors.END}")
    
    def mostrar_consejos_seguridad(self):
        """Muestra consejos de seguridad"""
        consejos = [
            "🔐 Usa contraseñas diferentes para cada servicio",
            "🔄 Cambia tus contraseñas cada 3-6 meses",
            "🚫 No compartas tus contraseñas por mensaje o email",
            "🔑 Usa un gestor de contraseñas (Bitwarden, LastPass, 1Password)",
            "📱 Activa la autenticación de dos factores (2FA) cuando sea posible",
            "❌ Evita usar información personal (fechas, nombres, etc.)",
            "🎲 Las contraseñas largas son más seguras que las cortas con muchos símbolos",
            "🧹 No guardes contraseñas en el navegador sin cifrar"
        ]
        
        print(f"\n{Colors.BOLD}{Colors.YELLOW}💡 CONSEJOS DE SEGURIDAD{Colors.END}")
        print(f"{Colors.CYAN}{'-'*50}{Colors.END}")
        for consejo in consejos:
            print(f"   {consejo}")
        print(f"{Colors.CYAN}{'-'*50}{Colors.END}")
    
    def ejecutar(self):
        """Ejecuta el programa principal"""
        self.cargar_historial_archivo()
        
        while True:
            self.limpiar_pantalla()
            self.mostrar_banner()
            self.mostrar_menu_principal()
            
            opcion = input(f"\n{Colors.GREEN}👉 Seleccione una opción: {Colors.END}")
            
            if opcion == '1':
                self.generar_y_mostrar()
            elif opcion == '2':
                self.limpiar_pantalla()
                self.mostrar_banner()
                self.mostrar_historial()
                input(f"\n{Colors.CYAN}Presione Enter para continuar...{Colors.END}")
            elif opcion == '3':
                self.limpiar_pantalla()
                self.mostrar_banner()
                self.limpiar_historial()
                input(f"\n{Colors.CYAN}Presione Enter para continuar...{Colors.END}")
            elif opcion == '4':
                self.limpiar_pantalla()
                self.mostrar_banner()
                self.mostrar_acerca_de()
                self.mostrar_consejos_seguridad()
                input(f"\n{Colors.CYAN}Presione Enter para continuar...{Colors.END}")
            elif opcion == '5':
                print(f"\n{Colors.GREEN}👋 ¡Gracias por usar el Generador de Contraseñas Seguras!{Colors.END}")
                print(f"{Colors.YELLOW}🔐 Recuerda mantener tus contraseñas seguras{Colors.END}\n")
                sys.exit(0)
            else:
                print(f"\n{Colors.RED}❌ Opción no válida{Colors.END}")
                input(f"{Colors.CYAN}Presione Enter para continuar...{Colors.END}")

# Punto de entrada principal
if __name__ == "__main__":
    try:
        app = PasswordGenerator()
        app.ejecutar()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}👋 ¡Hasta luego! Recuerda mantener tus contraseñas seguras.{Colors.END}\n")
        sys.exit(0)
    except Exception as e:
        print(f"\n{Colors.RED}❌ Error inesperado: {e}{Colors.END}")
        sys.exit(1)
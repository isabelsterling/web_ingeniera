#!/usr/bin/env python3
"""
🔢 ADIVINA EL NÚMERO - Versión Python
Juego de consola donde adivinas un número aleatorio
"""

import random
import os
import sys
import time
from datetime import datetime

# Colores para terminal
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

class AdivinaNumero:
    def __init__(self):
        self.minimo = 1
        self.maximo = 100
        self.numero_secreto = 0
        self.intentos = 0
        self.historial = []
        self.juego_terminado = False
        self.tiempo_inicio = 0
        self.mejor_puntuacion = self.cargar_mejor_puntuacion()
    
    def limpiar_pantalla(self):
        """Limpia la pantalla de la terminal"""
        os.system('cls' if os.name == 'nt' else 'clear')
    
    def cargar_mejor_puntuacion(self):
        """Carga la mejor puntuación desde un archivo"""
        try:
            with open('mejor_puntuacion.txt', 'r') as f:
                return int(f.read().strip())
        except:
            return 0
    
    def guardar_mejor_puntuacion(self):
        """Guarda la mejor puntuación en un archivo"""
        if self.intentos < self.mejor_puntuacion or self.mejor_puntuacion == 0:
            self.mejor_puntuacion = self.intentos
            with open('mejor_puntuacion.txt', 'w') as f:
                f.write(str(self.mejor_puntuacion))
    
    def mostrar_banner(self):
        """Muestra el banner del juego"""
        banner = f"""
{Colors.CYAN}╔══════════════════════════════════════════════════╗
║                                                      ║
║    {Colors.BOLD}{Colors.YELLOW}🔢  ADIVINA EL NÚMERO  🔢{Colors.END}{Colors.CYAN}    ║
║                                                      ║
║    {Colors.GREEN}Adivina el número secreto entre   ║
║    {Colors.GREEN}{self.minimo} y {self.maximo}{Colors.CYAN}              ║
║                                                      ║
╚══════════════════════════════════════════════════════╝{Colors.END}
"""
        print(banner)
    
    def mostrar_estadisticas(self):
        """Muestra estadísticas del juego"""
        print(f"\n{Colors.BOLD}{Colors.CYAN}📊 ESTADÍSTICAS{Colors.END}")
        print(f"   🎯 Número secreto: {Colors.YELLOW}?{Colors.END}")
        print(f"   👆 Intentos: {Colors.BLUE}{self.intentos}{Colors.END}")
        print(f"   🏅 Mejor puntuación: {Colors.GREEN}{self.mejor_puntuacion if self.mejor_puntuacion > 0 else '--'}{Colors.END}")
        print(f"   📊 Rango: {self.minimo} - {self.maximo}")
        
        if self.historial:
            print(f"\n   📝 Últimos intentos:")
            for i, (num, resultado) in enumerate(self.historial[-5:], 1):
                icono = "✅" if resultado == "correcto" else "⬆️" if resultado == "alto" else "⬇️"
                print(f"      {i}. {num} {icono}")
    
    def mostrar_historial_completo(self):
        """Muestra el historial completo de intentos"""
        if not self.historial:
            print(f"\n{Colors.YELLOW}📭 No hay intentos aún{Colors.END}")
            return
        
        print(f"\n{Colors.BOLD}{Colors.CYAN}📜 HISTORIAL COMPLETO{Colors.END}")
        print(f"{Colors.CYAN}{'─'*40}{Colors.END}")
        for i, (num, resultado) in enumerate(self.historial, 1):
            if resultado == "correcto":
                icono = f"{Colors.GREEN}✅{Colors.END}"
            elif resultado == "alto":
                icono = f"{Colors.YELLOW}⬆️{Colors.END}"
            else:
                icono = f"{Colors.BLUE}⬇️{Colors.END}"
            print(f"   {i:2}. {num:3} {icono}  {resultado.capitalize()}")
        print(f"{Colors.CYAN}{'─'*40}{Colors.END}")
    
    def configurar_rango(self):
        """Permite al usuario configurar el rango del juego"""
        print(f"\n{Colors.BOLD}{Colors.CYAN}⚙️ CONFIGURAR RANGO{Colors.END}")
        print(f"   Rango actual: {self.minimo} - {self.maximo}")
        
        respuesta = input(f"\n   {Colors.YELLOW}¿Quieres cambiar el rango? (s/n): {Colors.END}").lower()
        if respuesta != 's':
            return
        
        while True:
            try:
                minimo = int(input(f"   {Colors.GREEN}➜{Colors.END} Mínimo: "))
                maximo = int(input(f"   {Colors.GREEN}➜{Colors.END} Máximo: "))
                
                if minimo >= maximo:
                    print(f"   {Colors.RED}❌ El mínimo debe ser menor que el máximo{Colors.END}")
                    continue
                
                if maximo - minimo < 5:
                    print(f"   {Colors.RED}❌ El rango debe tener al menos 5 números{Colors.END}")
                    continue
                
                if minimo < 1:
                    print(f"   {Colors.RED}❌ El mínimo debe ser mayor a 0{Colors.END}")
                    continue
                
                self.minimo = minimo
                self.maximo = maximo
                print(f"   {Colors.GREEN}✅ Rango actualizado: {self.minimo} - {self.maximo}{Colors.END}")
                break
                
            except ValueError:
                print(f"   {Colors.RED}❌ Ingresa números válidos{Colors.END}")
    
    def nuevo_juego(self):
        """Inicia un nuevo juego"""
        self.numero_secreto = random.randint(self.minimo, self.maximo)
        self.intentos = 0
        self.historial = []
        self.juego_terminado = False
        self.tiempo_inicio = time.time()
        
        self.limpiar_pantalla()
        self.mostrar_banner()
        print(f"\n{Colors.GREEN}🎯 ¡Nuevo juego iniciado!{Colors.END}")
        print(f"   El número secreto está entre {self.minimo} y {self.maximo}")
        
        while not self.juego_terminado:
            self.mostrar_estadisticas()
            
            try:
                entrada = input(f"\n{Colors.GREEN}🔢 Tu número: {Colors.END}")
                
                # Comandos especiales
                if entrada.lower() in ['salir', 'exit', 'quit']:
                    print(f"\n{Colors.YELLOW}👋 ¡Gracias por jugar!{Colors.END}")
                    sys.exit(0)
                
                if entrada.lower() in ['historial', 'history']:
                    self.mostrar_historial_completo()
                    input(f"\n{Colors.CYAN}Presiona Enter para continuar...{Colors.END}")
                    self.limpiar_pantalla()
                    self.mostrar_banner()
                    continue
                
                if entrada.lower() in ['configurar', 'config']:
                    self.configurar_rango()
                    self.nuevo_juego()
                    return
                
                numero = int(entrada)
                
                if numero < self.minimo or numero > self.maximo:
                    print(f"   {Colors.RED}❌ El número debe estar entre {self.minimo} y {self.maximo}{Colors.END}")
                    continue
                
                self.intentos += 1
                
                if numero == self.numero_secreto:
                    self.historial.append((numero, "correcto"))
                    self.juego_terminado = True
                    self.finalizar_juego()
                elif numero < self.numero_secreto:
                    self.historial.append((numero, "bajo"))
                    print(f"   {Colors.BLUE}📈 Más alto...{Colors.END}")
                else:
                    self.historial.append((numero, "alto"))
                    print(f"   {Colors.YELLOW}📉 Más bajo...{Colors.END}")
                
            except ValueError:
                print(f"   {Colors.RED}❌ Ingresa un número válido{Colors.END}")
            except KeyboardInterrupt:
                print(f"\n\n{Colors.YELLOW}👋 ¡Hasta luego!{Colors.END}")
                sys.exit(0)
    
    def finalizar_juego(self):
        """Finaliza el juego y muestra los resultados"""
        tiempo_total = round(time.time() - self.tiempo_inicio)
        
        self.limpiar_pantalla()
        self.mostrar_banner()
        
        print(f"\n{Colors.BOLD}{Colors.GREEN}🎉 ¡FELICIDADES! Has adivinado el número{Colors.END}")
        print(f"\n{Colors.BOLD}📊 RESUMEN:{Colors.END}")
        print(f"   🎯 Número secreto: {Colors.YELLOW}{self.numero_secreto}{Colors.END}")
        print(f"   👆 Intentos: {Colors.BLUE}{self.intentos}{Colors.END}")
        print(f"   ⏱️ Tiempo: {Colors.CYAN}{tiempo_total} segundos{Colors.END}")
        
        # Mensaje según rendimiento
        if self.intentos <= 5:
            mensaje = "⭐ ¡Excelente! Eres un genio de las adivinanzas"
            color = Colors.GREEN
        elif self.intentos <= 10:
            mensaje = "👍 ¡Muy bien! Has hecho un gran trabajo"
            color = Colors.BLUE
        elif self.intentos <= 15:
            mensaje = "💪 Buen intento, sigue practicando"
            color = Colors.YELLOW
        else:
            mensaje = "🤔 No te rindas, la práctica hace al maestro"
            color = Colors.RED
        
        print(f"\n   {color}{mensaje}{Colors.END}")
        
        # Mostrar historial completo
        self.mostrar_historial_completo()
        
        # Guardar mejor puntuación
        self.guardar_mejor_puntuacion()
        
        print(f"\n{Colors.CYAN}🏅 Mejor puntuación: {self.mejor_puntuacion if self.mejor_puntuacion > 0 else '--'} intentos{Colors.END}")
        
        # Opciones al finalizar
        print(f"\n{Colors.BOLD}📋 OPCIONES:{Colors.END}")
        print(f"   1. Jugar de nuevo")
        print(f"   2. Configurar rango")
        print(f"   3. Salir")
        
        while True:
            opcion = input(f"\n{Colors.GREEN}➜ Elige una opción: {Colors.END}")
            
            if opcion == '1':
                self.nuevo_juego()
                return
            elif opcion == '2':
                self.configurar_rango()
                self.nuevo_juego()
                return
            elif opcion == '3':
                print(f"\n{Colors.YELLOW}👋 ¡Gracias por jugar!{Colors.END}")
                sys.exit(0)
            else:
                print(f"   {Colors.RED}❌ Opción no válida{Colors.END}")

# ========== EJECUTAR JUEGO ==========
if __name__ == "__main__":
    try:
        juego = AdivinaNumero()
        juego.nuevo_juego()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}👋 ¡Hasta luego!{Colors.END}")
        sys.exit(0)
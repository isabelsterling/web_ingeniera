#!/usr/bin/env python3
"""
🔢 ADIVINA EL NÚMERO - Versión Python Mejorada
Juego de consola donde adivinas un número aleatorio
Con sistema de puntuación, niveles, pistas y más
"""

import random
import os
import sys
import time
import json
from datetime import datetime
from typing import List, Tuple, Optional

# ─────────────────────────────────────────────────────────────────────────────
# COLORES PARA TERMINAL
# ─────────────────────────────────────────────────────────────────────────────
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    MAGENTA = '\033[35m'
    WHITE = '\033[37m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'
    
    # Estilos combinados
    SUCCESS = f"{GREEN}{BOLD}"
    ERROR = f"{RED}{BOLD}"
    WARNING = f"{YELLOW}{BOLD}"
    INFO = f"{CYAN}{BOLD}"

# ─────────────────────────────────────────────────────────────────────────────
# CLASE PRINCIPAL DEL JUEGO
# ─────────────────────────────────────────────────────────────────────────────
class AdivinaNumero:
    def __init__(self):
        self.minimo = 1
        self.maximo = 100
        self.numero_secreto = 0
        self.intentos = 0
        self.intentos_maximos = 20
        self.historial: List[Tuple[int, str]] = []
        self.juego_terminado = False
        self.tiempo_inicio = 0
        self.puntuacion = 0
        self.record = self.cargar_record()
        self.nivel = 1
        self.pistas_usadas = 0
        self.max_pistas = 3
        self.dificultad = "normal"
        
    # ─────────────────────────────────────────────────────────────────────────
    # GESTIÓN DE ARCHIVOS
    # ─────────────────────────────────────────────────────────────────────────
    def cargar_record(self) -> dict:
        """Carga el record desde un archivo JSON"""
        try:
            with open('record.json', 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {
                "mejor_puntuacion": 0,
                "partidas_ganadas": 0,
                "partidas_perdidas": 0,
                "total_intentos": 0,
                "mejor_tiempo": 0,
                "ultima_partida": None
            }
    
    def guardar_record(self):
        """Guarda el record en un archivo JSON"""
        self.record["ultima_partida"] = datetime.now().isoformat()
        try:
            with open('record.json', 'w') as f:
                json.dump(self.record, f, indent=2)
        except:
            pass
    
    # ─────────────────────────────────────────────────────────────────────────
    # UTILIDADES DE PANTALLA
    # ─────────────────────────────────────────────────────────────────────────
    def limpiar_pantalla(self):
        """Limpia la pantalla de la terminal"""
        os.system('cls' if os.name == 'nt' else 'clear')
    
    def pausa(self, mensaje: str = "Presiona Enter para continuar..."):
        """Pausa la ejecución hasta que el usuario presione Enter"""
        input(f"\n{Colors.CYAN}{mensaje}{Colors.END}")
    
    # ─────────────────────────────────────────────────────────────────────────
    # VISUALES - BANNER Y DECORACIONES
    # ─────────────────────────────────────────────────────────────────────────
    def mostrar_banner(self):
        """Muestra el banner del juego con arte ASCII"""
        banner = f"""
{Colors.CYAN}╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    {Colors.BOLD}{Colors.YELLOW}🔢  A D I V I N A   E L   N Ú M E R O  🔢{Colors.END}{Colors.CYAN}    ║
║                                                              ║
║    {Colors.GREEN}🎯 Adivina el número secreto entre           ║
║    {Colors.GREEN}   {self.minimo} y {self.maximo}{Colors.CYAN}                         ║
║                                                              ║
║    {Colors.WHITE}📊 Nivel: {self.nivel}  |  Dificultad: {self.dificultad.capitalize()}{Colors.CYAN}   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝{Colors.END}
"""
        print(banner)
    
    def mostrar_barra_progreso(self, actual: int, maximo: int, ancho: int = 30):
        """Muestra una barra de progreso visual"""
        porcentaje = (actual / maximo) * 100
        lleno = int((actual / maximo) * ancho)
        vacio = ancho - lleno
        
        color = Colors.GREEN if porcentaje < 50 else Colors.YELLOW if porcentaje < 75 else Colors.RED
        barra = f"{color}█{Colors.END}" * lleno + f"{Colors.WHITE}░{Colors.END}" * vacio
        
        return f"[{barra}] {actual}/{maximo}"
    
    # ─────────────────────────────────────────────────────────────────────────
    # ESTADÍSTICAS Y VISUALIZACIÓN
    # ─────────────────────────────────────────────────────────────────────────
    def mostrar_estadisticas(self):
        """Muestra estadísticas del juego"""
        tiempo = round(time.time() - self.tiempo_inicio)
        minutos = tiempo // 60
        segundos = tiempo % 60
        
        print(f"\n{Colors.BOLD}{Colors.CYAN}📊 ESTADÍSTICAS{Colors.END}")
        print(f"   🎯 Número secreto: {Colors.YELLOW}?{Colors.END}")
        print(f"   👆 Intentos: {Colors.BLUE}{self.intentos}{Colors.END}")
        print(f"   ⏱️ Tiempo: {Colors.CYAN}{minutos}m {segundos}s{Colors.END}")
        print(f"   🏅 Puntuación: {Colors.GREEN}{self.puntuacion}{Colors.END}")
        print(f"   📊 Rango: {self.minimo} - {self.maximo}")
        print(f"   💡 Pistas restantes: {Colors.MAGENTA}{self.max_pistas - self.pistas_usadas}{Colors.END}")
        
        # Barra de progreso de intentos
        progreso = self.mostrar_barra_progreso(self.intentos, self.intentos_maximos)
        print(f"   📈 Progreso: {progreso}")
        
        if self.historial:
            print(f"\n   📝 Últimos 5 intentos:")
            for i, (num, resultado) in enumerate(self.historial[-5:], 1):
                icono = "✅" if resultado == "correcto" else "⬆️" if resultado == "alto" else "⬇️"
                color = Colors.GREEN if resultado == "correcto" else Colors.YELLOW if resultado == "alto" else Colors.BLUE
                print(f"      {i}. {color}{num}{Colors.END} {icono}")
    
    def mostrar_historial_completo(self):
        """Muestra el historial completo de intentos"""
        if not self.historial:
            print(f"\n{Colors.YELLOW}📭 No hay intentos aún{Colors.END}")
            return
        
        print(f"\n{Colors.BOLD}{Colors.CYAN}📜 HISTORIAL COMPLETO{Colors.END}")
        print(f"{Colors.CYAN}{'─'*50}{Colors.END}")
        
        # Mostrar en columnas para mejor visualización
        columnas = 4
        for i in range(0, len(self.historial), columnas):
            linea = []
            for j in range(columnas):
                idx = i + j
                if idx < len(self.historial):
                    num, resultado = self.historial[idx]
                    if resultado == "correcto":
                        icono = f"{Colors.GREEN}✅{Colors.END}"
                    elif resultado == "alto":
                        icono = f"{Colors.YELLOW}⬆️{Colors.END}"
                    else:
                        icono = f"{Colors.BLUE}⬇️{Colors.END}"
                    linea.append(f"  {idx+1:2}. {num:3} {icono}")
                else:
                    linea.append("")
            print("   ".join(linea))
        
        print(f"{Colors.CYAN}{'─'*50}{Colors.END}")
    
    # ─────────────────────────────────────────────────────────────────────────
    # CONFIGURACIÓN
    # ─────────────────────────────────────────────────────────────────────────
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
                self.actualizar_dificultad()
                print(f"   {Colors.GREEN}✅ Rango actualizado: {self.minimo} - {self.maximo}{Colors.END}")
                print(f"   📊 Dificultad: {self.dificultad.capitalize()}")
                break
                
            except ValueError:
                print(f"   {Colors.RED}❌ Ingresa números válidos{Colors.END}")
    
    def actualizar_dificultad(self):
        """Actualiza la dificultad según el rango"""
        rango = self.maximo - self.minimo
        if rango <= 20:
            self.dificultad = "fácil"
            self.intentos_maximos = 15
        elif rango <= 50:
            self.dificultad = "normal"
            self.intentos_maximos = 20
        elif rango <= 100:
            self.dificultad = "difícil"
            self.intentos_maximos = 25
        else:
            self.dificultad = "experto"
            self.intentos_maximos = 30
    
    # ─────────────────────────────────────────────────────────────────────────
    # PISTAS
    # ─────────────────────────────────────────────────────────────────────────
    def dar_pista(self) -> Optional[str]:
        """Proporciona una pista sobre el número secreto"""
        if self.pistas_usadas >= self.max_pistas:
            return "⚠️ No te quedan pistas disponibles."
        
        self.pistas_usadas += 1
        rango = self.maximo - self.minimo
        mitad = rango // 2
        
        # Diferentes tipos de pistas según el número de pistas usadas
        if self.pistas_usadas == 1:
            # Pista 1: Par o impar
            tipo = "par" if self.numero_secreto % 2 == 0 else "impar"
            return f"🔍 El número es {tipo}."
        elif self.pistas_usadas == 2:
            # Pista 2: Rango reducido
            cuarto = rango // 4
            minimo = max(self.minimo, self.numero_secreto - cuarto)
            maximo = min(self.maximo, self.numero_secreto + cuarto)
            return f"🔍 El número está entre {minimo} y {maximo}."
        else:
            # Pista 3: Divisible por...
            divisores = [2, 3, 5, 7, 11]
            for d in divisores:
                if self.numero_secreto % d == 0 and self.numero_secreto != d:
                    return f"🔍 El número es divisible por {d}."
            return f"🔍 El número tiene {len(str(self.numero_secreto))} dígito(s)."
    
    # ─────────────────────────────────────────────────────────────────────────
    # CÁLCULO DE PUNTUACIÓN
    # ─────────────────────────────────────────────────────────────────────────
    def calcular_puntuacion(self, tiempo: int) -> int:
        """Calcula la puntuación basada en intentos, tiempo y dificultad"""
        base = 1000
        
        # Bonificación por pocos intentos
        if self.intentos <= 5:
            base += 500
        elif self.intentos <= 10:
            base += 200
        elif self.intentos <= 15:
            base += 100
        
        # Penalización por tiempo
        if tiempo > 60:
            base -= (tiempo - 60) * 2
        
        # Bonificación por dificultad
        dificultad_bonus = {
            "fácil": 1,
            "normal": 2,
            "difícil": 3,
            "experto": 4
        }
        base *= dificultad_bonus.get(self.dificultad, 1)
        
        # Penalización por pistas usadas
        base -= self.pistas_usadas * 50
        
        return max(0, base)
    
    # ─────────────────────────────────────────────────────────────────────────
    # NÚCLEO DEL JUEGO
    # ─────────────────────────────────────────────────────────────────────────
    def nuevo_juego(self):
        """Inicia un nuevo juego"""
        self.numero_secreto = random.randint(self.minimo, self.maximo)
        self.intentos = 0
        self.historial = []
        self.juego_terminado = False
        self.tiempo_inicio = time.time()
        self.pistas_usadas = 0
        self.puntuacion = 0
        
        self.limpiar_pantalla()
        self.mostrar_banner()
        print(f"\n{Colors.GREEN}🎯 ¡Nuevo juego iniciado!{Colors.END}")
        print(f"   El número secreto está entre {self.minimo} y {self.maximo}")
        print(f"   💡 Tienes {self.max_pistas} pistas disponibles (usa 'pista')")
        print(f"   🎯 Tienes {self.intentos_maximos} intentos")
        
        while not self.juego_terminado and self.intentos < self.intentos_maximos:
            self.mostrar_estadisticas()
            
            try:
                entrada = input(f"\n{Colors.GREEN}🔢 Tu número (o comando): {Colors.END}").strip()
                
                # ── Comandos especiales ──
                if entrada.lower() in ['salir', 'exit', 'quit', 'q']:
                    print(f"\n{Colors.YELLOW}👋 ¡Gracias por jugar!{Colors.END}")
                    sys.exit(0)
                
                if entrada.lower() in ['historial', 'history', 'h']:
                    self.mostrar_historial_completo()
                    self.pausa()
                    self.limpiar_pantalla()
                    self.mostrar_banner()
                    continue
                
                if entrada.lower() in ['configurar', 'config', 'c']:
                    self.configurar_rango()
                    self.nuevo_juego()
                    return
                
                if entrada.lower() in ['pista', 'p', 'help', '?']:
                    pista = self.dar_pista()
                    print(f"   {pista}")
                    continue
                
                if entrada.lower() in ['stats', 'estadisticas']:
                    self.mostrar_estadisticas()
                    continue
                
                # ── Intentar adivinar ──
                numero = int(entrada)
                
                if numero < self.minimo or numero > self.maximo:
                    print(f"   {Colors.RED}❌ El número debe estar entre {self.minimo} y {self.maximo}{Colors.END}")
                    continue
                
                self.intentos += 1
                
                if numero == self.numero_secreto:
                    self.historial.append((numero, "correcto"))
                    self.juego_terminado = True
                    self.finalizar_juego()
                    return
                elif numero < self.numero_secreto:
                    self.historial.append((numero, "bajo"))
                    print(f"   {Colors.BLUE}📈 ¡Más alto!{Colors.END}")
                else:
                    self.historial.append((numero, "alto"))
                    print(f"   {Colors.YELLOW}📉 ¡Más bajo!{Colors.END}")
                
            except ValueError:
                print(f"   {Colors.RED}❌ Ingresa un número válido o un comando (pista, historial, configurar, salir){Colors.END}")
            except KeyboardInterrupt:
                print(f"\n\n{Colors.YELLOW}👋 ¡Hasta luego!{Colors.END}")
                sys.exit(0)
        
        # Si se acaban los intentos
        if not self.juego_terminado:
            self.perder_juego()
    
    # ─────────────────────────────────────────────────────────────────────────
    # FINALIZACIÓN DEL JUEGO
    # ─────────────────────────────────────────────────────────────────────────
    def perder_juego(self):
        """Maneja la derrota del jugador"""
        self.limpiar_pantalla()
        self.mostrar_banner()
        
        print(f"\n{Colors.BOLD}{Colors.RED}💀 ¡OH NO! Has perdido{Colors.END}")
        print(f"\n{Colors.BOLD}📊 RESUMEN:{Colors.END}")
        print(f"   🎯 Número secreto: {Colors.YELLOW}{self.numero_secreto}{Colors.END}")
        print(f"   👆 Intentos: {Colors.BLUE}{self.intentos}{Colors.END}")
        print(f"   ⏱️ Tiempo: {Colors.CYAN}{round(time.time() - self.tiempo_inicio)} segundos{Colors.END}")
        
        self.record["partidas_perdidas"] += 1
        self.record["total_intentos"] += self.intentos
        self.guardar_record()
        
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
    
    def finalizar_juego(self):
        """Finaliza el juego y muestra los resultados"""
        tiempo_total = round(time.time() - self.tiempo_inicio)
        self.puntuacion = self.calcular_puntuacion(tiempo_total)
        
        self.limpiar_pantalla()
        self.mostrar_banner()
        
        # ── Mensaje de victoria ──
        print(f"\n{Colors.BOLD}{Colors.GREEN}🎉 ¡FELICIDADES! Has adivinado el número{Colors.END}")
        print(f"\n{Colors.BOLD}📊 RESUMEN:{Colors.END}")
        print(f"   🎯 Número secreto: {Colors.YELLOW}{self.numero_secreto}{Colors.END}")
        print(f"   👆 Intentos: {Colors.BLUE}{self.intentos}{Colors.END}")
        print(f"   ⏱️ Tiempo: {Colors.CYAN}{tiempo_total} segundos{Colors.END}")
        print(f"   🏅 Puntuación: {Colors.GREEN}{self.puntuacion}{Colors.END}")
        print(f"   💡 Pistas usadas: {Colors.MAGENTA}{self.pistas_usadas}{Colors.END}")
        
        # ── Mensaje según rendimiento ──
        if self.intentos <= 3:
            mensaje = "⭐ ¡INCREÍBLE! ¡Eres una máquina de adivinar!"
            color = Colors.GREEN
        elif self.intentos <= 5:
            mensaje = "🌟 ¡Excelente! Tienes un talento natural"
            color = Colors.GREEN
        elif self.intentos <= 8:
            mensaje = "👍 ¡Muy bien! Has hecho un gran trabajo"
            color = Colors.BLUE
        elif self.intentos <= 12:
            mensaje = "💪 Buen intento, sigue practicando"
            color = Colors.YELLOW
        else:
            mensaje = "🤔 No te rindas, la práctica hace al maestro"
            color = Colors.RED
        
        print(f"\n   {color}{mensaje}{Colors.END}")
        
        # ── Historial ──
        self.mostrar_historial_completo()
        
        # ── Actualizar récords ──
        self.record["partidas_ganadas"] += 1
        self.record["total_intentos"] += self.intentos
        
        if self.puntuacion > self.record["mejor_puntuacion"]:
            self.record["mejor_puntuacion"] = self.puntuacion
            print(f"\n{Colors.BOLD}{Colors.GREEN}🏆 ¡NUEVO RÉCORD DE PUNTUACIÓN! 🏆{Colors.END}")
        
        if self.record["mejor_tiempo"] == 0 or tiempo_total < self.record["mejor_tiempo"]:
            self.record["mejor_tiempo"] = tiempo_total
            print(f"{Colors.BOLD}{Colors.GREEN}⏱️ ¡NUEVO RÉCORD DE TIEMPO! ⏱️{Colors.END}")
        
        self.guardar_record()
        
        # ── Mostrar récords ──
        print(f"\n{Colors.BOLD}{Colors.CYAN}🏅 RÉCORDS:{Colors.END}")
        print(f"   Mejor puntuación: {Colors.GREEN}{self.record['mejor_puntuacion']}{Colors.END}")
        print(f"   Mejor tiempo: {Colors.CYAN}{self.record['mejor_tiempo']}s{Colors.END}")
        print(f"   Partidas ganadas: {Colors.GREEN}{self.record['partidas_ganadas']}{Colors.END}")
        print(f"   Partidas perdidas: {Colors.RED}{self.record['partidas_perdidas']}{Colors.END}")
        
        # ── Opciones ──
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
                print(f"   📊 Estadísticas totales:")
                print(f"      Partidas ganadas: {Colors.GREEN}{self.record['partidas_ganadas']}{Colors.END}")
                print(f"      Partidas perdidas: {Colors.RED}{self.record['partidas_perdidas']}{Colors.END}")
                print(f"      Total intentos: {Colors.BLUE}{self.record['total_intentos']}{Colors.END}")
                sys.exit(0)
            else:
                print(f"   {Colors.RED}❌ Opción no válida{Colors.END}")


# ─────────────────────────────────────────────────────────────────────────────
# EJECUTAR JUEGO
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    try:
        juego = AdivinaNumero()
        juego.nuevo_juego()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}👋 ¡Hasta luego!{Colors.END}")
        sys.exit(0)
    except Exception as e:
        print(f"\n{Colors.RED}❌ Error inesperado: {e}{Colors.END}")
        sys.exit(1)
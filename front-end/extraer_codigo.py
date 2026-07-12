import os
from pathlib import Path

def extraer_proyecto_angular(ruta_proyecto, archivo_salida):
    # Extensiones de código fuente y configuración que queremos extraer
    extensiones_permitidas = {'.ts', '.js', '.html', '.css'}
    
    # Carpetas que queremos ignorar completamente (para no hacer el txt gigante e inútil)
    carpetas_a_ignorar = {'node_modules', 'dist', '.git', '.angular', '.vscode', 'coverage','calculadora','tabla-datos'}

    ruta = Path(ruta_proyecto)
    
    if not ruta.exists():
        print(f"Error: La ruta '{ruta_proyecto}' no existe.")
        return

    print(f"Iniciando extracción del proyecto en: {ruta_proyecto}")
    
    with open(archivo_salida, 'w', encoding='utf-8') as f_out:
        # Escribimos una cabecera bonita en el archivo
        f_out.write("=" * 80 + "\n")
        f_out.write("EXTRACCIÓN COMPLETA DEL PROYECTO ANGULAR\n")
        f_out.write("=" * 80 + "\n\n")

        # rglob recorre todas las carpetas y subcarpetas recursivamente
        contador_archivos = 0
        for archivo in ruta.rglob('*'):
            # Si no es un archivo, lo saltamos
            if not archivo.is_file():
                continue

            # Comprobamos si está dentro de una carpeta ignorada
            partes_ruta = archivo.parts
            ignorar = False
            for parte in partes_ruta:
                if parte in carpetas_a_ignorar:
                    ignorar = True
                    break
            
            if ignorar:
                continue

            # Comprobamos si la extensión es de nuestro interés
            if archivo.suffix.lower() in extensiones_permitidas:
                contador_archivos += 1
                ruta_relativa = archivo.relative_to(ruta)
                
                print(f"Extrayendo: {ruta_relativa}")

                # Escribimos la ruta como separador claro
                f_out.write("/" * 80 + "\n")
                f_out.write(f"ARCHIVO: {ruta_relativa}\n")
                f_out.write("/" * 80 + "\n\n")

                # Leemos y escribimos el contenido del archivo
                try:
                    contenido = archivo.read_text(encoding='utf-8')
                    f_out.write(contenido)
                except Exception as e:
                    f_out.write(f"[Error al leer el archivo: {e}]\n")
                
                # Dejamos espacios entre archivos para legibilidad
                f_out.write("\n\n" * 2)

        # Resumen al final del txt
        f_out.write("=" * 80 + "\n")
        f_out.write(f"EXTRACCIÓN FINALIZADA - Total de archivos procesados: {contador_archivos}\n")
        f_out.write("=" * 80 + "\n")

    print(f"\n¡Extracción completada!\nSe han procesado {contador_archivos} archivos.")
    print(f"El resultado se ha guardado en: '{archivo_salida}'")

# ==========================================
# EJECUCIÓN DEL SCRIPT
# ==========================================
if __name__ == "__main__":
    # 1. Pon aquí la ruta de tu proyecto Angular (puede ser relativa o absoluta)
    # Ejemplo relativo: "./mi-proyecto-angular"
    # Ejemplo absoluto: "C:/Users/TuUsuario/Documents/mi-proyecto-angular"
    RUTA_DEL_PROYECTO = "/Users/edi/Documents/Trabajo/tutorial angular" 
    
    # 2. Nombre del archivo de texto que se va a generar
    ARCHIVO_DE_SALIDA = "codigo_angular_completo.txt"

    extraer_proyecto_angular(RUTA_DEL_PROYECTO, ARCHIVO_DE_SALIDA)
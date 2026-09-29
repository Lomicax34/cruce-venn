# El servidor usa solo la biblioteca estándar de Python; no hay que instalar paquetes.
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser


# Los archivos de la web están en app/; esa carpeta es la que se sirve al navegador.
APP_DIR = Path(__file__).resolve().parent / "app"


def main():
	# El servidor solo acepta conexiones de este equipo y publica app/ como sitio web.
	handler = partial(SimpleHTTPRequestHandler, directory=str(APP_DIR))
	# Windows elige un puerto disponible para evitar conflictos con otras aplicaciones.
	server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
	address, port = server.server_address
	url = f"http://{address}:{port}/index.html"
	print(f"Cruce está listo en {url}")
	print("Deja esta ventana abierta mientras usas la aplicación.")
	print("Para cerrar la aplicación, cierra esta ventana.")
	webbrowser.open(url)
	try:
		# Mantiene el servidor activo hasta que se cierra la ventana de la terminal.
		server.serve_forever()
	except KeyboardInterrupt:
		pass
	finally:
		server.server_close()


if __name__ == "__main__":
	main()

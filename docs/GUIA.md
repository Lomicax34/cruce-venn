# Cruce: encuesta y diagrama de Venn

## Estructura del proyecto

- `Start.py`: inicia un servidor web local sin instalar paquetes.
- `app/index.html`: estructura de la página y controles.
- `app/css/styles.css`: colores, distribución y adaptación a móviles.
- `app/js/app.js`: lectura CSV, actualización periódica y cálculo de regiones.
- `app/js/config.js`: enlace de Google Forms, hoja de respuestas, pestaña y columnas de la encuesta.
- `docs/GUIA.md`: instrucciones de configuración y presentación.

## Iniciar la aplicación

1. Instala Python 3 si el equipo todavía no lo tiene.
2. Haz doble clic en `Start.py` y deja abierta la ventana que aparece.
3. La página abrirá directamente la encuesta configurada. No necesita Node ni paquetes adicionales.

## Encuesta configurada

Los enlaces y encabezados recibidos están en `app/js/config.js`. La página los carga automáticamente; no incluye campos para cambiar la fuente, importar archivos ni editar columnas. La hoja se lee desde su pestaña de respuestas (`gid=134010556`). El botón **Responder encuesta** abre el formulario de Google.

La hoja se consulta al abrir la página y cada 15 segundos. Cruce conserva en la sesión del navegador la última lectura válida para que un refresco no vacíe el diagrama mientras carga la actualización.

El formulario exige iniciar sesión con una cuenta Google; la identidad no se muestra en la página. La app solo lee la hoja y no recibe contraseñas ni escribe respuestas.

Las siete combinaciones con al menos un deporte aparecen dentro de los círculos. Quienes respondan «No» a las tres preguntas se cuentan como **Ninguno**, fuera de los círculos. El total de respuestas también los incluye.

## Compartir con el grupo

`Start.py` sirve la app solo en el mismo equipo. Para que tenga un enlace público desde otros dispositivos, el repositorio incluye un flujo que publica automáticamente la carpeta `app/` en GitHub Pages.

1. Inicia sesión en GitHub y crea un repositorio **público** llamado `cruce-venn`.
2. Instala GitHub Desktop e inicia sesión. Agrega la carpeta de este proyecto como repositorio local y publícala en GitHub con la rama `main`.
3. En el repositorio, abre **Settings → Pages** y selecciona **GitHub Actions** como origen de publicación.
4. En la pestaña **Actions**, espera a que termine el flujo **Publicar Cruce en GitHub Pages**. La dirección será `https://TU-USUARIO.github.io/cruce-venn/`.

Las siguientes publicaciones de la rama `main` actualizarán esa misma dirección. El enlace permanece disponible mientras el repositorio y GitHub Pages sigan activos; ningún hosting puede prometer disponibilidad ininterrumpida.

La hoja permite acceso de lectura a cualquiera que tenga el enlace; Cruce descarga la pestaña de respuestas como CSV usando el `gid` fijado en el código. Poner el enlace en `config.js` evita errores de configuración en la interfaz, pero no lo vuelve privado: un sitio estático muestra su código a todos. No incluyas nombres, correos ni otra información sensible en esa hoja.

Google puede tardar en publicar una respuesta nueva, así que la actualización es periódica y casi en tiempo real, no instantánea.

## Para exponer

Un conjunto representa a las personas que respondieron «Sí» a una pregunta. Las siete regiones cuentan las respuestas exclusivas: cada persona aparece en una sola región, incluida la intersección de los tres conjuntos. La aplicación lee las respuestas de la hoja y vuelve a calcular los conteos automáticamente.

Se puede explicar así: **Google Forms recoge las respuestas → Google Sheets las organiza → Cruce lee la hoja como CSV → el diagrama recalcula las siete regiones.** Los datos se procesan en el navegador.

La página se creó con ayuda de IA. `Start.py` inicia el servidor local; el HTML define la estructura, CSS su apariencia, `config.js` indica los enlaces y columnas, y `app.js` carga respuestas y calcula las regiones. Google Sheets funciona como base de datos en la nube; la app no guarda una copia editable ni administra cuentas.
# EMPIEZA AQUÍ

Tu sitio web ya está hecho y funciona. Falta ponerlo en internet.

Son **2 pasos**. Hazlos en orden.

No necesitas instalar Git ni usar la ventana negra: todo se hace desde el
navegador.

Si en algún momento algo no sale como dice aquí, **detente** y anota en qué
número de paso te quedaste. Es más fácil arreglarlo así.

---

## Antes de empezar

Descomprime el ZIP en esta ruta exacta:

```
C:\proyectos\sitio-lma
```

Para hacerlo: clic derecho en el ZIP → "Extraer todo..." → en la casilla de
destino borra lo que diga y escribe `C:\proyectos\sitio-lma` → Extraer.

**Por qué esa ruta:** las herramientas que vas a usar fallan con carpetas que
tengan espacios o acentos. `Escritorio\Mi página web` da problemas.
`C:\proyectos\sitio-lma` no.

---

# PASO 1 — Ver tu sitio funcionando (20 minutos)

## 1.1 Instala el editor

Ve a **code.visualstudio.com** y descarga Visual Studio Code.
Instálalo dándole siguiente a todo.

Es gratis y es donde vas a abrir tu proyecto.

## 1.2 Abre tu carpeta

Abre Visual Studio Code.

Arriba a la izquierda: **File** → **Open Folder...**
Busca y selecciona `C:\proyectos\sitio-lma` → **Seleccionar carpeta**.

Si aparece una ventana preguntando *"Do you trust the authors..."*,
haz clic en **Yes, I trust the authors**.

Del lado izquierdo verás la lista de tus archivos.

## 1.3 Instala Live Server

En la barra de iconos del lado izquierdo (la vertical, pegada al borde),
busca el icono que parece **cuatro cuadritos**. Haz clic.

Se abre un buscador. Escribe:

```
Live Server
```

Aparece una lista. El primero debe decir **Live Server** y abajo
*Ritwick Dey*. Haz clic en el botón azul **Install**.

Espera a que termine.

## 1.4 Enciende el sitio

Vuelve a la lista de archivos: en esa misma barra izquierda, haz clic en el
icono de hasta arriba, que parece **dos hojas de papel**.

Busca el archivo **`index.html`**.

Haz **clic derecho** sobre él → **Open with Live Server**.

Tu navegador se abre solo.

## 1.5 Comprueba que funciona

Debes ver tu sitio completo, igual al que diseñaste.

**Haz esta prueba:** baja hasta donde dice "Portafolio de Proyectos".
Verás unos botones: Todos, Robótica, Metrología, Manufactura Aditiva,
Automatización.

Haz clic en **Metrología**. Deben quedar solo 1 tarjeta.
Haz clic en **Todos**. Vuelven las 4.

**Si eso pasa, tu sitio funciona.** Sigue al paso 2.

**Si la galería sale vacía** con un mensaje gris: mira la dirección arriba en
tu navegador. Si empieza con `file:///`, no usaste Live Server. Cierra esa
pestaña y repite el 1.4.

---

## 1.6 Cómo ver la versión móvil

Tu sitio es **una sola página** que se acomoda sola al tamaño de la pantalla.
No hay dos versiones que mantener.

Para verla en la computadora, con el sitio abierto en Chrome:

1. Presiona **F12** (se abre un panel de desarrollador)
2. Presiona **Ctrl + Shift + M** (activa la vista de celular)
3. Arriba puedes elegir el modelo de teléfono

Presiona **F12** otra vez para salir.

En esa vista, el menú de arriba se convierte en un botón de tres rayas.
Tócalo y se despliega la lista de secciones.

---

# PASO 2 — Publicar tu sitio (25 minutos)

> **Abre el archivo `PUBLICAR-DESDE-GITHUB.html`** con doble clic.
> Ahí está todo explicado con dibujos de cada pantalla.

Resumen de lo que vas a hacer, **todo desde el navegador**, sin instalar nada
y sin usar la ventana negra:

1. Crear cuenta en **github.com**
2. Crear un repositorio llamado `sitio-lma`, sin marcar ninguna casilla
3. Clic en **"uploading an existing file"** y **arrastrar el contenido** de tu
   carpeta (no la carpeta, el contenido)
4. Crear cuenta en **dash.cloudflare.com** y conectarla a ese repositorio
5. Configurar: Framework preset **None**, build command **vacío**,
   output directory **`/`**

Resultado: `https://sitio-lma.pages.dev`, gratis y con candado de seguridad.

**Ya no necesitas** instalar Git, generar una llave de acceso, ni escribir
comandos en la ventana negra.

---

# Cómo agregar proyectos al portafolio

Ya que tu sitio esté publicado, así lo actualizas. **Puedes hacerlo desde el
celular**, no necesitas la computadora.

## Opción fácil: desde github.com

**Primero sube la foto:**

1. Entra a github.com, a tu repositorio `sitio-lma`
2. Clic en la carpeta **`img`**, luego en **`portafolio`**
3. Botón **Add file** → **Upload files**
4. Arrastra tu foto
5. Abajo: botón verde **Commit changes**

**Luego registra el proyecto:**

1. Regresa al inicio (clic en `sitio-lma` arriba)
2. Clic en la carpeta **`data`**, luego en el archivo **`proyectos.json`**
3. Clic en el **icono del lápiz** (arriba a la derecha)
4. Copia este bloque y pégalo después del primer `[`:

```
  {
    "id": "PROJ-905",
    "titulo": "Nombre de tu proyecto",
    "categoria": "Ingeniería Inversa",
    "imagen": "/img/portafolio/nombre-de-tu-foto.webp",
    "descripcion": "Qué problema resolviste y qué resultado dio.",
    "cliente": "Nombre del cliente o sector",
    "fecha": "2026-08",
    "estado": "Completado",
    "destacado": false
  },
```

5. Cambia los textos por los tuyos
6. Abajo: **Commit changes** → **Commit changes** otra vez

Espera un minuto y recarga tu sitio. Ya aparece.

## Las tres reglas que no puedes romper

**1. La coma.** Cada bloque termina con coma, menos el último de todos.
Si te equivocas, la galería sale vacía.

**2. Valida antes de guardar.** Copia todo el contenido del archivo, pégalo
en **jsonlint.com**, dale a **Validate JSON**. Si sale verde, guarda. Si sale
rojo, te dice en qué renglón está el error.

**3. Comprime las fotos.** Ve a **squoosh.app**, arrastra tu foto, elige
**WebP** del lado derecho, y bájale la calidad hasta que pese entre 200 y
400 KB. Descárgala y esa sube.

Una foto del celular pesa 5 MB. Si subes diez sin comprimir, tu sitio tarda
20 segundos en abrir y la gente se va.

**Los nombres de archivo**, todo en minúsculas y sin espacios ni acentos:
`buje-driveline.webp` sí, `Buje Driveline.WEBP` no.

---

# Entrar al panel de administración

## Dónde está el botón

Baja hasta el **pie de página** de tu sitio, donde dice
"© 2024 Laboratorio de Manufactura Aditiva".

Junto a ese texto hay un **candado gris muy tenue**. Casi no se nota, y así
debe ser. Pasa el cursor encima y se oscurece.

Haz clic en el candado. Te pide la contraseña:

```
Blackout2077
```

Escríbela y presiona Entrar. Te lleva al panel.

Mientras no cierres el navegador, no te la vuelve a pedir. Si lo cierras y
vuelves, sí.

## Si prefieres ir directo

Escribe la dirección a mano. En Live Server sería:

```
http://127.0.0.1:5500/admin.html
```

Y ya publicado:

```
https://sitio-lma.pages.dev/admin.html
```

También ahí te pide la contraseña antes de mostrar nada.

## Para cambiar la contraseña

Está explicado dentro del archivo `js/acceso.js`, hasta arriba. Si lo
necesitas y no te queda claro, pídemelo.

## Qué tan segura es

Poco. Es un candado de puerta de cristal: detiene a un curioso, no a alguien
con conocimientos técnicos, porque cualquiera puede ver el código de una
página web.

**Tu protección real es otra:** aunque alguien entre al panel, solo estaría
editando una copia en su propio navegador. No puede tocar tu sitio publicado
mientras no tenga tu llave de GitHub, que solo está guardada en tu
computadora.

Por eso la contraseña alcanza para lo que necesitas.

---

# Usar el panel de administración

## Cómo funciona

1. Clic en **+ NUEVO PROYECTO**
2. Clic en el recuadro punteado → elige tu foto
3. Llena título, categoría, estado y descripción
4. Clic en **GUARDAR DATOS**

**Puedes elegir varias fotos de una vez.** Aparecen como miniaturas debajo.
La primera es la portada (la que se ve en la tarjeta del portafolio). Para
cambiarla, haz clic en otra miniatura. La X roja quita una.

**No comprimas nada.** El panel lo hace solo: las fotos se reducen a 1600
píxeles y se convierten a WebP. Una foto de 5 MB del celular queda en unos
250 KB. Te avisa cuánto pesaba y cuánto quedó.

## Subir un video

Elige el archivo igual que una foto. El panel lo convierte automáticamente a
formato ligero: un clip de 10 segundos que pesaba 40 MB queda en unos 600 KB.

**Máximo 3 minutos.**

La calidad se ajusta sola según la duración, para que el archivo quepa:

| Duración | Resolución | Peso final aprox. |
|---|---|---|
| Hasta 20 s | 960 px | 2 MB |
| Hasta 45 s | 854 px | 4 MB |
| Hasta 1:30 | 768 px | 7 MB |
| Hasta 3:00 | 640 px | 13 MB |

**Tres cosas que debes saber:**

- **La conversión tarda lo que dura el clip.** Un video de 1:30 tarda minuto y
  medio. Verás el porcentaje y los segundos que faltan.
- **Deja la pestaña abierta y a la vista** mientras convierte. Si te cambias a
  otra ventana, algunos navegadores frenan el proceso. Hay una red de
  seguridad, pero la conversión sale mejor si la dejas trabajar.
- **Se quita el audio.** En un portafolio no aporta y pesa.

Para cancelar a medias, cierra la ventana del formulario.

**Por qué baja la resolución en videos largos.** Cloudflare rechaza archivos
de más de 25 MB. Un video de 3 minutos a buena calidad pesaría 27 MB y no
subiría. Bajando a 640 píxeles queda en 13 MB y sí cabe. En una tarjeta de
portafolio la diferencia casi no se nota.

**Si tu video dura más de 3 minutos**, recórtalo antes. En un portafolio, un
clip de 30 segundos mostrando la pieza suele funcionar mejor que uno largo:
casi nadie ve un video completo en un sitio web.

Puedes subir varios videos en el mismo proyecto. Se conservan todos y aparecen en el visor junto con las fotos, en el orden en que los agregaste.

**Los GIF no sirven.** Aunque parezca lo contrario, un GIF pesa entre 15 y 30
veces más que el mismo video en MP4. El panel los rechaza y te sugiere subir
el MP4. Si solo tienes el GIF, conviértelo en un sitio como cloudconvert.com
y sube el resultado.

## Cómo lo ve el visitante

La tarjeta del portafolio muestra la portada, con un distintivo en la esquina
indicando cuántos medios hay. Al hacer clic se abre un visor a pantalla
completa con todas las fotos y el video, con flechas para pasarlos.

En el celular se pasan deslizando el dedo. Con teclado, las flechas y Escape.

## Dos formas de que el cambio llegue a tu sitio

**Modo borrador** (viene activo). Los cambios se quedan en el navegador.
Al terminar: clic abajo a la izquierda en **Admin / System Ops** →
**DESCARGAR proyectos.json**. Ese archivo y las fotos que se descargan solas
los subes a github.com.

**Modo GitHub** (recomendado). Das Guardar y ya. El panel sube la foto y
actualiza el portafolio automáticamente; tu sitio se refresca en un minuto.

> **Para activar el modo GitHub, abre el archivo
> `PUBLICAR-DESDE-EL-PANEL.html`** con doble clic. Tiene los dibujos de cada
> pantalla. Son unos 15 minutos, una sola vez.

## Editar o borrar

Cada tarjeta tiene un lápiz y un bote de basura. Funcionan igual que el
guardado: en modo GitHub publican solos.

**Borrar un proyecto no borra sus fotos ni su video.** Solo lo quita del
portafolio; los archivos siguen guardados en el repositorio. Para eso está la
limpieza que viene abajo.

## Limpiar archivos sin uso

Con el tiempo se acumulan fotos y videos de proyectos que borraste o de
imágenes que reemplazaste. Ocupan espacio sin que nadie los vea.

1. En el panel, clic en **Admin / System Ops**
2. Botón **BUSCAR ARCHIVOS SIN USO**
3. Te muestra la lista con el peso de cada uno y el total
4. Botón rojo **ELIMINAR ESTOS N**, y confirmas

**Nunca toca un archivo que algún proyecto esté usando.** Antes de borrar
compara contra todo el portafolio: portadas, galerías, videos y sus pósters.

Requiere el modo GitHub activo, porque necesita escribir en el repositorio.

**Un matiz importante:** esto reduce lo que se publica en tu sitio y mantiene
la carpeta ordenada, pero **no recupera el espacio del historial de Git**. Ahí
queda todo guardado para siempre — que es lo mismo que te permite deshacer
cualquier cambio. Si algún día llegas al límite de GitHub, la solución es
crear un repositorio nuevo sin historial; son diez minutos.

---

# Cómo subir cualquier cambio

Todo desde **github.com**. Cloudflare detecta el cambio solo y republica en
un minuto. Nunca vuelves a entrar a Cloudflare.

**Para cambiar un archivo:** navega hasta él en tu repositorio, clic en el
**icono del lápiz**, edita, y abajo **Commit changes**.

**Para subir archivos nuevos:** entra a la carpeta donde van, botón
**Add file** → **Upload files**, arrastra, y **Commit changes**.

---

# OPCIONAL — Rescatar tus fotos

**Hazlo cuando ya tengas el sitio publicado.** No es urgente, pero tampoco lo
dejes para dentro de un año.

## Por qué conviene

Tus fotos no están dentro de tu carpeta. Son enlaces prestados a servidores
de Google, donde Stitch las dejó cuando diseñaste.

Google puede borrarlas cuando quiera. Si eso pasa, tu sitio se queda sin
fotos y no hay manera de recuperarlas.

Este paso las trae a tu computadora.

## Necesitas Python (esta es la única parte con terminal)

Abre el Explorador de Windows en `C:\proyectos\sitio-lma`.

Haz clic en la **barra de direcciones** de arriba (donde dice la ruta).
Bórrala, escribe `cmd` y presiona Enter.

Se abre una ventana negra. Escribe esto y Enter:

```
python --version
```

- Si responde algo como `Python 3.12.1` → sigue al 2.3
- Si dice que no reconoce el comando → ve a **python.org**, descarga Python,
  y durante la instalación **marca la casilla que dice "Add Python to PATH"**.
  Es importante. Luego repite este paso.

## Descarga las fotos

Asegúrate de tener internet.

En esa misma ventana negra, escribe y Enter:

```
python herramientas\descargar-imagenes.py
```

Verás una lista de descargas. Al final dirá "Listo".

## Comprueba

Regresa a tu navegador y recarga el sitio (tecla F5).

**Debe verse exactamente igual que antes.** Si es así, ya está.
Tus fotos ahora viven en tu carpeta y no dependen de nadie.

Ahora súbelas a GitHub: entra a tu repositorio, **Add file → Upload files**,
arrastra la carpeta `img` completa y confirma. También sube el
`data/proyectos.json` y los `.html` que el script modificó.

## Si prefieres no usar la terminal

Se puede a mano, aunque es tedioso: abre tu sitio, **clic derecho sobre cada
imagen → Guardar imagen como**, súbelas a `img/portafolio` desde github.com, y
corrige las rutas en `data/proyectos.json`. Son unas trece imágenes.

---

---

# Si algo sale mal

### La galería sale vacía

Mira la dirección en tu navegador. ¿Empieza con `file:///`?
Entonces no usaste Live Server. Repite el paso 1.4.

Si empieza con `http://`, entonces el archivo `proyectos.json` tiene un error.
Valídalo en jsonlint.com. Casi siempre es una coma.

### Las fotos no aparecen

El nombre del archivo y lo que escribiste en `proyectos.json` no coinciden.
Revisa letra por letra, incluyendo mayúsculas y la terminación
(`.webp` no es lo mismo que `.jpg`).

### Cambié algo pero se ve igual

Presiona **Ctrl + Shift + R** en el navegador. Eso recarga todo de nuevo.

### Rompí algo y no sé qué

Nada se pierde. En github.com, entra a tu repositorio y haz clic en
**Commits** (arriba, junto al reloj). Ahí está el historial completo de
cambios y puedes ver cómo estaba cada archivo antes.

### El sitio publicado muestra una carpeta en vez del sitio

Arrastraste la carpeta `sitio-lma` en vez de su contenido. Entra a tu
repositorio: si en la lista principal ves una sola carpeta llamada
`sitio-lma`, ese es el problema. Bórrala (entra, tres puntos, Delete) y
vuelve a subir el contenido.

### Cloudflare dice Success pero el sitio sale en blanco

La casilla **Build output directory** quedó mal. Tiene que ser una sola
diagonal: `/`

Para arreglarlo: en Cloudflare, entra a tu proyecto → **Settings** →
**Builds & deployments** → **Configure Production deployments** → corrige →
guarda → **Retry deployment**.

---

*El archivo `DETALLES-TECNICOS.md` tiene la explicación de cómo está armado
todo por dentro. No lo necesitas para usar tu sitio.*

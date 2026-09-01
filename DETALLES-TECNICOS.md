# Sitio LMA — tus archivos de Stitch, ahora funcionales

> **Verificación automática.** Corre `node herramientas/pruebas.js` en la
> terminal para comprobar que todo sigue funcionando después de cualquier
> cambio. Debe terminar con "TODAS LAS PRUEBAS PASARON".

## Qué se hizo aquí

**Se conservaron tus archivos originales de Stitch tal cual.** No se
reescribió el diseño, no se quitó ninguna sección y no se cambió ni un color.

El único cambio es en la sección "Portafolio de Proyectos" de dos páginas:
donde antes había cuatro tarjetas escritas a mano en el HTML, ahora hay un
contenedor vacío que se llena solo leyendo `data/proyectos.json`.

Las tarjetas que genera el JavaScript usan **exactamente las mismas clases
de Tailwind** que escribió Stitch. Visualmente son idénticas.

## Los archivos

| Archivo | Origen | Estado |
|---|---|---|
| `index.html` | `lma_industrial_portafolio_din_mico` | Portafolio dinámico |
| `admin.html` | `panel_de_administraci_n...` | **Intacto** |
| `movil-admin.html` | `lma_industrial_panel_admin_m_vil` | **Intacto** |
| `DESIGN.md` | `precision_engineering_interface` | **Intacto** |
| `referencia-diseno/` | las 5 capturas de Stitch | Para comparar |

Agregados:

| Archivo | Para qué |
|---|---|
| `js/portafolio.js` | Genera las tarjetas desde el JSON |
| `data/proyectos.json` | Tus proyectos, con los 4 originales cargados |
| `img/portafolio/` | Donde van tus fotos |
| `herramientas/descargar-imagenes.py` | Rescata las imágenes de Stitch |
| `admin-cms/` | Panel opcional (ver más abajo) |

## Compara tú mismo

Abre `referencia-diseno/lma_industrial_portafolio_din_mico.png` junto al
sitio corriendo. Debe verse igual. Si algo no coincide, dímelo y lo corrijo.

---

## Cómo verlo

**No abras el HTML con doble clic** — la galería saldrá vacía. El navegador
bloquea la lectura de archivos JSON cuando la dirección empieza con `file:///`.

Usa una de estas dos:

**Con VS Code:** instala la extensión *Live Server* (icono de cuatro cuadritos
en la barra izquierda → buscar "Live Server" → Install). Luego clic derecho en
`index.html` → **Open with Live Server**.

**Con terminal:** abre el Explorador en la carpeta, escribe `cmd` en la barra
de direcciones y Enter. Después:

```
python -m http.server 8000
```

Y ve a `http://localhost:8000` en tu navegador.

---

## Primero que nada: rescatar las imágenes

Tus fotos **no están en el proyecto**. Son enlaces prestados a servidores de
Google donde Stitch las dejó. Si Google las borra, el sitio se queda sin
imágenes y no hay forma de recuperarlas.

Con internet conectado, una sola vez:

```
python herramientas\descargar-imagenes.py
```

Recorre todos los `.html` y el JSON, descarga cada imagen a `img/` y corrige
las rutas. Después de esto el sitio ya no depende de nadie.

---

## Agregar un proyecto

Edita `data/proyectos.json`. Cada proyecto es un bloque así:

```json
{
  "id": "PROJ-905",
  "titulo": "Buje de sustitución para línea driveline",
  "categoria": "Ingeniería Inversa",
  "imagen": "/img/portafolio/buje-driveline.webp",
  "descripcion": "Componente descontinuado reconstruido a partir de la pieza original.",
  "cliente": "Proveedor Tier 1",
  "fecha": "2026-08",
  "destacado": false
}
```

**Reglas:**
- Los bloques van separados por coma. **El último no lleva coma.**
- `fecha` en formato `AAAA-MM`. Ordena la galería, más reciente primero.
- `categoria` genera los botones de filtro sola. Cuida acentos y mayúsculas:
  "Robótica" y "Robotica" cuentan como dos categorías distintas.
- Valida el archivo en **jsonlint.com** antes de guardar. Un JSON mal formado
  deja la galería vacía.
- Comprime las fotos a WebP de 200–400 KB en **squoosh.app** antes de subirlas.
- Nombres de archivo en minúsculas, sin espacios ni acentos.

### Desde el celular, sin computadora

1. En github.com, entra a `img/portafolio/` → **Add file → Upload files** →
   sube la foto → **Commit changes**
2. Abre `data/proyectos.json` → icono del lápiz → agrega el bloque →
   **Commit changes**
3. En ~1 minuto el sitio está actualizado

---

## Publicar

### 1. Instalar Git

De **git-scm.com** → Download for Windows → siguiente a todo.
Verifica con `git --version` en una terminal.

Preséntate una sola vez:
```
git config --global user.name "Imer Moreno"
git config --global user.email "immer88@outlook.com"
```

### 2. Crear el repositorio en GitHub

En github.com → **+** arriba a la derecha → **New repository** →
nombre `sitio-lma` → **NO marques ninguna casilla de inicialización** →
**Create repository**.

### 3. Generar tu token

GitHub ya no acepta tu contraseña desde la terminal.

Foto de perfil → **Settings** → hasta abajo **Developer settings** →
**Personal access tokens** → **Tokens (classic)** → **Generate new token
(classic)** → marca la casilla **`repo`** → **Generate token**.

**Cópialo ahora mismo.** Empieza con `ghp_` y solo se muestra una vez.

### 4. Subir

Terminal dentro de la carpeta del proyecto:

```
git init
git add .
git commit -m "Sitio Stitch con portafolio dinamico"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/sitio-lma.git
git push -u origin main
```

Cuando pida contraseña, **pega el token**. No vas a ver nada en pantalla
mientras pegas — es normal.

### 5. Cloudflare Pages

1. **dash.cloudflare.com** → crea cuenta (no pide tarjeta)
2. **Workers & Pages** → **Create** → pestaña **Pages** → **Connect to Git**
3. Autoriza y selecciona `sitio-lma`
4. Configuración:
   - Framework preset: **None**
   - Build command: **vacío**
   - Build output directory: **`/`**
5. **Save and Deploy**

En 1-2 minutos tienes `sitio-lma.pages.dev` con HTTPS.

### Actualizar después

Ya no vuelves a entrar a Cloudflare. Solo:

```
git add .
git commit -m "que cambie"
git push
```

---

## El panel de administración (`admin.html`)

**Tu diseño de Stitch, ahora funcional.** No se cambió ni un color: se le
pusieron identificadores internos a los elementos que ya existían y se
conectaron a `data/proyectos.json`.

### Qué hace ahora

| Elemento de tu diseño | Qué hace |
|---|---|
| Botón "+ Nuevo Proyecto" | Abre tu modal, vacío |
| Zona de arrastrar imagen | Acepta archivo, muestra vista previa, rechaza >5 MB |
| "Guardar datos" | Registra el proyecto |
| Lápiz de cada tarjeta | Abre el modal con los datos cargados |
| Bote de basura | Elimina, con confirmación |
| Tarjetas del grid | Se generan desde el JSON |
| TOTAL / EN PROCESO / COMPLETADOS | Cuentan de verdad |
| Flechas de paginación | Funcionan, 9 proyectos por página |
| Bloque "Admin / System Ops" | Abre la configuración de guardado |

### Dos modos de guardado

Como el sitio no tiene servidor, hay dos formas de que los cambios lleguen
a internet. Se eligen en **"Admin / System Ops"**, abajo en la barra lateral.

**MODO BORRADOR (viene activo por defecto)**

Los cambios viven en el navegador. Cuando termines:
1. Clic en "Admin / System Ops" → **DESCARGAR proyectos.json**
2. Reemplaza `data/proyectos.json` con el archivo descargado
3. Las imágenes también se descargan solas: cópialas a `img/portafolio/`
4. `git add . && git commit -m "nuevos proyectos" && git push`

Cero configuración, cero riesgo. Empieza por aquí.

**MODO GITHUB (opcional)**

Publica directo: sube la imagen y actualiza el JSON en un solo clic.

Para activarlo necesitas un token. Usa uno **fine-grained**, que es más
seguro que el clásico porque se limita a un solo repositorio:

1. En GitHub: foto de perfil → Settings → Developer settings →
   **Personal access tokens** → **Fine-grained tokens** → Generate new token
2. **Repository access:** Only select repositories → elige `sitio-lma`
3. **Permissions** → Repository permissions → **Contents: Read and write**
4. Generate token y cópialo
5. En el panel: "Admin / System Ops" → escribe `tu-usuario/sitio-lma` y pega
   el token → GUARDAR

El token se guarda **solo en el navegador de esa computadora** y no viaja a
ningún lado más que a GitHub. El botón "OLVIDAR TOKEN" lo borra.

> No actives el modo GitHub en una computadora compartida ni en un celular
> prestado. En modo borrador el panel funciona igual de bien.

### Las categorías del modal

Tu modal ofrece: Aeroespacial, Biomédica, Automotriz, Herramentales,
Investigación. El sitio público usa otras (Robótica, Metrología, etc.).

Si quieres cambiar la lista, busca `project-category` en `admin.html` y
edita las líneas `<option>`. Las categorías que ya existan en el JSON se
agregan solas al desplegable al editar un proyecto, así que nada se pierde.

### Fecha e ID

Se generan automáticamente al crear el proyecto (fecha = mes actual,
ID = `PROJ-` más cuatro dígitos), para no agregar campos a tu diseño.
Si necesitas cambiarlos, edítalos en el JSON.

---

## Una sola página que se adapta

`index.html` es ahora la única página pública. Se adapta a cualquier pantalla
mediante `css/movil.css`.

**Ese archivo contiene únicamente reglas dentro de `@media (max-width: 767px)`.**
En pantallas de 768px o más no ejecuta nada, así que el diseño de escritorio
queda exactamente como estaba. Hay una prueba automática que lo verifica.

Lo que corrige en móvil:

| Problema en pantalla angosta | Corrección |
|---|---|
| Hero de 819px de alto | Pasa a 78% del alto de pantalla |
| Degradado horizontal deja el texto ilegible | Se vuelve vertical |
| Video de fondo consume datos | Se oculta, queda el póster |
| Titular de 48px desborda | Baja a 32px |
| Línea de tiempo a 3 columnas en zigzag | Una sola columna alineada a la izquierda |
| Márgenes de 24px aprietan el texto | Bajan a 18px |
| Filtros del portafolio se amontonan | Se deslizan horizontalmente |
| Formulario a 2 columnas | Una columna |
| Campos con letra chica hacen zoom en iPhone | Se fijan en 16px |

El botón de las tres rayas abre `#menu-movil`, controlado por `js/menu.js`.
En escritorio ese menú está oculto por CSS.

Las páginas `movil-inicio.html` y `movil-portafolio.html` quedaron obsoletas y
están archivadas en la carpeta `_reemplazadas/`. No se suben al sitio.

**El panel de administración sí conserva dos versiones**, porque las
interfaces son muy distintas: `admin.html` y `movil-admin.html`.
`js/redireccion.js` se encarga de mandar a cada quien a la suya.

## index.html (escritorio)
| Elemento | Hace |
|---|---|
| Menú Servicios / Sectores / Proyectos / Nosotros | Baja a esa sección |
| Cotizar Proyecto, Solicitar Cotización | Bajan a contacto |
| Ver Servicios | Baja a servicios |
| Solicitar Cotización Formal | Abre el correo con asunto listo |
| Contactar vía WhatsApp | Abre WhatsApp al 477 225 9654 |
| Enviar Correo Electrónico | Abre el correo |
| **Enviar Mensaje** (formulario) | Valida nombre y correo, arma el mensaje y abre tu correo. Si no hay programa de correo, ofrece WhatsApp |
| Icono de menú (en pantalla angosta) | Abre el menú desplegable |
| Enlaces del pie | Bajan a la sección correspondiente |

## admin.html (escritorio)
| Elemento | Hace |
|---|---|
| + NUEVO PROYECTO | Abre el modal vacío |
| Zona de imagen | Selector de archivos, vista previa, rechaza >5 MB |
| GUARDAR DATOS | Valida y registra. Sin título o sin imagen, avisa |
| Lápiz | Abre el modal con los datos cargados |
| Bote de basura | Elimina con confirmación |
| Contadores | Cuentan de verdad |
| Flechas | Paginan de 9 en 9 |
| Admin / System Ops | Abre configuración de guardado |
| Menú lateral | Van a las secciones del sitio público |

## movil-admin.html
| Elemento | Hace |
|---|---|
| FAB "+ NUEVO" | Abre el formulario (se agregó, tu diseño no traía uno) |
| Filtrar | Filtra por categoría |
| CARGAR MÁS PROYECTOS | Muestra 4 más |
| EDITAR / ELIMINAR en cada tarjeta | Funcionan |
| Icono de persona y Configuración | Abren configuración de guardado |
| Contadores | Cuentan de verdad |

**Lo único que se agregó de nuevo** es el formulario del panel móvil, porque
tu diseño de esa pantalla no incluía uno y sin él el botón "NUEVO" no tenía
a dónde llevar. Está construido con las mismas clases y tokens del resto de
esa página.

---

# Cosas que debes saber

**Privacidad, Términos y Seguridad** apuntan a la sección de contacto porque
esas páginas no existen todavía. Cuando las tengas, cambia el `href`.

**El formulario de contacto no envía solo:** abre el programa de correo del
visitante con todo capturado. Es la única forma sin servidor. Si quieres que
llegue directo a tu bandeja, se conecta a Web3Forms o Formspree (gratis) —
está anotado en `js/contacto.js`.

**Las categorías del panel** (Aeroespacial, Biomédica, Automotriz,
Herramentales, Investigación) no coinciden con las del sitio público
(Robótica, Metrología, etc.). Búscalas como `project-category` en
`admin.html` y `movil-admin.html` y edita las líneas `<option>`.

**El progreso de manufactura** en las tarjetas móviles se calcula del estado:
Completado 100%, Activo 50%, Standby 0%. No es un dato que captures.

/* ============================================================
   PANEL DE ADMINISTRACIÓN — LÓGICA
   ------------------------------------------------------------
   Conecta la interfaz que diseñaste en Stitch con los datos
   reales de data/proyectos.json.

   DOS MODOS DE GUARDADO:

   1) BORRADOR (por defecto, sin configurar nada)
      Los cambios viven en el navegador. Al terminar, descargas
      el proyectos.json actualizado y lo subes tú a GitHub.
      Cero riesgo, cero configuración.

   2) GITHUB (opcional)
      Guarda directo en tu repositorio: sube la imagen y
      actualiza el JSON en un solo paso. Requiere un token
      de acceso, que se guarda SOLO en este navegador.

   Se cambia de modo haciendo clic en "Admin / System Ops",
   abajo en la barra lateral.
   ============================================================ */

(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const grid = $('admin-grid');
  if (!grid) return;

  const ES_MOVIL = /movil-admin/.test(location.pathname);
  const POR_PAGINA = ES_MOVIL ? 4 : 9;
  const RUTA_JSON = 'data/proyectos.json';

  let proyectos = [];
  let pagina = 0;
  let editandoId = null;
  let shaJson = null;     // versión del archivo en GitHub
  let sucio = false;      // hay cambios sin guardar
  let filtroCategoria = null;

  const cfg = {
    get repo()  { return localStorage.getItem('lma_repo')  || ''; },
    get token() { return localStorage.getItem('lma_token') || ''; },
    set repo(v)  { localStorage.setItem('lma_repo', v); },
    set token(v) { localStorage.setItem('lma_token', v); },
    get activo() { return !!(this.repo && this.token); }
  };

  const esc = (t) =>
    String(t ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const slug = (t) =>
    String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'proyecto';

  /* ---------------- Aviso flotante ---------------- */
  function aviso(msg, tipo) {
    let caja = $('lma-aviso');
    if (!caja) {
      caja = document.createElement('div');
      caja.id = 'lma-aviso';
      caja.className = 'fixed bottom-6 right-6 z-[60] px-md py-sm rounded border font-body-md text-body-md shadow-lg max-w-sm';
      document.body.appendChild(caja);
    }
    const BASE = 'fixed bottom-6 right-6 z-[60] px-md py-sm rounded border font-body-md text-body-md shadow-lg max-w-sm';
    const estilos = {
      ok:    'bg-primary-container text-on-primary-container border-primary',
      error: 'bg-error-container text-on-error-container border-error',
      info:  'bg-surface-container-highest text-on-surface border-outline/30'
    };
    caja.className = BASE + ' ' + (estilos[tipo] || estilos.info);
    caja.textContent = msg;
    caja.style.display = 'block';
    clearTimeout(caja._t);
    caja._t = setTimeout(() => { caja.style.display = 'none'; }, 4500);
  }

  /* ---------------- Tarjeta (markup original de Stitch) ---------------- */
  function tarjeta(p, indice) {
    const estado = p.estado || 'Activo';
    const colorPunto = estado.indexOf('Completado') === 0 ? 'bg-tertiary'
                     : estado.indexOf('Standby') === 0 ? 'bg-outline' : 'bg-primary';
    return `
<article class="bg-surface-container-lowest border border-outline/10 rounded-lg overflow-hidden flex flex-col group hover:border-primary transition-colors duration-300">
<div class="relative h-48 bg-surface-container-low overflow-hidden">
<img alt="${esc(p.titulo)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${esc(p.imagen)}"/>
<div class="absolute top-sm right-sm bg-surface-container-lowest/90 backdrop-blur px-sm py-xs border border-outline/10 rounded font-label-caps text-label-caps text-on-surface flex items-center">
<span class="w-2 h-2 ${colorPunto} mr-xs"></span> ${esc(estado.split(' ')[0])}
</div>
</div>
<div class="p-md flex-1 flex flex-col">
<p class="font-label-caps text-label-caps text-secondary mb-xs">${esc((p.categoria || '').toUpperCase())}</p>
<h3 class="font-headline-md text-headline-md text-on-surface mb-sm line-clamp-1">${esc(p.titulo)}</h3>
<p class="font-body-md text-body-md text-on-surface-variant mb-md flex-1 line-clamp-2">${esc(p.descripcion)}</p>
<div class="flex justify-between items-center pt-sm border-t border-outline/10 mt-auto">
<span class="font-mono-data text-mono-data text-on-surface-variant">ID: ${esc(p.id || '—')}</span>
<div class="flex gap-xs">
<button aria-label="Editar" data-editar="${indice}" class="text-on-surface-variant hover:text-primary transition-colors p-xs">
<span class="material-symbols-outlined pointer-events-none" data-icon="edit">edit</span>
</button>
<button aria-label="Eliminar" data-borrar="${indice}" class="text-on-surface-variant hover:text-error transition-colors p-xs">
<span class="material-symbols-outlined pointer-events-none" data-icon="delete">delete</span>
</button>
</div>
</div>
</div>
</article>`;
  }

  function tarjetaMovil(p, indice) {
    const estado = p.estado || 'Activo';
    const completado = estado.indexOf('Completado') === 0;
    const standby = estado.indexOf('Standby') === 0;
    const etiqueta = completado ? 'LISTO' : standby ? 'ESPERA' : 'EN CURSO';
    const cajaEstado = completado ? 'bg-primary-fixed text-on-primary-fixed'
                     : standby ? 'bg-surface-container text-on-surface'
                     : 'bg-primary-fixed text-on-primary-fixed';
    const punto = completado ? 'bg-tertiary' : standby ? 'bg-on-surface' : 'bg-primary';
    const pct = completado ? 100 : standby ? 0 : 50;
    return `
<div class="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-md flex flex-col gap-sm">
<div class="flex justify-between items-start border-b border-inverse-on-surface pb-2">
<div class="flex flex-col">
<span class="font-mono-data text-mono-data text-on-surface-variant">${esc(p.id || '—')}</span>
<h3 class="font-headline-md text-[18px] leading-tight text-on-surface mt-1">${esc(p.titulo)}</h3>
</div>
<div class="flex items-center gap-1 ${cajaEstado} px-2 py-1 rounded-sm shrink-0">
<div class="w-1.5 h-1.5 ${punto}"></div>
<span class="font-label-caps text-[10px]">${etiqueta}</span>
</div>
</div>
<div class="grid grid-cols-2 gap-y-2 mt-1">
<div>
<span class="block font-label-caps text-[10px] text-on-surface-variant">CATEGORÍA</span>
<span class="font-body-md text-sm text-on-surface">${esc(p.categoria || '—')}</span>
</div>
<div>
<span class="block font-label-caps text-[10px] text-on-surface-variant">FECHA</span>
<span class="font-mono-data text-sm text-on-surface">${esc(p.fecha || '—')}</span>
</div>
</div>
<div class="mt-2 flex flex-col gap-1">
<div class="flex justify-between items-center">
<span class="font-label-caps text-[10px] text-on-surface-variant">PROGRESO DE MANUFACTURA</span>
<span class="font-mono-data text-sm font-semibold text-primary">${pct}%</span>
</div>
<div class="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
<div class="bg-primary h-full" style="width:${pct}%"></div>
</div>
</div>
<div class="flex gap-2 pt-2 border-t border-inverse-on-surface mt-1">
<button data-editar="${indice}" class="flex-1 py-2 font-label-caps text-[10px] text-primary border border-outline-variant rounded-DEFAULT flex items-center justify-center gap-1">
<span class="material-symbols-outlined text-[16px] pointer-events-none">edit</span>EDITAR</button>
<button data-borrar="${indice}" class="flex-1 py-2 font-label-caps text-[10px] text-error border border-outline-variant rounded-DEFAULT flex items-center justify-center gap-1">
<span class="material-symbols-outlined text-[16px] pointer-events-none">delete</span>ELIMINAR</button>
</div>
</div>`;
  }

  /* ---------------- Pintar ---------------- */
  function pintar() {
    const lista = filtroCategoria
      ? proyectos.filter((p) => p.categoria === filtroCategoria)
      : proyectos;
    const total = lista.length;
    const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
    pagina = Math.min(pagina, paginas - 1);

    const cuenta = (f) => proyectos.filter(f).length;
    $('stat-total').textContent = proyectos.length;
    $('stat-proceso').textContent = cuenta((p) => (p.estado || 'Activo').indexOf('Activo') === 0);
    $('stat-completados').textContent = cuenta((p) => (p.estado || '').indexOf('Completado') === 0);

    // Móvil: acumula (botón "cargar más"). Escritorio: pagina.
    const visibles = ES_MOVIL
      ? lista.slice(0, (pagina + 1) * POR_PAGINA)
      : lista.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA);

    const dibuja = ES_MOVIL ? tarjetaMovil : tarjeta;
    grid.innerHTML = visibles.length
      ? visibles.map((p) => dibuja(p, proyectos.indexOf(p))).join('')
      : '<p class="font-body-md text-on-surface-variant col-span-full text-center py-xl">No hay proyectos todavía. Usa el botón "Nuevo" para agregar el primero.</p>';

    const dosD = (n) => String(n).padStart(2, '0');
    if ($('pag-label')) {
      $('pag-label').textContent = `${dosD(pagina + 1)} / ${dosD(paginas)}`;
      $('pag-prev').disabled = pagina === 0;
      $('pag-next').disabled = pagina >= paginas - 1;
    }
    if ($('btn-mas')) {
      $('btn-mas').style.display = visibles.length >= total ? 'none' : '';
    }

    grid.querySelectorAll('[data-editar]').forEach((b) =>
      b.addEventListener('click', () => abrirModal(proyectos[+b.dataset.editar])));
    grid.querySelectorAll('[data-borrar]').forEach((b) =>
      b.addEventListener('click', () => borrar(+b.dataset.borrar)));
  }

  /* ---------------- Modal ---------------- */
  const modal = $('add-project-modal');

  function abrirModal(p) {
    editandoId = p ? p.id : null;
    $('modal-titulo').textContent = p ? 'Editar Proyecto' : 'Nuevo Proyecto de Manufactura';
    $('project-title').value = p ? p.titulo || '' : '';
    $('project-desc').value = p ? p.descripcion || '' : '';
    if (p && p.categoria) elegirOpcion($('project-category'), p.categoria);
    else $('project-category').selectedIndex = 0;
    if (p && p.estado) elegirOpcion($('project-status'), p.estado);
    else $('project-status').selectedIndex = 0;

    // Cargar los medios que ya tiene el proyecto
    medios = [];
    if (p) {
      const vistos = new Set();
      const add = (src, tipo, poster) => {
        if (!src || vistos.has(src)) return;
        vistos.add(src);
        medios.push({ tipo: tipo || 'imagen', src, poster: poster || null, nuevo: false });
      };
      if (Array.isArray(p.medios) && p.medios.length) {
        p.medios.forEach((m) => add(m.src, m.tipo, m.poster));
      } else {
        add(p.imagen, 'imagen');
        (p.galeria || []).forEach((g) => add(g, 'imagen'));
        if (p.video) add(p.video, 'video', p.videoPoster || p.imagen);
      }
    }
    pintarTira();

    const prev = $('preview-imagen');
    if (medios[0]) { prev.src = medios[0].poster || medios[0].src; prev.classList.remove('hidden'); }
    else { prev.removeAttribute('src'); prev.classList.add('hidden'); }
    $('input-imagen').value = '';

    modal.classList.remove('hidden');
  }

  function elegirOpcion(select, valor) {
    const op = [...select.options].find((o) => o.value === valor || o.text === valor);
    if (op) select.value = op.value;
    else {
      // Categoría que existe en el JSON pero no en la lista: se agrega al vuelo
      const nueva = new Option(valor, valor, true, true);
      select.add(nueva);
    }
  }

  function cerrarModal() {
    if (window.Medios && Medios.cancelar) Medios.cancelar();
    modal.classList.add('hidden');
  }

  /* ---------------- Medios (fotos y video) ---------------- */
  /* medios = [{tipo, dataUrl, base64, ext, poster, nuevo}]
     El primero de la lista es la portada. */
  let medios = [];

  function pintarTira() {
    const tira = $('tira-medios');
    if (!tira) return;

    // Contador visible: deja claro cuántos archivos llevas
    const cuenta = $('cuenta-medios');
    if (cuenta) {
      cuenta.textContent = medios.length
        ? medios.length + (medios.length === 1 ? ' archivo cargado' : ' archivos cargados')
        : 'Ningún archivo todavía';
      cuenta.style.color = medios.length ? '' : '';
    }

    if (!medios.length) { tira.innerHTML = ''; return; }
    tira.innerHTML = medios.map((m, i) => `
<div class="relative border ${i === 0 ? 'border-primary' : 'border-outline/30'} rounded overflow-hidden"
     style="width:78px;height:56px" title="${i === 0 ? 'Portada' : 'Clic para hacerla portada'}">
  <img src="${esc(m.poster || m.dataUrl || m.src)}" alt="" style="width:100%;height:100%;object-fit:cover"/>
  ${m.tipo === 'video' ? '<span class="material-symbols-outlined absolute inset-0 m-auto text-white" style="font-size:20px;width:20px;height:20px;text-shadow:0 1px 3px rgba(0,0,0,.7)">play_arrow</span>' : ''}
  ${i === 0 ? '<span class="absolute bottom-0 left-0 right-0 bg-primary text-white font-label-caps text-center" style="font-size:8px;letter-spacing:.06em">PORTADA</span>' : ''}
  ${i !== 0 ? `<button type="button" data-portada="${i}" aria-label="Hacer portada" class="absolute inset-0" style="z-index:1"></button>` : ''}
  <button type="button" data-quitar="${i}" aria-label="Quitar"
          class="absolute top-0 right-0 bg-error text-white flex items-center justify-center"
          style="width:18px;height:18px;line-height:1;z-index:2">
    <span class="material-symbols-outlined pointer-events-none" style="font-size:13px">close</span>
  </button>
</div>`).join('');

  }

  /* Un ÚNICO oyente en el contenedor, puesto una sola vez.
     Antes se volvían a enganchar los botones en cada redibujo, y
     como el redibujo ocurre después de cada archivo, un mismo clic
     podía dispararse varias veces y borrar elementos de la lista. */
  (function engancharTira() {
    const tira = $('tira-medios');
    if (!tira) return;
    tira.addEventListener('click', (e) => {
      const quitar = e.target.closest && e.target.closest('[data-quitar]');
      if (quitar) {
        e.preventDefault(); e.stopPropagation();
        medios.splice(+quitar.dataset.quitar, 1);
        pintarTira();
        return;
      }
      const portada = e.target.closest && e.target.closest('[data-portada]');
      if (portada) {
        e.preventDefault(); e.stopPropagation();
        const i = +portada.dataset.portada;
        medios.unshift(medios.splice(i, 1)[0]);
        pintarTira();
      }
    });
  })();

  /* Registro visible de lo que pasó con cada archivo.
     Antes los errores salían como aviso flotante y se borraban
     a los 4.5 segundos, así que si fallaban dos archivos no
     alcanzabas a leer por qué. Ahora quedan en pantalla. */
  function reporte(lineas) {
    const caja = $('reporte-medios');
    if (!caja) return;
    if (!lineas || !lineas.length) { caja.innerHTML = ''; return; }
    caja.innerHTML = lineas.map((l) =>
      `<div style="display:flex;gap:6px;align-items:flex-start;margin-top:4px">
         <span style="color:${l.ok ? '#0f7b3e' : '#ba1a1a'};font-weight:700">${l.ok ? '✓' : '✕'}</span>
         <span><b>${esc(l.archivo)}</b> — ${esc(l.texto)}</span>
       </div>`).join('') +
      (lineas.some((l) => !l.ok)
        ? '<button type="button" data-limpiar-reporte style="margin-top:8px;font-size:11px;text-decoration:underline;background:none;border:none;cursor:pointer;color:#4a4e69">ocultar</button>'
        : '');
    const b = caja.querySelector('[data-limpiar-reporte]');
    if (b) b.addEventListener('click', () => { caja.innerHTML = ''; });
  }

  let ignorarSiguienteCambio = false;
  let procesando = false;

  async function agregarArchivos(archivos) {
    archivos = Array.from(archivos || []);
    if (!archivos.length) return;

    if (procesando) {
      aviso('Espera a que terminen los archivos anteriores.', 'info');
      return;
    }
    procesando = true;

    const resultado = [];
    const antes = medios.length;

    for (let i = 0; i < archivos.length; i++) {
      const f = archivos[i];
      const cual = archivos.length > 1 ? ` (${i + 1} de ${archivos.length})` : '';
      try {
        if (/^video\//.test(f.type)) {
          aviso('Leyendo el video' + cual + '…', 'info');
          const r = await Medios.convertirVideo(f, (pct, faltan, calidad) => {
            const reloj = faltan >= 60
              ? Math.floor(faltan / 60) + ' min ' + (faltan % 60) + ' s'
              : faltan + ' s';
            aviso(`Convirtiendo${cual}: ${pct}% · faltan ${reloj} · calidad ${calidad}. ` +
                  'Deja esta pestaña abierta y a la vista.', 'info');
          });
          medios.push(Object.assign(r, { nuevo: true }));
          const dur = r.segundos >= 60
            ? Math.floor(r.segundos / 60) + ':' + String(Math.round(r.segundos % 60)).padStart(2, '0')
            : r.segundos + 's';
          resultado.push({ archivo: f.name, ok: true,
            texto: `video ${dur}, ${r.an}×${r.al}, ${(r.kb / 1024).toFixed(1)} MB` });
        } else {
          aviso('Preparando la foto' + cual + '…', 'info');
          const r = await Medios.comprimirImagen(f);
          medios.push(Object.assign(r, { nuevo: true }));
          resultado.push({ archivo: f.name, ok: true,
            texto: `${r.an}×${r.al}, ${r.kb} KB (venía de ${Math.round(f.size / 1024)} KB)` });
        }
        pintarTira();
      } catch (err) {
        console.error('[medios]', f.name, err);
        let motivo = err.message;
        if (/no parece ser una imagen/i.test(motivo) && /\.hei[cf]$/i.test(f.name)) {
          motivo = 'Formato HEIC del iPhone: el navegador no puede abrirlo. ' +
                   'En el iPhone entra a Ajustes → Cámara → Formatos y elige "Más compatible".';
        }
        resultado.push({ archivo: f.name, ok: false, texto: motivo });
        reporte(resultado);   // se muestra al momento, no al final
      }
    }

    procesando = false;
    const exitos = resultado.filter((r) => r.ok).length;
    const agregados = medios.length - antes;

    /* Verificación: lo que se procesó bien tiene que coincidir con lo
       que quedó en la lista. Si no coincide, se dice en pantalla en vez
       de fallar en silencio. */
    if (agregados !== exitos) {
      resultado.push({ archivo: 'AVISO INTERNO', ok: false,
        texto: `se procesaron ${exitos} archivo(s) pero quedaron ${agregados} en la lista. ` +
               'Copia este mensaje y repórtalo.' });
    }
    reporte(resultado);
    const fallidos = resultado.filter((r) => !r.ok).length;
    if (fallidos) {
      aviso(`${agregados} de ${archivos.length} archivo(s) agregados. ` +
            `${fallidos} con problema: mira el detalle debajo del recuadro.`, 'error');
    } else if (archivos.length > 1) {
      aviso(`${agregados} archivo(s) agregados.`, 'ok');
    }

    const prev = $('preview-imagen');
    if (prev && medios[0]) {
      prev.src = medios[0].poster || medios[0].dataUrl || medios[0].src;
      prev.classList.remove('hidden');
      prev.classList.add('pointer-events-none');
    }
  }

  /* El selector de archivos. Se limpia el valor DESPUÉS de leer,
     para poder volver a elegir el mismo archivo si hace falta. */
  $('input-imagen').addEventListener('change', async (e) => {
    const entrada = e.target;
    const lista = Array.from(entrada.files || []);
    try {
      await agregarArchivos(lista);
    } finally {
      // Se limpia AL FINAL. Si se limpia antes, algunos navegadores
      // invalidan los archivos que todavía no se han leído y solo
      // se procesan los primeros de la selección.
      entrada.value = '';
    }
  });

  /* Arrastrar y soltar. El recuadro ya decía "arrastra y suelta",
     pero no estaba programado: al soltar archivos no pasaba nada. */
  const zona = $('drop-zona');
  if (zona) {
    ['dragenter', 'dragover'].forEach((ev) =>
      zona.addEventListener(ev, (e) => {
        e.preventDefault(); e.stopPropagation();
        zona.classList.add('border-primary');
      }));
    ['dragleave', 'drop'].forEach((ev) =>
      zona.addEventListener(ev, (e) => {
        e.preventDefault(); e.stopPropagation();
        zona.classList.remove('border-primary');
      }));
    /* El <input> invisible cubre toda la zona, así que al soltar
       archivos también los recibe él y dispara su propio 'change'.
       Sin este candado, la misma tanda se procesaba dos veces. */
    zona.addEventListener('drop', async (e) => {
      e.preventDefault(); e.stopPropagation();
      const lista = e.dataTransfer && e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
      if (!lista.length) return;
      ignorarSiguienteCambio = true;
      const entrada = $('input-imagen');
      if (entrada) entrada.value = '';
      await agregarArchivos(lista);
      ignorarSiguienteCambio = false;
    });
  }

  /* Botón explícito, por si la zona de arrastre no queda clara */
  const masArchivos = $('btn-mas-archivos');
  if (masArchivos) {
    masArchivos.addEventListener('click', (e) => {
      e.preventDefault();
      $('input-imagen').click();
    });
  }

  /* ---------------- Guardar ---------------- */
  $('btn-guardar').addEventListener('click', async () => {
    const titulo = $('project-title').value.trim();
    if (!titulo) { aviso('Escribe el título del proyecto.', 'error'); return; }

    const existente = editandoId ? proyectos.find((p) => p.id === editandoId) : null;
    if (!medios.length) { aviso('Agrega al menos una foto.', 'error'); return; }

    const base = slug(titulo);
    const ahora = new Date();
    const fecha = ahora.getFullYear() + '-' + String(ahora.getMonth() + 1).padStart(2, '0');

    // Asigna nombre de archivo a cada medio nuevo.
    // Contadores separados para fotos y videos, así ninguno se pisa.
    let nFoto = 0, nVideo = 0;
    const porSubir = [];
    const rutas = medios.map((m) => {
      if (!m.nuevo) return { src: m.src, tipo: m.tipo, poster: m.poster || null };

      if (m.tipo === 'video') {
        nVideo++;
        const nombre = base + '-video' + (nVideo > 1 ? '-' + nVideo : '') + '.' + m.ext;
        porSubir.push({ nombre, base64: m.base64, tipo: 'video' });
        let rutaPoster = null;
        if (m.poster) {
          const np = base + '-video' + (nVideo > 1 ? '-' + nVideo : '') + '-portada.' +
                     (m.poster.indexOf('webp') > -1 ? 'webp' : 'jpg');
          porSubir.push({ nombre: np, base64: m.poster.split(',')[1], tipo: 'imagen' });
          rutaPoster = '/img/portafolio/' + np;
        }
        return { src: '/img/portafolio/' + nombre, tipo: 'video', poster: rutaPoster };
      }

      nFoto++;
      const nombre = base + (nFoto > 1 ? '-' + nFoto : '') + '.' + m.ext;
      porSubir.push({ nombre, base64: m.base64, tipo: 'imagen' });
      return { src: '/img/portafolio/' + nombre, tipo: 'imagen', poster: null };
    });

    const fotos = rutas.filter((r) => r.tipo === 'imagen').map((r) => r.src);
    const videos = rutas.filter((r) => r.tipo === 'video');
    const primero = rutas[0];
    const portada = primero.tipo === 'video' ? (primero.poster || fotos[0] || '') : primero.src;

    const datos = {
      id: existente ? existente.id : 'PROJ-' + Date.now().toString().slice(-4),
      titulo,
      categoria: $('project-category').value,
      estado: $('project-status').value,
      imagen: portada,
      // Lista completa y ordenada: es la fuente de verdad del visor
      medios: rutas.map((r) => (r.tipo === 'video'
        ? { tipo: 'video', src: r.src, poster: r.poster }
        : { tipo: 'imagen', src: r.src })),
      galeria: fotos,
      descripcion: $('project-desc').value.trim(),
      cliente: existente ? existente.cliente || '' : '',
      fecha: existente ? existente.fecha || fecha : fecha,
      destacado: existente ? !!existente.destacado : false
    };
    if (videos.length) {
      datos.video = videos[0].src;                 // compatibilidad
      datos.videoPoster = videos[0].poster || portada;
    }

    if (existente) {
      delete existente.video; delete existente.videoPoster;
      delete existente.medios; delete existente.galeria;
      Object.assign(existente, datos);
    } else {
      proyectos.unshift(datos);
    }

    sucio = true;
    cerrarModal();
    pintar();

    if (cfg.activo) {
      await publicarEnGitHub(datos, porSubir);
    } else {
      aviso(`Guardado como borrador. Se descargarán ${porSubir.length} archivo(s); cópialos a img/portafolio/`, 'ok');
      porSubir.forEach((a, i) => setTimeout(() => descargarDato(a, a.nombre), i * 400));
    }
    medios = [];
    pintarTira();
  });

  function descargarDato(archivo, nombre) {
    const tipo = archivo.tipo === 'video' ? 'video/mp4' : 'image/webp';
    const bin = atob(archivo.base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes], { type: tipo }));
    const a = document.createElement('a');
    a.href = url; a.download = nombre; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }

  function borrar(indice) {
    const p = proyectos[indice];
    if (!confirm(`¿Eliminar "${p.titulo}"?\n\nLa imagen no se borra del repositorio, solo se quita del portafolio.`)) return;
    proyectos.splice(indice, 1);
    sucio = true;
    pintar();
    if (cfg.activo) publicarEnGitHub(null, []);
    else aviso('Eliminado del borrador. Recuerda descargar el JSON.', 'ok');
  }

  /* ---------------- Descargas (modo borrador) ---------------- */
  function descargar(contenido, nombre, tipo) {
    const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
    const a = document.createElement('a');
    a.href = url; a.download = nombre; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function descargarImagen(dataUrl, nombre) {
    const a = document.createElement('a');
    a.href = dataUrl; a.download = nombre; a.click();
    aviso('Se descargó la imagen. Cópiala a la carpeta img/portafolio/', 'info');
  }

  function descargarJson() {
    descargar(JSON.stringify(proyectos, null, 2), 'proyectos.json', 'application/json');
    sucio = false;
    aviso('proyectos.json descargado. Reemplázalo en data/ y haz push.', 'ok');
  }

  /* ---------------- GitHub ---------------- */
  async function api(ruta, opciones) {
    const url = 'https://api.github.com/repos/' + cfg.repo + '/contents/' + ruta;
    const r = await fetch(url, Object.assign({
      headers: {
        Authorization: 'Bearer ' + cfg.token,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }, opciones));

    if (r.status === 404 && (!opciones || opciones.method !== 'PUT')) return null; // no existe aún

    if (!r.ok) {
      let detalle = '';
      try { detalle = (await r.json()).message || ''; } catch (e) {}
      throw Object.assign(new Error(mensajeDeError(r.status, detalle)), { codigo: r.status });
    }
    return r.json();
  }

  function mensajeDeError(codigo, detalle) {
    switch (codigo) {
      case 401: return 'El token no es válido o ya venció. Genera uno nuevo en GitHub.';
      case 403: return 'El token no tiene permiso de escritura. Debe incluir Contents: Read and write.';
      case 404: return 'No se encontró el repositorio "' + cfg.repo + '". Revisa que esté escrito como usuario/repositorio.';
      case 409:
      case 422: return 'Conflicto al guardar: alguien más cambió el archivo. Recarga el panel e inténtalo otra vez.';
      default:  return 'Error ' + codigo + (detalle ? ': ' + detalle : '');
    }
  }

  const aBase64 = (texto) => {
    const bytes = new TextEncoder().encode(texto);
    let bin = '';
    bytes.forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin);
  };

  /* Sube un archivo. Si ya existía, manda su sha para reemplazarlo
     (GitHub rechaza el envío sin sha cuando el archivo ya existe). */
  async function subirArchivo(ruta, contenidoBase64, mensaje) {
    let sha = null;
    const previo = await api(ruta);
    if (previo && previo.sha) sha = previo.sha;
    const cuerpo = { message: mensaje, content: contenidoBase64 };
    if (sha) cuerpo.sha = sha;
    return api(ruta, { method: 'PUT', body: JSON.stringify(cuerpo) });
  }

  async function publicarEnGitHub(datos, archivos) {
    ocupado(true, 'PUBLICANDO…');
    aviso('Publicando en GitHub…', 'info');
    try {
      const lista = archivos || [];
      for (let i = 0; i < lista.length; i++) {
        aviso(`Subiendo archivos… ${i + 1} de ${lista.length}`, 'info');
        await subirArchivo('img/portafolio/' + lista[i].nombre, lista[i].base64,
                           'Medio: ' + lista[i].nombre);
      }
      aviso('Actualizando el portafolio…', 'info');
      await subirArchivo(
        RUTA_JSON,
        aBase64(JSON.stringify(proyectos, null, 2)),
        datos ? 'Portafolio: ' + datos.titulo : 'Portafolio actualizado'
      );
      sucio = false;
      aviso('Publicado. Tu sitio se actualiza en aproximadamente un minuto.', 'ok');
    } catch (e) {
      console.error(e);
      aviso('No se pudo publicar. ' + e.message + ' Tus cambios siguen aquí: puedes reintentar o descargar el JSON.', 'error');
    } finally {
      ocupado(false);
    }
  }

  /* Deja el botón de guardar inhabilitado mientras se publica,
     para que no se mande dos veces por accidente. */
  function ocupado(si, texto) {
    const b = $('btn-guardar');
    const t = $('txt-guardar');
    if (b) { b.disabled = si; b.style.opacity = si ? '.6' : ''; b.style.pointerEvents = si ? 'none' : ''; }
    if (t && si) { t.dataset.previo = t.dataset.previo || t.textContent; t.textContent = texto || 'ESPERE…'; }
    if (t && !si && t.dataset.previo) { t.textContent = t.dataset.previo; }
  }

  /* Comprueba repositorio y token antes de guardarlos. */
  async function probarConexion(repo, token) {
    const r = await fetch('https://api.github.com/repos/' + repo + '/contents/' + RUTA_JSON, {
      headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' }
    });
    if (r.ok) return { ok: true, texto: 'Conexión correcta. Ya puedes publicar.' };
    if (r.status === 404) {
      return { ok: false, texto: 'No se encontró ' + repo + '/' + RUTA_JSON + '. Revisa el nombre del repositorio.' };
    }
    return { ok: false, texto: mensajeDeErrorSuelto(r.status, repo) };
  }
  function mensajeDeErrorSuelto(codigo, repo) {
    if (codigo === 401) return 'Token inválido o vencido.';
    if (codigo === 403) return 'El token no tiene permiso de escritura sobre ' + repo + '.';
    return 'Error ' + codigo + '.';
  }

  /* ---------------- Archivos huérfanos ---------------- */
  /* Un archivo huérfano es una foto o video que sigue en el
     repositorio pero que ningún proyecto usa: quedó de un
     proyecto que borraste o de una imagen que reemplazaste.

     Ojo: borrarlos NO recupera el espacio del historial de Git
     (ahí queda todo para siempre). Lo que sí hace es reducir lo
     que se publica en Cloudflare y dejar la carpeta ordenada. */

  const CARPETA = 'img/portafolio';

  function rutasEnUso() {
    const usadas = new Set();
    const agregar = (r) => {
      if (!r || typeof r !== 'string') return;
      // "/img/portafolio/foto.webp" -> "foto.webp"
      const nombre = r.split('/').pop().split('?')[0];
      if (nombre) usadas.add(nombre);
    };
    proyectos.forEach((p) => {
      agregar(p.imagen);
      (p.galeria || []).forEach(agregar);
      agregar(p.video);
      agregar(p.videoPoster);
    });
    return usadas;
  }

  async function buscarHuerfanos() {
    const listado = await api(CARPETA);
    if (!listado || !Array.isArray(listado)) return [];
    const usadas = rutasEnUso();
    return listado
      .filter((f) => f.type === 'file' && f.name !== '.gitkeep' && !usadas.has(f.name))
      .map((f) => ({ nombre: f.name, sha: f.sha, kb: Math.round((f.size || 0) / 1024) }));
  }

  async function borrarArchivo(nombre, sha) {
    const r = await fetch(
      'https://api.github.com/repos/' + cfg.repo + '/contents/' + CARPETA + '/' + encodeURIComponent(nombre),
      {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + cfg.token,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify({ message: 'Limpieza: ' + nombre, sha })
      }
    );
    if (!r.ok) {
      let d = '';
      try { d = (await r.json()).message || ''; } catch (e) {}
      throw new Error(mensajeDeError(r.status, d));
    }
    return true;
  }

  /* ---------------- Configuración ---------------- */
  function abrirConfig() {
    let caja = $('lma-config');
    if (!caja) {
      caja = document.createElement('div');
      caja.id = 'lma-config';
      caja.className = 'fixed inset-0 z-[70] flex items-center justify-center p-gutter bg-on-surface/20 backdrop-blur-sm';
      caja.innerHTML = `
<div class="bg-surface-container-lowest w-full max-w-lg rounded-lg border border-outline/10 shadow-2xl">
  <header class="flex justify-between items-center p-md border-b border-outline/10">
    <h3 class="font-headline-md text-headline-md text-on-surface">Configuración de guardado</h3>
    <button class="text-on-surface-variant hover:text-on-surface" data-cerrar>
      <span class="material-symbols-outlined">close</span></button>
  </header>
  <div class="p-md space-y-md">
    <div class="border border-outline/10 rounded p-md bg-surface-container-low">
      <p class="font-label-caps text-label-caps text-on-surface-variant mb-xs">MODO BORRADOR</p>
      <p class="font-body-md text-body-md text-on-surface-variant mb-sm">Los cambios viven en este navegador. Descarga el archivo y súbelo tú a GitHub.</p>
      <button class="px-md py-sm font-label-caps text-label-caps bg-primary-container text-on-primary-container rounded" data-descargar>DESCARGAR proyectos.json</button>
    </div>
    <div class="border border-outline/10 rounded p-md">
      <p class="font-label-caps text-label-caps text-on-surface-variant mb-xs">MODO GITHUB (OPCIONAL)</p>
      <p class="font-body-md text-body-md text-on-surface-variant mb-sm">Publica directo en tu repositorio. El token se guarda solo en este navegador, nunca se envía a ningún otro lado.</p>
      <label class="block font-label-caps text-label-caps text-on-surface-variant mb-xs">REPOSITORIO</label>
      <input id="cfg-repo" placeholder="tu-usuario/sitio-lma" class="w-full bg-surface border border-outline/30 rounded px-sm py-sm mb-sm font-mono-data text-mono-data"/>
      <label class="block font-label-caps text-label-caps text-on-surface-variant mb-xs">TOKEN (ghp_…)</label>
      <input id="cfg-token" type="password" placeholder="ghp_xxxxxxxxxxxx" class="w-full bg-surface border border-outline/30 rounded px-sm py-sm font-mono-data text-mono-data"/>
      <p class="font-body-md text-on-surface-variant text-xs mt-xs">Usa un token de tipo <b>fine-grained</b> limitado a este repositorio, con permiso de escritura en Contents.</p>
      <button class="mt-sm px-md py-sm font-label-caps text-label-caps border border-outline/30 rounded" data-probar>PROBAR CONEXIÓN</button>
      <p id="cfg-prueba" class="font-body-md text-xs mt-xs"></p>
    </div>
  </div>
    <div class="border border-outline/10 rounded p-md">
      <p class="font-label-caps text-label-caps text-on-surface-variant mb-xs">ARCHIVOS SIN USO</p>
      <p class="font-body-md text-body-md text-on-surface-variant mb-sm">Fotos y videos que quedaron en el repositorio pero que ningún proyecto usa. Requiere el modo GitHub activo.</p>
      <button class="px-md py-sm font-label-caps text-label-caps border border-outline/30 rounded" data-buscar-huerfanos>BUSCAR ARCHIVOS SIN USO</button>
      <div id="cfg-huerfanos" class="font-body-md text-xs mt-sm"></div>
    </div>
  <footer class="p-md border-t border-outline/10 bg-surface-container-low flex justify-between items-center rounded-b-lg">
    <span class="font-mono-data text-mono-data text-on-surface-variant" id="cfg-estado"></span>
    <div class="flex gap-sm">
      <button class="px-md py-sm font-label-caps text-label-caps border border-outline/20 rounded" data-olvidar>OLVIDAR TOKEN</button>
      <button class="px-md py-sm font-label-caps text-label-caps bg-primary-container text-on-primary-container rounded" data-guardar>GUARDAR</button>
    </div>
  </footer>
</div>`;
      document.body.appendChild(caja);
      const en = (sel, fn) => { const e = caja.querySelector(sel); if (e) e.addEventListener('click', fn); };
      const val = (sel) => { const e = caja.querySelector(sel); return e ? String(e.value || '').trim() : ''; };
      const cerrar = () => { if (caja.remove) caja.remove(); };

      caja.addEventListener('click', (e) => { if (e.target === caja) cerrar(); });
      en('[data-cerrar]', cerrar);
      en('[data-descargar]', descargarJson);
      en('[data-guardar]', () => {
        cfg.repo = val('#cfg-repo');
        cfg.token = val('#cfg-token');
        cerrar();
        aviso(cfg.activo ? 'Modo GitHub activo.' : 'Modo borrador.', 'ok');
      });
      en('[data-probar]', async () => {
        const salida = caja.querySelector('#cfg-prueba');
        const repo = val('#cfg-repo');
        const token = val('#cfg-token');
        if (!repo || !token) {
          salida.textContent = 'Escribe el repositorio y el token antes de probar.';
          salida.style.color = '#ba1a1a';
          return;
        }
        salida.textContent = 'Probando…';
        salida.style.color = '';
        try {
          const r = await probarConexion(repo, token);
          salida.textContent = r.texto;
          salida.style.color = r.ok ? '#0f7b3e' : '#ba1a1a';
        } catch (err) {
          salida.textContent = 'No hubo respuesta de GitHub. Revisa tu conexión a internet.';
          salida.style.color = '#ba1a1a';
        }
      });
      en('[data-buscar-huerfanos]', async () => {
        const salida = caja.querySelector('#cfg-huerfanos');
        if (!cfg.activo) {
          salida.innerHTML = '<span style="color:#ba1a1a">Primero configura el repositorio y el token, y guarda.</span>';
          return;
        }
        salida.textContent = 'Revisando el repositorio…';
        try {
          const sueltos = await buscarHuerfanos();
          if (!sueltos.length) {
            salida.innerHTML = '<span style="color:#0f7b3e">No hay archivos sin uso. Todo está limpio.</span>';
            return;
          }
          const totalKb = sueltos.reduce((a, b) => a + b.kb, 0);
          const peso = totalKb > 1024 ? (totalKb / 1024).toFixed(1) + ' MB' : totalKb + ' KB';
          salida.innerHTML =
            '<p style="margin-bottom:6px"><b>' + sueltos.length + ' archivo(s) sin uso · ' + peso + '</b></p>' +
            '<ul style="max-height:120px;overflow:auto;margin:0 0 8px 16px">' +
            sueltos.map((f) => '<li>' + esc(f.nombre) + ' — ' + f.kb + ' KB</li>').join('') +
            '</ul>' +
            '<button data-borrar-huerfanos class="px-md py-sm font-label-caps text-label-caps rounded" ' +
            'style="background:#ba1a1a;color:#fff">ELIMINAR ESTOS ' + sueltos.length + '</button>';

          const bt = salida.querySelector('[data-borrar-huerfanos]');
          if (bt) bt.addEventListener('click', async () => {
            if (!confirm('Se eliminarán ' + sueltos.length + ' archivo(s) del repositorio.\n\n' +
                         'Los proyectos publicados NO se tocan. Esta acción queda en el historial de Git, ' +
                         'así que los archivos siguen siendo recuperables.\n\n¿Continuar?')) return;
            bt.disabled = true;
            let hechos = 0, fallos = 0;
            for (const f of sueltos) {
              salida.insertAdjacentHTML('beforeend',
                '<p style="margin-top:4px">Eliminando ' + esc(f.nombre) + '…</p>');
              try { await borrarArchivo(f.nombre, f.sha); hechos++; }
              catch (e) { fallos++; console.error(e); }
            }
            salida.innerHTML = '<span style="color:#0f7b3e">Listo: ' + hechos + ' eliminado(s)' +
              (fallos ? ', ' + fallos + ' con error' : '') + '.</span>';
            aviso('Limpieza terminada: ' + hechos + ' archivo(s) eliminado(s).', 'ok');
          });
        } catch (e) {
          console.error(e);
          salida.innerHTML = '<span style="color:#ba1a1a">' + esc(e.message) + '</span>';
        }
      });
      en('[data-olvidar]', () => {
        localStorage.removeItem('lma_token');
        localStorage.removeItem('lma_repo');
        cerrar();
        aviso('Token borrado de este navegador.', 'ok');
      });
    }
    const pon = (sel, v) => { const e = caja.querySelector(sel); if (e) e.value = v; };
    pon('#cfg-repo', cfg.repo);
    pon('#cfg-token', cfg.token);
    const est = caja.querySelector('#cfg-estado');
    if (est) est.textContent = cfg.activo ? 'MODO: GITHUB' : 'MODO: BORRADOR';
  }

  /* ---------------- Conexión de botones ---------------- */
  function conectar(id, fn) { const e = $(id); if (e) e.addEventListener('click', fn); }

  conectar('abrir-config', abrirConfig);
  conectar('link-config', abrirConfig);
  conectar('btn-nuevo', () => abrirModal(null));          // FAB del panel móvil
  conectar('btn-mas', () => { pagina++; pintar(); });      // "Cargar más" móvil
  conectar('pag-prev', () => { if (pagina > 0) { pagina--; pintar(); } });
  conectar('pag-next', () => { pagina++; pintar(); });
  conectar('btn-filtrar', () => {
    const cats = [...new Set(proyectos.map((p) => p.categoria).filter(Boolean))];
    const elegida = prompt('Filtrar por categoría:\n\n' + cats.join('\n') + '\n\n(deja vacío para ver todas)');
    if (elegida === null) return;
    filtroCategoria = elegida.trim() || null;
    pagina = 0;
    pintar();
  });

  // El modal del escritorio abre por onclick propio de Stitch; nos aseguramos
  // de limpiar el formulario cuando se abre vacío.
  const botonNuevoEscritorio = document.querySelector('[onclick*="add-project-modal"][onclick*="remove"]');
  if (botonNuevoEscritorio) {
    botonNuevoEscritorio.addEventListener('click', () => abrirModal(null));
  }

  // Cerrar modal tocando fuera (también en móvil)
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) cerrarModal();
  });

  window.addEventListener('beforeunload', (e) => {
    if (sucio && !cfg.activo) { e.preventDefault(); e.returnValue = ''; }
  });

  /* ---------------- Arranque ---------------- */
  (async function cargar() {
    try {
      const r = await fetch(RUTA_JSON, { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      const d = await r.json();
      proyectos = (Array.isArray(d) ? d : d.proyectos || [])
        .sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')));
      pintar();
    } catch (e) {
      grid.innerHTML =
        '<p class="font-body-md text-on-surface-variant col-span-full text-center py-xl">' +
        'No se pudo leer data/proyectos.json. Revisa que exista, que sea válido, y que estés viendo el panel ' +
        'con un servidor local (no con doble clic sobre el archivo).</p>';
      console.error('[admin]', e);
    }
  })();
})();

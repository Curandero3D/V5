/* ============================================================
   PORTAFOLIO DINÁMICO
   ------------------------------------------------------------
   Lee data/proyectos.json y genera las tarjetas usando
   EXACTAMENTE las mismas clases de Tailwind que generó Stitch.
   El diseño no cambia: solo cambia de dónde vienen los datos.

   Detecta solo si está en la página de escritorio o en la
   móvil, y usa el markup correspondiente.
   ============================================================ */

(function () {
  const galeria = document.getElementById('galeria');
  const filtros = document.getElementById('filtros');
  if (!galeria) return;

  // La página móvil se llama movil-*.html; como respaldo, el contenedor
  // móvil apila con flex-col mientras el de escritorio usa grid.
  const esMovil = /movil-/.test(location.pathname) ||
                  (galeria.className || '').includes('flex-col');

  let proyectos = [];
  let filtroActivo = 'Todos';

  /* Devuelve todos los medios de un proyecto en un solo arreglo.
     Acepta el formato viejo (solo "imagen") y el nuevo
     ("galeria" con varias fotos y "video" opcional). */
  function mediosDe(p) {
    const lista = [];
    const vistos = new Set();
    const agregar = (src, tipo, poster) => {
      if (!src || vistos.has(src)) return;
      vistos.add(src);
      lista.push({ src, tipo: tipo || 'imagen', poster: poster || null });
    };
    // Formato nuevo: lista ordenada con fotos y videos mezclados
    if (Array.isArray(p.medios) && p.medios.length) {
      p.medios.forEach((m) => agregar(m.src, m.tipo, m.poster));
      return lista;
    }
    // Formato anterior, por compatibilidad
    agregar(p.imagen, 'imagen');
    (p.galeria || []).forEach((g) => agregar(typeof g === 'string' ? g : g.src, 'imagen'));
    if (p.video) agregar(typeof p.video === 'string' ? p.video : p.video.src, 'video', p.videoPoster || p.imagen);
    return lista;
  }

  const esc = (t) =>
    String(t ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );

  /* ---------- Tarjeta ESCRITORIO (markup original de Stitch) ---------- */
  function tarjetaEscritorio(p, indice) {
    const medios = mediosDe(p);
    const hayVideo = medios.some((m) => m.tipo === 'video');
    const distintivo = medios.length > 1 || hayVideo ? `
<div class="absolute top-sm right-sm bg-surface-container-lowest/90 backdrop-blur px-sm py-xs border border-outline/10 rounded font-label-caps text-[10px] text-on-surface flex items-center gap-1 pointer-events-none">
<span class="material-symbols-outlined text-[14px]">${hayVideo ? 'play_circle' : 'photo_library'}</span>${medios.length}
</div>` : '';
    return `
<div class="tech-card rounded-lg overflow-hidden flex flex-col h-full cursor-pointer" data-abrir="${indice}" role="button" tabindex="0" aria-label="Ver ${esc(p.titulo)}">
<div class="aspect-video overflow-hidden relative">
<img alt="${esc(p.categoria)}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" src="${esc(medios[0] ? (medios[0].poster || medios[0].src) : '')}"/>
${distintivo}
</div>
<div class="p-md flex flex-col flex-grow">
<span class="font-label-caps text-primary text-[10px] uppercase tracking-widest mb-xs">${esc(p.categoria)}</span>
<h3 class="font-headline-md text-[18px] leading-tight mb-sm">${esc(p.titulo)}</h3>
<p class="font-body-md text-sm text-on-surface-variant flex-grow">${esc(p.descripcion)}</p>
</div>
</div>`;
  }

  /* ---------- Tarjeta MÓVIL (markup original de Stitch) ---------- */
  function tarjetaMovil(p, indice) {
    const estado = p.estado || (p.destacado ? 'Destacado' : 'Procesado');
    const medios = mediosDe(p);
    const hayVideo = medios.some((m) => m.tipo === 'video');
    const distintivo = medios.length > 1 || hayVideo ? `
<div class="absolute top-2 right-2 bg-surface-container-lowest/90 px-2 py-1 border border-black/10 rounded font-label-caps text-[10px] flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">${hayVideo ? 'play_circle' : 'photo_library'}</span>${medios.length}
</div>` : '';
    return `
<article class="bg-surface-container-lowest border border-black/10 rounded overflow-hidden flex flex-col cursor-pointer" data-abrir="${indice}" role="button" tabindex="0">
<div class="w-full h-48 relative border-b border-black/10">
<img class="w-full h-full object-cover" loading="lazy" alt="${esc(p.titulo)}" src="${esc(medios[0] ? (medios[0].poster || medios[0].src) : '')}"/>
${distintivo}
</div>
<div class="p-md flex flex-col gap-base">
<span class="font-label-caps text-label-caps text-primary">${esc(p.categoria)}</span>
<h2 class="font-headline-md text-headline-md text-on-surface">${esc(p.titulo)}</h2>
<p class="font-body-md text-body-md text-on-surface-variant line-clamp-3">${esc(p.descripcion)}</p>
<div class="mt-2 flex items-center gap-2">
<span class="w-2 h-2 bg-primary rounded-none"></span>
<span class="font-mono-data text-mono-data text-on-surface-variant">Estado: ${esc(estado)}</span>
</div>
</div>
</article>`;
  }

  /* ---------- Botón de filtro (usa los estilos del sitio) ---------- */
  function chip(cat, activo) {
    const base = esMovil
      ? 'font-label-caps text-label-caps px-3 py-2 border transition-colors cursor-pointer'
      : 'font-label-caps text-[11px] uppercase tracking-widest px-4 py-2 border transition-colors cursor-pointer';
    const estado = activo
      ? 'bg-primary text-on-primary border-primary'
      : 'bg-surface-container-lowest text-on-surface-variant border-black/10 hover:border-primary';
    return `<button type="button" class="${base} ${estado}" data-cat="${esc(cat)}" aria-pressed="${activo}">${esc(cat)}</button>`;
  }

  function pintarFiltros() {
    if (!filtros) return;
    const cats = ['Todos', ...new Set(proyectos.map((p) => p.categoria).filter(Boolean))];
    filtros.innerHTML = cats.map((c) => chip(c, c === filtroActivo)).join('');
    filtros.querySelectorAll('button').forEach((b) =>
      b.addEventListener('click', () => {
        filtroActivo = b.dataset.cat;
        pintarFiltros();
        pintar();
      })
    );
  }

  function pintar() {
    const lista =
      filtroActivo === 'Todos'
        ? proyectos
        : proyectos.filter((p) => p.categoria === filtroActivo);

    if (!lista.length) {
      galeria.innerHTML =
        '<p class="font-body-md text-on-surface-variant col-span-full text-center py-lg">Aún no hay proyectos en esta categoría.</p>';
      return;
    }
    galeria.innerHTML = lista
      .map((p) => (esMovil ? tarjetaMovil : tarjetaEscritorio)(p, proyectos.indexOf(p)))
      .join('');
    galeria.querySelectorAll('[data-abrir]').forEach((el) => {
      const abrir = () => Visor.abrir(proyectos, +el.dataset.abrir);
      el.addEventListener('click', abrir);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); }
      });
    });
  }

  async function cargar() {
    try {
      const r = await fetch('data/proyectos.json', { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      const d = await r.json();
      proyectos = (Array.isArray(d) ? d : d.proyectos || []).sort((a, b) =>
        String(b.fecha || '').localeCompare(String(a.fecha || ''))
      );
      pintarFiltros();
      pintar();
    } catch (e) {
      galeria.innerHTML =
        '<p class="font-body-md text-on-surface-variant col-span-full text-center py-lg">' +
        'No se pudieron cargar los proyectos. Revisa que <b>data/proyectos.json</b> exista y sea válido, ' +
        'y que estés viendo el sitio con un servidor local (no con doble clic).</p>';
      console.error('[portafolio]', e);
    }
  }

  window.mediosDe = mediosDe;
  cargar();
})();

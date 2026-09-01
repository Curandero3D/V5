/* ============================================================
   VISOR DE GALERÍA
   ------------------------------------------------------------
   Se abre al hacer clic en una tarjeta del portafolio y muestra
   todas las fotos y el video de ese proyecto.

   Se construye con los mismos colores y tipografías del sitio.
   No existe en la página hasta que abres un proyecto: se crea
   en ese momento y desaparece al cerrar.

   Controles: flechas del teclado, Escape para cerrar, deslizar
   con el dedo en el celular, y clic fuera de la imagen.
   ============================================================ */

window.Visor = (function () {
  'use strict';

  var caja = null, medios = [], indice = 0, proyecto = null;

  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function construir() {
    caja = document.createElement('div');
    caja.id = 'visor';
    caja.setAttribute('role', 'dialog');
    caja.setAttribute('aria-modal', 'true');
    caja.innerHTML =
      '<div class="visor-fondo"></div>' +
      '<div class="visor-caja">' +
        '<button class="visor-cerrar" aria-label="Cerrar">' +
          '<span class="material-symbols-outlined">close</span></button>' +
        '<div class="visor-lienzo"><div class="visor-medio"></div>' +
          '<button class="visor-nav visor-prev" aria-label="Anterior">' +
            '<span class="material-symbols-outlined">chevron_left</span></button>' +
          '<button class="visor-nav visor-sig" aria-label="Siguiente">' +
            '<span class="material-symbols-outlined">chevron_right</span></button>' +
          '<div class="visor-cuenta"></div>' +
        '</div>' +
        '<div class="visor-info">' +
          '<span class="visor-cat"></span>' +
          '<h3 class="visor-titulo"></h3>' +
          '<p class="visor-desc"></p>' +
          '<div class="visor-meta"></div>' +
        '</div>' +
        '<div class="visor-tiras"></div>' +
      '</div>';
    document.body.appendChild(caja);

    caja.querySelector('.visor-cerrar').addEventListener('click', cerrar);
    caja.querySelector('.visor-fondo').addEventListener('click', cerrar);
    caja.querySelector('.visor-prev').addEventListener('click', function () { mover(-1); });
    caja.querySelector('.visor-sig').addEventListener('click', function () { mover(1); });

    // Deslizar con el dedo
    var x0 = null;
    var lienzo = caja.querySelector('.visor-lienzo');
    lienzo.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lienzo.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var d = e.changedTouches[0].clientX - x0;
      if (Math.abs(d) > 50) mover(d < 0 ? 1 : -1);
      x0 = null;
    }, { passive: true });

    document.addEventListener('keydown', function (e) {
      if (!caja || caja.style.display !== 'block') return;
      if (e.key === 'Escape') cerrar();
      if (e.key === 'ArrowRight') mover(1);
      if (e.key === 'ArrowLeft') mover(-1);
    });
  }

  function pintar() {
    var m = medios[indice];
    if (!m) return;
    var cont = caja.querySelector('.visor-medio');

    if (m.tipo === 'video') {
      cont.innerHTML = '<video class="visor-video" controls autoplay muted loop playsinline' +
        (m.poster ? ' poster="' + esc(m.poster) + '"' : '') +
        '><source src="' + esc(m.src) + '"/></video>';
    } else {
      cont.innerHTML = '<img class="visor-img" alt="' + esc(proyecto.titulo) + '" src="' + esc(m.src) + '"/>';
    }

    var varios = medios.length > 1;
    caja.querySelector('.visor-prev').style.display = varios ? '' : 'none';
    caja.querySelector('.visor-sig').style.display = varios ? '' : 'none';
    caja.querySelector('.visor-cuenta').textContent = varios ? (indice + 1) + ' / ' + medios.length : '';

    var tiras = caja.querySelector('.visor-tiras');
    tiras.innerHTML = varios ? medios.map(function (x, i) {
      return '<button class="visor-tira' + (i === indice ? ' activa' : '') + '" data-i="' + i + '" ' +
        'aria-label="Medio ' + (i + 1) + '">' +
        '<img src="' + esc(x.poster || x.src) + '" alt=""/>' +
        (x.tipo === 'video' ? '<span class="material-symbols-outlined visor-tira-play">play_arrow</span>' : '') +
        '</button>';
    }).join('') : '';
    Array.prototype.forEach.call(tiras.querySelectorAll('.visor-tira'), function (b) {
      b.addEventListener('click', function () { indice = +b.dataset.i; pintar(); });
    });
  }

  function mover(paso) {
    if (medios.length < 2) return;
    indice = (indice + paso + medios.length) % medios.length;
    pintar();
  }

  function abrir(proyectos, i) {
    proyecto = proyectos[i];
    if (!proyecto) return;
    medios = (window.mediosDe ? window.mediosDe(proyecto) : [{ src: proyecto.imagen, tipo: 'imagen' }]);
    if (!medios.length) return;
    indice = 0;

    if (!caja) construir();
    caja.querySelector('.visor-cat').textContent = proyecto.categoria || '';
    caja.querySelector('.visor-titulo').textContent = proyecto.titulo || '';
    caja.querySelector('.visor-desc').textContent = proyecto.descripcion || '';

    var meta = [];
    if (proyecto.cliente) meta.push('CLIENTE: ' + proyecto.cliente);
    if (proyecto.fecha) meta.push('FECHA: ' + proyecto.fecha);
    if (proyecto.id) meta.push('ID: ' + proyecto.id);
    caja.querySelector('.visor-meta').textContent = meta.join('   ·   ');

    pintar();
    caja.style.display = 'block';
    document.body.style.overflow = 'hidden';
    caja.querySelector('.visor-cerrar').focus();
  }

  function cerrar() {
    if (!caja) return;
    var v = caja.querySelector('video');
    if (v) { try { v.pause(); } catch (e) {} }
    caja.style.display = 'none';
    document.body.style.overflow = '';
  }

  return { abrir: abrir, cerrar: cerrar };
})();

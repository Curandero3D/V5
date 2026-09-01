/* ============================================================
   MENÚ DESPLEGABLE (solo móvil)
   ------------------------------------------------------------
   El botón de las tres rayas abre y cierra la lista de enlaces.
   En escritorio ni el botón ni el menú se ven, así que este
   archivo no afecta nada ahí.
   ============================================================ */

(function () {
  'use strict';

  var boton = document.getElementById('btn-menu');
  var menu = document.getElementById('menu-movil');
  var icono = document.getElementById('icono-menu');
  if (!boton || !menu) return;

  function abrir(si) {
    menu.classList.toggle('abierto', si);
    boton.setAttribute('aria-expanded', si ? 'true' : 'false');
    if (icono) icono.textContent = si ? 'close' : 'menu';
  }

  boton.addEventListener('click', function () {
    abrir(!menu.classList.contains('abierto'));
  });

  // Al elegir una sección, el menú se cierra solo
  var enlaces = menu.getElementsByTagName('a');
  for (var i = 0; i < enlaces.length; i++) {
    enlaces[i].addEventListener('click', function () { abrir(false); });
  }

  // Cerrar al tocar fuera
  document.addEventListener('click', function (e) {
    if (!menu.contains(e.target) && !boton.contains(e.target)) abrir(false);
  });

  // Cerrar con la tecla Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') abrir(false);
  });

  // Si la pantalla se ensancha (girar el teléfono, cambiar de tamaño),
  // el menú se cierra para no quedar abierto en la vista de escritorio.
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) abrir(false);
  });
})();

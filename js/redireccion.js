/* ============================================================
   REDIRECCIÓN MÓVIL / ESCRITORIO
   ------------------------------------------------------------
   El sitio público (index.html) ahora es UNA SOLA PÁGINA que se
   adapta a cualquier pantalla mediante css/movil.css.
   Por eso ya NO se redirige a nadie desde index.html.

   Lo único que sigue activo es el panel de administración, que
   sí tiene dos versiones porque son interfaces muy distintas:
     - pantalla angosta -> movil-admin.html
     - pantalla ancha   -> admin.html

   Para forzar una versión concreta, agrega ?full a la dirección.
   ============================================================ */

(function () {
  var PAREJAS = {
    'admin.html':       'movil-admin.html',
    'movil-admin.html': 'admin.html'
  };

  if (location.search.indexOf('full') > -1) {
    try { sessionStorage.setItem('sinRedireccion', '1'); } catch (e) {}
    return;
  }
  try { if (sessionStorage.getItem('sinRedireccion')) return; } catch (e) {}

  var archivo = location.pathname.split('/').pop() || 'index.html';
  var destino = PAREJAS[archivo];
  if (!destino) return;                      // páginas públicas: nunca redirige

  var esMovil = window.matchMedia('(max-width: 767px)').matches;
  var esPagMovil = archivo.indexOf('movil-') === 0;
  if (esMovil === esPagMovil) return;

  location.replace(destino);
})();

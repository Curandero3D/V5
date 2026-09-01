/* ============================================================
   ACCESO AL PANEL DE ADMINISTRACIÓN
   ------------------------------------------------------------
   Hace dos cosas según dónde se cargue:

   1. En las páginas públicas: convierte el enlace discreto del
      pie en un candado que pide contraseña antes de entrar.

   2. En admin.html y movil-admin.html: si alguien llega por
      la dirección directa sin haber pasado el candado, tapa
      la página y pide la contraseña.

   La contraseña NO está escrita aquí: se guarda su huella
   digital (SHA-256). Aun así, esto no es seguridad de verdad
   —cualquier sitio sin servidor puede rodearse con
   conocimientos técnicos. Sirve para que un visitante casual
   no entre. Tu protección real es que sin la llave de GitHub
   nadie puede modificar el sitio publicado.

   PARA CAMBIAR LA CONTRASEÑA:
   abre la consola del navegador (tecla F12, pestaña Console),
   pega esto con tu contraseña nueva y presiona Enter:

     crypto.subtle.digest('SHA-256', new TextEncoder()
       .encode('lma-2026' + 'TU-NUEVA-CONTRASEÑA'))
       .then(b => console.log([...new Uint8Array(b)]
       .map(x => x.toString(16).padStart(2,'0')).join('')))

   Copia el resultado y reemplaza el valor de HUELLA aquí abajo.
   ============================================================ */

(function () {
  'use strict';

  var HUELLA = 'b734825098214d828110ae34af8bb8a3d5c78c6643c7bac913a3acf5dd0d6e9e';
  var SAL = 'lma-2026';
  var LLAVE_SESION = 'lma_acceso';
  var ES_PANEL = /admin\.html|movil-admin\.html/.test(location.pathname);

  /* ---------- Huella digital de un texto ---------- */
  async function huella(texto) {
    var datos = new TextEncoder().encode(SAL + texto);
    if (window.crypto && crypto.subtle) {
      var buf = await crypto.subtle.digest('SHA-256', datos);
      return [...new Uint8Array(buf)].map(function (b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
    }
    return null; // sin crypto (abierto como archivo suelto)
  }

  function autorizado() {
    try { return sessionStorage.getItem(LLAVE_SESION) === '1'; } catch (e) { return false; }
  }
  function autorizar() {
    try { sessionStorage.setItem(LLAVE_SESION, '1'); } catch (e) {}
  }

  /* ---------- Ventana de contraseña ---------- */
  function pedirClave(alAcertar, bloqueante) {
    var caja = document.createElement('div');
    caja.className = 'fixed inset-0 z-[90] flex items-center justify-center p-6';
    caja.style.background = bloqueante ? '#001F3F' : 'rgba(0,31,63,.55)';
    if (!bloqueante) caja.style.backdropFilter = 'blur(4px)';

    caja.innerHTML =
      '<div style="background:#fff;border:1px solid rgba(0,0,0,.12);max-width:380px;width:100%;font-family:Inter,system-ui,sans-serif">' +
        '<div style="padding:20px 24px;border-bottom:1px solid rgba(0,0,0,.1);display:flex;align-items:center;gap:10px">' +
          '<span class="material-symbols-outlined" style="color:#0056B3">lock</span>' +
          '<span style="font-weight:600;font-size:16px">Acceso restringido</span>' +
        '</div>' +
        '<div style="padding:24px">' +
          '<p style="font-size:13px;color:#4A4E69;margin:0 0 14px">Panel de administración del portafolio.</p>' +
          '<input id="lma-clave" type="password" autocomplete="current-password" placeholder="Contraseña" ' +
            'style="width:100%;padding:11px;border:1px solid rgba(0,0,0,.25);font-size:15px;font-family:inherit;box-sizing:border-box"/>' +
          '<p id="lma-error" style="color:#BA1A1A;font-size:12px;min-height:16px;margin:8px 0 0"></p>' +
        '</div>' +
        '<div style="padding:16px 24px;border-top:1px solid rgba(0,0,0,.1);background:#F8F9FA;display:flex;gap:10px;justify-content:flex-end">' +
          (bloqueante
            ? '<a href="index.html" style="padding:10px 18px;border:1px solid rgba(0,0,0,.2);font-size:11px;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;color:#4A4E69;font-family:\'JetBrains Mono\',monospace">Volver al sitio</a>'
            : '<button id="lma-cancelar" style="padding:10px 18px;border:1px solid rgba(0,0,0,.2);background:none;font-size:11px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;font-family:\'JetBrains Mono\',monospace;color:#4A4E69">Cancelar</button>') +
          '<button id="lma-entrar" style="padding:10px 18px;border:none;background:#0056B3;color:#fff;font-size:11px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;font-family:\'JetBrains Mono\',monospace">Entrar</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(caja);
    var campo = caja.querySelector('#lma-clave');
    var error = caja.querySelector('#lma-error');
    campo.focus();

    var intentos = 0;

    async function validar() {
      var h = await huella(campo.value);
      if (h === null) {
        error.textContent = 'Abre la página con Live Server, no con doble clic.';
        return;
      }
      if (h === HUELLA) {
        autorizar();
        caja.remove();
        alAcertar();
      } else {
        intentos++;
        error.textContent = intentos >= 3
          ? 'Contraseña incorrecta (' + intentos + ' intentos).'
          : 'Contraseña incorrecta.';
        campo.value = '';
        campo.focus();
      }
    }

    caja.querySelector('#lma-entrar').addEventListener('click', validar);
    campo.addEventListener('keydown', function (e) { if (e.key === 'Enter') validar(); });
    var cancelar = caja.querySelector('#lma-cancelar');
    if (cancelar) cancelar.addEventListener('click', function () { caja.remove(); });
    if (!bloqueante) {
      caja.addEventListener('click', function (e) { if (e.target === caja) caja.remove(); });
    }
  }

  /* ---------- 1. Dentro del panel: candado de entrada ---------- */
  if (ES_PANEL) {
    if (!autorizado()) {
      // Oculta el contenido antes de que se alcance a leer
      var estilo = document.createElement('style');
      estilo.id = 'lma-tapa';
      estilo.textContent = 'body > *:not(#lma-tapa){visibility:hidden !important}';
      document.head.appendChild(estilo);

      var arrancar = function () {
        pedirClave(function () {
          var t = document.getElementById('lma-tapa');
          if (t) t.remove();
        }, true);
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', arrancar);
      } else { arrancar(); }
    }
    return;
  }

  /* ---------- 2. Páginas públicas: el enlace del pie ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    var enlaces = document.querySelectorAll('[data-panel]');
    for (var i = 0; i < enlaces.length; i++) {
      (function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          var destino = a.getAttribute('href');
          if (autorizado()) { location.href = destino; return; }
          pedirClave(function () { location.href = destino; }, false);
        });
      })(enlaces[i]);
    }
  });
})();

/* ============================================================
   FORMULARIO DE CONTACTO
   ------------------------------------------------------------
   El sitio no tiene servidor, así que el formulario arma un
   correo con los datos capturados y abre el programa de correo
   del visitante con todo listo para enviar.

   Si más adelante quieres que llegue solo, sin abrir el correo,
   se puede conectar a Web3Forms o Formspree (planes gratuitos):
   basta cambiar la función enviar() por un fetch al endpoint.
   ============================================================ */

(function () {
  'use strict';

  const DESTINO = 'immer88@outlook.com';
  const boton = document.getElementById('btn-enviar-form');
  if (!boton) return;

  const formulario = boton.closest('form') || document;

  function campo(etiquetas) {
    const inputs = [...formulario.querySelectorAll('input, textarea')];
    for (const et of etiquetas) {
      const hit = inputs.find((i) =>
        ((i.placeholder || '') + ' ' + (i.name || '') + ' ' + (i.id || ''))
          .toLowerCase().includes(et)
      );
      if (hit) return hit;
    }
    return null;
  }

  const refs = {
    nombre:  campo(['nombre']),
    empresa: campo(['empresa']),
    correo:  campo(['correo', 'email', 'mail']),
    tel:     campo(['tel', 'phone']),
    mensaje: formulario.querySelector('textarea')
  };

  function aviso(texto) {
    let c = document.getElementById('aviso-contacto');
    if (!c) {
      c = document.createElement('p');
      c.id = 'aviso-contacto';
      c.className = 'font-body-md text-sm mt-sm text-error';
      boton.parentNode.insertBefore(c, boton.nextSibling);
    }
    c.textContent = texto;
  }

  boton.addEventListener('click', function (e) {
    e.preventDefault();

    const v = (r) => (r && r.value ? r.value.trim() : '');
    const nombre = v(refs.nombre);
    const correo = v(refs.correo);

    if (!nombre) { aviso('Escribe tu nombre para poder responderte.'); return; }
    if (!correo || correo.indexOf('@') < 1) {
      aviso('Revisa el correo electrónico: parece incompleto.'); return;
    }
    aviso('');

    const cuerpo = [
      'Nombre: ' + nombre,
      'Empresa: ' + (v(refs.empresa) || '—'),
      'Correo: ' + correo,
      'Teléfono: ' + (v(refs.tel) || '—'),
      '',
      'Mensaje:',
      v(refs.mensaje) || '(sin mensaje)'
    ].join('\n');

    const url = 'mailto:' + DESTINO +
      '?subject=' + encodeURIComponent('Solicitud desde el sitio — ' + nombre) +
      '&body=' + encodeURIComponent(cuerpo);

    window.location.href = url;

    // Respaldo: si no hay programa de correo configurado, ofrece WhatsApp.
    setTimeout(function () {
      if (!document.hidden) {
        if (confirm('¿No se abrió tu programa de correo?\n\nAceptar para enviarlo por WhatsApp.')) {
          window.open('https://wa.me/524772259654?text=' + encodeURIComponent(cuerpo), '_blank');
        }
      }
    }, 1800);
  });
})();

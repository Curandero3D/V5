/* ============================================================
   PROCESAMIENTO DE MEDIOS EN EL NAVEGADOR
   ------------------------------------------------------------
   Comprime fotos y convierte videos ANTES de subirlos, sin
   servidor y sin instalar nada. Todo ocurre en tu computadora.

   FOTOS
     Se redimensionan a 1600px máximo y se convierten a WebP.
     Una foto de celular de 5 MB queda en 200-350 KB.

   VIDEOS
     Se reproducen internamente, se dibujan cuadro por cuadro en
     un lienzo a menor resolución, y se vuelven a grabar con el
     códec moderno del navegador (MP4/H.264 o WebM/VP9).
     Se quita el audio, que no aporta nada en un portafolio y
     pesa. Un clip de 10 s de 40 MB queda en unos 600 KB.

     La conversión ocurre en tiempo real: un video de 12 s tarda
     unos 12 s en convertirse. Por eso hay un límite de duración.
   ============================================================ */

window.Medios = (function () {
  'use strict';

  var MAX_IMG = 1600;          // píxeles del lado mayor de una foto
  var MAX_SEGUNDOS = 180;      // 3 minutos
  var MAX_SALIDA_MB = 20;      // Cloudflare rechaza archivos de más de 25 MB

  /* La calidad se ajusta sola según la duración, para que un video
     largo no termine pesando 30 MB. Los números salen de mantener
     el archivo final por debajo de ~14 MB en el peor caso. */
  function perfilDe(segundos) {
    if (segundos <= 20)  return { ancho: 960, bitrate: 1400000, nombre: 'alta' };
    if (segundos <= 45)  return { ancho: 854, bitrate: 1000000, nombre: 'buena' };
    if (segundos <= 90)  return { ancho: 768, bitrate:  800000, nombre: 'media' };
    return                      { ancho: 640, bitrate:  600000, nombre: 'ligera' };
  }

  function leerComoDataUrl(archivo) {
    return new Promise(function (resolver, rechazar) {
      var lector = new FileReader();
      lector.onerror = function () { rechazar(new Error('No se pudo leer el archivo.')); };
      lector.onload = function () { resolver(lector.result); };
      lector.readAsDataURL(archivo);
    });
  }

  /* ---------------- FOTOS ---------------- */
  function comprimirImagen(archivo) {
    return leerComoDataUrl(archivo).then(function (dataUrl) {
      return new Promise(function (resolver, rechazar) {
        var img = new Image();
        img.onerror = function () { rechazar(new Error('El archivo no parece ser una imagen.')); };
        img.onload = function () {
          var an = img.width, al = img.height;
          if (an > MAX_IMG || al > MAX_IMG) {
            var f = Math.min(MAX_IMG / an, MAX_IMG / al);
            an = Math.round(an * f); al = Math.round(al * f);
          }
          var lienzo = document.createElement('canvas');
          lienzo.width = an; lienzo.height = al;
          lienzo.getContext('2d').drawImage(img, 0, 0, an, al);

          var salida, ext;
          try {
            salida = lienzo.toDataURL('image/webp', 0.82);
            ext = 'webp';
            if (salida.indexOf('image/webp') === -1) throw new Error('sin webp');
          } catch (e) {
            salida = lienzo.toDataURL('image/jpeg', 0.85);
            ext = 'jpg';
          }
          resolver({
            tipo: 'imagen', dataUrl: salida, base64: salida.split(',')[1],
            ext: ext, an: an, al: al, kb: Math.round(salida.length * 3 / 4 / 1024)
          });
        };
        img.src = dataUrl;
      });
    });
  }

  /* ---------------- VIDEOS ---------------- */
  function formatoDisponible() {
    if (typeof MediaRecorder === 'undefined') return null;
    var opciones = [
      { mime: 'video/mp4;codecs=avc1.42E01E', ext: 'mp4' },
      { mime: 'video/mp4', ext: 'mp4' },
      { mime: 'video/webm;codecs=vp9', ext: 'webm' },
      { mime: 'video/webm;codecs=vp8', ext: 'webm' },
      { mime: 'video/webm', ext: 'webm' }
    ];
    for (var i = 0; i < opciones.length; i++) {
      if (MediaRecorder.isTypeSupported(opciones[i].mime)) return opciones[i];
    }
    return null;
  }

  var cancelado = false;
  function cancelar() { cancelado = true; }

  function convertirVideo(archivo, alProgreso) {
    var formato = formatoDisponible();
    if (!formato) {
      return Promise.reject(new Error(
        'Este navegador no puede convertir video. Usa Chrome o Edge, o sube una foto.'));
    }
    cancelado = false;

    return new Promise(function (resolver, rechazar) {
      var url = URL.createObjectURL(archivo);
      var video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';

      var limpiar = function () { try { URL.revokeObjectURL(url); } catch (e) {} };
      var fallar = function (msg) { limpiar(); rechazar(new Error(msg)); };

      video.onerror = function () {
        fallar('No se pudo leer el video. Prueba con un archivo MP4 o MOV.');
      };

      video.onloadedmetadata = function () {
        if (!video.duration || !isFinite(video.duration)) {
          fallar('El video no tiene duración válida.'); return;
        }
        if (video.duration > MAX_SEGUNDOS + 0.5) {
          var m = Math.floor(video.duration / 60), sg = Math.round(video.duration % 60);
          fallar('El video dura ' + m + ':' + (sg < 10 ? '0' : '') + sg +
                 '. El máximo es 3:00. Recórtalo antes de subirlo.');
          return;
        }

        var perfil = perfilDe(video.duration);
        var an = video.videoWidth, al = video.videoHeight;
        if (!an || !al) { fallar('El video no tiene imagen.'); return; }
        if (an > perfil.ancho) {
          var f = perfil.ancho / an;
          an = Math.round(an * f / 2) * 2;   // par: algunos códecs lo exigen
          al = Math.round(al * f / 2) * 2;
        }

        var lienzo = document.createElement('canvas');
        lienzo.width = an; lienzo.height = al;
        var ctx = lienzo.getContext('2d');

        var flujo = lienzo.captureStream(30);
        var grabadora;
        try {
          grabadora = new MediaRecorder(flujo, {
            mimeType: formato.mime, videoBitsPerSecond: perfil.bitrate
          });
        } catch (e) {
          fallar('No se pudo iniciar la conversión: ' + e.message); return;
        }

        var trozos = [];
        var poster = null;
        var terminado = false;
        grabadora.ondataavailable = function (e) { if (e.data && e.data.size) trozos.push(e.data); };

        grabadora.onstop = function () {
          limpiar();
          if (cancelado) { rechazar(new Error('Conversión cancelada.')); return; }
          var blob = new Blob(trozos, { type: formato.mime.split(';')[0] });
          var mb = blob.size / 1048576;
          if (mb > MAX_SALIDA_MB) {
            rechazar(new Error('El video convertido pesa ' + mb.toFixed(1) +
              ' MB y el máximo permitido es ' + MAX_SALIDA_MB +
              ' MB. Recórtalo o reduce su resolución antes de subirlo.'));
            return;
          }
          var lector = new FileReader();
          lector.onload = function () {
            resolver({
              tipo: 'video',
              dataUrl: lector.result,
              base64: String(lector.result).split(',')[1],
              ext: formato.ext,
              poster: poster,
              an: an, al: al,
              calidad: perfil.nombre,
              segundos: Math.round(video.duration * 10) / 10,
              kb: Math.round(blob.size / 1024)
            });
          };
          lector.onerror = function () { rechazar(new Error('No se pudo empaquetar el video.')); };
          lector.readAsDataURL(blob);
        };

        var detener = function () {
          if (terminado) return;
          terminado = true;
          if (grabadora.state !== 'inactive') grabadora.stop();
        };

        var informar = function () {
          if (!alProgreso || !video.duration) return;
          var pct = Math.min(99, Math.round(video.currentTime / video.duration * 100));
          var faltan = Math.max(0, Math.ceil(video.duration - video.currentTime));
          alProgreso(pct, faltan, perfil.nombre);
        };

        var capturar = function () {
          if (terminado) return;
          if (cancelado) { detener(); return; }
          ctx.drawImage(video, 0, 0, an, al);
          if (!poster) {
            try { poster = lienzo.toDataURL('image/webp', 0.8); }
            catch (e) { poster = lienzo.toDataURL('image/jpeg', 0.85); }
          }
          informar();
        };

        /* requestVideoFrameCallback se dispara con cada cuadro real del
           video, no con el refresco de pantalla. Eso evita que la
           conversión se frene si la pestaña pasa a segundo plano, que es
           lo que ocurría con requestAnimationFrame en videos largos. */
        var usarRVFC = typeof video.requestVideoFrameCallback === 'function';
        var bucle = function () {
          if (video.ended || video.paused || terminado) { detener(); return; }
          capturar();
          if (usarRVFC) video.requestVideoFrameCallback(bucle);
          else requestAnimationFrame(bucle);
        };

        /* Red de seguridad: si el navegador congela el bucle anterior
           (pestaña oculta mucho tiempo), este temporizador sigue
           capturando, aunque a menor ritmo. */
        var respaldo = setInterval(function () {
          if (terminado) { clearInterval(respaldo); return; }
          if (video.ended) { clearInterval(respaldo); detener(); return; }
          capturar();
        }, 1000);

        video.onended = function () {
          clearInterval(respaldo);
          if (alProgreso) alProgreso(100, 0, perfil.nombre);
          detener();
        };

        grabadora.start(1000);
        video.play().then(bucle).catch(function (e) {
          clearInterval(respaldo);
          fallar('El navegador bloqueó la reproducción: ' + e.message);
        });
      };

      video.src = url;
    });
  }

  /* ---------------- Entrada única ---------------- */
  function procesar(archivo, alProgreso) {
    if (/^image\//.test(archivo.type)) {
      if (archivo.type === 'image/gif') {
        // Un GIF pasado por lienzo perdería la animación: se avisa.
        return Promise.reject(new Error(
          'Los GIF animados perderían el movimiento al comprimirse. Súbelo como video (MP4) y se convierte solo.'));
      }
      return comprimirImagen(archivo);
    }
    if (/^video\//.test(archivo.type)) return convertirVideo(archivo, alProgreso);
    return Promise.reject(new Error('Formato no admitido. Usa una foto (JPG, PNG, WebP) o un video (MP4, MOV).'));
  }

  /* Estimación previa, para avisar antes de empezar. */
  function estimar(segundos) {
    var p = perfilDe(segundos);
    return {
      mb: Math.round(p.bitrate * segundos / 8 / 1048576 * 10) / 10,
      calidad: p.nombre,
      ancho: p.ancho,
      espera: Math.ceil(segundos)
    };
  }

  return {
    procesar: procesar,
    cancelar: cancelar,
    estimar: estimar,
    perfilDe: perfilDe,
    comprimirImagen: comprimirImagen,
    convertirVideo: convertirVideo,
    formatoDisponible: formatoDisponible,
    MAX_SEGUNDOS: MAX_SEGUNDOS,
    MAX_SALIDA_MB: MAX_SALIDA_MB
  };
})();

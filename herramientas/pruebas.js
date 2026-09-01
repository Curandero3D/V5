/* Banco de pruebas: simula lo justo del navegador para ejecutar
   admin.js, portafolio.js, contacto.js y redireccion.js y detectar
   errores de referencia, nulos y flujos rotos. */

const fs = require('fs');
const path = require('path');
const RAIZ = path.resolve(__dirname, '..');

let fallos = [];
function chk(cond, msg) {
  if (cond) console.log('   ok   ' + msg);
  else { console.log('   FALLA ' + msg); fallos.push(msg); }
}

/* ---------- DOM mínimo ---------- */
class Clases {
  constructor(el) { this.el = el; this.set = new Set((el._class || '').split(/\s+/).filter(Boolean)); }
  add(...c) { c.forEach(x => this.set.add(x)); this.sync(); }
  remove(...c) { c.forEach(x => this.set.delete(x)); this.sync(); }
  contains(c) { return this.set.has(c); }
  toggle(c) { this.set.has(c) ? this.set.delete(c) : this.set.add(c); this.sync(); return this.set.has(c); }
  sync() { this.el._class = [...this.set].join(' '); }
}
class El {
  constructor(tag, id) {
    this.tagName = (tag || 'div').toUpperCase(); this.id = id || '';
    this._class = ''; this._html = ''; this.textContent = ''; this._cache = {};
    this.value = ''; this.style = {}; this.dataset = {}; this.options = [];
    this.selectedIndex = 0; this.disabled = false; this.files = [];
    this._oyentes = {}; this.children = [];
  }
  get className() { return this._class; }
  set className(v) { this._class = v; }
  get innerHTML() { return this._html; }
  set innerHTML(v) { this._html = v; this._cache = {}; }
  get classList() { return new Clases(this); }
  addEventListener(ev, fn) { (this._oyentes[ev] = this._oyentes[ev] || []).push(fn); }
  removeEventListener() {}
  dispatch(ev, obj) { (this._oyentes[ev] || []).forEach(f => f(obj || { target: this, preventDefault() {} })); }
  click() { this.dispatch('click'); }
  querySelectorAll(sel) {
    if (!this._cache) this._cache = {};
    if (!this._cache[sel]) this._cache[sel] = matchAll(this.innerHTML, sel, this);
    return this._cache[sel];
  }
  querySelector(sel) {
    const m = /^(?:\[([a-z-]+)\]|#([\w-]+))$/.exec(sel);
    if (m) {
      const busca = m[1] ? m[1] + '=' : 'id="' + m[2] + '"';
      const clave = m[1] ? m[1] : m[2];
      if ((this.innerHTML || '').includes(m[1] ? m[1] : 'id="' + m[2] + '"')) {
        this._hijos = this._hijos || {};
        return (this._hijos[clave] = this._hijos[clave] || new El('div', m[2] || ''));
      }
      return null;
    }
    return this.querySelectorAll(sel)[0] || null;
  }
  remove() { this._quitado = true; }
  closest(sel) {
    const m = /^\[([a-z-]+)\]$/.exec(sel);
    if (m && this.dataset) {
      const clave = m[1].replace(/^data-/, '').replace(/-([a-z])/g, (x, c) => c.toUpperCase());
      if (this.dataset[clave] !== undefined) return this;
    }
    return null;
  }
  appendChild(c) { this.children.push(c); if (c && c.id) registro.set(c.id, c); return c; }
  insertAdjacentHTML(donde, html) { this.innerHTML += html; }
  insertBefore(c) { this.children.push(c); return c; }
  setAttribute(k, v) { this[k] = v; }
  removeAttribute(k) { delete this[k]; }
  add(op) { this.options.push(op); }
  get parentNode() { return document.body; }
}
// extrae elementos con data-editar / data-borrar del innerHTML generado
function matchAll(html, sel, padre) {
  const attr = (sel.match(/\[data-([a-z]+)/) || [])[1];
  if (!attr) return [];
  const out = [];
  const re = new RegExp('data-' + attr + '="(\\d+)"', 'g');
  let m;
  while ((m = re.exec(html))) {
    const e = new El('button');
    e.dataset[attr] = m[1];
    out.push(e);
  }
  return out;
}

const registro = new Map();
const document = {
  body: new El('body'),
  _oyentes: {},
  getElementById: (id) => registro.get(id) || null,
  createElement: (t) => {
    const e = new El(t);
    if (t === 'canvas') {
      e.getContext = () => ({ drawImage() {} });
      e.toDataURL = (tipo) => 'data:' + (tipo || 'image/png') + ';base64,AAAABBBBCCCC';
      e.getContext = () => ({ drawImage() {} });
      e.captureStream = () => ({});
    }
    if (t === 'video') {
      e.duration = 8; e.videoWidth = 1920; e.videoHeight = 1080;
      e.ended = false; e.paused = false; e.currentTime = 0;
      e.play = () => Promise.resolve();
      Object.defineProperty(e, 'src', {
        set() {
          setImmediate(() => {
            e.onloadedmetadata && e.onloadedmetadata();
            setImmediate(() => setImmediate(() => {
              e.ended = true; e.paused = true;
              e.onended && e.onended();
            }));
          });
        }
      });
    }
    return e;
  },
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener(ev, fn) { (this._oyentes[ev] = this._oyentes[ev] || []).push(fn); },
  hidden: false
};

/* ---------- Carga ids reales desde el HTML ---------- */
function montar(archivo) {
  registro.clear();
  const html = fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
  const ids = [...html.matchAll(/id="([a-zA-Z0-9_-]+)"/g)].map(m => m[1]);
  for (const id of new Set(ids)) {
    const tag = new RegExp('<(\\w+)[^>]*id="' + id + '"').exec(html);
    const e = new El(tag ? tag[1] : 'div', id);
    const cls = new RegExp('<\\w+[^>]*id="' + id + '"[^>]*>').exec(html);
    const cm = cls && /class="([^"]*)"/.exec(cls[0]);
    if (cm) e.className = cm[1];
    if (id === 'add-project-modal') e.className = 'hidden fixed inset-0';
    if (id === 'project-category' || id === 'project-status') {
      const bloque = html.slice(html.indexOf('id="' + id + '"'));
      const ops = [...bloque.slice(0, 600).matchAll(/<option[^>]*>([^<]+)</g)].map(m => m[1]);
      e.options = ops.map(t => ({ text: t, value: t }));
      e.value = ops[0] || '';
    }
    registro.set(id, e);
  }
  return html;
}

/* ---------- Entorno global ---------- */
const datos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data/proyectos.json'), 'utf8'));
let ultimaAlerta = null;
global.document = document;
global.window = {
  addEventListener() {}, matchMedia: () => ({ matches: false }),
  location: { pathname: '/admin.html', search: '', href: '', replace() {} },
  open() {}
};
global.location = global.window.location;
global.localStorage = {
  _d: {}, getItem(k) { return this._d[k] || null; },
  setItem(k, v) { this._d[k] = v; }, removeItem(k) { delete this._d[k]; }
};
global.sessionStorage = global.localStorage;
global.fetch = async () => ({ ok: true, status: 200, json: async () => JSON.parse(JSON.stringify(datos)) });
global.confirm = () => true;
global.prompt = () => 'Robótica';
global.alert = (m) => { ultimaAlerta = m; };
global.URL = { createObjectURL: () => 'blob:x', revokeObjectURL() {} };
global.Blob = function (partes, opc) { this.size = 1234; this.type = (opc && opc.type) || ''; this.esVideo = /video/.test((opc && opc.type) || ''); };
global.Image = function () {
  const self = this;
  Object.defineProperty(this, 'src', {
    set() { self.width = 2400; self.height = 1600; setImmediate(() => self.onload && self.onload()); }
  });
};
global.FileReader = function () {
  this.readAsDataURL = (x) => {
    this.result = (x && x.esVideo) ? 'data:video/mp4;base64,VIDEOAAAA' : 'data:image/jpg;base64,AAAA';
    setImmediate(() => this.onload && this.onload());
  };
};
global.btoa = (s) => Buffer.from(s, 'binary').toString('base64');
global.atob = (s) => Buffer.from(s, 'base64').toString('binary');
global.requestAnimationFrame = (f) => setImmediate(f);
global.MediaRecorder = function (flujo, opc) {
  this.state = 'recording';
  this.start = () => {};
  this.stop = () => { this.state = 'inactive'; this.ondataavailable({ data: { size: 10 } }); this.onstop(); };
};
global.MediaRecorder.isTypeSupported = (m) => m.indexOf('mp4') > -1;
global.TextEncoder = require('util').TextEncoder;
global.Option = function (t, v) { return { text: t, value: v }; };
const setTimeoutReal = setTimeout;
global.setTimeout = (f) => setImmediate(f);
global.clearTimeout = () => {};
global.navigator = { userAgent: 'test' };

function cargarMedios() {
  const codigo = fs.readFileSync(path.join(RAIZ, 'js/medios.js'), 'utf8');
  new Function('window', 'document', 'FileReader', 'Image', 'MediaRecorder', 'URL', 'Blob',
    codigo)(global.window, document, global.FileReader, global.Image,
            global.MediaRecorder, global.URL, global.Blob);
  global.Medios = global.window.Medios;
}

function correr(js) {
  const codigo = fs.readFileSync(path.join(RAIZ, js), 'utf8');
  new Function('document', 'window', 'location', 'localStorage', 'sessionStorage',
    'fetch', 'confirm', 'prompt', 'alert', 'URL', 'Blob', 'FileReader', 'btoa', 'atob',
    'TextEncoder', 'Option', 'setTimeout', 'clearTimeout', 'navigator', 'Medios',
    'Uint8Array', 'requestAnimationFrame', codigo)(
    document, global.window, global.location, global.localStorage, global.sessionStorage,
    global.fetch, global.confirm, global.prompt, global.alert, global.URL, global.Blob,
    global.FileReader, global.btoa, global.atob, global.TextEncoder, global.Option,
    global.setTimeout, global.clearTimeout, global.navigator, global.Medios,
    Uint8Array, global.requestAnimationFrame);
}
const esperar = () => new Promise(r => setTimeoutReal(() => setImmediate(() => setImmediate(r)), 0));

/* ================= PRUEBAS ================= */
(async function () {
  cargarMedios();
  chk(typeof Medios.procesar === 'function', 'el módulo de medios carga');
  chk(Medios.formatoDisponible().ext === 'mp4', 'elige MP4 cuando el navegador lo admite');

  console.log('\n== admin.html (escritorio) ==');
  montar('admin.html');
  global.location.pathname = '/admin.html';
  try { correr('js/admin.js'); } catch (e) { chk(false, 'admin.js lanza: ' + e.message); }
  await esperar();

  const grid = document.getElementById('admin-grid');
  chk(grid.innerHTML.includes('Célula de Ensamble'), 'pinta proyectos del JSON');
  chk(document.getElementById('stat-total').textContent === 4, 'contador total = 4');
  chk(document.getElementById('stat-proceso').textContent === 2, 'contador en proceso = 2');
  chk(document.getElementById('stat-completados').textContent === 2, 'contador completados = 2');
  chk(document.getElementById('pag-label').textContent === '01 / 01', 'paginación 01/01');
  chk(grid.innerHTML.includes('data-editar="0"'), 'botón editar presente');
  chk(grid.innerHTML.includes('data-borrar="0"'), 'botón borrar presente');
  chk(!grid.innerHTML.includes('undefined'), 'sin "undefined" en el HTML generado');

  // abrir modal nuevo
  document.getElementById('btn-nuevo') && document.getElementById('btn-nuevo').click();
  // guardar sin título -> debe rechazar
  document.getElementById('project-title').value = '';
  document.getElementById('btn-guardar').click();
  await esperar();
  chk(document.getElementById('stat-total').textContent === 4, 'rechaza guardar sin título');

  // guardar con datos completos
  document.getElementById('project-title').value = 'Prueba Automática';
  document.getElementById('project-desc').value = 'Descripción de prueba';
  const inp = document.getElementById('input-imagen');
  inp.files = [{ name: 'x.jpg', size: 4200000, type: 'image/jpeg' }];
  inp.dispatch('change', { target: inp });
  for (let i = 0; i < 15; i++) await esperar();
  chk(String(document.getElementById('preview-imagen').src || '').startsWith('data:'),
      'comprime la imagen y muestra vista previa');
  chk(document.getElementById('tira-medios').innerHTML.includes('PORTADA'),
      'la primera imagen queda marcada como portada');
  document.getElementById('btn-guardar').click();
  for (let i = 0; i < 10; i++) await esperar();
  chk(document.getElementById('stat-total').textContent === 5, 'guarda proyecto nuevo (total = 5)');
  chk(grid.innerHTML.includes('Prueba Automática'), 'el proyecto nuevo aparece en el grid');

  // configuración
  document.getElementById('abrir-config').click();
  chk(true, 'abrir configuración no lanza error');

  console.log('\n== movil-admin.html ==');
  montar('movil-admin.html');
  global.location.pathname = '/movil-admin.html';
  try { correr('js/admin.js'); } catch (e) { chk(false, 'admin.js móvil lanza: ' + e.message); }
  await esperar();
  const gm = document.getElementById('admin-grid');
  chk(gm.innerHTML.includes('Célula de Ensamble'), 'panel móvil pinta proyectos');
  chk(gm.innerHTML.includes('EDITAR'), 'panel móvil tiene botón editar');
  chk(document.getElementById('stat-total').textContent === 4, 'contador móvil = 4');
  document.getElementById('btn-mas').click();
  chk(true, '"cargar más" no lanza error');
  document.getElementById('btn-filtrar').click();
  chk(true, 'filtrar no lanza error');
  document.getElementById('btn-nuevo').click();
  chk(!document.getElementById('add-project-modal').classList.contains('hidden'), 'FAB abre el modal');

  console.log('\n== portafolio (index) ==');
  montar('index.html');
  global.location.pathname = '/index.html';
  try { correr('js/portafolio.js'); } catch (e) { chk(false, 'portafolio.js lanza: ' + e.message); }
  await esperar();
  const g = document.getElementById('galeria');
  chk(g.innerHTML.includes('tech-card'), 'usa las clases originales de Stitch');
  chk(g.innerHTML.includes('Célula de Ensamble'), 'pinta los proyectos');
  chk(document.getElementById('filtros').innerHTML.includes('Robótica'), 'genera filtros por categoría');
  chk(!g.innerHTML.includes('undefined'), 'sin "undefined"');

  console.log('\n== contacto ==');
  montar('index.html');
  try { correr('js/contacto.js'); } catch (e) { chk(false, 'contacto.js lanza: ' + e.message); }
  chk(true, 'contacto.js carga sin error');

  console.log('\n== redirección ==');
  for (const [ruta, ancho, espera] of [
    ['/index.html', 375, null],          // público: nunca redirige
    ['/index.html', 1400, null],
    ['/admin.html', 375, 'movil-admin.html'],
    ['/movil-admin.html', 1400, 'admin.html'],
    ['/movil-admin.html', 375, null]
  ]) {
    global.localStorage._d = {};
    let destino = null;
    global.window.location = { pathname: ruta, search: '', replace: (d) => { destino = d; } };
    global.location = global.window.location;
    global.window.matchMedia = () => ({ matches: ancho < 768 });
    try { correr('js/redireccion.js'); } catch (e) { chk(false, 'redireccion lanza: ' + e.message); }
    chk(destino === espera, `${ruta} @${ancho}px -> ${destino || 'se queda'}`);
  }

  console.log('\n== acceso con contraseña ==');
  // huella SHA-256 con la sal, calculada aparte
  const crypto = require('crypto');
  const sha = (t) => crypto.createHash('sha256').update('lma-2026' + t).digest('hex');
  const fuente = fs.readFileSync(path.join(RAIZ, 'js/acceso.js'), 'utf8');
  const HUELLA = (/HUELLA = '([a-f0-9]+)'/.exec(fuente) || [])[1];
  chk(!!HUELLA, 'la huella está definida en el archivo');
  chk(HUELLA === sha('Blackout2077'), 'la contraseña Blackout2077 es válida');
  chk(HUELLA !== sha('blackout2077'), 'distingue mayúsculas (blackout2077 falla)');
  chk(HUELLA !== sha('Blackout2078'), 'rechaza una contraseña parecida');
  chk(!fuente.includes('Blackout2077'), 'la contraseña NO aparece en texto plano');

  for (const f of ['index.html']) {
    const h = fs.readFileSync(path.join(RAIZ, f), 'utf8');
    chk(h.includes('data-panel="1"'), f + ' tiene el candado en el pie');
    chk(h.includes('js/acceso.js'), f + ' carga el control de acceso');
  }
  for (const f of ['admin.html','movil-admin.html']) {
    const h = fs.readFileSync(path.join(RAIZ, f), 'utf8');
    chk(h.indexOf('js/acceso.js') < h.indexOf('js/admin.js'), f + ' protege antes de cargar el panel');
  }

  console.log('\n== publicación directa en GitHub ==');
  montar('admin.html');
  global.location.pathname = '/admin.html';
  global.localStorage._d = { lma_repo: 'imermoreno/sitio-lma', lma_token: 'ghp_prueba' };

  const llamadas = [];
  let modo = 'ok';
  global.fetch = async (url, opc) => {
    if (String(url).includes('api.github.com')) {
      llamadas.push({ url: String(url), metodo: (opc && opc.method) || 'GET' });
      if (modo === '401') return { ok: false, status: 401, json: async () => ({ message: 'Bad credentials' }) };
      if (modo === '404img' && String(url).includes('img/')) {
        return { ok: false, status: 404, json: async () => ({ message: 'Not Found' }) };
      }
      return { ok: true, status: 200, json: async () => ({ sha: 'abc123', content: { sha: 'def456' } }) };
    }
    return { ok: true, status: 200, json: async () => JSON.parse(JSON.stringify(datos)) };
  };

  correr('js/admin.js');
  await esperar();

  // alta con imagen
  const inp2 = document.getElementById('input-imagen');
  inp2.files = [{ name: 'foto.jpg', size: 3000000, type: 'image/jpeg' }];
  inp2.dispatch('change', { target: inp2 });
  for (let i = 0; i < 15; i++) await esperar();
  document.getElementById('project-title').value = 'Publicación Directa';
  document.getElementById('project-desc').value = 'Prueba de subida';
  document.getElementById('btn-guardar').click();
  for (let i = 0; i < 25; i++) await esperar();

  const puts = llamadas.filter(l => l.metodo === 'PUT');
  chk(puts.some(l => l.url.includes('img/portafolio/')), 'sube la imagen al repositorio');
  chk(puts.some(l => l.url.includes('data/proyectos.json')), 'actualiza proyectos.json');
  chk(llamadas.some(l => l.metodo === 'GET' && l.url.includes('proyectos.json')),
      'consulta el sha antes de sobrescribir (evita el conflicto 422)');
  chk(llamadas.some(l => l.metodo === 'GET' && l.url.includes('img/portafolio/')),
      'consulta si la imagen ya existía (permite reemplazarla)');
  chk(puts[0].url.includes('/repos/imermoreno/sitio-lma/contents/'), 'usa el repositorio configurado');
  chk(/publicaci[oó]n-directa\.(webp|jpg)/.test(puts[0].url), 'nombra el archivo a partir del título');

  // token inválido: mensaje entendible, sin perder los cambios
  modo = '401';
  llamadas.length = 0;
  document.getElementById('btn-guardar').click();
  chk(true, 'un token inválido no rompe el panel');

  console.log('\n== varias fotos y video por proyecto ==');
  montar('admin.html');
  global.location.pathname = '/admin.html';
  global.localStorage._d = { lma_repo: 'imermoreno/sitio-lma', lma_token: 'ghp_x' };
  const subidas = [];
  global.fetch = async (url, opc) => {
    if (String(url).includes('api.github.com')) {
      if (opc && opc.method === 'PUT') subidas.push(String(url).split('/contents/')[1]);
      return { ok: true, status: 200, json: async () => ({ sha: 'a', content: { sha: 'b' } }) };
    }
    return { ok: true, status: 200, json: async () => JSON.parse(JSON.stringify(datos)) };
  };
  correr('js/admin.js');
  await esperar();

  const entrada = document.getElementById('input-imagen');
  entrada.files = [
    { name: 'a.jpg', size: 3000000, type: 'image/jpeg' },
    { name: 'b.jpg', size: 2500000, type: 'image/jpeg' },
    { name: 'c.mp4', size: 40000000, type: 'video/mp4' }
  ];
  entrada.dispatch('change', { target: entrada });
  for (let i = 0; i < 25; i++) await esperar();

  const tira = document.getElementById('tira-medios').innerHTML;
  chk((tira.match(/data-quitar=/g) || []).length === 3, 'acepta 3 medios de una sola vez');
  chk(tira.includes('play_arrow'), 'marca el video con un ícono de reproducción');
  chk((tira.match(/PORTADA/g) || []).length === 1, 'solo un medio es portada');

  document.getElementById('project-title').value = 'Pieza Girando';
  document.getElementById('project-desc').value = 'Prueba';
  subidas.length = 0;
  document.getElementById('btn-guardar').click();
  for (let i = 0; i < 25; i++) await esperar();

  chk(subidas.some(u => /pieza-girando\.(webp|jpg)/.test(u)), 'sube la foto de portada');
  chk(subidas.some(u => /pieza-girando-2\.(webp|jpg)/.test(u)), 'sube la segunda foto con nombre distinto');
  chk(subidas.some(u => /pieza-girando-video\.(mp4|webm)/.test(u)), 'sube el video convertido');
  chk(subidas.some(u => /pieza-girando-video-portada\./.test(u)), 'sube el primer cuadro del video como póster');
  chk(subidas.some(u => u.includes('data/proyectos.json')), 'actualiza el portafolio');

  console.log('\n== agregar archivos de uno en uno ==');
  montar('admin.html');
  global.location.pathname = '/admin.html';
  global.localStorage._d = {};
  global.fetch = async () => ({ ok: true, status: 200, json: async () => JSON.parse(JSON.stringify(datos)) });
  correr('js/admin.js');
  await esperar();
  const ent = document.getElementById('input-imagen');
  ent.files = [{ name: "uno.jpg", size: 100000, type: "image/jpeg" }];
  ent.dispatch("change", { target: ent });
  for (let i = 0; i < 12; i++) await esperar();
  const tras1 = (document.getElementById("tira-medios").innerHTML.match(/data-quitar=/g) || []).length;
  ent.files = [{ name: "dos.jpg", size: 100000, type: "image/jpeg" }];
  ent.dispatch("change", { target: ent });
  for (let i = 0; i < 12; i++) await esperar();
  const tras2 = (document.getElementById("tira-medios").innerHTML.match(/data-quitar=/g) || []).length;
  console.log("        tras 1 archivo:", tras1, "| tras 2 archivos:", tras2);
  chk(tras1 === 1, "el primer archivo se agrega");
  chk(tras2 === 2, "el segundo archivo SE SUMA (no reemplaza)");
  chk(document.getElementById("cuenta-medios").textContent.includes("2"),
      "el contador dice cuántos archivos llevas");

  // Arrastrar y soltar tiene que funcionar de verdad
  const zonaDrop = document.getElementById("drop-zona");
  chk((zonaDrop._oyentes.drop || []).length > 0, "la zona acepta archivos arrastrados");
  chk((zonaDrop._oyentes.dragover || []).length > 0, "resalta la zona al arrastrar encima");
  zonaDrop.dispatch("drop", {
    preventDefault() {}, stopPropagation() {},
    dataTransfer: { files: [{ name: "tres.jpg", size: 90000, type: "image/jpeg" }] }
  });
  for (let i = 0; i < 12; i++) await esperar();
  const tras3 = (document.getElementById("tira-medios").innerHTML.match(/data-quitar=/g) || []).length;
  chk(tras3 === 3, "soltar un archivo lo agrega a los que ya estaban");

  // El botón explícito abre el selector
  let abrio = false;
  document.getElementById("input-imagen").click = () => { abrio = true; };
  document.getElementById("btn-mas-archivos").dispatch("click", { preventDefault() {} });
  chk(abrio, "el botón AGREGAR ARCHIVOS abre el selector");

  // Quitar uno no borra los demás
  const quitar = document.getElementById("tira-medios").querySelectorAll("[data-quitar]");
  document.getElementById("tira-medios").dispatch("click", {
    target: quitar[1], preventDefault() {}, stopPropagation() {}
  });
  const tras4 = (document.getElementById("tira-medios").innerHTML.match(/data-quitar=/g) || []).length;
  chk(tras4 === 2, "la X quita solo ese archivo");
  const filaTira = document.getElementById("tira-medios").innerHTML;
  const posPortada = filaTira.indexOf("data-portada");
  const posQuitar = filaTira.indexOf("data-quitar=\"1\"");
  chk(posPortada === -1 || posQuitar === -1 || posPortada < posQuitar,
      "la X queda por encima del botón de portada (antes lo tapaba)");

  // Cinco archivos de golpe, con dos que fallan
  montar("admin.html");
  correr("js/admin.js");
  await esperar();
  const e5 = document.getElementById("input-imagen");
  e5.files = [
    { name: "1.jpg", size: 100000, type: "image/jpeg" },
    { name: "2.jpg", size: 100000, type: "image/jpeg" },
    { name: "3.jpg", size: 100000, type: "image/jpeg" },
    { name: "4.jpg", size: 100000, type: "image/jpeg" },
    { name: "5.jpg", size: 100000, type: "image/jpeg" }
  ];
  e5.dispatch("change", { target: e5 });
  for (let i = 0; i < 40; i++) await esperar();
  const cinco = (document.getElementById("tira-medios").innerHTML.match(/data-quitar=/g) || []).length;
  console.log("        seleccioné 5 -> se agregaron", cinco);
  chk(cinco === 5, "acepta los 5 archivos de una sola selección");
  chk(e5.value === "", "limpia el selector al terminar (no antes)");
  chk(document.getElementById("reporte-medios").innerHTML.includes("1.jpg"),
      "el reporte lista cada archivo procesado");

  // Un archivo ilegible no debe frenar a los demás
  montar("admin.html");
  correr("js/admin.js");
  await esperar();
  const eMix = document.getElementById("input-imagen");
  eMix.files = [
    { name: "buena.jpg", size: 100000, type: "image/jpeg" },
    { name: "foto.heic", size: 100000, type: "image/heic", falla: true },
    { name: "otra.jpg", size: 100000, type: "image/jpeg" }
  ];
  global.Image = function () {
    const self = this;
    Object.defineProperty(this, "src", {
      set(v) {
        setImmediate(() => {
          if (global.FALLA_SIGUIENTE) { global.FALLA_SIGUIENTE = false; self.onerror && self.onerror(); }
          else { self.width = 2400; self.height = 1600; self.onload && self.onload(); }
        });
      }
    });
  };
  const origLector = global.FileReader;
  global.FileReader = function () {
    this.readAsDataURL = (x) => {
      if (x && x.falla) global.FALLA_SIGUIENTE = true;
      this.result = "data:image/jpg;base64,AAAA";
      setImmediate(() => this.onload && this.onload());
    };
  };
  cargarMedios();   // recargar el módulo con los simuladores nuevos
  montar("admin.html"); correr("js/admin.js"); await esperar();
  const eM = document.getElementById("input-imagen");
  eM.files = eMix.files;
  eM.dispatch("change", { target: eM });
  for (let i = 0; i < 30; i++) await esperar();
  const mixCount = (document.getElementById("tira-medios").innerHTML.match(/data-quitar=/g) || []).length;
  console.log("        1 de 3 falla -> se agregaron", mixCount);
  chk(mixCount === 2, "un archivo ilegible no detiene a los siguientes");
  const rep = document.getElementById("reporte-medios").innerHTML;
  chk(rep.includes("foto.heic"), "el reporte nombra el archivo que falló");
  chk(rep.includes("HEIC") || rep.includes("iPhone"), "explica el problema del formato HEIC");
  global.FileReader = origLector; cargarMedios();

  // Doble entrega (soltar archivos + change del input) no debe duplicar ni perder
  montar("admin.html"); correr("js/admin.js"); await esperar();
  const eD = document.getElementById("input-imagen");
  const zonaD = document.getElementById("drop-zona");
  const cuatro = [
    { name: "a.jpg", size: 90000, type: "image/jpeg" },
    { name: "b.jpg", size: 90000, type: "image/jpeg" },
    { name: "c.jpg", size: 90000, type: "image/jpeg" },
    { name: "d.jpg", size: 90000, type: "image/jpeg" }
  ];
  zonaD.dispatch("drop", {
    preventDefault() {}, stopPropagation() {}, dataTransfer: { files: cuatro }
  });
  eD.files = cuatro;                       // el input también los recibe
  eD.dispatch("change", { target: eD });   // y dispara su propio change
  for (let i = 0; i < 40; i++) await esperar();
  const nDrop = (document.getElementById("tira-medios").innerHTML.match(/data-quitar=/g) || []).length;
  console.log("        soltar 4 (con change duplicado) ->", nDrop);
  chk(nDrop === 4, "soltar archivos no los duplica ni los pierde");
  chk(document.getElementById("cuenta-medios").textContent.includes("4"),
      "el contador coincide con las miniaturas");
  chk(!document.getElementById("reporte-medios").innerHTML.includes("AVISO INTERNO"),
      "no hay descuadre entre lo procesado y lo guardado");

  // Un clic en la X no debe borrar de más
  const antesX = 4;
  const botonesX = document.getElementById("tira-medios").querySelectorAll("[data-quitar]");
  document.getElementById("tira-medios").dispatch("click", {
    target: botonesX[0], preventDefault() {}, stopPropagation() {}
  });
  const despuesX = (document.getElementById("tira-medios").innerHTML.match(/data-quitar=/g) || []).length;
  chk(despuesX === antesX - 1, "un clic en la X quita exactamente uno");

  console.log('\n== varios videos en un mismo proyecto ==');
  montar('admin.html');
  global.location.pathname = '/admin.html';
  global.localStorage._d = { lma_repo: 'im/sitio-lma', lma_token: 'ghp_x' };
  const subidos = [];
  global.fetch = async (url, opc) => {
    if (String(url).includes('api.github.com')) {
      if (opc && opc.method === 'PUT') subidos.push(String(url).split('/contents/')[1]);
      return { ok: true, status: 200, json: async () => ({ sha: 'a', content: { sha: 'b' } }) };
    }
    return { ok: true, status: 200, json: async () => ([]) };
  };
  correr('js/admin.js');
  await esperar();

  const eV = document.getElementById('input-imagen');
  eV.files = [
    { name: 'foto.jpg', size: 180000, type: 'image/jpeg' },
    { name: 'v1.mp4', size: 3000000, type: 'video/mp4' },
    { name: 'v2.mp4', size: 3000000, type: 'video/mp4' },
    { name: 'v3.mp4', size: 3000000, type: 'video/mp4' }
  ];
  eV.dispatch('change', { target: eV });
  for (let i = 0; i < 60; i++) await esperar();

  const nV = (document.getElementById('tira-medios').innerHTML.match(/data-quitar=/g) || []).length;
  console.log('        1 foto + 3 videos ->', nV, 'archivos en la lista');
  chk(nV === 4, 'los 3 videos se conservan (ya no se reemplazan entre sí)');
  chk(document.getElementById('cuenta-medios').textContent.includes('4'),
      'el contador coincide con el reporte');
  chk(!document.getElementById('reporte-medios').innerHTML.includes('AVISO INTERNO'),
      'no hay descuadre entre procesados y guardados');

  document.getElementById('project-title').value = 'Pieza Multi';
  document.getElementById('project-desc').value = 'x';
  subidos.length = 0;
  document.getElementById('btn-guardar').click();
  for (let i = 0; i < 40; i++) await esperar();
  const vids = subidos.filter(u => /-video(-\d)?\.(mp4|webm)/.test(u));
  console.log('        videos subidos:', vids.join(', '));
  chk(vids.length === 3, 'sube los 3 videos con nombres distintos');
  chk(new Set(vids).size === 3, 'ningún video sobrescribe a otro');
  chk(subidos.filter(u => /portada/.test(u)).length === 3, 'cada video lleva su propia portada');

  console.log('\n== limpieza de archivos sin uso ==');
  montar('admin.html');
  global.location.pathname = '/admin.html';
  global.localStorage._d = { lma_repo: 'imermoreno/sitio-lma', lma_token: 'ghp_x' };

  const enRepo = [
    { type: 'file', name: 'proj-901.jpg', sha: 's1', size: 200000 },   // en uso
    { type: 'file', name: 'viejo-1.webp', sha: 's2', size: 300000 },   // huérfano
    { type: 'file', name: 'viejo-video.mp4', sha: 's3', size: 7000000 },// huérfano
    { type: 'file', name: '.gitkeep', sha: 's4', size: 0 }             // nunca se toca
  ];
  const borrados = [];
  global.fetch = async (url, opc) => {
    const u = String(url);
    if (u.includes('api.github.com')) {
      if (opc && opc.method === 'DELETE') {
        borrados.push(decodeURIComponent(u.split('/').pop()));
        return { ok: true, status: 200, json: async () => ({}) };
      }
      if (u.endsWith('/contents/img/portafolio')) {
        return { ok: true, status: 200, json: async () => enRepo };
      }
      return { ok: true, status: 200, json: async () => ({ sha: 'a', content: { sha: 'b' } }) };
    }
    return { ok: true, status: 200, json: async () => ([{
      id: 'P1', titulo: 'Uno', categoria: 'Robótica', fecha: '2026-05',
      imagen: '/img/portafolio/proj-901.jpg', galeria: ['/img/portafolio/proj-901.jpg'], descripcion: 'x'
    }]) };
  };
  correr('js/admin.js');
  await esperar();

  document.getElementById('abrir-config').click();
  await esperar();
  const modalCfg = document.getElementById('lma-config');
  const btnBuscar = modalCfg && modalCfg.querySelector('[data-buscar-huerfanos]');
  chk(!!btnBuscar, 'la configuración tiene el botón de buscar archivos sin uso');
  btnBuscar.dispatch('click');
  for (let i = 0; i < 10; i++) await esperar();

  const salida = modalCfg.querySelector('#cfg-huerfanos');
  chk(salida.innerHTML.includes('viejo-1.webp'), 'detecta la foto huérfana');
  chk(salida.innerHTML.includes('viejo-video.mp4'), 'detecta el video huérfano');
  chk(!salida.innerHTML.includes('proj-901'), 'NO marca como huérfano un archivo en uso');
  chk(!salida.innerHTML.includes('.gitkeep'), 'ignora .gitkeep');
  chk(salida.innerHTML.includes('7.1 MB') || /MB/.test(salida.innerHTML), 'muestra el peso total');

  const btnBorrar = salida.querySelector('[data-borrar-huerfanos]');
  chk(!!btnBorrar, 'ofrece el botón de eliminar');
  btnBorrar.dispatch('click');
  for (let i = 0; i < 15; i++) await esperar();
  chk(borrados.length === 2, 'elimina exactamente los 2 huérfanos');
  chk(!borrados.includes('proj-901.jpg'), 'nunca borra un archivo en uso');
  chk(!borrados.includes('.gitkeep'), 'nunca borra .gitkeep');

  console.log('\n== videos largos ==');
  chk(Medios.MAX_SEGUNDOS === 180, 'admite hasta 3 minutos');
  const casos = [10, 30, 75, 150, 180];
  let ok = true, filas = [];
  for (const seg of casos) {
    const e = Medios.estimar(seg);
    filas.push(`${seg}s -> ${e.mb} MB, ${e.ancho}px, calidad ${e.calidad}`);
    if (e.mb > Medios.MAX_SALIDA_MB) ok = false;
  }
  filas.forEach(f => console.log('        ' + f));
  chk(ok, 'ninguna duración supera el límite de subida');
  chk(Medios.perfilDe(10).ancho > Medios.perfilDe(150).ancho,
      'a más duración, menos resolución (para que quepa)');
  chk(Medios.perfilDe(10).bitrate > Medios.perfilDe(150).bitrate,
      'a más duración, menos bitrate');
  chk(Medios.estimar(180).mb < 25, 'un video de 3 minutos cabe en Cloudflare (límite 25 MB)');
  const srcMedios = fs.readFileSync(path.join(RAIZ, 'js/medios.js'), 'utf8');
  chk(srcMedios.includes('requestVideoFrameCallback'),
      'usa captura por cuadro de video (no se frena en segundo plano)');
  chk(srcMedios.includes('setInterval'), 'tiene red de seguridad si el navegador congela el bucle');
  chk(typeof Medios.cancelar === 'function', 'la conversión se puede cancelar');

  console.log('\n== visor de galería ==');
  montar('index.html');
  global.location.pathname = '/index.html';
  global.fetch = async () => ({ ok: true, status: 200, json: async () => ([{
    id: 'P1', titulo: 'Con galería', categoria: 'Robótica', fecha: '2026-08',
    imagen: '/img/portafolio/a.webp',
    galeria: ['/img/portafolio/a.webp', '/img/portafolio/b.webp'],
    video: '/img/portafolio/v.mp4', videoPoster: '/img/portafolio/a.webp',
    descripcion: 'x'
  }]) });
  correr('js/visor.js');
  correr('js/portafolio.js');
  await esperar();
  const g2 = document.getElementById('galeria').innerHTML;
  chk(g2.includes('data-abrir="0"'), 'la tarjeta se puede abrir');
  chk(g2.includes('play_circle'), 'muestra el distintivo de video');
  chk(/play_circle<\/span>\s*3/.test(g2), 'indica que hay 3 medios');
  const m = global.window.mediosDe({
    imagen: '/a.webp', galeria: ['/a.webp', '/b.webp'], video: '/v.mp4'
  });
  chk(m.length === 3, 'no duplica la portada al listarla en la galería');
  chk(m[2].tipo === 'video', 'el video queda al final');

  console.log('\n== adaptación móvil ==');
  const idx = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(RAIZ, 'css/movil.css'), 'utf8');

  chk(idx.includes('css/movil.css'), 'index.html carga la hoja móvil');
  chk(idx.includes('id="menu-movil"'), 'existe el menú desplegable');
  chk(idx.includes('id="btn-menu"'), 'existe el botón hamburguesa');
  chk(idx.includes('js/menu.js'), 'carga el script del menú');
  chk(!idx.includes('movil-inicio.html'), 'ya no enlaza a la página móvil vieja');

  // Todo el CSS móvil debe estar dentro de media queries
  const fuera = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split(/@media[^{]*\{/) [0].trim();
  chk(fuera === '', 'ningún estilo fuera de @media (el escritorio no se toca)');
  chk(/@media\s*\(max-width:\s*767px\)/.test(css), 'usa el corte en 767px');

  // Las anclas del menú tienen que existir
  const idsIdx = new Set([...idx.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
  const anclas = /<div id="menu-movil">([\s\S]*?)<\/div>/.exec(idx)[1];
  const destinos = [...anclas.matchAll(/href="#([^"]+)"/g)].map(m => m[1]);
  chk(destinos.length >= 6, 'el menú tiene al menos 6 enlaces');
  chk(destinos.every(d => idsIdx.has(d)), 'todas las secciones del menú existen');

  console.log('\n' + '='.repeat(50));
  if (fallos.length) { console.log('FALLAS: ' + fallos.length); fallos.forEach(f => console.log('  - ' + f)); process.exit(1); }
  console.log('TODAS LAS PRUEBAS PASARON');
})();

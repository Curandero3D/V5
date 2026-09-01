#!/usr/bin/env python3
"""Conecta todos los botones y enlaces muertos. Reproducible e idempotente."""
import re
from pathlib import Path

R = Path(__file__).resolve().parent.parent
WA = 'https://wa.me/524772259654'
MAIL = 'mailto:immer88@outlook.com'
COTIZA = MAIL + '?subject=Solicitud%20de%20cotizaci%C3%B3n'

def leer(f): return (R / f).read_text(encoding='utf-8')
def guardar(f, s): (R / f).write_text(s, encoding='utf-8'); print('  guardado', f)

def sub(s, viejo, nuevo, veces=1, obligatorio=True):
    if viejo not in s:
        if obligatorio: print('    !! no encontrado:', viejo[:70])
        return s
    return s.replace(viejo, nuevo, veces)

# ══════════════════════════════════════════════════════════ index.html
print('index.html')
s = leer('index.html')

# Anclas rotas del menú principal
s = sub(s, 'href="#proyectos"', 'href="#portafolio"')

# Botones del hero y cabecera
s = sub(s, '<button class="hidden lg:flex items-center', '<a href="#contacto" class="hidden lg:flex items-center', 0, False)
for viejo, destino in [
    ('Cotizar Proyecto', '#contacto'),
    ('Solicitar Cotización\n', '#contacto'),
    ('Ver Servicios', '#servicios'),
]:
    pass  # se manejan abajo por patrón de botón

def boton_a_enlace(s, texto, href, externo=False):
    """Convierte <button ...>TEXTO</button> en <a href=...> conservando clases."""
    patron = re.compile(r'<button([^>]*)>((?:(?!</button>).)*?' + re.escape(texto) + r'(?:(?!</button>).)*?)</button>', re.S)
    extra = ' target="_blank" rel="noopener"' if externo else ''
    def rep(m):
        attrs = m.group(1)
        attrs = re.sub(r'\stype="[^"]*"', '', attrs)
        return f'<a href="{href}"{extra}{attrs}>{m.group(2)}</a>'
    nuevo, n = patron.subn(rep, s)
    print(f'    {texto[:28]:30} -> {href}  ({n})')
    return nuevo

s = boton_a_enlace(s, 'Cotizar Proyecto', '#contacto')
s = boton_a_enlace(s, 'Solicitar Cotización\n', '#contacto')
s = boton_a_enlace(s, 'Ver Servicios', '#servicios')
s = boton_a_enlace(s, 'Solicitar Cotización Formal', COTIZA)
s = boton_a_enlace(s, 'Contactar vía WhatsApp', WA, externo=True)
s = boton_a_enlace(s, 'Enviar Correo Electrónico', MAIL)

# Enlaces "#" del pie: servicios -> sección, contacto -> WhatsApp/correo
for texto, destino in [
    ('Ingeniería Mecánica', '#servicios'), ('Ingeniería Inversa', '#servicios'),
    ('Manufactura Aditiva', '#servicios'), ('Diseño de Herramentales', '#servicios'),
    ('Automatización', '#servicios'), ('APQP &amp; FMEA', '#core-tools'),
    ('Control de Calidad', '#core-tools'), ('Gestión de Riesgos', '#core-tools'),
    ('Soporte Técnico', '#contacto'), ('Ventas y Cotizaciones', '#contacto'),
    ('ISO 9001:2015', '#core-tools'),
]:
    s = re.sub(r'href="#"([^>]*>(?:(?!</a>).)*?' + re.escape(texto) + r')',
               f'href="{destino}"\\1', s, count=1, flags=re.S)

# Iconos sociales del pie
s = s.replace('href="#"', f'href="{MAIL}"', 0)  # no-op seguro

# Menú hamburguesa de escritorio-en-móvil -> lleva a la versión móvil
s = sub(s, '<button class="lg:hidden text-on-surface p-2',
        '<button onclick="location.href=\'movil-inicio.html?full\'" class="lg:hidden text-on-surface p-2', 1, False)

# Formulario de contacto -> abre el correo con los datos
s = sub(s, '<button', '<button', 0, False)
s = boton_a_enlace(s, 'Enviar Mensaje', 'javascript:void(0)')
s = s.replace('href="javascript:void(0)"', 'href="#contacto" id="btn-enviar-form"', 1)
if 'js/contacto.js' not in s:
    s = s.replace('</body>', '<script src="js/contacto.js"></script>\n</body>')
guardar('index.html', s)

# ══════════════════════════════════════════════════════════ movil-inicio.html
print('movil-inicio.html')
s = leer('movil-inicio.html')
s = boton_a_enlace(s, 'CONTACTAR', WA, externo=True)
s = boton_a_enlace(s, 'ESPECIFICACIONES', 'movil-portafolio.html')
s = sub(s, '<span class="material-symbols-outlined">account_circle</span>',
        '<span class="material-symbols-outlined">account_circle</span>', 1, False)
s = re.sub(r'<button([^>]*)>\s*<span class="material-symbols-outlined"[^>]*>account_circle</span>\s*</button>',
           r'<a href="movil-admin.html"\1><span class="material-symbols-outlined">account_circle</span></a>', s, count=1)
s = re.sub(r'<button([^>]*)>\s*<span class="material-symbols-outlined"[^>]*>menu</span>\s*</button>',
           r'<a href="movil-portafolio.html"\1><span class="material-symbols-outlined">menu</span></a>', s, count=1)
for texto, destino in [('Especificaciones', 'movil-portafolio.html'),
                       ('Soporte Técnico', WA), ('Seguridad', '#'), ('Privacidad', '#')]:
    if destino != '#':
        s = re.sub(r'href="#"([^>]*>\s*' + re.escape(texto) + r')', f'href="{destino}"\\1', s, count=1)
guardar('movil-inicio.html', s)

# ══════════════════════════════════════════════════════════ movil-portafolio.html
print('movil-portafolio.html')
s = leer('movil-portafolio.html')
s = re.sub(r'<button([^>]*)>\s*<span class="material-symbols-outlined"[^>]*>account_circle</span>\s*</button>',
           r'<a href="movil-admin.html"\1><span class="material-symbols-outlined">account_circle</span></a>', s, count=1)
s = re.sub(r'<button([^>]*)>\s*<span class="material-symbols-outlined"[^>]*>menu</span>\s*</button>',
           r'<a href="movil-inicio.html"\1><span class="material-symbols-outlined">menu</span></a>', s, count=1)
s = re.sub(r'href="#"([^>]*>\s*Soporte Técnico)', f'href="{WA}"\\1', s, count=1)
guardar('movil-portafolio.html', s)

# ══════════════════════════════════════════════════════════ admin.html
print('admin.html')
s = leer('admin.html')
for texto, destino in [('Inicio', 'index.html'), ('Ingeniería', 'index.html#servicios'),
                       ('Manufactura', 'index.html#servicios'), ('Calidad', 'index.html#core-tools'),
                       ('Proyectos', 'admin.html'), ('Contacto', 'index.html#contacto')]:
    s = re.sub(r'href="#"([^>]*>(?:(?!</a>).)*?>' + re.escape(texto) + r'</span>)',
               f'href="{destino}"\\1', s, count=1, flags=re.S)
s = re.sub(r'<button([^>]*)>\s*<span class="material-symbols-outlined" data-icon="menu">menu</span>\s*</button>',
           r'<a href="movil-admin.html"\1><span class="material-symbols-outlined" data-icon="menu">menu</span></a>',
           s, count=1)
guardar('admin.html', s)

# ══════════════════════════════════════════════════════════ movil-admin.html
print('movil-admin.html')
s = leer('movil-admin.html')

# Contadores -> ids
for etiqueta, ident in [('TOTAL ACTIVOS', 'stat-total'), ('EN PROCESO', 'stat-proceso'),
                        ('COMPLETADOS', 'stat-completados')]:
    m = re.search(re.escape(etiqueta) + r'</span>\s*<span([^>]*)>(\d+)</span>', s)
    if m:
        s = s[:m.start(2)] + f'<i id="{ident}" class="not-italic">' + m.group(2) + '</i>' + s[m.end(2):]
        print(f'    contador {ident} OK')

# Lista de tarjetas -> contenedor vacío con id
ini = s.index('<!-- Card 1 -->')
fin = s.index('<!-- Load More (Ghost Button) -->')
s = s[:ini] + '<div class="flex flex-col gap-4" id="admin-grid"></div>\n' + s[fin:]

# Botones
s = re.sub(r'<button([^>]*)>\s*<span class="material-symbols-outlined text-\[18px\]">expand_more</span>\s*CARGAR MÁS PROYECTOS\s*</button>',
           r'<button\1 id="btn-mas">\n<span class="material-symbols-outlined text-[18px]">expand_more</span>\nCARGAR MÁS PROYECTOS\n</button>', s, count=1)
s = re.sub(r'<button([^>]*)>\s*<span class="material-symbols-outlined text-\[18px\]">filter_list</span>\s*Filtrar\s*</button>',
           r'<button\1 id="btn-filtrar">\n<span class="material-symbols-outlined text-[18px]">filter_list</span>\nFiltrar\n</button>', s, count=1)
s = re.sub(r'<button([^>]*)>((?:(?!</button>).)*?NUEVO(?:(?!</button>).)*?)</button>',
           r'<button\1 id="btn-nuevo">\2</button>', s, count=1, flags=re.S)
s = re.sub(r'<button([^>]*)>\s*<span class="material-symbols-outlined"[^>]*>account_circle</span>\s*</button>',
           r'<button\1 id="abrir-config"><span class="material-symbols-outlined">account_circle</span></button>', s, count=1)
s = re.sub(r'<button([^>]*)>\s*<span class="material-symbols-outlined"[^>]*>menu</span>\s*</button>',
           r'<a href="movil-inicio.html"\1><span class="material-symbols-outlined">menu</span></a>', s, count=1)
for texto, destino in [('Dashboard', 'movil-inicio.html'), ('Proyectos', 'movil-portafolio.html'),
                       ('Manufactura', 'movil-inicio.html'), ('Análisis', 'movil-admin.html')]:
    s = re.sub(r'href="#"([^>]*>(?:(?!</a>).)*?' + re.escape(texto) + r')', f'href="{destino}"\\1', s, count=1, flags=re.S)
s = re.sub(r'href="#"([^>]*>(?:(?!</a>).)*?Configuración)', 'href="javascript:void(0)" id="link-config"\\1', s, count=1, flags=re.S)

if 'js/admin.js' not in s:
    s = s.replace('</body>', '<script src="js/admin.js"></script>\n</body>')
guardar('movil-admin.html', s)

print('\nlisto')

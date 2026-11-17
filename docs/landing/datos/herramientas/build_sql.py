#!/usr/bin/env python3
"""Genera docs/landing/datos/cajamarca-demo.sql a partir de manifiesto.json (imagenes nuevas) y
manifiesto-previo.json (imagenes ya generadas como respaldo). DATOS INVENTADOS PARA DEMOSTRACION."""
import json
from pathlib import Path

BASE = Path(__file__).parent
NEW = json.loads((BASE / "manifiesto.json").read_text())
OLD = json.loads((BASE / "manifiesto-previo.json").read_text())
OUT = BASE.parent / "ISANORTE-Frontend/docs/landing/datos/cajamarca-demo.sql"

def img(new, old=None):
    return NEW.get(new) or (OLD.get(old) if old else None)

def q(v):
    if v is None: return "NULL"
    if isinstance(v, bool): return "TRUE" if v else "FALSE"
    if isinstance(v, (int, float)): return str(v)
    return "'" + str(v).replace("'", "''") + "'"

L = []
def sql(s): L.append(s)

SITE = "(SELECT id FROM configuraciones_sitio WHERE clave = 'isanorte')"
EMP = "(SELECT id FROM empresa ORDER BY fecha_creacion LIMIT 1)"
UNI = "(SELECT id FROM unidades_negocio WHERE slug = 'isadecor')"
NOW = "CURRENT_TIMESTAMP"

sql("""-- ISANORTE · Cajamarca, Perú — DATOS DE DEMOSTRACIÓN (inventados). Ver LEEME.md.
-- Repetible: borra el contenido del sitio y lo vuelve a cargar. No toca administradores, productos ni pedidos.
-- Uso: psql ... -v ON_ERROR_STOP=1 -f cajamarca-demo.sql   (con search_path en el esquema del backend)
BEGIN;

DELETE FROM proyecto_servicio;
DELETE FROM beneficios_servicio;
DELETE FROM proyecto_galeria;
DELETE FROM proyectos;
DELETE FROM servicios;
DELETE FROM testimonios;
DELETE FROM faqs;
DELETE FROM miembros_equipo;
DELETE FROM credenciales;
DELETE FROM garantias;
DELETE FROM pasos_proceso;
DELETE FROM acciones_landing;
DELETE FROM hero_scenes;
DELETE FROM secciones_landing;
DELETE FROM contenido_pagina_tags;
DELETE FROM contenidos_pagina;
DELETE FROM estadisticas_empresa;
DELETE FROM redes_sociales;
DELETE FROM seo_paginas;
DELETE FROM recursos_unidad_negocio;
""")

# ---- Empresa
sql(f"""UPDATE empresa SET
  razon_social = 'ISANORTE Ingeniería y Construcción S.A.C.',
  nombre_comercial = 'ISANORTE',
  ruc = '20601234567',
  direccion = 'Jr. Amazonas 450, Cajamarca, Cajamarca, Perú',
  ciudad = 'Cajamarca',
  telefono = '+51 976 123 456',
  telefono_secundario = '+51 076 345 678',
  email = 'contacto@isanorte.pe',
  email_ventas = 'cotizaciones@isanorte.pe',
  whatsapp = '+51 976 123 456',
  horario_atencion = 'Lunes a viernes de 8:00 a 18:00 · Sábados de 8:00 a 13:00',
  anio_fundacion = 2012,
  zona_cobertura = 'Cajamarca, Baños del Inca, Namora, La Encañada, Celendín, Jaén y toda la región Cajamarca.',
  tiempo_respuesta = 'en menos de 24 horas hábiles',
  latitud = -7.156900,
  longitud = -78.514800,
  mision = 'Construir obras seguras, bien terminadas y entregadas a tiempo para las familias y empresas de Cajamarca, cuidando cada etapa: del terreno a la llave en mano.',
  vision = 'Ser la constructora de referencia del norte del Perú por la calidad de sus obras, la transparencia de sus presupuestos y la confianza de sus clientes.',
  valores = 'Seguridad en obra | Transparencia en costos | Cumplimiento de plazos | Trabajo con la comunidad',
  resumen_nosotros = 'ISANORTE acompaña cada obra con un solo equipo: planos, permisos, ejecución y acabados.',
  fecha_actualizacion = {NOW}
WHERE id = {EMP};
""")

logo = img("logo-isanorte-isotipo")
sql(f"""UPDATE configuraciones_sitio SET
  titulo_sitio = 'ISANORTE | Constructora en Cajamarca',
  descripcion_sitio = 'Constructora en Cajamarca: planos, permisos, ejecución y supervisión de obras con un solo equipo.',
  texto_pie_pagina = '© ISANORTE Ingeniería y Construcción S.A.C. · Cajamarca, Perú',
  fecha_actualizacion = {NOW}
WHERE clave = 'isanorte';
""")

# ---- Redes
for i, (n, u, ic) in enumerate([("Facebook", "https://www.facebook.com/isanorte.cajamarca", "facebook"),
                                 ("Instagram", "https://www.instagram.com/isanorte.cajamarca", "instagram"),
                                 ("TikTok", "https://www.tiktok.com/@isanorte.cajamarca", "tiktok")]):
    sql(f"INSERT INTO redes_sociales (id,nombre,url,icono,orden,activo,empresa_id,fecha_creacion,fecha_actualizacion) "
        f"VALUES (gen_random_uuid(),{q(n)},{q(u)},{q(ic)},{i},TRUE,{EMP},{NOW},{NOW});")

# ---- Servicios (los 8 reales, activos y destacados)
SERV = [
 ("diseno-y-elaboracion-de-planos", "Diseño y elaboración de planos", "Planos de arquitectura y especialidades listos para licencia de edificación.",
  "Elaboramos los planos de arquitectura, estructuras, instalaciones sanitarias y eléctricas de tu vivienda o local, con el detalle que exige la municipalidad y que tu constructor necesita para trabajar sin improvisar.",
  ["Arquitectura, estructuras e instalaciones", "Planos listos para licencia de edificación", "Modelo 3D para ver el resultado antes de construir"], "servicio-planos", "servicio-diseno"),
 ("ejecucion-y-supervision-de-proyectos", "Ejecución y supervisión de proyectos", "Construimos y supervisamos tu obra con control de plazos, calidad y presupuesto.",
  "Ejecutamos obras de vivienda, comercio e industria con residente de obra, control de materiales y reportes de avance. También supervisamos obras de terceros.",
  ["Residente de obra y control de calidad", "Presupuesto y cronograma transparentes", "Informes de avance y valorizaciones"], "servicio-ejecucion", "servicio-construccion"),
 ("levantamiento-topografico", "Levantamiento topográfico", "Medición exacta del terreno: linderos, áreas y curvas de nivel.",
  "Con estación total y GPS geodésico medimos tu terreno y entregamos planos perimétricos y topográficos para diseño, trámites y replanteo de obra.",
  ["Planos perimétricos y curvas de nivel", "Replanteo de ejes en obra", "Áreas y linderos verificados"], "servicio-topografia", None),
 ("saneamiento-fisico-legal", "Saneamiento físico legal", "Regularizamos tu terreno o vivienda para que puedas construir, vender o heredar con tranquilidad.",
  "Gestionamos la inscripción y regularización de predios: memorias descriptivas, planos, trámites ante la municipalidad y Registros Públicos.",
  ["Memoria descriptiva y planos para Registros Públicos", "Trámites municipales y regularización", "Acompañamiento hasta la inscripción"], "servicio-saneamiento", None),
 ("habilitaciones-urbanas", "Habilitaciones urbanas", "Convertimos terrenos rústicos en lotes urbanos con vías y servicios.",
  "Diseñamos y ejecutamos habilitaciones urbanas: lotización, pistas, veredas, redes de agua, desagüe y electricidad, con los permisos correspondientes.",
  ["Proyecto de lotización y trámite de aprobación", "Pistas, veredas y redes de servicios", "Recepción de obras ante la municipalidad"], "servicio-habilitaciones", None),
 ("remodelaciones", "Remodelaciones", "Renovamos y ampliamos viviendas y locales sin parar tu vida diaria.",
  "Remodelamos y ampliamos casas, tiendas y oficinas: demolición controlada, refuerzo estructural, instalaciones nuevas y acabados.",
  ["Evaluación previa de la edificación", "Ampliaciones y refuerzo estructural", "Obra limpia y cronograma por etapas"], "servicio-remodelaciones", "servicio-remodelacion"),
 ("diseno-de-interiores", "Diseño de interiores", "Espacios cómodos y con identidad: materiales, mobiliario e iluminación.",
  "Diseñamos interiores de vivienda y comercio con propuesta de materiales, mobiliario a medida e iluminación, y los ejecutamos con nuestros acabadores.",
  ["Propuesta de materiales y colores", "Mobiliario a medida con ISADECOR", "Ejecución y puesta en obra"], "servicio-interiores", "servicio-decoracion"),
 ("estructuras-metalicas", "Estructuras metálicas", "Galpones, coberturas y estructuras de acero diseñados, fabricados y montados.",
  "Diseñamos, fabricamos y montamos estructuras metálicas para galpones agroindustriales, coberturas, entrepisos y naves comerciales.",
  ["Diseño estructural y cálculo", "Fabricación y montaje propios", "Coberturas y cerramientos"], "servicio-estructuras-metalicas", None),
]
for i, (slug, nombre, resumen, desc, ben, nk, ok) in enumerate(SERV):
    url = img(nk, ok)
    sql(f"INSERT INTO servicios (id,nombre,slug,resumen,descripcion,imagen_url,imagen_alt,activo,destacado,orden,fecha_creacion,fecha_actualizacion) "
        f"VALUES (gen_random_uuid(),{q(nombre)},{q(slug)},{q(resumen)},{q(desc)},{q(url)},{q(nombre if url else None)},TRUE,TRUE,{i},{NOW},{NOW});")
    for j, b in enumerate(ben):
        sql(f"INSERT INTO beneficios_servicio (id,texto,orden,activo,servicio_id,fecha_creacion,fecha_actualizacion) "
            f"VALUES (gen_random_uuid(),{q(b)},{j},TRUE,(SELECT id FROM servicios WHERE slug={q(slug)}),{NOW},{NOW});")

# ---- Proyectos
PROY = [
 ("casa-campestre-banos-del-inca", "Casa campestre en Baños del Inca", "Baños del Inca, Cajamarca", "2024", "VIVIENDA", 280, 9,
  "Vivienda unifamiliar de dos niveles con base de piedra, techo a dos aguas y jardín, pensada para una familia que quería vivir cerca de las termas sin renunciar a la comodidad de la ciudad. Se construyó desde el saneamiento del terreno hasta la entrega.\n\nEl desafío fue la pendiente del lote: se resolvió con muros de contención de piedra de la zona y una cimentación escalonada que además dio forma a las terrazas del jardín. La estructura es de concreto armado con albañilería confinada y cobertura de teja andina.\n\nEl equipo estuvo a cargo de todo el proceso: levantamiento topográfico, planos y licencia, obra gruesa, instalaciones y acabados. Se entregó en 9 meses, con visitas quincenales de la familia y un informe de avance por etapa.",
  "Saneamiento, planos, licencia, estructura, acabados e instalaciones.", True, "proyecto-casa-campestre-banos-del-inca", "proyecto-residencia-aura",
  ["diseno-y-elaboracion-de-planos", "ejecucion-y-supervision-de-proyectos", "saneamiento-fisico-legal"]),
 ("edificio-multifamiliar-amazonas", "Edificio multifamiliar Jr. Amazonas", "Cajamarca, Cajamarca", "2023", "VIVIENDA", 1150, 14,
  "Edificio de cuatro pisos con ocho departamentos y un local comercial en el primer nivel, ubicado en una de las avenidas de mayor tránsito de Cajamarca. Cada departamento tiene ventilación e iluminación natural en todos sus ambientes.\n\nSe trabajó con un sistema de pórticos de concreto armado y losas aligeradas, con cimentación diseñada a partir de un estudio de suelos. Las instalaciones sanitarias y eléctricas se dejaron independizadas por unidad para facilitar su venta y administración.\n\nISANORTE se encargó del proyecto, la licencia de edificación, la ejecución de la obra y los acabados de los departamentos, con supervisión técnica en cada etapa y entrega en 14 meses.",
  "Proyecto, licencia, estructura, instalaciones y acabados de departamentos.", True, "proyecto-edificio-multifamiliar-amazonas", "proyecto-conjunto-los-pinos",
  ["diseno-y-elaboracion-de-planos", "ejecucion-y-supervision-de-proyectos"]),
 ("remodelacion-casona-plaza-de-armas", "Remodelación de casona cerca de la Plaza de Armas", "Centro histórico, Cajamarca", "2024", "REMODELACION", 420, 6,
  "Recuperación de una casona antigua a pocas cuadras de la Plaza de Armas: se reforzaron los muros, se instalaron balcones de madera nuevos y se adecuó el inmueble para uso comercial, respetando su fachada y su patio interior.\n\nAntes de intervenir se hizo una evaluación estructural que definió el refuerzo de muros y entrepisos. Los trabajos se programaron por sectores para que el negocio pudiera seguir atendiendo durante la obra.\n\nSe renovaron las instalaciones eléctricas y sanitarias, la carpintería y los acabados, y se diseñó la iluminación para resaltar la piedra y la madera originales. La obra duró 6 meses.",
  "Evaluación estructural, refuerzo, carpintería, instalaciones y acabados.", True, "proyecto-remodelacion-casona-plaza-de-armas", "proyecto-hotel-boutique-andino",
  ["remodelaciones", "diseno-de-interiores"]),
 ("local-comercial-av-atahualpa", "Local comercial en Av. Atahualpa", "Cajamarca, Cajamarca", "2025", "COMERCIAL", 310, 4,
  "Edificio comercial de dos niveles con fachada de vidrio, pensado para alojar tiendas en la planta baja y oficinas en el segundo piso, con locales flexibles que se pueden unir o dividir según el inquilino.\n\nSe ejecutó la obra gris completa, la fachada acristalada y las instalaciones, y se desarrolló el diseño interior de los espacios comunes y de los locales entregados con acabados básicos.\n\nEl proyecto se entregó en 4 meses con un cronograma por etapas que permitió abrir los primeros locales antes de terminar el edificio.",
  "Diseño, ejecución de obra gris y acabados, e interiores.", True, "proyecto-local-comercial-av-atahualpa", "proyecto-centro-comercial-plaza-norte",
  ["ejecucion-y-supervision-de-proyectos", "diseno-de-interiores"]),
 ("galpon-agroindustrial-namora", "Galpón agroindustrial en Namora", "Namora, Cajamarca", "2023", "INDUSTRIAL", 900, 5,
  "Nave de estructura metálica con cobertura liviana para almacenamiento y procesamiento agroindustrial en el valle de Namora, diseñada para ampliarse a futuro sin detener la operación.\n\nEl diseño estructural resolvió las cargas de viento y de puentes grúa livianos con pórticos de acero de gran luz. Las piezas se fabricaron en taller y se montaron en obra, lo que redujo los tiempos y los costos de ejecución.\n\nSe entregó con piso industrial, cobertura y cerramientos laterales en 5 meses.",
  "Diseño, fabricación y montaje de la estructura metálica y cobertura.", False, "proyecto-galpon-agroindustrial-namora", None,
  ["estructuras-metalicas", "ejecucion-y-supervision-de-proyectos"]),
 ("habilitacion-urbana-mirador-del-cumbe", "Habilitación urbana Mirador del Cumbe", "Cajamarca, Cajamarca", "2022", "HABILITACION", 12000, 8,
  "Lotización de 48 lotes con pistas, veredas y redes de agua, desagüe y electricidad en una ladera con vista a la ciudad, desarrollada para una asociación de propietarios.\n\nEl trabajo empezó con el levantamiento topográfico y el saneamiento del terreno, siguió con el proyecto de lotización y su aprobación municipal, y terminó con la ejecución de las obras y su recepción.\n\nLos lotes se entregaron con servicios básicos instalados y títulos listos para inscribir, en 8 meses.",
  "Levantamiento topográfico, proyecto de lotización, trámites y ejecución de obras.", False, "proyecto-habilitacion-urbana-mirador-del-cumbe", "proyecto-villa-lomas-alta",
  ["levantamiento-topografico", "habilitaciones-urbanas", "saneamiento-fisico-legal"]),
]
for i, (slug, nombre, ubic, fecha, tipo, area, plazo, desc, alcance, dest, nk, ok, servs) in enumerate(PROY):
    url = img(nk, ok)
    sql(f"INSERT INTO proyectos (id,nombre,slug,cliente,ubicacion,fecha_proyecto,descripcion,destacado,activo,orden,imagen_url,imagen_alt,area_m2,plazo_meses,alcance,tipo_obra,fecha_creacion,fecha_actualizacion) "
        f"VALUES (gen_random_uuid(),{q(nombre)},{q(slug)},NULL,{q(ubic)},{q(fecha)},{q(desc)},{q(dest)},TRUE,{i},{q(url)},{q(nombre if url else None)},{area},{plazo},{q(alcance)},{q(tipo)},{NOW},{NOW});")
    for s in servs:
        sql(f"INSERT INTO proyecto_servicio (proyecto_id,servicio_id) VALUES ((SELECT id FROM proyectos WHERE slug={q(slug)}),(SELECT id FROM servicios WHERE slug={q(s)}));")

# Galería (solo si la imagen ya existe)
GAL = [("casa-campestre-banos-del-inca", "galeria-casa-campestre-antes", "ANTES", "Terreno antes de construir"),
       ("casa-campestre-banos-del-inca", "galeria-casa-campestre-proceso", "PROCESO", "Obra en construcción"),
       ("casa-campestre-banos-del-inca", "galeria-casa-campestre-final", "FINAL", "Interior terminado"),
       ("remodelacion-casona-plaza-de-armas", "galeria-casona-antes", "ANTES", "Casona antes de la remodelación"),
       ("remodelacion-casona-plaza-de-armas", "galeria-casona-proceso", "PROCESO", "Remodelación en curso"),
       ("remodelacion-casona-plaza-de-armas", "galeria-casona-final", "FINAL", "Patio restaurado"),
       ("galpon-agroindustrial-namora", "galeria-galpon-proceso", "PROCESO", "Montaje de la estructura")]
for i, (slug, key, et, alt) in enumerate(GAL):
    if NEW.get(key):
        sql(f"INSERT INTO proyecto_galeria (id,proyecto_slug,url,alt,etiqueta,orden,activo,fecha_creacion,fecha_actualizacion) "
            f"VALUES (gen_random_uuid(),{q(slug)},{q(NEW[key])},{q(alt)},{q(et)},{i},TRUE,{NOW},{NOW});")

# ---- Equipo
EQ = [("Ing. Carlos Mendoza Rojas", "Gerente general · Ingeniero civil", "Ejecución y supervisión de obras", "Más de 20 años dirigiendo obras de vivienda e industria en la región Cajamarca.", "equipo-gerente"),
      ("Arq. Lucía Vásquez Chávez", "Directora de proyectos · Arquitecta", "Diseño arquitectónico y licencias", "Lidera el diseño y el trámite de licencias de edificación y habilitaciones urbanas.", "equipo-arquitecta"),
      ("Ing. Jorge Díaz Huamán", "Supervisor de obra", "Control de calidad y seguridad", "Responsable de la supervisión técnica y de la seguridad en cada obra.", "equipo-supervisor"),
      ("Ing. Marco Cueva Silva", "Jefe de topografía", "Topografía y saneamiento físico legal", "Dirige los levantamientos topográficos y los expedientes de saneamiento.", "equipo-topografo")]
for i, (n, c, e, b, k) in enumerate(EQ):
    url = NEW.get(k)
    sql(f"INSERT INTO miembros_equipo (id,nombre,cargo,especialidad,biografia,foto_url,foto_alt,orden,activo,fecha_creacion,fecha_actualizacion) "
        f"VALUES (gen_random_uuid(),{q(n)},{q(c)},{q(e)},{q(b)},{q(url)},{q(n if url else None)},{i},TRUE,{NOW},{NOW});")

# ---- Credenciales
CR = [("Registro Nacional de Proveedores (RNP) · Ejecutor de obras", "OSCE", "REGISTRO", "S0123456", 2019),
      ("Colegiatura del ingeniero responsable", "Colegio de Ingenieros del Perú · Consejo Departamental Cajamarca", "COLEGIATURA", "CIP 123456", 2005),
      ("Colegiatura de la arquitecta responsable", "Colegio de Arquitectos del Perú · Regional Cajamarca", "COLEGIATURA", "CAP 98765", 2013),
      ("Licencia municipal de funcionamiento", "Municipalidad Provincial de Cajamarca", "LICENCIA", "LF-2024-0456", 2024),
      ("Plan de seguridad y salud en el trabajo", "Ley 29783 de Seguridad y Salud en el Trabajo", "CERTIFICACION", None, 2025)]
for i, (n, e, t, c, a) in enumerate(CR):
    sql(f"INSERT INTO credenciales (id,nombre,entidad,tipo,codigo,anio,orden,activo,fecha_creacion,fecha_actualizacion) "
        f"VALUES (gen_random_uuid(),{q(n)},{q(e)},{q(t)},{q(c)},{q(a)},{i},TRUE,{NOW},{NOW});")

# ---- Testimonios
TS = [("María Elena Quispe", "Propietaria · Baños del Inca", "Nos entregaron la casa en el plazo prometido y el presupuesto no cambió. Siempre hubo alguien en obra que nos explicaba cada avance.", "casa-campestre-banos-del-inca"),
      ("Roberto Chávez", "Administrador · Edificio Jr. Amazonas", "Lo mejor fue tener planos, licencia y obra con el mismo equipo. Nos ahorramos meses de ida y vuelta entre profesionales.", "edificio-multifamiliar-amazonas"),
      ("Ana Lucía Ramírez", "Empresaria · Cajamarca", "Remodelaron la casona respetando su estilo y sin parar mi negocio. El resultado superó lo que esperaba.", "remodelacion-casona-plaza-de-armas")]
for i, (a, c, t, p) in enumerate(TS):
    sql(f"INSERT INTO testimonios (id,autor,cargo,texto,proyecto_slug,orden,activo,fecha_creacion,fecha_actualizacion) "
        f"VALUES (gen_random_uuid(),{q(a)},{q(c)},{q(t)},{q(p)},{i},TRUE,{NOW},{NOW});")

# ---- Garantías
GA = [("Un solo equipo, de principio a fin", "Planos, permisos, obra y acabados con el mismo equipo responsable.", True),
      ("Supervisión técnica en cada etapa", "Un ingeniero residente controla calidad, seguridad y avance de tu obra.", True),
      ("Presupuesto claro y por escrito", "Sabes cuánto cuesta cada partida antes de empezar; los cambios se aprueban contigo.", True),
      ("Plazos acordados", "Cronograma firmado con fechas de entrega y reportes de avance periódicos.", False),
      ("Garantía posventa", "Atendemos cualquier observación de la obra durante el primer año.", False),
      ("Saneamiento y trámites incluidos", "Te acompañamos con licencias, habilitaciones y regularización del predio.", False)]
for i, (t, x, h) in enumerate(GA):
    sql(f"INSERT INTO garantias (id,titulo,texto,en_hero,orden,activo,fecha_creacion,fecha_actualizacion) VALUES (gen_random_uuid(),{q(t)},{q(x)},{q(h)},{i},TRUE,{NOW},{NOW});")

# ---- Pasos
PA = [("Consulta y terreno", "Visitamos el lugar, revisamos la situación legal y el levantamiento topográfico, y definimos qué es posible construir."),
      ("Diseño y planos", "Elaboramos los planos de arquitectura y especialidades, y gestionamos los permisos y las habilitaciones necesarias."),
      ("Ejecución y supervisión", "Construimos con supervisión técnica en cada etapa, para cuidar plazos, calidad y presupuesto."),
      ("Entrega", "Revisamos acabados y detalles contigo y te entregamos la obra lista para habitarla.")]
for i, (t, x) in enumerate(PA):
    sql(f"INSERT INTO pasos_proceso (id,titulo,texto,orden,activo,fecha_creacion,fecha_actualizacion) VALUES (gen_random_uuid(),{q(t)},{q(x)},{i},TRUE,{NOW},{NOW});")

# ---- FAQ
FQ = [("¿Cuánto cuesta construir una casa en Cajamarca?", "Depende del tamaño, los acabados y el terreno. Tras una visita sin costo te entregamos un presupuesto por escrito, partida por partida.", "HOME"),
      ("¿Cuánto demora una obra?", "Una vivienda de 150 a 250 m² suele tomar entre 7 y 10 meses desde el inicio de obra. Los plazos de licencia dependen de la municipalidad.", "HOME"),
      ("¿Se encargan de la licencia y los permisos?", "Sí. Elaboramos los planos y gestionamos la licencia de edificación y, si hace falta, el saneamiento físico legal del terreno.", "HOME"),
      ("¿Trabajan fuera de la ciudad de Cajamarca?", "Sí, en toda la región: Baños del Inca, Namora, La Encañada, Celendín, Jaén y otras provincias.", "HOME"),
      ("¿Cómo se paga la obra?", "Por valorizaciones según el avance real de la obra, con adelanto inicial acordado en el contrato.", "HOME"),
      ("¿Qué incluye el servicio de supervisión?", "Visitas técnicas programadas, control de materiales y calidad, verificación de metrados e informes de avance.", "SERVICIOS"),
      ("¿Pueden ejecutar un diseño que ya tengo?", "Sí. Revisamos tus planos, ajustamos lo necesario y los ejecutamos con presupuesto propio.", "SERVICIOS"),
      ("¿Cuánto tarda el saneamiento físico legal?", "Entre 2 y 6 meses según el estado de la documentación y los tiempos de Registros Públicos.", "SERVICIOS")]
for i, (p, r, a) in enumerate(FQ):
    sql(f"INSERT INTO faqs (id,pregunta,respuesta,ambito,orden,activo,fecha_creacion,fecha_actualizacion) VALUES (gen_random_uuid(),{q(p)},{q(r)},{q(a)},{i},TRUE,{NOW},{NOW});")

# ---- Cifras (Nosotros)
for i, (v, pre, suf, et) in enumerate([(12, "+", " años", "De experiencia en la región"), (85, "+", "", "Obras entregadas"),
                                        (38, "", " mil m²", "Construidos y habilitados"), (6, "", "", "Provincias atendidas")]):
    sql(f"INSERT INTO estadisticas_empresa (id,valor,prefijo,sufijo,etiqueta,orden,activo,empresa_id,fecha_creacion,fecha_actualizacion) "
        f"VALUES (gen_random_uuid(),{v},{q(pre)},{q(suf)},{q(et)},{i},TRUE,{EMP},{NOW},{NOW});")

# ---- Páginas
PAG = [("NOSOTROS", "Nosotros", "Una constructora de Cajamarca para Cajamarca", "ISANORTE nació en 2012 para que construir no sea un dolor de cabeza: un solo equipo acompaña tu obra del terreno a la llave en mano.",
        "Somos ingenieros, arquitectos y técnicos de la región. Conocemos el terreno, el clima y los trámites de Cajamarca, y nos hacemos responsables de la obra de principio a fin.", img("nosotros-imagen", "servicio-construccion"), img("nosotros-fondo"),
        ["Cajamarca", "Obra con garantía", "Equipo local"]),
       ("SERVICIOS", "Servicios", "Ocho servicios para construir sin improvisar", "Desde medir tu terreno hasta entregarte la obra terminada.", None, None, None, []),
       ("PROYECTOS", "Proyectos", "Obras que ya puedes visitar", "Viviendas, comercios, remodelaciones e infraestructura en toda la región Cajamarca.", None, None, None, []),
       ("CONTACTO", "Contacto", "Cuéntanos qué quieres construir", "Escríbenos por WhatsApp, llámanos o déjanos tus datos: te respondemos pronto.", None, None, None, [])]
for pg, ey, ti, intro, desc, im, fo, tags in PAG:
    sql(f"INSERT INTO contenidos_pagina (id,pagina,eyebrow,titulo,introduccion,descripcion,imagen_url,imagen_alt,imagen_fondo_url,activo,configuracion_sitio_id,fecha_creacion,fecha_actualizacion) "
        f"VALUES (gen_random_uuid(),{q(pg)},{q(ey)},{q(ti)},{q(intro)},{q(desc)},{q(im)},{q('Equipo de ISANORTE en obra' if im else None)},{q(fo)},TRUE,{SITE},{NOW},{NOW});")
    for j, t in enumerate(tags):
        sql(f"INSERT INTO contenido_pagina_tags (contenido_pagina_id,orden,tag) VALUES ((SELECT id FROM contenidos_pagina WHERE pagina={q(pg)}),{j},{q(t)});")

# ---- Secciones del Home
def seccion(tipo, orden, etiqueta, titulo, subtitulo, contenido, imagen, acciones, escenas=()):
    sql(f"INSERT INTO secciones_landing (id,tipo,titulo,subtitulo,contenido,imagen_url,etiqueta,orden,visible,configuracion_sitio_id,fecha_creacion,fecha_actualizacion) "
        f"VALUES (gen_random_uuid(),{q(tipo)},{q(titulo)},{q(subtitulo)},{q(contenido)},{q(imagen)},{q(etiqueta)},{orden},TRUE,{SITE},{NOW},{NOW});")
    sel = f"(SELECT id FROM secciones_landing WHERE tipo={q(tipo)} AND configuracion_sitio_id={SITE})"
    for i, (t, e) in enumerate(acciones):
        sql(f"INSERT INTO acciones_landing (id,texto,enlace,orden,activo,seccion_landing_id,fecha_creacion,fecha_actualizacion) VALUES (gen_random_uuid(),{q(t)},{q(e)},{i},TRUE,{sel},{NOW},{NOW});")
    for i, (u, alt) in enumerate(escenas):
        sql(f"INSERT INTO hero_scenes (id,imagen_url,alt,orden,activo,seccion_landing_id,fecha_creacion,fecha_actualizacion) VALUES (gen_random_uuid(),{q(u)},{q(alt)},{i},TRUE,{sel},{NOW},{NOW});")

heroes = [(img("hero-casa", "hero-exterior"), "Casa campestre con techo de teja"), (img("hero-sala", "hero-sala"), "Sala con vigas de madera"),
          (img("hero-obra", "hero-cocina"), "Cocina moderna"), (img("hero-planos", "hero-dormitorio"), "Dormitorio con muro de listones")]
heroes = [(u, a) for u, a in heroes if u]
seccion("HERO", 0, "Constructora en Cajamarca", "Construimos tu casa\nen Cajamarca",
        "Del terreno a la llave en mano: planos, permisos, obra y acabados con un solo equipo y presupuesto por escrito.", None, None,
        [("Solicitar cotización", "#cotizar"), ("Ver proyectos", "/proyectos")], heroes)
seccion("SERVICIOS", 1, "Nuestros servicios", "Todo lo que necesitas para construir,\nen un solo lugar", None, None, None, [("Ver todos los servicios", "/servicios")])
seccion("PROYECTOS", 2, "Obras recientes", "Obras entregadas en toda\nla región Cajamarca", None, None, None, [("Ver todos los proyectos", "/proyectos")])
seccion("UNIDAD_NEGOCIO", 3, "ISADECOR", "Acabados e interiores con\nla misma calidad de obra", None, None, None, [("Conocer ISADECOR", "/isadecor")])
seccion("CTA", 4, None, "¿Tienes un terreno o una idea?", "Cuéntanos qué quieres construir y te orientamos sin costo.", None, img("cta-fondo", "cta-consultoria"), [("Solicitar cotización", "/contacto")])

# ---- ISADECOR
ofertas = "Mobiliario a medida | Cocinas y closets | Revestimientos y paneles | Pisos y acabados"
sql(f"""UPDATE unidades_negocio SET
  descripcion = 'La línea de acabados e interiores de ISANORTE: paneles, pisos, revestimientos y mobiliario a medida para tu vivienda o local.',
  ofertas = {q(ofertas)}, imagen_url = {q(img('isadecor-1', 'isadecor-editorial-1'))}, imagen_alt = 'Paneles de madera ISADECOR',
  activo = TRUE, destacado = TRUE, orden = 0, fecha_actualizacion = {NOW}
WHERE slug = 'isadecor';""")
rec = [("IMAGEN_FONDO", img("isadecor-fondo", "isadecor-fondo"), "Muro con paneles de madera"),
       ("IMAGEN_EDITORIAL", img("isadecor-1", "isadecor-editorial-1"), "Paneles de nogal"),
       ("IMAGEN_EDITORIAL", img("isadecor-2", "isadecor-editorial-2"), "Revestimiento tipo mármol"),
       ("IMAGEN_EDITORIAL", img("isadecor-3", "isadecor-editorial-3"), "Piso de roble en espiga")]
for i, (t, u, a) in enumerate(rec):
    if u:
        sql(f"INSERT INTO recursos_unidad_negocio (id,tipo,url,alt,orden,activo,unidad_negocio_id,fecha_creacion,fecha_actualizacion) VALUES (gen_random_uuid(),{q(t)},{q(u)},{q(a)},{i},TRUE,{UNI},{NOW},{NOW});")

# ---- SEO
SEO = [("HOME", "ISANORTE | Constructora en Cajamarca: planos, permisos y obra", "Construimos tu casa o local en Cajamarca con un solo equipo: planos, licencias, ejecución y supervisión. Pide tu cotización."),
       ("NOSOTROS", "Nosotros | ISANORTE Cajamarca", "Conoce al equipo de ISANORTE: ingenieros y arquitectos de Cajamarca con 12 años de experiencia en obra."),
       ("SERVICIOS", "Servicios de construcción en Cajamarca | ISANORTE", "Planos, ejecución y supervisión, topografía, saneamiento físico legal, habilitaciones urbanas, remodelaciones, interiores y estructuras metálicas."),
       ("PROYECTOS", "Proyectos y obras en Cajamarca | ISANORTE", "Viviendas, edificios, remodelaciones y galpones construidos por ISANORTE en la región Cajamarca."),
       ("CONTACTO", "Contacto | ISANORTE Cajamarca", "Escríbenos por WhatsApp o llámanos para cotizar tu obra en Cajamarca.")]
for t, ti, d in SEO:
    sql(f"INSERT INTO seo_paginas (id,tipo_pagina,title,description,robots,configuracion_sitio_id,fecha_creacion,fecha_actualizacion) VALUES (gen_random_uuid(),{q(t)},{q(ti)},{q(d)},'INDEX_FOLLOW',{SITE},{NOW},{NOW});")

sql("\nCOMMIT;")
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text("\n".join(L) + "\n")
print("escrito", OUT, len(L), "sentencias")

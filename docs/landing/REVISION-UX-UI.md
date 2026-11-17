# Revisión estricta de UX y UI: Home, Nosotros, Servicios, Proyectos

Alcance y límites: revisé las páginas en el navegador (Home a 1440 y 375 px; el resto a 1440 px) y leí el código. Capturas de baja resolución, datos de demostración en la BD, sin analítica ni usuarios reales. Lo que sigue es criterio de diseño y conversión, no datos medidos.

## Veredicto

La página se ve más ordenada que antes, pero **no está diseñada para convertir en una constructora**. Tiene movimiento y pulido visual, y le faltan las tres cosas que hacen que alguien entregue su dinero a una constructora: **prueba, claridad de oferta y un camino de contacto sin fricción**. Hoy es una buena vitrina y un mal vendedor.

## Problemas críticos (en orden de gravedad)

1. **No hay prueba social ni credenciales en todo el sitio.** Cero testimonios, cero logos de clientes, cero licencias o colegiaturas, cero proyectos con cifras reales (m², plazo, presupuesto orientativo). Las cifras de Nosotros no están confirmadas. Quien va a invertir decenas de miles en una obra no confía en un titular.
2. **Las imágenes no son de ISANORTE.** Fotos de banco o generadas (obrero con chaleco, casas de revista, un video 3D de una casa que ISANORTE no construyó). En una constructora, la foto es la garantía; una foto ajena es una promesa falsa. El video del proceso es llamativo, pero es una animación genérica: sirve de adorno, no de prueba.
3. **El formulario pide demasiado y no pide lo útil.** Cinco campos obligatorios (nombre, correo, teléfono, mensaje) más empresa, y no pregunta lo que de verdad cualifica el contacto: tipo de obra, ubicación del terreno, si ya tiene planos o permisos, plazo. Además, en Perú el canal real de conversión es **WhatsApp**, y hoy es un botón flotante más. El formulario tampoco muestra consentimiento ni política de privacidad: hay que revisar con un abogado qué exige la Ley de Protección de Datos Personales.
4. **El teléfono no está en la cabecera.** Un sitio de obras debe mostrar el teléfono y el WhatsApp siempre visibles, sobre todo en móvil.
5. **La oferta no está explicada.** Servicios sin "qué incluye", sin "para quién", sin plazos típicos, sin cómo se cotiza. Dice "terreno, permisos y obra con un solo equipo" y en ninguna parte lo demuestra ni lo detalla.

## Home

- **Titular genérico.** «Transformamos espacios en experiencias» no dice qué hace ISANORTE, ni dónde, ni para quién. Lo mismo vale para «Excelencia entregada en cada metro cuadrado».
- **El hero compite consigo mismo:** plano trazándose, ficha «De principio a fin» que repite la sección de proceso, tres viñetas de confianza que son afirmaciones sin respaldo. Mucho adorno, ninguna cifra real.
- **La sección de proceso ocupa 3,4 pantallas para contar 4 frases.** Es el mayor consumo de scroll de la página para el contenido de menor valor comercial. Es un efecto vistoso (y lo hicimos), pero en móvil es fatiga y retrasa llegar a lo que convierte. Debe acortarse a unas 2 pantallas o a un recorrido horizontal compacto.
- **Orden de secciones equivocado:** servicios genéricos antes de la prueba; ISADECOR, otra línea de negocio, interrumpe el camino hacia la cotización.
- **Servicios compactos pero pobres:** icono + nombre + resumen. Sin resultado, sin imagen, sin "Ver servicio" ni cotizar. Perdimos atractivo visual al reducirlos y no ganamos claridad.
- **Dos llamados a la acción equivalentes en el hero** («Solicitar cotización» y «Habla con un asesor») que llevan al mismo lugar.
- **Riel lateral:** solo aparece a partir de 1536 px; casi nadie lo verá. O se hace útil o se quita.
- **Peso:** el paquete inicial supera el presupuesto (936 kB frente a 800 kB), hay imágenes externas y un video de 1,8 MB; sin medir, es un riesgo para móviles con datos limitados.

## Nosotros

- **Es la página más débil.** Unos 2000 px de altura: titular, dos párrafos, una franja de 4 cifras y tres acordeones cerrados. **Misión, visión y valores quedan ocultos tras un clic**: el contenido central de la página está escondido.
- Sin historia, sin equipo, sin fotos de personas, sin credenciales, sin zona de trabajo, sin llamado a la acción. Es una página de relleno.
- El título y la introducción repiten literalmente al hero del Home. La imagen dice «Equipo de ISANORTE» y muestra un interior de madera.
- Una franja de cifras sin verificar es peor que no tenerla.

## Servicios

- Cinco tarjetas horizontales casi idénticas, una tras otra. Sin navegación entre servicios, sin agrupación lógica, sin **ningún botón de cotizar** en toda la página.
- Los beneficios son listas en letra pequeña; la etiqueta «01 · ACABADOS» es ruido.
- Debería organizarse por el **recorrido del cliente** (terreno y trámites, diseño, obra, interiores), que es justo su diferenciador, no como un catálogo plano.
- Sin preguntas frecuentes (costos, plazos, permisos) ni proceso.

## Proyectos

- **Lo mejor del sitio estructuralmente** (11 proyectos, filtros), pero los datos son de demostración (Quito) y la tarjeta superpone texto pequeño sobre la foto, con poco contraste.
- Filtros por *servicio*: poco útil. Quien busca una constructora filtra por **tipo de obra** (vivienda, comercial, remodelación) y **ciudad**.
- **Detalle de proyecto muy pobre:** un párrafo, dos cajas (Ubicación y Fecha) y un botón. Sin ficha técnica (m², plazo, alcance, año), sin antes y después, sin galería salvo que haya varias fotos, sin testimonio del cliente, sin «siguiente proyecto».
- Títulos tipo «Galería Editorial de Proyectos» son jerga de diseñador.

## Transversal

- **Tono y copy:** corporativo, genérico y con etiquetas como `PORTFOLIO // LO QUE HACEMOS` o `NOSOTROS — IDENTIDAD`. Parece una plantilla; habla de ISANORTE, no del problema del cliente.
- **Lenguaje visual dividido:** cabecera y pie siempre negros, páginas en tema claro, cabeceras oscuras con línea naranja y heroes claros. No se siente una sola marca.
- **ISADECOR en una pestaña nueva** desde la navegación: rompe la expectativa y cuesta una pestaña.
- **Sin analítica de conversión:** no se sabrá cuántos envían el formulario, tocan WhatsApp o llaman.
- **SEO local ausente:** una constructora vive de buscar «constructora en [ciudad]»; no hay datos estructurados ni contenido por ciudad.
- **Mobile:** el flujo en móvil no se ha probado en un dispositivo real; la mayoría del tráfico de este rubro es móvil.

## Cómo debería organizarse una landing de constructora

Orden recomendado del Home (cada bloque con una única tarea):

1. **Cabecera:** logo, menú corto, **teléfono y WhatsApp visibles**, botón «Cotizar».
2. **Hero con propuesta concreta:** qué hacen, para quién, dónde. Una prueba al lado (años, obras entregadas, garantía). Un botón principal (WhatsApp con mensaje listo) y uno secundario (ver proyectos).
3. **Barra de confianza:** cifras reales, licencias, colegiaturas, marcas con las que trabajan.
4. **Servicios agrupados por recorrido** (terreno y trámites, diseño, construcción, interiores), cada uno con «qué incluye» y «cotizar».
5. **Proyectos destacados con datos** (m², plazo, ciudad) y fotos reales, mejor si hay antes y después.
6. **Cómo trabajamos** en 4 pasos, compacto, con lo que recibe el cliente en cada etapa.
7. **Por qué ISANORTE:** garantías concretas (supervisión técnica, plazos, presupuesto transparente).
8. **Testimonios** con nombre, foto o video corto, y el proyecto al que se refieren.
9. **ISADECOR** como invitación breve a otra línea.
10. **Preguntas frecuentes:** cuánto cuesta, cuánto demora, qué permisos hacen falta.
11. **Cotización:** formulario corto (nombre, WhatsApp, tipo de obra, ubicación, mensaje opcional) + botón de WhatsApp, con consentimiento de datos.

Páginas:
- **Nosotros:** historia, equipo con nombre y especialidad, credenciales, valores **siempre visibles**, zona de cobertura.
- **Servicios:** por recorrido, con FAQ y botón de cotizar en cada uno.
- **Proyectos:** filtros por tipo de obra y ciudad; **ficha técnica y galería** por proyecto.
- **Contacto:** canales, mapa, horario y el mismo formulario corto.

## Plan sugerido por impacto y esfuerzo

| Prioridad | Cambio | Esfuerzo |
|---|---|---|
| P0 | Teléfono y WhatsApp en la cabecera; WhatsApp con mensaje prellenado por página | Bajo |
| P0 | Formulario corto, con tipo de obra y ubicación, y consentimiento de datos | Medio (tocar backend para los campos nuevos) |
| P0 | Reunir material real: fotos de obras, 3 testimonios, credenciales, cifras verificables | Tu parte, no es código |
| P1 | Rehacer Nosotros (valores visibles, equipo, credenciales, CTA) | Medio |
| P1 | Servicios por recorrido, con botón de cotizar y FAQ | Medio |
| P1 | Detalle de proyecto con ficha técnica y galería | Medio (campos nuevos en el backend) |
| P2 | Acortar la sección de proceso y reordenar el Home | Bajo |
| P2 | Barra de confianza y testimonios en el Home | Medio |
| P3 | Analítica de eventos, datos estructurados y SEO local | Medio |

Lo más rentable no es más animación: es **material real y un camino corto a WhatsApp**.

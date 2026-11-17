# Nosotros: revisión de contenido (fase F)

El código de Nosotros ya no repite estructura del Home: las cifras viven solo ahí y no hay servicios ni proyectos. La repetición que queda está en el **contenido** que viene de la base de datos (panel admin → contenido de la página Nosotros). Esta propuesta es para cargarla desde el panel; no se tocó el backend.

## Qué se repite hoy (datos reales leídos de la API)

| Campo de Nosotros | Valor actual | Problema |
|---|---|---|
| Título | «Transformamos espacios en experiencias.» | Idéntico al título del hero del Home |
| Introducción | «Soluciones profesionales para construcción, obra civil y acabados.» | Idéntica al subtítulo del hero del Home |
| Descripción | «Transformamos espacios elevando el nivel de infraestructura, diseño…» | Es el mismo resumen del pie de página |
| Etiqueta superior | «NOSOTROS — IDENTIDAD» | «Identidad» sobra |
| Etiquetas | Arquitectura, Construcción, Obra civil, Acabados | No incluyen «Ingeniería», que está en el lema de la marca |
| Cifras | +120 proyectos, +15 años, 98 % clientes satisfechos, 100 % diseño a medida | Sin confirmar que sean reales |
| Misión / Visión | Mencionan a «Ecuador» | Revisar el país (ver abajo) |

## Propuesta de texto

Marca **[completar]** lo que solo ustedes saben; no se inventan datos.

- **Etiqueta superior:** `NOSOTROS`
- **Título:** `Un solo equipo, de principio a fin`
- **Introducción:** `ISANORTE reúne arquitectura, ingeniería y construcción para que tu proyecto avance sin intermediarios.`
- **Descripción:** `Somos un equipo de [completar: profesionales y especialidades] con base en [completar: ciudad]. Acompañamos cada proyecto desde el terreno y los trámites hasta la entrega de la obra.`
- **Etiquetas:** `ARQUITECTURA`, `INGENIERÍA`, `CONSTRUCCIÓN`
- **Cifras:** solo las que puedan demostrar. Si no hay un número real, omitir la cifra (el bloque se oculta solo si no hay ninguna).

Para el Home (hero), por la misma razón, convendría diferenciarlo de Nosotros, por ejemplo: título `Arquitectura, ingeniería y construcción para tu proyecto`, subtítulo `Planos, permisos y obra con un solo equipo.`

## País confirmado: Perú

ISANORTE trabaja en **Perú** (confirmado por el usuario). Lo que hay que corregir en la BD y el contenido, desde el panel admin:

- **Misión y visión:** cambiar «Ecuador» por Perú (o por la región donde operan).
- **Teléfonos y WhatsApp:** hoy son +593 (Ecuador); deben ser +51 con los números reales.
- **Dirección y ciudad de la empresa:** hoy dicen Quito; poner la real (el mapa ya apunta a Cajamarca).
- **Proyectos de demostración:** «Residencia Aura» y «Edificio Tech-Corporate» están ubicados en Quito. Reemplazarlos por proyectos reales de ISANORTE.
- **Correos:** hoy terminan en `.ec`; usar el dominio real.

En el código:
- El ejemplo del campo de teléfono del formulario ya usa formato peruano (`Ej. 987 654 321`).
- Los proyectos de respaldo del Home (con ubicación en Quito) se eliminaron: si la API no trae proyectos, la sección no se muestra.

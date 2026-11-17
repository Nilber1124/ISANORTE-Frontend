# Plan: reducir redundancia entre páginas y agregar el formulario de contacto al Home

Estado: propuesta, sin implementar. Basado en la lectura del código de Home, Nosotros, Servicios, Proyectos, Contacto, navbar y footer.

## 1. Diagnóstico (qué se repite hoy)

| Contenido | Dónde aparece | Problema |
|---|---|---|
| Lista de servicios | Home (tarjetas con imagen y resumen) y Servicios (lista completa) | Mismo contenido en el mismo formato; el Home no resume, duplica |
| Proyectos | Home (bento) y Proyectos (destacados + secundarios) | Mismas fotos y datos, dos veces |
| ISADECOR | Home (banda), navbar ("Unidades de negocio" y "Tienda" van al mismo sitio), footer (unidades) y /isadecor | Cuatro puertas al mismo destino |
| Datos de contacto | Navbar (botón), Home (cierre con WhatsApp y teléfono), página Contacto (canales), footer (correo, teléfonos, mapa) y botón flotante de WhatsApp | Cinco lugares; el mapa y los teléfonos se repiten |
| Llamado a la acción | Hero, cada sección, cierre, navbar | Etiquetas distintas ("Solicitar cotización", "Habla con un asesor", "Solicitar asesoría gratuita", "Contacto") |
| Cifras | Nosotros (ya tiene estadísticas); en el Home se ocultaron | Decidir un solo dueño |
| Cabecera de página | Servicios y Proyectos repiten el mismo bloque oscuro (eyebrow + título) | Código y estilo duplicados |

Ya existe: el formulario de contacto completo (validación, envío por `submitContact`, mensajes de éxito y error) en la página Contacto, con su facade `PublicContactFacade`.

## 2. Qué debe poseer cada página (propuesta)

- **Home** = resumen y persuasión. Muestra poco de cada cosa y lleva a la página dueña.
  - Servicios: los 8 como lista compacta (icono + nombre, una línea), sin imagen ni resumen largo. Botón "Ver todos".
  - Proceso: se queda (es exclusivo del Home).
  - Proyectos: solo 3 a 4 destacados, con enlace a Proyectos.
  - ISADECOR: una banda, sin repetir en otros lugares de la misma página.
  - Cierre: formulario de contacto + los tres canales (ver sección 3).
- **Servicios** = el detalle: descripción, beneficios, imagen y "cotizar este servicio".
- **Proyectos** = el catálogo completo con filtros.
- **Nosotros** = historia, valores y cifras (dueña de las estadísticas).
- **Contacto** = canales + mapa + el mismo formulario.
- **Navbar y footer** = navegación y datos mínimos; sin segundo formulario ni segundo mapa.

## 3. Formulario de contacto al final del Home

Reutilizar, no duplicar:
1. Extraer el formulario de `contact.html` a un componente compartido (por ejemplo `ContactForm`) que use `PublicContactFacade`, con las mismas validaciones y mensajes.
2. Usarlo en la página Contacto (sin cambio visual) y al final del Home.
3. En el Home, el cierre queda en dos columnas: a la izquierda el titular "¿Tienes un proyecto en mente?", una línea de respuesta ("Te respondemos en menos de 24 h", solo si es real) y los canales (WhatsApp, teléfono, correo); a la derecha el formulario.
4. Campos: los actuales (nombre, correo, teléfono, empresa opcional, mensaje). Opcional: selector "Servicio de interés" con los 8 servicios, que requiere un campo en el backend (hoy no existe en la solicitud).
5. Accesibilidad: labels, errores con `aria-describedby`, foco al primer error, estado de envío anunciado.
6. Sin backend nuevo: el endpoint de contacto ya existe.

## 4. Fases propuestas

| Fase | Trabajo | Riesgo |
|---|---|---|
| A | Extraer `ContactForm` compartido y usarlo en Contacto (sin cambios visuales) | Bajo; los tests de Contacto lo cubren |
| B | Añadir el formulario al cierre del Home y reordenar el cierre | Bajo |
| C | Home: servicios en lista compacta y proyectos reducidos a 3 o 4 | Medio: ajustar tests del Home |
| D | Unificar etiquetas de llamado a la acción y quitar duplicados en navbar y footer | Medio: tocar layouts compartidos; revisar sus tests |
| E | Cabecera de página compartida para Servicios y Proyectos | Bajo |
| F | Revisar Nosotros: dejar las cifras solo ahí y acortar lo que repita al Home | Medio: contenido administrable |

Orden sugerido: A, B, C, D, E, F. Cada fase se puede revisar por separado.

## 5. Decisiones que necesito de ti

1. **Navbar:** ¿quitamos "Tienda" y dejamos solo el menú "Unidades de negocio", o al revés?
2. **Footer:** ¿mantenemos el mapa en el footer o solo en la página Contacto?
3. **Cifras:** ¿viven solo en Nosotros?
4. **Formulario del Home:** ¿agregamos "Servicio de interés"? Implica un cambio en el backend (más adelante).
5. **Tiempo de respuesta:** ¿puedo escribir "Te respondemos en menos de X horas"? Solo si es cierto.
6. **Alcance:** ¿hacemos las fases A y B ahora (formulario) y dejamos C a F para después?

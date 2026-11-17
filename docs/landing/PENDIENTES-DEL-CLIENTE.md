# Pendientes de tu parte (material y decisiones)

> Estado: el sitio ya funciona con **datos de demostración de Cajamarca** (`datos/cajamarca-demo.sql`, ver `datos/LEEME.md`). Todo lo marcado abajo debe reemplazarse con datos reales desde el panel `/admin` (Contenido → Equipo, Credenciales, Testimonios, etc.). Faltan también las imágenes específicas: `datos/LEEME.md` lista cuáles.

Lista de lo que no se puede resolver con código: contenido real, datos y decisiones. Cada punto indica dónde se usa. Marca con `[x]` lo que vayas entregando.

## 1. Material real (lo que más pesa para convencer)

- [ ] **Fotos reales de obras terminadas**, de 5 a 8 proyectos: exterior, interior y detalle, en buena resolución. Se usan en Home, Proyectos y detalle.
- [ ] **Fotos de obras en proceso** (antes, durante, después) de al menos 2 proyectos. Se usan en el detalle de proyecto.
- [ ] **3 testimonios reales** de clientes: nombre, qué obra se les hizo y, si autorizan, foto o video corto.
- [ ] **Fotos del equipo** (fundador, ingenieros, arquitectos) con nombre, cargo y especialidad.
- [ ] **Credenciales**: licencias, colegiaturas (CIP, CAP), certificaciones, RUC y razón social.
- [ ] **Marcas o clientes** con los que han trabajado (con permiso para mostrarlos).

## 2. Datos que deben ser verdaderos

- [ ] **Cifras** para Nosotros y el Home: años de experiencia, obras entregadas, m² construidos. Solo las que se puedan demostrar.
- [ ] **Ficha técnica de cada proyecto**: ubicación, año, m², plazo de ejecución, alcance (qué se hizo).
- [ ] **Tiempo de respuesta real** al contacto (hoy el formulario dice «menos de 24 horas»).
- [ ] **Zona donde trabajan** (ciudades o regiones).
- [ ] **Plazos típicos** por servicio y cómo se cotiza (visita, presupuesto, costo del estudio).

## 3. Contenido en la base de datos (panel admin)

- [ ] Revisar los **8 servicios** (ya cargados con texto de demostración): planos, ejecución y supervisión, topografía, saneamiento físico legal, habilitaciones urbanas, remodelaciones, diseño de interiores, estructuras metálicas. Con resumen, descripción, qué incluye e imagen real de cada uno.
- [ ] Reemplazar los datos inventados de Cajamarca (teléfonos, RUC, dirección, correos) por los reales.
- [ ] Reemplazar los **proyectos de demostración** por proyectos reales (los actuales están ubicados en Quito, Bogotá y otras ciudades que no corresponden).
- [ ] **Nosotros**: cargar el texto propuesto en `CONTENIDO-NOSOTROS.md` (título, introducción, etiquetas) y la historia real de la empresa.
- [ ] **Hero del Home**: cambiar el título genérico por una propuesta concreta y cambiar el botón secundario «Habla con un asesor» por «Ver proyectos».
- [ ] **Teléfono, WhatsApp, correo, dirección y horario** reales de la empresa.
- [ ] **Redes sociales** con sus enlaces reales (hoy los iconos del pie de página no tienen contenido confirmado).

## 4. Textos y decisiones

- [ ] **Preguntas frecuentes**: 5 a 8 preguntas con respuestas reales (cuánto cuesta, cuánto demora, qué permisos hacen falta, qué garantía dan, formas de pago).
- [ ] **Garantías concretas** (supervisión técnica, plazos, presupuesto transparente): cuáles ofrecen de verdad.
- [ ] **Política de privacidad**: redactarla con un abogado (ley de datos personales de Perú). Se enlaza desde el formulario.
- [ ] **Equipo en la web**: quién aparece y con qué descripción.
- [ ] ¿Quieren que ISADECOR siga abriéndose en otra pestaña? (hoy sí).

## 5. Técnico (cuando el material esté listo)

- [ ] Subir los videos e imágenes a **Cloudinary** y enlazarlos desde la BD (ya está en Cloudinary como demostración).
- [ ] Decidir si se mantiene el **video 3D** del proceso o se reemplaza por fotos reales de una obra de ISANORTE.
- [x] Cambios del **backend** (campos del formulario, ficha de proyecto, equipo, testimonios, credenciales): hechos. Ver `BACKEND-PENDIENTE.md`.
- [ ] Analítica: elegir herramienta (por ejemplo Google Analytics) para medir envíos de formulario, toques en WhatsApp y llamadas.

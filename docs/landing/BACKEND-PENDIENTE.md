# Campos que el backend necesitará para el nuevo Home

El rediseño **no modificó el backend**. Lo que hoy no existe en la API vive como datos locales en
`src/app/features/isanorte/home/home-landing.data.ts`, marcado con `TRANSITORIO`. Al integrar, cada bloque
se reemplaza por contenido administrable.

| Necesidad del diseño | Hoy | Propuesta backend |
|---|---|---|
| Icono por servicio | Mapa local por palabras del nombre | `servicio.icono` (clave de un set outline) |
| 8 servicios reales | La BD tiene 3 de demostración | Cargar los 8 servicios reales |
| Enlaces de acciones | La API devuelve `#cotizar`, `#contacto`, `#` | Rutas reales (`/contacto`, `/servicios`, `/proyectos`); el front las normaliza provisionalmente |
| Datos de proyecto (área, plazo, tipo de obra) | No existen | `proyecto.areaM2`, `proyecto.plazoMeses`, `proyecto.tipo` |
| Proyectos reales | 2 de demostración (Quito) | 5 a 8 proyectos reales con fotos |
| Pasos del proceso (4) y sus textos | Locales | Sección `PROCESO` con lista ordenada (título, texto) |
| Puntos de confianza del hero (3) | Locales | Lista corta en la sección HERO |
| Líneas de oferta de ISADECOR (4) | Locales | `unidadNegocio.ofertas[]` |
| Cifras (años, proyectos, m²) | Ocultas: eran valores fijos sin confirmar | `empresa.estadisticas[]` con valores reales |
| Teléfono y WhatsApp | Vienen de `PublicSiteFacade`; vacíos si no están cargados | Cargarlos en la empresa |
| Testimonios y certificaciones | No hay | Entidad `testimonio` y `certificacion` (opcional) |
| Servicio de interés en la solicitud de contacto | Se antepone al mensaje («Servicio de interés: X») | Campo `servicio` en la solicitud de contacto |
| Opciones del selector «Servicio de interés» (8 servicios reales) | Lista local en `home-landing.data.ts` (`HOME_SERVICE_OPTIONS`) | Salir de la API cuando la BD tenga los 8 servicios reales |
| Imagen y botón de la sección CTA | El cierre del Home ya no los usa (ahora es el formulario) | Opcional: quitar `imagenUrl` y acciones de la sección CTA, o reutilizarlos |
| Botón secundario del hero | La BD trae «Habla con un asesor» (va a /contacto) | Cambiarlo a «Ver proyectos» (/proyectos) para no repetir el destino del botón principal |
| Campos del formulario: ubicación, tipo de obra y consentimiento | Se envían dentro del mensaje (`Servicio de interés:`, `Ubicación:`) y el consentimiento solo se valida en el navegador | Campos `servicio`, `ubicacion` y `consentimiento` (con fecha) en la solicitud de contacto; permitir `email` opcional y `mensaje` opcional |
| Política de privacidad | No existe la página | Redactarla con asesoría legal (ley de datos personales de Perú) y enlazarla desde el formulario |

/** Una pantalla de administración por entidad, descrita como datos: la misma lista y el mismo formulario. */
export type SiteContentFieldType =
  'text' | 'textarea' | 'number' | 'select' | 'image' | 'checkbox' | 'date' | 'ref';

/** Lista REST de la que un campo `ref` toma sus opciones (se guarda el `id`). */
export interface SiteContentRef {
  readonly endpoint: string;
  readonly labelKey: string;
}

export interface SiteContentField {
  readonly key: string;
  readonly label: string;
  readonly type: SiteContentFieldType;
  readonly required?: boolean;
  readonly maxLength?: number;
  readonly options?: readonly { readonly value: string; readonly label: string }[];
  readonly help?: string;
  readonly ref?: SiteContentRef;
  /** Valor con el que arranca un registro nuevo. */
  readonly initial?: string;
}

export interface SiteContentEntity {
  readonly key: string;
  readonly title: string;
  readonly description: string;
  /** Ruta REST de administración, p. ej. `faqs` → `/api/faqs`. */
  readonly endpoint: string;
  readonly folder: string;
  readonly fields: readonly SiteContentField[];
  /** Campos que se resumen en la fila de la lista. */
  readonly titleKey: string;
  readonly subtitleKey?: string;
  /** Unidad de negocio a la que pertenece el contenido: se envía como `unidadNegocioId`. */
  readonly unitSlug?: string;
  /** La entidad no tiene orden ni visibilidad propios (no se muestran ni se envían). */
  readonly noOrder?: boolean;
  readonly noActive?: boolean;
  /** Permite fijar y excluir productos de la fila (secciones de productos de la Home). */
  readonly selection?: boolean;
}

export const SITE_CONTENT_ENTITIES: readonly SiteContentEntity[] = [
  {
    key: 'faqs',
    title: 'Preguntas frecuentes',
    description: 'Respuestas que se muestran en Home y Servicios.',
    endpoint: 'faqs',
    folder: 'isanorte/faqs',
    titleKey: 'pregunta',
    subtitleKey: 'ambito',
    fields: [
      { key: 'pregunta', label: 'Pregunta', type: 'text', required: true, maxLength: 300 },
      { key: 'respuesta', label: 'Respuesta', type: 'textarea', required: true },
      {
        key: 'ambito',
        label: 'Dónde se muestra',
        type: 'select',
        required: true,
        options: [
          { value: 'HOME', label: 'Home' },
          { value: 'SERVICIOS', label: 'Servicios' },
          { value: 'CONTACTO', label: 'Contacto' },
          { value: 'GENERAL', label: 'Todas' },
        ],
      },
    ],
  },
  {
    key: 'equipo',
    title: 'Equipo',
    description: 'Personas que aparecen en Nosotros.',
    endpoint: 'equipo',
    folder: 'isanorte/equipo',
    titleKey: 'nombre',
    subtitleKey: 'cargo',
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true, maxLength: 150 },
      { key: 'cargo', label: 'Cargo', type: 'text', required: true, maxLength: 150 },
      { key: 'especialidad', label: 'Especialidad', type: 'text', maxLength: 200 },
      { key: 'biografia', label: 'Biografía', type: 'textarea' },
      { key: 'fotoUrl', label: 'Foto', type: 'image' },
      { key: 'fotoAlt', label: 'Texto alternativo de la foto', type: 'text', maxLength: 300 },
    ],
  },
  {
    key: 'credenciales',
    title: 'Credenciales',
    description: 'Licencias, colegiaturas y certificaciones.',
    endpoint: 'credenciales',
    folder: 'isanorte/credenciales',
    titleKey: 'nombre',
    subtitleKey: 'tipo',
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true, maxLength: 200 },
      { key: 'entidad', label: 'Entidad emisora', type: 'text', maxLength: 200 },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        required: true,
        options: [
          { value: 'LICENCIA', label: 'Licencia' },
          { value: 'COLEGIATURA', label: 'Colegiatura' },
          { value: 'CERTIFICACION', label: 'Certificación' },
          { value: 'REGISTRO', label: 'Registro' },
        ],
      },
      { key: 'codigo', label: 'Código o número', type: 'text', maxLength: 80 },
      { key: 'anio', label: 'Año', type: 'number' },
      { key: 'imagenUrl', label: 'Imagen', type: 'image' },
      { key: 'imagenAlt', label: 'Texto alternativo de la imagen', type: 'text', maxLength: 300 },
    ],
  },
  {
    key: 'testimonios',
    title: 'Testimonios',
    description: 'Opiniones de clientes (Home y detalle de proyecto).',
    endpoint: 'testimonios',
    folder: 'isanorte/testimonios',
    titleKey: 'autor',
    subtitleKey: 'cargo',
    fields: [
      { key: 'autor', label: 'Autor', type: 'text', required: true, maxLength: 150 },
      { key: 'cargo', label: 'Cargo o relación', type: 'text', maxLength: 150 },
      { key: 'texto', label: 'Testimonio', type: 'textarea', required: true },
      {
        key: 'proyectoSlug',
        label: 'Proyecto relacionado (slug)',
        type: 'text',
        maxLength: 200,
        help: 'Opcional. Si coincide con un proyecto, aparece en su detalle.',
      },
      { key: 'fotoUrl', label: 'Foto', type: 'image' },
      { key: 'fotoAlt', label: 'Texto alternativo de la foto', type: 'text', maxLength: 300 },
    ],
  },
  {
    key: 'garantias',
    title: 'Garantías',
    description: 'Compromisos concretos («Por qué ISANORTE») y puntos del hero.',
    endpoint: 'garantias',
    folder: 'isanorte/garantias',
    titleKey: 'titulo',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text', required: true, maxLength: 150 },
      { key: 'texto', label: 'Texto', type: 'textarea', required: true, maxLength: 500 },
      { key: 'enHero', label: 'Mostrar en el hero del Home', type: 'checkbox' },
    ],
  },
  {
    key: 'pasos-proceso',
    title: 'Pasos del proceso',
    description: 'Etapas de «Cómo trabajamos» en el Home.',
    endpoint: 'pasos-proceso',
    folder: 'isanorte/proceso',
    titleKey: 'titulo',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text', required: true, maxLength: 150 },
      { key: 'texto', label: 'Texto', type: 'textarea', required: true, maxLength: 500 },
    ],
  },
  {
    key: 'proyecto-galeria',
    title: 'Galería de proyectos',
    description: 'Fotos antes, durante y después de cada obra.',
    endpoint: 'proyecto-galeria',
    folder: 'isanorte/galeria',
    titleKey: 'proyectoSlug',
    subtitleKey: 'etiqueta',
    fields: [
      {
        key: 'proyectoSlug',
        label: 'Proyecto (slug)',
        type: 'text',
        required: true,
        maxLength: 200,
      },
      { key: 'url', label: 'Imagen', type: 'image', required: true },
      { key: 'alt', label: 'Texto alternativo', type: 'text', maxLength: 300 },
      {
        key: 'etiqueta',
        label: 'Momento',
        type: 'select',
        required: true,
        options: [
          { value: 'ANTES', label: 'Antes' },
          { value: 'PROCESO', label: 'Durante la obra' },
          { value: 'FINAL', label: 'Resultado' },
          { value: 'DETALLE', label: 'Detalle' },
        ],
      },
    ],
  },
  {
    key: 'politicas',
    title: 'Políticas',
    description:
      'Política de privacidad y otros textos legales. Se publican en /politicas/<slug>; la de privacidad usa el slug «privacidad».',
    endpoint: 'politicas',
    folder: 'isanorte/politicas',
    titleKey: 'titulo',
    subtitleKey: 'slug',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text', required: true, maxLength: 150 },
      {
        key: 'slug',
        label: 'Slug (dirección)',
        type: 'text',
        required: true,
        maxLength: 80,
        help: 'Solo minúsculas, números y guiones. Ej.: privacidad',
      },
      {
        key: 'contenido',
        label: 'Contenido',
        type: 'textarea',
        required: true,
        help: 'Deja una línea en blanco entre párrafos.',
      },
    ],
  },
];

const UNIT = 'isadecor';
const LINK_PATTERN_HELP = 'Ruta interna (/isadecor/...) o dirección https://';

/** Contenido editable de la Home de ISADECOR (reemplaza al antiguo «Contenido del Home»). */
export const ISADECOR_HOME_ENTITIES: readonly SiteContentEntity[] = [
  {
    key: 'isadecor-hero',
    title: 'Hero de la Home',
    description:
      'Titular y subtítulo que se ven al abrir la tienda. Solo se muestra el primero activo.',
    endpoint: 'isadecor/hero',
    folder: 'isadecor/hero',
    unitSlug: UNIT,
    noOrder: true,
    titleKey: 'titulo',
    fields: [
      { key: 'titulo', label: 'Titular', type: 'text', required: true, maxLength: 160 },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea', required: true, maxLength: 300 },
    ],
  },
  {
    key: 'isadecor-cinta',
    title: 'Cinta de avisos',
    description: 'Frases cortas que rotan sobre el encabezado (envíos, instalación, etc.).',
    endpoint: 'isadecor/cinta',
    folder: 'isadecor/cinta',
    unitSlug: UNIT,
    titleKey: 'texto',
    subtitleKey: 'enlace',
    fields: [
      { key: 'texto', label: 'Texto', type: 'text', required: true, maxLength: 160 },
      {
        key: 'enlace',
        label: 'Enlace (opcional)',
        type: 'text',
        maxLength: 300,
        help: LINK_PATTERN_HELP,
      },
    ],
  },
  {
    key: 'isadecor-promociones',
    title: 'Promociones',
    description:
      'Hasta 3 en la Home: la marcada como principal va grande. Muestran el precio real del producto; vencen solas en su fecha.',
    endpoint: 'isadecor/promociones',
    folder: 'isadecor/promo',
    unitSlug: UNIT,
    titleKey: 'titulo',
    subtitleKey: 'tipo',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text', required: true, maxLength: 140 },
      {
        key: 'productoId',
        label: 'Producto',
        type: 'ref',
        required: true,
        ref: { endpoint: 'productos', labelKey: 'nombre' },
      },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        required: true,
        options: [
          { value: 'DESCUENTO', label: 'Descuento' },
          { value: 'NUEVO', label: 'Producto nuevo' },
        ],
      },
      { key: 'imagenUrl', label: 'Imagen', type: 'image', required: true },
      { key: 'fechaFin', label: 'Vigente hasta (opcional)', type: 'date' },
      { key: 'principal', label: 'Promoción principal (grande)', type: 'checkbox' },
    ],
  },
  {
    key: 'isadecor-campana',
    title: 'Campaña',
    description: 'Banner de campaña de la Home. Solo se muestra la primera activa.',
    endpoint: 'isadecor/campanas',
    folder: 'isadecor/campana',
    unitSlug: UNIT,
    noOrder: true,
    titleKey: 'titulo',
    subtitleKey: 'etiqueta',
    fields: [
      { key: 'etiqueta', label: 'Etiqueta', type: 'text', required: true, maxLength: 60 },
      { key: 'titulo', label: 'Título', type: 'text', required: true, maxLength: 160 },
      {
        key: 'descripcion',
        label: 'Descripción',
        type: 'textarea',
        required: true,
        maxLength: 400,
      },
      { key: 'textoBoton', label: 'Texto del botón', type: 'text', required: true, maxLength: 60 },
      {
        key: 'enlace',
        label: 'Enlace del botón',
        type: 'text',
        required: true,
        maxLength: 300,
        help: LINK_PATTERN_HELP,
      },
      { key: 'imagenUrl', label: 'Imagen', type: 'image', required: true },
    ],
  },
  {
    key: 'isadecor-servicios',
    title: 'Bloque de servicio',
    description:
      'Bloque «instalación / servicio» de la Home. Sus puntos se editan en «Puntos del servicio».',
    endpoint: 'isadecor/servicios-empresa',
    folder: 'isadecor/servicio',
    unitSlug: UNIT,
    noOrder: true,
    titleKey: 'titulo',
    subtitleKey: 'etiqueta',
    fields: [
      { key: 'etiqueta', label: 'Etiqueta', type: 'text', required: true, maxLength: 80 },
      { key: 'titulo', label: 'Título', type: 'text', required: true, maxLength: 160 },
      {
        key: 'descripcion',
        label: 'Descripción',
        type: 'textarea',
        required: true,
        maxLength: 400,
      },
      { key: 'textoBoton', label: 'Texto del botón', type: 'text', required: true, maxLength: 60 },
      {
        key: 'enlace',
        label: 'Enlace del botón',
        type: 'text',
        required: true,
        maxLength: 300,
        help: LINK_PATTERN_HELP,
      },
    ],
  },
  {
    key: 'isadecor-servicio-puntos',
    title: 'Puntos del servicio',
    description: 'Viñetas del bloque de servicio, en el orden indicado.',
    endpoint: 'isadecor/servicio-puntos',
    folder: 'isadecor/servicio',
    noActive: true,
    titleKey: 'texto',
    fields: [
      { key: 'texto', label: 'Texto', type: 'text', required: true, maxLength: 160 },
      {
        key: 'servicioId',
        label: 'Bloque de servicio',
        type: 'ref',
        required: true,
        ref: { endpoint: 'isadecor/servicios-empresa', labelKey: 'titulo' },
      },
    ],
  },
  {
    key: 'isadecor-secciones',
    title: 'Secciones de productos',
    description:
      '«Elige tu acabado» (tienda) y «Fáciles de instalar»: automáticas por demanda, manuales o mixtas, con productos fijados y excluidos.',
    endpoint: 'isadecor/secciones',
    folder: 'isadecor/secciones',
    unitSlug: UNIT,
    noOrder: true,
    selection: true,
    titleKey: 'titulo',
    subtitleKey: 'modo',
    fields: [
      {
        key: 'clave',
        label: 'Sección',
        type: 'select',
        required: true,
        options: [
          { value: 'TIENDA', label: 'Elige tu acabado' },
          { value: 'FACILES', label: 'Fáciles de instalar' },
        ],
      },
      { key: 'titulo', label: 'Título', type: 'text', required: true, maxLength: 120 },
      {
        key: 'textoEnlace',
        label: 'Texto del enlace «ver todo»',
        type: 'text',
        required: true,
        maxLength: 80,
      },
      {
        key: 'categoriaEnlace',
        label: 'Categoría del enlace (slug, opcional)',
        type: 'text',
        maxLength: 150,
      },
      {
        key: 'modo',
        label: 'Cómo se eligen los productos',
        type: 'select',
        required: true,
        options: [
          { value: 'AUTOMATICO', label: 'Automático (por demanda)' },
          { value: 'MANUAL', label: 'Manual (solo los fijados)' },
          { value: 'MIXTO', label: 'Mixto (fijados y luego por demanda)' },
        ],
      },
      {
        key: 'ventanaDias',
        label: 'Ventana de demanda (días)',
        type: 'number',
        required: true,
        help: 'Pedidos y cotizaciones de los últimos N días (1–365).',
      },
      {
        key: 'limite',
        label: 'Máximo de productos',
        type: 'number',
        required: true,
        help: 'Entre 1 y 24.',
      },
    ],
  },
  {
    key: 'isadecor-publicaciones',
    title: 'Videos de redes sociales',
    description:
      'Pega el enlace de un video o reel de Instagram: el título y la miniatura se obtienen solos. Salen en «Síguenos» del Home (los 4 primeros) y en la página Comunidad.',
    endpoint: 'isadecor/publicaciones',
    folder: 'isadecor/comunidad',
    unitSlug: UNIT,
    titleKey: 'titulo',
    subtitleKey: 'url',
    fields: [
      {
        key: 'url',
        label: 'Enlace de la publicación',
        type: 'text',
        required: true,
        maxLength: 500,
        help: 'Ej.: https://www.instagram.com/reel/XXXXXXXX/ — solo publicaciones o reels, no el perfil.',
      },
      {
        key: 'red',
        label: 'Red social',
        type: 'select',
        required: true,
        initial: 'INSTAGRAM',
        options: [{ value: 'INSTAGRAM', label: 'Instagram' }],
      },
      {
        key: 'titulo',
        label: 'Título (opcional)',
        type: 'text',
        maxLength: 200,
        help: 'Si lo dejas vacío se toma de la red.',
      },
      {
        key: 'miniaturaUrl',
        label: 'Miniatura (opcional)',
        type: 'image',
        help: 'Se obtiene sola de Instagram. Sube una imagen solo si no aparece o quieres otra.',
      },
    ],
  },
];

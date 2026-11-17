/** Una pantalla de administración por entidad, descrita como datos: la misma lista y el mismo formulario. */
export type SiteContentFieldType = 'text' | 'textarea' | 'number' | 'select' | 'image' | 'checkbox';

export interface SiteContentField {
  readonly key: string;
  readonly label: string;
  readonly type: SiteContentFieldType;
  readonly required?: boolean;
  readonly maxLength?: number;
  readonly options?: readonly { readonly value: string; readonly label: string }[];
  readonly help?: string;
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
    key: 'clientes-marca',
    title: 'Clientes y marcas',
    description: 'Logos de empresas e instituciones que confían en ISANORTE.',
    endpoint: 'clientes-marca',
    folder: 'isanorte/clientes',
    titleKey: 'nombre',
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true, maxLength: 150 },
      { key: 'logoUrl', label: 'Logo', type: 'image' },
      { key: 'enlace', label: 'Enlace', type: 'text', maxLength: 300 },
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
];

export interface HomeServicesHeaderView {
  eyebrow: string;
  title: string;
}

export interface HomeServiceActionView {
  label: string;
  url: string;
  order: number;
}

export interface HomeServiceCardView {
  id: string;
  slug: string;
  name: string;
  summary: string;
  imageUrl: string | null;
  imageAlt: string | null;
  linkUrl: string;
  order: number;
}

/** La Home actual todavía no dispone de una ruta `/servicios/:slug`. */
export const LEGACY_HOME_SERVICE_CARD_LINK = '#';

/**
 * Fallback transitorio de Servicios durante la migración pública. Sólo se usa
 * mientras carga el primer GET o si éste falla; nunca ante un success vacío.
 */
export const HOME_SERVICES_FALLBACK: {
  readonly header: HomeServicesHeaderView;
  readonly action: HomeServiceActionView;
  readonly services: readonly HomeServiceCardView[];
} = {
  header: {
    eyebrow: 'Nuestros Servicios',
    title: 'Soluciones integrales de alta\ningeniería y diseño',
  },
  action: { label: 'VER TODOS LOS SERVICIOS', url: '#', order: 0 },
  services: [
    {
      id: 'fallback-construccion',
      slug: 'construccion',
      name: 'Construcción Obra Civil',
      summary:
        'Estructuras de hormigón armado, edificaciones comerciales e industriales con los más altos estándares.',
      imageUrl:
        'https://casasinhaus.com/wp-content/uploads/2021/02/piscina-Mallorca-inHAUS-destacada.jpg',
      imageAlt: null,
      linkUrl: LEGACY_HOME_SERVICE_CARD_LINK,
      order: 0,
    },
    {
      id: 'fallback-acabados',
      slug: 'acabados',
      name: 'Acabados & Revestimientos',
      summary:
        'Instalación de porcelanatos, mármol, madera y microcemento con acabados de primera calidad.',
      imageUrl:
        'https://media.revistaad.es/photos/62bafacd4b8d2632f05347be/16:9/w_1920,c_limit/la-plage-foto-portada.jpg',
      imageAlt: null,
      linkUrl: LEGACY_HOME_SERVICE_CARD_LINK,
      order: 1,
    },
    {
      id: 'fallback-diseno',
      slug: 'diseno-interior',
      name: 'Diseño & Interiorismo',
      summary:
        'Creación de espacios funcionales y estéticos que reflejan tu estilo y personalidad.',
      imageUrl:
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
      imageAlt: null,
      linkUrl: LEGACY_HOME_SERVICE_CARD_LINK,
      order: 2,
    },
  ],
};

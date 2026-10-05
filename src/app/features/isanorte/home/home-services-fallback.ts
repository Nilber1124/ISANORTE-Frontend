import {
  HomeServiceActionView,
  HomeServiceCardView,
  HomeServicesHeaderView,
} from './home-view.model';

/**
 * TRANSITORIO — Fase 3B.
 * Se usa sólo si el único GET público de Home falla por completo. Una respuesta
 * correcta con `servicios: []` nunca llega a este contenido.
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
      id: '1',
      slug: 'construccion-obra-civil',
      name: 'Construcción Obra Civil',
      summary:
        'Estructuras de hormigón armado, edificaciones comerciales e industriales con los más altos estándares.',
      imageUrl:
        'https://casasinhaus.com/wp-content/uploads/2021/02/piscina-Mallorca-inHAUS-destacada.jpg',
      imageAlt: null,
      linkUrl: '#',
      order: 0,
    },
    {
      id: '2',
      slug: 'acabados-revestimientos',
      name: 'Acabados & Revestimientos',
      summary:
        'Instalación de porcelanatos, mármol, madera y microcemento con acabados de primera calidad.',
      imageUrl:
        'https://media.revistaad.es/photos/62bafacd4b8d2632f05347be/16:9/w_1920,c_limit/la-plage-foto-portada.jpg',
      imageAlt: null,
      linkUrl: '#',
      order: 1,
    },
    {
      id: '3',
      slug: 'diseno-interiorismo',
      name: 'Diseño & Interiorismo',
      summary:
        'Creación de espacios funcionales y estéticos que reflejan tu estilo y personalidad.',
      imageUrl:
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
      imageAlt: null,
      linkUrl: '#',
      order: 2,
    },
  ],
};

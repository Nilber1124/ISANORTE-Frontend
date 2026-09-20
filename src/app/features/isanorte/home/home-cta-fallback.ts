export interface HomeCtaCopyView {
  title: string;
  description: string;
}

export interface HomeCtaActionView {
  label: string;
  url: string;
  persistedUrl: string;
  order: number;
}

export interface HomeCtaFallback {
  copy: HomeCtaCopyView;
  backgroundUrl: string;
  action: HomeCtaActionView;
}

/** TRANSITORIO: se muestra únicamente mientras Home carga o si GET /home falla. */
export const HOME_CTA_FALLBACK: HomeCtaFallback = {
  copy: {
    title: '¿Tienes un proyecto en mente?',
    description:
      'Ofrecemos asesoría técnica integral sin costo para la estimación inicial de tu obra o acabados.',
  },
  backgroundUrl: '/images/asesora-consultoria.jpg',
  action: {
    label: 'SOLICITAR ASESORÍA GRATUITA',
    persistedUrl: '#contacto',
    url: '/contacto',
    order: 0,
  },
};

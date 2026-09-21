import { HomeCtaActionView, HomeCtaCopyView } from './home-view.model';

export const HOME_CTA_FALLBACK: {
  readonly copy: HomeCtaCopyView;
  readonly action: HomeCtaActionView;
  readonly bgImageUrl: string;
} = {
  copy: {
    title: '¿Tienes un proyecto en mente?',
    description:
      'Ofrecemos asesoría técnica integral sin costo para la estimación inicial de tu obra o acabados.',
  },
  action: {
    label: 'SOLICITAR ASESORÍA GRATUITA',
    url: '#contacto',
    persistedUrl: '#contacto',
    order: 0,
  },
  bgImageUrl: '/images/asesora-consultoria.jpg',
};

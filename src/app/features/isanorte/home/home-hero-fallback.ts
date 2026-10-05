import { CinematicScene } from '../../../shared/components/cinematic-tour/cinematic-tour';

export interface HeroViewData {
  tag: string;
  title: string;
  subtitle: string;
}

export interface HeroActionViewData {
  label: string;
  url: string;
  order: number;
}

/**
 * Fallback transitorio de Fase 3A. Sólo se utiliza mientras carga el primer GET
 * o cuando éste falla; una respuesta válida del backend siempre es la autoridad.
 */
export const HOME_HERO_FALLBACK: {
  readonly content: HeroViewData;
  readonly scenes: readonly CinematicScene[];
  readonly actions: readonly HeroActionViewData[];
} = {
  content: {
    tag: 'EMPRESA DE ARQUITECTURA Y CONSTRUCCIÓN',
    title: 'Transformamos espacios\nen experiencias',
    subtitle: 'Soluciones profesionales para construcción, obra civil y acabados.',
  },
  scenes: [
    { id: 'fallback-exterior', imageUrl: '/images/recorrido-exterior.jpg' },
    { id: 'fallback-sala', imageUrl: '/images/recorrido-sala.jpg' },
    { id: 'fallback-cocina', imageUrl: '/images/recorrido-cocina.jpg' },
    { id: 'fallback-bano', imageUrl: '/images/recorrido-bano.jpg' },
    { id: 'fallback-dormitorio', imageUrl: '/images/recorrido-dormitorio.jpg' },
  ],
  actions: [
    { label: 'SOLICITAR COTIZACIÓN', url: '#cotizar', order: 0 },
    { label: 'HABLA CON UN ASESOR', url: '#contacto', order: 1 },
  ],
};

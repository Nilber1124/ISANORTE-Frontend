import {
  PublicHomeSection,
  PublicHomeSectionType,
} from '../../../data/models/public-content/public-home.model';

export interface HomeProjectsHeaderView {
  eyebrow: string;
  title: string;
}

export interface HomeProjectsActionView {
  label: string;
  url: string;
  order: number;
}

export interface HomeProjectCardView {
  id: string;
  slug: string;
  name: string;
  location: string | null;
  dateLabel: string | null;
  metadata: string;
  imageUrl: string | null;
  imageAlt: string | null;
  order: number;
}

export const PUBLIC_PROJECTS_PATH = '/proyectos';

/**
 * Fallback transitorio de Fase 3D. Se utiliza exclusivamente cuando falla el
 * GET Home; una respuesta valida sin proyectos siempre oculta la seccion.
 */
export const HOME_PROJECTS_FALLBACK: {
  readonly section: PublicHomeSection;
  readonly header: HomeProjectsHeaderView;
  readonly action: HomeProjectsActionView;
  readonly projects: readonly HomeProjectCardView[];
} = {
  section: {
    tipo: PublicHomeSectionType.PROYECTOS,
    etiqueta: 'Obra en destacado',
    titulo: 'Excelencia entregada en cada\nmetro cuadrado',
    subtitulo: null,
    contenido: null,
    imagenUrl: null,
    imagenAlt: null,
    textoBoton: null,
    enlaceBoton: null,
    orden: 3,
    escenas: [],
    acciones: [{ texto: 'VER TODOS LOS PROYECTOS', enlace: '#', orden: 0 }],
  },
  header: {
    eyebrow: 'Obra en destacado',
    title: 'Excelencia entregada en cada\nmetro cuadrado',
  },
  action: { label: 'VER TODOS LOS PROYECTOS', url: PUBLIC_PROJECTS_PATH, order: 0 },
  projects: [
    {
      id: 'fallback-residencia-aura',
      slug: 'residencia-aura',
      name: 'Residencia Aura',
      location: 'Valle de los Chillos, Quito',
      dateLabel: 'Proyecto 2024',
      metadata: 'Valle de los Chillos, Quito - Proyecto 2024',
      imageUrl: '/images/residencia-aura.jpg',
      imageAlt: null,
      order: 0,
    },
    {
      id: 'fallback-edificio-tech-corporate',
      slug: 'edificio-tech-corporate',
      name: 'Edificio Tech-Corporate',
      location: 'Sector Financiero, Quito',
      dateLabel: 'Proyecto 2023',
      metadata: 'Sector Financiero, Quito - Proyecto 2023',
      imageUrl:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
      imageAlt: null,
      order: 1,
    },
  ],
};

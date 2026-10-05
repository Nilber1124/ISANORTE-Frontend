import {
  HomeProjectsActionView,
  HomeProjectCardView,
  HomeProjectsHeaderView,
} from './home-view.model';

export const HOME_PROJECTS_FALLBACK: {
  readonly header: HomeProjectsHeaderView;
  readonly action: HomeProjectsActionView;
  readonly projects: readonly HomeProjectCardView[];
} = {
  header: {
    eyebrow: 'Obra en destacado',
    title: 'Excelencia entregada en cada\nmetro cuadrado',
  },
  action: {
    label: 'VER TODOS LOS PROYECTOS',
    url: '/proyectos',
    order: 0,
  },
  projects: [
    {
      id: 'p1',
      slug: 'residencia-aura',
      name: 'Residencia Aura',
      location: 'Valle de los Chillos, Quito',
      dateLabel: 'Proyecto 2024',
      metadata: 'Valle de los Chillos, Quito - Proyecto 2024',
      imageUrl: '/images/residencia-aura.jpg',
      imageAlt: 'Residencia Aura',
      order: 0,
    },
    {
      id: 'p2',
      slug: 'edificio-tech-corporate',
      name: 'Edificio Tech-Corporate',
      location: 'Sector Financiero, Quito',
      dateLabel: 'Proyecto 2023',
      metadata: 'Sector Financiero, Quito - Proyecto 2023',
      imageUrl:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
      imageAlt: 'Edificio Tech-Corporate',
      order: 1,
    },
  ],
};

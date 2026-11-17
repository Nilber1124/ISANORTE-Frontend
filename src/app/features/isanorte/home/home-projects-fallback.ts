import { HomeProjectsActionView, HomeProjectsHeaderView } from './home-view.model';

/**
 * Solo cabecera y enlace de la sección Proyectos. Los proyectos nunca tienen respaldo local: si la
 * API no trae ninguno, la sección no se muestra (no se inventan obras ni ubicaciones).
 */
export const HOME_PROJECTS_FALLBACK: {
  readonly header: HomeProjectsHeaderView;
  readonly action: HomeProjectsActionView;
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
};

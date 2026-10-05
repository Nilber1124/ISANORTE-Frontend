import { PublicCompanyStatistic } from '../../../data/models/public-content/public-page.model';

export const HOME_STATISTICS_FALLBACK: readonly PublicCompanyStatistic[] = [
  { valor: 15, prefijo: '+', sufijo: '', etiqueta: 'Años de experiencia', orden: 0 },
  { valor: 120, prefijo: '', sufijo: '+', etiqueta: 'Proyectos entregados', orden: 1 },
  { valor: 45, prefijo: '', sufijo: 'k m²', etiqueta: 'Área construida', orden: 2 },
  { valor: 100, prefijo: '', sufijo: '%', etiqueta: 'Satisfacción y calidad', orden: 3 },
];

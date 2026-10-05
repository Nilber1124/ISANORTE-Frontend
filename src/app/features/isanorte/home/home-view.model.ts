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
  benefits?: readonly string[];
}

export interface HomeBusinessUnitActionView {
  label: string;
  url: string;
  order: number;
}

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

/** Rutas de navegación estructurales; no son contenido comercial administrable. */
export const PUBLIC_SERVICES_PATH = '/servicios';
export const PUBLIC_PROJECTS_PATH = '/proyectos';

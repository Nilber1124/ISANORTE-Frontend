export interface PublicNavigationLink {
  label: string;
  url: string;
}

export const PUBLIC_NAVIGATION_LINKS: readonly PublicNavigationLink[] = [
  { label: 'Inicio', url: '/' },
  { label: 'Nosotros', url: '/nosotros' },
  { label: 'Servicios', url: '/servicios' },
  { label: 'Proyectos', url: '/proyectos' },
  { label: 'Contacto', url: '/contacto' },
];

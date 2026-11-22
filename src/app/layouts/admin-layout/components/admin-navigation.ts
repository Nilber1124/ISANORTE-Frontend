export interface AdminNavigationItem {
  label: string;
  route: string;
  exact?: boolean;
  badge?: string;
}

export interface AdminNavigationGroup {
  /** Identificador estable (se usa para recordar si el grupo está plegado). */
  id: string;
  title: string;
  /** Marca a la que pertenece el grupo; solo sirve para el rótulo. */
  brand?: 'ISADECOR' | 'ISANORTE';
  items: readonly AdminNavigationItem[];
}

/** Menú del admin organizado por marca: lo de la tienda y lo de la constructora no se mezclan. */
export const ADMIN_NAVIGATION: readonly AdminNavigationGroup[] = [
  {
    id: 'principal',
    title: 'Principal',
    items: [{ label: 'Dashboard', route: '/admin', exact: true }],
  },
  {
    id: 'isadecor-tienda',
    title: 'Tienda',
    brand: 'ISADECOR',
    items: [
      { label: 'Productos', route: '/admin/productos' },
      { label: 'Categorías', route: '/admin/categorias' },
      { label: 'Cotizaciones', route: '/admin/cotizaciones' },
      { label: 'Pedidos', route: '/admin/pedidos' },
    ],
  },
  {
    id: 'isadecor-home',
    title: 'Home',
    brand: 'ISADECOR',
    items: [
      { label: 'Hero de la Home', route: '/admin/home-isadecor/hero' },
      { label: 'Cinta de avisos', route: '/admin/home-isadecor/cinta' },
      { label: 'Promociones', route: '/admin/home-isadecor/promociones' },
      { label: 'Campaña', route: '/admin/home-isadecor/campana' },
      { label: 'Secciones de productos', route: '/admin/home-isadecor/secciones' },
      { label: 'Bloque de servicio', route: '/admin/home-isadecor/servicio' },
      { label: 'Puntos del servicio', route: '/admin/home-isadecor/servicio-puntos' },
      { label: 'Reseñas del Home', route: '/admin/home-isadecor/resenas' },
      { label: 'Videos de redes', route: '/admin/home-isadecor/publicaciones' },
    ],
  },
  {
    id: 'isanorte-web',
    title: 'Web',
    brand: 'ISANORTE',
    items: [
      { label: 'Landing', route: '/admin/landing', badge: 'Hub' },
      { label: 'Proyectos', route: '/admin/proyectos' },
      { label: 'Servicios', route: '/admin/servicios' },
      { label: 'Contenido de la web', route: '/admin/sitio' },
    ],
  },
  {
    id: 'sitio',
    title: 'Sitio y empresa',
    items: [
      { label: 'Empresa', route: '/admin/empresa' },
      { label: 'Políticas', route: '/admin/sitio/politicas' },
      { label: 'Unidades de negocio', route: '/admin/unidades-negocio' },
      { label: 'Configuración del sitio', route: '/admin/configuracion' },
    ],
  },
];

const ITEMS = ADMIN_NAVIGATION.flatMap((group) => group.items);

/** Elemento del menú que corresponde a una URL (el de ruta más específica). */
export function findNavigationItem(url: string): AdminNavigationItem | undefined {
  const path = url.split(/[?#]/)[0].replace(/\/$/, '') || '/admin';
  return ITEMS.filter((item) =>
    item.exact ? path === item.route : path === item.route || path.startsWith(item.route + '/'),
  ).sort((a, b) => b.route.length - a.route.length)[0];
}

/** Grupo al que pertenece una URL. */
export function findNavigationGroup(url: string): AdminNavigationGroup | undefined {
  const item = findNavigationItem(url);
  return item ? ADMIN_NAVIGATION.find((group) => group.items.includes(item)) : undefined;
}

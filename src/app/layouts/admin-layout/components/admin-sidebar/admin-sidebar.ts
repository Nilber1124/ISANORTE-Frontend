import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { PendingQuotesBadgeService } from '../../../../core/services/pending-quotes-badge.service';

export interface AdminNavigationItem {
  label: string;
  route: string;
  exact?: boolean;
  badge?: string;
}

export interface AdminNavigationGroup {
  title: string;
  items: readonly AdminNavigationItem[];
}

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebar {
  readonly open = input(false);
  readonly navigationSelected = output<void>();
  readonly quoteBadge = inject(PendingQuotesBadgeService);

  readonly navigationGroups: readonly AdminNavigationGroup[] = [
    {
      title: 'Principal',
      items: [{ label: 'Dashboard', route: '/admin', exact: true }],
    },
    {
      title: 'Web ISANORTE',
      items: [
        { label: 'Landing', route: '/admin/landing', badge: 'Hub' },
        { label: 'Proyectos', route: '/admin/proyectos' },
        { label: 'Servicios', route: '/admin/servicios' },
        { label: 'Contacto', route: '/admin/contacto' },
      ],
    },
    {
      title: 'Contenido',
      items: [
        { label: 'Páginas y SEO', route: '/admin/contenido' },
        { label: 'Preguntas frecuentes', route: '/admin/sitio/faqs' },
        { label: 'Equipo', route: '/admin/sitio/equipo' },
        { label: 'Credenciales', route: '/admin/sitio/credenciales' },
        { label: 'Testimonios', route: '/admin/sitio/testimonios' },
        { label: 'Garantías', route: '/admin/sitio/garantias' },
        { label: 'Pasos del proceso', route: '/admin/sitio/pasos-proceso' },
        { label: 'Políticas', route: '/admin/sitio/politicas' },
        { label: 'Galería de proyectos', route: '/admin/sitio/proyecto-galeria' },
      ],
    },
    {
      title: 'Tienda ISADECOR',
      items: [
        { label: 'Categorías', route: '/admin/categorias' },
        { label: 'Productos', route: '/admin/productos' },
        { label: 'Cotizaciones', route: '/admin/cotizaciones' },
        { label: 'Pedidos', route: '/admin/pedidos' },
      ],
    },
    {
      title: 'Home ISADECOR',
      items: [
        { label: 'Hero de la Home', route: '/admin/home-isadecor/hero' },
        { label: 'Reseñas del Home', route: '/admin/home-isadecor/resenas' },
        { label: 'Cinta de avisos', route: '/admin/home-isadecor/cinta' },
        { label: 'Promociones', route: '/admin/home-isadecor/promociones' },
        { label: 'Campaña', route: '/admin/home-isadecor/campana' },
        { label: 'Bloque de servicio', route: '/admin/home-isadecor/servicio' },
        { label: 'Puntos del servicio', route: '/admin/home-isadecor/servicio-puntos' },
        { label: 'Secciones de productos', route: '/admin/home-isadecor/secciones' },
      ],
    },
    {
      title: 'Configuración',
      items: [
        { label: 'Empresa', route: '/admin/empresa' },
        { label: 'Unidades de negocio', route: '/admin/unidades-negocio' },
        { label: 'Configuración del sitio', route: '/admin/configuracion' },
      ],
    },
  ];

  readonly navigationItems: readonly AdminNavigationItem[] = this.navigationGroups.flatMap(
    (group) => group.items,
  );
}

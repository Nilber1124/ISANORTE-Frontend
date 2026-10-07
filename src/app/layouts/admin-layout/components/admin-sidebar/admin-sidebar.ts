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
      items: [{ label: 'Páginas y SEO', route: '/admin/contenido' }],
    },
    {
      title: 'Tienda ISADECOR',
      items: [
        { label: 'Categorías', route: '/admin/categorias' },
        { label: 'Productos', route: '/admin/productos' },
        { label: 'Cotizaciones', route: '/admin/cotizaciones' },
        { label: 'Accesos Rápidos', route: '/admin/isadecor-landing' },
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

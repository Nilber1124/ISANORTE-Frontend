import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface AdminNavigationItem {
  label: string;
  route: string;
  exact?: boolean;
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

  readonly navigationItems: readonly AdminNavigationItem[] = [
    { label: 'Dashboard', route: '/admin', exact: true },
    { label: 'Categorías', route: '/admin/categorias' },
    { label: 'Productos', route: '/admin/productos' },
    { label: 'Cotizaciones', route: '/admin/cotizaciones' },
    { label: 'Proyectos', route: '/admin/proyectos' },
    { label: 'Servicios', route: '/admin/servicios' },
    { label: 'Unidades de negocio', route: '/admin/unidades-negocio' },
    { label: 'Empresa', route: '/admin/empresa' },
    { label: 'Landing', route: '/admin/landing' },
    { label: 'Contenido', route: '/admin/contenido' },
    { label: 'Contacto', route: '/admin/contacto' },
    { label: 'Configuración', route: '/admin/configuracion' },
  ];
}

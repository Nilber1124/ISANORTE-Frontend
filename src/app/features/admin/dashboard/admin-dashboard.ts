import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Badge } from '../../../shared/components/badge/badge';
import { Card } from '../../../shared/components/card/card';

interface DashboardAccess {
  title: string;
  description: string;
  route: string;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [Badge, Card, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboard {
  readonly accesses: readonly DashboardAccess[] = [
    {
      title: 'Productos',
      description: 'Gestiona el catálogo de productos ISADECOR.',
      route: '/admin/productos',
    },
    {
      title: 'Categorías',
      description: 'Organiza las categorías disponibles para el catálogo.',
      route: '/admin/categorias',
    },
    {
      title: 'Cotizaciones',
      description: 'Gestiona las solicitudes recibidas desde ISADECOR.',
      route: '/admin/cotizaciones',
    },
    {
      title: 'Proyectos',
      description: 'Administra los proyectos publicados por ISANORTE.',
      route: '/admin/proyectos',
    },
  ];
}

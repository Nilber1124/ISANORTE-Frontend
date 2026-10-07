import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

import { ThemeService } from '../../../../core/services/theme.service';
import { AuthService } from '../../../../core/auth/auth.service';

const SECTION_LABELS: Record<string, string> = {
  '': 'Dashboard',
  landing: 'Landing',
  proyectos: 'Proyectos',
  servicios: 'Servicios',
  contacto: 'Contacto',
  contenido: 'Páginas y SEO',
  categorias: 'Categorías',
  productos: 'Productos',
  cotizaciones: 'Cotizaciones',
  'isadecor-landing': 'Accesos Rápidos ISADECOR',
  empresa: 'Empresa',
  'unidades-negocio': 'Unidades de negocio',
  configuracion: 'Configuración del sitio',
};

@Component({
  selector: 'app-admin-topbar',
  templateUrl: './admin-topbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTopbar {
  readonly menuOpen = input(false);
  readonly menuToggle = output<void>();
  readonly themeService = inject(ThemeService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
  );

  readonly currentSection = computed(() => {
    const segment = (this.currentUrl() ?? '').split('/')[2] ?? '';
    return SECTION_LABELS[segment] ?? 'Administración';
  });

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/acceso-interno']);
  }
}

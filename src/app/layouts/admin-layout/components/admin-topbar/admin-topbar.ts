import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

import { ThemeService } from '../../../../core/services/theme.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { findNavigationItem } from '../admin-navigation';
import { AccessibilityWidget } from '../../../../shared/components/accessibility-widget/accessibility-widget';

@Component({
  selector: 'app-admin-topbar',
  imports: [AccessibilityWidget],
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

  readonly currentSection = computed(
    () => findNavigationItem(this.currentUrl() ?? '')?.label ?? 'Administración',
  );

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/acceso-interno']);
  }
}

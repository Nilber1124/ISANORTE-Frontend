import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { ThemeService } from '../../../../core/services/theme.service';
import { AuthService } from '../../../../core/auth/auth.service';

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

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/acceso-interno']);
  }
}

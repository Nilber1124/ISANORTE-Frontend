import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-admin-topbar',
  templateUrl: './admin-topbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTopbar {
  readonly menuOpen = input(false);
  readonly menuToggle = output<void>();
  readonly themeService = inject(ThemeService);
}

import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PendingQuotesBadgeService } from '../../core/services/pending-quotes-badge.service';
import { AppToast } from '../../shared/components/toast/toast';
import { AdminSidebar } from './components/admin-sidebar/admin-sidebar';
import { AdminTopbar } from './components/admin-topbar/admin-topbar';

@Component({
  selector: 'app-admin-layout',
  imports: [AdminSidebar, AdminTopbar, AppToast, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout implements OnInit {
  readonly mobileMenuOpen = signal(false);
  private readonly pendingQuotesBadge = inject(PendingQuotesBadgeService);

  ngOnInit(): void {
    this.pendingQuotesBadge.load();
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}

import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

import {
  NotificationInbox,
  NotificationResponse,
} from '../../../../data/models/notification/notification.model';
import { NotificationApiService } from '../../../../data/services/notification-api.service';

const REFRESH_MS = 30_000;

/** Campana del panel: cuenta los avisos sin leer y abre la bandeja con los últimos pedidos y pagos. */
@Component({
  selector: 'app-admin-notifications',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <button
        type="button"
        class="relative inline-flex size-11 items-center justify-center rounded-control border border-border bg-surface text-text-secondary transition-colors duration-fast hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        [attr.aria-label]="
          inbox().noLeidas > 0
            ? 'Notificaciones: ' + inbox().noLeidas + ' sin leer'
            : 'Notificaciones'
        "
        aria-haspopup="true"
        [attr.aria-expanded]="open()"
        data-notifications-button
        (click)="toggle()"
      >
        <svg class="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Zm4 9a2 2 0 0 0 4 0"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.7"
          />
        </svg>
        @if (inbox().noLeidas > 0) {
          <span
            class="absolute -right-1 -top-1 min-w-5 rounded-full bg-accent px-1 text-center text-caption font-bold text-on-accent"
            data-notifications-count
            >{{ inbox().noLeidas > 9 ? '9+' : inbox().noLeidas }}</span
          >
        }
      </button>

      @if (open()) {
        <div
          class="absolute right-0 top-14 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-card border border-border bg-surface shadow-card"
          role="region"
          aria-label="Notificaciones"
          data-notifications-panel
        >
          <div class="flex items-center justify-between border-b border-border px-4 py-3">
            <p class="text-body-sm font-semibold text-text-primary">Avisos</p>
            @if (inbox().noLeidas > 0) {
              <button
                type="button"
                class="text-caption font-semibold text-text-secondary hover:text-text-primary"
                (click)="markAllRead()"
              >
                Marcar como leídos
              </button>
            }
          </div>
          @if (inbox().items.length === 0) {
            <p class="px-4 py-6 text-body-sm text-text-muted">Aún no hay avisos.</p>
          } @else {
            <ul class="m-0 max-h-96 list-none divide-y divide-border overflow-y-auto p-0">
              @for (item of inbox().items; track item.id) {
                <li>
                  <button
                    type="button"
                    class="block w-full px-4 py-3 text-left hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    [class.bg-background-soft]="!item.leida"
                    (click)="go(item)"
                  >
                    <span class="block text-body-sm font-semibold text-text-primary">{{
                      item.titulo
                    }}</span>
                    <span class="block text-caption text-text-secondary">{{ item.mensaje }}</span>
                    <span class="mt-1 block text-caption text-text-muted">{{
                      item.fechaCreacion | date: 'dd/MM HH:mm'
                    }}</span>
                  </button>
                </li>
              }
            </ul>
          }
        </div>
      }
    </div>
  `,
})
export class AdminNotifications {
  private readonly api = inject(NotificationApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly inbox = signal<NotificationInbox>({ noLeidas: 0, items: [] });
  protected readonly open = signal(false);

  constructor() {
    // Solo en el navegador: el prerender no tiene sesión de administrador.
    afterNextRender(() => {
      this.refresh();
      const timer = setInterval(() => this.refresh(), REFRESH_MS);
      this.destroyRef.onDestroy(() => clearInterval(timer));
    });
  }

  protected toggle(): void {
    this.open.update((value) => !value);
    if (this.open()) this.refresh();
  }

  protected markAllRead(): void {
    this.api.markAllRead().subscribe({ next: () => this.refresh() });
  }

  protected go(item: NotificationResponse): void {
    this.open.set(false);
    if (item.enlace) void this.router.navigateByUrl(item.enlace);
  }

  private refresh(): void {
    this.api.getInbox().subscribe({
      next: (inbox) => this.inbox.set(inbox),
      error: () => undefined,
    });
  }
}

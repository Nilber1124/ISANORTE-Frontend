import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import {
  ADMIN_NAVIGATION,
  AdminNavigationGroup,
  AdminNavigationItem,
  findNavigationGroup,
} from '../admin-navigation';

export type { AdminNavigationGroup, AdminNavigationItem };

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebar {
  readonly open = input(false);
  readonly navigationSelected = output<void>();
  private readonly router = inject(Router);

  readonly navigationGroups = ADMIN_NAVIGATION;
  readonly navigationItems: readonly AdminNavigationItem[] = ADMIN_NAVIGATION.flatMap(
    (group) => group.items,
  );

  readonly query = signal('');
  /** Grupos abiertos por el usuario (además del que contiene la página actual). */
  private readonly opened = signal<ReadonlySet<string>>(new Set(['isadecor-tienda']));
  private readonly closed = signal<ReadonlySet<string>>(new Set());

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );
  private readonly activeGroupId = computed(() => findNavigationGroup(this.currentUrl())?.id);

  /** Grupos con sus ítems ya filtrados por la búsqueda; los que quedan vacíos se ocultan. */
  readonly visibleGroups = computed(() => {
    const term = this.normalize(this.query());
    return this.navigationGroups
      .map((group) => ({
        group,
        items: term
          ? group.items.filter((item) =>
              this.normalize(`${item.label} ${group.brand ?? ''} ${group.title}`).includes(term),
            )
          : group.items,
      }))
      .filter((entry) => entry.items.length > 0);
  });

  constructor() {
    // Al navegar, el grupo de la página actual se vuelve a abrir.
    effect(() => {
      const id = this.activeGroupId();
      if (!id) return;
      this.closed.update((set) => {
        if (!set.has(id)) return set;
        const next = new Set(set);
        next.delete(id);
        return next;
      });
    });
  }

  isExpanded(group: AdminNavigationGroup): boolean {
    if (group.id === 'principal' || this.query().trim()) return true;
    if (this.closed().has(group.id)) return false;
    return this.opened().has(group.id) || this.activeGroupId() === group.id;
  }

  toggle(group: AdminNavigationGroup): void {
    const expanded = this.isExpanded(group);
    const flip = (set: ReadonlySet<string>, on: boolean) => {
      const next = new Set(set);
      if (on) next.add(group.id);
      else next.delete(group.id);
      return next;
    };
    this.opened.update((set) => flip(set, !expanded));
    this.closed.update((set) => flip(set, expanded));
  }

  setQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim();
  }
}

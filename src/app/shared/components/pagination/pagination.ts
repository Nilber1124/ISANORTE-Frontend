import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class Pagination {
  /** Página actual, base 0. */
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly totalItems = input.required<number>();

  /** Emite la nueva página, base 0. */
  readonly pageChange = output<number>();

  protected readonly hasPrevious = computed(() => this.currentPage() > 0);
  protected readonly hasNext = computed(() => this.currentPage() < this.totalPages() - 1);

  /** Páginas visibles (base 0), con huecos marcados como null para mostrar "…". */
  protected readonly visiblePages = computed<(number | null)[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index);
    }

    const pages = new Set<number>([0, total - 1, current, current - 1, current + 1]);
    const sorted = [...pages].filter((page) => page >= 0 && page < total).sort((a, b) => a - b);

    const result: (number | null)[] = [];
    let previous: number | null = null;
    for (const page of sorted) {
      if (previous !== null && page - previous > 1) {
        result.push(null);
      }
      result.push(page);
      previous = page;
    }
    return result;
  });

  protected goTo(page: number): void {
    if (page < 0 || page >= this.totalPages() || page === this.currentPage()) return;
    this.pageChange.emit(page);
  }

  protected goToPrevious(): void {
    this.goTo(this.currentPage() - 1);
  }

  protected goToNext(): void {
    this.goTo(this.currentPage() + 1);
  }
}

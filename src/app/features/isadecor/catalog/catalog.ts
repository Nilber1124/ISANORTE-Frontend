import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { Alert } from '../../../shared/components/alert/alert';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { InputField } from '../../../shared/components/input-field/input-field';
import { Loading } from '../../../shared/components/loading/loading';
import { SelectField, SelectOption } from '../../../shared/components/select-field/select-field';
import { CatalogFacade, CatalogSortOption } from './catalog.facade';
import { ProductCard } from './components/product-card/product-card';

@Component({
  selector: 'app-isadecor-catalog',
  imports: [Alert, Button, EmptyState, InputField, Loading, ProductCard, SelectField],
  providers: [CatalogFacade],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Catalog {
  readonly facade = inject(CatalogFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly sortOptions: readonly SelectOption[] = [
    { value: 'featured', label: 'Destacados primero' },
    { value: 'price-asc', label: 'Precio: menor a mayor' },
    { value: 'price-desc', label: 'Precio: mayor a menor' },
    { value: 'name-asc', label: 'Nombre: A a Z' },
  ];

  readonly mobileFiltersOpen = signal(false);

  readonly selectedCategory = computed(() => {
    const catId = this.facade.selectedCategory();
    if (!catId) return null;
    return (
      this.facade
        .categories()
        .find((c) => c.id === catId || c.slug === catId) ?? null
    );
  });

  readonly activeFiltersCount = computed(() => {
    let count = 0;
    if (this.facade.selectedCategory() !== null) count++;
    if (this.facade.searchTerm().trim().length > 0) count++;
    if (this.facade.onlyDiscount()) count++;
    if (this.facade.onlyInStock()) count++;
    if (this.facade.sortOption() !== 'featured') count++;
    return count;
  });

  constructor() {
    afterNextRender(() => {
      this.facade.load();
      this.route.queryParamMap
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((params) => {
          this.facade.setSearchTerm(params.get('q') ?? '');
          this.facade.setSelectedCategory(params.get('categoria') ?? null);
        });
    });
  }

  protected updateSortOption(value: string): void {
    this.facade.setSortOption(value as CatalogSortOption);
  }

  protected handleCategoryClick(categoryId: string | null): void {
    if (this.facade.selectedCategory() === categoryId) {
      this.facade.setSelectedCategory(null);
    } else {
      this.facade.setSelectedCategory(categoryId);
    }
  }

  protected toggleMobileFilters(): void {
    this.mobileFiltersOpen.update((open) => !open);
  }

  protected closeMobileFilters(): void {
    this.mobileFiltersOpen.set(false);
  }
}

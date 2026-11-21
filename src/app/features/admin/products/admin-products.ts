import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';

import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { ProductPublicationStatus } from '../../../data/models/product/product-publication-status.enum';
import { ProductResponse } from '../../../data/models/product/product-response.model';
import { Alert } from '../../../shared/components/alert/alert';
import { Badge, BadgeVariant } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { InputField } from '../../../shared/components/input-field/input-field';
import { Loading } from '../../../shared/components/loading/loading';
import { Modal } from '../../../shared/components/modal/modal';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { SelectField, SelectOption } from '../../../shared/components/select-field/select-field';
import { AdminProductsFacade } from './admin-products.facade';
import { ProductForm, ProductFormSubmission } from './components/product-form/product-form';

@Component({
  selector: 'app-admin-products',
  imports: [
    Alert,
    Badge,
    Button,
    EmptyState,
    InputField,
    Loading,
    Modal,
    Pagination,
    ProductForm,
    SelectField,
  ],
  providers: [AdminProductsFacade],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProducts {
  readonly facade = inject(AdminProductsFacade);
  readonly statusProduct = signal<ProductResponse | null>(null);
  readonly nextStatus = signal<ProductPublicationStatus>(ProductPublicationStatus.BORRADOR);
  readonly statusOptions: readonly SelectOption[] = [
    { value: ProductPublicationStatus.BORRADOR, label: 'Borrador' },
    { value: ProductPublicationStatus.PUBLICADO, label: 'Publicado' },
    { value: ProductPublicationStatus.OCULTO, label: 'Oculto' },
  ];

  static readonly pageSize = 20;

  readonly query = signal('');
  readonly categoryFilter = signal('');
  readonly statusFilter = signal('');
  readonly stockFilter = signal('');
  readonly page = signal(0);

  readonly stockOptions: readonly SelectOption[] = [
    { value: '', label: 'Todo el stock' },
    { value: 'agotado', label: 'Agotados' },
    { value: 'bajo', label: 'Stock bajo' },
  ];
  readonly statusFilterOptions: readonly SelectOption[] = [
    { value: '', label: 'Todos los estados' },
    ...this.statusOptions,
  ];
  readonly categoryOptions = computed<readonly SelectOption[]>(() => [
    { value: '', label: 'Todas las categorías' },
    ...this.facade.categories().map((category) => ({ value: category.id, label: category.nombre })),
  ]);

  readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    const category = this.categoryFilter();
    const status = this.statusFilter();
    const stock = this.stockFilter();
    return this.facade.products().filter((product) => {
      if (query && !`${product.nombre} ${product.sku} ${product.slug}`.toLowerCase().includes(query))
        return false;
      if (category && !product.categorias?.some((c) => c.id === category)) return false;
      if (status && product.estado !== status) return false;
      if (stock && this.stockState(product) !== stock) return false;
      return true;
    });
  });
  readonly hasFilters = computed(
    () => !!(this.query() || this.categoryFilter() || this.statusFilter() || this.stockFilter()),
  );
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / AdminProducts.pageSize)),
  );
  readonly pageItems = computed(() => {
    const start = Math.min(this.page(), this.totalPages() - 1) * AdminProducts.pageSize;
    return this.filtered().slice(start, start + AdminProducts.pageSize);
  });

  constructor() {
    afterNextRender(() => this.facade.load());
  }

  protected save(submission: ProductFormSubmission): void {
    if (submission.mode === 'create') {
      this.facade.create(submission.request);
      return;
    }
    this.facade.update(submission.request);
  }

  protected openStatusChange(product: ProductResponse): void {
    this.statusProduct.set(product);
    this.nextStatus.set(product.estado);
  }

  protected confirmStatusChange(): void {
    const product = this.statusProduct();
    if (product === null || product.estado === this.nextStatus()) return;
    this.facade.changeStatus(product, this.nextStatus());
    this.statusProduct.set(null);
  }

  protected closeStatusChange(): void {
    if (this.facade.changingStatusId() !== null) return;
    this.statusProduct.set(null);
  }

  protected updateNextStatus(status: string): void {
    this.nextStatus.set(status as ProductPublicationStatus);
  }

  protected categoryNames(product: ProductResponse): string {
    return product.categorias?.map((category) => category.nombre).join(', ') ?? 'Sin categorías';
  }

  protected statusLabel(status: ProductPublicationStatus): string {
    return {
      [ProductPublicationStatus.BORRADOR]: 'Borrador',
      [ProductPublicationStatus.PUBLICADO]: 'Publicado',
      [ProductPublicationStatus.OCULTO]: 'Oculto',
    }[status];
  }

  protected statusVariant(status: ProductPublicationStatus): BadgeVariant {
    return {
      [ProductPublicationStatus.BORRADOR]: 'warning' as const,
      [ProductPublicationStatus.PUBLICADO]: 'success' as const,
      [ProductPublicationStatus.OCULTO]: 'neutral' as const,
    }[status];
  }

  protected availabilityLabel(availability: ProductAvailability): string {
    return {
      [ProductAvailability.DISPONIBLE]: 'Disponible',
      [ProductAvailability.AGOTADO]: 'Agotado',
      [ProductAvailability.BAJO_PEDIDO]: 'Bajo pedido',
      [ProductAvailability.CONSULTAR]: 'Consultar',
    }[availability];
  }

  protected setFilter(target: 'query' | 'categoryFilter' | 'statusFilter' | 'stockFilter', value: string): void {
    this[target].set(value);
    this.page.set(0);
  }

  protected clearFilters(): void {
    this.query.set('');
    this.categoryFilter.set('');
    this.statusFilter.set('');
    this.stockFilter.set('');
    this.page.set(0);
  }

  /** Stock total: suma de acabados con control, o el stock del propio producto. */
  protected totalStock(product: ProductResponse): number | null {
    const controlled = (product.variantes ?? []).filter((v) => v.stockActual != null);
    if (controlled.length > 0) return controlled.reduce((sum, v) => sum + (v.stockActual ?? 0), 0);
    return product.stockActual ?? null;
  }

  protected stockState(product: ProductResponse): 'agotado' | 'bajo' | 'ok' | 'sin-control' {
    const total = this.totalStock(product);
    if (product.disponibilidad === ProductAvailability.AGOTADO) return 'agotado';
    if (total === null) return 'sin-control';
    if (total <= 0) return 'agotado';
    if ((product.stockMinimo ?? 0) > 0 && total <= (product.stockMinimo ?? 0)) return 'bajo';
    return 'ok';
  }

  protected thumbnail(product: ProductResponse): string | null {
    const images = product.imagenes ?? [];
    return (images.find((image) => image.esPrincipal) ?? images[0])?.url ?? null;
  }
}

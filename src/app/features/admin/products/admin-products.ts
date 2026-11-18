import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';

import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { ProductPublicationStatus } from '../../../data/models/product/product-publication-status.enum';
import { ProductResponse } from '../../../data/models/product/product-response.model';
import { Alert } from '../../../shared/components/alert/alert';
import { Badge, BadgeVariant } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { Modal } from '../../../shared/components/modal/modal';
import { SelectField, SelectOption } from '../../../shared/components/select-field/select-field';
import { AdminProductsFacade } from './admin-products.facade';
import { ProductForm, ProductFormSubmission } from './components/product-form/product-form';

@Component({
  selector: 'app-admin-products',
  imports: [Alert, Badge, Button, EmptyState, Loading, Modal, ProductForm, SelectField],
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
}

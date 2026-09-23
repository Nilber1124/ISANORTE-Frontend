import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { IsadecorQuoteCartService } from '../../../core/services/isadecor-quote-cart.service';
import { ProductDocumentType } from '../../../data/models/product/product-document-type.enum';
import {
  PublicProductDocumentResponse,
  PublicProductDetailResponse,
  PublicProductVariantResponse,
} from '../../../data/models/public-content/public-product-detail.model';
import { Badge, BadgeVariant } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { ProductGallery } from './components/product-gallery/product-gallery';
import { ProductInfo } from './components/product-info/product-info';
import { ProductDetailFacade } from './product-detail.facade';
import { ProductPriceComparison } from './components/product-price-comparison/product-price-comparison';
import { ProductCompetitorComparison } from './components/product-competitor-comparison/product-competitor-comparison';

interface VariantAvailabilityPresentation {
  label: string;
  variant: BadgeVariant;
}

@Component({
  selector: 'app-isadecor-product-detail',
  imports: [
    Badge,
    Button,
    Card,
    DecimalPipe,
    EmptyState,
    Loading,
    ProductGallery,
    ProductInfo,
    ProductPriceComparison,
    ProductCompetitorComparison,
    RouterLink,
  ],
  providers: [ProductDetailFacade],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail {
  readonly facade = inject(ProductDetailFacade);
  readonly cart = inject(IsadecorQuoteCartService);
  readonly quoteQuantity = signal<number | null>(null);
  readonly cartQuantity = signal(1);
  readonly selectedVariant = signal<PublicProductVariantResponse | null>(null);
  readonly cartFeedback = signal<string | null>(null);
  readonly activeTab = signal<'descripcion' | 'especificaciones' | 'recursos'>('descripcion');
  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.quoteQuantity.set(null);
      this.cartQuantity.set(1);
      this.selectedVariant.set(null);
      this.cartFeedback.set(null);
      this.facade.load(params.get('slug') ?? '');
    });
  }

  protected selectVariant(variant: PublicProductVariantResponse | null): void {
    if (variant?.disponible === false) return;
    this.selectedVariant.set(variant);
    this.cartFeedback.set(null);
  }

  protected updateCartQuantity(event: Event): void {
    const input = event.target as HTMLInputElement;
    const quantity = input.valueAsNumber;
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      input.value = String(this.cartQuantity());
      this.cartFeedback.set('La cantidad debe ser un número entero mayor que cero.');
      return;
    }

    this.cartQuantity.set(quantity);
    this.cartFeedback.set(null);
  }

  protected useCalculatedQuantity(quantity: number | null): void {
    this.quoteQuantity.set(quantity);
    this.cartQuantity.set(quantity ?? 1);
    this.cartFeedback.set(null);
  }

  protected addToCart(product: PublicProductDetailResponse): void {
    const item = this.cart.addProduct(product, this.selectedVariant(), this.cartQuantity());
    this.cartFeedback.set(
      `Carrito actualizado: ${item.quantity} ${item.quantity === 1 ? 'unidad' : 'unidades'} de este producto.`,
    );
  }

  protected variantAvailability(
    variant: PublicProductVariantResponse,
  ): VariantAvailabilityPresentation {
    if (variant.disponible === true) {
      return { label: 'Disponible', variant: 'success' };
    }

    if (variant.disponible === false) {
      return { label: 'No disponible', variant: 'error' };
    }

    return { label: 'Consultar', variant: 'info' };
  }

  protected documentTypeLabel(type: ProductDocumentType): string {
    const labels: Record<ProductDocumentType, string> = {
      [ProductDocumentType.CATALOGO]: 'Catálogo',
      [ProductDocumentType.FICHA_TECNICA]: 'Ficha técnica',
      [ProductDocumentType.MANUAL]: 'Manual',
      [ProductDocumentType.OTRO]: 'Documento',
    };

    return labels[type];
  }

  protected documentMetadata(document: PublicProductDocumentResponse): string {
    const metadata = [document.formato?.trim().toLocaleUpperCase('es')];

    if (document.tamanoBytes !== null) {
      metadata.push(this.formatFileSize(document.tamanoBytes));
    }

    return metadata.filter(Boolean).join(' · ');
  }

  protected quoteQueryParams(slug: string): { producto: string; cantidad?: number } {
    const quantity = this.quoteQuantity();
    return quantity === null ? { producto: slug } : { producto: slug, cantidad: quantity };
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

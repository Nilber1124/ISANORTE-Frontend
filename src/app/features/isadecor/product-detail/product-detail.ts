import { DOCUMENT, DatePipe, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClienteAuthService } from '../../../core/auth/cliente-auth.service';

import { IsadecorQuoteCartService } from '../../../core/services/isadecor-quote-cart.service';
import { ProductDocumentType } from '../../../data/models/product/product-document-type.enum';
import { ProductReviewOrder } from '../../../data/models/product/product-review.model';
import {
  PublicProductDocumentResponse,
  PublicProductDetailResponse,
  PublicProductVariantResponse,
} from '../../../data/models/public-content/public-product-detail.model';
import { Badge, BadgeVariant } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { Modal } from '../../../shared/components/modal/modal';
import { ClienteAuthForm } from '../cuenta/components/cliente-auth-form/cliente-auth-form';
import { ProductGallery } from './components/product-gallery/product-gallery';
import { ProductInfo } from './components/product-info/product-info';
import { ProductCompetitorComparison } from './components/product-competitor-comparison/product-competitor-comparison';
import { ProductPriceComparison } from './components/product-price-comparison/product-price-comparison';
import { ProductDetailFacade } from './product-detail.facade';

interface VariantAvailabilityPresentation {
  label: string;
  variant: BadgeVariant;
}

@Component({
  selector: 'app-isadecor-product-detail',
  imports: [
    Badge,
    Button,
    DatePipe,
    DecimalPipe,
    EmptyState,
    Loading,
    Modal,
    ClienteAuthForm,
    ProductGallery,
    ProductInfo,
    ProductCompetitorComparison,
    ProductPriceComparison,
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
  readonly auth = inject(ClienteAuthService);
  readonly authModalOpen = signal(false);
  readonly reviewFormOpen = signal(false);
  readonly reviewRating = signal(0);
  readonly reviewTitle = signal('');
  readonly reviewComment = signal('');
  readonly failedRecommendationImages = signal<ReadonlySet<string>>(new Set());
  readonly stars = [1, 2, 3, 4, 5] as const;
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.quoteQuantity.set(null);
      this.cartQuantity.set(1);
      this.selectedVariant.set(null);
      this.cartFeedback.set(null);
      this.authModalOpen.set(false);
      this.reviewFormOpen.set(false);
      this.reviewRating.set(0);
      this.reviewTitle.set('');
      this.reviewComment.set('');
      this.facade.clearReviewSubmissionState();
      this.failedRecommendationImages.set(new Set());
      this.facade.load(params.get('slug') ?? '');
    });
    effect(() => {
      if (this.facade.reviewAuthenticationRequired()) this.authModalOpen.set(true);
    });
    effect(() => {
      if (!this.facade.reviewSubmitted()) return;
      this.reviewFormOpen.set(false);
      this.reviewRating.set(0);
      this.reviewTitle.set('');
      this.reviewComment.set('');
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

  protected changeReviewOrder(event: Event): void {
    this.facade.setReviewOrder((event.target as HTMLSelectElement).value as ProductReviewOrder);
  }

  protected clientInitial(name: string): string {
    return name.trim().charAt(0).toLocaleUpperCase('es') || '?';
  }

  protected recommendationImageAvailable(slug: string): boolean {
    return !this.failedRecommendationImages().has(slug);
  }

  protected markRecommendationImageAsFailed(slug: string): void {
    this.failedRecommendationImages.update((current) => new Set([...current, slug]));
  }

  protected startReview(rating?: number): void {
    if (rating) this.reviewRating.set(rating);
    this.facade.clearReviewSubmissionState();
    if (!this.auth.token()) { this.authModalOpen.set(true); return; }
    this.reviewFormOpen.set(true);
    this.scrollToReviews();
  }

  protected authenticationCompleted(): void {
    this.authModalOpen.set(false);
    this.reviewFormOpen.set(true);
    this.facade.clearReviewSubmissionState();
    this.scrollToReviews();
  }

  protected submitReview(event: Event): void {
    event.preventDefault();
    if (this.reviewRating() < 1 || this.reviewRating() > 5 || !this.reviewComment().trim()) return;
    this.facade.submitReview({ calificacion: this.reviewRating(), titulo: this.reviewTitle().trim() || null, comentario: this.reviewComment().trim() });
  }

  protected textValue(event: Event): string { return (event.target as HTMLInputElement | HTMLTextAreaElement).value; }

  private scrollToReviews(): void {
    if (!this.browser) return;
    requestAnimationFrame(() => this.document.getElementById('product-review-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
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

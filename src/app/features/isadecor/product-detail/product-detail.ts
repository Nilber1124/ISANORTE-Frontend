import { DOCUMENT, DatePipe, DecimalPipe, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
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
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { Modal } from '../../../shared/components/modal/modal';
import { ClienteAuthForm } from '../cuenta/components/cliente-auth-form/cliente-auth-form';
import { ProductGallery } from './components/product-gallery/product-gallery';
import { ProductCalculator } from './components/product-calculator/product-calculator';
import { toHomeProductCard } from './recommended-product.mapper';
import { HomeProductTile, UNIT_LABELS } from '../home/product-tile/product-tile';
import { ProductDetailFacade } from './product-detail.facade';
import { canBuy, canQuote, isQuoteOnly } from '../product-actions';
import { PublicSiteFacade } from '../../../layouts/public-layout/public-site.facade';
import { LONG_DESCRIPTION_CHARS, parseDescription } from './product-description';

@Component({
  selector: 'app-isadecor-product-detail',
  imports: [
    Button,
    DatePipe,
    DecimalPipe,
    EmptyState,
    Loading,
    Modal,
    ClienteAuthForm,
    ProductGallery,
    ProductCalculator,
    HomeProductTile,
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
  private readonly selectedVariantSku = signal<string | null>(null);
  readonly selectedVariant = computed(() => {
    const available = this.facade.variants().filter((variant) => !this.isSoldOut(variant));
    return (
      available.find((variant) => variant.sku === this.selectedVariantSku()) ?? available[0] ?? null
    );
  });
  protected readonly unit = computed(
    () => UNIT_LABELS[this.facade.product()?.unidadVenta ?? 'UNIDAD'],
  );
  protected readonly price = computed(
    () => this.selectedVariant()?.precio ?? this.facade.product()?.precioBase ?? null,
  );
  private readonly site = inject(PublicSiteFacade);

  /** WhatsApp con el producto, el acabado y la cantidad ya escritos; null si no hay número comercial. */
  protected readonly quoteHref = computed(() => {
    const product = this.facade.product();
    if (!product) return null;
    const variant = this.selectedVariant();
    const quantity = this.cartQuantity();
    const detail = variant ? ` (${variant.nombre})` : '';
    return this.site.whatsappHrefFor(
      `Hola ISADECOR, quisiera cotizar ${product.nombre}${detail}: ${quantity} ${this.unit()}.`,
    );
  });
  protected readonly descriptionBlocks = computed(() =>
    parseDescription(this.facade.product()?.descripcion ?? ''),
  );
  protected readonly descriptionLong = computed(
    () => (this.facade.product()?.descripcion ?? '').length > LONG_DESCRIPTION_CHARS,
  );
  protected readonly descriptionExpanded = signal(false);
  protected readonly canBuyNow = computed(() => {
    const product = this.facade.product();
    return canBuy(product?.modalidad, this.price(), this.purchaseBlocked());
  });
  protected readonly quoteAllowed = computed(() => canQuote(this.facade.product()?.modalidad));
  protected readonly quoteOnly = computed(() => isQuoteOnly(this.facade.product()?.modalidad));
  protected readonly purchaseBlocked = computed(() => {
    const product = this.facade.product();
    return (
      product?.estadoStock === 'AGOTADO' ||
      product?.disponibilidad === 'AGOTADO' ||
      (this.facade.variants().length > 0 && this.selectedVariant() === null)
    );
  });
  protected readonly recommendedCards = computed(() =>
    this.facade.recommendedProducts().map(toHomeProductCard),
  );
  readonly cartFeedback = signal<string | null>(null);
  readonly auth = inject(ClienteAuthService);
  readonly authModalOpen = signal(false);
  readonly reviewFormOpen = signal(false);
  readonly reviewRating = signal(0);
  readonly reviewTitle = signal('');
  readonly reviewComment = signal('');
  readonly stars = [1, 2, 3, 4, 5] as const;
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.quoteQuantity.set(null);
      this.cartQuantity.set(1);
      this.selectedVariantSku.set(null);
      this.cartFeedback.set(null);
      this.authModalOpen.set(false);
      this.reviewFormOpen.set(false);
      this.reviewRating.set(0);
      this.reviewTitle.set('');
      this.reviewComment.set('');
      this.facade.clearReviewSubmissionState();
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

  protected isSoldOut(variant: PublicProductVariantResponse): boolean {
    return variant.agotado === true || variant.disponible === false;
  }

  protected selectVariant(variant: PublicProductVariantResponse): void {
    if (this.isSoldOut(variant)) return;
    this.selectedVariantSku.set(variant.sku);
    this.cartFeedback.set(null);
  }

  protected selectVariantBySku(sku: string): void {
    const variant = this.facade.variants().find((item) => item.sku === sku);
    if (variant) this.selectVariant(variant);
  }

  protected stepQuantity(delta: number): void {
    this.cartQuantity.update((current) => Math.min(Math.max(current + delta, 1), 999_999));
    this.cartFeedback.set(null);
  }

  protected toggleDescription(): void {
    this.descriptionExpanded.update((expanded) => !expanded);
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
    if (this.purchaseBlocked()) return;
    const item = this.cart.addProduct(product, this.selectedVariant(), this.cartQuantity());
    this.cartFeedback.set(
      `${isQuoteOnly(product.modalidad) ? 'Cotización' : 'Carrito'} actualizado: cantidad ${item.quantity}.`,
    );
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

  protected changeReviewOrder(event: Event): void {
    this.facade.setReviewOrder((event.target as HTMLSelectElement).value as ProductReviewOrder);
  }

  protected clientInitial(name: string): string {
    return name.trim().charAt(0).toLocaleUpperCase('es') || '?';
  }

  protected startReview(rating?: number): void {
    if (rating) this.reviewRating.set(rating);
    this.facade.clearReviewSubmissionState();
    if (!this.auth.token()) {
      this.authModalOpen.set(true);
      return;
    }
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
    this.facade.submitReview({
      calificacion: this.reviewRating(),
      titulo: this.reviewTitle().trim() || null,
      comentario: this.reviewComment().trim(),
    });
  }

  protected textValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement).value;
  }

  private scrollToReviews(): void {
    if (!this.browser) return;
    requestAnimationFrame(() =>
      this.document
        .getElementById('product-review-form')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    );
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

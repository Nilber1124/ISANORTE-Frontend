import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

import { PublicProductImageResponse } from '../../../../../data/models/public-content/public-product-catalog.model';

@Component({
  selector: 'app-product-gallery',
  templateUrl: './product-gallery.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGallery {
  readonly images = input<PublicProductImageResponse[] | null>(null);
  readonly preferredImage = input<string | null>(null);
  readonly productName = input.required<string>();
  /** SKU del acabado elegido: la imagen principal pasa a la primera foto de ese acabado. */
  readonly variantSku = input<string | null>(null);
  /** Se emite el SKU del acabado de la miniatura pulsada (null si es una foto general). */
  readonly finishPicked = output<string>();

  private readonly selected = signal<{ url: string; sku: string | null } | null>(null);
  private readonly failedImageUrls = signal<ReadonlySet<string>>(new Set());

  private readonly sku = computed(() => this.variantSku()?.toLowerCase() ?? null);

  private readonly orderedImages = computed(() =>
    [...(this.images() ?? [])].sort(
      (first, second) =>
        (first.orden ?? Number.MAX_SAFE_INTEGER) - (second.orden ?? Number.MAX_SAFE_INTEGER),
    ),
  );

  private readonly hasOwnImages = computed(() => {
    const sku = this.sku();
    return !!sku && this.orderedImages().some((image) => image.varianteSku?.toLowerCase() === sku);
  });

  /** Todas las fotos del producto (de todos los acabados): se ven como miniaturas. */
  protected readonly availableImages = computed(() => {
    const failedUrls = this.failedImageUrls();
    const images = this.orderedImages();
    const preferred = this.hasOwnImages() ? null : this.preferredImage();
    const extra =
      preferred && !images.some((image) => image.url === preferred)
        ? [{ url: preferred, alt: null, orden: null, esPrincipal: false, varianteSku: this.variantSku() }]
        : [];
    return [...images, ...extra].filter((image) => !failedUrls.has(image.url));
  });

  protected readonly mainImage = computed(() => {
    const images = this.availableImages();
    const sku = this.sku();
    const selected = this.selected();
    const selectedImage =
      selected && selected.sku === sku ? images.find((image) => image.url === selected.url) : null;
    const preferred = this.hasOwnImages() ? null : this.preferredImage();

    return (
      selectedImage ??
      (sku ? images.find((image) => image.varianteSku?.toLowerCase() === sku) : null) ??
      images.find((image) => image.url === preferred) ??
      images.find((image) => image.esPrincipal === true) ??
      images[0] ??
      null
    );
  });

  protected selectImage(image: PublicProductImageResponse): void {
    // El acabado de la foto pasa a ser el elegido: se recuerda aquí para que, al llegar
    // el nuevo SKU desde la ficha, esta misma foto siga siendo la principal.
    const nextSku = (image.varianteSku ?? this.variantSku())?.toLowerCase() ?? null;
    this.selected.set({ url: image.url, sku: nextSku });
    if (image.varianteSku) {
      this.finishPicked.emit(image.varianteSku);
    }
  }

  protected step(delta: 1 | -1): void {
    const images = this.availableImages();
    if (images.length < 2) return;
    const current = images.findIndex((image) => image.url === this.mainImage()?.url);
    const next = images[(current + delta + images.length) % images.length];
    this.selectImage(next);
  }

  protected markImageAsFailed(imageUrl: string): void {
    this.failedImageUrls.update((failedUrls) => new Set([...failedUrls, imageUrl]));
  }

  protected imageAlt(image: PublicProductImageResponse): string {
    return image.alt?.trim() || this.productName();
  }
}

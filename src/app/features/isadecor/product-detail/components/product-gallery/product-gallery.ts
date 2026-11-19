import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

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

  private readonly selectedImageUrl = signal<{ url: string; preferred: string | null } | null>(
    null,
  );
  private readonly failedImageUrls = signal<ReadonlySet<string>>(new Set());

  protected readonly orderedImages = computed(() =>
    [...(this.images() ?? [])].sort(
      (first, second) =>
        (first.orden ?? Number.MAX_SAFE_INTEGER) - (second.orden ?? Number.MAX_SAFE_INTEGER),
    ),
  );

  protected readonly availableImages = computed(() => {
    const failedUrls = this.failedImageUrls();
    const images = this.orderedImages();
    const preferred = this.preferredImage();
    const extra =
      preferred && !images.some((image) => image.url === preferred)
        ? [{ url: preferred, alt: null, orden: null, esPrincipal: false }]
        : [];
    return [...images, ...extra].filter((image) => !failedUrls.has(image.url));
  });

  protected readonly mainImage = computed(() => {
    const images = this.availableImages();
    const preferred = this.preferredImage();
    const selected = this.selectedImageUrl();
    const selectedImage =
      selected?.preferred === preferred
        ? images.find((image) => image.url === selected?.url)
        : null;

    return (
      selectedImage ??
      images.find((image) => image.url === preferred) ??
      images.find((image) => image.esPrincipal === true) ??
      images[0] ??
      null
    );
  });

  protected selectImage(imageUrl: string): void {
    this.selectedImageUrl.set({ url: imageUrl, preferred: this.preferredImage() });
  }

  protected markImageAsFailed(imageUrl: string): void {
    this.failedImageUrls.update((failedUrls) => new Set([...failedUrls, imageUrl]));
  }

  protected imageAlt(image: PublicProductImageResponse): string {
    return image.alt?.trim() || this.productName();
  }
}

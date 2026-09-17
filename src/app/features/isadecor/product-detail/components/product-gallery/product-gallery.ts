import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import { ProductImageResponse } from '../../../../../data/models/product/product-response.model';

@Component({
  selector: 'app-product-gallery',
  templateUrl: './product-gallery.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGallery {
  readonly images = input<ProductImageResponse[] | null>(null);
  readonly productName = input.required<string>();

  private readonly selectedImageId = signal<string | null>(null);
  private readonly failedImageIds = signal<ReadonlySet<string>>(new Set());

  protected readonly orderedImages = computed(() =>
    [...(this.images() ?? [])].sort(
      (first, second) =>
        (first.orden ?? Number.MAX_SAFE_INTEGER) - (second.orden ?? Number.MAX_SAFE_INTEGER),
    ),
  );

  protected readonly availableImages = computed(() => {
    const failedImages = this.failedImageIds();
    return this.orderedImages().filter((image) => !failedImages.has(image.id));
  });

  protected readonly mainImage = computed(() => {
    const images = this.availableImages();
    const selectedImage = images.find((image) => image.id === this.selectedImageId());

    return selectedImage ?? images.find((image) => image.esPrincipal === true) ?? images[0] ?? null;
  });

  protected selectImage(imageId: string): void {
    this.selectedImageId.set(imageId);
  }

  protected markImageAsFailed(imageId: string): void {
    this.failedImageIds.update((failedImages) => new Set([...failedImages, imageId]));
  }

  protected imageAlt(image: ProductImageResponse): string {
    return image.altText?.trim() || this.productName();
  }
}

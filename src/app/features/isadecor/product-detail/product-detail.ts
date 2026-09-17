import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ProductDocumentType } from '../../../data/models/product/product-document-type.enum';
import {
  ProductDocumentResponse,
  ProductVariantResponse,
} from '../../../data/models/product/product-response.model';
import { Badge, BadgeVariant } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { ProductGallery } from './components/product-gallery/product-gallery';
import { ProductInfo } from './components/product-info/product-info';
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
    Card,
    DecimalPipe,
    EmptyState,
    Loading,
    ProductGallery,
    ProductInfo,
    RouterLink,
  ],
  providers: [ProductDetailFacade],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail {
  readonly facade = inject(ProductDetailFacade);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    afterNextRender(() => {
      this.facade.load(this.route.snapshot.paramMap.get('slug') ?? '');
    });
  }

  protected variantAvailability(variant: ProductVariantResponse): VariantAvailabilityPresentation {
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

  protected documentMetadata(document: ProductDocumentResponse): string {
    const metadata = [document.formato?.trim().toLocaleUpperCase('es')];

    if (document.tamanoBytes !== null) {
      metadata.push(this.formatFileSize(document.tamanoBytes));
    }

    return metadata.filter(Boolean).join(' · ');
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

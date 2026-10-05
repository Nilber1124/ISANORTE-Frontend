import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

import {
  PublicProductDetailResponse,
  PublicProductVariantResponse,
} from '../../data/models/public-content/public-product-detail.model';

export interface IsadecorQuoteCartVariant {
  sku: string;
  name: string;
  price: number | null;
}

export interface IsadecorQuoteCartItem {
  key: string;
  productSlug: string;
  productName: string;
  productSku: string;
  imageUrl: string | null;
  imageAlt: string;
  variant: IsadecorQuoteCartVariant | null;
  quantity: number;
  unitPrice: number | null;
}

const STORAGE_KEY = 'isadecor_quote_cart_v1';
const MAX_QUANTITY = 999_999;

@Injectable({ providedIn: 'root' })
export class IsadecorQuoteCartService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly _items = signal<readonly IsadecorQuoteCartItem[]>([]);

  readonly items = this._items.asReadonly();
  readonly itemCount = computed(() => this._items().length);
  readonly totalQuantity = computed(() =>
    this._items().reduce((total, item) => total + item.quantity, 0),
  );
  readonly estimatedTotal = computed(() =>
    this._items().reduce(
      (total, item) => total + (item.unitPrice === null ? 0 : item.unitPrice * item.quantity),
      0,
    ),
  );
  readonly pricedItemCount = computed(
    () => this._items().filter((item) => item.unitPrice !== null).length,
  );
  readonly hasCompletePricing = computed(
    () => this._items().length > 0 && this.pricedItemCount() === this._items().length,
  );

  constructor() {
    this.restoreFromStorage();
  }

  addProduct(
    product: PublicProductDetailResponse,
    variant: PublicProductVariantResponse | null,
    requestedQuantity: number,
  ): IsadecorQuoteCartItem {
    const quantity = this.validQuantity(requestedQuantity) ? requestedQuantity : 1;
    const normalizedVariant = variant
      ? {
          sku: variant.sku.trim(),
          name: variant.nombre.trim(),
          price: this.validPrice(variant.precio) ? variant.precio : null,
        }
      : null;
    const key = this.itemKey(product.slug, normalizedVariant?.sku ?? null);
    const current = this._items().find((item) => item.key === key);

    if (current) {
      const updated = { ...current, quantity: Math.min(current.quantity + quantity, MAX_QUANTITY) };
      this.replaceItem(updated);
      return updated;
    }

    const mainImage =
      product.imagenes.find((image) => image.esPrincipal) ?? product.imagenes[0] ?? null;
    const productPrice = this.validPrice(product.precioBase) ? product.precioBase : null;
    const item: IsadecorQuoteCartItem = {
      key,
      productSlug: product.slug.trim(),
      productName: product.nombre.trim(),
      productSku: product.sku.trim(),
      imageUrl:
        normalizedVariant && variant?.imagenUrl?.trim()
          ? variant.imagenUrl.trim()
          : mainImage?.url.trim() || null,
      imageAlt: mainImage?.alt?.trim() || product.nombre.trim(),
      variant: normalizedVariant,
      quantity,
      unitPrice: normalizedVariant?.price ?? productPrice,
    };

    this.setItems([...this._items(), item]);
    return item;
  }

  updateQuantity(key: string, quantity: number): boolean {
    if (!this.validQuantity(quantity)) return false;
    const current = this._items().find((item) => item.key === key);
    if (!current) return false;

    this.replaceItem({ ...current, quantity });
    return true;
  }

  removeItem(key: string): void {
    this.setItems(this._items().filter((item) => item.key !== key));
  }

  clear(): void {
    this.setItems([]);
  }

  subtotal(item: IsadecorQuoteCartItem): number | null {
    return item.unitPrice === null ? null : item.unitPrice * item.quantity;
  }

  buildWhatsAppMessage(): string {
    if (this._items().length === 0) return '';

    const lines = [
      'Hola, deseo solicitar una cotización de ISADECOR:',
      '',
      ...this._items().flatMap((item, index) => {
        const productLines = [`${index + 1}. ${item.productName}`, `SKU: ${item.productSku}`];
        if (item.variant) {
          productLines.push(`Variante: ${item.variant.name} (SKU: ${item.variant.sku})`);
        }
        productLines.push(`Cantidad: ${item.quantity}`);
        if (item.unitPrice !== null) {
          productLines.push(`Precio referencial unitario: ${this.formatPen(item.unitPrice)}`);
          productLines.push(
            `Subtotal referencial: ${this.formatPen(item.unitPrice * item.quantity)}`,
          );
        } else {
          productLines.push('Precio referencial: por confirmar');
        }
        return [...productLines, ''];
      }),
    ];

    if (this.pricedItemCount() > 0) {
      lines.push(
        `${this.hasCompletePricing() ? 'Total estimado' : 'Total estimado parcial'}: ${this.formatPen(this.estimatedTotal())}`,
        '',
      );
    }
    lines.push('Agradeceré confirmar disponibilidad y precio final.');

    return lines.join('\n').trim();
  }

  buildWhatsAppUrl(phone: string | null | undefined): string | null {
    const normalizedPhone = phone?.replace(/\D/g, '') ?? '';
    const message = this.buildWhatsAppMessage();
    if (normalizedPhone.length < 8 || message.length === 0) return null;

    return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
  }

  private replaceItem(updated: IsadecorQuoteCartItem): void {
    this.setItems(this._items().map((item) => (item.key === updated.key ? updated : item)));
  }

  private setItems(items: readonly IsadecorQuoteCartItem[]): void {
    this._items.set(items);
    const storage = this.storage();
    if (!storage) return;

    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // The cart remains available in memory when storage is disabled or full.
    }
  }

  private restoreFromStorage(): void {
    const storage = this.storage();
    if (!storage) return;

    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;

      this._items.set(parsed.flatMap((value) => this.parseStoredItem(value)));
    } catch {
      // Invalid or inaccessible storage must not prevent navigation.
    }
  }

  private parseStoredItem(value: unknown): IsadecorQuoteCartItem[] {
    if (!this.isRecord(value)) return [];
    const productSlug = this.nonEmptyString(value['productSlug']);
    const productName = this.nonEmptyString(value['productName']);
    const productSku = this.nonEmptyString(value['productSku']);
    const quantity = value['quantity'];
    if (!productSlug || !productName || !productSku || !this.validQuantity(quantity)) return [];

    const variant = this.parseStoredVariant(value['variant']);
    if (value['variant'] !== null && variant === null) return [];
    const unitPrice = this.validPrice(value['unitPrice']) ? value['unitPrice'] : null;
    const imageUrl =
      typeof value['imageUrl'] === 'string' && value['imageUrl'].trim()
        ? value['imageUrl'].trim()
        : null;
    const imageAlt = this.nonEmptyString(value['imageAlt']) ?? productName;

    return [
      {
        key: this.itemKey(productSlug, variant?.sku ?? null),
        productSlug,
        productName,
        productSku,
        imageUrl,
        imageAlt,
        variant,
        quantity,
        unitPrice,
      },
    ];
  }

  private parseStoredVariant(value: unknown): IsadecorQuoteCartVariant | null {
    if (value === null) return null;
    if (!this.isRecord(value)) return null;
    const sku = this.nonEmptyString(value['sku']);
    const name = this.nonEmptyString(value['name']);
    if (!sku || !name) return null;
    return {
      sku,
      name,
      price: this.validPrice(value['price']) ? value['price'] : null,
    };
  }

  private storage(): Storage | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      return this.document.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }

  private itemKey(productSlug: string, variantSku: string | null): string {
    return `${productSlug.trim()}::${variantSku?.trim() ?? ''}`;
  }

  private validQuantity(value: unknown): value is number {
    return (
      typeof value === 'number' && Number.isSafeInteger(value) && value > 0 && value <= MAX_QUANTITY
    );
  }

  private validPrice(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
  }

  private nonEmptyString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private formatPen(value: number): string {
    return `S/ ${value.toFixed(2)}`;
  }
}

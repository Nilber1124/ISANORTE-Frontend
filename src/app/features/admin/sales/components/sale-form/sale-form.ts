import { ChangeDetectionStrategy, Component, OnInit, computed, input, output, signal } from '@angular/core';

import { ProductResponse } from '../../../../../data/models/product/product-response.model';
import {
  SALE_CHANNEL_LABELS,
  SALE_PAYMENT_LABELS,
  SaleChannel,
  SaleDocumentType,
  SalePaymentMethod,
  SaleRequest,
  SaleResponse,
} from '../../../../../data/models/sale/sale.model';
import { Alert } from '../../../../../shared/components/alert/alert';
import { Button } from '../../../../../shared/components/button/button';
import { Drawer } from '../../../../../shared/components/drawer/drawer';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { SelectField, SelectOption } from '../../../../../shared/components/select-field/select-field';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';

interface LineDraft {
  readonly key: number;
  productoId: string;
  varianteId: string;
  nombre: string;
  sku: string;
  cantidad: string;
  precio: string;
}

const todayIso = (): string => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

/**
 * Formulario para registrar una venta hecha fuera de la web (WhatsApp, tienda…). Las líneas pueden ser productos
 * del catálogo (descuentan su stock al guardar) o artículos libres (no mueven stock).
 */
@Component({
  selector: 'app-sale-form',
  imports: [Alert, Button, Drawer, InputField, SelectField, TextareaField],
  templateUrl: './sale-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleForm implements OnInit {
  readonly sale = input<SaleResponse | null>(null);
  readonly products = input.required<readonly ProductResponse[]>();
  readonly submitting = input(false);
  readonly serverError = input<string | null>(null);

  readonly canceled = output<void>();
  readonly saved = output<SaleRequest>();

  protected readonly channelOptions: readonly SelectOption[] = (Object.keys(SALE_CHANNEL_LABELS) as SaleChannel[]).map(
    (value) => ({ value, label: SALE_CHANNEL_LABELS[value] }),
  );
  protected readonly paymentOptions: readonly SelectOption[] = (Object.keys(SALE_PAYMENT_LABELS) as SalePaymentMethod[]).map(
    (value) => ({ value, label: SALE_PAYMENT_LABELS[value] }),
  );
  protected readonly documentOptions: readonly SelectOption[] = [
    { value: '', label: 'Sin documento' },
    { value: 'DNI', label: 'DNI' },
    { value: 'RUC', label: 'RUC' },
  ];

  protected readonly fecha = signal(todayIso());
  protected readonly canal = signal<string>('WHATSAPP');
  protected readonly clienteNombre = signal('');
  protected readonly clienteTelefono = signal('');
  protected readonly tipoDocumento = signal<string>('');
  protected readonly documento = signal('');
  protected readonly razonSocial = signal('');
  protected readonly metodoPago = signal<string>('YAPE');
  protected readonly pagado = signal(true);
  protected readonly notas = signal('');
  protected readonly lines = signal<readonly LineDraft[]>([]);
  protected readonly submitted = signal(false);
  private nextKey = 1;

  /** Opciones del selector de productos: el catálogo o «Otro artículo» (texto libre). */
  protected readonly productOptions = computed<readonly SelectOption[]>(() => [
    { value: '', label: 'Otro artículo (escribir a mano)' },
    ...this.products().map((p) => ({ value: p.id, label: `${p.nombre} · ${p.sku}` })),
  ]);

  protected readonly total = computed(() =>
    this.lines().reduce((sum, line) => sum + this.number(line.cantidad) * this.number(line.precio), 0),
  );

  protected readonly errors = computed(() => {
    if (!this.submitted()) return { lines: [] as string[], document: null as string | null, general: null as string | null };
    const lines = this.lines().map((line, index) => this.lineError(line, index));
    return {
      lines,
      document: this.documentError(),
      general: this.lines().length === 0 ? 'Añade al menos una línea.' : null,
    };
  });

  ngOnInit(): void {
    const sale = this.sale();
    if (sale === null) {
      this.addLine();
      return;
    }
    this.fecha.set(sale.fechaVenta);
    this.canal.set(sale.canal);
    this.clienteNombre.set(sale.clienteNombre ?? '');
    this.clienteTelefono.set(sale.clienteTelefono ?? '');
    this.tipoDocumento.set(sale.tipoDocumento ?? '');
    this.documento.set(sale.documento ?? '');
    this.razonSocial.set(sale.razonSocial ?? '');
    this.metodoPago.set(sale.metodoPago);
    this.pagado.set(sale.pagado);
    this.notas.set(sale.notas ?? '');
    this.lines.set(
      sale.detalles.map((d) => ({
        key: this.nextKey++,
        productoId: d.productoId ?? '',
        varianteId: d.varianteId ?? '',
        nombre: d.nombre,
        sku: d.sku ?? '',
        cantidad: String(d.cantidad),
        precio: String(d.precioUnitario),
      })),
    );
  }

  protected addLine(): void {
    this.lines.update((list) => [
      ...list,
      { key: this.nextKey++, productoId: '', varianteId: '', nombre: '', sku: '', cantidad: '1', precio: '' },
    ]);
  }

  protected removeLine(key: number): void {
    this.lines.update((list) => list.filter((line) => line.key !== key));
  }

  protected product(line: LineDraft): ProductResponse | undefined {
    return this.products().find((p) => p.id === line.productoId);
  }

  protected variantOptions(line: LineDraft): readonly SelectOption[] {
    const variants = this.product(line)?.variantes ?? [];
    return [
      { value: '', label: variants.length ? 'Elige el acabado' : '—' },
      ...variants.map((v) => ({ value: v.id, label: v.nombre })),
    ];
  }

  protected hasVariants(line: LineDraft): boolean {
    return (this.product(line)?.variantes?.length ?? 0) > 0;
  }

  /** Stock disponible de la línea (`null` = ese producto no controla stock). */
  protected stockOf(line: LineDraft): number | null {
    const product = this.product(line);
    if (!product) return null;
    if (line.varianteId) return product.variantes?.find((v) => v.id === line.varianteId)?.stockActual ?? null;
    return product.variantes?.some((v) => v.stockActual != null) ? null : (product.stockActual ?? null);
  }

  protected stockNote(line: LineDraft): string | null {
    if (!line.productoId) return 'Artículo libre: no mueve stock.';
    const stock = this.stockOf(line);
    if (stock === null) return this.hasVariants(line) && !line.varianteId ? null : 'Este producto no controla stock.';
    return this.number(line.cantidad) > stock ? `Solo hay ${stock} en stock.` : `Stock actual: ${stock}.`;
  }

  protected stockExceeded(line: LineDraft): boolean {
    const stock = this.stockOf(line);
    return stock !== null && this.number(line.cantidad) > stock;
  }

  protected chooseProduct(key: number, productId: string): void {
    const product = this.products().find((p) => p.id === productId);
    this.patchLine(key, {
      productoId: productId,
      varianteId: '',
      nombre: product ? product.nombre : '',
      sku: product ? product.sku : '',
      precio: product?.precioBase != null ? String(product.precioBase) : '',
    });
  }

  protected chooseVariant(key: number, varianteId: string): void {
    const line = this.lines().find((l) => l.key === key);
    const product = line ? this.product(line) : undefined;
    const variant = product?.variantes?.find((v) => v.id === varianteId);
    if (!product) return;
    this.patchLine(key, {
      varianteId,
      nombre: variant ? `${product.nombre} - ${variant.nombre}` : product.nombre,
      sku: variant ? variant.sku : product.sku,
      precio: String(variant?.precio ?? product.precioBase ?? ''),
    });
  }

  protected setLine(key: number, field: 'nombre' | 'cantidad' | 'precio', value: string): void {
    this.patchLine(key, { [field]: value });
  }

  protected lineSubtotal(line: LineDraft): number {
    return this.number(line.cantidad) * this.number(line.precio);
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.submitting()) return;
    const errors = this.errors();
    if (errors.general || errors.document || errors.lines.some(Boolean) || !this.fecha()) return;

    const type = this.tipoDocumento() as SaleDocumentType | '';
    this.saved.emit({
      canal: this.canal() as SaleChannel,
      fechaVenta: this.fecha(),
      clienteNombre: this.optional(this.clienteNombre()),
      clienteTelefono: this.optional(this.clienteTelefono()),
      tipoDocumento: type === '' ? null : type,
      documento: type === '' ? null : this.documento().trim(),
      razonSocial: type === 'RUC' ? this.optional(this.razonSocial()) : null,
      metodoPago: this.metodoPago() as SalePaymentMethod,
      pagado: this.pagado(),
      notas: this.optional(this.notas()),
      detalles: this.lines().map((line) => ({
        productoId: line.productoId || null,
        varianteId: line.varianteId || null,
        nombre: line.nombre.trim(),
        sku: this.optional(line.sku),
        cantidad: Math.trunc(this.number(line.cantidad)),
        precioUnitario: this.number(line.precio),
      })),
    });
  }

  private lineError(line: LineDraft, index: number): string {
    if (!line.nombre.trim()) return `Línea ${index + 1}: escribe qué se vendió.`;
    const quantity = this.number(line.cantidad);
    if (!Number.isInteger(quantity) || quantity < 1) return `Línea ${index + 1}: la cantidad debe ser 1 o más.`;
    if (line.precio.trim() === '' || this.number(line.precio) < 0) return `Línea ${index + 1}: pon el precio.`;
    if (this.hasVariants(line) && !line.varianteId && this.product(line)?.variantes?.some((v) => v.stockActual != null)) {
      return `Línea ${index + 1}: elige el acabado.`;
    }
    return '';
  }

  private documentError(): string | null {
    const type = this.tipoDocumento();
    const doc = this.documento().trim();
    if (type === 'DNI' && !/^\d{8}$/.test(doc)) return 'El DNI debe tener 8 dígitos.';
    if (type === 'RUC' && !/^\d{11}$/.test(doc)) return 'El RUC debe tener 11 dígitos.';
    return null;
  }

  private patchLine(key: number, patch: Partial<LineDraft>): void {
    this.lines.update((list) => list.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  private number(value: string): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private optional(value: string): string | null {
    return value.trim() || null;
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

import { BusinessUnitResponse } from '../../../../../data/models/business-unit/business-unit-response.model';
import { CategoryResponse } from '../../../../../data/models/category/category-response.model';
import { ProductAvailability } from '../../../../../data/models/product/product-availability.enum';
import { ProductCreateRequest } from '../../../../../data/models/product/product-create-request.model';
import { ProductPublicationStatus } from '../../../../../data/models/product/product-publication-status.enum';
import { ProductResponse } from '../../../../../data/models/product/product-response.model';
import { ProductUpdateRequest } from '../../../../../data/models/product/product-update-request.model';
import { Alert } from '../../../../../shared/components/alert/alert';
import { Button } from '../../../../../shared/components/button/button';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Modal } from '../../../../../shared/components/modal/modal';
import {
  SelectField,
  SelectOption,
} from '../../../../../shared/components/select-field/select-field';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';
import { ProductFormMode } from '../../admin-products.facade';

export type ProductFormSubmission =
  | { mode: 'create'; request: ProductCreateRequest }
  | { mode: 'edit'; request: ProductUpdateRequest };

interface ProductFormErrors {
  sku?: string;
  nombre?: string;
  slug?: string;
  descripcion?: string;
  precioBase?: string;
  precioAnterior?: string;
  descuentoPorcentaje?: string;
  unidadNegocioId?: string;
}

@Component({
  selector: 'app-product-form',
  imports: [Alert, Button, InputField, Modal, SelectField, TextareaField],
  templateUrl: './product-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductForm implements OnInit {
  readonly mode = input.required<ProductFormMode>();
  readonly product = input<ProductResponse | null>(null);
  readonly businessUnits = input.required<readonly BusinessUnitResponse[]>();
  readonly categories = input.required<readonly CategoryResponse[]>();
  readonly loadingFormData = input(false);
  readonly submitting = input(false);
  readonly serverError = input<string | null>(null);

  readonly canceled = output<void>();
  readonly saved = output<ProductFormSubmission>();

  readonly sku = signal('');
  readonly nombre = signal('');
  readonly slug = signal('');
  readonly resumen = signal('');
  readonly descripcion = signal('');
  readonly precioBase = signal('');
  readonly precioAnterior = signal('');
  readonly descuentoPorcentaje = signal('');
  readonly disponibilidad = signal<ProductAvailability>(ProductAvailability.DISPONIBLE);
  readonly destacado = signal(false);
  readonly estado = signal<ProductPublicationStatus>(ProductPublicationStatus.BORRADOR);
  readonly tituloSeo = signal('');
  readonly descripcionSeo = signal('');
  readonly unidadNegocioId = signal('');
  readonly categoriaIds = signal<readonly string[]>([]);
  readonly submitted = signal(false);

  readonly businessUnitOptions = computed<readonly SelectOption[]>(() => [
    { value: '', label: 'Selecciona una unidad' },
    ...this.businessUnits().map((unit) => ({ value: unit.id, label: unit.nombre })),
  ]);
  readonly availableCategories = computed<readonly CategoryResponse[]>(() => {
    const businessUnitId = this.unidadNegocioId();
    return this.categories().filter(
      (category) =>
        category.unidadNegocio === null ||
        (businessUnitId !== '' && category.unidadNegocio.id === businessUnitId),
    );
  });
  readonly availabilityOptions: readonly SelectOption[] = [
    { value: ProductAvailability.DISPONIBLE, label: 'Disponible' },
    { value: ProductAvailability.AGOTADO, label: 'Agotado' },
    { value: ProductAvailability.BAJO_PEDIDO, label: 'Bajo pedido' },
    { value: ProductAvailability.CONSULTAR, label: 'Consultar' },
  ];
  readonly publicationOptions: readonly SelectOption[] = [
    { value: ProductPublicationStatus.BORRADOR, label: 'Borrador' },
    { value: ProductPublicationStatus.PUBLICADO, label: 'Publicado' },
    { value: ProductPublicationStatus.OCULTO, label: 'Oculto' },
  ];
  readonly errors = computed<ProductFormErrors>(() => this.validationErrors());

  ngOnInit(): void {
    const product = this.product();
    if (product === null) return;

    this.sku.set(product.sku);
    this.nombre.set(product.nombre);
    this.slug.set(product.slug);
    this.resumen.set(product.resumen ?? '');
    this.descripcion.set(product.descripcion);
    this.precioBase.set(this.numberValue(product.precioBase));
    this.precioAnterior.set(this.numberValue(product.precioAnterior));
    this.descuentoPorcentaje.set(this.numberValue(product.descuentoPorcentaje));
    this.disponibilidad.set(product.disponibilidad);
    this.destacado.set(product.destacado === true);
    this.estado.set(product.estado);
    this.tituloSeo.set(product.tituloSeo ?? '');
    this.descripcionSeo.set(product.descripcionSeo ?? '');
    this.unidadNegocioId.set(product.unidadNegocio.id);
    this.categoriaIds.set(product.categorias?.map((category) => category.id) ?? []);
    this.removeIncompatibleCategories();
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.hasErrors() || this.submitting()) return;

    const common = {
      sku: this.sku().trim(),
      nombre: this.nombre().trim(),
      slug: this.slug().trim(),
      resumen: this.optionalValue(this.resumen()),
      descripcion: this.descripcion().trim(),
      precioBase: this.optionalNumber(this.precioBase()),
      precioAnterior: this.optionalNumber(this.precioAnterior()),
      descuentoPorcentaje: this.optionalNumber(this.descuentoPorcentaje()),
      disponibilidad: this.disponibilidad(),
      destacado: this.destacado(),
      estado: this.estado(),
      tituloSeo: this.optionalValue(this.tituloSeo()),
      descripcionSeo: this.optionalValue(this.descripcionSeo()),
      unidadNegocioId: this.unidadNegocioId(),
      categoriaIds: [...this.categoriaIds()],
    };

    if (this.mode() === 'create') {
      this.saved.emit({ mode: 'create', request: common });
      return;
    }

    this.saved.emit({ mode: 'edit', request: common });
  }

  protected updateFeatured(event: Event): void {
    this.destacado.set((event.target as HTMLInputElement).checked);
  }

  protected updateAvailability(value: string): void {
    this.disponibilidad.set(value as ProductAvailability);
  }

  protected updatePublicationStatus(value: string): void {
    this.estado.set(value as ProductPublicationStatus);
  }

  protected updateBusinessUnit(value: string): void {
    this.unidadNegocioId.set(value);
    this.removeIncompatibleCategories();
  }

  protected updateCategory(categoryId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.categoriaIds.update((ids) =>
      checked ? [...ids, categoryId] : ids.filter((id) => id !== categoryId),
    );
  }

  protected categorySelected(categoryId: string): boolean {
    return this.categoriaIds().includes(categoryId);
  }

  private removeIncompatibleCategories(): void {
    const availableIds = new Set(this.availableCategories().map((category) => category.id));
    this.categoriaIds.update((ids) => ids.filter((id) => availableIds.has(id)));
  }

  private validationErrors(): ProductFormErrors {
    if (!this.submitted()) return {};

    return {
      sku: this.sku().trim() ? undefined : 'Ingresa el SKU del producto.',
      nombre: this.nombre().trim() ? undefined : 'Ingresa el nombre del producto.',
      slug: this.slug().trim() ? undefined : 'Ingresa el slug del producto.',
      descripcion: this.descripcion().trim() ? undefined : 'Ingresa la descripción del producto.',
      precioBase: this.nonNegativeError(this.precioBase()),
      precioAnterior: this.nonNegativeError(this.precioAnterior()),
      descuentoPorcentaje: this.percentageError(this.descuentoPorcentaje()),
      unidadNegocioId: this.unidadNegocioId() ? undefined : 'Selecciona una unidad de negocio.',
    };
  }

  private hasErrors(): boolean {
    return Object.values(this.validationErrors()).some(Boolean);
  }

  private nonNegativeError(value: string): string | undefined {
    if (value.trim() === '') return undefined;
    const number = Number(value);
    return Number.isFinite(number) && number >= 0
      ? undefined
      : 'Ingresa un número mayor o igual a 0.';
  }

  private percentageError(value: string): string | undefined {
    if (value.trim() === '') return undefined;
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 && number <= 100
      ? undefined
      : 'Ingresa un porcentaje entre 0 y 100.';
  }

  private optionalValue(value: string): string | null {
    return value.trim() || null;
  }

  private optionalNumber(value: string): number | null {
    return value.trim() === '' ? null : Number(value);
  }

  private numberValue(value: number | null): string {
    return value === null ? '' : String(value);
  }
}

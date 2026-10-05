import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusinessUnitResponse } from '../../../../../data/models/business-unit/business-unit-response.model';
import { CategoryResponse } from '../../../../../data/models/category/category-response.model';
import { ProductAvailability } from '../../../../../data/models/product/product-availability.enum';
import {
  CalculationConfigCreateRequest,
  ProductCreateRequest,
  ProductDocumentCreateRequest,
  ProductSpecificationCreateRequest,
  ProductVariantCreateRequest,
} from '../../../../../data/models/product/product-create-request.model';
import { ProductDocumentType } from '../../../../../data/models/product/product-document-type.enum';
import { ProductPublicationStatus } from '../../../../../data/models/product/product-publication-status.enum';
import { ProductResponse } from '../../../../../data/models/product/product-response.model';
import { ProductUpdateRequest } from '../../../../../data/models/product/product-update-request.model';
import { Alert } from '../../../../../shared/components/alert/alert';
import { Badge, BadgeVariant } from '../../../../../shared/components/badge/badge';
import { Button } from '../../../../../shared/components/button/button';
import { ImageUploaderComponent } from '../../../../../shared/components/image-uploader/image-uploader.component';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Modal } from '../../../../../shared/components/modal/modal';
import {
  SelectField,
  SelectOption,
} from '../../../../../shared/components/select-field/select-field';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';
import { AdminProductsFacade, ProductFormMode } from '../../admin-products.facade';

import { slugify } from '../../../../../shared/utils/slugify';

export interface ProductImageItem {
  id?: string;
  url: string;
  altText: string;
  esPrincipal: boolean;
  orden: number;
}

export interface ProductVariantItem {
  id?: string;
  sku: string;
  nombre: string;
  descripcion?: string | null;
  precio?: number | null;
  disponible: boolean;
  imagenUrl?: string | null;
  orden?: number;
}

export interface ProductSpecificationItem {
  id?: string;
  clave: string;
  valor: string;
  grupo?: string | null;
  orden?: number;
}

export interface ProductSpecificationGroup {
  name: string;
  items: ProductSpecificationItem[];
}

export interface ProductDocumentItem {
  id?: string;
  titulo: string;
  url: string;
  tipo: ProductDocumentType;
  formato?: string | null;
  tamanoBytes?: number | null;
}

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
  imports: [
    Alert,
    Badge,
    Button,
    DecimalPipe,
    FormsModule,
    ImageUploaderComponent,
    InputField,
    Modal,
    SelectField,
    TextareaField,
  ],
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
  readonly retiroEnTienda = signal(false);
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
  readonly selectedCategories = computed<readonly CategoryResponse[]>(() => {
    const ids = new Set(this.categoriaIds());
    return this.categories().filter((category) => ids.has(category.id));
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
  readonly availabilityBadge = computed<{ label: string; variant: BadgeVariant }>(() => {
    const map: Record<ProductAvailability, { label: string; variant: BadgeVariant }> = {
      [ProductAvailability.DISPONIBLE]: { label: 'Disponible', variant: 'success' },
      [ProductAvailability.AGOTADO]: { label: 'Agotado', variant: 'error' },
      [ProductAvailability.BAJO_PEDIDO]: { label: 'Bajo pedido', variant: 'warning' },
      [ProductAvailability.CONSULTAR]: { label: 'Consultar', variant: 'neutral' },
    };
    return map[this.disponibilidad()] ?? { label: 'Disponible', variant: 'success' };
  });
  readonly numericBasePrice = computed(() => {
    const val = this.precioBase().trim();
    if (!val) return null;
    const num = Number(val);
    return Number.isFinite(num) && num >= 0 ? num : null;
  });
  readonly numericPreviousPrice = computed(() => {
    const val = this.precioAnterior().trim();
    if (!val) return null;
    const num = Number(val);
    return Number.isFinite(num) && num >= 0 ? num : null;
  });
  readonly numericDiscount = computed(() => {
    const val = this.descuentoPorcentaje().trim();
    if (!val) return null;
    const num = Number(val);
    return Number.isFinite(num) && num > 0 ? num : null;
  });
  readonly facade = inject(AdminProductsFacade);

  readonly localImages = signal<ProductImageItem[]>([]);
  readonly newImageUrl = signal<string | null>(null);
  readonly previewModalUrl = signal<string | null>(null);

  readonly currentImages = computed<ProductImageItem[]>(() => {
    if (this.mode() === 'create') {
      return this.localImages();
    }
    const prod = this.facade.selectedProduct() ?? this.product();
    if (!prod || !prod.imagenes) return [];
    return [...prod.imagenes]
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      .map((img, idx) => ({
        id: img.id,
        url: img.url,
        altText: img.altText ?? '',
        esPrincipal: img.esPrincipal === true,
        orden: img.orden ?? idx,
      }));
  });

  readonly previewImageUrl = computed<string | null>(() => {
    const imgs = this.currentImages();
    if (imgs.length > 0) {
      const principal = imgs.find((img) => img.esPrincipal);
      return principal ? principal.url : imgs[0].url;
    }
    const prod = this.product();
    if (prod && prod.imagenes && prod.imagenes.length > 0) {
      return prod.imagenes[0].url;
    }
    return null;
  });

  readonly localVariants = signal<ProductVariantItem[]>([]);
  readonly currentVariants = computed<ProductVariantItem[]>(() => {
    if (this.mode() === 'create') {
      return this.localVariants();
    }
    const prod = this.facade.selectedProduct() ?? this.product();
    if (!prod || !prod.variantes) return [];
    return [...prod.variantes]
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      .map((v, idx) => ({
        id: v.id,
        sku: v.sku,
        nombre: v.nombre,
        descripcion: v.descripcion ?? '',
        precio: v.precio ?? null,
        disponible: v.disponible !== false,
        imagenUrl: v.imagenUrl ?? null,
        orden: v.orden ?? idx,
      }));
  });

  readonly variantModalOpen = signal(false);
  readonly editingVariantIndex = signal<number | null>(null);
  readonly editingVariantId = signal<string | null>(null);

  readonly variantSku = signal('');
  readonly variantNombre = signal('');
  readonly variantDescripcion = signal('');
  readonly variantPrecio = signal('');
  readonly variantDisponible = signal(true);
  readonly variantImagenUrl = signal<string | null>(null);
  readonly variantSubmitted = signal(false);
  readonly variantClientError = signal<string | null>(null);

  readonly localSpecifications = signal<ProductSpecificationItem[]>([]);
  readonly currentSpecifications = computed<ProductSpecificationItem[]>(() => {
    if (this.mode() === 'create') {
      return this.localSpecifications();
    }
    const prod = this.facade.selectedProduct() ?? this.product();
    if (!prod || !prod.especificaciones) return [];
    return [...prod.especificaciones]
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      .map((s, idx) => ({
        id: s.id,
        clave: s.clave,
        valor: s.valor,
        grupo: s.grupo ?? null,
        orden: s.orden ?? idx,
      }));
  });

  readonly groupedSpecifications = computed<ProductSpecificationGroup[]>(() => {
    const list = this.currentSpecifications();
    const map = new Map<string, ProductSpecificationItem[]>();
    for (const item of list) {
      const g = item.grupo?.trim() || 'General';
      if (!map.has(g)) {
        map.set(g, []);
      }
      map.get(g)!.push(item);
    }
    return Array.from(map.entries()).map(([name, items]) => ({
      name,
      items,
    }));
  });

  readonly specificationModalOpen = signal(false);
  readonly editingSpecificationIndex = signal<number | null>(null);
  readonly editingSpecificationId = signal<string | null>(null);

  readonly specClave = signal('');
  readonly specValor = signal('');
  readonly specGrupo = signal('');
  readonly specOrden = signal('0');
  readonly specSubmitted = signal(false);
  readonly specClientError = signal<string | null>(null);

  readonly localDocuments = signal<ProductDocumentItem[]>([]);
  readonly currentDocuments = computed<ProductDocumentItem[]>(() => {
    if (this.mode() === 'create') {
      return this.localDocuments();
    }
    const prod = this.facade.selectedProduct() ?? this.product();
    return (prod?.documentos ?? []).map((d) => ({
      id: d.id,
      titulo: d.titulo,
      url: d.url,
      tipo: d.tipo,
      formato: d.formato ?? null,
      tamanoBytes: d.tamanoBytes ?? null,
    }));
  });

  readonly documentModalOpen = signal(false);
  readonly editingDocumentIndex = signal<number | null>(null);
  readonly editingDocumentId = signal<string | null>(null);

  readonly docTitulo = signal('');
  readonly docUrl = signal('');
  readonly docTipo = signal<ProductDocumentType>(ProductDocumentType.FICHA_TECNICA);
  readonly docFormato = signal('PDF');
  readonly docTamanoBytes = signal('');
  readonly docSubmitted = signal(false);
  readonly docClientError = signal<string | null>(null);

  readonly calcHabilitada = signal(false);
  readonly calcEtiquetaEntrada = signal('');
  readonly calcUnidadEntrada = signal('');
  readonly calcCoberturaPorUnidad = signal('');
  readonly calcUnidadVenta = signal('');
  readonly calcTextoAyuda = signal('');
  readonly calcSubmitted = signal(false);
  readonly calcClientError = signal<string | null>(null);

  readonly documentTypeOptions: readonly SelectOption[] = [
    { value: ProductDocumentType.FICHA_TECNICA, label: 'Ficha Técnica' },
    { value: ProductDocumentType.CATALOGO, label: 'Catálogo' },
    { value: ProductDocumentType.MANUAL, label: 'Manual de Instalación / Uso' },
    { value: ProductDocumentType.OTRO, label: 'Otro Documento' },
  ];

  constructor() {
    effect(() => {
      const success = this.facade.variantSuccess();
      if (success && this.variantModalOpen()) {
        this.variantModalOpen.set(false);
        this.editingVariantIndex.set(null);
        this.editingVariantId.set(null);
        this.variantClientError.set(null);
      }
    });

    effect(() => {
      const success = this.facade.specificationSuccess();
      if (success && this.specificationModalOpen()) {
        this.specificationModalOpen.set(false);
        this.editingSpecificationIndex.set(null);
        this.editingSpecificationId.set(null);
        this.specClientError.set(null);
      }
    });

    effect(() => {
      const success = this.facade.documentSuccess();
      if (success && this.documentModalOpen()) {
        this.documentModalOpen.set(false);
        this.editingDocumentIndex.set(null);
        this.editingDocumentId.set(null);
        this.docClientError.set(null);
      }
    });
  }

  readonly errors = computed<ProductFormErrors>(() => this.validationErrors());

  protected updateNombre(value: string): void {
    this.nombre.set(value);
    this.slug.set(slugify(value));
  }

  protected generateSlug(): void {
    const s = slugify(this.nombre());
    if (s) this.slug.set(s);
  }

  protected updatePrecioAnterior(val: string): void {
    this.precioAnterior.set(val);
    this.calculateFinalPrice();
  }

  protected updateDescuento(val: string): void {
    this.descuentoPorcentaje.set(val);
    this.calculateFinalPrice();
  }

  protected updatePrecioBase(val: string): void {
    this.precioBase.set(val);
  }

  private calculateFinalPrice(): void {
    const listStr = this.precioAnterior().trim();
    const discStr = this.descuentoPorcentaje().trim();

    if (!listStr || !discStr) return;

    const listPrice = Number(listStr);
    const disc = Number(discStr);

    if (
      Number.isFinite(listPrice) &&
      listPrice >= 0 &&
      Number.isFinite(disc) &&
      disc >= 0 &&
      disc <= 100
    ) {
      const finalPrice = listPrice * (1 - disc / 100);
      const rounded = Number(finalPrice.toFixed(2));
      this.precioBase.set(String(rounded));
    }
  }

  ngOnInit(): void {
    const product = this.product();
    if (product === null) return;

    this.sku.set(this.cleanString(product.sku));
    this.nombre.set(this.cleanString(product.nombre));
    this.slug.set(this.cleanString(product.slug) || slugify(product.nombre ?? ''));
    this.resumen.set(this.cleanString(product.resumen));
    this.descripcion.set(this.cleanString(product.descripcion));
    this.precioBase.set(this.numberValue(product.precioBase));
    this.precioAnterior.set(this.numberValue(product.precioAnterior));
    this.descuentoPorcentaje.set(this.numberValue(product.descuentoPorcentaje));
    this.disponibilidad.set(product.disponibilidad);
    this.destacado.set(product.destacado === true);
    this.retiroEnTienda.set(product.retiroEnTienda === true);
    this.estado.set(product.estado);
    this.tituloSeo.set(this.cleanString(product.tituloSeo));
    this.descripcionSeo.set(this.cleanString(product.descripcionSeo));
    this.unidadNegocioId.set(product.unidadNegocio.id);
    this.categoriaIds.set(product.categorias?.map((category) => category.id) ?? []);
    this.removeIncompatibleCategories();

    if (product.configuracionCalculo) {
      this.calcHabilitada.set(product.configuracionCalculo.habilitada === true);
      this.calcEtiquetaEntrada.set(this.cleanString(product.configuracionCalculo.etiquetaEntrada));
      this.calcUnidadEntrada.set(this.cleanString(product.configuracionCalculo.unidadEntrada));
      this.calcCoberturaPorUnidad.set(
        this.numberValue(product.configuracionCalculo.coberturaPorUnidad),
      );
      this.calcUnidadVenta.set(this.cleanString(product.configuracionCalculo.unidadVenta));
      this.calcTextoAyuda.set(this.cleanString(product.configuracionCalculo.textoAyuda));
    }
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
      retiroEnTienda: this.retiroEnTienda(),
      estado: this.estado(),
      tituloSeo: this.optionalValue(this.tituloSeo()),
      descripcionSeo: this.optionalValue(this.descripcionSeo()),
      unidadNegocioId: this.unidadNegocioId(),
      categoriaIds: [...this.categoriaIds()],
    };

    if (this.mode() === 'create') {
      const imagenes = this.localImages().map((img, idx) => ({
        url: img.url,
        altText: img.altText?.trim() || null,
        esPrincipal: img.esPrincipal,
        orden: idx,
      }));
      const variantes: ProductVariantCreateRequest[] = this.localVariants().map((v, idx) => ({
        sku: v.sku.trim(),
        nombre: v.nombre.trim(),
        descripcion: v.descripcion?.trim() || null,
        precio: v.precio != null && v.precio >= 0 ? v.precio : null,
        disponible: v.disponible,
        imagenUrl: v.imagenUrl || null,
        orden: idx,
      }));
      const especificaciones: ProductSpecificationCreateRequest[] =
        this.localSpecifications().map((s, idx) => ({
          clave: s.clave.trim(),
          valor: s.valor.trim(),
          grupo: s.grupo?.trim() || null,
          orden: s.orden ?? idx,
        }));
      const documentos: ProductDocumentCreateRequest[] =
        this.localDocuments().map((d) => ({
          titulo: d.titulo.trim(),
          url: d.url.trim(),
          tipo: d.tipo,
          formato: d.formato?.trim() || null,
          tamanoBytes: d.tamanoBytes != null && d.tamanoBytes >= 0 ? d.tamanoBytes : null,
        }));

      let configuracionCalculo: CalculationConfigCreateRequest | null = null;
      const cobVal = this.calcCoberturaPorUnidad().trim();
      const cobNum = Number(cobVal);
      const isCobValid = Number.isFinite(cobNum) && cobNum > 0;

      if (this.calcHabilitada()) {
        if (!isCobValid) {
          this.calcSubmitted.set(true);
          this.calcClientError.set(
            'La cobertura por unidad debe ser un número mayor que cero cuando la calculadora está habilitada.',
          );
          return;
        }
        configuracionCalculo = {
          habilitada: true,
          etiquetaEntrada: this.optionalValue(this.calcEtiquetaEntrada()),
          unidadEntrada: this.optionalValue(this.calcUnidadEntrada()),
          coberturaPorUnidad: cobNum,
          unidadVenta: this.optionalValue(this.calcUnidadVenta()),
          textoAyuda: this.optionalValue(this.calcTextoAyuda()),
        };
      } else if (
        isCobValid ||
        this.calcEtiquetaEntrada().trim() ||
        this.calcUnidadEntrada().trim() ||
        this.calcUnidadVenta().trim() ||
        this.calcTextoAyuda().trim()
      ) {
        configuracionCalculo = {
          habilitada: false,
          etiquetaEntrada: this.optionalValue(this.calcEtiquetaEntrada()),
          unidadEntrada: this.optionalValue(this.calcUnidadEntrada()),
          coberturaPorUnidad: isCobValid ? cobNum : 1,
          unidadVenta: this.optionalValue(this.calcUnidadVenta()),
          textoAyuda: this.optionalValue(this.calcTextoAyuda()),
        };
      }

      this.saved.emit({
        mode: 'create',
        request: {
          ...common,
          ...(imagenes.length > 0 ? { imagenes } : {}),
          ...(variantes.length > 0 ? { variantes } : {}),
          ...(especificaciones.length > 0 ? { especificaciones } : {}),
          ...(documentos.length > 0 ? { documentos } : {}),
          ...(configuracionCalculo ? { configuracionCalculo } : {}),
        },
      });
      return;
    }

    this.saved.emit({ mode: 'edit', request: common });
  }

  protected onImageUploaded(url: string | null): void {
    if (!url) return;

    this.facade.clearImageFeedback();
    const current = this.currentImages();
    const isFirst = current.length === 0;
    const defaultAlt = this.nombre().trim()
      ? `${this.nombre().trim()} - Imagen ${current.length + 1}`
      : '';

    if (this.mode() === 'create') {
      const newImg: ProductImageItem = {
        url,
        altText: defaultAlt,
        esPrincipal: isFirst,
        orden: current.length,
      };
      this.localImages.update((imgs) => [...imgs, newImg]);
      this.newImageUrl.set(null);
      return;
    }

    const prod = this.facade.selectedProduct() ?? this.product();
    if (!prod) return;

    this.facade.addImage(prod.id, {
      url,
      altText: defaultAlt || null,
      esPrincipal: isFirst,
      orden: current.length,
    });
    this.newImageUrl.set(null);
  }

  protected setAsPrincipal(index: number): void {
    const current = this.currentImages();
    if (index < 0 || index >= current.length || current[index].esPrincipal) return;

    if (this.mode() === 'create') {
      this.localImages.update((imgs) =>
        imgs.map((img, idx) => ({
          ...img,
          esPrincipal: idx === index,
        })),
      );
      return;
    }

    const prod = this.facade.selectedProduct() ?? this.product();
    const target = current[index];
    if (!prod || !target.id) return;
    this.facade.setPrincipalImage(prod.id, target.id);
  }

  protected moveImage(index: number, direction: -1 | 1): void {
    const current = this.currentImages();
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= current.length) return;

    if (this.mode() === 'create') {
      const list = [...this.localImages()];
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      this.localImages.set(list.map((item, idx) => ({ ...item, orden: idx })));
      return;
    }

    const prod = this.facade.selectedProduct() ?? this.product();
    if (!prod) return;
    this.facade.reorderImages(prod.id, index, targetIndex);
  }

  protected updateImageAlt(index: number, altText: string): void {
    if (this.mode() === 'create') {
      this.localImages.update((imgs) =>
        imgs.map((item, idx) => (idx === index ? { ...item, altText } : item)),
      );
    }
  }

  protected saveImageAlt(index: number, altText: string): void {
    if (this.mode() === 'edit') {
      const prod = this.facade.selectedProduct() ?? this.product();
      const target = this.currentImages()[index];
      if (!prod || !target?.id) return;
      this.facade.updateImageAlt(prod.id, target.id, altText);
    }
  }

  protected removeImage(index: number): void {
    const current = this.currentImages();
    if (index < 0 || index >= current.length) return;

    if (this.mode() === 'create') {
      const target = current[index];
      let next = current.filter((_, idx) => idx !== index);
      if (target.esPrincipal && next.length > 0) {
        next = next.map((img, idx) => ({ ...img, esPrincipal: idx === 0, orden: idx }));
      } else {
        next = next.map((img, idx) => ({ ...img, orden: idx }));
      }
      this.localImages.set(next);
      return;
    }

    const prod = this.facade.selectedProduct() ?? this.product();
    const target = current[index];
    if (!prod || !target.id) return;
    this.facade.deleteImage(prod.id, target.id);
  }

  protected openPreview(url: string): void {
    this.previewModalUrl.set(url);
  }

  protected closePreview(): void {
    this.previewModalUrl.set(null);
  }

  protected openCreateVariant(): void {
    this.facade.clearVariantFeedback();
    this.editingVariantIndex.set(null);
    this.editingVariantId.set(null);
    this.variantSku.set('');
    this.variantNombre.set('');
    this.variantDescripcion.set('');
    this.variantPrecio.set('');
    this.variantDisponible.set(true);
    this.variantImagenUrl.set(null);
    this.variantSubmitted.set(false);
    this.variantClientError.set(null);
    this.variantModalOpen.set(true);
  }

  protected openEditVariant(index: number): void {
    const list = this.currentVariants();
    if (index < 0 || index >= list.length) return;
    const item = list[index];
    this.facade.clearVariantFeedback();
    this.editingVariantIndex.set(index);
    this.editingVariantId.set(item.id ?? null);
    this.variantSku.set(item.sku);
    this.variantNombre.set(item.nombre);
    this.variantDescripcion.set(item.descripcion ?? '');
    this.variantPrecio.set(item.precio != null ? String(item.precio) : '');
    this.variantDisponible.set(item.disponible !== false);
    this.variantImagenUrl.set(item.imagenUrl ?? null);
    this.variantSubmitted.set(false);
    this.variantClientError.set(null);
    this.variantModalOpen.set(true);
  }

  protected closeVariantModal(): void {
    if (this.facade.variantOperating()) return;
    this.variantModalOpen.set(false);
    this.editingVariantIndex.set(null);
    this.editingVariantId.set(null);
    this.variantClientError.set(null);
  }

  protected onVariantImageUploaded(url: string | null): void {
    this.variantImagenUrl.set(url);
  }

  protected removeVariantImage(): void {
    this.variantImagenUrl.set(null);
  }

  protected saveVariant(): void {
    this.variantSubmitted.set(true);
    this.variantClientError.set(null);

    const sku = this.variantSku().trim();
    const nombre = this.variantNombre().trim();
    const descripcion = this.variantDescripcion().trim() || null;
    const precioStr = this.variantPrecio().trim();
    let precio: number | null = null;
    if (precioStr) {
      const parsed = Number(precioStr);
      if (!Number.isFinite(parsed) || parsed < 0) {
        this.variantClientError.set('El precio debe ser un número mayor o igual a 0.');
        return;
      }
      precio = parsed;
    }

    if (!sku) {
      this.variantClientError.set('El SKU de la variante es obligatorio.');
      return;
    }
    if (!nombre) {
      this.variantClientError.set('El nombre de la variante es obligatorio.');
      return;
    }

    const currentList = this.currentVariants();
    const editingIdx = this.editingVariantIndex();
    const duplicate = currentList.some(
      (v, idx) => v.sku.toLowerCase() === sku.toLowerCase() && idx !== editingIdx,
    );
    if (duplicate) {
      this.variantClientError.set('Ya existe una variante con este SKU en este producto.');
      return;
    }

    const item: ProductVariantItem = {
      sku,
      nombre,
      descripcion,
      precio,
      disponible: this.variantDisponible(),
      imagenUrl: this.variantImagenUrl(),
      orden: editingIdx != null && editingIdx >= 0 ? editingIdx : currentList.length,
    };

    if (this.mode() === 'create') {
      if (editingIdx != null && editingIdx >= 0) {
        this.localVariants.update((list) =>
          list.map((v, idx) => (idx === editingIdx ? { ...v, ...item } : v)),
        );
      } else {
        this.localVariants.update((list) => [...list, item]);
      }
      this.closeVariantModal();
      return;
    }

    const prod = this.facade.selectedProduct() ?? this.product();
    if (!prod) return;

    const payload: ProductVariantCreateRequest = {
      sku: item.sku,
      nombre: item.nombre,
      descripcion: item.descripcion,
      precio: item.precio,
      disponible: item.disponible,
      imagenUrl: item.imagenUrl,
      orden: item.orden ?? 0,
    };

    const variantId = this.editingVariantId();
    if (variantId) {
      this.facade.updateVariant(prod.id, variantId, payload);
    } else {
      this.facade.addVariant(prod.id, payload);
    }
  }

  protected removeVariant(index: number): void {
    const current = this.currentVariants();
    if (index < 0 || index >= current.length) return;

    if (this.mode() === 'create') {
      const next = current
        .filter((_, idx) => idx !== index)
        .map((v, idx) => ({ ...v, orden: idx }));
      this.localVariants.set(next);
      return;
    }

    const prod = this.facade.selectedProduct() ?? this.product();
    const target = current[index];
    if (!prod || !target.id) return;
    this.facade.deleteVariant(prod.id, target.id);
  }

  protected openCreateSpecification(prefillGroup?: string): void {
    this.facade.clearSpecificationFeedback();
    this.editingSpecificationIndex.set(null);
    this.editingSpecificationId.set(null);
    this.specClave.set('');
    this.specValor.set('');
    this.specGrupo.set(prefillGroup?.trim() || '');
    this.specOrden.set(String(this.currentSpecifications().length));
    this.specSubmitted.set(false);
    this.specClientError.set(null);
    this.specificationModalOpen.set(true);
  }

  protected openEditSpecification(item: ProductSpecificationItem): void {
    const list = this.currentSpecifications();
    const idx = list.findIndex((s) => (item.id ? s.id === item.id : s === item));
    this.facade.clearSpecificationFeedback();
    this.editingSpecificationIndex.set(idx >= 0 ? idx : null);
    this.editingSpecificationId.set(item.id ?? null);
    this.specClave.set(item.clave);
    this.specValor.set(item.valor);
    this.specGrupo.set(item.grupo ?? '');
    this.specOrden.set(String(item.orden ?? 0));
    this.specSubmitted.set(false);
    this.specClientError.set(null);
    this.specificationModalOpen.set(true);
  }

  protected closeSpecificationModal(): void {
    if (this.facade.specificationOperating()) return;
    this.specificationModalOpen.set(false);
    this.editingSpecificationIndex.set(null);
    this.editingSpecificationId.set(null);
    this.specClientError.set(null);
  }

  protected saveSpecification(): void {
    this.specSubmitted.set(true);
    this.specClientError.set(null);

    const clave = this.specClave().trim();
    const valor = this.specValor().trim();
    const grupo = this.specGrupo().trim() || null;
    const orden = Number(this.specOrden()) || 0;

    if (!clave) {
      this.specClientError.set(
        'La clave (nombre técnico) de la especificación es obligatoria.',
      );
      return;
    }
    if (clave.length > 100) {
      this.specClientError.set('La clave no debe superar los 100 caracteres.');
      return;
    }
    if (!valor) {
      this.specClientError.set('El valor de la especificación es obligatorio.');
      return;
    }
    if (valor.length > 500) {
      this.specClientError.set('El valor no debe superar los 500 caracteres.');
      return;
    }
    if (grupo && grupo.length > 100) {
      this.specClientError.set('El grupo no debe superar los 100 caracteres.');
      return;
    }

    const item: ProductSpecificationItem = {
      clave,
      valor,
      grupo,
      orden,
    };

    if (this.mode() === 'create') {
      const editIdx = this.editingSpecificationIndex();
      if (editIdx != null && editIdx >= 0) {
        this.localSpecifications.update((list) =>
          list.map((s, i) => (i === editIdx ? { ...s, ...item } : s)),
        );
      } else {
        this.localSpecifications.update((list) => [...list, item]);
      }
      this.closeSpecificationModal();
      return;
    }

    const prod = this.facade.selectedProduct() ?? this.product();
    if (!prod) return;

    const payload: ProductSpecificationCreateRequest = {
      clave: item.clave,
      valor: item.valor,
      grupo: item.grupo,
      orden: item.orden ?? 0,
    };

    const specId = this.editingSpecificationId();
    if (specId) {
      this.facade.updateSpecification(prod.id, specId, payload);
    } else {
      this.facade.addSpecification(prod.id, payload);
    }
  }

  protected removeSpecification(item: ProductSpecificationItem): void {
    if (this.mode() === 'create') {
      const list = this.currentSpecifications();
      const next = list.filter((s) => (item.id ? s.id !== item.id : s !== item));
      this.localSpecifications.set(next);
      return;
    }

    const prod = this.facade.selectedProduct() ?? this.product();
    if (!prod || !item.id) return;
    this.facade.deleteSpecification(prod.id, item.id);
  }

  protected openCreateDocument(): void {
    this.facade.clearDocumentFeedback();
    this.editingDocumentIndex.set(null);
    this.editingDocumentId.set(null);
    this.docTitulo.set('');
    this.docUrl.set('');
    this.docTipo.set(ProductDocumentType.FICHA_TECNICA);
    this.docFormato.set('PDF');
    this.docTamanoBytes.set('');
    this.docSubmitted.set(false);
    this.docClientError.set(null);
    this.documentModalOpen.set(true);
  }

  protected openEditDocument(item: ProductDocumentItem): void {
    const list = this.currentDocuments();
    const idx = list.findIndex((d) => (item.id ? d.id === item.id : d === item));
    this.facade.clearDocumentFeedback();
    this.editingDocumentIndex.set(idx >= 0 ? idx : null);
    this.editingDocumentId.set(item.id ?? null);
    this.docTitulo.set(item.titulo);
    this.docUrl.set(item.url);
    this.docTipo.set(item.tipo);
    this.docFormato.set(item.formato ?? '');
    this.docTamanoBytes.set(item.tamanoBytes != null ? String(item.tamanoBytes) : '');
    this.docSubmitted.set(false);
    this.docClientError.set(null);
    this.documentModalOpen.set(true);
  }

  protected closeDocumentModal(): void {
    if (this.facade.documentOperating()) return;
    this.documentModalOpen.set(false);
    this.editingDocumentIndex.set(null);
    this.editingDocumentId.set(null);
    this.docClientError.set(null);
  }

  protected saveDocument(): void {
    this.docSubmitted.set(true);
    this.docClientError.set(null);

    const titulo = this.docTitulo().trim();
    const url = this.docUrl().trim();
    const tipo = this.docTipo();
    const formato = this.docFormato().trim() || null;
    const tamanoRaw = this.docTamanoBytes().trim();
    let tamanoBytes: number | null = null;
    if (tamanoRaw) {
      const parsed = parseInt(tamanoRaw, 10);
      if (isNaN(parsed) || parsed < 0) {
        this.docClientError.set('El tamaño en bytes debe ser un número entero mayor o igual a 0.');
        return;
      }
      tamanoBytes = parsed;
    }

    if (!titulo) {
      this.docClientError.set('El título del documento es obligatorio.');
      return;
    }
    if (titulo.length > 180) {
      this.docClientError.set('El título no debe superar los 180 caracteres.');
      return;
    }
    if (!url) {
      this.docClientError.set('La URL del documento es obligatoria.');
      return;
    }
    if (url.length > 500) {
      this.docClientError.set('La URL no debe superar los 500 caracteres.');
      return;
    }
    if (formato && formato.length > 20) {
      this.docClientError.set('El formato no debe superar los 20 caracteres.');
      return;
    }

    const item: ProductDocumentItem = {
      id: this.editingDocumentId() ?? undefined,
      titulo,
      url,
      tipo,
      formato,
      tamanoBytes,
    };

    if (this.mode() === 'create') {
      const editIdx = this.editingDocumentIndex();
      if (editIdx !== null && editIdx >= 0) {
        this.localDocuments.update((list) =>
          list.map((d, i) => (i === editIdx ? item : d)),
        );
      } else {
        this.localDocuments.update((list) => [...list, item]);
      }
      this.closeDocumentModal();
      return;
    }

    const prod = this.facade.selectedProduct() ?? this.product();
    if (!prod) return;

    const payload: ProductDocumentCreateRequest = {
      titulo,
      url,
      tipo,
      formato,
      tamanoBytes,
    };

    const docId = this.editingDocumentId();
    if (docId) {
      this.facade.updateDocument(prod.id, docId, payload);
    } else {
      this.facade.addDocument(prod.id, payload);
    }
  }

  protected removeDocument(item: ProductDocumentItem): void {
    if (this.mode() === 'create') {
      const list = this.currentDocuments();
      const next = list.filter((d) => (item.id ? d.id !== item.id : d !== item));
      this.localDocuments.set(next);
      return;
    }

    const prod = this.facade.selectedProduct() ?? this.product();
    if (!prod || !item.id) return;
    this.facade.deleteDocument(prod.id, item.id);
  }

  protected updateDocTipo(value: string): void {
    this.docTipo.set(value as ProductDocumentType);
  }

  protected formatDocumentSize(bytes: number | null | undefined): string {
    if (bytes == null || isNaN(bytes) || bytes <= 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected getDocumentTypeBadge(tipo: ProductDocumentType): { label: string; variant: BadgeVariant } {
    switch (tipo) {
      case ProductDocumentType.FICHA_TECNICA:
        return { label: 'Ficha Técnica', variant: 'accent' };
      case ProductDocumentType.CATALOGO:
        return { label: 'Catálogo', variant: 'neutral' };
      case ProductDocumentType.MANUAL:
        return { label: 'Manual', variant: 'neutral' };
      default:
        return { label: 'Otro', variant: 'neutral' };
    }
  }

  protected updateFeatured(event: Event): void {
    this.destacado.set((event.target as HTMLInputElement).checked);
  }

  protected updateRetiroEnTienda(event: Event): void {
    this.retiroEnTienda.set((event.target as HTMLInputElement).checked);
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
    const trimmed = value.trim();
    if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null') return undefined;
    const number = Number(trimmed);
    return Number.isFinite(number) && number >= 0
      ? undefined
      : 'Ingresa un número mayor o igual a 0.';
  }

  private percentageError(value: string): string | undefined {
    const trimmed = value.trim();
    if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null') return undefined;
    const number = Number(trimmed);
    return Number.isFinite(number) && number >= 0 && number <= 100
      ? undefined
      : 'Ingresa un porcentaje entre 0 y 100.';
  }

  private cleanString(value: string | null | undefined): string {
    if (!value || value === 'undefined' || value === 'null') return '';
    return value;
  }

  private optionalValue(value: string): string | null {
    const trimmed = value.trim();
    return trimmed === '' || trimmed === 'undefined' || trimmed === 'null' ? null : trimmed;
  }

  private optionalNumber(value: string): number | null {
    const trimmed = value.trim();
    if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null') return null;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : null;
  }

  private numberValue(value: number | null | undefined | string): string {
    if (value === null || value === undefined || value === 'undefined' || value === 'null') return '';
    const num = Number(value);
    return Number.isFinite(num) ? String(num) : '';
  }

  isCoverageValid(): boolean {
    if (!this.calcHabilitada()) return true;
    const val = this.calcCoberturaPorUnidad().trim();
    if (!val) return false;
    const num = Number(val);
    return Number.isFinite(num) && num > 0;
  }

  saveCalculationConfig(): void {
    const product = this.facade.selectedProduct() ?? this.product();
    if (!product) return;

    this.calcSubmitted.set(true);
    this.calcClientError.set(null);
    this.facade.clearCalculationConfigFeedback();

    const cobVal = this.calcCoberturaPorUnidad().trim();
    const cobNum = Number(cobVal);
    const isCobValid = Number.isFinite(cobNum) && cobNum > 0;

    if (this.calcHabilitada() && !isCobValid) {
      this.calcClientError.set(
        'La cobertura por unidad debe ser un número mayor que cero cuando la calculadora está habilitada.',
      );
      return;
    }

    const payload: CalculationConfigCreateRequest = {
      habilitada: this.calcHabilitada(),
      etiquetaEntrada: this.optionalValue(this.calcEtiquetaEntrada()),
      unidadEntrada: this.optionalValue(this.calcUnidadEntrada()),
      coberturaPorUnidad: isCobValid ? cobNum : 1,
      unidadVenta: this.optionalValue(this.calcUnidadVenta()),
      textoAyuda: this.optionalValue(this.calcTextoAyuda()),
    };

    this.facade.updateCalculationConfig(product.id, payload);
  }
}

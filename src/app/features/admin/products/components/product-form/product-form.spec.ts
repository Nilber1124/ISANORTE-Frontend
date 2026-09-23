import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessUnitResponse } from '../../../../../data/models/business-unit/business-unit-response.model';
import { CategoryResponse } from '../../../../../data/models/category/category-response.model';
import { ProductAvailability } from '../../../../../data/models/product/product-availability.enum';
import {
  CalculationConfigCreateRequest,
  ProductCreateRequest,
  ProductDocumentCreateRequest,
  ProductImageCreateRequest,
  ProductSpecificationCreateRequest,
  ProductVariantCreateRequest,
} from '../../../../../data/models/product/product-create-request.model';
import { ProductDocumentType } from '../../../../../data/models/product/product-document-type.enum';
import { ProductPublicationStatus } from '../../../../../data/models/product/product-publication-status.enum';
import { ProductResponse } from '../../../../../data/models/product/product-response.model';
import { AdminProductsFacade } from '../../admin-products.facade';
import { ProductForm, ProductFormSubmission } from './product-form';

class FacadeMock {
  readonly selectedProduct = signal<ProductResponse | null>(null);
  readonly imageOperating = signal(false);
  readonly imageError = signal<string | null>(null);
  readonly imageSuccess = signal<string | null>(null);
  readonly variantOperating = signal(false);
  readonly variantError = signal<string | null>(null);
  readonly variantSuccess = signal<string | null>(null);
  readonly specificationOperating = signal(false);
  readonly specificationError = signal<string | null>(null);
  readonly specificationSuccess = signal<string | null>(null);
  readonly documentOperating = signal(false);
  readonly documentError = signal<string | null>(null);
  readonly documentSuccess = signal<string | null>(null);
  readonly calculationConfigOperating = signal(false);
  readonly calculationConfigError = signal<string | null>(null);
  readonly calculationConfigSuccess = signal<string | null>(null);

  addImageCalls: Array<{ productId: string; request: ProductImageCreateRequest }> = [];
  deleteImageCalls: Array<{ productId: string; imageId: string }> = [];
  setPrincipalCalls: Array<{ productId: string; targetImageId: string }> = [];
  reorderCalls: Array<{ productId: string; sourceIndex: number; targetIndex: number }> = [];
  updateAltCalls: Array<{ productId: string; imageId: string; altText: string }> = [];
  addVariantCalls: Array<{ productId: string; request: ProductVariantCreateRequest }> = [];
  updateVariantCalls: Array<{ productId: string; variantId: string; request: ProductVariantCreateRequest }> = [];
  deleteVariantCalls: Array<{ productId: string; variantId: string }> = [];
  addSpecificationCalls: Array<{ productId: string; request: ProductSpecificationCreateRequest }> = [];
  updateSpecificationCalls: Array<{ productId: string; specId: string; request: ProductSpecificationCreateRequest }> = [];
  deleteSpecificationCalls: Array<{ productId: string; specId: string }> = [];
  addDocumentCalls: Array<{ productId: string; request: ProductDocumentCreateRequest }> = [];
  updateDocumentCalls: Array<{ productId: string; docId: string; request: ProductDocumentCreateRequest }> = [];
  deleteDocumentCalls: Array<{ productId: string; docId: string }> = [];
  updateCalculationConfigCalls: Array<{ productId: string; request: CalculationConfigCreateRequest }> = [];

  clearImageFeedback(): void {
    this.imageError.set(null);
    this.imageSuccess.set(null);
  }

  addImage(productId: string, request: ProductImageCreateRequest): void {
    this.addImageCalls.push({ productId, request });
  }

  deleteImage(productId: string, imageId: string): void {
    this.deleteImageCalls.push({ productId, imageId });
  }

  setPrincipalImage(productId: string, targetImageId: string): void {
    this.setPrincipalCalls.push({ productId, targetImageId });
  }

  reorderImages(productId: string, sourceIndex: number, targetIndex: number): void {
    this.reorderCalls.push({ productId, sourceIndex, targetIndex });
  }

  updateImageAlt(productId: string, imageId: string, altText: string): void {
    this.updateAltCalls.push({ productId, imageId, altText });
  }

  clearVariantFeedback(): void {
    this.variantError.set(null);
    this.variantSuccess.set(null);
  }

  addVariant(productId: string, request: ProductVariantCreateRequest): void {
    this.addVariantCalls.push({ productId, request });
  }

  updateVariant(productId: string, variantId: string, request: ProductVariantCreateRequest): void {
    this.updateVariantCalls.push({ productId, variantId, request });
  }

  deleteVariant(productId: string, variantId: string): void {
    this.deleteVariantCalls.push({ productId, variantId });
  }

  clearSpecificationFeedback(): void {
    this.specificationError.set(null);
    this.specificationSuccess.set(null);
  }

  addSpecification(productId: string, request: ProductSpecificationCreateRequest): void {
    this.addSpecificationCalls.push({ productId, request });
  }

  updateSpecification(productId: string, specId: string, request: ProductSpecificationCreateRequest): void {
    this.updateSpecificationCalls.push({ productId, specId, request });
  }

  deleteSpecification(productId: string, specId: string): void {
    this.deleteSpecificationCalls.push({ productId, specId });
  }

  clearDocumentFeedback(): void {
    this.documentError.set(null);
    this.documentSuccess.set(null);
  }

  addDocument(productId: string, request: ProductDocumentCreateRequest): void {
    this.addDocumentCalls.push({ productId, request });
  }

  updateDocument(productId: string, docId: string, request: ProductDocumentCreateRequest): void {
    this.updateDocumentCalls.push({ productId, docId, request });
  }

  deleteDocument(productId: string, docId: string): void {
    this.deleteDocumentCalls.push({ productId, docId });
  }

  clearCalculationConfigFeedback(): void {
    this.calculationConfigError.set(null);
    this.calculationConfigSuccess.set(null);
  }

  updateCalculationConfig(productId: string, request: CalculationConfigCreateRequest): void {
    this.updateCalculationConfigCalls.push({ productId, request });
  }
}

const unit: BusinessUnitResponse = {
  id: 'unit-1',
  nombre: 'ISADECOR',
  slug: 'isadecor',
  descripcion: null,
  icono: null,
  imagenUrl: null,
  imagenAlt: null,
  activo: true,
  destacado: false,
  orden: 1,
  empresa: { id: 'company-1', nombreComercial: 'ISANORTE' },
  recursos: [],
  fechaCreacion: null,
  fechaActualizacion: null,
};
const otherUnit: BusinessUnitResponse = {
  ...unit,
  id: 'unit-2',
  nombre: 'Academia',
  slug: 'academia',
};
const category: CategoryResponse = {
  id: 'category-1',
  nombre: 'Wall Panels',
  slug: 'wall-panels',
  descripcion: null,
  imagenUrl: null,
  activo: true,
  orden: 1,
  unidadNegocio: { id: unit.id, nombre: unit.nombre, slug: unit.slug },
  fechaCreacion: null,
  fechaActualizacion: null,
};
const globalCategory: CategoryResponse = {
  ...category,
  id: 'category-global',
  nombre: 'Global',
  slug: 'global',
  unidadNegocio: null,
};
const foreignCategory: CategoryResponse = {
  ...category,
  id: 'category-foreign',
  nombre: 'Academia',
  slug: 'academia',
  unidadNegocio: { id: otherUnit.id, nombre: otherUnit.nombre, slug: otherUnit.slug },
};
const product: ProductResponse = {
  id: 'product-1',
  sku: 'WP-001',
  nombre: 'Wall Panel Roble',
  slug: 'wall-panel-roble',
  resumen: 'Resumen',
  descripcion: 'Panel decorativo',
  precioBase: null,
  precioAnterior: 60,
  descuentoPorcentaje: 10,
  disponibilidad: ProductAvailability.BAJO_PEDIDO,
  destacado: true,
  estado: ProductPublicationStatus.OCULTO,
  tituloSeo: 'Wall Panel',
  descripcionSeo: null,
  unidadNegocio: { id: unit.id, nombre: unit.nombre, slug: unit.slug },
  categorias: [{ id: category.id, nombre: category.nombre, slug: category.slug }],
  variantes: [
    {
      id: 'variant-1',
      sku: 'V-1',
      nombre: 'Roble',
      descripcion: null,
      precio: null,
      disponible: true,
      imagenUrl: null,
      orden: 1,
    },
  ],
  imagenes: [],
  especificaciones: [],
  documentos: [],
  configuracionCalculo: null,
  retiroEnTienda: true,
  fechaCreacion: null,
  fechaActualizacion: null,
};

describe('ProductForm', () => {
  let fixture: ComponentFixture<ProductForm>;
  let facadeMock: FacadeMock;

  async function render(
    mode: 'create' | 'edit' = 'create',
    value: ProductResponse | null = null,
  ): Promise<HTMLElement> {
    facadeMock = new FacadeMock();
    if (value) {
      facadeMock.selectedProduct.set(value);
    }
    await TestBed.configureTestingModule({
      imports: [ProductForm],
      providers: [{ provide: AdminProductsFacade, useValue: facadeMock }],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductForm);
    fixture.componentRef.setInput('mode', mode);
    fixture.componentRef.setInput('product', value);
    fixture.componentRef.setInput('businessUnits', [unit]);
    fixture.componentRef.setInput('categories', [category]);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function saveButton(element: HTMLElement): HTMLButtonElement {
    return Array.from(element.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Guardar producto'),
    )!;
  }

  it('requires SKU, name, slug, description and business unit', async () => {
    const element = await render();
    const submissions: ProductFormSubmission[] = [];
    fixture.componentInstance.saved.subscribe((submission) => submissions.push(submission));
    saveButton(element).click();
    fixture.detectChanges();
    expect(element.textContent).toContain('Ingresa el SKU');
    expect(element.textContent).toContain('Ingresa el nombre');
    expect(element.textContent).toContain('Ingresa el slug');
    expect(element.textContent).toContain('Ingresa la descripción');
    expect(element.textContent).toContain('Selecciona una unidad');
    expect(submissions).toEqual([]);
  });

  it('validates non-negative prices and discount between 0 and 100', async () => {
    const element = await render();
    fixture.componentInstance.precioBase.set('-1');
    fixture.componentInstance.precioAnterior.set('invalid');
    fixture.componentInstance.descuentoPorcentaje.set('101');
    saveButton(element).click();
    fixture.detectChanges();
    expect(element.textContent).toContain('mayor o igual a 0');
    expect(element.textContent).toContain('porcentaje entre 0 y 100');
  });

  it('automatically calculates final base price when discount is updated', async () => {
    await render();
    const instance = fixture.componentInstance as unknown as {
      updatePrecioAnterior(val: string): void;
      updateDescuento(val: string): void;
    };
    instance.updatePrecioAnterior('100');
    instance.updateDescuento('20');
    expect(fixture.componentInstance.precioBase()).toBe('80');

    instance.updateDescuento('15.5');
    expect(fixture.componentInstance.precioBase()).toBe('84.5');
  });

  it('emits UUID relations and preserves empty prices as null on create', async () => {
    const element = await render();
    const submissions: ProductFormSubmission[] = [];
    fixture.componentInstance.saved.subscribe((submission) => submissions.push(submission));
    fixture.componentInstance.sku.set('TEST-001');
    fixture.componentInstance.nombre.set('Producto prueba');
    fixture.componentInstance.slug.set('producto-prueba');
    fixture.componentInstance.descripcion.set('Descripción');
    fixture.componentInstance.unidadNegocioId.set(unit.id);
    fixture.componentInstance.categoriaIds.set([category.id]);
    saveButton(element).click();
    expect(submissions).toHaveLength(1);
    expect(submissions[0].request.unidadNegocioId).toBe(unit.id);
    expect(submissions[0].request.categoriaIds).toEqual([category.id]);
    expect(submissions[0].request.precioBase).toBeNull();
    expect('variantes' in submissions[0].request).toBe(false);
  });

  it('populates editing and emits an update without child collections', async () => {
    const element = await render('edit', product);
    const submissions: ProductFormSubmission[] = [];
    fixture.componentInstance.saved.subscribe((submission) => submissions.push(submission));
    expect(fixture.componentInstance.disponibilidad()).toBe(ProductAvailability.BAJO_PEDIDO);
    expect(fixture.componentInstance.estado()).toBe(ProductPublicationStatus.OCULTO);
    expect(fixture.componentInstance.categoriaIds()).toEqual([category.id]);
    saveButton(element).click();
    expect(submissions).toHaveLength(1);
    expect(submissions[0].mode).toBe('edit');
    expect('variantes' in submissions[0].request).toBe(false);
    expect(element.textContent).toContain('Contenido avanzado preservado');
  });

  it('disables submit while a request is in progress', async () => {
    const element = await render();
    fixture.componentRef.setInput('submitting', true);
    fixture.detectChanges();
    expect(saveButton(element).disabled).toBe(true);
  });

  it('only exposes compatible and global categories, clearing invalid selections on unit change', async () => {
    await render();
    fixture.componentRef.setInput('businessUnits', [unit, otherUnit]);
    fixture.componentRef.setInput('categories', [category, globalCategory, foreignCategory]);
    fixture.componentInstance.categoriaIds.set([category.id, globalCategory.id, foreignCategory.id]);

    const updateBusinessUnit = fixture.componentInstance as unknown as {
      updateBusinessUnit(value: string): void;
    };
    updateBusinessUnit.updateBusinessUnit(unit.id);
    expect(fixture.componentInstance.availableCategories().map((item) => item.id)).toEqual([
      category.id,
      globalCategory.id,
    ]);
    expect(fixture.componentInstance.categoriaIds()).toEqual([category.id, globalCategory.id]);

    updateBusinessUnit.updateBusinessUnit(otherUnit.id);
    expect(fixture.componentInstance.availableCategories().map((item) => item.id)).toEqual([
      globalCategory.id,
      foreignCategory.id,
    ]);
    expect(fixture.componentInstance.categoriaIds()).toEqual([globalCategory.id]);
  });

  it('manages local images in create mode and submits them in ProductCreateRequest', async () => {
    const element = await render('create');
    const instance = fixture.componentInstance as any;
    const submissions: ProductFormSubmission[] = [];
    instance.saved.subscribe((s: ProductFormSubmission) => submissions.push(s));

    instance.sku.set('IMG-001');
    instance.nombre.set('Producto con fotos');
    instance.slug.set('producto-con-fotos');
    instance.descripcion.set('Descripción con fotos');
    instance.unidadNegocioId.set(unit.id);

    // Subir 2 imágenes
    instance.onImageUploaded('https://res.cloudinary.com/test/img1.webp');
    instance.onImageUploaded('https://res.cloudinary.com/test/img2.webp');
    fixture.detectChanges();

    expect(instance.currentImages()).toHaveLength(2);
    expect(instance.currentImages()[0].esPrincipal).toBe(true);
    expect(instance.currentImages()[1].esPrincipal).toBe(false);
    expect(instance.previewImageUrl()).toBe('https://res.cloudinary.com/test/img1.webp');

    // Cambiar la principal a la segunda
    instance.setAsPrincipal(1);
    fixture.detectChanges();
    expect(instance.currentImages()[0].esPrincipal).toBe(false);
    expect(instance.currentImages()[1].esPrincipal).toBe(true);
    expect(instance.previewImageUrl()).toBe('https://res.cloudinary.com/test/img2.webp');

    // Reordenar imágenes (mover la segunda hacia arriba)
    instance.moveImage(1, -1);
    fixture.detectChanges();
    expect(instance.currentImages()[0].url).toBe('https://res.cloudinary.com/test/img2.webp');
    expect(instance.currentImages()[1].url).toBe('https://res.cloudinary.com/test/img1.webp');

    // Eliminar la segunda imagen
    instance.removeImage(1);
    fixture.detectChanges();
    expect(instance.currentImages()).toHaveLength(1);

    // Guardar producto
    saveButton(element).click();
    expect(submissions).toHaveLength(1);
    expect(submissions[0].mode).toBe('create');
    const createReq = submissions[0].request as ProductCreateRequest;
    expect(createReq.imagenes).toHaveLength(1);
    expect(createReq.imagenes![0].url).toBe('https://res.cloudinary.com/test/img2.webp');
  });

  it('delegates image operations to facade in edit mode', async () => {
    const productWithImages: ProductResponse = {
      ...product,
      imagenes: [
        { id: 'img-1', url: 'https://res.cloudinary.com/test/img1.webp', altText: 'Foto 1', esPrincipal: true, orden: 0 },
        { id: 'img-2', url: 'https://res.cloudinary.com/test/img2.webp', altText: 'Foto 2', esPrincipal: false, orden: 1 },
      ],
    };

    await render('edit', productWithImages);
    const instance = fixture.componentInstance as any;

    expect(instance.currentImages()).toHaveLength(2);
    expect(instance.previewImageUrl()).toBe('https://res.cloudinary.com/test/img1.webp');

    // Subir imagen en edición delega a facade.addImage
    instance.onImageUploaded('https://res.cloudinary.com/test/img3.webp');
    expect(facadeMock.addImageCalls).toHaveLength(1);
    expect(facadeMock.addImageCalls[0].productId).toBe(productWithImages.id);
    expect(facadeMock.addImageCalls[0].request.url).toBe('https://res.cloudinary.com/test/img3.webp');

    // Cambiar principal delega a facade.setPrincipalImage
    instance.setAsPrincipal(1);
    expect(facadeMock.setPrincipalCalls).toHaveLength(1);
    expect(facadeMock.setPrincipalCalls[0].targetImageId).toBe('img-2');

    // Reordenar delega a facade.reorderImages
    instance.moveImage(0, 1);
    expect(facadeMock.reorderCalls).toHaveLength(1);
    expect(facadeMock.reorderCalls[0].sourceIndex).toBe(0);
    expect(facadeMock.reorderCalls[0].targetIndex).toBe(1);

    // Guardar alt delega a facade.updateImageAlt
    instance.saveImageAlt(0, 'Nuevo texto alt');
    expect(facadeMock.updateAltCalls).toHaveLength(1);
    expect(facadeMock.updateAltCalls[0].imageId).toBe('img-1');
    expect(facadeMock.updateAltCalls[0].altText).toBe('Nuevo texto alt');

    // Eliminar imagen delega a facade.deleteImage
    instance.removeImage(0);
    expect(facadeMock.deleteImageCalls).toHaveLength(1);
    expect(facadeMock.deleteImageCalls[0].imageId).toBe('img-1');
  });

  it('manages opening and closing of full image preview modal', async () => {
    await render('create');
    const instance = fixture.componentInstance as any;

    expect(instance.previewModalUrl()).toBeNull();

    instance.openPreview('https://res.cloudinary.com/test/zoom.webp');
    fixture.detectChanges();
    expect(instance.previewModalUrl()).toBe('https://res.cloudinary.com/test/zoom.webp');

    instance.closePreview();
    fixture.detectChanges();
    expect(instance.previewModalUrl()).toBeNull();
  });

  it('manages variants locally in creation mode and submits them with product', async () => {
    const element = await render('create');
    const instance = fixture.componentInstance as any;
    const submissions: ProductFormSubmission[] = [];
    fixture.componentInstance.saved.subscribe((submission) => submissions.push(submission));

    expect(instance.currentVariants()).toHaveLength(0);

    // Abrir modal de creación de variante
    instance.openCreateVariant();
    expect(instance.variantModalOpen()).toBe(true);

    // Llenar campos de variante
    instance.variantSku.set('VAR-SKU-001');
    instance.variantNombre.set('Presentación 1 Metro');
    instance.variantDescripcion.set('Longitud 100 cm');
    instance.variantPrecio.set('79.90');
    instance.variantDisponible.set(true);

    // Guardar variante
    instance.saveVariant();
    expect(instance.variantModalOpen()).toBe(false);
    expect(instance.currentVariants()).toHaveLength(1);
    expect(instance.currentVariants()[0].sku).toBe('VAR-SKU-001');
    expect(instance.currentVariants()[0].precio).toBe(79.9);

    // Llenar datos mínimos del producto para emitir creación
    instance.sku.set('PROD-001');
    instance.nombre.set('Producto con variantes');
    instance.slug.set('producto-con-variantes');
    instance.descripcion.set('Descripción');
    instance.unidadNegocioId.set(unit.id);
    instance.categoriaIds.set([category.id]);

    saveButton(element).click();
    expect(submissions).toHaveLength(1);
    expect(submissions[0].mode).toBe('create');
    const createReq = submissions[0].request as ProductCreateRequest;
    expect(createReq.variantes).toHaveLength(1);
    expect(createReq.variantes![0].sku).toBe('VAR-SKU-001');
    expect(createReq.variantes![0].nombre).toBe('Presentación 1 Metro');
    expect(createReq.variantes![0].precio).toBe(79.9);
  });

  it('delegates variant update and delete to facade in edit mode', async () => {
    const productWithVariants: ProductResponse = {
      ...product,
      variantes: [
        {
          id: 'var-1',
          sku: 'WP-001-BLANCO',
          nombre: 'Blanco 100cm',
          descripcion: 'Color blanco',
          precio: 45.0,
          disponible: true,
          imagenUrl: null,
          orden: 0,
        },
      ],
    };

    await render('edit', productWithVariants);
    const instance = fixture.componentInstance as any;

    expect(instance.currentVariants()).toHaveLength(1);

    // Abrir modal de edición
    instance.openEditVariant(0);
    expect(instance.variantModalOpen()).toBe(true);
    expect(instance.variantSku()).toBe('WP-001-BLANCO');

    // Modificar datos
    instance.variantNombre.set('Blanco Nieve 100cm');
    instance.variantPrecio.set('48.50');
    instance.saveVariant();

    expect(facadeMock.updateVariantCalls).toHaveLength(1);
    expect(facadeMock.updateVariantCalls[0].productId).toBe(productWithVariants.id);
    expect(facadeMock.updateVariantCalls[0].variantId).toBe('var-1');
    expect(facadeMock.updateVariantCalls[0].request.nombre).toBe('Blanco Nieve 100cm');
    expect(facadeMock.updateVariantCalls[0].request.precio).toBe(48.5);

    // Eliminar variante
    instance.removeVariant(0);
    expect(facadeMock.deleteVariantCalls).toHaveLength(1);
    expect(facadeMock.deleteVariantCalls[0].variantId).toBe('var-1');
  });

  it('preserves form data in variant modal when backend error occurs in edit mode', async () => {
    const productWithVariants: ProductResponse = {
      ...product,
      variantes: [],
    };

    await render('edit', productWithVariants);
    const instance = fixture.componentInstance as any;

    instance.openCreateVariant();
    instance.variantSku.set('SKU-DUPLICADO');
    instance.variantNombre.set('Variante Duplicada');
    instance.variantPrecio.set('99.00');

    // Guardar variante -> delega a facade
    instance.saveVariant();
    expect(facadeMock.addVariantCalls).toHaveLength(1);

    // Simular error en facade
    facadeMock.variantError.set('Ya existe una variante con ese SKU.');
    fixture.detectChanges();

    // El modal debe seguir abierto y con los datos intactos
    expect(instance.variantModalOpen()).toBe(true);
    expect(instance.variantSku()).toBe('SKU-DUPLICADO');
    expect(instance.variantNombre()).toBe('Variante Duplicada');
    expect(instance.variantPrecio()).toBe('99.00');
  });

  it('includes specifications in payload when creating product', async () => {
    await render('create');
    const instance = fixture.componentInstance as any;

    instance.nombre.set('Panel Acústico Pro');
    instance.slug.set('panel-acustico-pro');
    instance.sku.set('ACU-001');
    instance.descripcion.set('Panel acústico decorativo');
    instance.unidadNegocioId.set(unit.id);
    instance.categoriaIds.set([category.id]);

    // Agregar especificación localmente en modo creación
    instance.openCreateSpecification();
    instance.specClave.set('Espesor');
    instance.specValor.set('18 mm');
    instance.specGrupo.set('Dimensiones');
    instance.specOrden.set('1');
    instance.saveSpecification();

    expect(instance.currentSpecifications()).toHaveLength(1);
    expect(instance.currentSpecifications()[0].clave).toBe('Espesor');

    let submittedPayload: any = null;
    instance.saved.subscribe((submission: ProductFormSubmission) => {
      if (submission.mode === 'create') {
        submittedPayload = submission.request;
      }
    });

    instance.submit();

    expect(submittedPayload).toBeTruthy();
    expect(submittedPayload.especificaciones).toHaveLength(1);
    expect(submittedPayload.especificaciones[0]).toEqual({
      clave: 'Espesor',
      valor: '18 mm',
      grupo: 'Dimensiones',
      orden: 1,
    });
  });

  it('groups specifications correctly by group name with fallback to General', async () => {
    const productWithSpecs: ProductResponse = {
      ...product,
      especificaciones: [
        { id: 's-1', clave: 'Espesor', valor: '12 mm', grupo: 'Dimensiones', orden: 1 },
        { id: 's-2', clave: 'Ancho', valor: '60 cm', grupo: 'Dimensiones', orden: 2 },
        { id: 's-3', clave: 'Acabado', valor: 'Roble Natural', grupo: null, orden: 3 },
      ],
    };

    await render('edit', productWithSpecs);
    const instance = fixture.componentInstance as any;

    const grouped = instance.groupedSpecifications();
    expect(grouped).toHaveLength(2);
    expect(grouped[0].name).toBe('Dimensiones');
    expect(grouped[0].items).toHaveLength(2);
    expect(grouped[1].name).toBe('General');
    expect(grouped[1].items).toHaveLength(1);
  });

  it('delegates specification update and delete to facade in edit mode', async () => {
    const productWithSpecs: ProductResponse = {
      ...product,
      especificaciones: [
        { id: 's-1', clave: 'Resistencia', valor: 'Alta', grupo: 'Rendimiento', orden: 1 },
      ],
    };

    await render('edit', productWithSpecs);
    const instance = fixture.componentInstance as any;

    expect(instance.currentSpecifications()).toHaveLength(1);

    // Abrir modal de edición
    instance.openEditSpecification(instance.currentSpecifications()[0]);
    expect(instance.specificationModalOpen()).toBe(true);
    expect(instance.specClave()).toBe('Resistencia');

    // Modificar datos
    instance.specValor.set('Muy Alta (250 kg)');
    instance.saveSpecification();

    expect(facadeMock.updateSpecificationCalls).toHaveLength(1);
    expect(facadeMock.updateSpecificationCalls[0].productId).toBe(productWithSpecs.id);
    expect(facadeMock.updateSpecificationCalls[0].specId).toBe('s-1');
    expect(facadeMock.updateSpecificationCalls[0].request.valor).toBe('Muy Alta (250 kg)');

    // Eliminar especificación
    instance.removeSpecification(instance.currentSpecifications()[0]);
    expect(facadeMock.deleteSpecificationCalls).toHaveLength(1);
    expect(facadeMock.deleteSpecificationCalls[0].specId).toBe('s-1');
  });

  it('preserves form data in specification modal when backend error occurs in edit mode', async () => {
    const productWithSpecs: ProductResponse = {
      ...product,
      especificaciones: [],
    };

    await render('edit', productWithSpecs);
    const instance = fixture.componentInstance as any;

    instance.openCreateSpecification('Materiales');
    instance.specClave.set('Densidad');
    instance.specValor.set('750 kg/m³');

    // Guardar especificación -> delega a facade
    instance.saveSpecification();
    expect(facadeMock.addSpecificationCalls).toHaveLength(1);

    // Simular error en facade
    facadeMock.specificationError.set('Error al persistir la especificación en el servidor.');
    fixture.detectChanges();

    // El modal debe seguir abierto y con los datos intactos
    expect(instance.specificationModalOpen()).toBe(true);
    expect(instance.specClave()).toBe('Densidad');
    expect(instance.specValor()).toBe('750 kg/m³');
    expect(instance.specGrupo()).toBe('Materiales');
  });

  it('includes documents in payload when creating product', async () => {
    await render('create');
    const instance = fixture.componentInstance as any;

    instance.nombre.set('Panel Acústico Pro');
    instance.slug.set('panel-acustico-pro');
    instance.sku.set('ACU-001');
    instance.descripcion.set('Panel acústico decorativo');
    instance.unidadNegocioId.set(unit.id);
    instance.categoriaIds.set([category.id]);

    // Agregar documento localmente en modo creación
    instance.openCreateDocument();
    instance.docTitulo.set('Ficha Técnica Oficial');
    instance.docUrl.set('https://isanorte.com/docs/ficha.pdf');
    instance.docTipo.set(ProductDocumentType.FICHA_TECNICA);
    instance.docFormato.set('PDF');
    instance.docTamanoBytes.set('524288');
    instance.saveDocument();

    expect(instance.currentDocuments()).toHaveLength(1);
    expect(instance.currentDocuments()[0].titulo).toBe('Ficha Técnica Oficial');

    let submittedPayload: any = null;
    instance.saved.subscribe((submission: ProductFormSubmission) => {
      if (submission.mode === 'create') {
        submittedPayload = submission.request;
      }
    });

    instance.submit();

    expect(submittedPayload).toBeTruthy();
    expect(submittedPayload.documentos).toHaveLength(1);
    expect(submittedPayload.documentos[0]).toEqual({
      titulo: 'Ficha Técnica Oficial',
      url: 'https://isanorte.com/docs/ficha.pdf',
      tipo: ProductDocumentType.FICHA_TECNICA,
      formato: 'PDF',
      tamanoBytes: 524288,
    });
  });

  it('delegates document update and delete to facade in edit mode', async () => {
    const productWithDocs: ProductResponse = {
      ...product,
      documentos: [
        {
          id: 'doc-1',
          titulo: 'Manual de Instalación',
          url: 'https://isanorte.com/manual.pdf',
          tipo: ProductDocumentType.MANUAL,
          formato: 'PDF',
          tamanoBytes: 1048576,
        },
      ],
    };

    await render('edit', productWithDocs);
    const instance = fixture.componentInstance as any;

    expect(instance.currentDocuments()).toHaveLength(1);

    // Abrir modal de edición
    instance.openEditDocument(instance.currentDocuments()[0]);
    expect(instance.documentModalOpen()).toBe(true);
    expect(instance.docTitulo()).toBe('Manual de Instalación');

    // Modificar datos
    instance.docTitulo.set('Manual de Instalación v2');
    instance.saveDocument();

    expect(facadeMock.updateDocumentCalls).toHaveLength(1);
    expect(facadeMock.updateDocumentCalls[0].productId).toBe(productWithDocs.id);
    expect(facadeMock.updateDocumentCalls[0].docId).toBe('doc-1');
    expect(facadeMock.updateDocumentCalls[0].request.titulo).toBe('Manual de Instalación v2');

    // Eliminar documento
    instance.removeDocument(instance.currentDocuments()[0]);
    expect(facadeMock.deleteDocumentCalls).toHaveLength(1);
    expect(facadeMock.deleteDocumentCalls[0].docId).toBe('doc-1');
  });

  it('preserves form data in document modal when backend error occurs in edit mode', async () => {
    const productWithDocs: ProductResponse = {
      ...product,
      documentos: [],
    };

    await render('edit', productWithDocs);
    const instance = fixture.componentInstance as any;

    instance.openCreateDocument();
    instance.docTitulo.set('Catálogo Comercial 2026');
    instance.docUrl.set('https://isanorte.com/catalogo.pdf');
    instance.docTipo.set(ProductDocumentType.CATALOGO);

    // Guardar documento -> delega a facade
    instance.saveDocument();
    expect(facadeMock.addDocumentCalls).toHaveLength(1);

    // Simular error en facade
    facadeMock.documentError.set('Error al guardar el documento en el servidor.');
    fixture.detectChanges();

    // El modal debe seguir abierto y con los datos intactos
    expect(instance.documentModalOpen()).toBe(true);
    expect(instance.docTitulo()).toBe('Catálogo Comercial 2026');
    expect(instance.docUrl()).toBe('https://isanorte.com/catalogo.pdf');
    expect(instance.docTipo()).toBe(ProductDocumentType.CATALOGO);
  });

  it('loads and displays saved calculation config in edit mode', async () => {
    const productWithCalc: ProductResponse = {
      ...product,
      configuracionCalculo: {
        id: 'calc-1',
        habilitada: true,
        etiquetaEntrada: 'Área a cubrir',
        unidadEntrada: 'm²',
        coberturaPorUnidad: 1.44,
        unidadVenta: 'caja',
        textoAyuda: 'Se recomienda agregar 10% por mermas',
      },
    };

    await render('edit', productWithCalc);
    const instance = fixture.componentInstance as any;

    expect(instance.calcHabilitada()).toBe(true);
    expect(instance.calcCoberturaPorUnidad()).toBe('1.44');
    expect(instance.calcUnidadVenta()).toBe('caja');
    expect(instance.calcEtiquetaEntrada()).toBe('Área a cubrir');
    expect(instance.calcUnidadEntrada()).toBe('m²');
    expect(instance.calcTextoAyuda()).toBe('Se recomienda agregar 10% por mermas');
    expect(instance.isCoverageValid()).toBe(true);
  });

  it('includes configuracionCalculo in create request when enabled and valid', async () => {
    await render('create');
    const instance = fixture.componentInstance as any;
    const submissions: ProductFormSubmission[] = [];
    fixture.componentInstance.saved.subscribe((submission) => submissions.push(submission));

    instance.sku.set('WP-CALC-001');
    instance.nombre.set('Panel con Calculadora');
    instance.slug.set('panel-con-calculadora');
    instance.descripcion.set('Descripción del producto');
    instance.unidadNegocioId.set(unit.id);

    instance.calcHabilitada.set(true);
    instance.calcCoberturaPorUnidad.set('2.5');
    instance.calcUnidadVenta.set('caja');
    instance.calcEtiquetaEntrada.set('Superficie');
    instance.calcUnidadEntrada.set('m²');
    instance.calcTextoAyuda.set('Calcula tus cajas');

    instance.submit();

    expect(submissions).toHaveLength(1);
    const submission = submissions[0];
    expect(submission.mode).toBe('create');
    if (submission.mode === 'create') {
      expect(submission.request.configuracionCalculo).toEqual({
        habilitada: true,
        etiquetaEntrada: 'Superficie',
        unidadEntrada: 'm²',
        coberturaPorUnidad: 2.5,
        unidadVenta: 'caja',
        textoAyuda: 'Calcula tus cajas',
      });
    }
  });

  it('validates that coberturaPorUnidad is greater than zero when calculator is enabled in create mode', async () => {
    await render('create');
    const instance = fixture.componentInstance as any;
    const submissions: ProductFormSubmission[] = [];
    fixture.componentInstance.saved.subscribe((submission) => submissions.push(submission));

    instance.sku.set('WP-CALC-002');
    instance.nombre.set('Panel Inválido');
    instance.slug.set('panel-invalido');
    instance.descripcion.set('Descripción');
    instance.unidadNegocioId.set(unit.id);

    instance.calcHabilitada.set(true);
    instance.calcCoberturaPorUnidad.set('0');

    instance.submit();

    expect(submissions).toHaveLength(0);
    expect(instance.calcSubmitted()).toBe(true);
    expect(instance.isCoverageValid()).toBe(false);
  });

  it('delegates saveCalculationConfig to facade in edit mode and preserves data on error', async () => {
    await render('edit', product);
    const instance = fixture.componentInstance as any;

    instance.calcHabilitada.set(true);
    instance.calcCoberturaPorUnidad.set('1.8');
    instance.calcUnidadVenta.set('galón');
    instance.calcEtiquetaEntrada.set('Área a pintar');
    instance.calcUnidadEntrada.set('m²');

    instance.saveCalculationConfig();

    expect(facadeMock.updateCalculationConfigCalls).toHaveLength(1);
    expect(facadeMock.updateCalculationConfigCalls[0].productId).toBe(product.id);
    expect(facadeMock.updateCalculationConfigCalls[0].request).toEqual({
      habilitada: true,
      etiquetaEntrada: 'Área a pintar',
      unidadEntrada: 'm²',
      coberturaPorUnidad: 1.8,
      unidadVenta: 'galón',
      textoAyuda: null,
    });

    // Simular error en facade
    facadeMock.calculationConfigError.set('Error en el servidor al guardar la calculadora');
    fixture.detectChanges();

    // Los datos deben permanecer en los signals
    expect(instance.calcHabilitada()).toBe(true);
    expect(instance.calcCoberturaPorUnidad()).toBe('1.8');
    expect(instance.calcUnidadVenta()).toBe('galón');
    expect(instance.calcEtiquetaEntrada()).toBe('Área a pintar');
  });

  it('loads and displays retiroEnTienda on edit mode', async () => {
    await render('edit', product);
    const instance = fixture.componentInstance;

    expect(instance.retiroEnTienda()).toBe(true);

    const switchInput = fixture.nativeElement.querySelector('#product-pickup-in-store') as HTMLInputElement;
    expect(switchInput).not.toBeNull();
    expect(switchInput.checked).toBe(true);
  });

  it('configures retiroEnTienda in create submissions', async () => {
    await render('create');
    const instance = fixture.componentInstance as any;
    const createSubmissions: ProductFormSubmission[] = [];
    instance.saved.subscribe((submission: ProductFormSubmission) => createSubmissions.push(submission));

    instance.sku.set('WP-PICKUP-01');
    instance.nombre.set('Panel con Retiro');
    instance.slug.set('panel-con-retiro');
    instance.descripcion.set('Panel listo para recojo');
    instance.unidadNegocioId.set(unit.id);
    instance.retiroEnTienda.set(true);

    instance.submit();

    expect(createSubmissions).toHaveLength(1);
    expect(createSubmissions[0].mode).toBe('create');
    if (createSubmissions[0].mode === 'create') {
      expect(createSubmissions[0].request.retiroEnTienda).toBe(true);
    }
  });

  it('configures retiroEnTienda in edit submissions', async () => {
    await render('edit', product);
    const editInstance = fixture.componentInstance as any;
    const editSubmissions: ProductFormSubmission[] = [];
    editInstance.saved.subscribe((submission: ProductFormSubmission) => editSubmissions.push(submission));

    editInstance.retiroEnTienda.set(false);
    editInstance.submit();

    expect(editSubmissions).toHaveLength(1);
    expect(editSubmissions[0].mode).toBe('edit');
    if (editSubmissions[0].mode === 'edit') {
      expect(editSubmissions[0].request.retiroEnTienda).toBe(false);
    }
  });
});

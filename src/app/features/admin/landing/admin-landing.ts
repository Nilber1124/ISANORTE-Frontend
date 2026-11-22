import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Alert } from '../../../shared/components/alert/alert';
import { Button } from '../../../shared/components/button/button';
import { AdminLandingFacade } from './admin-landing.facade';
import { FieldEditor } from './components/field-editor/field-editor';
import { ProjectFullEditor } from './components/project-full-editor/project-full-editor';
import { ProjectCardEditor, ProjectCardField } from './components/project-card-editor/project-card-editor';
import { ServiceCardEditor, ServiceCardField } from './components/service-card-editor/service-card-editor';
import { MapLocationEditor } from './components/map-location-editor/map-location-editor';
import { StatisticEditor, StatisticField } from './components/statistic-editor/statistic-editor';
import { ProjectsOrderEditor } from './components/projects-order-editor/projects-order-editor';
import { BlockTextEditor } from './components/block-text-editor/block-text-editor';
import { BLOCK_TEXT_DEFAULTS, BlockKey, BlockTextField, isBlockKey } from '../../../shared/content/block-texts';
import { UnitField, UnitFieldEditor } from './components/unit-field-editor/unit-field-editor';
import { CONTENT_ITEMS, ContentItemEditor } from './components/content-item-editor/content-item-editor';
import { ServiceField, ServiceFieldEditor } from './components/service-field-editor/service-field-editor';
import { HeroDraft, HeroEditor, HeroChildSave, HeroFocusRequest, HeroSwap, HeroTextsSave } from './components/hero-editor/hero-editor';
import {
  LandingPreview,
  PreviewDraft,
  PreviewFieldSelection,
  PreviewPage,
} from './components/landing-preview/landing-preview';
import { LandingSectionForm } from './components/landing-section-form/landing-section-form';
import { HeroSceneRequest } from '../../../data/models/landing-section/hero-scene.model';
import {
  DynamicChildManager,
  DynamicChildSave,
} from '../shared/dynamic-child-manager/dynamic-child-manager';

import { LandingSectionType } from '../../../data/models/landing-section/landing-section-type.enum';

/** Campos de texto de una sección de la landing que se pueden tocar en la página. */
export type SectionTextField = 'etiqueta' | 'titulo' | 'subtitulo' | 'contenido';

export const SECTION_TEXT_FIELDS: Readonly<
  Record<SectionTextField, { label: string; rows: number; helper?: string }>
> = {
  etiqueta: { label: 'Frase pequeña sobre el título', rows: 1 },
  titulo: {
    label: 'Título',
    rows: 2,
    helper: 'Un salto de línea parte el título en dos líneas en la web.',
  },
  subtitulo: { label: 'Subtítulo', rows: 3 },
  contenido: { label: 'Descripción', rows: 4 },
};

/** Lo que se edita en el panel al tocar algo de la página (un solo campo). */
export type PanelEdit =
  | { readonly kind: 'section'; readonly field: SectionTextField }
  | { readonly kind: 'service'; readonly slug: string; readonly field: ServiceField }
  | { readonly kind: 'projects' }
  | { readonly kind: 'map' }
  | { readonly kind: 'proy'; readonly id: string; readonly field: ProjectCardField }
  | { readonly kind: 'proyfull'; readonly id: string }
  | { readonly kind: 'svc'; readonly id: string; readonly field: ServiceCardField }
  | { readonly kind: 'stat'; readonly orden: number; readonly field: StatisticField }
  | { readonly kind: 'blocktext'; readonly clave: BlockKey; readonly field: BlockTextField }
  | { readonly kind: 'unit'; readonly slug: string; readonly field: UnitField }
  | {
      readonly kind: 'content';
      readonly item: string;
      readonly id: string;
      readonly field: string;
      readonly extras?: Readonly<Record<string, string>>;
    };

/** Bloque de la web pública (ancla `id` de su `<section>`) y dónde se edita. */
export interface PreviewBlock {
  readonly id: string;
  readonly label: string;
  /** Tipo de sección de la landing que lo alimenta (se edita aquí mismo). */
  readonly type?: LandingSectionType;
  /** Pantalla del admin donde se edita su contenido, si no es una sección de la landing. */
  readonly screen?: { readonly route: string; readonly label: string };
  /** Permite crear un elemento nuevo del bloque (p. ej. un miembro del equipo). */
  readonly create?: {
    readonly item: string;
    readonly label: string;
    /** Campos fijos del alta (p. ej. el ámbito de una pregunta). */
    readonly extras?: Readonly<Record<string, string>>;
  };
}

/** Bloques de la página «Nosotros» (ancla `id` de cada sección). */
export const ABOUT_BLOCKS: readonly PreviewBlock[] = [
  { id: 'cabecera', label: 'Cabecera' },
  { id: 'estadisticas', label: 'Estadísticas' },
  { id: 'valores', label: 'Misión, visión y valores' },
  { id: 'equipo', label: 'Equipo', create: { item: 'miembro', label: 'Añadir un miembro' } },
  {
    id: 'credenciales',
    label: 'Credenciales y respaldo',
    create: { item: 'credencial', label: 'Añadir una credencial' },
  },
  { id: 'cobertura', label: 'Dónde trabajamos' },
];

/** Bloques de la página «Servicios». */
export const SERVICES_BLOCKS: readonly PreviewBlock[] = [
  { id: 'cabecera', label: 'Título' },
  { id: 'servicios', label: 'Servicios', create: { item: 'svc', label: 'Añadir un servicio' } },
  {
    id: 'preguntas',
    label: 'Preguntas frecuentes',
    create: { item: 'faq', label: 'Añadir una pregunta', extras: { ambito: 'SERVICIOS' } },
  },
];

/** Bloques de la página «Proyectos». */
export const PROJECTS_BLOCKS: readonly PreviewBlock[] = [
  { id: 'cabecera', label: 'Título' },
  { id: 'proyectos', label: 'Proyectos', create: { item: 'proy', label: 'Añadir un proyecto' } },
];

export const PREVIEW_BLOCKS: readonly PreviewBlock[] = [
  { id: 'inicio', label: 'Portada (Hero)', type: LandingSectionType.HERO },
  { id: 'servicios', label: 'Servicios', type: LandingSectionType.SERVICIOS, screen: { route: '/admin/servicios', label: 'Editar los servicios' } },
  { id: 'proyectos', label: 'Proyectos destacados', type: LandingSectionType.PROYECTOS, screen: { route: '/admin/proyectos', label: 'Editar los proyectos' } },
  { id: 'proceso', label: 'Cómo trabajamos', screen: { route: '/admin/sitio/pasos-proceso', label: 'Editar los pasos' } },
  { id: 'garantias', label: 'Por qué ISANORTE', screen: { route: '/admin/sitio/garantias', label: 'Editar las garantías' } },
  { id: 'testimonios', label: 'Testimonios', screen: { route: '/admin/sitio/testimonios', label: 'Editar los testimonios' } },
  { id: 'isadecor', label: 'Unidad ISADECOR', type: LandingSectionType.UNIDAD_NEGOCIO, screen: { route: '/admin/unidades-negocio', label: 'Editar la unidad de negocio' } },
  { id: 'preguntas', label: 'Preguntas frecuentes', screen: { route: '/admin/sitio/faqs', label: 'Editar las preguntas' } },
  { id: 'cotizar', label: 'Llamado a cotizar', type: LandingSectionType.CTA },
];

@Component({
  selector: 'app-admin-landing',
  imports: [
    Alert,
    Button,
    DynamicChildManager,
    FieldEditor,
    HeroEditor,
    ContentItemEditor,
    UnitFieldEditor,
    BlockTextEditor,
    ProjectsOrderEditor,
    StatisticEditor,
    MapLocationEditor,
    ProjectCardEditor,
    ProjectFullEditor,
    ServiceCardEditor,
    ServiceFieldEditor,
    LandingPreview,
    LandingSectionForm,
    RouterLink,
  ],
  templateUrl: './admin-landing.html',
  styleUrls: ['./admin-landing.css'],
  providers: [AdminLandingFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLanding {
  readonly facade = inject(AdminLandingFacade);
  private readonly route = inject(ActivatedRoute, { optional: true });
  private readonly router = inject(Router, { optional: true });

  /** Página que se previsualiza y sus bloques. */
  readonly previewPage = signal<PreviewPage>('inicio');
  readonly previewBlocks = computed(() =>
    this.previewPage() === 'nosotros'
      ? ABOUT_BLOCKS
      : this.previewPage() === 'servicios'
        ? SERVICES_BLOCKS
        : this.previewPage() === 'proyectos'
          ? PROJECTS_BLOCKS
          : PREVIEW_BLOCKS,
  );
  readonly selectedBlockId = signal<string | null>(null);
  /** El bloque elegido se está editando en el panel (hoy solo el Hero tiene editor propio). */
  readonly editingInPanel = signal(false);
  /** Campo o lista tocado en la página: el editor muestra solo eso (`null` = todo el Hero). */
  readonly heroOnly = signal<string | null>(null);
  /** Campo suelto (texto de sección o de una tarjeta de servicio) abierto en el panel. */
  readonly panelEdit = signal<PanelEdit | null>(null);
  /** Borrador en vivo del Hero (lo que se teclea en el panel) y campo tocado en la página. */
  readonly previewDraft = signal<PreviewDraft | null>(null);
  readonly focusRequest = signal<HeroFocusRequest | null>(null);
  /** Sube cuando cambian las secciones: la vista previa se recarga con lo guardado. */
  readonly previewKey = signal(0);

  /** El bloque elegido, buscado entre los de la página que se previsualiza (los ids se repiten entre páginas). */
  readonly selectedBlock = computed(
    () => this.previewBlocks().find((block) => block.id === this.selectedBlockId()) ?? null,
  );
  /** Sección de la landing que alimenta el bloque elegido (si la hay y está registrada). */
  readonly selectedSection = computed(() => {
    const type = this.selectedBlock()?.type;
    return type ? (this.facade.sections().find((section) => section.tipo === type) ?? null) : null;
  });

  private lastSections: unknown = null;

  /** Pantallas que antes eran pestañas de esta página y ahora tienen su propia ruta. */
  private readonly legacyTabRoutes: Record<string, string> = {
    servicios: '/admin/servicios',
    proyectos: '/admin/proyectos',
    contenido: '/admin/contenido',
  };

  /** Atajos a las demás pantallas que alimentan la landing. */
  readonly relatedScreens: readonly { label: string; route: string; hint: string }[] = [
    { label: 'Servicios', route: '/admin/servicios', hint: 'Servicios que se muestran en la portada' },
    { label: 'Proyectos', route: '/admin/proyectos', hint: 'Obras y casos de éxito' },
    { label: 'Páginas y SEO', route: '/admin/contenido', hint: 'Textos y posicionamiento' },
  ];

  constructor() {
    afterNextRender(() => {
      this.facade.load();
    });

    effect(() => {
      const sections = this.facade.sections();
      untracked(() => {
        if (this.lastSections !== null && sections !== this.lastSections) {
          this.previewKey.update((key) => key + 1);
        }
        this.lastSections = sections;
      });
    });

    const tabParam = this.route?.snapshot?.queryParamMap?.get('tab');
    if (tabParam === 'nosotros') {
      // Enlace antiguo: los textos de Nosotros ahora se editan en la vista previa de esa página.
      this.previewPage.set('nosotros');
    } else if (tabParam && this.legacyTabRoutes[tabParam]) {
      // Enlaces antiguos (?tab=servicios…): esas pantallas ya viven en su propia ruta.
      void this.router?.navigateByUrl(this.legacyTabRoutes[tabParam]);
    }
  }

  /** Cambió la página de la vista previa: se limpia lo seleccionado. */
  protected changePage(page: PreviewPage): void {
    this.previewPage.set(page);
    this.selectedBlockId.set(null);
    this.editingInPanel.set(false);
    this.heroOnly.set(null);
    this.panelEdit.set(null);
    this.previewDraft.set(null);
  }

  protected selectBlock(id: string): void {
    this.selectedBlockId.set(id);
    this.editingInPanel.set(false);
    this.heroOnly.set(null);
    this.panelEdit.set(null);
    this.previewDraft.set(null);
  }

  /** Se tocó un texto o una foto del Hero en la página: se abre su editor con ese campo enfocado. */
  protected selectField(selection: PreviewFieldSelection): void {
    // Una tarjeta de servicio: nombre o descripción corta de ese servicio.
    if (selection.item?.startsWith('servicio:')) {
      if (['nombre', 'resumen', 'tarjeta'].includes(selection.field)) {
        this.panelEdit.set({
          kind: 'service',
          slug: selection.item.slice('servicio:'.length),
          field: (selection.field === 'tarjeta' ? 'ambos' : selection.field) as ServiceField,
        });
      }
      return;
    }
    // Una estadística de la empresa («+12 años…»): cifra (prefijo, cifra, sufijo), etiqueta o ambas.
    if (selection.item?.startsWith('estadistica:')) {
      const orden = Number(selection.item.slice('estadistica:'.length));
      if (!Number.isNaN(orden) && ['valor', 'etiqueta', 'tarjeta'].includes(selection.field)) {
        this.panelEdit.set({
          kind: 'stat',
          orden,
          field: (selection.field === 'tarjeta' ? 'ambos' : selection.field) as StatisticField,
        });
      }
      return;
    }
    // Una tarjeta de proyecto: solo se cambia qué proyectos salen y en qué orden.
    if (selection.item?.startsWith('proyectos:')) {
      this.panelEdit.set({ kind: 'projects' });
      return;
    }
    // La unidad de negocio del bloque ISADECOR: descripción y/o puntos de oferta.
    if (selection.item?.startsWith('unidad:')) {
      if (['descripcion', 'ofertas', 'tarjeta'].includes(selection.field)) {
        this.panelEdit.set({
          kind: 'unit',
          slug: selection.item.slice('unidad:'.length),
          field: (selection.field === 'tarjeta' ? 'ambos' : selection.field) as UnitField,
        });
      }
      return;
    }
    // Un elemento del contenido del sitio (garantía, testimonio…): sus textos, juntos o por separado.
    const [prefix, ...rest] = (selection.item ?? '').split(':');
    const content = CONTENT_ITEMS[prefix];
    if (content && rest.length > 0) {
      if (selection.field === 'tarjeta' || content.fields.some((f) => f.key === selection.field)) {
        this.panelEdit.set({
          kind: 'content',
          item: prefix,
          id: rest.join(':'),
          field: selection.field === 'tarjeta' ? 'ambos' : selection.field,
        });
      }
      return;
    }
    // Una tarjeta de la página Proyectos: portada, textos, tipo de obra o servicios (o todo si se toca la tarjeta).
    if (selection.item?.startsWith('proy:')) {
      if (['nombre', 'descripcion', 'ubicacion', 'fechaProyecto', 'imagenUrl', 'tarjeta'].includes(selection.field)) {
        const id = selection.item.slice('proy:'.length);
        // Un campo suelto abre su editor; tocar la tarjeta abre el formulario completo del proyecto.
        this.panelEdit.set(
          selection.field === 'tarjeta'
            ? { kind: 'proyfull', id }
            : { kind: 'proy', id, field: selection.field as ProjectCardField },
        );
      }
      return;
    }
    // Una tarjeta de la página Servicios: foto, nombre, descripción o puntos (o todo si se toca la tarjeta).
    if (selection.item?.startsWith('svc:')) {
      if (['nombre', 'descripcion', 'imagenUrl', 'beneficios', 'tarjeta'].includes(selection.field)) {
        this.panelEdit.set({
          kind: 'svc',
          id: selection.item.slice('svc:'.length),
          field: (selection.field === 'tarjeta' ? 'ambos' : selection.field) as ServiceCardField,
        });
      }
      return;
    }
    // El mapa de «Dónde trabajamos»: se elige la ubicación de la oficina.
    if (!selection.item && selection.block === 'cobertura' && selection.field === 'ubicacion') {
      this.panelEdit.set({ kind: 'map' });
      return;
    }
    // Misión, visión o valores (campos de la empresa): se edita solo el texto tocado.
    if (selection.item?.startsWith('valor:')) {
      this.panelEdit.set({
        kind: 'content',
        item: 'empresa',
        id: '*',
        field: selection.item.slice('valor:'.length),
      });
      return;
    }
    // Lugares de cobertura y año de fundación (campos de la empresa) de la sección «Dónde trabajamos».
    if (!selection.item && selection.block === 'cobertura' && ['zonaCobertura', 'anioFundacion'].includes(selection.field)) {
      this.panelEdit.set({ kind: 'content', item: 'empresa', id: '*', field: selection.field });
      return;
    }
    // La cabecera de la página «Nosotros»: contenido de página NOSOTROS (frase, título, introducción, descripción).
    if (!selection.item && selection.block === 'cabecera') {
      if (CONTENT_ITEMS['pagina'].fields.some((f) => f.key === selection.field)) {
        const page = this.previewPage();
        const pagina = page === 'servicios' ? 'SERVICIOS' : page === 'proyectos' ? 'PROYECTOS' : 'NOSOTROS';
        this.panelEdit.set({ kind: 'content', item: 'pagina', id: pagina, field: selection.field });
      }
      return;
    }
    // Cabecera (frase, título, subtítulo) de un bloque con texto editable, sin elemento repetido.
    if (!selection.item && isBlockKey(selection.block) && selection.field in BLOCK_TEXT_DEFAULTS[selection.block]) {
      this.panelEdit.set({
        kind: 'blocktext',
        clave: selection.block,
        field: selection.field as BlockTextField,
      });
      return;
    }
    // Texto de una sección que no es el Hero: un solo campo.
    if (selection.block !== 'inicio') {
      if (this.selectedSection() && selection.field in SECTION_TEXT_FIELDS) {
        this.panelEdit.set({ kind: 'section', field: selection.field as SectionTextField });
      }
      return;
    }
    if (!this.selectedSection()) return;
    this.heroOnly.set(selection.field);
    this.editingInPanel.set(true);
    this.focusRequest.set({ field: selection.field, n: Date.now() });
  }

  protected closePanelEdit(): void {
    this.panelEdit.set(null);
    this.previewDraft.set(null);
  }

  protected sectionFieldLabel(field: SectionTextField): string {
    return SECTION_TEXT_FIELDS[field].label;
  }

  protected sectionFieldRows(field: SectionTextField): number {
    return SECTION_TEXT_FIELDS[field].rows;
  }

  protected sectionFieldHelper(field: SectionTextField): string | undefined {
    return SECTION_TEXT_FIELDS[field].helper;
  }

  protected sectionFieldValue(field: SectionTextField): string {
    return this.selectedSection()?.[field] ?? '';
  }

  protected setSectionDraft(field: SectionTextField, value: string | null): void {
    const block = this.selectedBlockId();
    this.previewDraft.set(block && value !== null ? { block, values: { [field]: value } } : null);
  }

  protected saveSectionField(field: SectionTextField, value: string): void {
    const section = this.selectedSection();
    if (!section) return;
    this.facade.update(
      {
        configuracionSitioId: section.configuracionSitioId,
        tipo: section.tipo,
        etiqueta: section.etiqueta,
        titulo: section.titulo,
        subtitulo: section.subtitulo,
        contenido: section.contenido,
        imagenUrl: section.imagenUrl,
        imagenAlt: section.imagenAlt,
        textoBoton: section.textoBoton,
        enlaceBoton: section.enlaceBoton,
        orden: section.orden ?? 0,
        visible: section.visible ?? true,
        [field]: value || null,
      },
      section,
    );
  }

  protected setBlockTextDraft(clave: BlockKey, values: Readonly<Record<string, string>> | null): void {
    this.previewDraft.set(values ? { block: clave, values } : null);
  }

  protected setUnitDraft(slug: string, values: Readonly<Record<string, string>> | null): void {
    const block = this.selectedBlockId();
    this.previewDraft.set(block && values ? { block, item: `unidad:${slug}`, values } : null);
  }

  /** Abre el formulario para crear un elemento nuevo del bloque seleccionado. */
  protected startCreate(item: string, extras?: Readonly<Record<string, string>>): void {
    if (item === 'proy') {
      this.panelEdit.set({ kind: 'proyfull', id: 'new' });
      return;
    }
    if (item === 'svc') {
      this.panelEdit.set({ kind: 'svc', id: 'new', field: 'ambos' });
      return;
    }
    this.panelEdit.set({ kind: 'content', item, id: 'new', field: 'ambos', extras });
  }

  protected setProjectCardDraft(id: string, values: Readonly<Record<string, string>> | null): void {
    const block = this.selectedBlockId();
    this.previewDraft.set(block && values ? { block, item: `proy:${id}`, values } : null);
  }

  protected setServiceCardDraft(id: string, values: Readonly<Record<string, string>> | null): void {
    const block = this.selectedBlockId();
    this.previewDraft.set(block && values ? { block, item: `svc:${id}`, values } : null);
  }

  protected setStatDraft(orden: number, values: Readonly<Record<string, string>> | null): void {
    const block = this.selectedBlockId();
    this.previewDraft.set(block && values ? { block, item: `estadistica:${orden}`, values } : null);
  }

  protected setContentDraft(item: string, id: string, values: Readonly<Record<string, string>> | null): void {
    const block = this.selectedBlockId();
    this.previewDraft.set(block && values ? { block, item: `${item}:${id}`, values } : null);
  }

  protected setServiceDraft(slug: string, values: Readonly<Record<string, string>> | null): void {
    const block = this.selectedBlockId();
    this.previewDraft.set(block && values ? { block, item: `servicio:${slug}`, values } : null);
  }

  protected serviceSaved(): void {
    this.previewDraft.set(null);
    this.previewKey.update((key) => key + 1);
  }

  protected closeHeroEditor(): void {
    this.editingInPanel.set(false);
    this.heroOnly.set(null);
    this.previewDraft.set(null);
  }

  protected setHeroDraft(draft: HeroDraft): void {
    this.previewDraft.set(draft ? { block: 'inicio', values: draft } : null);
  }

  protected readonly heroBusy = computed(
    () => this.facade.submitting() || this.facade.childSaving(),
  );

  // Eventos del editor del Hero: se aplican siempre sobre la sección vigente.
  protected saveHeroTexts(event: HeroTextsSave): void {
    this.facade.update(event.request, this.selectedSection());
  }
  protected saveHeroScene(event: HeroChildSave<HeroSceneRequest>): void {
    this.facade.saveScene(event.request, event.id, this.selectedSection());
  }
  protected deleteHeroScene(id: string): void {
    this.facade.deleteScene(id, this.selectedSection());
  }
  protected swapHeroChildren(event: HeroSwap): void {
    const section = this.selectedSection();
    if (section) this.facade.swapSceneOrder(event.first, event.second, section);
  }
  protected setHeroVisibility(visible: boolean): void {
    const section = this.selectedSection();
    if (section) this.facade.changeVisibility(section, visible);
  }

  protected saveChild(event: DynamicChildSave): void {
    this.facade.saveScene(event.request as HeroSceneRequest, event.id);
  }
}

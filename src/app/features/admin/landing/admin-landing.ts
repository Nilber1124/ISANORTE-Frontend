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
import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { AdminLandingFacade } from './admin-landing.facade';
import { HeroDraft, HeroEditor, HeroChildSave, HeroFocusRequest, HeroSwap, HeroTextsSave } from './components/hero-editor/hero-editor';
import {
  LandingPreview,
  PreviewDraft,
  PreviewFieldSelection,
} from './components/landing-preview/landing-preview';
import { LandingSectionForm } from './components/landing-section-form/landing-section-form';
import { HeroSceneRequest } from '../../../data/models/landing-section/hero-scene.model';
import {
  DynamicChildManager,
  DynamicChildSave,
} from '../shared/dynamic-child-manager/dynamic-child-manager';
import { AdminCompany } from '../company/admin-company';

import { LandingSectionType } from '../../../data/models/landing-section/landing-section-type.enum';

export interface SectionMeta {
  label: string;
  badge: string;
  description: string;
}

export type LandingTab = 'vista' | 'secciones' | 'nosotros';

/** Bloque de la web pública (ancla `id` de su `<section>`) y dónde se edita. */
export interface PreviewBlock {
  readonly id: string;
  readonly label: string;
  /** Tipo de sección de la landing que lo alimenta (se edita aquí mismo). */
  readonly type?: LandingSectionType;
  /** Pantalla del admin donde se edita su contenido, si no es una sección de la landing. */
  readonly screen?: { readonly route: string; readonly label: string };
}

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

export interface LandingTabItem {
  id: LandingTab;
  label: string;
  description: string;
}

@Component({
  selector: 'app-admin-landing',
  imports: [
    Alert,
    Badge,
    Button,
    DynamicChildManager,
    EmptyState,
    HeroEditor,
    LandingPreview,
    LandingSectionForm,
    RouterLink,
    AdminCompany,
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

  readonly tabs: readonly LandingTabItem[] = [
    {
      id: 'vista',
      label: 'Vista previa',
      description: 'La web tal como se ve; toca un bloque para editarlo.',
    },
    {
      id: 'secciones',
      label: 'Secciones & Hero',
      description: 'Estructura principal, orden, visibilidad y escenas dinámicas.',
    },
    {
      id: 'nosotros',
      label: 'Nosotros',
      description: 'Presentación de la empresa, misión, visión, valores y estadísticas.',
    },
  ];

  readonly activeTab = signal<LandingTab>('vista');

  readonly previewBlocks = PREVIEW_BLOCKS;
  readonly selectedBlockId = signal<string | null>(null);
  /** El bloque elegido se está editando en el panel (hoy solo el Hero tiene editor propio). */
  readonly editingInPanel = signal(false);
  /** Campo o lista tocado en la página: el editor muestra solo eso (`null` = todo el Hero). */
  readonly heroOnly = signal<string | null>(null);
  /** Borrador en vivo del Hero (lo que se teclea en el panel) y campo tocado en la página. */
  readonly previewDraft = signal<PreviewDraft | null>(null);
  readonly focusRequest = signal<HeroFocusRequest | null>(null);
  /** Sube cuando cambian las secciones: la vista previa se recarga con lo guardado. */
  readonly previewKey = signal(0);

  readonly selectedBlock = computed(
    () => PREVIEW_BLOCKS.find((block) => block.id === this.selectedBlockId()) ?? null,
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
    contacto: '/admin/contacto',
  };

  /** Atajos a las demás pantallas que alimentan la landing. */
  readonly relatedScreens: readonly { label: string; route: string; hint: string }[] = [
    { label: 'Servicios', route: '/admin/servicios', hint: 'Servicios que se muestran en la portada' },
    { label: 'Proyectos', route: '/admin/proyectos', hint: 'Obras y casos de éxito' },
    { label: 'Contacto', route: '/admin/contacto', hint: 'Mensajes recibidos' },
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
    if (tabParam && this.isValidTab(tabParam)) {
      this.activeTab.set(tabParam);
    } else if (tabParam && this.legacyTabRoutes[tabParam]) {
      // Enlaces antiguos (?tab=servicios…): esas pantallas ya viven en su propia ruta.
      void this.router?.navigateByUrl(this.legacyTabRoutes[tabParam]);
    }
  }

  protected selectTab(tabId: LandingTab): void {
    this.activeTab.set(tabId);
    if (this.router && this.route) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab: tabId === 'vista' ? null : tabId },
        queryParamsHandling: 'merge',
      });
    }
  }

  protected selectBlock(id: string): void {
    this.selectedBlockId.set(id);
    this.editingInPanel.set(false);
    this.heroOnly.set(null);
    this.previewDraft.set(null);
  }

  /** Se tocó un texto o una foto del Hero en la página: se abre su editor con ese campo enfocado. */
  protected selectField(selection: PreviewFieldSelection): void {
    if (selection.block !== 'inicio' || !this.selectedSection()) return;
    this.heroOnly.set(selection.field);
    this.editingInPanel.set(true);
    this.focusRequest.set({ field: selection.field, n: Date.now() });
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

  protected sectionMeta(type: string): SectionMeta {
    switch (type) {
      case LandingSectionType.HERO:
        return {
          label: 'Portada Principal (Hero)',
          badge: 'Portada',
          description: 'Carrusel de cabecera con fotografías de bienvenida y mensaje central.',
        };
      case LandingSectionType.SERVICIOS:
        return {
          label: 'Nuestros Servicios',
          badge: 'Servicios',
          description: 'Vitrina de soluciones y especialidades técnicas destacadas.',
        };
      case LandingSectionType.UNIDAD_NEGOCIO:
        return {
          label: 'Unidad de Negocio (ISADECOR)',
          badge: 'ISADECOR',
          description: 'Promoción de la división de acabados y diseño de interiores.',
        };
      case LandingSectionType.PROYECTOS:
        return {
          label: 'Proyectos Destacados',
          badge: 'Proyectos',
          description: 'Portafolio de obras y casos de éxito en la portada.',
        };
      case LandingSectionType.CTA:
        return {
          label: 'Llamado a la Acción (CTA)',
          badge: 'Conversión',
          description: 'Franja de cierre para invitar a cotizaciones o asesoría directa.',
        };
      case LandingSectionType.EMPRESA:
        return {
          label: 'Acerca de la Empresa',
          badge: 'Empresa',
          description: 'Presentación institucional, historia y trayectoria de ISANORTE.',
        };
      case LandingSectionType.CONTACTO:
        return {
          label: 'Formulario de Contacto',
          badge: 'Contacto',
          description: 'Bloque de contacto directo y canales de atención.',
        };
      default:
        return {
          label: 'Sección Personalizada',
          badge: 'Personalizada',
          description: 'Bloque con contenido libre y enlaces a medida.',
        };
    }
  }

  /** Qué trae la sección, en una línea (título e imagen). Los botones son fijos y no se editan. */
  protected contentSummary(section: { titulo?: string | null; imagenUrl?: string | null }): string {
    const parts = [section.titulo ? 'Título' : null, section.imagenUrl ? 'Imagen' : null].filter((part): part is string => part !== null);
    return parts.length > 0 ? parts.join(' · ') : 'Sin contenido propio';
  }

  protected sectionOrderLabel(order: number | null | undefined): string {
    const val = order ?? 0;
    if (val === 0) return '1ª en la web (Portada)';
    if (val === 1) return '2ª posición';
    if (val === 2) return '3ª posición';
    if (val === 3) return '4ª posición';
    return `${val + 1}ª posición`;
  }

  private isValidTab(tab: string): tab is LandingTab {
    return ['vista', 'secciones', 'nosotros'].includes(tab);
  }

  protected saveChild(event: DynamicChildSave): void {
    this.facade.saveScene(event.request as HeroSceneRequest, event.id);
  }
}

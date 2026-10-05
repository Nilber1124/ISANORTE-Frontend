import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Alert } from '../../../shared/components/alert/alert';
import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { AdminLandingFacade } from './admin-landing.facade';
import { LandingSectionForm } from './components/landing-section-form/landing-section-form';
import { HeroSceneRequest } from '../../../data/models/landing-section/hero-scene.model';
import { LandingActionRequest } from '../../../data/models/landing-section/landing-action.model';
import {
  DynamicChildManager,
  DynamicChildSave,
} from '../shared/dynamic-child-manager/dynamic-child-manager';
import { AdminCompany } from '../company/admin-company';
import { AdminServices } from '../services/admin-services';
import { AdminProjects } from '../projects/admin-projects';
import { AdminContent } from '../content/admin-content';
import { AdminContact } from '../contact/admin-contact';

import { LandingSectionResponse } from '../../../data/models/landing-section/landing-section-response.model';
import { LandingSectionType } from '../../../data/models/landing-section/landing-section-type.enum';

export interface SectionMeta {
  label: string;
  badge: string;
  description: string;
}

export type LandingTab =
  | 'secciones'
  | 'nosotros'
  | 'servicios'
  | 'proyectos'
  | 'contenido'
  | 'contacto';

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
    LandingSectionForm,
    RouterLink,
    AdminCompany,
    AdminServices,
    AdminProjects,
    AdminContent,
    AdminContact,
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
      id: 'secciones',
      label: 'Secciones & Hero',
      description: 'Estructura principal, orden, visibilidad y escenas dinámicas.',
    },
    {
      id: 'nosotros',
      label: 'Nosotros',
      description: 'Presentación de la empresa, misión, visión, valores y estadísticas.',
    },
    {
      id: 'servicios',
      label: 'Servicios',
      description: 'Servicios destacados y beneficios mostrados en la web.',
    },
    {
      id: 'proyectos',
      label: 'Proyectos',
      description: 'Obras y casos de éxito que se presentan en la landing.',
    },
    {
      id: 'contenido',
      label: 'Contenido & SEO',
      description: 'Textos editoriales y configuración de posicionamiento.',
    },
    {
      id: 'contacto',
      label: 'Contacto',
      description: 'Mensajes y solicitudes comerciales recibidas de clientes.',
    },
  ];

  readonly activeTab = signal<LandingTab>('secciones');

  constructor() {
    afterNextRender(() => {
      this.facade.load();
    });

    const tabParam = this.route?.snapshot?.queryParamMap?.get('tab');
    if (tabParam && this.isValidTab(tabParam)) {
      this.activeTab.set(tabParam);
    }
  }

  protected selectTab(tabId: LandingTab): void {
    this.activeTab.set(tabId);
    if (this.router && this.route) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab: tabId === 'secciones' ? null : tabId },
        queryParamsHandling: 'merge',
      });
    }
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

  protected sectionOrderLabel(order: number | null | undefined): string {
    const val = order ?? 0;
    if (val === 0) return '1ª en la web (Portada)';
    if (val === 1) return '2ª posición';
    if (val === 2) return '3ª posición';
    if (val === 3) return '4ª posición';
    return `${val + 1}ª posición`;
  }

  private isValidTab(tab: string): tab is LandingTab {
    return ['secciones', 'nosotros', 'servicios', 'proyectos', 'contenido', 'contacto'].includes(
      tab,
    );
  }

  protected saveChild(event: DynamicChildSave): void {
    if (this.facade.childKind() === 'scene')
      this.facade.saveScene(event.request as HeroSceneRequest, event.id);
    else this.facade.saveAction(event.request as LandingActionRequest, event.id);
  }
}

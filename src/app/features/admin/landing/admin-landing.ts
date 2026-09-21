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

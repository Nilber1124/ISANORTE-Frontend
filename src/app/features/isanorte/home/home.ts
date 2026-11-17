import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { CinematicTour } from '../../../shared/components/cinematic-tour/cinematic-tour';
import { ContactForm } from '../contact/contact-form/contact-form';
import { PublicContactFacade } from '../contact/public-contact.facade';
import { PublicSiteFacade } from '../../../layouts/public-layout/public-site.facade';
import { PublicBusinessUnitResource } from '../../../data/models/public-content/public-home.model';
import { HOME_BUSINESS_UNIT_FALLBACK } from './home-business-unit-fallback';
import { HomeMotion } from './home-motion.directive';
import {
  HOME_ISADECOR_OFFER,
  HOME_RESPONSE_PROMISE,
  HOME_SERVICE_OPTIONS,
  HOME_PROCESS,
  HOME_RAIL,
  HOME_TRUST_POINTS,
  resolveHomeUrl,
  serviceIconPath,
} from './home-landing.data';
import { HOME_SERVICES_FALLBACK } from './home-services-fallback';
import { PublicHomeFacade } from './public-home.facade';
import {
  HomeBusinessUnitActionView,
  HomeServiceActionView,
  HomeServiceCardView,
  HomeServicesHeaderView,
} from './home-view.model';

export interface ProjectTile {
  id: string;
  slug: string;
  title: string;
  location: string;
  imageUrl: string;
  imageAlt: string;
  /** Clases de rejilla (bento) según la cantidad de proyectos. */
  gridClass: string;
  featured: boolean;
}
export interface PreFooterData {
  title: string;
  subtitle: string;
  cta: { label: string; url: string };
}

interface BusinessUnitDisplay {
  header: { eyebrow: string; title: string };
  unit: { nombre: string; descripcion: string };
  background: PublicBusinessUnitResource | null;
  editorials: readonly PublicBusinessUnitResource[];
  actions: readonly HomeBusinessUnitActionView[];
}

interface ServicesDisplay {
  services: readonly HomeServiceCardView[];
  header: HomeServicesHeaderView;
  action: HomeServiceActionView | null;
}

/** Tamaños de la rejilla bento según cuántos proyectos hay (máximo 5). */
const BENTO_LAYOUTS: Record<number, readonly string[]> = {
  1: ['md:col-span-4 md:row-span-2'],
  2: ['md:col-span-2 md:row-span-2', 'md:col-span-2 md:row-span-2'],
  3: ['md:col-span-2 md:row-span-2', 'md:col-span-2', 'md:col-span-2'],
  4: ['md:col-span-2 md:row-span-2', 'md:col-span-2', 'md:col-span-1', 'md:col-span-1'],
  5: [
    'md:col-span-2 md:row-span-2',
    'md:col-span-1',
    'md:col-span-1',
    'md:col-span-1',
    'md:col-span-1',
  ],
};

@Component({
  imports: [CommonModule, Button, Card, Badge, CinematicTour, ContactForm, HomeMotion],
  selector: 'app-isanorte-home',
  providers: [PublicHomeFacade, PublicContactFacade],
  styleUrl: './home.css',
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  readonly facade = inject(PublicHomeFacade);
  private readonly site = inject(PublicSiteFacade, { optional: true });
  /** Formulario del cierre: solo envía; el contenido de la página Contacto no se carga aquí. */
  readonly contactFacade = inject(PublicContactFacade);

  /** TRANSITORIO: sólo se presenta tras un error real del GET de Home. */
  readonly servicesFallback = HOME_SERVICES_FALLBACK;
  /** TRANSITORIO: sólo se presenta tras un error real del GET de Home. */
  readonly businessUnitFallback = HOME_BUSINESS_UNIT_FALLBACK;

  /** Contenido local transitorio del diseño (ver docs/landing/BACKEND-PENDIENTE.md). */
  readonly process = HOME_PROCESS;
  readonly trustPoints = HOME_TRUST_POINTS;
  readonly isadecorOffer = HOME_ISADECOR_OFFER;
  readonly rail = HOME_RAIL;
  readonly serviceOptions = HOME_SERVICE_OPTIONS;
  readonly responsePromise = HOME_RESPONSE_PROMISE;
  readonly serviceIconPath = serviceIconPath;

  readonly whatsappHref = computed(() => this.site?.whatsappHref() ?? null);
  readonly email = computed(() => this.site?.contactEmails()[0] ?? null);
  readonly phone = computed(() => this.site?.contactPhones()[0] ?? null);
  readonly phoneHref = computed(() => {
    const phone = this.phone();
    return phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null;
  });

  readonly heroPrimary = computed(() => {
    const action = this.facade.heroActions()[0];
    return action ? { label: action.label, url: resolveHomeUrl(action.url, '/contacto') } : null;
  });
  readonly heroSecondary = computed(() => {
    const action = this.facade.heroActions()[1];
    return action ? { label: action.label, url: resolveHomeUrl(action.url, '/contacto') } : null;
  });

  readonly servicesDisplay = computed<ServicesDisplay | null>(() => {
    if (this.facade.showServices()) {
      const action = this.facade.servicesAction();
      return {
        services: this.facade.services().map((service) => ({
          ...service,
          linkUrl: resolveHomeUrl(service.linkUrl, '/servicios'),
        })),
        header: this.facade.servicesHeader() ?? this.servicesFallback.header,
        action: action ? { ...action, url: resolveHomeUrl(action.url, '/servicios') } : null,
      };
    }
    if (this.facade.error()) {
      return {
        services: this.servicesFallback.services.map((service) => ({
          ...service,
          linkUrl: resolveHomeUrl(service.linkUrl, '/servicios'),
        })),
        header: this.servicesFallback.header,
        action: {
          ...this.servicesFallback.action,
          url: resolveHomeUrl(this.servicesFallback.action.url, '/servicios'),
        },
      };
    }
    return null;
  });

  readonly projectsAction = computed(() => {
    const action = this.facade.projectsAction();
    return { ...action, url: resolveHomeUrl(action.url, '/proyectos') };
  });

  /**
   * Sólo la composición editorial pertenece a Angular. En success se usan los
   * datos derivados de Home; el baseline queda disponible únicamente en error.
   */
  readonly businessUnitDisplay = computed<BusinessUnitDisplay | null>(() => {
    if (this.facade.showBusinessUnit()) {
      const header = this.facade.businessUnitHeader();
      const unit = this.facade.featuredBusinessUnit();
      if (header === null || unit === null) return null;

      return {
        header,
        unit: { nombre: unit.nombre, descripcion: unit.descripcion ?? '' },
        background: this.facade.businessUnitBackgroundResource(),
        editorials: this.facade.businessUnitEditorialResources(),
        actions: this.normalizedUnitActions(this.facade.businessUnitActions()),
      };
    }

    if (this.facade.error()) {
      return {
        header: this.businessUnitFallback.header,
        unit: this.businessUnitFallback.unit,
        background: this.businessUnitFallback.background,
        editorials: this.businessUnitFallback.editorials,
        actions: this.normalizedUnitActions(this.businessUnitFallback.actions),
      };
    }

    return null;
  });

  /** Imagen principal de la composición ISADECOR: primera editorial o, si no hay, el fondo. */
  readonly unitImages = computed(() => {
    const unit = this.businessUnitDisplay();
    if (unit === null) return [];
    const images = [...unit.editorials];
    if (images.length === 0 && unit.background) images.push(unit.background);
    return images.slice(0, 3);
  });

  readonly projectTiles = computed<ProjectTile[]>(() => {
    const projects = this.facade.projects().slice(0, 5);
    const layout = BENTO_LAYOUTS[projects.length] ?? [];
    return projects.map((item, index) => ({
      id: item.id,
      slug: item.slug,
      title: item.name,
      location: item.metadata,
      imageUrl: item.imageUrl ?? '/images/residencia-aura.jpg',
      imageAlt: item.imageAlt ?? item.name,
      gridClass: layout[index] ?? 'md:col-span-1',
      featured: index === 0,
    }));
  });

  readonly preFooterData = computed<PreFooterData>(() => {
    const cta = this.facade.cta();
    return {
      title: cta.copy.title,
      subtitle: cta.copy.description,
      cta: {
        label: cta.action.label,
        url: resolveHomeUrl(cta.action.url, '/contacto'),
      },
    };
  });

  constructor() {
    this.facade.load();
  }

  /** Reconoce el PDF de catálogo aún no cargado (ancla `#catalogo`) y lo oculta. */
  private normalizedUnitActions(
    actions: readonly HomeBusinessUnitActionView[],
  ): readonly HomeBusinessUnitActionView[] {
    return actions
      .map((action) => ({ ...action, url: resolveHomeUrl(action.url, '/isadecor') }))
      .filter((action) => action.url !== '#catalogo');
  }
}

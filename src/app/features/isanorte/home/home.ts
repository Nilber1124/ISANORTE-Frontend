import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SmoothDetails } from '../../../shared/directives/smooth-details.directive';
import { CommonModule } from '@angular/common';

import { Badge } from '../../../shared/components/badge/badge';
import { LocationMap } from '../../../shared/components/location-map/location-map';
import { Button } from '../../../shared/components/button/button';
import { CinematicTour } from '../../../shared/components/cinematic-tour/cinematic-tour';
import { ContactForm } from '../contact/contact-form/contact-form';
import { PublicContactFacade } from '../contact/public-contact.facade';
import { PublicSiteFacade } from '../../../layouts/public-layout/public-site.facade';
import { PublicBusinessUnitResource } from '../../../data/models/public-content/public-home.model';
import { PublicTrustStore } from '../../../data/services/public-trust.store';
import { HomeMotion } from './home-motion.directive';
import { HOME_RAIL, resolveHomeUrl, serviceIconPath } from './home-landing.data';
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
  imageUrl: string | null;
  imageAlt: string;
  /** Clases de rejilla (bento) según la cantidad de proyectos. */
  gridClass: string;
  featured: boolean;
}
export interface PreFooterData {
  title: string;
  subtitle: string;
  cta: { label: string; url: string } | null;
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

/** Tamaños de la rejilla bento según cuántos proyectos hay (máximo 4: el resto está en Proyectos). */
const BENTO_LAYOUTS: Record<number, readonly string[]> = {
  1: ['md:col-span-4 md:row-span-2'],
  2: ['md:col-span-2 md:row-span-2', 'md:col-span-2 md:row-span-2'],
  3: ['md:col-span-2 md:row-span-2', 'md:col-span-2', 'md:col-span-2'],
  4: ['md:col-span-2 md:row-span-2', 'md:col-span-2', 'md:col-span-1', 'md:col-span-1'],
};

@Component({
  imports: [
    LocationMap,
    SmoothDetails,
    CommonModule,
    Button,
    Badge,
    CinematicTour,
    ContactForm,
    HomeMotion,
  ],
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

  readonly trust = inject(PublicTrustStore);

  readonly rail = HOME_RAIL;
  readonly serviceIconPath = serviceIconPath;

  /** Pasos del proceso, garantías y ofertas de ISADECOR vienen de la base de datos. */
  readonly steps = computed(() =>
    this.trust.steps().map((step, index) => ({ id: `paso-${index}`, ...step })),
  );
  readonly trustPoints = computed(() => this.trust.heroGuarantees().map((item) => item.titulo));
  readonly isadecorOffer = computed(() => this.facade.featuredBusinessUnit()?.ofertas ?? []);
  readonly serviceOptions = computed(() =>
    this.facade.services().map((service) => ({ value: service.name, label: service.name })),
  );
  readonly responsePromise = computed(() => {
    const time = this.site?.company()?.tiempoRespuesta?.trim();
    return time ? `Te respondemos ${time}.` : null;
  });
  /** Cambia cuando llega contenido: el movimiento se reinicia para leer el DOM nuevo. */
  readonly motionKey = computed(
    () =>
      `${this.steps().length}-${this.facade.services().length}-${this.facade.projects().length}-` +
      `${this.trust.guarantees().length}-${this.trust.testimonials().length}-${this.trust.faqs().length}`,
  );

  readonly whatsappHref = computed(() => this.site?.whatsappHref() ?? null);
  readonly email = computed(() => this.site?.contactEmails()[0] ?? null);
  readonly phone = computed(() => this.site?.contactPhones()[0] ?? null);
  readonly phoneHref = computed(() => {
    const phone = this.phone();
    return phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null;
  });

  /** El mapa usa el punto elegido en el panel o, si no hay, la dirección de la empresa. */
  readonly officeAddress = computed(() => this.site?.fullAddress() ?? '');
  readonly showMap = computed(() => this.site?.hasMap() ?? false);
  readonly mapEmbedUrl = computed(() => this.site?.mapEmbedUrl() ?? '');
  readonly mapUrl = computed(() => this.site?.mapUrl() ?? '');

  readonly heroPrimary = computed(() => {
    const action = this.facade.heroActions()[0];
    return action ? { label: action.label, url: resolveHomeUrl(action.url, '/contacto') } : null;
  });
  readonly heroSecondary = computed(() => {
    const action = this.facade.heroActions()[1];
    return action ? { label: action.label, url: resolveHomeUrl(action.url, '/contacto') } : null;
  });

  readonly servicesDisplay = computed<ServicesDisplay | null>(() => {
    if (!this.facade.showServices()) return null;
    const action = this.facade.servicesAction();
    return {
      services: this.facade.services().map((service) => ({
        ...service,
        linkUrl: resolveHomeUrl(service.linkUrl, '/servicios'),
      })),
      header: this.facade.servicesHeader() ?? { eyebrow: '', title: '' },
      action: action ? { ...action, url: resolveHomeUrl(action.url, '/servicios') } : null,
    };
  });

  readonly projectsAction = computed(() => {
    const action = this.facade.projectsAction();
    return action ? { ...action, url: resolveHomeUrl(action.url, '/proyectos') } : null;
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
    const projects = this.facade.projects().slice(0, 4);
    const layout = BENTO_LAYOUTS[projects.length] ?? [];
    return projects.map((item, index) => ({
      id: item.id,
      slug: item.slug,
      title: item.name,
      location: item.metadata,
      imageUrl: item.imageUrl,
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
      cta: cta.action
        ? { label: cta.action.label, url: resolveHomeUrl(cta.action.url, '/contacto') }
        : null,
    };
  });

  constructor() {
    this.facade.load();
    this.trust.load();
  }

  /** Reconoce el PDF de catálogo aún no cargado (ancla `#catalogo`) y lo oculta. */
  private normalizedUnitActions(
    actions: readonly HomeBusinessUnitActionView[],
  ): readonly HomeBusinessUnitActionView[] {
    return actions
      .map((action) => ({
        ...action,
        url: resolveHomeUrl(action.url, '/isadecor'),
        // ISADECOR es otra tienda: siempre se abre en una pestaña nueva.
        target: action.target ?? ('_blank' as const),
      }))
      .filter((action) => action.url !== '#catalogo');
  }
}

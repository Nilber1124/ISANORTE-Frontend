import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { Carousel } from '../../../shared/components/carousel/carousel';
import { CinematicTour } from '../../../shared/components/cinematic-tour/cinematic-tour';
import { PublicBusinessUnitResource } from '../../../data/models/public-content/public-home.model';
import { HOME_BUSINESS_UNIT_FALLBACK } from './home-business-unit-fallback';
import { HOME_SERVICES_FALLBACK } from './home-services-fallback';
import { PublicHomeFacade } from './public-home.facade';
import { HomeBusinessUnitActionView } from './home-view.model';

export interface ProjectCard {
  id: string;
  title: string;
  location: string;
  bgImageUrl: string;
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

@Component({
  imports: [CommonModule, Button, Card, Badge, Carousel, CinematicTour],
  selector: 'app-isanorte-home',
  providers: [PublicHomeFacade],
  styleUrl: './home.css',
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  readonly facade = inject(PublicHomeFacade);
  /** TRANSITORIO: sólo se presenta tras un error real del GET de Home. */
  readonly servicesFallback = HOME_SERVICES_FALLBACK;
  /** TRANSITORIO: sólo se presenta tras un error real del GET de Home. */
  readonly businessUnitFallback = HOME_BUSINESS_UNIT_FALLBACK;

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
        actions: this.facade.businessUnitActions(),
      };
    }

    if (this.facade.error()) {
      return {
        header: this.businessUnitFallback.header,
        unit: this.businessUnitFallback.unit,
        background: this.businessUnitFallback.background,
        editorials: this.businessUnitFallback.editorials,
        actions: this.businessUnitFallback.actions,
      };
    }

    return null;
  });

  readonly projects: ProjectCard[] = [
    {
      id: 'p1',
      title: 'Residencia Aura',
      location: 'Valle de los Chillos, Quito - Proyecto 2024',
      bgImageUrl: '/images/residencia-aura.jpg',
    },
    {
      id: 'p2',
      title: 'Edificio Tech-Corporate',
      location: 'Sector Financiero, Quito - Proyecto 2023',
      bgImageUrl:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
    },
  ];

  readonly preFooterData: PreFooterData = {
    title: '¿Tienes un proyecto en mente?',
    subtitle:
      'Ofrecemos asesoría técnica integral sin costo para la estimación inicial de tu obra o acabados.',
    cta: { label: 'SOLICITAR ASESORÍA GRATUITA', url: '#contacto' },
  };

  constructor() {
    this.facade.load();
  }
}

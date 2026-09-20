import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Shared Components
import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { Carousel } from '../../../shared/components/carousel/carousel';
import { CinematicTour } from '../../../shared/components/cinematic-tour/cinematic-tour';
import { PublicHomeFacade } from './public-home.facade';

// Interfaces
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

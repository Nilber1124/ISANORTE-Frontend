import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Shared Components
import { PublicHomeSectionType } from '../../../data/models/public-content/public-home.model';
import { Alert } from '../../../shared/components/alert/alert';
import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { Carousel } from '../../../shared/components/carousel/carousel';
import { CinematicTour } from '../../../shared/components/cinematic-tour/cinematic-tour';
import { PublicHomeFacade } from './public-home.facade';
@Component({
  imports: [CommonModule, Alert, Button, Card, Badge, Carousel, CinematicTour],
  selector: 'app-isanorte-home',
  providers: [PublicHomeFacade],
  styleUrl: './home.css',
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  readonly facade = inject(PublicHomeFacade);
  readonly sectionType = PublicHomeSectionType;

  constructor() {
    this.facade.load();
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RevealStagger } from '../../../shared/components/reveal-stagger/reveal-stagger';

export interface ServiciosHeroData {
  eyebrow: string;
  title: string;
}

export interface ServicioItem {
  id: string;
  number: string;
  category: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  features: string[];
}

@Component({
  imports: [RevealStagger],
  selector: 'app-isanorte-services',
  styleUrl: './services.css',
  templateUrl: './services.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Services {
  readonly heroData: ServiciosHeroData = {
    eyebrow: 'PORTAFOLIO // LO QUE HACEMOS',
    title: 'Servicios técnicos especializados de diseño y construcción.',
  };

  readonly services: ServicioItem[] = [
    {
      id: 'construccion',
      number: '01',
      category: 'CONSTRUCCIÓN',
      title: 'Construcción Residencial & Comercial',
      description:
        'Ejecutamos obra civil de cualquier escala. Desde la cimentación estructural hasta la entrega de llave en mano de edificios corporativos y residencias de lujo.',
      imageUrl: '/images/servicios-construccion.jpg',
      imageAlt: 'Estructura de construcción residencial y comercial en obra',
      features: [
        'Estudios de suelo & cimentación',
        'Estructuras de concreto reforzado & acero',
        'Sistemas bioclimáticos avanzados',
      ],
    },
    {
      id: 'acabados',
      number: '02',
      category: 'ACABADOS',
      title: 'Acabados Premium & Revestimientos Técnicos',
      description:
        'Instalamos materiales de última tecnología para interiores y exteriores. Especialistas en piso SPC, mármol de alta densidad, revestimientos vinílicos y acústicos.',
      imageUrl: '/images/servicios-acabados.jpg',
      imageAlt: 'Acabados premium y revestimientos técnicos de interiores',
      features: [
        'Instalación técnica de mármol SPC',
        'Piso de madera ingeniería de alto tránsito',
        'Pintura y estucos de alta calidad arquitectónica',
      ],
    },
    {
      id: 'decoracion',
      number: '03',
      category: 'DECORACIÓN',
      title: 'Decoración & Diseño Interior Inmersivo',
      description:
        'Conceptualizamos atmósferas que reflejan sofisticación. Coordinación de ebanistería técnica, cielos rasos acústicos, y mobiliario personalizado de madera y metal.',
      imageUrl: '/images/servicios-decoracion.jpg',
      imageAlt: 'Diseño interior inmersivo con mobiliario personalizado',
      features: [
        'Sistemas de iluminación LED indirecta integrada',
        'Wall panels acústicos de importación',
        'Planos de distribución 3D fotorealistas',
      ],
    },
  ];
}

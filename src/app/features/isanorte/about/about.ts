import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

// Shared Components
import { RevealStagger } from '../../../shared/components/reveal-stagger/reveal-stagger';
// Interfaces (contrato de datos; las reutilizará también el formulario del admin)
export interface NosotrosHeroMetaItem {
  label: string;
  value: string;
}
export interface NosotrosHeroData {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  figureImageUrl: string;
  figureAlt: string;
}
export interface NosotrosStat {
  value: string;
  label: string;
}
export interface NosotrosIdentidadData {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  backgroundImageUrl: string;
  imageUrl: string;
  tags?: string[];
}
export interface NosotrosValueRow {
  id: string;
  title: string;
  description: string;
  tags?: string[];
}
export interface NosotrosValuesHeaderData {
  title: string;
  intro: string;
}

@Component({
  imports: [RevealStagger],
  selector: 'app-isanorte-about',
  styleUrl: './about.css',
  templateUrl: './about.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  readonly heroData: NosotrosHeroData = {
    eyebrow: 'NOSOTROS',
    title: '¿Qué hace que una obra dure más que la garantía?',
    paragraphs: [
      'Soluciones profesionales para construcción, obra civil y acabados.',
      'Transformamos espacios elevando el nivel de infraestructura, diseño, confort y estética, superando tus expectativas.',
    ],
    figureImageUrl: '/images/isadecor-nosotros-hero.png',
    figureAlt: 'Ingeniero de ISANORTE con casco de seguridad',
  };

  readonly stats: NosotrosStat[] = [
    { value: '+120', label: 'PROYECTOS ENTREGADOS' },
    { value: '+15', label: 'AÑOS DE EXPERIENCIA' },
    { value: '98%', label: 'CLIENTES SATISFECHOS' },
    { value: '100%', label: 'DISEÑO A MEDIDA' },
  ];

  // HOJA N.º 01 — IDENTIDAD (fondo de foto difuminada + panel de plano).
  readonly identidadData: NosotrosIdentidadData = {
    eyebrow: 'NOSOTROS — IDENTIDAD',
    title: 'Transformamos espacios\nen experiencias.',
    paragraphs: [
      'Soluciones profesionales para construcción, obra civil y acabados.',
      'Transformamos espacios elevando el nivel de infraestructura, diseño, confort y estética, superando tus expectativas.',
    ],
    backgroundImageUrl: '/images/isadecor-fondo.jpg',
    imageUrl: '/images/nosotros-hero.jpg',
    tags: ['ARQUITECTURA', 'CONSTRUCCIÓN', 'OBRA CIVIL', 'ACABADOS'],
  };

  readonly valuesHeader: NosotrosValuesHeaderData = {
    title: 'Por qué elegir ISANORTE',
    intro:
      'La misión define nuestra razón de ser, la visión nuestra meta y los valores la forma en que trabajamos.',
  };

  readonly values: NosotrosValueRow[] = [
    {
      id: 'mision',
      title: 'Misión',
      description:
        'Ejecutar cada proyecto constructivo y arquitectónico con precisión técnica, cumpliendo los plazos pactados y superando las expectativas de nuestros clientes.',
    },
    {
      id: 'vision',
      title: 'Visión',
      description:
        'Ser la constructora de referencia en Ecuador para quienes buscan una obra que combine solidez estructural con un diseño arquitectónico contemporáneo, sin concesiones en ninguna de las dos.',
    },
    {
      id: 'valores',
      title: 'Valores',
      description: 'Tres principios que no se negocian, sin importar el tamaño del proyecto.',
      tags: ['RIGUROSIDAD TÉCNICA', 'DISEÑO SIN LÍMITES', 'TRANSPARENCIA TOTAL'],
    },
  ];

  readonly openValue = signal<string | null>('mision');

  toggleValue(id: string): void {
    this.openValue.update((current) => (current === id ? null : id));
  }
}

import { NgTemplateOutlet } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, TemplateRef, contentChild, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
  PublicBusinessUnitResourceType,
  PublicHomeResponse,
  PublicHomeSectionType,
} from '../../../data/models/public-content/public-home.model';
import {
  Carousel,
  CarouselCardContext,
  CarouselItem,
  CarouselVariant,
} from '../../../shared/components/carousel/carousel';
import {
  CinematicScene,
  CinematicTour,
} from '../../../shared/components/cinematic-tour/cinematic-tour';
import { Home } from './home';

@Component({ selector: 'app-cinematic-tour', template: '' })
class CinematicTourStub {
  readonly scenes = input.required<readonly CinematicScene[]>();
}

@Component({
  selector: 'app-carousel',
  imports: [NgTemplateOutlet],
  template: `
    @for (item of items(); track item.id; let i = $index, total = $count) {
      <ng-container
        [ngTemplateOutlet]="cardTemplate()"
        [ngTemplateOutletContext]="{ $implicit: item, index: i, total }"
      />
    }
  `,
})
class CarouselStub {
  readonly items = input.required<readonly CarouselItem[]>();
  readonly variant = input<CarouselVariant>('coverflow');
  readonly autoPlayInterval = input(4000);
  readonly ariaLabel = input('Carrusel de contenido');
  readonly cardTemplate = contentChild.required<TemplateRef<CarouselCardContext>>('cardTemplate');
}

const backendHome: PublicHomeResponse = {
  secciones: [
    {
      tipo: PublicHomeSectionType.HERO,
      etiqueta: 'HERO API',
      titulo: 'Hero dinámico',
      subtitulo: 'Subtítulo API',
      contenido: null,
      imagenUrl: null,
      imagenAlt: null,
      textoBoton: null,
      enlaceBoton: null,
      orden: 3,
      escenas: [
        { imagenUrl: '/scene-b.jpg', alt: null, orden: 2 },
        { imagenUrl: '/scene-a.jpg', alt: null, orden: 0 },
      ],
      acciones: [
        { texto: 'Secundaria API', enlace: '#contacto', orden: 2 },
        { texto: 'Primaria API', enlace: '#cotizar', orden: 0 },
      ],
    },
    {
      tipo: PublicHomeSectionType.SERVICIOS,
      etiqueta: 'Servicios desde API',
      titulo: 'Soluciones dinámicas',
      subtitulo: null,
      contenido: null,
      imagenUrl: null,
      imagenAlt: null,
      textoBoton: null,
      enlaceBoton: null,
      orden: 0,
      escenas: [],
      acciones: [{ texto: 'VER SERVICIOS API', enlace: '/servicios', orden: 0 }],
    },
    {
      tipo: PublicHomeSectionType.UNIDAD_NEGOCIO,
      etiqueta: 'UNIDAD DESDE API',
      titulo: 'Espacios dinámicos API',
      subtitulo: null,
      contenido: null,
      imagenUrl: null,
      imagenAlt: null,
      textoBoton: null,
      enlaceBoton: null,
      orden: 2,
      escenas: [],
      acciones: [
        { texto: 'CONOCER UNIDAD API', enlace: '#isadecor', orden: 0 },
        { texto: 'CATÁLOGO LEGACY API', enlace: '#catalogo', orden: 1 },
      ],
    },
  ],
  servicios: [
    {
      nombre: 'Diseño API',
      slug: 'diseno-api',
      resumen: 'Resumen de diseño API',
      descripcion: 'Descripción completa que no debe renderizarse',
      icono: null,
      imagenUrl: '/service-design.jpg',
      imagenAlt: 'Interior diseñado por ISADECOR',
      etiqueta: null,
      orden: 2,
      beneficios: [],
    },
    {
      nombre: 'Construcción API',
      slug: 'construccion-api',
      resumen: 'Resumen de construcción API',
      descripcion: 'Descripción construcción',
      icono: null,
      imagenUrl: '/service-build.jpg',
      imagenAlt: null,
      etiqueta: null,
      orden: 0,
      beneficios: [],
    },
    {
      nombre: 'Acabados API',
      slug: 'acabados-api',
      resumen: 'Resumen de acabados API',
      descripcion: 'Descripción acabados',
      icono: null,
      imagenUrl: null,
      imagenAlt: null,
      etiqueta: null,
      orden: 1,
      beneficios: [],
    },
  ],
  proyectos: [],
  unidadDestacada: {
    nombre: 'Unidad API',
    slug: 'unidad-api',
    descripcion: 'Descripción dinámica de la unidad API.',
    icono: null,
    imagenUrl: '/unit-main-not-used.jpg',
    imagenAlt: 'Imagen principal no usada',
    orden: 0,
    recursos: [
      {
        tipo: PublicBusinessUnitResourceType.IMAGEN_EDITORIAL,
        url: '/editorial-bottom-2.jpg',
        alt: 'Editorial inferior dos',
        etiqueta: null,
        orden: 3,
      },
      {
        tipo: PublicBusinessUnitResourceType.IMAGEN_FONDO,
        url: '/unit-background.jpg',
        alt: null,
        etiqueta: null,
        orden: 0,
      },
      {
        tipo: PublicBusinessUnitResourceType.IMAGEN_EDITORIAL,
        url: '/editorial-top.jpg',
        alt: 'Editorial superior',
        etiqueta: null,
        orden: 1,
      },
      {
        tipo: PublicBusinessUnitResourceType.IMAGEN_EDITORIAL,
        url: '/editorial-bottom-1.jpg',
        alt: null,
        etiqueta: null,
        orden: 2,
      },
    ],
  },
};

describe('ISANORTE Home', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    })
      .overrideComponent(Home, {
        remove: { imports: [CinematicTour, Carousel] },
        add: { imports: [CinematicTourStub, CarouselStub] },
      })
      .compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('renders dynamic Hero and Services with the existing coverflow presentation', () => {
    const fixture = TestBed.createComponent(Home);
    http.expectOne('/api/publico/sitios/isanorte/home').flush(backendHome);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const serviceSection = element.querySelector('[data-home-services]') as HTMLElement;
    expect(element.querySelector('[data-home-hero]')?.textContent).toContain('Hero dinámico');
    expect(
      (
        fixture.debugElement.query(By.directive(CinematicTourStub))
          .componentInstance as CinematicTourStub
      )
        .scenes()
        .map((scene) => scene.imageUrl),
    ).toEqual(['/scene-a.jpg', '/scene-b.jpg']);
    expect(serviceSection.textContent).toContain('SERVICIOS DESDE API');
    expect(serviceSection.textContent).toContain('Soluciones dinámicas');
    expect(serviceSection.querySelector('app-button a')?.getAttribute('href')).toBe('/servicios');
    expect(
      Array.from(serviceSection.querySelectorAll('h3')).map((item) => item.textContent?.trim()),
    ).toEqual(['Construcción API', 'Acabados API', 'Diseño API']);
    expect(serviceSection.textContent).toContain('Resumen de construcción API');
    expect(serviceSection.textContent).not.toContain(
      'Descripción completa que no debe renderizarse',
    );
    expect(
      (serviceSection.querySelector('[role="img"]') as HTMLElement).getAttribute('aria-label'),
    ).toBe('Interior diseñado por ISADECOR');
    expect(serviceSection.innerHTML).toContain('/service-design.jpg');
    expect(serviceSection.innerHTML).toContain('background-image:');
    const carousels = fixture.debugElement.queryAll(By.directive(CarouselStub));
    const servicesCarousel = carousels[0].componentInstance as CarouselStub;
    expect(servicesCarousel.variant()).toBe('coverflow');
    expect(servicesCarousel.autoPlayInterval()).toBe(4500);
    expect(servicesCarousel.items().map((item) => item.id)).toEqual([
      'construccion-api',
      'acabados-api',
      'diseno-api',
    ]);
  });

  it('does not render Services for a valid empty backend response', () => {
    const fixture = TestBed.createComponent(Home);
    http.expectOne('/api/publico/sitios/isanorte/home').flush({ ...backendHome, servicios: [] });
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect((fixture.nativeElement as HTMLElement).querySelector('[data-home-services]')).toBeNull();
    expect(text).not.toContain('Construcción Obra Civil');
  });

  it('uses the isolated transitional Services fallback only after a failed request', () => {
    const fixture = TestBed.createComponent(Home);
    http
      .expectOne('/api/publico/sitios/isanorte/home')
      .flush({ message: 'offline' }, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();

    const section = (fixture.nativeElement as HTMLElement).querySelector('[data-home-services]');
    expect(section?.textContent).toContain('Construcción Obra Civil');
    expect(section?.textContent).toContain('VER TODOS LOS SERVICIOS');
  });

  it('renders the featured business unit from Home data in the existing editorial composition', () => {
    const fixture = TestBed.createComponent(Home);
    http.expectOne('/api/publico/sitios/isanorte/home').flush(backendHome);
    fixture.detectChanges();

    const section = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-home-business-unit]',
    ) as HTMLElement;
    expect(section.getAttribute('data-home-business-unit-name')).toBe('Unidad API');
    expect(section.textContent).toContain('UNIDAD DESDE API');
    expect(section.textContent).toContain('Espacios dinámicos API');
    expect(section.textContent).toContain('Descripción dinámica de la unidad API.');
    expect(section.textContent).toContain('CONOCER UNIDAD API');
    expect(section.textContent).toContain('CATÁLOGO LEGACY API');
    expect(section.querySelector('app-button a')?.getAttribute('href')).toBe('#isadecor');
    expect(
      Array.from(section.querySelectorAll('app-button a')).map((link) => link.getAttribute('href')),
    ).toEqual(['#isadecor', '#catalogo']);

    const background = section.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(background.style.backgroundImage).toContain('/unit-background.jpg');
    expect(background.style.backgroundImage).not.toContain('/unit-main-not-used.jpg');
    const editorialImages = Array.from(section.querySelectorAll('[role="img"]'));
    expect(editorialImages.map((image) => image.getAttribute('aria-label'))).toEqual([
      'Editorial superior',
      'Editorial inferior dos',
    ]);
    expect(section.innerHTML).toContain('/editorial-bottom-1.jpg');
    expect(section.innerHTML).toContain('/editorial-bottom-2.jpg');
  });

  it('hides the business-unit block after a successful null unit response', () => {
    const fixture = TestBed.createComponent(Home);
    http
      .expectOne('/api/publico/sitios/isanorte/home')
      .flush({ ...backendHome, unidadDestacada: null });
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[data-home-business-unit]')).toBeNull();
    expect(element.textContent).not.toContain('ISADECOR: Espacios que');
  });

  it('keeps a valid unit without resources while omitting all resource slots', () => {
    const fixture = TestBed.createComponent(Home);
    http.expectOne('/api/publico/sitios/isanorte/home').flush({
      ...backendHome,
      unidadDestacada: { ...backendHome.unidadDestacada!, recursos: [] },
    });
    fixture.detectChanges();

    const section = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-home-business-unit]',
    ) as HTMLElement;
    expect(section.textContent).toContain('Descripción dinámica de la unidad API.');
    expect(section.innerHTML).not.toContain('/images/isadecor-fondo.jpg');
    expect(section.innerHTML).not.toContain('/images/isadecor-top.jpg');
    expect(section.querySelectorAll('[role="img"]')).toHaveLength(0);
  });

  it('uses the isolated business-unit fallback only after the Home request fails', () => {
    const fixture = TestBed.createComponent(Home);
    http
      .expectOne('/api/publico/sitios/isanorte/home')
      .flush({ message: 'offline' }, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();

    const section = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-home-business-unit]',
    );
    expect(section?.textContent).toContain('ISADECOR: Espacios que');
    expect(section?.textContent).toContain('CONOCE ISADECOR');
  });

  it('keeps Trust Strip absent, Hero and Services dynamic, and remaining Home baseline static', () => {
    const fixture = TestBed.createComponent(Home);
    http.expectOne('/api/publico/sitios/isanorte/home').flush(backendHome);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('RESPALDADO POR PRIMERAS MARCAS');
    expect(text).toContain('Espacios dinámicos API');
    expect(text).toContain('Soluciones dinámicas');
    expect(text).toContain('Residencia Aura');
    expect(text).toContain('Edificio Tech-Corporate');
    expect(text).toContain('¿Tienes un proyecto en mente?');
    expect(text).not.toContain('CTA final desde PostgreSQL');
  });
});

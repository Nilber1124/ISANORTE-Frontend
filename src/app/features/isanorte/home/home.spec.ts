import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NgTemplateOutlet } from '@angular/common';
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
      tipo: PublicHomeSectionType.PROYECTOS,
      etiqueta: 'PROYECTOS DESDE POSTGRESQL',
      titulo: 'Obras destacadas API',
      subtitulo: null,
      contenido: null,
      imagenUrl: null,
      imagenAlt: null,
      textoBoton: null,
      enlaceBoton: null,
      orden: 3,
      escenas: [],
      acciones: [{ texto: 'VER PROYECTOS API', enlace: '#', orden: 0 }],
    },
    {
      tipo: PublicHomeSectionType.SERVICIOS,
      etiqueta: 'Servicios primero',
      titulo: 'No usar como Hero',
      subtitulo: null,
      contenido: null,
      imagenUrl: null,
      imagenAlt: null,
      textoBoton: null,
      enlaceBoton: null,
      orden: 0,
      escenas: [],
      acciones: [{ texto: 'VER SERVICIOS API', enlace: '#', orden: 0 }],
    },
    {
      tipo: PublicHomeSectionType.CTA,
      etiqueta: null,
      titulo: 'CTA final desde PostgreSQL',
      subtitulo: 'Subtítulo CTA que no usa este diseño',
      contenido: 'Descripción final entregada por el backend.',
      imagenUrl: '/cta-backend.jpg',
      imagenAlt: 'Imagen decorativa del CTA',
      textoBoton: null,
      enlaceBoton: null,
      orden: 4,
      escenas: [],
      acciones: [{ texto: 'CONTACTAR DESDE API', enlace: '#contacto', orden: 0 }],
    },
    {
      tipo: PublicHomeSectionType.HERO,
      etiqueta: 'HERO DESDE POSTGRESQL',
      titulo: 'Título dinámico',
      subtitulo: 'Subtítulo dinámico',
      contenido: null,
      imagenUrl: null,
      imagenAlt: null,
      textoBoton: null,
      enlaceBoton: null,
      orden: 7,
      escenas: [
        { imagenUrl: '/scene-b.jpg', alt: 'B', orden: 2 },
        { imagenUrl: '/scene-a.jpg', alt: null, orden: 0 },
      ],
      acciones: [
        { texto: 'Secundaria API', enlace: '#contacto', orden: 2 },
        { texto: 'Primaria API', enlace: '#cotizar', orden: 0 },
      ],
    },
    {
      tipo: PublicHomeSectionType.UNIDAD_NEGOCIO,
      etiqueta: 'UNIDAD EDITORIAL API',
      titulo: null,
      subtitulo: null,
      contenido: null,
      imagenUrl: null,
      imagenAlt: null,
      textoBoton: null,
      enlaceBoton: null,
      orden: 4,
      escenas: [],
      acciones: [
        { texto: 'Descargar catálogo (PDF)', enlace: '#catalogo', orden: 1 },
        { texto: 'CONOCER UNIDAD API', enlace: '#isadecor', orden: 0 },
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
  proyectos: [
    {
      nombre: 'Torre API',
      slug: 'torre-api',
      ubicacion: 'Centro financiero',
      fechaProyecto: 'Proyecto 2023',
      descripcion: 'Descripcion que la card no necesita',
      orden: 2,
      imagenes: [{ url: '/project-tower.jpg', alt: null, esPrincipal: false, orden: 0 }],
    },
    {
      nombre: 'Residencia API',
      slug: 'residencia-api',
      ubicacion: 'Valle API',
      fechaProyecto: '2026-05-10',
      descripcion: 'Otra descripcion que no se renderiza',
      orden: 0,
      imagenes: [
        { url: '/project-secondary.jpg', alt: 'Imagen secundaria', esPrincipal: false, orden: 0 },
        { url: '/project-main.jpg', alt: 'Residencia terminada', esPrincipal: true, orden: 1 },
      ],
    },
  ],
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

  it('loads during component creation, renders backend copy and feeds ordered scenes to the tour', () => {
    const fixture = TestBed.createComponent(Home);
    const request = http.expectOne('/api/publico/sitios/isanorte/home');
    expect(request.request.method).toBe('GET');
    request.flush(backendHome);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('HERO DESDE POSTGRESQL');
    expect(element.textContent).toContain('Título dinámico');

    const tour = fixture.debugElement.query(By.directive(CinematicTourStub))
      .componentInstance as CinematicTourStub;
    expect(tour.scenes().map((scene) => scene.imageUrl)).toEqual(['/scene-a.jpg', '/scene-b.jpg']);
  });

  it('renders the dynamic Services header, action and ordered cards in the existing carousel', () => {
    const fixture = TestBed.createComponent(Home);
    http.expectOne('/api/publico/sitios/isanorte/home').flush(backendHome);
    fixture.detectChanges();

    const section = (fixture.nativeElement as HTMLElement).querySelector('[data-home-services]');
    expect(section?.textContent).toContain('SERVICIOS PRIMERO');
    expect(section?.textContent).toContain('No usar como Hero');
    expect(section?.textContent).toContain('VER SERVICIOS API');
    expect(section?.querySelector('app-button a')?.getAttribute('href')).toBe('#');
    expect(section?.querySelector('app-carousel')).toBeTruthy();

    const names = Array.from(section?.querySelectorAll('h3') ?? []).map((item) =>
      item.textContent?.trim(),
    );
    expect(names).toEqual(['Construcción API', 'Acabados API', 'Diseño API']);
    expect(section?.textContent).toContain('Resumen de construcción API');
    expect(section?.textContent).not.toContain('Descripción completa que no debe renderizarse');

    const image = section?.querySelector('[role="img"]') as HTMLElement | null;
    expect(image?.getAttribute('aria-label')).toBe('Interior diseñado por ISADECOR');
    expect(image?.style.backgroundImage).toContain('/service-design.jpg');

    const carousel = fixture.debugElement.queryAll(By.directive(CarouselStub))[0]
      .componentInstance as CarouselStub;
    expect(carousel.variant()).toBe('coverflow');
    expect(carousel.autoPlayInterval()).toBe(4500);
    expect(carousel.items().map((item) => item.id)).toEqual([
      'construccion-api',
      'acabados-api',
      'diseno-api',
    ]);
  });

  it('hides the complete Services block after a successful empty response', () => {
    const fixture = TestBed.createComponent(Home);
    http.expectOne('/api/publico/sitios/isanorte/home').flush({ ...backendHome, servicios: [] });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('[data-home-services]')).toBeNull();
  });

  it('renders the featured business unit, ordered resources and slug-derived web routes', () => {
    const fixture = TestBed.createComponent(Home);
    http.expectOne('/api/publico/sitios/isanorte/home').flush(backendHome);
    fixture.detectChanges();

    const section = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-home-business-unit]',
    ) as HTMLElement | null;
    expect(section?.textContent).toContain('UNIDAD EDITORIAL API');
    expect(section?.textContent).toContain('Unidad API');
    expect(section?.textContent).toContain('Descripción dinámica de la unidad API.');
    expect(section?.textContent).toContain('CONOCER UNIDAD API');
    expect(section?.textContent).toContain('VER CATÁLOGO');
    expect(section?.textContent).not.toContain('Descargar catálogo');

    const background = section?.querySelector('[aria-hidden="true"]') as HTMLElement | null;
    expect(background?.style.backgroundImage).toContain('/unit-background.jpg');
    expect(background?.style.backgroundImage).not.toContain('/unit-main-not-used.jpg');

    const editorialImages = Array.from(section?.querySelectorAll('[role="img"]') ?? []);
    expect(editorialImages.map((image) => image.getAttribute('aria-label'))).toEqual([
      'Editorial superior',
      'Editorial inferior dos',
    ]);
    expect(section?.innerHTML).toContain('/editorial-bottom-1.jpg');

    const links = Array.from(section?.querySelectorAll('app-button a') ?? []);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/unidad-api',
      '/unidad-api/catalogo',
    ]);
    expect(links.some((link) => link.getAttribute('href') === '#isadecor')).toBe(false);
    expect(links.some((link) => link.getAttribute('href') === '#catalogo')).toBe(false);
  });

  it('keeps the web catalog CTA without a CATALOGO document resource', () => {
    const fixture = TestBed.createComponent(Home);
    http.expectOne('/api/publico/sitios/isanorte/home').flush(backendHome);
    fixture.detectChanges();

    const section = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-home-business-unit]',
    );
    expect(section?.querySelector('a[href="/unidad-api/catalogo"]')).toBeTruthy();
  });

  it('hides the business-unit block after a successful null featured unit', () => {
    const fixture = TestBed.createComponent(Home);
    http
      .expectOne('/api/publico/sitios/isanorte/home')
      .flush({ ...backendHome, unidadDestacada: null });
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[data-home-business-unit]'),
    ).toBeNull();
  });

  it('renders the dynamic Projects section and keeps the marquee presentation', () => {
    const fixture = TestBed.createComponent(Home);
    http.expectOne('/api/publico/sitios/isanorte/home').flush(backendHome);
    fixture.detectChanges();

    const section = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-home-projects]',
    ) as HTMLElement | null;
    expect(section?.textContent).toContain('PROYECTOS DESDE POSTGRESQL');
    expect(section?.textContent).toContain('Obras destacadas API');
    expect(section?.textContent).toContain('VER PROYECTOS API');
    expect(section?.querySelector('app-button a')?.getAttribute('href')).toBe('/proyectos');

    const names = Array.from(section?.querySelectorAll('h3') ?? []).map((item) =>
      item.textContent?.trim(),
    );
    expect(names).toEqual(['Residencia API', 'Torre API']);
    expect(section?.textContent).toContain('Valle API - 2026');
    expect(section?.textContent).toContain('Centro financiero - Proyecto 2023');
    expect(section?.textContent).not.toContain('Descripcion que la card no necesita');

    const image = section?.querySelector('[role="img"]') as HTMLElement | null;
    expect(image?.getAttribute('aria-label')).toBe('Residencia terminada');
    expect(image?.style.backgroundImage).toContain('/project-main.jpg');
    expect(section?.innerHTML).toContain('/project-tower.jpg');
    expect(section?.querySelector('app-card a')).toBeNull();

    const carousels = fixture.debugElement.queryAll(By.directive(CarouselStub));
    const projectsCarousel = carousels[1].componentInstance as CarouselStub;
    expect(projectsCarousel.variant()).toBe('marquee');
    expect(projectsCarousel.items().map((item) => item.id)).toEqual([
      'residencia-api',
      'torre-api',
    ]);
    expect(projectsCarousel.items()).toHaveLength(2);
  });

  it('hides the complete Projects block after a successful empty response', () => {
    const fixture = TestBed.createComponent(Home);
    http.expectOne('/api/publico/sitios/isanorte/home').flush({ ...backendHome, proyectos: [] });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('[data-home-projects]')).toBeNull();
  });

  it('renders Hero actions in backend order with the existing visual slots', () => {
    const fixture = TestBed.createComponent(Home);
    http.expectOne('/api/publico/sitios/isanorte/home').flush(backendHome);
    fixture.detectChanges();

    const links = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('section:first-of-type app-button a'),
    );
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Primaria API',
      'Secundaria API',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['#cotizar', '#contacto']);
  });

  it('renders backend CTA copy, decorative background and functional action', () => {
    const fixture = TestBed.createComponent(Home);
    http.expectOne('/api/publico/sitios/isanorte/home').flush(backendHome);
    fixture.detectChanges();

    const section = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-home-cta]',
    ) as HTMLElement | null;
    expect(section?.querySelector('h2')?.textContent).toContain('CTA final desde PostgreSQL');
    expect(section?.querySelector('p')?.textContent).toContain(
      'Descripción final entregada por el backend.',
    );
    expect(section?.textContent).not.toContain('Subtítulo CTA que no usa este diseño');

    const background = section?.querySelector('[aria-hidden="true"]') as HTMLElement | null;
    expect(background?.style.backgroundImage).toContain('/cta-backend.jpg');
    expect(background?.getAttribute('role')).toBeNull();
    expect(background?.getAttribute('aria-label')).toBeNull();

    const action = section?.querySelector('app-button a');
    expect(action?.textContent).toContain('CONTACTAR DESDE API');
    expect(action?.getAttribute('href')).toBe('/contacto');
    expect(section?.textContent).not.toContain('¿Tienes un proyecto en mente?');
  });

  it('hides the complete CTA after a successful response without a CTA section', () => {
    const fixture = TestBed.createComponent(Home);
    http.expectOne('/api/publico/sitios/isanorte/home').flush({
      ...backendHome,
      secciones: backendHome.secciones.filter(
        (section) => section.tipo !== PublicHomeSectionType.CTA,
      ),
    });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('[data-home-cta]')).toBeNull();
  });

  it('renders CTA content without inventing a button after a successful empty action list', () => {
    const fixture = TestBed.createComponent(Home);
    http.expectOne('/api/publico/sitios/isanorte/home').flush({
      ...backendHome,
      secciones: backendHome.secciones.map((section) =>
        section.tipo === PublicHomeSectionType.CTA
          ? { ...section, imagenUrl: null, acciones: [] }
          : section,
      ),
    });
    fixture.detectChanges();

    const section = (fixture.nativeElement as HTMLElement).querySelector('[data-home-cta]');
    expect(section?.textContent).toContain('CTA final desde PostgreSQL');
    expect(section?.querySelector('app-button')).toBeNull();
    const background = section?.querySelector('[aria-hidden="true"]') as HTMLElement | null;
    expect(background?.style.backgroundImage).toBe('');
  });

  it('uses the single transitional fallback when the public request fails', () => {
    const fixture = TestBed.createComponent(Home);
    http
      .expectOne('/api/publico/sitios/isanorte/home')
      .flush({ message: 'offline' }, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Transformamos espacios');
    expect(element.textContent).toContain('SOLICITAR COTIZACIÓN');
    expect(element.textContent).toContain('Construcción Obra Civil');
    expect(element.textContent).toContain('ISADECOR');
    expect(element.querySelector('a[href="/isadecor"]')).toBeTruthy();
    expect(element.querySelector('a[href="/isadecor/catalogo"]')).toBeTruthy();
    expect(element.textContent).toContain('Residencia Aura');
    expect(element.textContent).toContain('Edificio Tech-Corporate');
    expect(element.querySelector('[data-home-projects] a[href="/proyectos"]')).toBeTruthy();
    expect(element.querySelector('[data-home-cta]')?.textContent).toContain(
      '¿Tienes un proyecto en mente?',
    );
    expect(element.querySelector('[data-home-cta] a[href="/contacto"]')).toBeTruthy();
    const tour = fixture.debugElement.query(By.directive(CinematicTourStub))
      .componentInstance as CinematicTourStub;
    expect(tour.scenes()).toHaveLength(5);
  });

  it('keeps Trust Strip removed and does not duplicate the baseline CTA on success', () => {
    const fixture = TestBed.createComponent(Home);
    http.expectOne('/api/publico/sitios/isanorte/home').flush(backendHome);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('RESPALDADO POR PRIMERAS MARCAS');
    expect(text).not.toContain('Google');
    expect(text).toContain('CTA final desde PostgreSQL');
    expect(text).not.toContain('¿Tienes un proyecto en mente?');
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('[data-home-cta]')).toHaveLength(
      1,
    );
  });
});

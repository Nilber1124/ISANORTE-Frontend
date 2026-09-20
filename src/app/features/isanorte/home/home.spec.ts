import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
  PublicHomeResponse,
  PublicHomeSectionType,
} from '../../../data/models/public-content/public-home.model';
import {
  Carousel,
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

@Component({ selector: 'app-carousel', template: '<ng-content />' })
class CarouselStub {
  readonly items = input.required<readonly CarouselItem[]>();
  readonly variant = input<CarouselVariant>('coverflow');
  readonly autoPlayInterval = input(4000);
  readonly ariaLabel = input('Carrusel de contenido');
}

const backendHome: PublicHomeResponse = {
  secciones: [
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
      acciones: [],
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
  ],
  servicios: [],
  proyectos: [],
  unidadDestacada: null,
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
    expect(element.textContent).not.toContain('No usar como Hero');

    const tour = fixture.debugElement.query(By.directive(CinematicTourStub))
      .componentInstance as CinematicTourStub;
    expect(tour.scenes().map((scene) => scene.imageUrl)).toEqual(['/scene-a.jpg', '/scene-b.jpg']);
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

  it('uses the single transitional fallback when the public request fails', () => {
    const fixture = TestBed.createComponent(Home);
    http
      .expectOne('/api/publico/sitios/isanorte/home')
      .flush({ message: 'offline' }, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Transformamos espacios');
    expect(element.textContent).toContain('SOLICITAR COTIZACIÓN');
    const tour = fixture.debugElement.query(By.directive(CinematicTourStub))
      .componentInstance as CinematicTourStub;
    expect(tour.scenes()).toHaveLength(5);
  });

  it('removes Trust Strip while preserving the remaining static Home baseline', () => {
    const fixture = TestBed.createComponent(Home);
    http.expectOne('/api/publico/sitios/isanorte/home').flush(backendHome);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('RESPALDADO POR PRIMERAS MARCAS');
    expect(text).not.toContain('Google');
    expect(component.services.map((service) => service.title)).toEqual([
      'Construcción Obra Civil',
      'Acabados & Revestimientos',
      'Diseño & Interiorismo',
    ]);
    expect(component.highlightData.title).toBe('ISADECOR: Espacios que\ninspiran.');
    expect(component.projects.map((project) => project.title)).toEqual([
      'Residencia Aura',
      'Edificio Tech-Corporate',
    ]);
    expect(component.preFooterData.title).toBe('¿Tienes un proyecto en mente?');
  });
});

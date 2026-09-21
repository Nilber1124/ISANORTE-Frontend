import { Component, computed, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  PublicPageContent,
  PublicPageType,
  PublicService,
} from '../../../data/models/public-content/public-page.model';
import { Alert } from '../../../shared/components/alert/alert';
import { PublicServicesFacade } from './public-services.facade';
import { Services } from './services';

@Component({ selector: 'app-reveal-stagger', template: '<ng-content />' })
class RevealStaggerStub {
  readonly stagger = input(0);
  readonly duration = input(0);
  readonly ease = input('');
  readonly trigger = input('load');
}

class PublicServicesFacadeStub {
  readonly content = signal<PublicPageContent | null>({
    pagina: PublicPageType.SERVICIOS,
    eyebrow: 'EYEBROW API',
    titulo: 'Título API',
    introduccion: 'Introducción API no usada por el layout base',
    descripcion: 'Descripción editorial no usada por el layout base',
    imagenUrl: '/editorial-api.jpg',
    imagenAlt: 'Editorial API',
    imagenFondoUrl: '/fondo-api.jpg',
    tags: [],
  });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly services = signal<readonly PublicService[]>([
    {
      nombre: 'Servicio API cero',
      slug: 'servicio-api-cero',
      etiqueta: 'ETIQUETA API',
      resumen: 'Resumen API',
      descripcion: 'Descripción API cero',
      imagenUrl: '/servicio-cero.jpg',
      imagenAlt: 'Alt API cero',
      orden: 0,
      beneficios: [{ texto: 'Beneficio API cero', orden: 0 }],
    },
    {
      nombre: 'Servicio API sin imagen',
      slug: 'servicio-api-sin-imagen',
      etiqueta: null,
      resumen: null,
      descripcion: 'Descripción API sin imagen',
      imagenUrl: null,
      imagenAlt: null,
      orden: 1,
      beneficios: [],
    },
  ]);
  readonly showServices = computed(() => this.services().length > 0);

  load(): void {}
}

describe('Services', () => {
  let facade: PublicServicesFacadeStub;

  beforeEach(async () => {
    facade = new PublicServicesFacadeStub();
    await TestBed.configureTestingModule({ imports: [Services] })
      .overrideComponent(Services, {
        set: {
          imports: [Alert, RevealStaggerStub],
          providers: [{ provide: PublicServicesFacade, useValue: facade }],
        },
      })
      .compileComponents();
  });

  it('renders the public catalogue without relying on Home services', () => {
    const fixture = TestBed.createComponent(Services);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const cards = element.querySelectorAll('[data-service-slug]');

    expect(element.querySelector('h1')?.textContent).toContain('Título API');
    expect(cards.length).toBe(2);
    expect(cards[0].getAttribute('data-service-slug')).toBe('servicio-api-cero');
    expect(cards[0].textContent).toContain('ETIQUETA API');
    expect(cards[0].textContent).toContain('Descripción API cero');
    expect(cards[0].textContent).toContain('Beneficio API cero');
    expect(cards[0].querySelector('img')?.getAttribute('alt')).toBe('Alt API cero');
    expect(cards[1].querySelector('img')).toBeNull();
    expect(cards[1].querySelector('ul')).toBeNull();
    expect(cards[0].getAttribute('data-reveal-order')).toBe('0');
    expect(cards[1].getAttribute('data-reveal-order')).toBe('1');
  });

  it('supports an empty catalogue without restoring services baseline', () => {
    facade.services.set([]);
    const fixture = TestBed.createComponent(Services);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Título API');
    expect(fixture.nativeElement.querySelector('[data-services-list]')).toBeNull();
  });

  it('renders neutral loading and error states without services content', () => {
    facade.loading.set(true);
    const fixture = TestBed.createComponent(Services);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-services-loading]')).toBeTruthy();

    facade.loading.set(false);
    facade.error.set('Error API');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-services-error]')?.textContent).toContain(
      'Error API',
    );
    expect(fixture.nativeElement.querySelector('[data-services-list]')).toBeNull();
  });
});

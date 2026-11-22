import { Component, computed, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  PublicPageContent,
  PublicPageType,
  PublicService,
} from '../../../data/models/public-content/public-page.model';
import { Alert } from '../../../shared/components/alert/alert';
import { Button } from '../../../shared/components/button/button';
import { CtaBand } from '../../../shared/components/cta-band/cta-band';
import { PageHeader } from '../../../shared/components/page-header/page-header';
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
      id: 'svc-39',
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
      id: 'svc-50',
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
          imports: [Alert, Button, CtaBand, PageHeader, RevealStaggerStub],
          providers: [{ provide: PublicServicesFacade, useValue: facade }],
        },
      })
      .compileComponents();
  });

  it('offers a quote button per service and a closing contact band', () => {
    const fixture = TestBed.createComponent(Services);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const buttons = element.querySelectorAll('[data-service-slug] app-button a');

    expect(buttons).toHaveLength(2);
    expect(buttons[0].textContent?.trim()).toBe('Cotizar este servicio');
    // Sin número de WhatsApp cargado, cotizar lleva a la página de contacto.
    expect(buttons[0].getAttribute('href')).toBe('/contacto');
    expect(element.querySelector('app-cta-band')).toBeTruthy();
  });

  it('keeps the quick navigation inside the Services route', () => {
    facade.services.update((services) => [
      ...services,
      ...services.map((s) => ({ ...s, slug: `${s.slug}-b` })),
    ]);
    const fixture = TestBed.createComponent(Services);
    fixture.detectChanges();
    const links = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('[data-services-nav] a'),
    ).map((link) => link.getAttribute('href'));

    expect(links.every((href) => href?.startsWith('/servicios#servicio-'))).toBe(true);
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

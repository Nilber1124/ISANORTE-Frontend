import { Component, computed, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  PublicCompanyAbout,
  PublicPageContent,
  PublicPageSeo,
  PublicPageType,
} from '../../../data/models/public-content/public-page.model';
import { Alert } from '../../../shared/components/alert/alert';
import { About } from './about';
import { AboutValueView, PublicAboutFacade } from './public-about.facade';

@Component({ selector: 'app-reveal-stagger', template: '<ng-content />' })
class RevealStaggerStub {
  readonly stagger = input(0);
  readonly duration = input(0);
  readonly ease = input('');
  readonly trigger = input('load');
}

class PublicAboutFacadeStub {
  readonly content = signal<PublicPageContent | null>({
    pagina: PublicPageType.NOSOTROS,
    eyebrow: 'EYEBROW DESDE API',
    titulo: 'Título desde API',
    introduccion: 'Introducción desde API',
    descripcion: 'Descripción desde API',
    imagenUrl: '/imagen-api.jpg',
    imagenAlt: 'Alt desde API',
    imagenFondoUrl: '/fondo-api.jpg',
    tags: ['TAG API UNO', 'TAG API DOS'],
  });
  readonly company = signal<PublicCompanyAbout | null>({
    mision: 'Misión desde API',
    vision: 'Visión desde API',
    valores: 'Valores desde API',
    estadisticas: [
      { valor: 0, prefijo: null, sufijo: null, etiqueta: 'CERO API', orden: 0 },
      { valor: 98, prefijo: null, sufijo: '%', etiqueta: 'PORCENTAJE API', orden: 1 },
    ],
  });
  readonly seo = signal<PublicPageSeo | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly tags = computed(() => this.content()?.tags ?? []);
  readonly statistics = computed(() => this.company()?.estadisticas ?? []);
  readonly values = computed<readonly AboutValueView[]>(() => {
    const company = this.company();
    if (company === null) return [];
    return [
      ['mision', 'Misión', company.mision],
      ['vision', 'Visión', company.vision],
      ['valores', 'Valores', company.valores],
    ].flatMap(([id, label, description]) =>
      typeof description === 'string' && description.trim()
        ? [{ id: id as AboutValueView['id'], label: label as AboutValueView['label'], description }]
        : [],
    );
  });
  readonly showStatistics = computed(() => this.statistics().length > 0);
  readonly showValues = computed(() => this.values().length > 0);

  load(): void {}
}

describe('About', () => {
  let facade: PublicAboutFacadeStub;

  beforeEach(async () => {
    facade = new PublicAboutFacadeStub();
    await TestBed.configureTestingModule({ imports: [About] })
      .overrideComponent(About, {
        set: {
          imports: [Alert, RevealStaggerStub],
          providers: [{ provide: PublicAboutFacade, useValue: facade }],
        },
      })
      .compileComponents();
  });

  it('renders exclusively the editorial and corporate data received from the backend', () => {
    const fixture = TestBed.createComponent(About);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Título desde API');
    expect(element.textContent).toContain('Introducción desde API');
    expect(element.textContent).toContain('Descripción desde API');
    expect(element.querySelector('[data-about-tags]')?.textContent).toContain('TAG API UNO');
    expect(element.querySelector('.sheet1-panel__photo')?.getAttribute('aria-label')).toBe(
      'Alt desde API',
    );
    expect(element.querySelector('[data-about-statistics]')?.textContent).toContain('0');
    expect(element.querySelector('[data-about-statistics]')?.textContent).toContain('98%');
    expect(element.querySelector('[data-about-values]')?.textContent).toContain('Misión desde API');
    expect(element.querySelector('[data-about-values]')?.textContent).toContain('Visión desde API');
    expect(element.querySelector('[data-about-values]')?.textContent).toContain(
      'Valores desde API',
    );
  });

  it('hides empty dynamic blocks and keeps the accordion interaction', () => {
    facade.content.update((content) =>
      content ? { ...content, tags: [], imagenUrl: null } : content,
    );
    facade.company.set({ mision: '  ', vision: 'Visión API', valores: null, estadisticas: [] });
    const fixture = TestBed.createComponent(About);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('[data-about-tags]')).toBeNull();
    expect(element.querySelector('[data-about-statistics]')).toBeNull();
    expect(element.querySelector('.sheet1-panel__photo')).toBeNull();
    expect(element.textContent).not.toContain('Misión desde API');
    expect(element.textContent).toContain('Visión API');

    const button = element.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-expanded')).toBe('false');
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('true');

    facade.company.set(null);
    fixture.detectChanges();
    expect(element.querySelector('[data-about-statistics]')).toBeNull();
    expect(element.querySelector('[data-about-values]')).toBeNull();
    expect(element.querySelector('h1')?.textContent).toContain('Título desde API');
  });

  it('renders neutral loading and error states without baseline content', () => {
    facade.loading.set(true);
    const fixture = TestBed.createComponent(About);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-about-loading]')).toBeTruthy();

    facade.loading.set(false);
    facade.error.set('Error API');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-about-error]')?.textContent).toContain(
      'Error API',
    );
    expect(fixture.nativeElement.querySelector('h1')).toBeNull();
  });
});

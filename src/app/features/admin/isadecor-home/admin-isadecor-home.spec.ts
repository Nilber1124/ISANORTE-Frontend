import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { AdminHomeReviews } from '../home-reviews/admin-home-reviews';
import { AdminSiteContent } from '../site-content/admin-site-content';
import { AdminIsadecorHome, ISADECOR_HOME_SECTIONS } from './admin-isadecor-home';

@Component({ selector: 'app-admin-site-content', template: '<p data-stub-site-content>{{ entityKey() }}</p>' })
class SiteContentStub {
  readonly entityKey = input<string>('');
  readonly embedded = input(false);
}
@Component({ selector: 'app-admin-home-reviews', template: '<p data-stub-reviews></p>' })
class ReviewsStub {
  readonly embedded = input(false);
}

describe('AdminIsadecorHome', () => {
  async function open(url: string) {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'admin/home-isadecor', component: AdminIsadecorHome }])],
    }).overrideComponent(AdminIsadecorHome, {
      remove: { imports: [AdminSiteContent, AdminHomeReviews] },
      add: { imports: [SiteContentStub, ReviewsStub] },
    });
    const harness = await RouterTestingHarness.create(url);
    return { harness, el: harness.fixture.nativeElement as HTMLElement };
  }
  const headers = (el: HTMLElement) => Array.from(el.querySelectorAll('[data-isadecor-home-sections] h2 button')) as HTMLButtonElement[];

  it('lists the eight sections of the store Home, all closed and without loading any editor', async () => {
    const { el } = await open('/admin/home-isadecor');
    expect(headers(el).map((b) => b.querySelector('.text-heading-4')?.textContent?.trim())).toEqual([
      'Hero de la Home',
      'Cinta de avisos',
      'Promociones',
      'Campaña',
      'Secciones de productos',
      'Bloque de servicio',
      'Reseñas del Home',
      'Videos de redes',
    ]);
    expect(headers(el).every((b) => b.getAttribute('aria-expanded') === 'false')).toBe(true);
    expect(el.querySelector('[data-stub-site-content]')).toBeNull();
    expect(el.querySelector('h1')?.textContent).toContain('Home de ISADECOR');
  });

  it('opens a section on click and loads only its editor', async () => {
    const { harness, el } = await open('/admin/home-isadecor');
    headers(el)[1].click();
    harness.detectChanges();
    expect(headers(el)[1].getAttribute('aria-expanded')).toBe('true');
    expect(Array.from(el.querySelectorAll('[data-stub-site-content]')).map((e) => e.textContent?.trim())).toEqual(['isadecor-cinta']);
    // Volver a pulsarla la cierra.
    headers(el)[1].click();
    harness.detectChanges();
    expect(el.querySelector('[data-stub-site-content]')).toBeNull();
  });

  it('opens the requested section from ?seccion=; the service block shows its two screens', async () => {
    const { el } = await open('/admin/home-isadecor?seccion=servicio');
    expect(headers(el)[5].getAttribute('aria-expanded')).toBe('true');
    expect(Array.from(el.querySelectorAll('[data-stub-site-content]')).map((e) => e.textContent?.trim())).toEqual([
      'isadecor-servicios',
      'isadecor-servicio-puntos',
    ]);
  });

  it('the reviews section uses its own screen', async () => {
    const { el } = await open('/admin/home-isadecor?seccion=resenas');
    expect(el.querySelector('[data-stub-reviews]')).toBeTruthy();
    expect(el.querySelector('[data-stub-site-content]')).toBeNull();
    expect(ISADECOR_HOME_SECTIONS.map((s) => s.id)).toContain('resenas');
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { API_BASE_URL } from '../../../core/config/api.config';
import { AdminWebContent, WEB_CONTENT_KEYS } from './admin-web-content';

describe('AdminWebContent', () => {
  let http: HttpTestingController;

  function create() {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '' }],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(AdminWebContent);
    fixture.detectChanges();
    return fixture;
  }
  afterEach(() => http.verify());

  it('shows one card per catalog linking to its screen, with its count and hidden items', () => {
    const fixture = create();
    const replies: Record<string, unknown[]> = {
      '/api/faqs': [{ activo: true }, { activo: true }, { activo: false }],
      '/api/miembros': [{ activo: true }],
    };
    for (const request of http.match(() => true)) {
      request.flush(replies[request.request.url] ?? []);
    }
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const links = Array.from(el.querySelectorAll('[data-web-content-cards] a')).map((a) => a.getAttribute('href'));
    expect(links).toEqual(WEB_CONTENT_KEYS.map((key) => `/admin/sitio/${key}`));
    expect(links).not.toContain('/admin/sitio/politicas');
    expect(el.textContent).toContain('3 elementos · 1 oculto');
    expect(el.querySelector('h1')?.textContent).toContain('Contenido de la web');
  });

  it('keeps the cards usable when a count cannot be loaded', () => {
    const fixture = create();
    for (const request of http.match(() => true)) request.flush('error', { status: 500, statusText: 'Error' });
    fixture.detectChanges();
    const counts = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('[data-web-content-count]')).map((e) => e.textContent?.trim());
    expect(counts).toHaveLength(WEB_CONTENT_KEYS.length);
    expect(counts.every((text) => text === '—')).toBe(true);
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { API_BASE_URL } from '../../../core/config/api.config';
import { PublicSiteFacade } from '../../../layouts/public-layout/public-site.facade';
import { Community } from './community';
import { pickCommunityNetworks } from './community-networks';

const URL = '/api/publico/sitios/isanorte/unidades/isadecor/comunidad';

describe('Community', () => {
  let http: HttpTestingController;

  function create() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '' },
        {
          provide: PublicSiteFacade,
          useValue: {
            presentableSocialNetworks: signal([
              {
                nombre: 'Instagram',
                url: 'https://instagram.com/isadecor',
                icono: 'instagram',
                orden: 0,
              },
            ]),
          },
        },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(Community);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => http.verify());

  it('loads and shows the videos', async () => {
    const fixture = create();
    await fixture.whenStable();
    http
      .expectOne(URL)
      .flush([
        {
          red: 'INSTAGRAM',
          url: 'https://www.instagram.com/reel/A1/',
          titulo: 'Instalación',
          miniaturaUrl: null,
        },
      ]);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Instalación');
    expect(text).toContain('Instagram');
  });

  it('shows a friendly message when there are no videos yet', async () => {
    const fixture = create();
    await fixture.whenStable();
    http.expectOne(URL).flush([]);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Pronto compartiremos');
  });

  it('shows an error with retry when loading fails', async () => {
    const fixture = create();
    await fixture.whenStable();
    http.expectOne(URL).flush('x', { status: 500, statusText: 'Error' });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No pudimos cargar');
  });

  it('keeps Facebook, Instagram and TikTok from the company networks', () => {
    const picked = pickCommunityNetworks([
      { nombre: 'Facebook', url: 'https://f', icono: 'facebook' },
      { nombre: 'LinkedIn', url: 'https://l', icono: 'linkedin' },
      { nombre: 'TikTok', url: 'https://t', icono: null },
      { nombre: 'ig', url: 'https://i', icono: null },
    ]);

    expect(picked.map((n) => n.kind)).toEqual(['facebook', 'tiktok', 'instagram']);
  });
});

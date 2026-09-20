import { HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PublicPageType } from '../../../data/models/content/page-content.model';
import { PageContentApiService } from '../../../data/services/page-content-api.service';
import { PageSeoApiService } from '../../../data/services/page-seo-api.service';
import { SiteConfigApiService } from '../../../data/services/site-config-api.service';
import { BusinessUnitApiService } from '../../../data/services/business-unit-api.service';
import { AdminContentFacade } from './admin-content.facade';

const content = {
  id: 'content-1',
  configuracionSitioId: 'site-1',
  pagina: PublicPageType.NOSOTROS,
  activo: true,
  tags: ['Uno'],
  fechaCreacion: '',
  fechaActualizacion: '',
};
class ContentApiStub {
  getAll = () => of([content]);
  create = () => of(content);
  update = () => of({ ...content, activo: false });
}
class SeoApiStub {
  getAll = () => of([]);
  create = () => throwError(() => new HttpErrorResponse({ status: 409 }));
  update = this.create;
}
class ConfigApiStub {
  getAll = () => of([]);
}
class UnitApiStub {
  getAll = () => of([]);
}

describe('AdminContentFacade', () => {
  let facade: AdminContentFacade;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminContentFacade,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: PageContentApiService, useClass: ContentApiStub },
        { provide: PageSeoApiService, useClass: SeoApiStub },
        { provide: SiteConfigApiService, useClass: ConfigApiStub },
        { provide: BusinessUnitApiService, useClass: UnitApiStub },
      ],
    });
    facade = TestBed.inject(AdminContentFacade);
  });
  it('loads editorial content and updates facade state after save', () => {
    facade.load();
    expect(facade.contents()).toEqual([content]);
    facade.saveContent({ activo: false, tags: [] }, content);
    expect(facade.contents()[0].activo).toBe(false);
    expect(facade.success()).toContain('actualizado');
  });
  it('maps SEO duplicate conflicts without exposing backend details', () => {
    facade.saveSeo({
      configuracionSitioId: 'site-1',
      tipoPagina: 'HOME' as never,
      title: 'Home',
      description: 'Home',
      robots: 'INDEX_FOLLOW' as never,
    });
    expect(facade.error()).toContain('Ya existe');
    expect(facade.saving()).toBe(false);
  });
});

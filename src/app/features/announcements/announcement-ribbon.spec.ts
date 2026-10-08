import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AnnouncementResponse } from '../../data/models/announcement/announcement.model';
import { AnnouncementRibbonFacade } from './announcement-ribbon.facade';
import { AnnouncementRibbon } from './announcement-ribbon';

const announcement: AnnouncementResponse = {
  id: 'announcement-1',
  titulo: 'Cotización gratuita',
  descripcionResumida: 'Agenda una visita técnica.',
  contenidoDetallado: 'Contenido completo',
  condiciones: null,
  imagenUrl: '/images/casa-lujo.jpg',
  etiqueta: 'Promoción',
  destino: 'ISANORTE',
  tipoAccion: 'RUTA_INTERNA',
  destinoAccion: '/contacto',
  textoBoton: 'Contactar',
  fechaInicio: null,
  fechaFin: null,
  activo: true,
  orden: 0,
  fechaCreacion: '2026-10-07T10:00:00',
  fechaActualizacion: '2026-10-07T10:00:00',
};

class FacadeStub {
  readonly announcements = signal<readonly AnnouncementResponse[]>([announcement]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  load(): void { }
}

describe('AnnouncementRibbon', () => {
  let fixture: ComponentFixture<AnnouncementRibbon>;
  let facade: FacadeStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnouncementRibbon],
      providers: [provideRouter([])],
    })
      .overrideComponent(AnnouncementRibbon, {
        set: { providers: [{ provide: AnnouncementRibbonFacade, useClass: FacadeStub }] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(AnnouncementRibbon);
    fixture.componentRef.setInput('destination', 'ISANORTE');
    facade = fixture.debugElement.injector.get(AnnouncementRibbonFacade) as unknown as FacadeStub;
    fixture.detectChanges();
  });

  it('shows the real count and starts closed', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.announcement-ribbon__badge')?.textContent?.trim()).toBe('1');
    expect(element.querySelector('.announcement-ribbon')?.classList.contains('is-open')).toBe(
      false,
    );
  });

  it('hides the complete ribbon when there are no public announcements', () => {
    facade.announcements.set([]);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.announcement-ribbon')).toBeNull();
  });

  it('opens from the vertical tab', () => {
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.announcement-ribbon__tab')
      ?.click();
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('.announcement-ribbon')
        ?.classList.contains('is-open'),
    ).toBe(true);
  });
});

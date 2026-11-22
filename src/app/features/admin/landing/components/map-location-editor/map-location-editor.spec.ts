import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { MapLocationEditor } from './map-location-editor';

const company = {
  id: 'e1', razonSocial: 'ISANORTE SAC', nombreComercial: 'ISANORTE', ruc: '1', direccion: 'Jr. Amazonas 450', ciudad: 'Cajamarca',
  telefono: null, telefonoSecundario: null, email: null, emailVentas: null, whatsapp: null, horarioAtencion: null, anioFundacion: 2012,
  zonaCobertura: 'Cajamarca', tiempoRespuesta: null, latitud: null, longitud: null, mision: 'm', vision: 'v', valores: 'a | b',
  resumenNosotros: null, redesSociales: [{ id: 'r1' }],
};

describe('MapLocationEditor', () => {
  it('saves the chosen point and address keeping the rest of the company and without touching its social networks', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '' }],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(MapLocationEditor);
    http.expectOne('/api/empresa').flush([company]);
    fixture.detectChanges();

    const c = fixture.componentInstance as unknown as {
      latitud: { set(v: number | null): void };
      longitud: { set(v: number | null): void };
      direccion: { set(v: string): void };
      dirty(): boolean;
      save(): void;
    };
    expect(c.dirty()).toBe(false);
    c.latitud.set(-7.1638);
    c.longitud.set(-78.5003);
    c.direccion.set('  Jr. Amazonas 460  ');
    expect(c.dirty()).toBe(true);
    c.save();

    const request = http.expectOne('/api/empresa/e1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toMatchObject({ latitud: -7.1638, longitud: -78.5003, direccion: 'Jr. Amazonas 460', mision: 'm', anioFundacion: 2012 });
    expect(request.request.body.redesSociales).toBeUndefined();
    request.flush({ ...company, latitud: -7.1638, longitud: -78.5003 });
    http.verify();
  });
});

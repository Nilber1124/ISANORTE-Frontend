import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../config/api.config';
import { ClienteAuthResponse } from '../../data/models/cliente/cliente.model';
import { ClienteAuthService } from './cliente-auth.service';
import { clienteAuthInterceptor } from './cliente-auth.interceptor';
import { conSesionCliente } from './cliente-session.context';

const cliente = {
  id: '7f0c2b1e-0000-4000-8000-000000000001',
  nombre: 'Ana',
  apellido: 'Quispe',
  email: 'ana@example.com',
  telefono: null,
  fechaCreacion: '2026-10-06T10:00:00',
};

function jwtConExpiracion(exp: number): string {
  const encode = (value: object) => btoa(JSON.stringify(value));
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: cliente.id, exp })}.firma`;
}

function respuesta(token: string): ClienteAuthResponse {
  return { token, tipo: 'Bearer', expiracion: '2099-01-01T00:00:00Z', cliente };
}

describe('ClienteAuthService', () => {
  let service: ClienteAuthService;
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        { provide: API_BASE_URL, useValue: 'http://api.test' },
        provideHttpClient(withInterceptors([clienteAuthInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ClienteAuthService);
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
    localStorage.clear();
  });

  it('guarda la sesión tras iniciar sesión y la limpia al cerrarla', () => {
    const token = jwtConExpiracion(Math.floor(Date.now() / 1000) + 3600);

    service.login({ email: 'ana@example.com', password: 'claveSegura123' }).subscribe();
    controller.expectOne('http://api.test/api/publico/cuenta/login').flush(respuesta(token));

    expect(service.authenticated()).toBe(true);
    expect(service.cliente()?.nombre).toBe('Ana');
    expect(localStorage.getItem('isanorte.cliente.token')).toBe(token);

    service.logout();

    expect(service.authenticated()).toBe(false);
    expect(localStorage.getItem('isanorte.cliente.token')).toBeNull();
  });

  it('descarta un token expirado y cierra la sesión local', () => {
    const expirado = jwtConExpiracion(Math.floor(Date.now() / 1000) - 60);
    localStorage.setItem('isanorte.cliente.token', expirado);
    localStorage.setItem('isanorte.cliente.perfil', JSON.stringify(cliente));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: API_BASE_URL, useValue: 'http://api.test' },
        provideHttpClient(withInterceptors([clienteAuthInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    const recargado = TestBed.inject(ClienteAuthService);

    expect(recargado.token()).toBeNull();
    expect(recargado.authenticated()).toBe(false);
  });

  it('adjunta el token solo a las peticiones marcadas con sesión de cliente', () => {
    const token = jwtConExpiracion(Math.floor(Date.now() / 1000) + 3600);
    service.login({ email: 'ana@example.com', password: 'claveSegura123' }).subscribe();
    controller.expectOne('http://api.test/api/publico/cuenta/login').flush(respuesta(token));

    http.get('http://api.test/api/publico/sitios/isanorte/home').subscribe();
    const publica = controller.expectOne('http://api.test/api/publico/sitios/isanorte/home');
    expect(publica.request.headers.has('Authorization')).toBe(false);
    publica.flush({});

    http.get('http://api.test/api/publico/cuenta/cotizaciones', { context: conSesionCliente() }).subscribe();
    const protegida = controller.expectOne('http://api.test/api/publico/cuenta/cotizaciones');
    expect(protegida.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    protegida.flush([]);
  });
});

import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import {
  ClienteAuthResponse,
  ClienteLoginRequest,
  ClienteRegistroRequest,
  ClienteResponse,
} from '../../data/models/cliente/cliente.model';
import { ClienteApiService } from '../../data/services/cliente-api.service';

/**
 * Sesión de los clientes del sitio público. Es independiente de AuthService (administradores):
 * otra clave de almacenamiento y otro token. Se guarda en localStorage para que el cliente
 * no tenga que volver a iniciar sesión al regresar al sitio.
 */
@Injectable({ providedIn: 'root' })
export class ClienteAuthService {
  private static readonly TOKEN_KEY = 'isanorte.cliente.token';
  private static readonly PERFIL_KEY = 'isanorte.cliente.perfil';
  private readonly api = inject(ClienteApiService);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _token = signal<string | null>(this.readStorage(ClienteAuthService.TOKEN_KEY));
  private readonly _cliente = signal<ClienteResponse | null>(this.readPerfil());

  readonly cliente = this._cliente.asReadonly();
  readonly authenticated = computed(() => this._cliente() !== null && this._token() !== null);

  constructor() {
    // La sesión vive en localStorage y las pantallas de cliente se abren en pestañas nuevas:
    // cada pestaña debe reflejar el inicio o cierre de sesión hecho en otra.
    if (this.browser) {
      const sincronizar = (event: StorageEvent) => {
        if (event.key !== null && event.key !== ClienteAuthService.TOKEN_KEY && event.key !== ClienteAuthService.PERFIL_KEY) {
          return;
        }
        this._token.set(this.readStorage(ClienteAuthService.TOKEN_KEY));
        this._cliente.set(this.readPerfil());
      };
      window.addEventListener('storage', sincronizar);
      inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', sincronizar));
    }
  }

  registrar(request: ClienteRegistroRequest): Observable<ClienteAuthResponse> {
    return this.api.registrar(request).pipe(tap((response) => this.establecerSesion(response)));
  }

  login(request: ClienteLoginRequest): Observable<ClienteAuthResponse> {
    return this.api.login(request).pipe(tap((response) => this.establecerSesion(response)));
  }

  /** Devuelve el token vigente o null; si expiró, cierra la sesión local. */
  token(): string | null {
    const token = this._token();
    if (!token) return null;
    if (!this.vigente(token)) {
      this.logout();
      return null;
    }
    return token;
  }

  logout(): void {
    this._token.set(null);
    this._cliente.set(null);
    this.removeStorage(ClienteAuthService.TOKEN_KEY);
    this.removeStorage(ClienteAuthService.PERFIL_KEY);
  }

  private establecerSesion(response: ClienteAuthResponse): void {
    this._token.set(response.token);
    this._cliente.set(response.cliente);
    this.writeStorage(ClienteAuthService.TOKEN_KEY, response.token);
    this.writeStorage(ClienteAuthService.PERFIL_KEY, JSON.stringify(response.cliente));
  }

  private vigente(token: string): boolean {
    try {
      const payload = JSON.parse(this.decode(token.split('.')[1])) as { exp?: number };
      return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private readPerfil(): ClienteResponse | null {
    const value = this.readStorage(ClienteAuthService.PERFIL_KEY);
    if (!value) return null;
    try {
      return JSON.parse(value) as ClienteResponse;
    } catch {
      return null;
    }
  }

  private readStorage(key: string): string | null {
    if (!this.browser) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private writeStorage(key: string, value: string): void {
    if (!this.browser) return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Almacenamiento bloqueado (modo privado): la sesión dura solo en memoria.
    }
  }

  private removeStorage(key: string): void {
    if (!this.browser) return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Sin almacenamiento disponible no hay nada que limpiar.
    }
  }

  private decode(value: string | undefined): string {
    if (!value) throw new Error('Token inválido');
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(Array.from(atob(normalized), (char) =>
      `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''));
  }
}

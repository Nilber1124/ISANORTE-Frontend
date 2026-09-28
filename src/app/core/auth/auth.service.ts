import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthenticatedAdministrator, LoginRequest, LoginResponse } from '../../data/models/auth/login.model';
import { AuthApiService } from '../../data/services/auth-api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private static readonly TOKEN_KEY = 'isanorte.admin.token';
  private static readonly USER_KEY = 'isanorte.admin.user';
  private readonly api = inject(AuthApiService);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _token = signal<string | null>(this.read(AuthService.TOKEN_KEY));
  private readonly _user = signal<AuthenticatedAdministrator | null>(this.readUser());

  readonly user = this._user.asReadonly();
  readonly authenticated = computed(() => this.hasValidToken());

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.api.login(request).pipe(tap((response) => this.establishSession(response)));
  }

  logout(): void {
    this._token.set(null);
    this._user.set(null);
    if (this.browser) {
      sessionStorage.removeItem(AuthService.TOKEN_KEY);
      sessionStorage.removeItem(AuthService.USER_KEY);
    }
  }

  token(): string | null {
    if (!this.hasValidToken()) {
      this.logout();
      return null;
    }
    return this._token();
  }

  hasValidToken(): boolean {
    const token = this._token();
    if (!token) return false;
    try {
      const payload = JSON.parse(this.decode(token.split('.')[1])) as { exp?: number };
      return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private establishSession(response: LoginResponse): void {
    this._token.set(response.token);
    this._user.set(response.usuario);
    if (this.browser) {
      sessionStorage.setItem(AuthService.TOKEN_KEY, response.token);
      sessionStorage.setItem(AuthService.USER_KEY, JSON.stringify(response.usuario));
    }
  }

  private read(key: string): string | null {
    return this.browser ? sessionStorage.getItem(key) : null;
  }

  private readUser(): AuthenticatedAdministrator | null {
    const value = this.read(AuthService.USER_KEY);
    if (!value) return null;
    try { return JSON.parse(value) as AuthenticatedAdministrator; }
    catch { return null; }
  }

  private decode(value: string | undefined): string {
    if (!value) throw new Error('Token inválido');
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(Array.from(atob(normalized), (char) =>
      `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''));
  }
}

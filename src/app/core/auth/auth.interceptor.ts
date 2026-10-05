import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from '../config/api.config';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const base = inject(API_BASE_URL).replace(/\/+$/, '');
  const apiPrefix = `${base}/api/`;
  const protectedRequest = request.url.startsWith(apiPrefix)
    && !request.url.startsWith(`${base}/api/publico/`)
    && request.url !== `${base}/api/auth/login`;
  const token = protectedRequest ? inject(AuthService).token() : null;
  return next(token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request);
};

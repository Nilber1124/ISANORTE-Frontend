import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from '../config/api.config';
import { AuthService } from './auth.service';
import { trimTrailingSlashes } from '../../shared/utils/text';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const base = trimTrailingSlashes(inject(API_BASE_URL));
  const apiPrefix = `${base}/api/`;
  const protectedRequest = request.url.startsWith(apiPrefix)
    && !request.url.startsWith(`${base}/api/publico/`)
    && request.url !== `${base}/api/auth/login`;
  const token = protectedRequest ? inject(AuthService).token() : null;
  return next(token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request);
};

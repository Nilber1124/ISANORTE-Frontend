import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';
import { LoginRequest, LoginResponse } from '../models/auth/login.model';
import { trimTrailingSlashes } from '../../shared/utils/text';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly loginUrl = `${trimTrailingSlashes(inject(API_BASE_URL))}/api/auth/login`;

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, request);
  }
}

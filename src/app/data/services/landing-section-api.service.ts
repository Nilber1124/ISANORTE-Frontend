import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { LandingSectionCreateRequest } from '../models/landing-section/landing-section-create-request.model';
import { LandingSectionResponse } from '../models/landing-section/landing-section-response.model';
import { LandingSectionUpdateRequest } from '../models/landing-section/landing-section-update-request.model';
import { VisibilityRequest } from '../models/landing-section/visibility-request.model';
import { HeroSceneRequest, HeroSceneResponse } from '../models/landing-section/hero-scene.model';
import {
  LandingActionRequest,
  LandingActionResponse,
} from '../models/landing-section/landing-action.model';

@Injectable({ providedIn: 'root' })
export class LandingSectionApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${inject(API_BASE_URL).replace(/\/+$/, '')}/api/secciones-landing`;

  getAll(): Observable<LandingSectionResponse[]> {
    return this.http.get<LandingSectionResponse[]>(this.resourceUrl);
  }

  getVisible(): Observable<LandingSectionResponse[]> {
    return this.http.get<LandingSectionResponse[]>(`${this.resourceUrl}/visibles`);
  }

  getById(id: string): Observable<LandingSectionResponse> {
    return this.http.get<LandingSectionResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  create(request: LandingSectionCreateRequest): Observable<LandingSectionResponse> {
    return this.http.post<LandingSectionResponse>(this.resourceUrl, request);
  }

  update(id: string, request: LandingSectionUpdateRequest): Observable<LandingSectionResponse> {
    return this.http.put<LandingSectionResponse>(
      `${this.resourceUrl}/${encodeURIComponent(id)}`,
      request,
    );
  }

  changeVisibility(id: string, request: VisibilityRequest): Observable<LandingSectionResponse> {
    return this.http.patch<LandingSectionResponse>(
      `${this.resourceUrl}/${encodeURIComponent(id)}/visible`,
      request,
    );
  }

  createScene(sectionId: string, request: HeroSceneRequest): Observable<HeroSceneResponse> {
    return this.http.post<HeroSceneResponse>(`${this.sectionUrl(sectionId)}/escenas`, request);
  }

  updateScene(
    sectionId: string,
    sceneId: string,
    request: HeroSceneRequest,
  ): Observable<HeroSceneResponse> {
    return this.http.put<HeroSceneResponse>(
      `${this.sectionUrl(sectionId)}/escenas/${encodeURIComponent(sceneId)}`,
      request,
    );
  }

  deleteScene(sectionId: string, sceneId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.sectionUrl(sectionId)}/escenas/${encodeURIComponent(sceneId)}`,
    );
  }

  createAction(
    sectionId: string,
    request: LandingActionRequest,
  ): Observable<LandingActionResponse> {
    return this.http.post<LandingActionResponse>(`${this.sectionUrl(sectionId)}/acciones`, request);
  }

  updateAction(
    sectionId: string,
    actionId: string,
    request: LandingActionRequest,
  ): Observable<LandingActionResponse> {
    return this.http.put<LandingActionResponse>(
      `${this.sectionUrl(sectionId)}/acciones/${encodeURIComponent(actionId)}`,
      request,
    );
  }

  deleteAction(sectionId: string, actionId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.sectionUrl(sectionId)}/acciones/${encodeURIComponent(actionId)}`,
    );
  }

  private sectionUrl(id: string): string {
    return `${this.resourceUrl}/${encodeURIComponent(id)}`;
  }
}

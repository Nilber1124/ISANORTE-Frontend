import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { API_BASE_URL } from '../../core/config/api.config';
import { UploadResponseDto } from '../models/archivo/upload-response.model';

const UPLOAD_TIMEOUT_MS = 40_000;

@Injectable({ providedIn: 'root' })
export class ArchivoApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${inject(API_BASE_URL).replace(/\/+$/, '')}/api/archivos`;

  uploadImage(file: File, folder: string = 'isanorte/uploads'): Observable<UploadResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    return this.http
      .post<UploadResponseDto>(`${this.resourceUrl}/subir-imagen`, formData)
      .pipe(timeout(UPLOAD_TIMEOUT_MS));
  }

  uploadDocument(file: File, folder: string = 'isanorte/documentos'): Observable<UploadResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    return this.http
      .post<UploadResponseDto>(`${this.resourceUrl}/subir-documento`, formData)
      .pipe(timeout(UPLOAD_TIMEOUT_MS));
  }
}

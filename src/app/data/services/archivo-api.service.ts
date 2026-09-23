import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { UploadResponseDto } from '../models/archivo/upload-response.model';

@Injectable({ providedIn: 'root' })
export class ArchivoApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${inject(API_BASE_URL).replace(/\/+$/, '')}/api/archivos`;

  uploadImage(file: File, folder: string = 'isanorte/uploads'): Observable<UploadResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    return this.http.post<UploadResponseDto>(`${this.resourceUrl}/subir-imagen`, formData);
  }
}

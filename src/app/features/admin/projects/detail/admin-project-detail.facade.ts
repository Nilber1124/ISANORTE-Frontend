import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { ProjectImageRequest } from '../../../../data/models/project/project-image-request.model';
import {
  ProjectImageResponse,
  ProjectResponse,
} from '../../../../data/models/project/project-response.model';
import { ProjectApiService } from '../../../../data/services/project-api.service';

@Injectable()
export class AdminProjectDetailFacade {
  private readonly projectApi = inject(ProjectApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _project = signal<ProjectResponse | null>(null);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);
  private readonly _notFound = signal(false);
  private readonly _savingImage = signal(false);
  private readonly _deletingImageId = signal<string | null>(null);
  private readonly _success = signal<string | null>(null);

  readonly project = this._project.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly notFound = this._notFound.asReadonly();
  readonly savingImage = this._savingImage.asReadonly();
  readonly deletingImageId = this._deletingImageId.asReadonly();
  readonly success = this._success.asReadonly();

  load(projectId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!projectId) {
      this._loading.set(false);
      this._notFound.set(true);
      return;
    }

    this._loading.set(true);
    this._error.set(null);
    this._notFound.set(false);
    this.projectApi
      .getById(projectId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (project) => this._project.set(project),
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 404) {
            this._notFound.set(true);
            return;
          }
          this._error.set(
            'No pudimos cargar el proyecto. Comprueba tu conexión e inténtalo nuevamente.',
          );
        },
      });
  }

  createImage(request: ProjectImageRequest): void {
    const project = this._project();
    if (project === null || this._savingImage()) return;
    this._savingImage.set(true);
    this.prepareMutation();
    this.projectApi
      .createImage(project.id, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._savingImage.set(false)),
      )
      .subscribe({
        next: (image) => {
          this.upsertImage(image);
          this._success.set('Imagen agregada correctamente.');
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  updateImage(imageId: string, request: ProjectImageRequest): void {
    const project = this._project();
    if (project === null || this._savingImage()) return;
    this._savingImage.set(true);
    this.prepareMutation();
    this.projectApi
      .updateImage(project.id, imageId, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._savingImage.set(false)),
      )
      .subscribe({
        next: (image) => {
          this.upsertImage(image);
          this._success.set('Imagen actualizada correctamente.');
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  deleteImage(imageId: string): void {
    const project = this._project();
    if (project === null || this._deletingImageId() !== null) return;
    this._deletingImageId.set(imageId);
    this.prepareMutation();
    this.projectApi
      .deleteImage(project.id, imageId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._deletingImageId.set(null)),
      )
      .subscribe({
        next: () => {
          this._project.update((current) =>
            current === null
              ? null
              : {
                  ...current,
                  imagenes: current.imagenes?.filter((image) => image.id !== imageId) ?? [],
                },
          );
          this._success.set('Imagen eliminada correctamente.');
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  clearFeedback(): void {
    this._error.set(null);
    this._success.set(null);
  }

  private prepareMutation(): void {
    this._error.set(null);
    this._success.set(null);
  }

  private upsertImage(image: ProjectImageResponse): void {
    this._project.update((project) => {
      if (project === null) return null;
      const images = project.imagenes ?? [];
      const exists = images.some((item) => item.id === image.id);
      const next = exists
        ? images.map((item) => (item.id === image.id ? image : item))
        : [...images, image];
      return {
        ...project,
        imagenes: [...next].sort((first, second) => (first.orden ?? 0) - (second.orden ?? 0)),
      };
    });
  }

  private mutationErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) return 'Revisa los datos de la imagen e inténtalo nuevamente.';
      if (error.status === 404) return 'El proyecto o la imagen ya no existe.';
      if (error.status === 409) return 'No pudimos guardar la imagen debido a un conflicto.';
    }
    return 'No pudimos guardar el cambio. Comprueba tu conexión e inténtalo nuevamente.';
  }
}

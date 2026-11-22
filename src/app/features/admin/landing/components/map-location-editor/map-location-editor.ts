import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, output, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { ToastService } from '../../../../../core/services/toast.service';
import { Button } from '../../../../../shared/components/button/button';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { LocationPicker } from '../../../../../shared/components/location-picker/location-picker';
import { trimTrailingSlashes } from '../../../../../shared/utils/text';
import { CONTENT_ITEMS } from '../content-item-editor/content-item-editor';

interface Company {
  id: string;
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
  [key: string]: unknown;
}

/**
 * Elegir la ubicación de la oficina (mapa de «Dónde trabajamos»): punto en el mapa y dirección. Se guarda en la
 * empresa; el resto de sus campos viaja como está guardado.
 */
@Component({
  selector: 'app-map-location-editor',
  imports: [Button, InputField, LocationPicker],
  templateUrl: './map-location-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapLocationEditor {
  readonly saved = output<void>();
  readonly closed = output<void>();

  private readonly http = inject(HttpClient);
  private readonly base = trimTrailingSlashes(inject(API_BASE_URL));
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly company = signal<Company | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly latitud = signal<number | null>(null);
  protected readonly longitud = signal<number | null>(null);
  protected readonly direccion = signal('');

  protected readonly dirty = computed(() => {
    const company = this.company();
    return (
      !!company &&
      (this.latitud() !== (company.latitud ?? null) ||
        this.longitud() !== (company.longitud ?? null) ||
        this.direccion() !== (company.direccion ?? ''))
    );
  });

  constructor() {
    this.http
      .get<Company[]>(`${this.base}/api/empresa`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (all) => {
          this.setCompany(all[0] ?? null);
          this.loading.set(false);
          if (!all[0]) this.error.set('No hay empresa registrada.');
        },
        error: () => {
          this.error.set('No se pudo cargar la empresa.');
          this.loading.set(false);
        },
      });
  }

  private setCompany(company: Company | null): void {
    this.company.set(company);
    this.latitud.set(company?.latitud ?? null);
    this.longitud.set(company?.longitud ?? null);
    this.direccion.set(company?.direccion ?? '');
  }

  protected save(): void {
    const company = this.company();
    if (!company || this.saving() || !this.dirty()) return;
    this.saving.set(true);
    this.error.set(null);
    const keys = CONTENT_ITEMS['empresa'].bodyKeys ?? [];
    const body = {
      ...Object.fromEntries(keys.map((key) => [key, company[key] ?? null])),
      latitud: this.latitud(),
      longitud: this.longitud(),
      direccion: this.direccion().trim() || null,
    };
    this.http
      .put<Company>(`${this.base}/api/empresa/${encodeURIComponent(company.id)}`, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.setCompany(updated);
          this.saving.set(false);
          this.toast.show('Ubicación actualizada.', 'success');
          this.saved.emit();
        },
        error: () => {
          this.saving.set(false);
          this.error.set('No se pudo guardar la ubicación.');
        },
      });
  }
}

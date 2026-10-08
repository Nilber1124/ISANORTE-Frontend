import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AnnouncementActionType,
  AnnouncementDestination,
  AnnouncementRequest,
  AnnouncementResponse,
} from '../../../../../data/models/announcement/announcement.model';
import { Alert } from '../../../../../shared/components/alert/alert';
import { Button } from '../../../../../shared/components/button/button';
import { Drawer } from '../../../../../shared/components/drawer/drawer';
import { ImageUploaderComponent } from '../../../../../shared/components/image-uploader/image-uploader.component';
import { AnnouncementFormMode } from '../../admin-announcements.facade';

@Component({
  selector: 'app-announcement-form',
  imports: [FormsModule, Alert, Button, Drawer, ImageUploaderComponent],
  templateUrl: './announcement-form.html',
  styleUrl: './announcement-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnouncementForm implements OnInit {
  readonly mode = input.required<AnnouncementFormMode>();
  readonly announcement = input<AnnouncementResponse | null>(null);
  readonly submitting = input(false);
  readonly serverError = input<string | null>(null);
  readonly canceled = output<void>();
  readonly saved = output<AnnouncementRequest>();

  readonly titulo = signal('');
  readonly descripcionResumida = signal('');
  readonly contenidoDetallado = signal('');
  readonly condiciones = signal('');
  readonly imagenUrl = signal('');
  readonly etiqueta = signal('Promoción');
  readonly destino = signal<AnnouncementDestination>('AMBOS');
  readonly tipoAccion = signal<AnnouncementActionType>('RUTA_INTERNA');
  readonly destinoAccion = signal('');
  readonly textoBoton = signal('Ver más');
  readonly fechaInicio = signal('');
  readonly fechaFin = signal('');
  readonly activo = signal(true);
  readonly orden = signal('0');
  readonly submitted = signal(false);

  readonly invalidDates = computed(() =>
    Boolean(this.fechaInicio() && this.fechaFin() && this.fechaFin() < this.fechaInicio()),
  );

  readonly actionTypes: readonly { value: AnnouncementActionType; label: string }[] = [
    { value: 'RUTA_INTERNA', label: 'Ruta interna' },
    { value: 'URL_EXTERNA', label: 'Página externa' },
    { value: 'SECCION', label: 'Sección de la página' },
    { value: 'PRODUCTO', label: 'Producto ISADECOR' },
    { value: 'CATEGORIA', label: 'Categoría ISADECOR' },
    { value: 'PROYECTO', label: 'Proyecto ISANORTE' },
    { value: 'SERVICIO', label: 'Servicio ISANORTE' },
  ];

  ngOnInit(): void {
    const value = this.announcement();
    if (!value) return;
    this.titulo.set(value.titulo);
    this.descripcionResumida.set(value.descripcionResumida);
    this.contenidoDetallado.set(value.contenidoDetallado);
    this.condiciones.set(value.condiciones ?? '');
    this.imagenUrl.set(value.imagenUrl);
    this.etiqueta.set(value.etiqueta);
    this.destino.set(value.destino);
    this.tipoAccion.set(value.tipoAccion);
    this.destinoAccion.set(value.destinoAccion);
    this.textoBoton.set(value.textoBoton);
    this.fechaInicio.set(this.toInputDate(value.fechaInicio));
    this.fechaFin.set(this.toInputDate(value.fechaFin));
    this.activo.set(value.activo);
    this.orden.set(String(value.orden));
  }

  protected submit(): void {
    this.submitted.set(true);
    if (!this.valid() || this.submitting()) return;
    this.saved.emit({
      titulo: this.titulo().trim(),
      descripcionResumida: this.descripcionResumida().trim(),
      contenidoDetallado: this.contenidoDetallado().trim(),
      condiciones: this.optional(this.condiciones()),
      imagenUrl: this.imagenUrl().trim(),
      etiqueta: this.etiqueta().trim(),
      destino: this.destino(),
      tipoAccion: this.tipoAccion(),
      destinoAccion: this.destinoAccion().trim(),
      textoBoton: this.textoBoton().trim(),
      fechaInicio: this.optional(this.fechaInicio()),
      fechaFin: this.optional(this.fechaFin()),
      activo: this.activo(),
      orden: Number(this.orden()),
    });
  }

  protected setDestination(event: Event): void {
    this.destino.set((event.target as HTMLSelectElement).value as AnnouncementDestination);
  }
  protected setActionType(event: Event): void {
    this.tipoAccion.set((event.target as HTMLSelectElement).value as AnnouncementActionType);
  }
  protected setActive(event: Event): void {
    this.activo.set((event.target as HTMLInputElement).checked);
  }

  private valid(): boolean {
    return Boolean(
      this.titulo().trim() &&
      this.descripcionResumida().trim() &&
      this.contenidoDetallado().trim() &&
      this.imagenUrl().trim() &&
      this.etiqueta().trim() &&
      this.destinoAccion().trim() &&
      this.textoBoton().trim() &&
      Number.isInteger(Number(this.orden())) &&
      Number(this.orden()) >= 0 &&
      !this.invalidDates(),
    );
  }

  private optional(value: string): string | null {
    return value.trim() || null;
  }
  private toInputDate(value: string | null): string {
    return value ? value.slice(0, 16) : '';
  }
}

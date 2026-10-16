import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UploadResponseDto } from '../../../data/models/archivo/upload-response.model';
import { ArchivoApiService } from '../../../data/services/archivo-api.service';

@Component({
  selector: 'app-document-uploader',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DocumentUploaderComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden group cursor-pointer"
      [class.border-accent]="isDragging"
      [class.bg-accent-soft]="isDragging"
      [class.border-border]="!isDragging && !documentUrl"
      [class.bg-surface]="!isDragging && !documentUrl"
      [class.hover:border-accent]="!isDragging && !documentUrl"
      [class.border-transparent]="documentUrl && !isDragging"
      (click)="onContainerClick()"
    >
      <input
        type="file"
        #fileInput
        class="hidden"
        accept="application/pdf"
        (change)="onFileSelected($event)"
      />

      @if (documentUrl) {
        <!-- Vista previa del PDF cargado -->
        <div class="flex items-center gap-3 p-4">
          <div class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-body-sm font-semibold text-text-primary">PDF cargado</p>
            <a
              [href]="documentUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="block truncate font-mono text-caption text-text-muted hover:text-accent"
              (click)="$event.stopPropagation()"
            >
              {{ documentUrl }}
            </a>
          </div>
        </div>
        @if (!isUploading) {
          <div class="flex gap-3 px-4 pb-3 justify-end" (click)="$event.stopPropagation()">
            <button
              type="button"
              class="text-caption text-text-secondary underline hover:text-text-primary focus-visible:outline-none"
              (click)="triggerFileInput()"
            >
              Cambiar
            </button>
            <button
              type="button"
              class="text-caption text-error underline hover:opacity-75 focus-visible:outline-none"
              (click)="clearDocument()"
            >
              Quitar
            </button>
          </div>
        }
      } @else {
        <!-- Estado vacío / Drag & Drop -->
        <div class="flex flex-col items-center justify-center py-10 px-6 text-center">
          <div
            class="w-16 h-16 mb-4 rounded-full flex items-center justify-center bg-accent/10 text-accent transition-transform duration-300"
            [class.scale-110]="isDragging"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-base font-semibold text-text-primary mb-1">
            Sube un PDF o arrástralo aquí
          </h3>
          @if (showHint) {
            <p class="text-sm text-text-muted">PDF (máx. 10MB)</p>
          }
        </div>
      }

      <!-- Spinner de carga superpuesto -->
      @if (isUploading) {
        <div
          class="absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 transition-all duration-300 rounded-xl"
        >
          <svg class="animate-spin h-10 w-10 text-accent mb-3" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm font-medium text-text-secondary">Subiendo PDF...</span>
        </div>
      }
    </div>

    @if (errorMessage) {
      <!-- Mensaje de error -->
      <div class="mt-2 text-sm text-error flex items-center gap-1.5">
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ errorMessage }}
      </div>
    }
  `,
})
export class DocumentUploaderComponent implements ControlValueAccessor {
  @Input() folder: string = 'isanorte/documentos';
  @Input() showHint: boolean = true;
  @Output() uploaded = new EventEmitter<UploadResponseDto>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  documentUrl: string | null = null;
  isDragging = false;
  isUploading = false;
  errorMessage: string | null = null;

  private archivoApiService = inject(ArchivoApiService);

  onChange = (value: string | null) => {};
  onTouched = () => {};

  writeValue(value: string | null): void {
    this.documentUrl = value;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  protected onContainerClick(): void {
    if (!this.documentUrl) {
      this.triggerFileInput();
    }
  }

  triggerFileInput(): void {
    if (!this.isUploading) {
      this.fileInput.nativeElement.click();
    }
  }

  clearDocument(): void {
    this.documentUrl = null;
    this.onChange(null);
    this.onTouched();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
      input.value = '';
    }
  }

  private handleFile(file: File): void {
    this.errorMessage = null;

    if (file.type !== 'application/pdf') {
      this.errorMessage = 'Solo se permiten archivos PDF.';
      this.onTouched();
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.errorMessage = 'El PDF no debe superar los 10MB.';
      this.onTouched();
      return;
    }

    this.uploadDocument(file);
  }

  private uploadDocument(file: File): void {
    this.isUploading = true;
    this.onTouched();

    this.archivoApiService.uploadDocument(file, this.folder).subscribe({
      next: (response) => {
        this.documentUrl = response.url;
        this.onChange(this.documentUrl);
        this.uploaded.emit(response);
        this.isUploading = false;
      },
      error: (err) => {
        console.error('Error uploading document', err);
        this.errorMessage =
          err?.name === 'TimeoutError'
            ? 'El servidor tardó demasiado. Intenta de nuevo en unos segundos.'
            : 'Hubo un error al subir el PDF. Intenta de nuevo.';
        this.isUploading = false;
      },
    });
  }
}

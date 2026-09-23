import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  Input,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ArchivoApiService } from '../../../data/services/archivo-api.service';

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploaderComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden group"
      [ngClass]="{
        'border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-900/20': isDragging,
        'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-500 dark:hover:bg-gray-800': !isDragging && !imageUrl,
        'border-transparent': imageUrl && !isDragging
      }"
      (click)="triggerFileInput()"
    >
      <input
        type="file"
        #fileInput
        class="hidden"
        accept="image/jpeg, image/png, image/webp"
        (change)="onFileSelected($event)"
      />

      <!-- Previsualización -->
      <div *ngIf="imageUrl" class="relative w-full aspect-video md:aspect-[21/9] bg-gray-900 rounded-xl overflow-hidden">
        <img
          [src]="imageUrl"
          alt="Preview"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        <!-- Overlay al hacer hover -->
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
          <div class="flex flex-col items-center text-white space-y-2">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span class="font-medium text-sm">Cambiar imagen</span>
          </div>
        </div>
      </div>

      <!-- Estado vacío / Drag & Drop -->
      <div
        *ngIf="!imageUrl"
        class="flex flex-col items-center justify-center py-12 px-6 text-center"
      >
        <div 
          class="w-16 h-16 mb-4 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 transition-transform duration-300"
          [ngClass]="{'scale-110': isDragging}"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">
          Sube una imagen o arrástrala aquí
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          PNG, JPG o WEBP (máx. 5MB)
        </p>
      </div>

      <!-- Spinner de carga superpuesto -->
      <div
        *ngIf="isUploading"
        class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 transition-all duration-300 rounded-xl"
      >
        <svg class="animate-spin h-10 w-10 text-blue-600 dark:text-blue-500 mb-3" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Subiendo imagen...</span>
      </div>
    </div>
    
    <!-- Mensaje de error -->
    <div *ngIf="errorMessage" class="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
      <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {{ errorMessage }}
    </div>
  `,
})
export class ImageUploaderComponent implements ControlValueAccessor {
  @Input() folder: string = 'isanorte/uploads';
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  imageUrl: string | null = null;
  isDragging = false;
  isUploading = false;
  errorMessage: string | null = null;

  private archivoApiService = inject(ArchivoApiService);

  // Funciones para ControlValueAccessor
  onChange = (value: string | null) => {};
  onTouched = () => {};

  writeValue(value: string | null): void {
    this.imageUrl = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  triggerFileInput() {
    if (!this.isUploading) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
      // Reset input value to allow selecting the same file again if needed
      input.value = '';
    }
  }

  private handleFile(file: File) {
    this.errorMessage = null;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.errorMessage = 'Solo se permiten imágenes JPG, PNG o WEBP.';
      this.onTouched();
      return;
    }

    // Validate size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.errorMessage = 'La imagen no debe superar los 5MB.';
      this.onTouched();
      return;
    }

    this.uploadImage(file);
  }

  private uploadImage(file: File) {
    this.isUploading = true;
    this.onTouched();

    this.archivoApiService.uploadImage(file, this.folder).subscribe({
      next: (response) => {
        this.imageUrl = response.url;
        this.onChange(this.imageUrl);
        this.isUploading = false;
      },
      error: (err) => {
        console.error('Error uploading image', err);
        this.errorMessage = 'Hubo un error al subir la imagen. Intenta de nuevo.';
        this.isUploading = false;
      },
    });
  }
}

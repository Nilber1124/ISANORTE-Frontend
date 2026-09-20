import { ChangeDetectionStrategy, Component, OnInit, input, output, signal } from '@angular/core';

import {
  PageContentRequest,
  PageContentResponse,
  PageContentUpdateRequest,
  PublicPageType,
} from '../../../../../data/models/content/page-content.model';
import { SiteConfigResponse } from '../../../../../data/models/site-config/site-config-response.model';
import { Button } from '../../../../../shared/components/button/button';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Modal } from '../../../../../shared/components/modal/modal';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';

@Component({
  selector: 'app-page-content-form',
  imports: [Button, InputField, Modal, TextareaField],
  templateUrl: './page-content-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageContentForm implements OnInit {
  readonly content = input<PageContentResponse | null>(null);
  readonly configurations = input.required<readonly SiteConfigResponse[]>();
  readonly saving = input(false);
  readonly closed = output<void>();
  readonly saved = output<PageContentRequest | PageContentUpdateRequest>();

  readonly pageTypes = Object.values(PublicPageType);
  readonly configuracionSitioId = signal('');
  readonly pagina = signal<PublicPageType>(PublicPageType.NOSOTROS);
  readonly eyebrow = signal('');
  readonly titulo = signal('');
  readonly introduccion = signal('');
  readonly descripcion = signal('');
  readonly imagenUrl = signal('');
  readonly imagenAlt = signal('');
  readonly imagenFondoUrl = signal('');
  readonly activo = signal(true);
  readonly tags = signal<string[]>([]);
  readonly tagDraft = signal('');
  readonly editingTagIndex = signal<number | null>(null);

  ngOnInit(): void {
    const item = this.content();
    if (item) {
      this.configuracionSitioId.set(item.configuracionSitioId);
      this.pagina.set(item.pagina);
      this.eyebrow.set(item.eyebrow ?? '');
      this.titulo.set(item.titulo ?? '');
      this.introduccion.set(item.introduccion ?? '');
      this.descripcion.set(item.descripcion ?? '');
      this.imagenUrl.set(item.imagenUrl ?? '');
      this.imagenAlt.set(item.imagenAlt ?? '');
      this.imagenFondoUrl.set(item.imagenFondoUrl ?? '');
      this.activo.set(item.activo);
      this.tags.set([...(item.tags ?? [])]);
    } else if (this.configurations().length)
      this.configuracionSitioId.set(this.configurations()[0].id);
  }

  protected addTag(): void {
    const value = this.tagDraft().trim();
    if (!value) return;
    const editingIndex = this.editingTagIndex();
    if (editingIndex === null) this.tags.update((tags) => [...tags, value]);
    else
      this.tags.update((tags) => tags.map((tag, index) => (index === editingIndex ? value : tag)));
    this.tagDraft.set('');
    this.editingTagIndex.set(null);
  }
  protected editTag(index: number): void {
    this.tagDraft.set(this.tags()[index]);
    this.editingTagIndex.set(index);
  }
  protected removeTag(index: number): void {
    this.tags.update((tags) => tags.filter((_, i) => i !== index));
    if (this.editingTagIndex() === index) {
      this.editingTagIndex.set(null);
      this.tagDraft.set('');
    }
  }
  protected moveTag(index: number, direction: -1 | 1): void {
    const next = [...this.tags()];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    this.tags.set(next);
  }
  protected updateActive(event: Event): void {
    this.activo.set((event.target as HTMLInputElement).checked);
  }
  protected updatePage(event: Event): void {
    this.pagina.set((event.target as HTMLSelectElement).value as PublicPageType);
  }
  protected submit(): void {
    const editable: PageContentUpdateRequest = {
      eyebrow: this.optional(this.eyebrow()),
      titulo: this.optional(this.titulo()),
      introduccion: this.optional(this.introduccion()),
      descripcion: this.optional(this.descripcion()),
      imagenUrl: this.optional(this.imagenUrl()),
      imagenAlt: this.optional(this.imagenAlt()),
      imagenFondoUrl: this.optional(this.imagenFondoUrl()),
      activo: this.activo(),
      tags: [...this.tags()],
    };
    this.saved.emit(
      this.content()
        ? editable
        : { ...editable, configuracionSitioId: this.configuracionSitioId(), pagina: this.pagina() },
    );
  }
  private optional(value: string): string | null {
    return value.trim() || null;
  }
}

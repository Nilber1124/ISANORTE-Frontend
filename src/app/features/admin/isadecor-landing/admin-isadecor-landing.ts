import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Alert } from '../../../shared/components/alert/alert';
import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { InputField } from '../../../shared/components/input-field/input-field';
import { Modal } from '../../../shared/components/modal/modal';
import { SelectField, SelectOption } from '../../../shared/components/select-field/select-field';
import { AdminIsadecorLandingFacade } from './admin-isadecor-landing.facade';
import {
  CollectionHighlightConfig,
  HomeQuickAccessItem,
} from '../../../core/services/isadecor-hero-quick-access.service';

@Component({
  selector: 'app-admin-isadecor-landing',
  imports: [
    Alert,
    Badge,
    Button,
    FormsModule,
    InputField,
    Modal,
    RouterLink,
    SelectField,
  ],
  providers: [AdminIsadecorLandingFacade],
  templateUrl: './admin-isadecor-landing.html',
  styleUrl: './admin-isadecor-landing.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminIsadecorLanding {
  readonly facade = inject(AdminIsadecorLandingFacade);

  // Modal form reactive fields
  readonly editIndex = signal('');
  readonly editTag = signal('');
  readonly editTitle = signal('');
  readonly editSubtitle = signal('');
  readonly editCategorySlug = signal('');
  readonly editVisible = signal(true);

  readonly categoryOptions = computed<readonly SelectOption[]>(() => {
    const cats = this.facade.categories();
    if (cats.length > 0) {
      return cats.map((c) => ({
        label: c.nombre,
        value: c.slug || c.id,
      }));
    }
    return [
      { label: 'Wall Panels', value: 'wall-panels' },
      { label: 'Pisos', value: 'pisos' },
      { label: 'Revestimientos', value: 'revestimientos' },
      { label: 'Paneles Decorativos Premium', value: 'paneles-decorativos' },
    ];
  });

  constructor() {
    afterNextRender(() => {
      this.facade.load();
    });
  }

  protected handleOpenCreate(): void {
    const nextIdx = String(this.facade.items().length + 1).padStart(2, '0');
    this.editIndex.set(nextIdx);
    this.editTag.set('Línea');
    this.editTitle.set('');
    this.editSubtitle.set('');
    this.editCategorySlug.set(this.categoryOptions()[0]?.value || 'wall-panels');
    this.editVisible.set(true);

    this.facade.openCreate();
  }

  protected handleOpenEdit(item: HomeQuickAccessItem): void {
    this.editIndex.set(item.index);
    this.editTag.set(item.tag);
    this.editTitle.set(item.title);
    this.editSubtitle.set(item.subtitle);
    this.editVisible.set(item.visible !== false);

    const initialCategory =
      item.queryParams['categoria'] ||
      this.inferCategorySlug(item.queryParams['q'] || item.title);
    this.editCategorySlug.set(initialCategory);

    this.facade.openEdit(item);
  }

  protected handleSave(): void {
    const editing = this.facade.editingItem();

    const chosenCategory = this.editCategorySlug().trim() || 'wall-panels';
    const queryParams: Record<string, string> = {
      categoria: chosenCategory,
    };

    const updated: HomeQuickAccessItem = {
      id: editing?.id || '',
      index: this.editIndex().trim() || '01',
      tag: this.editTag().trim() || 'Línea',
      title: this.editTitle().trim() || 'Nueva Línea',
      subtitle: this.editSubtitle().trim() || '',
      queryParams,
      visible: this.editVisible(),
    };

    this.facade.saveItem(updated);
  }

  readonly activeTab = signal<'hero' | 'collections'>('hero');

  // Collection modal reactive fields
  readonly colCategorySlug = signal('');
  readonly colBadge = signal('');
  readonly colEyebrow = signal('');
  readonly colTagline = signal('');
  readonly colImageUrl = signal('');
  readonly colTitle = signal('');
  readonly colDescription = signal('');
  readonly colVisible = signal(true);

  readonly standardImages = [
    { label: 'Madera cálida (Wall Panel)', value: '/images/isadecor-left-1.jpg' },
    { label: 'Mármol SPC / Sofá verde', value: '/images/isadecor-left-2.jpg' },
    { label: 'Pisos & Techos arquitectónicos', value: '/images/isadecor-top.jpg' },
    { label: 'Ambiente residencial completo', value: '/images/isadecor-fondo.jpg' },
    { label: 'Portada Hero moderna', value: '/images/isadecor-hero.jpg' },
  ];

  protected handleOpenCreateCollection(): void {
    const defaultCat = this.categoryOptions()[0]?.value || 'wall-panels';
    this.colCategorySlug.set(defaultCat);
    this.colBadge.set('COLECCIÓN');
    this.colEyebrow.set('Línea de acabados');
    this.colTagline.set('');
    this.colImageUrl.set('/images/isadecor-left-1.jpg');
    this.colTitle.set('');
    this.colDescription.set('');
    this.colVisible.set(true);

    this.facade.openCreateCollection();
  }

  protected handleOpenEditCollection(col: CollectionHighlightConfig): void {
    this.colCategorySlug.set(col.categorySlug);
    this.colBadge.set(col.badge || '');
    this.colEyebrow.set(col.eyebrow || '');
    this.colTagline.set(col.tagline || '');
    this.colImageUrl.set(col.imageUrl || '/images/isadecor-left-1.jpg');
    this.colTitle.set(col.title || '');
    this.colDescription.set(col.description || '');
    this.colVisible.set(col.visible !== false);

    this.facade.openEditCollection(col);
  }

  protected handleSaveCollection(): void {
    const editing = this.facade.editingCollection();

    const updated: CollectionHighlightConfig = {
      id: editing?.id || '',
      categorySlug: this.colCategorySlug() || 'wall-panels',
      badge: this.colBadge().trim() || undefined,
      eyebrow: this.colEyebrow().trim() || undefined,
      tagline: this.colTagline().trim() || undefined,
      imageUrl: this.colImageUrl().trim() || undefined,
      title: this.colTitle().trim() || undefined,
      description: this.colDescription().trim() || undefined,
      visible: this.colVisible(),
    };

    this.facade.saveCollection(updated);
  }

  protected getCollectionCategoryName(categorySlug: string): string {
    const match = this.facade.categories().find(
      (c) => c.slug === categorySlug || c.id === categorySlug,
    );
    return match ? match.nombre : categorySlug;
  }

  protected getParamLabel(item: HomeQuickAccessItem): string {
    const slug = item.queryParams['categoria'] || item.queryParams['q'] || '';
    const match = this.facade.categories().find((c) => c.slug === slug || c.id === slug);
    return match ? `Categoría: ${match.nombre}` : `Categoría: ${slug}`;
  }

  private inferCategorySlug(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('wall') || lower.includes('panel')) return 'wall-panels';
    if (lower.includes('piso')) return 'pisos';
    if (lower.includes('mármol') || lower.includes('marmol') || lower.includes('revestimiento')) {
      return 'revestimientos';
    }
    if (lower.includes('cielo') || lower.includes('techo') || lower.includes('pvc')) {
      return 'paneles-decorativos';
    }
    return 'wall-panels';
  }
}

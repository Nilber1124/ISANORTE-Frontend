import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

export interface HomeQuickAccessItem {
  id: string;
  index: string;
  tag: string;
  title: string;
  subtitle: string;
  queryParams: Record<string, string>;
  visible?: boolean;
}

export const DEFAULT_HERO_QUICK_ACCESS_ITEMS: readonly HomeQuickAccessItem[] = [
  {
    id: 'wall-panel-wpc',
    index: '01',
    tag: 'Paredes',
    title: 'Wall Panel WPC',
    subtitle: 'Listones para interior y exterior',
    queryParams: { categoria: 'wall-panels' },
    visible: true,
  },
  {
    id: 'planchas-spc-marmol',
    index: '02',
    tag: 'Superficies',
    title: 'Planchas SPC Mármol',
    subtitle: 'Acabado tipo mármol sin obra',
    queryParams: { categoria: 'revestimientos' },
    visible: true,
  },
  {
    id: 'cielos-rasos-pvc',
    index: '03',
    tag: 'Techos',
    title: 'Cielo Raso PVC',
    subtitle: 'Resistente a humedad y fácil limpieza',
    queryParams: { categoria: 'paneles-decorativos' },
    visible: true,
  },
  {
    id: 'pisos-molduras',
    index: '04',
    tag: 'Complementos',
    title: 'Pisos & Molduras',
    subtitle: 'Perfiles de remate y acabados finos',
    queryParams: { categoria: 'pisos' },
    visible: true,
  },
];

export interface CollectionHighlightConfig {
  id: string;
  categorySlug: string;
  badge?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  tagline?: string;
  imageUrl?: string;
  visible?: boolean;
}

export const DEFAULT_COLLECTIONS_CONFIG: readonly CollectionHighlightConfig[] = [
  {
    id: 'col-1',
    categorySlug: 'wall-panels',
    badge: 'PARED',
    eyebrow: 'Acabados de Pared',
    tagline: 'Textura madera · Fácil instalación click',
    imageUrl: '/images/isadecor-left-1.jpg',
    visible: true,
  },
  {
    id: 'col-2',
    categorySlug: 'pisos',
    badge: 'PISOS',
    eyebrow: 'Acabados de Piso',
    tagline: 'Alto tránsito · Resistencia al agua',
    imageUrl: '/images/isadecor-top.jpg',
    visible: true,
  },
  {
    id: 'col-3',
    categorySlug: 'revestimientos',
    badge: 'REVESTIMIENTOS',
    eyebrow: 'Línea Revestimientos',
    tagline: 'Diseño contemporáneo y protección',
    imageUrl: '/images/isadecor-left-2.jpg',
    visible: true,
  },
];

const STORAGE_KEY = 'isadecor_hero_quick_access_v2';
const COLLECTIONS_STORAGE_KEY = 'isadecor_featured_collections_v2';

@Injectable({ providedIn: 'root' })
export class IsadecorHeroQuickAccessService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly _items = signal<readonly HomeQuickAccessItem[]>(
    DEFAULT_HERO_QUICK_ACCESS_ITEMS,
  );
  private readonly _collections = signal<readonly CollectionHighlightConfig[]>(
    DEFAULT_COLLECTIONS_CONFIG,
  );

  readonly items = this._items.asReadonly();
  readonly collections = this._collections.asReadonly();
  readonly visibleItems = computed(() =>
    this._items().filter((item) => item.visible !== false),
  );
  readonly visibleCollections = computed(() =>
    this._collections().filter((col) => col.visible !== false),
  );

  constructor() {
    this.restoreFromStorage();
  }

  private restoreFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HomeQuickAccessItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          this._items.set(parsed);
        }
      }
    } catch {
      // In case of parsing error, retain default items
    }

    try {
      const storedCols = localStorage.getItem(COLLECTIONS_STORAGE_KEY);
      if (storedCols) {
        const parsedCols = JSON.parse(storedCols) as CollectionHighlightConfig[];
        if (Array.isArray(parsedCols) && parsedCols.length > 0) {
          this._collections.set(parsedCols);
        }
      }
    } catch {
      // Retain default collections
    }
  }

  saveAll(items: readonly HomeQuickAccessItem[]): void {
    this._items.set(items);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        // Fallback gracefully if storage is restricted
      }
    }
  }

  updateItem(id: string, updated: Partial<HomeQuickAccessItem>): void {
    const next = this._items().map((item) =>
      item.id === id ? { ...item, ...updated } : item,
    );
    this.saveAll(next);
  }

  toggleItemVisibility(id: string): void {
    const next = this._items().map((item) =>
      item.id === id ? { ...item, visible: item.visible === false ? true : false } : item,
    );
    this.saveAll(next);
  }

  addItem(item: Omit<HomeQuickAccessItem, 'id'>): void {
    const newId = `hero-${Date.now()}`;
    const next = [
      ...this._items(),
      { ...item, id: newId, visible: item.visible ?? true },
    ];
    this.saveAll(next);
  }

  deleteItem(id: string): void {
    const next = this._items()
      .filter((item) => item.id !== id)
      .map((item, idx) => ({
        ...item,
        index: String(idx + 1).padStart(2, '0'),
      }));
    this.saveAll(next);
  }

  resetToDefaults(): void {
    this._items.set(DEFAULT_HERO_QUICK_ACCESS_ITEMS);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Fallback gracefully
      }
    }
  }

  saveAllCollections(collections: readonly CollectionHighlightConfig[]): void {
    this._collections.set(collections);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections));
      } catch {
        // Fallback gracefully
      }
    }
  }

  updateCollection(id: string, updated: Partial<CollectionHighlightConfig>): void {
    const next = this._collections().map((col) =>
      col.id === id ? { ...col, ...updated } : col,
    );
    this.saveAllCollections(next);
  }

  toggleCollectionVisibility(id: string): void {
    const next = this._collections().map((col) =>
      col.id === id ? { ...col, visible: col.visible === false ? true : false } : col,
    );
    this.saveAllCollections(next);
  }

  addCollection(config: Omit<CollectionHighlightConfig, 'id'>): void {
    const newId = `col-${Date.now()}`;
    const next = [
      ...this._collections(),
      { ...config, id: newId, visible: config.visible ?? true },
    ];
    this.saveAllCollections(next);
  }

  deleteCollection(id: string): void {
    const next = this._collections().filter((col) => col.id !== id);
    this.saveAllCollections(next);
  }

  resetCollectionsToDefaults(): void {
    this._collections.set(DEFAULT_COLLECTIONS_CONFIG);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(COLLECTIONS_STORAGE_KEY);
      } catch {
        // Fallback gracefully
      }
    }
  }
}

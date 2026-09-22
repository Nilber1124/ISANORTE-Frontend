import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  DEFAULT_HERO_QUICK_ACCESS_ITEMS,
  IsadecorHeroQuickAccessService,
} from './isadecor-hero-quick-access.service';

describe('IsadecorHeroQuickAccessService', () => {
  let service: IsadecorHeroQuickAccessService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        IsadecorHeroQuickAccessService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(IsadecorHeroQuickAccessService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('initializes with default hero quick access items', () => {
    expect(service.items()).toEqual(DEFAULT_HERO_QUICK_ACCESS_ITEMS);
    expect(service.items().length).toBe(4);
  });

  it('updates an item and persists changes to signal', () => {
    service.updateItem('wall-panel-wpc', {
      title: 'Paneles WPC Custom',
      subtitle: 'Nuevo acabado',
    });

    const updated = service.items().find((i) => i.id === 'wall-panel-wpc');
    expect(updated?.title).toBe('Paneles WPC Custom');
    expect(updated?.subtitle).toBe('Nuevo acabado');
    expect(updated?.tag).toBe('Paredes');
  });

  it('resets to defaults when requested', () => {
    service.updateItem('wall-panel-wpc', { title: 'Modificado' });
    expect(service.items()[0].title).toBe('Modificado');

    service.resetToDefaults();
    expect(service.items()[0].title).toBe('Wall Panel WPC');
  });

  it('toggles item visibility and filters in visibleItems', () => {
    expect(service.visibleItems().length).toBe(4);
    service.toggleItemVisibility('wall-panel-wpc');

    expect(service.visibleItems().length).toBe(3);
    expect(service.visibleItems().some((i) => i.id === 'wall-panel-wpc')).toBe(false);

    service.toggleItemVisibility('wall-panel-wpc');
    expect(service.visibleItems().length).toBe(4);
  });

  it('adds and deletes a hero quick access item', () => {
    service.addItem({
      index: '05',
      tag: 'Novedades',
      title: 'Molduras LED',
      subtitle: 'Iluminación perimetral indirecta',
      queryParams: { categoria: 'pisos' },
    });

    expect(service.items().length).toBe(5);
    const added = service.items().find((i) => i.title === 'Molduras LED');
    expect(added).toBeDefined();

    service.deleteItem(added!.id);
    expect(service.items().length).toBe(4);
  });
});

import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { PublicProductImageResponse } from '../../../../../data/models/public-content/public-product-catalog.model';
import { ProductGallery } from './product-gallery';

const image = (
  url: string,
  orden: number,
  varianteSku: string | null,
  esPrincipal = false,
): PublicProductImageResponse => ({ url, alt: null, orden, esPrincipal, varianteSku });

function render(images: PublicProductImageResponse[], variantSku: string | null) {
  const fixture = TestBed.createComponent(ProductGallery);
  fixture.componentRef.setInput('images', images);
  fixture.componentRef.setInput('productName', 'Panel');
  fixture.componentRef.setInput('variantSku', variantSku);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  return el.querySelector('img[fetchpriority="high"]')?.getAttribute('src');
}

describe('ProductGallery por acabado', () => {
  const images = [
    image('general.jpg', 0, null, true),
    image('roble-1.jpg', 1, 'ROBLE'),
    image('roble-2.jpg', 2, 'ROBLE'),
    image('nogal-1.jpg', 3, 'NOGAL'),
  ];

  it('muestra la foto del acabado elegido', () => {
    expect(render(images, 'nogal')).toBe('nogal-1.jpg');
    expect(render(images, 'ROBLE')).toBe('roble-1.jpg');
  });

  it('cae a las generales si el acabado no tiene fotos', () => {
    expect(render(images, 'BLANCO')).toBe('general.jpg');
  });

  it('sin acabado muestra la principal', () => {
    expect(render(images, null)).toBe('general.jpg');
  });

  it('muestra miniaturas de todos los acabados y avisa del acabado al pulsar una', () => {
    const fixture = TestBed.createComponent(ProductGallery);
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('productName', 'Panel');
    fixture.componentRef.setInput('variantSku', 'ROBLE');
    const picked: string[] = [];
    fixture.componentInstance.finishPicked.subscribe((sku) => picked.push(sku));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const thumbs = el.querySelectorAll<HTMLButtonElement>('button[aria-pressed]');
    expect(thumbs.length).toBe(4);
    thumbs[3].click();
    fixture.detectChanges();
    expect(picked).toEqual(['NOGAL']);
  });
});

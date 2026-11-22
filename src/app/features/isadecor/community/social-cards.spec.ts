import { TestBed } from '@angular/core/testing';

import { IsadecorPublicationResponse } from '../../../data/models/isadecor-home/isadecor-home-response.model';
import { CommunityNetwork } from './community-networks';
import { SocialCards } from './social-cards';

const networks: CommunityNetwork[] = [
  { url: 'https://www.instagram.com/isadecor', kind: 'instagram', label: 'Instagram' },
  { url: 'https://www.tiktok.com/@isadecor', kind: 'tiktok', label: 'TikTok' },
  { url: 'https://www.facebook.com/isadecor', kind: 'facebook', label: 'Facebook' },
];

function render(items: IsadecorPublicationResponse[] = []): HTMLElement {
  const fixture = TestBed.createComponent(SocialCards);
  fixture.componentRef.setInput('networks', networks);
  fixture.componentRef.setInput('items', items);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('SocialCards', () => {
  it('shows one card per network that links to the company profile, not to a single video', () => {
    const el = render([
      { red: 'INSTAGRAM', url: 'https://www.instagram.com/reel/ABC/', titulo: 'Instalación', miniaturaUrl: '/thumb.jpg' },
    ]);
    const cards = Array.from(el.querySelectorAll<HTMLAnchorElement>('[data-social-card]'));
    expect(cards.map((card) => card.href)).toEqual(networks.map((network) => network.url));
    expect(cards.every((card) => card.target === '_blank' && card.rel.includes('noopener'))).toBe(true);
  });

  it('uses the thumbnail of the latest video of each network and falls back when there is none', () => {
    const el = render([
      { red: 'INSTAGRAM', url: 'https://www.instagram.com/reel/ABC/', titulo: 'Instalación', miniaturaUrl: '/thumb.jpg' },
    ]);
    expect(el.querySelector('[data-social-card="instagram"] img')?.getAttribute('src')).toBe('/thumb.jpg');
    expect(el.textContent).toContain('Instalación');
    expect(el.querySelector('[data-social-card="tiktok"] img')).toBeNull();
    expect(el.querySelector('[data-social-card="facebook"] img')).toBeNull();
  });
});

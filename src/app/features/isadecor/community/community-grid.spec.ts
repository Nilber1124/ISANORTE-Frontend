import { TestBed } from '@angular/core/testing';

import { IsadecorPublicationResponse } from '../../../data/models/isadecor-home/isadecor-home-response.model';
import { CommunityGrid } from './community-grid';

const instagram: IsadecorPublicationResponse = {
  red: 'INSTAGRAM',
  url: 'https://www.instagram.com/reel/Abc123/',
  titulo: 'Panel WPC',
  miniaturaUrl: 'https://res.cloudinary.com/a.webp',
};

describe('CommunityGrid', () => {
  function create(items: IsadecorPublicationResponse[]) {
    const fixture = TestBed.createComponent(CommunityGrid);
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
    return fixture;
  }

  it('renders one thumbnail button per video without loading any third-party frame', () => {
    const element = create([instagram]).nativeElement as HTMLElement;

    expect(element.querySelectorAll('button').length).toBe(1);
    expect(element.querySelector('img')?.getAttribute('src')).toBe(instagram.miniaturaUrl);
    expect(element.querySelector('iframe')).toBeNull();
  });

  it('opens the Instagram player only after a click and closes it again', () => {
    const fixture = create([instagram]);
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector('button')!.click();
    fixture.detectChanges();
    expect(element.querySelector('iframe')?.getAttribute('src')).toBe(
      'https://www.instagram.com/reel/Abc123/embed/',
    );
    expect(element.querySelector('[role="dialog"]')).toBeTruthy();

    (element.querySelector('[role="dialog"] button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(element.querySelector('iframe')).toBeNull();
  });

  it('embeds TikTok videos by id', () => {
    const fixture = create([
      {
        red: 'TIKTOK',
        url: 'https://www.tiktok.com/@isadecor/video/7106594312292453675',
        titulo: null,
        miniaturaUrl: null,
      },
    ]);
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector('button')!.click();
    fixture.detectChanges();

    expect(element.querySelector('iframe')?.getAttribute('src')).toBe(
      'https://www.tiktok.com/player/v1/7106594312292453675',
    );
  });

  it('never embeds a URL outside the network and only offers the external link', () => {
    const fixture = create([{ ...instagram, url: 'https://evil.example/reel/Abc123/' }]);
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector('button')!.click();
    fixture.detectChanges();

    expect(element.querySelector('iframe')).toBeNull();
    expect(element.querySelector('[role="dialog"] a')).toBeTruthy();
  });
});

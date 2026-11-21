import { describe, expect, it } from 'vitest';

import { pickCommunityNetworks } from './community-networks';

describe('pickCommunityNetworks', () => {
  it('reconoce Facebook, Instagram y TikTok y descarta el resto', () => {
    const result = pickCommunityNetworks([
      { nombre: 'Facebook', url: 'https://facebook.com/x', icono: 'facebook' },
      { nombre: 'Instagram', url: 'https://instagram.com/x', icono: null },
      { nombre: 'TikTok', url: 'https://tiktok.com/@x', icono: 'tiktok' },
      { nombre: 'LinkedIn', url: 'https://linkedin.com/x', icono: 'linkedin' },
    ]);
    expect(result.map((network) => network.kind)).toEqual(['facebook', 'instagram', 'tiktok']);
  });
});

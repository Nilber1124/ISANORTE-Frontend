import { PublicSiteSocialNetwork } from '../../../data/models/public-content/public-site.model';

export interface CommunityNetwork {
  url: string;
  kind: 'instagram' | 'tiktok';
  label: string;
}

/** De las redes de la empresa deja solo Instagram y TikTok, con su tipo para elegir el icono. */
export function pickCommunityNetworks(
  networks: readonly Pick<PublicSiteSocialNetwork, 'nombre' | 'url' | 'icono'>[],
): CommunityNetwork[] {
  const result: CommunityNetwork[] = [];
  for (const network of networks) {
    const name = (network.icono || network.nombre).toLowerCase();
    if (name.includes('tiktok')) result.push({ url: network.url, kind: 'tiktok', label: 'TikTok' });
    else if (name.includes('instagram') || name === 'ig')
      result.push({ url: network.url, kind: 'instagram', label: 'Instagram' });
  }
  return result;
}

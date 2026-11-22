/** Clave canónica inicial. Podrá sustituirse por resolución de tenant en una fase posterior. */
export const PUBLIC_SITE_KEY = 'isanorte';

/** Slug canónico de la unidad de negocio ISADECOR. */
export const ISADECOR_UNIT_SLUG = 'isadecor';

/** Alias de compatibilidad para la unidad ISADECOR. */
export const ISADECOR_SLUG = ISADECOR_UNIT_SLUG;

/**
 * Perfiles oficiales de ISADECOR. Son propios de la tienda: la empresa registrada en el sistema es ISANORTE y sus
 * redes (las del sitio de construcción) no deben aparecer en ISADECOR.
 */
export const ISADECOR_SOCIAL_NETWORKS = [
  { kind: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/isadecor.pee' },
  { kind: 'tiktok', label: 'TikTok', url: 'https://www.tiktok.com/@isadeco.pe' },
  { kind: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/isadecor.pe' },
] as const;

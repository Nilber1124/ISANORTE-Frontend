/** Applies responsive Cloudinary delivery options to public image URLs. */
export function cloudinaryImageUrl(value: string, width: number): string {
  try {
    const url = new URL(value);
    if (url.hostname !== 'res.cloudinary.com' || !url.pathname.includes('/image/upload/')) {
      return value;
    }

    url.pathname = url.pathname.replace(
      '/image/upload/',
      `/image/upload/f_auto,q_auto,w_${width}/`,
    );
    return url.toString();
  } catch {
    return value;
  }
}

export function cloudinaryImageSrcSet(value: string, widths: readonly number[]): string | null {
  try {
    const url = new URL(value);
    if (url.hostname !== 'res.cloudinary.com' || !url.pathname.includes('/image/upload/')) {
      return null;
    }

    return widths.map((width) => `${cloudinaryImageUrl(value, width)} ${width}w`).join(', ');
  } catch {
    return null;
  }
}

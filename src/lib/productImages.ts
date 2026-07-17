/** Product image queue helpers — first entry is always the banner / primary. */

export function normalizeProductImages(
  images?: string[] | null,
  fallbackImage?: string | null,
): { images: string[]; image: string } {
  const list = (Array.isArray(images) ? images : [])
    .map(String)
    .map((u) => u.trim())
    .filter(Boolean);

  if (!list.length && fallbackImage) {
    const primary = String(fallbackImage).trim();
    if (primary) list.push(primary);
  }

  return {
    images: list,
    image: list[0] ?? "",
  };
}

/** Banner / card image: always images[0], then legacy `image` field. */
export function getProductDisplayImage(product: {
  image?: string | null;
  images?: string[] | null;
}): string {
  return normalizeProductImages(product.images, product.image).image;
}

/** Move an image to the front of the queue (new primary / banner). */
export function moveImageToFront(images: string[], index: number): string[] {
  if (index <= 0 || index >= images.length) return [...images];
  const next = [...images];
  const [moved] = next.splice(index, 1);
  next.unshift(moved);
  return next;
}

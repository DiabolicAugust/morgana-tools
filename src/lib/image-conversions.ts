/** Same values used by image-format-converter-tool (canonical). */
export type ImageFormat = 'webp' | 'png' | 'jpeg' | 'avif' | 'heic';

export type ImageConversionRoute = {
  slug: string;
  from: ImageFormat;
  to: ImageFormat;
};

/**
 * All supported conversions; slug must match `/tools/[slug]` and `generateStaticParams`.
 */
export const IMAGE_CONVERSION_ROUTES: ImageConversionRoute[] = [
  { slug: 'webp-to-png', from: 'webp', to: 'png' },
  { slug: 'webp-to-jpg', from: 'webp', to: 'jpeg' },
  { slug: 'webp-to-avif', from: 'webp', to: 'avif' },
  { slug: 'png-to-jpg', from: 'png', to: 'jpeg' },
  { slug: 'png-to-webp', from: 'png', to: 'webp' },
  { slug: 'png-to-avif', from: 'png', to: 'avif' },
  { slug: 'jpg-to-png', from: 'jpeg', to: 'png' },
  { slug: 'jpg-to-webp', from: 'jpeg', to: 'webp' },
  { slug: 'jpg-to-avif', from: 'jpeg', to: 'avif' },
  { slug: 'avif-to-png', from: 'avif', to: 'png' },
  { slug: 'avif-to-jpg', from: 'avif', to: 'jpeg' },
  { slug: 'avif-to-webp', from: 'avif', to: 'webp' },
  { slug: 'heic-to-jpg', from: 'heic', to: 'jpeg' },
];

const FORMAT_ORDER: Record<ImageFormat, number> = {
  webp: 0,
  png: 1,
  jpeg: 2,
  avif: 3,
  heic: 4,
};

export function sortedSourceFormats(): ImageFormat[] {
  const set = new Set(IMAGE_CONVERSION_ROUTES.map((r) => r.from));
  return Array.from(set).sort((a, b) => FORMAT_ORDER[a] - FORMAT_ORDER[b]);
}

export function sortedTargetFormatsForSource(from: ImageFormat): ImageFormat[] {
  const set = new Set(
    IMAGE_CONVERSION_ROUTES.filter((r) => r.from === from).map((r) => r.to),
  );
  return Array.from(set).sort((a, b) => FORMAT_ORDER[a] - FORMAT_ORDER[b]);
}

export function slugForConversion(
  from: ImageFormat,
  to: ImageFormat,
): string | undefined {
  return IMAGE_CONVERSION_ROUTES.find((r) => r.from === from && r.to === to)
    ?.slug;
}

export function imageConversionPairForSlug(
  slug: string,
): ImageConversionRoute | undefined {
  return IMAGE_CONVERSION_ROUTES.find((r) => r.slug === slug);
}

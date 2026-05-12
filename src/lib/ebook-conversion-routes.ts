import type { EbookFormatId } from './ebook-formats';
import {
  ebookSlugSegment,
  EBOOK_CATEGORY_NAV_ORDER,
  EBOOK_FORMAT_CATEGORY,
} from './ebook-formats';

export type EbookConversionRoute = {
  slug: string;
  from: EbookFormatId;
  to: EbookFormatId;
};

function edge(from: EbookFormatId, to: EbookFormatId): EbookConversionRoute {
  return {
    slug: `${ebookSlugSegment(from)}-to-${ebookSlugSegment(to)}`,
    from,
    to,
  };
}

function symmetrical(a: EbookFormatId, b: EbookFormatId): EbookConversionRoute[] {
  return [edge(a, b), edge(b, a)];
}

/** All supported directed conversions that ship an implementation client-side. */
export const EBOOK_CONVERSION_ROUTES: EbookConversionRoute[] = [
  ...symmetrical('txt', 'markdown'),
  ...symmetrical('txt', 'html'),
  ...symmetrical('txt', 'epub'),
  ...symmetrical('txt', 'fb2'),
  ...symmetrical('txt', 'pdf'),
  ...symmetrical('txt', 'docx'),
  ...symmetrical('txt', 'rtf'),
  ...symmetrical('txt', 'pml'),

  ...symmetrical('markdown', 'html'),

  ...symmetrical('markdown', 'epub'),
  ...symmetrical('html', 'epub'),

  edge('odt', 'txt'),
  ...symmetrical('cbz', 'pages_zip'),
];

const ROUTE_BY_SLUG = new Map(
  EBOOK_CONVERSION_ROUTES.map((r) => [r.slug, r]),
);

const ROUTE_PAIR_KEYS = new Set(
  EBOOK_CONVERSION_ROUTES.map((r) => `${r.from}\x00${r.to}`),
);

/** Returns true when a client-side converter path is registered for this directed pair. */
export function ebookPairIsSupported(from: EbookFormatId, to: EbookFormatId): boolean {
  return ROUTE_PAIR_KEYS.has(`${from}\x00${to}`);
}

export function ebookConversionPairForSlug(
  slug: string,
): EbookConversionRoute | undefined {
  return ROUTE_BY_SLUG.get(slug);
}

export function slugForEbookConversion(
  from: EbookFormatId,
  to: EbookFormatId,
): string | undefined {
  const want = `${ebookSlugSegment(from)}-to-${ebookSlugSegment(to)}`;
  return ROUTE_BY_SLUG.has(want) ? want : undefined;
}


function comparePresentationOrder(a: EbookFormatId, b: EbookFormatId): number {
  const ca = EBOOK_CATEGORY_NAV_ORDER.indexOf(EBOOK_FORMAT_CATEGORY[a]);
  const cb = EBOOK_CATEGORY_NAV_ORDER.indexOf(EBOOK_FORMAT_CATEGORY[b]);
  if (ca !== cb) return ca - cb;
  return String(a).localeCompare(String(b));
}

/** Stable category ordering suitable for selects + optgroups. */
export function ebookFormatsPresentationOrder(ids: Iterable<EbookFormatId>): EbookFormatId[] {
  return [...new Set(ids)].sort(comparePresentationOrder);
}

export function canonicalSourceFormatsOrdered(): EbookFormatId[] {
  const uniq = [...new Set(EBOOK_CONVERSION_ROUTES.map((r) => r.from))];
  return ebookFormatsPresentationOrder(uniq);
}

/** Allowed targets given a source selection (excluding same-format placeholders). */
export function targetsFromSource(from: EbookFormatId): EbookFormatId[] {
  const out = new Set<EbookFormatId>();
  for (const r of EBOOK_CONVERSION_ROUTES) {
    if (r.from !== from || r.from === r.to) continue;
    out.add(r.to);
  }
  return ebookFormatsPresentationOrder(out);
}

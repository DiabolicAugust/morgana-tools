import { SITE_NAME } from '@/lib/site';

/** Homepage H1 — also the homepage document title (before the `| ${SITE_NAME}` template). */
export const HOME_PRIMARY_HEADLINE =
  'Convert and fix files in your browser';

export const HOME_META_DESCRIPTION =
  'Convert and fix files in your browser with free helpers for ebooks, images (HEIC/WebP/AVIF/PNG), JSON, Base64, URLs, timestamps, hashes, and passwords.';

/** Organization / WebSite JSON-LD — same facts as the meta description, slightly fuller. */
export const HOME_JSONLD_SITE_DESCRIPTION = `${SITE_NAME} lists free converters for ebooks, documents, images, UTF-8 text, JSON and API payloads, passwords, and hashes. Most flows run in your browser so files usually stay on your device; each page explains DRM limits, format edges, and when a CDN script is required.`;

/** Root layout default description when a route does not define its own. */
export const SITE_DEFAULT_META_DESCRIPTION = HOME_META_DESCRIPTION;

/** Open Graph / Twitter title for `/` and layout fallbacks. */
export const HOME_OPENGRAPH_TITLE = `${SITE_NAME} — ${HOME_PRIMARY_HEADLINE}`;

/** Alt text for default OG/Twitter image routes. */
export const SITE_SHARE_IMAGE_ALT = HOME_OPENGRAPH_TITLE;

/** Copy inside generated share images (`next/og`) — keep short for the card layout. */
export const SITE_OG_CARD_SUBLINE =
  'Ebooks, images, JSON, Base64, URLs, timestamps, hashes & passwords—local in the tab when the tool says so.';

/** Visible next to the wordmark in the header (sm+). */
export const SITE_HEADER_TAGLINE =
  'Free browser converters for files, images & data';

/** Footer blurb — same positioning as the rest of the site. */
export const SITE_FOOTER_TAGLINE =
  'Browser-first converters for ebooks, images, and developer helpers—the site is hosted like any other webpage; conversions and parsers run on your machine when each tool promises that behavior.';

/** `<title>` default when a segment does not set `metadata.title`. */
export const SITE_TITLE_DEFAULT = `${SITE_NAME} — free browser converters & tools`;

export const SITE_META_KEYWORDS = [
  'free online tools',
  'browser converters',
  'image converter online',
  'ebook converter',
  'json formatter online',
  'developer utilities',
  SITE_NAME.toLowerCase(),
] as const;

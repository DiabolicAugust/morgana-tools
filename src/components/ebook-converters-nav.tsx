import Link from 'next/link';

import { ebookConversionPairForSlug } from '@/lib/ebook-conversion-routes';
import { getEbooksForDirectory } from '@/lib/tools';

function ebookFormatAbbrev(slug: string): string {
  if (slug === 'txt-normalize') return 'NORM';

  const route = ebookConversionPairForSlug(slug);
  if (route) {
    const fromSeg = route.from.replace(/_/g, '');
    const toSeg = route.to.replace(/_/g, '');
    return `${fromSeg}›${toSeg}`.toUpperCase();
  }

  return slug.split('-')[0]?.toUpperCase() ?? slug.toUpperCase();
}

type Props = { currentSlug: string };

/** Catalogue of converters (CloudConvert-style tiles of local Morgana flows). */
export function EbookConvertersStrip({ currentSlug }: Props) {
  const rows = getEbooksForDirectory();

  return (
    <section aria-labelledby="ebook-matrix-heading" className="space-y-4">
      <div>
        <h2
          id="ebook-matrix-heading"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Available converters
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Tiles open Morgana-hosted conversion pairs or TXT normalization. See{' '}
          <a
            href="https://cloudconvert.com/ebook-converter"
            className="text-violet-700 underline underline-offset-2 hover:text-violet-600 dark:text-violet-300 dark:hover:text-violet-200"
            rel="noopener noreferrer"
            target="_blank"
          >
            CloudConvert&apos;s ebook hub
          </a>
          {' '}
          for broader coverage—we focus on open ZIP/XML manuscripts; AZW, MOBI, DRM, or RAR-heavy
          comics still need Calibre or another desktop exporter first.
        </p>
      </div>
      <ul className="flex flex-wrap gap-2" aria-label="Ebook converters">
        {rows.map((tool) => {
          const abbrev = ebookFormatAbbrev(tool.slug);
          const active = tool.slug === currentSlug;
          return (
            <li key={tool.slug}>
              <Link
                href={`/tools/${tool.slug}`}
                aria-current={active ? 'page' : undefined}
                title={tool.title}
                className={
                  active
                    ? 'inline-flex min-h-[34px] items-center rounded-full border border-violet-400 bg-violet-100 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wide text-violet-900 dark:border-violet-700 dark:bg-violet-950/60 dark:text-violet-100'
                    : 'inline-flex min-h-[34px] items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wide text-zinc-900 transition hover:border-violet-300 hover:bg-violet-50 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-50 dark:hover:border-violet-600 dark:hover:bg-violet-950/40'
                }
              >
                {abbrev}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

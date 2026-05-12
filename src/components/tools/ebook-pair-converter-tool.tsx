'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  canonicalSourceFormatsOrdered,
  ebookFormatsPresentationOrder,
  slugForEbookConversion,
  targetsFromSource,
} from '@/lib/ebook-conversion-routes';
import type { EbookFormatId } from '@/lib/ebook-formats';
import {
  EBOOK_CATEGORY_LABELS,
  EBOOK_CATEGORY_NAV_ORDER,
  EBOOK_FORMAT_CATEGORY,
  EBOOK_FORMAT_DISPLAY,
  acceptForFormat,
} from '@/lib/ebook-formats';
import { ebookDownloadBaseName, runEbookConversion } from '@/lib/run-ebook-conversion';

export type EbookSiblingTool = { slug: string; title: string };

type OptGroup = {
  readonly label: string;
  readonly formats: readonly EbookFormatId[];
};

function optGroupsFromFormats(ids: Iterable<EbookFormatId>): OptGroup[] {
  const uniq = [...new Set(ids)];
  const buckets = new Map<string, EbookFormatId[]>();
  for (const fmt of uniq) {
    const cat = EBOOK_FORMAT_CATEGORY[fmt];
    const bucket = buckets.get(cat) ?? [];
    bucket.push(fmt);
    buckets.set(cat, bucket);
  }
  const out: OptGroup[] = [];
  for (const cat of EBOOK_CATEGORY_NAV_ORDER) {
    const fmts = ebookFormatsPresentationOrder(buckets.get(cat) ?? []);
    if (fmts.length === 0) continue;
    out.push({
      label: EBOOK_CATEGORY_LABELS[cat],
      formats: fmts,
    });
  }
  return out;
}

function labelForFmt(fmt: EbookFormatId): string {
  return EBOOK_FORMAT_DISPLAY[fmt];
}

function spotlightForFmt(fmt: EbookFormatId): string {
  switch (fmt) {
    case 'txt':
      return 'Plain text—a flexible interchange for OCR dumps, captions, scripting, or stripped archives.';
    case 'markdown':
      return 'Portable markup for notebooks and repos; Markdown ↔ HTML crossings use cautious converters—not an authoring IDE.';
    case 'html':
      return 'Archived web markup—sections are sanitized and rebundled; scripts lifted from older files never execute here.';
    case 'epub':
      return 'Reflowable EPUB bundles XHTML chapters in a ZIP; Morgana stitches the spine offline in-browser.';
    case 'fb2':
      return 'FictionBook XML that shines for multilingual fiction swaps and long-term archiving.';
    case 'pdf':
      return 'Keeps selectable text when the upstream PDF exposes it—flat scans remain empty unless you OCR elsewhere first.';
    case 'docx':
      return 'Word’s OOXML package—fine for tossing drafts around before committing to rigid layout tooling.';
    case 'odt':
      return 'Libre/OpenDocument text—we read it locally and emit cleaned UTF‑8 plaintext for downstream tooling.';
    case 'rtf':
      return 'Legacy rich-text—control words peel away for prose, or Morgana emits a minimal RTF afterward.';
    case 'pml':
      return 'Palm Reader markup—we trim directives for plain prose output.';
    case 'cbz':
      return 'Comic ZIP of ordered rasters—PNG/JPEG/WebP stacks ready for shuffling.';
    case 'pages_zip':
      return 'Exports our Morgana-packed page images back into a comic-ready archive.';
    default: {
      const _n: never = fmt;
      return _n;
    }
  }
}

function looksLikeInput(file: File, expected: EbookFormatId): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  switch (expected) {
    case 'txt':
      return (
        type === 'text/plain' ||
        (!type && name.endsWith('.txt')) ||
        name.endsWith('.txt')
      );
    case 'markdown':
      return (
        type.includes('markdown') ||
        (!type &&
          (name.endsWith('.md') ||
            name.endsWith('.markdown') ||
            name.endsWith('.txt'))) ||
        name.endsWith('.md') ||
        name.endsWith('.markdown')
      );
    case 'html':
      return (
        type.includes('html') ||
        (!type &&
          (name.endsWith('.html') || name.endsWith('.htm') || name.endsWith('.xhtml'))) ||
        name.endsWith('.html') ||
        name.endsWith('.htm')
      );
    case 'epub':
      return type.includes('epub') || (!type && name.endsWith('.epub')) || name.endsWith('.epub');
    case 'pdf':
      return type === 'application/pdf' || (!type && name.endsWith('.pdf')) || name.endsWith('.pdf');
    case 'docx':
      return (
        type.includes('officedocument.wordprocessingml.document') ||
        (!type && name.endsWith('.docx')) ||
        name.endsWith('.docx')
      );
    case 'odt':
      return (
        type.includes('application/vnd.oasis.opendocument.text') ||
        (!type && name.endsWith('.odt')) ||
        name.endsWith('.odt')
      );
    case 'rtf':
      return (
        type.includes('rtf') ||
        (!type && name.endsWith('.rtf')) ||
        name.endsWith('.rtf')
      );
    case 'fb2':
      return type.includes('xml') || (!type && name.endsWith('.fb2')) || name.endsWith('.fb2');
    case 'pml':
      return (
        (!type &&
          (name.endsWith('.pml') ||
            name.endsWith('.prc') ||
            name.endsWith('.txt'))) ||
        name.endsWith('.pml') ||
        name.endsWith('.prc')
      );
    case 'cbz':
      return (
        type.includes('zip') ||
        (!type &&
          (name.endsWith('.cbz') ||
            name.endsWith('.zip') ||
            name.endsWith('.cbc'))) ||
        name.endsWith('.cbz') ||
        name.endsWith('.zip')
      );
    case 'pages_zip':
      return (
        type.includes('zip') ||
        (!type && name.endsWith('.zip')) ||
        name.endsWith('.zip')
      );
    default: {
      const _n: never = expected;
      return _n;
    }
  }
}

function FlowArrow() {
  return (
    <span
      className="flex shrink-0 items-center gap-0.5 text-violet-500 dark:text-violet-400"
      aria-hidden
    >
      <span className="h-px w-4 bg-gradient-to-r from-transparent to-current sm:w-6" />
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h12m0 0-4-4m4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

const selectCls =
  'min-w-[5.5rem] flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2.5 font-mono text-xs font-semibold tracking-tight text-zinc-900 shadow-sm outline-none transition-colors focus-visible:border-violet-500 focus-visible:ring-2 focus-visible:ring-violet-500/30 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 sm:text-sm';

type Props = {
  from: EbookFormatId;
  to: EbookFormatId;
  currentSlug?: string;
  siblingEbookTools?: EbookSiblingTool[];
};

export function EbookPairConverterTool({
  from,
  to,
  currentSlug,
  siblingEbookTools,
}: Props) {
  const router = useRouter();
  const inputId = useId();
  const fromSelectId = useId();
  const toSelectId = useId();

  const [error, setError] = useState<string | null>(null);
  const [downUrl, setDownUrl] = useState<string | null>(null);
  const [downName, setDownName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragDepth, setDragDepth] = useState(0);
  const dragRef = useRef(0);

  const sourceFormats = useMemo(() => canonicalSourceFormatsOrdered(), []);
  const sourceGroups = useMemo(
    () => optGroupsFromFormats(sourceFormats),
    [sourceFormats],
  );

  const targetIds = useMemo(() => targetsFromSource(from), [from]);
  const targetGroups = useMemo(() => optGroupsFromFormats(targetIds), [targetIds]);

  useEffect(() => {
    return () => {
      if (downUrl) URL.revokeObjectURL(downUrl);
    };
  }, [downUrl]);

  function resetResult() {
    setDownUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    setDownName(null);
  }

  if (from === to) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400" role="alert">
        Converter props must point at different formats—double-check slug wiring.
      </p>
    );
  }

  function navigateToConversion(nextFrom: EbookFormatId, nextTo: EbookFormatId) {
    const slug = slugForEbookConversion(nextFrom, nextTo);
    if (!slug || slug === currentSlug) return;
    router.push(`/tools/${slug}`);
  }

  function onFromChange(nextFrom: EbookFormatId) {
    const targets = targetsFromSource(nextFrom);
    const nextTo = targets.includes(to) ? to : targets[0];
    navigateToConversion(nextFrom, nextTo ?? to);
  }

  function onToChange(nextTo: EbookFormatId) {
    navigateToConversion(from, nextTo);
  }

  async function handleFile(file: File | null) {
    resetResult();
    setError(null);
    if (!file) return;

    if (!looksLikeInput(file, from)) {
      setError(`Pick a ${labelForFmt(from)} file.`);
      return;
    }

    setBusy(true);
    try {
      const blob = await runEbookConversion(file, from, to);
      const dn = ebookDownloadBaseName(file.name, to);
      const url = URL.createObjectURL(blob);
      setDownUrl(url);
      setDownName(dn);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed.');
    } finally {
      setBusy(false);
    }
  }

  function onDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (busy) return;
    dragRef.current += 1;
    if (dragRef.current === 1) setDragDepth(1);
  }

  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    dragRef.current -= 1;
    if (dragRef.current <= 0) {
      dragRef.current = 0;
      setDragDepth(0);
    }
  }

  const siblings =
    siblingEbookTools?.filter((t) => t.slug !== currentSlug) ?? [];
  const dragging = dragDepth > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 shadow-sm dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-950/80">
        <div
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-500"
          aria-hidden
        />
        <div className="absolute right-3 top-4 sm:right-4 sm:top-5">
          <span className="inline-flex items-center rounded-md border border-teal-200/80 bg-teal-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-teal-900 dark:border-teal-800/60 dark:bg-teal-950/50 dark:text-teal-200">
            Offline friendly
          </span>
        </div>

        <div className="flex flex-col gap-6 p-5 pt-7 sm:p-7 sm:pt-9">
          <div className="flex flex-col gap-3 pr-24 sm:pr-32">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Conversion matrix
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-[13rem]">
                <label
                  htmlFor={fromSelectId}
                  className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                >
                  Convert from
                </label>
                <select
                  id={fromSelectId}
                  value={from}
                  disabled={busy}
                  className={selectCls}
                  aria-label={`Source ${labelForFmt(from)}`}
                  onChange={(e) => onFromChange(e.target.value as EbookFormatId)}
                >
                  {sourceGroups.map((g) => (
                    <optgroup key={g.label} label={g.label}>
                      {g.formats.map((fmt) => (
                        <option key={fmt} value={fmt}>
                          {labelForFmt(fmt)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="hidden shrink-0 sm:flex sm:pb-3" aria-hidden>
                <FlowArrow />
              </div>
              <div className="flex justify-center pb-2 sm:hidden" aria-hidden>
                <svg
                  className="size-6 text-violet-500 dark:text-violet-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14m0 0-4-4m4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-[13rem]">
                <label
                  htmlFor={toSelectId}
                  className="text-[10px] font-medium uppercase tracking-wide text-teal-800 dark:text-teal-300"
                >
                  Convert to
                </label>
                <select
                  id={toSelectId}
                  value={to}
                  disabled={busy}
                  className={`${selectCls} border-teal-300/70 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/40`}
                  aria-label={`Target ${labelForFmt(to)}`}
                  onChange={(e) => onToChange(e.target.value as EbookFormatId)}
                >
                  {targetGroups.map((g) => (
                    <optgroup key={g.label} label={g.label}>
                      {g.formats.map((fmt) => (
                        <option key={fmt} value={fmt}>
                          {labelForFmt(fmt)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Provide{' '}
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                {labelForFmt(from)}
              </span>{' '}
              and Morgana returns{' '}
              <span className="font-semibold text-teal-800 dark:text-teal-300">
                {labelForFmt(to)}
              </span>
              . Parsing stays tab-local aside from CDN helpers PDF.js may grab the first time a PDF crosses the boundary—everything else skips a Morgana upload queue.
            </p>
          </div>

          <div
            role="group"
            aria-label={`${labelForFmt(from)} file`}
            className={
              dragging
                ? 'cursor-copy rounded-xl border-2 border-dashed border-teal-500 bg-teal-50/70 p-8 transition-colors dark:border-teal-400 dark:bg-teal-950/30'
                : 'cursor-copy rounded-xl border-2 border-dashed border-zinc-300 bg-white/70 p-8 transition-colors dark:border-zinc-700 dark:bg-zinc-950/60'
            }
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              dragRef.current = 0;
              setDragDepth(0);
              if (busy) return;
              void handleFile(e.dataTransfer.files?.[0] ?? null);
            }}
          >
            <input
              id={inputId}
              type="file"
              accept={acceptForFormat(from)}
              disabled={busy}
              className="sr-only"
              onChange={(ev) =>
                void handleFile(ev.target.files?.[0] ?? null)
              }
            />

            <label
              htmlFor={inputId}
              className={`flex cursor-pointer flex-col items-center gap-3 text-center ${
                busy ? 'pointer-events-none opacity-60' : ''
              }`}
            >
              <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                Select source file
              </span>
              <span className="max-w-lg text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                One DRM-free manuscript at a time—Kindle blobs and other storefront locks belong in Calibre or another desktop exporter before you arrive here.
              </span>
            </label>
          </div>

          {busy ? (
            <p
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
            >
              <span
                className="inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"
                aria-hidden
              />
              Converting… large EPUBs may hitch the UI for a beat.
            </p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          {downUrl && downName ? (
            <div className="flex flex-col gap-4 rounded-xl border border-teal-200/80 bg-teal-50/40 p-5 dark:border-teal-900/50 dark:bg-teal-950/20">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Download ready (<span className="font-mono">{downName}</span>)
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={downUrl}
                  download={downName}
                  className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  Save conversion
                </a>
                <button
                  type="button"
                  onClick={() => {
                    resetResult();
                  }}
                  className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Clear download
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950/50">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          About this source format
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {spotlightForFmt(from)}
        </p>
      </div>

      {siblings.length > 0 ? (
        <section aria-labelledby="sibling-ebook-heading" className="space-y-3">
          <div className="flex flex-col gap-1">
            <h2
              id="sibling-ebook-heading"
              className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Other converters
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Peek at adjacent pairings—all still wired for in-browser swaps.
            </p>
          </div>
          <ul className="flex flex-wrap gap-2">
            {siblings.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/tools/${t.slug}`}
                  className="inline-flex max-w-[20rem] items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium leading-snug text-zinc-800 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-900 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:border-teal-700 dark:hover:bg-teal-950/40 dark:hover:text-teal-100"
                >
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

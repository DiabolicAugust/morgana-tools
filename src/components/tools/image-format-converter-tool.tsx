'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import type { ImageFormat } from '@/lib/image-conversions';
import {
  slugForConversion,
  sortedSourceFormats,
  sortedTargetFormatsForSource,
} from '@/lib/image-conversions';

export type { ImageFormat } from '@/lib/image-conversions';

function dotExtFor(f: ImageFormat): string {
  return `.${extFor(f)}`.toUpperCase();
}

function extFor(f: ImageFormat): string {
  return f === 'jpeg' ? 'jpg' : f;
}

function acceptFor(f: ImageFormat): string {
  switch (f) {
    case 'webp':
      return 'image/webp,.webp';
    case 'png':
      return 'image/png,.png';
    case 'jpeg':
      return 'image/jpeg,.jpg,.jpeg,.jpe';
    case 'avif':
      return 'image/avif,.avif';
    case 'heic':
      return 'image/heic,image/heif,.heic,.heif';
  }
}

/** One-line spotlight for people landing from search (“what’s WEBP”). */
function formatSpotlight(format: ImageFormat): string {
  switch (format) {
    case 'webp':
      return 'WebP blends efficient lossy or lossless compression with optional transparency—a modern default on the web.';
    case 'png':
      return 'PNG keeps edges crisp with full alpha channels—reach for fidelity over micro file sizes.';
    case 'jpeg':
      return 'JPEG is the universally accepted photo codec; transparency is flattened away.';
    case 'avif':
      return 'AVIF often squeezes tighter than JPEG or WebP, but encode/decode stacks still vary wildly by browser.';
    case 'heic':
      return 'HEIC (HEIF) keeps iPhones efficient; Morgana converts to JPEG locally for apps that insist on JPG.';
  }
}

function looksLikeInput(file: File, expected: ImageFormat): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  switch (expected) {
    case 'webp':
      return type === 'image/webp' || name.endsWith('.webp');
    case 'png':
      return type === 'image/png' || name.endsWith('.png');
    case 'jpeg':
      return (
        type === 'image/jpeg' ||
        name.endsWith('.jpg') ||
        name.endsWith('.jpeg') ||
        name.endsWith('.jpe')
      );
    case 'avif':
      return type === 'image/avif' || name.endsWith('.avif');
    case 'heic':
      return (
        type === 'image/heic' ||
        type === 'image/heif' ||
        name.endsWith('.heic') ||
        name.endsWith('.heif')
      );
  }
}

async function convertWithHeic2AnyJpeg(file: File): Promise<Blob> {
  const mod = await import('heic2any');
  const heic2any = mod.default;
  const result = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.92,
  });
  const blob = Array.isArray(result) ? result[0] : result;
  if (!blob) throw new Error('HEIC conversion returned empty result.');
  return blob as Blob;
}

async function bitmapFromFile(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    throw new Error(
      'Could not decode this image in your browser. Try another browser (e.g. Chrome for AVIF), or check that the file is not corrupted.',
    );
  }
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  to: ImageFormat,
): Promise<Blob> {
  if (to === 'png') {
    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Could not create PNG.'))),
        'image/png',
      );
    });
  }
  if (to === 'jpeg') {
    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Could not create JPEG.'))),
        'image/jpeg',
        0.92,
      );
    });
  }
  if (to === 'webp') {
    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) =>
          b
            ? resolve(b)
            : reject(
                new Error(
                  'WEBP export is not supported in this browser. Try Chrome or Edge.',
                ),
              ),
        'image/webp',
        0.92,
      );
    });
  }
  if (to === 'avif') {
    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (!b) {
            reject(
              new Error(
                'AVIF encoding is not supported in this browser. Try the latest Chrome or Edge.',
              ),
            );
            return;
          }
          if (b.type !== 'image/avif') {
            reject(
              new Error(
                'AVIF encoding is not supported in this browser. Try the latest Chrome or Edge.',
              ),
            );
            return;
          }
          resolve(b);
        },
        'image/avif',
        0.85,
      );
    });
  }
  throw new Error('Unsupported output format.');
}

async function convertFile(
  file: File,
  from: ImageFormat,
  to: ImageFormat,
): Promise<Blob> {
  if (from === 'heic') {
    if (to !== 'jpeg') {
      throw new Error('HEIC input is only converted to JPG in this tool.');
    }
    return convertWithHeic2AnyJpeg(file);
  }

  const bitmap = await bitmapFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Canvas is not available.');
  }
  if (to === 'jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  return canvasToBlob(canvas, to);
}

export type SiblingImageConversion = { slug: string; title: string };

type Props = {
  from: ImageFormat;
  to: ImageFormat;
  /** Page slug; used to hide the current tool from the sibling strip. */
  currentSlug?: string;
  /** Curated “other pairs” like CloudConvert’s conversion matrix, but local links only. */
  siblingConversions?: SiblingImageConversion[];
};

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
  'min-w-[5.5rem] flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2.5 font-mono text-sm font-semibold text-zinc-900 shadow-sm outline-none transition-colors focus-visible:border-violet-500 focus-visible:ring-2 focus-visible:ring-violet-500/30 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50';

export function ImageFormatConverterTool({
  from,
  to,
  currentSlug,
  siblingConversions,
}: Props) {
  const router = useRouter();
  const inputId = useId();
  const fromSelectId = useId();
  const toSelectId = useId();
  const [error, setError] = useState<string | null>(null);
  const [downName, setDownName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isFileDragOver, setIsFileDragOver] = useState(false);
  const fileDragDepthRef = useRef(0);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [outputUrl, previewUrl]);

  function resetResult() {
    setOutputUrl(null);
    setPreviewUrl(null);
    setDownName(null);
  }

  if (from === to) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400" role="alert">
        Props{' '}
        <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">from</code>{' '}
        and{' '}
        <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">to</code>{' '}
        must differ.
      </p>
    );
  }

  async function handleFile(file: File | null) {
    setError(null);
    resetResult();
    if (!file) return;

    if (!looksLikeInput(file, from)) {
      setError(`Choose a ${dotExtFor(from)} file.`);
      return;
    }

    setIsConverting(true);
    try {
      const blob = await convertFile(file, from, to);
      setOutputUrl(URL.createObjectURL(blob));
      const base = file.name.replace(/\.[^.]+$/, '');
      setDownName(`${base || 'converted'}.${extFor(to)}`);
      if (from !== 'heic') {
        setPreviewUrl(URL.createObjectURL(file));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed.');
    } finally {
      setIsConverting(false);
    }
  }

  function onFileDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (isConverting) return;
    fileDragDepthRef.current += 1;
    if (fileDragDepthRef.current === 1) setIsFileDragOver(true);
  }

  function onFileDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    fileDragDepthRef.current -= 1;
    if (fileDragDepthRef.current <= 0) {
      fileDragDepthRef.current = 0;
      setIsFileDragOver(false);
    }
  }

  function onFileDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  function onFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    fileDragDepthRef.current = 0;
    setIsFileDragOver(false);
    if (isConverting) return;
    const f = e.dataTransfer.files?.[0] ?? null;
    void handleFile(f);
  }

  function navigateToConversion(nextFrom: ImageFormat, nextTo: ImageFormat) {
    const slug = slugForConversion(nextFrom, nextTo);
    if (!slug || slug === currentSlug) return;
    router.push(`/tools/${slug}`);
  }

  function onFromFormatChange(nextFrom: ImageFormat) {
    const targets = sortedTargetFormatsForSource(nextFrom);
    const nextTo = targets.includes(to) ? to : targets[0];
    navigateToConversion(nextFrom, nextTo);
  }

  function onToFormatChange(nextTo: ImageFormat) {
    navigateToConversion(from, nextTo);
  }

  const sourceOptions = sortedSourceFormats();
  const targetOptions = sortedTargetFormatsForSource(from);

  const siblings =
    siblingConversions?.filter((t) => t.slug !== currentSlug) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 shadow-sm dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-950/80">
        <div
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500"
          aria-hidden
        />
        <div className="absolute right-3 top-4 sm:right-4 sm:top-5">
          <span className="inline-flex items-center rounded-md border border-violet-200/80 bg-violet-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-800 dark:border-violet-800/60 dark:bg-violet-950/50 dark:text-violet-200">
            Local first
          </span>
        </div>

        <div className="flex flex-col gap-6 p-5 pt-7 sm:p-7 sm:pt-9">
          <div className="flex flex-col gap-3 pr-24 sm:pr-32">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Conversion pair
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-xs">
                <label
                  htmlFor={fromSelectId}
                  className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                >
                  Convert from
                </label>
                <select
                  id={fromSelectId}
                  className={selectCls}
                  value={from}
                  aria-label={`Source extension (currently ${dotExtFor(from)})`}
                  disabled={isConverting}
                  onChange={(e) =>
                    onFromFormatChange(e.target.value as ImageFormat)
                  }
                >
                  {sourceOptions.map((f) => (
                    <option key={f} value={f}>
                      {dotExtFor(f)}
                    </option>
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
                  <path
                    d="M12 5v14m0 0-4-4m4 4 4-4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-xs">
                <label
                  htmlFor={toSelectId}
                  className="text-[10px] font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300"
                >
                  Convert to
                </label>
                <select
                  id={toSelectId}
                  className={`${selectCls} border-violet-300/80 bg-violet-50 dark:border-violet-700 dark:bg-violet-950/50`}
                  value={to}
                  aria-label={`Target extension (currently ${dotExtFor(to)})`}
                  disabled={isConverting}
                  onChange={(e) =>
                    onToFormatChange(e.target.value as ImageFormat)
                  }
                >
                  {targetOptions.map((f) => (
                    <option key={f} value={f}>
                      {dotExtFor(f)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Provide one{' '}
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {dotExtFor(from)}
              </span>{' '}
              asset and download{' '}
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {dotExtFor(to)}
              </span>{' '}
              encoded entirely in-browser—pixels stay on your machine throughout the swap.
            </p>
          </div>

          <div
            role="group"
            aria-label={`${dotExtFor(from)} file: drag and drop or choose`}
            className={
              isFileDragOver
                ? 'relative cursor-copy rounded-xl border-2 border-dashed border-violet-500 bg-violet-50/50 p-8 transition-colors dark:border-violet-400 dark:bg-violet-950/20'
                : 'relative cursor-copy rounded-xl border-2 border-dashed border-zinc-300 bg-white/70 p-8 transition-colors dark:border-zinc-600 dark:bg-zinc-900/30'
            }
            onDragEnter={onFileDragEnter}
            onDragLeave={onFileDragLeave}
            onDragOver={onFileDragOver}
            onDrop={onFileDrop}
          >
            <input
              id={inputId}
              type="file"
              accept={acceptFor(from)}
              disabled={isConverting}
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                void handleFile(f);
              }}
            />
            <label
              htmlFor={inputId}
              className={`flex cursor-pointer flex-col items-center gap-3 text-center ${
                isConverting ? 'pointer-events-none opacity-60' : ''
              }`}
            >
              <span className="flex size-12 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75">
                  <path d="M12 15V3m0 12 4-4m-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 21h16a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-.7-.96l-2.5-.75a1 1 0 0 0-1.15.55L14 19" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Select your {dotExtFor(from)} file
              </span>
              <span className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
                Drag and drop here, or click to browse. One file at a time.
              </span>
            </label>
          </div>

          {isConverting ? (
            <p
              className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
              role="status"
              aria-live="polite"
            >
              <span
                className="inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-violet-500 border-t-transparent dark:border-violet-400 dark:border-t-transparent"
                aria-hidden
              />
              Converting… large images may take a moment.
            </p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          {outputUrl && downName ? (
            <div className="flex flex-col gap-4 rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Output ready
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Save as <span className="font-mono font-medium">{downName}</span>
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- blob: preview URL; next/image not applicable
                  <img
                    src={previewUrl}
                    alt="Input preview"
                    className="max-h-44 max-w-full rounded-lg border border-zinc-200 object-contain dark:border-zinc-700"
                  />
                ) : null}
                <a
                  href={outputUrl}
                  download={downName}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Download {downName}
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950/50">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          About {dotExtFor(from)}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {formatSpotlight(from)}
        </p>
      </div>

      {siblings.length > 0 ? (
        <section aria-labelledby="sibling-conversions-heading" className="space-y-3">
          <div className="flex flex-col gap-1">
            <h2
              id="sibling-conversions-heading"
              className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Other image pairs
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Switch pairings—all use the same in-tab workflow below.
            </p>
          </div>
          <ul className="flex flex-wrap gap-2">
            {siblings.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/tools/${t.slug}`}
                  className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-800 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-900 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:border-violet-700 dark:hover:bg-violet-950/40 dark:hover:text-violet-100"
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

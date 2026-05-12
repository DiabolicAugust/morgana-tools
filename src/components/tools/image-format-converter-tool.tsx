'use client';

import { useEffect, useId, useRef, useState } from 'react';

/** Formats supported by the canvas / decoder pipeline. */
export type ImageFormat = 'webp' | 'png' | 'jpeg' | 'avif' | 'heic';

function labelFor(f: ImageFormat): string {
  switch (f) {
    case 'webp':
      return 'WEBP';
    case 'png':
      return 'PNG';
    case 'jpeg':
      return 'JPG';
    case 'avif':
      return 'AVIF';
    case 'heic':
      return 'HEIC';
  }
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

type Props = {
  from: ImageFormat;
  to: ImageFormat;
};

export function ImageFormatConverterTool({ from, to }: Props) {
  const inputId = useId();
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
      setError(`Please choose a ${labelFor(from)} file (.${extFor(from)}).`);
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

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Converting <strong>{labelFor(from)}</strong> →{' '}
        <strong>{labelFor(to)}</strong>. Processing stays in your browser.
      </p>

      <div
        role="group"
        aria-label={`${labelFor(from)} file: drag and drop or choose`}
        className={
          isFileDragOver
            ? 'cursor-copy rounded-xl border-2 border-dashed border-zinc-900 bg-zinc-100 p-6 transition-colors dark:border-zinc-100 dark:bg-zinc-900/80'
            : 'cursor-copy rounded-xl border-2 border-dashed border-zinc-300 bg-white/40 p-6 transition-colors dark:border-zinc-600 dark:bg-zinc-950/40'
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
          className={`flex cursor-pointer flex-col items-center gap-2 text-center ${
            isConverting ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Drag and drop a {labelFor(from)} file here
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            or click to choose a file
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
            className="inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent dark:border-zinc-500 dark:border-t-transparent"
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
        <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/80">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Ready to download
          </p>
          <div className="flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:items-start">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Input preview"
                className="max-h-40 rounded border border-zinc-200 object-contain dark:border-zinc-700"
              />
            ) : null}
            <a
              href={outputUrl}
              download={downName}
              className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Download {downName}
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}

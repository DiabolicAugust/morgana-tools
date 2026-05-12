'use client';

import type { ReactNode } from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import { normalizeTextBytes } from '@/lib/text-file-normalize';

export type ExtractOutcome =
  | Blob
  | { blob: Blob; outcomeNotes?: string[] };

function unpackOutcome(outcome: ExtractOutcome): {
  blob: Blob;
  outcomeNotes?: string[];
} {
  if (outcome instanceof Blob) return { blob: outcome };
  return {
    blob: outcome.blob,
    outcomeNotes: outcome.outcomeNotes,
  };
}

const panelCls =
  'relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 shadow-sm dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-950/80';

const dropInactive =
  'cursor-copy rounded-xl border-2 border-dashed border-zinc-300 bg-white/70 p-8 transition-colors dark:border-zinc-600 dark:bg-zinc-900/30';

const dropActive =
  'cursor-copy rounded-xl border-2 border-dashed border-emerald-500 bg-emerald-50/60 p-8 transition-colors dark:border-emerald-400 dark:bg-emerald-950/30';

export function TxtNormalizeTool() {
  return (
    <EbookExtractor
      headline="TXT cleanup (BOM · CRLF · UTF‑16)"
      lead="Normalize Windows and Mac line endings, strip stray UTF‑8 BOMs, and decode UTF‑16 exports before downloading a clean `.txt`."
      accept=".txt,text/plain"
      exampleExt=".txt"
      outputExtension="txt"
      outputBaseName={(name) =>
        `${name.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_') || 'normalized'}.txt`
      }
      onExtract={async (file) => {
        const buf = new Uint8Array(await file.arrayBuffer());
        const { text, notes } = normalizeTextBytes(buf);
        return {
          blob: new Blob([text], { type: 'text/plain;charset=utf-8' }),
          outcomeNotes:
            notes.length > 0
              ? notes
              : ['Nothing needed changing—the file already used LF endings without a BOM.'],
        };
      }}
    />
  );
}

type ExtractorProps = {
  headline: string;
  lead: string;
  afterLead?: ReactNode;
  accept: string;
  exampleExt: string;
  outputExtension: string;
  outputBaseName: (originalName: string) => string;
  onExtract: (file: File) => Promise<ExtractOutcome>;
};

function EbookExtractor({
  headline,
  lead,
  afterLead,
  accept,
  exampleExt,
  outputExtension,
  outputBaseName,
  onExtract,
}: ExtractorProps) {
  const inputId = useId();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [downName, setDownName] = useState<string | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState<string[] | null>(null);
  const dragDepth = useRef(0);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  function reset() {
    setError(null);
    setDownName(null);
    setBusy(false);
    setOutcomeNotes(null);
    setBlobUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
  }

  async function processFile(file: File | null) {
    reset();
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const unpacked = unpackOutcome(await onExtract(file));
      const url = URL.createObjectURL(unpacked.blob);
      setBlobUrl(url);
      setDownName(outputBaseName(file.name));
      setOutcomeNotes(unpacked.outcomeNotes ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Processing failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className={panelCls}>
        <div
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500"
          aria-hidden
        />

        <div className="space-y-2 p-5 pt-8 sm:p-7 sm:pt-10">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {headline}
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {lead}
          </p>
          {afterLead ? <div className="pt-2">{afterLead}</div> : null}
        </div>

        <div className="px-5 pb-6 sm:px-7">
          <div
            role="group"
            aria-label={`Drop ${exampleExt} here or browse`}
            className={dragOver ? dropActive : dropInactive}
            onDragEnter={(e) => {
              e.preventDefault();
              dragDepth.current += 1;
              if (dragDepth.current === 1) setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              dragDepth.current -= 1;
              if (dragDepth.current <= 0) {
                dragDepth.current = 0;
                setDragOver(false);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              dragDepth.current = 0;
              setDragOver(false);
              void processFile(e.dataTransfer.files?.[0] ?? null);
            }}
          >
            <input
              id={inputId}
              type="file"
              accept={accept}
              className="sr-only"
              disabled={busy}
              onChange={(ev) =>
                void processFile(ev.target.files?.[0] ?? null)
              }
            />

            <label
              htmlFor={inputId}
              className={`flex cursor-pointer flex-col items-center gap-3 text-center ${
                busy ? 'pointer-events-none opacity-60' : ''
              }`}
            >
              <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                Select {exampleExt} to start
              </span>
              <span className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                Or drop one file—parsing stays inside this browser tab without a Morgana upload step.
              </span>
            </label>
          </div>

          {busy ? (
            <p
              className="mt-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
              aria-live="polite"
              role="status"
            >
              <span
                className="inline-block size-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"
                aria-hidden
              />
              Working… large books may pause the tab briefly.
            </p>
          ) : null}

          {error ? (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          {blobUrl && downName ? (
            <div className="mt-5 flex flex-col gap-4 rounded-xl border border-emerald-200/70 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/25">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Output ready (<span className="font-mono">.{outputExtension}</span>)
              </p>

              {outcomeNotes?.length ? (
                <ul className="list-inside list-disc text-xs text-zinc-600 dark:text-zinc-400">
                  {outcomeNotes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <a
                  href={blobUrl}
                  download={downName}
                  className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  Download {downName}
                </a>
                <button
                  type="button"
                  onClick={() => reset()}
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Clear result
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

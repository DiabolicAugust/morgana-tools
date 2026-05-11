'use client';

import { useEffect, useState } from 'react';

const textareaClass =
  'min-h-[10rem] w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100';

const algorithms = ['SHA-256', 'SHA-384', 'SHA-512', 'SHA-1'] as const;
type Algo = (typeof algorithms)[number];

function bufferToHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function HashGeneratorTool() {
  const [input, setInput] = useState('');
  const [algo, setAlgo] = useState<Algo>('SHA-256');
  const [hash, setHash] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!input) {
        setHash('');
        setError(null);
        return;
      }
      const c = globalThis.crypto;
      if (!c?.subtle?.digest) {
        setHash('');
        setError('Web Crypto is not available (use HTTPS or localhost).');
        return;
      }
      try {
        const data = new TextEncoder().encode(input);
        const buf = await c.subtle.digest(algo, data);
        if (!cancelled) {
          setHash(bufferToHex(buf));
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setHash('');
          setError('Could not compute hash.');
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [input, algo]);

  async function copyHash() {
    if (!hash) return;
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Uses the browser{' '}
        <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">
          SubtleCrypto
        </code>{' '}
        API (SHA family). MD5 is not exposed in Web Crypto; use a dedicated tool
        if you need legacy MD5. SHA-1 is included for compatibility only and
        should not be used for new security-sensitive systems. The digest updates
        as you type.
      </p>
      <div className="flex flex-wrap items-end gap-4">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Algorithm
          <select
            value={algo}
            onChange={(e) => setAlgo(e.target.value as Algo)}
            className="mt-2 block w-40 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          >
            {algorithms.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => void copyHash()}
          disabled={!hash}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
        >
          {copied ? 'Copied' : 'Copy hash'}
        </button>
      </div>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Input
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          spellCheck={false}
          className={`mt-2 ${textareaClass}`}
          placeholder="Any UTF-8 text…"
        />
      </label>
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Hex digest
        <textarea
          readOnly
          value={hash}
          rows={4}
          spellCheck={false}
          className={`mt-2 ${textareaClass} bg-zinc-50 dark:bg-zinc-900/80`}
          placeholder="Digest updates as you type."
        />
      </label>
    </div>
  );
}

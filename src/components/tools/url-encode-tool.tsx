'use client';

import { useId, useMemo, useState } from 'react';

const textareaClass =
  'min-h-[10rem] w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100';

type ScopeMode = 'component' | 'full';
type Direction = 'encode' | 'decode';

export function UrlEncodeTool() {
  const groupId = useId();
  const [scopeMode, setScopeMode] = useState<ScopeMode>('component');
  const [direction, setDirection] = useState<Direction>('encode');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const { output, error, success } = useMemo(() => {
    const trimmed = input;
    if (!trimmed.trim()) {
      return { output: '', error: null as string | null, success: false };
    }
    try {
      if (direction === 'encode') {
        return {
          output:
            scopeMode === 'component'
              ? encodeURIComponent(trimmed)
              : encodeURI(trimmed),
          error: null,
          success: true,
        };
      }
      return {
        output:
          scopeMode === 'component'
            ? decodeURIComponent(trimmed)
            : decodeURI(trimmed),
        error: null,
        success: true,
      };
    } catch {
      return {
        output: '',
        error:
          direction === 'encode'
            ? 'Encoding failed.'
            : 'Invalid encoded string for this mode.',
        success: false,
      };
    }
  }, [input, scopeMode, direction]);

  function clearAll() {
    setInput('');
    setCopied(false);
  }

  async function copyOutput() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
      <fieldset className="flex flex-col gap-2 border-0 p-0">
        <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300 pb-4">
          Encoding scope
        </legend>
        <div
          className="flex flex-wrap gap-4 text-sm"
          role="group"
          aria-labelledby={groupId}
        >
          <span id={groupId} className="sr-only">
            Choose URL encoding scope
          </span>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="url-encoding-scope"
              checked={scopeMode === 'component'}
              onChange={() => setScopeMode('component')}
              className="accent-zinc-900 dark:accent-zinc-100"
            />
            URL component (
            <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">
              encodeURIComponent
            </code>
            )
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="url-encoding-scope"
              checked={scopeMode === 'full'}
              onChange={() => setScopeMode('full')}
              className="accent-zinc-900 dark:accent-zinc-100"
            />
            Full URL (
            <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">
              encodeURI
            </code>{' '}
            — preserves{' '}
            <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">
              ://
            </code>
            ,{' '}
            <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">/</code>
            , …)
          </label>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex flex-wrap gap-4 text-sm"
          role="group"
          aria-label="Encode or decode"
        >
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="url-direction"
              checked={direction === 'encode'}
              onChange={() => setDirection('encode')}
              className="accent-zinc-900 dark:accent-zinc-100"
            />
            Encode
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="url-direction"
              checked={direction === 'decode'}
              onChange={() => setDirection('decode')}
              className="accent-zinc-900 dark:accent-zinc-100"
            />
            Decode
          </label>
        </div>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => void copyOutput()}
            disabled={!output}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            {copied ? 'Copied' : 'Copy output'}
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {success && input.trim() ? (
        <p
          className="text-sm font-medium text-emerald-700 dark:text-emerald-400"
          role="status"
        >
          Done.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Input
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={12}
            spellCheck={false}
            className={`mt-2 ${textareaClass}`}
            placeholder={
              scopeMode === 'component'
                ? 'e.g. hello world?q=foo/bar'
                : 'e.g. https://example.com/a b'
            }
          />
        </label>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Output
          <textarea
            readOnly
            value={output}
            rows={12}
            spellCheck={false}
            className={`mt-2 ${textareaClass} bg-zinc-50 dark:bg-zinc-900/80`}
            placeholder="Result updates live."
          />
        </label>
      </div>
    </div>
  );
}

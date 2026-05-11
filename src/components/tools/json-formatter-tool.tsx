'use client';

import { useMemo, useState } from 'react';

const successMessage = 'Valid JSON formatted successfully.';

const textareaClass =
  'min-h-[12rem] w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100';

type FormatMode = 'prettify' | 'minify';

export function JsonFormatterTool() {
  const [input, setInput] = useState('');
  const [formatMode, setFormatMode] = useState<FormatMode>('prettify');
  const [copied, setCopied] = useState(false);

  const { output, error, success } = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      return { output: '', error: null as string | null, success: false };
    }
    try {
      const parsed: unknown = JSON.parse(trimmed);
      const out =
        formatMode === 'prettify'
          ? JSON.stringify(parsed, null, 2)
          : JSON.stringify(parsed);
      return { output: out, error: null, success: true };
    } catch (e) {
      return {
        output: '',
        error: e instanceof Error ? e.message : 'Invalid JSON',
        success: false,
      };
    }
  }, [input, formatMode]);

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
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Output style
        </span>
        <div className="flex flex-wrap gap-4 text-sm" role="group" aria-label="JSON output style">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="json-format-mode"
              checked={formatMode === 'prettify'}
              onChange={() => setFormatMode('prettify')}
              className="accent-zinc-900 dark:accent-zinc-100"
            />
            Prettify
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="json-format-mode"
              checked={formatMode === 'minify'}
              onChange={() => setFormatMode('minify')}
              className="accent-zinc-900 dark:accent-zinc-100"
            />
            Minify
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
          aria-live="polite"
        >
          {successMessage}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex min-h-0 flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Input
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={14}
              spellCheck={false}
              className={`mt-2 ${textareaClass}`}
              placeholder={`{\n  "example": true\n}`}
            />
          </label>
        </div>
        <div className="flex min-h-0 flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Output
            <textarea
              readOnly
              value={output}
              rows={14}
              spellCheck={false}
              className={`mt-2 ${textareaClass} bg-zinc-50 dark:bg-zinc-900/80`}
              placeholder="Formatted JSON appears here as you type."
              aria-label="Formatted JSON output"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

const successMessage = 'Valid JSON formatted successfully.';

const textareaClass =
  'min-h-[12rem] w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100';

export function JsonFormatterTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  function resetMessages() {
    setError(null);
    setSuccess(false);
  }

  function onInputChange(value: string) {
    setInput(value);
    setOutput('');
    resetMessages();
  }

  function prettify() {
    resetMessages();
    const trimmed = input.trim();
    if (!trimmed) {
      setError('Paste JSON first.');
      setOutput('');
      return;
    }
    try {
      const parsed: unknown = JSON.parse(trimmed);
      setOutput(JSON.stringify(parsed, null, 2));
      setSuccess(true);
    } catch (e) {
      setOutput('');
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }

  function minify() {
    resetMessages();
    const trimmed = input.trim();
    if (!trimmed) {
      setError('Paste JSON first.');
      setOutput('');
      return;
    }
    try {
      const parsed: unknown = JSON.parse(trimmed);
      setOutput(JSON.stringify(parsed));
      setSuccess(true);
    } catch (e) {
      setOutput('');
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }

  function clearAll() {
    setInput('');
    setOutput('');
    setError(null);
    setSuccess(false);
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
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={prettify}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Prettify
        </button>
        <button
          type="button"
          onClick={minify}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
        >
          Minify
        </button>
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

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
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
              onChange={(e) => onInputChange(e.target.value)}
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
              placeholder="Formatted JSON appears here."
              aria-label="Formatted JSON output"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

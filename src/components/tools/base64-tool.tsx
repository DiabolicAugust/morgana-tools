"use client";

import { useMemo, useState } from "react";

const textareaClass =
  "min-h-[10rem] w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";

function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

function base64ToUtf8(base64: string): string {
  const normalized = base64.replace(/\s/g, "");
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

type Direction = "encode" | "decode";

export function Base64Tool() {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("encode");
  const [copied, setCopied] = useState(false);

  const { output, error, success } = useMemo(() => {
    if (direction === "encode") {
      if (!input) {
        return { output: "", error: null as string | null, success: false };
      }
      try {
        return { output: utf8ToBase64(input), error: null, success: true };
      } catch {
        return {
          output: "",
          error: "Could not encode (invalid characters for Base64 binary step).",
          success: false,
        };
      }
    }
    if (!input.trim()) {
      return { output: "", error: null as string | null, success: false };
    }
    try {
      return { output: base64ToUtf8(input), error: null, success: true };
    } catch {
      return { output: "", error: "Invalid Base64 string.", success: false };
    }
  }, [input, direction]);

  function clearAll() {
    setInput("");
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
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        UTF-8 safe: non-ASCII characters are encoded correctly using the browser TextEncoder. Switch
        direction anytime—the output updates as you type.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-4 text-sm" role="group" aria-label="Base64 direction">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="base64-direction"
              checked={direction === "encode"}
              onChange={() => setDirection("encode")}
              className="accent-zinc-900 dark:accent-zinc-100"
            />
            Encode to Base64
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="base64-direction"
              checked={direction === "decode"}
              onChange={() => setDirection("decode")}
              className="accent-zinc-900 dark:accent-zinc-100"
            />
            Decode from Base64
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
            {copied ? "Copied" : "Copy output"}
          </button>
        </div>
      </div>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {success && (direction === "encode" ? input : input.trim()) ? (
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400" role="status">
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
              direction === "encode"
                ? "Plain text…"
                : "Base64 string…"
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

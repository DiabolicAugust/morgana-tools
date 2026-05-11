"use client";

import { useCallback, useState } from "react";

function generateUuidV4(): string {
  const c = globalThis.crypto;
  if (c && "randomUUID" in c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  if (!c?.getRandomValues) {
    throw new Error("Web Crypto is not available.");
  }
  const bytes = new Uint8Array(16);
  c.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function UuidGeneratorTool() {
  const [value, setValue] = useState(() => generateUuidV4());
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(() => {
    setValue(generateUuidV4());
    setCopied(false);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className="flex flex-wrap items-center gap-2">
        <output
          className="min-w-[18ch] flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm tracking-wide text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          aria-live="polite"
        >
          {value}
        </output>
        <button
          type="button"
          onClick={copy}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          onClick={refresh}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New UUID
        </button>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Generates a random RFC 4122 version 4 UUID in your browser.
      </p>
    </div>
  );
}

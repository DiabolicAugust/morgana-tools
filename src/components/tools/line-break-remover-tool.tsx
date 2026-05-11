"use client";

import { useId, useMemo, useState } from "react";

export function LineBreakRemoverTool() {
  const prefix = useId();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"spaces" | "empty">("spaces");

  const output = useMemo(() => {
    if (!input) return "";
    const withUnix = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    if (mode === "empty") {
      return withUnix.replace(/\n/g, "");
    }
    return withUnix.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  }, [input, mode]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name={`${prefix}-mode`}
            checked={mode === "spaces"}
            onChange={() => setMode("spaces")}
            className="accent-zinc-900 dark:accent-zinc-100"
          />
          Replace newlines, collapse spaces
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name={`${prefix}-mode`}
            checked={mode === "empty"}
            onChange={() => setMode("empty")}
            className="accent-zinc-900 dark:accent-zinc-100"
          />
          Remove newlines only
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Input
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          spellCheck={false}
          className="min-h-[8rem] resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          placeholder="Paste text with line breaks…"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Result
        <textarea
          readOnly
          value={output}
          rows={6}
          spellCheck={false}
          className="min-h-[6rem] resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
          aria-live="polite"
        />
      </label>
    </div>
  );
}

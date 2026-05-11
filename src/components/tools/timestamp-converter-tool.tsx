"use client";

import { useMemo, useState } from "react";

function formatBlock(label: string, value: string) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="mt-1 break-all font-mono text-sm text-zinc-900 dark:text-zinc-100">{value}</div>
    </div>
  );
}

/** Heuristic: fewer than 10 absolute digits treated as seconds unless toggles override. */
function numericToMillis(raw: string, forceSeconds: boolean, forceMillis: boolean): number | null {
  const trimmed = raw.trim().replace(/^\+/, "");
  if (!/^[-+]?\d+$/.test(trimmed)) return null;
  const magnitude = trimmed.replace(/^[-+]/, "");
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return null;
  if (forceMillis) return n;
  if (forceSeconds) return n * 1000;
  const abs = BigInt(magnitude);
  const tenDigits = BigInt(10_000_000_000);
  if (abs >= tenDigits) return n;
  return n * 1000;
}

export function TimestampConverterTool() {
  const [input, setInput] = useState("");
  const [forceSeconds, setForceSeconds] = useState(false);
  const [forceMillis, setForceMillis] = useState(false);

  const parsed = useMemo(() => {
    const raw = input.trim();
    if (!raw) return { error: null as string | null, date: null as Date | null };

    const numMs = numericToMillis(raw, forceSeconds, forceMillis);
    if (numMs !== null) {
      const d = new Date(numMs);
      return Number.isNaN(d.getTime())
        ? { error: "Number out of range for Date.", date: null }
        : { error: null, date: d };
    }

    const fromIso = Date.parse(raw);
    if (!Number.isNaN(fromIso)) {
      return { error: null, date: new Date(fromIso) };
    }

    return {
      error: "Enter a Unix timestamp (seconds or milliseconds) or a date string browsers can parse (e.g. ISO 8601).",
      date: null,
    };
  }, [input, forceSeconds, forceMillis]);

  const blocks = useMemo(() => {
    if (!parsed.date) return null;
    const d = parsed.date;
    const ms = d.getTime();
    const s = Math.floor(ms / 1000);
    return {
      isoUtc: d.toISOString(),
      isoLocal: d.toString(),
      unixSeconds: String(s),
      unixMillis: String(ms),
    };
  }, [parsed.date]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Plain numbers: under 10 digits are treated as <strong>seconds</strong>; 10+ digits as{" "}
        <strong>milliseconds</strong>. Override with the toggles when needed.
      </p>
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Timestamp or date string
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          placeholder="1700000000 or 1700000000000 or 2023-11-14T22:13:20.000Z"
        />
      </label>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={forceSeconds}
            onChange={(e) => {
              setForceSeconds(e.target.checked);
              if (e.target.checked) setForceMillis(false);
            }}
            className="accent-zinc-900 dark:accent-zinc-100"
          />
          Treat number as seconds
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={forceMillis}
            onChange={(e) => {
              setForceMillis(e.target.checked);
              if (e.target.checked) setForceSeconds(false);
            }}
            className="accent-zinc-900 dark:accent-zinc-100"
          />
          Treat number as milliseconds
        </label>
      </div>
      {parsed.error ? (
        <p className="text-sm text-amber-800 dark:text-amber-200" role="status">
          {parsed.error}
        </p>
      ) : null}
      {blocks ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {formatBlock("ISO 8601 (UTC)", blocks.isoUtc)}
          {formatBlock("Local string", blocks.isoLocal)}
          {formatBlock("Unix (seconds)", blocks.unixSeconds)}
          {formatBlock("Unix (milliseconds)", blocks.unixMillis)}
        </div>
      ) : null}
    </div>
  );
}

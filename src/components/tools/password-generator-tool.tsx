"use client";

import { useCallback, useId, useState } from "react";

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?";

async function securePickIndex(max: number): Promise<number> {
  const buf = new Uint32Array(1);
  const limit = 0x1_0000_0000 - (0x1_0000_0000 % max);
  for (;;) {
    crypto.getRandomValues(buf);
    const n = buf[0];
    if (n < limit) return n % max;
  }
}

async function securePickChar(pool: string): Promise<string> {
  const i = await securePickIndex(pool.length);
  return pool[i]!;
}

async function generatePassword(options: {
  length: number;
  lower: boolean;
  upper: boolean;
  numbers: boolean;
  symbols: boolean;
}): Promise<string> {
  let pool = "";
  if (options.lower) pool += LOWER;
  if (options.upper) pool += UPPER;
  if (options.numbers) pool += DIGITS;
  if (options.symbols) pool += SYMBOLS;
  if (!pool.length) pool = LOWER + UPPER + DIGITS;

  const chars: string[] = [];
  for (let i = 0; i < options.length; i++) {
    chars.push(await securePickChar(pool));
  }
  return chars.join("");
}

export function PasswordGeneratorTool() {
  const groupId = useId();
  const [length, setLength] = useState(20);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const runGenerate = useCallback(async () => {
    setPassword(await generatePassword({ length, lower, upper, numbers, symbols }));
    setCopied(false);
  }, [length, lower, upper, numbers, symbols]);

  async function copy() {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Length: {length}
          <input
            type="range"
            min={8}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="mt-2 block w-full accent-zinc-900 dark:accent-zinc-100"
          />
        </label>
      </div>
      <fieldset className="flex flex-col gap-2 border-0 p-0">
        <legend className="sr-only">Character sets</legend>
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Include
        </span>
        <div className="flex flex-wrap gap-4 text-sm" role="group" aria-labelledby={groupId}>
          <span id={groupId} className="sr-only">
            Select character types
          </span>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={lower}
              onChange={(e) => setLower(e.target.checked)}
              className="accent-zinc-900 dark:accent-zinc-100"
            />
            a–z
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={upper}
              onChange={(e) => setUpper(e.target.checked)}
              className="accent-zinc-900 dark:accent-zinc-100"
            />
            A–Z
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={numbers}
              onChange={(e) => setNumbers(e.target.checked)}
              className="accent-zinc-900 dark:accent-zinc-100"
            />
            0–9
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={symbols}
              onChange={(e) => setSymbols(e.target.checked)}
              className="accent-zinc-900 dark:accent-zinc-100"
            />
            Symbols
          </label>
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void runGenerate()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Generate
        </button>
        <button
          type="button"
          onClick={copy}
          disabled={!password}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {password ? (
        <output
          className="break-all rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          aria-live="polite"
        >
          {password}
        </output>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Choose options and tap Generate. Passwords are created with Web Crypto randomness.
        </p>
      )}
    </div>
  );
}

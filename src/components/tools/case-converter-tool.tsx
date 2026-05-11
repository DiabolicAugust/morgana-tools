"use client";

import { useMemo, useState } from "react";

const textareaClass =
  "min-h-[10rem] w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";

function titleCase(s: string): string {
  return s.replace(/\p{L}+/gu, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function sentenceCase(s: string): string {
  const lower = s.toLowerCase();
  const leading = lower.replace(/^(\s*)(\p{L})/u, (_, sp: string, ch: string) => sp + ch.toUpperCase());
  return leading.replace(/([.!?]+\s+)(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

function splitWords(s: string): string[] {
  return s
    .trim()
    .split(/[\s\-_/]+/)
    .filter(Boolean);
}

function toCamelCase(s: string): string {
  const parts = splitWords(s);
  if (!parts.length) return "";
  return parts
    .map((p, i) =>
      i === 0
        ? p.toLowerCase()
        : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase(),
    )
    .join("");
}

function toPascalCase(s: string): string {
  const parts = splitWords(s);
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join("");
}

function toSnakeCase(s: string): string {
  return s
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s\-/]+/g, "_")
    .replace(/__+/g, "_")
    .toLowerCase()
    .replace(/^_+|_+$/g, "");
}

function toKebabCase(s: string): string {
  return toSnakeCase(s).replace(/_/g, "-");
}

function toConstantCase(s: string): string {
  return toSnakeCase(s).toUpperCase();
}

type Transform = "upper" | "lower" | "title" | "sentence" | "camel" | "pascal" | "snake" | "kebab" | "constant";

const labels: Record<Transform, string> = {
  upper: "UPPERCASE",
  lower: "lowercase",
  title: "Title Case",
  sentence: "Sentence case",
  camel: "camelCase",
  pascal: "PascalCase",
  snake: "snake_case",
  kebab: "kebab-case",
  constant: "CONSTANT_CASE",
};

const btnIdle =
  "rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900";
const btnActive =
  "rounded-lg border border-zinc-900 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900";

function applyTransform(input: string, mode: Transform): string {
  if (!input) return "";
  switch (mode) {
    case "upper":
      return input.toUpperCase();
    case "lower":
      return input.toLowerCase();
    case "title":
      return titleCase(input);
    case "sentence":
      return sentenceCase(input);
    case "camel":
      return toCamelCase(input);
    case "pascal":
      return toPascalCase(input);
    case "snake":
      return toSnakeCase(input);
    case "kebab":
      return toKebabCase(input);
    case "constant":
      return toConstantCase(input);
    default:
      return "";
  }
}

export function CaseConverterTool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Transform>("lower");

  const output = useMemo(() => applyTransform(input, mode), [input, mode]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Title and sentence modes use Unicode-aware rules. Identifier modes split on spaces, hyphens,
        and underscores; camel and Pascal also split on <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">aA</code> boundaries. Pick a style—the output follows your typing.
      </p>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(labels) as Transform[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={mode === key ? btnActive : btnIdle}
            aria-pressed={mode === key}
          >
            {labels[key]}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Input
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={12}
            spellCheck={false}
            className={`mt-2 ${textareaClass}`}
            placeholder="Paste or type text…"
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
            placeholder="Transformed text updates live."
          />
        </label>
      </div>
    </div>
  );
}

export const TOOL_CATEGORY_LABELS = {
  text: 'Text',
  developers: 'Data & APIs',
  security: 'Security',
} as const;

export type ToolCategoryId = keyof typeof TOOL_CATEGORY_LABELS;

export type FaqItem = {
  question: string;
  answer: string;
};

export type ToolDefinition = {
  slug: string;
  title: string;
  categoryId: ToolCategoryId;
  /**
   * Relative demand score for ordering (e.g. from keyword research). Higher = list first.
   * Not shown to users; tune when you refresh search volume data.
   */
  searchVolumePriority: number;
  shortDescription: string;
  /** Meta description for SERP snippets; keep ~150–160 characters when possible. */
  description: string;
  /** Visible on-page explainer; can run several sentences for SEO and clarity. */
  longDescription: string;
  keywords: string[];
  /** Other tool slugs to surface as “related”; must exist in `TOOLS`. */
  relatedSlugs: string[];
  faq: FaqItem[];
};

export const TOOLS: ToolDefinition[] = [
  {
    slug: 'remove-line-breaks',
    title: 'Remove line breaks',
    categoryId: 'text',
    searchVolumePriority: 72,
    shortDescription:
      'Strip newlines and collapse whitespace from pasted text in one click.',
    description:
      'Free online line break remover. Paste text, strip newlines, normalize spaces—in your browser.',
    longDescription:
      'Use this remover when paragraphs, logs, or exports arrive with unwanted line endings. Toggle between collapsing runs of spaces and stripping only carriage returns so you can tune the outcome for captions, hashtags, spreadsheets, or long single-line payloads. Processing stays on your device: nothing is uploaded to a server.',
    keywords: [
      'remove line breaks',
      'newline remover',
      'text to one line',
      'strip line breaks online',
    ],
    relatedSlugs: ['json-formatter', 'uuid-generator'],
    faq: [
      {
        question: 'Does this send my text to your servers?',
        answer:
          'No. The transformation runs entirely in your browser using local JavaScript, so pasted content does not leave your machine through this page.',
      },
      {
        question: 'What is the difference between the two spacing modes?',
        answer:
          '“Replace newlines, collapse spaces” turns every newline into a space and merges repeated whitespace into a single space. “Remove newlines only” deletes line breaks while leaving other spacing characters as-is.',
      },
      {
        question: 'Will this preserve Unicode or emoji?',
        answer:
          'Yes. The tool operates on the text you paste; characters are not transliterated unless you edit the output yourself.',
      },
    ],
  },
  {
    slug: 'json-formatter',
    title: 'JSON formatter',
    categoryId: 'developers',
    searchVolumePriority: 95,
    shortDescription:
      'Pretty-print JSON, validate syntax, and minify for production-ready payloads.',
    description:
      'Format and validate JSON online. Beautify, find syntax errors, and minify payloads—locally in your browser.',
    longDescription:
      'Paste raw JSON responses, config fragments, or generated blobs to prettify them with consistent indentation. When you need a compact payload for requests or storage, minify with one click while still catching parse errors early. Ideal for debugging APIs, reviewing schema samples, or cleaning snippets before committing them.',
    keywords: [
      'json formatter',
      'json pretty print',
      'json validator',
      'minify json',
    ],
    relatedSlugs: ['uuid-generator', 'remove-line-breaks'],
    faq: [
      {
        question: 'Is my JSON stored or logged?',
        answer:
          'No storage step is involved. Parsing and formatting happen locally, so sensitive payloads are not transmitted by this utility.',
      },
      {
        question: 'Why does prettify fail with an error?',
        answer:
          'The input must be valid JSON: double-quoted keys, commas between items, and matching brackets. The error message references the first parse failure the browser reports.',
      },
      {
        question: 'Can I minify JSON that contains Unicode?',
        answer:
          'Yes. `JSON.stringify` preserves Unicode characters; they will remain escaped or unescaped according to standard JSON encoding rules.',
      },
    ],
  },
  {
    slug: 'uuid-generator',
    title: 'UUID generator',
    categoryId: 'developers',
    searchVolumePriority: 78,
    shortDescription:
      'Generate random UUID v4 identifiers for APIs, databases, and tests.',
    description:
      'Generate UUID v4 strings instantly for database keys, tracing, and tests—client-side, copy-ready.',
    longDescription:
      'Every refresh issues a new RFC 4122 version 4 UUID using cryptographically strong randomness when the browser supports it. Copy values directly into migrations, seed scripts, distributed traces, or mock data without leaving the tab. Pair with the JSON helper when you need identifiers inside structured payloads.',
    keywords: [
      'uuid generator',
      'uuid v4',
      'random guid',
      'generate uuid online',
    ],
    relatedSlugs: ['json-formatter', 'password-generator'],
    faq: [
      {
        question: 'Are these UUIDs suitable for production database keys?',
        answer:
          'Version 4 UUIDs from a modern browser use the Web Crypto API (or an equivalent fallback) to collect random bytes, which is appropriate for general-purpose unique identifiers.',
      },
      {
        question: 'Do you guarantee global uniqueness?',
        answer:
          'UUID v4 values are statistically unique for practical purposes, but no client-side tool can offer an absolute guarantee without a central registry.',
      },
      {
        question: 'Can I generate multiple UUIDs at once?',
        answer:
          'Today the page issues one value per click. Batch generation can be added later if you need large sets.',
      },
    ],
  },
  {
    slug: 'password-generator',
    title: 'Password generator',
    categoryId: 'security',
    searchVolumePriority: 92,
    shortDescription:
      'Create strong random passwords with adjustable length and character sets.',
    description:
      'Strong random password generator with length and character controls using Web Crypto randomness.',
    longDescription:
      'Dial password length between short memorable codes and long secrets suitable for vault storage. Mix lowercase, uppercase, digits, and symbols to match policy requirements, then copy the result into your password manager or CLI. Randomness is sourced from `crypto.getRandomValues`, which is stronger than `Math.random` for secrets.',
    keywords: [
      'password generator',
      'strong password',
      'random password online',
      'secure password',
    ],
    relatedSlugs: ['uuid-generator', 'json-formatter'],
    faq: [
      {
        question: 'Are these passwords safe to use?',
        answer:
          'Generated passwords use browser crypto randomness when available. For important accounts, store them in a password manager and enable multi-factor authentication.',
      },
      {
        question: 'What happens if every character set is unchecked?',
        answer:
          'The generator falls back to letters and numbers so it can still produce output, but you should select character classes that satisfy your target policy.',
      },
      {
        question: 'Is the password ever transmitted?',
        answer:
          'No network request is made. Generation and copy actions stay inside your browser session.',
      },
    ],
  },
];

const CATEGORY_ORDER: ToolCategoryId[] = ['text', 'developers', 'security'];

function assertValidToolRegistry(list: ToolDefinition[]) {
  const slugs = new Set(list.map((t) => t.slug));
  for (const tool of list) {
    for (const rel of tool.relatedSlugs) {
      if (!slugs.has(rel)) {
        throw new Error(
          `Tool "${tool.slug}" references unknown related slug "${rel}"`,
        );
      }
      if (rel === tool.slug) {
        throw new Error(
          `Tool "${tool.slug}" cannot list itself in relatedSlugs`,
        );
      }
    }
  }
}

assertValidToolRegistry(TOOLS);

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function getAllToolSlugs(): string[] {
  return TOOLS.map((t) => t.slug);
}

/** Higher `searchVolumePriority` first (for nav, SERP-facing lists, JSON-LD order). */
export function getToolsSortedBySearchPriority(): ToolDefinition[] {
  return [...TOOLS].sort(
    (a, b) => b.searchVolumePriority - a.searchVolumePriority,
  );
}

export function getRelatedTools(tool: ToolDefinition): ToolDefinition[] {
  return tool.relatedSlugs
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is ToolDefinition => Boolean(t));
}

export function getToolsGroupedByCategory(): {
  categoryId: ToolCategoryId;
  tools: ToolDefinition[];
}[] {
  return CATEGORY_ORDER.map((categoryId) => ({
    categoryId,
    tools: TOOLS.filter((t) => t.categoryId === categoryId).sort(
      (a, b) => b.searchVolumePriority - a.searchVolumePriority,
    ),
  })).filter((group) => group.tools.length > 0);
}

export function getMaxSearchVolumePriority(): number {
  return Math.max(...TOOLS.map((t) => t.searchVolumePriority));
}

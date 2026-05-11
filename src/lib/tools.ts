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
    relatedSlugs: ['json-formatter', 'case-converter'],
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
    relatedSlugs: ['uuid-generator', 'url-encoder-decoder'],
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
    relatedSlugs: ['json-formatter', 'timestamp-converter'],
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
    relatedSlugs: ['hash-generator', 'uuid-generator'],
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
  {
    slug: 'base64-encoder-decoder',
    title: 'Base64 encoder & decoder',
    categoryId: 'developers',
    searchVolumePriority: 85,
    shortDescription:
      'Encode UTF-8 text to Base64 or decode Base64 back to text in the browser.',
    description:
      'Free Base64 encode/decode with UTF-8 support. Copy results locally—no uploads.',
    longDescription:
      'Use standard Base64 when you need transport-safe text, quick data URI experiments, or debugging auth headers. Encoding uses TextEncoder so emoji and non-Latin scripts round-trip correctly. Decoding strips whitespace from the pasted blob before `atob`, which matches how many APIs emit wrapped lines.',
    keywords: [
      'base64 encode',
      'base64 decode',
      'utf-8 base64',
      'base64 converter online',
    ],
    relatedSlugs: ['url-encoder-decoder', 'hash-generator'],
    faq: [
      {
        question: 'Is this the same as MIME Base64?',
        answer:
          'It is the common Base64 alphabet without line breaks. If you need PEM-style 64-column wrapping, wrap the output manually.',
      },
      {
        question: 'Why does decode fail?',
        answer:
          'The string must be valid Base64 (alphabet, padding). Corrupted padding or non-ASCII characters inside the encoding will throw an error.',
      },
      {
        question: 'Does data leave my browser?',
        answer:
          'No. Encode and decode run entirely with local JavaScript APIs.',
      },
    ],
  },
  {
    slug: 'case-converter',
    title: 'Case converter',
    categoryId: 'text',
    searchVolumePriority: 74,
    shortDescription:
      'Switch text between upper, lower, title, sentence, camelCase, snake_case, and more.',
    description:
      'Free text case converter online: camelCase, CONSTANT_CASE, Title Case, Unicode-aware.',
    longDescription:
      'Clean up names, constants, or pasted prose with one click. Title case is Unicode letter aware. Identifier helpers split on spaces, hyphens, underscores, and camel-case boundaries so you can refactor labels without reaching for an editor macro. Output updates in a dedicated pane so your source text stays intact until you copy.',
    keywords: [
      'case converter',
      'camelCase converter',
      'snake_case online',
      'title case generator',
    ],
    relatedSlugs: ['remove-line-breaks', 'base64-encoder-decoder'],
    faq: [
      {
        question: 'How does sentence case work?',
        answer:
          'The string is lowercased, the first letter is capitalized, and letters after ., !, or ? are capitalized following whitespace.',
      },
      {
        question: 'Does title case handle accents?',
        answer:
          'Yes. Word detection uses Unicode letters (`\\p{L}`) so accented characters are preserved and capitalized correctly.',
      },
      {
        question: 'Can I convert multi-line blocks?',
        answer:
          'Yes. The whole textarea is transformed; line breaks remain unless a specific mode removes them elsewhere.',
      },
    ],
  },
  {
    slug: 'url-encoder-decoder',
    title: 'URL encoder & decoder',
    categoryId: 'developers',
    searchVolumePriority: 82,
    shortDescription:
      'Percent-encode query values or full URLs with encodeURIComponent or encodeURI modes.',
    description:
      'Encode and decode URLs online: component mode vs full URI—locally, with clear errors.',
    longDescription:
      'Component mode uses `encodeURIComponent` / `decodeURIComponent`, which is what you want for individual query values or path segments. Full URL mode uses `encodeURI` / `decodeURI`, leaving delimiters like `:`, `/`, `?`, `#` intact. Toggle modes when switching between values pulled from forms and entire hrefs copied from the address bar.',
    keywords: [
      'url encode',
      'url decode',
      'percent encode',
      'encodeURIComponent online',
    ],
    relatedSlugs: ['base64-encoder-decoder', 'json-formatter'],
    faq: [
      {
        question: 'Why did decode throw “Invalid” in component mode?',
        answer:
          '`decodeURIComponent` is strict. Characters that were never percent-encoded (or malformed sequences) trigger an error.',
      },
      {
        question: 'When should I pick full URL mode?',
        answer:
          'Use it when escaping an entire href and you still need slashes and colons untouched. For form fields, stick to component mode.',
      },
      {
        question: 'Is this a server-side log?',
        answer: 'No. Encode and decode happen purely in your browser session.',
      },
    ],
  },
  {
    slug: 'timestamp-converter',
    title: 'Timestamp converter',
    categoryId: 'developers',
    searchVolumePriority: 76,
    shortDescription:
      'Convert Unix seconds or milliseconds and ISO strings to every common format at once.',
    description:
      'Unix timestamp to date converter: UTC ISO, local time, seconds, and milliseconds—instantly.',
    longDescription:
      'Paste an epoch value or a string `Date.parse` understands to see synchronized outputs. Short numeric strings (<10 digits) default to seconds while longer values default to milliseconds—use the toggles when APIs disagree. Handy for JWT `exp`, log correlation, and API debugging next to the JSON formatter.',
    keywords: [
      'unix timestamp converter',
      'epoch converter',
      'milliseconds to date',
      'iso 8601 converter',
    ],
    relatedSlugs: ['uuid-generator', 'json-formatter'],
    faq: [
      {
        question: 'How do you choose seconds vs milliseconds?',
        answer:
          'By default, integers with fewer than 10 absolute digits are multiplied by 1000; longer integers are treated as milliseconds. Check a toggle to force either interpretation.',
      },
      {
        question: 'Which time zone is ISO output?',
        answer:
          '`toISOString` is always UTC with a trailing Z. The “Local string” card shows the browser zone.',
      },
      {
        question: 'Why does my date string fail?',
        answer:
          'The value must parse in the current browser. Sticky formats may need zero-padding or an explicit offset.',
      },
    ],
  },
  {
    slug: 'hash-generator',
    title: 'Hash generator (SHA)',
    categoryId: 'security',
    searchVolumePriority: 88,
    shortDescription:
      'Compute SHA-1, SHA-256, SHA-384, or SHA-512 digests as hex using Web Crypto.',
    description:
      'Free SHA hash generator in-browser: SHA-256, SHA-384, SHA-512, SHA-1 hex output.',
    longDescription:
      'Hash arbitrary UTF-8 strings for checksums, cache keys, or verifying downloads when you already trust the source binary. The digest uses `crypto.subtle.digest`, so it only runs in secure contexts (HTTPS or localhost).',
    keywords: [
      'sha256 hash',
      'sha512 generator',
      'hash text online',
      'web crypto digest',
    ],
    relatedSlugs: ['password-generator', 'base64-encoder-decoder'],
    faq: [
      {
        question: 'Why is MD5 missing?',
        answer:
          'MD5 is not available in Web Crypto and is not recommended for security-sensitive use.',
      },
      {
        question: 'Is SHA-1 safe for security guarantees?',
        answer:
          'SHA-1 is deprecated for collision resistance. Prefer SHA-256+ for integrity guarantees; SHA-1 remains for legacy checksum tooling only.',
      },
      {
        question: 'Does this upload my input?',
        answer: 'No. Hashing happens entirely on-device inside the tab.',
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

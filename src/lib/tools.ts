export const TOOL_CATEGORY_LABELS = {
  text: 'Text',
  images: 'Images',
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
  /**
   * Optional: tools in the same category with the same id are listed adjacently
   * (nav dropdown + home)—e.g. reverse image converters stay together.
   */
  navPairId?: string;
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
        question:
          'Is this online line break remover private? Does my text get uploaded?',
        answer:
          'No. The transformation runs entirely in your browser using local JavaScript, so pasted content does not leave your machine through this page.',
      },
      {
        question:
          'What is the difference between “replace newlines, collapse spaces” and “remove newlines only”?',
        answer:
          '“Replace newlines, collapse spaces” turns every newline into a space and merges repeated whitespace into a single space. “Remove newlines only” deletes line breaks while leaving other spacing characters as-is.',
      },
      {
        question: 'Does removing line breaks work with Unicode text and emoji?',
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
        question:
          'Is this JSON formatter private? Is my JSON stored on a server?',
        answer:
          'No storage step is involved. Parsing and formatting happen locally, so sensitive payloads are not transmitted by this utility.',
      },
      {
        question:
          'Why does JSON format, prettify, or validate fail with an error?',
        answer:
          'The input must be valid JSON: double-quoted keys, commas between items, and matching brackets. The error message references the first parse failure the browser reports.',
      },
      {
        question: 'Can I minify JSON that contains Unicode characters?',
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
        question:
          'Are UUID v4 values from this generator OK for database and API keys?',
        answer:
          'Version 4 UUIDs from a modern browser use the Web Crypto API (or an equivalent fallback) to collect random bytes, which is appropriate for general-purpose unique identifiers.',
      },
      {
        question: 'Is a random UUID guaranteed to be unique worldwide?',
        answer:
          'UUID v4 values are statistically unique for practical purposes, but no client-side tool can offer an absolute guarantee without a central registry.',
      },
      {
        question: 'Can I generate multiple UUIDs at once or in bulk?',
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
        question: 'Is this online password generator secure for real accounts?',
        answer:
          'Generated passwords use browser crypto randomness when available. For important accounts, store them in a password manager and enable multi-factor authentication.',
      },
      {
        question:
          'What happens if I uncheck all character types (symbols, numbers, etc.)?',
        answer:
          'The generator falls back to letters and numbers so it can still produce output, but you should select character classes that satisfy your target policy.',
      },
      {
        question:
          'Is my password sent over the internet or saved on your servers?',
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
        question:
          'Is this the same as MIME Base64 or PEM Base64 with line breaks?',
        answer:
          'It is the common Base64 alphabet without line breaks. If you need PEM-style 64-column wrapping, wrap the output manually.',
      },
      {
        question: 'Why does Base64 decode fail or show an error?',
        answer:
          'The string must be valid Base64 (alphabet, padding). Corrupted padding or non-ASCII characters inside the encoding will throw an error.',
      },
      {
        question:
          'Does Base64 encode/decode upload my text or leave my browser?',
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
        question:
          'How does sentence case conversion work in this text case converter?',
        answer:
          'The string is lowercased, the first letter is capitalized, and letters after ., !, or ? are capitalized following whitespace.',
      },
      {
        question:
          'Does title case work with accented letters and non-English text?',
        answer:
          'Yes. Word detection uses Unicode letters (`\\p{L}`) so accented characters are preserved and capitalized correctly.',
      },
      {
        question:
          'Can I convert multi-line text to camelCase, snake_case, or title case?',
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
        question:
          'Why does URL decode fail with an “invalid” error in component mode?',
        answer:
          '`decodeURIComponent` is strict. Characters that were never percent-encoded (or malformed sequences) trigger an error.',
      },
      {
        question:
          'When should I use full URL encode/decode vs query component mode?',
        answer:
          'Use component mode (encodeURIComponent) for individual query values or path segments. Use full URL mode (encodeURI) when you need to escape an entire href but keep delimiters like slashes and colons intact.',
      },
      {
        question: 'Is URL encoding and decoding done on your server?',
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
        question:
          'How does this Unix timestamp converter tell seconds apart from milliseconds?',
        answer:
          'By default, integers with fewer than 10 absolute digits are multiplied by 1000; longer integers are treated as milliseconds. Check a toggle to force either interpretation.',
      },
      {
        question: 'What time zone is the ISO 8601 output—UTC or local?',
        answer:
          '`toISOString` is always UTC with a trailing Z. The “Local string” card shows the browser zone.',
      },
      {
        question: 'Why does my date string or epoch value fail to parse?',
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
        question: 'Why is there no MD5 hash option in this SHA generator?',
        answer:
          'MD5 is not available in Web Crypto and is not recommended for security-sensitive use.',
      },
      {
        question: 'Is SHA-1 still safe for security and file integrity?',
        answer:
          'SHA-1 is deprecated for collision resistance. Prefer SHA-256+ for integrity guarantees; SHA-1 remains for legacy checksum tooling only.',
      },
      {
        question: 'Does this SHA hash tool upload my text or files?',
        answer: 'No. Hashing happens entirely on-device inside the tab.',
      },
    ],
  },
  {
    slug: 'webp-to-png',
    title: 'WEBP to PNG converter',
    categoryId: 'images',
    navPairId: 'webp-png',
    searchVolumePriority: 81,
    shortDescription:
      'Export WEBP images to lossless PNG in your browser—instant download, no upload.',
    description:
      'Convert WEBP to PNG online for compatibility. Local canvas conversion; files stay on your device.',
    longDescription:
      'Use this when you need a PNG for tools that do not read WEBP, for lossless workflows, or for transparency-friendly handoffs. Decoding and PNG encoding run in your browser. For the reverse (PNG → WEBP), use the dedicated PNG to WEBP tool.',
    keywords: [
      'webp to png',
      'webp to png converter',
      'convert webp to png',
      'webp converter',
      'convert webp online',
    ],
    relatedSlugs: ['png-to-webp', 'webp-to-jpg'],
    faq: [
      {
        question:
          'Is WEBP to PNG conversion private? Do you upload my WEBP files?',
        answer:
          'No. Files are decoded locally with ImageBitmap/Canvas and the PNG is built in-memory.',
      },
      {
        question: 'Why does WEBP to PNG conversion fail or not work?',
        answer:
          'The file must be a valid WEBP. Very large images may hit browser memory limits.',
      },
      {
        question: 'Does WEBP to PNG keep transparency and alpha?',
        answer: 'Yes—PNG supports alpha like WEBP.',
      },
    ],
  },
  {
    slug: 'webp-to-jpg',
    title: 'WEBP to JPG converter',
    categoryId: 'images',
    navPairId: 'webp-jpeg',
    searchVolumePriority: 79,
    shortDescription:
      'Convert WEBP photos to JPG/JPEG in your browser—fast download, files stay on your device.',
    description:
      'Convert WEBP to JPG online for maximum compatibility. Local conversion, no uploads.',
    longDescription:
      'Decode WEBP with the browser, draw to a canvas, and export as high-quality JPEG—useful when a CMS, printer, or older app only accepts JPG. Everything runs locally; we never see your files.',
    keywords: [
      'webp to jpg',
      'webp to jpeg',
      'convert webp to jpg',
      'webp jpg converter online',
    ],
    relatedSlugs: ['webp-to-png', 'jpg-to-webp'],
    faq: [
      {
        question:
          'Does converting WEBP to JPG reduce quality or change colors?',
        answer:
          'JPEG is lossy; you may see slight compression artifacts compared to WEBP. Quality is set to 92% in the encoder.',
      },
      {
        question: 'Does WEBP to JPG support transparency?',
        answer:
          'JPEG does not support alpha. Transparent areas are typically flattened on a background by the decoder/browser.',
      },
      {
        question: 'Is WEBP to JPG conversion private—are files uploaded?',
        answer: 'No. Conversion uses Canvas APIs fully inside your browser.',
      },
    ],
  },
  {
    slug: 'png-to-jpg',
    title: 'PNG to JPG converter',
    categoryId: 'images',
    navPairId: 'png-jpeg',
    searchVolumePriority: 78,
    shortDescription:
      'Turn PNG images into smaller JPEGs locally—ideal for sharing when you do not need transparency.',
    description:
      'PNG to JPEG converter online: browser-side conversion and instant download.',
    longDescription:
      'Smaller JPEGs are easier to email or upload where PNG is overkill. Transparency is not supported in JPEG—semi-transparent pixels are composited. Processing stays on your machine.',
    keywords: [
      'png to jpg',
      'png to jpeg',
      'convert png to jpg online',
      'png jpg converter',
    ],
    relatedSlugs: ['jpg-to-png', 'png-to-webp'],
    faq: [
      {
        question:
          'What happens to PNG transparency when converting PNG to JPG or JPEG?',
        answer:
          'JPEG cannot store alpha. Transparent regions are blended—usually on white or black depending on the browser.',
      },
      {
        question:
          'Can I change JPEG quality when converting PNG to JPG online?',
        answer:
          'This tool uses a fixed high-quality setting. For fine control, use an editor after download.',
      },
      {
        question: 'Is PNG to JPG conversion private? Do you store my image?',
        answer: 'No. Files never leave your browser tab.',
      },
    ],
  },
  {
    slug: 'jpg-to-png',
    title: 'JPG to PNG converter',
    categoryId: 'images',
    navPairId: 'png-jpeg',
    searchVolumePriority: 77,
    shortDescription:
      'Convert JPG/JPEG to lossless PNG in the browser—download without uploading your photos.',
    description:
      'JPEG to PNG converter online. Local processing; useful for editing pipelines that prefer PNG.',
    longDescription:
      'Re-wrap JPEG pixels into a PNG container when a workflow or tool requires PNG input. This does not recover quality lost by earlier JPEG compression, but avoids another lossy save cycle.',
    keywords: [
      'jpg to png',
      'jpeg to png',
      'convert jpg to png',
      'jpg png converter online',
    ],
    relatedSlugs: ['png-to-jpg', 'jpg-to-avif'],
    faq: [
      {
        question: 'Does JPG to PNG improve quality or undo JPEG compression?',
        answer:
          'No—detail lost to JPEG cannot be restored. PNG avoids additional lossy compression on future saves.',
      },
      {
        question: 'Why is my file bigger after converting JPG to PNG?',
        answer: 'PNG is lossless and often bigger than JPEG for photos.',
      },
      {
        question: 'Is JPG to PNG conversion private? Are photos uploaded?',
        answer: 'No. Decode and encode happen locally.',
      },
    ],
  },
  {
    slug: 'avif-to-png',
    title: 'AVIF to PNG converter',
    categoryId: 'images',
    navPairId: 'avif-png',
    searchVolumePriority: 75,
    shortDescription:
      'Decode AVIF images and export PNG—best in modern Chromium-based browsers.',
    description:
      'Convert AVIF to PNG online in-browser. AVIF decode support varies by browser.',
    longDescription:
      'AVIF offers great compression, but not every viewer supports it. Converting to PNG maximizes compatibility for design handoffs or older software. If decoding fails, try Chrome or Firefox current versions.',
    keywords: [
      'avif to png',
      'convert avif to png',
      'avif converter online',
      'avif to png free',
    ],
    relatedSlugs: ['png-to-avif', 'avif-to-jpg'],
    faq: [
      {
        question: 'Why does AVIF to PNG conversion fail or not open my file?',
        answer:
          'Your browser must decode AVIF. Safari support has improved over time; use the latest browser version.',
      },
      {
        question: 'Is PNG larger than AVIF when I convert AVIF to PNG online?',
        answer: 'Usually yes—PNG is larger than AVIF for the same dimensions.',
      },
      {
        question: 'Does AVIF to PNG preserve transparency?',
        answer: 'Yes—PNG supports alpha like AVIF.',
      },
    ],
  },
  {
    slug: 'heic-to-jpg',
    title: 'HEIC to JPG converter',
    categoryId: 'images',
    searchVolumePriority: 80,
    shortDescription:
      'Turn iPhone HEIC/HEIF photos into shareable JPEGs using client-side conversion.',
    description:
      'HEIC to JPEG converter in the browser. Uses local decoding—no server upload.',
    longDescription:
      'HEIC keeps photos efficient on Apple devices, but many platforms want JPEG. This page runs the heic2any library in your browser to produce downloadable JPGs. Very large files may take a moment; processing remains on-device.',
    keywords: [
      'heic to jpg',
      'heif to jpeg',
      'convert heic online',
      'iphone heic to jpg',
    ],
    relatedSlugs: ['webp-to-jpg', 'png-to-jpg'],
    faq: [
      {
        question: 'Can I convert JPG to HEIC or JPEG to HEIC on this site?',
        answer:
          'No. HEIC encoding is not available through the same browser canvas APIs we use for JPEG, PNG, and WEBP—this site only converts from HEIC to JPEG (decode client-side), not the other way.',
      },
      {
        question: 'Does HEIC to JPG work with all iPhone and HEIF photos?',
        answer:
          'Most iPhone HEIC/HEIF images work. Live Photos or proprietary variants may fail—export stills from Photos first if needed.',
      },
      {
        question:
          'Is HEIC to JPG conversion private? Are iPhone photos uploaded to a server?',
        answer: 'No. heic2any runs in your browser page.',
      },
      {
        question: 'Why is HEIC to JPG slow for large photos?',
        answer:
          'HEIC decoding is CPU-heavy. Close other heavy tabs or try a smaller file.',
      },
    ],
  },
  {
    slug: 'png-to-webp',
    title: 'PNG to WEBP converter',
    categoryId: 'images',
    navPairId: 'webp-png',
    searchVolumePriority: 76,
    shortDescription:
      'Encode PNG images to smaller WEBP files in your browser—instant download.',
    description:
      'Convert PNG to WEBP online. Local canvas encoding; files stay on your device.',
    longDescription:
      'Shrink assets for the web when you no longer need a lossless PNG container. Encoding runs locally via Canvas; if your browser cannot encode WEBP, the page will report it—try a current Chromium or Firefox. For WEBP → PNG, use the dedicated WEBP to PNG tool.',
    keywords: [
      'png to webp',
      'convert png to webp',
      'png webp converter',
      'png to webp online',
    ],
    relatedSlugs: ['webp-to-png', 'png-to-jpg'],
    faq: [
      {
        question:
          'Is PNG to WEBP conversion private—do you upload my PNG files?',
        answer:
          'No. Your image is decoded and re-encoded entirely inside the browser tab.',
      },
      {
        question: 'Why does PNG to WEBP export fail in my browser?',
        answer:
          'Canvas WEBP encoding is not available in every browser or build. Update the browser or export PNG/JPEG from this site’s other converters.',
      },
      {
        question: 'Is PNG to WEBP lossless like PNG?',
        answer:
          'Typical WEBP encoding from canvas is lossy unless the browser exposes lossless modes; expect some change vs PNG for smaller size.',
      },
    ],
  },
  {
    slug: 'jpg-to-webp',
    title: 'JPG to WEBP converter',
    categoryId: 'images',
    navPairId: 'webp-jpeg',
    searchVolumePriority: 75,
    shortDescription:
      'Re-encode JPEG photos as WEBP for smaller files—conversion stays on your device.',
    description:
      'Convert JPG/JPEG to WEBP online. Browser-side encoding; no upload.',
    longDescription:
      'Use this when you want modern compression for photos already stored as JPEG. JPEG is already lossy, so WEBP can often reduce size further. Processing is local; WEBP export requires browser support.',
    keywords: [
      'jpg to webp',
      'jpeg to webp',
      'convert jpg to webp',
      'jpeg webp converter online',
    ],
    relatedSlugs: ['webp-to-jpg', 'png-to-webp'],
    faq: [
      {
        question:
          'Will JPG to WEBP improve image quality compared to the original JPEG?',
        answer:
          'Not really—you cannot recover detail lost in the original JPEG. WEBP may still shrink the file.',
      },
      {
        question: 'Why does JPG to WEBP encoding fail?',
        answer:
          'If the browser cannot encode WEBP from canvas, try another browser or keep JPEG.',
      },
      {
        question: 'Is JPG to WEBP private—are my photos uploaded?',
        answer: 'No. Conversion uses local Canvas APIs only.',
      },
    ],
  },
  {
    slug: 'png-to-avif',
    title: 'PNG to AVIF converter',
    categoryId: 'images',
    navPairId: 'avif-png',
    searchVolumePriority: 73,
    shortDescription:
      'Encode PNG images to AVIF when your browser supports AVIF export—local, no upload.',
    description:
      'Convert PNG to AVIF online in-browser. AVIF encode support varies (often Chromium).',
    longDescription:
      'AVIF can produce very small files for the same dimensions. This tool draws your PNG to a canvas and requests `image/avif`. If export is unsupported, try Chrome or Edge current versions. For AVIF → PNG, use the AVIF to PNG tool.',
    keywords: [
      'png to avif',
      'convert png to avif',
      'png avif converter',
      'png to avif online',
    ],
    relatedSlugs: ['avif-to-png', 'jpg-to-avif'],
    faq: [
      {
        question: 'Why does PNG to AVIF conversion or export fail?',
        answer:
          'AVIF encoding from canvas is not universal. Safari and some browsers may lack encoders even if they can decode AVIF.',
      },
      {
        question: 'Does PNG to AVIF keep transparency?',
        answer:
          'When encoding succeeds, alpha is typically preserved; verify in your target pipeline.',
      },
      {
        question: 'Is PNG to AVIF conversion private? Do you store my file?',
        answer: 'No. Files never leave your device through this page.',
      },
    ],
  },
  {
    slug: 'jpg-to-avif',
    title: 'JPG to AVIF converter',
    categoryId: 'images',
    navPairId: 'jpeg-avif',
    searchVolumePriority: 72,
    shortDescription:
      'Encode JPEG photos as AVIF in supported browsers—smaller payloads, local processing.',
    description:
      'Convert JPG/JPEG to AVIF online. Requires browser AVIF encoding support.',
    longDescription:
      'Hand off JPEGs into AVIF for modern delivery stacks. The JPEG is decoded and re-encoded, so you do not regain lost detail, but file size may drop. If the browser cannot encode AVIF, use PNG/JPEG/WebP converters here instead.',
    keywords: [
      'jpg to avif',
      'jpeg to avif',
      'convert jpg to avif',
      'jpeg avif converter',
    ],
    relatedSlugs: ['avif-to-jpg', 'avif-to-png'],
    faq: [
      {
        question:
          'Why convert JPG to AVIF instead of keeping JPEG for the web?',
        answer:
          'AVIF often beats JPEG on size at similar perceived quality when the encoder is available.',
      },
      {
        question: 'Why does JPG to AVIF conversion fail, and how can I fix it?',
        answer:
          'Try a Chromium-based browser with current AVIF encode support, or export WEBP/PNG instead.',
      },
      {
        question: 'Is JPG to AVIF private—are images uploaded?',
        answer: 'No. Everything runs locally in the tab.',
      },
    ],
  },
  {
    slug: 'avif-to-jpg',
    title: 'AVIF to JPG converter',
    categoryId: 'images',
    navPairId: 'jpeg-avif',
    searchVolumePriority: 73,
    shortDescription:
      'Decode AVIF images and export JPEG for broad compatibility—runs locally in your browser.',
    description:
      'Convert AVIF to JPG/JPEG online. Requires a browser that can decode AVIF.',
    longDescription:
      'Use this when you need a JPEG for email, legacy apps, or workflows that do not accept AVIF. The file is drawn to a canvas and exported as high-quality JPEG. If import fails, your browser may not decode AVIF—try a current Chromium build or Firefox. For the reverse, use JPG to AVIF.',
    keywords: [
      'avif to jpg',
      'avif to jpeg',
      'convert avif to jpg',
      'avif jpg converter online',
    ],
    relatedSlugs: ['jpg-to-avif', 'avif-to-webp'],
    faq: [
      {
        question:
          'Why does AVIF to JPG conversion fail or not read my AVIF file?',
        answer:
          'AVIF decode is required before export. Update your browser or try another one that supports AVIF.',
      },
      {
        question: 'Does AVIF to JPG keep transparency?',
        answer:
          'No—JPEG has no alpha channel; transparent areas are flattened.',
      },
      {
        question: 'Is AVIF to JPG private—do you upload my images?',
        answer: 'No. Decoding and encoding stay in your browser tab.',
      },
    ],
  },
  {
    slug: 'webp-to-avif',
    title: 'WEBP to AVIF converter',
    categoryId: 'images',
    navPairId: 'webp-avif',
    searchVolumePriority: 71,
    shortDescription:
      'Re-encode WEBP images as AVIF in supported browsers—on-device, downloadable.',
    description:
      'Convert WEBP to AVIF online when your browser can encode AVIF from canvas.',
    longDescription:
      'Move from WEBP to AVIF for pipelines that prefer AVIF delivery. Both formats support transparency and modern compression. Encode availability depends on the browser; decode failures mean the file may be corrupt or unsupported.',
    keywords: [
      'webp to avif',
      'convert webp to avif',
      'webp avif converter',
      'webp to avif online',
    ],
    relatedSlugs: ['avif-to-webp', 'webp-to-jpg'],
    faq: [
      {
        question: 'Why does WEBP to AVIF conversion fail in my browser?',
        answer:
          'Both WEBP decode and AVIF encode must succeed. Update the browser or try Chrome or Edge.',
      },
      {
        question: 'Is AVIF smaller than WEBP after converting WEBP to AVIF?',
        answer:
          'Often, but not guaranteed; depends on content and encoder settings.',
      },
      {
        question: 'Is WEBP to AVIF conversion private and local?',
        answer:
          'Yes. Conversion runs in your browser; no upload step is implemented on this page.',
      },
    ],
  },
  {
    slug: 'avif-to-webp',
    title: 'AVIF to WEBP converter',
    categoryId: 'images',
    navPairId: 'webp-avif',
    searchVolumePriority: 70,
    shortDescription:
      'Decode AVIF and export WEBP when your browser supports both decode and WEBP encode.',
    description:
      'Convert AVIF to WEBP online. Local canvas pipeline; no server upload.',
    longDescription:
      'Hand off AVIF assets to WEBP when you need slightly wider tool support than raw AVIF but still want modern compression. Both decode (AVIF) and canvas WEBP encoding must be available. For WEBP → AVIF, use the dedicated WEBP to AVIF tool.',
    keywords: [
      'avif to webp',
      'convert avif to webp',
      'avif webp converter',
      'avif to webp online',
    ],
    relatedSlugs: ['webp-to-avif', 'avif-to-jpg'],
    faq: [
      {
        question:
          'Why does AVIF to WEBP conversion fail (decode or encode error)?',
        answer:
          'Either AVIF decode failed or WEBP export is not supported in this browser. Try current Chrome or Edge.',
      },
      {
        question: 'Does AVIF to WEBP preserve transparency?',
        answer:
          'WEBP supports alpha; when encoding succeeds, transparency is typically kept.',
      },
      {
        question: 'Is AVIF to WEBP private—are files uploaded?',
        answer: 'No. All steps run locally in your browser.',
      },
    ],
  },
];

const CATEGORY_ORDER: ToolCategoryId[] = [
  'text',
  'images',
  'developers',
  'security',
];

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

const TOOL_BY_SLUG = new Map(TOOLS.map((tool) => [tool.slug, tool]));

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOL_BY_SLUG.get(slug);
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

/** List paired tools adjacently; cluster order follows the highest searchVolumePriority in the pair. */
function sortToolsWithinCategory(tools: ToolDefinition[]): ToolDefinition[] {
  const clusterKey = (t: ToolDefinition) => t.navPairId ?? `__single:${t.slug}`;

  const byCluster = new Map<string, ToolDefinition[]>();
  for (const t of tools) {
    const k = clusterKey(t);
    const list = byCluster.get(k) ?? [];
    list.push(t);
    byCluster.set(k, list);
  }

  const clusters = [...byCluster.values()].map((items) => ({
    items,
    maxPriority: Math.max(...items.map((t) => t.searchVolumePriority)),
  }));

  clusters.sort((a, b) => b.maxPriority - a.maxPriority);

  const out: ToolDefinition[] = [];
  for (const c of clusters) {
    c.items.sort((a, b) => b.searchVolumePriority - a.searchVolumePriority);
    out.push(...c.items);
  }
  return out;
}

export function getToolsGroupedByCategory(): {
  categoryId: ToolCategoryId;
  tools: ToolDefinition[];
}[] {
  return CATEGORY_ORDER.map((categoryId) => ({
    categoryId,
    tools: sortToolsWithinCategory(
      TOOLS.filter((t) => t.categoryId === categoryId),
    ),
  })).filter((group) => group.tools.length > 0);
}

export function getMaxSearchVolumePriority(): number {
  return Math.max(1, ...TOOLS.map((t) => t.searchVolumePriority));
}

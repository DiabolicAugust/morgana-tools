/** Canonical ids used in URLs: `{from}-to-{to}` (hyphen alias for underscores). */

export type EbookFormatId =
  | 'txt'
  | 'markdown'
  | 'html'
  | 'epub'
  | 'fb2'
  | 'pdf'
  | 'docx'
  | 'odt'
  | 'rtf'
  | 'pml'
  | 'cbz'
  | 'pages_zip';

export type EbookCategoryGroupId =
  | 'plain_markup'
  | 'reflow_books'
  | 'documents'
  | 'office'
  | 'legacy_markup'
  | 'comics';

export const EBOOK_CATEGORY_LABELS: Record<EbookCategoryGroupId, string> = {
  plain_markup: 'Text & markup',
  reflow_books: 'Reflowable books',
  documents: 'Documents',
  office: 'Office files',
  legacy_markup: 'Legacy reader markup',
  comics: 'Comics & page bundles',
};

/** Category order shown in Morgana selectors (sources + targets grouped). */
export const EBOOK_CATEGORY_NAV_ORDER = [
  'plain_markup',
  'reflow_books',
  'documents',
  'office',
  'legacy_markup',
  'comics',
] as const satisfies readonly EbookCategoryGroupId[];

export const EBOOK_FORMAT_CATEGORY: Record<EbookFormatId, EbookCategoryGroupId> = {
  txt: 'plain_markup',
  markdown: 'plain_markup',
  html: 'plain_markup',
  epub: 'reflow_books',
  fb2: 'reflow_books',
  pdf: 'documents',
  docx: 'office',
  odt: 'office',
  rtf: 'legacy_markup',
  pml: 'legacy_markup',
  cbz: 'comics',
  pages_zip: 'comics',
};

/** Short UI label — extension stem, uppercase for scanability (no leading dot in titles). */
export const EBOOK_FORMAT_DISPLAY: Record<EbookFormatId, string> = {
  txt: 'TXT',
  markdown: 'MD',
  html: 'HTML',
  epub: 'EPUB',
  fb2: 'FB2',
  pdf: 'PDF',
  docx: 'DOCX',
  odt: 'ODT',
  rtf: 'RTF',
  pml: 'PML',
  cbz: 'CBZ',
  pages_zip: 'ZIP',
};

export function ebookSlugSegment(fmt: EbookFormatId): string {
  return fmt === 'pages_zip' ? 'pages-zip' : fmt;
}

export function acceptForFormat(fmt: EbookFormatId): string {
  switch (fmt) {
    case 'txt':
      return '.txt,text/plain';
    case 'markdown':
      return '.md,.markdown,text/markdown,text/plain';
    case 'html':
      return '.html,.htm,text/html';
    case 'epub':
      return '.epub,application/epub+zip';
    case 'fb2':
      return '.fb2,text/xml,application/xml,application/octet-stream';
    case 'pdf':
      return '.pdf,application/pdf';
    case 'docx':
      return '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'odt':
      return '.odt,application/vnd.oasis.opendocument.text';
    case 'rtf':
      return '.rtf,application/rtf,text/rtf';
    case 'pml':
      return '.pml,.prc,text/plain';
    case 'cbz':
      return '.cbz,application/vnd.comicbook+zip,application/x-cbz';
    case 'pages_zip':
      return '.zip,application/zip,application/x-zip-compressed';
  }
}

export function defaultExtension(fmt: EbookFormatId): string {
  switch (fmt) {
    case 'pdf':
      return 'pdf';
    case 'markdown':
      return 'md';
    case 'pages_zip':
      return 'zip';
    default:
      return fmt === 'txt' ? 'txt' : fmt;
  }
}

export function mimeForDownload(fmt: EbookFormatId): string {
  switch (fmt) {
    case 'html':
      return 'text/html;charset=utf-8';
    case 'markdown':
      return 'text/markdown;charset=utf-8';
    case 'epub':
      return 'application/epub+zip';
    case 'pdf':
      return 'application/pdf';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'rtf':
      return 'application/rtf';
    case 'fb2':
      return 'application/xml';
    case 'pml':
      return 'text/plain;charset=utf-8';
    case 'cbz':
      return 'application/vnd.comicbook+zip';
    case 'pages_zip':
      return 'application/zip';
    default:
      return 'text/plain;charset=utf-8';
  }
}

import { cbzBlobToOrderedPagesZipBlob, orderedPagesZipBlobToCbzBlob } from '@/lib/cbz-pages-zip';
import { ebookPairIsSupported } from '@/lib/ebook-conversion-routes';
import type { EbookFormatId } from '@/lib/ebook-formats';
import {
  buildMinimalEpubZipBlob,
  paragraphsFromPlainTextToXhtmlBodies,
} from '@/lib/epub-build';
import { epubBlobToPlainText, epubBlobToStandaloneHtml } from '@/lib/epub-plain-text';
import { fb2XmlToPlainText } from '@/lib/fb2-plain-text';
import { htmlFileToPlainText } from '@/lib/html-plain-text';
import { markdownToPlainText } from '@/lib/md-plain-text';
import {
  docxZipBlobToPlainText,
  odtZipBlobToPlainText,
} from '@/lib/office-xml-plain-text';
import { pdfBlobToPlainText } from '@/lib/pdf-plain-text';
import { pmlToPlainText } from '@/lib/pml-plain-text';
import { rtfToPlainText } from '@/lib/rtf-plain-text';

function stemName(originalName: string): string {
  const base =
    originalName.replace(/[/\\]+$/, '').replace(/^.*[/\\]/, '').trim() || 'converted';
  const noExt = base.replace(/\.[^.]+$/, '');
  const underscored = noExt.replace(/\s+/g, '_');
  return underscored || 'converted';
}

function escapeHtmlText(s: string): string {
  return s.replace(/[<>&]/g, (ch) =>
    ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : '&amp;',
  );
}

function plainToFb2(raw: string, title: string): string {
  const text = raw.replace(/\r\n/g, '\n').trim();
  if (!text) throw new Error('Nothing to serialize into FictionBook FB2.');
  const paras = text.split(/\n{2,}/g).filter((p) => p.trim());
  const tt = escapeHtmlText(title.trim() || 'Untitled');

  const bodyParas = paras
    .flatMap((p) =>
      p
        .trim()
        .split(/\n/g)
        .map((ln) => `    <p>${escapeHtmlText(ln.trim())}</p>`),
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0">
  <description>
    <title-info>
      <book-title>${tt}</book-title>
      <lang>en</lang>
    </title-info>
    <document-info>
      <program-used>Morgana Ebook toolkit</program-used>
    </document-info>
  </description>
  <body>
    <title><p>${tt}</p></title>
${bodyParas ? `    <section>\n${bodyParas}\n    </section>` : ''}
  </body>
</FictionBook>`;
}

function rtfEscapeParagraph(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/{|}/g, '\\$&').replace(/\u00a0/g, ' ');
}

function plainTextToMinimalRtf(text: string): string {
  const t = text.replace(/\r\n/g, '\n').trim();
  if (!t) throw new Error('Nothing to encode into RTF.');
  const lines = t.split(/\n/g).map((l) => `${rtfEscapeParagraph(l.trim())}\\par`).join('');
  return `{\\rtf1\\ansi\\deff0 {\\fonttbl{\\f0 Helvetica;}}\\fs24\n${lines}\n}`;
}

function escapePmlLiterals(s: string): string {
  return s.replace(/\\/g, '\\\\');
}

function plainTextToPmlChapter(text: string, titleHint: string): string {
  const t = text.replace(/\r\n/g, '\n').trim();
  if (!t) throw new Error('Nothing to encode into PML.');
  const chapterTitle = escapePmlLiterals(titleHint.trim() || 'Untitled chapter');
  const paras = t.split(/\n{2,}/g).filter((x) => x.trim());

  let out = `\\cx ${chapterTitle}\\n\\v Morgana export\\n`;
  for (const p of paras) {
    const lines = p.trim().split(/\n/g).map((ln) => escapePmlLiterals(ln.trim()));
    out += `\\p\\n${lines.join('\\n')}\\n`;
  }
  return out;
}

async function markdownToHtmlFragment(md: string): Promise<string> {
  const showdown = (await import('showdown')).default;
  const conv = new showdown.Converter();
  conv.setFlavor('github');
  return conv.makeHtml(md);
}

async function turndownFromHtmlFragment(htmlFragment: string): Promise<string> {
  const TurndownService = (await import('turndown')).default;
  const service = new TurndownService();
  return service.turndown(htmlFragment);
}

async function resolvedHtmlChapterDiv(file: File): Promise<string> {
  const raw = await file.text();
  if (!raw.trim()) throw new Error('HTML document looks empty.');
  const doc = new DOMParser().parseFromString(raw, 'text/html');
  const body = doc.body ?? doc.documentElement;
  const inner = body.innerHTML?.trim();
  if (inner?.length) {
    return `<div xmlns="http://www.w3.org/1999/xhtml">${inner}</div>`;
  }

  let t =
    body.innerText?.replace(/\u00a0/g, ' ') ??
    body.textContent?.replace(/\u00a0/g, ' ') ??
    '';
  t = t.replace(/\r\n/g, '\n').trim();
  if (!t) throw new Error('No textual content extracted from HTML.');

  const innerFromPlain = paragraphsFromPlainTextToXhtmlBodies(t).join('');
  return `<div xmlns="http://www.w3.org/1999/xhtml">${innerFromPlain}</div>`;
}

function plainSnippetToDivBodies(plain: string): string {
  const inner = paragraphsFromPlainTextToXhtmlBodies(plain.trim()).join('');
  return `<div xmlns="http://www.w3.org/1999/xhtml">${inner}</div>`;
}

function standaloneHtmlBlob(fullBodyInner: string, pageTitle: string): Blob {
  const safeTitle = pageTitle.trim() || 'Document';
  const wrapped = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtmlText(safeTitle)}</title>
<style>
body{max-width:42rem;margin:2rem auto;padding:0 1rem;font-family:system-ui;line-height:1.5;}
code{font-family:ui-monospace,monospace;background:rgba(122,122,122,.08);padding:2px 4px;border-radius:4px;}
pre{font-family:ui-monospace,monospace;background:rgba(122,122,122,.08);padding:.75rem;overflow:auto;}
</style>
</head>
<body>
${fullBodyInner}
</body>
</html>`;
  return new Blob([wrapped], { type: 'text/html;charset=utf-8' });
}

async function plainToPdfBlob(raw: string): Promise<Blob> {
  const trimmed = raw.replace(/\r\n/g, '\n').trim();
  if (!trimmed) throw new Error('Nothing to render into PDF pages.');
  const { jsPDF } = await import('jspdf');

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const lines = pdf.splitTextToSize(trimmed, 180);

  let y = 14;
  const lh = 5.8;
  for (const ln of lines) {
    if (y > 280) {
      pdf.addPage();
      y = 14;
    }
    pdf.text(ln, 14, y);
    y += lh;
  }

  const out = pdf.output('blob');
  return out instanceof Blob ? out : new Blob([out], { type: 'application/pdf' });
}

async function plainToDocxBlob(raw: string): Promise<Blob> {
  const trimmed = raw.replace(/\r\n/g, '\n').trim();
  if (!trimmed) throw new Error('Nothing to package into DOCX paragraphs.');
  const { Document, Packer, Paragraph, TextRun } = await import('docx');

  const paras = trimmed.split(/\n{2,}/g).filter((p) => p.trim());
  const children = paras.map((p) => {
    const line = p.replace(/\n+/g, ' ').trim();
    return new Paragraph({
      children: [new TextRun({ text: line })],
    });
  });

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBlob(doc);
}

function mainInnerHtmlFromStandaloneDoc(htmlDoc: string): string {
  const doc = new DOMParser().parseFromString(htmlDoc, 'text/html');
  const root = doc.getElementById('main') ?? doc.body ?? doc.documentElement;
  return root.innerHTML.trim();
}

async function fileToPivotPlain(file: File, from: EbookFormatId): Promise<string> {
  switch (from) {
    case 'txt':
      return (await file.text()).replace(/^\uFEFF/, '');
    case 'markdown':
      return markdownToPlainText(await file.text());
    case 'html':
      return htmlFileToPlainText(file);
    case 'epub':
      return epubBlobToPlainText(file);
    case 'pdf':
      return pdfBlobToPlainText(file);
    case 'docx':
      return docxZipBlobToPlainText(file);
    case 'odt':
      return odtZipBlobToPlainText(file);
    case 'rtf':
      return rtfToPlainText(await file.text());
    case 'pml':
      return pmlToPlainText(await file.text());
    case 'fb2':
      return fb2XmlToPlainText(await file.text());
    case 'pages_zip':
    case 'cbz':
      throw new Error('Binary comic flows do not pivot through plain prose.');
    default: {
      const _exhaustive: never = from;
      return _exhaustive;
    }
  }
}

async function blobFromPivotPlain(
  to: EbookFormatId,
  plain: string,
  title: string,
): Promise<Blob> {
  switch (to) {
    case 'txt':
      return new Blob([plain.trimEnd()], { type: 'text/plain;charset=utf-8' });
    case 'markdown':
      return new Blob([plain.replace(/\r\n/g, '\n').trim()], {
        type: 'text/markdown;charset=utf-8',
      });
    case 'html': {
      const inner = plainSnippetToDivBodies(plain);
      const body = `<main class="reader">\n${inner}\n</main>`;
      return standaloneHtmlBlob(body, title || 'Converted');
    }
    case 'epub': {
      let bodies = paragraphsFromPlainTextToXhtmlBodies(plain);
      if (bodies.length === 0) {
        bodies = [`<p>${escapeHtmlText(plain.trim())}</p>`];
      }
      return buildMinimalEpubZipBlob({
        title: title || 'Converted',
        chapterBodiesXhtml: bodies,
      });
    }
    case 'fb2':
      return new Blob([plainToFb2(plain, title)], {
        type: 'application/xml',
      });
    case 'pdf':
      return plainToPdfBlob(plain);
    case 'docx':
      return plainToDocxBlob(plain);
    case 'rtf':
      return new Blob([plainTextToMinimalRtf(plain)], {
        type: 'application/rtf',
      });
    case 'pml':
      return new Blob([plainTextToPmlChapter(plain, title)], {
        type: 'text/plain;charset=utf-8',
      });
    case 'odt':
    case 'pages_zip':
    case 'cbz':
      throw new Error('Pivot cannot emit comic bundles or LibreOffice originals.');
    default: {
      const _exhaustive: never = to;
      throw new Error(`Unsupported pivot destination: ${_exhaustive}`);
    }
  }
}

async function epubFromMarkdownFile(file: File, titleStem: string): Promise<Blob> {
  const md = await file.text();
  if (!md.trim()) throw new Error('Markdown manuscript looks empty.');
  const frag = await markdownToHtmlFragment(md);
  const chapter = `<div xmlns="http://www.w3.org/1999/xhtml">${frag}</div>`;
  return buildMinimalEpubZipBlob({
    title: titleStem || 'Converted',
    chapterBodiesXhtml: [chapter],
  });
}

export async function runEbookConversion(
  file: File,
  from: EbookFormatId,
  to: EbookFormatId,
): Promise<Blob> {
  if (from === to) {
    throw new Error('Source format and destination must differ.');
  }
  if (!ebookPairIsSupported(from, to)) {
    throw new Error(
      `This Morgana ebook pair (${from} → ${to}) is not wired up yet.`,
    );
  }

  const titleStem = stemName(file.name);

  if (from === 'cbz' && to === 'pages_zip') {
    return cbzBlobToOrderedPagesZipBlob(file);
  }
  if (from === 'pages_zip' && to === 'cbz') {
    return orderedPagesZipBlobToCbzBlob(file);
  }

  if (from === 'markdown' && to === 'html') {
    const md = await file.text();
    if (!md.trim()) throw new Error('Markdown file looks empty.');
    const fragment = await markdownToHtmlFragment(md);
    const body = `<main class="reader">${fragment}</main>`;
    return standaloneHtmlBlob(body, titleStem);
  }

  if (from === 'html' && to === 'markdown') {
    const div = await resolvedHtmlChapterDiv(file);
    const md = await turndownFromHtmlFragment(div);
    return new Blob([md], { type: 'text/markdown;charset=utf-8' });
  }

  if (from === 'markdown' && to === 'epub') {
    return epubFromMarkdownFile(file, titleStem);
  }

  if (from === 'html' && to === 'epub') {
    const chapter = await resolvedHtmlChapterDiv(file);
    return buildMinimalEpubZipBlob({
      title: titleStem,
      chapterBodiesXhtml: [chapter],
    });
  }

  if (from === 'epub' && to === 'html') {
    const htmlDoc = await epubBlobToStandaloneHtml(file);
    return new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
  }

  if (from === 'epub' && to === 'markdown') {
    const htmlDoc = await epubBlobToStandaloneHtml(file);
    const snippet = mainInnerHtmlFromStandaloneDoc(htmlDoc);
    const md = await turndownFromHtmlFragment(snippet);
    return new Blob([md], { type: 'text/markdown;charset=utf-8' });
  }

  const pivotPlain = await fileToPivotPlain(file, from);
  return blobFromPivotPlain(to, pivotPlain, titleStem);
}

export function ebookDownloadBaseName(
  originalName: string,
  to: EbookFormatId,
): string {
  const base = stemName(originalName);
  switch (to) {
    case 'txt':
      return `${base}_converted.txt`;
    case 'markdown':
      return `${base}_converted.md`;
    case 'html':
      return `${base}_converted.html`;
    case 'epub':
      return `${base}_converted.epub`;
    case 'pdf':
      return `${base}_converted.pdf`;
    case 'fb2':
      return `${base}_converted.fb2`;
    case 'docx':
      return `${base}_converted.docx`;
    case 'odt':
      return `${base}_converted.odt`;
    case 'rtf':
      return `${base}_converted.rtf`;
    case 'pml':
      return `${base}_converted.pml`;
    case 'cbz':
      return `${base}_converted.cbz`;
    case 'pages_zip':
      return `${base}_pages_bundle.zip`;
    default: {
      const _never: never = to;
      return `${base}_converted.${_never}`;
    }
  }
}

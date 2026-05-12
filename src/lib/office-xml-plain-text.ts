import JSZip from 'jszip';

const DOCX_WP =
  'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const ODT_TEXT_NS = 'urn:oasis:names:tc:opendocument:xmlns:text:1.0';

function decodeXmlWhitespace(s: string) {
  return s
    .replace(/&(lt|gt|amp|quot|apos);/g, (m, g) =>
      g === 'lt'
        ? '<'
        : g === 'gt'
          ? '>'
          : g === 'amp'
            ? '&'
            : g === 'quot'
              ? '"'
              : "'",
    )
    .replace(/&#(\d+);/g, (_, n) =>
      String.fromCharCode(Number.parseInt(n, 10)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCharCode(Number.parseInt(h, 16)),
    );
}

function serializeDocxParagraph(p: Element): string {
  let s = '';
  function walk(n: Element) {
    const nm = n.localName;
    const uri = n.namespaceURI;
    if (uri === DOCX_WP) {
      if (nm === 't') {
        s += decodeXmlWhitespace(n.textContent ?? '');
        return;
      }
      if (nm === 'tab') {
        s += '\t';
        return;
      }
      if (nm === 'cr' || nm === 'br') {
        s += '\n';
        return;
      }
    }
    for (const kid of [...n.childNodes]) {
      if (kid.nodeType === Node.ELEMENT_NODE) walk(kid as Element);
    }
  }
  walk(p);
  return s.trim();
}

/** Walk DOCX `<w:body>` for paragraphs (+ tables via nested `w:p`). */
function collectDocxText(body: Element): string[] {
  const lines: string[] = [];

  function visit(el: Element) {
    const uri = el.namespaceURI ?? '';
    const nm = el.localName;
    if (uri === DOCX_WP && nm === 'p') {
      const line = serializeDocxParagraph(el);
      lines.push(line);
      return;
    }
    for (const c of [...el.children]) visit(c as Element);
  }

  visit(body);

  while (lines.length && lines.at(-1) === '') lines.pop();
  while (lines.length && lines[0] === '') lines.shift();
  return lines;
}

export function docxXmlToPlainText(xml: string): string {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('Invalid DOCX word/document.xml.');
  const body =
    doc.getElementsByTagNameNS(DOCX_WP, 'body')[0] ??
    [...doc.getElementsByTagName('body')][0];

  if (!body) throw new Error('DOCX body element missing.');
  const lines = collectDocxText(body);
  if (!lines.length) throw new Error('No textual paragraphs extracted from DOCX.');
  const out = decodeXmlWhitespace(lines.join('\n'));
  return out.replace(/\n{3,}/g, '\n\n').trim();
}

function extractOdtFlowLines(doc: Document): string[] {
  const lines: string[] = [];
  const ns = ODT_TEXT_NS;
  for (const tag of ['h', 'p', 'li'] as const) {
    const elems = [...doc.getElementsByTagNameNS(ns, tag)];
    for (const el of elems) {
      const t = decodeXmlWhitespace(
        (el.textContent ?? '').replace(/\u00a0/g, ' '),
      ).trim();
      if (tag === 'h' && lines.length && lines.at(-1) !== '')
        lines.push('');
      if (t) lines.push(t);
    }
  }
  while (lines.length && lines.at(-1) === '') lines.pop();
  while (lines.length && lines[0] === '') lines.shift();
  return lines;
}

export async function docxZipBlobToPlainText(fileBlob: Blob): Promise<string> {
  const zip = await JSZip.loadAsync(fileBlob);
  const entry = zip.file('word/document.xml');
  if (!entry) throw new Error('word/document.xml missing — choose a DOCX OOXML ZIP.');
  const xml = await entry.async('text');
  return docxXmlToPlainText(xml);
}

export async function odtZipBlobToPlainText(fileBlob: Blob): Promise<string> {
  const zip = await JSZip.loadAsync(fileBlob);
  const entry = zip.file('content.xml');
  if (!entry) throw new Error('content.xml missing — pick an `.odt` OpenDocument ZIP.');
  const xml = await entry.async('text');
  return odtContentXmlToPlainText(xml);
}

export function odtContentXmlToPlainText(xml: string): string {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('Invalid ODT content.xml.');

  const lines = extractOdtFlowLines(doc);
  if (!lines.length) throw new Error('Could not harvest text from OpenDocument paragraphs.');
  const out = lines.join('\n\n');
  return out.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

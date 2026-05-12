import JSZip from 'jszip';

function dirname(p: string): string {
  const i = p.lastIndexOf('/');
  return i <= 0 ? '' : p.slice(0, i);
}

/** Join ZIP entry path segments (POSIX-style EPUB roots). */
function zipJoin(dir: string, href: string): string {
  const h = href.replace(/^\.\//, '').replace(/^\/+/, '');
  if (!dir) return h;
  return `${dir}/${h}`;
}

/** XHTML/HTML fragment from spine—resolved document root wrapper. */
function htmlFragmentParsedRoot(fragment: string): HTMLElement | null {
  const parser = new DOMParser();
  let doc = parser.parseFromString(fragment, 'application/xhtml+xml');
  if (doc.querySelector('parsererror')) {
    doc = parser.parseFromString(fragment, 'text/html');
  }
  const root = (doc.querySelector('body') ??
    doc.documentElement) as HTMLElement | null;
  return root ?? null;
}

/** XHTML/HTML fragment from spine to readable plain text. */
function htmlFragmentToReadableText(fragment: string): string {
  const root = htmlFragmentParsedRoot(fragment);
  const text =
    root?.innerText?.replace(/\u00a0/g, ' ') ??
    root?.textContent?.replace(/\u00a0/g, ' ') ??
    '';
  return text.replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim();
}

/** UTF-8 from ZIP member (fallback Latin-1). */
async function unzipUtf8(zip: JSZip, path: string): Promise<string | null> {
  const f = zip.file(path);
  if (!f) return null;
  const buf = await f.async('arraybuffer');
  try {
    return new TextDecoder('utf-8', { fatal: false }).decode(buf);
  } catch {
    return new TextDecoder('iso-8859-1').decode(buf);
  }
}

function opfHrefById(opfDoc: Document): Map<string, string> {
  const map = new Map<string, string>();
  const manifests = opfDoc.getElementsByTagName('manifest');
  const manifestEl = manifests[0];
  if (!manifestEl) return map;

  const items = manifestEl.getElementsByTagName('item');
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const id = item.getAttribute('id');
    const href = item.getAttribute('href');
    if (id && href) map.set(id, href);
  }
  return map;
}

function opfItemMediaType(opfDoc: Document, itemId: string): string {
  const manifestEl = opfDoc.getElementsByTagName('manifest')[0];
  if (!manifestEl) return '';
  const items = manifestEl.getElementsByTagName('item');
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.getAttribute('id') === itemId) {
      return item.getAttribute('media-type') ?? '';
    }
  }
  return '';
}

function spineOrderIdrefs(opfDoc: Document): string[] {
  const out: string[] = [];
  const spines = opfDoc.getElementsByTagName('spine');
  const spineEl = spines[0];
  if (!spineEl) return out;

  const refs = spineEl.getElementsByTagName('itemref');
  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i]?.getAttribute('idref');
    if (ref) out.push(ref);
  }
  return out;
}

/**
 * Plain text stitched from readable spine chapters (best-effort, client-side).
 */
export async function epubBlobToPlainText(blob: Blob): Promise<string> {
  const zip = await JSZip.loadAsync(blob);

  const containerTxt = await unzipUtf8(zip, 'META-INF/container.xml');
  if (!containerTxt) {
    throw new Error('Missing META-INF/container.xml — pick a normal EPUB 2 / EPUB 3 file.');
  }

  const cd = new DOMParser().parseFromString(containerTxt, 'application/xml');
  if (cd.querySelector('parsererror')) {
    throw new Error('container.xml could not be parsed.');
  }

  const rootfiles = [...cd.getElementsByTagName('rootfile')];
  const rootHrefAttr = rootfiles
    .map((n) => n.getAttribute('full-path'))
    .find(Boolean)
    ?.trim();

  if (!rootHrefAttr) {
    throw new Error('container.xml must point to the package (.opf) document.');
  }

  const opfTxt = await unzipUtf8(zip, rootHrefAttr);
  if (!opfTxt) {
    throw new Error(`Package (.opf) not found inside EPUB ZIP: ${rootHrefAttr}`);
  }

  const opfDoc = new DOMParser().parseFromString(opfTxt, 'application/xml');
  if (opfDoc.querySelector('parsererror')) {
    throw new Error('Package (.opf) failed to parse as XML.');
  }

  const opfDir = dirname(rootHrefAttr);
  const idToRelHref = opfHrefById(opfDoc);
  const chunks: string[] = [];

  for (const idref of spineOrderIdrefs(opfDoc)) {
    const rel = idToRelHref.get(idref);
    if (!rel) continue;
    const path = zipJoin(opfDir, rel);
    const mediaType = opfItemMediaType(opfDoc, idref).toLowerCase();

    const looksMarkup =
      /html|xml|svg|\/xhtm/.test(mediaType) || /\.x?html?$/i.test(path);

    if (!looksMarkup && !mediaType.includes('svg')) continue;

    const raw = await unzipUtf8(zip, path);
    if (!raw?.trim()) continue;

    let textChunk = '';
    try {
      textChunk = htmlFragmentToReadableText(raw);
    } catch {
      continue;
    }
    if (textChunk) chunks.push(textChunk);
  }

  const combined = chunks
    .map((t) => t.trim())
    .filter(Boolean)
    .join('\n\n---\n\n');

  if (!combined.trim()) {
    throw new Error(
      'No extractable prose in spine (might be comics, fixed-layout, encrypted, or non-standard).',
    );
  }

  return combined;
}

/**
 * Collapse spine markup into one offline HTML document (best-effort, client-side).
 * Inner chapter bodies are stitched with `<article class="morgana-epub-chapter">`.
 */
export async function epubBlobToStandaloneHtml(blob: Blob): Promise<string> {
  const zip = await JSZip.loadAsync(blob);
  const containerTxt = await unzipUtf8(zip, 'META-INF/container.xml');
  if (!containerTxt) {
    throw new Error('Missing META-INF/container.xml — pick a normal EPUB 2 / EPUB 3 file.');
  }

  const cd = new DOMParser().parseFromString(containerTxt, 'application/xml');
  if (cd.querySelector('parsererror')) {
    throw new Error('container.xml could not be parsed.');
  }
  const rootHrefAttr = [...cd.getElementsByTagName('rootfile')]
    .map((n) => n.getAttribute('full-path'))
    .find(Boolean)
    ?.trim();

  if (!rootHrefAttr) {
    throw new Error('container.xml must point to the package (.opf) document.');
  }

  const opfTxt = await unzipUtf8(zip, rootHrefAttr);
  if (!opfTxt) {
    throw new Error(`Package (.opf) not found inside EPUB ZIP: ${rootHrefAttr}`);
  }

  const opfDoc = new DOMParser().parseFromString(opfTxt, 'application/xml');
  if (opfDoc.querySelector('parsererror')) {
    throw new Error('Package (.opf) failed to parse as XML.');
  }

  const opfDir = dirname(rootHrefAttr);
  const idToRelHref = opfHrefById(opfDoc);
  const articleChunks: string[] = [];

  for (const idref of spineOrderIdrefs(opfDoc)) {
    const rel = idToRelHref.get(idref);
    if (!rel) continue;
    const path = zipJoin(opfDir, rel);
    const mediaType = opfItemMediaType(opfDoc, idref).toLowerCase();

    const looksMarkup =
      /html|xml|svg|\/xhtm/.test(mediaType) || /\.x?html?$/i.test(path);

    if (!looksMarkup && !mediaType.includes('svg')) continue;

    const raw = await unzipUtf8(zip, path);
    if (!raw?.trim()) continue;

    const root = htmlFragmentParsedRoot(raw);
    const innerHtml = root?.innerHTML?.trim();
    if (!innerHtml) continue;
    articleChunks.push(
      `<article class="morgana-epub-chapter" data-spine-path="${escapeAttr(
        path,
      )}">${innerHtml}</article>`,
    );
  }

  if (articleChunks.length === 0) {
    throw new Error(
      'No extractable prose in spine (might be comics, fixed-layout, encrypted, or non-standard).',
    );
  }

  let titleGuess = '';
  try {
    const metas = [...opfDoc.getElementsByTagName('meta')];
    const titleMeta = metas.find(
      (m) => (m.getAttribute('name') ?? '').toLowerCase() === 'title',
    );
    titleGuess =
      opfDoc.getElementsByTagNameNS(
        'http://purl.org/dc/elements/1.1/',
        'title',
      )[0]?.textContent?.trim() ??
      titleMeta?.getAttribute('content')?.trim() ??
      '';
  } catch {
    titleGuess = '';
  }

  const safeTitle =
    escapeTextContent(titleGuess) || 'Converted from EPUB';
  const body = `<main id="main">${articleChunks.join('\n\n')}</main>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>${safeTitle}</title>` +
    `<meta name="viewport" content="width=device-width, initial-scale=1"/>` +
    `<style>article.morgana-epub-chapter{max-width:42rem;margin:0 auto;padding:2rem 1rem}article+article{border-top:1px solid rgba(122,122,122,.25)}</style>` +
    `</head><body>${body}</body></html>`;
}

function escapeAttr(raw: string): string {
  return raw.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function escapeTextContent(s: string): string {
  return s.replace(/[<>&]/g, (ch) =>
    ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : '&amp;',
  );
}

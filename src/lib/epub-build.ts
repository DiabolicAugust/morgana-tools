import JSZip from 'jszip';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function uid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `urn:uuid:${crypto.randomUUID()}`;
  }
  return `urn:uuid:${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Best-effort minimal EPUB 2 zip (Reflowable prose). `chapterBodies` are safe XHTML
 * snippets that will live inside `<body>…</body>` (typically `<p>` / `<div>` markup).
 */
export async function buildMinimalEpubZipBlob(options: {
  title: string;
  /** One XHTML spine item per chapter. */
  chapterBodiesXhtml: string[];
}): Promise<Blob> {
  const ids = uid();
  const titleSafe = escapeXml(options.title.trim() || 'Untitled');
  const chapters = options.chapterBodiesXhtml.filter((c) => c.trim());
  if (chapters.length === 0) {
    throw new Error('Nothing to bundle into EPUB chapters.');
  }

  const manifestItems: string[] = [];
  const spineItems: string[] = [];
  const chapterFiles: Record<string, string> = {};

  chapters.forEach((bodyInner, idx) => {
    const id = `c${idx + 1}`;
    const xhtml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">\n<head>\n<title>${titleSafe}</title>\n` +
      `<meta charset="UTF-8" />\n<style type="text/css">\nbody{font-family:serif;line-height:1.45;margin:1rem;}` +
      `p{margin:0.6em 0;}\n</style>\n</head>\n<body>\n${bodyInner}\n</body>\n</html>`;
    manifestItems.push(
      `    <item id="${id}" href="chapter${idx + 1}.xhtml" media-type="application/xhtml+xml"/>`,
    );
    spineItems.push(`    <itemref idref="${id}"/>`);

    chapterFiles[`OEBPS/chapter${idx + 1}.xhtml`] = xhtml;
  });

  const opf =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">\n` +
    `  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n` +
    `    <dc:title>${titleSafe}</dc:title>\n` +
    `    <dc:language>en</dc:language>\n` +
    `    <dc:identifier id="bookid">${ids}</dc:identifier>\n` +
    `  </metadata>\n` +
    `  <manifest>\n` +
    manifestItems.join('\n') +
    `\n    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>\n` +
    `  </manifest>\n` +
    `  <spine toc="ncx">\n${spineItems.join('\n')}\n  </spine>\n</package>`;

  const ncxPoints = chapters
    .map(
      (_, idx) =>
        `    <navPoint id="nav${idx}" playOrder="${idx + 1}">\n      <navLabel><text>${titleSafe} (${idx + 1})</text></navLabel>\n` +
        `      <content src="chapter${idx + 1}.xhtml"/>\n    </navPoint>`,
    )
    .join('\n');

  const tocNcx =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">\n<head>\n<meta name="dtb:uid" content="${escapeXml(ids)}"/></head>\n` +
    `<docTitle><text>${titleSafe}</text></docTitle>\n<navMap>\n${ncxPoints}\n</navMap>\n</ncx>`;

  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  zip.file(
    'META-INF/container.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n  <rootfiles>\n    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>\n  </rootfiles>\n</container>`,
  );
  zip.file('OEBPS/content.opf', opf);
  zip.file('OEBPS/toc.ncx', tocNcx);
  for (const [path, txt] of Object.entries(chapterFiles)) {
    zip.file(path, txt);
  }

  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    mimeType: 'application/epub+zip',
  });
}

export function paragraphsFromPlainTextToXhtmlBodies(text: string): string[] {
  const trimmed = text.replace(/\r\n/g, '\n').trim();
  if (!trimmed) return [];
  return trimmed.split(/\n{2,}/g).map((para) => {
    const escaped = escapeXml(para.trim()).replace(/\n/g, '<br />');
    return `<p>${escaped}</p>`;
  });
}

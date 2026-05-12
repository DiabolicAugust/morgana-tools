/** PDF text extraction loads PDF.js lazily so SSR never touches `pdf.mjs`/DOM globals. */

let workerConfigured = false;

async function ensurePdfWorker(
  pdfjs: typeof import('pdfjs-dist'),
): Promise<void> {
  if (workerConfigured) return;
  workerConfigured = true;
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;
}

export async function pdfBlobToPlainText(blob: Blob): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  await ensurePdfWorker(pdfjs);
  const buf = await blob.arrayBuffer();

  const pdf = await pdfjs.getDocument({
    data: buf,
    useSystemFonts: true,
  }).promise;

  const parts: string[] = [];
  for (let pi = 1; pi <= pdf.numPages; pi++) {
    const page = await pdf.getPage(pi);
    const tc = await page.getTextContent();
    const line = tc.items
      .map((it) => ('str' in it ? it.str : ''))
      .join('')
      .replace(/\u00a0/g, ' ');
    parts.push(line.trim());
  }

  let out = parts.filter(Boolean).join('\n\n');
  out = out.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!out) {
    throw new Error(
      'No extractable text (common for scanned/image PDFs encrypted for copy—or XFA-heavy forms). Try OCR elsewhere.',
    );
  }
  return out;
}

/** Strip tags from local HTML/XHTML file and normalize whitespace (browser-local). */
export async function htmlFileToPlainText(file: File): Promise<string> {
  const raw = await file.text();
  if (!raw.trim()) throw new Error('HTML file looks empty.');
  const doc = new DOMParser().parseFromString(raw, 'text/html');
  const root = doc.body ?? doc.documentElement;

  let text =
    root.innerText?.replace(/\u00a0/g, ' ') ??
    root.textContent?.replace(/\u00a0/g, ' ') ??
    '';

  text = text.replace(/\r\n/g, '\n').trim();
  if (!text) throw new Error('No textual content extracted from HTML.');
  return text;
}

/** Palm markup (PML/eReader)—tags + backslash codes stripped for rough prose. */

export function pmlToPlainText(raw: string): string {
  let s = raw.replace(/\r\n/g, '\n');
  s = s.replace(/<(?:\/)?[a-zA-Z][a-zA-Z0-9]*(?:\s[^>]*)?>/g, '\n');
  // common backslash escapes
  s = s.replace(/\\[a-z]{1,3}\s?/gi, ' ');
  s = s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!s) throw new Error('PML file had no textual content.');
  return s;
}

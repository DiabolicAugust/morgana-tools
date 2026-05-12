/**
 * RTF → plain UTF-8 (best-effort; rich layout, OLE, font tables stripped).
 */

function decodeHexPair(_m: string, h: string) {
  return String.fromCharCode(parseInt(h, 16));
}

export function rtfToPlainText(src: string): string {
  let s = src.replace(/\r\n/g, '\n');

  // Unicode escapes \uNNNN?
  s = s.replace(/\\u(-?\d+)\??/g, (_, code: string) => {
    let n = parseInt(code, 10);
    if (n < 0) n += 65536;
    try {
      return String.fromCharCode(n);
    } catch {
      return '';
    }
  });

  // CP1252-ish hex bytes \'hh
  s = s.replace(/\\'([0-9a-fA-F]{2})/g, decodeHexPair);

  s = s.replace(/\\par\b|\\line\b/g, '\n');
  s = s.replace(/\\tab\b/g, '\t');
  s = s.replace(/\\[~{}|-]/g, '');

  // Drop control tokens (remaining \word digits optional space terminator)
  s = s.replace(/\\(?:[a-z]+\d*|fnil|fldrslt|fldinst|\*) ?/gi, '');

  s = s.replace(/[{}]/g, '');
  s = s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!s) throw new Error('RTF yielded no prose after stripping controls.');
  return s;
}

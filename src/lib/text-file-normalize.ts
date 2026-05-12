export type NormalizeNotes = string[];

/** Detect BOM / normalize newlines → LF; decode body as UTF-8 when not UTF-16. */
export function normalizeTextBytes(bytes: Uint8Array): { text: string; notes: NormalizeNotes } {
  const notes: NormalizeNotes = [];
  let offset = 0;

  if (
    bytes.length >= 3 &&
    bytes[0] === 0xef &&
    bytes[1] === 0xbb &&
    bytes[2] === 0xbf
  ) {
    offset = 3;
    notes.push('Removed UTF-8 BOM');
  } else if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    notes.push('Detected UTF-16 LE — converted to UTF-8');
    let decoded = decodeUtf16LE(bytes.subarray(2));
    decoded = finalizeNewlines(decoded);
    if (decoded.includes('\r')) notes.push('Normalized CR/CRLF→LF where present');
    const text =
      decoded.length && !decoded.endsWith('\n') ? `${decoded}\n` : decoded;
    return { text: text || '\n', notes };
  } else if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    notes.push('Detected UTF-16 BE — converted to UTF-8');
    let decoded = decodeUtf16BE(bytes.subarray(2));
    decoded = finalizeNewlines(decoded);
    if (decoded.includes('\r')) notes.push('Normalized CR/CRLF→LF where present');
    const text =
      decoded.length && !decoded.endsWith('\n') ? `${decoded}\n` : decoded;
    return { text: text || '\n', notes };
  }

  const decoder = new TextDecoder('utf-8', { fatal: false, ignoreBOM: true });
  const raw = decoder.decode(bytes.subarray(offset));

  let text = finalizeNewlines(raw);
  text = stripTrailingGarbage(text);

  const endNotes = [...notes];
  if (raw.includes('\r')) endNotes.push('Normalized CR/CRLF→LF where present');
  if (text.length && !text.endsWith('\n')) text += '\n';
  return { text, notes: endNotes };
}

function finalizeNewlines(s: string) {
  return s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function stripTrailingGarbage(s: string) {
  return s.replace(/\x00+$/, '').trimEnd();
}

function decodeUtf16LE(buf: Uint8Array) {
  let b = buf;
  if (b.length % 2) b = b.subarray(0, b.length - 1);
  const out = new Array<string>(b.length / 2);
  for (let i = 0; i < b.length; i += 2) {
    const code = b[i]! | ((b[i + 1] ?? 0) << 8);
    out.push(String.fromCharCode(code));
  }
  return out.join('');
}

function decodeUtf16BE(buf: Uint8Array) {
  let b = buf;
  if (b.length % 2) b = b.subarray(0, b.length - 1);
  const out = new Array<string>(b.length / 2);
  for (let i = 0; i < b.length; i += 2) {
    const code = ((b[i] ?? 0) << 8) | (b[i + 1] ?? 0);
    out.push(String.fromCharCode(code));
  }
  return out.join('');
}

/** Walk FictionBook `<body>` and assemble readable paragraphs/lines. */

function flattenFb2(root: Element): string[] {
  const lines: string[] = [];

  function walk(elem: Element) {
    for (const node of [...elem.childNodes]) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      const el = node as Element;
      const tag = el.localName.toLowerCase();

      if (tag === 'p' || tag === 'subtitle') {
        const t = el.textContent?.replace(/\u00a0/g, ' ').trim();
        if (t) lines.push(t);
      } else if (tag === 'empty-line') {
        lines.push('');
      } else if (tag === 'title') {
        const t = el.textContent?.replace(/\u00a0/g, ' ').trim();
        if (t) lines.push(t, '');
      } else if (
        tag === 'epigraph' ||
        tag === 'stanza' ||
        tag === 'section' ||
        tag === 'poem' ||
        tag === 'cite'
      ) {
        walk(el);
      } else if (tag === 'v') {
        const t = el.textContent?.replace(/\u00a0/g, ' ').trim();
        if (t) lines.push(t);
      } else if (tag === 'text-author') {
        const t = el.textContent?.replace(/\u00a0/g, ' ').trim();
        if (t) lines.push(`— ${t}`);
      } else {
        walk(el);
      }
    }
  }

  walk(root);

  while (lines.length && lines.at(-1) === '') lines.pop();
  while (lines.length && lines[0] === '') lines.shift();
  return lines;
}

/** Parse FictionBook XML to plain UTF-8 text (best-effort). */
export function fb2XmlToPlainText(xml: string): string {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('Could not parse FB2 XML.');
  }

  const bodyEl = doc.getElementsByTagName('body')[0];
  if (!bodyEl) {
    throw new Error('FB2 is missing `<body>` content.');
  }

  const lines = flattenFb2(bodyEl);
  let out = lines.join('\n\n');
  out = out.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!out) throw new Error('Could not extract readable prose from FB2.');
  return out;
}

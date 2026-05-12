/** Strip lightweight Markdown punctuation for reading / indexing (not GitHub-perfect). */

export function markdownToPlainText(md: string): string {
  let t = md.replace(/\r\n/g, '\n');

  // fenced ``` blocks anywhere
  t = t.replace(/```[^\n]*\n[\s\S]*?```/gm, '\n');

  // images then links before removing brackets chaos
  t = t.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');

  // reference links [...][id]
  t = t.replace(/\[([^\]]+)\]\s*\[[^\]]*\]/g, '$1');

  // inline links
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  // hr
  t = t.replace(/^ {0,3}([-*_] *){3,}\s*$/gm, '\n');

  // headings ATX
  t = t.replace(/^#{1,6}\s+/gm, '');

  // emphasis
  t = t.replace(/\*\*([^*\n]+)\*\*/g, '$1').replace(/__([^_\n]+)__/g, '$1');

  // inline code
  t = t.replace(/`([^`\n]+)`/g, '$1');

  // emphasis single
  t = t.replace(/\*([^*\n]+)\*/g, '$1');

  // list markers loose
  t = t.replace(/^\s*[-*+]\s+/gm, '');
  t = t.replace(/^\s*\d+\.\s+/gm, '');

  t = t.replace(/\n{3,}/g, '\n\n').trim();
  if (!t) throw new Error('Markdown content was effectively empty.');
  return t;
}

/**
 * Constrained markdown for gift messages: **bold**, *italic*, paragraphs separated by a
 * blank line, single newlines kept as line breaks. No HTML, no links — safe to render
 * anywhere (including the future mobile WebView) without a sanitizer.
 */
export type RichRun = { text: string; bold?: boolean; italic?: boolean; br?: boolean };
export type RichBlock = RichRun[];

const TOKEN = /(\*\*[^*]+\*\*|\*[^*\n]+\*|\n)/g;

export function parseRichText(input: string): RichBlock[] {
  const paragraphs = input.replace(/\r\n?/g, "\n").trim().split(/\n{2,}/);
  return paragraphs.filter(Boolean).map((paragraph) => {
    const runs: RichRun[] = [];
    let last = 0;
    for (const match of paragraph.matchAll(TOKEN)) {
      const index = match.index ?? 0;
      if (index > last) runs.push({ text: paragraph.slice(last, index) });
      const token = match[0];
      if (token === "\n") runs.push({ text: "", br: true });
      else if (token.startsWith("**")) runs.push({ text: token.slice(2, -2), bold: true });
      else runs.push({ text: token.slice(1, -1), italic: true });
      last = index + token.length;
    }
    if (last < paragraph.length) runs.push({ text: paragraph.slice(last) });
    return runs;
  });
}

/** Total visible characters (used by the typewriter). */
export function richTextLength(blocks: RichBlock[]): number {
  return blocks.reduce((sum, block) => sum + block.reduce((s, r) => s + (r.br ? 1 : r.text.length), 0), 0);
}

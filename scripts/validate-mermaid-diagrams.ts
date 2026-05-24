#!/usr/bin/env tsx
/**
 * Validate Mermaid Diagrams in Markdown
 *
 * Systematically extracts every ```mermaid fenced code block from the
 * repository's source markdown files and parses each one with the official
 * mermaid library to detect broken / unparseable diagrams.
 *
 * **Scope**
 * - Project root `*.md` files (ARCHITECTURE, FLOWCHART, README, etc.)
 * - `.github/*.md` and `.github/skills/*\/SKILL.md`
 * - Skips generated mirrors under `docs/api*` (they are produced from
 *   the source files above by `npm run docs:md`).
 *
 * **Modes**
 * - default (no flags)     → validate only; exit 1 on any parse failure
 * - --normalize-colors     → in-place lowercase all `#RRGGBB`/`#RGB` hex
 *                            colors inside mermaid blocks (cosmetic; the
 *                            rendered diagram is unchanged) then validate
 * - --quote-icons          → in-place wrap unquoted node labels that contain
 *                            an icon (non-ASCII/emoji) or special punctuation
 *                            (@, :, (, ), {, }, &, ;) in double quotes for
 *                            graph/flowchart/mindmap/timeline diagrams, then
 *                            validate
 * - --fix                  → runs both --normalize-colors and --quote-icons
 *                            in one pass, then validate
 *
 * **Usage**
 * ```bash
 * npm run test:mermaid                       # validate
 * npx tsx scripts/validate-mermaid-diagrams.ts --normalize-colors
 * npx tsx scripts/validate-mermaid-diagrams.ts --quote-icons
 * npx tsx scripts/validate-mermaid-diagrams.ts --fix
 * ```
 *
 * **ISMS Compliance**
 * Aligns with Hack23 Secure Development Policy documentation standards by
 * keeping architecture / threat-model / data-model diagrams machine-verified
 * so they cannot silently regress.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import type { Stats } from 'node:fs';
import { join, relative, resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

// ---------------------------------------------------------------------------
// Constants & types
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

/** Roots searched for markdown files. */
const SEARCH_ROOTS = [REPO_ROOT, join(REPO_ROOT, '.github')];

/** Directories to skip (generated docs mirrors, deps, build output, agent prompts). */
const SKIP_DIR_NAMES = new Set([
  'node_modules',
  'dist',
  'coverage',
  'builds',
  'artifacts',
  '.git',
  'api',
  'api-markdown',
  '_media',
  'agents', // .github/agents/* — agent prompts, not user-facing diagrams
  // TypeDoc places everything below docs/ — skip the whole tree.
]);

const SKIP_PATH_PREFIXES = [join(REPO_ROOT, 'docs') + sep];

interface MermaidBlock {
  readonly file: string;
  /** 1-based line number of the line *after* the opening ```mermaid fence. */
  readonly startLine: number;
  /** 1-based line number of the closing ``` fence. */
  readonly endLine: number;
  readonly code: string;
}

interface ValidationFailure extends MermaidBlock {
  readonly error: string;
}

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

function walkMarkdownFiles(root: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(root);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (SKIP_DIR_NAMES.has(name)) continue;
    const full = join(root, name);
    const skipped = SKIP_PATH_PREFIXES.some((p) => full.startsWith(p));
    if (skipped) continue;
    let stat: Stats;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      walkMarkdownFiles(full, out);
    } else if (stat.isFile() && full.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

function discoverMarkdownFiles(): string[] {
  const seen = new Set<string>();
  for (const root of SEARCH_ROOTS) {
    for (const f of walkMarkdownFiles(root)) seen.add(f);
  }
  return [...seen].sort();
}

// ---------------------------------------------------------------------------
// Block extraction
// ---------------------------------------------------------------------------

/** Extract every ```mermaid ... ``` fenced block from a markdown file. */
function extractBlocks(file: string): MermaidBlock[] {
  const text = readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  const blocks: MermaidBlock[] = [];
  let inBlock = false;
  let openIndex = -1;
  let buf: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    if (!inBlock && /^```mermaid\s*$/.test(line)) {
      inBlock = true;
      openIndex = i; // 0-based index of the opening fence
      buf = [];
      continue;
    }
    if (inBlock && /^```\s*$/.test(line)) {
      blocks.push({
        file,
        startLine: openIndex + 2, // first content line, 1-based
        endLine: i + 1,           // closing fence, 1-based
        code: buf.join('\n'),
      });
      inBlock = false;
      buf = [];
      continue;
    }
    if (inBlock) buf.push(line);
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// Color normalisation (optional)
// ---------------------------------------------------------------------------

const HEX_RE = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g;

/**
 * Lowercase every hex color literal inside ```mermaid blocks.
 *
 * Mermaid treats hex colors case-insensitively, so this is a pure cosmetic
 * normalisation — it eliminates `#FFA726` vs `#ffa726` style inconsistency
 * across the documentation without changing any rendered output.
 *
 * @returns the number of files that were modified.
 */
function normalizeColorsInPlace(files: readonly string[]): number {
  let modified = 0;
  for (const file of files) {
    const original = readFileSync(file, 'utf8');
    const lines = original.split(/\r?\n/);
    let inBlock = false;
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? '';
      if (!inBlock && /^```mermaid\s*$/.test(line)) {
        inBlock = true;
        continue;
      }
      if (inBlock && /^```\s*$/.test(line)) {
        inBlock = false;
        continue;
      }
      if (inBlock) {
        const replaced = line.replace(HEX_RE, (m) => m.toLowerCase());
        if (replaced !== line) {
          lines[i] = replaced;
          changed = true;
        }
      }
    }
    if (changed) {
      writeFileSync(file, lines.join('\n'), 'utf8');
      modified++;
    }
  }
  return modified;
}

// ---------------------------------------------------------------------------
// Label auto-quoting (optional)
// ---------------------------------------------------------------------------

/**
 * Shape pairs supported by Mermaid flowchart syntax, **ordered by opener
 * length descending** so the longer variants match before their shorter
 * prefixes (e.g. `[[` before `[`).
 */
const SHAPE_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['[[', ']]'],
  ['((', '))'],
  ['{{', '}}'],
  ['([', '])'],
  ['[(', ')]'],
  ['[/', '/]'],
  ['[\\', '\\]'],
  ['[', ']'],
  ['(', ')'],
  ['{', '}'],
  ['>', ']'],
];

/** Characters that force quoting of a Mermaid node label. */
const NEEDS_QUOTE_RE = /[^\x00-\x7F]|[@:&;]|\(|\)|\{|\}/;

function labelNeedsQuoting(content: string): boolean {
  if (!content.trim()) return false;
  return NEEDS_QUOTE_RE.test(content);
}

/**
 * Walk a single mermaid block and wrap every unquoted node label that
 * contains an icon (any non-ASCII character) or other special punctuation
 * in double quotes.
 *
 * Examples:
 *   `N[📡 Sources]`   → `N["📡 Sources"]`
 *   `N(MEPs (716))`   → `N("MEPs (716)")`
 *   `N["already"]`    → unchanged
 *   `N --> M`         → unchanged (no shape opener after the identifier)
 */
function quoteIconsInBlock(code: string): string {
  const out: string[] = [];
  let i = 0;
  let atLineStart = true;
  const len = code.length;
  while (i < len) {
    const ch = code[i] ?? '';
    if (ch === '\n') {
      out.push(ch);
      i++;
      atLineStart = true;
      continue;
    }
    // Try to detect a node label after an identifier OR at the start of a
    // mindmap/timeline line (after pure whitespace).
    const afterIdentifier = /[A-Za-z_]/.test(ch);
    if (afterIdentifier || atLineStart) {
      let j = i;
      if (afterIdentifier) {
        while (j < len && /[A-Za-z0-9_]/.test(code[j] ?? '')) j++;
      } else {
        // skip leading whitespace
        while (j < len && (code[j] === ' ' || code[j] === '\t')) j++;
        if (j === i) {
          // no whitespace skipped — fall through
        }
      }
      // After identifier (or leading WS), attempt to match a shape opener
      let matched: { open: string; close: string; content: string; end: number } | null = null;
      for (const [open, close] of SHAPE_PAIRS) {
        if (code.slice(j, j + open.length) !== open) continue;
        // Find the matching close on the same line
        const contentStart = j + open.length;
        let k = contentStart;
        while (k < len) {
          const c = code[k] ?? '';
          if (c === '\n') break;
          if (c === '"') {
            // Skip over already-quoted segment
            k++;
            while (k < len && code[k] !== '"') {
              if (code[k] === '\\') k++;
              k++;
            }
            k++; // consume closing quote
            continue;
          }
          if (code.slice(k, k + close.length) === close) {
            matched = { open, close, content: code.slice(contentStart, k), end: k + close.length };
            break;
          }
          k++;
        }
        if (matched) break;
      }
      if (matched) {
        const { open, close, content, end } = matched;
        const trimmed = content.trim();
        const alreadyQuoted = trimmed.startsWith('"') && trimmed.endsWith('"');
        let newContent = content;
        if (!alreadyQuoted && labelNeedsQuoting(content)) {
          // Escape any embedded double quotes via the Mermaid #quot; entity.
          newContent = `"${content.replace(/"/g, '#quot;')}"`;
        }
        out.push(code.slice(i, j));
        out.push(open);
        out.push(newContent);
        out.push(close);
        i = end;
        atLineStart = false;
        continue;
      }
      // Not a label start; emit verbatim and move on
      if (afterIdentifier) {
        out.push(code.slice(i, j));
        i = j;
      } else {
        out.push(ch);
        i++;
      }
      atLineStart = false;
      continue;
    }
    if (ch !== ' ' && ch !== '\t') atLineStart = false;
    out.push(ch);
    i++;
  }
  return out.join('');
}

/** Diagram types for which icon/special-char label quoting is safe to apply. */
const QUOTABLE_DIAGRAM_TYPES = new Set(['graph', 'flowchart', 'mindmap', 'timeline']);

/**
 * Apply {@link quoteIconsInBlock} to every ```mermaid block in the file.
 *
 * Only blocks whose first (non-empty) token is one of `graph`, `flowchart`,
 * `mindmap`, or `timeline` are transformed.  Sequence diagrams and other
 * types use free-form message text where parentheses/braces are not shape
 * DSL and must not be quoted.
 *
 * @returns the number of files that were modified.
 */
function quoteIconsInPlace(files: readonly string[]): number {
  let modified = 0;
  for (const file of files) {
    const original = readFileSync(file, 'utf8');
    const lines = original.split(/\r?\n/);
    let inBlock = false;
    let blockStart = -1;
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? '';
      if (!inBlock && /^```mermaid\s*$/.test(line)) {
        inBlock = true;
        blockStart = i + 1;
        continue;
      }
      if (inBlock && /^```\s*$/.test(line)) {
        const block = lines.slice(blockStart, i).join('\n');
        // Only quote labels in diagram types where shape-pair DSL applies.
        const firstToken = (block.trimStart().split(/[\s{([]/)[0] ?? '').toLowerCase();
        if (QUOTABLE_DIAGRAM_TYPES.has(firstToken)) {
          const transformed = quoteIconsInBlock(block);
          if (transformed !== block) {
            const newLines = transformed.split('\n');
            lines.splice(blockStart, i - blockStart, ...newLines);
            // Adjust `i` if number of lines changed (rare; quoting preserves line count).
            i = blockStart + newLines.length;
            changed = true;
          }
        }
        inBlock = false;
        continue;
      }
    }
    if (changed) {
      writeFileSync(file, lines.join('\n'), 'utf8');
      modified++;
    }
  }
  return modified;
}

// ---------------------------------------------------------------------------
// Mermaid bootstrap (jsdom shim)
// ---------------------------------------------------------------------------

async function bootstrapMermaid(): Promise<{ parse: (s: string) => Promise<unknown> }> {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
  // mermaid touches window/document/navigator on import — provide them.
  (globalThis as Record<string, unknown>).window = dom.window;
  (globalThis as Record<string, unknown>).document = dom.window.document;
  try {
    Object.defineProperty(globalThis, 'navigator', {
      value: dom.window.navigator,
      configurable: true,
    });
  } catch {
    /* already configurable */
  }
  const mod = await import('mermaid');
  const mermaid = mod.default;
  mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });
  return { parse: (s) => mermaid.parse(s) };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const doNormalize = args.has('--normalize-colors') || args.has('--fix');
  const doQuoteIcons = args.has('--quote-icons') || args.has('--fix');

  const files = discoverMarkdownFiles();
  if (doQuoteIcons) {
    const n = quoteIconsInPlace(files);
    console.log(`Icon quoting: wrapped icon/special-char node labels in ${n} file(s).`);
  }
  if (doNormalize) {
    const n = normalizeColorsInPlace(files);
    console.log(`Color normalization: lowercased hex colors in ${n} file(s).`);
  }

  const mermaid = await bootstrapMermaid();

  let total = 0;
  let okCount = 0;
  const failures: ValidationFailure[] = [];

  for (const file of files) {
    const blocks = extractBlocks(file);
    for (const block of blocks) {
      total++;
      try {
        await mermaid.parse(block.code);
        okCount++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        failures.push({ ...block, error: message });
      }
    }
  }

  for (const f of failures) {
    const rel = relative(REPO_ROOT, f.file);
    console.log('---');
    console.log(`FAIL ${rel}:${f.startLine}-${f.endLine}`);
    const lines = f.error.split('\n').slice(0, 10);
    for (const line of lines) console.log(`  ${line}`);
  }

  console.log('---');
  console.log(
    `Scanned ${files.length} markdown file(s) | ${total} mermaid diagram(s) | ` +
      `OK: ${okCount} | FAIL: ${failures.length}`,
  );

  process.exit(failures.length > 0 ? 1 : 0);
}

main().catch((err: unknown) => {
  console.error('validate-mermaid-diagrams: unexpected error');
  console.error(err);
  process.exit(2);
});

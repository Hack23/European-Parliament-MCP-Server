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
 *
 * **Usage**
 * ```bash
 * npm run test:mermaid                       # validate
 * npx tsx scripts/validate-mermaid-diagrams.ts --normalize-colors
 * ```
 *
 * **ISMS Compliance**
 * Aligns with Hack23 Secure Development Policy documentation standards by
 * keeping architecture / threat-model / data-model diagrams machine-verified
 * so they cannot silently regress.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
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

const SKIP_PATH_PREFIXES = [join(REPO_ROOT, 'docs') + '/'];

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
    let stat;
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
  const lines = text.split('\n');
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
    const lines = original.split('\n');
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
  const doNormalize = args.has('--normalize-colors');

  const files = discoverMarkdownFiles();
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

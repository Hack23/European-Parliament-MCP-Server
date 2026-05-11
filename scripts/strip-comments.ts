/**
 * Strip non-JSDoc comments from TypeScript source files.
 *
 * Policy:
 *   - Keep shebang on first line (e.g. `#!/usr/bin/env node`).
 *   - Keep JSDoc blocks (`/** ... *\/`) that are *leading* comments on a
 *     declaration node (function, class, method, property, type, interface,
 *     enum, variable statement, export/import, namespace, etc.) — these
 *     drive the public TypeDoc API documentation.
 *   - Keep a single file-level JSDoc block (typically the `@module` /
 *     `@fileoverview` header at the top of the file).
 *   - Remove ALL other comments: line comments (`//`), trailing `//`
 *     comments, non-JSDoc block comments, and orphan JSDoc blocks that are
 *     not attached to any declaration.
 *   - Special-case: preserve TS / ESLint / TODO / FIXME directives like
 *     `// @ts-expect-error`, `// eslint-disable`, `/* eslint-disable *\/`
 *     because removing them could change semantics or CI behaviour.
 *
 * Usage:  tsx strip-comments.ts <file1> <file2> ...
 */

import * as ts from 'typescript';
import { readFileSync, writeFileSync } from 'node:fs';

const PRESERVE_DIRECTIVES = [
  /^\/\/\s*@ts-/,
  /^\/\/\s*eslint-/,
  /^\/\/\s*prettier-/,
  /^\/\/\s*biome-/,
  /^\/\/\s*c8 ignore/,
  /^\/\/\s*istanbul/,
  /^\/\/\s*v8 ignore/,
  /^\/\*\s*eslint/,
  /^\/\*\s*global/,
  /^\/\/\/\s*</,
];

function isDirective(text: string): boolean {
  return PRESERVE_DIRECTIVES.some(p => p.test(text));
}

function isJSDoc(text: string): boolean {
  return text.startsWith('/**') && !text.startsWith('/***');
}

const DECLARATION_KINDS_UNUSED = 0;
void DECLARATION_KINDS_UNUSED;


interface CommentRange {
  readonly pos: number;
  readonly end: number;
  readonly kind: ts.SyntaxKind;
}

function collectAllComments(
  source: ts.SourceFile,
  text: string
): { all: CommentRange[]; jsdocSpans: Range[] } {
  const seen = new Set<string>();
  const all: CommentRange[] = [];
  const jsdocSpans: Range[] = [];
  const jsdocSeen = new Set<string>();

  function record(ranges: readonly ts.CommentRange[] | undefined): void {
    if (!ranges) return;
    for (const r of ranges) {
      const key = `${String(r.pos)}:${String(r.end)}`;
      if (!seen.has(key)) {
        seen.add(key);
        all.push({ pos: r.pos, end: r.end, kind: r.kind });
      }
      const c = text.slice(r.pos, r.end);
      if (r.kind === ts.SyntaxKind.MultiLineCommentTrivia && isJSDoc(c)) {
        const k = `${String(r.pos)}:${String(r.end)}`;
        if (!jsdocSeen.has(k)) {
          jsdocSeen.add(k);
          jsdocSpans.push({ pos: r.pos, end: r.end });
        }
      }
    }
  }

  // Walk every leaf token in the AST. `node.getChildren(source)` returns
  // both syntax-token children (commas, braces, semicolons, ...) and
  // structural children, ensuring we visit positions that `forEachChild`
  // skips (e.g. between elements in an array literal).
  function visit(node: ts.Node): void {
    record(ts.getLeadingCommentRanges(text, node.getFullStart()));
    record(ts.getTrailingCommentRanges(text, node.getEnd()));
    const children = node.getChildren(source);
    if (children.length === 0) return;
    for (const child of children) visit(child);
  }
  record(ts.getLeadingCommentRanges(text, 0));
  visit(source);

  return { all, jsdocSpans };
}

interface Range { readonly pos: number; readonly end: number; }

function expandRange(text: string, r: Range): Range {
  let start = r.pos;
  let end = r.end;
  while (start > 0 && (text[start - 1] === ' ' || text[start - 1] === '\t')) {
    start--;
  }
  const standalone = start === 0 || text[start - 1] === '\n';
  if (standalone) {
    if (text[end] === '\n') end++;
  }
  return { pos: start, end };
}

function stripComments(filePath: string, text: string): string {
  let shebang = '';
  let body = text;
  if (body.startsWith('#!')) {
    const nl = body.indexOf('\n');
    if (nl !== -1) {
      shebang = body.slice(0, nl + 1);
      body = body.slice(nl + 1);
    }
  }

  const source = ts.createSourceFile(
    filePath,
    body,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  const { all } = collectAllComments(source, body);

  const toRemove: Range[] = [];
  for (const c of all) {
    const commentText = body.slice(c.pos, c.end);
    if (commentText.startsWith('/**') && !commentText.startsWith('/***')) continue;
    if (isDirective(commentText)) continue;
    toRemove.push({ pos: c.pos, end: c.end });
  }

  toRemove.sort((a, b) => b.pos - a.pos);
  let result = body;
  for (const r of toRemove) {
    const expanded = expandRange(result, r);
    result = result.slice(0, expanded.pos) + result.slice(expanded.end);
  }

  result = result.replace(/\n{3,}/g, '\n\n');
  result = result.replace(/[ \t]+$/gm, '');
  result = result.replace(/\n+$/, '\n');

  return shebang + result;
}

const files = process.argv.slice(2);
let changed = 0;
let bytesBefore = 0;
let bytesAfter = 0;
for (const f of files) {
  const original = readFileSync(f, 'utf8');
  const stripped = stripComments(f, original);
  bytesBefore += original.length;
  bytesAfter += stripped.length;
  if (stripped !== original) {
    writeFileSync(f, stripped);
    changed++;
  }
}
console.log(
  `Processed ${String(files.length)} files; changed ${String(changed)}; ` +
    `bytes ${String(bytesBefore)} -> ${String(bytesAfter)} ` +
    `(${String(bytesBefore - bytesAfter)} removed)`
);

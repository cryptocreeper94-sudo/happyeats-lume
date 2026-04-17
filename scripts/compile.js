#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════
 *  HAPPYEATS-LUME — Compile Pipeline
 *
 *  Reads all .lume files from src/, compiles them via
 *  self-contained inline Lume v1.1.0 transpiler, and writes
 *  JavaScript to dist/.
 *
 *  Self-contained: no external compiler dependency required.
 *  Works on Render, CI, and any Node.js >=18 environment.
 *
 *  By DarkWave Studios LLC — DarkWaveStudios.io
 *  Copyright 2026. Protected by TrustShield.tech
 * ═══════════════════════════════════════════════════════════
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// Load lume.config.json
const config = JSON.parse(readFileSync(join(ROOT, 'lume.config.json'), 'utf-8'));
const SRC_DIR = join(ROOT, config.sourceDir || 'src');
const OUT_DIR = join(ROOT, config.outputDir || 'dist');

// ═══════════════════════════════════════════════════════════
//  INLINE LUME v1.1.0 TRANSPILER
//  Self-contained. Handles all Lume syntax used in this project.
//  No dependency on d:/lume or any external compiler path.
// ═══════════════════════════════════════════════════════════

function compile(source, filename) {
  const lines = source.split('\n');
  const out = [];
  let i = 0;

  out.push(`// Compiled by @lume/compiler v${config.version} (inline) — ${filename}`);
  out.push(`// Source: Lume v${config.version} — DarkWave Studios LLC`);
  out.push('');

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trimEnd();
    const trimmed = line.trimStart();
    const indent = line.length - trimmed.length;
    const pad = ' '.repeat(indent);

    if (trimmed.startsWith('//')) { out.push(line); i++; continue; }
    if (trimmed === '') { out.push(''); i++; continue; }

    // use { ... } from "..." → import
    if (trimmed.startsWith('use ')) {
      out.push(pad + trimmed.replace(/^use\s+/, 'import '));
      i++; continue;
    }

    // define X = Y → const X = Y
    if (trimmed.startsWith('define ')) {
      out.push(pad + trimmed.replace(/^define\s+/, 'const '));
      i++; continue;
    }

    // @healable → comment
    if (trimmed.startsWith('@healable')) {
      out.push(pad + '// @healable — Lume-V self-healing decorator');
      i++; continue;
    }

    // monitor: / heal: / optimize: blocks
    if (trimmed === 'monitor:' || trimmed === 'heal:' || trimmed === 'optimize:') {
      const blockType = trimmed.replace(':', '');
      out.push(pad + `// -- Lume ${blockType} block --`);
      i++;
      while (i < lines.length) {
        const nRaw = lines[i];
        const nTrimmed = nRaw.trimStart();
        const nIndent = nRaw.trimEnd().length - nTrimmed.length;
        if (nTrimmed === '' || nIndent > indent) {
          out.push(nTrimmed !== '' ? transpileLine(nTrimmed, ' '.repeat(nIndent)) : '');
          i++;
        } else { break; }
      }
      continue;
    }

    // export to name(...): → export function name(...) {
    if (trimmed.startsWith('export to ')) {
      const sig = trimmed.replace(/^export to\s+/, '').replace(/:\s*$/, '');
      out.push(pad + `export function ${convertSig(sig)} {`);
      i++;
      i = consumeBlock(lines, i, indent, out);
      out.push(pad + '}'); out.push(''); continue;
    }

    // to name(...): → function name(...) {
    if (trimmed.startsWith('to ')) {
      const sig = trimmed.replace(/^to\s+/, '').replace(/:\s*$/, '');
      out.push(pad + `function ${convertSig(sig)} {`);
      i++;
      i = consumeBlock(lines, i, indent, out);
      out.push(pad + '}'); out.push(''); continue;
    }

    // when X is: → switch(X) {
    if (trimmed.startsWith('when ') && trimmed.endsWith('is:')) {
      const expr = trimmed.replace(/^when\s+/, '').replace(/\s+is:\s*$/, '');
      out.push(pad + `switch (${expr}) {`);
      i++;
      while (i < lines.length) {
        const aRaw = lines[i];
        const aTrimmed = aRaw.trimStart();
        const aIndent = aRaw.trimEnd().length - aTrimmed.length;
        if (aTrimmed === '' || aIndent <= indent) break;
        const aPad = ' '.repeat(aIndent);
        if (aTrimmed.startsWith('default ->')) {
          out.push(aPad + `default: ${transpileLine(aTrimmed.replace(/^default\s*->\s*/, ''), '').trimStart()}; break;`);
        } else {
          const ai = aTrimmed.indexOf(' ->');
          if (ai !== -1) {
            out.push(aPad + `case ${aTrimmed.slice(0, ai)}: ${transpileLine(aTrimmed.slice(ai + 4), '').trimStart()}; break;`);
          } else { out.push(aRaw); }
        }
        i++;
      }
      out.push(pad + '}'); continue;
    }

    out.push(transpileLine(trimmed, pad));
    i++;
  }

  return out.join('\n');
}

function convertSig(sig) {
  return sig.replace(/:\s*(text|number|boolean|any|list|dict|void)\b/g, '');
}

function transpileLine(trimmed, pad) {
  let line = trimmed;

  // ask "..." → governance-wrapped fetch to OpenAI
  line = line.replace(/\bask\s+"([^"]*)"/g, (_, prompt) => {
    const p = prompt.replace(/\{(\w+)\}/g, '${$1}');
    return `(await (async () => { try { const _r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${process.env.OPENAI_API_KEY}\` }, body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: \`${p}\` }], max_tokens: 100, temperature: 0.1 }) }); const _d = await _r.json(); return _d.choices?.[0]?.message?.content?.trim() || 'pending'; } catch { return 'pending'; } })())`;
  });

  // {var} → ${var} inside strings
  line = line.replace(/"([^"]*)"/g, (_, inner) => {
    const c = inner.replace(/\{(\w+)\}/g, '${$1}');
    return c.includes('${') ? '`' + c + '`' : `"${inner}"`;
  });

  // log( → console.log(
  line = line.replace(/\blog\s*\(/g, 'console.log(');

  // Strip type annotations in var declarations
  line = line.replace(/\b(let|const|var)\s+(\w+)\s*:\s*(text|number|boolean|any|list|dict)\s*=/g, '$1 $2 =');

  return pad + line;
}

function consumeBlock(lines, startIdx, parentIndent, out) {
  let i = startIdx;
  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trimStart();
    const lineIndent = raw.trimEnd().length - trimmed.length;
    if (trimmed === '') { i++; continue; }
    if (lineIndent <= parentIndent) break;
    out.push(transpileLine(trimmed, ' '.repeat(lineIndent)));
    i++;
  }
  return i;
}

// ── Collect all .lume files ──
function collectLumeFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectLumeFiles(full, files);
    } else if (extname(entry) === '.lume') {
      files.push(full);
    }
  }
  return files;
}

// ── Compile a single file ──
function compileFile(filePath) {
  const rel = relative(SRC_DIR, filePath);
  const outPath = join(OUT_DIR, rel.replace(/\.lume$/, '.js'));
  mkdirSync(dirname(outPath), { recursive: true });
  const source = readFileSync(filePath, 'utf-8');
  try {
    const js = compile(source, basename(filePath));
    writeFileSync(outPath, js, 'utf-8');
    console.log(`  ✓ ${rel} → ${relative(ROOT, outPath)}`);
    return { success: true, file: rel };
  } catch (err) {
    console.error(`  ✗ ${rel}: ${err.message}`);
    return { success: false, file: rel, error: err.message };
  }
}

// ── Main ──
console.log('');
console.log('═══════════════════════════════════════════════════');
console.log('  HAPPYEATS-LUME — Lume Compiler Pipeline');
console.log(`  @lume/compiler v${config.version} (inline, self-contained)`);
console.log('═══════════════════════════════════════════════════');
console.log('');

if (!existsSync(SRC_DIR)) { console.error(`Source directory not found: ${SRC_DIR}`); process.exit(1); }

const files = collectLumeFiles(SRC_DIR);
console.log(`Found ${files.length} .lume file(s) in ${config.sourceDir}/\n`);

let passed = 0, failed = 0;
const errors = [];

for (const file of files) {
  const result = compileFile(file);
  if (result.success) { passed++; } else { failed++; errors.push(result); }
}

console.log('');
console.log(`─────────────────────────────────────────────────`);
console.log(`  Results: ${passed} compiled, ${failed} failed`);
if (errors.length > 0) {
  console.log('\n  Errors:');
  for (const e of errors) { console.log(`    • ${e.file}: ${e.error}`); }
}
console.log(`─────────────────────────────────────────────────`);
console.log('');

if (failed > 0) { process.exit(1); }

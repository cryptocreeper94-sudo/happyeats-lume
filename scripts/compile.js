#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════
 *  HAPPYEATS-LUME — Compile Pipeline
 *
 *  Reads all .lume files from src/, compiles them via
 *  @lume/compiler, and writes JavaScript to dist/.
 *
 *  Usage:
 *    node scripts/compile.js          # one-shot compile
 *    node scripts/compile.js --watch  # watch mode
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

// Dynamic import of the Lume compiler from configured path
const compilerPath = config.compilerPath || 'd:/lume';
const { compile } = await import(`file:///${compilerPath}/src/index.js`);

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
    const outDir = dirname(outPath);

    mkdirSync(outDir, { recursive: true });

    const source = readFileSync(filePath, 'utf-8');
    const filename = basename(filePath);

    try {
        const js = compile(source, filename);
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
console.log('  @lume/compiler v' + config.version);
console.log('═══════════════════════════════════════════════════');
console.log('');

if (!existsSync(SRC_DIR)) {
    console.error(`Source directory not found: ${SRC_DIR}`);
    process.exit(1);
}

const files = collectLumeFiles(SRC_DIR);
console.log(`Found ${files.length} .lume file(s) in ${config.sourceDir}/\n`);

let passed = 0;
let failed = 0;
const errors = [];

for (const file of files) {
    const result = compileFile(file);
    if (result.success) {
        passed++;
    } else {
        failed++;
        errors.push(result);
    }
}

console.log('');
console.log(`─────────────────────────────────────────────────`);
console.log(`  Results: ${passed} compiled, ${failed} failed`);
if (errors.length > 0) {
    console.log('');
    console.log('  Errors:');
    for (const e of errors) {
        console.log(`    • ${e.file}: ${e.error}`);
    }
}
console.log(`─────────────────────────────────────────────────`);
console.log('');

if (failed > 0) {
    process.exit(1);
}

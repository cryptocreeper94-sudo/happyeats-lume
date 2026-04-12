#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  HAPPYEATS-LUME — Render Build Script
# ═══════════════════════════════════════════════════════════

set -e

echo "═══ Installing dependencies ═══"
npm ci

echo "═══ Compiling .lume → .js ═══"
npm run compile

echo "═══ Build complete ═══"

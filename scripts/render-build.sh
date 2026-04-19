#!/bin/bash
# HAPPYEATS-LUME - Render Build Script

set -e

echo "Installing dependencies..."
npm ci --include=dev

echo "Compiling .lume files..."
npm run compile

echo "Building React Client..."
npm run build:client

echo "Build complete."

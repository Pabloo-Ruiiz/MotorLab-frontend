#!/usr/bin/env bash
set -e
BACKEND="${1:?Ús: bash scripts/build-frontend.sh ../ruta-del-backend}"
npm ci
npm run build:prod
rm -rf "$BACKEND/src/main/resources/static"
mkdir -p "$BACKEND/src/main/resources/static"
cp -r dist/motorlab/browser/* "$BACKEND/src/main/resources/static/"
echo "Frontend copiat a $BACKEND/src/main/resources/static"

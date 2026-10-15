#!/usr/bin/env bash
# Gera public/og.jpg (1200×630) a partir de scripts/og/template.html — substitui a og provisória
# da Task 6. Nunca gera pessoa por IA: usa a foto real da Dra. se existir, senão o placeholder.
# Uso: npm run og
set -euo pipefail

PORT="${OG_PORT:-4825}"
URL="http://127.0.0.1:$PORT/"
AB=(agent-browser --session lt-og)
OUT=".e2e-tmp/og"
mkdir -p "$OUT"

node scripts/og/serve.mjs "$PORT" &
SERVER_PID=$!
trap '"${AB[@]}" close >/dev/null 2>&1 || true; kill "$SERVER_PID" 2>/dev/null || true' EXIT

for _ in $(seq 1 30); do
  curl -sf "$URL" >/dev/null 2>&1 && break
  sleep 0.3
done
curl -sf "$URL" >/dev/null || { echo "scripts/og/serve.mjs não respondeu em $URL"; exit 1; }

for FONT in \
  node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2 \
  node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2 \
  node_modules/@fontsource/jost/files/jost-latin-400-normal.woff2 \
  node_modules/@fontsource/jost/files/jost-latin-500-normal.woff2 \
  node_modules/@fontsource/pinyon-script/files/pinyon-script-latin-400-normal.woff2
do
  curl -sf "http://127.0.0.1:$PORT/$FONT" -o /dev/null || { echo "fonte ausente: $FONT (rode npm install)"; exit 1; }
done

"${AB[@]}" close >/dev/null 2>&1 || true
"${AB[@]}" set viewport 1200 630 >/dev/null
"${AB[@]}" open "$URL" >/dev/null
"${AB[@]}" wait --load networkidle >/dev/null
"${AB[@]}" eval "document.fonts.ready.then(() => true)" >/dev/null
"${AB[@]}" screenshot "" "$OUT/raw.png" >/dev/null
"${AB[@]}" close >/dev/null

node -e "import('sharp').then(async ({ default: sharp }) => { await sharp('$OUT/raw.png').resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 85, mozjpeg: true }).toFile('public/og.jpg'); const m = await sharp('public/og.jpg').metadata(); console.log('public/og.jpg', m.width + 'x' + m.height, m.format); })"

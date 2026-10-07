#!/usr/bin/env bash
# Captura rápida de um seletor/âncora em várias larguras, para conferência visual durante as tarefas.
# Uso: npm run build && node scripts/with-preview.mjs bash scripts/shot.sh "#tratamentos" 375 1280
#      PAGE_PATH=/politica-de-privacidade node scripts/with-preview.mjs bash scripts/shot.sh "h1" 375
set -euo pipefail

TARGET="${1:?informe o seletor, ex.: #tratamentos}"
shift
WIDTHS=("$@")
if [ ${#WIDTHS[@]} -eq 0 ]; then WIDTHS=(375 1280); fi
BASE_URL="${BASE_URL:-http://127.0.0.1:4321/}"
TARGET_URL="${BASE_URL%/}${PAGE_PATH:-/}"
OUT=".e2e-tmp"
AB=(agent-browser --session lt-shot)
NAME="$(printf '%s' "$TARGET" | tr -c 'a-zA-Z0-9' '-' | sed -e 's/^-*//' -e 's/-*$//')"
SELECTOR_JSON="$(node -e 'process.stdout.write(JSON.stringify(process.argv[1]))' "$TARGET")"

command -v agent-browser >/dev/null || { echo "agent-browser não encontrado no PATH (use o Git Bash)"; exit 1; }
mkdir -p "$OUT"
"${AB[@]}" close >/dev/null 2>&1 || true
for WIDTH in "${WIDTHS[@]}"; do
  "${AB[@]}" open "$TARGET_URL" >/dev/null
  "${AB[@]}" set viewport "$WIDTH" 900 >/dev/null
  "${AB[@]}" open "$TARGET_URL" >/dev/null
  "${AB[@]}" wait --load networkidle >/dev/null
  printf 'document.querySelector(%s)?.scrollIntoView({ block: "start" }); true\n' "$SELECTOR_JSON" \
    | "${AB[@]}" eval --stdin >/dev/null
  "${AB[@]}" wait 1500 >/dev/null
  # seletor vazio = captura o viewport inteiro (agent-browser 0.27.0 espera: screenshot [selector] [path])
  "${AB[@]}" screenshot "" "$OUT/$NAME-$WIDTH.png" >/dev/null
  echo "$OUT/$NAME-$WIDTH.png"
done
"${AB[@]}" close >/dev/null

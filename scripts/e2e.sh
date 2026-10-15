#!/usr/bin/env bash
# Suíte e2e completa: capturas, console, CTAs, menu mobile, FAQ, slider por teclado, sem rolagem
# horizontal em 320/375 (Review Focus 4), movimento reduzido, resiliência (reload no meio da
# página, troca de breakpoint com a página rolada, pausa da marquee por toque — Etapa 5),
# scripts bloqueados + failsafe de 4s (Review Focus 5) e axe-core. Uso: npm run build && npm run e2e
set -euo pipefail

BASE_URL="${BASE_URL:?defina BASE_URL (rode via "npm run e2e", que usa scripts/with-preview.mjs)}"
OUT=".e2e-tmp/e2e"
QA="docs/qa"
AB=(agent-browser --session lt-e2e)
mkdir -p "$OUT" "$QA"
"${AB[@]}" close >/dev/null 2>&1 || true

# Fecha as sessões do navegador e o servidor "sem JS" mesmo se algo falhar no meio (host com pouca memória).
NOJS_PID=""
cleanup() {
  agent-browser --session lt-e2e close >/dev/null 2>&1 || true
  agent-browser --session lt-e2e-res close >/dev/null 2>&1 || true
  if [ -n "$NOJS_PID" ]; then kill "$NOJS_PID" >/dev/null 2>&1 || true; fi
}
trap cleanup EXIT

FAIL=0
step() { echo "▶ $1"; }

# 1) Capturas em 4 larguras ---------------------------------------------------
step "capturas 375/768/1280/1440"
declare -A HEIGHTS=([375]=812 [768]=1024 [1280]=800 [1440]=900)
for WIDTH in 375 768 1280 1440; do
  "${AB[@]}" set viewport "$WIDTH" "${HEIGHTS[$WIDTH]}" >/dev/null
  "${AB[@]}" open "$BASE_URL" >/dev/null
  "${AB[@]}" wait --load networkidle >/dev/null
  "${AB[@]}" screenshot --full "" "$QA/home-$WIDTH.png" >/dev/null
  echo "  $QA/home-$WIDTH.png"
done

# 2) Console sem erros ---------------------------------------------------------
step "console sem erros"
"${AB[@]}" set viewport 1280 900 >/dev/null
"${AB[@]}" open "$BASE_URL" >/dev/null
"${AB[@]}" wait --load networkidle >/dev/null
"${AB[@]}" --json console > "$OUT/console.json"

# 3) CTAs do WhatsApp (amostra) -------------------------------------------------
# Nota: NÃO envolver em JSON.stringify — o agent-browser já serializa o valor de retorno como
# JSON; se devolvermos uma string já serializada, ele a serializa de novo (JSON dentro de JSON) e
# o JSON.parse único do e2e-check-logs.mjs (código literal do brief) devolveria uma string, não um
# objeto. Devolvendo o objeto puro, o agent-browser imprime o JSON pronto para um só JSON.parse.
step "CTAs do WhatsApp (amostra)"
"${AB[@]}" eval --stdin > "$OUT/cta-hrefs.json" <<'JS'
Object.fromEntries(
  ['hero', 'floating', 'treatment', 'final'].map((origin) => [
    origin,
    document.querySelector(`a[data-wa-origin="${origin}"]`)?.getAttribute('href') ?? null,
  ]),
)
JS

# 4) Menu mobile (gaveta) --------------------------------------------------------
step "menu mobile"
"${AB[@]}" set viewport 375 812 >/dev/null
"${AB[@]}" open "$BASE_URL" >/dev/null
"${AB[@]}" wait --load networkidle >/dev/null
"${AB[@]}" click "[data-nav-open]" >/dev/null
"${AB[@]}" wait 300 >/dev/null
"${AB[@]}" eval "JSON.stringify(document.querySelector('[data-nav-menu]').open === true && document.querySelector('[data-nav-open]').getAttribute('aria-expanded') === 'true')" > "$OUT/menu-open.json"
"${AB[@]}" screenshot "" "$QA/menu-mobile-375.png" >/dev/null
"${AB[@]}" press Escape >/dev/null
"${AB[@]}" wait 300 >/dev/null
"${AB[@]}" eval "JSON.stringify(document.querySelector('[data-nav-menu]').open === false)" > "$OUT/menu-closed.json"

# 5) FAQ (acordeão nativo <details>) ---------------------------------------------
step "FAQ"
"${AB[@]}" set viewport 1280 900 >/dev/null
"${AB[@]}" open "$BASE_URL" >/dev/null
"${AB[@]}" wait --load networkidle >/dev/null
"${AB[@]}" scrollintoview "#duvidas" >/dev/null
"${AB[@]}" find text "Dói?" click --exact >/dev/null
"${AB[@]}" wait 300 >/dev/null
"${AB[@]}" eval "JSON.stringify([...document.querySelectorAll('#duvidas details.faq__item')].find((d) => d.querySelector('summary')?.textContent.trim() === 'Dói?')?.open === true)" > "$OUT/faq-open.json"

# 6) Slider antes/depois por teclado (Global Constraints) ------------------------
step "slider antes/depois por teclado"
"${AB[@]}" scrollintoview "[data-ba-range]" >/dev/null
"${AB[@]}" get value "[data-ba-range]" > "$OUT/slider-before.txt"
"${AB[@]}" focus "[data-ba-range]" >/dev/null
"${AB[@]}" press ArrowRight >/dev/null
"${AB[@]}" press ArrowRight >/dev/null
"${AB[@]}" get value "[data-ba-range]" > "$OUT/slider-after.txt"

# 7) Sem rolagem horizontal em 320/375 (Review Focus 4) ---------------------------
step "sem rolagem horizontal em 320 e 375 px"
for WIDTH in 320 375; do
  "${AB[@]}" set viewport "$WIDTH" 800 >/dev/null
  "${AB[@]}" open "$BASE_URL" >/dev/null
  "${AB[@]}" wait --load networkidle >/dev/null
  "${AB[@]}" eval "JSON.stringify(document.documentElement.scrollWidth <= document.documentElement.clientWidth)" > "$OUT/no-scroll-$WIDTH.txt"
done

# 8) Movimento reduzido -----------------------------------------------------------
# [data-reveal] usa ScrollTrigger.batch (start: "top 95%") mesmo em movimento reduzido
# (src/scripts/motion/reduced.ts) — só fica opacity:1 depois que o elemento entra na viewport.
# Por isso é preciso rolar a página inteira antes de checar (mesmo padrão de .e2e-tmp/motion-check.sh).
step "movimento reduzido"
"${AB[@]}" set viewport 1280 900 >/dev/null
"${AB[@]}" set media light reduced-motion >/dev/null
"${AB[@]}" open "$BASE_URL" >/dev/null
"${AB[@]}" wait --load networkidle >/dev/null
"${AB[@]}" eval --stdin > "$OUT/reduced-motion.json" <<'JS'
(async () => {
  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
    window.scrollTo(0, y);
    await pause(80);
  }
  await pause(600);
  return JSON.stringify(
    [...document.querySelectorAll('[data-reveal]')].every((el) => getComputedStyle(el).opacity === '1'),
  );
})()
JS
"${AB[@]}" set media no-preference >/dev/null 2>&1 || true

# 9) Resiliência — reload no meio da página, troca de breakpoint com a página rolada e -----------
#    pausa/retomada da marquee por toque (reaproveitado de .e2e-tmp/resilience-check.sh, Etapa 5).
step "resiliência (reload, troca de breakpoint, marquee por toque)"
RES_AB=(agent-browser --session lt-e2e-res)
"${RES_AB[@]}" close >/dev/null 2>&1 || true

# Devolve o objeto puro (sem JSON.stringify) — o agent-browser já serializa o retorno como JSON;
# stringificar aqui faria ele serializar de novo (JSON dentro de JSON), e o JSON.parse único do
# check_zeroes abaixo devolveria uma string, não um objeto (mesma armadilha do item 3).
STATE='(() => { const q = (s) => [...document.querySelectorAll(s)]; const vh = innerHeight; const pos = (e) => { const r = e.getBoundingClientRect(); return r.bottom < 0 ? "above" : r.top > vh ? "below" : "inview"; }; const hid = (e) => { const s = getComputedStyle(e); return s.opacity === "0" || s.visibility === "hidden"; }; const passed = (sel) => q(sel).filter((e) => pos(e) !== "below"); const wordsOffset = passed("[data-title]").reduce((sum, t) => sum + [...t.querySelectorAll("div,span")].filter((s) => Math.abs(new DOMMatrix(getComputedStyle(s).transform).m42) > 1).length, 0); return { revealHidden: passed("[data-reveal]").filter(hid).length, titleHidden: passed("[data-title]").filter(hid).length, sigHidden: passed("[data-signature]").filter(hid).length, wordsOffset, archOpen: q("[data-arch-reveal]").filter((e) => pos(e) !== "below").every((e) => getComputedStyle(e).clipPath.startsWith("inset(0")), counters: q("[data-count-to]").map((e) => e.textContent.trim()) }; })()'

RES_RELOAD_375="OK"
RES_RELOAD_1280="OK"
RES_RESIZE="OK"
RES_MARQUEE="OK"

check_zeroes() {
  node -e "
    let s = JSON.parse(process.argv[1]);
    const bad = [];
    if (s.revealHidden !== 0) bad.push('revealHidden=' + s.revealHidden);
    if (s.titleHidden !== 0) bad.push('titleHidden=' + s.titleHidden);
    if (s.sigHidden !== 0) bad.push('sigHidden=' + s.sigHidden);
    if (s.wordsOffset !== 0) bad.push('wordsOffset=' + s.wordsOffset);
    if (bad.length) { console.error(bad.join(', ')); process.exit(1); }
  " -- "$1"
}

check_console_errors() {
  node -e "
    const m = JSON.parse(require('node:fs').readFileSync(process.argv[1], 'utf8'));
    const errors = (m.data?.messages ?? []).filter((x) => x.type === 'error');
    if (errors.length) { console.error(errors.map((e) => e.text).join('; ')); process.exit(1); }
  " -- "$1"
}

echo '  cenário 1: reload no meio da página'
for WIDTH in 375 1280; do
  "${RES_AB[@]}" open "$BASE_URL" >/dev/null
  "${RES_AB[@]}" set viewport "$WIDTH" 800 >/dev/null
  "${RES_AB[@]}" open "${BASE_URL}#duvidas" >/dev/null
  "${RES_AB[@]}" wait --load networkidle >/dev/null
  "${RES_AB[@]}" wait 2000 >/dev/null
  "${RES_AB[@]}" eval 'document.querySelector("#dra-laura")?.scrollIntoView(); 1' >/dev/null
  "${RES_AB[@]}" wait 1500 >/dev/null
  "${RES_AB[@]}" reload >/dev/null
  "${RES_AB[@]}" wait --load networkidle >/dev/null
  "${RES_AB[@]}" wait 2000 >/dev/null
  STATE_JSON=$("${RES_AB[@]}" eval "$STATE")
  DETAIL=""
  if ! DETAIL="$(check_zeroes "$STATE_JSON" 2>&1)"; then
    FAIL=1
    if [ "$WIDTH" = "375" ]; then RES_RELOAD_375="FALHOU — $DETAIL"; else RES_RELOAD_1280="FALHOU — $DETAIL"; fi
  fi
  "${RES_AB[@]}" --json console > "$OUT/resilience-reload-$WIDTH-console.json"
  if ! DETAIL="$(check_console_errors "$OUT/resilience-reload-$WIDTH-console.json" 2>&1)"; then
    FAIL=1
    if [ "$WIDTH" = "375" ]; then RES_RELOAD_375="FALHOU — console: $DETAIL"; else RES_RELOAD_1280="FALHOU — console: $DETAIL"; fi
  fi
done
"${RES_AB[@]}" close >/dev/null 2>&1 || true

echo '  cenário 2: troca 1280 -> 375 -> 1280 com a página rolada'
SLOW='(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 350) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); } await new Promise((r) => setTimeout(r, 1200)); return 1; })()'
"${RES_AB[@]}" open "$BASE_URL" >/dev/null
"${RES_AB[@]}" set viewport 1280 800 >/dev/null
"${RES_AB[@]}" open "$BASE_URL" >/dev/null
"${RES_AB[@]}" wait --load networkidle >/dev/null
"${RES_AB[@]}" eval "$SLOW" >/dev/null
"${RES_AB[@]}" set viewport 375 800 >/dev/null
"${RES_AB[@]}" wait 3000 >/dev/null
"${RES_AB[@]}" eval "$SLOW" >/dev/null
STATE_375=$("${RES_AB[@]}" eval "$STATE")
if ! DETAIL="$(check_zeroes "$STATE_375" 2>&1)"; then FAIL=1; RES_RESIZE="FALHOU — 375: $DETAIL"; fi
"${RES_AB[@]}" set viewport 1280 800 >/dev/null
"${RES_AB[@]}" wait 3000 >/dev/null
"${RES_AB[@]}" eval "$SLOW" >/dev/null
STATE_1280=$("${RES_AB[@]}" eval "$STATE")
if ! DETAIL="$(check_zeroes "$STATE_1280" 2>&1)"; then FAIL=1; RES_RESIZE="FALHOU — 1280: $DETAIL"; fi
if [ "$RES_RESIZE" = "OK" ]; then
  if ! DETAIL="$(node -e "
    const s = JSON.parse(process.argv[1]);
    const bad = [];
    if (!s.archOpen) bad.push('arcos não abertos');
    if (s.counters.some((c) => /\+0|\b0 anos\b/.test(c))) bad.push('contador não chegou ao valor final: ' + s.counters);
    if (bad.length) { console.error(bad.join(', ')); process.exit(1); }
  " -- "$STATE_1280" 2>&1)"; then
    FAIL=1
    RES_RESIZE="FALHOU — 1280: $DETAIL"
  fi
fi
"${RES_AB[@]}" --json console > "$OUT/resilience-resize-console.json"
if [ "$RES_RESIZE" = "OK" ] && ! DETAIL="$(check_console_errors "$OUT/resilience-resize-console.json" 2>&1)"; then
  FAIL=1
  RES_RESIZE="FALHOU — console: $DETAIL"
fi
"${RES_AB[@]}" close >/dev/null 2>&1 || true

echo '  cenário 3: marquee em 375, pausar/retomar por toque'
"${RES_AB[@]}" open "$BASE_URL" >/dev/null
"${RES_AB[@]}" set viewport 375 800 >/dev/null
"${RES_AB[@]}" open "$BASE_URL" >/dev/null
"${RES_AB[@]}" wait --load networkidle >/dev/null
SPEED='(async () => { const t = document.querySelector("[data-marquee-track]"); const x = () => new DOMMatrix(getComputedStyle(t).transform).m41; const a = x(); const t0 = performance.now(); await new Promise((r) => setTimeout(r, 500)); const b = x(); const dt = (performance.now() - t0) / 1000; return Math.round((b - a) / dt * 10) / 10; })()'
TOUCH_TAP='(() => { const btn = document.querySelector("[data-marquee-toggle]"); const fire = (type) => btn.dispatchEvent(new PointerEvent(type, { pointerType: "touch", bubbles: true, cancelable: true })); fire("pointerover"); fire("pointerenter"); fire("pointerdown"); fire("pointerup"); btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true })); fire("pointerout"); fire("pointerleave"); return btn.getAttribute("aria-pressed"); })()'
"${RES_AB[@]}" eval "$TOUCH_TAP" >/dev/null
"${RES_AB[@]}" wait 300 >/dev/null
SPEED_PAUSED=$("${RES_AB[@]}" eval "$SPEED")
if [ "$SPEED_PAUSED" != "0" ]; then FAIL=1; RES_MARQUEE="FALHOU — não pausou no 1º toque (velocidade=$SPEED_PAUSED)"; fi
"${RES_AB[@]}" eval "$TOUCH_TAP" >/dev/null
"${RES_AB[@]}" wait 300 >/dev/null
SPEED_RESUMED=$("${RES_AB[@]}" eval "$SPEED")
if [ "$RES_MARQUEE" = "OK" ] && ! node -e "process.exit(Math.abs(Number(process.argv[1])) > 10 ? 0 : 1)" -- "$SPEED_RESUMED"; then
  FAIL=1
  RES_MARQUEE="FALHOU — não retomou no 2º toque (velocidade=$SPEED_RESUMED)"
fi
"${RES_AB[@]}" --json console > "$OUT/resilience-touch-console.json"
if [ "$RES_MARQUEE" = "OK" ] && ! DETAIL="$(check_console_errors "$OUT/resilience-touch-console.json" 2>&1)"; then
  FAIL=1
  RES_MARQUEE="FALHOU — console: $DETAIL"
fi
"${RES_AB[@]}" close >/dev/null 2>&1 || true

# 10) Scripts bloqueados -> failsafe de 4s revela o conteúdo (Review Focus 5) --------------------
# agent-browser 0.27 "network route --abort --resource-type script" NÃO bloqueia os módulos
# (<script type="module" src>, confirmado por teste manual). Em vez disso: serve uma cópia de
# dist/ sem essas tags num servidor estático Node à parte.
step "scripts bloqueados (failsafe de 4s)"
"${AB[@]}" close >/dev/null 2>&1 || true
NOJS_DIR=".e2e-tmp/dist-nojs"
export NOJS_PORT="${NOJS_PORT:-4399}"
rm -rf "$NOJS_DIR"
mkdir -p "$NOJS_DIR"
cp -r dist/. "$NOJS_DIR/"

node --input-type=module <<'JS'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const dir = '.e2e-tmp/dist-nojs';
for (const file of readdirSync(dir)) {
  if (!file.endsWith('.html')) continue;
  const path = join(dir, file);
  const html = readFileSync(path, 'utf8');
  const stripped = html.replace(/<script type="module" src="[^"]*"><\/script>/g, '');
  writeFileSync(path, stripped);
}
console.log('scripts de módulo removidos de', dir);
JS

node --input-type=module <<'JS' &
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
const DIR = '.e2e-tmp/dist-nojs';
const PORT = Number(process.env.NOJS_PORT ?? 4399);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.json': 'application/json',
};
createServer((req, res) => {
  let reqPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (reqPath.endsWith('/')) reqPath += 'index.html';
  let full = join(DIR, reqPath);
  if (!existsSync(full) || statSync(full).isDirectory()) full = join(DIR, 'index.html');
  res.setHeader('Content-Type', TYPES[extname(full)] ?? 'application/octet-stream');
  createReadStream(full).pipe(res);
}).listen(PORT);
JS
NOJS_PID=$!
curl --silent --retry 20 --retry-delay 1 --retry-connrefused "http://127.0.0.1:$NOJS_PORT/" >/dev/null

NOJS_URL="http://127.0.0.1:$NOJS_PORT/"
"${AB[@]}" set viewport 1280 900 >/dev/null
"${AB[@]}" open "$NOJS_URL" >/dev/null
"${AB[@]}" wait --load domcontentloaded >/dev/null
"${AB[@]}" wait 4300 >/dev/null
"${AB[@]}" eval "JSON.stringify([...document.querySelectorAll('[data-reveal]')].every((el) => getComputedStyle(el).opacity === '1') && !document.documentElement.classList.contains('js'))" > "$OUT/no-js-visible.json"
"${AB[@]}" close >/dev/null 2>&1 || true
kill "$NOJS_PID" >/dev/null 2>&1 || true
NOJS_PID=""

# 11) axe-core sem violações serious/critical --------------------------------------
step "axe-core"
"${AB[@]}" close >/dev/null 2>&1 || true
"${AB[@]}" open "$BASE_URL" --init-script node_modules/axe-core/axe.min.js >/dev/null
"${AB[@]}" wait --load networkidle >/dev/null
"${AB[@]}" eval --stdin > "$OUT/axe-home.json" <<'JS'
(async () => ({ violations: (await axe.run()).violations }))()
JS
"${AB[@]}" open "${BASE_URL%/}/politica-de-privacidade" --init-script node_modules/axe-core/axe.min.js >/dev/null
"${AB[@]}" wait --load networkidle >/dev/null
"${AB[@]}" eval --stdin > "$OUT/axe-privacidade.json" <<'JS'
(async () => ({ violations: (await axe.run()).violations }))()
JS

"${AB[@]}" close >/dev/null 2>&1 || true

# Interpretação + relatório (lógica pura em scripts/lib/browser-logs.mjs) -----------
NODE_EXIT=0
node scripts/e2e-check-logs.mjs "$OUT" "$QA" || NODE_EXIT=$?

# Anexa a seção de resiliência ao relatório — browser-logs.mjs/e2e-check-logs.mjs têm código
# literal fixo (brief da Task 35) e não cobrem esses cenários; o resultado abaixo é somado ao
# código de saída desta suíte.
{
  echo
  echo '## Resiliência (reload, troca de breakpoint, marquee por toque)'
  echo
  echo '| Verificação | Resultado |'
  echo '|---|---|'
  echo "| reload no meio da página (375px) | $RES_RELOAD_375 |"
  echo "| reload no meio da página (1280px) | $RES_RELOAD_1280 |"
  echo "| troca de breakpoint 1280→375→1280 com a página rolada | $RES_RESIZE |"
  echo "| marquee pausa/retoma por toque (375px) | $RES_MARQUEE |"
} >> "$QA/e2e.md"

if [ "$FAIL" != "0" ] || [ "$NODE_EXIT" != "0" ]; then
  echo "e2e: REPROVADO (ver $QA/e2e.md)"
  exit 1
fi
echo "e2e: aprovado (ver $QA/e2e.md)"

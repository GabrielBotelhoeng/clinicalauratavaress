# Landing Clínica Laura Tavares — Frente de Mídia Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar na branch `feat/midia` todos os arquivos de mídia do contrato com a frente de código (fotos reais tratadas, antes/depois só recortados, imagens e vídeos gerados sem pessoas, depoimentos reais e links de imprensa), com origem e créditos documentados e um verificador automático que só passa com o contrato cumprido.

**Architecture:** A mídia bruta e as ferramentas ficam em `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/` (ignorado pelo git, fora do worktree). Scripts Node + sharp + ffmpeg em `media-src/.tools/` recortam, exportam, comparam e verificam; `verify-contract.mjs` lê o worktree `.worktrees/midia` e só sai com código 0 quando cada item do contrato está entregue e válido, ou dispensado com motivo em `docs/media-pendencias.md`. A coleta usa o Chrome do usuário (só leitura); upscale e gerações usam o MCP do Higgsfield com meta de 450 créditos (pode ser ultrapassada com justificativa — autorização do usuário em 2026-10-05), cada chamada paga registrada em `docs/media-manifest.md`.

**Tech Stack:** Node 22.15 (ESM, `node:test`) + sharp 0.35.5; ffmpeg/ffprobe 9.0.1 (libx264, libvpx-vp9); Claude in Chrome (`mcp__claude-in-chrome__*`); MCP do Higgsfield (`balance`, `transactions`, `media_import_url`, `media_upload`, `media_confirm`, `upscale_image`, `generate_image`, `generate_image_batch`, `generate_video`, `jobs_wait`, `job_display`); WebSearch/WebFetch; git 2.47 + gh 2.97 (Git Bash, Windows 11).

**Spec:** `docs/superpowers/specs/2026-10-05-landing-clinica-laura-tavares-design.md` — leia a seção 5.3 (Mídia), a seção 7 (Riscos) e o log de decisões (seção 6) antes da Task 1. O contrato de arquivos com a frente de código está reproduzido abaixo e manda sobre qualquer outro detalhe.

## Global Constraints

- Meta de **450 créditos** do Higgsfield para toda esta frente — **não é teto rígido** (autorização do usuário em 2026-10-05, ~22h45): se for preciso passar da meta ou do subteto de uma categoria (tabela "Orçamento de créditos") para manter a qualidade da entrega, pode, desde que o item seja necessário, a ordem de prioridade seja respeitada, o custo caiba no saldo disponível e a justificativa seja registrada em "Avisos" das pendências (`- CRÉDITOS: acima da meta — <item>: <motivo>`). Continue economizando: o usuário usa os créditos em outros projetos. Antes de cada chamada paga: `"get_cost": true`.
- Registre **cada chamada paga** como uma linha da tabela de créditos de `docs/media-manifest.md`, com `mcp__higgsfield__balance` antes e depois; mantenha `- Gasto total:` igual à soma da coluna Créditos.
- Prioridade se o crédito apertar: upscale das fotos da Dra. > vídeo do Método > imagens de apoio > foto viva da recepção > reserva. As Tasks 8 → 11 seguem essa ordem.
- Seedance 2.5: sempre rascunho 480p (`"draft": true`) aprovado antes do final 1080p (`"draft_job_id"`). Kling 3.0 não tem rascunho 480p (só `mode` `std`/`pro`/`4k`): o teste é o próprio `std` de 6 s (9 créditos).
- Nunca gerar nem animar a Dra., pacientes ou equipe. Todo prompt termina pedindo "no people, no hands, no faces, no text, no logos" (na foto viva, "no text changes" no lugar de "no text", para não apagar o letreiro real). A foto viva só parte de foto da recepção **sem nenhuma pessoa**.
- Antes/depois: só recorte e redução de tamanho (nunca ampliar), sem upscale, filtro, retoque ou IA. Para eles use apenas `crop-pair.mjs` e `export-photo.mjs` **sem** `--allow-enlarge`.
- Nenhuma imagem gerada pode ser apresentada como a clínica real: prompts não pedem interiores de clínica e o manifesto marca toda imagem gerada como "ilustrativa".
- Upscale só é aceito se o rosto continuar idêntico: métrica de `compare-regions.mjs` aprovada **e** checagem visual do lado a lado, ambas registradas no manifesto. Senão, use o original redimensionado (`--allow-enlarge`).
- Depoimentos só reais: `textoOriginal` literal; `texto` com até 30 palavras formado só por cortes do original (sem palavra nova, sem trocar a ordem, sem emoji, sem quebra de linha); `autor` = primeiro nome + inicial (`Mariana S.`).
- Escreva só em `src/assets/media/**`, `public/media/**`, `src/content/depoimentos.json`, `src/content/imprensa.json`, `docs/media-manifest.md`, `docs/media-pendencias.md` (no worktree) e em `media-src/` (fora do git). Nunca edite `package.json` do repositório nem qualquer outro arquivo.
- Fotos finais: JPEG sRGB, qualidade 88 (faixa aceita 85–90), sem EXIF.
- Vídeos: `.mp4` H.264 com `+faststart` e `.webm` VP9, 16:9, 5–8 s, sem áudio, ≤ 2.000.000 bytes cada; poster JPEG 1280×720 ≤ 250.000 bytes.
- Chrome do usuário só leitura: nunca curtir, comentar, seguir, salvar, compartilhar, responder story nem mandar mensagem; nunca `double_click` em foto do Instagram (curte o post); no visualizador de stories use só `screenshot`, `zoom` e as teclas `ArrowRight`/`Escape`.
- Higgsfield: após timeout de transporte, não reenvie antes de conferir `mcp__higgsfield__transactions` e `jobs_wait`; siga `recovery_tool`/`adjustments` quando vierem na resposta; omita `use_unlim` e, se vier `unlim_choice`, pare e pergunte ao orquestrador; não passe `folder_id` (preferência `auto_create_project: false`, conferida na Task 1).
- Commits convencionais em português, só com os caminhos da tarefa (`git add <caminhos>`), terminando com as duas linhas de trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` e `Claude-Session: https://claude.ai/code/session_01LeX8QvmLLh9p9Zw7Zza2Nr` (use `git commit -m "<título>" --trailer "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" --trailer "Claude-Session: https://claude.ai/code/session_01LeX8QvmLLh9p9Zw7Zza2Nr"`).
- Corpo do PR termina com `🤖 Generated with [Claude Code](https://claude.com/claude-code)`, uma linha em branco e `https://claude.ai/code/session_01LeX8QvmLLh9p9Zw7Zza2Nr`. **Não fazer merge**: o orquestrador revisa e faz o merge.
- Git Bash: use caminhos absolutos em todo comando (o diretório atual é reiniciado entre chamadas).

## Review Focus

1. URL do CDN do Instagram expirada (parâmetro `oe=`) que baixa uma página de erro com extensão `.jpg` → `check-coleta.mjs` deve acusar "não é imagem" sem travar. Teste: Task 2, `test/coleta.test.mjs`, caso "página de erro salva como .jpg".
2. Depoimento com emoji ou quebra de linha no `texto` (o card quebra e foge da voz da marca) → o validador recusa. Teste: Task 2, `test/regras.test.mjs`, caso "depoimento com emoji ou quebra de linha".
3. Carrossel com buraco na numeração ou arquivo sobrando na pasta (`resultado-07.jpg` sem o `06`, `resultado-7.jpg`) → o import da frente de código quebra; o verificador acusa. Teste: Task 2, `test/contrato.test.mjs`, casos "buraco na numeração" e "arquivo fora do padrão".
4. JSON gravado com BOM (ex.: PowerShell `Set-Content`) → `JSON.parse` e o import quebram; o verificador acusa "JSON inválido". Teste: Task 2, `test/contrato.test.mjs`, caso "BOM no início".
5. Nome de arquivo com maiúscula, acento ou espaço em `apoio/` → o build na Vercel (Linux, diferencia maiúsculas) não acha o arquivo; o verificador acusa. Teste: Task 2, `test/contrato.test.mjs`, caso "nome com maiúscula ou acento".

---

## Contrato com a frente de código

| Arquivo | Regra |
|---|---|
| `src/assets/media/dra/hero.jpg` | Dra. Laura, meio corpo, 4:5, mínimo 1280×1600 |
| `src/assets/media/dra/sobre.jpg` | retrato da Dra. (vestido vermelho se existir), 4:5, mínimo 1200×1500 |
| `src/assets/media/clinica/recepcao.jpg`, `sala.jpg`, `equipe.jpg`, `detalhes.jpg` | lado maior ≥ 1600 px |
| `src/assets/media/resultados/{olhar,mandibula,labios,bigode}-{antes,depois}.jpg` | 4:5, mesmo tamanho dentro de cada par, só recortados |
| `src/assets/media/carrossel/resultado-01.jpg` … `resultado-NN.jpg` | 3:4, N entre 6 e 12, numeração contínua com 2 dígitos |
| `src/assets/media/tratamentos/{harmonizacao,rejuvenescimento,kbeauty,corporal}.jpg` | 4:5 |
| `src/assets/media/apoio/*.jpg` | texturas/fundos gerados, nome kebab-case |
| `public/media/metodo.mp4`, `metodo.webm`, `metodo-poster.jpg` | 16:9, 5–8 s, sem áudio, ≤ 2 MB cada vídeo |
| `public/media/cta-final.mp4`, `cta-final.webm`, `cta-final-poster.jpg` | idem (opcional) |
| `src/content/depoimentos.json` | array de objetos com `texto` (≤ 30 palavras), `textoOriginal`, `autor` (primeiro nome + inicial), `tratamento` (texto ou `null`), `fonte` (`"google"` ou `"instagram"`), `url` (texto ou `null`), `estrelas` (1–5 ou `null`) |
| `src/content/imprensa.json` | array de `{ "veiculo", "titulo", "url" (texto ou null) }` com os 4 itens de "Na mídia", na ordem do texto |
| `docs/media-manifest.md`, `docs/media-pendencias.md` | origem/créditos de cada arquivo; o que faltou e precisa da clínica |

Fotos de `src/assets/media/**`: JPEG sRGB, qualidade 85–90, sem EXIF de localização (este plano remove todo o EXIF). Guarda-corpos internos do verificador, além do contrato: resultados ≥ 400 px de largura, carrossel ≥ 600 px, tratamentos ≥ 1000 px, apoio com lado maior ≥ 1600 px e de 1 a 12 arquivos.

**Dispensa documentada:** se a fonte de uma foto não existir (ex.: nenhuma foto da sala sem paciente), o item pode ficar de fora com uma linha em `docs/media-pendencias.md` no formato `` - `<caminho>` — AUSENTE: <motivo com 10+ caracteres> ``. Chaves aceitas: o caminho de cada foto, `src/assets/media/carrossel/` (carrossel inteiro) e `public/media/metodo.*`. Os dois JSON nunca são dispensáveis. A frente de código cai para placeholder no que faltar.

## Mapa de arquivos

```
C:/Users/botel/OneDrive/Desktop/clinicalauratavares/
├── .worktrees/midia/                    worktree da branch feat/midia (WT)
│   ├── src/assets/media/**              fotos finais (contrato)
│   ├── public/media/**                  vídeos e posters (contrato)
│   ├── src/content/depoimentos.json     depoimentos reais
│   ├── src/content/imprensa.json        4 itens de "Na mídia"
│   ├── docs/media-manifest.md           origem, tratamento, prompts e créditos
│   └── docs/media-pendencias.md         dispensas, avisos, dados e pedidos à clínica
└── media-src/                           fora do git (M)
    ├── .tools/                          (T)
    │   ├── package.json                 sharp 0.35.5; scripts test e verify
    │   ├── lib/cli.mjs                  caminhos fixos e leitura de argumentos
    │   ├── lib/regras.mjs               funções puras: qualidade JPEG, faststart, texto, validadores, pendências, manifesto
    │   ├── lib/contrato.mjs             o contrato como dados + checagem por grupo
    │   ├── verify-contract.mjs          CLI do verificador (0 = OK)
    │   ├── check-coleta.mjs             confere coleta.json e a cobertura por categoria
    │   ├── export-photo.mjs             recorte + redimensionamento + JPEG q88 sRGB sem metadados (ou PNG de trabalho)
    │   ├── crop-pair.mjs                par antes/depois 4:5 no mesmo tamanho, sem ampliar, + prévia de sobreposição
    │   ├── compare-regions.mjs          métrica e lado a lado de rosto/letreiro (upscale e quadros de vídeo)
    │   ├── encode-video.mjs             mp4 H.264 + webm VP9 ≤ 2.000.000 bytes + poster 1280×720
    │   ├── grid.mjs                     grade de coordenadas para escolher caixas
    │   ├── info.mjs                     formato e dimensões
    │   └── test/*.test.mjs              node:test
    ├── coleta.json                      registro de cada foto baixada do Instagram
    ├── raw/instagram/{dra,clinica,resultados,carrossel}/
    ├── higgsfield/{upscale,imagens,video}/
    ├── compare/                         lados a lado aprovados/reprovados
    ├── work/                            grades, recortes de trabalho, prévias, quadros
    └── textos/                          bios, avaliações, transcrições, corpo do PR
```

`coleta.json` é um array; cada entrada tem exatamente: `id` (único, ex. `dra-01`), `categoria` (`dra`, `recepcao`, `sala`, `equipe`, `detalhes`, `resultado` ou `carrossel`), `queixa` (`olhar`, `mandibula`, `labios` ou `bigode` quando a categoria é `resultado`; `null` nas demais), `perfil` (`dra.lauratavares` ou `clinicalauratavaress`), `post` (URL do post ou destaque), `cdn` (URL baixada), `arquivo` (relativo a `media-src/`), `largura` e `altura` (do arquivo baixado), `pessoas` (quem aparece: `ninguém`, `só a Dra.`, `equipe`, `paciente`…) e `nota` (texto livre).

## Orçamento de créditos

Custos pré-checados com `get_cost` em 2026-10-05 (saldo 900,25, plano plus). O upscale não aceita pré-checagem sem `image_id` real: o valor vem do histórico (`transactions`: "Bytedance Image Upscale", 2 créditos) e é confirmado com `get_cost` na Task 8.

| Item | Chamada | Custo unitário | Planejado | Subteto |
|---|---|---|---|---|
| Upscale de 6 fotos reais | `upscale_image` bytedance `2k` | 2 | 12 | 20 |
| Método — rascunho 480p, 6 s | `generate_video` `seedance_2_5` `draft: true` | 18 (8 s = 24) | 18 | 54 (3 rascunhos) |
| Método — final 1080p | `generate_video` `seedance_2_5` `draft_job_id` | ≤ 72 (1080p 6 s direto = 72; 8 s = 96) | 72 | 72 |
| 4 tratamentos + 6 apoio | `generate_image(_batch)` `recraft_v4_1` `2k` | 8 | 80 | 120 |
| Foto viva da recepção, 6 s | `generate_video` `kling3_0` `std`, `sound: "off"` | 9 (5 s = 7,5; `pro` 5 s = 8,75) | 9 | 20 |
| Reserva (só se a foto viva for descartada) | `seedance_2_5` rascunho + final | 18 + ≤ 72 | 0 | 90 |
| **Total** | | | **191** | **376** |

## Procedimentos comuns

Usados por várias tarefas; cada tarefa diz qual aplicar. Fazem parte do contexto de toda tarefa, como as Global Constraints.

**P1 — Abrir o navegador (Chrome do usuário, só leitura).** Invoque a skill `claude-in-chrome` (ferramenta Skill). ToolSearch `select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__get_page_text,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__find,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__tabs_close_mcp`. Chame `tabs_context_mcp` com `{ "createIfEmpty": true }` e `tabs_create_mcp` com `{}`; anote o `tabId` da aba nova e use-o em toda chamada. Se o Instagram mostrar tela de login, pare e peça ao usuário que entre nesse Chrome (o plano nunca digita senha). Ao fim da tarefa, `tabs_close_mcp` com `{ "tabId": <tabId> }`.

**Trechos de JavaScript** — passe o conteúdo como `text` de `mcp__claude-in-chrome__javascript_tool`, com `"action": "javascript_exec"` e o `tabId`.

JS-1 — lista os posts carregados no perfil, com o texto alternativo da miniatura:

```js
JSON.stringify([...new Map([...document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')].map((a) => [a.href, { post: a.href, alt: a.querySelector('img')?.alt ?? '' }])).values()], null, 1)
```

JS-2 — rola o perfil para carregar mais posts e devolve quantos há:

```js
window.scrollTo(0, document.body.scrollHeight); document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]').length
```

JS-3 — no post aberto, devolve a maior versão de cada imagem visível (srcset) e a legenda:

```js
(() => {
  const imagens = [...document.querySelectorAll('main img')]
    .filter((img) => img.naturalWidth >= 600)
    .map((img) => {
      const candidatos = (img.srcset || '').split(',').map((s) => s.trim().split(/\s+/)).filter((p) => p[0]);
      candidatos.sort((a, b) => parseInt(b[1] || '0', 10) - parseInt(a[1] || '0', 10));
      return { url: (candidatos[0] && candidatos[0][0]) || img.currentSrc || img.src, largura: img.naturalWidth, altura: img.naturalHeight, alt: img.alt };
    });
  return JSON.stringify({ post: location.href, legenda: (document.querySelector('h1') || {}).innerText || '', imagens }, null, 1);
})()
```

JS-4 — procura profissão e conselho no texto da página:

```js
(() => {
  const t = document.body.innerText;
  const re = /(\b(?:CRBM|CRO|CRM|CRF|COREN)\b[^\n]{0,40}|\b(?:biom[eé]dic[ao]|cirurgi[ãa][ -]dentista|dentista|m[eé]dic[ao]|farmac[eê]utic[ao]|enfermeir[ao]|esteticista)\b[^\n]{0,80})/gi;
  return JSON.stringify({ pagina: location.href, achados: [...new Set([...t.matchAll(re)].map((m) => m[0]))] }, null, 1);
})()
```

**P2 — Baixar uma imagem do Instagram.** `navigate` com `{ "tabId": <tabId>, "url": "<URL do post>" }`; rode JS-3. Em post com várias fotos, use `find` com `{ "tabId": <tabId>, "query": "botão Avançar do carrossel de fotos" }` e clique com `computer` `{ "action": "left_click", "ref": "<ref>", "tabId": <tabId> }`, rodando JS-3 de novo a cada foto. Nunca dê duplo clique na foto (curte o post). Baixe na hora, porque a URL do CDN expira:

```bash
M="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src"
curl -sSL -A "Mozilla/5.0" -o "$M/raw/instagram/<pasta>/<id>.jpg" -w "%{http_code} %{content_type}\n" "<url de JS-3>"
node "$M/.tools/info.mjs" "$M/raw/instagram/<pasta>/<id>.jpg"
```

Esperado: `200 image/jpeg` (se vier `image/webp`, renomeie o arquivo para `.webp`) e o JSON de `info.mjs` com `formato`, `largura` e `altura`. Acrescente a entrada em `media-src/coleta.json` com os valores reais (esquema no "Mapa de arquivos"). Espere 2 s entre posts com `computer` `{ "action": "wait", "duration": 2, "tabId": <tabId> }`.

**P3 — Chamada paga no Higgsfield.**
1. Leia `- Gasto total:` do manifesto (G) e quanto a categoria já gastou (subteto na tabela "Orçamento de créditos").
2. `mcp__higgsfield__balance` com `{}` → saldo antes (A).
3. Faça a chamada da tarefa com `"get_cost": true` dentro de `params` → custo C. Exceção: `generate_image_batch` não aceita `get_cost`; nesse caso C = custo pré-checado com `generate_image` × número de itens do lote. Se G + C > 450 ou a categoria passar do subteto: envie só se o item for necessário para a qualidade da entrega (seguindo a ordem de prioridade) e se C ≤ saldo A, registrando `- CRÉDITOS: acima da meta — <item>: <motivo>` em "Avisos" das pendências; se o item não for necessário, não envie, escreva `- CRÉDITOS: <item> não gerado para economizar créditos` em "Avisos" e siga o caminho sem geração que a tarefa indica.
4. Repita a chamada sem `get_cost` → `job_id` (um por requisição). Em timeout de transporte, não reenvie: consulte `mcp__higgsfield__transactions` com `{ "size": 5 }` e `jobs_wait` antes de decidir.
5. `mcp__higgsfield__jobs_wait` com `{ "jobs": [{ "index": 0, "job_id": "<job_id>" }], "timeout_seconds": 15 }` (um item por job, até 12) até `all_terminal: true`, respeitando `poll_after_seconds`. Se recusar o id, use `mcp__higgsfield__job_display` com `{ "id": "<job_id>" }` para obter a URL do resultado.
6. `mcp__higgsfield__balance` → saldo depois (D). Acrescente **uma** linha por chamada na tabela de créditos (um lote = uma linha com todos os `job_id`), por exemplo `| 1 | 2026-10-06 10:00 | upscale_image | bytedance 2k | dra/hero | <job_id> | 2 | 900.25 | 898.25 | |`, e atualize `- Gasto total:` com a nova soma. Se A − D ≠ C, explique na coluna Obs.
7. Baixe cada resultado com `curl -sSL -o "<destino>" -w "%{http_code} %{content_type}\n" "<url do resultado>"`, usando a extensão que aparece na URL antes do `?`. Esperado: `200`.

**P4 — Enviar um arquivo local ao Higgsfield.** `mcp__higgsfield__media_upload` com `{ "filename": "<nome>.png", "content_type": "image/png" }` → `media_id` e `upload_url`. Envie os bytes:

```bash
curl -sS -X PUT -H "Content-Type: image/png" --data-binary "@C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/work/<nome>.png" "<upload_url>" -o /dev/null -w "%{http_code}\n"
```

Esperado: `200`. Depois `mcp__higgsfield__media_confirm` com `{ "media_id": "<media_id>", "type": "image" }`.

**P5 — Revisar um vídeo gerado.**

```bash
W="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/work"
V="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/higgsfield/video"
ffprobe -v error -show_entries stream=codec_type,width,height:format=duration -of compact=p=0 "$V/<arquivo>.mp4"
for s in 0 3 5.5; do ffmpeg -v error -y -ss $s -i "$V/<arquivo>.mp4" -frames:v 1 "$W/<arquivo>-${s}s.png"; done
```

Abra os 3 quadros com Read. Aprovado só se: nenhuma pessoa, mão, rosto, silhueta ou reflexo de gente; nenhum texto, letra, logo ou marca d'água; não parece consultório (sem maca, equipamento ou recepção); paleta rosé/champagne com luz quente; movimento lento, sem cortes, tremor ou objetos se deformando.

---

### Task 1: Worktree, estrutura de `media-src/` e documentos iniciais

**Files:**
- Create: worktree `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/.worktrees/midia` (branch `feat/midia`)
- Create: `media-src/.tools/package.json`, `media-src/.tools/lib/cli.mjs`
- Create (worktree): `docs/media-manifest.md`, `docs/media-pendencias.md`

**Interfaces:**
- Consumes: branch `main` (ou `origin/main`) cujo `.gitignore` contém `media-src/` e `.worktrees/`.
- Produces: worktree WT; pastas de `media-src/`; `lib/cli.mjs` exportando `REPO`, `WT`, `MEDIA_SRC` (strings), `opcoes(argv: string[]) → objeto`, `lerCaixa(txt) → { left, top, width, height }`, `lerProporcao(txt) → [a, b]`, `lerTamanho(txt) → { width, height }`, `ehPrincipal(import.meta.url) → boolean`; manifesto com a linha `- Gasto total: 0` e a tabela de créditos cujo cabeçalho é `| # | Data/hora | Ferramenta | Modelo/opção | Item | job_id | Créditos | Saldo antes | Saldo depois | Obs. |`; pendências com as seções `## Arquivos dispensados`, `## Avisos`, `## Dados encontrados para o checklist da clínica`, `## Pedidos à clínica`.

- [ ] **Step 1: Conferir a base**

```bash
REPO="C:/Users/botel/OneDrive/Desktop/clinicalauratavares"
git -C "$REPO" fetch origin
for BASE in main origin/main; do echo "== $BASE"; git -C "$REPO" show "$BASE:.gitignore" | grep -xE 'media-src/|\.worktrees/'; done
git -C "$REPO" worktree list
```

Esperado: pelo menos uma base imprime as duas linhas `media-src/` e `.worktrees/`. Use `main` se ela passar; senão, `origin/main`. Se nenhuma passar, pare e avise o orquestrador (não edite `.gitignore`: o arquivo é da frente de código). Se `worktree list` já mostrar `.worktrees/midia`, é retomada: pule o Step 2.

- [ ] **Step 2: Criar o worktree**

```bash
REPO="C:/Users/botel/OneDrive/Desktop/clinicalauratavares"
git -C "$REPO" worktree add .worktrees/midia -b feat/midia main
git -C "$REPO/.worktrees/midia" status --short --branch
```

Esperado: `## feat/midia` e nenhum arquivo modificado. Se a base do Step 1 foi `origin/main`, troque o último argumento do `worktree add` por `origin/main`.

- [ ] **Step 3: Pastas de `media-src/` e confirmação de que o git as ignora**

```bash
M="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src"
mkdir -p "$M/.tools/lib" "$M/.tools/test" "$M/raw/instagram/dra" "$M/raw/instagram/clinica" "$M/raw/instagram/resultados" "$M/raw/instagram/carrossel" "$M/higgsfield/upscale" "$M/higgsfield/imagens" "$M/higgsfield/video" "$M/compare" "$M/work" "$M/textos"
git -C "C:/Users/botel/OneDrive/Desktop/clinicalauratavares" check-ignore -v media-src/raw/teste.jpg .worktrees/midia
```

Esperado: duas linhas, uma citando a regra `media-src/` e outra a regra `.worktrees/`.

- [ ] **Step 4: `package.json` das ferramentas e instalação do sharp**

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/package.json`:

```json
{
  "name": "clinica-lt-midia-tools",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test test/*.test.mjs",
    "verify": "node verify-contract.mjs"
  },
  "dependencies": {
    "sharp": "0.35.5"
  }
}
```

```bash
cd "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools" && npm install && node -e "const s = require('sharp'); console.log('sharp', s.versions.sharp, 'vips', s.versions.vips)"
```

Esperado: `sharp 0.35.5 vips 8.x.x`. Se o `npm install` falhar com `EPERM`/`EBUSY`, pause a sincronização do OneDrive e repita.

- [ ] **Step 5: `lib/cli.mjs`**

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/lib/cli.mjs`:

```js
// media-src/.tools/lib/cli.mjs — caminhos fixos e leitura de argumentos de linha de comando.
import { pathToFileURL } from 'node:url';

export const REPO = 'C:/Users/botel/OneDrive/Desktop/clinicalauratavares';
export const WT = `${REPO}/.worktrees/midia`;
export const MEDIA_SRC = `${REPO}/media-src`;

export function opcoes(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith('--')) continue;
    const chave = argv[i].slice(2);
    const proximo = argv[i + 1];
    if (proximo === undefined || proximo.startsWith('--')) {
      o[chave] = true;
    } else {
      o[chave] = proximo;
      i += 1;
    }
  }
  return o;
}

export function lerCaixa(txt) {
  const partes = String(txt).split(',').map(Number);
  if (partes.length !== 4 || !partes.every(Number.isInteger)) throw new Error(`caixa inválida: "${txt}" (use x,y,largura,altura)`);
  const [left, top, width, height] = partes;
  return { left, top, width, height };
}

export function lerProporcao(txt) {
  const partes = String(txt).split(':').map(Number);
  if (partes.length !== 2 || !partes.every((n) => Number.isInteger(n) && n > 0)) throw new Error(`proporção inválida: "${txt}" (use 4:5)`);
  return partes;
}

export function lerTamanho(txt) {
  const partes = String(txt).split('x').map(Number);
  if (partes.length !== 2 || !partes.every((n) => Number.isInteger(n) && n > 0)) throw new Error(`tamanho inválido: "${txt}" (use 1280x1600)`);
  return { width: partes[0], height: partes[1] };
}

export function ehPrincipal(urlDoModulo) {
  return Boolean(process.argv[1]) && urlDoModulo.toLowerCase() === pathToFileURL(process.argv[1]).href.toLowerCase();
}
```

- [ ] **Step 6: Manifesto e pendências no worktree**

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/.worktrees/midia/docs/media-manifest.md`:

```markdown
# Manifesto de mídia — Clínica Laura Tavares

Origem, tratamento e custo de cada arquivo entregue pela frente de mídia (branch `feat/midia`). A mídia bruta e as ferramentas ficam em `media-src/`, fora do git.

Regras: nada gerado por IA mostra a Dra., pacientes ou equipe; antes/depois só recortados; imagem gerada é sempre ilustrativa e nunca é apresentada como a clínica real.

## Créditos do Higgsfield

- Teto: 450
- Saldo inicial: (preenchido na Task 1, Step 7)
- Gasto total: 0
- Saldo final: (preenchido na Task 12)

| # | Data/hora | Ferramenta | Modelo/opção | Item | job_id | Créditos | Saldo antes | Saldo depois | Obs. |
|---|---|---|---|---|---|---|---|---|---|

## Arquivos entregues

| Arquivo | Origem | Processamento | Gerado por IA? | Pode representar a clínica real? |
|---|---|---|---|---|

## Comparações de upscale e de quadros

| Foto | Imagem enviada | Caixas (x,y,w,h) | MAE | Pior bloco | Veredito visual | Decisão |
|---|---|---|---|---|---|---|

## Gerações (prompts e parâmetros)

## Depoimentos (fontes)

## Imprensa (evidências)
```

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/.worktrees/midia/docs/media-pendencias.md`:

```markdown
# Pendências da mídia — Clínica Laura Tavares

O que faltou na coleta e o que a clínica precisa enviar ou autorizar. O orquestrador leva estes itens para `docs/CHECKLIST-CLINICA.md`.

## Arquivos dispensados

Uma linha por item, no formato lido pelo verificador: hífen, espaço, o caminho do contrato entre crases, espaço, travessão, espaço, `AUSENTE:`, espaço e o motivo (10+ caracteres). Chaves aceitas: o caminho de cada foto, `src/assets/media/carrossel/` e `public/media/metodo.*`.

## Avisos

Uma linha por aviso, começando com `- DEPOIMENTOS: `, `- IMPRENSA: `, `- FOTO VIVA: ` ou `- CRÉDITOS: `.

## Dados encontrados para o checklist da clínica

## Pedidos à clínica
```

- [ ] **Step 7: Saldo inicial e preferência de projeto**

Carregue as ferramentas com ToolSearch `select:mcp__higgsfield__balance,mcp__higgsfield__get_preferences` e chame as duas sem parâmetros (`{}`).

Esperado: `credits` ≥ 450 (em 2026-10-05: 900.25) e `auto_create_project: false`. Troque a linha `- Saldo inicial: (preenchido na Task 1, Step 7)` por `- Saldo inicial: <credits> (AAAA-MM-DD HH:MM)` com o valor e a hora reais. Se `credits` < 450, pare e avise o orquestrador. Se `auto_create_project` vier `true`, pare e avise (o plano assume geração sem projeto).

- [ ] **Step 8: Verificação objetiva**

```bash
WT="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/.worktrees/midia"
grep -c "| Créditos | Saldo antes | Saldo depois |" "$WT/docs/media-manifest.md"
grep -E "^- (Teto|Saldo inicial|Gasto total):" "$WT/docs/media-manifest.md"
grep -cE "^## (Arquivos dispensados|Avisos|Dados encontrados para o checklist da clínica|Pedidos à clínica)$" "$WT/docs/media-pendencias.md"
```

Esperado: `1`; três linhas (`- Teto: 450`, `- Saldo inicial: <número> (<data hora>)`, `- Gasto total: 0`); `4`.

- [ ] **Step 9: Commit**

```bash
WT="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/.worktrees/midia"
git -C "$WT" add docs/media-manifest.md docs/media-pendencias.md
git -C "$WT" commit -m "docs(midia): manifesto e pendências da frente de mídia" --trailer "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" --trailer "Claude-Session: https://claude.ai/code/session_01LeX8QvmLLh9p9Zw7Zza2Nr"
git -C "$WT" log -1 --format=%B
```

Esperado: 1 commit com 2 arquivos; a mensagem termina com as duas linhas de trailer.

---

### Task 2: Verificador do contrato e da coleta (com testes)

**Files:**
- Create: `media-src/.tools/lib/regras.mjs`, `media-src/.tools/lib/contrato.mjs`, `media-src/.tools/check-coleta.mjs`, `media-src/.tools/verify-contract.mjs`
- Test: `media-src/.tools/test/regras.test.mjs`, `media-src/.tools/test/contrato.test.mjs`, `media-src/.tools/test/coleta.test.mjs`

**Interfaces:**
- Consumes: `lib/cli.mjs` (Task 1); `docs/media-manifest.md` e `docs/media-pendencias.md` (formatos da Task 1).
- Produces:
  - `lib/regras.mjs`: `estimarQualidadeJpeg(buf) → number|null`, `caixasDeTopo(buf) → string[]`, `temFaststart(buf) → boolean`, `contarPalavras(txt) → number`, `normalizarPalavras(txt) → string[]`, `ehRecorteDoOriginal(curto, original) → boolean`, `AUTOR_VALIDO` (RegExp), `IMPRENSA_ESPERADA` (array), `validarDepoimentos(lista) → string[]`, `validarImprensa(lista) → string[]`, `lerDispensas(md) → Map<caminho, motivo>`, `temAviso(md, rotulo) → boolean`, `lerCreditos(md) → { registros, total, gastoDeclarado, erro? }`, `caminhosCitados(md) → Set<string>`.
  - `lib/contrato.mjs`: `GRUPOS`, `PERMITIDOS`, `arquivosEntregues(raiz) → string[]`, `checarFoto(raiz, rel, regra)`, `checarGrupo(nome, raiz, { pendencias, dispensas }) → Promise<{ status, alvo, detalhe }[]>` com `status` em `OK | FALHA | FALTANDO | DISPENSADO | OPCIONAL | AVISO`.
  - `check-coleta.mjs`: `checarColeta({ coleta, base, pendencias, grupos }) → Promise<{ erros: string[], linhas: string[] }>`; CLI `--grupos dra,clinica,resultados,carrossel`; saída 0 = OK, 1 = falhou.
  - `verify-contract.mjs`: CLI `--only g1,g2` e `--root <raiz>`; grupos `dra, clinica, resultados, carrossel, tratamentos, apoio, metodo, cta-final, depoimentos, imprensa, manifesto, extras`; saída 0 = `RESULTADO: OK`, 1 = `RESULTADO: FALHOU`, 2 = grupo desconhecido.

- [ ] **Step 1: Escrever os testes das regras puras**

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/test/regras.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {
  estimarQualidadeJpeg, caixasDeTopo, temFaststart, contarPalavras, ehRecorteDoOriginal, AUTOR_VALIDO,
  validarDepoimentos, validarImprensa, IMPRENSA_ESPERADA, lerDispensas, temAviso, lerCreditos, caminhosCitados,
} from '../lib/regras.mjs';

const ruido = () => sharp({ create: { width: 64, height: 64, channels: 3, noise: { type: 'gaussian', mean: 128, sigma: 40 } } });

for (const q of [75, 85, 88, 90]) {
  test(`estima a qualidade JPEG ${q}`, async () => {
    assert.equal(estimarQualidadeJpeg(await ruido().jpeg({ quality: q, mozjpeg: false }).toBuffer()), q);
  });
}

test('qualidade de PNG é null', async () => {
  assert.equal(estimarQualidadeJpeg(await ruido().png().toBuffer()), null);
});

const caixa = (tipo, corpo) => {
  const b = Buffer.alloc(8 + corpo);
  b.writeUInt32BE(8 + corpo, 0);
  b.write(tipo, 4, 'latin1');
  return b;
};

test('faststart: moov antes de mdat', () => {
  const bom = Buffer.concat([caixa('ftyp', 8), caixa('moov', 16), caixa('mdat', 32)]);
  const ruim = Buffer.concat([caixa('ftyp', 8), caixa('mdat', 32), caixa('moov', 16)]);
  assert.deepEqual(caixasDeTopo(bom), ['ftyp', 'moov', 'mdat']);
  assert.equal(temFaststart(bom), true);
  assert.equal(temFaststart(ruim), false);
  assert.equal(temFaststart(Buffer.concat([caixa('ftyp', 8), caixa('mdat', 32)])), false);
});

test('conta palavras sem contar reticências e emojis', () => {
  assert.equal(contarPalavras('Amei o resultado … ficou natural 😍'), 5);
});

const ORIGINAL = 'Fui super bem atendida, a Dra. Laura é muito cuidadosa e o resultado ficou natural.';

test('texto do card só pode cortar palavras do original, na ordem', () => {
  assert.equal(ehRecorteDoOriginal('A Dra. Laura é muito cuidadosa… o resultado ficou natural.', ORIGINAL), true);
  assert.equal(ehRecorteDoOriginal('O resultado ficou incrível.', ORIGINAL), false);
  assert.equal(ehRecorteDoOriginal('Ficou natural o resultado.', ORIGINAL), false);
});

test('autor no formato "Primeiro I."', () => {
  for (const ok of ['Mariana S.', 'Ana-Luísa T.', 'Lívia Á.']) assert.equal(AUTOR_VALIDO.test(ok), true, ok);
  for (const ruim of ['Mariana Souza', 'M. S.', 'Ana Paula S.', 'mariana s.']) assert.equal(AUTOR_VALIDO.test(ruim), false, ruim);
});

const VALIDO = {
  texto: 'A Dra. Laura é muito cuidadosa… o resultado ficou natural.',
  textoOriginal: ORIGINAL,
  autor: 'Mariana S.',
  tratamento: null,
  fonte: 'google',
  url: 'https://www.google.com/maps/search/?api=1&query=Cl%C3%ADnica%20Laura%20Tavares%20Sudoeste',
  estrelas: 5,
};

test('depoimento válido passa', () => {
  assert.deepEqual(validarDepoimentos([VALIDO]), []);
});

test('depoimento com mais de 30 palavras falha', () => {
  const longo = Array.from({ length: 31 }, (_, i) => `palavra${i}`).join(' ');
  assert.ok(validarDepoimentos([{ ...VALIDO, texto: longo, textoOriginal: longo }]).some((e) => e.includes('31 palavras')));
});

test('depoimento com emoji ou quebra de linha no texto falha', () => {
  const comEmoji = { ...VALIDO, textoOriginal: `${ORIGINAL} 😍`, texto: 'O resultado ficou natural 😍' };
  assert.ok(validarDepoimentos([comEmoji]).some((e) => e.includes('emoji')));
  const comQuebra = { ...VALIDO, texto: 'A Dra. Laura é muito cuidadosa.\nO resultado ficou natural.' };
  assert.ok(validarDepoimentos([comQuebra]).some((e) => e.includes('quebra de linha')));
});

test('estrelas coerentes com a fonte', () => {
  assert.ok(validarDepoimentos([{ ...VALIDO, estrelas: null }]).some((e) => e.includes('sem estrelas')));
  assert.ok(validarDepoimentos([{ ...VALIDO, fonte: 'instagram' }]).some((e) => e.includes('não tem estrelas')));
});

test('chave extra e autor fora do formato falham', () => {
  assert.ok(validarDepoimentos([{ ...VALIDO, idade: 47 }]).some((e) => e.includes('chaves')));
  assert.ok(validarDepoimentos([{ ...VALIDO, autor: 'Mariana Souza' }]).some((e) => e.includes('autor')));
});

test('depoimento repetido falha', () => {
  assert.ok(validarDepoimentos([VALIDO, { ...VALIDO }]).some((e) => e.includes('repetidos')));
});

test('imprensa: os 4 itens do texto, na ordem', () => {
  const ok = IMPRENSA_ESPERADA.map((i) => ({ ...i, url: null }));
  assert.deepEqual(validarImprensa(ok), []);
  assert.ok(validarImprensa([...ok].reverse()).length > 0);
  assert.ok(validarImprensa(ok.slice(0, 3)).length > 0);
  assert.ok(validarImprensa([{ ...ok[0], url: 'ftp://x' }, ...ok.slice(1)]).some((e) => e.includes('url')));
});

test('dispensa só vale no formato certo e com motivo de 10+ caracteres', () => {
  const md = [
    '- `src/assets/media/clinica/sala.jpg` — AUSENTE: nenhuma foto da sala sem pacientes',
    '- `src/assets/media/clinica/equipe.jpg` — AUSENTE: curto',
    '- DEPOIMENTOS: só 2 avaliações reais com nome e sobrenome visíveis',
  ].join('\n');
  const d = lerDispensas(md);
  assert.equal(d.has('src/assets/media/clinica/sala.jpg'), true);
  assert.equal(d.has('src/assets/media/clinica/equipe.jpg'), false);
  assert.equal(temAviso(md, 'DEPOIMENTOS'), true);
  assert.equal(temAviso(md, 'IMPRENSA'), false);
});

test('créditos: soma da tabela e gasto declarado', () => {
  const md = [
    '- Gasto total: 20',
    '',
    '| # | Data/hora | Ferramenta | Modelo/opção | Item | job_id | Créditos | Saldo antes | Saldo depois | Obs. |',
    '|---|---|---|---|---|---|---|---|---|---|',
    '| 1 | 2026-10-06 10:00 | upscale_image | bytedance 2k | dra/hero | abc | 2 | 900.25 | 898.25 | |',
    '| 2 | 2026-10-06 10:30 | generate_video | seedance_2_5 rascunho | metodo | def | 18 | 898.25 | 880.25 | |',
    '',
  ].join('\n');
  const c = lerCreditos(md);
  assert.equal(c.registros.length, 2);
  assert.equal(c.total, 20);
  assert.equal(c.gastoDeclarado, 20);
});

test('caminhos citados em crase', () => {
  assert.deepEqual(
    [...caminhosCitados('Ver `src/assets/media/dra/hero.jpg` e `public/media/metodo.mp4`.')],
    ['src/assets/media/dra/hero.jpg', 'public/media/metodo.mp4'],
  );
});
```

- [ ] **Step 2: Rodar e ver falhar**

```bash
cd "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools" && node --test test/regras.test.mjs
```

Esperado: `ERR_MODULE_NOT_FOUND` para `lib/regras.mjs` e o resumo com `fail 1`.

- [ ] **Step 3: Implementar `lib/regras.mjs`**

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/lib/regras.mjs`:

```js
// media-src/.tools/lib/regras.mjs — funções puras do verificador (sem acesso a disco).

// ---------- JPEG: qualidade estimada (escala IJG 1–100) pela tabela de luminância ----------
const ZIGZAG = [
  0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5,
  12, 19, 26, 33, 40, 48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28,
  35, 42, 49, 56, 57, 50, 43, 36, 29, 22, 15, 23, 30, 37, 44, 51,
  58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54, 47, 55, 62, 63,
];
const LUMINANCIA_ANEXO_K = [
  16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55,
  14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62,
  18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92,
  49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99,
];

function tabelaLuminancia(buf) {
  let i = 2;
  while (i + 3 < buf.length) {
    if (buf[i] !== 0xff) return null;
    const marcador = buf[i + 1];
    if (marcador === 0xff) {
      i += 1;
      continue;
    }
    if (marcador === 0xda || marcador === 0xd9) return null;
    const tamanho = buf.readUInt16BE(i + 2);
    if (marcador === 0xdb) {
      let p = i + 4;
      const fim = i + 2 + tamanho;
      while (p < fim) {
        const precisao = buf[p] >> 4;
        const id = buf[p] & 0x0f;
        p += 1;
        if (id === 0) {
          const natural = new Array(64);
          for (let k = 0; k < 64; k += 1) natural[ZIGZAG[k]] = precisao ? buf.readUInt16BE(p + 2 * k) : buf[p + k];
          return natural;
        }
        p += precisao ? 128 : 64;
      }
    }
    i += 2 + tamanho;
  }
  return null;
}

export function estimarQualidadeJpeg(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  const tabela = tabelaLuminancia(buf);
  if (!tabela) return null;
  let melhor = null;
  let menorErro = Infinity;
  for (let q = 1; q <= 100; q += 1) {
    const escala = q < 50 ? Math.floor(5000 / q) : 200 - 2 * q;
    let erro = 0;
    for (let k = 0; k < 64; k += 1) {
      const v = Math.min(Math.max(Math.floor((LUMINANCIA_ANEXO_K[k] * escala + 50) / 100), 1), 255);
      erro += Math.abs(v - tabela[k]);
    }
    if (erro < menorErro) {
      menorErro = erro;
      melhor = q;
    }
  }
  return melhor;
}

// ---------- MP4: ordem das caixas de topo (faststart = moov antes de mdat) ----------
export function caixasDeTopo(buf) {
  const tipos = [];
  let i = 0;
  while (i + 8 <= buf.length) {
    let tamanho = buf.readUInt32BE(i);
    const tipo = buf.toString('latin1', i + 4, i + 8);
    if (tamanho === 1) {
      if (i + 16 > buf.length) break;
      tamanho = Number(buf.readBigUInt64BE(i + 8));
    } else if (tamanho === 0) {
      tamanho = buf.length - i;
    }
    if (tamanho < 8) break;
    tipos.push(tipo);
    i += tamanho;
  }
  return tipos;
}

export function temFaststart(buf) {
  const tipos = caixasDeTopo(buf);
  const moov = tipos.indexOf('moov');
  const mdat = tipos.indexOf('mdat');
  return moov !== -1 && mdat !== -1 && moov < mdat;
}

// ---------- Texto dos depoimentos ----------
const TEM_LETRA_OU_NUMERO = /[\p{L}\p{N}]/u;
const EMOJI = /\p{Extended_Pictographic}/u;

export function contarPalavras(texto) {
  return texto.trim().split(/\s+/).filter((t) => TEM_LETRA_OU_NUMERO.test(t)).length;
}

export function normalizarPalavras(texto) {
  return texto
    .toLocaleLowerCase('pt-BR')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function ehRecorteDoOriginal(curto, original) {
  const a = normalizarPalavras(curto);
  const b = normalizarPalavras(original);
  let j = 0;
  for (const palavra of a) {
    while (j < b.length && b[j] !== palavra) j += 1;
    if (j === b.length) return false;
    j += 1;
  }
  return a.length > 0;
}

export const AUTOR_VALIDO = /^\p{Lu}\p{Ll}+(?:-\p{Lu}\p{Ll}+)? \p{Lu}\.$/u;

// ---------- Conteúdo: depoimentos e imprensa ----------
export const IMPRENSA_ESPERADA = [
  { veiculo: 'Revista Orla BSB', titulo: 'Laura Tavares celebra 8 anos e consolida clínica de estética no Sudoeste' },
  { veiculo: 'Diário de Brasília', titulo: 'Prêmio de Melhor Atendimento no Santa Permuta 2026' },
  { veiculo: 'W3 Notícias', titulo: 'Korean Beauty Day traz a Brasília as tendências da beleza coreana' },
  { veiculo: 'Diário de Brasília', titulo: 'Coautora do livro "Sua Voz Vale Ouro"' },
];

const CHAVES_DEPOIMENTO = 'autor,estrelas,fonte,texto,textoOriginal,tratamento,url';

export function validarDepoimentos(lista) {
  if (!Array.isArray(lista)) return ['depoimentos.json precisa ser um array'];
  const erros = [];
  lista.forEach((d, i) => {
    const p = `depoimento[${i}]`;
    if (d === null || typeof d !== 'object' || Array.isArray(d)) {
      erros.push(`${p}: não é objeto`);
      return;
    }
    const chaves = Object.keys(d).sort().join(',');
    if (chaves !== CHAVES_DEPOIMENTO) erros.push(`${p}: chaves ${chaves} (esperado ${CHAVES_DEPOIMENTO})`);
    const textoOk = typeof d.texto === 'string' && d.texto.trim() !== '';
    const originalOk = typeof d.textoOriginal === 'string' && d.textoOriginal.trim() !== '';
    if (!textoOk) erros.push(`${p}: texto vazio`);
    if (!originalOk) erros.push(`${p}: textoOriginal vazio`);
    if (textoOk) {
      const n = contarPalavras(d.texto);
      if (n > 30) erros.push(`${p}: texto com ${n} palavras (máx. 30)`);
      if (/[\r\n]/.test(d.texto)) erros.push(`${p}: texto com quebra de linha`);
      if (EMOJI.test(d.texto)) erros.push(`${p}: texto com emoji`);
    }
    if (textoOk && originalOk && !ehRecorteDoOriginal(d.texto, d.textoOriginal)) {
      erros.push(`${p}: texto tem palavra que não está no textoOriginal (ou fora de ordem)`);
    }
    if (typeof d.autor !== 'string' || !AUTOR_VALIDO.test(d.autor)) erros.push(`${p}: autor "${d.autor}" fora do formato "Primeiro I."`);
    if (!(d.tratamento === null || (typeof d.tratamento === 'string' && d.tratamento.trim() !== ''))) erros.push(`${p}: tratamento deve ser texto ou null`);
    if (d.fonte !== 'google' && d.fonte !== 'instagram') erros.push(`${p}: fonte "${d.fonte}" inválida`);
    if (!(d.url === null || (typeof d.url === 'string' && d.url.startsWith('https://')))) erros.push(`${p}: url deve começar com https:// ou ser null`);
    if (!(d.estrelas === null || (Number.isInteger(d.estrelas) && d.estrelas >= 1 && d.estrelas <= 5))) erros.push(`${p}: estrelas deve ser inteiro de 1 a 5 ou null`);
    if (d.fonte === 'google' && d.estrelas === null) erros.push(`${p}: avaliação do Google sem estrelas`);
    if (d.fonte === 'instagram' && d.estrelas !== null) erros.push(`${p}: depoimento do Instagram não tem estrelas (use null)`);
  });
  const originais = lista.filter((d) => d && typeof d.textoOriginal === 'string').map((d) => d.textoOriginal.trim());
  if (new Set(originais).size !== originais.length) erros.push('depoimentos repetidos (mesmo textoOriginal)');
  return erros;
}

export function validarImprensa(lista) {
  if (!Array.isArray(lista)) return ['imprensa.json precisa ser um array'];
  const erros = [];
  if (lista.length !== IMPRENSA_ESPERADA.length) erros.push(`imprensa com ${lista.length} itens (esperado ${IMPRENSA_ESPERADA.length})`);
  IMPRENSA_ESPERADA.forEach((esperado, i) => {
    const item = lista[i];
    const p = `imprensa[${i}]`;
    if (!item || typeof item !== 'object') {
      erros.push(`${p}: ausente`);
      return;
    }
    const chaves = Object.keys(item).sort().join(',');
    if (chaves !== 'titulo,url,veiculo') erros.push(`${p}: chaves ${chaves} (esperado titulo,url,veiculo)`);
    if (item.veiculo !== esperado.veiculo) erros.push(`${p}: veiculo "${item.veiculo}" (esperado "${esperado.veiculo}")`);
    if (item.titulo !== esperado.titulo) erros.push(`${p}: titulo "${item.titulo}" (esperado "${esperado.titulo}")`);
    if (!(item.url === null || (typeof item.url === 'string' && /^https?:\/\/\S+$/.test(item.url)))) erros.push(`${p}: url deve ser http(s) ou null`);
  });
  return erros;
}

// ---------- docs/media-pendencias.md ----------
export function lerDispensas(md) {
  const dispensas = new Map();
  for (const m of md.matchAll(/^- `([^`]+)` [—-] AUSENTE: (.{10,})$/gmu)) dispensas.set(m[1], m[2].trim());
  return dispensas;
}

export function temAviso(md, rotulo) {
  const prefixo = `- ${rotulo}: `;
  return md.split(/\r?\n/).some((l) => l.startsWith(prefixo) && l.slice(prefixo.length).trim().length >= 10);
}

// ---------- docs/media-manifest.md ----------
const numero = (txt) => {
  const limpo = String(txt ?? '').replace(',', '.').trim();
  return limpo === '' ? NaN : Number(limpo);
};

export function lerCreditos(md) {
  const linhas = md.split(/\r?\n/);
  const inicio = linhas.findIndex((l) => /\|\s*Créditos\s*\|\s*Saldo antes\s*\|\s*Saldo depois\s*\|/u.test(l));
  if (inicio === -1) return { erro: 'tabela de créditos não encontrada', registros: [], total: 0, gastoDeclarado: NaN };
  const cabecalho = linhas[inicio].split('|').map((c) => c.trim());
  const [iCred, iAntes, iDepois] = ['Créditos', 'Saldo antes', 'Saldo depois'].map((n) => cabecalho.indexOf(n));
  const registros = [];
  for (let k = inicio + 2; k < linhas.length && linhas[k].trim().startsWith('|'); k += 1) {
    const cel = linhas[k].split('|').map((c) => c.trim());
    registros.push({ linha: k + 1, creditos: numero(cel[iCred]), antes: numero(cel[iAntes]), depois: numero(cel[iDepois]) });
  }
  const total = Math.round(registros.reduce((s, r) => s + (Number.isFinite(r.creditos) ? r.creditos : 0), 0) * 100) / 100;
  const declarado = md.match(/^- Gasto total: ([\d.,]+)/mu);
  return { registros, total, gastoDeclarado: declarado ? numero(declarado[1]) : NaN };
}

export function caminhosCitados(md) {
  return new Set([...md.matchAll(/`((?:src|public)\/[^`\s]+)`/g)].map((m) => m[1]));
}
```

- [ ] **Step 4: Rodar e ver passar**

```bash
cd "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools" && node --test test/regras.test.mjs
```

Esperado: 19 testes, resumo com `pass 19` e `fail 0`.

- [ ] **Step 5: Escrever os testes do contrato e da coleta**

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/test/contrato.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { checarGrupo } from '../lib/contrato.mjs';
import { lerDispensas } from '../lib/regras.mjs';

const novaRaiz = () => fs.mkdtempSync(path.join(os.tmpdir(), 'midia-contrato-'));

async function jpeg(raiz, rel, largura, altura, { qualidade = 88, exif = false } = {}) {
  const abs = path.join(raiz, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  let img = sharp({ create: { width: largura, height: altura, channels: 3, background: '#E4B9B0' } }).jpeg({ quality: qualidade, mozjpeg: false });
  if (exif) img = img.withExif({ IFD0: { Copyright: 'teste' } });
  await img.toFile(abs);
}

const status = (linhas) => linhas.map((l) => l.status);
const contexto = (md) => ({ pendencias: md, dispensas: lerDispensas(md) });

test('dra: foto válida passa; qualidade 75 e EXIF falham', async () => {
  const raiz = novaRaiz();
  await jpeg(raiz, 'src/assets/media/dra/hero.jpg', 1280, 1600);
  await jpeg(raiz, 'src/assets/media/dra/sobre.jpg', 1200, 1500, { qualidade: 75, exif: true });
  const linhas = await checarGrupo('dra', raiz);
  assert.deepEqual(status(linhas), ['OK', 'FALHA']);
  assert.match(linhas[1].detalhe, /qualidade estimada 75/);
  assert.match(linhas[1].detalhe, /tem EXIF/);
});

test('dra: ausente é FALTANDO; com dispensa vira DISPENSADO', async () => {
  const raiz = novaRaiz();
  assert.deepEqual(status(await checarGrupo('dra', raiz)), ['FALTANDO', 'FALTANDO']);
  const md = '- `src/assets/media/dra/sobre.jpg` — AUSENTE: nenhum retrato além do usado no hero\n';
  assert.deepEqual(status(await checarGrupo('dra', raiz, contexto(md))), ['FALTANDO', 'DISPENSADO']);
});

test('resultados: par com tamanhos diferentes falha', async () => {
  const raiz = novaRaiz();
  await jpeg(raiz, 'src/assets/media/resultados/labios-antes.jpg', 540, 675);
  await jpeg(raiz, 'src/assets/media/resultados/labios-depois.jpg', 536, 670);
  const linhas = await checarGrupo('resultados', raiz);
  assert.ok(linhas.some((l) => l.status === 'FALHA' && l.detalhe.includes('tamanhos diferentes')));
});

test('carrossel: buraco na numeração falha', async () => {
  const raiz = novaRaiz();
  for (const n of ['01', '02', '03', '04', '05', '07']) await jpeg(raiz, `src/assets/media/carrossel/resultado-${n}.jpg`, 600, 800);
  const linhas = await checarGrupo('carrossel', raiz);
  assert.ok(linhas.some((l) => l.status === 'FALHA' && l.detalhe.includes('numeração')));
});

test('carrossel: arquivo fora do padrão falha', async () => {
  const raiz = novaRaiz();
  for (const n of ['01', '02', '03', '04', '05', '06']) await jpeg(raiz, `src/assets/media/carrossel/resultado-${n}.jpg`, 600, 800);
  fs.writeFileSync(path.join(raiz, 'src/assets/media/carrossel/resultado-7.jpg'), 'x');
  const linhas = await checarGrupo('carrossel', raiz);
  assert.ok(linhas.some((l) => l.status === 'FALHA' && l.detalhe.includes('resultado-7.jpg')));
});

test('apoio: nome com maiúscula ou acento falha', async () => {
  const raiz = novaRaiz();
  await jpeg(raiz, 'src/assets/media/apoio/Pétalas Rosa.jpg', 2048, 1152);
  const linhas = await checarGrupo('apoio', raiz);
  assert.ok(linhas.some((l) => l.status === 'FALHA' && l.detalhe.includes('fora do padrão')));
});

test('json: BOM no início falha', async () => {
  const raiz = novaRaiz();
  fs.mkdirSync(path.join(raiz, 'src/content'), { recursive: true });
  fs.writeFileSync(path.join(raiz, 'src/content/imprensa.json'), '\uFEFF[]', 'utf8');
  const [linha] = await checarGrupo('imprensa', raiz);
  assert.equal(linha.status, 'FALHA');
  assert.match(linha.detalhe, /JSON inválido/);
});

test('depoimentos: menos de 3 exige aviso nas pendências', async () => {
  const raiz = novaRaiz();
  fs.mkdirSync(path.join(raiz, 'src/content'), { recursive: true });
  const um = [{ texto: 'Amei o resultado.', textoOriginal: 'Amei o resultado.', autor: 'Mariana S.', tratamento: null, fonte: 'google', url: null, estrelas: 5 }];
  fs.writeFileSync(path.join(raiz, 'src/content/depoimentos.json'), JSON.stringify(um));
  assert.equal((await checarGrupo('depoimentos', raiz))[0].status, 'FALHA');
  const md = '- DEPOIMENTOS: só 1 avaliação real com nome e sobrenome visíveis\n';
  assert.equal((await checarGrupo('depoimentos', raiz, contexto(md)))[0].status, 'OK');
});

test('vídeo: opcional ausente é OPCIONAL; obrigatório ausente é FALTANDO ou DISPENSADO', async () => {
  const raiz = novaRaiz();
  assert.equal((await checarGrupo('cta-final', raiz))[0].status, 'OPCIONAL');
  assert.equal((await checarGrupo('metodo', raiz))[0].status, 'FALTANDO');
  const md = '- `public/media/metodo.*` — AUSENTE: três rascunhos com deformação\n';
  assert.equal((await checarGrupo('metodo', raiz, contexto(md)))[0].status, 'DISPENSADO');
});

test('manifesto: gasto acima de 450 vira aviso e arquivo não citado falha', async () => {
  const raiz = novaRaiz();
  await jpeg(raiz, 'src/assets/media/dra/hero.jpg', 1280, 1600);
  fs.mkdirSync(path.join(raiz, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(raiz, 'docs/media-pendencias.md'), '# Pendências\n');
  fs.writeFileSync(path.join(raiz, 'docs/media-manifest.md'), [
    '- Gasto total: 460',
    '',
    '| # | Data/hora | Ferramenta | Modelo/opção | Item | job_id | Créditos | Saldo antes | Saldo depois | Obs. |',
    '|---|---|---|---|---|---|---|---|---|---|',
    '| 1 | 2026-10-06 10:00 | generate_video | seedance_2_5 | metodo | x | 460 | 900 | 440 | |',
    '',
  ].join('\n'));
  const linhas = await checarGrupo('manifesto', raiz);
  const aviso = linhas.find((l) => l.status === 'AVISO' && /meta de 450/.test(l.detalhe));
  assert.ok(aviso, 'gasto acima de 450 deve gerar AVISO, não FALHA');
  const falha = linhas.find((l) => l.status === 'FALHA');
  assert.doesNotMatch(falha.detalhe, /450/);
  assert.match(falha.detalhe, /src\/assets\/media\/dra\/hero\.jpg não está no manifesto/);
});

test('extras: arquivo fora do contrato falha; lixo do sistema é ignorado', async () => {
  const raiz = novaRaiz();
  await jpeg(raiz, 'src/assets/media/dra/hero-antigo.jpg', 100, 125);
  fs.writeFileSync(path.join(raiz, 'src/assets/media/dra/Thumbs.db'), 'x');
  assert.deepEqual(status(await checarGrupo('extras', raiz)), ['FALHA']);
});
```

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/test/coleta.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { checarColeta } from '../check-coleta.mjs';

const entrada = (extra = {}) => ({
  id: 'dra-01',
  categoria: 'dra',
  queixa: null,
  perfil: 'dra.lauratavares',
  post: 'https://www.instagram.com/p/ABC123/',
  cdn: 'https://scontent.cdninstagram.com/v/x.jpg',
  arquivo: 'raw/instagram/dra/dra-01.jpg',
  largura: 1080,
  altura: 1350,
  pessoas: 'só a Dra.',
  nota: 'teste',
  ...extra,
});

function base() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'midia-coleta-'));
  fs.mkdirSync(path.join(dir, 'raw/instagram/dra'), { recursive: true });
  return dir;
}

const imagem = (dir, largura, altura) => sharp({ create: { width: largura, height: altura, channels: 3, background: '#F1DCD6' } })
  .jpeg()
  .toFile(path.join(dir, 'raw/instagram/dra/dra-01.jpg'));

test('página de erro salva como .jpg vira "não é imagem"', async () => {
  const dir = base();
  fs.writeFileSync(path.join(dir, 'raw/instagram/dra/dra-01.jpg'), '<html>URL signature expired</html>');
  const { erros } = await checarColeta({ coleta: [entrada()], base: dir, grupos: ['dra'] });
  assert.ok(erros.some((e) => e.includes('não é imagem')), erros.join('\n'));
});

test('dimensões registradas precisam bater com o arquivo', async () => {
  const dir = base();
  await imagem(dir, 1080, 1080);
  const { erros } = await checarColeta({ coleta: [entrada()], base: dir, grupos: ['dra'] });
  assert.ok(erros.some((e) => e.includes('1080x1080')));
});

test('resultado exige queixa válida e post do Instagram', async () => {
  const dir = base();
  await imagem(dir, 1080, 1350);
  const coleta = [entrada({ categoria: 'resultado', queixa: 'nariz', post: 'https://example.com/x' })];
  const { erros } = await checarColeta({ coleta, base: dir, grupos: ['resultados'] });
  assert.ok(erros.some((e) => e.includes('queixa')));
  assert.ok(erros.some((e) => e.includes('não é URL de post')));
});

test('cobertura dispensada nas pendências conta como coberta', async () => {
  const pendencias = '- `src/assets/media/carrossel/` — AUSENTE: só 3 antes/depois publicados no Instagram\n';
  const { erros, linhas } = await checarColeta({ coleta: [], base: base(), pendencias, grupos: ['carrossel'] });
  assert.deepEqual(erros, []);
  assert.ok(linhas[0].startsWith('DISPENSADO'));
});

test('cobertura insuficiente sem dispensa falha', async () => {
  const { erros } = await checarColeta({ coleta: [], base: base(), grupos: ['clinica'] });
  assert.equal(erros.filter((e) => e.startsWith('cobertura insuficiente')).length, 4);
});

test('grupo desconhecido falha sem travar', async () => {
  const { erros } = await checarColeta({ coleta: [], base: base(), grupos: ['clinca'] });
  assert.ok(erros.some((e) => e.includes('grupo desconhecido')));
});
```

- [ ] **Step 6: Rodar e ver falhar**

```bash
cd "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools" && node --test test/contrato.test.mjs test/coleta.test.mjs
```

Esperado: `ERR_MODULE_NOT_FOUND` para `lib/contrato.mjs` e para `check-coleta.mjs`; resumo com `fail 2`.

- [ ] **Step 7: Implementar `lib/contrato.mjs`**

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/lib/contrato.mjs`:

```js
// media-src/.tools/lib/contrato.mjs — o contrato com a frente de código (dados) e a checagem de cada grupo.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import {
  estimarQualidadeJpeg, temFaststart, validarDepoimentos, validarImprensa, temAviso, lerCreditos, caminhosCitados,
} from './regras.mjs';

const IGNORADOS = new Set(['Thumbs.db', 'desktop.ini', '.DS_Store']);
const fotos = (pasta, nomes, regra) => nomes.map((nome) => ({ arquivo: `${pasta}/${nome}.jpg`, ...regra }));

export const GRUPOS = {
  dra: {
    tipo: 'fotos',
    itens: [
      { arquivo: 'src/assets/media/dra/hero.jpg', proporcao: [4, 5], minLargura: 1280, minAltura: 1600 },
      { arquivo: 'src/assets/media/dra/sobre.jpg', proporcao: [4, 5], minLargura: 1200, minAltura: 1500 },
    ],
  },
  clinica: { tipo: 'fotos', itens: fotos('src/assets/media/clinica', ['recepcao', 'sala', 'equipe', 'detalhes'], { minLadoMaior: 1600 }) },
  resultados: {
    tipo: 'pares',
    pares: ['olhar', 'mandibula', 'labios', 'bigode'].map((q) => ({
      antes: `src/assets/media/resultados/${q}-antes.jpg`,
      depois: `src/assets/media/resultados/${q}-depois.jpg`,
      proporcao: [4, 5],
      minLargura: 400,
    })),
  },
  carrossel: {
    tipo: 'serie',
    pasta: 'src/assets/media/carrossel',
    padrao: /^resultado-(\d{2})\.jpg$/,
    numerada: true,
    min: 6,
    max: 12,
    regra: { proporcao: [3, 4], minLargura: 600 },
  },
  tratamentos: {
    tipo: 'fotos',
    itens: fotos('src/assets/media/tratamentos', ['harmonizacao', 'rejuvenescimento', 'kbeauty', 'corporal'], { proporcao: [4, 5], minLargura: 1000 }),
  },
  apoio: {
    tipo: 'serie',
    pasta: 'src/assets/media/apoio',
    padrao: /^[a-z0-9]+(?:-[a-z0-9]+)*\.jpg$/,
    numerada: false,
    min: 1,
    max: 12,
    regra: { minLadoMaior: 1600 },
  },
  metodo: { tipo: 'video', base: 'public/media/metodo', obrigatorio: true },
  'cta-final': { tipo: 'video', base: 'public/media/cta-final', obrigatorio: false },
  depoimentos: { tipo: 'json', arquivo: 'src/content/depoimentos.json' },
  imprensa: { tipo: 'json', arquivo: 'src/content/imprensa.json' },
  manifesto: { tipo: 'manifesto', arquivo: 'docs/media-manifest.md' },
  extras: { tipo: 'extras' },
};

export const PERMITIDOS = [
  /^src\/assets\/media\/dra\/(hero|sobre)\.jpg$/,
  /^src\/assets\/media\/clinica\/(recepcao|sala|equipe|detalhes)\.jpg$/,
  /^src\/assets\/media\/resultados\/(olhar|mandibula|labios|bigode)-(antes|depois)\.jpg$/,
  /^src\/assets\/media\/carrossel\/resultado-\d{2}\.jpg$/,
  /^src\/assets\/media\/tratamentos\/(harmonizacao|rejuvenescimento|kbeauty|corporal)\.jpg$/,
  /^src\/assets\/media\/apoio\/[a-z0-9]+(?:-[a-z0-9]+)*\.jpg$/,
  /^public\/media\/(metodo|cta-final)(\.mp4|\.webm|-poster\.jpg)$/,
];

export function arquivosEntregues(raiz) {
  const saida = [];
  const andar = (rel) => {
    const abs = path.join(raiz, rel);
    if (!fs.existsSync(abs)) return;
    for (const nome of fs.readdirSync(abs)) {
      if (IGNORADOS.has(nome)) continue;
      const filho = `${rel}/${nome}`;
      if (fs.statSync(path.join(raiz, filho)).isDirectory()) andar(filho);
      else saida.push(filho);
    }
  };
  andar('src/assets/media');
  andar('public/media');
  return saida.sort();
}

export async function checarFoto(raiz, rel, regra) {
  const abs = path.join(raiz, rel);
  if (!fs.existsSync(abs)) return { existe: false, erros: [] };
  const buf = fs.readFileSync(abs);
  let meta;
  try {
    meta = await sharp(buf).metadata();
  } catch {
    return { existe: true, erros: ['não é imagem'] };
  }
  const erros = [];
  const { width: w, height: h } = meta;
  if (meta.format !== 'jpeg') erros.push(`formato ${meta.format}`);
  if (meta.space !== 'srgb') erros.push(`espaço de cor ${meta.space}`);
  if (meta.channels !== 3) erros.push(`${meta.channels} canais`);
  if (meta.exif) erros.push('tem EXIF');
  if (regra.qualidade !== false) {
    const q = estimarQualidadeJpeg(buf);
    if (q === null || q < 85 || q > 90) erros.push(`qualidade estimada ${q} (esperado 85–90)`);
  }
  if (regra.proporcao) {
    const alvo = regra.proporcao[0] / regra.proporcao[1];
    if (Math.abs(w / h - alvo) / alvo > 0.01) erros.push(`proporção ${w}x${h} (esperado ${regra.proporcao.join(':')})`);
  }
  if (regra.minLargura && w < regra.minLargura) erros.push(`largura ${w} < ${regra.minLargura}`);
  if (regra.minAltura && h < regra.minAltura) erros.push(`altura ${h} < ${regra.minAltura}`);
  if (regra.minLadoMaior && Math.max(w, h) < regra.minLadoMaior) erros.push(`lado maior ${Math.max(w, h)} < ${regra.minLadoMaior}`);
  if (regra.maxBytes && buf.length > regra.maxBytes) erros.push(`${buf.length} bytes > ${regra.maxBytes}`);
  return { existe: true, erros, w, h };
}

function checarVideo(raiz, rel, codec) {
  const abs = path.join(raiz, rel);
  if (!fs.existsSync(abs)) return { status: 'FALTANDO', alvo: rel, detalhe: '' };
  let info;
  try {
    info = JSON.parse(execFileSync('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration:stream=codec_type,codec_name,width,height', '-of', 'json', abs,
    ], { encoding: 'utf8' }));
  } catch {
    return { status: 'FALHA', alvo: rel, detalhe: 'ffprobe não conseguiu ler o arquivo' };
  }
  const erros = [];
  const bytes = fs.statSync(abs).size;
  if (bytes > 2_000_000) erros.push(`${bytes} bytes > 2.000.000`);
  const videos = info.streams.filter((s) => s.codec_type === 'video');
  if (videos.length !== 1) erros.push(`${videos.length} faixas de vídeo`);
  if (info.streams.some((s) => s.codec_type === 'audio')) erros.push('tem áudio');
  const v = videos[0];
  if (v && v.codec_name !== codec) erros.push(`codec ${v.codec_name} (esperado ${codec})`);
  if (v && Math.abs(v.width / v.height - 16 / 9) / (16 / 9) > 0.01) erros.push(`proporção ${v.width}x${v.height} (esperado 16:9)`);
  const dur = Number(info.format.duration);
  if (!(dur >= 4.95 && dur <= 8.05)) erros.push(`duração ${dur} s (esperado 5–8)`);
  if (rel.endsWith('.mp4') && !temFaststart(fs.readFileSync(abs))) erros.push('sem +faststart (moov depois de mdat)');
  if (erros.length) return { status: 'FALHA', alvo: rel, detalhe: erros.join('; ') };
  return { status: 'OK', alvo: rel, detalhe: `${v.width}x${v.height}, ${dur.toFixed(2)} s, ${bytes} bytes` };
}

function lerTexto(raiz, rel) {
  const abs = path.join(raiz, rel);
  return fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
}

export async function checarGrupo(nome, raiz, { pendencias = '', dispensas = new Map() } = {}) {
  const g = GRUPOS[nome];
  if (!g) throw new Error(`grupo desconhecido: ${nome}`);
  const linhas = [];
  const add = (status, alvo, detalhe = '') => linhas.push({ status, alvo, detalhe });
  const foto = async (rel, regra) => {
    const r = await checarFoto(raiz, rel, regra);
    if (!r.existe) {
      if (dispensas.has(rel)) add('DISPENSADO', rel, dispensas.get(rel));
      else add('FALTANDO', rel);
    } else if (r.erros.length) {
      add('FALHA', rel, r.erros.join('; '));
    } else {
      add('OK', rel, `${r.w}x${r.h}`);
    }
    return r;
  };

  switch (g.tipo) {
    case 'fotos':
      for (const item of g.itens) await foto(item.arquivo, item);
      break;
    case 'pares':
      for (const par of g.pares) {
        const a = await foto(par.antes, par);
        const d = await foto(par.depois, par);
        const alvo = par.antes.replace('-antes.jpg', '-*.jpg');
        if (a.existe !== d.existe) add('FALHA', alvo, 'par incompleto: entregue antes e depois, ou nenhum');
        if (a.existe && d.existe && (a.w !== d.w || a.h !== d.h)) add('FALHA', alvo, `tamanhos diferentes ${a.w}x${a.h} e ${d.w}x${d.h}`);
      }
      break;
    case 'serie': {
      const pastaAbs = path.join(raiz, g.pasta);
      const chave = `${g.pasta}/`;
      const arquivos = fs.existsSync(pastaAbs) ? fs.readdirSync(pastaAbs).filter((a) => !IGNORADOS.has(a)).sort() : [];
      if (arquivos.length === 0) {
        if (dispensas.has(chave)) add('DISPENSADO', chave, dispensas.get(chave));
        else add('FALTANDO', chave, 'pasta vazia');
        break;
      }
      const validos = arquivos.filter((a) => g.padrao.test(a));
      const estranhos = arquivos.filter((a) => !g.padrao.test(a));
      if (estranhos.length) add('FALHA', chave, `fora do padrão de nome: ${estranhos.join(', ')}`);
      if (validos.length < g.min || validos.length > g.max) add('FALHA', chave, `${validos.length} arquivos (esperado ${g.min}–${g.max})`);
      if (g.numerada) {
        const numeros = validos.map((a) => Number(a.match(g.padrao)[1]));
        if (!numeros.every((n, i) => n === i + 1)) {
          add('FALHA', chave, `numeração ${numeros.join(',')} (esperado 01 a ${String(validos.length).padStart(2, '0')} sem buracos)`);
        }
      }
      for (const a of validos) await foto(`${g.pasta}/${a}`, g.regra);
      break;
    }
    case 'video': {
      const rels = [`${g.base}.mp4`, `${g.base}.webm`, `${g.base}-poster.jpg`];
      const chave = `${g.base}.*`;
      if (!rels.some((r) => fs.existsSync(path.join(raiz, r)))) {
        if (!g.obrigatorio) add('OPCIONAL', chave, 'não entregue');
        else if (dispensas.has(chave)) add('DISPENSADO', chave, dispensas.get(chave));
        else add('FALTANDO', chave);
        break;
      }
      for (const [rel, codec] of [[rels[0], 'h264'], [rels[1], 'vp9']]) {
        const r = checarVideo(raiz, rel, codec);
        add(r.status, r.alvo, r.detalhe);
      }
      await foto(rels[2], { proporcao: [16, 9], minLargura: 1280, maxBytes: 250_000, qualidade: false });
      break;
    }
    case 'json': {
      const texto = lerTexto(raiz, g.arquivo);
      if (texto === null) {
        add('FALTANDO', g.arquivo);
        break;
      }
      let dados;
      try {
        dados = JSON.parse(texto);
      } catch (e) {
        add('FALHA', g.arquivo, `JSON inválido: ${e.message}`);
        break;
      }
      const erros = nome === 'depoimentos' ? validarDepoimentos(dados) : validarImprensa(dados);
      if (nome === 'depoimentos' && Array.isArray(dados) && dados.length < 3 && !temAviso(pendencias, 'DEPOIMENTOS')) {
        erros.push(`só ${dados.length} depoimento(s): registre "- DEPOIMENTOS: <motivo>" em docs/media-pendencias.md`);
      }
      if (erros.length) add('FALHA', g.arquivo, erros.join(' | '));
      else add('OK', g.arquivo, `${dados.length} itens`);
      break;
    }
    case 'manifesto': {
      const md = lerTexto(raiz, g.arquivo);
      if (md === null) {
        add('FALTANDO', g.arquivo);
        break;
      }
      if (lerTexto(raiz, 'docs/media-pendencias.md') === null) add('FALTANDO', 'docs/media-pendencias.md');
      const c = lerCreditos(md);
      const erros = c.erro ? [c.erro] : [];
      for (const r of c.registros) {
        if (!Number.isFinite(r.creditos) || r.creditos < 0) erros.push(`linha ${r.linha}: créditos inválidos`);
        if (!Number.isFinite(r.antes) || !Number.isFinite(r.depois)) erros.push(`linha ${r.linha}: falta saldo antes/depois`);
        else if (Number.isFinite(r.creditos) && Math.abs(r.antes - r.depois - r.creditos) > 0.01) {
          add('AVISO', g.arquivo, `linha ${r.linha}: saldo antes − depois ≠ créditos; explique na coluna Obs.`);
        }
      }
      if (c.total > 450) add('AVISO', g.arquivo, `gasto total ${c.total} acima da meta de 450; confira as justificativas em Avisos`);
      if (!(Math.abs(c.total - c.gastoDeclarado) <= 0.01)) erros.push(`"- Gasto total:" declarado ${c.gastoDeclarado} ≠ soma da tabela ${c.total}`);
      const citados = caminhosCitados(md);
      for (const rel of arquivosEntregues(raiz)) if (!citados.has(rel)) erros.push(`${rel} não está no manifesto`);
      if (erros.length) add('FALHA', g.arquivo, erros.join(' | '));
      else add('OK', g.arquivo, `gasto ${c.total} de 450 créditos`);
      break;
    }
    case 'extras': {
      const fora = arquivosEntregues(raiz).filter((rel) => !PERMITIDOS.some((re) => re.test(rel)));
      for (const rel of fora) add('FALHA', rel, 'arquivo fora do contrato');
      if (!fora.length) add('OK', 'src/assets/media/** e public/media/**', 'só caminhos do contrato');
      break;
    }
    default:
      throw new Error(`tipo de grupo desconhecido: ${g.tipo}`);
  }
  return linhas;
}
```

- [ ] **Step 8: Implementar `check-coleta.mjs` e `verify-contract.mjs`**

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/check-coleta.mjs`:

```js
#!/usr/bin/env node
// Confere media-src/coleta.json (arquivos, dimensões, campos) e a cobertura por categoria.
// Uso: node check-coleta.mjs [--grupos dra,clinica,resultados,carrossel]
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { MEDIA_SRC, WT, opcoes, ehPrincipal } from './lib/cli.mjs';
import { lerDispensas } from './lib/regras.mjs';

const CATEGORIAS = ['dra', 'recepcao', 'sala', 'equipe', 'detalhes', 'resultado', 'carrossel'];
const QUEIXAS = ['olhar', 'mandibula', 'labios', 'bigode'];
const POST_INSTAGRAM = /^https:\/\/www\.instagram\.com\/(?:(?:[\w.]+\/)?(?:p|reel)\/[\w-]+|stories\/highlights\/\d+)\/?(?:\?[\w=&-]*)?$/;
const A = 'src/assets/media';

export const COBERTURA = {
  dra: [{ rotulo: 'dra', filtro: (c) => c.categoria === 'dra', minimo: 2, chaves: [`${A}/dra/hero.jpg`, `${A}/dra/sobre.jpg`] }],
  clinica: ['recepcao', 'sala', 'equipe', 'detalhes'].map((cat) => ({
    rotulo: cat, filtro: (c) => c.categoria === cat, minimo: 1, chaves: [`${A}/clinica/${cat}.jpg`],
  })),
  resultados: QUEIXAS.map((q) => ({
    rotulo: `resultado ${q}`,
    filtro: (c) => c.categoria === 'resultado' && c.queixa === q,
    minimo: 1,
    chaves: [`${A}/resultados/${q}-antes.jpg`, `${A}/resultados/${q}-depois.jpg`],
  })),
  carrossel: [{ rotulo: 'carrossel', filtro: (c) => c.categoria === 'carrossel', minimo: 6, chaves: [`${A}/carrossel/`] }],
};

export async function checarColeta({ coleta, base = MEDIA_SRC, pendencias = '', grupos = Object.keys(COBERTURA) }) {
  if (!Array.isArray(coleta)) return { erros: ['coleta.json precisa ser um array'], linhas: [] };
  const desconhecidos = grupos.filter((g) => !(g in COBERTURA));
  if (desconhecidos.length) return { erros: [`grupo desconhecido: ${desconhecidos.join(', ')}`], linhas: [] };
  const erros = [];
  const linhas = [];
  const ids = new Set();
  for (const [i, c] of coleta.entries()) {
    const p = `coleta[${i}] ${c?.id ?? ''}`.trim();
    if (!c?.id || ids.has(c.id)) erros.push(`${p}: id ausente ou repetido`);
    ids.add(c?.id);
    if (!CATEGORIAS.includes(c?.categoria)) erros.push(`${p}: categoria "${c?.categoria}" inválida`);
    const queixaOk = c?.categoria === 'resultado' ? QUEIXAS.includes(c.queixa) : c?.queixa === null;
    if (!queixaOk) erros.push(`${p}: queixa "${c?.queixa}" inválida para a categoria`);
    if (!POST_INSTAGRAM.test(c?.post ?? '')) erros.push(`${p}: "${c?.post}" não é URL de post ou destaque do Instagram`);
    if (typeof c?.pessoas !== 'string' || c.pessoas.trim() === '') erros.push(`${p}: descreva quem aparece em "pessoas"`);
    const abs = path.join(base, c?.arquivo ?? '');
    if (!c?.arquivo || !fs.existsSync(abs)) {
      erros.push(`${p}: arquivo "${c?.arquivo}" não existe`);
      continue;
    }
    let meta;
    try {
      meta = await sharp(abs).metadata();
    } catch {
      erros.push(`${p}: ${c.arquivo} não é imagem (URL do CDN expirada? baixe de novo pelo post)`);
      continue;
    }
    if (meta.width !== c.largura || meta.height !== c.altura) {
      erros.push(`${p}: arquivo tem ${meta.width}x${meta.height}, registrado ${c.largura}x${c.altura}`);
    }
  }
  const dispensas = lerDispensas(pendencias);
  for (const grupo of grupos) {
    for (const regra of COBERTURA[grupo]) {
      const n = coleta.filter((c) => c && regra.filtro(c)).length;
      const dispensado = regra.chaves.every((k) => dispensas.has(k));
      const status = n >= regra.minimo ? 'OK' : dispensado ? 'DISPENSADO' : 'FALTANDO';
      linhas.push(`${status.padEnd(10)} ${regra.rotulo}: ${n} candidata(s), mínimo ${regra.minimo}`);
      if (status === 'FALTANDO') erros.push(`cobertura insuficiente: ${regra.rotulo}`);
    }
  }
  if (grupos.includes('clinica')) {
    const vazias = coleta.filter((c) => c?.categoria === 'recepcao' && /^ningu[eé]m$/i.test(c.pessoas?.trim() ?? '')).length;
    linhas.push(`INFO       recepção sem pessoas (fonte possível da foto viva): ${vazias}`);
  }
  return { erros, linhas };
}

if (ehPrincipal(import.meta.url)) {
  const o = opcoes(process.argv.slice(2));
  const coleta = JSON.parse(fs.readFileSync(path.join(MEDIA_SRC, 'coleta.json'), 'utf8'));
  const caminhoPendencias = path.join(WT, 'docs/media-pendencias.md');
  const pendencias = fs.existsSync(caminhoPendencias) ? fs.readFileSync(caminhoPendencias, 'utf8') : '';
  const grupos = o.grupos ? String(o.grupos).split(',') : undefined;
  const { erros, linhas } = await checarColeta({ coleta, pendencias, grupos });
  for (const l of linhas) console.log(l);
  for (const e of erros) console.log(`ERRO       ${e}`);
  console.log(erros.length ? 'RESULTADO: FALHOU' : 'RESULTADO: OK');
  process.exit(erros.length ? 1 : 0);
}
```

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/verify-contract.mjs`:

```js
#!/usr/bin/env node
// Verifica o contrato da frente de mídia no worktree.
// Uso: node verify-contract.mjs [--only grupo1,grupo2] [--root <outra raiz>]
// Grupos: dra, clinica, resultados, carrossel, tratamentos, apoio, metodo, cta-final, depoimentos, imprensa, manifesto, extras.
// Saída 0 = RESULTADO: OK; 1 = FALHOU (há FALHA ou FALTANDO); 2 = grupo desconhecido. AVISO não bloqueia.
import fs from 'node:fs';
import path from 'node:path';
import { WT, opcoes } from './lib/cli.mjs';
import { GRUPOS, checarGrupo } from './lib/contrato.mjs';
import { lerDispensas } from './lib/regras.mjs';

const o = opcoes(process.argv.slice(2));
const raiz = o.root ?? WT;
const grupos = o.only ? String(o.only).split(',') : Object.keys(GRUPOS);
const invalidos = grupos.filter((g) => !(g in GRUPOS));
if (invalidos.length) {
  console.error(`Grupo desconhecido: ${invalidos.join(', ')}. Válidos: ${Object.keys(GRUPOS).join(', ')}`);
  process.exit(2);
}
const caminhoPendencias = path.join(raiz, 'docs/media-pendencias.md');
const pendencias = fs.existsSync(caminhoPendencias) ? fs.readFileSync(caminhoPendencias, 'utf8') : '';
const contexto = { pendencias, dispensas: lerDispensas(pendencias) };

let falhou = false;
for (const nome of grupos) {
  console.log(`[${nome}]`);
  for (const l of await checarGrupo(nome, raiz, contexto)) {
    console.log(`  ${l.status.padEnd(10)} ${l.alvo}${l.detalhe ? ` — ${l.detalhe}` : ''}`);
    if (l.status === 'FALHA' || l.status === 'FALTANDO') falhou = true;
  }
}
console.log(falhou ? 'RESULTADO: FALHOU' : 'RESULTADO: OK');
process.exit(falhou ? 1 : 0);
```

- [ ] **Step 9: Rodar a suíte inteira**

```bash
cd "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools" && npm test
```

Esperado: `regras`, `contrato` e `coleta` passam; resumo com `fail 0`.

- [ ] **Step 10: Rodar o verificador no worktree**

```bash
T="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools"
node "$T/verify-contract.mjs" --only manifesto,extras; echo "saida=$?"
node "$T/verify-contract.mjs"; echo "saida=$?"
```

Esperado: a primeira chamada mostra `OK docs/media-manifest.md — gasto 0 de 450 créditos`, `OK src/assets/media/** e public/media/**`, `RESULTADO: OK` e `saida=0`. A segunda mostra `FALTANDO` nos grupos de fotos, vídeo do Método e JSON, `OPCIONAL public/media/cta-final.*`, `RESULTADO: FALHOU` e `saida=1` (esperado nesta fase).

- [ ] **Step 11: Confirmar que nada foi para o git**

```bash
git -C "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/.worktrees/midia" status --short
```

Esperado: saída vazia (`media-src/` é ignorado; não há commit nesta tarefa).

---

### Task 3: Scripts de processamento de foto e vídeo (com testes)

**Files:**
- Create: `media-src/.tools/export-photo.mjs`, `crop-pair.mjs`, `compare-regions.mjs`, `encode-video.mjs`, `grid.mjs`, `info.mjs`
- Test: `media-src/.tools/test/export-photo.test.mjs`, `crop-pair.test.mjs`, `compare-regions.test.mjs`, `encode-video.test.mjs`

**Interfaces:**
- Consumes: `lib/cli.mjs` (Task 1); `estimarQualidadeJpeg`, `temFaststart` de `lib/regras.mjs` (Task 2, só nos testes).
- Produces:
  - `exportarFoto({ entrada, saida, raiz = WT, recorte, proporcao, minimo, minLado, tamanho, maxLado = 2400, permitirAmpliar = false, png = false }) → Promise<{ saida, largura, altura, bytes, caixa }>`; CLI `node export-photo.mjs --in <arquivo> --out <relativo à raiz> [--root R] [--crop x,y,w,h] [--ratio a:b] [--min LxA] [--min-long N] [--size LxA] [--max-long N] [--allow-enlarge] [--png]`.
  - `recortarPar({ queixa, antes: { entrada, recorte }, depois: { entrada, recorte }, raiz = WT, previa, maxLargura = 1200 }) → Promise<{ queixa, largura, altura, previa }>`; grava `src/assets/media/resultados/<queixa>-{antes,depois}.jpg` e a prévia `media-src/work/<queixa>-sobreposicao.png`; CLI `--queixa --antes --antes-crop --depois --depois-crop [--root] [--preview]`.
  - `compararRegioes({ a, b, caixas, saida, limiteMedia = 4, limiteBloco = 10 }) → Promise<{ caixas: [{ caixa, mae, piorBloco }], aprovadoMetrica, ladosALado }>`; CLI `--a --b --boxes "x,y,w,h;x,y,w,h" [--out <png>] [--limite-media N] [--limite-bloco N]`, saída 0 = métrica aprovada, 3 = reprovada.
  - `codificarVideo({ entrada, nome: 'metodo' | 'cta-final', inicio = 0, duracao, raiz = WT }) → Promise<{ mp4, webm, poster }>`; CLI `--in --name [--start S] [--duration D] [--root R]`.
  - `grid.mjs --in <imagem> --out <png>` e `info.mjs <arquivo> [...]` (uma linha JSON por arquivo).

- [ ] **Step 1: Escrever os testes de exportação e do par**

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/test/export-photo.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { exportarFoto } from '../export-photo.mjs';
import { estimarQualidadeJpeg } from '../lib/regras.mjs';

const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'midia-export-'));
const quadrada = path.join(raiz, 'quadrada.jpg');
await sharp({ create: { width: 1080, height: 1080, channels: 3, background: '#E4B9B0' } })
  .jpeg({ quality: 95 })
  .withExif({ IFD0: { Copyright: 'teste' } })
  .toFile(quadrada);

test('recorte central 4:5 vira JPEG q88 sRGB sem EXIF', async () => {
  const r = await exportarFoto({ entrada: quadrada, saida: 'out/a.jpg', proporcao: [4, 5], raiz });
  assert.deepEqual([r.largura, r.altura], [864, 1080]);
  const buf = fs.readFileSync(path.join(raiz, 'out/a.jpg'));
  const meta = await sharp(buf).metadata();
  assert.equal(meta.format, 'jpeg');
  assert.equal(meta.space, 'srgb');
  assert.equal(meta.channels, 3);
  assert.equal(meta.exif, undefined);
  assert.equal(estimarQualidadeJpeg(buf), 88);
});

test('não amplia sem permissão', async () => {
  await assert.rejects(exportarFoto({ entrada: quadrada, saida: 'out/b.jpg', proporcao: [4, 5], minimo: { width: 1280, height: 1600 }, raiz }), /abaixo do mínimo/);
  await assert.rejects(exportarFoto({ entrada: quadrada, saida: 'out/b2.jpg', minLado: 1600, raiz }), /abaixo do mínimo/);
});

test('amplia até o mínimo só com permissão explícita', async () => {
  const r = await exportarFoto({ entrada: quadrada, saida: 'out/c.jpg', proporcao: [4, 5], minimo: { width: 1280, height: 1600 }, permitirAmpliar: true, raiz });
  assert.deepEqual([r.largura, r.altura], [1280, 1600]);
  const r2 = await exportarFoto({ entrada: quadrada, saida: 'out/c2.jpg', minLado: 1600, permitirAmpliar: true, raiz });
  assert.deepEqual([r2.largura, r2.altura], [1600, 1600]);
});

test('recorte fora da proporção ou fora da imagem falha', async () => {
  await assert.rejects(exportarFoto({ entrada: quadrada, saida: 'out/d.jpg', recorte: { left: 0, top: 0, width: 500, height: 500 }, proporcao: [4, 5], raiz }), /não está em 4:5/);
  await assert.rejects(exportarFoto({ entrada: quadrada, saida: 'out/e.jpg', recorte: { left: 900, top: 0, width: 400, height: 500 }, raiz }), /fora da imagem/);
});

test('reduz o lado maior para 2400 e grava PNG de trabalho', async () => {
  const grande = path.join(raiz, 'grande.png');
  await sharp({ create: { width: 3000, height: 3750, channels: 3, background: '#F1DCD6' } }).png().toFile(grande);
  const r = await exportarFoto({ entrada: grande, saida: 'out/f.jpg', proporcao: [4, 5], raiz });
  assert.deepEqual([r.largura, r.altura], [1920, 2400]);
  const p = await exportarFoto({ entrada: quadrada, saida: 'work/g.png', proporcao: [16, 9], png: true, raiz });
  assert.deepEqual([p.largura, p.altura], [1080, 608]);
  assert.equal((await sharp(path.join(raiz, 'work/g.png')).metadata()).format, 'png');
});
```

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/test/crop-pair.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { recortarPar } from '../crop-pair.mjs';

const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'midia-par-'));
const composto = path.join(raiz, 'composto.png');
await sharp({ create: { width: 1080, height: 675, channels: 3, background: '#F3E3DE' } }).png().toFile(composto);

test('par sai em 4:5, no mesmo tamanho, sem ampliar, com prévia', async () => {
  const previa = path.join(raiz, 'work/labios-sobreposicao.png');
  const r = await recortarPar({
    queixa: 'labios',
    antes: { entrada: composto, recorte: { left: 0, top: 0, width: 540, height: 675 } },
    depois: { entrada: composto, recorte: { left: 540, top: 0, width: 536, height: 670 } },
    raiz,
    previa,
  });
  assert.deepEqual([r.largura, r.altura], [536, 670]);
  for (const lado of ['antes', 'depois']) {
    const meta = await sharp(path.join(raiz, `src/assets/media/resultados/labios-${lado}.jpg`)).metadata();
    assert.deepEqual([meta.width, meta.height], [536, 670]);
  }
  assert.ok(fs.existsSync(previa));
});

test('queixa fora da lista e recorte fora de 4:5 falham', async () => {
  const lado = { entrada: composto, recorte: { left: 0, top: 0, width: 540, height: 675 } };
  await assert.rejects(recortarPar({ queixa: 'nariz', antes: lado, depois: lado, raiz }), /queixa inválida/);
  const quadrado = { entrada: composto, recorte: { left: 540, top: 0, width: 540, height: 540 } };
  await assert.rejects(recortarPar({ queixa: 'olhar', antes: lado, depois: quadrado, raiz }), /não está em 4:5/);
});
```

- [ ] **Step 2: Rodar e ver falhar**

```bash
cd "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools" && node --test test/export-photo.test.mjs test/crop-pair.test.mjs
```

Esperado: `ERR_MODULE_NOT_FOUND` para `export-photo.mjs` e `crop-pair.mjs`; resumo com `fail 2`.

- [ ] **Step 3: Implementar `export-photo.mjs`**

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/export-photo.mjs`:

```js
#!/usr/bin/env node
// Recorta (opcional), redimensiona e grava JPEG sRGB q88 sem metadados — ou PNG de trabalho com --png.
// Uso: node export-photo.mjs --in <arquivo> --out <caminho relativo à raiz> [--root <raiz>] [--crop x,y,w,h]
//        [--ratio a:b] [--min LxA] [--min-long N] [--size LxA] [--max-long 2400] [--allow-enlarge] [--png]
// Sem --root, a raiz é o worktree da mídia. Nunca amplia sem --allow-enlarge (proibido em antes/depois).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { WT, opcoes, lerCaixa, lerProporcao, lerTamanho, ehPrincipal } from './lib/cli.mjs';

function caixaFinal(w, h, recorte, proporcao) {
  if (recorte) {
    const { left, top, width, height } = recorte;
    if (left < 0 || top < 0 || width < 1 || height < 1 || left + width > w || top + height > h) {
      throw new Error(`recorte ${left},${top},${width},${height} fora da imagem ${w}x${h}`);
    }
    if (proporcao) {
      const alvo = proporcao[0] / proporcao[1];
      if (Math.abs(width / height - alvo) / alvo > 0.01) throw new Error(`recorte ${width}x${height} não está em ${proporcao.join(':')}`);
    }
    return recorte;
  }
  if (!proporcao) return { left: 0, top: 0, width: w, height: h };
  const alvo = proporcao[0] / proporcao[1];
  if (w / h > alvo) {
    const width = Math.round(h * alvo);
    return { left: Math.floor((w - width) / 2), top: 0, width, height: h };
  }
  const height = Math.round(w / alvo);
  return { left: 0, top: Math.floor((h - height) / 2), width: w, height };
}

function tamanhoFinal(caixa, { proporcao, minimo, minLado, tamanho, maxLado, permitirAmpliar }) {
  if (tamanho) {
    if (!permitirAmpliar && (tamanho.width > caixa.width || tamanho.height > caixa.height)) {
      throw new Error(`ampliação proibida: ${caixa.width}x${caixa.height} para ${tamanho.width}x${tamanho.height}`);
    }
    return tamanho;
  }
  let fw = caixa.width;
  let fh = caixa.height;
  const maior = Math.max(fw, fh);
  if (maior > maxLado) {
    const k = maxLado / maior;
    fw = Math.round(fw * k);
    fh = Math.round(fh * k);
  }
  if (minLado && Math.max(fw, fh) < minLado) {
    if (!permitirAmpliar) throw new Error(`lado maior ${Math.max(fw, fh)} abaixo do mínimo ${minLado}`);
    const k = minLado / Math.max(fw, fh);
    fw = Math.round(fw * k);
    fh = Math.round(fh * k);
  }
  if (minimo && (fw < minimo.width || fh < minimo.height)) {
    if (!permitirAmpliar) throw new Error(`resultado ${fw}x${fh} abaixo do mínimo ${minimo.width}x${minimo.height}`);
    const k = Math.max(minimo.width / fw, minimo.height / fh);
    fw = Math.max(minimo.width, Math.round(fw * k));
    fh = Math.max(minimo.height, Math.round(fh * k));
  }
  if (proporcao) fh = Math.round((fw * proporcao[1]) / proporcao[0]);
  return { width: fw, height: fh };
}

export async function exportarFoto({
  entrada, saida, raiz = WT, recorte, proporcao, minimo, minLado, tamanho, maxLado = 2400, permitirAmpliar = false, png = false,
}) {
  const base = await sharp(entrada).rotate().png().toBuffer({ resolveWithObject: true });
  const caixa = caixaFinal(base.info.width, base.info.height, recorte, proporcao);
  const final = tamanhoFinal(caixa, { proporcao, minimo, minLado, tamanho, maxLado, permitirAmpliar });
  const destino = path.join(raiz, saida);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  let img = sharp(base.data)
    .extract(caixa)
    .resize(final.width, final.height, { fit: 'cover', kernel: 'lanczos3' })
    .toColourspace('srgb');
  img = png ? img.png() : img.flatten({ background: '#ffffff' }).jpeg({ quality: 88, mozjpeg: false, chromaSubsampling: '4:2:0' });
  const info = await img.toFile(destino);
  return { saida, largura: info.width, altura: info.height, bytes: info.size, caixa };
}

if (ehPrincipal(import.meta.url)) {
  const o = opcoes(process.argv.slice(2));
  if (!o.in || !o.out) {
    console.error('Uso: node export-photo.mjs --in <arquivo> --out <relativo à raiz> [--root R] [--crop x,y,w,h] [--ratio a:b] [--min LxA] [--min-long N] [--size LxA] [--max-long N] [--allow-enlarge] [--png]');
    process.exit(2);
  }
  const r = await exportarFoto({
    entrada: o.in,
    saida: o.out,
    raiz: o.root ?? WT,
    recorte: o.crop ? lerCaixa(o.crop) : undefined,
    proporcao: o.ratio ? lerProporcao(o.ratio) : undefined,
    minimo: o.min ? lerTamanho(o.min) : undefined,
    minLado: o['min-long'] ? Number(o['min-long']) : undefined,
    tamanho: o.size ? lerTamanho(o.size) : undefined,
    maxLado: o['max-long'] ? Number(o['max-long']) : 2400,
    permitirAmpliar: o['allow-enlarge'] === true,
    png: o.png === true,
  });
  console.log(JSON.stringify(r));
}
```

- [ ] **Step 4: Implementar `crop-pair.mjs`**

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/crop-pair.mjs`:

```js
#!/usr/bin/env node
// Par antes/depois: recorte 4:5, mesmo tamanho nos dois lados, nunca amplia, sem filtro. Gera prévia de sobreposição (50%).
// Uso: node crop-pair.mjs --queixa olhar|mandibula|labios|bigode --antes <arquivo> --antes-crop x,y,w,h
//        --depois <arquivo> --depois-crop x,y,w,h [--root R] [--preview <png>]
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { WT, MEDIA_SRC, opcoes, lerCaixa, ehPrincipal } from './lib/cli.mjs';
import { exportarFoto } from './export-photo.mjs';

export const QUEIXAS = ['olhar', 'mandibula', 'labios', 'bigode'];

export async function recortarPar({ queixa, antes, depois, raiz = WT, previa, maxLargura = 1200 }) {
  if (!QUEIXAS.includes(queixa)) throw new Error(`queixa inválida: ${queixa} (use ${QUEIXAS.join(', ')})`);
  for (const [lado, { recorte }] of [['antes', antes], ['depois', depois]]) {
    if (Math.abs(recorte.width / recorte.height - 0.8) / 0.8 > 0.01) {
      throw new Error(`recorte do ${lado} ${recorte.width}x${recorte.height} não está em 4:5`);
    }
  }
  let largura = Math.min(antes.recorte.width, depois.recorte.width, maxLargura);
  let altura = Math.round((largura * 5) / 4);
  const alturaMax = Math.min(antes.recorte.height, depois.recorte.height);
  while (altura > alturaMax) {
    largura -= 1;
    altura = Math.round((largura * 5) / 4);
  }
  const saidas = {};
  for (const [lado, fonte] of [['antes', antes], ['depois', depois]]) {
    saidas[lado] = `src/assets/media/resultados/${queixa}-${lado}.jpg`;
    await exportarFoto({
      entrada: fonte.entrada,
      saida: saidas[lado],
      raiz,
      recorte: fonte.recorte,
      proporcao: [4, 5],
      tamanho: { width: largura, height: altura },
    });
  }
  const destinoPrevia = previa ?? path.join(MEDIA_SRC, 'work', `${queixa}-sobreposicao.png`);
  fs.mkdirSync(path.dirname(destinoPrevia), { recursive: true });
  const camada = await sharp(path.join(raiz, saidas.depois)).ensureAlpha(0.5).png().toBuffer();
  await sharp(path.join(raiz, saidas.antes)).composite([{ input: camada, left: 0, top: 0 }]).png().toFile(destinoPrevia);
  return { queixa, largura, altura, previa: destinoPrevia };
}

if (ehPrincipal(import.meta.url)) {
  const o = opcoes(process.argv.slice(2));
  if (!o.queixa || !o.antes || !o['antes-crop'] || !o.depois || !o['depois-crop']) {
    console.error('Uso: node crop-pair.mjs --queixa <q> --antes <arq> --antes-crop x,y,w,h --depois <arq> --depois-crop x,y,w,h [--root R] [--preview <png>]');
    process.exit(2);
  }
  const r = await recortarPar({
    queixa: o.queixa,
    antes: { entrada: o.antes, recorte: lerCaixa(o['antes-crop']) },
    depois: { entrada: o.depois, recorte: lerCaixa(o['depois-crop']) },
    raiz: o.root ?? WT,
    previa: o.preview,
  });
  console.log(JSON.stringify(r));
}
```

- [ ] **Step 5: Rodar e ver passar**

```bash
cd "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools" && node --test test/export-photo.test.mjs test/crop-pair.test.mjs
```

Esperado: 7 testes, `fail 0`.

- [ ] **Step 6: Escrever os testes de comparação e de vídeo**

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/test/compare-regions.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { compararRegioes } from '../compare-regions.mjs';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'midia-comparar-'));
const original = path.join(dir, 'original.png');
const ampliada = path.join(dir, 'ampliada.png');
const alterada = path.join(dir, 'alterada.png');
await sharp({ create: { width: 200, height: 250, channels: 3, noise: { type: 'gaussian', mean: 128, sigma: 30 } } }).blur(3).png().toFile(original);
await sharp(original).resize(400, 500, { kernel: 'lanczos3' }).png().toFile(ampliada);
await sharp(ampliada)
  .composite([{ input: { create: { width: 40, height: 40, channels: 3, background: '#000000' } }, left: 100, top: 100 }])
  .png()
  .toFile(alterada);
const caixa = { left: 20, top: 20, width: 160, height: 160 };

test('ampliação fiel passa na métrica e gera o lado a lado', async () => {
  const saida = path.join(dir, 'lado-a-lado.png');
  const r = await compararRegioes({ a: original, b: ampliada, caixas: [caixa], saida });
  assert.equal(r.aprovadoMetrica, true, JSON.stringify(r));
  assert.deepEqual(r.ladosALado, [saida]);
  assert.ok(fs.existsSync(saida));
});

test('mudança local reprova pelo pior bloco mesmo com média baixa', async () => {
  const r = await compararRegioes({ a: original, b: alterada, caixas: [caixa] });
  assert.ok(r.caixas[0].mae <= 4, `média ${r.caixas[0].mae}`);
  assert.ok(r.caixas[0].piorBloco > 10, `pior bloco ${r.caixas[0].piorBloco}`);
  assert.equal(r.aprovadoMetrica, false);
});

test('caixa fora da imagem falha', async () => {
  await assert.rejects(compararRegioes({ a: original, b: ampliada, caixas: [{ left: 190, top: 20, width: 160, height: 160 }] }), /inválida/);
});
```

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/test/encode-video.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { codificarVideo } from '../encode-video.mjs';
import { temFaststart } from '../lib/regras.mjs';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'midia-video-'));
const gerar = (arquivo, segundos) => execFileSync('ffmpeg', [
  '-y', '-v', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=1920x1080:rate=24', '-f', 'lavfi', '-i', 'sine=frequency=440',
  '-t', String(segundos), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', arquivo,
]);

test('mp4 H.264 e webm VP9 sem áudio, 16:9, ≤ 2.000.000 bytes, faststart, poster 1280x720', { timeout: 600_000 }, async () => {
  const bruto = path.join(dir, 'bruto.mp4');
  gerar(bruto, 6);
  await codificarVideo({ entrada: bruto, nome: 'metodo', raiz: dir });
  for (const [arquivo, codec] of [['public/media/metodo.mp4', 'h264'], ['public/media/metodo.webm', 'vp9']]) {
    const abs = path.join(dir, arquivo);
    assert.ok(fs.statSync(abs).size <= 2_000_000, arquivo);
    const info = JSON.parse(execFileSync('ffprobe', [
      '-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height:format=duration', '-of', 'json', abs,
    ], { encoding: 'utf8' }));
    assert.equal(info.streams.length, 1, `${arquivo} deveria ter só a faixa de vídeo`);
    assert.equal(info.streams[0].codec_name, codec);
    assert.equal(info.streams[0].width / info.streams[0].height, 16 / 9);
    const duracao = Number(info.format.duration);
    assert.ok(duracao >= 5 && duracao <= 8.05, `duração ${duracao}`);
  }
  assert.equal(temFaststart(fs.readFileSync(path.join(dir, 'public/media/metodo.mp4'))), true);
  const poster = await sharp(path.join(dir, 'public/media/metodo-poster.jpg')).metadata();
  assert.deepEqual([poster.width, poster.height], [1280, 720]);
});

test('recusa trecho com menos de 5 s', { timeout: 120_000 }, async () => {
  const curto = path.join(dir, 'curto.mp4');
  gerar(curto, 3);
  await assert.rejects(codificarVideo({ entrada: curto, nome: 'metodo', raiz: dir }), /mínimo 5 s/);
});
```

- [ ] **Step 7: Rodar e ver falhar**

```bash
cd "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools" && node --test test/compare-regions.test.mjs test/encode-video.test.mjs
```

Esperado: `ERR_MODULE_NOT_FOUND` para `compare-regions.mjs` e `encode-video.mjs`; resumo com `fail 2`.

- [ ] **Step 8: Implementar `compare-regions.mjs`**

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/compare-regions.mjs`:

```js
#!/usr/bin/env node
// Compara regiões (rosto, letreiro) da referência com a candidata (upscale ou quadro de vídeo).
// A candidata é redimensionada para o tamanho da referência; mede a diferença média (MAE, escala 0–255)
// e o pior bloco de uma grade 8x8 dentro de cada caixa. A checagem visual do lado a lado continua obrigatória.
// Uso: node compare-regions.mjs --a <referência> --b <candidata> --boxes "x,y,w,h;x,y,w,h" [--out <lado-a-lado.png>]
//        [--limite-media 4] [--limite-bloco 10]
// Saída: 0 = métrica aprovada; 3 = reprovada.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { opcoes, lerCaixa, ehPrincipal } from './lib/cli.mjs';

async function cinza(entrada, largura, altura) {
  let img = sharp(entrada).rotate().removeAlpha();
  if (largura) img = img.resize(largura, altura, { fit: 'fill', kernel: 'lanczos3' });
  return img.greyscale().raw().toBuffer({ resolveWithObject: true });
}

async function ladoALado(a, b, caixa, larguraRef, alturaRef, destino) {
  const mb = await sharp(b).metadata();
  const sx = mb.width / larguraRef;
  const sy = mb.height / alturaRef;
  const left = Math.round(caixa.left * sx);
  const top = Math.round(caixa.top * sy);
  const caixaB = {
    left,
    top,
    width: Math.min(Math.round(caixa.width * sx), mb.width - left),
    height: Math.min(Math.round(caixa.height * sy), mb.height - top),
  };
  const altura = 800;
  const ra = await sharp(a).rotate().removeAlpha().extract(caixa).resize({ height: altura }).png().toBuffer({ resolveWithObject: true });
  const rb = await sharp(b).rotate().removeAlpha().extract(caixaB).resize({ height: altura }).png().toBuffer({ resolveWithObject: true });
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  await sharp({ create: { width: ra.info.width + rb.info.width + 24, height: altura, channels: 3, background: '#ffffff' } })
    .composite([{ input: ra.data, left: 0, top: 0 }, { input: rb.data, left: ra.info.width + 24, top: 0 }])
    .png()
    .toFile(destino);
}

export async function compararRegioes({ a, b, caixas, saida, limiteMedia = 4, limiteBloco = 10 }) {
  const ref = await cinza(a);
  const W = ref.info.width;
  const H = ref.info.height;
  const cand = await cinza(b, W, H);
  const ca = ref.info.channels;
  const cb = cand.info.channels;
  const erro = (c) => {
    let soma = 0;
    for (let y = c.top; y < c.top + c.height; y += 1) {
      for (let x = c.left; x < c.left + c.width; x += 1) {
        soma += Math.abs(ref.data[(y * W + x) * ca] - cand.data[(y * W + x) * cb]);
      }
    }
    return soma / (c.width * c.height);
  };
  const resultado = caixas.map((c) => {
    if (c.left < 0 || c.top < 0 || c.width < 16 || c.height < 16 || c.left + c.width > W || c.top + c.height > H) {
      throw new Error(`caixa ${c.left},${c.top},${c.width},${c.height} inválida para ${W}x${H} (mínimo 16x16)`);
    }
    const bw = Math.floor(c.width / 8);
    const bh = Math.floor(c.height / 8);
    let pior = 0;
    for (let j = 0; j < 8; j += 1) {
      for (let i = 0; i < 8; i += 1) {
        pior = Math.max(pior, erro({ left: c.left + i * bw, top: c.top + j * bh, width: bw, height: bh }));
      }
    }
    return { caixa: c, mae: Number(erro(c).toFixed(2)), piorBloco: Number(pior.toFixed(2)) };
  });
  const ladosALado = [];
  if (saida) {
    for (const [n, c] of caixas.entries()) {
      const destino = caixas.length === 1 ? saida : saida.replace(/\.png$/i, `-${n + 1}.png`);
      await ladoALado(a, b, c, W, H, destino);
      ladosALado.push(destino);
    }
  }
  return {
    caixas: resultado,
    aprovadoMetrica: resultado.every((r) => r.mae <= limiteMedia && r.piorBloco <= limiteBloco),
    ladosALado,
  };
}

if (ehPrincipal(import.meta.url)) {
  const o = opcoes(process.argv.slice(2));
  if (!o.a || !o.b || !o.boxes) {
    console.error('Uso: node compare-regions.mjs --a <referência> --b <candidata> --boxes "x,y,w,h;x,y,w,h" [--out <png>] [--limite-media 4] [--limite-bloco 10]');
    process.exit(2);
  }
  const r = await compararRegioes({
    a: o.a,
    b: o.b,
    caixas: String(o.boxes).split(';').map((t) => lerCaixa(t)),
    saida: o.out,
    limiteMedia: o['limite-media'] ? Number(o['limite-media']) : 4,
    limiteBloco: o['limite-bloco'] ? Number(o['limite-bloco']) : 10,
  });
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.aprovadoMetrica ? 0 : 3);
}
```

- [ ] **Step 9: Implementar `encode-video.mjs`**

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/encode-video.mjs`:

```js
#!/usr/bin/env node
// Converte o vídeo bruto em mp4 (H.264, +faststart) e webm (VP9), sem áudio, 16:9, ≤ 2.000.000 bytes cada,
// e grava o poster 1280x720 a partir do primeiro quadro do trecho.
// Uso: node encode-video.mjs --in <bruto.mp4> --name metodo|cta-final [--start 0] [--duration 6] [--root R]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { WT, opcoes, ehPrincipal } from './lib/cli.mjs';

const TETO = 2_000_000;
const NOMES = ['metodo', 'cta-final'];

function sondar(arquivo) {
  const j = JSON.parse(execFileSync('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', arquivo,
  ], { encoding: 'utf8' }));
  return { largura: j.streams[0].width, altura: j.streams[0].height, duracao: Number(j.format.duration) };
}

function filtro(largura) {
  const altura = (largura * 9) / 16;
  return `scale=${largura}:${altura}:force_original_aspect_ratio=increase:flags=lanczos,crop=${largura}:${altura},fps=24,format=yuv420p`;
}

export async function codificarVideo({ entrada, nome, inicio = 0, duracao, raiz = WT }) {
  if (!NOMES.includes(nome)) throw new Error(`nome inválido: ${nome} (use ${NOMES.join(' ou ')})`);
  const fonte = sondar(entrada);
  const dur = Math.min(duracao ?? fonte.duracao - inicio, 8);
  if (dur < 5) throw new Error(`trecho de ${dur.toFixed(2)} s; mínimo 5 s`);
  if (fonte.largura < 1280) throw new Error(`fonte com ${fonte.largura} px de largura; mínimo 1280 (não codifique o rascunho 480p)`);
  const pasta = path.join(raiz, 'public/media');
  fs.mkdirSync(pasta, { recursive: true });
  const base = ['-y', '-v', 'error', '-ss', String(inicio), '-t', dur.toFixed(3), '-i', entrada, '-an'];
  const tentar = (saida, argsCodec, tentativas) => {
    for (const [largura, crf] of tentativas) {
      if (largura > fonte.largura) continue;
      execFileSync('ffmpeg', [...base, '-vf', filtro(largura), ...argsCodec(crf), saida]);
      const bytes = fs.statSync(saida).size;
      if (bytes <= TETO) return { saida, largura, crf, bytes };
    }
    fs.rmSync(saida, { force: true });
    throw new Error(`${path.basename(saida)} não coube em ${TETO} bytes`);
  };
  const mp4 = tentar(
    path.join(pasta, `${nome}.mp4`),
    (crf) => ['-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-profile:v', 'high', '-movflags', '+faststart'],
    [[1920, 26], [1920, 28], [1280, 26], [1280, 28], [1280, 30]],
  );
  const webm = tentar(
    path.join(pasta, `${nome}.webm`),
    (crf) => ['-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(crf), '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2'],
    [[1920, 36], [1920, 40], [1280, 36], [1280, 40], [1280, 44]],
  );
  const quadro = path.join(os.tmpdir(), `poster-${nome}-${process.pid}.png`);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-ss', String(inicio), '-i', entrada, '-frames:v', '1', quadro]);
  const destino = path.join(pasta, `${nome}-poster.jpg`);
  let info;
  for (const q of [82, 76, 70]) {
    info = await sharp(quadro).resize(1280, 720, { fit: 'cover', kernel: 'lanczos3' }).toColourspace('srgb').jpeg({ quality: q, mozjpeg: true }).toFile(destino);
    if (info.size <= 250_000) break;
  }
  fs.rmSync(quadro, { force: true });
  if (info.size > 250_000) throw new Error('poster acima de 250.000 bytes');
  return { mp4, webm, poster: { saida: destino, bytes: info.size } };
}

if (ehPrincipal(import.meta.url)) {
  const o = opcoes(process.argv.slice(2));
  if (!o.in || !o.name) {
    console.error('Uso: node encode-video.mjs --in <bruto.mp4> --name metodo|cta-final [--start 0] [--duration 6] [--root R]');
    process.exit(2);
  }
  const r = await codificarVideo({
    entrada: o.in,
    nome: o.name,
    inicio: o.start ? Number(o.start) : 0,
    duracao: o.duration ? Number(o.duration) : undefined,
    raiz: o.root ?? WT,
  });
  console.log(JSON.stringify(r, null, 2));
}
```

- [ ] **Step 10: Rodar a suíte inteira**

```bash
cd "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools" && npm test
```

Esperado: todos os arquivos de teste passam, resumo com `fail 0`. O teste de vídeo leva até 1 min: o padrão sintético `testsrc2` estoura 2 MB em 1920/crf 26 (medido: 2,82 MB) e o laço cai para 1280/crf 26 (0,80 MB) — isso exercita as tentativas de propósito.

- [ ] **Step 11: Implementar `grid.mjs` e `info.mjs` e fazer o teste de fumaça**

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/grid.mjs`:

```js
#!/usr/bin/env node
// Desenha uma grade de 100 px com as coordenadas, para escolher caixas de recorte e de comparação.
// Uso: node grid.mjs --in <imagem> --out <png>
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { opcoes } from './lib/cli.mjs';

const o = opcoes(process.argv.slice(2));
if (!o.in || !o.out) {
  console.error('Uso: node grid.mjs --in <imagem> --out <png>');
  process.exit(2);
}
const base = await sharp(o.in).rotate().png().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = base.info;
const passo = 100;
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">`;
for (let x = 0; x <= w; x += passo) {
  svg += `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="#00e5ff" stroke-width="2"/><text x="${x + 4}" y="18" font-family="sans-serif" font-size="16" fill="#00e5ff">${x}</text>`;
}
for (let y = 0; y <= h; y += passo) {
  svg += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="#00e5ff" stroke-width="2"/><text x="4" y="${y + 18}" font-family="sans-serif" font-size="16" fill="#00e5ff">${y}</text>`;
}
svg += '</svg>';
fs.mkdirSync(path.dirname(o.out), { recursive: true });
await sharp(base.data).composite([{ input: Buffer.from(svg), left: 0, top: 0 }]).png().toFile(o.out);
console.log(JSON.stringify({ saida: o.out, largura: w, altura: h }));
```

Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/info.mjs`:

```js
#!/usr/bin/env node
// Mostra formato e dimensões. Uso: node info.mjs <arquivo> [<arquivo> ...]
import sharp from 'sharp';

for (const arquivo of process.argv.slice(2)) {
  try {
    const m = await sharp(arquivo).metadata();
    console.log(JSON.stringify({ arquivo, formato: m.format, largura: m.width, altura: m.height }));
  } catch (e) {
    console.log(JSON.stringify({ arquivo, erro: e.message }));
  }
}
```

```bash
T="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools"
W="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/work"
ffmpeg -v error -y -f lavfi -i color=c=0xF1DCD6:s=640x480 -frames:v 1 "$W/fumaca.png"
node "$T/info.mjs" "$W/fumaca.png"
node "$T/grid.mjs" --in "$W/fumaca.png" --out "$W/fumaca-grade.png"
```

Esperado: `{"arquivo":".../fumaca.png","formato":"png","largura":640,"altura":480}` e `{"saida":".../fumaca-grade.png","largura":640,"altura":480}`. Abra `fumaca-grade.png` com a ferramenta Read: linhas ciano a cada 100 px com os números. Depois apague: `rm "$W/fumaca.png" "$W/fumaca-grade.png"`.

- [ ] **Step 12: Confirmar que nada foi para o git**

```bash
git -C "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/.worktrees/midia" status --short
```

Esperado: saída vazia.

---

### Task 4: Coleta no Instagram — Dra., clínica, equipe e detalhes; bio, linktree e registro

**Files:**
- Create: `media-src/coleta.json`, `media-src/raw/instagram/dra/*`, `media-src/raw/instagram/clinica/*`, `media-src/textos/bios.md`
- Modify (worktree): `docs/media-pendencias.md` (seções "Dados encontrados para o checklist da clínica" e, se preciso, "Arquivos dispensados")

**Interfaces:**
- Consumes: `check-coleta.mjs`, `info.mjs` (Tasks 2–3); esquema de `coleta.json` (seção "Mapa de arquivos"); P1, P2 e JS-1 a JS-4 ("Procedimentos comuns").
- Produces: entradas em `coleta.json` com `categoria` `dra`, `recepcao`, `sala`, `equipe`, `detalhes` (cada uma com `post`, `cdn`, `arquivo`, `largura`, `altura`, `pessoas`); pelo menos uma `recepcao` com `"pessoas": "ninguém"` quando existir (fonte da foto viva, Task 11); `textos/bios.md`; achados de profissão/registro nas pendências.

Use P1, P2 e os trechos JS-1 a JS-4 da seção "Procedimentos comuns".

- [ ] **Step 1: Abrir o navegador**

Aplique P1. Crie `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/coleta.json` com o conteúdo `[]` se ainda não existir.

- [ ] **Step 2: Perfil da Dra. e bio**

`navigate` com `{ "tabId": <tabId>, "url": "https://www.instagram.com/dra.lauratavares/" }`; `computer` com `{ "action": "screenshot", "tabId": <tabId> }`. Se aparecer tela de login, pare e peça ao usuário que entre no Instagram nesse Chrome (o plano não digita senha). Chame `get_page_text` com `{ "tabId": <tabId> }` e copie o texto do cabeçalho do perfil (bio, links, números) para `media-src/textos/bios.md` sob o título `## @dra.lauratavares`.

Esperado: `bios.md` com a bio literal da Dra.

- [ ] **Step 3: Listar os posts da Dra.**

Rode JS-2 até haver 36 posts ou o número parar de crescer (entre execuções, `computer` com `{ "action": "wait", "duration": 2, "tabId": <tabId> }`). Rode JS-1 e salve a saída em `media-src/textos/posts-dra.json`. Tire `screenshot` da grade para ver as miniaturas.

Esperado: `posts-dra.json` com 36 ou mais URLs de post.

- [ ] **Step 4: Baixar as candidatas da Dra.**

Critérios (spec, Fotografia): só a Dra. na foto; **hero** = meio corpo, olhando para a câmera, sorriso aberto, de preferência blazer off-white ou nude, recepção (parede rosa/letreiro dourado) desfocada ao fundo, rosto nítido, sem texto sobreposto; **sobre** = retrato com o vestido vermelho se existir (senão outra roupa, fundo neutro claro), foto diferente da do hero. Escolha de 2 a 4 candidatas e baixe cada uma com P2 (pasta `dra`, ids `dra-01`, `dra-02`…). Exemplo de entrada na coleta, trocando os valores marcados pelos reais: `{ "id": "dra-01", "categoria": "dra", "queixa": null, "perfil": "dra.lauratavares", "post": "<URL do post>", "cdn": "<URL baixada>", "arquivo": "raw/instagram/dra/dra-01.jpg", "largura": 1080, "altura": 1350, "pessoas": "só a Dra.", "nota": "meio corpo, blazer off-white, recepção desfocada" }`.

Esperado: um arquivo por candidata em `media-src/raw/instagram/dra/` e uma entrada por arquivo em `coleta.json`.

- [ ] **Step 5: Perfil da clínica: bio, recepção, sala, equipe e detalhes**

Repita os Steps 2–4 em `https://www.instagram.com/clinicalauratavaress/` (bio em `bios.md` sob `## @clinicalauratavaress`; posts em `textos/posts-clinica.json`; arquivos em `raw/instagram/clinica/`, ids `rec-01`, `sala-01`, `equipe-01`, `det-01`…). Critérios: **recepcao** = parede rosa com o letreiro dourado "Dra. Laura Tavares" inteiro e legível — procure ao menos uma **sem nenhuma pessoa** (`"pessoas": "ninguém"`), que é a única fonte permitida para a foto viva; **sala** = sala de procedimentos sem paciente; **equipe** = equipe em frente ao letreiro; **detalhes** = produtos coreanos, flores, mármore, sem pessoas. Registre em `pessoas` exatamente quem aparece.

- [ ] **Step 6: Profissão, conselho e registro**

Rode JS-4 nos dois perfis abertos, em `https://linktr.ee/Dralauratavaress` (`navigate` + `get_page_text` + JS-4) e nos 12 posts mais recentes da Dra. (JS-3 devolve a `legenda`; procure as mesmas palavras de JS-4). Em `docs/media-pendencias.md`, seção `## Dados encontrados para o checklist da clínica`, escreva uma linha por achado: `- Profissão/conselho/registro: "<trecho exato>" — fonte: <URL>`. Se nada aparecer, escreva `- Profissão/conselho/registro: não encontrado na bio dos dois perfis, no linktree nem nos 12 posts mais recentes da Dra. (verificado em AAAA-MM-DD)`. Anote do mesmo jeito, se aparecerem: formação acadêmica, horário, estacionamento e o uso do número (61) 98105-1565.

- [ ] **Step 7: Verificar a coleta**

```bash
node "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/check-coleta.mjs" --grupos dra,clinica; echo "saida=$?"
```

Esperado: `OK` em `dra` (≥ 2) e nas quatro categorias da clínica, a linha `INFO ... recepção sem pessoas`, `RESULTADO: OK` e `saida=0`. Se uma categoria não tiver fonte nenhuma no Instagram, acrescente a dispensa em `docs/media-pendencias.md` (ex.: `` - `src/assets/media/clinica/sala.jpg` — AUSENTE: o perfil só mostra a sala com paciente na maca ``) e rode de novo até `saida=0`. Feche a aba: `tabs_close_mcp` com `{ "tabId": <tabId> }`.

- [ ] **Step 8: Commit**

```bash
WT="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/.worktrees/midia"
git -C "$WT" add docs/media-pendencias.md
git -C "$WT" commit -m "docs(midia): dados da coleta no Instagram para o checklist" --trailer "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" --trailer "Claude-Session: https://claude.ai/code/session_01LeX8QvmLLh9p9Zw7Zza2Nr"
```

Esperado: 1 commit com `docs/media-pendencias.md`.

---

### Task 5: Antes/depois das 4 queixas e carrossel (só recorte)

**Files:**
- Create: `media-src/raw/instagram/resultados/*`, `media-src/raw/instagram/carrossel/*` (+ entradas em `coleta.json`)
- Create (worktree): `src/assets/media/resultados/{olhar,mandibula,labios,bigode}-{antes,depois}.jpg`, `src/assets/media/carrossel/resultado-01.jpg` … `resultado-NN.jpg`
- Modify (worktree): `docs/media-manifest.md` (Arquivos entregues), `docs/media-pendencias.md` (Pedidos à clínica)

**Interfaces:**
- Consumes: P1, P2 e JS-1 a JS-3 ("Procedimentos comuns"); `grid.mjs`, `crop-pair.mjs`, `export-photo.mjs`, `check-coleta.mjs`, `verify-contract.mjs`.
- Produces: 8 arquivos de resultado (ou pares dispensados) e 6–12 do carrossel; entradas `categoria: "resultado"` com `queixa` e `categoria: "carrossel"` em `coleta.json`.

- [ ] **Step 1: Achar os antes/depois por queixa**

Aplique P1. Nos dois perfis, liste os posts com JS-2 e JS-1, abra posts cuja miniatura mostre comparação (lado a lado, em cima/embaixo ou carrossel antes→depois) e leia a legenda com JS-3. Classifique pela legenda: **olhar** = olheiras, olhar cansado, malar, maçãs do rosto; **mandibula** = mandíbula, contorno, queixo, mento; **labios** = lábios, labial, preenchimento labial; **bigode** = bigode chinês, sulco nasogeniano. Prefira posts do feed a destaques. Critérios (Fotografia): mesma luz, ângulo e distância nas duas fotos, rosto inteiro na área tratada, sem texto cobrindo a área. Selecione 1 candidata por queixa (2 se houver) e de 6 a 12 outros resultados para o carrossel (prefira imagens que não estão nos 4 blocos; repita só se faltar para chegar a 6).

- [ ] **Step 2: Baixar e registrar**

Baixe cada imagem com P2, em `raw/instagram/resultados/res-01.jpg`, `res-02.jpg`… e `raw/instagram/carrossel/car-01.jpg`…; registre em `coleta.json` com `"categoria": "resultado"` e a `queixa`, ou `"categoria": "carrossel"` e `"queixa": null`; `pessoas` = `"paciente"`. Se o antes e o depois forem fotos separadas (carrossel do post), baixe as duas e registre as duas com a mesma `queixa`.

- [ ] **Step 3: Verificar a coleta dos resultados**

```bash
node "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/check-coleta.mjs" --grupos resultados,carrossel; echo "saida=$?"
```

Esperado: `OK` nas 4 queixas e no carrossel (≥ 6), `RESULTADO: OK`, `saida=0`. Se uma queixa não tiver nenhum antes/depois publicado, acrescente nas pendências as duas dispensas do par (ex.: `` - `src/assets/media/resultados/bigode-antes.jpg` — AUSENTE: nenhum antes/depois de bigode chinês publicado nos dois perfis `` e a linha igual para `bigode-depois.jpg`); para o carrossel, a chave `src/assets/media/carrossel/`.

- [ ] **Step 4: Recortar os 4 pares**

Para cada queixa: gere a grade e abra-a com a ferramenta Read para ler as coordenadas.

```bash
T="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools"
M="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src"
node "$T/grid.mjs" --in "$M/raw/instagram/resultados/res-01.jpg" --out "$M/work/res-01-grade.png"
```

Escolha uma caixa 4:5 para o antes e outra para o depois cobrindo a mesma região do rosto (largura = altura × 4 ÷ 5, arredondada; dentro da imagem; sem os rótulos "ANTES/DEPOIS" quando der). Exemplo para um composto lado a lado 1080×1350 com o rosto inteiro em cada metade:

```bash
T="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools"
R="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/raw/instagram/resultados"
node "$T/crop-pair.mjs" --queixa labios --antes "$R/res-01.jpg" --antes-crop 0,337,540,675 --depois "$R/res-01.jpg" --depois-crop 540,337,540,675
```

Esperado: JSON `{"queixa":"labios","largura":540,"altura":675,"previa":".../work/labios-sobreposicao.png"}`. Abra a prévia com Read: na sobreposição de 50%, olhos, nariz e boca dos dois lados devem coincidir. Se estiverem deslocados, ajuste uma das caixas e rode de novo (o script sobrescreve). Nunca use `export-photo.mjs --allow-enlarge` nem upscale nesses arquivos.

- [ ] **Step 5: Exportar o carrossel**

Para cada imagem escolhida, na ordem de exibição, com numeração contínua a partir de `01`:

```bash
T="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools"
C="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/raw/instagram/carrossel"
node "$T/export-photo.mjs" --in "$C/car-01.jpg" --out src/assets/media/carrossel/resultado-01.jpg --ratio 3:4
```

Sem `--crop`, o recorte é central. Se ele cortar algum rosto, gere a grade e passe `--crop x,y,w,h` em 3:4 (largura = altura × 3 ÷ 4). Abra cada saída com Read: os dois rostos (antes e depois) precisam aparecer inteiros.

- [ ] **Step 6: Verificar o contrato dos resultados**

```bash
node "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/verify-contract.mjs" --only resultados,carrossel,extras; echo "saida=$?"
```

Esperado: `OK` (ou `DISPENSADO`) em cada arquivo de resultado, carrossel com 6–12 arquivos numerados sem buraco, `extras` OK, `RESULTADO: OK`, `saida=0`.

- [ ] **Step 7: Manifesto e pendências**

Em `docs/media-manifest.md`, seção "Arquivos entregues", uma linha por arquivo, por exemplo `` | `src/assets/media/resultados/labios-antes.jpg` | Instagram @clinicalauratavaress — <URL do post> | só recorte 4:5 (caixa 0,337,540,675) e redução para 540×675, JPEG q88 | não | — | ``. Em `docs/media-pendencias.md`, seção "Pedidos à clínica": `- Termo de autorização de imagem das pacientes destes posts: <lista de URLs usadas nos blocos e no carrossel>` e `- Se possível, enviar os originais desses antes/depois (sem a compressão do Instagram).`

- [ ] **Step 8: Commit**

```bash
WT="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/.worktrees/midia"
node "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/verify-contract.mjs" --only resultados,carrossel,manifesto,extras
git -C "$WT" add src/assets/media/resultados src/assets/media/carrossel docs/media-manifest.md docs/media-pendencias.md
git -C "$WT" commit -m "feat(midia): antes e depois das quatro queixas e carrossel de resultados" --trailer "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" --trailer "Claude-Session: https://claude.ai/code/session_01LeX8QvmLLh9p9Zw7Zza2Nr"
```

Esperado: verificador com `RESULTADO: OK` antes do commit (o grupo `manifesto` confirma que todo arquivo entregue está citado); 1 commit.

---

### Task 6: Depoimentos reais (Google Maps e destaques do Instagram)

**Files:**
- Create: `media-src/textos/google-avaliacoes.json`, `media-src/textos/instagram-depoimentos.md`
- Create (worktree): `src/content/depoimentos.json`
- Modify (worktree): `docs/media-manifest.md` (Depoimentos), `docs/media-pendencias.md` (Avisos, Pedidos à clínica)

**Interfaces:**
- Consumes: `validarDepoimentos` via `verify-contract.mjs --only depoimentos` (Task 2); P1 ("Procedimentos comuns").
- Produces: `src/content/depoimentos.json` — array de 3 a 8 objetos com exatamente as chaves `texto`, `textoOriginal`, `autor`, `tratamento`, `fonte`, `url`, `estrelas`.

JS-5 — expande os textos "Mais" das avaliações carregadas (só expande; não clica em mais nada):

```js
(() => { let n = 0; document.querySelectorAll('button').forEach((b) => { if (b.innerText.trim() === 'Mais') { b.click(); n += 1; } }); return n; })()
```

JS-6 — extrai as avaliações carregadas:

```js
(() => {
  const vistos = new Set();
  const lista = [];
  for (const el of document.querySelectorAll('div[data-review-id][aria-label]')) {
    const id = el.getAttribute('data-review-id');
    if (vistos.has(id)) continue;
    vistos.add(id);
    const rotulo = (el.querySelector('[role="img"][aria-label*="estrela"]') || { getAttribute: () => '' }).getAttribute('aria-label') || '';
    const textos = [...el.querySelectorAll('span')].map((s) => s.innerText.trim()).filter(Boolean).sort((a, b) => b.length - a.length);
    lista.push({ id, autor: el.getAttribute('aria-label'), estrelas: Number((rotulo.match(/\d/) || ['NaN'])[0]), texto: textos[0] || '' });
  }
  return JSON.stringify(lista, null, 1);
})()
```

- [ ] **Step 1: Abrir as avaliações do Google**

Aplique P1. `navigate` com `{ "tabId": <tabId>, "url": "https://www.google.com/maps/search/Cl%C3%ADnica+Laura+Tavares+Sudoeste" }`. Se vier uma lista, use `find` com `{ "tabId": <tabId>, "query": "resultado Clínica Laura Tavares no Sudoeste" }` e clique no `ref` com `computer` `{ "action": "left_click", "ref": "<ref>", "tabId": <tabId> }`. Use `find` com `{ "tabId": <tabId>, "query": "aba Avaliações" }` e clique do mesmo jeito. Tire `screenshot` para localizar o painel e role-o 5 vezes com `computer` `{ "action": "scroll", "coordinate": [<x>, <y>], "scroll_direction": "down", "scroll_amount": 10, "tabId": <tabId> }`. Não clique em "Escrever uma avaliação", "Útil", "Compartilhar" nem "Salvar".

- [ ] **Step 2: Extrair e conferir**

Rode JS-5, espere 1 s e rode JS-6. Salve a saída em `media-src/textos/google-avaliacoes.json`. Confira 3 avaliações por amostragem com `computer` `zoom` no painel: `autor`, `estrelas` e `texto` precisam bater com a tela. Se `texto` trouxer a "Resposta do proprietário" no lugar da avaliação, corrija à mão a partir do `zoom`. Ignore avaliações marcadas "Traduzido pelo Google".

Esperado: arquivo com as avaliações carregadas, conferidas por amostragem.

- [ ] **Step 3: Destaques "Depoimentos" do Instagram**

Nos dois perfis (`navigate` até `https://www.instagram.com/dra.lauratavares/` e `https://www.instagram.com/clinicalauratavaress/`), use `find` com `{ "tabId": <tabId>, "query": "destaque Depoimentos" }` e clique no `ref` com `computer` `left_click`. Para cada quadro: `screenshot` e `zoom` na área do texto; transcreva o texto literal e o nome visível em `media-src/textos/instagram-depoimentos.md`, anotando a URL do destaque (JS `location.href`) e o número do quadro. Avance com `computer` `{ "action": "key", "text": "ArrowRight", "tabId": <tabId> }`; saia com `Escape`. Nunca clique no campo de resposta nem digite nada no visualizador. Descarte quadros sem nome legível.

- [ ] **Step 4: Escolher e escrever `depoimentos.json`**

Escolha de 3 a 8 depoimentos (meta: 6): Google com 5 estrelas e 12+ palavras, ou Instagram com nome visível; prefira os que falam de naturalidade, segurança, escuta e atendimento, e varie os tratamentos. Para cada um:
- `textoOriginal`: o texto literal, inteiro.
- `texto`: até 30 palavras, só apagando trechos do original (pode trocar a pontuação na emenda e usar `…` onde cortou); sem emoji e sem quebra de linha.
- `autor`: primeiro nome + espaço + inicial do sobrenome + ponto (`Mariana S.`); se não houver sobrenome visível, não use o depoimento.
- `tratamento`: o procedimento citado no texto (ex.: `"Preenchimento labial"`), ou `null` se o texto não cita nenhum.
- `fonte`: `"google"` ou `"instagram"`.
- `url`: Google → `"https://www.google.com/maps/search/?api=1&query=Cl%C3%ADnica%20Laura%20Tavares%20Sudoeste"`; Instagram → a URL do destaque.
- `estrelas`: Google → o número de estrelas (inteiro); Instagram → `null`.

Grave `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/.worktrees/midia/src/content/depoimentos.json` com a ferramenta Write (UTF-8 sem BOM; nunca `Set-Content` do PowerShell), JSON com 2 espaços de indentação, na ordem de exibição (o mais forte primeiro).

- [ ] **Step 5: Verificar**

```bash
node "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/verify-contract.mjs" --only depoimentos; echo "saida=$?"
```

Esperado: `OK src/content/depoimentos.json — N itens`, `saida=0`. Se houver menos de 3 depoimentos reais utilizáveis, escreva em "Avisos" das pendências `- DEPOIMENTOS: só N depoimentos reais com nome e sobrenome visíveis (Google e destaques verificados em AAAA-MM-DD)` e rode de novo.

- [ ] **Step 6: Manifesto, pendências e commit**

No manifesto, seção "Depoimentos (fontes)", uma linha por item: `- <autor> — <fonte> — <url> — id/quadro de origem: <id do Google ou nº do quadro>`. Nas pendências, "Pedidos à clínica": `- Ciência/autorização dos autores dos depoimentos usados: <lista de autores e fontes>`. Feche a aba com `tabs_close_mcp`.

```bash
WT="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/.worktrees/midia"
git -C "$WT" add src/content/depoimentos.json docs/media-manifest.md docs/media-pendencias.md
git -C "$WT" commit -m "feat(midia): depoimentos reais do Google e do Instagram" --trailer "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" --trailer "Claude-Session: https://claude.ai/code/session_01LeX8QvmLLh9p9Zw7Zza2Nr"
```

Esperado: 1 commit.

---

### Task 7: Imprensa — URLs das 4 matérias

**Files:**
- Create (worktree): `src/content/imprensa.json`
- Modify (worktree): `docs/media-manifest.md` (Imprensa), `docs/media-pendencias.md` (Avisos, se faltar URL)

**Interfaces:**
- Consumes: `IMPRENSA_ESPERADA` (via `verify-contract.mjs --only imprensa`).
- Produces: `src/content/imprensa.json` com os 4 itens, na ordem, `url` validada ou `null`.

- [ ] **Step 1: Carregar as ferramentas**

ToolSearch `select:WebSearch,WebFetch`.

- [ ] **Step 2: Buscar as 4 matérias**

Uma busca `WebSearch` por item, com `"mode": "standard"`:
1. `{ "query": "Revista Orla BSB \"Laura Tavares\" 8 anos clínica Sudoeste", "mode": "standard" }`
2. `{ "query": "Diário de Brasília \"Laura Tavares\" Santa Permuta 2026 melhor atendimento", "mode": "standard" }`
3. `{ "query": "W3 Notícias \"Korean Beauty Day\" Brasília", "mode": "standard" }`
4. `{ "query": "Diário de Brasília \"Sua Voz Vale Ouro\" \"Laura Tavares\"", "mode": "standard" }`

Sem resultado útil num item, repita uma vez com `"mode": "extended"`. Ordem de preferência da URL: página da matéria no site do veículo > post oficial do veículo no Instagram > `null`.

- [ ] **Step 3: Validar cada URL**

```bash
URL="<url candidata>"
curl -sSL -A "Mozilla/5.0" -o /dev/null -w "%{http_code}\n" "$URL"
curl -sSL -A "Mozilla/5.0" "$URL" | grep -oiE "laura tavares|santa permuta|korean beauty day|sua voz vale ouro" | sort -u
```

Esperado: `200` e, conforme o item, o termo: (1) `laura tavares`; (2) `santa permuta` e `laura tavares`; (3) `korean beauty day`; (4) `sua voz vale ouro`. Se o site bloquear o curl (403), use `WebFetch` com `{ "url": "<url>", "prompt": "A página é uma matéria que cita Laura Tavares, o Santa Permuta, o Korean Beauty Day ou o livro Sua Voz Vale Ouro? Responda com o título da matéria e o trecho que cita." }`. URL que não passar vira `null`.

- [ ] **Step 4: Escrever `imprensa.json`**

Grave com a ferramenta Write `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/.worktrees/midia/src/content/imprensa.json`, trocando cada `null` pela URL validada no Step 3 (mantenha `null` onde não houver):

```json
[
  {
    "veiculo": "Revista Orla BSB",
    "titulo": "Laura Tavares celebra 8 anos e consolida clínica de estética no Sudoeste",
    "url": null
  },
  {
    "veiculo": "Diário de Brasília",
    "titulo": "Prêmio de Melhor Atendimento no Santa Permuta 2026",
    "url": null
  },
  {
    "veiculo": "W3 Notícias",
    "titulo": "Korean Beauty Day traz a Brasília as tendências da beleza coreana",
    "url": null
  },
  {
    "veiculo": "Diário de Brasília",
    "titulo": "Coautora do livro \"Sua Voz Vale Ouro\"",
    "url": null
  }
]
```

- [ ] **Step 5: Verificar**

```bash
node "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/verify-contract.mjs" --only imprensa; echo "saida=$?"
```

Esperado: `OK src/content/imprensa.json — 4 itens`, `saida=0`.

- [ ] **Step 6: Manifesto, pendências e commit**

No manifesto, seção "Imprensa (evidências)", uma linha por item: `- <veículo> — <url ou "sem URL"> — evidência: <código HTTP e termo encontrado, ou resposta do WebFetch> — buscas: <consultas usadas>`. Para cada `null`, em "Avisos" das pendências: `- IMPRENSA: <veículo> sem URL encontrada (buscas standard e extended em AAAA-MM-DD); pedir o link à clínica`.

```bash
WT="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/.worktrees/midia"
git -C "$WT" add src/content/imprensa.json docs/media-manifest.md docs/media-pendencias.md
git -C "$WT" commit -m "feat(midia): links das matérias de imprensa" --trailer "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" --trailer "Claude-Session: https://claude.ai/code/session_01LeX8QvmLLh9p9Zw7Zza2Nr"
```

Esperado: 1 commit.

---

### Task 8: Upscale conservador e exportação das fotos reais (Dra. e clínica)

**Files:**
- Create: `media-src/higgsfield/upscale/*`, `media-src/compare/*`, `media-src/work/*`
- Create (worktree): `src/assets/media/dra/hero.jpg`, `src/assets/media/dra/sobre.jpg`, `src/assets/media/clinica/{recepcao,sala,equipe,detalhes}.jpg`
- Modify (worktree): `docs/media-manifest.md`

**Interfaces:**
- Consumes: entradas `dra`, `recepcao`, `sala`, `equipe`, `detalhes` de `coleta.json` (Task 4); `export-photo.mjs`, `grid.mjs`, `compare-regions.mjs`, `info.mjs` (Task 3); P1 (só para renovar URL expirada), P3 e P4 ("Procedimentos comuns").
- Produces: as 6 fotos do contrato (ou dispensas); para a recepção, o arquivo aprovado `media-src/higgsfield/upscale/recepcao.png` (ou o original), usado na Task 11; linhas de crédito e de comparação no manifesto.

Tabela por foto:

| Destino | Escolha na coleta | Flags de exportação | Caixas para comparar |
|---|---|---|---|
| `src/assets/media/dra/hero.jpg` | `dra` com só a Dra., meio corpo, olhando para a câmera, sorriso aberto, blazer off-white ou nude de preferência, recepção desfocada ao fundo, rosto nítido | `--ratio 4:5 --min 1280x1600` | rosto da Dra. (testa ao queixo, orelha a orelha) |
| `src/assets/media/dra/sobre.jpg` | `dra` em retrato, vestido vermelho se existir (senão fundo neutro claro), foto diferente da do hero | `--ratio 4:5 --min 1200x1500` | rosto da Dra. |
| `src/assets/media/clinica/recepcao.jpg` | `recepcao` com o letreiro inteiro (de preferência a sem pessoas) | `--min-long 1600` | letreiro dourado |
| `src/assets/media/clinica/sala.jpg` | `sala` | `--min-long 1600` | região com mais detalhe fino (bancada, equipamento) |
| `src/assets/media/clinica/equipe.jpg` | `equipe` | `--min-long 1600` | uma caixa por rosto |
| `src/assets/media/clinica/detalhes.jpg` | `detalhes` | `--min-long 1600` | rótulos e textos visíveis |

Se o original já atende ao mínimo da linha, não faça upscale: exporte direto com as flags da linha.

- [ ] **Step 1: Carregar as ferramentas do Higgsfield**

ToolSearch `select:mcp__higgsfield__balance,mcp__higgsfield__transactions,mcp__higgsfield__media_import_url,mcp__higgsfield__media_upload,mcp__higgsfield__media_confirm,mcp__higgsfield__upscale_image,mcp__higgsfield__jobs_wait,mcp__higgsfield__job_display`.

- [ ] **Step 2: Levar a foto ao Higgsfield (para cada linha da tabela)**

Caso A — a foto já está na proporção final (Dra. em 4:5) ou é da clínica: `mcp__higgsfield__media_import_url` com `{ "url": "<cdn da coleta>", "type": "image" }` → `media_id`. A "imagem enviada" é o arquivo `arquivo` da coleta. Se der erro de URL expirada/403, abra o post com P1 e JS-3, pegue a URL nova, atualize `cdn` na coleta e tente uma vez; se falhar de novo, gere um PNG de trabalho sem recorte com `node "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/export-photo.mjs" --root "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src" --png --in "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/<arquivo da coleta>" --out work/<destino>.png` e envie com P4; a "imagem enviada" passa a ser esse PNG.

Caso B — a foto da Dra. precisa de recorte para 4:5 (ex.: original 1080×1920): recorte em PNG e envie.

```bash
T="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools"
M="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src"
node "$T/export-photo.mjs" --root "$M" --png --in "$M/raw/instagram/dra/dra-03.jpg" --out work/hero-recorte.png --ratio 4:5 --crop 0,120,1080,1350
```

Envie com P4 (`<nome>` = `hero-recorte`). A "imagem enviada" é `work/hero-recorte.png`.

- [ ] **Step 3: Upscale com registro de crédito**

Aplique P3 (categoria upscale, subteto 20) com `mcp__higgsfield__upscale_image`:

```json
{ "params": { "image_id": "<media_id>", "width": <largura da imagem enviada>, "height": <altura da imagem enviada>, "provider": "bytedance", "resolution": "2k", "get_cost": true } }
```

Esperado na pré-checagem: 2 créditos. `"resolution": "2k"` é a opção mais conservadora disponível (`provider` só aceita `bytedance`; a outra resolução é `4k`). Se o P3 barrar por crédito, use o original redimensionado (Step 6, caminho reprovado). Linha de crédito de exemplo: `| 1 | 2026-10-06 10:00 | upscale_image | bytedance 2k | dra/hero | <job_id> | 2 | 900.25 | 898.25 | |`.

- [ ] **Step 4: Baixar o resultado**

```bash
M="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src"
curl -sSL -o "$M/higgsfield/upscale/hero.png" -w "%{http_code} %{content_type}\n" "<url do resultado>"
node "$M/.tools/info.mjs" "$M/higgsfield/upscale/hero.png"
```

Esperado: `200 image/...` e dimensões maiores que as da imagem enviada (use a extensão que aparece na URL antes do `?`; troque `hero` pelo nome do destino).

- [ ] **Step 5: Comparar**

```bash
T="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools"
M="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src"
node "$T/grid.mjs" --in "<imagem enviada>" --out "$M/work/hero-grade.png"
```

Abra a grade com Read e escolha as caixas da linha da tabela (coordenadas da imagem enviada, mínimo 16×16). Rode:

```bash
T="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools"
M="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src"
node "$T/compare-regions.mjs" --a "<imagem enviada>" --b "$M/higgsfield/upscale/hero.png" --boxes "<x,y,w,h>" --out "$M/compare/hero-rosto.png"; echo "saida=$?"
```

Esperado: JSON com `mae` e `piorBloco` por caixa; `saida=0` (métrica aprovada: média ≤ 4 e pior bloco ≤ 10) ou `saida=3`. Abra cada lado a lado com Read e confira, rosto a rosto: formato e abertura dos olhos, sobrancelhas, nariz, boca e dentes, contorno do rosto e da mandíbula, pintas e marcas, linhas de expressão (não podem sumir), textura da pele (sem aspecto de plástico), cabelo e acessórios. Para fotos sem pessoas: o letreiro e os rótulos têm as mesmas letras, sem texto inventado. Aprovado = `saida=0` **e** nenhuma diferença visível.

- [ ] **Step 6: Exportar**

Aprovado:

```bash
T="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools"
M="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src"
node "$T/export-photo.mjs" --in "$M/higgsfield/upscale/hero.png" --out src/assets/media/dra/hero.jpg --ratio 4:5 --min 1280x1600
```

Reprovado (original redimensionado, sem IA):

```bash
T="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools"
node "$T/export-photo.mjs" --in "<imagem enviada>" --out src/assets/media/dra/hero.jpg --ratio 4:5 --min 1280x1600 --allow-enlarge
```

Troque destino e flags pela linha da tabela. Registre no manifesto: em "Comparações", `| hero | <imagem enviada> | <caixas> | <mae> | <piorBloco> | <o que conferiu> | aprovado/reprovado |`; em "Arquivos entregues", `` | `src/assets/media/dra/hero.jpg` | Instagram @dra.lauratavares — <post> | upscale bytedance 2k aprovado + recorte 4:5, JPEG q88 (ou: original ampliado sem IA) | não (foto real) | sim | ``.

- [ ] **Step 7: Verificar**

```bash
node "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/verify-contract.mjs" --only dra,clinica,manifesto,extras; echo "saida=$?"
```

Esperado: `OK` (ou `DISPENSADO` com motivo) nas 6 fotos, manifesto OK com o gasto atualizado, `RESULTADO: OK`, `saida=0`.

- [ ] **Step 8: Commit**

```bash
WT="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/.worktrees/midia"
git -C "$WT" add src/assets/media/dra src/assets/media/clinica docs/media-manifest.md docs/media-pendencias.md
git -C "$WT" commit -m "feat(midia): fotos reais da Dra. e da clínica" --trailer "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" --trailer "Claude-Session: https://claude.ai/code/session_01LeX8QvmLLh9p9Zw7Zza2Nr"
```

Esperado: 1 commit.

---

### Task 9: Vídeo do Método (Seedance 2.5: rascunho 480p → 1080p)

**Files:**
- Create: `media-src/higgsfield/video/metodo-rascunho-N.mp4`, `media-src/higgsfield/video/metodo-final.mp4`, quadros em `media-src/work/`
- Create (worktree): `public/media/metodo.mp4`, `public/media/metodo.webm`, `public/media/metodo-poster.jpg`
- Modify (worktree): `docs/media-manifest.md`

**Interfaces:**
- Consumes: `encode-video.mjs` (Task 3); P3 e P5 ("Procedimentos comuns").
- Produces: os 3 arquivos `public/media/metodo.*` (fundo da seção 6, tema "noite").

Prompt M (texto→vídeo; sem interior de clínica, sem pessoas):

> Low-key cinematic shot in a quiet room at golden hour: warm sunbeams slowly drifting through sheer blush curtains, soft glints of champagne gold on a white marble surface, white orchids softly out of focus, glowing dust floating in the light, deep warm shadows, slow continuous camera push-in, single take, no cuts, shallow depth of field, rosé and nude color grade, calm and sophisticated, no people, no hands, no faces, no text, no logos

- [ ] **Step 1: Carregar as ferramentas**

ToolSearch `select:mcp__higgsfield__balance,mcp__higgsfield__transactions,mcp__higgsfield__generate_video,mcp__higgsfield__jobs_wait,mcp__higgsfield__job_display`.

- [ ] **Step 2: Rascunho 480p**

Aplique P3 (categoria Método — rascunhos, subteto 54) com `mcp__higgsfield__generate_video`:

```json
{ "params": { "model": "seedance_2_5", "mode": "t2v", "prompt": "<prompt M>", "duration": 6, "aspect_ratio": "16:9", "generate_audio": false, "draft": true, "get_cost": true } }
```

Esperado na pré-checagem: `{"cost":{"credits":18}}`. Envie sem `get_cost`, espere com `jobs_wait`, registre a linha de crédito e baixe:

```bash
V="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/higgsfield/video"
curl -sSL -o "$V/metodo-rascunho-1.mp4" -w "%{http_code} %{content_type}\n" "<url do resultado>"
```

- [ ] **Step 3: Revisar o rascunho**

Aplique P5 com `<arquivo>` = `metodo-rascunho-1`. Esperado no `ffprobe`: duração ~6 s e altura 480; nos quadros, os critérios de P5. Reprovado: ajuste o prompt (registre a mudança no manifesto) e gere outro rascunho (`metodo-rascunho-2`, depois `-3`), no máximo 3 no total. Três reprovados: dispense nas pendências com `` - `public/media/metodo.*` — AUSENTE: <motivo> `` e pule para o Step 7.

- [ ] **Step 4: Finalizar em 1080p**

Aplique P3 (categoria Método — final, subteto 72) com:

```json
{ "params": { "model": "seedance_2_5", "draft_job_id": "<job_id do rascunho aprovado>", "generate_audio": false, "get_cost": true } }
```

Esperado na pré-checagem: custo ≤ 72. Se o servidor recusar por falta de campo, repita incluindo os mesmos `mode`, `prompt`, `duration` e `aspect_ratio` do rascunho e `"resolution": "1080p"`. Baixe para `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/higgsfield/video/metodo-final.mp4` e revise com P5 (`<arquivo>` = `metodo-final`): esperado 1920×1080, ~6 s, e os critérios de P5.

- [ ] **Step 5: Codificar**

```bash
node "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/encode-video.mjs" --in "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/higgsfield/video/metodo-final.mp4" --name metodo
```

Esperado: JSON com `mp4.bytes` e `webm.bytes` ≤ 2000000 e `poster.bytes` ≤ 250000. Abra `public/media/metodo-poster.jpg` do worktree com Read.

- [ ] **Step 6: Verificar**

```bash
node "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/verify-contract.mjs" --only metodo,manifesto,extras; echo "saida=$?"
```

Esperado: `OK` em `metodo.mp4` (h264, faststart), `metodo.webm` (vp9) e no poster; `RESULTADO: OK`; `saida=0`.

- [ ] **Step 7: Manifesto e commit**

No manifesto: em "Gerações", `### metodo` com modelo, parâmetros, prompt final, `job_id` do rascunho e do final; em "Arquivos entregues", as 3 linhas `public/media/metodo.*` com "Gerado por IA? sim" e "Pode representar a clínica real? não (ilustrativo)".

```bash
WT="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/.worktrees/midia"
git -C "$WT" add public/media docs/media-manifest.md docs/media-pendencias.md
git -C "$WT" commit -m "feat(midia): vídeo de ambiente do Método" --trailer "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" --trailer "Claude-Session: https://claude.ai/code/session_01LeX8QvmLLh9p9Zw7Zza2Nr"
```

Esperado: 1 commit.

---

### Task 10: Imagens de apoio e dos tratamentos (Recraft V4.1)

**Files:**
- Create: `media-src/higgsfield/imagens/*`
- Create (worktree): `src/assets/media/tratamentos/{harmonizacao,rejuvenescimento,kbeauty,corporal}.jpg`, `src/assets/media/apoio/{textura-seda-blush,textura-marmore-champagne,luz-arco,gotas-serum,petalas-rosa,orquideas-marmore}.jpg`
- Modify (worktree): `docs/media-manifest.md`

**Interfaces:**
- Consumes: `export-photo.mjs` (Task 3); P3 ("Procedimentos comuns").
- Produces: 4 imagens de tratamento 4:5 e 6 de apoio (kebab-case), todas ilustrativas.

Parâmetros comuns de cada requisição: `"model": "recraft_v4_1"`, `"resolution": "2k"`, `"model_type": "standard"`, `"colors": ["#FBF6F2", "#F1DCD6", "#E4B9B0", "#EBCBC3", "#B8925A", "#8C4A55", "#33241F"]` (paleta de `tokens.css` sem o vermelho assinatura). O `prompt` de cada item é a coluna Prompt seguida do sufixo S: `, editorial beauty photography, soft warm side light, late afternoon glow, shallow depth of field, rosé and nude color grade, calm and sophisticated, no people, no hands, no faces, no text, no letters, no logos, no watermark`.

| index | Destino | aspect_ratio | Prompt (antes do sufixo S) |
|---|---|---|---|
| 0 | `tratamentos/harmonizacao.jpg` | 4:5 | Still life about balance and proportion: smooth blush marble spheres and a small champagne-gold arch arranged in calm symmetry on a porcelain plinth, a single white orchid stem |
| 1 | `apoio/textura-seda-blush.jpg` | 16:9 | Full-frame macro texture of blush pink silk with soft flowing folds |
| 2 | `tratamentos/rejuvenescimento.jpg` | 4:5 | Still life about firmness and glow: an unbranded clear glass serum bottle with a dropper, golden serum droplets catching the light, white peony petals on blush silk |
| 3 | `tratamentos/kbeauty.jpg` | 4:5 | Still life of minimalist unbranded skincare: frosted glass ampoules and a white ceramic jar on wet white marble, a translucent hydrating gel swatch, gentle water ripples |
| 4 | `tratamentos/corporal.jpg` | 4:5 | Abstract still life evoking body contour: flowing nude and blush satin fabric forming soft sculptural curves over a rounded marble form |
| 5 | `apoio/textura-marmore-champagne.jpg` | 16:9 | Full-frame close-up texture of white marble with fine champagne-gold veins, polished surface |
| 6 | `apoio/luz-arco.jpg` | 16:9 | Warm late-afternoon sunlight casting the soft shadow of an arched window and delicate leaves on a plain blush plaster wall, generous empty space |
| 7 | `apoio/gotas-serum.jpg` | 4:5 | Macro of clear serum drops and tiny bubbles on glass over a soft blush background |
| 8 | `apoio/petalas-rosa.jpg` | 4:5 | Top view of pale rose petals scattered on porcelain-white linen |
| 9 | `apoio/orquideas-marmore.jpg` | 4:5 | White phalaenopsis orchids in a slim clear glass vase on a marble ledge against a blush wall, generous negative space |

- [ ] **Step 1: Carregar as ferramentas e pré-checar o custo**

ToolSearch `select:mcp__higgsfield__balance,mcp__higgsfield__transactions,mcp__higgsfield__generate_image,mcp__higgsfield__generate_image_batch,mcp__higgsfield__jobs_wait,mcp__higgsfield__job_display`. O lote não aceita `get_cost`, então pré-cheque com `mcp__higgsfield__generate_image` uma vez por proporção:

```json
{ "params": { "model": "recraft_v4_1", "prompt": "Still life about balance and proportion: smooth blush marble spheres and a small champagne-gold arch arranged in calm symmetry on a porcelain plinth, a single white orchid stem, editorial beauty photography, soft warm side light, late afternoon glow, shallow depth of field, rosé and nude color grade, calm and sophisticated, no people, no hands, no faces, no text, no letters, no logos, no watermark", "aspect_ratio": "4:5", "resolution": "2k", "model_type": "standard", "colors": ["#FBF6F2", "#F1DCD6", "#E4B9B0", "#EBCBC3", "#B8925A", "#8C4A55", "#33241F"], "get_cost": true } }
```

Repita trocando `"aspect_ratio"` para `"16:9"`. Esperado: 8 créditos nas duas proporções (pré-checado em 2026-10-05 para 4:5).

- [ ] **Step 2: Lote A (itens 0 e 1)**

Aplique P3 (categoria Recraft, subteto 120; C = 16 pelo Step 1) com `mcp__higgsfield__generate_image_batch`:

```json
{
  "requests": [
    { "index": 0, "params": { "model": "recraft_v4_1", "prompt": "Still life about balance and proportion: smooth blush marble spheres and a small champagne-gold arch arranged in calm symmetry on a porcelain plinth, a single white orchid stem, editorial beauty photography, soft warm side light, late afternoon glow, shallow depth of field, rosé and nude color grade, calm and sophisticated, no people, no hands, no faces, no text, no letters, no logos, no watermark", "aspect_ratio": "4:5", "resolution": "2k", "model_type": "standard", "colors": ["#FBF6F2", "#F1DCD6", "#E4B9B0", "#EBCBC3", "#B8925A", "#8C4A55", "#33241F"] } },
    { "index": 1, "params": { "model": "recraft_v4_1", "prompt": "Full-frame macro texture of blush pink silk with soft flowing folds, editorial beauty photography, soft warm side light, late afternoon glow, shallow depth of field, rosé and nude color grade, calm and sophisticated, no people, no hands, no faces, no text, no letters, no logos, no watermark", "aspect_ratio": "16:9", "resolution": "2k", "model_type": "standard", "colors": ["#FBF6F2", "#F1DCD6", "#E4B9B0", "#EBCBC3", "#B8925A", "#8C4A55", "#33241F"] } }
  ]
}
```

No `jobs_wait`, passe os dois jobs com os `index` 0 e 1. Registre **uma** linha de crédito para o lote, com os dois `job_id`, e baixe cada resultado (P3, item 7) para `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/higgsfield/imagens/` com o nome do arquivo de destino sem a pasta e a extensão da URL (ex.: `harmonizacao.png`, `textura-seda-blush.png`).

- [ ] **Step 3: Revisar o lote A**

Abra as duas imagens com Read. Aprovada só se: nenhuma pessoa, mão, rosto, silhueta ou estátua com rosto; nenhum texto, letra, logo, marca ou marca d'água; não parece recepção ou sala de clínica; paleta da marca e luz quente lateral; sem artefatos (objetos derretidos, simetria quebrada); tratamentos com composição centrada e respiro para card 4:5. Se o estilo inteiro falhar, ajuste o sufixo S antes do lote B e registre a mudança no manifesto.

- [ ] **Step 4: Lote B (itens 2 a 9)**

Aplique P3 (subteto 120; C = 64) com `mcp__higgsfield__generate_image_batch`:

```json
{
  "requests": [
    { "index": 2, "params": { "model": "recraft_v4_1", "prompt": "Still life about firmness and glow: an unbranded clear glass serum bottle with a dropper, golden serum droplets catching the light, white peony petals on blush silk, editorial beauty photography, soft warm side light, late afternoon glow, shallow depth of field, rosé and nude color grade, calm and sophisticated, no people, no hands, no faces, no text, no letters, no logos, no watermark", "aspect_ratio": "4:5", "resolution": "2k", "model_type": "standard", "colors": ["#FBF6F2", "#F1DCD6", "#E4B9B0", "#EBCBC3", "#B8925A", "#8C4A55", "#33241F"] } },
    { "index": 3, "params": { "model": "recraft_v4_1", "prompt": "Still life of minimalist unbranded skincare: frosted glass ampoules and a white ceramic jar on wet white marble, a translucent hydrating gel swatch, gentle water ripples, editorial beauty photography, soft warm side light, late afternoon glow, shallow depth of field, rosé and nude color grade, calm and sophisticated, no people, no hands, no faces, no text, no letters, no logos, no watermark", "aspect_ratio": "4:5", "resolution": "2k", "model_type": "standard", "colors": ["#FBF6F2", "#F1DCD6", "#E4B9B0", "#EBCBC3", "#B8925A", "#8C4A55", "#33241F"] } },
    { "index": 4, "params": { "model": "recraft_v4_1", "prompt": "Abstract still life evoking body contour: flowing nude and blush satin fabric forming soft sculptural curves over a rounded marble form, editorial beauty photography, soft warm side light, late afternoon glow, shallow depth of field, rosé and nude color grade, calm and sophisticated, no people, no hands, no faces, no text, no letters, no logos, no watermark", "aspect_ratio": "4:5", "resolution": "2k", "model_type": "standard", "colors": ["#FBF6F2", "#F1DCD6", "#E4B9B0", "#EBCBC3", "#B8925A", "#8C4A55", "#33241F"] } },
    { "index": 5, "params": { "model": "recraft_v4_1", "prompt": "Full-frame close-up texture of white marble with fine champagne-gold veins, polished surface, editorial beauty photography, soft warm side light, late afternoon glow, shallow depth of field, rosé and nude color grade, calm and sophisticated, no people, no hands, no faces, no text, no letters, no logos, no watermark", "aspect_ratio": "16:9", "resolution": "2k", "model_type": "standard", "colors": ["#FBF6F2", "#F1DCD6", "#E4B9B0", "#EBCBC3", "#B8925A", "#8C4A55", "#33241F"] } },
    { "index": 6, "params": { "model": "recraft_v4_1", "prompt": "Warm late-afternoon sunlight casting the soft shadow of an arched window and delicate leaves on a plain blush plaster wall, generous empty space, editorial beauty photography, soft warm side light, late afternoon glow, shallow depth of field, rosé and nude color grade, calm and sophisticated, no people, no hands, no faces, no text, no letters, no logos, no watermark", "aspect_ratio": "16:9", "resolution": "2k", "model_type": "standard", "colors": ["#FBF6F2", "#F1DCD6", "#E4B9B0", "#EBCBC3", "#B8925A", "#8C4A55", "#33241F"] } },
    { "index": 7, "params": { "model": "recraft_v4_1", "prompt": "Macro of clear serum drops and tiny bubbles on glass over a soft blush background, editorial beauty photography, soft warm side light, late afternoon glow, shallow depth of field, rosé and nude color grade, calm and sophisticated, no people, no hands, no faces, no text, no letters, no logos, no watermark", "aspect_ratio": "4:5", "resolution": "2k", "model_type": "standard", "colors": ["#FBF6F2", "#F1DCD6", "#E4B9B0", "#EBCBC3", "#B8925A", "#8C4A55", "#33241F"] } },
    { "index": 8, "params": { "model": "recraft_v4_1", "prompt": "Top view of pale rose petals scattered on porcelain-white linen, editorial beauty photography, soft warm side light, late afternoon glow, shallow depth of field, rosé and nude color grade, calm and sophisticated, no people, no hands, no faces, no text, no letters, no logos, no watermark", "aspect_ratio": "4:5", "resolution": "2k", "model_type": "standard", "colors": ["#FBF6F2", "#F1DCD6", "#E4B9B0", "#EBCBC3", "#B8925A", "#8C4A55", "#33241F"] } },
    { "index": 9, "params": { "model": "recraft_v4_1", "prompt": "White phalaenopsis orchids in a slim clear glass vase on a marble ledge against a blush wall, generous negative space, editorial beauty photography, soft warm side light, late afternoon glow, shallow depth of field, rosé and nude color grade, calm and sophisticated, no people, no hands, no faces, no text, no letters, no logos, no watermark", "aspect_ratio": "4:5", "resolution": "2k", "model_type": "standard", "colors": ["#FBF6F2", "#F1DCD6", "#E4B9B0", "#EBCBC3", "#B8925A", "#8C4A55", "#33241F"] } }
  ]
}
```

Se o Step 3 mudou o sufixo S, use o sufixo novo em todos os prompts acima. No `jobs_wait`, passe os 8 jobs com seus `index`. Registre **uma** linha de crédito para o lote e baixe cada resultado como no Step 2.

- [ ] **Step 5: Revisar e regenerar**

Revise como no Step 3. Regenere individualmente as reprovadas aplicando P3 com `mcp__higgsfield__generate_image` (mesmos `params` do item, com o prompt ajustado e `"count": 1`), no máximo 5 regenerações na tarefa, cada uma com sua linha de crédito. Imagem de apoio ainda reprovada: descarte (o apoio aceita de 1 a 12 arquivos). Tratamento ainda reprovado: dispense o caminho nas pendências com o motivo.

- [ ] **Step 6: Exportar**

```bash
T="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools"
I="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/higgsfield/imagens"
node "$T/export-photo.mjs" --in "$I/harmonizacao.png" --out src/assets/media/tratamentos/harmonizacao.jpg --ratio 4:5
node "$T/export-photo.mjs" --in "$I/textura-seda-blush.png" --out src/assets/media/apoio/textura-seda-blush.jpg --ratio 16:9
```

Faça o mesmo para cada imagem aprovada, com o destino e a proporção da tabela (use a extensão real do arquivo baixado).

- [ ] **Step 7: Verificar**

```bash
node "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/verify-contract.mjs" --only tratamentos,apoio,manifesto,extras; echo "saida=$?"
```

Esperado: `OK` nos 4 tratamentos (≥ 1000 px de largura, 4:5) e em cada apoio (lado maior ≥ 1600), `RESULTADO: OK`, `saida=0`.

- [ ] **Step 8: Manifesto e commit**

No manifesto: em "Gerações", `### recraft` com os parâmetros comuns, o sufixo S e, por item, prompt e `job_id`; em "Arquivos entregues", uma linha por arquivo com "Gerado por IA? sim" e "Pode representar a clínica real? não (ilustrativa; alt decorativo ou genérico, nunca 'clínica')".

```bash
WT="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/.worktrees/midia"
git -C "$WT" add src/assets/media/tratamentos src/assets/media/apoio docs/media-manifest.md docs/media-pendencias.md
git -C "$WT" commit -m "feat(midia): imagens de apoio e dos tratamentos" --trailer "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" --trailer "Claude-Session: https://claude.ai/code/session_01LeX8QvmLLh9p9Zw7Zza2Nr"
```

Esperado: 1 commit.

---

### Task 11: Foto viva da recepção (Kling 3.0) para o CTA final, e reserva

**Files:**
- Create: `media-src/work/recepcao-16x9.png`, `media-src/higgsfield/video/foto-viva-N.mp4`, quadros em `media-src/work/`
- Create (worktree, opcional): `public/media/cta-final.mp4`, `public/media/cta-final.webm`, `public/media/cta-final-poster.jpg`
- Modify (worktree): `docs/media-manifest.md`, `docs/media-pendencias.md`

**Interfaces:**
- Consumes: entrada `recepcao` com `"pessoas": "ninguém"` (Task 4) e a versão aprovada da Task 8 (`higgsfield/upscale/recepcao.png`, ou o original se o upscale foi reprovado); `export-photo.mjs`, `grid.mjs`, `compare-regions.mjs`, `encode-video.mjs`; P3, P4 e P5 ("Procedimentos comuns").
- Produces: `public/media/cta-final.*` (opcional no contrato). O contrato não tem caminho para vídeo na galeria da seção 9; a foto viva é entregue como vídeo do CTA final.

Prompt K (imagem→vídeo):

> Static locked-off camera on a real photo. The scene comes subtly alive: warm late-afternoon light slowly drifts across the pink wall and the flowers sway very gently. Everything else stays perfectly still and unchanged. The gold lettering on the wall stays sharp, legible and identical in every frame. No people, no hands, no faces, no logos, no camera movement, no new objects, no text changes.

- [ ] **Step 1: Pré-condição e ferramentas**

Confira em `coleta.json` se existe `recepcao` com `"pessoas": "ninguém"`. Se não existir, não gere nada: escreva `- FOTO VIVA: nenhuma foto da recepção sem pessoas; cta-final não gerado` em "Avisos" e vá ao Step 6. Se existir: ToolSearch `select:mcp__higgsfield__balance,mcp__higgsfield__transactions,mcp__higgsfield__media_upload,mcp__higgsfield__media_confirm,mcp__higgsfield__generate_video,mcp__higgsfield__jobs_wait,mcp__higgsfield__job_display`.

- [ ] **Step 2: Imagem inicial 16:9**

```bash
T="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools"
M="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src"
node "$T/grid.mjs" --in "<fonte da recepção>" --out "$M/work/recepcao-grade.png"
```

Abra a grade com Read e escolha uma caixa 16:9 (altura = largura × 9 ÷ 16, arredondada) que contenha o letreiro inteiro e nenhuma pessoa.

```bash
T="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools"
M="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src"
node "$T/export-photo.mjs" --root "$M" --png --in "<fonte da recepção>" --out work/recepcao-16x9.png --ratio 16:9 --crop <x,y,w,h>
```

Gere também a grade da imagem inicial, usada no Step 4: `node "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/grid.mjs" --in "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/work/recepcao-16x9.png" --out "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/work/recepcao-16x9-grade.png"`. Envie com P4 (`<nome>` = `recepcao-16x9`).

- [ ] **Step 3: Gerar**

Aplique P3 (categoria foto viva, subteto 20) com `mcp__higgsfield__generate_video`:

```json
{ "params": { "model": "kling3_0", "prompt": "<prompt K>", "medias": [{ "role": "start_image", "value": "<media_id>" }], "duration": 6, "mode": "std", "sound": "off", "aspect_ratio": "16:9", "get_cost": true } }
```

Esperado: `{"cost":{"credits":9}}`. Baixe (P3, item 7) para `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/higgsfield/video/foto-viva-1.mp4`. No máximo 2 gerações nesta tarefa: esta (`std`, 9) e uma em `"mode": "pro"` (~10,5), total ≤ 20.

- [ ] **Step 4: Checar fidelidade**

```bash
T="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools"
M="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src"
V="$M/higgsfield/video"; W="$M/work"
ffprobe -v error -show_entries stream=codec_type,width,height:format=duration -of compact=p=0 "$V/foto-viva-1.mp4"
ffmpeg -v error -y -ss 0 -i "$V/foto-viva-1.mp4" -frames:v 1 "$W/fv1-0s.png"
ffmpeg -v error -y -ss 3 -i "$V/foto-viva-1.mp4" -frames:v 1 "$W/fv1-3s.png"
ffmpeg -v error -y -sseof -0.1 -i "$V/foto-viva-1.mp4" -frames:v 1 "$W/fv1-fim.png"
node "$T/grid.mjs" --in "$W/fv1-0s.png" --out "$W/fv1-grade.png"
```

Esperado: largura ≥ 1280 e ~6 s (se a largura for menor, use a segunda geração em `"mode": "pro"` como `foto-viva-2.mp4` e repita este Step com ela). Leia a caixa do letreiro em `work/recepcao-16x9-grade.png` (coordenadas da imagem inicial) e em `work/fv1-grade.png` (coordenadas do quadro) e compare:

```bash
T="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools"
M="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src"
node "$T/compare-regions.mjs" --a "$M/work/recepcao-16x9.png" --b "$M/work/fv1-0s.png" --boxes "<letreiro na imagem inicial>" --limite-media 8 --limite-bloco 20 --out "$M/compare/foto-viva-inicio.png"; echo "saida=$?"
node "$T/compare-regions.mjs" --a "$M/work/fv1-0s.png" --b "$M/work/fv1-fim.png" --boxes "<letreiro no quadro>" --limite-media 8 --limite-bloco 20 --out "$M/compare/foto-viva-fim.png"; echo "saida=$?"
```

Esperado: `saida=0` nas duas. Abra os 3 quadros e os 2 lados a lado com Read. Aprovado só se: letreiro legível e com as mesmas letras do início ao fim; nenhum objeto novo; nenhuma pessoa; câmera parada; movimento sutil de luz/flores. Reprovado: se a segunda geração ainda não foi usada, gere em `"mode": "pro"` (mesmo procedimento, `foto-viva-2.mp4`, quadros `fv2-*`) e repita este Step. Reprovado sem tentativa restante: `- FOTO VIVA: descartada (<motivo>)` em "Avisos" e vá ao Step 6.

- [ ] **Step 5: Codificar como CTA final**

```bash
node "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/encode-video.mjs" --in "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/higgsfield/video/foto-viva-1.mp4" --name cta-final
```

Use o arquivo aprovado no Step 4 (troque por `foto-viva-2.mp4` se foi a segunda geração). Esperado: JSON com `mp4.bytes` e `webm.bytes` ≤ 2000000 e poster gravado. No manifesto, as 3 linhas `public/media/cta-final.*` com "Gerado por IA? sim (animação sutil da foto real da recepção, fidelidade conferida)" e "Pode representar a clínica real? só com o letreiro conferido; poster = primeiro quadro". Pule o Step 6.

- [ ] **Step 6: Reserva (só se a foto viva não foi entregue)**

Use a reserva só se `Gasto total + 90 ≤ 450`; ela tem no máximo 1 rascunho e 1 final (subteto 90):

1. Rascunho: aplique P3 com `mcp__higgsfield__generate_video` e `{ "params": { "model": "seedance_2_5", "mode": "t2v", "prompt": "<prompt R abaixo>", "duration": 6, "aspect_ratio": "16:9", "generate_audio": false, "draft": true, "get_cost": true } }` (esperado 18). Baixe para `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/higgsfield/video/cta-final-rascunho-1.mp4` e revise com P5 (`<arquivo>` = `cta-final-rascunho-1`; esperado altura 480). Reprovado: abandone a reserva.
2. Final: aplique P3 com `{ "params": { "model": "seedance_2_5", "draft_job_id": "<job_id do rascunho aprovado>", "generate_audio": false, "get_cost": true } }` (esperado ≤ 72; se faltar campo, inclua `mode`, `prompt`, `duration` e `aspect_ratio` do rascunho e `"resolution": "1080p"`). Baixe para `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/higgsfield/video/cta-final-final.mp4` e revise com P5 (`<arquivo>` = `cta-final-final`; esperado 1920×1080).
3. Codifique: `node "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/encode-video.mjs" --in "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/higgsfield/video/cta-final-final.mp4" --name cta-final`.

Sem crédito para a reserva (ou reserva abandonada): `- CRÉDITOS: reserva do CTA final não gerada` em "Avisos"; o grupo `cta-final` fica `OPCIONAL`.

Prompt R (texto→vídeo, sem pessoas):

> Low-key cinematic shot at golden hour: warm sunbeams slowly drifting across sheer blush curtains and a marble surface, glowing dust in the light, deep warm shadows, slow continuous camera drift, single take, no cuts, shallow depth of field, rosé and nude color grade, calm and sophisticated, no people, no hands, no faces, no text, no logos

Nas linhas do manifesto da reserva: "Pode representar a clínica real? não (ilustrativo)".

- [ ] **Step 7: Verificar e commitar**

```bash
WT="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/.worktrees/midia"
node "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/verify-contract.mjs" --only cta-final,manifesto,extras; echo "saida=$?"
git -C "$WT" add public/media docs/media-manifest.md docs/media-pendencias.md
git -C "$WT" commit -m "feat(midia): vídeo do CTA final a partir da recepção" --trailer "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" --trailer "Claude-Session: https://claude.ai/code/session_01LeX8QvmLLh9p9Zw7Zza2Nr"
```

Esperado: `OK` nos 3 arquivos `cta-final.*` ou `OPCIONAL`, `RESULTADO: OK`, `saida=0`. Se nada foi gerado, troque a mensagem do commit por `docs(midia): registro da foto viva descartada` e adicione só os dois arquivos de `docs/`.

---

### Task 12: Fechamento — verificação completa, pendências, push e PR

**Files:**
- Modify (worktree): `docs/media-manifest.md` (Saldo final), `docs/media-pendencias.md`
- Create: `media-src/textos/pr-body.md`

**Interfaces:**
- Consumes: tudo das Tasks 1–11.
- Produces: branch `feat/midia` no remoto e um PR aberto para `main` (sem merge).

- [ ] **Step 1: Suíte de testes**

```bash
cd "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools" && npm test
```

Esperado: resumo com `fail 0`.

- [ ] **Step 2: Verificação completa**

```bash
node "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/verify-contract.mjs"; echo "saida=$?"
```

Esperado: nenhum `FALHA` ou `FALTANDO` (só `OK`, `DISPENSADO`, `OPCIONAL` ou `AVISO` explicado), `RESULTADO: OK`, `saida=0`. Dispensa só vale para item cuja fonte não existe, com motivo; nunca para os JSON.

- [ ] **Step 3: Só caminhos da mídia no diff**

```bash
WT="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/.worktrees/midia"
git -C "$WT" fetch origin
git -C "$WT" diff --name-only origin/main...HEAD | grep -vE '^(src/assets/media/|public/media/|src/content/(depoimentos|imprensa)\.json$|docs/media-(manifest|pendencias)\.md$)' || echo "SÓ CAMINHOS DA MÍDIA"
```

Esperado: `SÓ CAMINHOS DA MÍDIA`.

- [ ] **Step 4: Saldo final**

`mcp__higgsfield__balance` `{}`. Troque `- Saldo final: (preenchido na Task 12)` por `- Saldo final: <credits> (AAAA-MM-DD HH:MM)`. Se `Saldo inicial − Saldo final` diferir de `Gasto total`, acrescente logo abaixo `- Diferença: <valor> — <explicação, ex.: uso da conta em outro projeto>` (confira com `mcp__higgsfield__transactions` `{ "size": 50 }`).

- [ ] **Step 5: Pendências finais**

Releia `docs/media-pendencias.md` e confirme: cada dispensa com motivo; avisos de DEPOIMENTOS, IMPRENSA, FOTO VIVA e CRÉDITOS quando aconteceram; "Dados encontrados para o checklist da clínica" com o resultado da busca de profissão/registro; "Pedidos à clínica" com termos de autorização (antes/depois e depoimentos usados), originais em alta das fotos dispensadas ou ampliadas sem IA e links de imprensa que faltaram. Rode `node "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/.tools/verify-contract.mjs"` de novo: `RESULTADO: OK`.

- [ ] **Step 6: Commit**

```bash
WT="C:/Users/botel/OneDrive/Desktop/clinicalauratavares/.worktrees/midia"
git -C "$WT" add docs/media-manifest.md docs/media-pendencias.md
git -C "$WT" commit -m "docs(midia): manifesto final e pendências da clínica" --trailer "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" --trailer "Claude-Session: https://claude.ai/code/session_01LeX8QvmLLh9p9Zw7Zza2Nr"
git -C "$WT" status --short
```

Esperado: 1 commit; `status` vazio.

- [ ] **Step 7: Push**

```bash
git -C "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/.worktrees/midia" push -u origin feat/midia
```

Esperado: branch `feat/midia` criada no remoto `git@github.com:GabrielBotelhoeng/clinicalauratavaress.git`.

- [ ] **Step 8: Abrir o PR**

Grave com a ferramenta Write `C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/textos/pr-body.md`, preenchendo os números com os valores reais do manifesto e da saída do verificador:

```markdown
## Resumo

Frente de mídia da landing da Clínica Laura Tavares: fotos reais do Instagram tratadas (upscale só com rosto conferido), antes/depois só recortados, imagens de apoio e vídeos gerados no Higgsfield sem pessoas, depoimentos reais e links de imprensa. Origem, prompts e créditos de cada arquivo em `docs/media-manifest.md`; o que falta da clínica em `docs/media-pendencias.md`.

## Entregas

- Fotos da Dra. e da clínica: <n> de 6 (dispensadas: <lista ou "nenhuma">)
- Antes/depois: <n> de 4 pares; carrossel: <n> imagens
- Tratamentos: <n> de 4; apoio: <n> imagens
- Vídeos: Método <entregue/dispensado>; CTA final <entregue/opcional não entregue>
- Depoimentos: <n>; imprensa: 4 itens (<n> com link)

## Créditos do Higgsfield

Gasto: <Gasto total> de 450 (saldo inicial <x>, final <y>).

## Checklist de validação

- [x] `npm test` em `media-src/.tools`: fail 0
- [x] `verify-contract.mjs`: RESULTADO: OK
- [x] Diff só em caminhos de propriedade da mídia
- [x] Nenhuma pessoa gerada ou animada por IA; antes/depois só recortados
- [x] Upscales aprovados por métrica e checagem visual lado a lado (registradas no manifesto)

Não fazer merge por aqui: o orquestrador revisa e faz o merge.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01LeX8QvmLLh9p9Zw7Zza2Nr
```

```bash
gh pr create --repo GabrielBotelhoeng/clinicalauratavaress --base main --head feat/midia --title "feat(midia): fotos, vídeos, depoimentos e imprensa da landing" --body-file "C:/Users/botel/OneDrive/Desktop/clinicalauratavares/media-src/textos/pr-body.md"
```

Esperado: a URL do PR.

- [ ] **Step 9: Conferir o PR e reportar**

```bash
gh pr view feat/midia --repo GabrielBotelhoeng/clinicalauratavaress --json url,state,baseRefName,headRefName
gh pr view feat/midia --repo GabrielBotelhoeng/clinicalauratavaress --json body --jq .body | tail -n 4
```

Esperado: `state` `OPEN`, `baseRefName` `main`, `headRefName` `feat/midia`; o corpo termina com a linha `🤖 Generated with [Claude Code](https://claude.com/claude-code)`, uma linha em branco e `https://claude.ai/code/session_01LeX8QvmLLh9p9Zw7Zza2Nr` (pode haver uma linha vazia final). Reporte ao orquestrador: URL do PR, gasto de créditos e resumo das pendências. **Não faça merge.** Feche abas do Chrome que ainda estiverem abertas.

---

## Auto-revisão (cobertura da spec e do contrato)

| Requisito | Onde |
|---|---|
| Coleta no Chrome, só leitura: Dra., recepção, sala, equipe, detalhes (5.3) | Task 4; restrições em Global Constraints |
| Antes/depois das 4 queixas e carrossel, só recortados (5.3, decisão 17) | Task 5 (`crop-pair.mjs` proíbe ampliar; teste na Task 3) |
| Destaques "Depoimentos" e Google, texto literal, ≤ 30 palavras, inicial (5.3, decisão 3) | Task 6; validador e testes na Task 2 |
| URLs de imprensa (premissa da seção 3) | Task 7 |
| Upscale conservador, descartar se mudar traços (5.3, risco) | Task 8 (`resolution: "2k"`, métrica + visual, fallback sem IA) |
| Vídeo do Método (Seedance, rascunho 480p → 1080p, decisão 18) | Task 9 |
| Foto viva da recepção (Kling, descartar se o letreiro deformar) e reserva | Task 11 |
| ~10 imagens de apoio com a paleta da marca (Recraft V4.1) | Task 10 |
| Nunca gerar/animar pessoas; nada gerado como clínica real | Global Constraints; checklists visuais das Tasks 9–11; coluna no manifesto |
| Teto de 450 créditos, gasto por job, prioridade | Orçamento; P3 ("Procedimentos comuns"); ordem das Tasks 8 → 11; checagem `manifesto` do verificador |
| Originais em `media-src/`, manifesto versionado, vídeos H.264 + WebM ≤ 2 MB com poster | Tasks 1, 3, 9, 11; grupo `metodo`/`cta-final` do verificador |
| Pendências da clínica 1 (registro) e 2 (termos) | Tasks 4, 5, 6, 12 |
| Contrato de caminhos e formatos; propriedade dos arquivos | Task 2 (`GRUPOS`, `PERMITIDOS`, grupo `extras`); Task 12, Step 3 |
| Commits convencionais com trailers; PR com rodapé; sem merge | Global Constraints; Tasks 1, 4–12 |

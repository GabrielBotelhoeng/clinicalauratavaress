# Landing Clínica Laura Tavares — Plano de implementação (frente de código)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir e publicar na Vercel a landing page estática da Clínica Laura Tavares — texto literal do copy, conversão 100% pelo WhatsApp, WCAG 2.2 AA e Lighthouse mobile ≥ 90 nas 4 categorias — funcionando com placeholders até a frente de mídia entregar fotos e vídeos reais.

**Architecture:** Site estático Astro 7 com duas páginas (`/` e `/politica-de-privacidade`). Todo texto/dado vive em `src/content/site.ts` (validado com zod); os componentes `.astro` leem o conteúdo e o resolvedor de mídia (`src/content/media.ts`), que cai para placeholders quando falta um arquivo do contrato. O movimento fica isolado em `src/scripts/motion/` (um módulo por padrão do `Movimento.md`, orquestrado por `gsap.matchMedia`) e só entra na Etapa 5 — antes disso o site é 100% estático. Qualidade em 3 camadas: testes unitários (Vitest), testes do HTML gerado (`tests/dist`, Vitest + linkedom) e testes de navegador (agent-browser + axe-core + Lighthouse).

**Tech Stack:** Node 22.15.1 + npm 11 · Astro 7.3.5 · TypeScript ~6.0.3 (estrito) · zod 4.6.5 · @astrojs/sitemap 3.7.4 · sharp 0.35.5 · @fontsource 5.3.0 (Cormorant Garamond, Jost, Pinyon Script) · @phosphor-icons/core 2.1.1 · GSAP 3.15.0 (ScrollTrigger + SplitText) · Lenis 1.3.26 · ESLint 9.39.5 + typescript-eslint 8.71.1 + eslint-plugin-astro 1.7.0 · Prettier 3.9.9 + prettier-plugin-astro 1.1.0 · Vitest 5.0.3 + linkedom 0.18.13 · agent-browser 0.27.0 · axe-core 4.14.0 · Lighthouse 12.8.2 (via npx) · Vercel CLI 59 · gh 2.97.

**Spec:** `docs/superpowers/specs/2026-10-05-landing-clinica-laura-tavares-design.md` — leia junto com este plano. Fontes de texto e design: `docs/copy.md` e `docs/design-system/` (criados na Task 1).

## Global Constraints

- **Ambiente:** Windows 11 + Git Bash; Node 22.15.1; npm 11.0.0 (sem pnpm/yarn). Rode tudo a partir de `C:/Users/botel/OneDrive/Desktop/clinicalauratavares` (a frente de mídia usa a worktree `.worktrees/midia`). Nada de `sleep` em primeiro plano: esperas usam `agent-browser wait`, `curl --retry` ou scripts Node.
- **Versões fixas** (verificadas em 2026-10-05 com `npm view`): astro 7.3.5, @astrojs/check 0.9.10, @astrojs/sitemap 3.7.4, typescript ~6.0.3, zod 4.6.5, sharp 0.35.5, @fontsource/cormorant-garamond 5.3.0, @fontsource/jost 5.3.0, @fontsource/pinyon-script 5.3.0, @phosphor-icons/core 2.1.1, gsap 3.15.0, lenis 1.3.26, eslint 9.39.5, @eslint/js 9.39.5, typescript-eslint 8.71.1, eslint-plugin-astro 1.7.0, globals 16.5.0, prettier 3.9.9, prettier-plugin-astro 1.1.0, vitest 5.0.3, linkedom 0.18.13, @types/node 22.20.5, axe-core 4.14.0. Instale com `npm install --save-exact` (`-D` para ferramentas); a única exceção é `typescript@~6.0.3`.
- **Armadilhas de versão** (antes de "atualizar" qualquer pacote rode `npm view <pacote> peerDependencies engines`): typescript-eslint 8.71.1 exige `typescript >=4.8.4 <6.1.0` — TypeScript 7 quebra o lint; eslint-plugin-astro 2.x/3.x exige Node `^22.22.3` — por isso 1.7.0 com ESLint 9; Lighthouse 13 exige Node ≥ 22.19 — por isso `npx --yes lighthouse@12.8.2`.
- **Fontes @fontsource:** o export `"./*"` aponta para `./*.css`; importe exatamente `@fontsource/<família>/latin-<peso>.css` ou `latin-<peso>-italic.css`, e para preload `@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2?url` (caminhos conferidos no pacote 5.3.0).
- **Texto:** todo texto visível sai de `src/content/site.ts`, cópia literal de `docs/copy.md` (acentos, travessões, `·`, aspas). O trecho em itálico rosé de cada título é o campo `em` de `RichTitle`, igual ao itálico do PDF. Microtextos que o copy não traz (rótulos de acessibilidade, "Antes"/"Depois", "Abrir no Google Maps"/"Abrir no Waze", política de privacidade) ficam em `site.ui`, `site.results`, `site.finalCta` e `site.privacy`, exatamente como escritos neste plano — não invente outros.
- **Idioma e arquivos:** identificadores de código em inglês; texto visível em pt-BR; UTF-8 sem BOM e fim de linha LF (garantido pelo `.gitattributes` da Task 1).
- **WhatsApp:** número `5561981007522`; links só via `whatsappLink()` no formato `https://api.whatsapp.com/send?phone=5561981007522&text=<encodeURIComponent(mensagem)>`. Mensagens literais: geral (hero, CTA final e todos os demais CTAs de agendamento) "Olá! Vim pelo site e gostaria de agendar uma avaliação com a Dra. Laura."; resultados "Olá! Vi os resultados no site e quero saber mais sobre {olheiras | mandíbula | lábios | bigode chinês}."; tratamentos "Olá! Tenho interesse em {tratamento}. Podem me ajudar?"; FAQ "Olá! Tenho uma dúvida antes de agendar.". Todo link de WhatsApp leva `data-wa-origin` com um destes valores: `hero`, `nav`, `nav-menu`, `floating`, `treatment`, `result`, `method`, `about`, `testimonials`, `faq`, `final`, `footer`.
- **Compliance (não negociável):** nunca prometer resultado, duração exata ou "sem dor"; sem preço nem "promoção"; todo antes/depois e o carrossel exibem "Imagens publicadas com autorização. Resultados variam de pessoa para pessoa."; nunca inventar depoimento; com registro profissional pendente o rodapé mostra só "Responsável técnica: Dra. Laura Tavares" e a linha de credenciais do Sobre não aparece.
- **Design system:** só tokens de `src/styles/tokens.css` (`var(--…)`) e classes `lt-*` de `src/styles/bundle.css`; rosewood (`--accent`) é a cor dos botões; `--highlight` aparece exatamente uma vez (estrela do selo do hero, com `data-highlight`); Pinyon Script só na assinatura "Laura Tavares"; numerais em `--gold-ink` (o `--gold` dá 2,7:1 e reprova no axe — desvio documentado em `global.css`); fotos com `radius-lg` ou arco; container 1200px/12 colunas, gutter `space-6`/`space-8`, seções `space-24` (mobile) / `space-32` (desktop), fundos alternando claro → rosado, seções noite com `data-theme="noite"`.
- **Imagens:** sempre `<Picture>` de `astro:assets` com `formats={['avif', 'webp']}`, `widths` e `sizes`; só a foto do hero tem `priority`. Toda imagem de mídia recebe `data-slot={resolved.slot}`, `data-placeholder` quando `resolved.isPlaceholder`, `style={`object-position: ${resolved.position}`}` e `alt={altText(resolved, '<alt do copy>')}` (alt vazio enquanto for placeholder).
- **Movimento:** "seda, não fogos de artifício" — sem bounce/elastic, rotações, piscar, partículas ou cursor custom; `ease-lux` = `expo.out`, `ease-silk` = `power3.inOut`; `gsap.matchMedia().add()` sempre com as três condições `isDesktop: '(min-width: 1024px)'`, `isMobile: '(max-width: 1023.98px)'`, `reduceMotion: '(prefers-reduced-motion: reduce)'` (o handler só roda se alguma casar). Nada de View Transitions/`<ClientRouter />`. O "pin" do Sobre é CSS `position: sticky` — o `pin` do ScrollTrigger embrulha o elemento num `.pin-spacer` (o `nextElementSibling` vira `null`); se algum dia usar `pin`, nunca navegue o DOM a partir do elemento fixado. Conteúdo sempre visível sem JS: estados iniciais escondidos só sob `html.js` (Etapa 5), com failsafe de 4 s.
- **Mobile:** carrossel em 1 fileira com deslize, sem pin e sem parallax; slider por toque e teclado; sem rolagem horizontal em 375 px e 320 px.
- **LGPD/privacidade:** sem formulário, cookies, analytics ou embeds; fontes self-hosted; nenhuma requisição a terceiros no carregamento. O "mapa" é um cartão de endereço com os botões "Abrir no Google Maps" e "Abrir no Waze" — sem embed e sem imagem de mapa (simplificação do item "mapa como imagem + link" da spec, por LGPD/performance; registrada no HANDOFF).
- **Performance:** Lighthouse mobile ≥ 90 em Performance, Acessibilidade, Boas práticas e SEO (`npm run lighthouse`) ao fechar as Etapas 2 a 7; vídeos mudos, com poster, carregados só perto da viewport.
- **Acessibilidade:** WCAG 2.2 AA — landmarks, skip link, foco visível (2px `--focus`), contraste AA, alvos ≥ 44px, slider por teclado, botão de pausa em toda faixa que se move sozinha, alternativa com movimento reduzido; axe-core sem violações `serious`/`critical`.
- **Contrato de arquivos com a mídia:** o código NUNCA cria nem edita `src/assets/media/**`, `public/media/**`, `src/content/depoimentos.json`, `src/content/imprensa.json`, `docs/media-manifest.md`, `docs/media-pendencias.md` nem `media-src/`, e tudo funciona sem eles.
- **Qualidade por tarefa:** antes de cada commit rode `npm run format` e depois `npm run lint && npm run typecheck && npm test`; tarefas que tocam páginas rodam também `npm run build && npm run test:dist`.
- **Git:** uma branch por etapa (`feat/<etapa>`); commits convencionais em português (`feat:`, `fix:`, `chore:`, `docs:`, `test:`) terminando com a linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; implementadores só fazem `git add`/`git commit` na branch da etapa. Push, PR, merge e o retorno à `main` ficam com o ORQUESTRADOR (tarefas de fechamento).

## Review Focus

1. **Mídia fora do contrato** (`dra/Hero.jpg`, `.JPG`, `resultado-1.jpg`, arquivo duplicado): o build deve listar "arquivo ignorado"/"arquivo duplicado" e "placeholder em uso", nunca trocar a foto em silêncio — teste em Task 6 (`reportLines`) e auditoria em Task 31.
2. **JSON da mídia malformado ou incompleto** (`depoimentos.json` com texto acima de 30 palavras, `estrelas: 0`, campo extra, URL `javascript:`; `imprensa.json` com menos de 4 itens ou `url: ""`): build falha com mensagem clara apontando o arquivo, ou renderiza só os itens válidos de imprensa — testes em Task 13 e Task 21.
3. **Detalhe do WhatsApp com caracteres especiais** (`+` de "40+", `&`, `#`, `?`, `$&`, acentos): a mensagem precisa chegar intacta — teste em Task 5.
4. **Telas estreitas (320–375 px) com palavras longas** ("Harmonização", "Rejuvenescimento 40+", "@clinicalauratavaress"): sem rolagem horizontal nem texto cortado — `overflow-wrap: anywhere` no rodapé (Task 24) e verificação em 320 e 375 px no e2e (Task 35).
5. **JS bloqueado ou lento** (CDN falha, 3G): o conteúdo não pode ficar escondido — failsafe de 4 s remove `html.js`; teste do HTML em Task 26 e teste com scripts bloqueados no e2e (Task 35).

## File Structure

```
.gitattributes                    LF em tudo, binários marcados (Task 1)
astro.config.mjs                  site, saída estática em formato file, sitemap, scripts nunca inline
package.json / package-lock.json  scripts npm e versões fixas
tsconfig.json                     astro/tsconfigs/strict
eslint.config.js                  flat config: @eslint/js + typescript-eslint + eslint-plugin-astro
.prettierrc.json / .prettierignore
vitest.config.ts                  testes unitários (src/**/*.test.ts, scripts/**/*.test.mjs)
vitest.dist.config.ts             testes do HTML gerado (tests/dist/**/*.test.ts)
vercel.json                       cabeçalhos de segurança + CSP gerado do dist (Task 36)
docs/
  fontes/                         PDF do copy, zip do design system, txt de apoio (originais)
  design-system/                  design system descompactado (referência, não é importado)
  copy.md                         copy transcrito — fonte de todo texto
  HANDOFF.md                      estado, decisões e próximo passo (atualizado por etapa)
  CHECKLIST-CLINICA.md            pendências da clínica + pendências de mídia (Task 33)
  qa/                             capturas, lighthouse.md, e2e.md (lighthouse/*.json fica fora do git)
public/
  favicon.svg, apple-touch-icon.png, og.jpg   ícones e Open Graph (og.jpg final na Task 32)
  media/                          VÍDEOS DA FRENTE DE MÍDIA (não tocar)
scripts/
  make-placeholders.mjs           gera placeholders, apple-touch-icon e og provisória (sharp)
  with-preview.mjs                sobe astro preview, roda um comando com BASE_URL, derruba
  lighthouse.mjs                  roda Lighthouse 12.8.2 e grava docs/qa/lighthouse.md
  shot.sh                         captura rápida de uma âncora em várias larguras
  e2e.sh, e2e-check-logs.mjs      suíte agent-browser + axe-core (Task 35)
  csp.mjs                         gera/confere o CSP do vercel.json (Task 36)
  lib/lighthouse-summary.mjs, lib/browser-logs.mjs, lib/csp.mjs (+ *.test.mjs)
  og/template.html, og/serve.mjs, og/render.sh   imagem Open Graph (Task 32)
src/
  content/
    site.ts                       schema zod + TODO texto/dado do site
    pending.ts                    findNullPaths/getPath/listPending (campos pendentes)
    media.ts                      resolvedor de mídia + placeholders + relatório
    press.ts                      imprensa.json (mídia) ou itens do copy
    testimonials.ts               depoimentos.json (mídia) validado
    depoimentos.json, imprensa.json   ARQUIVOS DA FRENTE DE MÍDIA (não tocar)
  lib/
    text.ts, whatsapp.ts, seo.ts, svg.ts, navbar.ts, before-after.ts, carousel.ts,
    public-media.ts, credentials.ts, maps.ts, counter.ts   (lógica pura, cada uma com *.test.ts)
  assets/
    placeholders/                 portrait|landscape|tall|before|after.jpg (gerados)
    media/                        FOTOS DA FRENTE DE MÍDIA (não tocar)
  styles/
    index.ts                      ordem de importação: fontes → tokens → bundle → global
    tokens.css, bundle.css        portados do design system (sem Google Fonts)
    global.css                    base, layout, tipografia responsiva, foco, skip link, movimento
  layouts/BaseLayout.astro        <head> com SEO/OG/JSON-LD, skip link, slots, script de movimento
  components/
    icons/Icon.astro, icons/registry.ts
    Button, RichTitle, SectionHeading, WhatsAppFloat, Marquee, Navbar, Hero, PressStrip,
    TreatmentCard, Treatments, BeforeAfter, BenefitResult, Results, ResultsCarousel,
    BackgroundVideo, MethodSteps, StatBlock, About, Testimonial, Testimonials, ClinicGallery,
    FAQ, FinalCTA, Footer (.astro)
  scripts/
    lazy-video.ts                 vídeos de fundo carregados perto da viewport
    motion/                       index (orquestrador), conditions, types, lenis, titles, cards,
                                  reduced, arches, parallax, signature, velocity, marquee,
                                  carousel, before-after-hint, counters
  pages/index.astro, pages/politica-de-privacidade.astro, pages/robots.txt.ts
tests/dist/                       load.ts + um *.test.ts por área da página
```

## Contrato com a frente de mídia (resumo)

| Arquivo (dono: mídia) | Uso no código | Sem o arquivo |
|---|---|---|
| `src/assets/media/dra/hero.jpg`, `dra/sobre.jpg` (4:5) | Hero, Sobre | placeholder `portrait` |
| `src/assets/media/clinica/{recepcao,sala,equipe,detalhes}.jpg` | A clínica | placeholder `landscape` |
| `src/assets/media/resultados/{olhar,mandibula,labios,bigode}-{antes,depois}.jpg` | BeforeAfter | placeholders `before`/`after` |
| `src/assets/media/carrossel/resultado-NN.jpg` (NN = 01…12) | ResultsCarousel | 6 placeholders `tall` |
| `src/assets/media/tratamentos/{harmonizacao,rejuvenescimento,kbeauty,corporal}.jpg` | TreatmentCard | card com ícone |
| `src/assets/media/apoio/*.jpg` | `media.support(nome)` (Etapa 6) | nada |
| `public/media/metodo.{mp4,webm}`, `metodo-poster.jpg` | fundo do Método | fundo noite liso |
| `public/media/cta-final.{mp4,webm}`, `cta-final-poster.jpg` | fundo do CTA final | fundo noite liso |
| `src/content/depoimentos.json` | Depoimentos | seção não renderiza |
| `src/content/imprensa.json` | Na mídia (com links) | itens do copy sem link |

## Convenções de execução

- **Gate completo:** `npm run check` = `lint` (ESLint + `prettier --check`) → `typecheck` (`astro check`) → `test` → `build` → `test:dist`. A partir da Task 36 o `check` também roda `csp:check`.
- **Conferência visual durante as tarefas:** `npm run build && node scripts/with-preview.mjs bash scripts/shot.sh "#ancora" 375 1280` grava `.e2e-tmp/<ancora>-<largura>.png`; abra as imagens com a ferramenta Read e compare com `docs/design-system/components/<Componente>/preview.html`.
- **Commit (modelo):**

```bash
git add <arquivos da tarefa>
git commit -m "$(cat <<'EOF'
feat: <resumo em português>

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

- **Tarefas de fechamento** (Tasks 9, 15, 19, 25, 30, 34, 40) e a **Task 38 (deploy)** são executadas pelo ORQUESTRADOR. Ele cria o PR com o corpo indicado (terminando em `🤖 Generated with [Claude Code](https://claude.com/claude-code)`) e acrescenta ao PR e à mensagem do commit de squash as demais linhas de atribuição exigidas pela sessão dele.
- **Saídas de build esperadas:** `npm run build` imprime avisos `[pendente] …` (7 itens) e `[mídia] …` (slots em placeholder) — são relatórios, não erros.

---

## Etapa 1 — `feat/fundacao`

### Task 1: Pré-voo, `.gitattributes` e materiais de origem em `docs/`

**Files:**
- Create: `.gitattributes`
- Move: `Copy — Landing Page Clínica Laura Tavares.pdf`, `design-system-laura-tavares.zip`, `instagram e sites de apoio.txt` (raiz) → `docs/fontes/`
- Create (descompactado): `docs/design-system/**`
- Create: `docs/copy.md`

**Interfaces:**
- Consumes: nada.
- Produces: `docs/copy.md` (fonte literal de todo texto, usada na Task 4), `docs/design-system/tokens.css` e `docs/design-system/components/bundle.css` (portados na Task 3), `.gitattributes` (LF garantido para os scripts `.sh` e o `prettier --check`).

- [ ] **Step 1: Conferir a pré-condição na main**

```bash
git checkout main && git pull --ff-only
test -f docs/superpowers/specs/2026-10-05-landing-clinica-laura-tavares-design.md \
  && test -f docs/superpowers/plans/2026-10-05-landing-site.md \
  && grep -q '^media-src/' .gitignore && echo PRE-OK
ls "Copy — Landing Page Clínica Laura Tavares.pdf" design-system-laura-tavares.zip "instagram e sites de apoio.txt"
```

Expected: `PRE-OK` e os três arquivos listados. Se faltar algo: PARE e peça ao orquestrador para mergear a branch `docs/design-e-plano` na `main` (ou devolver os arquivos de origem à raiz).

- [ ] **Step 2: Criar a branch da etapa**

```bash
git checkout -b feat/fundacao
```

- [ ] **Step 3: Criar `.gitattributes`** (o `core.autocrlf=true` global desta máquina converteria os arquivos para CRLF no checkout, quebrando `prettier --check` e os scripts bash)

```gitattributes
* text=auto eol=lf
*.pdf binary
*.zip binary
*.jpg binary
*.jpeg binary
*.png binary
*.webp binary
*.avif binary
*.ico binary
*.woff2 binary
*.mp4 binary
*.webm binary
```

- [ ] **Step 4: Mover os originais e descompactar o design system**

```bash
mkdir -p docs/fontes
mv "Copy — Landing Page Clínica Laura Tavares.pdf" design-system-laura-tavares.zip "instagram e sites de apoio.txt" docs/fontes/
unzip -q docs/fontes/design-system-laura-tavares.zip -d docs/
mv docs/design-system-laura-tavares docs/design-system
ls docs/design-system docs/design-system/components
```

Expected: `Fotografia.md  Movimento.md  README.md  components  index.html  tokens.css  tokens.json` e as pastas `BeforeAfter BenefitResult Button Cover FAQ Hero Marquee Navbar PressStrip ResultsCarousel StatBlock Testimonial TreatmentCard WhatsAppFloat` + `bundle.css`.

- [ ] **Step 5: Criar `docs/copy.md`** (transcrição fiel do PDF, com o itálico de cada título — confira contra `docs/fontes/Copy — Landing Page Clínica Laura Tavares.pdf` abrindo-o com a ferramenta Read, páginas 1-8)

````markdown
# Copy — Landing Page Clínica Laura Tavares

> Transcrição fiel de `docs/fontes/Copy — Landing Page Clínica Laura Tavares.pdf` (5 out. 2026, @Gabriel Botelho), com as quebras de linha do PDF corrigidas. *Itálico* e **negrito** como no PDF. Todo texto visível do site sai daqui, via `src/content/site.ts`.

## Antes de usar

Toda a página gira em uma promessa: **rejuvenescer sem deixar de ser você**. Cada seção prova essa frase com números reais (+25 mil atendimentos, 9 anos de experiência, 8 anos de clínica, AMWC Coreia 2026) e termina com um convite para a avaliação.

**Público:** mulheres de 35 a 60 anos do Sudoeste, Noroeste, Asa Sul e Cruzeiro, com renda alta, que querem parecer descansadas e não "feitas".

**Tom:** próximo, seguro, elegante. Você, nunca "a gente" no institucional. Frases curtas. A palavra em *itálico* no título é a que entra em itálico rosé no design.

**Regras de compliance (não negociáveis):**

- Nunca prometer resultado, duração exata ou "sem dor".
- Antes/depois só com termo de autorização e a legenda "Resultados variam de pessoa para pessoa".
- Sem preço de procedimento nem "promoção".
- Rodapé com nome completo, profissão e número de registro no conselho.

Trechos entre [colchetes] são dados que a clínica precisa confirmar.

## 1. Faixa marquee e navbar

**Marquee (loop, separador ✦):** +25 mil atendimentos ✦ *Harmonização facial* ✦ 9 anos de experiência ✦ *AMWC Coreia 2026* ✦ Melhor Atendimento · Santa Permuta 2026 ✦ *K-Beauty na clínica* ✦ Sudoeste · Brasília

**Navbar:** Início · Tratamentos · Resultados · A Dra. Laura · A clínica · Dúvidas · botão **Agendar avaliação**

## 2. Hero

**Eyebrow:** HARMONIZAÇÃO FACIAL · SUDOESTE, BRASÍLIA

**Headline (principal):** Rejuvenescer sem deixar de *ser você.*

**Subtítulo:** Protocolos individuais para a pele 40+, com naturalidade, segurança e planejamento. Do jeito que a Dra. Laura Tavares já fez em mais de 25 mil atendimentos.

**CTA primário:** Agendar minha avaliação **CTA secundário:** Ver resultados reais

**Selos abaixo dos botões:** ★ Melhor Atendimento — Santa Permuta 2026 · Formação internacional — AMWC Coreia 2026

**Badge flutuante na foto:** +25 mil atendimentos realizados

**Headlines alternativas para teste A/B** (fora do escopo desta entrega):

- Seu rosto mais jovem. *Sua identidade intacta.*
- Pareça descansada, *não diferente.*
- Descubra o que está *envelhecendo o seu rosto.* (gancho da bio do Instagram)

## 3. Na mídia

**Eyebrow:** NA MÍDIA

**Linha de apoio (opcional):** Uma trajetória reconhecida pela imprensa de Brasília.

**Itens (cada um linka para a matéria):**

- Revista Orla BSB — "Laura Tavares celebra 8 anos e consolida clínica de estética no Sudoeste" (capa, edição nº 4)
- Diário de Brasília — Prêmio de Melhor Atendimento no Santa Permuta 2026
- W3 Notícias — Korean Beauty Day traz a Brasília as tendências da beleza coreana
- Diário de Brasília — Coautora do livro "Sua Voz Vale Ouro"

## 4. Tratamentos assinatura

**Eyebrow:** TRATAMENTOS

**Título:** Cuidado avançado, *do seu jeito.*

**Lead:** Cada tratamento começa com uma avaliação do seu rosto. Nada de fórmula pronta: o plano é desenhado para os seus traços e para o que você quer sentir ao se olhar no espelho.

| Card | Título | Texto | Link |
|---|---|---|---|
| 1 | Harmonização facial | Equilíbrio e proporção que realçam os traços que fazem de você quem você é. | Saiba mais |
| 2 | Rejuvenescimento 40+ | Bioestimuladores e protocolos regenerativos para devolver firmeza e viço, sem rosto congelado. | Saiba mais |
| 3 | K-Beauty na clínica | Tecnologias e produtos trazidos da Coreia para uma pele saudável, hidratada e luminosa. | Saiba mais |
| 4 | Harmonização corporal | Protocolos para contorno e qualidade da pele do corpo, com o mesmo olhar de naturalidade. | Saiba mais |

[Confirmar com a Dra. a lista final de procedimentos e se o corporal entra na landing.]

## 5. Resultados por queixa

**Eyebrow:** RESULTADOS REAIS

**Título da seção:** Naturalidade que *se vê*, não que se nota.

**Lead:** O espelho conta o que incomoda. A Dra. Laura trata a causa, com sutileza, para que as pessoas percebam você mais descansada, e não "diferente".

Cada bloco: número, título, texto, CTA **Agendar minha avaliação** e legenda sob as fotos: "Imagens publicadas com autorização. Resultados variam de pessoa para pessoa."

- **01 — Adeus ao *olhar de cansaço*** Aquela aparência de quem dormiu pouco, mesmo depois de uma boa noite. Repor o volume das maçãs do rosto e suavizar as olheiras devolve vitalidade ao olhar, sem mudar a sua expressão.
- **02 — Contornos *de precisão*** Com o tempo, a mandíbula perde definição e o rosto parece "cair". Redesenhar a linha da mandíbula e do queixo traz um perfil mais firme e harmonioso, respeitando seus traços.
- **03 — Lábios com *hidratação e volume*** Lábios mais finos e ressecados envelhecem o sorriso. O tratamento devolve contorno, simetria e um viço natural, na medida certa para o seu rosto.
- **04 — Suavize o *bigode chinês*** Os sulcos ao redor da boca deixam o semblante mais sério e cansado. Suavizá-los de forma sutil traz leveza, sem aquele aspecto preenchido.

**Fecho da seção (acima do carrossel):** Elas confiaram na Dra. Laura. Deslize e veja mais resultados.

## 6. O Método

**Nome proposto:** Protocolo Identidade LT [validar com a Dra.; alternativa: Método LT]

**Eyebrow:** COMO FUNCIONA

**Título:** Um método para rejuvenescer *sem exageros.*

**Lead:** O Protocolo Identidade LT nasceu de 9 anos e mais de 25 mil atendimentos. Ele parte de uma ideia simples: o seu rosto tem uma história, e o tratamento deve respeitá-la.

1. **Escuta** — Você conta o que incomoda e o que não quer perder. A conversa vem antes de qualquer agulha.
2. **Análise facial** — A Dra. avalia estrutura, pele e expressões para entender a causa do envelhecimento, não só o sintoma.
3. **Plano individual** — Um protocolo desenhado para você, com etapas, prazos e expectativas explicadas com clareza.
4. **Acompanhamento** — Retorno para avaliar a evolução e planejar a manutenção no tempo certo.

**CTA:** Quero começar pela avaliação

## 7. Sobre a Dra. Laura

**Eyebrow:** QUEM CUIDA DE VOCÊ

**Título:** Prazer, *Laura Tavares.*

**Texto:**

Há 9 anos, a Dra. Laura Tavares escolheu um caminho diferente na estética: o de rejuvenescer sem apagar quem a paciente é. Em 2018 abriu a clínica no Sudoeste e, em oito anos, fez dela uma das referências em harmonização facial de Brasília.

São mais de 25 mil atendimentos, formação internacional no AMWC Coreia 2026, o maior congresso de estética avançada do mundo, e o prêmio de Melhor Atendimento no Santa Permuta 2026. Mas o que as pacientes mais comentam é outra coisa: ela escuta antes de indicar qualquer procedimento.

**Citação (estilo quote, da Revista Orla BSB):** "Meu compromisso é entregar segurança, planejamento e resultados que respeitem a individualidade."

**Assinatura:** Laura Tavares

**Rodapé da seção:** [Profissão] · [Conselho e nº de registro]

**Números (StatBlock):**

| Número | Rótulo |
|---|---|
| +25 mil | atendimentos |
| 9 anos | de experiência |
| 8 anos | de clínica no Sudoeste |
| AMWC | Coreia 2026 |

**CTA:** Agendar avaliação com a Dra. Laura

[Confirmar ano de abertura (2018 pela matéria de abril/2026) e formação acadêmica para incluir uma linha.]

## 8. Depoimentos

**Eyebrow:** QUEM JÁ VIVEU A EXPERIÊNCIA

**Título:** Mulheres reais. *Histórias reais.*

**Lead:** Mais do que um resultado bonito, elas encontraram um lugar onde se sentem ouvidas e seguras.

**Depoimentos:** usar os textos reais dos destaques "Depoimentos" do Instagram e das avaliações do Google, com nome (ou inicial), idade e tratamento. Formato de cada card: estrelas, citação curta (até 30 palavras), nome, tratamento.

**Modelo de como editar um depoimento real para o card** (exemplo, não publicar):

> "Fiquei mais descansada e ninguém percebeu que fiz algo, só que eu estava mais bonita." — Nome, 47 anos · Rejuvenescimento 40+

**CTA abaixo do carrossel:** Quero ser a próxima história

## 9. A clínica

**Eyebrow:** A CLÍNICA

**Título:** Um espaço pensado para *você desacelerar.*

**Texto:** No coração do Sudoeste, a Clínica Laura Tavares foi criada para ser uma pausa no seu dia. Ambiente acolhedor, equipe treinada para receber bem e tecnologia de ponta, incluindo protocolos e produtos de K-Beauty trazidos diretamente da Coreia.

**Destaques (ícones):**

- Equipe premiada em atendimento
- Tecnologia e produtos coreanos
- Ambiente reservado e acolhedor
- Segunda a sábado, com hora marcada

**Legendas da galeria:** Recepção · Sala de procedimentos · Nossa equipe · Detalhes que cuidam de você

[Confirmar horário de funcionamento e se há estacionamento.]

## 10. Dúvidas frequentes

**Eyebrow:** DÚVIDAS

**Título:** Tudo o que você quer saber *antes de agendar.*

1. **Vou ficar com o rosto artificial?** Não é esse o objetivo. Cada plano é feito para realçar os seus traços, com doses e pontos definidos para o seu rosto. A ideia é que as pessoas notem você mais descansada, não um procedimento.
2. **Como funciona a avaliação?** É uma consulta com a Dra. Laura para ouvir suas queixas, analisar seu rosto e montar um plano individual. Você sai sabendo o que faz sentido, por quê e em quantas etapas.
3. **Dói?** O desconforto costuma ser leve. Usamos anestésicos e técnicas que deixam a sessão mais tranquila.
4. **Preciso me afastar da rotina?** Na maioria dos procedimentos, não. Pode haver um leve inchaço ou pontos roxos nos primeiros dias, e a Dra. passa todos os cuidados.
5. **Quanto tempo dura o resultado?** Depende do procedimento, da área tratada e do seu organismo. Na avaliação, você recebe a estimativa e o plano de manutenção.
6. **Qual a diferença entre preenchimento e toxina botulínica?** O preenchimento repõe volume e define contornos, como lábios e mandíbula. A toxina relaxa músculos para suavizar rugas de expressão, como na testa e nos olhos. Muitas vezes os dois se complementam.
7. **A partir de que idade posso fazer?** Não existe idade certa, existe indicação. A Dra. avalia cada caso e só indica o que for seguro e necessário para você.
8. **Quanto custa?** O valor depende do plano indicado para o seu rosto, por isso é definido na avaliação. Fale com a nossa equipe pelo WhatsApp para agendar.
9. **Onde fica a clínica?** CLSW 303, Bloco C, sala 70, Edifício Le Parc, Sudoeste, Brasília. Atendimento de segunda a sábado, com hora marcada.

**CTA abaixo:** Ainda com dúvida? Fale com a nossa equipe no WhatsApp

## 11. CTA final, rodapé e WhatsApp

**CTA final (seção escura):**

- Eyebrow: O PRIMEIRO PASSO
- Título: O seu rosto tem uma história. *Vamos cuidar dela juntas?*
- Texto: Agende sua avaliação com a Dra. Laura Tavares e receba um plano pensado só para você.
- Botão: Agendar pelo WhatsApp
- Linha de apoio: Segunda a sábado · CLSW 303, Sudoeste · Brasília

**Rodapé:**

- Clínica Laura Tavares — Estética Avançada
- CLSW 303, Bloco C, sala 70, Edifício Le Parc, Sudoeste, Brasília – DF, 70673-623
- WhatsApp (61) 98100-7522 · Instagram @clinicalauratavaress · @dra.lauratavares
- Responsável técnica: Dra. Laura Tavares · [Profissão] · [Conselho e nº de registro]
- © 2026 Clínica Laura Tavares · Política de privacidade

**Botão flutuante:** "Agende pelo WhatsApp"

**Mensagens pré-preenchidas por botão** (deixa a origem do lead clara para a recepção):

| Botão | Mensagem |
|---|---|
| Hero e CTA final | Olá! Vim pelo site e gostaria de agendar uma avaliação com a Dra. Laura. |
| Blocos de resultado | Olá! Vi os resultados no site e quero saber mais sobre [olheiras / mandíbula / lábios / bigode chinês]. |
| Tratamentos | Olá! Tenho interesse em [tratamento]. Podem me ajudar? |
| FAQ | Olá! Tenho uma dúvida antes de agendar. |

[Confirmar número: a bio usa 5561981007522, e a arte da agenda mostra (61) 98105-1565.]

## 12. SEO local

**Title (até 60 caracteres):** Harmonização Facial no Sudoeste | Dra. Laura Tavares

**Meta description (até 155):** Rejuvenescimento natural para 40+ no Sudoeste, Brasília. +25 mil atendimentos com a Dra. Laura Tavares. Agende sua avaliação pelo WhatsApp.

**H1:** Rejuvenescer sem deixar de ser você.

**Palavras-chave para distribuir nos textos:** harmonização facial Brasília, harmonização facial Sudoeste, clínica de estética Sudoeste, preenchimento labial Brasília, bioestimulador de colágeno, rejuvenescimento facial 40+, estética avançada Brasília.

**Alt texts:**

| Imagem | Alt |
|---|---|
| Foto do hero | Dra. Laura Tavares na recepção da clínica de estética no Sudoeste, Brasília |
| Antes e depois | Antes e depois de tratamento para [área], paciente com autorização de imagem |
| Fachada/recepção | Recepção da Clínica Laura Tavares, Estética Avançada, no CLSW 303 |
| Equipe | Equipe da Clínica Laura Tavares em frente ao letreiro da clínica |

**Open Graph (compartilhamento no WhatsApp):** "Clínica Laura Tavares · Rejuvenescer sem deixar de ser você" + foto da Dra. em 1200×630.
````

- [ ] **Step 6: Verificar os arquivos**

```bash
grep -c $'\r' docs/copy.md; grep -n 'Rejuvenescer sem deixar de \*ser você.\*' docs/copy.md; ls docs/fontes
```

Expected: `0` (sem CRLF), uma linha encontrada e os três originais em `docs/fontes/`.

- [ ] **Step 7: Commit**

```bash
git add .gitattributes docs/fontes docs/design-system docs/copy.md
git add --renormalize .
git commit -m "$(cat <<'EOF'
docs: organiza materiais de origem e transcreve o copy

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Scaffold Astro 7 com TypeScript estrito, ESLint, Prettier e Vitest

**Files:**
- Create: `package.json`, `package-lock.json` (gerado), `astro.config.mjs`, `tsconfig.json`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `vitest.config.ts`, `vitest.dist.config.ts`, `src/lib/text.ts`, `src/lib/text.test.ts`, `tests/dist/load.ts`, `tests/dist/base.test.ts`, `src/pages/index.astro` (provisória)
- Modify: `.gitignore`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `normalizeText(value: string): string` e `countWords(value: string): number` em `src/lib/text.ts`.
  - Em `tests/dist/load.ts`: `loadPage(file?: string): { html: string; document: Document }`, `readDist(file: string): string`, `listDist(subdir?: string): string[]`, `existsInDist(file: string): boolean`, `textOf(node: { textContent: string | null } | null | undefined): string`, `cssOf(document: Document): string`.
  - Scripts npm: `dev`, `build`, `preview`, `astro`, `lint`, `format`, `typecheck`, `test`, `test:watch`, `test:dist`, `check`.

- [ ] **Step 1: Criar `package.json`**

```json
{
  "name": "clinica-laura-tavares",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": "22.x"
  },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "lint": "eslint . && prettier --check .",
    "format": "prettier --write .",
    "typecheck": "astro check",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:dist": "vitest run --config vitest.dist.config.ts",
    "check": "npm run lint && npm run typecheck && npm test && npm run build && npm run test:dist"
  },
  "allowScripts": {
    "esbuild": true,
    "sharp": true
  }
}
```

- [ ] **Step 2: Instalar as dependências (versões verificadas)**

```bash
npm install --save-exact astro@7.3.5
npm install -D --save-exact @astrojs/check@0.9.10 @eslint/js@9.39.5 @types/node@22.20.5 eslint@9.39.5 eslint-plugin-astro@1.7.0 globals@16.5.0 linkedom@0.18.13 prettier@3.9.9 prettier-plugin-astro@1.1.0 typescript-eslint@8.71.1 vitest@5.0.3
npm install -D typescript@~6.0.3
npm ls typescript eslint astro vitest
```

Expected: sem `ERESOLVE` nem `EBADENGINE`; `npm ls` mostra typescript 6.0.x, eslint 9.39.5, astro 7.3.5, vitest 5.0.3.

- [ ] **Step 3: Criar `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';

// URL pública usada em canonical, Open Graph, sitemap e robots. Confirmada na Task 38 (deploy).
const site = process.env.SITE_URL ?? 'https://clinicalauratavaress.vercel.app';

export default defineConfig({
  site,
  trailingSlash: 'never',
  build: { format: 'file' },
  devToolbar: { enabled: false },
  vite: {
    build: {
      // Scripts processados nunca viram <script> inline: o CSP (Task 36) libera só 'self' + hashes conhecidos.
      assetsInlineLimit: (filePath) => (filePath.endsWith('.js') ? false : undefined),
    },
  },
});
```

- [ ] **Step 4: Criar `tsconfig.json`** (no TypeScript 6 o padrão de `types` é `[]`; sem `"types": ["node"]` o `astro check` não enxerga `node:fs` nem `process`)

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "types": ["node"]
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "docs", "media-src", ".worktrees", ".e2e-tmp"]
}
```

- [ ] **Step 5: Criar `eslint.config.js`**

```js
import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    'dist/',
    '.astro/',
    'docs/',
    'public/',
    'media-src/',
    '.worktrees/',
    '.vercel/',
    '.claude/',
    '.e2e-tmp/',
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
]);
```

- [ ] **Step 6: Criar `.prettierrc.json` e `.prettierignore`**

```json
{
  "singleQuote": true,
  "printWidth": 100,
  "plugins": ["prettier-plugin-astro"],
  "overrides": [{ "files": "*.astro", "options": { "parser": "astro" } }]
}
```

```gitignore
dist
.astro
node_modules
package-lock.json
docs
public
media-src
.worktrees
.vercel
.claude
.e2e-tmp
skills-lock.json
src/assets
src/content/depoimentos.json
src/content/imprensa.json
```

- [ ] **Step 7: Criar `vitest.config.ts` e `vitest.dist.config.ts`**

```ts
// vitest.config.ts — testes unitários (lógica pura e scripts)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs'],
    environment: 'node',
  },
});
```

```ts
// vitest.dist.config.ts — testes do HTML gerado em dist/ (rode `npm run build` antes)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/dist/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 8: Acrescentar ao final do `.gitignore`**

```gitignore

# artefatos locais de QA (relatórios brutos e capturas temporárias)
.e2e-tmp/
docs/qa/lighthouse/
```

- [ ] **Step 9: Escrever o teste unitário que falha — `src/lib/text.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { countWords, normalizeText } from './text';

describe('normalizeText', () => {
  it('colapsa espaços, tabs e quebras de linha e apara as pontas', () => {
    expect(normalizeText('  Rejuvenescer\n  sem\tdeixar  ')).toBe('Rejuvenescer sem deixar');
  });

  it('trata espaço não separável como espaço comum', () => {
    expect(normalizeText('ser você')).toBe('ser você');
  });
});

describe('countWords', () => {
  it('conta palavras com acentos e pontuação', () => {
    expect(countWords('Fiquei mais descansada e ninguém percebeu.')).toBe(6);
  });

  it('retorna 0 para texto vazio ou só com espaços', () => {
    expect(countWords('   ')).toBe(0);
  });
});
```

- [ ] **Step 10: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL com `Failed to resolve import "./text"`.

- [ ] **Step 11: Implementar `src/lib/text.ts`**

```ts
/** Junta espaços, tabs, quebras de linha e espaços não separáveis num único espaço e apara as pontas. */
export function normalizeText(value: string): string {
  return value.replace(/\s+/gu, ' ').trim();
}

/** Conta palavras separadas por espaço (limite de 30 palavras dos depoimentos). */
export function countWords(value: string): number {
  const text = normalizeText(value);
  return text === '' ? 0 : text.split(' ').length;
}
```

- [ ] **Step 12: Rodar e ver passar**

Run: `npm test`
Expected: PASS — `Test Files  1 passed`, `Tests  4 passed`.

- [ ] **Step 13: Criar o utilitário dos testes de dist — `tests/dist/load.ts`**

```ts
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseHTML } from 'linkedom';
import { normalizeText } from '../../src/lib/text';

const DIST = join(process.cwd(), 'dist');

/** Lê e faz o parse de uma página gerada (padrão: dist/index.html). */
export function loadPage(file = 'index.html'): { html: string; document: Document } {
  const path = join(DIST, file);
  if (!existsSync(path)) {
    throw new Error(`dist/${file} não existe — rode "npm run build" antes de "npm run test:dist".`);
  }
  const html = readFileSync(path, 'utf8');
  const { document } = parseHTML(html);
  return { html, document: document as unknown as Document };
}

export function readDist(file: string): string {
  return readFileSync(join(DIST, file), 'utf8');
}

export function existsInDist(file: string): boolean {
  return existsSync(join(DIST, file));
}

/** Lista arquivos (recursivo) de dist/<subdir>, com caminhos relativos a dist/ e barras normais. */
export function listDist(subdir = ''): string[] {
  const root = join(DIST, subdir);
  if (!existsSync(root)) return [];
  return readdirSync(root, { recursive: true, encoding: 'utf8' }).map((path) =>
    (subdir ? `${subdir}/${path}` : path).replaceAll('\\', '/'),
  );
}

/** Texto visível normalizado de um nó. */
export function textOf(node: { textContent: string | null } | null | undefined): string {
  return normalizeText(node?.textContent ?? '');
}

/** Todo o CSS da página: arquivos de dist/_astro + blocos <style> inline. */
export function cssOf(document: Document): string {
  const files = listDist('_astro')
    .filter((file) => file.endsWith('.css'))
    .map(readDist);
  const inline = Array.from(document.querySelectorAll('style'), (style) => style.textContent ?? '');
  return [...files, ...inline].join('\n');
}
```

- [ ] **Step 14: Escrever o teste de dist que falha — `tests/dist/base.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { loadPage } from './load';

describe('página inicial — base', () => {
  it('declara o idioma pt-BR', () => {
    const { document } = loadPage();
    expect(document.documentElement.getAttribute('lang')).toBe('pt-BR');
  });

  it('tem viewport responsivo', () => {
    const { document } = loadPage();
    expect(document.querySelector('meta[name="viewport"]')?.getAttribute('content')).toContain(
      'width=device-width',
    );
  });

  it('tem exatamente um h1', () => {
    const { document } = loadPage();
    expect(document.querySelectorAll('h1')).toHaveLength(1);
  });
});
```

Run: `npm run test:dist`
Expected: FAIL com `dist/index.html não existe — rode "npm run build" antes de "npm run test:dist".`

- [ ] **Step 15: Criar a página provisória `src/pages/index.astro`** (a BaseLayout da Task 7 e as seções das Etapas 2–4 substituem este conteúdo)

```astro
---
// Página provisória da fundação: substituída pela BaseLayout (Task 7) e pelas seções (Etapas 2–4).
---

<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Clínica Laura Tavares</title>
  </head>
  <body>
    <main>
      <h1>Clínica Laura Tavares</h1>
    </main>
  </body>
</html>
```

- [ ] **Step 16: Build e testes de dist passando**

Run: `npm run build && npm run test:dist`
Expected: build gera `dist/index.html`; PASS — `Tests  3 passed`.

- [ ] **Step 17: Formatar e rodar o gate da tarefa**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: ESLint sem erros, `All matched files use Prettier code style!`, `astro check` com `0 errors`, testes PASS.

- [ ] **Step 18: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json eslint.config.js .prettierrc.json .prettierignore vitest.config.ts vitest.dist.config.ts .gitignore src tests
git commit -m "$(cat <<'EOF'
chore: scaffold Astro 7 com TypeScript estrito, ESLint, Prettier e Vitest

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Tokens, componentes CSS do design system, fontes self-hosted e estilos globais

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/bundle.css` (portados), `src/styles/global.css`, `src/styles/index.ts`, `tests/dist/styles.test.ts`
- Modify: `src/pages/index.astro`, `package.json` (fontes)

**Interfaces:**
- Consumes: `docs/design-system/tokens.css`, `docs/design-system/components/bundle.css` (Task 1); `cssOf`, `loadPage`, `listDist` (Task 2).
- Produces: `import '../styles/index'` (carrega fontes → tokens → bundle → global, nessa ordem); classes globais `.container`, `.grid-12`, `.section`, `.section--blush`, `.section--compact`, `.lt-title.is-display|is-h2|is-h3`, `.skip-link`, `.sr-only`; variáveis `--gutter`, `--section-pad`, `--container`, `--nav-offset`.

- [ ] **Step 1: Instalar as fontes e conferir os caminhos de import**

```bash
npm install --save-exact @fontsource/cormorant-garamond@5.3.0 @fontsource/jost@5.3.0 @fontsource/pinyon-script@5.3.0
node -e "for (const p of ['@fontsource/cormorant-garamond/latin-500-italic.css','@fontsource/jost/latin-300.css','@fontsource/pinyon-script/latin-400.css','@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2']) console.log(require.resolve(p))"
```

Expected: quatro caminhos dentro de `node_modules/@fontsource/...` (nenhum terminando em `.css.css`).

- [ ] **Step 2: Escrever o teste de dist que falha — `tests/dist/styles.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { cssOf, listDist, loadPage } from './load';

describe('estilos e fontes', () => {
  it('serve as três famílias pelo próprio site (@fontsource)', () => {
    const { document } = loadPage();
    const css = cssOf(document);
    for (const family of ['Cormorant Garamond', 'Jost', 'Pinyon Script']) {
      expect(css).toMatch(new RegExp(`font-family:\\s*["']?${family}`));
    }
    expect(listDist('_astro').some((file) => file.endsWith('.woff2'))).toBe(true);
  });

  it('não chama o Google Fonts nem outro CDN de fontes', () => {
    const { document, html } = loadPage();
    const everything = html + cssOf(document);
    expect(everything).not.toContain('fonts.googleapis.com');
    expect(everything).not.toContain('fonts.gstatic.com');
  });

  it('inclui os tokens do design system e o foco visível', () => {
    const { document } = loadPage();
    const css = cssOf(document);
    expect(css).toMatch(/--accent:\s*#8c4a55/i);
    expect(css).toMatch(/--surface-blush:\s*#f3e3de/i);
    expect(css).toContain(':focus-visible');
    expect(css).toContain('prefers-reduced-motion');
  });
});
```

Run: `npm run build && npm run test:dist`
Expected: FAIL nos três testes de `styles.test.ts` (sem `@font-face` nem tokens).

- [ ] **Step 3: Portar tokens e componentes do design system sem o `@import` do Google Fonts**

```bash
mkdir -p src/styles
grep -v "fonts.googleapis.com" docs/design-system/tokens.css > src/styles/tokens.css
grep -v "fonts.googleapis.com" docs/design-system/components/bundle.css > src/styles/bundle.css
grep -c "googleapis" src/styles/tokens.css src/styles/bundle.css
```

Expected: `src/styles/tokens.css:0` e `src/styles/bundle.css:0`.

- [ ] **Step 4: Criar `src/styles/global.css`**

```css
/* Base global — layout, tipografia responsiva e acessibilidade.
   Tokens: tokens.css · Componentes do design system: bundle.css (classes lt-*). */

:root {
  --gutter: var(--space-6);
  --section-pad: var(--space-24);
  --container: 1200px;
  --nav-offset: 104px;
}

@media (min-width: 1024px) {
  :root {
    --gutter: var(--space-8);
    --section-pad: var(--space-32);
  }
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

body {
  margin: 0;
  min-height: 100vh;
  background: var(--surface);
  color: var(--ink);
  font: 400 16px/26px var(--font-sans);
}

img,
picture,
video,
svg {
  display: block;
  max-width: 100%;
}

img,
video {
  height: auto;
}

h1,
h2,
h3,
p,
figure,
blockquote,
ul,
ol {
  margin: 0;
}

ul[role='list'],
ol[role='list'] {
  padding: 0;
  list-style: none;
}

a {
  color: inherit;
  text-underline-offset: 0.18em;
}

button {
  font: inherit;
  color: inherit;
  cursor: pointer;
}

/* Layout: container de 1200px e grade de 12 colunas */
.container {
  width: 100%;
  max-width: calc(var(--container) + 2 * var(--gutter));
  margin-inline: auto;
  padding-inline: var(--gutter);
}

.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: var(--gutter);
}

/* Seções: espaçamento do design system e alternância claro → rosado → noite (data-theme) */
.section {
  position: relative;
  padding-block: var(--section-pad);
  background: var(--surface);
  color: var(--ink);
}

.section--blush {
  background: var(--surface-blush);
}

.section--compact {
  padding-block: var(--space-16);
}

section[id] {
  scroll-margin-top: var(--nav-offset);
}

/* Tipografia responsiva: escala do design system, reduzida no mobile */
.lt-title.is-display {
  font-size: clamp(2.75rem, 1.55rem + 5.2vw, 4.75rem);
  line-height: 0.98;
  letter-spacing: -0.015em;
}

.lt-title.is-h2 {
  font-size: clamp(2rem, 1.6rem + 1.8vw, 2.625rem);
  line-height: 1.1;
}

.lt-title.is-h3 {
  font-size: clamp(1.5rem, 1.35rem + 0.6vw, 1.75rem);
  line-height: 1.2;
  font-weight: 600;
}

.lt-lead {
  font-size: clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem);
  line-height: 1.6;
}

/* Numerais em gold-ink: o gold (#B8925A) dá 2,7:1 e reprova o contraste AA de texto grande no axe */
.lt-stat__num {
  color: var(--gold-ink);
}

/* Ícones Phosphor são preenchidos (fill), não traçados como no exemplo do bundle */
.lt-icon svg {
  fill: currentColor;
  stroke: none;
}

/* Foco visível em todos os controles */
:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 3px;
}

main:focus {
  outline: none;
}

/* Skip link */
.skip-link {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  z-index: 100;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-pill);
  background: var(--surface-raised);
  color: var(--ink);
  font: 500 14px/1 var(--font-sans);
  text-decoration: none;
  box-shadow: var(--shadow-lift);
  transform: translateY(-200%);
}

.skip-link:focus-visible {
  transform: none;
}

.sr-only {
  position: absolute !important;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

/* Movimento reduzido: corta animações e transições CSS (o GSAP ganha ramo próprio na Etapa 5) */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 5: Criar `src/styles/index.ts`**

```ts
// Ordem importa: fontes → tokens → componentes do design system → base global.
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/cormorant-garamond/latin-500-italic.css';
import '@fontsource/jost/latin-300.css';
import '@fontsource/jost/latin-400.css';
import '@fontsource/jost/latin-500.css';
import '@fontsource/jost/latin-600.css';
import '@fontsource/pinyon-script/latin-400.css';
import './tokens.css';
import './bundle.css';
import './global.css';
```

- [ ] **Step 6: Carregar os estilos na página provisória — substituir `src/pages/index.astro` inteiro por:**

```astro
---
// Página provisória da fundação: substituída pela BaseLayout (Task 7) e pelas seções (Etapas 2–4).
import '../styles/index';
---

<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Clínica Laura Tavares</title>
  </head>
  <body class="lt">
    <main>
      <h1 class="lt-title is-display">Clínica Laura Tavares</h1>
    </main>
  </body>
</html>
```

- [ ] **Step 7: Build e testes de dist passando**

Run: `npm run build && npm run test:dist`
Expected: PASS — `Tests  6 passed` (base + estilos).

- [ ] **Step 8: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde (o Prettier reformata `tokens.css`/`bundle.css` — é esperado).

```bash
git add package.json package-lock.json src/styles src/pages/index.astro tests/dist/styles.test.ts
git commit -m "$(cat <<'EOF'
feat: tokens, CSS do design system, fontes self-hosted e estilos globais

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Conteúdo tipado (`src/content/site.ts`) e campos pendentes — TDD

**Files:**
- Create: `src/content/pending.ts`, `src/content/pending.test.ts`, `src/content/site.ts`, `src/content/site.test.ts`
- Modify: `package.json` (zod)

**Interfaces:**
- Consumes: `docs/copy.md` (Task 1).
- Produces (`src/content/site.ts`): `siteSchema` (zod), `site: Site`, `type Site`, `type RichTitle = { before: string; em: string; after: string }`, `contentIcons` (tupla readonly com os 12 ícones usados no conteúdo), `type ContentIcon`, `type TreatmentSlug = 'harmonizacao' | 'rejuvenescimento' | 'kbeauty' | 'corporal'`, `type ResultSlug = 'olhar' | 'mandibula' | 'labios' | 'bigode'`, `type ClinicSlot = 'recepcao' | 'sala' | 'equipe' | 'detalhes'`.
- Produces (`src/content/pending.ts`): `findNullPaths(value: unknown, prefix?: string): string[]`, `getPath(value: unknown, path: string): unknown`, `listPending(site: Pick<Site, 'pending'>): string[]`.

- [ ] **Step 1: Instalar o zod**

```bash
npm install --save-exact zod@4.6.5
```

- [ ] **Step 2: Escrever o teste que falha — `src/content/pending.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { findNullPaths, getPath, listPending } from './pending';

describe('findNullPaths', () => {
  it('lista caminhos de valores null em objetos e arrays', () => {
    expect(findNullPaths({ a: null, b: { c: null, d: 'x' }, e: [{ f: null }, { f: 1 }] })).toEqual([
      'a',
      'b.c',
      'e.0.f',
    ]);
  });

  it('ignora undefined, strings vazias e zeros', () => {
    expect(findNullPaths({ a: undefined, b: '', c: 0 })).toEqual([]);
  });
});

describe('getPath', () => {
  it('lê caminhos com índices de array', () => {
    expect(getPath({ e: [{ f: 2 }] }, 'e.0.f')).toBe(2);
  });

  it('distingue null (campo existe) de undefined (campo não existe)', () => {
    expect(getPath({ a: null }, 'a')).toBeNull();
    expect(getPath({ a: null }, 'a.b')).toBeUndefined();
    expect(getPath({}, 'x')).toBeUndefined();
  });
});

describe('listPending', () => {
  it('formata "id: descrição" para o log do build', () => {
    expect(
      listPending({
        pending: [
          {
            id: 'segundo-numero',
            description: 'Função do segundo número, (61) 98105-1565.',
            fields: ['whatsapp.number'],
            blocksCustomDomain: false,
          },
        ],
      }),
    ).toEqual(['segundo-numero: Função do segundo número, (61) 98105-1565.']);
  });
});
```

Run: `npm test -- src/content/pending.test.ts`
Expected: FAIL com `Failed to resolve import "./pending"`.

- [ ] **Step 3: Implementar `src/content/pending.ts`**

```ts
import type { Site } from './site';

/** Caminhos (com ponto, índices numéricos) de todos os valores `null` — dados pendentes da clínica. */
export function findNullPaths(value: unknown, prefix = ''): string[] {
  if (value === null) return prefix ? [prefix] : [];
  if (typeof value !== 'object') return [];
  const entries: Array<[string, unknown]> = Array.isArray(value)
    ? value.map((child, index) => [String(index), child])
    : Object.entries(value);
  return entries.flatMap(([key, child]) => findNullPaths(child, prefix ? `${prefix}.${key}` : key));
}

/** Lê um caminho com ponto; `undefined` quando o campo não existe (diferente de `null`). */
export function getPath(value: unknown, path: string): unknown {
  let current: unknown = value;
  for (const key of path.split('.')) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

/** Linhas "id: descrição" impressas no build (`[pendente] …`). */
export function listPending(site: Pick<Site, 'pending'>): string[] {
  return site.pending.map((item) => `${item.id}: ${item.description}`);
}
```

Run: `npm test -- src/content/pending.test.ts`
Expected: PASS — `Tests  5 passed`.

- [ ] **Step 4: Escrever o teste que falha — `src/content/site.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { findNullPaths, getPath } from './pending';
import { site, siteSchema } from './site';

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value !== null && typeof value === 'object') return Object.values(value).flatMap(collectStrings);
  return [];
}

describe('site — schema e SEO', () => {
  it('o conteúdo passa no schema', () => {
    expect(siteSchema.safeParse(site).success).toBe(true);
  });

  it('usa o title do copy, com até 60 caracteres', () => {
    expect(site.seo.title).toBe('Harmonização Facial no Sudoeste | Dra. Laura Tavares');
    expect(site.seo.title.length).toBeLessThanOrEqual(60);
  });

  it('rejeita title com 61 caracteres', () => {
    const tooLong = { ...site, seo: { ...site.seo, title: 'x'.repeat(61) } };
    expect(siteSchema.safeParse(tooLong).success).toBe(false);
  });

  it('usa a meta description do copy, com até 155 caracteres', () => {
    expect(site.seo.description.length).toBeLessThanOrEqual(155);
    const tooLong = { ...site, seo: { ...site.seo, description: 'x'.repeat(156) } };
    expect(siteSchema.safeParse(tooLong).success).toBe(false);
  });
});

describe('site — estrutura do copy', () => {
  it('tem 4 tratamentos, 4 blocos de resultado e 9 dúvidas', () => {
    expect(site.treatments.items).toHaveLength(4);
    expect(site.results.blocks).toHaveLength(4);
    expect(site.faq.items).toHaveLength(9);
  });

  it('rejeita 3 tratamentos', () => {
    const missing = {
      ...site,
      treatments: { ...site.treatments, items: site.treatments.items.slice(0, 3) },
    };
    expect(siteSchema.safeParse(missing).success).toBe(false);
  });

  it('todo título tem trecho em itálico (em) não vazio', () => {
    const titles = [
      site.hero.title,
      site.treatments.title,
      site.results.title,
      ...site.results.blocks.map((block) => block.title),
      site.method.title,
      site.about.title,
      site.testimonials.title,
      site.clinic.title,
      site.faq.title,
      site.finalCta.title,
    ];
    for (const title of titles) expect(title.em.trim().length).toBeGreaterThan(0);
  });

  it('âncoras da navbar são únicas e começam com #', () => {
    const hrefs = site.nav.links.map((link) => link.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const href of hrefs) expect(href.startsWith('#')).toBe(true);
  });

  it('contadores batem com o número exibido', () => {
    for (const stat of site.about.stats) {
      if (stat.countTo !== undefined) {
        expect(`${stat.prefix ?? ''}${stat.countTo}${stat.suffix ?? ''}`).toBe(stat.value);
      }
    }
  });

  it('o número exibido do WhatsApp é o mesmo do link', () => {
    expect(`55${site.whatsapp.display.replace(/\D/g, '')}`).toBe(site.whatsapp.number);
  });

  it('o lead do método cita o nome do método', () => {
    expect(site.method.lead).toContain(site.method.name);
  });
});

describe('site — pendências e compliance', () => {
  it('todo campo null está marcado em pending[].fields', () => {
    const declared = new Set(site.pending.flatMap((item) => item.fields));
    for (const path of findNullPaths(site)) expect(declared).toContain(path);
  });

  it('pending[].fields apontam para campos que existem', () => {
    for (const item of site.pending) {
      for (const field of item.fields) expect(getPath(site, field)).not.toBeUndefined();
    }
  });

  it('registro profissional e formação estão pendentes; só o registro bloqueia domínio próprio', () => {
    expect(site.responsibleTechnician.profession).toBeNull();
    expect(site.responsibleTechnician.registration).toBeNull();
    expect(site.about.education).toBeNull();
    const blocking = site.pending.filter((item) => item.blocksCustomDomain).map((item) => item.id);
    expect(blocking).toEqual(['registro-profissional']);
  });

  it('lista as 7 pendências da spec', () => {
    expect(site.pending.map((item) => item.id)).toEqual([
      'registro-profissional',
      'autorizacao-imagens',
      'logo-vetor',
      'horario-estacionamento',
      'nome-metodo-tratamentos',
      'segundo-numero',
      'formacao-academica',
    ]);
  });

  it('nenhum texto visível traz [colchetes] do copy', () => {
    const visible = Object.entries(site).filter(([key]) => key !== 'pending');
    for (const value of collectStrings(visible)) expect(value).not.toMatch(/[[\]]/);
  });

  it('não usa linguagem proibida (promoção, garantia, "sem dor", preço)', () => {
    const banned = /promo[cç][aã]o|garantid|sem dor|R\$\s?\d/i;
    for (const value of collectStrings(site)) expect(value).not.toMatch(banned);
  });

  it('resultados e tratamentos têm {detail}; geral e FAQ não', () => {
    const { messages } = site.whatsapp;
    expect(messages.result).toContain('{detail}');
    expect(messages.treatment).toContain('{detail}');
    expect(messages.general).not.toContain('{detail}');
    expect(messages.faq).not.toContain('{detail}');
  });
});
```

Run: `npm test -- src/content/site.test.ts`
Expected: FAIL com `Failed to resolve import "./site"`.

- [ ] **Step 5: Implementar `src/content/site.ts`**

```ts
import { z } from 'zod';

/**
 * Conteúdo da landing — fonte única de TODO texto visível, copiado literalmente de docs/copy.md.
 * Regras:
 * - `null` = dado que a clínica ainda precisa enviar; todo caminho com `null` aparece em `pending[].fields`.
 * - Campo que não se aplica fica ausente (opcional), nunca `null`.
 * - RichTitle { before, em, after }: `em` é exatamente o trecho em itálico rosé do PDF.
 * - Microtextos que o copy não traz ficam em `ui`, `results.beforeLabel/afterLabel`,
 *   `finalCta.mapsLabel/wazeLabel`, `brand` e `privacy` (definidos no plano de implementação).
 */

const text = z.string().min(1);
const httpsUrl = z.url({ protocol: /^https$/ });

const richTitleSchema = z.strictObject({ before: z.string(), em: text, after: z.string() });
export type RichTitle = z.infer<typeof richTitleSchema>;

export const contentIcons = [
  'user-focus',
  'drop',
  'leaf',
  'person',
  'medal',
  'sparkle',
  'armchair',
  'calendar-check',
  'ear',
  'scan',
  'clipboard-text',
  'arrows-clockwise',
] as const;
const iconSchema = z.enum(contentIcons);
export type ContentIcon = z.infer<typeof iconSchema>;

const treatmentSlugSchema = z.enum(['harmonizacao', 'rejuvenescimento', 'kbeauty', 'corporal']);
export type TreatmentSlug = z.infer<typeof treatmentSlugSchema>;

const resultSlugSchema = z.enum(['olhar', 'mandibula', 'labios', 'bigode']);
export type ResultSlug = z.infer<typeof resultSlugSchema>;

const clinicSlotSchema = z.enum(['recepcao', 'sala', 'equipe', 'detalhes']);
export type ClinicSlot = z.infer<typeof clinicSlotSchema>;

const pendingIdSchema = z.enum([
  'registro-profissional',
  'autorizacao-imagens',
  'logo-vetor',
  'horario-estacionamento',
  'nome-metodo-tratamentos',
  'segundo-numero',
  'formacao-academica',
]);

export const siteSchema = z.strictObject({
  seo: z.strictObject({
    title: text.max(60),
    description: text.max(155),
    ogTitle: text,
    ogImageAlt: text,
  }),
  brand: z.strictObject({ wordmark: text, tagline: text }),
  business: z.strictObject({
    name: text,
    legalName: text,
    foundingYear: z.number().int().min(2000).max(2100),
    openingHours: text,
    address: z.strictObject({
      street: text,
      neighborhood: text,
      city: text,
      region: z.string().length(2),
      postalCode: z.string().regex(/^\d{5}-\d{3}$/),
      country: z.literal('BR'),
      full: text,
      mapsQuery: text,
    }),
    instagram: z
      .array(z.strictObject({ handle: z.string().regex(/^@[\w.]+$/), url: httpsUrl }))
      .length(2),
  }),
  whatsapp: z.strictObject({
    number: z.string().regex(/^55\d{10,11}$/),
    display: text,
    messages: z.strictObject({
      general: text,
      result: text.includes('{detail}'),
      treatment: text.includes('{detail}'),
      faq: text,
    }),
  }),
  responsibleTechnician: z.strictObject({
    name: text,
    profession: text.nullable(),
    registration: text.nullable(),
  }),
  ui: z.strictObject({
    skipLink: text,
    navLabel: text,
    menuLabel: text,
    menuOpen: text,
    menuClose: text,
    marqueeLabel: text,
    pauseMarquee: text,
    pauseCarousel: text,
    compare: text,
    moreAbout: text,
    starsLabel: text.includes('{n}'),
    sourceGoogle: text,
    sourceInstagram: text,
    backHome: text,
  }),
  marquee: z.array(z.strictObject({ text, italic: z.boolean() })).min(5),
  nav: z.strictObject({
    links: z
      .array(z.strictObject({ label: text, href: z.string().regex(/^#[a-z0-9-]+$/) }))
      .length(6),
    cta: text,
  }),
  hero: z.strictObject({
    eyebrow: text,
    title: richTitleSchema,
    subtitle: text,
    primaryCta: text,
    secondaryCta: text,
    seals: z.array(z.strictObject({ lead: text, rest: text, star: z.boolean() })).length(2),
    badge: z.strictObject({ value: text, label: text }),
    imageAlt: text,
  }),
  press: z.strictObject({
    eyebrow: text,
    support: text,
    items: z.array(z.strictObject({ outlet: text, title: text, note: text.optional() })).length(4),
  }),
  treatments: z.strictObject({
    eyebrow: text,
    title: richTitleSchema,
    lead: text,
    linkLabel: text,
    items: z
      .array(
        z.strictObject({
          slug: treatmentSlugSchema,
          title: text,
          text,
          whatsappDetail: text,
          icon: iconSchema,
        }),
      )
      .length(4),
  }),
  results: z.strictObject({
    eyebrow: text,
    title: richTitleSchema,
    lead: text,
    cta: text,
    legend: text,
    altTemplate: text.includes('{area}'),
    beforeLabel: text,
    afterLabel: text,
    blocks: z
      .array(
        z.strictObject({
          slug: resultSlugSchema,
          number: z.string().regex(/^0\d$/),
          title: richTitleSchema,
          text,
          area: text,
        }),
      )
      .length(4),
    carouselIntro: text,
    carouselAlt: text,
  }),
  method: z.strictObject({
    name: text,
    eyebrow: text,
    title: richTitleSchema,
    lead: text,
    steps: z.array(z.strictObject({ title: text, text, icon: iconSchema })).length(4),
    cta: text,
  }),
  about: z.strictObject({
    eyebrow: text,
    title: richTitleSchema,
    paragraphs: z.array(text).length(2),
    education: text.nullable(),
    quote: z.strictObject({ text, source: text }),
    signature: text,
    stats: z
      .array(
        z.strictObject({
          value: text,
          label: text,
          countTo: z.number().int().positive().optional(),
          prefix: z.string().optional(),
          suffix: z.string().optional(),
        }),
      )
      .length(4),
    cta: text,
    imageAlt: text,
  }),
  testimonials: z.strictObject({ eyebrow: text, title: richTitleSchema, lead: text, cta: text }),
  clinic: z.strictObject({
    eyebrow: text,
    title: richTitleSchema,
    text,
    highlights: z.array(z.strictObject({ label: text, icon: iconSchema })).length(4),
    gallery: z
      .array(z.strictObject({ slot: clinicSlotSchema, caption: text, alt: text }))
      .length(4),
  }),
  faq: z.strictObject({
    eyebrow: text,
    title: richTitleSchema,
    items: z.array(z.strictObject({ question: text, answer: text })).length(9),
    ctaLead: text,
    cta: text,
  }),
  finalCta: z.strictObject({
    eyebrow: text,
    title: richTitleSchema,
    text,
    button: text,
    support: text,
    mapsLabel: text,
    wazeLabel: text,
  }),
  footer: z.strictObject({
    technicianLabel: text,
    copyright: text,
    privacyLabel: text,
    whatsappLabel: text,
    instagramLabel: text,
  }),
  floatingButton: z.strictObject({ label: text }),
  privacy: z.strictObject({
    title: text,
    seoTitle: text.max(60),
    seoDescription: text.max(155),
    updated: text,
    sections: z.array(z.strictObject({ heading: text, paragraphs: z.array(text).min(1) })).min(1),
  }),
  pending: z
    .array(
      z.strictObject({
        id: pendingIdSchema,
        description: text,
        fields: z.array(z.string()),
        blocksCustomDomain: z.boolean(),
      }),
    )
    .length(7),
});

export type Site = z.infer<typeof siteSchema>;

const siteData = {
  seo: {
    title: 'Harmonização Facial no Sudoeste | Dra. Laura Tavares',
    description:
      'Rejuvenescimento natural para 40+ no Sudoeste, Brasília. +25 mil atendimentos com a Dra. Laura Tavares. Agende sua avaliação pelo WhatsApp.',
    ogTitle: 'Clínica Laura Tavares · Rejuvenescer sem deixar de ser você',
    ogImageAlt: 'Clínica Laura Tavares · Rejuvenescer sem deixar de ser você',
  },
  brand: { wordmark: 'Laura Tavares', tagline: 'Estética Avançada' },
  business: {
    name: 'Clínica Laura Tavares',
    legalName: 'Clínica Laura Tavares — Estética Avançada',
    foundingYear: 2018,
    openingHours: 'Segunda a sábado, com hora marcada',
    address: {
      street: 'CLSW 303, Bloco C, sala 70, Edifício Le Parc',
      neighborhood: 'Sudoeste',
      city: 'Brasília',
      region: 'DF',
      postalCode: '70673-623',
      country: 'BR',
      full: 'CLSW 303, Bloco C, sala 70, Edifício Le Parc, Sudoeste, Brasília – DF, 70673-623',
      mapsQuery:
        'Clínica Laura Tavares, CLSW 303, Bloco C, Edifício Le Parc, Sudoeste, Brasília - DF, 70673-623',
    },
    instagram: [
      { handle: '@clinicalauratavaress', url: 'https://www.instagram.com/clinicalauratavaress/' },
      { handle: '@dra.lauratavares', url: 'https://www.instagram.com/dra.lauratavares/' },
    ],
  },
  whatsapp: {
    number: '5561981007522',
    display: '(61) 98100-7522',
    messages: {
      general: 'Olá! Vim pelo site e gostaria de agendar uma avaliação com a Dra. Laura.',
      result: 'Olá! Vi os resultados no site e quero saber mais sobre {detail}.',
      treatment: 'Olá! Tenho interesse em {detail}. Podem me ajudar?',
      faq: 'Olá! Tenho uma dúvida antes de agendar.',
    },
  },
  responsibleTechnician: { name: 'Dra. Laura Tavares', profession: null, registration: null },
  ui: {
    skipLink: 'Pular para o conteúdo',
    navLabel: 'Principal',
    menuLabel: 'Menu',
    menuOpen: 'Abrir menu',
    menuClose: 'Fechar menu',
    marqueeLabel: 'Destaques da clínica',
    pauseMarquee: 'Pausar faixa de destaques',
    pauseCarousel: 'Pausar carrossel de resultados',
    compare: 'Comparar antes e depois',
    moreAbout: 'sobre',
    starsLabel: '{n} de 5 estrelas',
    sourceGoogle: 'Avaliação no Google',
    sourceInstagram: 'Depoimento no Instagram',
    backHome: 'Voltar para o início',
  },
  marquee: [
    { text: '+25 mil atendimentos', italic: false },
    { text: 'Harmonização facial', italic: true },
    { text: '9 anos de experiência', italic: false },
    { text: 'AMWC Coreia 2026', italic: true },
    { text: 'Melhor Atendimento · Santa Permuta 2026', italic: false },
    { text: 'K-Beauty na clínica', italic: true },
    { text: 'Sudoeste · Brasília', italic: false },
  ],
  nav: {
    links: [
      { label: 'Início', href: '#inicio' },
      { label: 'Tratamentos', href: '#tratamentos' },
      { label: 'Resultados', href: '#resultados' },
      { label: 'A Dra. Laura', href: '#dra-laura' },
      { label: 'A clínica', href: '#a-clinica' },
      { label: 'Dúvidas', href: '#duvidas' },
    ],
    cta: 'Agendar avaliação',
  },
  hero: {
    eyebrow: 'HARMONIZAÇÃO FACIAL · SUDOESTE, BRASÍLIA',
    title: { before: 'Rejuvenescer sem deixar de ', em: 'ser você.', after: '' },
    subtitle:
      'Protocolos individuais para a pele 40+, com naturalidade, segurança e planejamento. Do jeito que a Dra. Laura Tavares já fez em mais de 25 mil atendimentos.',
    primaryCta: 'Agendar minha avaliação',
    secondaryCta: 'Ver resultados reais',
    seals: [
      { lead: 'Melhor Atendimento', rest: ' — Santa Permuta 2026', star: true },
      { lead: 'Formação internacional', rest: ' — AMWC Coreia 2026', star: false },
    ],
    badge: { value: '+25 mil', label: 'atendimentos realizados' },
    imageAlt: 'Dra. Laura Tavares na recepção da clínica de estética no Sudoeste, Brasília',
  },
  press: {
    eyebrow: 'NA MÍDIA',
    support: 'Uma trajetória reconhecida pela imprensa de Brasília.',
    items: [
      {
        outlet: 'Revista Orla BSB',
        title: '"Laura Tavares celebra 8 anos e consolida clínica de estética no Sudoeste"',
        note: 'capa, edição nº 4',
      },
      { outlet: 'Diário de Brasília', title: 'Prêmio de Melhor Atendimento no Santa Permuta 2026' },
      {
        outlet: 'W3 Notícias',
        title: 'Korean Beauty Day traz a Brasília as tendências da beleza coreana',
      },
      { outlet: 'Diário de Brasília', title: 'Coautora do livro "Sua Voz Vale Ouro"' },
    ],
  },
  treatments: {
    eyebrow: 'TRATAMENTOS',
    title: { before: 'Cuidado avançado, ', em: 'do seu jeito.', after: '' },
    lead: 'Cada tratamento começa com uma avaliação do seu rosto. Nada de fórmula pronta: o plano é desenhado para os seus traços e para o que você quer sentir ao se olhar no espelho.',
    linkLabel: 'Saiba mais',
    items: [
      {
        slug: 'harmonizacao',
        title: 'Harmonização facial',
        text: 'Equilíbrio e proporção que realçam os traços que fazem de você quem você é.',
        whatsappDetail: 'harmonização facial',
        icon: 'user-focus',
      },
      {
        slug: 'rejuvenescimento',
        title: 'Rejuvenescimento 40+',
        text: 'Bioestimuladores e protocolos regenerativos para devolver firmeza e viço, sem rosto congelado.',
        whatsappDetail: 'rejuvenescimento 40+',
        icon: 'drop',
      },
      {
        slug: 'kbeauty',
        title: 'K-Beauty na clínica',
        text: 'Tecnologias e produtos trazidos da Coreia para uma pele saudável, hidratada e luminosa.',
        whatsappDetail: 'K-Beauty na clínica',
        icon: 'leaf',
      },
      {
        slug: 'corporal',
        title: 'Harmonização corporal',
        text: 'Protocolos para contorno e qualidade da pele do corpo, com o mesmo olhar de naturalidade.',
        whatsappDetail: 'harmonização corporal',
        icon: 'person',
      },
    ],
  },
  results: {
    eyebrow: 'RESULTADOS REAIS',
    title: { before: 'Naturalidade que ', em: 'se vê', after: ', não que se nota.' },
    lead: 'O espelho conta o que incomoda. A Dra. Laura trata a causa, com sutileza, para que as pessoas percebam você mais descansada, e não "diferente".',
    cta: 'Agendar minha avaliação',
    legend: 'Imagens publicadas com autorização. Resultados variam de pessoa para pessoa.',
    altTemplate: 'Antes e depois de tratamento para {area}, paciente com autorização de imagem',
    beforeLabel: 'Antes',
    afterLabel: 'Depois',
    blocks: [
      {
        slug: 'olhar',
        number: '01',
        title: { before: 'Adeus ao ', em: 'olhar de cansaço', after: '' },
        text: 'Aquela aparência de quem dormiu pouco, mesmo depois de uma boa noite. Repor o volume das maçãs do rosto e suavizar as olheiras devolve vitalidade ao olhar, sem mudar a sua expressão.',
        area: 'olheiras',
      },
      {
        slug: 'mandibula',
        number: '02',
        title: { before: 'Contornos ', em: 'de precisão', after: '' },
        text: 'Com o tempo, a mandíbula perde definição e o rosto parece "cair". Redesenhar a linha da mandíbula e do queixo traz um perfil mais firme e harmonioso, respeitando seus traços.',
        area: 'mandíbula',
      },
      {
        slug: 'labios',
        number: '03',
        title: { before: 'Lábios com ', em: 'hidratação e volume', after: '' },
        text: 'Lábios mais finos e ressecados envelhecem o sorriso. O tratamento devolve contorno, simetria e um viço natural, na medida certa para o seu rosto.',
        area: 'lábios',
      },
      {
        slug: 'bigode',
        number: '04',
        title: { before: 'Suavize o ', em: 'bigode chinês', after: '' },
        text: 'Os sulcos ao redor da boca deixam o semblante mais sério e cansado. Suavizá-los de forma sutil traz leveza, sem aquele aspecto preenchido.',
        area: 'bigode chinês',
      },
    ],
    carouselIntro: 'Elas confiaram na Dra. Laura. Deslize e veja mais resultados.',
    carouselAlt:
      'Resultado de tratamento na Clínica Laura Tavares, paciente com autorização de imagem',
  },
  method: {
    name: 'Protocolo Identidade LT',
    eyebrow: 'COMO FUNCIONA',
    title: { before: 'Um método para rejuvenescer ', em: 'sem exageros.', after: '' },
    lead: 'O Protocolo Identidade LT nasceu de 9 anos e mais de 25 mil atendimentos. Ele parte de uma ideia simples: o seu rosto tem uma história, e o tratamento deve respeitá-la.',
    steps: [
      {
        title: 'Escuta',
        text: 'Você conta o que incomoda e o que não quer perder. A conversa vem antes de qualquer agulha.',
        icon: 'ear',
      },
      {
        title: 'Análise facial',
        text: 'A Dra. avalia estrutura, pele e expressões para entender a causa do envelhecimento, não só o sintoma.',
        icon: 'scan',
      },
      {
        title: 'Plano individual',
        text: 'Um protocolo desenhado para você, com etapas, prazos e expectativas explicadas com clareza.',
        icon: 'clipboard-text',
      },
      {
        title: 'Acompanhamento',
        text: 'Retorno para avaliar a evolução e planejar a manutenção no tempo certo.',
        icon: 'arrows-clockwise',
      },
    ],
    cta: 'Quero começar pela avaliação',
  },
  about: {
    eyebrow: 'QUEM CUIDA DE VOCÊ',
    title: { before: 'Prazer, ', em: 'Laura Tavares.', after: '' },
    paragraphs: [
      'Há 9 anos, a Dra. Laura Tavares escolheu um caminho diferente na estética: o de rejuvenescer sem apagar quem a paciente é. Em 2018 abriu a clínica no Sudoeste e, em oito anos, fez dela uma das referências em harmonização facial de Brasília.',
      'São mais de 25 mil atendimentos, formação internacional no AMWC Coreia 2026, o maior congresso de estética avançada do mundo, e o prêmio de Melhor Atendimento no Santa Permuta 2026. Mas o que as pacientes mais comentam é outra coisa: ela escuta antes de indicar qualquer procedimento.',
    ],
    education: null,
    quote: {
      text: 'Meu compromisso é entregar segurança, planejamento e resultados que respeitem a individualidade.',
      source: 'Revista Orla BSB',
    },
    signature: 'Laura Tavares',
    stats: [
      { value: '+25 mil', label: 'atendimentos', countTo: 25, prefix: '+', suffix: ' mil' },
      { value: '9 anos', label: 'de experiência', countTo: 9, suffix: ' anos' },
      { value: '8 anos', label: 'de clínica no Sudoeste', countTo: 8, suffix: ' anos' },
      { value: 'AMWC', label: 'Coreia 2026' },
    ],
    cta: 'Agendar avaliação com a Dra. Laura',
    imageAlt: 'Retrato da Dra. Laura Tavares',
  },
  testimonials: {
    eyebrow: 'QUEM JÁ VIVEU A EXPERIÊNCIA',
    title: { before: 'Mulheres reais. ', em: 'Histórias reais.', after: '' },
    lead: 'Mais do que um resultado bonito, elas encontraram um lugar onde se sentem ouvidas e seguras.',
    cta: 'Quero ser a próxima história',
  },
  clinic: {
    eyebrow: 'A CLÍNICA',
    title: { before: 'Um espaço pensado para ', em: 'você desacelerar.', after: '' },
    text: 'No coração do Sudoeste, a Clínica Laura Tavares foi criada para ser uma pausa no seu dia. Ambiente acolhedor, equipe treinada para receber bem e tecnologia de ponta, incluindo protocolos e produtos de K-Beauty trazidos diretamente da Coreia.',
    highlights: [
      { label: 'Equipe premiada em atendimento', icon: 'medal' },
      { label: 'Tecnologia e produtos coreanos', icon: 'sparkle' },
      { label: 'Ambiente reservado e acolhedor', icon: 'armchair' },
      { label: 'Segunda a sábado, com hora marcada', icon: 'calendar-check' },
    ],
    gallery: [
      {
        slot: 'recepcao',
        caption: 'Recepção',
        alt: 'Recepção da Clínica Laura Tavares, Estética Avançada, no CLSW 303',
      },
      {
        slot: 'sala',
        caption: 'Sala de procedimentos',
        alt: 'Sala de procedimentos da Clínica Laura Tavares',
      },
      {
        slot: 'equipe',
        caption: 'Nossa equipe',
        alt: 'Equipe da Clínica Laura Tavares em frente ao letreiro da clínica',
      },
      {
        slot: 'detalhes',
        caption: 'Detalhes que cuidam de você',
        alt: 'Detalhes da Clínica Laura Tavares',
      },
    ],
  },
  faq: {
    eyebrow: 'DÚVIDAS',
    title: { before: 'Tudo o que você quer saber ', em: 'antes de agendar.', after: '' },
    items: [
      {
        question: 'Vou ficar com o rosto artificial?',
        answer:
          'Não é esse o objetivo. Cada plano é feito para realçar os seus traços, com doses e pontos definidos para o seu rosto. A ideia é que as pessoas notem você mais descansada, não um procedimento.',
      },
      {
        question: 'Como funciona a avaliação?',
        answer:
          'É uma consulta com a Dra. Laura para ouvir suas queixas, analisar seu rosto e montar um plano individual. Você sai sabendo o que faz sentido, por quê e em quantas etapas.',
      },
      {
        question: 'Dói?',
        answer:
          'O desconforto costuma ser leve. Usamos anestésicos e técnicas que deixam a sessão mais tranquila.',
      },
      {
        question: 'Preciso me afastar da rotina?',
        answer:
          'Na maioria dos procedimentos, não. Pode haver um leve inchaço ou pontos roxos nos primeiros dias, e a Dra. passa todos os cuidados.',
      },
      {
        question: 'Quanto tempo dura o resultado?',
        answer:
          'Depende do procedimento, da área tratada e do seu organismo. Na avaliação, você recebe a estimativa e o plano de manutenção.',
      },
      {
        question: 'Qual a diferença entre preenchimento e toxina botulínica?',
        answer:
          'O preenchimento repõe volume e define contornos, como lábios e mandíbula. A toxina relaxa músculos para suavizar rugas de expressão, como na testa e nos olhos. Muitas vezes os dois se complementam.',
      },
      {
        question: 'A partir de que idade posso fazer?',
        answer:
          'Não existe idade certa, existe indicação. A Dra. avalia cada caso e só indica o que for seguro e necessário para você.',
      },
      {
        question: 'Quanto custa?',
        answer:
          'O valor depende do plano indicado para o seu rosto, por isso é definido na avaliação. Fale com a nossa equipe pelo WhatsApp para agendar.',
      },
      {
        question: 'Onde fica a clínica?',
        answer:
          'CLSW 303, Bloco C, sala 70, Edifício Le Parc, Sudoeste, Brasília. Atendimento de segunda a sábado, com hora marcada.',
      },
    ],
    ctaLead: 'Ainda com dúvida?',
    cta: 'Fale com a nossa equipe no WhatsApp',
  },
  finalCta: {
    eyebrow: 'O PRIMEIRO PASSO',
    title: { before: 'O seu rosto tem uma história. ', em: 'Vamos cuidar dela juntas?', after: '' },
    text: 'Agende sua avaliação com a Dra. Laura Tavares e receba um plano pensado só para você.',
    button: 'Agendar pelo WhatsApp',
    support: 'Segunda a sábado · CLSW 303, Sudoeste · Brasília',
    mapsLabel: 'Abrir no Google Maps',
    wazeLabel: 'Abrir no Waze',
  },
  footer: {
    technicianLabel: 'Responsável técnica',
    copyright: '© 2026 Clínica Laura Tavares',
    privacyLabel: 'Política de privacidade',
    whatsappLabel: 'WhatsApp',
    instagramLabel: 'Instagram',
  },
  floatingButton: { label: 'Agende pelo WhatsApp' },
  privacy: {
    title: 'Política de privacidade',
    seoTitle: 'Política de privacidade | Clínica Laura Tavares',
    seoDescription:
      'Como a Clínica Laura Tavares trata dados neste site: sem formulários, sem cookies e sem ferramentas de análise.',
    updated: 'Última atualização: 5 de outubro de 2026.',
    sections: [
      {
        heading: 'Quem somos',
        paragraphs: [
          'Este site é da Clínica Laura Tavares — Estética Avançada, CLSW 303, Bloco C, sala 70, Edifício Le Parc, Sudoeste, Brasília – DF, 70673-623. Contato: WhatsApp (61) 98100-7522.',
        ],
      },
      {
        heading: 'O que este site coleta',
        paragraphs: [
          'Este site não tem formulários, não usa cookies e não usa ferramentas de análise, publicidade ou rastreamento. Fontes, imagens e vídeos são servidos pelo próprio site, sem chamadas a serviços de terceiros durante a navegação.',
        ],
      },
      {
        heading: 'Registros técnicos da hospedagem',
        paragraphs: [
          'O site é hospedado pela Vercel. Como qualquer servidor, a hospedagem registra dados técnicos de acesso, como endereço IP, data e hora, página acessada e tipo de navegador, para segurança e funcionamento do serviço, conforme a política de privacidade da Vercel.',
        ],
      },
      {
        heading: 'Contato pelo WhatsApp',
        paragraphs: [
          'Os botões de agendamento abrem o WhatsApp com uma mensagem pronta que informa apenas de qual parte do site você veio. A partir daí, a conversa acontece no WhatsApp e segue a política de privacidade do WhatsApp (Meta). Os dados que você compartilhar na conversa são usados somente para responder você e organizar o seu atendimento.',
        ],
      },
      {
        heading: 'Links para outros sites',
        paragraphs: [
          'Links para Instagram, Google Maps, Waze e matérias de imprensa levam a sites de terceiros, que têm políticas de privacidade próprias.',
        ],
      },
      {
        heading: 'Seus direitos',
        paragraphs: [
          'Pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode pedir confirmação, acesso, correção ou eliminação dos seus dados pessoais tratados pela clínica. Para isso, fale com a nossa equipe pelo WhatsApp (61) 98100-7522.',
        ],
      },
    ],
  },
  pending: [
    {
      id: 'registro-profissional',
      description:
        'Profissão, conselho e número de registro da Dra. (rodapé e seção Sobre) — obrigatório antes de publicar em domínio próprio.',
      fields: ['responsibleTechnician.profession', 'responsibleTechnician.registration'],
      blocksCustomDomain: true,
    },
    {
      id: 'autorizacao-imagens',
      description: 'Termos de autorização de imagem dos antes/depois e dos depoimentos usados.',
      fields: ['results.legend'],
      blocksCustomDomain: false,
    },
    {
      id: 'logo-vetor',
      description: 'Logo em vetor (SVG/PDF) e assinatura real em SVG.',
      fields: ['brand.wordmark', 'about.signature'],
      blocksCustomDomain: false,
    },
    {
      id: 'horario-estacionamento',
      description: 'Horário exato de funcionamento e se há estacionamento.',
      fields: ['business.openingHours'],
      blocksCustomDomain: false,
    },
    {
      id: 'nome-metodo-tratamentos',
      description:
        'Nome final do método (Protocolo Identidade LT × Método LT) e lista final de tratamentos.',
      fields: ['method.name', 'treatments.items'],
      blocksCustomDomain: false,
    },
    {
      id: 'segundo-numero',
      description: 'Função do segundo número, (61) 98105-1565.',
      fields: ['whatsapp.number'],
      blocksCustomDomain: false,
    },
    {
      id: 'formacao-academica',
      description: 'Formação acadêmica da Dra. (uma linha no Sobre).',
      fields: ['about.education'],
      blocksCustomDomain: false,
    },
  ],
};

const parsed = siteSchema.safeParse(siteData);
if (!parsed.success) {
  throw new Error(`Conteúdo inválido em src/content/site.ts:\n${z.prettifyError(parsed.error)}`);
}

export const site: Site = parsed.data;
```

- [ ] **Step 6: Rodar e ver passar**

Run: `npm test`
Expected: PASS — `site.test.ts` (18 testes), `pending.test.ts` (5) e `text.test.ts` (4).

- [ ] **Step 7: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck`
Expected: tudo verde.

```bash
git add package.json package-lock.json src/content
git commit -m "$(cat <<'EOF'
feat: conteúdo tipado com zod e marcação de campos pendentes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: `whatsappLink()` — TDD

**Files:**
- Create: `src/lib/whatsapp.ts`, `src/lib/whatsapp.test.ts`

**Interfaces:**
- Consumes: `site.whatsapp.number`, `site.whatsapp.messages` (Task 4).
- Produces:
  - `type WhatsAppOrigin = 'general' | 'result' | 'treatment' | 'faq'`
  - `buildWhatsAppLink(number: string, template: string, detail?: string): string`
  - `whatsappLink(origin: 'general' | 'faq'): string` e `whatsappLink(origin: 'result' | 'treatment', detail: string): string` (sobrecargas)

- [ ] **Step 1: Escrever o teste que falha — `src/lib/whatsapp.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { buildWhatsAppLink, whatsappLink } from './whatsapp';

const PREFIX = 'https://api.whatsapp.com/send?phone=5561981007522&text=';

function messageOf(link: string): string {
  return new URL(link).searchParams.get('text') ?? '';
}

describe('whatsappLink', () => {
  it('usa o número 5561981007522 em todas as origens', () => {
    const links = [
      whatsappLink('general'),
      whatsappLink('faq'),
      whatsappLink('result', 'olheiras'),
      whatsappLink('treatment', 'harmonização facial'),
    ];
    for (const link of links) {
      expect(link.startsWith(PREFIX)).toBe(true);
      expect(new URL(link).searchParams.get('phone')).toBe('5561981007522');
    }
  });

  it('mensagem geral (hero e CTA final) literal do copy, codificada', () => {
    expect(messageOf(whatsappLink('general'))).toBe(
      'Olá! Vim pelo site e gostaria de agendar uma avaliação com a Dra. Laura.',
    );
    expect(whatsappLink('general')).toBe(
      `${PREFIX}Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20agendar%20uma%20avalia%C3%A7%C3%A3o%20com%20a%20Dra.%20Laura.`,
    );
  });

  it('mensagem do FAQ literal do copy', () => {
    expect(messageOf(whatsappLink('faq'))).toBe('Olá! Tenho uma dúvida antes de agendar.');
  });

  it('troca o [detalhe] dos blocos de resultado', () => {
    expect(messageOf(whatsappLink('result', 'bigode chinês'))).toBe(
      'Olá! Vi os resultados no site e quero saber mais sobre bigode chinês.',
    );
  });

  it('troca o [tratamento] dos cards e codifica acentos, espaços e o +', () => {
    const link = whatsappLink('treatment', 'rejuvenescimento 40+');
    expect(messageOf(link)).toBe('Olá! Tenho interesse em rejuvenescimento 40+. Podem me ajudar?');
    expect(link).toBe(
      `${PREFIX}Ol%C3%A1!%20Tenho%20interesse%20em%20rejuvenescimento%2040%2B.%20Podem%20me%20ajudar%3F`,
    );
    expect(link).not.toContain(' ');
  });
});

describe('buildWhatsAppLink', () => {
  const number = '5561981007522';

  it('codifica &, #, ? e $& do detalhe sem quebrar a URL', () => {
    const link = buildWhatsAppLink(number, 'Sobre {detail}.', 'A & B #1? $&');
    expect(messageOf(link)).toBe('Sobre A & B #1? $&.');
    expect(link).toContain('A%20%26%20B%20%231%3F%20%24%26');
  });

  it('apara espaços do detalhe', () => {
    expect(messageOf(buildWhatsAppLink(number, 'Sobre {detail}.', '  lábios  '))).toBe(
      'Sobre lábios.',
    );
  });

  it('exige detalhe quando a mensagem tem {detail}', () => {
    expect(() => buildWhatsAppLink(number, 'Sobre {detail}.')).toThrow(/exige um detalhe/);
    expect(() => buildWhatsAppLink(number, 'Sobre {detail}.', '   ')).toThrow(/exige um detalhe/);
  });

  it('recusa detalhe em mensagem sem {detail}', () => {
    expect(() => buildWhatsAppLink(number, 'Olá!', 'x')).toThrow(/não aceita detalhe/);
  });

  it('recusa detalhe com colchetes (placeholder do copy não preenchido)', () => {
    expect(() => buildWhatsAppLink(number, 'Sobre {detail}.', '[tratamento]')).toThrow(/colchetes/);
  });

  it('recusa número fora do formato 55 + DDD + telefone', () => {
    expect(() => buildWhatsAppLink('61981007522', 'Olá!')).toThrow(/número/);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- src/lib/whatsapp.test.ts`
Expected: FAIL com `Failed to resolve import "./whatsapp"`.

- [ ] **Step 3: Implementar `src/lib/whatsapp.ts`**

```ts
import { site, type Site } from '../content/site';

export type WhatsAppOrigin = keyof Site['whatsapp']['messages'];

const DETAIL = '{detail}';

/** Monta o link do WhatsApp a partir do número e do modelo da mensagem (com `{detail}` quando houver). */
export function buildWhatsAppLink(number: string, template: string, detail?: string): string {
  if (!/^55\d{10,11}$/.test(number)) {
    throw new Error(`WhatsApp: número "${number}" fora do formato 55 + DDD + telefone.`);
  }
  const needsDetail = template.includes(DETAIL);
  const value = detail?.trim();
  if (needsDetail && !value) {
    throw new Error(`WhatsApp: a mensagem "${template}" exige um detalhe (tratamento ou área).`);
  }
  if (!needsDetail && detail !== undefined) {
    throw new Error(`WhatsApp: a mensagem "${template}" não aceita detalhe.`);
  }
  if (value && /[[\]]/.test(value)) {
    throw new Error(`WhatsApp: detalhe "${value}" com colchetes — preencha o dado real.`);
  }
  const message = needsDetail ? template.replace(DETAIL, () => value ?? '') : template;
  return `https://api.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(message)}`;
}

export function whatsappLink(origin: 'general' | 'faq'): string;
export function whatsappLink(origin: 'result' | 'treatment', detail: string): string;
export function whatsappLink(origin: WhatsAppOrigin, detail?: string): string {
  return buildWhatsAppLink(site.whatsapp.number, site.whatsapp.messages[origin], detail);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- src/lib/whatsapp.test.ts`
Expected: PASS — `Tests  11 passed`.

- [ ] **Step 5: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add src/lib/whatsapp.ts src/lib/whatsapp.test.ts
git commit -m "$(cat <<'EOF'
feat: whatsappLink com mensagens do copy por origem

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Resolvedor de mídia, placeholders e ícones do site — TDD

**Files:**
- Create: `public/favicon.svg`, `scripts/make-placeholders.mjs`, `src/assets/placeholders/{portrait,landscape,tall,before,after}.jpg` (gerados), `public/apple-touch-icon.png` (gerado), `public/og.jpg` (provisória, gerada), `src/content/media.ts`, `src/content/media.test.ts`
- Modify: `package.json` (sharp, script `placeholders`)

**Interfaces:**
- Consumes: nada além do Node/sharp.
- Produces (`src/content/media.ts`):
  - `PLACEHOLDER_KINDS = ['portrait','landscape','tall','before','after'] as const`, `type PlaceholderKind`
  - `MEDIA_SLOTS` (18 slots → formato do placeholder), `type MediaSlot`, `MEDIA_POSITION: Partial<Record<MediaSlot, string>>`, `MIN_CAROUSEL = 6`
  - `interface ResolvedImage { slot: string; image: ImageMetadata; isPlaceholder: boolean; position: string }`
  - `interface MediaResolver { get(slot: MediaSlot): ResolvedImage; carousel(): ResolvedImage[]; support(name: string): ImageMetadata | undefined; reportLines(): string[] }`
  - `createMediaResolver(input: { images: Record<string, ImageMetadata>; placeholders: Record<PlaceholderKind, ImageMetadata>; files: string[] }): MediaResolver`
  - `normalizeImageKeys(modules, prefix)`, `toPlaceholderMap(modules)`, `listMediaFiles(root?: string): string[]`, `altText(resolved: Pick<ResolvedImage, 'isPlaceholder'>, alt: string): string`
  - `media: MediaResolver` (instância do site, via `import.meta.glob`)

- [ ] **Step 1: Instalar o sharp e registrar o script**

```bash
npm install --save-exact sharp@0.35.5
npm pkg set scripts.placeholders="node scripts/make-placeholders.mjs"
```

- [ ] **Step 2: Criar `public/favicon.svg`** (motivo do arco da marca; não é logo — o logo oficial é pendência da clínica)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#8C4A55"/>
  <path d="M20 50V31a12 12 0 0 1 24 0v19" fill="none" stroke="#D4B27A" stroke-width="3.5" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 3: Criar `scripts/make-placeholders.mjs`**

```js
// Gera placeholders elegantes (sem texto) nas cores da marca, o apple-touch-icon e a imagem OG provisória.
// Uso: npm run placeholders — idempotente; não sobrescreve public/og.jpg se ela já existir (a Task 32 gera a final).
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const path = (relative) => fileURLToPath(new URL(relative, root));

const KINDS = {
  portrait: { width: 1280, height: 1600, base: '#EBCBC3', glow: '#F1DCD6' },
  landscape: { width: 1600, height: 1200, base: '#EBCBC3', glow: '#F1DCD6' },
  tall: { width: 900, height: 1200, base: '#F1DCD6', glow: '#FBF6F2' },
  before: { width: 1280, height: 1600, base: '#E4B9B0', glow: '#EBCBC3' },
  after: { width: 1280, height: 1600, base: '#F1DCD6', glow: '#FBF6F2' },
};

function archSvg({ width, height, base, glow }) {
  const archWidth = Math.round(width * 0.56);
  const archHeight = Math.round(height * 0.62);
  const x = Math.round((width - archWidth) / 2);
  const y = Math.round(height * 0.2);
  const radius = archWidth / 2;
  const stroke = Math.max(2, Math.round(width / 640));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs><radialGradient id="g" cx="50%" cy="38%" r="65%"><stop offset="0" stop-color="${glow}"/><stop offset="1" stop-color="${base}"/></radialGradient></defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <path d="M${x} ${y + archHeight} V${y + radius} A${radius} ${radius} 0 0 1 ${x + archWidth} ${y + radius} V${y + archHeight} Z" fill="none" stroke="#B8925A" stroke-opacity="0.45" stroke-width="${stroke}"/>
</svg>`;
}

mkdirSync(path('src/assets/placeholders/'), { recursive: true });
for (const [name, spec] of Object.entries(KINDS)) {
  const out = path(`src/assets/placeholders/${name}.jpg`);
  await sharp(Buffer.from(archSvg(spec))).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
  console.log(`placeholder: src/assets/placeholders/${name}.jpg`);
}

await sharp(readFileSync(path('public/favicon.svg')), { density: 300 })
  .resize(180, 180)
  .png()
  .toFile(path('public/apple-touch-icon.png'));
console.log('ícone: public/apple-touch-icon.png');

const og = path('public/og.jpg');
if (existsSync(og)) {
  console.log('public/og.jpg já existe — mantida.');
} else {
  const ogSvg = archSvg({ width: 1200, height: 630, base: '#F3E3DE', glow: '#FBF6F2' });
  await sharp(Buffer.from(ogSvg)).jpeg({ quality: 85, mozjpeg: true }).toFile(og);
  console.log('og provisória: public/og.jpg');
}
```

- [ ] **Step 4: Gerar e conferir as dimensões**

```bash
npm run placeholders
node -e "import('sharp').then(async ({ default: sharp }) => { for (const f of ['src/assets/placeholders/portrait.jpg','src/assets/placeholders/landscape.jpg','src/assets/placeholders/tall.jpg','src/assets/placeholders/before.jpg','src/assets/placeholders/after.jpg','public/apple-touch-icon.png','public/og.jpg']) { const m = await sharp(f).metadata(); console.log(f, m.width + 'x' + m.height, m.format); } })"
```

Expected: `portrait 1280x1600 jpeg`, `landscape 1600x1200 jpeg`, `tall 900x1200 jpeg`, `before 1280x1600 jpeg`, `after 1280x1600 jpeg`, `apple-touch-icon.png 180x180 png`, `og.jpg 1200x630 jpeg`.

- [ ] **Step 5: Escrever o teste que falha — `src/content/media.test.ts`**

```ts
import type { ImageMetadata } from 'astro';
import { describe, expect, it } from 'vitest';
import {
  altText,
  createMediaResolver,
  MEDIA_SLOTS,
  MIN_CAROUSEL,
  normalizeImageKeys,
  PLACEHOLDER_KINDS,
  toPlaceholderMap,
  type PlaceholderKind,
} from './media';

const image = (src: string): ImageMetadata => ({ src, width: 1280, height: 1600, format: 'jpg' });
const placeholders = Object.fromEntries(
  PLACEHOLDER_KINDS.map((kind) => [kind, image(`/ph/${kind}.jpg`)]),
) as Record<PlaceholderKind, ImageMetadata>;

describe('normalizeImageKeys', () => {
  it('remove o prefixo e a extensão', () => {
    const keys = normalizeImageKeys({ '/src/assets/media/dra/hero.jpg': image('a') }, '/src/assets/media/');
    expect(Object.keys(keys)).toEqual(['dra/hero']);
  });

  it('mantém o primeiro arquivo em ordem alfabética quando há duplicata', () => {
    const keys = normalizeImageKeys({ '/m/dra/hero.png': image('png'), '/m/dra/hero.jpg': image('jpg') }, '/m/');
    expect(keys['dra/hero']?.src).toBe('jpg');
  });
});

describe('toPlaceholderMap', () => {
  it('monta o mapa dos 5 formatos', () => {
    const modules = Object.fromEntries(
      PLACEHOLDER_KINDS.map((kind) => [`/src/assets/placeholders/${kind}.jpg`, image(kind)]),
    );
    expect(Object.keys(toPlaceholderMap(modules)).sort()).toEqual([...PLACEHOLDER_KINDS].sort());
  });

  it('falha listando os formatos que faltam', () => {
    expect(() => toPlaceholderMap({ '/src/assets/placeholders/portrait.jpg': image('p') })).toThrow(
      /landscape, tall, before, after/,
    );
  });
});

describe('createMediaResolver', () => {
  it('cobre os 18 slots do contrato', () => {
    expect(Object.keys(MEDIA_SLOTS)).toHaveLength(18);
  });

  it('usa a foto real quando o arquivo do contrato existe', () => {
    const hero = image('/real/hero.jpg');
    const media = createMediaResolver({ images: { 'dra/hero': hero }, placeholders, files: ['dra/hero.jpg'] });
    expect(media.get('dra/hero')).toEqual({
      slot: 'dra/hero',
      image: hero,
      isPlaceholder: false,
      position: 'center 20%',
    });
  });

  it('cai para o placeholder do formato do slot', () => {
    const media = createMediaResolver({ images: {}, placeholders, files: [] });
    expect(media.get('resultados/olhar-antes').image).toBe(placeholders.before);
    expect(media.get('resultados/olhar-depois').image).toBe(placeholders.after);
    expect(media.get('clinica/sala').image).toBe(placeholders.landscape);
    expect(media.get('tratamentos/kbeauty').image).toBe(placeholders.portrait);
    expect(media.get('dra/hero')).toMatchObject({ isPlaceholder: true, position: 'center' });
  });

  it('ordena o carrossel pelo número e ignora nomes fora do padrão', () => {
    const media = createMediaResolver({
      images: {
        'carrossel/resultado-10': image('10'),
        'carrossel/resultado-02': image('02'),
        'carrossel/resultado-01': image('01'),
        'carrossel/foto': image('x'),
      },
      placeholders,
      files: [],
    });
    expect(media.carousel().map((shot) => shot.image.src)).toEqual(['01', '02', '10']);
  });

  it('usa placeholders altos quando o carrossel está vazio', () => {
    const shots = createMediaResolver({ images: {}, placeholders, files: [] }).carousel();
    expect(shots).toHaveLength(MIN_CAROUSEL);
    expect(shots.every((shot) => shot.isPlaceholder && shot.image === placeholders.tall)).toBe(true);
  });

  it('expõe imagens de apoio por nome', () => {
    const texture = image('textura');
    const media = createMediaResolver({ images: { 'apoio/textura-rose': texture }, placeholders, files: [] });
    expect(media.support('textura-rose')).toBe(texture);
    expect(media.support('nao-existe')).toBeUndefined();
  });
});

describe('reportLines', () => {
  it('relata cada slot em placeholder e o carrossel vazio', () => {
    const lines = createMediaResolver({ images: {}, placeholders, files: [] }).reportLines();
    expect(lines).toContain('placeholder em uso: dra/hero (esperado src/assets/media/dra/hero.jpg)');
    expect(lines.filter((line) => line.startsWith('placeholder em uso'))).toHaveLength(18);
    expect(lines).toContain(
      'carrossel sem fotos: usando 6 placeholders (esperado src/assets/media/carrossel/resultado-01.jpg em diante)',
    );
  });

  it('relata arquivos fora do contrato (maiúsculas, extensão, numeração de 1 dígito) e ignora .gitkeep', () => {
    const media = createMediaResolver({
      images: {},
      placeholders,
      files: ['.gitkeep', 'carrossel/resultado-1.jpg', 'clinica/recepcao.jpg', 'dra/Hero.jpg', 'dra/sobre.JPG'],
    });
    const lines = media.reportLines();
    expect(lines).toContain('arquivo ignorado: dra/Hero.jpg (nome ou extensão fora do contrato)');
    expect(lines).toContain('arquivo ignorado: dra/sobre.JPG (nome ou extensão fora do contrato)');
    expect(lines).toContain('arquivo ignorado: carrossel/resultado-1.jpg (nome ou extensão fora do contrato)');
    expect(lines.some((line) => line.includes('clinica/recepcao.jpg'))).toBe(false);
    expect(lines.some((line) => line.includes('.gitkeep'))).toBe(false);
  });

  it('relata duplicatas, carrossel curto e numeração fora de sequência', () => {
    const media = createMediaResolver({
      images: { 'carrossel/resultado-01': image('1'), 'carrossel/resultado-03': image('3') },
      placeholders,
      files: ['dra/hero.png', 'carrossel/resultado-03.jpg', 'dra/hero.jpg', 'carrossel/resultado-01.jpg'],
    });
    const lines = media.reportLines();
    expect(lines).toContain('arquivo duplicado: dra/hero.png (já usando dra/hero.jpg)');
    expect(lines).toContain('carrossel com 2 fotos (mínimo do contrato: 6)');
    expect(lines).toContain('carrossel com numeração fora de sequência: 01, 03');
  });
});

describe('altText', () => {
  it('usa o alt do copy na foto real e alt vazio no placeholder', () => {
    const media = createMediaResolver({ images: { 'dra/hero': image('h') }, placeholders, files: [] });
    expect(altText(media.get('dra/hero'), 'Dra. Laura')).toBe('Dra. Laura');
    expect(altText(media.get('dra/sobre'), 'Retrato')).toBe('');
  });
});
```

- [ ] **Step 6: Rodar e ver falhar**

Run: `npm test -- src/content/media.test.ts`
Expected: FAIL com `Failed to resolve import "./media"`.

- [ ] **Step 7: Implementar `src/content/media.ts`**

```ts
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { ImageMetadata } from 'astro';

export const PLACEHOLDER_KINDS = ['portrait', 'landscape', 'tall', 'before', 'after'] as const;
export type PlaceholderKind = (typeof PLACEHOLDER_KINDS)[number];

/** Slots do contrato com a frente de mídia → formato do placeholder usado enquanto o arquivo não chega. */
export const MEDIA_SLOTS = {
  'dra/hero': 'portrait',
  'dra/sobre': 'portrait',
  'clinica/recepcao': 'landscape',
  'clinica/sala': 'landscape',
  'clinica/equipe': 'landscape',
  'clinica/detalhes': 'landscape',
  'resultados/olhar-antes': 'before',
  'resultados/olhar-depois': 'after',
  'resultados/mandibula-antes': 'before',
  'resultados/mandibula-depois': 'after',
  'resultados/labios-antes': 'before',
  'resultados/labios-depois': 'after',
  'resultados/bigode-antes': 'before',
  'resultados/bigode-depois': 'after',
  'tratamentos/harmonizacao': 'portrait',
  'tratamentos/rejuvenescimento': 'portrait',
  'tratamentos/kbeauty': 'portrait',
  'tratamentos/corporal': 'portrait',
} as const satisfies Record<string, PlaceholderKind>;

export type MediaSlot = keyof typeof MEDIA_SLOTS;

/** Enquadramento (CSS object-position) por slot nas fotos reais; ajustado na Task 31. */
export const MEDIA_POSITION: Partial<Record<MediaSlot, string>> = {
  'dra/hero': 'center 20%',
  'dra/sobre': 'center 20%',
};

export const MIN_CAROUSEL = 6;

const IMAGE_EXTENSION = /\.(jpg|jpeg|png|webp|avif)$/;
const CAROUSEL_KEY = /^carrossel\/resultado-(\d{2,})$/;
const SUPPORT_KEY = /^apoio\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface ResolvedImage {
  slot: string;
  image: ImageMetadata;
  isPlaceholder: boolean;
  position: string;
}

export interface MediaResolver {
  get(slot: MediaSlot): ResolvedImage;
  carousel(): ResolvedImage[];
  support(name: string): ImageMetadata | undefined;
  reportLines(): string[];
}

export interface MediaResolverInput {
  /** Imagens encontradas, com chave relativa a src/assets/media sem extensão (ex.: "dra/hero"). */
  images: Record<string, ImageMetadata>;
  placeholders: Record<PlaceholderKind, ImageMetadata>;
  /** Todos os arquivos de src/assets/media (relativos, com extensão), só para o relatório. */
  files: string[];
}

/** Converte as chaves do import.meta.glob ("/src/assets/media/dra/hero.jpg") em "dra/hero". */
export function normalizeImageKeys(
  modules: Record<string, ImageMetadata>,
  prefix: string,
): Record<string, ImageMetadata> {
  const out: Record<string, ImageMetadata> = {};
  for (const path of Object.keys(modules).sort()) {
    const key = path.slice(prefix.length).replace(IMAGE_EXTENSION, '');
    if (!(key in out)) out[key] = modules[path] as ImageMetadata;
  }
  return out;
}

export function toPlaceholderMap(
  modules: Record<string, ImageMetadata>,
): Record<PlaceholderKind, ImageMetadata> {
  const byName = normalizeImageKeys(modules, '/src/assets/placeholders/');
  const missing = PLACEHOLDER_KINDS.filter((kind) => !byName[kind]);
  if (missing.length > 0) {
    throw new Error(
      `Placeholders ausentes em src/assets/placeholders/: ${missing.join(', ')} — rode "npm run placeholders".`,
    );
  }
  return Object.fromEntries(PLACEHOLDER_KINDS.map((kind) => [kind, byName[kind]])) as Record<
    PlaceholderKind,
    ImageMetadata
  >;
}

/** Lista os arquivos de src/assets/media (relativos, com barras normais), para o relatório do build. */
export function listMediaFiles(root: string = process.cwd()): string[] {
  const dir = join(root, 'src', 'assets', 'media');
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .map((path) => path.replaceAll('\\', '/'))
    .filter((path) => statSync(join(dir, path)).isFile())
    .sort();
}

/** Alt do copy na foto real; alt vazio enquanto for placeholder (decorativo). */
export function altText(resolved: Pick<ResolvedImage, 'isPlaceholder'>, alt: string): string {
  return resolved.isPlaceholder ? '' : alt;
}

function isKnownKey(key: string): boolean {
  return key in MEDIA_SLOTS || CAROUSEL_KEY.test(key) || SUPPORT_KEY.test(key);
}

export function createMediaResolver({ images, placeholders, files }: MediaResolverInput): MediaResolver {
  const carouselEntries = Object.keys(images)
    .map((key) => ({ key, match: CAROUSEL_KEY.exec(key) }))
    .filter((entry): entry is { key: string; match: RegExpExecArray } => entry.match !== null)
    .map(({ key, match }) => ({ key, number: Number(match[1]) }))
    .sort((a, b) => a.number - b.number);

  const get = (slot: MediaSlot): ResolvedImage => {
    const real = images[slot];
    if (real) return { slot, image: real, isPlaceholder: false, position: MEDIA_POSITION[slot] ?? 'center' };
    return { slot, image: placeholders[MEDIA_SLOTS[slot]], isPlaceholder: true, position: 'center' };
  };

  const carousel = (): ResolvedImage[] => {
    if (carouselEntries.length === 0) {
      return Array.from({ length: MIN_CAROUSEL }, (_, index) => ({
        slot: `carrossel/placeholder-${index + 1}`,
        image: placeholders.tall,
        isPlaceholder: true,
        position: 'center',
      }));
    }
    return carouselEntries.map(({ key }) => ({
      slot: key,
      image: images[key] as ImageMetadata,
      isPlaceholder: false,
      position: 'center',
    }));
  };

  const support = (name: string): ImageMetadata | undefined => images[`apoio/${name}`];

  const reportLines = (): string[] => {
    const lines: string[] = [];
    for (const slot of Object.keys(MEDIA_SLOTS) as MediaSlot[]) {
      if (!images[slot]) lines.push(`placeholder em uso: ${slot} (esperado src/assets/media/${slot}.jpg)`);
    }
    if (carouselEntries.length === 0) {
      lines.push(
        `carrossel sem fotos: usando ${MIN_CAROUSEL} placeholders (esperado src/assets/media/carrossel/resultado-01.jpg em diante)`,
      );
    } else {
      if (carouselEntries.length < MIN_CAROUSEL) {
        lines.push(`carrossel com ${carouselEntries.length} fotos (mínimo do contrato: ${MIN_CAROUSEL})`);
      }
      if (carouselEntries.some((entry, index) => entry.number !== index + 1)) {
        const numbers = carouselEntries.map((entry) => entry.key.split('-').pop()).join(', ');
        lines.push(`carrossel com numeração fora de sequência: ${numbers}`);
      }
    }
    const seen = new Map<string, string>();
    for (const file of [...files].sort()) {
      if (file.endsWith('.gitkeep')) continue;
      const key = file.replace(IMAGE_EXTENSION, '');
      if (!IMAGE_EXTENSION.test(file) || !isKnownKey(key)) {
        lines.push(`arquivo ignorado: ${file} (nome ou extensão fora do contrato)`);
        continue;
      }
      const previous = seen.get(key);
      if (previous) lines.push(`arquivo duplicado: ${file} (já usando ${previous})`);
      else seen.set(key, file);
    }
    return lines;
  };

  return { get, carousel, support, reportLines };
}

const mediaModules = import.meta.glob<ImageMetadata>('/src/assets/media/**/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
});
const placeholderModules = import.meta.glob<ImageMetadata>('/src/assets/placeholders/*.jpg', {
  eager: true,
  import: 'default',
});

/** Instância usada pelos componentes (fotos reais da frente de mídia + placeholders). */
export const media: MediaResolver = createMediaResolver({
  images: normalizeImageKeys(mediaModules, '/src/assets/media/'),
  placeholders: toPlaceholderMap(placeholderModules),
  files: listMediaFiles(),
});
```

- [ ] **Step 8: Rodar e ver passar**

Run: `npm test -- src/content/media.test.ts`
Expected: PASS — `Tests  14 passed`.

- [ ] **Step 9: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add package.json package-lock.json public/favicon.svg public/apple-touch-icon.png public/og.jpg scripts/make-placeholders.mjs src/assets/placeholders src/content/media.ts src/content/media.test.ts
git commit -m "$(cat <<'EOF'
feat: resolvedor de mídia com placeholders e relatório de arquivos fora do contrato

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: BaseLayout com SEO (title, meta, canonical, Open Graph, JSON-LD), sitemap e robots.txt

**Files:**
- Create: `src/lib/seo.ts`, `src/lib/seo.test.ts`, `src/layouts/BaseLayout.astro`, `src/pages/robots.txt.ts`, `tests/dist/seo.test.ts`
- Modify: `astro.config.mjs` (sitemap), `src/pages/index.astro` (usa a BaseLayout), `package.json` (@astrojs/sitemap)

**Interfaces:**
- Consumes: `site` (Task 4), `media.reportLines()` (Task 6), `listPending` (Task 4), `import '../styles/index'` (Task 3).
- Produces:
  - `src/lib/seo.ts`: `interface BusinessJsonLd`, `interface FaqJsonLd`, `buildBusinessJsonLd(site: Site, options: { url: string; image: string }): BusinessJsonLd`, `buildFaqJsonLd(items: ReadonlyArray<{ question: string; answer: string }>): FaqJsonLd`, `serializeJsonLd(data: unknown): string`.
  - `BaseLayout.astro` — props `{ path: string; title?: string; description?: string; ogTitle?: string; jsonLd?: readonly object[] }`; slots `header`, padrão (dentro de `<main id="conteudo" tabindex="-1">`), `footer`, `after`.

- [ ] **Step 1: Instalar o sitemap e ligá-lo no `astro.config.mjs`** — substituir o arquivo inteiro por:

```bash
npm install --save-exact @astrojs/sitemap@3.7.4
```

```js
// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// URL pública usada em canonical, Open Graph, sitemap e robots. Confirmada na Task 38 (deploy).
const site = process.env.SITE_URL ?? 'https://clinicalauratavaress.vercel.app';

export default defineConfig({
  site,
  trailingSlash: 'never',
  build: { format: 'file' },
  devToolbar: { enabled: false },
  integrations: [sitemap()],
  vite: {
    build: {
      // Scripts processados nunca viram <script> inline: o CSP (Task 36) libera só 'self' + hashes conhecidos.
      assetsInlineLimit: (filePath) => (filePath.endsWith('.js') ? false : undefined),
    },
  },
});
```

- [ ] **Step 2: Escrever o teste unitário que falha — `src/lib/seo.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { site } from '../content/site';
import { buildBusinessJsonLd, buildFaqJsonLd, serializeJsonLd } from './seo';

describe('buildBusinessJsonLd', () => {
  const data = buildBusinessJsonLd(site, {
    url: 'https://exemplo.vercel.app/',
    image: 'https://exemplo.vercel.app/og.jpg',
  });

  it('descreve um HealthAndBeautyBusiness', () => {
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('HealthAndBeautyBusiness');
    expect(data.name).toBe('Clínica Laura Tavares');
    expect(data.alternateName).toBe('Clínica Laura Tavares — Estética Avançada');
  });

  it('traz telefone, endereço, fundação e redes do conteúdo', () => {
    expect(data.telephone).toBe('+5561981007522');
    expect(data.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: 'CLSW 303, Bloco C, sala 70, Edifício Le Parc, Sudoeste',
      addressLocality: 'Brasília',
      addressRegion: 'DF',
      postalCode: '70673-623',
      addressCountry: 'BR',
    });
    expect(data.foundingDate).toBe('2018');
    expect(data.sameAs).toEqual([
      'https://www.instagram.com/clinicalauratavaress/',
      'https://www.instagram.com/dra.lauratavares/',
    ]);
  });

  it('usa a url e a imagem informadas', () => {
    expect(data.url).toBe('https://exemplo.vercel.app/');
    expect(data.image).toBe('https://exemplo.vercel.app/og.jpg');
  });
});

describe('buildFaqJsonLd', () => {
  it('gera FAQPage com as 9 perguntas na ordem do copy', () => {
    const data = buildFaqJsonLd(site.faq.items);
    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity).toHaveLength(9);
    expect(data.mainEntity[2]).toEqual({
      '@type': 'Question',
      name: 'Dói?',
      acceptedAnswer: { '@type': 'Answer', text: site.faq.items[2]?.answer },
    });
  });
});

describe('serializeJsonLd', () => {
  it('escapa < > & para não fechar o <script>', () => {
    const out = serializeJsonLd({ text: '</script><b>&' });
    expect(out).not.toContain('</script>');
    expect(out).toBe('{"text":"\\u003c/script\\u003e\\u003cb\\u003e\\u0026"}');
    expect(JSON.parse(out)).toEqual({ text: '</script><b>&' });
  });
});
```

Run: `npm test -- src/lib/seo.test.ts`
Expected: FAIL com `Failed to resolve import "./seo"`.

- [ ] **Step 3: Implementar `src/lib/seo.ts`**

```ts
import type { Site } from '../content/site';

export interface BusinessJsonLd {
  '@context': 'https://schema.org';
  '@type': 'HealthAndBeautyBusiness';
  name: string;
  alternateName: string;
  description: string;
  url: string;
  image: string;
  telephone: string;
  foundingDate: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  sameAs: string[];
}

export interface FaqJsonLd {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: { '@type': 'Answer'; text: string };
  }>;
}

export function buildBusinessJsonLd(
  site: Site,
  { url, image }: { url: string; image: string },
): BusinessJsonLd {
  const { business } = site;
  return {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: business.name,
    alternateName: business.legalName,
    description: site.seo.description,
    url,
    image,
    telephone: `+${site.whatsapp.number}`,
    foundingDate: String(business.foundingYear),
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${business.address.street}, ${business.address.neighborhood}`,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
    sameAs: business.instagram.map((profile) => profile.url),
  };
}

export function buildFaqJsonLd(
  items: ReadonlyArray<{ question: string; answer: string }>,
): FaqJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/** JSON seguro para <script type="application/ld+json"> (não deixa fechar a tag). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
```

Run: `npm test -- src/lib/seo.test.ts`
Expected: PASS — `Tests  5 passed`.

- [ ] **Step 4: Escrever o teste de dist que falha — `tests/dist/seo.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { existsInDist, loadPage, readDist } from './load';

describe('SEO da página inicial', () => {
  it('usa title e meta description do copy', () => {
    const { document } = loadPage();
    expect(document.title).toBe('Harmonização Facial no Sudoeste | Dra. Laura Tavares');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Rejuvenescimento natural para 40+ no Sudoeste, Brasília. +25 mil atendimentos com a Dra. Laura Tavares. Agende sua avaliação pelo WhatsApp.',
    );
  });

  it('tem canonical absoluto igual ao og:url', () => {
    const { document } = loadPage();
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';
    expect(canonical).toMatch(/^https:\/\/[^/]+\/$/);
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(canonical);
  });

  it('tem Open Graph completo (pt_BR, 1200×630)', () => {
    const { document } = loadPage();
    const og = (property: string) =>
      document.querySelector(`meta[property="${property}"]`)?.getAttribute('content');
    expect(og('og:title')).toBe('Clínica Laura Tavares · Rejuvenescer sem deixar de ser você');
    expect(og('og:locale')).toBe('pt_BR');
    expect(og('og:image')).toMatch(/^https:\/\/.+\/og\.jpg$/);
    expect(og('og:image:width')).toBe('1200');
    expect(og('og:image:height')).toBe('630');
    expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe(
      'summary_large_image',
    );
  });

  it('publica JSON-LD HealthAndBeautyBusiness válido', () => {
    const { document } = loadPage();
    const blocks = Array.from(document.querySelectorAll('script[type="application/ld+json"]'), (script) =>
      JSON.parse(script.textContent ?? '{}'),
    );
    const business = blocks.find((block) => block['@type'] === 'HealthAndBeautyBusiness');
    expect(business?.telephone).toBe('+5561981007522');
    expect(business?.address?.postalCode).toBe('70673-623');
  });

  it('tem skip link para o main', () => {
    const { document } = loadPage();
    const skip = document.querySelector('a.skip-link');
    expect(skip?.getAttribute('href')).toBe('#conteudo');
    expect(skip?.textContent?.trim()).toBe('Pular para o conteúdo');
    expect(document.querySelector('main#conteudo')?.getAttribute('tabindex')).toBe('-1');
  });

  it('gera robots.txt apontando para o sitemap', () => {
    const robots = readDist('robots.txt');
    expect(robots).toContain('User-agent: *');
    expect(robots).toMatch(/Sitemap: https:\/\/.+\/sitemap-index\.xml/);
  });

  it('gera sitemap e publica favicon, apple-touch-icon e og.jpg', () => {
    expect(readDist('sitemap-0.xml')).toContain('<loc>');
    for (const file of ['favicon.svg', 'apple-touch-icon.png', 'og.jpg']) {
      expect(existsInDist(file)).toBe(true);
    }
  });
});
```

Run: `npm run build && npm run test:dist`
Expected: FAIL nos testes de `seo.test.ts` (sem title do copy, sem OG, sem robots).

- [ ] **Step 5: Criar `src/layouts/BaseLayout.astro`**

```astro
---
import '../styles/index';
import cormorant500 from '@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2?url';
import cormorant500Italic from '@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2?url';
import { site } from '../content/site';
import { serializeJsonLd } from '../lib/seo';

interface Props {
  /** Caminho da página para canonical/og:url, ex.: "/" ou "/politica-de-privacidade". */
  path: string;
  title?: string;
  description?: string;
  ogTitle?: string;
  jsonLd?: readonly object[];
}

const {
  path,
  title = site.seo.title,
  description = site.seo.description,
  ogTitle = site.seo.ogTitle,
  jsonLd = [],
} = Astro.props;

const canonical = new URL(path, Astro.site).href;
const ogImage = new URL('/og.jpg', Astro.site).href;
---

<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta name="theme-color" content="#FBF6F2" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="sitemap" href="/sitemap-index.xml" />
    <link rel="preload" href={cormorant500} as="font" type="font/woff2" crossorigin />
    <link rel="preload" href={cormorant500Italic} as="font" type="font/woff2" crossorigin />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:site_name" content={site.business.name} />
    <meta property="og:title" content={ogTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content={site.seo.ogImageAlt} />
    <meta name="twitter:card" content="summary_large_image" />
    {
      jsonLd.map((data) => (
        <script is:inline type="application/ld+json" set:html={serializeJsonLd(data)} />
      ))
    }
  </head>
  <body class="lt">
    <a class="skip-link" href="#conteudo">{site.ui.skipLink}</a>
    <slot name="header" />
    <main id="conteudo" tabindex="-1">
      <slot />
    </main>
    <slot name="footer" />
    <slot name="after" />
  </body>
</html>
```

- [ ] **Step 6: Criar `src/pages/robots.txt.ts`**

```ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap-index.xml', site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
```

- [ ] **Step 7: Substituir `src/pages/index.astro` inteiro** (o h1 provisório some na Task 12, quando o Hero entra)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { media } from '../content/media';
import { listPending } from '../content/pending';
import { site } from '../content/site';
import { buildBusinessJsonLd } from '../lib/seo';

for (const line of listPending(site)) console.warn(`[pendente] ${line}`);
for (const line of media.reportLines()) console.warn(`[mídia] ${line}`);

const jsonLd = [
  buildBusinessJsonLd(site, {
    url: new URL('/', Astro.site).href,
    image: new URL('/og.jpg', Astro.site).href,
  }),
];
---

<BaseLayout path="/" jsonLd={jsonLd}>
  <section class="section">
    <div class="container">
      <h1 class="lt-title is-display">
        {site.hero.title.before}<em>{site.hero.title.em}</em>{site.hero.title.after}
      </h1>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 8: Build e testes de dist passando**

Run: `npm run build && npm run test:dist`
Expected: o build imprime 7 linhas `[pendente] …` e as linhas `[mídia] placeholder em uso: …`; PASS — `seo.test.ts` (7), `base.test.ts` (3), `styles.test.ts` (3).

- [ ] **Step 9: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add package.json package-lock.json astro.config.mjs src/lib/seo.ts src/lib/seo.test.ts src/layouts src/pages tests/dist/seo.test.ts
git commit -m "$(cat <<'EOF'
feat: BaseLayout com SEO, Open Graph, JSON-LD, sitemap e robots.txt

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: QA local — preview, Lighthouse e capturas

**Files:**
- Create: `scripts/with-preview.mjs`, `scripts/lib/lighthouse-summary.mjs`, `scripts/lib/lighthouse-summary.test.mjs`, `scripts/lighthouse.mjs`, `scripts/shot.sh`, `docs/qa/lighthouse.md` (gerado)
- Modify: `package.json` (script `lighthouse`)

**Interfaces:**
- Consumes: `dist/` (build), agent-browser 0.27.0 no PATH, Chrome for Testing do agent-browser em `~/.agent-browser/browsers/chrome-*/chrome.exe`.
- Produces:
  - `node scripts/with-preview.mjs <comando> [args…]` — define `BASE_URL=http://127.0.0.1:4321/` para o comando; `PREVIEW_PORT` muda a porta.
  - `scripts/lib/lighthouse-summary.mjs`: `CATEGORIES`, `LABELS`, `summarize(lhr, threshold = 90) → { url, scores, failing, lcpMs, cls, tbtMs }`, `toMarkdown(results, { date, threshold = 90 }) → string`.
  - `npm run lighthouse` → `docs/qa/lighthouse.md` (+ JSON bruto em `docs/qa/lighthouse/`, fora do git); sai com código 1 se alguma categoria < 90.
  - `bash scripts/shot.sh "<seletor>" [larguras…]` → `.e2e-tmp/<seletor>-<largura>.png` (variável `PAGE_PATH` troca a página; padrão `/`).

- [ ] **Step 1: Escrever o teste que falha — `scripts/lib/lighthouse-summary.test.mjs`**

```js
import { describe, expect, it } from 'vitest';
import { summarize, toMarkdown } from './lighthouse-summary.mjs';

const lhr = (performance, accessibility, bestPractices, seo) => ({
  finalDisplayedUrl: 'http://127.0.0.1:4321/',
  categories: {
    performance: { score: performance },
    accessibility: { score: accessibility },
    'best-practices': { score: bestPractices },
    seo: { score: seo },
  },
  audits: {
    'largest-contentful-paint': { numericValue: 2100 },
    'cumulative-layout-shift': { numericValue: 0.012 },
    'total-blocking-time': { numericValue: 80 },
  },
});

describe('summarize', () => {
  it('converte as notas para 0–100', () => {
    expect(summarize(lhr(0.93, 1, 0.96, 1)).scores).toEqual({
      performance: 93,
      accessibility: 100,
      'best-practices': 96,
      seo: 100,
    });
  });

  it('aponta as categorias abaixo de 90', () => {
    expect(summarize(lhr(0.89, 1, 0.9, 1)).failing).toEqual(['performance']);
  });

  it('trata categoria ausente como 0', () => {
    expect(summarize({ categories: {} }).failing).toHaveLength(4);
  });

  it('lê LCP, CLS e TBT', () => {
    expect(summarize(lhr(1, 1, 1, 1))).toMatchObject({ lcpMs: 2100, cls: 0.012, tbtMs: 80 });
  });
});

describe('toMarkdown', () => {
  it('marca aprovado quando todas as categorias ≥ 90', () => {
    const markdown = toMarkdown([{ name: 'home', summary: summarize(lhr(0.95, 1, 1, 1)) }], {
      date: '2026-10-05',
    });
    expect(markdown).toContain('| home | 95 | 100 | 100 | 100 | 2,10 s | 0,012 | 80 ms |');
    expect(markdown).toContain('Resultado: **aprovado**');
  });

  it('lista o que reprovou', () => {
    const markdown = toMarkdown([{ name: 'home', summary: summarize(lhr(0.8, 1, 1, 0.85)) }], {
      date: '2026-10-05',
    });
    expect(markdown).toContain('Resultado: **reprovado** — home: Performance, SEO.');
  });
});
```

Run: `npm test -- scripts/lib/lighthouse-summary.test.mjs`
Expected: FAIL com `Failed to resolve import "./lighthouse-summary.mjs"`.

- [ ] **Step 2: Implementar `scripts/lib/lighthouse-summary.mjs`**

```js
export const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];

export const LABELS = {
  performance: 'Performance',
  accessibility: 'Acessibilidade',
  'best-practices': 'Boas práticas',
  seo: 'SEO',
};

/** Notas 0–100 das 4 categorias e métricas-chave de um relatório (LHR) do Lighthouse. */
export function summarize(lhr, threshold = 90) {
  const scores = {};
  for (const id of CATEGORIES) {
    const score = lhr?.categories?.[id]?.score;
    scores[id] = typeof score === 'number' ? Math.round(score * 100) : 0;
  }
  const metric = (id) => {
    const value = lhr?.audits?.[id]?.numericValue;
    return typeof value === 'number' ? value : null;
  };
  return {
    url: lhr?.finalDisplayedUrl ?? lhr?.finalUrl ?? '',
    scores,
    failing: CATEGORIES.filter((id) => scores[id] < threshold),
    lcpMs: metric('largest-contentful-paint'),
    cls: metric('cumulative-layout-shift'),
    tbtMs: metric('total-blocking-time'),
  };
}

const seconds = (ms) => (ms === null ? '—' : `${(ms / 1000).toFixed(2).replace('.', ',')} s`);
const millis = (ms) => (ms === null ? '—' : `${Math.round(ms)} ms`);
const decimal = (value) => (value === null ? '—' : value.toFixed(3).replace('.', ','));

/** Resumo em Markdown para docs/qa/lighthouse.md. */
export function toMarkdown(results, { date, threshold = 90 }) {
  const lines = [
    '# Lighthouse (mobile)',
    '',
    `Gerado em ${date} contra o \`astro preview\`, com o Lighthouse 12.8.2 (emulação mobile padrão). Meta: ≥ ${threshold} nas 4 categorias.`,
    '',
    '| Página | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |',
    '|---|---|---|---|---|---|---|---|',
  ];
  for (const { name, summary } of results) {
    const s = summary.scores;
    lines.push(
      `| ${name} | ${s.performance} | ${s.accessibility} | ${s['best-practices']} | ${s.seo} | ${seconds(summary.lcpMs)} | ${decimal(summary.cls)} | ${millis(summary.tbtMs)} |`,
    );
  }
  const failing = results.filter((result) => result.summary.failing.length > 0);
  lines.push('');
  lines.push(
    failing.length === 0
      ? `Resultado: **aprovado** (todas as categorias ≥ ${threshold}).`
      : `Resultado: **reprovado** — ${failing
          .map((result) => `${result.name}: ${result.summary.failing.map((id) => LABELS[id]).join(', ')}`)
          .join('; ')}.`,
  );
  return `${lines.join('\n')}\n`;
}
```

Run: `npm test -- scripts/lib/lighthouse-summary.test.mjs`
Expected: PASS — `Tests  6 passed`.

- [ ] **Step 3: Criar `scripts/with-preview.mjs`**

```js
// Sobe o `astro preview` (dist/ já gerado), roda um comando com BASE_URL e derruba o servidor no fim.
// Uso: node scripts/with-preview.mjs <comando> [args...]   ex.: node scripts/with-preview.mjs bash scripts/e2e.sh
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error('Uso: node scripts/with-preview.mjs <comando> [args...]');
  process.exit(2);
}
if (!existsSync('dist/index.html')) {
  console.error('dist/ não encontrado: rode "npm run build" antes.');
  process.exit(2);
}

const port = process.env.PREVIEW_PORT ?? '4321';
const baseUrl = `http://127.0.0.1:${port}/`;

try {
  await fetch(baseUrl);
  console.error(`A porta ${port} já está em uso. Pare o outro servidor ou defina PREVIEW_PORT.`);
  process.exit(2);
} catch {
  // porta livre: segue
}

const server = spawn(
  process.execPath,
  ['node_modules/astro/bin/astro.mjs', 'preview', '--host', '127.0.0.1', '--port', port],
  { stdio: ['ignore', 'ignore', 'inherit'] },
);

async function waitForServer(timeoutMs = 30_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // ainda subindo
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`astro preview não respondeu em ${baseUrl} após ${timeoutMs / 1000} s`);
}

let exitCode = 1;
try {
  await waitForServer();
  exitCode = await new Promise((resolve) => {
    const child = spawn(command === 'node' ? process.execPath : command, args, {
      stdio: 'inherit',
      env: { ...process.env, BASE_URL: baseUrl },
    });
    child.on('exit', (code) => resolve(code ?? 1));
    child.on('error', (error) => {
      console.error(error.message);
      resolve(1);
    });
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
} finally {
  server.kill();
}
process.exit(exitCode);
```

- [ ] **Step 4: Criar `scripts/lighthouse.mjs`**

```js
// Roda o Lighthouse 12.8.2 (mobile) contra BASE_URL e grava docs/qa/lighthouse.md.
// Uso: npm run build && npm run lighthouse   (o npm script sobe o preview via with-preview.mjs)
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { CATEGORIES, summarize, toMarkdown } from './lib/lighthouse-summary.mjs';

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:4321/';
const PAGES = [
  { name: 'home', path: '/' },
  { name: 'politica-de-privacidade', path: '/politica-de-privacidade' },
];

/** Chrome for Testing do agent-browser (versão mais nova), ou CHROME_PATH, ou o Chrome instalado. */
function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const dir = join(homedir(), '.agent-browser', 'browsers');
  if (!existsSync(dir)) return undefined;
  const builds = readdirSync(dir)
    .filter((name) => name.startsWith('chrome-'))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
    .reverse();
  for (const build of builds) {
    const exe = join(dir, build, process.platform === 'win32' ? 'chrome.exe' : 'chrome');
    if (existsSync(exe)) return exe;
  }
  return undefined;
}

const outDir = join('docs', 'qa', 'lighthouse');
mkdirSync(outDir, { recursive: true });
const chrome = findChrome();
const env = chrome ? { ...process.env, CHROME_PATH: chrome } : process.env;
const pages = PAGES.filter(
  (page) => page.path === '/' || existsSync(join('dist', `${page.path.slice(1)}.html`)),
);

const results = [];
for (const page of pages) {
  const url = new URL(page.path, BASE_URL).href;
  const output = join(outDir, `${page.name}.json`);
  rmSync(output, { force: true });
  const command = [
    'npx --yes lighthouse@12.8.2',
    `"${url}"`,
    '--quiet',
    '--output=json',
    `--output-path="${output}"`,
    `--only-categories=${CATEGORIES.join(',')}`,
    '--chrome-flags="--headless=new --no-first-run --no-default-browser-check"',
  ].join(' ');
  console.log(`▶ Lighthouse ${url}`);
  const run = spawnSync(command, { shell: true, stdio: 'inherit', env });
  if (!existsSync(output)) {
    console.error(`Lighthouse não gerou ${output} (código ${run.status}).`);
    process.exit(1);
  }
  results.push({ name: page.name, summary: summarize(JSON.parse(readFileSync(output, 'utf8'))) });
}

const markdown = toMarkdown(results, { date: new Date().toISOString().slice(0, 10) });
writeFileSync(join('docs', 'qa', 'lighthouse.md'), markdown);
console.log(markdown);
process.exit(results.some((result) => result.summary.failing.length > 0) ? 1 : 0);
```

- [ ] **Step 5: Criar `scripts/shot.sh`**

```bash
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
```

- [ ] **Step 6: Registrar o script npm e rodar tudo contra a página atual**

```bash
npm pkg set scripts.lighthouse="node scripts/with-preview.mjs node scripts/lighthouse.mjs"
npm run build && npm run lighthouse
node scripts/with-preview.mjs bash scripts/shot.sh "#conteudo" 375
```

Expected: `docs/qa/lighthouse.md` com a linha `| home | … |` e `Resultado: **aprovado**`; `.e2e-tmp/conteudo-375.png` criado (abra com a ferramenta Read: título "Rejuvenescer sem deixar de *ser você.*" em Cormorant, itálico rosewood, fundo porcelana). Se o Lighthouse reclamar do Chrome, rode `CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" npm run lighthouse`.

- [ ] **Step 7: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde (`npm test` agora inclui `scripts/lib/*.test.mjs`).

```bash
git add package.json scripts docs/qa/lighthouse.md
git commit -m "$(cat <<'EOF'
chore: QA local com preview, Lighthouse mobile e capturas por agent-browser

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Fechamento da Etapa 1 — executada pelo orquestrador

> **Executada pelo ORQUESTRADOR**, não por um subagente implementador. O orquestrador acrescenta ao corpo do PR e à mensagem do commit de squash as linhas de atribuição exigidas pela sessão dele.

**Files:**
- Create: `docs/HANDOFF.md` (na `main`, depois do merge)

- [ ] **Step 1: Gate completo na branch**

Run: `npm run check && npm run lighthouse`
Expected: lint, typecheck, testes, build e testes de dist verdes; `docs/qa/lighthouse.md` com `Resultado: **aprovado**`. Se o resumo mudou: `git add docs/qa/lighthouse.md && git commit -m "$(cat <<'EOF'
docs: resumo do Lighthouse da Etapa 1

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"`.

- [ ] **Step 2: Push da branch**

```bash
git push -u origin feat/fundacao
```

- [ ] **Step 3: Abrir o PR**

```bash
mkdir -p .e2e-tmp
cat > .e2e-tmp/pr-body.md <<'EOF'
## Resumo
- Scaffold Astro 7 estático com TypeScript estrito, ESLint (flat + plugin Astro), Prettier e Vitest (unitário + testes do HTML gerado).
- Materiais de origem em `docs/fontes/`, design system em `docs/design-system/` e copy transcrito em `docs/copy.md`.
- Tokens e componentes CSS do design system, fontes self-hosted (@fontsource) e estilos globais (container 1200px/12 colunas, seções, foco visível, skip link, movimento reduzido).
- Conteúdo tipado em `src/content/site.ts` (zod) com campos pendentes marcados, `whatsappLink()` e resolvedor de mídia com placeholders.
- BaseLayout com title, meta, canonical, Open Graph, JSON-LD `HealthAndBeautyBusiness`, sitemap e robots.txt.
- QA local: `npm run lighthouse`, `scripts/with-preview.mjs` e `scripts/shot.sh`.

## Checklist de validação
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`
- [x] `npm run test:dist`
- [x] `npm run lighthouse` — mobile ≥ 90 nas 4 categorias (`docs/qa/lighthouse.md`)
- [x] Revisões por subagente (especificação + qualidade) aprovadas nas Tasks 1–8

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
gh pr create --base main --head feat/fundacao --title "feat: fundação do site (Astro, conteúdo tipado, SEO e QA local)" --body-file .e2e-tmp/pr-body.md
```

- [ ] **Step 4: Merge squash**

```bash
gh pr merge feat/fundacao --squash --delete-branch --subject "feat: fundação do site (Astro, conteúdo tipado, SEO e QA local)"
```

(O orquestrador passa `--body` com as linhas de atribuição do commit de squash.)

- [ ] **Step 5: Voltar para a main atualizada**

```bash
git checkout main && git pull --ff-only
```

- [ ] **Step 6: Criar `docs/HANDOFF.md`**

```markdown
# HANDOFF — Landing Clínica Laura Tavares

> Atualizado pelo orquestrador ao fim de cada etapa. Plano: `docs/superpowers/plans/2026-10-05-landing-site.md` · Spec: `docs/superpowers/specs/2026-10-05-landing-clinica-laura-tavares-design.md`.

## Estado

- **Etapa 1 — fundação (`feat/fundacao`): concluída e mergeada na `main`.** Astro 7.3.5 estático (`build.format: 'file'`, `trailingSlash: 'never'`), TypeScript 6.0.x estrito, ESLint 9 + eslint-plugin-astro 1.7, Prettier, Vitest (unitário + `tests/dist`); `src/content/site.ts` com todo o texto; `whatsappLink()`; resolvedor de mídia com placeholders; BaseLayout com SEO, Open Graph, JSON-LD, sitemap e robots; QA local (`npm run lighthouse`, `scripts/shot.sh`).
- Etapas 2–7: pendentes.

## Como rodar

| Comando | O que faz |
|---|---|
| `npm install` | instala as dependências (Node 22.x) |
| `npm run dev` | servidor de desenvolvimento em http://localhost:4321 |
| `npm run check` | lint + typecheck + testes + build + testes do dist |
| `npm run lighthouse` | Lighthouse mobile contra o `astro preview` (rode `npm run build` antes) |
| `npm run placeholders` | regenera placeholders e ícones |

## Decisões

- Versões fixas por compatibilidade com o Node 22.15.1 local: TypeScript ~6.0.3 (typescript-eslint exige < 6.1), eslint-plugin-astro 1.7.0 + ESLint 9 (as versões 2.x/3.x exigem Node 22.22.3), Lighthouse 12.8.2 via npx (13.x exige Node 22.19). No TS 6 o padrão de `types` é `[]`, por isso o `tsconfig` declara `"types": ["node"]`.
- `.gitattributes` força LF (a máquina usa `core.autocrlf=true`).
- Dados pendentes da clínica ficam `null` em `site.ts` e aparecem no build como `[pendente]`; mídia ausente vira placeholder e aparece como `[mídia]`.
- WhatsApp: as quatro mensagens do copy; os CTAs gerais (navbar, Método, Sobre, depoimentos, flutuante, rodapé) usam a mensagem do hero/CTA final.
- Numerais em `gold-ink` (o `gold` reprova contraste AA no axe).
- O "mapa" da spec virou cartão de endereço com "Abrir no Google Maps" e "Abrir no Waze" (sem embed e sem imagem), por LGPD/performance.
- Materiais de origem foram movidos da raiz para `docs/fontes/`.

## Próximo passo

- Etapa 2 — `feat/secoes-topo`: Task 10 do plano.
```

```bash
git add docs/HANDOFF.md
git commit -m "$(cat <<'EOF'
docs: cria HANDOFF após a Etapa 1

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

## Etapa 2 — `feat/secoes-topo`

> Antes da Task 10: `git checkout main && git pull --ff-only && git checkout -b feat/secoes-topo`.

### Task 10: Ícones Phosphor, Button, RichTitle, SectionHeading e WhatsAppFloat

**Files:**
- Create: `src/lib/svg.ts`, `src/lib/svg.test.ts`, `src/components/icons/registry.ts`, `src/components/icons/registry.test.ts`, `src/components/icons/Icon.astro`, `src/components/Button.astro`, `src/components/RichTitle.astro`, `src/components/SectionHeading.astro`, `src/components/WhatsAppFloat.astro`, `tests/dist/float.test.ts`
- Modify: `src/pages/index.astro`, `package.json` (@phosphor-icons/core)

**Interfaces:**
- Consumes: `site` (`contentIcons`, `RichTitle`, `floatingButton`), `whatsappLink` (Task 5), BaseLayout (Task 7).
- Produces:
  - `decorateSvg(raw: string, options: { size: number; className?: string | undefined }): string`
  - `icons` (mapa nome → SVG bruto) e `type IconName` = `'arrow-right' | 'arrows-clockwise' | 'arrows-left-right' | 'armchair' | 'calendar-check' | 'clipboard-text' | 'close' | 'drop' | 'ear' | 'instagram' | 'leaf' | 'map' | 'map-pin' | 'medal' | 'menu' | 'navigation' | 'pause' | 'person' | 'play' | 'scan' | 'sparkle' | 'star-fill' | 'user-focus' | 'whatsapp'`
  - `<Icon name size? class? />` (SVG inline, sempre `aria-hidden="true"`)
  - `<Button href variant?="primary|outline|ghost|whatsapp" size?="md|sm" arrow? class? …atributos de <a>>` (links `http(s)` abrem em nova aba com `rel="noopener noreferrer"`)
  - `<RichTitle title as?="h1|h2|h3" size?="display|h2|h3" id? class? />` (renderiza `before<em>em</em>after` com `data-title`)
  - `<SectionHeading id eyebrow title lead? align?="start|center" />`
  - `<WhatsAppFloat />` (aside `data-wa-float`, link `data-wa-origin="floating"`)

- [ ] **Step 1: Instalar os ícones**

```bash
npm install --save-exact @phosphor-icons/core@2.1.1
```

- [ ] **Step 2: Escrever os testes que falham — `src/lib/svg.test.ts` e `src/components/icons/registry.test.ts`**

```ts
// src/lib/svg.test.ts
import { describe, expect, it } from 'vitest';
import { decorateSvg } from './svg';

const raw =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M0 0"/></svg>';

describe('decorateSvg', () => {
  it('adiciona tamanho e esconde do leitor de tela', () => {
    const out = decorateSvg(raw, { size: 24 });
    expect(out.startsWith('<svg width="24" height="24" aria-hidden="true" focusable="false" xmlns=')).toBe(
      true,
    );
    expect(out).toContain('viewBox="0 0 256 256"');
    expect(out).toContain('<path d="M0 0"/>');
  });

  it('aplica a classe sem deixar passar aspas', () => {
    expect(decorateSvg(raw, { size: 16, className: 'a "b"' })).toContain('class="a b"');
  });

  it('rejeita conteúdo que não é SVG', () => {
    expect(() => decorateSvg('<div></div>', { size: 16 })).toThrow(/não é um <svg>/);
  });
});
```

```ts
// src/components/icons/registry.test.ts
import { describe, expect, it } from 'vitest';
import { contentIcons } from '../../content/site';
import { icons } from './registry';

describe('registro de ícones', () => {
  it('todos são SVG do Phosphor (viewBox 256)', () => {
    for (const [name, svg] of Object.entries(icons)) {
      expect(svg.trim().startsWith('<svg'), name).toBe(true);
      expect(svg, name).toContain('viewBox="0 0 256 256"');
    }
  });

  it('cobre todos os ícones usados no conteúdo', () => {
    for (const name of contentIcons) expect(Object.keys(icons)).toContain(name);
  });
});
```

Run: `npm test -- src/lib/svg.test.ts src/components/icons/registry.test.ts`
Expected: FAIL com `Failed to resolve import "./svg"` e `Failed to resolve import "./registry"`.

- [ ] **Step 3: Implementar `src/lib/svg.ts`**

```ts
/** Prepara um SVG bruto (Phosphor) para uso inline: tamanho, classe e escondido de leitores de tela. */
export function decorateSvg(
  raw: string,
  { size, className }: { size: number; className?: string | undefined },
): string {
  const svg = raw.trim();
  if (!svg.startsWith('<svg')) throw new Error('decorateSvg: o conteúdo não é um <svg>.');
  const attributes = [`width="${size}"`, `height="${size}"`, 'aria-hidden="true"', 'focusable="false"'];
  if (className) attributes.push(`class="${className.replace(/"/g, '')}"`);
  return svg.replace(/^<svg\b/, `<svg ${attributes.join(' ')}`);
}
```

- [ ] **Step 4: Implementar `src/components/icons/registry.ts`**

```ts
// Ícones Phosphor (peso Light; "star" em Fill) importados como SVG bruto e renderizados inline pelo Icon.astro.
import armchair from '@phosphor-icons/core/light/armchair-light.svg?raw';
import arrowRight from '@phosphor-icons/core/light/arrow-right-light.svg?raw';
import arrowsClockwise from '@phosphor-icons/core/light/arrows-clockwise-light.svg?raw';
import arrowsLeftRight from '@phosphor-icons/core/light/arrows-left-right-light.svg?raw';
import calendarCheck from '@phosphor-icons/core/light/calendar-check-light.svg?raw';
import clipboardText from '@phosphor-icons/core/light/clipboard-text-light.svg?raw';
import drop from '@phosphor-icons/core/light/drop-light.svg?raw';
import ear from '@phosphor-icons/core/light/ear-light.svg?raw';
import instagram from '@phosphor-icons/core/light/instagram-logo-light.svg?raw';
import leaf from '@phosphor-icons/core/light/leaf-light.svg?raw';
import list from '@phosphor-icons/core/light/list-light.svg?raw';
import mapPin from '@phosphor-icons/core/light/map-pin-light.svg?raw';
import mapTrifold from '@phosphor-icons/core/light/map-trifold-light.svg?raw';
import medal from '@phosphor-icons/core/light/medal-light.svg?raw';
import navigationArrow from '@phosphor-icons/core/light/navigation-arrow-light.svg?raw';
import pause from '@phosphor-icons/core/light/pause-light.svg?raw';
import person from '@phosphor-icons/core/light/person-light.svg?raw';
import play from '@phosphor-icons/core/light/play-light.svg?raw';
import scan from '@phosphor-icons/core/light/scan-light.svg?raw';
import sparkle from '@phosphor-icons/core/light/sparkle-light.svg?raw';
import userFocus from '@phosphor-icons/core/light/user-focus-light.svg?raw';
import whatsapp from '@phosphor-icons/core/light/whatsapp-logo-light.svg?raw';
import x from '@phosphor-icons/core/light/x-light.svg?raw';
import starFill from '@phosphor-icons/core/fill/star-fill.svg?raw';

export const icons = {
  'arrow-right': arrowRight,
  'arrows-clockwise': arrowsClockwise,
  'arrows-left-right': arrowsLeftRight,
  armchair,
  'calendar-check': calendarCheck,
  'clipboard-text': clipboardText,
  close: x,
  drop,
  ear,
  instagram,
  leaf,
  map: mapTrifold,
  'map-pin': mapPin,
  medal,
  menu: list,
  navigation: navigationArrow,
  pause,
  person,
  play,
  scan,
  sparkle,
  'star-fill': starFill,
  'user-focus': userFocus,
  whatsapp,
} as const satisfies Record<string, string>;

export type IconName = keyof typeof icons;
```

Run: `npm test -- src/lib/svg.test.ts src/components/icons/registry.test.ts`
Expected: PASS — `Tests  5 passed`.

- [ ] **Step 5: Criar `src/components/icons/Icon.astro`**

```astro
---
import { decorateSvg } from '../../lib/svg';
import { icons, type IconName } from './registry';

interface Props {
  name: IconName;
  size?: number;
  class?: string;
}

const { name, size = 24, class: className } = Astro.props;
const markup = decorateSvg(icons[name], { size, className });
---

<Fragment set:html={markup} />
```

- [ ] **Step 6: Criar `src/components/Button.astro`**

```astro
---
import type { HTMLAttributes } from 'astro/types';
import Icon from './icons/Icon.astro';

type Variant = 'primary' | 'outline' | 'ghost' | 'whatsapp';

interface Props extends Omit<HTMLAttributes<'a'>, 'class'> {
  href: string;
  variant?: Variant;
  size?: 'md' | 'sm';
  arrow?: boolean;
  class?: string;
}

const {
  href,
  variant = 'primary',
  size = 'md',
  arrow = variant === 'primary',
  class: className,
  ...rest
} = Astro.props;

const external = /^https?:\/\//.test(href);
---

<a
  href={href}
  class:list={['lt-btn', `lt-btn--${variant}`, { 'lt-btn--sm': size === 'sm' }, className]}
  target={external ? '_blank' : undefined}
  rel={external ? 'noopener noreferrer' : undefined}
  {...rest}
>
  {variant === 'whatsapp' && <Icon name="whatsapp" size={20} />}
  <span><slot /></span>
  {arrow && <Icon name="arrow-right" size={16} />}
</a>
```

- [ ] **Step 7: Criar `src/components/RichTitle.astro` e `src/components/SectionHeading.astro`**

```astro
---
// RichTitle.astro — título com o trecho em itálico rosé do copy (campo `em`).
import type { RichTitle as RichTitleData } from '../content/site';

interface Props {
  title: RichTitleData;
  as?: 'h1' | 'h2' | 'h3';
  size?: 'display' | 'h2' | 'h3';
  id?: string;
  class?: string;
}

const { title, as: Tag = 'h2', size = 'h2', id, class: className } = Astro.props;
---

<Tag id={id} class:list={['lt-title', `is-${size}`, className]} data-title
  >{title.before}<em>{title.em}</em>{title.after}</Tag
>
```

```astro
---
// SectionHeading.astro — eyebrow (gold-ink) → título (space-3) → lead; título → conteúdo com space-12.
import RichTitle from './RichTitle.astro';
import type { RichTitle as RichTitleData } from '../content/site';

interface Props {
  id: string;
  eyebrow: string;
  title: RichTitleData;
  lead?: string;
  align?: 'start' | 'center';
}

const { id, eyebrow, title, lead, align = 'start' } = Astro.props;
---

<div class:list={['heading', `heading--${align}`]}>
  <p class="lt-eyebrow">{eyebrow}</p>
  <RichTitle id={id} title={title} />
  {lead && <p class="lt-lead heading__lead">{lead}</p>}
</div>

<style>
  .heading {
    display: grid;
    gap: var(--space-3);
    max-width: 720px;
    margin-bottom: var(--space-12);
  }

  .heading--center {
    margin-inline: auto;
    justify-items: center;
    text-align: center;
  }

  .heading__lead {
    margin-top: var(--space-3);
    max-width: 640px;
  }
</style>
```

- [ ] **Step 8: Escrever o teste de dist que falha — `tests/dist/float.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { loadPage, textOf } from './load';

describe('botão flutuante do WhatsApp', () => {
  it('fica num aside rotulado e abre o WhatsApp com a mensagem geral', () => {
    const { document } = loadPage();
    const link = document.querySelector('aside[data-wa-float] a[data-wa-origin="floating"]');
    expect(link?.getAttribute('aria-label')).toBe('Agende pelo WhatsApp');
    const url = new URL(link?.getAttribute('href') ?? '');
    expect(url.searchParams.get('phone')).toBe('5561981007522');
    expect(url.searchParams.get('text')).toBe(
      'Olá! Vim pelo site e gostaria de agendar uma avaliação com a Dra. Laura.',
    );
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('o ícone é decorativo', () => {
    const { document } = loadPage();
    expect(document.querySelector('[data-wa-float] a svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('o h1 usa RichTitle com o itálico em "ser você."', () => {
    const { document } = loadPage();
    const h1 = document.querySelector('h1');
    expect(h1?.hasAttribute('data-title')).toBe(true);
    expect(textOf(h1?.querySelector('em'))).toBe('ser você.');
  });
});
```

Run: `npm run build && npm run test:dist`
Expected: FAIL nos 3 testes de `float.test.ts`.

- [ ] **Step 9: Criar `src/components/WhatsAppFloat.astro`**

```astro
---
import Icon from './icons/Icon.astro';
import { site } from '../content/site';
import { whatsappLink } from '../lib/whatsapp';

const label = site.floatingButton.label;
---

<aside class="lt-wa float" aria-label={label} data-wa-float>
  <span class="lt-wa__tip float__tip" aria-hidden="true">{label}</span>
  <a
    class="lt-wa__btn"
    href={whatsappLink('general')}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    data-wa-origin="floating"
  >
    <Icon name="whatsapp" size={30} />
  </a>
</aside>

<style>
  .float__tip {
    opacity: 0;
    transform: translateX(8px);
    pointer-events: none;
    transition:
      opacity var(--dur-base) var(--ease-lux),
      transform var(--dur-base) var(--ease-lux);
  }

  .float[data-tip-visible] .float__tip {
    opacity: 1;
    transform: none;
  }

  @media (max-width: 767.98px) {
    .float {
      right: var(--space-4);
      bottom: var(--space-4);
    }
  }
</style>

<script>
  // Balão "Agende pelo WhatsApp": aparece após 6 s ou 40% de rolagem; no mobile some 4 s depois.
  const root = document.querySelector<HTMLElement>('[data-wa-float]');
  if (root) {
    const isMobile = window.matchMedia('(max-width: 767.98px)').matches;
    let shown = false;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= 0.4) show();
    };
    const show = () => {
      if (shown) return;
      shown = true;
      root.setAttribute('data-tip-visible', '');
      window.removeEventListener('scroll', onScroll);
      if (isMobile) window.setTimeout(() => root.removeAttribute('data-tip-visible'), 4000);
    };
    window.setTimeout(show, 6000);
    window.addEventListener('scroll', onScroll, { passive: true });
  }
</script>
```

- [ ] **Step 10: Substituir `src/pages/index.astro` inteiro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import RichTitle from '../components/RichTitle.astro';
import WhatsAppFloat from '../components/WhatsAppFloat.astro';
import { media } from '../content/media';
import { listPending } from '../content/pending';
import { site } from '../content/site';
import { buildBusinessJsonLd } from '../lib/seo';

for (const line of listPending(site)) console.warn(`[pendente] ${line}`);
for (const line of media.reportLines()) console.warn(`[mídia] ${line}`);

const jsonLd = [
  buildBusinessJsonLd(site, {
    url: new URL('/', Astro.site).href,
    image: new URL('/og.jpg', Astro.site).href,
  }),
];
---

<BaseLayout path="/" jsonLd={jsonLd}>
  <section class="section">
    <div class="container">
      <RichTitle as="h1" size="display" title={site.hero.title} />
    </div>
  </section>
  <WhatsAppFloat slot="after" />
</BaseLayout>
```

- [ ] **Step 11: Build, testes de dist e conferência visual**

Run: `npm run build && npm run test:dist && node scripts/with-preview.mjs bash scripts/shot.sh "#conteudo" 375 1280`
Expected: PASS em todos os testes de dist; nas capturas `.e2e-tmp/conteudo-375.png` e `-1280.png` (abra com Read) o botão verde redondo do WhatsApp aparece no canto inferior direito, com o ícone em `#0B2E17`.

- [ ] **Step 12: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add package.json package-lock.json src/lib/svg.ts src/lib/svg.test.ts src/components tests/dist/float.test.ts src/pages/index.astro
git commit -m "$(cat <<'EOF'
feat: ícones Phosphor, Button, RichTitle, SectionHeading e botão flutuante do WhatsApp

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Marquee e Navbar (com gaveta mobile acessível)

**Files:**
- Create: `src/lib/navbar.ts`, `src/lib/navbar.test.ts`, `src/components/Marquee.astro`, `src/components/Navbar.astro`, `tests/dist/header.test.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `site.marquee`, `site.nav`, `site.brand`, `site.ui`, `whatsappLink`, `Icon`, `Button`.
- Produces:
  - `interface NavbarScroll { anchorY: number; hidden: boolean }` e `updateNavbarScroll(state: NavbarScroll, currentY: number, revealZone?: number, tolerance?: number): NavbarScroll`
  - `<Marquee />` — `aside[data-marquee]` com `[data-marquee-track]` (duas metades idênticas para o loop de −50%), botão `[data-marquee-toggle]` (`aria-pressed`) que liga/desliga `data-paused` no `aside`. A Task 28 troca a animação CSS pelo GSAP adicionando a classe `is-gsap`.
  - `<Navbar />` — `header[data-navbar]` sticky (ganha `data-hidden` ao rolar para baixo), `nav[aria-label="Principal"]`, botão `[data-nav-open]` (`aria-controls="menu-mobile"`) e `dialog#menu-mobile[data-nav-menu]` com `[data-nav-close]`.

- [ ] **Step 1: Escrever o teste que falha — `src/lib/navbar.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { updateNavbarScroll } from './navbar';

describe('updateNavbarScroll', () => {
  it('sempre mostra perto do topo', () => {
    expect(updateNavbarScroll({ anchorY: 500, hidden: true }, 100)).toEqual({ anchorY: 100, hidden: false });
  });

  it('esconde ao rolar para baixo além da zona do topo', () => {
    expect(updateNavbarScroll({ anchorY: 300, hidden: false }, 400)).toEqual({ anchorY: 400, hidden: true });
  });

  it('mostra ao rolar para cima', () => {
    expect(updateNavbarScroll({ anchorY: 900, hidden: true }, 800)).toEqual({ anchorY: 800, hidden: false });
  });

  it('ignora tremidas menores que a tolerância', () => {
    const state = { anchorY: 500, hidden: true };
    expect(updateNavbarScroll(state, 503)).toBe(state);
  });

  it('acumula rolagem lenta até passar da tolerância', () => {
    let state = { anchorY: 500, hidden: false };
    for (const y of [502, 504, 506]) state = updateNavbarScroll(state, y);
    expect(state).toEqual({ anchorY: 506, hidden: true });
  });
});
```

Run: `npm test -- src/lib/navbar.test.ts`
Expected: FAIL com `Failed to resolve import "./navbar"`.

- [ ] **Step 2: Implementar `src/lib/navbar.ts`**

```ts
export interface NavbarScroll {
  /** Última posição em que o estado mudou (base para medir a próxima rolagem). */
  anchorY: number;
  hidden: boolean;
}

/**
 * Esconde a navbar ao rolar para baixo e mostra ao rolar para cima.
 * Perto do topo (revealZone) ela sempre aparece; movimentos menores que `tolerance` não mudam nada.
 */
export function updateNavbarScroll(
  state: NavbarScroll,
  currentY: number,
  revealZone = 160,
  tolerance = 6,
): NavbarScroll {
  if (currentY <= revealZone) return { anchorY: currentY, hidden: false };
  const delta = currentY - state.anchorY;
  if (Math.abs(delta) < tolerance) return state;
  return { anchorY: currentY, hidden: delta > 0 };
}
```

Run: `npm test -- src/lib/navbar.test.ts`
Expected: PASS — `Tests  5 passed`.

- [ ] **Step 3: Escrever o teste de dist que falha — `tests/dist/header.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { loadPage, textOf } from './load';

describe('marquee', () => {
  it('lista os 7 itens do copy para leitores de tela', () => {
    const { document } = loadPage();
    const marquee = document.querySelector('[data-marquee]');
    expect(marquee?.tagName).toBe('ASIDE');
    expect(marquee?.getAttribute('aria-label')).toBe('Destaques da clínica');
    expect(textOf(marquee?.querySelector('.sr-only'))).toBe(
      '+25 mil atendimentos · Harmonização facial · 9 anos de experiência · AMWC Coreia 2026 · Melhor Atendimento · Santa Permuta 2026 · K-Beauty na clínica · Sudoeste · Brasília',
    );
  });

  it('duplica a faixa visual (aria-hidden) e marca os itálicos do copy', () => {
    const { document } = loadPage();
    const track = document.querySelector('[data-marquee-track]');
    expect(track?.getAttribute('aria-hidden')).toBe('true');
    expect(track?.querySelectorAll('.lt-marquee__item')).toHaveLength(28);
    const italics = Array.from(track?.querySelectorAll('i') ?? [], (node) => textOf(node));
    expect(italics.slice(0, 3)).toEqual(['Harmonização facial', 'AMWC Coreia 2026', 'K-Beauty na clínica']);
  });

  it('tem botão de pausa acessível', () => {
    const { document } = loadPage();
    const toggle = document.querySelector('[data-marquee-toggle]');
    expect(toggle?.getAttribute('aria-pressed')).toBe('false');
    expect(textOf(toggle)).toBe('Pausar faixa de destaques');
  });
});

describe('navbar', () => {
  it('tem os 6 links do copy, na ordem', () => {
    const { document } = loadPage();
    const links = Array.from(document.querySelectorAll('nav[aria-label="Principal"] a'), (link) => [
      textOf(link),
      link.getAttribute('href'),
    ]);
    expect(links).toEqual([
      ['Início', '#inicio'],
      ['Tratamentos', '#tratamentos'],
      ['Resultados', '#resultados'],
      ['A Dra. Laura', '#dra-laura'],
      ['A clínica', '#a-clinica'],
      ['Dúvidas', '#duvidas'],
    ]);
  });

  it('tem a marca tipográfica e o CTA "Agendar avaliação" com a mensagem geral', () => {
    const { document } = loadPage();
    expect(textOf(document.querySelector('.navbar__brand'))).toBe('Laura Tavares Estética Avançada');
    const cta = document.querySelector('a[data-wa-origin="nav"]');
    expect(textOf(cta)).toBe('Agendar avaliação');
    expect(new URL(cta?.getAttribute('href') ?? '').searchParams.get('text')).toBe(
      'Olá! Vim pelo site e gostaria de agendar uma avaliação com a Dra. Laura.',
    );
  });

  it('o botão do menu mobile controla o dialog da gaveta', () => {
    const { document } = loadPage();
    const toggle = document.querySelector('[data-nav-open]');
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(toggle?.getAttribute('aria-controls')).toBe('menu-mobile');
    expect(textOf(toggle)).toBe('Abrir menu');
    const dialog = document.querySelector('dialog#menu-mobile[data-nav-menu]');
    expect(dialog?.querySelectorAll('a[href^="#"]')).toHaveLength(6);
    expect(textOf(dialog?.querySelector('[data-nav-close]'))).toBe('Fechar menu');
    expect(dialog?.querySelector('a[data-wa-origin="nav-menu"]')).not.toBeNull();
  });
});
```

Run: `npm run build && npm run test:dist`
Expected: FAIL nos 6 testes de `header.test.ts`.

- [ ] **Step 4: Criar `src/components/Marquee.astro`**

```astro
---
import Icon from './icons/Icon.astro';
import { site } from '../content/site';

const { marquee, ui } = site;
// Cada metade repete os itens 2× para cobrir telas largas; o loop anima de 0 a −50%.
const half = [...marquee, ...marquee];
---

<aside class="lt-marquee marquee" aria-label={ui.marqueeLabel} data-marquee>
  <p class="sr-only">{marquee.map((item) => item.text).join(' · ')}</p>
  <div class="lt-marquee__track" aria-hidden="true" data-marquee-track>
    {
      [0, 1].map(() => (
        <div class="marquee__group">
          {half.map((item) => (
            <span class="lt-marquee__item">
              {item.italic ? <i>{item.text}</i> : item.text}
              <span class="lt-marquee__star">✦</span>
            </span>
          ))}
        </div>
      ))
    }
  </div>
  <button type="button" class="marquee__toggle" aria-pressed="false" data-marquee-toggle>
    <Icon name="pause" size={16} class="marquee__icon marquee__icon--pause" />
    <Icon name="play" size={16} class="marquee__icon marquee__icon--play" />
    <span class="sr-only">{ui.pauseMarquee}</span>
  </button>
</aside>

<style>
  .marquee {
    position: relative;
  }

  .marquee__group {
    display: flex;
  }

  .marquee[data-paused] .lt-marquee__track {
    animation-play-state: paused;
  }

  .marquee.is-gsap .lt-marquee__track {
    animation: none;
  }

  .marquee__toggle {
    position: absolute;
    top: 50%;
    right: var(--space-2);
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid rgb(255 255 255 / 0.45);
    border-radius: 50%;
    background: var(--accent);
    color: var(--on-accent);
    translate: 0 -50%;
  }

  .marquee__toggle:focus-visible {
    outline: 2px solid var(--on-accent);
    outline-offset: 2px;
  }

  .marquee__toggle :global(.marquee__icon--play),
  .marquee__toggle[aria-pressed='true'] :global(.marquee__icon--pause) {
    display: none;
  }

  .marquee__toggle[aria-pressed='true'] :global(.marquee__icon--play) {
    display: block;
  }

  @media (prefers-reduced-motion: reduce) {
    .marquee__toggle {
      display: none;
    }
  }
</style>

<script>
  for (const root of document.querySelectorAll<HTMLElement>('[data-marquee]')) {
    const toggle = root.querySelector<HTMLButtonElement>('[data-marquee-toggle]');
    toggle?.addEventListener('click', () => {
      const paused = toggle.getAttribute('aria-pressed') !== 'true';
      toggle.setAttribute('aria-pressed', String(paused));
      root.toggleAttribute('data-paused', paused);
    });
  }
</script>
```

> O botão tem 32px dentro de uma faixa de 44px de altura; o alvo de toque (WCAG 2.5.8, mínimo 24px) é atendido.

- [ ] **Step 5: Criar `src/components/Navbar.astro`**

```astro
---
import Button from './Button.astro';
import Icon from './icons/Icon.astro';
import { site } from '../content/site';
import { whatsappLink } from '../lib/whatsapp';

const { nav, brand, ui } = site;
const scheduleHref = whatsappLink('general');
---

<header class="navbar" data-navbar>
  <div class="navbar__pill">
    <a class="navbar__brand" href="#inicio">
      <span class="navbar__name">{brand.wordmark}</span>
      <span class="lt-eyebrow navbar__tag">{brand.tagline}</span>
    </a>
    <nav class="navbar__nav" aria-label={ui.navLabel}>
      <ul role="list">
        {
          nav.links.map((link) => (
            <li>
              <a href={link.href}>{link.label}</a>
            </li>
          ))
        }
      </ul>
    </nav>
    <Button href={scheduleHref} size="sm" arrow={false} class="navbar__cta" data-wa-origin="nav"
      >{nav.cta}</Button
    >
    <button
      type="button"
      class="navbar__toggle"
      aria-expanded="false"
      aria-controls="menu-mobile"
      data-nav-open
    >
      <Icon name="menu" size={24} />
      <span class="sr-only">{ui.menuOpen}</span>
    </button>
  </div>

  <dialog id="menu-mobile" class="menu" aria-label={ui.menuLabel} data-nav-menu>
    <div class="menu__top">
      <span class="navbar__name">{brand.wordmark}</span>
      <button type="button" class="menu__close" data-nav-close>
        <Icon name="close" size={28} />
        <span class="sr-only">{ui.menuClose}</span>
      </button>
    </div>
    <nav aria-label={ui.menuLabel}>
      <ul role="list" class="menu__links">
        {
          nav.links.map((link) => (
            <li>
              <a href={link.href}>{link.label}</a>
            </li>
          ))
        }
      </ul>
    </nav>
    <Button href={scheduleHref} class="menu__cta" data-wa-origin="nav-menu">{nav.cta}</Button>
  </dialog>
</header>

<style>
  .navbar {
    position: sticky;
    top: var(--space-4);
    z-index: 40;
    margin-top: var(--space-4);
    padding-inline: var(--gutter);
    transition: transform var(--dur-base) var(--ease-lux);
  }

  .navbar[data-hidden]:not(:focus-within) {
    transform: translateY(calc(-100% - var(--space-8)));
  }

  .navbar__pill {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-6);
    max-width: var(--container);
    margin-inline: auto;
    padding: var(--space-2) var(--space-2) var(--space-2) var(--space-6);
    border: 1px solid var(--hairline);
    border-radius: var(--radius-pill);
    background: var(--surface-raised);
    box-shadow: var(--shadow-soft);
  }

  .navbar__brand {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    min-height: 44px;
    color: var(--ink);
    line-height: 1;
    text-decoration: none;
  }

  .navbar__name {
    font-family: var(--font-serif);
    font-size: 26px;
    font-weight: 500;
    line-height: 1;
  }

  .navbar__tag {
    font-size: 9px;
    line-height: 1;
  }

  .navbar__nav ul {
    display: flex;
    gap: var(--space-6);
  }

  .navbar__nav a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--ink);
    font: 400 14px/1 var(--font-sans);
    text-decoration: none;
    transition: color var(--dur-fast) var(--ease-lux);
  }

  .navbar__nav a:hover {
    color: var(--accent);
  }

  .navbar__toggle,
  .menu__close {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    padding: 0;
    border: 1px solid var(--hairline);
    border-radius: 50%;
    background: var(--surface-raised);
    color: var(--ink);
  }

  .navbar__toggle {
    display: none;
  }

  @media (max-width: 1023.98px) {
    .navbar__nav {
      display: none;
    }

    .navbar__toggle {
      display: grid;
    }
  }

  @media (max-width: 479.98px) {
    .navbar__pill :global(.navbar__cta) {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .navbar[data-hidden] {
      transform: none;
    }
  }

  /* Gaveta mobile em tela cheia: dialog modal (foco preso, Esc fecha, resto da página inerte) */
  .menu {
    width: 100%;
    max-width: none;
    height: 100%;
    max-height: none;
    margin: 0;
    padding: var(--space-6) var(--gutter);
    border: 0;
    background: var(--surface-blush);
    color: var(--ink);
  }

  .menu[open] {
    display: flex;
    flex-direction: column;
    gap: var(--space-12);
  }

  .menu::backdrop {
    background: rgb(51 36 31 / 0.2);
  }

  .menu__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .menu__links {
    display: grid;
    gap: var(--space-4);
  }

  .menu__links a {
    color: var(--ink);
    font-family: var(--font-serif);
    font-size: 40px;
    line-height: 1.15;
    text-decoration: none;
  }

  .menu__links a:hover {
    color: var(--accent);
  }

  :global(html:has(dialog[open])) {
    overflow: hidden;
  }
</style>

<script>
  import { updateNavbarScroll, type NavbarScroll } from '../lib/navbar';

  const navbar = document.querySelector<HTMLElement>('[data-navbar]');
  const menu = document.querySelector<HTMLDialogElement>('[data-nav-menu]');
  const openButton = document.querySelector<HTMLButtonElement>('[data-nav-open]');

  if (navbar) {
    let state: NavbarScroll = { anchorY: window.scrollY, hidden: false };
    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          const next = updateNavbarScroll(state, window.scrollY);
          if (next.hidden !== state.hidden) navbar.toggleAttribute('data-hidden', next.hidden);
          state = next;
          ticking = false;
        });
      },
      { passive: true },
    );
  }

  if (menu && openButton) {
    let leavingByLink = false;
    openButton.addEventListener('click', () => {
      leavingByLink = false;
      menu.showModal();
      openButton.setAttribute('aria-expanded', 'true');
    });
    menu.querySelector('[data-nav-close]')?.addEventListener('click', () => menu.close());
    menu.querySelectorAll('a').forEach((link) =>
      link.addEventListener('click', () => {
        leavingByLink = true;
        menu.close();
      }),
    );
    menu.addEventListener('close', () => {
      openButton.setAttribute('aria-expanded', 'false');
      if (!leavingByLink) openButton.focus({ preventScroll: true });
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (event) => {
      if (event.matches && menu.open) menu.close();
    });
  }
</script>
```

- [ ] **Step 6: Substituir `src/pages/index.astro` inteiro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Marquee from '../components/Marquee.astro';
import Navbar from '../components/Navbar.astro';
import RichTitle from '../components/RichTitle.astro';
import WhatsAppFloat from '../components/WhatsAppFloat.astro';
import { media } from '../content/media';
import { listPending } from '../content/pending';
import { site } from '../content/site';
import { buildBusinessJsonLd } from '../lib/seo';

for (const line of listPending(site)) console.warn(`[pendente] ${line}`);
for (const line of media.reportLines()) console.warn(`[mídia] ${line}`);

const jsonLd = [
  buildBusinessJsonLd(site, {
    url: new URL('/', Astro.site).href,
    image: new URL('/og.jpg', Astro.site).href,
  }),
];
---

<BaseLayout path="/" jsonLd={jsonLd}>
  <Marquee slot="header" />
  <Navbar slot="header" />
  <section class="section">
    <div class="container">
      <RichTitle as="h1" size="display" title={site.hero.title} />
    </div>
  </section>
  <WhatsAppFloat slot="after" />
</BaseLayout>
```

- [ ] **Step 7: Build e testes de dist passando**

Run: `npm run build && npm run test:dist`
Expected: PASS em todos os testes de dist (incluindo os 6 de `header.test.ts`).

- [ ] **Step 8: Conferir a gaveta no navegador (teclado e foco)**

```bash
mkdir -p .e2e-tmp
cat > .e2e-tmp/drawer-check.sh <<'EOF'
set -euo pipefail
AB=(agent-browser --session lt-check)
"${AB[@]}" close >/dev/null 2>&1 || true
"${AB[@]}" open "$BASE_URL" >/dev/null
"${AB[@]}" set viewport 375 812 >/dev/null
"${AB[@]}" open "$BASE_URL" >/dev/null
"${AB[@]}" click "[data-nav-open]" >/dev/null
"${AB[@]}" eval --stdin <<'JS'
(() => {
  const menu = document.querySelector('[data-nav-menu]');
  if (!menu.open) throw new Error('o menu não abriu');
  if (!menu.contains(document.activeElement)) throw new Error('o foco não entrou no menu');
  return 'menu aberto com foco dentro';
})()
JS
"${AB[@]}" screenshot "" .e2e-tmp/menu-375.png >/dev/null
"${AB[@]}" press Escape >/dev/null
"${AB[@]}" eval --stdin <<'JS'
(() => {
  const toggle = document.querySelector('[data-nav-open]');
  if (document.querySelector('[data-nav-menu]').open) throw new Error('Esc não fechou o menu');
  if (toggle.getAttribute('aria-expanded') !== 'false') throw new Error('aria-expanded não voltou para false');
  if (document.activeElement !== toggle) throw new Error('o foco não voltou ao botão do menu');
  return 'menu fechado e foco de volta no botão';
})()
JS
"${AB[@]}" close >/dev/null
EOF
node scripts/with-preview.mjs bash .e2e-tmp/drawer-check.sh
```

Expected: imprime `"menu aberto com foco dentro"` e `"menu fechado e foco de volta no botão"`; `.e2e-tmp/menu-375.png` mostra a gaveta rosada em tela cheia com os 6 links em Cormorant 40px e o botão "Agendar avaliação".

- [ ] **Step 9: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add src/lib/navbar.ts src/lib/navbar.test.ts src/components/Marquee.astro src/components/Navbar.astro tests/dist/header.test.ts src/pages/index.astro
git commit -m "$(cat <<'EOF'
feat: marquee com pausa e navbar fixa com gaveta mobile acessível

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: Hero

**Files:**
- Create: `src/components/Hero.astro`, `tests/dist/hero.test.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `site.hero`, `media.get('dra/hero')`, `altText`, `whatsappLink`, `Button`, `Icon`, `RichTitle`.
- Produces: `<Hero />` — `section#inicio` com `h1#hero-title[data-title]`, CTA `data-wa-origin="hero"`, CTA secundário para `#resultados`, estrela `[data-highlight]` (único uso do vermelho), arco `.hero__arch[data-arch-reveal][data-parallax="-10"]`, badge `[data-parallax="6"]`, `<img data-slot="dra/hero">` com `fetchpriority="high"`.

- [ ] **Step 1: Escrever o teste de dist que falha — `tests/dist/hero.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { loadPage, textOf } from './load';

describe('hero', () => {
  it('tem o h1 do copy com o itálico em "ser você."', () => {
    const { document } = loadPage();
    const h1 = document.querySelector('h1');
    expect(textOf(h1)).toBe('Rejuvenescer sem deixar de ser você.');
    expect(textOf(h1?.querySelector('em'))).toBe('ser você.');
    expect(h1?.closest('section')?.id).toBe('inicio');
  });

  it('tem eyebrow e subtítulo do copy', () => {
    const { document } = loadPage();
    expect(textOf(document.querySelector('#inicio .lt-eyebrow'))).toBe(
      'HARMONIZAÇÃO FACIAL · SUDOESTE, BRASÍLIA',
    );
    expect(textOf(document.querySelector('#inicio .hero__subtitle'))).toBe(
      'Protocolos individuais para a pele 40+, com naturalidade, segurança e planejamento. Do jeito que a Dra. Laura Tavares já fez em mais de 25 mil atendimentos.',
    );
  });

  it('CTA primário abre o WhatsApp (geral) e o secundário leva a #resultados', () => {
    const { document } = loadPage();
    const primary = document.querySelector('#inicio a[data-wa-origin="hero"]');
    expect(textOf(primary)).toBe('Agendar minha avaliação');
    expect(new URL(primary?.getAttribute('href') ?? '').searchParams.get('text')).toBe(
      'Olá! Vim pelo site e gostaria de agendar uma avaliação com a Dra. Laura.',
    );
    expect(textOf(document.querySelector('#inicio a[href="#resultados"]'))).toBe('Ver resultados reais');
  });

  it('mostra os dois selos e usa o vermelho de destaque uma única vez', () => {
    const { document } = loadPage();
    expect(Array.from(document.querySelectorAll('.hero__seals li'), (item) => textOf(item))).toEqual([
      'Melhor Atendimento — Santa Permuta 2026',
      'Formação internacional — AMWC Coreia 2026',
    ]);
    expect(document.querySelectorAll('[data-highlight]')).toHaveLength(1);
  });

  it('tem o badge "+25 mil atendimentos realizados"', () => {
    const { document } = loadPage();
    expect(textOf(document.querySelector('.hero__badge'))).toBe('+25 mil atendimentos realizados');
  });

  it('a foto do hero é a única com prioridade e sai em AVIF/WebP', () => {
    const { document } = loadPage();
    const img = document.querySelector('#inicio img[data-slot="dra/hero"]');
    expect(img?.getAttribute('fetchpriority')).toBe('high');
    expect(img?.getAttribute('loading')).not.toBe('lazy');
    expect(document.querySelectorAll('img[fetchpriority="high"]')).toHaveLength(1);
    const types = Array.from(img?.closest('picture')?.querySelectorAll('source') ?? [], (source) =>
      source.getAttribute('type'),
    );
    expect(types).toEqual(['image/avif', 'image/webp']);
  });

  it('alt do copy na foto real e alt vazio enquanto for placeholder', () => {
    const { document } = loadPage();
    const img = document.querySelector('#inicio img[data-slot="dra/hero"]');
    const expected = img?.hasAttribute('data-placeholder')
      ? ''
      : 'Dra. Laura Tavares na recepção da clínica de estética no Sudoeste, Brasília';
    expect(img?.getAttribute('alt')).toBe(expected);
  });
});
```

Run: `npm run build && npm run test:dist`
Expected: FAIL nos testes de `hero.test.ts` (o h1 provisório não está em `#inicio`, não há CTAs nem foto).

- [ ] **Step 2: Criar `src/components/Hero.astro`**

```astro
---
import { Picture } from 'astro:assets';
import Button from './Button.astro';
import Icon from './icons/Icon.astro';
import RichTitle from './RichTitle.astro';
import { altText, media } from '../content/media';
import { site } from '../content/site';
import { whatsappLink } from '../lib/whatsapp';

const { hero } = site;
const photo = media.get('dra/hero');
---

<section id="inicio" class="section hero" aria-labelledby="hero-title">
  <div class="container hero__grid">
    <div class="hero__copy">
      <p class="lt-eyebrow">{hero.eyebrow}</p>
      <RichTitle id="hero-title" as="h1" size="display" title={hero.title} />
      <p class="lt-lead hero__subtitle">{hero.subtitle}</p>
      <div class="hero__ctas">
        <Button href={whatsappLink('general')} data-wa-origin="hero">{hero.primaryCta}</Button>
        <Button href="#resultados" variant="outline">{hero.secondaryCta}</Button>
      </div>
      <ul class="hero__seals lt-caption" role="list">
        {
          hero.seals.map((seal) => (
            <li>
              {seal.star && (
                <span class="hero__star" data-highlight>
                  <Icon name="star-fill" size={14} />
                </span>
              )}
              <b>{seal.lead}</b>
              {seal.rest}
            </li>
          ))
        }
      </ul>
    </div>
    <div class="hero__media">
      <div class="lt-arch hero__arch" data-arch-reveal data-parallax="-10">
        <Picture
          src={photo.image}
          alt={altText(photo, hero.imageAlt)}
          widths={[480, 720, 960, 1280]}
          sizes="(min-width: 1024px) 520px, 88vw"
          formats={['avif', 'webp']}
          priority
          class="hero__img"
          style={`object-position: ${photo.position}`}
          data-slot={photo.slot}
          data-placeholder={photo.isPlaceholder ? '' : undefined}
        />
      </div>
      <div class="lt-card hero__badge" data-parallax="6">
        <p class="lt-stat__num hero__badge-value">{hero.badge.value}</p>
        <p class="lt-caption">{hero.badge.label}</p>
      </div>
    </div>
  </div>
</section>

<style>
  .hero {
    padding-block: var(--space-12) var(--section-pad);
  }

  .hero__grid {
    display: grid;
    gap: var(--space-12);
    align-items: center;
  }

  .hero__copy {
    display: grid;
    gap: var(--space-6);
  }

  .hero__subtitle {
    max-width: 460px;
  }

  .hero__ctas {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin-top: var(--space-2);
  }

  .hero__seals {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3) var(--space-8);
    margin-top: var(--space-4);
  }

  .hero__seals li {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0 var(--space-1);
  }

  .hero__seals b {
    color: var(--ink);
    font-weight: 500;
  }

  .hero__star {
    display: inline-grid;
    color: var(--highlight);
  }

  .hero__media {
    position: relative;
    order: -1;
  }

  .hero__arch {
    height: min(70vh, 620px);
    max-width: 520px;
    margin-inline: auto;
  }

  .hero__arch :global(picture),
  .hero__arch :global(img) {
    display: block;
    width: 100%;
    height: 100%;
  }

  .hero__arch :global(img) {
    object-fit: cover;
  }

  .hero__badge {
    position: absolute;
    bottom: var(--space-8);
    left: 0;
    padding: var(--space-4) var(--space-6);
    box-shadow: var(--shadow-lift);
  }

  .hero__badge-value {
    font-size: 44px;
  }

  @media (min-width: 1024px) {
    .hero__grid {
      grid-template-columns: repeat(12, minmax(0, 1fr));
      column-gap: var(--gutter);
    }

    .hero__copy {
      grid-column: 1 / span 5;
    }

    .hero__media {
      grid-column: 7 / span 6;
      order: 0;
    }

    .hero__arch {
      height: 600px;
      margin-inline: 40px 0;
    }
  }
</style>
```

- [ ] **Step 3: Substituir `src/pages/index.astro` inteiro** (sai o h1 provisório)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import Marquee from '../components/Marquee.astro';
import Navbar from '../components/Navbar.astro';
import WhatsAppFloat from '../components/WhatsAppFloat.astro';
import { media } from '../content/media';
import { listPending } from '../content/pending';
import { site } from '../content/site';
import { buildBusinessJsonLd } from '../lib/seo';

for (const line of listPending(site)) console.warn(`[pendente] ${line}`);
for (const line of media.reportLines()) console.warn(`[mídia] ${line}`);

const jsonLd = [
  buildBusinessJsonLd(site, {
    url: new URL('/', Astro.site).href,
    image: new URL('/og.jpg', Astro.site).href,
  }),
];
---

<BaseLayout path="/" jsonLd={jsonLd}>
  <Marquee slot="header" />
  <Navbar slot="header" />
  <Hero />
  <WhatsAppFloat slot="after" />
</BaseLayout>
```

- [ ] **Step 4: Build, testes de dist e conferência visual**

Run: `npm run build && npm run test:dist && node scripts/with-preview.mjs bash scripts/shot.sh "#inicio" 375 1280`
Expected: PASS em todos os testes de dist. Em `.e2e-tmp/inicio-1280.png`: texto à esquerda (5 colunas), arco à direita com o placeholder rosado e o badge "+25 mil" sobre o canto inferior esquerdo da foto. Em `.e2e-tmp/inicio-375.png`: o arco vem primeiro (≈70% da altura da tela), texto abaixo, botões quebrando em linha sem estourar a largura. Compare com `docs/design-system/components/Hero/preview.html`.

- [ ] **Step 5: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add src/components/Hero.astro tests/dist/hero.test.ts src/pages/index.astro
git commit -m "$(cat <<'EOF'
feat: hero com título em itálico, CTAs, selos e foto em arco

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 13: Na mídia (PressStrip) com `imprensa.json` opcional — TDD

**Files:**
- Create: `src/content/press.ts`, `src/content/press.test.ts`, `src/components/PressStrip.astro`, `tests/dist/press.test.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `site.press` (Task 4); `src/content/imprensa.json` (frente de mídia, opcional) — array de `{ "veiculo": string, "titulo": string, "url": string | null }`.
- Produces: `interface PressItem { outlet: string; title: string; url: string | null; note?: string }`, `mergePress(raw: unknown, fallback: Site['press']['items']): PressItem[]`, `press: PressItem[]`; `<PressStrip />` (`section#na-midia`).

- [ ] **Step 1: Escrever o teste que falha — `src/content/press.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { mergePress } from './press';
import { site } from './site';

const fallback = site.press.items;

describe('mergePress', () => {
  it('sem imprensa.json usa os 4 itens do copy, sem link', () => {
    const items = mergePress(undefined, fallback);
    expect(items).toHaveLength(4);
    expect(items.every((item) => item.url === null)).toBe(true);
    expect(items[0]).toEqual({
      outlet: 'Revista Orla BSB',
      title: '"Laura Tavares celebra 8 anos e consolida clínica de estética no Sudoeste"',
      url: null,
      note: 'capa, edição nº 4',
    });
  });

  it('usa os links do imprensa.json e mantém a nota quando o veículo bate com o copy', () => {
    const raw = [
      { veiculo: 'Revista Orla BSB', titulo: 'Laura Tavares celebra 8 anos', url: 'https://exemplo.com/orla' },
    ];
    expect(mergePress(raw, fallback)).toEqual([
      {
        outlet: 'Revista Orla BSB',
        title: 'Laura Tavares celebra 8 anos',
        url: 'https://exemplo.com/orla',
        note: 'capa, edição nº 4',
      },
    ]);
  });

  it('aceita url nula e menos de 4 itens', () => {
    const raw = [{ veiculo: 'W3 Notícias', titulo: 'Korean Beauty Day', url: null }];
    expect(mergePress(raw, fallback)).toEqual([
      { outlet: 'W3 Notícias', title: 'Korean Beauty Day', url: null },
    ]);
  });

  it('recusa url vazia, url javascript: e campos extras', () => {
    expect(() => mergePress([{ veiculo: 'X', titulo: 'Y', url: '' }], fallback)).toThrow(
      /imprensa\.json inválido/,
    );
    expect(() =>
      mergePress([{ veiculo: 'X', titulo: 'Y', url: 'javascript:alert(1)' }], fallback),
    ).toThrow(/imprensa\.json inválido/);
    expect(() => mergePress([{ veiculo: 'X', titulo: 'Y', url: null, extra: 1 }], fallback)).toThrow(
      /imprensa\.json inválido/,
    );
  });

  it('recusa lista vazia', () => {
    expect(() => mergePress([], fallback)).toThrow(/imprensa\.json inválido/);
  });
});
```

Run: `npm test -- src/content/press.test.ts`
Expected: FAIL com `Failed to resolve import "./press"`.

- [ ] **Step 2: Implementar `src/content/press.ts`**

```ts
import { z } from 'zod';
import { site, type Site } from './site';

const pressJsonSchema = z
  .array(
    z.strictObject({
      veiculo: z.string().min(1),
      titulo: z.string().min(1),
      url: z.url({ protocol: /^https?$/ }).nullable(),
    }),
  )
  .min(1);

export interface PressItem {
  outlet: string;
  title: string;
  url: string | null;
  note?: string;
}

/** Usa src/content/imprensa.json (frente de mídia) quando existir; senão, os itens do copy sem link. */
export function mergePress(raw: unknown, fallback: Site['press']['items']): PressItem[] {
  if (raw === undefined) {
    return fallback.map((item) => ({
      outlet: item.outlet,
      title: item.title,
      url: null,
      ...(item.note ? { note: item.note } : {}),
    }));
  }
  const parsed = pressJsonSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`src/content/imprensa.json inválido:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data.map((entry, index) => {
    const base = fallback[index];
    const note = base && base.outlet === entry.veiculo ? base.note : undefined;
    return { outlet: entry.veiculo, title: entry.titulo, url: entry.url, ...(note ? { note } : {}) };
  });
}

const modules = import.meta.glob('/src/content/imprensa.json', { eager: true, import: 'default' });

export const press: PressItem[] = mergePress(Object.values(modules)[0], site.press.items);
```

Run: `npm test -- src/content/press.test.ts`
Expected: PASS — `Tests  5 passed`.

- [ ] **Step 3: Escrever o teste de dist que falha — `tests/dist/press.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { loadPage, textOf } from './load';

describe('na mídia', () => {
  it('tem o eyebrow como título da seção e a linha de apoio do copy', () => {
    const { document } = loadPage();
    const section = document.querySelector('section#na-midia');
    expect(textOf(section?.querySelector('h2'))).toBe('NA MÍDIA');
    expect(textOf(section?.querySelector('.press__support'))).toBe(
      'Uma trajetória reconhecida pela imprensa de Brasília.',
    );
  });

  it('lista os veículos na ordem do copy', () => {
    const { document } = loadPage();
    expect(Array.from(document.querySelectorAll('#na-midia .press__outlet'), (node) => textOf(node))).toEqual([
      'Revista Orla BSB',
      'Diário de Brasília',
      'W3 Notícias',
      'Diário de Brasília',
    ]);
  });

  it('links de matéria (quando houver) abrem em nova aba com rel seguro', () => {
    const { document } = loadPage();
    for (const link of document.querySelectorAll('#na-midia a')) {
      expect(link.getAttribute('href')).toMatch(/^https?:\/\//);
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    }
  });
});
```

Run: `npm run build && npm run test:dist`
Expected: FAIL nos testes de `press.test.ts`.

- [ ] **Step 4: Criar `src/components/PressStrip.astro`**

```astro
---
import { press } from '../content/press';
import { site } from '../content/site';
---

<section
  id="na-midia"
  class="section section--blush section--compact press"
  aria-labelledby="press-title"
>
  <div class="container">
    <div class="press__header">
      <h2 id="press-title" class="lt-eyebrow">{site.press.eyebrow}</h2>
      <p class="lt-body press__support">{site.press.support}</p>
    </div>
    <ul class="press__list" role="list">
      {
        press.map((item) => (
          <li class="press__item" data-reveal>
            {item.url ? (
              <a class="press__link" href={item.url} target="_blank" rel="noopener noreferrer">
                <span class="press__outlet">{item.outlet}</span>
                <span class="press__title">{item.title}</span>
              </a>
            ) : (
              <p class="press__link">
                <span class="press__outlet">{item.outlet}</span>
                <span class="press__title">{item.title}</span>
              </p>
            )}
            {item.note && <p class="lt-caption press__note">{item.note}</p>}
          </li>
        ))
      }
    </ul>
  </div>
</section>

<style>
  .press__header {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
    text-align: center;
  }

  .press__list {
    display: grid;
    gap: var(--space-6);
    margin-top: var(--space-12);
  }

  .press__item {
    padding-top: var(--space-4);
    border-top: 1px solid var(--hairline);
  }

  .press__link {
    display: grid;
    gap: var(--space-2);
    color: inherit;
    text-decoration: none;
  }

  .press__outlet {
    color: var(--ink);
    font: 500 26px/1.15 var(--font-serif);
    transition: color var(--dur-fast) var(--ease-lux);
  }

  a.press__link:hover .press__outlet {
    color: var(--accent);
  }

  .press__title {
    color: var(--ink-muted);
    font: 400 15px/24px var(--font-sans);
  }

  .press__note {
    margin-top: var(--space-1);
  }

  @media (min-width: 768px) {
    .press__list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .press__list {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
</style>
```

- [ ] **Step 5: Em `src/pages/index.astro`, importar e montar a seção depois do Hero**

Acrescente `import PressStrip from '../components/PressStrip.astro';` aos imports e troque `  <Hero />` por:

```astro
  <Hero />
  <PressStrip />
```

- [ ] **Step 6: Build, testes de dist e conferência visual**

Run: `npm run build && npm run test:dist && node scripts/with-preview.mjs bash scripts/shot.sh "#na-midia" 375 1280`
Expected: PASS; captura com faixa rosada, "NA MÍDIA" centralizado e 4 colunas no desktop (1 no mobile) separadas por fios `hairline`.

- [ ] **Step 7: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add src/content/press.ts src/content/press.test.ts src/components/PressStrip.astro tests/dist/press.test.ts src/pages/index.astro
git commit -m "$(cat <<'EOF'
feat: seção Na mídia com links opcionais do imprensa.json

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 14: Tratamentos (TreatmentCard × 4)

**Files:**
- Create: `src/components/TreatmentCard.astro`, `src/components/Treatments.astro`, `tests/dist/treatments.test.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `site.treatments`, `site.ui.moreAbout`, `media.get('tratamentos/<slug>')`, `whatsappLink('treatment', detalhe)`, `SectionHeading`, `Icon`, `type IconName`.
- Produces: `<TreatmentCard title text href linkLabel icon photo />` (mostra a foto real ou, enquanto for placeholder, o ícone dourado); `<Treatments />` (`section#tratamentos`).

- [ ] **Step 1: Escrever o teste de dist que falha — `tests/dist/treatments.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { loadPage, textOf } from './load';

describe('tratamentos', () => {
  it('tem eyebrow, título com itálico e lead do copy', () => {
    const { document } = loadPage();
    const section = document.querySelector('section#tratamentos');
    expect(textOf(section?.querySelector('.lt-eyebrow'))).toBe('TRATAMENTOS');
    expect(textOf(section?.querySelector('h2'))).toBe('Cuidado avançado, do seu jeito.');
    expect(textOf(section?.querySelector('h2 em'))).toBe('do seu jeito.');
    expect(textOf(section?.querySelector('.heading__lead'))).toBe(
      'Cada tratamento começa com uma avaliação do seu rosto. Nada de fórmula pronta: o plano é desenhado para os seus traços e para o que você quer sentir ao se olhar no espelho.',
    );
  });

  it('tem os 4 cards na ordem do copy', () => {
    const { document } = loadPage();
    expect(Array.from(document.querySelectorAll('#tratamentos h3'), (node) => textOf(node))).toEqual([
      'Harmonização facial',
      'Rejuvenescimento 40+',
      'K-Beauty na clínica',
      'Harmonização corporal',
    ]);
  });

  it('cada "Saiba mais" abre o WhatsApp com o tratamento do card', () => {
    const { document } = loadPage();
    const messages = Array.from(document.querySelectorAll('#tratamentos a[data-wa-origin="treatment"]'), (link) =>
      new URL(link.getAttribute('href') ?? '').searchParams.get('text'),
    );
    expect(messages).toEqual([
      'Olá! Tenho interesse em harmonização facial. Podem me ajudar?',
      'Olá! Tenho interesse em rejuvenescimento 40+. Podem me ajudar?',
      'Olá! Tenho interesse em K-Beauty na clínica. Podem me ajudar?',
      'Olá! Tenho interesse em harmonização corporal. Podem me ajudar?',
    ]);
  });

  it('o link tem texto descritivo para leitor de tela e Lighthouse', () => {
    const { document } = loadPage();
    expect(textOf(document.querySelector('#tratamentos a[data-wa-origin="treatment"]'))).toBe(
      'Saiba mais sobre Harmonização facial',
    );
  });

  it('cada card mostra a foto real ou, enquanto ela não chega, o ícone', () => {
    const { document } = loadPage();
    for (const card of document.querySelectorAll('#tratamentos article')) {
      const hasPhoto = card.querySelector('img[data-slot^="tratamentos/"]') !== null;
      const hasIcon = card.querySelector('.lt-icon svg') !== null;
      expect(hasPhoto !== hasIcon).toBe(true);
    }
  });
});
```

Run: `npm run build && npm run test:dist`
Expected: FAIL nos testes de `treatments.test.ts`.

- [ ] **Step 2: Criar `src/components/TreatmentCard.astro`**

```astro
---
import { Picture } from 'astro:assets';
import Icon from './icons/Icon.astro';
import type { IconName } from './icons/registry';
import type { ResolvedImage } from '../content/media';
import { site } from '../content/site';

interface Props {
  title: string;
  text: string;
  href: string;
  linkLabel: string;
  icon: IconName;
  photo: ResolvedImage;
}

const { title, text, href, linkLabel, icon, photo } = Astro.props;
---

<article class="lt-card treatment" data-reveal>
  {
    photo.isPlaceholder ? (
      <div class="lt-icon treatment__icon">
        <Icon name={icon} size={26} />
      </div>
    ) : (
      <Picture
        src={photo.image}
        alt=""
        widths={[360, 540, 720]}
        sizes="(min-width: 1024px) 260px, (min-width: 768px) 44vw, 78vw"
        formats={['avif', 'webp']}
        class="treatment__img"
        style={`object-position: ${photo.position}`}
        data-slot={photo.slot}
      />
    )
  }
  <h3 class="lt-title is-h3 treatment__title">{title}</h3>
  <p class="lt-body">{text}</p>
  <a
    class="lt-btn lt-btn--ghost treatment__link"
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    data-wa-origin="treatment"
  >
    {linkLabel}<span class="sr-only"> {site.ui.moreAbout} {title}</span>
  </a>
</article>

<style>
  .treatment {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    height: 100%;
  }

  .treatment :global(.treatment__img) {
    width: 100%;
    height: auto;
    aspect-ratio: 4 / 5;
    border-radius: var(--radius-md);
    object-fit: cover;
  }

  .treatment__title {
    margin-top: var(--space-2);
  }

  .treatment__link {
    align-self: flex-start;
    margin-top: auto;
  }
</style>
```

- [ ] **Step 3: Criar `src/components/Treatments.astro`**

```astro
---
import SectionHeading from './SectionHeading.astro';
import TreatmentCard from './TreatmentCard.astro';
import { media } from '../content/media';
import { site } from '../content/site';
import { whatsappLink } from '../lib/whatsapp';

const { treatments } = site;
---

<section id="tratamentos" class="section treatments" aria-labelledby="treatments-title">
  <div class="container">
    <SectionHeading
      id="treatments-title"
      eyebrow={treatments.eyebrow}
      title={treatments.title}
      lead={treatments.lead}
    />
    <div class="treatments__grid">
      {
        treatments.items.map((item) => (
          <TreatmentCard
            title={item.title}
            text={item.text}
            href={whatsappLink('treatment', item.whatsappDetail)}
            linkLabel={treatments.linkLabel}
            icon={item.icon}
            photo={media.get(`tratamentos/${item.slug}` as const)}
          />
        ))
      }
    </div>
  </div>
</section>

<style>
  /* Mobile: carrossel com snap (DS TreatmentCard); tablet: 2 colunas; desktop: 4 colunas. */
  .treatments__grid {
    display: grid;
    grid-auto-columns: min(78%, 320px);
    grid-auto-flow: column;
    gap: var(--space-4);
    margin-inline: calc(-1 * var(--gutter));
    padding: 0 var(--gutter) var(--space-4);
    overflow-x: auto;
    scroll-padding-inline: var(--gutter);
    scroll-snap-type: x mandatory;
  }

  .treatments__grid > :global(*) {
    scroll-snap-align: start;
  }

  @media (min-width: 768px) {
    .treatments__grid {
      grid-auto-flow: row;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin-inline: 0;
      padding: 0;
      overflow: visible;
    }
  }

  @media (min-width: 1024px) {
    .treatments__grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: var(--space-6);
    }
  }
</style>
```

- [ ] **Step 4: Em `src/pages/index.astro`, importar e montar a seção depois do PressStrip**

Acrescente `import Treatments from '../components/Treatments.astro';` aos imports e troque `  <PressStrip />` por:

```astro
  <PressStrip />
  <Treatments />
```

- [ ] **Step 5: Build, testes de dist e conferência visual**

Run: `npm run build && npm run test:dist && node scripts/with-preview.mjs bash scripts/shot.sh "#tratamentos" 375 768 1280`
Expected: PASS; captura 1280 com 4 cards brancos (ícone dourado em círculo, título Cormorant 600, texto e "Saiba mais" sublinhado em rosewood); 768 com 2×2; 375 com carrossel horizontal (o próximo card aparece cortado à direita, sem rolagem horizontal da página).

- [ ] **Step 6: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add src/components/TreatmentCard.astro src/components/Treatments.astro tests/dist/treatments.test.ts src/pages/index.astro
git commit -m "$(cat <<'EOF'
feat: seção de tratamentos com cards e CTAs por tratamento

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 15: Fechamento da Etapa 2 — executada pelo orquestrador

> **Executada pelo ORQUESTRADOR.** Ele acrescenta ao corpo do PR e à mensagem do commit de squash as linhas de atribuição exigidas pela sessão dele.

**Files:**
- Modify: `docs/qa/lighthouse.md` (gerado), `docs/HANDOFF.md` (na `main`)

- [ ] **Step 1: Gate completo na branch**

Run: `npm run check && npm run lighthouse`
Expected: tudo verde e `Resultado: **aprovado**` em `docs/qa/lighthouse.md`. Se reprovar, liste as oportunidades com `node -e "const r=require('./docs/qa/lighthouse/home.json'); for (const a of Object.values(r.audits)) if (a.score !== null && a.score < 0.9 && a.details && a.details.type === 'opportunity') console.log(a.id, a.displayValue || '')"`, corrija na tarefa responsável e repita. Commite o resumo: `git add docs/qa/lighthouse.md` + commit `docs: resumo do Lighthouse da Etapa 2` (com a linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).

- [ ] **Step 2: Push e PR**

```bash
git push -u origin feat/secoes-topo
mkdir -p .e2e-tmp
cat > .e2e-tmp/pr-body.md <<'EOF'
## Resumo
- Ícones Phosphor Light inline, Button, RichTitle (itálico rosé do copy) e SectionHeading.
- Botão flutuante do WhatsApp com balão (6 s ou 40% de rolagem).
- Marquee de prova social com botão de pausa e navbar fixa (esconde ao rolar para baixo) com gaveta mobile em `<dialog>` acessível.
- Hero com h1, subtítulo, CTAs, selos (o único vermelho da página) e foto em arco com badge "+25 mil".
- Na mídia com links opcionais vindos de `src/content/imprensa.json` e Tratamentos com 4 cards e mensagem de WhatsApp por tratamento.

## Checklist de validação
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`
- [x] `npm run test:dist`
- [x] `npm run lighthouse` — mobile ≥ 90 nas 4 categorias (`docs/qa/lighthouse.md`)
- [x] Gaveta mobile conferida no agent-browser (abre, foco dentro, Esc fecha e devolve o foco)
- [x] Revisões por subagente (especificação + qualidade) aprovadas nas Tasks 10–14

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
gh pr create --base main --head feat/secoes-topo --title "feat: seções do topo (navbar, hero, na mídia e tratamentos)" --body-file .e2e-tmp/pr-body.md
```

- [ ] **Step 3: Merge squash e volta para a main**

```bash
gh pr merge feat/secoes-topo --squash --delete-branch --subject "feat: seções do topo (navbar, hero, na mídia e tratamentos)"
git checkout main && git pull --ff-only
```

- [ ] **Step 4: Atualizar `docs/HANDOFF.md`**

Em `## Estado`, troque a linha `- Etapas 2–7: pendentes.` por:

```markdown
- **Etapa 2 — seções do topo (`feat/secoes-topo`): concluída e mergeada na `main`.** Marquee com pausa, navbar sticky com gaveta `<dialog>`, hero com foto em arco, Na mídia (lê `imprensa.json` quando existir) e Tratamentos (foto real ou ícone); botão flutuante do WhatsApp.
- Etapas 3–7: pendentes.
```

Em `## Decisões`, acrescente:

```markdown
- Botões de pausa na marquee (e no carrossel, Etapa 3) por causa do critério WCAG 2.2.2 (conteúdo que se move sozinho).
- No mobile estreito (< 480 px) o CTA da navbar some da barra (fica na gaveta e no botão flutuante) para não estourar a largura.
```

Em `## Próximo passo`, troque o item por `- Etapa 3 — \`feat/resultados-metodo\`: Task 16 do plano.` e então:

```bash
git add docs/HANDOFF.md
git commit -m "$(cat <<'EOF'
docs: atualiza HANDOFF após a Etapa 2

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

## Etapa 3 — `feat/resultados-metodo`

> Antes da Task 16: `git checkout main && git pull --ff-only && git checkout -b feat/resultados-metodo`.

### Task 16: Resultados por queixa — slider antes/depois (TDD da lógica), BenefitResult × 4 e seção

**Files:**
- Create: `src/lib/before-after.ts`, `src/lib/before-after.test.ts`, `src/components/BeforeAfter.astro`, `src/components/BenefitResult.astro`, `src/components/Results.astro`, `tests/dist/results.test.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `site.results`, `site.ui.compare`, `media.get('resultados/<slug>-antes|depois')`, `altText`, `whatsappLink('result', área)`, `Button`, `RichTitle`, `SectionHeading`, `Icon`.
- Produces:
  - `HINT_KEYFRAMES: readonly number[]` (`[50, 30, 70, 50]`), `clampPercent(value: number): number`, `percentFromPointer(clientX: number, rect: { left: number; width: number }): number`, `isHorizontalIntent(dx: number, dy: number, threshold?: number): boolean`
  - `<BeforeAfter before after label controlLabel beforeLabel afterLabel />` — raiz `[data-ba][data-arch-reveal]` com `--pos`; `input[type=range][data-ba-range]` (teclado/leitor de tela). Eventos: ouve `ba:set` (`CustomEvent<number>`, posição em %) e emite `ba:interact` quando a pessoa toca/arrasta/usa o teclado — usados pela dica automática da Task 29.
  - `<BenefitResult block index />` e `<Results />` (`section#resultados`, fundo rosado).

- [ ] **Step 1: Escrever o teste que falha — `src/lib/before-after.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { clampPercent, HINT_KEYFRAMES, isHorizontalIntent, percentFromPointer } from './before-after';

describe('clampPercent', () => {
  it('limita entre 0 e 100', () => {
    expect(clampPercent(-5)).toBe(0);
    expect(clampPercent(140)).toBe(100);
    expect(clampPercent(42.5)).toBe(42.5);
  });

  it('volta ao meio com valores inválidos', () => {
    expect(clampPercent(Number.NaN)).toBe(50);
    expect(clampPercent(Number.POSITIVE_INFINITY)).toBe(50);
  });
});

describe('percentFromPointer', () => {
  it('converte a posição do ponteiro em % da largura da imagem', () => {
    expect(percentFromPointer(150, { left: 100, width: 200 })).toBe(25);
  });

  it('limita quando o ponteiro sai da imagem', () => {
    expect(percentFromPointer(50, { left: 100, width: 200 })).toBe(0);
    expect(percentFromPointer(400, { left: 100, width: 200 })).toBe(100);
  });

  it('protege contra largura zero', () => {
    expect(percentFromPointer(10, { left: 0, width: 0 })).toBe(50);
  });
});

describe('isHorizontalIntent', () => {
  it('arrasta quando o gesto é horizontal', () => {
    expect(isHorizontalIntent(12, 3)).toBe(true);
  });

  it('deixa a página rolar quando o gesto é vertical ou diagonal para baixo', () => {
    expect(isHorizontalIntent(4, 20)).toBe(false);
    expect(isHorizontalIntent(10, 12)).toBe(false);
  });

  it('ignora movimentos pequenos', () => {
    expect(isHorizontalIntent(5, 0)).toBe(false);
  });
});

describe('HINT_KEYFRAMES', () => {
  it('segue 50 → 30 → 70 → 50 (Movimento.md, padrão 6)', () => {
    expect(HINT_KEYFRAMES).toEqual([50, 30, 70, 50]);
  });
});
```

Run: `npm test -- src/lib/before-after.test.ts`
Expected: FAIL com `Failed to resolve import "./before-after"`.

- [ ] **Step 2: Implementar `src/lib/before-after.ts`**

```ts
/** Sequência da dica automática do slider (Movimento.md, padrão 6). */
export const HINT_KEYFRAMES: readonly number[] = [50, 30, 70, 50];

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

/** Posição do ponteiro como % da largura da imagem (0 = esquerda, 100 = direita). */
export function percentFromPointer(clientX: number, rect: { left: number; width: number }): number {
  if (rect.width <= 0) return 50;
  return clampPercent(((clientX - rect.left) / rect.width) * 100);
}

/** Toque horizontal o bastante para arrastar o slider em vez de rolar a página. */
export function isHorizontalIntent(dx: number, dy: number, threshold = 6): boolean {
  return Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy);
}
```

Run: `npm test -- src/lib/before-after.test.ts`
Expected: PASS — `Tests  9 passed`.

- [ ] **Step 3: Escrever o teste de dist que falha — `tests/dist/results.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { loadPage, textOf } from './load';

const LEGEND = 'Imagens publicadas com autorização. Resultados variam de pessoa para pessoa.';

describe('resultados por queixa', () => {
  it('tem eyebrow, título com itálico "se vê" e lead do copy', () => {
    const { document } = loadPage();
    const section = document.querySelector('section#resultados');
    expect(section?.classList.contains('section--blush')).toBe(true);
    expect(textOf(section?.querySelector('.lt-eyebrow'))).toBe('RESULTADOS REAIS');
    expect(textOf(section?.querySelector('h2'))).toBe('Naturalidade que se vê, não que se nota.');
    expect(textOf(section?.querySelector('h2 em'))).toBe('se vê');
  });

  it('tem os 4 blocos na ordem, com número e título com itálico', () => {
    const { document } = loadPage();
    const blocks = Array.from(document.querySelectorAll('#resultados article.benefit'));
    expect(blocks.map((block) => textOf(block.querySelector('.benefit__number')))).toEqual(['01', '02', '03', '04']);
    expect(blocks.map((block) => textOf(block.querySelector('h3')))).toEqual([
      'Adeus ao olhar de cansaço',
      'Contornos de precisão',
      'Lábios com hidratação e volume',
      'Suavize o bigode chinês',
    ]);
    expect(blocks.map((block) => textOf(block.querySelector('h3 em')))).toEqual([
      'olhar de cansaço',
      'de precisão',
      'hidratação e volume',
      'bigode chinês',
    ]);
  });

  it('cada bloco tem o CTA "Agendar minha avaliação" com a área na mensagem', () => {
    const { document } = loadPage();
    const links = Array.from(document.querySelectorAll('#resultados a[data-wa-origin="result"]'));
    expect(links.map((link) => textOf(link))).toEqual(Array(4).fill('Agendar minha avaliação'));
    expect(links.map((link) => new URL(link.getAttribute('href') ?? '').searchParams.get('text'))).toEqual([
      'Olá! Vi os resultados no site e quero saber mais sobre olheiras.',
      'Olá! Vi os resultados no site e quero saber mais sobre mandíbula.',
      'Olá! Vi os resultados no site e quero saber mais sobre lábios.',
      'Olá! Vi os resultados no site e quero saber mais sobre bigode chinês.',
    ]);
  });

  it('cada antes/depois tem a legenda de compliance logo abaixo', () => {
    const { document } = loadPage();
    const figures = document.querySelectorAll('#resultados figure.benefit__media');
    expect(figures).toHaveLength(4);
    for (const figure of figures) {
      expect(figure.querySelector('[data-ba]')).not.toBeNull();
      expect(textOf(figure.querySelector('figcaption'))).toBe(LEGEND);
    }
  });

  it('o grupo usa o alt do copy e o controle é um range acessível', () => {
    const { document } = loadPage();
    const groups = Array.from(document.querySelectorAll('#resultados [data-ba]'));
    expect(groups.map((group) => group.getAttribute('aria-label'))).toEqual([
      'Antes e depois de tratamento para olheiras, paciente com autorização de imagem',
      'Antes e depois de tratamento para mandíbula, paciente com autorização de imagem',
      'Antes e depois de tratamento para lábios, paciente com autorização de imagem',
      'Antes e depois de tratamento para bigode chinês, paciente com autorização de imagem',
    ]);
    const range = groups[0]?.querySelector('input[type="range"][data-ba-range]');
    expect(range?.getAttribute('aria-label')).toBe('Comparar antes e depois: olheiras');
    expect([range?.getAttribute('min'), range?.getAttribute('max'), range?.getAttribute('value')]).toEqual([
      '0',
      '100',
      '50',
    ]);
  });

  it('usa as 8 fotos do contrato (reais ou placeholders marcados)', () => {
    const { document } = loadPage();
    for (const slug of ['olhar', 'mandibula', 'labios', 'bigode']) {
      for (const side of ['antes', 'depois']) {
        expect(document.querySelector(`img[data-slot="resultados/${slug}-${side}"]`)).not.toBeNull();
      }
    }
  });
});
```

Run: `npm run build && npm run test:dist`
Expected: FAIL nos testes de `results.test.ts`.

- [ ] **Step 4: Criar `src/components/BeforeAfter.astro`**

```astro
---
import { Picture } from 'astro:assets';
import Icon from './icons/Icon.astro';
import { altText, type ResolvedImage } from '../content/media';

interface Props {
  before: ResolvedImage;
  after: ResolvedImage;
  /** Rótulo do grupo: alt do copy ("Antes e depois de tratamento para …"). */
  label: string;
  /** Nome do controle deslizante (teclado e leitor de tela). */
  controlLabel: string;
  beforeLabel: string;
  afterLabel: string;
}

const { before, after, label, controlLabel, beforeLabel, afterLabel } = Astro.props;
---

<div class="lt-ba ba" role="group" aria-label={label} data-ba data-arch-reveal>
  <div class="lt-ba__layer">
    <Picture
      src={before.image}
      alt={altText(before, beforeLabel)}
      widths={[360, 540, 720, 920]}
      sizes="(min-width: 1024px) 460px, 90vw"
      formats={['avif', 'webp']}
      class="ba__img"
      style={`object-position: ${before.position}`}
      data-slot={before.slot}
      data-placeholder={before.isPlaceholder ? '' : undefined}
    />
  </div>
  <div class="lt-ba__layer lt-ba__after">
    <Picture
      src={after.image}
      alt={altText(after, afterLabel)}
      widths={[360, 540, 720, 920]}
      sizes="(min-width: 1024px) 460px, 90vw"
      formats={['avif', 'webp']}
      class="ba__img"
      style={`object-position: ${after.position}`}
      data-slot={after.slot}
      data-placeholder={after.isPlaceholder ? '' : undefined}
    />
  </div>
  <span class="lt-ba__tag ba__tag--before" aria-hidden="true">{beforeLabel}</span>
  <span class="lt-ba__tag ba__tag--after" aria-hidden="true">{afterLabel}</span>
  <input
    class="ba__range"
    type="range"
    min="0"
    max="100"
    step="1"
    value="50"
    aria-label={controlLabel}
    data-ba-range
  />
  <div class="lt-ba__handle" aria-hidden="true">
    <div class="lt-ba__knob">
      <Icon name="arrows-left-right" size={22} />
    </div>
  </div>
</div>

<style>
  .ba {
    width: 100%;
    max-width: 460px;
    margin-inline: auto;
    background: var(--surface-rose);
    cursor: ew-resize;
  }

  .ba :global(picture),
  .ba :global(.ba__img) {
    display: block;
    width: 100%;
    height: 100%;
  }

  .ba :global(.ba__img) {
    object-fit: cover;
  }

  .ba__tag--before {
    left: 16px;
  }

  .ba__tag--after {
    right: 16px;
  }

  /* O range fica invisível (o arraste é tratado por pointer events na raiz), mas recebe foco e teclado. */
  .ba__range {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    margin: 0;
    opacity: 0;
    pointer-events: none;
  }

  .ba__range:focus-visible + .lt-ba__handle .lt-ba__knob {
    outline: 2px solid var(--focus);
    outline-offset: 3px;
  }
</style>

<script>
  import { clampPercent, isHorizontalIntent, percentFromPointer } from '../lib/before-after';

  for (const root of document.querySelectorAll<HTMLElement>('[data-ba]')) {
    const range = root.querySelector<HTMLInputElement>('[data-ba-range]');
    if (!range) continue;

    const setPosition = (value: number) => {
      const position = clampPercent(value);
      root.style.setProperty('--pos', `${position}%`);
      range.value = String(Math.round(position));
    };
    const interact = () => root.dispatchEvent(new CustomEvent('ba:interact'));

    range.addEventListener('input', () => setPosition(Number(range.value)));
    range.addEventListener('keydown', interact);
    root.addEventListener('ba:set', (event) => {
      const detail = (event as CustomEvent<number>).detail;
      if (typeof detail === 'number') setPosition(detail);
    });

    let pointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let dragging = false;

    root.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      dragging = event.pointerType !== 'touch';
      interact();
      if (dragging) {
        root.setPointerCapture(event.pointerId);
        setPosition(percentFromPointer(event.clientX, root.getBoundingClientRect()));
      }
    });

    root.addEventListener('pointermove', (event) => {
      if (event.pointerId !== pointerId) return;
      if (!dragging) {
        if (!isHorizontalIntent(event.clientX - startX, event.clientY - startY)) return;
        dragging = true;
        root.setPointerCapture(event.pointerId);
      }
      setPosition(percentFromPointer(event.clientX, root.getBoundingClientRect()));
    });

    const stop = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      if (root.hasPointerCapture(event.pointerId)) root.releasePointerCapture(event.pointerId);
      pointerId = null;
      dragging = false;
    };
    root.addEventListener('pointerup', stop);
    root.addEventListener('pointercancel', stop);

    setPosition(Number(range.value));
  }
</script>
```

- [ ] **Step 5: Criar `src/components/BenefitResult.astro`**

```astro
---
import BeforeAfter from './BeforeAfter.astro';
import Button from './Button.astro';
import RichTitle from './RichTitle.astro';
import { media } from '../content/media';
import { site, type Site } from '../content/site';
import { whatsappLink } from '../lib/whatsapp';

interface Props {
  block: Site['results']['blocks'][number];
  index: number;
}

const { block, index } = Astro.props;
const { results, ui } = site;
const flip = index % 2 === 1;
const panel = index % 2 === 0;
const label = results.altTemplate.replace('{area}', block.area);
---

<article
  class:list={['benefit', { 'benefit--flip': flip, 'benefit--panel': panel }]}
  aria-labelledby={`resultado-${block.slug}`}
>
  <div class="benefit__copy" data-reveal>
    <p class="lt-stat__num benefit__number">{block.number}</p>
    <RichTitle id={`resultado-${block.slug}`} as="h3" size="h2" title={block.title} />
    <p class="lt-body benefit__text">{block.text}</p>
    <Button href={whatsappLink('result', block.area)} data-wa-origin="result">{results.cta}</Button>
  </div>
  <figure class="benefit__media">
    <BeforeAfter
      before={media.get(`resultados/${block.slug}-antes` as const)}
      after={media.get(`resultados/${block.slug}-depois` as const)}
      label={label}
      controlLabel={`${ui.compare}: ${block.area}`}
      beforeLabel={results.beforeLabel}
      afterLabel={results.afterLabel}
    />
    <figcaption class="lt-caption benefit__legend">{results.legend}</figcaption>
  </figure>
</article>

<style>
  .benefit {
    display: grid;
    align-items: center;
    gap: var(--space-8);
    padding-block: var(--space-12);
  }

  .benefit--panel {
    padding: var(--space-8) var(--space-6);
    border-radius: var(--radius-lg);
    background: var(--surface);
  }

  .benefit__copy {
    display: grid;
    justify-items: start;
    gap: var(--space-4);
  }

  .benefit__number {
    font-size: 48px;
  }

  .benefit__text {
    max-width: 440px;
    margin-bottom: var(--space-4);
  }

  .benefit__media {
    margin: 0;
  }

  .benefit__legend {
    margin-top: var(--space-3);
    text-align: center;
  }

  @media (min-width: 1024px) {
    .benefit {
      grid-template-columns: 5fr 6fr;
      gap: var(--space-16);
      padding: var(--space-12);
    }

    .benefit--flip {
      grid-template-columns: 6fr 5fr;
    }

    .benefit--flip .benefit__copy {
      order: 2;
    }
  }
</style>
```

- [ ] **Step 6: Criar `src/components/Results.astro`**

```astro
---
import BenefitResult from './BenefitResult.astro';
import SectionHeading from './SectionHeading.astro';
import { site } from '../content/site';

const { results } = site;
---

<section id="resultados" class="section section--blush results" aria-labelledby="results-title">
  <div class="container">
    <SectionHeading
      id="results-title"
      eyebrow={results.eyebrow}
      title={results.title}
      lead={results.lead}
    />
    <div class="results__blocks">
      {results.blocks.map((block, index) => <BenefitResult block={block} index={index} />)}
    </div>
  </div>
</section>

<style>
  .results__blocks {
    display: grid;
    gap: var(--space-8);
  }
</style>
```

- [ ] **Step 7: Em `src/pages/index.astro`, importar e montar depois de Tratamentos**

Acrescente `import Results from '../components/Results.astro';` aos imports e troque `  <Treatments />` por:

```astro
  <Treatments />
  <Results />
```

- [ ] **Step 8: Build e testes de dist passando**

Run: `npm run build && npm run test:dist`
Expected: PASS em todos (incluindo os 6 de `results.test.ts`).

- [ ] **Step 9: Conferir teclado e visual no navegador**

```bash
mkdir -p .e2e-tmp
cat > .e2e-tmp/slider-check.sh <<'EOF'
set -euo pipefail
AB=(agent-browser --session lt-check)
"${AB[@]}" close >/dev/null 2>&1 || true
"${AB[@]}" open "$BASE_URL" >/dev/null
"${AB[@]}" set viewport 1280 800 >/dev/null
"${AB[@]}" open "$BASE_URL" >/dev/null
"${AB[@]}" eval --stdin <<'JS'
(() => {
  const range = document.querySelector('[data-ba-range]');
  range.closest('[data-ba]').scrollIntoView({ block: 'center' });
  range.focus();
  return range.value;
})()
JS
for _ in 1 2 3 4 5; do "${AB[@]}" press ArrowRight >/dev/null; done
"${AB[@]}" eval --stdin <<'JS'
(() => {
  const range = document.querySelector('[data-ba-range]');
  const root = range.closest('[data-ba]');
  if (range.value !== '55') throw new Error(`valor esperado 55, veio ${range.value}`);
  if (root.style.getPropertyValue('--pos') !== '55%') throw new Error('--pos não acompanhou o teclado');
  return 'teclado ok: 55%';
})()
JS
"${AB[@]}" press Home >/dev/null
"${AB[@]}" eval "document.querySelector('[data-ba]').style.getPropertyValue('--pos')"
"${AB[@]}" screenshot "" .e2e-tmp/resultados-1280.png >/dev/null
"${AB[@]}" close >/dev/null
EOF
node scripts/with-preview.mjs bash .e2e-tmp/slider-check.sh
node scripts/with-preview.mjs bash scripts/shot.sh "#resultados" 375 1280
```

Expected: `"teclado ok: 55%"` e depois `"0%"`. Nas capturas: blocos alternando lado e fundo (painel claro / rosado), numeral `01` em gold-ink, slider com etiquetas "Antes"/"Depois", alça branca com o ícone de setas e a legenda centralizada abaixo; no 375 a foto ocupa a largura toda sem rolagem horizontal.

- [ ] **Step 10: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add src/lib/before-after.ts src/lib/before-after.test.ts src/components/BeforeAfter.astro src/components/BenefitResult.astro src/components/Results.astro tests/dist/results.test.ts src/pages/index.astro
git commit -m "$(cat <<'EOF'
feat: resultados por queixa com slider antes/depois acessível e legenda de compliance

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 17: Carrossel infinito de resultados (ResultsCarousel) — TDD do loop

**Files:**
- Create: `src/lib/carousel.ts`, `src/lib/carousel.test.ts`, `src/components/ResultsCarousel.astro`, `tests/dist/carousel.test.ts`
- Modify: `src/components/Results.astro`

**Interfaces:**
- Consumes: `media.carousel()`, `altText`, `site.results.carouselIntro|carouselAlt|legend`, `site.ui.pauseCarousel`, `Icon`.
- Produces: `loopCopies(count: number, options?: { cardWidth?: number; gap?: number; minHalfWidth?: number }): number`; `<ResultsCarousel />` — raiz `[data-reel]` com dois `[data-reel-track]` (`data-reel-direction="-1"` e `"1"`), botão `[data-reel-toggle]` que liga/desliga `data-paused`; animação CSS de 60 s até a Task 28 trocar por GSAP (classe `is-gsap`).

- [ ] **Step 1: Escrever o teste que falha — `src/lib/carousel.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { loopCopies } from './carousel';

describe('loopCopies', () => {
  it('repete o conjunto até cada metade passar de 2000px (cards de 220px + 24px)', () => {
    expect(loopCopies(6)).toBe(2);
    expect(loopCopies(8)).toBe(2);
    expect(loopCopies(9)).toBe(1);
    expect(loopCopies(12)).toBe(1);
  });

  it('cobre a tela mesmo com uma foto só', () => {
    expect(loopCopies(1)).toBe(9);
  });

  it('aceita medidas customizadas', () => {
    expect(loopCopies(4, { cardWidth: 300, gap: 20, minHalfWidth: 1280 })).toBe(1);
  });

  it('recusa quantidade inválida', () => {
    expect(() => loopCopies(0)).toThrow(/quantidade inválida/);
    expect(() => loopCopies(2.5)).toThrow(/quantidade inválida/);
  });
});
```

Run: `npm test -- src/lib/carousel.test.ts`
Expected: FAIL com `Failed to resolve import "./carousel"`.

- [ ] **Step 2: Implementar `src/lib/carousel.ts`**

```ts
/**
 * Quantas cópias do conjunto de fotos cada metade do trilho precisa: o loop anima de 0 a −50%,
 * então cada metade tem de ser mais larga que a maior tela esperada (minHalfWidth).
 */
export function loopCopies(
  count: number,
  { cardWidth = 220, gap = 24, minHalfWidth = 2000 }: { cardWidth?: number; gap?: number; minHalfWidth?: number } = {},
): number {
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error(`loopCopies: quantidade inválida (${count}).`);
  }
  return Math.max(1, Math.ceil(minHalfWidth / (count * (cardWidth + gap))));
}
```

Run: `npm test -- src/lib/carousel.test.ts`
Expected: PASS — `Tests  4 passed`.

- [ ] **Step 3: Escrever o teste de dist que falha — `tests/dist/carousel.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { loadPage, textOf } from './load';

describe('carrossel de resultados', () => {
  it('fica dentro de #resultados com o fecho do copy', () => {
    const { document } = loadPage();
    expect(textOf(document.querySelector('#resultados .carousel__intro'))).toBe(
      'Elas confiaram na Dra. Laura. Deslize e veja mais resultados.',
    );
  });

  it('tem duas fileiras em sentidos opostos, a segunda escondida de leitores de tela', () => {
    const { document } = loadPage();
    const tracks = Array.from(document.querySelectorAll('#resultados [data-reel-track]'));
    expect(tracks.map((track) => track.getAttribute('data-reel-direction'))).toEqual(['-1', '1']);
    expect(tracks[1]?.closest('.carousel__row')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('cada trilho tem duas metades idênticas para o loop sem emenda', () => {
    const { document } = loadPage();
    const slots = Array.from(
      document.querySelector('#resultados [data-reel-track]')?.querySelectorAll('img') ?? [],
      (img) => img.getAttribute('data-slot'),
    );
    const half = slots.length / 2;
    expect(Number.isInteger(half)).toBe(true);
    expect(slots.slice(0, half)).toEqual(slots.slice(half));
  });

  it('expõe só a primeira cópia da primeira fileira (sem leitura duplicada)', () => {
    const { document } = loadPage();
    const exposed = document.querySelectorAll('#resultados .lt-shot:not([aria-hidden])');
    expect(exposed.length).toBeGreaterThanOrEqual(1);
    for (const shot of exposed) expect(shot.closest('[aria-hidden="true"]')).toBeNull();
  });

  it('tem botão de pausa e a legenda de compliance', () => {
    const { document } = loadPage();
    const toggle = document.querySelector('#resultados [data-reel-toggle]');
    expect(toggle?.getAttribute('aria-pressed')).toBe('false');
    expect(textOf(toggle)).toBe('Pausar carrossel de resultados');
    expect(textOf(document.querySelector('#resultados .carousel__legend'))).toBe(
      'Imagens publicadas com autorização. Resultados variam de pessoa para pessoa.',
    );
  });
});
```

Run: `npm run build && npm run test:dist`
Expected: FAIL nos testes de `carousel.test.ts`.

- [ ] **Step 4: Criar `src/components/ResultsCarousel.astro`**

```astro
---
import { Picture } from 'astro:assets';
import Icon from './icons/Icon.astro';
import { altText, media } from '../content/media';
import { site } from '../content/site';
import { loopCopies } from '../lib/carousel';

const { results, ui } = site;
const shots = media.carousel();
const half = Array.from({ length: loopCopies(shots.length) }, () => shots).flat();
const rows = [
  { direction: -1, items: half },
  { direction: 1, items: [...half].reverse() },
];
---

<div class="carousel" data-reel>
  <div class="container carousel__header">
    <p class="carousel__intro">{results.carouselIntro}</p>
    <button type="button" class="carousel__toggle" aria-pressed="false" data-reel-toggle>
      <Icon name="pause" size={18} class="carousel__icon carousel__icon--pause" />
      <Icon name="play" size={18} class="carousel__icon carousel__icon--play" />
      <span class="sr-only">{ui.pauseCarousel}</span>
    </button>
  </div>
  {
    rows.map((row, rowIndex) => (
      <div
        class:list={[
          'lt-reel',
          'carousel__row',
          { 'lt-reel--reverse': row.direction === 1, 'carousel__row--secondary': rowIndex === 1 },
        ]}
        role={rowIndex === 0 ? 'region' : undefined}
        aria-label={rowIndex === 0 ? results.carouselIntro : undefined}
        aria-hidden={rowIndex === 1 ? 'true' : undefined}
        tabindex={rowIndex === 0 ? 0 : undefined}
      >
        <ul
          class="lt-reel__track carousel__track"
          role="list"
          data-reel-track
          data-reel-direction={row.direction}
        >
          {[...row.items, ...row.items].map((shot, index) => {
            const exposed = rowIndex === 0 && index < shots.length;
            return (
              <li
                class="lt-shot"
                aria-hidden={exposed ? undefined : 'true'}
                data-copy={exposed ? undefined : ''}
              >
                <Picture
                  src={shot.image}
                  alt={exposed ? altText(shot, results.carouselAlt) : ''}
                  widths={[260, 440, 520]}
                  sizes="(max-width: 1023.98px) min(64vw, 260px), 220px"
                  formats={['avif', 'webp']}
                  class="carousel__img"
                  data-slot={shot.slot}
                  data-placeholder={shot.isPlaceholder ? '' : undefined}
                />
              </li>
            );
          })}
        </ul>
      </div>
    ))
  }
  <p class="container lt-caption carousel__legend">{results.legend}</p>
</div>

<style>
  .carousel {
    margin-top: var(--space-16);
  }

  .carousel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .carousel__intro {
    color: var(--ink);
    font: 500 clamp(1.5rem, 1.3rem + 0.8vw, 1.75rem) / 1.25 var(--font-serif);
  }

  .carousel__toggle {
    display: none;
    flex: none;
    place-items: center;
    width: 44px;
    height: 44px;
    padding: 0;
    border: 1px solid var(--hairline);
    border-radius: 50%;
    background: var(--surface-raised);
    color: var(--ink);
  }

  .carousel__toggle :global(.carousel__icon--play),
  .carousel__toggle[aria-pressed='true'] :global(.carousel__icon--pause) {
    display: none;
  }

  .carousel__toggle[aria-pressed='true'] :global(.carousel__icon--play) {
    display: block;
  }

  .carousel__row--secondary {
    display: none;
  }

  .carousel[data-paused] .lt-reel__track {
    animation-play-state: paused;
  }

  .carousel.is-gsap .lt-reel__track {
    animation: none;
  }

  .carousel :global(.carousel__img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .carousel__legend {
    margin-top: var(--space-4);
    text-align: center;
  }

  /* Mobile e tablet: 1 fileira, sem animação, deslize com snap ("Deslize e veja mais resultados"). */
  @media (max-width: 1023.98px) {
    .carousel__row {
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      mask-image: none;
      -webkit-mask-image: none;
    }

    .carousel__track {
      padding-inline: var(--gutter);
      animation: none;
    }

    .carousel__track [data-copy] {
      display: none;
    }

    .carousel__track .lt-shot {
      width: min(64vw, 260px);
      scroll-snap-align: start;
    }
  }

  @media (min-width: 1024px) {
    .carousel__toggle {
      display: grid;
    }

    .carousel__row--secondary {
      display: block;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .carousel__toggle {
      display: none;
    }
  }
</style>

<script>
  for (const root of document.querySelectorAll<HTMLElement>('[data-reel]')) {
    const toggle = root.querySelector<HTMLButtonElement>('[data-reel-toggle]');
    toggle?.addEventListener('click', () => {
      const paused = toggle.getAttribute('aria-pressed') !== 'true';
      toggle.setAttribute('aria-pressed', String(paused));
      root.toggleAttribute('data-paused', paused);
    });
  }
</script>
```

- [ ] **Step 5: Montar o carrossel dentro da seção — em `src/components/Results.astro`**

Acrescente `import ResultsCarousel from './ResultsCarousel.astro';` aos imports e troque o fechamento da seção:

```astro
    </div>
  </div>
</section>
```

por:

```astro
    </div>
  </div>
  <ResultsCarousel />
</section>
```

- [ ] **Step 6: Build, testes de dist e conferência visual**

Run: `npm run build && npm run test:dist && node scripts/with-preview.mjs bash scripts/shot.sh ".carousel" 375 1440`
Expected: PASS; em 1440 duas fileiras de cards 3:4 com bordas esmaecidas (máscara) e o botão de pausa à direita do fecho; em 375 uma fileira que desliza (o próximo card aparece cortado), sem botão de pausa.

- [ ] **Step 7: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add src/lib/carousel.ts src/lib/carousel.test.ts src/components/ResultsCarousel.astro src/components/Results.astro tests/dist/carousel.test.ts
git commit -m "$(cat <<'EOF'
feat: carrossel infinito de resultados com pausa e deslize no mobile

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 18: O Método (seção noite) com vídeo de fundo opcional — TDD do resolvedor de vídeo

**Files:**
- Create: `src/lib/public-media.ts`, `src/lib/public-media.test.ts`, `src/scripts/lazy-video.ts`, `src/components/BackgroundVideo.astro`, `src/components/MethodSteps.astro`, `tests/dist/method.test.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `site.method`, `whatsappLink('general')`, `SectionHeading`, `Button`, `Icon`; arquivos opcionais da mídia `public/media/<nome>.webm|.mp4` e `<nome>-poster.jpg`.
- Produces:
  - `interface VideoSource { src: string; type: 'video/webm' | 'video/mp4' }`, `interface ResolvedVideo { sources: VideoSource[]; poster: string | undefined }`, `resolveVideo(name: string, root?: string): ResolvedVideo`
  - `<BackgroundVideo name />` — `<video muted loop playsinline preload="none" data-lazy-video data-poster>` com `<source data-src>`; não renderiza nada sem vídeo nem poster. Reutilizado pelo CTA final (Task 24).
  - `src/scripts/lazy-video.ts` — carrega e toca perto da viewport; com movimento reduzido só aplica o poster.
  - `<MethodSteps />` — `section#metodo[data-theme="noite"]`.

- [ ] **Step 1: Escrever o teste que falha — `src/lib/public-media.test.ts`**

```ts
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { resolveVideo } from './public-media';

const roots: string[] = [];

function projectWith(files: string[]): string {
  const root = mkdtempSync(join(tmpdir(), 'lt-media-'));
  roots.push(root);
  mkdirSync(join(root, 'public', 'media'), { recursive: true });
  for (const file of files) writeFileSync(join(root, 'public', 'media', file), '');
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('resolveVideo', () => {
  it('lista WebM antes de MP4 e acha o poster', () => {
    const root = projectWith(['metodo.mp4', 'metodo.webm', 'metodo-poster.jpg']);
    expect(resolveVideo('metodo', root)).toEqual({
      sources: [
        { src: '/media/metodo.webm', type: 'video/webm' },
        { src: '/media/metodo.mp4', type: 'video/mp4' },
      ],
      poster: '/media/metodo-poster.jpg',
    });
  });

  it('funciona só com MP4', () => {
    expect(resolveVideo('metodo', projectWith(['metodo.mp4']))).toEqual({
      sources: [{ src: '/media/metodo.mp4', type: 'video/mp4' }],
      poster: undefined,
    });
  });

  it('só o poster ainda vira fundo estático', () => {
    expect(resolveVideo('cta-final', projectWith(['cta-final-poster.jpg']))).toEqual({
      sources: [],
      poster: '/media/cta-final-poster.jpg',
    });
  });

  it('sem arquivos (ou sem a pasta public/media) devolve vazio', () => {
    expect(resolveVideo('cta-final', projectWith([]))).toEqual({ sources: [], poster: undefined });
    const empty = mkdtempSync(join(tmpdir(), 'lt-media-'));
    roots.push(empty);
    expect(resolveVideo('metodo', empty)).toEqual({ sources: [], poster: undefined });
  });

  it('recusa nomes com caminho', () => {
    expect(() => resolveVideo('../segredo', projectWith([]))).toThrow(/inválido/);
  });
});
```

Run: `npm test -- src/lib/public-media.test.ts`
Expected: FAIL com `Failed to resolve import "./public-media"`.

- [ ] **Step 2: Implementar `src/lib/public-media.ts`**

```ts
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export interface VideoSource {
  src: string;
  type: 'video/webm' | 'video/mp4';
}

export interface ResolvedVideo {
  sources: VideoSource[];
  poster: string | undefined;
}

/** Procura public/media/<nome>.webm|.mp4 e <nome>-poster.jpg (entregues pela frente de mídia). */
export function resolveVideo(name: string, root: string = process.cwd()): ResolvedVideo {
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error(`Nome de vídeo inválido: "${name}".`);
  const dir = join(root, 'public', 'media');
  const has = (file: string) => existsSync(join(dir, file));
  const sources: VideoSource[] = [];
  if (has(`${name}.webm`)) sources.push({ src: `/media/${name}.webm`, type: 'video/webm' });
  if (has(`${name}.mp4`)) sources.push({ src: `/media/${name}.mp4`, type: 'video/mp4' });
  return { sources, poster: has(`${name}-poster.jpg`) ? `/media/${name}-poster.jpg` : undefined };
}
```

Run: `npm test -- src/lib/public-media.test.ts`
Expected: PASS — `Tests  5 passed`.

- [ ] **Step 3: Criar `src/scripts/lazy-video.ts`**

```ts
// Vídeos de fundo: carregam e tocam só perto da viewport; com movimento reduzido mostram apenas o poster.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const videos = document.querySelectorAll<HTMLVideoElement>('video[data-lazy-video]');

function load(video: HTMLVideoElement): void {
  if (video.dataset.loaded === 'true') return;
  video.dataset.loaded = 'true';
  if (video.dataset.poster) video.poster = video.dataset.poster;
  if (reduceMotion.matches) return;
  video.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((source) => {
    source.src = source.dataset.src ?? '';
  });
  video.load();
}

if (videos.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          load(video);
          if (!reduceMotion.matches) void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      }
    },
    { rootMargin: '300px 0px' },
  );
  videos.forEach((video) => observer.observe(video));
}
```

- [ ] **Step 4: Criar `src/components/BackgroundVideo.astro`**

```astro
---
import { resolveVideo } from '../lib/public-media';

interface Props {
  /** Nome-base em public/media (ex.: "metodo" → metodo.webm, metodo.mp4, metodo-poster.jpg). */
  name: string;
}

const video = resolveVideo(Astro.props.name);
const hasMedia = video.sources.length > 0 || video.poster !== undefined;
---

{
  hasMedia && (
    <div class="bg-video" aria-hidden="true">
      <video
        class="bg-video__media"
        muted
        loop
        playsinline
        preload="none"
        data-lazy-video
        data-poster={video.poster}
      >
        {video.sources.map((source) => (
          <source data-src={source.src} type={source.type} />
        ))}
      </video>
    </div>
  )
}

<style>
  .bg-video {
    position: absolute;
    inset: 0;
    z-index: -2;
    overflow: hidden;
  }

  .bg-video__media {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>

<script>
  import '../scripts/lazy-video';
</script>
```

- [ ] **Step 5: Escrever o teste de dist que falha — `tests/dist/method.test.ts`**

```ts
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadPage, textOf } from './load';

describe('o método', () => {
  it('é uma seção noite com eyebrow, título e lead do copy', () => {
    const { document } = loadPage();
    const section = document.querySelector('section#metodo');
    expect(section?.getAttribute('data-theme')).toBe('noite');
    expect(textOf(section?.querySelector('.lt-eyebrow'))).toBe('COMO FUNCIONA');
    expect(textOf(section?.querySelector('h2'))).toBe('Um método para rejuvenescer sem exageros.');
    expect(textOf(section?.querySelector('h2 em'))).toBe('sem exageros.');
    expect(textOf(section?.querySelector('.heading__lead'))).toContain('Protocolo Identidade LT');
  });

  it('tem os 4 passos na ordem do copy', () => {
    const { document } = loadPage();
    expect(Array.from(document.querySelectorAll('#metodo .method__step h3'), (node) => textOf(node))).toEqual([
      'Escuta',
      'Análise facial',
      'Plano individual',
      'Acompanhamento',
    ]);
  });

  it('tem o CTA "Quero começar pela avaliação" com a mensagem geral', () => {
    const { document } = loadPage();
    const cta = document.querySelector('#metodo a[data-wa-origin="method"]');
    expect(textOf(cta)).toBe('Quero começar pela avaliação');
    expect(new URL(cta?.getAttribute('href') ?? '').searchParams.get('text')).toBe(
      'Olá! Vim pelo site e gostaria de agendar uma avaliação com a Dra. Laura.',
    );
  });

  it('vídeo de fundo (se houver): decorativo, mudo, sem autoplay e sem src até chegar perto da tela', () => {
    const { document } = loadPage();
    const video = document.querySelector('#metodo video[data-lazy-video]');
    const delivered = ['metodo.webm', 'metodo.mp4', 'metodo-poster.jpg'].some((file) =>
      existsSync(`public/media/${file}`),
    );
    expect(video !== null).toBe(delivered);
    if (!video) return;
    expect(video.hasAttribute('muted')).toBe(true);
    expect(video.hasAttribute('playsinline')).toBe(true);
    expect(video.getAttribute('preload')).toBe('none');
    expect(video.hasAttribute('autoplay')).toBe(false);
    expect(video.querySelectorAll('source[src]')).toHaveLength(0);
    expect(video.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});
```

Run: `npm run build && npm run test:dist`
Expected: FAIL nos testes de `method.test.ts`.

- [ ] **Step 6: Criar `src/components/MethodSteps.astro`**

```astro
---
import BackgroundVideo from './BackgroundVideo.astro';
import Button from './Button.astro';
import Icon from './icons/Icon.astro';
import SectionHeading from './SectionHeading.astro';
import { site } from '../content/site';
import { whatsappLink } from '../lib/whatsapp';

const { method } = site;
---

<section id="metodo" class="section method" data-theme="noite" aria-labelledby="method-title">
  <BackgroundVideo name="metodo" />
  <div class="method__veil" aria-hidden="true"></div>
  <div class="container">
    <SectionHeading
      id="method-title"
      eyebrow={method.eyebrow}
      title={method.title}
      lead={method.lead}
      align="center"
    />
    <ol class="method__steps" role="list">
      {
        method.steps.map((step, index) => (
          <li class="method__step" data-reveal>
            <span class="lt-icon">
              <Icon name={step.icon} size={26} />
            </span>
            <span class="method__index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 class="lt-title is-h3">{step.title}</h3>
            <p class="lt-body">{step.text}</p>
          </li>
        ))
      }
    </ol>
    <div class="method__cta">
      <Button href={whatsappLink('general')} data-wa-origin="method">{method.cta}</Button>
    </div>
  </div>
</section>

<style>
  .method {
    overflow: hidden;
    isolation: isolate;
  }

  /* Véu espresso sobre o vídeo: garante contraste AA do texto claro */
  .method__veil {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(180deg, rgb(28 21 19 / 0.84), rgb(28 21 19 / 0.94));
  }

  .method__steps {
    display: grid;
    gap: var(--space-6);
  }

  .method__step {
    display: grid;
    justify-items: start;
    align-content: start;
    gap: var(--space-3);
    padding: var(--space-8) var(--space-6);
    border: 1px solid var(--hairline);
    border-radius: var(--radius-md);
    background: rgb(37 28 25 / 0.72);
  }

  .method__index {
    margin-top: var(--space-3);
    color: var(--gold-ink);
    font: 500 13px/1 var(--font-sans);
    letter-spacing: 0.22em;
  }

  .method__cta {
    display: flex;
    justify-content: center;
    margin-top: var(--space-12);
  }

  @media (min-width: 768px) {
    .method__steps {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .method__steps {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
</style>
```

- [ ] **Step 7: Em `src/pages/index.astro`, importar e montar depois de Resultados**

Acrescente `import MethodSteps from '../components/MethodSteps.astro';` aos imports e troque `  <Results />` por:

```astro
  <Results />
  <MethodSteps />
```

- [ ] **Step 8: Build, testes de dist e conferência visual**

Run: `npm run build && npm run test:dist && node scripts/with-preview.mjs bash scripts/shot.sh "#metodo" 375 1280`
Expected: PASS; seção escura (#1C1513) com eyebrow em `gold-ink` noite, título claro com itálico rosado (#E2AEB2), 4 cartões com ícone dourado e índice `01…04`, botão rosado com texto escuro. Sem vídeo ainda: fundo noite liso.

- [ ] **Step 9: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add src/lib/public-media.ts src/lib/public-media.test.ts src/scripts/lazy-video.ts src/components/BackgroundVideo.astro src/components/MethodSteps.astro tests/dist/method.test.ts src/pages/index.astro
git commit -m "$(cat <<'EOF'
feat: seção O Método em tema noite com vídeo de fundo opcional e carregamento tardio

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 19: Fechamento da Etapa 3 — executada pelo orquestrador

> **Executada pelo ORQUESTRADOR.** Ele acrescenta ao corpo do PR e à mensagem do commit de squash as linhas de atribuição exigidas pela sessão dele.

- [ ] **Step 1: Gate completo na branch**

Run: `npm run check && npm run lighthouse`
Expected: tudo verde e `Resultado: **aprovado**`. Commite `docs/qa/lighthouse.md` se mudou (`docs: resumo do Lighthouse da Etapa 3`, com a linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).

- [ ] **Step 2: Push e PR**

```bash
git push -u origin feat/resultados-metodo
mkdir -p .e2e-tmp
cat > .e2e-tmp/pr-body.md <<'EOF'
## Resumo
- Resultados por queixa: 4 blocos alternados com slider antes/depois (arraste, toque e teclado), legenda de compliance e CTA com a área na mensagem do WhatsApp.
- Carrossel infinito de resultados: 2 fileiras no desktop com botão de pausa; 1 fileira com deslize no mobile.
- O Método em tema noite com 4 passos e vídeo de fundo opcional (`public/media/metodo.*`), carregado só perto da viewport e substituído pelo poster com movimento reduzido.

## Checklist de validação
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`
- [x] `npm run test:dist`
- [x] `npm run lighthouse` — mobile ≥ 90 nas 4 categorias (`docs/qa/lighthouse.md`)
- [x] Slider conferido por teclado no agent-browser (setas, Home)
- [x] Revisões por subagente (especificação + qualidade) aprovadas nas Tasks 16–18

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
gh pr create --base main --head feat/resultados-metodo --title "feat: resultados por queixa, carrossel e O Método" --body-file .e2e-tmp/pr-body.md
```

- [ ] **Step 3: Merge squash e volta para a main**

```bash
gh pr merge feat/resultados-metodo --squash --delete-branch --subject "feat: resultados por queixa, carrossel e O Método"
git checkout main && git pull --ff-only
```

- [ ] **Step 4: Atualizar `docs/HANDOFF.md`**

Em `## Estado`, troque a linha `- Etapas 3–7: pendentes.` por:

```markdown
- **Etapa 3 — resultados e método (`feat/resultados-metodo`): concluída e mergeada na `main`.** BenefitResult × 4 com slider antes/depois (pointer events + range por teclado; eventos `ba:set`/`ba:interact`), carrossel infinito (CSS por enquanto) e O Método em tema noite com `BackgroundVideo` (lê `public/media/metodo.*` quando existir).
- Etapas 4–7: pendentes.
```

Em `## Decisões`, acrescente:

```markdown
- Slider: arraste tratado por pointer events na raiz (com `touch-action: pan-y` a página continua rolando no toque vertical); o `input range` fica invisível só para teclado e leitor de tela.
- Carrossel sem lightbox (fora da spec); fotos do carrossel sem legenda individual (o contrato de mídia não traz legendas) — alt genérico do copy adaptado.
```

Em `## Próximo passo`, troque o item por `- Etapa 4 — \`feat/sobre-ao-rodape\`: Task 20 do plano.` e então:

```bash
git add docs/HANDOFF.md
git commit -m "$(cat <<'EOF'
docs: atualiza HANDOFF após a Etapa 3

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

## Etapa 4 — `feat/sobre-ao-rodape`

> Antes da Task 20: `git checkout main && git pull --ff-only && git checkout -b feat/sobre-ao-rodape`.

### Task 20: Sobre a Dra. Laura — foto fixa (sticky), citação, StatBlock, assinatura e credenciais (TDD)

**Files:**
- Create: `src/lib/credentials.ts`, `src/lib/credentials.test.ts`, `src/components/StatBlock.astro`, `src/components/About.astro`, `tests/dist/about.test.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `site.about`, `site.responsibleTechnician`, `media.get('dra/sobre')`, `altText`, `whatsappLink`, `SectionHeading`, `Button`.
- Produces:
  - `credentialsLine(profession: string | null, registration: string | null): string | null` (só com os dois dados)
  - `technicianLine(label: string, name: string, profession: string | null, registration: string | null): string` (usada no rodapé, Task 24)
  - `<StatBlock stats />` — cada número em `span.lt-stat__num[data-count-to][data-count-prefix][data-count-suffix]` (contador da Task 29), com texto completo em `.sr-only`
  - `<About />` — `section#dra-laura`; foto `.about__photo` com `position: sticky` no desktop (o "pin" do Movimento.md, sem `.pin-spacer`); assinatura `p.lt-signature[data-signature]`.

- [ ] **Step 1: Escrever o teste que falha — `src/lib/credentials.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { credentialsLine, technicianLine } from './credentials';

describe('credentialsLine', () => {
  it('só monta a linha quando profissão e registro existem', () => {
    expect(credentialsLine(null, null)).toBeNull();
    expect(credentialsLine('Profissão', null)).toBeNull();
    expect(credentialsLine('  ', 'Registro 0000')).toBeNull();
    expect(credentialsLine(' Profissão ', 'Registro 0000')).toBe('Profissão · Registro 0000');
  });
});

describe('technicianLine', () => {
  it('com registro pendente mostra só o nome', () => {
    expect(technicianLine('Responsável técnica', 'Dra. Laura Tavares', null, null)).toBe(
      'Responsável técnica: Dra. Laura Tavares',
    );
  });

  it('com os dados completos acrescenta profissão e registro', () => {
    expect(technicianLine('Responsável técnica', 'Dra. Laura Tavares', 'Profissão', 'Registro 0000')).toBe(
      'Responsável técnica: Dra. Laura Tavares · Profissão · Registro 0000',
    );
  });
});
```

Run: `npm test -- src/lib/credentials.test.ts`
Expected: FAIL com `Failed to resolve import "./credentials"`.

- [ ] **Step 2: Implementar `src/lib/credentials.ts`**

```ts
/** "Profissão · Conselho e nº" — só quando os dois dados existem (compliance: tudo ou nada). */
export function credentialsLine(profession: string | null, registration: string | null): string | null {
  const job = profession?.trim();
  const council = registration?.trim();
  return job && council ? `${job} · ${council}` : null;
}

/** Linha do rodapé: "Responsável técnica: <nome>" + " · <profissão> · <registro>" quando houver. */
export function technicianLine(
  label: string,
  name: string,
  profession: string | null,
  registration: string | null,
): string {
  const credentials = credentialsLine(profession, registration);
  return credentials ? `${label}: ${name} · ${credentials}` : `${label}: ${name}`;
}
```

Run: `npm test -- src/lib/credentials.test.ts`
Expected: PASS — `Tests  3 passed`.

- [ ] **Step 3: Escrever o teste de dist que falha — `tests/dist/about.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { site } from '../../src/content/site';
import { loadPage, textOf } from './load';

describe('sobre a Dra. Laura', () => {
  it('tem eyebrow, título com itálico e os parágrafos do copy', () => {
    const { document } = loadPage();
    const section = document.querySelector('section#dra-laura');
    expect(textOf(section?.querySelector('.lt-eyebrow'))).toBe('QUEM CUIDA DE VOCÊ');
    expect(textOf(section?.querySelector('h2'))).toBe('Prazer, Laura Tavares.');
    expect(textOf(section?.querySelector('h2 em'))).toBe('Laura Tavares.');
    const paragraphs = Array.from(section?.querySelectorAll('.about__text p') ?? [], (node) => textOf(node));
    expect(paragraphs.slice(0, 2)).toEqual(site.about.paragraphs);
  });

  it('tem a citação da Revista Orla BSB', () => {
    const { document } = loadPage();
    expect(textOf(document.querySelector('#dra-laura blockquote'))).toBe(
      '“Meu compromisso é entregar segurança, planejamento e resultados que respeitem a individualidade.”',
    );
    expect(textOf(document.querySelector('#dra-laura .about__quote figcaption'))).toBe('Revista Orla BSB');
  });

  it('tem os 4 números com texto completo para leitor de tela e contadores marcados', () => {
    const { document } = loadPage();
    expect(Array.from(document.querySelectorAll('#dra-laura .stats__item .sr-only'), (node) => textOf(node))).toEqual([
      '+25 mil atendimentos',
      '9 anos de experiência',
      '8 anos de clínica no Sudoeste',
      'AMWC Coreia 2026',
    ]);
    const counters = Array.from(document.querySelectorAll('#dra-laura [data-count-to]'), (node) => [
      node.getAttribute('data-count-to'),
      node.getAttribute('data-count-prefix'),
      node.getAttribute('data-count-suffix'),
      textOf(node),
    ]);
    expect(counters).toEqual([
      ['25', '+', ' mil', '+25 mil'],
      ['9', null, ' anos', '9 anos'],
      ['8', null, ' anos', '8 anos'],
    ]);
  });

  it('assina "Laura Tavares" em Pinyon Script, uma única vez na página', () => {
    const { document } = loadPage();
    const signatures = document.querySelectorAll('.lt-signature');
    expect(signatures).toHaveLength(1);
    expect(textOf(signatures[0])).toBe('Laura Tavares');
    expect(signatures[0]?.hasAttribute('data-signature')).toBe(true);
  });

  it('mostra credenciais só quando profissão e registro existem', () => {
    const { document } = loadPage();
    const { profession, registration } = site.responsibleTechnician;
    const credentials = document.querySelector('#dra-laura .about__credentials');
    if (profession && registration) expect(textOf(credentials)).toBe(`${profession} · ${registration}`);
    else expect(credentials).toBeNull();
  });

  it('tem o CTA "Agendar avaliação com a Dra. Laura" e a foto dra/sobre em arco', () => {
    const { document } = loadPage();
    const cta = document.querySelector('#dra-laura a[data-wa-origin="about"]');
    expect(textOf(cta)).toBe('Agendar avaliação com a Dra. Laura');
    expect(document.querySelector('#dra-laura .lt-arch img[data-slot="dra/sobre"]')).not.toBeNull();
  });
});
```

Run: `npm run build && npm run test:dist`
Expected: FAIL nos testes de `about.test.ts`.

- [ ] **Step 4: Criar `src/components/StatBlock.astro`**

```astro
---
import type { Site } from '../content/site';

interface Props {
  stats: Site['about']['stats'];
}

const { stats } = Astro.props;
---

<ul class="stats" role="list">
  {
    stats.map((stat) => (
      <li class="stats__item">
        <span class="sr-only">{`${stat.value} ${stat.label}`}</span>
        <span class="stats__visual" aria-hidden="true">
          <span
            class="lt-stat__num stats__num"
            data-count-to={stat.countTo}
            data-count-prefix={stat.prefix}
            data-count-suffix={stat.suffix}
          >
            {stat.value}
          </span>
          <span class="lt-stat__label">{stat.label}</span>
        </span>
      </li>
    ))
  }
</ul>

<style>
  .stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-8) var(--space-6);
  }

  .stats__item {
    padding-top: var(--space-4);
    border-top: 1px solid var(--hairline);
  }

  .stats__visual {
    display: grid;
  }

  .stats__num {
    font-size: clamp(2.5rem, 2rem + 1.6vw, 3.5rem);
  }
</style>
```

- [ ] **Step 5: Criar `src/components/About.astro`**

```astro
---
import { Picture } from 'astro:assets';
import Button from './Button.astro';
import SectionHeading from './SectionHeading.astro';
import StatBlock from './StatBlock.astro';
import { altText, media } from '../content/media';
import { site } from '../content/site';
import { credentialsLine } from '../lib/credentials';
import { whatsappLink } from '../lib/whatsapp';

const { about, responsibleTechnician } = site;
const photo = media.get('dra/sobre');
const credentials = credentialsLine(
  responsibleTechnician.profession,
  responsibleTechnician.registration,
);
---

<section id="dra-laura" class="section about" aria-labelledby="about-title">
  <div class="container about__grid">
    <div class="about__media">
      <div class="about__photo">
        <div class="lt-arch about__arch" data-arch-reveal>
          <Picture
            src={photo.image}
            alt={altText(photo, about.imageAlt)}
            widths={[480, 720, 960, 1200]}
            sizes="(min-width: 1024px) 460px, 88vw"
            formats={['avif', 'webp']}
            class="about__img"
            style={`object-position: ${photo.position}`}
            data-slot={photo.slot}
            data-placeholder={photo.isPlaceholder ? '' : undefined}
          />
        </div>
      </div>
    </div>
    <div class="about__content">
      <SectionHeading id="about-title" eyebrow={about.eyebrow} title={about.title} />
      <div class="about__text">
        {about.paragraphs.map((paragraph) => <p class="lt-body">{paragraph}</p>)}
        {about.education && <p class="lt-body">{about.education}</p>}
      </div>
      <figure class="about__quote" data-reveal>
        <blockquote>
          <p>“{about.quote.text}”</p>
        </blockquote>
        <figcaption class="lt-caption">{about.quote.source}</figcaption>
      </figure>
      <StatBlock stats={about.stats} />
      <p class="lt-signature about__signature" data-signature>{about.signature}</p>
      {credentials && <p class="lt-caption about__credentials">{credentials}</p>}
      <div class="about__cta">
        <Button href={whatsappLink('general')} data-wa-origin="about">{about.cta}</Button>
      </div>
    </div>
  </div>
</section>

<style>
  .about__grid {
    display: grid;
    gap: var(--space-12);
  }

  .about__arch {
    max-width: 460px;
    aspect-ratio: 4 / 5;
    margin-inline: auto;
  }

  .about__arch :global(picture),
  .about__arch :global(img) {
    display: block;
    width: 100%;
    height: 100%;
  }

  .about__arch :global(img) {
    object-fit: cover;
  }

  .about__content :global(.heading) {
    margin-bottom: var(--space-8);
  }

  .about__text {
    display: grid;
    gap: var(--space-4);
    max-width: 560px;
  }

  .about__quote {
    margin: var(--space-12) 0;
    padding-left: var(--space-6);
    border-left: 1px solid var(--gold);
  }

  .about__quote blockquote {
    color: var(--ink);
    font: italic 400 clamp(1.5rem, 1.2rem + 1vw, 1.875rem) / 1.3 var(--font-serif);
  }

  .about__quote figcaption {
    margin-top: var(--space-3);
  }

  /* Folga para os floreios do Pinyon não serem cortados pela revelação (Task 27). */
  .about__signature {
    display: inline-block;
    margin-top: var(--space-12);
    padding: 0.1em 0.35em 0.1em 0;
  }

  .about__credentials {
    margin-top: var(--space-2);
  }

  .about__cta {
    margin-top: var(--space-8);
  }

  @media (min-width: 1024px) {
    .about__grid {
      grid-template-columns: repeat(12, minmax(0, 1fr));
      align-items: start;
      column-gap: var(--gutter);
    }

    /* A coluna estica até a altura do conteúdo para a foto ficar fixa enquanto o texto passa. */
    .about__media {
      grid-column: 1 / span 5;
      align-self: stretch;
    }

    .about__photo {
      position: sticky;
      top: calc(var(--nav-offset) + var(--space-4));
    }

    .about__content {
      grid-column: 7 / span 6;
    }
  }
</style>
```

- [ ] **Step 6: Em `src/pages/index.astro`, importar e montar depois do Método**

Acrescente `import About from '../components/About.astro';` aos imports e troque `  <MethodSteps />` por:

```astro
  <MethodSteps />
  <About />
```

- [ ] **Step 7: Build, testes de dist e conferência visual (inclusive o sticky)**

Run: `npm run build && npm run test:dist && node scripts/with-preview.mjs bash scripts/shot.sh ".stats" 1280 375`
Expected: PASS; em 1280 a foto em arco à esquerda permanece visível ao lado dos números (rolada até `.stats`), assinatura "Laura Tavares" em Pinyon dourado-escuro; em 375 foto acima do texto e números em 2 colunas sem estourar.

- [ ] **Step 8: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add src/lib/credentials.ts src/lib/credentials.test.ts src/components/StatBlock.astro src/components/About.astro tests/dist/about.test.ts src/pages/index.astro
git commit -m "$(cat <<'EOF'
feat: seção Sobre com foto fixa, citação, números e assinatura

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 21: Depoimentos a partir do `depoimentos.json` — TDD do carregador

**Files:**
- Create: `src/content/testimonials.ts`, `src/content/testimonials.test.ts`, `src/components/Testimonial.astro`, `src/components/Testimonials.astro`, `tests/dist/testimonials.test.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `src/content/depoimentos.json` (frente de mídia, opcional) — array de `{ "texto": string (≤ 30 palavras), "textoOriginal": string, "autor": string, "tratamento": string | null, "fonte": "google" | "instagram", "url": string | null, "estrelas": number 1–5 | null }`; `countWords` (Task 2); `site.testimonials`, `site.ui.starsLabel|sourceGoogle|sourceInstagram`; `whatsappLink`, `Button`, `SectionHeading`, `Icon`.
- Produces: `MAX_WORDS = 30`, `testimonialSchema`, `type Testimonial`, `parseTestimonials(raw: unknown): Testimonial[]`, `testimonials: Testimonial[]`; `<Testimonial item />`; `<Testimonials items? />` — `section#depoimentos` (rosado); `items` padrão = `testimonials`; não renderiza nada com zero depoimentos.

- [ ] **Step 1: Escrever o teste que falha — `src/content/testimonials.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { parseTestimonials } from './testimonials';

const valid = {
  texto: 'Fui muito bem recebida e a Dra. explicou cada etapa com calma.',
  textoOriginal: 'Fui muito bem recebida e a Dra. explicou cada etapa com calma. Recomendo!',
  autor: 'Ana P.',
  tratamento: 'Harmonização facial',
  fonte: 'google',
  url: 'https://maps.app.goo.gl/exemplo',
  estrelas: 5,
};

describe('parseTestimonials', () => {
  it('sem depoimentos.json devolve lista vazia (a seção não aparece)', () => {
    expect(parseTestimonials(undefined)).toEqual([]);
  });

  it('aceita depoimentos válidos, inclusive com tratamento, url e estrelas nulos', () => {
    const minimal = { ...valid, tratamento: null, url: null, estrelas: null, fonte: 'instagram' };
    expect(parseTestimonials([valid, minimal])).toEqual([valid, minimal]);
  });

  it('recusa texto com mais de 30 palavras', () => {
    const long = { ...valid, texto: Array(31).fill('palavra').join(' ') };
    expect(() => parseTestimonials([long])).toThrow(/depoimentos\.json inválido[\s\S]*30 palavras/);
  });

  it('recusa estrelas fora de 1–5, fonte desconhecida e URL javascript:', () => {
    expect(() => parseTestimonials([{ ...valid, estrelas: 0 }])).toThrow(/depoimentos\.json inválido/);
    expect(() => parseTestimonials([{ ...valid, fonte: 'facebook' }])).toThrow(/depoimentos\.json inválido/);
    expect(() => parseTestimonials([{ ...valid, url: 'javascript:alert(1)' }])).toThrow(
      /depoimentos\.json inválido/,
    );
  });

  it('recusa campos extras e campos faltando', () => {
    expect(() => parseTestimonials([{ ...valid, idade: 47 }])).toThrow(/depoimentos\.json inválido/);
    const withoutAuthor = Object.fromEntries(Object.entries(valid).filter(([key]) => key !== 'autor'));
    expect(() => parseTestimonials([withoutAuthor])).toThrow(/depoimentos\.json inválido/);
  });

  it('recusa formato que não é lista', () => {
    expect(() => parseTestimonials({ depoimentos: [] })).toThrow(/depoimentos\.json inválido/);
  });
});
```

Run: `npm test -- src/content/testimonials.test.ts`
Expected: FAIL com `Failed to resolve import "./testimonials"`.

- [ ] **Step 2: Implementar `src/content/testimonials.ts`**

```ts
import { z } from 'zod';
import { countWords } from '../lib/text';

export const MAX_WORDS = 30;

export const testimonialSchema = z.strictObject({
  texto: z
    .string()
    .min(1)
    .refine((value) => countWords(value) <= MAX_WORDS, {
      message: `texto com mais de ${MAX_WORDS} palavras`,
    }),
  textoOriginal: z.string().min(1),
  autor: z.string().min(2),
  tratamento: z.string().min(1).nullable(),
  fonte: z.enum(['google', 'instagram']),
  url: z.url({ protocol: /^https?$/ }).nullable(),
  estrelas: z.number().int().min(1).max(5).nullable(),
});

export type Testimonial = z.infer<typeof testimonialSchema>;

/** Valida src/content/depoimentos.json (frente de mídia). Ausente = lista vazia; inválido = erro de build. */
export function parseTestimonials(raw: unknown): Testimonial[] {
  if (raw === undefined) return [];
  const parsed = z.array(testimonialSchema).safeParse(raw);
  if (!parsed.success) {
    throw new Error(`src/content/depoimentos.json inválido:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}

const modules = import.meta.glob('/src/content/depoimentos.json', { eager: true, import: 'default' });

export const testimonials: Testimonial[] = parseTestimonials(Object.values(modules)[0]);
```

Run: `npm test -- src/content/testimonials.test.ts`
Expected: PASS — `Tests  6 passed`.

- [ ] **Step 3: Escrever o teste de dist — `tests/dist/testimonials.test.ts`**

```ts
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadPage, textOf } from './load';

const file = 'src/content/depoimentos.json';
const items: Array<{ texto: string; autor: string; estrelas: number | null }> = existsSync(file)
  ? JSON.parse(readFileSync(file, 'utf8'))
  : [];

describe('depoimentos', () => {
  it('a seção só existe quando há depoimentos reais', () => {
    const { document } = loadPage();
    expect(document.querySelector('section#depoimentos') !== null).toBe(items.length > 0);
  });

  it.runIf(items.length > 0)('mostra cada depoimento com autor, estrelas acessíveis e o CTA do copy', () => {
    const { document } = loadPage();
    const cards = Array.from(document.querySelectorAll('#depoimentos figure.testimonial'));
    expect(cards).toHaveLength(items.length);
    cards.forEach((card, index) => {
      const item = items[index];
      expect(textOf(card.querySelector('blockquote'))).toBe(`“${item?.texto}”`);
      expect(textOf(card.querySelector('.testimonial__author'))).toBe(item?.autor);
      if (item?.estrelas) {
        expect(textOf(card.querySelector('.testimonial__stars .sr-only'))).toBe(`${item.estrelas} de 5 estrelas`);
      }
    });
    const cta = document.querySelector('#depoimentos a[data-wa-origin="testimonials"]');
    expect(textOf(cta)).toBe('Quero ser a próxima história');
  });
});
```

Run: `npm run build && npm run test:dist`
Expected: sem `depoimentos.json`, o primeiro teste PASSA (seção ausente) e o segundo é pulado; com o arquivo, ambos FALHAM até o Step 6.

- [ ] **Step 4: Criar `src/components/Testimonial.astro`**

```astro
---
import Icon from './icons/Icon.astro';
import type { Testimonial as TestimonialData } from '../content/testimonials';
import { site } from '../content/site';

interface Props {
  item: TestimonialData;
}

const { item } = Astro.props;
const { ui } = site;
const source = item.fonte === 'google' ? ui.sourceGoogle : ui.sourceInstagram;
---

<figure class="lt-card testimonial" data-reveal>
  {
    item.estrelas !== null && (
      <p class="testimonial__stars">
        <span class="sr-only">{ui.starsLabel.replace('{n}', String(item.estrelas))}</span>
        {Array.from({ length: item.estrelas }, () => (
          <Icon name="star-fill" size={16} />
        ))}
      </p>
    )
  }
  <blockquote class="testimonial__quote">
    <p>“{item.texto}”</p>
  </blockquote>
  <figcaption class="testimonial__meta">
    <span class="testimonial__author">{item.autor}</span>
    {item.tratamento && <span class="lt-caption">{item.tratamento}</span>}
    <span class="lt-caption testimonial__source">
      {
        item.url ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {source}
          </a>
        ) : (
          source
        )
      }
    </span>
  </figcaption>
</figure>

<style>
  .testimonial {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    height: 100%;
    margin: 0;
  }

  .testimonial__stars {
    display: flex;
    gap: 4px;
    color: var(--gold);
  }

  .testimonial__quote {
    flex: 1;
    color: var(--ink);
    font: italic 400 24px / 1.35 var(--font-serif);
  }

  .testimonial__meta {
    display: grid;
    gap: 2px;
  }

  .testimonial__author {
    color: var(--ink);
    font: 500 14px / 1.3 var(--font-sans);
  }

  .testimonial__source a {
    color: var(--accent);
  }
</style>
```

- [ ] **Step 5: Criar `src/components/Testimonials.astro`**

```astro
---
import Button from './Button.astro';
import SectionHeading from './SectionHeading.astro';
import Testimonial from './Testimonial.astro';
import { site } from '../content/site';
import { testimonials, type Testimonial as TestimonialData } from '../content/testimonials';
import { whatsappLink } from '../lib/whatsapp';

interface Props {
  /** Padrão: depoimentos reais de src/content/depoimentos.json. */
  items?: TestimonialData[];
}

const { items = testimonials } = Astro.props;
const copy = site.testimonials;
const few = items.length < 3;
---

{
  items.length > 0 && (
    <section
      id="depoimentos"
      class="section section--blush testimonials"
      aria-labelledby="testimonials-title"
    >
      <div class="container">
        <SectionHeading id="testimonials-title" eyebrow={copy.eyebrow} title={copy.title} lead={copy.lead} />
        <div
          class:list={['testimonials__grid', { 'testimonials__grid--few': few }]}
          role="region"
          aria-labelledby="testimonials-title"
          tabindex="0"
        >
          {items.map((item) => (
            <Testimonial item={item} />
          ))}
        </div>
        <div class="testimonials__cta">
          <Button href={whatsappLink('general')} data-wa-origin="testimonials">
            {copy.cta}
          </Button>
        </div>
      </div>
    </section>
  )
}

<style>
  /* Mobile: carrossel com snap; desktop: 3 colunas; com 1–2 depoimentos, cards centralizados. */
  .testimonials__grid {
    display: grid;
    grid-auto-columns: min(85%, 360px);
    grid-auto-flow: column;
    gap: var(--space-4);
    margin-inline: calc(-1 * var(--gutter));
    padding: 0 var(--gutter) var(--space-4);
    overflow-x: auto;
    scroll-padding-inline: var(--gutter);
    scroll-snap-type: x mandatory;
  }

  .testimonials__grid > :global(*) {
    scroll-snap-align: start;
  }

  .testimonials__cta {
    display: flex;
    justify-content: center;
    margin-top: var(--space-12);
  }

  @media (min-width: 1024px) {
    .testimonials__grid {
      grid-auto-flow: row;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--space-6);
      margin-inline: 0;
      padding: 0;
      overflow: visible;
    }

    .testimonials__grid--few {
      grid-template-columns: repeat(auto-fit, minmax(280px, 420px));
      justify-content: center;
    }
  }
</style>
```

- [ ] **Step 6: Em `src/pages/index.astro`, importar e montar depois do Sobre**

Acrescente `import Testimonials from '../components/Testimonials.astro';` aos imports e troque `  <About />` por:

```astro
  <About />
  <Testimonials />
```

- [ ] **Step 7: Conferir a renderização com uma página temporária (sem tocar no `depoimentos.json`, que é da mídia)**

```bash
cat > src/pages/teste-depoimentos.astro <<'EOF'
---
// PÁGINA TEMPORÁRIA DA TASK 21 — apagar antes do commit.
import BaseLayout from '../layouts/BaseLayout.astro';
import Testimonials from '../components/Testimonials.astro';

const fixture = [
  {
    texto: 'Texto de teste local, não publicar.',
    textoOriginal: 'Texto de teste local, não publicar.',
    autor: 'Teste A.',
    tratamento: null,
    fonte: 'google' as const,
    url: null,
    estrelas: 5,
  },
];
---

<BaseLayout path="/teste-depoimentos">
  <Testimonials items={fixture} />
</BaseLayout>
EOF
npm run build && PAGE_PATH=/teste-depoimentos node scripts/with-preview.mjs bash scripts/shot.sh "#depoimentos" 375 1280
rm src/pages/teste-depoimentos.astro
npm run build && npm run test:dist
git status --short src
```

Expected: as capturas `.e2e-tmp/depoimentos-375.png` e `-1280.png` mostram um card branco centralizado (layout reduzido para menos de 3 depoimentos) com 5 estrelas douradas, citação em Cormorant itálico, "Teste A." e "Avaliação no Google", e o botão "Quero ser a próxima história". Depois de apagar a página, PASS nos testes de dist e `git status` não lista `teste-depoimentos.astro`.

- [ ] **Step 8: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add src/content/testimonials.ts src/content/testimonials.test.ts src/components/Testimonial.astro src/components/Testimonials.astro tests/dist/testimonials.test.ts src/pages/index.astro
git commit -m "$(cat <<'EOF'
feat: depoimentos reais validados do depoimentos.json, sem seção quando vazio

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 22: A clínica (ClinicGallery)

**Files:**
- Create: `src/components/ClinicGallery.astro`, `tests/dist/clinic.test.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `site.clinic`, `media.get('clinica/<slot>')`, `altText`, `SectionHeading`, `Icon`.
- Produces: `<ClinicGallery />` — `section#a-clinica`; molduras `.clinic__frame[data-parallax-inner="-8"]` (parallax leve da Task 27).

- [ ] **Step 1: Escrever o teste de dist que falha — `tests/dist/clinic.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { loadPage, textOf } from './load';

describe('a clínica', () => {
  it('tem eyebrow, título com itálico e texto do copy', () => {
    const { document } = loadPage();
    const section = document.querySelector('section#a-clinica');
    expect(textOf(section?.querySelector('.lt-eyebrow'))).toBe('A CLÍNICA');
    expect(textOf(section?.querySelector('h2'))).toBe('Um espaço pensado para você desacelerar.');
    expect(textOf(section?.querySelector('h2 em'))).toBe('você desacelerar.');
    expect(textOf(section?.querySelector('.clinic__text'))).toContain('No coração do Sudoeste');
  });

  it('tem os 4 destaques com ícone', () => {
    const { document } = loadPage();
    const items = Array.from(document.querySelectorAll('#a-clinica .clinic__highlights li'));
    expect(items.map((item) => textOf(item))).toEqual([
      'Equipe premiada em atendimento',
      'Tecnologia e produtos coreanos',
      'Ambiente reservado e acolhedor',
      'Segunda a sábado, com hora marcada',
    ]);
    for (const item of items) expect(item.querySelector('.lt-icon svg')).not.toBeNull();
  });

  it('tem a galeria com as 4 legendas do copy e as fotos do contrato', () => {
    const { document } = loadPage();
    expect(Array.from(document.querySelectorAll('#a-clinica figcaption'), (node) => textOf(node))).toEqual([
      'Recepção',
      'Sala de procedimentos',
      'Nossa equipe',
      'Detalhes que cuidam de você',
    ]);
    for (const slot of ['recepcao', 'sala', 'equipe', 'detalhes']) {
      expect(document.querySelector(`#a-clinica img[data-slot="clinica/${slot}"]`)).not.toBeNull();
    }
  });

  it('usa os alts do copy na recepção e na equipe quando as fotos são reais', () => {
    const { document } = loadPage();
    const expected: Record<string, string> = {
      recepcao: 'Recepção da Clínica Laura Tavares, Estética Avançada, no CLSW 303',
      equipe: 'Equipe da Clínica Laura Tavares em frente ao letreiro da clínica',
    };
    for (const [slot, alt] of Object.entries(expected)) {
      const img = document.querySelector(`#a-clinica img[data-slot="clinica/${slot}"]`);
      expect(img?.getAttribute('alt')).toBe(img?.hasAttribute('data-placeholder') ? '' : alt);
    }
  });
});
```

Run: `npm run build && npm run test:dist`
Expected: FAIL nos testes de `clinic.test.ts`.

- [ ] **Step 2: Criar `src/components/ClinicGallery.astro`**

```astro
---
import { Picture } from 'astro:assets';
import Icon from './icons/Icon.astro';
import SectionHeading from './SectionHeading.astro';
import { altText, media } from '../content/media';
import { site } from '../content/site';

const { clinic } = site;
---

<section id="a-clinica" class="section clinic" aria-labelledby="clinic-title">
  <div class="container clinic__grid">
    <div class="clinic__copy">
      <SectionHeading id="clinic-title" eyebrow={clinic.eyebrow} title={clinic.title} />
      <p class="lt-body clinic__text">{clinic.text}</p>
      <ul class="clinic__highlights" role="list">
        {
          clinic.highlights.map((item) => (
            <li>
              <span class="lt-icon">
                <Icon name={item.icon} size={24} />
              </span>
              <span>{item.label}</span>
            </li>
          ))
        }
      </ul>
    </div>
    <ul class="clinic__gallery" role="list">
      {
        clinic.gallery.map((item) => {
          const photo = media.get(`clinica/${item.slot}` as const);
          return (
            <li class="clinic__item" data-reveal>
              <figure>
                <div class="clinic__frame" data-parallax-inner="-8">
                  <Picture
                    src={photo.image}
                    alt={altText(photo, item.alt)}
                    widths={[400, 640, 880, 1200]}
                    sizes="(min-width: 1024px) 330px, 45vw"
                    formats={['avif', 'webp']}
                    class="clinic__img"
                    style={`object-position: ${photo.position}`}
                    data-slot={photo.slot}
                    data-placeholder={photo.isPlaceholder ? '' : undefined}
                  />
                </div>
                <figcaption class="lt-caption">{item.caption}</figcaption>
              </figure>
            </li>
          );
        })
      }
    </ul>
  </div>
</section>

<style>
  .clinic__grid {
    display: grid;
    gap: var(--space-12);
  }

  .clinic__text {
    max-width: 520px;
  }

  .clinic__highlights {
    display: grid;
    gap: var(--space-4);
    margin-top: var(--space-8);
  }

  .clinic__highlights li {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    color: var(--ink);
  }

  .clinic__gallery {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-4);
  }

  .clinic__item figure {
    margin: 0;
  }

  .clinic__frame {
    overflow: hidden;
    aspect-ratio: 4 / 5;
    border-radius: var(--radius-lg);
    background: var(--surface-rose);
  }

  .clinic__frame :global(picture),
  .clinic__frame :global(img) {
    display: block;
    width: 100%;
    height: 100%;
  }

  .clinic__frame :global(img) {
    object-fit: cover;
  }

  .clinic__item figcaption {
    margin-top: var(--space-2);
  }

  @media (min-width: 1024px) {
    .clinic__grid {
      grid-template-columns: 5fr 7fr;
      align-items: center;
      gap: var(--space-16);
    }

    .clinic__item:nth-child(even) {
      margin-top: var(--space-12);
    }
  }
</style>
```

- [ ] **Step 3: Em `src/pages/index.astro`, importar e montar depois dos Depoimentos**

Acrescente `import ClinicGallery from '../components/ClinicGallery.astro';` aos imports e troque `  <Testimonials />` por:

```astro
  <Testimonials />
  <ClinicGallery />
```

- [ ] **Step 4: Build, testes de dist e conferência visual**

Run: `npm run build && npm run test:dist && node scripts/with-preview.mjs bash scripts/shot.sh "#a-clinica" 375 1280`
Expected: PASS; texto à esquerda com 4 destaques (ícone dourado em círculo), galeria 2×2 à direita com as colunas pares deslocadas para baixo no desktop; no 375, galeria 2 colunas abaixo do texto.

- [ ] **Step 5: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add src/components/ClinicGallery.astro tests/dist/clinic.test.ts src/pages/index.astro
git commit -m "$(cat <<'EOF'
feat: seção A clínica com destaques e galeria

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 23: Dúvidas frequentes (FAQ) com CTA e JSON-LD `FAQPage`

**Files:**
- Create: `src/components/FAQ.astro`, `tests/dist/faq.test.ts`
- Modify: `src/pages/index.astro` (componente + JSON-LD)

**Interfaces:**
- Consumes: `site.faq`, `whatsappLink('faq')`, `buildFaqJsonLd` (Task 7), `SectionHeading`, `Button`.
- Produces: `<FAQ />` — `section#duvidas` (rosado) com 9 `details/summary` (fechados), CTA `data-wa-origin="faq"` logo abaixo; JSON-LD `FAQPage` no `<head>` da home.

- [ ] **Step 1: Escrever o teste de dist que falha — `tests/dist/faq.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { site } from '../../src/content/site';
import { loadPage, textOf } from './load';

describe('dúvidas frequentes', () => {
  it('tem eyebrow e título com itálico do copy', () => {
    const { document } = loadPage();
    const section = document.querySelector('section#duvidas');
    expect(section?.classList.contains('section--blush')).toBe(true);
    expect(textOf(section?.querySelector('.lt-eyebrow'))).toBe('DÚVIDAS');
    expect(textOf(section?.querySelector('h2'))).toBe('Tudo o que você quer saber antes de agendar.');
    expect(textOf(section?.querySelector('h2 em'))).toBe('antes de agendar.');
  });

  it('tem as 9 perguntas e respostas literais, fechadas por padrão', () => {
    const { document } = loadPage();
    const details = Array.from(document.querySelectorAll('#duvidas details'));
    expect(details).toHaveLength(9);
    expect(details.map((item) => textOf(item.querySelector('summary')))).toEqual(
      site.faq.items.map((item) => item.question),
    );
    expect(details.map((item) => textOf(item.querySelector('p')))).toEqual(
      site.faq.items.map((item) => item.answer),
    );
    for (const item of details) expect(item.hasAttribute('open')).toBe(false);
  });

  it('tem o CTA logo abaixo, com a mensagem do FAQ', () => {
    const { document } = loadPage();
    expect(textOf(document.querySelector('#duvidas .faq__cta p'))).toBe('Ainda com dúvida?');
    const cta = document.querySelector('#duvidas a[data-wa-origin="faq"]');
    expect(textOf(cta)).toBe('Fale com a nossa equipe no WhatsApp');
    expect(cta?.classList.contains('lt-btn--whatsapp')).toBe(true);
    expect(new URL(cta?.getAttribute('href') ?? '').searchParams.get('text')).toBe(
      'Olá! Tenho uma dúvida antes de agendar.',
    );
  });

  it('publica JSON-LD FAQPage com as 9 perguntas', () => {
    const { document } = loadPage();
    const blocks = Array.from(document.querySelectorAll('script[type="application/ld+json"]'), (script) =>
      JSON.parse(script.textContent ?? '{}'),
    );
    const faq = blocks.find((block) => block['@type'] === 'FAQPage');
    expect(faq?.mainEntity).toHaveLength(9);
    expect(faq?.mainEntity[0]?.name).toBe('Vou ficar com o rosto artificial?');
  });
});
```

Run: `npm run build && npm run test:dist`
Expected: FAIL nos testes de `faq.test.ts`.

- [ ] **Step 2: Criar `src/components/FAQ.astro`**

```astro
---
import Button from './Button.astro';
import SectionHeading from './SectionHeading.astro';
import { site } from '../content/site';
import { whatsappLink } from '../lib/whatsapp';

const { faq } = site;
---

<section id="duvidas" class="section section--blush faq" aria-labelledby="faq-title">
  <div class="container">
    <SectionHeading id="faq-title" eyebrow={faq.eyebrow} title={faq.title} align="center" />
    <div class="lt-faq faq__list">
      {
        faq.items.map((item) => (
          <details class="faq__item">
            <summary>{item.question}</summary>
            <p class="lt-body">{item.answer}</p>
          </details>
        ))
      }
    </div>
    <div class="faq__cta">
      <p class="lt-body">{faq.ctaLead}</p>
      <Button href={whatsappLink('faq')} variant="whatsapp" data-wa-origin="faq">{faq.cta}</Button>
    </div>
  </div>
</section>

<style>
  .faq__list {
    max-width: 820px;
    margin-inline: auto;
  }

  .faq__cta {
    display: grid;
    justify-items: center;
    gap: var(--space-4);
    margin-top: var(--space-12);
    text-align: center;
  }

  /* Abertura suave onde o navegador suporta interpolar até "auto" (progressivo; sem JS). */
  @supports (interpolate-size: allow-keywords) {
    .faq__list {
      interpolate-size: allow-keywords;
    }

    .faq__item::details-content {
      block-size: 0;
      overflow-y: clip;
      transition:
        block-size var(--dur-base) var(--ease-lux),
        content-visibility var(--dur-base) var(--ease-lux) allow-discrete;
    }

    .faq__item[open]::details-content {
      block-size: auto;
    }
  }
</style>
```

- [ ] **Step 3: Em `src/pages/index.astro`, montar o FAQ e o JSON-LD `FAQPage`**

Acrescente `import FAQ from '../components/FAQ.astro';` aos imports, troque a importação `import { buildBusinessJsonLd } from '../lib/seo';` por `import { buildBusinessJsonLd, buildFaqJsonLd } from '../lib/seo';`, troque o bloco `const jsonLd = [ … ];` por:

```ts
const jsonLd = [
  buildBusinessJsonLd(site, {
    url: new URL('/', Astro.site).href,
    image: new URL('/og.jpg', Astro.site).href,
  }),
  buildFaqJsonLd(site.faq.items),
];
```

e troque `  <ClinicGallery />` por:

```astro
  <ClinicGallery />
  <FAQ />
```

- [ ] **Step 4: Build, testes de dist e conferência visual**

Run: `npm run build && npm run test:dist && node scripts/with-preview.mjs bash scripts/shot.sh "#duvidas" 375 1280`
Expected: PASS; acordeão com perguntas em Cormorant 22px, "+" rosewood em círculo à direita, fios `hairline`, CTA verde do WhatsApp abaixo da lista.

- [ ] **Step 5: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add src/components/FAQ.astro tests/dist/faq.test.ts src/pages/index.astro
git commit -m "$(cat <<'EOF'
feat: dúvidas frequentes com CTA do WhatsApp e JSON-LD FAQPage

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 24: CTA final com cartão de endereço, rodapé e política de privacidade (TDD dos links de mapa)

**Files:**
- Create: `src/lib/maps.ts`, `src/lib/maps.test.ts`, `src/components/FinalCTA.astro`, `src/components/Footer.astro`, `src/pages/politica-de-privacidade.astro`, `tests/dist/closing.test.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `site.finalCta`, `site.business`, `site.whatsapp.display`, `site.footer`, `site.brand`, `site.responsibleTechnician`, `site.privacy`, `site.ui.backHome`, `technicianLine` (Task 20), `whatsappLink`, `BackgroundVideo` (Task 18), `RichTitle`, `Button`, `Icon`, `BaseLayout`.
- Produces: `mapLinks(query: string): { google: string; waze: string }`; `<FinalCTA />` (`section#agendar`, noite, vídeo opcional `cta-final`); `<Footer />` (noite); página `/politica-de-privacidade`.

> **Simplificação registrada:** a spec pede "mapa (imagem com link)". Por LGPD e performance, o CTA final mostra um cartão de endereço com os botões "Abrir no Google Maps" e "Abrir no Waze" — sem embed e sem imagem de mapa. Anote no HANDOFF ao fechar a etapa (Task 25).

- [ ] **Step 1: Escrever o teste que falha — `src/lib/maps.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { site } from '../content/site';
import { mapLinks } from './maps';

describe('mapLinks', () => {
  it('monta os links do Google Maps e do Waze com o endereço codificado', () => {
    const links = mapLinks(site.business.address.mapsQuery);
    const encoded =
      'Cl%C3%ADnica%20Laura%20Tavares%2C%20CLSW%20303%2C%20Bloco%20C%2C%20Edif%C3%ADcio%20Le%20Parc%2C%20Sudoeste%2C%20Bras%C3%ADlia%20-%20DF%2C%2070673-623';
    expect(links.google).toBe(`https://www.google.com/maps/search/?api=1&query=${encoded}`);
    expect(links.waze).toBe(`https://waze.com/ul?q=${encoded}&navigate=yes`);
  });

  it('recusa endereço vazio', () => {
    expect(() => mapLinks('   ')).toThrow(/endereço vazio/);
  });
});
```

Run: `npm test -- src/lib/maps.test.ts`
Expected: FAIL com `Failed to resolve import "./maps"`.

- [ ] **Step 2: Implementar `src/lib/maps.ts`**

```ts
/** Links "Abrir no Google Maps" e "Abrir no Waze" (sem embed: LGPD e performance). */
export function mapLinks(query: string): { google: string; waze: string } {
  const value = query.trim();
  if (!value) throw new Error('mapLinks: endereço vazio.');
  const encoded = encodeURIComponent(value);
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
    waze: `https://waze.com/ul?q=${encoded}&navigate=yes`,
  };
}
```

Run: `npm test -- src/lib/maps.test.ts`
Expected: PASS — `Tests  2 passed`.

- [ ] **Step 3: Escrever o teste de dist que falha — `tests/dist/closing.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { site } from '../../src/content/site';
import { loadPage, textOf } from './load';

const ORIGINS = new Set([
  'hero',
  'nav',
  'nav-menu',
  'floating',
  'treatment',
  'result',
  'method',
  'about',
  'testimonials',
  'faq',
  'final',
  'footer',
]);

describe('CTA final', () => {
  it('é uma seção noite com eyebrow, título com itálico, texto e botão do copy', () => {
    const { document } = loadPage();
    const section = document.querySelector('section#agendar');
    expect(section?.getAttribute('data-theme')).toBe('noite');
    expect(textOf(section?.querySelector('.lt-eyebrow'))).toBe('O PRIMEIRO PASSO');
    expect(textOf(section?.querySelector('h2'))).toBe(
      'O seu rosto tem uma história. Vamos cuidar dela juntas?',
    );
    expect(textOf(section?.querySelector('h2 em'))).toBe('Vamos cuidar dela juntas?');
    const cta = section?.querySelector('a[data-wa-origin="final"]');
    expect(textOf(cta)).toBe('Agendar pelo WhatsApp');
    expect(new URL(cta?.getAttribute('href') ?? '').searchParams.get('text')).toBe(
      'Olá! Vim pelo site e gostaria de agendar uma avaliação com a Dra. Laura.',
    );
    expect(textOf(section?.querySelector('.final__support'))).toBe(
      'Segunda a sábado · CLSW 303, Sudoeste · Brasília',
    );
  });

  it('tem o cartão de endereço com Google Maps e Waze, sem iframe nem imagem de mapa', () => {
    const { document } = loadPage();
    const card = document.querySelector('#agendar address');
    expect(textOf(card)).toContain(site.business.address.full);
    const links = Array.from(card?.querySelectorAll('a') ?? []);
    expect(links.map((link) => textOf(link))).toEqual(['Abrir no Google Maps', 'Abrir no Waze']);
    expect(links[0]?.getAttribute('href')).toMatch(/^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);
    expect(links[1]?.getAttribute('href')).toMatch(/^https:\/\/waze\.com\/ul\?q=/);
    expect(document.querySelector('iframe')).toBeNull();
  });
});

describe('rodapé', () => {
  it('tem as linhas do copy', () => {
    const { document } = loadPage();
    const footer = document.querySelector('footer.footer');
    expect(footer?.getAttribute('data-theme')).toBe('noite');
    expect(textOf(footer?.querySelector('.footer__legal'))).toBe('Clínica Laura Tavares — Estética Avançada');
    expect(textOf(footer)).toContain(
      'CLSW 303, Bloco C, sala 70, Edifício Le Parc, Sudoeste, Brasília – DF, 70673-623',
    );
    expect(textOf(footer?.querySelector('a[data-wa-origin="footer"]'))).toBe('(61) 98100-7522');
    const instagram = Array.from(footer?.querySelectorAll('a[href^="https://www.instagram.com/"]') ?? [], (link) =>
      textOf(link),
    );
    expect(instagram).toEqual(['@clinicalauratavaress', '@dra.lauratavares']);
  });

  it('mostra a responsável técnica sem registro enquanto ele estiver pendente', () => {
    const { document } = loadPage();
    const { profession, registration } = site.responsibleTechnician;
    const expected =
      profession && registration
        ? `Responsável técnica: Dra. Laura Tavares · ${profession} · ${registration}`
        : 'Responsável técnica: Dra. Laura Tavares';
    expect(textOf(document.querySelector('footer .footer__technician'))).toBe(expected);
  });

  it('tem © e o link da política de privacidade', () => {
    const { document } = loadPage();
    expect(textOf(document.querySelector('footer .footer__bottom'))).toBe(
      '© 2026 Clínica Laura Tavares · Política de privacidade',
    );
    expect(document.querySelector('footer a[href="/politica-de-privacidade"]')).not.toBeNull();
  });
});

describe('política de privacidade', () => {
  it('é uma página própria com h1, seções, SEO e caminho de volta', () => {
    const { document } = loadPage('politica-de-privacidade.html');
    expect(document.documentElement.getAttribute('lang')).toBe('pt-BR');
    expect(textOf(document.querySelector('h1'))).toBe('Política de privacidade');
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(document.title).toBe('Política de privacidade | Clínica Laura Tavares');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toMatch(
      /^https:\/\/[^/]+\/politica-de-privacidade$/,
    );
    expect(document.querySelectorAll('main section h2')).toHaveLength(site.privacy.sections.length);
    expect(document.querySelector('a[href="/"]')).not.toBeNull();
    expect(document.querySelector('footer.footer')).not.toBeNull();
  });
});

describe('página inicial inteira', () => {
  it('toda âncora interna aponta para um id existente', () => {
    const { document } = loadPage();
    for (const link of document.querySelectorAll('a[href^="#"]')) {
      const id = link.getAttribute('href')?.slice(1) ?? '';
      expect(document.getElementById(id), `#${id}`).not.toBeNull();
    }
  });

  it('todo link de WhatsApp tem origem conhecida e o número certo', () => {
    const { document } = loadPage();
    for (const link of document.querySelectorAll('a[href*="api.whatsapp.com"]')) {
      expect(ORIGINS.has(link.getAttribute('data-wa-origin') ?? ''), link.outerHTML.slice(0, 100)).toBe(true);
      expect(new URL(link.getAttribute('href') ?? '').searchParams.get('phone')).toBe('5561981007522');
    }
  });

  it('toda imagem tem alt, nenhum [colchete] do copy vazou e há um único h1', () => {
    const { document } = loadPage();
    for (const img of document.querySelectorAll('img')) expect(img.hasAttribute('alt')).toBe(true);
    expect(document.body.textContent ?? '').not.toMatch(/\[[^\]]*\]/);
    expect(document.querySelectorAll('h1')).toHaveLength(1);
  });

  it('segue a ordem de seções da spec', () => {
    const { document } = loadPage();
    const order = Array.from(document.querySelectorAll('main > section'), (section) => section.id).filter(
      (id) => id !== 'depoimentos',
    );
    expect(order).toEqual([
      'inicio',
      'na-midia',
      'tratamentos',
      'resultados',
      'metodo',
      'dra-laura',
      'a-clinica',
      'duvidas',
      'agendar',
    ]);
  });
});
```

Run: `npm run build && npm run test:dist`
Expected: FAIL em `closing.test.ts` (sem `#agendar`, sem rodapé, sem página de privacidade; âncoras `#agendar` inexistentes não quebram ainda, mas a ordem de seções falha).

- [ ] **Step 4: Criar `src/components/FinalCTA.astro`**

```astro
---
import BackgroundVideo from './BackgroundVideo.astro';
import Button from './Button.astro';
import Icon from './icons/Icon.astro';
import RichTitle from './RichTitle.astro';
import { site } from '../content/site';
import { mapLinks } from '../lib/maps';
import { whatsappLink } from '../lib/whatsapp';

const { finalCta, business } = site;
const maps = mapLinks(business.address.mapsQuery);
---

<section id="agendar" class="section final" data-theme="noite" aria-labelledby="final-title">
  <BackgroundVideo name="cta-final" />
  <div class="final__veil" aria-hidden="true"></div>
  <div class="container final__grid">
    <div class="final__copy">
      <p class="lt-eyebrow">{finalCta.eyebrow}</p>
      <RichTitle id="final-title" title={finalCta.title} />
      <p class="lt-lead">{finalCta.text}</p>
      <Button href={whatsappLink('general')} variant="whatsapp" data-wa-origin="final"
        >{finalCta.button}</Button
      >
      <p class="lt-caption final__support">{finalCta.support}</p>
    </div>
    <address class="lt-card final__card">
      <span class="lt-icon">
        <Icon name="map-pin" size={24} />
      </span>
      <p class="final__card-title">{business.legalName}</p>
      <p class="lt-body">{business.address.full}</p>
      <p class="lt-caption">{business.openingHours}</p>
      <div class="final__maps">
        <a
          class="lt-btn lt-btn--outline lt-btn--sm"
          href={maps.google}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="map" size={16} />
          <span>{finalCta.mapsLabel}</span>
        </a>
        <a
          class="lt-btn lt-btn--outline lt-btn--sm"
          href={maps.waze}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="navigation" size={16} />
          <span>{finalCta.wazeLabel}</span>
        </a>
      </div>
    </address>
  </div>
</section>

<style>
  .final {
    overflow: hidden;
    isolation: isolate;
  }

  .final__veil {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(180deg, rgb(28 21 19 / 0.8), rgb(28 21 19 / 0.94));
  }

  .final__grid {
    display: grid;
    align-items: center;
    gap: var(--space-12);
  }

  .final__copy {
    display: grid;
    justify-items: start;
    gap: var(--space-6);
    max-width: 640px;
  }

  .final__card {
    display: grid;
    justify-items: start;
    gap: var(--space-3);
    font-style: normal;
  }

  .final__card-title {
    color: var(--ink);
    font: 500 22px / 1.3 var(--font-serif);
  }

  .final__maps {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-top: var(--space-3);
  }

  @media (min-width: 1024px) {
    .final__grid {
      grid-template-columns: 7fr 5fr;
      gap: var(--space-16);
    }
  }
</style>
```

- [ ] **Step 5: Criar `src/components/Footer.astro`**

```astro
---
import { site } from '../content/site';
import { technicianLine } from '../lib/credentials';
import { whatsappLink } from '../lib/whatsapp';

const { business, whatsapp, footer, brand, responsibleTechnician: tech } = site;
const technician = technicianLine(footer.technicianLabel, tech.name, tech.profession, tech.registration);
---

<footer class="footer" data-theme="noite">
  <div class="container footer__grid">
    <div class="footer__brand">
      <p class="footer__name">{brand.wordmark}</p>
      <p class="lt-eyebrow">{brand.tagline}</p>
    </div>
    <div class="footer__info">
      <p class="footer__legal">{business.legalName}</p>
      <p>{business.address.full}</p>
      <ul class="footer__contacts" role="list">
        <li>
          {footer.whatsappLabel}
          <a
            href={whatsappLink('general')}
            target="_blank"
            rel="noopener noreferrer"
            data-wa-origin="footer">{whatsapp.display}</a
          >
        </li>
        {
          business.instagram.map((profile, index) => (
            <li>
              {index === 0 && `${footer.instagramLabel} `}
              <a href={profile.url} target="_blank" rel="noopener noreferrer">
                {profile.handle}
              </a>
            </li>
          ))
        }
      </ul>
      <p class="footer__technician">{technician}</p>
    </div>
  </div>
  <div class="container">
    <p class="footer__bottom">
      {footer.copyright} · <a href="/politica-de-privacidade">{footer.privacyLabel}</a>
    </p>
  </div>
</footer>

<style>
  .footer {
    padding-block: var(--space-16) var(--space-8);
    border-top: 1px solid var(--hairline);
    background: var(--surface);
    color: var(--ink-muted);
  }

  .footer__grid {
    display: grid;
    gap: var(--space-8);
  }

  .footer__name {
    color: var(--ink);
    font: 500 28px / 1 var(--font-serif);
  }

  .footer__info {
    display: grid;
    gap: var(--space-2);
    font: 400 14px / 22px var(--font-sans);
    overflow-wrap: anywhere;
  }

  .footer__legal {
    color: var(--ink);
    font-weight: 500;
  }

  .footer__contacts {
    display: flex;
    flex-wrap: wrap;
  }

  .footer__contacts li + li::before {
    content: '·';
    margin-inline: 0.5em;
    color: var(--gold);
  }

  .footer a {
    color: var(--ink);
    text-decoration-color: var(--accent);
  }

  .footer a:hover {
    color: var(--accent);
  }

  .footer__bottom {
    margin-top: var(--space-12);
    padding-top: var(--space-6);
    border-top: 1px solid var(--hairline);
    font: 400 13px / 20px var(--font-sans);
  }

  @media (min-width: 1024px) {
    .footer__grid {
      grid-template-columns: 4fr 8fr;
    }
  }
</style>
```

- [ ] **Step 6: Criar `src/pages/politica-de-privacidade.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Footer from '../components/Footer.astro';
import { site } from '../content/site';

const { privacy, brand, ui } = site;
---

<BaseLayout
  path="/politica-de-privacidade"
  title={privacy.seoTitle}
  description={privacy.seoDescription}
  ogTitle={privacy.seoTitle}
>
  <header slot="header" class="container privacy-header">
    <a class="privacy-header__brand" href="/">
      <span class="privacy-header__name">{brand.wordmark}</span>
      <span class="lt-eyebrow">{brand.tagline}</span>
    </a>
    <a class="lt-btn lt-btn--ghost" href="/">{ui.backHome}</a>
  </header>
  <article class="section">
    <div class="container privacy">
      <h1 class="lt-title is-h2">{privacy.title}</h1>
      <p class="lt-caption">{privacy.updated}</p>
      {
        privacy.sections.map((section) => (
          <section class="privacy__section">
            <h2 class="lt-title is-h3">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p class="lt-body">{paragraph}</p>
            ))}
          </section>
        ))
      }
    </div>
  </article>
  <Footer slot="footer" />
</BaseLayout>

<style>
  .privacy-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding-block: var(--space-6);
  }

  .privacy-header__brand {
    display: grid;
    gap: 4px;
    color: var(--ink);
    text-decoration: none;
  }

  .privacy-header__name {
    font: 500 26px / 1 var(--font-serif);
  }

  .privacy {
    display: grid;
    gap: var(--space-6);
    max-width: 760px;
  }

  .privacy__section {
    display: grid;
    gap: var(--space-3);
  }
</style>
```

- [ ] **Step 7: Substituir `src/pages/index.astro` inteiro (página completa)**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import About from '../components/About.astro';
import ClinicGallery from '../components/ClinicGallery.astro';
import FAQ from '../components/FAQ.astro';
import FinalCTA from '../components/FinalCTA.astro';
import Footer from '../components/Footer.astro';
import Hero from '../components/Hero.astro';
import Marquee from '../components/Marquee.astro';
import MethodSteps from '../components/MethodSteps.astro';
import Navbar from '../components/Navbar.astro';
import PressStrip from '../components/PressStrip.astro';
import Results from '../components/Results.astro';
import Testimonials from '../components/Testimonials.astro';
import Treatments from '../components/Treatments.astro';
import WhatsAppFloat from '../components/WhatsAppFloat.astro';
import { media } from '../content/media';
import { listPending } from '../content/pending';
import { site } from '../content/site';
import { buildBusinessJsonLd, buildFaqJsonLd } from '../lib/seo';

for (const line of listPending(site)) console.warn(`[pendente] ${line}`);
for (const line of media.reportLines()) console.warn(`[mídia] ${line}`);

const jsonLd = [
  buildBusinessJsonLd(site, {
    url: new URL('/', Astro.site).href,
    image: new URL('/og.jpg', Astro.site).href,
  }),
  buildFaqJsonLd(site.faq.items),
];
---

<BaseLayout path="/" jsonLd={jsonLd}>
  <Marquee slot="header" />
  <Navbar slot="header" />
  <Hero />
  <PressStrip />
  <Treatments />
  <Results />
  <MethodSteps />
  <About />
  <Testimonials />
  <ClinicGallery />
  <FAQ />
  <FinalCTA />
  <Footer slot="footer" />
  <WhatsAppFloat slot="after" />
</BaseLayout>
```

- [ ] **Step 8: Build, testes de dist e conferência visual**

Run: `npm run build && npm run test:dist && node scripts/with-preview.mjs bash scripts/shot.sh "#agendar" 320 375 1280`
Expected: PASS em todos os testes de dist; capturas com CTA final escuro (título claro com itálico rosado, botão verde), cartão de endereço com os dois botões contornados; rodapé escuro com as linhas do copy; em 320 px nada estoura a largura (o `@clinicalauratavaress` quebra se precisar).

- [ ] **Step 9: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add src/lib/maps.ts src/lib/maps.test.ts src/components/FinalCTA.astro src/components/Footer.astro src/pages tests/dist/closing.test.ts
git commit -m "$(cat <<'EOF'
feat: CTA final com cartão de endereço, rodapé e política de privacidade

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 25: Fechamento da Etapa 4 — executada pelo orquestrador

> **Executada pelo ORQUESTRADOR.** Ele acrescenta ao corpo do PR e à mensagem do commit de squash as linhas de atribuição exigidas pela sessão dele.

- [ ] **Step 1: Gate completo na branch**

Run: `npm run check && npm run lighthouse`
Expected: tudo verde e `Resultado: **aprovado**` para `home` e `politica-de-privacidade`. Commite `docs/qa/lighthouse.md` se mudou (`docs: resumo do Lighthouse da Etapa 4`, com a linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).

- [ ] **Step 2: Push e PR**

```bash
git push -u origin feat/sobre-ao-rodape
mkdir -p .e2e-tmp
cat > .e2e-tmp/pr-body.md <<'EOF'
## Resumo
- Sobre a Dra. Laura: foto fixa no desktop (`position: sticky`), citação da Revista Orla BSB, números com contadores marcados, assinatura em Pinyon Script; credenciais só quando profissão e registro existirem.
- Depoimentos reais lidos de `src/content/depoimentos.json` (validados; sem o arquivo a seção não aparece).
- A clínica (destaques + galeria), FAQ com 9 dúvidas, CTA do WhatsApp e JSON-LD `FAQPage`.
- CTA final noite com cartão de endereço ("Abrir no Google Maps" / "Abrir no Waze", sem embed nem imagem de mapa), rodapé com responsável técnica e página `/politica-de-privacidade`.

## Checklist de validação
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`
- [x] `npm run test:dist` (inclui âncoras, origens do WhatsApp, alts e ordem das seções)
- [x] `npm run lighthouse` — mobile ≥ 90 nas 4 categorias, home e política (`docs/qa/lighthouse.md`)
- [x] Revisões por subagente (especificação + qualidade) aprovadas nas Tasks 20–24

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
gh pr create --base main --head feat/sobre-ao-rodape --title "feat: do Sobre ao rodapé (depoimentos, clínica, FAQ, CTA final e privacidade)" --body-file .e2e-tmp/pr-body.md
```

- [ ] **Step 3: Merge squash e volta para a main**

```bash
gh pr merge feat/sobre-ao-rodape --squash --delete-branch --subject "feat: do Sobre ao rodapé (depoimentos, clínica, FAQ, CTA final e privacidade)"
git checkout main && git pull --ff-only
```

- [ ] **Step 4: Atualizar `docs/HANDOFF.md`**

Em `## Estado`, troque a linha `- Etapas 4–7: pendentes.` por:

```markdown
- **Etapa 4 — do Sobre ao rodapé (`feat/sobre-ao-rodape`): concluída e mergeada na `main`.** Página completa com as 11 seções da spec + política de privacidade; depoimentos dependem de `src/content/depoimentos.json` (frente de mídia).
- Etapas 5–7: pendentes.
```

Em `## Decisões`, acrescente:

```markdown
- "Pin" do Sobre feito com CSS `position: sticky` (sem `.pin-spacer` do ScrollTrigger e funcionando sem JS).
- Mapa simplificado: cartão de endereço + "Abrir no Google Maps" / "Abrir no Waze", sem embed nem imagem de mapa (LGPD/performance) — desvio consciente do item "mapa como imagem + link" da spec.
- Texto da política de privacidade escrito para o site (não estava no copy) — precisa de revisão da clínica (vai para o CHECKLIST na Etapa 6).
```

Em `## Próximo passo`, troque o item por `- Etapa 5 — \`feat/movimento\`: Task 26 do plano.` e então:

```bash
git add docs/HANDOFF.md
git commit -m "$(cat <<'EOF'
docs: atualiza HANDOFF após a Etapa 4

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

## Etapa 5 — `feat/movimento`

> Antes da Task 26: `git checkout main && git pull --ff-only && git checkout -b feat/movimento`. Leia `docs/design-system/Movimento.md` e as skills `.claude/skills/gsap-core`, `gsap-scrolltrigger` e `gsap-performance` antes de começar.
>
> **Regras desta etapa:** cada padrão é um módulo em `src/scripts/motion/` que devolve um `Cleanup`; tudo é criado dentro de um único `gsap.matchMedia().add(MOTION_CONDITIONS, …)` com as três condições (desktop, mobile, reduzido); estados iniciais escondidos só sob `html.js`; nada de `pin` do ScrollTrigger (o Sobre usa `position: sticky`); nada de View Transitions.

### Task 26: Infra de movimento — Lenis + GSAP, orquestrador, classe `js` com failsafe, títulos por linhas (padrão 1), cards (padrão 8) e ramo de movimento reduzido

**Files:**
- Create: `src/scripts/motion/conditions.ts`, `src/scripts/motion/conditions.test.ts`, `src/scripts/motion/types.ts`, `src/scripts/motion/lenis.ts`, `src/scripts/motion/titles.ts`, `src/scripts/motion/cards.ts`, `src/scripts/motion/reduced.ts`, `src/scripts/motion/index.ts`, `tests/dist/motion.test.ts`
- Modify: `src/layouts/BaseLayout.astro`, `src/styles/global.css`, `package.json` (gsap, lenis)

**Interfaces:**
- Consumes: atributos já presentes no HTML — `[data-title]` (RichTitle), `[data-reveal]` (cards, blocos, itens); `cssOf`/`loadPage` (Task 2).
- Produces:
  - `MOTION_CONDITIONS = { isDesktop: '(min-width: 1024px)', isMobile: '(max-width: 1023.98px)', reduceMotion: '(prefers-reduced-motion: reduce)' } as const`, `type MotionConditions`, `readConditions(conditions: Record<string, boolean> | undefined): MotionConditions`
  - `type Cleanup = () => void`
  - `startLenis(): Cleanup`, `animateTitles(): Cleanup`, `revealCards(): Cleanup`, `reducedReveal(): Cleanup`
  - `src/scripts/motion/index.ts` (orquestrador; marca `<html>` com `motion-ready`)
  - CSS: `html.js [data-reveal] { opacity: 0 }` e, sem movimento reduzido, `html.js [data-title] { visibility: hidden }`

- [ ] **Step 1: Instalar GSAP e Lenis**

```bash
npm install --save-exact gsap@3.15.0 lenis@1.3.26
```

- [ ] **Step 2: Escrever o teste que falha — `src/scripts/motion/conditions.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { MOTION_CONDITIONS, readConditions } from './conditions';

describe('MOTION_CONDITIONS', () => {
  it('cobre desktop e mobile sem lacuna em 1024px (o handler do matchMedia sempre roda)', () => {
    expect(MOTION_CONDITIONS.isDesktop).toBe('(min-width: 1024px)');
    expect(MOTION_CONDITIONS.isMobile).toBe('(max-width: 1023.98px)');
  });

  it('inclui o movimento reduzido', () => {
    expect(MOTION_CONDITIONS.reduceMotion).toBe('(prefers-reduced-motion: reduce)');
  });
});

describe('readConditions', () => {
  it('normaliza condições ausentes para false', () => {
    expect(readConditions(undefined)).toEqual({ isDesktop: false, isMobile: false, reduceMotion: false });
    expect(readConditions({ isDesktop: true })).toEqual({ isDesktop: true, isMobile: false, reduceMotion: false });
  });
});
```

Run: `npm test -- src/scripts/motion/conditions.test.ts`
Expected: FAIL com `Failed to resolve import "./conditions"`.

- [ ] **Step 3: Implementar `src/scripts/motion/conditions.ts` e `src/scripts/motion/types.ts`**

```ts
// conditions.ts
/** Condições do gsap.matchMedia: sempre desktop E mobile, para o handler rodar em qualquer largura. */
export const MOTION_CONDITIONS = {
  isDesktop: '(min-width: 1024px)',
  isMobile: '(max-width: 1023.98px)',
  reduceMotion: '(prefers-reduced-motion: reduce)',
} as const;

export type MotionConditions = Record<keyof typeof MOTION_CONDITIONS, boolean>;

export function readConditions(conditions: Record<string, boolean> | undefined): MotionConditions {
  return {
    isDesktop: Boolean(conditions?.isDesktop),
    isMobile: Boolean(conditions?.isMobile),
    reduceMotion: Boolean(conditions?.reduceMotion),
  };
}
```

```ts
// types.ts
/** Desfaz o que um padrão de movimento criou fora do contexto do gsap.matchMedia (listeners, observers). */
export type Cleanup = () => void;
```

Run: `npm test -- src/scripts/motion/conditions.test.ts`
Expected: PASS — `Tests  3 passed`.

- [ ] **Step 4: Escrever o teste de dist que falha — `tests/dist/motion.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { cssOf, loadPage } from './load';

describe('movimento — estrutura no HTML e no CSS', () => {
  it('marca <html> com a classe js no <head>, com failsafe de 4 s', () => {
    const { document } = loadPage();
    const inline = Array.from(
      document.querySelectorAll('head script:not([src]):not([type])'),
      (script) => script.textContent ?? '',
    ).join('\n');
    expect(inline).toMatch(/classList\.add\(['"]js['"]\)/);
    expect(inline).toContain('motion-ready');
    expect(inline).toContain('4000');
  });

  it('carrega o movimento como módulo externo; o único script inline executável é o da classe js', () => {
    const { document } = loadPage();
    expect(document.querySelectorAll('script[type="module"][src]').length).toBeGreaterThan(0);
    const inlineExecutable = Array.from(document.querySelectorAll('script:not([src])')).filter(
      (script) => script.getAttribute('type') !== 'application/ld+json',
    );
    expect(inlineExecutable).toHaveLength(1);
  });

  it('só esconde conteúdo sob html.js (sem JS tudo fica visível)', () => {
    const css = cssOf(loadPage().document);
    expect(css).toMatch(/html\.js \[data-reveal\]\s*\{\s*opacity:\s*0/);
    expect(css).not.toMatch(/(^|[},])\s*\[data-reveal\]\s*\{[^}]*opacity:\s*0/);
  });

  it('inclui o CSS do Lenis', () => {
    expect(cssOf(loadPage().document)).toContain('.lenis');
  });
});
```

Run: `npm run build && npm run test:dist`
Expected: FAIL nos 4 testes de `motion.test.ts`.

- [ ] **Step 5: Criar `src/scripts/motion/lenis.ts`**

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import type { Cleanup } from './types';

/**
 * Scroll suave (lerp 0.08, Movimento.md) sincronizado com o ScrollTrigger pelo ticker do GSAP.
 * anchors: rola até âncoras respeitando o scroll-margin-top das seções; autoToggle: para enquanto a
 * gaveta do menu (dialog) deixa o <html> com overflow hidden.
 */
export function startLenis(): Cleanup {
  const lenis = new Lenis({ lerp: 0.08, anchors: true, autoToggle: true, stopInertiaOnNavigate: true });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
  };
}
```

- [ ] **Step 6: Criar `src/scripts/motion/titles.ts` (padrão 1 — título por linhas)**

```ts
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { Cleanup } from './types';

const LINE_STAGGER = 0.08;
const ACCENT_DELAY = 0.15;

/**
 * Padrão 1: cada linha sobe de yPercent 110 dentro de uma máscara (stagger 0,08 s, dur-base, ease-lux);
 * a palavra em itálico (<em>) entra por último, com 0,15 s extra.
 */
export function animateTitles(): Cleanup {
  const splits = Array.from(document.querySelectorAll<HTMLElement>('[data-title]'), (title) =>
    SplitText.create(title, {
      type: 'lines,words',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        gsap.set(title, { visibility: 'visible' });
        const words = self.words as HTMLElement[];
        const accent = words.filter((word) => word.closest('em') !== null);
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: title, start: 'top 88%', once: true },
        });
        self.lines.forEach((line, index) => {
          const plain = words.filter((word) => line.contains(word) && !accent.includes(word));
          if (plain.length > 0) {
            timeline.from(plain, { yPercent: 110, duration: 0.6, ease: 'expo.out' }, index * LINE_STAGGER);
          }
        });
        if (accent.length > 0) {
          timeline.from(
            accent,
            { yPercent: 110, duration: 0.6, ease: 'expo.out' },
            self.lines.length * LINE_STAGGER + ACCENT_DELAY,
          );
        }
        return timeline;
      },
    }),
  );
  return () => splits.forEach((split) => split.revert());
}
```

- [ ] **Step 7: Criar `src/scripts/motion/cards.ts` (padrão 8) e `src/scripts/motion/reduced.ts`**

```ts
// cards.ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Cleanup } from './types';

/** Padrão 8: cards e blocos sobem y 40 → 0 com fade, stagger 0,1 s (hover fica no CSS do bundle). */
export function revealCards(): Cleanup {
  const triggers = ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) =>
      gsap.fromTo(
        batch,
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.1, overwrite: true },
      ),
  });
  return () => triggers.forEach((trigger) => trigger.kill());
}
```

```ts
// reduced.ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Cleanup } from './types';

/** Movimento reduzido: sem marquee, parallax, splits ou contadores — só fades de 200 ms (Movimento.md). */
export function reducedReveal(): Cleanup {
  const triggers = ScrollTrigger.batch('[data-reveal]', {
    start: 'top 95%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, duration: 0.2, ease: 'none', overwrite: true }),
  });
  return () => triggers.forEach((trigger) => trigger.kill());
}
```

- [ ] **Step 8: Criar o orquestrador `src/scripts/motion/index.ts`**

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { revealCards } from './cards';
import { MOTION_CONDITIONS, readConditions } from './conditions';
import { startLenis } from './lenis';
import { reducedReveal } from './reduced';
import { animateTitles } from './titles';
import type { Cleanup } from './types';

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });

const root = document.documentElement;
// Se o failsafe de 4 s já tirou a classe "js", o conteúdo está visível: não escondemos nada de novo.
const revealsAllowed = root.classList.contains('js');

gsap.matchMedia().add(MOTION_CONDITIONS, (context) => {
  const { reduceMotion } = readConditions(context.conditions);
  const cleanups: Cleanup[] = [];
  if (reduceMotion) {
    if (revealsAllowed) cleanups.push(reducedReveal());
  } else {
    cleanups.push(startLenis());
    if (revealsAllowed) cleanups.push(animateTitles(), revealCards());
  }
  return () => cleanups.forEach((cleanup) => cleanup());
});

void document.fonts.ready.then(() => ScrollTrigger.refresh());
root.classList.add('motion-ready');
```

- [ ] **Step 9: Ligar o movimento na `src/layouts/BaseLayout.astro`**

No frontmatter, logo depois de `import '../styles/index';`, acrescente:

```ts
import 'lenis/dist/lenis.css';
```

No `<head>`, logo depois de `<meta name="viewport" content="width=device-width, initial-scale=1" />`, acrescente:

```astro
    <script is:inline>
      document.documentElement.classList.add('js');
      window.setTimeout(() => {
        const root = document.documentElement;
        if (!root.classList.contains('motion-ready')) root.classList.remove('js');
      }, 4000);
    </script>
```

No `<body>`, logo depois de `<slot name="after" />`, acrescente:

```astro
    <script>
      import '../scripts/motion/index';
    </script>
```

- [ ] **Step 10: Acrescentar ao final de `src/styles/global.css`**

```css
/* Estados iniciais do movimento: valem só com JS ativo (classe js no <html>).
   Sem JS — ou se o failsafe de 4 s remover a classe — tudo fica visível. */
html.js [data-reveal] {
  opacity: 0;
}

@media (prefers-reduced-motion: no-preference) {
  html.js [data-title] {
    visibility: hidden;
  }
}
```

- [ ] **Step 11: Build e testes de dist passando**

Run: `npm run build && npm run test:dist`
Expected: PASS em todos (incluindo os 4 de `motion.test.ts`).

- [ ] **Step 12: Conferir no navegador (movimento normal e reduzido)**

```bash
mkdir -p .e2e-tmp
cat > .e2e-tmp/motion-check.sh <<'EOF'
set -euo pipefail
AB=(agent-browser --session lt-check)
"${AB[@]}" close >/dev/null 2>&1 || true
"${AB[@]}" open "$BASE_URL" >/dev/null
"${AB[@]}" set viewport 1280 800 >/dev/null
"${AB[@]}" open "$BASE_URL" >/dev/null
"${AB[@]}" wait --load networkidle >/dev/null
"${AB[@]}" eval --stdin <<'JS'
(async () => {
  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const root = document.documentElement;
  if (!root.classList.contains('motion-ready')) throw new Error('motion-ready ausente');
  if (!root.classList.contains('js')) throw new Error('classe js removida (o failsafe disparou?)');
  if (!root.classList.contains('lenis')) throw new Error('Lenis não iniciou');
  for (let y = 0; y < root.scrollHeight; y += 500) { window.scrollTo(0, y); await pause(120); }
  await pause(1200);
  const hidden = [...document.querySelectorAll('[data-reveal]')].filter((el) => getComputedStyle(el).opacity !== '1');
  if (hidden.length) throw new Error(`${hidden.length} elementos [data-reveal] ainda invisíveis`);
  const titles = [...document.querySelectorAll('[data-title]')];
  if (titles.some((title) => getComputedStyle(title).visibility !== 'visible')) throw new Error('título ainda escondido');
  if (!titles.every((title) => title.hasAttribute('aria-label'))) throw new Error('títulos sem aria-label do SplitText');
  return `ok: ${titles.length} títulos e ${document.querySelectorAll('[data-reveal]').length} reveals`;
})()
JS
"${AB[@]}" --json console > .e2e-tmp/console.json
node -e "const m = require('./.e2e-tmp/console.json').data.messages.filter((x) => x.type === 'error'); if (m.length) { console.error(m); process.exit(1); } console.log('console sem erros');"
"${AB[@]}" set media light reduced-motion >/dev/null
"${AB[@]}" open "$BASE_URL" >/dev/null
"${AB[@]}" wait --load networkidle >/dev/null
"${AB[@]}" eval --stdin <<'JS'
(async () => {
  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) throw new Error('emulação de movimento reduzido falhou');
  if (document.documentElement.classList.contains('lenis')) throw new Error('Lenis ativo com movimento reduzido');
  for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { window.scrollTo(0, y); await pause(80); }
  await pause(600);
  const hidden = [...document.querySelectorAll('[data-reveal]')].filter((el) => getComputedStyle(el).opacity !== '1');
  if (hidden.length) throw new Error(`${hidden.length} [data-reveal] invisíveis no modo reduzido`);
  if ([...document.querySelectorAll('[data-title]')].some((title) => title.hasAttribute('aria-label'))) throw new Error('SplitText rodou no modo reduzido');
  return 'movimento reduzido ok';
})()
JS
"${AB[@]}" close >/dev/null
EOF
node scripts/with-preview.mjs bash .e2e-tmp/motion-check.sh
```

Expected: `"ok: N títulos e M reveals"`, `console sem erros` e `"movimento reduzido ok"`.

- [ ] **Step 13: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add package.json package-lock.json src/scripts/motion src/layouts/BaseLayout.astro src/styles/global.css tests/dist/motion.test.ts
git commit -m "$(cat <<'EOF'
feat: infraestrutura de movimento com Lenis, GSAP, títulos por linhas e reveals

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 27: Foto em arco revelada (padrão 2), parallax leve (padrão 3) e assinatura que se escreve (padrão 9)

**Files:**
- Create: `src/scripts/motion/arches.ts`, `src/scripts/motion/parallax.ts`, `src/scripts/motion/signature.ts`
- Modify: `src/scripts/motion/index.ts`, `src/styles/global.css`, `tests/dist/motion.test.ts`

**Interfaces:**
- Consumes: `[data-arch-reveal]` (Hero, Sobre, BeforeAfter), `[data-parallax]` (arco do hero `-10`, badge `6`), `[data-parallax-inner]` (molduras da clínica `-8`), `[data-signature]` (Sobre); `Cleanup`, `readConditions`.
- Produces: `revealArches(): Cleanup` (só desktop), `parallax(): Cleanup` (só desktop), `revealSignatures(): Cleanup`; CSS inicial `html.js [data-arch-reveal]` (desktop, sem movimento reduzido) e `html.js [data-signature]` (sem movimento reduzido).

- [ ] **Step 1: Acrescentar o teste de dist que falha — no fim de `tests/dist/motion.test.ts`**

```ts
describe('movimento — padrões 2, 3 e 9 marcados no HTML', () => {
  it('marca as fotos em arco, o parallax e a assinatura', () => {
    const { document } = loadPage();
    expect(document.querySelector('#inicio [data-arch-reveal]')).not.toBeNull();
    expect(document.querySelector('#dra-laura [data-arch-reveal]')).not.toBeNull();
    expect(document.querySelector('#inicio [data-parallax="-10"]')).not.toBeNull();
    expect(document.querySelector('#inicio [data-parallax="6"]')).not.toBeNull();
    expect(document.querySelectorAll('#a-clinica [data-parallax-inner]')).toHaveLength(4);
    expect(document.querySelectorAll('[data-signature]')).toHaveLength(1);
  });

  it('o arco só começa escondido no desktop com JS e sem movimento reduzido', () => {
    const css = cssOf(loadPage().document);
    expect(css).toMatch(/html\.js \[data-arch-reveal\]\s*\{\s*clip-path:\s*inset\(100%/);
    expect(css).toMatch(/html\.js \[data-signature\]\s*\{\s*clip-path:/);
  });
});
```

Run: `npm run build && npm run test:dist`
Expected: o primeiro novo teste PASSA (atributos já existem desde as Etapas 2–4) e o segundo FALHA (CSS ainda não existe).

- [ ] **Step 2: Criar `src/scripts/motion/arches.ts` (padrão 2)**

```ts
import { gsap } from 'gsap';
import type { Cleanup } from './types';

/**
 * Padrão 2: clip-path inset(100% 0 0 0) → inset(0) com ease-silk em dur-slow (1,2 s),
 * enquanto as imagens internas vão de scale 1.12 a 1. Hero, Sobre e antes/depois (desktop).
 */
export function revealArches(): Cleanup {
  const timelines = Array.from(document.querySelectorAll<HTMLElement>('[data-arch-reveal]'), (arch) => {
    const images = arch.querySelectorAll('img');
    const timeline = gsap.timeline({ scrollTrigger: { trigger: arch, start: 'top 85%', once: true } });
    timeline.fromTo(
      arch,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power3.inOut' },
    );
    if (images.length > 0) {
      timeline.fromTo(images, { scale: 1.12 }, { scale: 1, duration: 1.2, ease: 'power3.inOut' }, 0);
    }
    return timeline;
  });
  return () => timelines.forEach((timeline) => timeline.scrollTrigger?.kill());
}
```

- [ ] **Step 3: Criar `src/scripts/motion/parallax.ts` (padrão 3)**

```ts
import { gsap } from 'gsap';
import type { Cleanup } from './types';

/**
 * Padrão 3 (só desktop): fotos se movem até ~10% com scrub; o badge do hero vai no sentido oposto (+6%).
 * data-parallax move o próprio elemento; data-parallax-inner move a imagem dentro da moldura (com folga de escala).
 * clamp() evita salto inicial quando o elemento já está na tela ao carregar.
 */
export function parallax(): Cleanup {
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((element) => {
    const amount = Number(element.dataset.parallax ?? '-10');
    gsap.fromTo(
      element,
      { yPercent: 0 },
      {
        yPercent: amount,
        ease: 'none',
        scrollTrigger: { trigger: element, start: 'clamp(top bottom)', end: 'clamp(bottom top)', scrub: true },
      },
    );
  });
  document.querySelectorAll<HTMLElement>('[data-parallax-inner]').forEach((frame) => {
    const image = frame.querySelector('img');
    if (!image) return;
    const amount = Number(frame.dataset.parallaxInner ?? '-8');
    gsap.set(image, { scale: 1.12 });
    gsap.fromTo(
      image,
      { yPercent: -amount / 2 },
      {
        yPercent: amount / 2,
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'clamp(top bottom)', end: 'clamp(bottom top)', scrub: true },
      },
    );
  });
  return () => undefined;
}
```

- [ ] **Step 4: Criar `src/scripts/motion/signature.ts` (padrão 9)**

```ts
import { gsap } from 'gsap';
import type { Cleanup } from './types';

/**
 * Padrão 9: a assinatura "se escreve" da esquerda para a direita (sem o SVG real, a revelação é por clip-path).
 * As margens negativas do inset deixam os floreios do Pinyon Script aparecerem inteiros no fim.
 */
export function revealSignatures(): Cleanup {
  document.querySelectorAll<HTMLElement>('[data-signature]').forEach((signature) => {
    gsap.fromTo(
      signature,
      { clipPath: 'inset(-20% 100% -20% -10%)' },
      {
        clipPath: 'inset(-20% -10% -20% -10%)',
        duration: 1.6,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: signature, start: 'top 85%', once: true },
      },
    );
  });
  return () => undefined;
}
```

- [ ] **Step 5: Substituir `src/scripts/motion/index.ts` inteiro**

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { revealArches } from './arches';
import { revealCards } from './cards';
import { MOTION_CONDITIONS, readConditions } from './conditions';
import { startLenis } from './lenis';
import { parallax } from './parallax';
import { reducedReveal } from './reduced';
import { revealSignatures } from './signature';
import { animateTitles } from './titles';
import type { Cleanup } from './types';

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });

const root = document.documentElement;
// Se o failsafe de 4 s já tirou a classe "js", o conteúdo está visível: não escondemos nada de novo.
const revealsAllowed = root.classList.contains('js');

gsap.matchMedia().add(MOTION_CONDITIONS, (context) => {
  const { isDesktop, reduceMotion } = readConditions(context.conditions);
  const cleanups: Cleanup[] = [];
  if (reduceMotion) {
    if (revealsAllowed) cleanups.push(reducedReveal());
  } else {
    cleanups.push(startLenis());
    if (isDesktop) cleanups.push(parallax());
    if (revealsAllowed) {
      cleanups.push(animateTitles(), revealCards(), revealSignatures());
      if (isDesktop) cleanups.push(revealArches());
    }
  }
  return () => cleanups.forEach((cleanup) => cleanup());
});

void document.fonts.ready.then(() => ScrollTrigger.refresh());
root.classList.add('motion-ready');
```

- [ ] **Step 6: Acrescentar ao final de `src/styles/global.css`**

```css
/* Padrão 2: no desktop, as fotos em arco começam fechadas (o mobile mostra a foto direto — LCP). */
@media (min-width: 1024px) and (prefers-reduced-motion: no-preference) {
  html.js [data-arch-reveal] {
    clip-path: inset(100% 0 0 0);
  }
}

/* Padrão 9: a assinatura começa recolhida à esquerda. */
@media (prefers-reduced-motion: no-preference) {
  html.js [data-signature] {
    clip-path: inset(-20% 100% -20% -10%);
  }
}
```

- [ ] **Step 7: Build, testes de dist e conferência no navegador**

Run: `npm run build && npm run test:dist && node scripts/with-preview.mjs bash .e2e-tmp/motion-check.sh && node scripts/with-preview.mjs bash scripts/shot.sh "#dra-laura" 1280`
Expected: PASS; o `motion-check.sh` (Task 26) continua passando; na captura do Sobre a foto em arco já está revelada e a assinatura aparece inteira (sem floreio cortado).

- [ ] **Step 8: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add src/scripts/motion src/styles/global.css tests/dist/motion.test.ts
git commit -m "$(cat <<'EOF'
feat: arco revelado, parallax leve no desktop e assinatura que se escreve

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 28: Marquee que acelera com o scroll (padrão 4) e carrossel em GSAP (padrão 5) — TDD da aceleração

**Files:**
- Create: `src/scripts/motion/velocity.ts`, `src/scripts/motion/velocity.test.ts`, `src/scripts/motion/marquee.ts`, `src/scripts/motion/carousel.ts`
- Modify: `src/scripts/motion/index.ts`

**Interfaces:**
- Consumes: `[data-marquee]`/`[data-marquee-track]`/`data-paused` (Task 11); `[data-reel]`/`[data-reel-track][data-reel-direction]`/`data-paused` (Task 17); as classes `is-gsap` já desligam a animação CSS nesses componentes.
- Produces: `velocityBoost(velocity: number, options?: { max?: number; divisor?: number }): number`; `loopMarquees(): Cleanup` (desktop e mobile); `loopCarousels(): Cleanup` (só desktop — no mobile o carrossel é de deslize).

- [ ] **Step 1: Escrever o teste que falha — `src/scripts/motion/velocity.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { velocityBoost } from './velocity';

describe('velocityBoost', () => {
  it('fica em 1× parado', () => {
    expect(velocityBoost(0)).toBe(1);
  });

  it('acelera proporcionalmente nos dois sentidos', () => {
    expect(velocityBoost(1000)).toBe(1.5);
    expect(velocityBoost(-1000)).toBe(1.5);
  });

  it('nunca passa de 2×', () => {
    expect(velocityBoost(1_000_000)).toBe(2);
  });

  it('volta a 1× com velocidade inválida', () => {
    expect(velocityBoost(Number.NaN)).toBe(1);
  });

  it('aceita teto e divisor customizados', () => {
    expect(velocityBoost(500, { max: 3, divisor: 250 })).toBe(3);
  });
});
```

Run: `npm test -- src/scripts/motion/velocity.test.ts`
Expected: FAIL com `Failed to resolve import "./velocity"`.

- [ ] **Step 2: Implementar `src/scripts/motion/velocity.ts`**

```ts
/** Padrão 4: multiplicador da velocidade da faixa conforme o scroll (até `max`, padrão 2×). */
export function velocityBoost(
  velocity: number,
  { max = 2, divisor = 2000 }: { max?: number; divisor?: number } = {},
): number {
  if (!Number.isFinite(velocity)) return 1;
  return 1 + Math.min(Math.abs(velocity) / divisor, max - 1);
}
```

Run: `npm test -- src/scripts/motion/velocity.test.ts`
Expected: PASS — `Tests  5 passed`.

- [ ] **Step 3: Criar `src/scripts/motion/marquee.ts`**

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Cleanup } from './types';
import { velocityBoost } from './velocity';

/** Padrão 4: faixa contínua (40 s por volta), pausa no hover e no botão, acelera com o scroll e volta com ease-lux. */
export function loopMarquees(): Cleanup {
  const cleanups: Cleanup[] = [];
  document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((root) => {
    const track = root.querySelector<HTMLElement>('[data-marquee-track]');
    if (!track) return;
    root.classList.add('is-gsap');
    const loop = gsap.fromTo(track, { xPercent: 0 }, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 });
    let hovering = false;
    const sync = () => {
      if (hovering || root.hasAttribute('data-paused')) loop.pause();
      else loop.resume();
    };
    const enter = () => {
      hovering = true;
      sync();
    };
    const leave = () => {
      hovering = false;
      sync();
    };
    root.addEventListener('mouseenter', enter);
    root.addEventListener('mouseleave', leave);
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['data-paused'] });
    let settle: gsap.core.Tween | undefined;
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        settle?.kill();
        loop.timeScale(velocityBoost(self.getVelocity()));
        settle = gsap.to(loop, { timeScale: 1, duration: 1.2, ease: 'expo.out', delay: 0.15 });
      },
    });
    sync();
    cleanups.push(() => {
      root.removeEventListener('mouseenter', enter);
      root.removeEventListener('mouseleave', leave);
      observer.disconnect();
      settle?.kill();
      root.classList.remove('is-gsap');
    });
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}
```

- [ ] **Step 4: Criar `src/scripts/motion/carousel.ts`**

```ts
import { gsap } from 'gsap';
import type { Cleanup } from './types';

/** Padrão 5 (desktop): 60 s por volta, fileiras em sentidos opostos, pausa no hover e no botão. */
export function loopCarousels(): Cleanup {
  const cleanups: Cleanup[] = [];
  document.querySelectorAll<HTMLElement>('[data-reel]').forEach((root) => {
    const tracks = Array.from(root.querySelectorAll<HTMLElement>('[data-reel-track]'));
    if (tracks.length === 0) return;
    root.classList.add('is-gsap');
    const loops = tracks.map((track) => {
      const forward = Number(track.dataset.reelDirection ?? '-1') < 0;
      return gsap.fromTo(
        track,
        { xPercent: forward ? 0 : -50 },
        { xPercent: forward ? -50 : 0, duration: 60, ease: 'none', repeat: -1 },
      );
    });
    let hovering = false;
    const sync = () => {
      const paused = hovering || root.hasAttribute('data-paused');
      for (const loop of loops) {
        if (paused) loop.pause();
        else loop.resume();
      }
    };
    const enter = () => {
      hovering = true;
      sync();
    };
    const leave = () => {
      hovering = false;
      sync();
    };
    root.addEventListener('mouseenter', enter);
    root.addEventListener('mouseleave', leave);
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['data-paused'] });
    sync();
    cleanups.push(() => {
      root.removeEventListener('mouseenter', enter);
      root.removeEventListener('mouseleave', leave);
      observer.disconnect();
      root.classList.remove('is-gsap');
    });
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}
```

- [ ] **Step 5: Substituir `src/scripts/motion/index.ts` inteiro**

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { revealArches } from './arches';
import { revealCards } from './cards';
import { loopCarousels } from './carousel';
import { MOTION_CONDITIONS, readConditions } from './conditions';
import { startLenis } from './lenis';
import { loopMarquees } from './marquee';
import { parallax } from './parallax';
import { reducedReveal } from './reduced';
import { revealSignatures } from './signature';
import { animateTitles } from './titles';
import type { Cleanup } from './types';

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });

const root = document.documentElement;
// Se o failsafe de 4 s já tirou a classe "js", o conteúdo está visível: não escondemos nada de novo.
const revealsAllowed = root.classList.contains('js');

gsap.matchMedia().add(MOTION_CONDITIONS, (context) => {
  const { isDesktop, reduceMotion } = readConditions(context.conditions);
  const cleanups: Cleanup[] = [];
  if (reduceMotion) {
    if (revealsAllowed) cleanups.push(reducedReveal());
  } else {
    cleanups.push(startLenis(), loopMarquees());
    if (isDesktop) cleanups.push(loopCarousels(), parallax());
    if (revealsAllowed) {
      cleanups.push(animateTitles(), revealCards(), revealSignatures());
      if (isDesktop) cleanups.push(revealArches());
    }
  }
  return () => cleanups.forEach((cleanup) => cleanup());
});

void document.fonts.ready.then(() => ScrollTrigger.refresh());
root.classList.add('motion-ready');
```

- [ ] **Step 6: Conferir no navegador (loop, pausa e aceleração)**

```bash
cat > .e2e-tmp/loops-check.sh <<'EOF'
set -euo pipefail
AB=(agent-browser --session lt-check)
"${AB[@]}" close >/dev/null 2>&1 || true
"${AB[@]}" open "$BASE_URL" >/dev/null
"${AB[@]}" set viewport 1440 900 >/dev/null
"${AB[@]}" open "$BASE_URL" >/dev/null
"${AB[@]}" wait --load networkidle >/dev/null
"${AB[@]}" eval --stdin <<'JS'
(async () => {
  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const marquee = document.querySelector('[data-marquee]');
  const track = document.querySelector('[data-marquee-track]');
  if (!marquee.classList.contains('is-gsap')) throw new Error('marquee sem GSAP');
  const x0 = new DOMMatrix(getComputedStyle(track).transform).m41;
  await pause(800);
  const x1 = new DOMMatrix(getComputedStyle(track).transform).m41;
  if (!(x1 < x0)) throw new Error('marquee não está andando para a esquerda');
  document.querySelector('[data-marquee-toggle]').click();
  await pause(300);
  const p0 = new DOMMatrix(getComputedStyle(track).transform).m41;
  await pause(600);
  const p1 = new DOMMatrix(getComputedStyle(track).transform).m41;
  if (Math.abs(p1 - p0) > 0.5) throw new Error('o botão não pausou a marquee');
  const reel = document.querySelector('[data-reel]');
  reel.scrollIntoView({ block: 'center' });
  await pause(800);
  if (!reel.classList.contains('is-gsap')) throw new Error('carrossel sem GSAP no desktop');
  return 'marquee e carrossel ok';
})()
JS
"${AB[@]}" close >/dev/null
EOF
npm run build && node scripts/with-preview.mjs bash .e2e-tmp/loops-check.sh && node scripts/with-preview.mjs bash .e2e-tmp/motion-check.sh
```

Expected: `"marquee e carrossel ok"` e o `motion-check.sh` continua verde.

- [ ] **Step 7: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test && npm run test:dist`
Expected: tudo verde.

```bash
git add src/scripts/motion
git commit -m "$(cat <<'EOF'
feat: marquee que acelera com o scroll e carrossel em loop GSAP com pausa

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 29: Dica automática do antes/depois (padrão 6) e contadores (padrão 7) — TDD do formato

**Files:**
- Create: `src/lib/counter.ts`, `src/lib/counter.test.ts`, `src/scripts/motion/before-after-hint.ts`, `src/scripts/motion/counters.ts`
- Modify: `src/scripts/motion/index.ts`

**Interfaces:**
- Consumes: `HINT_KEYFRAMES` (Task 16), eventos `ba:set`/`ba:interact` do BeforeAfter (Task 16), `[data-count-to]`/`data-count-prefix`/`data-count-suffix` do StatBlock (Task 20).
- Produces: `formatCount(value: number, prefix?: string, suffix?: string): string`; `hintBeforeAfter(): Cleanup`; `countUp(): Cleanup`; orquestrador final com os 9 padrões.

- [ ] **Step 1: Escrever o teste que falha — `src/lib/counter.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { formatCount } from './counter';

describe('formatCount', () => {
  it('arredonda e aplica prefixo e sufixo', () => {
    expect(formatCount(0, '+', ' mil')).toBe('+0 mil');
    expect(formatCount(24.6, '+', ' mil')).toBe('+25 mil');
    expect(formatCount(9, '', ' anos')).toBe('9 anos');
  });

  it('funciona sem prefixo nem sufixo', () => {
    expect(formatCount(7.4)).toBe('7');
  });
});
```

Run: `npm test -- src/lib/counter.test.ts`
Expected: FAIL com `Failed to resolve import "./counter"`.

- [ ] **Step 2: Implementar `src/lib/counter.ts`**

```ts
/** Texto de um contador ("+25 mil", "9 anos") durante a animação do padrão 7. */
export function formatCount(value: number, prefix = '', suffix = ''): string {
  return `${prefix}${Math.round(value)}${suffix}`;
}
```

Run: `npm test -- src/lib/counter.test.ts`
Expected: PASS — `Tests  2 passed`.

- [ ] **Step 3: Criar `src/scripts/motion/before-after-hint.ts` (padrão 6)**

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HINT_KEYFRAMES } from '../../lib/before-after';
import type { Cleanup } from './types';

const TOTAL_SECONDS = 1.6;

/**
 * Padrão 6: na primeira vez que o slider entra na tela, a alça faz 50 → 30 → 70 → 50 em 1,6 s (ease-silk).
 * A posição vai pelo evento `ba:set` (o componente atualiza --pos e o range); se a pessoa tocar ou usar
 * o teclado (`ba:interact`), a dica é cancelada.
 */
export function hintBeforeAfter(): Cleanup {
  const cleanups: Cleanup[] = [];
  const [start = 50, ...stops] = HINT_KEYFRAMES;
  let previous = start;
  const distances = stops.map((stop) => {
    const distance = Math.abs(stop - previous);
    previous = stop;
    return distance;
  });
  const totalDistance = distances.reduce((sum, distance) => sum + distance, 0) || 1;

  document.querySelectorAll<HTMLElement>('[data-ba]').forEach((root) => {
    const state = { position: start };
    const emit = () => root.dispatchEvent(new CustomEvent('ba:set', { detail: state.position }));
    const timeline = gsap.timeline({ paused: true });
    stops.forEach((stop, index) => {
      timeline.to(state, {
        position: stop,
        duration: (TOTAL_SECONDS * (distances[index] ?? 0)) / totalDistance,
        ease: 'power3.inOut',
        onUpdate: emit,
      });
    });
    const trigger = ScrollTrigger.create({
      trigger: root,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        timeline.play();
      },
    });
    const cancel = () => {
      timeline.kill();
      trigger.kill();
    };
    root.addEventListener('ba:interact', cancel, { once: true });
    cleanups.push(() => root.removeEventListener('ba:interact', cancel));
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}
```

- [ ] **Step 4: Criar `src/scripts/motion/counters.ts` (padrão 7)**

```ts
import { gsap } from 'gsap';
import { formatCount } from '../../lib/counter';
import type { Cleanup } from './types';

/** Padrão 7: "+25 mil", "9 anos" e "8 anos" contam de 0 em 1,4 s (power2.out) ao entrar na tela, uma vez. */
export function countUp(): Cleanup {
  const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-count-to]'));
  const finalText = (element: HTMLElement) =>
    formatCount(Number(element.dataset.countTo), element.dataset.countPrefix ?? '', element.dataset.countSuffix ?? '');

  elements.forEach((element) => {
    const target = Number(element.dataset.countTo);
    if (!Number.isFinite(target)) return;
    const prefix = element.dataset.countPrefix ?? '';
    const suffix = element.dataset.countSuffix ?? '';
    const state = { value: 0 };
    element.textContent = formatCount(0, prefix, suffix);
    gsap.to(state, {
      value: target,
      duration: 1.4,
      ease: 'power2.out',
      scrollTrigger: { trigger: element, start: 'top 85%', once: true },
      onUpdate: () => {
        element.textContent = formatCount(state.value, prefix, suffix);
      },
    });
  });

  return () => {
    for (const element of elements) {
      if (Number.isFinite(Number(element.dataset.countTo))) element.textContent = finalText(element);
    }
  };
}
```

- [ ] **Step 5: Substituir `src/scripts/motion/index.ts` inteiro (versão final, 9 padrões)**

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { revealArches } from './arches';
import { hintBeforeAfter } from './before-after-hint';
import { revealCards } from './cards';
import { loopCarousels } from './carousel';
import { MOTION_CONDITIONS, readConditions } from './conditions';
import { countUp } from './counters';
import { startLenis } from './lenis';
import { loopMarquees } from './marquee';
import { parallax } from './parallax';
import { reducedReveal } from './reduced';
import { revealSignatures } from './signature';
import { animateTitles } from './titles';
import type { Cleanup } from './types';

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });

const root = document.documentElement;
// Se o failsafe de 4 s já tirou a classe "js", o conteúdo está visível: não escondemos nada de novo.
const revealsAllowed = root.classList.contains('js');

gsap.matchMedia().add(MOTION_CONDITIONS, (context) => {
  const { isDesktop, reduceMotion } = readConditions(context.conditions);
  const cleanups: Cleanup[] = [];
  if (reduceMotion) {
    // Movimento reduzido: sem Lenis, marquee, carrossel, parallax, splits, dica ou contadores.
    if (revealsAllowed) cleanups.push(reducedReveal());
  } else {
    cleanups.push(startLenis(), loopMarquees(), hintBeforeAfter());
    if (isDesktop) cleanups.push(loopCarousels(), parallax());
    if (revealsAllowed) {
      cleanups.push(animateTitles(), revealCards(), revealSignatures(), countUp());
      if (isDesktop) cleanups.push(revealArches());
    }
  }
  return () => cleanups.forEach((cleanup) => cleanup());
});

void document.fonts.ready.then(() => ScrollTrigger.refresh());
root.classList.add('motion-ready');
```

- [ ] **Step 6: Conferir no navegador (dica, teclado depois da dica, contadores e failsafe sem JS)**

```bash
cat > .e2e-tmp/hint-check.sh <<'EOF'
set -euo pipefail
AB=(agent-browser --session lt-check)
"${AB[@]}" close >/dev/null 2>&1 || true
"${AB[@]}" open "$BASE_URL" >/dev/null
"${AB[@]}" set viewport 1280 800 >/dev/null
"${AB[@]}" open "$BASE_URL" >/dev/null
"${AB[@]}" wait --load networkidle >/dev/null
"${AB[@]}" eval --stdin <<'JS'
(async () => {
  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const root = document.querySelector('[data-ba]');
  const seen = new Set();
  root.addEventListener('ba:set', (event) => seen.add(Math.round(event.detail / 10) * 10));
  root.scrollIntoView({ block: 'center' });
  await pause(2400);
  if (!seen.has(30) || !seen.has(70)) throw new Error(`dica não passou por 30% e 70% (viu ${[...seen]})`);
  if (root.style.getPropertyValue('--pos') !== '50%') throw new Error(`dica não terminou em 50% (${root.style.getPropertyValue('--pos')})`);
  const stat = document.querySelector('[data-count-to="25"]');
  stat.scrollIntoView({ block: 'center' });
  await pause(2000);
  if (stat.textContent.trim() !== '+25 mil') throw new Error(`contador terminou em "${stat.textContent}"`);
  return 'dica e contador ok';
})()
JS
"${AB[@]}" close >/dev/null
NOJS=(agent-browser --session lt-check-nojs)
"${NOJS[@]}" close >/dev/null 2>&1 || true
"${NOJS[@]}" batch '["open"]' '["network","route","*","--abort","--resource-type","script"]' "[\"navigate\",\"$BASE_URL\"]" >/dev/null
"${NOJS[@]}" wait 4500 >/dev/null
"${NOJS[@]}" eval --stdin <<'JS'
(() => {
  if (document.documentElement.classList.contains('js')) throw new Error('o failsafe não removeu a classe js');
  const hidden = [...document.querySelectorAll('[data-reveal], [data-title], [data-signature]')].filter((el) => {
    const style = getComputedStyle(el);
    return style.opacity === '0' || style.visibility === 'hidden';
  });
  if (hidden.length) throw new Error(`${hidden.length} elementos escondidos sem JS`);
  return 'sem JS: tudo visível';
})()
JS
"${NOJS[@]}" close >/dev/null
EOF
npm run build && node scripts/with-preview.mjs bash .e2e-tmp/hint-check.sh && node scripts/with-preview.mjs bash .e2e-tmp/motion-check.sh
```

Expected: `"dica e contador ok"`, `"sem JS: tudo visível"` e o `motion-check.sh` verde.

- [ ] **Step 7: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test && npm run test:dist`
Expected: tudo verde.

```bash
git add src/lib/counter.ts src/lib/counter.test.ts src/scripts/motion
git commit -m "$(cat <<'EOF'
feat: dica automática do antes/depois e contadores dos números

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 30: Fechamento da Etapa 5 — executada pelo orquestrador

> **Executada pelo ORQUESTRADOR.** Ele acrescenta ao corpo do PR e à mensagem do commit de squash as linhas de atribuição exigidas pela sessão dele.

- [ ] **Step 1: Gate completo na branch (JS novo pesa na Performance — conferir com atenção)**

Run: `npm run check && npm run lighthouse && node scripts/with-preview.mjs bash .e2e-tmp/motion-check.sh`
Expected: tudo verde; `Resultado: **aprovado**`. Se a Performance cair abaixo de 90, confira no JSON (`docs/qa/lighthouse/home.json`) as auditorias `largest-contentful-paint-element` e `bootup-time`: o LCP no mobile deve ser a foto do hero (não pode estar escondida — o CSS do arco é só desktop). Commite `docs/qa/lighthouse.md` se mudou (`docs: resumo do Lighthouse da Etapa 5`, com a linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).

- [ ] **Step 2: Push e PR**

```bash
git push -u origin feat/movimento
mkdir -p .e2e-tmp
cat > .e2e-tmp/pr-body.md <<'EOF'
## Resumo
- Lenis (lerp 0.08) + GSAP/ScrollTrigger/SplitText com um orquestrador em `gsap.matchMedia` (condições desktop, mobile e movimento reduzido).
- Os 9 padrões do Movimento.md: títulos por linhas, arco revelado, parallax (desktop), marquee que acelera com o scroll, carrossel em loop, dica do antes/depois, contadores, cards e assinatura que se escreve (com a foto do Sobre fixa por `position: sticky`).
- Ramo de movimento reduzido (só fades de 200 ms) e conteúdo visível sem JS: estados iniciais escondidos só sob `html.js`, com failsafe de 4 s.

## Checklist de validação
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`
- [x] `npm run test:dist`
- [x] `npm run lighthouse` — mobile ≥ 90 nas 4 categorias (`docs/qa/lighthouse.md`)
- [x] agent-browser: movimento normal, reduzido e com scripts bloqueados (tudo visível após o failsafe); console sem erros
- [x] Revisões por subagente (especificação + qualidade) aprovadas nas Tasks 26–29

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
gh pr create --base main --head feat/movimento --title "feat: movimento (Lenis, GSAP e os 9 padrões do design system)" --body-file .e2e-tmp/pr-body.md
```

- [ ] **Step 3: Merge squash e volta para a main**

```bash
gh pr merge feat/movimento --squash --delete-branch --subject "feat: movimento (Lenis, GSAP e os 9 padrões do design system)"
git checkout main && git pull --ff-only
```

- [ ] **Step 4: Atualizar `docs/HANDOFF.md`**

Em `## Estado`, troque a linha `- Etapas 5–7: pendentes.` por:

```markdown
- **Etapa 5 — movimento (`feat/movimento`): concluída e mergeada na `main`.** `src/scripts/motion/` com os 9 padrões, orquestrados por `gsap.matchMedia` (desktop/mobile/reduzido); Lenis com âncoras e pausa automática quando a gaveta abre; `html.js` + failsafe de 4 s.
- Etapa 6 (integração das mídias reais) aguarda o merge da frente de mídia; Etapa 7 (QA e deploy) depois dela.
```

Em `## Decisões`, acrescente:

```markdown
- Assinatura "se escreve" por `clip-path` (não há SVG da assinatura real — pendência `logo-vetor`).
- Arco revelado e parallax só no desktop; no mobile a foto do hero aparece de imediato (LCP).
- Nenhum `pin` do ScrollTrigger no projeto (evita `.pin-spacer`); se um dia usar, nunca navegue o DOM a partir do elemento fixado.
```

Em `## Próximo passo`, troque o item por `- Etapa 6 — \`feat/integracao-midia\`: Task 31 do plano, assim que a branch \`feat/midia\` estiver mergeada na \`main\`.` e então:

```bash
git add docs/HANDOFF.md
git commit -m "$(cat <<'EOF'
docs: atualiza HANDOFF após a Etapa 5

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

## Etapa 6 — `feat/integracao-midia`

> **Depende do merge da frente de mídia na `main`.** Antes da Task 31: confirme que a branch `feat/midia` já foi mergeada (`git log main --oneline -5` deve mostrar o commit de fechamento da mídia) e então `git checkout main && git pull --ff-only && git checkout -b feat/integracao-midia`. Leia `docs/media-manifest.md` e `docs/media-pendencias.md` (criados pela frente de mídia) e `docs/design-system/Fotografia.md` antes de começar.
>
> **Regras desta etapa:** o código continua proibido de criar ou editar `src/assets/media/**`, `public/media/**`, `src/content/depoimentos.json`, `src/content/imprensa.json`, `docs/media-manifest.md` e `docs/media-pendencias.md` (Global Constraint da linha 30) — a Task 31 só **lê** esses arquivos para auditar e ajustar o código que os consome.

### Task 31: Integração das mídias reais — auditoria, enquadramento e texturas de apoio

**Files:**
- Create: `src/components/SectionTexture.astro`, `tests/dist/media-integration.test.ts`
- Modify: `src/content/media.ts` (ajuste de `MEDIA_POSITION`, se necessário), `src/components/Hero.astro`, `src/components/PressStrip.astro`, `src/components/Results.astro`, `src/components/Testimonials.astro`

**Interfaces:**
- Consumes: `media.get`, `media.support`, `media.reportLines`, `MEDIA_SLOTS`, `MEDIA_POSITION` (Task 6); `resolveVideo`/`<BackgroundVideo />` (Task 18, já ligado em MethodSteps e FinalCTA); `docs/media-pendencias.md` (frente de mídia, seções `## Arquivos dispensados`, `## Avisos`, `## Dados encontrados para o checklist da clínica`, `## Pedidos à clínica`).
- Produces: `<SectionTexture name />` — Astro, sem export de função TS; renderiza `media.support(name)` como véu decorativo (`aria-hidden`, `alt=""`) atrás da seção, ou nada se a imagem não existir.

- [ ] **Step 1: Build com as mídias reais e auditoria do relatório (Review Focus 1)**

```bash
npm run build 2> .e2e-tmp/build-stderr.txt
cat .e2e-tmp/build-stderr.txt
node -e "
const fs = require('node:fs');
const log = fs.readFileSync('.e2e-tmp/build-stderr.txt', 'utf8');
const pendencias = fs.existsSync('docs/media-pendencias.md') ? fs.readFileSync('docs/media-pendencias.md', 'utf8') : '';
const media = log.split('\n').filter((line) => line.startsWith('[mídia] '));
const bad = media.filter((line) => line.includes('arquivo ignorado') || line.includes('arquivo duplicado'));
if (bad.length > 0) {
  console.error('Arquivos fora do contrato — avise a frente de mídia antes de seguir (nunca editar src/assets/media a partir do código):');
  for (const line of bad) console.error('  ' + line);
  process.exit(1);
}
const placeholders = media.filter((line) => line.includes('placeholder em uso'));
const unexplained = placeholders.filter((line) => {
  const slot = line.match(/placeholder em uso: (\S+)/)?.[1] ?? '';
  return slot !== '' && !pendencias.includes(slot);
});
if (unexplained.length > 0) {
  console.error('Placeholder sem explicação em docs/media-pendencias.md:');
  for (const line of unexplained) console.error('  ' + line);
  process.exit(1);
}
console.log(placeholders.length === 0 ? 'Todos os 18 slots do contrato com foto real.' : (placeholders.length + ' placeholder(s) restante(s) — todos justificados em docs/media-pendencias.md.'));
"
```

Expected: nenhuma linha `arquivo ignorado`/`arquivo duplicado` — **e se aparecer alguma, o script FALHA a etapa** (`process.exit(1)`, saída não-zero), não é só um aviso: o glob eager de `src/content/media.ts` (`import.meta.glob(..., { eager: true })`) copia todo arquivo de `src/assets/media/**` para `dist/_astro/` mesmo sem nenhum `<img>`/`<Picture>` o referenciar, então um arquivo fora do contrato (ex.: uma foto de paciente sem autorização) já teria ido para o `dist/` publicável antes mesmo desta checagem rodar. Pare e resolva com a frente de mídia (o código nunca deve corrigir isso trocando ou renomeando arquivos em `src/assets/media/`) e repita o Step 1 antes de seguir para o Step 2. Sem nenhum arquivo fora do contrato, a mensagem final confirma 18 slots reais ou lista quantos placeholders restam, todos citados em `docs/media-pendencias.md`.

- [ ] **Step 2: Escrever `tests/dist/media-integration.test.ts`**

```ts
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { media, MEDIA_SLOTS } from '../../src/content/media';
import { loadPage } from './load';

describe('integração das mídias reais', () => {
  it('nenhum arquivo fora do contrato em src/assets/media (o glob eager copia pro dist mesmo sem uso)', () => {
    const bad = media
      .reportLines()
      .filter((line) => line.includes('arquivo ignorado') || line.includes('arquivo duplicado'));
    expect(bad).toEqual([]);
  });

  it('toda foto do contrato com arquivo real não tem data-placeholder e tem alt não vazio', () => {
    const { document } = loadPage();
    for (const slot of Object.keys(MEDIA_SLOTS)) {
      const img = document.querySelector(`img[data-slot="${slot}"]`);
      if (!img) continue; // slot sem <img> direto nesta página (não é o caso de nenhum dos 18 hoje)
      const real = existsSync(`src/assets/media/${slot}.jpg`);
      expect(img.hasAttribute('data-placeholder'), slot).toBe(!real);
      if (real) expect((img.getAttribute('alt') ?? '').length > 0, slot).toBe(true);
    }
  });

  it('o carrossel de resultados nunca tem menos de 6 fotos (reais ou placeholder)', () => {
    const { document } = loadPage();
    expect(document.querySelectorAll('#resultados .carousel img').length).toBeGreaterThanOrEqual(6);
  });

  it('o vídeo do Método aparece quando public/media/metodo.* existe', () => {
    const { document } = loadPage();
    const delivered = ['metodo.webm', 'metodo.mp4'].some((file) => existsSync(`public/media/${file}`));
    expect(document.querySelector('#metodo video[data-lazy-video] source') !== null).toBe(delivered);
  });

  it('o vídeo do CTA final aparece quando public/media/cta-final.* existe', () => {
    const { document } = loadPage();
    const delivered = ['cta-final.webm', 'cta-final.mp4'].some((file) => existsSync(`public/media/${file}`));
    expect(document.querySelector('#agendar video[data-lazy-video] source') !== null).toBe(delivered);
  });

  it('texturas de apoio (quando existirem) são decorativas: sem alt e com aria-hidden', () => {
    const { document } = loadPage();
    for (const img of document.querySelectorAll('.section-texture img')) {
      expect(img.getAttribute('alt')).toBe('');
      expect(img.closest('[aria-hidden="true"]')).not.toBeNull();
    }
  });
});
```

Run: `npm run build && npm run test:dist`
Expected: PASS. Se a primeira asserção falhar para algum slot, é sinal de um arquivo entregue com nome certo mas que o resolvedor não enxergou (confira a extensão — o contrato é sempre `.jpg`) ou de um `data-placeholder`/alt que ficou desatualizado num componente.

- [ ] **Step 3: Criar `src/components/SectionTexture.astro`**

Imagem de apoio decorativa e opcional atrás de uma seção ("Texturas: ... para fundos de seção e cards" — `docs/design-system/Fotografia.md`); nunca compete com o conteúdo ("seda, não fogos de artifício" — Global Constraints).

```astro
---
import { Picture } from 'astro:assets';
import { media } from '../content/media';

interface Props {
  /** Nome em src/assets/media/apoio, sem extensão (ex.: "textura-seda-blush"). */
  name: string;
}

const image = media.support(Astro.props.name);
---

{
  image && (
    <div class="section-texture" aria-hidden="true">
      <Picture
        src={image}
        alt=""
        widths={[480, 960, 1600]}
        sizes="100vw"
        formats={['avif', 'webp']}
        class="section-texture__img"
      />
    </div>
  )
}

<style>
  /* Presença discreta — nunca compete com o texto; a seção-mãe precisa de position: relative + isolation: isolate. */
  .section-texture {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
    opacity: 0.16;
  }

  .section-texture__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
```

- [ ] **Step 4: Halo `luz-arco` atrás do arco do Hero**

Em `src/components/Hero.astro`, depois de `const photo = media.get('dra/hero');` acrescente:

```ts
const glow = media.support('luz-arco');
```

Logo depois da abertura de `<div class="hero__media">`, antes de `<div class="lt-arch hero__arch" ...>`, acrescente:

```astro
      {
        glow && (
          <Picture
            src={glow}
            alt=""
            widths={[480, 960]}
            sizes="640px"
            formats={['avif', 'webp']}
            class="hero__glow"
          />
        )
      }
```

No final do `<style>` de `Hero.astro`, acrescente:

```css
  .hero__media {
    position: relative;
    isolation: isolate;
  }

  .hero__glow {
    position: absolute;
    inset: -14%;
    z-index: -1;
    width: auto;
    height: auto;
    object-fit: cover;
    opacity: 0.22;
    pointer-events: none;
  }
```

- [ ] **Step 5: Texturas de fundo em PressStrip, Results e Testimonials**

Em `src/components/PressStrip.astro`: acrescente `import SectionTexture from './SectionTexture.astro';` aos imports; logo depois da abertura de `<section id="na-midia" ...>`, acrescente `<SectionTexture name="textura-seda-blush" />`; no final do `<style>`, acrescente:

```css
  .press {
    position: relative;
    isolation: isolate;
  }
```

Em `src/components/Results.astro`: acrescente o mesmo import; logo depois da abertura de `<section id="resultados" ...>`, acrescente `<SectionTexture name="textura-marmore-champagne" />`; no final do `<style>`, acrescente:

```css
  .results {
    position: relative;
    isolation: isolate;
  }
```

Em `src/components/Testimonials.astro`: acrescente o mesmo import; logo depois da abertura de `<section id="depoimentos" ...>` (dentro do `{items.length > 0 && (...)}`), acrescente `<SectionTexture name="petalas-rosa" />`; no final do `<style>`, acrescente:

```css
  .testimonials {
    position: relative;
    isolation: isolate;
  }
```

- [ ] **Step 6: Build, testes de dist e conferência visual das texturas**

Run: `npm run build && npm run test:dist && node scripts/with-preview.mjs bash scripts/shot.sh "#na-midia" 375 1280`
Expected: PASS em tudo; se `apoio/textura-seda-blush.jpg` já chegou, a captura mostra um véu sutil (opacidade 0,16) atrás do texto, sem reduzir o contraste do texto (compare com `docs/design-system/components/PressStrip/preview.html`); se o arquivo não chegou, a seção aparece exatamente como antes (sem `.section-texture` no DOM).

- [ ] **Step 7: Ajustar `MEDIA_POSITION` se alguma foto real cortar mal**

```bash
npm run build
for SLOT in dra/hero dra/sobre clinica/recepcao clinica/sala clinica/equipe clinica/detalhes; do
  node scripts/with-preview.mjs bash scripts/shot.sh "[data-slot='$SLOT']" 375 1280
done
```

Abra cada `.e2e-tmp/data-slot--*.png` com a ferramenta Read. O padrão é `object-position: center` em todo slot, exceto `dra/hero` e `dra/sobre` (`center 20%`, já fixado na Task 6). Se um rosto, o letreiro dourado ou um produto ficar cortado, ajuste `MEDIA_POSITION` em `src/content/media.ts` — exemplo, se `clinica/recepcao` cortar o letreiro no topo:

```ts
export const MEDIA_POSITION: Partial<Record<MediaSlot, string>> = {
  'dra/hero': 'center 20%',
  'dra/sobre': 'center 20%',
  'clinica/recepcao': 'center 15%',
};
```

Repita a captura até o enquadramento ficar correto. Se nenhum slot tiver foto real ainda (tudo em placeholder), pule este passo.

- [ ] **Step 8: Confirmar que os vídeos do Método e do CTA final aparecem quando entregues**

```bash
mkdir -p .e2e-tmp
cat > .e2e-tmp/video-check.sh <<'EOF'
set -euo pipefail
AB=(agent-browser --session lt-media)
"${AB[@]}" close >/dev/null 2>&1 || true
"${AB[@]}" open "$BASE_URL" >/dev/null
"${AB[@]}" set viewport 1280 900 >/dev/null
"${AB[@]}" open "$BASE_URL" >/dev/null
"${AB[@]}" wait --load networkidle >/dev/null
rm -f .e2e-tmp/video-status.txt
for SECTION in metodo agendar; do
  "${AB[@]}" scrollintoview "#$SECTION" >/dev/null
  "${AB[@]}" wait 1200 >/dev/null
  "${AB[@]}" eval "(() => { const v = document.querySelector('#$SECTION video[data-lazy-video]'); if (!v) return 'sem-video'; return v.currentSrc ? (v.paused ? 'pausado' : 'tocando') : 'sem-currentSrc'; })()" >> .e2e-tmp/video-status.txt
done
"${AB[@]}" close >/dev/null
EOF
node scripts/with-preview.mjs bash .e2e-tmp/video-check.sh
cat .e2e-tmp/video-status.txt
```

Expected: uma linha por seção — `tocando` quando `public/media/metodo.*`/`cta-final.*` já chegaram; `sem-video` quando a frente de mídia ainda não entregou aquele vídeo (não bloqueia: o fundo noite liso já é o fallback previsto na Task 18/24). Nunca `sem-currentSrc` com o vídeo presente (indicaria falha no `lazy-video.ts` da Task 18).

- [ ] **Step 9: Lighthouse mobile e gate da tarefa**

Run: `npm run lighthouse`
Expected: `Resultado: **aprovado**` (mobile ≥ 90 nas 4 categorias) — fotos reais pesam mais que placeholders; se Performance cair, confira `docs/qa/lighthouse/home.json` (`largest-contentful-paint-element`) e, se preciso, confirme que o Hero mantém `priority` e `widths` adequados (Global Constraints) antes de prosseguir.

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

- [ ] **Step 10: Commit**

```bash
git add src/content/media.ts src/components/SectionTexture.astro src/components/Hero.astro src/components/PressStrip.astro src/components/Results.astro src/components/Testimonials.astro tests/dist/media-integration.test.ts docs/qa/lighthouse.md
git commit -m "$(cat <<'EOF'
feat: integra as mídias reais, texturas de apoio e ajustes de enquadramento

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 32: Imagem Open Graph final (1200×630) com as fontes reais e a foto real da Dra.

**Files:**
- Create: `scripts/og/template.html`, `scripts/og/serve.mjs`, `scripts/og/render.sh`
- Modify: `package.json` (script `og`), `public/og.jpg` (sobrescrita pelo script — gerada, nunca editada à mão)

**Interfaces:**
- Consumes: `node_modules/@fontsource/{cormorant-garamond,jost,pinyon-script}/files/*.woff2`; `src/assets/media/dra/hero.jpg` (se existir) ou `src/assets/placeholders/portrait.jpg`; `sharp` (Task 6); `agent-browser`.
- Produces: `node scripts/og/serve.mjs [porta]` (serve o template e a foto em `http://127.0.0.1:<porta>/`); `bash scripts/og/render.sh` → sobrescreve `public/og.jpg` (1200×630 JPEG).

> **Regra de compliance:** a foto é sempre a foto real da Dra. (ou, na falta dela, o placeholder gerado na Task 6) — nunca uma imagem de pessoa gerada por IA.

- [ ] **Step 1: Criar `scripts/og/template.html`**

Texto literal do copy (título do Hero e nome legal, já testados nas Tasks 7/24); cores de `docs/design-system/tokens.css` (`--brand-rosewood #8C4A55`, `--ink #33241F`, `--brand-porcelana #FBF6F2`, `--brand-blush #F1DCD6`, `--surface-rose #EBCBC3`).

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>OG — Clínica Laura Tavares</title>
    <style>
      @font-face {
        font-family: 'Cormorant Garamond';
        font-style: normal;
        font-weight: 500;
        src: url('/node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2')
          format('woff2');
      }
      @font-face {
        font-family: 'Cormorant Garamond';
        font-style: italic;
        font-weight: 500;
        src: url('/node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2')
          format('woff2');
      }
      @font-face {
        font-family: 'Jost';
        font-style: normal;
        font-weight: 400;
        src: url('/node_modules/@fontsource/jost/files/jost-latin-400-normal.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Jost';
        font-style: normal;
        font-weight: 500;
        src: url('/node_modules/@fontsource/jost/files/jost-latin-500-normal.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Pinyon Script';
        font-style: normal;
        font-weight: 400;
        src: url('/node_modules/@fontsource/pinyon-script/files/pinyon-script-latin-400-normal.woff2')
          format('woff2');
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      html,
      body {
        width: 1200px;
        height: 630px;
        overflow: hidden;
      }

      body {
        position: relative;
        display: grid;
        grid-template-columns: 7fr 5fr;
        align-items: center;
        background: radial-gradient(120% 120% at 18% 20%, #fbf6f2 0%, #f1dcd6 55%, #ebcbc3 100%);
        font-family: 'Jost', sans-serif;
      }

      .copy {
        display: grid;
        gap: 20px;
        padding: 64px 0 64px 72px;
      }

      .eyebrow {
        font: 500 15px/1 'Jost', sans-serif;
        letter-spacing: 0.26em;
        text-transform: uppercase;
        color: #8c4a55;
      }

      .title {
        font: 500 54px/1.08 'Cormorant Garamond', serif;
        color: #33241f;
        max-width: 560px;
      }

      .title em {
        font-style: italic;
        color: #8c4a55;
      }

      .signature {
        margin-top: 12px;
        font: 400 42px/1 'Pinyon Script', cursive;
        color: #8c4a55;
      }

      .photo-frame {
        position: relative;
        height: 520px;
        margin: 0 48px 0 0;
        border-radius: 260px / 300px;
        overflow: hidden;
        box-shadow: 0 24px 60px rgba(140, 74, 85, 0.25);
      }

      .photo-frame img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center 20%;
      }
    </style>
  </head>
  <body>
    <div class="copy">
      <p class="eyebrow">Clínica Laura Tavares — Estética Avançada</p>
      <p class="title">Rejuvenescer sem deixar de <em>ser você.</em></p>
      <p class="signature">Laura Tavares</p>
    </div>
    <div class="photo-frame">
      <img src="/og/photo.jpg" alt="" />
    </div>
  </body>
</html>
```

- [ ] **Step 2: Criar `scripts/og/serve.mjs`**

```js
// Servidor estático mínimo para renderizar scripts/og/template.html com as fontes self-hosted reais
// e a foto real da Dra. (ou o placeholder, se ainda não tiver chegado). Só serve arquivos sob o cwd.
// Uso: node scripts/og/serve.mjs [porta]
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.argv[2] ?? process.env.OG_PORT ?? 4825);
const ROOT = process.cwd();

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.woff2': 'font/woff2',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

const PHOTO = existsSync(join(ROOT, 'src/assets/media/dra/hero.jpg'))
  ? join(ROOT, 'src/assets/media/dra/hero.jpg')
  : join(ROOT, 'src/assets/placeholders/portrait.jpg');

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  if (url.pathname === '/og/photo.jpg') {
    response.writeHead(200, { 'Content-Type': 'image/jpeg' });
    createReadStream(PHOTO).pipe(response);
    return;
  }
  const relative = url.pathname === '/' ? '/scripts/og/template.html' : url.pathname;
  const file = normalize(join(ROOT, relative));
  if (!file.startsWith(ROOT) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404);
    response.end('not found');
    return;
  }
  response.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(response);
});

server.listen(PORT, '127.0.0.1', () => console.log(`og preview em http://127.0.0.1:${PORT}/`));
process.on('SIGTERM', () => server.close());
```

- [ ] **Step 3: Criar `scripts/og/render.sh` e registrar o script npm**

```bash
npm pkg set scripts.og="bash scripts/og/render.sh"
```

```bash
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
```

- [ ] **Step 4: Rodar e conferir as dimensões**

Run: `npm run og`
Expected: termina com `public/og.jpg 1200x630 jpeg`. Se "fonte ausente" aparecer, rode `npm install` (as fontes já são dependência fixa — Global Constraints); se o servidor não responder, confira se a porta 4825 está livre (`OG_PORT=4826 npm run og`).

- [ ] **Step 5: Conferência visual**

```bash
cp .e2e-tmp/og/raw.png .e2e-tmp/og/preview.png 2>/dev/null || true
```

Abra `public/og.jpg` com a ferramenta Read. Esperado: fundo em degradê porcelana → blush → rosado; à esquerda o eyebrow "CLÍNICA LAURA TAVARES — ESTÉTICA AVANÇADA" em Jost maiúsculo espaçado, o título "Rejuvenescer sem deixar de *ser você.*" em Cormorant Garamond (itálico rosewood na parte final) e a assinatura "Laura Tavares" em Pinyon Script, todos em `--ink`/`--brand-rosewood`; à direita a foto da Dra. (real ou placeholder) num arco vertical com sombra suave. Nenhum texto cortado, nenhuma fonte substituída por uma serifada/sans do sistema (indicaria 404 de fonte — revise o Step 4).

- [ ] **Step 6: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde (os arquivos de `scripts/og/` não têm teste próprio — são só orquestração, como `scripts/shot.sh` e `scripts/with-preview.mjs`).

```bash
git add package.json scripts/og public/og.jpg
git commit -m "$(cat <<'EOF'
feat: gera a imagem Open Graph final (1200x630) com fontes reais e foto da Dra.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 33: `docs/CHECKLIST-CLINICA.md` — pendências da spec, do build e da frente de mídia

**Files:**
- Create: `scripts/lib/checklist.mjs`, `scripts/lib/checklist.test.mjs`, `scripts/checklist.mjs`, `docs/CHECKLIST-CLINICA.md` (gerado)
- Modify: `package.json` (script `checklist`)

**Interfaces:**
- Consumes: saída de `npm run build` (linhas `[pendente] ...` de `listPending`, Task 4; linhas `[mídia] placeholder em uso: ...` de `media.reportLines()`, Task 6); `docs/media-pendencias.md` (frente de mídia — seções `## Arquivos dispensados`, `## Avisos`, `## Dados encontrados para o checklist da clínica`, `## Pedidos à clínica`).
- Produces: `extractPendingFields(buildOutput: string): string[]`, `extractPlaceholderSlots(buildOutput: string): string[]`, `extractSection(markdown: string, heading: string): string[]`, `buildChecklist(input: { pendingFields: string[]; placeholderSlots: string[]; mediaDoc: string; date: string }): string`; `node scripts/checklist.mjs` → `docs/CHECKLIST-CLINICA.md`.

- [ ] **Step 1: Escrever o teste que falha — `scripts/lib/checklist.test.mjs`**

```js
import { describe, expect, it } from 'vitest';
import { buildChecklist, extractPendingFields, extractPlaceholderSlots, extractSection } from './checklist.mjs';

const BUILD_OUTPUT = `
[pendente] responsibleTechnician.registration: ...
[mídia] placeholder em uso: dra/hero (esperado src/assets/media/dra/hero.jpg)
[pendente] responsibleTechnician.registration: ...
algo irrelevante
[mídia] placeholder em uso: clinica/sala (esperado src/assets/media/clinica/sala.jpg)
`;

describe('extractPendingFields', () => {
  it('extrai e deduplica as linhas [pendente]', () => {
    expect(extractPendingFields(BUILD_OUTPUT)).toEqual(['responsibleTechnician.registration: ...']);
  });

  it('sem nenhuma linha devolve lista vazia', () => {
    expect(extractPendingFields('build ok\n')).toEqual([]);
  });
});

describe('extractPlaceholderSlots', () => {
  it('extrai os slots em placeholder, na ordem em que aparecem', () => {
    expect(extractPlaceholderSlots(BUILD_OUTPUT)).toEqual([
      'dra/hero (esperado src/assets/media/dra/hero.jpg)',
      'clinica/sala (esperado src/assets/media/clinica/sala.jpg)',
    ]);
  });
});

const MEDIA_DOC = `# Pendências

## Arquivos dispensados

- \`src/assets/media/clinica/equipe.jpg\` — a foto do time ainda não tem autorização.

## Avisos

- Vídeo do Método em 480p (rascunho); finalizar em 1080p antes do deploy.

## Dados encontrados para o checklist da clínica

- Horário: "segunda a sábado, 9h às 19h".

## Pedidos à clínica

- Confirmar o número de registro profissional da Dra.
`;

describe('extractSection', () => {
  it('extrai os bullets de uma seção exata', () => {
    expect(extractSection(MEDIA_DOC, 'Avisos')).toEqual([
      'Vídeo do Método em 480p (rascunho); finalizar em 1080p antes do deploy.',
    ]);
  });

  it('para na próxima ## e ignora linhas que não são bullet', () => {
    expect(extractSection(MEDIA_DOC, 'Arquivos dispensados')).toEqual([
      '`src/assets/media/clinica/equipe.jpg` — a foto do time ainda não tem autorização.',
    ]);
  });

  it('heading inexistente devolve lista vazia', () => {
    expect(extractSection(MEDIA_DOC, 'Não existe')).toEqual([]);
  });
});

describe('buildChecklist', () => {
  it('inclui as 7 pendências da spec, os dados dinâmicos e as 4 seções da mídia', () => {
    const markdown = buildChecklist({
      pendingFields: ['responsibleTechnician.registration: ...'],
      placeholderSlots: ['clinica/sala (esperado src/assets/media/clinica/sala.jpg)'],
      mediaDoc: MEDIA_DOC,
      date: '2026-10-07',
    });
    expect(markdown).toContain('Gerado por `npm run checklist` em 2026-10-07.');
    expect(markdown).toContain('Formação acadêmica da Dra. (uma linha no Sobre).');
    expect(markdown).toContain('- responsibleTechnician.registration: ...');
    expect(markdown).toContain('- clinica/sala (esperado src/assets/media/clinica/sala.jpg)');
    expect(markdown).toContain('### Avisos\n\n- Vídeo do Método em 480p');
    expect(markdown).toContain('### Pedidos à clínica\n\n- Confirmar o número de registro profissional da Dra.');
  });

  it('sem pendências dinâmicas mostra as mensagens de "nenhum"', () => {
    const markdown = buildChecklist({ pendingFields: [], placeholderSlots: [], mediaDoc: '', date: '2026-10-07' });
    expect(markdown).toContain('Nenhum — todos os campos de `site.ts` foram preenchidos.');
    expect(markdown).toContain('Nenhum — todos os slots do contrato de mídia têm arquivo real.');
    expect(markdown).toContain('### Avisos\n\nNenhum.');
  });
});
```

Run: `npm test -- scripts/lib/checklist.test.mjs`
Expected: FAIL com `Failed to resolve import "./checklist.mjs"`.

- [ ] **Step 2: Implementar `scripts/lib/checklist.mjs`**

```js
const PENDING_PREFIX = '[pendente] ';
const PLACEHOLDER_PREFIX = '[mídia] placeholder em uso: ';

function linesWithPrefix(output, prefix) {
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith(prefix))
    .map((line) => line.slice(prefix.length).trim());
}

function dedupe(values) {
  return [...new Set(values)];
}

/** Extrai e deduplica as linhas "[pendente] <campo>" da saída (stdout+stderr) de "npm run build". */
export function extractPendingFields(buildOutput) {
  return dedupe(linesWithPrefix(buildOutput, PENDING_PREFIX));
}

/** Extrai e deduplica os slots ainda em placeholder ("[mídia] placeholder em uso: <slot> ..."). */
export function extractPlaceholderSlots(buildOutput) {
  return dedupe(linesWithPrefix(buildOutput, PLACEHOLDER_PREFIX));
}

/** Bullets ("- ...") sob um "## <heading>" exato, até o próximo "##" ou o fim do arquivo. */
export function extractSection(markdown, heading) {
  const marker = `## ${heading}`;
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => line.trim() === marker);
  if (start === -1) return [];
  const bullets = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (line.startsWith('## ')) break;
    if (line.startsWith('- ')) bullets.push(line.slice(2).trim());
  }
  return bullets;
}

const CLINIC_PENDENCIES = [
  'Profissão, conselho e número de registro da Dra. (rodapé e seção Sobre) — obrigatório antes de publicar em domínio próprio.',
  'Termos de autorização de imagem dos antes/depois e dos depoimentos usados.',
  'Logo em vetor (SVG/PDF) e assinatura real em SVG.',
  'Horário exato de funcionamento e se há estacionamento.',
  'Nome final do método (Protocolo Identidade LT × Método LT) e lista final de tratamentos.',
  'Função do segundo número, (61) 98105-1565.',
  'Formação acadêmica da Dra. (uma linha no Sobre).',
];

const MEDIA_SECTIONS = [
  'Arquivos dispensados',
  'Avisos',
  'Dados encontrados para o checklist da clínica',
  'Pedidos à clínica',
];

function bulletList(items, empty) {
  return items.length > 0 ? items.map((item) => `- ${item}`).join('\n') : empty;
}

/** Monta docs/CHECKLIST-CLINICA.md: spec (fixo) + build + docs/media-pendencias.md (dinâmicos). */
export function buildChecklist({ pendingFields, placeholderSlots, mediaDoc, date }) {
  const sections = MEDIA_SECTIONS.map(
    (heading) => `### ${heading}\n\n${bulletList(extractSection(mediaDoc, heading), 'Nenhum.')}`,
  ).join('\n\n');

  return `# Checklist da clínica — Landing page

> Gerado por \`npm run checklist\` em ${date}. Pendências que a equipe da Clínica Laura Tavares precisa resolver — nenhuma delas bloqueia a entrega das Etapas 6/7.

## 1. Pendências da spec

${bulletList(CLINIC_PENDENCIES, 'Nenhuma.')}

## 2. Campos pendentes no conteúdo do site (\`[pendente]\` no build)

${bulletList(pendingFields, 'Nenhum — todos os campos de `site.ts` foram preenchidos.')}

## 3. Fotos/vídeos ainda em placeholder

${bulletList(placeholderSlots, 'Nenhum — todos os slots do contrato de mídia têm arquivo real.')}

## 4. Da frente de mídia (\`docs/media-pendencias.md\`)

${sections}
`;
}
```

- [ ] **Step 3: Rodar e ver passar**

Run: `npm test -- scripts/lib/checklist.test.mjs`
Expected: PASS — `Tests  8 passed`.

- [ ] **Step 4: Criar `scripts/checklist.mjs` e registrar o script npm**

```bash
npm pkg set scripts.checklist="node scripts/checklist.mjs"
```

```js
// Gera docs/CHECKLIST-CLINICA.md: as 7 pendências da spec (fixas) + os avisos "[pendente]"/"placeholder
// em uso" do build (dinâmicos) + as 4 seções de docs/media-pendencias.md (frente de mídia, dinâmico).
// Uso: npm run checklist
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { buildChecklist, extractPendingFields, extractPlaceholderSlots } from './lib/checklist.mjs';

const build = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], { encoding: 'utf8' });
const output = `${build.stdout ?? ''}\n${build.stderr ?? ''}`;
if (build.status !== 0) {
  console.error('npm run build falhou — corrija antes de gerar o checklist.');
  console.error(output);
  process.exit(1);
}

const mediaDoc = existsSync('docs/media-pendencias.md') ? readFileSync('docs/media-pendencias.md', 'utf8') : '';
if (mediaDoc === '') {
  console.warn('docs/media-pendencias.md não encontrado — a seção 4 do checklist ficará vazia.');
}

const markdown = buildChecklist({
  pendingFields: extractPendingFields(output),
  placeholderSlots: extractPlaceholderSlots(output),
  mediaDoc,
  date: new Date().toISOString().slice(0, 10),
});

writeFileSync('docs/CHECKLIST-CLINICA.md', markdown);
console.log('docs/CHECKLIST-CLINICA.md atualizado.');
```

- [ ] **Step 5: Rodar e inspecionar o resultado**

Run: `npm run checklist && cat docs/CHECKLIST-CLINICA.md`
Expected: arquivo com as 4 seções numeradas; a seção 2 e 3 vazias ("Nenhum — ...") se a Task 31 já integrou tudo, ou listando os campos/slots que ainda restarem; a seção 4 reproduzindo os avisos/pedidos reais de `docs/media-pendencias.md`.

- [ ] **Step 6: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add package.json scripts/checklist.mjs scripts/lib/checklist.mjs scripts/lib/checklist.test.mjs docs/CHECKLIST-CLINICA.md
git commit -m "$(cat <<'EOF'
docs: gera o checklist da clínica a partir da spec, do build e da frente de mídia

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 34: Fechamento da Etapa 6 — executada pelo orquestrador

> **Executada pelo ORQUESTRADOR.** Ele acrescenta ao corpo do PR e à mensagem do commit de squash as linhas de atribuição exigidas pela sessão dele.

- [ ] **Step 1: Gate completo na branch**

Run: `npm run check && npm run lighthouse`
Expected: lint, typecheck, testes, build e testes de dist verdes; `docs/qa/lighthouse.md` com `Resultado: **aprovado**` para `home` e `politica-de-privacidade`. Commite `docs/qa/lighthouse.md` se mudou (`docs: resumo do Lighthouse da Etapa 6`, com a linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).

- [ ] **Step 2: Push e PR**

```bash
git push -u origin feat/integracao-midia
mkdir -p .e2e-tmp
cat > .e2e-tmp/pr-body.md <<'EOF'
## Resumo
- Integração das mídias reais: auditoria do relatório do build (`media.reportLines()`) — sem arquivo ignorado/duplicado; placeholders restantes só onde `docs/media-pendencias.md` explica a falta; enquadramento (`MEDIA_POSITION`) ajustado onde a foto real pedia.
- Texturas de apoio opcionais (`media.support`) no Hero (`luz-arco`), Na mídia (`textura-seda-blush`), Resultados (`textura-marmore-champagne`) e Depoimentos (`petalas-rosa`) — discretas, somem sem quebrar nada se o arquivo não existir.
- Vídeos do Método e do CTA final confirmados (tocam ao entrar na viewport quando `public/media/metodo.*`/`cta-final.*` já chegaram).
- Imagem Open Graph final (1200×630) com as fontes reais e a foto da Dra., substituindo a provisória da Task 6.
- `docs/CHECKLIST-CLINICA.md` gerado a partir da spec, do build e de `docs/media-pendencias.md`.

## Checklist de validação
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`
- [x] `npm run test:dist`
- [x] `npm run lighthouse` — mobile ≥ 90 nas 4 categorias (`docs/qa/lighthouse.md`)
- [x] Revisões por subagente (especificação + qualidade) aprovadas nas Tasks 31–33

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
gh pr create --base main --head feat/integracao-midia --title "feat: integra as mídias reais, OG final e checklist da clínica" --body-file .e2e-tmp/pr-body.md
```

- [ ] **Step 3: Merge squash e volta para a main**

```bash
gh pr merge feat/integracao-midia --squash --delete-branch --subject "feat: integra as mídias reais, OG final e checklist da clínica"
git checkout main && git pull --ff-only
```

- [ ] **Step 4: Atualizar `docs/HANDOFF.md`**

Em `## Estado`, troque a linha `- Etapa 6 (integração das mídias reais) aguarda o merge da frente de mídia; Etapa 7 (QA e deploy) depois dela.` por:

```markdown
- **Etapa 6 — integração das mídias reais (`feat/integracao-midia`): concluída e mergeada na `main`.** Fotos/vídeos reais plugados no resolvedor da Task 6 (auditoria sem arquivo ignorado/duplicado); texturas de apoio opcionais no Hero, Na mídia, Resultados e Depoimentos; `public/og.jpg` final (fontes reais + foto da Dra.); `docs/CHECKLIST-CLINICA.md` gerado.
- Etapa 7 (QA e deploy): pendente.
```

Em `## Decisões`, acrescente:

```markdown
- Texturas de apoio (`media.support`) aplicadas em 4 das 6 imagens de apoio possíveis (`luz-arco` no Hero, `textura-seda-blush` em Na mídia, `textura-marmore-champagne` em Resultados, `petalas-rosa` em Depoimentos), opacidade baixa (0,16–0,22) e sempre opcionais; `gotas-serum` e `orquideas-marmore` ficam disponíveis para uso futuro (não usadas nesta etapa).
- Imagem Open Graph final renderizada por agent-browser (template HTML com as fontes `@fontsource` reais, servido por `scripts/og/serve.mjs`) + sharp — não é screenshot do site real, para não depender do JS/CSS completo da página só para gerar a OG.
- `docs/CHECKLIST-CLINICA.md` é gerado por `npm run checklist`, não escrito à mão — fica sempre sincronizado com o build e com `docs/media-pendencias.md`.
```

Em `## Próximo passo`, troque o item por `- Etapa 7 — \`feat/qa-deploy\`: Task 35 do plano.` e então:

```bash
git add docs/HANDOFF.md
git commit -m "$(cat <<'EOF'
docs: atualiza HANDOFF após a Etapa 6

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

## Etapa 7 — `feat/qa-deploy`

> Antes da Task 35: `git checkout main && git pull --ff-only && git checkout -b feat/qa-deploy`.
>
> **Regras desta etapa:** nenhuma task desta etapa cria ou edita arquivos sob `src/assets/media/**`, `public/media/**` ou os JSON da mídia (Global Constraint da linha 30); a partir da Task 36, `npm run check` passa a incluir `csp:check` — toda task seguinte (37, 39, 40) deve continuar passando nesse gate ampliado.

### Task 35: Suíte e2e com agent-browser (`npm run e2e`)

**Files:**
- Create: `scripts/e2e.sh`, `scripts/e2e-check-logs.mjs`, `scripts/lib/browser-logs.mjs`, `scripts/lib/browser-logs.test.mjs`, `docs/qa/e2e.md` (gerado)
- Modify: `package.json` (script `e2e`)

**Interfaces:**
- Consumes: `BASE_URL` (via `scripts/with-preview.mjs`, Task 8); agent-browser 0.27 (`--json console`, `network route`, `set media`, `eval --stdin`); `node_modules/axe-core/axe.min.js` (dependência fixa — Tech Stack); seletores já existentes: `[data-nav-open]`/`[data-nav-menu]`/`[data-nav-close]` (Task 11), `[data-ba-range]` (Task 16), `details.faq__item > summary` (Task 23), `[data-reveal]`/`html.js` (Task 26), `a[data-wa-origin]` (Global Constraints).
- Produces (`scripts/lib/browser-logs.mjs`): `consoleMessages(raw)`, `consoleErrors(raw)`, `invalidCtaHrefs(hrefsByOrigin: Record<string, string | null>): string[]`, `blockingAxeViolations(raw)`, `describeViolation(violation)`, `readBoolean(raw): boolean`, `toE2eMarkdown(checks: Array<{ name: string; pass: boolean; detail?: string }>, { date }): string`; `node scripts/e2e-check-logs.mjs <dir> <qaDir>`; `npm run e2e` → `docs/qa/e2e.md` (sai com 1 se algo falhou).

- [ ] **Step 1: Escrever o teste que falha — `scripts/lib/browser-logs.test.mjs`**

```js
import { describe, expect, it } from 'vitest';
import {
  blockingAxeViolations,
  consoleErrors,
  describeViolation,
  invalidCtaHrefs,
  readBoolean,
  toE2eMarkdown,
} from './browser-logs.mjs';

const CONSOLE_JSON = JSON.stringify({
  data: {
    messages: [
      { type: 'log', text: 'oi' },
      { type: 'error', text: 'TypeError: x' },
      { type: 'warning', text: 'cuidado' },
    ],
  },
});

describe('consoleErrors', () => {
  it('filtra só as mensagens de erro (warning não bloqueia)', () => {
    expect(consoleErrors(CONSOLE_JSON)).toEqual([{ type: 'error', text: 'TypeError: x' }]);
  });

  it('sem mensagens devolve lista vazia', () => {
    expect(consoleErrors(JSON.stringify({ data: { messages: [] } }))).toEqual([]);
  });
});

describe('invalidCtaHrefs', () => {
  it('aceita hrefs do WhatsApp com o número certo e mensagem não vazia', () => {
    expect(invalidCtaHrefs({ hero: 'https://api.whatsapp.com/send?phone=5561981007522&text=Ola' })).toEqual([]);
  });

  it('rejeita href ausente, número errado ou mensagem vazia', () => {
    expect(
      invalidCtaHrefs({
        hero: null,
        floating: 'https://api.whatsapp.com/send?phone=5561981007522&text=',
        treatment: 'https://api.whatsapp.com/send?phone=0000000000000&text=Ola',
        final: 'https://api.whatsapp.com/send?phone=5561981007522&text=Ola',
      }),
    ).toEqual(['hero', 'floating', 'treatment']);
  });
});

const AXE_JSON = JSON.stringify({
  violations: [
    { id: 'color-contrast', impact: 'serious', description: 'Contraste insuficiente', nodes: [1, 2] },
    { id: 'region', impact: 'moderate', description: 'Conteúdo fora de landmark', nodes: [1] },
    { id: 'image-alt', impact: 'critical', description: 'Imagem sem alt', nodes: [1] },
  ],
});

describe('blockingAxeViolations', () => {
  it('mantém só serious e critical', () => {
    expect(blockingAxeViolations(AXE_JSON).map((violation) => violation.id)).toEqual([
      'color-contrast',
      'image-alt',
    ]);
  });

  it('sem violações devolve lista vazia', () => {
    expect(blockingAxeViolations(JSON.stringify({ violations: [] }))).toEqual([]);
  });
});

describe('describeViolation', () => {
  it('formata impacto, id, descrição e quantidade de elementos', () => {
    expect(
      describeViolation({ impact: 'serious', id: 'color-contrast', description: 'Contraste insuficiente', nodes: [1, 2] }),
    ).toBe('serious: color-contrast — Contraste insuficiente (2 elemento(s))');
  });
});

describe('readBoolean', () => {
  it('lê true/false de "agent-browser eval", com ou sem aspas/quebra de linha', () => {
    expect(readBoolean('true\n')).toBe(true);
    expect(readBoolean('"false"\n')).toBe(false);
    expect(readBoolean('false')).toBe(false);
  });
});

describe('toE2eMarkdown', () => {
  it('marca aprovado quando tudo passa', () => {
    const markdown = toE2eMarkdown([{ name: 'console sem erros', pass: true }], { date: '2026-10-07' });
    expect(markdown).toContain('| console sem erros | OK |');
    expect(markdown).toContain('Resultado: **aprovado**');
  });

  it('lista o que falhou, com o detalhe', () => {
    const markdown = toE2eMarkdown(
      [
        { name: 'console sem erros', pass: true },
        { name: 'axe-core', pass: false, detail: 'serious: color-contrast — ... (2 elemento(s))' },
      ],
      { date: '2026-10-07' },
    );
    expect(markdown).toContain('FALHOU — serious: color-contrast');
    expect(markdown).toContain('Resultado: **reprovado** — axe-core.');
  });
});
```

Run: `npm test -- scripts/lib/browser-logs.test.mjs`
Expected: FAIL com `Failed to resolve import "./browser-logs.mjs"`.

- [ ] **Step 2: Implementar `scripts/lib/browser-logs.mjs`**

```js
const BLOCKING_IMPACT = new Set(['serious', 'critical']);
const WHATSAPP_NUMBER = '5561981007522';

/** Mensagens de console do JSON de "agent-browser --json console" (formato: { data: { messages: [...] } }). */
export function consoleMessages(raw) {
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  return parsed?.data?.messages ?? [];
}

/** Só as mensagens de erro — warnings não bloqueiam o e2e. */
export function consoleErrors(raw) {
  return consoleMessages(raw).filter((message) => message.type === 'error');
}

/** Origens cujo href não é um link do WhatsApp válido (número certo + mensagem não vazia). */
export function invalidCtaHrefs(hrefsByOrigin) {
  return Object.entries(hrefsByOrigin)
    .filter(([, href]) => {
      if (!href) return true;
      try {
        const url = new URL(href);
        return url.searchParams.get('phone') !== WHATSAPP_NUMBER || !url.searchParams.get('text');
      } catch {
        return true;
      }
    })
    .map(([origin]) => origin);
}

/** Violações bloqueantes (serious/critical) do resultado de axe.run(); moderate/minor não bloqueiam. */
export function blockingAxeViolations(raw) {
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  return (parsed?.violations ?? []).filter((violation) => BLOCKING_IMPACT.has(violation.impact));
}

/** Uma linha por violação, para o relatório e para a mensagem de erro do e2e. */
export function describeViolation(violation) {
  return `${violation.impact}: ${violation.id} — ${violation.description} (${violation.nodes.length} elemento(s))`;
}

/** true/false gravado por "agent-browser eval" (texto "true"/"false", com ou sem aspas/quebra de linha). */
export function readBoolean(raw) {
  return raw.trim().replace(/^"|"$/g, '') === 'true';
}

/** Markdown de docs/qa/e2e.md a partir dos resultados de cada verificação. */
export function toE2eMarkdown(checks, { date }) {
  const lines = [
    '# e2e (agent-browser + axe-core)',
    '',
    `Gerado em ${date} contra o preview (local ou publicado). Capturas em \`docs/qa/\`.`,
    '',
    '| Verificação | Resultado |',
    '|---|---|',
  ];
  for (const check of checks) {
    lines.push(`| ${check.name} | ${check.pass ? 'OK' : `FALHOU — ${check.detail ?? ''}`} |`);
  }
  const failing = checks.filter((check) => !check.pass);
  lines.push('');
  lines.push(
    failing.length === 0
      ? 'Resultado: **aprovado** (todas as verificações passaram).'
      : `Resultado: **reprovado** — ${failing.map((check) => check.name).join(', ')}.`,
  );
  return `${lines.join('\n')}\n`;
}
```

- [ ] **Step 3: Rodar e ver passar**

Run: `npm test -- scripts/lib/browser-logs.test.mjs`
Expected: PASS — `Tests  10 passed`.

- [ ] **Step 4: Criar `scripts/e2e-check-logs.mjs`**

```js
// Lê os artefatos capturados por scripts/e2e.sh em <dir>, monta docs/qa/e2e.md e sai com 1 se algo falhou.
// Uso: node scripts/e2e-check-logs.mjs <dir> <qaDir>   (chamado pelo próprio scripts/e2e.sh)
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  blockingAxeViolations,
  consoleErrors,
  describeViolation,
  invalidCtaHrefs,
  readBoolean,
  toE2eMarkdown,
} from './lib/browser-logs.mjs';

const [, , dir, qaDir] = process.argv;
if (!dir || !qaDir) {
  console.error('Uso: node scripts/e2e-check-logs.mjs <dir> <qaDir>');
  process.exit(2);
}

const read = (file) => readFileSync(join(dir, file), 'utf8');
const checks = [];

const errors = consoleErrors(read('console.json'));
checks.push({
  name: 'console sem erros',
  pass: errors.length === 0,
  detail: errors.map((error) => error.text).join('; '),
});

const badCtas = invalidCtaHrefs(JSON.parse(read('cta-hrefs.json')));
checks.push({ name: 'CTAs do WhatsApp (amostra)', pass: badCtas.length === 0, detail: badCtas.join(', ') });

checks.push({ name: 'menu mobile abre', pass: readBoolean(read('menu-open.json')) });
checks.push({ name: 'menu mobile fecha (Esc)', pass: readBoolean(read('menu-closed.json')) });
checks.push({ name: 'FAQ abre pelo clique/teclado', pass: readBoolean(read('faq-open.json')) });

const sliderBefore = read('slider-before.txt').trim();
const sliderAfter = read('slider-after.txt').trim();
checks.push({
  name: 'slider antes/depois responde ao teclado',
  pass: sliderBefore !== sliderAfter,
  detail: `${sliderBefore} → ${sliderAfter}`,
});

for (const width of [320, 375]) {
  checks.push({ name: `sem rolagem horizontal em ${width}px`, pass: readBoolean(read(`no-scroll-${width}.txt`)) });
}

checks.push({ name: 'movimento reduzido: conteúdo visível', pass: readBoolean(read('reduced-motion.json')) });
checks.push({
  name: 'scripts bloqueados: failsafe de 4s revela o conteúdo',
  pass: readBoolean(read('no-js-visible.json')),
});

for (const page of ['home', 'privacidade']) {
  const violations = blockingAxeViolations(read(`axe-${page}.json`));
  checks.push({
    name: `axe-core sem violações serious/critical (${page})`,
    pass: violations.length === 0,
    detail: violations.map(describeViolation).join('; '),
  });
}

const markdown = toE2eMarkdown(checks, { date: new Date().toISOString().slice(0, 10) });
writeFileSync(join(qaDir, 'e2e.md'), markdown);
console.log(markdown);
process.exit(checks.some((check) => !check.pass) ? 1 : 0);
```

- [ ] **Step 5: Criar `scripts/e2e.sh` e registrar o script npm**

```bash
npm pkg set scripts.e2e="node scripts/with-preview.mjs bash scripts/e2e.sh"
```

```bash
#!/usr/bin/env bash
# Suíte e2e completa: capturas, console, CTAs, menu mobile, FAQ, slider por teclado, sem rolagem
# horizontal em 320/375 (Review Focus 4), movimento reduzido, scripts bloqueados + failsafe de 4s
# (Review Focus 5) e axe-core. Uso: npm run build && npm run e2e
set -euo pipefail

BASE_URL="${BASE_URL:?defina BASE_URL (rode via "npm run e2e", que usa scripts/with-preview.mjs)}"
OUT=".e2e-tmp/e2e"
QA="docs/qa"
AB=(agent-browser --session lt-e2e)
mkdir -p "$OUT" "$QA"
"${AB[@]}" close >/dev/null 2>&1 || true

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
step "CTAs do WhatsApp (amostra)"
"${AB[@]}" eval --stdin > "$OUT/cta-hrefs.json" <<'JS'
JSON.stringify(Object.fromEntries(
  ['hero', 'floating', 'treatment', 'final'].map((origin) => [
    origin,
    document.querySelector(`a[data-wa-origin="${origin}"]`)?.getAttribute('href') ?? null,
  ]),
))
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
step "movimento reduzido"
"${AB[@]}" set viewport 1280 900 >/dev/null
"${AB[@]}" set media light reduced-motion >/dev/null
"${AB[@]}" open "$BASE_URL" >/dev/null
"${AB[@]}" wait --load networkidle >/dev/null
"${AB[@]}" eval "JSON.stringify([...document.querySelectorAll('[data-reveal]')].every((el) => getComputedStyle(el).opacity === '1'))" > "$OUT/reduced-motion.json"
"${AB[@]}" set media no-preference >/dev/null 2>&1 || true

# 9) Scripts bloqueados -> failsafe de 4s revela o conteúdo (Review Focus 5) -------
step "scripts bloqueados (failsafe de 4s)"
"${AB[@]}" close >/dev/null
"${AB[@]}" open >/dev/null
"${AB[@]}" network route "*" --abort --resource-type script >/dev/null
"${AB[@]}" set viewport 1280 900 >/dev/null
"${AB[@]}" open "$BASE_URL" >/dev/null
"${AB[@]}" wait --load domcontentloaded >/dev/null
"${AB[@]}" wait 4300 >/dev/null
"${AB[@]}" eval "JSON.stringify([...document.querySelectorAll('[data-reveal]')].every((el) => getComputedStyle(el).opacity === '1') && !document.documentElement.classList.contains('js'))" > "$OUT/no-js-visible.json"
"${AB[@]}" network unroute >/dev/null

# 10) axe-core sem violações serious/critical --------------------------------------
step "axe-core"
"${AB[@]}" close >/dev/null
"${AB[@]}" open "$BASE_URL" --init-script node_modules/axe-core/axe.min.js >/dev/null
"${AB[@]}" wait --load networkidle >/dev/null
"${AB[@]}" eval --stdin > "$OUT/axe-home.json" <<'JS'
(async () => JSON.stringify(await axe.run()))()
JS
"${AB[@]}" open "${BASE_URL%/}/politica-de-privacidade" --init-script node_modules/axe-core/axe.min.js >/dev/null
"${AB[@]}" wait --load networkidle >/dev/null
"${AB[@]}" eval --stdin > "$OUT/axe-privacidade.json" <<'JS'
(async () => JSON.stringify(await axe.run()))()
JS

"${AB[@]}" close >/dev/null

# Interpretação + relatório (lógica pura em scripts/lib/browser-logs.mjs) -----------
node scripts/e2e-check-logs.mjs "$OUT" "$QA"
```

- [ ] **Step 6: Rodar a suíte completa**

Run: `npm run build && npm run e2e`
Expected: termina imprimindo a tabela do `docs/qa/e2e.md` e `Resultado: **aprovado**`; código de saída 0. As capturas `docs/qa/home-{375,768,1280,1440}.png` e `docs/qa/menu-mobile-375.png` existem.

Se algo falhar: `slider antes/depois` — confirme que `[data-ba-range]` existe e recebe foco (Task 16); `FAQ` — confirme que a 3ª pergunta do copy é mesmo "Dói?" (`site.faq.items[2]`, Task 7); `scripts bloqueados` — confirme que o `<script is:inline>` da Task 26 não tem `src` (senão a rede o bloquearia também); `axe-core` — abra `docs/qa/e2e.md` e corrija a violação listada antes de seguir.

- [ ] **Step 7: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add package.json scripts/e2e.sh scripts/e2e-check-logs.mjs scripts/lib/browser-logs.mjs scripts/lib/browser-logs.test.mjs docs/qa
git commit -m "$(cat <<'EOF'
test: suíte e2e com agent-browser, axe-core e relatório em docs/qa/e2e.md

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 36: `vercel.json` com cabeçalhos de segurança e CSP gerado a partir do `dist`

**Files:**
- Create: `scripts/lib/csp.mjs`, `scripts/lib/csp.test.mjs`, `scripts/csp.mjs`, `vercel.json` (gerado pelo script)
- Modify: `package.json` (scripts `csp`, `csp:check`; `check` passa a incluir `csp:check`)

**Interfaces:**
- Consumes: `dist/index.html`, `dist/politica-de-privacidade.html` (saída de `npm run build`, Tasks 2/24).
- Produces: `sha256Base64(text: string): string`, `cspHash(text: string): string`, `isExecutableScriptType(type: string | null): boolean`, `collectInlineScriptHashes(html: string): string[]`, `buildCsp(hashes: string[]): string`; `node scripts/csp.mjs` (grava `vercel.json`) e `node scripts/csp.mjs --check` (confere; sai com 1 se desatualizado).

> **O que o build realmente produz (inspecionado antes de escrever o CSP):** um único `<script>` inline executável por página — o failsafe `html.js` da Task 26, sem `src` e sem `type` — todo o resto de JS é `<script type="module" src="...">` externo (Global Constraints, linha 549). Os blocos `<script type="application/ld+json">` (Task 7) não são JavaScript: CSP `script-src` não os governa, então não entram nos hashes. O único atributo de estilo inline do projeto é `style="object-position: ..."` nas fotos de mídia (Global Constraints, linha 24; 6 ocorrências, todas o mesmo padrão) — liberado por `style-src-attr`, não por `style-src`, para manter `style-src` estrito.

> **Vercel `cleanUrls` (emenda da revisão final da Etapa 1):** com `build.format: 'file'` (Task 2) o build gera `dist/politica-de-privacidade.html`, mas canonical, sitemap e rodapé linkam `/politica-de-privacidade` sem `.html` (Tasks 7/24). Isso só resolve na Vercel com `"cleanUrls": true` no `vercel.json` — sem ele, essa URL dá 404 em produção. `trailingSlash: false` acompanha, para a Vercel não discordar do `trailingSlash: 'never'` do Astro (Task 2). Por isso `scripts/csp.mjs` (Step 4 abaixo) também grava essas duas chaves no `vercel.json`, e `--check` as confere junto com o CSP.

- [ ] **Step 1: Escrever o teste que falha — `scripts/lib/csp.test.mjs`**

```js
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { buildCsp, collectInlineScriptHashes, cspHash, isExecutableScriptType, sha256Base64 } from './csp.mjs';

describe('sha256Base64', () => {
  it('calcula o SHA-256 em base64 do texto em UTF-8 (mesmo algoritmo que o navegador usa no CSP)', () => {
    const text = "document.documentElement.classList.add('js');";
    expect(sha256Base64(text)).toBe(createHash('sha256').update(text, 'utf8').digest('base64'));
  });
});

describe('cspHash', () => {
  it('formata como fonte do CSP, entre aspas simples', () => {
    expect(cspHash('a')).toBe(`'sha256-${sha256Base64('a')}'`);
  });
});

describe('isExecutableScriptType', () => {
  it('considera JS os tipos vazio, text/javascript e module', () => {
    expect(isExecutableScriptType(null)).toBe(true);
    expect(isExecutableScriptType('')).toBe(true);
    expect(isExecutableScriptType('text/javascript')).toBe(true);
    expect(isExecutableScriptType('module')).toBe(true);
  });

  it('não considera JSON-LD, JSON nem import maps', () => {
    expect(isExecutableScriptType('application/ld+json')).toBe(false);
    expect(isExecutableScriptType('application/json')).toBe(false);
    expect(isExecutableScriptType('importmap')).toBe(false);
  });
});

describe('collectInlineScriptHashes', () => {
  it('ignora scripts com src (externos) e o bloco application/ld+json', () => {
    const html = `<!doctype html><html><head>
      <script>document.documentElement.classList.add('js');</script>
      <script type="application/ld+json">{"a":1}</script>
      <script type="module" src="/_astro/hoisted.ABC.js"></script>
    </head><body></body></html>`;
    expect(collectInlineScriptHashes(html)).toEqual([cspHash("document.documentElement.classList.add('js');")]);
  });

  it('deduplica hashes iguais entre vários scripts inline', () => {
    const html = '<script>const a = 1;</script><script>const a = 1;</script>';
    expect(collectInlineScriptHashes(html)).toHaveLength(1);
  });

  it('sem nenhum script inline executável devolve lista vazia', () => {
    expect(collectInlineScriptHashes('<html><head></head><body></body></html>')).toEqual([]);
  });
});

describe('buildCsp', () => {
  it('inclui self e os hashes em script-src; libera o atributo de estilo sem afastar o style-src', () => {
    const csp = buildCsp([cspHash('x')]);
    expect(csp).toContain(`script-src 'self' ${cspHash('x')}`);
    expect(csp).toContain("style-src 'self';");
    expect(csp).toContain("style-src-attr 'unsafe-inline'");
    expect(csp).not.toContain("style-src 'self' 'unsafe-inline'");
  });

  it('sem hashes ainda assim produz script-src só com self', () => {
    expect(buildCsp([])).toContain("script-src 'self';");
  });
});
```

Run: `npm test -- scripts/lib/csp.test.mjs`
Expected: FAIL com `Failed to resolve import "./csp.mjs"`.

- [ ] **Step 2: Implementar `scripts/lib/csp.mjs`**

```js
import { createHash } from 'node:crypto';
import { parseHTML } from 'linkedom';

const NON_EXECUTABLE_TYPES = new Set(['application/ld+json', 'application/json', 'importmap', 'speculationrules']);

/** SHA-256 em base64 (UTF-8) — mesmo cálculo que o navegador usa para validar um 'sha256-...' do CSP. */
export function sha256Base64(text) {
  return createHash('sha256').update(text, 'utf8').digest('base64');
}

/** Formata como fonte do CSP: 'sha256-<base64>'. */
export function cspHash(text) {
  return `'sha256-${sha256Base64(text)}'`;
}

/** true para tipos que o navegador executa como JavaScript (vazio, text/javascript, module, ...). */
export function isExecutableScriptType(type) {
  const value = (type ?? '').trim().toLowerCase();
  return value === '' || !NON_EXECUTABLE_TYPES.has(value);
}

/** Hashes (deduplicados, ordenados) de todo <script> inline executável (sem src) de uma página. */
export function collectInlineScriptHashes(html) {
  const { document } = parseHTML(html);
  const hashes = new Set();
  for (const script of document.querySelectorAll('script')) {
    if (script.hasAttribute('src')) continue;
    if (!isExecutableScriptType(script.getAttribute('type'))) continue;
    hashes.add(cspHash(script.textContent ?? ''));
  }
  return [...hashes].sort();
}

/**
 * CSP do site: só 'self' + os hashes de script inline encontrados no dist. style-src-attr libera o
 * atributo `style="object-position: ..."` das fotos de mídia sem afrouxar style-src (sem 'unsafe-inline').
 * Sem formulário (LGPD): form-action 'none'. Sem plugins/base tag injection: object-src/base-uri estritos.
 */
export function buildCsp(hashes) {
  const scriptSrc = ["'self'", ...hashes].join(' ');
  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self'",
    "style-src-attr 'unsafe-inline'",
    "img-src 'self'",
    "font-src 'self'",
    "media-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}
```

- [ ] **Step 3: Rodar e ver passar**

Run: `npm test -- scripts/lib/csp.test.mjs`
Expected: PASS — `Tests  9 passed`.

- [ ] **Step 4: Criar `scripts/csp.mjs`**

```js
// Gera (ou confere, com --check) o Content-Security-Policy do vercel.json a partir do que o build
// realmente produziu em dist/. Uso:
//   npm run build && npm run csp          grava vercel.json
//   npm run build && npm run csp:check    confere; sai com 1 se vercel.json estiver desatualizado
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { buildCsp, collectInlineScriptHashes } from './lib/csp.mjs';

const PAGES = ['dist/index.html', 'dist/politica-de-privacidade.html'];
const VERCEL_JSON = 'vercel.json';
const SOURCE = '/(.*)';

const EXTRA_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};

function computeCsp() {
  const missing = PAGES.filter((page) => !existsSync(page));
  if (missing.length > 0) {
    console.error(`dist/ incompleto: ${missing.join(', ')} não encontrado(s) — rode "npm run build" antes.`);
    process.exit(2);
  }
  const hashes = [...new Set(PAGES.flatMap((page) => collectInlineScriptHashes(readFileSync(page, 'utf8'))))].sort();
  return buildCsp(hashes);
}

function headerBlock(csp) {
  return {
    source: SOURCE,
    headers: [
      { key: 'Content-Security-Policy', value: csp },
      ...Object.entries(EXTRA_HEADERS).map(([key, value]) => ({ key, value })),
    ],
  };
}

function loadVercelJson() {
  return existsSync(VERCEL_JSON) ? JSON.parse(readFileSync(VERCEL_JSON, 'utf8')) : { headers: [] };
}

const csp = computeCsp();

if (process.argv.includes('--check')) {
  if (!existsSync(VERCEL_JSON)) {
    console.error('vercel.json não encontrado — rode "npm run csp" primeiro.');
    process.exit(1);
  }
  const current = loadVercelJson();
  const block = current.headers?.find((entry) => entry.source === SOURCE);
  const currentCsp = block?.headers?.find((header) => header.key === 'Content-Security-Policy')?.value;
  const problems = [];
  if (currentCsp !== csp) {
    problems.push(`CSP desatualizado.\n  Esperado: ${csp}\n  Atual:    ${currentCsp ?? '(ausente)'}`);
  }
  if (current.cleanUrls !== true) {
    problems.push(
      `cleanUrls deveria ser true (atual: ${JSON.stringify(current.cleanUrls)}) — sem ele, /politica-de-privacidade (canonical/sitemap/rodapé) dá 404 na Vercel.`,
    );
  }
  if (current.trailingSlash !== false) {
    problems.push(`trailingSlash deveria ser false (atual: ${JSON.stringify(current.trailingSlash)}).`);
  }
  if (problems.length > 0) {
    console.error('vercel.json desatualizado. Rode "npm run csp" e commite o arquivo.');
    for (const problem of problems) console.error(problem);
    process.exit(1);
  }
  console.log('CSP, cleanUrls e trailingSlash em dia com o dist/ atual.');
  process.exit(0);
}

const data = loadVercelJson();
data.headers = [headerBlock(csp), ...(data.headers ?? []).filter((entry) => entry.source !== SOURCE)];
// cleanUrls: true é o que resolve /politica-de-privacidade (sem .html) na Vercel — o build
// (format: 'file', Task 2) gera dist/politica-de-privacidade.html, mas canonical/sitemap/rodapé
// (Tasks 7/24) linkam sem extensão. trailingSlash: false acompanha o trailingSlash: 'never' do Astro.
data.cleanUrls = true;
data.trailingSlash = false;
writeFileSync(VERCEL_JSON, `${JSON.stringify(data, null, 2)}\n`);
console.log(
  `vercel.json atualizado — script-src com ${csp.match(/sha256-/g)?.length ?? 0} hash(es); cleanUrls e trailingSlash ajustados.`,
);
```

- [ ] **Step 5: Registrar os scripts npm e incluir `csp:check` no gate**

```bash
npm pkg set scripts.csp="node scripts/csp.mjs"
npm pkg set scripts.csp:check="node scripts/csp.mjs --check"
npm pkg set scripts.check="npm run lint && npm run typecheck && npm test && npm run build && npm run test:dist && npm run csp:check"
```

- [ ] **Step 6: Gerar o `vercel.json` e confirmar que o `--check` fica em dia**

Run: `npm run build && npm run csp && npm run csp:check`
Expected: a primeira chamada imprime `vercel.json atualizado — script-src com 1 hash(es); cleanUrls e trailingSlash ajustados.`; a segunda imprime `CSP, cleanUrls e trailingSlash em dia com o dist/ atual.` e sai com 0. Abra `vercel.json` com a ferramenta Read: `cleanUrls` é `true` e `trailingSlash` é `false` (sem isso, `/politica-de-privacidade` — o link que canonical, sitemap e rodapé usam, Tasks 7/24 — dá 404 na Vercel, já que o build gera `dist/politica-de-privacidade.html` com extensão); `headers[0].source` é `/(.*)` e traz os 5 cabeçalhos (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).

- [ ] **Step 7: Gate completo da tarefa (agora com `csp:check`) e commit**

Run: `npm run check`
Expected: lint, typecheck, testes, build, testes de dist e `csp:check` verdes, na mesma ordem (o `build` roda antes do `csp:check`, então o `dist/` já existe quando ele checa).

```bash
git add package.json scripts/csp.mjs scripts/lib/csp.mjs scripts/lib/csp.test.mjs vercel.json
git commit -m "$(cat <<'EOF'
feat: vercel.json com cabeçalhos de segurança e CSP gerado a partir do dist

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 37: Lighthouse final e relatório de QA consolidado

**Files:**
- Create: `docs/qa/README.md` (gerado)
- Modify: nenhum arquivo de código (tarefa só de verificação e documentação)

**Interfaces:**
- Consumes: `npm run check` (Tasks 2–36), `npm run lighthouse` → `docs/qa/lighthouse.md` (Task 8), `npm run e2e` → `docs/qa/e2e.md` (Task 35).
- Produces: `docs/qa/README.md` (índice consolidado; não duplica os números — referencia e reproduz só a linha `Resultado:` de cada relatório).

- [ ] **Step 1: Gate completo (lint, typecheck, testes, build, testes de dist, CSP)**

Run: `npm run check`
Expected: tudo verde, incluindo `csp:check` (Task 36).

- [ ] **Step 2: Lighthouse final (com mídia real e cabeçalhos de segurança já no código)**

Run: `npm run lighthouse`
Expected: `docs/qa/lighthouse.md` com `Resultado: **aprovado**` para `home` e `politica-de-privacidade`. Se Performance cair por causa das fotos reais da Task 31, confira `docs/qa/lighthouse/home.json` (`largest-contentful-paint-element`, `uses-responsive-images`) antes de prosseguir — não ajuste o CSP para "resolver" uma queda de Performance, são preocupações independentes.

- [ ] **Step 3: e2e final**

Run: `npm run e2e`
Expected: `docs/qa/e2e.md` com `Resultado: **aprovado**` (todas as verificações da Task 35 passando com o CSP e a mídia real já em vigor).

- [ ] **Step 4: Gerar `docs/qa/README.md`**

```bash
cat > docs/qa/README.md <<'EOF'
# QA — Landing Clínica Laura Tavares

Relatório consolidado da Etapa 7. Os dados brutos ficam em `docs/qa/lighthouse.md` (Lighthouse
mobile, 4 categorias) e `docs/qa/e2e.md` (agent-browser + axe-core); os JSON brutos do Lighthouse
ficam em `docs/qa/lighthouse/` (fora do git, por `.gitignore`).

## Lighthouse mobile

EOF
grep '^Gerado em' docs/qa/lighthouse.md >> docs/qa/README.md
echo >> docs/qa/README.md
grep '^Resultado:' docs/qa/lighthouse.md >> docs/qa/README.md
cat >> docs/qa/README.md <<'EOF'

Tabela completa por página: [`lighthouse.md`](./lighthouse.md).

## agent-browser + axe-core (e2e)

EOF
grep '^Resultado:' docs/qa/e2e.md >> docs/qa/README.md
cat >> docs/qa/README.md <<'EOF'

Checklist completo e capturas (`home-{375,768,1280,1440}.png`, `menu-mobile-375.png`): [`e2e.md`](./e2e.md).

## Observação sobre os cabeçalhos de segurança

O Lighthouse e o e2e acima rodam contra o `astro preview`, que não aplica os cabeçalhos do
`vercel.json` (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy — só a
Vercel os aplica). A conferência desses cabeçalhos contra a URL publicada (`curl -I`) acontece na
Task 38 (deploy).
EOF
grep -c '^Resultado: \*\*aprovado\*\*' docs/qa/README.md
```

Expected: a última linha imprime `2` (uma linha "aprovado" do Lighthouse, outra do e2e). Se imprimir menos que 2, pare — algum dos dois relatórios reprovou; volte ao Step 2 ou 3 e corrija antes de gerar o README.

- [ ] **Step 5: Gate da tarefa e commit**

Run: `npm run format && npm run lint`
Expected: tudo verde (`docs/` fica fora do ESLint — Global Ignores da Task 2 — e do Prettier — `.prettierignore` da Task 2 —, então os relatórios de `docs/qa/` são commitados como gerados).

```bash
git add docs/qa/README.md docs/qa/lighthouse.md docs/qa/e2e.md
git commit -m "$(cat <<'EOF'
docs: Lighthouse final e relatório de QA consolidado

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 38: Deploy na Vercel — executada pelo orquestrador

> **Executada pelo ORQUESTRADOR.** Diferente das tarefas de fechamento, não abre PR nem faz merge — só liga o projeto à Vercel e confirma, contra uma URL de preview real, o que `astro preview` local não consegue mostrar (cabeçalhos do `vercel.json`).

**Files:** nenhum arquivo versionado (link e deploy são operações de infraestrutura; `.vercel/` já está em `.gitignore` desde a Task 2).

- [ ] **Step 1: Ligar o diretório ao projeto Vercel**

```bash
vercel link --yes --project clinicalauratavaress
```

Expected: `Linked to .../clinicalauratavaress` (cria o projeto se ainda não existir — o nome bate com o repositório `GabrielBotelhoeng/clinicalauratavaress` e com o fallback de `SITE_URL` em `astro.config.mjs`, Task 2: `https://clinicalauratavaress.vercel.app`).

- [ ] **Step 2: Conectar o repositório Git (preview automático por PR daqui em diante)**

```bash
vercel git connect 2>&1 | tee .e2e-tmp/vercel-git-connect.txt
```

Expected: conecta ao remoto `origin` (`github.com/GabrielBotelhoeng/clinicalauratavaress`) ou confirma que já está conectado. Esta conexão vale para o PR que a Task 40 vai abrir — não precisa ser refeita.

- [ ] **Step 3: Obter uma URL de preview para testar agora (fallback: CLI; último fallback: deploy temporário)**

A conexão do Step 2 só gera preview automático quando um PR é aberto (Task 40). Para testar agora, use o deploy direto pelo CLI — e, só se ele falhar, o deploy temporário:

```bash
set +e
DEPLOY_OUTPUT=$(vercel deploy --yes 2>&1)
DEPLOY_STATUS=$?
set -e
echo "$DEPLOY_OUTPUT"
if [ "$DEPLOY_STATUS" -ne 0 ]; then
  echo "Deploy autenticado falhou — usando --temporary (último fallback, sem precisar de login)."
  DEPLOY_OUTPUT=$(vercel deploy --temporary 2>&1)
  echo "$DEPLOY_OUTPUT"
fi
PREVIEW_URL=$(echo "$DEPLOY_OUTPUT" | grep -Eo 'https://[a-zA-Z0-9.-]+\.vercel\.app' | tail -1)
echo "PREVIEW_URL=$PREVIEW_URL"
```

Expected: `PREVIEW_URL` preenchida, algo como `https://clinicalauratavaress-<hash>.vercel.app`.

- [ ] **Step 4: Conferir os 5 cabeçalhos de segurança na URL publicada**

```bash
curl -sI "$PREVIEW_URL" | tr -d '\r' > .e2e-tmp/preview-headers.txt
cat .e2e-tmp/preview-headers.txt
grep -ciE '^(content-security-policy|strict-transport-security|x-content-type-options|referrer-policy|permissions-policy):' .e2e-tmp/preview-headers.txt
```

Expected: a última linha imprime `5`. Se vier `401`/uma página de login no corpo (em vez dos 5 cabeçalhos), a Proteção de Deploy da Vercel está exigindo autenticação para preview — desative em **Project Settings → Deployment Protection** (ou gere um bypass token) e repita o `curl`.

- [ ] **Step 5: Confirmar o `cleanUrls` — `/politica-de-privacidade` sem `.html` resolve na URL publicada (emenda da revisão final da Etapa 1)**

```bash
curl -sI "$PREVIEW_URL/politica-de-privacidade" | tr -d '\r' | tee .e2e-tmp/preview-clean-url.txt | head -1
```

Expected: a primeira linha é `HTTP/2 200` (ou `200` logo após o protocolo). Se vier `404`, o `cleanUrls: true` do `vercel.json` (Task 36) não chegou ao deploy — confirme que o `vercel.json` gerado por `npm run csp` foi commitado antes deste deploy e repita o Step 3.

- [ ] **Step 6: Lighthouse e e2e contra a URL de preview**

```bash
BASE_URL="$PREVIEW_URL" node scripts/lighthouse.mjs
BASE_URL="$PREVIEW_URL" bash scripts/e2e.sh
```

Expected: ambos terminam com `Resultado: **aprovado**` — agora contra a infraestrutura real da Vercel (HTTPS, CDN, os cabeçalhos do Step 4), não contra o `astro preview` local.

- [ ] **Step 7: Anotar a URL de preview para as próximas tarefas**

Guarde `$PREVIEW_URL` (ela entra no README e no HANDOFF da Task 39). Nenhum commit nesta tarefa — nada de novo fica versionado.

---


### Task 39: README, `docs/HANDOFF.md` e `docs/CHECKLIST-CLINICA.md` finais

**Files:**
- Create: `README.md` (raiz do projeto — nenhuma task anterior criou um)
- Modify: `docs/HANDOFF.md` (seção `## Entrega`), `docs/CHECKLIST-CLINICA.md` (regenerado)

**Interfaces:**
- Consumes: `npm run checklist` (Task 33); URL de preview obtida na Task 38 (`vercel ls`).

- [ ] **Step 1: Criar `README.md` na raiz**

```markdown
# Clínica Laura Tavares — Landing Page

Landing page estática (Astro 7) da Clínica Laura Tavares — Estética Avançada, em Brasília-DF.
Conversão 100% pelo WhatsApp, sem formulário, sem cookies, sem analytics.

- **Spec:** `docs/superpowers/specs/2026-10-05-landing-clinica-laura-tavares-design.md`
- **Plano de implementação:** `docs/superpowers/plans/2026-10-05-landing-site.md`
- **Estado do projeto e decisões:** `docs/HANDOFF.md`
- **Pendências da clínica:** `docs/CHECKLIST-CLINICA.md`
- **QA (Lighthouse, e2e, capturas):** `docs/qa/README.md`

## Stack

Astro 7 (saída estática) · TypeScript estrito · zod · GSAP/ScrollTrigger/SplitText + Lenis ·
@fontsource (Cormorant Garamond, Jost, Pinyon Script) · Phosphor Icons · Vitest · ESLint + Prettier ·
agent-browser + axe-core + Lighthouse (QA) · Vercel (hospedagem).

## Como rodar

| Comando | O que faz |
|---|---|
| `npm install` | instala as dependências (Node 22.x) |
| `npm run dev` | servidor de desenvolvimento em http://localhost:4321 |
| `npm run build` | build estático em `dist/` |
| `npm run preview` | serve o `dist/` já gerado |
| `npm run check` | lint + typecheck + testes + build + testes do dist + conferência do CSP |
| `npm run lighthouse` | Lighthouse mobile contra o `astro preview` (rode `npm run build` antes) |
| `npm run e2e` | suíte agent-browser + axe-core (capturas, CTAs, menu, FAQ, slider, movimento reduzido, scripts bloqueados) |
| `npm run checklist` | regenera `docs/CHECKLIST-CLINICA.md` a partir do build e de `docs/media-pendencias.md` |
| `npm run og` | regenera `public/og.jpg` (imagem Open Graph) |
| `npm run placeholders` | regenera os placeholders e ícones gerados por sharp |
| `npm run csp` / `npm run csp:check` | gera ou confere o CSP de `vercel.json` a partir do `dist/` |

## Conteúdo e mídia

Todo texto visível vem de `src/content/site.ts` (validado com zod), cópia literal de `docs/copy.md`.
Fotos e vídeos reais entram em `src/assets/media/**`/`public/media/**` (contrato documentado no plano,
seção "Contrato com a frente de mídia"); na ausência de um arquivo, o site usa placeholders elegantes
e nunca quebra o build.

## Deploy

Projeto Vercel `clinicalauratavaress`, conectado ao repositório `GabrielBotelhoeng/clinicalauratavaress`
(preview automático por PR, produção pela `main`). URL de produção e histórico de decisões em
`docs/HANDOFF.md`.
```

- [ ] **Step 2: Regenerar `docs/CHECKLIST-CLINICA.md`**

Run: `npm run checklist && cat docs/CHECKLIST-CLINICA.md`
Expected: arquivo atualizado — as seções 2 e 3 devem estar vazias (ou bem curtas) se a Task 31 já integrou a mídia real; a seção 4 reflete o estado atual de `docs/media-pendencias.md`.

- [ ] **Step 3: Acrescentar `## Entrega` ao `docs/HANDOFF.md`, com a URL de preview real da Task 38**

```bash
PREVIEW_URL=$(vercel ls clinicalauratavaress --yes 2>&1 | grep -Eo 'https://[a-zA-Z0-9.-]+\.vercel\.app' | head -1)
echo "PREVIEW_URL=$PREVIEW_URL"

node -e "
const fs = require('node:fs');
let doc = fs.readFileSync('docs/HANDOFF.md', 'utf8');
const entrega = [
  '',
  '## Entrega',
  '',
  '- **URL de preview:** ' + process.argv[1] + ' (Task 38) — cabeçalhos de segurança, Lighthouse e e2e conferidos contra ela.',
  '- **URL de produção:** preenchida pelo fechamento da Etapa 7 (Task 40).',
  '- **Documentação:** \`README.md\` (raiz), \`docs/HANDOFF.md\` (este arquivo), \`docs/CHECKLIST-CLINICA.md\`, \`docs/qa/README.md\` (Lighthouse + e2e).',
  '',
].join('\n');
doc = doc.replace('## Próximo passo', entrega + '## Próximo passo');
fs.writeFileSync('docs/HANDOFF.md', doc);
" "$PREVIEW_URL"
cat docs/HANDOFF.md
```

Expected: `docs/HANDOFF.md` agora tem uma seção `## Entrega` entre `## Decisões` e `## Próximo passo`, com a URL de preview real (não vazia).

- [ ] **Step 4: Gate da tarefa e commit**

Run: `npm run format && npm run lint && npm run typecheck && npm test`
Expected: tudo verde.

```bash
git add README.md docs/HANDOFF.md docs/CHECKLIST-CLINICA.md
git commit -m "$(cat <<'EOF'
docs: README, HANDOFF (seção Entrega) e checklist da clínica finais

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 40: Fechamento da Etapa 7 — executada pelo orquestrador

> **Executada pelo ORQUESTRADOR.** Além do gate/PR/merge de toda tarefa de fechamento, esta é a última task do plano: também faz o deploy de produção, o smoke test da URL pública e o HANDOFF final.

- [ ] **Step 1: Gate completo na branch**

Run: `npm run check && npm run lighthouse`
Expected: lint, typecheck, testes, build, testes de dist e `csp:check` verdes; `docs/qa/lighthouse.md` com `Resultado: **aprovado**`. Commite `docs/qa/lighthouse.md` se mudou (`docs: resumo do Lighthouse da Etapa 7`, com a linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).

- [ ] **Step 2: Push e PR**

```bash
git push -u origin feat/qa-deploy
mkdir -p .e2e-tmp
cat > .e2e-tmp/pr-body.md <<'EOF'
## Resumo
- Suíte e2e com agent-browser + axe-core (`npm run e2e`): capturas 375/768/1280/1440, console sem erros, CTAs do WhatsApp, menu mobile, FAQ, slider antes/depois por teclado, sem rolagem horizontal em 320/375, movimento reduzido, scripts bloqueados (failsafe de 4 s continua revelando o conteúdo) e axe-core sem violações serious/critical.
- `vercel.json` com Content-Security-Policy gerado a partir do `dist/` real (hash do único script inline, sem `unsafe-inline` em script-src) + HSTS, X-Content-Type-Options, Referrer-Policy e Permissions-Policy; `npm run check` agora inclui `csp:check`.
- Lighthouse final e relatório de QA consolidado (`docs/qa/README.md`).
- Projeto Vercel ligado e conectado ao GitHub (preview automático por PR); preview verificado com os 5 cabeçalhos de segurança, Lighthouse e e2e contra uma URL real.
- README, `docs/HANDOFF.md` (seção Entrega) e `docs/CHECKLIST-CLINICA.md` finais.

## Checklist de validação
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`
- [x] `npm run test:dist`
- [x] `npm run csp:check`
- [x] `npm run lighthouse` — mobile ≥ 90 nas 4 categorias (`docs/qa/lighthouse.md`)
- [x] `npm run e2e` — todas as verificações aprovadas (`docs/qa/e2e.md`)
- [x] Cabeçalhos de segurança conferidos contra a URL de preview (`curl -I`, Task 38)
- [x] Revisões por subagente (especificação + qualidade) aprovadas nas Tasks 35–39

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
gh pr create --base main --head feat/qa-deploy --title "feat: QA (e2e, CSP, Lighthouse) e preparação para o deploy" --body-file .e2e-tmp/pr-body.md
```

- [ ] **Step 3: Merge squash e volta para a main**

```bash
gh pr merge feat/qa-deploy --squash --delete-branch --subject "feat: QA (e2e, CSP, Lighthouse) e preparação para o deploy"
git checkout main && git pull --ff-only
```

(O orquestrador passa `--body` com as linhas de atribuição do commit de squash.)

- [ ] **Step 4: Deploy de produção**

```bash
set +e
PROD_OUTPUT=$(vercel deploy --prod --yes 2>&1)
PROD_STATUS=$?
set -e
echo "$PROD_OUTPUT"
PROD_URL=$(echo "$PROD_OUTPUT" | grep -Eo 'https://[a-zA-Z0-9.-]+\.vercel\.app' | tail -1)
echo "PROD_URL=$PROD_URL"
```

Expected: `PROD_STATUS` igual a `0`; `PROD_URL` é `https://clinicalauratavaress.vercel.app` (o domínio de produção padrão do projeto, Task 38) ou um alias equivalente. Se a integração Git do Step 2/Task 38 já tiver promovido um deploy de produção para este mesmo commit, `vercel deploy --prod --yes` apenas confirma/reusa — não duplica.

- [ ] **Step 5: Smoke test da URL de produção**

```bash
curl -sI "$PROD_URL" | tr -d '\r' | tee .e2e-tmp/prod-headers.txt | head -1
grep -ciE '^(content-security-policy|strict-transport-security|x-content-type-options|referrer-policy|permissions-policy):' .e2e-tmp/prod-headers.txt
curl -s "$PROD_URL" | grep -o '<title>[^<]*</title>'
curl -s "$PROD_URL" | grep -c 'data-wa-origin="hero"'
```

Expected, nesta ordem: `HTTP/2 200`; `5` (os 5 cabeçalhos); `<title>Harmonização Facial no Sudoeste | Dra. Laura Tavares</title>` (Task 7); um número ≥ `1` (o CTA do hero existe na página publicada).

- [ ] **Step 6: HANDOFF final**

Em `## Estado`, troque a linha `- Etapa 7 (QA e deploy): pendente.` por:

```markdown
- **Etapa 7 — QA e deploy (`feat/qa-deploy`): concluída e mergeada na `main`.** Suíte e2e (`npm run e2e`) com agent-browser + axe-core; CSP gerado do `dist/` + HSTS/X-Content-Type-Options/Referrer-Policy/Permissions-Policy em `vercel.json`; Lighthouse final aprovado; projeto Vercel ligado ao GitHub e publicado em produção.
```

Em `## Decisões`, acrescente:

```markdown
- Deploy de produção via `vercel deploy --prod --yes` (CLI, determinístico) — a integração Git (Task 38) já fica conectada para os próximos PRs gerarem preview automático.
```

Grave a URL de produção real na seção `## Entrega` (criada na Task 39) e feche o projeto:

```bash
node -e "
const fs = require('node:fs');
let doc = fs.readFileSync('docs/HANDOFF.md', 'utf8');
doc = doc.replace(
  '- **URL de produção:** preenchida pelo fechamento da Etapa 7 (Task 40).',
  '- **URL de produção:** ' + process.argv[1],
);
doc = doc.replace(
  '- Etapa 7 — \`feat/qa-deploy\`: Task 35 do plano.',
  '- Nenhum — entrega concluída. Pendências remanescentes (não bloqueantes) em \`docs/CHECKLIST-CLINICA.md\`.',
);
fs.writeFileSync('docs/HANDOFF.md', doc);
" "$PROD_URL"
```

Abra `docs/HANDOFF.md` com a ferramenta Read e confirme: a URL de produção está preenchida em `## Entrega` e `## Próximo passo` agora só tem a frase de entrega concluída (nenhuma das duas substituições acima depende de texto que você mesmo escreveu nesta task — ambas apontam para strings exatas gravadas pelas Tasks 34 e 39; se alguma não bater porque uma edição manual anterior mudou o texto, ajuste `docs/HANDOFF.md` à mão para o mesmo resultado). Então:

```bash
git add docs/qa/lighthouse.md docs/HANDOFF.md
git commit -m "$(cat <<'EOF'
docs: HANDOFF final com a URL de produção — projeto entregue

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

## Auto-revisão

> Cobre o plano inteiro (Tasks 1–40). As Tasks 1–30 já estavam escritas; esta revisão as tratou como qualquer outra — procurando furos, inconsistências e placeholders — e não só as Tasks 31–40 escritas agora.

### 1. Cobertura da spec

| Seção da spec | Onde é implementada |
|---|---|
| 1. Resumo do entendimento | Tasks 1–30 (conteúdo, design, WhatsApp) |
| 2. NFRs — Performance | Lighthouse a cada etapa visual (Tasks 8/9/15/19/25/30/31) + final (Task 37) |
| 2. NFRs — Escala | Astro estático, sem backend (Task 2) |
| 2. NFRs — Privacidade/LGPD | Sem formulário/cookies/analytics (Global Constraints); `connect-src`/`form-action 'none'` no CSP (Task 36) reforçam |
| 2. NFRs — Segurança (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) | **Task 36** — não havia nenhuma task para isso nas 1–30 |
| 2. NFRs — Acessibilidade | WCAG AA nas Tasks 1–30 + axe-core automatizado na **Task 35** |
| 2. NFRs — Manutenção (site.ts único, README, HANDOFF, checklist) | site.ts (Task 4); **README.md é novo — Task 39**; HANDOFF (todas as tarefas de fechamento); checklist (**Task 33**) |
| 3. Premissas | Todas em `site.ts`/Tasks 1–30; nenhuma pendente de task |
| 4. Pendências da clínica (7 itens) | **Task 33**, seção 1 (lista literal da spec) |
| 5.1 Arquitetura | Tasks 1–30; `docs/design-system/` referenciado também pelas Tasks 31/32 |
| 5.2 Página (11 seções + botão flutuante) | Marquee/Navbar (11), Hero (12/27/31), Na mídia (13), Tratamentos (14), Resultados (16/17), Método (18), Sobre (20), Depoimentos (21), A clínica (22), FAQ (23), CTA final+rodapé (24) — todas as 11 linhas da tabela 5.2 têm task; WhatsAppFloat (10) |
| 5.3 Mídia (coleta/Higgsfield) | Frente de mídia (plano separado, `2026-10-05-landing-midia.md`) — fora deste plano, só consumida via contrato (Task 6) e integrada na **Task 31** |
| 5.4 Qualidade — gate antes do merge | Global Constraints + toda task |
| 5.4 Qualidade — agent-browser (capturas, console, CTAs, menu, acordeão, slider, movimento reduzido, axe-core) | **Task 35**, suíte dedicada (as Tasks 1–30 só tinham checks pontuais por componente) |
| 5.4 Qualidade — Lighthouse ≥ 90 ao fim das etapas visuais e na entrega | Tasks 8/9/15/19/25/30/31 (por etapa) + **Task 37** (final) |
| 5.4 Qualidade — Git (branch por etapa, PR, squash) | Global Constraints + toda tarefa de fechamento (9/15/19/25/30/34/40) |
| 5.4 Qualidade — Vercel (repositório conectado, fallback CLI) | **Task 38** — não havia nenhuma task de deploy nas 1–30 |
| 5.4 Qualidade — Entrega (URL de produção, HANDOFF, CHECKLIST, relatório com capturas e Lighthouse) | URL de produção (**Task 40**); HANDOFF (todas as tarefas de fechamento, final na 40); CHECKLIST (33, regenerado na 39); relatório (`docs/qa/README.md`, **Task 37**) |
| 6. Log de decisões | Já refletido nas Tasks 1–30 (ex.: decisão 13 "mapa" → card de endereço, documentado em Task 24 e no HANDOFF da Etapa 4) |
| 7. Riscos e mitigação | Em sua maioria mitigações da frente de mídia; "vídeos derrubarem a performance" mitigado por carregamento tardio (Task 18/26) e medido a cada Lighthouse |

Nenhum requisito da spec ficou sem task. As três lacunas reais que existiam ao final da Task 30 — segurança/CSP, suíte e2e dedicada e deploy/Vercel — são exatamente o que as Tasks 35, 36 e 38 cobrem; não é coincidência, é a razão de a Etapa 7 existir.

### 2. Varredura de placeholders

Busca por `TODO`, `TBD`, "a definir", "implementar depois", "preencher depois", "similar à Task N" e variações no arquivo inteiro (12 mil+ linhas): nenhuma ocorrência é um placeholder real.

- `site.ts                       schema zod + TODO texto/dado do site` (linha 75, File Structure, escrita nas Tasks 1–30): "TODO" aqui é a palavra portuguesa "todo" (= inteiro/todo), não um marcador de pendência — frase correta ("schema zod + todo texto/dado do site"). Deixado como está; não é um placeholder, só uma maiúscula que engana a busca.
- Todas as outras ocorrências de `<algo>` são a notação de parâmetro já usada desde a Task 8 (`scripts/shot.sh "<seletor>" [larguras…]`) — convenção de documentação, não texto a preencher.
- Todo bloco de código das Tasks 31–40 é completo e executável (sem `// implementar`, sem corpo de função vazio, sem asserção comentada).

### 3. Consistência de tipos/assinaturas entre tarefas

Verificado por leitura cruzada (não só grep) das interfaces que as Tasks 31–40 reaproveitam:

- `media.support(name: string): ImageMetadata | undefined` (Task 6) — usado sem alteração de assinatura em `SectionTexture.astro`, Hero.astro e `scripts/og/serve.mjs` (Tasks 31/32).
- `MEDIA_SLOTS`, `MEDIA_POSITION: Partial<Record<MediaSlot, string>>` (Task 6) — `MEDIA_POSITION` só recebe mais entradas na Task 31 (o tipo não muda, exemplo de edição mostrado literalmente).
- `resolveVideo`/`<BackgroundVideo name />` (Task 18) — consumido sem mudança por MethodSteps/FinalCTA (já existentes) e verificado (não reimplementado) na Task 31.
- Seletores reaproveitados no e2e (Task 35) contra o que as próprias Tasks 11/16/23/24/26 já testam: `[data-nav-open]`/`[data-nav-menu].open`/`[data-nav-close]` (Task 11), `input[data-ba-range]` com `get value` (Task 16 — é `<input type="range">`, não um `role="slider"` customizado), `details.faq__item > summary` (Task 23, acordeão nativo), `[data-reveal]`/`html.js` (Task 26), `a[data-wa-origin="…"]` com os 12 valores do Global Constraints (confirmado literal nas Tasks 10/12/14/24).
- Nenhum nome novo (`SectionTexture`, `buildCsp`, `cspHash`, `collectInlineScriptHashes`, `extractSection`, `buildChecklist`, `consoleErrors`, `blockingAxeViolations`, `invalidCtaHrefs`, `toE2eMarkdown`, `readBoolean`) colide com um nome já exportado nas Tasks 1–30.
- Scripts `.mjs` novos (`csp.mjs`, `checklist.mjs`, `e2e-check-logs.mjs`, `og/serve.mjs`) nunca importam de `src/**` (TypeScript) — só de `scripts/lib/*.mjs`, igual ao padrão já usado por `lighthouse.mjs`/`lighthouse-summary.mjs` desde a Task 8.

### 4. Review Focus

As 5 entradas já escritas no cabeçalho do plano (linhas 34–40) continuam cobertas de ponta a ponta; nenhuma precisou de uma 6ª entrada:

1. **Mídia fora do contrato** — teste em Task 6 (`reportLines`) **e agora a auditoria prometida na Task 31** (Step 1: zero "arquivo ignorado"/"arquivo duplicado"; todo "placeholder em uso" citado em `docs/media-pendencias.md`).
2. **JSON da mídia malformado** — Tasks 13/21, inalterado.
3. **WhatsApp com caracteres especiais** — Task 5, inalterado; a Task 35 confere os CTAs em navegador real por amostragem (estrutura do href), sem duplicar a lógica de mensagem por origem (que já é exaustivamente testada em TypeScript).
4. **Telas estreitas com palavras longas** — `overflow-wrap` na Task 24 **e agora a verificação em 320/375 px prometida na Task 35** (Step 7 do e2e).
5. **JS bloqueado/lento** — teste de HTML na Task 26 **e agora o teste com scripts bloqueados prometido na Task 35** (Step 9: `network route "*" --abort --resource-type script`, confirmado via `agent-browser open --help` como uso real e documentado do CLI).

Nenhuma correção cirúrgica nas Tasks 1–30 foi necessária: a leitura cruzada de interfaces (ponto 3) não encontrou nenhuma divergência de assinatura, e a varredura de placeholders (ponto 2) não encontrou nenhum item real a corrigir.

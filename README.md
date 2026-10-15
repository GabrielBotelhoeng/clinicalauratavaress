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

| Comando                             | O que faz                                                                                                  |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `npm install`                       | instala as dependências (Node 22.x)                                                                        |
| `npm run dev`                       | servidor de desenvolvimento em http://localhost:4321                                                       |
| `npm run build`                     | build estático em `dist/`                                                                                  |
| `npm run preview`                   | serve o `dist/` já gerado                                                                                  |
| `npm run check`                     | lint + typecheck + testes + build + testes do dist + conferência do CSP                                    |
| `npm run lighthouse`                | Lighthouse mobile contra o `astro preview` (rode `npm run build` antes)                                    |
| `npm run e2e`                       | suíte agent-browser + axe-core (capturas, CTAs, menu, FAQ, slider, movimento reduzido, scripts bloqueados) |
| `npm run checklist`                 | regenera `docs/CHECKLIST-CLINICA.md` a partir do build e de `docs/media-pendencias.md`                     |
| `npm run og`                        | regenera `public/og.jpg` (imagem Open Graph)                                                               |
| `npm run placeholders`              | regenera os placeholders e ícones gerados por sharp                                                        |
| `npm run csp` / `npm run csp:check` | gera ou confere o CSP de `vercel.json` a partir do `dist/`                                                 |

## Conteúdo e mídia

Todo texto visível vem de `src/content/site.ts` (validado com zod), cópia literal de `docs/copy.md`.
Fotos e vídeos reais entram em `src/assets/media/**`/`public/media/**` (contrato documentado no plano,
seção "Contrato com a frente de mídia"); na ausência de um arquivo, o site usa placeholders elegantes
e nunca quebra o build.

## Deploy

Projeto Vercel `clinicalauratavaress`, conectado ao repositório `GabrielBotelhoeng/clinicalauratavaress`
(preview automático por PR, produção pela `main`).

- **Produção (pública):** https://clinicalauratavaress.vercel.app — republicada a cada merge na `main`.
- **Deploys por PR / com hash:** protegidos por login da Vercel (Deployment Protection); para conferir
  cabeçalhos neles use `vercel curl <url>` em vez de `curl -I`.
- **Tirar do ar temporariamente:** `vercel alias rm clinicalauratavaress.vercel.app` (volta com
  `vercel promote <deploy>`), ou ativar a proteção também para produção no painel.
- **Domínio próprio:** só depois dos termos de autorização de imagem e dos dados `[pendente]` do
  `docs/CHECKLIST-CLINICA.md`.

Histórico de decisões e estado detalhado em `docs/HANDOFF.md`.

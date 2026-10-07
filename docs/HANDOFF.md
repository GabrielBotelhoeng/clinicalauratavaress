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

## Frente de mídia (branch `feat/midia`, worktree `.worktrees/midia`)

- Plano: `docs/superpowers/plans/2026-10-05-landing-midia.md`. Ledger: `.superpowers/sdd/2026-10-05-landing-midia/progress.md` (fora do git). Ferramentas e mídia bruta em `media-src/` (fora do git).
- Tasks 1–5 concluídas e revisadas: worktree, verificador do contrato e scripts de foto/vídeo (49 testes), coleta no Instagram (hero = `dra-06`, sobre = `dra-04`, equipe, recepção vazia para a foto viva, sala, detalhes), antes/depois das 4 queixas e carrossel (7 imagens). Em seguida: Task 6 (depoimentos), busca extra de pares dedicados de lábios/mandíbula/bigode, Task 7 (imprensa), Tasks 8–11 (Higgsfield), Task 12 (fechamento; push e PR pelo orquestrador).
- Coleta: Chrome do usuário logado no Instagram = deviceId `599065b9-3d50-45cc-95e1-89daa8741f5e` (só descoberta, só leitura — a extensão esconde as URLs do CDN); download pelo agent-browser (sessão isolada, sem login) + curl, com autorização do usuário para as fotos e os vídeos dos reels dos dois perfis.
- Higgsfield: nenhum crédito gasto até aqui (saldo 900,25).

## Decisões do orquestrador (execução)

- Foto viva (Kling, recepção sem pessoas) = fundo do CTA final (`public/media/cta-final.*`); a galeria fica com fotos estáticas e parallax.
- Fotos da clínica em 4:5 (mín. 1280×1600), exceto a equipe, que vem em 4:3 (mín. 1600×1200, 5 pessoas + letreiro) e ganha um bloco largo na galeria (Task 22).
- `{detail}` é o marcador das mensagens de WhatsApp de resultado/tratamento, substituído por `buildWhatsAppLink` (os testes fixam as mensagens finais do copy).
- `.superpowers/` (workspace local do orquestrador: briefs, relatórios, ledgers) fica fora de git, Prettier e ESLint; `!tests/dist/` re-incluído no `.gitignore` e no `.prettierignore`.
- agent-browser 0.27.0: `screenshot "" "<arquivo>"` (seletor vazio = viewport) em todo script e no plano.
- CSS sempre em arquivo (`build.inlineStylesheets: 'never'`, com teste de dist sem `<style>`), por causa do CSP `style-src 'self'` da Task 36; o `vercel.json` da Task 36 leva `cleanUrls: true` (senão `/politica-de-privacidade` dá 404 na Vercel) e a auditoria da Task 31 reprova mídia "ignorada"/"duplicada" (que seria publicada sem autorização). Emendas feitas no plano após a revisão final da Etapa 1.
- Push direto na `main` é bloqueado pelo classificador de permissões: cada fechamento atualiza este arquivo na branch da etapa, antes do PR.
- Economia de uso (pedido do usuário em 2026-10-06): subagentes em Sonnet/Haiku, Opus só na revisão final; o usuário recusou instalar o OmniRoute (gateway que troca o Claude por outros modelos).
- Todas as decisões, com o custo de cada uma se estiver errada: `.superpowers/sdd/2026-10-05-landing-site/progress.md` e `.superpowers/sdd/2026-10-05-landing-midia/progress.md`.

## Intercorrências

- 2026-10-05 e 2026-10-06: subagentes caíram várias vezes por limite de uso da API. Todo trabalho é salvo em arquivo durante a execução (briefs, relatórios e ledgers em `.superpowers/sdd/`) e retomado de onde parou.
- O link `Claude-Session` não vai em prompts de subagentes; o orquestrador o acrescenta só nos commits de squash e nos PRs.
- O PR #1 foi mergeado pelo usuário com merge commit; os demais, por squash.

## Como retomar

1. Ler este arquivo e os dois ledgers em `.superpowers/sdd/*/progress.md` (cada `Task N: complete` marca o que já foi revisado).
2. `git status`, `git log --oneline -10`, `git -C .worktrees/midia log --oneline -5` e `gh pr list --state all`.
3. Continuar da primeira task sem `complete` em cada ledger.

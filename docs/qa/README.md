# QA — Landing Clínica Laura Tavares

Relatório consolidado da Etapa 7. Os dados brutos ficam em `docs/qa/lighthouse.md` (Lighthouse
mobile, 4 categorias) e `docs/qa/e2e.md` (agent-browser + axe-core); os JSON brutos do Lighthouse
ficam em `docs/qa/lighthouse/` (fora do git, por `.gitignore`).

## Lighthouse mobile

Gerado em 2026-10-15 contra o `astro preview`, com o Lighthouse 12.8.2 (emulação mobile padrão). Meta: ≥ 90 nas 4 categorias.

Resultado: **aprovado** (todas as categorias ≥ 90).

Tabela completa por página: [`lighthouse.md`](./lighthouse.md).

## agent-browser + axe-core (e2e)

Resultado: **aprovado** (todas as verificações passaram).

Checklist completo e capturas (`home-{375,768,1280,1440}.png`, `menu-mobile-375.png`): [`e2e.md`](./e2e.md).

## Observação sobre os cabeçalhos de segurança

O Lighthouse e o e2e acima rodam contra o `astro preview`, que não aplica os cabeçalhos do
`vercel.json` (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy — só a
Vercel os aplica). Conferidos na produção em 2026-10-15 (`curl -sI https://clinicalauratavaress.vercel.app`): os 5
cabeçalhos presentes e o CSP idêntico ao `vercel.json`; e2e e Lighthouse também passaram contra a
produção (home 93/100/100/100, política 100/100/100/100 na revisão final da Etapa 7).

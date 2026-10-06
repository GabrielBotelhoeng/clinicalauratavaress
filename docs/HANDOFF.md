# HANDOFF — Landing Clínica Laura Tavares

> Arquivo de progresso. É atualizado a cada passo concluído e commitado/enviado ao GitHub, para que nada se perca se uma sessão ou um subagente cair (pedido do usuário em 2026-10-05).

_Última atualização: 2026-10-06, ~09h10 (BRT)_

## Estado atual

- **Fase:** planejamento (brainstorming concluído e aprovado) → fechando os planos para começar a execução.
- **Branch ativa:** `docs/design-e-plano`.

### Feito
- Brainstorming aprovado → spec `docs/superpowers/specs/2026-10-05-landing-clinica-laura-tavares-design.md` (entendimento, requisitos não funcionais, premissas, pendências, design final, log de decisões, riscos).
- `.gitignore` e skills do projeto: find-skills, agent-browser, gsap-core, gsap-scrolltrigger, gsap-performance.
- Ferramentas na máquina: agent-browser 0.27 + Chrome for Testing; ffmpeg 9; Vercel CLI logado (conta `gabrielbotelhoeng`, time "Gabriel Botelho's projects").
- Pasta excluída do repo do Desktop (Nutri_Fit) via `.git/info/exclude`.

- Plano de mídia pronto → `docs/superpowers/plans/2026-10-05-landing-midia.md` (12 tarefas; créditos previstos 191, teto somado 376 ≤ 450; custos confirmados: Recraft 2k = 8/imagem, Seedance rascunho 6 s = 18, Seedance 1080p 6 s = 72, Kling std 6 s = 9, upscale ≈ 2).

- Plano de mídia: trailers dos commits dos subagentes sem o link da sessão (só `Co-Authored-By`); o orquestrador acrescenta o link no squash e no PR.
- Chrome para o Instagram escolhido pelo usuário em 2026-10-06: **Browser 2** (`b0c12369-1a01-4a7d-a268-c1599005027b`) — há dois Chrome conectados; selecione com `select_browser` antes de usar.

### Em andamento (2026-10-06 ~09h — sessão parou por limite de uso)
- Plano do site → `docs/superpowers/plans/2026-10-05-landing-site.md` (ainda fora do git): Etapas 1–5 (Tasks 1–30) escritas; um subagente escrevia as Tasks 31–40 e a auto-revisão, anexando task por task. **Ao retomar:** `grep -n "^### Task" docs/superpowers/plans/2026-10-05-landing-site.md | tail` mostra até onde chegou; complete o que faltar (e a seção `## Auto-revisão`).
- Plano de mídia: revisão concluída (**aprovado com correções**, já aplicadas no arquivo, ainda sem commit). O revisor aplicava as decisões abaixo (clínica 4:5 no contrato e no verificador; Steps 7–9 da Task 12 pelo orquestrador). **Ao retomar:** confira com `git diff docs/superpowers/plans/2026-10-05-landing-midia.md`, commite e envie na branch `docs/design-e-plano`.
- PR #1 (`docs/design-e-plano` → `main`) aberto: https://github.com/GabrielBotelhoeng/clinicalauratavaress/pull/1. Merge squash depois do commit do plano de mídia; em seguida alinhar a `main` local com `origin/main` (o commit local `2e91ade`, da skill find-skills, entra pelo PR — push direto na `main` é bloqueado).
- Ledger da execução do site: `.superpowers/sdd/2026-10-05-landing-site/progress.md` (fora do git), com as decisões abaixo.

### Decisões do orquestrador (2026-10-06)
- Foto viva (Kling, recepção) = fundo do CTA final (`public/media/cta-final.*`); a galeria fica com 4 fotos estáticas 4:5 e parallax.
- Fotos `clinica/*` chegam da mídia já em 4:5 (mín. 1280×1600), com rostos e letreiro inteiros.
- Push e PR da frente de mídia (Task 12, Steps 7–9) ficam com o orquestrador.

### Intercorrências
- 2026-10-05 ~22h: os dois subagentes de plano caíram por limite de uso da API antes de salvar qualquer arquivo; foram retomados com o contexto que tinham. A partir daí, todo trabalho é salvo em arquivo durante a execução.
- 2026-10-05 ~23h: o subagente do plano do site caiu de novo por limite de uso, depois de anexar a Task 30. Retomado em 2026-10-06 com um subagente novo só para as Tasks 31–40.
- O classificador de segurança bloqueia enviar o link `Claude-Session` a subagentes: o orquestrador adiciona essa linha só nos commits de squash e nos PRs que ele mesmo cria.

## Próximos passos (em ordem)
1. Receber os dois planos, revisar e aprovar (o usuário delegou a aprovação).
2. Commitar os planos, push de `docs/design-e-plano`, PR e merge squash na `main`. Para não segurar a frente de mídia, o PR desta branch leva a spec e o plano de mídia; o plano do site entra num PR curto em seguida (`docs/plano-site`).
3. Criar o worktree `.worktrees/midia` (branch `feat/midia`) e iniciar a frente de mídia em paralelo.
4. Executar o plano do site com `superpowers:subagent-driven-development`, etapa por etapa (branch → PR → merge squash após validar).
5. Integração da mídia, QA (agent-browser, axe-core, Lighthouse), deploy na Vercel e entrega.

## Decisões-chave (detalhes no log da spec)
- Astro + GSAP + Lenis; Vercel com o login do usuário; PR por etapa com merge squash após lint, typecheck, testes, build e revisão.
- Fotos e antes/depois do Instagram (Chrome do usuário, só leitura); upscale no Higgsfield sem alterar rostos; antes/depois só recortados; depoimentos reais do Google e do Instagram; nunca gerar a Dra., pacientes ou equipe por IA.
- Higgsfield: meta de 450 créditos (saldo inicial 900,25). Desde 2026-10-05 ~22h45 o usuário autorizou passar da meta se a qualidade exigir — com justificativa no manifesto e economizando sempre (decisão 19 da spec; plano de mídia já ajustado, verificador trata gasto > 450 como aviso).
- WhatsApp 5561981007522; registro profissional da Dra. pendente (vai para o checklist da clínica).

## Como retomar
1. Ler este arquivo, depois a spec e os planos.
2. `git status`, `git log --oneline -10` e `gh pr list --state all` para ver o estado local e no GitHub.
3. Continuar do primeiro item não concluído em "Próximos passos".

# HANDOFF — Landing Clínica Laura Tavares

> Arquivo de progresso. É atualizado a cada passo concluído e commitado/enviado ao GitHub, para que nada se perca se uma sessão ou um subagente cair (pedido do usuário em 2026-10-05).

_Última atualização: 2026-10-05, ~22h20 (BRT)_

## Estado atual

- **Fase:** planejamento (brainstorming concluído e aprovado).
- **Branch ativa:** `docs/design-e-plano`.

### Feito
- Brainstorming aprovado → spec `docs/superpowers/specs/2026-10-05-landing-clinica-laura-tavares-design.md` (entendimento, requisitos não funcionais, premissas, pendências, design final, log de decisões, riscos).
- `.gitignore` e skills do projeto: find-skills, agent-browser, gsap-core, gsap-scrolltrigger, gsap-performance.
- Ferramentas na máquina: agent-browser 0.27 + Chrome for Testing; ffmpeg 9; Vercel CLI logado (conta `gabrielbotelhoeng`, time "Gabriel Botelho's projects").
- Pasta excluída do repo do Desktop (Nutri_Fit) via `.git/info/exclude`.

- Plano de mídia pronto → `docs/superpowers/plans/2026-10-05-landing-midia.md` (12 tarefas; créditos previstos 191, teto somado 376 ≤ 450; custos confirmados: Recraft 2k = 8/imagem, Seedance rascunho 6 s = 18, Seedance 1080p 6 s = 72, Kling std 6 s = 9, upscale ≈ 2).

### Em andamento
- Plano do site → `docs/superpowers/plans/2026-10-05-landing-site.md` (subagente escrevendo, salvando em partes).

### Intercorrências
- 2026-10-05 ~22h: os dois subagentes de plano caíram por limite de uso da API antes de salvar qualquer arquivo; foram retomados com o contexto que tinham. A partir daí, todo trabalho é salvo em arquivo durante a execução.
- O classificador de segurança bloqueia enviar o link `Claude-Session` a subagentes: o orquestrador adiciona essa linha só nos commits de squash e nos PRs que ele mesmo cria.

## Próximos passos (em ordem)
1. Receber os dois planos, revisar e aprovar (o usuário delegou a aprovação).
2. Commitar os planos, push de `docs/design-e-plano`, PR e merge squash na `main`.
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

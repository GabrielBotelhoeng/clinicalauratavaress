# e2e (agent-browser + axe-core)

Gerado em 2026-10-15 contra o preview (local ou publicado). Capturas em `docs/qa/`.

| Verificação | Resultado |
|---|---|
| console sem erros | OK |
| CTAs do WhatsApp (amostra) | OK |
| menu mobile abre | OK |
| menu mobile fecha (Esc) | OK |
| FAQ abre pelo clique/teclado | OK |
| slider antes/depois responde ao teclado | OK |
| sem rolagem horizontal em 320px | OK |
| sem rolagem horizontal em 375px | OK |
| movimento reduzido: conteúdo visível | OK |
| scripts bloqueados: failsafe de 4s revela o conteúdo | OK |
| axe-core sem violações serious/critical (home) | OK |
| axe-core sem violações serious/critical (privacidade) | OK |

Resultado: **aprovado** (todas as verificações passaram).

## Resiliência (reload, troca de breakpoint, marquee por toque)

| Verificação | Resultado |
|---|---|
| reload no meio da página (375px) | OK |
| reload no meio da página (1280px) | OK |
| troca de breakpoint 1280→375→1280 com a página rolada | OK |
| marquee pausa/retoma por toque (375px) | OK |

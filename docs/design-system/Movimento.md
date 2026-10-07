# Movimento

A animação deve parecer **seda, não fogos de artifício**: lenta na entrada, firme no fim, sempre a serviço da foto. Referência de ritmo: glyze.com.br (faixas marquee, cards de foto deslizando em loop, reveals ao rolar) com o acabamento mais calmo de uma clínica premium.

## Stack

GSAP 3 + ScrollTrigger para reveals e pins, Lenis para scroll suave (`lerp: 0.08`). Tudo respeita `prefers-reduced-motion: reduce` — nesse caso, sem marquee, sem parallax, só fades de 200ms.

## Curvas e tempos

| Token | Valor | Uso |
|---|---|---|
| `ease-lux` | cubic-bezier(0.22, 1, 0.36, 1) · GSAP `expo.out` | entradas, hovers |
| `ease-silk` | cubic-bezier(0.65, 0, 0.35, 1) · GSAP `power3.inOut` | máscaras, troca de seção |
| `dur-fast` | 240ms | hover de botão e link |
| `dur-base` | 600ms | texto e cards |
| `dur-slow` | 1200ms | fotos |

## Padrões

**1. Título por linhas.** Cada linha do H1/H2 sobe de `yPercent: 110` dentro de uma máscara (`overflow: hidden`), stagger 0.08s, `dur-base`, `ease-lux`. A palavra em itálico entra por último com 0.15s extra.

**2. Foto em arco revelada.** `clip-path: inset(100% 0 0 0)` → `inset(0)` com `ease-silk` em `dur-slow`, enquanto a imagem interna vai de `scale(1.12)` a `1`. É o momento "uau" do hero e do Sobre.

**3. Parallax leve.** Fotos se movem no máximo 8–12% (`yPercent: -10` com `scrub: true`). Badges flutuantes do hero se movem no sentido oposto (+6%) para dar profundidade.

**4. Marquee de prova social.** Faixa contínua, 40s por volta, pausa no hover. Velocidade reage ao scroll: acelera levemente quando o usuário rola (multiplicador até 2× via `ScrollTrigger.getVelocity()`), voltando com `ease-lux`.

**5. Carrossel infinito de resultados.** Cards 3:4 deslizando em loop (60s/volta), pausa no hover, card em hover sobe 8px com `shadow-lift`. Duas fileiras em sentidos opostos no desktop.

**6. Antes e depois.** Slider arrastável; na primeira vez que entra na viewport, a alça faz uma "dica" automática (50% → 30% → 70% → 50%, 1.6s, `ease-silk`) para mostrar que é interativo.

**7. Contadores.** "+25 mil", "9 anos" contam de 0 em 1.4s (`power2.out`) ao entrar na tela, uma vez só.

**8. Cards e hovers.** Cards sobem `y: 40 → 0` + fade, stagger 0.1s. Hover: `translateY(-6px)` + `shadow-lift` em `dur-fast`. Botão primário: preenchimento desliza da esquerda (pseudo-elemento `scaleX` 0→1) com a seta avançando 4px.

**9. Pin no Sobre (opcional).** No desktop, a foto da Dra. fica fixa enquanto a citação, os números e a assinatura passam ao lado — a assinatura "se escreve" com `stroke-dashoffset` (exportar a assinatura real dela em SVG).

Nunca: bounce/elastic, rotações, textos piscando, partículas, cursor customizado chamativo. Nada que pareça "promoção".

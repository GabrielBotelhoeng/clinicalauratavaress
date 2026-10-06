# Clínica Laura Tavares

Design system do site da **Clínica Laura Tavares — Estética Avançada** (CLSW 303, Sudoeste, Brasília). Rosa da parede da clínica, dourado do monograma LT, serifa editorial e muito respiro: um site que parece a recepção da clínica e converte em agendamento pelo WhatsApp.

## Essência da marca

A Dra. Laura Tavares é referência em harmonização facial no Sudoeste: +25 mil atendimentos, 9 anos de experiência, 8 anos de clínica, prêmio de Melhor Atendimento (Santa Permuta 2026), presença na Revista Orla BSB e no Diário de Brasília, e formação internacional (AMWC Coreia 2026). O posicionamento dela é claro e é o eixo de todo o site:

> **Rejuvenescimento para 40+ sem perder a identidade.**

Três pilares guiam cada decisão visual e de texto: **naturalidade** (nada de "rosto padrão"), **segurança e planejamento** (protocolo individual, avaliação antes de tudo) e **sofisticação acolhedora** (luxo que recebe, não que intimida).

## Voz e tom

Fala como a Dra. fala nos vídeos: próxima, segura, sem jargão. Trata por **você**. Frases curtas. Uma ideia por frase.

| Faça | Evite |
|---|---|
| "Rejuvenescer sem deixar de ser você." | "Transforme seu rosto!" |
| "Agende sua avaliação" | "Compre agora", "Promoção imperdível" |
| "Protocolo individual, pensado para o seu rosto" | "Resultado garantido", "100% sem dor" |
| "Descubra o que está envelhecendo o seu rosto" (gancho da bio dela) | Excesso de emojis e pontos de exclamação |
| Números reais: "+25 mil atendimentos" | Superlativos sem prova: "a melhor do Brasil" |

Palavras da marca: *naturalidade, identidade, planejamento, segurança, individualidade, protocolo, avaliação, rejuvenescimento saudável, K-Beauty, regenerativa.*

**Compliance (obrigatório).** Publicidade em saúde estética é regulada pelo conselho profissional da Dra. (CFM, CFO, CFBM ou CFF — confirmar qual). Regras do site: nunca prometer resultado; antes/depois só com termo de autorização de imagem assinado e legenda "resultados variam de pessoa para pessoa"; sem preços promocionais de procedimento; exibir nome e registro profissional no rodapé.

## Fundamentos visuais

**Cor.** O site é 70% claro (`surface`, `surface-blush`), 20% rosé/dourado e 10% de ação (`accent`). O rosewood (`brand-rosewood`) é a única cor de botão. O dourado (`gold`) é ornamento — fios finos, estrelas, numerais grandes, ícones de linha — e nunca carrega texto pequeno; para rótulos dourados use `gold-ink`. O vermelho assinatura (`brand-rouge` / `highlight`) aparece no máximo uma vez por página, como um batom. Seções "noite" (`surface-inverse` ou o tema Noite) servem para CTA final, rodapé e momentos cinematográficos com fotos de luz quente.

**Tipografia.** Cormorant Garamond (serifa de alto contraste) em todos os títulos, sempre com **uma palavra em itálico na cor `accent`** — é a assinatura editorial ("Rejuvenescer sem deixar de *ser você*."). Jost (geométrica) para texto e interface, com eyebrows em caixa alta espaçada (`eyebrow`, cor `gold-ink`). Pinyon Script **só** para a assinatura "Laura Tavares". Carregue as três do Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600&family=Pinyon+Script&display=swap" rel="stylesheet">
```

**Forma.** O **arco** (`radius-arch` nos cantos superiores) é a moldura das fotos da Dra. e o motivo gráfico da marca — remete às janelas de spa e à elegância clássica. Cards usam `radius-md`; fotos grandes e antes/depois `radius-lg`; botões são pílulas (`radius-pill`). Bordas de 1px em `hairline` em vez de sombras pesadas; `shadow-lift` só em hover e elementos flutuantes.

**Layout.** Container máximo de 1200px, 12 colunas, gutter `space-8` (desktop) / `space-6` (mobile). Seções com `space-32` de padding vertical no desktop e `space-24` no mobile. Alterne `surface` → `surface-blush` entre seções. Hero assimétrico: texto à esquerda (5 colunas), foto em arco à direita (6 colunas) com um badge flutuante de prova social.

**Iconografia.** Ícones de linha finos (traço 1.25–1.5px, pontas arredondadas, 24px), na cor `gold` ou `accent`, dentro de um círculo com borda `hairline`. Temas: rosto, lábios, gota, folha, seringa estilizada, estrela. Nada de ícones preenchidos, emojis ou ilustrações cartoon. Biblioteca sugerida: Phosphor (peso Light) ou Lucide com `stroke-width: 1.25`.

**Logo.** O monograma LT dourado com "CLÍNICA LAURA TAVARES · ESTÉTICA AVANÇADA" deve vir da clínica em vetor (SVG/PDF) — **não redesenhar**. Enquanto o arquivo não chega, os componentes usam o wordmark tipográfico: "Laura Tavares" em Cormorant 500 + "ESTÉTICA AVANÇADA" em `eyebrow`.

## Estrutura recomendada da landing page

1. **Faixa marquee** (Marquee) com prova social rodando.
2. **Navbar** fixa com CTA "Agendar avaliação".
3. **Hero** — headline com itálico, subtítulo 40+, dois CTAs, foto em arco da Dra., badge "+25 mil atendimentos".
4. **Na mídia** (PressStrip) — Revista Orla BSB, Diário de Brasília, W3 Notícias, prêmio Santa Permuta.
5. **Tratamentos assinatura** (TreatmentCard) — Harmonização facial, Rejuvenescimento 40+, K-Beauty/estética regenerativa, Corporal.
6. **Resultados por queixa** (BenefitResult) — 4 blocos alternados, cada um com uma dor da paciente, o antes/depois daquela área e um CTA próprio: olhar cansado, contorno da mandíbula, lábios, bigode chinês. Fecha com o ResultsCarousel infinito (estilo Glyze).
7. **Sobre a Dra.** — foto em arco, citação da Revista Orla em `quote`, assinatura, StatBlock.
8. **Depoimentos** (Testimonial) em `surface-blush`.
9. **A clínica** — galeria da recepção rosa com letreiro dourado.
10. **FAQ** — 8 a 12 objeções reais ("vai ficar artificial?", "dói?", "quanto dura?", "preenchimento x botox"), com CTA logo abaixo.
11. **CTA final** em `surface-inverse` + mapa do Sudoeste + rodapé com registro profissional.
12. **WhatsAppFloat** em todas as telas: `https://api.whatsapp.com/send?phone=5561981007522`.

## Lógica de conversão

Duas referências guiam o ritmo da página: a **Glyze** (movimento, marquee, fotos deslizando) e a **Experiência Sublime** (estrutura de venda por procedimento). Da Sublime vêm quatro regras:

1. **Fale da queixa, não do procedimento.** O título é a dor que a paciente sente no espelho ("Adeus ao *olhar de cansaço*"), o procedimento aparece só no texto de apoio.
2. **Cada promessa tem prova ao lado.** Todo bloco de benefício traz o antes/depois daquela área específica — nunca uma galeria genérica longe do texto.
3. **CTA depois de cada bloco.** O botão "Agendar avaliação" se repete após cada benefício, depoimento e FAQ: quem se convenceu no meio da página não precisa rolar até o fim.
4. **Dê nome ao método.** Um protocolo com nome próprio (ex.: "Método LT" ou "Protocolo Identidade", a validar com a Dra.) vira marca, diferencia de concorrentes e amarra todos os tratamentos à promessa de rejuvenescer sem perder a identidade.

Para campanhas de tráfego pago, crie **landing pages por procedimento** (uma para preenchimento, outra para bioestimulador, etc.) com essa mesma estrutura: hero da queixa → BenefitResult ×4 → depoimentos → explicação do procedimento → FAQ → Sobre a Dra. → localização.

## Como usar os tokens

Todos os tokens viram variáveis CSS (`var(--accent)`, `var(--space-8)`, `var(--radius-arch)`, `var(--ease-lux)`). O tema Noite é aplicado com `data-theme="noite"` em qualquer contêiner — use em seções inteiras, não em componentes soltos. As classes `lt-*` dos componentes estão em `components/bundle.css` e são HTML/CSS puro, prontas para colar no projeto (React, Next ou HTML estático). Animações seguem a seção **Movimento**; direção de fotos e prompts de geração na seção **Fotografia**.

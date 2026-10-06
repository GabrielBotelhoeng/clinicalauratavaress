# Landing page — Clínica Laura Tavares · Design

- **Data:** 2026-10-05
- **Status:** aprovado pelo usuário no brainstorming (lock de entendimento + 4 seções de design confirmadas)
- **Fontes de verdade:** `Copy — Landing Page Clínica Laura Tavares.pdf` (texto, 12 seções), `design-system-laura-tavares.zip` (tokens, componentes, Movimento, Fotografia), `instagram e sites de apoio.txt`

## 1. Resumo do entendimento

- **O quê:** landing page única da Clínica Laura Tavares — Estética Avançada (CLSW 303, Bloco C, sala 70, Edifício Le Parc, Sudoeste, Brasília-DF, 70673-623), seguindo o design system e o texto de 12 seções. Conversão 100% pelo WhatsApp, sem formulário.
- **Por quê:** a clínica não tem site. A página transforma quem chega (Instagram, Google, indicação) em agendamento de avaliação.
- **Para quem:** mulheres de 35 a 60 anos, renda alta, do Sudoeste, Noroeste, Asa Sul e Cruzeiro, que querem parecer descansadas e não "feitas".
- **Promessa central:** "Rejuvenescer sem deixar de ser você." — cada seção prova a frase com números reais (+25 mil atendimentos, 9 anos de experiência, 8 anos de clínica, AMWC Coreia 2026, Melhor Atendimento Santa Permuta 2026) e termina com convite para a avaliação.
- **Mídia:** fotos reais (Dra., clínica, equipe, antes/depois) e depoimentos vêm do Instagram e do Google, coletados pelo Chrome do usuário (só leitura). O Higgsfield melhora fotos sem alterar rostos e gera vídeos e imagens de apoio (ambiente, texturas, produtos), nunca pessoas.
- **Restrições:** compliance de publicidade em saúde; movimento "seda, não fogos de artifício"; acessível; respeita `prefers-reduced-motion`.
- **Fora do escopo:** páginas por procedimento para tráfego pago, blog, formulário/CRM, agendamento online, pixel/analytics, domínio próprio, redesenho do logo, teste A/B de headline.

## 2. Requisitos não funcionais

| Tema | Requisito |
|---|---|
| Performance | Lighthouse mobile ≥ 90 em Performance, Acessibilidade, Boas práticas e SEO; LCP < 2,5 s; imagens AVIF/WebP responsivas; vídeos curtos, mudos, com poster, carregados só perto da viewport |
| Escala | Site estático em CDN (Vercel), sem backend nem chamadas de API em runtime |
| Privacidade (LGPD) | Sem formulário, sem cookies, sem analytics; fontes servidas pelo próprio site; mapa como imagem + link (sem embed do Google); página de política de privacidade |
| Segurança | Cabeçalhos de segurança no `vercel.json` (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) |
| Acessibilidade | WCAG 2.2 AA: landmarks, skip link, foco visível, contraste AA (dourado nunca em texto pequeno), slider operável por teclado, alternativa sem movimento |
| Manutenção | Todo texto/dado num único arquivo de conteúdo validado; README, HANDOFF e checklist de pendências da clínica |

## 3. Premissas

- WhatsApp **5561981007522** (bio da Dra. e perfil da clínica), com as mensagens pré-preenchidas por origem definidas no texto (hero/CTA final, blocos de resultado, tratamentos, FAQ).
- Nome do método: **Protocolo Identidade LT**.
- Card de **harmonização corporal entra** (a clínica anuncia "facial e corporal"). O Dr. Silvio Fernando Tavares, marcado no perfil da clínica, **não aparece** na landing.
- Horário: "segunda a sábado, com hora marcada". Abertura da clínica: 2018.
- Logo: wordmark tipográfico do design system até chegar o vetor. Assinatura em Pinyon Script (sem a assinatura real).
- Headline principal do texto; alternativas A/B fora.
- Matérias da seção "Na mídia" com link quando a URL for encontrada; sem link caso contrário.
- Higgsfield: **meta de 450 créditos** (metade do saldo de 900), com gasto anotado por geração. Pode ser ultrapassada com justificativa (decisão 19).

## 4. Pendências da clínica (viram `docs/CHECKLIST-CLINICA.md`, não bloqueiam a entrega)

1. Profissão, conselho e número de registro da Dra. (rodapé e seção Sobre) — **obrigatório antes de publicar em domínio próprio**.
2. Termos de autorização de imagem dos antes/depois e dos depoimentos usados.
3. Logo em vetor (SVG/PDF) e assinatura real em SVG.
4. Horário exato de funcionamento e se há estacionamento.
5. Nome final do método (Protocolo Identidade LT × Método LT) e lista final de tratamentos.
6. Função do segundo número, (61) 98105-1565.
7. Formação acadêmica da Dra. (uma linha no Sobre).

## 5. Design final

### 5.1 Arquitetura

- **Stack:** Astro (saída estática) + GSAP 3/ScrollTrigger + Lenis, TypeScript estrito, npm.
- `src/pages/index.astro` (landing) e `src/pages/politica-de-privacidade.astro`.
- `src/components/`: Marquee, Navbar, Hero, PressStrip, TreatmentCard, BenefitResult, BeforeAfter, ResultsCarousel, MethodSteps, StatBlock, Testimonial, ClinicGallery, FAQ, FinalCTA, Footer, WhatsAppFloat, Button — os do design system reaproveitam `tokens.css` e `bundle.css` (classes `lt-*`); MethodSteps, ClinicGallery, FinalCTA e Footer são novos, com os mesmos tokens.
- `src/content/site.ts`: todo o texto e os dados, validado com zod; campos pendentes marcados e reportados no build. `whatsappLink(origem, detalhe?)` monta cada link.
- `src/scripts/motion/`: um módulo por padrão do `Movimento.md`, orquestrado por `gsap.matchMedia()` com ramo de movimento reduzido.
- `src/assets/` (fotos processadas pelo Astro) e `public/media/` (vídeos e posters).
- `docs/`: design system descompactado, texto em Markdown, specs, planos, `HANDOFF.md`, `CHECKLIST-CLINICA.md`, `media-manifest.md` (origem de cada mídia; prompt, modelo e créditos das geradas).
- Fontes via `@fontsource` (self-hosted). Ícones Phosphor Light em SVG inline.
- Qualidade: `astro check`, ESLint (+ plugin Astro), Prettier, Vitest.

### 5.2 Página

| # | Seção | Componentes | Movimento | Fundo |
|---|---|---|---|---|
| 1 | Marquee + Navbar fixa (gaveta no mobile) | Marquee, Navbar | marquee 40 s/volta, acelera com o scroll | claro |
| 2 | Hero: eyebrow, H1 com itálico, subtítulo, 2 CTAs, selos, foto em arco + badge "+25 mil" | Hero, Button | título por linhas, arco revelado, parallax (badge em sentido oposto) | claro |
| 3 | Na mídia | PressStrip | entrada em sequência | rosado |
| 4 | Tratamentos (4 cards) | TreatmentCard | cards sobem + hover | claro |
| 5 | Resultados por queixa: 4 blocos alternados com slider antes/depois, legenda e CTA próprio + carrossel infinito em 2 fileiras | BenefitResult, BeforeAfter, ResultsCarousel | dica automática no slider; carrossel 60 s/volta | rosado |
| 6 | O Método (4 passos) sobre vídeo de ambiente | MethodSteps | passos revelados | noite |
| 7 | Sobre a Dra.: foto fixa (pin) com citação, números, assinatura | StatBlock | pin no desktop, contadores, assinatura revelada | claro |
| 8 | Depoimentos | Testimonial | cards em sequência | rosado |
| 9 | A clínica: galeria real + uma "foto viva" | ClinicGallery | parallax leve | claro |
| 10 | Dúvidas (9 perguntas) + CTA | FAQ | abertura suave | rosado |
| 11 | CTA final + mapa (imagem com link) + rodapé com responsável técnica | FinalCTA, Footer | vídeo/foto de luz quente | noite |
| — | Botão flutuante do WhatsApp em todas as telas | WhatsAppFloat | — | — |

- Vermelho assinatura (`highlight`) usado **uma única vez** na página.
- Mobile: carrossel em 1 fileira, sem pin e sem parallax; slider por toque e teclado.
- SEO: title, meta description, H1 e alt texts do texto da landing; Open Graph 1200×630 com foto real da Dra.; JSON-LD `HealthAndBeautyBusiness`; `sitemap.xml` e `robots.txt`.

### 5.3 Mídia

- **Coleta (Chrome do usuário, só leitura):** Instagram da Dra. e da clínica (hero, Sobre, recepção, sala, equipe, detalhes, antes/depois das 4 queixas, destaques "Depoimentos"); avaliações do Google Maps (texto literal, até 30 palavras sem mudar o sentido, inicial do nome); URLs das matérias de imprensa.
- **Higgsfield (teto 450 créditos):**
  1. Upscale conservador das fotos reais (hero 4:5 com ~1600 px de altura, Sobre, clínica, equipe). Descartar se mudar traços do rosto.
  2. Até 3 vídeos de 5–8 s, sem áudio, sem pessoas: fundo do Método (Seedance 2.5, texto→vídeo), "foto viva" da recepção real (Kling 3.0, imagem→vídeo, movimento mínimo; descartar se o letreiro deformar), 1 reserva. Rascunho 480p antes de finalizar 1080p.
  3. ~10 imagens de apoio (texturas, composições por tratamento, fundos) com Recraft V4.1 e a paleta da marca.
- **Regras invioláveis:** nunca gerar ou animar a Dra., pacientes ou equipe; antes/depois só recortados (sem upscale, filtro ou retoque); nada gerado é apresentado como a clínica real.
- **Processamento:** originais em `media-src/` (ignorado pelo git), manifesto versionado; fotos otimizadas pelo Astro; vídeos H.264 + WebM (~1–2 MB) com poster.

### 5.4 Qualidade, testes e entrega

- **Gate antes de cada merge:** `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`; revisão por subagente (especificação + qualidade).
- **agent-browser** contra o preview: capturas 375/768/1280/1440, console sem erros, cada CTA conferido (número + mensagem por origem), menu mobile, acordeão, slider por teclado, movimento reduzido, axe-core no navegador.
- **Lighthouse mobile ≥ 90** nas 4 categorias ao fim das etapas visuais e na entrega.
- **Git:** uma branch por etapa (`feat/<etapa>`), commits convencionais em português, PR com checklist de validação, merge squash após o gate. A main fica sempre verde.
- **Vercel:** repositório conectado (preview por PR, produção pela main); fallback: deploy pelo CLI a cada etapa.
- **Entrega:** URL de produção, `docs/HANDOFF.md`, `docs/CHECKLIST-CLINICA.md`, relatório com capturas e notas do Lighthouse.
- **Execução:** `superpowers:writing-plans` → `superpowers:subagent-driven-development`; duas frentes paralelas (`dispatching-parallel-agents`): código (tarefas em sequência) e mídia (só escreve em `media-src/` e no manifesto). O orquestrador guarda só resumos; `HANDOFF.md` atualizado a cada etapa.

## 6. Log de decisões

| # | Decisão | Alternativas consideradas | Por quê |
|---|---|---|---|
| 1 | Fotos reais do Instagram + upscale no Higgsfield | Originais enviadas pela clínica; placeholders | Escolha do usuário: real e imediato; originais podem substituir depois |
| 2 | Antes/depois do Instagram com legenda obrigatória; termos no checklist | Placeholders; sem antes/depois | Prova ao lado de cada promessa é o centro da conversão (regra da Experiência Sublime) |
| 3 | Depoimentos reais do Google e do Instagram | Enviados pelo usuário; sem seção | Nunca inventar depoimento (ético e regulatório) |
| 4 | Registro profissional pendente no checklist | Informar CRO/CRBM/CRM agora | Não encontrado na web nem na bio; usuário não sabe |
| 5 | Merge squash de cada PR após validação | PRs empilhados para revisão no final | Main sempre funcional; próxima etapa parte dela |
| 6 | Vercel com login do usuário | Deploy temporário; sem deploy | Preview por PR e URL de produção estável |
| 7 | Teto de 450 créditos no Higgsfield | 900; 400 | Usuário pediu qualidade com economia para outros projetos |
| 8 | Chrome do usuário, só leitura | agent-browser sem login | Instagram bloqueia navegação anônima após poucas páginas |
| 9 | Astro + GSAP + Lenis | Next.js; HTML/CSS/JS + Vite | Menos JS para Lighthouse ≥ 90, otimização de imagem nativa, componentes reaproveitáveis |
| 10 | Fontes self-hosted (`@fontsource`) | Google Fonts (sugestão do design system) | Performance e LGPD (não envia IP ao Google) |
| 11 | Ícones Phosphor Light inline | Lucide `stroke-width: 1.25` | Sugestão principal do design system |
| 12 | Ordem das seções do texto da landing (com O Método) | Estrutura do README do design system | Texto é mais recente e detalhado |
| 13 | Mapa como imagem + link | Embed do Google Maps | LGPD e performance |
| 14 | WhatsApp 5561981007522 | (61) 98105-1565 | Número aparece na bio da Dra. e no perfil da clínica |
| 15 | Card corporal entra; Dr. Silvio fora | Só facial; incluir Dr. Silvio | Clínica anuncia "facial e corporal"; texto foca na Dra. Laura |
| 16 | Skills `superpowers:*` para plano e execução | Versões homônimas do antigravity | Originais, encadeadas entre si e carregadas na sessão |
| 17 | Antes/depois apenas recortados | Upscale/retoque para padronizar | Mexer adulteraria o resultado |
| 18 | Rascunho 480p antes de vídeo 1080p | Gerar direto em 1080p | Economia de créditos |
| 19 | Os 450 créditos viram meta, não teto rígido: pode ultrapassar se a qualidade exigir, com justificativa no manifesto | Teto rígido de 450 (decisão 7) | Autorização do usuário em 2026-10-05 (~22h45); a economia continua sendo regra |

## 7. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Instagram bloquear a coleta ou não ter fotos boas o bastante | Chrome logado; se faltar foto, placeholder elegante + item no checklist |
| Upscale alterar o rosto da Dra. | Modelo conservador; comparar lado a lado; descartar se mudar traços |
| Vídeo de IA deformar letreiro/ambiente | Rascunho 480p; descartar e usar foto estática |
| Estourar créditos | Teto 450, gasto anotado por job no manifesto, rascunhos antes de finalizar |
| Integração Vercel × GitHub indisponível | Deploy pelo CLI a cada etapa |
| Registro profissional ausente (compliance) | Item obrigatório no checklist antes de domínio próprio |
| Vídeos/animações derrubarem a performance | Vídeos ≤ 2 MB com poster e carregamento tardio; medir Lighthouse a cada etapa visual |
| Poucos depoimentos reais disponíveis | Seção comporta 3+ cards; se houver menos, layout reduzido sem inventar |

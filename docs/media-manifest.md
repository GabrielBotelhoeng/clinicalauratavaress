# Manifesto de mídia — Clínica Laura Tavares

Origem, tratamento e custo de cada arquivo entregue pela frente de mídia (branch `feat/midia`). A mídia bruta e as ferramentas ficam em `media-src/`, fora do git.

Regras: nada gerado por IA mostra a Dra., pacientes ou equipe; antes/depois só recortados; imagem gerada é sempre ilustrativa e nunca é apresentada como a clínica real.

## Créditos do Higgsfield

- Meta: 450 (não é teto rígido — decisão 19 da spec; acima dela, só com justificativa)
- Saldo inicial: 900.25 (2026-10-06 13:52)
- Gasto total: 98
- Saldo final: (preenchido na Task 12)

| # | Data/hora | Ferramenta | Modelo/opção | Item | job_id | Créditos | Saldo antes | Saldo depois | Obs. |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-10-07 15:06 | upscale_image | bytedance 2k | dra/sobre | 00488b9e-414a-4717-b9f5-a7e044a8583d | 2 | 900.25 | 898.25 | lote de 4 chamadas (Task 8); saldo conferido com `balance` antes e depois do lote inteiro, não entre cada chamada — delta total (8) bate exato com 4×2 créditos |
| 2 | 2026-10-07 15:06 | upscale_image | bytedance 2k | clinica/recepcao | 8cbf3d01-7f2b-48ce-a0a7-c1b396a61e50 | 2 | 898.25 | 896.25 | saldo intermediário reconstruído (ver linha 1) |
| 3 | 2026-10-07 15:11 | upscale_image | bytedance 2k | clinica/sala | 471cd8a1-603b-4276-b476-12659ebbbcd9 | 2 | 896.25 | 894.25 | saldo intermediário reconstruído (ver linha 1) |
| 4 | 2026-10-07 15:11 | upscale_image | bytedance 2k | clinica/equipe | c13501a5-3faa-4d69-a12c-f8bc7d3a8320 | 2 | 894.25 | 892.25 | reprovado na métrica das 5 caixas de rosto (pior bloco 14–19 > limite 10); crédito gasto mas resultado não usado — `equipe.jpg` final é o original ampliado sem IA |
| 5 | 2026-10-07 19:15 | generate_video | seedance_2_5 draft t2v 480p | metodo (rascunho 1) | 288a7ff3-a60b-4aa0-9018-914d5de83854 | 18 | 892.25 | 874.25 | pré-checagem 18 confirmada; preset "IN THE DARK" recusado (`declined_preset_id`) para gerar o prompt literal do brief; aprovado no P5 na 1ª tentativa |
| 6 | 2026-10-07 19:17 | generate_video | seedance_2_5 final 1080p (`draft_job_id`) | metodo (final) | c556b55a-ca0f-49d5-84e4-7a70d8fa765b | 72 | 874.25 | 802.25 | pré-checagem com só `draft_job_id`+`generate_audio` indicou 60; 1ª tentativa de envio real (mesmos campos) foi recusada por validação (`prompt` vazio); reenviada incluindo `mode`, `prompt`, `duration`, `aspect_ratio` do rascunho + `resolution: "1080p"` (fallback do brief) e preset recusado de novo — cobrança final 72, igual ao custo direto de 1080p/6s da tabela de orçamento (subteto 72, não excedido) |

## Arquivos entregues

| Arquivo | Origem | Processamento | Gerado por IA? | Pode representar a clínica real? |
|---|---|---|---|---|
| `src/assets/media/resultados/olhar-antes.jpg` | Instagram @dra.lauratavares — https://www.instagram.com/dra.lauratavares/p/DbV2qdMRgU6/ | só recorte 4:5 (caixa 550,950,900,1125 dentro do composto lado a lado 3976×3976), sem redimensionar, JPEG q88 sRGB sem EXIF | não | não (paciente real) |
| `src/assets/media/resultados/olhar-depois.jpg` | Instagram @dra.lauratavares — https://www.instagram.com/dra.lauratavares/p/DbV2qdMRgU6/ | só recorte 4:5 (caixa 2830,987,900,1125 dentro do mesmo composto), sem redimensionar, JPEG q88 sRGB sem EXIF | não | não (paciente real) |
| `src/assets/media/resultados/mandibula-antes.jpg` | Instagram @dra.lauratavares — https://www.instagram.com/dra.lauratavares/p/DWcLXDCD0qS/ | só recorte 4:5 (caixa 150,550,500,625 dentro do composto lado a lado 1440×1800), sem redimensionar, JPEG q88 sRGB sem EXIF | não | não (paciente real) |
| `src/assets/media/resultados/mandibula-depois.jpg` | Instagram @dra.lauratavares — https://www.instagram.com/dra.lauratavares/p/DWcLXDCD0qS/ | só recorte 4:5 (caixa 850,550,500,625 dentro do mesmo composto), sem redimensionar, JPEG q88 sRGB sem EXIF | não | não (paciente real) |
| `src/assets/media/resultados/bigode-antes.jpg` | Instagram @dra.lauratavares — https://www.instagram.com/dra.lauratavares/p/DCm_JKEvQ7Y/ (1ª foto do carrossel) | só recorte 4:5 (caixa 50,350,600,750 dentro do composto lado a lado 1440×1440), sem redimensionar, JPEG q88 sRGB sem EXIF | não | não (paciente real) |
| `src/assets/media/resultados/bigode-depois.jpg` | Instagram @dra.lauratavares — https://www.instagram.com/dra.lauratavares/p/DCm_JKEvQ7Y/ (1ª foto do carrossel) | só recorte 4:5 (caixa 770,350,600,750 dentro do mesmo composto), sem redimensionar, JPEG q88 sRGB sem EXIF | não | não (paciente real) |
| `src/assets/media/resultados/labios-antes.jpg` | Instagram @dra.lauratavares — https://www.instagram.com/dra.lauratavares/p/DCutha9PlvW/ (2ª foto do carrossel) | só recorte 4:5 (caixa 50,380,600,750 dentro do composto lado a lado 1440×1440), sem redimensionar, JPEG q88 sRGB sem EXIF | não | não (paciente real) |
| `src/assets/media/resultados/labios-depois.jpg` | Instagram @dra.lauratavares — https://www.instagram.com/dra.lauratavares/p/DCutha9PlvW/ (2ª foto do carrossel) | só recorte 4:5 (caixa 770,380,600,750 dentro do mesmo composto), sem redimensionar, JPEG q88 sRGB sem EXIF | não | não (paciente real) |
| `src/assets/media/carrossel/resultado-01.jpg` | Instagram @dra.lauratavares — https://www.instagram.com/dra.lauratavares/p/DWcL8LNjx5R/ | recorte central 3:4 (caixa 45,0,1350,1800) do composto 1440×1800, JPEG q88 sRGB sem EXIF | não | não (paciente real) |
| `src/assets/media/carrossel/resultado-02.jpg` | Instagram @dra.lauratavares — https://www.instagram.com/dra.lauratavares/p/DbOZCCUlEwI/ (1ª foto do carrossel) | recorte central 3:4 (caixa 511,0,3069,4092) do composto 4092×4092, redimensionado para 1800×2400, JPEG q88 sRGB sem EXIF | não | não (paciente real) |
| `src/assets/media/carrossel/resultado-03.jpg` | Instagram @dra.lauratavares — https://www.instagram.com/dra.lauratavares/p/DbOZCCUlEwI/ (2ª foto do carrossel, mesma paciente) | recorte central 3:4 (caixa 490,0,2942,3922) do composto 3922×3922, redimensionado para 1800×2400, JPEG q88 sRGB sem EXIF | não | não (paciente real) |
| `src/assets/media/carrossel/resultado-04.jpg` | Instagram @dra.lauratavares — https://www.instagram.com/dra.lauratavares/p/DdEdBtjFnBG/ (1ª foto do carrossel) | recorte central 3:4 (caixa 512,0,3072,4096) do composto 4096×4096, redimensionado para 1800×2400, JPEG q88 sRGB sem EXIF | não | não (paciente real) |
| `src/assets/media/carrossel/resultado-05.jpg` | Instagram @dra.lauratavares — https://www.instagram.com/dra.lauratavares/p/DdEdBtjFnBG/ (2ª foto do carrossel, mesma paciente) | recorte central 3:4 (caixa 480,0,2883,3844) do composto 3844×3844, redimensionado para 1800×2400, JPEG q88 sRGB sem EXIF | não | não (paciente real) |
| `src/assets/media/carrossel/resultado-06.jpg` | Instagram @clinicalauratavaress — https://www.instagram.com/clinicalauratavaress/p/DLtBaSaSoUB/ | recorte central 3:4 (caixa 180,0,1080,1440) do composto 1440×1440, JPEG q88 sRGB sem EXIF | não | não (paciente real) |
| `src/assets/media/carrossel/resultado-07.jpg` | Instagram @clinicalauratavaress — https://www.instagram.com/dra.lygiafigueiredo/p/DcPGx6nyIJC/ (coautoria Dra. Lygia Figueiredo; post aparece na grade de @clinicalauratavaress) | recorte central 3:4 (caixa 48,0,1440,1920) do composto empilhado 1536×1920, JPEG q88 sRGB sem EXIF | não | não (paciente real) |
| `src/assets/media/dra/hero.jpg` | Instagram @dra.lauratavares — https://www.instagram.com/dra.lauratavares/p/DdFd4ycGryx/ (`dra-06`) | recorte 4:5 meio corpo (caixa 544,0,2096,2620 do original 3024×4032), sem upscale — a resolução nativa já supera o mínimo 1280×1600 —, redimensionado para 1920×2400, JPEG q88 sRGB sem EXIF | não | sim (foto real da Dra., fundo floral da recepção) |
| `src/assets/media/dra/sobre.jpg` | Instagram @dra.lauratavares — https://www.instagram.com/dra.lauratavares/p/DbggKJKEfWj/ (`dra-04`) | recorte 4:5 excluindo a citação sobreposta e o cabeçalho (caixa 252,160,576,720 do original 1080×1350) + upscale bytedance 2k aprovado (métrica e visual, ver Comparações), redimensionado para 1920×2400, JPEG q88 sRGB sem EXIF | não | sim (foto real da Dra.) |
| `src/assets/media/clinica/recepcao.jpg` | Instagram @clinicalauratavaress — https://www.instagram.com/clinicalauratavaress/reel/DP4bSo1Evnn/ (`rec-01`) | recorte 4:5 excluindo o ícone de play do reel (caixa 76,380,208,260 do original 360×640) + upscale bytedance 2k aprovado (métrica e visual, ver Comparações), redimensionado para 1920×2400, JPEG q88 sRGB sem EXIF; arquivo aprovado também salvo em `media-src/higgsfield/upscale/recepcao.png` para reuso na Task 11 | não | sim (ambiente real da clínica, sem pessoas) |
| `src/assets/media/clinica/sala.jpg` | Instagram @clinicalauratavaress — https://www.instagram.com/clinicalauratavaress/p/DNn7PnKtRLx/ (`sala-01`) | recorte 4:5 excluindo o texto queimado "Quando você" e o ícone de play (caixa 0,350,232,290 do original 361×640) + upscale bytedance 2k aprovado (métrica e visual, ver Comparações), redimensionado para 1920×2400, JPEG q88 sRGB sem EXIF | não | sim (ambiente real da clínica, sem pessoas; incerteza se é sala de procedimento ou consultório — ver pendências) |
| `src/assets/media/clinica/equipe.jpg` | Instagram @clinicalauratavaress — https://www.instagram.com/clinicalauratavaress/p/Dac7LEpEZH5/ (`equipe-01`) | imagem inteira, já nativamente 4:3 (1080×810) — upscale bytedance 2k tentado e REPROVADO na métrica das 5 caixas de rosto (ver Comparações); usado o original redimensionado sem IA (`--allow-enlarge`) para 1600×1200, JPEG q88 sRGB sem EXIF | não | sim (equipe e letreiro reais da clínica) |
| `src/assets/media/clinica/detalhes.jpg` | Instagram @dra.lauratavares — https://www.instagram.com/dra.lauratavares/p/DWbtPP8jo8C/ (`det-02`) | recorte 4:5 central (caixa 0,60,1440,1800 do original 1440×1920), sem upscale — a resolução nativa já supera o mínimo 1280×1600 —, JPEG q88 sRGB sem EXIF | não | sim (detalhe real de hospitalidade da clínica, sem pessoas) |
| `public/media/metodo.mp4` | Higgsfield Seedance 2.5, t2v, rascunho 480p `288a7ff3-a60b-4aa0-9018-914d5de83854` aprovado no P5 → final 1080p `c556b55a-ca0f-49d5-84e4-7a70d8fa765b` | gerado 1920×1080/6s, codificado H.264 `+faststart` 16:9 via `encode-video.mjs` (621327 bytes) | sim | não (ilustrativo) |
| `public/media/metodo.webm` | idem `metodo.mp4` | mesma codificação, saída VP9 (215569 bytes) | sim | não (ilustrativo) |
| `public/media/metodo-poster.jpg` | idem `metodo.mp4` | quadro extraído pelo `encode-video.mjs`, JPEG 1280×720 (48903 bytes) | sim | não (ilustrativo) |

## Comparações de upscale e de quadros

| Foto | Imagem enviada | Caixas (x,y,w,h) | MAE | Pior bloco | Veredito visual | Decisão |
|---|---|---|---|---|---|---|
| dra/sobre | work/sobre-recorte.png | 150,20,320,340 | 2.65 | 5.78 | rosto idêntico lado a lado: sobrancelhas, olhos, nariz, boca, contorno do rosto, pintas e textura de pele preservados, sem aspecto plástico | aprovado |
| clinica/recepcao | work/recepcao-recorte.png | 0,120,100,140 | 2.99 | 7.97 | taça, bandeja dourada, mesa e piso idênticos; nenhum objeto deformado, nenhum texto inventado | aprovado |
| clinica/sala | work/sala-recorte.png | 5,55,95,135 | 2.75 | 6.94 | decalque e formato do equipamento (robô) idênticos; nenhuma deformação, nenhum texto inventado | aprovado |
| clinica/equipe | work/equipe-recorte.png | rostos: 210,355,100,90 / 345,360,100,90 / 535,300,100,100 / 700,365,100,90 / 855,330,100,100 — letreiro: 320,5,420,100 | rostos 5.64–8.66 / letreiro 2.73 | rostos 13.08–19.05 (reprovado, limite 10) / letreiro 5.85 (aprovado) | letreiro idêntico e aprovado; nos rostos, os traços (olhos, boca, brincos) parecem preservados ao olho nu, mas a métrica reprova em todas as 5 caixas (pior bloco até quase 2× o limite) — descartado por segurança, sem benefício da dúvida em rosto de pessoa real | reprovado — `equipe.jpg` final usa o original ampliado sem IA |

## Gerações (prompts e parâmetros)

### metodo

- Modelo: `seedance_2_5`, modo `t2v`, 16:9, 6 s, sem áudio (`generate_audio: false`).
- Prompt final (idêntico no rascunho e no final; nenhum ajuste necessário — aprovado na 1ª tentativa):

  > Low-key cinematic shot in a quiet room at golden hour: warm sunbeams slowly drifting through sheer blush curtains, soft glints of champagne gold on a white marble surface, white orchids softly out of focus, glowing dust floating in the light, deep warm shadows, slow continuous camera push-in, single take, no cuts, shallow depth of field, rosé and nude color grade, calm and sophisticated, no people, no hands, no faces, no text, no logos

- Rascunho 480p aprovado: `job_id` `288a7ff3-a60b-4aa0-9018-914d5de83854` (854×480, ~6s); P5 aprovado na 1ª tentativa (nenhuma pessoa/mão/rosto/silhueta — sombras atrás da cortina são de folhagem/galhos —, sem texto/logo, sem aspecto de consultório, paleta rosé/champagne com luz quente, câmera avançando devagar sem cortes nem deformação). Único rascunho necessário (1 de 3 permitidos).
- Final 1080p: `job_id` `c556b55a-ca0f-49d5-84e4-7a70d8fa765b` via `draft_job_id` do rascunho aprovado (1920×1080, ~6s). Primeira tentativa de envio recusada por validação (campo `prompt` vazio ao enviar só `draft_job_id`+`generate_audio`); reenviada incluindo `mode`, `prompt`, `duration`, `aspect_ratio` do rascunho e `resolution: "1080p"`, conforme o fallback do brief. P5 aprovado (mesmos critérios do rascunho, composição idêntica em resolução maior).
- Preset sugerido pelo servidor ("IN THE DARK") recusado nas duas chamadas pagas (`declined_preset_id`) para manter o prompt literal do brief.
- Codificação: `encode-video.mjs` → `metodo.mp4` (H.264 faststart, 621327 bytes), `metodo.webm` (VP9, 215569 bytes), `metodo-poster.jpg` (1280×720, 48903 bytes).
- Créditos: linhas 5 e 6 da tabela acima (18 + 72 = 90).

## Depoimentos (fontes)

- Rafael N. — google — https://www.google.com/maps/search/?api=1&query=Cl%C3%ADnica%20Laura%20Tavares%20Sudoeste — id/quadro de origem: g-08 (`media-src/textos/google-avaliacoes.json`)
- Maria O. — google — https://www.google.com/maps/search/?api=1&query=Cl%C3%ADnica%20Laura%20Tavares%20Sudoeste — id/quadro de origem: g-02
- Suzanne N. — google — https://www.google.com/maps/search/?api=1&query=Cl%C3%ADnica%20Laura%20Tavares%20Sudoeste — id/quadro de origem: g-03
- Juliany F. — google — https://www.google.com/maps/search/?api=1&query=Cl%C3%ADnica%20Laura%20Tavares%20Sudoeste — id/quadro de origem: g-06
- Josy C. — google — https://www.google.com/maps/search/?api=1&query=Cl%C3%ADnica%20Laura%20Tavares%20Sudoeste — id/quadro de origem: g-09
- Andrea F. — google — https://www.google.com/maps/search/?api=1&query=Cl%C3%ADnica%20Laura%20Tavares%20Sudoeste — id/quadro de origem: g-04

Avaliações lidas na ficha do Google (Dra Laura Tavares | Harmonização Facial, CLSW 303, Sudoeste, Brasília — 5,0 de 308 avaliações, verificado em 2026-10-07) via Chrome do usuário logado, aba "Avaliações" aberta a partir de uma busca no Google (a aba "Avaliações" do próprio Google Maps não renderizou nesta sessão — ver preocupações no relatório da Task 6; conteúdo e nota conferem com o painel de avaliações carregado, mesma ficha/endereço/telefone). Texto completo das 10 avaliações carregadas (conferidas, "Mais" expandido) em `media-src/textos/google-avaliacoes.json`. Instagram: destaques "Depoimentos" (@dra.lauratavares e @clinicalauratavaress) e "LT Clinic" (@dra.lauratavares) revisados quadro a quadro — nenhum quadro com nome completo legível e texto transcrevível; detalhe em `media-src/textos/instagram-depoimentos.md`.

## Imprensa (evidências)

- Revista Orla BSB — sem URL — evidência: nenhuma página encontrada — buscas: `Revista Orla BSB "Laura Tavares" 8 anos clínica Sudoeste` (standard e extended), `"Revista Orla BSB" Laura Tavares clínica` (extended), em 2026-10-07
- Diário de Brasília (Prêmio de Melhor Atendimento no Santa Permuta 2026) — sem URL — evidência: nenhuma página encontrada — buscas: `Diário de Brasília "Laura Tavares" Santa Permuta 2026 melhor atendimento` (standard e extended), `diariodebrasilia.com.br "Santa Permuta 2026" prêmio melhor atendimento estética` (extended), `"Santa Permuta 2026" prêmio ganhadores categorias estética harmonização facial` (extended), em 2026-10-07
- W3 Notícias — https://www.w3noticias.com.br/2026/06/korean-beauty-day-traz-brasilia-as.html — evidência: HTTP 200; `curl` + grep encontrou os termos "Korean Beauty Day" e "Laura Tavares" na página ("Korean Beauty Day traz a Brasília as principais tendências da beleza coreana, do rejuvenescimento saudável e da estética regenerativa", evento promovido pela Clínica Laura Tavares no CLSW 303 Bloco C sala 70) — buscas: `W3 Notícias "Korean Beauty Day" Brasília` (extended)
- Diário de Brasília (Coautora do livro "Sua Voz Vale Ouro") — sem URL — evidência: nenhuma página encontrada — buscas: `Diário de Brasília "Sua Voz Vale Ouro" "Laura Tavares"` (standard e extended), `"Sua Voz Vale Ouro" livro coautora Brasília estética` (extended), `"Diário de Brasília" "Laura Tavares"` (extended), em 2026-10-07

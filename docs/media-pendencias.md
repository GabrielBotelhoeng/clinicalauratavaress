# Pendências da mídia — Clínica Laura Tavares

O que faltou na coleta e o que a clínica precisa enviar ou autorizar. O orquestrador leva estes itens para `docs/CHECKLIST-CLINICA.md`.

## Arquivos dispensados

Uma linha por item, no formato lido pelo verificador: hífen, espaço, o caminho do contrato entre crases, espaço, travessão, espaço, `AUSENTE:`, espaço e o motivo (10+ caracteres). Chaves aceitas: o caminho de cada foto, `src/assets/media/carrossel/`, `src/assets/media/apoio/` e `public/media/metodo.*`.

(nenhuma dispensa ativa — a coleta com login encontrou candidata para recepção, sala, equipe e detalhes; ver `media-src/coleta.json`)

## Avisos

Uma linha por aviso, começando com `- DEPOIMENTOS: `, `- IMPRENSA: `, `- FOTO VIVA: ` ou `- CRÉDITOS: `.

- IMPRENSA: Revista Orla BSB sem URL encontrada (buscas standard e extended em 2026-10-07); pedir o link à clínica
- IMPRENSA: Diário de Brasília (Prêmio de Melhor Atendimento no Santa Permuta 2026) sem URL encontrada (buscas standard e extended em 2026-10-07); pedir o link à clínica
- IMPRENSA: Diário de Brasília (Coautora do livro "Sua Voz Vale Ouro") sem URL encontrada (buscas standard e extended em 2026-10-07); pedir o link à clínica
- EQUIPE: upscale conservador de `equipe-01` (bytedance 2k) reprovou na métrica nas 5 caixas de rosto (pior bloco 13–19, limite 10; letreiro passou com folga) — Task 8 descartou o resultado por segurança e usou o original redimensionado sem IA (`--allow-enlarge`, 1080×810 → 1600×1200); se a clínica tiver uma foto original em resolução maior da equipe em frente ao letreiro, ela permite um `equipe.jpg` mais nítido sem precisar de upscale.
- FOTO VIVA: fonte confirmada em `rec-01` (canto de espera com parede de flores, poltronas rosé e mesa dourada, sem pessoas; não é a parede do letreiro dourado, que só aparece ocupada por equipe em `equipe-01`) — resolução nativa baixa (360x640), upscale 2k necessário na Task 8 antes de gerar a foto viva na Task 11.
- DEPOIMENTOS: nenhum depoimento do Instagram utilizável — os destaques "Depoimentos" dos dois perfis e "LT Clinic" da Dra. (verificados em 2026-10-07, Chrome logado) só têm reposts de DM/WhatsApp sem nome completo visível (nome coberto pela legenda ou fora de quadro), um repost de terceiro identificado só por @handle (não citável por privacidade) e vídeos sem legenda transcrevível; os 6 depoimentos finais vêm todos do Google. Detalhe quadro a quadro em `media-src/textos/instagram-depoimentos.md`.

## Dados encontrados para o checklist da clínica

- Profissão/conselho/registro: não encontrado na bio dos dois perfis, no linktree nem nos 12 posts mais recentes da Dra. (verificado em 2026-10-06)
- Formação acadêmica: não encontrado um trecho formal; a bio de @dra.lauratavares cita apenas "AMWC COREIA 2026" (congresso) e "9 anos experiência" — fonte: https://www.instagram.com/dra.lauratavares/
- Horário de funcionamento: não encontrado na bio dos dois perfis, no linktree nem nos 12 posts mais recentes da Dra. (verificado em 2026-10-06); um flyer promocional de @dra.lygiafigueiredo (profissional colaboradora que atende na Clínica Laura Tavares) cita "De segunda a sábado" sem horário específico — fonte: https://www.instagram.com/dra.lygiafigueiredo/p/DauyRHlB7Xq/ (verificado em 2026-10-06, com login)
- Estacionamento: não encontrado na bio dos dois perfis, no linktree nem nos 12 posts mais recentes da Dra. (verificado em 2026-10-06)
- Segundo número (61) 98105-1565: não encontrado na bio nem no linktree da clínica (que usam (61) 98100-7522, api.whatsapp.com/send?phone=5561981007522 — fonte: https://www.instagram.com/clinicalauratavaress/); PORÉM, com login, o número (61) 98105-1565 aparece como WhatsApp de agendamento num flyer promocional de @dra.lygiafigueiredo ("Dra. Lygia Figueiredo... Estarei disponível na Clínica Laura Tavares... Agende sua consulta: 61 98105-1565") — fonte: https://www.instagram.com/dra.lygiafigueiredo/p/DauyRHlB7Xq/ (verificado em 2026-10-06, com login). É um número real e ativo ligado à clínica, mas aparenta ser o número pessoal/de agenda da Dra. Lygia (profissional colaboradora), não necessariamente o WhatsApp oficial da recepção — confirmar com a clínica qual dos dois números usar na landing.

## Pedidos à clínica

- Foto de retorno de mandíbula (antes/depois da mesma paciente, mesmo ângulo e luz, sem touca, sem marcas de agulha ou inchaço) para substituir o par atual, que repete a paciente do "Face Prime".
- Foto original em alta resolução da recepção, com a parede rosa e o letreiro dourado "Dra. Laura Tavares" inteiro e legível, sem nenhuma pessoa — a coleta com login achou uma candidata de espera sem pessoas (`rec-01`, 360x640, outro canto da recepção) e uma com o letreiro completo mas com a equipe posada na frente (`equipe-01`, 1080x810); nenhuma mostra o letreiro vazio em alta resolução.
- Foto original em alta resolução da sala de procedimentos vazia, sem paciente — a coleta achou uma candidata (`sala-01`, 361x640) mas não dá para confirmar com certeza se é sala de procedimento ou consultório.
- Foto original em alta resolução da equipe completa posicionada em frente ao letreiro da clínica — já coberto por `equipe-01` (1080x810, letreiro completo e legível); uma versão em resolução maior ainda é bem-vinda.
- Foto original em alta resolução da Dra. Laura Tavares, meio corpo, olhando para a câmera, sorriso aberto, sem ícone de play nem texto sobreposto — a coleta com login achou 3 candidatas boas (`dra-04`, 1080x1350; `dra-05`, 2268x3024, com 2 pessoas nas bordas; `dra-06`, 3024x4032, corpo inteiro), então este pedido não é mais urgente, mas uma foto de estúdio recente ainda é bem-vinda.
- Confirmação de qual é o número de WhatsApp correto da clínica para a landing: a bio do Instagram da clínica usa (61) 98100-7522; já o número (61) 98105-1565 citado no brief aparece num flyer de agendamento da Dra. Lygia Figueiredo (profissional colaboradora) — confirmar se é o número oficial da recepção ou o número pessoal da Dra. Lygia.
- Horário de funcionamento da clínica com os horários de abertura/fechamento — só os dias ("de segunda a sábado") apareceram num flyer de uma profissional colaboradora, sem horário específico.
- Informação sobre estacionamento no local (não encontrado em nenhuma fonte pública verificada nesta coleta).
- Dados de profissão, conselho de classe e número de registro da Dra. Laura Tavares (não encontrados em nenhuma fonte pública verificada nesta coleta) — necessários para compliance de publicidade na landing page.
- Termo de autorização de imagem das pacientes destes posts: https://www.instagram.com/dra.lauratavares/p/DbV2qdMRgU6/ , https://www.instagram.com/dra.lauratavares/p/DWcLXDCD0qS/ , https://www.instagram.com/dra.lauratavares/p/DCm_JKEvQ7Y/ , https://www.instagram.com/dra.lauratavares/p/DCutha9PlvW/ , https://www.instagram.com/dra.lauratavares/p/DWcL8LNjx5R/ , https://www.instagram.com/dra.lauratavares/p/DbOZCCUlEwI/ , https://www.instagram.com/dra.lauratavares/p/DdEdBtjFnBG/ , https://www.instagram.com/clinicalauratavaress/p/DLtBaSaSoUB/ , https://www.instagram.com/dra.lygiafigueiredo/p/DcPGx6nyIJC/
- Se possível, enviar os originais desses antes/depois (sem a compressão do Instagram).
- Ciência/autorização dos autores dos depoimentos usados: Rafael N., Maria O., Suzanne N., Juliany F., Josy C. e Andrea F. — todos avaliações públicas do Google Maps da ficha da clínica (texto literal com corte do código completo em `media-src/textos/google-avaliacoes.json`).

# WhatsAppFloat

Botão fixo no canto inferior direito, presente em todas as telas — é o principal canal de agendamento da clínica.

- Link: `https://api.whatsapp.com/send?phone=5561981007522` com mensagem pré-preenchida ("Olá, gostaria de agendar uma avaliação").
- O balão "Agende pelo WhatsApp" aparece após 6s ou 40% de scroll e some no mobile após 4s.
- Pulso suave em loop (desligado com `prefers-reduced-motion`).
- No mobile, sobe 72px quando houver barra de cookies. Sempre com `aria-label`.

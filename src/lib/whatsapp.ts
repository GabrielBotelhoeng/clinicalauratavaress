import { site, type Site } from '../content/site';

export type WhatsAppOrigin = keyof Site['whatsapp']['messages'];

const DETAIL = '{detail}';

/** Monta o link do WhatsApp a partir do número e do modelo da mensagem (com `{detail}` quando houver). */
export function buildWhatsAppLink(number: string, template: string, detail?: string): string {
  if (!/^55\d{10,11}$/.test(number)) {
    throw new Error(`WhatsApp: número "${number}" fora do formato 55 + DDD + telefone.`);
  }
  const needsDetail = template.includes(DETAIL);
  const value = detail?.trim();
  if (needsDetail && !value) {
    throw new Error(`WhatsApp: a mensagem "${template}" exige um detalhe (tratamento ou área).`);
  }
  if (!needsDetail && detail !== undefined) {
    throw new Error(`WhatsApp: a mensagem "${template}" não aceita detalhe.`);
  }
  if (value && /[[\]]/.test(value)) {
    throw new Error(`WhatsApp: detalhe "${value}" com colchetes — preencha o dado real.`);
  }
  const message = needsDetail ? template.replace(DETAIL, () => value ?? '') : template;
  return `https://api.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(message)}`;
}

export function whatsappLink(origin: 'general' | 'faq'): string;
export function whatsappLink(origin: 'result' | 'treatment', detail: string): string;
export function whatsappLink(origin: WhatsAppOrigin, detail?: string): string {
  return buildWhatsAppLink(site.whatsapp.number, site.whatsapp.messages[origin], detail);
}

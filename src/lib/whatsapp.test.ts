import { describe, expect, it } from 'vitest';
import { buildWhatsAppLink, whatsappLink } from './whatsapp';

const PREFIX = 'https://api.whatsapp.com/send?phone=5561981007522&text=';

function messageOf(link: string): string {
  return new URL(link).searchParams.get('text') ?? '';
}

describe('whatsappLink', () => {
  it('usa o número 5561981007522 em todas as origens', () => {
    const links = [
      whatsappLink('general'),
      whatsappLink('faq'),
      whatsappLink('result', 'olheiras'),
      whatsappLink('treatment', 'harmonização facial'),
    ];
    for (const link of links) {
      expect(link.startsWith(PREFIX)).toBe(true);
      expect(new URL(link).searchParams.get('phone')).toBe('5561981007522');
    }
  });

  it('mensagem geral (hero e CTA final) literal do copy, codificada', () => {
    expect(messageOf(whatsappLink('general'))).toBe(
      'Olá! Vim pelo site e gostaria de agendar uma avaliação com a Dra. Laura.',
    );
    expect(whatsappLink('general')).toBe(
      `${PREFIX}Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20agendar%20uma%20avalia%C3%A7%C3%A3o%20com%20a%20Dra.%20Laura.`,
    );
  });

  it('mensagem do FAQ literal do copy', () => {
    expect(messageOf(whatsappLink('faq'))).toBe('Olá! Tenho uma dúvida antes de agendar.');
  });

  it('troca o [detalhe] dos blocos de resultado', () => {
    expect(messageOf(whatsappLink('result', 'bigode chinês'))).toBe(
      'Olá! Vi os resultados no site e quero saber mais sobre bigode chinês.',
    );
  });

  it('troca o [tratamento] dos cards e codifica acentos, espaços e o +', () => {
    const link = whatsappLink('treatment', 'rejuvenescimento 40+');
    expect(messageOf(link)).toBe('Olá! Tenho interesse em rejuvenescimento 40+. Podem me ajudar?');
    expect(link).toBe(
      `${PREFIX}Ol%C3%A1!%20Tenho%20interesse%20em%20rejuvenescimento%2040%2B.%20Podem%20me%20ajudar%3F`,
    );
    expect(link).not.toContain(' ');
  });
});

describe('buildWhatsAppLink', () => {
  const number = '5561981007522';

  it('codifica &, #, ? e $& do detalhe sem quebrar a URL', () => {
    const link = buildWhatsAppLink(number, 'Sobre {detail}.', 'A & B #1? $&');
    expect(messageOf(link)).toBe('Sobre A & B #1? $&.');
    expect(link).toContain('A%20%26%20B%20%231%3F%20%24%26');
  });

  it('apara espaços do detalhe', () => {
    expect(messageOf(buildWhatsAppLink(number, 'Sobre {detail}.', '  lábios  '))).toBe(
      'Sobre lábios.',
    );
  });

  it('exige detalhe quando a mensagem tem {detail}', () => {
    expect(() => buildWhatsAppLink(number, 'Sobre {detail}.')).toThrow(/exige um detalhe/);
    expect(() => buildWhatsAppLink(number, 'Sobre {detail}.', '   ')).toThrow(/exige um detalhe/);
  });

  it('recusa detalhe em mensagem sem {detail}', () => {
    expect(() => buildWhatsAppLink(number, 'Olá!', 'x')).toThrow(/não aceita detalhe/);
  });

  it('recusa detalhe com colchetes (placeholder do copy não preenchido)', () => {
    expect(() => buildWhatsAppLink(number, 'Sobre {detail}.', '[tratamento]')).toThrow(/colchetes/);
  });

  it('recusa número fora do formato 55 + DDD + telefone', () => {
    expect(() => buildWhatsAppLink('61981007522', 'Olá!')).toThrow(/número/);
  });
});

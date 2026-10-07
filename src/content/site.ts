import { z } from 'zod';

/**
 * Conteúdo da landing — fonte única de TODO texto visível, copiado literalmente de docs/copy.md.
 * Regras:
 * - `null` = dado que a clínica ainda precisa enviar; todo caminho com `null` aparece em `pending[].fields`.
 * - Campo que não se aplica fica ausente (opcional), nunca `null`.
 * - RichTitle { before, em, after }: `em` é exatamente o trecho em itálico rosé do PDF.
 * - Microtextos que o copy não traz ficam em `ui`, `results.beforeLabel/afterLabel`,
 *   `finalCta.mapsLabel/wazeLabel`, `brand` e `privacy` (definidos no plano de implementação).
 */

const text = z.string().min(1);
const httpsUrl = z.url({ protocol: /^https$/ });

const richTitleSchema = z.strictObject({ before: z.string(), em: text, after: z.string() });
export type RichTitle = z.infer<typeof richTitleSchema>;

export const contentIcons = [
  'user-focus',
  'drop',
  'leaf',
  'person',
  'medal',
  'sparkle',
  'armchair',
  'calendar-check',
  'ear',
  'scan',
  'clipboard-text',
  'arrows-clockwise',
] as const;
const iconSchema = z.enum(contentIcons);
export type ContentIcon = z.infer<typeof iconSchema>;

const treatmentSlugSchema = z.enum(['harmonizacao', 'rejuvenescimento', 'kbeauty', 'corporal']);
export type TreatmentSlug = z.infer<typeof treatmentSlugSchema>;

const resultSlugSchema = z.enum(['olhar', 'mandibula', 'labios', 'bigode']);
export type ResultSlug = z.infer<typeof resultSlugSchema>;

const clinicSlotSchema = z.enum(['recepcao', 'sala', 'equipe', 'detalhes']);
export type ClinicSlot = z.infer<typeof clinicSlotSchema>;

const pendingIdSchema = z.enum([
  'registro-profissional',
  'autorizacao-imagens',
  'logo-vetor',
  'horario-estacionamento',
  'nome-metodo-tratamentos',
  'segundo-numero',
  'formacao-academica',
]);

export const siteSchema = z.strictObject({
  seo: z.strictObject({
    title: text.max(60),
    description: text.max(155),
    ogTitle: text,
    ogImageAlt: text,
  }),
  brand: z.strictObject({ wordmark: text, tagline: text }),
  business: z.strictObject({
    name: text,
    legalName: text,
    foundingYear: z.number().int().min(2000).max(2100),
    openingHours: text,
    address: z.strictObject({
      street: text,
      neighborhood: text,
      city: text,
      region: z.string().length(2),
      postalCode: z.string().regex(/^\d{5}-\d{3}$/),
      country: z.literal('BR'),
      full: text,
      mapsQuery: text,
    }),
    instagram: z
      .array(z.strictObject({ handle: z.string().regex(/^@[\w.]+$/), url: httpsUrl }))
      .length(2),
  }),
  whatsapp: z.strictObject({
    number: z.string().regex(/^55\d{10,11}$/),
    display: text,
    messages: z.strictObject({
      general: text,
      result: text.includes('{detail}'),
      treatment: text.includes('{detail}'),
      faq: text,
    }),
  }),
  responsibleTechnician: z.strictObject({
    name: text,
    profession: text.nullable(),
    registration: text.nullable(),
  }),
  ui: z.strictObject({
    skipLink: text,
    navLabel: text,
    menuLabel: text,
    menuOpen: text,
    menuClose: text,
    marqueeLabel: text,
    pauseMarquee: text,
    pauseCarousel: text,
    compare: text,
    moreAbout: text,
    starsLabel: text.includes('{n}'),
    sourceGoogle: text,
    sourceInstagram: text,
    backHome: text,
  }),
  marquee: z.array(z.strictObject({ text, italic: z.boolean() })).min(5),
  nav: z.strictObject({
    links: z
      .array(z.strictObject({ label: text, href: z.string().regex(/^#[a-z0-9-]+$/) }))
      .length(6),
    cta: text,
  }),
  hero: z.strictObject({
    eyebrow: text,
    title: richTitleSchema,
    subtitle: text,
    primaryCta: text,
    secondaryCta: text,
    seals: z.array(z.strictObject({ lead: text, rest: text, star: z.boolean() })).length(2),
    badge: z.strictObject({ value: text, label: text }),
    imageAlt: text,
  }),
  press: z.strictObject({
    eyebrow: text,
    support: text,
    items: z.array(z.strictObject({ outlet: text, title: text, note: text.optional() })).length(4),
  }),
  treatments: z.strictObject({
    eyebrow: text,
    title: richTitleSchema,
    lead: text,
    linkLabel: text,
    items: z
      .array(
        z.strictObject({
          slug: treatmentSlugSchema,
          title: text,
          text,
          whatsappDetail: text,
          icon: iconSchema,
        }),
      )
      .length(4),
  }),
  results: z.strictObject({
    eyebrow: text,
    title: richTitleSchema,
    lead: text,
    cta: text,
    legend: text,
    altTemplate: text.includes('{area}'),
    beforeLabel: text,
    afterLabel: text,
    blocks: z
      .array(
        z.strictObject({
          slug: resultSlugSchema,
          number: z.string().regex(/^0\d$/),
          title: richTitleSchema,
          text,
          area: text,
        }),
      )
      .length(4),
    carouselIntro: text,
    carouselAlt: text,
  }),
  method: z.strictObject({
    name: text,
    eyebrow: text,
    title: richTitleSchema,
    lead: text,
    steps: z.array(z.strictObject({ title: text, text, icon: iconSchema })).length(4),
    cta: text,
  }),
  about: z.strictObject({
    eyebrow: text,
    title: richTitleSchema,
    paragraphs: z.array(text).length(2),
    education: text.nullable(),
    quote: z.strictObject({ text, source: text }),
    signature: text,
    stats: z
      .array(
        z.strictObject({
          value: text,
          label: text,
          countTo: z.number().int().positive().optional(),
          prefix: z.string().optional(),
          suffix: z.string().optional(),
        }),
      )
      .length(4),
    cta: text,
    imageAlt: text,
  }),
  testimonials: z.strictObject({ eyebrow: text, title: richTitleSchema, lead: text, cta: text }),
  clinic: z.strictObject({
    eyebrow: text,
    title: richTitleSchema,
    text,
    highlights: z.array(z.strictObject({ label: text, icon: iconSchema })).length(4),
    gallery: z
      .array(z.strictObject({ slot: clinicSlotSchema, caption: text, alt: text }))
      .length(4),
  }),
  faq: z.strictObject({
    eyebrow: text,
    title: richTitleSchema,
    items: z.array(z.strictObject({ question: text, answer: text })).length(9),
    ctaLead: text,
    cta: text,
  }),
  finalCta: z.strictObject({
    eyebrow: text,
    title: richTitleSchema,
    text,
    button: text,
    support: text,
    mapsLabel: text,
    wazeLabel: text,
  }),
  footer: z.strictObject({
    technicianLabel: text,
    copyright: text,
    privacyLabel: text,
    whatsappLabel: text,
    instagramLabel: text,
  }),
  floatingButton: z.strictObject({ label: text }),
  privacy: z.strictObject({
    title: text,
    seoTitle: text.max(60),
    seoDescription: text.max(155),
    updated: text,
    sections: z.array(z.strictObject({ heading: text, paragraphs: z.array(text).min(1) })).min(1),
  }),
  pending: z
    .array(
      z.strictObject({
        id: pendingIdSchema,
        description: text,
        fields: z.array(z.string()),
        blocksCustomDomain: z.boolean(),
      }),
    )
    .length(7),
});

export type Site = z.infer<typeof siteSchema>;

const siteData = {
  seo: {
    title: 'Harmonização Facial no Sudoeste | Dra. Laura Tavares',
    description:
      'Rejuvenescimento natural para 40+ no Sudoeste, Brasília. +25 mil atendimentos com a Dra. Laura Tavares. Agende sua avaliação pelo WhatsApp.',
    ogTitle: 'Clínica Laura Tavares · Rejuvenescer sem deixar de ser você',
    ogImageAlt: 'Clínica Laura Tavares · Rejuvenescer sem deixar de ser você',
  },
  brand: { wordmark: 'Laura Tavares', tagline: 'Estética Avançada' },
  business: {
    name: 'Clínica Laura Tavares',
    legalName: 'Clínica Laura Tavares — Estética Avançada',
    foundingYear: 2018,
    openingHours: 'Segunda a sábado, com hora marcada',
    address: {
      street: 'CLSW 303, Bloco C, sala 70, Edifício Le Parc',
      neighborhood: 'Sudoeste',
      city: 'Brasília',
      region: 'DF',
      postalCode: '70673-623',
      country: 'BR',
      full: 'CLSW 303, Bloco C, sala 70, Edifício Le Parc, Sudoeste, Brasília – DF, 70673-623',
      mapsQuery:
        'Clínica Laura Tavares, CLSW 303, Bloco C, Edifício Le Parc, Sudoeste, Brasília - DF, 70673-623',
    },
    instagram: [
      { handle: '@clinicalauratavaress', url: 'https://www.instagram.com/clinicalauratavaress/' },
      { handle: '@dra.lauratavares', url: 'https://www.instagram.com/dra.lauratavares/' },
    ],
  },
  whatsapp: {
    number: '5561981007522',
    display: '(61) 98100-7522',
    messages: {
      general: 'Olá! Vim pelo site e gostaria de agendar uma avaliação com a Dra. Laura.',
      result: 'Olá! Vi os resultados no site e quero saber mais sobre {detail}.',
      treatment: 'Olá! Tenho interesse em {detail}. Podem me ajudar?',
      faq: 'Olá! Tenho uma dúvida antes de agendar.',
    },
  },
  responsibleTechnician: { name: 'Dra. Laura Tavares', profession: null, registration: null },
  ui: {
    skipLink: 'Pular para o conteúdo',
    navLabel: 'Principal',
    menuLabel: 'Menu',
    menuOpen: 'Abrir menu',
    menuClose: 'Fechar menu',
    marqueeLabel: 'Destaques da clínica',
    pauseMarquee: 'Pausar faixa de destaques',
    pauseCarousel: 'Pausar carrossel de resultados',
    compare: 'Comparar antes e depois',
    moreAbout: 'sobre',
    starsLabel: '{n} de 5 estrelas',
    sourceGoogle: 'Avaliação no Google',
    sourceInstagram: 'Depoimento no Instagram',
    backHome: 'Voltar para o início',
  },
  marquee: [
    { text: '+25 mil atendimentos', italic: false },
    { text: 'Harmonização facial', italic: true },
    { text: '9 anos de experiência', italic: false },
    { text: 'AMWC Coreia 2026', italic: true },
    { text: 'Melhor Atendimento · Santa Permuta 2026', italic: false },
    { text: 'K-Beauty na clínica', italic: true },
    { text: 'Sudoeste · Brasília', italic: false },
  ],
  nav: {
    links: [
      { label: 'Início', href: '#inicio' },
      { label: 'Tratamentos', href: '#tratamentos' },
      { label: 'Resultados', href: '#resultados' },
      { label: 'A Dra. Laura', href: '#dra-laura' },
      { label: 'A clínica', href: '#a-clinica' },
      { label: 'Dúvidas', href: '#duvidas' },
    ],
    cta: 'Agendar avaliação',
  },
  hero: {
    eyebrow: 'HARMONIZAÇÃO FACIAL · SUDOESTE, BRASÍLIA',
    title: { before: 'Rejuvenescer sem deixar de ', em: 'ser você.', after: '' },
    subtitle:
      'Protocolos individuais para a pele 40+, com naturalidade, segurança e planejamento. Do jeito que a Dra. Laura Tavares já fez em mais de 25 mil atendimentos.',
    primaryCta: 'Agendar minha avaliação',
    secondaryCta: 'Ver resultados reais',
    seals: [
      { lead: 'Melhor Atendimento', rest: ' — Santa Permuta 2026', star: true },
      { lead: 'Formação internacional', rest: ' — AMWC Coreia 2026', star: false },
    ],
    badge: { value: '+25 mil', label: 'atendimentos realizados' },
    imageAlt: 'Dra. Laura Tavares na recepção da clínica de estética no Sudoeste, Brasília',
  },
  press: {
    eyebrow: 'NA MÍDIA',
    support: 'Uma trajetória reconhecida pela imprensa de Brasília.',
    items: [
      {
        outlet: 'Revista Orla BSB',
        title: '"Laura Tavares celebra 8 anos e consolida clínica de estética no Sudoeste"',
        note: 'capa, edição nº 4',
      },
      { outlet: 'Diário de Brasília', title: 'Prêmio de Melhor Atendimento no Santa Permuta 2026' },
      {
        outlet: 'W3 Notícias',
        title: 'Korean Beauty Day traz a Brasília as tendências da beleza coreana',
      },
      { outlet: 'Diário de Brasília', title: 'Coautora do livro "Sua Voz Vale Ouro"' },
    ],
  },
  treatments: {
    eyebrow: 'TRATAMENTOS',
    title: { before: 'Cuidado avançado, ', em: 'do seu jeito.', after: '' },
    lead: 'Cada tratamento começa com uma avaliação do seu rosto. Nada de fórmula pronta: o plano é desenhado para os seus traços e para o que você quer sentir ao se olhar no espelho.',
    linkLabel: 'Saiba mais',
    items: [
      {
        slug: 'harmonizacao',
        title: 'Harmonização facial',
        text: 'Equilíbrio e proporção que realçam os traços que fazem de você quem você é.',
        whatsappDetail: 'harmonização facial',
        icon: 'user-focus',
      },
      {
        slug: 'rejuvenescimento',
        title: 'Rejuvenescimento 40+',
        text: 'Bioestimuladores e protocolos regenerativos para devolver firmeza e viço, sem rosto congelado.',
        whatsappDetail: 'rejuvenescimento 40+',
        icon: 'drop',
      },
      {
        slug: 'kbeauty',
        title: 'K-Beauty na clínica',
        text: 'Tecnologias e produtos trazidos da Coreia para uma pele saudável, hidratada e luminosa.',
        whatsappDetail: 'K-Beauty na clínica',
        icon: 'leaf',
      },
      {
        slug: 'corporal',
        title: 'Harmonização corporal',
        text: 'Protocolos para contorno e qualidade da pele do corpo, com o mesmo olhar de naturalidade.',
        whatsappDetail: 'harmonização corporal',
        icon: 'person',
      },
    ],
  },
  results: {
    eyebrow: 'RESULTADOS REAIS',
    title: { before: 'Naturalidade que ', em: 'se vê', after: ', não que se nota.' },
    lead: 'O espelho conta o que incomoda. A Dra. Laura trata a causa, com sutileza, para que as pessoas percebam você mais descansada, e não "diferente".',
    cta: 'Agendar minha avaliação',
    legend: 'Imagens publicadas com autorização. Resultados variam de pessoa para pessoa.',
    altTemplate: 'Antes e depois de tratamento para {area}, paciente com autorização de imagem',
    beforeLabel: 'Antes',
    afterLabel: 'Depois',
    blocks: [
      {
        slug: 'olhar',
        number: '01',
        title: { before: 'Adeus ao ', em: 'olhar de cansaço', after: '' },
        text: 'Aquela aparência de quem dormiu pouco, mesmo depois de uma boa noite. Repor o volume das maçãs do rosto e suavizar as olheiras devolve vitalidade ao olhar, sem mudar a sua expressão.',
        area: 'olheiras',
      },
      {
        slug: 'mandibula',
        number: '02',
        title: { before: 'Contornos ', em: 'de precisão', after: '' },
        text: 'Com o tempo, a mandíbula perde definição e o rosto parece "cair". Redesenhar a linha da mandíbula e do queixo traz um perfil mais firme e harmonioso, respeitando seus traços.',
        area: 'mandíbula',
      },
      {
        slug: 'labios',
        number: '03',
        title: { before: 'Lábios com ', em: 'hidratação e volume', after: '' },
        text: 'Lábios mais finos e ressecados envelhecem o sorriso. O tratamento devolve contorno, simetria e um viço natural, na medida certa para o seu rosto.',
        area: 'lábios',
      },
      {
        slug: 'bigode',
        number: '04',
        title: { before: 'Suavize o ', em: 'bigode chinês', after: '' },
        text: 'Os sulcos ao redor da boca deixam o semblante mais sério e cansado. Suavizá-los de forma sutil traz leveza, sem aquele aspecto preenchido.',
        area: 'bigode chinês',
      },
    ],
    carouselIntro: 'Elas confiaram na Dra. Laura. Deslize e veja mais resultados.',
    carouselAlt:
      'Resultado de tratamento na Clínica Laura Tavares, paciente com autorização de imagem',
  },
  method: {
    name: 'Protocolo Identidade LT',
    eyebrow: 'COMO FUNCIONA',
    title: { before: 'Um método para rejuvenescer ', em: 'sem exageros.', after: '' },
    lead: 'O Protocolo Identidade LT nasceu de 9 anos e mais de 25 mil atendimentos. Ele parte de uma ideia simples: o seu rosto tem uma história, e o tratamento deve respeitá-la.',
    steps: [
      {
        title: 'Escuta',
        text: 'Você conta o que incomoda e o que não quer perder. A conversa vem antes de qualquer agulha.',
        icon: 'ear',
      },
      {
        title: 'Análise facial',
        text: 'A Dra. avalia estrutura, pele e expressões para entender a causa do envelhecimento, não só o sintoma.',
        icon: 'scan',
      },
      {
        title: 'Plano individual',
        text: 'Um protocolo desenhado para você, com etapas, prazos e expectativas explicadas com clareza.',
        icon: 'clipboard-text',
      },
      {
        title: 'Acompanhamento',
        text: 'Retorno para avaliar a evolução e planejar a manutenção no tempo certo.',
        icon: 'arrows-clockwise',
      },
    ],
    cta: 'Quero começar pela avaliação',
  },
  about: {
    eyebrow: 'QUEM CUIDA DE VOCÊ',
    title: { before: 'Prazer, ', em: 'Laura Tavares.', after: '' },
    paragraphs: [
      'Há 9 anos, a Dra. Laura Tavares escolheu um caminho diferente na estética: o de rejuvenescer sem apagar quem a paciente é. Em 2018 abriu a clínica no Sudoeste e, em oito anos, fez dela uma das referências em harmonização facial de Brasília.',
      'São mais de 25 mil atendimentos, formação internacional no AMWC Coreia 2026, o maior congresso de estética avançada do mundo, e o prêmio de Melhor Atendimento no Santa Permuta 2026. Mas o que as pacientes mais comentam é outra coisa: ela escuta antes de indicar qualquer procedimento.',
    ],
    education: null,
    quote: {
      text: 'Meu compromisso é entregar segurança, planejamento e resultados que respeitem a individualidade.',
      source: 'Revista Orla BSB',
    },
    signature: 'Laura Tavares',
    stats: [
      { value: '+25 mil', label: 'atendimentos', countTo: 25, prefix: '+', suffix: ' mil' },
      { value: '9 anos', label: 'de experiência', countTo: 9, suffix: ' anos' },
      { value: '8 anos', label: 'de clínica no Sudoeste', countTo: 8, suffix: ' anos' },
      { value: 'AMWC', label: 'Coreia 2026' },
    ],
    cta: 'Agendar avaliação com a Dra. Laura',
    imageAlt: 'Retrato da Dra. Laura Tavares',
  },
  testimonials: {
    eyebrow: 'QUEM JÁ VIVEU A EXPERIÊNCIA',
    title: { before: 'Mulheres reais. ', em: 'Histórias reais.', after: '' },
    lead: 'Mais do que um resultado bonito, elas encontraram um lugar onde se sentem ouvidas e seguras.',
    cta: 'Quero ser a próxima história',
  },
  clinic: {
    eyebrow: 'A CLÍNICA',
    title: { before: 'Um espaço pensado para ', em: 'você desacelerar.', after: '' },
    text: 'No coração do Sudoeste, a Clínica Laura Tavares foi criada para ser uma pausa no seu dia. Ambiente acolhedor, equipe treinada para receber bem e tecnologia de ponta, incluindo protocolos e produtos de K-Beauty trazidos diretamente da Coreia.',
    highlights: [
      { label: 'Equipe premiada em atendimento', icon: 'medal' },
      { label: 'Tecnologia e produtos coreanos', icon: 'sparkle' },
      { label: 'Ambiente reservado e acolhedor', icon: 'armchair' },
      { label: 'Segunda a sábado, com hora marcada', icon: 'calendar-check' },
    ],
    gallery: [
      {
        slot: 'recepcao',
        caption: 'Recepção',
        alt: 'Recepção da Clínica Laura Tavares, Estética Avançada, no CLSW 303',
      },
      {
        slot: 'sala',
        caption: 'Sala de procedimentos',
        alt: 'Sala de procedimentos da Clínica Laura Tavares',
      },
      {
        slot: 'equipe',
        caption: 'Nossa equipe',
        alt: 'Equipe da Clínica Laura Tavares em frente ao letreiro da clínica',
      },
      {
        slot: 'detalhes',
        caption: 'Detalhes que cuidam de você',
        alt: 'Detalhes da Clínica Laura Tavares',
      },
    ],
  },
  faq: {
    eyebrow: 'DÚVIDAS',
    title: { before: 'Tudo o que você quer saber ', em: 'antes de agendar.', after: '' },
    items: [
      {
        question: 'Vou ficar com o rosto artificial?',
        answer:
          'Não é esse o objetivo. Cada plano é feito para realçar os seus traços, com doses e pontos definidos para o seu rosto. A ideia é que as pessoas notem você mais descansada, não um procedimento.',
      },
      {
        question: 'Como funciona a avaliação?',
        answer:
          'É uma consulta com a Dra. Laura para ouvir suas queixas, analisar seu rosto e montar um plano individual. Você sai sabendo o que faz sentido, por quê e em quantas etapas.',
      },
      {
        question: 'Dói?',
        answer:
          'O desconforto costuma ser leve. Usamos anestésicos e técnicas que deixam a sessão mais tranquila.',
      },
      {
        question: 'Preciso me afastar da rotina?',
        answer:
          'Na maioria dos procedimentos, não. Pode haver um leve inchaço ou pontos roxos nos primeiros dias, e a Dra. passa todos os cuidados.',
      },
      {
        question: 'Quanto tempo dura o resultado?',
        answer:
          'Depende do procedimento, da área tratada e do seu organismo. Na avaliação, você recebe a estimativa e o plano de manutenção.',
      },
      {
        question: 'Qual a diferença entre preenchimento e toxina botulínica?',
        answer:
          'O preenchimento repõe volume e define contornos, como lábios e mandíbula. A toxina relaxa músculos para suavizar rugas de expressão, como na testa e nos olhos. Muitas vezes os dois se complementam.',
      },
      {
        question: 'A partir de que idade posso fazer?',
        answer:
          'Não existe idade certa, existe indicação. A Dra. avalia cada caso e só indica o que for seguro e necessário para você.',
      },
      {
        question: 'Quanto custa?',
        answer:
          'O valor depende do plano indicado para o seu rosto, por isso é definido na avaliação. Fale com a nossa equipe pelo WhatsApp para agendar.',
      },
      {
        question: 'Onde fica a clínica?',
        answer:
          'CLSW 303, Bloco C, sala 70, Edifício Le Parc, Sudoeste, Brasília. Atendimento de segunda a sábado, com hora marcada.',
      },
    ],
    ctaLead: 'Ainda com dúvida?',
    cta: 'Fale com a nossa equipe no WhatsApp',
  },
  finalCta: {
    eyebrow: 'O PRIMEIRO PASSO',
    title: { before: 'O seu rosto tem uma história. ', em: 'Vamos cuidar dela juntas?', after: '' },
    text: 'Agende sua avaliação com a Dra. Laura Tavares e receba um plano pensado só para você.',
    button: 'Agendar pelo WhatsApp',
    support: 'Segunda a sábado · CLSW 303, Sudoeste · Brasília',
    mapsLabel: 'Abrir no Google Maps',
    wazeLabel: 'Abrir no Waze',
  },
  footer: {
    technicianLabel: 'Responsável técnica',
    copyright: '© 2026 Clínica Laura Tavares',
    privacyLabel: 'Política de privacidade',
    whatsappLabel: 'WhatsApp',
    instagramLabel: 'Instagram',
  },
  floatingButton: { label: 'Agende pelo WhatsApp' },
  privacy: {
    title: 'Política de privacidade',
    seoTitle: 'Política de privacidade | Clínica Laura Tavares',
    seoDescription:
      'Como a Clínica Laura Tavares trata dados neste site: sem formulários, sem cookies e sem ferramentas de análise.',
    updated: 'Última atualização: 5 de outubro de 2026.',
    sections: [
      {
        heading: 'Quem somos',
        paragraphs: [
          'Este site é da Clínica Laura Tavares — Estética Avançada, CLSW 303, Bloco C, sala 70, Edifício Le Parc, Sudoeste, Brasília – DF, 70673-623. Contato: WhatsApp (61) 98100-7522.',
        ],
      },
      {
        heading: 'O que este site coleta',
        paragraphs: [
          'Este site não tem formulários, não usa cookies e não usa ferramentas de análise, publicidade ou rastreamento. Fontes, imagens e vídeos são servidos pelo próprio site, sem chamadas a serviços de terceiros durante a navegação.',
        ],
      },
      {
        heading: 'Registros técnicos da hospedagem',
        paragraphs: [
          'O site é hospedado pela Vercel. Como qualquer servidor, a hospedagem registra dados técnicos de acesso, como endereço IP, data e hora, página acessada e tipo de navegador, para segurança e funcionamento do serviço, conforme a política de privacidade da Vercel.',
        ],
      },
      {
        heading: 'Contato pelo WhatsApp',
        paragraphs: [
          'Os botões de agendamento abrem o WhatsApp com uma mensagem pronta que informa apenas de qual parte do site você veio. A partir daí, a conversa acontece no WhatsApp e segue a política de privacidade do WhatsApp (Meta). Os dados que você compartilhar na conversa são usados somente para responder você e organizar o seu atendimento.',
        ],
      },
      {
        heading: 'Links para outros sites',
        paragraphs: [
          'Links para Instagram, Google Maps, Waze e matérias de imprensa levam a sites de terceiros, que têm políticas de privacidade próprias.',
        ],
      },
      {
        heading: 'Seus direitos',
        paragraphs: [
          'Pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode pedir confirmação, acesso, correção ou eliminação dos seus dados pessoais tratados pela clínica. Para isso, fale com a nossa equipe pelo WhatsApp (61) 98100-7522.',
        ],
      },
    ],
  },
  pending: [
    {
      id: 'registro-profissional',
      description:
        'Profissão, conselho e número de registro da Dra. (rodapé e seção Sobre) — obrigatório antes de publicar em domínio próprio.',
      fields: ['responsibleTechnician.profession', 'responsibleTechnician.registration'],
      blocksCustomDomain: true,
    },
    {
      id: 'autorizacao-imagens',
      description: 'Termos de autorização de imagem dos antes/depois e dos depoimentos usados.',
      fields: ['results.legend'],
      blocksCustomDomain: false,
    },
    {
      id: 'logo-vetor',
      description: 'Logo em vetor (SVG/PDF) e assinatura real em SVG.',
      fields: ['brand.wordmark', 'about.signature'],
      blocksCustomDomain: false,
    },
    {
      id: 'horario-estacionamento',
      description: 'Horário exato de funcionamento e se há estacionamento.',
      fields: ['business.openingHours'],
      blocksCustomDomain: false,
    },
    {
      id: 'nome-metodo-tratamentos',
      description:
        'Nome final do método (Protocolo Identidade LT × Método LT) e lista final de tratamentos.',
      fields: ['method.name', 'treatments.items'],
      blocksCustomDomain: false,
    },
    {
      id: 'segundo-numero',
      description: 'Função do segundo número, (61) 98105-1565.',
      fields: ['whatsapp.number'],
      blocksCustomDomain: false,
    },
    {
      id: 'formacao-academica',
      description: 'Formação acadêmica da Dra. (uma linha no Sobre).',
      fields: ['about.education'],
      blocksCustomDomain: false,
    },
  ],
};

const parsed = siteSchema.safeParse(siteData);
if (!parsed.success) {
  throw new Error(`Conteúdo inválido em src/content/site.ts:\n${z.prettifyError(parsed.error)}`);
}

export const site: Site = parsed.data;

import type { Site } from '../content/site';

export interface BusinessJsonLd {
  '@context': 'https://schema.org';
  '@type': 'HealthAndBeautyBusiness';
  name: string;
  alternateName: string;
  description: string;
  url: string;
  image: string;
  telephone: string;
  foundingDate: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  sameAs: string[];
}

export interface FaqJsonLd {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: { '@type': 'Answer'; text: string };
  }>;
}

export function buildBusinessJsonLd(
  site: Site,
  { url, image }: { url: string; image: string },
): BusinessJsonLd {
  const { business } = site;
  return {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: business.name,
    alternateName: business.legalName,
    description: site.seo.description,
    url,
    image,
    telephone: `+${site.whatsapp.number}`,
    foundingDate: String(business.foundingYear),
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${business.address.street}, ${business.address.neighborhood}`,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
    sameAs: business.instagram.map((profile) => profile.url),
  };
}

export function buildFaqJsonLd(
  items: ReadonlyArray<{ question: string; answer: string }>,
): FaqJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/** JSON seguro para <script type="application/ld+json"> (não deixa fechar a tag). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

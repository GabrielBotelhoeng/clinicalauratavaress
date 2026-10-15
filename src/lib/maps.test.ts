import { describe, expect, it } from 'vitest';
import { site } from '../content/site';
import { mapLinks } from './maps';

describe('mapLinks', () => {
  it('monta os links do Google Maps e do Waze com o endereço codificado', () => {
    const links = mapLinks(site.business.address.mapsQuery);
    const encoded =
      'Cl%C3%ADnica%20Laura%20Tavares%2C%20CLSW%20303%2C%20Bloco%20C%2C%20Edif%C3%ADcio%20Le%20Parc%2C%20Sudoeste%2C%20Bras%C3%ADlia%20-%20DF%2C%2070673-623';
    expect(links.google).toBe(`https://www.google.com/maps/search/?api=1&query=${encoded}`);
    expect(links.waze).toBe(`https://waze.com/ul?q=${encoded}&navigate=yes`);
  });

  it('recusa endereço vazio', () => {
    expect(() => mapLinks('   ')).toThrow(/endereço vazio/);
  });
});

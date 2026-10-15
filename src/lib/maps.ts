/** Links "Abrir no Google Maps" e "Abrir no Waze" (sem embed: LGPD e performance). */
export function mapLinks(query: string): { google: string; waze: string } {
  const value = query.trim();
  if (!value) throw new Error('mapLinks: endereço vazio.');
  const encoded = encodeURIComponent(value);
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
    waze: `https://waze.com/ul?q=${encoded}&navigate=yes`,
  };
}

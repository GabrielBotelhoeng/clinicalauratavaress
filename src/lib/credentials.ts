/** "Profissão · Conselho e nº" — só quando os dois dados existem (compliance: tudo ou nada). */
export function credentialsLine(
  profession: string | null,
  registration: string | null,
): string | null {
  const job = profession?.trim();
  const council = registration?.trim();
  return job && council ? `${job} · ${council}` : null;
}

/** Linha do rodapé: "Responsável técnica: <nome>" + " · <profissão> · <registro>" quando houver. */
export function technicianLine(
  label: string,
  name: string,
  profession: string | null,
  registration: string | null,
): string {
  const credentials = credentialsLine(profession, registration);
  return credentials ? `${label}: ${name} · ${credentials}` : `${label}: ${name}`;
}

import { describe, expect, it } from 'vitest';
import { credentialsLine, technicianLine } from './credentials';

describe('credentialsLine', () => {
  it('só monta a linha quando profissão e registro existem', () => {
    expect(credentialsLine(null, null)).toBeNull();
    expect(credentialsLine('Profissão', null)).toBeNull();
    expect(credentialsLine('  ', 'Registro 0000')).toBeNull();
    expect(credentialsLine(' Profissão ', 'Registro 0000')).toBe('Profissão · Registro 0000');
  });
});

describe('technicianLine', () => {
  it('com registro pendente mostra só o nome', () => {
    expect(technicianLine('Responsável técnica', 'Dra. Laura Tavares', null, null)).toBe(
      'Responsável técnica: Dra. Laura Tavares',
    );
  });

  it('com os dados completos acrescenta profissão e registro', () => {
    expect(
      technicianLine('Responsável técnica', 'Dra. Laura Tavares', 'Profissão', 'Registro 0000'),
    ).toBe('Responsável técnica: Dra. Laura Tavares · Profissão · Registro 0000');
  });
});

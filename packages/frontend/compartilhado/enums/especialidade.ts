/**
 * Especialidades médicas disponíveis no atendimento itinerante.
 * Cada especialidade corresponde a um módulo de triagem do projeto
 * Escola Cidadã — Saúde em Movimento.
 */
export const Especialidade = {
  OFTALMOLOGIA: 'OFTALMOLOGIA',
  AUDIOMETRIA: 'AUDIOMETRIA',
  ODONTOLOGIA: 'ODONTOLOGIA',
  PSICOLOGIA: 'PSICOLOGIA',
  NUTRICAO: 'NUTRICAO',
} as const;

export type Especialidade = (typeof Especialidade)[keyof typeof Especialidade];

/** Labels em português para exibição na UI */
export const ESPECIALIDADE_LABELS: Record<Especialidade, string> = {
  OFTALMOLOGIA: 'Oftalmologia',
  AUDIOMETRIA: 'Audiometria',
  ODONTOLOGIA: 'Odontologia',
  PSICOLOGIA: 'Psicologia',
  NUTRICAO: 'Nutrição',
};

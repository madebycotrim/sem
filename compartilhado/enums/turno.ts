/**
 * Turnos de atendimento disponíveis.
 * Os atendimentos itinerantes ocorrem em turno Manhã ou Tarde,
 * seguindo o calendário escolar.
 */
export const Turno = {
  MANHA: 'MANHA',
  TARDE: 'TARDE',
} as const;

export type Turno = (typeof Turno)[keyof typeof Turno];

/** Labels em português para exibição na UI */
export const TURNO_LABELS: Record<Turno, string> = {
  MANHA: 'Manhã',
  TARDE: 'Tarde',
};

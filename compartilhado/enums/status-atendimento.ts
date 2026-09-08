export const StatusAtendimento = {
  AGENDADO: 'AGENDADO',
  CONFIRMADO: 'CONFIRMADO',
  EM_ATENDIMENTO: 'EM_ATENDIMENTO',
  CONCLUIDO: 'CONCLUIDO',
  CANCELADO: 'CANCELADO',
  FALTOU: 'FALTOU',
} as const;

export type StatusAtendimento = (typeof StatusAtendimento)[keyof typeof StatusAtendimento];

export const STATUS_ATENDIMENTO_LABELS: Record<StatusAtendimento, string> = {
  AGENDADO: 'Agendado',
  CONFIRMADO: 'Confirmado',
  EM_ATENDIMENTO: 'Em atendimento',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
  FALTOU: 'Faltou',
};
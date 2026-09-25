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

/**
 * Status expressamente permitidos para importação de consultas via planilha.
 * Apenas consultas com status Concluído ou Cancelado podem ser importadas.
 */
export const STATUS_PERMITIDOS_IMPORTACAO = [
  StatusAtendimento.CONCLUIDO,
  StatusAtendimento.CANCELADO,
] as const;

const normalizarTexto = (valor?: string | null): string =>
  (valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/**
 * Validação estrita dos status permitidos para importação de planilhas.
 * Conforme regra de negócio, a importação permite APENAS consultas com status:
 * - Concluído (ou variações: realizado, atendido, finalizado)
 * - Cancelados / Cancelado (ou variações: cancelados, cancelada, desistência)
 *
 * Retorna o enum StatusAtendimento (CONCLUIDO ou CANCELADO) ou null para qualquer outro status
 * (como Agendado, Faltou, Confirmado, vazio, etc.), indicando que a linha não deve ser importada.
 */
export function identificarStatusPermitidoImportacao(termo?: string | null): StatusAtendimento | null {
  if (!termo) return null;
  const norm = normalizarTexto(termo);
  if (!norm) return null;

  if (
    norm.includes('concluid') ||
    norm.includes('realizad') ||
    norm.includes('atendid') ||
    norm.includes('finalizad')
  ) {
    return StatusAtendimento.CONCLUIDO;
  }

  if (
    norm.includes('cancelad') ||
    norm.includes('desist')
  ) {
    return StatusAtendimento.CANCELADO;
  }

  return null;
}
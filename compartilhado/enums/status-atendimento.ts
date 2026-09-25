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

  // 1. Prioridade Absoluta: Termos de cancelamento, desistência e negações
  // NUNCA avaliar termos positivos primeiro, pois "não atendido" e "não realizado" contêm "atendid" e "realizad"!
  if (
    norm.includes('cancel') ||
    norm.includes('canc') ||
    norm.includes('desist') ||
    norm.includes('nao atendid') ||
    norm.includes('nao atendeu') ||
    norm.includes('nao realizad') ||
    norm.includes('nao concluid') ||
    norm.includes('sem atend') ||
    norm.includes('sem realiz') ||
    norm.includes('sem conclu') ||
    norm.includes('inapt') ||
    norm.includes('recus') ||
    norm.includes('suspens') ||
    norm.includes('anulad') ||
    norm === 'nao' ||
    norm === 'n'
  ) {
    return StatusAtendimento.CANCELADO;
  }

  // 2. Termos de conclusão e atendimento positivo
  if (
    norm.includes('concluid') ||
    norm.includes('realizad') ||
    norm.includes('atendid') ||
    norm.includes('finalizad') ||
    norm === 'ok' ||
    norm === 'sim' ||
    norm === 's'
  ) {
    return StatusAtendimento.CONCLUIDO;
  }

  return null;
}

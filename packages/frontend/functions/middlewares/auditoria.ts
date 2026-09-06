/**
 * Utilitário de Auditoria — Modo Otimizado para Cloudflare D1 Free Tier.
 * 
 * Emite logs estruturados via console do Cloudflare Workers / Pages
 * (capturados pelo Cloudflare Logs em tempo real), sem realizar INSERTs no D1
 * para economizar a cota de 500MB do plano gratuito.
 */

export interface DadosAuditoria {
  userId: string;
  acao: string;
  entidade: string;
  entidadeId?: string;
  diffAnterior?: Record<string, unknown>;
  diffPosterior?: Record<string, unknown>;
  ip: string;
}

/**
 * Registra auditoria apenas no stdout/streaming de logs da Cloudflare (zero custo de storage D1).
 */
export async function registrarAuditoria(
  _prisma: unknown,
  dados: DadosAuditoria
): Promise<void> {
  console.info(
    JSON.stringify({
      tipo: 'AUDITORIA',
      timestamp: new Date().toISOString(),
      ...dados,
    })
  );
}

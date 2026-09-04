import { prisma } from '../infraestrutura/banco/prisma.js';
import { logger } from '../infraestrutura/logger/pino.js';

/**
 * Utilitário de Auditoria — LGPD (Art. 37, 38).
 *
 * Registra ações que alteram dados sensíveis na tabela AuditLog.
 * A tabela é tecnicamente imutável:
 * - DEV (SQLite): sem update/delete no Prisma Client (convenção)
 * - PROD (PostgreSQL): REVOKE UPDATE, DELETE no banco
 *
 * Registra: QUEM, QUANDO (UTC), IP, AÇÃO e diff da alteração.
 *
 * ATENÇÃO: Este utilitário faz INSERT apenas. NUNCA exponha
 * prisma.auditLog.update() ou prisma.auditLog.delete() em qualquer
 * parte do código de aplicação.
 */

export interface DadosAuditoria {
  /** ID do usuário que realizou a ação */
  userId: string;
  /** Tipo da ação: CREATE | UPDATE | DELETE | LOGIN | LOGOUT | EXPORT | MFA_ENABLE | etc. */
  acao: string;
  /** Nome do modelo/entidade afetada */
  entidade: string;
  /** ID do registro afetado (se aplicável) */
  entidadeId?: string;
  /** Estado anterior do registro (JSON) — para UPDATE/DELETE */
  diffAnterior?: Record<string, unknown>;
  /** Estado posterior do registro (JSON) — para CREATE/UPDATE */
  diffPosterior?: Record<string, unknown>;
  /** IP de origem da requisição */
  ip: string;
}

/**
 * Registra uma entrada na tabela de auditoria.
 *
 * @example
 * ```typescript
 * await registrarAuditoria({
 *   userId: request.user.userId,
 *   acao: 'CREATE',
 *   entidade: 'Patient',
 *   entidadeId: paciente.id,
 *   diffPosterior: { turma: 'T1', escolaLocalId: '...' },
 *   ip: request.ip,
 * });
 * ```
 */
export async function registrarAuditoria(dados: DadosAuditoria): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: dados.userId,
        acao: dados.acao,
        entidade: dados.entidade,
        entidadeId: dados.entidadeId ?? null,
        diffAnterior: dados.diffAnterior
          ? JSON.stringify(dados.diffAnterior)
          : null,
        diffPosterior: dados.diffPosterior
          ? JSON.stringify(dados.diffPosterior)
          : null,
        ip: dados.ip,
      },
    });
  } catch (erro) {
    // Falha de auditoria é grave — log como error, mas não derruba a operação
    logger.error(
      {
        erro,
        userId: dados.userId,
        acao: dados.acao,
        entidade: dados.entidade,
      },
      'FALHA CRÍTICA: Não foi possível registrar entrada de auditoria (LGPD)'
    );
  }
}

import { getDb } from '../infraestrutura/banco/drizzle.js';
import { tentativasLogin } from '../infraestrutura/banco/schema.js';
import { eq, and, gte, sql } from 'drizzle-orm';

/**
 * Constantes de configuração de brute force.
 */
const MAX_TENTATIVAS = 5;
const JANELA_BLOQUEIO_MINUTOS = 15;

/**
 * Verifica se o email está bloqueado por excesso de tentativas falhas.
 *
 * @returns bloqueado=true se excedeu o limite, com o tempo de retry.
 */
export async function verificarBloqueioLogin(
  dbBinding: unknown,
  email: string,
  _ip: string
): Promise<{ bloqueado: boolean; retryAfterSegundos: number }> {
  const db = getDb(dbBinding);
  const limiteTimestamp = new Date(
    Date.now() - JANELA_BLOQUEIO_MINUTOS * 60 * 1000
  ).toISOString();

  if (typeof db?.select !== 'function') {
    return { bloqueado: false, retryAfterSegundos: 0 };
  }

  const [resultado] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(tentativasLogin)
    .where(
      and(
        eq(tentativasLogin.email, email.toLowerCase()),
        eq(tentativasLogin.sucesso, false),
        gte(tentativasLogin.criadoEm, limiteTimestamp)
      )
    );

  const tentativasFalhas = resultado?.total ?? 0;

  if (tentativasFalhas >= MAX_TENTATIVAS) {
    return {
      bloqueado: true,
      retryAfterSegundos: JANELA_BLOQUEIO_MINUTOS * 60,
    };
  }

  return { bloqueado: false, retryAfterSegundos: 0 };
}

/**
 * Registra uma tentativa de login (sucesso ou falha).
 */
export async function registrarTentativaLogin(
  dbBinding: unknown,
  email: string,
  ip: string,
  sucesso: boolean
): Promise<void> {
  const db = getDb(dbBinding);
  if (typeof db?.insert !== 'function') {
    return;
  }
  await db.insert(tentativasLogin).values({
    email: email.toLowerCase(),
    ip,
    sucesso,
  });
}

/**
 * Limpa tentativas de login antigas (mais de 24h).
 * Deve ser chamado periodicamente pela rota de manutenção.
 */
export async function limparTentativasAntigas(
  dbBinding: unknown
): Promise<number> {
  const db = getDb(dbBinding);
  const limite = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const resultado = await db
    .delete(tentativasLogin)
    .where(sql`${tentativasLogin.criadoEm} < ${limite}`);
  return (resultado as unknown as { changes?: number }).changes ?? 0;
}

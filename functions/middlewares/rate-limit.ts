import type { MiddlewareHandler } from 'hono';
import { getDb } from '../infraestrutura/banco/drizzle.js';
import { rateLimitTable } from '../infraestrutura/banco/schema.js';
import { and, eq, sql } from 'drizzle-orm';
import type { Bindings } from '../config/env.js';

/**
 * Middleware de Rate Limiting Persistente via D1.
 *
 * Usa a tabela `rate_limit` para persistir contadores entre cold starts
 * do Cloudflare Workers, garantindo eficácia real em produção.
 *
 * Estratégia: janela fixa baseada em timestamp truncado ao minuto.
 */
export const middlewareRateLimit: MiddlewareHandler<{ Bindings: Bindings }> = async (c, next) => {
  const limite = c.env.RATE_LIMIT_MAX;
  const janelaMs = c.env.RATE_LIMIT_WINDOW_MS;
  const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'unknown';

  // Truncar timestamp para a janela atual (em segundos)
  const agora = Date.now();
  const janelaInicio = Math.floor(agora / janelaMs) * janelaMs;

  try {
    const db = getDb(c.env.DB);

    // Tentar incrementar contador existente
    const [existente] = await db
      .select({ requisicoes: rateLimitTable.requisicoes })
      .from(rateLimitTable)
      .where(and(eq(rateLimitTable.ip, ip), eq(rateLimitTable.janelaInicio, janelaInicio)));

    if (existente) {
      if (existente.requisicoes >= limite) {
        const retryAfter = Math.ceil((janelaInicio + janelaMs - agora) / 1000);
        c.header('Retry-After', String(Math.max(1, retryAfter)));
        return c.json({ erro: 'Limite de requisições excedido. Tente novamente mais tarde.' }, 429);
      }

      await db
        .update(rateLimitTable)
        .set({ requisicoes: sql`${rateLimitTable.requisicoes} + 1` })
        .where(and(eq(rateLimitTable.ip, ip), eq(rateLimitTable.janelaInicio, janelaInicio)));
    } else {
      // Primeira requisição nesta janela — inserir
      await db.insert(rateLimitTable).values({
        ip,
        janelaInicio,
        requisicoes: 1,
      }).onConflictDoNothing();
    }
  } catch (erro) {
    // Se o rate limit falhar (ex: tabela não existe ainda), não bloquear a requisição
    // mas registrar o erro para visibilidade
    console.error('Erro no rate limiting (non-blocking):', erro);
  }

  await next();
};

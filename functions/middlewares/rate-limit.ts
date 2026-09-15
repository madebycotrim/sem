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
  // 1. Ignorar preflight CORS OPTIONS para não quebrar CORS nem consumir cota
  if (c.req.method === 'OPTIONS') {
    return next();
  }

  // 2. Isentar health check, checagem de sessão do usuário e rotas de importação administrativa
  const path = c.req.path;
  if (
    path === '/api/health' ||
    path === '/api/v1/auth/me' ||
    path.startsWith('/api/v1/importacao')
  ) {
    return next();
  }

  // 3. Fallbacks seguros com coerção numérica rigorosa (evita NaN caso env não esteja configurado no Cloudflare Dashboard)
  const limite = Number(c.env?.RATE_LIMIT_MAX) > 0 ? Number(c.env.RATE_LIMIT_MAX) : 300;
  const janelaMs = Number(c.env?.RATE_LIMIT_WINDOW_MS) > 0 ? Number(c.env.RATE_LIMIT_WINDOW_MS) : 60_000;
  const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'unknown';

  // Truncar timestamp para a janela atual (em milissegundos)
  const agora = Date.now();
  const janelaInicio = Math.floor(agora / janelaMs) * janelaMs;

  try {
    const db = getDb(c.env.DB);

    // 4. Limpeza oportunista de janelas expiradas ou registros corrompidos (NaN / 0 / antigas)
    // Garante desbloqueio imediato de IPs que ficaram presos em janelas antigas/inválidas
    await db
      .delete(rateLimitTable)
      .where(sql`${rateLimitTable.janelaInicio} < ${agora - janelaMs} OR ${rateLimitTable.janelaInicio} IS NULL OR ${rateLimitTable.janelaInicio} = 0`);

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

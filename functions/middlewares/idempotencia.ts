import type { MiddlewareHandler } from 'hono';
import { getDb } from '../infraestrutura/banco/drizzle.js';
import { atendimentos } from '../infraestrutura/banco/schema.js';
import { eq } from 'drizzle-orm';
import type { Bindings } from '../config/env.js';
import type { AppVariables } from './autenticacao.js';

/**
 * Middleware de Idempotência para Hono.
 * Evita registros duplicados de atendimento em caso de retries.
 */
export const middlewareIdempotencia: MiddlewareHandler<{
  Bindings: Bindings;
  Variables: AppVariables;
}> = async (c, next) => {
  if (c.req.method === 'POST') {
    try {
      const clonedReq = c.req.raw.clone();
      const body = (await clonedReq.json()) as Record<string, unknown>;

      if (body && typeof body['idempotencyKey'] === 'string') {
        const idempotencyKey = body['idempotencyKey'];
        const db = getDb(c.env.DB);

        const registroExistente = await db.query.atendimentos.findFirst({
          where: eq(atendimentos.chaveIdempotencia, idempotencyKey),
          columns: { id: true, criadoEm: true },
        });

        if (registroExistente) {
          return c.json(
            {
              erro: 'Atendimento já registrado com esta chave de idempotência.',
              registroExistenteId: registroExistente.id,
              criadoEm: registroExistente.criadoEm,
            },
            409
          );
        }
      }
    } catch {
      // Se body não for JSON, segue e deixa o Zod validar
    }
  }

  await next();
};

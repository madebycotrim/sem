import type { MiddlewareHandler } from 'hono';
import type { Bindings } from '../config/env.js';
import type { AppVariables } from './autenticacao.js';

/**
 * Middleware de Log de Acesso Otimizado (Zero D1 Storage).
 * 
 * Emite log estruturado apenas no console/runtime da Cloudflare,
 * sem gravar linhas no banco D1 para preservar o armazenamento gratuito.
 */
export const middlewareLogAcesso: MiddlewareHandler<{
  Bindings: Bindings;
  Variables: AppVariables;
}> = async (c, next) => {
  const inicio = Date.now();
  const requestId = crypto.randomUUID();
  const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1';

  await next();

  const duracaoMs = Date.now() - inicio;
  const usuario = c.get('usuario');

  console.info(
    JSON.stringify({
      tipo: 'LOG_ACESSO',
      timestamp: new Date().toISOString(),
      requestId,
      ip,
      metodo: c.req.method,
      rota: c.req.path,
      statusCode: c.res.status,
      duracaoMs,
      userId: usuario?.userId ?? null,
    })
  );
};

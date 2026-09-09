import type { MiddlewareHandler } from 'hono';
import type { Bindings } from '../config/env.js';

interface JanelaLimite {
  inicio: number;
  requisicoes: number;
}

const limitesPorIp = new Map<string, JanelaLimite>();

export const middlewareRateLimit: MiddlewareHandler<{ Bindings: Bindings }> = async (c, next) => {
  const limite = c.env.RATE_LIMIT_MAX;
  const janelaMs = c.env.RATE_LIMIT_WINDOW_MS;
  const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'unknown';
  const agora = Date.now();
  const janelaAtual = limitesPorIp.get(ip);

  if (!janelaAtual || agora - janelaAtual.inicio >= janelaMs) {
    limitesPorIp.set(ip, { inicio: agora, requisicoes: 1 });
  } else if (janelaAtual.requisicoes >= limite) {
    const retryAfter = Math.ceil((janelaMs - (agora - janelaAtual.inicio)) / 1000);
    c.header('Retry-After', String(retryAfter));
    return c.json({ erro: 'Limite de requisições excedido. Tente novamente mais tarde.' }, 429);
  } else {
    janelaAtual.requisicoes += 1;
  }

  await next();
};

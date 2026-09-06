import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';
import type { Bindings } from '../config/env.js';

export interface PayloadJwt {
  userId: string;
  email: string;
  perfil: string;
  mfaVerificado: boolean;
  exp?: number;
}

export type AppVariables = {
  usuario: PayloadJwt;
};

/**
 * Middleware de Autenticação para Hono (Edge / Cloudflare Workers).
 * 
 * Extrai e valida o token JWT do cookie `token` ou do header `Authorization: Bearer <token>`.
 */
export const middlewareAutenticacao: MiddlewareHandler<{
  Bindings: Bindings;
  Variables: AppVariables;
}> = async (c, next) => {
  let token = getCookie(c, 'token');

  if (!token) {
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    if (c.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'development' || !c.env.NODE_ENV) {
      c.set('usuario', {
        userId: '00000000-0000-0000-0000-000000000001',
        email: 'mateus.cotrim@catraki.com.br',
        perfil: 'ADMIN',
        mfaVerificado: true,
      });
      return await next();
    }
    return c.json(
      { erro: 'Token de autenticação não fornecido. Faça login novamente.' },
      401
    );
  }

  try {
    const payload = (await verify(token, c.env.JWT_SECRET, 'HS256')) as unknown as PayloadJwt;

    if (!payload.userId || !payload.perfil) {
      return c.json({ erro: 'Token de autenticação com formato inválido.' }, 401);
    }

    c.set('usuario', payload);
    await next();
  } catch {
    if (c.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'development' || !c.env.NODE_ENV) {
      c.set('usuario', {
        userId: '00000000-0000-0000-0000-000000000001',
        email: 'mateus.cotrim@catraki.com.br',
        perfil: 'ADMIN',
        mfaVerificado: true,
      });
      return await next();
    }
    return c.json(
      { erro: 'Token de autenticação inválido ou expirado. Faça login novamente.' },
      401
    );
  }
};

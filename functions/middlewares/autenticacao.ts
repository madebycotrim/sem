import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';
import { getDb } from '../infraestrutura/banco/drizzle.js';
import { tokensRevogados, usuarios } from '../infraestrutura/banco/schema.js';
import { eq } from 'drizzle-orm';
import type { Bindings } from '../config/env.js';

export interface PayloadJwt {
  userId: string;
  email: string;
  perfil: string;
  mfaVerificado?: boolean;
  jti?: string;
  exp?: number;
}

export type AppVariables = {
  usuario: PayloadJwt;
};

/**
 * Middleware de Autenticação para Hono (Edge / Cloudflare Workers).
 * 
 * Extrai e valida o token JWT do cookie `token` ou do header `Authorization: Bearer <token>`.
 * Verifica se o token foi revogado via blacklist no D1.
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

    const db = getDb(c.env.DB);

    // Verificar se o token foi revogado (blacklist)
    if (payload.jti) {
      const revogado = await db.query.tokensRevogados.findFirst({
        where: eq(tokensRevogados.jti, payload.jti),
      });
      if (revogado) {
        return c.json(
          { erro: 'Sessão encerrada. Faça login novamente.' },
          401
        );
      }
    }

    // Garantir que a conta continua ativa, sincronizar o perfil atual e exigir MFA se ativo
    const usuarioAtual = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, payload.userId),
      columns: { ativo: true, perfil: true, mfaAtivo: true },
    });

    if (!usuarioAtual || !usuarioAtual.ativo) {
      return c.json(
        { erro: 'Conta desativada ou inexistente. Faça login novamente.' },
        401
      );
    }

    const rotasIsentasMfa = [
      '/api/v1/auth/mfa/verificar',
      '/api/v1/auth/me',
      '/api/v1/auth/logout',
      '/api/v1/auth/alterar-senha',
    ];
    if (usuarioAtual.mfaAtivo && !payload.mfaVerificado && !rotasIsentasMfa.includes(c.req.path)) {
      return c.json(
        { erro: 'Verificação de MFA obrigatória para acessar este recurso.', codigo: 'MFA_PENDENTE' },
        403
      );
    }

    payload.perfil = usuarioAtual.perfil;

    c.set('usuario', payload);
    await next();
  } catch {
    return c.json(
      { erro: 'Token de autenticação inválido ou expirado. Faça login novamente.' },
      401
    );
  }
};

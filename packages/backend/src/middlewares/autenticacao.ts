import type { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../infraestrutura/logger/pino.js';

/**
 * Middleware de Autenticação via JWT em Cookie HttpOnly.
 *
 * Valida o token JWT presente no cookie `token` e injeta o payload
 * decodificado (userId, perfil) no request para uso downstream.
 *
 * Segurança:
 * - Token em Cookie HttpOnly + Secure + SameSite=Strict (não acessível via JS no client)
 * - Rejeita requisições sem token ou com token expirado/inválido
 */
export async function middlewareAutenticacao(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // O @fastify/jwt extrai automaticamente do cookie configurado
    await request.jwtVerify();
  } catch (erro) {
    logger.warn(
      { ip: request.ip, rota: request.url },
      'Tentativa de acesso sem autenticação válida'
    );
    return reply.status(401).send({
      erro: 'Token de autenticação inválido ou expirado. Faça login novamente.',
    });
  }
}

/**
 * Tipo do payload decodificado do JWT, injetado no request após autenticação.
 */
export interface PayloadJwt {
  userId: string;
  email: string;
  perfil: string;
  mfaVerificado: boolean;
}

/**
 * Declaração do módulo Fastify para tipagem do JWT.
 */
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: PayloadJwt;
    user: PayloadJwt;
  }
}

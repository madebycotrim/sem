import type { FastifyRequest, FastifyReply } from 'fastify';
import type { PerfilAcesso } from '@sistema/shared';
import { logger } from '../infraestrutura/logger/pino.js';

/**
 * Middleware de Autorização RBAC.
 *
 * Factory que retorna um hook de preHandler, verificando se o perfil
 * do usuário autenticado está na lista de perfis permitidos.
 *
 * Uso:
 * ```typescript
 * fastify.get('/admin/usuarios', {
 *   preHandler: [middlewareAutenticacao, autorizarPerfis(['ADMIN'])],
 * }, handler);
 * ```
 *
 * Segurança: Autorização SEMPRE validada no servidor (LGPD / boas práticas).
 * Esconder botões na UI é UX, não controle de acesso.
 */
export function autorizarPerfis(perfisPermitidos: readonly PerfilAcesso[]) {
  return async function middlewareAutorizacao(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const usuario = request.user;

    if (!usuario) {
      return reply.status(401).send({
        erro: 'Usuário não autenticado.',
      });
    }

    const perfilUsuario = usuario.perfil as PerfilAcesso;

    if (!perfisPermitidos.includes(perfilUsuario)) {
      logger.warn(
        {
          userId: usuario.userId,
          perfil: perfilUsuario,
          perfisPermitidos,
          rota: request.url,
          metodo: request.method,
          ip: request.ip,
        },
        'Tentativa de acesso não autorizado (RBAC)'
      );

      return reply.status(403).send({
        erro: 'Acesso negado. Seu perfil não tem permissão para esta ação.',
      });
    }
  };
}

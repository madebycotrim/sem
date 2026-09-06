import type { MiddlewareHandler } from 'hono';
import type { PerfilAcesso } from '../../compartilhado/index.js';
import type { Bindings } from '../config/env.js';
import type { AppVariables } from './autenticacao.js';

/**
 * Middleware de Autorização RBAC para Hono.
 *
 * Garante que o perfil do usuário autenticado esteja na lista de perfis permitidos.
 */
export function autorizarPerfis(
  perfisPermitidos: readonly PerfilAcesso[]
): MiddlewareHandler<{ Bindings: Bindings; Variables: AppVariables }> {
  return async (c, next) => {
    const usuario = c.get('usuario');

    if (!usuario) {
      return c.json({ erro: 'Usuário não autenticado.' }, 401);
    }

    const perfilUsuario = usuario.perfil as PerfilAcesso;

    if (!perfisPermitidos.includes(perfilUsuario)) {
      return c.json(
        { erro: 'Acesso negado. Seu perfil não tem permissão para esta ação.' },
        403
      );
    }

    await next();
  };
}

import type { MiddlewareHandler } from 'hono';
import { type PerfilAcesso, PERMISSOES_PADRAO, type PermissoesPerfil } from '../../compartilhado/index.js';
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

    // Bootstrap Bypass: Tem acesso incondicional
    if (usuario.email === c.env.ADMIN_BOOTSTRAP_EMAIL) {
      return await next();
    }

    if (!perfisPermitidos.includes(perfilUsuario)) {
      return c.json(
        { erro: 'Acesso negado. Seu perfil não tem permissão para esta ação.' },
        403
      );
    }

    await next();
  };
}

/**
 * Middleware de Autorização Baseada em Ações (RBAC Fino)
 * 
 * Verifica se o perfil tem a permissão explícita para a ação,
 * consultando as permissões padrão do sistema.
 */
export function autorizarAcao(
  acao: keyof PermissoesPerfil['acoes']
): MiddlewareHandler<{ Bindings: Bindings; Variables: AppVariables }> {
  return async (c, next) => {
    const usuario = c.get('usuario');

    if (!usuario) {
      return c.json({ erro: 'Usuário não autenticado.' }, 401);
    }

    const perfilUsuario = usuario.perfil as PerfilAcesso;

    // Bootstrap Bypass: Tem acesso incondicional
    if (usuario.email === c.env.ADMIN_BOOTSTRAP_EMAIL) {
      return await next();
    }

    // Admin Bypass: Tem acesso incondicional a todas as ações
    if (perfilUsuario === 'ADMIN') {
      return await next();
    }

    const permissoesDoPerfil = PERMISSOES_PADRAO[perfilUsuario];
    if (!permissoesDoPerfil || permissoesDoPerfil.acoes[acao] !== 'LIVRE') {
      return c.json(
        { erro: `Acesso negado. Ação ${String(acao)} restrita para o seu perfil.` },
        403
      );
    }

    await next();
  };
}

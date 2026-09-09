import type { MiddlewareHandler } from 'hono';
import { type PerfilAcesso, type PermissoesPerfil } from '../../compartilhado/index.js';
import { getPrisma } from '../infraestrutura/banco/prisma.js';
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

/**
 * Middleware de Autorização Baseada em Ações (RBAC Fino)
 * 
 * Verifica se o perfil tem a permissão explícita para a ação,
 * consultando a configuração persistida no banco de dados.
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

    // Admin Bypass: Tem acesso incondicional a todas as ações
    if (perfilUsuario === 'ADMIN') {
      return await next();
    }

    const prisma = getPrisma(c.env.DB);
    const configuracao = await prisma.configuracaoRbac.findUnique({
      where: { perfil: perfilUsuario },
      select: { acoes: true },
    });
    let permissoesDoPerfil: Pick<PermissoesPerfil, 'acoes'> | null = null;
    try {
      if (configuracao) {
        permissoesDoPerfil = {
          acoes: typeof configuracao.acoes === 'string'
            ? JSON.parse(configuracao.acoes)
            : configuracao.acoes,
        };
      }
    } catch {
      permissoesDoPerfil = null;
    }
    if (!permissoesDoPerfil || permissoesDoPerfil.acoes[acao] !== 'LIVRE') {
      return c.json(
        { erro: `Acesso negado. Ação ${String(acao)} restrita para o seu perfil.` },
        403
      );
    }

    await next();
  };
}

import type { MiddlewareHandler } from 'hono';
import { type PerfilAcesso, type PermissoesPerfil } from '../../compartilhado/index.js';
import { getDb } from '../infraestrutura/banco/drizzle.js';
import { configuracoesRbac } from '../infraestrutura/banco/schema.js';
import { eq } from 'drizzle-orm';
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

    // BOOTSTRAP tem acesso total incondicional a todas as rotas
    if (perfilUsuario === 'BOOTSTRAP') {
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

    // BOOTSTRAP tem acesso incondicional a todas as ações
    if (perfilUsuario === 'BOOTSTRAP') {
      return await next();
    }

    const db = getDb(c.env.DB);
    const configuracao = await db.query.configuracoesRbac.findFirst({
      where: eq(configuracoesRbac.perfil, perfilUsuario),
      columns: { acoes: true },
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

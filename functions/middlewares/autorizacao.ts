import type { MiddlewareHandler } from 'hono';
import { type PerfilAcesso, type PermissoesPerfil, PERMISSOES_PADRAO } from '../../compartilhado/index.js';
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
 * Middleware de Autorização Baseada em Módulos (RBAC de Navegação / Acesso à API)
 *
 * Verifica se o perfil tem acesso ao módulo solicitado, consultando a configuração
 * persistida no banco D1 com fallback seguro para PERMISSOES_PADRAO.
 */
export function autorizarModulo(
  modulo: keyof PermissoesPerfil['modulos']
): MiddlewareHandler<{ Bindings: Bindings; Variables: AppVariables }> {
  return async (c, next) => {
    const usuario = c.get('usuario');

    if (!usuario) {
      return c.json({ erro: 'Usuário não autenticado.' }, 401);
    }

    const perfilUsuario = usuario.perfil as PerfilAcesso;

    // BOOTSTRAP tem acesso total irrestrito
    if (perfilUsuario === 'BOOTSTRAP') {
      return await next();
    }

    // Prevenção de bloqueio: ADMIN sempre tem acesso à gestão de usuários/RBAC
    if (perfilUsuario === 'ADMIN' && modulo === 'usuarios') {
      return await next();
    }

    const db = getDb(c.env.DB);
    const configuracao = await db.query.configuracoesRbac.findFirst({
      where: eq(configuracoesRbac.perfil, perfilUsuario),
      columns: { modulos: true },
    });

    const modulosPadrao = PERMISSOES_PADRAO[perfilUsuario]?.modulos || {};
    let modulosConfig: Record<string, string> = { ...modulosPadrao };

    if (configuracao && configuracao.modulos) {
      try {
        const modulosDb = typeof configuracao.modulos === 'string'
          ? JSON.parse(configuracao.modulos)
          : configuracao.modulos;
        modulosConfig = {
          ...modulosConfig,
          ...modulosDb,
        };
      } catch (err) {
        console.error('Erro ao processar módulos RBAC do banco:', err);
      }
    }

    if (modulosConfig[modulo] !== 'LIVRE') {
      return c.json(
        { erro: `Acesso negado. Módulo ${String(modulo)} restrito para o seu perfil.` },
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
 * consultando a configuração persistida no banco D1 com fallback seguro para PERMISSOES_PADRAO.
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

    const acoesPadrao = PERMISSOES_PADRAO[perfilUsuario]?.acoes || {};
    let acoesConfig: Record<string, string> = { ...acoesPadrao };

    if (configuracao && configuracao.acoes) {
      try {
        const acoesDb = typeof configuracao.acoes === 'string'
          ? JSON.parse(configuracao.acoes)
          : configuracao.acoes;
        acoesConfig = {
          ...acoesConfig,
          ...acoesDb,
        };
      } catch (err) {
        console.error('Erro ao processar ações RBAC do banco:', err);
      }
    }

    if (acoesConfig[acao] !== 'LIVRE') {
      return c.json(
        { erro: `Acesso negado. Ação ${String(acao)} restrita para o seu perfil.` },
        403
      );
    }

    await next();
  };
}

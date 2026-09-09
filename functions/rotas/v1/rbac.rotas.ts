import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getDb } from '../../infraestrutura/banco/drizzle.js';
import { configuracoesRbac } from '../../infraestrutura/banco/schema.js';
import { middlewareAutenticacao, type AppVariables } from '../../middlewares/autenticacao.js';
import { autorizarPerfis } from '../../middlewares/autorizacao.js';
import { registrarAuditoria } from '../../middlewares/auditoria.js';
import type { Bindings } from '../../config/env.js';
import { type PerfilAcesso, type PermissoesPerfil } from '../../../compartilhado/index.js';

export const rotasRbac = new Hono<{ Bindings: Bindings; Variables: AppVariables }>();

rotasRbac.use('*', middlewareAutenticacao);

/**
 * GET /rbac/permissoes
 * Retorna as configurações de RBAC atuais de todos os perfis.
 */
rotasRbac.get('/permissoes', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const permissoes: Partial<Record<PerfilAcesso, PermissoesPerfil>> = {};
    
    const configuracoes = await db.query.configuracoesRbac.findMany();
    
    for (const config of configuracoes) {
      permissoes[config.perfil as PerfilAcesso] = {
        modulos: typeof config.modulos === 'string' ? JSON.parse(config.modulos) : config.modulos,
        acoes: typeof config.acoes === 'string' ? JSON.parse(config.acoes) : config.acoes,
      };
    }

    return c.json({ permissoes });
  } catch (err) {
    console.error('Erro ao buscar configurações RBAC do banco:', err);
    return c.json({ erro: 'Não foi possível carregar as configurações RBAC.' }, 500);
  }
});

const permissoesSchema = z.record(z.string(), z.object({
  modulos: z.record(z.string(), z.enum(['LIVRE', 'BLOQUEADO', 'RESTRITO'])),
  acoes: z.record(z.string(), z.enum(['LIVRE', 'BLOQUEADO', 'RESTRITO'])),
}));

/**
 * PUT /rbac/permissoes
 * Atualiza as configurações de RBAC de todos os perfis (Somente ADMIN).
 */
rotasRbac.put('/permissoes', autorizarPerfis(['ADMIN', 'BOOTSTRAP']), zValidator('json', permissoesSchema), async (c) => {
  const dados = c.req.valid('json');
  const usuario = c.get('usuario');
  const db = getDb(c.env.DB);
  
  // Atualiza no banco
  for (const [perfil, permissoes] of Object.entries(dados)) {
    if (perfil === 'ADMIN' || perfil === 'BOOTSTRAP') continue; // Não salva restrições para admins
    
    await db.insert(configuracoesRbac).values({
      perfil,
      modulos: JSON.stringify(permissoes.modulos),
      acoes: JSON.stringify(permissoes.acoes),
      atualizadoPor: usuario.userId,
      atualizadoEm: new Date().toISOString(),
    }).onConflictDoUpdate({
      target: configuracoesRbac.perfil,
      set: {
        modulos: JSON.stringify(permissoes.modulos),
        acoes: JSON.stringify(permissoes.acoes),
        atualizadoPor: usuario.userId,
        atualizadoEm: new Date().toISOString(),
      },
    });
  }

  const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1';
  await registrarAuditoria(db, {
    userId: usuario.userId,
    acao: 'UPDATE',
    entidade: 'ConfiguracaoRbac',
    entidadeId: 'global',
    diffPosterior: dados,
    ip,
  });

  return c.json({ sucesso: true, mensagem: 'Permissões atualizadas com sucesso' });
});

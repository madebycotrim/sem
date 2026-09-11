import { Hono } from 'hono';
import { getDb } from '../../infraestrutura/banco/drizzle.js';
import { tokensRevogados, rateLimitTable, pacientes } from '../../infraestrutura/banco/schema.js';
import { sql, lte } from 'drizzle-orm';
import { middlewareAutenticacao, type AppVariables } from '../../middlewares/autenticacao.js';
import { autorizarPerfis } from '../../middlewares/autorizacao.js';
import { registrarAuditoria } from '../../middlewares/auditoria.js';
import { limparTentativasAntigas } from '../../middlewares/brute-force.js';
import type { Bindings } from '../../config/env.js';

export const rotasManutencao = new Hono<{ Bindings: Bindings; Variables: AppVariables }>();

rotasManutencao.use('*', middlewareAutenticacao);
rotasManutencao.use('*', autorizarPerfis(['BOOTSTRAP', 'ADMIN']));

/**
 * POST /manutencao/limpeza
 *
 * Executa limpeza de dados expirados:
 * - Tokens revogados com exp vencido
 * - Tentativas de login com mais de 24h
 * - Registros de rate limit antigos
 */
rotasManutencao.post('/limpeza', async (c) => {
  const db = getDb(c.env.DB);
  const usuario = c.get('usuario');
  const agora = new Date().toISOString();

  // 1. Limpar tokens revogados expirados
  const tokensLimpos = await db
    .delete(tokensRevogados)
    .where(lte(tokensRevogados.expiraEm, agora));

  // 2. Limpar tentativas de login antigas
  const tentativasLimpas = await limparTentativasAntigas(c.env.DB);

  // 3. Limpar rate limit antigo (janelas com mais de 1h)
  const umHoraAtras = Date.now() - 60 * 60 * 1000;
  const rateLimitsLimpos = await db
    .delete(rateLimitTable)
    .where(sql`${rateLimitTable.janelaInicio} < ${umHoraAtras}`);

  const tokensLimposCount = (tokensLimpos as unknown as { meta?: { changes?: number }; changes?: number }).meta?.changes ?? (tokensLimpos as unknown as { changes?: number }).changes ?? 0;
  const rateLimitsLimposCount = (rateLimitsLimpos as unknown as { meta?: { changes?: number }; changes?: number }).meta?.changes ?? (rateLimitsLimpos as unknown as { changes?: number }).changes ?? 0;

  await registrarAuditoria(db, {
    userId: usuario.userId,
    acao: 'MANUTENCAO',
    entidade: 'Sistema',
    entidadeId: 'limpeza',
    diffPosterior: {
      tokensRevogadosLimpos: tokensLimposCount,
      tentativasLoginLimpas: tentativasLimpas,
      rateLimitsLimpos: rateLimitsLimposCount,
    },
    ip: c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1',
  });

  return c.json({
    mensagem: 'Limpeza executada com sucesso.',
    resultado: {
      tokensRevogadosLimpos: tokensLimposCount,
      tentativasLoginLimpas: tentativasLimpas,
      rateLimitsLimpos: rateLimitsLimposCount,
    },
  });
});

/**
 * GET /manutencao/retencao-vencida
 *
 * Lista pacientes com retenção de dados vencida (retencao_expira_em < agora).
 * NÃO exclui automaticamente — requer ação humana do DPO/ADMIN.
 */
rotasManutencao.get('/retencao-vencida', async (c) => {
  const db = getDb(c.env.DB);
  const agora = new Date().toISOString();

  const pacientesVencidos = await db.query.pacientes.findMany({
    where: sql`${pacientes.retencaoExpiraEm} IS NOT NULL AND ${pacientes.retencaoExpiraEm} < ${agora} AND ${pacientes.ativo} = 1`,
    columns: {
      id: true,
      turma: true,
      escolaLocalId: true,
      retencaoExpiraEm: true,
      criadoEm: true,
    },
  });

  return c.json({
    total: pacientesVencidos.length,
    pacientes: pacientesVencidos,
    aviso: 'Estes pacientes têm retenção de dados vencida. A exclusão definitiva requer ação via Console Bootstrap.',
  });
});

import { Hono } from 'hono';
import { getDb } from '../../infraestrutura/banco/drizzle.js';
import { pacientes } from '../../infraestrutura/banco/schema.js';
import { sql } from 'drizzle-orm';
import { middlewareAutenticacao, type AppVariables } from '../../middlewares/autenticacao.js';
import { autorizarPerfis } from '../../middlewares/autorizacao.js';
import { registrarAuditoria } from '../../middlewares/auditoria.js';
import { executarLimpezaCompleta } from '../../infraestrutura/limpeza.js';
import type { Bindings } from '../../config/env.js';

export const rotasManutencao = new Hono<{ Bindings: Bindings; Variables: AppVariables }>();

rotasManutencao.use('*', middlewareAutenticacao);
rotasManutencao.use('*', autorizarPerfis(['BOOTSTRAP', 'ADMIN']));

/**
 * POST /manutencao/limpeza
 *
 * Executa limpeza completa de dados expirados:
 * - Tokens revogados com exp vencido
 * - Tentativas de login com mais de 24h
 * - Registros de rate limit com mais de 1h
 *
 * Em producao, esta limpeza tambem ocorre automaticamente em background
 * (estrategia piggyback, 1 a cada 20 logins), portanto chamar este endpoint
 * manualmente e opcional e serve para forcas uma limpeza imediata.
 */
rotasManutencao.post('/limpeza', async (c) => {
  const usuario = c.get('usuario');
  const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1';

  const resultado = await executarLimpezaCompleta(c.env.DB);

  await registrarAuditoria(getDb(c.env.DB), {
    userId: usuario.userId,
    acao: 'MANUTENCAO',
    entidade: 'Sistema',
    entidadeId: 'limpeza',
    diffPosterior: {
      tentativasLoginRemovidas: resultado.tentativasLoginRemovidas,
      tokensRevogadosRemovidos: resultado.tokensRevogadosRemovidos,
      rateLimitsRemovidos: resultado.rateLimitsRemovidos,
    },
    ip,
  });

  return c.json({
    mensagem: 'Limpeza executada com sucesso.',
    resultado: {
      tentativasLoginRemovidas: resultado.tentativasLoginRemovidas,
      tokensRevogadosRemovidos: resultado.tokensRevogadosRemovidos,
      rateLimitsRemovidos: resultado.rateLimitsRemovidos,
      duracaoMs: resultado.duracaoMs,
      executadoEm: resultado.executadoEm,
    },
    nota: 'A limpeza tambem e executada automaticamente em background (1 a cada 20 logins).',
  });
});

/**
 * GET /manutencao/status-storage
 *
 * Retorna o numero de registros em cada tabela operacional transiente,
 * permitindo monitorar o crescimento do banco e antecipar necessidade de limpeza.
 */
rotasManutencao.get('/status-storage', async (c) => {
  // Usa o binding D1 nativo para consultas de contagem ad-hoc
  const d1 = c.env.DB as unknown as { prepare: (q: string) => { first: <T>() => Promise<T> } };

  const contarTabela = async (nomeTabela: string): Promise<number> => {
    try {
      const res = await d1.prepare(`SELECT COUNT(*) as total FROM ${nomeTabela}`).first<{ total: number }>();
      return res?.total ?? 0;
    } catch {
      return -1; // tabela nao existe ou erro
    }
  };

  const [tentativas, tokens, rateLimit, atendimentos, pacientesAtivos] = await Promise.all([
    contarTabela('tentativas_login'),
    contarTabela('tokens_revogados'),
    contarTabela('rate_limit'),
    contarTabela('atendimentos'),
    contarTabela('pacientes'),
  ]);

  return c.json({
    consultadoEm: new Date().toISOString(),
    tabelas: {
      tentativas_login: {
        registros: tentativas,
        ttl: '24 horas (limpeza automatica via piggyback no login)',
      },
      tokens_revogados: {
        registros: tokens,
        ttl: 'Ao expirar (limpeza automatica via piggyback no login)',
      },
      rate_limit: {
        registros: rateLimit,
        ttl: '1 hora (limpeza automatica via piggyback no login)',
      },
      atendimentos: {
        registros: atendimentos,
        ttl: 'Permanente (dados clinicos — sem limpeza automatica)',
      },
      pacientes: {
        registros: pacientesAtivos,
        ttl: 'Conforme retencao_expira_em (exclusao requer acao humana via /retencao-vencida)',
      },
    },
  });
});

/**
 * GET /manutencao/retencao-vencida
 *
 * Lista pacientes com retencao de dados vencida (retencao_expira_em < agora).
 * NAO exclui automaticamente — requer acao humana do DPO/ADMIN.
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
    aviso: 'Estes pacientes tem retencao de dados vencida. A exclusao definitiva requer acao via Console Bootstrap.',
  });
});

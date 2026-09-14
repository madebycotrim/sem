/**
 * Modulo de Limpeza Automatica do Banco de Dados
 *
 * Estrategia: Limpeza "oportunista" (piggyback) — as funcoes sao chamadas
 * em segundo plano durante requisicoes normais (ex: login), evitando a
 * necessidade de um Cron Job separado (nao suportado no Cloudflare Pages).
 *
 * TTLs padrao:
 *   - tentativas_login:  24 horas
 *   - tokens_revogados:  ao expirar (baseado no exp do JWT)
 *   - rate_limit:        1 hora
 */

import { getDb } from './banco/drizzle.js';
import { tentativasLogin, tokensRevogados, rateLimitTable } from './banco/schema.js';
import { sql, lte } from 'drizzle-orm';

const TTL_TENTATIVAS_LOGIN_HORAS = 24;
const TTL_RATE_LIMIT_MINUTOS = 60;

export interface ResultadoLimpeza {
  tentativasLoginRemovidas: number;
  tokensRevogadosRemovidos: number;
  rateLimitsRemovidos: number;
  duracaoMs: number;
  executadoEm: string;
}

function extrairChanges(resultado: unknown): number {
  const r = resultado as { meta?: { changes?: number }; changes?: number } | null;
  return r?.meta?.changes ?? r?.changes ?? 0;
}

/**
 * Remove tentativas de login com mais de 24 horas.
 * Seguro: nao afeta protecao brute force ativa (janela e de 15 min).
 */
export async function limparTentativasLogin(dbBinding: unknown): Promise<number> {
  const db = getDb(dbBinding);
  if (typeof db?.delete !== 'function') return 0;

  const limite = new Date(
    Date.now() - TTL_TENTATIVAS_LOGIN_HORAS * 60 * 60 * 1000
  ).toISOString();

  try {
    const resultado = await db
      .delete(tentativasLogin)
      .where(sql`${tentativasLogin.criadoEm} < ${limite}`);
    return extrairChanges(resultado);
  } catch (erro) {
    console.error(JSON.stringify({ tipo: 'LIMPEZA_ERRO', tabela: 'tentativas_login', erro: String(erro) }));
    return 0;
  }
}

/**
 * Remove tokens JWT revogados cujo campo expira_em ja passou.
 */
export async function limparTokensRevogados(dbBinding: unknown): Promise<number> {
  const db = getDb(dbBinding);
  if (typeof db?.delete !== 'function') return 0;

  const agora = new Date().toISOString();

  try {
    const resultado = await db
      .delete(tokensRevogados)
      .where(lte(tokensRevogados.expiraEm, agora));
    return extrairChanges(resultado);
  } catch (erro) {
    console.error(JSON.stringify({ tipo: 'LIMPEZA_ERRO', tabela: 'tokens_revogados', erro: String(erro) }));
    return 0;
  }
}

/**
 * Remove entradas de rate limit de janelas encerradas ha mais de 1 hora.
 */
export async function limparRateLimit(dbBinding: unknown): Promise<number> {
  const db = getDb(dbBinding);
  if (typeof db?.delete !== 'function') return 0;

  const limiteMs = Date.now() - TTL_RATE_LIMIT_MINUTOS * 60 * 1000;

  try {
    const resultado = await db
      .delete(rateLimitTable)
      .where(sql`${rateLimitTable.janelaInicio} < ${limiteMs}`);
    return extrairChanges(resultado);
  } catch (erro) {
    console.error(JSON.stringify({ tipo: 'LIMPEZA_ERRO', tabela: 'rate_limit', erro: String(erro) }));
    return 0;
  }
}

/**
 * Executa todas as rotinas de limpeza em paralelo.
 */
export async function executarLimpezaCompleta(dbBinding: unknown): Promise<ResultadoLimpeza> {
  const inicio = Date.now();

  const [tentativasLoginRemovidas, tokensRevogadosRemovidos, rateLimitsRemovidos] =
    await Promise.all([
      limparTentativasLogin(dbBinding),
      limparTokensRevogados(dbBinding),
      limparRateLimit(dbBinding),
    ]);

  const duracaoMs = Date.now() - inicio;
  const executadoEm = new Date().toISOString();

  console.info(
    JSON.stringify({
      tipo: 'LIMPEZA_BANCO',
      executadoEm,
      duracaoMs,
      tentativasLoginRemovidas,
      tokensRevogadosRemovidos,
      rateLimitsRemovidos,
    })
  );

  return {
    tentativasLoginRemovidas,
    tokensRevogadosRemovidos,
    rateLimitsRemovidos,
    duracaoMs,
    executadoEm,
  };
}

/**
 * Dispara limpeza em segundo plano com probabilidade de 1/chance.
 *
 * Uso: chamar com ctx.waitUntil() apos operacoes de alta frequencia.
 * Distribui o custo de manutencao ao longo das requisicoes normais,
 * sem impactar a latencia percebida pelo usuario.
 *
 * @param dbBinding  Binding do Cloudflare D1
 * @param chance     1 em N chamadas executa a limpeza (padrao: 1 em 20)
 */
export async function limpezaOportunista(
  dbBinding: unknown,
  chance = 20
): Promise<void> {
  if (Math.random() * chance > 1) return;
  await executarLimpezaCompleta(dbBinding);
}

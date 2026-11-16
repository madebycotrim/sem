import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { eq, and, like } from 'drizzle-orm';
import { getDb } from '../../infraestrutura/banco/drizzle.js';
import { consentimentos, pacientes } from '../../infraestrutura/banco/schema.js';
import { gerarBlindIndex } from '../../infraestrutura/criptografia/crypto.js';
import { middlewareAutenticacao, type AppVariables } from '../../middlewares/autenticacao.js';
import { autorizarPerfis } from '../../middlewares/autorizacao.js';
import type { Bindings } from '../../config/env.js';

export const rotasConsentimento = new Hono<{ Bindings: Bindings; Variables: AppVariables }>();

rotasConsentimento.use('*', middlewareAutenticacao, autorizarPerfis(['BOOTSTRAP', 'ADMIN', 'TRIAGEM_RECEPCAO', 'PROFISSIONAL_SAUDE']));

const itemAutorizacaoCatrakiSchema = z.object({
  cpf: z.string().nullable().optional(),
  pacienteId: z.string().nullable().optional(),
  authorized: z.boolean(),
  validationCode: z.string().nullable().optional(),
  signedAt: z.string().nullable().optional(),
  signerName: z.string().nullable().optional(),
  documentId: z.string().nullable().optional(),
  isRevoked: z.boolean().nullable().optional(),
});

const verificarLoteCatrakiSchema = z.object({
  cpfs: z.array(z.string()).min(1).max(500),
});

/**
 * POST /consentimentos/verificar-lote
 * Proxy autenticado no servidor para consultar autorizações no Catraki sem expor a chave de API no navegador.
 */
rotasConsentimento.post(
  '/verificar-lote',
  zValidator('json', verificarLoteCatrakiSchema),
  async (c) => {
    const { cpfs } = c.req.valid('json');
    const cpfsLimpos = Array.from(
      new Set(cpfs.map((cpf) => cpf.replace(/\D/g, '')).filter((cpf) => cpf.length === 11))
    );

    if (cpfsLimpos.length === 0) {
      return c.json({ success: true, results: {}, count: 0 });
    }

    const baseUrl = (c.env.CATRAKI_API_URL || 'https://catraki---sesi.pages.dev/api').replace(/\/$/, '');
    const apiKey = c.env.CATRAKI_API_KEY?.trim();

    if (!apiKey) {
      return c.json(
        {
          success: false,
          erro: 'CATRAKI_API_KEY não configurada no servidor.',
          results: {},
        },
        503
      );
    }

    try {
      const resposta = await fetch(`${baseUrl}/public/batch-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-API-KEY': apiKey,
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ cpfs: cpfsLimpos }),
        signal: AbortSignal.timeout(8000),
      });

      const dados = (await resposta.json().catch(() => null)) as Record<string, unknown> | null;
      if (!resposta.ok || !dados) {
        return c.json(
          {
            success: false,
            erro: (dados?.error as string) || `Erro ao consultar Catraki (HTTP ${resposta.status}).`,
            results: {},
          },
          502
        );
      }

      return c.json(dados);
    } catch (erro) {
      console.error('Erro ao consultar API Catraki via proxy:', erro);
      return c.json(
        {
          success: false,
          erro: 'Timeout ou falha de comunicação com a API Catraki.',
          results: {},
        },
        504
      );
    }
  }
);

const sincronizarCatrakiSchema = z.object({
  autorizacoes: z.array(itemAutorizacaoCatrakiSchema),
});

/**
 * POST /consentimentos/sincronizar-catraki
 * Salva na tabela consentimentos EXCLUSIVAMENTE o que vier autenticado pela API Catraki.
 * Remove registros de sessões anteriores ou consentimentos fictícios de planilhas.
 */
rotasConsentimento.post(
  '/sincronizar-catraki',
  zValidator('json', sincronizarCatrakiSchema),
  async (c) => {
    const db = getDb(c.env.DB);
    const kekHex = c.env.KEK_HEX;
    const { autorizacoes } = c.req.valid('json');

    // 1. Limpeza garantida: remove consentimentos fictícios de importação manual de planilhas
    try {
      await db.delete(consentimentos).where(like(consentimentos.referenciaDocumento, 'sess:%'));
      await db.delete(consentimentos).where(eq(consentimentos.consentidoPor, 'Importação de Dados Históricos'));
    } catch (erroLimpeza) {
      console.error('Erro na limpeza prévia de consentimentos fictícios:', erroLimpeza);
    }

    let novosSalvos = 0;
    let revogadosRemovidos = 0;

    for (const item of autorizacoes) {
      const cpfLimpo = (item.cpf || '').replace(/\D/g, '');
      const pacienteIdValido =
        item.pacienteId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.pacienteId)
          ? item.pacienteId
          : undefined;
      let pacienteEncontradoId = pacienteIdValido;

      if (pacienteEncontradoId) {
        const pacienteAtivo = await db.query.pacientes.findFirst({
          where: and(eq(pacientes.id, pacienteEncontradoId), eq(pacientes.ativo, true)),
          columns: { id: true },
        });
        if (!pacienteAtivo) pacienteEncontradoId = undefined;
      }

      if (!pacienteEncontradoId && cpfLimpo.length === 11) {
        const cpfHash = await gerarBlindIndex(cpfLimpo, kekHex);
        const paciente = await db.query.pacientes.findFirst({
          where: and(eq(pacientes.cpfHash, cpfHash), eq(pacientes.ativo, true)),
          columns: { id: true },
        });
        if (paciente) {
          pacienteEncontradoId = paciente.id;
        }
      }

      if (!pacienteEncontradoId) continue;

      const ehRevogado = Boolean(item.isRevoked || !item.authorized);

      if (ehRevogado) {
        // Se revogado no Catraki, remove o consentimento do banco
        await db.delete(consentimentos).where(eq(consentimentos.pacienteId, pacienteEncontradoId));
        revogadosRemovidos++;
      } else if (item.authorized) {
        const refDocumento = item.validationCode || item.documentId || 'CATRAKI-TCLE';

        // Verifica se já existe o consentimento para esse paciente com a referência Catraki
        const existente = await db.query.consentimentos.findFirst({
          where: and(
            eq(consentimentos.pacienteId, pacienteEncontradoId),
            eq(consentimentos.referenciaDocumento, refDocumento)
          ),
        });

        if (!existente) {
          await db.insert(consentimentos).values({
            id: crypto.randomUUID(),
            pacienteId: pacienteEncontradoId,
            consentidoPor: item.signerName || 'Responsável Legal (Catraki)',
            dataConsentimento: item.signedAt || new Date().toISOString(),
            referenciaDocumento: refDocumento,
            consentimentoDispensado: false,
            justificativaDispensa: null,
            criadoEm: new Date().toISOString(),
          });
          novosSalvos++;
        }
      }
    }

    return c.json({
      sucesso: true,
      mensagem: 'Consentimentos sincronizados exclusivamente via Catraki API.',
      novosSalvos,
      revogadosRemovidos,
    });
  }
);

/**
 * GET /consentimentos/paciente/:pacienteId
 * Retorna os termos de consentimento legítimos do Catraki vinculados ao paciente.
 */
rotasConsentimento.get('/paciente/:pacienteId', async (c) => {
  const db = getDb(c.env.DB);
  const pacienteId = c.req.param('pacienteId');

  const lista = await db.query.consentimentos.findMany({
    where: eq(consentimentos.pacienteId, pacienteId),
  });

  return c.json({ dados: lista });
});

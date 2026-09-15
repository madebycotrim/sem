import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { eq, and, like } from 'drizzle-orm';
import { getDb } from '../../infraestrutura/banco/drizzle.js';
import { consentimentos, pacientes } from '../../infraestrutura/banco/schema.js';
import { gerarBlindIndex } from '../../infraestrutura/criptografia/crypto.js';
import { middlewareAutenticacao, type AppVariables } from '../../middlewares/autenticacao.js';
import type { Bindings } from '../../config/env.js';

export const rotasConsentimento = new Hono<{ Bindings: Bindings; Variables: AppVariables }>();

rotasConsentimento.use('*', middlewareAutenticacao);

const itemAutorizacaoCatrakiSchema = z.object({
  cpf: z.string().optional(),
  pacienteId: z.string().optional(),
  authorized: z.boolean(),
  validationCode: z.string().optional(),
  signedAt: z.string().optional(),
  signerName: z.string().optional(),
  documentId: z.string().optional(),
  isRevoked: z.boolean().optional(),
});

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
      let pacienteEncontradoId = item.pacienteId;

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

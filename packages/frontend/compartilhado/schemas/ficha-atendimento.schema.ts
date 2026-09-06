import { z } from 'zod';
import { Especialidade } from '../enums/especialidade.js';
import { Turno } from '../enums/turno.js';

/**
 * Schema de validação da Ficha de Atendimento Itinerante.
 *
 * Cada ficha registra um atendimento realizado em campo. O campo
 * `idempotencyKey` garante que retries de rede não dupliquem o registro.
 */
export const fichaAtendimentoSchema = z.object({
  /**
   * Chave de idempotência (UUID v4 gerado no client).
   * Garante que retransmissões por instabilidade de rede
   * não criem registros duplicados no banco.
   */
  idempotencyKey: z
    .string()
    .uuid('Chave de idempotência deve ser um UUID válido'),

  /** ID do paciente atendido */
  pacienteId: z.string().uuid('ID do paciente deve ser um UUID válido'),

  /** ID da escola/local onde o atendimento ocorreu */
  escolaLocalId: z.string().uuid('ID da escola/local deve ser um UUID válido'),

  /** Especialidade do atendimento */
  especialidade: z.nativeEnum(Especialidade, {
    errorMap: () => ({
      message: `Especialidade deve ser uma das seguintes: ${Object.values(Especialidade).join(', ')}`,
    }),
  }),

  /** Turno do atendimento (Manhã ou Tarde) */
  turno: z.nativeEnum(Turno, {
    errorMap: () => ({
      message: `Turno deve ser: ${Object.values(Turno).join(' ou ')}`,
    }),
  }),

  /** Resumo da consulta realizada */
  resumo: z
    .string()
    .min(10, 'Resumo deve ter no mínimo 10 caracteres')
    .max(5000, 'Resumo deve ter no máximo 5000 caracteres')
    .trim(),

  /** Procedimentos realizados durante o atendimento */
  procedimentos: z
    .string()
    .max(5000, 'Procedimentos devem ter no máximo 5000 caracteres')
    .trim()
    .optional(),

  /** Insumos e materiais utilizados no atendimento */
  insumosUtilizados: z
    .string()
    .max(2000, 'Insumos devem ter no máximo 2000 caracteres')
    .trim()
    .optional(),

  /** Encaminhamento externo (se necessário) */
  encaminhamentoExterno: z
    .string()
    .max(2000, 'Encaminhamento deve ter no máximo 2000 caracteres')
    .trim()
    .optional(),
});

/** Schema para listagem/busca de atendimentos (filtros) */
export const filtroAtendimentoSchema = z.object({
  especialidade: z.nativeEnum(Especialidade).optional(),
  turno: z.nativeEnum(Turno).optional(),
  escolaLocalId: z.string().uuid().optional(),
  pacienteId: z.string().uuid().optional(),
  dataInicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  dataFim: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  pagina: z.coerce.number().int().min(1).default(1),
  porPagina: z.coerce.number().int().min(1).max(100).default(20),
});

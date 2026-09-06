import { z } from 'zod';

/**
 * Schema de validação do Paciente.
 *
 * Campos marcados como PII (Personally Identifiable Information) são
 * criptografados no backend via AES-256-GCM com envelope encryption
 * antes da persistência (LGPD Art. 46).
 *
 * Finalidade da coleta: triagem e registro de atendimentos de saúde
 * em escolas públicas do DF.
 * Base legal: consentimento do responsável legal (Art. 14 LGPD).
 */
export const pacienteSchema = z.object({
  /** Nome completo do paciente — PII, criptografado no backend */
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .trim(),

  /** CPF do paciente (ou responsável, se menor) — PII, criptografado no backend */
  cpf: z
    .string()
    .regex(/^\d{11}$/, 'CPF deve conter exatamente 11 dígitos numéricos'),

  /** Data de nascimento — PII, criptografada no backend */
  dataNascimento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD')
    .refine((val) => {
      const data = new Date(val);
      return !isNaN(data.getTime()) && data <= new Date();
    }, 'Data de nascimento inválida ou futura'),

  /** Telefone de contato (responsável) — PII, criptografado no backend */
  telefone: z
    .string()
    .regex(
      /^\d{10,11}$/,
      'Telefone deve conter 10 ou 11 dígitos (DDD + número)'
    )
    .optional(),

  /** Turma/Série do aluno */
  turma: z
    .string()
    .min(1, 'Turma é obrigatória')
    .max(50, 'Turma deve ter no máximo 50 caracteres')
    .trim(),

  /** ID da escola/local de atendimento */
  escolaLocalId: z.string().uuid('ID da escola deve ser um UUID válido'),
});

/** Schema para criação de paciente (todos os campos obrigatórios exceto telefone) */
export const criarPacienteSchema = pacienteSchema;

/** Schema para atualização parcial de paciente */
export const atualizarPacienteSchema = pacienteSchema.partial();

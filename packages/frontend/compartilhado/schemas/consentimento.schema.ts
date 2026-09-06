import { z } from 'zod';

/**
 * Schema de validação do Consentimento (LGPD Art. 14).
 *
 * Para dados de saúde de menores de idade, o consentimento deve ser
 * dado pelo responsável legal. Sem consentimento válido registrado,
 * o atendimento NÃO pode ser salvo — exceto em hipóteses legais de
 * tutela de saúde pública (parametrizável via `consentimentoDispensado`).
 *
 * Base legal: Art. 11 (dado sensível de saúde) + Art. 14 (menor de idade).
 */
export const consentimentoSchema = z
  .object({
    /** ID do paciente ao qual o consentimento se refere */
    pacienteId: z.string().uuid('ID do paciente deve ser um UUID válido'),

    /**
     * Nome do responsável legal que autorizou o tratamento de dados.
     * Obrigatório quando `consentimentoDispensado` é false.
     */
    consentidoPor: z
      .string()
      .min(3, 'Nome do responsável deve ter no mínimo 3 caracteres')
      .max(200, 'Nome do responsável deve ter no máximo 200 caracteres')
      .trim()
      .optional(),

    /**
     * Data em que o consentimento foi concedido (ISO 8601).
     * Obrigatório quando `consentimentoDispensado` é false.
     */
    dataConsentimento: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        'Data deve estar no formato AAAA-MM-DD'
      )
      .optional(),

    /**
     * Referência ao documento de consentimento (ex: protocolo, número do TCLE).
     * Obrigatório quando `consentimentoDispensado` é false.
     */
    referenciaDocumento: z
      .string()
      .min(1, 'Referência do documento é obrigatória')
      .max(500, 'Referência deve ter no máximo 500 caracteres')
      .trim()
      .optional(),

    /**
     * Indica se o consentimento foi dispensado por hipótese legal
     * de tutela de saúde pública (Art. 11, II, f da LGPD).
     * Quando true, os campos consentidoPor, dataConsentimento e
     * referenciaDocumento tornam-se opcionais.
     */
    consentimentoDispensado: z.boolean().default(false),

    /**
     * Justificativa legal para dispensa do consentimento.
     * Obrigatório quando `consentimentoDispensado` é true.
     */
    justificativaDispensa: z
      .string()
      .min(10, 'Justificativa deve ter no mínimo 10 caracteres')
      .max(1000, 'Justificativa deve ter no máximo 1000 caracteres')
      .trim()
      .optional(),
  })
  .refine(
    (dados) => {
      if (dados.consentimentoDispensado) {
        return !!dados.justificativaDispensa;
      }
      return (
        !!dados.consentidoPor &&
        !!dados.dataConsentimento &&
        !!dados.referenciaDocumento
      );
    },
    {
      message:
        'Consentimento do responsável legal é obrigatório (LGPD Art. 14). ' +
        'Informe consentidoPor, dataConsentimento e referenciaDocumento, ' +
        'ou marque consentimentoDispensado com justificativa legal.',
      path: ['consentidoPor'],
    }
  );

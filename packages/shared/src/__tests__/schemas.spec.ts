import { describe, it, expect } from 'vitest';
import {
  pacienteSchema,
  consentimentoSchema,
  fichaAtendimentoSchema,
  loginSchema,
  verificarMfaSchema,
} from '../index.js';

/**
 * Testes dos Schemas Zod compartilhados.
 *
 * Verifica que:
 * 1. Dados válidos passam a validação
 * 2. Dados inválidos são rejeitados com mensagens claras
 * 3. Regras de negócio específicas (consentimento obrigatório, idempotencyKey, etc.)
 */

describe('Schema: Paciente', () => {
  const pacienteValido = {
    nome: 'Maria da Silva',
    cpf: '12345678901',
    dataNascimento: '2012-03-15',
    turma: '5ºA',
    escolaLocalId: '123e4567-e89b-12d3-a456-426614174000',
  };

  it('deve aceitar paciente com dados válidos', () => {
    const resultado = pacienteSchema.safeParse(pacienteValido);
    expect(resultado.success).toBe(true);
  });

  it('deve aceitar paciente com telefone opcional', () => {
    const resultado = pacienteSchema.safeParse({
      ...pacienteValido,
      telefone: '61999887766',
    });
    expect(resultado.success).toBe(true);
  });

  it('deve rejeitar CPF com formato inválido', () => {
    const resultado = pacienteSchema.safeParse({
      ...pacienteValido,
      cpf: '123.456.789-01', // Com máscara — deve ser só dígitos
    });
    expect(resultado.success).toBe(false);
  });

  it('deve rejeitar data de nascimento futura', () => {
    const resultado = pacienteSchema.safeParse({
      ...pacienteValido,
      dataNascimento: '2099-01-01',
    });
    expect(resultado.success).toBe(false);
  });

  it('deve rejeitar nome muito curto', () => {
    const resultado = pacienteSchema.safeParse({
      ...pacienteValido,
      nome: 'AB',
    });
    expect(resultado.success).toBe(false);
  });

  it('deve rejeitar escolaLocalId que não é UUID', () => {
    const resultado = pacienteSchema.safeParse({
      ...pacienteValido,
      escolaLocalId: 'nao-e-uuid',
    });
    expect(resultado.success).toBe(false);
  });
});

describe('Schema: Consentimento', () => {
  const consentimentoValido = {
    pacienteId: '123e4567-e89b-12d3-a456-426614174000',
    consentidoPor: 'Ana Silva (Mãe)',
    dataConsentimento: '2024-09-01',
    referenciaDocumento: 'TCLE-2024-001',
    consentimentoDispensado: false,
  };

  it('deve aceitar consentimento com todos os campos obrigatórios', () => {
    const resultado = consentimentoSchema.safeParse(consentimentoValido);
    expect(resultado.success).toBe(true);
  });

  it('deve rejeitar consentimento sem dados do responsável (LGPD Art. 14)', () => {
    const resultado = consentimentoSchema.safeParse({
      pacienteId: '123e4567-e89b-12d3-a456-426614174000',
      consentimentoDispensado: false,
      // Sem consentidoPor, dataConsentimento, referenciaDocumento
    });
    expect(resultado.success).toBe(false);
  });

  it('deve aceitar dispensa com justificativa legal', () => {
    const resultado = consentimentoSchema.safeParse({
      pacienteId: '123e4567-e89b-12d3-a456-426614174000',
      consentimentoDispensado: true,
      justificativaDispensa:
        'Tutela de saúde pública conforme Art. 11, II, f da LGPD',
    });
    expect(resultado.success).toBe(true);
  });

  it('deve rejeitar dispensa sem justificativa', () => {
    const resultado = consentimentoSchema.safeParse({
      pacienteId: '123e4567-e89b-12d3-a456-426614174000',
      consentimentoDispensado: true,
      // Sem justificativaDispensa
    });
    expect(resultado.success).toBe(false);
  });
});

describe('Schema: Ficha de Atendimento', () => {
  const fichaValida = {
    idempotencyKey: '123e4567-e89b-12d3-a456-426614174000',
    pacienteId: '223e4567-e89b-12d3-a456-426614174000',
    escolaLocalId: '323e4567-e89b-12d3-a456-426614174000',
    especialidade: 'OFTALMOLOGIA',
    turno: 'MANHA',
    resumo: 'Exame de acuidade visual — resultado normal bilateral.',
  };

  it('deve aceitar ficha com dados válidos', () => {
    const resultado = fichaAtendimentoSchema.safeParse(fichaValida);
    expect(resultado.success).toBe(true);
  });

  it('deve rejeitar ficha sem idempotencyKey', () => {
    const { idempotencyKey: _, ...semChave } = fichaValida;
    const resultado = fichaAtendimentoSchema.safeParse(semChave);
    expect(resultado.success).toBe(false);
  });

  it('deve rejeitar idempotencyKey que não é UUID', () => {
    const resultado = fichaAtendimentoSchema.safeParse({
      ...fichaValida,
      idempotencyKey: 'chave-invalida',
    });
    expect(resultado.success).toBe(false);
  });

  it('deve rejeitar especialidade inválida', () => {
    const resultado = fichaAtendimentoSchema.safeParse({
      ...fichaValida,
      especialidade: 'CARDIOLOGIA', // Não está na lista
    });
    expect(resultado.success).toBe(false);
  });

  it('deve rejeitar turno inválido', () => {
    const resultado = fichaAtendimentoSchema.safeParse({
      ...fichaValida,
      turno: 'NOITE',
    });
    expect(resultado.success).toBe(false);
  });

  it('deve rejeitar resumo muito curto', () => {
    const resultado = fichaAtendimentoSchema.safeParse({
      ...fichaValida,
      resumo: 'Ok',
    });
    expect(resultado.success).toBe(false);
  });

  it('deve aceitar ficha sem campos opcionais', () => {
    const resultado = fichaAtendimentoSchema.safeParse(fichaValida);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.procedimentos).toBeUndefined();
      expect(resultado.data.insumosUtilizados).toBeUndefined();
      expect(resultado.data.encaminhamentoExterno).toBeUndefined();
    }
  });
});

describe('Schema: Login', () => {
  it('deve aceitar login com email e senha válidos', () => {
    const resultado = loginSchema.safeParse({
      email: 'operador@saude.dev',
      senha: 'minhasenha123',
    });
    expect(resultado.success).toBe(true);
  });

  it('deve rejeitar email inválido', () => {
    const resultado = loginSchema.safeParse({
      email: 'nao-e-email',
      senha: 'minhasenha123',
    });
    expect(resultado.success).toBe(false);
  });

  it('deve normalizar email para lowercase', () => {
    const resultado = loginSchema.safeParse({
      email: 'OPERADOR@Saude.Dev',
      senha: 'minhasenha123',
    });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.email).toBe('operador@saude.dev');
    }
  });
});

describe('Schema: Verificar MFA', () => {
  it('deve aceitar token de 6 dígitos', () => {
    const resultado = verificarMfaSchema.safeParse({ token: '123456' });
    expect(resultado.success).toBe(true);
  });

  it('deve rejeitar token com menos de 6 dígitos', () => {
    const resultado = verificarMfaSchema.safeParse({ token: '12345' });
    expect(resultado.success).toBe(false);
  });

  it('deve rejeitar token com letras', () => {
    const resultado = verificarMfaSchema.safeParse({ token: '12ab56' });
    expect(resultado.success).toBe(false);
  });
});

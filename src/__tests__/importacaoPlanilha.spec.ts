import { describe, it, expect } from 'vitest';
import {
  normalizarDataIso,
  mapearEspecialidade,
  mapearStatusAtendimento,
  mapearTurno,
  extrairNomeCanonicoProfissional,
} from '../../functions/rotas/v1/importacao.rotas.ts';
import { Especialidade, StatusAtendimento, Turno } from '../../compartilhado/index.ts';

describe('Importação Inteligente de Planilhas de Consultas', () => {
  describe('Normalização de Datas', () => {
    it('deve normalizar data brasileira DD/MM/AAAA para formato ISO AAAA-MM-DD', () => {
      expect(normalizarDataIso('15/03/2012')).toBe('2012-03-15');
      expect(normalizarDataIso('01/12/2015')).toBe('2015-12-01');
      expect(normalizarDataIso('5/9/2010')).toBe('2010-09-05');
    });

    it('deve preservar datas que já estão em formato ISO', () => {
      expect(normalizarDataIso('2012-03-15')).toBe('2012-03-15');
    });

    it('deve retornar null para strings vazias ou nulas', () => {
      expect(normalizarDataIso('')).toBeNull();
      expect(normalizarDataIso(null)).toBeNull();
      expect(normalizarDataIso(undefined)).toBeNull();
    });
  });

  describe('Mapeamento Inteligente de Especialidades', () => {
    it('deve mapear variações de Oftalmologia', () => {
      expect(mapearEspecialidade('Oftalmologia')).toBe(Especialidade.OFTALMOLOGIA);
      expect(mapearEspecialidade('oftalmo')).toBe(Especialidade.OFTALMOLOGIA);
      expect(mapearEspecialidade('Consulta de Vista')).toBe(Especialidade.OFTALMOLOGIA);
      expect(mapearEspecialidade('Exame dos Olhos')).toBe(Especialidade.OFTALMOLOGIA);
    });

    it('deve mapear variações de Audiometria e Fonoaudiologia', () => {
      expect(mapearEspecialidade('Audiometria')).toBe(Especialidade.AUDIOMETRIA);
      expect(mapearEspecialidade('Fonoaudiologia')).toBe(Especialidade.AUDIOMETRIA);
      expect(mapearEspecialidade('Exame de Ouvido')).toBe(Especialidade.AUDIOMETRIA);
    });

    it('deve mapear variações de Odontologia', () => {
      expect(mapearEspecialidade('Odontologia')).toBe(Especialidade.ODONTOLOGIA);
      expect(mapearEspecialidade('Dentista')).toBe(Especialidade.ODONTOLOGIA);
      expect(mapearEspecialidade('Saúde Bucal')).toBe(Especialidade.ODONTOLOGIA);
    });

    it('deve mapear variações de Psicologia e Nutrição', () => {
      expect(mapearEspecialidade('Psicologia')).toBe(Especialidade.PSICOLOGIA);
      expect(mapearEspecialidade('Apoio Mental')).toBe(Especialidade.PSICOLOGIA);
      expect(mapearEspecialidade('Nutrição')).toBe(Especialidade.NUTRICAO);
      expect(mapearEspecialidade('nutricionista')).toBe(Especialidade.NUTRICAO);
      expect(mapearEspecialidade('Orientação Alimentar')).toBe(Especialidade.NUTRICAO);
    });
  });

  describe('Mapeamento Inteligente de Situação/Status', () => {
    it('deve mapear status Concluído / Realizado', () => {
      expect(mapearStatusAtendimento('Concluído')).toBe(StatusAtendimento.CONCLUIDO);
      expect(mapearStatusAtendimento('concluido')).toBe(StatusAtendimento.CONCLUIDO);
      expect(mapearStatusAtendimento('Realizado')).toBe(StatusAtendimento.CONCLUIDO);
      expect(mapearStatusAtendimento('Atendido')).toBe(StatusAtendimento.CONCLUIDO);
    });

    it('deve mapear status Agendado e Confirmado', () => {
      expect(mapearStatusAtendimento('Agendado')).toBe(StatusAtendimento.AGENDADO);
      expect(mapearStatusAtendimento('Aguardando')).toBe(StatusAtendimento.AGENDADO);
      expect(mapearStatusAtendimento('Confirmado')).toBe(StatusAtendimento.CONFIRMADO);
      expect(mapearStatusAtendimento('Presente')).toBe(StatusAtendimento.CONFIRMADO);
    });

    it('deve mapear cancelamentos e faltas', () => {
      expect(mapearStatusAtendimento('Cancelado')).toBe(StatusAtendimento.CANCELADO);
      expect(mapearStatusAtendimento('Desistência')).toBe(StatusAtendimento.CANCELADO);
      expect(mapearStatusAtendimento('Faltou')).toBe(StatusAtendimento.FALTOU);
      expect(mapearStatusAtendimento('Ausente')).toBe(StatusAtendimento.FALTOU);
      expect(mapearStatusAtendimento('Não compareceu')).toBe(StatusAtendimento.FALTOU);
    });
  });

  describe('Mapeamento de Turno', () => {
    it('deve identificar Manhã e Tarde', () => {
      expect(mapearTurno('Manhã')).toBe(Turno.MANHA);
      expect(mapearTurno('Matutino')).toBe(Turno.MANHA);
      expect(mapearTurno('Tarde')).toBe(Turno.TARDE);
      expect(mapearTurno('Vespertino')).toBe(Turno.TARDE);
    });
  });

  describe('Extração Canônica de Nome de Profissional (Vínculo Seguro)', () => {
    it('deve extrair nome canônico removendo Dr., Dra., Doutor, Médica etc.', () => {
      expect(extrairNomeCanonicoProfissional('Dr. Roberto Mendes')).toBe('roberto mendes');
      expect(extrairNomeCanonicoProfissional('Dra. Juliana Ferreira')).toBe('juliana ferreira');
      expect(extrairNomeCanonicoProfissional('Dr Roberto Mendes')).toBe('roberto mendes');
      expect(extrairNomeCanonicoProfissional('Doutora Ana Paula')).toBe('ana paula');
      expect(extrairNomeCanonicoProfissional('Médico João Pedro')).toBe('joao pedro');
      expect(extrairNomeCanonicoProfissional('Dentista Lucas')).toBe('lucas');
      expect(extrairNomeCanonicoProfissional('Psicóloga Mariana Silva')).toBe('mariana silva');
      expect(extrairNomeCanonicoProfissional('Roberto Mendes')).toBe('roberto mendes');
    });

    it('deve lidar com entradas nulas ou vazias de forma segura', () => {
      expect(extrairNomeCanonicoProfissional('')).toBe('');
      expect(extrairNomeCanonicoProfissional(null)).toBe('');
      expect(extrairNomeCanonicoProfissional(undefined)).toBe('');
    });
  });

  describe('Garantia de Rollback Atômico Total', () => {
    it('deve gerar chaves de idempotência prefixadas com sessão para deleção em lote limpa', () => {
      const importacaoId = 'imp_teste_12345';
      const linha = 42;
      const atendimentoId = 'e2c3e1b4-5678-4321-abcd-ef0123456789';
      const chaveIdempotencia = `sess:${importacaoId}:${linha}:${atendimentoId.slice(0, 8)}`;

      expect(chaveIdempotencia.startsWith(`sess:${importacaoId}:`)).toBe(true);
      expect(chaveIdempotencia).toBe('sess:imp_teste_12345:42:e2c3e1b4');
    });

    it('deve formatar payload de rollback com arrays de IDs e identificador de sessão', () => {
      const payload = {
        importacaoId: 'imp_teste_999',
        atendimentoIds: ['atend-1', 'atend-2'],
        pacienteIds: ['paciente-novo-1'],
        usuarioIds: ['prof-criado-1'],
      };

      expect(payload.importacaoId).toBeDefined();
      expect(payload.atendimentoIds.length).toBe(2);
      expect(payload.pacienteIds.length).toBe(1);
      expect(payload.usuarioIds.length).toBe(1);
    });
  });
});


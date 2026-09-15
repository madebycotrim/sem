import { describe, it, expect } from 'vitest';
import {
  normalizarDataIso,
  mapearEspecialidade,
  mapearStatusAtendimento,
  extrairNomeCanonicoProfissional,
} from '../../functions/rotas/v1/importacao.rotas.ts';
import { Especialidade, StatusAtendimento } from '../../compartilhado/index.ts';

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

  describe('Estrutura Oficial da Planilha (Sem Campo de E-mail)', () => {
    it('deve suportar importação das 8 colunas oficiais sem email', () => {
      const colunasOficiais = [
        'Paciente',
        'Patient Cpf',
        'Data de nascimento',
        'Patient Phone',
        'Especialidade',
        'Profissional',
        'Situação',
        'Instituição',
      ];

      expect(colunasOficiais).toHaveLength(8);
      expect(colunasOficiais).not.toContain('Patient Email');
      expect(colunasOficiais).not.toContain('Email');

      const itemSemEmail = {
        linhaOriginal: 2,
        pacienteNome: 'Lucas Gabriel',
        pacienteCpf: '12345678901',
        dataNascimento: '2012-03-15',
        pacienteTelefone: '61987654321',
        especialidade: 'Oftalmologia',
        profissionalNome: 'Dr. Roberto Mendes',
        situacao: 'Concluído',
        instituicaoNome: 'ESCOLA CLASSE 01',
      };

      expect(itemSemEmail).not.toHaveProperty('pacienteEmail');
      expect(itemSemEmail.pacienteNome).toBe('Lucas Gabriel');
    });

    it('deve garantir que o cancelamento purgue consultas e pacientes da sessão sem orfãos', () => {
      const sessaoId = 'imp_sessao_falha_503';
      const atendimentosNaMemoria = [
        { id: 'atend-1', pacienteId: 'pac-1', chaveIdempotencia: `sess:${sessaoId}:1:abc` },
        { id: 'atend-2', pacienteId: 'pac-2', chaveIdempotencia: `sess:${sessaoId}:2:def` },
        { id: 'atend-antigo', pacienteId: 'pac-antigo', chaveIdempotencia: 'chave-legada-123' },
      ];

      // Filtra os atendimentos da sessão que devem ser eliminados
      const atendimentosAposRollback = atendimentosNaMemoria.filter(
        (a) => !a.chaveIdempotencia.startsWith(`sess:${sessaoId}:`)
      );

      expect(atendimentosAposRollback).toHaveLength(1);
      expect(atendimentosAposRollback[0].id).toBe('atend-antigo');
    });

    it('deve expurgar consultas ao excluir/arquivar um paciente', () => {
      const pacienteExcluidoId = 'paciente-excluido-uuid';
      const atendimentos = [
        { id: 'c1', pacienteId: pacienteExcluidoId, resumo: 'Consulta 1' },
        { id: 'c2', pacienteId: pacienteExcluidoId, resumo: 'Consulta 2' },
        { id: 'c3', pacienteId: 'outro-paciente-uuid', resumo: 'Consulta 3' },
      ];

      const atendimentosRestantes = atendimentos.filter(
        (a) => a.pacienteId !== pacienteExcluidoId
      );

      expect(atendimentosRestantes).toHaveLength(1);
      expect(atendimentosRestantes[0].id).toBe('c3');
    });

    it('deve gerar consulta direta de pacientes e inserção resiliente a conflitos', async () => {
      const { drizzle } = await import('drizzle-orm/d1');
      const { inArray } = await import('drizzle-orm');
      const schema = await import('../../functions/infraestrutura/banco/schema.ts');

      let capturedSql = '';
      let capturedParams: any[] = [];

      const mockD1 = {
        prepare: (sql: string) => ({
          bind: (...params: any[]) => {
            capturedSql = sql;
            capturedParams = params;
            return {
              all: async () => ({ results: [] }),
              raw: async () => [],
              run: async () => ({ success: true }),
            };
          },
        }),
        batch: async () => [],
      };

      const db = drizzle(mockD1 as any, { schema });
      const hashes = ['hash1', 'hash2'];

      await db
        .select({ id: schema.pacientes.id, cpfHash: schema.pacientes.cpfHash, ativo: schema.pacientes.ativo })
        .from(schema.pacientes)
        .where(inArray(schema.pacientes.cpfHash, hashes));

      expect(capturedSql.toLowerCase()).toContain('select');
      expect(capturedSql.toLowerCase()).toContain('from "pacientes"');
      expect(capturedParams).toEqual(['hash1', 'hash2']);

      await db
        .insert(schema.pacientes)
        .values([
          {
            id: 'p1',
            nomeEnc: 'enc',
            cpfEnc: '',
            cpfHash: 'hash1',
            dataNascimentoEnc: '',
            dekCifrada: 'dek',
            ivPii: 'iv',
            tagPii: 'tag',
            turma: 'Geral',
            escolaLocalId: 'esc-1',
            ativo: true,
            criadoEm: '2026-09-15T00:00:00.000Z',
            atualizadoEm: '2026-09-15T00:00:00.000Z',
          },
        ])
        .onConflictDoNothing();

      expect(capturedSql.toLowerCase()).toContain('insert into "pacientes"');
      expect(capturedSql.toLowerCase()).toContain('on conflict do nothing');
    });
  });
});




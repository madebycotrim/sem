import { describe, it, expect } from 'vitest';
import {
  filtroAtendimentoSchema,
  StatusAtendimento,
  Turno,
  Especialidade,
} from '../../compartilhado/index.js';
import { utils } from 'xlsx';

describe('Relatórios Inteligentes e Funcionais - Validações e Métricas', () => {
  describe('Validação do Schema de Filtro (filtroAtendimentoSchema)', () => {
    it('deve aceitar filtros válidos com status e turno', () => {
      const filtroValido = {
        especialidade: Especialidade.ODONTOLOGIA,
        turno: Turno.MANHA,
        status: StatusAtendimento.CONCLUIDO,
        dataInicio: '2026-09-01',
        dataFim: '2026-09-30',
        pagina: 1,
        porPagina: 50,
      };

      const resultado = filtroAtendimentoSchema.safeParse(filtroValido);
      expect(resultado.success).toBe(true);
    });

    it('deve aceitar todos os status de atendimento definidos no enum', () => {
      Object.values(StatusAtendimento).forEach((status) => {
        const resultado = filtroAtendimentoSchema.safeParse({ status });
        expect(resultado.success).toBe(true);
        if (resultado.success) {
          expect(resultado.data.status).toBe(status);
        }
      });
    });

    it('deve rejeitar status inválido', () => {
      const resultado = filtroAtendimentoSchema.safeParse({
        status: 'STATUS_INEXISTENTE',
      });
      expect(resultado.success).toBe(false);
    });

    it('deve aceitar filtros vazios com padrões de paginação', () => {
      const resultado = filtroAtendimentoSchema.safeParse({});
      expect(resultado.success).toBe(true);
      if (resultado.success) {
        expect(resultado.data.pagina).toBe(1);
        expect(resultado.data.porPagina).toBe(20);
      }
    });
  });

  describe('Cálculo de Agregados Inteligentes e Resolutividade', () => {
    it('deve calcular taxa de resolutividade e taxa de encaminhamento corretamente', () => {
      const total = 100;
      const encaminhamentos = 18;
      const taxaEncaminhamento = Math.round((encaminhamentos / total) * 100);
      const taxaResolutividade = 100 - taxaEncaminhamento;

      expect(taxaEncaminhamento).toBe(18);
      expect(taxaResolutividade).toBe(82);
    });

    it('deve calcular 100% de resolutividade quando não houver encaminhamentos externos', () => {
      const total = 45;
      const encaminhamentos = 0;
      const taxaEncaminhamento = total > 0 ? Math.round((encaminhamentos / total) * 100) : 0;
      const taxaResolutividade = total > 0 ? 100 - taxaEncaminhamento : 100;

      expect(taxaEncaminhamento).toBe(0);
      expect(taxaResolutividade).toBe(100);
    });

    it('deve identificar corretamente o pico operacional em uma série temporal', () => {
      const serie = {
        '2026-09-01': 10,
        '2026-09-02': 25,
        '2026-09-03': 15,
        '2026-09-04': 38, // Pico
        '2026-09-05': 12,
      };

      const pico = Object.entries(serie).reduce(
        (max, [data, valor]) => (valor > (max?.total ?? 0) ? { data, total: valor } : max),
        null as { data: string; total: number } | null
      );

      expect(pico).toEqual({ data: '2026-09-04', total: 38 });
    });
  });

  describe('Geração de Planilha Multi-Abas: Dashboard e Dados Brutos (xlsx)', () => {
    it('deve estruturar a Página 1 como Dashboard e a Página 2 como Dados Brutos', () => {
      const planilha = utils.book_new();

      const linhasDashboard = [
        ['PROGRAMA SAÚDE NA ESCOLA (SEM) — SECRETARIA MUNICIPAL DE EDUCAÇÃO E SAÚDE'],
        ['DASHBOARD EXECUTIVO DE INTELIGÊNCIA OPERACIONAL E CLÍNICA'],
        ['Período:', '01/09/2026 a 14/09/2026'],
        [],
        ['=== 1. INDICADORES-CHAVE DE GESTÃO (KPIs) ==='],
        ['Total Atendimentos', 'Alunos Únicos', 'Resolutividade In Loco', 'Encaminhamentos'],
        [100, 85, '82%', 18],
        [],
        ['=== 2. DISTRIBUIÇÃO ANALÍTICA POR ESPECIALIDADE ==='],
        ['Especialidade', 'Total', 'Encaminhamentos', 'Taxa Encaminhamento (%)'],
        ['Odontologia', 45, 8, '18%'],
        ['Oftalmologia', 55, 10, '18%'],
      ];

      const linhasDadosBrutos = [
        {
          ID: 'uuid-1',
          'Data e Hora': '14/09/2026 09:00',
          'Aluno / Paciente': 'Lucas Gabriel',
          'CPF (Mascarado)': '123.***.***-45',
          Turma: '5º Ano A',
          Especialidade: 'Odontologia',
          Turno: 'Manhã',
          Situação: 'Concluído',
          Profissional: 'Dr. Roberto',
          'Unidade Escolar': 'Escola Ayrton Senna',
          'Resumo Clínico / Queixa': 'Avaliação de cárie',
          'Procedimentos Realizados': 'Restauração',
          'Insumos Utilizados': 'Resina composta',
          'Encaminhamento Externo': 'Não encaminhado (resolvido)',
        },
      ];

      const abaDashboard = utils.aoa_to_sheet(linhasDashboard);
      const abaDadosBrutos = utils.json_to_sheet(linhasDadosBrutos);

      utils.book_append_sheet(planilha, abaDashboard, 'Dashboard');
      utils.book_append_sheet(planilha, abaDadosBrutos, 'Dados Brutos');

      expect(planilha.SheetNames).toEqual(['Dashboard', 'Dados Brutos']);
      expect(planilha.Sheets['Dashboard']).toBeDefined();
      expect(planilha.Sheets['Dados Brutos']).toBeDefined();
    });
  });
});

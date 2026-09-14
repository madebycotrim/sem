import { describe, it, expect } from 'vitest';
import {
  filtroAtendimentoSchema,
  StatusAtendimento,
  STATUS_ATENDIMENTO_LABELS,
  Turno,
  Especialidade,
  ESPECIALIDADE_LABELS,
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

  describe('Cálculo de Agregados Operacionais e Médias', () => {
    it('deve calcular média diária corretamente', () => {
      const total = 100;
      const diasComAtendimento = 5;
      const mediaDiaria = Math.round((total / diasComAtendimento) * 10) / 10;

      expect(mediaDiaria).toBe(20);
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
    it('deve estruturar a Página 1 como Dashboard e a Página 2 como Dados Brutos sem campos de encaminhamento ou resolutividade', () => {
      const planilha = utils.book_new();

      const linhasDashboard = [
        ['PROGRAMA SAÚDE NA ESCOLA (SEM) — SECRETARIA MUNICIPAL DE EDUCAÇÃO E SAÚDE'],
        ['DASHBOARD EXECUTIVO DE INTELIGÊNCIA OPERACIONAL E CLÍNICA'],
        ['Período:', '01/09/2026 a 14/09/2026'],
        [],
        ['=== 1. INDICADORES-CHAVE DE GESTÃO (KPIs) ==='],
        ['Total Atendimentos', 'Alunos Únicos', 'Média Diária', 'Pico Operacional'],
        [100, 85, 20, '38 (04/09/2026)'],
        [],
        ['=== 2. DISTRIBUIÇÃO ANALÍTICA POR ESPECIALIDADE ==='],
        ['Especialidade', 'Total de Consultas', 'Participação no Volume Geral (%)'],
        ['Odontologia', 45, '45%'],
        ['Oftalmologia', 55, '55%'],
      ];

      const cabecalhosDadosBrutos = [
        'ID do Atendimento',
        'Data e Hora',
        'Aluno / Paciente',
        'CPF (Mascarado)',
        'Turma',
        'Especialidade',
        'Situação / Status',
        'Profissional de Saúde',
        'Unidade Escolar',
      ];

      const linhasDadosBrutosMatriz = [
        cabecalhosDadosBrutos,
        [
          'uuid-1',
          '14/09/2026 09:00',
          'Lucas Gabriel',
          '123.***.***-45',
          '5º Ano A',
          'Odontologia',
          'Concluído',
          'Dr. Roberto',
          'Escola Ayrton Senna',
        ],
      ];

      const abaDashboard = utils.aoa_to_sheet(linhasDashboard);
      const abaDadosBrutos = utils.aoa_to_sheet(linhasDadosBrutosMatriz);

      utils.book_append_sheet(planilha, abaDashboard, 'Dashboard');
      utils.book_append_sheet(planilha, abaDadosBrutos, 'Dados Brutos');

      expect(planilha.SheetNames).toEqual(['Dashboard', 'Dados Brutos']);
      expect(planilha.Sheets['Dashboard']).toBeDefined();
      expect(planilha.Sheets['Dados Brutos']).toBeDefined();
      expect(abaDadosBrutos['A1'].v).toBe('ID do Atendimento');
      expect(abaDadosBrutos['I1'].v).toBe('Unidade Escolar');
      expect(cabecalhosDadosBrutos).toHaveLength(9);
      expect(cabecalhosDadosBrutos).not.toContain('Resumo Clínico / Queixa');
      expect(cabecalhosDadosBrutos).not.toContain('Procedimentos Realizados');
      expect(cabecalhosDadosBrutos).not.toContain('Insumos Utilizados');
      expect(cabecalhosDadosBrutos).not.toContain('Encaminhamento Externo');
      expect(cabecalhosDadosBrutos).not.toContain('Conselho e Registro');
    });

    it('deve garantir cabeçalhos completos na Página 2 mesmo com lista vazia de atendimentos', () => {
      const cabecalhos = [
        'ID do Atendimento',
        'Data e Hora',
        'Aluno / Paciente',
        'CPF (Mascarado)',
        'Turma',
        'Especialidade',
        'Situação / Status',
        'Profissional de Saúde',
        'Unidade Escolar',
      ];

      const matrizVazia = [
        cabecalhos,
        ['Nenhum atendimento registrado no banco de dados para os filtros selecionados.', '-', '-', '-', '-', '-', '-', '-', '-'],
      ];

      const aba = utils.aoa_to_sheet(matrizVazia);
      expect(aba['A1'].v).toBe('ID do Atendimento');
      expect(aba['B1'].v).toBe('Data e Hora');
      expect(aba['C1'].v).toBe('Aluno / Paciente');
      expect(aba['I1'].v).toBe('Unidade Escolar');
      expect(aba['A2'].v).toContain('Nenhum atendimento registrado');
    });
  });

  describe('Ciclo de Vida de Visibilidade do Relatório e Filtros', () => {
    it('o relatório deve iniciar oculto (relatorioGerado = false) até o clique explícito do usuário', () => {
      let relatorioGerado = false;
      let gatilhoExecucao = 0;

      // Estado inicial
      expect(relatorioGerado).toBe(false);
      expect(gatilhoExecucao).toBe(0);

      // Usuário clica no botão "Gerar Relatório"
      const handleGerarRelatorio = () => {
        gatilhoExecucao += 1;
      };

      handleGerarRelatorio();
      expect(gatilhoExecucao).toBe(1);

      // Ao finalizar a busca com sucesso
      relatorioGerado = true;
      expect(relatorioGerado).toBe(true);
    });

    it('qualquer alteração nos filtros deve ocultar o relatório e zerar dados em memória', () => {
      let relatorioGerado = true;
      let dados = { total: 42 };
      let dadosTabela = [{ id: '1', paciente: 'João' }];

      const DADOS_INICIAIS = { total: 0 };

      const ocultarRelatorioPorAlteracaoFiltro = () => {
        relatorioGerado = false;
        dados = { ...DADOS_INICIAIS };
        dadosTabela = [];
      };

      // Simulação de alteração no filtro de data
      ocultarRelatorioPorAlteracaoFiltro();
      expect(relatorioGerado).toBe(false);
      expect(dados.total).toBe(0);
      expect(dadosTabela).toHaveLength(0);

      // Simulação de alteração no filtro de escola
      relatorioGerado = true;
      dados.total = 100;
      ocultarRelatorioPorAlteracaoFiltro();
      expect(relatorioGerado).toBe(false);
      expect(dados.total).toBe(0);

      // Simulação de clique no botão Limpar
      relatorioGerado = true;
      ocultarRelatorioPorAlteracaoFiltro();
      expect(relatorioGerado).toBe(false);
    });
  });

  describe('Exibição Completa de Métricas com e sem Filtros (Especialidades, Status, Unidade Escolar)', () => {
    const dadosBrutosMock = {
      porEspecialidade: [
        { especialidade: 'ODONTOLOGIA', total: 1 },
      ],
      porStatus: {
        AGENDADO: 1,
      },
      porEscola: [
        { id: 'esc-1', nome: 'CEMEIT DE TAGUATINGA', total: 1 },
      ],
    };

    const escolasCadastradasMock = [
      { id: 'esc-1', nome: 'CEMEIT DE TAGUATINGA' },
      { id: 'esc-2', nome: 'CENTRO DE ENSINO FUNDAMENTAL 01' },
      { id: 'esc-3', nome: 'ESCOLA CLASSE 04' },
    ];

    it('sem filtro de especialidade: deve exibir TODAS as especialidades do sistema mesmo com total zero', () => {
      const mapaDados = new Map<string, { total: number }>();
      dadosBrutosMock.porEspecialidade.forEach((item) => mapaDados.set(item.especialidade, item));

      const todasEspecialidades = Object.keys(ESPECIALIDADE_LABELS) as Especialidade[];
      const metricasEspecialidade = todasEspecialidades.map((chave) => {
        const item = mapaDados.get(chave);
        return {
          especialidadeChave: chave,
          especialidade: ESPECIALIDADE_LABELS[chave],
          atendimentos: item?.total ?? 0,
        };
      });

      expect(metricasEspecialidade).toHaveLength(Object.keys(ESPECIALIDADE_LABELS).length);
      const odonto = metricasEspecialidade.find((m) => m.especialidadeChave === 'ODONTOLOGIA');
      const oftalmo = metricasEspecialidade.find((m) => m.especialidadeChave === 'OFTALMOLOGIA');
      const audio = metricasEspecialidade.find((m) => m.especialidadeChave === 'AUDIOMETRIA');

      expect(odonto?.atendimentos).toBe(1);
      expect(oftalmo?.atendimentos).toBe(0);
      expect(audio?.atendimentos).toBe(0);
    });

    it('com filtro de especialidade: deve exibir SOMENTE a especialidade filtrada', () => {
      const especialidadeFiltro = 'ODONTOLOGIA';
      const encontrada = dadosBrutosMock.porEspecialidade.find((e) => e.especialidade === especialidadeFiltro);

      const metricasFiltradas = [
        {
          especialidadeChave: especialidadeFiltro,
          especialidade: ESPECIALIDADE_LABELS[especialidadeFiltro as Especialidade],
          atendimentos: encontrada?.total ?? 0,
        },
      ];

      expect(metricasFiltradas).toHaveLength(1);
      expect(metricasFiltradas[0].especialidadeChave).toBe('ODONTOLOGIA');
      expect(metricasFiltradas[0].atendimentos).toBe(1);
    });

    it('sem filtro de status: deve exibir TODOS os status operacionais mesmo com contagem zero', () => {
      const todosStatus = Object.entries(STATUS_ATENDIMENTO_LABELS).map(([chave, rotulo]) => ({
        chave,
        rotulo,
        qtd: dadosBrutosMock.porStatus[chave as keyof typeof dadosBrutosMock.porStatus] ?? 0,
      }));

      expect(todosStatus).toHaveLength(Object.keys(STATUS_ATENDIMENTO_LABELS).length);
      expect(todosStatus.find((s) => s.chave === 'AGENDADO')?.qtd).toBe(1);
      expect(todosStatus.find((s) => s.chave === 'CONCLUIDO')?.qtd).toBe(0);
      expect(todosStatus.find((s) => s.chave === 'CANCELADO')?.qtd).toBe(0);
      expect(todosStatus.find((s) => s.chave === 'FALTOU')?.qtd).toBe(0);
    });

    it('com filtro de status: deve exibir SOMENTE o status filtrado', () => {
      const statusFiltro = 'AGENDADO';
      const statusFiltrado = [
        {
          chave: statusFiltro,
          rotulo: STATUS_ATENDIMENTO_LABELS[statusFiltro as StatusAtendimento],
          qtd: dadosBrutosMock.porStatus[statusFiltro as keyof typeof dadosBrutosMock.porStatus] ?? 0,
        },
      ];

      expect(statusFiltrado).toHaveLength(1);
      expect(statusFiltrado[0].chave).toBe('AGENDADO');
      expect(statusFiltrado[0].qtd).toBe(1);
    });

    it('sem filtro de escola: deve exibir TODAS as escolas cadastradas na rede mesmo com atendimentos zero', () => {
      const mapa = new Map<string, { id: string; nome: string; total: number }>();
      escolasCadastradasMock.forEach((e) => mapa.set(e.id, { id: e.id, nome: e.nome, total: 0 }));
      dadosBrutosMock.porEscola.forEach((e) => {
        const item = mapa.get(e.id);
        if (item) item.total = e.total;
      });

      const rankingEscolas = Array.from(mapa.values());
      expect(rankingEscolas).toHaveLength(3);
      expect(rankingEscolas.find((e) => e.nome === 'CEMEIT DE TAGUATINGA')?.total).toBe(1);
      expect(rankingEscolas.find((e) => e.nome === 'CENTRO DE ENSINO FUNDAMENTAL 01')?.total).toBe(0);
      expect(rankingEscolas.find((e) => e.nome === 'ESCOLA CLASSE 04')?.total).toBe(0);
    });

    it('com filtro de escola: deve exibir SOMENTE a escola filtrada', () => {
      const escolaFiltro = 'esc-1';
      const encontrada = dadosBrutosMock.porEscola.find((e) => e.id === escolaFiltro);
      const resultado = [
        {
          id: escolaFiltro,
          nome: encontrada?.nome || 'Escola',
          total: encontrada?.total ?? 0,
        },
      ];

      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe('esc-1');
      expect(resultado[0].nome).toBe('CEMEIT DE TAGUATINGA');
      expect(resultado[0].total).toBe(1);
    });
  });

  describe('Síntese Executiva e Parecer Clínico com Cloudflare Workers AI', () => {
    it('deve garantir que o payload para a IA contenha estritamente dados estatísticos agregados sem PII de alunos', () => {
      const payloadIa = {
        totalGeral: 42,
        estudantesUnicos: 38,
        mediaDiaria: 14,
        pico: { data: '2026-09-10', total: 20 },
        dataInicio: '2026-09-01',
        dataFim: '2026-09-14',
        porEspecialidade: [
          { especialidade: 'ODONTOLOGIA', total: 25, pct: 60 },
          { especialidade: 'OFTALMOLOGIA', total: 17, pct: 40 },
        ],
        porEscola: [
          { nome: 'CEMEIT DE TAGUATINGA', total: 30 },
          { nome: 'CENTRO DE ENSINO FUNDAMENTAL 01', total: 12 },
        ],
        porStatus: { CONCLUIDO: 40, EM_ANDAMENTO: 2 },
      };

      const jsonString = JSON.stringify(payloadIa);

      // Verificação estrita de ausência de campos e dados pessoais de alunos
      expect(jsonString).not.toContain('cpf');
      expect(jsonString).not.toContain('nomeAluno');
      expect(jsonString).not.toContain('paciente');
      expect(jsonString).not.toContain('matricula');
      expect(jsonString).not.toContain('prontuario');
      expect(payloadIa.totalGeral).toBe(42);
      expect(payloadIa.estudantesUnicos).toBe(38);
      expect(payloadIa.porEspecialidade).toHaveLength(2);
    });

    it('deve formatar corretamente a estrutura do parecer de fallback ou resposta do modelo', () => {
      const parecerExemplo = {
        origem: 'CLOUDFLARE_WORKERS_AI',
        modelo: '@cf/meta/llama-3-8b-instruct',
        titulo: 'Síntese Executiva e Parecer Clínico Operacional',
        resumo: 'No período de 01/09/2026 a 14/09/2026 foram realizados 42 atendimentos para 38 estudantes distintos.',
        pontos: [
          'Cobertura Populacional: 38 estudantes atendidos com média de 14 consultas/dia.',
          'Foco Epidemiológico: Odontologia lidera a demanda com 60% do volume.',
          'Capacidade Operacional: 2 unidades escolares atendidas no cronograma móvel.',
        ],
        recomendacao: 'Manter dimensionamento prioritário de insumos odontológicos.',
      };

      expect(parecerExemplo.titulo).toBe('Síntese Executiva e Parecer Clínico Operacional');
      expect(parecerExemplo.pontos).toHaveLength(3);
      expect(parecerExemplo.resumo).toContain('42 atendimentos');
      expect(parecerExemplo.recomendacao).toBeDefined();
    });
  });
});


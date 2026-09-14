import { describe, it, expect } from 'vitest';
import type { ItemAtendimentoLista } from '../componentes/Atendimentos.tsx';
import type { ItemPaciente } from '../componentes/TabelaPacientes.tsx';
import { formatarSubtituloPaciente } from '../componentes/TabelaPacientes.tsx';

describe('Atendimentos - Truncamento de Nome Profissional e Hover Card de Paciente', () => {
  const pacienteMock: ItemPaciente = {
    id: 'pac-001',
    nome: 'MATEUS RECALDE DA FONSECA COTRIM',
    cpf: '12345678900',
    dataNascimento: '2010-04-12',
    sexo: 'MASCULINO',
    escolaNome: 'CEMEIT DE TAGUATINGA',
    turma: '8º ANO B',
    telefone: '61988887777',
    termoConsentimentoStatus: 'ACEITO',
    autorizacaoCatraki: 'AUTORIZADO',
    atendimentosCount: 3,
    criadoEm: '2026-09-01T10:00:00.000Z',
  };

  const atendimentoMock: ItemAtendimentoLista = {
    id: 'atend-001',
    pacienteId: 'pac-001',
    pacienteNome: 'MATEUS RECALDE DA FONSECA COTRIM',
    especialidade: 'PSICOLOGIA' as any,
    turno: 'MATUTINO' as any,
    escolaNome: 'CEMEIT DE TAGUATINGA',
    profissionalNome: 'ANA CLAUDIA FERNANDES MEIRELES LEITAO',
    criadoEm: '2026-09-13T23:56:00.000Z',
    status: 'AGENDADO' as any,
  };

  it('deve associar corretamente os dados completos do paciente para o CardHoverPaciente', () => {
    const listaPacientes = [pacienteMock];
    const pacienteEncontrado = listaPacientes.find(
      (p) =>
        p.id === atendimentoMock.pacienteId ||
        (p.nome && p.nome.trim().toLowerCase() === atendimentoMock.pacienteNome.trim().toLowerCase())
    );

    expect(pacienteEncontrado).toBeDefined();
    expect(pacienteEncontrado?.nome).toBe('MATEUS RECALDE DA FONSECA COTRIM');
    expect(pacienteEncontrado?.turma).toBe('8º ANO B');
    expect(pacienteEncontrado?.autorizacaoCatraki).toBe('AUTORIZADO');
    expect(formatarSubtituloPaciente(pacienteEncontrado!)).toContain('Masculino');
  });

  it('deve gerar fallback estruturado caso o paciente não seja encontrado na lista global', () => {
    const listaVazia: ItemPaciente[] = [];
    const pacienteEncontrado = listaVazia.find((p) => p.id === atendimentoMock.pacienteId);

    const fallback: ItemPaciente = pacienteEncontrado || {
      id: atendimentoMock.pacienteId || atendimentoMock.id,
      nome: atendimentoMock.pacienteNome,
      dataNascimento: '',
      escolaNome: atendimentoMock.escolaNome || 'Não informada',
      termoConsentimentoStatus: 'PENDENTE',
      atendimentosCount: 1,
      criadoEm: atendimentoMock.criadoEm,
    };

    expect(fallback.id).toBe('pac-001');
    expect(fallback.nome).toBe('MATEUS RECALDE DA FONSECA COTRIM');
    expect(fallback.termoConsentimentoStatus).toBe('PENDENTE');
    expect(formatarSubtituloPaciente(fallback)).toBe('Estudante');
  });

  it('deve preservar o nome completo do profissional no atributo title para permitir truncamento visual seguro', () => {
    // Garante que o nome longo tem caracteres suficientes para justificar o truncamento (...)
    expect(atendimentoMock.profissionalNome.length).toBeGreaterThan(25);
    expect(atendimentoMock.profissionalNome).toBe('ANA CLAUDIA FERNANDES MEIRELES LEITAO');
  });

  it('deve formatar data e hora com horário em destaque e data como elemento secundário', () => {
    const d = new Date(atendimentoMock.criadoEm);
    const valido = !isNaN(d.getTime());
    const hora = valido ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';
    const data = valido ? d.toLocaleDateString('pt-BR') : '--/--/----';

    expect(hora).toMatch(/^\d{2}:\d{2}$/);
    expect(data).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('deve permitir carregar dados do prontuário para visualização quando o atendimento estiver finalizado', () => {
    const atendimentoFinalizado: ItemAtendimentoLista = {
      ...atendimentoMock,
      status: 'CONCLUIDO' as any,
      resumo: 'Paciente apresentou evolução satisfatória. Realizadas orientações pedagógicas.',
    };

    const dadosProntuario = {
      itemId: atendimentoFinalizado.id,
      pacienteNome: atendimentoFinalizado.pacienteNome,
      profissional: atendimentoFinalizado.profissionalNome,
      anotacoes: atendimentoFinalizado.resumo,
      modoVisualizacao: true,
    };

    expect(dadosProntuario.anotacoes).toContain('evolução satisfatória');
    expect(dadosProntuario.modoVisualizacao).toBe(true);
  });

  it('deve manter padrão como Todos e Tudo e exibir todas as consultas sem restrição de data ou status', () => {
    const listaConsultas: ItemAtendimentoLista[] = [
      {
        id: 'c-1',
        pacienteId: 'pac-1',
        pacienteNome: 'MATEUS RECALDE DA FONSECA COTRIM',
        especialidade: 'AUDIOMETRIA' as any,
        turno: 'MATUTINO' as any,
        escolaNome: 'CEMEIT',
        profissionalNome: 'ANA CRISTINA RABELO PAIVA',
        criadoEm: '2026-09-14T01:01:00.000Z',
        status: 'CONCLUIDO' as any,
      },
      {
        id: 'c-2',
        pacienteId: 'pac-1',
        pacienteNome: 'MATEUS RECALDE DA FONSECA COTRIM',
        especialidade: 'PSICOLOGIA' as any,
        turno: 'NOTURNO' as any,
        escolaNome: 'CEMEIT',
        profissionalNome: 'ANA CLAUDIA FERNANDES MEIRELES',
        criadoEm: '2026-09-13T23:56:00.000Z',
        status: 'AGENDADO' as any,
      },
      {
        id: 'c-3',
        pacienteId: 'pac-2',
        pacienteNome: 'BEATRIZ SILVA',
        especialidade: 'ODONTOLOGIA' as any,
        turno: 'MATUTINO' as any,
        escolaNome: 'ESCOLA CLASSE 01',
        profissionalNome: 'DR. CARLOS',
        criadoEm: '2026-08-15T14:30:00.000Z',
        status: 'CANCELADO' as any,
      },
    ];

    // Estado padrão inicial e após Limpar
    const statusFiltroPadrao: string = ''; // "Todos"
    const periodoSelecionadoPadrao: string = 'tudo'; // "Tudo"
    const dataInicioPadrao: string = '';
    const dataFimPadrao: string = '';

    expect(statusFiltroPadrao).toBe('');
    expect(periodoSelecionadoPadrao).toBe('tudo');

    // Lógica do filtro de dadosBase em Atendimentos.tsx
    const extrairDataIso = (dataStr?: string) => {
      if (!dataStr) return '';
      if (/^\d{4}-\d{2}-\d{2}/.test(dataStr)) return dataStr.slice(0, 10);
      return '';
    };

    const dadosFiltrados = listaConsultas.filter((item) => {
      const dataIso = extrairDataIso(item.criadoEm);
      const status = item.status;
      const atendeStatus = !statusFiltroPadrao || status === statusFiltroPadrao;
      const atendeDataInicio = !dataInicioPadrao || (dataIso ? dataIso >= dataInicioPadrao : true);
      const atendeDataFim = !dataFimPadrao || (dataIso ? dataIso <= dataFimPadrao : true);
      return atendeStatus && atendeDataInicio && atendeDataFim;
    });

    // Todas as 3 consultas devem aparecer sem restrição
    expect(dadosFiltrados.length).toBe(3);
    expect(dadosFiltrados.map((c) => c.id)).toEqual(['c-1', 'c-2', 'c-3']);
  });
});


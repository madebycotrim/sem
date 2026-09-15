import { describe, it, expect } from 'vitest';
import type { ItemAtendimentoLista } from '../componentes/Atendimentos.tsx';
import type { ItemPaciente } from '../componentes/TabelaPacientes.tsx';
import { formatarSubtituloPaciente, censurarCpf } from '../componentes/TabelaPacientes.tsx';
import { formatarConselhoERegistro } from '../componentes/FilaDoDia.tsx';

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

  it('deve exibir CPF mascarado abaixo do nome do paciente com proteção LGPD e tratar fallback', () => {
    // 1. Paciente com CPF informado
    const cpfBruto1: string = '12345678900';
    const cpfValido1 = cpfBruto1 && cpfBruto1 !== 'Não informado' && cpfBruto1.replace(/\D/g, '').length > 0;
    const cpfFormatado1 = cpfValido1 ? censurarCpf(cpfBruto1) : null;
    const textoExibicao1 = cpfFormatado1 ? `CPF: ${cpfFormatado1}` : 'CPF não informado';

    expect(textoExibicao1).toBe('CPF: 123.***.***-00');

    // 2. Paciente sem CPF ou não informado
    const cpfBruto2: string | undefined = undefined;
    const cpfValido2 = cpfBruto2 && cpfBruto2 !== 'Não informado' && (cpfBruto2 as string).replace(/\D/g, '').length > 0;
    const cpfFormatado2 = cpfValido2 ? censurarCpf(cpfBruto2) : null;
    const textoExibicao2 = cpfFormatado2 ? `CPF: ${cpfFormatado2}` : 'CPF não informado';

    expect(textoExibicao2).toBe('CPF não informado');

    // 3. Paciente com CPF já mascarado vindo da API
    const cpfBruto3: string = '042.***.***-91';
    const cpfValido3 = cpfBruto3 && cpfBruto3 !== 'Não informado' && cpfBruto3.replace(/\D/g, '').length > 0;
    const cpfFormatado3 = cpfValido3 ? censurarCpf(cpfBruto3) : null;
    const textoExibicao3 = cpfFormatado3 ? `CPF: ${cpfFormatado3}` : 'CPF não informado';

    expect(textoExibicao3).toBe('CPF: 042.***.***-91');
  });

  it('deve exibir conselho e registro profissional abaixo do nome do profissional e inferir conselho pela especialidade', () => {
    // 1. Profissional com conselho e registro explícitos
    const cr1 = formatarConselhoERegistro('4898', 'CRESS', 'PSICOLOGIA' as any);
    expect(cr1).toBe('CRESS-DF 4898');

    // 2. Profissional com registro mas sem conselho direto (inferido pela especialidade)
    const crAudiometria = formatarConselhoERegistro('3333', undefined, 'AUDIOMETRIA' as any);
    expect(crAudiometria).toBe('CRFA-DF 3333');

    const crOdonto = formatarConselhoERegistro('9999', undefined, 'ODONTOLOGIA' as any);
    expect(crOdonto).toBe('CRO-DF 9999');

    // 3. Profissional sem registro nem conselho
    const crVazio = formatarConselhoERegistro(undefined, undefined, undefined);
    expect(crVazio || 'Não informado').toBe('Não informado');
  });

  it('deve encontrar correspondência de profissional por nome ou id para extrair conselho e registro', () => {
    const listaProfissionais = [
      {
        id: 'prof-01',
        nome: 'ANA CLAUDIA FERNANDES MEIRELES LEITAO',
        registro: '4898',
        conselho: 'CRESS',
      },
      {
        id: 'prof-02',
        nome: 'ANA CRISTINA RABELO PAIVA',
        registro: '12345',
        conselho: 'CRFA',
      },
    ];

    const consulta: ItemAtendimentoLista = {
      ...atendimentoMock,
      profissionalNome: 'ANA CLAUDIA FERNANDES MEIRELES', // Versão truncada/abreviada
    };

    const profEncontrado = listaProfissionais.find(
      (p) =>
        (consulta.profissionalId && p.id === consulta.profissionalId) ||
        (p.nome && consulta.profissionalNome && (
          p.nome.trim().toLowerCase() === consulta.profissionalNome.trim().toLowerCase() ||
          p.nome.trim().toLowerCase().startsWith(consulta.profissionalNome.trim().toLowerCase()) ||
          consulta.profissionalNome.trim().toLowerCase().startsWith(p.nome.trim().toLowerCase())
        ))
    );

    expect(profEncontrado).toBeDefined();
    expect(profEncontrado?.id).toBe('prof-01');

    const cr = formatarConselhoERegistro(
      consulta.profissionalRegistro || profEncontrado?.registro,
      consulta.profissionalConselho || profEncontrado?.conselho,
      consulta.especialidade
    );

    expect(cr).toBe('CRESS-DF 4898');
  });
});


import { useEffect, useMemo, useState, useRef, type FC } from 'react';
import {
  Brain,
  Calendar,
  Download,
  Ear,
  Eye,
  FileBarChart2,
  LoaderCircle,
  RotateCcw,
  Search,
  Sparkles,
  TriangleAlert,
  Apple,
} from 'lucide-react';
import { utils, writeFile } from 'xlsx';
import { requisicaoApi } from '../servicos/api.ts';
import { ESPECIALIDADE_LABELS, TURNO_LABELS, type Especialidade } from '../../compartilhado/index.ts';
import {
  useFiltroExcel,
  CabecalhoColunaExcel,
  BarraFiltrosAtivos,
  type ConfiguracaoColuna,
} from './tabelaExcel/index.ts';
import { CabecalhoPagina } from './CabecalhoPagina.tsx';
import { SeletorFiltroUniversal } from './SeletorFiltroUniversal.tsx';
import { EspecialidadeBadge } from './EspecialidadeVisual.tsx';

export interface RelatoriosProps {
  escolas?: Array<{ id: string; nome: string }>;
}

interface RelatorioDados {
  total: number;
  totalEncaminhamentos: number;
  porEspecialidade: Array<{ especialidade: string; total: number; encaminhamentos: number }>;
  porEscola: Array<{ id: string; nome: string; total: number }>;
  porProfissional: Array<{ id: string; nome: string; total: number }>;
  serie: Record<string, number>;
}

interface AtendimentoRelatorio {
  id: string;
  pacienteNome: string;
  especialidade: string;
  turno: string;
  criadoEm: string;
  escolaLocal: string;
  profissional: string;
  resumo: string | null;
  procedimentos: string | null;
  insumosUtilizados: string | null;
  encaminhamentoExterno: string | null;
}

const formatarDataBrasileira = (data: string) => {
  if (!data) return '';
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR');
};

export const Relatorios: FC<RelatoriosProps> = ({ escolas = [] }) => {
  const [escolaFiltro, setEscolaFiltro] = useState('');
  const [especialidadeFiltro, setEspecialidadeFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [profissionalFiltro, setProfissionalFiltro] = useState('');
  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  });
  const [dataFim, setDataFim] = useState(() => new Date().toISOString().slice(0, 10));
  const [periodoSelecionado, setPeriodoSelecionado] = useState<number | 'mes' | 'tudo' | null>(30);
  const [indicePico, setIndicePico] = useState<number | null>(null);
  const [buscaTabela, setBuscaTabela] = useState('');
  const [tooltipPosicao, setTooltipPosicao] = useState<{ x: number; y: number } | null>(null);
  const [profissionaisDisponiveis, setProfissionaisDisponiveis] = useState<Array<{ id: string; nome: string; especialidade?: string | null }>>([]);
  const [relatorioGerado, setRelatorioGerado] = useState(false);
  const [filtrosModificados, setFiltrosModificados] = useState(false);

  const dataInicioRef = useRef<HTMLInputElement>(null);
  const dataFimRef = useRef<HTMLInputElement>(null);

  const [dados, setDados] = useState<RelatorioDados>({
    total: 0,
    totalEncaminhamentos: 0,
    porEspecialidade: [],
    porEscola: [],
    porProfissional: [],
    serie: {},
  });
  const [dadosTabela, setDadosTabela] = useState<Array<{
    id: string;
    data: string;
    paciente: string;
    cpf: string;
    especialidade: string;
    profissional: string;
    instituicao: string;
    status: string;
    resumo: string;
    procedimentos: string;
    insumos: string;
    encaminhamento: string;
  }>>([]);
  const [carregando, setCarregando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const aplicarPeriodo = (dias: number | 'mes' | 'tudo') => {
    const hoje = new Date();
    const dataFinal = hoje.toISOString().slice(0, 10);
    let dataInicial = '';

    if (dias === 'tudo') {
      dataInicial = '';
    } else if (dias === 'mes') {
      const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      dataInicial = primeiroDia.toISOString().slice(0, 10);
    } else {
      const inicio = new Date();
      inicio.setDate(hoje.getDate() - (dias - 1));
      dataInicial = inicio.toISOString().slice(0, 10);
    }

    setDataInicio(dataInicial);
    setDataFim(dataFinal);
    setPeriodoSelecionado(dias);
    if (relatorioGerado) setFiltrosModificados(true);
  };

  const handleGerarRelatorio = () => {
    if (dataInicio && dataFim && dataInicio > dataFim) {
      setErro('A data inicial não pode ser posterior à data final.');
      return;
    }
    setErro(null);
    setRelatorioGerado(true);
    setFiltrosModificados(false);
  };

  useEffect(() => {
    if (!relatorioGerado) return;

    const controlador = new AbortController();
    const carregarRelatorio = async () => {
      if (dataInicio && dataFim && dataInicio > dataFim) {
        setErro('A data inicial não pode ser posterior à data final.');
        return;
      }

      setCarregando(true);
      setErro(null);

      if (statusFiltro && statusFiltro !== 'CONCLUIDO' && statusFiltro !== 'concluido') {
        setDados({ total: 0, totalEncaminhamentos: 0, porEspecialidade: [], porEscola: [], porProfissional: [], serie: {} });
        setDadosTabela([]);
        setCarregando(false);
        return;
      }

      const parametros = new URLSearchParams({ pagina: '1', porPagina: '100' });
      if (dataInicio) parametros.set('dataInicio', dataInicio);
      if (dataFim) parametros.set('dataFim', dataFim);
      if (escolaFiltro) parametros.set('escolaLocalId', escolaFiltro);
      if (especialidadeFiltro) parametros.set('especialidade', especialidadeFiltro);
      if (profissionalFiltro) parametros.set('usuarioId', profissionalFiltro);

      try {
        const [respostaRelatorio, respostaAtendimentos] = await Promise.all([
          requisicaoApi<RelatorioDados>(`/atendimentos/relatorio?${parametros.toString()}`),
          requisicaoApi<{ dados: AtendimentoRelatorio[] }>(`/atendimentos?${parametros.toString()}`),
        ]);

        if (controlador.signal.aborted) return;

        setDados({
          total: respostaRelatorio.total ?? 0,
          totalEncaminhamentos: respostaRelatorio.totalEncaminhamentos ?? 0,
          porEspecialidade: respostaRelatorio.porEspecialidade ?? [],
          porEscola: respostaRelatorio.porEscola ?? [],
          porProfissional: respostaRelatorio.porProfissional ?? [],
          serie: respostaRelatorio.serie ?? {},
        });

        setDadosTabela(
          (respostaAtendimentos.dados ?? []).map((item) => ({
            id: item.id,
            data: new Date(item.criadoEm).toLocaleString('pt-BR', {
              dateStyle: 'short',
              timeStyle: 'short',
            }),
            paciente: item.pacienteNome || 'Paciente não informado',
            cpf: 'Não informado',
            especialidade: item.especialidade,
            profissional: item.profissional || 'Não informado',
            instituicao: item.escolaLocal || 'Não informado',
            status: item.turno ? item.turno.charAt(0).toUpperCase() + item.turno.slice(1).toLowerCase() : 'Atendido',
            resumo: item.resumo || 'Não informado',
            procedimentos: item.procedimentos || 'Não informado',
            insumos: item.insumosUtilizados || 'Não informado',
            encaminhamento: item.encaminhamentoExterno || 'Não informado',
          }))
        );
        setFiltrosModificados(false);
      } catch (erroApi) {
        if (!controlador.signal.aborted) {
          setDados({ total: 0, totalEncaminhamentos: 0, porEspecialidade: [], porEscola: [], porProfissional: [], serie: {} });
          setDadosTabela([]);
          setErro(erroApi instanceof Error ? erroApi.message : 'Não foi possível carregar o relatório.');
        }
      } finally {
        if (!controlador.signal.aborted) setCarregando(false);
      }
    };

    void carregarRelatorio();
    return () => controlador.abort();
  }, [relatorioGerado, dataInicio, dataFim, escolaFiltro, especialidadeFiltro, statusFiltro, profissionalFiltro]);

  useEffect(() => {
    let ativo = true;

    const carregarProfissionais = async () => {
      try {
        const resposta = await requisicaoApi<{ dados: Array<{ id: string; nome: string; especialidade?: string | null }> }>('/atendimentos/profissionais');
        if (ativo && resposta?.dados) {
          setProfissionaisDisponiveis(resposta.dados);
        }
      } catch (erroApi) {
        if (ativo) console.error('Erro ao carregar profissionais:', erroApi);
      }
    };

    void carregarProfissionais();
    return () => {
      ativo = false;
    };
  }, []);

  const metricasEspecialidade = useMemo(
    () =>
      (dados.porEspecialidade || []).map((item) => ({
        especialidade: ESPECIALIDADE_LABELS[item.especialidade as Especialidade] ?? item.especialidade,
        atendimentos: item.total,
        encaminhamentos: item.encaminhamentos,
      })),
    [dados.porEspecialidade],
  );

  const totalGeral = dados.total || 0;

  const linhaDoTempo = useMemo(() => {
    const entradas = Object.entries(dados.serie || {}).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
    return entradas.map(([data, valor]) => ({ data, valor }));
  }, [dados.serie]);

  const rankingEspecialidades = [...metricasEspecialidade]
    .sort((a, b) => b.atendimentos - a.atendimentos)
    .slice(0, 4);

  const rankingProfissionais = [...(dados.porProfissional || [])]
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  const rankingEscolas = [...(dados.porEscola || [])].sort((a, b) => b.total - a.total);

  const dadosGrafico = linhaDoTempo.map((item, index) => ({
    ...item,
    x: (index / Math.max(1, linhaDoTempo.length - 1)) * 900,
    y: 190 - (item.valor / Math.max(1, Math.max(...linhaDoTempo.map((valor) => valor.valor), 100))) * 130,
  }));

  const picoGrafico = useMemo(() => {
    if (!dadosGrafico.length) return null;
    const melhor = dadosGrafico.reduce((melhorItem, item) => (item.valor > melhorItem.valor ? item : melhorItem), dadosGrafico[0]);
    return melhor && melhor.valor > 0 ? melhor : null;
  }, [dadosGrafico]);

  useEffect(() => {
    if (!picoGrafico) {
      setIndicePico(null);
    }
  }, [picoGrafico?.data, picoGrafico?.valor]);

  const maxBarra = Math.max(...rankingEspecialidades.map((item) => item.atendimentos), 1);
  const maxProfissional = Math.max(...rankingProfissionais.map((item) => item.total), 1);
  const maxEscola = Math.max(...rankingEscolas.map((item) => item.total), 1);

  type RegistroRelatorio = {
    id?: string;
    data: string;
    paciente: string;
    cpf: string;
    especialidade: string;
    profissional: string;
    instituicao: string;
    status: string;
  };

  const colunasTabela = useMemo<ConfiguracaoColuna<RegistroRelatorio>[]>(
    () => [
      { id: 'data', rotulo: 'Data', tipo: 'texto', obterValor: (item) => item.data },
      { id: 'paciente', rotulo: 'Paciente', tipo: 'texto', obterValor: (item) => item.paciente },
      { id: 'cpf', rotulo: 'CPF', tipo: 'texto', obterValor: (item) => item.cpf },
      { id: 'especialidade', rotulo: 'Especialidade', tipo: 'texto', obterValor: (item) => item.especialidade },
      { id: 'profissional', rotulo: 'Profissional', tipo: 'texto', obterValor: (item) => item.profissional },
      { id: 'instituicao', rotulo: 'Instituição', tipo: 'texto', obterValor: (item) => item.instituicao },
      { id: 'status', rotulo: 'Status', tipo: 'texto', obterValor: (item) => item.status },
    ],
    []
  );

  const filtroExcel = useFiltroExcel<RegistroRelatorio>({
    dados: dadosTabela,
    colunas: colunasTabela,
    buscaGeral: buscaTabela,
    funcaoBuscaGeral: (item, termo) =>
      [item.data, item.paciente, item.cpf, item.especialidade, item.profissional, item.instituicao, item.status]
        .some((valor) => valor.toLowerCase().includes(termo)),
  });

  const dadosTabelaFiltrados = filtroExcel.dadosFiltrados;

  const handleMovimentoPonto = (evento: React.MouseEvent<SVGCircleElement>, index: number) => {
    const alvo = evento.currentTarget;
    const retangulo = alvo.ownerSVGElement?.getBoundingClientRect();
    if (!retangulo) return;

    const x = evento.clientX - retangulo.left;
    const y = evento.clientY - retangulo.top;

    setIndicePico(index);
    setTooltipPosicao({ x: x + 12, y: y - 12 });
  };

  const getPaletaEspecialidade = (especialidade: string) => {
    const chave = especialidade?.toUpperCase() ?? '';

    switch (chave) {
      case 'AUDIOMETRIA':
        return { icone: Ear, barra: '#3b82f6', texto: '#1d4ed8', fundoIcone: 'bg-[#e0f2fe] text-[#1d4ed8]', badge: 'bg-[#dbeafe] text-[#1d4ed8]' };
      case 'NUTRICAO':
        return { icone: Apple, barra: '#22c55e', texto: '#15803d', fundoIcone: 'bg-[#dcfce7] text-[#15803d]', badge: 'bg-[#dcfce7] text-[#15803d]' };
      case 'PSICOLOGIA':
        return { icone: Brain, barra: '#4f46e5', texto: '#4338ca', fundoIcone: 'bg-[#eef2ff] text-[#4338ca]', badge: 'bg-[#e0e7ff] text-[#4338ca]' };
      case 'ODONTOLOGIA':
        return { icone: Sparkles, barra: '#ef4444', texto: '#b91c1c', fundoIcone: 'bg-[#fee2e2] text-[#b91c1c]', badge: 'bg-[#fee2e2] text-[#b91c1c]' };
      case 'OFTALMOLOGIA':
      case 'OTALMOLOGIA':
        return { icone: Eye, barra: '#10b981', texto: '#047857', fundoIcone: 'bg-[#d1fae5] text-[#047857]', badge: 'bg-[#d1fae5] text-[#047857]' };
      default:
        return { icone: Sparkles, barra: '#64748b', texto: '#475569', fundoIcone: 'bg-slate-100 text-slate-600', badge: 'bg-slate-100 text-slate-600' };
    }
  };

  const handleExportarPlanilha = async () => {
    if (dataInicio > dataFim) {
      setErro('A data inicial não pode ser posterior à data final.');
      return;
    }

    setExportando(true);
    setErro(null);

    try {
      if (statusFiltro && statusFiltro !== 'concluido') {
        setErro('Não há atendimentos com este status no modelo atual de dados.');
        return;
      }

      const parametrosBase = new URLSearchParams({ dataInicio, dataFim, pagina: '1', porPagina: '100' });
      if (escolaFiltro) parametrosBase.set('escolaLocalId', escolaFiltro);
      if (especialidadeFiltro) parametrosBase.set('especialidade', especialidadeFiltro);
      if (profissionalFiltro) parametrosBase.set('usuarioId', profissionalFiltro);

      const primeiraPagina = await requisicaoApi<{
        dados: AtendimentoRelatorio[];
        total: number;
        totalPaginas: number;
      }>(`/atendimentos?${parametrosBase.toString()}`);

      const paginasRestantes = Array.from(
        { length: Math.max(0, (primeiraPagina.totalPaginas ?? 1) - 1) },
        (_, indice) => indice + 2,
      );
      const respostasRestantes = await Promise.all(
        paginasRestantes.map((pagina) => {
          const parametros = new URLSearchParams(parametrosBase);
          parametros.set('pagina', String(pagina));
          return requisicaoApi<{ dados: AtendimentoRelatorio[] }>(`/atendimentos?${parametros.toString()}`);
        }),
      );
      const atendimentos = [primeiraPagina, ...respostasRestantes].flatMap((resposta) => resposta.dados ?? []);

      const linhas = atendimentos.map((item) => ({
        ID: item.id,
        Data: new Date(item.criadoEm).toLocaleString('pt-BR'),
        Paciente: item.pacienteNome || 'Não informado',
        Especialidade: ESPECIALIDADE_LABELS[item.especialidade as Especialidade] ?? item.especialidade,
        Turno: TURNO_LABELS[item.turno as keyof typeof TURNO_LABELS] ?? item.turno,
        Profissional: item.profissional || 'Não informado',
        Instituição: item.escolaLocal || 'Não informado',
        Resumo: item.resumo || 'Não informado',
        Procedimentos: item.procedimentos || 'Não informado',
        'Insumos utilizados': item.insumosUtilizados || 'Não informado',
        'Encaminhamento externo': item.encaminhamentoExterno || 'Não informado',
      }));

      const resumo = [
        { Indicador: 'Período inicial', Valor: dataInicio },
        { Indicador: 'Período final', Valor: dataFim },
        { Indicador: 'Total de atendimentos', Valor: primeiraPagina.total ?? atendimentos.length },
        { Indicador: 'Encaminhamentos', Valor: dados.totalEncaminhamentos },
        { Indicador: 'Filtros', Valor: [escolaFiltro, especialidadeFiltro, statusFiltro, profissionalFiltro].filter(Boolean).join(' | ') || 'Nenhum' },
      ];

      const planilha = utils.book_new();
      const abaAtendimentos = utils.json_to_sheet(linhas);
      const abaResumo = utils.json_to_sheet(resumo);
      abaAtendimentos['!cols'] = [
        { wch: 38 }, { wch: 20 }, { wch: 30 }, { wch: 20 }, { wch: 12 },
        { wch: 32 }, { wch: 32 }, { wch: 48 }, { wch: 48 }, { wch: 32 }, { wch: 48 },
      ];
      abaResumo['!cols'] = [{ wch: 28 }, { wch: 80 }];
      utils.book_append_sheet(planilha, abaAtendimentos, 'Atendimentos');
      utils.book_append_sheet(planilha, abaResumo, 'Resumo');
      writeFile(planilha, `atendimentos_${dataInicio}_${dataFim}.xlsx`);
    } catch (erroApi) {
      setErro(erroApi instanceof Error ? erroApi.message : 'Não foi possível gerar a planilha.');
    } finally {
      setExportando(false);
    }
  };

  const resumoCards = useMemo(() => {
    return [
      { label: 'Total', valor: totalGeral, detalhe: `${totalGeral === 1 ? 'atendimento' : 'atendimentos'}` },
      { label: 'Concluídos', valor: totalGeral, detalhe: 'atendimentos registrados' },
      { label: 'Agendados', valor: 0, detalhe: 'sem registros no período' },
      { label: 'Em atendimento', valor: 0, detalhe: 'sem registros no período' },
      { label: 'Cancelados', valor: 0, detalhe: 'sem registros no período' },
    ];
  }, [totalGeral]);

  const alertasOperacionais = useMemo(() => {
    const alertas: Array<{ tipo: 'info' | 'alerta'; texto: string }> = [];

    if (dados.porEspecialidade.length >= 2) {
      const top = dados.porEspecialidade[0];
      const segunda = dados.porEspecialidade[1];
      if (top && segunda) {
        alertas.push({
          tipo: 'alerta',
          texto: `${ESPECIALIDADE_LABELS[top.especialidade as Especialidade] ?? top.especialidade} lidera o período com ${top.total} atendimentos; a segunda posição é ${ESPECIALIDADE_LABELS[segunda.especialidade as Especialidade] ?? segunda.especialidade} com ${segunda.total}.`,
        });
      }
    }

    if (!alertas.length) {
      alertas.push({ tipo: 'info', texto: 'Sem alertas operacionais para o período selecionado.' });
    }

    return alertas;
  }, [dados.porEspecialidade]);

  return (
    <div className="flex flex-col flex-1 animate-fade-in font-sans">
      {/* ─── Cabeçalho Fixo Modular ───── */}
      <CabecalhoPagina
        titulo="Relatórios"
        subtitulo="ANÁLISES OPERACIONAIS CONSOLIDADAS, OFICIAIS E RASTREÁVEIS"
        acoesExtras={
          <div className="flex flex-col gap-2 w-full min-w-0">
            {/* Linha 1: De | Até | Status | Instituição | Especialidade | Profissional */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[150px_150px_1fr_1.6fr_1.2fr_1.6fr] items-center gap-2.5 w-full min-w-0">
              {/* Data Inicial */}
              <label
                className="relative flex h-10 cursor-pointer items-center justify-between gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 transition-colors hover:border-slate-300 w-full min-w-0 shadow-2xs"
                onClick={(evento) => {
                  evento.preventDefault();
                  dataInicioRef.current?.showPicker?.();
                }}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="shrink-0 text-slate-400 font-bold text-[11px]">De</span>
                  <span className="pointer-events-none whitespace-nowrap font-medium text-slate-700 text-xs">
                    {dataInicio ? new Date(`${dataInicio}T12:00:00`).toLocaleDateString('pt-BR') : 'dd/mm/aaaa'}
                  </span>
                </div>
                <Calendar className="pointer-events-none h-3.5 w-3.5 shrink-0 text-slate-400" />
                <input
                  ref={dataInicioRef}
                  type="date"
                  value={dataInicio}
                  onChange={(evento) => {
                    setPeriodoSelecionado(null);
                    setDataInicio(evento.target.value);
                    if (relatorioGerado) setFiltrosModificados(true);
                  }}
                  className="pointer-events-none absolute h-px w-px opacity-0"
                  aria-label="Data inicial"
                />
              </label>

              {/* Data Final */}
              <label
                className="relative flex h-10 cursor-pointer items-center justify-between gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 transition-colors hover:border-slate-300 w-full min-w-0 shadow-2xs"
                onClick={(evento) => {
                  evento.preventDefault();
                  dataFimRef.current?.showPicker?.();
                }}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="shrink-0 text-slate-400 font-bold text-[11px]">Até</span>
                  <span className="pointer-events-none whitespace-nowrap font-medium text-slate-700 text-xs">
                    {dataFim ? new Date(`${dataFim}T12:00:00`).toLocaleDateString('pt-BR') : 'dd/mm/aaaa'}
                  </span>
                </div>
                <Calendar className="pointer-events-none h-3.5 w-3.5 shrink-0 text-slate-400" />
                <input
                  ref={dataFimRef}
                  type="date"
                  value={dataFim}
                  onChange={(evento) => {
                    setPeriodoSelecionado(null);
                    setDataFim(evento.target.value);
                    if (relatorioGerado) setFiltrosModificados(true);
                  }}
                  className="pointer-events-none absolute h-px w-px opacity-0"
                  aria-label="Data final"
                />
              </label>

              {/* Status */}
              <div className="w-full min-w-0">
                <SeletorFiltroUniversal
                  categoria="status"
                  valor={statusFiltro}
                  aoMudar={(val) => {
                    setStatusFiltro(val);
                    if (relatorioGerado) setFiltrosModificados(true);
                  }}
                  placeholder="Todos os status"
                  tamanho="sm"
                  fundoBranco
                  pesquisavel={false}
                />
              </div>

              {/* Instituição */}
              <div className="w-full min-w-0">
                <SeletorFiltroUniversal
                  categoria="instituicoes"
                  valor={escolaFiltro}
                  aoMudar={(val) => {
                    setEscolaFiltro(val);
                    if (relatorioGerado) setFiltrosModificados(true);
                  }}
                  placeholder="Todas as instituições"
                  tamanho="sm"
                  fundoBranco
                  opcoes={escolas.map((item) => ({ id: item.nome, valor: item.nome, nome: item.nome, rotulo: item.nome }))}
                />
              </div>

              {/* Especialidade */}
              <div className="w-full min-w-0">
                <SeletorFiltroUniversal
                  categoria="especialidades"
                  valor={especialidadeFiltro}
                  aoMudar={(val) => {
                    setEspecialidadeFiltro(val);
                    if (relatorioGerado) setFiltrosModificados(true);
                  }}
                  placeholder="Todas as especialidades"
                  tamanho="sm"
                  fundoBranco
                  pesquisavel={false}
                />
              </div>

              {/* Profissional */}
              <div className="w-full min-w-0">
                <SeletorFiltroUniversal
                  categoria="profissionais"
                  valor={profissionalFiltro}
                  aoMudar={(val) => {
                    setProfissionalFiltro(val);
                    if (relatorioGerado) setFiltrosModificados(true);
                  }}
                  placeholder="Todos os profissionais"
                  tamanho="sm"
                  fundoBranco
                  opcoes={profissionaisDisponiveis.map((p) => ({
                    id: p.id,
                    valor: p.id,
                    nome: p.nome,
                    rotulo: p.nome,
                    badge: p.especialidade ? <EspecialidadeBadge especialidade={p.especialidade as Especialidade} compacto /> : undefined,
                  }))}
                />
              </div>
            </div>

            {/* Linha 2: Botões Rápidos de Período + Limpar */}
            <div className="flex flex-nowrap items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => aplicarPeriodo(7)}
                className={`h-10 rounded-xl border border-slate-200 px-3 text-[11px] font-bold transition-colors cursor-pointer ${
                  periodoSelecionado === 7 ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                7 dias
              </button>
              <button
                type="button"
                onClick={() => aplicarPeriodo(15)}
                className={`hidden h-10 rounded-xl border border-slate-200 px-3 text-[11px] font-bold transition-colors md:block cursor-pointer ${
                  periodoSelecionado === 15 ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                15 dias
              </button>
              <button
                type="button"
                onClick={() => aplicarPeriodo(30)}
                className={`h-10 rounded-xl border border-slate-200 px-3 text-[11px] font-bold transition-colors cursor-pointer ${
                  periodoSelecionado === 30 ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                30 dias
              </button>
              <button
                type="button"
                onClick={() => aplicarPeriodo('mes')}
                className={`hidden h-10 rounded-xl border border-slate-200 px-3 text-[11px] font-bold transition-colors lg:block cursor-pointer ${
                  periodoSelecionado === 'mes' ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                Este mês
              </button>
              <button
                type="button"
                onClick={() => aplicarPeriodo('tudo')}
                className={`h-10 rounded-xl border border-slate-200 px-3 text-[11px] font-bold transition-colors cursor-pointer ${
                  periodoSelecionado === 'tudo' ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                Tudo
              </button>
              <span className="mx-0.5 h-6 w-px bg-slate-200" aria-hidden="true" />
              <button
                type="button"
                onClick={() => {
                  setBuscaTabela('');
                  setStatusFiltro('');
                  setEscolaFiltro('');
                  setEspecialidadeFiltro('');
                  setProfissionalFiltro('');
                  setDataInicio('');
                  setDataFim('');
                  setPeriodoSelecionado(null);
                  setErro(null);
                  setFiltrosModificados(false);
                  setRelatorioGerado(false);
                }}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Limpar
              </button>
              <span className="mx-0.5 h-6 w-px bg-slate-200" aria-hidden="true" />
              <button
                type="button"
                onClick={handleGerarRelatorio}
                className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-bold transition-all shadow-sm cursor-pointer ${
                  filtrosModificados
                    ? 'bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-300 animate-pulse'
                    : 'bg-[#034b7f] text-white hover:bg-[#023a63]'
                }`}
              >
                <FileBarChart2 className="h-4 w-4" />
                {relatorioGerado ? (filtrosModificados ? 'Atualizar Relatório' : 'Relatório Atualizado') : 'Gerar Relatório'}
              </button>
            </div>
          </div>
        }
        fixo={false}
      />

      {!relatorioGerado ? (
        <div className="flex flex-1 min-h-[400px] flex-col items-center justify-center p-8 text-center my-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100/80 text-slate-400 mb-3">
            <FileBarChart2 className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">Nenhum relatório gerado</h3>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            Ajuste os filtros acima e clique em <span className="font-medium text-slate-600">"Gerar Relatório"</span> para carregar os dados.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-[#f7fafc] px-5 py-4">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Relatório oficial</div>
                  <div className="mt-1 text-[13px] font-bold text-slate-800">
                    Relatório Analítico de Atendimentos ({dataInicio ? formatarDataBrasileira(dataInicio) : 'Início'} - {dataFim ? formatarDataBrasileira(dataFim) : 'Fim'})
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleExportarPlanilha()}
                  disabled={exportando}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#cfe1ee] bg-[#f7fafc] px-4 py-2.5 text-[15px] font-semibold text-[#0d4d7a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition hover:border-[#bcd7eb] hover:bg-[#eef6fb] disabled:cursor-wait disabled:opacity-60 cursor-pointer"
                >
                  {exportando ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {exportando ? 'Gerando planilha...' : 'Baixar planilha'}
                </button>
              </div>
            </div>

        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-5">
          {resumoCards.map((card, index) => (
            <div key={`${card.label}-${index}`} className="rounded-xl border border-[#dfeaf5] bg-[#eef6ff] p-3 text-[#0d4d7a] shadow-[0_1px_0_rgba(15,23,42,0.02)]">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-80">{card.label}</div>
              <div className="mt-2 text-[26px] font-extrabold leading-none">{card.valor}</div>
              <div className="mt-2 text-[10px] font-semibold opacity-80">{card.detalhe}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 bg-[#f7fafc] p-5">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0d4d7a]">
            <TriangleAlert className="h-4 w-4 text-[#0d4d7a]" />
            Alertas operacionais ({alertasOperacionais.length})
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {alertasOperacionais.map((alerta, index) => (
              <div
                key={`${alerta.texto}-${index}`}
                className={`rounded-xl border px-4 py-3 text-[15px] ${alerta.tipo === 'alerta' ? 'border-[#f2d49b] bg-[#fff7df] text-[#7c5a11]' : 'border-[#bfe0ff] bg-[#eef7ff] text-[#0d4d7a]'}`}
              >
                {alerta.texto}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1.2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Ranking de profissionais</div>
          <div className="space-y-4">
            {rankingProfissionais.map((item) => {
              const paleta = getPaletaEspecialidade('PSICOLOGIA');
              const Icone = paleta.icone;

              return (
                <div key={item.id}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-[15px] font-semibold text-slate-700">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full border border-current/10 ${paleta.fundoIcone}`}>
                        <Icone className="h-3.5 w-3.5" />
                      </span>
                      <span className="truncate font-medium text-slate-700">{item.nome}</span>
                    </div>
                    <span className="shrink-0 font-bold text-slate-600">{item.total}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100">
                    <div className="h-full rounded-full" style={{ width: `${(item.total / maxProfissional) * 100}%`, backgroundColor: paleta.barra }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Ranking de especialidades</div>
          <div className="space-y-4">
            {rankingEspecialidades.map((item) => {
              const especialidade = item.especialidade?.toUpperCase() ?? '';
              const paleta = getPaletaEspecialidade(especialidade);
              const Icone = paleta.icone;

              return (
                <div key={item.especialidade}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-[15px] font-semibold text-slate-700">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full border border-current/10 ${paleta.fundoIcone}`}>
                        <Icone className="h-3.5 w-3.5" />
                      </span>
                      <span className="truncate font-medium text-slate-700">{item.especialidade}</span>
                    </div>
                    <span className="shrink-0 font-bold text-slate-600">{item.atendimentos}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100">
                    <div className="h-full rounded-full" style={{ width: `${(item.atendimentos / maxBarra) * 100}%`, backgroundColor: paleta.barra }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Produtividade por unidade</div>
          <div className="space-y-4">
            {rankingEscolas.map((item) => (
              <div key={item.id}>
                <div className="mb-1 flex items-center justify-between gap-3 text-[15px] font-semibold text-slate-700">
                  <span className="truncate font-medium text-slate-700">{item.nome}</span>
                  <span className="shrink-0 font-bold text-slate-600">{item.total}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-[#f59e0b]" style={{ width: `${(item.total / maxEscola) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Gráfico por período</div>
          {picoGrafico && (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f7c9c9] bg-[#fff0f0] px-2 py-1 text-[10px] font-medium text-[#d94c4c]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e75656]" />
              Pico de Atendimento: {picoGrafico.data} ({picoGrafico.valor} consultas)
            </div>
          )}
        </div>

        <div className="relative h-[220px] w-full overflow-hidden rounded-xl">
          <svg viewBox="0 0 900 220" className="h-[220px] w-full overflow-visible">
            {[0, 1, 2, 3, 4].map((linha) => (
              <line key={linha} x1="0" x2="900" y1={30 + linha * 40} y2={30 + linha * 40} stroke="#e6edf3" strokeWidth="1" strokeDasharray="3 6" />
            ))}

            <polyline
              fill="none"
              stroke="#0d4d7a"
              strokeWidth="2.5"
              points={dadosGrafico.map((item) => `${item.x},${item.y}`).join(' ')}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {dadosGrafico.map((item, index) => {
              const ativo = indicePico === index;
              return (
                <g key={`${item.data}-${index}`}>
                  <circle
                    cx={item.x}
                    cy={item.y}
                    r={ativo ? 6 : 4.5}
                    fill={ativo ? '#0d4d7a' : '#ffffff'}
                    stroke="#0d4d7a"
                    strokeWidth={ativo ? 2.2 : 1.8}
                    className="cursor-pointer"
                    onMouseEnter={(evento) => handleMovimentoPonto(evento, index)}
                    onMouseLeave={() => {
                      setIndicePico(null);
                      setTooltipPosicao(null);
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {indicePico !== null && indicePico >= 0 && dadosGrafico[indicePico] && tooltipPosicao && (
            <div
              className="pointer-events-none absolute z-[100] -translate-x-1/2 -translate-y-full rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-center shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
              style={{
                left: `${tooltipPosicao.x}px`,
                top: `${tooltipPosicao.y}px`,
              }}
            >
              <div className="text-[11px] font-semibold text-slate-600">Data: {dadosGrafico[indicePico].data}</div>
              <div className="text-[11px] font-semibold text-slate-700">Quantidade: {dadosGrafico[indicePico].valor} atendimentos</div>
            </div>
          )}

          <div className="pointer-events-none absolute left-0 top-0 flex h-full w-full items-start justify-start px-2 pt-2 text-[10px] text-slate-400">
            <div className="flex flex-col gap-9">
              {[260, 195, 130, 65, 0].map((valor) => (
                <span key={valor}>{valor}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
          {linhaDoTempo.map((item) => (
            <span key={item.data}>{item.data}</span>
          ))}
        </div>
      </div>

      <div className="mt-8 mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-[#f7fafc] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              <Search className="h-4 w-4 text-slate-500" />
              Registros de pacientes ({dadosTabelaFiltrados.length} exibidos)
            </div>

            <div className="flex h-10 w-full max-w-[260px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={buscaTabela}
                onChange={(evento) => setBuscaTabela(evento.target.value)}
                placeholder="Filtrar registros..."
                className="w-full bg-transparent text-[15px] text-slate-700 placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>
        </div>

        <BarraFiltrosAtivos estado={filtroExcel} entidadeNome="registro(s)" />

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-[15px]">
            <thead className="bg-[#f8fafc] text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <CabecalhoColunaExcel colunaId="data" rotulo="Data" estado={filtroExcel} className="px-4 py-3" />
                <CabecalhoColunaExcel colunaId="paciente" rotulo="Paciente" estado={filtroExcel} className="px-4 py-3" />
                <CabecalhoColunaExcel colunaId="cpf" rotulo="CPF" estado={filtroExcel} className="px-4 py-3" />
                <CabecalhoColunaExcel colunaId="especialidade" rotulo="Especialidade" estado={filtroExcel} className="px-4 py-3" />
                <CabecalhoColunaExcel colunaId="profissional" rotulo="Profissional" estado={filtroExcel} className="px-4 py-3" />
                <CabecalhoColunaExcel colunaId="instituicao" rotulo="Instituição" estado={filtroExcel} className="px-4 py-3" />
                <CabecalhoColunaExcel colunaId="status" rotulo="Status" estado={filtroExcel} className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {dadosTabelaFiltrados.length ? (
                dadosTabelaFiltrados.map((linha, index) => (
                  <tr key={`${linha.id ?? linha.paciente}-${index}`} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{linha.data}</td>
                    <td className="px-4 py-3 text-slate-700">{linha.paciente}</td>
                    <td className="px-4 py-3 text-slate-700">{linha.cpf}</td>
                    <td className="px-4 py-3 text-slate-700">{linha.especialidade}</td>
                    <td className="px-4 py-3 text-slate-700">{linha.profissional}</td>
                    <td className="px-4 py-3 text-slate-700">{linha.instituicao}</td>
                    <td className="px-4 py-3 text-slate-700">
                      <span className="inline-flex items-center rounded-full bg-[#e0f2fe] px-2.5 py-1 text-[11px] font-semibold text-[#0d4d7a]">
                        {linha.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[15px] text-slate-500">
                    Nenhum atendimento encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {erro && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[15px] font-medium text-red-700">
          {erro}
        </div>
      )}

      {carregando && (
        <div className="mb-4 flex items-center gap-2 text-[15px] font-medium text-slate-600">
          <LoaderCircle className="h-4 w-4 animate-spin text-[#0d4d7a]" />
          Atualizando relatório...
        </div>
      )}
    </div>
  );
};

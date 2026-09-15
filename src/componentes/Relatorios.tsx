import { useEffect, useMemo, useState, useRef, type FC } from 'react';
import { createPortal } from 'react-dom';
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
  Printer,
  X,
  Activity,
  Building2,
  FileText,
  Smile,
  Zap,
  ShieldCheck,
  Users,
  FileSpreadsheet,
} from 'lucide-react';
import { utils, writeFile } from 'xlsx';
import { ModalImportarPlanilha } from './ModalImportarPlanilha.tsx';
import { requisicaoApi } from '../servicos/api.ts';
import {
  ESPECIALIDADE_LABELS,
  STATUS_ATENDIMENTO_LABELS,
  StatusAtendimento,
  type Especialidade,
  formatarDataBrasilia,
  formatarDataEHoraBrasilia,
  obterDataHojeBrasilia,
} from '../../compartilhado/index.ts';
import {
  useFiltroExcel,
  CabecalhoColunaExcel,
  BarraFiltrosAtivos,
  type ConfiguracaoColuna,
} from './tabelaExcel/index.ts';
import { formatarConselhoERegistro } from './FilaDoDia.tsx';
import { CabecalhoPagina } from './CabecalhoPagina.tsx';
import { Botao } from './Botao.tsx';
import { SeletorFiltroUniversal } from './SeletorFiltroUniversal.tsx';
import { EspecialidadeBadge } from './EspecialidadeVisual.tsx';
import { StatusAtendimentoBadge, obterEstiloStatusAtendimento } from './StatusAtendimentoBadge.tsx';

export interface RelatoriosProps {
  escolas?: Array<{ id: string; nome: string }>;
}

interface RelatorioDados {
  total: number;
  pacientesUnicos?: number;
  mediaDiaria?: number;
  picoAtendimento?: { data: string; total: number } | null;
  porStatus?: Record<string, number>;
  porEspecialidade: Array<{ especialidade: string; total: number }>;
  porEscola: Array<{ id: string; nome: string; total: number }>;
  porProfissional: Array<{ id: string; nome: string; total: number }>;
  serie: Record<string, number>;
}

interface AtendimentoRelatorio {
  id: string;
  pacienteNome: string;
  pacienteCpf?: string;
  pacienteTurma?: string;
  especialidade: string;
  status?: string;
  criadoEm: string;
  escolaLocal: string;
  profissional: string;
  profissionalRegistro?: string | null;
  profissionalConselho?: string | null;
  resumo: string | null;
  procedimentos: string | null;
}

interface RegistroTabela {
  id: string;
  data: string;
  paciente: string;
  turma: string;
  cpf: string;
  especialidade: string;
  profissional: string;
  registroConselho?: string;
  instituicao: string;
  status: string;
  resumo: string;
  procedimentos: string;
}

const formatarDataBrasileira = (data: string) => {
  if (!data) return '';
  return formatarDataBrasilia(data);
};

const getDiaDaSemana = (dataIso: string) => {
  if (!dataIso) return '';
  const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const d = new Date(`${dataIso}T12:00:00`);
  return dias[d.getDay()] ?? '';
};

export const Relatorios: FC<RelatoriosProps> = ({ escolas = [] }) => {
  const [escolasLocais, setEscolasLocais] = useState<Array<{ id: string; nome: string }>>(escolas);
  const [escolaFiltro, setEscolaFiltro] = useState('');
  const [especialidadeFiltro, setEspecialidadeFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [profissionalFiltro, setProfissionalFiltro] = useState('');

  const [dataInicio, setDataInicio] = useState(() => {
    const hojeStr = obterDataHojeBrasilia();
    const d = new Date(`${hojeStr}T12:00:00-03:00`);
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  });
  const [dataFim, setDataFim] = useState(() => obterDataHojeBrasilia());
  const [periodoSelecionado, setPeriodoSelecionado] = useState<number | 'mes' | 'tudo' | null>(30);

  const [indicePontoAtivo, setIndicePontoAtivo] = useState<number | null>(null);
  const [buscaTabela, setBuscaTabela] = useState('');
  const [tooltipPosicao, setTooltipPosicao] = useState<{ x: number; y: number } | null>(null);
  const [profissionaisDisponiveis, setProfissionaisDisponiveis] = useState<Array<{ id: string; nome: string; especialidade?: string | null }>>([]);

  const [relatorioGerado, setRelatorioGerado] = useState(false);
  const [gatilhoExecucao, setGatilhoExecucao] = useState(0);
  interface RespostaSinteseIa {
    origem?: string;
    modelo?: string;
    titulo: string;
    resumo: string;
    pontos: string[];
    recomendacao: string;
    veioDoCache?: boolean;
  }

  const [sinteseExecutivaIa, setSinteseExecutivaIa] = useState<RespostaSinteseIa | null>(null);
  const [gerandoSinteseIa, setGerandoSinteseIa] = useState(false);

  // Cache inteligente em memória para reutilização instantânea
  const cacheSinteseRef = useRef<Map<string, RespostaSinteseIa>>(new Map());
  const gerarSinteseComIaRef = useRef<((forcarNovo?: boolean, dadosDiretos?: RelatorioDados) => Promise<void>) | null>(null);

  // Modais
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState<RegistroTabela | null>(null);
  const [mostrarModalImpressao, setMostrarModalImpressao] = useState(false);
  const [modalImportarAberto, setModalImportarAberto] = useState(false);

  const dataInicioRef = useRef<HTMLInputElement>(null);
  const dataFimRef = useRef<HTMLInputElement>(null);

  const DADOS_RELATORIO_INICIAIS: RelatorioDados = {
    total: 0,
    pacientesUnicos: 0,
    mediaDiaria: 0,
    picoAtendimento: null,
    porStatus: {},
    porEspecialidade: [],
    porEscola: [],
    porProfissional: [],
    serie: {},
  };

  const [dados, setDados] = useState<RelatorioDados>(DADOS_RELATORIO_INICIAIS);
  const [dadosTabela, setDadosTabela] = useState<RegistroTabela[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const ocultarRelatorioPorAlteracaoFiltro = () => {
    setRelatorioGerado(false);
    setDados(DADOS_RELATORIO_INICIAIS);
    setDadosTabela([]);
    setSinteseExecutivaIa(null);
    setGerandoSinteseIa(false);
  };

  // Carregar escolas se vier vazio por prop
  useEffect(() => {
    if (escolas && escolas.length > 0) {
      setEscolasLocais(escolas);
    } else {
      let ativo = true;
      void requisicaoApi<{ dados: Array<{ id: string; nome: string }> }>('/escolas')
        .then((res) => {
          if (ativo && res?.dados) setEscolasLocais(res.dados);
        })
        .catch(() => {});
      return () => {
        ativo = false;
      };
    }
  }, [escolas]);

  // Carregar profissionais
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

  const aplicarPeriodo = (dias: number | 'mes' | 'tudo') => {
    const hojeStr = obterDataHojeBrasilia();
    const dataFinal = hojeStr;
    let dataInicial = '';

    if (dias === 'tudo') {
      dataInicial = '';
    } else if (dias === 'mes') {
      const partes = hojeStr.split('-');
      dataInicial = `${partes[0]}-${partes[1]}-01`;
    } else {
      const fim = new Date(`${hojeStr}T12:00:00-03:00`);
      const inicio = new Date(`${hojeStr}T12:00:00-03:00`);
      inicio.setDate(inicio.getDate() - (dias - 1));
      setDataInicio(inicio.toISOString().slice(0, 10));
      setDataFim(fim.toISOString().slice(0, 10));
      setPeriodoSelecionado(dias);
      ocultarRelatorioPorAlteracaoFiltro();
      return;
    }

    setDataInicio(dataInicial);
    setDataFim(dataFinal);
    setPeriodoSelecionado(dias);
    ocultarRelatorioPorAlteracaoFiltro();
  };

  const handleGerarRelatorio = () => {
    if (dataInicio && dataFim && dataInicio > dataFim) {
      setErro('A data inicial não pode ser posterior à data final.');
      return;
    }
    setErro(null);
    setSinteseExecutivaIa(null);
    setGerandoSinteseIa(true);
    setGatilhoExecucao((prev) => prev + 1);
  };

  // Requisição dos dados do relatório — executada estritamente sob demanda ao clicar em Gerar Relatório
  useEffect(() => {
    if (gatilhoExecucao === 0) return;

    const controlador = new AbortController();
    const carregarRelatorio = async () => {
      if (dataInicio && dataFim && dataInicio > dataFim) {
        setErro('A data inicial não pode ser posterior à data final.');
        return;
      }

      setCarregando(true);
      setErro(null);
      setSinteseExecutivaIa(null);
      setGerandoSinteseIa(true);

      const parametros = new URLSearchParams({ pagina: '1', porPagina: '100' });
      if (dataInicio) parametros.set('dataInicio', dataInicio);
      if (dataFim) parametros.set('dataFim', dataFim);
      if (escolaFiltro) parametros.set('escolaLocalId', escolaFiltro);
      if (especialidadeFiltro) parametros.set('especialidade', especialidadeFiltro);
      if (statusFiltro) parametros.set('status', statusFiltro);
      if (profissionalFiltro) parametros.set('usuarioId', profissionalFiltro);

      try {
        const [respostaRelatorio, respostaAtendimentos] = await Promise.all([
          requisicaoApi<RelatorioDados>(`/atendimentos/relatorio?${parametros.toString()}`),
          requisicaoApi<{ dados: AtendimentoRelatorio[] }>(`/atendimentos?${parametros.toString()}`),
        ]);

        if (controlador.signal.aborted) return;

        setDados({
          total: respostaRelatorio.total ?? 0,
          pacientesUnicos: respostaRelatorio.pacientesUnicos ?? 0,
          mediaDiaria: respostaRelatorio.mediaDiaria ?? 0,
          picoAtendimento: respostaRelatorio.picoAtendimento ?? null,
          porStatus: respostaRelatorio.porStatus ?? {},
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
            paciente: item.pacienteNome || 'Paciente Desconhecido',
            turma: item.pacienteTurma || 'Não informada',
            cpf: item.pacienteCpf || 'Não informado',
            especialidade: item.especialidade,
            profissional: item.profissional || 'Não informado',
            registroConselho: formatarConselhoERegistro(item.profissionalRegistro || undefined, item.profissionalConselho || undefined, item.especialidade as any) || 'Não informado',
            instituicao: item.escolaLocal || 'Não informado',
            status: item.status || StatusAtendimento.CONCLUIDO,
            resumo: item.resumo || 'Sem observações registradas',
            procedimentos: item.procedimentos || 'Procedimento padrão realizado',
          }))
        );

        setRelatorioGerado(true);

        // Disparo 100% AUTOMÁTICO da síntese executiva por IA com base nos dados filtrados
        if ((respostaRelatorio.total ?? 0) > 0) {
          void gerarSinteseComIaRef.current?.(false, respostaRelatorio);
        }
      } catch (erroApi) {
        if (!controlador.signal.aborted) {
          setDados(DADOS_RELATORIO_INICIAIS);
          setDadosTabela([]);
          setRelatorioGerado(false);
          setErro(erroApi instanceof Error ? erroApi.message : 'Não foi possível carregar o relatório.');
        }
      } finally {
        if (!controlador.signal.aborted) setCarregando(false);
      }
    };

    void carregarRelatorio();
    return () => controlador.abort();
  }, [gatilhoExecucao]);

  // Cálculos Derivados e Inteligência Analítica
  const totalGeral = dados.total || 0;

  const metricasEspecialidade = useMemo(() => {
    // Se houver filtro específico de especialidade, exibe somente ela
    if (especialidadeFiltro) {
      const encontrada = (dados.porEspecialidade || []).find(
        (item) => item.especialidade === especialidadeFiltro
      );
      const rotulo = ESPECIALIDADE_LABELS[especialidadeFiltro as Especialidade] ?? especialidadeFiltro;
      const total = encontrada?.total ?? 0;
      const pctTotal = totalGeral > 0 ? Math.round((total / totalGeral) * 100) : 0;

      return [
        {
          especialidadeChave: especialidadeFiltro,
          especialidade: rotulo,
          atendimentos: total,
          pctTotal,
        },
      ];
    }

    // Sem filtro de especialidade: exibe TODAS as especialidades cadastradas no sistema, mesmo com zero
    const mapaDados = new Map<string, { total: number }>();
    (dados.porEspecialidade || []).forEach((item) => {
      mapaDados.set(item.especialidade, item);
    });

    const todasEspecialidades = Object.keys(ESPECIALIDADE_LABELS) as Especialidade[];

    const lista = todasEspecialidades.map((chave) => {
      const item = mapaDados.get(chave);
      const rotulo = ESPECIALIDADE_LABELS[chave] ?? chave;
      const total = item?.total ?? 0;
      const pctTotal = totalGeral > 0 ? Math.round((total / totalGeral) * 100) : 0;

      return {
        especialidadeChave: chave,
        especialidade: rotulo,
        atendimentos: total,
        pctTotal,
      };
    });

    return lista.sort((a, b) => {
      if (b.atendimentos !== a.atendimentos) {
        return b.atendimentos - a.atendimentos;
      }
      return a.especialidade.localeCompare(b.especialidade);
    });
  }, [dados.porEspecialidade, especialidadeFiltro, totalGeral]);

  const listaStatusOperacional = useMemo(() => {
    // Se houver filtro específico de status, exibe apenas ele
    if (statusFiltro) {
      const rotulo = STATUS_ATENDIMENTO_LABELS[statusFiltro as StatusAtendimento] ?? statusFiltro;
      const qtd = dados.porStatus?.[statusFiltro] ?? 0;
      return [{ chave: statusFiltro, rotulo, qtd }];
    }

    // Sem filtro: exibe TODOS os status operacionais cadastrados, mesmo com zero
    return (Object.entries(STATUS_ATENDIMENTO_LABELS) as [StatusAtendimento, string][]).map(
      ([chave, rotulo]) => {
        const qtd = dados.porStatus?.[chave] ?? 0;
        return { chave, rotulo, qtd };
      }
    );
  }, [dados.porStatus, statusFiltro]);

  const rankingEscolas = useMemo(() => {
    // Se houver filtro específico de escola, exibe apenas a escola filtrada
    if (escolaFiltro) {
      const encontrada = (dados.porEscola || []).find((e) => e.id === escolaFiltro);
      const nomeEscola =
        encontrada?.nome ||
        escolasLocais.find((e) => e.id === escolaFiltro)?.nome ||
        'Unidade Escolar Selecionada';
      const total = encontrada?.total ?? 0;
      return [{ id: escolaFiltro, nome: nomeEscola, total }];
    }

    // Sem filtro de escola: exibe TODAS as escolas cadastradas em escolasLocais, mesmo com zero atendimentos
    const mapaEscolas = new Map<string, { id: string; nome: string; total: number }>();

    for (const esc of escolasLocais) {
      mapaEscolas.set(esc.id, { id: esc.id, nome: esc.nome, total: 0 });
    }

    for (const esc of dados.porEscola || []) {
      const existente = mapaEscolas.get(esc.id);
      if (existente) {
        existente.total = esc.total;
        if (esc.nome) existente.nome = esc.nome;
      } else {
        mapaEscolas.set(esc.id, { id: esc.id, nome: esc.nome, total: esc.total });
      }
    }

    const lista = Array.from(mapaEscolas.values());

    return lista.sort((a, b) => {
      if (b.total !== a.total) {
        return b.total - a.total;
      }
      return a.nome.localeCompare(b.nome);
    });
  }, [dados.porEscola, escolaFiltro, escolasLocais]);

  const rankingProfissionais = useMemo(() => {
    if (profissionalFiltro) {
      const encontrado = (dados.porProfissional || []).find((p) => p.id === profissionalFiltro);
      const nomeProf =
        encontrado?.nome ||
        profissionaisDisponiveis.find((p) => p.id === profissionalFiltro)?.nome ||
        'Profissional Selecionado';
      const total = encontrado?.total ?? 0;
      return [{ id: profissionalFiltro, nome: nomeProf, total }];
    }
    return dados.porProfissional || [];
  }, [dados.porProfissional, profissionalFiltro, profissionaisDisponiveis]);

  const linhaDoTempo = useMemo(() => {
    const entradas = Object.entries(dados.serie || {}).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
    return entradas.map(([data, valor]) => ({
      data,
      dataFormatada: formatarDataBrasileira(data),
      diaSemana: getDiaDaSemana(data),
      valor,
    }));
  }, [dados.serie]);

  const rankingEspecialidades = metricasEspecialidade;

  const maxBarraEsp = Math.max(...rankingEspecialidades.map((i) => i.atendimentos), 1);
  const maxProfissional = Math.max(...rankingProfissionais.map((i) => i.total), 1);
  const maxEscola = Math.max(...rankingEscolas.map((i) => i.total), 1);

  // Gráfico SVG com Suavização e Linha de Média
  const maxGrafico = Math.max(...linhaDoTempo.map((v) => v.valor), 5);
  const mediaGrafico = dados.mediaDiaria || (linhaDoTempo.length > 0 ? Math.round(totalGeral / linhaDoTempo.length) : 0);

  const dadosGrafico = useMemo(() => {
    if (!linhaDoTempo.length) return [];
    return linhaDoTempo.map((item, index) => {
      const divisor = Math.max(1, linhaDoTempo.length - 1);
      const x = 30 + (index / divisor) * 840;
      const y = 190 - (item.valor / maxGrafico) * 140;
      return {
        ...item,
        x,
        y,
        pct: totalGeral > 0 ? Math.round((item.valor / totalGeral) * 100) : 0,
      };
    });
  }, [linhaDoTempo, maxGrafico, totalGeral]);

  const yLinhaMedia = 190 - (mediaGrafico / maxGrafico) * 140;

  const picoGrafico = useMemo(() => {
    if (dados.picoAtendimento) return dados.picoAtendimento;
    if (!dadosGrafico.length) return null;
    const melhor = dadosGrafico.reduce(
      (melhorItem, item) => (item.valor > melhorItem.valor ? item : melhorItem),
      dadosGrafico[0]
    );
    return melhor && melhor.valor > 0 ? { data: melhor.data, total: melhor.valor } : null;
  }, [dadosGrafico, dados.picoAtendimento]);

  // Alertas Operacionais Inteligentes
  const alertasOperacionais = useMemo(() => {
    const alertas: Array<{ tipo: 'info' | 'alerta' | 'sucesso' | 'urgente'; titulo: string; texto: string }> = [];

    if (totalGeral === 0) {
      alertas.push({
        tipo: 'info',
        titulo: 'Sem ocorrências no período',
        texto: 'Nenhum atendimento atende aos filtros atuais. Ajuste o período ou selecione todas as especialidades.',
      });
      return alertas;
    }

    // 1. Concentração em Especialidade
    if (dados.porEspecialidade.length >= 2) {
      const top = dados.porEspecialidade[0];
      const seg = dados.porEspecialidade[1];
      const topPct = Math.round((top.total / totalGeral) * 100);
      const topNome = ESPECIALIDADE_LABELS[top.especialidade as Especialidade] ?? top.especialidade;
      const segNome = ESPECIALIDADE_LABELS[seg.especialidade as Especialidade] ?? seg.especialidade;

      if (topPct >= 40) {
        alertas.push({
          tipo: 'alerta',
          titulo: `Alta Concentração em ${topNome} (${topPct}%)`,
          texto: `A especialidade lidera a demanda com ${top.total} atendimentos, superando expressivamente ${segNome} (${seg.total}).`,
        });
      }
    }

    // 2. Pico de Demanda
    if (picoGrafico && mediaGrafico > 0 && picoGrafico.total >= mediaGrafico * 1.6) {
      alertas.push({
        tipo: 'alerta',
        titulo: 'Pico Operacional Acentuado',
        texto: `Em ${formatarDataBrasileira(picoGrafico.data)}, foram registrados ${picoGrafico.total} atendimentos (+${Math.round(((picoGrafico.total - mediaGrafico) / mediaGrafico) * 100)}% sobre a média diária).`,
      });
    }

    // 3. Unidade Polo com Maior Carga
    if (dados.porEscola.length > 1) {
      const topEscola = dados.porEscola[0];
      const topPct = Math.round((topEscola.total / totalGeral) * 100);
      if (topPct >= 45) {
        alertas.push({
          tipo: 'info',
          titulo: 'Polo de Alta Demanda',
          texto: `A unidade "${topEscola.nome}" concentrou ${topPct}% do esforço de atendimento do período selecionado.`,
        });
      }
    }

    return alertas;
  }, [totalGeral, dados.porEspecialidade, dados.porEscola, picoGrafico, mediaGrafico]);

  // Síntese Executiva estritamente por Inteligência Artificial (zero texto fixo/hardcoded prévio)
  const sinteseExecutiva = sinteseExecutivaIa;

  const gerarSinteseComIa = async (forcarNovo = false, dadosDiretos?: RelatorioDados) => {
    const dadosBase = dadosDiretos ?? dados;
    const totalEfetivo = dadosDiretos ? dadosDiretos.total : totalGeral;
    if (totalEfetivo === 0) {
      setGerandoSinteseIa(false);
      return;
    }

    // Chave de cache baseada nas dimensões quantitativas e filtros
    const chaveCache = `${dataInicio}_${dataFim}_${escolaFiltro || 'todas'}_${especialidadeFiltro || 'todas'}_${profissionalFiltro || 'todos'}_${totalEfetivo}_${dadosBase.pacientesUnicos ?? 0}`;

    // Reutilização instantânea de cache se não foi solicitada regeneração forçada
    if (!forcarNovo && cacheSinteseRef.current.has(chaveCache)) {
      const itemCache = cacheSinteseRef.current.get(chaveCache)!;
      const itemComFlag = { ...itemCache, veioDoCache: true };
      setSinteseExecutivaIa(itemComFlag);
      setGerandoSinteseIa(false);
      return;
    }

    setGerandoSinteseIa(true);
    setSinteseExecutivaIa(null);
    try {
      const nomeEscolaFiltro = escolaFiltro
        ? (escolasLocais.find((e) => e.id === escolaFiltro)?.nome || 'Unidade selecionada')
        : undefined;
      const nomeEspecialidadeFiltro = especialidadeFiltro
        ? (ESPECIALIDADE_LABELS[especialidadeFiltro as Especialidade] ?? especialidadeFiltro)
        : undefined;
      const nomeProfissionalFiltro = profissionalFiltro
        ? (profissionaisDisponiveis.find((p) => p.id === profissionalFiltro)?.nome || 'Profissional selecionado')
        : undefined;
      const nomeStatusFiltro = statusFiltro
        ? (STATUS_ATENDIMENTO_LABELS[statusFiltro as StatusAtendimento] ?? statusFiltro)
        : undefined;

      const payload = {
        totalGeral: totalEfetivo,
        estudantesUnicos: dadosBase.pacientesUnicos ?? totalEfetivo,
        mediaDiaria: dadosBase.mediaDiaria ?? 0,
        pico: dadosBase.picoAtendimento ?? (picoGrafico ? { data: picoGrafico.data, total: picoGrafico.total } : null),
        dataInicio,
        dataFim,
        porEspecialidade: (dadosBase.porEspecialidade || []).map((e) => ({
          especialidade: ESPECIALIDADE_LABELS[e.especialidade as Especialidade] ?? e.especialidade,
          total: e.total,
          pct: totalEfetivo > 0 ? Math.round((e.total / totalEfetivo) * 100) : 0,
        })),
        porEscola: (dadosBase.porEscola || []).map((e) => ({
          nome: e.nome,
          total: e.total,
        })),
        porProfissional: (dadosBase.porProfissional || []).map((p) => ({
          nome: p.nome,
          total: p.total,
        })),
        porStatus: dadosBase.porStatus ?? {},
        filtrosAtivos: {
          escola: nomeEscolaFiltro,
          especialidade: nomeEspecialidadeFiltro,
          profissional: nomeProfissionalFiltro,
          status: nomeStatusFiltro,
          periodo: dataInicio && dataFim ? `${dataInicio} a ${dataFim}` : undefined,
        },
      };

      const res = await requisicaoApi<RespostaSinteseIa>('/atendimentos/relatorio/sintese-ia', {
        metodo: 'POST',
        corpo: payload,
      });

      if (res && res.resumo && Array.isArray(res.pontos)) {
        const itemPronto = { ...res, veioDoCache: false };
        cacheSinteseRef.current.set(chaveCache, itemPronto);
        setSinteseExecutivaIa(itemPronto);
      }
    } catch (err) {
      console.warn('Falha ao gerar síntese via Workers AI:', err);
    } finally {
      setGerandoSinteseIa(false);
    }
  };
  gerarSinteseComIaRef.current = gerarSinteseComIa;

  // Configuração das Colunas da Tabela com Filtro Excel
  const colunasTabela = useMemo<ConfiguracaoColuna<RegistroTabela>[]>(
    () => [
      { id: 'data', rotulo: 'Data / Hora', tipo: 'texto', obterValor: (item) => item.data },
      { id: 'paciente', rotulo: 'Paciente / Aluno', tipo: 'texto', obterValor: (item) => item.paciente },
      { id: 'cpf', rotulo: 'CPF Mascarado', tipo: 'texto', obterValor: (item) => item.cpf },
      { id: 'especialidade', rotulo: 'Especialidade', tipo: 'texto', obterValor: (item) => ESPECIALIDADE_LABELS[item.especialidade as Especialidade] ?? item.especialidade },
      { id: 'profissional', rotulo: 'Profissional', tipo: 'texto', obterValor: (item) => item.profissional },
      { id: 'instituicao', rotulo: 'Unidade Escolar', tipo: 'texto', obterValor: (item) => item.instituicao },
      { id: 'status', rotulo: 'Situação', tipo: 'texto', obterValor: (item) => STATUS_ATENDIMENTO_LABELS[item.status as StatusAtendimento] ?? item.status },
    ],
    []
  );

  const filtroExcel = useFiltroExcel<RegistroTabela>({
    dados: dadosTabela,
    colunas: colunasTabela,
    buscaGeral: buscaTabela,
    funcaoBuscaGeral: (item, termo) =>
      [item.data, item.paciente, item.turma, item.cpf, item.especialidade, item.profissional, item.instituicao, item.status]
        .some((valor) => valor.toLowerCase().includes(termo)),
  });

  const dadosTabelaFiltrados = filtroExcel.dadosFiltrados;

  const handleMovimentoPonto = (evento: React.MouseEvent<SVGCircleElement>, index: number) => {
    const alvo = evento.currentTarget;
    const retangulo = alvo.ownerSVGElement?.getBoundingClientRect();
    if (!retangulo) return;

    const x = evento.clientX - retangulo.left;
    const y = evento.clientY - retangulo.top;

    setIndicePontoAtivo(index);
    setTooltipPosicao({ x: x + 12, y: y - 12 });
  };

  // Exportação em Excel: Página 1 = Dashboard Completo, Página 2 = Dados Brutos
  const handleExportarPlanilha = async () => {
    if (dataInicio && dataFim && dataInicio > dataFim) {
      setErro('A data inicial não pode ser posterior à data final.');
      return;
    }

    setExportando(true);
    setErro(null);

    try {
      const parametrosBase = new URLSearchParams({ pagina: '1', porPagina: '100' });
      if (dataInicio) parametrosBase.set('dataInicio', dataInicio);
      if (dataFim) parametrosBase.set('dataFim', dataFim);
      if (escolaFiltro) parametrosBase.set('escolaLocalId', escolaFiltro);
      if (especialidadeFiltro) parametrosBase.set('especialidade', especialidadeFiltro);
      if (statusFiltro) parametrosBase.set('status', statusFiltro);
      if (profissionalFiltro) parametrosBase.set('usuarioId', profissionalFiltro);

      const primeiraPagina = await requisicaoApi<{
        dados: AtendimentoRelatorio[];
        total: number;
        totalPaginas: number;
      }>(`/atendimentos?${parametrosBase.toString()}`);

      let atendimentos = primeiraPagina.dados ?? [];
      const totalPaginas = primeiraPagina.totalPaginas ?? 1;

      if (totalPaginas > 1) {
        const paginasRestantes = Array.from(
          { length: totalPaginas - 1 },
          (_, indice) => indice + 2,
        );
        const respostasRestantes = await Promise.all(
          paginasRestantes.map((pagina) => {
            const parametros = new URLSearchParams(parametrosBase);
            parametros.set('pagina', String(pagina));
            return requisicaoApi<{ dados: AtendimentoRelatorio[] }>(`/atendimentos?${parametros.toString()}`);
          }),
        );
        atendimentos = [
          ...atendimentos,
          ...respostasRestantes.flatMap((r) => r.dados ?? []),
        ];
      }

      const filtrosTexto = [
        escolaFiltro ? `Escola: ${escolasLocais.find((e) => e.id === escolaFiltro)?.nome ?? escolaFiltro}` : null,
        especialidadeFiltro ? `Especialidade: ${ESPECIALIDADE_LABELS[especialidadeFiltro as Especialidade] ?? especialidadeFiltro}` : null,
        statusFiltro ? `Situação: ${STATUS_ATENDIMENTO_LABELS[statusFiltro as StatusAtendimento] ?? statusFiltro}` : null,
        profissionalFiltro ? `Profissional: ${profissionaisDisponiveis.find((p) => p.id === profissionalFiltro)?.nome ?? profissionalFiltro}` : null,
      ].filter(Boolean).join(' | ') || 'Nenhum filtro aplicado (Todos os dados)';

      // ─── PÁGINA 1: DASHBOARD EXECUTIVO (ANÁLISE COMPLETA) ─────
      const linhasDashboard: (string | number)[][] = [
        ['PROGRAMA SAÚDE NA ESCOLA (SEM) — SECRETARIA MUNICIPAL DE EDUCAÇÃO E SAÚDE'],
        ['DASHBOARD EXECUTIVO DE INTELIGÊNCIA OPERACIONAL E CLÍNICA'],
        [
          'Período Analisado:',
          `${dataInicio ? formatarDataBrasileira(dataInicio) : 'Início'} a ${dataFim ? formatarDataBrasileira(dataFim) : 'Atual'}`,
          '',
          'Data de Emissão:',
          new Date().toLocaleString('pt-BR'),
        ],
        ['Filtros Aplicados:', filtrosTexto],
        [],
        ['=== 1. INDICADORES-CHAVE DE GESTÃO (KPIs) ==='],
        [
          'Total de Atendimentos',
          'Alunos Únicos Atendidos',
          'Média Diária de Atendimentos',
          'Pico Operacional (Data)',
        ],
        [
          primeiraPagina.total ?? atendimentos.length,
          dados.pacientesUnicos ?? atendimentos.length,
          dados.mediaDiaria ?? 0,
          picoGrafico ? `${picoGrafico.total} (${formatarDataBrasileira(picoGrafico.data)})` : 'N/A',
        ],
        ...(sinteseExecutiva
          ? [
              ['=== 2. PARECER EXECUTIVO E DIRETRIZES DA GESTÃO ==='],
              ['Resumo do Período:', sinteseExecutiva.resumo],
              ['Diretriz da Coordenação:', sinteseExecutiva.recomendacao],
              ...sinteseExecutiva.pontos.map((ponto, i) => [`Destaque Estratégico ${i + 1}:`, ponto]),
              [],
            ]
          : []),
        ['=== 3. DISTRIBUIÇÃO ANALÍTICA POR ESPECIALIDADE ==='],
        [
          'Especialidade',
          'Total de Consultas',
          'Participação no Volume Geral (%)',
        ],
        ...(metricasEspecialidade.length > 0
          ? metricasEspecialidade.map((item) => [
              item.especialidade,
              item.atendimentos,
              `${item.pctTotal}%`,
            ])
          : [['Todas as Especialidades', 0, '0%']]),
        [],
        ['=== 4. SITUAÇÃO OPERACIONAL DOS ATENDIMENTOS ==='],
        ['Situação / Status', 'Quantidade de Atendimentos', 'Participação no Total (%)'],
        ...listaStatusOperacional.map(({ rotulo, qtd }) => [
          rotulo,
          qtd,
          totalGeral > 0 ? `${Math.round((qtd / totalGeral) * 100)}%` : '0%',
        ]),
        [],
        ['=== 5. PRODUTIVIDADE POR UNIDADE ESCOLAR ==='],
        ['Unidade Escolar', 'Total de Atendimentos', 'Participação no Total (%)'],
        ...(rankingEscolas.length > 0
          ? rankingEscolas.map((escola) => [
              escola.nome,
              escola.total,
              totalGeral > 0 ? `${Math.round((escola.total / totalGeral) * 100)}%` : '0%',
            ])
          : [['Nenhuma unidade com atendimentos registrados', 0, '0%']]),
        [],
        ['=== 6. PRODUTIVIDADE POR PROFISSIONAL DE SAÚDE ==='],
        ['Profissional', 'Total de Atendimentos', 'Participação no Total (%)'],
        ...(rankingProfissionais.length > 0
          ? rankingProfissionais.map((prof) => [
              prof.nome,
              prof.total,
              totalGeral > 0 ? `${Math.round((prof.total / totalGeral) * 100)}%` : '0%',
            ])
          : [['Nenhum profissional com atendimentos registrados', 0, '0%']]),
        [],
        ['=== 7. ALERTAS E OBSERVAÇÕES OPERACIONAIS ==='],
        ['Categoria / Tipo', 'Título do Alerta', 'Detalhamento Técnico'],
        ...alertasOperacionais.map((alerta) => [
          alerta.tipo.toUpperCase(),
          alerta.titulo,
          alerta.texto,
        ]),
      ];

      // ─── PÁGINA 2: DADOS BRUTOS DOS ATENDIMENTOS ─────
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

      const linhasDadosBrutosMatriz: (string | number)[][] = [
        cabecalhosDadosBrutos,
      ];

      if (atendimentos.length > 0) {
        atendimentos.forEach((item) => {
          linhasDadosBrutosMatriz.push([
            item.id,
            item.criadoEm ? new Date(item.criadoEm).toLocaleString('pt-BR') : 'Não informado',
            item.pacienteNome || 'Não informado',
            item.pacienteCpf || 'Não informado',
            item.pacienteTurma || 'Não informada',
            ESPECIALIDADE_LABELS[item.especialidade as Especialidade] ?? item.especialidade ?? 'Não informada',
            item.status ? STATUS_ATENDIMENTO_LABELS[item.status as StatusAtendimento] ?? item.status : 'Concluído',
            item.profissional || 'Não informado',
            item.escolaLocal || 'Não informado',
          ]);
        });
      } else {
        linhasDadosBrutosMatriz.push([
          'Nenhum atendimento registrado no banco de dados para os filtros selecionados.',
          '-',
          '-',
          '-',
          '-',
          '-',
          '-',
          '-',
          '-',
        ]);
      }

      const planilha = utils.book_new();
      const abaDashboard = utils.aoa_to_sheet(linhasDashboard);
      const abaDadosBrutos = utils.aoa_to_sheet(linhasDadosBrutosMatriz);

      abaDashboard['!cols'] = [
        { wch: 38 },
        { wch: 28 },
        { wch: 30 },
        { wch: 28 },
        { wch: 32 },
        { wch: 20 },
        { wch: 26 },
      ];

      abaDadosBrutos['!cols'] = [
        { wch: 38 }, // ID do Atendimento
        { wch: 20 }, // Data e Hora
        { wch: 30 }, // Aluno / Paciente
        { wch: 18 }, // CPF (Mascarado)
        { wch: 16 }, // Turma
        { wch: 22 }, // Especialidade
        { wch: 18 }, // Situação / Status
        { wch: 28 }, // Profissional de Saúde
        { wch: 32 }, // Unidade Escolar
      ];

      abaDadosBrutos['!autofilter'] = {
        ref: `A1:I${Math.max(2, linhasDadosBrutosMatriz.length)}`,
      };

      // Página 1: Análise Completa como Dashboard
      // Página 2: Dados Brutos
      utils.book_append_sheet(planilha, abaDashboard, 'Dashboard');
      utils.book_append_sheet(planilha, abaDadosBrutos, 'Dados Brutos');

      writeFile(planilha, `relatorio_saude_itinerante_${dataInicio || 'inicio'}_${dataFim || 'fim'}.xlsx`);
    } catch (erroApi) {
      setErro(erroApi instanceof Error ? erroApi.message : 'Não foi possível gerar a planilha.');
    } finally {
      setExportando(false);
    }
  };

  const paletaEspecialidade = (especialidadeChave: string) => {
    switch (especialidadeChave?.toUpperCase()) {
      case 'AUDIOMETRIA':
        return { icone: Ear, corBarra: '#3b82f6', bgIcone: 'bg-blue-100 text-blue-700' };
      case 'NUTRICAO':
        return { icone: Apple, corBarra: '#22c55e', bgIcone: 'bg-green-100 text-green-700' };
      case 'PSICOLOGIA':
        return { icone: Brain, corBarra: '#6366f1', bgIcone: 'bg-indigo-100 text-indigo-700' };
      case 'ODONTOLOGIA':
        return { icone: Smile, corBarra: '#f43f5e', bgIcone: 'bg-rose-100 text-rose-700' };
      case 'OFTALMOLOGIA':
      case 'OTALMOLOGIA':
        return { icone: Eye, corBarra: '#14b8a6', bgIcone: 'bg-teal-100 text-teal-700' };
      default:
        return { icone: Sparkles, corBarra: '#64748b', bgIcone: 'bg-slate-100 text-slate-700' };
    }
  };

  return (
    <div className="flex flex-col flex-1 animate-fade-in font-sans pb-12">
      {/* ─── Cabeçalho Fixo Modular ───── */}
      <CabecalhoPagina
        titulo="Relatórios"
        subtitulo="CENTRAL DE INTELIGÊNCIA OPERACIONAL, EPIDEMIOLÓGICA E GESTÃO CLÍNICA"
        acoesExtras={
          <div className="flex flex-col gap-2.5 w-full min-w-0">
            {/* Linha 1: De | Até | Status | Unidade | Especialidade | Profissional */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[140px_140px_1fr_1.6fr_1.3fr_1.5fr] items-center gap-2 w-full min-w-0">
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
                    {dataInicio ? formatarDataBrasileira(dataInicio) : 'dd/mm/aaaa'}
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
                    ocultarRelatorioPorAlteracaoFiltro();
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
                    {dataFim ? formatarDataBrasileira(dataFim) : 'dd/mm/aaaa'}
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
                    ocultarRelatorioPorAlteracaoFiltro();
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
                    ocultarRelatorioPorAlteracaoFiltro();
                  }}
                  placeholder="Todos os status"
                  tamanho="sm"
                  fundoBranco
                  pesquisavel={false}
                />
              </div>

              {/* Instituição / Escola */}
              <div className="w-full min-w-0">
                <SeletorFiltroUniversal
                  categoria="instituicoes"
                  valor={escolaFiltro}
                  aoMudar={(val) => {
                    setEscolaFiltro(val);
                    ocultarRelatorioPorAlteracaoFiltro();
                  }}
                  placeholder="Todas as instituições"
                  tamanho="sm"
                  fundoBranco
                  opcoes={escolasLocais.map((item) => ({
                    id: item.id,
                    valor: item.id,
                    nome: item.nome,
                    rotulo: item.nome,
                  }))}
                />
              </div>

              {/* Especialidade */}
              <div className="w-full min-w-0">
                <SeletorFiltroUniversal
                  categoria="especialidades"
                  valor={especialidadeFiltro}
                  aoMudar={(val) => {
                    setEspecialidadeFiltro(val);
                    ocultarRelatorioPorAlteracaoFiltro();
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
                    ocultarRelatorioPorAlteracaoFiltro();
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

            {/* Linha 2: Botões Rápidos de Período + Limpar + Ações */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">Período:</span>
                {[
                  { id: 7, label: '7 dias' },
                  { id: 15, label: '15 dias' },
                  { id: 30, label: '30 dias' },
                  { id: 'mes', label: 'Este mês' },
                  { id: 'tudo', label: 'Tudo' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => aplicarPeriodo(item.id as any)}
                    className={`h-8 rounded-xl border px-3 text-[11px] font-bold transition-colors cursor-pointer ${
                      periodoSelecionado === item.id
                        ? 'border-blue-300 bg-blue-50 text-blue-700 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Botao
                  variante="secundario"
                  tamanho="sm"
                  formato="pilula"
                  onClick={() => {
                    setBuscaTabela('');
                    setStatusFiltro('');
                    setEscolaFiltro('');
                    setEspecialidadeFiltro('');
                    setProfissionalFiltro('');
                    setDataInicio('');
                    setDataFim('');
                    setPeriodoSelecionado(null);
                    ocultarRelatorioPorAlteracaoFiltro();
                    setErro(null);
                  }}
                  icone={<RotateCcw className="h-3.5 w-3.5" />}
                  className="text-slate-600 hover:text-rose-700 hover:bg-rose-50 border-slate-200"
                >
                  Limpar
                </Botao>

                <Botao
                  variante="secundario"
                  tamanho="sm"
                  formato="pilula"
                  onClick={() => setModalImportarAberto(true)}
                  icone={<FileSpreadsheet className="h-4 w-4 text-blue-600" />}
                  className="border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100/70"
                >
                  Importar Planilha
                </Botao>

                <Botao
                  variante="primario"
                  tamanho="sm"
                  formato="pilula"
                  onClick={handleGerarRelatorio}
                  carregando={carregando}
                  textoCarregando="Gerando..."
                  icone={<FileBarChart2 className="h-4 w-4" />}
                >
                  {relatorioGerado ? 'Atualizar Dados' : 'Gerar Relatório'}
                </Botao>
              </div>
            </div>
          </div>
        }
        fixo={false}
      />

      {/* ─── Feedback de Erro ───── */}
      {erro && (
        <div className="my-4 mx-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 text-red-600 shrink-0" />
            <span>{erro}</span>
          </div>
          <button type="button" onClick={() => setErro(null)} className="text-red-500 hover:text-red-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ─── Estado de Carregamento ───── */}
      {carregando && (
        <div className="mt-4 flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 animate-spin">
            <LoaderCircle className="h-8 w-8" />
          </div>
          <div>
            <p className="text-base font-extrabold text-slate-800">Gerando Relatório Oficial...</p>
            <p className="mt-1 text-xs text-slate-400">Consolidando dados clínicos e epidemiológicos da rede municipal</p>
          </div>
        </div>
      )}

      {/* ─── Placeholder: relatório não gerado ou filtros alterados ───── */}
      {!relatorioGerado && !carregando && (
        <div className="mt-4 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600">
            <FileBarChart2 className="h-8 w-8" />
          </div>
          <div>
            <p className="text-base font-extrabold text-slate-700">Relatório oculto</p>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              {gatilhoExecucao > 0
                ? 'Os filtros foram alterados. Para visualizar os dados atualizados, clique novamente em Gerar Relatório.'
                : 'Defina os filtros desejados acima e clique em Gerar Relatório para iniciar a consolidação dos dados.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleGerarRelatorio}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <FileBarChart2 className="h-4 w-4" />
            Gerar Relatório
          </button>
        </div>
      )}

      {/* ─── Painel do Relatório: só visível após clicar em Gerar ───── */}
      {relatorioGerado && !carregando && (
        <>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        {/* Cabeçalho Minimalista e Ações */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                Saúde em Movimento • Ações nas Escolas
              </span>
              {gerandoSinteseIa ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 animate-pulse">
                  <Sparkles className="h-3 w-3 animate-spin text-blue-600" />
                  Elaborando com IA...
                </span>
              ) : sinteseExecutiva?.veioDoCache ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  <Zap className="h-3 w-3 text-slate-500" />
                  Cache Local
                </span>
              ) : sinteseExecutiva?.origem === 'CLOUDFLARE_WORKERS_AI' ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <Sparkles className="h-3 w-3 text-emerald-600" />
                  Workers AI • Llama 3
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  Resumo Oficial
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <h3 className="text-base font-extrabold tracking-tight text-slate-800">
                {sinteseExecutiva?.titulo || 'Resumo das Ações de Saúde nas Escolas'}
              </h3>
              <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                <Calendar className="h-3 w-3" />
                {dataInicio ? formatarDataBrasileira(dataInicio) : 'Início'} — {dataFim ? formatarDataBrasileira(dataFim) : 'Atual'}
              </span>
            </div>
          </div>

          {/* Ações Minimalistas */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleExportarPlanilha()}
              disabled={exportando}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {exportando ? <LoaderCircle className="h-3.5 w-3.5 animate-spin text-blue-600" /> : <Download className="h-3.5 w-3.5 text-blue-600" />}
              <span>Planilha Excel</span>
            </button>
          </div>
        </div>

        {/* Estado de Carregamento da IA — ZERO texto hardcoded exibido */}
        {gerandoSinteseIa || !sinteseExecutiva ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-center animate-fade-in">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 animate-spin border border-blue-100">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Elaborando resumo com Inteligência Artificial...</p>
              <p className="text-xs text-slate-400 mt-0.5">Organizando dados das escolas atendidas, consultas e especialidades do projeto</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* Texto Editorial do Parecer (Gerado pela IA) */}
            <div className="text-[13px] md:text-[13.5px] leading-relaxed text-slate-600 font-normal whitespace-pre-line space-y-3">
              {sinteseExecutiva.resumo}
            </div>

            {/* Destaques Analíticos em Cards Minimalistas Suaves */}
            {sinteseExecutiva.pontos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {sinteseExecutiva.pontos.map((ponto, i) => {
                  const partes = ponto.split(': ');
                  const tituloPonto = partes.length > 1 ? partes[0] : `Destaque ${i + 1}`;
                  const descricaoPonto = partes.length > 1 ? partes.slice(1).join(': ') : ponto;

                  return (
                    <div
                      key={i}
                      className="flex flex-col justify-between rounded-xl border border-slate-150 bg-slate-50/60 p-3.5 hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 mb-1">
                          {tituloPonto}
                        </div>
                        <p className="text-[11.5px] font-medium leading-relaxed text-slate-700">
                          {descricaoPonto}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* Rodapé LGPD & Governança Discreto */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[10.5px] text-slate-400 font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>
            Conformidade LGPD & Governança em Saúde: Parecer consolidado estritamente com base em indicadores quantitativos agregados, sem processamento de dados identificáveis de estudantes.
          </span>
        </div>

        {/* ─── Alertas Operacionais Inteligentes ───── */}
        {alertasOperacionais.length > 0 && (
          <div className="border-t border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600">
              <TriangleAlert className="h-4 w-4 text-amber-500" />
              Alertas e Observações Operacionais ({alertasOperacionais.length})
            </div>

            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
              {alertasOperacionais.map((alerta, index) => {
                let borda = 'border-blue-200 bg-blue-50/70 text-blue-900';
                if (alerta.tipo === 'alerta') borda = 'border-amber-200 bg-amber-50/80 text-amber-900';
                if (alerta.tipo === 'urgente') borda = 'border-rose-200 bg-rose-50/80 text-rose-900';
                if (alerta.tipo === 'sucesso') borda = 'border-emerald-200 bg-emerald-50/80 text-emerald-900';

                return (
                  <div key={index} className={`rounded-xl border p-3.5 shadow-2xs ${borda}`}>
                    <div className="text-[11px] font-bold tracking-tight">{alerta.titulo}</div>
                    <div className="mt-1 text-[11px] leading-relaxed opacity-90">{alerta.texto}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── Gráfico Interativo de Tendência e Picos (SVG) ───── */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Curva de Produção Diária</div>
            <div className="text-xs text-slate-400 font-medium">Evolução do volume de consultas realizadas ao longo do período selecionado</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <span className="h-2 w-5 rounded bg-[#0d4d7a]" />
              Atendimentos
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <span className="h-0.5 w-5 border-t border-dashed border-amber-500" />
              Média ({mediaGrafico})
            </div>
            {picoGrafico && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
                Pico: {formatarDataBrasileira(picoGrafico.data)} ({picoGrafico.total})
              </div>
            )}
          </div>
        </div>

        {dadosGrafico.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-xl bg-slate-50 text-xs font-semibold text-slate-400">
            Nenhum dado temporal registrado para este intervalo.
          </div>
        ) : (
          <div className="relative h-[220px] w-full overflow-hidden rounded-xl bg-gradient-to-b from-slate-50/50 to-white">
            <svg viewBox="0 0 900 220" className="h-[220px] w-full overflow-visible">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d4d7a" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#0d4d7a" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Linhas de Grade */}
              {[0, 1, 2, 3, 4].map((linha) => (
                <line
                  key={linha}
                  x1="30"
                  x2="870"
                  y1={30 + linha * 38}
                  y2={30 + linha * 38}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
              ))}

              {/* Linha Tracejada de Média */}
              {mediaGrafico > 0 && (
                <line
                  x1="30"
                  x2="870"
                  y1={yLinhaMedia}
                  y2={yLinhaMedia}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />
              )}

              {/* Área Sombreada */}
              {dadosGrafico.length > 1 && (
                <polygon
                  fill="url(#areaGradient)"
                  points={`30,190 ${dadosGrafico.map((i) => `${i.x},${i.y}`).join(' ')} ${dadosGrafico[dadosGrafico.length - 1].x},190`}
                />
              )}

              {/* Linha Principal da Curva */}
              <polyline
                fill="none"
                stroke="#0d4d7a"
                strokeWidth="2.8"
                points={dadosGrafico.map((item) => `${item.x},${item.y}`).join(' ')}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Marcadores Interativos */}
              {dadosGrafico.map((item, index) => {
                const ativo = indicePontoAtivo === index;
                return (
                  <g key={`${item.data}-${index}`}>
                    <circle
                      cx={item.x}
                      cy={item.y}
                      r={ativo ? 7 : 4.5}
                      fill={ativo ? '#0d4d7a' : '#ffffff'}
                      stroke="#0d4d7a"
                      strokeWidth={ativo ? 2.5 : 2}
                      className="cursor-pointer transition-all"
                      onMouseEnter={(evento) => handleMovimentoPonto(evento, index)}
                      onMouseLeave={() => {
                        setIndicePontoAtivo(null);
                        setTooltipPosicao(null);
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Tooltip Dinâmico ao passar mouse */}
            {indicePontoAtivo !== null && dadosGrafico[indicePontoAtivo] && tooltipPosicao && (
              <div
                className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full rounded-xl border border-slate-200 bg-white/98 px-3.5 py-2 text-center shadow-lg"
                style={{
                  left: `${tooltipPosicao.x}px`,
                  top: `${tooltipPosicao.y}px`,
                }}
              >
                <div className="text-[11px] font-bold text-slate-800">
                  {dadosGrafico[indicePontoAtivo].dataFormatada} ({dadosGrafico[indicePontoAtivo].diaSemana})
                </div>
                <div className="text-[12px] font-extrabold text-blue-700">
                  {dadosGrafico[indicePontoAtivo].valor} atendimentos
                </div>
                <div className="text-[10px] font-semibold text-slate-400">
                  {dadosGrafico[indicePontoAtivo].pct}% do período
                </div>
              </div>
            )}

            {/* Eixo X com datas resumidas */}
            <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-400 px-3">
              {linhaDoTempo.length <= 10 ? (
                linhaDoTempo.map((item) => <span key={item.data}>{item.dataFormatada}</span>)
              ) : (
                <>
                  <span>{linhaDoTempo[0]?.dataFormatada}</span>
                  <span>{linhaDoTempo[Math.floor(linhaDoTempo.length / 2)]?.dataFormatada}</span>
                  <span>{linhaDoTempo[linhaDoTempo.length - 1]?.dataFormatada}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Cards Analíticos Padronizados (Grid 2x2 Simétrico e Inteligente) ───── */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Especialidades */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Distribuição por Especialidade
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">Demanda clínica consolidada</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/60">
                {especialidadeFiltro ? '1 filtrada' : `${rankingEspecialidades.length} especialidades`}
              </span>
            </div>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {rankingEspecialidades.map((item) => {
                const paleta = paletaEspecialidade(item.especialidadeChave);
                const Icone = paleta.icone;
                return (
                  <div key={item.especialidadeChave} className="group rounded-xl p-2 hover:bg-slate-50/80 transition-colors">
                    <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full shrink-0 ${paleta.bgIcone}`}>
                          <Icone className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-semibold text-slate-800 text-xs truncate">{item.especialidade}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-400 font-medium">({item.pctTotal}%)</span>
                        <span className="inline-flex min-w-[24px] items-center justify-center rounded-lg bg-white px-2 py-0.5 text-xs font-black text-slate-800 shadow-2xs border border-slate-200/60 tabular-nums">
                          {item.atendimentos}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${maxBarraEsp > 0 ? (item.atendimentos / maxBarraEsp) * 100 : 0}%`,
                          backgroundColor: paleta.corBarra,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Status Operacional */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/80">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Status Operacional
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">Fluxo e ciclo assistencial</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/60">
                {statusFiltro ? '1 filtrado' : `${listaStatusOperacional.length} etapas`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {listaStatusOperacional.map(({ chave, rotulo, qtd }) => {
                const estilo = obterEstiloStatusAtendimento(chave);
                const pctStatus = totalGeral > 0 ? Math.round((qtd / totalGeral) * 100) : 0;
                return (
                  <div
                    key={chave}
                    className="flex items-center justify-between rounded-xl bg-slate-50/70 p-2.5 border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${estilo.ponto}`} />
                      <span className="text-xs font-semibold text-slate-700 truncate" title={rotulo}>
                        {rotulo}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {totalGeral > 0 && qtd > 0 && (
                        <span className="text-[10px] font-medium text-slate-400">({pctStatus}%)</span>
                      )}
                      <span className="inline-flex min-w-[24px] items-center justify-center rounded-lg bg-white px-2 py-0.5 text-xs font-black text-slate-800 shadow-2xs border border-slate-200/60 tabular-nums">
                        {qtd}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Produtividade por Unidade Escolar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100/80">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Por Unidade Escolar
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">Distribuição por polo assistencial</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/60">
                {escolaFiltro ? '1 filtrada' : `${rankingEscolas.length} unidades`}
              </span>
            </div>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {rankingEscolas.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">Nenhuma escola com atendimentos.</div>
              ) : (
                rankingEscolas.map((item) => {
                  const pctEscola = totalGeral > 0 ? Math.round((item.total / totalGeral) * 100) : 0;
                  return (
                    <div key={item.id} className="group rounded-xl p-2 hover:bg-slate-50/80 transition-colors">
                      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full shrink-0 bg-sky-100/70 text-sky-700">
                            <Building2 className="h-3.5 w-3.5" />
                          </span>
                          <span className="font-semibold text-slate-800 text-xs truncate" title={item.nome}>
                            {item.nome}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {totalGeral > 0 && item.total > 0 && (
                            <span className="text-[10px] text-slate-400 font-medium">({pctEscola}%)</span>
                          )}
                          <span className="inline-flex min-w-[24px] items-center justify-center rounded-lg bg-white px-2 py-0.5 text-xs font-black text-slate-800 shadow-2xs border border-slate-200/60 tabular-nums">
                            {item.total}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#0d4d7a] transition-all duration-500"
                          style={{ width: `${maxEscola > 0 ? (item.total / maxEscola) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 4. Produtividade por Profissional */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100/80">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Por Profissional
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">Produção clínica assistencial</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/60">
                {profissionalFiltro ? '1 filtrado' : `${rankingProfissionais.length} profissionais`}
              </span>
            </div>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {rankingProfissionais.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">Nenhum profissional com atendimentos.</div>
              ) : (
                rankingProfissionais.map((item) => {
                  const pctProf = totalGeral > 0 ? Math.round((item.total / totalGeral) * 100) : 0;
                  return (
                    <div key={item.id} className="group rounded-xl p-2 hover:bg-slate-50/80 transition-colors">
                      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full shrink-0 bg-purple-100/70 text-purple-700">
                            <Users className="h-3.5 w-3.5" />
                          </span>
                          <span className="font-semibold text-slate-800 text-xs truncate" title={item.nome}>
                            {item.nome}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {totalGeral > 0 && item.total > 0 && (
                            <span className="text-[10px] text-slate-400 font-medium">({pctProf}%)</span>
                          )}
                          <span className="inline-flex min-w-[24px] items-center justify-center rounded-lg bg-white px-2 py-0.5 text-xs font-black text-slate-800 shadow-2xs border border-slate-200/60 tabular-nums">
                            {item.total}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                          style={{ width: `${maxProfissional > 0 ? (item.total / maxProfissional) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tabela 100% Funcional de Registros Clínicos ───── */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-200 bg-[#f8fafc] px-5 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600">
              <Search className="h-4 w-4 text-blue-700" />
              Atendimentos Registrados ({dadosTabelaFiltrados.length} de {dadosTabela.length})
            </div>

            <div className="flex h-9 w-full max-w-[280px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-2xs">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={buscaTabela}
                onChange={(evento) => setBuscaTabela(evento.target.value)}
                placeholder="Buscar paciente, CPF, escola..."
                className="w-full bg-transparent text-xs text-slate-700 placeholder:text-slate-400 outline-none"
              />
              {buscaTabela && (
                <button type="button" onClick={() => setBuscaTabela('')} className="text-slate-400 hover:text-slate-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <BarraFiltrosAtivos estado={filtroExcel} entidadeNome="atendimento(s)" />

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 border-b border-slate-200">
              <tr>
                <CabecalhoColunaExcel colunaId="data" rotulo="Data / Hora" estado={filtroExcel} className="px-4 py-3" />
                <CabecalhoColunaExcel colunaId="paciente" rotulo="Paciente / Aluno" estado={filtroExcel} className="px-4 py-3" />
                <CabecalhoColunaExcel colunaId="cpf" rotulo="CPF (LGPD)" estado={filtroExcel} className="px-4 py-3" />
                <CabecalhoColunaExcel colunaId="especialidade" rotulo="Especialidade" estado={filtroExcel} className="px-4 py-3" />
                <CabecalhoColunaExcel colunaId="profissional" rotulo="Profissional" estado={filtroExcel} className="px-4 py-3" />
                <CabecalhoColunaExcel colunaId="instituicao" rotulo="Unidade" estado={filtroExcel} className="px-4 py-3" />
                <CabecalhoColunaExcel colunaId="status" rotulo="Situação" estado={filtroExcel} className="px-4 py-3" />
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dadosTabelaFiltrados.length ? (
                dadosTabelaFiltrados.map((linha, index) => (
                  <tr
                    key={`${linha.id}-${index}`}
                    onClick={() => setAtendimentoSelecionado(linha)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{linha.data}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <div>{linha.paciente}</div>
                      <div className="text-[10px] text-slate-400 font-normal">Turma: {linha.turma}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 text-[11px] whitespace-nowrap">{linha.cpf}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <EspecialidadeBadge especialidade={linha.especialidade as Especialidade} compacto />
                    </td>
                    <td className="px-4 py-3 text-slate-700">{linha.profissional}</td>
                    <td className="px-4 py-3 text-slate-700 truncate max-w-[180px]" title={linha.instituicao}>{linha.instituicao}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusAtendimentoBadge status={linha.status as StatusAtendimento} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAtendimentoSelecionado(linha);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition cursor-pointer"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-xs text-slate-400">
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

      {/* ─── Modal de Detalhes Clínicos do Atendimento ───── */}
      {atendimentoSelecionado && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/50 backdrop-blur-[2px] p-4 font-sans">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-modal">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#f8fafc] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-blue-700">Ficha Clínica do Atendimento</div>
                  <div className="text-base font-extrabold text-slate-800">{atendimentoSelecionado.paciente}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAtendimentoSelecionado(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Bloco 1: Dados do Aluno & Unidade */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CPF Mascarado</span>
                  <span className="font-mono font-semibold text-slate-800">{atendimentoSelecionado.cpf}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Turma</span>
                  <span className="font-semibold text-slate-800">{atendimentoSelecionado.turma}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unidade Escolar</span>
                  <span className="font-semibold text-slate-800">{atendimentoSelecionado.instituicao}</span>
                </div>
              </div>

              {/* Bloco 2: Dados do Atendimento */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Especialidade</span>
                  <div className="mt-1">
                    <EspecialidadeBadge especialidade={atendimentoSelecionado.especialidade as Especialidade} compacto />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Profissional</span>
                  <span className="font-semibold text-slate-800 block mt-1">{atendimentoSelecionado.profissional}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data</span>
                  <span className="font-semibold text-slate-800 block mt-1">{atendimentoSelecionado.data}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Situação</span>
                  <div className="mt-1">
                    <StatusAtendimentoBadge status={atendimentoSelecionado.status as StatusAtendimento} />
                  </div>
                </div>
              </div>

              {/* Bloco 3: Resumo Clínico */}
              <div>
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Resumo Clínico / Queixa Principal
                </span>
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 leading-relaxed">
                  {atendimentoSelecionado.resumo}
                </div>
              </div>

              {/* Bloco 4: Procedimentos */}
              <div>
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Procedimentos Realizados
                </span>
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 leading-relaxed">
                  {atendimentoSelecionado.procedimentos}
                </div>
              </div>
            </div>

            {/* Rodapé Modal */}
            <div className="border-t border-slate-100 bg-[#f8fafc] px-6 py-3.5 flex justify-end">
              <Botao variante="secundario" tamanho="sm" onClick={() => setAtendimentoSelecionado(null)}>
                Fechar Detalhes
              </Botao>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ─── Modal / Visualização de Impressão Oficial da SEM (A4) ───── */}
      {mostrarModalImpressao && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/50 backdrop-blur-[2px] p-4 font-sans print:p-0 print:bg-white">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none">
            {/* Barra superior de controle (oculta na impressão) */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3 print:hidden">
              <span className="text-xs font-bold text-slate-600">Prévia de Impressão Oficial A4</span>
              <div className="flex items-center gap-2">
                <Botao
                  variante="primario"
                  tamanho="sm"
                  onClick={() => window.print()}
                  icone={<Printer className="h-4 w-4" />}
                >
                  Imprimir Agora / Salvar PDF
                </Botao>
                <button
                  type="button"
                  onClick={() => setMostrarModalImpressao(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Documento A4 */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 font-sans print:p-4">
              {/* Cabeçalho Oficial SEM */}
              <div className="border-b-2 border-slate-800 pb-4 text-center">
                <div className="text-[13px] font-black uppercase tracking-[0.16em] text-slate-700">Governo Municipal • Secretaria de Educação e Saúde</div>
                <div className="text-xl font-black uppercase tracking-tight text-slate-900 mt-1">Programa Saúde Itinerante na Escola (SEM)</div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-800 mt-0.5">Relatório Oficial de Gestão e Atendimento Clínico</div>
                <div className="text-[10px] text-slate-500 mt-2">
                  Emissão: {formatarDataEHoraBrasilia(new Date())} • Período: {dataInicio ? formatarDataBrasileira(dataInicio) : 'Início'} a {dataFim ? formatarDataBrasileira(dataFim) : 'Atual'}
                </div>
              </div>

              {/* Quadro de Indicadores Gerais */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-200 pb-1">
                  1. Indicadores Consolidados
                </h4>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Atendimentos Totais</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{totalGeral}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Alunos Atendidos</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{dados.pacientesUnicos ?? totalGeral}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Média Diária</div>
                    <div className="text-2xl font-black text-purple-700 mt-1">{dados.mediaDiaria ?? 0}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Escolas Atendidas</div>
                    <div className="text-2xl font-black text-blue-700 mt-1">{dados.porEscola.length}</div>
                  </div>
                </div>
              </div>

              {/* Parecer Executivo */}
              {sinteseExecutiva && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-200 pb-1">
                    2. Parecer Técnico da Coordenação
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs leading-relaxed space-y-2">
                    <p className="font-semibold text-slate-900">{sinteseExecutiva.resumo}</p>
                    <p className="font-medium text-slate-700">{sinteseExecutiva.recomendacao}</p>
                  </div>
                </div>
              )}

              {/* Tabela de Especialidades */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-200 pb-1">
                  3. Distribuição por Especialidade
                </h4>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-[10px] font-black uppercase">
                    <tr>
                      <th className="p-2 border-b border-slate-200">Especialidade</th>
                      <th className="p-2 border-b border-slate-200 text-right">Consultas</th>
                      <th className="p-2 border-b border-slate-200 text-right">% Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricasEspecialidade.map((item) => (
                      <tr key={item.especialidadeChave} className="border-b border-slate-100">
                        <td className="p-2 font-semibold">{item.especialidade}</td>
                        <td className="p-2 text-right font-bold">{item.atendimentos}</td>
                        <td className="p-2 text-right font-semibold">{item.pctTotal}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Campo para Assinaturas e Carimbos */}
              <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs">
                <div className="border-t border-slate-400 pt-2">
                  <div className="font-bold text-slate-800">Coordenação Médica e de Enfermagem</div>
                  <div className="text-[10px] text-slate-500">Programa Saúde Itinerante na Escola</div>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <div className="font-bold text-slate-800">Diretoria Regional de Ensino e Saúde</div>
                  <div className="text-[10px] text-slate-500">Secretaria Municipal de Educação e Saúde</div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ModalImportarPlanilha
        aberto={modalImportarAberto}
        aoFechar={() => setModalImportarAberto(false)}
        aoConcluirImportacao={() => {
          handleGerarRelatorio();
        }}
      />
    </div>
  );
};

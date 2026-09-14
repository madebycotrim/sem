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
  Copy,
  Check,
  Printer,
  X,
  TrendingUp,
  Activity,
  Building2,
  User,
  ShieldCheck,
  FileText,
  ArrowUpRight,
  Stethoscope,
  Smile,
} from 'lucide-react';
import { utils, writeFile } from 'xlsx';
import { requisicaoApi } from '../servicos/api.ts';
import {
  ESPECIALIDADE_LABELS,
  STATUS_ATENDIMENTO_LABELS,
  StatusAtendimento,
  type Especialidade,
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
import { StatusAtendimentoBadge } from './StatusAtendimentoBadge.tsx';

export interface RelatoriosProps {
  escolas?: Array<{ id: string; nome: string }>;
}

interface RelatorioDados {
  total: number;
  totalEncaminhamentos: number;
  taxaEncaminhamento?: number;
  taxaResolutividade?: number;
  pacientesUnicos?: number;
  mediaDiaria?: number;
  picoAtendimento?: { data: string; total: number } | null;
  porStatus?: Record<string, number>;
  porEspecialidade: Array<{ especialidade: string; total: number; encaminhamentos: number }>;
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
  turno: string;
  status?: string;
  criadoEm: string;
  escolaLocal: string;
  profissional: string;
  profissionalRegistro?: string | null;
  profissionalConselho?: string | null;
  resumo: string | null;
  procedimentos: string | null;
  insumosUtilizados: string | null;
  encaminhamentoExterno: string | null;
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
  insumos: string;
  encaminhamento: string;
}

const formatarDataBrasileira = (data: string) => {
  if (!data) return '';
  return new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR');
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
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  });
  const [dataFim, setDataFim] = useState(() => new Date().toISOString().slice(0, 10));
  const [periodoSelecionado, setPeriodoSelecionado] = useState<number | 'mes' | 'tudo' | null>(30);

  const [indicePontoAtivo, setIndicePontoAtivo] = useState<number | null>(null);
  const [buscaTabela, setBuscaTabela] = useState('');
  const [tooltipPosicao, setTooltipPosicao] = useState<{ x: number; y: number } | null>(null);
  const [profissionaisDisponiveis, setProfissionaisDisponiveis] = useState<Array<{ id: string; nome: string; especialidade?: string | null }>>([]);

  const [relatorioGerado, setRelatorioGerado] = useState(true);
  const [filtrosModificados, setFiltrosModificados] = useState(false);
  const [copiadoFeedback, setCopiadoFeedback] = useState(false);

  // Modais
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState<RegistroTabela | null>(null);
  const [mostrarModalImpressao, setMostrarModalImpressao] = useState(false);

  const dataInicioRef = useRef<HTMLInputElement>(null);
  const dataFimRef = useRef<HTMLInputElement>(null);

  const [dados, setDados] = useState<RelatorioDados>({
    total: 0,
    totalEncaminhamentos: 0,
    taxaEncaminhamento: 0,
    taxaResolutividade: 100,
    pacientesUnicos: 0,
    mediaDiaria: 0,
    picoAtendimento: null,
    porStatus: {},
    porEspecialidade: [],
    porEscola: [],
    porProfissional: [],
    serie: {},
  });

  const [dadosTabela, setDadosTabela] = useState<RegistroTabela[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

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

  // Requisição dos dados do relatório
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
          totalEncaminhamentos: respostaRelatorio.totalEncaminhamentos ?? 0,
          taxaEncaminhamento: respostaRelatorio.taxaEncaminhamento ?? 0,
          taxaResolutividade: respostaRelatorio.taxaResolutividade ?? 100,
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
            insumos: item.insumosUtilizados || 'Nenhum insumo específico registrado',
            encaminhamento: item.encaminhamentoExterno || 'Sem encaminhamento externo (resolvido na unidade)',
          }))
        );
        setFiltrosModificados(false);
      } catch (erroApi) {
        if (!controlador.signal.aborted) {
          setDados({
            total: 0,
            totalEncaminhamentos: 0,
            taxaEncaminhamento: 0,
            taxaResolutividade: 100,
            pacientesUnicos: 0,
            mediaDiaria: 0,
            picoAtendimento: null,
            porStatus: {},
            porEspecialidade: [],
            porEscola: [],
            porProfissional: [],
            serie: {},
          });
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

  // Cálculos Derivados e Inteligência Analítica
  const totalGeral = dados.total || 0;

  const metricasEspecialidade = useMemo(
    () =>
      (dados.porEspecialidade || []).map((item) => {
        const rotulo = ESPECIALIDADE_LABELS[item.especialidade as Especialidade] ?? item.especialidade;
        const pctTotal = totalGeral > 0 ? Math.round((item.total / totalGeral) * 100) : 0;
        const taxaEnc = item.total > 0 ? Math.round((item.encaminhamentos / item.total) * 100) : 0;
        return {
          especialidadeChave: item.especialidade,
          especialidade: rotulo,
          atendimentos: item.total,
          encaminhamentos: item.encaminhamentos,
          pctTotal,
          taxaEnc,
        };
      }),
    [dados.porEspecialidade, totalGeral],
  );

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
  const rankingProfissionais = dados.porProfissional || [];
  const rankingEscolas = dados.porEscola || [];

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

  const picoGrafico = dados.picoAtendimento ?? useMemo(() => {
    if (!dadosGrafico.length) return null;
    const melhor = dadosGrafico.reduce((melhorItem, item) => (item.valor > melhorItem.valor ? item : melhorItem), dadosGrafico[0]);
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

    // 2. Taxa de Encaminhamento
    const taxaEnc = dados.taxaEncaminhamento ?? (totalGeral > 0 ? Math.round((dados.totalEncaminhamentos / totalGeral) * 100) : 0);
    if (taxaEnc >= 25) {
      alertas.push({
        tipo: 'urgente',
        titulo: 'Elevado Índice de Encaminhamentos Externos',
        texto: `${taxaEnc}% dos pacientes (${dados.totalEncaminhamentos}) necessitaram de suporte fora da unidade. Sugere-se reforço de insumos especializados.`,
      });
    } else if (taxaEnc <= 12 && totalGeral >= 15) {
      alertas.push({
        tipo: 'sucesso',
        titulo: 'Alta Eficiência Resolutiva Local',
        texto: `${100 - taxaEnc}% dos casos foram resolvidos integralmente in loco pelo programa itinerante.`,
      });
    }

    // 3. Pico de Demanda
    if (picoGrafico && mediaGrafico > 0 && picoGrafico.total >= mediaGrafico * 1.6) {
      alertas.push({
        tipo: 'alerta',
        titulo: 'Pico Operacional Acentuado',
        texto: `Em ${formatarDataBrasileira(picoGrafico.data)}, foram registrados ${picoGrafico.total} atendimentos (+${Math.round(((picoGrafico.total - mediaGrafico) / mediaGrafico) * 100)}% sobre a média diária).`,
      });
    }

    // 4. Unidade Polo com Maior Carga
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
  }, [totalGeral, dados.porEspecialidade, dados.taxaEncaminhamento, dados.totalEncaminhamentos, dados.porEscola, picoGrafico, mediaGrafico]);

  // Síntese Executiva Inteligente (Parecer Automatizado)
  const sinteseExecutiva = useMemo(() => {
    if (totalGeral === 0) {
      return {
        titulo: 'Síntese Executiva do Período',
        resumo: 'Nenhum registro encontrado no intervalo selecionado para compor o parecer executivo.',
        pontos: [],
        recomendacao: 'Amplie os filtros de busca para extrair indicadores de gestão.',
      };
    }

    const dataIniFormatada = dataInicio ? formatarDataBrasileira(dataInicio) : 'Início';
    const dataFimFormatada = dataFim ? formatarDataBrasileira(dataFim) : 'Atual';
    const taxaRes = dados.taxaResolutividade ?? (100 - (dados.taxaEncaminhamento ?? 0));
    const topEsp = dados.porEspecialidade[0];
    const topEspNome = topEsp ? ESPECIALIDADE_LABELS[topEsp.especialidade as Especialidade] ?? topEsp.especialidade : 'N/A';
    const topEspPct = topEsp ? Math.round((topEsp.total / totalGeral) * 100) : 0;
    const topEscola = dados.porEscola[0]?.nome ?? 'Não identificada';

    const texto = `No período de ${dataIniFormatada} a ${dataFimFormatada}, a operação itinerante de saúde escolar realizou ${totalGeral} atendimentos para ${dados.pacientesUnicos ?? totalGeral} estudantes em ${dados.porEscola.length} escola(s). A resolutividade clínica alcançou ${taxaRes}%, com emissão de ${dados.totalEncaminhamentos} encaminhamento(s) externo(s). A especialidade mais requisitada foi ${topEspNome} (${topEsp?.total ?? 0} consultas, representando ${topEspPct}% do volume geral).`;

    const pontos = [
      `Cobertura de Alunos: ${dados.pacientesUnicos ?? totalGeral} estudantes distintos atendidos com média de ${dados.mediaDiaria ?? 0} consultas/dia útil.`,
      `Taxa de Resolutividade: ${taxaRes}% dos casos solucionados no local sem sobrecarga da rede secundária.`,
      `Foco de Demanda: ${topEspNome} liderou com ${topEspPct}% das intervenções, seguido pela unidade "${topEscola}".`,
    ];

    const recomendacao =
      (dados.taxaEncaminhamento ?? 0) > 20
        ? `Recomenda-se reforço de insumos específicos de ${topEspNome} nas próximas visitas para reduzir encaminhamentos externos.`
        : `A equipe itinerante apresentou excelente índice de resolutividade in loco (${taxaRes}%); manter cronograma das unidades polos.`;

    return {
      titulo: 'Síntese Executiva e Parecer Clínico Operacional',
      resumo: texto,
      pontos,
      recomendacao,
    };
  }, [totalGeral, dataInicio, dataFim, dados]);

  const copiarParecer = () => {
    const textoCompleto = `${sinteseExecutiva.titulo}\n\n${sinteseExecutiva.resumo}\n\nDESTAQUES:\n${sinteseExecutiva.pontos.map((p) => `• ${p}`).join('\n')}\n\nDIRETRIZ:\n${sinteseExecutiva.recomendacao}`;
    void navigator.clipboard.writeText(textoCompleto);
    setCopiadoFeedback(true);
    setTimeout(() => setCopiadoFeedback(false), 3000);
  };

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
      const parametrosBase = new URLSearchParams({ dataInicio, dataFim, pagina: '1', porPagina: '100' });
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
          'Taxa de Resolutividade In Loco',
          'Encaminhamentos Externos',
          'Taxa de Encaminhamento Externo',
          'Média Diária de Atendimentos',
          'Pico Operacional (Data)',
        ],
        [
          primeiraPagina.total ?? atendimentos.length,
          dados.pacientesUnicos ?? atendimentos.length,
          `${dados.taxaResolutividade ?? 100}%`,
          dados.totalEncaminhamentos,
          `${dados.taxaEncaminhamento ?? 0}%`,
          dados.mediaDiaria ?? 0,
          picoGrafico ? `${picoGrafico.total} (${formatarDataBrasileira(picoGrafico.data)})` : 'N/A',
        ],
        [],
        ['=== 2. PARECER EXECUTIVO E DIRETRIZES DA GESTÃO ==='],
        ['Resumo do Período:', sinteseExecutiva.resumo],
        ['Diretriz da Coordenação:', sinteseExecutiva.recomendacao],
        ...sinteseExecutiva.pontos.map((ponto, i) => [`Destaque Estratégico ${i + 1}:`, ponto]),
        [],
        ['=== 3. DISTRIBUIÇÃO ANALÍTICA POR ESPECIALIDADE ==='],
        [
          'Especialidade',
          'Total de Consultas',
          'Encaminhamentos Externos',
          'Taxa de Encaminhamento (%)',
          'Participação no Volume Geral (%)',
        ],
        ...metricasEspecialidade.map((item) => [
          item.especialidade,
          item.atendimentos,
          item.encaminhamentos,
          `${item.taxaEnc}%`,
          `${item.pctTotal}%`,
        ]),
        [],
        ['=== 4. SITUAÇÃO OPERACIONAL DOS ATENDIMENTOS ==='],
        ['Situação / Status', 'Quantidade de Atendimentos', 'Participação no Total (%)'],
        ...Object.entries(STATUS_ATENDIMENTO_LABELS).map(([chave, rotulo]) => {
          const qtd = dados.porStatus?.[chave] ?? 0;
          return [rotulo, qtd, totalGeral > 0 ? `${Math.round((qtd / totalGeral) * 100)}%` : '0%'];
        }),
        [],
        ['=== 6. PRODUTIVIDADE POR UNIDADE ESCOLAR ==='],
        ['Unidade Escolar', 'Total de Atendimentos', 'Participação no Total (%)'],
        ...rankingEscolas.map((escola) => [
          escola.nome,
          escola.total,
          totalGeral > 0 ? `${Math.round((escola.total / totalGeral) * 100)}%` : '0%',
        ]),
        [],
        ['=== 7. PRODUTIVIDADE POR PROFISSIONAL DE SAÚDE ==='],
        ['Profissional', 'Total de Atendimentos', 'Participação no Total (%)'],
        ...rankingProfissionais.map((prof) => [
          prof.nome,
          prof.total,
          totalGeral > 0 ? `${Math.round((prof.total / totalGeral) * 100)}%` : '0%',
        ]),
        [],
        ['=== 8. ALERTAS E OBSERVAÇÕES OPERACIONAIS ==='],
        ['Categoria / Tipo', 'Título do Alerta', 'Detalhamento Técnico'],
        ...alertasOperacionais.map((alerta) => [
          alerta.tipo.toUpperCase(),
          alerta.titulo,
          alerta.texto,
        ]),
      ];

      // ─── PÁGINA 2: DADOS BRUTOS DOS ATENDIMENTOS ─────
      const linhasAtendimentos = atendimentos.map((item) => ({
        ID: item.id,
        'Data e Hora': new Date(item.criadoEm).toLocaleString('pt-BR'),
        'Aluno / Paciente': item.pacienteNome || 'Não informado',
        'CPF (Mascarado)': item.pacienteCpf || 'Não informado',
        Turma: item.pacienteTurma || 'Não informada',
        Especialidade: ESPECIALIDADE_LABELS[item.especialidade as Especialidade] ?? item.especialidade,
        Situação: item.status ? STATUS_ATENDIMENTO_LABELS[item.status as StatusAtendimento] ?? item.status : 'Concluído',
        Profissional: item.profissional || 'Não informado',
        'Conselho e Registro': formatarConselhoERegistro(item.profissionalRegistro || undefined, item.profissionalConselho || undefined, item.especialidade as any) || 'Não informado',
        'Unidade Escolar': item.escolaLocal || 'Não informado',
        'Resumo Clínico / Queixa': item.resumo || 'Sem observações',
        'Procedimentos Realizados': item.procedimentos || 'Padrão realizado',
        'Insumos Utilizados': item.insumosUtilizados || 'Nenhum insumo específico',
        'Encaminhamento Externo': item.encaminhamentoExterno || 'Não encaminhado (resolvido)',
      }));

      const planilha = utils.book_new();
      const abaDashboard = utils.aoa_to_sheet(linhasDashboard);
      const abaDadosBrutos = utils.json_to_sheet(linhasAtendimentos);

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
        { wch: 38 }, // ID
        { wch: 18 }, // Data e Hora
        { wch: 30 }, // Aluno / Paciente
        { wch: 18 }, // CPF
        { wch: 15 }, // Turma
        { wch: 22 }, // Especialidade
        { wch: 16 }, // Status
        { wch: 28 }, // Profissional
        { wch: 32 }, // Unidade Escolar
        { wch: 45 }, // Resumo Clínico
        { wch: 40 }, // Procedimentos
        { wch: 35 }, // Insumos
        { wch: 45 }, // Encaminhamento
      ];

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

              {/* Instituição / Escola */}
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
                    setErro(null);
                    setFiltrosModificados(true);
                  }}
                  icone={<RotateCcw className="h-3.5 w-3.5" />}
                  className="text-slate-600 hover:text-rose-700 hover:bg-rose-50 border-slate-200"
                >
                  Limpar
                </Botao>

                {carregando && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold animate-pulse mr-2">
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin text-blue-600" />
                    <span>Atualizando...</span>
                  </div>
                )}
                <Botao
                  variante={filtrosModificados ? 'destaque' : 'primario'}
                  tamanho="sm"
                  formato="pilula"
                  onClick={handleGerarRelatorio}
                  icone={<FileBarChart2 className="h-4 w-4" />}
                  className={filtrosModificados ? 'ring-2 ring-blue-300 animate-pulse' : ''}
                >
                  {filtrosModificados ? 'Atualizar Relatório' : 'Atualizar Dados'}
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

      {/* ─── Painel de Ações e Cabeçalho do Relatório Oficial ───── */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-gradient-to-r from-[#f8fafc] to-[#edf4fa] px-5 py-3.5 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">Painel de Inteligência SEM</div>
              <div className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                Relatório Oficial de Saúde Itinerante
                <span className="text-xs font-semibold text-slate-400">
                  ({dataInicio ? formatarDataBrasileira(dataInicio) : 'Desde o início'} — {dataFim ? formatarDataBrasileira(dataFim) : 'Até o momento'})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMostrarModalImpressao(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              <Printer className="h-4 w-4 text-slate-500" />
              Imprimir Relatório Oficial
            </button>

            <button
              type="button"
              onClick={() => void handleExportarPlanilha()}
              disabled={exportando}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#cfe1ee] bg-[#0d4d7a] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#093c60] disabled:opacity-60 cursor-pointer"
            >
              {exportando ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exportando ? 'Gerando Planilha...' : 'Baixar Planilha Excel'}
            </button>
          </div>
        </div>

        {/* ─── 5 Cards de KPIs Estratégicos ───── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 p-5 bg-white">
          {/* Card 1: Total */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-white p-4 text-[#0d4d7a] shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">Total Atendimentos</span>
              <FileBarChart2 className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 text-3xl font-black tracking-tight text-slate-900">{totalGeral}</div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-500">
              <User className="h-3.5 w-3.5 text-blue-600" />
              <span>{dados.pacientesUnicos ?? totalGeral} alunos únicos</span>
            </div>
          </div>

          {/* Card 2: Resolutividade */}
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-white p-4 text-emerald-800 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Resolutividade In Loco</span>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-3xl font-black tracking-tight text-emerald-950">{dados.taxaResolutividade ?? 100}%</div>
            <div className="mt-1 text-[11px] font-semibold text-emerald-700 truncate">
              {totalGeral - dados.totalEncaminhamentos} casos concluídos no local
            </div>
          </div>

          {/* Card 3: Encaminhamentos */}
          <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/70 to-white p-4 text-amber-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">Encaminhamentos</span>
              <ArrowUpRight className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-2 text-3xl font-black tracking-tight text-amber-950">{dados.totalEncaminhamentos}</div>
            <div className="mt-1 text-[11px] font-semibold text-amber-700">
              {dados.taxaEncaminhamento ?? 0}% do volume total
            </div>
          </div>

          {/* Card 4: Média Diária */}
          <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/70 to-white p-4 text-purple-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-purple-700">Média Diária</span>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <div className="mt-2 text-3xl font-black tracking-tight text-purple-950">{dados.mediaDiaria ?? 0}</div>
            <div className="mt-1 text-[11px] font-semibold text-purple-700 truncate">
              {picoGrafico ? `Pico: ${picoGrafico.total} em ${formatarDataBrasileira(picoGrafico.data)}` : 'Sem registros'}
            </div>
          </div>

          {/* Card 5: Especialidade Líder */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-white p-4 text-indigo-900 shadow-2xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-700">Demanda Principal</span>
              <Stethoscope className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="mt-2 text-xl font-black tracking-tight text-indigo-950 truncate">
              {rankingEspecialidades[0]?.especialidade ?? 'Nenhuma'}
            </div>
            <div className="mt-1 text-[11px] font-semibold text-indigo-700 truncate">
              {rankingEspecialidades[0] ? `${rankingEspecialidades[0].atendimentos} atendimentos (${rankingEspecialidades[0].pctTotal}%)` : 'Sem dados'}
            </div>
          </div>
        </div>

        {/* ─── Síntese Executiva Inteligente (Gerada por Algoritmo Clínico) ───── */}
        <div className="border-t border-slate-200 bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#edf2f7] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-900">
                  {sinteseExecutiva.titulo}
                </span>
                <span className="text-[10px] text-slate-500 ml-2 font-medium">Análise gerada automaticamente com base nos dados consolidados</span>
              </div>
            </div>

            <button
              type="button"
              onClick={copiarParecer}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              {copiadoFeedback ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
              {copiadoFeedback ? 'Parecer Copiado!' : 'Copiar Parecer Executivo'}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-3 text-xs leading-relaxed text-slate-700">
            <p className="font-medium text-slate-800 text-[13px]">{sinteseExecutiva.resumo}</p>

            {sinteseExecutiva.pontos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                {sinteseExecutiva.pontos.map((ponto, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span className="text-[11px] font-medium text-slate-700">{ponto}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-start gap-2 pt-1 border-t border-slate-100 text-slate-600">
              <span className="text-[11px] font-black uppercase text-blue-700 shrink-0">Diretriz da Gestão:</span>
              <span className="text-[11px] font-medium text-slate-700">{sinteseExecutiva.recomendacao}</span>
            </div>
          </div>
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

      {/* ─── 4 Cards de Distribuição e Produtividade ───── */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* 1. Ranking de Especialidades */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Distribuição por Especialidade</div>
            <span className="text-[10px] font-bold text-slate-400">{rankingEspecialidades.length} especialidades ativas</span>
          </div>

          <div className="space-y-3.5">
            {rankingEspecialidades.map((item) => {
              const paleta = paletaEspecialidade(item.especialidadeChave);
              const Icone = paleta.icone;

              return (
                <div key={item.especialidadeChave} className="group">
                  <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full ${paleta.bgIcone}`}>
                        <Icone className="h-3.5 w-3.5" />
                      </span>
                      <span className="font-bold text-slate-800">{item.especialidade}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">({item.pctTotal}%)</span>
                      <span className="font-black text-slate-700">{item.atendimentos}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(item.atendimentos / maxBarraEsp) * 100}%`,
                        backgroundColor: paleta.corBarra,
                      }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 px-0.5">
                    <span>Encaminhamentos: {item.encaminhamentos}</span>
                    <span>Taxa externa: {item.taxaEnc}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Status Operacional */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Status Operacional</div>
            <Activity className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            {Object.entries(STATUS_ATENDIMENTO_LABELS).map(([chave, rotulo]) => {
              const qtd = dados.porStatus?.[chave] ?? 0;
              if (qtd === 0 && chave !== 'CONCLUIDO') return null;
              return (
                <div key={chave} className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1 border border-slate-100">
                  <span className="text-slate-500 truncate">{rotulo}</span>
                  <span className="font-black text-slate-800">{qtd}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Produtividade por Unidade Escolar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Por Unidade Escolar</div>
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {rankingEscolas.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">Nenhuma escola com atendimentos.</div>
            ) : (
              rankingEscolas.slice(0, 6).map((item) => (
                <div key={item.id}>
                  <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="truncate font-medium text-slate-700 max-w-[170px]" title={item.nome}>
                      {item.nome}
                    </span>
                    <span className="font-black text-slate-800">{item.total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0d4d7a] transition-all duration-500"
                      style={{ width: `${(item.total / maxEscola) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 4. Produtividade por Profissional */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Por Profissional</div>
            <User className="h-3.5 w-3.5 text-slate-400" />
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {rankingProfissionais.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">Nenhum profissional com atendimentos.</div>
            ) : (
              rankingProfissionais.slice(0, 6).map((item) => (
                <div key={item.id}>
                  <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="truncate font-medium text-slate-700 max-w-[170px]" title={item.nome}>
                      {item.nome}
                    </span>
                    <span className="font-black text-slate-800">{item.total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                      style={{ width: `${(item.total / maxProfissional) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
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

      {/* ─── Modal de Detalhes Clínicos do Atendimento ───── */}
      {atendimentoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
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

              {/* Bloco 5: Insumos */}
              <div>
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Insumos e Materiais Utilizados
                </span>
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 leading-relaxed">
                  {atendimentoSelecionado.insumos}
                </div>
              </div>

              {/* Bloco 6: Encaminhamento Externo */}
              <div>
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Encaminhamento Externo
                </span>
                <div className={`rounded-xl border p-3 leading-relaxed ${
                  atendimentoSelecionado.encaminhamento.includes('Sem encaminhamento')
                    ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                    : 'border-amber-200 bg-amber-50/80 text-amber-900 font-semibold'
                }`}>
                  {atendimentoSelecionado.encaminhamento}
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
        </div>
      )}

      {/* ─── Modal / Visualização de Impressão Oficial da SEM (A4) ───── */}
      {mostrarModalImpressao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in print:p-0 print:bg-white">
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
                  Emissão: {new Date().toLocaleString('pt-BR')} • Período: {dataInicio ? formatarDataBrasileira(dataInicio) : 'Início'} a {dataFim ? formatarDataBrasileira(dataFim) : 'Atual'}
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
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Resolutividade In Loco</div>
                    <div className="text-2xl font-black text-emerald-700 mt-1">{dados.taxaResolutividade ?? 100}%</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Encaminhamentos</div>
                    <div className="text-2xl font-black text-amber-700 mt-1">{dados.totalEncaminhamentos}</div>
                  </div>
                </div>
              </div>

              {/* Parecer Executivo */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-200 pb-1">
                  2. Parecer Técnico da Coordenação
                </h4>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs leading-relaxed space-y-2">
                  <p className="font-semibold text-slate-900">{sinteseExecutiva.resumo}</p>
                  <p className="font-medium text-slate-700">{sinteseExecutiva.recomendacao}</p>
                </div>
              </div>

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
                      <th className="p-2 border-b border-slate-200 text-right">Encaminhamentos</th>
                      <th className="p-2 border-b border-slate-200 text-right">% Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricasEspecialidade.map((item) => (
                      <tr key={item.especialidadeChave} className="border-b border-slate-100">
                        <td className="p-2 font-semibold">{item.especialidade}</td>
                        <td className="p-2 text-right font-bold">{item.atendimentos}</td>
                        <td className="p-2 text-right">{item.encaminhamentos} ({item.taxaEnc}%)</td>
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
        </div>
      )}
    </div>
  );
};

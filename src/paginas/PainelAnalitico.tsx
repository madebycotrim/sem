import { type FC, useState, useEffect, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  Apple,
  BarChart3,
  Brain,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Ear,
  Eye,
  Filter,
  Flame,
  Layers,
  MapPin,
  PieChart,
  RotateCcw,
  ShieldCheck,
  Smile,
  Trophy,
  UsersRound,
  XCircle,
} from 'lucide-react';
import { ESPECIALIDADE_LABELS, STATUS_ATENDIMENTO_LABELS, StatusAtendimento, type Especialidade } from '../../compartilhado/index.ts';
import { CabecalhoPagina } from '../componentes/CabecalhoPagina.tsx';
import { EspecialidadeBadge } from '../componentes/EspecialidadeVisual.tsx';
import { SeletorFiltroUniversal } from '../componentes/Modal.tsx';
import { GraficoPizzaDonut } from '../componentes/graficos/GraficoPizzaDonut.tsx';
import { GraficoLinhaDoTempo } from '../componentes/graficos/GraficoLinhaDoTempo.tsx';
import { GraficoBarrasComparativas } from '../componentes/graficos/GraficoBarrasComparativas.tsx';
import { GraficoFunilAssistencial } from '../componentes/graficos/GraficoFunilAssistencial.tsx';
import { requisicaoApi } from '../servicos/api.ts';

const NumeroAnimado: FC<{ valor: number; duracao?: number }> = ({ valor, duracao = 450 }) => {
  const [valorExibido, setValorExibido] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const inicio = performance.now();
    const valorInicial = valorExibido;

    const animar = (agora: number) => {
      const progresso = Math.min((agora - inicio) / duracao, 1);
      const progressoSuave = 1 - Math.pow(1 - progresso, 4);
      setValorExibido(Math.round(valorInicial + (valor - valorInicial) * progressoSuave));
      if (progresso < 1) frameId = requestAnimationFrame(animar);
    };

    frameId = requestAnimationFrame(animar);
    return () => cancelAnimationFrame(frameId);
  }, [valor]);

  return <>{valorExibido}</>;
};

const formatarDataBr = (dataIso: string): string => {
  if (!dataIso) return '';
  const [ano, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}/${ano}`;
};

interface AtendimentoAnalitico {
  id: string;
  pacienteNome: string;
  especialidade: string;
  turno: string;
  escolaNome: string;
  profissionalNome: string;
  criadoEm: string;
  status?: StatusAtendimento;
}

interface PacienteAnalitico {
  termoConsentimentoStatus: string;
}


interface EscolaAnalitica {
  id: string;
  nome: string;
}

interface PainelAnaliticoProps {
  atendimentos: AtendimentoAnalitico[];
  pacientes: PacienteAnalitico[];
  escolas: EscolaAnalitica[];
}

export const PainelAnalitico: FC<PainelAnaliticoProps> = ({ atendimentos, pacientes, escolas }) => {
  const [dataInicio, setDataInicio] = useState(() => `${new Date().getFullYear()}-01-01`);
  const [dataFim, setDataFim] = useState(() => new Date().toISOString().slice(0, 10));
  const [statusFiltro, setStatusFiltro] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [profissional, setProfissional] = useState('');
  const [escola, setEscola] = useState('');
  const [profissionaisSaude, setProfissionaisSaude] = useState<Array<{ id: string; nome: string; especialidade?: string | null }>>([]);

  // O painel analítico reflete estritamente os atendimentos reais persistidos no banco de dados
  const todosAtendimentos = atendimentos;

  useEffect(() => {
    let ativo = true;
    const carregarProfissionais = async () => {
      try {
        const resposta = await requisicaoApi<{ dados: Array<{ id: string; nome: string; especialidade?: string | null }> }>('/atendimentos/profissionais');
        if (ativo && resposta?.dados) {
          setProfissionaisSaude(resposta.dados);
        }
      } catch (erro) {
        console.error('Erro ao carregar profissionais de saúde:', erro);
      }
    };
    void carregarProfissionais();
    return () => {
      ativo = false;
    };
  }, []);

  const opcoesProfissionais = useMemo(() => {
    const mapaNomes = new Map<string, { valor: string; rotulo: string; especialidade?: string | null }>();

    // 1. Inclui todos os usuários cadastrados com cargo de profissional de saúde
    profissionaisSaude.forEach((p) => {
      if (p.nome && p.nome.trim()) {
        mapaNomes.set(p.nome.trim(), {
          valor: p.nome.trim(),
          rotulo: p.nome.trim(),
          especialidade: p.especialidade,
        });
      }
    });

    // 2. Inclui também profissionais que já possuem atendimentos registrados no histórico
    todosAtendimentos.forEach((a) => {
      if (a.profissionalNome && a.profissionalNome.trim() && !mapaNomes.has(a.profissionalNome.trim())) {
        mapaNomes.set(a.profissionalNome.trim(), {
          valor: a.profissionalNome.trim(),
          rotulo: a.profissionalNome.trim(),
        });
      }
    });

    return Array.from(mapaNomes.values()).sort((a, b) => a.rotulo.localeCompare(b.rotulo));
  }, [profissionaisSaude, todosAtendimentos]);

  const atendimentosFiltrados = todosAtendimentos.filter((atendimento) => {
    const data = (atendimento.criadoEm || '').slice(0, 10);
    const dentroDataInicio = !dataInicio || data >= dataInicio;
    const dentroDataFim = !dataFim || data <= dataFim;
    return (
      dentroDataInicio &&
      dentroDataFim &&
      (!especialidade || atendimento.especialidade === especialidade) &&
      (!profissional || atendimento.profissionalNome === profissional) &&
      (!escola || atendimento.escolaNome === escola) &&
      (!statusFiltro || (atendimento.status || StatusAtendimento.CONCLUIDO) === statusFiltro)
    );
  });

  const totalConsultasTodasUnidades = todosAtendimentos.length;
  const totalConsultasConcluidas = todosAtendimentos.filter((atendimento) =>
    (atendimento.status === 'CONCLUIDO' || !atendimento.status)
  ).length;
  const totalConsultasPendentes = todosAtendimentos.filter((atendimento) =>
    ['AGUARDANDO', 'CONFIRMADO', 'EM_ATENDIMENTO', 'AGENDADO', 'PENDENTE'].includes(atendimento.status || '')
  ).length;
  const totalConsultasCanceladas = todosAtendimentos.filter((atendimento) =>
    ['CANCELADO', 'FALTOU', 'CANCELADA'].includes(atendimento.status || '')
  ).length;

  const totaisEspecialidades = [
    { id: 'ODONTOLOGIA', nome: 'Odontologia', icone: Smile, cor: 'text-blue-600', fundo: 'bg-blue-50' },
    { id: 'OFTALMOLOGIA', nome: 'Oftalmologia', icone: Eye, cor: 'text-indigo-600', fundo: 'bg-indigo-50' },
    { id: 'AUDIOMETRIA', nome: 'Audiometria', icone: Ear, cor: 'text-sky-600', fundo: 'bg-sky-50' },
    { id: 'NUTRICAO', nome: 'Nutrição', icone: Apple, cor: 'text-emerald-600', fundo: 'bg-emerald-50' },
    { id: 'PSICOLOGIA', nome: 'Psicologia', icone: Brain, cor: 'text-amber-600', fundo: 'bg-amber-50' },
  ].map((especialidadeItem) => ({
    ...especialidadeItem,
    total: todosAtendimentos.filter((atendimento) => atendimento.especialidade === especialidadeItem.id).length,
  }));

  const periodoLabel = useMemo(() => {
    if (dataInicio && dataFim) {
      if (dataInicio === dataFim) return formatarDataBr(dataInicio);
      return `${formatarDataBr(dataInicio)} a ${formatarDataBr(dataFim)}`;
    }
    if (dataInicio) return `A partir de ${formatarDataBr(dataInicio)}`;
    if (dataFim) return `Até ${formatarDataBr(dataFim)}`;
    return 'Todo o período';
  }, [dataInicio, dataFim]);
  const rankingProfissionais = Object.entries(atendimentosFiltrados.reduce<Record<string, number>>((resultado, atendimento) => {
    const nome = atendimento.profissionalNome || 'Profissional não informado';
    resultado[nome] = (resultado[nome] || 0) + 1;
    return resultado;
  }, {})).sort(([, totalA], [, totalB]) => totalB - totalA).slice(0, 6);
  const rankingUnidades = Object.entries(atendimentosFiltrados.reduce<Record<string, number>>((resultado, atendimento) => {
    resultado[atendimento.escolaNome] = (resultado[atendimento.escolaNome] || 0) + 1;
    return resultado;
  }, {})).sort(([, totalA], [, totalB]) => totalB - totalA);
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const consultasPorDia = diasSemana.map((dia, indice) => ({
    dia,
    total: atendimentosFiltrados.filter((atendimento) => new Date(atendimento.criadoEm).getDay() === indice).length,
  }));
  const diaDePico = atendimentosFiltrados.length
    ? consultasPorDia.reduce((pico, item) => item.total > pico.total ? item : pico, consultasPorDia[0])
    : null;
  const horas = Array.from({ length: 10 }, (_, indice) => indice + 8).map((hora) => ({
    hora: `${String(hora).padStart(2, '0')}h`,
    total: atendimentosFiltrados.filter((atendimento) => new Date(atendimento.criadoEm).getHours() === hora).length,
  }));
  const maiorHora = Math.max(...horas.map((item) => item.total), 1);
  const horaDePico = atendimentosFiltrados.length
    ? horas.reduce((pico, item) => item.total > pico.total ? item : pico, horas[0])
    : null;
  const contagemStatus = Object.keys(STATUS_ATENDIMENTO_LABELS).map((status) => ({
    id: status as StatusAtendimento,
    nome: STATUS_ATENDIMENTO_LABELS[status as StatusAtendimento],
    total: atendimentosFiltrados.filter((atendimento) => (atendimento.status || StatusAtendimento.CONCLUIDO) === status).length,
  }));

  // ─── 1. Dados para a Linha do Tempo (Timeline Diária) ───────────────
  const pontosLinhaDoTempo = useMemo(() => {
    if (!atendimentosFiltrados.length) return [];
    const mapaPorData = new Map<string, { total: number; especialidades: Record<string, number> }>();

    atendimentosFiltrados.forEach((a) => {
      const dataIso = (a.criadoEm || '').slice(0, 10);
      if (!dataIso) return;
      const item = mapaPorData.get(dataIso) || { total: 0, especialidades: {} };
      item.total += 1;
      if (a.especialidade) {
        item.especialidades[a.especialidade] = (item.especialidades[a.especialidade] || 0) + 1;
      }
      mapaPorData.set(dataIso, item);
    });

    const datasOrdenadas = Array.from(mapaPorData.keys()).sort();

    return datasOrdenadas.map((dataIso) => {
      const info = mapaPorData.get(dataIso)!;
      const [, mes, dia] = dataIso.split('-');
      const espLider = Object.entries(info.especialidades).sort(([, a], [, b]) => b - a)[0];
      const nomeEspLider = espLider
        ? ESPECIALIDADE_LABELS[espLider[0] as keyof typeof ESPECIALIDADE_LABELS] || espLider[0]
        : '';
      return {
        dataIso,
        rotulo: `${dia}/${mes}`,
        total: info.total,
        detalhes: nomeEspLider ? `Mais atendido: ${nomeEspLider}` : undefined,
      };
    });
  }, [atendimentosFiltrados]);

  // ─── 2. Dados para o Gráfico de Pizza/Donut de Especialidades ────────
  const CORES_HEX_ESPECIALIDADES: Record<string, string> = {
    ODONTOLOGIA: '#2563eb',
    OFTALMOLOGIA: '#4f46e5',
    AUDIOMETRIA: '#0284c7',
    NUTRICAO: '#059669',
    PSICOLOGIA: '#d97706',
  };

  const dadosPizzaEspecialidades = useMemo(() => {
    return Object.keys(ESPECIALIDADE_LABELS).map((id) => ({
      id,
      rotulo: ESPECIALIDADE_LABELS[id as keyof typeof ESPECIALIDADE_LABELS],
      valor: atendimentosFiltrados.filter((a) => a.especialidade === id).length,
      corHex: CORES_HEX_ESPECIALIDADES[id] || '#64748b',
      subrotulo: `${atendimentosFiltrados.filter((a) => a.especialidade === id).length} consultas`,
    }));
  }, [atendimentosFiltrados]);

  // ─── 3. Dados para o Gráfico de Pizza/Donut de Status & Resolutividade
  const dadosPizzaStatus = useMemo(() => {
    const concluidos = atendimentosFiltrados.filter(
      (a) => a.status === 'CONCLUIDO' || !a.status
    ).length;
    const emAndamento = atendimentosFiltrados.filter((a) => a.status === 'EM_ATENDIMENTO').length;
    const filaEspera = atendimentosFiltrados.filter((a) =>
      ['AGENDADO', 'CONFIRMADO', 'AGUARDANDO'].includes(a.status || '')
    ).length;
    const canceladosFaltas = atendimentosFiltrados.filter((a) =>
      ['CANCELADO', 'FALTOU'].includes(a.status || '')
    ).length;

    return [
      { id: 'CONCLUIDO', rotulo: 'Concluído (Alta)', valor: concluidos, corHex: '#10b981', subrotulo: 'Resolvidos com sucesso' },
      { id: 'EM_ATENDIMENTO', rotulo: 'Em Atendimento', valor: emAndamento, corHex: '#3b82f6', subrotulo: 'No consultório móvel' },
      { id: 'FILA', rotulo: 'Fila / Agendados', valor: filaEspera, corHex: '#f59e0b', subrotulo: 'Em triagem ou espera' },
      { id: 'CANCELADO_FALTA', rotulo: 'Cancelados / Faltas', valor: canceladosFaltas, corHex: '#f43f5e', subrotulo: 'Desistências / absenteísmo' },
    ];
  }, [atendimentosFiltrados]);

  // ─── 4. Dados para Barras Comparativas (Turno por Dia da Semana) ─────
  const dadosComparativosTurno = useMemo(() => {
    const diasNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return diasNomes.map((dia, indice) => {
      const atendimentosDoDia = atendimentosFiltrados.filter(
        (a) => new Date(a.criadoEm).getDay() === indice
      );
      const manha = atendimentosDoDia.filter(
        (a) => (a.turno || '').toUpperCase() === 'MATUTINO' || new Date(a.criadoEm).getHours() < 12
      ).length;
      const tarde = atendimentosDoDia.filter(
        (a) => (a.turno || '').toUpperCase() === 'VESPERTINO' || new Date(a.criadoEm).getHours() >= 12
      ).length;
      return {
        categoria: dia,
        valorA: manha,
        valorB: tarde,
        rotuloA: 'Manhã',
        rotuloB: 'Tarde',
      };
    });
  }, [atendimentosFiltrados]);

  // ─── 5. Dados para o Funil Assistencial & Pipeline ──────────────────
  const etapasFunil = useMemo(() => {
    const total = atendimentosFiltrados.length;
    const confirmadosEAcima = atendimentosFiltrados.filter((a) =>
      ['CONFIRMADO', 'EM_ATENDIMENTO', 'CONCLUIDO'].includes(a.status || '')
    ).length;
    const emAtendimentoEAcima = atendimentosFiltrados.filter((a) =>
      ['EM_ATENDIMENTO', 'CONCLUIDO'].includes(a.status || '')
    ).length;
    const concluidos = atendimentosFiltrados.filter(
      (a) => a.status === 'CONCLUIDO' || !a.status
    ).length;

    return [
      { id: 'etapa1', rotulo: 'Demanda Total (Agendados)', total, corHex: '#2563eb', descricao: 'Triados para o período' },
      { id: 'etapa2', rotulo: 'Confirmados na Recepção', total: confirmadosEAcima, corHex: '#4f46e5', descricao: 'Presentes na unidade' },
      { id: 'etapa3', rotulo: 'Em Consulta no Consultório', total: emAtendimentoEAcima, corHex: '#0284c7', descricao: 'Atendimento iniciado' },
      { id: 'etapa4', rotulo: 'Consultas Finalizadas (Concluídas)', total: concluidos, corHex: '#10b981', descricao: 'Prontuário fechado' },
    ];
  }, [atendimentosFiltrados]);

  const totalCanceladosPeriodo = atendimentosFiltrados.filter((a) => a.status === 'CANCELADO').length;
  const totalFaltasPeriodo = atendimentosFiltrados.filter((a) => a.status === 'FALTOU').length;

  return (
    <div className="flex flex-1 flex-col animate-fade-in font-sans pb-10">
      <CabecalhoPagina
        titulo="Dashboard"
        subtitulo="VISÃO OPERACIONAL E INDICADORES DE ATENDIMENTO"
        fixo
      />

      {/* ─── Card 1: Visão Operacional Acumulada ───────────────────────── */}
      <div className="mb-6 rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs relative overflow-hidden">
        {/* Efeito luminoso de fundo */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-50/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-50/40 blur-3xl" />

        <section aria-label="Resumo operacional de consultas" className="relative z-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0b2545] text-white shadow-xs">
                <Layers className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-blue-700">
                    Visão Operacional Acumulada
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-100">
                    Histórico Geral
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500 font-medium">
                  Distribuição e indicadores consolidados de todo o histórico da operação itinerante
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600 border border-slate-200/80">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Todo o período histórico
              </span>
            </div>
          </div>

          {/* 4 Cards de KPI Consolidados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* 1. Total de Consultas */}
            <div className="group relative rounded-2xl border border-blue-100/90 bg-gradient-to-br from-white via-blue-50/20 to-blue-50/40 p-5 text-left shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-blue-900/70">
                    Total de Consultas
                  </span>
                  <p className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-[#0b2545]">
                    <NumeroAnimado valor={totalConsultasTodasUnidades} />
                  </p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-500/25 ring-4 ring-blue-50">
                  <Activity className="h-5 w-5 stroke-[2.2]" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-blue-100/60 text-[11px]">
                <span className="font-semibold text-slate-500">Unidades Móveis</span>
                <span className="font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md text-[10px]">
                  100% registros
                </span>
              </div>
            </div>

            {/* 2. Total Concluídas */}
            <div className="group relative rounded-2xl border border-emerald-100/90 bg-gradient-to-br from-white via-emerald-50/20 to-emerald-50/40 p-5 text-left shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-emerald-900/70">
                    Total Concluídas
                  </span>
                  <p className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-emerald-950">
                    <NumeroAnimado valor={totalConsultasConcluidas} />
                  </p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm shadow-emerald-500/25 ring-4 ring-emerald-50">
                  <ClipboardCheck className="h-5 w-5 stroke-[2.2]" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-emerald-100/60 text-[11px]">
                <span className="font-semibold text-slate-500">Atendimentos finalizados</span>
                <span className="font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md text-[10px]">
                  {totalConsultasTodasUnidades > 0 ? Math.round((totalConsultasConcluidas / totalConsultasTodasUnidades) * 100) : 0}% resolutividade
                </span>
              </div>
            </div>

            {/* 3. Total Pendentes */}
            <div className="group relative rounded-2xl border border-amber-100/90 bg-gradient-to-br from-white via-amber-50/20 to-amber-50/40 p-5 text-left shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-amber-900/70">
                    Total Pendentes
                  </span>
                  <p className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-amber-950">
                    <NumeroAnimado valor={totalConsultasPendentes} />
                  </p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm shadow-amber-500/25 ring-4 ring-amber-50">
                  <Clock3 className="h-5 w-5 stroke-[2.2]" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-amber-100/60 text-[11px]">
                <span className="font-semibold text-slate-500">Em triagem ou espera</span>
                <span className="font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md text-[10px]">
                  aguardando
                </span>
              </div>
            </div>

            {/* 4. Total Canceladas */}
            <div className="group relative rounded-2xl border border-rose-100/90 bg-gradient-to-br from-white via-rose-50/20 to-rose-50/40 p-5 text-left shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-rose-900/70">
                    Canceladas / Faltas
                  </span>
                  <p className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-rose-950">
                    <NumeroAnimado valor={totalConsultasCanceladas} />
                  </p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-sm shadow-rose-500/25 ring-4 ring-rose-50">
                  <XCircle className="h-5 w-5 stroke-[2.2]" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-rose-100/60 text-[11px]">
                <span className="font-semibold text-slate-500">Não comparecimentos</span>
                <span className="font-bold text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded-md text-[10px]">
                  desistências
                </span>
              </div>
            </div>
          </div>

          {/* ─── Pílulas de Especialidades com Identidade Visual ─── */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                Atendimentos por Especialidade Clínica
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                5 frentes de atuação SESI Saúde
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
              {totaisEspecialidades.map((especialidadeItem) => {
                const Icone = especialidadeItem.icone;
                const perc = totalConsultasTodasUnidades > 0
                  ? Math.round((especialidadeItem.total / totalConsultasTodasUnidades) * 100)
                  : 0;

                return (
                  <div
                    key={especialidadeItem.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:border-slate-300 hover:shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${especialidadeItem.fundo} ${especialidadeItem.cor} shadow-2xs`}>
                          <Icone className="h-4 w-4" />
                        </span>
                        <span className="truncate text-[11px] font-bold uppercase tracking-tight text-slate-700">
                          {especialidadeItem.nome}
                        </span>
                      </div>
                      <span className="text-lg font-black text-[#0b2545]">
                        {especialidadeItem.total}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-100">
                      <span>Participação</span>
                      <span className="font-extrabold text-slate-700">{perc}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ─── Card 2: Filtros Analíticos + Resultados da Pesquisa + Gráficos ──── */}
      <div className="mb-6 rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs flex flex-col gap-7">
        
        {/* 1. Filtros Analíticos */}
        <section aria-label="Filtros analíticos">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                <Filter className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-700">
                  Filtros Analíticos Multidimensionais
                </span>
                <p className="text-[11px] text-slate-400">Refine as consultas por período, especialidade, profissional ou unidade</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setEscola('');
                setEspecialidade('');
                setStatusFiltro('');
                setProfissional('');
                setDataInicio(`${new Date().getFullYear()}-01-01`);
                setDataFim(new Date().toISOString().slice(0, 10));
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50/70 hover:bg-rose-100/80 text-rose-600 border border-rose-100 text-[11.5px] font-bold transition-colors cursor-pointer group"
            >
              <RotateCcw className="h-3.5 w-3.5 transition-transform group-hover:-rotate-90 duration-300" />
              <span>Limpar filtros</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[145px_145px_1.2fr_1.6fr_1.5fr_1.2fr] items-center gap-3 w-full min-w-0">
            {/* 1. Data Início */}
            <label
              className="relative flex h-10 cursor-pointer items-center justify-between gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 transition-colors hover:border-slate-300 w-full min-w-0 shadow-2xs"
              onClick={(evento) => {
                evento.preventDefault();
                const input = document.getElementById('painel-analitico-data-inicio') as HTMLInputElement | null;
                input?.showPicker?.();
              }}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="shrink-0 text-slate-400 font-bold text-[11px]">De</span>
                <span className="pointer-events-none whitespace-nowrap font-medium text-slate-700 text-xs">
                  {dataInicio ? new Date(`${dataInicio}T12:00:00`).toLocaleDateString('pt-BR') : 'dd/mm/aaaa'}
                </span>
              </div>
              <CalendarDays className="pointer-events-none h-3.5 w-3.5 shrink-0 text-slate-400" />
              <input
                id="painel-analitico-data-inicio"
                type="date"
                value={dataInicio}
                onChange={(event) => {
                  setDataInicio(event.target.value);
                }}
                className="pointer-events-none absolute h-px w-px opacity-0"
                aria-label="Data inicial"
              />
            </label>

            {/* 2. Data Fim */}
            <label
              className="relative flex h-10 cursor-pointer items-center justify-between gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 transition-colors hover:border-slate-300 w-full min-w-0 shadow-2xs"
              onClick={(evento) => {
                evento.preventDefault();
                const input = document.getElementById('painel-analitico-data-fim') as HTMLInputElement | null;
                input?.showPicker?.();
              }}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="shrink-0 text-slate-400 font-bold text-[11px]">Até</span>
                <span className="pointer-events-none whitespace-nowrap font-medium text-slate-700 text-xs">
                  {dataFim ? new Date(`${dataFim}T12:00:00`).toLocaleDateString('pt-BR') : 'dd/mm/aaaa'}
                </span>
              </div>
              <CalendarDays className="pointer-events-none h-3.5 w-3.5 shrink-0 text-slate-400" />
              <input
                id="painel-analitico-data-fim"
                type="date"
                value={dataFim}
                onChange={(event) => {
                  setDataFim(event.target.value);
                }}
                className="pointer-events-none absolute h-px w-px opacity-0"
                aria-label="Data final"
              />
            </label>

            {/* 3. Especialidade */}
            <div className="w-full min-w-0">
              <SeletorFiltroUniversal
                categoria="especialidades"
                valor={especialidade}
                aoMudar={setEspecialidade}
                placeholder="Todas as especialidades"
                tamanho="sm"
                fundoBranco
                pesquisavel={false}
              />
            </div>

            {/* 4. Profissionais */}
            <div className="w-full min-w-0">
              <SeletorFiltroUniversal
                categoria="profissionais"
                valor={profissional}
                aoMudar={setProfissional}
                placeholder="Todos os profissionais"
                tamanho="sm"
                fundoBranco
                opcoes={opcoesProfissionais.map((p) => ({
                  id: p.valor,
                  valor: p.valor,
                  nome: p.rotulo,
                  rotulo: p.rotulo,
                  badge: p.especialidade ? <EspecialidadeBadge especialidade={p.especialidade as Especialidade} compacto /> : undefined,
                }))}
              />
            </div>

            {/* 5. Instituições */}
            <div className="w-full min-w-0">
              <SeletorFiltroUniversal
                categoria="instituicoes"
                valor={escola}
                aoMudar={setEscola}
                placeholder="Todas as instituições"
                tamanho="sm"
                fundoBranco
                opcoes={escolas.map((item) => ({ id: item.nome, valor: item.nome, nome: item.nome, rotulo: item.nome }))}
              />
            </div>

            {/* 6. Status */}
            <div className="w-full min-w-0">
              <SeletorFiltroUniversal
                categoria="status"
                valor={statusFiltro}
                aoMudar={setStatusFiltro}
                placeholder="Todos os status"
                tamanho="sm"
                fundoBranco
                pesquisavel={false}
              />
            </div>
          </div>
        </section>

        {/* 2. Resultados da Pesquisa */}
        <section aria-label="Resultados da pesquisa" className="pt-2 border-t border-slate-100">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#0b2545]">
                  Resultados do Intervalo Selecionado
                </h2>
                <p className="text-[11px] text-slate-400">Métricas em tempo real para os parâmetros filtrados</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700 border border-blue-100">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              {atendimentosFiltrados.length} no período • {periodoLabel}
            </span>
          </div>

          {/* Indicadores resumidos do período filtrado */}
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              { rotulo: 'Consultas no período', valor: atendimentosFiltrados.length, detalhe: periodoLabel, icone: Activity, cor: 'text-blue-600', fundo: 'bg-blue-50', borda: 'border-blue-100' },
              { rotulo: 'Especialidades ativas', valor: dadosPizzaEspecialidades.filter((item) => item.valor > 0).length, detalhe: 'com registros ativos', icone: BarChart3, cor: 'text-indigo-600', fundo: 'bg-indigo-50', borda: 'border-indigo-100' },
              { rotulo: 'Profissionais ativos', valor: rankingProfissionais.length, detalhe: 'com registro no período', icone: UsersRound, cor: 'text-amber-600', fundo: 'bg-amber-50', borda: 'border-amber-100' },
              { rotulo: 'Unidades atendidas', valor: rankingUnidades.length, detalhe: 'escolas contempladas', icone: Building2, cor: 'text-emerald-600', fundo: 'bg-emerald-50', borda: 'border-emerald-100' },
            ].map((indicador) => {
              const Icone = indicador.icone;
              return (
                <div key={indicador.rotulo} className={`rounded-2xl border ${indicador.borda} bg-gradient-to-br from-white to-slate-50/40 p-4 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-xs`}>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">{indicador.rotulo}</span>
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${indicador.fundo} ${indicador.cor} shadow-2xs`}>
                      <Icone className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-black leading-none text-[#0b2545]">{indicador.valor}</p>
                  <p className="mt-1.5 text-[11px] font-medium text-slate-400">{indicador.detalhe}</p>
                </div>
              );
            })}
          </div>

          {/* Distribuição por status com Cores Semânticas Oficiais */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5">
            {contagemStatus.map((item) => {
              let estiloStatus = {
                borda: 'border-slate-200/80',
                fundo: 'bg-slate-50/70',
                texto: 'text-slate-700',
                badge: 'bg-slate-200/80 text-slate-600',
              };

              if (item.id === StatusAtendimento.AGENDADO) {
                estiloStatus = {
                  borda: 'border-blue-200/80',
                  fundo: 'bg-gradient-to-b from-white to-blue-50/40',
                  texto: 'text-blue-950',
                  badge: 'bg-blue-100/70 text-blue-700',
                };
              } else if (item.id === StatusAtendimento.CONFIRMADO) {
                estiloStatus = {
                  borda: 'border-teal-200/80',
                  fundo: 'bg-gradient-to-b from-white to-teal-50/40',
                  texto: 'text-teal-950',
                  badge: 'bg-teal-100/70 text-teal-700',
                };
              } else if (item.id === StatusAtendimento.EM_ATENDIMENTO) {
                estiloStatus = {
                  borda: 'border-amber-200/80',
                  fundo: 'bg-gradient-to-b from-white to-amber-50/40',
                  texto: 'text-amber-950',
                  badge: 'bg-amber-100/70 text-amber-700',
                };
              } else if (item.id === StatusAtendimento.CONCLUIDO) {
                estiloStatus = {
                  borda: 'border-emerald-200/80',
                  fundo: 'bg-gradient-to-b from-white to-emerald-50/40',
                  texto: 'text-emerald-950',
                  badge: 'bg-emerald-100/70 text-emerald-700',
                };
              } else if (item.id === StatusAtendimento.CANCELADO) {
                estiloStatus = {
                  borda: 'border-rose-200/80',
                  fundo: 'bg-gradient-to-b from-white to-rose-50/40',
                  texto: 'text-rose-950',
                  badge: 'bg-rose-100/70 text-rose-700',
                };
              } else if (item.id === StatusAtendimento.FALTOU) {
                estiloStatus = {
                  borda: 'border-slate-300/80',
                  fundo: 'bg-gradient-to-b from-white to-slate-100/60',
                  texto: 'text-slate-800',
                  badge: 'bg-slate-200/80 text-slate-700',
                };
              }

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border ${estiloStatus.borda} ${estiloStatus.fundo} p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                      {item.nome}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${estiloStatus.badge}`}>
                      status
                    </span>
                  </div>
                  <p className={`mt-2 text-2xl font-black ${estiloStatus.texto}`}>{item.total}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400 font-medium">registros</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Gráficos e Inteligência Analítica Multidimensional */}
        <section aria-label="Gráficos e análises" className="pt-4 border-t border-slate-100 space-y-6">
          
          {/* GRÁFICO 1: LINHA DO TEMPO CRONOLÓGICA (Tendência Diária e Curva Suave Bézier) */}
          <GraficoLinhaDoTempo
            titulo="Evolução Cronológica de Atendimentos"
            subtitulo="Linha do tempo diária com tendência móvel, média assistencial e identificação de picos"
            pontos={pontosLinhaDoTempo}
            altura={250}
          />

          {/* GRÁFICO 2: GRÁFICOS DE PIZZA / DONUT (Especialidades Clínicas + Resolutividade de Status) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <GraficoPizzaDonut
              titulo="Distribuição por Especialidade"
              subtitulo="Proporção e volume clínico por área de saúde itinerante"
              dados={dadosPizzaEspecialidades}
              iconeCabecalho={<PieChart className="h-4 w-4 text-white" />}
              rotuloCentroPadrao="Especialidades"
              subrotuloCentroPadrao="no período"
            />
            <GraficoPizzaDonut
              titulo="Resolutividade & Status Clínico"
              subtitulo="Taxa de consultas concluídas vs atendimentos ativos e absenteísmo"
              dados={dadosPizzaStatus}
              iconeCabecalho={<CheckCircle2 className="h-4 w-4 text-emerald-300" />}
              rotuloCentroPadrao="Eficácia"
              subrotuloCentroPadrao="resolutividade"
            />
          </div>

          {/* GRÁFICO 3: BARRAS COMPARATIVAS (Turnos) + FUNIL DE CONVERSÃO ASSISTENCIAL */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <GraficoBarrasComparativas
              titulo="Comparativo de Turnos por Dia da Semana"
              subtitulo="Volume matutino (manhã) vs vespertino (tarde) por dia"
              dados={dadosComparativosTurno}
            />
            <GraficoFunilAssistencial
              titulo="Funil de Conversão Assistencial"
              subtitulo="Pipeline clínico do agendamento à conclusão com monitoramento de evasão"
              etapas={etapasFunil}
              totalCancelados={totalCanceladosPeriodo}
              totalFaltas={totalFaltasPeriodo}
            />
          </div>

          {/* Curva Horária de Atendimento e Saturação */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/30 p-5 sm:p-6 shadow-2xs">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200/70 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <Flame className="h-4 w-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#0b2545]">Curva Horária & Saturação Diurna</h3>
                  <p className="text-[11px] text-slate-400">Distribuição dos atendimentos por faixa horária ao longo do expediente</p>
                </div>
              </div>
              <span className="rounded-xl bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-200">
                {horaDePico ? `Horário de Pico: ${horaDePico.hora}` : 'Sem dados'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="rounded-xl border border-blue-100 bg-white p-3.5 shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-800">Dia de Pico</span>
                <p className="mt-1 text-xl font-black text-[#0b2545]">{diaDePico?.dia || '-'}</p>
                <p className="text-[10px] text-blue-600 font-medium">maior frequência na semana</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-white p-3.5 shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-800">Média Diária</span>
                <p className="mt-1 text-xl font-black text-[#0b2545]">
                  {consultasPorDia.length ? (atendimentosFiltrados.length / consultasPorDia.length).toFixed(1) : '0'}
                </p>
                <p className="text-[10px] text-emerald-600 font-medium">consultas por dia de ação</p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-white p-3.5 shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-amber-800">Pico Horário</span>
                <p className="mt-1 text-xl font-black text-[#0b2545]">{horaDePico ? horaDePico.hora : '-'}</p>
                <p className="text-[10px] text-amber-600 font-medium">{horaDePico ? `${horaDePico.total} atendimentos` : 'sem dados'}</p>
              </div>
            </div>

            {atendimentosFiltrados.length ? (
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <div className="flex h-14 items-end gap-1.5 pt-2">
                  {horas.map((item) => (
                    <div
                      key={item.hora}
                      className="flex-1 rounded-t-md bg-gradient-to-t from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 transition-colors cursor-pointer group relative"
                      style={{ height: `${Math.max((item.total / maiorHora) * 100, item.total ? 14 : 4)}%` }}
                    >
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-900 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.total}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 flex justify-between text-[10px] font-bold text-slate-400 border-t border-slate-100 pt-1.5">
                  {horas.map((item) => (
                    <span key={item.hora}>{item.hora}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-xs font-medium text-slate-400">
                Nenhuma consulta registrada nas faixas de horário do período
              </div>
            )}
          </div>

          {/* Ranking de Profissionais + Distribuição por Unidade */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Ranking de profissionais */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/30 p-5 sm:p-6 shadow-2xs">
              <div className="mb-5 flex items-center justify-between border-b border-slate-200/70 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                    <Trophy className="h-4 w-4 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#0b2545]">Ranking de Profissionais</h3>
                    <p className="text-[11px] text-slate-400">Profissionais com maior número de registros no período</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3.5">
                {rankingProfissionais.length ? (
                  rankingProfissionais.map(([nome, total], indice) => {
                    let badgeEstilo = 'bg-slate-100 text-slate-600 border-slate-200';
                    if (indice === 0) badgeEstilo = 'bg-amber-100 text-amber-900 border-amber-300 font-black';
                    else if (indice === 1) badgeEstilo = 'bg-slate-200 text-slate-800 border-slate-300 font-bold';
                    else if (indice === 2) badgeEstilo = 'bg-amber-50 text-amber-800 border-amber-200 font-bold';

                    return (
                      <div key={nome} className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
                        <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-700">
                          <span className="flex items-center gap-2 min-w-0">
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${badgeEstilo}`}>
                              {indice + 1}
                            </span>
                            <span className="truncate uppercase">{nome}</span>
                          </span>
                          <span className="font-extrabold text-[#0b2545] shrink-0 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 text-xs">
                            {total} consultas
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                            style={{ width: `${(total / rankingProfissionais[0][1]) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="py-8 text-center text-xs text-slate-400 font-medium">Nenhum profissional com registro no período.</p>
                )}
              </div>
            </div>

            {/* Distribuição por unidade */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/30 p-5 sm:p-6 shadow-2xs">
              <div className="mb-5 flex items-center justify-between border-b border-slate-200/70 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#0b2545]">Distribuição por Unidade</h3>
                    <p className="text-[11px] text-slate-400">Escolas e polos educacionais atendidos</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3.5">
                {rankingUnidades.length ? (
                  rankingUnidades.map(([nome, total]) => (
                    <div key={nome} className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
                      <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex min-w-0 items-center gap-2 truncate">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          <span className="truncate">{nome}</span>
                        </span>
                        <span className="font-extrabold text-emerald-950 shrink-0 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 text-xs">
                          {total} atendimentos
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                          style={{ width: `${(total / rankingUnidades[0][1]) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-xs text-slate-400 font-medium">Nenhuma unidade escolar com registro no período.</p>
                )}
              </div>
            </div>
          </div>

          {/* Alertas operacionais e Governança LGPD */}
          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-50/70 via-white to-slate-50/70 p-5 sm:p-6 shadow-2xs">
            <div className="mb-3 flex items-center justify-between border-b border-slate-200/70 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#0b2545]">Alertas Operacionais & Governança Clínica</h3>
                  <p className="text-[11px] text-slate-400">Conformidade e acompanhamento de termos de consentimento</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10.5px] font-bold text-emerald-700 border border-emerald-100">
                <CheckCircle2 className="h-3 w-3" />
                LGPD Art. 46
              </span>
            </div>
            {pacientes.filter((paciente) => paciente.termoConsentimentoStatus === 'PENDENTE').length > 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-xs font-medium text-amber-900 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <strong>Consentimentos pendentes:</strong> existem <span className="font-black text-amber-950 underline">{pacientes.filter((paciente) => paciente.termoConsentimentoStatus === 'PENDENTE').length} pacientes</span> aguardando regularização do termo de consentimento dos responsáveis.
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-medium text-emerald-900 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <strong>Conformidade Plena:</strong> Todos os pacientes cadastrados possuem seus respectivos termos de consentimento devidamente validados e arquivados no prontuário eletrônico.
                </div>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

import { type FC, useState, useEffect, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  Apple,
  BarChart3,
  Brain,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  Ear,
  Eye,
  MapPin,
  RotateCcw,
  Smile,
  TrendingUp,
  UsersRound,
  XCircle,
} from 'lucide-react';
import { ESPECIALIDADE_LABELS, STATUS_ATENDIMENTO_LABELS, StatusAtendimento, type Especialidade } from '../../compartilhado/index.ts';
import { CabecalhoPagina } from '../componentes/CabecalhoPagina.tsx';
import { EspecialidadeBadge } from '../componentes/EspecialidadeVisual.tsx';
import { SeletorFiltroUniversal } from '../componentes/Modal.tsx';
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

const CORES_ESPECIALIDADES = ['bg-blue-600', 'bg-indigo-600', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500'];

export const PainelAnalitico: FC<PainelAnaliticoProps> = ({ atendimentos, pacientes, escolas }) => {
  const [dataInicio, setDataInicio] = useState(() => `${new Date().getFullYear()}-01-01`);
  const [dataFim, setDataFim] = useState(() => new Date().toISOString().slice(0, 10));
  const [statusFiltro, setStatusFiltro] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [profissional, setProfissional] = useState('');
  const [escola, setEscola] = useState('');
  const [profissionaisSaude, setProfissionaisSaude] = useState<Array<{ id: string; nome: string; especialidade?: string | null }>>([]);

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
    atendimentos.forEach((a) => {
      if (a.profissionalNome && a.profissionalNome.trim() && !mapaNomes.has(a.profissionalNome.trim())) {
        mapaNomes.set(a.profissionalNome.trim(), {
          valor: a.profissionalNome.trim(),
          rotulo: a.profissionalNome.trim(),
        });
      }
    });

    return Array.from(mapaNomes.values()).sort((a, b) => a.rotulo.localeCompare(b.rotulo));
  }, [profissionaisSaude, atendimentos]);

  const atendimentosFiltrados = atendimentos.filter((atendimento) => {
    const data = atendimento.criadoEm.slice(0, 10);
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

  const totalConsultasTodasUnidades = atendimentos.length;
  const totalConsultasConcluidas = atendimentos.filter((atendimento) =>
    (atendimento.status === 'CONCLUIDO' || !atendimento.status)
  ).length;
  const totalConsultasPendentes = atendimentos.filter((atendimento) =>
    ['AGENDADO', 'CONFIRMADO', 'EM_ATENDIMENTO', 'PENDENTE'].includes(atendimento.status || '')
  ).length;
  const totalConsultasCanceladas = atendimentos.filter((atendimento) =>
    ['CANCELADO', 'FALTOU', 'CANCELADA'].includes(atendimento.status || '')
  ).length;
  const indicadores = [
    { rotulo: 'Total de consultas', valor: totalConsultasTodasUnidades, detalhe: 'em todas as unidades', icone: Activity, cor: 'text-blue-700', fundo: 'bg-blue-50' },
    { rotulo: 'Total concluídas', valor: totalConsultasConcluidas, detalhe: 'atendimentos finalizados', icone: ClipboardCheck, cor: 'text-emerald-700', fundo: 'bg-emerald-50' },
    { rotulo: 'Total pendentes', valor: totalConsultasPendentes, detalhe: 'aguardando ou em andamento', icone: Clock3, cor: 'text-amber-700', fundo: 'bg-amber-50' },
    { rotulo: 'Total canceladas', valor: totalConsultasCanceladas, detalhe: 'cancelamentos e faltas', icone: XCircle, cor: 'text-rose-700', fundo: 'bg-rose-50' },
  ];
  const totaisEspecialidades = [
    { id: 'ODONTOLOGIA', nome: 'Odontologia', icone: Smile, cor: 'text-blue-600', fundo: 'bg-blue-50' },
    { id: 'OFTALMOLOGIA', nome: 'Oftalmologia', icone: Eye, cor: 'text-indigo-600', fundo: 'bg-indigo-50' },
    { id: 'AUDIOMETRIA', nome: 'Audiometria', icone: Ear, cor: 'text-sky-600', fundo: 'bg-sky-50' },
    { id: 'NUTRICAO', nome: 'Nutrição', icone: Apple, cor: 'text-emerald-600', fundo: 'bg-emerald-50' },
    { id: 'PSICOLOGIA', nome: 'Psicologia', icone: Brain, cor: 'text-amber-600', fundo: 'bg-amber-50' },
  ].map((especialidadeItem) => ({
    ...especialidadeItem,
    total: atendimentos.filter((atendimento) => atendimento.especialidade === especialidadeItem.id).length,
  }));

  const contagemEspecialidades = Object.keys(ESPECIALIDADE_LABELS).map((id, indice) => ({
    id,
    nome: ESPECIALIDADE_LABELS[id as keyof typeof ESPECIALIDADE_LABELS],
    total: atendimentosFiltrados.filter((atendimento) => atendimento.especialidade === id).length,
    cor: CORES_ESPECIALIDADES[indice],
  }));
  const maiorEspecialidade = Math.max(...contagemEspecialidades.map((item) => item.total), 1);
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
  const maiorDia = Math.max(...consultasPorDia.map((item) => item.total), 1);
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

  return (
    <div className="flex flex-1 flex-col animate-fade-in font-sans">
      <CabecalhoPagina
        titulo="Dashboard"
        subtitulo="VISÃO OPERACIONAL E INDICADORES DE ATENDIMENTO"
        fixo
      />

      {/* ─── Card 1: Visão Operacional Acumulada ───────────────────────── */}
      <div className="mb-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        {/* Resumo Operacional */}
        <section aria-label="Resumo operacional de consultas">
          <div className="mb-4 flex items-end justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Resumo operacional
              </span>
              <p className="mt-1 text-[11px] text-slate-400">Distribuição acumulada de consultas</p>
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-slate-400">Todo o período</span>
          </div>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {indicadores.map((indicador) => {
              const Icone = indicador.icone;
              return (
                <div
                  key={indicador.rotulo}
                  className="rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                        {indicador.rotulo}
                      </p>
                      <p className="mt-1.5 text-3xl font-extrabold leading-none text-[#0b2545]">
                        <NumeroAnimado valor={indicador.valor} />
                      </p>
                    </div>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${indicador.fundo} ${indicador.cor}`}>
                      <Icone className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-[10px] font-medium text-slate-400">{indicador.detalhe}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
            {totaisEspecialidades.map((especialidadeItem) => {
              const Icone = especialidadeItem.icone;
              return (
                <div key={especialidadeItem.id} className="flex items-center justify-between gap-1.5 rounded-lg border border-slate-200/80 bg-white px-2.5 py-2 transition-colors hover:bg-slate-50">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${especialidadeItem.fundo} ${especialidadeItem.cor}`}>
                      <Icone className="h-3 w-3" />
                    </span>
                    <span className="truncate text-[9px] font-bold uppercase tracking-[0.04em] text-slate-500">{especialidadeItem.nome}</span>
                  </div>
                  <span className="text-base font-extrabold leading-none text-[#0b2545]">{especialidadeItem.total}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ─── Card 2: Filtros Analíticos + Resultados da Pesquisa + Gráficos ──── */}
      <div className="mb-5 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-6">
        
        {/* 1. Filtros Analíticos */}
        <section aria-label="Filtros analíticos">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Filtros analíticos
            </span>
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
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 transition-colors hover:text-rose-600 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Limpar filtros
            </button>
          </div>

          {/* Ordem solicitada: data, especialidade, profissionais, instituições, status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[140px_140px_1.2fr_1.6fr_1.5fr_1.2fr] items-center gap-2.5 w-full min-w-0">
            {/* 1. Data Início */}
            <label
              className="relative flex h-10 cursor-pointer items-center justify-between gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 transition-colors hover:border-slate-300 w-full min-w-0 shadow-2xs"
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
              className="relative flex h-10 cursor-pointer items-center justify-between gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 transition-colors hover:border-slate-300 w-full min-w-0 shadow-2xs"
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
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b2545]">
                Resultados da pesquisa
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {atendimentosFiltrados.length} no período • {periodoLabel}
            </span>
          </div>

          {/* Indicadores resumidos do período filtrado */}
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { rotulo: 'Consultas no período', valor: atendimentosFiltrados.length, detalhe: periodoLabel, icone: Activity, cor: 'text-blue-600', fundo: 'bg-blue-50' },
              { rotulo: 'Especialidades ativas', valor: contagemEspecialidades.filter((item) => item.total > 0).length, detalhe: 'com registros', icone: BarChart3, cor: 'text-indigo-600', fundo: 'bg-indigo-50' },
              { rotulo: 'Profissionais ativos', valor: rankingProfissionais.length, detalhe: 'com registro no período', icone: UsersRound, cor: 'text-amber-600', fundo: 'bg-amber-50' },
              { rotulo: 'Unidades atendidas', valor: rankingUnidades.length, detalhe: 'com registro no período', icone: Building2, cor: 'text-emerald-600', fundo: 'bg-emerald-50' },
            ].map((indicador) => {
              const Icone = indicador.icone;
              return (
                <div key={indicador.rotulo} className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 shadow-2xs transition-all hover:bg-white hover:shadow-xs">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{indicador.rotulo}</span>
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${indicador.fundo} ${indicador.cor}`}>
                      <Icone className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-extrabold leading-none text-[#0b2545]">{indicador.valor}</p>
                  <p className="mt-1 text-[11px] font-medium text-slate-400">{indicador.detalhe}</p>
                </div>
              );
            })}
          </div>

          {/* Distribuição por status */}
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
            {contagemStatus.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition-colors hover:bg-slate-50">
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{item.nome}</p>
                <p className="mt-2 text-2xl font-extrabold text-[#0b2545]">{item.total}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">registros</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Gráficos e Distribuições */}
        <section aria-label="Gráficos e análises" className="pt-2 border-t border-slate-100 space-y-5">
          {/* Consultas por Especialidade */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/30 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b2545]">Consultas por especialidade</h3>
              </div>
              <span className="text-[11px] text-slate-400">{periodoLabel}</span>
            </div>
            {atendimentosFiltrados.length ? (
              <div className="space-y-3.5">
                {contagemEspecialidades.map((item) => (
                  <div key={item.id}>
                    <div className="mb-1 flex justify-between text-xs font-semibold text-slate-700">
                      <span>{item.nome}</span>
                      <span>{item.total}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`${item.cor} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${(item.total / maiorEspecialidade) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-xs font-medium text-slate-400">
                Nenhuma consulta no período selecionado.
              </div>
            )}
          </div>

          {/* Linha Temporal + Análise de Demanda */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Linha temporal */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/30 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b2545]">Linha temporal</h3>
                </div>
                <span className="text-[11px] text-slate-400">{periodoLabel}</span>
              </div>
              {atendimentosFiltrados.length ? (
                <div className="flex h-44 items-end gap-2 border-b border-slate-100 px-2 pb-2">
                  {consultasPorDia.map((item) => (
                    <div key={item.dia} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                      <span className="text-[10px] font-bold text-slate-500">{item.total || ''}</span>
                      <div
                        className="w-full rounded-t-lg bg-blue-500 transition-all duration-500"
                        style={{ height: `${Math.max((item.total / maiorDia) * 100, item.total ? 8 : 2)}%` }}
                      />
                      <span className="text-[10px] font-semibold text-slate-400">{item.dia}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-xs font-medium text-slate-400">
                  Sem dados para montar a linha temporal.
                </div>
              )}
            </div>

            {/* Análise de demanda */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/30 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Activity className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b2545]">Análise de demanda</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">Dia de pico</p>
                  <p className="mt-2 text-lg font-extrabold text-[#0b2545]">{diaDePico?.dia || '-'}</p>
                  <p className="mt-1 text-[10px] text-blue-700">maior volume no período</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">Média diária</p>
                  <p className="mt-2 text-lg font-extrabold text-[#0b2545]">
                    {consultasPorDia.length ? (atendimentosFiltrados.length / consultasPorDia.length).toFixed(1) : '0'}
                  </p>
                  <p className="mt-1 text-[10px] text-emerald-700">consultas por dia</p>
                </div>
                <div className="col-span-2 rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                  <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
                    <span>Demanda por horário</span>
                    <span>{horaDePico ? `Pico: ${horaDePico.hora}` : 'Sem dados'}</span>
                  </div>
                  {atendimentosFiltrados.length ? (
                    <div className="flex h-10 items-end gap-1">
                      {horas.map((item) => (
                        <div
                          key={item.hora}
                          className="flex-1 rounded-t bg-amber-400"
                          style={{ height: `${Math.max((item.total / maiorHora) * 100, item.total ? 12 : 3)}%` }}
                          title={`${item.hora}: ${item.total}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-10 items-center justify-center text-[10px] text-amber-700">
                      Nenhuma consulta no período
                    </div>
                  )}
                  <div className="mt-1 flex justify-between text-[9px] text-amber-700">
                    <span>08h</span>
                    <span>12h</span>
                    <span>17h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ranking de Profissionais + Distribuição por Unidade */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Ranking de profissionais */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/30 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <UsersRound className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b2545]">Ranking de profissionais</h3>
              </div>
              <div className="space-y-3">
                {rankingProfissionais.length ? (
                  rankingProfissionais.map(([nome, total], indice) => (
                    <div key={nome}>
                      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span><b className="mr-2 text-slate-400">{indice + 1}</b>{nome}</span>
                        <span>{total}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${(total / rankingProfissionais[0][1]) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-5 text-center text-xs text-slate-400">Nenhum profissional com registro no período.</p>
                )}
              </div>
            </div>

            {/* Distribuição por unidade */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/30 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building2 className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b2545]">Distribuição por unidade</h3>
              </div>
              <div className="space-y-3">
                {rankingUnidades.length ? (
                  rankingUnidades.map(([nome, total]) => (
                    <div key={nome}>
                      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span className="flex min-w-0 items-center gap-1.5 truncate">
                          <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                          {nome}
                        </span>
                        <span>{total}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${(total / rankingUnidades[0][1]) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-5 text-center text-xs text-slate-400">Nenhuma unidade com registro no período.</p>
                )}
              </div>
            </div>
          </div>

          {/* Alertas operacionais */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/30 p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b2545]">Alertas operacionais</h3>
            </div>
            {pacientes.filter((paciente) => paciente.termoConsentimentoStatus === 'PENDENTE').length > 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                <strong>Consentimentos pendentes:</strong> existem {pacientes.filter((paciente) => paciente.termoConsentimentoStatus === 'PENDENTE').length} pacientes aguardando regularização.
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
                Nenhum alerta operacional pendente no momento.
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

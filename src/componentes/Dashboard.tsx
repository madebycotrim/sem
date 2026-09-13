import { type FC, useEffect, useState } from 'react';

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
import { CabecalhoPagina } from './CabecalhoPagina.tsx';
import { Activity, Apple, ArrowUpRight, BarChart3, ClipboardCheck, Clock3, Ear, Eye, FileText, Lightbulb, Brain, Smile, UserPlus, XCircle } from 'lucide-react';
import type { ItemFila } from './FilaDoDia.tsx';

export interface DashboardProps {
  totalPacientes: number;
  totalAtendimentos: number;
  totalInstituicoes: number;
  pacientes: Array<{
    termoConsentimentoStatus: string;
    criadoEm: string;
  }>;
  atendimentos: Array<{
    especialidade: string;
    criadoEm: string;
    status?: string;
    pacienteNome?: string;
    profissionalNome?: string;
    turno?: string;
  }>;
  fila?: ItemFila[];
  carregando?: boolean;
  aoNovoPaciente: () => void;
  aoNovoAtendimento: () => void;
  aoAbrirAtendimentos: () => void;
  aoAbrirRelatorios: () => void;
  aoAbrirBi?: () => void;
}

export const Dashboard: FC<DashboardProps> = ({
  totalAtendimentos,
  pacientes: _pacientes,
  atendimentos,
  fila = [],
  carregando = false,
  aoNovoPaciente,
  aoNovoAtendimento,
  aoAbrirAtendimentos,
  aoAbrirRelatorios,
  aoAbrirBi,
}) => {
  const hojeIso = new Date().toISOString().slice(0, 10);
  const hojeBr = new Date().toLocaleDateString('pt-BR');

  // Atendimentos do banco de hoje
  const atendimentosHojeBanco = atendimentos.filter(
    (atendimento) => (atendimento.criadoEm || '').slice(0, 10) === hojeIso
  );

  // Itens da fila do dia de hoje
  const itensFilaHoje = fila.filter(
    (item) => (item.dataChegada || hojeBr) === hojeBr
  );

  // Identificadores de atendimentos já persistidos para evitar dupla contagem
  const idsAtendimentosBanco = new Set(atendimentos.map((a: any) => a.id));

  // Itens da fila não duplicados no banco
  const itensFilaNaoDuplicados = itensFilaHoje.filter(
    (item) => !item.atendimentoId || !idsAtendimentosBanco.has(item.atendimentoId)
  );

  // Lista unificada e reativa das consultas e atendimentos de hoje
  const todasConsultasHoje = [
    ...atendimentosHojeBanco.map((a) => ({
      especialidade: a.especialidade,
      status: a.status || 'CONCLUIDO',
      criadoEm: a.criadoEm,
    })),
    ...itensFilaNaoDuplicados.map((f) => ({
      especialidade: f.especialidade,
      status: f.status,
      criadoEm: f.dataChegada || hojeIso,
    })),
  ];

  const totalConsultasTodasUnidades = todasConsultasHoje.length;
  const totalConsultasConcluidas = todasConsultasHoje.filter((item) =>
    (item.status === 'CONCLUIDO' || !item.status)
  ).length;
  const totalConsultasPendentes = todasConsultasHoje.filter((item) =>
    ['AGUARDANDO', 'CONFIRMADO', 'EM_ATENDIMENTO', 'AGENDADO', 'PENDENTE'].includes(item.status || '')
  ).length;
  const totalConsultasCanceladas = todasConsultasHoje.filter((item) =>
    ['CANCELADO', 'FALTOU', 'CANCELADA'].includes(item.status || '')
  ).length;

  const taxaConclusao = totalConsultasTodasUnidades > 0
    ? Math.round((totalConsultasConcluidas / totalConsultasTodasUnidades) * 100)
    : 0;
  const taxaCanceladas = totalConsultasTodasUnidades > 0
    ? Math.round((totalConsultasCanceladas / totalConsultasTodasUnidades) * 100)
    : 0;

  const nomesEspecialidades: Record<string, string> = {
    ODONTOLOGIA: 'Odontologia',
    OFTALMOLOGIA: 'Oftalmologia',
    AUDIOMETRIA: 'Audiometria',
    NUTRICAO: 'Nutrição',
    PSICOLOGIA: 'Psicologia',
  };
  const atendimentosRecentes = [...atendimentos]
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
    .slice(0, 5);

  const especialidadesTotal = [
    {
      id: 'ODONTOLOGIA',
      nome: 'Odontologia',
      descricao: 'Saúde Bucal',
      icone: Smile,
      corTexto: 'text-blue-600',
      corFundoIcone: 'bg-blue-50/90 text-blue-600 border-blue-200/80',
      corBordaHover: 'hover:border-blue-300 hover:shadow-blue-500/10',
      corGradiente: 'from-blue-500 to-cyan-500',
      corBarra: 'bg-blue-500',
    },
    {
      id: 'OFTALMOLOGIA',
      nome: 'Oftalmologia',
      descricao: 'Saúde Visual',
      icone: Eye,
      corTexto: 'text-indigo-600',
      corFundoIcone: 'bg-indigo-50/90 text-indigo-600 border-indigo-200/80',
      corBordaHover: 'hover:border-indigo-300 hover:shadow-indigo-500/10',
      corGradiente: 'from-indigo-500 to-purple-500',
      corBarra: 'bg-indigo-500',
    },
    {
      id: 'AUDIOMETRIA',
      nome: 'Audiometria',
      descricao: 'Saúde Auditiva',
      icone: Ear,
      corTexto: 'text-sky-600',
      corFundoIcone: 'bg-sky-50/90 text-sky-600 border-sky-200/80',
      corBordaHover: 'hover:border-sky-300 hover:shadow-sky-500/10',
      corGradiente: 'from-sky-500 to-teal-500',
      corBarra: 'bg-sky-500',
    },
    {
      id: 'NUTRICAO',
      nome: 'Nutrição',
      descricao: 'Alimentação & Saúde',
      icone: Apple,
      corTexto: 'text-emerald-600',
      corFundoIcone: 'bg-emerald-50/90 text-emerald-600 border-emerald-200/80',
      corBordaHover: 'hover:border-emerald-300 hover:shadow-emerald-500/10',
      corGradiente: 'from-emerald-500 to-teal-500',
      corBarra: 'bg-emerald-500',
    },
    {
      id: 'PSICOLOGIA',
      nome: 'Psicologia',
      descricao: 'Saúde Mental',
      icone: Brain,
      corTexto: 'text-amber-600',
      corFundoIcone: 'bg-amber-50/90 text-amber-600 border-amber-200/80',
      corBordaHover: 'hover:border-amber-300 hover:shadow-amber-500/10',
      corGradiente: 'from-amber-500 to-orange-500',
      corBarra: 'bg-amber-500',
    },
  ].map((especialidade) => {
    const total = todasConsultasHoje.filter(
      (item) => item.especialidade === especialidade.id
    ).length;
    const percentual = totalConsultasTodasUnidades > 0
      ? Math.round((total / totalConsultasTodasUnidades) * 100)
      : 0;
    return {
      ...especialidade,
      total,
      percentual,
    };
  });

  const indicadoresKpi = [
    {
      rotulo: 'TOTAL DE CONSULTAS',
      valor: totalConsultasTodasUnidades,
      detalhe: 'Todas as unidades hoje',
      badge: 'Consolidado',
      icone: Activity,
      corTexto: 'text-blue-600',
      corIcone: 'bg-gradient-to-br from-blue-50 to-blue-100/70 text-blue-600 border-blue-200/80 ring-blue-500/5',
      corGradienteTopo: 'from-blue-500 via-sky-500 to-indigo-500',
      corHover: 'hover:border-blue-300 hover:shadow-blue-500/10',
      corGlow: 'bg-blue-500/[0.03] group-hover:bg-blue-500/[0.07]',
      corBadge: 'bg-blue-50 text-blue-700 border-blue-200/60',
      aoClicar: aoAbrirAtendimentos,
      linkTexto: 'Ver consultas',
    },
    {
      rotulo: 'CONCLUÍDAS',
      valor: totalConsultasConcluidas,
      detalhe: 'Atendimentos finalizados',
      badge: totalConsultasTodasUnidades > 0 ? `${taxaConclusao}% do dia` : 'Finalizadas',
      icone: ClipboardCheck,
      corTexto: 'text-emerald-600',
      corIcone: 'bg-gradient-to-br from-emerald-50 to-emerald-100/70 text-emerald-600 border-emerald-200/80 ring-emerald-500/5',
      corGradienteTopo: 'from-emerald-500 to-teal-500',
      corHover: 'hover:border-emerald-300 hover:shadow-emerald-500/10',
      corGlow: 'bg-emerald-500/[0.03] group-hover:bg-emerald-500/[0.07]',
      corBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      aoClicar: aoAbrirAtendimentos,
      linkTexto: 'Filtrar finalizadas',
    },
    {
      rotulo: 'EM ANDAMENTO',
      valor: totalConsultasPendentes,
      detalhe: 'Em atendimento ou fila',
      badge: 'Tempo real',
      temPulso: true,
      icone: Clock3,
      corTexto: 'text-amber-600',
      corIcone: 'bg-gradient-to-br from-amber-50 to-amber-100/70 text-amber-600 border-amber-200/80 ring-amber-500/5',
      corGradienteTopo: 'from-amber-500 to-orange-500',
      corHover: 'hover:border-amber-300 hover:shadow-amber-500/10',
      corGlow: 'bg-amber-500/[0.03] group-hover:bg-amber-500/[0.07]',
      corBadge: 'bg-amber-50 text-amber-700 border-amber-200/60',
      aoClicar: aoAbrirAtendimentos,
      linkTexto: 'Acompanhar fila',
    },
    {
      rotulo: 'CANCELADOS',
      valor: totalConsultasCanceladas,
      detalhe: 'Cancelamentos e faltas',
      badge: totalConsultasTodasUnidades > 0 ? `${taxaCanceladas}% taxa` : 'Sem faltas',
      icone: XCircle,
      corTexto: 'text-rose-600',
      corIcone: 'bg-gradient-to-br from-rose-50 to-rose-100/70 text-rose-600 border-rose-200/80 ring-rose-500/5',
      corGradienteTopo: 'from-rose-500 to-pink-500',
      corHover: 'hover:border-rose-300 hover:shadow-rose-500/10',
      corGlow: 'bg-rose-500/[0.03] group-hover:bg-rose-500/[0.07]',
      corBadge: 'bg-rose-50 text-rose-700 border-rose-200/60',
      aoClicar: undefined,
      linkTexto: undefined,
    },
  ];

  return (
    <div className="flex flex-col flex-1 animate-fade-in font-sans">
      {/* ─── Cabeçalho Fixo Modular ───────────────────────────────────────── */}
      <CabecalhoPagina
        titulo="Página Inicial"
        subtitulo="INDICADORES DO DIA E GESTÃO CLÍNICA — CATRAKI & SESI SAÚDE"
        fixo={true}
      />

      {/* ─── Cards de Resumo Operacional ─────────────────────────────────── */}
      <section className="mb-6" aria-label="Resumo operacional de consultas">
        <div className="mb-2.5 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Resumo operacional do dia
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Em tempo real
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Hoje</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {indicadoresKpi.map((indicador) => {
            const Icone = indicador.icone;
            return (
              <button
                key={indicador.rotulo}
                type="button"
                onClick={indicador.aoClicar}
                disabled={!indicador.aoClicar}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4.5 text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:shadow-xs ${indicador.corHover}`}
              >
                {/* Linha de acento de gradiente superior */}
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${indicador.corGradienteTopo}`} />

                {/* Brilho suave de fundo no canto superior direito */}
                <div className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl transition-all duration-300 ${indicador.corGlow}`} />

                {/* Topo do card: Rótulo e Ícone */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      {indicador.rotulo}
                    </span>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      {carregando ? (
                        <div className="h-8 w-14 animate-pulse rounded-lg bg-slate-200" />
                      ) : (
                        <span className="text-3xl font-extrabold tracking-tight text-[#0b2545] tabular-nums">
                          <NumeroAnimado valor={indicador.valor} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ícone com styling elegante */}
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-2xs ring-4 transition-transform duration-300 group-hover:scale-105 ${indicador.corIcone}`}>
                    <Icone className="h-5 w-5" />
                  </span>
                </div>

                {/* Rodapé do card: Detalhe e Ação/Badge */}
                <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px]">
                  <span className="truncate font-medium text-slate-500">
                    {indicador.detalhe}
                  </span>

                  {indicador.aoClicar ? (
                    <span className="inline-flex shrink-0 items-center gap-1 font-bold text-blue-600 transition-transform group-hover:translate-x-0.5">
                      <span>{indicador.linkTexto}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${indicador.corBadge}`}>
                      {indicador.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── Cards de Consultas por Especialidade ─────────────────────────── */}
      <section className="mb-6" aria-label="Consultas por especialidade hoje">
        <div className="mb-2.5 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Consultas por Especialidade
            </span>
            <span className="rounded-full border border-slate-200/80 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              5 Especialidades
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            Distribuição do dia
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
          {especialidadesTotal.map((especialidade) => {
            const Icone = especialidade.icone;
            return (
              <button
                key={especialidade.id}
                type="button"
                onClick={aoAbrirAtendimentos}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${especialidade.corBordaHover}`}
              >
                {/* Linha sutil de destaque no topo que acende no hover */}
                <div className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r ${especialidade.corGradiente} opacity-0 transition-opacity duration-200 group-hover:opacity-100`} />

                {/* Cabeçalho: Ícone e Título da Especialidade */}
                <div className="flex items-center gap-2.5">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-2xs transition-transform duration-300 group-hover:scale-105 ${especialidade.corFundoIcone}`}>
                    <Icone className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800 transition-colors group-hover:text-[#0b2545]">
                      {especialidade.nome}
                    </p>
                    <p className="truncate text-[10px] font-medium text-slate-400">
                      {especialidade.descricao}
                    </p>
                  </div>
                </div>

                {/* Métricas e Barra de Progresso */}
                <div className="mt-3">
                  <div className="flex items-baseline justify-between">
                    {carregando ? (
                      <div className="h-7 w-8 animate-pulse rounded bg-slate-200" />
                    ) : (
                      <span className="text-2xl font-extrabold tracking-tight text-[#0b2545] tabular-nums">
                        <NumeroAnimado valor={especialidade.total} />
                      </span>
                    )}
                    <span className="text-[10.5px] font-semibold text-slate-400">
                      {especialidade.percentual}% do dia
                    </span>
                  </div>

                  {/* Barra de Distribuição */}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${especialidade.corBarra}`}
                      style={{
                        width: `${especialidade.total > 0 ? Math.max(especialidade.percentual, 10) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── Seção Central: Ações Rápidas & Status da Operação ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5">
        {/* Ações Rápidas (7 Colunas) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-[#0b2545] uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <span>Ações Rápidas do Sistema</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Atalhos Operacionais</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
              <button
                type="button"
                onClick={aoNovoPaciente}
                className="p-4 rounded-2xl border border-blue-200/90 bg-gradient-to-br from-blue-50/60 to-white hover:from-blue-100/70 hover:to-blue-50/40 text-left transition-all cursor-pointer group shadow-2xs active:scale-[0.99]"
              >
                <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-2.5 shadow-2xs group-hover:scale-105 transition-transform">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-blue-900 group-hover:text-blue-700">
                  Cadastrar paciente
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Registre os dados escolares, o consentimento e as informações essenciais do paciente.
                </p>
                <span className="inline-block mt-2.5 text-[10.5px] font-bold text-blue-600">
                  Abrir cadastro →
                </span>
              </button>

              <button
                type="button"
                onClick={aoNovoAtendimento}
                className="p-4 rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/60 to-white hover:from-emerald-100/70 hover:to-emerald-50/40 text-left transition-all cursor-pointer group shadow-2xs active:scale-[0.99]"
              >
                <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-2.5 shadow-2xs group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-emerald-900 group-hover:text-emerald-700">
                  Registrar atendimento
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Documente a consulta, os procedimentos realizados e os encaminhamentos necessários.
                </p>
                <span className="inline-block mt-2.5 text-[10.5px] font-bold text-emerald-600">
                  Preencher ficha →
                </span>
              </button>

              <button
                type="button"
                onClick={aoAbrirBi ?? aoAbrirRelatorios}
                className="p-4 rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/60 to-white hover:from-indigo-100/70 hover:to-indigo-50/40 text-left transition-all cursor-pointer group shadow-2xs active:scale-[0.99]"
              >
                <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-2.5 shadow-2xs group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-indigo-900 group-hover:text-indigo-700">
                  Explorar dashboard
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Acompanhe indicadores, tendências e a distribuição dos atendimentos em uma visão completa.
                </p>
                <span className="inline-block mt-2.5 text-[10.5px] font-bold text-indigo-600">
                  Abrir dashboard →
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* Atividade recente */}
        <button type="button" onClick={aoAbrirAtendimentos} className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 text-left shadow-xs flex flex-col justify-between transition-shadow hover:shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-[#0b2545] uppercase tracking-wider flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-blue-600" />
                <span>Atividade recente</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Últimos registros</span>
            </div>

            <div className="mt-2 space-y-2">
              {atendimentosRecentes.length > 0 ? atendimentosRecentes.map((atendimento) => (
                <div key={`${atendimento.criadoEm}-${atendimento.pacienteNome}`} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/80 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-700">{atendimento.pacienteNome || 'Paciente'}</p>
                    <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">
                      {nomesEspecialidades[atendimento.especialidade] || atendimento.especialidade}
                      {atendimento.profissionalNome ? ` · ${atendimento.profissionalNome}` : ''}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold text-slate-500">
                    {new Date(atendimento.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )) : (
                <div className="flex min-h-[138px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 text-center">
                  <p className="text-xs font-semibold text-slate-600">Ainda não há atendimentos hoje.</p>
                  <p className="mt-1 text-[10px] font-medium text-slate-400">Use a ação “Registrar atendimento” para iniciar os registros.</p>
                  <span className="mt-3 text-[10px] font-bold text-blue-600">Ver histórico completo →</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Total consolidado</span>
            <span className="font-mono font-bold text-[#0b2545]">{totalAtendimentos} fichas</span>
          </div>
        </button>
      </div>
    </div>
  );
};

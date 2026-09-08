import { type FC, useState, useEffect, useMemo, useRef } from 'react';
import {
  Activity,
  AlertTriangle,
  Apple,
  BarChart3,
  Brain,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Ear,
  Eye,
  Filter,
  MapPin,
  RefreshCw,
  Smile,
  TrendingUp,
  UsersRound,
  XCircle,
} from 'lucide-react';
import { ESPECIALIDADE_LABELS, STATUS_ATENDIMENTO_LABELS, StatusAtendimento, TURNO_LABELS } from '../../compartilhado/index.ts';
import { CabecalhoPagina } from '../componentes/CabecalhoPagina.tsx';
import { SeletorFiltroUniversal } from '../componentes/Modal.tsx';

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

const SeletorData: FC<{
  rotulo: string;
  valor: string;
  onChange: (novaData: string) => void;
}> = ({ rotulo, valor, onChange }) => {
  const refInput = useRef<HTMLInputElement>(null);

  const alterarDia = (incremento: number) => {
    if (!valor) return;
    const [ano, mes, dia] = valor.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);
    data.setDate(data.getDate() + incremento);
    const novoAno = data.getFullYear();
    const novoMes = String(data.getMonth() + 1).padStart(2, '0');
    const novoDia = String(data.getDate()).padStart(2, '0');
    onChange(`${novoAno}-${novoMes}-${novoDia}`);
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{rotulo}</span>
      <div className="relative inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-xs transition-colors hover:border-slate-300">
        <button
          type="button"
          onClick={() => alterarDia(-1)}
          className="relative z-10 flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          title="Dia anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          className="relative flex cursor-pointer items-center gap-2 px-1"
          onClick={() => refInput.current?.showPicker?.()}
        >
          <span className="text-xs font-semibold text-slate-700 select-none">
            {formatarDataBr(valor)}
          </span>
          <Calendar className="h-4 w-4 text-slate-400" />
          <input
            ref={refInput}
            type="date"
            value={valor}
            onChange={(e) => e.target.value && onChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </div>

        <button
          type="button"
          onClick={() => alterarDia(1)}
          className="relative z-10 flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          title="Próximo dia"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
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
  const hoje = new Date().toISOString().slice(0, 10);
  const [dataInicio, setDataInicio] = useState(hoje);
  const [dataFim, setDataFim] = useState(hoje);
  const [especialidade, setEspecialidade] = useState('');
  const [profissional, setProfissional] = useState('');
  const [escola, setEscola] = useState('');

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

  const especialidadesTotal = [
    { id: 'ODONTOLOGIA', nome: 'Odontologia', icone: Smile, cor: 'text-blue-600', fundo: 'bg-blue-50' },
    { id: 'OFTALMOLOGIA', nome: 'Oftalmologia', icone: Eye, cor: 'text-indigo-600', fundo: 'bg-indigo-50' },
    { id: 'AUDIOMETRIA', nome: 'Audiometria', icone: Ear, cor: 'text-sky-600', fundo: 'bg-sky-50' },
    { id: 'NUTRICAO', nome: 'Nutrição', icone: Apple, cor: 'text-emerald-600', fundo: 'bg-emerald-50' },
    { id: 'PSICOLOGIA', nome: 'Psicologia', icone: Brain, cor: 'text-amber-600', fundo: 'bg-amber-50' },
  ].map((item) => ({
    ...item,
    total: atendimentos.filter((atendimento) => atendimento.especialidade === item.id).length,
  }));

  const opcoesProfissionais = useMemo(() => {
    const lista = Array.from(
      new Set(
        atendimentos
          .map((a) => a.profissionalNome)
          .filter((nome): nome is string => Boolean(nome && nome.trim()))
      )
    ).sort((a, b) => a.localeCompare(b));
    return lista.map((nome) => ({ valor: nome, rotulo: nome }));
  }, [atendimentos]);

  const atendimentosFiltrados = atendimentos.filter((atendimento) => {
    const data = atendimento.criadoEm.slice(0, 10);
    const dentroDataInicio = !dataInicio || data >= dataInicio;
    const dentroDataFim = !dataFim || data <= dataFim;
    return dentroDataInicio && dentroDataFim &&
      (!especialidade || atendimento.especialidade === especialidade) &&
      (!profissional || atendimento.profissionalNome === profissional) &&
      (!escola || atendimento.escolaNome === escola);
  });

  const contagemEspecialidades = Object.keys(ESPECIALIDADE_LABELS).map((id, indice) => ({
    id,
    nome: ESPECIALIDADE_LABELS[id as keyof typeof ESPECIALIDADE_LABELS],
    total: atendimentosFiltrados.filter((atendimento) => atendimento.especialidade === id).length,
    cor: CORES_ESPECIALIDADES[indice],
  }));
  const contagemTurnos = Object.keys(TURNO_LABELS).map((id) => ({
    id,
    nome: TURNO_LABELS[id as keyof typeof TURNO_LABELS],
    total: atendimentosFiltrados.filter((atendimento) => atendimento.turno === id).length,
  }));
  const maiorEspecialidade = Math.max(...contagemEspecialidades.map((item) => item.total), 1);
  const maiorTurno = Math.max(...contagemTurnos.map((item) => item.total), 1);
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
  const diaDePico = consultasPorDia.reduce((pico, item) => item.total > pico.total ? item : pico, consultasPorDia[0]);
  const horas = Array.from({ length: 10 }, (_, indice) => indice + 8).map((hora) => ({
    hora: `${String(hora).padStart(2, '0')}h`,
    total: atendimentosFiltrados.filter((atendimento) => new Date(atendimento.criadoEm).getHours() === hora).length,
  }));
  const maiorHora = Math.max(...horas.map((item) => item.total), 1);
  const contagemStatus = Object.keys(STATUS_ATENDIMENTO_LABELS).map((status) => ({
    id: status as StatusAtendimento,
    nome: STATUS_ATENDIMENTO_LABELS[status as StatusAtendimento],
    total: atendimentosFiltrados.filter((atendimento) => (atendimento.status || StatusAtendimento.CONCLUIDO) === status).length,
  }));

  return (
    <div className="flex flex-1 flex-col animate-fade-in font-sans">
      <CabecalhoPagina
        titulo="Painel Analítico"
        subtitulo="VISÃO OPERACIONAL E INDICADORES DE ATENDIMENTO"
        fixo
      />

      {/* ─── Card em Destaque: Visão Operacional Acumulada ─────────────────── */}
      <div className="mb-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        {/* Resumo Operacional */}
        <section aria-label="Resumo operacional de consultas" className="mb-5">
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Resumo operacional
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              {
                rotulo: 'TOTAL DE CONSULTAS',
                valor: totalConsultasTodasUnidades,
                detalhe: 'todas as unidades',
                icone: Activity,
                cor: 'text-blue-600',
                fundo: 'bg-blue-50',
              },
              {
                rotulo: 'TOTAL DE CONSULTAS CONCLUÍDAS',
                valor: totalConsultasConcluidas,
                detalhe: 'atendimentos finalizados',
                icone: ClipboardCheck,
                cor: 'text-emerald-600',
                fundo: 'bg-emerald-50',
              },
              {
                rotulo: 'TOTAL DE CONSULTAS PENDENTES',
                valor: totalConsultasPendentes,
                detalhe: 'em andamento ou aguardando',
                icone: Clock3,
                cor: 'text-amber-600',
                fundo: 'bg-amber-50',
              },
              {
                rotulo: 'TOTAL DE CONSULTAS CANCELADAS',
                valor: totalConsultasCanceladas,
                detalhe: 'cancelamentos e faltas',
                icone: XCircle,
                cor: 'text-rose-600',
                fundo: 'bg-rose-50',
              },
            ].map((indicador) => {
              const Icone = indicador.icone;
              return (
                <div
                  key={indicador.rotulo}
                  className="flex min-h-[92px] items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      {indicador.rotulo}
                    </p>
                    <p className="mt-1 text-2xl font-extrabold leading-none text-[#0b2545]">
                      <NumeroAnimado valor={indicador.valor} />
                    </p>
                    <p className="mt-1 text-[10px] font-medium text-slate-400">{indicador.detalhe}</p>
                  </div>
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${indicador.fundo} ${indicador.cor}`}
                  >
                    <Icone className="h-5 w-5" />
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Consultas por Especialidade */}
        <section aria-label="Consultas por especialidade total">
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Consultas por especialidade
            </span>
            <span className="text-[11px] font-semibold text-slate-400">Total acumulado</span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {especialidadesTotal.map((especialidadeItem) => {
              const Icone = especialidadeItem.icone;
              return (
                <div
                  key={especialidadeItem.id}
                  className="flex min-h-[116px] flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      {especialidadeItem.nome}
                    </span>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${especialidadeItem.fundo} ${especialidadeItem.cor}`}
                    >
                      <Icone className="h-4 w-4" />
                    </span>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold leading-none text-[#0b2545]">
                      <NumeroAnimado valor={especialidadeItem.total} />
                    </p>
                    <p className="mt-1 text-[10px] font-medium text-slate-400">total de consultas</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#0b2545]">Filtros analíticos</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setDataInicio(hoje);
              setDataFim(hoje);
              setEspecialidade('');
              setProfissional('');
              setEscola('');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-blue-700"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Limpar filtros
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <SeletorData rotulo="DE" valor={dataInicio} onChange={setDataInicio} />
            <SeletorData rotulo="A" valor={dataFim} onChange={setDataFim} />
          </div>
          <div className="min-w-[180px] flex-1">
            <SeletorFiltroUniversal
              categoria="especialidades"
              valor={especialidade}
              aoMudar={setEspecialidade}
              placeholder="Todas as especialidades"
            />
          </div>
          <div className="min-w-[180px] flex-1">
            <SeletorFiltroUniversal
              categoria="profissionais"
              valor={profissional}
              aoMudar={setProfissional}
              placeholder="Todos os profissionais"
              opcoes={opcoesProfissionais.map((p) => ({ id: p.valor, valor: p.valor, nome: p.rotulo, rotulo: p.rotulo }))}
            />
          </div>
          <div className="min-w-[180px] flex-1">
            <SeletorFiltroUniversal
              categoria="instituicoes"
              valor={escola}
              aoMudar={setEscola}
              placeholder="Todas as instituições"
              opcoes={escolas.map((item) => ({ id: item.nome, valor: item.nome, nome: item.nome, rotulo: item.nome }))}
            />
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { rotulo: 'Consultas no período', valor: atendimentosFiltrados.length, detalhe: periodoLabel, icone: Activity, cor: 'text-blue-600', fundo: 'bg-blue-50' },
          { rotulo: 'Especialidades ativas', valor: contagemEspecialidades.filter((item) => item.total > 0).length, detalhe: 'com registros', icone: BarChart3, cor: 'text-indigo-600', fundo: 'bg-indigo-50' },
          { rotulo: 'Pacientes pendentes', valor: pacientes.filter((paciente) => paciente.termoConsentimentoStatus === 'PENDENTE').length, detalhe: 'consentimento', icone: UsersRound, cor: 'text-amber-600', fundo: 'bg-amber-50' },
          { rotulo: 'Instituições', valor: escolas.length, detalhe: 'cadastradas', icone: TrendingUp, cor: 'text-emerald-600', fundo: 'bg-emerald-50' },
        ].map((indicador) => {
          const Icone = indicador.icone;
          return <div key={indicador.rotulo} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"><div className="flex items-start justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{indicador.rotulo}</span><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${indicador.fundo} ${indicador.cor}`}><Icone className="h-4 w-4" /></span></div><p className="mt-3 text-3xl font-extrabold leading-none text-[#0b2545]">{indicador.valor}</p><p className="mt-1 text-[11px] font-medium text-slate-400">{indicador.detalhe}</p></div>;
        })}
      </div>

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3"><Activity className="h-4 w-4 text-blue-600" /><h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b2545]">Status do atendimento</h2></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {contagemStatus.map((item) => <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"><p className="truncate text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{item.nome}</p><p className="mt-2 text-2xl font-extrabold text-[#0b2545]">{item.total}</p></div>)}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-3">
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3"><div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-blue-600" /><h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b2545]">Consultas por especialidade</h2></div><span className="text-[11px] text-slate-400">{periodoLabel}</span></div>
          <div className="space-y-4">{contagemEspecialidades.map((item) => <div key={item.id}><div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-700"><span>{item.nome}</span><span>{item.total}</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`${item.cor} h-full rounded-full transition-all duration-500`} style={{ width: `${(item.total / maiorEspecialidade) * 100}%` }} /></div></div>)}</div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3"><Clock3 className="h-4 w-4 text-blue-600" /><h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b2545]">Distribuição por turno</h2></div>
          <div className="space-y-5">{contagemTurnos.map((item) => <div key={item.id}><div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-700"><span>{item.nome}</span><span>{item.total}</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${(item.total / maiorTurno) * 100}%` }} /></div></div>)}</div>
        </section>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-blue-600" /><h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b2545]">Linha temporal</h2></div>
            <span className="text-[11px] text-slate-400">{periodoLabel}</span>
          </div>
          <div className="flex h-44 items-end gap-2 border-b border-slate-100 px-2 pb-2">
            {consultasPorDia.map((item) => (
              <div key={item.dia} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[10px] font-bold text-slate-500">{item.total || ''}</span>
                <div className="w-full rounded-t-lg bg-blue-500 transition-all duration-500" style={{ height: `${Math.max((item.total / maiorDia) * 100, item.total ? 8 : 2)}%` }} />
                <span className="text-[10px] font-semibold text-slate-400">{item.dia}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3"><Activity className="h-4 w-4 text-blue-600" /><h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b2545]">Análise de demanda</h2></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">Dia de pico</p><p className="mt-2 text-lg font-extrabold text-[#0b2545]">{diaDePico?.dia || '-'}</p><p className="mt-1 text-[10px] text-blue-700">maior volume no período</p></div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">Média diária</p><p className="mt-2 text-lg font-extrabold text-[#0b2545]">{consultasPorDia.length ? (atendimentosFiltrados.length / consultasPorDia.length).toFixed(1) : '0'}</p><p className="mt-1 text-[10px] text-emerald-700">consultas por dia</p></div>
            <div className="col-span-2 rounded-xl border border-amber-100 bg-amber-50/60 p-4"><div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700"><span>Demanda por horário</span><span>Pico: {horas.reduce((pico, item) => item.total > pico.total ? item : pico, horas[0]).hora}</span></div><div className="flex h-10 items-end gap-1">{horas.map((item) => <div key={item.hora} className="flex-1 rounded-t bg-amber-400" style={{ height: `${Math.max((item.total / maiorHora) * 100, item.total ? 12 : 3)}%` }} title={`${item.hora}: ${item.total}`} />)}</div><div className="mt-1 flex justify-between text-[9px] text-amber-700"><span>08h</span><span>12h</span><span>17h</span></div></div>
          </div>
        </section>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3"><UsersRound className="h-4 w-4 text-blue-600" /><h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b2545]">Ranking de profissionais</h2></div>
          <div className="space-y-3">{rankingProfissionais.length ? rankingProfissionais.map(([nome, total], indice) => <div key={nome}><div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-700"><span><b className="mr-2 text-slate-400">{indice + 1}</b>{nome}</span><span>{total}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${(total / rankingProfissionais[0][1]) * 100}%` }} /></div></div>) : <p className="py-5 text-center text-xs text-slate-400">Nenhum profissional com registro no período.</p>}</div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3"><Building2 className="h-4 w-4 text-blue-600" /><h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b2545]">Distribuição por unidade</h2></div>
          <div className="space-y-3">{rankingUnidades.length ? rankingUnidades.map(([nome, total]) => <div key={nome}><div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-700"><span className="flex min-w-0 items-center gap-1.5 truncate"><MapPin className="h-3 w-3 shrink-0 text-slate-400" />{nome}</span><span>{total}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${(total / rankingUnidades[0][1]) * 100}%` }} /></div></div>) : <p className="py-5 text-center text-xs text-slate-400">Nenhuma unidade com registro no período.</p>}</div>
        </section>
      </div>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3"><AlertTriangle className="h-4 w-4 text-amber-500" /><h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b2545]">Alertas operacionais</h2></div>
        {pacientes.filter((paciente) => paciente.termoConsentimentoStatus === 'PENDENTE').length > 0 ? <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800"><strong>Consentimentos pendentes:</strong> existem {pacientes.filter((paciente) => paciente.termoConsentimentoStatus === 'PENDENTE').length} pacientes aguardando regularização.</div> : <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">Nenhum alerta operacional pendente no momento.</div>}
      </section>
    </div>
  );
};

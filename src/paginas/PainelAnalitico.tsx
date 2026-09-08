import { type FC, useState } from 'react';
import { Activity, AlertTriangle, BarChart3, Building2, Clock3, Filter, MapPin, RefreshCw, TrendingUp, UsersRound } from 'lucide-react';
import { ESPECIALIDADE_LABELS, STATUS_ATENDIMENTO_LABELS, StatusAtendimento, TURNO_LABELS } from '../../compartilhado/index.ts';
import { CabecalhoPagina } from '../componentes/CabecalhoPagina.tsx';
import { SelectModal } from '../componentes/Modal.tsx';

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
  const [periodo, setPeriodo] = useState('hoje');
  const [especialidade, setEspecialidade] = useState('');
  const [turno, setTurno] = useState('');
  const [escola, setEscola] = useState('');

  const inicioPeriodo = new Date();
  if (periodo === '7') inicioPeriodo.setDate(inicioPeriodo.getDate() - 6);
  if (periodo === '30') inicioPeriodo.setDate(inicioPeriodo.getDate() - 29);
  const inicioIso = periodo === 'todos' ? '' : inicioPeriodo.toISOString().slice(0, 10);

  const atendimentosFiltrados = atendimentos.filter((atendimento) => {
    const data = atendimento.criadoEm.slice(0, 10);
    return (!inicioIso || data >= inicioIso) &&
      (!especialidade || atendimento.especialidade === especialidade) &&
      (!turno || atendimento.turno === turno) &&
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
  const periodoLabel = periodo === 'hoje' ? 'Hoje' : periodo === '7' ? 'Últimos 7 dias' : periodo === '30' ? 'Últimos 30 dias' : 'Todo o período';
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

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#0b2545]">Filtros analíticos</span>
          </div>
          <button type="button" onClick={() => { setPeriodo('hoje'); setEspecialidade(''); setTurno(''); setEscola(''); }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-blue-700">
            <RefreshCw className="h-3.5 w-3.5" /> Limpar filtros
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <SelectModal value={periodo} onChange={(evento) => setPeriodo(evento.target.value)} opcoes={[
            { valor: 'hoje', rotulo: 'Hoje' },
            { valor: '7', rotulo: 'Últimos 7 dias' },
            { valor: '30', rotulo: 'Últimos 30 dias' },
            { valor: 'todos', rotulo: 'Todo o período' },
          ]} />
          <SelectModal value={especialidade} onChange={(evento) => setEspecialidade(evento.target.value)} placeholder="Todas as especialidades" opcoes={Object.entries(ESPECIALIDADE_LABELS).map(([valor, rotulo]) => ({ valor, rotulo }))} />
          <SelectModal value={turno} onChange={(evento) => setTurno(evento.target.value)} placeholder="Todos os turnos" opcoes={Object.entries(TURNO_LABELS).map(([valor, rotulo]) => ({ valor, rotulo }))} />
          <SelectModal value={escola} onChange={(evento) => setEscola(evento.target.value)} placeholder="Todas as instituições" opcoes={escolas.map((item) => ({ valor: item.nome, rotulo: item.nome }))} />
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

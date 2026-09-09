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
import { Activity, Apple, BarChart3, ClipboardCheck, Clock3, Ear, Eye, FileText, Lightbulb, Brain, Smile, UserPlus, XCircle } from 'lucide-react';

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
  carregando = false,
  aoNovoPaciente,
  aoNovoAtendimento,
  aoAbrirAtendimentos,
  aoAbrirRelatorios,
  aoAbrirBi,
}) => {
  const hojeIso = new Date().toISOString().slice(0, 10);
  const atendimentosHoje = atendimentos.filter(
    (atendimento) => atendimento.criadoEm.slice(0, 10) === hojeIso
  );

  const totalConsultasTodasUnidades = atendimentosHoje.length;
  const totalConsultasConcluidas = atendimentosHoje.filter((atendimento) =>
    (atendimento.status === 'CONCLUIDO' || !atendimento.status)
  ).length;
  const totalConsultasPendentes = atendimentosHoje.filter((atendimento) =>
    ['AGENDADO', 'CONFIRMADO', 'EM_ATENDIMENTO', 'PENDENTE'].includes(atendimento.status || '')
  ).length;
  const totalConsultasCanceladas = atendimentosHoje.filter((atendimento) =>
    ['CANCELADO', 'FALTOU', 'CANCELADA'].includes(atendimento.status || '')
  ).length;

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
    { id: 'ODONTOLOGIA', nome: 'Odontologia', icone: Smile, cor: 'text-blue-600', fundo: 'bg-blue-50' },
    { id: 'OFTALMOLOGIA', nome: 'Oftalmologia', icone: Eye, cor: 'text-indigo-600', fundo: 'bg-indigo-50' },
    { id: 'AUDIOMETRIA', nome: 'Audiometria', icone: Ear, cor: 'text-sky-600', fundo: 'bg-sky-50' },
    { id: 'NUTRICAO', nome: 'Nutrição', icone: Apple, cor: 'text-emerald-600', fundo: 'bg-emerald-50' },
    { id: 'PSICOLOGIA', nome: 'Psicologia', icone: Brain, cor: 'text-amber-600', fundo: 'bg-amber-50' },
  ].map((especialidade) => ({
    ...especialidade,
    total: atendimentosHoje.filter(
      (atendimento) => atendimento.especialidade === especialidade.id
    ).length,
  }));

  return (
    <div className="flex flex-col flex-1 animate-fade-in font-sans">
      {/* ─── Cabeçalho Fixo Modular ───────────────────────────────────────── */}
      <CabecalhoPagina
        titulo="Página Inicial"
        subtitulo="INDICADORES DO DIA E GESTÃO CLÍNICA — CATRAKI & SESI SAÚDE"
        fixo={true}
      />

      <section className="mb-5" aria-label="Resumo operacional de consultas">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Resumo operacional do dia</span>
          <span className="text-[11px] font-semibold text-slate-400">Hoje</span>
        </div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            {
              rotulo: 'TOTAL DE CONSULTAS',
              valor: totalConsultasTodasUnidades,
              detalhe: 'todas as unidades hoje',
              icone: Activity,
              cor: 'text-blue-600',
              fundo: 'bg-blue-50',
              aoClicar: aoAbrirAtendimentos,
            },
            {
              rotulo: 'CONCLUÍDA',
              valor: totalConsultasConcluidas,
              detalhe: 'atendimentos finalizados hoje',
              icone: ClipboardCheck,
              cor: 'text-emerald-600',
              fundo: 'bg-emerald-50',
            },
            {
              rotulo: 'EM ANDAMENTO',
              valor: totalConsultasPendentes,
              detalhe: 'em andamento ou aguardando',
              icone: Clock3,
              cor: 'text-amber-600',
              fundo: 'bg-amber-50',
              aoClicar: aoAbrirAtendimentos,
            },
            {
              rotulo: 'CANCELADO',
              valor: totalConsultasCanceladas,
              detalhe: 'cancelamentos e faltas hoje',
              icone: XCircle,
              cor: 'text-rose-600',
              fundo: 'bg-rose-50',
            },
          ].map((indicador) => {
            const Icone = indicador.icone;
            return (
              <button key={indicador.rotulo} type="button" onClick={indicador.aoClicar} disabled={!indicador.aoClicar} className="flex min-h-[92px] items-center justify-between rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-left shadow-xs transition-shadow hover:shadow-sm disabled:cursor-default">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{indicador.rotulo}</p>
                  <p className={carregando ? 'mt-1 h-7 w-10 animate-pulse rounded-md bg-slate-200' : 'mt-1 text-2xl font-extrabold leading-none text-[#0b2545]'}>{carregando ? '' : <NumeroAnimado valor={indicador.valor} />}</p>
                  <p className="mt-1 text-[10px] font-medium text-slate-400">{indicador.detalhe}</p>
                </div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${indicador.fundo} ${indicador.cor}`}>
                  <Icone className="h-5 w-5" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-3" aria-label="Consultas por especialidade hoje">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
          {especialidadesTotal.map((especialidade) => {
            const Icone = especialidade.icone;
            return (
              <div key={especialidade.id} className="group flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${especialidade.fundo} ${especialidade.cor}`}>
                  <Icone className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[9px] font-bold uppercase tracking-[0.07em] text-slate-500">{especialidade.nome}</p>
                </div>
                <span className={carregando ? 'h-6 w-6 animate-pulse rounded-md bg-slate-200' : 'text-2xl font-extrabold leading-none text-[#0b2545]'}>
                  {carregando ? '' : <NumeroAnimado valor={especialidade.total} />}
                </span>
              </div>
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
                  Explorar painel analítico
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Acompanhe indicadores, tendências e a distribuição dos atendimentos em uma visão completa.
                </p>
                <span className="inline-block mt-2.5 text-[10.5px] font-bold text-indigo-600">
                  Abrir painel →
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

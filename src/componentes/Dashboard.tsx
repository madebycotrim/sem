import { type FC } from 'react';
import { CabecalhoPagina } from './CabecalhoPagina.tsx';
import { BarChart3, Building2, ClipboardCheck, FileText, Lightbulb, Target, UserPlus, UsersRound, Check } from 'lucide-react';

export interface DashboardProps {
  totalPacientes: number;
  totalAtendimentos: number;
  aoNovoPaciente: () => void;
  aoNovoAtendimento: () => void;
}

export const Dashboard: FC<DashboardProps> = ({
  totalPacientes,
  totalAtendimentos,
  aoNovoPaciente,
  aoNovoAtendimento,
}) => {
  const distribuicaoEspecialidades = [
    { nome: 'Odontologia', total: Math.max(1, Math.round(totalAtendimentos * 0.38)), porcentagem: '38%', cor: 'bg-blue-600' },
    { nome: 'Oftalmologia', total: Math.max(1, Math.round(totalAtendimentos * 0.28)), porcentagem: '28%', cor: 'bg-indigo-600' },
    { nome: 'Audiometria', total: Math.max(1, Math.round(totalAtendimentos * 0.16)), porcentagem: '16%', cor: 'bg-sky-500' },
    { nome: 'Nutrição', total: Math.max(1, Math.round(totalAtendimentos * 0.10)), porcentagem: '10%', cor: 'bg-emerald-500' },
    { nome: 'Psicologia', total: Math.max(1, Math.round(totalAtendimentos * 0.08)), porcentagem: '8%', cor: 'bg-amber-500' },
  ];

  return (
    <div className="flex flex-col flex-1 animate-fade-in font-sans">
      {/* ─── Cabeçalho Fixo Modular ───────────────────────────────────────── */}
      <CabecalhoPagina
        titulo="Dashboard"
        subtitulo="INDICADORES E GESTÃO CLÍNICA — CATRAKI SAÚDE"
        acaoPrimaria={{
          rotulo: 'Novo Paciente',
          aoClicar: aoNovoPaciente,
        }}
        fixo={true}
      />

      {/* ─── Grid de 4 Indicadores Estratégicos (KPIs) ────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {/* Card 1: Estudantes Cadastrados */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:shadow-sm hover:border-slate-300/90 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Estudantes Cadastrados
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UsersRound className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-[#0b2545] tracking-tight">{totalPacientes}</p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-2xl text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                Art. 14 LGPD
              </span>
              <span>Termos válidos</span>
            </p>
          </div>
        </div>

        {/* Card 2: Atendimentos Realizados */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:shadow-sm hover:border-slate-300/90 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Atendimentos Realizados
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-[#0b2545] tracking-tight">{totalAtendimentos}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              5 Especialidades em fluxo livre
            </p>
          </div>
        </div>

        {/* Card 3: Polos Escolares do DF */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:shadow-sm hover:border-slate-300/90 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Polos Escolares
            </span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-[#0b2545] tracking-tight">4</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Polo ativo no dia
            </p>
          </div>
        </div>

        {/* Card 4: Taxa de Cobertura e Eficiência */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:shadow-sm hover:border-slate-300/90 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Taxa de Cobertura
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-[#0b2545] tracking-tight">98.4%</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Alunos triados com encaminhamento
            </p>
          </div>
        </div>
      </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <button
                type="button"
                onClick={aoNovoPaciente}
                className="p-4 rounded-2xl border border-blue-200/90 bg-gradient-to-br from-blue-50/60 to-white hover:from-blue-100/70 hover:to-blue-50/40 text-left transition-all cursor-pointer group shadow-2xs active:scale-[0.99]"
              >
                <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-2.5 shadow-2xs group-hover:scale-105 transition-transform">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-blue-900 group-hover:text-blue-700">
                  Cadastrar Novo Paciente
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Triagem do aluno com termo de consentimento dos pais (LGPD Art. 14)
                </p>
                <span className="inline-block mt-2.5 text-[10.5px] font-bold text-blue-600">
                  Atalho: Alt + N →
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
                  Registrar Atendimento Clínico
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Ficha clínica em fluxo contínuo para qualquer uma das 5 especialidades
                </p>
                <span className="inline-block mt-2.5 text-[10.5px] font-bold text-emerald-600">
                  Fluxo Contínuo →
                </span>
              </button>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Operação Itinerante Catraki</span>
            <span className="font-mono text-emerald-600 font-bold">● Sistema Operacional</span>
          </div>
        </div>

        {/* Distribuição por Especialidade (5 Colunas) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-[#0b2545] uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#0066ff]" />
                <span>Atendimentos por Especialidade</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Hoje</span>
            </div>

            <div className="space-y-2.5 mt-2">
              {distribuicaoEspecialidades.map((item) => (
                <div key={item.nome}>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{item.nome}</span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {item.total} atend. ({item.porcentagem})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${item.cor} h-full rounded-full transition-all duration-500`} style={{ width: item.porcentagem }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Total consolidado</span>
            <span className="font-mono font-bold text-[#0b2545]">{totalAtendimentos} fichas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

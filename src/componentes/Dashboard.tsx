import { type FC } from 'react';
import { CabecalhoPagina } from './CabecalhoPagina.tsx';

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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-[#0b2545] tracking-tight">{totalPacientes}</p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-2xl text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <svg className="w-2.5 h-2.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="m9 14 2 2 4-4" />
              </svg>
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-4" />
                <path d="M9 9h1" />
                <path d="M9 13h1" />
              </svg>
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="2" />
              </svg>
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
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
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
                <svg className="w-4 h-4 text-[#0066ff]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 20V10" />
                  <path d="M18 20V4" />
                  <path d="M6 20v-4" />
                </svg>
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

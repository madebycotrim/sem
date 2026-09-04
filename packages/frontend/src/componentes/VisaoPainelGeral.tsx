import { type FC } from 'react';
import { CabecalhoPaginaSesi } from './CabecalhoPaginaSesi.tsx';

interface VisaoPainelGeralProps {
  totalPacientes: number;
  totalAtendimentos: number;
  aoNovoPaciente: () => void;
  aoNovoAtendimento: () => void;
}

export const VisaoPainelGeral: FC<VisaoPainelGeralProps> = ({
  totalPacientes,
  totalAtendimentos,
  aoNovoPaciente,
  aoNovoAtendimento,
}) => {
  return (
    <div className="flex flex-col flex-1 anim-surgir font-sans">
      {/* ─── Cabeçalho Fixo Modular ───────────────────────────────────────── */}
      <CabecalhoPaginaSesi
        titulo="Dashboard"
        subtitulo="INDICADORES E GESTÃO CLÍNICA — ESCOLA CIDADÃ & SESI SAÚDE"
        acaoPrimaria={{
          rotulo: '+ Novo Paciente',
          aoClicar: aoNovoPaciente,
        }}
        fixo={true}
      />

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        {/* Card 1: Total Pacientes */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estudantes Cadastrados</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              👥
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#0b2545] mt-2 font-sans">{totalPacientes}</p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">✓ LGPD Art. 14</span> termo registrado
          </p>
        </div>

        {/* Card 2: Atendimentos Realizados */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Atendimentos Realizados</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              📋
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#0b2545] mt-2 font-sans">{totalAtendimentos}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Odonto, Oftalmo, Audio, Psico, Nutri
          </p>
        </div>

        {/* Card 3: Polos Escolares Atendidos */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Polos Atendidos</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm">
              🏫
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#0b2545] mt-2 font-sans">4</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Escolas Públicas do DF ativas
          </p>
        </div>

        {/* Card 4: Cobertura de Triagem */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Taxa de Cobertura</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              🎯
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#0b2545] mt-2 font-sans">98.4%</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Alunos triados e encaminhados
          </p>
        </div>
      </div>

      {/* Ações Rápidas em Destaque */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <h3 className="text-xs font-bold text-[#0b2545] uppercase tracking-wider mb-3">
          Ações Rápidas do Sistema
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={aoNovoPaciente}
            className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-left transition-all cursor-pointer group"
          >
            <span className="text-xl block mb-1">👤+</span>
            <h4 className="text-xs font-bold text-blue-900 group-hover:text-blue-700">Cadastrar Novo Paciente</h4>
            <p className="text-[11px] text-slate-600 mt-0.5">Triagem de aluno com termo de consentimento dos pais (LGPD)</p>
          </button>

          <button
            type="button"
            onClick={aoNovoAtendimento}
            className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-left transition-all cursor-pointer group"
          >
            <span className="text-xl block mb-1">🩺</span>
            <h4 className="text-xs font-bold text-emerald-900 group-hover:text-emerald-700">Registrar Atendimento Clínico</h4>
            <p className="text-[11px] text-slate-600 mt-0.5">Ficha clínica em fluxo contínuo para qualquer especialidade</p>
          </button>
        </div>
      </div>
    </div>
  );
};

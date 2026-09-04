import { type FC } from 'react';
import { PageHeader } from './PageHeader.tsx';
import type { AbaNavegacao } from './SidebarSesi.tsx';

interface VisaoPainelGeralProps {
  totalPacientes: number;
  totalAtendimentos: number;
  totalPendentesSync: number;
  estaOnline: boolean;
  aoNavegar: (aba: AbaNavegacao) => void;
  aoNovoPaciente: () => void;
  aoNovoAtendimento: () => void;
}

export const VisaoPainelGeral: FC<VisaoPainelGeralProps> = ({
  totalPacientes,
  totalAtendimentos,
  totalPendentesSync,
  estaOnline,
  aoNavegar,
  aoNovoPaciente,
  aoNovoAtendimento,
}) => {
  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        titulo="Painel de Controle Itinerante"
        subtitulo="VISÃO GERAL DA OPERAÇÃO EM CAMPO — ESCOLA CIDADÃ & SESI SAÚDE"
      />

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        {/* Card 1: Total Pacientes */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estudantes Cadastrados</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              👥
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#0b2545] mt-2 font-sans">{totalPacientes}</p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">✓ LGPD Art. 14</span> consentimento registrado
          </p>
        </div>

        {/* Card 2: Atendimentos Realizados */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Atendimentos no Turno</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              📋
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#0b2545] mt-2 font-sans">{totalAtendimentos}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Fluxo contínuo sem limites por polo
          </p>
        </div>

        {/* Card 3: Fila de Sincronização */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fila Offline (IndexedDB)</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
              totalPendentesSync > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
            }`}>
              ⏳
            </div>
          </div>
          <p className={`text-2xl font-extrabold mt-2 font-sans ${totalPendentesSync > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
            {totalPendentesSync}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {totalPendentesSync > 0 ? 'Aguardando envio ao servidor' : 'Todos os dados sincronizados'}
          </p>
        </div>

        {/* Card 4: Conectividade */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Conectividade de Campo</span>
            <div className={`w-3 h-3 rounded-full ${estaOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          </div>
          <p className={`text-lg font-extrabold mt-2 font-sans ${estaOnline ? 'text-emerald-700' : 'text-slate-600'}`}>
            {estaOnline ? 'Online' : 'Offline'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {estaOnline ? 'Conexão ativa com API central' : 'Operando em armazenamento local'}
          </p>
        </div>
      </div>

      {/* Ações Rápidas & Painel de Instruções de Campo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Coluna 1 & 2: Ações Operacionais */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-xl shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0b2545] mb-1">
              Ações Rápidas de Triagem e Registro
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Selecione o fluxo desejado para iniciar o atendimento dos estudantes na tenda itinerante.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={aoNovoPaciente}
                className="flex items-start gap-3 p-3.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300 text-left transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                  +
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-900">Cadastrar Paciente</h4>
                  <p className="text-[11px] text-blue-700/80 mt-0.5 leading-snug">
                    Identificação rápida do estudante e anuência LGPD Art. 14.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={aoNovoAtendimento}
                className="flex items-start gap-3 p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                  📋
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">Nova Ficha de Atendimento</h4>
                  <p className="text-[11px] text-emerald-700/80 mt-0.5 leading-snug">
                    Registro de conduta clínica, procedimentos e insumos.
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Atalhos de teclado: <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600 border border-slate-200">Alt+N</kbd> (Novo Paciente), <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600 border border-slate-200">Ctrl+S</kbd> (Salvar)</span>
            <button
              type="button"
              onClick={() => aoNavegar('pacientes')}
              className="text-blue-600 font-bold hover:underline"
            >
              Ver todos os pacientes →
            </button>
          </div>
        </div>

        {/* Coluna 3: Protocolos de Segurança em Campo */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>🛡️</span>
              <span>Diretrizes de Segurança</span>
            </h3>

            <ul className="space-y-2 text-[11px] text-slate-600">
              <li className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Envelope Encryption:</strong> PII de menores armazenado com AES-256-GCM.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Timeout de Sessão:</strong> Notebook bloqueia após inatividade para proteger prontuários.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Idempotência:</strong> Sem duplicação de atendimentos mesmo em quedas de sinal.</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/60 text-[10px] text-slate-400 text-center font-mono">
            UnB • Sesi-DF • Finatec
          </div>
        </div>
      </div>
    </div>
  );
};

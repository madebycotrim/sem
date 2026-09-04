import { type FC } from 'react';

export interface ItemPaciente {
  id: string;
  nome: string;
  cpf?: string;
  dataNascimento: string;
  escolaNome: string;
  termoConsentimentoStatus: 'ACEITO' | 'DISPENSADO' | 'PENDENTE';
  atendimentosCount: number;
  criadoEm: string;
}

interface TabelaPacientesProps {
  pacientes: ItemPaciente[];
  carregando: boolean;
  aoNovoPaciente: () => void;
  aoIniciarAtendimento: (paciente: ItemPaciente) => void;
  aoVerDetalhes: (paciente: ItemPaciente) => void;
}

export const TabelaPacientes: FC<TabelaPacientesProps> = ({
  pacientes,
  carregando,
  aoNovoPaciente,
  aoIniciarAtendimento,
  aoVerDetalhes,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col flex-1 min-h-[460px]">
      {/* ─── Tabela de Registros ────────────────────────────────────────── */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
              <th scope="col" className="py-3 px-4 font-bold text-slate-600">
                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
                  <span>PACIENTE</span>
                  <span className="text-[10px] text-slate-400">↑↓</span>
                </div>
              </th>
              <th scope="col" className="py-3 px-3 font-bold text-slate-600">
                <div className="flex items-center gap-1">
                  <span>AUTORIZAÇÃO</span>
                  <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </th>
              <th scope="col" className="py-3 px-3 font-bold text-slate-600">
                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
                  <span>INSTITUIÇÃO</span>
                  <span className="text-[10px] text-slate-400">↑↓</span>
                </div>
              </th>
              <th scope="col" className="py-3 px-3 font-bold text-slate-600">
                <div className="flex items-center gap-1">
                  <span>CPF</span>
                  <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </th>
              <th scope="col" className="py-3 px-3 font-bold text-slate-600">
                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
                  <span>NASCIMENTO</span>
                  <span className="text-[10px] text-slate-400">↑↓</span>
                </div>
              </th>
              <th scope="col" className="py-3 px-3 font-bold text-slate-600">
                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
                  <span>PERFIL</span>
                  <span className="text-[10px] text-slate-400">↑↓</span>
                </div>
              </th>
              <th scope="col" className="py-3 px-4 font-bold text-slate-600 text-right">
                <span>AÇÕES</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {carregando ? (
              <tr>
                <td colSpan={7} className="py-20 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="w-7 h-7 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-xs font-medium text-slate-500">Carregando pacientes...</span>
                  </div>
                </td>
              </tr>
            ) : pacientes.length === 0 ? (
              /* ─── Empty State — Fiel à imagem 2 ───── */
              <tr>
                <td colSpan={7} className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center max-w-md mx-auto px-4">
                    {/* Ícone azul com fundo suave */}
                    <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3.5 ring-8 ring-blue-50/60 shadow-xs">
                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <line x1="20" y1="8" x2="20" y2="14" />
                        <line x1="23" y1="11" x2="17" y2="11" />
                      </svg>
                    </div>

                    <h3 className="text-base font-bold text-slate-800 mb-1">
                      Nenhum paciente encontrado
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      Não encontramos pacientes com esses filtros. Tente buscar de outra forma ou cadastre um novo.
                    </p>

                    <button
                      type="button"
                      onClick={aoNovoPaciente}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span>Cadastrar Novo Paciente</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              pacientes.map((paciente) => (
                <tr
                  key={paciente.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => aoVerDetalhes(paciente)}
                >
                  {/* Nome do Paciente */}
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center justify-center">
                        {paciente.nome.charAt(0).toUpperCase()}
                      </div>
                      <span className="group-hover:text-blue-600 transition-colors font-medium">
                        {paciente.nome}
                      </span>
                    </div>
                  </td>

                  {/* Status do Consentimento LGPD */}
                  <td className="py-3 px-3">
                    {paciente.termoConsentimentoStatus === 'ACEITO' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Autorizado (Art. 14)
                      </span>
                    ) : paciente.termoConsentimentoStatus === 'DISPENSADO' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        Emergência Legal
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        ⚠️ Pendente
                      </span>
                    )}
                  </td>

                  {/* Escola / Instituição */}
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {paciente.escolaNome}
                  </td>

                  {/* CPF */}
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {paciente.cpf || <span className="text-slate-400 italic">Não informado</span>}
                  </td>

                  {/* Nascimento */}
                  <td className="py-3 px-3 text-slate-600 font-mono">
                    {paciente.dataNascimento}
                  </td>

                  {/* Quantidade de Atendimentos / Perfil */}
                  <td className="py-3 px-3 text-slate-600">
                    <span>{paciente.atendimentosCount} ficha(s)</span>
                  </td>

                  {/* Ações */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => aoIniciarAtendimento(paciente)}
                        className="px-3 py-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all active:scale-95 cursor-pointer shadow-2xs"
                        title="Abrir nova ficha de atendimento para este paciente"
                      >
                        + Atendimento
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Rodapé da Tabela ────────────────────────────────────────────── */}
      <div className="py-2.5 px-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-400 select-none">
        <span>
          {pacientes.length === 0
            ? 'Nenhum registro encontrado'
            : `Mostrando ${pacientes.length} paciente(s) cadastrado(s)`}
        </span>
        <span className="font-mono text-slate-400">
          Escola Cidadã — SESI / UnB
        </span>
      </div>
    </div>
  );
};

import { type FC, useState } from 'react';
import { ESPECIALIDADE_LABELS, TURNO_LABELS, Especialidade, Turno } from '@sistema/shared';
import { PageHeader } from './PageHeader.tsx';

export interface ItemAtendimentoLista {
  id: string;
  pacienteNome: string;
  especialidade: Especialidade;
  turno: Turno;
  escolaNome: string;
  profissionalNome: string;
  resumo?: string;
  criadoEm: string;
  statusSincronizacao?: 'sincronizado' | 'pendente';
}

interface VisaoAtendimentosProps {
  atendimentos: ItemAtendimentoLista[];
  aoNovoAtendimento: () => void;
}

export const VisaoAtendimentos: FC<VisaoAtendimentosProps> = ({
  atendimentos,
  aoNovoAtendimento,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroEspecialidade, setFiltroEspecialidade] = useState<string>('');

  const filtrados = atendimentos.filter((item) => {
    const matchTexto =
      item.pacienteNome.toLowerCase().includes(busca.toLowerCase()) ||
      item.profissionalNome.toLowerCase().includes(busca.toLowerCase()) ||
      (item.resumo && item.resumo.toLowerCase().includes(busca.toLowerCase()));
    const matchEsp = !filtroEspecialidade || item.especialidade === filtroEspecialidade;
    return matchTexto && matchEsp;
  });

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        titulo="Atendimentos & Triagem"
        subtitulo="REGISTRO CLÍNICO, CONDUTAS E PROCEDIMENTOS EM CAMPO"
        acoesDireitas={
          <button
            type="button"
            onClick={aoNovoAtendimento}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>+ Nova Ficha de Atendimento</span>
          </button>
        }
      />

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por paciente, profissional ou conduta..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 shadow-2xs"
          />
          <svg className="w-4 h-4 absolute left-2.5 top-2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <select
          value={filtroEspecialidade}
          onChange={(e) => setFiltroEspecialidade(e.target.value)}
          className="px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Todas as Especialidades</option>
          {Object.entries(ESPECIALIDADE_LABELS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Tabela de Atendimentos */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden flex flex-col flex-1 min-h-[420px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                <th scope="col" className="py-2.5 px-4">PACIENTE</th>
                <th scope="col" className="py-2.5 px-3">ESPECIALIDADE</th>
                <th scope="col" className="py-2.5 px-3">TURNO</th>
                <th scope="col" className="py-2.5 px-3">ESCOLA / POLO</th>
                <th scope="col" className="py-2.5 px-3">PROFISSIONAL</th>
                <th scope="col" className="py-2.5 px-3">DATA / HORA</th>
                <th scope="col" className="py-2.5 px-4 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto px-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3 ring-8 ring-blue-50/50">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                          <rect x="8" y="2" width="8" height="4" rx="1" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">Nenhum atendimento registrado</h4>
                      <p className="text-xs text-slate-500 mb-3">
                        Não encontramos fichas de atendimento para os filtros selecionados.
                      </p>
                      <button
                        type="button"
                        onClick={aoNovoAtendimento}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                      >
                        + Nova Ficha
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtrados.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{item.pacienteNome}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {ESPECIALIDADE_LABELS[item.especialidade] || item.especialidade}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      {TURNO_LABELS[item.turno] || item.turno}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{item.escolaNome}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.profissionalNome}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {new Date(item.criadoEm).toLocaleDateString('pt-BR')} {new Date(item.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Registrado
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="py-2 px-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-400">
          <span>{filtrados.length} atendimento(s) listado(s)</span>
          <span className="font-mono">Fluxo Contínuo Itinerante</span>
        </div>
      </div>
    </div>
  );
};

import { type FC, useState } from 'react';
import { ESPECIALIDADE_LABELS, TURNO_LABELS, Especialidade, Turno } from '@sistema/shared';
import { CabecalhoPaginaSesi } from './CabecalhoPaginaSesi.tsx';

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
  aoSincronizar?: () => void;
  estaSincronizando?: boolean;
  itensPendentes?: number;
}

export const VisaoAtendimentos: FC<VisaoAtendimentosProps> = ({
  atendimentos,
  aoNovoAtendimento,
  aoSincronizar,
  estaSincronizando = false,
  itensPendentes = 0,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroEspecialidade, setFiltroEspecialidade] = useState<string>('');

  const opcoesEspecialidades = Object.entries(ESPECIALIDADE_LABELS).map(([id, nome]) => ({
    id,
    nome,
  }));

  const filtrados = atendimentos.filter((item) => {
    const matchTexto =
      item.pacienteNome.toLowerCase().includes(busca.toLowerCase()) ||
      item.profissionalNome.toLowerCase().includes(busca.toLowerCase()) ||
      (item.resumo && item.resumo.toLowerCase().includes(busca.toLowerCase()));
    const matchEsp = !filtroEspecialidade || item.especialidade === filtroEspecialidade;
    return matchTexto && matchEsp;
  });

  return (
    <div className="flex flex-col flex-1 anim-surgir">
      {/* ─── Cabeçalho Fixo Modular ───────────────────────────────────────── */}
      <CabecalhoPaginaSesi
        titulo="Atendimentos Clínicos"
        subtitulo="REGISTRO CLÍNICO, CONDUTAS E PROCEDIMENTOS EM FLUXO LIVRE"
        busca={{
          valor: busca,
          aoMudar: setBusca,
          placeholder: 'Buscar por paciente, profissional ou conduta...',
        }}
        seletor={{
          valor: filtroEspecialidade,
          aoMudar: setFiltroEspecialidade,
          placeholder: 'Todas as Especialidades',
          opcoes: opcoesEspecialidades,
        }}
        sincronizacao={
          aoSincronizar
            ? {
                aoSincronizar,
                estaSincronizando,
                itensPendentes,
                rotulo: 'Sincronizar Catraki',
              }
            : undefined
        }
        aoExportar={() => alert(`Exportando ${filtrados.length} atendimentos em formato CSV.`)}
        acaoPrimaria={{
          rotulo: '+ Novo Atendimento',
          aoClicar: aoNovoAtendimento,
        }}
        fixo={true}
      />

      {/* ─── Tabela de Atendimentos ───────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden flex flex-col flex-1 min-h-[440px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                <th scope="col" className="py-2.5 px-4 font-bold text-slate-600">PACIENTE</th>
                <th scope="col" className="py-2.5 px-3 font-bold text-slate-600">ESPECIALIDADE</th>
                <th scope="col" className="py-2.5 px-3 font-bold text-slate-600">TURNO</th>
                <th scope="col" className="py-2.5 px-3 font-bold text-slate-600">ESCOLA / POLO</th>
                <th scope="col" className="py-2.5 px-3 font-bold text-slate-600">PROFISSIONAL</th>
                <th scope="col" className="py-2.5 px-3 font-bold text-slate-600">DATA / HORA</th>
                <th scope="col" className="py-2.5 px-4 font-bold text-slate-600 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto px-4">
                      <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3.5 ring-8 ring-blue-50/60 shadow-xs">
                        <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                      </div>
                      <h4 className="text-base font-bold text-slate-800 mb-1">Nenhum atendimento registrado</h4>
                      <p className="text-xs text-slate-500 mb-4">
                        Não encontramos fichas de atendimento com os filtros selecionados.
                      </p>
                      <button
                        type="button"
                        onClick={aoNovoAtendimento}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                      >
                        <span>+ Registrar Novo Atendimento</span>
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
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
        <div className="py-2 px-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-400 select-none">
          <span>{filtrados.length} atendimento(s) listado(s)</span>
          <span className="font-mono text-slate-400">Fluxo Contínuo Itinerante • SESI / UnB</span>
        </div>
      </div>
    </div>
  );
};

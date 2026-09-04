import { type FC } from 'react';

interface BarraFiltrosProps {
  termoBusca: string;
  aoMudarBusca: (termo: string) => void;
  apenasPendentes: boolean;
  aoAlternarApenasPendentes: () => void;
  filtroEscola: string;
  aoMudarFiltroEscola: (escola: string) => void;
  opcoesEscola: Array<{ id: string; nome: string }>;
  aoSincronizar: () => void;
  estaSincronizando: boolean;
  itensPendentes: number;
  aoNovoRegistro: () => void;
  rotuloNovoRegistro?: string;
  aoExportar?: () => void;
  placeholderBusca?: string;
}

export const BarraFiltros: FC<BarraFiltrosProps> = ({
  termoBusca,
  aoMudarBusca,
  apenasPendentes,
  aoAlternarApenasPendentes,
  filtroEscola,
  aoMudarFiltroEscola,
  opcoesEscola,
  aoSincronizar,
  estaSincronizando,
  itensPendentes,
  aoNovoRegistro,
  rotuloNovoRegistro = '+ Novo Paciente',
  aoExportar,
  placeholderBusca = 'Buscar por nome ou CPF...',
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 mb-3">
      {/* ─── Campo de Busca ─────────────────────────────────────────────── */}
      <div className="relative flex-1 min-w-[240px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          type="text"
          value={termoBusca}
          onChange={(e) => aoMudarBusca(e.target.value)}
          placeholder={placeholderBusca}
          className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
        />
        {termoBusca && (
          <button
            type="button"
            onClick={() => aoMudarBusca('')}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            title="Limpar busca"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* ─── Filtros e Botões de Ação ───────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Filtro: Apenas com Aviso / Pendência */}
        <button
          type="button"
          onClick={aoAlternarApenasPendentes}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
            apenasPendentes
              ? 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-300'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
          title="Filtrar por registros que possuem pendência ou alerta LGPD"
        >
          <span className="text-amber-600 text-xs">⚠️</span>
          <span>Apenas com Avisos</span>
          <svg className="w-3 h-3 ml-0.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Dropdown: Escolas / Polos */}
        <div className="relative">
          <select
            value={filtroEscola}
            onChange={(e) => aoMudarFiltroEscola(e.target.value)}
            className="appearance-none pl-2.5 pr-7 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-2xs"
          >
            <option value="">Todas as Escolas / Polos</option>
            {opcoesEscola.map((esc) => (
              <option key={esc.id} value={esc.id}>
                {esc.nome}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-slate-400">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Botão de Sincronização (Estilo verde da referência: Sincronizar Fila) */}
        <button
          type="button"
          onClick={aoSincronizar}
          disabled={estaSincronizando}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-2xs"
          title="Forçar sincronização da fila offline com o servidor"
        >
          {estaSincronizando ? (
            <svg className="w-3.5 h-3.5 animate-spin text-emerald-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          )}
          <span>Sincronizar Catraki</span>
          {itensPendentes > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {itensPendentes}
            </span>
          )}
        </button>

        {/* Botão de Exportação */}
        {aoExportar && (
          <button
            type="button"
            onClick={aoExportar}
            className="p-1.5 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition-all shadow-2xs cursor-pointer"
            title="Exportar registros (CSV / Relatório)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        )}

        {/* Botão de Ação Primária: + Novo Paciente / + Nova Ficha (Azul Royal) */}
        <button
          type="button"
          onClick={aoNovoRegistro}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs hover:shadow-sm transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>{rotuloNovoRegistro}</span>
        </button>
      </div>
    </div>
  );
};

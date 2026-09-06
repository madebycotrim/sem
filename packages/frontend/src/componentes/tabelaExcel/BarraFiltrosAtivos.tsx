import type { RetornoFiltroExcel } from './useFiltroExcel.ts';

export interface BarraFiltrosAtivosProps<T> {
  estado: RetornoFiltroExcel<T>;
  entidadeNome?: string;
  className?: string;
}

export function BarraFiltrosAtivos<T>({
  estado,
  entidadeNome = 'registros',
  className = '',
}: BarraFiltrosAtivosProps<T>) {
  const colunasFiltradas = Object.keys(estado.filtrosColuna).filter((colId) =>
    estado.temFiltroAtivoColuna(colId)
  );

  const temFiltros = colunasFiltradas.length > 0 || estado.ordenacao !== null;

  if (!temFiltros) {
    return null;
  }

  return (
    <div
      className={`flex items-center justify-between gap-2 px-3 py-1.5 bg-blue-50/70 border-b border-blue-100 text-xs text-slate-700 animate-fade-in select-none ${className}`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-blue-800 font-bold text-[11px]">
          <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
          <span>Filtros Excel Ativos:</span>
        </div>

        {/* Chips de Colunas Filtradas */}
        {colunasFiltradas.map((colId) => {
          const config = estado.colunasConfig[colId];
          const rotulo = config?.rotulo || colId;
          const qtdSelecionados = estado.filtrosColuna[colId]?.size ?? 0;
          const totalValores = estado.obterValoresUnicosColuna(colId).length;

          return (
            <span
              key={colId}
              className="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-2xl bg-white border border-blue-200 text-[11px] font-semibold text-blue-900 shadow-2xs"
            >
              <span>
                {rotulo}: <strong className="text-blue-600">{qtdSelecionados}/{totalValores}</strong>
              </span>
              <button
                type="button"
                onClick={() => estado.limparFiltroColuna(colId)}
                className="p-0.5 text-slate-400 hover:text-red-600 rounded-2xl hover:bg-red-50 transition-colors"
                title={`Limpar filtro da coluna ${rotulo}`}
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          );
        })}

        {/* Chip de Ordenação */}
        {estado.ordenacao && (
          <span className="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-2xl bg-white border border-blue-200 text-[11px] font-semibold text-blue-900 shadow-2xs">
            <span>
              Ordenado por: <strong className="text-blue-600">{estado.colunasConfig[estado.ordenacao.colunaId]?.rotulo || estado.ordenacao.colunaId} ({estado.ordenacao.direcao === 'asc' ? 'A→Z' : 'Z→A'})</strong>
            </span>
            <button
              type="button"
              onClick={() => estado.limparOrdenacao()}
              className="p-0.5 text-slate-400 hover:text-red-600 rounded-2xl hover:bg-red-50 transition-colors"
              title="Remover ordenação"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </span>
        )}
      </div>

      {/* Contador e Botão Limpar Tudo */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[11px] text-slate-500 font-medium">
          Exibindo <strong>{estado.totalFiltrados}</strong> de {estado.totalOriginal} {entidadeNome}
        </span>
        <button
          type="button"
          onClick={() => estado.limparTodosFiltros()}
          className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
        >
          Limpar Tudo
        </button>
      </div>
    </div>
  );
}

import { type FC, useMemo } from 'react';

export interface PaginacaoProps {
  paginaAtual: number;
  totalPaginas: number;
  totalRegistros: number;
  aoMudarPagina: (pagina: number) => void;
  className?: string;
}

/**
 * Componente de Paginação Moderno e Elegante.
 * Exibe o total de registros à esquerda e controles de navegação com páginas e reticências à direita.
 */
export const Paginacao: FC<PaginacaoProps> = ({
  paginaAtual,
  totalPaginas,
  totalRegistros,
  aoMudarPagina,
  className = '',
}) => {
  const paginasVisiveis = useMemo(() => {
    if (totalPaginas <= 7) {
      return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    }

    if (paginaAtual <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPaginas];
    }

    if (paginaAtual >= totalPaginas - 3) {
      return [
        1,
        '...',
        totalPaginas - 4,
        totalPaginas - 3,
        totalPaginas - 2,
        totalPaginas - 1,
        totalPaginas,
      ];
    }

    return [
      1,
      '...',
      paginaAtual - 1,
      paginaAtual,
      paginaAtual + 1,
      '...',
      totalPaginas,
    ];
  }, [paginaAtual, totalPaginas]);

  return (
    <div
      className={`flex items-center justify-between text-xs text-slate-500 select-none py-2 px-3 ${className}`}
    >
      {/* Lado Esquerdo: Total de Registros */}
      <div className="text-[12.5px] text-slate-500 font-normal">
        Total de <span className="font-bold text-slate-800">{totalRegistros}</span> registros
      </div>

      {/* Lado Direito: Navegação de Páginas */}
      <div className="flex items-center gap-1">
        {/* Primeira Página (<<) */}
        <button
          type="button"
          onClick={() => aoMudarPagina(1)}
          disabled={paginaAtual <= 1}
          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Primeira página"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="11 17 6 12 11 7" />
            <polyline points="18 17 13 12 18 7" />
          </svg>
        </button>

        {/* Página Anterior (<) */}
        <button
          type="button"
          onClick={() => aoMudarPagina(Math.max(1, paginaAtual - 1))}
          disabled={paginaAtual <= 1}
          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Página anterior"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Números das Páginas */}
        {paginasVisiveis.map((item, idx) => {
          if (item === '...') {
            return (
              <span
                key={`reticencias-${idx}`}
                className="w-7 h-7 flex items-center justify-center text-slate-400 text-xs font-semibold select-none"
              >
                •••
              </span>
            );
          }

          const numPagina = Number(item);
          const estaAtiva = numPagina === paginaAtual;

          return (
            <button
              key={`pagina-${numPagina}`}
              type="button"
              onClick={() => aoMudarPagina(numPagina)}
              className={`w-7 h-7 flex items-center justify-center rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                estaAtiva
                  ? 'bg-[#1d63ff] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
              }`}
            >
              {numPagina}
            </button>
          );
        })}

        {/* Próxima Página (>) */}
        <button
          type="button"
          onClick={() => aoMudarPagina(Math.min(totalPaginas, paginaAtual + 1))}
          disabled={paginaAtual >= totalPaginas}
          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Próxima página"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Última Página (>>) */}
        <button
          type="button"
          onClick={() => aoMudarPagina(totalPaginas)}
          disabled={paginaAtual >= totalPaginas}
          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Última página"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="13 17 18 12 13 7" />
            <polyline points="6 17 11 12 6 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

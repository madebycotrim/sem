import { type FC, useMemo } from 'react';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

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

  const paginaInicio = totalRegistros === 0 ? 0 : (paginaAtual - 1) * 10 + 1;
  const paginaFim = totalRegistros === 0 ? 0 : Math.min(paginaAtual * 10, totalRegistros);

  return (
    <div
      className={`flex items-center justify-between select-none px-4 py-3 ${className}`}
    >
      {/* Lado Esquerdo: Info de registros */}
      <p className="text-xs tabular-nums" style={{ color: '#6b7280' }}>
        Mostrando{' '}
        <span className="font-medium" style={{ color: '#034b7f' }}>{paginaInicio}–{paginaFim}</span>
        {' '}de{' '}
        <span className="font-medium" style={{ color: '#034b7f' }}>{totalRegistros}</span>
        {' '}registros
      </p>

      {/* Lado Direito: Navegação */}
      {totalRegistros > 0 && <div className="flex items-center gap-0.5">
        {/* Primeira Página */}
        <button
          type="button"
          onClick={() => aoMudarPagina(1)}
          disabled={paginaAtual <= 1}
          className="h-7 w-7 flex items-center justify-center rounded transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: '#034b7f' }}
          onMouseEnter={e => { if (!(e.currentTarget as HTMLButtonElement).disabled) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e8f4f9'; } }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
          title="Primeira página"
        >
          <ChevronsLeft className="w-3 h-3" />
        </button>

        {/* Página Anterior */}
        <button
          type="button"
          onClick={() => aoMudarPagina(Math.max(1, paginaAtual - 1))}
          disabled={paginaAtual <= 1}
          className="h-7 w-7 flex items-center justify-center rounded transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: '#034b7f' }}
          onMouseEnter={e => { if (!(e.currentTarget as HTMLButtonElement).disabled) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e8f4f9'; } }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
          title="Página anterior"
        >
          <ChevronLeft className="w-3 h-3" />
        </button>

        {/* Separador visual */}
        <div className="w-px h-4 mx-1.5" style={{ backgroundColor: '#d0e9f3' }} />

        {/* Números das Páginas */}
        {paginasVisiveis.map((item, idx) => {
          if (item === '...') {
            return (
              <span
                key={`reticencias-${idx}`}
                className="h-7 w-7 flex items-center justify-center text-xs select-none"
                style={{ color: '#74c4d7' }}
              >
                ···
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
              className="h-7 min-w-[28px] px-1.5 flex items-center justify-center rounded text-xs font-medium transition-all cursor-pointer"
              style={estaAtiva
                ? { backgroundColor: '#034b7f', color: '#ffffff', boxShadow: '0 1px 3px rgba(3,75,127,0.3)' }
                : { color: '#14438f' }
              }
              onMouseEnter={e => { if (!estaAtiva) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e8f4f9'; } }}
              onMouseLeave={e => { if (!estaAtiva) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; } }}
            >
              {numPagina}
            </button>
          );
        })}

        <div className="w-px h-4 mx-1.5" style={{ backgroundColor: '#d0e9f3' }} />

        {/* Próxima Página */}
        <button
          type="button"
          onClick={() => aoMudarPagina(Math.min(totalPaginas, paginaAtual + 1))}
          disabled={paginaAtual >= totalPaginas}
          className="h-7 w-7 flex items-center justify-center rounded transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: '#034b7f' }}
          onMouseEnter={e => { if (!(e.currentTarget as HTMLButtonElement).disabled) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e8f4f9'; } }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
          title="Próxima página"
        >
          <ChevronRight className="w-3 h-3" />
        </button>

        {/* Última Página */}
        <button
          type="button"
          onClick={() => aoMudarPagina(totalPaginas)}
          disabled={paginaAtual >= totalPaginas}
          className="h-7 w-7 flex items-center justify-center rounded transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: '#034b7f' }}
          onMouseEnter={e => { if (!(e.currentTarget as HTMLButtonElement).disabled) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e8f4f9'; } }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
          title="Última página"
        >
          <ChevronsRight className="w-3 h-3" />
        </button>
      </div>}
    </div>
  );
};

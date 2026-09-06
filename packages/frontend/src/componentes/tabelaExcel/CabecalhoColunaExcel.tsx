import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { RetornoFiltroExcel } from './useFiltroExcel.ts';

export interface CabecalhoColunaExcelProps<T> {
  colunaId: string;
  rotulo: string;
  estado: RetornoFiltroExcel<T>;
  alinhamento?: 'left' | 'center' | 'right';
  className?: string;
  iconeExtra?: ReactNode;
}

export function CabecalhoColunaExcel<T>({
  colunaId,
  rotulo,
  estado,
  alinhamento = 'left',
  className = '',
  iconeExtra,
}: CabecalhoColunaExcelProps<T>) {
  const [aberto, setAberto] = useState(false);
  const [buscaValor, setBuscaValor] = useState('');
  const [posicaoPopover, setPosicaoPopover] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const config = estado.colunasConfig[colunaId];
  const desabilitarFiltro = config?.desabilitarFiltro ?? false;
  const desabilitarOrdenacao = config?.desabilitarOrdenacao ?? false;
  const tipo = config?.tipo || 'texto';

  const valoresUnicos = estado.obterValoresUnicosColuna(colunaId);
  const filtroAtivo = estado.temFiltroAtivoColuna(colunaId);
  const selecaoAtual = estado.filtrosColuna[colunaId]; // Set<string> | undefined (se undefined, todos selecionados)
  const estaOrdenado = estado.ordenacao?.colunaId === colunaId;
  const direcaoOrdenacao = estaOrdenado ? estado.ordenacao?.direcao : null;

  // Atualizar a posição do popover com base no trigger button
  const atualizarPosicao = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const larguraPopover = 280; // 70-72 tailwind width (aprox 280px)

    let left = rect.left;
    if (alinhamento === 'right') {
      left = rect.right - larguraPopover;
    }

    // Prevenir overflow das bordas da tela
    const padding = 12;
    if (left + larguraPopover > window.innerWidth - padding) {
      left = window.innerWidth - larguraPopover - padding;
    }
    if (left < padding) {
      left = padding;
    }

    let top = rect.bottom + 6;
    // Se estiver muito próximo da base da tela, posicionar acima do botão
    if (top + 340 > window.innerHeight && rect.top > 350) {
      top = rect.top - 340;
    }

    setPosicaoPopover({ top, left });
  }, [alinhamento]);

  const abrirMenu = () => {
    atualizarPosicao();
    setAberto((prev) => !prev);
  };

  // Fechar ao clicar fora, resize ou scroll da página
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setAberto(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setAberto(false);
      }
    }

    function handleScrollOrResize() {
      if (aberto) {
        atualizarPosicao();
      }
    }

    if (aberto) {
      atualizarPosicao();
      document.addEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('resize', handleScrollOrResize);
      window.addEventListener('scroll', handleScrollOrResize, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [aberto, atualizarPosicao]);

  // Filtra a lista de valores únicos pela busca interna do popover
  const valoresFiltrados = valoresUnicos.filter((v) =>
    v.rotuloExibicao.toLowerCase().includes(buscaValor.trim().toLowerCase())
  );

  const todosSelecionados = !selecaoAtual || selecaoAtual.size === valoresUnicos.length;
  const nenhumSelecionado = selecaoAtual && selecaoAtual.size === 0;
  const selecaoParcial = !todosSelecionados && !nenhumSelecionado;

  const toggleSelectAll = () => {
    if (todosSelecionados) {
      // Desmarcar todos
      estado.definirValoresFiltro(colunaId, new Set());
    } else {
      // Marcar todos (remove o filtro)
      estado.selecionarTodosValores(colunaId);
    }
  };

  const rotuloAsc =
    tipo === 'numero'
      ? 'Classificar do Menor ao Maior (1 → 9)'
      : tipo === 'data'
      ? 'Classificar do Mais Antigo ao Mais Recente'
      : 'Classificar de A a Z';

  const rotuloDesc =
    tipo === 'numero'
      ? 'Classificar do Maior ao Menor (9 → 1)'
      : tipo === 'data'
      ? 'Classificar do Mais Recente ao Mais Antigo'
      : 'Classificar de Z a A';

  return (
    <th
      scope="col"
      className={`py-3 px-3 font-bold text-slate-600 relative select-none text-left ${
        alinhamento === 'right' ? 'text-right' : alinhamento === 'center' ? 'text-center' : ''
      } ${className}`}
    >
      <div
        className={`flex items-center gap-1.5 ${
          alinhamento === 'right'
            ? 'justify-end'
            : alinhamento === 'center'
            ? 'justify-center'
            : 'justify-start'
        }`}
      >
        {/* Botão de Trigger Principal */}
        <button
          ref={triggerRef}
          type="button"
          onClick={abrirMenu}
          className={`group inline-flex items-center gap-1.5 py-1 px-1.5 -mx-1.5 rounded-2xl text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
            aberto
              ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 shadow-2xs'
              : filtroAtivo || estaOrdenado
              ? 'text-blue-700 bg-blue-50/80 hover:bg-blue-100 ring-1 ring-blue-200/60'
              : 'hover:bg-slate-100/80 hover:text-slate-900 text-slate-600'
          }`}
          title={`Opções de filtro e ordenação estilo Excel para "${rotulo}"`}
        >
          {iconeExtra}
          <span>{rotulo}</span>

          {/* Indicador de Status / Ícones */}
          <div className="inline-flex items-center gap-0.5 shrink-0 ml-0.5">
            {/* Ícone de Ordenação Ativa */}
            {estaOrdenado && (
              <span className="text-blue-600 font-bold text-[11px]">
                {direcaoOrdenacao === 'asc' ? (
                  <svg className="w-3 h-3 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              </span>
            )}

            {/* Ícone de Filtro Ativo ou Padrão Excel (Funil) */}
            {filtroAtivo ? (
              <span className="relative flex items-center justify-center p-0.5 rounded-2xl bg-blue-600 text-white shadow-2xs" title="Filtro ativo">
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                </svg>
              </span>
            ) : !desabilitarFiltro ? (
              <svg
                className={`w-3 h-3 transition-colors ${
                  aberto ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            ) : null}
          </div>
        </button>
      </div>

      {/* ─── Popover em React Portal com Z-INDEX Máximo Global ───────────────── */}
      {aberto &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed bg-white rounded-2xl border border-slate-200/95 shadow-2xl p-3 text-xs font-normal normal-case animate-dropdown origin-top select-none ring-1 ring-black/5"
            style={{
              top: `${posicaoPopover.top}px`,
              left: `${posicaoPopover.left}px`,
              width: '280px',
              zIndex: 999999,
            }}
          >
            {/* Cabeçalho do Popover */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                </svg>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Filtro: {rotulo}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* 1. SEÇÃO DE ORDENAÇÃO */}
            {!desabilitarOrdenacao && (
              <div className="space-y-1 mb-2.5 pb-2.5 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    estado.definirOrdenacao(colunaId, 'asc');
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-2xl text-xs font-medium transition-colors text-left cursor-pointer ${
                    estaOrdenado && direcaoOrdenacao === 'asc'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="m3 8 4-4 4 4" />
                    <path d="M7 4v16" />
                    <path d="M15 4h5l-5 6h5" />
                    <path d="M15 20v-6h5v6" />
                  </svg>
                  <span className="truncate">{rotuloAsc}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    estado.definirOrdenacao(colunaId, 'desc');
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-2xl text-xs font-medium transition-colors text-left cursor-pointer ${
                    estaOrdenado && direcaoOrdenacao === 'desc'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="m3 16 4 4 4-4" />
                    <path d="M7 20V4" />
                    <path d="M15 10V4h5v6" />
                    <path d="M15 14h5l-5 6h5" />
                  </svg>
                  <span className="truncate">{rotuloDesc}</span>
                </button>

                {estaOrdenado && (
                  <button
                    type="button"
                    onClick={() => estado.limparOrdenacao()}
                    className="w-full flex items-center gap-2 px-2.5 py-1 text-[11px] text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-colors text-left cursor-pointer"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <span>Limpar ordenação</span>
                  </button>
                )}
              </div>
            )}

            {/* 2. SEÇÃO DE FILTRAGEM POR VALORES */}
            {!desabilitarFiltro && (
              <div>
                {/* Campo de Busca Rápida de Valores */}
                <div className="relative mb-2">
                  <input
                    type="text"
                    value={buscaValor}
                    onChange={(e) => setBuscaValor(e.target.value)}
                    placeholder="Pesquisar valor..."
                    className="w-full pl-7 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all outline-none"
                  />
                  <svg
                    className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  {buscaValor && (
                    <button
                      type="button"
                      onClick={() => setBuscaValor('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Checkbox: Selecionar Tudo */}
                <div className="py-1 px-1.5 mb-1 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={todosSelecionados}
                      ref={(el) => {
                        if (el) el.indeterminate = Boolean(selecaoParcial);
                      }}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-1 cursor-pointer"
                    />
                    <span>(Selecionar Tudo)</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {valoresUnicos.length} valores
                  </span>
                </div>

                {/* Lista Scrollável de Valores Únicos */}
                <div className="max-h-40 overflow-y-auto space-y-0.5 pr-1 text-xs">
                  {valoresFiltrados.length === 0 ? (
                    <div className="py-3 text-center text-slate-400 text-[11px] italic">
                      Nenhum valor encontrado
                    </div>
                  ) : (
                    valoresFiltrados.map((item) => {
                      const isChecked = !selecaoAtual || selecaoAtual.has(item.valorChave);
                      return (
                        <label
                          key={item.valorChave}
                          className={`flex items-center justify-between px-2 py-1 rounded-2xl transition-colors cursor-pointer select-none ${
                            isChecked ? 'hover:bg-blue-50/50' : 'hover:bg-slate-50 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate mr-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => estado.alternarValorFiltro(colunaId, item.valorChave)}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-1 cursor-pointer shrink-0"
                            />
                            <span className="truncate text-slate-800 text-[11px]" title={item.rotuloExibicao}>
                              {item.rotuloExibicao}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-2xl shrink-0">
                            {item.contagem}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>

                {/* Ações de Rodapé */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  {filtroAtivo ? (
                    <button
                      type="button"
                      onClick={() => estado.limparFiltroColuna(colunaId)}
                      className="text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                    >
                      Limpar Filtro
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">Excel Smart Filter</span>
                  )}

                  <button
                    type="button"
                    onClick={() => setAberto(false)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
    </th>
  );
}

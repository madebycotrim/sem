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
    const larguraPopover = 290;

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

    let top = rect.bottom + 4;
    // Se estiver muito próximo da base da tela, posicionar acima do botão
    if (top + 360 > window.innerHeight && rect.top > 370) {
      top = rect.top - 360;
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
    (v.rotuloExibicao || '(Vazio)').toLowerCase().includes(buscaValor.trim().toLowerCase())
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
      ? 'Classificar do Menor para o Maior'
      : tipo === 'data'
      ? 'Classificar do Mais Antigo para o Mais Recente'
      : 'Classificar de A a Z';

  const rotuloDesc =
    tipo === 'numero'
      ? 'Classificar do Maior para o Menor'
      : tipo === 'data'
      ? 'Classificar do Mais Recente para o Mais Antigo'
      : 'Classificar de Z a A';

  const tooltipTexto =
    filtroAtivo && estaOrdenado
      ? `Filtrado e ordenado (${direcaoOrdenacao === 'asc' ? 'crescente' : 'decrescente'}) por "${rotulo}"`
      : filtroAtivo
      ? `Filtro ativo na coluna "${rotulo}"`
      : estaOrdenado
      ? `Classificado (${direcaoOrdenacao === 'asc' ? 'crescente' : 'decrescente'}) por "${rotulo}"`
      : `Classificar e filtrar por "${rotulo}"`;

  return (
    <th
      scope="col"
      className={`py-2.5 px-3 font-semibold text-[#034b7f] relative select-none ${
        alinhamento === 'right' ? 'text-right' : alinhamento === 'center' ? 'text-center' : 'text-left'
      } ${className}`}
    >
      <div className="w-full flex items-center justify-between">
        {/* Cabeçalho com Gatilho Discreto de Filtro */}
        <button
          ref={triggerRef}
          type="button"
          onClick={abrirMenu}
          className={`group w-full flex items-center justify-between gap-2 py-1 text-[11px] font-bold tracking-wider uppercase transition-colors cursor-pointer select-none ${
            aberto
              ? 'text-[#034b7f]'
              : filtroAtivo || estaOrdenado
              ? 'text-[#034b7f]'
              : 'text-slate-500 hover:text-[#034b7f]'
          }`}
          title={tooltipTexto}
        >
          <span className="flex items-center gap-1.5 truncate">
            {iconeExtra}
            <span className="truncate">{rotulo}</span>
          </span>

          {/* Ícone de Filtro (Funil) direto, sem círculos ou caixas */}
          <div className="flex items-center gap-1 shrink-0 ml-1">
            <svg
              className={`w-3 h-3 transition-colors ${
                filtroAtivo
                  ? 'text-[#034b7f] fill-[#034b7f]'
                  : aberto
                  ? 'text-[#034b7f]'
                  : 'text-slate-400 group-hover:text-[#034b7f]'
              }`}
              viewBox="0 0 24 24"
              fill={filtroAtivo ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={filtroAtivo ? '0' : '2'}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {filtroAtivo ? (
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              ) : (
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              )}
            </svg>

            {/* Indicador de Ordenação (se houver) */}
            {estaOrdenado && (
              <span className="text-[10px] font-black leading-none text-[#034b7f]">
                {direcaoOrdenacao === 'asc' ? '▲' : '▼'}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* ─── Menu Popover com Portal Flutuante ──────────────────────────────── */}
      {aberto &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed bg-white rounded-xl border border-slate-300 shadow-2xl p-3 text-xs font-normal normal-case animate-dropdown origin-top select-none ring-1 ring-black/10"
            style={{
              top: `${posicaoPopover.top}px`,
              left: `${posicaoPopover.left}px`,
              width: '290px',
              zIndex: 999999,
            }}
          >
            {/* Cabeçalho do Menu */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 truncate">
                <div className="w-5 h-5 rounded border flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(3,75,127,0.06)', color: '#034b7f', borderColor: 'rgba(3,75,127,0.15)' }}>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider truncate" style={{ color: '#034b7f' }}>
                  {rotulo}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                title="Fechar menu"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* 1. SEÇÃO DE CLASSIFICAÇÃO / ORDENAÇÃO */}
            {!desabilitarOrdenacao && (
              <div className="space-y-0.5 mb-2.5 pb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    estado.definirOrdenacao(colunaId, 'asc');
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer border ${
                    estaOrdenado && direcaoOrdenacao === 'asc'
                      ? 'font-bold'
                      : 'text-slate-600 hover:bg-slate-50 border-transparent'
                  }`}
                  style={estaOrdenado && direcaoOrdenacao === 'asc' ? { backgroundColor: 'rgba(3,75,127,0.05)', color: '#034b7f', borderColor: 'rgba(3,75,127,0.2)' } : {}}
                >
                  <div className={`w-4 h-4 flex items-center justify-center shrink-0 font-bold text-[11px] ${estaOrdenado && direcaoOrdenacao === 'asc' ? 'text-[#034b7f]' : 'text-slate-500'}`}>
                    {tipo === 'numero' ? '1→9' : tipo === 'data' ? '⏳' : 'A→Z'}
                  </div>
                  <span className="truncate">{rotuloAsc}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    estado.definirOrdenacao(colunaId, 'desc');
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer border ${
                    estaOrdenado && direcaoOrdenacao === 'desc'
                      ? 'font-bold'
                      : 'text-slate-600 hover:bg-slate-50 border-transparent'
                  }`}
                  style={estaOrdenado && direcaoOrdenacao === 'desc' ? { backgroundColor: 'rgba(3,75,127,0.05)', color: '#034b7f', borderColor: 'rgba(3,75,127,0.2)' } : {}}
                >
                  <div className={`w-4 h-4 flex items-center justify-center shrink-0 font-bold text-[11px] ${estaOrdenado && direcaoOrdenacao === 'desc' ? 'text-[#034b7f]' : 'text-slate-500'}`}>
                    {tipo === 'numero' ? '9→1' : tipo === 'data' ? '⌛' : 'Z→A'}
                  </div>
                  <span className="truncate">{rotuloDesc}</span>
                </button>

                {estaOrdenado && (
                  <button
                    type="button"
                    onClick={() => estado.limparOrdenacao()}
                    className="w-full flex items-center gap-2 px-2.5 py-1 text-[11px] text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <span>Limpar classificação</span>
                  </button>
                )}

                {filtroAtivo && (
                  <button
                    type="button"
                    onClick={() => estado.limparFiltroColuna(colunaId)}
                    className="w-full flex items-center gap-2 px-2.5 py-1 text-[11px] text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left cursor-pointer font-semibold"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                      <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <span>Limpar filtro de &quot;{rotulo}&quot;</span>
                  </button>
                )}
              </div>
            )}

            {/* 2. SEÇÃO DE FILTRAGEM DE VALORES ÚNICOS */}
            {!desabilitarFiltro && (
              <div>
                {/* Campo de Busca Rápida de Valores */}
                <div className="relative mb-2">
                  <input
                    type="text"
                    value={buscaValor}
                    onChange={(e) => setBuscaValor(e.target.value)}
                    placeholder="Pesquisar..."
                    className="w-full pl-7 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition-all outline-none"
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
                <div className="py-1 px-2 mb-1 bg-slate-100/80 rounded-md border border-slate-200 flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-[#034b7f]">
                    <input
                      type="checkbox"
                      checked={todosSelecionados}
                      ref={(el) => {
                        if (el) el.indeterminate = Boolean(selecaoParcial);
                      }}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 rounded border-slate-300 focus:ring-[#74c4d7] focus:ring-1 cursor-pointer accent-[#034b7f]"
                    />
                    <span>(Selecionar Tudo)</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {valoresUnicos.length} itens
                  </span>
                </div>

                {/* Lista de Valores Únicos com Checkboxes */}
                <div className="max-h-44 overflow-y-auto space-y-0.5 pr-1 text-xs border border-slate-100 rounded-md p-1 bg-slate-50/40">
                  {valoresFiltrados.length === 0 ? (
                    <div className="py-4 text-center text-slate-400 text-[11px] italic">
                      Nenhum valor correspondente
                    </div>
                  ) : (
                    valoresFiltrados.map((item) => {
                      const isChecked = !selecaoAtual || selecaoAtual.has(item.valorChave);
                      return (
                        <label
                          key={item.valorChave}
                          className={`flex items-center justify-between px-2 py-1 rounded transition-colors cursor-pointer select-none ${
                            isChecked ? 'font-medium' : 'hover:bg-slate-100/70 text-slate-500'
                          }`}
                          style={isChecked ? { backgroundColor: 'rgba(3,75,127,0.03)', color: '#034b7f' } : {}}
                        >
                          <div className="flex items-center gap-2 truncate mr-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => estado.alternarValorFiltro(colunaId, item.valorChave)}
                              className="w-3.5 h-3.5 rounded border-slate-300 focus:ring-[#74c4d7] focus:ring-1 cursor-pointer shrink-0 accent-[#034b7f]"
                            />
                            <span className="truncate text-[11px]" title={item.rotuloExibicao || '(Vazio)'}>
                              {item.rotuloExibicao || '(Vazio)'}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-medium text-slate-400 bg-white border border-slate-200/80 px-1.5 py-0.2 rounded shrink-0">
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
                    <span className="text-[10px] text-slate-400">
                      {valoresFiltrados.length} disponíveis
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setAberto(false)}
                    className="px-4 py-1.5 text-white rounded-md text-[11px] font-bold shadow-xs transition-all cursor-pointer active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #034b7f 0%, #14438f 100%)', boxShadow: '0 2px 6px rgba(3,75,127,0.2)' }}
                  >
                    OK
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


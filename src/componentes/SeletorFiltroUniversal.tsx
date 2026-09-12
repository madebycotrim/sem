import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useMemo,
  forwardRef,
  isValidElement,
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Smile,
  ChevronDown,
  X,
  Check,
  Eye,
  Ear,
  Sparkles,
  Brain,
  Apple,
  User,
  School,
  Activity,
  ShieldCheck,
  FileBadge,
  type LucideIcon,
} from 'lucide-react';
import {
  ESPECIALIDADE_LABELS,
  PERFIL_ACESSO_LABELS,
  CONSELHO_PROFISSIONAL_LABELS,
  STATUS_ATENDIMENTO_LABELS,
} from '../../compartilhado/index.ts';
import { obterEstiloEspecialidade } from './EspecialidadeVisual.tsx';

export interface ModalContextoTipo {
  tentarFechar: () => void;
  executarFechamentoEReset: () => void;
  marcarComoAlterado: () => void;
}

export const ModalContexto = createContext<ModalContextoTipo>({
  tentarFechar: () => {},
  executarFechamentoEReset: () => {},
  marcarComoAlterado: () => {},
});

export const useModalContexto = () => useContext(ModalContexto);

export interface OpcaoFiltroItem {
  id?: string;
  valor?: string;
  nome?: string;
  rotulo?: string;
  icone?: LucideIcon | ReactNode;
  corIcone?: string;
  corFundoIcone?: string;
  subtexto?: string;
  textoBusca?: string;
  grupo?: string;
  badge?: string | ReactNode;
  desabilitado?: boolean;
}

export type CategoriaFiltro =
  | 'especialidades'
  | 'profissionais'
  | 'instituicoes'
  | 'status'
  | 'conselhos'
  | 'perfis'
  | 'custom';

export interface SeletorFiltroUniversalProps {
  valor?: string;
  valorAtual?: string; // Alias de compatibilidade
  defaultValue?: string;
  aoMudar?: (valor: string) => void;
  onChange?: (...args: any[]) => void;
  onBlur?: () => void;
  name?: string;
  id?: string;

  categoria?: CategoriaFiltro;
  opcoes?: OpcaoFiltroItem[];
  placeholder?: string;
  placeholderBusca?: string;
  rotulo?: string;
  erro?: string;
  desabilitado?: boolean;
  disabled?: boolean;
  permitirLimpar?: boolean;
  mostrarLupaBotao?: boolean;
  pesquisavel?: boolean;
  tamanho?: 'sm' | 'md' | 'lg';
  className?: string;
  larguraDropdown?: string;
  textoTodos?: string;
  rodapePopover?: ReactNode;
  posicaoPopover?: 'baixo' | 'cima' | 'auto';
  fundoBranco?: boolean;
}

// Estilos visuais por especialidade (compatível com a imagem do usuário)
const ESTILOS_ESPECIALIDADE_PRESET: Record<
  string,
  { icone: LucideIcon; corFundo: string; corTexto: string }
> = {
  TODAS: { icone: Search, corFundo: 'bg-purple-100/70', corTexto: 'text-purple-600' },
  OFTALMOLOGIA: { icone: Eye, corFundo: 'bg-teal-50', corTexto: 'text-teal-700' },
  OTALMOLOGIA: { icone: Eye, corFundo: 'bg-teal-50', corTexto: 'text-teal-700' },
  AUDIOMETRIA: { icone: Ear, corFundo: 'bg-blue-100/70', corTexto: 'text-blue-600' },
  ODONTOLOGIA: { icone: Smile, corFundo: 'bg-rose-50', corTexto: 'text-rose-700' },
  PSICOLOGIA: { icone: Brain, corFundo: 'bg-indigo-50', corTexto: 'text-indigo-700' },
  NUTRICAO: { icone: Apple, corFundo: 'bg-green-50', corTexto: 'text-green-700' },
};

export const SeletorFiltroUniversal = forwardRef<
  HTMLInputElement,
  SeletorFiltroUniversalProps
>(function SeletorFiltroUniversal(
  {
    valor,
    valorAtual: valorAtualProp,
    defaultValue = '',
    aoMudar,
    onChange,
    onBlur,
    name,
    id,
    categoria = 'custom',
    opcoes = [],
    placeholder = 'Selecione...',
    placeholderBusca = 'Buscar...',
    rotulo,
    erro,
    desabilitado = false,
    disabled = false,
    permitirLimpar = true,
    mostrarLupaBotao = true,
    pesquisavel,
    tamanho = 'md',
    className = '',
    larguraDropdown,
    textoTodos = 'Todas as especialidades',
    rodapePopover,
    posicaoPopover = 'baixo',
    fundoBranco = false,
  },
  ref,
) {
  const isDisabled = desabilitado || disabled;
  const valEfetivoProp = valor ?? valorAtualProp;
  const [valInterno, setValInterno] = useState(defaultValue);
  const valorSel = valEfetivoProp !== undefined ? valEfetivoProp : valInterno;

  const [aberto, setAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputBuscaRef = useRef<HTMLInputElement>(null);

  const [posicaoMenu, setPosicaoMenu] = useState<{
    top: number;
    left: number;
    width: number;
    abrirParaCima: boolean;
  }>({ top: 0, left: 0, width: 0, abrirParaCima: false });

  // Normalização de Opções conforme Categoria
  const listaOpcoesNormalizada = useMemo<OpcaoFiltroItem[]>(() => {
    if (categoria === 'especialidades') {
      const presets: OpcaoFiltroItem[] = [];

      if (permitirLimpar) {
        presets.push({
          id: '',
          valor: '',
          nome: textoTodos,
          rotulo: textoTodos,
          icone: Search,
          corFundoIcone: 'bg-purple-100/70',
          corIcone: 'text-purple-600',
        });
      }

      Object.entries(ESPECIALIDADE_LABELS).forEach(([key, label]) => {
        const estilo = ESTILOS_ESPECIALIDADE_PRESET[key] || {
          icone: Sparkles,
          corFundo: 'bg-slate-100',
          corTexto: 'text-slate-600',
        };
        presets.push({
          id: key,
          valor: key,
          nome: label,
          rotulo: label,
          icone: estilo.icone,
          corFundoIcone: estilo.corFundo,
          corIcone: estilo.corTexto,
        });
      });

      return presets;
    }

    if (categoria === 'perfis') {
      const presets: OpcaoFiltroItem[] = [];
      if (permitirLimpar) {
        presets.push({ id: '', valor: '', nome: 'Todos os perfis', rotulo: 'Todos os perfis', icone: ShieldCheck });
      }
      Object.entries(PERFIL_ACESSO_LABELS).forEach(([key, label]) => {
        if (key === 'BOOTSTRAP') return;
        presets.push({ id: key, valor: key, nome: label, rotulo: label, icone: ShieldCheck });
      });
      return presets;
    }

    if (categoria === 'conselhos') {
      const presets: OpcaoFiltroItem[] = [];
      if (permitirLimpar) {
        presets.push({ id: '', valor: '', nome: 'Todos os conselhos', rotulo: 'Todos os conselhos', icone: FileBadge });
      }
      Object.entries(CONSELHO_PROFISSIONAL_LABELS).forEach(([key, label]) => {
        presets.push({ id: key, valor: key, nome: label, rotulo: label, icone: FileBadge });
      });
      return presets;
    }

    if (categoria === 'status') {
      const presets: OpcaoFiltroItem[] = [];
      if (permitirLimpar) {
        presets.push({ id: '', valor: '', nome: 'Todos os status', rotulo: 'Todos os status', icone: Activity });
      }
      Object.entries(STATUS_ATENDIMENTO_LABELS).forEach(([key, label]) => {
        presets.push({ id: key, valor: key, nome: label, rotulo: label, icone: Activity });
      });
      return presets;
    }

    // Categoria Custom ou Profissionais/Instituições
    const mapaBase = opcoes.map((item) => {
      const idVal = item.id ?? item.valor ?? '';
      const nomeVal = item.nome ?? item.rotulo ?? idVal;
      let iconeItem = item.icone;

      if (!iconeItem) {
        if (categoria === 'profissionais') iconeItem = User;
        else if (categoria === 'instituicoes') iconeItem = School;
      }

      return {
        ...item,
        id: idVal,
        valor: idVal,
        nome: nomeVal,
        rotulo: nomeVal,
        icone: iconeItem,
      };
    });

    if (permitirLimpar && !mapaBase.some((op) => op.id === '' || op.valor === '')) {
      const rotuloLimpar =
        categoria === 'profissionais'
          ? 'Todos os profissionais'
          : categoria === 'instituicoes'
            ? 'Todas as instituições'
            : 'Todos';
      return [
        {
          id: '',
          valor: '',
          nome: rotuloLimpar,
          rotulo: rotuloLimpar,
          icone: Search,
          corFundoIcone: 'bg-purple-100/70',
          corIcone: 'text-purple-600',
        },
        ...mapaBase,
      ];
    }

    return mapaBase;
  }, [categoria, opcoes, permitirLimpar, textoTodos]);

  // Opção Selecionada Atual
  const opcaoSelecionada = useMemo(() => {
    return listaOpcoesNormalizada.find(
      (item) => item.id === valorSel || item.valor === valorSel,
    );
  }, [listaOpcoesNormalizada, valorSel]);

  // Opções filtradas pela busca
  const opcoesFiltradas = useMemo(() => {
    if (!termoBusca.trim()) return listaOpcoesNormalizada;
    const termo = termoBusca.toLowerCase().trim();
    return listaOpcoesNormalizada.filter((item) => {
      const texto = `${item.nome ?? ''} ${item.rotulo ?? ''} ${item.subtexto ?? ''} ${item.textoBusca ?? ''} ${item.id ?? ''}`.toLowerCase();
      return texto.includes(termo);
    });
  }, [listaOpcoesNormalizada, termoBusca]);

  // Auto-desativar a busca para especialidades/status/perfis ou quando a lista for curta (<= 6 itens) ou quando pesquisavel for false
  const pesquisavelEfetivo =
    pesquisavel !== undefined
      ? pesquisavel
      : categoria === 'especialidades' || categoria === 'perfis' || categoria === 'status'
        ? false
        : listaOpcoesNormalizada.length > 6;

  // Posicionamento do Portal (Sempre abaixo por padrão)
  useLayoutEffect(() => {
    if (!aberto || !botaoRef.current) return undefined;

    const atualizarPosicao = () => {
      if (!botaoRef.current) return;
      const rect = botaoRef.current.getBoundingClientRect();
      const altEstimada = Math.min(opcoesFiltradas.length * 48 + (pesquisavelEfetivo ? 56 : 12) + (rodapePopover ? 44 : 0), 340);
      
      let abrirParaCima = false;
      if (posicaoPopover === 'cima') {
        abrirParaCima = true;
      } else if (posicaoPopover === 'auto') {
        const espacoAbaixo = window.innerHeight - rect.bottom;
        abrirParaCima = espacoAbaixo < altEstimada + 12 && rect.top > altEstimada + 12;
      }

      setPosicaoMenu({
        top: abrirParaCima ? rect.top - altEstimada - 6 : rect.bottom + 6,
        left: rect.left,
        width: rect.width,
        abrirParaCima,
      });
    };

    atualizarPosicao();
    window.addEventListener('resize', atualizarPosicao);
    window.addEventListener('scroll', atualizarPosicao, true);

    return () => {
      window.removeEventListener('resize', atualizarPosicao);
      window.removeEventListener('scroll', atualizarPosicao, true);
    };
  }, [aberto, opcoesFiltradas.length, pesquisavelEfetivo, rodapePopover, posicaoPopover]);

  // Foco no campo de busca ao abrir
  useEffect(() => {
    if (aberto && pesquisavelEfetivo) {
      setTimeout(() => {
        inputBuscaRef.current?.focus();
      }, 50);
    } else {
      setTermoBusca('');
    }
  }, [aberto, pesquisavelEfetivo]);

  const dispararBlur = (valorFinal: string = valInterno) => {
    if (onBlur) {
      try {
        (onBlur as any)({ target: { name, value: valorFinal, id } });
      } catch {
        // Evita que erros em handlers externos quebrem a interface
      }
    }
  };

  // Fechar ao clicar fora
  useEffect(() => {
    if (!aberto) return undefined;

    const handleClickFora = (e: MouseEvent) => {
      const target = e?.target as Node | undefined;
      if (
        containerRef.current &&
        target &&
        !containerRef.current.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setAberto(false);
        dispararBlur();
      }
    };

    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, [aberto, onBlur, valInterno, name, id]);

  const contextoModal = useModalContexto();

  const selecionarOpcao = (novoValor: string) => {
    const opcao = listaOpcoesNormalizada.find((item) => (item.id ?? item.valor ?? '') === novoValor);
    if (opcao?.desabilitado) return;
    setValInterno(novoValor);
    setAberto(false);
    contextoModal?.marcarComoAlterado?.();

    if (aoMudar) aoMudar(novoValor);
    if (onChange) {
      try {
        onChange({ target: { name, value: novoValor, id } });
      } catch {}
    }
    dispararBlur(novoValor);
  };

  const limparSelecao = (e: React.MouseEvent) => {
    e.stopPropagation();
    selecionarOpcao('');
  };

  // Renderizador de Ícone com Estilo
  const renderizarIcone = (
    item?: OpcaoFiltroItem,
    tamanhoIcone = 'h-4 w-4',
    modoCard = false,
  ) => {
    if (!item || !item.id) {
      return null;
    }

    const IconeComponente = item.icone;

    if (categoria === 'especialidades' && item.id) {
      const estilo = obterEstiloEspecialidade(item.id);
      const IconeEsp = estilo.icone;
      const corFundo = item.corFundoIcone || 'bg-purple-100/70';
      const corTexto = item.corIcone || 'text-purple-600';

      return (
        <div
          className={`flex ${modoCard ? 'h-8 w-8' : 'h-7 w-7'} shrink-0 items-center justify-center rounded-full ${corFundo} ${corTexto}`}
        >
          <IconeEsp className={modoCard ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
        </div>
      );
    }

    if (item.corFundoIcone === 'none') {
      return (
        <div className={`flex ${modoCard ? 'h-8 w-8' : 'h-7 w-7'} shrink-0 items-center justify-center rounded-full overflow-hidden`}>
          {isValidElement(IconeComponente) ? IconeComponente : null}
        </div>
      );
    }

    if (isValidElement(IconeComponente)) {
      const corFundo = item.corFundoIcone || 'bg-slate-100';
      const corTexto = item.corIcone || 'text-slate-600';
      return (
        <div
          className={`flex ${modoCard ? 'h-8 w-8' : 'h-7 w-7'} shrink-0 items-center justify-center rounded-full ${corFundo} ${corTexto}`}
        >
          {IconeComponente}
        </div>
      );
    }

    if (typeof IconeComponente === 'function') {
      const Comp = IconeComponente as LucideIcon;
      const corFundo = item.corFundoIcone || 'bg-slate-100';
      const corTexto = item.corIcone || 'text-slate-600';
      return (
        <div
          className={`flex ${modoCard ? 'h-8 w-8' : 'h-7 w-7'} shrink-0 items-center justify-center rounded-full ${corFundo} ${corTexto}`}
        >
          <Comp className={tamanhoIcone} />
        </div>
      );
    }

    return null;
  };

  // Estilos do Botão Principal
  const alturaClasse =
    tamanho === 'sm' ? 'h-9 px-3 text-xs' : tamanho === 'lg' ? 'h-12 px-4 text-[14px]' : 'h-11 px-3.5 text-[13px]';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {rotulo && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500"
        >
          {rotulo}
        </label>
      )}

      <input ref={ref} type="hidden" name={name} id={id} value={valorSel} readOnly />

      <button
        ref={botaoRef}
        type="button"
        disabled={isDisabled}
        onClick={() => setAberto((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-2.5 rounded-xl border font-medium text-slate-800 outline-none transition-all duration-200 ${alturaClasse} ${
          fundoBranco ? 'bg-white' : 'bg-slate-50/80'
        } ${
          aberto
            ? 'border-blue-500 bg-white ring-3 ring-blue-100 shadow-xs'
            : fundoBranco
              ? 'border-slate-200/90 hover:border-slate-300'
              : 'border-slate-200/90 hover:border-slate-300 hover:bg-white'
        } ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${
          erro ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-100' : ''
        }`}
      >
        <span className="flex items-center gap-2.5 overflow-hidden text-left">
          {mostrarLupaBotao && renderizarIcone(opcaoSelecionada)}
          <span
            className={`truncate ${
              opcaoSelecionada && opcaoSelecionada.id !== ''
                ? 'font-medium text-slate-800'
                : 'text-slate-400'
            }`}
          >
            {opcaoSelecionada?.nome || opcaoSelecionada?.rotulo || placeholder}
          </span>
          {opcaoSelecionada?.badge && (
            <span className="shrink-0">
              {typeof opcaoSelecionada.badge === 'string' ? (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
                  {opcaoSelecionada.badge}
                </span>
              ) : (
                opcaoSelecionada.badge
              )}
            </span>
          )}
        </span>

        <span className="flex items-center gap-1 shrink-0">
          {permitirLimpar && valorSel && (
            <span
              role="button"
              tabIndex={0}
              onClick={limparSelecao}
              className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              title="Limpar seleção"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              aberto ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </span>
      </button>

      {erro && <p className="mt-1 text-[11px] font-semibold text-rose-600">{erro}</p>}

      {/* Popover Dropdown em Portal */}
      {aberto &&
        posicaoMenu.width > 0 &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              top: posicaoMenu.top,
              left: posicaoMenu.left,
              width: larguraDropdown ? larguraDropdown : posicaoMenu.width,
              zIndex: 100000,
            }}
            className="fixed z-[100000] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_40px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/5 animate-dropdown"
          >
            {/* Cabeçalho de Pesquisa Interna */}
            {pesquisavelEfetivo && (
              <div className="flex items-center gap-2.5 border-b border-slate-100 bg-[#f8fafc] px-3.5 py-2.5">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  ref={inputBuscaRef}
                  type="text"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  placeholder={placeholderBusca}
                  className="w-full bg-transparent text-[14px] font-normal text-slate-800 placeholder:text-slate-400 outline-none"
                />
                {termoBusca && (
                  <button
                    type="button"
                    onClick={() => setTermoBusca('')}
                    className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Lista de opções dimensionada pelo conteúdo */}
            <div className="p-1.5 max-h-[260px] overflow-y-auto">
              {opcoesFiltradas.length === 0 ? (
                <div className="px-4 py-6 text-center text-[13px] text-slate-400">
                  Nenhuma opção encontrada
                </div>
              ) : (
                opcoesFiltradas.map((item) => {
                  const idItem = item.id ?? item.valor ?? '';
                  const selecionado = idItem === valorSel;

                  return (
                    <button
                      key={idItem || 'todos'}
                      type="button"
                      disabled={item.desabilitado}
                      onClick={() => selecionarOpcao(idItem)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${
                        item.desabilitado
                          ? 'cursor-not-allowed bg-slate-50 text-slate-400 opacity-70'
                          : selecionado
                          ? 'bg-slate-100/80 font-semibold text-slate-800 shadow-2xs'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {renderizarIcone(item, 'h-4 w-4', true)}
                        <div className="flex flex-col truncate">
                          <span className="truncate text-[14px] font-medium text-slate-800">
                            {item.nome || item.rotulo}
                          </span>
                          {item.subtexto && (
                            <span className="truncate text-[11px] font-normal text-slate-400">
                              {item.subtexto}
                            </span>
                          )}
                          {item.desabilitado && (
                            <span className="text-[10px] font-semibold text-rose-500">
                              Já realizada
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.badge && (
                          typeof item.badge === 'string' ? (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
                              {item.badge}
                            </span>
                          ) : (
                            item.badge
                          )
                        )}
                        {selecionado && (
                          <Check className="h-4 w-4 shrink-0 text-slate-600" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {rodapePopover && (
              <div className="border-t border-slate-100 p-1.5 bg-slate-50/60">
                {rodapePopover}
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
});

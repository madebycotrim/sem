import {
  type FC,
  type ReactNode,
  type Ref,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  createContext,
  useContext,
} from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, CircleAlert, LoaderCircle, Trash2, X } from 'lucide-react';

export type TamanhoModal = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

export interface ModalContextoTipo {
  tentarFechar: () => void;
  executarFechamentoEReset: () => void;
}

export const ModalContexto = createContext<ModalContextoTipo>({
  tentarFechar: () => {},
  executarFechamentoEReset: () => {},
});

export const useModalContexto = () => useContext(ModalContexto);

export interface ModalProps {
  aberto: boolean;
  aoFechar: () => void;
  aoResetar?: () => void;
  temDadosPreenchidos?: boolean;
  confirmarAoFechar?: boolean;
  titulo?: ReactNode;
  subtitulo?: ReactNode;
  icone?: ReactNode;
  tamanho?: TamanhoModal;
  children: ReactNode;
  rodape?: ReactNode;
  formId?: string;
  className?: string;
  contentClassName?: string;
}

const MAPA_TAMANHOS: Record<TamanhoModal, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
  '2xl': 'max-w-3xl',
  '3xl': 'max-w-4xl',
};

export const ESTILO_INPUT_MODAL =
  'w-full h-11 px-4 text-[13px] font-medium text-slate-800 bg-slate-50/80 border border-slate-200/90 rounded-xl outline-none transition-all duration-150 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-100 placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed';

export const ESTILO_SELECT_MODAL =
  'select-modal-arrow w-full h-11 px-4 pr-10 text-[13px] font-medium text-slate-800 bg-slate-50/80 border border-slate-200/90 rounded-xl outline-none appearance-none transition-all duration-150 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-100 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

type OpcaoSelectModal = { valor: string; rotulo: string };

type SelectModalProps = {
  opcoes: OpcaoSelectModal[];
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  name?: string;
  onChange?: (...args: any[]) => void;
  onBlur?: (...args: any[]) => void;
  className?: string;
  disabled?: boolean;
};

export const SelectModal = forwardRef<HTMLInputElement, SelectModalProps>(function SelectModal(
  {
    opcoes,
    placeholder = 'Selecione...',
    defaultValue = '',
    value,
    name,
    onChange,
    onBlur,
    className = '',
    disabled = false,
  },
  ref: Ref<HTMLInputElement>,
) {
  const [valor, setValor] = useState(defaultValue);
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [posicaoMenu, setPosicaoMenu] = useState({ top: 0, left: 0, width: 0 });
  const valorAtual = value ?? valor;
  const opcaoSelecionada = opcoes.find((opcao) => opcao.valor === valorAtual);

  useEffect(() => {
    if (value !== undefined) setValor(value);
  }, [value]);

  useEffect(() => {
    const fecharAoClicarFora = (evento: MouseEvent) => {
      const alvo = evento.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(alvo) &&
        !menuRef.current?.contains(alvo)
      ) {
        setAberto(false);
      }
    };
    document.addEventListener('mousedown', fecharAoClicarFora);
    return () => document.removeEventListener('mousedown', fecharAoClicarFora);
  }, []);

  useLayoutEffect(() => {
    if (!aberto || !botaoRef.current) return undefined;

    const atualizarPosicao = () => {
      if (!botaoRef.current) return;
      const retangulo = botaoRef.current.getBoundingClientRect();
      const alturaEstimada = Math.min(Math.max((opcoes.length + 1) * 40 + 12, 92), 236);
      const espacoAbaixo = window.innerHeight - retangulo.bottom;
      const abrirAcima = espacoAbaixo < alturaEstimada + 12 && retangulo.top > alturaEstimada + 12;

      setPosicaoMenu({
        top: abrirAcima ? retangulo.top - alturaEstimada - 6 : retangulo.bottom + 6,
        left: retangulo.left,
        width: retangulo.width,
      });
    };

    atualizarPosicao();
    window.addEventListener('resize', atualizarPosicao);
    window.addEventListener('scroll', atualizarPosicao, true);
    return () => {
      window.removeEventListener('resize', atualizarPosicao);
      window.removeEventListener('scroll', atualizarPosicao, true);
    };
  }, [aberto, opcoes.length]);

  const selecionar = (novoValor: string) => {
    setValor(novoValor);
    setAberto(false);
    onChange?.({ target: { name, value: novoValor } });
    onBlur?.();
  };

  return (
    <div ref={containerRef} className="relative">
      <input ref={ref} type="hidden" name={name} value={valorAtual} readOnly />
      <button
        type="button"
        disabled={disabled}
        ref={botaoRef}
        onClick={() => setAberto((estado) => !estado)}
        className={`${ESTILO_SELECT_MODAL} flex items-center justify-between text-left ${className}`}
        style={{ backgroundImage: 'none', paddingRight: '16px' }}
        aria-haspopup="listbox"
        aria-expanded={aberto}
      >
        <span className={opcaoSelecionada ? 'text-slate-800' : 'text-slate-400'}>
          {opcaoSelecionada?.rotulo || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>

      {aberto && posicaoMenu.width > 0 && (
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={{
              top: posicaoMenu.top,
              left: posicaoMenu.left,
              width: posicaoMenu.width,
              zIndex: 99999,
            }}
            className="fixed z-[9999] max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 ring-1 ring-black/5 animate-dropdown"
          >
            <button
              type="button"
              role="option"
              aria-selected={!valorAtual}
              onClick={() => selecionar('')}
              className={`w-full rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${!valorAtual ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {placeholder}
            </button>
            {opcoes.map((opcao) => (
              <button
                key={opcao.valor}
                type="button"
                role="option"
                aria-selected={opcao.valor === valorAtual}
                onClick={() => selecionar(opcao.valor)}
                className={`w-full rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${opcao.valor === valorAtual ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                {opcao.rotulo}
              </button>
            ))}
          </div>,
          document.body,
        )
      )}
    </div>
  );
});

/**
 * Componente Base Padronizado para todos os Modais do Catraki.
 *
 * Características:
 * - Renderização via React Portal (`document.body`)
 * - Fechamento por tecla `Escape` e clique no backdrop com confirmação de descarte de dados
 * - Reset automático de formulários e estados ao fechar
 * - Cabeçalho, corpo rolável e rodapé padronizados
 */
export const Modal: FC<ModalProps> = ({
  aberto,
  aoFechar,
  aoResetar,
  temDadosPreenchidos,
  confirmarAoFechar = true,
  titulo,
  subtitulo,
  icone,
  tamanho = 'xl',
  children,
  rodape,
  className = '',
  contentClassName = 'px-6 py-6',
}) => {
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false);
  const [houveAlteracao, setHouveAlteracao] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) {
      setConfirmandoDescarte(false);
      setHouveAlteracao(false);
    } else {
      const handleInteracao = (e: Event) => {
        const target = e.target as HTMLElement;
        // Ignora cliques em botões normais que não são switches
        if (e.type === 'click' && target.closest('button')) {
          const btn = target.closest('button');
          if (btn?.getAttribute('role') !== 'switch') return;
        }
        setHouveAlteracao(true);
      };

      const container = containerRef.current;
      if (container) {
        container.addEventListener('input', handleInteracao);
        container.addEventListener('change', handleInteracao);
        container.addEventListener('click', handleInteracao);
      }
      return () => {
        if (container) {
          container.removeEventListener('input', handleInteracao);
          container.removeEventListener('change', handleInteracao);
          container.removeEventListener('click', handleInteracao);
        }
      };
    }
  }, [aberto]);

  const checarSeTemDados = (): boolean => {
    if (confirmarAoFechar === false) return false;
    if (typeof temDadosPreenchidos === 'boolean') return temDadosPreenchidos;
    return houveAlteracao;
  };

  const executarFechamentoEReset = () => {
    setConfirmandoDescarte(false);
    if (containerRef.current) {
      const formularios = containerRef.current.querySelectorAll('form');
      formularios.forEach((f) => f.reset());
    }
    aoResetar?.();
    aoFechar();
  };

  const tentarFechar = () => {
    if (checarSeTemDados()) {
      setConfirmandoDescarte(true);
    } else {
      executarFechamentoEReset();
    }
  };

  useEffect(() => {
    if (!aberto) return;
    const aoPressionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        if (confirmandoDescarte) {
          setConfirmandoDescarte(false);
        } else {
          tentarFechar();
        }
      }
    };
    window.addEventListener('keydown', aoPressionarTecla);
    return () => window.removeEventListener('keydown', aoPressionarTecla);
  }, [aberto, confirmandoDescarte, temDadosPreenchidos, confirmarAoFechar]);

  if (!aberto) return null;

  const larguraClasse = MAPA_TAMANHOS[tamanho] || 'max-w-2xl';

  return createPortal(
    <ModalContexto.Provider value={{ tentarFechar, executarFechamentoEReset }}>
      <div
        className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/40 backdrop-blur-[2px] animate-fade-in font-sans"
        role="dialog"
        aria-modal="true"
        onClick={tentarFechar}
      >
        <div className="min-h-full flex items-center justify-center p-4">
          <div
            ref={containerRef}
            className={`w-full ${larguraClasse} bg-white rounded-[28px] shadow-[0_28px_80px_rgba(15,23,42,0.18)] border border-slate-200/80 flex flex-col animate-slide-up relative overflow-hidden ${className}`}
            onClick={(evento) => evento.stopPropagation()}
          >
          {/* ─── 1. Cabeçalho do Modal ────────────────────────────────────── */}
          {(titulo || subtitulo) && (
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-slate-50 to-white shrink-0 relative z-10 rounded-t-[28px]">
              <div className="flex items-center gap-3.5">
                {icone && (
                  <div className="w-10 h-10 rounded-2xl bg-blue-100/80 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    {icone}
                  </div>
                )}
                <div>
                  {typeof titulo === 'string' ? (
                    <h2 className="text-[1.05rem] font-extrabold text-slate-800 tracking-[-0.02em] leading-tight">
                      {titulo}
                    </h2>
                  ) : (
                    titulo
                  )}
                  {subtitulo && (
                    <p className="mt-0.5 text-[11.5px] font-medium text-slate-500">
                      {subtitulo}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={tentarFechar}
                aria-label="Fechar Modal"
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ─── 2. Corpo Conteúdo ───────────────────────────────── */}
          <div className={`relative z-20 ${contentClassName}`}>
            {children}
          </div>

          {/* ─── 3. Rodapé com Ações ou Confirmação Discreta Inline (Altura Fixa h-18) ─── */}
          {confirmandoDescarte ? (
            <div className="h-18 px-6 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 rounded-b-3xl shrink-0 animate-fade-in font-sans relative z-10">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span>Descartar os dados preenchidos e fechar?</span>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmandoDescarte(false)}
                  className="h-10 px-4 text-xs font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
                >
                  Não, Continuar Editando
                </button>
                <button
                  type="button"
                  onClick={executarFechamentoEReset}
                  className="h-10 px-4 text-xs font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sim, Descartar</span>
                </button>
              </div>
            </div>
          ) : (
            rodape && (
              <div className="h-18 px-6 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-3 rounded-b-3xl shrink-0 relative z-10">
                {rodape}
              </div>
            )
          )}
        </div>
        </div>
      </div>
    </ModalContexto.Provider>,
    document.body
  );
};

/* ─── Sub-componente: Campo de Formulário Padronizado ────────────────────── */

export interface ModalCampoProps {
  rotulo: string;
  obrigatorio?: boolean;
  erro?: string;
  dica?: string;
  children: ReactNode;
  className?: string;
}

export const ModalCampo: FC<ModalCampoProps> = ({
  rotulo,
  obrigatorio = false,
  erro,
  dica,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
        {rotulo} {obrigatorio && <span className="text-red-500 font-bold">*</span>}
      </label>
      {children}
      {erro ? (
        <p className="text-[11px] font-semibold text-red-600 animate-fade-in flex items-center gap-1">
          <CircleAlert className="w-3 h-3 shrink-0" />
          <span>{erro}</span>
        </p>
      ) : dica ? (
        <p className="text-[10.5px] font-normal text-slate-400">{dica}</p>
      ) : null}
    </div>
  );
};

/* ─── Sub-componente: Seção com Divisor Elegante ─────────────────────────── */

export interface ModalSecaoProps {
  titulo: string;
  children: ReactNode;
  className?: string;
}

export const ModalSecao: FC<ModalSecaoProps> = ({
  titulo,
  children,
  className = '',
}) => {
  return (
    <section className={`space-y-5 ${className}`}>
      <h3 className="pt-1 pb-2 text-[12px] font-extrabold tracking-wider text-blue-600 uppercase border-b border-slate-100 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        {titulo}
      </h3>
      {children}
    </section>
  );
};

/* ─── Sub-componente: Botão de Ação Padronizado para Modais ───────────────── */

export interface BotaoModalProps {
  tipo?: 'button' | 'submit' | 'reset';
  variante?: 'primario' | 'secundario' | 'perigo';
  rotulo: ReactNode;
  carregando?: boolean;
  desabilitado?: boolean;
  aoClicar?: () => void;
  formId?: string;
  className?: string;
}

export const BotaoModal: FC<BotaoModalProps> = ({
  tipo = 'button',
  variante = 'primario',
  rotulo,
  carregando = false,
  desabilitado = false,
  aoClicar,
  formId,
  className = '',
}) => {
  const { tentarFechar } = useModalContexto();

  const estilosVariante =
    variante === 'primario'
      ? 'bg-[#0f6ae8] text-white border border-[#0f6ae8] shadow-[0_8px_18px_rgba(15,106,232,0.22)] hover:bg-[#0d5fd6] hover:border-[#0d5fd6] active:translate-y-[1px] active:shadow-[0_6px_14px_rgba(15,106,232,0.18)]'
      : variante === 'perigo'
        ? 'bg-[#dc2626] text-white border border-[#dc2626] shadow-[0_8px_18px_rgba(220,38,38,0.20)] hover:bg-[#c81f1f] hover:border-[#c81f1f] active:translate-y-[1px] active:shadow-[0_6px_14px_rgba(220,38,38,0.18)]'
        : 'bg-white text-slate-700 border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:bg-slate-50 hover:border-slate-300 active:translate-y-[1px]';

  const tratarClique = () => {
    if (aoClicar) {
      aoClicar();
    } else if (tipo === 'button' && variante === 'secundario') {
      tentarFechar();
    }
  };

  return (
    <button
      type={tipo}
      form={formId}
      disabled={desabilitado || carregando}
      onClick={tratarClique}
      className={`h-11 min-w-[130px] px-5 text-[13px] font-bold rounded-xl transition-all duration-200 ease-out flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 ${estilosVariante} ${className}`}
    >
      {carregando ? (
        <>
          <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
          <span>Aguarde...</span>
        </>
      ) : (
        rotulo
      )}
    </button>
  );
};

/* ─── Sub-componente: Select Customizado com Ícones ─────────────────────── */

export interface OpcaoSelectCustom {
  valor: string;
  rotulo: string;
  icone?: ReactNode;
}

export interface ModalSelectCustomProps {
  valorAtual: string;
  aoMudar: (valor: string) => void;
  opcoes: OpcaoSelectCustom[];
  placeholder?: string;
  abreParaCima?: boolean;
}

export const ModalSelectCustom: FC<ModalSelectCustomProps> = ({
  valorAtual,
  aoMudar,
  opcoes,
  placeholder = 'Selecione...',
  abreParaCima = false,
}) => {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    };
    if (aberto) document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, [aberto]);

  const opcaoSelecionada = opcoes.find((o) => o.valor === valorAtual);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className={`${ESTILO_INPUT_MODAL} flex items-center justify-between text-left`}
      >
        {opcaoSelecionada ? (
          <div className="flex items-center gap-2.5">
            {opcaoSelecionada.icone}
            <span className="font-semibold text-slate-800 text-xs tracking-tight">
              {opcaoSelecionada.rotulo}
            </span>
          </div>
        ) : (
          <span className="text-slate-400">{placeholder}</span>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>

      {aberto && (
        <div className={`absolute left-0 w-full bg-white border border-slate-200/90 rounded-2xl shadow-lg z-[100] overflow-hidden py-1.5 animate-fade-in ${abreParaCima ? 'bottom-full mb-1.5' : 'top-full mt-1.5'}`}>
          {opcoes.map((opcao) => (
            <button
              key={opcao.valor}
              type="button"
              onClick={() => {
                aoMudar(opcao.valor);
                setAberto(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-slate-50 transition-colors text-left"
            >
              {opcao.icone}
              <span className="font-semibold text-slate-700 text-[11px] uppercase tracking-tight">
                {opcao.rotulo}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

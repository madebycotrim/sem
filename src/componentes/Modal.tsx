import {
  type FC,
  type ReactNode,
  type Ref,
  forwardRef,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from 'react';
import { createPortal } from 'react-dom';
import { CircleAlert, TriangleAlert, X } from 'lucide-react';
import { SeletorFiltroUniversal, type OpcaoFiltroItem, type CategoriaFiltro } from './SeletorFiltroUniversal.tsx';
import { Botao } from './Botao.tsx';

export { SeletorFiltroUniversal };
export type { OpcaoFiltroItem, CategoriaFiltro };

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
  pesquisavel?: boolean;
  permitirLimpar?: boolean;
  posicaoPopover?: 'baixo' | 'cima' | 'auto';
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
    pesquisavel,
    permitirLimpar = false,
    posicaoPopover = 'baixo',
  },
  ref: Ref<HTMLInputElement>,
) {
  const opcoesFiltro = opcoes.map((o) => ({
    id: o.valor,
    valor: o.valor,
    nome: o.rotulo,
    rotulo: o.rotulo,
  }));

  return (
    <SeletorFiltroUniversal
      ref={ref}
      name={name}
      valor={value}
      defaultValue={defaultValue}
      opcoes={opcoesFiltro}
      placeholder={placeholder}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      className={className}
      permitirLimpar={permitirLimpar}
      mostrarLupaBotao={false}
      pesquisavel={pesquisavel}
      posicaoPopover={posicaoPopover}
    />
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
  temDadosPreenchidos = false,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false);

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
    if (confirmarAoFechar && temDadosPreenchidos && !confirmandoDescarte) {
      setConfirmandoDescarte(true);
      return;
    }
    executarFechamentoEReset();
  };

  useEffect(() => {
    if (!aberto) {
      setConfirmandoDescarte(false);
      return;
    }
    const aoPressionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        if (confirmandoDescarte) {
          setConfirmandoDescarte(false);
          return;
        }
        tentarFechar();
      }
    };
    window.addEventListener('keydown', aoPressionarTecla);
    return () => window.removeEventListener('keydown', aoPressionarTecla);
  }, [aberto, confirmarAoFechar, temDadosPreenchidos, confirmandoDescarte]);

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
        <div className="min-h-full flex items-center justify-center p-3 sm:p-4 py-4 sm:py-6">
          <div
            ref={containerRef}
            className={`w-full ${larguraClasse} max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] bg-white rounded-[28px] shadow-[0_28px_80px_rgba(15,23,42,0.18)] border border-slate-200/80 flex flex-col animate-slide-up relative overflow-hidden ${className}`}
            onClick={(evento) => evento.stopPropagation()}
          >
          {/* ─── 1. Cabeçalho do Modal ────────────────────────────────────── */}
          {(titulo || subtitulo) && (
            <div className="flex items-start justify-between px-6 py-4.5 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-slate-50 to-white shrink-0 relative z-10 rounded-t-[28px]">
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

          {/* ─── 2. Corpo Conteúdo (Scroll Interno Suave) ─────────────────── */}
          <div className={`relative z-20 flex-1 min-h-0 overflow-y-auto overscroll-contain ${contentClassName}`}>
            {children}
          </div>

          {/* ─── 3. Rodapé com Ações ──────────────────────────────────────── */}
          {rodape && (
            <div className="min-h-16 px-6 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-3 rounded-b-3xl shrink-0 relative z-10">
              {rodape}
            </div>
          )}

          {/* ─── 4. Confirmação de Descarte de Alterações ─────────────────── */}
          {confirmandoDescarte && (
            <div
              className="absolute inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px] flex items-center justify-center p-4 animate-fade-in"
              onClick={(evento) => evento.stopPropagation()}
            >
              <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="modal-descarte-titulo"
                aria-describedby="modal-descarte-descricao"
                className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-slide-up"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                    <TriangleAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 id="modal-descarte-titulo" className="text-[15px] font-bold text-slate-800">
                      Descartar alterações?
                    </h3>
                    <p id="modal-descarte-descricao" className="mt-1 text-[12.5px] text-slate-500 leading-relaxed">
                      Existem informações preenchidas que ainda não foram salvas. Se sair agora, os dados serão perdidos.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Botao
                    type="button"
                    variante="secundario"
                    tamanho="sm"
                    formato="pilula"
                    onClick={() => setConfirmandoDescarte(false)}
                  >
                    Continuar editando
                  </Botao>
                  <Botao
                    type="button"
                    variante="perigo"
                    tamanho="sm"
                    formato="pilula"
                    onClick={executarFechamentoEReset}
                  >
                    Descartar
                  </Botao>
                </div>
              </div>
            </div>
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

  const tratarClique = () => {
    if (aoClicar) {
      aoClicar();
    } else if (tipo === 'button' && variante === 'secundario') {
      tentarFechar();
    }
  };

  return (
    <Botao
      type={tipo}
      form={formId}
      variante={variante}
      tamanho="md"
      formato="pilula"
      carregando={carregando}
      textoCarregando="Aguarde..."
      disabled={desabilitado}
      onClick={tratarClique}
      className={`min-w-[130px] ${className}`}
    >
      {rotulo}
    </Botao>
  );
};

/* ─── Sub-componente: Select Customizado com Ícones ─────────────────────── */

import type { LucideIcon } from 'lucide-react';

export interface OpcaoSelectCustom {
  valor: string;
  rotulo: string;
  subtexto?: string | ReactNode;
  textoBusca?: string;
  icone?: LucideIcon | ReactNode;
  corFundoIcone?: string;
  corIcone?: string;
  badge?: ReactNode;
  desabilitado?: boolean;
}

export interface ModalSelectCustomProps {
  valorAtual: string;
  aoMudar: (valor: string) => void;
  opcoes: OpcaoSelectCustom[];
  placeholder?: string;
  abreParaCima?: boolean;
  pesquisavel?: boolean;
  categoria?: CategoriaFiltro;
  erro?: string;
  rodapePopover?: ReactNode;
  disabled?: boolean;
  className?: string;
  posicaoPopover?: 'baixo' | 'cima' | 'auto';
}

export const ModalSelectCustom: FC<ModalSelectCustomProps> = ({
  valorAtual,
  aoMudar,
  opcoes,
  placeholder = 'Selecione...',
  pesquisavel,
  categoria = 'custom',
  erro,
  rodapePopover,
  disabled = false,
  className = '',
  posicaoPopover = 'auto',
  abreParaCima,
}) => {
  const opcoesFiltro: OpcaoFiltroItem[] = opcoes.map((o) => ({
    id: o.valor,
    valor: o.valor,
    nome: o.rotulo,
    rotulo: o.rotulo,
    icone: o.icone,
    corFundoIcone: o.corFundoIcone,
    corIcone: o.corIcone,
    subtexto: o.subtexto,
    textoBusca: o.textoBusca,
    badge: o.badge,
    desabilitado: o.desabilitado,
  }));

  const posicaoEfetiva = abreParaCima ? 'cima' : posicaoPopover;

  return (
    <SeletorFiltroUniversal
      valor={valorAtual}
      aoMudar={aoMudar}
      categoria={categoria}
      opcoes={opcoesFiltro}
      placeholder={placeholder}
      pesquisavel={pesquisavel}
      erro={erro}
      permitirLimpar={false}
      rodapePopover={rodapePopover}
      disabled={disabled}
      className={className}
      posicaoPopover={posicaoEfetiva}
    />
  );
};

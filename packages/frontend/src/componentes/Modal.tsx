import { type FC, type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

export type TamanhoModal = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

export interface ModalProps {
  aberto: boolean;
  aoFechar: () => void;
  titulo?: ReactNode;
  subtitulo?: ReactNode;
  icone?: ReactNode;
  tamanho?: TamanhoModal;
  children: ReactNode;
  rodape?: ReactNode;
  formId?: string;
  className?: string;
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
  'w-full h-10 px-3.5 text-xs font-medium text-slate-800 bg-slate-50/80 border border-slate-200/90 rounded-xl outline-none transition-all duration-150 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-100 placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed';

export const ESTILO_SELECT_MODAL =
  'w-full h-10 px-3.5 text-xs font-medium text-slate-800 bg-slate-50/80 border border-slate-200/90 rounded-xl outline-none transition-all duration-150 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-100 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

/**
 * Componente Base Padronizado para todos os Modais do Catraki.
 *
 * Características:
 * - Renderização via React Portal (`document.body`)
 * - Fechamento por tecla `Escape` e clique no backdrop
 * - Cabeçalho, corpo rolável e rodapé padronizados
 * - Animações suaves e design responsivo premium
 */
export const Modal: FC<ModalProps> = ({
  aberto,
  aoFechar,
  titulo,
  subtitulo,
  icone,
  tamanho = 'xl',
  children,
  rodape,
  formId,
  className = '',
}) => {
  useEffect(() => {
    if (!aberto) return;
    const aoPressionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        aoFechar();
      }
    };
    window.addEventListener('keydown', aoPressionarTecla);
    return () => window.removeEventListener('keydown', aoPressionarTecla);
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  const larguraClasse = MAPA_TAMANHOS[tamanho] || 'max-w-2xl';

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/40 backdrop-blur-[2px] animate-fade-in font-sans"
      role="dialog"
      aria-modal="true"
      onClick={aoFechar}
    >
      <div
        className={`w-full ${larguraClasse} bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-slide-up ${className}`}
        onClick={(evento) => evento.stopPropagation()}
      >
        {/* ─── 1. Cabeçalho do Modal ────────────────────────────────────── */}
        {(titulo || subtitulo) && (
          <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/60 shrink-0">
            <div className="flex items-center gap-3.5">
              {icone && (
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                  {icone}
                </div>
              )}
              <div>
                {typeof titulo === 'string' ? (
                  <h2 className="text-lg font-extrabold text-[#0b2545] tracking-tight leading-tight">
                    {titulo}
                  </h2>
                ) : (
                  titulo
                )}
                {subtitulo && (
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {subtitulo}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={aoFechar}
              aria-label="Fechar Modal"
              className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0 ml-2"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* ─── 2. Corpo Conteúdo (Rolável) ───────────────────────────────── */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {formId ? (
            children
          ) : (
            children
          )}
        </div>

        {/* ─── 3. Rodapé com Ações ────────────────────────────────────────── */}
        {rodape && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-3 rounded-b-3xl shrink-0">
            {rodape}
          </div>
        )}
      </div>
    </div>,
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
          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
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
    <section className={`space-y-4 ${className}`}>
      <h3 className="pb-2 text-[12px] font-extrabold tracking-wider text-blue-600 uppercase border-b border-slate-100 flex items-center gap-2">
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
  const estilosVariante =
    variante === 'primario'
      ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs hover:shadow-md border border-transparent'
      : variante === 'perigo'
        ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-xs border border-transparent'
        : 'bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 border border-slate-200/90 shadow-2xs';

  return (
    <button
      type={tipo}
      form={formId}
      disabled={desabilitado || carregando}
      onClick={aoClicar}
      className={`h-10 px-5 text-xs font-bold rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${estilosVariante} ${className}`}
    >
      {carregando ? (
        <>
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="32" strokeDashoffset="10" />
          </svg>
          <span>Aguarde...</span>
        </>
      ) : (
        rotulo
      )}
    </button>
  );
};

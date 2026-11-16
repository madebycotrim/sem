import { type FC, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, X } from 'lucide-react';

export interface ToastAvisoProps {
  mensagem: string | null;
  titulo?: string;
  aoFechar: () => void;
  duracaoMs?: number;
}

/**
 * Notificação discreta flutuante no canto inferior direito da tela.
 * Fecha automaticamente após `duracaoMs` ou ao clicar no botão de fechar.
 */
export const ToastAviso: FC<ToastAvisoProps> = ({
  mensagem,
  titulo = 'Ação não permitida',
  aoFechar,
  duracaoMs = 5500,
}) => {
  useEffect(() => {
    if (!mensagem) return undefined;
    const timer = window.setTimeout(aoFechar, duracaoMs);
    return () => window.clearTimeout(timer);
  }, [mensagem, duracaoMs, aoFechar]);

  if (!mensagem || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[99999] max-w-[360px] w-[calc(100vw-2rem)] animate-slide-up pointer-events-auto"
    >
      <div className="flex items-start gap-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_18px_48px_rgba(15,23,42,0.14)] p-3.5">
        <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12.5px] font-bold text-slate-800 leading-tight">
            {titulo}
          </p>
          <p className="mt-1 text-[11.5px] font-medium text-slate-600 leading-relaxed">
            {mensagem}
          </p>
        </div>
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar aviso"
          className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>,
    document.body
  );
};

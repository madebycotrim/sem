import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Timeout de Sessão por Inatividade.
 *
 * Monitora atividade do usuário (mouse, teclado, toque) e exibe
 * modal de aviso antes do logout automático. Projetado para notebooks
 * compartilhados por múltiplos operadores no mesmo turno.
 *
 * Fluxo:
 * 1. Timer de inatividade inicia no mount (padrão: 10 min)
 * 2. Cada interação do usuário reseta o timer
 * 3. Aos 2 minutos finais: exibe modal de aviso
 * 4. Se o usuário não interagir: dispara logout automático
 * 5. Se o usuário clicar "Continuar": reseta o timer
 */

interface TimeoutSessaoProps {
  /** Timeout total em minutos (padrão: 10) */
  tempoLimiteMinutos?: number;
  /** Tempo de aviso antes do logout, em segundos (padrão: 120 = 2 min) */
  tempoAvisoSegundos?: number;
  /** Callback executado no logout automático */
  aoExpirar: () => void;
}

export function TimeoutSessao({
  tempoLimiteMinutos = 10,
  tempoAvisoSegundos = 120,
  aoExpirar,
}: TimeoutSessaoProps) {
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(tempoAvisoSegundos);
  const timerInatividade = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerContagem = useRef<ReturnType<typeof setInterval> | null>(null);

  const tempoLimiteMs = tempoLimiteMinutos * 60 * 1000;
  const tempoAvisoMs = tempoAvisoSegundos * 1000;

  const limparTimers = useCallback(() => {
    if (timerInatividade.current) {
      clearTimeout(timerInatividade.current);
      timerInatividade.current = null;
    }
    if (timerContagem.current) {
      clearInterval(timerContagem.current);
      timerContagem.current = null;
    }
  }, []);

  const iniciarContagem = useCallback(() => {
    setSegundosRestantes(tempoAvisoSegundos);
    setMostrarAviso(true);

    timerContagem.current = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          limparTimers();
          setMostrarAviso(false);
          aoExpirar();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [tempoAvisoSegundos, aoExpirar, limparTimers]);

  const resetarTimer = useCallback(() => {
    limparTimers();
    setMostrarAviso(false);

    // Timer principal: dispara aviso quando faltam `tempoAvisoMs`
    timerInatividade.current = setTimeout(() => {
      iniciarContagem();
    }, tempoLimiteMs - tempoAvisoMs);
  }, [tempoLimiteMs, tempoAvisoMs, limparTimers, iniciarContagem]);

  useEffect(() => {
    const eventos = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];

    const handleAtividade = () => {
      if (!mostrarAviso) {
        resetarTimer();
      }
    };

    eventos.forEach((evento) =>
      document.addEventListener(evento, handleAtividade, { passive: true })
    );

    // Iniciar timer
    resetarTimer();

    return () => {
      limparTimers();
      eventos.forEach((evento) =>
        document.removeEventListener(evento, handleAtividade)
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinuar = () => {
    resetarTimer();
  };

  const formatarTempo = (segundos: number): string => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${seg.toString().padStart(2, '0')}`;
  };

  if (!mostrarAviso) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="titulo-timeout-sessao"
      aria-describedby="timeout-descricao"
    >
      <div
        className="
          mx-4 w-full max-w-md rounded-2xl bg-white p-6
          shadow-2xl animacao-fadeIn
        "
      >
        {/* Ícone de alerta */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
          <svg
            className="h-6 w-6 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h2
          id="timeout-titulo"
          className="mb-2 text-center text-lg font-bold text-gray-900"
        >
          Sessão expirando
        </h2>

        <p
          id="timeout-descricao"
          className="mb-1 text-center text-sm text-gray-600"
        >
          Sua sessão será encerrada automaticamente por inatividade em:
        </p>

        {/* Timer visual */}
        <div className="my-4 text-center">
          <span
            className={`
              text-4xl font-mono font-bold
              ${segundosRestantes <= 30 ? 'text-red-600' : 'text-amber-600'}
            `}
          >
            {formatarTempo(segundosRestantes)}
          </span>
        </div>

        <p className="mb-6 text-center text-xs text-gray-500">
          O notebook é compartilhado — o logout automático protege os dados dos
          pacientes (LGPD).
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleContinuar}
            className="
              flex-1 rounded-2xl bg-emerald-600 px-4 py-2.5
              text-sm font-semibold text-white
              hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500
              focus:ring-offset-2 transition-colors
            "
            autoFocus
          >
            Continuar trabalhando
          </button>
          <button
            onClick={aoExpirar}
            className="
              rounded-2xl border border-gray-300 px-4 py-2.5
              text-sm font-semibold text-gray-700
              hover:bg-gray-50 focus:ring-2 focus:ring-gray-400
              focus:ring-offset-2 transition-colors
            "
          >
            Sair agora
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

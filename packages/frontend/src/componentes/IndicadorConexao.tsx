import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { bancoOffline } from '../servicos/filaOffline.ts';

/**
 * Indicador visual de status de conexão.
 *
 * Exibe um badge compacto no header com:
 * - 🟢 Online (verde)
 * - 🔴 Offline (vermelho)
 * - Contador de atendimentos pendentes de envio
 *
 * Usa navigator.onLine + event listeners para detecção em tempo real.
 */
export function IndicadorConexao() {
  const [estaOnline, setEstaOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setEstaOnline(true);
    const handleOffline = () => setEstaOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const pendentes = useLiveQuery(
    () =>
      bancoOffline.atendimentosPendentes
        .where('status')
        .anyOf(['pendente', 'erro'])
        .count(),
    [],
    0
  );

  return (
    <div
      className="flex items-center gap-2"
      role="status"
      aria-live="polite"
      aria-label={`Status de conexão: ${estaOnline ? 'online' : 'offline'}`}
    >
      {/* Indicador de conexão */}
      <span
        className={`
          inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
          text-xs font-semibold transition-colors
          ${
            estaOnline
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-red-100 text-red-800'
          }
        `}
      >
        <span
          className={`
            h-2 w-2 rounded-full
            ${estaOnline ? 'bg-emerald-500' : 'bg-red-500 animacao-pulso'}
          `}
        />
        {estaOnline ? 'Online' : 'Offline'}
      </span>

      {/* Contador de pendentes */}
      {pendentes > 0 && (
        <span
          className="
            inline-flex items-center gap-1 rounded-full
            bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800
          "
          title={`${pendentes} atendimento(s) pendente(s) de sincronização`}
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {pendentes} pendente{pendentes > 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}

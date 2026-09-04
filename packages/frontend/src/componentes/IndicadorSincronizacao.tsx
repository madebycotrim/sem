import { useState, useCallback } from 'react';
import { sincronizarFila } from '../servicos/filaOffline.ts';

/**
 * Indicador de progresso da sincronização da fila offline.
 *
 * Mostra um toast/notificação com resultado da sincronização
 * e um botão para forçar sync manual.
 */
export function IndicadorSincronizacao() {
  const [estaSincronizando, setEstaSincronizando] = useState(false);
  const [resultado, setResultado] = useState<{
    sincronizados: number;
    erros: number;
  } | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const handleSincronizar = useCallback(async () => {
    setEstaSincronizando(true);
    setResultado(null);

    try {
      const res = await sincronizarFila();
      setResultado(res);
      setMostrarResultado(true);

      // Esconde o resultado após 5 segundos
      setTimeout(() => setMostrarResultado(false), 5000);
    } catch (erro) {
      setResultado({ sincronizados: 0, erros: 1 });
      setMostrarResultado(true);
      setTimeout(() => setMostrarResultado(false), 5000);
    } finally {
      setEstaSincronizando(false);
    }
  }, []);

  return (
    <div className="relative">
      {/* Botão de sync manual */}
      <button
        onClick={handleSincronizar}
        disabled={estaSincronizando}
        className={`
          inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5
          text-xs font-semibold transition-all
          ${
            estaSincronizando
              ? 'bg-blue-100 text-blue-600 cursor-wait'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
          }
        `}
        title="Sincronizar atendimentos pendentes"
        aria-label="Sincronizar atendimentos pendentes com o servidor"
      >
        <svg
          className={`h-3.5 w-3.5 ${estaSincronizando ? 'animate-spin' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {estaSincronizando ? 'Sincronizando...' : 'Sincronizar'}
      </button>

      {/* Toast de resultado */}
      {mostrarResultado && resultado && (
        <div
          className={`
            absolute right-0 top-full mt-2 z-50
            rounded-lg px-4 py-3 text-sm font-medium shadow-lg
            animacao-slideUp min-w-[220px]
            ${
              resultado.erros > 0
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }
          `}
          role="alert"
        >
          {resultado.erros > 0 ? (
            <>
              ⚠️ {resultado.sincronizados} sincronizado(s), {resultado.erros}{' '}
              erro(s)
            </>
          ) : resultado.sincronizados > 0 ? (
            <>✅ {resultado.sincronizados} atendimento(s) sincronizado(s)</>
          ) : (
            <>📋 Nenhum atendimento pendente</>
          )}
        </div>
      )}
    </div>
  );
}

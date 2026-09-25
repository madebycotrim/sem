import { useState, useRef, useEffect, type FC } from 'react';
import { StatusAtendimento, STATUS_ATENDIMENTO_LABELS } from '../../compartilhado/index.ts';

export interface EstiloStatus {
  rotulo: string;
  fundo: string;
  texto: string;
  borda: string;
  ponto: string;
  animarPonto?: boolean;
}

export const obterEstiloStatusAtendimento = (
  status?: string | StatusAtendimento | null
): EstiloStatus => {
  const s = String(status || '').toUpperCase().trim();

  if (s.includes('CANCEL') || s.includes('DESIST')) {
    return {
      rotulo: 'Cancelado',
      fundo: 'bg-rose-50',
      texto: 'text-rose-700',
      borda: 'border-rose-200',
      ponto: 'bg-rose-500',
      animarPonto: false,
    };
  }

  if (s.includes('FALT') || s.includes('AUSENT')) {
    return {
      rotulo: 'Faltou',
      fundo: 'bg-slate-100',
      texto: 'text-slate-700',
      borda: 'border-slate-200',
      ponto: 'bg-slate-400',
      animarPonto: false,
    };
  }

  if (s === 'AGUARDANDO') {
    return {
      rotulo: 'Aguardando',
      fundo: 'bg-amber-50',
      texto: 'text-amber-800',
      borda: 'border-amber-200',
      ponto: 'bg-amber-500',
      animarPonto: true,
    };
  }

  if (s === 'AGENDADO') {
    return {
      rotulo: 'Agendado',
      fundo: 'bg-amber-50',
      texto: 'text-amber-800',
      borda: 'border-amber-200',
      ponto: 'bg-amber-500',
      animarPonto: false,
    };
  }

  if (s === 'CONFIRMADO') {
    return {
      rotulo: 'Confirmado',
      fundo: 'bg-violet-50',
      texto: 'text-violet-700',
      borda: 'border-violet-200',
      ponto: 'bg-violet-500',
      animarPonto: false,
    };
  }

  if (s === 'EM_ATENDIMENTO' || s === 'EM_ANDAMENTO') {
    return {
      rotulo: 'Em Atendimento',
      fundo: 'bg-blue-50',
      texto: 'text-blue-700',
      borda: 'border-blue-200',
      ponto: 'bg-blue-500',
      animarPonto: false,
    };
  }

  return {
    rotulo: 'Concluído',
    fundo: 'bg-emerald-50',
    texto: 'text-emerald-700',
    borda: 'border-emerald-200',
    ponto: 'bg-emerald-500',
    animarPonto: false,
  };
};

export interface StatusAtendimentoBadgeProps {
  status?: string | StatusAtendimento | null;
  aoAlterar?: (novoStatus: StatusAtendimento) => void;
  podeEditar?: boolean;
  className?: string;
}

export const StatusAtendimentoBadge: FC<StatusAtendimentoBadgeProps> = ({
  status,
  aoAlterar,
  podeEditar = false,
  className = '',
}) => {
  const [menuAberto, setMenuAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const estilo = obterEstiloStatusAtendimento(status);

  useEffect(() => {
    if (!menuAberto) return;
    const fecharAoClicarFora = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuAberto(false);
      }
    };
    document.addEventListener('mousedown', fecharAoClicarFora);
    return () => document.removeEventListener('mousedown', fecharAoClicarFora);
  }, [menuAberto]);

  const ehEditavel = Boolean(podeEditar && aoAlterar);

  const badgeSpan = (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl text-[11px] font-semibold ${estilo.fundo} ${estilo.texto} border ${estilo.borda} transition-all select-none ${
        ehEditavel ? 'cursor-pointer hover:shadow-xs active:scale-95' : ''
      } ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${estilo.ponto} ${
          estilo.animarPonto ? 'animate-pulse' : ''
        }`}
        aria-hidden="true"
      />
      <span>{estilo.rotulo}</span>
    </span>
  );

  if (!ehEditavel) {
    return badgeSpan;
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setMenuAberto((prev) => !prev)}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-2xl cursor-pointer"
        title="Clique para alterar o status"
      >
        {badgeSpan}
      </button>

      {menuAberto && (
        <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[160px] bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 p-1.5 animate-fade-in text-left">
          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Alterar Status
          </div>
          <div className="space-y-0.5">
            {Object.entries(STATUS_ATENDIMENTO_LABELS).map(([valor, rotulo]) => {
              const opcaoEstilo = obterEstiloStatusAtendimento(valor);
              const selecionado = (status || StatusAtendimento.CONCLUIDO) === valor;
              return (
                <button
                  key={valor}
                  type="button"
                  onClick={() => {
                    setMenuAberto(false);
                    aoAlterar?.(valor as StatusAtendimento);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer ${
                    selecionado
                      ? 'bg-slate-100 text-slate-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${opcaoEstilo.ponto}`} />
                    <span>{rotulo}</span>
                  </span>
                  {selecionado && <span className="text-blue-600 text-xs font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

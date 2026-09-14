import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Clock, LogOut, RotateCcw, ShieldCheck } from 'lucide-react';
import { Botao } from './Botao.tsx';

/**
 * Timeout de Sessão por Inatividade Inteligente (LGPD & Segurança em Saúde).
 *
 * Monitora atividade do usuário e exibe popup com contagem regressiva nos últimos segundos.
 *
 * Características Inteligentes:
 * 1. Sincronização multi-aba via localStorage: atividade em qualquer aba renova a sessão em todas.
 * 2. Imune a suspensão de abas (sleep / background tab): cálculo baseado em timestamp real (Date.now()).
 * 3. Popup com contagem regressiva visual dinâmica e botão explícito para Cancelar / Continuar.
 * 4. Suporte a atalhos de teclado (Enter / Esc) enquanto o modal estiver visível.
 */

export interface TimeoutSessaoProps {
  /** Timeout total em minutos (padrão: 5 minutos) */
  tempoLimiteMinutos?: number;
  /** Tempo de aviso antes do logout, em segundos (padrão: 30 segundos) */
  tempoAvisoSegundos?: number;
  /** Callback executado no logout automático */
  aoExpirar: () => void;
  /** Desabilita completamente o timeout para perfis de operação permanente (ex: BOOTSTRAP) */
  imune?: boolean;
}

const CHAVE_STORAGE_ATIVIDADE = 'sem_sessao_ultima_atividade';
const CHAVE_STORAGE_LOGOUT = 'sem_sessao_logout_broadcast';

function obterTimestampAtividadeStorage(): number {
  try {
    const val = localStorage.getItem(CHAVE_STORAGE_ATIVIDADE);
    if (val) {
      const num = Number(val);
      if (!Number.isNaN(num) && num > 0) return num;
    }
  } catch {
    // Ignora restrições de localStorage em ambientes privados
  }
  return Date.now();
}

function salvarTimestampAtividadeStorage(timestamp: number): void {
  try {
    localStorage.setItem(CHAVE_STORAGE_ATIVIDADE, timestamp.toString());
  } catch {
    // Fallback silencioso
  }
}

function dispararLogoutStorage(): void {
  try {
    localStorage.setItem(CHAVE_STORAGE_LOGOUT, Date.now().toString());
  } catch {
    // Fallback silencioso
  }
}

export function TimeoutSessao({
  tempoLimiteMinutos = 5,
  tempoAvisoSegundos = 30,
  aoExpirar,
  imune = false,
}: TimeoutSessaoProps) {
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(tempoAvisoSegundos);

  const tempoLimiteMs = tempoLimiteMinutos * 60 * 1000;
  const tempoAvisoMs = tempoAvisoSegundos * 1000;
  const tempoInatividadeAvisoMs = tempoLimiteMs - tempoAvisoMs;

  const ultimaAtividadeRef = useRef<number>(Date.now());
  const avisoAtivoRef = useRef<boolean>(false);
  const callbackAoExpirarRef = useRef(aoExpirar);

  useEffect(() => {
    callbackAoExpirarRef.current = aoExpirar;
  }, [aoExpirar]);

  // Função para renovar a sessão e cancelar o encerramento
  const renovarSessao = useCallback(() => {
    const agora = Date.now();
    ultimaAtividadeRef.current = agora;
    salvarTimestampAtividadeStorage(agora);
    avisoAtivoRef.current = false;
    setMostrarAviso(false);
    setSegundosRestantes(tempoAvisoSegundos);
  }, [tempoAvisoSegundos]);

  // Função de encerramento imediato
  const encerrarSessao = useCallback(() => {
    avisoAtivoRef.current = false;
    setMostrarAviso(false);
    dispararLogoutStorage();
    callbackAoExpirarRef.current();
  }, []);

  // Monitoramento e Verificação Contínua por Timestamp Real
  useEffect(() => {
    if (imune) return;

    // Inicializa timestamp na montagem
    const agora = Date.now();
    ultimaAtividadeRef.current = agora;
    salvarTimestampAtividadeStorage(agora);

    // Verificador periódico (a cada 500ms) resistente a throttling de abas
    const checarInatividade = () => {
      const tempoAtual = Date.now();
      const storageTime = obterTimestampAtividadeStorage();
      const ultimaAtividade = Math.max(ultimaAtividadeRef.current, storageTime);
      ultimaAtividadeRef.current = ultimaAtividade;

      const tempoInativo = tempoAtual - ultimaAtividade;
      const tempoRestanteMs = tempoLimiteMs - tempoInativo;

      // 1. Tempo limite de 5 minutos esgotado
      if (tempoRestanteMs <= 0) {
        encerrarSessao();
        return;
      }

      // 2. Faltam 30 segundos ou menos: exibir popup com contagem
      if (tempoInativo >= tempoInatividadeAvisoMs) {
        const segs = Math.max(1, Math.min(tempoAvisoSegundos, Math.ceil(tempoRestanteMs / 1000)));
        avisoAtivoRef.current = true;
        setSegundosRestantes(segs);
        setMostrarAviso(true);
      } else {
        // 3. Houve atividade recente (ex: em outra aba)
        if (avisoAtivoRef.current) {
          avisoAtivoRef.current = false;
          setMostrarAviso(false);
        }
      }
    };

    const intervaloTicker = window.setInterval(checarInatividade, 500);

    // Evento de foco ou visibilidade da aba: recalcula imediatamente
    const handleVisibilidade = () => {
      if (document.visibilityState === 'visible') {
        checarInatividade();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilidade);
    window.addEventListener('focus', handleVisibilidade);

    // Sincronização multi-aba via evento de Storage
    const handleStorage = (evento: StorageEvent) => {
      if (evento.key === CHAVE_STORAGE_ATIVIDADE && evento.newValue) {
        const novoTimestamp = Number(evento.newValue);
        if (!Number.isNaN(novoTimestamp)) {
          ultimaAtividadeRef.current = Math.max(ultimaAtividadeRef.current, novoTimestamp);
          // Se o aviso estiver aberto e outra aba interagiu, cancela o aviso
          if (Date.now() - ultimaAtividadeRef.current < tempoInatividadeAvisoMs) {
            avisoAtivoRef.current = false;
            setMostrarAviso(false);
          }
        }
      } else if (evento.key === CHAVE_STORAGE_LOGOUT) {
        // Se outra aba deslogou, encerra localmente também
        callbackAoExpirarRef.current();
      }
    };

    window.addEventListener('storage', handleStorage);

    // Captura de eventos do usuário para renovar inatividade
    const eventos = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'wheel', 'pointerdown'];
    let ultimoRegistroEvento = Date.now();

    const handleInteracaoUsuario = () => {
      // Enquanto o popup estiver aberto, a renovação requer clique ou tecla deliberada
      if (avisoAtivoRef.current) return;

      const agoraInteracao = Date.now();
      // Throttle de 1500ms para evitar sobrecarga de eventos de mouse
      if (agoraInteracao - ultimoRegistroEvento > 1500) {
        ultimoRegistroEvento = agoraInteracao;
        ultimaAtividadeRef.current = agoraInteracao;
        salvarTimestampAtividadeStorage(agoraInteracao);
      }
    };

    eventos.forEach((evento) => {
      window.addEventListener(evento, handleInteracaoUsuario, { passive: true });
    });

    return () => {
      window.clearInterval(intervaloTicker);
      document.removeEventListener('visibilitychange', handleVisibilidade);
      window.removeEventListener('focus', handleVisibilidade);
      window.removeEventListener('storage', handleStorage);
      eventos.forEach((evento) => {
        window.removeEventListener(evento, handleInteracaoUsuario);
      });
    };
  }, [imune, tempoLimiteMs, tempoAvisoMs, tempoInatividadeAvisoMs, tempoAvisoSegundos, encerrarSessao]);

  // Teclado para o popup: Enter ou Esc cancelam o encerramento e continuam conectado
  useEffect(() => {
    if (!mostrarAviso) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        renovarSessao();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mostrarAviso, renovarSessao]);

  if (imune || !mostrarAviso) return null;

  const porcentagemBarra = Math.max(0, Math.min(100, (segundosRestantes / tempoAvisoSegundos) * 100));
  const ehUrgente = segundosRestantes <= 10;

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-4 animate-fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="titulo-timeout-sessao"
      aria-describedby="descricao-timeout-sessao"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-scale-in">
        {/* Ícone Pulsante com Aura */}
        <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 shadow-2xs">
          {ehUrgente && (
            <span className="absolute inset-0 rounded-2xl bg-rose-400/20 animate-ping" />
          )}
          <Clock className={`h-7 w-7 ${ehUrgente ? 'text-rose-600 animate-pulse' : 'text-amber-600'}`} aria-hidden="true" />
        </div>

        {/* Título */}
        <h2
          id="titulo-timeout-sessao"
          className="text-lg sm:text-xl font-black tracking-tight text-slate-800 mb-1.5"
        >
          Você ainda está aí?
        </h2>

        {/* Descrição com Contexto de Segurança */}
        <p
          id="descricao-timeout-sessao"
          className="text-xs sm:text-[13px] text-slate-500 font-medium leading-relaxed max-w-xs mb-4"
        >
          Detectamos inatividade por quase 5 minutos. Sua sessão será encerrada automaticamente por segurança em:
        </p>

        {/* Display Visual de Contagem Regressiva */}
        <div className="w-full rounded-2xl bg-slate-50 border border-slate-150 p-4 mb-4 flex flex-col items-center">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span
              className={`text-4xl sm:text-5xl font-black tracking-tighter tabular-nums ${
                ehUrgente ? 'text-rose-600 animate-pulse' : 'text-slate-800'
              }`}
            >
              {segundosRestantes.toString().padStart(2, '0')}
            </span>
            <span className="text-sm font-bold text-slate-400">segundos</span>
          </div>

          {/* Barra de Progresso Dinâmica Decrescente */}
          <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden mt-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-linear ${
                ehUrgente ? 'bg-rose-500' : 'bg-[#0d4d7a]'
              }`}
              style={{ width: `${porcentagemBarra}%` }}
            />
          </div>
        </div>

        {/* Ações: Botão Cancelar / Continuar Conectado em Destaque */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full mb-3">
          <Botao
            onClick={renovarSessao}
            variante="primario"
            tamanho="lg"
            formato="pilula"
            className="flex-1 shadow-md hover:shadow-lg font-extrabold cursor-pointer"
            autoFocus
            icone={<RotateCcw className="w-4 h-4" />}
          >
            Cancelar (Continuar Conectado)
          </Botao>

          <Botao
            onClick={encerrarSessao}
            variante="secundario"
            tamanho="lg"
            formato="pilula"
            className="cursor-pointer text-slate-600 hover:text-rose-700 hover:border-rose-200"
            icone={<LogOut className="w-4 h-4" />}
          >
            Sair Agora
          </Botao>
        </div>

        {/* Rodapé Informativo LGPD */}
        <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-slate-400 font-medium pt-2 border-t border-slate-100 w-full">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Proteção LGPD: o encerramento automático preserva os prontuários de saúde.</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

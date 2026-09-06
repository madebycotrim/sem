import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ItemPaciente } from './TabelaPacientes.tsx';
import { calcularIdade, formatarSubtituloPaciente } from './TabelaPacientes.tsx';
import { obterEstiloAvatarGoogle } from '../utilitarios/avatarCor.ts';
import { formatarCpf } from '../servicos/apiCpf.ts';

interface CardHoverPacienteProps {
  paciente: ItemPaciente;
  children: React.ReactNode;
  aoVerDetalhes?: (paciente: ItemPaciente) => void;
  aoIniciarAtendimento?: (paciente: ItemPaciente) => void;
}

export const CardHoverPaciente: React.FC<CardHoverPacienteProps> = ({
  paciente,
  children,
  aoVerDetalhes,
  aoIniciarAtendimento,
}) => {
  const [visivel, setVisivel] = useState(false);
  const [posicao, setPosicao] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const timerAbrirRef = useRef<number | null>(null);
  const timerFecharRef = useRef<number | null>(null);

  const idade = calcularIdade(paciente.dataNascimento);

  // Fallbacks inteligentes caso algum campo não venha preenchido no mock
  const turma =
    paciente.turma ||
    (idade <= 5
      ? 'Educação Infantil'
      : idade <= 10
      ? `${idade - 5}º Ano — Fundamental I`
      : idade <= 14
      ? `${idade - 5}º Ano — Fundamental II`
      : idade <= 17
      ? `${idade - 14}ª Série — Ensino Médio`
      : 'EJA / Comunidade');

  const telefone = paciente.telefone || '(61) 98452-1190';

  const atualizarPosicao = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const larguraCard = 330;
    const alturaCard = 320;

    let top = rect.top - 10;
    let left = rect.right + 12;

    // Se estourar a borda direita da tela, posiciona à esquerda ou abaixo
    if (left + larguraCard > window.innerWidth - 16) {
      left = Math.max(16, rect.left - larguraCard - 12);
    }

    // Se estourar a borda inferior da tela, alinha pelo fundo
    if (top + alturaCard > window.innerHeight - 16) {
      top = Math.max(16, window.innerHeight - alturaCard - 16);
    }

    // Se estourar o topo
    if (top < 16) {
      top = 16;
    }

    setPosicao({ top, left });
  };

  const lidarMouseEnter = () => {
    if (timerFecharRef.current) {
      clearTimeout(timerFecharRef.current);
      timerFecharRef.current = null;
    }
    timerAbrirRef.current = window.setTimeout(() => {
      atualizarPosicao();
      setVisivel(true);
    }, 140);
  };

  const lidarMouseLeave = () => {
    if (timerAbrirRef.current) {
      clearTimeout(timerAbrirRef.current);
      timerAbrirRef.current = null;
    }
    timerFecharRef.current = window.setTimeout(() => {
      setVisivel(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timerAbrirRef.current) clearTimeout(timerAbrirRef.current);
      if (timerFecharRef.current) clearTimeout(timerFecharRef.current);
    };
  }, []);

  const estiloAvatar = obterEstiloAvatarGoogle(paciente.nome);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={lidarMouseEnter}
      onMouseLeave={lidarMouseLeave}
      className="inline-block relative cursor-pointer"
    >
      {children}

      {visivel &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={cardRef}
            onMouseEnter={lidarMouseEnter}
            onMouseLeave={lidarMouseLeave}
            style={{
              top: `${posicao.top}px`,
              left: `${posicao.left}px`,
              zIndex: 999999,
            }}
            className="fixed w-[330px] bg-white/98 backdrop-blur-md rounded-2xl border border-slate-200/95 shadow-2xl shadow-slate-900/15 p-4 text-slate-800 font-sans animate-dropdown ring-1 ring-black/5 pointer-events-auto select-none"
          >
            {/* ─── 1. Topo: Avatar Grande + Nome + Badges ─────────────────── */}
            <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
              <div
                style={estiloAvatar.style}
                className="w-11 h-11 rounded-2xl font-bold text-base flex items-center justify-center shrink-0 shadow-2xs select-none ring-2 ring-white"
              >
                {paciente.nome.charAt(0).toUpperCase()}
              </div>

              <div className="flex flex-col min-w-0 flex-1 justify-center">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight truncate">
                  {paciente.nome}
                </h4>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                  {formatarSubtituloPaciente(paciente)}
                </p>
              </div>
            </div>

            {/* ─── 2. Grade de Informações Detalhadas ───────────────────────── */}
            <div className="py-3 grid grid-cols-1 gap-2 text-xs">
              {/* Série e Turma */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100/90">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Série / Turma</span>
                  <span className="text-[11.5px] font-semibold text-slate-800 truncate">{turma}</span>
                </div>
              </div>

              {/* Telefone / Contato */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100/90">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Celular</span>
                  <span className="text-[11.5px] font-mono font-semibold text-slate-800 truncate">
                    {telefone}
                  </span>
                </div>
              </div>

              {/* Escola / Polo */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100/90">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Escola / Polo de Atendimento</span>
                  <span className="text-[11.5px] font-semibold text-slate-800 truncate" title={paciente.escolaNome}>
                    {paciente.escolaNome}
                  </span>
                </div>
              </div>

              {/* CPF e Termo LGPD */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100/90 flex flex-col">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">CPF</span>
                  <span className="text-[11px] font-mono font-semibold text-slate-700 truncate mt-0.5">
                    {paciente.cpf ? formatarCpf(paciente.cpf) : 'Não inf.'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100/90 flex flex-col">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Termo LGPD</span>
                  {paciente.termoConsentimentoStatus === 'ACEITO' ? (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-600 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Autorizado
                    </span>
                  ) : paciente.termoConsentimentoStatus === 'DISPENSADO' ? (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#14438f] mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#14438f]" />
                      Disp. Legal
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-slate-500 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Pendente
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ─── 3. Rodapé com Botões de Acesso Rápido ────────────────────── */}
            {(aoVerDetalhes || aoIniciarAtendimento) && (
              <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2">
                {aoVerDetalhes && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVisivel(false);
                      aoVerDetalhes(paciente);
                    }}
                    className="flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/90 transition-all text-center cursor-pointer shadow-2xs"
                  >
                    Ver Histórico
                  </button>
                )}
                {aoIniciarAtendimento && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVisivel(false);
                      aoIniciarAtendimento(paciente);
                    }}
                    className="flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-bold text-white transition-all text-center cursor-pointer shadow-xs"
                    style={{ background: 'linear-gradient(135deg, #034b7f 0%, #14438f 100%)', boxShadow: '0 2px 8px rgba(3,75,127,0.25)' }}
                  >
                    Atender
                  </button>
                )}
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

import { type FC, type ReactElement, useState, useRef, useEffect } from 'react';
import catrakiLogo from '../assets/catraki.png';
import { obterEstiloAvatarGoogle } from '../utilitarios/avatarCor.ts';

export type SecaoMenu =
  | 'pacientes'
  | 'filaDia'
  | 'consultas'
  | 'dashboard'
  | 'escolas'
  | 'relatorios'
  | 'usuarios'
  | 'governanca';

export type AbaNavegacao = SecaoMenu;

export interface SidebarProps {
  secaoAtiva: SecaoMenu;
  aoMudarSecao: (secao: SecaoMenu) => void;
  aoDeslogar?: () => void;
  nomeUsuario?: string;
  emailUsuario?: string;
  cargoUsuario?: string;
  perfilUsuario?: string;
}

export const Sidebar: FC<SidebarProps> = ({
  secaoAtiva,
  aoMudarSecao,
  aoDeslogar = () => {
    window.location.reload();
  },
  nomeUsuario = 'Usuário',
  emailUsuario = '',
  cargoUsuario = 'Membro',
  perfilUsuario = 'ADMIN',
}) => {
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);
  const containerSairRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (containerSairRef.current && !containerSairRef.current.contains(e.target as Node)) {
        setConfirmandoSaida(false);
      }
    };
    if (confirmandoSaida) document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, [confirmandoSaida]);
  const primeiraLetra = (nomeUsuario.trim().charAt(0) || 'U').toUpperCase();
  const estiloAvatar = obterEstiloAvatarGoogle(nomeUsuario);

  return (
    /* ─── Barra Lateral Dock Minimalista e Moderna (68px Fixos) ───────────── */
    <div className="relative w-[68px] min-w-[68px] h-screen select-none z-30 font-sans">
      <aside
        className="fixed top-0 left-0 w-[68px] h-screen bg-white/95 backdrop-blur-md border-r border-slate-200/90 shadow-2xs flex flex-col justify-between items-center py-3.5 z-40 overflow-visible"
        aria-label="Navegação Lateral do Catraki"
      >
        {/* ─── 1. Topo: Logo Oficial Catraki Limpa ───────────────────────── */}
        <div className="flex items-center justify-center shrink-0 pb-1">
          <button
            type="button"
            onClick={() => aoMudarSecao('pacientes')}
            className="p-0.5 cursor-pointer"
            aria-label="Catraki"
          >
            <img
              src={catrakiLogo}
              alt="Catraki"
              className="w-9 h-9 object-contain"
            />
          </button>
        </div>

        {/* ─── 2. Meio: Dock de Ícones Elegantes com Flyouts Instantâneos ──── */}
        <nav className="flex flex-col items-center justify-center space-y-1.5 w-full my-auto shrink-0">
          {/* Grupo 1: Atendimento & Triagem */}
          {['BOOTSTRAP', 'ADMIN', 'TRIAGEM_RECEPCAO', 'PROFISSIONAL_SAUDE'].includes(perfilUsuario) && (
            <ItemDock
              rotulo="Pacientes"
              categoria="Atendimento"
              descricao="Cadastro e prontuário dos alunos"
              ativo={secaoAtiva === 'pacientes'}
              aoClicar={() => aoMudarSecao('pacientes')}
              icone={<IconePacientes />}
            />
          )}
          {['BOOTSTRAP', 'ADMIN', 'TRIAGEM_RECEPCAO', 'PROFISSIONAL_SAUDE'].includes(perfilUsuario) && (
            <ItemDock
              rotulo="Fila do Dia"
              categoria="Atendimento"
              descricao="Ordem de chegada e prioridades"
              ativo={secaoAtiva === 'filaDia'}
              aoClicar={() => aoMudarSecao('filaDia')}
              icone={<IconeFila />}
            />
          )}
          {['BOOTSTRAP', 'ADMIN', 'PROFISSIONAL_SAUDE'].includes(perfilUsuario) && (
            <ItemDock
              rotulo="Fichas de Atendimento"
              categoria="Atendimento"
              descricao="Registro clínico das especialidades"
              ativo={secaoAtiva === 'consultas'}
              aoClicar={() => aoMudarSecao('consultas')}
              icone={<IconeConsultas />}
            />
          )}

          {/* Divisor Delicado */}
          {['BOOTSTRAP', 'ADMIN', 'TRIAGEM_RECEPCAO', 'PROFISSIONAL_SAUDE'].includes(perfilUsuario) && (
            <div className="w-7 h-[1.5px] bg-slate-100 rounded-full my-1 shrink-0" />
          )}

          {/* Grupo 2: Operação & Gestão */}
          <ItemDock
            rotulo="Dashboard do Dia"
            categoria="Operação"
            descricao="Métricas e gráficos em tempo real"
            ativo={secaoAtiva === 'dashboard'}
            aoClicar={() => aoMudarSecao('dashboard')}
            icone={<IconeDashboard />}
          />
          {['BOOTSTRAP', 'ADMIN'].includes(perfilUsuario) && (
            <ItemDock
              rotulo="Escolas"
              categoria="Operação"
              descricao="Polos escolares e unidades móveis"
              ativo={secaoAtiva === 'escolas'}
              aoClicar={() => aoMudarSecao('escolas')}
              icone={<IconeEscolas />}
            />
          )}
          {['BOOTSTRAP', 'ADMIN', 'DPO'].includes(perfilUsuario) && (
            <ItemDock
              rotulo="Relatórios"
              categoria="Operação"
              descricao="Consolidação e prestação de contas"
              ativo={secaoAtiva === 'relatorios'}
              aoClicar={() => aoMudarSecao('relatorios')}
              icone={<IconeRelatorios />}
            />
          )}

          {/* Divisor Delicado */}
          {['BOOTSTRAP', 'ADMIN', 'DPO'].includes(perfilUsuario) && (
            <div className="w-7 h-[1.5px] bg-slate-100 rounded-full my-1 shrink-0" />
          )}

          {/* Grupo 3: Segurança & Controle */}
          {['BOOTSTRAP', 'ADMIN'].includes(perfilUsuario) && (
            <ItemDock
              rotulo="Usuários & Permissões"
              categoria="Segurança"
              descricao="Controle de acesso da equipe (RBAC)"
              ativo={secaoAtiva === 'usuarios'}
              aoClicar={() => aoMudarSecao('usuarios')}
              icone={<IconeUsuarios />}
            />
          )}
          {['BOOTSTRAP', 'ADMIN', 'DPO'].includes(perfilUsuario) && (
            <ItemDock
              rotulo="Auditoria & Governança"
              categoria="Segurança"
              descricao="Trilha de auditoria e conformidade"
              ativo={secaoAtiva === 'governanca'}
              aoClicar={() => aoMudarSecao('governanca')}
              icone={<IconeGovernanca />}
            />
          )}
        </nav>

        {/* ─── 3. Rodapé: Perfil Estilo Google + Botão de Deslogar ─────────── */}
        <div className="flex flex-col items-center gap-2 pt-2.5 border-t border-slate-100 w-full shrink-0">
          {/* Avatar Estilo Google (Círculo, 1ª letra, cor automática pelo nome) */}
          <div className="relative group">
            <div
              style={estiloAvatar.style}
              className="w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center shadow-xs ring-2 ring-white hover:opacity-90 hover:scale-105 transition-all duration-200 cursor-pointer select-none"
            >
              <span>{primeiraLetra}</span>
            </div>

            {/* Card Flutuante com Dados do Usuário (Nome, Email e Cargo) */}
            <div className="absolute left-full ml-3.5 bottom-1 hidden group-hover:flex items-center z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-white/95 backdrop-blur-md text-slate-800 p-3 rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/90 whitespace-nowrap flex items-center gap-3 ring-1 ring-black/5">
                <div
                  style={estiloAvatar.style}
                  className="w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center shadow-xs shrink-0"
                >
                  {primeiraLetra}
                </div>
                <div className="flex flex-col pr-1 gap-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-extrabold text-[#0b2545] leading-tight">
                      {nomeUsuario}
                    </p>
                    <span className="text-[9.5px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100 uppercase tracking-wider">
                      {cargoUsuario}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono leading-none">
                    {emailUsuario}
                  </span>
                </div>
              </div>
              <div className="w-2.5 h-2.5 bg-white border-l border-b border-slate-200/90 rotate-45 -ml-1.5 absolute left-0 bottom-3" />
            </div>
          </div>

          {/* Botão Deslogar / Sair */}
          <div className="relative group" ref={containerSairRef}>
            <button
              type="button"
              onClick={() => {
                if (!confirmandoSaida) {
                  setConfirmandoSaida(true);
                } else {
                  setConfirmandoSaida(false);
                  aoDeslogar();
                }
              }}
              className={`w-10 h-8 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 border ${
                confirmandoSaida
                  ? 'text-white bg-rose-600 border-rose-600 shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 active:bg-rose-100 border-transparent hover:border-rose-200'
              }`}
              aria-label="Encerrar Sessão"
            >
              <svg className={`w-4 h-4 transition-transform duration-200 ${!confirmandoSaida ? 'group-hover:translate-x-0.5' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>

            {/* Tooltip do Botão Deslogar */}
            {!confirmandoSaida && (
              <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                <div className="bg-rose-50 text-rose-700 text-[11px] font-bold px-3 py-1.5 rounded-2xl shadow-lg shadow-slate-900/5 border border-rose-200 whitespace-nowrap flex items-center">
                  <span>Encerrar Sessão</span>
                </div>
                <div className="w-2 h-2 bg-rose-50 border-l border-b border-rose-200 rotate-45 -ml-1 absolute left-0 top-1/2 -translate-y-1/2" />
              </div>
            )}

            {/* Popover de Confirmação de Saída */}
            {confirmandoSaida && (
              <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 flex items-center z-50 animate-in slide-in-from-left-2 fade-in duration-200">
                <div className="bg-white text-slate-800 text-[12px] font-medium px-3 py-2 rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200 whitespace-nowrap flex items-center gap-3">
                  <span className="text-slate-500">Deseja sair?</span>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setConfirmandoSaida(false); }}
                      className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition-colors font-semibold"
                    >
                      Não
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); aoDeslogar(); setConfirmandoSaida(false); }}
                      className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-colors font-bold shadow-sm"
                    >
                      Sim
                    </button>
                  </div>
                </div>
                <div className="w-2.5 h-2.5 bg-white border-l border-b border-slate-200 rotate-45 -ml-1.5 absolute left-0 top-1/2 -translate-y-1/2" />
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

/* ─── Botão Dock Squircle com Efeito Hover Flyout Limpo ──────────────────── */

interface ItemDockProps {
  rotulo: string;
  categoria: string;
  descricao: string;
  ativo: boolean;
  aoClicar: () => void;
  icone: ReactElement;
}

const ItemDock: FC<ItemDockProps> = ({
  rotulo,
  categoria,
  descricao,
  ativo,
  aoClicar,
  icone,
}) => {
  return (
    <div className="relative group w-full h-11 flex items-center justify-center">
      {/* Botão de Navegação com Posição Fixa e Estável */}
      <button
        type="button"
        onClick={aoClicar}
        className="relative w-full h-full cursor-pointer flex items-center justify-center select-none"
        aria-label={rotulo}
      >
        {/* Fundo do Botão (Destaque Ativo vindo da direita ou Hover Inativo) */}
        <span
          className={`absolute inset-y-0 right-0 transition-all duration-200 ease-out pointer-events-none ${
            ativo
              ? 'w-full bg-gradient-to-l from-blue-100/95 via-blue-50/80 to-transparent rounded-l-2xl rounded-r-none'
              : 'w-11 h-11 left-1/2 -translate-x-1/2 rounded-2xl group-hover:bg-slate-100/80'
          }`}
        />

        {/* Indicador Vertical na Borda Direita quando Ativo */}
        <span
          className={`absolute right-0 top-1/2 -translate-y-1/2 w-[3.5px] bg-[#0066ff] rounded-l-full shadow-sm shadow-blue-500/50 transition-all duration-200 ease-out pointer-events-none ${
            ativo ? 'h-7 opacity-100 translate-x-0' : 'h-0 opacity-0 translate-x-1'
          }`}
        />

        {/* Ícone Perfeitamente Centralizado e Estático (Sem deslocamento ou tremor) */}
        <span
          className={`relative z-10 flex items-center justify-center transition-colors duration-200 ${
            ativo ? 'text-[#0066ff]' : 'text-slate-500 group-hover:text-slate-900'
          }`}
        >
          {icone}
        </span>
      </button>

      {/* ─── Tooltip Completo & Minimalista no Hover ──────────────────────── */}
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
        <div className="bg-[#0b1b33]/95 backdrop-blur-md text-white px-3 py-2 rounded-2xl shadow-xl shadow-slate-950/25 border border-slate-700/60 min-w-[190px] max-w-[240px] flex flex-col gap-0.5">
          {/* Linha Superior: Nome do Módulo + Categoria */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-bold text-white tracking-tight">
              {rotulo}
            </span>
            <span className="text-[9.5px] font-semibold text-sky-400 uppercase tracking-wider">
              {categoria}
            </span>
          </div>

          {/* Linha Inferior: Breve Síntese Funcional */}
          <p className="text-[10.5px] text-slate-300 font-normal leading-tight">
            {descricao}
          </p>
        </div>

        {/* Caret Indicador */}
        <div className="w-2 h-2 bg-[#0b1b33]/95 border-l border-b border-slate-700/60 rotate-45 -ml-1 absolute left-0 top-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
};

/* ─── Ícones SVG Vetoriais Modernos e Nítidos (20px) ─────────────────────── */

const IconePacientes = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconeFila = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconeConsultas = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const IconeDashboard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const IconeEscolas = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
    <path d="M3 21h18" />
    <path d="M5 21V7l8-4v18" />
    <path d="M19 21V11l-6-4" />
    <path d="M9 9h1" />
    <path d="M9 13h1" />
  </svg>
);

const IconeRelatorios = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 10 10h-10z" />
  </svg>
);

const IconeUsuarios = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const IconeGovernanca = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

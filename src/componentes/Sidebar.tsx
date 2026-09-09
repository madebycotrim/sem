import { type FC, type ReactElement, useState, useRef, useEffect } from 'react';
import {
  BarChart3,
  Building2,
  Clock,
  FileBarChart,
  Home,
  KeyRound,
  LogOut,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
} from 'lucide-react';
import catrakiLogo from '../assets/catraki.png';
import sesiSaudeLogo from '../assets/SESI-SAUDE.png';
import { obterEstiloAvatarGoogle } from '../utilitarios/avatarCor.ts';

export type SecaoMenu =
  | 'pacientes'
  | 'filaDia'
  | 'consultas'
  | 'dashboard'
  | 'bi'
  | 'escolas'
  | 'relatorios'
  | 'usuarios';

export type AbaNavegacao = SecaoMenu;

export interface SidebarProps {
  secaoAtiva: SecaoMenu;
  aoMudarSecao: (secao: SecaoMenu) => void;
  aoDeslogar?: () => void;
  nomeUsuario?: string;
  emailUsuario?: string;
  cargoUsuario?: string;
  perfilUsuario?: string;
  temAcesso?: (secao: SecaoMenu) => boolean;
  aoMudarSenha?: () => void;
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
  temAcesso,
  aoMudarSenha,
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
        className="fixed top-0 left-0 w-[68px] h-screen bg-white/95 backdrop-blur-md border-r border-slate-200/90 shadow-2xs flex flex-col justify-between items-center py-3 z-40 overflow-visible"
        aria-label="Navegação Lateral do Catraki"
      >
        {/* ─── 1. Topo: Logos Oficiais Catraki + SESI Saúde (Parceria) ───── */}
        <div
          className="flex flex-col items-center justify-center shrink-0 pt-0.5 pb-2 gap-1 group relative w-full"
          title="Parceria Catraki × SESI Saúde"
        >
          <button
            type="button"
            onClick={() => aoMudarSecao('dashboard')}
            className="p-1 rounded-xl hover:bg-slate-100/80 transition-all cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Catraki"
          >
            <img
              src={catrakiLogo}
              alt="Catraki"
              className="w-8 h-8 object-contain drop-shadow-2xs"
            />
          </button>

          {/* Símbolo de Parceria Estilizado: Badge Micro-chip com linhas em gradiente */}
          <div className="flex items-center justify-center w-full px-3.5 my-0.5 gap-1.5 opacity-85 group-hover:opacity-100 transition-all">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-slate-300" />
            <div className="w-3.5 h-3.5 rounded-full bg-slate-100/90 border border-slate-200/90 flex items-center justify-center shadow-3xs group-hover:border-blue-300 group-hover:bg-blue-50 group-hover:scale-110 transition-all">
              <X className="w-2 h-2 text-slate-400 group-hover:text-blue-600 stroke-[2.5] transition-colors" />
            </div>
            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-slate-200 to-slate-300" />
          </div>

          <button
            type="button"
            onClick={() => aoMudarSecao('dashboard')}
            className="p-1 rounded-xl hover:bg-slate-100/80 transition-all cursor-pointer hover:scale-105 active:scale-95"
            aria-label="SESI Saúde"
          >
            <img
              src={sesiSaudeLogo}
              alt="SESI Saúde"
              className="w-9 h-auto max-h-7 object-contain drop-shadow-2xs"
            />
          </button>
        </div>

        {/* ─── 2. Meio: Dock de Ícones Elegantes com Flyouts Instantâneos ──── */}
        <nav className="flex flex-col items-center justify-center space-y-1.5 w-full my-auto shrink-0">
          {/* Grupo 1: Início & Operação Clínico-Presencial */}
          {(!temAcesso || temAcesso('dashboard')) && (
            <ItemDock
              rotulo="Página Inicial"
              categoria="Visão Geral"
              descricao="Resumo do dia, atendimentos do SESI Saúde e atalhos rápidos"
              ativo={secaoAtiva === 'dashboard'}
              aoClicar={() => aoMudarSecao('dashboard')}
              icone={<IconeInicio />}
            />
          )}
          {(!temAcesso || temAcesso('pacientes')) && (
            <ItemDock
              rotulo="Pacientes"
              categoria="Cadastro"
              descricao="Prontuários gerais, histórico clínico e termos de consentimento"
              ativo={secaoAtiva === 'pacientes'}
              aoClicar={() => aoMudarSecao('pacientes')}
              icone={<IconePacientes />}
            />
          )}
          {(!temAcesso || temAcesso('filaDia')) && (
            <ItemDock
              rotulo="Fila do Dia"
              categoria="Recepção"
              descricao="Painel de chamadas, ordem de chegada e triagem do dia"
              ativo={secaoAtiva === 'filaDia'}
              aoClicar={() => aoMudarSecao('filaDia')}
              icone={<IconeFila />}
            />
          )}
          {(!temAcesso || temAcesso('consultas')) && (
            <ItemDock
              rotulo="Histórico Clínico"
              categoria="Saúde"
              descricao="Fichas clínicas, condutas médicas, exames e histórico completo de atendimentos"
              ativo={secaoAtiva === 'consultas'}
              aoClicar={() => aoMudarSecao('consultas')}
              icone={<IconeConsultas />}
            />
          )}

          {/* Divisor Delicado */}
          {(!temAcesso || temAcesso('dashboard') || temAcesso('pacientes') || temAcesso('filaDia') || temAcesso('consultas')) && (
            <div className="w-7 h-[1.5px] bg-slate-100 rounded-full my-1 shrink-0" />
          )}

          {/* Grupo 2: BI & Analytics */}
          {(!temAcesso || temAcesso('bi')) && (
            <ItemDock
              rotulo="Dashboard"
              categoria="BI & Indicadores"
              descricao="Indicadores operacionais, análise de demanda e gráficos temporais"
              ativo={secaoAtiva === 'bi'}
              aoClicar={() => aoMudarSecao('bi')}
              icone={<IconeBi />}
            />
          )}
          {(!temAcesso || temAcesso('relatorios')) && (
            <ItemDock
              rotulo="Relatórios & Exportação"
              categoria="Analytics"
              descricao="Filtros avançados e exportação oficial para planilhas Excel (.xlsx)"
              ativo={secaoAtiva === 'relatorios'}
              aoClicar={() => aoMudarSecao('relatorios')}
              icone={<IconeRelatorios />}
            />
          )}

          {/* Divisor Delicado */}
          {(!temAcesso || temAcesso('bi') || temAcesso('relatorios')) && (
            <div className="w-7 h-[1.5px] bg-slate-100 rounded-full my-1 shrink-0" />
          )}

          {/* Grupo 3: Gestão & Segurança */}
          {(!temAcesso || temAcesso('escolas')) && (
            <ItemDock
              rotulo="Escola"
              categoria="Instituições"
              descricao="Gestão de escolas atendidas, polos e unidades móveis"
              ativo={secaoAtiva === 'escolas'}
              aoClicar={() => aoMudarSecao('escolas')}
              icone={<IconeEscolas />}
            />
          )}
          {(!temAcesso || temAcesso('usuarios')) && (
            <ItemDock
              rotulo="Usuários & Acessos"
              categoria="Segurança"
              descricao="Gerenciamento da equipe e permissões de perfil (RBAC)"
              ativo={secaoAtiva === 'usuarios'}
              aoClicar={() => aoMudarSecao('usuarios')}
              icone={<IconeUsuarios />}
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

          {/* Botão Alterar Senha */}
          <div className="relative group">
            <button
              type="button"
              onClick={aoMudarSenha}
              className="w-10 h-8 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 border border-transparent text-slate-400 hover:text-blue-600 hover:bg-blue-50/80 active:bg-blue-100 hover:border-blue-200"
              aria-label="Alterar Senha"
            >
              <KeyRound className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            </button>

            {/* Tooltip do Botão Alterar Senha */}
            <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-blue-50 text-blue-700 text-[11px] font-bold px-3 py-1.5 rounded-2xl shadow-lg shadow-slate-900/5 border border-blue-200 whitespace-nowrap flex items-center">
                <span>Alterar Senha</span>
              </div>
              <div className="w-2 h-2 bg-blue-50 border-l border-b border-blue-200 rotate-45 -ml-1 absolute left-0 top-1/2 -translate-y-1/2" />
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
              <LogOut className={`w-4 h-4 transition-transform duration-200 ${!confirmandoSaida ? 'group-hover:translate-x-0.5' : ''}`} />
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
        <div className="bg-[#0b1b33]/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-2xl shadow-xl shadow-slate-950/25 border border-slate-700/60 min-w-[220px] max-w-[320px] flex flex-col gap-1">
          {/* Linha Superior: Nome do Módulo + Categoria */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] font-bold text-white tracking-tight whitespace-nowrap">
              {rotulo}
            </span>
            <span className="text-[9px] font-bold text-sky-400 uppercase tracking-wider shrink-0 px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-400/20">
              {categoria}
            </span>
          </div>

          {/* Linha Inferior: Breve Síntese Funcional */}
          <p className="text-[11px] text-slate-300 font-normal leading-relaxed">
            {descricao}
          </p>
        </div>

        {/* Caret Indicador */}
        <div className="w-2 h-2 bg-[#0b1b33]/95 border-l border-b border-slate-700/60 rotate-45 -ml-1 absolute left-0 top-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
};

/* ─── Ícones Lucide-React Nítidos (20px) ─────────────────────────────────── */

const IconeInicio = () => <Home className="w-5 h-5" />;

const IconePacientes = () => <Users className="w-5 h-5" />;

const IconeFila = () => <Clock className="w-5 h-5" />;

const IconeConsultas = () => <Stethoscope className="w-5 h-5" />;

const IconeBi = () => <BarChart3 className="w-5 h-5" />;

const IconeRelatorios = () => <FileBarChart className="w-5 h-5" />;

const IconeEscolas = () => <Building2 className="w-5 h-5" />;

const IconeUsuarios = () => <ShieldCheck className="w-5 h-5" />;



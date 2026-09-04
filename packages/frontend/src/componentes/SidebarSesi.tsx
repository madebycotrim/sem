import { useState, type FC, type ReactElement } from 'react';
import logo1 from '../assets/logo1.png';
import logo2 from '../assets/logo2.png';

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

interface SidebarSesiProps {
  secaoAtiva: SecaoMenu;
  aoMudarSecao: (secao: SecaoMenu) => void;
}

export const SidebarSesi: FC<SidebarSesiProps> = ({
  secaoAtiva,
  aoMudarSecao,
}) => {
  const [expandida, setExpandida] = useState(false);

  return (
    /* ─── Container Estático para Reservar Espaço (Zero Layout Shift) ────── */
    <div className="relative w-16 min-w-16 h-screen select-none z-30 font-sans">
      {/* ─── Barra Lateral com Transição Fluida no Hover ──────────────────── */}
      <aside
        onMouseEnter={() => setExpandida(true)}
        onMouseLeave={() => setExpandida(false)}
        className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200/80 flex flex-col justify-between transition-[width,box-shadow] duration-300 ease-in-out will-change-[width] z-40 overflow-hidden ${
          expandida ? 'w-64 shadow-xl' : 'w-16 shadow-none'
        }`}
        aria-label="Navegação Lateral do Sistema"
      >
        {/* ─── Conteúdo Superior ──────────────────────────────────────────── */}
        <div className="flex flex-col w-64 min-w-[256px]">
          {/* ─── Topo: Logotipo Oficial (Sem bordas, alinhamento perfeito) ─── */}
          <div className="h-20 border-b border-slate-100 relative overflow-hidden shrink-0">
            {/* Fechada: Logo 1 perfeitamente centralizada nos 64px (x = 32px) */}
            <div
              className={`absolute top-0 left-0 w-16 h-20 flex items-center justify-center transition-opacity duration-200 cursor-pointer ${
                expandida ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
              onClick={() => aoMudarSecao('pacientes')}
            >
              <img
                src={logo1}
                alt="SESI Saúde"
                className="w-9 h-9 object-contain"
              />
            </div>

            {/* Aberta: Logo 2 sem bordas + SAÚDE EM MOVIMENTO centralizados nos 256px */}
            <div
              className={`absolute top-0 left-0 w-64 h-20 flex flex-col items-center justify-center px-4 transition-opacity duration-200 cursor-pointer ${
                expandida ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              onClick={() => aoMudarSecao('pacientes')}
            >
              <div className="relative w-full flex items-center justify-center">
                <img
                  src={logo2}
                  alt="SESI Saúde"
                  className="h-8 max-w-[155px] object-contain"
                />
                <div className="absolute right-1 text-slate-300">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-1 font-sans text-[9.5px] font-black tracking-widest uppercase">
                <span className="text-[#0b2545]">SAÚDE</span>
                <span className="text-[#38bdf8]">EM MOVIMENTO</span>
              </div>
            </div>
          </div>

          {/* ─── 8 Módulos Essenciais com Design Elegante e Ícones Alinhados ─── */}
          <div className="px-2 py-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {/* Grupo 1: Atendimento & Triagem */}
            <div className="mb-2">
              <div className="h-6 flex items-center">
                {expandida ? (
                  <div className="px-2.5 w-full flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Atendimento & Triagem</span>
                    <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-6 h-[1px] bg-slate-200/80 mx-auto" />
                )}
              </div>

              <div className="space-y-0.5 mt-0.5">
                <ItemMenu
                  rotulo="Pacientes"
                  ativo={secaoAtiva === 'pacientes'}
                  expandida={expandida}
                  aoClicar={() => aoMudarSecao('pacientes')}
                  icone={<IconePacientes />}
                />
                <ItemMenu
                  rotulo="Fila do Dia / Triagem"
                  ativo={secaoAtiva === 'filaDia'}
                  expandida={expandida}
                  aoClicar={() => aoMudarSecao('filaDia')}
                  icone={<IconeFila />}
                />
                <ItemMenu
                  rotulo="Fichas de Atendimento"
                  ativo={secaoAtiva === 'consultas'}
                  expandida={expandida}
                  aoClicar={() => aoMudarSecao('consultas')}
                  icone={<IconeConsultas />}
                />
              </div>
            </div>

            {/* Grupo 2: Operação & Gestão */}
            <div className="mb-2">
              <div className="h-6 flex items-center">
                {expandida ? (
                  <div className="px-2.5 w-full flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Operação & Gestão</span>
                    <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-6 h-[1px] bg-slate-200/80 mx-auto" />
                )}
              </div>

              <div className="space-y-0.5 mt-0.5">
                <ItemMenu
                  rotulo="Dashboard do Dia"
                  ativo={secaoAtiva === 'dashboard'}
                  expandida={expandida}
                  aoClicar={() => aoMudarSecao('dashboard')}
                  icone={<IconeDashboard />}
                />
                <ItemMenu
                  rotulo="Escolas & Unidades"
                  ativo={secaoAtiva === 'escolas'}
                  expandida={expandida}
                  aoClicar={() => aoMudarSecao('escolas')}
                  icone={<IconeEscolas />}
                />
                <ItemMenu
                  rotulo="Relatórios (UnB/Finatec)"
                  ativo={secaoAtiva === 'relatorios'}
                  expandida={expandida}
                  aoClicar={() => aoMudarSecao('relatorios')}
                  icone={<IconeRelatorios />}
                />
              </div>
            </div>

            {/* Grupo 3: Segurança & Controle */}
            <div>
              <div className="h-6 flex items-center">
                {expandida ? (
                  <div className="px-2.5 w-full flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Segurança & Controle</span>
                    <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-6 h-[1px] bg-slate-200/80 mx-auto" />
                )}
              </div>

              <div className="space-y-0.5 mt-0.5">
                <ItemMenu
                  rotulo="Usuários & Perfis"
                  ativo={secaoAtiva === 'usuarios'}
                  expandida={expandida}
                  aoClicar={() => aoMudarSecao('usuarios')}
                  icone={<IconeUsuarios />}
                />
                <ItemMenu
                  rotulo="Governança & Auditoria"
                  ativo={secaoAtiva === 'governanca'}
                  expandida={expandida}
                  aoClicar={() => aoMudarSecao('governanca')}
                  icone={<IconeGovernanca />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Rodapé Limpo Institucional ─────────────────────────────────── */}
        <div className="h-12 border-t border-slate-100 relative overflow-hidden shrink-0 w-64 min-w-[256px]">
          {/* Fechada: "SESI" centralizado nos 64px */}
          <div
            className={`absolute top-0 left-0 w-16 h-12 flex items-center justify-center transition-opacity duration-200 ${
              expandida ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400">SESI</span>
          </div>

          {/* Aberta: Texto institucional completo centralizado nos 256px */}
          <div
            className={`absolute top-0 left-0 w-64 h-12 flex items-center justify-center px-4 transition-opacity duration-200 ${
              expandida ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <span className="text-[11.5px] text-slate-400 font-medium whitespace-nowrap">
              Escola Cidadã • SESI / UnB / Finatec
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
};

/* ─── Item de Menu com Geometria Fixa para Zero Layout Shift ──────────────── */

interface ItemMenuProps {
  rotulo: string;
  ativo: boolean;
  expandida: boolean;
  aoClicar: () => void;
  icone: ReactElement;
}

const ItemMenu: FC<ItemMenuProps> = ({ rotulo, ativo, expandida, aoClicar, icone }) => {
  return (
    <button
      type="button"
      onClick={aoClicar}
      className={`w-full flex items-center h-10 rounded-xl transition-colors duration-150 cursor-pointer overflow-hidden ${
        ativo
          ? 'bg-[#edf5ff] text-[#0066ff] font-bold shadow-2xs'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
      }`}
    >
      {/* 
        Container do Ícone: exatamente 48px de largura (w-12).
        Como o botão tem 48px dentro da sidebar de 64px (com padding de 8px em cada lado),
        o ícone fica exatamente a (48 - 20) / 2 = 14px da borda do botão, 
        o que o posiciona em x = 8 + 14 = 22px (centro exato em x = 32px da barra fechada!).
        Quando a barra abre para 256px, o ícone permanece NO MESMO PIXEL EXATO (x = 32px)!
      */}
      <span
        className={`w-12 h-10 flex items-center justify-center shrink-0 transition-colors ${
          ativo ? 'text-[#0066ff]' : 'text-slate-400'
        }`}
      >
        {icone}
      </span>

      {/* Rótulo com Fonte Aumentada (13.5px) e Transição Suave de Opacidade */}
      <span
        className={`whitespace-nowrap transition-opacity duration-200 text-left text-[13.5px] pr-3 flex-1 ${
          expandida ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {rotulo}
      </span>
    </button>
  );
};

/* ─── Ícones SVG Vetoriais Nítidos (Tamanho Perfeito: 19px) ───────────────── */

const IconePacientes = () => (
  <svg className="w-[19px] h-[19px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconeFila = () => (
  <svg className="w-[19px] h-[19px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconeConsultas = () => (
  <svg className="w-[19px] h-[19px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const IconeDashboard = () => (
  <svg className="w-[19px] h-[19px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const IconeEscolas = () => (
  <svg className="w-[19px] h-[19px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M3 21h18" />
    <path d="M5 21V7l8-4v18" />
    <path d="M19 21V11l-6-4" />
    <path d="M19 21V11l-6-4" />
    <path d="M9 9h1" />
    <path d="M9 13h1" />
  </svg>
);

const IconeRelatorios = () => (
  <svg className="w-[19px] h-[19px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 10 10h-10z" />
  </svg>
);

const IconeUsuarios = () => (
  <svg className="w-[19px] h-[19px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const IconeGovernanca = () => (
  <svg className="w-[19px] h-[19px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

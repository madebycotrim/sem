import { useState, type FC, type ReactElement } from 'react';

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
        className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200/90 flex flex-col justify-between transition-[width,box-shadow] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[width] z-40 overflow-hidden ${
          expandida ? 'w-64 shadow-2xl ring-1 ring-black/5' : 'w-16 shadow-xs'
        }`}
        aria-label="Navegação Lateral do Sistema"
      >
        {/* ─── Topo: Logotipo Oficial SESI Saúde / Saúde em Movimento ──────── */}
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-center h-20 px-3 border-b border-slate-100 overflow-hidden">
            {expandida ? (
              <div
                className="flex flex-col items-center justify-center cursor-pointer transition-all duration-300 anim-surgir"
                onClick={() => aoMudarSecao('pacientes')}
                title="SESI Saúde — Saúde em Movimento"
              >
                {/* Pílula Arredondada SESI Saúde */}
                <div className="flex items-center gap-1.5 px-4 py-1 rounded-full border border-sky-400/90 bg-white shadow-2xs">
                  <span className="text-sm font-black tracking-tight text-[#0b2545]">SESI</span>
                  <span className="text-sm font-serif italic font-semibold text-[#0284c7]">Saúde</span>
                </div>
                {/* Subtítulo Saúde em Movimento */}
                <span className="text-[8.5px] font-black tracking-wider uppercase mt-1 text-[#0b2545]">
                  SAÚDE <span className="text-[#0284c7] font-bold">EM MOVIMENTO</span>
                </span>
              </div>
            ) : (
              /* Ícone Compacto quando Recolhido */
              <div
                className="w-10 h-10 flex flex-col items-center justify-center rounded-xl bg-blue-50/80 border border-blue-100 text-blue-900 font-extrabold text-[11px] shadow-2xs cursor-pointer"
                title="SESI Saúde — Saúde em Movimento"
                onClick={() => aoMudarSecao('pacientes')}
              >
                <span className="leading-none text-[#0b2545] font-black text-xs">SESI</span>
                <span className="text-[6.5px] text-[#0284c7] font-bold uppercase tracking-wider">Saúde</span>
              </div>
            )}
          </div>

          {/* ─── 8 Módulos Essenciais Organizados por Grupos ─────────────────── */}
          <div className="overflow-y-auto overflow-x-hidden px-2.5 py-3.5 space-y-4 max-h-[calc(100vh-140px)]">
            {/* Grupo 1: ATENDIMENTO & TRIAGEM */}
            <div>
              <div className="h-5 flex items-center px-1 overflow-hidden mb-1">
                {expandida ? (
                  <div className="flex items-center justify-between w-full text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Atendimento & Triagem</span>
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-6 h-[1px] bg-slate-200 mx-auto" />
                )}
              </div>

              <div className="space-y-1">
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

            {/* Grupo 2: OPERAÇÃO & GESTÃO */}
            <div>
              <div className="h-5 flex items-center px-1 overflow-hidden mb-1">
                {expandida ? (
                  <div className="flex items-center justify-between w-full text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Operação & Gestão</span>
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-6 h-[1px] bg-slate-200 mx-auto" />
                )}
              </div>

              <div className="space-y-1">
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

            {/* Grupo 3: SEGURANÇA & CONTROLE */}
            <div>
              <div className="h-5 flex items-center px-1 overflow-hidden mb-1">
                {expandida ? (
                  <div className="flex items-center justify-between w-full text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Segurança & Controle</span>
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-6 h-[1px] bg-slate-200 mx-auto" />
                )}
              </div>

              <div className="space-y-1">
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

        {/* Rodapé Limpo Institucional */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-center shrink-0">
          {expandida ? (
            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap anim-surgir">
              Escola Cidadã • SESI / UnB / Finatec
            </span>
          ) : (
            <span className="text-[9px] font-bold text-slate-400">
              SESI
            </span>
          )}
        </div>
      </aside>
    </div>
  );
};

/* ─── Item de Menu Individual ──────────────────────────────────────────────── */

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
      title={rotulo}
      className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer overflow-hidden relative ${
        ativo
          ? 'bg-blue-50/80 border border-blue-200/80 text-[#0066ff] shadow-2xs'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/90 border border-transparent'
      } ${expandida ? 'px-3 py-2 gap-3' : 'justify-center py-2 px-0'}`}
    >
      <span className={`w-4 h-4 flex items-center justify-center shrink-0 ${ativo ? 'text-[#0066ff]' : 'text-slate-400'}`}>
        {icone}
      </span>
      <span
        className={`whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden flex-1 text-left ${
          expandida ? 'opacity-100 max-w-[170px] translate-x-0' : 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
        }`}
      >
        {rotulo}
      </span>
    </button>
  );
};

/* ─── Ícones SVG Vetoriais Nítidos ─────────────────────────────────────────── */

const IconePacientes = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconeFila = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconeConsultas = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const IconeDashboard = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const IconeEscolas = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M3 21h18" />
    <path d="M5 21V7l8-4v18" />
    <path d="M19 21V11l-6-4" />
    <path d="M9 9h1" />
    <path d="M9 13h1" />
  </svg>
);

const IconeRelatorios = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 10 10h-10z" />
  </svg>
);

const IconeUsuarios = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const IconeGovernanca = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

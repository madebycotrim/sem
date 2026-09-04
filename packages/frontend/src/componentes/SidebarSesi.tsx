import { type FC, type ReactElement } from 'react';

export type AbaNavegacao =
  | 'dashboard'
  | 'pacientes'
  | 'atendimentos'
  | 'triagem'
  | 'escolas'
  | 'filaOffline'
  | 'documentos';

interface SidebarSesiProps {
  abaAtiva: AbaNavegacao;
  aoMudarAba: (aba: AbaNavegacao) => void;
  estaOnline: boolean;
  itensPendentes: number;
  aoAbrirSincronizacao: () => void;
  iniciaisUsuario?: string;
  nomeUsuario?: string;
  perfilUsuario?: string;
}

export const SidebarSesi: FC<SidebarSesiProps> = ({
  abaAtiva,
  aoMudarAba,
  estaOnline,
  itensPendentes,
  aoAbrirSincronizacao,
  iniciaisUsuario = 'MC',
  nomeUsuario = 'Maria Clara (Triagem)',
  perfilUsuario = 'Triador SESI',
}) => {
  const itensMenu: Array<{
    id: AbaNavegacao;
    rotulo: string;
    icone: (ativo: boolean) => ReactElement;
    badge?: number;
  }> = [
    {
      id: 'dashboard',
      rotulo: 'Painel Geral',
      icone: (ativo) => (
        <svg
          className={`w-5 h-5 ${ativo ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      id: 'pacientes',
      rotulo: 'Pacientes',
      icone: (ativo) => (
        <svg
          className={`w-5 h-5 ${ativo ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: 'atendimentos',
      rotulo: 'Ficha de Atendimento',
      icone: (ativo) => (
        <svg
          className={`w-5 h-5 ${ativo ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M9 14h6" />
          <path d="M9 18h4" />
          <path d="M9 10h6" />
        </svg>
      ),
    },
    {
      id: 'triagem',
      rotulo: 'Triagem & Especialidades',
      icone: (ativo) => (
        <svg
          className={`w-5 h-5 ${ativo ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    },
    {
      id: 'escolas',
      rotulo: 'Escolas & Polos',
      icone: (ativo) => (
        <svg
          className={`w-5 h-5 ${ativo ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="M3 21h18" />
          <path d="M5 21V7l8-4v18" />
          <path d="M19 21V11l-6-4" />
          <path d="M9 9h1" />
          <path d="M9 13h1" />
          <path d="M9 17h1" />
        </svg>
      ),
    },
    {
      id: 'documentos',
      rotulo: 'Documentos & Termos LGPD',
      icone: (ativo) => (
        <svg
          className={`w-5 h-5 ${ativo ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className="w-16 min-w-16 h-screen bg-white border-r border-slate-200 flex flex-col justify-between items-center py-3 select-none z-30 sticky top-0"
      aria-label="Navegação Lateral Principal"
    >
      {/* ─── Topo: Logotipo SESI ─────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-4 w-full">
        <div
          className="w-10 h-10 flex flex-col items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-900 font-extrabold text-[12px] tracking-tight shadow-xs cursor-pointer"
          title="Escola Cidadã — SESI / Saúde em Movimento"
          onClick={() => aoMudarAba('pacientes')}
        >
          <span className="leading-none text-blue-800 font-black">SESI</span>
          <span className="text-[7px] text-emerald-600 font-bold uppercase tracking-widest">
            SAÚDE
          </span>
        </div>

        <div className="w-8 h-[1px] bg-slate-100" />

        {/* ─── Lista de Ícones Principais ─────────────────────────────────── */}
        <nav className="flex flex-col items-center gap-1.5 w-full px-2" role="tablist">
          {itensMenu.map((item) => {
            const ativo = abaAtiva === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={ativo}
                title={item.rotulo}
                onClick={() => aoMudarAba(item.id)}
                className={`group relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-150 ${
                  ativo
                    ? 'bg-blue-50 text-blue-700 shadow-xs ring-1 ring-blue-200'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                {/* Marcador lateral azul quando ativo (estilo SESI) */}
                {ativo && (
                  <span className="absolute -left-2 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
                )}

                {item.icone(ativo)}

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ─── Rodapé: Indicadores de Sync, Banco, Alertas e Avatar ────────── */}
      <div className="flex flex-col items-center gap-2 w-full px-2">
        {/* Indicador Banco / Sync Offline */}
        <button
          type="button"
          onClick={aoAbrirSincronizacao}
          title={
            estaOnline
              ? itensPendentes > 0
                ? `${itensPendentes} atendimentos na fila para sincronização`
                : 'Conectado — Banco sincronizado'
              : `Offline (${itensPendentes} pendentes)`
          }
          className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
            itensPendentes > 0
              ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
              : estaOnline
                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>

          {itensPendentes > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center">
              {itensPendentes}
            </span>
          )}
        </button>

        {/* Notificações com badge */}
        <button
          type="button"
          title="Notificações e Avisos de Campo"
          className="relative w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Avatar do Operador (Estilo "MC" verde da referência) */}
        <div
          className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-300 shadow-xs cursor-pointer hover:ring-2 hover:ring-emerald-400 transition-all"
          title={`${nomeUsuario} (${perfilUsuario})`}
        >
          {iniciaisUsuario}
        </div>

        {/* Ação de Logout */}
        <button
          type="button"
          title="Sair / Encerrar Sessão Segura"
          className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
          onClick={() => {
            if (confirm('Deseja encerrar sua sessão no notebook?')) {
              window.location.reload();
            }
          }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  );
};

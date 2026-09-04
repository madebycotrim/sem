import type { ReactNode } from 'react';
import { IndicadorConexao } from './IndicadorConexao.tsx';
import { IndicadorSincronizacao } from './IndicadorSincronizacao.tsx';

/**
 * Layout Denso para operação em notebooks 13"-15".
 *
 * Características:
 * - Grid compacto otimizado para 1366×768 e superiores
 * - Sem rolagem horizontal
 * - Header fixo com indicadores de conexão e sincronização
 * - Sidebar com navegação por atalhos de teclado
 * - Área de conteúdo maximizada
 */

interface LayoutDensoProps {
  children: ReactNode;
  /** Nome do usuário logado */
  nomeUsuario?: string;
  /** Perfil do usuário */
  perfil?: string;
}

export function LayoutDenso({
  children,
  nomeUsuario = 'Operador',
  perfil = 'TRIAGEM_RECEPCAO',
}: LayoutDensoProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      {/* ─── Header Fixo ──────────────────────────────────────────────── */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
        {/* Logo e título */}
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600">
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              Saúde em Movimento
            </h1>
            <p className="text-[10px] text-slate-500 leading-tight">
              Escola Cidadã — Triagem e Atendimentos
            </p>
          </div>
        </div>

        {/* Indicadores e informações do usuário */}
        <div className="flex items-center gap-4">
          <IndicadorConexao />
          <IndicadorSincronizacao />

          {/* Separador */}
          <div className="h-6 w-px bg-slate-200" />

          {/* Usuário */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-600">
              {nomeUsuario.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="font-medium text-slate-700 leading-tight">
                {nomeUsuario}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">{perfil}</p>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Corpo ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav
          className="flex w-48 shrink-0 flex-col border-r border-slate-200 bg-white"
          aria-label="Navegação principal"
        >
          <div className="flex-1 overflow-y-auto py-2">
            <NavItem
              icone="📋"
              rotulo="Atendimentos"
              atalho="Alt+1"
              ativo
            />
            <NavItem icone="👤" rotulo="Pacientes" atalho="Alt+2" />
            <NavItem icone="🏫" rotulo="Escolas" atalho="Alt+3" />
            <NavItem icone="📊" rotulo="Relatórios" atalho="Alt+4" />
          </div>

          {/* Rodapé da sidebar */}
          <div className="border-t border-slate-200 p-2">
            <NavItem icone="⚙️" rotulo="Configurações" atalho="Alt+9" />
          </div>
        </nav>

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>

      {/* ─── Barra de atalhos (rodapé) ────────────────────────────────── */}
      <footer className="flex h-7 shrink-0 items-center gap-4 border-t border-slate-200 bg-slate-100 px-4 text-[10px] text-slate-500">
        <span>
          <kbd className="rounded bg-slate-200 px-1 font-mono">Ctrl+S</kbd>{' '}
          Salvar
        </span>
        <span>
          <kbd className="rounded bg-slate-200 px-1 font-mono">Tab</kbd>{' '}
          Próximo campo
        </span>
        <span>
          <kbd className="rounded bg-slate-200 px-1 font-mono">Alt+N</kbd>{' '}
          Novo atendimento
        </span>
        <span>
          <kbd className="rounded bg-slate-200 px-1 font-mono">Esc</kbd>{' '}
          Cancelar
        </span>
      </footer>
    </div>
  );
}

/**
 * Item de navegação da sidebar.
 */
function NavItem({
  icone,
  rotulo,
  atalho,
  ativo = false,
}: {
  icone: string;
  rotulo: string;
  atalho: string;
  ativo?: boolean;
}) {
  return (
    <button
      className={`
        flex w-full items-center gap-2 px-3 py-2 text-left text-xs
        transition-colors
        ${
          ativo
            ? 'bg-emerald-50 font-semibold text-emerald-800 border-r-2 border-emerald-600'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }
      `}
      title={`${rotulo} (${atalho})`}
      aria-current={ativo ? 'page' : undefined}
    >
      <span aria-hidden="true">{icone}</span>
      <span className="flex-1">{rotulo}</span>
      <kbd className="hidden text-[9px] text-slate-400 font-mono lg:inline">
        {atalho}
      </kbd>
    </button>
  );
}

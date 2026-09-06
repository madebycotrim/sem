import { type FC, type ReactNode } from 'react';

export interface OpcaoSeletor {
  id: string;
  nome: string;
}

export interface CabecalhoPaginaProps {
  /** Título principal em azul marinho negrito (ex: Pacientes, Agenda, Fila do Dia) */
  titulo: string;
  /** Subtítulo em caixa alta cinza (ex: CADASTRO, IDENTIFICAÇÃO E SITUAÇÃO DOS PACIENTES) */
  subtitulo?: string;

  /** Configuração do campo de busca textual no lado esquerdo */
  busca?: {
    valor: string;
    aoMudar: (termo: string) => void;
    placeholder?: string;
  };

  /** Filtro de avisos / pendências (botão amarelo/âmbar com ícone de alerta) */
  filtroAvisos?: {
    ativo: boolean;
    aoAlternar: () => void;
    rotulo?: string;
  };

  /** Seletor suspenso principal (ex: Todas as Escolas / Polos ou Todos os Avisos) */
  seletor?: {
    valor: string;
    aoMudar: (opcaoId: string) => void;
    placeholder: string;
    opcoes: OpcaoSeletor[];
  };

  /** Segundo seletor suspenso (opcional) */
  seletorSecundario?: {
    valor: string;
    aoMudar: (opcaoId: string) => void;
    placeholder: string;
    opcoes: OpcaoSeletor[];
  };

  /** Indicador de sincronização automática em segundo plano com a API Catraki */
  statusSincronizacaoCatraki?: {
    status: 'sincronizando' | 'sincronizado' | 'erro' | 'ocioso';
    ultimaSincronizacao?: Date | null;
  };

  /** Botão de sincronização manual legado (opcional) */
  sincronizacao?: {
    aoSincronizar: () => void;
    estaSincronizando?: boolean;
    itensPendentes?: number;
    rotulo?: string;
  };

  /** Callback para botão de exportar relatório / planilha (ícone bandeja de download) */
  aoExportar?: () => void;

  /** Botão de ação primária (Novo Paciente, Novo Atendimento) */
  acaoPrimaria?: {
    rotulo: string;
    aoClicar: () => void;
    icone?: ReactNode;
    desabilitado?: boolean;
  };

  /** Elementos customizados adicionais para a barra de ações */
  acoesExtras?: ReactNode;

  /** Torna o cabeçalho fixo no topo com efeito sticky (padrão: true) */
  fixo?: boolean;
}

export const CabecalhoPagina: FC<CabecalhoPaginaProps> = ({
  titulo,
  subtitulo,
  busca,
  filtroAvisos,
  seletor,
  seletorSecundario,
  statusSincronizacaoCatraki,
  sincronizacao,
  aoExportar,
  acaoPrimaria,
  acoesExtras,
  fixo = true,
}) => {
  const temBarraAcoes =
    busca ||
    filtroAvisos ||
    seletor ||
    seletorSecundario ||
    statusSincronizacaoCatraki ||
    sincronizacao ||
    aoExportar ||
    acaoPrimaria ||
    acoesExtras;

  return (
    <header
      className={`w-full flex flex-col gap-3 mb-4 select-none ${
        fixo
          ? 'sticky top-0 bg-[#f4f7fb]/95 backdrop-blur-xs z-20 pt-1 pb-2 transition-all'
          : ''
      }`}
    >
      {/* ─── Linha 1: Título e Subtítulo Corporativo ────────────────────────── */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight leading-tight font-sans" style={{ color: '#034b7f' }}>
          {titulo}
        </h1>
        {subtitulo && (
          <p className="text-[10.5px] font-semibold tracking-widest uppercase mt-0.5 font-sans flex items-center gap-1.5" style={{ color: '#74c4d7' }}>
            <span className="inline-block w-1 h-1 rounded-full" style={{ backgroundColor: '#74c4d7' }} />
            {subtitulo}
          </p>
        )}
      </div>

      {/* ─── Linha 2: Barra Contínua de Ações ───────────────────────────────── */}
      {temBarraAcoes && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          {/* Lado Esquerdo: Campo de Busca Longo */}
          {busca ? (
            <div className="relative flex-1 max-w-xl min-w-[280px]">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                type="text"
                value={busca.valor}
                onChange={(e) => busca.aoMudar(e.target.value)}
                placeholder={busca.placeholder || 'Buscar por nome ou CPF...'}
                className="w-full h-10 pl-10 pr-9 text-[13px] bg-white border rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none transition-all shadow-sm"
                style={{
                  borderColor: '#d0e9f3',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#034b7f';
                  e.target.style.boxShadow = '0 0 0 3px rgba(3,75,127,0.08)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#d0e9f3';
                  e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
                }}
              />
              {busca.valor && (
                <button
                  type="button"
                  onClick={() => busca.aoMudar('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Limpar busca"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* Lado Direito: Filtros, Sincronização, Exportação e Ação Primária */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
            {/* Filtro: Apenas com Avisos */}
            {filtroAvisos && (
              <button
                type="button"
                onClick={filtroAvisos.aoAlternar}
                className={`flex items-center gap-1.5 h-10.5 px-3 py-2 text-xs font-semibold rounded-2xl border transition-all cursor-pointer shadow-2xs whitespace-nowrap ${
                  filtroAvisos.ativo
                    ? 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="Filtrar por registros com alertas ou pendências"
              >
                <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>{filtroAvisos.rotulo || 'Apenas com Avisos'}</span>
                <svg className="w-3.5 h-3.5 text-slate-400 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            )}

            {/* Dropdown Seletor 1 */}
            {seletor && (
              <div className="relative">
                <select
                  value={seletor.valor}
                  onChange={(e) => seletor.aoMudar(e.target.value)}
                  className="appearance-none h-10 pl-3 pr-8 text-xs font-medium bg-white border rounded-xl text-slate-700 hover:bg-slate-50 focus:outline-none transition-all cursor-pointer shadow-sm"
                  style={{ borderColor: '#d0e9f3', color: '#14438f' }}
                >
                  <option value="">{seletor.placeholder}</option>
                  {seletor.opcoes.map((opc) => (
                    <option key={opc.id} value={opc.id}>
                      {opc.nome}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            )}

            {/* Dropdown Seletor 2 (opcional) */}
            {seletorSecundario && (
              <div className="relative">
                <select
                  value={seletorSecundario.valor}
                  onChange={(e) => seletorSecundario.aoMudar(e.target.value)}
                  className="appearance-none h-10 pl-3 pr-8 text-xs font-medium bg-white border rounded-xl text-slate-700 hover:bg-slate-50 focus:outline-none transition-all cursor-pointer shadow-sm"
                  style={{ borderColor: '#d0e9f3', color: '#14438f' }}
                >
                  <option value="">{seletorSecundario.placeholder}</option>
                  {seletorSecundario.opcoes.map((opc) => (
                    <option key={opc.id} value={opc.id}>
                      {opc.nome}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            )}

            {/* Ações Extras Personalizadas */}
            {acoesExtras}

            {/* Indicador Discreto de Sincronização em Segundo Plano com o Catraki */}
            {statusSincronizacaoCatraki && (
              <div
                className="flex items-center justify-center select-none px-1 text-slate-400 hover:text-slate-600 transition-colors cursor-default"
                title={
                  statusSincronizacaoCatraki.status === 'sincronizando'
                    ? 'Sincronizando termos de consentimento com o Catraki...'
                    : statusSincronizacaoCatraki.status === 'erro'
                    ? 'Catraki Offline'
                    : statusSincronizacaoCatraki.ultimaSincronizacao
                    ? `Sincronizado automaticamente com o Catraki às ${statusSincronizacaoCatraki.ultimaSincronizacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                    : 'Sincronizado com o Catraki'
                }
              >
                {statusSincronizacaoCatraki.status === 'sincronizando' ? (
                  <svg className="w-4 h-4 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : statusSincronizacaoCatraki.status === 'erro' ? (
                  <svg className="w-4 h-4 text-amber-500 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                    <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
                    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                    <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="2.5" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-emerald-500 hover:text-emerald-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                    <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="2.5" />
                  </svg>
                )}
              </div>
            )}

            {/* Botão Sincronizar Catraki (Manual Legado) */}
            {sincronizacao && !statusSincronizacaoCatraki && (
              <button
                type="button"
                onClick={sincronizacao.aoSincronizar}
                disabled={sincronizacao.estaSincronizando}
                className="h-10.5 w-10.5 flex items-center justify-center text-slate-500 bg-white border border-slate-200/90 rounded-2xl hover:bg-slate-50 hover:text-emerald-600 transition-all shadow-2xs active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                title={sincronizacao.rotulo || 'Sincronizar com o Catraki'}
              >
                {sincronizacao.estaSincronizando ? (
                  <svg className="w-4 h-4 animate-spin text-emerald-600" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                    <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="2.5" />
                  </svg>
                )}
              </button>
            )}

            {/* Botão de Exportação */}
            {aoExportar && (
              <button
                type="button"
                onClick={aoExportar}
                className="h-10.5 w-10.5 flex items-center justify-center text-slate-600 bg-white border border-slate-200/90 rounded-2xl hover:bg-slate-50 hover:text-slate-800 transition-all shadow-2xs cursor-pointer"
                title="Exportar registros (CSV / Relatório)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            )}

            {/* Botão de Ação Primária */}
            {acaoPrimaria && (
              <button
                type="button"
                onClick={acaoPrimaria.aoClicar}
                disabled={acaoPrimaria.desabilitado}
                className="h-10 flex items-center gap-2 px-5 text-xs font-semibold text-white rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #034b7f 0%, #14438f 100%)',
                  boxShadow: '0 2px 8px rgba(3,75,127,0.25)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(3,75,127,0.35)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(3,75,127,0.25)'; }}
              >
                {acaoPrimaria.icone || (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
                <span>{acaoPrimaria.rotulo.replace(/^\+\s*/, '')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};


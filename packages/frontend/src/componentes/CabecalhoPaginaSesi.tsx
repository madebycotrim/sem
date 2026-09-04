import { type FC, type ReactNode } from 'react';

export interface OpcaoSeletor {
  id: string;
  nome: string;
}

export interface CabecalhoPaginaSesiProps {
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

  /** Botão verde de sincronização Catraki */
  sincronizacao?: {
    aoSincronizar: () => void;
    estaSincronizando?: boolean;
    itensPendentes?: number;
    rotulo?: string;
  };

  /** Callback para botão de exportar relatório / planilha (ícone bandeja de download) */
  aoExportar?: () => void;

  /** Botão de ação primária (+ Novo Paciente, + Novo Atendimento) */
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

export const CabecalhoPaginaSesi: FC<CabecalhoPaginaSesiProps> = ({
  titulo,
  subtitulo,
  busca,
  filtroAvisos,
  seletor,
  seletorSecundario,
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
      {/* ─── Linha 1: Título e Subtítulo Corporativo SESI ─────────────────── */}
      <div className="flex flex-col">
        <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-[#0b2545] leading-tight font-sans">
          {titulo}
        </h1>
        {subtitulo && (
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mt-0.5 font-sans">
            {subtitulo}
          </p>
        )}
      </div>

      {/* ─── Linha 2: Barra Contínua Exata da Referência (Imagem 2) ──────── */}
      {temBarraAcoes && (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
          {/* Lado Esquerdo: Campo de Busca Longo */}
          {busca ? (
            <div className="relative flex-1 min-w-[280px]">
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
                className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
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
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Filtro: Apenas com Avisos */}
            {filtroAvisos && (
              <button
                type="button"
                onClick={filtroAvisos.aoAlternar}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-2xs whitespace-nowrap ${
                  filtroAvisos.ativo
                    ? 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="Filtrar por registros com alertas ou pendências"
              >
                <span className="text-amber-500 text-xs">⚠️</span>
                <span>{filtroAvisos.rotulo || 'Apenas com Avisos'}</span>
                <svg className="w-3.5 h-3.5 text-slate-400 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            )}

            {/* Dropdown Seletor 1 (ex: Todos os Avisos ou Todas as Escolas) */}
            {seletor && (
              <div className="relative">
                <select
                  value={seletor.valor}
                  onChange={(e) => seletor.aoMudar(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
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
                  className="appearance-none pl-3 pr-8 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
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

            {/* Botão Sincronizar Catraki (Verde oficial da referência visual) */}
            {sincronizacao && (
              <button
                type="button"
                onClick={sincronizacao.aoSincronizar}
                disabled={sincronizacao.estaSincronizando}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-2xs whitespace-nowrap"
                title="Sincronizar dados com o Catraki"
              >
                {sincronizacao.estaSincronizando ? (
                  <svg className="w-4 h-4 animate-spin text-emerald-600" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                )}
                <span>{sincronizacao.rotulo || 'Sincronizar Catraki'}</span>
                {(sincronizacao.itensPendentes ?? 0) > 0 && (
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {sincronizacao.itensPendentes}
                  </span>
                )}
              </button>
            )}

            {/* Botão de Exportação (Ícone de bandeja/download) */}
            {aoExportar && (
              <button
                type="button"
                onClick={aoExportar}
                className="p-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-all shadow-2xs cursor-pointer"
                title="Exportar registros (CSV / Relatório)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            )}

            {/* Botão de Ação Primária (+ Novo Paciente / + Novo Atendimento) */}
            {acaoPrimaria && (
              <button
                type="button"
                onClick={acaoPrimaria.aoClicar}
                disabled={acaoPrimaria.desabilitado}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs hover:shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {acaoPrimaria.icone || (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
                <span>{acaoPrimaria.rotulo}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

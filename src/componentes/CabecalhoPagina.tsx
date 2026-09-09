import { type FC, type ReactNode } from 'react';
import { AlertTriangle, ChevronDown, Download, LoaderCircle, Plus, Search, X, Wifi, WifiOff } from 'lucide-react';
import { SelectModal } from './Modal';
import { Botao } from './Botao.tsx';

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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-3 w-full">
          {busca && (
            <div className="relative flex-1 max-w-xl min-w-[280px]">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={busca.valor}
                onChange={(e) => busca.aoMudar(e.target.value)}
                placeholder={busca.placeholder || 'Buscar por nome ou CPF...'}
                className="w-full h-10 pl-10 pr-9 text-xs font-semibold bg-white border border-slate-200 rounded-2xl text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all shadow-xs"
                style={{
                  borderColor: '#e2e8f0',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#034b7f';
                  e.target.style.boxShadow = '0 0 0 3px rgba(3,75,127,0.08)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)';
                }}
              />
              {busca.valor && (
                <button
                  type="button"
                  onClick={() => busca.aoMudar('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Lado Direito: Filtros, Sincronização, Exportação e Ação Primária */}
          <div className={`flex items-center gap-2.5 flex-wrap sm:flex-nowrap ${busca ? 'shrink-0' : 'w-full flex-1 min-w-0'}`}>
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
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{filtroAvisos.rotulo || 'Apenas com Avisos'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>
            )}

            {/* Dropdown Seletor 1 */}
            {seletor && (
              <SelectModal
                value={seletor.valor}
                onChange={(e: any) => seletor.aoMudar(e?.target?.value ?? (typeof e === 'string' ? e : ''))}
                className="h-10 min-w-[180px] w-auto text-xs"
                placeholder={seletor.placeholder}
                opcoes={seletor.opcoes.map((opc) => ({ valor: opc.id, rotulo: opc.nome }))}
              />
            )}

            {/* Dropdown Seletor 2 (opcional) */}
            {seletorSecundario && (
              <SelectModal
                value={seletorSecundario.valor}
                onChange={(e: any) => seletorSecundario.aoMudar(e?.target?.value ?? (typeof e === 'string' ? e : ''))}
                className="h-10 min-w-[180px] w-auto text-xs"
                placeholder={seletorSecundario.placeholder}
                opcoes={seletorSecundario.opcoes.map((opc) => ({ valor: opc.id, rotulo: opc.nome }))}
              />
            )}


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
                  <LoaderCircle className="w-4 h-4 animate-spin text-blue-500" />
                ) : statusSincronizacaoCatraki.status === 'erro' ? (
                  <WifiOff className="w-4 h-4 text-amber-500 opacity-80" />
                ) : (
                  <Wifi className="w-4 h-4 text-emerald-500 hover:text-emerald-600 transition-colors" />
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
                  <LoaderCircle className="w-4 h-4 animate-spin text-emerald-600" />
                ) : (
                  <Wifi className="w-4 h-4 text-emerald-600" />
                )}
              </button>
            )}

            {/* Botão de Exportação */}
            {aoExportar && (
              <Botao
                variante="secundario"
                tamanho="iconeMd"
                formato="pilula"
                onClick={aoExportar}
                title="Exportar registros (CSV / Relatório)"
                icone={<Download className="w-4 h-4" />}
              />
            )}

            {/* Ações Extras Customizadas */}
            {acoesExtras}

            {/* Botão de Ação Primária */}
            {acaoPrimaria && (
              <Botao
                variante="primario"
                tamanho="md"
                formato="pilula"
                onClick={acaoPrimaria.aoClicar}
                disabled={acaoPrimaria.desabilitado}
                icone={acaoPrimaria.icone || <Plus className="w-4 h-4" />}
              >
                {acaoPrimaria.rotulo.replace(/^\+\s*/, '')}
              </Botao>
            )}
          </div>
        </div>
      )}
    </header>
  );
};


import { type FC, useState, useMemo } from 'react';
import { FileText, RotateCcw } from 'lucide-react';
import { ESPECIALIDADE_LABELS, TURNO_LABELS, Especialidade, Turno } from '../../compartilhado/index.ts';
import { CabecalhoPagina } from './CabecalhoPagina.tsx';
import {
  useFiltroExcel,
  CabecalhoColunaExcel,
  BarraFiltrosAtivos,
  type ConfiguracaoColuna,
} from './tabelaExcel/index.ts';
import { obterEstiloAvatarGoogle } from '../utilitarios/avatarCor.ts';
import { Paginacao } from './Paginacao.tsx';
import { EspecialidadeBadge } from './EspecialidadeVisual.tsx';
import { SelectModal } from './Modal.tsx';
import { STATUS_ATENDIMENTO_LABELS, StatusAtendimento } from '../../compartilhado/index.ts';

export interface ItemAtendimentoLista {
  id: string;
  pacienteNome: string;
  especialidade: Especialidade;
  turno: Turno;
  escolaNome: string;
  profissionalNome: string;
  resumo?: string;
  criadoEm: string;
  status?: StatusAtendimento;
}

export interface AtendimentosProps {
  atendimentos: ItemAtendimentoLista[];
  aoNovoAtendimento: () => void;
  aoSincronizar?: () => void;
  estaSincronizando?: boolean;
  itensPendentes?: number;
  statusSincronizacaoCatraki?: {
    status: 'sincronizando' | 'sincronizado' | 'erro' | 'ocioso';
    ultimaSincronizacao?: Date | null;
  };
  aoAtualizarStatus?: (id: string, status: StatusAtendimento) => void;
}

export const Atendimentos: FC<AtendimentosProps> = ({
  atendimentos,
  aoNovoAtendimento,
  aoSincronizar,
  estaSincronizando = false,
  itensPendentes = 0,
  statusSincronizacaoCatraki,
  aoAtualizarStatus,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroEspecialidade, setFiltroEspecialidade] = useState<string>('');

  const opcoesEspecialidades = Object.entries(ESPECIALIDADE_LABELS).map(([id, nome]) => ({
    id,
    nome,
  }));

  const colunasConfig = useMemo<ConfiguracaoColuna<ItemAtendimentoLista>[]>(
    () => [
      {
        id: 'pacienteNome',
        rotulo: 'PACIENTE',
        tipo: 'texto',
        obterValor: (i) => i.pacienteNome,
      },
      {
        id: 'especialidade',
        rotulo: 'ESPECIALIDADE',
        tipo: 'opcao',
        obterValor: (i) => i.especialidade,
        formatarRotulo: (val) => ESPECIALIDADE_LABELS[val as Especialidade] || String(val),
      },
      {
        id: 'turno',
        rotulo: 'TURNO',
        tipo: 'opcao',
        obterValor: (i) => i.turno,
        formatarRotulo: (val) => TURNO_LABELS[val as Turno] || String(val),
      },
      {
        id: 'escolaNome',
        rotulo: 'ESCOLA / POLO',
        tipo: 'texto',
        obterValor: (i) => i.escolaNome,
      },
      {
        id: 'profissionalNome',
        rotulo: 'PROFISSIONAL',
        tipo: 'texto',
        obterValor: (i) => i.profissionalNome,
      },
      {
        id: 'criadoEm',
        rotulo: 'DATA / HORA',
        tipo: 'data',
        obterValor: (i) => i.criadoEm,
        formatarRotulo: (val) =>
          `${new Date(val).toLocaleDateString('pt-BR')} ${new Date(val).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      },
      {
        id: 'status',
        rotulo: 'STATUS',
        desabilitarFiltro: true,
        desabilitarOrdenacao: true,
      },
    ],
    []
  );

  const dadosBase = useMemo(() => {
    return atendimentos.filter((item) => {
      const matchEsp = !filtroEspecialidade || item.especialidade === filtroEspecialidade;
      return matchEsp;
    });
  }, [atendimentos, filtroEspecialidade]);

  const filtroExcel = useFiltroExcel<ItemAtendimentoLista>({
    dados: dadosBase,
    colunas: colunasConfig,
    buscaGeral: busca,
    funcaoBuscaGeral: (item, termo) =>
      item.pacienteNome.toLowerCase().includes(termo) ||
      item.profissionalNome.toLowerCase().includes(termo) ||
      item.escolaNome.toLowerCase().includes(termo) ||
      Boolean(item.resumo && item.resumo.toLowerCase().includes(termo)),
  });

  const { dadosFiltrados, temAlgumFiltroAtivo } = filtroExcel;

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const totalPaginas = Math.max(1, Math.ceil(dadosFiltrados.length / itensPorPagina));
  const paginaCorrigida = Math.min(paginaAtual, totalPaginas);
  const indiceInicio = (paginaCorrigida - 1) * itensPorPagina;
  const dadosPaginados = dadosFiltrados.slice(indiceInicio, indiceInicio + itensPorPagina);

  return (
    <div className="flex flex-col flex-1 animate-fade-in font-sans">
      {/* ─── Cabeçalho Fixo Modular ───────────────────────────────────────── */}
      <CabecalhoPagina
        titulo="Atendimentos Clínicos"
        subtitulo="REGISTRO CLÍNICO, CONDUTAS E PROCEDIMENTOS EM FLUXO LIVRE"
        busca={{
          valor: busca,
          aoMudar: setBusca,
          placeholder: 'Buscar por paciente, profissional ou conduta...',
        }}
        seletor={{
          valor: filtroEspecialidade,
          aoMudar: setFiltroEspecialidade,
          placeholder: 'Todas as Especialidades',
          opcoes: opcoesEspecialidades,
        }}
        statusSincronizacaoCatraki={statusSincronizacaoCatraki}
        sincronizacao={
          aoSincronizar && !statusSincronizacaoCatraki
            ? {
                aoSincronizar,
                estaSincronizando,
                itensPendentes,
                rotulo: 'Sincronizar Catraki',
              }
            : undefined
        }
        aoExportar={() => alert(`Exportando ${dadosFiltrados.length} atendimentos em formato CSV.`)}
        acaoPrimaria={{
          rotulo: 'Novo Atendimento',
          aoClicar: aoNovoAtendimento,
        }}
        fixo={true}
      />

      {/* ─── Tabela de Registros com Filtros Excel ────────────────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col flex-1 min-h-[460px]">
        {/* Barra de Filtros Ativos */}
        <BarraFiltrosAtivos estado={filtroExcel} entidadeNome="atendimento(s)" />

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                <CabecalhoColunaExcel
                  colunaId="pacienteNome"
                  rotulo="PACIENTE"
                  estado={filtroExcel}
                  className="px-4.5 py-3"
                />
                <CabecalhoColunaExcel
                  colunaId="especialidade"
                  rotulo="ESPECIALIDADE"
                  estado={filtroExcel}
                  className="px-3.5 py-3"
                />
                <CabecalhoColunaExcel
                  colunaId="turno"
                  rotulo="TURNO"
                  estado={filtroExcel}
                  className="px-3.5 py-3"
                />
                <CabecalhoColunaExcel
                  colunaId="escolaNome"
                  rotulo="ESCOLA / POLO"
                  estado={filtroExcel}
                  className="px-3.5 py-3"
                />
                <CabecalhoColunaExcel
                  colunaId="profissionalNome"
                  rotulo="PROFISSIONAL RESPONSÁVEL"
                  estado={filtroExcel}
                  className="px-3.5 py-3"
                />
                <CabecalhoColunaExcel
                  colunaId="criadoEm"
                  rotulo="DATA / HORA"
                  estado={filtroExcel}
                  className="px-3.5 py-3"
                />
                <th scope="col" className="py-3 px-4 font-bold text-slate-600 text-right">
                  <span>STATUS</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {dadosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto px-4">
                      <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3 ring-8 ring-blue-50/60 shadow-xs">
                          <FileText className="w-7 h-7 text-blue-500" />
                      </div>
                      <h4 className="text-base font-bold text-slate-800 mb-1">
                        {temAlgumFiltroAtivo ? 'Nenhum atendimento com esses filtros' : 'Nenhum atendimento registrado'}
                      </h4>
                      <p className="text-xs text-slate-500 mb-4">
                        {temAlgumFiltroAtivo
                          ? 'Os filtros aplicados nas colunas ocultaram todos os registros.'
                          : 'Clique em Novo Atendimento para registrar a primeira consulta.'}
                      </p>
                      {temAlgumFiltroAtivo && (
                        <button
                          type="button"
                          onClick={() => filtroExcel.limparTodosFiltros()}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Limpar Filtros das Colunas</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                dadosPaginados.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group border-b border-slate-100 last:border-0">
                    <td className="py-3 px-4.5 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const estilo = obterEstiloAvatarGoogle(item.pacienteNome);
                          return (
                            <div
                              style={estilo.style}
                              className="w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs select-none ring-2 ring-white"
                            >
                              {item.pacienteNome.charAt(0).toUpperCase()}
                            </div>
                          );
                        })()}
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 uppercase tracking-tight text-xs">
                            {item.pacienteNome}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <EspecialidadeBadge especialidade={item.especialidade} compacto />
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 font-medium">
                      {TURNO_LABELS[item.turno] || item.turno}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 font-medium">{item.escolaNome}</td>
                    <td className="py-3 px-3.5 text-slate-600">{item.profissionalNome}</td>
                    <td className="py-3 px-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(item.criadoEm).toLocaleDateString('pt-BR')} {new Date(item.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <SelectModal
                        value={item.status || StatusAtendimento.CONCLUIDO}
                        onChange={(evento) => aoAtualizarStatus?.(item.id, evento.target.value as StatusAtendimento)}
                        className="h-8 min-w-[132px] text-[11px]"
                        opcoes={Object.entries(STATUS_ATENDIMENTO_LABELS).map(([valor, rotulo]) => ({ valor, rotulo: String(rotulo) }))}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="py-2 px-4 border-t border-slate-200/90 bg-slate-50/40">
          <Paginacao
            paginaAtual={paginaCorrigida}
            totalPaginas={totalPaginas}
            totalRegistros={dadosFiltrados.length}
            aoMudarPagina={(novaPagina) => setPaginaAtual(novaPagina)}
          />
        </div>
      </div>
    </div>
  );
};

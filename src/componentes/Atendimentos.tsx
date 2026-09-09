import { type FC, useState, useMemo, useRef } from 'react';
import { Calendar, FileText, RotateCcw } from 'lucide-react';
import { ESPECIALIDADE_LABELS, Especialidade, Turno } from '../../compartilhado/index.ts';
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
  pacienteId: string;
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
  aoAtualizarStatus,
}) => {
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [periodoSelecionado, setPeriodoSelecionado] = useState<number | 'mes' | 'tudo' | null>(null);
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const dataInicioRef = useRef<HTMLInputElement>(null);
  const dataFimRef = useRef<HTMLInputElement>(null);

  const colunasConfig = useMemo<ConfiguracaoColuna<ItemAtendimentoLista>[]>(
    () => [
      {
        id: 'pacienteNome',
        rotulo: 'PACIENTE',
        tipo: 'texto',
        obterValor: (i) => i.pacienteNome,
      },
      {
        id: 'profissionalNome',
        rotulo: 'PROFISSIONAL',
        tipo: 'texto',
        obterValor: (i) => i.profissionalNome,
      },
      {
        id: 'especialidade',
        rotulo: 'ESPECIALIDADE',
        tipo: 'opcao',
        obterValor: (i) => i.especialidade,
        formatarRotulo: (val) => ESPECIALIDADE_LABELS[val as Especialidade] || String(val),
      },
      {
        id: 'escolaNome',
        rotulo: 'ESCOLA / POLO',
        tipo: 'texto',
        obterValor: (i) => i.escolaNome,
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
      const data = item.criadoEm.slice(0, 10);
      const status = item.status || StatusAtendimento.CONCLUIDO;
      return (!statusFiltro || status === statusFiltro) &&
        (!dataInicio || data >= dataInicio) &&
        (!dataFim || data <= dataFim);
    });
  }, [atendimentos, dataFim, dataInicio, statusFiltro]);

  const aplicarPeriodo = (dias: number | 'mes' | 'tudo') => {
    setPeriodoSelecionado(dias);
    setDiaSelecionado(null);
    if (dias === 'tudo') {
      const datas = atendimentos
        .map((item) => item.criadoEm.slice(0, 10))
        .filter(Boolean)
        .sort();
      setDataInicio(datas[0] || '');
      setDataFim(datas[datas.length - 1] || '');
      return;
    }

    const fim = new Date();
    const inicio = new Date(fim);
    if (dias === 'mes') {
      inicio.setDate(1);
    } else {
      inicio.setDate(fim.getDate() - dias + 1);
    }

    const formatarData = (data: Date) => {
      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const dia = String(data.getDate()).padStart(2, '0');
      return `${ano}-${mes}-${dia}`;
    };

    setDataInicio(formatarData(inicio));
    setDataFim(formatarData(fim));
  };

  const aplicarDia = (deslocamento: number) => {
    setPeriodoSelecionado(null);
    setDiaSelecionado(deslocamento);
    const dataBase = new Date();
    dataBase.setDate(dataBase.getDate() + deslocamento);
    const data = `${dataBase.getFullYear()}-${String(dataBase.getMonth() + 1).padStart(2, '0')}-${String(dataBase.getDate()).padStart(2, '0')}`;
    setDataInicio(data);
    setDataFim(data);
  };

  const obterDiaDaSemana = (valor: string) => {
    if (!valor) return '';
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'long' })
      .format(new Date(`${valor}T12:00:00`))
      .toUpperCase();
  };

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
        titulo="Histórico Clínico"
        subtitulo="REGISTRO HISTÓRICO DE ATENDIMENTOS — FICHAS, CONDUTAS E PROCEDIMENTOS"
        busca={{
          valor: busca,
          aoMudar: setBusca,
          placeholder: 'Buscar paciente, profissional ou especialidade...',
        }}
        acoesExtras={
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex flex-nowrap items-center justify-end gap-2">
              <SelectModal
                value={statusFiltro}
                onChange={(evento) => setStatusFiltro(evento.target.value)}
                placeholder="Todos os status"
                className="!h-10 !w-[170px] !min-w-0 shrink-0 [&>button]:!h-10 [&>button]:!rounded-2xl [&>button]:!border-slate-200 [&>button]:!bg-white [&>button]:!px-3 [&>button]:!text-xs"
                pesquisavel={false}
                opcoes={Object.entries(STATUS_ATENDIMENTO_LABELS).map(([valor, rotulo]) => ({
                  valor,
                  rotulo: String(rotulo),
                }))}
              />
              <label className="relative flex h-10 cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 transition-colors hover:border-slate-300" onClick={(evento) => { evento.preventDefault(); dataInicioRef.current?.showPicker?.(); }}>
                <span className="shrink-0">De</span>
                <span className="pointer-events-none flex min-w-0 items-center gap-2 whitespace-nowrap text-slate-700">
                  <span>{dataInicio ? new Date(`${dataInicio}T12:00:00`).toLocaleDateString('pt-BR') : 'dd/mm/aaaa'}</span>
                  {dataInicio && <span className="rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[9px] font-bold uppercase tracking-tight text-blue-700">{obterDiaDaSemana(dataInicio)}</span>}
                </span>
                <Calendar className="pointer-events-none ml-auto h-3.5 w-3.5 shrink-0 text-slate-400" />
                <input ref={dataInicioRef} type="date" value={dataInicio} onChange={(evento) => { setPeriodoSelecionado(null); setDiaSelecionado(null); setDataInicio(evento.target.value); }} className="pointer-events-none absolute h-px w-px opacity-0" aria-label="Data inicial" />
              </label>
              <label className="relative flex h-10 cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 transition-colors hover:border-slate-300" onClick={(evento) => { evento.preventDefault(); dataFimRef.current?.showPicker?.(); }}>
                <span className="shrink-0">Até</span>
                <span className="pointer-events-none flex min-w-0 items-center gap-2 whitespace-nowrap text-slate-700">
                  <span>{dataFim ? new Date(`${dataFim}T12:00:00`).toLocaleDateString('pt-BR') : 'dd/mm/aaaa'}</span>
                  {dataFim && <span className="rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[9px] font-bold uppercase tracking-tight text-blue-700">{obterDiaDaSemana(dataFim)}</span>}
                </span>
                <Calendar className="pointer-events-none ml-auto h-3.5 w-3.5 shrink-0 text-slate-400" />
                <input ref={dataFimRef} type="date" value={dataFim} onChange={(evento) => { setPeriodoSelecionado(null); setDiaSelecionado(null); setDataFim(evento.target.value); }} className="pointer-events-none absolute h-px w-px opacity-0" aria-label="Data final" />
              </label>
            </div>
            <div className="flex flex-nowrap items-center justify-end gap-1.5">
              <div className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
                <button type="button" onClick={() => aplicarDia(-2)} aria-pressed={diaSelecionado === -2} className={`h-8 rounded-lg px-3 text-[11px] font-bold transition-all ${diaSelecionado === -2 ? 'bg-blue-50 text-blue-700 shadow-xs' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>Anteontem</button>
                <button type="button" onClick={() => aplicarDia(-1)} aria-pressed={diaSelecionado === -1} className={`h-8 rounded-lg px-3 text-[11px] font-bold transition-all ${diaSelecionado === -1 ? 'bg-blue-50 text-blue-700 shadow-xs' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>Ontem</button>
                <button type="button" onClick={() => aplicarDia(0)} aria-pressed={diaSelecionado === 0} className={`h-8 rounded-lg px-3 text-[11px] font-bold transition-all ${diaSelecionado === 0 ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>Hoje</button>
              </div>
              <span className="mx-0.5 h-6 w-px bg-slate-200" aria-hidden="true" />
              <button type="button" onClick={() => aplicarPeriodo(7)} className={`h-10 rounded-xl border border-slate-200 px-3 text-[11px] font-bold transition-colors ${periodoSelecionado === 7 ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>7 dias</button>
              <button type="button" onClick={() => aplicarPeriodo(15)} className={`hidden h-10 rounded-xl border border-slate-200 px-3 text-[11px] font-bold transition-colors md:block ${periodoSelecionado === 15 ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>15 dias</button>
              <button type="button" onClick={() => aplicarPeriodo(30)} className={`h-10 rounded-xl border border-slate-200 px-3 text-[11px] font-bold transition-colors ${periodoSelecionado === 30 ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>30 dias</button>
              <button type="button" onClick={() => aplicarPeriodo('mes')} className={`hidden h-10 rounded-xl border border-slate-200 px-3 text-[11px] font-bold transition-colors lg:block ${periodoSelecionado === 'mes' ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>Este mês</button>
              <button type="button" onClick={() => aplicarPeriodo('tudo')} className={`h-10 rounded-xl border border-slate-200 px-3 text-[11px] font-bold transition-colors ${periodoSelecionado === 'tudo' ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>Tudo</button>
              <span className="mx-0.5 h-6 w-px bg-slate-200" aria-hidden="true" />
              <button type="button" onClick={() => { setBusca(''); setStatusFiltro(''); setDataInicio(''); setDataFim(''); setPeriodoSelecionado(null); setDiaSelecionado(null); }} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50">
                <RotateCcw className="h-3.5 w-3.5" /> Limpar
              </button>
            </div>
          </div>
        }
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
                  colunaId="profissionalNome"
                  rotulo="PROFISSIONAL"
                  estado={filtroExcel}
                  className="px-3.5 py-3"
                />
                <CabecalhoColunaExcel
                  colunaId="especialidade"
                  rotulo="ESPECIALIDADE"
                  estado={filtroExcel}
                  className="px-3.5 py-3"
                />
                <CabecalhoColunaExcel
                  colunaId="escolaNome"
                  rotulo="ESCOLA"
                  estado={filtroExcel}
                  className="px-3.5 py-3"
                />
                <CabecalhoColunaExcel
                  colunaId="criadoEm"
                  rotulo="DATA"
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
                  <td colSpan={6} className="py-20 text-center">
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
                    <td className="py-3 px-3.5 text-slate-600 font-medium">
                      {item.profissionalNome}
                    </td>
                    <td className="py-3 px-3.5">
                      <EspecialidadeBadge especialidade={item.especialidade} compacto />
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 font-medium">{item.escolaNome}</td>
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

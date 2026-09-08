import { useState, type FC, useMemo } from 'react';
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
import { CardHoverPaciente } from './CardHoverPaciente.tsx';
import { censurarCpf } from './TabelaPacientes.tsx';
import { Check, Clock3, Megaphone, Moon, RotateCcw, Sun } from 'lucide-react';

export type StatusPresenca = 'AGUARDANDO' | 'EM_ATENDIMENTO' | 'CONCLUIDO';

export interface ItemFila {
  id: string;
  pacienteNome: string;
  cpf?: string;
  idade: number;
  escolaNome: string;
  turno: Turno;
  especialidade: Especialidade;
  status: StatusPresenca;
  horarioChegada: string;
  prioridade?: boolean;
}

export interface FilaDoDiaProps {
  aoIniciarAtendimento: (item: {
    id: string;
    nome: string;
    especialidade: Especialidade;
    turno: Turno;
    horario?: string;
  }) => void;
  aoNovoPaciente: () => void;
}

export const FilaDoDia: FC<FilaDoDiaProps> = ({
  aoIniciarAtendimento,
  aoNovoPaciente,
}) => {
  const [busca, setBusca] = useState('');
  const [turnoSelecionado, setTurnoSelecionado] = useState<string>('TODOS');
  const [especialidadeSelecionada, setEspecialidadeSelecionada] = useState<string>('TODAS');

  const [fila, setFila] = useState<ItemFila[]>([]);

  const alternarStatus = (id: string, novoStatus: StatusPresenca) => {
    setFila((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: novoStatus } : item))
    );
  };

  // Configuração das colunas para o Sistema Excel
  const colunasConfig = useMemo<ConfiguracaoColuna<ItemFila>[]>(
    () => [
      {
        id: 'horarioChegada',
        rotulo: 'HORÁRIO',
        tipo: 'texto',
        obterValor: (f) => f.horarioChegada,
      },
      {
        id: 'pacienteNome',
        rotulo: 'ALUNO / PACIENTE',
        tipo: 'texto',
        obterValor: (f) => f.pacienteNome,
      },
      {
        id: 'especialidade',
        rotulo: 'ESPECIALIDADE',
        tipo: 'opcao',
        obterValor: (f) => f.especialidade,
        formatarRotulo: (val) => ESPECIALIDADE_LABELS[val as Especialidade] || String(val),
      },
      {
        id: 'turno',
        rotulo: 'TURNO',
        tipo: 'opcao',
        obterValor: (f) => f.turno,
        formatarRotulo: (val) => TURNO_LABELS[val as Turno] || String(val),
      },
      {
        id: 'status',
        rotulo: 'STATUS DA FILA',
        tipo: 'opcao',
        obterValor: (f) => f.status,
        formatarRotulo: (val) => {
          if (val === 'AGUARDANDO') return 'Aguardando';
          if (val === 'EM_ATENDIMENTO') return 'Em Atendimento';
          if (val === 'CONCLUIDO') return 'Concluído';
          return String(val);
        },
      },
      {
        id: 'acoes',
        rotulo: 'CHAMADA & AÇÕES',
        desabilitarFiltro: true,
        desabilitarOrdenacao: true,
      },
    ],
    []
  );

  // Filtro prévio por turno / especialidade selecionados no cabeçalho superior
  const dadosBase = useMemo(() => {
    return fila.filter((item) => {
      const matchTurno = turnoSelecionado === 'TODOS' || item.turno === turnoSelecionado;
      const matchEsp =
        especialidadeSelecionada === 'TODAS' || item.especialidade === especialidadeSelecionada;
      return matchTurno && matchEsp;
    });
  }, [fila, turnoSelecionado, especialidadeSelecionada]);

  const filtroExcel = useFiltroExcel<ItemFila>({
    dados: dadosBase,
    colunas: colunasConfig,
    buscaGeral: busca,
    funcaoBuscaGeral: (item, termo) =>
      item.pacienteNome.toLowerCase().includes(termo) ||
      Boolean(item.cpf && item.cpf.includes(termo)) ||
      item.horarioChegada.includes(termo),
  });

  const { dadosFiltrados, temAlgumFiltroAtivo } = filtroExcel;

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const totalPaginas = Math.max(1, Math.ceil(dadosFiltrados.length / itensPorPagina));
  const paginaCorrigida = Math.min(paginaAtual, totalPaginas);
  const indiceInicio = (paginaCorrigida - 1) * itensPorPagina;
  const dadosPaginados = dadosFiltrados.slice(indiceInicio, indiceInicio + itensPorPagina);

  const totalAguardando = fila.filter((f) => f.status === 'AGUARDANDO').length;
  const totalEmAtendimento = fila.filter((f) => f.status === 'EM_ATENDIMENTO').length;
  const totalConcluido = fila.filter((f) => f.status === 'CONCLUIDO').length;

  return (
    <div className="flex flex-col flex-1 animate-fade-in font-sans">
      {/* ─── Cabeçalho Fixo Modular ───────────────────────────────────────── */}
      <CabecalhoPagina
        titulo="Fila do Dia / Triagem"
        subtitulo="GESTÃO DE ALUNOS E COMUNIDADE PRESENTES NO LOCAL — FLUXO LIVRE"
        busca={{
          valor: busca,
          aoMudar: setBusca,
          placeholder: 'Buscar aluno por nome ou CPF...',
        }}
        seletor={{
          valor: especialidadeSelecionada,
          aoMudar: setEspecialidadeSelecionada,
          placeholder: 'Todas as Especialidades',
          opcoes: [
            { id: 'TODAS', nome: 'Todas as Especialidades' },
            ...Object.entries(ESPECIALIDADE_LABELS).map(([id, nome]) => ({ id, nome })),
          ],
        }}
        acaoPrimaria={{
          rotulo: 'Check-in / Novo Aluno',
          aoClicar: aoNovoPaciente,
        }}
        fixo={true}
      />

      {/* ─── Abas de Turno e Resumo da Fila ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        {/* Filtros de Turno */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-2xs w-fit">
          <button
            type="button"
            onClick={() => setTurnoSelecionado('TODOS')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-2xl transition-all cursor-pointer ${
              turnoSelecionado === 'TODOS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Todos os Turnos ({fila.length})
          </button>
          <button
            type="button"
            onClick={() => setTurnoSelecionado(Turno.MANHA)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-2xl transition-all cursor-pointer ${
              turnoSelecionado === Turno.MANHA
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            {TURNO_LABELS[Turno.MANHA]}
          </button>
          <button
            type="button"
            onClick={() => setTurnoSelecionado(Turno.TARDE)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-2xl transition-all cursor-pointer ${
              turnoSelecionado === Turno.TARDE
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            {TURNO_LABELS[Turno.TARDE]}
          </button>
        </div>

        {/* Badges de Status do Dia */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Aguardando: {totalAguardando}
          </span>
          <span className="px-3 py-1.5 rounded-2xl bg-blue-50 text-blue-800 border border-blue-200 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Em Atendimento: {totalEmAtendimento}
          </span>
          <span className="px-3 py-1.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Concluídos: {totalConcluido}
          </span>
        </div>
      </div>

      {/* ─── Tabela da Fila de Presença com Filtros Excel ─────────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col flex-1 min-h-[460px]">
        {/* Barra de Filtros Ativos */}
        <BarraFiltrosAtivos estado={filtroExcel} entidadeNome="aluno(s) na fila" />

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                <CabecalhoColunaExcel
                  colunaId="horarioChegada"
                  rotulo="HORÁRIO"
                  estado={filtroExcel}
                  className="px-4"
                />
                <CabecalhoColunaExcel
                  colunaId="pacienteNome"
                  rotulo="ALUNO / PACIENTE"
                  estado={filtroExcel}
                  className="px-4"
                />
                <CabecalhoColunaExcel
                  colunaId="especialidade"
                  rotulo="ESPECIALIDADE"
                  estado={filtroExcel}
                />
                <CabecalhoColunaExcel
                  colunaId="turno"
                  rotulo="TURNO"
                  estado={filtroExcel}
                />
                <CabecalhoColunaExcel
                  colunaId="status"
                  rotulo="STATUS DA FILA"
                  estado={filtroExcel}
                />
                <th scope="col" className="py-3 px-4 font-bold text-slate-600 text-right">
                  CHAMADA & AÇÕES
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {dadosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto px-4">
                      <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3 ring-8 ring-blue-50/60 shadow-xs">
                        <Clock3 className="w-7 h-7 text-blue-500" />
                      </div>
                      <h4 className="text-base font-bold text-slate-800 mb-1">
                        {temAlgumFiltroAtivo ? 'Nenhum aluno corresponde aos filtros aplicados' : 'Fila vazia para este filtro'}
                      </h4>
                      <p className="text-xs text-slate-500 mb-4">
                        {temAlgumFiltroAtivo
                          ? 'Os filtros aplicados nas colunas ocultaram todos os registros.'
                          : 'Nenhum aluno aguardando atendimento com os critérios selecionados.'}
                      </p>
                      {temAlgumFiltroAtivo ? (
                        <button
                          type="button"
                          onClick={() => filtroExcel.limparTodosFiltros()}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Limpar Filtros das Colunas</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={aoNovoPaciente}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-2xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                        >
                          + Adicionar à Fila do Dia
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                dadosPaginados.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group border-b border-slate-100 last:border-0"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {item.horarioChegada}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <CardHoverPaciente
                        paciente={{
                          id: item.id,
                          nome: item.pacienteNome,
                          cpf: item.cpf,
                          dataNascimento: `${new Date().getFullYear() - item.idade}-05-10`,
                          escolaNome: item.escolaNome,
                          termoConsentimentoStatus: 'ACEITO',
                          atendimentosCount: 1,
                          criadoEm: new Date().toISOString(),
                          perfil: 'Aluno Regular',
                          turma:
                            item.idade <= 10
                              ? `${item.idade - 5}º Ano — Fundamental I`
                              : item.idade <= 14
                              ? `${item.idade - 5}º Ano — Fundamental II`
                              : `${item.idade - 14}ª Série — Ensino Médio`,
                          telefone: '(61) 98452-1190',
                        }}
                        aoIniciarAtendimento={() =>
                          aoIniciarAtendimento({
                            id: item.id,
                            nome: item.pacienteNome,
                            especialidade: item.especialidade,
                            turno: item.turno,
                            horario: item.horarioChegada,
                          })
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          {(() => {
                            const estilo = obterEstiloAvatarGoogle(item.pacienteNome);
                            return (
                              <div
                                style={estilo.style}
                                className="w-7 h-7 rounded-full font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs select-none"
                              >
                                {item.pacienteNome.charAt(0)}
                              </div>
                            );
                          })()}
                          <div className="flex flex-col text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900 uppercase tracking-tight text-xs">
                                {item.pacienteNome}
                              </span>
                              {item.prioridade && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-100 text-rose-800 uppercase">
                                  Prioridade
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-normal">
                              {item.idade} anos • CPF: {item.cpf ? censurarCpf(item.cpf) : 'Não informado'}
                            </span>
                          </div>
                        </div>
                      </CardHoverPaciente>
                    </td>

                    <td className="py-3 px-3">
                      <EspecialidadeBadge especialidade={item.especialidade} compacto />
                    </td>

                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {TURNO_LABELS[item.turno]}
                    </td>

                    <td className="py-3 px-3">
                      {item.status === 'AGUARDANDO' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Aguardando
                        </span>
                      ) : item.status === 'EM_ATENDIMENTO' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          Em Atendimento
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Concluído
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'AGUARDANDO' && (
                          <button
                            type="button"
                            onClick={() => {
                              alternarStatus(item.id, 'EM_ATENDIMENTO');
                              aoIniciarAtendimento({
                                id: item.id,
                                nome: item.pacienteNome,
                                especialidade: item.especialidade,
                                turno: item.turno,
                              });
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-2xs transition-all active:scale-95 cursor-pointer"
                          >
                            <Megaphone className="w-3.5 h-3.5" />
                            Chamar & Atender
                          </button>
                        )}
                        {item.status === 'EM_ATENDIMENTO' && (
                          <button
                            type="button"
                            onClick={() => alternarStatus(item.id, 'CONCLUIDO')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-2xl transition-all active:scale-95 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Concluir
                          </button>
                        )}
                        {item.status === 'CONCLUIDO' && (
                          <span className="text-[11px] text-slate-400 font-medium">Finalizado</span>
                        )}
                      </div>
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

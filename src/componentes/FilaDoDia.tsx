import { useState, useEffect, type FC, useMemo } from 'react';
import { ESPECIALIDADE_LABELS, Especialidade, Turno } from '../../compartilhado/index.ts';
import { CabecalhoPagina } from './CabecalhoPagina.tsx';
import {
  useFiltroExcel,
  CabecalhoColunaExcel,
  BarraFiltrosAtivos,
  type ConfiguracaoColuna,
} from './tabelaExcel/index.ts';
import { Paginacao } from './Paginacao.tsx';
import { EspecialidadeBadge } from './EspecialidadeVisual.tsx';
import { censurarCpf } from './TabelaPacientes.tsx';
import { Clock3, RotateCcw, CalendarDays, ClipboardCheck, Play } from 'lucide-react';
import { ModalTriagem, type ItemPacienteTriagem, type ItemProfissionalTriagem } from './ModalTriagem.tsx';
import { ModalIniciarAtendimento, type DadosAtendimento } from './ModalIniciarAtendimento.tsx';
import type { ItemAtendimentoLista } from './Atendimentos.tsx';

// Data de hoje no formato pt-BR para comparação (ex: "08/09/2026")
const HOJE = new Date().toLocaleDateString('pt-BR');

export type StatusPresenca = 'AGUARDANDO' | 'CONFIRMADO' | 'EM_ATENDIMENTO' | 'CONCLUIDO';

export interface ItemFila {
  id: string;
  pacienteNome: string;
  cpf?: string;
  idade: number;
  escolaNome: string;
  turno?: Turno;
  especialidade: Especialidade;
  status: StatusPresenca;
  horarioChegada: string;
  dataChegada?: string;
  profissional?: string;
  profissionalRegistro?: string;
  prioridade?: boolean;
}

export interface FilaDoDiaProps {
  aoIniciarAtendimento: (item: {
    id: string;
    nome: string;
    especialidade: Especialidade;
    turno?: Turno;
    horario?: string;
  }) => void;
  aoNovoPaciente?: () => void;
  escolas?: Array<{ id: string; nome: string }>;
  pacientes?: ItemPacienteTriagem[];
  atendimentos?: Pick<ItemAtendimentoLista, 'pacienteId' | 'especialidade'>[];
  fila?: ItemFila[];
  profissionais?: ItemProfissionalTriagem[];
}

export const FilaDoDia: FC<FilaDoDiaProps> = ({
  aoIniciarAtendimento,
  aoNovoPaciente,
  escolas = [],
  pacientes = [],
  atendimentos = [],
  fila = [],
  profissionais = [],
}) => {
  const [busca, setBusca] = useState('');
  const [modalTriagemAberto, setModalTriagemAberto] = useState(false);
  const [modalAtendimentoAberto, setModalAtendimentoAberto] = useState(false);
  const [dadosAtendimentoAtivo, setDadosAtendimentoAtivo] = useState<DadosAtendimento | null>(null);
  const [confirmandoAlteracaoId, setConfirmandoAlteracaoId] = useState<string | null>(null);

  useEffect(() => {
    if (!confirmandoAlteracaoId) return undefined;

    const fecharAoClicarFora = (evento: MouseEvent) => {
      const alvo = evento.target as HTMLElement;
      if (!alvo.closest('[data-confirmacao-alteracao]')) {
        setConfirmandoAlteracaoId(null);
      }
    };
    const fecharComEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setConfirmandoAlteracaoId(null);
    };

    document.addEventListener('mousedown', fecharAoClicarFora);
    document.addEventListener('keydown', fecharComEscape);
    return () => {
      document.removeEventListener('mousedown', fecharAoClicarFora);
      document.removeEventListener('keydown', fecharComEscape);
    };
  }, [confirmandoAlteracaoId]);

  const handleConfirmarTriagem = async (dados: {
    pacienteId: string;
    pacienteNome: string;
    cpf?: string;
    idade: number;
    escolaNome: string;
    profissionalId: string;
    profissionalNome: string;
    profissionalRegistro?: string;
    especialidade: Especialidade;
  }) => {
    const cpfLimpo = (dados.cpf || '').replace(/\D/g, '');
    const consultaDuplicada = fila.some((item) =>
      cpfLimpo.length === 11 &&
      (item.cpf || '').replace(/\D/g, '') === cpfLimpo &&
      item.especialidade === dados.especialidade
    );

    if (consultaDuplicada) {
      throw new Error('Este CPF já possui uma consulta registrada para esta especialidade. Não é permitido realizar outra consulta.');
    }

    throw new Error('A criação de triagens depende da API de fila, que ainda não está disponível.');
  };

  const alternarStatus = async (_id: string, _novoStatus: StatusPresenca) => {
    throw new Error('A atualização da fila depende da API de fila, que ainda não está disponível.');
  };

  // Configuração das colunas para o Sistema Excel
  const colunasConfig = useMemo<ConfiguracaoColuna<ItemFila>[]>(
    () => [
      {
        id: 'horarioChegada',
        rotulo: 'DATA/HORA',
        tipo: 'texto',
        obterValor: (f) => `${f.dataChegada || new Date().toLocaleDateString('pt-BR')} ${f.horarioChegada}`,
      },
      {
        id: 'pacienteNome',
        rotulo: 'PACIENTE',
        tipo: 'texto',
        obterValor: (f) => f.pacienteNome,
      },
      {
        id: 'profissional',
        rotulo: 'PROFISSIONAL',
        tipo: 'texto',
        obterValor: (f) => `${f.profissional || ''} ${f.profissionalRegistro || ''}`,
      },
      {
        id: 'especialidade',
        rotulo: 'ESPECIALIDADE',
        tipo: 'opcao',
        obterValor: (f) => f.especialidade,
        formatarRotulo: (val) => ESPECIALIDADE_LABELS[val as Especialidade] || String(val),
      },
      {
        id: 'status',
        rotulo: 'SITUAÇÃO',
        tipo: 'opcao',
        obterValor: (f) => f.status,
        formatarRotulo: (val) => {
          if (val === 'AGUARDANDO') return 'Aguardando';
          if (val === 'CONFIRMADO') return 'Confirmado';
          if (val === 'EM_ATENDIMENTO') return 'Em Atendimento';
          if (val === 'CONCLUIDO') return 'Concluído';
          return String(val);
        },
      },
      {
        id: 'acoes',
        rotulo: 'AÇÕES',
        desabilitarFiltro: true,
        desabilitarOrdenacao: true,
      },
    ],
    []
  );

  // ─── Separação: apenas itens de HOJE na fila ativa ─────────────────────
  const filaHoje = useMemo(() =>
    fila.filter((f) => (f.dataChegada || HOJE) === HOJE),
    [fila]
  );

  const filtroExcel = useFiltroExcel<ItemFila>({
    dados: filaHoje,
    colunas: colunasConfig,
    buscaGeral: busca,
    funcaoBuscaGeral: (item, termo) =>
      item.pacienteNome.toLowerCase().includes(termo) ||
      Boolean(item.cpf && item.cpf.includes(termo)) ||
      item.horarioChegada.includes(termo) ||
      Boolean(item.profissional && item.profissional.toLowerCase().includes(termo)),
  });

  const { dadosFiltrados, temAlgumFiltroAtivo } = filtroExcel;

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const totalPaginas = Math.max(1, Math.ceil(dadosFiltrados.length / itensPorPagina));
  const paginaCorrigida = Math.min(paginaAtual, totalPaginas);
  const indiceInicio = (paginaCorrigida - 1) * itensPorPagina;
  const dadosPaginados = dadosFiltrados.slice(indiceInicio, indiceInicio + itensPorPagina);


  // Data formatada por extenso para exibição no cabeçalho
  const dataHojeExtenso = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col flex-1 animate-fade-in font-sans">
      {/* ─── Cabeçalho Fixo Modular ───────────────────────────────────────── */}
      <CabecalhoPagina
        titulo="Fila do Dia"
        subtitulo={`ATENDIMENTOS DE HOJE — ${dataHojeExtenso.toUpperCase()}`}
        busca={{
          valor: busca,
          aoMudar: setBusca,
          placeholder: 'Buscar aluno por nome ou CPF...',
        }}
        acaoPrimaria={{
          rotulo: 'Triagem / Check-in',
          aoClicar: () => setModalTriagemAberto(true),
        }}
        fixo={true}
      />

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
                  rotulo="DATA/HORA"
                  estado={filtroExcel}
                  className="px-4"
                />
                <CabecalhoColunaExcel
                  colunaId="pacienteNome"
                  rotulo="PACIENTE"
                  estado={filtroExcel}
                  className="px-4"
                />
                <CabecalhoColunaExcel
                  colunaId="profissional"
                  rotulo="PROFISSIONAL"
                  estado={filtroExcel}
                  className="px-3"
                />
                <CabecalhoColunaExcel
                  colunaId="especialidade"
                  rotulo="ESPECIALIDADE"
                  estado={filtroExcel}
                  className="px-3"
                />
                <CabecalhoColunaExcel
                  colunaId="status"
                  rotulo="SITUAÇÃO"
                  estado={filtroExcel}
                  className="px-3"
                />
                <th scope="col" className="py-3 px-4 font-bold text-slate-600 text-right">
                  AÇÕES
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {dadosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto px-4">
                      <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3 ring-8 ring-blue-50/60 shadow-xs">
                        {temAlgumFiltroAtivo ? <Clock3 className="w-7 h-7 text-blue-500" /> : <CalendarDays className="w-7 h-7 text-blue-500" />}
                      </div>
                      <h4 className="text-base font-bold text-slate-800 mb-1">
                        {temAlgumFiltroAtivo ? 'Nenhum aluno corresponde aos filtros aplicados' : 'Nenhum atendimento hoje'}
                      </h4>
                      <p className="text-xs text-slate-500 mb-4">
                        {temAlgumFiltroAtivo
                          ? 'Os filtros aplicados nas colunas ocultaram todos os registros.'
                          : 'A fila de hoje está vazia. Realize um check-in para adicionar o primeiro paciente do dia.'}
                      </p>
                      {temAlgumFiltroAtivo ? (
                        <button
                          type="button"
                          onClick={() => filtroExcel.limparTodosFiltros()}
                          className="inline-flex h-9 items-center gap-1.5 px-3.5 text-xs font-extrabold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-100"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Limpar Filtros das Colunas</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setModalTriagemAberto(true)}
                          className="inline-flex h-9 items-center gap-1.5 px-4 text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.22)] transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                        >
                          + Triagem / Check-in
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
                    <td className="py-3 px-4">
                      <div className="flex flex-col text-left">
                        <span className="font-mono font-extrabold text-xs text-slate-900 tracking-tight">
                          {item.horarioChegada}
                        </span>
                        <span className="text-[10.5px] font-medium text-slate-400 font-mono mt-0.5">
                          {item.dataChegada || new Date().toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 uppercase tracking-tight text-xs">
                            {item.pacienteNome}
                          </span>
                          {item.prioridade && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-100 text-rose-800 uppercase">
                              Prioridade
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-normal">
                          CPF: {item.cpf ? censurarCpf(item.cpf) : 'Não informado'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {item.profissional ? (
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-slate-900 uppercase tracking-tight text-xs truncate max-w-[210px]">
                            {item.profissional.replace(/^(Dr\.ª?|Dra?\.?)\s*/i, '')}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono font-medium">
                            {item.profissionalRegistro || 'Registro N/I'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Não informado</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <EspecialidadeBadge especialidade={item.especialidade} compacto />
                    </td>

                    <td className="py-3 px-3">
                      {item.status === 'AGUARDANDO' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Aguardando
                        </span>
                      ) : item.status === 'CONFIRMADO' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                          Confirmado
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
                        {/* PASSO 1: Confirmar presença — botão âmbar */}
                        {item.status === 'AGUARDANDO' && (
                          <button
                            type="button"
                            onClick={() => alternarStatus(item.id, 'CONFIRMADO')}
                            className="inline-flex h-8 items-center gap-1.5 px-3 text-[11px] font-extrabold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl shadow-[0_2px_8px_rgba(245,158,11,0.12)] transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-100"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5 text-amber-600" />
                            Confirmar
                          </button>
                        )}
                        {/* PASSO 2: Inicia o atendimento e abre o prontuário */}
                        {item.status === 'CONFIRMADO' && (
                          <button
                            type="button"
                            onClick={() => {
                              alternarStatus(item.id, 'EM_ATENDIMENTO');
                              setDadosAtendimentoAtivo({
                                itemId: item.id,
                                pacienteNome: item.pacienteNome,
                                cpf: item.cpf,
                                idade: item.idade,
                                escolaNome: item.escolaNome,
                                especialidade: item.especialidade,
                                profissional: item.profissional,
                                profissionalRegistro: item.profissionalRegistro,
                                horarioChegada: item.horarioChegada,
                              });
                              setModalAtendimentoAberto(true);
                            }}
                            className="inline-flex h-8 items-center gap-1.5 px-3 text-[11px] font-extrabold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.24)] transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Iniciar Atendimento
                          </button>
                        )}
                        {/* Atendimento em andamento — retoma o prontuário */}
                        {item.status === 'EM_ATENDIMENTO' && (
                          <button
                            type="button"
                            onClick={() => {
                              setDadosAtendimentoAtivo({
                                itemId: item.id,
                                pacienteNome: item.pacienteNome,
                                cpf: item.cpf,
                                idade: item.idade,
                                escolaNome: item.escolaNome,
                                especialidade: item.especialidade,
                                profissional: item.profissional,
                                profissionalRegistro: item.profissionalRegistro,
                                horarioChegada: item.horarioChegada,
                              });
                              setModalAtendimentoAberto(true);
                            }}
                            className="inline-flex h-8 items-center gap-1.5 px-3 text-[11px] font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-xl shadow-[0_2px_8px_rgba(37,99,235,0.12)] transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                          >
                            <Play className="w-3.5 h-3.5 text-blue-600" />
                            Continuar
                          </button>
                        )}
                        {item.status === 'CONCLUIDO' && (
                          <div className="relative inline-flex items-center" data-confirmacao-alteracao>
                            <button
                              type="button"
                              onClick={() => setConfirmandoAlteracaoId(item.id)}
                              className="inline-flex p-0 text-[11px] text-slate-400 font-medium cursor-pointer"
                            >
                              <span className="group/finalizado relative inline-block hover:text-blue-700">
                                Finalizado
                                <span className="pointer-events-none absolute right-0 bottom-full mb-2 hidden items-center whitespace-nowrap rounded-2xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 shadow-lg shadow-slate-900/5 group-hover/finalizado:flex animate-fade-in">
                                  Alterar atendimento
                                  <span className="absolute right-3 -bottom-1 h-2 w-2 rotate-45 border-r border-b border-blue-200 bg-blue-50" aria-hidden="true" />
                                </span>
                              </span>
                            </button>
                            {confirmandoAlteracaoId === item.id && (
                              <div className="absolute right-0 bottom-full mb-2 inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-900/10 whitespace-nowrap z-50 animate-fade-in">
                                <span className="text-[12px] font-medium text-slate-500">Deseja alterar?</span>
                                <button
                                  type="button"
                                  onClick={() => setConfirmandoAlteracaoId(null)}
                                  className="px-2.5 py-1 text-[11px] text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition-colors font-semibold cursor-pointer"
                                >
                                  Não
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setConfirmandoAlteracaoId(null);
                                    alternarStatus(item.id, 'EM_ATENDIMENTO');
                                    setDadosAtendimentoAtivo({
                                      itemId: item.id,
                                      pacienteNome: item.pacienteNome,
                                      cpf: item.cpf,
                                      idade: item.idade,
                                      escolaNome: item.escolaNome,
                                      especialidade: item.especialidade,
                                      profissional: item.profissional,
                                      profissionalRegistro: item.profissionalRegistro,
                                      horarioChegada: item.horarioChegada,
                                    });
                                    setModalAtendimentoAberto(true);
                                  }}
                                  className="px-2.5 py-1 text-[11px] bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors font-bold shadow-sm cursor-pointer"
                                >
                                  Sim
                                </button>
                                <div className="absolute right-3 -bottom-1.5 w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45" aria-hidden="true" />
                              </div>
                            )}
                          </div>
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

      {/* Modal de Triagem e Check-in com Seleção de Instituição, Paciente e Profissional */}
      <ModalTriagem
        aberto={modalTriagemAberto}
        aoFechar={() => setModalTriagemAberto(false)}
        aoConfirmar={handleConfirmarTriagem}
        escolas={escolas}
        pacientes={pacientes}
        atendimentos={atendimentos}
        profissionais={profissionais}
        aoCriarNovoPaciente={aoNovoPaciente}
      />

      {/* Modal de finalização do atendimento (Prontuário Clínico) */}
      <ModalIniciarAtendimento
        aberto={modalAtendimentoAberto}
        dados={dadosAtendimentoAtivo}
        aoFechar={() => {
          setModalAtendimentoAberto(false);
          setDadosAtendimentoAtivo(null);
        }}
        aoConfirmar={(itemId, _anotacoes) => {
          alternarStatus(itemId, 'CONCLUIDO');
          const item = fila.find((f) => f.id === itemId);
          if (item) {
            aoIniciarAtendimento({
              id: item.id,
              nome: item.pacienteNome,
              especialidade: item.especialidade,
              turno: item.turno,
              horario: item.horarioChegada,
            });
          }
        }}
      />
    </div>
  );
};

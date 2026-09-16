import { type FC, useState, useMemo, useRef, useEffect } from 'react';
import { Calendar, FileText, RotateCcw, ClipboardCheck, Play, Ban } from 'lucide-react';
import {
  ESPECIALIDADE_LABELS,
  Especialidade,
  STATUS_ATENDIMENTO_LABELS,
  StatusAtendimento,
  formatarHoraBrasilia,
  formatarDataBrasilia,
  formatarDataEHoraBrasilia,
  obterDataIsoBrasilia,
} from '../../compartilhado/index.ts';
import { CabecalhoPagina } from './CabecalhoPagina.tsx';
import {
  useFiltroExcel,
  CabecalhoColunaExcel,
  BarraFiltrosAtivos,
  type ConfiguracaoColuna,
} from './tabelaExcel/index.ts';
import { Paginacao } from './Paginacao.tsx';
import { useItensPorPaginaInteligente } from '../utilitarios/useItensPorPaginaInteligente.ts';
import { EspecialidadeBadge } from './EspecialidadeVisual.tsx';
import { SelectModal } from './Modal.tsx';
import { Botao } from './Botao.tsx';
import { StatusAtendimentoBadge } from './StatusAtendimentoBadge.tsx';
import { ModalIniciarAtendimento, type DadosAtendimento } from './ModalIniciarAtendimento.tsx';
import { requisicaoApi } from '../servicos/api.ts';
import { CardHoverPaciente } from './CardHoverPaciente.tsx';
import { type ItemPaciente, calcularIdade, censurarCpf } from './TabelaPacientes.tsx';
import { formatarConselhoERegistro } from './FilaDoDia.tsx';

export interface ItemAtendimentoLista {
  id: string;
  pacienteId: string;
  escolaId?: string;
  profissionalId?: string;
  pacienteNome: string;
  pacienteCpf?: string;
  especialidade: Especialidade;
  escolaNome: string;
  profissionalNome: string;
  profissionalRegistro?: string;
  profissionalConselho?: string;
  resumo?: string;
  criadoEm: string;
  entradaFilaEm?: string;
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
  aoAtualizarStatus?: (id: string, status: StatusAtendimento) => void | Promise<void>;
  aoSalvarAtendimento?: (atendimento: ItemAtendimentoLista) => void;
  ehAdmin?: boolean;
  pacientes?: ItemPaciente[];
  escolas?: Array<{ id: string; nome: string }>;
  profissionais?: Array<{ id: string; nome: string; registro?: string; registroConselho?: string; conselho?: string; conselhoProfissional?: string; registroProfissional?: string }>;
  aoVerHistoricoPaciente?: (paciente: ItemPaciente) => void;
  paginaServidor?: number;
  totalPaginasServidor?: number;
  totalRegistrosServidor?: number;
  aoMudarPaginaServidor?: (pagina: number) => void;
  itensPorPaginaServidor?: number;
}

export const Atendimentos: FC<AtendimentosProps> = ({
  atendimentos: atendimentosProp,
  aoSincronizar,
  aoAtualizarStatus,
  aoSalvarAtendimento,
  ehAdmin = false,
  pacientes = [],
  escolas = [],
  profissionais = [],
  aoVerHistoricoPaciente,
  statusSincronizacaoCatraki: _statusSincronizacaoCatraki,
  aoNovoAtendimento: _aoNovoAtendimento,
  paginaServidor,
  totalPaginasServidor,
  totalRegistrosServidor,
  aoMudarPaginaServidor,
  itensPorPaginaServidor,
}) => {
  const [atendimentosLocais, setAtendimentosLocais] = useState<ItemAtendimentoLista[]>(atendimentosProp);

  useEffect(() => {
    setAtendimentosLocais(atendimentosProp);
  }, [atendimentosProp]);

  const atendimentos = atendimentosLocais;

  const [modalAtendimentoAberto, setModalAtendimentoAberto] = useState(false);
  const [dadosAtendimentoAtivo, setDadosAtendimentoAtivo] = useState<DadosAtendimento | null>(null);
  const [modalModoVisualizacao, setModalModoVisualizacao] = useState(false);
  const [confirmandoAlteracaoId, setConfirmandoAlteracaoId] = useState<string | null>(null);
  const [confirmandoCancelamentoId, setConfirmandoCancelamentoId] = useState<string | null>(null);
  const [confirmandoPresencaId, setConfirmandoPresencaId] = useState<string | null>(null);
  const [confirmandoReativacaoId, setConfirmandoReativacaoId] = useState<string | null>(null);

  useEffect(() => {
    if (!confirmandoAlteracaoId && !confirmandoCancelamentoId && !confirmandoPresencaId && !confirmandoReativacaoId) return undefined;

    const fecharAoClicarFora = (evento: MouseEvent) => {
      const alvo = evento?.target as HTMLElement | undefined;
      if (alvo && typeof alvo.closest === 'function') {
        if (!alvo.closest('[data-confirmacao-popover]')) {
          setConfirmandoAlteracaoId(null);
          setConfirmandoCancelamentoId(null);
          setConfirmandoPresencaId(null);
          setConfirmandoReativacaoId(null);
        }
      } else {
        setConfirmandoAlteracaoId(null);
        setConfirmandoCancelamentoId(null);
        setConfirmandoPresencaId(null);
        setConfirmandoReativacaoId(null);
      }
    };
    const fecharComEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        setConfirmandoAlteracaoId(null);
        setConfirmandoCancelamentoId(null);
        setConfirmandoPresencaId(null);
        setConfirmandoReativacaoId(null);
      }
    };

    document.addEventListener('mousedown', fecharAoClicarFora);
    document.addEventListener('keydown', fecharComEscape);
    return () => {
      document.removeEventListener('mousedown', fecharAoClicarFora);
      document.removeEventListener('keydown', fecharComEscape);
    };
  }, [confirmandoAlteracaoId, confirmandoCancelamentoId, confirmandoPresencaId, confirmandoReativacaoId]);

  const handleAlterarStatus = async (id: string, novoStatus: StatusAtendimento) => {
    const item = atendimentos.find((a) => a.id === id);
    const statusAnterior = item?.status;
    setAtendimentosLocais((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: novoStatus } : a))
    );
    try {
      if (aoAtualizarStatus) {
        await aoAtualizarStatus(id, novoStatus);
      } else {
        await requisicaoApi(`/atendimentos/${id}/status`, {
          metodo: 'PATCH',
          corpo: { status: novoStatus },
        });
      }
    } catch (err) {
      setAtendimentosLocais((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: statusAnterior } : a))
      );
      console.error('Erro ao atualizar status do atendimento:', err);
    }
  };

  const handleCancelarAtendimento = async (id: string) => {
    setConfirmandoCancelamentoId(null);
    await handleAlterarStatus(id, StatusAtendimento.CANCELADO);
    aoSincronizar?.();
  };

  const abrirModalProntuario = async (
    item: ItemAtendimentoLista,
    alterarParaEmAtendimento = false,
    somenteLeitura = false
  ) => {
    if (alterarParaEmAtendimento && item.status !== StatusAtendimento.EM_ATENDIMENTO) {
      await handleAlterarStatus(item.id, StatusAtendimento.EM_ATENDIMENTO);
    }

    const pacienteEncontrado = pacientes.find(
      (p) => p.id === item.pacienteId || p.nome === item.pacienteNome
    );
    const escolaEncontrada = escolas.find(
      (e) => e.id === item.escolaId || e.nome === item.escolaNome
    );
    const profissionalEncontrado = profissionais.find(
      (pr) => pr.id === item.profissionalId || pr.nome === item.profissionalNome
    );

    const hora = formatarHoraBrasilia(item.criadoEm);

    setDadosAtendimentoAtivo({
      itemId: item.id,
      atendimentoId: item.id,
      pacienteId: item.pacienteId || pacienteEncontrado?.id,
      escolaId: item.escolaId || escolaEncontrada?.id,
      pacienteNome: item.pacienteNome,
      cpf: pacienteEncontrado?.cpf,
      idade: pacienteEncontrado?.dataNascimento ? calcularIdade(pacienteEncontrado.dataNascimento) : 0,
      escolaNome: item.escolaNome,
      especialidade: item.especialidade,
      profissional: item.profissionalNome,
      profissionalId: item.profissionalId || profissionalEncontrado?.id,
      profissionalRegistro: profissionalEncontrado?.registroConselho || profissionalEncontrado?.registro,
      profissionalConselho: profissionalEncontrado?.conselho,
      horarioChegada: hora !== 'Invalid Date' ? hora : '--:--',
      anotacoes: item.resumo || '',
    });
    setModalModoVisualizacao(somenteLeitura);
    setModalAtendimentoAberto(true);
  };

  const handleSalvarAtendimentoProntuario = async (
    itemId: string,
    textoAnotacoes: string,
    dadosAtendimento: DadosAtendimento
  ) => {
    try {
      await requisicaoApi(`/atendimentos/${itemId}`, {
        metodo: 'PATCH',
        corpo: {
          resumo: textoAnotacoes,
          status: StatusAtendimento.CONCLUIDO,
          ...(dadosAtendimento.profissionalId ? { usuarioId: dadosAtendimento.profissionalId } : {}),
        },
      });
      setAtendimentosLocais((prev) =>
        prev.map((a) =>
          a.id === itemId
            ? { ...a, resumo: textoAnotacoes, status: StatusAtendimento.CONCLUIDO }
            : a
        )
      );
      aoAtualizarStatus?.(itemId, StatusAtendimento.CONCLUIDO);
      aoSalvarAtendimento?.({
        id: itemId,
        pacienteId: dadosAtendimento.pacienteId || '',
        pacienteNome: dadosAtendimento.pacienteNome,
        especialidade: dadosAtendimento.especialidade,
        escolaNome: dadosAtendimento.escolaNome,
        profissionalNome: dadosAtendimento.profissional || '',
        resumo: textoAnotacoes,
        criadoEm: new Date().toISOString(),
        status: StatusAtendimento.CONCLUIDO,
      });
      setModalAtendimentoAberto(false);
      setDadosAtendimentoAtivo(null);
    } catch (erro) {
      console.error('Erro ao salvar prontuário:', erro);
    }
  };
  const [busca, setBusca] = useState('');
  // O histórico clínico começa mostrando todos os atendimentos por padrão: status "Todos" e período "Tudo".
  const [statusFiltro, setStatusFiltro] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [periodoSelecionado, setPeriodoSelecionado] = useState<number | 'mes' | 'tudo' | null>('tudo');
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const dataInicioRef = useRef<HTMLInputElement>(null);
  const dataFimRef = useRef<HTMLInputElement>(null);

  const normalizarStatusAtendimento = (status?: string): StatusAtendimento => {
    if (!status) return StatusAtendimento.CONCLUIDO;
    if (status === 'AGUARDANDO') return StatusAtendimento.AGENDADO;
    return status as StatusAtendimento;
  };

  const extrairDataIsoParaFiltro = (dataStr?: string): string => {
    return obterDataIsoBrasilia(dataStr);
  };

  // Opções completas de profissionais (todos os cadastrados no sistema + histórico)
  const opcoesProfissionais = useMemo(() => {
    const mapa = new Map<string, string>();
    profissionais.forEach((p) => {
      if (p.nome?.trim()) mapa.set(p.nome.trim(), p.nome.trim());
    });
    atendimentos.forEach((a) => {
      if (a.profissionalNome?.trim() && a.profissionalNome !== 'Profissional de Saúde' && a.profissionalNome !== 'Desconhecido') {
        mapa.set(a.profissionalNome.trim(), a.profissionalNome.trim());
      }
    });
    return Array.from(mapa.values())
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
      .map((nome) => ({
        valorChave: nome,
        rotuloExibicao: nome,
      }));
  }, [profissionais, atendimentos]);

  // Opções completas de especialidades clínicas
  const opcoesEspecialidades = useMemo(() => {
    return Object.entries(ESPECIALIDADE_LABELS)
      .sort(([, a], [, b]) => String(a).localeCompare(String(b), 'pt-BR'))
      .map(([chave, rotulo]) => ({
        valorChave: chave,
        rotuloExibicao: String(rotulo),
      }));
  }, []);

  // Opções completas de instituições escolares
  const opcoesEscolas = useMemo(() => {
    const mapa = new Map<string, string>();
    escolas.forEach((e) => {
      if (e.nome?.trim()) mapa.set(e.nome.trim(), e.nome.trim());
    });
    atendimentos.forEach((a) => {
      if (a.escolaNome?.trim() && a.escolaNome !== 'Não informada' && a.escolaNome !== 'Desconhecida') {
        mapa.set(a.escolaNome.trim(), a.escolaNome.trim());
      }
    });
    return Array.from(mapa.values())
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
      .map((nome) => ({
        valorChave: nome,
        rotuloExibicao: nome,
      }));
  }, [escolas, atendimentos]);

  // Opções completas de status de atendimento
  const opcoesStatus = useMemo(() => {
    return Object.entries(STATUS_ATENDIMENTO_LABELS).map(([chave, rotulo]) => ({
      valorChave: chave,
      rotuloExibicao: String(rotulo),
    }));
  }, []);

  const colunasConfig = useMemo<ConfiguracaoColuna<ItemAtendimentoLista>[]>(
    () => [
      {
        id: 'pacienteNome',
        rotulo: 'PACIENTE',
        tipo: 'texto',
        obterValor: (i) => i.pacienteNome,
        desabilitarFiltro: true,
      },
      {
        id: 'profissionalNome',
        rotulo: 'PROFISSIONAL',
        tipo: 'texto',
        obterValor: (i) => i.profissionalNome,
        valoresOpcoesPredefinidas: opcoesProfissionais,
      },
      {
        id: 'especialidade',
        rotulo: 'ESPECIALIDADE',
        tipo: 'opcao',
        obterValor: (i) => i.especialidade,
        formatarRotulo: (val) => ESPECIALIDADE_LABELS[val as Especialidade] || String(val),
        valoresOpcoesPredefinidas: opcoesEspecialidades,
      },
      {
        id: 'escolaNome',
        rotulo: 'ESCOLA',
        tipo: 'texto',
        obterValor: (i) => i.escolaNome,
        valoresOpcoesPredefinidas: opcoesEscolas,
      },
      {
        id: 'criadoEm',
        rotulo: 'DATA',
        tipo: 'data',
        obterValor: (i) => i.criadoEm,
        formatarRotulo: (val) => formatarDataEHoraBrasilia(val),
        desabilitarFiltro: true,
      },
      {
        id: 'status',
        rotulo: 'STATUS',
        tipo: 'opcao',
        obterValor: (i) => normalizarStatusAtendimento(i.status),
        formatarRotulo: (val) => STATUS_ATENDIMENTO_LABELS[val as StatusAtendimento] || String(val),
        valoresOpcoesPredefinidas: opcoesStatus,
      },
    ],
    [opcoesProfissionais, opcoesEspecialidades, opcoesEscolas, opcoesStatus]
  );

  const dadosBase = useMemo(() => {
    return atendimentos.filter((item) => {
      const dataIso = extrairDataIsoParaFiltro(item.criadoEm);
      const status = normalizarStatusAtendimento(item.status);
      const atendeStatus = !statusFiltro || status === statusFiltro;
      const atendeDataInicio = !dataInicio || (dataIso ? dataIso >= dataInicio : true);
      const atendeDataFim = !dataFim || (dataIso ? dataIso <= dataFim : true);
      return atendeStatus && atendeDataInicio && atendeDataFim;
    });
  }, [atendimentos, dataFim, dataInicio, statusFiltro]);

  const aplicarPeriodo = (dias: number | 'mes' | 'tudo') => {
    setPeriodoSelecionado(dias);
    setDiaSelecionado(null);
    if (dias === 'tudo') {
      setDataInicio('');
      setDataFim('');
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
    funcaoBuscaGeral: (item, termo) => {
      const paciente = pacientes.find(
        (p) => (item.pacienteId && p.id === item.pacienteId) || (p.nome && item.pacienteNome && p.nome.trim().toLowerCase() === item.pacienteNome.trim().toLowerCase())
      );
      const prof = profissionais.find(
        (p) =>
          (item.profissionalId && p.id === item.profissionalId) ||
          (p.nome && item.profissionalNome && (
            p.nome.trim().toLowerCase() === item.profissionalNome.trim().toLowerCase() ||
            p.nome.trim().toLowerCase().startsWith(item.profissionalNome.trim().toLowerCase()) ||
            item.profissionalNome.trim().toLowerCase().startsWith(p.nome.trim().toLowerCase())
          ))
      );
      const cpfLimpo = (item.pacienteCpf || paciente?.cpf || '').replace(/\D/g, '');
      const termoNumerico = termo.replace(/\D/g, '');
      const reg = (item.profissionalRegistro || prof?.registro || (prof as any)?.registroProfissional || '').toLowerCase();
      const cons = (item.profissionalConselho || prof?.conselho || (prof as any)?.conselhoProfissional || '').toLowerCase();
      const cr = (formatarConselhoERegistro(reg, cons, item.especialidade) || '').toLowerCase();

      return (
        item.pacienteNome.toLowerCase().includes(termo) ||
        item.profissionalNome.toLowerCase().includes(termo) ||
        item.escolaNome.toLowerCase().includes(termo) ||
        Boolean(item.resumo && item.resumo.toLowerCase().includes(termo)) ||
        (termoNumerico.length >= 3 && cpfLimpo.includes(termoNumerico)) ||
        reg.includes(termo) ||
        cons.includes(termo) ||
        cr.includes(termo)
      );
    },
  });

  const { dadosFiltrados, temAlgumFiltroAtivo } = filtroExcel;

  const [paginaLocal, setPaginaLocal] = useState(1);
  const itensCalculados = useItensPorPaginaInteligente(310, 48, 6, 12);
  const itensPorPagina = itensPorPaginaServidor || itensCalculados;
  const usandoPaginacaoServidor = typeof totalPaginasServidor === 'number' && totalPaginasServidor > 1;

  const totalPaginas = usandoPaginacaoServidor && !temAlgumFiltroAtivo
    ? totalPaginasServidor
    : Math.max(1, Math.ceil(dadosFiltrados.length / itensPorPagina));

  const totalRegistros = usandoPaginacaoServidor && !temAlgumFiltroAtivo
    ? (totalRegistrosServidor ?? dadosFiltrados.length)
    : dadosFiltrados.length;

  const paginaExibida = usandoPaginacaoServidor && !temAlgumFiltroAtivo
    ? (paginaServidor ?? 1)
    : Math.min(paginaLocal, totalPaginas);

  const dadosPaginados = usandoPaginacaoServidor && !temAlgumFiltroAtivo
    ? dadosFiltrados.slice(0, itensPorPagina)
    : dadosFiltrados.slice((paginaExibida - 1) * itensPorPagina, paginaExibida * itensPorPagina);

  const handleMudarPagina = (novaPagina: number) => {
    if (usandoPaginacaoServidor && !temAlgumFiltroAtivo && aoMudarPaginaServidor) {
      aoMudarPaginaServidor(novaPagina);
    } else {
      setPaginaLocal(novaPagina);
    }
  };

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
                placeholder="Todos"
                className="!h-10 !w-[170px] !min-w-0 shrink-0 [&>button]:!h-10 [&>button]:!rounded-2xl [&>button]:!border-slate-200 [&>button]:!bg-white [&>button]:!px-3 [&>button]:!text-xs [&>button_span]:!text-slate-800"
                pesquisavel={false}
                opcoes={[
                  { valor: '', rotulo: 'Todos' },
                  ...Object.entries(STATUS_ATENDIMENTO_LABELS).map(([valor, rotulo]) => ({
                    valor,
                    rotulo: String(rotulo),
                  })),
                ]}
              />
              <label className="relative flex h-10 cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 transition-colors hover:border-slate-300" onClick={(evento) => { evento.preventDefault(); dataInicioRef.current?.showPicker?.(); }}>
                <span className="shrink-0">De</span>
                <span className="pointer-events-none flex min-w-0 items-center gap-2 whitespace-nowrap text-slate-700">
                  <span>{dataInicio ? formatarDataBrasilia(dataInicio) : 'dd/mm/aaaa'}</span>
                  {dataInicio && <span className="rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[9px] font-bold uppercase tracking-tight text-blue-700">{obterDiaDaSemana(dataInicio)}</span>}
                </span>
                <Calendar className="pointer-events-none ml-auto h-3.5 w-3.5 shrink-0 text-slate-400" />
                <input ref={dataInicioRef} type="date" value={dataInicio} onChange={(evento) => { setPeriodoSelecionado(null); setDiaSelecionado(null); setDataInicio(evento.target.value); }} className="pointer-events-none absolute h-px w-px opacity-0" aria-label="Data inicial" />
              </label>
              <label className="relative flex h-10 cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 transition-colors hover:border-slate-300" onClick={(evento) => { evento.preventDefault(); dataFimRef.current?.showPicker?.(); }}>
                <span className="shrink-0">Até</span>
                <span className="pointer-events-none flex min-w-0 items-center gap-2 whitespace-nowrap text-slate-700">
                  <span>{dataFim ? formatarDataBrasilia(dataFim) : 'dd/mm/aaaa'}</span>
                  {dataFim && <span className="rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[9px] font-bold uppercase tracking-tight text-blue-700">{obterDiaDaSemana(dataFim)}</span>}
                </span>
                <Calendar className="pointer-events-none ml-auto h-3.5 w-3.5 shrink-0 text-slate-400" />
                <input ref={dataFimRef} type="date" value={dataFim} onChange={(evento) => { setPeriodoSelecionado(null); setDiaSelecionado(null); setDataFim(evento.target.value); }} className="pointer-events-none absolute h-px w-px opacity-0" aria-label="Data final" />
              </label>
            </div>
            <div className="flex flex-nowrap items-center justify-end gap-1.5">
              <div className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => aplicarDia(-2)}
                  aria-pressed={diaSelecionado === -2}
                  className={`h-8 rounded-lg px-3 text-[11px] font-bold transition-all cursor-pointer ${
                    diaSelecionado === -2
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  Anteontem
                </button>
                <button
                  type="button"
                  onClick={() => aplicarDia(-1)}
                  aria-pressed={diaSelecionado === -1}
                  className={`h-8 rounded-lg px-3 text-[11px] font-bold transition-all cursor-pointer ${
                    diaSelecionado === -1
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  Ontem
                </button>
                <button
                  type="button"
                  onClick={() => aplicarDia(0)}
                  aria-pressed={diaSelecionado === 0}
                  className={`h-8 rounded-lg px-3 text-[11px] font-bold transition-all cursor-pointer ${
                    diaSelecionado === 0
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  Hoje
                </button>
              </div>
              <span className="mx-0.5 h-6 w-px bg-slate-200" aria-hidden="true" />
              <button
                type="button"
                onClick={() => aplicarPeriodo(7)}
                className={`h-10 rounded-xl border px-3 text-[11px] font-bold transition-all cursor-pointer ${
                  periodoSelecionado === 7
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                7 dias
              </button>
              <button
                type="button"
                onClick={() => aplicarPeriodo(15)}
                className={`hidden h-10 rounded-xl border px-3 text-[11px] font-bold transition-all cursor-pointer md:block ${
                  periodoSelecionado === 15
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                15 dias
              </button>
              <button
                type="button"
                onClick={() => aplicarPeriodo(30)}
                className={`h-10 rounded-xl border px-3 text-[11px] font-bold transition-all cursor-pointer ${
                  periodoSelecionado === 30
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                30 dias
              </button>
              <button
                type="button"
                onClick={() => aplicarPeriodo('mes')}
                className={`hidden h-10 rounded-xl border px-3 text-[11px] font-bold transition-all cursor-pointer lg:block ${
                  periodoSelecionado === 'mes'
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                Este mês
              </button>
              <button
                type="button"
                onClick={() => aplicarPeriodo('tudo')}
                className={`h-10 rounded-xl border px-3 text-[11px] font-bold transition-all cursor-pointer ${
                  periodoSelecionado === 'tudo'
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                Tudo
              </button>
              <span className="mx-0.5 h-6 w-px bg-slate-200" aria-hidden="true" />
              <button
                type="button"
                onClick={() => {
                  setBusca('');
                  setStatusFiltro('');
                  setDataInicio('');
                  setDataFim('');
                  setPeriodoSelecionado('tudo');
                  setDiaSelecionado(null);
                  filtroExcel.limparTodosFiltros();
                  handleMudarPagina(1);
                }}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Limpar
              </button>
            </div>
          </div>
        }
        fixo={true}
      />

      {/* ─── Tabela de Registros com Filtros Excel ────────────────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col flex-1 min-h-0">
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
                  className="px-3.5 py-3 max-w-[180px] xl:max-w-[220px]"
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
                <CabecalhoColunaExcel
                  colunaId="status"
                  rotulo="STATUS"
                  estado={filtroExcel}
                  className="px-3.5 py-3"
                />
                <th scope="col" className="py-3 px-4 font-bold text-slate-600 text-right">
                  <span>AÇÕES</span>
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
                        <Botao
                          variante="secundario"
                          tamanho="sm"
                          formato="pilula"
                          onClick={() => filtroExcel.limparTodosFiltros()}
                          icone={<RotateCcw className="w-3.5 h-3.5" />}
                        >
                          Limpar Filtros das Colunas
                        </Botao>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                dadosPaginados.map((item) => {
                  const pacienteEncontrado = pacientes.find(
                    (p) =>
                      (item.pacienteId && p.id === item.pacienteId) ||
                      (p.nome && item.pacienteNome && p.nome.trim().toLowerCase() === item.pacienteNome.trim().toLowerCase())
                  );
                  const pacienteCompleto: ItemPaciente = pacienteEncontrado || {
                    id: item.pacienteId || item.id,
                    nome: item.pacienteNome,
                    cpf: item.pacienteCpf,
                    dataNascimento: '',
                    escolaNome: item.escolaNome || 'Não informada',
                    termoConsentimentoStatus: 'PENDENTE',
                    atendimentosCount: 1,
                    criadoEm: item.criadoEm || new Date().toISOString(),
                  };

                  const cpfBruto = item.pacienteCpf || pacienteEncontrado?.cpf || pacienteCompleto.cpf;
                  const cpfValido = cpfBruto && cpfBruto !== 'Não informado' && cpfBruto.replace(/\D/g, '').length > 0;
                  const cpfFormatado = cpfValido ? censurarCpf(cpfBruto) : null;

                  const profEncontrado = profissionais.find(
                    (p) =>
                      (item.profissionalId && p.id === item.profissionalId) ||
                      (p.nome && item.profissionalNome && (
                        p.nome.trim().toLowerCase() === item.profissionalNome.trim().toLowerCase() ||
                        p.nome.trim().toLowerCase().startsWith(item.profissionalNome.trim().toLowerCase()) ||
                        item.profissionalNome.trim().toLowerCase().startsWith(p.nome.trim().toLowerCase())
                      ))
                  );

                  const registroProf = item.profissionalRegistro || profEncontrado?.registro || (profEncontrado as any)?.registroProfissional;
                  const conselhoProf = item.profissionalConselho || profEncontrado?.conselho || (profEncontrado as any)?.conselhoProfissional;
                  const conselhoRegistro = formatarConselhoERegistro(
                    registroProf,
                    conselhoProf,
                    item.especialidade
                  );

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group border-b border-slate-100 last:border-0">
                      <td className="py-3 px-4.5 font-semibold text-slate-900">
                        <CardHoverPaciente
                          paciente={pacienteCompleto}
                          aoVerDetalhes={aoVerHistoricoPaciente ? () => aoVerHistoricoPaciente(pacienteCompleto) : undefined}
                        >
                          <div className="flex flex-col text-left">
                            <button
                              type="button"
                              onClick={() => aoVerHistoricoPaciente?.(pacienteCompleto)}
                              className="text-left font-semibold text-slate-900 uppercase tracking-tight text-xs cursor-pointer select-none no-underline hover:text-blue-600 transition-colors"
                              title="Clique para abrir o Histórico Clínico deste paciente"
                            >
                              {item.pacienteNome}
                            </button>
                            <span className="text-[11px] font-mono text-slate-500 font-normal mt-0.5 block">
                              {cpfFormatado ? `CPF: ${cpfFormatado}` : 'CPF não informado'}
                            </span>
                          </div>
                        </CardHoverPaciente>
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 font-medium max-w-[180px] xl:max-w-[220px]">
                        <div className="flex flex-col text-left">
                          <span
                            className="block truncate max-w-[180px] xl:max-w-[220px] text-xs font-semibold text-slate-800 uppercase tracking-tight"
                            title={item.profissionalNome}
                          >
                            {item.profissionalNome}
                          </span>
                          <span
                            className={`text-[11px] font-mono mt-0.5 block truncate max-w-[180px] xl:max-w-[220px] ${
                              conselhoRegistro ? 'text-slate-500 font-normal' : 'text-slate-400 italic font-normal'
                            }`}
                            title={conselhoRegistro || 'Registro não informado'}
                          >
                            {conselhoRegistro || 'Não informado'}
                          </span>
                        </div>
                      </td>
                    <td className="py-3 px-3.5">
                      <EspecialidadeBadge especialidade={item.especialidade} compacto />
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 font-medium">{item.escolaNome}</td>
                    <td className="py-3 px-3.5">
                      <div className="flex flex-col text-left">
                        <span className="font-mono font-extrabold text-xs text-slate-900 tracking-tight">
                          {formatarHoraBrasilia(item.criadoEm)}
                        </span>
                        <span className="text-[10.5px] font-medium text-slate-400 font-mono mt-0.5">
                          {formatarDataBrasilia(item.criadoEm)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <StatusAtendimentoBadge status={item.status || StatusAtendimento.CONCLUIDO} />
                    </td>
                    <td className={`py-3 px-4 text-right ${confirmandoAlteracaoId === item.id || confirmandoCancelamentoId === item.id || confirmandoPresencaId === item.id || confirmandoReativacaoId === item.id ? 'relative z-50' : ''}`}>
                      <div className="flex items-center justify-end gap-1.5" data-confirmacao-popover>
                        {/* PASSO 1: AGUARDANDO / AGENDADO */}
                        {(item.status === StatusAtendimento.AGENDADO || (item.status as unknown) === 'AGUARDANDO') && (
                          <>
                            <div className="relative inline-flex items-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmandoPresencaId(confirmandoPresencaId === item.id ? null : item.id);
                                  setConfirmandoCancelamentoId(null);
                                  setConfirmandoAlteracaoId(null);
                                  setConfirmandoReativacaoId(null);
                                }}
                                className="inline-flex h-8 items-center gap-1.5 px-3 text-[11px] font-extrabold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl shadow-[0_2px_8px_rgba(245,158,11,0.12)] transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-100"
                              >
                                <ClipboardCheck className="w-3.5 h-3.5 text-amber-600" />
                                Confirmar
                              </button>
                              {confirmandoPresencaId === item.id && (
                                <div className="absolute right-0 top-full mt-1.5 flex flex-col gap-2 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/15 whitespace-nowrap z-[100] animate-fade-in text-left">
                                  <div className="absolute right-6 -top-1.5 w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45" aria-hidden="true" />
                                  <span className="text-[11.5px] font-bold text-slate-700">Deseja confirmar a presença deste aluno?</span>
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setConfirmandoPresencaId(null)}
                                      className="px-2.5 py-1 text-[11px] text-slate-500 hover:bg-slate-100 rounded-lg transition-colors font-semibold cursor-pointer"
                                    >
                                      Voltar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        setConfirmandoPresencaId(null);
                                        await handleAlterarStatus(item.id, StatusAtendimento.CONFIRMADO);
                                      }}
                                      className="px-2.5 py-1 text-[11px] bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors font-bold shadow-xs cursor-pointer"
                                    >
                                      Sim, confirmar
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                            {ehAdmin && (
                              <div className="relative inline-flex items-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setConfirmandoCancelamentoId(confirmandoCancelamentoId === item.id ? null : item.id);
                                    setConfirmandoAlteracaoId(null);
                                    setConfirmandoPresencaId(null);
                                    setConfirmandoReativacaoId(null);
                                  }}
                                  title="Cancelar atendimento (Administrador)"
                                  className="inline-flex h-8 w-8 items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all cursor-pointer"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                                {confirmandoCancelamentoId === item.id && (
                                  <div className="absolute right-0 top-full mt-1.5 flex flex-col gap-2 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/15 whitespace-nowrap z-[100] animate-fade-in text-left">
                                    <div className="absolute right-3 -top-1.5 w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45" aria-hidden="true" />
                                    <span className="text-[11.5px] font-bold text-slate-700">Deseja cancelar este atendimento?</span>
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setConfirmandoCancelamentoId(null)}
                                        className="px-2.5 py-1 text-[11px] text-slate-500 hover:bg-slate-100 rounded-lg transition-colors font-semibold cursor-pointer"
                                      >
                                        Voltar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleCancelarAtendimento(item.id)}
                                        className="px-2.5 py-1 text-[11px] bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors font-bold shadow-xs cursor-pointer"
                                      >
                                        Sim, cancelar
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* PASSO 2: CONFIRMADO */}
                        {item.status === 'CONFIRMADO' && (
                          <>
                            <button
                              type="button"
                              onClick={() => abrirModalProntuario(item, true)}
                              className="inline-flex h-8 items-center gap-1.5 px-3 text-[11px] font-extrabold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.24)] transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                            >
                              <Play className="w-3.5 h-3.5" />
                              Iniciar Atendimento
                            </button>
                            {ehAdmin && (
                              <div className="relative inline-flex items-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setConfirmandoCancelamentoId(confirmandoCancelamentoId === item.id ? null : item.id);
                                    setConfirmandoAlteracaoId(null);
                                    setConfirmandoPresencaId(null);
                                    setConfirmandoReativacaoId(null);
                                  }}
                                  title="Cancelar atendimento (Administrador)"
                                  className="inline-flex h-8 w-8 items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all cursor-pointer"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                                {confirmandoCancelamentoId === item.id && (
                                  <div className="absolute right-0 top-full mt-1.5 flex flex-col gap-2 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/15 whitespace-nowrap z-[100] animate-fade-in text-left">
                                    <div className="absolute right-3 -top-1.5 w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45" aria-hidden="true" />
                                    <span className="text-[11.5px] font-bold text-slate-700">Deseja cancelar este atendimento?</span>
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setConfirmandoCancelamentoId(null)}
                                        className="px-2.5 py-1 text-[11px] text-slate-500 hover:bg-slate-100 rounded-lg transition-colors font-semibold cursor-pointer"
                                      >
                                        Voltar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleCancelarAtendimento(item.id)}
                                        className="px-2.5 py-1 text-[11px] bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors font-bold shadow-xs cursor-pointer"
                                      >
                                        Sim, cancelar
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* PASSO 3: EM_ATENDIMENTO */}
                        {item.status === 'EM_ATENDIMENTO' && (
                          <>
                            <button
                              type="button"
                              onClick={() => abrirModalProntuario(item, false)}
                              className="inline-flex h-8 items-center gap-1.5 px-3 text-[11px] font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-xl shadow-[0_2px_8px_rgba(37,99,235,0.12)] transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                            >
                              <Play className="w-3.5 h-3.5 text-blue-600" />
                              Continuar
                            </button>
                            {ehAdmin && (
                              <div className="relative inline-flex items-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setConfirmandoCancelamentoId(confirmandoCancelamentoId === item.id ? null : item.id);
                                    setConfirmandoAlteracaoId(null);
                                    setConfirmandoPresencaId(null);
                                    setConfirmandoReativacaoId(null);
                                  }}
                                  title="Cancelar atendimento (Administrador)"
                                  className="inline-flex h-8 w-8 items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all cursor-pointer"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                                {confirmandoCancelamentoId === item.id && (
                                  <div className="absolute right-0 top-full mt-1.5 flex flex-col gap-2 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/15 whitespace-nowrap z-[100] animate-fade-in text-left">
                                    <div className="absolute right-3 -top-1.5 w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45" aria-hidden="true" />
                                    <span className="text-[11.5px] font-bold text-slate-700">Deseja cancelar este atendimento?</span>
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setConfirmandoCancelamentoId(null)}
                                        className="px-2.5 py-1 text-[11px] text-slate-500 hover:bg-slate-100 rounded-lg transition-colors font-semibold cursor-pointer"
                                      >
                                        Voltar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleCancelarAtendimento(item.id)}
                                        className="px-2.5 py-1 text-[11px] bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors font-bold shadow-xs cursor-pointer"
                                      >
                                        Sim, cancelar
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* PASSO 4: CONCLUIDO */}
                        {(!item.status || item.status === 'CONCLUIDO') && (
                          <div className="relative inline-flex items-center">
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmandoAlteracaoId(confirmandoAlteracaoId === item.id ? null : item.id);
                                setConfirmandoCancelamentoId(null);
                                setConfirmandoPresencaId(null);
                                setConfirmandoReativacaoId(null);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 text-[11px] text-slate-500 hover:text-blue-700 font-medium transition-colors cursor-pointer group/finalizado"
                              title="Clique para opções ou visualizar o prontuário"
                            >
                              <span>Finalizado</span>
                              <span className="text-slate-400 group-hover/finalizado:text-blue-600">▾</span>
                            </button>
                            {confirmandoAlteracaoId === item.id && (
                              <div className="absolute right-0 top-full mt-1.5 flex flex-col gap-1 p-2 rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/15 whitespace-nowrap z-[100] animate-fade-in min-w-[190px] text-left">
                                <div className="absolute right-4 -top-1.5 w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45" aria-hidden="true" />
                                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                  Opções do atendimento
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setConfirmandoAlteracaoId(null);
                                    abrirModalProntuario(item, false, true);
                                  }}
                                  className="flex items-center gap-2 px-2.5 py-1.5 text-left text-xs font-semibold text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                                  Visualizar prontuário
                                </button>
                                {ehAdmin && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setConfirmandoAlteracaoId(null);
                                        abrirModalProntuario(item, false, false);
                                      }}
                                      className="flex items-center gap-2 px-2.5 py-1.5 text-left text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                                      Alterar atendimento
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setConfirmandoCancelamentoId(item.id);
                                        setConfirmandoAlteracaoId(null);
                                      }}
                                      className="flex items-center gap-2 px-2.5 py-1.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                    >
                                      <Ban className="w-3.5 h-3.5 text-rose-600" />
                                      Cancelar atendimento
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                            {confirmandoCancelamentoId === item.id && (
                              <div className="absolute right-0 top-full mt-1.5 flex flex-col gap-2 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/15 whitespace-nowrap z-[100] animate-fade-in text-left">
                                <div className="absolute right-4 -top-1.5 w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45" aria-hidden="true" />
                                <span className="text-[11.5px] font-bold text-slate-700">Deseja cancelar este atendimento finalizado?</span>
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setConfirmandoCancelamentoId(null)}
                                    className="px-2.5 py-1 text-[11px] text-slate-500 hover:bg-slate-100 rounded-lg transition-colors font-semibold cursor-pointer"
                                  >
                                    Voltar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCancelarAtendimento(item.id)}
                                    className="px-2.5 py-1 text-[11px] bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors font-bold shadow-xs cursor-pointer"
                                  >
                                    Sim, cancelar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* PASSO 5: CANCELADO */}
                        {item.status === 'CANCELADO' && (
                          <div className="relative inline-flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-rose-500 italic">Cancelado</span>
                            {ehAdmin && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setConfirmandoReativacaoId(confirmandoReativacaoId === item.id ? null : item.id);
                                    setConfirmandoCancelamentoId(null);
                                    setConfirmandoAlteracaoId(null);
                                    setConfirmandoPresencaId(null);
                                  }}
                                  className="text-[10.5px] font-bold text-slate-500 hover:text-blue-600 hover:underline cursor-pointer"
                                  title="Reabrir / colocar de volta na fila"
                                >
                                  Reativar
                                </button>
                                {confirmandoReativacaoId === item.id && (
                                  <div className="absolute right-0 top-full mt-1.5 flex flex-col gap-2 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/15 whitespace-nowrap z-[100] animate-fade-in text-left">
                                    <div className="absolute right-4 -top-1.5 w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45" aria-hidden="true" />
                                    <span className="text-[11.5px] font-bold text-slate-700">Deseja reativar este atendimento?</span>
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setConfirmandoReativacaoId(null)}
                                        className="px-2.5 py-1 text-[11px] text-slate-500 hover:bg-slate-100 rounded-lg transition-colors font-semibold cursor-pointer"
                                      >
                                        Voltar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          setConfirmandoReativacaoId(null);
                                          await handleAlterarStatus(item.id, StatusAtendimento.CONFIRMADO);
                                        }}
                                        className="px-2.5 py-1 text-[11px] bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-bold shadow-xs cursor-pointer"
                                      >
                                        Sim, reativar
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="py-2 px-4 border-t border-slate-200/90 bg-slate-50/40">
          <Paginacao
            paginaAtual={paginaExibida}
            totalPaginas={totalPaginas}
            totalRegistros={totalRegistros}
            itensPorPagina={itensPorPagina}
            aoMudarPagina={handleMudarPagina}
          />
        </div>
      </div>

      <ModalIniciarAtendimento
        aberto={modalAtendimentoAberto}
        dados={dadosAtendimentoAtivo}
        somenteLeitura={modalModoVisualizacao}
        aoFechar={() => {
          setModalAtendimentoAberto(false);
          setDadosAtendimentoAtivo(null);
          setModalModoVisualizacao(false);
        }}
        aoConfirmar={handleSalvarAtendimentoProntuario}
      />
    </div>
  );
};

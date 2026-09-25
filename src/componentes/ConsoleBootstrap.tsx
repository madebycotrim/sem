import { useEffect, useState, useMemo, type FC } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  Trash2,
  X,
  CheckCircle2,
  Info,
  Database,
  Building2,
  Users,
  Stethoscope,
  ClipboardList,
  Search,
  Sparkles,
  Check,
  History,
  FileSpreadsheet,
} from 'lucide-react';
import { requisicaoApi } from '../servicos/api.ts';
import { formatarHoraBrasilia } from '../../compartilhado/index.ts';

type TipoEntidade = 'pacientes' | 'usuarios' | 'consultas' | 'instituicoes';

interface RegistroExclusao {
  id: string;
  rotulo: string;
  detalhe?: string;
  subinfo?: string;
}

interface LogOperacao {
  id: string;
  tipo: 'sucesso' | 'erro';
  mensagem: string;
  timestamp: string;
}

interface ConsoleBootstrapProps {
  aberto: boolean;
  aoFechar: () => void;
  aoConcluir: () => void;
  aoImportarPlanilha?: () => void;
}

interface MetricasBanco {
  pacientes: number;
  usuarios: number;
  consultas: number;
  instituicoes: number;
}

const CONFIG_ENTIDADE: Record<
  TipoEntidade,
  {
    rotulo: string;
    singular: string;
    icone: FC<{ className?: string }>;
    corBadge: string;
    impacto: string;
    placeholderBusca: string;
  }
> = {
  pacientes: {
    rotulo: 'Pacientes',
    singular: 'Paciente',
    icone: Users,
    corBadge: 'bg-blue-50 text-blue-700 border-blue-200/80',
    impacto: 'Remove o paciente, seus termos de consentimento e todo o histórico clínico/consultas.',
    placeholderBusca: 'Buscar por nome, CPF ou turma do aluno...',
  },
  consultas: {
    rotulo: 'Consultas',
    singular: 'Consulta',
    icone: Stethoscope,
    corBadge: 'bg-purple-50 text-purple-700 border-purple-200/80',
    impacto: 'Remove permanentemente o atendimento clínico selecionado.',
    placeholderBusca: 'Buscar por paciente, especialidade ou polo...',
  },
  usuarios: {
    rotulo: 'Usuários',
    singular: 'Usuário',
    icone: ShieldAlert,
    corBadge: 'bg-amber-50 text-amber-800 border-amber-200/80',
    impacto: 'Remove o usuário do sistema e os atendimentos gerados pela conta.',
    placeholderBusca: 'Buscar por nome, e-mail ou perfil...',
  },
  instituicoes: {
    rotulo: 'Instituições',
    singular: 'Instituição',
    icone: Building2,
    corBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    impacto: 'Remove a instituição, todos os pacientes da escola e seus atendimentos vinculados.',
    placeholderBusca: 'Buscar por nome da escola ou cidade...',
  },
};

export const ConsoleBootstrap: FC<ConsoleBootstrapProps> = ({ aberto, aoFechar, aoConcluir, aoImportarPlanilha }) => {
  const [tipo, setTipo] = useState<TipoEntidade>('pacientes');
  const [modoExcluirTodosPacientes, setModoExcluirTodosPacientes] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'acoes' | 'logs'>('acoes');

  const [metricas, setMetricas] = useState<MetricasBanco>({
    pacientes: 0,
    usuarios: 0,
    consultas: 0,
    instituicoes: 0,
  });
  const [carregandoMetricas, setCarregandoMetricas] = useState(false);

  const [registros, setRegistros] = useState<RegistroExclusao[]>([]);
  const [idSelecionado, setIdSelecionado] = useState('');
  const [buscaRegistro, setBuscaRegistro] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [cienciaConfirmada, setCienciaConfirmada] = useState(false);

  const [carregando, setCarregando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [log, setLog] = useState<LogOperacao[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const config = CONFIG_ENTIDADE[tipo];

  const adicionarLog = (tipoLog: 'sucesso' | 'erro', mensagem: string) => {
    setLog((prev) => [
      { id: crypto.randomUUID(), tipo: tipoLog, mensagem, timestamp: formatarHoraBrasilia(new Date()) },
      ...prev.slice(0, 14),
    ]);
  };

  // Carrega métricas rápidas de contagem de todas as entidades
  const carregarMetricasGerais = async () => {
    setCarregandoMetricas(true);
    try {
      const [resPacientes, resConsultas, resUsuarios, resEscolas] = await Promise.allSettled([
        requisicaoApi<{ total?: number; dados?: unknown[] }>('/pacientes?pagina=1&porPagina=1'),
        requisicaoApi<{ total?: number; dados?: unknown[] }>('/atendimentos?pagina=1&porPagina=1'),
        requisicaoApi<{ dados?: unknown[] }>('/usuarios'),
        requisicaoApi<{ dados?: unknown[] }>('/escolas'),
      ]);

      setMetricas({
        pacientes: resPacientes.status === 'fulfilled' ? (resPacientes.value.total ?? resPacientes.value.dados?.length ?? 0) : 0,
        consultas: resConsultas.status === 'fulfilled' ? (resConsultas.value.total ?? resConsultas.value.dados?.length ?? 0) : 0,
        usuarios: resUsuarios.status === 'fulfilled' ? (resUsuarios.value.dados?.length ?? 0) : 0,
        instituicoes: resEscolas.status === 'fulfilled' ? (resEscolas.value.dados?.length ?? 0) : 0,
      });
    } catch {
      // Falhas silenciosas em métricas não bloqueiam a UI
    } finally {
      setCarregandoMetricas(false);
    }
  };

  const carregarRegistros = async (tipoAtual: TipoEntidade) => {
    setCarregando(true);
    setErro(null);
    setIdSelecionado('');
    setBuscaRegistro('');
    setConfirmacao('');
    setCienciaConfirmada(false);

    try {
      if (tipoAtual === 'usuarios') {
        const resposta = await requisicaoApi<{
          dados: Array<{ id: string; nome?: string; nomeCompleto?: string; email: string; perfil: string }>;
        }>('/usuarios');
        const lista = (resposta.dados || []).map((item) => ({
          id: item.id,
          rotulo: item.nomeCompleto || item.nome || 'Usuário sem nome',
          detalhe: item.email,
          subinfo: `Perfil: ${item.perfil}`,
        }));
        setRegistros(lista);
        setMetricas((m) => ({ ...m, usuarios: lista.length }));
      } else if (tipoAtual === 'instituicoes') {
        const resposta = await requisicaoApi<{
          dados: Array<{ id: string; nome: string; cidade?: string; uf?: string; codigoInep?: string }>;
        }>('/escolas');
        const lista = (resposta.dados || []).map((item) => ({
          id: item.id,
          rotulo: item.nome,
          detalhe: [item.cidade, item.uf].filter(Boolean).join(' - ') || 'Localização não informada',
          subinfo: item.codigoInep ? `INEP: ${item.codigoInep}` : undefined,
        }));
        setRegistros(lista);
        setMetricas((m) => ({ ...m, instituicoes: lista.length }));
      } else if (tipoAtual === 'pacientes') {
        const primeira = await requisicaoApi<{
          dados: Array<{ id: string; nome: string; cpf?: string; turma?: string; escolaLocal?: string }>;
          totalPaginas: number;
          total?: number;
        }>('/pacientes?pagina=1&porPagina=100');

        const lista = (primeira.dados || []).map((item) => ({
          id: item.id,
          rotulo: item.nome,
          detalhe: item.cpf ? `CPF: ${item.cpf}` : 'Sem CPF informado',
          subinfo: [item.turma ? `Turma: ${item.turma}` : null, item.escolaLocal].filter(Boolean).join(' · '),
        }));

        setRegistros(lista);
        setMetricas((m) => ({ ...m, pacientes: primeira.total ?? lista.length }));
      } else {
        const primeira = await requisicaoApi<{
          dados: Array<{
            id: string;
            pacienteNome: string;
            especialidade: string;
            criadoEm: string;
            escolaLocal?: string;
            status?: string;
          }>;
          totalPaginas: number;
          total?: number;
        }>('/atendimentos?pagina=1&porPagina=100');

        const lista = (primeira.dados || []).map((item) => ({
          id: item.id,
          rotulo: `${item.pacienteNome} · ${item.especialidade}`,
          detalhe: `${formatarHoraBrasilia(new Date(item.criadoEm))} · ${new Date(item.criadoEm).toLocaleDateString('pt-BR')}`,
          subinfo: [item.status, item.escolaLocal].filter(Boolean).join(' · '),
        }));

        setRegistros(lista);
        setMetricas((m) => ({ ...m, consultas: primeira.total ?? lista.length }));
      }
    } catch (ex) {
      const msg = ex instanceof Error ? ex.message : 'Não foi possível carregar os registros.';
      setErro(msg);
      adicionarLog('erro', `Falha ao carregar ${config.rotulo}: ${msg}`);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (aberto) {
      setConfirmacao('');
      setCienciaConfirmada(false);
      setBuscaRegistro('');
      setErro(null);
      setAbaAtiva('acoes');
      void carregarMetricasGerais();
      void carregarRegistros(tipo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, tipo]);

  useEffect(() => {
    if (!aberto) return;
    const fecharEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !excluindo) aoFechar();
    };
    window.addEventListener('keydown', fecharEsc);
    return () => window.removeEventListener('keydown', fecharEsc);
  }, [aberto, excluindo, aoFechar]);

  const registroSelecionado = registros.find((r) => r.id === idSelecionado);

  const registrosFiltrados = useMemo(() => {
    if (!buscaRegistro.trim()) return registros;
    const termo = buscaRegistro.toLowerCase().trim();
    return registros.filter((r) =>
      `${r.rotulo} ${r.detalhe ?? ''} ${r.subinfo ?? ''}`.toLowerCase().includes(termo)
    );
  }, [registros, buscaRegistro]);

  const fraseEsperada = modoExcluirTodosPacientes
    ? 'EXCLUIR TODOS OS PACIENTES'
    : 'EXCLUIR DEFINITIVAMENTE';

  const fraseCorreta =
    confirmacao === fraseEsperada ||
    (modoExcluirTodosPacientes && confirmacao === 'EXCLUIR DEFINITIVAMENTE');

  const podeExecutarExclusao =
    !excluindo &&
    fraseCorreta &&
    (modoExcluirTodosPacientes ? registros.length > 0 : Boolean(idSelecionado));

  const preencherFraseAutomaticamente = () => {
    setConfirmacao(fraseEsperada);
    setCienciaConfirmada(true);
  };

  const executarExclusaoIndividual = async () => {
    if (!idSelecionado || !fraseCorreta) return;

    const rotas: Record<TipoEntidade, string> = {
      pacientes: 'pacientes',
      usuarios: 'usuarios',
      consultas: 'consultas',
      instituicoes: 'instituicoes',
    };

    const nomeAlvo = registroSelecionado?.rotulo ?? idSelecionado;
    setExcluindo(true);
    setErro(null);

    try {
      const queryConfirmacao = encodeURIComponent('EXCLUIR DEFINITIVAMENTE');
      await requisicaoApi(
        `/bootstrap/${rotas[tipo]}/${idSelecionado}?confirmacao=${queryConfirmacao}`,
        { metodo: 'DELETE' }
      );

      adicionarLog('sucesso', `${config.singular} "${nomeAlvo}" excluído definitivamente do sistema.`);
      setConfirmacao('');
      setCienciaConfirmada(false);
      setIdSelecionado('');
      await carregarRegistros(tipo);
      void carregarMetricasGerais();
      aoConcluir();
    } catch (ex) {
      const msg = ex instanceof Error ? ex.message : 'Não foi possível concluir a exclusão.';
      setErro(msg);
      adicionarLog('erro', `Falha ao excluir "${nomeAlvo}": ${msg}`);
    } finally {
      setExcluindo(false);
    }
  };

  const executarExclusaoTodosPacientes = async () => {
    if (!fraseCorreta) return;

    setExcluindo(true);
    setErro(null);

    try {
      const queryConfirmacao = encodeURIComponent(confirmacao);
      const res = await requisicaoApi<{
        mensagem: string;
        totalExcluidos?: { pacientes: number; atendimentos: number; consentimentos: number };
      }>(`/bootstrap/pacientes-todos?confirmacao=${queryConfirmacao}`, {
        metodo: 'DELETE',
      });

      const totalP = res?.totalExcluidos?.pacientes ?? registros.length;
      adicionarLog(
        'sucesso',
        res?.mensagem || `Todos os ${totalP} pacientes e históricos vinculados foram excluídos com sucesso.`
      );
      setConfirmacao('');
      setCienciaConfirmada(false);
      setModoExcluirTodosPacientes(false);
      await carregarRegistros('pacientes');
      void carregarMetricasGerais();
      aoConcluir();
    } catch (ex) {
      const msg = ex instanceof Error ? ex.message : 'Não foi possível concluir a exclusão de todos os pacientes.';
      setErro(msg);
      adicionarLog('erro', `Falha ao excluir todos os pacientes: ${msg}`);
    } finally {
      setExcluindo(false);
    }
  };

  if (!aberto) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/50 backdrop-blur-[2px] p-3 sm:p-4 font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="console-bootstrap-titulo"
    >
      <div className="flex w-full max-w-4xl max-h-[92vh] flex-col overflow-hidden rounded-[24px] sm:rounded-[28px] border border-slate-200/90 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] transition-all">
        {/* Topo / Cabeçalho Executivo */}
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-4.5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-red-200/80 bg-gradient-to-br from-red-50 to-rose-100 text-red-600 shadow-2xs">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 id="console-bootstrap-titulo" className="text-[1.12rem] font-black text-slate-900 tracking-[-0.02em] leading-tight">
                Console de Administração
              </h2>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Gestão avançada, expurgo seguro de registros e integridade dos dados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {aoImportarPlanilha && (
              <button
                type="button"
                onClick={aoImportarPlanilha}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-xs transition-all cursor-pointer"
                title="Importar consultas via planilha Excel ou CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Importar Planilha</span>
              </button>
            )}

            {/* Alternador de visualização Ações / Logs */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/70 shadow-2xs">
              <button
                type="button"
                onClick={() => setAbaAtiva('acoes')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  abaAtiva === 'acoes'
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-950/5'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span>Painel</span>
              </button>
              <button
                type="button"
                onClick={() => setAbaAtiva('logs')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  abaAtiva === 'logs'
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-950/5'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Logs</span>
                <span className="ml-0.5 px-1.5 py-0.2 rounded-md bg-slate-200/80 text-[10px] font-bold text-slate-700 font-mono">
                  {log.length}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={aoFechar}
              disabled={excluindo}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50 cursor-pointer ml-0.5"
              aria-label="Fechar console"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Visão Geral: Stat Cards de Entidades */}
        <div className="border-b border-slate-200/70 bg-slate-50/60 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Registros no Banco de Dados
            </span>
            <button
              type="button"
              onClick={() => {
                void carregarMetricasGerais();
                void carregarRegistros(tipo);
              }}
              disabled={carregando || carregandoMetricas || excluindo}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 text-slate-400 ${carregando || carregandoMetricas ? 'animate-spin' : ''}`} />
              Atualizar contagens
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(CONFIG_ENTIDADE) as TipoEntidade[]).map((opcao) => {
              const cfg = CONFIG_ENTIDADE[opcao];
              const Icone = cfg.icone;
              const ativo = tipo === opcao;
              const contagem = metricas[opcao];

              return (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => {
                    setTipo(opcao);
                    setModoExcluirTodosPacientes(false);
                    setIdSelecionado('');
                    setBuscaRegistro('');
                    setConfirmacao('');
                    setCienciaConfirmada(false);
                  }}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                    ativo
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50/90 to-indigo-50/40 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/80 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                        ativo
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-100 text-slate-600 border-slate-200/70'
                      }`}
                    >
                      <Icone className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <span className={`block text-[11px] font-bold truncate ${ativo ? 'text-blue-950 font-extrabold' : 'text-slate-600'}`}>
                        {cfg.rotulo}
                      </span>
                      <span className="block text-base font-black text-slate-900 tracking-tight mt-0.5">
                        {carregandoMetricas ? '...' : contagem.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  {ativo && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 ml-1.5 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conteúdo Principal com Rolagem */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {abaAtiva === 'logs' ? (
            /* Painel de Auditoria e Logs */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Trilha de Auditoria da Sessão</h3>
                  <p className="text-xs text-slate-500">Histórico de ações executadas nesta sessão do Console.</p>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {log.length} evento(s)
                </span>
              </div>

              {log.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
                  <ClipboardList className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-600">Nenhuma exclusão realizada nesta sessão.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Todas as ações permanentes realizadas aqui serão listadas com data e hora.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/90 overflow-hidden bg-white">
                  {log.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3.5 hover:bg-slate-50/80 transition-colors">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          item.tipo === 'sucesso'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-red-50 text-red-600 border border-red-200'
                        }`}
                      >
                        {item.tipo === 'sucesso' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider ${
                              item.tipo === 'sucesso' ? 'text-emerald-700' : 'text-red-700'
                            }`}
                          >
                            {item.tipo === 'sucesso' ? 'Exclusão Auditada' : 'Falha Operacional'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">{item.timestamp}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-800 mt-0.5 leading-relaxed">{item.mensagem}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Painel de Ações do Console */
            <>
              {/* Seletor de Modo quando na categoria Pacientes */}
              {tipo === 'pacientes' && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Users className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Modo de Operação para Pacientes</h4>
                      <p className="text-[11px] text-slate-500">
                        Escolha entre localizar um aluno específico ou realizar um expurgo total de limpeza.
                      </p>
                    </div>
                  </div>

                  <div className="flex rounded-xl bg-white p-1 border border-slate-200/80 shadow-2xs shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setModoExcluirTodosPacientes(false);
                        setConfirmacao('');
                        setCienciaConfirmada(false);
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        !modoExcluirTodosPacientes
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Exclusão Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModoExcluirTodosPacientes(true);
                        setIdSelecionado('');
                        setBuscaRegistro('');
                        setConfirmacao('');
                        setCienciaConfirmada(false);
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        modoExcluirTodosPacientes
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-red-700 hover:bg-red-50'
                      }`}
                    >
                      Excluir Todos os Alunos
                    </button>
                  </div>
                </div>
              )}

              {/* Informação Técnica de Impacto */}
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block mb-0.5">
                    Impacto Relacional no Banco de Dados
                  </span>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    {modoExcluirTodosPacientes
                      ? `Esta ação removerá TODOS os ${registros.length} pacientes, todos os seus termos de consentimento e todas as consultas vinculadas, limpando a base para novos ciclos.`
                      : config.impacto}
                  </p>
                </div>
              </div>

              {/* Modo: Exclusão em Massa de Todos os Pacientes */}
              {modoExcluirTodosPacientes ? (
                <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-red-950">
                        Expurgo Total de {registros.length} Pacientes
                      </h4>
                      <p className="text-xs text-red-800 mt-0.5">
                        Todos os alunos, registros clínicos, triagens e termos serão removidos definitivamente.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Modo: Seleção de Registro Individual */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span>Selecionar {config.singular} para Exclusão</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        ({registrosFiltrados.length} de {registros.length})
                      </span>
                    </label>

                    {idSelecionado && (
                      <button
                        type="button"
                        onClick={() => {
                          setIdSelecionado('');
                          setConfirmacao('');
                          setCienciaConfirmada(false);
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                      >
                        Trocar Seleção
                      </button>
                    )}
                  </div>

                  {/* Card do Registro Selecionado em Destaque */}
                  {registroSelecionado ? (
                    <div className="rounded-2xl border-2 border-red-400 bg-red-50/50 p-4 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {registroSelecionado.rotulo.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-black uppercase tracking-wider text-red-700 block">
                            Alvo Marcado para Exclusão
                          </span>
                          <span className="text-sm font-extrabold text-slate-900 block truncate">
                            {registroSelecionado.rotulo}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium mt-0.5">
                            <span>{registroSelecionado.detalhe}</span>
                            {registroSelecionado.subinfo && (
                              <>
                                <span>•</span>
                                <span className="truncate">{registroSelecionado.subinfo}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIdSelecionado('');
                          setConfirmacao('');
                          setCienciaConfirmada(false);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-red-200 bg-white text-xs font-bold text-red-700 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      >
                        Desmarcar
                      </button>
                    </div>
                  ) : (
                    /* Campo de Busca + Lista de Registros */
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={buscaRegistro}
                          onChange={(e) => setBuscaRegistro(e.target.value)}
                          disabled={carregando || excluindo}
                          placeholder={carregando ? 'Carregando registros...' : config.placeholderBusca}
                          className="h-10.5 w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 pl-10 pr-10 text-xs font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-100 disabled:opacity-50"
                        />
                        {buscaRegistro && (
                          <button
                            type="button"
                            onClick={() => setBuscaRegistro('')}
                            className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Lista de Registros */}
                      <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200/90 divide-y divide-slate-100 bg-white shadow-2xs">
                        {carregando ? (
                          <div className="p-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                            Consultando banco de dados...
                          </div>
                        ) : registrosFiltrados.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-500">
                            Nenhum registro encontrado para o filtro informado.
                          </div>
                        ) : (
                          registrosFiltrados.slice(0, 50).map((item) => (
                            <div
                              key={item.id}
                              onClick={() => {
                                setIdSelecionado(item.id);
                                setConfirmacao('');
                                setCienciaConfirmada(false);
                              }}
                              className="flex items-center justify-between p-3 hover:bg-blue-50/50 transition-colors cursor-pointer group"
                            >
                              <div className="min-w-0 flex-1 pr-3">
                                <span className="block text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">
                                  {item.rotulo}
                                </span>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                  <span>{item.detalhe}</span>
                                  {item.subinfo && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate text-slate-400">{item.subinfo}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <button
                                type="button"
                                className="px-3 py-1 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0 cursor-pointer"
                              >
                                Selecionar
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Área de Confirmação Segura e Intuitiva */}
              {(idSelecionado || modoExcluirTodosPacientes) && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4.5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-extrabold text-slate-900 block">
                        Confirmação de Segurança Operacional
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Para liberar a exclusão, confirme a frase obrigatória abaixo:
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={preencherFraseAutomaticamente}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all shadow-2xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Preencher frase em 1 clique
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={confirmacao}
                        onChange={(e) => setConfirmacao(e.target.value)}
                        disabled={excluindo}
                        placeholder={fraseEsperada}
                        className={`h-11 w-full rounded-xl border px-3.5 font-mono text-xs font-bold tracking-wider outline-none transition-all ${
                          fraseCorreta
                            ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800 ring-2 ring-emerald-100'
                            : 'border-slate-200 bg-white text-slate-800 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                        }`}
                      />
                      {fraseCorreta && (
                        <div className="absolute right-3.5 top-3 flex items-center gap-1 text-emerald-700 font-bold text-xs">
                          <Check className="w-4 h-4" />
                          <span>Validado</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-mono">
                        Frase esperada: <strong className="text-red-700">{fraseEsperada}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Checkbox de Ciência */}
                  <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={cienciaConfirmada}
                      onChange={(e) => setCienciaConfirmada(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 leading-snug">
                      Estou ciente de que esta exclusão é definitiva, não poderá ser desfeita e ficará registrada na trilha de auditoria com IP e usuário.
                    </span>
                  </label>
                </div>
              )}

              {/* Alerta de Erro se houver */}
              {erro && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-2.5 text-xs text-red-800">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{erro}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Rodapé Padronizado e Ações */}
        <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/80 px-6 py-4">
          <p className="text-[11px] text-slate-400 font-medium">
            Console restrito ao perfil de sistema BOOTSTRAP.
          </p>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={aoFechar}
              disabled={excluindo}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>

            {abaAtiva === 'acoes' && (
              <button
                type="button"
                onClick={modoExcluirTodosPacientes ? executarExclusaoTodosPacientes : executarExclusaoIndividual}
                disabled={!podeExecutarExclusao || (!cienciaConfirmada && (Boolean(idSelecionado) || modoExcluirTodosPacientes))}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 active:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                {excluindo ? (
                  <span>Processando exclusão...</span>
                ) : modoExcluirTodosPacientes ? (
                  <span>Excluir Todos os {registros.length} Pacientes</span>
                ) : idSelecionado ? (
                  <span>Excluir {config.singular} Definitivamente</span>
                ) : (
                  <span>Selecione um registro</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

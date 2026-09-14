import { useEffect, useState, type FC } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  Trash2,
  X,
  CheckCircle,
  Info,
  Database,
  Building2,
  Users,
  Stethoscope,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';
import { requisicaoApi } from '../servicos/api.ts';

type TipoEntidade = 'pacientes' | 'usuarios' | 'consultas' | 'instituicoes';

interface RegistroExclusao {
  id: string;
  rotulo: string;
  detalhe?: string;
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
}

const CONFIG_ENTIDADE: Record<
  TipoEntidade,
  { rotulo: string; icone: FC<{ className?: string }>; cor: string; impacto: string }
> = {
  pacientes: {
    rotulo: 'Pacientes',
    icone: Users,
    cor: 'rose',
    impacto: 'Remove o paciente, todos os consentimentos e todo o histórico clínico.',
  },
  usuarios: {
    rotulo: 'Usuários',
    icone: ShieldAlert,
    cor: 'orange',
    impacto: 'Remove o usuário e os atendimentos criados por ele.',
  },
  consultas: {
    rotulo: 'Consultas',
    icone: Stethoscope,
    cor: 'purple',
    impacto: 'Remove somente o atendimento selecionado.',
  },
  instituicoes: {
    rotulo: 'Instituições',
    icone: Building2,
    cor: 'blue',
    impacto: 'Remove a instituição, todos os pacientes e todos os atendimentos vinculados.',
  },
};

export const ConsoleBootstrap: FC<ConsoleBootstrapProps> = ({ aberto, aoFechar, aoConcluir }) => {
  const [tipo, setTipo] = useState<TipoEntidade>('pacientes');
  const [registros, setRegistros] = useState<RegistroExclusao[]>([]);
  const [idSelecionado, setIdSelecionado] = useState('');
  const [buscaRegistro, setBuscaRegistro] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [log, setLog] = useState<LogOperacao[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const adicionarLog = (tipo: 'sucesso' | 'erro', mensagem: string) => {
    setLog((prev) => [
      { id: crypto.randomUUID(), tipo, mensagem, timestamp: new Date().toLocaleTimeString('pt-BR') },
      ...prev.slice(0, 9), // mantém apenas os 10 últimos
    ]);
  };

  const carregarRegistros = async (tipoAtual: TipoEntidade) => {
    setCarregando(true);
    setErro(null);
    setIdSelecionado('');
    setBuscaRegistro('');
    try {
      if (tipoAtual === 'usuarios') {
        const resposta = await requisicaoApi<{
          dados: Array<{ id: string; nome?: string; nomeCompleto?: string; email: string; perfil: string }>;
        }>('/usuarios');
        setRegistros(
          (resposta.dados || []).map((item) => ({
            id: item.id,
            rotulo: item.nomeCompleto || item.nome || 'Usuário sem nome',
            detalhe: `${item.email} · ${item.perfil}`,
          }))
        );
      } else if (tipoAtual === 'instituicoes') {
        const resposta = await requisicaoApi<{
          dados: Array<{ id: string; nome: string; cidade?: string; uf?: string }>;
        }>('/escolas');
        setRegistros(
          (resposta.dados || []).map((item) => ({
            id: item.id,
            rotulo: item.nome,
            detalhe: [item.cidade, item.uf].filter(Boolean).join(' - ') || 'Sem localização',
          }))
        );
      } else if (tipoAtual === 'pacientes') {
        const primeira = await requisicaoApi<{
          dados: Array<{ id: string; nome: string; cpf?: string; turma?: string }>;
          totalPaginas: number;
        }>('/pacientes?pagina=1&porPagina=100');
        const restantes = await Promise.all(
          Array.from({ length: Math.max(0, primeira.totalPaginas - 1) }, (_, i) =>
            requisicaoApi<{ dados: Array<{ id: string; nome: string; cpf?: string; turma?: string }> }>(
              `/pacientes?pagina=${i + 2}&porPagina=100`
            )
          )
        );
        setRegistros(
          [primeira, ...restantes]
            .flatMap((r) => r.dados || [])
            .map((item) => ({
              id: item.id,
              rotulo: item.nome,
              detalhe: [item.cpf || 'CPF não informado', item.turma ? `Turma: ${item.turma}` : null]
                .filter(Boolean)
                .join(' · '),
            }))
        );
      } else {
        const primeira = await requisicaoApi<{
          dados: Array<{ id: string; pacienteNome: string; especialidade: string; criadoEm: string; escolaLocal?: string }>;
          totalPaginas: number;
        }>('/atendimentos?pagina=1&porPagina=100');
        const restantes = await Promise.all(
          Array.from({ length: Math.max(0, primeira.totalPaginas - 1) }, (_, i) =>
            requisicaoApi<{
              dados: Array<{ id: string; pacienteNome: string; especialidade: string; criadoEm: string; escolaLocal?: string }>;
            }>(`/atendimentos?pagina=${i + 2}&porPagina=100`)
          )
        );
        setRegistros(
          [primeira, ...restantes].flatMap((r) => r.dados || []).map((item) => ({
            id: item.id,
            rotulo: `${item.pacienteNome} · ${item.especialidade}`,
            detalhe: `${new Date(item.criadoEm).toLocaleString('pt-BR')}${item.escolaLocal ? ` · ${item.escolaLocal}` : ''}`,
          }))
        );
      }
    } catch (ex) {
      const msg = ex instanceof Error ? ex.message : 'Não foi possível carregar os registros.';
      setErro(msg);
      adicionarLog('erro', `Falha ao carregar ${CONFIG_ENTIDADE[tipoAtual].rotulo}: ${msg}`);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (aberto) {
      setConfirmacao('');
      setBuscaRegistro('');
      setErro(null);
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

  const excluir = async () => {
    if (!idSelecionado || confirmacao !== 'EXCLUIR DEFINITIVAMENTE') return;

    const rotas: Record<TipoEntidade, string> = {
      pacientes: 'pacientes',
      usuarios: 'usuarios',
      consultas: 'consultas',
      instituicoes: 'instituicoes',
    };

    const registroAlvo = registros.find((r) => r.id === idSelecionado);
    const nomeAlvo = registroAlvo?.rotulo ?? idSelecionado;

    setExcluindo(true);
    setErro(null);

    try {
      // A confirmação vai via query param para evitar problemas com body em DELETE
      // em proxies e CDNs que podem ignorar/truncar o body de requisições DELETE.
      const queryConfirmacao = encodeURIComponent('EXCLUIR DEFINITIVAMENTE');
      await requisicaoApi(
        `/bootstrap/${rotas[tipo]}/${idSelecionado}?confirmacao=${queryConfirmacao}`,
        { metodo: 'DELETE' }
      );

      adicionarLog('sucesso', `${CONFIG_ENTIDADE[tipo].rotulo.slice(0, -1)}: "${nomeAlvo}" excluído definitivamente.`);
      setConfirmacao('');
      setIdSelecionado('');
      await carregarRegistros(tipo);
      aoConcluir();
    } catch (ex) {
      const msg = ex instanceof Error ? ex.message : 'Não foi possível concluir a exclusão.';
      setErro(msg);
      adicionarLog('erro', `Falha ao excluir "${nomeAlvo}": ${msg}`);
    } finally {
      setExcluindo(false);
    }
  };

  const registroSelecionado = registros.find((r) => r.id === idSelecionado);
  const registrosFiltrados = registros.filter((r) =>
    `${r.rotulo} ${r.detalhe ?? ''}`.toLowerCase().includes(buscaRegistro.toLowerCase())
  );
  const config = CONFIG_ENTIDADE[tipo];

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="console-bootstrap-titulo"
    >
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-rose-100 bg-gradient-to-r from-rose-50 to-orange-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 shadow-sm">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 id="console-bootstrap-titulo" className="text-sm font-extrabold text-slate-900">
                Console de Administração Bootstrap
              </h2>
              <p className="text-[11px] font-medium text-rose-700">
                Exclusão irreversível · Perfil exclusivo BOOTSTRAP · Todas as ações são auditadas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            disabled={excluindo}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-50"
            aria-label="Fechar console"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex divide-x divide-slate-100">
          {/* Coluna esquerda: form */}
          <div className="flex w-full flex-col gap-4 p-5">
            {/* Seletor de entidade */}
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo de Dado</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(Object.keys(CONFIG_ENTIDADE) as TipoEntidade[]).map((opcao) => {
                  const cfg = CONFIG_ENTIDADE[opcao];
                  const OpcaoIcone = cfg.icone;
                  const ativo = tipo === opcao;
                  return (
                    <button
                      key={opcao}
                      type="button"
                      onClick={() => setTipo(opcao)}
                      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[11px] font-bold transition-all ${
                        ativo
                          ? 'border-rose-300 bg-rose-50 text-rose-700 shadow-sm'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <OpcaoIcone className="h-4 w-4" />
                      {cfg.rotulo}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Info de impacto */}
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] text-amber-900">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span><strong>Impacto:</strong> {config.impacto}</span>
            </div>

            {/* Contador e refresh */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-slate-400" />
                {carregando ? 'Consultando banco...' : `${registros.length} ${config.rotulo.toLowerCase()} disponíveis`}
              </span>
              <button
                type="button"
                onClick={() => void carregarRegistros(tipo)}
                disabled={carregando || excluindo}
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 disabled:opacity-40"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${carregando ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>

            {/* Busca e seleção de registro */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                Selecionar Registro
              </label>
              <input
                value={registroSelecionado
                  ? `${registroSelecionado.rotulo}${registroSelecionado.detalhe ? ` · ${registroSelecionado.detalhe}` : ''}`
                  : buscaRegistro}
                onChange={(e) => {
                  setBuscaRegistro(e.target.value);
                  setIdSelecionado('');
                }}
                disabled={carregando || excluindo}
                placeholder={carregando ? 'Carregando registros...' : 'Buscar por nome, e-mail ou identificador...'}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none focus:border-rose-400 focus:bg-white disabled:opacity-60"
              />

              {!idSelecionado && !carregando && buscaRegistro.length > 0 && (
                <div className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                  {registrosFiltrados.length > 0 ? (
                    registrosFiltrados.slice(0, 20).map((registro) => (
                      <button
                        key={registro.id}
                        type="button"
                        onClick={() => {
                          setIdSelecionado(registro.id);
                          setBuscaRegistro('');
                        }}
                        className="group flex w-full items-center justify-between border-b border-slate-100 px-3 py-2 text-left text-xs last:border-0 hover:bg-rose-50"
                      >
                        <div>
                          <span className="block font-semibold text-slate-800 group-hover:text-rose-700">{registro.rotulo}</span>
                          {registro.detalhe && (
                            <span className="block text-[10px] text-slate-400">{registro.detalhe}</span>
                          )}
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-rose-400" />
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-3 text-xs text-slate-400">Nenhum registro encontrado.</p>
                  )}
                </div>
              )}

              {/* Mostrar lista completa se busca vazia e nada selecionado */}
              {!idSelecionado && !carregando && buscaRegistro.length === 0 && registros.length > 0 && (
                <p className="mt-1 text-[11px] text-slate-400">Digite para buscar entre {registros.length} registros.</p>
              )}
            </div>

            {/* Registro selecionado */}
            {registroSelecionado && (
              <div className="flex items-start justify-between rounded-xl border border-rose-300 bg-rose-50 px-3 py-2.5 text-[11px]">
                <div>
                  <p className="font-black text-rose-800 uppercase tracking-wider text-[10px] mb-0.5">Alvo selecionado</p>
                  <p className="font-bold text-rose-900">{registroSelecionado.rotulo}</p>
                  {registroSelecionado.detalhe && (
                    <p className="text-rose-600 text-[10px]">{registroSelecionado.detalhe}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { setIdSelecionado(''); setBuscaRegistro(''); setConfirmacao(''); }}
                  className="ml-3 mt-0.5 rounded-lg px-2 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-100"
                >
                  Limpar
                </button>
              </div>
            )}

            {/* Confirmação textual */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                Confirmação obrigatória
              </label>
              <div className="mb-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Digite exatamente{' '}
                  <strong className="font-black text-rose-700 font-mono">EXCLUIR DEFINITIVAMENTE</strong>{' '}
                  para liberar o botão.
                </span>
              </div>
              <input
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                disabled={excluindo || !idSelecionado}
                placeholder="EXCLUIR DEFINITIVAMENTE"
                className={`h-10 w-full rounded-xl border px-3 font-mono text-xs font-bold outline-none transition-colors disabled:opacity-50 ${
                  confirmacao === 'EXCLUIR DEFINITIVAMENTE'
                    ? 'border-rose-400 bg-rose-50 text-rose-800'
                    : 'border-slate-200 text-slate-700 focus:border-rose-300'
                }`}
              />
            </div>

            {/* Feedback de erro */}
            {erro && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[11px] text-rose-800">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{erro}</span>
              </div>
            )}
          </div>

          {/* Coluna direita: log de operações */}
          {log.length > 0 && (
            <div className="hidden w-56 shrink-0 flex-col sm:flex">
              <div className="border-b border-slate-100 bg-slate-50 px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <ClipboardList className="h-3 w-3" />
                  Log de Operações
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {log.map((entrada) => (
                  <div
                    key={entrada.id}
                    className={`rounded-lg border px-2.5 py-2 text-[10px] ${
                      entrada.tipo === 'sucesso'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-rose-200 bg-rose-50 text-rose-800'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      {entrada.tipo === 'sucesso' ? (
                        <CheckCircle className="h-3 w-3 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                      )}
                      <span className="font-black uppercase">{entrada.tipo}</span>
                      <span className="ml-auto text-[9px] opacity-60">{entrada.timestamp}</span>
                    </div>
                    <p className="leading-relaxed opacity-90">{entrada.mensagem}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-4">
          <p className="text-[10px] text-slate-400 font-medium">
            Todas as exclusões são auditadas e irreversíveis.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={aoFechar}
              disabled={excluindo}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={excluir}
              disabled={!idSelecionado || confirmacao !== 'EXCLUIR DEFINITIVAMENTE' || excluindo}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {excluindo ? 'Excluindo...' : 'Excluir definitivamente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

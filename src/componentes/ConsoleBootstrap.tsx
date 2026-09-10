import { useEffect, useState, type FC } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, Trash2, X } from 'lucide-react';
import { requisicaoApi } from '../servicos/api.ts';

 type TipoEntidade = 'pacientes' | 'usuarios' | 'consultas' | 'instituicoes';

interface RegistroExclusao {
  id: string;
  rotulo: string;
  detalhe?: string;
}

interface ConsoleBootstrapProps {
  aberto: boolean;
  aoFechar: () => void;
  aoConcluir: () => void;
}

const rotas: Record<TipoEntidade, string> = {
  pacientes: 'pacientes',
  usuarios: 'usuarios',
  consultas: 'consultas',
  instituicoes: 'instituicoes',
};

const rotulos: Record<TipoEntidade, string> = {
  pacientes: 'Pacientes',
  usuarios: 'Usuários',
  consultas: 'Consultas',
  instituicoes: 'Instituições',
};

export const ConsoleBootstrap: FC<ConsoleBootstrapProps> = ({ aberto, aoFechar, aoConcluir }) => {
  const [tipo, setTipo] = useState<TipoEntidade>('pacientes');
  const [registros, setRegistros] = useState<RegistroExclusao[]>([]);
  const [idSelecionado, setIdSelecionado] = useState('');
  const [buscaRegistro, setBuscaRegistro] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregarRegistros = async (tipoAtual: TipoEntidade) => {
    setCarregando(true);
    setErro(null);
    setIdSelecionado('');
    setBuscaRegistro('');
    try {
      if (tipoAtual === 'usuarios') {
        const resposta = await requisicaoApi<{ dados: Array<{ id: string; nome?: string; nomeCompleto?: string; email: string }> }>('/usuarios');
        setRegistros((resposta.dados || []).map((item) => ({ id: item.id, rotulo: item.nome || item.nomeCompleto || 'Usuário sem nome', detalhe: item.email })));
      } else if (tipoAtual === 'instituicoes') {
        const resposta = await requisicaoApi<{ dados: Array<{ id: string; nome: string; cidade?: string; uf?: string }> }>('/escolas');
        setRegistros((resposta.dados || []).map((item) => ({ id: item.id, rotulo: item.nome, detalhe: [item.cidade, item.uf].filter(Boolean).join(' - ') || 'Instituição cadastrada' })));
      } else if (tipoAtual === 'pacientes') {
        const primeira = await requisicaoApi<{ dados: Array<{ id: string; nome: string; cpf?: string }>; totalPaginas: number }>('/pacientes?pagina=1&porPagina=100');
        const restantes = await Promise.all(
          Array.from({ length: Math.max(0, primeira.totalPaginas - 1) }, (_, indice) =>
            requisicaoApi<{ dados: Array<{ id: string; nome: string; cpf?: string }> }>(`/pacientes?pagina=${indice + 2}&porPagina=100`)
          )
        );
        setRegistros([primeira, ...restantes].flatMap((resposta) => resposta.dados || []).map((item) => ({ id: item.id, rotulo: item.nome, detalhe: item.cpf || 'CPF não informado' })));
      } else {
        const primeira = await requisicaoApi<{ dados: Array<{ id: string; pacienteNome: string; especialidade: string; criadoEm: string }>; totalPaginas: number }>('/atendimentos?pagina=1&porPagina=100');
        const restantes = await Promise.all(
          Array.from({ length: Math.max(0, primeira.totalPaginas - 1) }, (_, indice) =>
            requisicaoApi<{ dados: Array<{ id: string; pacienteNome: string; especialidade: string; criadoEm: string }> }>(`/atendimentos?pagina=${indice + 2}&porPagina=100`)
          )
        );
        setRegistros([primeira, ...restantes].flatMap((resposta) => resposta.dados || []).map((item) => ({
          id: item.id,
          rotulo: `${item.pacienteNome} - ${item.especialidade}`,
          detalhe: new Date(item.criadoEm).toLocaleString('pt-BR'),
        })));
      }
    } catch (excecao) {
      setErro(excecao instanceof Error ? excecao.message : 'Não foi possível carregar os registros.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (aberto) {
      setConfirmacao('');
      setBuscaRegistro('');
      setMensagem(null);
      void carregarRegistros(tipo);
    }
  }, [aberto, tipo]);

  useEffect(() => {
    if (!aberto) return;
    const fecharComEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape' && !excluindo) aoFechar();
    };
    window.addEventListener('keydown', fecharComEscape);
    return () => window.removeEventListener('keydown', fecharComEscape);
  }, [aberto, excluindo, aoFechar]);

  const excluir = async () => {
    if (!idSelecionado || confirmacao !== 'EXCLUIR DEFINITIVAMENTE') return;
    setExcluindo(true);
    setErro(null);
    setMensagem(null);
    try {
      await requisicaoApi(`/bootstrap/${rotas[tipo]}/${idSelecionado}`, {
        metodo: 'DELETE',
        corpo: { confirmacao },
      });
      setMensagem('Registro excluído definitivamente.');
      setConfirmacao('');
      setIdSelecionado('');
      await carregarRegistros(tipo);
      aoConcluir();
    } catch (excecao) {
      setErro(excecao instanceof Error ? excecao.message : 'Não foi possível concluir a exclusão.');
    } finally {
      setExcluindo(false);
    }
  };

  const registroSelecionado = registros.find((registro) => registro.id === idSelecionado);
  const registrosFiltrados = registros.filter((registro) =>
    `${registro.rotulo} ${registro.detalhe || ''}`.toLowerCase().includes(buscaRegistro.toLowerCase())
  );

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="console-bootstrap-titulo">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-rose-100 bg-rose-50/70 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600"><ShieldAlert className="h-5 w-5" /></div>
            <div>
              <h2 id="console-bootstrap-titulo" className="text-sm font-extrabold text-slate-900">Console de exclusão Bootstrap</h2>
              <p className="text-[11px] font-medium text-rose-700">Ação irreversível e exclusiva do usuário Bootstrap.</p>
            </div>
          </div>
          <button type="button" onClick={aoFechar} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700" aria-label="Fechar console"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(['pacientes', 'usuarios', 'consultas', 'instituicoes'] as TipoEntidade[]).map((opcao) => (
              <button key={opcao} type="button" onClick={() => setTipo(opcao)} className={`rounded-xl border px-2 py-2 text-[11px] font-bold transition-colors ${tipo === opcao ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {rotulos[opcao]}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>{carregando ? 'Consultando banco...' : `${registros.length} ${rotulos[tipo].toLowerCase()} disponíveis`}</span>
            <button type="button" onClick={() => void carregarRegistros(tipo)} disabled={carregando || excluindo} className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 disabled:opacity-50">
              <RefreshCw className={`h-3.5 w-3.5 ${carregando ? 'animate-spin' : ''}`} /> Atualizar
            </button>
          </div>

          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">Registro a excluir
            <input
              value={registroSelecionado ? `${registroSelecionado.rotulo}${registroSelecionado.detalhe ? ` - ${registroSelecionado.detalhe}` : ''}` : buscaRegistro}
              onChange={(evento) => {
                setBuscaRegistro(evento.target.value);
                setIdSelecionado('');
              }}
              disabled={carregando || excluindo}
              placeholder={carregando ? 'Carregando registros...' : 'Buscar por nome, e-mail ou identificador...'}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none focus:border-rose-400 focus:bg-white"
            />
          </label>
          {!idSelecionado && !carregando && (
            <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              {registrosFiltrados.length > 0 ? registrosFiltrados.map((registro) => (
                <button
                  key={registro.id}
                  type="button"
                  onClick={() => {
                    setIdSelecionado(registro.id);
                    setBuscaRegistro('');
                  }}
                  className="block w-full border-b border-slate-100 px-3 py-2 text-left text-xs text-slate-700 last:border-0 hover:bg-rose-50 hover:text-rose-700"
                >
                  <span className="block font-semibold">{registro.rotulo}</span>
                  {registro.detalhe && <span className="block text-[10px] text-slate-400">{registro.detalhe}</span>}
                </button>
              )) : (
                <p className="px-3 py-3 text-xs text-slate-400">Nenhum registro encontrado.</p>
              )}
            </div>
          )}
          {registroSelecionado && (
            <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-800">
              <span>Selecionado: <strong>{registroSelecionado.rotulo}</strong></span>
              <button type="button" onClick={() => { setIdSelecionado(''); setBuscaRegistro(''); }} className="font-bold hover:underline">Limpar</button>
            </div>
          )}

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>Esta ação remove dados permanentemente e não pode ser desfeita. Digite exatamente <strong>EXCLUIR DEFINITIVAMENTE</strong>.</span></div></div>
          <input value={confirmacao} onChange={(evento) => setConfirmacao(evento.target.value)} disabled={excluindo} placeholder="EXCLUIR DEFINITIVAMENTE" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold outline-none focus:border-rose-400" />
          {erro && <p className="text-xs font-semibold text-rose-700" role="alert">{erro}</p>}
          {mensagem && <p className="text-xs font-semibold text-emerald-700" role="status">{mensagem}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
          <button type="button" onClick={aoFechar} disabled={excluindo} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100">Cancelar</button>
          <button type="button" onClick={excluir} disabled={!idSelecionado || confirmacao !== 'EXCLUIR DEFINITIVAMENTE' || excluindo} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" />{excluindo ? 'Excluindo...' : 'Excluir definitivamente'}</button>
        </div>
      </div>
    </div>
  );
};

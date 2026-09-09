import { useState, useEffect, useMemo } from 'react';
import { CircleAlert, CircleCheck, Info, LoaderCircle, LockKeyhole } from 'lucide-react';
import { ProvedorPermissoes } from './contextos/ContextoPermissoes.tsx';
import { Sidebar, type SecaoMenu } from './componentes/Sidebar.tsx';
import { CabecalhoPagina } from './componentes/CabecalhoPagina.tsx';
import { TabelaPacientes, type ItemPaciente } from './componentes/TabelaPacientes.tsx';
import { ModalNovoPaciente, type FormNovoPaciente } from './componentes/ModalNovoPaciente.tsx';
import { FilaDoDia, type ItemFila } from './componentes/FilaDoDia.tsx';
import type { ItemProfissionalTriagem } from './componentes/ModalTriagem.tsx';
import { Atendimentos, type ItemAtendimentoLista } from './componentes/Atendimentos.tsx';
import { Dashboard } from './componentes/Dashboard.tsx';
import { Escolas, type EscolaPolo } from './componentes/Escolas.tsx';
import { Usuarios } from './componentes/Usuarios.tsx';
import { Login } from './paginas/Login.tsx';
import { TimeoutSessao } from './componentes/TimeoutSessao.tsx';
import { DrawerHistoricoPaciente } from './componentes/DrawerHistoricoPaciente.tsx';
import { ModalAlterarSenha } from './componentes/ModalAlterarSenha.tsx';
import { PainelAnalitico } from './paginas/PainelAnalitico.tsx';
import { Relatorios } from './componentes/Relatorios.tsx';
import { requisicaoApi } from './servicos/api.ts';
import { verificarAutorizacoesEmLote, sanitizarCpf } from './servicos/servicoCatraki.ts';
import { type PermissoesPerfil, type PerfilAcesso, type StatusAtendimento } from '../compartilhado/index.ts';

interface RespostaListaPacientes {
  dados: Array<{
    id: string;
    nome: string;
    cpf?: string;
    dataNascimento: string;
    sexo?: string;
    telefone?: string | null;
    turma?: string;
    escolaLocal?: string;
    criadoEm: string;
    atendimentosCount?: number;
    termoConsentimentoStatus?: ItemPaciente['termoConsentimentoStatus'];
  }>;
  totalPaginas: number;
}

const normalizarTexto = (valor?: string) =>
  (valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const somenteDigitos = (valor?: string) => (valor || '').replace(/\D/g, '');

const SECOES_VALIDAS: SecaoMenu[] = [
  'pacientes',
  'filaDia',
  'consultas',
  'dashboard',
  'bi',
  'escolas',
  'relatorios',
  'usuarios',
];

const converterPacienteApi = (paciente: RespostaListaPacientes['dados'][number]): ItemPaciente => ({
  id: paciente.id,
  nome: paciente.nome,
  cpf: paciente.cpf,
  dataNascimento: paciente.dataNascimento,
  sexo: paciente.sexo,
  telefone: paciente.telefone || undefined,
  turma: paciente.turma,
  escolaNome: paciente.escolaLocal || 'Não informada',
  termoConsentimentoStatus: paciente.termoConsentimentoStatus || 'PENDENTE',
  atendimentosCount: paciente.atendimentosCount || 0,
  criadoEm: paciente.criadoEm,
});

const obterSecaoInicial = (): SecaoMenu => {
  const hash = window.location.hash.replace(/^#/, '') as SecaoMenu;
  if (SECOES_VALIDAS.includes(hash)) {
    return hash;
  }
  return 'dashboard';
};

export function App() {
  // Navegação Persistente
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<{ nomeCompleto: string; email: string; perfil: PerfilAcesso } | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  // Permissões RBAC dinâmicas
  const [permissoesRbac, setPermissoesRbac] = useState<Partial<Record<PerfilAcesso, PermissoesPerfil>>>({});

  useEffect(() => {
    const handleAtualizacao = (event: Event) => {
      if ('detail' in event && event.detail) {
        setPermissoesRbac((event as CustomEvent).detail);
      }
    };
    window.addEventListener('permissoes_atualizadas', handleAtualizacao);
    return () => window.removeEventListener('permissoes_atualizadas', handleAtualizacao);
  }, []);

  const temAcesso = (secao: SecaoMenu) => {
    const perfil = usuarioLogado?.perfil || '';
    if (perfil === 'BOOTSTRAP') return true;
    if (perfil === 'ADMIN') return true;
    const permissoesDoPerfil = perfil ? permissoesRbac[perfil as PerfilAcesso] : undefined;
    return permissoesDoPerfil?.modulos[secao] === 'LIVRE';
  };

  const temPermissao = (acao: keyof PermissoesPerfil['acoes']) => {
    const perfil = usuarioLogado?.perfil || '';
    if (perfil === 'BOOTSTRAP') return true;
    if (perfil === 'ADMIN') return true;
    const permissoesDoPerfil = perfil ? permissoesRbac[perfil as PerfilAcesso] : undefined;
    return permissoesDoPerfil?.acoes[acao] === 'LIVRE';
  };

  useEffect(() => {
    let ativo = true;
    const verificarSessao = async () => {
      try {
        const res = await requisicaoApi<{
          autenticado?: boolean;
          usuario: { nomeCompleto: string; email: string; perfil: PerfilAcesso } | null;
          trocaSenhaObrigatoria?: boolean;
        }>('/auth/me');
        if (ativo) {
          if (!res.autenticado || !res.usuario) {
            setAutenticado(false);
            setUsuarioLogado(null);
            return;
          }
          setAutenticado(!res.trocaSenhaObrigatoria);
          setUsuarioLogado(res.trocaSenhaObrigatoria ? null : res.usuario);
          
          try {
            const rbacRes = await requisicaoApi<{ permissoes: Partial<Record<PerfilAcesso, PermissoesPerfil>> }>('/rbac/permissoes');
            setPermissoesRbac(rbacRes.permissoes);
          } catch (e) {
            console.error('Erro ao carregar permissões', e);
          }
        }
      } catch (erro) {
        if (ativo) {
          setAutenticado(false);
          setUsuarioLogado(null);
        }
      } finally {
        if (ativo) setCarregandoSessao(false);
      }
    };
    verificarSessao();
    return () => { ativo = false; };
  }, []);
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoMenu>(obterSecaoInicial);
  const [pacienteHistoricoDrawer, setPacienteHistoricoDrawer] = useState<ItemPaciente | null>(null);
  const [escolaAtivaId, setEscolaAtivaId] = useState<string>(() => {
    try {
      return localStorage.getItem('catraki_escola_ativa_id') || '';
    } catch {
      return '';
    }
  });

  // Sincronização Automática em Segundo Plano com a API Catraki
  const [statusSincronizacaoCatraki, setStatusSincronizacaoCatraki] = useState<{
    status: 'sincronizando' | 'sincronizado' | 'erro' | 'ocioso';
    ultimaSincronizacao?: Date | null;
  }>({
    status: 'ocioso',
    ultimaSincronizacao: null,
  });

  // Filtros da Visão de Pacientes
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [mostrarPacientesPendentes, setMostrarPacientesPendentes] = useState(false);
  const [carregandoPacientes, setCarregandoPacientes] = useState(true);

  // Modais
  const [modalNovoPacienteAberto, setModalNovoPacienteAberto] = useState(false);
  const [modalAlterarSenhaAberto, setModalAlterarSenhaAberto] = useState(false);
  const [pacienteParaEditar, setPacienteParaEditar] = useState<ItemPaciente | null>(null);

  // Notificações Toast
  const [toastNotificacao, setToastNotificacao] = useState<{ texto: string; tipo: 'sucesso' | 'info' | 'erro' } | null>(null);

  // Lista de Pacientes
  const [pacientes, setPacientes] = useState<ItemPaciente[]>([]);

  // Lista de Escolas Global
  const [escolasGlobais, setEscolasGlobais] = useState<EscolaPolo[]>([]);
  const [profissionais, setProfissionais] = useState<ItemProfissionalTriagem[]>([]);

  // Fila do Dia Compartilhada e Centralizada
  const [fila, setFila] = useState<ItemFila[]>(() => {
    try {
      const salvo = localStorage.getItem('catraki_fila_do_dia');
      if (salvo) return JSON.parse(salvo);
    } catch {}
    return [];
  });

  const handleAtualizarFila = (novaFila: ItemFila[]) => {
    setFila(novaFila);
    try {
      localStorage.setItem('catraki_fila_do_dia', JSON.stringify(novaFila));
    } catch {}
  };

  useEffect(() => {
    const escolaEstacionada = escolasGlobais.find((e) => e.status === 'ESTACIONADA_HOJE');
    if (escolaEstacionada) {
      setEscolaAtivaId(escolaEstacionada.id);
      try {
        localStorage.setItem('catraki_escola_ativa_id', escolaEstacionada.id);
      } catch {}
    } else if (escolaAtivaId) {
      const existeAinda = escolasGlobais.some((e) => e.id === escolaAtivaId);
      if (escolasGlobais.length > 0 && !existeAinda) {
        setEscolaAtivaId('');
        try {
          localStorage.removeItem('catraki_escola_ativa_id');
        } catch {}
      }
    }
  }, [escolasGlobais]);

  const limparNavegacaoAoDeslogar = () => {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    setSecaoAtiva('dashboard');
    setUsuarioLogado(null);
    setAutenticado(false);
    setModalAlterarSenhaAberto(false);
  };

  const deslogar = async () => {
    try {
      await requisicaoApi('/auth/logout', { metodo: 'POST' });
    } catch (e) {
      // A sessão local deve ser encerrada mesmo se a API estiver indisponível.
    }
    limparNavegacaoAoDeslogar();
  };

  const navegarParaSecao = (secao: SecaoMenu) => {
    setSecaoAtiva(secao);
    setMostrarPacientesPendentes(false);
    window.location.hash = secao;
  };

  useEffect(() => {
    const possuiSecaoExplicita = SECOES_VALIDAS.includes(
      window.location.hash.replace(/^#/, '') as SecaoMenu
    );
    if (!possuiSecaoExplicita && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    const escutarHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '') as SecaoMenu;
      if (SECOES_VALIDAS.includes(hash)) {
        setSecaoAtiva(hash);
      }
    };

    window.addEventListener('hashchange', escutarHashChange);
    return () => window.removeEventListener('hashchange', escutarHashChange);
  }, []);

  useEffect(() => {
    if (!autenticado) return;
    let ativo = true;
    const carregarEscolas = async () => {
      try {
        const resposta = await requisicaoApi<{ dados: EscolaPolo[] }>('/escolas');
        if (ativo) {
          setEscolasGlobais(resposta.dados);
          setEscolaAtivaId((atual) => atual && resposta.dados.some((escola) => escola.id === atual) ? atual : '');
        }
      } catch (erro) {
        console.error('Erro ao carregar escolas:', erro);
      }
    };
    carregarEscolas();
    return () => { ativo = false; };
  }, [autenticado]);

  useEffect(() => {
    if (!autenticado) return;
    let ativo = true;
    const carregarProfissionais = async () => {
      try {
        const resposta = await requisicaoApi<{ dados: ItemProfissionalTriagem[] }>('/atendimentos/profissionais');
        if (ativo) setProfissionais(resposta.dados);
      } catch (erro) {
        if (ativo) setProfissionais([]);
      }
    };
    carregarProfissionais();
    return () => { ativo = false; };
  }, [autenticado]);

  const mostrarToast = (texto: string, tipo: 'sucesso' | 'info' | 'erro') => {
    setToastNotificacao({ texto, tipo });
    setTimeout(() => setToastNotificacao(null), 3000);
  };

  useEffect(() => {
    if (!autenticado) return;
    let ativo = true;
    const carregarPacientes = async () => {
      try {
        const primeiraPagina = await requisicaoApi<RespostaListaPacientes>('/pacientes?pagina=1&porPagina=100');
        const paginasRestantes = Array.from({ length: Math.max(0, primeiraPagina.totalPaginas - 1) }, (_, indice) => indice + 2);
        const respostasRestantes = await Promise.all(
          paginasRestantes.map((pagina) => requisicaoApi<RespostaListaPacientes>(`/pacientes?pagina=${pagina}&porPagina=100`))
        );
        if (ativo) {
          const dados = [primeiraPagina, ...respostasRestantes].flatMap((resposta) => resposta.dados);
          setPacientes(dados.map(converterPacienteApi));
        }
      } catch (erro) {
        if (ativo) {
          mostrarToast(erro instanceof Error ? `Não foi possível carregar os pacientes: ${erro.message}` : 'Não foi possível carregar os pacientes.', 'erro');
        }
      } finally {
        if (ativo) setCarregandoPacientes(false);
      }
    };
    carregarPacientes();
    const intervalo = window.setInterval(carregarPacientes, 30_000);
    return () => {
      ativo = false;
      window.clearInterval(intervalo);
    };
  }, [autenticado]);

  // Lista de Atendimentos
  const [atendimentos, setAtendimentos] = useState<ItemAtendimentoLista[]>([]);
  const [carregandoAtendimentos, setCarregandoAtendimentos] = useState(true);

  useEffect(() => {
    if (!autenticado) return;
    let ativo = true;
    const carregarAtendimentos = async () => {
      try {
        const resposta = await requisicaoApi<{ dados: any[] }>('/atendimentos?porPagina=100');
        if (ativo && resposta?.dados) {
          const listaMapeada: ItemAtendimentoLista[] = resposta.dados.map((d: any) => ({
            id: d.id,
            pacienteId: d.pacienteId,
            pacienteNome: d.pacienteNome || 'Paciente',
            especialidade: d.especialidade,
            turno: d.turno,
            escolaNome: d.escolaNome || d.escolaLocal || 'Não informada',
            profissionalNome: d.profissionalNome || d.profissional || 'Profissional de Saúde',
            resumo: d.resumo || '',
            criadoEm: d.criadoEm || new Date().toISOString(),
            status: d.status,
          }));
          setAtendimentos(listaMapeada);
        }
      } catch (erro) {
        if (ativo) {
          mostrarToast(erro instanceof Error ? `Não foi possível carregar os atendimentos: ${erro.message}` : 'Não foi possível carregar os atendimentos.', 'erro');
        }
      } finally {
        if (ativo) setCarregandoAtendimentos(false);
      }
    };
    carregarAtendimentos();
    const intervalo = window.setInterval(carregarAtendimentos, 30_000);
    return () => {
      ativo = false;
      window.clearInterval(intervalo);
    };
  }, [autenticado]);

  const handleSalvarAtendimento = (novoAtendimento: ItemAtendimentoLista) => {
    setAtendimentos((lista) => {
      const index = lista.findIndex(
        (a) => a.id === novoAtendimento.id || (novoAtendimento.pacienteId && a.pacienteId === novoAtendimento.pacienteId && a.especialidade === novoAtendimento.especialidade)
      );
      if (index >= 0) {
        const nova = [...lista];
        nova[index] = { ...nova[index], ...novoAtendimento };
        return nova;
      }
      return [novoAtendimento, ...lista];
    });

    // Sincroniza também a fila local em tempo real
    setFila((prev) => {
      const novaFila = prev.map((item) => {
        const mesmoAtendimento = item.atendimentoId === novoAtendimento.id || item.id === novoAtendimento.id;
        const mesmoPaciente = Boolean(
          novoAtendimento.pacienteId &&
          item.pacienteId === novoAtendimento.pacienteId &&
          item.especialidade === novoAtendimento.especialidade
        );
        if (mesmoAtendimento || mesmoPaciente) {
          return {
            ...item,
            status: 'CONCLUIDO' as const,
            anotacoes: novoAtendimento.resumo || item.anotacoes,
            atendimentoId: novoAtendimento.id,
          };
        }
        return item;
      });
      try {
        localStorage.setItem('catraki_fila_do_dia', JSON.stringify(novaFila));
      } catch {}
      return novaFila;
    });

    mostrarToast('Atendimento e prontuário salvos no banco com sucesso!', 'sucesso');
  };

  // Atalho Global Alt+N para novo paciente
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setModalNovoPacienteAberto(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cadastro ou Edição de Paciente
  const handleSalvarPaciente = async (dados: FormNovoPaciente) => {
    const turma = [dados.anoEscolar, dados.turma].filter(Boolean).join(' — ') || 'Não informada';
    const escola = escolasGlobais.find((item) => item.nome === dados.instituicao);
    if (!escola) {
      throw new Error('Selecione uma instituição cadastrada.');
    }
    const corpo = {
      nome: dados.nomeCompleto,
      cpf: somenteDigitos(dados.cpf),
      dataNascimento: dados.dataNascimento,
      telefone: somenteDigitos(dados.telefone),
      turma,
      escolaLocalId: escola.id,
      sexo: dados.sexo,
    };

    if (pacienteParaEditar) {
      await requisicaoApi(`/pacientes/${pacienteParaEditar.id}`, {
        metodo: 'PATCH',
        corpo,
      });
      setPacientes((prev) =>
        prev.map((p) =>
          p.id === pacienteParaEditar.id
            ? {
                ...p,
                nome: dados.nomeCompleto,
                cpf: dados.cpf,
                dataNascimento: dados.dataNascimento,
                sexo: dados.sexo,
                escolaNome: dados.instituicao,
                telefone: dados.telefone,
                turma,
              }
            : p
        )
      );
      mostrarToast(`Cadastro de ${dados.nomeCompleto} atualizado com sucesso!`, 'sucesso');
      setPacienteParaEditar(null);
      setModalNovoPacienteAberto(false);
      return;
    }

    const resposta = await requisicaoApi<{ id: string; criadoEm: string }>('/pacientes', {
      metodo: 'POST',
      corpo,
    });
    const novoPaciente: ItemPaciente = {
      id: resposta.id,
      nome: dados.nomeCompleto,
      cpf: dados.cpf,
      dataNascimento: dados.dataNascimento,
      sexo: dados.sexo,
      telefone: dados.telefone,
      turma,
      escolaNome: dados.instituicao,
      termoConsentimentoStatus: 'PENDENTE',
      atendimentosCount: 0,
      criadoEm: resposta.criadoEm,
    };

    setPacientes((prev) => [novoPaciente, ...prev]);
    mostrarToast(`Paciente ${novoPaciente.nome} cadastrado com sucesso!`, 'sucesso');
    setModalNovoPacienteAberto(false);
  };

  // Sincronização Automática em Segundo Plano com a API Catraki
  useEffect(() => {
    let montado = true;

    const sincronizarEmSegundoPlano = async () => {
      const cpfs = pacientes
        .map((p) => sanitizarCpf(p.cpf))
        .filter((cpf) => cpf.length === 11);

      if (cpfs.length === 0) return;

      setStatusSincronizacaoCatraki((prev) => ({ ...prev, status: 'sincronizando' }));

      try {
        const resultado = await verificarAutorizacoesEmLote(cpfs);
        if (!montado) return;

        if (resultado.success && resultado.results && Object.keys(resultado.results).length > 0) {
          setPacientes((listaAtual) =>
            listaAtual.map((p) => {
              const cpfLimpo = sanitizarCpf(p.cpf);
              const itemCatraki = resultado.results[cpfLimpo];

              if (!itemCatraki) return p;

              const novoStatus = itemCatraki.authorized
                ? ('ACEITO' as const)
                : ('PENDENTE' as const);
              const autorizacaoCatraki = itemCatraki.authorized
                ? ('AUTORIZADO' as const)
                : itemCatraki.is_revoked || itemCatraki.status === 'revoked'
                  ? ('REVOGADO' as const)
                  : ('PENDENTE' as const);

              return {
                ...p,
                termoConsentimentoStatus: novoStatus,
                autorizacaoCatraki,
                codigoValidacaoCatraki: itemCatraki.authorized ? itemCatraki.validation_code : undefined,
                assinadoEmCatraki: itemCatraki.authorized ? itemCatraki.signed_at : undefined,
              };
            })
          );

          setStatusSincronizacaoCatraki({
            status: 'sincronizado',
            ultimaSincronizacao: new Date(),
          });
        } else {
          setStatusSincronizacaoCatraki((prev) => ({
            status: 'sincronizado',
            ultimaSincronizacao: prev.ultimaSincronizacao || new Date(),
          }));
        }
      } catch (e) {
        if (montado) {
          setStatusSincronizacaoCatraki((prev) => ({
            status: prev.ultimaSincronizacao ? 'sincronizado' : 'erro',
            ultimaSincronizacao: prev.ultimaSincronizacao,
          }));
        }
      }
    };

    // Executa imediatamente em segundo plano
    sincronizarEmSegundoPlano();

    // Sincroniza periodicamente a cada 60 segundos
    const intervalo = setInterval(sincronizarEmSegundoPlano, 60000);

    return () => {
      montado = false;
      clearInterval(intervalo);
    };
  }, [pacientes.length]);

  const handleExcluirPaciente = async (paciente: ItemPaciente) => {
    try {
      await requisicaoApi(`/pacientes/${paciente.id}/arquivar`, { metodo: 'POST' });
      setPacientes((prev) => prev.filter((p) => p.id !== paciente.id));
      mostrarToast(`Paciente ${paciente.nome} foi arquivado com sucesso.`, 'sucesso');
    } catch (erro) {
      mostrarToast(erro instanceof Error ? `Não foi possível arquivar: ${erro.message}` : 'Não foi possível arquivar o paciente.', 'erro');
    }
  };

  const handleAtualizarStatusAtendimento = async (id: string, status: StatusAtendimento) => {
    const atendimentoExistente = atendimentos.find((atendimento) => atendimento.id === id);
    if (!atendimentoExistente) {
      return;
    }
    const statusAnterior = atendimentoExistente.status;
    setAtendimentos((lista) => lista.map((atendimento) => atendimento.id === id ? { ...atendimento, status } : atendimento));
    try {
      await requisicaoApi(`/atendimentos/${id}/status`, {
        metodo: 'PATCH',
        corpo: { status },
      });
    } catch (erro) {
      setAtendimentos((lista) => lista.map((atendimento) => atendimento.id === id ? { ...atendimento, status: statusAnterior } : atendimento));
      mostrarToast(erro instanceof Error ? `Não foi possível atualizar o status: ${erro.message}` : 'Não foi possível atualizar o status.', 'erro');
    }
  };

  // Filtragem da Lista de Pacientes
  const pacientesFiltrados = useMemo(() => pacientes.filter((paciente) => {
    if (mostrarPacientesPendentes && paciente.termoConsentimentoStatus !== 'PENDENTE') return false;
    const termoTexto = normalizarTexto(buscaPaciente.trim());
    const termoNumerico = somenteDigitos(buscaPaciente);
    const correspondeBusca = !termoTexto || [
      paciente.nome,
      paciente.escolaNome,
      paciente.responsavelNome,
      paciente.telefone,
      paciente.turma,
    ].some((valor) => normalizarTexto(valor).includes(termoTexto)) ||
      (termoNumerico.length > 0 && [paciente.cpf, paciente.telefone].some((valor) => somenteDigitos(valor).includes(termoNumerico)));
    return correspondeBusca;
  }), [pacientes, buscaPaciente, mostrarPacientesPendentes]);

  if (carregandoSessao) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f7fb]">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-slate-500 font-medium text-sm">Carregando sessão...</span>
        </div>
      </div>
    );
  }

  if (!autenticado) {
    return (
      <Login aoLogar={(usuario, trocaSenhaObrigatoria) => {
        setAutenticado(true);
        setUsuarioLogado({
          nomeCompleto: usuario.nomeCompleto,
          email: usuario.email,
          perfil: usuario.perfil as PerfilAcesso,
        });
        setModalAlterarSenhaAberto(trocaSenhaObrigatoria);
        mostrarToast(`Bem-vindo de volta!`, 'sucesso');
      }} />
    );
  }

  return (
    <ProvedorPermissoes perfilLogado={usuarioLogado?.perfil || null} permissoes={permissoesRbac}>
      <div className="flex min-h-screen bg-[#f4f7fb] text-slate-800 font-sans">
      {/* ─── Sidebar Lateral (8 Módulos Essenciais) ────────────────────────── */}
      <Sidebar
        secaoAtiva={secaoAtiva}
        nomeUsuario={usuarioLogado?.nomeCompleto ?? 'Usuário'}
        emailUsuario={usuarioLogado?.email ?? ''}
        cargoUsuario={usuarioLogado?.perfil ?? 'Membro'}
        perfilUsuario={usuarioLogado?.perfil}
        temAcesso={temAcesso}
        aoMudarSenha={() => setModalAlterarSenhaAberto(true)}
        aoMudarSecao={(secao) => {
          navegarParaSecao(secao);
        }}
        aoDeslogar={async () => {
          await deslogar();
          setToastNotificacao({
            texto: 'Sessão encerrada com sucesso.',
            tipo: 'info',
          });
        }}
      />

      {/* ─── Área Principal de Conteúdo ───────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Toast Notificação de Ações */}
        {toastNotificacao && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-fade-in ${
              toastNotificacao.tipo === 'sucesso'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : toastNotificacao.tipo === 'erro'
                  ? 'bg-red-50 text-red-800 border-red-300'
                  : 'bg-blue-50 text-blue-800 border-blue-300'
            }`}
            role="status"
          >
            {toastNotificacao.tipo === 'sucesso' ? (
              <CircleCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : toastNotificacao.tipo === 'erro' ? (
              <CircleAlert className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{toastNotificacao.texto}</span>
          </div>
        )}

        {/* ─── Renderização dos 8 Módulos Essenciais ────────────────────────── */}
        {(() => {
          const perfil = usuarioLogado?.perfil || '';

          if (!temAcesso(secaoAtiva)) {
            return (
              <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in p-8">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                  <LockKeyhole className="w-10 h-10 text-rose-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Acesso Restrito</h2>
                <p className="text-slate-500 max-w-md">
                  Seu perfil de <span className="font-bold text-slate-700">{perfil}</span> não possui as permissões necessárias para acessar a seção <span className="font-bold text-slate-700 uppercase">{secaoAtiva}</span>.
                </p>
                <button
                  onClick={() => navegarParaSecao('dashboard')}
                  className="mt-8 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all"
                >
                  Voltar ao Dashboard
                </button>
              </div>
            );
          }

          if (secaoAtiva === 'pacientes') {
            return (
              <div className="flex flex-col flex-1 animate-fade-in">
            <CabecalhoPagina
              titulo="Pacientes"
              subtitulo="CADASTRO, IDENTIFICAÇÃO E SITUAÇÃO DOS PACIENTES"
              busca={{
                valor: buscaPaciente,
                aoMudar: setBuscaPaciente,
                placeholder: 'Buscar por nome, CPF, telefone, turma ou responsável...',
              }}
              acaoPrimaria={temPermissao('criarPaciente') ? {
                rotulo: 'Novo Paciente',
                aoClicar: () => setModalNovoPacienteAberto(true),
              } : undefined}
              statusSincronizacaoCatraki={statusSincronizacaoCatraki}
              fixo={true}
            />

            <TabelaPacientes
              pacientes={pacientesFiltrados}
              carregando={carregandoPacientes}
              aoNovoPaciente={() => {
                setPacienteParaEditar(null);
                setModalNovoPacienteAberto(true);
              }}
              aoIniciarAtendimento={() => {
                navegarParaSecao('filaDia');
              }}
              aoVerDetalhes={(paciente) => {
                setPacienteHistoricoDrawer(paciente);
              }}
              aoEditarPaciente={async (paciente) => {
                try {
                  const resposta = await requisicaoApi<{ dados: RespostaListaPacientes['dados'][number] }>(`/pacientes/${paciente.id}`);
                  setPacienteParaEditar(converterPacienteApi(resposta.dados));
                  setModalNovoPacienteAberto(true);
                } catch (erro) {
                  mostrarToast('Não foi possível carregar os dados protegidos do paciente.', 'erro');
                }
              }}
              aoExcluirPaciente={handleExcluirPaciente}
              ehAdminGeral={true}
            />
          </div>
            );
          }
          
          if (secaoAtiva === 'filaDia') {
            return (
              <FilaDoDia
                escolas={escolasGlobais}
                pacientes={pacientes}
                atendimentos={atendimentos}
                fila={fila}
                profissionais={profissionais}
                ehAdmin={usuarioLogado?.perfil === 'ADMIN' || usuarioLogado?.perfil === 'BOOTSTRAP'}
                aoAtualizarStatus={handleAtualizarStatusAtendimento}
                aoSalvarAtendimento={handleSalvarAtendimento}
                aoAtualizarFila={handleAtualizarFila}
                aoVerHistoricoPaciente={(p) => {
                  const pacienteCompleto = pacientes.find((item) => item.id === p.id || item.nome === p.nome) || p;
                  setPacienteHistoricoDrawer(pacienteCompleto);
                }}
                aoIniciarAtendimento={() => {
                  // O modal de atendimento já trata o fluxo internamente na FilaDoDia
                }}
                aoNovoPaciente={temPermissao('criarPaciente') ? () => setModalNovoPacienteAberto(true) : undefined}
              />
            );
          }
          
          if (secaoAtiva === 'consultas') {
            return (
              <Atendimentos
                atendimentos={atendimentos}
                statusSincronizacaoCatraki={statusSincronizacaoCatraki}
                aoAtualizarStatus={handleAtualizarStatusAtendimento}
                aoNovoAtendimento={temPermissao('criarPaciente') ? () => navegarParaSecao('filaDia') : () => {}}
              />
            );
          }
          
          if (secaoAtiva === 'dashboard') {
            return (
              <Dashboard
                totalPacientes={pacientes.length}
                totalAtendimentos={atendimentos.length}
                totalInstituicoes={escolasGlobais.length}
                pacientes={pacientes}
                atendimentos={atendimentos}
                fila={fila}
                carregando={carregandoPacientes || carregandoAtendimentos}
                aoNovoPaciente={temPermissao('criarPaciente') ? () => setModalNovoPacienteAberto(true) : () => {}}
                aoNovoAtendimento={() => navegarParaSecao('filaDia')}
                aoAbrirAtendimentos={() => setSecaoAtiva('consultas')}
                aoAbrirRelatorios={() => setSecaoAtiva('relatorios')}
                aoAbrirBi={() => setSecaoAtiva('bi')}
              />
            );
          }
          
          if (secaoAtiva === 'bi') {
            return (
              <PainelAnalitico
                atendimentos={atendimentos}
                pacientes={pacientes}
                escolas={escolasGlobais}
                fila={fila}
              />
            );
          }
          
          if (secaoAtiva === 'escolas') {
            return (
              <Escolas
                escolas={escolasGlobais}
                escolaAtivaId={escolaAtivaId}
                podeGerenciar={usuarioLogado?.perfil === 'ADMIN' || usuarioLogado?.perfil === 'BOOTSTRAP'}
                aoSelecionarEscolaAtiva={async (id) => {
                  setEscolaAtivaId(id);
                  if (id) {
                    try {
                      localStorage.setItem('catraki_escola_ativa_id', id);
                    } catch {}
                    try {
                      await requisicaoApi(`/escolas/${id}/ativar`, { metodo: 'POST' });
                    } catch (erro) {
                      console.error('Erro ao salvar instituição ativa no servidor:', erro);
                    }
                  } else {
                    try {
                      localStorage.removeItem('catraki_escola_ativa_id');
                    } catch {}
                    try {
                      await requisicaoApi('/escolas/desativar/todas', { metodo: 'POST' });
                    } catch (erro) {
                      console.error('Erro ao desativar instituição no servidor:', erro);
                    }
                  }

                  setEscolasGlobais((prev) =>
                    prev.map((esc) => ({
                      ...esc,
                      status: esc.id === id ? 'ESTACIONADA_HOJE' : 'PROGRAMADA',
                    }))
                  );

                  setToastNotificacao({
                    texto: id ? 'Instituição ativa atualizada com sucesso!' : 'Instituição desativada com sucesso.',
                    tipo: 'sucesso',
                  });
                  setTimeout(() => setToastNotificacao(null), 3000);
                }}
                aoRecarregarEscolas={async () => {
                  try {
                    const resposta = await requisicaoApi<{ dados: EscolaPolo[] }>('/escolas');
                    setEscolasGlobais(resposta.dados);
                  } catch (erro) {}
                }}
              />
            );
          }
          
          if (secaoAtiva === 'relatorios') {
            return (
              <Relatorios
                escolas={escolasGlobais}
              />
            );
          }
          
          if (secaoAtiva === 'usuarios') {
            return <Usuarios />;
          }
          
          return <Dashboard
            totalPacientes={pacientes.length}
            totalAtendimentos={atendimentos.length}
            totalInstituicoes={escolasGlobais.length}
            pacientes={pacientes}
            atendimentos={atendimentos}
            fila={fila}
            carregando={carregandoPacientes || carregandoAtendimentos}
            aoNovoPaciente={temPermissao('criarPaciente') ? () => setModalNovoPacienteAberto(true) : () => {}}
            aoNovoAtendimento={() => navegarParaSecao('filaDia')}
            aoAbrirAtendimentos={() => setSecaoAtiva('consultas')}
            aoAbrirRelatorios={() => setSecaoAtiva('relatorios')}
            aoAbrirBi={() => setSecaoAtiva('bi')}
          />;
        })()}
      </main>

      {/* ─── Drawer Lateral de Histórico do Paciente ─────────────────────── */}
      <DrawerHistoricoPaciente
        aberto={Boolean(pacienteHistoricoDrawer)}
        paciente={pacienteHistoricoDrawer}
        aoFechar={() => setPacienteHistoricoDrawer(null)}
        itensFila={fila}
        atendimentosLocais={atendimentos}
        aoNovoAtendimento={() => {
          setPacienteHistoricoDrawer(null);
          navegarParaSecao('filaDia');
        }}
        aoVerProntuario={() => {
          setPacienteHistoricoDrawer(null);
          navegarParaSecao('filaDia');
        }}
      />

      {/* ─── Modal de Cadastro ou Edição de Paciente ─────────────────────── */}
      <ModalNovoPaciente
        aberto={modalNovoPacienteAberto}
        aoFechar={() => {
          setModalNovoPacienteAberto(false);
          setPacienteParaEditar(null);
        }}
        aoSalvar={handleSalvarPaciente}
        escolas={escolasGlobais}
        instituicaoPadrao={
          escolaAtivaId
            ? escolasGlobais.find((escola) => escola.id === escolaAtivaId)?.nome || ''
            : ''
        }
        pacienteParaEditar={pacienteParaEditar}
      />

      <ModalAlterarSenha
        aberto={modalAlterarSenhaAberto}
        aoFechar={() => setModalAlterarSenhaAberto(false)}
      />

      {/* ─── Modal de Timeout de Sessão por Inatividade (LGPD) ───────────── */}
      <TimeoutSessao
        tempoLimiteMinutos={15}
        tempoAvisoSegundos={120}
        imune={usuarioLogado?.perfil === 'BOOTSTRAP'}
        aoExpirar={deslogar}
      />
    </div>
    </ProvedorPermissoes>
  );
}

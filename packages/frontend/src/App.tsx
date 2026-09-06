import { useState, useEffect, useMemo } from 'react';
import { Sidebar, type SecaoMenu } from './componentes/Sidebar.tsx';
import { CabecalhoPagina } from './componentes/CabecalhoPagina.tsx';
import { TabelaPacientes, type ItemPaciente } from './componentes/TabelaPacientes.tsx';
import { ModalNovoPaciente, type FormNovoPaciente } from './componentes/ModalNovoPaciente.tsx';
import { FilaDoDia } from './componentes/FilaDoDia.tsx';
import { Atendimentos, type ItemAtendimentoLista } from './componentes/Atendimentos.tsx';
import { Dashboard } from './componentes/Dashboard.tsx';
import { Escolas, type EscolaPolo } from './componentes/Escolas.tsx';
import { Usuarios } from './componentes/Usuarios.tsx';
import { Relatorios } from './componentes/Relatorios.tsx';
import { GovernancaAuditoria } from './componentes/GovernancaAuditoria.tsx';
import { FichaAtendimento } from './paginas/FichaAtendimento.tsx';
import { TimeoutSessao } from './componentes/TimeoutSessao.tsx';
import { DrawerHistoricoPaciente } from './componentes/DrawerHistoricoPaciente.tsx';
import { requisicaoApi } from './servicos/api.ts';
import { verificarAutorizacoesEmLote, sanitizarCpf } from './servicos/servicoCatraki.ts';

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
}

const normalizarTexto = (valor?: string) =>
  (valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const somenteDigitos = (valor?: string) => (valor || '').replace(/\D/g, '');

const SECOES_VALIDAS: SecaoMenu[] = [
  'pacientes',
  'filaDia',
  'consultas',
  'dashboard',
  'escolas',
  'relatorios',
  'usuarios',
  'governanca',
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
  const salva = localStorage.getItem('catraki_secao_ativa') as SecaoMenu;
  if (SECOES_VALIDAS.includes(salva)) {
    return salva;
  }
  return 'pacientes';
};

export function App() {
  // Navegação Persistente
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoMenu>(obterSecaoInicial);
  const [modoNovaFicha, setModoNovaFicha] = useState(false);
  const [pacienteSelecionadoParaFicha, setPacienteSelecionadoParaFicha] = useState<ItemPaciente | null>(null);
  const [pacienteHistoricoDrawer, setPacienteHistoricoDrawer] = useState<ItemPaciente | null>(null);
  const [escolaAtivaId, setEscolaAtivaId] = useState('0a62d5b0-0d57-4f75-8969-8a0c2c5f7e01');

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
  const [carregandoPacientes, setCarregandoPacientes] = useState(true);

  // Modais
  const [modalNovoPacienteAberto, setModalNovoPacienteAberto] = useState(false);
  const [pacienteParaEditar, setPacienteParaEditar] = useState<ItemPaciente | null>(null);

  // Notificações Toast
  const [toastNotificacao, setToastNotificacao] = useState<{ texto: string; tipo: 'sucesso' | 'info' | 'erro' } | null>(null);

  // Lista de Pacientes
  const [pacientes, setPacientes] = useState<ItemPaciente[]>([]);

  // Lista de Escolas Global
  const [escolasGlobais, setEscolasGlobais] = useState<EscolaPolo[]>([]);

  const navegarParaSecao = (secao: SecaoMenu) => {
    setSecaoAtiva(secao);
    setModoNovaFicha(false);
    setPacienteSelecionadoParaFicha(null);
    window.location.hash = secao;
    localStorage.setItem('catraki_secao_ativa', secao);
  };

  useEffect(() => {
    const secaoInicial = obterSecaoInicial();
    if (window.location.hash !== `#${secaoInicial}`) {
      window.history.replaceState(null, '', `#${secaoInicial}`);
    }
    localStorage.setItem('catraki_secao_ativa', secaoInicial);

    const escutarHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '') as SecaoMenu;
      if (SECOES_VALIDAS.includes(hash)) {
        setSecaoAtiva(hash);
        setModoNovaFicha(false);
        setPacienteSelecionadoParaFicha(null);
        localStorage.setItem('catraki_secao_ativa', hash);
      }
    };

    window.addEventListener('hashchange', escutarHashChange);
    return () => window.removeEventListener('hashchange', escutarHashChange);
  }, []);

  useEffect(() => {
    let ativo = true;
    const carregarEscolas = async () => {
      try {
        const resposta = await requisicaoApi<{ dados: EscolaPolo[] }>('/escolas');
        if (ativo) setEscolasGlobais(resposta.dados);
      } catch (erro) {
        console.error('Erro ao carregar escolas:', erro);
      }
    };
    carregarEscolas();
    return () => { ativo = false; };
  }, []);

  const mostrarToast = (texto: string, tipo: 'sucesso' | 'info' | 'erro') => {
    setToastNotificacao({ texto, tipo });
    setTimeout(() => setToastNotificacao(null), 3500);
  };

  useEffect(() => {
    let ativo = true;
    const carregarPacientes = async () => {
      try {
        const resposta = await requisicaoApi<RespostaListaPacientes>('/pacientes?porPagina=100');
        if (ativo) setPacientes(resposta.dados.map(converterPacienteApi));
      } catch (erro) {
        if (ativo) {
          mostrarToast(erro instanceof Error ? `Não foi possível carregar os pacientes: ${erro.message}` : 'Não foi possível carregar os pacientes.', 'erro');
        }
      } finally {
        if (ativo) setCarregandoPacientes(false);
      }
    };
    carregarPacientes();
    return () => { ativo = false; };
  }, []);

  // Lista de Atendimentos
  const [atendimentos, setAtendimentos] = useState<ItemAtendimentoLista[]>([]);

  useEffect(() => {
    let ativo = true;
    const carregarAtendimentos = async () => {
      try {
        const resposta = await requisicaoApi<{ dados: ItemAtendimentoLista[] }>('/atendimentos?porPagina=100');
        if (ativo) setAtendimentos(resposta.dados);
      } catch (erro) {
        if (ativo) {
          mostrarToast(erro instanceof Error ? `Não foi possível carregar os atendimentos: ${erro.message}` : 'Não foi possível carregar os atendimentos.', 'erro');
        }
      } finally {
      }
    };
    carregarAtendimentos();
    return () => { ativo = false; };
  }, []);

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
        .filter((p) => p.termoConsentimentoStatus === 'PENDENTE')
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

              return {
                ...p,
                termoConsentimentoStatus: novoStatus,
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

  // Filtragem da Lista de Pacientes
  const pacientesFiltrados = useMemo(() => pacientes.filter((paciente) => {
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
  }), [pacientes, buscaPaciente]);

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] text-slate-800 font-sans">
      {/* ─── Sidebar Lateral (8 Módulos Essenciais) ────────────────────────── */}
      <Sidebar
        secaoAtiva={secaoAtiva}
        nomeUsuario="Mateus Cotrim"
        emailUsuario="mateus.cotrim@catraki.com.br"
        cargoUsuario="Administrador Geral"
        aoMudarSecao={(secao) => {
          navegarParaSecao(secao);
        }}
        aoDeslogar={() => {
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
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : toastNotificacao.tipo === 'erro' ? (
              <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            )}
            <span>{toastNotificacao.texto}</span>
          </div>
        )}

        {/* ─── Renderização dos 8 Módulos Essenciais ────────────────────────── */}
        {modoNovaFicha ? (
          /* 3. Ficha de Atendimento Clínico */
          <FichaAtendimento
            pacientePreSelecionado={pacienteSelecionadoParaFicha}
            escolas={escolasGlobais}
            aoVoltar={() => {
              setModoNovaFicha(false);
              setPacienteSelecionadoParaFicha(null);
            }}
          />
        ) : secaoAtiva === 'pacientes' ? (
          /* 1. Pacientes */
          <div className="flex flex-col flex-1 animate-fade-in">
            <CabecalhoPagina
              titulo="Pacientes"
              subtitulo="CADASTRO, IDENTIFICAÇÃO E SITUAÇÃO DOS PACIENTES"
              busca={{
                valor: buscaPaciente,
                aoMudar: setBuscaPaciente,
                placeholder: 'Buscar por nome, CPF, telefone, turma ou responsável...',
              }}
              acaoPrimaria={{
                rotulo: 'Novo Paciente',
                aoClicar: () => setModalNovoPacienteAberto(true),
              }}
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
              aoIniciarAtendimento={(paciente) => {
                setPacienteSelecionadoParaFicha(paciente);
                setModoNovaFicha(true);
              }}
              aoVerDetalhes={(paciente) => {
                setPacienteHistoricoDrawer(paciente);
              }}
              aoEditarPaciente={(paciente) => {
                setPacienteParaEditar(paciente);
                setModalNovoPacienteAberto(true);
              }}
              aoExcluirPaciente={handleExcluirPaciente}
              ehAdminGeral={true}
            />
          </div>
        ) : secaoAtiva === 'filaDia' ? (
          /* 2. Fila do Dia / Triagem */
          <FilaDoDia
            aoIniciarAtendimento={(aluno) => {
              setPacienteSelecionadoParaFicha({
                id: aluno.id,
                nome: aluno.nome,
                dataNascimento: '2012-05-14',
                escolaNome: 'CEMEIT DE TAGUATINGA',
                termoConsentimentoStatus: 'ACEITO',
                atendimentosCount: 1,
                criadoEm: new Date().toISOString(),
              });
              setModoNovaFicha(true);
            }}
            aoNovoPaciente={() => setModalNovoPacienteAberto(true)}
          />
        ) : secaoAtiva === 'consultas' ? (
          /* 3. Fichas de Atendimento (Histórico) */
          <Atendimentos
            atendimentos={atendimentos}
            statusSincronizacaoCatraki={statusSincronizacaoCatraki}
            aoNovoAtendimento={() => {
              setModoNovaFicha(true);
              setPacienteSelecionadoParaFicha(null);
            }}
          />
        ) : secaoAtiva === 'dashboard' ? (
          /* 8. Dashboard do Dia */
          <Dashboard
            totalPacientes={pacientes.length}
            totalAtendimentos={atendimentos.length}
            aoNovoPaciente={() => setModalNovoPacienteAberto(true)}
            aoNovoAtendimento={() => {
              setModoNovaFicha(true);
              setPacienteSelecionadoParaFicha(null);
            }}
          />
        ) : secaoAtiva === 'escolas' ? (
          /* 4. Escolas*/
          <Escolas
            escolas={escolasGlobais}
            escolaAtivaId={escolaAtivaId}
            aoSelecionarEscolaAtiva={(id) => {
              setEscolaAtivaId(id);
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
        ) : secaoAtiva === 'relatorios' ? (
          /* 6. Relatórios & Prestação de Contas */
          <Relatorios escolas={escolasGlobais} />
        ) : secaoAtiva === 'usuarios' ? (
          /* 5. Usuários & Perfis */
          <Usuarios />
        ) : (
          /* 7. Governança & Auditoria LGPD */
          <GovernancaAuditoria />
        )}
      </main>

      {/* ─── Drawer Lateral de Histórico do Paciente ─────────────────────── */}
      <DrawerHistoricoPaciente
        aberto={Boolean(pacienteHistoricoDrawer)}
        paciente={pacienteHistoricoDrawer}
        aoFechar={() => setPacienteHistoricoDrawer(null)}
        aoNovoAtendimento={(paciente) => {
          setPacienteSelecionadoParaFicha(paciente);
          setModoNovaFicha(true);
        }}
        aoVerProntuario={() => {
          if (pacienteHistoricoDrawer) {
            setPacienteSelecionadoParaFicha(pacienteHistoricoDrawer);
            setModoNovaFicha(true);
            setPacienteHistoricoDrawer(null);
          }
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
        pacienteParaEditar={pacienteParaEditar}
      />

      {/* ─── Modal de Timeout de Sessão por Inatividade (LGPD) ───────────── */}
      <TimeoutSessao
        tempoLimiteMinutos={15}
        tempoAvisoSegundos={120}
        aoExpirar={() => {
          alert('Sua sessão expirou por inatividade. O sistema foi bloqueado por segurança (LGPD).');
          window.location.reload();
        }}
      />
    </div>
  );
}

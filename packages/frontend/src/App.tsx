import { useState, useEffect } from 'react';
import { Sidebar, type SecaoMenu } from './componentes/Sidebar.tsx';
import { CabecalhoPagina } from './componentes/CabecalhoPagina.tsx';
import { TabelaPacientes, type ItemPaciente } from './componentes/TabelaPacientes.tsx';
import { ModalNovoPaciente, type FormNovoPaciente } from './componentes/ModalNovoPaciente.tsx';
import { FilaDoDia } from './componentes/FilaDoDia.tsx';
import { Atendimentos, type ItemAtendimentoLista } from './componentes/Atendimentos.tsx';
import { Dashboard } from './componentes/Dashboard.tsx';
import { Escolas } from './componentes/Escolas.tsx';
import { Usuarios } from './componentes/Usuarios.tsx';
import { Relatorios } from './componentes/Relatorios.tsx';
import { GovernancaAuditoria } from './componentes/GovernancaAuditoria.tsx';
import { FichaAtendimento } from './paginas/FichaAtendimento.tsx';
import { TimeoutSessao } from './componentes/TimeoutSessao.tsx';
import { DrawerHistoricoPaciente } from './componentes/DrawerHistoricoPaciente.tsx';
import { requisicaoApi } from './servicos/api.ts';
import { verificarAutorizacoesEmLote, sanitizarCpf } from './servicos/servicoCatraki.ts';
import { Especialidade, Turno } from '../compartilhado/index.ts';

const ESCOLAS_PADRAO = [
  { id: 'seed-escola-001', nome: 'CEMEIT DE TAGUATINGA' },
  { id: 'seed-escola-002', nome: 'CEF 01 DE BRASÍLIA' },
  { id: 'seed-escola-003', nome: 'EC 10 DE CEILÂNDIA' },
  { id: 'seed-escola-004', nome: 'CEF 02 DE SOBRADINHO' },
];

export function App() {
  // Navegação
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoMenu>('pacientes');
  const [modoNovaFicha, setModoNovaFicha] = useState(false);
  const [pacienteSelecionadoParaFicha, setPacienteSelecionadoParaFicha] = useState<ItemPaciente | null>(null);
  const [pacienteHistoricoDrawer, setPacienteHistoricoDrawer] = useState<ItemPaciente | null>(null);
  const [escolaAtivaId, setEscolaAtivaId] = useState('seed-escola-001');

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

  // Modais
  const [modalNovoPacienteAberto, setModalNovoPacienteAberto] = useState(false);
  const [pacienteParaEditar, setPacienteParaEditar] = useState<ItemPaciente | null>(null);

  // Notificações Toast
  const [toastNotificacao, setToastNotificacao] = useState<{ texto: string; tipo: 'sucesso' | 'info' | 'erro' } | null>(null);

  // Lista de Pacientes
  const [pacientes, setPacientes] = useState<ItemPaciente[]>([
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      nome: 'ANA BEATRIZ DIAS GONSALO',
      cpf: '087.567.621-41',
      dataNascimento: '2010-02-15',
      sexo: 'Feminino',
      escolaNome: 'CEMEIT DE TAGUATINGA',
      termoConsentimentoStatus: 'PENDENTE',
      atendimentosCount: 2,
      perfil: 'Aluno Regular',
      turma: '9º Ano — Turma B (Matutino)',
      telefone: '(61) 98452-1190',
      responsavelNome: 'Maria Helena Dias',
      criadoEm: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      nome: 'GABRIEL HENRIQUE SANTOS',
      cpf: '078.432.191-04',
      dataNascimento: '2012-05-14',
      sexo: 'Masculino',
      escolaNome: 'CEMEIT DE TAGUATINGA',
      termoConsentimentoStatus: 'PENDENTE',
      atendimentosCount: 2,
      perfil: 'Aluno Regular',
      turma: '7º Ano — Turma A (Matutino)',
      telefone: '(61) 99124-8832',
      responsavelNome: 'Carlos Eduardo Santos',
      criadoEm: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      nome: 'BEATRIZ LIMA DE OLIVEIRA',
      cpf: '065.912.331-88',
      dataNascimento: '2014-09-20',
      sexo: 'Feminino',
      escolaNome: 'CEF 01 DE BRASÍLIA',
      termoConsentimentoStatus: 'PENDENTE',
      atendimentosCount: 1,
      perfil: 'Aluno Regular',
      turma: '5º Ano — Turma C (Vespertino)',
      telefone: '(61) 98233-4019',
      responsavelNome: 'Patrícia Lima',
      criadoEm: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      nome: 'ALEXANDRE DE SOUZA NUNES',
      cpf: '065.320.071-93',
      dataNascimento: '2010-05-01',
      sexo: 'Masculino',
      escolaNome: 'CEMEIT DE TAGUATINGA',
      termoConsentimentoStatus: 'PENDENTE',
      atendimentosCount: 0,
      perfil: 'Aluno Regular',
      turma: '1ª Série EM — Turma 102',
      telefone: '(61) 99650-7712',
      responsavelNome: 'Roberto Nunes',
      criadoEm: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440006',
      nome: 'ALIA ALI SHAFIQ',
      cpf: '082.528.511-03',
      dataNascimento: '2009-11-27',
      sexo: 'Feminino',
      escolaNome: 'CEMEIT DE TAGUATINGA',
      termoConsentimentoStatus: 'PENDENTE',
      atendimentosCount: 0,
      perfil: 'Aluno Regular',
      turma: '2ª Série EM — Turma 201',
      telefone: '(61) 98115-6204',
      responsavelNome: 'Farah Shafiq',
      criadoEm: new Date(Date.now() - 3600000 * 7).toISOString(),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440007',
      nome: 'ALICE DOS REIS NETTO MORAES',
      cpf: '064.003.241-61',
      dataNascimento: '2010-10-06',
      sexo: 'Feminino',
      escolaNome: 'CEMEIT DE TAGUATINGA',
      termoConsentimentoStatus: 'PENDENTE',
      atendimentosCount: 1,
      perfil: 'Aluno Regular',
      turma: '9º Ano — Turma A (Matutino)',
      telefone: '(61) 99341-5580',
      responsavelNome: 'Luciana dos Reis',
      criadoEm: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      nome: 'MATHEUS COSTA RIBEIRO',
      cpf: '088.231.990-11',
      dataNascimento: '2015-11-03',
      sexo: 'Masculino',
      escolaNome: 'CEMEIT DE TAGUATINGA',
      termoConsentimentoStatus: 'PENDENTE',
      atendimentosCount: 0,
      perfil: 'Aluno Regular',
      turma: '4º Ano — Turma A (Vespertino)',
      telefone: '(61) 98570-9943',
      responsavelNome: 'Fernanda Costa Ribeiro',
      criadoEm: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  // Lista de Atendimentos
  const [atendimentos] = useState<ItemAtendimentoLista[]>([
    {
      id: 'atend-001',
      pacienteNome: 'GABRIEL HENRIQUE SANTOS',
      especialidade: Especialidade.OFTALMOLOGIA,
      turno: Turno.MANHA,
      escolaNome: 'CEMEIT DE TAGUATINGA',
      profissionalNome: 'Dra. Carolina Mendes',
      resumo: 'Acuidade visual 20/20 bilateral, sem queixas oftalmológicas.',
      criadoEm: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'atend-002',
      pacienteNome: 'BEATRIZ LIMA DE OLIVEIRA',
      especialidade: Especialidade.ODONTOLOGIA,
      turno: Turno.MANHA,
      escolaNome: 'CEF 01 DE BRASÍLIA',
      profissionalNome: 'Dr. Felipe Arantes',
      resumo: 'Aplicação de flúor e profilaxia dentária realizada com sucesso.',
      criadoEm: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

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
    if (pacienteParaEditar) {
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
              }
            : p
        )
      );
      setToastNotificacao({
        texto: `Cadastro de ${dados.nomeCompleto} atualizado com sucesso!`,
        tipo: 'sucesso',
      });
      setTimeout(() => setToastNotificacao(null), 3500);
      setPacienteParaEditar(null);
      setModalNovoPacienteAberto(false);
      return;
    }

    const novoId = crypto.randomUUID();
    const novoPaciente: ItemPaciente = {
      id: novoId,
      nome: dados.nomeCompleto,
      cpf: dados.cpf,
      dataNascimento: dados.dataNascimento,
      sexo: dados.sexo,
      escolaNome: dados.instituicao,
      termoConsentimentoStatus: 'ACEITO',
      atendimentosCount: 0,
      criadoEm: new Date().toISOString(),
    };

    try {
      await requisicaoApi('/pacientes', {
        metodo: 'POST',
        corpo: {
          nome: dados.nomeCompleto,
          cpf: dados.cpf,
          dataNascimento: dados.dataNascimento,
          sexo: dados.sexo,
          escolaLocalId: escolaAtivaId,
          responsavelNome: dados.nomeCompleto,
          responsavelParentesco: 'Responsável',
          responsavelTelefone: dados.telefone,
          termoAceito: true,
        },
      });
    } catch {
      // Fallback otimista em memória
    }

    setPacientes((prev) => [novoPaciente, ...prev]);
    setToastNotificacao({
      texto: `Paciente ${novoPaciente.nome} cadastrado com sucesso!`,
      tipo: 'sucesso',
    });
    setTimeout(() => setToastNotificacao(null), 3500);
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

  const handleExcluirPaciente = (paciente: ItemPaciente) => {
    setPacientes((prev) => prev.filter((p) => p.id !== paciente.id));
    setToastNotificacao({
      texto: `Paciente ${paciente.nome} foi excluído com sucesso.`,
      tipo: 'sucesso',
    });
    setTimeout(() => setToastNotificacao(null), 3500);
  };

  // Filtragem da Lista de Pacientes
  const pacientesFiltrados = pacientes.filter((paciente) => {
    const termo = buscaPaciente.trim().toLowerCase();
    if (!termo) return true;
    return (
      paciente.nome.toLowerCase().includes(termo) ||
      (paciente.cpf && paciente.cpf.includes(termo)) ||
      paciente.escolaNome.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] text-slate-800 font-sans">
      {/* ─── Sidebar Lateral (8 Módulos Essenciais) ────────────────────────── */}
      <Sidebar
        secaoAtiva={secaoAtiva}
        nomeUsuario="Mateus Cotrim"
        emailUsuario="mateus.cotrim@catraki.com.br"
        cargoUsuario="Administrador Geral"
        aoMudarSecao={(secao) => {
          setSecaoAtiva(secao);
          setModoNovaFicha(false);
          setPacienteSelecionadoParaFicha(null);
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
            escolas={ESCOLAS_PADRAO}
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
                placeholder: 'Buscar por nome ou CPF...',
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
              carregando={false}
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
          /* 4. Escolas & Unidades Móveis */
          <Escolas
            escolaAtivaId={escolaAtivaId}
            aoSelecionarEscolaAtiva={(id) => {
              setEscolaAtivaId(id);
              setToastNotificacao({
                texto: 'Polo ativo atualizado com sucesso!',
                tipo: 'sucesso',
              });
              setTimeout(() => setToastNotificacao(null), 3000);
            }}
          />
        ) : secaoAtiva === 'relatorios' ? (
          /* 6. Relatórios & Prestação de Contas */
          <Relatorios />
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
        escolas={ESCOLAS_PADRAO}
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

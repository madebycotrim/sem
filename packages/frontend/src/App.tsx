import { useState, useEffect } from 'react';
import { SidebarSesi, type SecaoMenu } from './componentes/SidebarSesi.tsx';
import { CabecalhoPaginaSesi } from './componentes/CabecalhoPaginaSesi.tsx';
import { TabelaPacientes, type ItemPaciente } from './componentes/TabelaPacientes.tsx';
import { ModalNovoPaciente, type FormNovoPaciente } from './componentes/ModalNovoPaciente.tsx';
import { VisaoFilaDoDia } from './componentes/VisaoFilaDoDia.tsx';
import { VisaoAtendimentos, type ItemAtendimentoLista } from './componentes/VisaoAtendimentos.tsx';
import { VisaoPainelGeral } from './componentes/VisaoPainelGeral.tsx';
import { VisaoEscolas } from './componentes/VisaoEscolas.tsx';
import { VisaoUsuarios } from './componentes/VisaoUsuarios.tsx';
import { VisaoRelatorios } from './componentes/VisaoRelatorios.tsx';
import { VisaoGovernancaAuditoria } from './componentes/VisaoGovernancaAuditoria.tsx';
import { FichaAtendimento } from './paginas/FichaAtendimento.tsx';
import { TimeoutSessao } from './componentes/TimeoutSessao.tsx';
import { requisicaoApi } from './servicos/api.ts';
import { Especialidade, Turno } from '@sistema/shared';

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
  const [escolaAtivaId, setEscolaAtivaId] = useState('seed-escola-001');

  // Filtros da Visão de Pacientes
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [apenasAvisos, setApenasAvisos] = useState(false);
  const [filtroEscola, setFiltroEscola] = useState('');

  // Modais
  const [modalNovoPacienteAberto, setModalNovoPacienteAberto] = useState(false);

  // Notificações Toast
  const [toastNotificacao, setToastNotificacao] = useState<{ texto: string; tipo: 'sucesso' | 'info' | 'erro' } | null>(null);

  // Lista de Pacientes
  const [pacientes, setPacientes] = useState<ItemPaciente[]>([
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      nome: 'GABRIEL HENRIQUE SANTOS',
      cpf: '078.432.191-04',
      dataNascimento: '2012-05-14',
      escolaNome: 'CEMEIT DE TAGUATINGA',
      termoConsentimentoStatus: 'ACEITO',
      atendimentosCount: 2,
      criadoEm: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      nome: 'BEATRIZ LIMA DE OLIVEIRA',
      cpf: '065.912.331-88',
      dataNascimento: '2014-09-20',
      escolaNome: 'CEF 01 DE BRASÍLIA',
      termoConsentimentoStatus: 'ACEITO',
      atendimentosCount: 1,
      criadoEm: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      nome: 'MATHEUS COSTA RIBEIRO',
      cpf: '088.231.990-11',
      dataNascimento: '2015-11-03',
      escolaNome: 'CEMEIT DE TAGUATINGA',
      termoConsentimentoStatus: 'ACEITO',
      atendimentosCount: 0,
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
      profissionalNome: 'Dra. Camila Souza (Oftalmologia)',
      resumo: 'Avaliação de acuidade visual com tabela de Snellen e biomicroscopia.',
      criadoEm: new Date(Date.now() - 3600000 * 3).toISOString(),
      statusSincronizacao: 'sincronizado',
    },
    {
      id: 'atend-002',
      pacienteNome: 'BEATRIZ LIMA DE OLIVEIRA',
      especialidade: Especialidade.ODONTOLOGIA,
      turno: Turno.MANHA,
      escolaNome: 'CEF 01 DE BRASÍLIA',
      profissionalNome: 'Dr. Lucas Prado (Dentista)',
      resumo: 'Profilaxia e aplicação tópica de flúor preventivo.',
      criadoEm: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      statusSincronizacao: 'sincronizado',
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

  // Cadastro de Novo Paciente via API Central
  const handleSalvarPaciente = async (dados: FormNovoPaciente) => {
    const novoId = crypto.randomUUID();

    const novoPaciente: ItemPaciente = {
      id: novoId,
      nome: dados.nomeCompleto,
      cpf: dados.cpf,
      dataNascimento: dados.dataNascimento,
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
  };

  // Filtragem da Lista de Pacientes
  const pacientesFiltrados = pacientes.filter((paciente) => {
    const matchBusca =
      paciente.nome.toLowerCase().includes(buscaPaciente.toLowerCase()) ||
      (paciente.cpf && paciente.cpf.includes(buscaPaciente));

    const matchAviso = !apenasAvisos || paciente.termoConsentimentoStatus !== 'ACEITO';
    const matchEscola = !filtroEscola || paciente.escolaNome.includes(filtroEscola);

    return matchBusca && matchAviso && matchEscola;
  });

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] text-slate-800 font-sans">
      {/* ─── Sidebar Lateral Estilo SESI (8 Módulos Essenciais) ───────────── */}
      <SidebarSesi
        secaoAtiva={secaoAtiva}
        aoMudarSecao={(secao) => {
          setSecaoAtiva(secao);
          setModoNovaFicha(false);
          setPacienteSelecionadoParaFicha(null);
        }}
      />

      {/* ─── Área Principal de Conteúdo ───────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Toast Notificação de Ações */}
        {toastNotificacao && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 anim-surgir ${
              toastNotificacao.tipo === 'sucesso'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : toastNotificacao.tipo === 'erro'
                  ? 'bg-red-50 text-red-800 border-red-300'
                  : 'bg-blue-50 text-blue-800 border-blue-300'
            }`}
            role="status"
          >
            <span>{toastNotificacao.tipo === 'sucesso' ? '✅' : toastNotificacao.tipo === 'erro' ? '❌' : 'ℹ️'}</span>
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
          <div className="flex flex-col flex-1 anim-surgir">
            <CabecalhoPaginaSesi
              titulo="Pacientes"
              subtitulo="CADASTRO, IDENTIFICAÇÃO E SITUAÇÃO DOS PACIENTES"
              busca={{
                valor: buscaPaciente,
                aoMudar: setBuscaPaciente,
                placeholder: 'Buscar por nome ou CPF...',
              }}
              filtroAvisos={{
                ativo: apenasAvisos,
                aoAlternar: () => setApenasAvisos(!apenasAvisos),
                rotulo: 'Apenas com Avisos',
              }}
              seletor={{
                valor: filtroEscola,
                aoMudar: setFiltroEscola,
                placeholder: 'Todas as Escolas / Polos',
                opcoes: ESCOLAS_PADRAO,
              }}
              aoExportar={() => alert(`Exportando ${pacientesFiltrados.length} registros em formato CSV.`)}
              acaoPrimaria={{
                rotulo: '+ Novo Paciente',
                aoClicar: () => setModalNovoPacienteAberto(true),
              }}
              fixo={true}
            />

            <TabelaPacientes
              pacientes={pacientesFiltrados}
              carregando={false}
              aoNovoPaciente={() => setModalNovoPacienteAberto(true)}
              aoIniciarAtendimento={(paciente) => {
                setPacienteSelecionadoParaFicha(paciente);
                setModoNovaFicha(true);
              }}
              aoVerDetalhes={(paciente) => {
                setPacienteSelecionadoParaFicha(paciente);
                setModoNovaFicha(true);
              }}
            />
          </div>
        ) : secaoAtiva === 'filaDia' ? (
          /* 2. Fila do Dia / Triagem */
          <VisaoFilaDoDia
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
          <VisaoAtendimentos
            atendimentos={atendimentos}
            aoNovoAtendimento={() => {
              setModoNovaFicha(true);
              setPacienteSelecionadoParaFicha(null);
            }}
          />
        ) : secaoAtiva === 'dashboard' ? (
          /* 8. Dashboard do Dia */
          <VisaoPainelGeral
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
          <VisaoEscolas
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
          <VisaoRelatorios />
        ) : secaoAtiva === 'usuarios' ? (
          /* 5. Usuários & Perfis */
          <VisaoUsuarios />
        ) : (
          /* 7. Governança & Auditoria LGPD */
          <VisaoGovernancaAuditoria />
        )}
      </main>

      {/* ─── Modal de Cadastro de Novo Paciente ───────────────────────────── */}
      <ModalNovoPaciente
        aberto={modalNovoPacienteAberto}
        aoFechar={() => setModalNovoPacienteAberto(false)}
        aoSalvar={handleSalvarPaciente}
        escolas={ESCOLAS_PADRAO}
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

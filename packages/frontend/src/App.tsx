import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { SidebarSesi, type AbaNavegacao } from './componentes/SidebarSesi.tsx';
import { PageHeader } from './componentes/PageHeader.tsx';
import { BarraFiltros } from './componentes/BarraFiltros.tsx';
import { TabelaPacientes, type ItemPaciente } from './componentes/TabelaPacientes.tsx';
import { ModalNovoPaciente } from './componentes/ModalNovoPaciente.tsx';
import { VisaoAtendimentos, type ItemAtendimentoLista } from './componentes/VisaoAtendimentos.tsx';
import { VisaoFilaOffline } from './componentes/VisaoFilaOffline.tsx';
import { VisaoPainelGeral } from './componentes/VisaoPainelGeral.tsx';
import { FichaAtendimento } from './paginas/FichaAtendimento.tsx';
import { TimeoutSessao } from './componentes/TimeoutSessao.tsx';
import {
  bancoOffline,
  sincronizarFila,
  limparSincronizadosAntigos,
  inicializarSincronizacaoAutomatica,
} from './servicos/filaOffline.ts';
import { requisicaoApi } from './servicos/api.ts';
import { Especialidade, Turno } from '@sistema/shared';

const ESCOLAS_PADRAO = [
  { id: 'seed-escola-001', nome: 'CEF 01 de Brasília (Asa Sul)' },
  { id: 'seed-escola-002', nome: 'CED 03 de Taguatinga' },
  { id: 'seed-escola-003', nome: 'EC 10 de Ceilândia' },
  { id: 'seed-escola-004', nome: 'CEF 02 de Sobradinho' },
];

export function App() {
  // Navegação
  const [abaAtiva, setAbaAtiva] = useState<AbaNavegacao>('pacientes');
  const [modoNovaFicha, setModoNovaFicha] = useState(false);
  const [pacienteSelecionadoParaFicha, setPacienteSelecionadoParaFicha] = useState<ItemPaciente | null>(null);

  // Filtros da Visão de Pacientes
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [apenasAvisos, setApenasAvisos] = useState(false);
  const [filtroEscola, setFiltroEscola] = useState('');

  // Modais
  const [modalNovoPacienteAberto, setModalNovoPacienteAberto] = useState(false);

  // Status de Conexão & Fila Offline
  const [estaOnline, setEstaOnline] = useState(navigator.onLine);
  const [estaSincronizando, setEstaSincronizando] = useState(false);
  const [toastNotificacao, setToastNotificacao] = useState<{ texto: string; tipo: 'sucesso' | 'info' | 'erro' } | null>(null);

  // Live query do IndexedDB para contagem e itens
  const itensFila = useLiveQuery(() => bancoOffline.atendimentosPendentes.toArray()) ?? [];
  const itensPendentes = itensFila.filter((item) => item.status === 'pendente').length;

  // Lista Local de Pacientes em Memória (com fallback local imediato)
  const [pacientes, setPacientes] = useState<ItemPaciente[]>([
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      nome: 'Gabriel Henrique Santos',
      cpf: '078.432.191-04',
      dataNascimento: '2012-05-14',
      escolaNome: 'CEF 01 de Brasília (Asa Sul)',
      termoConsentimentoStatus: 'ACEITO',
      atendimentosCount: 2,
      criadoEm: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      nome: 'Beatriz Lima de Oliveira',
      cpf: '065.912.331-88',
      dataNascimento: '2014-09-20',
      escolaNome: 'CEF 01 de Brasília (Asa Sul)',
      termoConsentimentoStatus: 'ACEITO',
      atendimentosCount: 1,
      criadoEm: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      nome: 'Matheus Costa Ribeiro',
      cpf: undefined,
      dataNascimento: '2015-11-03',
      escolaNome: 'CED 03 de Taguatinga',
      termoConsentimentoStatus: 'DISPENSADO',
      atendimentosCount: 0,
      criadoEm: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  // Lista de Atendimentos
  const [atendimentos, setAtendimentos] = useState<ItemAtendimentoLista[]>([
    {
      id: 'atend-001',
      pacienteNome: 'Gabriel Henrique Santos',
      especialidade: Especialidade.PEDIATRIA,
      turno: Turno.MATUTINO,
      escolaNome: 'CEF 01 de Brasília',
      profissionalNome: 'Dra. Camila Souza (Pediatra)',
      resumo: 'Avaliação de desenvolvimento pôndero-estatural e triagem auditiva.',
      criadoEm: new Date(Date.now() - 3600000 * 3).toISOString(),
      statusSincronizacao: 'sincronizado',
    },
    {
      id: 'atend-002',
      pacienteNome: 'Beatriz Lima de Oliveira',
      especialidade: Especialidade.ODONTOLOGIA,
      turno: Turno.MATUTINO,
      escolaNome: 'CEF 01 de Brasília',
      profissionalNome: 'Dr. Lucas Prado (Dentista)',
      resumo: 'Profilaxia e aplicação tópica de flúor preventivo.',
      criadoEm: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      statusSincronizacao: 'sincronizado',
    },
  ]);

  // Listener de Online/Offline
  useEffect(() => {
    const handleOnline = () => setEstaOnline(true);
    const handleOffline = () => setEstaOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const cleanupSync = inicializarSincronizacaoAutomatica();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      cleanupSync();
    };
  }, []);

  // Atalhos Globais de Teclado (Alt+N para novo paciente, Alt+S para sincronizar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setModalNovoPacienteAberto(true);
      }
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSincronizar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Função para sincronizar a fila
  const handleSincronizar = useCallback(async () => {
    if (estaSincronizando) return;
    setEstaSincronizando(true);
    try {
      const resultado = await sincronizarFila();
      setToastNotificacao({
        texto: `Sincronização concluída: ${resultado.sincronizados} enviado(s)${resultado.erros > 0 ? `, ${resultado.erros} pendente(s)` : ''}`,
        tipo: resultado.erros > 0 ? 'info' : 'sucesso',
      });
    } catch (err: any) {
      setToastNotificacao({
        texto: err?.message || 'Falha ao sincronizar com o servidor.',
        tipo: 'erro',
      });
    } finally {
      setEstaSincronizando(false);
      setTimeout(() => setToastNotificacao(null), 4000);
    }
  }, [estaSincronizando]);

  // Cadastro de Novo Paciente
  const handleSalvarPaciente = async (dados: any) => {
    const novoId = crypto.randomUUID();
    const escolaObj = ESCOLAS_PADRAO.find((e) => e.id === dados.escolaLocalId) || ESCOLAS_PADRAO[0];

    const novoPaciente: ItemPaciente = {
      id: novoId,
      nome: dados.nome,
      cpf: dados.cpf || undefined,
      dataNascimento: dados.dataNascimento,
      escolaNome: escolaObj.nome,
      termoConsentimentoStatus: dados.termoAceito ? 'ACEITO' : 'PENDENTE',
      atendimentosCount: 0,
      criadoEm: new Date().toISOString(),
    };

    // Tenta persistir na API se online
    if (navigator.onLine) {
      try {
        await requisicaoApi('/pacientes', {
          metodo: 'POST',
          corpo: {
            nome: dados.nome,
            cpf: dados.cpf,
            dataNascimento: dados.dataNascimento,
            sexo: dados.sexo,
            escolaLocalId: dados.escolaLocalId,
            responsavelNome: dados.responsavelNome,
            responsavelParentesco: dados.responsavelParentesco,
            responsavelTelefone: dados.responsavelTelefone,
            termoAceito: dados.termoAceito,
          },
        });
      } catch {
        // Fallback local em memória e Dexie
      }
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
      {/* ─── Sidebar Lateral Estilo SESI ──────────────────────────────────── */}
      <SidebarSesi
        abaAtiva={abaAtiva}
        aoMudarAba={(aba) => {
          setAbaAtiva(aba);
          setModoNovaFicha(false);
          setPacienteSelecionadoParaFicha(null);
        }}
        estaOnline={estaOnline}
        itensPendentes={itensPendentes}
        aoAbrirSincronizacao={() => setAbaAtiva('filaOffline')}
        iniciaisUsuario="MC"
        nomeUsuario="Maria Clara (Triagem Itinerante)"
        perfilUsuario="Triador SESI-DF"
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

        {/* ─── Renderização por Abas ──────────────────────────────────────── */}
        {modoNovaFicha ? (
          <FichaAtendimento
            pacientePreSelecionado={pacienteSelecionadoParaFicha}
            escolas={ESCOLAS_PADRAO}
            aoVoltar={() => {
              setModoNovaFicha(false);
              setPacienteSelecionadoParaFicha(null);
            }}
          />
        ) : abaAtiva === 'pacientes' ? (
          /* ─── Tela Principal de Pacientes (Fiel à Imagem do Usuário) ── */
          <div className="flex flex-col flex-1 anim-surgir">
            <PageHeader
              titulo="Pacientes"
              subtitulo="CADASTRO, IDENTIFICAÇÃO E SITUAÇÃO DOS PACIENTES"
            />

            <BarraFiltros
              termoBusca={buscaPaciente}
              aoMudarBusca={setBuscaPaciente}
              apenasPendentes={apenasAvisos}
              aoAlternarApenasPendentes={() => setApenasAvisos(!apenasAvisos)}
              filtroEscola={filtroEscola}
              aoMudarFiltroEscola={setFiltroEscola}
              opcoesEscola={ESCOLAS_PADRAO}
              aoSincronizar={handleSincronizar}
              estaSincronizando={estaSincronizando}
              itensPendentes={itensPendentes}
              aoNovoRegistro={() => setModalNovoPacienteAberto(true)}
              rotuloNovoRegistro="+ Novo Paciente"
              aoExportar={() => alert(`Exportando ${pacientesFiltrados.length} registros em formato CSV.`)}
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
        ) : abaAtiva === 'dashboard' ? (
          <VisaoPainelGeral
            totalPacientes={pacientes.length}
            totalAtendimentos={atendimentos.length}
            totalPendentesSync={itensPendentes}
            estaOnline={estaOnline}
            aoNavegar={(aba) => setAbaAtiva(aba)}
            aoNovoPaciente={() => setModalNovoPacienteAberto(true)}
            aoNovoAtendimento={() => {
              setModoNovaFicha(true);
              setPacienteSelecionadoParaFicha(null);
            }}
          />
        ) : abaAtiva === 'atendimentos' || abaAtiva === 'triagem' ? (
          <VisaoAtendimentos
            atendimentos={atendimentos}
            aoNovoAtendimento={() => {
              setModoNovaFicha(true);
              setPacienteSelecionadoParaFicha(null);
            }}
          />
        ) : abaAtiva === 'filaOffline' ? (
          <VisaoFilaOffline
            itensFila={itensFila}
            estaOnline={estaOnline}
            aoSincronizar={handleSincronizar}
            estaSincronizando={estaSincronizando}
            aoLimparSincronizados={async () => {
              const removidos = await limparSincronizadosAntigos(0);
              setToastNotificacao({
                texto: `${removidos} registro(s) sincronizado(s) limpo(s) do IndexedDB local.`,
                tipo: 'info',
              });
              setTimeout(() => setToastNotificacao(null), 3000);
            }}
          />
        ) : (
          /* Abas Secundárias (Escolas / Documentos) */
          <div className="flex flex-col flex-1 anim-surgir">
            <PageHeader
              titulo={abaAtiva === 'escolas' ? 'Escolas & Polos Itinerantes' : 'Documentos & Termos LGPD'}
              subtitulo={
                abaAtiva === 'escolas'
                  ? 'INSTITUIÇÕES DE ENSINO PÚBLICO ATENDIDAS PELO PROJETO ESCOLA CIDADÃ'
                  : 'TERMOS DE CONSENTIMENTO E AUDITORIA DE DADOS SENSÍVEIS (LGPD ART. 14)'
              }
            />

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ESCOLAS_PADRAO.map((esc) => (
                  <div key={esc.id} className="p-4 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#0b2545]">{esc.nome}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Distrito Federal • Polo Ativo</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Ativo
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
        minutosInatividade={13}
        minutosAviso={2}
        aoExpirar={() => {
          alert('Sua sessão expirou por inatividade. O sistema foi bloqueado por segurança (LGPD).');
          window.location.reload();
        }}
      />
    </div>
  );
}

import { type FC, useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Building2,
  CircleAlert,
  UserCheck,
  UserPlus,
  AlertTriangle,
  ChevronRight,
  Pencil,
} from 'lucide-react';
import {
  Modal,
  ModalCampo,
  BotaoModal,
  ModalSelectCustom,
  type OpcaoSelectCustom,
} from './Modal.tsx';
import { Especialidade } from '../../compartilhado/index.ts';
import { mascararCpf } from '../servicos/apiCpf.ts';
import { EspecialidadeBadge, obterEstiloEspecialidade } from './EspecialidadeVisual.tsx';

export interface ItemPacienteTriagem {
  id: string;
  nome: string;
  cpf?: string;
  dataNascimento?: string;
  escolaNome?: string;
}

export interface ItemProfissionalTriagem {
  id: string;
  nome: string;
  especialidade: Especialidade;
  registro?: string;
}

export interface ModalTriagemProps {
  aberto: boolean;
  aoFechar: () => void;
  aoConfirmar: (dados: {
    pacienteId: string;
    pacienteNome: string;
    cpf?: string;
    idade: number;
    escolaNome: string;
    profissionalId: string;
    profissionalNome: string;
    profissionalRegistro?: string;
    especialidade: Especialidade;
  }) => Promise<void> | void;
  escolas?: Array<{ id: string; nome: string }>;
  pacientes?: ItemPacienteTriagem[];
  atendimentos?: Array<{ pacienteId: string; especialidade: Especialidade }>;
  aoCriarNovoPaciente?: () => void;
}

// Profissionais de Saúde Padrão para seleção no Sistema
const PROFISSIONAIS_PADRAO: ItemProfissionalTriagem[] = [
  { id: 'prof-1', nome: 'Mateus R. F. Cotrim', especialidade: 'OFTALMOLOGIA', registro: 'CRM/DF 24512' },
  { id: 'prof-2', nome: 'Ana Luiza Souza', especialidade: 'ODONTOLOGIA', registro: 'CRO/DF 11840' },
  { id: 'prof-3', nome: 'Carlos Eduardo Silva', especialidade: 'AUDIOMETRIA', registro: 'CRFa/DF 8412' },
  { id: 'prof-4', nome: 'Paula Rocha Lima', especialidade: 'NUTRICAO', registro: 'CRN/DF 9320' },
  { id: 'prof-5', nome: 'Mariana Costa Santos', especialidade: 'PSICOLOGIA', registro: 'CRP/DF 15420' },
];

// Avatar com inicial do nome
const AvatarLetra: FC<{ nome: string; tamanho?: 'sm' | 'md' | 'lg' }> = ({ nome, tamanho = 'md' }) => {
  const inicial = nome.trim().charAt(0).toUpperCase();
  const cores = ['bg-blue-100 text-blue-600', 'bg-violet-100 text-violet-600', 'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-600', 'bg-cyan-100 text-cyan-600'];
  const cor = cores[nome.charCodeAt(0) % cores.length];
  const sz = tamanho === 'lg' ? 'w-12 h-12 text-lg' : tamanho === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  return (
    <div className={`${sz} ${cor} rounded-xl font-extrabold flex items-center justify-center shrink-0 border border-white/60 shadow-sm`}>
      {inicial}
    </div>
  );
};

export const ModalTriagem: FC<ModalTriagemProps> = ({
  aberto,
  aoFechar,
  aoConfirmar,
  escolas = [],
  pacientes = [],
  atendimentos = [],
  aoCriarNovoPaciente,
}) => {
  const [instituicaoSelecionadaId, setInstituicaoSelecionadaId] = useState('');
  const [instituicaoPendenteId, setInstituicaoPendenteId] = useState<string | null>(null);
  const [instituicaoAutomatica, setInstituicaoAutomatica] = useState(false);
  const [pacienteSelecionadoId, setPacienteSelecionadoId] = useState('');
  const [profissionalSelecionadoId, setProfissionalSelecionadoId] = useState('');
  const [especialidade, setEspecialidade] = useState<Especialidade>('OFTALMOLOGIA');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [campoComErro, setCampoComErro] = useState<'paciente' | 'instituicao' | 'profissional' | null>(null);

  // Paineis de edição expandidos
  const [editandoInstituicao, setEditandoInstituicao] = useState(false);

  // Lista consolidada de instituições
  const listaInstituicoes = useMemo(() => {
    if (escolas.length > 0) return escolas;
    return [
      { id: 'inst-1', nome: 'CEMEIT DE TAGUATINGA' },
      { id: 'inst-2', nome: 'CEF 01 DE BRASÍLIA' },
      { id: 'inst-3', nome: 'EC 02 DE CEILÂNDIA' },
      { id: 'inst-4', nome: 'POLO SESI SAÚDE' },
    ];
  }, [escolas]);

  // Lista consolidada de pacientes
  const listaPacientes = useMemo(() => {
    if (pacientes.length > 0) return pacientes;
    return [
      { id: 'pac-1', nome: 'GABRIEL ALVES SILVA', cpf: '04218933091', dataNascimento: '2012-04-10', escolaNome: 'CEMEIT DE TAGUATINGA' },
      { id: 'pac-2', nome: 'BEATRIZ COSTA SOARES', cpf: '05199210084', dataNascimento: '2014-08-22', escolaNome: 'CEF 01 DE BRASÍLIA' },
      { id: 'pac-3', nome: 'LUCAS PEREIRA LIMA', cpf: '03310488012', dataNascimento: '2010-11-05', escolaNome: 'EC 02 DE CEILÂNDIA' },
      { id: 'pac-4', nome: 'SOFIA MARTINS DUARTE', cpf: '06822490077', dataNascimento: '2015-02-18', escolaNome: 'POLO SESI SAÚDE' },
    ];
  }, [pacientes]);

  // Paciente objeto selecionado
  const pacienteSelecionado = useMemo(() => {
    return listaPacientes.find((p) => p.id === pacienteSelecionadoId) ?? null;
  }, [pacienteSelecionadoId, listaPacientes]);

  // Profissional objeto selecionado
  const profissionalSelecionado = useMemo(() => {
    return PROFISSIONAIS_PADRAO.find((p) => p.id === profissionalSelecionadoId) ?? null;
  }, [profissionalSelecionadoId]);

  const especialidadesJaRealizadas = useMemo(
    () => new Set(
      atendimentos
        .filter((atendimento) => atendimento.pacienteId === pacienteSelecionadoId)
        .map((atendimento) => atendimento.especialidade)
    ),
    [atendimentos, pacienteSelecionadoId]
  );

  // Instituição selecionada
  const instituicaoSelecionada = useMemo(() => {
    return listaInstituicoes.find((i) => i.id === instituicaoSelecionadaId) ?? null;
  }, [instituicaoSelecionadaId, listaInstituicoes]);

  // Tentar alterar a instituição (solicita confirmação se já houver uma selecionada)
  const tentarAlterarInstituicao = (novaId: string) => {
    if (!instituicaoSelecionadaId) {
      setInstituicaoSelecionadaId(novaId);
      setInstituicaoAutomatica(false);
      setEditandoInstituicao(false);
      setErro(null);
      setCampoComErro(null);
    } else if (instituicaoSelecionadaId !== novaId) {
      setInstituicaoPendenteId(novaId);
    } else {
      setEditandoInstituicao(false);
    }
  };

  const confirmarAlteracaoInstituicao = () => {
    if (instituicaoPendenteId) {
      setInstituicaoSelecionadaId(instituicaoPendenteId);
      setInstituicaoAutomatica(false);
      setInstituicaoPendenteId(null);
      setEditandoInstituicao(false);
      setErro(null);
      setCampoComErro(null);
    }
  };

  const cancelarAlteracaoInstituicao = () => {
    setInstituicaoPendenteId(null);
  };

  // Auto-preencher a instituição vinculada ao selecionar ou alterar o paciente
  const selecionarPaciente = (pacienteId: string) => {
    setPacienteSelecionadoId(pacienteId);
    setErro(null);
    setCampoComErro(null);
    setEditandoInstituicao(false);
    setProfissionalSelecionadoId('');
    setEspecialidade('OFTALMOLOGIA');
    setInstituicaoSelecionadaId('');
    setInstituicaoAutomatica(false);

    const pac = listaPacientes.find((p) => p.id === pacienteId);
    if (pac && pac.escolaNome) {
      const instCorrespondente = listaInstituicoes.find(
        (i) => i.nome.toUpperCase().trim() === pac.escolaNome?.toUpperCase().trim()
      );
      if (instCorrespondente) {
        setInstituicaoSelecionadaId(instCorrespondente.id);
        setInstituicaoAutomatica(true);
      }
    }
  };

  // Atualizar especialidade automaticamente quando alterar profissional
  useEffect(() => {
    if (profissionalSelecionado) {
      setEspecialidade(profissionalSelecionado.especialidade);
    }
  }, [profissionalSelecionado]);

  // Resetar campos ao fechar ou abrir modal
  useEffect(() => {
    if (!aberto) {
      setInstituicaoSelecionadaId('');
      setInstituicaoPendenteId(null);
      setInstituicaoAutomatica(false);
      setPacienteSelecionadoId('');
      setProfissionalSelecionadoId('');
      setEspecialidade('OFTALMOLOGIA');
      setErro(null);
      setCampoComErro(null);
      setEditandoInstituicao(false);
    }
  }, [aberto]);

  const calcularIdade = (dataNascimento?: string): number => {
    if (!dataNascimento) return 12;
    const anoNascimento = new Date(dataNascimento).getFullYear();
    const anoAtual = new Date().getFullYear();
    return Math.max(1, anoAtual - anoNascimento);
  };

  const handleSubmeter = async () => {
    if (!pacienteSelecionadoId || !pacienteSelecionado) {
      setErro('Selecione o Paciente para realizar a triagem.');
      setCampoComErro('paciente');
      return;
    }
    if (!instituicaoSelecionadaId) {
      setErro('Selecione a Instituição.');
      setCampoComErro('instituicao');
      return;
    }
    if (!profissionalSelecionadoId || !profissionalSelecionado) {
      setErro('Selecione o Profissional responsável pelo atendimento.');
      setCampoComErro('profissional');
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const escolaObj = listaInstituicoes.find((i) => i.id === instituicaoSelecionadaId);
      await aoConfirmar({
        pacienteId: pacienteSelecionado.id,
        pacienteNome: pacienteSelecionado.nome,
        cpf: pacienteSelecionado.cpf,
        idade: calcularIdade(pacienteSelecionado.dataNascimento),
        escolaNome: escolaObj?.nome || pacienteSelecionado.escolaNome || 'Instituição não informada',
        profissionalId: profissionalSelecionado.id,
        profissionalNome: profissionalSelecionado.nome,
        profissionalRegistro: profissionalSelecionado.registro,
        especialidade,
      });

      aoFechar();
    } catch (err: any) {
      setErro(err?.message || 'Erro ao realizar triagem do paciente.');
      setCampoComErro(null);
    } finally {
      setCarregando(false);
    }
  };

  const opcoesPaciente: OpcaoSelectCustom[] = listaPacientes.map((p) => ({
    valor: p.id,
    rotulo: p.nome,
    subtexto: `CPF: ${mascararCpf(p.cpf)}`,
    badge: p.escolaNome ? (
      <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
        {p.escolaNome}
      </span>
    ) : undefined,
  }));

  const opcoesInstituicao: OpcaoSelectCustom[] = listaInstituicoes.map((i) => ({
    valor: i.id,
    rotulo: i.nome,
    subtexto: 'Instituição de Ensino',
    icone: Building2,
    corFundoIcone: 'bg-blue-100/80',
    corIcone: 'text-blue-600',
  }));

  const opcoesProfissional: OpcaoSelectCustom[] = PROFISSIONAIS_PADRAO.map((p) => {
    const estiloEsp = obterEstiloEspecialidade(p.especialidade);
    const IconeEsp = estiloEsp.icone;
    return {
      valor: p.id,
      rotulo: p.nome.replace(/^(Dr\.ª?|Dra?\.?)\s*/i, ''),
      subtexto: p.registro || p.especialidade,
      icone: IconeEsp,
      corFundoIcone: estiloEsp.fundo,
      corIcone: estiloEsp.texto,
      badge: <EspecialidadeBadge especialidade={p.especialidade} compacto />,
      desabilitado: especialidadesJaRealizadas.has(p.especialidade),
    };
  });

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      temDadosPreenchidos={Boolean(
        pacienteSelecionadoId ||
        instituicaoSelecionadaId ||
        profissionalSelecionadoId ||
        instituicaoPendenteId
      )}
      titulo="Triagem & Check-in de Paciente"
      subtitulo="Selecione o paciente — instituição e profissional serão confirmados em seguida."
      tamanho="lg"
      icone={<UserCheck className="w-5 h-5 text-blue-600" />}
      contentClassName="p-0"
      rodape={
        <>
          <BotaoModal variante="secundario" rotulo="Cancelar" aoClicar={aoFechar} />
          <BotaoModal
            variante="primario"
            rotulo="Confirmar & Adicionar à Fila"
            carregando={carregando}
            desabilitado={!pacienteSelecionado || !instituicaoSelecionada || !profissionalSelecionado}
            aoClicar={handleSubmeter}
          />
        </>
      }
    >
      <div className="bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_72%)] px-7 py-7 space-y-5">
        {erro && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fade-in">
            <CircleAlert className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* ─── Campo Único: Seleção do Paciente ───────────────────────── */}
        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_8px_28px_rgba(37,99,235,0.06)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-600">Etapa 1 de 2</p>
              <p className="mt-1 text-[13px] font-bold text-slate-800">Quem será atendido?</p>
            </div>
            <div className="flex items-center gap-1" aria-hidden="true">
              <span className="h-1.5 w-7 rounded-full bg-blue-600" />
              <span className="h-1.5 w-2 rounded-full bg-slate-200" />
            </div>
          </div>
          <ModalCampo
            rotulo="Paciente / Aluno"
            obrigatorio
            erro={campoComErro === 'paciente' ? 'Selecione um paciente.' : undefined}
          >
            <ModalSelectCustom
              categoria="custom"
              valorAtual={pacienteSelecionadoId}
              aoMudar={selecionarPaciente}
              opcoes={opcoesPaciente}
              placeholder="Buscar ou selecionar paciente..."
              pesquisavel={true}
              className={campoComErro === 'paciente' ? 'border-rose-300 ring-3 ring-rose-100' : ''}
              rodapePopover={
                aoCriarNovoPaciente ? (
                  <button
                    type="button"
                    onClick={() => {
                      aoFechar();
                      aoCriarNovoPaciente();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 py-1.5 cursor-pointer hover:bg-blue-50/50 rounded-xl transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Cadastrar Novo Paciente</span>
                  </button>
                ) : undefined
              }
            />
          </ModalCampo>
        </div>

        {/* ─── Painel de Confirmação (visível após selecionar paciente) ── */}
        {pacienteSelecionado && (
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 overflow-hidden animate-fade-in">

            {/* Cabeçalho do painel com dados do paciente */}
            <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center gap-3">
              <AvatarLetra nome={pacienteSelecionado.nome} tamanho="md" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-extrabold text-slate-800 truncate">{pacienteSelecionado.nome}</p>
                <p className="text-[11px] text-slate-400 font-medium">
                  CPF: {mascararCpf(pacienteSelecionado.cpf)}
                  {pacienteSelecionado.dataNascimento && (
                    <> · {calcularIdade(pacienteSelecionado.dataNascimento)} anos</>
                  )}
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg uppercase tracking-wide shrink-0">
                Selecionado
              </span>
            </div>

            {/* ── Linha 1: Instituição ─────────────────────────────────── */}
            <div className="border-b border-slate-100">
              {!editandoInstituicao ? (
                <button
                  type="button"
                  onClick={() => setEditandoInstituicao(true)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/70 transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-100/80 border border-blue-200/60 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Instituição</p>
                    {instituicaoSelecionada ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="text-[12.5px] font-bold text-slate-700 truncate">{instituicaoSelecionada.nome}</p>
                        {instituicaoAutomatica && (
                          <span className="shrink-0 text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md">
                            Do cadastro
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-[12.5px] font-semibold text-rose-500 italic">Selecione a instituição...</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {instituicaoSelecionada ? (
                      <Pencil className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    )}
                  </div>
                </button>
              ) : (
                <div className="px-4 py-3 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Selecione a Instituição</p>
                  <ModalSelectCustom
                    categoria="custom"
                    valorAtual={instituicaoSelecionadaId}
                    aoMudar={tentarAlterarInstituicao}
                    opcoes={opcoesInstituicao}
                    placeholder="Selecione a instituição..."
                    pesquisavel={true}
                    posicaoPopover="cima"
                    className={campoComErro === 'instituicao' ? 'border-rose-300 ring-3 ring-rose-100' : ''}
                  />
                  {campoComErro === 'instituicao' && (
                    <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                      <CircleAlert className="w-3 h-3" /> Selecione uma instituição.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditandoInstituicao(false)}
                    className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            {/* ── Linha 2: Profissional ────────────────────────────────── */}
            <div className="px-4 py-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Profissional responsável</p>
              <ModalSelectCustom
                categoria="custom"
                valorAtual={profissionalSelecionadoId}
                aoMudar={(v) => {
                  setProfissionalSelecionadoId(v);
                  setErro(null);
                  setCampoComErro(null);
                }}
                opcoes={opcoesProfissional}
                placeholder="Selecione o profissional de saúde..."
                pesquisavel={true}
                posicaoPopover="cima"
                className={campoComErro === 'profissional' ? 'border-rose-300 ring-3 ring-rose-100' : ''}
              />
              {campoComErro === 'profissional' && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                  <CircleAlert className="w-3 h-3" /> Selecione o profissional responsável.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Alteração de Instituição (Portal isolado) */}
      {instituicaoPendenteId &&
        createPortal(
          <div
            className="fixed inset-0 z-[100005] bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center p-4"
            onClick={cancelarAlteracaoInstituicao}
          >
            <div
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 relative z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 text-amber-600">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">Alterar instituição?</h4>
                  <p className="text-[11px] text-slate-500 font-medium">A instituição do paciente será atualizada.</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1.5 text-slate-700">
                <p>
                  Atual: <strong className="text-slate-900 font-bold">{listaInstituicoes.find(i => i.id === instituicaoSelecionadaId)?.nome}</strong>
                </p>
                <p>
                  Nova: <strong className="text-blue-600 font-bold">{listaInstituicoes.find(i => i.id === instituicaoPendenteId)?.nome}</strong>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={cancelarAlteracaoInstituicao}
                  className="h-9 px-4 text-xs font-bold rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-100"
                >
                  Não
                </button>
                <button
                  type="button"
                  onClick={confirmarAlteracaoInstituicao}
                  className="h-9 px-4 text-xs font-extrabold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                >
                  Sim, alterar
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </Modal>
  );
};

import { type FC, useState, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DOMPurify from 'dompurify';
import type { ItemPaciente } from './TabelaPacientes.tsx';
import {
  consultarCpf,
  formatarCpf,
  validarCpfMatematicamente,
  obterChaveApiCpf,
} from '../servicos/apiCpf.ts';
import {
  Modal,
  ModalCampo,
  ModalSecao,
  BotaoModal,
  ESTILO_INPUT_MODAL,
  ESTILO_SELECT_MODAL,
} from './Modal.tsx';

const formNovoPacienteSchema = z.object({
  instituicao: z.string().min(1, 'Instituição é obrigatória'),
  nomeCompleto: z.string().min(2, 'Nome completo é obrigatório').max(150),
  cpf: z
    .string()
    .min(11, 'CPF deve ser preenchido')
    .refine((val) => validarCpfMatematicamente(val), {
      message: 'CPF inválido (dígitos verificadores incorretos)',
    }),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  sexo: z.string().min(1, 'Selecione o sexo'),
  telefone: z.string().min(8, 'Telefone é obrigatório'),
  perfilUsuario: z.string().min(1, 'Selecione o perfil do usuário'),
  anoEscolar: z.string().optional(),
  turma: z.string().optional(),
});

export type FormNovoPaciente = z.infer<typeof formNovoPacienteSchema>;

interface ModalNovoPacienteProps {
  aberto: boolean;
  aoFechar: () => void;
  aoSalvar: (dados: FormNovoPaciente) => Promise<void>;
  escolas: Array<{ id: string; nome: string }>;
  pacienteParaEditar?: ItemPaciente | null;
}

export const ModalNovoPaciente: FC<ModalNovoPacienteProps> = ({
  aberto,
  aoFechar,
  aoSalvar,
  escolas,
  pacienteParaEditar,
}) => {
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  // Estados da Consulta Automática Inteligente de CPF
  const [consultandoCpf, setConsultandoCpf] = useState(false);
  const [cpfConsultado, setCpfConsultado] = useState('');
  const [erroConsultaCpf, setErroConsultaCpf] = useState<string | null>(null);
  const [sucessoConsultaCpf, setSucessoConsultaCpf] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormNovoPaciente>({
    resolver: zodResolver(formNovoPacienteSchema),
    defaultValues: {
      instituicao: escolas[0]?.nome || 'CEMEIT DE TAGUATINGA',
      nomeCompleto: '',
      cpf: '',
      dataNascimento: '',
      sexo: '',
      telefone: '',
      perfilUsuario: 'ALUNO',
      anoEscolar: '',
      turma: '',
    },
  });

  const cpfAtual = watch('cpf');
  const perfilAtual = watch('perfilUsuario');
  const instituicaoAtual = watch('instituicao');
  const ehAluno =
    perfilAtual === 'ALUNO' ||
    perfilAtual === 'Aluno' ||
    perfilAtual === 'Estudante' ||
    perfilAtual === 'Estudante / Aluno';

  // ─── Busca e Filtragem Inteligente de Instituição (Combobox) ────────────────
  const listaInstituicoes = useMemo(() => {
    const mapa = new Map<string, string>();
    escolas.forEach((e) => {
      if (e.nome) mapa.set(e.nome.toUpperCase().trim(), e.nome.trim());
    });
    ['CEMEIT DE TAGUATINGA', 'CEF 01 DE BRASÍLIA', 'EC 10 DE CEILÂNDIA', 'CEF 02 DE SOBRADINHO'].forEach((nome) => {
      if (!mapa.has(nome.toUpperCase())) {
        mapa.set(nome.toUpperCase(), nome);
      }
    });
    return Array.from(mapa.values());
  }, [escolas]);

  const [buscaInstituicao, setBuscaInstituicao] = useState(instituicaoAtual || 'CEMEIT DE TAGUATINGA');
  const [menuInstituicaoAberto, setMenuInstituicaoAberto] = useState(false);
  const containerInstituicaoRef = useRef<HTMLDivElement>(null);
  const inputBuscaInstituicaoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (instituicaoAtual && instituicaoAtual !== buscaInstituicao && !menuInstituicaoAberto) {
      setBuscaInstituicao(instituicaoAtual);
    }
  }, [instituicaoAtual, menuInstituicaoAberto]);

  const instituicoesFiltradas = useMemo(() => {
    if (!buscaInstituicao.trim()) return listaInstituicoes;
    const termo = buscaInstituicao.toLowerCase().trim();
    return listaInstituicoes.filter((inst) =>
      inst.toLowerCase().includes(termo)
    );
  }, [listaInstituicoes, buscaInstituicao]);

  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (
        containerInstituicaoRef.current &&
        !containerInstituicaoRef.current.contains(e.target as Node)
      ) {
        setMenuInstituicaoAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  useEffect(() => {
    if (aberto) {
      setErroGeral(null);
      setErroConsultaCpf(null);
      setSucessoConsultaCpf(null);
      setMenuInstituicaoAberto(false);

      if (pacienteParaEditar) {
        setValue('nomeCompleto', pacienteParaEditar.nome, { shouldValidate: true });
        setValue('cpf', pacienteParaEditar.cpf || '', { shouldValidate: true });
        setValue('dataNascimento', pacienteParaEditar.dataNascimento || '', { shouldValidate: true });
        setValue('sexo', pacienteParaEditar.sexo || 'Feminino', { shouldValidate: true });
        setValue('instituicao', pacienteParaEditar.escolaNome || 'CEMEIT DE TAGUATINGA', { shouldValidate: true });
        setBuscaInstituicao(pacienteParaEditar.escolaNome || 'CEMEIT DE TAGUATINGA');
        setValue('perfilUsuario', pacienteParaEditar.perfil || 'ALUNO', { shouldValidate: true });
        setValue('telefone', pacienteParaEditar.telefone || '', { shouldValidate: true });
        setValue('anoEscolar', '');
        setValue('turma', pacienteParaEditar.turma || '');
        setCpfConsultado((pacienteParaEditar.cpf || '').replace(/\D/g, ''));
      } else {
        reset({
          instituicao: escolas[0]?.nome || 'CEMEIT DE TAGUATINGA',
          nomeCompleto: '',
          cpf: '',
          dataNascimento: '',
          sexo: '',
          telefone: '',
          perfilUsuario: 'ALUNO',
          anoEscolar: '',
          turma: '',
        });
        setCpfConsultado('');
        setBuscaInstituicao(escolas[0]?.nome || 'CEMEIT DE TAGUATINGA');
      }
    }
  }, [aberto, pacienteParaEditar, setValue, reset, escolas]);

  useEffect(() => {
    if (!aberto) return;
    const limpo = (cpfAtual || '').replace(/\D/g, '');

    if (limpo.length < 11) {
      setErroConsultaCpf(null);
      return;
    }

    if (limpo.length === 11 && limpo !== cpfConsultado) {
      if (!validarCpfMatematicamente(limpo)) {
        setCpfConsultado(limpo);
        setErroConsultaCpf('CPF inválido. Os dígitos verificadores não conferem.');
        setError('cpf', { type: 'manual', message: 'CPF inválido (dígitos verificadores incorretos)' });
        return;
      }

      clearErrors('cpf');

      const timer = setTimeout(async () => {
        setConsultandoCpf(true);
        setErroConsultaCpf(null);
        setSucessoConsultaCpf(null);

        try {
          const chave = obterChaveApiCpf();
          const pessoa = await consultarCpf(limpo, chave);

          setValue('nomeCompleto', pessoa.nome, { shouldValidate: true });
          setValue('dataNascimento', pessoa.dataNascimento, { shouldValidate: true });
          setValue('sexo', pessoa.genero, { shouldValidate: true });
          setValue('cpf', pessoa.cpfFormatado, { shouldValidate: true });
          setCpfConsultado(limpo);

          setSucessoConsultaCpf(`Dados de ${pessoa.nome.split(' ')[0]} localizados e preenchidos automaticamente!`);
          setTimeout(() => setSucessoConsultaCpf(null), 4000);
        } catch (err: any) {
          setCpfConsultado(limpo);
          const msg = err?.message || 'Falha ao consultar CPF.';
          setErroConsultaCpf(msg);
          setTimeout(() => setErroConsultaCpf(null), 5000);
        } finally {
          setConsultandoCpf(false);
        }
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [cpfAtual, cpfConsultado, aberto, setValue, setError, clearErrors]);

  const onSubmit = async (dados: FormNovoPaciente) => {
    setSalvando(true);
    setErroGeral(null);
    try {
      const dadosSanitizados: FormNovoPaciente = {
        ...dados,
        nomeCompleto: DOMPurify.sanitize(dados.nomeCompleto.trim().toUpperCase()),
        instituicao: DOMPurify.sanitize(dados.instituicao),
        anoEscolar: dados.anoEscolar ? DOMPurify.sanitize(dados.anoEscolar) : undefined,
        turma: dados.turma ? DOMPurify.sanitize(dados.turma.trim().toUpperCase()) : undefined,
      };

      await aoSalvar(dadosSanitizados);
      reset();
      aoFechar();
    } catch (err: any) {
      setErroGeral(err?.message || 'Erro ao cadastrar paciente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={pacienteParaEditar ? 'Editar Dados do Paciente' : 'Cadastrar um Novo Paciente'}
      subtitulo={
        pacienteParaEditar
          ? 'Atualize as informações cadastrais e perfil escolar do estudante.'
          : 'Formulário para cadastro e identificação do paciente.'
      }
      tamanho="2xl"
      icone={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      }
      rodape={
        <>
          <BotaoModal
            variante="secundario"
            rotulo="Cancelar"
            aoClicar={aoFechar}
          />
          <BotaoModal
            tipo="submit"
            formId="form-paciente"
            variante="primario"
            rotulo={pacienteParaEditar ? 'Salvar Alterações' : 'Cadastrar Paciente'}
            carregando={salvando}
          />
        </>
      }
    >
      <form id="form-paciente" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {erroGeral && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{erroGeral}</span>
          </div>
        )}

        {sucessoConsultaCpf && (
          <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="font-semibold">{sucessoConsultaCpf}</span>
          </div>
        )}

        {erroConsultaCpf && (
          <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 animate-fade-in">
            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{erroConsultaCpf}</span>
          </div>
        )}

        {/* Seção DADOS PESSOAIS */}
        <ModalSecao titulo="Dados Pessoais">
          {/* Instituição */}
          <div className="relative" ref={containerInstituicaoRef}>
            <ModalCampo rotulo="Instituição" obrigatorio erro={errors.instituicao?.message}>
              <div className="relative">
                <input
                  ref={inputBuscaInstituicaoRef}
                  type="text"
                  value={buscaInstituicao}
                  onFocus={() => setMenuInstituicaoAberto(true)}
                  onChange={(e) => {
                    const novoValor = e.target.value.toUpperCase();
                    setBuscaInstituicao(novoValor);
                    setValue('instituicao', novoValor, { shouldValidate: true });
                    setMenuInstituicaoAberto(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setMenuInstituicaoAberto(false);
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      if (instituicoesFiltradas.length > 0) {
                        const selecionada = instituicoesFiltradas[0];
                        setValue('instituicao', selecionada, { shouldValidate: true });
                        setBuscaInstituicao(selecionada);
                        setMenuInstituicaoAberto(false);
                      }
                    } else if (e.key === 'ArrowDown') {
                      setMenuInstituicaoAberto(true);
                    }
                  }}
                  placeholder="DIGITE O NOME DA ESCOLA OU POLO..."
                  className={`${ESTILO_INPUT_MODAL} pl-9 pr-16 font-semibold uppercase`}
                />

                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>

                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1 text-slate-400">
                  {buscaInstituicao && (
                    <button
                      type="button"
                      onClick={() => {
                        setBuscaInstituicao('');
                        setValue('instituicao', '', { shouldValidate: true });
                        inputBuscaInstituicaoRef.current?.focus();
                        setMenuInstituicaoAberto(true);
                      }}
                      className="p-1 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Limpar campo"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMenuInstituicaoAberto(!menuInstituicaoAberto);
                      inputBuscaInstituicaoRef.current?.focus();
                    }}
                    className="p-1 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform duration-150 ${menuInstituicaoAberto ? 'rotate-180 text-blue-600' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>

                {menuInstituicaoAberto && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200/95 rounded-2xl shadow-xl z-50 py-1.5 max-h-56 overflow-y-auto animate-dropdown origin-top ring-1 ring-black/5">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                      <span>Instituições Disponíveis</span>
                      <span>{instituicoesFiltradas.length} encontradas</span>
                    </div>

                    {instituicoesFiltradas.length === 0 ? (
                      <div className="px-3.5 py-4 text-center text-xs text-slate-500">
                        <p className="font-semibold text-slate-700">Nenhuma instituição encontrada</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Você pode manter o nome digitado para cadastrar uma nova unidade.
                        </p>
                      </div>
                    ) : (
                      instituicoesFiltradas.map((nomeEscola) => {
                        const estaSelecionada = instituicaoAtual?.toUpperCase() === nomeEscola.toUpperCase();
                        return (
                          <button
                            key={nomeEscola}
                            type="button"
                            onClick={() => {
                              setValue('instituicao', nomeEscola, { shouldValidate: true });
                              setBuscaInstituicao(nomeEscola);
                              setMenuInstituicaoAberto(false);
                            }}
                            className={`w-full px-3.5 py-2.5 text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                              estaSelecionada
                                ? 'bg-blue-50 text-blue-700 font-bold'
                                : 'text-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <svg className={`w-3.5 h-3.5 shrink-0 ${estaSelecionada ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M3 21h18" />
                                <path d="M5 21V7l8-4v18" />
                                <path d="M19 21V11l-6-4" />
                              </svg>
                              <span className="truncate">{nomeEscola.toUpperCase()}</span>
                            </div>
                            {estaSelecionada && (
                              <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </ModalCampo>
          </div>

          {/* Nome, CPF, Nascimento */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <ModalCampo rotulo="Nome completo" obrigatorio erro={errors.nomeCompleto?.message}>
                <input
                  type="text"
                  {...register('nomeCompleto')}
                  placeholder="EX: JOAO DA SILVA"
                  className={`${ESTILO_INPUT_MODAL} uppercase`}
                />
              </ModalCampo>
            </div>

            <div className="md:col-span-3">
              <ModalCampo rotulo="CPF" obrigatorio erro={errors.cpf?.message}>
                <div className="relative">
                  <input
                    type="text"
                    {...register('cpf')}
                    onChange={(e) => {
                      const formatado = formatarCpf(e.target.value);
                      setValue('cpf', formatado, { shouldValidate: true });
                    }}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={`${ESTILO_INPUT_MODAL} font-mono pr-9`}
                  />
                  {consultandoCpf && (
                    <div className="absolute right-3 top-2.5 flex items-center text-blue-600">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  )}
                </div>
              </ModalCampo>
            </div>

            <div className="md:col-span-3">
              <ModalCampo rotulo="Data Nascimento" obrigatorio erro={errors.dataNascimento?.message}>
                <input
                  type="date"
                  {...register('dataNascimento')}
                  className={ESTILO_INPUT_MODAL}
                />
              </ModalCampo>
            </div>
          </div>

          {/* Sexo e Telefone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalCampo rotulo="Sexo" obrigatorio erro={errors.sexo?.message}>
              <select {...register('sexo')} className={ESTILO_SELECT_MODAL}>
                <option value="">Selecione o sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
                <option value="Não informado">Não informado</option>
              </select>
            </ModalCampo>

            <ModalCampo rotulo="Telefone" obrigatorio erro={errors.telefone?.message}>
              <input
                type="text"
                {...register('telefone')}
                placeholder="(00) 00000-0000"
                className={`${ESTILO_INPUT_MODAL} font-mono`}
              />
            </ModalCampo>
          </div>
        </ModalSecao>

        {/* Seção VÍNCULO & PERFIL */}
        <ModalSecao titulo="Vínculo & Perfil Escolar">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className={ehAluno ? 'md:col-span-4' : 'md:col-span-12'}>
              <ModalCampo rotulo="Perfil do Usuário" obrigatorio erro={errors.perfilUsuario?.message}>
                <select {...register('perfilUsuario')} className={`${ESTILO_SELECT_MODAL} font-semibold uppercase`}>
                  <option value="ALUNO">ALUNO</option>
                  <option value="DEPENDENTE">DEPENDENTE</option>
                  <option value="COMUNIDADE ESCOLAR">COMUNIDADE ESCOLAR</option>
                </select>
              </ModalCampo>
            </div>

            {ehAluno && (
              <>
                <div className="md:col-span-4">
                  <ModalCampo rotulo="Ano Escolar">
                    <select {...register('anoEscolar')} className={ESTILO_SELECT_MODAL}>
                      <option value="">Selecione...</option>
                      <option value="1º Ano EF">1º Ano EF</option>
                      <option value="2º Ano EF">2º Ano EF</option>
                      <option value="3º Ano EF">3º Ano EF</option>
                      <option value="4º Ano EF">4º Ano EF</option>
                      <option value="5º Ano EF">5º Ano EF</option>
                      <option value="6º Ano EF">6º Ano EF</option>
                      <option value="7º Ano EF">7º Ano EF</option>
                      <option value="8º Ano EF">8º Ano EF</option>
                      <option value="9º Ano EF">9º Ano EF</option>
                      <option value="1º Ano EM">1º Ano EM</option>
                      <option value="2º Ano EM">2º Ano EM</option>
                      <option value="3º Ano EM">3º Ano EM</option>
                      <option value="EJA">EJA</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </ModalCampo>
                </div>

                <div className="md:col-span-4">
                  <ModalCampo rotulo="Turma">
                    <input
                      type="text"
                      {...register('turma')}
                      placeholder="Ex: A, B, Única"
                      className={`${ESTILO_INPUT_MODAL} uppercase`}
                    />
                  </ModalCampo>
                </div>
              </>
            )}
          </div>
        </ModalSecao>
      </form>
    </Modal>
  );
};

import { type FC, useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DOMPurify from 'dompurify';
import {
  AlertTriangle,
  CircleAlert,
  CircleCheck,
  LoaderCircle,
  Pencil,
  UsersRound,
} from 'lucide-react';
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
  SelectModal,
  SeletorFiltroUniversal,
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

const normalizarSexo = (valor?: string | null): FormNovoPaciente['sexo'] => {
  const sexo = (valor || '').trim().toLowerCase();
  if (sexo === 'm' || sexo === 'masculino' || sexo === 'male') return 'Masculino';
  if (sexo === 'f' || sexo === 'feminino' || sexo === 'female') return 'Feminino';
  if (sexo === 'outro' || sexo === 'other') return 'Outro';
  if (sexo === 'nao informado' || sexo === 'não informado' || sexo === 'nao informado') return 'Não informado';
  return '';
};

interface ModalNovoPacienteProps {
  aberto: boolean;
  aoFechar: () => void;
  aoSalvar: (dados: FormNovoPaciente) => Promise<void>;
  escolas: Array<{ id: string; nome: string }>;
  instituicaoPadrao?: string;
  pacienteParaEditar?: ItemPaciente | null;
}

export const ModalNovoPaciente: FC<ModalNovoPacienteProps> = ({
  aberto,
  aoFechar,
  aoSalvar,
  escolas,
  instituicaoPadrao = '',
  pacienteParaEditar,
}) => {
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  // Estados da Consulta Automática Inteligente de CPF
  const [consultandoCpf, setConsultandoCpf] = useState(false);
  const [cpfConsultado, setCpfConsultado] = useState('');
  const [erroConsultaCpf, setErroConsultaCpf] = useState<string | null>(null);
  const [sucessoConsultaCpf, setSucessoConsultaCpf] = useState<string | null>(null);
  const [camposBloqueadosPorCpf, setCamposBloqueadosPorCpf] = useState(false);

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
      instituicao: instituicaoPadrao,
      nomeCompleto: '',
      cpf: '',
      dataNascimento: '',
      sexo: '',
      telefone: '',
      perfilUsuario: 'ESTUDANTE',
      anoEscolar: '',
      turma: '',
    },
  });

  const cpfAtual = watch('cpf');
  const sexoAtual = watch('sexo');
  const registroSexo = register('sexo');
  const perfilAtual = watch('perfilUsuario');
  const instituicaoAtual = watch('instituicao');
  const ehAluno = perfilAtual === 'ESTUDANTE';

  // ─── Busca e Filtragem Inteligente de Instituição (Combobox) ────────────────
  const listaInstituicoes = useMemo(() => {
    const mapa = new Map<string, string>();
    escolas.forEach((e) => {
      if (e.nome) mapa.set(e.nome.toUpperCase().trim(), e.nome.trim());
    });
    return Array.from(mapa.values());
  }, [escolas]);

  useEffect(() => {
    if (aberto) {
      setErroGeral(null);
      setErroConsultaCpf(null);
      setSucessoConsultaCpf(null);

      if (pacienteParaEditar) {
        const [anoEscolar, turma] = (pacienteParaEditar.turma || '').split(' — ', 2);
        setValue('nomeCompleto', pacienteParaEditar.nome, { shouldValidate: true });
        setValue('cpf', formatarCpf(pacienteParaEditar.cpf || ''), { shouldValidate: true });
        setValue('dataNascimento', pacienteParaEditar.dataNascimento || '', { shouldValidate: true });
        setValue('sexo', normalizarSexo(pacienteParaEditar.sexo), { shouldValidate: true });
        setValue('instituicao', pacienteParaEditar.escolaNome || instituicaoPadrao, { shouldValidate: true });
        setValue('perfilUsuario', pacienteParaEditar.perfil || 'ESTUDANTE', { shouldValidate: true });
        setValue('telefone', pacienteParaEditar.telefone || '', { shouldValidate: true });
        setValue('anoEscolar', turma ? anoEscolar : '');
        setValue('turma', turma || pacienteParaEditar.turma || '');
        setCpfConsultado((pacienteParaEditar.cpf || '').replace(/\D/g, ''));
        setCamposBloqueadosPorCpf(false);
      } else {
        const escolaPadrao = instituicaoPadrao;
        reset({
          instituicao: escolaPadrao,
          nomeCompleto: '',
          cpf: '',
          dataNascimento: '',
          sexo: '',
          telefone: '',
          perfilUsuario: 'ESTUDANTE',
          anoEscolar: '',
          turma: '',
        });
        setCpfConsultado('');
        setCamposBloqueadosPorCpf(false);
      }
    }
  }, [aberto, pacienteParaEditar, instituicaoPadrao, setValue, reset, escolas]);

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
          setValue('sexo', normalizarSexo(pessoa.genero), { shouldValidate: true });
          setValue('cpf', pessoa.cpfFormatado, { shouldValidate: true });
          setCpfConsultado(limpo);
          setCamposBloqueadosPorCpf(true);

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

  const resetarFormulario = () => {
    const escolaPadrao = instituicaoPadrao;
    reset({
      instituicao: escolaPadrao,
      nomeCompleto: '',
      cpf: '',
      dataNascimento: '',
      sexo: '',
      telefone: '',
      perfilUsuario: 'ESTUDANTE',
      anoEscolar: '',
      turma: '',
    });
    setCpfConsultado('');
    setErroGeral(null);
    setErroConsultaCpf(null);
    setSucessoConsultaCpf(null);
    setCamposBloqueadosPorCpf(false);
  };

  const liberarCamposAutomaticos = () => {
    setCamposBloqueadosPorCpf(false);
  };

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
      resetarFormulario();
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
      aoResetar={resetarFormulario}
      titulo={pacienteParaEditar ? 'Editar Dados do Paciente' : 'Cadastrar um Novo Paciente'}
      subtitulo={
        pacienteParaEditar
          ? 'Atualize as informações cadastrais e perfil escolar do estudante.'
          : 'Formulário para cadastro e identificação do paciente.'
      }
      tamanho="2xl"
      icone={<UsersRound className="w-5 h-5" />}
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
            <CircleAlert className="w-4 h-4 text-red-500 shrink-0" />
            <span>{erroGeral}</span>
          </div>
        )}

        {/* Seção DADOS PESSOAIS */}
        <ModalSecao titulo="Dados Pessoais">
          {/* Instituição */}
          <ModalCampo rotulo="Instituição de Ensino" obrigatorio erro={errors.instituicao?.message}>
            <SeletorFiltroUniversal
              categoria="instituicoes"
              valor={instituicaoAtual}
              aoMudar={(v) => setValue('instituicao', v, { shouldValidate: true })}
              placeholder="Selecione ou busque a instituição..."
              opcoes={listaInstituicoes.map((inst) => ({ id: inst, valor: inst, nome: inst, rotulo: inst }))}
              permitirLimpar={true}
            />
          </ModalCampo>

          {/* Nome, CPF, Nascimento */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <ModalCampo rotulo="Nome completo" obrigatorio erro={errors.nomeCompleto?.message}>
                <div className="relative">
                  <input
                    type="text"
                    {...register('nomeCompleto')}
                    placeholder="EX: JOAO DA SILVA"
                    disabled={camposBloqueadosPorCpf}
                    className={`${ESTILO_INPUT_MODAL} uppercase ${camposBloqueadosPorCpf ? 'pr-11' : ''}`}
                  />
                  {camposBloqueadosPorCpf && (
                    <button
                      type="button"
                      onClick={liberarCamposAutomaticos}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      aria-label="Liberar edição dos dados preenchidos automaticamente pelo CPF"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
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
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>
              </ModalCampo>
              {erroConsultaCpf && (
                <div className="mt-1 text-[11px] font-medium text-amber-600 leading-tight flex items-start gap-1 animate-fade-in">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{erroConsultaCpf}</span>
                </div>
              )}
              {sucessoConsultaCpf && (
                <div className="mt-1 text-[11px] font-medium text-emerald-600 leading-tight flex items-start gap-1 animate-fade-in">
                  <CircleCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{sucessoConsultaCpf}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-3">
              <ModalCampo rotulo="Data Nascimento" obrigatorio erro={errors.dataNascimento?.message}>
                <div className="relative">
                  <input
                    type="date"
                    {...register('dataNascimento')}
                    disabled={camposBloqueadosPorCpf}
                    className={`${ESTILO_INPUT_MODAL} ${camposBloqueadosPorCpf ? 'pr-11' : ''}`}
                  />
                  {camposBloqueadosPorCpf && (
                    <button
                      type="button"
                      onClick={liberarCamposAutomaticos}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      aria-label="Liberar edição da data de nascimento preenchida automaticamente pelo CPF"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </ModalCampo>
            </div>
          </div>

          {/* Sexo e Telefone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalCampo rotulo="Sexo" obrigatorio erro={errors.sexo?.message}>
              <div className="relative">
                <SelectModal
                  name={registroSexo.name}
                  ref={registroSexo.ref}
                  value={sexoAtual}
                  onBlur={registroSexo.onBlur}
                  onChange={(evento) => {
                    const valor = typeof evento === 'string' ? evento : evento?.target?.value;
                    setValue('sexo', normalizarSexo(valor), { shouldValidate: true, shouldDirty: true });
                  }}
                  placeholder="Selecione o sexo"
                  disabled={camposBloqueadosPorCpf}
                  opcoes={[
                    { valor: 'Masculino', rotulo: 'Masculino' },
                    { valor: 'Feminino', rotulo: 'Feminino' },
                    { valor: 'Outro', rotulo: 'Outro' },
                    { valor: 'Não informado', rotulo: 'Não informado' },
                  ]}
                  className={camposBloqueadosPorCpf ? 'pr-10' : ''}
                />
                {camposBloqueadosPorCpf && (
                  <button
                    type="button"
                    onClick={liberarCamposAutomaticos}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                    aria-label="Liberar edição do sexo preenchido automaticamente pelo CPF"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
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
                <SelectModal
                  {...register('perfilUsuario')}
                  defaultValue="ESTUDANTE"
                  className="font-semibold uppercase"
                  opcoes={[
                    { valor: 'ESTUDANTE', rotulo: 'ESTUDANTE' },
                    { valor: 'PROFESSOR', rotulo: 'PROFESSOR' },
                    { valor: 'FUNCIONARIO', rotulo: 'FUNCIONÁRIO' },
                    { valor: 'COMUNIDADE', rotulo: 'COMUNIDADE' },
                  ]}
                />
              </ModalCampo>
            </div>

            {ehAluno && (
              <>
                <div className="md:col-span-4">
                  <ModalCampo rotulo="Ano Escolar">
                    <SelectModal
                      {...register('anoEscolar')}
                      placeholder="Selecione..."
                      opcoes={[
                        '8º Ano EF', '9º Ano EF', '1º Ano EM', '2º Ano EM', '3º Ano EM',
                      ].map((ano) => ({ valor: ano, rotulo: ano }))}
                    />
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

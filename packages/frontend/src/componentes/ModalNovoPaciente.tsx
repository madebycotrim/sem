import { type FC, useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
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
    // Garantir polos oficiais padrão sem duplicidade
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

  // Sincronizar busca se o valor mudar externamente
  useEffect(() => {
    if (instituicaoAtual && instituicaoAtual !== buscaInstituicao && !menuInstituicaoAberto) {
      setBuscaInstituicao(instituicaoAtual);
    }
  }, [instituicaoAtual, menuInstituicaoAberto]);

  // Lista de instituições filtradas pelo texto digitado
  const instituicoesFiltradas = useMemo(() => {
    if (!buscaInstituicao.trim()) return listaInstituicoes;
    const termo = buscaInstituicao.toLowerCase().trim();
    return listaInstituicoes.filter((inst) =>
      inst.toLowerCase().includes(termo)
    );
  }, [listaInstituicoes, buscaInstituicao]);

  // Fechar dropdown ao clicar fora
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

  // Reset e inicialização ao abrir modal (criação ou edição)
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

  // Consulta automática inteligente com debounce quando o CPF estiver completo (11 dígitos)
  useEffect(() => {
    if (!aberto) return;
    const limpo = (cpfAtual || '').replace(/\D/g, '');

    // Se ainda não tem 11 dígitos, limpa eventuais erros de digito verificador
    if (limpo.length < 11) {
      setErroConsultaCpf(null);
      return;
    }

    if (limpo.length === 11 && limpo !== cpfConsultado) {
      // 1. Verificação matemática prévia — previne gasto desnecessário de cota da API
      if (!validarCpfMatematicamente(limpo)) {
        setCpfConsultado(limpo);
        setErroConsultaCpf('CPF inválido. Os dígitos verificadores não conferem.');
        setError('cpf', { type: 'manual', message: 'CPF inválido (dígitos verificadores incorretos)' });
        return;
      }

      // CPF matematicamente válido: limpa erros e inicia debounce para consulta na API
      clearErrors('cpf');
      const timer = setTimeout(async () => {
        setConsultandoCpf(true);
        setErroConsultaCpf(null);
        setSucessoConsultaCpf(null);

        try {
          const chave = obterChaveApiCpf();
          const pessoa = await consultarCpf(limpo, chave);

          // Preenchimento automático com dados oficiais retornados
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

  if (!aberto) return null;

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

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-200 ease-out font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-paciente"
      onClick={(e) => {
        if (e.target === e.currentTarget) aoFechar();
      }}
    >
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-modal max-h-[92vh] overflow-y-auto">
        {/* Cabeçalho do Modal */}
        <div className="flex items-start justify-between px-6 pt-6 pb-2">
          <div>
            <h2 id="titulo-modal-paciente" className="text-xl font-bold text-[#0b2545] font-sans">
              {pacienteParaEditar ? 'Editar Dados do Paciente' : 'Cadastrar um Novo Paciente'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {pacienteParaEditar
                ? 'Atualize as informações cadastrais e perfil escolar do estudante.'
                : 'Formulário para cadastro e identificação do paciente.'}
            </p>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            className="p-1.5 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Fechar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Formulário com Design Padronizado */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4 text-xs">
          {erroGeral && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{erroGeral}</span>
            </div>
          )}

          {/* Feedback de Sucesso da Consulta */}
          {sucessoConsultaCpf && (
            <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="font-semibold">{sucessoConsultaCpf}</span>
            </div>
          )}

          {/* Feedback de Erro da Consulta */}
          {erroConsultaCpf && (
            <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 animate-fade-in">
              <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{erroConsultaCpf}</span>
            </div>
          )}

          {/* Seção DADOS PESSOAIS */}
          <div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3.5 pb-1.5 border-b border-slate-100">
              Dados Pessoais
            </div>

            {/* Linha 1: INSTITUIÇÃO * (Combobox com Busca Digitável Inteligente) */}
            <div className="mb-3.5 relative" ref={containerInstituicaoRef}>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>
                  INSTITUIÇÃO <span className="text-red-500">*</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal normal-case">
                  Digite para filtrar instituições
                </span>
              </label>

              <div className="relative">
                {/* Input de Busca Digitável */}
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
                  className={`w-full pl-9 pr-16 py-2.5 bg-white border rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 uppercase placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs ${
                    errors.instituicao ? 'border-red-400' : 'border-slate-200'
                  }`}
                />

                {/* Ícone de Busca / Lupa à Esquerda */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>

                {/* Botões de Ação à Direita: Limpar (X) e Abrir/Fechar Chevron */}
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
                      className="p-1 hover:text-slate-600 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
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
                    className="p-1 hover:text-blue-600 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
                    title={menuInstituicaoAberto ? 'Fechar lista' : 'Ver todas as instituições'}
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

                {/* Dropdown de Opções Filtradas */}
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
              {errors.instituicao && <p className="text-[11px] text-red-600 mt-1">{errors.instituicao.message}</p>}
            </div>

            {/* Linha 2: NOME COMPLETO | CPF (Com Consulta Automática) | DATA NASCIMENTO */}
            <div className="flex flex-col sm:flex-row gap-3.5 mb-3.5">
              {/* Nome Completo do Estudante */}
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  NOME COMPLETO <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('nomeCompleto')}
                  placeholder="EX: JOAO DA SILVA"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-2xl text-xs sm:text-sm text-slate-800 uppercase placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs ${
                    errors.nomeCompleto ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {errors.nomeCompleto && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.nomeCompleto.message}</p>
                )}
              </div>

              {/* CPF */}
              <div className="w-full sm:w-[175px] shrink-0">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  CPF <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    {...register('cpf')}
                    onChange={(e) => {
                      const formatado = formatarCpf(e.target.value);
                      setValue('cpf', formatado, { shouldValidate: true });
                    }}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={`w-full pl-3.5 pr-10 py-2.5 bg-white border rounded-2xl text-xs sm:text-sm font-mono text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs ${
                      errors.cpf ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                  {consultandoCpf && (
                    <div className="absolute right-3 flex items-center pointer-events-none text-blue-600 animate-fade-in" title="Consultando API CPF...">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  )}
                </div>
                {errors.cpf && <p className="text-[11px] text-red-600 mt-1">{errors.cpf.message}</p>}
              </div>

              {/* Data de Nascimento */}
              <div className="w-full sm:w-[152px] shrink-0">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 whitespace-nowrap">
                  DATA NASCIMENTO <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('dataNascimento')}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-2xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs ${
                    errors.dataNascimento ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {errors.dataNascimento && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.dataNascimento.message}</p>
                )}
              </div>
            </div>


            {/* Linha 3: SEXO | TELEFONE (2 Colunas 50/50) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              <div className="md:col-span-6">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  SEXO <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    {...register('sexo')}
                    className={`w-full appearance-none px-3.5 py-2.5 bg-white border rounded-2xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer shadow-2xs ${
                      errors.sexo ? 'border-red-400' : 'border-slate-200'
                    }`}
                  >
                    <option value="">Selecione o sexo</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                    <option value="Não informado">Não informado</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
                {errors.sexo && <p className="text-[11px] text-red-600 mt-1">{errors.sexo.message}</p>}
              </div>

              <div className="md:col-span-6">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  TELEFONE <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('telefone')}
                  placeholder="(00) 00000-0000"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-2xl text-xs sm:text-sm font-mono text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs ${
                    errors.telefone ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {errors.telefone && <p className="text-[11px] text-red-600 mt-1">{errors.telefone.message}</p>}
              </div>
            </div>
          </div>

          {/* Linha Separadora */}
          <div className="border-t border-slate-100 pt-2" />

          {/* Seção PERFIL DO USUÁRIO & DADOS ESCOLARES (Quando Aluno) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 animate-fade-in">
            {/* Perfil do Usuário */}
            <div className={ehAluno ? 'md:col-span-4' : 'md:col-span-12'}>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                PERFIL DO USUÁRIO <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  {...register('perfilUsuario')}
                  className={`w-full appearance-none px-3.5 py-2.5 bg-white border rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 uppercase focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer shadow-2xs ${
                    errors.perfilUsuario ? 'border-red-400' : 'border-slate-200'
                  }`}
                >
                  <option value="ALUNO">ALUNO</option>
                  <option value="DEPENDENTE">DEPENDENTE</option>
                  <option value="COMUNIDADE ESCOLAR">COMUNIDADE ESCOLAR</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
              {errors.perfilUsuario && (
                <p className="text-[11px] text-red-600 mt-1">{errors.perfilUsuario.message}</p>
              )}
            </div>

            {/* Inputs condicionais que aparecem quando for ALUNO */}
            {ehAluno && (
              <>
                {/* Ano Escolar */}
                <div className="md:col-span-4 animate-fade-in">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    ANO ESCOLAR
                  </label>
                  <div className="relative">
                    <select
                      {...register('anoEscolar')}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
                    >
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
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Turma */}
                <div className="md:col-span-4 animate-fade-in">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    TURMA
                  </label>
                  <input
                    type="text"
                    {...register('turma')}
                    placeholder="Ex: A, B, Única"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 uppercase placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs"
                  />
                </div>
              </>
            )}
          </div>

          {/* Rodapé de Botões Padronizado */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={aoFechar}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer shadow-2xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-2xl shadow-xs hover:shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {salvando ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Salvando...</span>
                </>
              ) : (
                <span>{pacienteParaEditar ? 'Salvar Alterações' : 'Cadastrar Paciente'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};



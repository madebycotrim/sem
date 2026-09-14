import { type FC, useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DOMPurify from 'dompurify';
import { CircleAlert, UserPlus, Sparkles, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { 
  PerfilAcesso, 
  PERFIL_ACESSO_LABELS,
  ConselhoProfissional,
  CONSELHO_PROFISSIONAL_LABELS,
  ESPECIALIDADE_LABELS
} from '../../compartilhado/index.ts';
import {
  Modal,
  ModalCampo,
  ModalSecao,
  BotaoModal,
  ESTILO_INPUT_MODAL,
  ModalSelectCustom,
  type OpcaoSelectCustom,
} from './Modal.tsx';
import type { UsuarioItem } from './Usuarios.tsx';
import { EspecialidadeIcone } from './EspecialidadeVisual.tsx';
import { usePermissoes } from '../contextos/ContextoPermissoes.tsx';
import { gerarSenhaTemporariaSegura, REGEX_SENHA_SEGURA } from '../utilitarios/geradorSenha.ts';

const OPCOES_PERFIL: OpcaoSelectCustom[] = [
  { valor: PerfilAcesso.ADMIN, rotulo: PERFIL_ACESSO_LABELS[PerfilAcesso.ADMIN] },
  { valor: PerfilAcesso.PROFISSIONAL_SAUDE, rotulo: PERFIL_ACESSO_LABELS[PerfilAcesso.PROFISSIONAL_SAUDE] },
  { valor: PerfilAcesso.TRIAGEM_RECEPCAO, rotulo: PERFIL_ACESSO_LABELS[PerfilAcesso.TRIAGEM_RECEPCAO] },
  { valor: PerfilAcesso.DPO, rotulo: PERFIL_ACESSO_LABELS[PerfilAcesso.DPO] },
];

const OPCOES_CONSELHO: OpcaoSelectCustom[] = Object.entries(CONSELHO_PROFISSIONAL_LABELS).map(([valor, rotulo]) => {
  return { valor, rotulo };
});

const OPCOES_ESPECIALIDADE: OpcaoSelectCustom[] = Object.entries(ESPECIALIDADE_LABELS).map(([valor, rotulo]) => {
  const icone = <EspecialidadeIcone especialidade={valor} className="h-4.5 w-4.5" />;
  return { valor, rotulo, icone };
});

const formNovoUsuarioSchema = z
  .object({
    nomeCompleto: z.string().min(3, 'Nome completo deve ter pelo menos 3 caracteres').max(150),
    email: z.string().email('E-mail inválido').max(254),
    senhaTemporaria: z.string().optional().or(z.literal('')),
    perfil: z.nativeEnum(PerfilAcesso, {
      errorMap: () => ({ message: 'Selecione um perfil de acesso válido' }),
    }),
    conselhoProfissional: z.string().optional().nullable(),
    registroProfissional: z.string().optional().nullable(),
    especialidade: z.string().optional().nullable(),
  })
  .superRefine((dados, ctx) => {
    if (dados.perfil === PerfilAcesso.PROFISSIONAL_SAUDE) {
      if (!dados.conselhoProfissional || dados.conselhoProfissional.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Conselho obrigatório',
          path: ['conselhoProfissional'],
        });
      }
      if (dados.conselhoProfissional !== ConselhoProfissional.NAO_INFORMADO && (!dados.registroProfissional || dados.registroProfissional.trim() === '')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Registro obrigatório',
          path: ['registroProfissional'],
        });
      }
      if (!dados.especialidade || dados.especialidade.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Especialidade obrigatória',
          path: ['especialidade'],
        });
      }
    }
  });

export type FormNovoUsuario = z.infer<typeof formNovoUsuarioSchema>;

interface ModalNovoUsuarioProps {
  aberto: boolean;
  aoFechar: () => void;
  aoSalvar: (dados: FormNovoUsuario) => Promise<void>;
  usuarioParaEditar?: UsuarioItem | null;
}

export const ModalNovoUsuario: FC<ModalNovoUsuarioProps> = ({
  aberto,
  aoFechar,
  aoSalvar,
  usuarioParaEditar,
}) => {
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [senhaCopiada, setSenhaCopiada] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormNovoUsuario>({
    resolver: zodResolver(formNovoUsuarioSchema),
    defaultValues: {
      nomeCompleto: '',
      email: '',
      senhaTemporaria: '',
      perfil: PerfilAcesso.TRIAGEM_RECEPCAO,
      conselhoProfissional: '',
      registroProfissional: '',
      especialidade: '',
    },
  });

  const { perfilLogado } = usePermissoes();
  const ehBootstrap = perfilLogado === 'BOOTSTRAP';

  const opcoesPerfilDisponiveis = useMemo<OpcaoSelectCustom[]>(() => {
    return OPCOES_PERFIL.filter((op) => {
      if (op.valor === PerfilAcesso.ADMIN && !ehBootstrap && usuarioParaEditar?.perfil !== PerfilAcesso.ADMIN) {
        return false;
      }
      return true;
    });
  }, [ehBootstrap, usuarioParaEditar]);

  const perfilAtual = watch('perfil');
  const conselhoAtual = watch('conselhoProfissional');
  const especialidadeAtual = watch('especialidade');
  const ehProfissionalSaude = perfilAtual === PerfilAcesso.PROFISSIONAL_SAUDE;

  const senhaAtual = watch('senhaTemporaria') || '';
  const regrasSenha = useMemo(() => ({
    tamanhoMinimo: senhaAtual.trim().length >= 8,
    temMaiuscula: /[A-Z]/.test(senhaAtual),
    temMinuscula: /[a-z]/.test(senhaAtual),
    temNumero: /\d/.test(senhaAtual),
    temEspecial: /[^a-zA-Z\d\s]/.test(senhaAtual),
  }), [senhaAtual]);

  useEffect(() => {
    if (aberto) {
      setErroGeral(null);
      setSenhaCopiada(false);
      setMostrarSenha(false);

      if (usuarioParaEditar) {
        setValue('nomeCompleto', usuarioParaEditar.nome, { shouldValidate: true });
        setValue('email', usuarioParaEditar.email, { shouldValidate: true });
        setValue('senhaTemporaria', '', { shouldValidate: true });
        const perfilValido =
          usuarioParaEditar.perfil === PerfilAcesso.BOOTSTRAP
            ? PerfilAcesso.ADMIN
            : usuarioParaEditar.perfil;
        setValue('perfil', perfilValido, { shouldValidate: true });
        setValue('conselhoProfissional', usuarioParaEditar.conselhoProfissional || '', { shouldValidate: true });
        setValue('registroProfissional', usuarioParaEditar.registroProfissional || '', { shouldValidate: true });
        setValue('especialidade', usuarioParaEditar.especialidade || '', { shouldValidate: true });
      } else {
        reset({
          nomeCompleto: '',
          email: '',
          senhaTemporaria: '',
          perfil: PerfilAcesso.TRIAGEM_RECEPCAO,
          conselhoProfissional: '',
          registroProfissional: '',
          especialidade: '',
        });
      }
    }
  }, [aberto, usuarioParaEditar, setValue, reset]);

  const resetarFormulario = () => {
    reset({
      nomeCompleto: '',
      email: '',
      senhaTemporaria: '',
      perfil: PerfilAcesso.TRIAGEM_RECEPCAO,
      conselhoProfissional: '',
      registroProfissional: '',
      especialidade: '',
    });
    setErroGeral(null);
    setSenhaCopiada(false);
    setMostrarSenha(false);
  };

  const lidarGerarSenha = () => {
    const novaSenha = gerarSenhaTemporariaSegura(10);
    setValue('senhaTemporaria', novaSenha, { shouldValidate: true });
    setMostrarSenha(true);
    setErroGeral(null);
  };

  const lidarCopiarSenha = () => {
    const senha = watch('senhaTemporaria');
    if (senha) {
      navigator.clipboard.writeText(senha);
      setSenhaCopiada(true);
      setTimeout(() => setSenhaCopiada(false), 2000);
    }
  };

  const onSubmit = async (dados: FormNovoUsuario) => {
    if (!usuarioParaEditar) {
      const senha = dados.senhaTemporaria?.trim() || '';
      if (!senha) {
        setErroGeral('Informe ou gere uma senha temporária para o novo usuário.');
        return;
      }
      if (senha.length < 8) {
        setErroGeral('A senha temporária deve conter no mínimo 8 caracteres.');
        return;
      }
      if (!REGEX_SENHA_SEGURA.test(senha)) {
        setErroGeral('A senha temporária deve conter pelo menos 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial (!@#$%&*).');
        return;
      }
    }

    setSalvando(true);
    setErroGeral(null);
    try {
      const dadosSanitizados: FormNovoUsuario = {
        ...dados,
        nomeCompleto: DOMPurify.sanitize(dados.nomeCompleto.trim().toUpperCase()),
        email: DOMPurify.sanitize(dados.email.trim().toLowerCase()),
        senhaTemporaria: !usuarioParaEditar && dados.senhaTemporaria ? dados.senhaTemporaria.trim() : undefined,
        conselhoProfissional: dados.conselhoProfissional ? DOMPurify.sanitize(dados.conselhoProfissional) : undefined,
        registroProfissional: dados.registroProfissional ? DOMPurify.sanitize(dados.registroProfissional.trim().toUpperCase()) : undefined,
        especialidade: dados.especialidade ? DOMPurify.sanitize(dados.especialidade) : undefined,
      };

      await aoSalvar(dadosSanitizados);
      resetarFormulario();
      aoFechar();
    } catch (err: any) {
      setErroGeral(err?.message || 'Erro ao cadastrar profissional.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      aoResetar={resetarFormulario}
      titulo={usuarioParaEditar ? 'Editar Profissional' : 'Convidar Novo Profissional'}
      subtitulo={
        usuarioParaEditar
          ? 'Atualize os dados cadastrais e permissões de acesso.'
          : 'Cadastre um novo membro da equipe e defina uma senha temporária.'
      }
      tamanho="xl"
      icone={<UserPlus className="w-5 h-5" />}
      rodape={
        <>
          <BotaoModal
            variante="secundario"
            rotulo="Cancelar"
            aoClicar={aoFechar}
          />
          <BotaoModal
            tipo="submit"
            formId="form-usuario"
            variante="primario"
            rotulo={usuarioParaEditar ? 'Salvar Alterações' : 'Enviar Convite'}
            carregando={salvando}
          />
        </>
      }
    >
      <form id="form-usuario" onSubmit={handleSubmit(onSubmit)} className="space-y-7">
        {erroGeral && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
            <CircleAlert className="w-4 h-4 text-red-500 shrink-0" />
            <span className="font-medium leading-relaxed">{erroGeral}</span>
          </div>
        )}

        <ModalSecao titulo="Dados Pessoais e Contato">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <ModalCampo rotulo="Nome completo" obrigatorio erro={errors.nomeCompleto?.message}>
                <input
                  type="text"
                  {...register('nomeCompleto')}
                  placeholder="Ex: Ana Souza"
                  className={`${ESTILO_INPUT_MODAL} uppercase`}
                />
              </ModalCampo>
            </div>

            <div className={usuarioParaEditar ? 'md:col-span-2' : 'md:col-span-1'}>
               <ModalCampo rotulo="E-mail de Acesso" obrigatorio erro={errors.email?.message}>
                 <input
                   type="email"
                   {...register('email')}
                   placeholder="profissional@catraki.com.br"
                   className={`${ESTILO_INPUT_MODAL} lowercase ${usuarioParaEditar ? 'bg-slate-100/70 text-slate-500 cursor-not-allowed' : ''}`}
                   disabled={Boolean(usuarioParaEditar)}
                 />
               </ModalCampo>
            </div>

            {!usuarioParaEditar && (
              <div className="md:col-span-1">
                 <ModalCampo rotulo="Senha Temporária" obrigatorio erro={errors.senhaTemporaria?.message} dica="Exigida no 1º acesso">
                   <div className="relative flex items-center">
                     <input
                       type={mostrarSenha ? 'text' : 'password'}
                       {...register('senhaTemporaria')}
                       placeholder="Ex: Sem@2026!"
                       className={`${ESTILO_INPUT_MODAL} pr-28 font-mono text-sm tracking-wide`}
                     />
                     <div className="absolute right-1.5 flex items-center gap-0.5 bg-white/90 pl-1 py-1 rounded-xl">
                       <button
                         type="button"
                         onClick={() => setMostrarSenha((v) => !v)}
                         title={mostrarSenha ? 'Ocultar senha' : 'Ver senha'}
                         className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                       >
                         {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </button>
                       <button
                         type="button"
                         onClick={lidarCopiarSenha}
                         disabled={!watch('senhaTemporaria')}
                         title={senhaCopiada ? 'Copiada!' : 'Copiar senha'}
                         className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                       >
                         {senhaCopiada ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                       </button>
                       <button
                         type="button"
                         onClick={lidarGerarSenha}
                         title="Gerar senha segura automática"
                         className="flex items-center gap-1 px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-semibold rounded-lg transition-colors ml-0.5"
                       >
                         <Sparkles className="w-3.5 h-3.5" />
                         <span>Gerar</span>
                       </button>
                     </div>
                   </div>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      <div
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10.5px] border transition-colors ${
                          regrasSenha.tamanhoMinimo
                            ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/90 font-medium'
                            : 'bg-slate-50 text-slate-500 border-slate-200/80'
                        }`}
                      >
                        {regrasSenha.tamanhoMinimo ? (
                          <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[2.5]" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mx-0.5" />
                        )}
                        <span>Mín. 8 caracteres ({senhaAtual.trim().length}/8)</span>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10.5px] border transition-colors ${
                          regrasSenha.temMaiuscula
                            ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/90 font-medium'
                            : 'bg-slate-50 text-slate-500 border-slate-200/80'
                        }`}
                      >
                        {regrasSenha.temMaiuscula ? (
                          <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[2.5]" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mx-0.5" />
                        )}
                        <span>1 Maiúscula (A-Z)</span>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10.5px] border transition-colors ${
                          regrasSenha.temMinuscula
                            ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/90 font-medium'
                            : 'bg-slate-50 text-slate-500 border-slate-200/80'
                        }`}
                      >
                        {regrasSenha.temMinuscula ? (
                          <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[2.5]" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mx-0.5" />
                        )}
                        <span>1 Minúscula (a-z)</span>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10.5px] border transition-colors ${
                          regrasSenha.temNumero
                            ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/90 font-medium'
                            : 'bg-slate-50 text-slate-500 border-slate-200/80'
                        }`}
                      >
                        {regrasSenha.temNumero ? (
                          <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[2.5]" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mx-0.5" />
                        )}
                        <span>1 Número (0-9)</span>
                      </div>

                      <div
                        className={`col-span-2 sm:col-span-2 flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10.5px] border transition-colors ${
                          regrasSenha.temEspecial
                            ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/90 font-medium'
                            : 'bg-slate-50 text-slate-500 border-slate-200/80'
                        }`}
                      >
                        {regrasSenha.temEspecial ? (
                          <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[2.5]" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mx-0.5" />
                        )}
                        <span>1 Símbolo Especial (!@#$%&*...)</span>
                      </div>
                    </div>
                 </ModalCampo>
              </div>
            )}
          </div>
        </ModalSecao>

        <ModalSecao titulo="Permissões">
          <div className="grid grid-cols-1 gap-4">
             <ModalCampo rotulo="Perfil de Acesso (RBAC)" obrigatorio erro={errors.perfil?.message}>
               <input type="hidden" {...register('perfil')} />
               <ModalSelectCustom
                 valorAtual={perfilAtual as string}
                 aoMudar={(v) => setValue('perfil', v as PerfilAcesso, { shouldValidate: true })}
                 opcoes={opcoesPerfilDisponiveis}
                 placeholder="Selecione um perfil..."
               />
             </ModalCampo>
          </div>
        </ModalSecao>

        {ehProfissionalSaude && (
          <ModalSecao titulo="Atuação Profissional">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <ModalCampo rotulo="Conselho Profissional" obrigatorio erro={errors.conselhoProfissional?.message}>
                 <input type="hidden" {...register('conselhoProfissional')} />
                 <ModalSelectCustom
                   categoria="conselhos"
                   valorAtual={conselhoAtual as string}
                   aoMudar={(v) => setValue('conselhoProfissional', v, { shouldValidate: true })}
                   opcoes={OPCOES_CONSELHO}
                   placeholder="Selecione o conselho..."
                   abreParaCima
                 />
               </ModalCampo>

               {conselhoAtual !== ConselhoProfissional.NAO_INFORMADO && (
                 <ModalCampo rotulo="Registro Profissional" obrigatorio erro={errors.registroProfissional?.message}>
                   <input
                     type="text"
                     {...register('registroProfissional')}
                     placeholder="Ex: 12345"
                     className={`${ESTILO_INPUT_MODAL} uppercase`}
                   />
                 </ModalCampo>
               )}

               <div className={conselhoAtual === ConselhoProfissional.NAO_INFORMADO ? 'md:col-span-1' : 'md:col-span-2'}>
                 <ModalCampo rotulo="Especialidade Principal" obrigatorio erro={errors.especialidade?.message}>
                   <input type="hidden" {...register('especialidade')} />
                   <ModalSelectCustom
                     categoria="especialidades"
                     valorAtual={especialidadeAtual as string}
                     aoMudar={(v) => setValue('especialidade', v, { shouldValidate: true })}
                     opcoes={OPCOES_ESPECIALIDADE}
                     placeholder="Selecione a especialidade..."
                     abreParaCima
                   />
                 </ModalCampo>
               </div>
            </div>
          </ModalSecao>
        )}
      </form>
    </Modal>
  );
};

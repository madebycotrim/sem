import { type FC, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DOMPurify from 'dompurify';
import { CircleAlert, UserPlus } from 'lucide-react';
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
    nomeCompleto: z.string().min(2, 'Nome completo é obrigatório').max(150),
    email: z.string().email('E-mail inválido').max(254),
    senhaTemporaria: z.string().min(8, 'Mínimo de 8 caracteres').optional().or(z.literal('')),
    perfil: z.nativeEnum(PerfilAcesso, {
      errorMap: () => ({ message: 'Selecione um perfil de acesso válido' }),
    }),
    conselhoProfissional: z.string().optional(),
    registroProfissional: z.string().optional(),
    especialidade: z.string().optional(),
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

  const perfilAtual = watch('perfil');
  const conselhoAtual = watch('conselhoProfissional');
  const especialidadeAtual = watch('especialidade');
  const ehProfissionalSaude = perfilAtual === PerfilAcesso.PROFISSIONAL_SAUDE;

  useEffect(() => {
    if (aberto) {
      setErroGeral(null);

      if (usuarioParaEditar) {
        setValue('nomeCompleto', usuarioParaEditar.nome, { shouldValidate: true });
        setValue('email', usuarioParaEditar.email, { shouldValidate: true });
        setValue('senhaTemporaria', '', { shouldValidate: true });
        setValue('perfil', usuarioParaEditar.perfil, { shouldValidate: true });
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
  };

  const onSubmit = async (dados: FormNovoUsuario) => {
    if (!usuarioParaEditar && !dados.senhaTemporaria?.trim()) {
      setErroGeral('Informe uma senha temporária para o novo usuário.');
      return;
    }

    setSalvando(true);
    setErroGeral(null);
    try {
      const dadosSanitizados: FormNovoUsuario = {
        ...dados,
        nomeCompleto: DOMPurify.sanitize(dados.nomeCompleto.trim().toUpperCase()),
        email: DOMPurify.sanitize(dados.email.trim().toLowerCase()),
        senhaTemporaria: dados.senhaTemporaria ? dados.senhaTemporaria.trim() : undefined,
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
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <CircleAlert className="w-4 h-4 text-red-500 shrink-0" />
            <span>{erroGeral}</span>
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

            <div className="md:col-span-1">
               <ModalCampo rotulo="E-mail de Acesso" obrigatorio erro={errors.email?.message}>
                 <input
                   type="email"
                   {...register('email')}
                   placeholder="profissional@catraki.com.br"
                   className={`${ESTILO_INPUT_MODAL} lowercase`}
                 />
               </ModalCampo>
            </div>

            <div className="md:col-span-1">
               <ModalCampo rotulo="Senha Temporária" obrigatorio={!usuarioParaEditar} erro={errors.senhaTemporaria?.message} dica={!usuarioParaEditar ? 'Exigida no 1º acesso' : 'Deixe em branco para manter'}>
                 <input
                   type="text"
                   {...register('senhaTemporaria')}
                   placeholder="Ex: catraki123"
                   className={ESTILO_INPUT_MODAL}
                 />
               </ModalCampo>
            </div>
          </div>
        </ModalSecao>

        <ModalSecao titulo="Permissões">
          <div className="grid grid-cols-1 gap-4">
             <ModalCampo rotulo="Perfil de Acesso (RBAC)" obrigatorio erro={errors.perfil?.message}>
               <input type="hidden" {...register('perfil')} />
               <ModalSelectCustom
                 valorAtual={perfilAtual as string}
                 aoMudar={(v) => setValue('perfil', v as PerfilAcesso, { shouldValidate: true })}
                 opcoes={OPCOES_PERFIL}
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

               <div className="md:col-span-2">
                 <ModalCampo rotulo="Especialidade Principal" obrigatorio erro={errors.especialidade?.message}>
                   <input type="hidden" {...register('especialidade')} />
                   <ModalSelectCustom
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

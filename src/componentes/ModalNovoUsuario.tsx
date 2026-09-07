import { type FC, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DOMPurify from 'dompurify';
import { 
  PerfilAcesso, 
  PERFIL_ACESSO_LABELS,
  ConselhoProfissional,
  CONSELHO_PROFISSIONAL_LABELS,
  Especialidade,
  ESPECIALIDADE_LABELS
} from '../../compartilhado/index.ts';
import {
  Modal,
  ModalCampo,
  ModalSecao,
  BotaoModal,
  ESTILO_INPUT_MODAL,
  ESTILO_SELECT_MODAL,
} from './Modal.tsx';
import type { UsuarioItem } from './Usuarios.tsx';

const formNovoUsuarioSchema = z
  .object({
    nomeCompleto: z.string().min(2, 'Nome completo é obrigatório').max(150),
    email: z.string().email('E-mail inválido').max(254),
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
      if (!dados.registroProfissional || dados.registroProfissional.trim() === '') {
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
      perfil: PerfilAcesso.TRIAGEM_RECEPCAO,
      conselhoProfissional: '',
      registroProfissional: '',
      especialidade: '',
    },
  });

  const perfilAtual = watch('perfil');
  const ehProfissionalSaude = perfilAtual === PerfilAcesso.PROFISSIONAL_SAUDE;

  useEffect(() => {
    if (aberto) {
      setErroGeral(null);

      if (usuarioParaEditar) {
        setValue('nomeCompleto', usuarioParaEditar.nome, { shouldValidate: true });
        setValue('email', usuarioParaEditar.email, { shouldValidate: true });
        setValue('perfil', usuarioParaEditar.perfil, { shouldValidate: true });
        setValue('conselhoProfissional', '', { shouldValidate: true });
        setValue('registroProfissional', usuarioParaEditar.registroProfissional || '', { shouldValidate: true });
        setValue('especialidade', usuarioParaEditar.especialidade || '', { shouldValidate: true });
      } else {
        reset({
          nomeCompleto: '',
          email: '',
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
      perfil: PerfilAcesso.TRIAGEM_RECEPCAO,
      conselhoProfissional: '',
      registroProfissional: '',
      especialidade: '',
    });
    setErroGeral(null);
  };

  const onSubmit = async (dados: FormNovoUsuario) => {
    setSalvando(true);
    setErroGeral(null);
    try {
      const dadosSanitizados: FormNovoUsuario = {
        ...dados,
        nomeCompleto: DOMPurify.sanitize(dados.nomeCompleto.trim().toUpperCase()),
        email: DOMPurify.sanitize(dados.email.trim().toLowerCase()),
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
          : 'Envie um convite para um novo membro da equipe. Eles receberão as instruções por e-mail.'
      }
      tamanho="xl"
      icone={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
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
            formId="form-usuario"
            variante="primario"
            rotulo={usuarioParaEditar ? 'Salvar Alterações' : 'Enviar Convite'}
            carregando={salvando}
          />
        </>
      }
    >
      <form id="form-usuario" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            <div className="md:col-span-2">
               <ModalCampo rotulo="E-mail de Acesso" obrigatorio erro={errors.email?.message}>
                 <input
                   type="email"
                   {...register('email')}
                   placeholder="profissional@catraki.com.br"
                   className={`${ESTILO_INPUT_MODAL} lowercase`}
                 />
                 <p className="mt-1 text-[11px] text-slate-500">
                   O convite com as instruções de acesso será enviado para este endereço.
                 </p>
               </ModalCampo>
            </div>
          </div>
        </ModalSecao>

        <ModalSecao titulo="Permissões">
          <div className="grid grid-cols-1 gap-4">
             <ModalCampo rotulo="Perfil de Acesso (RBAC)" obrigatorio erro={errors.perfil?.message}>
               <select {...register('perfil')} className={`${ESTILO_SELECT_MODAL} font-semibold`}>
                 {Object.entries(PERFIL_ACESSO_LABELS)
                   .filter(([valor]) => valor !== 'BOOTSTRAP')
                   .map(([valor, rotulo]) => (
                   <option key={valor} value={valor}>
                     {rotulo}
                   </option>
                 ))}
               </select>
             </ModalCampo>
          </div>
        </ModalSecao>

        {ehProfissionalSaude && (
          <ModalSecao titulo="Atuação Profissional">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <ModalCampo rotulo="Conselho Profissional" obrigatorio erro={errors.conselhoProfissional?.message}>
                 <select {...register('conselhoProfissional')} className={ESTILO_SELECT_MODAL}>
                   <option value="">Selecione o conselho...</option>
                   {Object.entries(CONSELHO_PROFISSIONAL_LABELS).map(([valor, rotulo]) => (
                     <option key={valor} value={valor}>
                       {rotulo}
                     </option>
                   ))}
                 </select>
               </ModalCampo>

               <ModalCampo rotulo="Registro Profissional" obrigatorio erro={errors.registroProfissional?.message}>
                 <input
                   type="text"
                   {...register('registroProfissional')}
                   placeholder="Ex: 12345"
                   className={`${ESTILO_INPUT_MODAL} uppercase`}
                 />
               </ModalCampo>

               <div className="md:col-span-2">
                 <ModalCampo rotulo="Especialidade Principal" obrigatorio erro={errors.especialidade?.message}>
                   <select {...register('especialidade')} className={ESTILO_SELECT_MODAL}>
                     <option value="">Selecione a especialidade...</option>
                     {Object.entries(ESPECIALIDADE_LABELS).map(([valor, rotulo]) => (
                       <option key={valor} value={valor}>
                         {rotulo}
                       </option>
                     ))}
                   </select>
                 </ModalCampo>
               </div>
            </div>
          </ModalSecao>
        )}
      </form>
    </Modal>
  );
};

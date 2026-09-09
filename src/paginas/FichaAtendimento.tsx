import { useEffect, useCallback, forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DOMPurify from 'dompurify';
import {
  fichaAtendimentoSchema,
  ESPECIALIDADE_LABELS,
  TURNO_LABELS,
  Especialidade,
  Turno,
  type FichaAtendimento as TipoFichaAtendimento,
} from '../../compartilhado/index.ts';
import { requisicaoApi, ErroApi } from '../servicos/api.ts';
import { CabecalhoPagina } from '../componentes/CabecalhoPagina.tsx';
import { SelectModal } from '../componentes/Modal.tsx';
import { CheckCircle2, FileText, HeartPulse, LoaderCircle, UserRound } from 'lucide-react';

interface FichaAtendimentoProps {
  pacientePreSelecionado?: { id: string; nome: string } | null;
  escolas?: Array<{ id: string; nome: string }>;
  aoVoltar?: () => void;
}

export function FichaAtendimento({
  pacientePreSelecionado,
  escolas = [],
  aoVoltar,
}: FichaAtendimentoProps) {
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    setValue,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<TipoFichaAtendimento>({
    resolver: zodResolver(fichaAtendimentoSchema),
    defaultValues: {
      idempotencyKey: crypto.randomUUID(),
      pacienteId: pacientePreSelecionado?.id || '',
      escolaLocalId: escolas[0]?.id || '',
      especialidade: Especialidade.ODONTOLOGIA,
      turno: Turno.MANHA,
      resumo: '',
      procedimentos: '',
      insumosUtilizados: '',
      encaminhamentoExterno: '',
    },
  });

  useEffect(() => {
    if (pacientePreSelecionado?.id) {
      setValue('pacienteId', pacientePreSelecionado.id);
    }
  }, [pacientePreSelecionado, setValue]);

  // Foco automático no resumo ou primeiro campo
  useEffect(() => {
    if (pacientePreSelecionado?.id) {
      setFocus('resumo');
    } else {
      setFocus('pacienteId');
    }
  }, [pacientePreSelecionado, setFocus]);

  // Atalho Ctrl+S para salvar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        document.getElementById('btn-salvar-atendimento')?.click();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const sanitizar = useCallback((valor: string) => {
    return DOMPurify.sanitize(valor.trim());
  }, []);

  const aoSubmeter = async (dados: TipoFichaAtendimento) => {
    const dadosSanitizados: TipoFichaAtendimento = {
      ...dados,
      resumo: sanitizar(dados.resumo),
      procedimentos: dados.procedimentos ? sanitizar(dados.procedimentos) : undefined,
      insumosUtilizados: dados.insumosUtilizados ? sanitizar(dados.insumosUtilizados) : undefined,
      encaminhamentoExterno: dados.encaminhamentoExterno ? sanitizar(dados.encaminhamentoExterno) : undefined,
    };

    try {
      await requisicaoApi('/atendimentos', {
        metodo: 'POST',
        corpo: dadosSanitizados,
      });
    } catch (erro) {
      if (erro instanceof ErroApi && erro.status === 409) {
        // Idempotência garantida: registro já processado com sucesso
      } else {
        throw erro;
      }
    }

    reset({
      idempotencyKey: crypto.randomUUID(),
      pacienteId: '',
      escolaLocalId: escolas[0]?.id || '',
      especialidade: Especialidade.ODONTOLOGIA,
      turno: Turno.MANHA,
      resumo: '',
      procedimentos: '',
      insumosUtilizados: '',
      encaminhamentoExterno: '',
    });

    if (aoVoltar) {
      setTimeout(() => aoVoltar(), 800);
    }
  };

  return (
    <div className="flex flex-col flex-1 animate-fade-in font-sans">
      <CabecalhoPagina
        titulo="Ficha de Atendimento Clínico"
        subtitulo="REGISTRO DE PROCEDIMENTOS EM FLUXO CONTÍNUO (CATRAKI)"
        acoesExtras={
          aoVoltar && (
            <button
              type="button"
              onClick={aoVoltar}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer shadow-2xs"
            >
              ← Voltar para Lista
            </button>
          )
        }
        fixo={true}
      />

      {isSubmitSuccessful && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Atendimento registrado com sucesso! Idempotência assegurada.</span>
          </div>
        </div>
      )}

      {/* Formulário Principal Padronizado */}
      <form
        onSubmit={handleSubmit(aoSubmeter)}
        className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 flex flex-col gap-5 text-xs"
        noValidate
      >
        {/* Identificação do Paciente e Polo */}
        <div>
          <h3 className="text-xs font-bold text-[#0b2545] uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100 flex items-center gap-2">
            <UserRound className="w-4 h-4 text-blue-600" />
            <span>Identificação do Estudante & Polo</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <CampoTexto
                id="pacienteId"
                rotulo={
                  pacientePreSelecionado?.nome
                    ? `Paciente: ${pacientePreSelecionado.nome}`
                    : 'UUID do Paciente *'
                }
                erro={errors.pacienteId?.message}
                placeholder="Ex: 550e8400-e29b-41d4-a716-446655440000"
                {...register('pacienteId')}
              />
            </div>

            <div>
              <CampoSelect
                id="escolaLocalId"
                rotulo="Escola / Polo de Atendimento *"
                erro={errors.escolaLocalId?.message}
                {...register('escolaLocalId')}
                opcoes={escolas.map((esc) => ({ valor: esc.id, rotulo: esc.nome }))}
                />
            </div>
          </div>
        </div>

        {/* Especialidade e Turno */}
        <div>
          <h3 className="text-xs font-bold text-[#0b2545] uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-blue-600" />
            <span>Especialidade & Turno</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <CampoSelect
              id="especialidade"
              rotulo="Especialidade *"
              erro={errors.especialidade?.message}
              {...register('especialidade')}
                opcoes={Object.entries(ESPECIALIDADE_LABELS).map(([valor, rotulo]) => ({ valor, rotulo }))}
                />

            <CampoSelect
              id="turno"
              rotulo="Turno do Atendimento *"
              erro={errors.turno?.message}
              {...register('turno')}
                opcoes={Object.entries(TURNO_LABELS).map(([valor, rotulo]) => ({ valor, rotulo }))}
                />
          </div>
        </div>

        {/* Resumo Clínico e Conduta */}
        <div>
          <h3 className="text-xs font-bold text-[#0b2545] uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Registro Clínico e Conduta</span>
          </h3>

          <div className="space-y-3.5">
            <CampoTextarea
              id="resumo"
              rotulo="Resumo do Atendimento / Queixa Principal *"
              erro={errors.resumo?.message}
              linhas={3}
              placeholder="Descreva a avaliação clínica, queixa relatada, sinais vitais e orientações..."
              {...register('resumo')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <CampoTextarea
                id="procedimentos"
                rotulo="Procedimentos Realizados"
                erro={errors.procedimentos?.message}
                linhas={2}
                placeholder="Ex: Triagem visual, profilaxia odontológica, aferição de PA..."
                {...register('procedimentos')}
              />

              <CampoTextarea
                id="insumosUtilizados"
                rotulo="Insumos Utilizados"
                erro={errors.insumosUtilizados?.message}
                linhas={2}
                placeholder="Ex: Escova dental, luvas, fita reagente..."
                {...register('insumosUtilizados')}
              />
            </div>

            <CampoTextarea
              id="encaminhamentoExterno"
              rotulo="Encaminhamento Externo (se aplicável)"
              erro={errors.encaminhamentoExterno?.message}
              linhas={2}
              placeholder="Ex: Encaminhado para UBS de referência / Especialidade oftalmológica..."
              {...register('encaminhamentoExterno')}
            />
          </div>
        </div>

        {/* Ações do Formulário */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="text-[11px] text-slate-400">
            Pressione <kbd className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">Ctrl + S</kbd> para salvar imediatamente.
          </div>

          <div className="flex items-center gap-2.5">
            {aoVoltar && (
              <button
                type="button"
                onClick={aoVoltar}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button
              id="btn-salvar-atendimento"
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-2xl shadow-xs hover:shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                  <span>Registrando...</span>
                </>
              ) : (
                <span>Salvar Atendimento (Ctrl+S)</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ─── Componentes de Campo Padronizados ─────────────────────────────────────── */

interface CampoBaseProps {
  id: string;
  rotulo: string;
  erro?: string;
}

const CampoTexto = forwardRef<HTMLInputElement, CampoBaseProps & InputHTMLAttributes<HTMLInputElement>>(
  ({ id, rotulo, erro, ...props }, ref) => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700">
        {rotulo}
      </label>
      <input
        id={id}
        ref={ref}
        className={`w-full px-3 py-2 bg-white border rounded-2xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs ${
          erro ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-200'
        }`}
        aria-invalid={!!erro}
        aria-describedby={erro ? `${id}-erro` : undefined}
        {...props}
      />
      {erro && (
        <p id={`${id}-erro`} className="mt-1 text-[11px] text-red-600" role="alert">
          {erro}
        </p>
      )}
    </div>
  )
);
CampoTexto.displayName = 'CampoTexto';

const CampoSelect = forwardRef<HTMLInputElement, CampoBaseProps & { opcoes: Array<{ valor: string; rotulo: string }> }>(
  ({ id, rotulo, erro, opcoes, ...props }, ref) => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700">
        {rotulo}
      </label>
      <SelectModal
        ref={ref}
        opcoes={opcoes}
        className={erro ?
          erro ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''
        : ''}
        {...props}
      />
      {erro && (
        <p id={`${id}-erro`} className="mt-1 text-[11px] text-red-600" role="alert">
          {erro}
        </p>
      )}
    </div>
  )
);
CampoSelect.displayName = 'CampoSelect';

type CampoTextareaProps = CampoBaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    linhas?: number;
  };

const CampoTextarea = forwardRef<HTMLTextAreaElement, CampoTextareaProps>(
  ({ id, rotulo, erro, linhas = 3, ...props }, ref) => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700">
        {rotulo}
      </label>
      <textarea
        id={id}
        ref={ref}
        rows={linhas}
        className={`w-full px-3 py-2 bg-white border rounded-2xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs resize-none ${
          erro ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-200'
        }`}
        aria-invalid={!!erro}
        aria-describedby={erro ? `${id}-erro` : undefined}
        {...props}
      />
      {erro && (
        <p id={`${id}-erro`} className="mt-1 text-[11px] text-red-600" role="alert">
          {erro}
        </p>
      )}
    </div>
  )
);
CampoTextarea.displayName = 'CampoTextarea';

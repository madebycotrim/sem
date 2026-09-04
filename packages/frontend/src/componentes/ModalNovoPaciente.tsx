import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DOMPurify from 'dompurify';

const formNovoPacienteSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(150),
  cpf: z.string().optional(),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: AAAA-MM-DD'),
  sexo: z.enum(['M', 'F', 'OUTRO', 'NAO_INFORMADO']),
  escolaLocalId: z.string().min(1, 'Selecione a escola/polo'),
  
  // Consentimento LGPD Art. 14
  responsavelNome: z.string().min(2, 'Nome do responsável é obrigatório'),
  responsavelCpf: z.string().optional(),
  responsavelParentesco: z.string().min(2, 'Informe o grau de parentesco (mãe, pai, tutor)'),
  responsavelTelefone: z.string().optional(),
  termoAceito: z.boolean().refine((val) => val === true, {
    message: 'É obrigatório registrar a anuência do responsável (LGPD Art. 14)',
  }),
});

type FormNovoPaciente = z.infer<typeof formNovoPacienteSchema>;

interface ModalNovoPacienteProps {
  aberto: boolean;
  aoFechar: () => void;
  aoSalvar: (dados: FormNovoPaciente) => Promise<void>;
  escolas: Array<{ id: string; nome: string }>;
}

export const ModalNovoPaciente: FC<ModalNovoPacienteProps> = ({
  aberto,
  aoFechar,
  aoSalvar,
  escolas,
}) => {
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormNovoPaciente>({
    resolver: zodResolver(formNovoPacienteSchema) as any,
    defaultValues: {
      sexo: 'NAO_INFORMADO',
      escolaLocalId: escolas[0]?.id || '',
      termoAceito: true,
      responsavelParentesco: 'Mãe',
    },
  });

  if (!aberto) return null;

  const onSubmit = async (dados: FormNovoPaciente) => {
    setSalvando(true);
    setErroGeral(null);
    try {
      // Sanitização básica
      const dadosSanitizados: FormNovoPaciente = {
        ...dados,
        nome: DOMPurify.sanitize(dados.nome),
        responsavelNome: DOMPurify.sanitize(dados.responsavelNome),
        responsavelParentesco: DOMPurify.sanitize(dados.responsavelParentesco),
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs anim-surgir"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-paciente"
      onKeyDown={(e) => {
        if (e.key === 'Escape') aoFechar();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 id="titulo-modal-paciente" className="text-base font-bold text-[#0b2545]">
              Novo Paciente — Cadastro & Consentimento
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              Escola Cidadã • Proteção de dados de menores (LGPD Art. 14)
            </p>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4 text-xs">
          {erroGeral && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{erroGeral}</span>
            </div>
          )}

          {/* Dados do Menor */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <span>👤</span>
              <span>Identificação do Estudante</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  {...register('nome')}
                  placeholder="Ex: Lucas Gabriel da Silva"
                  className={`w-full px-2.5 py-1.5 bg-white border rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                    errors.nome ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {errors.nome && <p className="text-[10px] text-red-600 mt-0.5">{errors.nome.message}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  {...register('dataNascimento')}
                  className={`w-full px-2.5 py-1.5 bg-white border rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                    errors.dataNascimento ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {errors.dataNascimento && (
                  <p className="text-[10px] text-red-600 mt-0.5">{errors.dataNascimento.message}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  CPF do Estudante (opcional)
                </label>
                <input
                  type="text"
                  {...register('cpf')}
                  placeholder="000.000.000-00"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Sexo Registrado
                </label>
                <select
                  {...register('sexo')}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                >
                  <option value="NAO_INFORMADO">Não Informado</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Escola / Polo de Atendimento *
                </label>
                <select
                  {...register('escolaLocalId')}
                  className={`w-full px-2.5 py-1.5 bg-white border rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                    errors.escolaLocalId ? 'border-red-400' : 'border-slate-200'
                  }`}
                >
                  {escolas.map((esc) => (
                    <option key={esc.id} value={esc.id}>
                      {esc.nome}
                    </option>
                  ))}
                </select>
                {errors.escolaLocalId && (
                  <p className="text-[10px] text-red-600 mt-0.5">{errors.escolaLocalId.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Consentimento do Responsável Legal */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <span>🛡️</span>
              <span>Responsável Legal & Termo LGPD (Art. 14)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nome do Responsável *
                </label>
                <input
                  type="text"
                  {...register('responsavelNome')}
                  placeholder="Ex: Maria Aparecida da Silva"
                  className={`w-full px-2.5 py-1.5 bg-white border rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                    errors.responsavelNome ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {errors.responsavelNome && (
                  <p className="text-[10px] text-red-600 mt-0.5">{errors.responsavelNome.message}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Grau de Parentesco *
                </label>
                <input
                  type="text"
                  {...register('responsavelParentesco')}
                  placeholder="Mãe, Pai, Avó, Tutor Legal"
                  className={`w-full px-2.5 py-1.5 bg-white border rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                    errors.responsavelParentesco ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Telefone / WhatsApp para Contato
                </label>
                <input
                  type="text"
                  {...register('responsavelTelefone')}
                  placeholder="(61) 99999-9999"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  CPF do Responsável (opcional)
                </label>
                <input
                  type="text"
                  {...register('responsavelCpf')}
                  placeholder="000.000.000-00"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Checkbox LGPD */}
            <div className="mt-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('termoAceito')}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] text-slate-700 leading-tight select-none">
                  <strong>Declaro ciência e anuência do responsável legal:</strong> O atendimento em saúde itinerante foi previamente autorizado pelo responsável para fins de triagem e assistência no âmbito do projeto Escola Cidadã.
                </span>
              </label>
              {errors.termoAceito && (
                <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.termoAceito.message}</p>
              )}
            </div>
          </div>

          {/* Rodapé do Formulário */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={aoFechar}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
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
                <span>Salvar Paciente</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

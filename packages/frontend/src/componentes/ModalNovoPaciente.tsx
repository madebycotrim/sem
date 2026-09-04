import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DOMPurify from 'dompurify';

const formNovoPacienteSchema = z.object({
  instituicao: z.string().min(1, 'Instituição é obrigatória'),
  nomeCompleto: z.string().min(2, 'Nome completo é obrigatório').max(150),
  cpf: z.string().min(11, 'CPF deve ser válido').max(14),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  sexo: z.string().min(1, 'Selecione o sexo'),
  telefone: z.string().min(8, 'Telefone é obrigatório'),
  perfilUsuario: z.string().min(1, 'Selecione o perfil do usuário'),
});

export type FormNovoPaciente = z.infer<typeof formNovoPacienteSchema>;

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
    resolver: zodResolver(formNovoPacienteSchema),
    defaultValues: {
      instituicao: escolas[0]?.nome || 'CEMEIT DE TAGUATINGA',
      nomeCompleto: '',
      cpf: '',
      dataNascimento: '',
      sexo: '',
      telefone: '',
      perfilUsuario: 'Estudante',
    },
  });

  if (!aberto) return null;

  const onSubmit = async (dados: FormNovoPaciente) => {
    setSalvando(true);
    setErroGeral(null);
    try {
      const dadosSanitizados: FormNovoPaciente = {
        ...dados,
        nomeCompleto: DOMPurify.sanitize(dados.nomeCompleto.trim().toUpperCase()),
        instituicao: DOMPurify.sanitize(dados.instituicao),
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-paciente"
      onClick={(e) => {
        if (e.target === e.currentTarget) aoFechar();
      }}
    >
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-fade-in">
        {/* Cabeçalho do Modal */}
        <div className="flex items-start justify-between px-6 pt-6 pb-2">
          <div>
            <h2 id="titulo-modal-paciente" className="text-xl font-bold text-[#0b2545] font-sans">
              Cadastrar um Novo Paciente
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Formulário para identificação e tutela em saúde (Escola Cidadã — SESI / UnB).
            </p>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
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
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{erroGeral}</span>
            </div>
          )}

          {/* Seção DADOS PESSOAIS */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-blue-600 uppercase tracking-wider mb-3.5 pb-1.5 border-b border-slate-100">
              <span>Dados do Estudante</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ✓ LGPD Art. 14 (Menores)
              </span>
            </div>

            {/* Linha 1: INSTITUIÇÃO * (Full Width) */}
            <div className="mb-3.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                ESCOLA / INSTITUIÇÃO <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  {...register('instituicao')}
                  className={`w-full appearance-none px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm font-semibold text-slate-800 uppercase focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer shadow-2xs ${
                    errors.instituicao ? 'border-red-400' : 'border-slate-200'
                  }`}
                >
                  {escolas.map((esc) => (
                    <option key={esc.id} value={esc.nome}>
                      {esc.nome.toUpperCase()}
                    </option>
                  ))}
                  <option value="CEMEIT DE TAGUATINGA">CEMEIT DE TAGUATINGA</option>
                  <option value="CEF 01 DE BRASÍLIA">CEF 01 DE BRASÍLIA</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
              {errors.instituicao && <p className="text-[11px] text-red-600 mt-1">{errors.instituicao.message}</p>}
            </div>

            {/* Linha 2: NOME COMPLETO | CPF | DATA NASCIMENTO (3 Colunas) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 mb-3.5">
              <div className="md:col-span-6">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  NOME COMPLETO DO ESTUDANTE <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('nomeCompleto')}
                  placeholder="EX: GABRIEL HENRIQUE SANTOS"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm text-slate-800 uppercase placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs ${
                    errors.nomeCompleto ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {errors.nomeCompleto && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.nomeCompleto.message}</p>
                )}
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  CPF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('cpf')}
                  placeholder="000.000.000-00"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm font-mono text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs ${
                    errors.cpf ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {errors.cpf && <p className="text-[11px] text-red-600 mt-1">{errors.cpf.message}</p>}
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  DATA NASCIMENTO <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('dataNascimento')}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs ${
                    errors.dataNascimento ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {errors.dataNascimento && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.dataNascimento.message}</p>
                )}
              </div>
            </div>

            {/* Linha 3: SEXO | TELEFONE | PERFIL DO USUÁRIO (3 Colunas) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              <div className="md:col-span-4">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  SEXO <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    {...register('sexo')}
                    className={`w-full appearance-none px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer shadow-2xs ${
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

              <div className="md:col-span-4">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  TELEFONE DO RESPONSÁVEL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('telefone')}
                  placeholder="(61) 90000-0000"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm font-mono text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs ${
                    errors.telefone ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {errors.telefone && <p className="text-[11px] text-red-600 mt-1">{errors.telefone.message}</p>}
              </div>

              <div className="md:col-span-4">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  PERFIL DO USUÁRIO <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    {...register('perfilUsuario')}
                    className={`w-full appearance-none px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer shadow-2xs ${
                      errors.perfilUsuario ? 'border-red-400' : 'border-slate-200'
                    }`}
                  >
                    <option value="Estudante">Estudante / Aluno</option>
                    <option value="Dependente">Dependente</option>
                    <option value="Comunidade Escolar">Comunidade Escolar</option>
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
            </div>
          </div>

          {/* Rodapé de Botões Padronizado */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={aoFechar}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs hover:shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {salvando ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Cadastrando...</span>
                </>
              ) : (
                <span>Cadastrar Paciente</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

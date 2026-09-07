import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import catrakiLogo from '../assets/catraki.png';

const formLoginSchema = z.object({
  email: z.string().min(1, 'O e-mail é obrigatório').email('Digite um e-mail válido'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type FormLogin = z.infer<typeof formLoginSchema>;

interface LoginProps {
  aoLogar: (email: string) => void;
}

export function Login({ aoLogar }: LoginProps) {
  const [carregando, setCarregando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormLogin>({
    resolver: zodResolver(formLoginSchema),
  });

  const onSubmit = (dados: FormLogin) => {
    setCarregando(true);
    // Simula delay de rede para autenticação
    setTimeout(() => {
      setCarregando(false);
      aoLogar(dados.email);
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f4f7fb] font-sans">
      {/* ─── Lado Esquerdo: Branding (Escondido em Telas Pequenas) ───────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-blue-600 flex-col justify-between overflow-hidden">
        {/* Fundo Decorativo */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-900 opacity-90" />
          {/* Formas abstratas */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col items-start justify-center h-full px-20">
          <img src={catrakiLogo} alt="Catraki" className="h-16 mb-12 drop-shadow-xl filter brightness-0 invert" />
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6">
            Gestão de Atendimentos<br />
            <span className="text-blue-200">Simples e Inteligente.</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-md leading-relaxed font-medium">
            Acompanhe filas, prontuários, e muito mais. Tudo integrado em uma única plataforma projetada para o Saúde em Movimento.
          </p>
        </div>

        {/* Rodapé do Branding */}
        <div className="relative z-10 px-20 pb-12 flex items-center gap-2 text-blue-200 text-sm font-medium">
          <span>&copy; {new Date().getFullYear()} Catraki. Todos os direitos reservados.</span>
        </div>
      </div>

      {/* ─── Lado Direito: Formulário de Login ───────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-20 relative bg-white lg:rounded-l-3xl lg:shadow-[-20px_0_40px_rgba(0,0,0,0.05)] z-10">
        <div className="w-full max-w-md animate-fade-in">
          
          <div className="lg:hidden flex items-center justify-center mb-10">
             <img src={catrakiLogo} alt="Catraki" className="h-14 drop-shadow-sm" />
          </div>

          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-extrabold text-[#0b2545] tracking-tight mb-2">Bem-vindo de volta!</h2>
            <p className="text-slate-500 font-medium">Insira suas credenciais para acessar o painel.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo E-mail */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Endereço de E-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register('email')}
                  placeholder="exemplo@catraki.com.br"
                  className={`w-full h-12 px-4 text-sm font-medium text-slate-800 bg-slate-50 border ${
                    errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                  } rounded-xl outline-none transition-all duration-200 focus:bg-white focus:ring-4 placeholder:text-slate-400`}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
              </div>
              {errors.email && (
                <p className="text-[12px] font-semibold text-red-600 flex items-center gap-1 animate-fade-in">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Senha
                </label>
                <a href="#" className="text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  {...register('senha')}
                  placeholder="••••••••"
                  className={`w-full h-12 px-4 text-sm font-medium tracking-widest text-slate-800 bg-slate-50 border ${
                    errors.senha ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                  } rounded-xl outline-none transition-all duration-200 focus:bg-white focus:ring-4 placeholder:text-slate-400 placeholder:tracking-normal`}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              </div>
              {errors.senha && (
                <p className="text-[12px] font-semibold text-red-600 flex items-center gap-1 animate-fade-in">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {errors.senha.message}
                </p>
              )}
            </div>

            {/* Botão de Submit */}
            <button
              type="submit"
              disabled={carregando}
              className="w-full h-12 mt-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-[14px] rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {carregando ? (
                <>
                  <svg className="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="32" strokeDashoffset="10" />
                  </svg>
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Dica Mock */}
          <div className="mt-8 text-center p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
             <p className="text-xs text-blue-800 font-medium leading-relaxed">
               <strong className="font-bold">Acesso de Demonstração:</strong><br />
               Qualquer e-mail/senha válidos darão acesso.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

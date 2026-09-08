import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, CircleAlert, KeyRound, LoaderCircle, Mail } from 'lucide-react';
import { requisicaoApi } from '../servicos/api.ts';
import catrakiLogo from '../assets/catraki.png';

const formLoginSchema = z.object({
  email: z.string().min(1, 'O e-mail é obrigatório').email('Digite um e-mail válido'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type FormLogin = z.infer<typeof formLoginSchema>;

interface LoginProps {
  aoLogar: (
    usuario: { nomeCompleto: string; email: string; perfil: string },
    trocaSenhaObrigatoria: boolean
  ) => void;
}

export function Login({ aoLogar }: LoginProps) {
  const [carregando, setCarregando] = useState(false);
  const [trocaObrigatoria, setTrocaObrigatoria] = useState<{
    usuario: { nomeCompleto: string; email: string; perfil: string };
    senhaAtual: string;
  } | null>(null);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erroTroca, setErroTroca] = useState<string | null>(null);
  const [salvandoTroca, setSalvandoTroca] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormLogin>({
    resolver: zodResolver(formLoginSchema),
  });

  const onSubmit = async (dados: FormLogin) => {
    setCarregando(true);
    try {
      const resposta = await requisicaoApi<{
        usuario: { nomeCompleto: string; email: string; perfil: string };
        trocaSenhaObrigatoria?: boolean;
      }>('/auth/login', {
        metodo: 'POST',
        corpo: {
          email: dados.email,
          senha: dados.senha
        }
      });
      if (resposta.trocaSenhaObrigatoria) {
        setTrocaObrigatoria({ usuario: resposta.usuario, senhaAtual: dados.senha });
      } else {
        aoLogar(resposta.usuario, false);
      }
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao autenticar';
      setError('root', { type: 'manual', message: mensagem });
    } finally {
      setCarregando(false);
    }
  };

  const handleTrocarSenha = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trocaObrigatoria) return;

    if (novaSenha.length < 8) {
      setErroTroca('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErroTroca('As senhas não conferem.');
      return;
    }

    setSalvandoTroca(true);
    setErroTroca(null);
    try {
      await requisicaoApi('/auth/alterar-senha', {
        metodo: 'POST',
        corpo: { senhaAtual: trocaObrigatoria.senhaAtual, novaSenha },
      });
      aoLogar(trocaObrigatoria.usuario, false);
    } catch (erro) {
      setErroTroca(erro instanceof Error ? erro.message : 'Não foi possível alterar a senha.');
    } finally {
      setSalvandoTroca(false);
    }
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

          {trocaObrigatoria ? (
            <>
              <div className="text-center lg:text-left mb-10">
                <h2 className="text-3xl font-extrabold text-[#0b2545] tracking-tight mb-2">Crie sua nova senha</h2>
                <p className="text-slate-500 font-medium">Por segurança, defina uma senha permanente antes de acessar o sistema.</p>
              </div>

              <form onSubmit={handleTrocarSenha} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">Nova senha</label>
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(event) => setNovaSenha(event.target.value)}
                    placeholder="Mínimo de 8 caracteres"
                    autoFocus
                    className="w-full h-12 px-4 text-sm font-medium tracking-widest text-slate-800 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-blue-100 rounded-xl outline-none transition-all duration-200 focus:bg-white focus:ring-4"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">Confirmar nova senha</label>
                  <input
                    type="password"
                    value={confirmarSenha}
                    onChange={(event) => setConfirmarSenha(event.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full h-12 px-4 text-sm font-medium tracking-widest text-slate-800 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-blue-100 rounded-xl outline-none transition-all duration-200 focus:bg-white focus:ring-4"
                  />
                </div>

                {erroTroca && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-semibold flex items-center gap-2 animate-fade-in">
                    <CircleAlert className="w-4 h-4 shrink-0" />
                    {erroTroca}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={salvandoTroca}
                  className="w-full h-12 mt-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-[14px] rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {salvandoTroca ? <LoaderCircle className="w-5 h-5 animate-spin text-white" /> : <span>Salvar nova senha</span>}
                </button>
              </form>
            </>
          ) : (
          <>
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
                  <Mail className="w-5 h-5" />
                </div>
              </div>
              {errors.email && (
                <p className="text-[12px] font-semibold text-red-600 flex items-center gap-1 animate-fade-in">
                  <CircleAlert className="w-3.5 h-3.5 shrink-0" />
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
                  <KeyRound className="w-5 h-5" />
                </div>
              </div>
              {errors.senha && (
                <p className="text-[12px] font-semibold text-red-600 flex items-center gap-1 animate-fade-in">
                  <CircleAlert className="w-3.5 h-3.5 shrink-0" />
                  {errors.senha.message}
                </p>
              )}
            </div>

            {errors.root && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-semibold flex items-center gap-2 animate-fade-in">
                <CircleAlert className="w-4 h-4 shrink-0" />
                {errors.root.message}
              </div>
            )}

            {/* Botão de Submit */}
            <button
              type="submit"
              disabled={carregando}
              className="w-full h-12 mt-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-[14px] rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {carregando ? (
                <>
                  <LoaderCircle className="w-5 h-5 animate-spin text-white" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>
          </>
          )}

        </div>
      </div>
    </div>
  );
}

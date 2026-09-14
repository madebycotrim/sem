import { useState, useRef, type FC } from 'react';
import { Modal, BotaoModal, ModalSecao, ModalCampo, ESTILO_INPUT_MODAL } from './Modal.tsx';
import { requisicaoApi } from '../servicos/api.ts';
import { LockKeyhole, Check, CircleAlert, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface ModalAlterarSenhaProps {
  aberto: boolean;
  aoFechar: () => void;
}

export const ModalAlterarSenha: FC<ModalAlterarSenhaProps> = ({ aberto, aoFechar }) => {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  // Ref para o formulário isolado
  const formRef = useRef<HTMLFormElement>(null);

  const limparFormulario = () => {
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
    setSalvando(false);
    setSalvo(false);
    setErro(null);
    setMostrarSenhaAtual(false);
    setMostrarNovaSenha(false);
    setMostrarConfirmarSenha(false);
    formRef.current?.reset();
  };

  const handleFechar = () => {
    limparFormulario();
    aoFechar();
  };

  const regras = {
    tamanhoMinimo: novaSenha.length >= 8,
    temMaiuscula: /[A-Z]/.test(novaSenha),
    temMinuscula: /[a-z]/.test(novaSenha),
    temNumero: /\d/.test(novaSenha),
    temEspecial: /[^a-zA-Z\d\s]/.test(novaSenha),
  };

  const novaSenhaValida =
    regras.tamanhoMinimo &&
    regras.temMaiuscula &&
    regras.temMinuscula &&
    regras.temNumero &&
    regras.temEspecial;

  const senhasConferem = novaSenha === confirmarSenha && novaSenha.length > 0;

  const handleSalvar = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) return;
    if (!novaSenhaValida) {
      setErro('A nova senha não atende a todos os requisitos de segurança.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro('A confirmação da nova senha não confere.');
      return;
    }
    
    setSalvando(true);
    setErro(null);
    try {
      await requisicaoApi('/auth/alterar-senha', {
        metodo: 'POST',
        corpo: { senhaAtual, novaSenha },
      });
      setSalvo(true);
      setTimeout(handleFechar, 1500);
    } catch (erroApi) {
      setErro(erroApi instanceof Error ? erroApi.message : 'Não foi possível alterar a senha.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      aberto={aberto}
      aoFechar={handleFechar}
      titulo="Alterar Minha Senha"
      subtitulo="Atualize sua senha de acesso para manter sua conta segura."
      icone={
        <LockKeyhole className="w-5 h-5" />
      }
      tamanho="md"
      rodape={
        <BotaoModal
          rotulo={salvo ? "Senha Alterada com Sucesso!" : "Atualizar Senha"}
          variante="primario"
          aoClicar={handleSalvar}
          carregando={salvando}
          desabilitado={salvo || !novaSenhaValida || !senhasConferem || !senhaAtual || salvando}
          className="w-full"
        />
      }
    >
      <form
        ref={formRef}
        autoComplete="off"
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-6"
      >
        {/* Campos dummy invisíveis para captura de autofill */}
        <input type="text" name="username_dummy" aria-hidden="true" tabIndex={-1} style={{ display: 'none' }} readOnly />
        <input type="password" name="password_dummy" aria-hidden="true" tabIndex={-1} style={{ display: 'none' }} readOnly />

        {erro && (
          <div className="p-3.5 bg-rose-50 border border-rose-200/90 rounded-2xl flex items-center gap-2 text-xs font-semibold text-rose-700 animate-fade-in">
            <CircleAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{erro}</span>
          </div>
        )}

        {salvo && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Sua senha foi alterada com sucesso! Fechando...</span>
          </div>
        )}

        <ModalSecao titulo="Autenticação Atual">
          <ModalCampo rotulo="Senha Atual" obrigatorio>
            <div className="relative flex items-center">
              <input
                type={mostrarSenhaAtual ? 'text' : 'password'}
                name="senha_atual_modal"
                value={senhaAtual}
                onChange={(e) => {
                  setSenhaAtual(e.target.value);
                  setErro(null);
                }}
                placeholder="Digite sua senha atual"
                autoComplete="current-password"
                className={`${ESTILO_INPUT_MODAL} pr-11`}
              />
              <button
                type="button"
                onClick={() => setMostrarSenhaAtual((v) => !v)}
                title={mostrarSenhaAtual ? 'Ocultar senha' : 'Ver senha'}
                className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {mostrarSenhaAtual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </ModalCampo>
        </ModalSecao>

        <ModalSecao titulo="Nova Credencial">
          <div className="flex flex-col gap-4">
            <ModalCampo rotulo="Nova Senha" obrigatorio>
              <div className="relative flex items-center">
                <input
                  type={mostrarNovaSenha ? 'text' : 'password'}
                  name="nova_senha_modal"
                  value={novaSenha}
                  onChange={(e) => {
                    setNovaSenha(e.target.value);
                    setErro(null);
                  }}
                  placeholder="Ex: Sem@2026!"
                  autoComplete="new-password"
                  className={`w-full h-11 pl-4 pr-11 text-[14px] font-bold font-mono tracking-wider text-slate-800 bg-white border rounded-xl outline-none transition-all duration-150 ${
                    novaSenhaValida
                      ? 'border-emerald-300 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100'
                      : 'border-slate-200/90 focus:border-blue-500 focus:ring-3 focus:ring-blue-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarNovaSenha((v) => !v)}
                  title={mostrarNovaSenha ? 'Ocultar senha' : 'Ver senha'}
                  className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {mostrarNovaSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* ─── Pílulas de Requisitos de Nova Senha ─── */}
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border transition-colors ${
                      regras.tamanhoMinimo
                        ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/90 font-medium'
                        : 'bg-slate-50 text-slate-500 border-slate-200/80'
                    }`}
                  >
                    {regras.tamanhoMinimo ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mx-1" />
                    )}
                    <span>Mín. 8 caracteres ({novaSenha.length}/8)</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border transition-colors ${
                      regras.temMaiuscula
                        ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/90 font-medium'
                        : 'bg-slate-50 text-slate-500 border-slate-200/80'
                    }`}
                  >
                    {regras.temMaiuscula ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mx-1" />
                    )}
                    <span>1 Maiúscula (A-Z)</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border transition-colors ${
                      regras.temMinuscula
                        ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/90 font-medium'
                        : 'bg-slate-50 text-slate-500 border-slate-200/80'
                    }`}
                  >
                    {regras.temMinuscula ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mx-1" />
                    )}
                    <span>1 Minúscula (a-z)</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border transition-colors ${
                      regras.temNumero
                        ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/90 font-medium'
                        : 'bg-slate-50 text-slate-500 border-slate-200/80'
                    }`}
                  >
                    {regras.temNumero ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mx-1" />
                    )}
                    <span>1 Número (0-9)</span>
                  </div>

                  <div
                    className={`col-span-2 sm:col-span-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border transition-colors ${
                      regras.temEspecial
                        ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/90 font-medium'
                        : 'bg-slate-50 text-slate-500 border-slate-200/80'
                    }`}
                  >
                    {regras.temEspecial ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mx-1" />
                    )}
                    <span>1 Símbolo Especial (!@#$%&*...)</span>
                  </div>
                </div>

                {novaSenha.length > 0 && !novaSenhaValida && (
                  <p className="text-[11.5px] font-medium text-amber-700 flex items-center gap-1.5 pt-0.5 px-0.5">
                    <CircleAlert className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>
                      {!regras.tamanhoMinimo
                        ? `Falta ${8 - novaSenha.length} caractere(s) para atingir o tamanho mínimo de 8.`
                        : 'Cumpra todos os requisitos destacados acima para habilitar o salvamento.'}
                    </span>
                  </p>
                )}
              </div>
            </ModalCampo>

            <ModalCampo 
              rotulo="Confirmar Nova Senha" 
              obrigatorio 
              erro={confirmarSenha && !senhasConferem ? "As senhas não conferem." : undefined}
            >
              <div className="relative flex items-center">
                <input
                  type={mostrarConfirmarSenha ? 'text' : 'password'}
                  name="confirmar_nova_senha_modal"
                  value={confirmarSenha}
                  onChange={(e) => {
                    setConfirmarSenha(e.target.value);
                    setErro(null);
                  }}
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                  className={`w-full h-11 pl-4 pr-11 text-[14px] font-bold font-mono tracking-wider text-slate-800 bg-white border rounded-xl outline-none transition-all duration-150 ${
                    confirmarSenha && senhasConferem
                      ? 'border-emerald-300 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100'
                      : confirmarSenha && !senhasConferem
                      ? 'border-red-300 focus:border-red-500 focus:ring-3 focus:ring-red-100'
                      : 'border-slate-200/90 focus:border-blue-500 focus:ring-3 focus:ring-blue-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmarSenha((v) => !v)}
                  title={mostrarConfirmarSenha ? 'Ocultar senha' : 'Ver senha'}
                  className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {mostrarConfirmarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {confirmarSenha && senhasConferem && (
                <p className="text-[11.5px] font-semibold text-emerald-700 flex items-center gap-1.5 mt-1.5 px-0.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>As senhas coincidem perfeitamente.</span>
                </p>
              )}
            </ModalCampo>
          </div>
        </ModalSecao>
      </form>
    </Modal>
  );
};

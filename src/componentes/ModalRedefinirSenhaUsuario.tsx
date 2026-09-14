import { useState, type FC, useEffect } from 'react';
import { Modal, BotaoModal, ModalSecao } from './Modal.tsx';
import { Check, Copy, KeyRound, RefreshCw, ShieldAlert, CircleAlert, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { obterEstiloAvatarGoogle } from '../utilitarios/avatarCor.ts';
import { PERFIL_ACESSO_LABELS } from '../../compartilhado/index.ts';
import { requisicaoApi } from '../servicos/api.ts';
import type { UsuarioItem } from './Usuarios.tsx';
import { gerarSenhaTemporariaSegura } from '../utilitarios/geradorSenha.ts';

interface ModalRedefinirSenhaProps {
  aberto: boolean;
  usuario: UsuarioItem | null;
  aoFechar: () => void;
}

export const ModalRedefinirSenhaUsuario: FC<ModalRedefinirSenhaProps> = ({
  aberto,
  usuario,
  aoFechar,
}) => {
  const [senhaGerada, setSenhaGerada] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [giros, setGiros] = useState(0);
  const [mostrarSenha, setMostrarSenha] = useState(true);

  const gerarSenha = (animar = true) => {
    const pass = gerarSenhaTemporariaSegura(10);
    setSenhaGerada(pass);
    setCopiado(false);
    setSalvo(false);
    setErro(null);
    if (animar) {
      setGiros((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (aberto) {
      gerarSenha(false);
      setSalvo(false);
      setErro(null);
      setMostrarSenha(true);
    }
  }, [aberto]);

  const copiarSenha = () => {
    if (senhaGerada) {
      navigator.clipboard.writeText(senhaGerada);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const regras = {
    tamanhoMinimo: senhaGerada.trim().length >= 8,
    temMaiuscula: /[A-Z]/.test(senhaGerada),
    temMinuscula: /[a-z]/.test(senhaGerada),
    temNumero: /\d/.test(senhaGerada),
    temEspecial: /[^a-zA-Z\d\s]/.test(senhaGerada),
  };

  const senhaValida =
    regras.tamanhoMinimo &&
    regras.temMaiuscula &&
    regras.temMinuscula &&
    regras.temNumero &&
    regras.temEspecial;

  const handleSalvar = async () => {
    if (!usuario || !senhaValida) return;
    try {
      setSalvando(true);
      setErro(null);
      await requisicaoApi(`/usuarios/${usuario.id}/redefinir-senha`, {
        metodo: 'POST',
        corpo: { novaSenha: senhaGerada.trim() },
      });
      setSalvo(true);
    } catch (err) {
      console.error('Erro ao redefinir senha do usuário:', err);
      setErro(err instanceof Error ? err.message : 'Ocorreu um erro ao redefinir a senha.');
    } finally {
      setSalvando(false);
    }
  };

  if (!usuario) return null;
  const primeiraLetra = usuario.nome.charAt(0).toUpperCase();
  const estiloAvatar = obterEstiloAvatarGoogle(usuario.nome);

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={salvo ? 'Senha Redefinida' : 'Redefinição de Senha'}
      subtitulo={
        salvo
          ? 'A nova credencial de acesso provisória foi gravada com sucesso.'
          : 'Gere ou digite uma nova credencial de acesso temporária para este usuário.'
      }
      icone={
        salvo ? (
          <div className="text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        ) : (
          <KeyRound className="w-5 h-5" />
        )
      }
      tamanho="md"
      rodape={
        salvo ? (
          <BotaoModal
            rotulo="Concluir e Fechar"
            variante="primario"
            aoClicar={aoFechar}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          />
        ) : (
          <BotaoModal
            rotulo="Confirmar e Salvar Nova Senha"
            variante="primario"
            aoClicar={handleSalvar}
            carregando={salvando}
            desabilitado={!senhaValida || salvando}
            className="w-full"
          />
        )
      }
    >
      <div className="flex flex-col gap-5">
        {erro && (
          <div className="p-3.5 bg-rose-50 border border-rose-200/90 rounded-2xl flex items-center gap-2 text-xs font-semibold text-rose-700 animate-fade-in">
            <CircleAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{erro}</span>
          </div>
        )}

        {salvo ? (
          /* ─── Visão de Sucesso ─────────────────────────────────────── */
          <div className="space-y-4 animate-fade-in">
            <div className="p-5 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs ring-4 ring-emerald-50">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-emerald-950">
                  Senha Redefinida com Sucesso!
                </h3>
                <p className="text-xs text-emerald-800/90 mt-1 max-w-sm leading-relaxed">
                  A nova credencial de <strong>{usuario.nome}</strong> foi atualizada. Copie a senha abaixo e envie ao usuário.
                </p>
              </div>

              <div className="w-full mt-1 bg-white border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Nova Senha Provisória
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-800 tracking-wider">
                    {senhaGerada}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copiarSenha}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 ${
                    copiado
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiado ? 'Copiado!' : 'Copiar Senha'}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                <span>Primeiro Acesso Obrigatório</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-slate-500">
                O usuário será obrigado a cadastrar sua senha definitiva no momento do login.
              </p>
            </div>
          </div>
        ) : (
          /* ─── Formulário Padrão ─────────────────────────────────────── */
          <>
            <ModalSecao titulo="Profissional">
              {/* Card do Usuário Aprimorado */}
              <div className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                <div
                  style={estiloAvatar.style}
                  className="w-11 h-11 rounded-full font-bold text-base flex items-center justify-center shrink-0 shadow-sm select-none ring-[3px] ring-white relative z-10"
                >
                  {primeiraLetra}
                </div>

                <div className="flex flex-col relative z-10 gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#0b2545] uppercase tracking-tight text-[13.5px]">
                      {usuario.nome}
                    </span>
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-50/80 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-widest shadow-2xs">
                      {PERFIL_ACESSO_LABELS[usuario.perfil] || usuario.perfil}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-slate-500 font-medium mt-0.5">
                    {usuario.email}
                  </div>
                </div>
              </div>
            </ModalSecao>

            <ModalSecao titulo="Segurança">
              {/* Campo de Senha Temporária */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    NOVA SENHA TEMPORÁRIA
                  </label>
                  <button
                    type="button"
                    onClick={() => gerarSenha(true)}
                    className="text-[11.5px] font-bold text-[#034b7f] flex items-center gap-1.5 hover:text-blue-700 transition-colors cursor-pointer group"
                  >
                    <RefreshCw
                      style={{ transform: `rotate(-${giros * 360}deg)` }}
                      className="w-3.5 h-3.5 transition-transform duration-500 ease-in-out"
                    />
                    Gerar outra
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1 flex items-center">
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      value={senhaGerada}
                      onChange={(e) => {
                        setSenhaGerada(e.target.value);
                        setCopiado(false);
                        setSalvo(false);
                        setErro(null);
                      }}
                      placeholder="Ex: Sem@2026!"
                      className={`w-full h-11 pl-4 pr-11 text-[14px] font-bold font-mono tracking-wider text-slate-800 bg-white border rounded-xl outline-none transition-all duration-150 ${
                        senhaValida
                          ? 'border-emerald-300 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100'
                          : 'border-slate-200/90 focus:border-blue-500 focus:ring-3 focus:ring-blue-100'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha((v) => !v)}
                      title={mostrarSenha ? 'Ocultar senha' : 'Ver senha'}
                      className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={copiarSenha}
                    className={`h-11 px-4 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 ${
                      copiado
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
                    }`}
                  >
                    {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiado ? 'Copiado' : 'Copiar'}
                  </button>
                </div>

                {/* ─── Pílulas de Requisitos de Senha Segura ─── */}
                <div className="mt-1.5 space-y-2">
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
                      <span>Mín. 8 caracteres ({senhaGerada.trim().length}/8)</span>
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

                  {senhaValida ? (
                    <p className="text-[11.5px] font-semibold text-emerald-700 flex items-center gap-1.5 pt-0.5 px-0.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>Senha segura e em total conformidade com a política de acesso.</span>
                    </p>
                  ) : (
                    <p className="text-[11.5px] font-medium text-amber-700 flex items-center gap-1.5 pt-0.5 px-0.5">
                      <CircleAlert className="w-4 h-4 shrink-0 text-amber-500" />
                      <span>
                        {!regras.tamanhoMinimo && senhaGerada.trim().length > 0
                          ? `Falta ${8 - senhaGerada.trim().length} caractere(s) para atingir o tamanho mínimo de 8.`
                          : 'Cumpra todos os requisitos destacados acima para habilitar o salvamento.'}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </ModalSecao>

            {/* Card de Aviso LGPD */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[#034b7f] font-bold text-[12px] mb-2">
                <ShieldAlert className="w-4 h-4" />
                Privacidade & Segurança (LGPD Art. 46)
              </div>
              <p className="text-[11.5px] text-slate-500 leading-relaxed font-medium">
                Esta é uma <span className="text-slate-700 font-bold">senha provisória</span>. No primeiro acesso, o usuário será{' '}
                <span className="text-slate-700 font-bold">
                  obrigatoriamente direcionado a cadastrar sua senha definitiva e confidencial
                </span>
                , assegurando a privacidade do titular.
              </p>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

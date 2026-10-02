import { useState, type FC, useEffect } from 'react';
import { Modal, BotaoModal } from './Modal.tsx';
import { Check, Copy, KeyRound, RefreshCw, ShieldAlert, CircleAlert, CheckCircle2, Eye, EyeOff, Clock, Infinity } from 'lucide-react';
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
  const [prazoHoras, setPrazoHoras] = useState<number | null>(24);

  const formatarPrevisaoExpiracao = (horas: number | null) => {
    if (horas === null || horas === 0) {
      return 'Válida até o 1º acesso';
    }
    const data = new Date(Date.now() + horas * 60 * 60 * 1000);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const hora = String(data.getHours()).padStart(2, '0');
    const min = String(data.getMinutes()).padStart(2, '0');
    return `até ${dia}/${mes} às ${hora}:${min}`;
  };

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
      setPrazoHoras(24);
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
        corpo: {
          novaSenha: senhaGerada.trim(),
          expiracaoHoras: prazoHoras,
        },
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
      tamanho="lg"
      contentClassName="px-6 py-4"
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
      <div className="flex flex-col gap-3.5">
        {erro && (
          <div className="p-3 bg-rose-50 border border-rose-200/90 rounded-2xl flex items-center gap-2 text-xs font-semibold text-rose-700 animate-fade-in">
            <CircleAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{erro}</span>
          </div>
        )}

        {salvo ? (
          /* ─── Visão de Sucesso ─────────────────────────────────────── */
          <div className="space-y-3.5 animate-fade-in py-1">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl flex flex-col items-center text-center gap-2.5">
              <div className="w-11 h-11 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs ring-4 ring-emerald-50">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-[15px] font-extrabold text-emerald-950">
                  Senha Redefinida com Sucesso!
                </h3>
                <p className="text-xs text-emerald-800/90 mt-0.5 max-w-sm leading-relaxed">
                  A nova credencial de <strong>{usuario.nome}</strong> foi atualizada. Copie a senha abaixo e envie ao usuário.
                </p>
              </div>

              <div className="w-full mt-0.5 bg-white border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex flex-col text-left">
                  <span className="text-[9.5px] font-bold text-emerald-800 uppercase tracking-wider">
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

              <div className="w-full bg-white border border-emerald-200/90 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs text-emerald-900 font-bold">
                  {prazoHoras === null || prazoHoras === 0 ? (
                    <Infinity className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  )}
                  <span>Validade da Senha:</span>
                </div>
                <span className="text-xs font-bold text-emerald-950">
                  {prazoHoras === null || prazoHoras === 0
                    ? 'Válida até o 1º acesso (sem expiração)'
                    : `${prazoHoras >= 168 ? '7 dias' : `${prazoHoras} horas`} (${formatarPrevisaoExpiracao(prazoHoras)})`}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-xs text-slate-600 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
              <p className="text-[11px] leading-relaxed text-slate-600">
                <strong className="text-slate-800">Primeiro acesso obrigatório:</strong> O usuário cadastrará sua senha pessoal definitiva no próximo login.
              </p>
            </div>
          </div>
        ) : (
          /* ─── Formulário Otimizado e Compacto ───────────────────────── */
          <>
            {/* 1. Identificação Rápida do Usuário (Barra Compacta) */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  style={estiloAvatar.style}
                  className="w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center shrink-0 shadow-xs select-none ring-2 ring-white"
                >
                  {primeiraLetra}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-[#0b2545] uppercase tracking-tight text-[13px] truncate">
                      {usuario.nome}
                    </span>
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-widest shrink-0">
                      {PERFIL_ACESSO_LABELS[usuario.perfil] || usuario.perfil}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    {usuario.email}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Campo de Senha Temporária e Requisitos */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-700">
                  Nova Senha Temporária
                </label>
                <button
                  type="button"
                  onClick={() => gerarSenha(true)}
                  className="text-[11px] font-bold text-[#034b7f] flex items-center gap-1.5 hover:text-blue-700 transition-colors cursor-pointer group"
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
                    className={`w-full h-10 pl-3.5 pr-10 text-[13.5px] font-bold font-mono tracking-wider text-slate-800 bg-white border rounded-xl outline-none transition-all duration-150 ${
                      senhaValida
                        ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                        : 'border-slate-200/90 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((v) => !v)}
                    title={mostrarSenha ? 'Ocultar senha' : 'Ver senha'}
                    className="absolute right-1.5 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    {mostrarSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={copiarSenha}
                  className={`h-10 px-3.5 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 ${
                    copiado
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
                  }`}
                >
                  {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiado ? 'Copiado' : 'Copiar'}
                </button>
              </div>

              {/* Pílulas de Requisitos Compactas */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 pt-0.5">
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] border transition-colors ${
                    regras.tamanhoMinimo
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                      : 'bg-slate-50 text-slate-500 border-slate-200/80'
                  }`}
                >
                  {regras.tamanhoMinimo ? (
                    <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[2.5]" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  )}
                  <span>Mín. 8 ({senhaGerada.trim().length}/8)</span>
                </div>

                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] border transition-colors ${
                    regras.temMaiuscula
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                      : 'bg-slate-50 text-slate-500 border-slate-200/80'
                  }`}
                >
                  {regras.temMaiuscula ? (
                    <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[2.5]" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  )}
                  <span>Maiúscula (A-Z)</span>
                </div>

                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] border transition-colors ${
                    regras.temMinuscula
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                      : 'bg-slate-50 text-slate-500 border-slate-200/80'
                  }`}
                >
                  {regras.temMinuscula ? (
                    <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[2.5]" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  )}
                  <span>Minúscula (a-z)</span>
                </div>

                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] border transition-colors ${
                    regras.temNumero
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                      : 'bg-slate-50 text-slate-500 border-slate-200/80'
                  }`}
                >
                  {regras.temNumero ? (
                    <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[2.5]" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  )}
                  <span>Número (0-9)</span>
                </div>

                <div
                  className={`col-span-2 sm:col-span-1 flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] border transition-colors ${
                    regras.temEspecial
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                      : 'bg-slate-50 text-slate-500 border-slate-200/80'
                  }`}
                >
                  {regras.temEspecial ? (
                    <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[2.5]" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  )}
                  <span>Símbolo (!@#)</span>
                </div>
              </div>

              {senhaValida ? (
                <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5 pt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>Senha segura e em total conformidade.</span>
                </p>
              ) : (
                <p className="text-[11px] font-medium text-amber-700 flex items-center gap-1.5 pt-0.5">
                  <CircleAlert className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span>
                    {!regras.tamanhoMinimo && senhaGerada.trim().length > 0
                      ? `Falta ${8 - senhaGerada.trim().length} caractere(s) para atingir o mínimo de 8.`
                      : 'Cumpra todos os requisitos destacados para habilitar o salvamento.'}
                  </span>
                </p>
              )}
            </div>

            {/* 3. Opção de Prazo de Expiração */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Prazo de Expiração</span>
                </label>
                <span className="text-[10.5px] font-semibold text-slate-400">
                  {prazoHoras === null || prazoHoras === 0 ? 'Válida até o 1º acesso' : `Expira em ${prazoHoras >= 168 ? '7 dias' : `${prazoHoras}h`}`}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 24, label: '24 horas', desc: 'Recomendado' },
                  { id: 48, label: '48 horas', desc: '2 dias corridos' },
                  { id: 168, label: '7 dias', desc: 'Próxima escala' },
                  { id: 0, label: 'Não expirar', desc: 'Até o 1º login' },
                ].map((opcao) => {
                  const selecionado = prazoHoras === opcao.id || (opcao.id === 0 && prazoHoras === null);
                  return (
                    <button
                      key={opcao.id}
                      type="button"
                      onClick={() => setPrazoHoras(opcao.id === 0 ? null : opcao.id)}
                      className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                        selecionado
                          ? 'border-blue-500 bg-blue-50/80 text-blue-900 shadow-2xs ring-2 ring-blue-100/80'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className={`text-[11.5px] font-bold ${selecionado ? 'text-blue-700' : 'text-slate-800'}`}>
                        {opcao.label}
                      </span>
                      <span className={`text-[9.5px] leading-tight ${selecionado ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
                        {opcao.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="text-[10.5px] text-slate-500 flex items-center gap-1.5 px-0.5">
                {prazoHoras === null || prazoHoras === 0 ? (
                  <>
                    <Infinity className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>A credencial não expirará por tempo e permanecerá ativa até o 1º login.</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Usuário terá até <strong>{prazoHoras >= 168 ? '7 dias' : `${prazoHoras}h`}</strong> ({formatarPrevisaoExpiracao(prazoHoras)}) para o 1º login.</span>
                  </>
                )}
              </div>
            </div>

            {/* 4. Aviso LGPD Compacto */}
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl px-3 py-2 flex items-center gap-2 text-[11px] text-slate-500 shadow-2xs">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                <strong className="text-slate-700">LGPD (Art. 46):</strong> Credencial provisória. No 1º login, a troca por senha confidencial definitiva é obrigatória.
              </span>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

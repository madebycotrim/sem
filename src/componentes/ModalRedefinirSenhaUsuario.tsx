import { useState, type FC, useEffect } from 'react';
import { Modal, BotaoModal, ModalSecao } from './Modal.tsx';
import { Check, Copy, KeyRound, RefreshCw, ShieldAlert } from 'lucide-react';
import { obterEstiloAvatarGoogle } from '../utilitarios/avatarCor.ts';
import { PERFIL_ACESSO_LABELS } from '../../compartilhado/index.ts';
import { requisicaoApi } from '../servicos/api.ts';
import type { UsuarioItem } from './Usuarios.tsx';

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
  const [giros, setGiros] = useState(0);

  const gerarSenha = (animar = true) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSenhaGerada(pass);
    setCopiado(false);
    setSalvo(false);
    if (animar) {
      setGiros(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (aberto) {
      gerarSenha(false);
    }
  }, [aberto]);

  const copiarSenha = () => {
    if (senhaGerada) {
      navigator.clipboard.writeText(senhaGerada);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const handleSalvar = async () => {
    if (!usuario || !senhaGerada) return;
    try {
      setSalvando(true);
      await requisicaoApi(`/usuarios/${usuario.id}/redefinir-senha`, {
        metodo: 'POST',
        corpo: { novaSenha: senhaGerada },
      });
      setSalvo(true);
      setTimeout(() => {
        aoFechar();
        setSalvo(false);
      }, 1500);
    } catch (err) {
      console.error('Erro ao redefinir senha do usuário:', err);
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
      titulo="Redefinição de Senha"
      subtitulo="Gere uma nova credencial de acesso temporária para este usuário."
      icone={
        <KeyRound className="w-5 h-5" />
      }
      tamanho="md"
      rodape={
        <BotaoModal
          rotulo={salvo ? "Senha Redefinida com Sucesso!" : "Confirmar e Salvar Nova Senha"}
          variante="primario"
          aoClicar={handleSalvar}
          carregando={salvando}
          desabilitado={salvo}
          className="w-full"
        />
      }
    >
      <div className="flex flex-col gap-6">
        <ModalSecao titulo="Profissional">
          {/* Card do Usuário Aprimorado */}
          <div className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm relative overflow-hidden group">
            {/* Decoração de Fundo */}
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
                  {PERFIL_ACESSO_LABELS[usuario.perfil]}
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
                <RefreshCw style={{ transform: `rotate(-${giros * 360}deg)` }} className="w-3.5 h-3.5 transition-transform duration-500 ease-in-out" />
                Gerar outra
              </button>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={senhaGerada}
                  readOnly
                  className="w-full h-11 px-4 text-[14px] font-bold font-mono tracking-widest text-slate-800 bg-slate-50/80 border border-slate-200/90 rounded-xl outline-none transition-all duration-150 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                />
              </div>
              <button
                type="button"
                onClick={copiarSenha}
                className={`h-11 px-4 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  copiado
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
                }`}
              >
                {copiado ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copiado ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1 px-1">
              <Check className="w-3.5 h-3.5" />
              Mínimo de 8 caracteres atingido (10)
            </p>
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
            <span className="text-slate-700 font-bold">obrigatoriamente direcionado a cadastrar sua senha definitiva e confidencial</span>,
            assegurando a privacidade do titular.
          </p>
        </div>
      </div>
    </Modal>
  );
};

import { useState, useRef, type FC } from 'react';
import { Modal, BotaoModal, ModalSecao, ModalCampo, ESTILO_INPUT_MODAL } from './Modal.tsx';
import { requisicaoApi } from '../servicos/api.ts';
import { LockKeyhole } from 'lucide-react';

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
  // Ref para o formulário isolado — permite reset nativo e impede que o browser
  // associe estes campos com outros inputs da página fora do modal.
  const formRef = useRef<HTMLFormElement>(null);

  const limparFormulario = () => {
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
    setSalvando(false);
    setSalvo(false);
    setErro(null);
    // Reset nativo garante que o browser limpe qualquer valor auto-preenchido
    formRef.current?.reset();
  };

  const handleFechar = () => {
    limparFormulario();
    aoFechar();
  };

  const handleSalvar = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) return;
    if (novaSenha !== confirmarSenha) return;
    
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

  const novaSenhaValida = novaSenha.length >= 8;
  const senhasConferem = novaSenha === confirmarSenha && novaSenha.length > 0;

  return (
    <Modal
      aberto={aberto}
      aoFechar={handleFechar}
      titulo="Alterar Minha Senha"
      subtitulo="Atualize sua senha de acesso para manter sua conta segura."
      icone={
        <LockKeyhole className="w-5 h-5" />
      }
      tamanho="sm"
      rodape={
        <BotaoModal
          rotulo={salvo ? "Senha Alterada com Sucesso!" : "Atualizar Senha"}
          variante="primario"
          aoClicar={handleSalvar}
          carregando={salvando}
          desabilitado={salvo || !novaSenhaValida || !senhasConferem || !senhaAtual}
          className="w-full"
        />
      }
    >
      {/*
        Formulário isolado com autocomplete="off" no nível do <form>.
        Isso instrui o browser a NÃO associar estes campos com outras
        credenciais salvas na página. Os campos dummy (aria-hidden) no
        topo "capturam" o preenchimento automático antes que ele alcance
        inputs visíveis, e são descartados pelo browser sem efeito visual.
      */}
      <form
        ref={formRef}
        autoComplete="off"
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-6"
      >
        {/* Campos dummy invisíveis — impedem que o browser auto-preencha os inputs reais */}
        <input type="text" name="username_dummy" aria-hidden="true" tabIndex={-1} style={{ display: 'none' }} readOnly />
        <input type="password" name="password_dummy" aria-hidden="true" tabIndex={-1} style={{ display: 'none' }} readOnly />

        {erro && <p className="text-xs font-semibold text-red-600">{erro}</p>}

        <ModalSecao titulo="Autenticação Atual">
          <ModalCampo rotulo="Senha Atual" obrigatorio>
            <div className="relative">
              <input
                type="password"
                name="senha_atual_modal"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                placeholder="Digite sua senha atual"
                autoComplete="current-password"
                className={ESTILO_INPUT_MODAL}
              />
            </div>
          </ModalCampo>
        </ModalSecao>

        <ModalSecao titulo="Nova Credencial">
          <div className="flex flex-col gap-4">
            <ModalCampo rotulo="Nova Senha" obrigatorio>
              <div className="relative">
                <input
                  type="password"
                  name="nova_senha_modal"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo de 8 caracteres"
                  autoComplete="new-password"
                  className={ESTILO_INPUT_MODAL}
                />
              </div>
            </ModalCampo>

            <ModalCampo 
              rotulo="Confirmar Nova Senha" 
              obrigatorio 
              erro={confirmarSenha && !senhasConferem ? "As senhas não conferem." : undefined}
            >
              <div className="relative">
                <input
                  type="password"
                  name="confirmar_nova_senha_modal"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                  className={`${ESTILO_INPUT_MODAL} ${confirmarSenha && !senhasConferem ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`}
                />
              </div>
            </ModalCampo>
          </div>
        </ModalSecao>
      </form>
    </Modal>
  );
};

import {
  createContext,
  useContext,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import {
  Modal,
  BotaoModal,
  type TamanhoModal,
} from './Modal.tsx';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';

export type TipoModalUniversal = 'confirmacao' | 'alerta' | 'formulario' | 'detalhes';
export type VarianteModalUniversal = 'primario' | 'sucesso' | 'perigo' | 'alerta' | 'info';

export interface PropsModalUniversal {
  aberto: boolean;
  aoFechar: () => void;
  tipo?: TipoModalUniversal;
  variante?: VarianteModalUniversal;
  titulo: string;
  subtitulo?: string;
  mensagem?: ReactNode;
  icone?: ReactNode;
  tamanho?: TamanhoModal;
  textoConfirmar?: string;
  textoCancelar?: string;
  aoConfirmar?: () => void | Promise<void>;
  carregandoConfirmacao?: boolean;
  formId?: string;
  children?: ReactNode;
}

const MAPA_ICONES_VARIANTE: Record<VarianteModalUniversal, { icone: ReactNode; corIcone: string }> = {
  primario: {
    corIcone: 'bg-blue-50 border-blue-100 text-blue-600',
    icone: <Info className="w-5 h-5" />,
  },
  sucesso: {
    corIcone: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    icone: <CircleCheck className="w-5 h-5" />,
  },
  perigo: {
    corIcone: 'bg-red-50 border-red-100 text-red-600',
    icone: <TriangleAlert className="w-5 h-5" />,
  },
  alerta: {
    corIcone: 'bg-amber-50 border-amber-100 text-amber-600',
    icone: <CircleAlert className="w-5 h-5" />,
  },
  info: {
    corIcone: 'bg-sky-50 border-sky-100 text-sky-600',
    icone: <Info className="w-5 h-5" />,
  },
};

/**
 * Componente Modal Universal do Catraki.
 *
 * Suporta modais declarativos para qualquer página do sistema:
 * - Confirmação de ações (ex: arquivar paciente, excluir item)
 * - Alertas e mensagens de erro/sucesso
 * - Formulários customizados
 * - Detalhes e prontuários
 */
export const ModalUniversal: FC<PropsModalUniversal> = ({
  aberto,
  aoFechar,
  tipo = 'formulario',
  variante = 'primario',
  titulo,
  subtitulo,
  mensagem,
  icone,
  tamanho = 'md',
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  aoConfirmar,
  carregandoConfirmacao = false,
  formId,
  children,
}) => {
  const [executandoConfirmacao, setExecutandoConfirmacao] = useState(false);
  const configuracaoVariante = MAPA_ICONES_VARIANTE[variante];

  const handleConfirmar = async () => {
    if (!aoConfirmar) return;
    try {
      setExecutandoConfirmacao(true);
      await aoConfirmar();
      aoFechar();
    } catch (erro) {
      console.error('Erro ao executar confirmação do modal:', erro);
    } finally {
      setExecutandoConfirmacao(false);
    }
  };

  const iconeFinal = (
    <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs ${configuracaoVariante.corIcone}`}>
      {icone || configuracaoVariante.icone}
    </div>
  );

  const ehModoFormulario = tipo === 'formulario';
  const ehModoConfirmacao = tipo === 'confirmacao';
  const ehModoAlerta = tipo === 'alerta';

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      confirmarAoFechar={ehModoFormulario}
      titulo={titulo}
      subtitulo={subtitulo}
      icone={iconeFinal}
      tamanho={tamanho}
      formId={formId}
      className="!p-0 overflow-hidden bg-[#f7f9fc]"
      contentClassName="px-6 py-5"
      rodape={
        ehModoAlerta ? (
          <BotaoModal
            variante="primario"
            rotulo="Entendido"
            aoClicar={aoFechar}
          />
        ) : (
          <div className="flex items-center justify-end gap-3 w-full">
            <BotaoModal
              variante="secundario"
              rotulo={textoCancelar}
              aoClicar={aoFechar}
            />
            {ehModoConfirmacao && (
              <BotaoModal
                variante={variante === 'perigo' ? 'perigo' : 'primario'}
                rotulo={textoConfirmar}
                carregando={carregandoConfirmacao || executandoConfirmacao}
                aoClicar={handleConfirmar}
              />
            )}
            {ehModoFormulario && formId && (
              <BotaoModal
                tipo="submit"
                formId={formId}
                variante="primario"
                rotulo={textoConfirmar}
                carregando={carregandoConfirmacao}
              />
            )}
          </div>
        )
      }
    >
      <div className="space-y-4 p-0">
        {mensagem && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[12.5px] leading-relaxed text-slate-600">
            {typeof mensagem === 'string' ? <p>{mensagem}</p> : mensagem}
          </div>
        )}
        {children}
      </div>
    </Modal>
  );
};

/* ─── Sistema de Contexto e Hook Global useModal() ──────────────────────── */

export interface OpcoesConfirmacaoModal {
  titulo: string;
  mensagem: ReactNode;
  subtitulo?: string;
  variante?: VarianteModalUniversal;
  textoConfirmar?: string;
  textoCancelar?: string;
  tamanho?: TamanhoModal;
  aoConfirmar: () => void | Promise<void>;
}

export interface OpcoesAlertaModal {
  titulo: string;
  mensagem: ReactNode;
  subtitulo?: string;
  variante?: VarianteModalUniversal;
  tamanho?: TamanhoModal;
}

interface ContextoModalData {
  abrirConfirmacao: (opcoes: OpcoesConfirmacaoModal) => void;
  abrirAlerta: (opcoes: OpcoesAlertaModal) => void;
  fecharModal: () => void;
}

const ContextoModal = createContext<ContextoModalData>({
  abrirConfirmacao: () => {},
  abrirAlerta: () => {},
  fecharModal: () => {},
});

export const ProvedorModalUniversal: FC<{ children: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<{
    aberto: boolean;
    tipo: TipoModalUniversal;
    variante: VarianteModalUniversal;
    titulo: string;
    subtitulo?: string;
    mensagem?: ReactNode;
    tamanho?: TamanhoModal;
    textoConfirmar?: string;
    textoCancelar?: string;
    aoConfirmar?: () => void | Promise<void>;
  }>({
    aberto: false,
    tipo: 'confirmacao',
    variante: 'primario',
    titulo: '',
  });

  const abrirConfirmacao = (opcoes: OpcoesConfirmacaoModal) => {
    setModalState({
      aberto: true,
      tipo: 'confirmacao',
      variante: opcoes.variante || 'perigo',
      titulo: opcoes.titulo,
      subtitulo: opcoes.subtitulo,
      mensagem: opcoes.mensagem,
      tamanho: opcoes.tamanho || 'md',
      textoConfirmar: opcoes.textoConfirmar || 'Confirmar',
      textoCancelar: opcoes.textoCancelar || 'Cancelar',
      aoConfirmar: opcoes.aoConfirmar,
    });
  };

  const abrirAlerta = (opcoes: OpcoesAlertaModal) => {
    setModalState({
      aberto: true,
      tipo: 'alerta',
      variante: opcoes.variante || 'info',
      titulo: opcoes.titulo,
      subtitulo: opcoes.subtitulo,
      mensagem: opcoes.mensagem,
      tamanho: opcoes.tamanho || 'md',
    });
  };

  const fecharModal = () => {
    setModalState((prev) => ({ ...prev, aberto: false }));
  };

  return (
    <ContextoModal.Provider value={{ abrirConfirmacao, abrirAlerta, fecharModal }}>
      {children}
      <ModalUniversal
        aberto={modalState.aberto}
        aoFechar={fecharModal}
        tipo={modalState.tipo}
        variante={modalState.variante}
        titulo={modalState.titulo}
        subtitulo={modalState.subtitulo}
        mensagem={modalState.mensagem}
        tamanho={modalState.tamanho}
        textoConfirmar={modalState.textoConfirmar}
        textoCancelar={modalState.textoCancelar}
        aoConfirmar={modalState.aoConfirmar}
      />
    </ContextoModal.Provider>
  );
};

export const useModal = () => useContext(ContextoModal);

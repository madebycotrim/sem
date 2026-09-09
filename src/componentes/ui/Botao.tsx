import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { temaBotoes, type VarianteBotao, type TamanhoBotao, type FormatoBotao } from '../../tema/botoes.ts';

export interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante semântica visual do botão */
  variante?: VarianteBotao;
  /** Escala de tamanho e padding */
  tamanho?: TamanhoBotao;
  /** Formato da borda (padrão: 'pilula' via temaBotoes) */
  formato?: FormatoBotao;
  /** Ícone exibido à esquerda do texto */
  icone?: ReactNode;
  /** Ícone exibido à direita do texto */
  iconeDireita?: ReactNode;
  /** Indica se está em processamento, exibindo um spinner e desabilitando cliques */
  carregando?: boolean;
  /** Texto opcional exibido quando carregando for true (ex: 'Salvando...') */
  textoCarregando?: string;
  /** Se true, o botão ocupa 100% da largura do contêiner */
  larguraTotal?: boolean;
  /** Conteúdo do botão */
  children?: ReactNode;
}

/**
 * Componente Universal de Botão do Sistema Catraki.
 * 
 * Segue o padrão de design corporativo com suporte a formatos (pílula/arredondado),
 * variantes semânticas, ícones, micro-interações e estado de loading.
 */
export const Botao = forwardRef<HTMLButtonElement, BotaoProps>(
  (
    {
      variante = 'primario',
      tamanho = 'md',
      formato,
      icone,
      iconeDireita,
      carregando = false,
      textoCarregando,
      larguraTotal = false,
      disabled,
      className = '',
      children,
      type = 'button',
      ...resto
    },
    ref
  ) => {
    const formatoFinal = formato || temaBotoes.formatoPadrao;
    const classeFormato = temaBotoes.formatos[formatoFinal] || temaBotoes.formatos.pilula;
    const classeVariante = temaBotoes.variantes[variante] || temaBotoes.variantes.primario;
    const classeTamanho = temaBotoes.tamanhos[tamanho] || temaBotoes.tamanhos.md;
    const classeLargura = larguraTotal ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || carregando}
        className={`${temaBotoes.base} ${classeFormato} ${classeVariante} ${classeTamanho} ${classeLargura} ${className}`}
        {...resto}
      >
        {carregando ? (
          <>
            <LoaderCircle className="w-4 h-4 animate-spin shrink-0" />
            <span>{textoCarregando || children || 'Carregando...'}</span>
          </>
        ) : (
          <>
            {icone && <span className="shrink-0 flex items-center justify-center">{icone}</span>}
            {children && <span>{children}</span>}
            {iconeDireita && <span className="shrink-0 flex items-center justify-center">{iconeDireita}</span>}
          </>
        )}
      </button>
    );
  }
);

Botao.displayName = 'Botao';

/**
 * Configuração Central de Tema para Botões (Design System Catraki).
 * 
 * Permite personalizar o estilo visual de todos os botões do sistema em um único lugar:
 * - Formato padrão (pílula, arredondado ou suave)
 * - Cores e gradientes de cada variante semântica
 * - Sombras, elevações e anéis de foco
 * - Escala de tamanhos e paddings
 */

export type FormatoBotao = 'pilula' | 'arredondado' | 'suave';
export type VarianteBotao = 'primario' | 'destaque' | 'secundario' | 'sucesso' | 'perigo' | 'fantasma' | 'link';
export type TamanhoBotao = 'sm' | 'md' | 'lg' | 'iconeSm' | 'iconeMd';

export const temaBotoes = {
  /**
   * Formato padrão aplicado a todos os botões que não especificarem 'formato' explicitamente.
   * 'pilula' = rounded-full (estilo padrão dos novos botões corporativos)
   * 'arredondado' = rounded-xl
   * 'suave' = rounded-2xl
   */
  formatoPadrao: 'pilula' as FormatoBotao,

  /** Mapeamento das classes Tailwind para cada formato */
  formatos: {
    pilula: 'rounded-full',
    arredondado: 'rounded-xl',
    suave: 'rounded-2xl',
  },

  /** Variantes visuais semânticas com gradientes, bordas e sombras harmoniosas */
  variantes: {
    primario:
      'bg-gradient-to-r from-[#034b7f] to-[#14438f] text-white border border-transparent shadow-[0_2px_8px_rgba(3,75,127,0.28)] hover:shadow-[0_4px_16px_rgba(3,75,127,0.38)] hover:brightness-105',
    destaque:
      'bg-gradient-to-r from-blue-600 to-blue-700 text-white border border-blue-500/20 shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.35)] hover:brightness-105',
    secundario:
      'bg-white text-slate-700 border border-slate-200/90 shadow-2xs hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900',
    sucesso:
      'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border border-transparent shadow-[0_2px_8px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_14px_rgba(16,185,129,0.35)] hover:brightness-105',
    perigo:
      'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white border border-rose-600/30 shadow-[0_2px_8px_rgba(225,29,72,0.25)] hover:shadow-[0_4px_14px_rgba(225,29,72,0.35)] hover:brightness-105',
    fantasma:
      'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent',
    link:
      'bg-transparent text-blue-700 hover:text-blue-800 hover:underline p-0 h-auto font-semibold border-0 shadow-none',
  },

  /** Escala de tamanhos padronizada */
  tamanhos: {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4.5 text-xs sm:text-sm font-bold gap-2',
    lg: 'h-11 sm:h-12 px-6 text-sm sm:text-base font-bold gap-2.5',
    iconeSm: 'h-8 w-8 p-0 justify-center',
    iconeMd: 'h-10 w-10 p-0 justify-center',
  },

  /** Efeitos de transição, anel de foco e estado desabilitado */
  base: 'inline-flex items-center justify-center font-sans tracking-tight transition-all duration-200 ease-out select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-300 cursor-pointer whitespace-nowrap',
};

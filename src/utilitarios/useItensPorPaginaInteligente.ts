import { useState, useEffect } from 'react';

/**
 * Calcula dinamicamente o número ideal de registros por página para que a tabela
 * ocupe o espaço vertical disponível sem ativar a barra de rolagem (scroll) da página.
 *
 * @param alturaJanela Altura atual da janela (window.innerHeight)
 * @param offsetVerticalPixels Espaço ocupado por cabeçalhos, filtros, barra de busca e margens (padrão: 310px)
 * @param alturaLinhaPixels Altura estimada de cada linha da tabela (padrão: 48px)
 * @param minItens Mínimo de registros para telas muito compactas (padrão: 6)
 * @param maxItens Máximo de registros para telas grandes (padrão: 12)
 */
export function calcularItensPorPaginaInteligente(
  alturaJanela: number,
  offsetVerticalPixels = 310,
  alturaLinhaPixels = 48,
  minItens = 6,
  maxItens = 12
): number {
  if (!alturaJanela || alturaJanela <= 0) return 8;
  const espacoDisponivel = alturaJanela - offsetVerticalPixels;
  const linhasPossiveis = Math.floor(espacoDisponivel / alturaLinhaPixels);
  return Math.max(minItens, Math.min(maxItens, linhasPossiveis));
}

/**
 * Hook reativo que recalcula os itens por página com debounce em eventos de resize.
 */
export function useItensPorPaginaInteligente(
  offsetVerticalPixels = 310,
  alturaLinhaPixels = 48,
  minItens = 6,
  maxItens = 12
): number {
  const [itensPorPagina, setItensPorPagina] = useState<number>(() => {
    if (typeof window === 'undefined') return 8;
    return calcularItensPorPaginaInteligente(
      window.innerHeight,
      offsetVerticalPixels,
      alturaLinhaPixels,
      minItens,
      maxItens
    );
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const aoRedimensionar = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setItensPorPagina(
          calcularItensPorPaginaInteligente(
            window.innerHeight,
            offsetVerticalPixels,
            alturaLinhaPixels,
            minItens,
            maxItens
          )
        );
      }, 100);
    };

    window.addEventListener('resize', aoRedimensionar);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('resize', aoRedimensionar);
    };
  }, [offsetVerticalPixels, alturaLinhaPixels, minItens, maxItens]);

  return itensPorPagina;
}

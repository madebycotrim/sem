import { describe, it, expect } from 'vitest';
import { calcularItensPorPaginaInteligente } from '../utilitarios/useItensPorPaginaInteligente.ts';

describe('Dimensionamento Inteligente de Linhas por Página (useItensPorPaginaInteligente)', () => {
  it('deve limitar ao mínimo em telas compactas ou baixas para evitar quebrar o layout', () => {
    // Janela com 500px de altura: (500 - 310) / 48 = 3.9 linhas -> deve limitar ao mínimo (6)
    const itens = calcularItensPorPaginaInteligente(500, 310, 48, 6, 12);
    expect(itens).toBe(6);
  });

  it('deve calcular linhas ideais para notebook padrão 768p (aprox 700px útil)', () => {
    // Janela com 700px: (700 - 310) / 48 = 390 / 48 = 8.12 -> 8 linhas
    const itens = calcularItensPorPaginaInteligente(700, 310, 48, 6, 12);
    expect(itens).toBe(8);
  });

  it('deve calcular linhas ideais para monitor 1080p (aprox 900px útil)', () => {
    // Janela com 900px: (900 - 310) / 48 = 590 / 48 = 12.29 -> limitado a max (12)
    const itens = calcularItensPorPaginaInteligente(900, 310, 48, 6, 12);
    expect(itens).toBe(12);
  });

  it('deve limitar ao máximo em telas ultrawide ou 4K', () => {
    const itens = calcularItensPorPaginaInteligente(1440, 310, 48, 6, 12);
    expect(itens).toBe(12);
  });

  it('deve lidar com valores inválidos ou zero de forma defensiva', () => {
    expect(calcularItensPorPaginaInteligente(0)).toBe(8);
    expect(calcularItensPorPaginaInteligente(-100)).toBe(8);
  });
});

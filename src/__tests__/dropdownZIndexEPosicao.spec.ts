import { describe, it, expect } from 'vitest';

describe('Posicionamento dinâmico e Z-Index dos Dropdowns de Ações', () => {
  const calcularAbrirParaCima = (index: number, totalItens: number) => {
    return index >= 2 && index >= totalItens - 3;
  };

  it('deve abrir para baixo nas primeiras linhas de uma tabela com 10 itens', () => {
    const total = 10;
    // Primeiras linhas
    expect(calcularAbrirParaCima(0, total)).toBe(false);
    expect(calcularAbrirParaCima(1, total)).toBe(false);
    expect(calcularAbrirParaCima(2, total)).toBe(false);
    expect(calcularAbrirParaCima(5, total)).toBe(false);
    expect(calcularAbrirParaCima(6, total)).toBe(false);
  });

  it('deve abrir para cima nas últimas linhas para evitar corte pelo overflow-x-auto / paginação', () => {
    const total = 10;
    // Linhas 7, 8 e 9 (as últimas 3 linhas da página de 10)
    expect(calcularAbrirParaCima(7, total)).toBe(true);
    expect(calcularAbrirParaCima(8, total)).toBe(true);
    expect(calcularAbrirParaCima(9, total)).toBe(true);
  });

  it('nunca deve abrir para cima se houver apenas 1 ou 2 itens na tabela', () => {
    // 1 item
    expect(calcularAbrirParaCima(0, 1)).toBe(false);

    // 2 itens
    expect(calcularAbrirParaCima(0, 2)).toBe(false);
    expect(calcularAbrirParaCima(1, 2)).toBe(false);
  });

  it('deve abrir a última linha para cima quando houver 3 ou 4 itens', () => {
    // 3 itens: índice 2 (último) tem espaço acima (linhas 0 e 1)
    expect(calcularAbrirParaCima(0, 3)).toBe(false);
    expect(calcularAbrirParaCima(1, 3)).toBe(false);
    expect(calcularAbrirParaCima(2, 3)).toBe(true);

    // 4 itens: índices 2 e 3 abrem para cima
    expect(calcularAbrirParaCima(0, 4)).toBe(false);
    expect(calcularAbrirParaCima(1, 4)).toBe(false);
    expect(calcularAbrirParaCima(2, 4)).toBe(true);
    expect(calcularAbrirParaCima(3, 4)).toBe(true);
  });
});

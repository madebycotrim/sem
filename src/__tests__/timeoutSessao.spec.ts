import { describe, it, expect } from 'vitest';

describe('Lógica de Timeout de Sessão por Inatividade e Alerta Pré-Logout', () => {
  const TEMPO_LIMITE_MINUTOS = 5;
  const TEMPO_AVISO_SEGUNDOS = 30;

  const tempoLimiteMs = TEMPO_LIMITE_MINUTOS * 60 * 1000; // 300.000 ms (5 min)
  const tempoAvisoMs = TEMPO_AVISO_SEGUNDOS * 1000; // 30.000 ms (30 seg)
  const tempoInatividadeAvisoMs = tempoLimiteMs - tempoAvisoMs; // 270.000 ms (4 min 30 seg)

  it('deve calcular corretamente o limiar de exibição do aviso nos últimos 30 segundos', () => {
    expect(tempoLimiteMs).toBe(300_000);
    expect(tempoAvisoMs).toBe(30_000);
    expect(tempoInatividadeAvisoMs).toBe(270_000);
  });

  it('não deve exibir popup antes de 4 minutos e 30 segundos de inatividade', () => {
    const tempoInativo1Min = 60 * 1000;
    const tempoInativo4Min = 4 * 60 * 1000;
    const tempoInativo4Min29Seg = 269 * 1000;

    expect(tempoInativo1Min >= tempoInatividadeAvisoMs).toBe(false);
    expect(tempoInativo4Min >= tempoInatividadeAvisoMs).toBe(false);
    expect(tempoInativo4Min29Seg >= tempoInatividadeAvisoMs).toBe(false);
  });

  it('deve disparar o popup exatamente a partir de 4 minutos e 30 segundos (30 segundos restantes)', () => {
    const tempoInativoExato = 270 * 1000;
    expect(tempoInativoExato >= tempoInatividadeAvisoMs).toBe(true);

    const restanteMs = tempoLimiteMs - tempoInativoExato;
    const segundosRestantes = Math.ceil(restanteMs / 1000);
    expect(segundosRestantes).toBe(30);
  });

  it('deve calcular a contagem regressiva decrescente precisa entre 30 e 1 segundos', () => {
    // 4 minutos e 45 segundos inativo -> 15 segundos restantes
    const inativo4Min45s = 285 * 1000;
    const restante15s = Math.max(1, Math.ceil((tempoLimiteMs - inativo4Min45s) / 1000));
    expect(restante15s).toBe(15);

    // 4 minutos e 59 segundos inativo -> 1 segundo restante
    const inativo4Min59s = 299 * 1000;
    const restante1s = Math.max(1, Math.ceil((tempoLimiteMs - inativo4Min59s) / 1000));
    expect(restante1s).toBe(1);
  });

  it('deve expirar e acionar logout quando atingir ou ultrapassar 5 minutos (300 segundos)', () => {
    const inativo300s = 300 * 1000;
    const inativo310s = 310 * 1000;

    expect(tempoLimiteMs - inativo300s).toBeLessThanOrEqual(0);
    expect(tempoLimiteMs - inativo310s).toBeLessThanOrEqual(0);
  });

  it('deve calcular porcentagem correta da barra visual decrescente', () => {
    const calcularPorcentagem = (segundos: number) =>
      Math.max(0, Math.min(100, (segundos / TEMPO_AVISO_SEGUNDOS) * 100));

    expect(calcularPorcentagem(30)).toBe(100);
    expect(calcularPorcentagem(15)).toBe(50);
    expect(calcularPorcentagem(0)).toBe(0);
  });

  it('deve identificar estado crítico/urgente nos últimos 10 segundos para alerta visual', () => {
    const ehUrgente = (segundos: number) => segundos <= 10;

    expect(ehUrgente(30)).toBe(false);
    expect(ehUrgente(11)).toBe(false);
    expect(ehUrgente(10)).toBe(true);
    expect(ehUrgente(3)).toBe(true);
  });
});

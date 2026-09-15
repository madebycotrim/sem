import { describe, it, expect } from 'vitest';
import {
  FUSO_BRASILIA,
  parseDataBrasilia,
  formatarHoraBrasilia,
  formatarDataBrasilia,
  formatarDataEHoraBrasilia,
  obterDataHojeBrasilia,
  obterDataHojeExtensoBrasilia,
  obterDataIsoBrasilia,
} from '../index.js';

describe('Utilitários Canônicos de Data e Hora de Brasília (America/Sao_Paulo)', () => {
  it('deve validar que a constante do fuso horário é America/Sao_Paulo', () => {
    expect(FUSO_BRASILIA).toBe('America/Sao_Paulo');
  });

  describe('parseDataBrasilia', () => {
    it('deve retornar null para valores vazios ou nulos', () => {
      expect(parseDataBrasilia(null)).toBeNull();
      expect(parseDataBrasilia(undefined)).toBeNull();
      expect(parseDataBrasilia('')).toBeNull();
      expect(parseDataBrasilia('   ')).toBeNull();
    });

    it('deve converter formato de data do SQLite (YYYY-MM-DD HH:MM:SS) tratando como UTC', () => {
      // 2026-09-14 16:49:00 UTC = 13:49:00 em Brasília (UTC-3)
      const data = parseDataBrasilia('2026-09-14 16:49:00');
      expect(data).not.toBeNull();
      expect(formatarHoraBrasilia(data)).toBe('13:49');
      expect(formatarDataBrasilia(data)).toBe('14/09/2026');
    });

    it('deve converter timestamp ISO padrão com Z', () => {
      // 2026-09-14T16:49:00Z = 13:49 em Brasília
      const data = parseDataBrasilia('2026-09-14T16:49:00.000Z');
      expect(data).not.toBeNull();
      expect(formatarHoraBrasilia(data)).toBe('13:49');
      expect(formatarDataBrasilia(data)).toBe('14/09/2026');
    });

    it('deve interpretar formato brasileiro DD/MM/AAAA com segurança sem trocar dia', () => {
      const data = parseDataBrasilia('14/09/2026');
      expect(data).not.toBeNull();
      expect(formatarDataBrasilia(data)).toBe('14/09/2026');
    });

    it('deve interpretar formato brasileiro DD/MM/AAAA HH:mm', () => {
      const data = parseDataBrasilia('14/09/2026 13:49');
      expect(data).not.toBeNull();
      expect(formatarDataBrasilia(data)).toBe('14/09/2026');
      expect(formatarHoraBrasilia(data)).toBe('13:49');
    });

    it('deve interpretar ISO puro YYYY-MM-DD fixando meio-dia no fuso de Brasília', () => {
      const data = parseDataBrasilia('2026-09-14');
      expect(data).not.toBeNull();
      expect(formatarDataBrasilia(data)).toBe('14/09/2026');
    });
  });

  describe('formatarHoraBrasilia', () => {
    it('deve formatar horários no formato de 24 horas (HH:mm)', () => {
      // 16:15 UTC = 13:15 Brasília
      expect(formatarHoraBrasilia('2026-09-14T16:15:00.000Z')).toBe('13:15');
      // 03:00 UTC = 00:00 Brasília
      expect(formatarHoraBrasilia('2026-09-14T03:00:00.000Z')).toBe('00:00');
      // 19:45 UTC = 16:45 Brasília
      expect(formatarHoraBrasilia('2026-09-14T19:45:00.000Z')).toBe('16:45');
    });

    it('deve retornar --:-- para valores inválidos', () => {
      expect(formatarHoraBrasilia(null)).toBe('--:--');
      expect(formatarHoraBrasilia(undefined)).toBe('--:--');
      expect(formatarHoraBrasilia('data-invalida')).toBe('--:--');
    });
  });

  describe('formatarDataBrasilia', () => {
    it('deve formatar datas estritamente no padrão brasileiro DD/MM/AAAA', () => {
      expect(formatarDataBrasilia('2026-09-14T16:49:00.000Z')).toBe('14/09/2026');
      expect(formatarDataBrasilia('2026-01-05T12:00:00.000Z')).toBe('05/01/2026');
    });

    it('deve retornar --/--/---- para valores inválidos', () => {
      expect(formatarDataBrasilia(null)).toBe('--/--/----');
      expect(formatarDataBrasilia(undefined)).toBe('--/--/----');
      expect(formatarDataBrasilia('invalido')).toBe('--/--/----');
    });
  });

  describe('formatarDataEHoraBrasilia', () => {
    it('deve formatar data e hora combinadas DD/MM/AAAA HH:mm', () => {
      expect(formatarDataEHoraBrasilia('2026-09-14T16:49:00.000Z')).toBe('14/09/2026 13:49');
    });
  });

  describe('obterDataHojeBrasilia e obterDataIsoBrasilia', () => {
    it('obterDataHojeBrasilia deve retornar YYYY-MM-DD com tamanho 10', () => {
      const hoje = obterDataHojeBrasilia();
      expect(hoje).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('obterDataIsoBrasilia deve extrair data YYYY-MM-DD no fuso de Brasília', () => {
      // 2026-09-15T01:30:00.000Z ainda é 2026-09-14 22:30 em Brasília (UTC-3)
      const isoBrasilia = obterDataIsoBrasilia('2026-09-15T01:30:00.000Z');
      expect(isoBrasilia).toBe('2026-09-14');
    });

    it('obterDataHojeExtensoBrasilia deve retornar string com ano e mês por extenso em português', () => {
      const extenso = obterDataHojeExtensoBrasilia();
      expect(typeof extenso).toBe('string');
      expect(extenso.length).toBeGreaterThan(10);
    });
  });
});

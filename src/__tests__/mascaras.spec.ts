import { describe, it, expect } from 'vitest';
import { formatarCpf, formatarTelefone, somenteDigitos } from '../utilitarios/mascaras.ts';

describe('Utilitários de Máscaras (CPF e Telefone)', () => {
  describe('somenteDigitos', () => {
    it('deve extrair apenas dígitos', () => {
      expect(somenteDigitos('(66) 3673-9127')).toBe('6636739127');
      expect(somenteDigitos('123.456.789-00')).toBe('12345678900');
      expect(somenteDigitos('')).toBe('');
      expect(somenteDigitos(null)).toBe('');
      expect(somenteDigitos(undefined)).toBe('');
    });
  });

  describe('formatarCpf', () => {
    it('deve formatar CPF completo de 11 dígitos', () => {
      expect(formatarCpf('52998224725')).toBe('529.982.247-25');
    });

    it('deve formatar progressivamente durante a digitação', () => {
      expect(formatarCpf('1')).toBe('1');
      expect(formatarCpf('12')).toBe('12');
      expect(formatarCpf('123')).toBe('123');
      expect(formatarCpf('1234')).toBe('123.4');
      expect(formatarCpf('123456')).toBe('123.456');
      expect(formatarCpf('1234567')).toBe('123.456.7');
      expect(formatarCpf('123456789')).toBe('123.456.789');
      expect(formatarCpf('1234567890')).toBe('123.456.789-0');
      expect(formatarCpf('12345678901')).toBe('123.456.789-01');
    });

    it('deve limitar a 11 dígitos', () => {
      expect(formatarCpf('12345678901999')).toBe('123.456.789-01');
    });

    it('deve retornar vazio se valor for nulo ou vazio', () => {
      expect(formatarCpf('')).toBe('');
      expect(formatarCpf(null)).toBe('');
      expect(formatarCpf(undefined)).toBe('');
    });
  });

  describe('formatarTelefone', () => {
    it('deve formatar telefone fixo (10 dígitos) como (XX) XXXX-XXXX', () => {
      expect(formatarTelefone('6636739127')).toBe('(66) 3673-9127');
    });

    it('deve formatar telefone celular (11 dígitos) como (XX) XXXXX-XXXX', () => {
      expect(formatarTelefone('61999998888')).toBe('(61) 99999-8888');
      expect(formatarTelefone('66936739127')).toBe('(66) 93673-9127');
    });

    it('deve formatar progressivamente enquanto o usuário digita', () => {
      expect(formatarTelefone('6')).toBe('(6');
      expect(formatarTelefone('66')).toBe('(66) ');
      expect(formatarTelefone('(66) 3')).toBe('(66) 3');
      expect(formatarTelefone('(66) 36')).toBe('(66) 36');
      expect(formatarTelefone('(66) 367')).toBe('(66) 367');
      expect(formatarTelefone('(66) 3673')).toBe('(66) 3673');
      expect(formatarTelefone('(66) 36739')).toBe('(66) 3673-9');
      expect(formatarTelefone('(66) 367391')).toBe('(66) 3673-91');
      expect(formatarTelefone('(66) 3673912')).toBe('(66) 3673-912');
      expect(formatarTelefone('(66) 36739127')).toBe('(66) 3673-9127');
      // 11 dígitos move o hífen
      expect(formatarTelefone('(66) 367391278')).toBe('(66) 36739-1278');
    });

    it('deve permitir apagar (backspace) no DDD sem travar no parêntese', () => {
      // Quando o usuário apaga o espaço após ')', o valor passa a terminar com ')'
      expect(formatarTelefone('(66)')).toBe('(66');
    });

    it('deve remover DDI 55 colado com DDD e número', () => {
      expect(formatarTelefone('+556636739127')).toBe('(66) 3673-9127');
      expect(formatarTelefone('5561999998888')).toBe('(61) 99999-8888');
    });

    it('deve limitar a 11 dígitos', () => {
      expect(formatarTelefone('619999988889999')).toBe('(61) 99999-8888');
    });

    it('deve retornar vazio se valor for nulo ou vazio', () => {
      expect(formatarTelefone('')).toBe('');
      expect(formatarTelefone(null)).toBe('');
      expect(formatarTelefone(undefined)).toBe('');
    });
  });
});

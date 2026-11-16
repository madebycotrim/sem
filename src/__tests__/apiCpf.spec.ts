import { describe, it, expect } from 'vitest';
import {
  formatarCpf,
  validarCpfMatematicamente,
  normalizarCpf,
} from '../servicos/apiCpf.ts';

// CPFs de teste matematicamente válidos (algoritmo Módulo 11 da Receita Federal)
const CPF_VALIDO_1 = '52998224725'; // D1=2, D2=5
const CPF_VALIDO_2 = '11144477735'; // D1=3, D2=5
const CPF_VALIDO_3 = '00000000191'; // D1=9, D2=1

describe('Utilitários Locais de CPF', () => {

  describe('validarCpfMatematicamente', () => {
    it('deve validar CPFs matematicamente corretos', () => {
      expect(validarCpfMatematicamente(CPF_VALIDO_1)).toBe(true);
      expect(validarCpfMatematicamente(CPF_VALIDO_2)).toBe(true);
      expect(validarCpfMatematicamente(CPF_VALIDO_3)).toBe(true);
      expect(validarCpfMatematicamente('529.982.247-25')).toBe(true);
    });

    it('deve rejeitar CPFs com dígitos repetidos (ex: 00000000000, 11111111111)', () => {
      expect(validarCpfMatematicamente('00000000000')).toBe(false);
      expect(validarCpfMatematicamente('11111111111')).toBe(false);
      expect(validarCpfMatematicamente('22222222222')).toBe(false);
      expect(validarCpfMatematicamente('99999999999')).toBe(false);
    });

    it('deve rejeitar CPFs com tamanho diferente de 11 dígitos', () => {
      expect(validarCpfMatematicamente('123')).toBe(false);
      expect(validarCpfMatematicamente('1234567890')).toBe(false);
      expect(validarCpfMatematicamente('123456789012')).toBe(false);
    });

    it('deve rejeitar CPFs com primeiro dígito verificador incorreto', () => {
      // 529982247-05 (o correto é 25)
      expect(validarCpfMatematicamente('52998224705')).toBe(false);
    });

    it('deve rejeitar CPFs com segundo dígito verificador incorreto', () => {
      // 529982247-20 (o correto é 25)
      expect(validarCpfMatematicamente('52998224720')).toBe(false);
    });
  });

  describe('formatarCpf', () => {
    it('deve formatar CPF de 11 dígitos corretamente no padrão brasileiro', () => {
      expect(formatarCpf('52998224725')).toBe('529.982.247-25');
    });

    it('deve manter formatação parcial durante digitação', () => {
      expect(formatarCpf('123')).toBe('123');
      expect(formatarCpf('1234')).toBe('123.4');
      expect(formatarCpf('1234567')).toBe('123.456.7');
    });
  });

  describe('normalizarCpf', () => {
    it('deve remover máscara e padronizar CPFs duplicados em um único valor', () => {
      expect(normalizarCpf('529.982.247-25')).toBe('52998224725');
      expect(normalizarCpf('52998224725')).toBe('52998224725');
      expect(normalizarCpf('529 982 247 25')).toBe('52998224725');
    });
  });
});



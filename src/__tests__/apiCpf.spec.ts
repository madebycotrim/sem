import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatarCpf,
  validarCpfMatematicamente,
  consultarCpf,
  limparCacheCpf,
  normalizarCpf,
} from '../servicos/apiCpf.ts';

// Mock do localStorage para testes
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// CPFs de teste matematicamente válidos (algoritmo Módulo 11 da Receita Federal)
const CPF_VALIDO_1 = '52998224725'; // D1=2, D2=5
const CPF_VALIDO_2 = '11144477735'; // D1=3, D2=5
const CPF_VALIDO_3 = '00000000191'; // D1=9, D2=1

describe('Serviço de Consulta Inteligente de CPF (apicpf.com)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorageMock.clear();
    limparCacheCpf();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    limparCacheCpf();
  });

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

  describe('consultarCpf com Consumo Inteligente', () => {
    it('deve rejeitar e NÃO chamar a API se o CPF for matematicamente inválido', async () => {
      const mockFetch = vi.fn();
      global.fetch = mockFetch;

      await expect(consultarCpf('12345678900', 'minha_chave')).rejects.toThrow(
        'CPF inválido. Os dígitos verificadores não conferem.'
      );

      // Garante que o fetch NÃO foi chamado, economizando cota
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('deve rejeitar se o CPF não tiver 11 dígitos', async () => {
      const mockFetch = vi.fn();
      global.fetch = mockFetch;

      await expect(consultarCpf('123', 'minha_chave')).rejects.toThrow(
        'O CPF deve conter exatamente 11 dígitos numéricos.'
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('deve consultar e retornar dados com sucesso para CPF matematicamente válido', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ cpf: CPF_VALIDO_1, cpfFormatado: '529.982.247-25', nome: 'GABRIEL HENRIQUE SANTOS', genero: 'Masculino', dataNascimento: '2012-05-14' }),
      });
      global.fetch = mockFetch;

      const resultado = await consultarCpf(CPF_VALIDO_1, 'minha_chave');

      expect(resultado).toEqual({
        cpf: CPF_VALIDO_1,
        cpfFormatado: '529.982.247-25',
        nome: 'GABRIEL HENRIQUE SANTOS',
        genero: 'Masculino',
        dataNascimento: '2012-05-14',
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('deve consultar a API interna em cada solicitação', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ cpf: CPF_VALIDO_2, cpfFormatado: '111.444.777-35', nome: 'MARIA EDUARDA COSTA', genero: 'Feminino', dataNascimento: '2014-08-20' }),
      });
      global.fetch = mockFetch;

      const res1 = await consultarCpf(CPF_VALIDO_2, 'minha_chave');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(res1.nome).toBe('MARIA EDUARDA COSTA');

      const res2 = await consultarCpf(CPF_VALIDO_2, 'minha_chave');
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(res2.nome).toBe('MARIA EDUARDA COSTA');
    });
  });
});



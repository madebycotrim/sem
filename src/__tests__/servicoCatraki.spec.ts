import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sanitizarCpf,
  verificarAutorizacoesEmLote,
  validarComprovanteCatraki,
} from '../servicos/servicoCatraki.ts';

describe('servicoCatraki - Integração Automática com Catraki API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('sanitizarCpf', () => {
    it('deve extrair apenas os 11 dígitos numéricos do CPF', () => {
      expect(sanitizarCpf('087.567.621-41')).toBe('08756762141');
      expect(sanitizarCpf('12345678901')).toBe('12345678901');
      expect(sanitizarCpf(undefined)).toBe('');
    });
  });

  describe('verificarAutorizacoesEmLote', () => {
    it('deve retornar contagem zero se nenhum CPF for válido', async () => {
      const res = await verificarAutorizacoesEmLote(['', '123']);
      expect(res.success).toBe(true);
      expect(res.results).toEqual({});
    });

    it('deve processar resposta de sucesso da API em lote', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          results: {
            '08756762141': {
              authorized: true,
              status: 'signed',
              validation_code: 'CATRAKI-A1B2-C3D4',
              signed_at: '2026-09-05T14:30:00.000Z',
            },
          },
          count: 1,
        }),
      } as any);

      const res = await verificarAutorizacoesEmLote(['087.567.621-41']);
      expect(res.success).toBe(true);
      expect(res.results['08756762141']?.authorized).toBe(true);
      expect(res.results['08756762141']?.validation_code).toBe('CATRAKI-A1B2-C3D4');
    });

    it('deve lidar com falhas de rede em segundo plano sem quebrar', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

      const res = await verificarAutorizacoesEmLote(['087.567.621-41']);
      expect(res.success).toBe(false);
      expect(res.results).toEqual({});
    });
  });

  describe('validarComprovanteCatraki', () => {
    it('deve retornar erro se query vazia', async () => {
      const res = await validarComprovanteCatraki('');
      expect(res.success).toBe(false);
      expect(res.valid).toBe(false);
    });

    it('deve validar comprovante com sucesso', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          validation: {
            valid: true,
            validation_code: 'CATRAKI-A1B2-C3D4',
            signer_name: 'Maria Responsável',
            signed_at_utc: '2026-09-05T14:30:00.000Z',
          },
        }),
      } as any);

      const res = await validarComprovanteCatraki('CATRAKI-A1B2-C3D4');
      expect(res.success).toBe(true);
      expect(res.valid).toBe(true);
      expect(res.validation?.signer_name).toBe('Maria Responsável');
    });
  });
});

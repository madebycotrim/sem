import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErroApi, requisicaoApi } from '../servicos/api.ts';

describe('Serviço de API e ErroApi', () => {
  const fetchOriginal = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = fetchOriginal;
  });

  it('deve instanciar ErroApi com status, mensagem e detalhes de validação', () => {
    const detalhes = { cpf: ['CPF inválido'], nome: ['Nome é obrigatório'] };
    const erro = new ErroApi(400, 'Dados inválidos', detalhes);

    expect(erro).toBeInstanceOf(Error);
    expect(erro).toBeInstanceOf(ErroApi);
    expect(erro.name).toBe('ErroApi');
    expect(erro.status).toBe(400);
    expect(erro.message).toBe('Dados inválidos');
    expect(erro.detalhes).toEqual(detalhes);
  });

  it('deve lidar com resposta JSON com sucesso em requisicaoApi', async () => {
    const mockDados = { id: 'uuid-123', status: 'sucesso' };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockDados,
    } as unknown as Response);

    const resultado = await requisicaoApi('/atendimentos');
    expect(resultado).toEqual(mockDados);
  });

  it('não deve fazer retry em erros de cliente 4xx e lançar ErroApi', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ erro: 'Entidade não processável' }),
    } as unknown as Response);
    globalThis.fetch = mockFetch;

    await expect(
      requisicaoApi('/atendimentos', { tentativasMaximas: 3 })
    ).rejects.toThrow(ErroApi);

    // Deve ter chamado apenas 1 vez (sem retry para 4xx)
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

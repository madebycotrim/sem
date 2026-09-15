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

  it('deve disparar evento auth:nao_autorizado ao receber HTTP 401 em rotas autenticadas', async () => {
    const dispatchSpy = vi.fn();
    (globalThis as any).window = {
      dispatchEvent: dispatchSpy,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ erro: 'Token de autenticação não fornecido. Faça login novamente.' }),
    } as unknown as Response);

    await expect(requisicaoApi('/pacientes')).rejects.toThrow(ErroApi);

    expect(dispatchSpy).toHaveBeenCalled();
    const evento = dispatchSpy.mock.calls.find((call: any[]) => call[0]?.type === 'auth:nao_autorizado');
    expect(evento).toBeDefined();

    delete (globalThis as any).window;
  });

  it('deve lançar ErroApi com mensagem descritiva em caso de HTTP 503', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => 'Service Unavailable',
    } as unknown as Response);

    await expect(requisicaoApi('/importacao/processar-lote', { tentativasMaximas: 1 })).rejects.toThrow(
      /Serviço temporariamente indisponível \(HTTP 503\)/
    );
  });
});

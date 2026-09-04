/**
 * Cliente HTTP com retry automático para comunicação com o backend.
 *
 * Inclui:
 * - Retry exponencial para erros de rede
 * - Credentials: include (cookies HttpOnly)
 * - Content-Type JSON por padrão
 */

const URL_BASE_API = '/api/v1';

interface OpcoesFetch {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  corpo?: unknown;
  tentativasMaximas?: number;
}

/**
 * Faz uma requisição HTTP à API com retry automático.
 *
 * @param rota Rota relativa à API (ex: '/atendimentos')
 * @param opcoes Opções da requisição
 * @returns Resposta parseada como JSON
 * @throws Erro se todas as tentativas falharem
 */
export async function requisicaoApi<T = unknown>(
  rota: string,
  opcoes: OpcoesFetch = {}
): Promise<T> {
  const {
    metodo = 'GET',
    corpo,
    tentativasMaximas = 3,
  } = opcoes;

  let ultimoErro: Error | null = null;

  for (let tentativa = 0; tentativa < tentativasMaximas; tentativa++) {
    try {
      const resposta = await fetch(`${URL_BASE_API}${rota}`, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: corpo ? JSON.stringify(corpo) : undefined,
      });

      if (!resposta.ok) {
        const erroBody = await resposta.json().catch(() => ({
          erro: `HTTP ${resposta.status}`,
        }));

        // Não fazer retry em erros de validação/autenticação (4xx)
        if (resposta.status >= 400 && resposta.status < 500) {
          throw new ErroApi(resposta.status, erroBody.erro, erroBody.detalhes);
        }

        throw new ErroApi(resposta.status, erroBody.erro);
      }

      return (await resposta.json()) as T;
    } catch (erro) {
      ultimoErro = erro instanceof Error ? erro : new Error(String(erro));

      // Se é um erro de cliente (4xx), não fazer retry
      if (erro instanceof ErroApi && erro.status < 500) {
        throw erro;
      }

      // Espera exponencial antes do próximo retry
      if (tentativa < tentativasMaximas - 1) {
        const espera = Math.min(1000 * 2 ** tentativa, 10_000);
        await new Promise((resolve) => setTimeout(resolve, espera));
      }
    }
  }

  throw ultimoErro ?? new Error('Falha na requisição após todas as tentativas');
}

/**
 * Erro tipado da API com status HTTP e detalhes de validação.
 */
export class ErroApi extends Error {
  constructor(
    public readonly status: number,
    mensagem: string,
    public readonly detalhes?: Record<string, string[]>
  ) {
    super(mensagem);
    this.name = 'ErroApi';
  }
}

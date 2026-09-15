/**
 * Cliente HTTP com retry automático para comunicação com o backend.
 *
 * Inclui:
 * - Retry exponencial para erros de rede
 * - Credentials: include (cookies HttpOnly)
 * - Content-Type JSON por padrão
 */

const URL_BASE_API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/v1`
  : '/api/v1';

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
        let erroBody: { erro?: string; detalhes?: Record<string, string[]>; [key: string]: any } = {
          erro: `HTTP ${resposta.status}`,
        };
        try {
          const textoErro = await obterTextoResposta(resposta);
          if (textoErro && textoErro.trim()) {
            erroBody = JSON.parse(textoErro);
          }
        } catch {
          // Se não for JSON válido, mantém o erro padrão
        }

        // Extrai mensagem amigável de múltiplos formatos (Zod, Hono, Custom)
        let mensagemErro = erroBody.erro;
        if (!mensagemErro && erroBody.error?.issues && Array.isArray(erroBody.error.issues)) {
          mensagemErro = erroBody.error.issues.map((i: any) => i.message).filter(Boolean).join('; ');
        } else if (!mensagemErro && typeof erroBody.error === 'string') {
          mensagemErro = erroBody.error;
        } else if (!mensagemErro && typeof erroBody.message === 'string') {
          mensagemErro = erroBody.message;
        }

        // Não fazer retry em erros de validação/autenticação (4xx)
        if (resposta.status >= 400 && resposta.status < 500) {
          const detalhes = erroBody.detalhes
            ? Object.values(erroBody.detalhes).flat().join(' ')
            : undefined;

          // Se a sessão expirou ou não há token (401), notifica a aplicação para redirecionar ao login
          if (resposta.status === 401 && !rota.includes('/auth/login') && !rota.includes('/auth/me')) {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('auth:nao_autorizado', {
                  detail: { rota, mensagem: mensagemErro ?? 'Sessão expirada. Faça login novamente.' },
                })
              );
            }
          }

          throw new ErroApi(
            resposta.status,
            [mensagemErro ?? 'Erro na requisição', detalhes].filter(Boolean).join(' '),
            erroBody.detalhes
          );
        }

        if (resposta.status === 503) {
          throw new ErroApi(
            503,
            'Serviço temporariamente indisponível (HTTP 503). O servidor backend local pode estar iniciando ou reiniciando.'
          );
        }

        throw new ErroApi(resposta.status, mensagemErro ?? 'Erro no servidor');
      }

      if (resposta.status === 204) {
        return {} as T;
      }

      const texto = await obterTextoResposta(resposta);
      if (!texto || !texto.trim()) {
        return {} as T;
      }

      try {
        return JSON.parse(texto) as T;
      } catch {
        return texto as unknown as T;
      }
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

async function obterTextoResposta(resposta: Response): Promise<string> {
  if (typeof resposta.text === 'function') {
    return resposta.text();
  }

  if (typeof resposta.json === 'function') {
    const dados = await resposta.json();
    return typeof dados === 'string' ? dados : JSON.stringify(dados);
  }

  return '';
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

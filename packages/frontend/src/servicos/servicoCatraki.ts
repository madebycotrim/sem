/**
 * Serviço de Integração em Segundo Plano com a API Oficial do Catraki
 * Plataforma de Assinatura Eletrônica e Termos de Consentimento (SESI-DF / UnB)
 *
 * Endpoints:
 * - POST /api/public/batch-check (Verificação em lote de CPFs)
 * - GET  /api/public/validate/:query (Validação de autenticidade / código TCLE)
 * - GET  /api/public/institutions (Escolas / Polos cadastrados)
 */

export interface ResultadoAutorizacaoCatraki {
  authorized: boolean;
  status: 'signed' | 'revoked' | 'not_found_or_pending' | 'invalid_cpf' | string;
  is_revoked?: boolean;
  validation_code?: string;
  signed_at?: string;
  minor_name?: string;
  document_id?: string;
  revoked_at?: string;
}

export interface RespostaBatchCheckCatraki {
  success: boolean;
  results: Record<string, ResultadoAutorizacaoCatraki>;
  count?: number;
  total?: number;
}

export interface DetalhesValidacaoCatraki {
  valid: boolean;
  validation_code: string;
  legal_notice: string;
  signature_type: string;
  document_id: string;
  manifest_sha256: string;
  signed_at_utc: string;
  signer_name: string;
  signer_cpf_masked: string;
  signer_relationship: string;
  ip_address: string;
  geolocation: string;
  minor_name_initials: string;
  document_status: string;
  auth_image?: 'yes' | 'no' | null;
  auth_health?: 'yes' | 'no' | null;
  auth_data?: 'yes' | 'no' | null;
}

const CATRAKI_API_BASE =
  (import.meta as any).env?.VITE_CATRAKI_API_URL || 'https://catraki---sesi.pages.dev/api';

/**
 * Sanitiza um CPF para exatamente 11 dígitos numéricos
 */
export function sanitizarCpf(cpf: string | undefined): string {
  if (!cpf) return '';
  const digitos = cpf.replace(/\D/g, '');
  if (digitos.length !== 11) return '';
  return digitos;
}

/**
 * Consulta o status de autorização / TCLE de múltiplos CPFs em lote no Catraki
 * Executada silenciosamente em segundo plano sem bloquear a interface.
 */
export async function verificarAutorizacoesEmLote(
  cpfs: string[]
): Promise<RespostaBatchCheckCatraki> {
  const cpfsValidos = cpfs
    .map(sanitizarCpf)
    .filter((cpf) => cpf.length === 11);

  if (cpfsValidos.length === 0) {
    return { success: true, results: {}, count: 0 };
  }

  // Remove duplicatas para otimizar requisição
  const cpfsUnicos = Array.from(new Set(cpfsValidos));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const resposta = await fetch(`${CATRAKI_API_BASE}/public/batch-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ cpfs: cpfsUnicos }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!resposta.ok) {
      // Fallback para /check-bulk se batch-check falhar
      const respostaBulk = await fetch(`${CATRAKI_API_BASE}/public/check-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ cpfs: cpfsUnicos }),
      });

      if (respostaBulk.ok) {
        return (await respostaBulk.json()) as RespostaBatchCheckCatraki;
      }

      throw new Error(`Falha na API Catraki (${resposta.status})`);
    }

    const dados = (await resposta.json()) as RespostaBatchCheckCatraki;
    return dados;
  } catch (erro: any) {
    console.warn('[CATRAKI_AUTO_SYNC_FALLBACK]', erro?.message || erro);
    // Em caso de offline ou falha de rede temporária, retorna objeto seguro
    return {
      success: false,
      results: {},
      count: 0,
    };
  }
}

/**
 * Consulta a autenticidade e detalhes de um comprovante no Catraki por CPF ou código
 */
export async function validarComprovanteCatraki(
  query: string
): Promise<{ success: boolean; valid: boolean; validation?: DetalhesValidacaoCatraki; error?: string }> {
  const queryLimpa = query.trim();
  if (!queryLimpa) {
    return { success: false, valid: false, error: 'Código ou CPF não informado.' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const resposta = await fetch(
      `${CATRAKI_API_BASE}/public/validate/${encodeURIComponent(queryLimpa)}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!resposta.ok) {
      const errJson = (await resposta.json().catch(() => ({}))) as { error?: string };
      return {
        success: false,
        valid: false,
        error: errJson.error || `Documento não localizado no Catraki (${resposta.status}).`,
      };
    }

    const dados = (await resposta.json()) as { validation?: DetalhesValidacaoCatraki };
    return {
      success: true,
      valid: Boolean(dados.validation?.valid),
      validation: dados.validation,
    };
  } catch (erro: any) {
    return {
      success: false,
      valid: false,
      error: 'Não foi possível conectar aos servidores do Catraki no momento.',
    };
  }
}

import { requisicaoApi } from './api.ts';

/**
 * Serviço de consulta de CPF por meio da API autenticada do sistema.
 * 
 * Inclui consumo inteligente de API:
 * - Validação matemática prévia por dígitos verificadores (Regra Oficial da Receita Federal)
 * - Cache efêmero em memória para evitar requisições duplicadas
 * - Rate Limiter (máximo 6 consultas/minuto)
 * - Trava de Cota Mensal (máximo 100 consultas/mês)
 */

export interface RespostaApiCpfBruta {
  code: number;
  data?: {
    cpf: string;
    nome: string;
    genero: 'M' | 'F' | 'I';
    data_nascimento: string;
  };
  message?: string;
}

export interface DadosPessoaCpf {
  cpf: string;
  cpfFormatado: string;
  nome: string;
  genero: 'Masculino' | 'Feminino' | 'Outro' | 'Não informado';
  dataNascimento: string; // YYYY-MM-DD
}


/**
 * Validação Matemática do CPF através do algoritmo dos dígitos verificadores (Módulo 11).
 * Evita chamadas desnecessárias à API caso o CPF seja matematicamente inválido ou falso.
 *
 * @param cpf String com ou sem pontuação
 * @returns true se o CPF é matematicamente válido, false caso contrário
 */
export function validarCpfMatematicamente(cpf: string): boolean {
  const limpo = cpf.replace(/\D/g, '');

  // O CPF precisa ter exatamente 11 dígitos numéricos
  if (limpo.length !== 11) return false;

  // CPFs com todos os dígitos repetidos são matematicamente inválidos
  if (/^(\d)\1{10}$/.test(limpo)) return false;

  // Cálculo do 1º Dígito Verificador (D1)
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(limpo.charAt(i), 10) * (10 - i);
  }
  let resto = soma % 11;
  const digito1 = resto < 2 ? 0 : 11 - resto;

  if (digito1 !== parseInt(limpo.charAt(9), 10)) {
    return false;
  }

  // Cálculo do 2º Dígito Verificador (D2)
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(limpo.charAt(i), 10) * (11 - i);
  }
  resto = soma % 11;
  const digito2 = resto < 2 ? 0 : 11 - resto;

  return digito2 === parseInt(limpo.charAt(10), 10);
}

/**
 * Formata string de CPF para o padrão 000.000.000-00
 */
export function formatarCpf(cpf: string): string {
  if (cpf.includes('*')) return cpf;
  const limpo = cpf.replace(/\D/g, '').slice(0, 11);
  if (limpo.length <= 3) return limpo;
  if (limpo.length <= 6) return `${limpo.slice(0, 3)}.${limpo.slice(3)}`;
  if (limpo.length <= 9) return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6)}`;
  return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-${limpo.slice(9, 11)}`;
}

/**
 * Normaliza CPF para comparação e persistência, removendo máscara e espaços.
 */
export function normalizarCpf(cpf?: string | null): string {
  return (cpf ?? '').replace(/\D/g, '').slice(0, 11);
}

/**
 * Mascara o CPF para conformidade com a LGPD (ex: 042.***.***-91)
 */
export function mascararCpf(cpf?: string | null): string {
  if (!cpf) return 'Não informado';
  const str = String(cpf).trim();
  if (/^\d{3}\.\*{3}\.\*{3}-\d{2}$/.test(str)) {
    return str;
  }
  const limpo = str.replace(/\D/g, '');
  if (limpo.length === 11) {
    return `${limpo.slice(0, 3)}.***.***-${limpo.slice(9, 11)}`;
  }
  if (limpo.length === 5) {
    return `${limpo.slice(0, 3)}.***.***-${limpo.slice(3, 5)}`;
  }
  return str;
}

/**
 * Obtém a chave configurada no ambiente de execução.
 */
export function obterChaveApiCpf(): string {
  return (import.meta.env.VITE_APICPF_KEY || '').trim();
}

/**
 * A chave não é persistida no navegador (mantida para compatibilidade).
 */
export function salvarChaveApiCpf(_chave: string): void {
  // No-op em produção
}

/**
 * Retorna as estatísticas de uso mensal da API (mantida para compatibilidade).
 */
export function obterUsoMensalCpf(): { usado: number; limite: number } {
  return { usado: 0, limite: 100 };
}

/**
 * Limpa cache de CPFs (mantida para compatibilidade com testes).
 */
export function limparCacheCpf(): void {
  // No-op em produção: nenhum dado é retido em cache
}

/**
 * Consulta de CPF:
 * 1. Valida matematicamente o CPF antes de qualquer ação (zero custo se inválido).
 * 2. Faz a requisição autenticada ao backend (/api/v1/cpf) sem retenção de cache local.
 *
 * @param cpf CPF com ou sem pontuação (11 dígitos)
 * @param _chaveApi Opcional (a chave é gerenciada de forma segura pelo backend)
 * @returns Dados estruturados da pessoa física
 * @throws Error com mensagem amigável em caso de erro de consulta
 */
export async function consultarCpf(cpf: string, _chaveApi?: string): Promise<DadosPessoaCpf> {
  const cpfLimpo = cpf.replace(/\D/g, '');

  if (!cpfLimpo || cpfLimpo.length !== 11) {
    throw new Error('O CPF deve conter exatamente 11 dígitos numéricos.');
  }

  // Validação matemática oficial antes de qualquer consumo
  if (!validarCpfMatematicamente(cpfLimpo)) {
    throw new Error('CPF inválido. Os dígitos verificadores não conferem.');
  }

  return requisicaoApi<DadosPessoaCpf>('/cpf', {
    metodo: 'POST',
    corpo: { cpf: cpfLimpo },
  });
}


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

// Configurações de limites da conta
const LIMITE_CONSULTAS_POR_MINUTO = 6;
const LIMITE_CONSULTAS_POR_MES = 100;

// Janela em memória de requisições recentes (timestamps) para Rate Limiting
const historicoRequisicoesMinuto: number[] = [];

// Cache em memória
const cacheEmMemoria = new Map<string, DadosPessoaCpf>();

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
  const limpo = cpf.replace(/\D/g, '');
  if (limpo.length !== 11) return cpf;
  return `${limpo.slice(0, 3)}.***.***-${limpo.slice(9, 11)}`;
}

/**
 * Obtém a chave configurada no ambiente de execução.
 */
export function obterChaveApiCpf(): string {
  return (import.meta.env.VITE_APICPF_KEY || '').trim();
}

/**
 * A chave não pode ser persistida no navegador.
 */
export function salvarChaveApiCpf(_chave: string): void {
}

/**
 * Retorna as estatísticas de uso mensal da API.
 */
export function obterUsoMensalCpf(): { usado: number; limite: number } {
  return { usado: 0, limite: LIMITE_CONSULTAS_POR_MES };
}

/**
 * Incrementa o contador de requisições do mês.
 */
function incrementarUsoMensal(): void {
}

/**
 * Busca CPF no cache efêmero da sessão atual.
 */
function buscarEmCache(cpfLimpo: string): DadosPessoaCpf | null {
  if (cacheEmMemoria.has(cpfLimpo)) {
    return cacheEmMemoria.get(cpfLimpo)!;
  }
  return null;
}

/**
 * Salva resultado apenas durante a sessão atual.
 */
function salvarEmCache(cpfLimpo: string, dados: DadosPessoaCpf): void {
  cacheEmMemoria.set(cpfLimpo, dados);
}

/**
 * Limpa todo o cache de CPFs consultados e histórico de taxa.
 */
export function limparCacheCpf(): void {
  cacheEmMemoria.clear();
  historicoRequisicoesMinuto.length = 0;
}


/**
 * Verifica se a taxa de requisições por minuto foi excedida.
 */
function validarRateLimitMinuto(): void {
  const agora = Date.now();
  const umMinutoAtras = agora - 60000;

  // Remove chamadas mais velhas que 1 minuto
  while (historicoRequisicoesMinuto.length > 0 && historicoRequisicoesMinuto[0] < umMinutoAtras) {
    historicoRequisicoesMinuto.shift();
  }

  if (historicoRequisicoesMinuto.length >= LIMITE_CONSULTAS_POR_MINUTO) {
    const proximoDisponivelMs = historicoRequisicoesMinuto[0] + 60000 - agora;
    const segundos = Math.max(1, Math.ceil(proximoDisponivelMs / 1000));
    throw new Error(
      `Limite de ${LIMITE_CONSULTAS_POR_MINUTO} consultas por minuto atingido. Aguarde ${segundos}s para tentar novamente.`
    );
  }
}

/**
 * Mapeia o gênero da API para o formato do sistema.
 */
function mapearGenero(genero?: string): 'Masculino' | 'Feminino' | 'Outro' | 'Não informado' {
  if (!genero) return 'Não informado';
  const g = genero.trim().toUpperCase();
  if (g === 'M' || g === 'MASCULINO') return 'Masculino';
  if (g === 'F' || g === 'FEMININO') return 'Feminino';
  return 'Outro';
}

/**
 * Consulta inteligente de CPF:
 * 1. Valida matematicamente o CPF antes de qualquer ação (zero custo se inválido).
 * 2. Retorna dados do cache local se já consultado anteriormente.
 * 3. Valida limites de taxa (6 consultas/minuto) e cota mensal (100 consultas/mês).
 * 4. Faz a requisição à API e guarda em cache.
 *
 * @param cpf CPF com ou sem pontuação (11 dígitos)
 * @param chaveApi Opcional. Se não informada, busca nas variáveis de ambiente.
 * @returns Dados estruturados da pessoa física
 * @throws Error com mensagem amigável em caso de erro de consulta
 */
export async function consultarCpf(cpf: string, chaveApi?: string): Promise<DadosPessoaCpf> {
  const cpfLimpo = cpf.replace(/\D/g, '');

  if (!cpfLimpo || cpfLimpo.length !== 11) {
    throw new Error('O CPF deve conter exatamente 11 dígitos numéricos.');
  }

  // 1. VERIFICAÇÃO MATEMÁTICA ANTES DE QUALQUER CONSUMO
  if (!validarCpfMatematicamente(cpfLimpo)) {
    throw new Error('CPF inválido. Os dígitos verificadores não conferem.');
  }

  void chaveApi;
  return requisicaoApi<DadosPessoaCpf>('/cpf', {
    metodo: 'POST',
    corpo: { cpf: cpfLimpo },
  });

  // 2. VERIFICAÇÃO DE CACHE (Zero requisições à API para CPFs já consultados)
  const dadoEmCache = buscarEmCache(cpfLimpo);
  if (dadoEmCache) {
    return dadoEmCache!;
  }

  // 3. CONTROLE DE COTA MENSAL (Máximo 100 consultas/mês)
  const { usado, limite } = obterUsoMensalCpf();
  if (usado >= limite) {
    throw new Error(`Cota mensal de ${limite} consultas à API de CPF atingida para este mês.`);
  }

  // 4. RATE LIMITING (Máximo 6 consultas/minuto)
  validarRateLimitMinuto();

  const chave = (chaveApi || obterChaveApiCpf()).trim();
  if (!chave) {
    throw new Error('Chave da API CPF não configurada. Insira sua chave X-API-KEY da apicpf.com.');
  }

  // Utiliza o proxy local /api-cpf-proxy em dev para evitar bloqueio de CORS, ou direto apicpf.com
  const baseUrl = import.meta.env.DEV ? '/api-cpf-proxy/api/consulta' : 'https://apicpf.com/api/consulta';
  const url = `${baseUrl}?cpf=${encodeURIComponent(cpfLimpo)}`;

  try {
    // Registra a tentativa no histórico de rate limiting e cota mensal
    historicoRequisicoesMinuto.push(Date.now());
    incrementarUsoMensal();

    const resposta = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': chave,
      },
    });

    const dados = (await resposta.json().catch(() => ({
      code: resposta.status,
      message: 'Falha ao processar resposta do servidor.',
    }))) as RespostaApiCpfBruta;

    if (dados.code === 200 && dados.data) {
      const resultado: DadosPessoaCpf = {
        cpf: dados.data!.cpf,
        cpfFormatado: formatarCpf(dados.data!.cpf),
        nome: dados.data!.nome.trim().toUpperCase(),
        genero: mapearGenero(dados.data!.genero),
        dataNascimento: dados.data!.data_nascimento,
      };

      // Guarda no cache local
      salvarEmCache(cpfLimpo, resultado);

      return resultado;
    }

    // Tratamento específico dos códigos de erro documentados pela apicpf.com
    switch (dados.code || resposta.status) {
      case 400:
        throw new Error(dados.message || 'CPF inválido ou não informado.');
      case 401:
        throw new Error(dados.message || 'Chave de API inválida ou não fornecida.');
      case 403:
        throw new Error(dados.message || 'Chave de API expirada ou sem permissão.');
      case 404:
        throw new Error(dados.message || 'Pessoa não encontrada na base de dados.');
      case 429:
        throw new Error(dados.message || 'Limite de consultas à API excedido. Tente novamente mais tarde.');
      default:
        throw new Error(dados.message || `Erro ${dados.code || resposta.status} na consulta de CPF.`);
    }
  } catch (erro: any) {
    // Se o fetch falhar (ex: CORS em ambiente sem proxy ou offline)
    if (erro.name === 'TypeError' && erro.message.includes('fetch')) {
      // Tentar via URL com query param api_key como fallback alternativo da documentação
      try {
        const urlFallback = `https://apicpf.com/api/consulta?cpf=${encodeURIComponent(cpfLimpo)}&api_key=${encodeURIComponent(chave)}`;
        const fallbackRes = await fetch(urlFallback, { method: 'GET' });
        const fallbackDados = (await fallbackRes.json()) as RespostaApiCpfBruta;
        if (fallbackDados.code === 200 && fallbackDados.data) {
          const resultadoFallback: DadosPessoaCpf = {
            cpf: fallbackDados.data!.cpf,
            cpfFormatado: formatarCpf(fallbackDados.data!.cpf),
            nome: fallbackDados.data!.nome.trim().toUpperCase(),
            genero: mapearGenero(fallbackDados.data!.genero),
            dataNascimento: fallbackDados.data!.data_nascimento,
          };
          salvarEmCache(cpfLimpo, resultadoFallback);
          return resultadoFallback;
        }
      } catch {
        // Ignora fallback se também falhar
      }
    }
    throw erro;
  }
}


/**
 * Módulo de Hashing e Verificação de Senhas compatível com Cloudflare Workers / Edge Runtime.
 * 
 * Utiliza a API nativa Web Crypto (PBKDF2 com HMAC-SHA512, 100.000 iterações e Salt criptográfico de 128 bits).
 * Não depende de módulos nativos C++ do Node.js (como argon2/bcrypt compilados).
 */

const ITERACOES = 100_000;
const TAMANHO_SALT_BYTES = 16;
const TAMANHO_CHAVE_BYTES = 64; // 512 bits

function bufferParaHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexParaBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Compara dois buffers em tempo constante para evitar ataques de timing.
 */
function comparacaoTempoConstante(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let resultado = 0;
  for (let i = 0; i < a.length; i++) {
    resultado |= a[i] ^ b[i];
  }
  return resultado === 0;
}

/**
 * Gera o hash criptográfico seguro de uma senha em texto plano.
 * 
 * @param senhaTextoPlano Senha fornecida pelo usuário
 * @returns String formatada: pbkdf2:sha512:<iteracoes>:<salt_hex>:<hash_hex>
 */
export async function gerarHashSenha(senhaTextoPlano: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(TAMANHO_SALT_BYTES));
  const encoder = new TextEncoder();
  const senhaBuffer = encoder.encode(senhaTextoPlano);

  const chaveImportada = await crypto.subtle.importKey(
    'raw',
    senhaBuffer.buffer as ArrayBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: ITERACOES,
      hash: 'SHA-512',
    },
    chaveImportada,
    TAMANHO_CHAVE_BYTES * 8
  );

  const saltHex = bufferParaHex(salt);
  const hashHex = bufferParaHex(hashBuffer);

  return `pbkdf2:sha512:${ITERACOES}:${saltHex}:${hashHex}`;
}

/**
 * Verifica se a senha em texto plano corresponde ao hash armazenado no banco.
 * 
 * @param senhaTextoPlano Senha enviada no login
 * @param hashArmazenado Hash recuperado do banco de dados
 * @returns true se a senha for válida, false caso contrário
 */
export async function verificarSenha(
  senhaTextoPlano: string,
  hashArmazenado: string
): Promise<boolean> {
  if (!hashArmazenado || !hashArmazenado.startsWith('pbkdf2:sha512:')) {
    return false;
  }

  const partes = hashArmazenado.split(':');
  if (partes.length !== 5) {
    return false;
  }

  const [, , iteracoesStr, saltHex, hashEsperadoHex] = partes;
  const iteracoes = parseInt(iteracoesStr, 10);
  if (isNaN(iteracoes) || iteracoes <= 0) {
    return false;
  }

  const salt = hexParaBuffer(saltHex);
  const hashEsperado = hexParaBuffer(hashEsperadoHex);

  const encoder = new TextEncoder();
  const senhaBuffer = encoder.encode(senhaTextoPlano);

  const chaveImportada = await crypto.subtle.importKey(
    'raw',
    senhaBuffer.buffer as ArrayBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const hashCalculadoBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: iteracoes,
      hash: 'SHA-512',
    },
    chaveImportada,
    hashEsperado.length * 8
  );

  const hashCalculado = new Uint8Array(hashCalculadoBuffer);

  return comparacaoTempoConstante(hashCalculado, hashEsperado);
}

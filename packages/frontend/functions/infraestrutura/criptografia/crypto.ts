/**
 * Módulo de Criptografia AES-256-GCM com Envelope Encryption compatível com Web Crypto API.
 * 
 * Suporta execução tanto em Node.js quanto no Edge / Cloudflare Workers runtime.
 */

const IV_BYTES = 12; // 96 bits
const TAG_BITS = 128; // 16 bytes
const DEK_BYTES = 32; // 256 bits

export interface ResultadoCriptografia {
  dadosCifrados: string;
  dekCifrada: string;
  iv: string;
  tag: string;
}

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

function parseKek(kekHex: string): Uint8Array {
  if (!kekHex || kekHex.length !== 64) {
    throw new Error('KEK_HEX deve ter exatamente 64 caracteres hexadecimais (256 bits).');
  }
  return hexParaBuffer(kekHex);
}

async function importarChaveAesGcm(chaveRaw: Uint8Array): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    chaveRaw.buffer as ArrayBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

async function cifrarDek(dek: Uint8Array, kek: Uint8Array): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const chaveKek = await importarChaveAesGcm(kek);

  const cifradoComTag = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, tagLength: TAG_BITS },
    chaveKek,
    dek.buffer as ArrayBuffer
  );

  const cifradoComTagBytes = new Uint8Array(cifradoComTag);
  const ciphertext = cifradoComTagBytes.slice(0, cifradoComTagBytes.length - 16);
  const tag = cifradoComTagBytes.slice(cifradoComTagBytes.length - 16);

  return `${bufferParaHex(iv)}:${bufferParaHex(tag)}:${bufferParaHex(ciphertext)}`;
}

async function decifrarDek(dekCifrada: string, kek: Uint8Array): Promise<Uint8Array> {
  const partes = dekCifrada.split(':');
  if (partes.length !== 3) {
    throw new Error('Formato de DEK cifrada inválido (esperado iv:tag:ciphertext)');
  }
  const [ivHex, tagHex, ciphertextHex] = partes;
  const iv = hexParaBuffer(ivHex);
  const tag = hexParaBuffer(tagHex);
  const ciphertext = hexParaBuffer(ciphertextHex);

  const payload = new Uint8Array(ciphertext.length + tag.length);
  payload.set(ciphertext, 0);
  payload.set(tag, ciphertext.length);

  const chaveKek = await importarChaveAesGcm(kek);
  const dekDecifrada = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer, tagLength: TAG_BITS },
    chaveKek,
    payload.buffer as ArrayBuffer
  );

  return new Uint8Array(dekDecifrada);
}

/**
 * Criptografa dados PII usando envelope encryption (AES-256-GCM + KEK/DEK).
 */
export async function criptografarPii(
  dadosTextoPlano: string,
  kekHex: string
): Promise<ResultadoCriptografia> {
  const kek = parseKek(kekHex);
  const dek = crypto.getRandomValues(new Uint8Array(DEK_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));

  const encoder = new TextEncoder();
  const dadosBuffer = encoder.encode(dadosTextoPlano);

  const chaveDek = await importarChaveAesGcm(dek);
  const cifradoComTag = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer, tagLength: TAG_BITS },
    chaveDek,
    dadosBuffer.buffer as ArrayBuffer
  );

  const cifradoComTagBytes = new Uint8Array(cifradoComTag);
  const ciphertext = cifradoComTagBytes.slice(0, cifradoComTagBytes.length - 16);
  const tag = cifradoComTagBytes.slice(cifradoComTagBytes.length - 16);

  const dekCifradaStr = await cifrarDek(dek, kek);

  return {
    dadosCifrados: bufferParaHex(ciphertext),
    dekCifrada: dekCifradaStr,
    iv: bufferParaHex(iv),
    tag: bufferParaHex(tag),
  };
}

/**
 * Descriptografa dados PII previamente cifrados com envelope encryption.
 */
export async function descriptografarPii(
  dadosCifrados: string,
  dekCifrada: string,
  iv: string,
  tag: string,
  kekHex: string
): Promise<string> {
  const kek = parseKek(kekHex);
  const dek = await decifrarDek(dekCifrada, kek);

  const ivBytes = hexParaBuffer(iv);
  const tagBytes = hexParaBuffer(tag);
  const ciphertextBytes = hexParaBuffer(dadosCifrados);

  const payload = new Uint8Array(ciphertextBytes.length + tagBytes.length);
  payload.set(ciphertextBytes, 0);
  payload.set(tagBytes, ciphertextBytes.length);

  const chaveDek = await importarChaveAesGcm(dek);
  const decifrado = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes.buffer as ArrayBuffer, tagLength: TAG_BITS },
    chaveDek,
    payload.buffer as ArrayBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decifrado);
}

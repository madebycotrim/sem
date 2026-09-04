import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'node:crypto';

/**
 * Módulo de Criptografia AES-256-GCM com Envelope Encryption.
 *
 * Implementa o padrão de envelope encryption para proteção de PII
 * de pacientes (LGPD Art. 46 — Medidas de Segurança):
 *
 * 1. KEK (Key Encryption Key): chave mestra de 256 bits, carregada
 *    de variável de ambiente (`KEK_HEX`). NUNCA versionada no código.
 *    Plano de migração futura para KMS/Vault em produção.
 *
 * 2. DEK (Data Encryption Key): chave aleatória de 256 bits gerada
 *    por registro/lote. Usada para cifrar os dados com AES-256-GCM.
 *    A DEK é então cifrada pela KEK e armazenada no banco junto ao registro.
 *
 * Vantagens do envelope encryption:
 * - Rotação da KEK não exige re-criptografar todos os dados (apenas re-cifrar as DEKs).
 * - Chave de dados nunca trafega em texto puro fora da memória do processo.
 * - Compatível com migração para KMS gerenciado (AWS KMS, GCP KMS, Azure Key Vault).
 */

const ALGORITMO = 'aes-256-gcm' as const;
const IV_BYTES = 12; // 96 bits — recomendado para GCM
const TAG_BYTES = 16; // 128 bits — authentication tag
const DEK_BYTES = 32; // 256 bits

/** Resultado da operação de criptografia */
export interface ResultadoCriptografia {
  /** Dados cifrados em hexadecimal */
  dadosCifrados: string;
  /** DEK cifrada pela KEK em hexadecimal */
  dekCifrada: string;
  /** Initialization Vector em hexadecimal */
  iv: string;
  /** Authentication Tag em hexadecimal */
  tag: string;
}

/**
 * Converte a KEK de hexadecimal para Buffer, validando o tamanho.
 * @param kekHex Chave mestra em hexadecimal (64 caracteres = 256 bits)
 * @throws Erro se a KEK não tiver o tamanho correto
 */
function parseKek(kekHex: string): Buffer {
  if (!kekHex || kekHex.length !== 64) {
    throw new Error(
      'KEK_HEX deve ter exatamente 64 caracteres hexadecimais (256 bits). ' +
        'Gere com: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  return Buffer.from(kekHex, 'hex');
}

/**
 * Cifra a DEK usando a KEK (AES-256-GCM).
 * @param dek DEK em Buffer (32 bytes)
 * @param kek KEK em Buffer (32 bytes)
 * @returns DEK cifrada em hexadecimal (iv:tag:ciphertext)
 */
function cifrarDek(dek: Buffer, kek: Buffer): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITMO, kek, iv);
  const cifrado = Buffer.concat([cipher.update(dek), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Formato: iv:tag:ciphertext (tudo em hex)
  return `${iv.toString('hex')}:${tag.toString('hex')}:${cifrado.toString('hex')}`;
}

/**
 * Decifra a DEK usando a KEK.
 * @param dekCifrada DEK cifrada no formato iv:tag:ciphertext (hex)
 * @param kek KEK em Buffer (32 bytes)
 * @returns DEK decifrada em Buffer
 */
function decifrarDek(dekCifrada: string, kek: Buffer): Buffer {
  const partes = dekCifrada.split(':');
  if (partes.length !== 3) {
    throw new Error('Formato de DEK cifrada inválido (esperado iv:tag:ciphertext)');
  }
  const [ivHex, tagHex, ciphertextHex] = partes;
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');

  const decipher = createDecipheriv(ALGORITMO, kek, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

/**
 * Criptografa dados PII de um paciente usando envelope encryption.
 *
 * @param dadosTextoPlano String JSON com os dados PII a criptografar
 * @param kekHex KEK em hexadecimal (64 caracteres)
 * @returns Resultado com dados cifrados, DEK cifrada, IV e tag
 *
 * @example
 * ```typescript
 * const pii = JSON.stringify({ nome: 'João', cpf: '12345678901' });
 * const resultado = criptografarPii(pii, process.env.KEK_HEX!);
 * // Persistir: resultado.dadosCifrados, resultado.dekCifrada, resultado.iv, resultado.tag
 * ```
 */
export function criptografarPii(
  dadosTextoPlano: string,
  kekHex: string
): ResultadoCriptografia {
  const kek = parseKek(kekHex);

  // 1. Gerar DEK aleatória para este registro
  const dek = randomBytes(DEK_BYTES);

  // 2. Cifrar os dados com a DEK
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITMO, dek, iv);
  const cifrado = Buffer.concat([
    cipher.update(dadosTextoPlano, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  // 3. Cifrar a DEK com a KEK
  const dekCifradaStr = cifrarDek(dek, kek);

  return {
    dadosCifrados: cifrado.toString('hex'),
    dekCifrada: dekCifradaStr,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * Descriptografa dados PII de um paciente.
 *
 * @param dadosCifrados Dados cifrados em hexadecimal
 * @param dekCifrada DEK cifrada no formato iv:tag:ciphertext (hex)
 * @param iv IV usado na cifração (hex)
 * @param tag Authentication tag (hex)
 * @param kekHex KEK em hexadecimal (64 caracteres)
 * @returns String JSON com os dados PII originais
 *
 * @example
 * ```typescript
 * const json = descriptografarPii(
 *   registro.dadosCifrados,
 *   registro.dekCifrada,
 *   registro.ivPii,
 *   registro.tagPii,
 *   process.env.KEK_HEX!
 * );
 * const pii = JSON.parse(json); // { nome: 'João', cpf: '12345678901' }
 * ```
 */
export function descriptografarPii(
  dadosCifrados: string,
  dekCifrada: string,
  iv: string,
  tag: string,
  kekHex: string
): string {
  const kek = parseKek(kekHex);

  // 1. Decifrar a DEK com a KEK
  const dek = decifrarDek(dekCifrada, kek);

  // 2. Decifrar os dados com a DEK
  const ivBuf = Buffer.from(iv, 'hex');
  const tagBuf = Buffer.from(tag, 'hex');
  const ciphertext = Buffer.from(dadosCifrados, 'hex');

  if (tagBuf.length !== TAG_BYTES) {
    throw new Error(
      `Authentication tag inválida: esperado ${TAG_BYTES} bytes, recebido ${tagBuf.length}`
    );
  }

  const decipher = createDecipheriv(ALGORITMO, dek, ivBuf);
  decipher.setAuthTag(tagBuf);
  const decifrado = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decifrado.toString('utf8');
}

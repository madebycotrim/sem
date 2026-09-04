import { describe, it, expect } from 'vitest';
import { criptografarPii, descriptografarPii } from '../infraestrutura/criptografia/crypto.js';
import { randomBytes } from 'node:crypto';

/**
 * Testes do módulo de criptografia AES-256-GCM com envelope encryption.
 *
 * Verifica:
 * 1. Cifrar → Decifrar retorna dados originais (round-trip)
 * 2. KEK diferente → falha na descriptografia
 * 3. Dados corrompidos → falha na descriptografia
 * 4. KEK com formato inválido → erro claro
 */

// KEK válida para testes (256 bits em hex)
const KEK_TESTE = randomBytes(32).toString('hex');

describe('Módulo de Criptografia (AES-256-GCM + Envelope Encryption)', () => {
  const dadosPii = JSON.stringify({
    nome: 'João da Silva',
    cpf: '12345678901',
    dataNascimento: '2010-05-15',
    telefone: '61999998888',
  });

  it('deve cifrar e decifrar dados PII corretamente (round-trip)', () => {
    const resultado = criptografarPii(dadosPii, KEK_TESTE);

    // Verificar que todos os campos estão presentes
    expect(resultado.dadosCifrados).toBeTruthy();
    expect(resultado.dekCifrada).toBeTruthy();
    expect(resultado.iv).toBeTruthy();
    expect(resultado.tag).toBeTruthy();

    // Verificar que os dados cifrados são diferentes dos originais
    expect(resultado.dadosCifrados).not.toBe(dadosPii);

    // Decifrar e verificar
    const decifrado = descriptografarPii(
      resultado.dadosCifrados,
      resultado.dekCifrada,
      resultado.iv,
      resultado.tag,
      KEK_TESTE
    );

    expect(decifrado).toBe(dadosPii);

    const piiRecuperada = JSON.parse(decifrado);
    expect(piiRecuperada.nome).toBe('João da Silva');
    expect(piiRecuperada.cpf).toBe('12345678901');
    expect(piiRecuperada.dataNascimento).toBe('2010-05-15');
    expect(piiRecuperada.telefone).toBe('61999998888');
  });

  it('deve gerar DEK e IV diferentes a cada cifração (mesmos dados)', () => {
    const resultado1 = criptografarPii(dadosPii, KEK_TESTE);
    const resultado2 = criptografarPii(dadosPii, KEK_TESTE);

    // DEKs diferentes (cada uma cifrada com IV diferente)
    expect(resultado1.dekCifrada).not.toBe(resultado2.dekCifrada);

    // IVs diferentes
    expect(resultado1.iv).not.toBe(resultado2.iv);

    // Dados cifrados diferentes (mesmo texto plano, chaves diferentes)
    expect(resultado1.dadosCifrados).not.toBe(resultado2.dadosCifrados);
  });

  it('deve falhar ao descriptografar com KEK diferente', () => {
    const resultado = criptografarPii(dadosPii, KEK_TESTE);
    const kekErrada = randomBytes(32).toString('hex');

    expect(() =>
      descriptografarPii(
        resultado.dadosCifrados,
        resultado.dekCifrada,
        resultado.iv,
        resultado.tag,
        kekErrada
      )
    ).toThrow();
  });

  it('deve falhar ao descriptografar dados corrompidos', () => {
    const resultado = criptografarPii(dadosPii, KEK_TESTE);

    // Corromper o ciphertext
    const dadosCorrompidos = resultado.dadosCifrados.slice(0, -4) + 'ffff';

    expect(() =>
      descriptografarPii(
        dadosCorrompidos,
        resultado.dekCifrada,
        resultado.iv,
        resultado.tag,
        KEK_TESTE
      )
    ).toThrow();
  });

  it('deve rejeitar KEK com tamanho inválido', () => {
    expect(() => criptografarPii(dadosPii, 'chave_curta')).toThrow(
      'KEK_HEX deve ter exatamente 64 caracteres hexadecimais'
    );
  });

  it('deve rejeitar KEK vazia', () => {
    expect(() => criptografarPii(dadosPii, '')).toThrow(
      'KEK_HEX deve ter exatamente 64 caracteres hexadecimais'
    );
  });

  it('deve lidar com strings vazias como dado PII', () => {
    const dadoVazio = JSON.stringify({ nome: '', cpf: '' });
    const resultado = criptografarPii(dadoVazio, KEK_TESTE);
    const decifrado = descriptografarPii(
      resultado.dadosCifrados,
      resultado.dekCifrada,
      resultado.iv,
      resultado.tag,
      KEK_TESTE
    );

    expect(decifrado).toBe(dadoVazio);
  });

  it('deve lidar com caracteres especiais e acentos', () => {
    const dadosEspeciais = JSON.stringify({
      nome: 'José Antônio da Conceição Müller-Çağlar',
      cpf: '12345678901',
    });

    const resultado = criptografarPii(dadosEspeciais, KEK_TESTE);
    const decifrado = descriptografarPii(
      resultado.dadosCifrados,
      resultado.dekCifrada,
      resultado.iv,
      resultado.tag,
      KEK_TESTE
    );

    const pii = JSON.parse(decifrado);
    expect(pii.nome).toBe('José Antônio da Conceição Müller-Çağlar');
  });
});

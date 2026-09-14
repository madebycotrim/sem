import { describe, it, expect } from 'vitest';
import { gerarBlindIndex } from '../../functions/infraestrutura/criptografia/crypto.ts';

describe('Criptografia e Blind Index - Performance e Segurança LGPD', () => {
  const kekHexTeste = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  it('deve gerar blind index determinístico para o mesmo CPF', async () => {
    const cpfFormatado = '123.456.789-00';
    const cpfLimpo = '12345678900';

    const hash1 = await gerarBlindIndex(cpfFormatado, kekHexTeste);
    const hash2 = await gerarBlindIndex(cpfLimpo, kekHexTeste);

    expect(hash1).toBeDefined();
    expect(hash1.length).toBe(64); // SHA-256 em hex tem 64 caracteres
    expect(hash1).toBe(hash2); // Determinístico independente da pontuação
  });

  it('deve gerar hashes distintos para CPFs distintos (resistência a colisão)', async () => {
    const hash1 = await gerarBlindIndex('11144477735', kekHexTeste);
    const hash2 = await gerarBlindIndex('22255588846', kekHexTeste);

    expect(hash1).not.toBe(hash2);
  });

  it('deve gerar hashes distintos para chaves secretas distintas (proteção HMAC)', async () => {
    const outraChaveHex = 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210';
    const cpf = '52998224725';

    const hashChave1 = await gerarBlindIndex(cpf, kekHexTeste);
    const hashChave2 = await gerarBlindIndex(cpf, outraChaveHex);

    expect(hashChave1).not.toBe(hashChave2);
  });

  it('deve lançar erro caso a chave secreta KEK não possua 64 caracteres hexadecimais', async () => {
    await expect(gerarBlindIndex('12345678900', 'chave_curta')).rejects.toThrow(
      /KEK_HEX deve ter exatamente 64 caracteres/
    );
  });
});

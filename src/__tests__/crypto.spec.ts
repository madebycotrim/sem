import { describe, it, expect } from 'vitest';
import { criptografarPii, descriptografarPii } from '../../functions/infraestrutura/criptografia/crypto.js';
import { gerarHashSenha, verificarSenha } from '../../functions/infraestrutura/criptografia/senha.js';
const KEK_TESTE = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';

describe('Módulo de Criptografia (Pages Functions WebCrypto)', () => {
  const dadosPii = JSON.stringify({
    nome: 'João da Silva',
    cpf: '12345678901',
    dataNascimento: '2010-05-15',
    telefone: '61999998888',
  });

  it('deve cifrar e decifrar dados PII corretamente (round-trip)', async () => {
    const resultado = await criptografarPii(dadosPii, KEK_TESTE);

    expect(resultado.dadosCifrados).toBeTruthy();
    expect(resultado.dekCifrada).toBeTruthy();
    expect(resultado.iv).toBeTruthy();
    expect(resultado.tag).toBeTruthy();
    expect(resultado.dadosCifrados).not.toBe(dadosPii);

    const decifrado = await descriptografarPii(
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
  });

  it('deve gerar hash e verificar senha com sucesso', async () => {
    const senha = 'MinhaSenhaForte@2026!';
    const hash = await gerarHashSenha(senha);

    expect(hash).toMatch(/^pbkdf2:sha512:100000:[a-f0-9]{32}:[a-f0-9]{128}$/);

    const valida = await verificarSenha(senha, hash);
    expect(valida).toBe(true);

    const invalida = await verificarSenha('SenhaErrada@123', hash);
    expect(invalida).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import { gerarSenhaTemporariaSegura, REGEX_SENHA_SEGURA } from '../utilitarios/geradorSenha.ts';

describe('Gerador de Senha Temporária Segura e Validação de Usuários', () => {
  it('deve gerar 100 senhas consecutivas e todas devem satisfazer os critérios de segurança', () => {
    for (let i = 0; i < 100; i++) {
      const senha = gerarSenhaTemporariaSegura(10);
      expect(senha.length).toBeGreaterThanOrEqual(8);
      expect(REGEX_SENHA_SEGURA.test(senha)).toBe(true);

      // Checa individualmente
      expect(/[a-z]/.test(senha)).toBe(true); // Minúscula
      expect(/[A-Z]/.test(senha)).toBe(true); // Maiúscula
      expect(/\d/.test(senha)).toBe(true);    // Número
      expect(/[^a-zA-Z\d\s]/.test(senha)).toBe(true); // Especial
    }
  });

  it('deve rejeitar senhas fracas como catraki123 ou 12345678', () => {
    expect(REGEX_SENHA_SEGURA.test('catraki123')).toBe(false);
    expect(REGEX_SENHA_SEGURA.test('12345678')).toBe(false);
    expect(REGEX_SENHA_SEGURA.test('Catraki123')).toBe(false); // Sem especial
    expect(REGEX_SENHA_SEGURA.test('catraki123!')).toBe(false); // Sem maiúscula
    expect(REGEX_SENHA_SEGURA.test('Catraki!')).toBe(false); // Sem número
    expect(REGEX_SENHA_SEGURA.test('Cat1!')).toBe(false); // Menos de 8 caracteres
  });

  it('deve aceitar senhas fortes que atendem aos 4 requisitos', () => {
    expect(REGEX_SENHA_SEGURA.test('Sem@2026!')).toBe(true);
    expect(REGEX_SENHA_SEGURA.test('A1b2c3d4!')).toBe(true);
  });
});

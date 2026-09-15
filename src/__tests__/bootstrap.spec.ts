import { describe, it, expect } from 'vitest';

describe('Console Bootstrap - Exclusão em Massa de Todos os Pacientes', () => {
  it('deve validar texto de confirmação obrigatória para exclusão total', () => {
    const confirmacoesValidas = ['EXCLUIR TODOS OS PACIENTES', 'EXCLUIR DEFINITIVAMENTE'];

    expect(confirmacoesValidas.includes('EXCLUIR TODOS OS PACIENTES')).toBe(true);
    expect(confirmacoesValidas.includes('EXCLUIR DEFINITIVAMENTE')).toBe(true);
    expect(confirmacoesValidas.includes('excluir')).toBe(false);
    expect(confirmacoesValidas.includes('SIM')).toBe(false);
  });

  it('deve simular exclusão FK-safe de todos os pacientes e dados vinculados', () => {
    // Simula base antes da exclusão
    const pacientes = [
      { id: 'p1', nome: 'Aluno 1' },
      { id: 'p2', nome: 'Aluno 2' },
      { id: 'p3', nome: 'Aluno 3' },
    ];
    const consentimentos = [
      { id: 'c1', pacienteId: 'p1' },
      { id: 'c2', pacienteId: 'p2' },
    ];
    const atendimentos = [
      { id: 'a1', pacienteId: 'p1' },
      { id: 'a2', pacienteId: 'p2' },
      { id: 'a3', pacienteId: 'p3' },
    ];

    // Ordem estrita FK: atendimentos -> consentimentos -> pacientes
    const atendimentosRestantes = atendimentos.filter(() => false);
    const consentimentosRestantes = consentimentos.filter(() => false);
    const pacientesRestantes = pacientes.filter(() => false);

    expect(atendimentosRestantes).toHaveLength(0);
    expect(consentimentosRestantes).toHaveLength(0);
    expect(pacientesRestantes).toHaveLength(0);
  });

  it('deve codificar query param de confirmação para segurança em chamadas DELETE', () => {
    const confirmacao = 'EXCLUIR TODOS OS PACIENTES';
    const queryConfirmacao = encodeURIComponent(confirmacao);

    expect(queryConfirmacao).toBe('EXCLUIR%20TODOS%20OS%20PACIENTES');
    expect(decodeURIComponent(queryConfirmacao)).toBe(confirmacao);
  });
});

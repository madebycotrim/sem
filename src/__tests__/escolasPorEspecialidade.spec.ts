import { describe, it, expect } from 'vitest';
import { calcularMetricasEscola, type EscolaPolo } from '../componentes/Escolas.tsx';
import type { ItemAtendimentoLista } from '../componentes/Atendimentos.tsx';

describe('Escolas - Distribuição por Especialidade abaixo de Total de Atendimentos', () => {
  const escolaMock: EscolaPolo = {
    id: 'escola-1',
    nome: 'CEMEIT DE TAGUATINGA',
    regiao: 'BRASILIA / DF',
    endereco: 'AREA ESPECIAL, 01, TAGUATINGA NORTE',
    alunosMatriculados: 1,
    totalAtendimentos: 2,
    status: 'ESTACIONADA_HOJE',
  };

  const atendimentosMock: ItemAtendimentoLista[] = [
    {
      id: 'atend-1',
      pacienteId: 'pac-1',
      pacienteNome: 'MARIA EDUARDA SILVA',
      especialidade: 'ODONTOLOGIA',
      turno: 'MANHA',
      escolaNome: 'CEMEIT DE TAGUATINGA',
      escolaId: 'escola-1',
      profissionalNome: 'Dra. Gabriela Castro',
      resumo: 'Avaliação odontológica completa',
      criadoEm: '2026-09-14T09:00:00Z',
      status: 'CONCLUIDO',
    },
    {
      id: 'atend-2',
      pacienteId: 'pac-2',
      pacienteNome: 'JOAO VITOR PEREIRA',
      especialidade: 'PSICOLOGIA',
      turno: 'TARDE',
      escolaNome: 'CEMEIT DE TAGUATINGA',
      escolaId: 'escola-1',
      profissionalNome: 'Dra. Luiza Martins',
      resumo: 'Sessão de acolhimento psicológico',
      criadoEm: '2026-09-14T14:00:00Z',
      status: 'CONCLUIDO',
    },
    {
      id: 'atend-3',
      pacienteId: 'pac-3',
      pacienteNome: 'OUTRO ALUNO',
      especialidade: 'OFTALMOLOGIA',
      turno: 'MANHA',
      escolaNome: 'OUTRA ESCOLA',
      escolaId: 'escola-99',
      profissionalNome: 'Dr. Fernando',
      resumo: 'Consulta oftalmológica',
      criadoEm: '2026-09-14T11:00:00Z',
      status: 'CONCLUIDO',
    },
  ];

  it('deve calcular corretamente a distribuição por especialidade vinculada à escola', () => {
    const { ativas, totalAtendimentosCalculado } = calcularMetricasEscola(
      escolaMock,
      atendimentosMock
    );

    expect(totalAtendimentosCalculado).toBe(2);
    expect(ativas).toHaveLength(2);

    const odonto = ativas.find((e) => e.id === 'ODONTOLOGIA');
    const psico = ativas.find((e) => e.id === 'PSICOLOGIA');

    expect(odonto).toBeDefined();
    expect(odonto?.total).toBe(1);
    expect(odonto?.nome).toBe('Odontologia');

    expect(psico).toBeDefined();
    expect(psico?.total).toBe(1);
    expect(psico?.nome).toBe('Psicologia');

    // Não deve conter atendimentos de outra escola
    const oftalmo = ativas.find((e) => e.id === 'OFTALMOLOGIA');
    expect(oftalmo).toBeUndefined();
  });

  it('deve utilizar os dados de atendimentosPorEspecialidade do backend quando não houver lista em memória', () => {
    const escolaComDadosApi: EscolaPolo = {
      id: 'escola-2',
      nome: 'ESCOLA CLASSE 04 DE CEILANDIA',
      regiao: 'CEILANDIA / DF',
      endereco: 'QNN 14 CONJUNTO B',
      alunosMatriculados: 120,
      totalAtendimentos: 5,
      atendimentosPorEspecialidade: {
        OFTALMOLOGIA: 3,
        NUTRICAO: 2,
      },
      status: 'PROGRAMADA',
    };

    const { ativas, totalAtendimentosCalculado } = calcularMetricasEscola(
      escolaComDadosApi,
      []
    );

    expect(totalAtendimentosCalculado).toBe(5);
    expect(ativas).toHaveLength(2);

    const oftalmo = ativas.find((e) => e.id === 'OFTALMOLOGIA');
    const nutri = ativas.find((e) => e.id === 'NUTRICAO');

    expect(oftalmo?.total).toBe(3);
    expect(nutri?.total).toBe(2);
  });

  it('deve retornar lista de ativas vazia e total 0 quando instituição não possuir atendimentos', () => {
    const escolaVazia: EscolaPolo = {
      id: 'escola-3',
      nome: 'ESCOLA PARQUE 308 SUL',
      regiao: 'BRASILIA / DF',
      endereco: 'SQS 308',
      alunosMatriculados: 80,
      totalAtendimentos: 0,
      status: 'PROGRAMADA',
    };

    const { ativas, totalAtendimentosCalculado } = calcularMetricasEscola(
      escolaVazia,
      []
    );

    expect(totalAtendimentosCalculado).toBe(0);
    expect(ativas).toHaveLength(0);
  });

  it('deve retornar todas as 5 especialidades em todas, mesmo que o total seja 0', () => {
    const { todas, ativas } = calcularMetricasEscola(
      escolaMock,
      atendimentosMock
    );

    // Deve conter todas as 5 especialidades do catálogo
    expect(todas).toHaveLength(5);
    const ids = todas.map((e) => e.id);
    expect(ids).toContain('ODONTOLOGIA');
    expect(ids).toContain('PSICOLOGIA');
    expect(ids).toContain('OFTALMOLOGIA');
    expect(ids).toContain('AUDIOMETRIA');
    expect(ids).toContain('NUTRICAO');

    // As ativas continuam sendo apenas as que têm total > 0
    expect(ativas).toHaveLength(2);

    // As não atendidas nesta escola devem ter total === 0
    const oftalmo = todas.find((e) => e.id === 'OFTALMOLOGIA');
    const audio = todas.find((e) => e.id === 'AUDIOMETRIA');
    const nutri = todas.find((e) => e.id === 'NUTRICAO');

    expect(oftalmo?.total).toBe(0);
    expect(audio?.total).toBe(0);
    expect(nutri?.total).toBe(0);

    // As atendidas devem ter seus totais preservados
    const odonto = todas.find((e) => e.id === 'ODONTOLOGIA');
    const psico = todas.find((e) => e.id === 'PSICOLOGIA');
    expect(odonto?.total).toBe(1);
    expect(psico?.total).toBe(1);
  });

  it('deve retornar todas as 5 especialidades com total 0 para escola sem atendimentos', () => {
    const escolaZerada: EscolaPolo = {
      id: 'escola-zero',
      nome: 'ESCOLA NOVA',
      regiao: 'TAGUATINGA / DF',
      endereco: 'QUADRA 1',
      alunosMatriculados: 50,
      totalAtendimentos: 0,
    };

    const { todas } = calcularMetricasEscola(escolaZerada, []);

    expect(todas).toHaveLength(5);
    expect(todas.every((e) => e.total === 0)).toBe(true);
  });
});

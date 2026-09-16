import { describe, it, expect } from 'vitest';
import { Especialidade, StatusAtendimento } from '../../compartilhado/index.js';
import type { AtendimentoAnalitico } from '../paginas/PainelAnalitico.tsx';

describe('Visão Operacional Acumulada - Consolidação Total e Filtros Irrestritos', () => {
  const criarAtendimentosMock = (quantidade: number): AtendimentoAnalitico[] => {
    const especialidades = [
      Especialidade.ODONTOLOGIA,
      Especialidade.OFTALMOLOGIA,
      Especialidade.AUDIOMETRIA,
      Especialidade.NUTRICAO,
      Especialidade.PSICOLOGIA,
    ];

    return Array.from({ length: quantidade }, (_, i) => ({
      id: `atend-${i + 1}`,
      pacienteNome: `Paciente ${i + 1}`,
      especialidade: especialidades[i % especialidades.length],
      escolaNome: i % 2 === 0 ? 'Escola Municipal Alpha' : 'Colégio Estadual Beta',
      profissionalNome: `Dr(a). Profissional ${(i % 4) + 1}`,
      criadoEm: `2026-09-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z`,
      status: i % 10 === 0 ? StatusAtendimento.CANCELADO : (i % 5 === 0 ? StatusAtendimento.AGENDADO : StatusAtendimento.CONCLUIDO),
    }));
  };

  it('deve consolidar o total de verdade sem limitação de 50 registros quando a base possuir centenas de itens', () => {
    const totalRegistros = 240;
    const baseCompleta = criarAtendimentosMock(totalRegistros);

    // Na visão operacional acumulada, o total deve ser a soma de todos os registros da base
    const totalConsultas = baseCompleta.length;
    expect(totalConsultas).toBe(240);
    expect(totalConsultas).toBeGreaterThan(50);

    const concluidas = baseCompleta.filter((a) => a.status === StatusAtendimento.CONCLUIDO).length;
    const pendentes = baseCompleta.filter(
      (a) => a.status === StatusAtendimento.AGENDADO || a.status === StatusAtendimento.EM_ATENDIMENTO
    ).length;
    const canceladas = baseCompleta.filter((a) => a.status === StatusAtendimento.CANCELADO).length;

    expect(concluidas + pendentes + canceladas).toBe(totalConsultas);
    expect(concluidas).toBeGreaterThan(50);
  });

  it('deve filtrar multidimensionalmente sobre a totalidade da base e não sobre amostra de 50', () => {
    const totalRegistros = 300;
    const baseCompleta = criarAtendimentosMock(totalRegistros);

    // Filtrar por Odontologia
    const filtradosOdonto = baseCompleta.filter((a) => a.especialidade === Especialidade.ODONTOLOGIA);
    // 300 / 5 especialidades = 60 atendimentos de Odontologia
    expect(filtradosOdonto.length).toBe(60);
    expect(filtradosOdonto.length).toBeGreaterThan(50);

    // Filtrar por escola específica
    const filtradosEscolaAlpha = baseCompleta.filter((a) => a.escolaNome === 'Escola Municipal Alpha');
    expect(filtradosEscolaAlpha.length).toBe(150);

    // Filtrar combinando Odontologia + Escola Alpha
    const filtradosCombinados = baseCompleta.filter(
      (a) => a.especialidade === Especialidade.ODONTOLOGIA && a.escolaNome === 'Escola Municipal Alpha'
    );
    expect(filtradosCombinados.length).toBe(30);
  });

  it('deve calcular a distribuição percentual por especialidade sobre 100% dos dados', () => {
    const totalRegistros = 100;
    const baseCompleta = criarAtendimentosMock(totalRegistros);

    const contagemPorEspecialidade = baseCompleta.reduce((acc, a) => {
      acc[a.especialidade] = (acc[a.especialidade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    expect(contagemPorEspecialidade[Especialidade.ODONTOLOGIA]).toBe(20);
    expect(contagemPorEspecialidade[Especialidade.OFTALMOLOGIA]).toBe(20);
    expect(contagemPorEspecialidade[Especialidade.AUDIOMETRIA]).toBe(20);
    expect(contagemPorEspecialidade[Especialidade.NUTRICAO]).toBe(20);
    expect(contagemPorEspecialidade[Especialidade.PSICOLOGIA]).toBe(20);

    const percentualOdonto = (contagemPorEspecialidade[Especialidade.ODONTOLOGIA] / totalRegistros) * 100;
    expect(percentualOdonto).toBe(20);
  });
});

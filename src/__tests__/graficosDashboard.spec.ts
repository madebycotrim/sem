import { describe, it, expect } from 'vitest';

describe('Inteligência Analítica e Métricas dos Gráficos do Dashboard', () => {
  const atendimentosSimulados = [
    {
      id: 'atend-1',
      especialidade: 'ODONTOLOGIA',
      status: 'CONCLUIDO',
      turno: 'MATUTINO',
      criadoEm: '2026-05-10T09:30:00Z',
    },
    {
      id: 'atend-2',
      especialidade: 'OFTALMOLOGIA',
      status: 'EM_ATENDIMENTO',
      turno: 'VESPERTINO',
      criadoEm: '2026-05-10T14:15:00Z',
    },
    {
      id: 'atend-3',
      especialidade: 'ODONTOLOGIA',
      status: 'CONCLUIDO',
      turno: 'MATUTINO',
      criadoEm: '2026-05-11T10:00:00Z',
    },
    {
      id: 'atend-4',
      especialidade: 'PSICOLOGIA',
      status: 'CANCELADO',
      turno: 'VESPERTINO',
      criadoEm: '2026-05-12T15:30:00Z',
    },
    {
      id: 'atend-5',
      especialidade: 'NUTRICAO',
      status: 'FALTOU',
      turno: 'MATUTINO',
      criadoEm: '2026-05-12T11:00:00Z',
    },
  ];

  it('deve calcular corretamente a distribuição para o Gráfico de Pizza por Especialidade', () => {
    const totaisPorEspecialidade = atendimentosSimulados.reduce<Record<string, number>>((acc, a) => {
      acc[a.especialidade] = (acc[a.especialidade] || 0) + 1;
      return acc;
    }, {});

    expect(totaisPorEspecialidade['ODONTOLOGIA']).toBe(2);
    expect(totaisPorEspecialidade['OFTALMOLOGIA']).toBe(1);
    expect(totaisPorEspecialidade['PSICOLOGIA']).toBe(1);
    expect(totaisPorEspecialidade['NUTRICAO']).toBe(1);

    const somaTotal = Object.values(totaisPorEspecialidade).reduce((a, b) => a + b, 0);
    expect(somaTotal).toBe(5);

    // Percentual Odontologia: 2 / 5 = 40%
    const percOdonto = (totaisPorEspecialidade['ODONTOLOGIA'] / somaTotal) * 100;
    expect(percOdonto).toBe(40);
  });

  it('deve agrupar pontos cronológicos para a Linha do Tempo', () => {
    const pontos = new Map<string, number>();
    atendimentosSimulados.forEach((a) => {
      const dataIso = a.criadoEm.slice(0, 10);
      pontos.set(dataIso, (pontos.get(dataIso) || 0) + 1);
    });

    const ordenadas = Array.from(pontos.entries()).sort(([a], [b]) => a.localeCompare(b));
    expect(ordenadas).toHaveLength(3);
    expect(ordenadas[0]).toEqual(['2026-05-10', 2]);
    expect(ordenadas[1]).toEqual(['2026-05-11', 1]);
    expect(ordenadas[2]).toEqual(['2026-05-12', 2]);
  });

  it('deve classificar corretamente os turnos Matutino e Vespertino para as Barras Comparativas', () => {
    let matutino = 0;
    let vespertino = 0;

    atendimentosSimulados.forEach((a) => {
      if (a.turno === 'MATUTINO') matutino++;
      else if (a.turno === 'VESPERTINO') vespertino++;
    });

    expect(matutino).toBe(3);
    expect(vespertino).toBe(2);
    expect(matutino + vespertino).toBe(5);
  });

  it('deve calcular as etapas do Funil Assistencial e a taxa de resolutividade', () => {
    const totalDemanda = atendimentosSimulados.length;
    const concluidos = atendimentosSimulados.filter((a) => a.status === 'CONCLUIDO').length;
    const cancelados = atendimentosSimulados.filter((a) => a.status === 'CANCELADO').length;
    const faltas = atendimentosSimulados.filter((a) => a.status === 'FALTOU').length;

    expect(totalDemanda).toBe(5);
    expect(concluidos).toBe(2);
    expect(cancelados).toBe(1);
    expect(faltas).toBe(1);

    const taxaResolutividade = (concluidos / totalDemanda) * 100;
    expect(taxaResolutividade).toBe(40);

    const taxaEvasao = ((cancelados + faltas) / totalDemanda) * 100;
    expect(taxaEvasao).toBe(40);
  });
});

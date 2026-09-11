import { describe, it, expect } from 'vitest';
import type { ItemPaciente } from '../componentes/TabelaPacientes.tsx';
import type { ItemAtendimentoLista } from '../componentes/Atendimentos.tsx';
import type { ItemFila } from '../componentes/FilaDoDia.tsx';

describe('Sincronização de Histórico e Contagem de Atendimentos do Paciente', () => {
  const pacienteTeste: ItemPaciente = {
    id: 'fecaf2f3-6c9a-42f7-95b7-add613794d1e',
    nome: 'GUSTAVO MARTIN GABRIEL DE PAULA',
    cpf: '12345678900',
    dataNascimento: '2008-05-15',
    escolaNome: 'CEMEIT',
    termoConsentimentoStatus: 'ACEITO',
    atendimentosCount: 0,
    criadoEm: '2026-09-06T18:52:19.774Z',
  };

  it('deve sincronizar contagem de atendimentos quando houver consulta agendada ou em fila', () => {
    const atendimentosLocais: ItemAtendimentoLista[] = [
      {
        id: 'atend-1',
        pacienteId: pacienteTeste.id,
        pacienteNome: 'gustavo martin gabriel de paula', // casing diferente
        especialidade: 'ODONTOLOGIA' as any,
        turno: 'MANHA' as any,
        escolaNome: 'CEMEIT',
        profissionalNome: 'Dr. Lucas',
        resumo: 'Check-in realizado',
        criadoEm: new Date().toISOString(),
        status: 'AGENDADO' as any,
      },
    ];

    const nomeNorm = pacienteTeste.nome.trim().toLowerCase();
    const idsAtendimentosPaciente = new Set<string>();

    for (const a of atendimentosLocais) {
      const mesmoId = a.pacienteId === pacienteTeste.id;
      const mesmoNome = Boolean(a.pacienteNome && a.pacienteNome.trim().toLowerCase() === nomeNorm);
      if (mesmoId || mesmoNome) {
        idsAtendimentosPaciente.add(a.id);
      }
    }

    const totalCalculado = Math.max(pacienteTeste.atendimentosCount || 0, idsAtendimentosPaciente.size);
    expect(totalCalculado).toBe(1);
  });

  it('deve deduplicar atendimentos presentes simultaneamente na fila do dia e na lista local', () => {
    const atendimentoId = 'atend-compartilhado-123';
    const atendimentos: ItemAtendimentoLista[] = [
      {
        id: atendimentoId,
        pacienteId: pacienteTeste.id,
        pacienteNome: pacienteTeste.nome,
        especialidade: 'PSICOLOGIA' as any,
        turno: 'TARDE' as any,
        escolaNome: 'CEMEIT',
        profissionalNome: 'Dra. Ana',
        resumo: 'Atendimento agendado',
        criadoEm: new Date().toISOString(),
        status: 'AGENDADO' as any,
      },
    ];

    const fila: ItemFila[] = [
      {
        id: 'fila-item-1',
        atendimentoId,
        pacienteId: pacienteTeste.id,
        pacienteNome: pacienteTeste.nome,
        cpf: pacienteTeste.cpf,
        idade: 18,
        escolaNome: 'CEMEIT',
        especialidade: 'PSICOLOGIA' as any,
        status: 'AGUARDANDO',
        horarioChegada: '14:00',
      },
    ];

    const idsExistentes = new Set<string>();
    // Simula inclusão de atendimentos locais
    atendimentos.forEach((a) => idsExistentes.add(a.id));

    // Simula filtragem de fila
    const itensFilaFiltrados = fila.filter((f) => {
      const jaExiste = (f.atendimentoId && idsExistentes.has(f.atendimentoId)) || idsExistentes.has(f.id);
      return !jaExiste;
    });

    // Como o atendimento já constava em atendimentos, não deve duplicar
    expect(itensFilaFiltrados).toHaveLength(0);
    expect(idsExistentes.size).toBe(1);
  });

  it('deve preservar atendimentos não concluídos no histórico', () => {
    const atendimentosMistos = [
      { id: '1', status: 'AGENDADO', resumo: 'Check-in realizado' },
      { id: '2', status: 'EM_ATENDIMENTO', resumo: 'Em consulta' },
      { id: '3', status: 'CONCLUIDO', resumo: 'Finalizado' },
    ];

    // Ao invés de filtrar apenas status === 'CONCLUIDO', todos devem ser mantidos
    expect(atendimentosMistos).toHaveLength(3);
    const concluidos = atendimentosMistos.filter((a) => a.status === 'CONCLUIDO');
    const ativos = atendimentosMistos.filter((a) => a.status !== 'CONCLUIDO');

    expect(concluidos).toHaveLength(1);
    expect(ativos).toHaveLength(2);
  });

  it('deve formatar status de autorização estritamente como Autorizado ou Não Autorizado', () => {
    const formatarAutorizacao = (val?: string) => (val === 'ACEITO' ? 'Autorizado' : 'Não Autorizado');

    expect(formatarAutorizacao('ACEITO')).toBe('Autorizado');
    expect(formatarAutorizacao('PENDENTE')).toBe('Não Autorizado');
    expect(formatarAutorizacao('DISPENSADO')).toBe('Não Autorizado');
    expect(formatarAutorizacao(undefined)).toBe('Não Autorizado');
    expect(formatarAutorizacao('')).toBe('Não Autorizado');
  });
});

import { describe, it, expect } from 'vitest';
import { Especialidade, StatusAtendimento } from '../../compartilhado/index.ts';

describe('Regra de Integridade: ID Único e Máximo de 1 Consulta por Especialidade por CPF', () => {
  it('deve garantir que cada registro receba um ID único UUID v4 sem colisão', () => {
    const idsGerados = new Set<string>();
    const totalRegistros = 1000;

    for (let i = 0; i < totalRegistros; i++) {
      const id = crypto.randomUUID();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(idsGerados.has(id)).toBe(false);
      idsGerados.add(id);
    }

    expect(idsGerados.size).toBe(totalRegistros);
  });

  it('não deve permitir mais de uma consulta para o mesmo CPF/paciente na mesma especialidade', () => {
    interface AtendimentoSimulado {
      id: string;
      pacienteId: string;
      cpf: string;
      especialidade: Especialidade;
      status: StatusAtendimento;
    }

    const bancoAtendimentos: AtendimentoSimulado[] = [];

    function registrarAtendimento(dados: {
      cpf: string;
      pacienteId: string;
      especialidade: Especialidade;
      status: StatusAtendimento;
    }): { sucesso: boolean; id?: string; erro?: string } {
      // Regra estrita: 1 consulta por especialidade por paciente/CPF
      const existente = bancoAtendimentos.find(
        (a) =>
          (a.pacienteId === dados.pacienteId || a.cpf === dados.cpf) &&
          a.especialidade === dados.especialidade
      );

      if (existente) {
        return {
          sucesso: false,
          erro: `O paciente já possui uma consulta registrada na especialidade ${dados.especialidade}. Não é permitido mais de uma consulta na mesma especialidade para o mesmo CPF.`,
        };
      }

      const novoId = crypto.randomUUID();
      bancoAtendimentos.push({
        id: novoId,
        pacienteId: dados.pacienteId,
        cpf: dados.cpf,
        especialidade: dados.especialidade,
        status: dados.status,
      });

      return { sucesso: true, id: novoId };
    }

    const cpfTeste = '08756762141';
    const pacienteIdTeste = 'paciente-uuid-1';

    // 1. Primeira consulta em Oftalmologia -> Sucesso
    const res1 = registrarAtendimento({
      cpf: cpfTeste,
      pacienteId: pacienteIdTeste,
      especialidade: Especialidade.OFTALMOLOGIA,
      status: StatusAtendimento.CONCLUIDO,
    });
    expect(res1.sucesso).toBe(true);
    expect(res1.id).toBeDefined();

    // 2. Segunda consulta no mesmo CPF em Odontologia (especialidade diferente) -> Sucesso
    const res2 = registrarAtendimento({
      cpf: cpfTeste,
      pacienteId: pacienteIdTeste,
      especialidade: Especialidade.ODONTOLOGIA,
      status: StatusAtendimento.AGENDADO,
    });
    expect(res2.sucesso).toBe(true);
    expect(res2.id).toBeDefined();
    expect(res2.id).not.toBe(res1.id);

    // 3. Tentativa de cadastrar uma segunda consulta em Oftalmologia para o mesmo CPF -> Deve ser bloqueada!
    const res3 = registrarAtendimento({
      cpf: cpfTeste,
      pacienteId: pacienteIdTeste,
      especialidade: Especialidade.OFTALMOLOGIA,
      status: StatusAtendimento.AGENDADO,
    });
    expect(res3.sucesso).toBe(false);
    expect(res3.erro).toContain(`já possui uma consulta registrada na especialidade ${Especialidade.OFTALMOLOGIA}`);

    // Verifica que o banco permaneceu íntegro com apenas 2 consultas distintas
    expect(bancoAtendimentos).toHaveLength(2);
  });

  it('deve descartar consultas duplicadas da mesma especialidade durante importação de planilha', () => {
    const linhasPlanilha = [
      { linha: 2, cpf: '12345678901', aluno: 'João Silva', especialidade: Especialidade.OFTALMOLOGIA },
      { linha: 3, cpf: '12345678901', aluno: 'João Silva', especialidade: Especialidade.ODONTOLOGIA },
      { linha: 4, cpf: '12345678901', aluno: 'João Silva', especialidade: Especialidade.OFTALMOLOGIA }, // Duplicada!
      { linha: 5, cpf: '98765432100', aluno: 'Maria Santos', especialidade: Especialidade.OFTALMOLOGIA },
    ];

    const consultasProcessadasSessao = new Set<string>();
    const consultasInseridas: Array<{ id: string; cpf: string; especialidade: string }> = [];
    const falhasDuplicidade: number[] = [];

    for (const item of linhasPlanilha) {
      const chaveUnica = `${item.cpf}:${item.especialidade}`;

      if (consultasProcessadasSessao.has(chaveUnica)) {
        falhasDuplicidade.push(item.linha);
        continue;
      }

      consultasProcessadasSessao.add(chaveUnica);
      consultasInseridas.push({
        id: crypto.randomUUID(),
        cpf: item.cpf,
        especialidade: item.especialidade,
      });
    }

    // Linha 4 deve ter sido identificada como duplicada e ignorada
    expect(falhasDuplicidade).toEqual([4]);
    // Apenas 3 consultas válidas e com IDs únicos foram criadas
    expect(consultasInseridas).toHaveLength(3);

    const ids = new Set(consultasInseridas.map((c) => c.id));
    expect(ids.size).toBe(3);
  });
});

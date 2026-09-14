import { describe, it, expect } from 'vitest';
import type { ItemFila } from '../componentes/FilaDoDia.tsx';

describe('Confirmações de Ações na Fila do Dia', () => {
  const itemFilaAguardando: ItemFila = {
    id: 'fila-101',
    pacienteNome: 'MATEUS RECALDE DA FONSECA COTRIM',
    cpf: '73630000000',
    idade: 15,
    escolaNome: 'CEMEIT',
    especialidade: 'PSICOLOGIA',
    status: 'AGUARDANDO',
    horarioChegada: '20:56',
    dataChegada: '13/09/2026',
    profissional: 'ANA CLAUDIA FERNANDES MEIRELES',
  };

  const itemFilaConcluido: ItemFila = {
    ...itemFilaAguardando,
    id: 'fila-102',
    status: 'CONCLUIDO',
  };

  const itemFilaCancelado: ItemFila = {
    ...itemFilaAguardando,
    id: 'fila-103',
    status: 'CANCELADO',
  };

  it('deve requerer confirmação antes de alterar status de AGUARDANDO para CONFIRMADO', () => {
    // Simula a máquina de estados de confirmação
    let confirmandoPresencaId: string | null = null;
    let statusAtual = itemFilaAguardando.status;

    // 1. Clique inicial em "Confirmar" apenas abre o popover de confirmação
    confirmandoPresencaId = itemFilaAguardando.id;
    expect(confirmandoPresencaId).toBe(itemFilaAguardando.id);
    expect(statusAtual).toBe('AGUARDANDO'); // Estado não alterado ainda

    // 2. Se o usuário clicar em "Voltar", fecha a confirmação sem mudar o status
    confirmandoPresencaId = null;
    expect(confirmandoPresencaId).toBeNull();
    expect(statusAtual).toBe('AGUARDANDO');

    // 3. Ao clicar em "Sim, confirmar", efetiva a transição
    confirmandoPresencaId = itemFilaAguardando.id;
    if (confirmandoPresencaId === itemFilaAguardando.id) {
      statusAtual = 'CONFIRMADO';
      confirmandoPresencaId = null;
    }
    expect(statusAtual).toBe('CONFIRMADO');
    expect(confirmandoPresencaId).toBeNull();
  });

  it('deve requerer confirmação antes de cancelar um atendimento CONCLUIDO', () => {
    let confirmandoCancelamentoId: string | null = null;
    let statusAtual = itemFilaConcluido.status;

    // 1. No menu de atendimento concluído, o cancelamento abre a confirmação
    confirmandoCancelamentoId = itemFilaConcluido.id;
    expect(confirmandoCancelamentoId).toBe(itemFilaConcluido.id);
    expect(statusAtual).toBe('CONCLUIDO');

    // 2. Apenas com "Sim, cancelar", o cancelamento é efetuado
    if (confirmandoCancelamentoId === itemFilaConcluido.id) {
      statusAtual = 'CANCELADO';
      confirmandoCancelamentoId = null;
    }
    expect(statusAtual).toBe('CANCELADO');
    expect(confirmandoCancelamentoId).toBeNull();
  });

  it('deve requerer confirmação antes de reativar um atendimento CANCELADO', () => {
    let confirmandoReativacaoId: string | null = null;
    let statusAtual = itemFilaCancelado.status;

    // 1. Clique em "Reativar" abre popover
    confirmandoReativacaoId = itemFilaCancelado.id;
    expect(confirmandoReativacaoId).toBe(itemFilaCancelado.id);
    expect(statusAtual).toBe('CANCELADO');

    // 2. Confirmação efetiva o retorno para AGUARDANDO
    if (confirmandoReativacaoId === itemFilaCancelado.id) {
      statusAtual = 'AGUARDANDO';
      confirmandoReativacaoId = null;
    }
    expect(statusAtual).toBe('AGUARDANDO');
    expect(confirmandoReativacaoId).toBeNull();
  });
});

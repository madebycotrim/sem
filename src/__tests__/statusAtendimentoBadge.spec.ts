import { describe, it, expect } from 'vitest';
import { obterEstiloStatusAtendimento } from '../componentes/StatusAtendimentoBadge.tsx';
import { StatusAtendimento } from '../../compartilhado/index.ts';

describe('Padronização Visual de Status de Atendimento (StatusAtendimentoBadge)', () => {
  it('deve retornar estilo azul para EM_ATENDIMENTO padrão do sistema', () => {
    const estilo = obterEstiloStatusAtendimento(StatusAtendimento.EM_ATENDIMENTO);
    expect(estilo.rotulo).toBe('Em Atendimento');
    expect(estilo.fundo).toBe('bg-blue-50');
    expect(estilo.texto).toBe('text-blue-700');
    expect(estilo.borda).toBe('border-blue-200');
    expect(estilo.ponto).toBe('bg-blue-500');
  });

  it('deve retornar estilo verde para CONCLUIDO', () => {
    const estilo = obterEstiloStatusAtendimento(StatusAtendimento.CONCLUIDO);
    expect(estilo.rotulo).toBe('Concluído');
    expect(estilo.fundo).toBe('bg-emerald-50');
    expect(estilo.texto).toBe('text-emerald-700');
    expect(estilo.borda).toBe('border-emerald-200');
    expect(estilo.ponto).toBe('bg-emerald-500');
  });

  it('deve retornar estilo violeta para CONFIRMADO', () => {
    const estilo = obterEstiloStatusAtendimento(StatusAtendimento.CONFIRMADO);
    expect(estilo.rotulo).toBe('Confirmado');
    expect(estilo.fundo).toBe('bg-violet-50');
    expect(estilo.texto).toBe('text-violet-700');
    expect(estilo.borda).toBe('border-violet-200');
    expect(estilo.ponto).toBe('bg-violet-500');
  });

  it('deve retornar estilo âmbar com pulso para AGUARDANDO e sem pulso para AGENDADO', () => {
    const estiloAguardando = obterEstiloStatusAtendimento('AGUARDANDO');
    expect(estiloAguardando.rotulo).toBe('Aguardando');
    expect(estiloAguardando.fundo).toBe('bg-amber-50');
    expect(estiloAguardando.animarPonto).toBe(true);

    const estiloAgendado = obterEstiloStatusAtendimento(StatusAtendimento.AGENDADO);
    expect(estiloAgendado.rotulo).toBe('Agendado');
    expect(estiloAgendado.fundo).toBe('bg-amber-50');
    expect(estiloAgendado.animarPonto).toBe(false);
  });

  it('deve retornar estilo vermelho para CANCELADO e variações (plural, gênero e minúsculas)', () => {
    const estilo = obterEstiloStatusAtendimento(StatusAtendimento.CANCELADO);
    expect(estilo.rotulo).toBe('Cancelado');
    expect(estilo.fundo).toBe('bg-rose-50');
    expect(estilo.texto).toBe('text-rose-700');
    expect(estilo.borda).toBe('border-rose-200');
    expect(estilo.ponto).toBe('bg-rose-500');

    expect(obterEstiloStatusAtendimento('CANCELADOS').rotulo).toBe('Cancelado');
    expect(obterEstiloStatusAtendimento('Cancelados').rotulo).toBe('Cancelado');
    expect(obterEstiloStatusAtendimento('CANCELADA').rotulo).toBe('Cancelado');
    expect(obterEstiloStatusAtendimento('Cancelado').rotulo).toBe('Cancelado');
    expect(obterEstiloStatusAtendimento('DESISTENCIA').rotulo).toBe('Cancelado');
  });

  it('deve retornar estilo ardósia para FALTOU', () => {
    const estilo = obterEstiloStatusAtendimento(StatusAtendimento.FALTOU);
    expect(estilo.rotulo).toBe('Faltou');
    expect(estilo.fundo).toBe('bg-slate-100');
    expect(estilo.texto).toBe('text-slate-700');
    expect(estilo.borda).toBe('border-slate-200');
    expect(estilo.ponto).toBe('bg-slate-400');
  });
});

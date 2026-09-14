import { describe, it, expect } from 'vitest';
import { extrairAnoETurma, OPCOES_ANO_ESCOLAR } from '../componentes/ModalNovoPaciente.tsx';

describe('extrairAnoETurma - Extração e normalização de Ano Escolar e Turma', () => {
  it('deve extrair ano e turma quando separados por em-dash (—)', () => {
    const resultado = extrairAnoETurma('1º Ano EM — A');
    expect(resultado).toEqual({
      anoEscolar: '1º Ano EM',
      turma: 'A',
    });
  });

  it('deve extrair ano e turma quando separados por hífen padrão (-)', () => {
    const resultado = extrairAnoETurma('9º Ano EF - B');
    expect(resultado).toEqual({
      anoEscolar: '9º Ano EF',
      turma: 'B',
    });
  });

  it('deve extrair ano e turma quando separados por en-dash (–)', () => {
    const resultado = extrairAnoETurma('3º Ano EM – C');
    expect(resultado).toEqual({
      anoEscolar: '3º Ano EM',
      turma: 'C',
    });
  });

  it('deve normalizar o caractere de grau (°) para indicador ordinal (º)', () => {
    const resultado = extrairAnoETurma('2° Ano EM - Turma Única');
    expect(resultado).toEqual({
      anoEscolar: '2º Ano EM',
      turma: 'Turma Única',
    });
  });

  it('deve lidar com barra (/) como separador', () => {
    const resultado = extrairAnoETurma('8º Ano EF / 801');
    expect(resultado).toEqual({
      anoEscolar: '8º Ano EF',
      turma: '801',
    });
  });

  it('deve extrair ano escolar isolado sem turma', () => {
    const resultado = extrairAnoETurma('1º Ano EM');
    expect(resultado).toEqual({
      anoEscolar: '1º Ano EM',
      turma: '',
    });
  });

  it('deve limpar traço residual no final', () => {
    const resultado = extrairAnoETurma('1º Ano EM — ');
    expect(resultado).toEqual({
      anoEscolar: '1º Ano EM',
      turma: '',
    });
  });

  it('deve identificar apenas turma quando não houver ano escolar', () => {
    const resultado = extrairAnoETurma('Turma A');
    expect(resultado).toEqual({
      anoEscolar: '',
      turma: 'Turma A',
    });
  });

  it('deve retornar campos vazios para valores nulos, vazios ou "Não informada"', () => {
    expect(extrairAnoETurma('')).toEqual({ anoEscolar: '', turma: '' });
    expect(extrairAnoETurma(null)).toEqual({ anoEscolar: '', turma: '' });
    expect(extrairAnoETurma(undefined)).toEqual({ anoEscolar: '', turma: '' });
    expect(extrairAnoETurma('Não informada')).toEqual({ anoEscolar: '', turma: '' });
  });

  it('deve conter as opções padrão de ensino fundamental e médio', () => {
    expect(OPCOES_ANO_ESCOLAR).toContain('8º Ano EF');
    expect(OPCOES_ANO_ESCOLAR).toContain('9º Ano EF');
    expect(OPCOES_ANO_ESCOLAR).toContain('1º Ano EM');
    expect(OPCOES_ANO_ESCOLAR).toContain('2º Ano EM');
    expect(OPCOES_ANO_ESCOLAR).toContain('3º Ano EM');
  });
});

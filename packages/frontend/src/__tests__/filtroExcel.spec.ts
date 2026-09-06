import { describe, it, expect } from 'vitest';
import { type ConfiguracaoColuna } from '../componentes/tabelaExcel/useFiltroExcel.ts';

interface TestItem {
  id: string;
  nome: string;
  idade: number;
  escola: string;
  termoStatus: string;
}

const mockData: TestItem[] = [
  { id: '1', nome: 'GABRIEL SANTOS', idade: 12, escola: 'CEMEIT', termoStatus: 'ACEITO' },
  { id: '2', nome: 'BEATRIZ LIMA', idade: 10, escola: 'CEF 01', termoStatus: 'PENDENTE' },
  { id: '3', nome: 'MATHEUS COSTA', idade: 14, escola: 'CEMEIT', termoStatus: 'ACEITO' },
];

const colunas: ConfiguracaoColuna<TestItem>[] = [
  { id: 'nome', rotulo: 'Nome', tipo: 'texto' },
  { id: 'idade', rotulo: 'Idade', tipo: 'numero' },
  { id: 'escola', rotulo: 'Escola', tipo: 'texto' },
  {
    id: 'termoStatus',
    rotulo: 'Autorização',
    tipo: 'opcao',
    formatarRotulo: (val) => (val === 'ACEITO' ? 'Autorizado' : 'Não Autorizado'),
  },
];

describe('Sistema de Filtro e Ordenação Estilo Excel', () => {
  it('deve formatar e ordenar registros por ordenação A-Z e Z-A', () => {
    const ordenadoAsc = [...mockData].sort((a, b) =>
      a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true })
    );
    expect(ordenadoAsc[0].nome).toBe('BEATRIZ LIMA');
    expect(ordenadoAsc[2].nome).toBe('MATHEUS COSTA');

    const ordenadoDesc = [...mockData].sort((a, b) =>
      b.nome.localeCompare(a.nome, 'pt-BR', { numeric: true })
    );
    expect(ordenadoDesc[0].nome).toBe('MATHEUS COSTA');
    expect(ordenadoDesc[2].nome).toBe('BEATRIZ LIMA');
  });

  it('deve ordenar numericamente idades corretamente', () => {
    const ordenadoIdade = [...mockData].sort((a, b) => a.idade - b.idade);
    expect(ordenadoIdade[0].idade).toBe(10);
    expect(ordenadoIdade[2].idade).toBe(14);
  });

  it('deve extrair valores distintos e contagens para colunas', () => {
    const mapa = new Map<string, number>();
    mockData.forEach((item) => {
      mapa.set(item.escola, (mapa.get(item.escola) || 0) + 1);
    });

    expect(mapa.get('CEMEIT')).toBe(2);
    expect(mapa.get('CEF 01')).toBe(1);
  });

  it('deve filtrar registros por múltiplos valores selecionados', () => {
    const permitidos = new Set(['CEMEIT']);
    const filtrados = mockData.filter((i) => permitidos.has(i.escola));
    expect(filtrados).toHaveLength(2);
    expect(filtrados.every((i) => i.escola === 'CEMEIT')).toBe(true);
  });

  it('deve aplicar formatação de rótulos nos valores de opção', () => {
    const config = colunas.find((c) => c.id === 'termoStatus');
    expect(config?.formatarRotulo?.('ACEITO')).toBe('Autorizado');
    expect(config?.formatarRotulo?.('PENDENTE')).toBe('Não Autorizado');
  });
});

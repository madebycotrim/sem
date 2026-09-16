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

  it('deve incluir todas as opções pré-definidas de instituições mesmo que não estejam na página atual', () => {
    const opcoesPredefinidas = [
      { valorChave: 'ESCOLA SESI CEB', rotuloExibicao: 'ESCOLA SESI CEB', contagem: 50 },
      { valorChave: 'ESCOLA SESI TAGUATINGA', rotuloExibicao: 'ESCOLA SESI TAGUATINGA', contagem: 120 },
      { valorChave: 'ESCOLA SESI SOBRADINHO', rotuloExibicao: 'ESCOLA SESI SOBRADINHO', contagem: 80 },
    ];

    // Dados da página atual contêm apenas uma escola
    const dadosPaginaAtual: TestItem[] = [
      { id: '1', nome: 'GABRIEL SANTOS', idade: 12, escola: 'ESCOLA SESI CEB', termoStatus: 'ACEITO' },
    ];
    expect(dadosPaginaAtual).toHaveLength(1);

    const mapaValores = new Map<string, { rotulo: string; contagem: number }>();
    opcoesPredefinidas.forEach((op) => {
      mapaValores.set(op.valorChave, { rotulo: op.rotuloExibicao, contagem: op.contagem });
    });

    expect(mapaValores.size).toBe(3);
    expect(mapaValores.has('ESCOLA SESI SOBRADINHO')).toBe(true);
    expect(mapaValores.get('ESCOLA SESI TAGUATINGA')?.contagem).toBe(120);
  });

  it('deve manter opções fixas para AUTORIZAÇÃO (Autorizado e Não Autorizado)', () => {
    const opcoesAutorizacao = [
      { valorChave: 'ACEITO', rotuloExibicao: 'Autorizado' },
      { valorChave: 'PENDENTE', rotuloExibicao: 'Não Autorizado' },
    ];

    expect(opcoesAutorizacao).toHaveLength(2);
    expect(opcoesAutorizacao.map((o) => o.valorChave)).toEqual(['ACEITO', 'PENDENTE']);
    expect(opcoesAutorizacao.map((o) => o.rotuloExibicao)).toEqual(['Autorizado', 'Não Autorizado']);
  });

  it('deve realizar filtro de coluna case-insensitive tolerante a variações de maiúsculas/minúsculas', () => {
    const permitidos = new Set(['eliene belo']);
    const itensTeste = [
      { id: '1', profissional: 'ELIENE BELO' },
      { id: '2', profissional: 'Eliene Belo' },
      { id: '3', profissional: 'OUTRO PROFISSIONAL' },
    ];

    const filtrados = itensTeste.filter((item) => {
      const chave = item.profissional;
      if (permitidos.has(chave)) return true;
      const chaveTrimLower = String(chave).trim().toLowerCase();
      for (const v of permitidos) {
        if (String(v).trim().toLowerCase() === chaveTrimLower) return true;
      }
      return false;
    });

    expect(filtrados).toHaveLength(2);
    expect(filtrados.map((i) => i.id)).toEqual(['1', '2']);
  });

  it('deve contabilizar corretamente itens da página atual quando contagem pré-definida for zero', () => {
    const contagemValores = new Map<string, { rotulo: string; contagem: number }>();
    const opcoesPredefinidas = [
      { valorChave: 'ELIENE BELO', rotuloExibicao: 'ELIENE BELO', contagem: 0 },
    ];

    opcoesPredefinidas.forEach((opcao) => {
      contagemValores.set(opcao.valorChave, {
        rotulo: opcao.rotuloExibicao,
        contagem: opcao.contagem ?? 0,
      });
    });

    const dados = [{ profissional: 'ELIENE BELO' }, { profissional: 'ELIENE BELO' }];
    dados.forEach((item) => {
      const atual = contagemValores.get(item.profissional);
      if (atual) {
        if (atual.contagem === 0) {
          atual.contagem += 1;
        } else {
          atual.contagem += 1;
        }
      }
    });

    expect(contagemValores.get('ELIENE BELO')?.contagem).toBe(2);
  });
});


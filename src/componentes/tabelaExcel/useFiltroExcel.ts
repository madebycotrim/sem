import { useState, useMemo, useCallback } from 'react';

export type DirecaoOrdenacao = 'asc' | 'desc';

export interface ConfiguracaoColuna<T> {
  id: string;
  rotulo: string;
  tipo?: 'texto' | 'numero' | 'data' | 'opcao';
  obterValor?: (item: T) => any;
  formatarRotulo?: (valor: any, item?: T) => string;
  desabilitarFiltro?: boolean;
  desabilitarOrdenacao?: boolean;
}

export interface ItemValorFiltro {
  valorChave: string;
  rotuloExibicao: string;
  contagem: number;
}

export interface EstadoOrdenacao {
  colunaId: string;
  direcao: DirecaoOrdenacao;
}

export interface OpcoesUsoFiltroExcel<T> {
  dados: T[];
  colunas: ConfiguracaoColuna<T>[];
  buscaGeral?: string;
  funcaoBuscaGeral?: (item: T, termo: string) => boolean;
}

export interface RetornoFiltroExcel<T> {
  dadosFiltrados: T[];
  totalOriginal: number;
  totalFiltrados: number;
  ordenacao: EstadoOrdenacao | null;
  definirOrdenacao: (colunaId: string, direcao?: DirecaoOrdenacao | null) => void;
  limparOrdenacao: () => void;
  filtrosColuna: Record<string, Set<string>>;
  alternarValorFiltro: (colunaId: string, valorChave: string) => void;
  definirValoresFiltro: (colunaId: string, valores: Set<string>) => void;
  selecionarTodosValores: (colunaId: string) => void;
  limparFiltroColuna: (colunaId: string) => void;
  limparTodosFiltros: () => void;
  temFiltroAtivoColuna: (colunaId: string) => boolean;
  temAlgumFiltroAtivo: boolean;
  obterValoresUnicosColuna: (colunaId: string) => ItemValorFiltro[];
  colunasConfig: Record<string, ConfiguracaoColuna<T>>;
}

const VALOR_VAZIO = '__VAZIO__';

/**
 * Hook reutilizável de tabela estilo Excel com filtragem por valores únicos e ordenação por coluna.
 */
export function useFiltroExcel<T>({
  dados,
  colunas,
  buscaGeral = '',
  funcaoBuscaGeral,
}: OpcoesUsoFiltroExcel<T>): RetornoFiltroExcel<T> {
  const [ordenacao, setOrdenacao] = useState<EstadoOrdenacao | null>(null);
  const [filtrosColuna, setFiltrosColuna] = useState<Record<string, Set<string>>>({});

  const colunasConfig = useMemo(() => {
    const mapa: Record<string, ConfiguracaoColuna<T>> = {};
    colunas.forEach((c) => {
      mapa[c.id] = c;
    });
    return mapa;
  }, [colunas]);

  // Função auxiliar para extrair o valor de uma coluna
  const extrairValor = useCallback(
    (item: T, colunaId: string): any => {
      const config = colunasConfig[colunaId];
      if (!config) return (item as any)[colunaId];
      if (config.obterValor) {
        return config.obterValor(item);
      }
      return (item as any)[colunaId];
    },
    [colunasConfig]
  );

  // Extrair chave normalizada em string para a filtragem estilo Excel
  const extrairChaveString = useCallback(
    (item: T, colunaId: string): { chave: string; rotulo: string } => {
      const val = extrairValor(item, colunaId);
      const config = colunasConfig[colunaId];

      if (val === null || val === undefined || val === '') {
        return { chave: VALOR_VAZIO, rotulo: '(Vazio / Não informado)' };
      }

      if (config?.formatarRotulo) {
        const rotuloFormatado = config.formatarRotulo(val, item);
        return { chave: String(val), rotulo: rotuloFormatado };
      }

      if (config?.tipo === 'data' && typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
        const [ano, mes, dia] = val.substring(0, 10).split('-');
        return { chave: String(val), rotulo: `${dia}/${mes}/${ano}` };
      }

      return { chave: String(val), rotulo: String(val) };
    },
    [extrairValor, colunasConfig]
  );

  // Calcula valores únicos de cada coluna baseados nos dados originais
  const mapaValoresUnicos = useMemo(() => {
    const mapa: Record<string, ItemValorFiltro[]> = {};

    colunas.forEach((col) => {
      if (col.desabilitarFiltro) return;

      const contagemValores = new Map<string, { rotulo: string; contagem: number }>();

      dados.forEach((item) => {
        const { chave, rotulo } = extrairChaveString(item, col.id);
        const atual = contagemValores.get(chave);
        if (atual) {
          atual.contagem += 1;
        } else {
          contagemValores.set(chave, { rotulo, contagem: 1 });
        }
      });

      const lista: ItemValorFiltro[] = Array.from(contagemValores.entries()).map(
        ([valorChave, { rotulo, contagem }]) => ({
          valorChave,
          rotuloExibicao: rotulo,
          contagem,
        })
      );

      // Ordena alfabeticamente os valores únicos
      lista.sort((a, b) => {
        if (a.valorChave === VALOR_VAZIO) return 1;
        if (b.valorChave === VALOR_VAZIO) return -1;
        return a.rotuloExibicao.localeCompare(b.rotuloExibicao, 'pt-BR', { numeric: true });
      });

      mapa[col.id] = lista;
    });

    return mapa;
  }, [dados, colunas, extrairChaveString]);

  const obterValoresUnicosColuna = useCallback(
    (colunaId: string): ItemValorFiltro[] => {
      return mapaValoresUnicos[colunaId] || [];
    },
    [mapaValoresUnicos]
  );

  // Alterna a ordenação
  const definirOrdenacao = useCallback(
    (colunaId: string, direcaoForcada?: DirecaoOrdenacao | null) => {
      if (direcaoForcada === null) {
        setOrdenacao(null);
        return;
      }
      if (direcaoForcada) {
        setOrdenacao({ colunaId, direcao: direcaoForcada });
        return;
      }

      setOrdenacao((prev) => {
        if (!prev || prev.colunaId !== colunaId) {
          return { colunaId, direcao: 'asc' };
        }
        if (prev.direcao === 'asc') {
          return { colunaId, direcao: 'desc' };
        }
        return null;
      });
    },
    []
  );

  const limparOrdenacao = useCallback(() => {
    setOrdenacao(null);
  }, []);

  // Alterna a seleção de um valor específico dentro do filtro da coluna
  const alternarValorFiltro = useCallback(
    (colunaId: string, valorChave: string) => {
      setFiltrosColuna((prev) => {
        const todosValores = mapaValoresUnicos[colunaId]?.map((v) => v.valorChave) || [];
        const selecaoAtual = prev[colunaId] ? new Set(prev[colunaId]) : new Set(todosValores);

        if (selecaoAtual.has(valorChave)) {
          selecaoAtual.delete(valorChave);
        } else {
          selecaoAtual.add(valorChave);
        }

        const novoFiltros = { ...prev };
        // Se todos os valores possíveis estão selecionados, não precisa de filtro ativo
        if (selecaoAtual.size === todosValores.length) {
          delete novoFiltros[colunaId];
        } else {
          novoFiltros[colunaId] = selecaoAtual;
        }

        return novoFiltros;
      });
    },
    [mapaValoresUnicos]
  );

  const definirValoresFiltro = useCallback((colunaId: string, valores: Set<string>) => {
    setFiltrosColuna((prev) => ({
      ...prev,
      [colunaId]: valores,
    }));
  }, []);

  const selecionarTodosValores = useCallback(
    (colunaId: string) => {
      setFiltrosColuna((prev) => {
        const novo = { ...prev };
        delete novo[colunaId];
        return novo;
      });
    },
    []
  );

  const limparFiltroColuna = useCallback((colunaId: string) => {
    setFiltrosColuna((prev) => {
      const novo = { ...prev };
      delete novo[colunaId];
      return novo;
    });
  }, []);

  const limparTodosFiltros = useCallback(() => {
    setFiltrosColuna({});
    setOrdenacao(null);
  }, []);

  const temFiltroAtivoColuna = useCallback(
    (colunaId: string): boolean => {
      return Boolean(filtrosColuna[colunaId]);
    },
    [filtrosColuna]
  );

  const temAlgumFiltroAtivo = useMemo(() => {
    return Object.keys(filtrosColuna).length > 0 || ordenacao !== null;
  }, [filtrosColuna, ordenacao]);

  // Aplicação de filtros e ordenação
  const dadosFiltrados = useMemo(() => {
    let resultado = [...dados];

    // 1. Busca Geral
    if (buscaGeral.trim()) {
      const termo = buscaGeral.trim().toLowerCase();
      if (funcaoBuscaGeral) {
        resultado = resultado.filter((item) => funcaoBuscaGeral(item, termo));
      } else {
        resultado = resultado.filter((item) =>
          Object.values(item as any).some((val) =>
            val !== null && val !== undefined && String(val).toLowerCase().includes(termo)
          )
        );
      }
    }

    // 2. Filtros de Coluna Estilo Excel
    Object.entries(filtrosColuna).forEach(([colunaId, valoresPermitidos]) => {
      if (!valoresPermitidos) return;
      resultado = resultado.filter((item) => {
        const { chave } = extrairChaveString(item, colunaId);
        return valoresPermitidos.has(chave);
      });
    });

    // 3. Ordenação Estilo Excel
    if (ordenacao) {
      const { colunaId, direcao } = ordenacao;
      const config = colunasConfig[colunaId];
      const tipo = config?.tipo || 'texto';

      resultado.sort((itemA, itemB) => {
        const valA = extrairValor(itemA, colunaId);
        const valB = extrairValor(itemB, colunaId);

        if (valA === valB) return 0;
        if (valA === null || valA === undefined || valA === '') return 1;
        if (valB === null || valB === undefined || valB === '') return -1;

        let comparacao = 0;
        if (tipo === 'numero') {
          comparacao = Number(valA) - Number(valB);
        } else if (tipo === 'data') {
          comparacao = new Date(valA).getTime() - new Date(valB).getTime();
        } else {
          comparacao = String(valA).localeCompare(String(valB), 'pt-BR', { numeric: true });
        }

        return direcao === 'asc' ? comparacao : -comparacao;
      });
    }

    return resultado;
  }, [
    dados,
    buscaGeral,
    funcaoBuscaGeral,
    filtrosColuna,
    ordenacao,
    extrairChaveString,
    extrairValor,
    colunasConfig,
  ]);

  return {
    dadosFiltrados,
    totalOriginal: dados.length,
    totalFiltrados: dadosFiltrados.length,
    ordenacao,
    definirOrdenacao,
    limparOrdenacao,
    filtrosColuna,
    alternarValorFiltro,
    definirValoresFiltro,
    selecionarTodosValores,
    limparFiltroColuna,
    limparTodosFiltros,
    temFiltroAtivoColuna,
    temAlgumFiltroAtivo,
    obterValoresUnicosColuna,
    colunasConfig,
  };
}

/**
 * Parâmetros de contexto e filtros para geração do título adaptável do relatório
 */
export interface FiltrosTituloRelatorio {
  escolaNome?: string | null;
  especialidadeNome?: string | null;
  profissionalNome?: string | null;
  statusNome?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  tituloPersonalizado?: string | null;
}

/**
 * Gera um título adaptável inteligente para o relatório baseado nos filtros selecionados,
 * ou retorna o título personalizado se fornecido pelo usuário.
 */
export function gerarTituloRelatorioAdaptavel(filtros: FiltrosTituloRelatorio): string {
  if (filtros.tituloPersonalizado && filtros.tituloPersonalizado.trim()) {
    return filtros.tituloPersonalizado.trim();
  }

  const { especialidadeNome, escolaNome, profissionalNome, statusNome } = filtros;

  const temEspecialidade = Boolean(especialidadeNome && especialidadeNome.trim());
  const temEscola = Boolean(escolaNome && escolaNome.trim());
  const temProfissional = Boolean(profissionalNome && profissionalNome.trim());
  const temStatus = Boolean(statusNome && statusNome.trim());

  let base = '';

  if (temEspecialidade && temEscola && temProfissional) {
    base = `Relatório de ${especialidadeNome} — ${profissionalNome} — ${escolaNome}`;
  } else if (temEspecialidade && temEscola) {
    base = `Relatório de ${especialidadeNome} — ${escolaNome}`;
  } else if (temEspecialidade && temProfissional) {
    base = `Relatório de ${especialidadeNome} — ${profissionalNome}`;
  } else if (temEspecialidade) {
    base = `Relatório de Atendimentos em ${especialidadeNome}`;
  } else if (temEscola && temProfissional) {
    base = `Relatório de Atendimentos — ${profissionalNome} — ${escolaNome}`;
  } else if (temEscola) {
    base = `Relatório de Atendimentos — ${escolaNome}`;
  } else if (temProfissional) {
    base = `Relatório de Atendimentos — ${profissionalNome}`;
  } else if (temStatus) {
    base = `Relatório de Atendimentos (${statusNome})`;
  } else {
    base = 'Relatório Geral de Atendimentos — Saúde na Escola';
  }

  // Se houver status e outros qualificadores, adiciona o status entre parênteses
  if (temStatus && (temEspecialidade || temEscola || temProfissional)) {
    return `${base} (${statusNome})`;
  }

  return base;
}

/**
 * Sanitiza o título para uso seguro como nome de arquivo no Excel (.xlsx),
 * removendo acentuações, caracteres especiais e limitando o tamanho.
 */
export function sanitizarNomeArquivoRelatorio(
  titulo: string,
  dataInicio?: string | null,
  dataFim?: string | null
): string {
  const slug = (titulo || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 80)
    .replace(/^_+|_+$/g, '');

  const base = slug || 'relatorio_saude_itinerante';
  const inicioSlug = dataInicio ? dataInicio.replace(/[^0-9]/g, '-') : 'inicio';
  const fimSlug = dataFim ? dataFim.replace(/[^0-9]/g, '-') : 'fim';

  return `${base}_${inicioSlug}_${fimSlug}.xlsx`;
}

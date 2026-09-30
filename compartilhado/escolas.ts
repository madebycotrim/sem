/**
 * Normaliza uma string de texto removendo acentos, convertendo para minúsculas e limpando espaços.
 */
export const normalizarTexto = (valor?: string | null): string =>
  (valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/**
 * Normaliza o nome da instituição expandindo siglas comuns (EC, CEF, CED, CEM, CAIC, etc.)
 * e removendo pontuações/preposições para correspondência tolerante a variações.
 */
export function canonizarNomeEscola(nome?: string | null): string {
  if (!nome) return '';
  let s = normalizarTexto(nome);

  // Expansão de siglas comuns de instituições de ensino
  s = s
    .replace(/\b(e\.?\s*c\.?|esc\.?\s*classe)\b/gi, 'escola classe')
    .replace(/\b(c\.?\s*e\.?\s*f\.?)\b/gi, 'centro de ensino fundamental')
    .replace(/\b(c\.?\s*e\.?\s*d\.?)\b/gi, 'centro educacional')
    .replace(/\b(c\.?\s*e\.?\s*m\.?)\b/gi, 'centro de ensino medio')
    .replace(/\b(c\.?\s*e\.?\s*i\.?)\b/gi, 'centro de educacao infantil')
    .replace(/\b(e\.?\s*m\.?\s*e\.?\s*f\.?)\b/gi, 'escola municipal de ensino fundamental')
    .replace(/\b(e\.?\s*m\.?\s*e\.?\s*i\.?)\b/gi, 'escola municipal de educacao infantil')
    .replace(/\b(c\.?\s*m\.?\s*e\.?\s*i\.?)\b/gi, 'centro municipal de educacao infantil')
    .replace(/\b(e\.?\s*e\.?)\b/gi, 'escola estadual')
    .replace(/\b(e\.?\s*m\.?)\b/gi, 'escola municipal')
    .replace(/\b(col\.?|colegio)\b/gi, 'colegio');

  // Normalizar numerais: "01" -> "1", "002" -> "2"
  s = s.replace(/\b0+(\d+)\b/g, '$1');

  // Remover pontuações, hífens e preposições conectivas
  s = s.replace(/[^a-z0-9\s]/g, ' ');
  s = s.replace(/\b(de|do|da|dos|das|e)\b/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

/**
 * Localiza uma escola por correspondência exata, canônica com siglas ou mapeamento manual.
 */
export function encontrarEscolaPorNome<T extends { id: string; nome: string }>(
  nomeBusca: string,
  todasEscolas: T[],
  mapeamentoManual?: Record<string, string>
): T | null {
  if (!nomeBusca) return null;

  // 1. Mapeamento manual explícito pelo usuário
  if (mapeamentoManual && mapeamentoManual[nomeBusca]) {
    const escId = mapeamentoManual[nomeBusca];
    const esc = todasEscolas.find((e) => e.id === escId);
    if (esc) return esc;
  }

  const buscaNorm = normalizarTexto(nomeBusca);
  const buscaCanon = canonizarNomeEscola(nomeBusca);

  // 2. Busca exata por texto normalizado
  for (const esc of todasEscolas) {
    if (normalizarTexto(esc.nome) === buscaNorm) return esc;
  }

  // 3. Busca exata por nome canônico com expansão de siglas
  for (const esc of todasEscolas) {
    if (canonizarNomeEscola(esc.nome) === buscaCanon) return esc;
  }

  // 4. Busca por contenção canônica
  for (const esc of todasEscolas) {
    const escCanon = canonizarNomeEscola(esc.nome);
    if (escCanon.includes(buscaCanon) || buscaCanon.includes(escCanon)) {
      return esc;
    }
  }

  return null;
}

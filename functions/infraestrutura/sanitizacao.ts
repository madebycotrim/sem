/**
 * Utilitário de sanitização de texto para o backend (Edge Runtime).
 *
 * Remove tags HTML/scripts de campos de texto livre antes de persistir no banco.
 * Complementa a sanitização do frontend (DOMPurify) como defesa em profundidade.
 *
 * Compatível com Cloudflare Workers (sem dependência de DOM/browser APIs).
 */

/**
 * Remove tags HTML e normaliza espaços em branco de um texto.
 *
 * @param texto Texto potencialmente contendo HTML
 * @returns Texto limpo, sem tags HTML, com espaços normalizados
 */
export function sanitizarTexto(texto: string): string {
  return texto
    // Remover tags HTML completas (abertura, fechamento, self-closing)
    .replace(/<[^>]*>/g, '')
    // Remover entidades HTML perigosas e decodificar as seguras
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    // Remover possíveis event handlers inline que sobreviveram
    .replace(/on\w+\s*=\s*(['"])[^'"]*\1/gi, '')
    // Remover javascript: e data: URIs
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    // Normalizar múltiplos espaços/quebras de linha
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitiza um valor opcionalmente nulo/undefined.
 * Retorna null se o input for null/undefined/vazio após sanitização.
 */
export function sanitizarTextoOpcional(texto: string | null | undefined): string | null {
  if (!texto) return null;
  const limpo = sanitizarTexto(texto);
  return limpo.length > 0 ? limpo : null;
}

/**
 * Sanitiza um objeto inteiro, aplicando sanitização em todos os campos string.
 * Campos não-string são preservados como estão.
 */
export function sanitizarObjeto<T extends Record<string, unknown>>(obj: T): T {
  const resultado = { ...obj };
  for (const [chave, valor] of Object.entries(resultado)) {
    if (typeof valor === 'string') {
      (resultado as Record<string, unknown>)[chave] = sanitizarTexto(valor);
    }
  }
  return resultado;
}

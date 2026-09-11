/**
 * Utilitários para formatação e aplicação de máscaras dinâmicas em inputs.
 */

/**
 * Extrai apenas os dígitos numéricos de qualquer valor.
 */
export function somenteDigitos(valor?: string | null): string {
  return (valor ?? '').replace(/\D/g, '');
}

/**
 * Formata string de CPF progressivamente enquanto o usuário digita.
 * Padrão: 000.000.000-00 (máximo 11 dígitos numéricos).
 */
export function formatarCpf(cpf?: string | null): string {
  if (!cpf) return '';
  const limpo = somenteDigitos(cpf).slice(0, 11);
  if (limpo.length <= 3) return limpo;
  if (limpo.length <= 6) return `${limpo.slice(0, 3)}.${limpo.slice(3)}`;
  if (limpo.length <= 9) return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6)}`;
  return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-${limpo.slice(9, 11)}`;
}

/**
 * Formata número de telefone brasileiro progressivamente ao digitar.
 * Suporta:
 * - Fixo (10 dígitos): (XX) XXXX-XXXX
 * - Celular (11 dígitos): (XX) XXXXX-XXXX
 *
 * Permite digitação contínua e deleção (backspace) suave sem travar o cursor.
 */
export function formatarTelefone(telefone?: string | null): string {
  if (!telefone) return '';
  const limpo = somenteDigitos(telefone);
  if (!limpo) return '';

  // Sanitiza DDI (+55) ou 0 à esquerda se colado de outros sistemas
  let digitos = limpo;
  if (digitos.startsWith('55') && digitos.length > 11) {
    digitos = digitos.slice(2);
  }
  if (digitos.startsWith('0') && digitos.length > 11) {
    digitos = digitos.slice(1);
  }
  digitos = digitos.slice(0, 11);

  if (digitos.length === 1) {
    return `(${digitos}`;
  }

  if (digitos.length === 2) {
    // Se o usuário estiver apagando o espaço após o parêntese ')'
    if (telefone.endsWith(')')) {
      return `(${digitos}`;
    }
    return `(${digitos}) `;
  }

  if (digitos.length <= 6) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  }

  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }

  // 11 dígitos: celular
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7, 11)}`;
}

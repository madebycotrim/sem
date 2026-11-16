/**
 * Utilitários locais de validação, formatação e mascaramento de CPF (LGPD).
 */


/**
 * Validação Matemática do CPF através do algoritmo dos dígitos verificadores (Módulo 11).
 * Evita chamadas desnecessárias à API caso o CPF seja matematicamente inválido ou falso.
 *
 * @param cpf String com ou sem pontuação
 * @returns true se o CPF é matematicamente válido, false caso contrário
 */
export function validarCpfMatematicamente(cpf: string): boolean {
  const limpo = cpf.replace(/\D/g, '');

  // O CPF precisa ter exatamente 11 dígitos numéricos
  if (limpo.length !== 11) return false;

  // CPFs com todos os dígitos repetidos são matematicamente inválidos
  if (/^(\d)\1{10}$/.test(limpo)) return false;

  // Cálculo do 1º Dígito Verificador (D1)
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(limpo.charAt(i), 10) * (10 - i);
  }
  let resto = soma % 11;
  const digito1 = resto < 2 ? 0 : 11 - resto;

  if (digito1 !== parseInt(limpo.charAt(9), 10)) {
    return false;
  }

  // Cálculo do 2º Dígito Verificador (D2)
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(limpo.charAt(i), 10) * (11 - i);
  }
  resto = soma % 11;
  const digito2 = resto < 2 ? 0 : 11 - resto;

  return digito2 === parseInt(limpo.charAt(10), 10);
}

/**
 * Formata string de CPF para o padrão 000.000.000-00
 */
export function formatarCpf(cpf: string): string {
  if (cpf.includes('*')) return cpf;
  const limpo = cpf.replace(/\D/g, '').slice(0, 11);
  if (limpo.length <= 3) return limpo;
  if (limpo.length <= 6) return `${limpo.slice(0, 3)}.${limpo.slice(3)}`;
  if (limpo.length <= 9) return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6)}`;
  return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-${limpo.slice(9, 11)}`;
}

/**
 * Normaliza CPF para comparação e persistência, removendo máscara e espaços.
 */
export function normalizarCpf(cpf?: string | null): string {
  return (cpf ?? '').replace(/\D/g, '').slice(0, 11);
}

/**
 * Mascara o CPF para conformidade com a LGPD (ex: 042.***.***-91)
 */
export function mascararCpf(cpf?: string | null): string {
  if (!cpf) return 'Não informado';
  const str = String(cpf).trim();
  if (/^\d{3}\.\*{3}\.\*{3}-\d{2}$/.test(str)) {
    return str;
  }
  const limpo = str.replace(/\D/g, '');
  if (limpo.length === 11) {
    return `${limpo.slice(0, 3)}.***.***-${limpo.slice(9, 11)}`;
  }
  if (limpo.length === 5) {
    return `${limpo.slice(0, 3)}.***.***-${limpo.slice(3, 5)}`;
  }
  return str;
}


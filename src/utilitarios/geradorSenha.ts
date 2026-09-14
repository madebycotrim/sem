export const REGEX_SENHA_SEGURA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/;

/**
 * Gera uma senha temporária segura que atende comprovadamente a todos os requisitos de segurança:
 * - Pelo menos 1 letra minúscula
 * - Pelo menos 1 letra maiúscula
 * - Pelo menos 1 dígito numérico
 * - Pelo menos 1 caractere especial (!@#$%&*)
 * - Mínimo de 8 caracteres (padrão: 10)
 */
export function gerarSenhaTemporariaSegura(tamanho = 10): string {
  const minusculas = 'abcdefghjkmnpqrstuvwxyz'; // sem caracteres ambíguos (l, o)
  const maiusculas = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sem caracteres ambíguos (I, O)
  const numeros = '23456789';
  const especiais = '!@#$%&*';

  const tamanhoFinal = Math.max(8, tamanho);

  const caracteres = [
    minusculas[Math.floor(Math.random() * minusculas.length)],
    maiusculas[Math.floor(Math.random() * maiusculas.length)],
    numeros[Math.floor(Math.random() * numeros.length)],
    especiais[Math.floor(Math.random() * especiais.length)],
  ];

  const pool = minusculas + maiusculas + numeros + especiais;
  while (caracteres.length < tamanhoFinal) {
    caracteres.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  // Embaralha com algoritmo Fisher-Yates
  for (let i = caracteres.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [caracteres[i], caracteres[j]] = [caracteres[j], caracteres[i]];
  }

  const senha = caracteres.join('');
  if (!REGEX_SENHA_SEGURA.test(senha)) {
    return gerarSenhaTemporariaSegura(tamanhoFinal);
  }

  return senha;
}

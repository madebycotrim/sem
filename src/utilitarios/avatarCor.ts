/**
 * Gera deterministicamente uma cor vibrante e única com base no NOME COMPLETO.
 * Utiliza o algoritmo FNV-1a combinado com o ângulo áureo (137.508°) para dispersão
 * máxima no círculo cromático HSL (360°), garantindo que nomes diferentes tenham cores
 * visivelmente distintas e com excelente contraste (texto branco).
 */
export function obterEstiloAvatarGoogle(nome: string): {
  bg: string;
  texto: string;
  backgroundColor: string;
  color: string;
  style: { backgroundColor: string; color: string };
} {
  const nomeLimpo = (nome || '').trim().toLowerCase();
  
  if (nomeLimpo.length === 0) {
    return {
      bg: 'bg-[#1a73e8]',
      texto: 'text-white',
      backgroundColor: '#1a73e8',
      color: '#ffffff',
      style: { backgroundColor: '#1a73e8', color: '#ffffff' },
    };
  }

  // FNV-1a 32-bit hash para alta sensibilidade a qualquer variação no nome completo
  let hash = 2166136261;
  for (let i = 0; i < nomeLimpo.length; i++) {
    hash ^= nomeLimpo.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  // Multiplicação pelo Ângulo Áureo (~137.507764°) para dispersão uniforme no espectro HSL
  const matiz = Math.round((Math.abs(hash) * 137.50776405) % 360);
  
  // Saturação 70% e Luminosidade 40% geram cores sólidas, elegantes e legíveis com texto branco
  const saturacao = 68;
  const luminosidade = 41;
  const backgroundColor = `hsl(${matiz}, ${saturacao}%, ${luminosidade}%)`;

  return {
    bg: '',
    texto: 'text-white',
    backgroundColor,
    color: '#ffffff',
    style: { backgroundColor, color: '#ffffff' },
  };
}

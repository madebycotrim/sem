/**
 * Utilitários Oficiais de Data e Hora no Padrão Brasileiro (Fuso Horário de Brasília: America/Sao_Paulo)
 * Garante que todas as operações e exibições do sistema estejam no fuso de Brasília (UTC-3).
 */

export const FUSO_BRASILIA = 'America/Sao_Paulo';

/**
 * Converte qualquer formato de data (ISO com Z, formato SQLite com espaço, timestamp ou Date)
 * para um objeto Date seguro.
 */
export function parseDataBrasilia(valor: string | number | Date | null | undefined): Date | null {
  if (!valor) return null;
  if (valor instanceof Date) return isNaN(valor.getTime()) ? null : valor;

  if (typeof valor === 'string') {
    const s = valor.trim();
    if (!s) return null;

    // Se for apenas data YYYY-MM-DD, interpreta ao meio-dia no fuso de Brasília para evitar troca de dia
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return new Date(`${s}T12:00:00-03:00`);
    }

    // Se for formato brasileiro DD/MM/AAAA ou DD/MM/AAAA HH:mm:ss
    const matchBr = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if (matchBr) {
      const dia = matchBr[1].padStart(2, '0');
      const mes = matchBr[2].padStart(2, '0');
      const ano = matchBr[3];
      const hora = (matchBr[4] || '12').padStart(2, '0');
      const min = (matchBr[5] || '00').padStart(2, '0');
      const seg = (matchBr[6] || '00').padStart(2, '0');
      return new Date(`${ano}-${mes}-${dia}T${hora}:${min}:${seg}-03:00`);
    }

    // Se for formato SQLite "YYYY-MM-DD HH:MM:SS" (sem timezone e sem T), SQLite armazena em UTC
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s)) {
      return new Date(s.replace(' ', 'T') + 'Z');
    }

    // Se já for ISO com Z ou offset
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(valor);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formata para hora de Brasília: "HH:mm" (24h)
 */
export function formatarHoraBrasilia(
  valor: string | number | Date | null | undefined,
  padrao = '--:--'
): string {
  const d = parseDataBrasilia(valor);
  if (!d) return padrao;
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO_BRASILIA,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

/**
 * Formata para data brasileira: "DD/MM/AAAA"
 */
export function formatarDataBrasilia(
  valor: string | number | Date | null | undefined,
  padrao = '--/--/----'
): string {
  const d = parseDataBrasilia(valor);
  if (!d) return padrao;
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO_BRASILIA,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Formata para data e hora brasileira: "DD/MM/AAAA HH:mm"
 */
export function formatarDataEHoraBrasilia(
  valor: string | number | Date | null | undefined,
  padrao = '--/--/---- --:--'
): string {
  const d = parseDataBrasilia(valor);
  if (!d) return padrao;
  const data = formatarDataBrasilia(d, '');
  const hora = formatarHoraBrasilia(d, '');
  if (!data || !hora) return padrao;
  return `${data} ${hora}`;
}

/**
 * Retorna a data atual de Brasília no formato ISO (AAAA-MM-DD)
 */
export function obterDataHojeBrasilia(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO_BRASILIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * Retorna a data atual por extenso em português no fuso de Brasília
 * Ex: "segunda-feira, 14 de setembro de 2026"
 */
export function obterDataHojeExtensoBrasilia(): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO_BRASILIA,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

/**
 * Retorna timestamp ISO no momento atual
 */
export function obterAgoraBrasiliaIso(): string {
  return new Date().toISOString();
}

/**
 * Extrai a data no fuso de Brasília em formato ISO YYYY-MM-DD
 */
export function obterDataIsoBrasilia(valor: string | number | Date | null | undefined): string {
  const d = parseDataBrasilia(valor);
  if (!d) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO_BRASILIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}


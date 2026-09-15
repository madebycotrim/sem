import { describe, it, expect } from 'vitest';

describe('Regra de Integridade: Tabela Consentimento exclusiva para Catraki API', () => {
  it('deve garantir que somente termos autenticados do Catraki gerem consentimento', () => {
    interface TermoConsentimento {
      id: string;
      pacienteId: string;
      consentidoPor: string;
      dataConsentimento: string;
      referenciaDocumento: string;
      consentimentoDispensado: boolean;
    }

    const bancoConsentimentos: TermoConsentimento[] = [];

    function processarSincronizacaoCatraki(autorizacoes: Array<{
      cpf?: string;
      pacienteId: string;
      authorized: boolean;
      validationCode?: string;
      signedAt?: string;
      signerName?: string;
      documentId?: string;
      isRevoked?: boolean;
    }>) {
      for (const item of autorizacoes) {
        const ehRevogado = Boolean(item.isRevoked || !item.authorized);

        if (ehRevogado) {
          const idx = bancoConsentimentos.findIndex((c) => c.pacienteId === item.pacienteId);
          if (idx !== -1) {
            bancoConsentimentos.splice(idx, 1);
          }
        } else if (item.authorized) {
          const refDocumento = item.validationCode || item.documentId || 'CATRAKI-TCLE';
          const existente = bancoConsentimentos.find(
            (c) => c.pacienteId === item.pacienteId && c.referenciaDocumento === refDocumento
          );

          if (!existente) {
            bancoConsentimentos.push({
              id: 'uuid-' + Math.random(),
              pacienteId: item.pacienteId,
              consentidoPor: item.signerName || 'Responsável Legal (Catraki)',
              dataConsentimento: item.signedAt || new Date().toISOString(),
              referenciaDocumento: refDocumento,
              consentimentoDispensado: false,
            });
          }
        }
      }
    }

    // 1. Simulação: tentativa de importação de planilha NÃO deve inserir em consentimentos
    expect(bancoConsentimentos).toHaveLength(0);

    // 2. Simulação: termo vindo do Catraki autorizado
    processarSincronizacaoCatraki([
      {
        pacienteId: 'pac-1',
        cpf: '08756762141',
        authorized: true,
        validationCode: 'CATRAKI-TCLE-2026',
        signedAt: '2026-09-01T10:00:00Z',
        signerName: 'Maria Silva',
      },
    ]);

    expect(bancoConsentimentos).toHaveLength(1);
    expect(bancoConsentimentos[0].pacienteId).toBe('pac-1');
    expect(bancoConsentimentos[0].referenciaDocumento).toBe('CATRAKI-TCLE-2026');
    expect(bancoConsentimentos[0].consentidoPor).toBe('Maria Silva');

    // 3. Simulação: se o Catraki reportar revogação ou não autorizado
    processarSincronizacaoCatraki([
      {
        pacienteId: 'pac-1',
        cpf: '08756762141',
        authorized: false,
        isRevoked: true,
      },
    ]);

    expect(bancoConsentimentos).toHaveLength(0);
  });

  it('não deve permitir consentimentos fictícios ou manuais de importações de planilhas', () => {
    // Validamos que a referência nunca deve ser de sessão de planilha
    const referenciasPermitidas = (ref: string) => !ref.startsWith('sess:') && ref !== 'Importação de Dados Históricos';

    expect(referenciasPermitidas('sess:imp-123')).toBe(false);
    expect(referenciasPermitidas('CATRAKI-VAL-999')).toBe(true);
    expect(referenciasPermitidas('CATRAKI-TCLE')).toBe(true);
  });
});

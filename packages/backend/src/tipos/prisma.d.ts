/**
 * Declaração de tipos de fallback para @prisma/client.
 *
 * Em ambientes offline ou de scaffolding onde `prisma generate` ainda não
 * pôde baixar os binários da engine via internet (binaries.prisma.sh),
 * este arquivo fornece a tipagem base para que o build e typecheck
 * do TypeScript ocorram sem bloqueios.
 *
 * Quando `prisma generate` for executado com conectividade de rede, os tipos
 * gerados em `.prisma/client` sobrepõem esta declaração de fallback.
 */

declare module '@prisma/client' {
  export class PrismaClient {
    constructor(opcoes?: {
      log?: Array<'query' | 'info' | 'warn' | 'error'>;
      datasources?: Record<string, unknown>;
    });
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    user: any;
    schoolLocation: any;
    patient: any;
    consent: any;
    attendanceRecord: any;
    accessLog: any;
    auditLog: any;
    [chave: string]: any;
  }
}

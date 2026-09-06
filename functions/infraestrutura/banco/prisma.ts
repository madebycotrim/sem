import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

let prismaClient: PrismaClient | null = null;

/**
 * Permite injetar uma instância customizada/mockada do PrismaClient (ex: em testes).
 */
export function setPrisma(instancia: PrismaClient | null): void {
  prismaClient = instancia;
}

/**
 * Retorna o cliente Prisma configurado para o Cloudflare D1.
 */
export function getPrisma(dbBinding: any): PrismaClient {
  // Se o binding já for uma instância mockada do Prisma (testes), usa diretamente
  if (dbBinding && typeof dbBinding.usuario === 'object') {
    return dbBinding as PrismaClient;
  }

  if (!prismaClient) {
    if (!dbBinding) {
      throw new Error('D1 Database binding não encontrado no contexto da Cloudflare (c.env.DB).');
    }
    const adapter = new PrismaD1(dbBinding);
    prismaClient = new PrismaClient({ adapter } as any);
  }
  return prismaClient;
}

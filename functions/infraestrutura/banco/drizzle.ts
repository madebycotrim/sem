import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from './schema.js';

export type AppDatabase = DrizzleD1Database<typeof schema>;

let dbMockado: AppDatabase | null = null;

/**
 * Permite injetar uma instância mockada do banco para testes.
 */
export function setDb(instancia: AppDatabase | null): void {
  dbMockado = instancia;
}

/**
 * Retorna o cliente Drizzle ORM tipado e configurado para o Cloudflare D1.
 */
export function getDb(dbBinding: any): AppDatabase {
  if (dbMockado) {
    return dbMockado;
  }

  if (dbBinding && typeof dbBinding.query === 'object') {
    return dbBinding as AppDatabase;
  }

  if (!dbBinding) {
    throw new Error('D1 Database binding não encontrado no contexto da Cloudflare (c.env.DB).');
  }

  return drizzle(dbBinding, { schema });
}

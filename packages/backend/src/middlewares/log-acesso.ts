import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { prisma } from '../infraestrutura/banco/prisma.js';
import { logger } from '../infraestrutura/logger/pino.js';

/**
 * Middleware de Log de Acesso — Marco Civil da Internet (Lei 12.965/2014).
 *
 * Registra para cada requisição HTTP:
 * - IP de origem
 * - Timestamp UTC
 * - Método HTTP
 * - Rota acessada
 * - ID do Usuário (se autenticado)
 * - Request ID (para correlação)
 *
 * Retenção mínima: 6 meses (180 dias), conforme Art. 15 do Marco Civil.
 * O campo `retentionExpiresAt` é calculado automaticamente.
 */
export function registrarMiddlewareLogAcesso(fastify: FastifyInstance): void {
  const retencaoDias = parseInt(
    process.env['ACCESS_LOG_RETENTION_DAYS'] ?? '180',
    10
  );

  fastify.addHook('onRequest', async (request) => {
    // Gera um Request ID único para correlação
    const requestId = randomUUID();
    request.requestId = requestId;
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const retentionExpiresAt = new Date();
    retentionExpiresAt.setDate(retentionExpiresAt.getDate() + retencaoDias);

    try {
      await prisma.accessLog.create({
        data: {
          userId: (request.user as { userId?: string } | undefined)?.userId ?? null,
          ip: request.ip,
          metodo: request.method,
          rota: request.url,
          requestId: request.requestId ?? randomUUID(),
          statusCode: reply.statusCode,
          retentionExpiresAt,
        },
      });
    } catch (erro) {
      // Log de acesso não deve derrubar a requisição — log e segue
      logger.error(
        { erro, rota: request.url },
        'Falha ao registrar log de acesso (Marco Civil)'
      );
    }
  });
}

/**
 * Declaração para estender o request do Fastify com requestId.
 */
declare module 'fastify' {
  interface FastifyRequest {
    requestId?: string;
  }
}

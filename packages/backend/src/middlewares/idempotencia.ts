import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../infraestrutura/banco/prisma.js';
import { logger } from '../infraestrutura/logger/pino.js';

/**
 * Middleware de Idempotência.
 *
 * Extrai o `idempotencyKey` do body da requisição e verifica se já existe
 * um registro de atendimento com essa chave. Se existir, retorna 409 Conflict
 * com o registro existente — evitando duplicação por retries de rede.
 *
 * O `idempotencyKey` é um UUID v4 gerado no client, enviado em toda
 * submissão de atendimento. A constraint UNIQUE no banco garante
 * atomicidade mesmo sob concorrência.
 *
 * Motivação: notebooks em campo com conectividade instável — o operador
 * pode clicar "salvar" múltiplas vezes ou o retry automático pode reenviar.
 */
export async function middlewareIdempotencia(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const body = request.body as Record<string, unknown> | undefined;

  if (!body || typeof body['idempotencyKey'] !== 'string') {
    // Se não há idempotencyKey, deixa o schema Zod validar adiante
    return;
  }

  const idempotencyKey = body['idempotencyKey'];

  try {
    const registroExistente = await prisma.attendanceRecord.findUnique({
      where: { idempotencyKey },
      select: { id: true, criadoEm: true },
    });

    if (registroExistente) {
      logger.info(
        {
          idempotencyKey,
          registroId: registroExistente.id,
          ip: request.ip,
        },
        'Requisição duplicada detectada (idempotência)'
      );

      return reply.status(409).send({
        erro: 'Atendimento já registrado com esta chave de idempotência.',
        registroExistenteId: registroExistente.id,
        criadoEm: registroExistente.criadoEm,
      });
    }
  } catch (erro) {
    // Em caso de erro no banco, não bloqueia — deixa seguir e o UNIQUE
    // constraint do banco garantirá a idempotência
    logger.error(
      { idempotencyKey, erro },
      'Erro ao verificar idempotência — seguindo com a operação'
    );
  }
}

import type { FastifyInstance } from 'fastify';
import { rotasAuth } from './auth.rotas.js';
import { rotasPaciente } from './paciente.rotas.js';
import { rotasAtendimento } from './atendimento.rotas.js';

/**
 * Registra todas as rotas da API v1 sob o prefixo `/api/v1`.
 */
export async function rotasV1(fastify: FastifyInstance): Promise<void> {
  fastify.register(rotasAuth, { prefix: '/auth' });
  fastify.register(rotasPaciente);
  fastify.register(rotasAtendimento);
}

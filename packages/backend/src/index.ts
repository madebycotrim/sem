import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { carregarEnv } from './config/env.js';
import { logger } from './infraestrutura/logger/pino.js';
import { registrarMiddlewareLogAcesso } from './middlewares/log-acesso.js';
import { rotasV1 } from './rotas/v1/index.js';

/**
 * Bootstrap do servidor Fastify.
 *
 * Registra plugins de segurança (Helmet, CORS, Rate Limit),
 * autenticação (JWT + Cookie HttpOnly), documentação (Swagger/OpenAPI),
 * middlewares globais (AccessLog) e rotas versionadas (/api/v1).
 */
async function iniciarServidor(): Promise<void> {
  // Validação fail-fast das variáveis de ambiente
  const env = carregarEnv();

  const fastify = Fastify({
    logger: false, // Usando Pino customizado
    trustProxy: true, // Para obter IP real atrás de proxy/load balancer
  });

  // ─── Plugins de Segurança ───────────────────────────────────────────────

  await fastify.register(fastifyHelmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production',
  });

  await fastify.register(fastifyCors, {
    origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  });

  await fastify.register(fastifyRateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
  });

  // ─── Autenticação (JWT + Cookie HttpOnly) ───────────────────────────────

  await fastify.register(fastifyCookie);

  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: 'token',
      signed: false,
    },
  });

  // ─── Documentação OpenAPI/Swagger ───────────────────────────────────────

  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Saúde em Movimento — API',
        description:
          'API do sistema de triagem e registro de atendimentos do projeto ' +
          'Escola Cidadã — Saúde em Movimento (UnB / Sesi-DF / Finatec).',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Servidor de desenvolvimento',
        },
      ],
    },
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  });

  // ─── Middlewares Globais ─────────────────────────────────────────────────

  // Log de Acesso (Marco Civil da Internet)
  registrarMiddlewareLogAcesso(fastify);

  // ─── Rotas ──────────────────────────────────────────────────────────────

  await fastify.register(rotasV1, { prefix: '/api/v1' });

  // ─── Health Check ───────────────────────────────────────────────────────

  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ambiente: env.NODE_ENV,
  }));

  // ─── Iniciar Servidor ───────────────────────────────────────────────────

  try {
    await fastify.listen({ port: env.PORT, host: env.HOST });
    logger.info(
      `🚀 Servidor iniciado em http://${env.HOST}:${env.PORT}`
    );
    logger.info(
      `📚 Documentação em http://${env.HOST}:${env.PORT}/docs`
    );
  } catch (erro) {
    logger.fatal(erro, 'Falha ao iniciar o servidor');
    process.exit(1);
  }
}

iniciarServidor();

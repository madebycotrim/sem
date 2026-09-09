import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { logger } from 'hono/logger';
import { carregarEnv, type Bindings } from './config/env.js';
import { rotasV1 } from './rotas/v1/index.js';
import { middlewareLogAcesso } from './middlewares/log-acesso.js';
import { middlewareRateLimit } from './middlewares/rate-limit.js';

const app = new Hono<{ Bindings: Bindings }>();

// Middlewares Globais
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', async (c, next) => {
  const env = carregarEnv(c.env);
  const corsMiddleware = cors({
    origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  });
  return corsMiddleware(c, next);
});
app.use('/api/*', middlewareRateLimit);
app.use('/api/*', middlewareLogAcesso);

// Registrar Rotas da API V1
app.route('/api/v1', rotasV1);

// Rota de Health Check
app.get('/api/health', (c) =>
  c.json({ status: 'ok', runtime: 'Cloudflare Pages Functions', timestamp: new Date().toISOString() })
);

// Servir arquivos estáticos do dist quando a rota não for da API
app.notFound(async (c) => {
  if (c.env?.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text('Not Found', 404);
});

export const onRequest = handle(app);

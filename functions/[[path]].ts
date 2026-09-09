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

// Tratamento Global de Erros
app.onError((err, c) => {
  console.error('Erro na requisição:', err);
  return c.json({ erro: 'Erro interno no servidor.' }, 500);
});

app.use('/api/*', async (c, next) => {
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
app.get('/api/health', (c) => {
  const eventContext = (c.env as any)?.eventContext;
  return c.json({
    status: 'ok',
    runtime: 'Cloudflare Pages Functions',
    hasEventContext: !!eventContext,
    hasNext: typeof eventContext?.next === 'function',
    timestamp: new Date().toISOString(),
  });
});

// Servir arquivos estáticos do dist e suporte a SPA no Cloudflare Pages
app.notFound(async (c) => {
  if (c.req.path.startsWith('/api')) {
    return c.json({ erro: 'Endpoint não encontrado.' }, 404);
  }

  const eventContext = (c.env as any)?.eventContext;
  if (eventContext && typeof eventContext.next === 'function') {
    try {
      const res = await eventContext.next();
      if (res && res.status !== 404) {
        return res;
      }
      // SPA Fallback: serve index.html para rotas do frontend (ex: /pacientes, /atendimentos)
      const url = new URL(c.req.url);
      url.pathname = '/';
      return await eventContext.next(new Request(url.toString(), c.req.raw));
    } catch (erro) {
      console.error('Falha ao servir asset estático via context.next:', erro);
    }
  }

  // Fallback via ASSETS fetcher se disponível
  const assetsFetch = c.env?.ASSETS && typeof c.env.ASSETS.fetch === 'function'
    ? c.env.ASSETS.fetch.bind(c.env.ASSETS)
    : null;

  if (assetsFetch) {
    try {
      const res = await assetsFetch(c.req.raw);
      if (res && res.status < 400) {
        return res;
      }
    } catch (erro) {
      console.error('Falha ao buscar asset via ASSETS.fetch:', erro);
    }
  }

  return c.text('Not Found', 404);
});

export const onRequest = handle(app);

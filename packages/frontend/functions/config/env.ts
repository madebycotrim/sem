import { z } from 'zod';

/**
 * Validação das variáveis de ambiente com Zod.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),

  JWT_SECRET: z
    .string()
    .min(64, 'JWT_SECRET deve ter no mínimo 64 caracteres'),
  JWT_EXPIRATION: z.string().default('8h'),

  KEK_HEX: z
    .string()
    .length(64, 'KEK_HEX deve ter exatamente 64 caracteres hexadecimais (256 bits)')
    .regex(/^[0-9a-fA-F]+$/, 'KEK_HEX deve conter apenas caracteres hexadecimais'),

  SESSION_INACTIVITY_TIMEOUT_MINUTES: z.coerce.number().int().min(1).default(10),

  CORS_ORIGINS: z.string().default('http://localhost:5173,https://sem.catraki.com.br'),

  RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).default(60_000),

  LOG_LEVEL: z
    .enum(['debug', 'info', 'warn', 'error'])
    .default('info'),

  ACCESS_LOG_RETENTION_DAYS: z.coerce.number().int().min(180).default(180),
  PATIENT_DATA_RETENTION_DAYS: z.coerce.number().int().min(1).default(365),

  MFA_ISSUER: z.string().default('Catraki SEM'),
  
  DB: z.any().optional(), // Cloudflare D1 Database binding
});

export type Env = z.infer<typeof envSchema>;

/**
 * Hono Bindings type definition for Cloudflare Workers
 */
export type Bindings = Env;

/**
 * Valida e retorna as variáveis de ambiente.
 * No Cloudflare, o env é injetado em cada requisição (c.env).
 */
export function carregarEnv(envConfig: any): Env {
  const resultado = envSchema.safeParse(envConfig);

  if (!resultado.success) {
    const erros = resultado.error.flatten().fieldErrors;
    const mensagens = Object.entries(erros)
      .map(([campo, msgs]) => `  ${campo}: ${(msgs ?? []).join(', ')}`)
      .join('\n');

    throw new Error(
      `❌ Variáveis de ambiente inválidas:\n${mensagens}\n\n`
    );
  }

  return resultado.data;
}

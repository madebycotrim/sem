import { z } from 'zod';

/**
 * Validação das variáveis de ambiente com Zod.
 *
 * Falha rápido no bootstrap se alguma env obrigatória estiver ausente
 * ou com formato inválido. Isso previne erros silenciosos em runtime.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),

  PORT: z.coerce.number().int().min(1).max(65535).default(3333),
  HOST: z.string().default('0.0.0.0'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),

  JWT_SECRET: z
    .string()
    .min(64, 'JWT_SECRET deve ter no mínimo 64 caracteres'),
  JWT_EXPIRATION: z.string().default('8h'),

  KEK_HEX: z
    .string()
    .length(64, 'KEK_HEX deve ter exatamente 64 caracteres hexadecimais (256 bits)')
    .regex(/^[0-9a-fA-F]+$/, 'KEK_HEX deve conter apenas caracteres hexadecimais'),

  SESSION_INACTIVITY_TIMEOUT_MINUTES: z.coerce.number().int().min(1).default(10),

  CORS_ORIGINS: z.string().default('http://localhost:5173'),

  RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).default(60_000),

  LOG_LEVEL: z
    .enum(['debug', 'info', 'warn', 'error'])
    .default('info'),

  ACCESS_LOG_RETENTION_DAYS: z.coerce.number().int().min(180).default(180),
  PATIENT_DATA_RETENTION_DAYS: z.coerce.number().int().min(1).default(365),

  MFA_ISSUER: z.string().default('SaudeEmMovimento'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Valida e retorna as variáveis de ambiente.
 * Lança erro descritivo se alguma variável estiver inválida/ausente.
 */
export function carregarEnv(): Env {
  const resultado = envSchema.safeParse(process.env);

  if (!resultado.success) {
    const erros = resultado.error.flatten().fieldErrors;
    const mensagens = Object.entries(erros)
      .map(([campo, msgs]) => `  ${campo}: ${(msgs ?? []).join(', ')}`)
      .join('\n');

    throw new Error(
      `❌ Variáveis de ambiente inválidas:\n${mensagens}\n\n` +
        'Consulte .env.example para a lista completa de variáveis.'
    );
  }

  return resultado.data;
}

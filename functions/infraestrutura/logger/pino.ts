import pino from 'pino';

/**
 * Logger estruturado (Pino) para o backend.
 *
 * Em desenvolvimento: saída formatada com pino-pretty.
 * Em produção: JSON estruturado para integração com Sentry, Datadog, ELK, etc.
 *
 * ATENÇÃO (LGPD): NUNCA logar PII (nome, CPF, email, telefone, data de nascimento).
 * Logar apenas IDs opacos (UUID) para rastreabilidade.
 */
export const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  transport:
    process.env['NODE_ENV'] === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  // Em produção, saída JSON pura (default do pino)
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'senha',
      'senhaHash',
      'mfaSecret',
      'cpf',
      'nome',
      'telefone',
      'dataNascimento',
    ],
    censor: '[REDACTED]',
  },
});

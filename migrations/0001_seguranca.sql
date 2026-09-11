-- =============================================================================
-- MIGRATION: Tabelas de Segurança — Brute Force + JWT Revogação
-- =============================================================================

-- Proteção contra brute force no login
CREATE TABLE IF NOT EXISTS tentativas_login (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  ip TEXT NOT NULL,
  sucesso INTEGER NOT NULL DEFAULT 0,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tentativas_login_email ON tentativas_login(email, criado_em);
CREATE INDEX IF NOT EXISTS idx_tentativas_login_ip ON tentativas_login(ip, criado_em);

-- Blacklist de tokens JWT revogados (invalidação server-side no logout)
CREATE TABLE IF NOT EXISTS tokens_revogados (
  jti TEXT PRIMARY KEY,
  expira_em DATETIME NOT NULL,
  revogado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tokens_revogados_expira ON tokens_revogados(expira_em);

-- Tabela de rate limiting persistente por IP
CREATE TABLE IF NOT EXISTS rate_limit (
  ip TEXT NOT NULL,
  janela_inicio INTEGER NOT NULL,
  requisicoes INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (ip, janela_inicio)
);

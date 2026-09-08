CREATE TABLE IF NOT EXISTS configuracoes_rbac (
  id TEXT PRIMARY KEY,
  perfil TEXT UNIQUE NOT NULL,
  modulos TEXT NOT NULL,
  acoes TEXT NOT NULL,
  atualizado_por TEXT,
  atualizado_em DATETIME NOT NULL
);
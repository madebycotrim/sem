-- =============================================================================
-- DDL D1 / SQLITE — SAÚDE EM MOVIMENTO (100% EM PORTUGUÊS DO BRASIL)
-- =============================================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  nome_completo TEXT NOT NULL,
  perfil TEXT NOT NULL,
  mfa_secret TEXT,
  mfa_ativo INTEGER DEFAULT 0,
  ativo INTEGER DEFAULT 1,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS escolas_locais (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  endereco TEXT NOT NULL,
  cidade TEXT NOT NULL,
  uf TEXT NOT NULL,
  ativo INTEGER DEFAULT 1,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pacientes (
  id TEXT PRIMARY KEY,
  nome_enc TEXT NOT NULL,
  cpf_enc TEXT NOT NULL,
  data_nascimento_enc TEXT NOT NULL,
  telefone_enc TEXT,
  dek_cifrada TEXT NOT NULL,
  iv_pii TEXT NOT NULL,
  tag_pii TEXT NOT NULL,
  turma TEXT NOT NULL,
  escola_local_id TEXT NOT NULL,
  retencao_expira_em DATETIME,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (escola_local_id) REFERENCES escolas_locais(id)
);

CREATE TABLE IF NOT EXISTS consentimentos (
  id TEXT PRIMARY KEY,
  paciente_id TEXT NOT NULL,
  consentido_por TEXT,
  data_consentimento DATETIME,
  referencia_documento TEXT,
  consentimento_dispensado INTEGER DEFAULT 0,
  justificativa_dispensa TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
);

CREATE TABLE IF NOT EXISTS atendimentos (
  id TEXT PRIMARY KEY,
  paciente_id TEXT NOT NULL,
  escola_local_id TEXT NOT NULL,
  usuario_id TEXT NOT NULL,
  especialidade TEXT NOT NULL,
  turno TEXT NOT NULL,
  resumo TEXT NOT NULL,
  procedimentos TEXT,
  insumos_utilizados TEXT,
  encaminhamento_externo TEXT,
  chave_idempotencia TEXT UNIQUE NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
  FOREIGN KEY (escola_local_id) REFERENCES escolas_locais(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

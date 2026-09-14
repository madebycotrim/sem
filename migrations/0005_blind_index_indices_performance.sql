-- =============================================================================
-- MIGRAÇÃO 0005: PERFORMANCE, BLIND INDEX E LGPD
-- =============================================================================

-- 1. Blind Index para CPF em pacientes
ALTER TABLE pacientes ADD COLUMN cpf_hash TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_pacientes_cpf_hash 
  ON pacientes(cpf_hash) 
  WHERE ativo = 1 AND cpf_hash IS NOT NULL;

-- 2. Índices de Foreign Key e performance para relatórios e buscas frequentes
CREATE INDEX IF NOT EXISTS idx_atendimentos_paciente 
  ON atendimentos(paciente_id);

CREATE INDEX IF NOT EXISTS idx_atendimentos_escola_data 
  ON atendimentos(escola_local_id, criado_em);

CREATE INDEX IF NOT EXISTS idx_atendimentos_status_data 
  ON atendimentos(status, criado_em);

CREATE INDEX IF NOT EXISTS idx_atendimentos_usuario 
  ON atendimentos(usuario_id);

CREATE INDEX IF NOT EXISTS idx_pacientes_escola_ativo 
  ON pacientes(escola_local_id, ativo);

CREATE INDEX IF NOT EXISTS idx_consentimentos_paciente 
  ON consentimentos(paciente_id);

CREATE INDEX IF NOT EXISTS idx_pacientes_retencao 
  ON pacientes(retencao_expira_em) 
  WHERE retencao_expira_em IS NOT NULL AND ativo = 1;

-- 3. Substituição do índice único restritivo por índice condicional ativo
-- Permite que um aluno possa ter novas consultas futuras na mesma especialidade
-- após a conclusão ou cancelamento do atendimento anterior.
DROP INDEX IF EXISTS atendimentos_paciente_especialidade_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_atendimentos_ativo_especialidade 
  ON atendimentos(paciente_id, especialidade) 
  WHERE status IN ('AGENDADO', 'CONFIRMADO', 'EM_ATENDIMENTO');

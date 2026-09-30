-- Remove o índice restritivo de unicidade total por especialidade, permitindo múltiplas consultas
-- para o mesmo paciente quando a garantia de unicidade for desativada pelo usuário.
DROP INDEX IF EXISTS "atendimentos_paciente_especialidade_key";

CREATE INDEX IF NOT EXISTS "idx_atendimentos_paciente_especialidade"
  ON "atendimentos" ("paciente_id", "especialidade");

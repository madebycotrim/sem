-- Regra absoluta: um paciente só pode ter uma consulta por especialidade.
CREATE UNIQUE INDEX IF NOT EXISTS "atendimentos_paciente_especialidade_key"
  ON "atendimentos" ("paciente_id", "especialidade");

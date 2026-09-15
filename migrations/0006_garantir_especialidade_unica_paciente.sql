-- Garante que nenhum paciente/CPF tenha mais de uma consulta na mesma especialidade.
CREATE UNIQUE INDEX IF NOT EXISTS "atendimentos_paciente_especialidade_key"
  ON "atendimentos" ("paciente_id", "especialidade");

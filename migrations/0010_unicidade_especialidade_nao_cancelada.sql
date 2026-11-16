-- Garante unicidade estrita no banco para (paciente_id, especialidade) apenas enquanto não estiver CANCELADO.
-- Permite agendar nova consulta na mesma especialidade após cancelamento, mas bloqueia duplicidades
-- inclusive em condições de corrida ou tentativas simultâneas de reativação.
CREATE UNIQUE INDEX IF NOT EXISTS "idx_atendimentos_paciente_especialidade_ativa"
  ON "atendimentos" ("paciente_id", "especialidade")
  WHERE "status" != 'CANCELADO';

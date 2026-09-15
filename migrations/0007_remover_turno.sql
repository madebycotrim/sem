-- Migration: 0007_remover_turno.sql
-- Remove definitivamente o conceito e a coluna turno da tabela atendimentos

ALTER TABLE "atendimentos" DROP COLUMN "turno";

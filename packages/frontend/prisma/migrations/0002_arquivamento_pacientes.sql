-- Preserva prontuários ao arquivar pacientes, sem exclusão física.
ALTER TABLE pacientes ADD COLUMN ativo INTEGER NOT NULL DEFAULT 1;

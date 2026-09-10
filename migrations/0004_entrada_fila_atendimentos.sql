-- Mantem a data clinica (criado_em) separada da entrada operacional na fila.
ALTER TABLE atendimentos ADD COLUMN entrada_fila_em DATETIME;

-- Registros existentes usam a data de criacao como entrada historica da fila.
UPDATE atendimentos
SET entrada_fila_em = criado_em
WHERE entrada_fila_em IS NULL;

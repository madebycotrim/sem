-- Separa o momento de entrada operacional na fila da data clinica do atendimento.
ALTER TABLE atendimentos ADD COLUMN entrada_fila_em DATETIME;

UPDATE atendimentos
SET entrada_fila_em = criado_em
WHERE entrada_fila_em IS NULL;

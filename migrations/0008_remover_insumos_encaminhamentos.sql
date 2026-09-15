-- Migração 0008: Remoção definitiva das colunas insumos_utilizados e encaminhamento_externo da tabela atendimentos
-- SQLite 3.35.0+ suporta DROP COLUMN diretamente
ALTER TABLE atendimentos DROP COLUMN insumos_utilizados;
ALTER TABLE atendimentos DROP COLUMN encaminhamento_externo;

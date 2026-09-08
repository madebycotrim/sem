-- Status operacional do atendimento para indicadores e acompanhamento do fluxo.
ALTER TABLE atendimentos ADD COLUMN status TEXT NOT NULL DEFAULT 'CONCLUIDO';
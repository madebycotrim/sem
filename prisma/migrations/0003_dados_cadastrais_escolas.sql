ALTER TABLE escolas_locais ADD COLUMN cnpj TEXT;
ALTER TABLE escolas_locais ADD COLUMN telefone TEXT;
ALTER TABLE escolas_locais ADD COLUMN email TEXT;
ALTER TABLE escolas_locais ADD COLUMN diretoria_regional TEXT;
ALTER TABLE escolas_locais ADD COLUMN alunos_matriculados INTEGER NOT NULL DEFAULT 0;
ALTER TABLE escolas_locais ADD COLUMN unidades_moveis INTEGER NOT NULL DEFAULT 0;
ALTER TABLE escolas_locais ADD COLUMN status_operacao TEXT NOT NULL DEFAULT 'PROGRAMADA';
CREATE UNIQUE INDEX IF NOT EXISTS escolas_locais_cnpj_unique ON escolas_locais(cnpj);

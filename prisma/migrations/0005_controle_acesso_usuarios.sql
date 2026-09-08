ALTER TABLE usuarios ADD COLUMN senha_temporaria INTEGER NOT NULL DEFAULT 0;
ALTER TABLE usuarios ADD COLUMN senha_temporaria_expira_em DATETIME;
ALTER TABLE usuarios ADD COLUMN ultimo_acesso DATETIME;
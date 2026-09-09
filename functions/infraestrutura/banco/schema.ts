import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

// ─── Tabela: usuarios ────────────────────────────────────────────────────────
export const usuarios = sqliteTable('usuarios', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  senhaHash: text('senha_hash').notNull(),
  nomeCompleto: text('nome_completo').notNull(),
  perfil: text('perfil').notNull(), // ADMIN | TRIAGEM_RECEPCAO | PROFISSIONAL_SAUDE | DPO
  conselhoProfissional: text('conselho_profissional'),
  registroProfissional: text('registro_profissional'),
  especialidade: text('especialidade'),
  senhaTemporaria: integer('senha_temporaria', { mode: 'boolean' }).notNull().default(false),
  senhaTemporariaExpiraEm: text('senha_temporaria_expira_em'),
  ultimoAcesso: text('ultimo_acesso'),
  mfaSecret: text('mfa_secret'),
  mfaAtivo: integer('mfa_ativo', { mode: 'boolean' }).default(false),
  ativo: integer('ativo', { mode: 'boolean' }).default(true),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
  atualizadoEm: text('atualizado_em').default(sql`CURRENT_TIMESTAMP`),
});

export const usuariosRelations = relations(usuarios, ({ many }) => ({
  atendimentos: many(atendimentos),
}));

// ─── Tabela: escolas_locais ──────────────────────────────────────────────────
export const escolasLocais = sqliteTable('escolas_locais', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  nome: text('nome').notNull(),
  endereco: text('endereco').notNull(),
  cidade: text('cidade').notNull(),
  uf: text('uf').notNull(),
  cnpj: text('cnpj').unique(),
  telefone: text('telefone'),
  email: text('email'),
  diretoriaRegional: text('diretoria_regional'),
  alunosMatriculados: integer('alunos_matriculados').notNull().default(0),
  unidadesMoveis: integer('unidades_moveis').notNull().default(0),
  statusOperacao: text('status_operacao').notNull().default('PROGRAMADA'),
  ativo: integer('ativo', { mode: 'boolean' }).default(true),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
});

export const escolasLocaisRelations = relations(escolasLocais, ({ many }) => ({
  pacientes: many(pacientes),
  atendimentos: many(atendimentos),
}));

// ─── Tabela: pacientes ───────────────────────────────────────────────────────
export const pacientes = sqliteTable('pacientes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  nomeEnc: text('nome_enc').notNull(),
  cpfEnc: text('cpf_enc').notNull(),
  dataNascimentoEnc: text('data_nascimento_enc').notNull(),
  telefoneEnc: text('telefone_enc'),
  dekCifrada: text('dek_cifrada').notNull(),
  ivPii: text('iv_pii').notNull(),
  tagPii: text('tag_pii').notNull(),
  turma: text('turma').notNull(),
  escolaLocalId: text('escola_local_id').notNull().references(() => escolasLocais.id),
  retencaoExpiraEm: text('retencao_expira_em'),
  ativo: integer('ativo', { mode: 'boolean' }).notNull().default(true),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
  atualizadoEm: text('atualizado_em').default(sql`CURRENT_TIMESTAMP`),
});

export const pacientesRelations = relations(pacientes, ({ one, many }) => ({
  escolaLocal: one(escolasLocais, {
    fields: [pacientes.escolaLocalId],
    references: [escolasLocais.id],
  }),
  consentimentos: many(consentimentos),
  atendimentos: many(atendimentos),
}));

// ─── Tabela: consentimentos ──────────────────────────────────────────────────
export const consentimentos = sqliteTable('consentimentos', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  pacienteId: text('paciente_id').notNull().references(() => pacientes.id),
  consentidoPor: text('consentido_por'),
  dataConsentimento: text('data_consentimento'),
  referenciaDocumento: text('referencia_documento'),
  consentimentoDispensado: integer('consentimento_dispensado', { mode: 'boolean' }).default(false),
  justificativaDispensa: text('justificativa_dispensa'),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
});

export const consentimentosRelations = relations(consentimentos, ({ one }) => ({
  paciente: one(pacientes, {
    fields: [consentimentos.pacienteId],
    references: [pacientes.id],
  }),
}));

// ─── Tabela: atendimentos ────────────────────────────────────────────────────
export const atendimentos = sqliteTable('atendimentos', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  pacienteId: text('paciente_id').notNull().references(() => pacientes.id),
  escolaLocalId: text('escola_local_id').notNull().references(() => escolasLocais.id),
  usuarioId: text('usuario_id').notNull().references(() => usuarios.id),
  especialidade: text('especialidade').notNull(),
  turno: text('turno').notNull(),
  status: text('status').notNull().default('CONCLUIDO'),
  resumo: text('resumo').notNull(),
  procedimentos: text('procedimentos'),
  insumosUtilizados: text('insumos_utilizados'),
  encaminhamentoExterno: text('encaminhamento_externo'),
  chaveIdempotencia: text('chave_idempotencia').notNull().unique(),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
  atualizadoEm: text('atualizado_em').default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex('atendimentos_paciente_especialidade_key').on(table.pacienteId, table.especialidade),
]);

export const atendimentosRelations = relations(atendimentos, ({ one }) => ({
  paciente: one(pacientes, {
    fields: [atendimentos.pacienteId],
    references: [pacientes.id],
  }),
  escolaLocal: one(escolasLocais, {
    fields: [atendimentos.escolaLocalId],
    references: [escolasLocais.id],
  }),
  usuario: one(usuarios, {
    fields: [atendimentos.usuarioId],
    references: [usuarios.id],
  }),
}));

// ─── Tabela: configuracoes_rbac ──────────────────────────────────────────────
export const configuracoesRbac = sqliteTable('configuracoes_rbac', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  perfil: text('perfil').notNull().unique(),
  modulos: text('modulos').notNull(), // JSON string
  acoes: text('acoes').notNull(),     // JSON string
  atualizadoPor: text('atualizado_por'),
  atualizadoEm: text('atualizado_em').default(sql`CURRENT_TIMESTAMP`),
});

export type UsuarioModel = typeof usuarios.$inferSelect;
export type NovoUsuarioModel = typeof usuarios.$inferInsert;
export type EscolaLocalModel = typeof escolasLocais.$inferSelect;
export type PacienteModel = typeof pacientes.$inferSelect;
export type AtendimentoModel = typeof atendimentos.$inferSelect;
export type ConfiguracaoRbacModel = typeof configuracoesRbac.$inferSelect;

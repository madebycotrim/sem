// ─── Enums ───────────────────────────────────────────────────────────────────
export {
  Especialidade,
  ESPECIALIDADE_LABELS,
  ConselhoProfissional,
  CONSELHO_PROFISSIONAL_LABELS,
  Turno,
  TURNO_LABELS,
  StatusAtendimento,
  STATUS_ATENDIMENTO_LABELS,
  PerfilAcesso,
  PERFIL_ACESSO_LABELS,
  PERFIS_MFA_OBRIGATORIO,
  PERMISSOES_PADRAO,
  type PermissoesPerfil,
  type PermissaoAcesso,
} from './enums/index.js';

// ─── Schemas Zod ─────────────────────────────────────────────────────────────
export {
  pacienteSchema,
  criarPacienteSchema,
  atualizarPacienteSchema,
  consentimentoSchema,
  fichaAtendimentoSchema,
  filtroAtendimentoSchema,
  usuarioSchema,
  loginSchema,
  verificarMfaSchema,
  criarEscolaSchema,
} from './schemas/index.js';

// ─── Tipos TypeScript ────────────────────────────────────────────────────────
export type {
  Paciente,
  CriarPaciente,
  AtualizarPaciente,
  Consentimento,
  FichaAtendimento,
  FiltroAtendimento,
  Usuario,
  Login,
  VerificarMfa,
  RespostaPaginada,
  RespostaErro,
} from './tipos/index.js';

// ─── Data e Hora no Padrão Brasileiro (Fuso Horário de Brasília) ─────────────
export {
  FUSO_BRASILIA,
  parseDataBrasilia,
  formatarHoraBrasilia,
  formatarDataBrasilia,
  formatarDataEHoraBrasilia,
  obterDataHojeBrasilia,
  obterDataHojeExtensoBrasilia,
  obterAgoraBrasiliaIso,
  obterDataIsoBrasilia,
} from './datas.js';


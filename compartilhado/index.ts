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

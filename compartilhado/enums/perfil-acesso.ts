/**
 * Perfis de acesso ao sistema (RBAC).
 *
 * - ADMIN: Acesso total, gestão de usuários. MFA obrigatório.
 * - TRIAGEM_RECEPCAO: Cadastro de pacientes e registro de atendimentos.
 * - PROFISSIONAL_SAUDE: Registro e visualização de atendimentos da sua especialidade.
 * - DPO: Encarregado de Dados (LGPD). Acesso somente-leitura ao AuditLog. MFA obrigatório.
 */
export const PerfilAcesso = {
  BOOTSTRAP: 'BOOTSTRAP',
  ADMIN: 'ADMIN',
  TRIAGEM_RECEPCAO: 'TRIAGEM_RECEPCAO',
  PROFISSIONAL_SAUDE: 'PROFISSIONAL_SAUDE',
  DPO: 'DPO',
} as const;

export type PerfilAcesso = (typeof PerfilAcesso)[keyof typeof PerfilAcesso];

/** Labels em português para exibição na UI */
export const PERFIL_ACESSO_LABELS: Record<PerfilAcesso, string> = {
  BOOTSTRAP: 'Super Admin (Bootstrap)',
  ADMIN: 'Administrador',
  TRIAGEM_RECEPCAO: 'Triagem / Recepção',
  PROFISSIONAL_SAUDE: 'Profissional de Saúde',
  DPO: 'Encarregado de Dados (DPO)',
};

/** Perfis que exigem MFA (TOTP) obrigatório */
export const PERFIS_MFA_OBRIGATORIO: readonly PerfilAcesso[] = [
  PerfilAcesso.ADMIN,
  PerfilAcesso.DPO,
];

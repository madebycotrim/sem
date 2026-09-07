export const ConselhoProfissional = {
  CRM: 'CRM',
  CRO: 'CRO',
  CRP: 'CRP',
  CRN: 'CRN',
  CRFA: 'CRFA',
  COREN: 'COREN',
  OUTRO: 'OUTRO',
} as const;

export type ConselhoProfissional = (typeof ConselhoProfissional)[keyof typeof ConselhoProfissional];

export const CONSELHO_PROFISSIONAL_LABELS: Record<ConselhoProfissional, string> = {
  CRM: 'CRM - Conselho Regional de Medicina',
  CRO: 'CRO - Conselho Regional de Odontologia',
  CRP: 'CRP - Conselho Regional de Psicologia',
  CRN: 'CRN - Conselho Regional de Nutricionistas',
  CRFA: 'CRFA - Conselho Regional de Fonoaudiologia',
  COREN: 'COREN - Conselho Regional de Enfermagem',
  OUTRO: 'Outro',
};

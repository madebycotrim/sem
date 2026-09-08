export const ConselhoProfissional = {
  CRM: 'CRM',
  CRO: 'CRO',
  CRP: 'CRP',
  CRN: 'CRN',
  CRFA: 'CRFA',
  COREN: 'COREN',
  CRESS: 'CRESS',
  NAO_INFORMADO: 'NAO_INFORMADO',
  OUTRO: 'OUTRO',
} as const;

export type ConselhoProfissional = (typeof ConselhoProfissional)[keyof typeof ConselhoProfissional];

export const CONSELHO_PROFISSIONAL_LABELS: Record<ConselhoProfissional, string> = {
  CRM: 'CRM-DF - Conselho Regional de Medicina',
  CRO: 'CRO-DF - Conselho Regional de Odontologia',
  CRP: 'CRP-DF - Conselho Regional de Psicologia',
  CRN: 'CRN-DF - Conselho Regional de Nutricionistas',
  CRFA: 'CRFA-DF - Conselho Regional de Fonoaudiologia',
  COREN: 'COREN-DF - Conselho Regional de Enfermagem',
  CRESS: 'CRESS-DF - Conselho Regional de Serviço Social',
  NAO_INFORMADO: 'Não Informado',
  OUTRO: 'Outro',
};

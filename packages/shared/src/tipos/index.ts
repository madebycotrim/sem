import { z } from 'zod';
import type {
  pacienteSchema,
  criarPacienteSchema,
  atualizarPacienteSchema,
  consentimentoSchema,
  fichaAtendimentoSchema,
  filtroAtendimentoSchema,
  usuarioSchema,
  loginSchema,
  verificarMfaSchema,
} from '../schemas/index.js';

// ─── Tipos inferidos dos Schemas Zod (fonte única de verdade) ────────────────

/** Dados completos do paciente */
export type Paciente = z.infer<typeof pacienteSchema>;

/** Dados para criação de paciente */
export type CriarPaciente = z.infer<typeof criarPacienteSchema>;

/** Dados para atualização parcial de paciente */
export type AtualizarPaciente = z.infer<typeof atualizarPacienteSchema>;

/** Dados do consentimento do responsável legal */
export type Consentimento = z.infer<typeof consentimentoSchema>;

/** Dados da ficha de atendimento itinerante */
export type FichaAtendimento = z.infer<typeof fichaAtendimentoSchema>;

/** Filtros para busca de atendimentos */
export type FiltroAtendimento = z.infer<typeof filtroAtendimentoSchema>;

/** Dados completos do usuário */
export type Usuario = z.infer<typeof usuarioSchema>;

/** Dados para login */
export type Login = z.infer<typeof loginSchema>;

/** Dados para verificação MFA */
export type VerificarMfa = z.infer<typeof verificarMfaSchema>;

// ─── Tipos auxiliares do domínio ─────────────────────────────────────────────

/** Resposta paginada genérica */
export interface RespostaPaginada<T> {
  dados: T[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
}

/** Resposta padrão de erro da API */
export interface RespostaErro {
  erro: string;
  detalhes?: Record<string, string[]>;
  requestId?: string;
}

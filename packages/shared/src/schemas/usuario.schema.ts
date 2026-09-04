import { z } from 'zod';
import { PerfilAcesso } from '../enums/perfil-acesso.js';

/**
 * Schema de validação de Usuário do sistema.
 */
export const usuarioSchema = z.object({
  email: z
    .string()
    .email('E-mail inválido')
    .max(254, 'E-mail deve ter no máximo 254 caracteres')
    .trim()
    .toLowerCase(),

  senha: z
    .string()
    .min(12, 'Senha deve ter no mínimo 12 caracteres')
    .max(128, 'Senha deve ter no máximo 128 caracteres'),

  nomeCompleto: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .trim(),

  perfil: z.nativeEnum(PerfilAcesso, {
    errorMap: () => ({
      message: `Perfil deve ser: ${Object.values(PerfilAcesso).join(', ')}`,
    }),
  }),
});

/** Schema para login */
export const loginSchema = z.object({
  email: z.string().email('E-mail inválido').trim().toLowerCase(),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

/** Schema para verificação MFA (TOTP) */
export const verificarMfaSchema = z.object({
  token: z
    .string()
    .length(6, 'Token MFA deve ter exatamente 6 dígitos')
    .regex(/^\d{6}$/, 'Token MFA deve conter apenas dígitos'),
});

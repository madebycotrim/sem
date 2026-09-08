import { z } from 'zod';

export const criarEscolaSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  endereco: z.string().min(5, 'O endereço deve ter no mínimo 5 caracteres'),
  cidade: z.string().min(2, 'A cidade deve ter no mínimo 2 caracteres'),
  uf: z.string().length(2, 'A UF deve ter exatamente 2 caracteres'),
  cnpj: z.preprocess(
    (valor) => typeof valor === 'string' && valor.trim() === '' ? undefined : valor,
    z.string().regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos').optional()
  ),
  telefone: z.string().min(10, 'Telefone inválido').max(20).optional(),
  email: z.string().email('E-mail inválido').optional(),
  diretoriaRegional: z.string().optional(),
  alunosMatriculados: z.number().int().min(0).default(0),
});

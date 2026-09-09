import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { middlewareAutenticacao, type AppVariables } from '../../middlewares/autenticacao.js';
import type { Bindings } from '../../config/env.js';

export const rotasCpf = new Hono<{ Bindings: Bindings; Variables: AppVariables }>();

const consultaCpfSchema = z.object({
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve conter 11 dígitos.'),
});

rotasCpf.use('*', middlewareAutenticacao);

rotasCpf.post('/', zValidator('json', consultaCpfSchema), async (c) => {
  if (!c.env.APICPF_KEY) {
    return c.json({ erro: 'Serviço de CPF não configurado.' }, 503);
  }

  const { cpf } = c.req.valid('json');
  const resposta = await fetch(`https://apicpf.com/api/consulta?cpf=${encodeURIComponent(cpf)}`, {
    headers: { 'X-API-KEY': c.env.APICPF_KEY },
  });
  const dados = await resposta.json().catch(() => null) as {
    code?: number;
    data?: { cpf: string; nome: string; genero?: string; data_nascimento: string };
    message?: string;
  } | null;

  if (!resposta.ok || dados?.code !== 200 || !dados.data) {
    return c.json({ erro: dados?.message ?? 'Não foi possível consultar o CPF.' }, (resposta.status || 502) as 400 | 401 | 403 | 404 | 429 | 500 | 502);
  }

  const genero = dados.data.genero?.toUpperCase();
  return c.json({
    cpf: dados.data.cpf,
    cpfFormatado: dados.data.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
    nome: dados.data.nome.trim().toUpperCase(),
    genero: genero === 'M' ? 'Masculino' : genero === 'F' ? 'Feminino' : genero ? 'Outro' : 'Não informado',
    dataNascimento: dados.data.data_nascimento,
  });
});

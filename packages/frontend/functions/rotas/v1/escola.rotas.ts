import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getPrisma } from '../../infraestrutura/banco/prisma.js';
import { criarEscolaSchema } from '../../../compartilhado/index.js';
import { middlewareAutenticacao, type AppVariables } from '../../middlewares/autenticacao.js';
import { autorizarPerfis } from '../../middlewares/autorizacao.js';
import { middlewareIdempotencia } from '../../middlewares/idempotencia.js';
import { registrarAuditoria } from '../../middlewares/auditoria.js';
import type { Bindings } from '../../config/env.js';

export const rotasEscola = new Hono<{ Bindings: Bindings; Variables: AppVariables }>();
rotasEscola.use('*', middlewareAutenticacao);

// ─── Listar Escolas ──────────────────────────────────────────────────────────
rotasEscola.get('/', autorizarPerfis(['ADMIN', 'TRIAGEM_RECEPCAO', 'PROFISSIONAL_SAUDE']), async (c) => {
  const prisma = getPrisma(c.env.DB);
  
  const escolas = await prisma.escolaLocal.findMany({
    where: { ativo: true },
    orderBy: { nome: 'asc' }
  });
  
  const mapeado = escolas.map(e => ({
    id: e.id,
    nome: e.nome,
    regiao: `${e.cidade} / ${e.uf}`,
    endereco: e.endereco,
    diretoriaRegional: e.diretoriaRegional || 'Não informada',
    alunosMatriculados: e.alunosMatriculados,
    unidadesMoveisEstacionadas: e.unidadesMoveis,
    status: e.statusOperacao,
  }));

  return c.json({ dados: mapeado });
});

// ─── Criar Escola ────────────────────────────────────────────────────────────
rotasEscola.post(
  '/',
  autorizarPerfis(['ADMIN']),
  middlewareIdempotencia,
  zValidator('json', criarEscolaSchema),
  async (c) => {
    const dados = c.req.valid('json');
    const prisma = getPrisma(c.env.DB);
    const usuario = c.get('usuario');

    const escola = await prisma.escolaLocal.create({
      data: {
        nome: dados.nome,
        endereco: dados.endereco,
        cidade: dados.cidade,
        uf: dados.uf,
        cnpj: dados.cnpj,
        telefone: dados.telefone,
        email: dados.email,
        diretoriaRegional: dados.diretoriaRegional,
        alunosMatriculados: dados.alunosMatriculados,
        unidadesMoveis: 0,
        statusOperacao: 'PROGRAMADA',
        ativo: true
      }
    });

    // Registra a auditoria
    await registrarAuditoria(prisma, {
      userId: usuario.userId,
      acao: 'CREATE',
      entidade: 'EscolaLocal',
      entidadeId: escola.id,
      diffPosterior: { nome: escola.nome, cnpj: escola.cnpj },
      ip: c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1',
    });

    return c.json({
      mensagem: 'Escola cadastrada com sucesso',
      dados: { id: escola.id }
    }, 201);
  }
);

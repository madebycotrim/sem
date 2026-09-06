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
    include: {
      _count: {
        select: { pacientes: true, atendimentos: true }
      }
    },
    orderBy: { nome: 'asc' }
  });
  
  const mapeado = escolas.map(e => ({
    id: e.id,
    nome: e.nome,
    cnpj: e.cnpj || undefined,
    regiao: `${e.cidade} / ${e.uf}`,
    endereco: e.endereco,
    diretoriaRegional: e.diretoriaRegional || 'Não informada',
    alunosMatriculados: e._count?.pacientes ?? e.alunosMatriculados,
    totalAtendimentos: e._count?.atendimentos ?? 0,
    unidadesMoveisEstacionadas: e.unidadesMoveis,
    status: e.statusOperacao,
  }));

  return c.json({ dados: mapeado });
});

// ─── Obter Escola por ID ─────────────────────────────────────────────────────
rotasEscola.get('/:id', autorizarPerfis(['ADMIN', 'TRIAGEM_RECEPCAO', 'PROFISSIONAL_SAUDE']), async (c) => {
  const id = c.req.param('id');
  const prisma = getPrisma(c.env.DB);
  const escola = await prisma.escolaLocal.findUnique({ where: { id } });
  if (!escola) return c.json({ erro: 'Instituição não encontrada' }, 404);
  return c.json({
    dados: {
      id: escola.id,
      nome: escola.nome,
      cnpj: escola.cnpj || '',
      endereco: escola.endereco,
      cidade: escola.cidade,
      uf: escola.uf,
      diretoriaRegional: escola.diretoriaRegional || '',
      alunosMatriculados: escola.alunosMatriculados,
    }
  });
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

// ─── Atualizar Escola ────────────────────────────────────────────────────────
rotasEscola.put(
  '/:id',
  autorizarPerfis(['ADMIN']),
  zValidator('json', criarEscolaSchema.partial()),
  async (c) => {
    const id = c.req.param('id');
    const dados = c.req.valid('json');
    const prisma = getPrisma(c.env.DB);
    const usuario = c.get('usuario');

    const escola = await prisma.escolaLocal.update({
      where: { id },
      data: {
        ...(dados.nome && { nome: dados.nome }),
        ...(dados.endereco && { endereco: dados.endereco }),
        ...(dados.cidade && { cidade: dados.cidade }),
        ...(dados.uf && { uf: dados.uf }),
        ...(dados.cnpj !== undefined && { cnpj: dados.cnpj }),
        ...(dados.diretoriaRegional !== undefined && { diretoriaRegional: dados.diretoriaRegional }),
      }
    });

    await registrarAuditoria(prisma, {
      userId: usuario.userId,
      acao: 'UPDATE',
      entidade: 'EscolaLocal',
      entidadeId: escola.id,
      diffPosterior: { nome: escola.nome },
      ip: c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1',
    });

    return c.json({ mensagem: 'Instituição atualizada com sucesso', dados: escola });
  }
);

// ─── Excluir Escola (Soft Delete) ────────────────────────────────────────────
rotasEscola.delete('/:id', autorizarPerfis(['ADMIN']), async (c) => {
  const id = c.req.param('id');
  const prisma = getPrisma(c.env.DB);
  const usuario = c.get('usuario');

  await prisma.escolaLocal.update({
    where: { id },
    data: { ativo: false }
  });

  await registrarAuditoria(prisma, {
    userId: usuario.userId,
    acao: 'DELETE',
    entidade: 'EscolaLocal',
    entidadeId: id,
    ip: c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1',
  });

  return c.json({ mensagem: 'Instituição removida com sucesso' });
});


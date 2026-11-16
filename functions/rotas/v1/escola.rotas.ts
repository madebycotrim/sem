import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getDb } from '../../infraestrutura/banco/drizzle.js';
import { escolasLocais, pacientes, atendimentos } from '../../infraestrutura/banco/schema.js';
import { eq, asc, count } from 'drizzle-orm';
import { criarEscolaSchema } from '../../../compartilhado/index.js';
import { middlewareAutenticacao, type AppVariables } from '../../middlewares/autenticacao.js';
import { autorizarPerfis } from '../../middlewares/autorizacao.js';
import { middlewareIdempotencia } from '../../middlewares/idempotencia.js';
import { registrarAuditoria } from '../../middlewares/auditoria.js';
import type { Bindings } from '../../config/env.js';
import { sanitizarTexto, sanitizarTextoOpcional } from '../../infraestrutura/sanitizacao.js';

export const rotasEscola = new Hono<{ Bindings: Bindings; Variables: AppVariables }>();
rotasEscola.use('*', middlewareAutenticacao);

// ─── Listar Escolas ──────────────────────────────────────────────────────────
rotasEscola.get('/', autorizarPerfis(['BOOTSTRAP', 'ADMIN', 'TRIAGEM_RECEPCAO', 'PROFISSIONAL_SAUDE']), async (c) => {
  const db = getDb(c.env.DB);

  const [escolas, contagemPacientes, contagemAtendimentos] = await Promise.all([
    db.query.escolasLocais.findMany({
      where: eq(escolasLocais.ativo, true),
      orderBy: [asc(escolasLocais.nome)],
    }),
    db
      .select({
        escolaLocalId: pacientes.escolaLocalId,
        total: count(),
      })
      .from(pacientes)
      .where(eq(pacientes.ativo, true))
      .groupBy(pacientes.escolaLocalId),
    db
      .select({
        escolaLocalId: atendimentos.escolaLocalId,
        especialidade: atendimentos.especialidade,
        total: count(),
      })
      .from(atendimentos)
      .groupBy(atendimentos.escolaLocalId, atendimentos.especialidade),
  ]);

  const mapaPacientes = new Map<string, number>();
  for (const row of contagemPacientes) {
    if (row.escolaLocalId) mapaPacientes.set(row.escolaLocalId, Number(row.total) || 0);
  }

  const mapaAtendimentos = new Map<string, { total: number; porEsp: Record<string, number> }>();
  for (const row of contagemAtendimentos) {
    if (!row.escolaLocalId) continue;
    const entry = mapaAtendimentos.get(row.escolaLocalId) ?? { total: 0, porEsp: {} };
    const qtd = Number(row.total) || 0;
    entry.total += qtd;
    if (row.especialidade) {
      entry.porEsp[row.especialidade] = (entry.porEsp[row.especialidade] || 0) + qtd;
    }
    mapaAtendimentos.set(row.escolaLocalId, entry);
  }

  const mapeado = escolas.map((e) => {
    const infoAtend = mapaAtendimentos.get(e.id);
    return {
      id: e.id,
      nome: e.nome,
      cnpj: e.cnpj || undefined,
      regiao: `${e.cidade} / ${e.uf}`,
      endereco: e.endereco,
      diretoriaRegional: e.diretoriaRegional || 'Não informada',
      alunosMatriculados: mapaPacientes.get(e.id) ?? e.alunosMatriculados,
      totalAtendimentos: infoAtend?.total ?? 0,
      atendimentosPorEspecialidade: infoAtend?.porEsp ?? {},
      unidadesMoveisEstacionadas: e.unidadesMoveis,
      status: e.statusOperacao,
    };
  });

  return c.json({ dados: mapeado });
});

// ─── Obter Escola por ID ─────────────────────────────────────────────────────
rotasEscola.get('/:id', autorizarPerfis(['BOOTSTRAP', 'ADMIN', 'TRIAGEM_RECEPCAO', 'PROFISSIONAL_SAUDE']), async (c) => {
  const id = c.req.param('id');
  const db = getDb(c.env.DB);
  const escola = await db.query.escolasLocais.findFirst({ where: eq(escolasLocais.id, id) });
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
  autorizarPerfis(['BOOTSTRAP', 'ADMIN']),
  middlewareIdempotencia,
  zValidator('json', criarEscolaSchema),
  async (c) => {
    const dados = c.req.valid('json');
    const db = getDb(c.env.DB);
    const usuario = c.get('usuario');

    const [escola] = await db.insert(escolasLocais).values({
      nome: sanitizarTexto(dados.nome),
      endereco: sanitizarTexto(dados.endereco),
      cidade: sanitizarTexto(dados.cidade),
      uf: dados.uf,
      cnpj: dados.cnpj,
      telefone: dados.telefone,
      email: dados.email,
      diretoriaRegional: sanitizarTextoOpcional(dados.diretoriaRegional),
      alunosMatriculados: dados.alunosMatriculados,
      unidadesMoveis: 0,
      statusOperacao: 'PROGRAMADA',
      ativo: true,
    }).returning();

    // Registra a auditoria
    await registrarAuditoria(db, {
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
  autorizarPerfis(['BOOTSTRAP', 'ADMIN']),
  zValidator('json', criarEscolaSchema.partial()),
  async (c) => {
    const id = c.req.param('id');
    const dados = c.req.valid('json');
    const db = getDb(c.env.DB);
    const usuario = c.get('usuario');

    const existente = await db.query.escolasLocais.findFirst({ where: eq(escolasLocais.id, id) });
    if (!existente) return c.json({ erro: 'Instituição não encontrada' }, 404);

    const [escola] = await db.update(escolasLocais).set({
      ...(dados.nome && { nome: sanitizarTexto(dados.nome) }),
      ...(dados.endereco && { endereco: sanitizarTexto(dados.endereco) }),
      ...(dados.cidade && { cidade: sanitizarTexto(dados.cidade) }),
      ...(dados.uf && { uf: sanitizarTexto(dados.uf) }),
      ...(dados.cnpj !== undefined && { cnpj: dados.cnpj }),
      ...(dados.diretoriaRegional !== undefined && { diretoriaRegional: sanitizarTextoOpcional(dados.diretoriaRegional) }),
    }).where(eq(escolasLocais.id, id)).returning();

    await registrarAuditoria(db, {
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

// ─── Ativar Escola Ativa / Estacionada Hoje ──────────────────────────────────
rotasEscola.post('/:id/ativar', autorizarPerfis(['BOOTSTRAP', 'ADMIN', 'TRIAGEM_RECEPCAO', 'PROFISSIONAL_SAUDE']), async (c) => {
  const id = c.req.param('id');
  const db = getDb(c.env.DB);
  const usuario = c.get('usuario');

  const existente = await db.query.escolasLocais.findFirst({ where: eq(escolasLocais.id, id) });
  if (!existente) {
    return c.json({ erro: 'Instituição não encontrada' }, 404);
  }

  await db.update(escolasLocais).set({ statusOperacao: 'PROGRAMADA' });
  const [escola] = await db.update(escolasLocais).set({ statusOperacao: 'ESTACIONADA_HOJE' }).where(eq(escolasLocais.id, id)).returning();

  await registrarAuditoria(db, {
    userId: usuario.userId,
    acao: 'UPDATE',
    entidade: 'EscolaLocal',
    entidadeId: id,
    diffPosterior: { statusOperacao: 'ESTACIONADA_HOJE' },
    ip: c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1',
  });

  return c.json({ sucesso: true, dados: escola, mensagem: 'Instituição ativada com sucesso' });
});

// ─── Desativar Escola Ativa ──────────────────────────────────────────────────
rotasEscola.post('/desativar/todas', autorizarPerfis(['BOOTSTRAP', 'ADMIN', 'TRIAGEM_RECEPCAO', 'PROFISSIONAL_SAUDE']), async (c) => {
  const db = getDb(c.env.DB);
  const usuario = c.get('usuario');

  await db.update(escolasLocais).set({ statusOperacao: 'PROGRAMADA' });

  await registrarAuditoria(db, {
    userId: usuario.userId,
    acao: 'UPDATE',
    entidade: 'EscolaLocal',
    entidadeId: 'todas',
    diffPosterior: { statusOperacao: 'PROGRAMADA' },
    ip: c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1',
  });

  return c.json({ sucesso: true, mensagem: 'Instituição desativada com sucesso' });
});

// ─── Excluir Escola (Soft Delete) ────────────────────────────────────────────
rotasEscola.delete('/:id', autorizarPerfis(['BOOTSTRAP', 'ADMIN']), async (c) => {
  const id = c.req.param('id');
  const db = getDb(c.env.DB);
  const usuario = c.get('usuario');

  const existente = await db.query.escolasLocais.findFirst({ where: eq(escolasLocais.id, id) });
  if (!existente || !existente.ativo) return c.json({ erro: 'Instituição não encontrada' }, 404);

  await db.update(escolasLocais).set({ ativo: false }).where(eq(escolasLocais.id, id));

  await registrarAuditoria(db, {
    userId: usuario.userId,
    acao: 'DELETE',
    entidade: 'EscolaLocal',
    entidadeId: id,
    ip: c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1',
  });

  return c.json({ mensagem: 'Instituição removida com sucesso' });
});

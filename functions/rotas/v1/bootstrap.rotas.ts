import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { eq, sql } from 'drizzle-orm';
import { getDb } from '../../infraestrutura/banco/drizzle.js';
import {
  atendimentos,
  consentimentos,
  escolasLocais,
  pacientes,
  usuarios,
} from '../../infraestrutura/banco/schema.js';
import { middlewareAutenticacao, type AppVariables } from '../../middlewares/autenticacao.js';
import { registrarAuditoria } from '../../middlewares/auditoria.js';
import type { Bindings } from '../../config/env.js';

const CONFIRMACAO = 'EXCLUIR DEFINITIVAMENTE';

/**
 * Schema de confirmação via query param.
 *
 * Usamos query param em vez de body porque algumas CDNs/proxies (incluindo
 * Cloudflare Pages) podem ignorar ou truncar o body de requisições DELETE,
 * fazendo a validação do body falhar silenciosamente sem executar a exclusão.
 */
const confirmacaoQuerySchema = z.object({
  confirmacao: z.literal(CONFIRMACAO),
});

export const rotasBootstrap = new Hono<{ Bindings: Bindings; Variables: AppVariables }>();
rotasBootstrap.use('*', middlewareAutenticacao);

rotasBootstrap.use('*', async (c, next) => {
  if (c.get('usuario').perfil !== 'BOOTSTRAP') {
    return c.json({ erro: 'Apenas o perfil BOOTSTRAP pode executar exclusões definitivas.' }, 403);
  }
  await next();
});

const ipDaRequisicao = (c: { req: { header: (nome: string) => string | undefined } }) =>
  c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1';

/** Exclui definitivamente uma consulta (atendimento). */
rotasBootstrap.delete(
  '/consultas/:id',
  zValidator('query', confirmacaoQuerySchema),
  async (c) => {
    const db = getDb(c.env.DB);
    const id = c.req.param('id');

    const consulta = await db.query.atendimentos.findFirst({
      where: eq(atendimentos.id, id),
      columns: { id: true, pacienteId: true, especialidade: true, status: true },
    });

    if (!consulta) return c.json({ erro: 'Consulta não encontrada.' }, 404);

    await db.delete(atendimentos).where(eq(atendimentos.id, id));

    await registrarAuditoria(db, {
      userId: c.get('usuario').userId,
      acao: 'DELETE_PERMANENTE',
      entidade: 'Atendimento',
      entidadeId: id,
      diffAnterior: consulta,
      ip: ipDaRequisicao(c),
    });

    return c.json({ mensagem: 'Consulta excluída definitivamente.', id });
  }
);

/** Exclui definitivamente um paciente, consentimentos e todo o histórico clínico. */
rotasBootstrap.delete(
  '/pacientes/:id',
  zValidator('query', confirmacaoQuerySchema),
  async (c) => {
    const db = getDb(c.env.DB);
    const id = c.req.param('id');

    const paciente = await db.query.pacientes.findFirst({
      where: eq(pacientes.id, id),
      columns: { id: true, ativo: true, turma: true, escolaLocalId: true },
    });

    if (!paciente) return c.json({ erro: 'Paciente não encontrado.' }, 404);

    // Ordem importa: primeiro atendimentos e consentimentos (FK), depois o paciente
    await db.delete(atendimentos).where(eq(atendimentos.pacienteId, id));
    await db.delete(consentimentos).where(eq(consentimentos.pacienteId, id));
    await db.delete(pacientes).where(eq(pacientes.id, id));

    await registrarAuditoria(db, {
      userId: c.get('usuario').userId,
      acao: 'DELETE_PERMANENTE',
      entidade: 'Paciente',
      entidadeId: id,
      diffAnterior: paciente,
      ip: ipDaRequisicao(c),
    });

    return c.json({ mensagem: 'Paciente, consentimentos e histórico excluídos definitivamente.', id });
  }
);

/** Exclui definitivamente uma instituição e todos os dados vinculados. */
rotasBootstrap.delete(
  '/instituicoes/:id',
  zValidator('query', confirmacaoQuerySchema),
  async (c) => {
    const db = getDb(c.env.DB);
    const id = c.req.param('id');

    const instituicao = await db.query.escolasLocais.findFirst({
      where: eq(escolasLocais.id, id),
      columns: { id: true, nome: true },
    });

    if (!instituicao) return c.json({ erro: 'Instituição não encontrada.' }, 404);

    // Ordem importa: dependentes antes do pai
    await db.delete(atendimentos).where(eq(atendimentos.escolaLocalId, id));
    await db.delete(consentimentos).where(
      sql`paciente_id IN (SELECT id FROM pacientes WHERE escola_local_id = ${id})`
    );
    await db.delete(pacientes).where(eq(pacientes.escolaLocalId, id));
    await db.delete(escolasLocais).where(eq(escolasLocais.id, id));

    await registrarAuditoria(db, {
      userId: c.get('usuario').userId,
      acao: 'DELETE_PERMANENTE',
      entidade: 'EscolaLocal',
      entidadeId: id,
      diffAnterior: instituicao,
      ip: ipDaRequisicao(c),
    });

    return c.json({ mensagem: 'Instituição e todos os dados vinculados excluídos definitivamente.', id });
  }
);

/** Exclui definitivamente um usuário e as consultas criadas por ele. */
rotasBootstrap.delete(
  '/usuarios/:id',
  zValidator('query', confirmacaoQuerySchema),
  async (c) => {
    const db = getDb(c.env.DB);
    const id = c.req.param('id');
    const usuarioAtual = c.get('usuario');

    if (id === usuarioAtual.userId) {
      return c.json({ erro: 'O usuário BOOTSTRAP autenticado não pode excluir a própria conta.' }, 409);
    }

    const usuario = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, id),
      columns: { id: true, email: true, perfil: true, nomeCompleto: true },
    });

    if (!usuario) return c.json({ erro: 'Usuário não encontrado.' }, 404);

    await db.delete(atendimentos).where(eq(atendimentos.usuarioId, id));
    await db.delete(usuarios).where(eq(usuarios.id, id));

    await registrarAuditoria(db, {
      userId: usuarioAtual.userId,
      acao: 'DELETE_PERMANENTE',
      entidade: 'Usuario',
      entidadeId: id,
      diffAnterior: usuario,
      ip: ipDaRequisicao(c),
    });

    return c.json({ mensagem: 'Usuário e consultas criadas por ele excluídos definitivamente.', id });
  }
);

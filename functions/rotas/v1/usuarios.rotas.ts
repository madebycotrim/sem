import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getDb } from '../../infraestrutura/banco/drizzle.js';
import { usuarios } from '../../infraestrutura/banco/schema.js';
import { eq, and, asc, count } from 'drizzle-orm';
import { middlewareAutenticacao, type AppVariables } from '../../middlewares/autenticacao.js';
import { autorizarPerfis } from '../../middlewares/autorizacao.js';
import { registrarAuditoria } from '../../middlewares/auditoria.js';
import { gerarHashSenha } from '../../infraestrutura/criptografia/senha.js';
import type { Bindings } from '../../config/env.js';

export const rotasUsuarios = new Hono<{ Bindings: Bindings; Variables: AppVariables }>();

rotasUsuarios.use('*', middlewareAutenticacao);

// ─── Listar Usuários ────────────────────────────────────────────────────────
rotasUsuarios.get('/', autorizarPerfis(['BOOTSTRAP', 'ADMIN', 'DPO']), async (c) => {
  const db = getDb(c.env.DB);

  const listaUsuarios = await db.query.usuarios.findMany({
    orderBy: [asc(usuarios.nomeCompleto)],
    columns: {
      id: true,
      nomeCompleto: true,
      email: true,
      perfil: true,
      conselhoProfissional: true,
      registroProfissional: true,
      especialidade: true,
      senhaTemporaria: true,
      ultimoAcesso: true,
      ativo: true,
      mfaAtivo: true,
      criadoEm: true,
      atualizadoEm: true,
    },
  });

  const mapeados = listaUsuarios.map((u) => ({
    id: u.id,
    nome: u.nomeCompleto,
    email: u.email,
    perfil: u.perfil,
    conselhoProfissional: u.conselhoProfissional,
    registroProfissional: u.registroProfissional,
    especialidade: u.especialidade,
    ativo: u.ativo,
    ultimoAcesso: u.ultimoAcesso
      ? new Date(u.ultimoAcesso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : null,
  }));

  return c.json({ dados: mapeados });
});

const criarUsuarioSchema = z.object({
  nomeCompleto: z.string().min(3, 'Nome completo deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  perfil: z.enum(['ADMIN', 'TRIAGEM_RECEPCAO', 'PROFISSIONAL_SAUDE', 'DPO']),
  senha: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  conselhoProfissional: z.string().optional(),
  registroProfissional: z.string().optional(),
  especialidade: z.string().optional(),
});

// ─── Criar/Convidar Usuário ──────────────────────────────────────────────────
rotasUsuarios.post(
  '/',
  autorizarPerfis(['BOOTSTRAP', 'ADMIN']),
  zValidator('json', criarUsuarioSchema),
  async (c) => {
    const dados = c.req.valid('json');
    const db = getDb(c.env.DB);
    const usuarioLogado = c.get('usuario');

    const usuarioExistente = await db.query.usuarios.findFirst({
      where: eq(usuarios.email, dados.email.toLowerCase()),
    });

    if (usuarioExistente) {
      return c.json({ erro: 'Este e-mail já está cadastrado no sistema.' }, 400);
    }

    const senhaHash = await gerarHashSenha(dados.senha);

    const [novoUsuario] = await db.insert(usuarios).values({
      email: dados.email.toLowerCase(),
      nomeCompleto: dados.nomeCompleto.toUpperCase(),
      perfil: dados.perfil,
      conselhoProfissional: dados.conselhoProfissional,
      registroProfissional: dados.registroProfissional,
      especialidade: dados.especialidade,
      senhaHash,
      senhaTemporaria: true,
      senhaTemporariaExpiraEm: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      ativo: true,
    }).returning();

    await registrarAuditoria(db, {
      userId: usuarioLogado.userId,
      acao: 'CREATE',
      entidade: 'Usuario',
      entidadeId: novoUsuario.id,
      diffPosterior: { email: novoUsuario.email, perfil: novoUsuario.perfil },
      ip: c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1',
    });

    return c.json(
      {
        mensagem: 'Usuário cadastrado com sucesso',
        dados: {
          id: novoUsuario.id,
          nome: novoUsuario.nomeCompleto,
          email: novoUsuario.email,
          perfil: novoUsuario.perfil,
          ativo: novoUsuario.ativo,
        },
      },
      201
    );
  }
);

const atualizarUsuarioSchema = z.object({
  nomeCompleto: z.string().min(3).optional(),
  perfil: z.enum(['ADMIN', 'TRIAGEM_RECEPCAO', 'PROFISSIONAL_SAUDE', 'DPO']).optional(),
  conselhoProfissional: z.string().optional(),
  registroProfissional: z.string().optional(),
  especialidade: z.string().optional(),
  ativo: z.boolean().optional(),
});

// ─── Atualizar Usuário ───────────────────────────────────────────────────────
rotasUsuarios.put(
  '/:id',
  autorizarPerfis(['BOOTSTRAP', 'ADMIN']),
  zValidator('json', atualizarUsuarioSchema),
  async (c) => {
    const id = c.req.param('id');
    const dados = c.req.valid('json');
    const db = getDb(c.env.DB);
    const usuarioLogado = c.get('usuario');

    const usuarioExistente = await db.query.usuarios.findFirst({ where: eq(usuarios.id, id) });
    if (!usuarioExistente) {
      return c.json({ erro: 'Usuário não encontrado' }, 404);
    }

    if (id === usuarioLogado.userId && dados.perfil === 'ADMIN' && usuarioLogado.perfil !== 'ADMIN') {
      return c.json({ erro: 'Este usuário não pode ser promovido ou alterado por esta operação.' }, 403);
    }

    if (dados.ativo === false && usuarioExistente.ativo && usuarioExistente.perfil === 'ADMIN') {
      const [resultado] = await db
        .select({ total: count() })
        .from(usuarios)
        .where(and(eq(usuarios.perfil, 'ADMIN'), eq(usuarios.ativo, true)));

      if ((resultado?.total ?? 0) <= 1) {
        return c.json({ erro: 'O último administrador ativo não pode ser arquivado.' }, 409);
      }
    }

    const [atualizado] = await db
      .update(usuarios)
      .set({
        ...(dados.nomeCompleto && { nomeCompleto: dados.nomeCompleto.toUpperCase() }),
        ...(dados.perfil && { perfil: dados.perfil }),
        ...(dados.conselhoProfissional !== undefined && { conselhoProfissional: dados.conselhoProfissional }),
        ...(dados.registroProfissional !== undefined && { registroProfissional: dados.registroProfissional }),
        ...(dados.especialidade !== undefined && { especialidade: dados.especialidade }),
        ...(dados.ativo !== undefined && { ativo: dados.ativo }),
        atualizadoEm: new Date().toISOString(),
      })
      .where(eq(usuarios.id, id))
      .returning();

    await registrarAuditoria(db, {
      userId: usuarioLogado.userId,
      acao: 'UPDATE',
      entidade: 'Usuario',
      entidadeId: atualizado.id,
      diffPosterior: { perfil: atualizado.perfil, ativo: atualizado.ativo },
      ip: c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1',
    });

    return c.json({ mensagem: 'Usuário atualizado com sucesso', dados: atualizado });
  }
);

// ─── Redefinir Senha do Usuário ──────────────────────────────────────────────
const redefinirSenhaSchema = z.object({
  novaSenha: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres'),
});

rotasUsuarios.post(
  '/:id/redefinir-senha',
  autorizarPerfis(['BOOTSTRAP', 'ADMIN']),
  zValidator('json', redefinirSenhaSchema),
  async (c) => {
    const id = c.req.param('id');
    const { novaSenha } = c.req.valid('json');
    const db = getDb(c.env.DB);
    const usuarioLogado = c.get('usuario');

    const usuarioExistente = await db.query.usuarios.findFirst({ where: eq(usuarios.id, id) });
    if (!usuarioExistente) {
      return c.json({ erro: 'Usuário não encontrado' }, 404);
    }

    const senhaHash = await gerarHashSenha(novaSenha);

    await db
      .update(usuarios)
      .set({
        senhaHash,
        senhaTemporaria: true,
        senhaTemporariaExpiraEm: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        atualizadoEm: new Date().toISOString(),
      })
      .where(eq(usuarios.id, id));

    await registrarAuditoria(db, {
      userId: usuarioLogado.userId,
      acao: 'UPDATE',
      entidade: 'Usuario',
      entidadeId: id,
      diffPosterior: { acao: 'redefinicao_senha' },
      ip: c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1',
    });

    return c.json({ mensagem: 'Senha redefinida com sucesso' });
  }
);

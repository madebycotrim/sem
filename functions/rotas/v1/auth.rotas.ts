import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { sign, verify } from 'hono/jwt';
import * as OTPAuth from 'otpauth';
import { loginSchema, verificarMfaSchema } from '../../../compartilhado/index.js';
import { getDb } from '../../infraestrutura/banco/drizzle.js';
import { usuarios, tokensRevogados } from '../../infraestrutura/banco/schema.js';
import { eq } from 'drizzle-orm';
import { verificarSenha, gerarHashSenha } from '../../infraestrutura/criptografia/senha.js';
import { middlewareAutenticacao, type AppVariables, type PayloadJwt } from '../../middlewares/autenticacao.js';
import { verificarBloqueioLogin, registrarTentativaLogin } from '../../middlewares/brute-force.js';
import { registrarAuditoria } from '../../middlewares/auditoria.js';
import type { Bindings } from '../../config/env.js';

export const rotasAuth = new Hono<{ Bindings: Bindings; Variables: AppVariables }>();

/**
 * Regex de complexidade de senha:
 * - Mínimo 8 caracteres
 * - Pelo menos 1 letra maiúscula
 * - Pelo menos 1 letra minúscula
 * - Pelo menos 1 número
 * - Pelo menos 1 caractere especial
 */
const REGEX_SENHA_FORTE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/;

const alterarSenhaSchema = z.object({
  senhaAtual: z.string().min(1),
  novaSenha: z
    .string()
    .min(8, 'A nova senha deve ter pelo menos 8 caracteres')
    .regex(
      REGEX_SENHA_FORTE,
      'A senha deve conter pelo menos 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial'
    ),
});

/**
 * Extrai IP da requisição de forma segura.
 */
function ipDaRequisicao(c: { req: { header: (nome: string) => string | undefined } }): string {
  return c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1';
}

/**
 * POST /auth/login
 * Realiza autenticação via E-mail e Senha com proteção contra brute force.
 */
rotasAuth.post('/login', zValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json');
  const ip = ipDaRequisicao(c);

  // 1. Verificar bloqueio por brute force
  const bloqueio = await verificarBloqueioLogin(c.env.DB, body.email, ip);
  if (bloqueio.bloqueado) {
    c.header('Retry-After', String(bloqueio.retryAfterSegundos));
    return c.json(
      {
        erro: 'Conta temporariamente bloqueada por excesso de tentativas. Tente novamente em alguns minutos.',
        codigo: 'CONTA_BLOQUEADA',
      },
      429
    );
  }

  const db = getDb(c.env.DB);

  const usuario = await db.query.usuarios.findFirst({
    where: eq(usuarios.email, body.email),
  });

  if (!usuario || !usuario.ativo) {
    // Registrar tentativa falha
    await registrarTentativaLogin(c.env.DB, body.email, ip, false);
    return c.json({ erro: 'Credenciais inválidas.' }, 401);
  }

  const senhaValida = await verificarSenha(body.senha, usuario.senhaHash);
  if (!senhaValida) {
    // Registrar tentativa falha
    await registrarTentativaLogin(c.env.DB, body.email, ip, false);
    return c.json({ erro: 'Credenciais inválidas.' }, 401);
  }

  if (usuario.senhaTemporaria && (!usuario.senhaTemporariaExpiraEm || new Date(usuario.senhaTemporariaExpiraEm) < new Date())) {
    return c.json({ erro: 'A senha temporária expirou. Solicite uma nova senha.', codigo: 'SENHA_TEMPORARIA_EXPIRADA' }, 403);
  }

  // Registrar tentativa de sucesso
  await registrarTentativaLogin(c.env.DB, body.email, ip, true);

  await db.update(usuarios)
    .set({ ultimoAcesso: new Date().toISOString() })
    .where(eq(usuarios.id, usuario.id));

  const jti = crypto.randomUUID();
  const payload = {
    userId: usuario.id,
    email: usuario.email,
    perfil: usuario.perfil,
    jti,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8, // 8h
  };

  const token = await sign(payload, c.env.JWT_SECRET);

  setCookie(c, 'token', token, {
    path: '/',
    httpOnly: true,
    secure: c.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 28800, // 8h em segundos
  });

  await registrarAuditoria(db, {
    userId: usuario.id,
    acao: 'LOGIN',
    entidade: 'Sessao',
    entidadeId: jti,
    ip,
  });

  return c.json({
    usuario: {
      id: usuario.id,
      email: usuario.email,
      nomeCompleto: usuario.nomeCompleto,
      perfil: usuario.perfil,
    },
    trocaSenhaObrigatoria: usuario.senhaTemporaria,
  });
});

rotasAuth.post('/alterar-senha', middlewareAutenticacao, zValidator('json', alterarSenhaSchema), async (c) => {
  const usuarioLogado = c.get('usuario');
  const dados = c.req.valid('json');
  const db = getDb(c.env.DB);
  const usuario = await db.query.usuarios.findFirst({ where: eq(usuarios.id, usuarioLogado.userId) });

  if (!usuario || !(await verificarSenha(dados.senhaAtual, usuario.senhaHash))) {
    return c.json({ erro: 'Senha atual inválida.' }, 401);
  }

  await db.update(usuarios)
    .set({
      senhaHash: await gerarHashSenha(dados.novaSenha),
      senhaTemporaria: false,
      senhaTemporariaExpiraEm: null,
      atualizadoEm: new Date().toISOString(),
    })
    .where(eq(usuarios.id, usuario.id));

  return c.json({ mensagem: 'Senha alterada com sucesso.' });
});

/**
 * POST /auth/mfa/verificar
 * Valida o código TOTP (6 dígitos) para usuários com MFA ativo.
 */
rotasAuth.post(
  '/mfa/verificar',
  middlewareAutenticacao,
  zValidator('json', verificarMfaSchema),
  async (c) => {
    const body = c.req.valid('json');
    const usuarioLogado = c.get('usuario');
    const db = getDb(c.env.DB);

    const usuario = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, usuarioLogado.userId),
    });

    if (!usuario || !usuario.mfaSecret || !usuario.mfaAtivo) {
      return c.json({ erro: 'MFA não configurado para este usuário.' }, 400);
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'Saúde em Movimento',
      label: usuario.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: usuario.mfaSecret,
    });

    const delta = totp.validate({ token: body.token, window: 1 });
    if (delta === null) {
      return c.json({ erro: 'Código MFA inválido ou expirado.' }, 401);
    }

    // Revogar token anterior (sem MFA verificado) se tiver JTI
    if (usuarioLogado.jti && usuarioLogado.exp) {
      await db.insert(tokensRevogados).values({
        jti: usuarioLogado.jti,
        expiraEm: new Date(usuarioLogado.exp * 1000).toISOString(),
      }).onConflictDoNothing();
    }

    // Gerar novo token com mfaVerificado = true e novo JTI
    const novoJti = crypto.randomUUID();
    const payload = {
      userId: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
      mfaVerificado: true,
      jti: novoJti,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    };

    const novoToken = await sign(payload, c.env.JWT_SECRET);

    setCookie(c, 'token', novoToken, {
      path: '/',
      httpOnly: true,
      secure: c.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 28800,
    });

    return c.json({
      mensagem: 'MFA verificado com sucesso.',
      token: novoToken,
    });
  }
);

/**
 * GET /auth/me
 * Retorna os dados do usuário atualmente autenticado, ou { autenticado: false, usuario: null } se não autenticado.
 */
rotasAuth.get('/me', async (c) => {
  let token = getCookie(c, 'token');

  if (!token) {
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return c.json({ autenticado: false, usuario: null }, 200);
  }

  try {
    const payload = (await verify(token, c.env.JWT_SECRET, 'HS256')) as unknown as PayloadJwt;
    if (!payload?.userId || !payload?.perfil) {
      return c.json({ autenticado: false, usuario: null }, 200);
    }

    // Verificar se o token foi revogado
    if (payload.jti) {
      const db2 = getDb(c.env.DB);
      const revogado = await db2.query.tokensRevogados.findFirst({
        where: eq(tokensRevogados.jti, payload.jti),
      });
      if (revogado) {
        return c.json({ autenticado: false, usuario: null }, 200);
      }
    }

    const db = getDb(c.env.DB);
    const usuario = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, payload.userId),
      columns: {
        id: true,
        email: true,
        nomeCompleto: true,
        perfil: true,
        ativo: true,
        criadoEm: true,
        senhaTemporaria: true,
      },
    });

    if (!usuario || !usuario.ativo) {
      return c.json({ autenticado: false, usuario: null }, 200);
    }

    return c.json({
      autenticado: true,
      usuario: {
        ...usuario,
        trocaSenhaObrigatoria: usuario.senhaTemporaria,
      },
    }, 200);
  } catch {
    return c.json({ autenticado: false, usuario: null }, 200);
  }
});

/**
 * POST /auth/logout
 * Encerra a sessão: revoga o token no servidor e remove o cookie.
 */
rotasAuth.post('/logout', async (c) => {
  // Tentar revogar o token no servidor
  let token = getCookie(c, 'token');
  if (!token) {
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (token) {
    try {
      const payload = (await verify(token, c.env.JWT_SECRET, 'HS256')) as unknown as PayloadJwt;
      if (payload.jti && payload.exp) {
        const db = getDb(c.env.DB);
        await db.insert(tokensRevogados).values({
          jti: payload.jti,
          expiraEm: new Date(payload.exp * 1000).toISOString(),
        }).onConflictDoNothing();

        await registrarAuditoria(db, {
          userId: payload.userId,
          acao: 'LOGOUT',
          entidade: 'Sessao',
          entidadeId: payload.jti,
          ip: c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1',
        });
      }
    } catch {
      // Token inválido/expirado — deletar cookie mesmo assim
    }
  }

  deleteCookie(c, 'token', { path: '/' });
  return c.json({ mensagem: 'Logout realizado com sucesso.' });
});

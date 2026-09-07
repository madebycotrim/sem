import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { setCookie, deleteCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';
import * as OTPAuth from 'otpauth';
import { loginSchema, verificarMfaSchema } from '../../../compartilhado/index.js';
import { getPrisma } from '../../infraestrutura/banco/prisma.js';
import { verificarSenha } from '../../infraestrutura/criptografia/senha.js';
import { middlewareAutenticacao, type AppVariables } from '../../middlewares/autenticacao.js';
import type { Bindings } from '../../config/env.js';

export const rotasAuth = new Hono<{ Bindings: Bindings; Variables: AppVariables }>();

/**
 * POST /auth/login
 * Realiza autenticação via E-mail e Senha.
 */
rotasAuth.post('/login', zValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json');
  const prisma = getPrisma(c.env.DB);

  // Verifica se é o e-mail de bootstrap
  if (
    c.env.ADMIN_BOOTSTRAP_EMAIL && 
    body.email === c.env.ADMIN_BOOTSTRAP_EMAIL
  ) {
    if (c.env.ADMIN_BOOTSTRAP_PASSWORD && body.senha !== c.env.ADMIN_BOOTSTRAP_PASSWORD) {
      return c.json({ erro: 'Credenciais inválidas.' }, 401);
    }

    const token = await sign({
      userId: '00000000-0000-0000-0000-000000000000',
      email: body.email,
      perfil: 'BOOTSTRAP',
      mfaVerificado: true,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8, // 8h
    }, c.env.JWT_SECRET);

    setCookie(c, 'token', token, {
      path: '/', httpOnly: true, secure: c.env.NODE_ENV === 'production', sameSite: 'Strict', maxAge: 28800
    });

    return c.json({
      usuario: {
        id: '00000000-0000-0000-0000-000000000000',
        email: body.email,
        nomeCompleto: 'Super Admin (Bootstrap)',
        perfil: 'BOOTSTRAP',
        mfaAtivo: false,
        mfaVerificado: true,
      },
      token
    });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email: body.email },
  });

  if (!usuario || !usuario.ativo) {
    return c.json({ erro: 'Credenciais inválidas.' }, 401);
  }

  const senhaValida = await verificarSenha(body.senha, usuario.senhaHash);
  if (!senhaValida) {
    return c.json({ erro: 'Credenciais inválidas.' }, 401);
  }

  const mfaVerificado = !usuario.mfaAtivo;

  const payload = {
    userId: usuario.id,
    email: usuario.email,
    perfil: usuario.perfil,
    mfaVerificado,
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

  return c.json({
    usuario: {
      id: usuario.id,
      email: usuario.email,
      nomeCompleto: usuario.nomeCompleto,
      perfil: usuario.perfil,
      mfaAtivo: usuario.mfaAtivo,
      mfaVerificado,
    },
    token, // Para clientes que usam Header Authorization (mobile / SSR)
  });
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
    const prisma = getPrisma(c.env.DB);

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioLogado.userId },
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

    // Gerar token com mfaVerificado = true
    const payload = {
      userId: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
      mfaVerificado: true,
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
 * Retorna os dados do usuário atualmente autenticado.
 */
rotasAuth.get('/me', middlewareAutenticacao, async (c) => {
  const usuarioLogado = c.get('usuario');
  const prisma = getPrisma(c.env.DB);

  // Ignora o banco se for bootstrap
  if (usuarioLogado.email === c.env.ADMIN_BOOTSTRAP_EMAIL) {
    return c.json({
      usuario: {
        id: usuarioLogado.userId,
        email: usuarioLogado.email,
        nomeCompleto: 'Super Admin (Bootstrap)',
        perfil: 'BOOTSTRAP',
        mfaAtivo: false,
        ativo: true,
        criadoEm: new Date(),
        mfaVerificado: usuarioLogado.mfaVerificado,
      },
    });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioLogado.userId },
    select: {
      id: true,
      email: true,
      nomeCompleto: true,
      perfil: true,
      mfaAtivo: true,
      ativo: true,
      criadoEm: true,
    },
  });

  if (!usuario || !usuario.ativo) {
    return c.json({ erro: 'Usuário não encontrado ou inativo.' }, 404);
  }

  return c.json({
    usuario: {
      ...usuario,
      mfaVerificado: usuarioLogado.mfaVerificado,
    },
  });
});

/**
 * POST /auth/logout
 * Encerra a sessão removendo o cookie HttpOnly.
 */
rotasAuth.post('/logout', async (c) => {
  deleteCookie(c, 'token', { path: '/' });
  return c.json({ mensagem: 'Logout realizado com sucesso.' });
});

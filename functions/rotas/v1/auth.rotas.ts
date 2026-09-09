import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { setCookie, deleteCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';
import * as OTPAuth from 'otpauth';
import { loginSchema, verificarMfaSchema } from '../../../compartilhado/index.js';
import { getPrisma } from '../../infraestrutura/banco/prisma.js';
import { verificarSenha } from '../../infraestrutura/criptografia/senha.js';
import { gerarHashSenha } from '../../infraestrutura/criptografia/senha.js';
import { middlewareAutenticacao, type AppVariables } from '../../middlewares/autenticacao.js';
import type { Bindings } from '../../config/env.js';

export const rotasAuth = new Hono<{ Bindings: Bindings; Variables: AppVariables }>();

const alterarSenhaSchema = z.object({
  senhaAtual: z.string().min(1),
  novaSenha: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres'),
});

/**
 * POST /auth/login
 * Realiza autenticação via E-mail e Senha.
 */
rotasAuth.post('/login', zValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json');
  const prisma = getPrisma(c.env.DB);

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

  if (usuario.senhaTemporaria && (!usuario.senhaTemporariaExpiraEm || usuario.senhaTemporariaExpiraEm < new Date())) {
    return c.json({ erro: 'A senha temporária expirou. Solicite uma nova senha.', codigo: 'SENHA_TEMPORARIA_EXPIRADA' }, 403);
  }

  await prisma.usuario.update({ where: { id: usuario.id }, data: { ultimoAcesso: new Date() } });

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
    trocaSenhaObrigatoria: usuario.senhaTemporaria,
  });
});

rotasAuth.post('/alterar-senha', middlewareAutenticacao, zValidator('json', alterarSenhaSchema), async (c) => {
  const usuarioLogado = c.get('usuario');
  const dados = c.req.valid('json');
  const prisma = getPrisma(c.env.DB);
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioLogado.userId } });

  if (!usuario || !(await verificarSenha(dados.senhaAtual, usuario.senhaHash))) {
    return c.json({ erro: 'Senha atual inválida.' }, 401);
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      senhaHash: await gerarHashSenha(dados.novaSenha),
      senhaTemporaria: false,
      senhaTemporariaExpiraEm: null,
    },
  });

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
      senhaTemporaria: true,
    },
  });

  if (!usuario || !usuario.ativo) {
    return c.json({ erro: 'Usuário não encontrado ou inativo.' }, 404);
  }

  return c.json({
    usuario: {
      ...usuario,
      trocaSenhaObrigatoria: usuario.senhaTemporaria,
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

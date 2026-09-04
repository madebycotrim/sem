import type { FastifyInstance } from 'fastify';
import { loginSchema, verificarMfaSchema } from '@sistema/shared';
import { prisma } from '../../infraestrutura/banco/prisma.js';
import { logger } from '../../infraestrutura/logger/pino.js';
import { registrarAuditoria } from '../../middlewares/auditoria.js';
import { middlewareAutenticacao } from '../../middlewares/autenticacao.js';

/**
 * Rotas de Autenticação — `/api/v1/auth`
 *
 * - POST /login: Autenticação com email + senha (Argon2id + JWT HttpOnly)
 * - POST /logout: Invalida o cookie de sessão
 * - POST /mfa/verificar: Verificação do token TOTP (MFA)
 */
export async function rotasAuth(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /login
   * Autentica o usuário e retorna JWT em cookie HttpOnly.
   */
  fastify.post('/login', async (request, reply) => {
    const resultado = loginSchema.safeParse(request.body);

    if (!resultado.success) {
      return reply.status(400).send({
        erro: 'Dados de login inválidos.',
        detalhes: resultado.error.flatten().fieldErrors,
      });
    }

    const { email, senha: _senha } = resultado.data;

    const usuario = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        senhaHash: true,
        perfil: true,
        mfaAtivo: true,
        ativo: true,
        nomeCompleto: true,
      },
    });

    if (!usuario || !usuario.ativo) {
      // Mensagem genérica para não vazar informação de existência de conta
      return reply.status(401).send({
        erro: 'Credenciais inválidas.',
      });
    }

    // TODO: Verificar senha com Argon2id
    // const senhaValida = await argon2.verify(usuario.senhaHash, senha);
    // if (!senhaValida) { ... }
    // Placeholder para scaffolding — NUNCA ir para produção sem isso
    logger.warn('⚠️  Verificação de senha Argon2id não implementada (scaffolding)');

    const mfaVerificado = !usuario.mfaAtivo; // Se MFA não está ativo, considera verificado

    const token = fastify.jwt.sign(
      {
        userId: usuario.id,
        email: usuario.email,
        perfil: usuario.perfil,
        mfaVerificado,
      },
      { expiresIn: process.env['JWT_EXPIRATION'] ?? '8h' }
    );

    await registrarAuditoria({
      userId: usuario.id,
      acao: 'LOGIN',
      entidade: 'User',
      entidadeId: usuario.id,
      ip: request.ip,
    });

    return reply
      .setCookie('token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'strict',
        maxAge: 28800, // 8h em segundos
      })
      .status(200)
      .send({
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nomeCompleto: usuario.nomeCompleto,
          perfil: usuario.perfil,
          mfaAtivo: usuario.mfaAtivo,
          mfaVerificado,
        },
      });
  });

  /**
   * POST /logout
   * Limpa o cookie de sessão.
   */
  fastify.post(
    '/logout',
    { preHandler: [middlewareAutenticacao] },
    async (request, reply) => {
      await registrarAuditoria({
        userId: request.user.userId,
        acao: 'LOGOUT',
        entidade: 'User',
        entidadeId: request.user.userId,
        ip: request.ip,
      });

      return reply
        .clearCookie('token', { path: '/' })
        .status(200)
        .send({ mensagem: 'Logout realizado com sucesso.' });
    }
  );

  /**
   * POST /mfa/verificar
   * Verifica o token TOTP (MFA) para ADMIN e DPO.
   */
  fastify.post(
    '/mfa/verificar',
    { preHandler: [middlewareAutenticacao] },
    async (request, reply) => {
      const resultado = verificarMfaSchema.safeParse(request.body);

      if (!resultado.success) {
        return reply.status(400).send({
          erro: 'Token MFA inválido.',
          detalhes: resultado.error.flatten().fieldErrors,
        });
      }

      // TODO: Implementar verificação TOTP com otpauth
      // const usuario = await prisma.user.findUnique({ where: { id: request.user.userId } });
      // const totp = new OTPAuth.TOTP({ secret: usuario.mfaSecret, ... });
      // const valido = totp.validate({ token: resultado.data.token, window: 1 });
      logger.warn('⚠️  Verificação MFA (TOTP) não implementada (scaffolding)');

      // Re-emitir token JWT com mfaVerificado = true
      const novoToken = fastify.jwt.sign(
        {
          userId: request.user.userId,
          email: request.user.email,
          perfil: request.user.perfil,
          mfaVerificado: true,
        },
        { expiresIn: process.env['JWT_EXPIRATION'] ?? '8h' }
      );

      await registrarAuditoria({
        userId: request.user.userId,
        acao: 'MFA_VERIFY',
        entidade: 'User',
        entidadeId: request.user.userId,
        ip: request.ip,
      });

      return reply
        .setCookie('token', novoToken, {
          path: '/',
          httpOnly: true,
          secure: process.env['NODE_ENV'] === 'production',
          sameSite: 'strict',
          maxAge: 28800,
        })
        .status(200)
        .send({ mensagem: 'MFA verificado com sucesso.' });
    }
  );
}

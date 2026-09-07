import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { fichaAtendimentoSchema, filtroAtendimentoSchema } from '../../../compartilhado/index.js';
import { getPrisma } from '../../infraestrutura/banco/prisma.js';
import { middlewareAutenticacao, type AppVariables } from '../../middlewares/autenticacao.js';
import { autorizarPerfis } from '../../middlewares/autorizacao.js';
import { middlewareIdempotencia } from '../../middlewares/idempotencia.js';
import { registrarAuditoria } from '../../middlewares/auditoria.js';
import { descriptografarPii } from '../../infraestrutura/criptografia/crypto.js';
import type { Bindings } from '../../config/env.js';

export const rotasAtendimento = new Hono<{ Bindings: Bindings; Variables: AppVariables }>();

// Proteção do grupo de rotas de atendimento
rotasAtendimento.use('*', middlewareAutenticacao);
rotasAtendimento.use(
  '*',
  autorizarPerfis(['BOOTSTRAP', 'ADMIN', 'TRIAGEM_RECEPCAO', 'PROFISSIONAL_SAUDE'])
);

/**
 * POST /atendimentos
 * Registra um novo atendimento com proteção de idempotência.
 */
rotasAtendimento.post(
  '/',
  middlewareIdempotencia,
  zValidator('json', fichaAtendimentoSchema),
  async (c) => {
    const dados = c.req.valid('json');
    const usuario = c.get('usuario');
    const prisma = getPrisma(c.env.DB);

    const [paciente, escola] = await Promise.all([
      prisma.paciente.findUnique({
        where: { id: dados.pacienteId },
        select: { id: true },
      }),
      prisma.escolaLocal.findUnique({
        where: { id: dados.escolaLocalId },
        select: { id: true },
      }),
    ]);

    if (!paciente) {
      return c.json({ erro: 'Paciente não encontrado.' }, 404);
    }
    if (!escola) {
      return c.json({ erro: 'Escola/local de atendimento não encontrado.' }, 404);
    }

    const consentimento = await prisma.consentimento.findFirst({
      where: { pacienteId: dados.pacienteId },
      orderBy: { criadoEm: 'desc' },
    });

    if (!consentimento) {
      return c.json(
        {
          erro:
            'Paciente não possui consentimento registrado. ' +
            'O consentimento do responsável legal é obrigatório (LGPD Art. 14).',
        },
        422
      );
    }

    const atendimento = await prisma.atendimento.create({
      data: {
        pacienteId: dados.pacienteId,
        escolaLocalId: dados.escolaLocalId,
        usuarioId: usuario.userId,
        especialidade: dados.especialidade,
        turno: dados.turno,
        resumo: dados.resumo,
        procedimentos: dados.procedimentos ?? null,
        insumosUtilizados: dados.insumosUtilizados ?? null,
        encaminhamentoExterno: dados.encaminhamentoExterno ?? null,
        chaveIdempotencia: dados.idempotencyKey,
      },
    });

    const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1';

    await registrarAuditoria(prisma, {
      userId: usuario.userId,
      acao: 'CREATE',
      entidade: 'Atendimento',
      entidadeId: atendimento.id,
      diffPosterior: {
        especialidade: dados.especialidade,
        turno: dados.turno,
        pacienteId: dados.pacienteId,
      },
      ip,
    });

    return c.json(
      {
        id: atendimento.id,
        idempotencyKey: atendimento.chaveIdempotencia,
        especialidade: atendimento.especialidade,
        turno: atendimento.turno,
        criadoEm: atendimento.criadoEm,
      },
      201
    );
  }
);

/**
 * GET /atendimentos
 * Lista atendimentos com filtros e paginação.
 */
rotasAtendimento.get('/', zValidator('query', filtroAtendimentoSchema), async (c) => {
  const filtros = c.req.valid('query');
  const prisma = getPrisma(c.env.DB);

  const where: Record<string, unknown> = {};
  if (filtros.especialidade) where['especialidade'] = filtros.especialidade;
  if (filtros.turno) where['turno'] = filtros.turno;
  if (filtros.escolaLocalId) where['escolaLocalId'] = filtros.escolaLocalId;
  if (filtros.pacienteId) where['pacienteId'] = filtros.pacienteId;
  if (filtros.dataInicio || filtros.dataFim) {
    where['criadoEm'] = {
      ...(filtros.dataInicio && { gte: new Date(filtros.dataInicio) }),
      ...(filtros.dataFim && {
        lte: new Date(filtros.dataFim + 'T23:59:59.999Z'),
      }),
    };
  }

  const [atendimentos, total] = await Promise.all([
    prisma.atendimento.findMany({
      where,
      skip: (filtros.pagina - 1) * filtros.porPagina,
      take: filtros.porPagina,
      orderBy: { criadoEm: 'desc' },
      include: {
        escolaLocal: { select: { nome: true } },
        usuario: { select: { nomeCompleto: true } },
        paciente: { select: { nomeEnc: true, dekCifrada: true, ivPii: true, tagPii: true } },
      },
    }),
    prisma.atendimento.count({ where }),
  ]);

  const kekHex = c.env.KEK_HEX;

  const atendimentosMapeados = await Promise.all(
    atendimentos.map(async (a) => {
      let pacienteNome = 'Paciente Desconhecido';
      try {
        const piiJson = await descriptografarPii(
          a.paciente.nomeEnc,
          a.paciente.dekCifrada,
          a.paciente.ivPii,
          a.paciente.tagPii,
          kekHex
        );
        const pii = JSON.parse(piiJson);
        pacienteNome = pii.nome;
      } catch {
        pacienteNome = '[ERRO DE DESCRIPTOGRAFIA]';
      }

      return {
        id: a.id,
        pacienteNome,
        especialidade: a.especialidade,
        turno: a.turno,
        resumo: a.resumo,
        procedimentos: a.procedimentos,
        insumosUtilizados: a.insumosUtilizados,
        encaminhamentoExterno: a.encaminhamentoExterno,
        escolaLocal: a.escolaLocal.nome,
        profissional: a.usuario.nomeCompleto,
        criadoEm: a.criadoEm,
      };
    })
  );

  return c.json({
    dados: atendimentosMapeados,
    total,
    pagina: filtros.pagina,
    porPagina: filtros.porPagina,
    totalPaginas: Math.ceil(total / filtros.porPagina),
  });
});

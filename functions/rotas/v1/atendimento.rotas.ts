import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import {
  fichaAtendimentoSchema,
  filtroAtendimentoSchema,
  Especialidade,
  StatusAtendimento,
  Turno,
} from '../../../compartilhado/index.js';
import { getPrisma } from '../../infraestrutura/banco/prisma.js';
import { middlewareAutenticacao, type AppVariables } from '../../middlewares/autenticacao.js';
import { autorizarPerfis } from '../../middlewares/autorizacao.js';
import { middlewareIdempotencia } from '../../middlewares/idempotencia.js';
import { registrarAuditoria } from '../../middlewares/auditoria.js';
import { descriptografarPii } from '../../infraestrutura/criptografia/crypto.js';
import type { Bindings } from '../../config/env.js';

export const rotasAtendimento = new Hono<{ Bindings: Bindings; Variables: AppVariables }>();

const filtroRelatorioSchema = z.object({
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  escolaLocalId: z.string().uuid().optional(),
  especialidade: z.nativeEnum(Especialidade).optional(),
  turno: z.nativeEnum(Turno).optional(),
  usuarioId: z.string().uuid().optional(),
});

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

    const consultaExistente = await prisma.atendimento.findFirst({
      where: {
        pacienteId: dados.pacienteId,
        especialidade: dados.especialidade,
      },
      select: { id: true },
    });

    if (consultaExistente) {
      return c.json(
        {
          erro: 'Este CPF já possui uma consulta registrada para esta especialidade. Não é permitido realizar outra consulta.',
        },
        409
      );
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

    let atendimento;
    try {
      atendimento = await prisma.atendimento.create({
        data: {
          pacienteId: dados.pacienteId,
          escolaLocalId: dados.escolaLocalId,
          usuarioId: usuario.userId,
          especialidade: dados.especialidade,
          turno: dados.turno,
          status: StatusAtendimento.CONCLUIDO,
          resumo: dados.resumo,
          procedimentos: dados.procedimentos ?? null,
          insumosUtilizados: dados.insumosUtilizados ?? null,
          encaminhamentoExterno: dados.encaminhamentoExterno ?? null,
          chaveIdempotencia: dados.idempotencyKey,
        },
      });
    } catch (erro) {
      if (String(erro).toLowerCase().includes('unique')) {
        return c.json(
          {
            erro: 'Este CPF já possui uma consulta registrada para esta especialidade. Não é permitido realizar outra consulta.',
          },
          409
        );
      }
      throw erro;
    }

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

const atualizarStatusSchema = z.object({
  status: z.enum(Object.values(StatusAtendimento) as [string, ...string[]]),
});

rotasAtendimento.patch('/:id/status', zValidator('json', atualizarStatusSchema), async (c) => {
  const prisma = getPrisma(c.env.DB);
  const { status } = c.req.valid('json');
  const atendimento = await prisma.atendimento.update({
    where: { id: c.req.param('id') },
    data: { status },
    select: { id: true, status: true, atualizadoEm: true },
  });

  return c.json(atendimento);
});

/**
 * GET /atendimentos/profissionais
 * Lista todos os profissionais de saúde ativos para filtros e relatórios.
 */
rotasAtendimento.get('/profissionais', async (c) => {
  const prisma = getPrisma(c.env.DB);
  const profissionais = await prisma.usuario.findMany({
    where: { perfil: 'PROFISSIONAL_SAUDE', ativo: true },
    select: { id: true, nomeCompleto: true, especialidade: true },
    orderBy: { nomeCompleto: 'asc' },
  });

  return c.json({
    dados: profissionais.map((profissional: any) => ({
      id: profissional.id,
      nome: profissional.nomeCompleto,
      especialidade: profissional.especialidade,
    })),
  });
});

/**
 * GET /atendimentos/relatorio
 * Agrega somente dados operacionais já filtrados no banco.
 */
rotasAtendimento.get('/relatorio', zValidator('query', filtroRelatorioSchema), async (c) => {
  const filtros = c.req.valid('query');
  const prisma = getPrisma(c.env.DB);
  const where: Record<string, unknown> = {};

  if (filtros.escolaLocalId) where.escolaLocalId = filtros.escolaLocalId;
  if (filtros.especialidade) where.especialidade = filtros.especialidade;
  if (filtros.turno) where.turno = filtros.turno;
  if (filtros.usuarioId) where.usuarioId = filtros.usuarioId;
  if (filtros.dataInicio || filtros.dataFim) {
    if (filtros.dataInicio && filtros.dataFim && filtros.dataInicio > filtros.dataFim) {
      return c.json({ erro: 'A data inicial não pode ser posterior à data final.' }, 400);
    }
    const criadoEm: { gte?: Date; lte?: Date } = {};
    if (filtros.dataInicio) criadoEm.gte = new Date(`${filtros.dataInicio}T00:00:00.000Z`);
    if (filtros.dataFim) criadoEm.lte = new Date(`${filtros.dataFim}T23:59:59.999Z`);
    where.criadoEm = criadoEm;
  }

  const atendimentos = await prisma.atendimento.findMany({
    where,
    select: {
      especialidade: true,
      turno: true,
      encaminhamentoExterno: true,
      criadoEm: true,
      escolaLocal: { select: { id: true, nome: true } },
      usuario: { select: { id: true, nomeCompleto: true } },
    },
    orderBy: { criadoEm: 'desc' },
  });

  const porEspecialidade = new Map<string, { total: number; encaminhamentos: number }>();
  let totalEncaminhamentos = 0;
  const porEscola = new Map<string, { id: string; nome: string; total: number }>();
  const porProfissional = new Map<string, { id: string; nome: string; total: number }>();

  for (const atendimento of atendimentos) {
    const especialidade = porEspecialidade.get(atendimento.especialidade) ?? { total: 0, encaminhamentos: 0 };
    especialidade.total += 1;
    if (atendimento.encaminhamentoExterno?.trim()) {
      especialidade.encaminhamentos += 1;
      totalEncaminhamentos += 1;
    }
    porEspecialidade.set(atendimento.especialidade, especialidade);
    const escola = porEscola.get(atendimento.escolaLocal.id) ?? {
      id: atendimento.escolaLocal.id,
      nome: atendimento.escolaLocal.nome,
      total: 0,
    };
    escola.total += 1;
    porEscola.set(escola.id, escola);
    const profissional = porProfissional.get(atendimento.usuario.id) ?? {
      id: atendimento.usuario.id,
      nome: atendimento.usuario.nomeCompleto,
      total: 0,
    };
    profissional.total += 1;
    porProfissional.set(profissional.id, profissional);
  }

  return c.json({
    total: atendimentos.length,
    totalEncaminhamentos,
    porEspecialidade: Array.from(porEspecialidade, ([especialidade, valores]) => ({ especialidade, ...valores }))
      .sort((a, b) => b.total - a.total),
    porEscola: Array.from(porEscola.values()).sort((a, b) => b.total - a.total),
    porProfissional: Array.from(porProfissional.values()).sort((a, b) => b.total - a.total),
    serie: (atendimentos as any[]).reduce((acc: Record<string, number>, atendimento: any) => {
      const dia = atendimento.criadoEm.toISOString().slice(0, 10);
      acc[dia] = (acc[dia] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  });
});

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
  if (filtros.usuarioId) where['usuarioId'] = filtros.usuarioId;
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
    (atendimentos as any[]).map(async (a: any) => {
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
        pacienteId: a.pacienteId,
        pacienteNome,
        especialidade: a.especialidade,
        turno: a.turno,
        status: a.status,
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

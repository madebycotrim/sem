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
import { getDb } from '../../infraestrutura/banco/drizzle.js';
import { atendimentos, pacientes, escolasLocais, consentimentos, usuarios } from '../../infraestrutura/banco/schema.js';
import { eq, and, desc, asc, count, gte, lte } from 'drizzle-orm';
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
    const db = getDb(c.env.DB);

    const [paciente, escola] = await Promise.all([
      db.query.pacientes.findFirst({
        where: eq(pacientes.id, dados.pacienteId),
        columns: { id: true },
      }),
      db.query.escolasLocais.findFirst({
        where: eq(escolasLocais.id, dados.escolaLocalId),
        columns: { id: true },
      }),
    ]);

    if (!paciente) {
      return c.json({ erro: 'Paciente não encontrado.' }, 404);
    }
    if (!escola) {
      return c.json({ erro: 'Escola/local de atendimento não encontrado.' }, 404);
    }

    const consultaExistente = await db.query.atendimentos.findFirst({
      where: and(
        eq(atendimentos.pacienteId, dados.pacienteId),
        eq(atendimentos.especialidade, dados.especialidade)
      ),
      columns: { id: true },
    });

    if (consultaExistente) {
      return c.json(
        {
          erro: 'Este CPF já possui uma consulta registrada para esta especialidade. Não é permitido realizar outra consulta.',
        },
        409
      );
    }

    const consentimento = await db.query.consentimentos.findFirst({
      where: eq(consentimentos.pacienteId, dados.pacienteId),
      orderBy: [desc(consentimentos.criadoEm)],
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
      const [novoAtendimento] = await db.insert(atendimentos).values({
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
      }).returning();
      atendimento = novoAtendimento;
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

    await registrarAuditoria(db, {
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
  const db = getDb(c.env.DB);
  const { status } = c.req.valid('json');
  const [atendimento] = await db
    .update(atendimentos)
    .set({ status, atualizadoEm: new Date().toISOString() })
    .where(eq(atendimentos.id, c.req.param('id')))
    .returning({ id: atendimentos.id, status: atendimentos.status, atualizadoEm: atendimentos.atualizadoEm });

  return c.json(atendimento);
});

/**
 * GET /atendimentos/profissionais
 * Lista todos os profissionais de saúde ativos para filtros e relatórios.
 */
rotasAtendimento.get('/profissionais', async (c) => {
  const db = getDb(c.env.DB);
  const profissionais = await db.query.usuarios.findMany({
    where: and(eq(usuarios.perfil, 'PROFISSIONAL_SAUDE'), eq(usuarios.ativo, true)),
    columns: { id: true, nomeCompleto: true, especialidade: true },
    orderBy: [asc(usuarios.nomeCompleto)],
  });

  return c.json({
    dados: profissionais.map((profissional) => ({
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
  const db = getDb(c.env.DB);
  const condicoes = [];

  if (filtros.escolaLocalId) condicoes.push(eq(atendimentos.escolaLocalId, filtros.escolaLocalId));
  if (filtros.especialidade) condicoes.push(eq(atendimentos.especialidade, filtros.especialidade));
  if (filtros.turno) condicoes.push(eq(atendimentos.turno, filtros.turno));
  if (filtros.usuarioId) condicoes.push(eq(atendimentos.usuarioId, filtros.usuarioId));
  if (filtros.dataInicio || filtros.dataFim) {
    if (filtros.dataInicio && filtros.dataFim && filtros.dataInicio > filtros.dataFim) {
      return c.json({ erro: 'A data inicial não pode ser posterior à data final.' }, 400);
    }
    if (filtros.dataInicio) condicoes.push(gte(atendimentos.criadoEm, `${filtros.dataInicio} 00:00:00`));
    if (filtros.dataFim) condicoes.push(lte(atendimentos.criadoEm, `${filtros.dataFim} 23:59:59`));
  }

  const whereClause = condicoes.length > 0 ? and(...condicoes) : undefined;

  const listaAtendimentos = await db.query.atendimentos.findMany({
    where: whereClause,
    columns: {
      especialidade: true,
      turno: true,
      encaminhamentoExterno: true,
      criadoEm: true,
    },
    with: {
      escolaLocal: { columns: { id: true, nome: true } },
      usuario: { columns: { id: true, nomeCompleto: true } },
    },
    orderBy: [desc(atendimentos.criadoEm)],
  });

  const porEspecialidade = new Map<string, { total: number; encaminhamentos: number }>();
  let totalEncaminhamentos = 0;
  const porEscola = new Map<string, { id: string; nome: string; total: number }>();
  const porProfissional = new Map<string, { id: string; nome: string; total: number }>();

  for (const atendimento of listaAtendimentos) {
    const especialidade = porEspecialidade.get(atendimento.especialidade) ?? { total: 0, encaminhamentos: 0 };
    especialidade.total += 1;
    if (atendimento.encaminhamentoExterno?.trim()) {
      especialidade.encaminhamentos += 1;
      totalEncaminhamentos += 1;
    }
    porEspecialidade.set(atendimento.especialidade, especialidade);
    
    if (atendimento.escolaLocal) {
      const escola = porEscola.get(atendimento.escolaLocal.id) ?? {
        id: atendimento.escolaLocal.id,
        nome: atendimento.escolaLocal.nome,
        total: 0,
      };
      escola.total += 1;
      porEscola.set(escola.id, escola);
    }

    if (atendimento.usuario) {
      const profissional = porProfissional.get(atendimento.usuario.id) ?? {
        id: atendimento.usuario.id,
        nome: atendimento.usuario.nomeCompleto,
        total: 0,
      };
      profissional.total += 1;
      porProfissional.set(profissional.id, profissional);
    }
  }

  return c.json({
    total: listaAtendimentos.length,
    totalEncaminhamentos,
    porEspecialidade: Array.from(porEspecialidade, ([especialidade, valores]) => ({ especialidade, ...valores }))
      .sort((a, b) => b.total - a.total),
    porEscola: Array.from(porEscola.values()).sort((a, b) => b.total - a.total),
    porProfissional: Array.from(porProfissional.values()).sort((a, b) => b.total - a.total),
    serie: listaAtendimentos.reduce((acc: Record<string, number>, atendimento) => {
      const dia = (atendimento.criadoEm ?? '').slice(0, 10);
      if (dia) acc[dia] = (acc[dia] ?? 0) + 1;
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
  const db = getDb(c.env.DB);
  const condicoes = [];

  if (filtros.especialidade) condicoes.push(eq(atendimentos.especialidade, filtros.especialidade));
  if (filtros.turno) condicoes.push(eq(atendimentos.turno, filtros.turno));
  if (filtros.escolaLocalId) condicoes.push(eq(atendimentos.escolaLocalId, filtros.escolaLocalId));
  if (filtros.usuarioId) condicoes.push(eq(atendimentos.usuarioId, filtros.usuarioId));
  if (filtros.pacienteId) condicoes.push(eq(atendimentos.pacienteId, filtros.pacienteId));
  if (filtros.dataInicio) condicoes.push(gte(atendimentos.criadoEm, filtros.dataInicio));
  if (filtros.dataFim) condicoes.push(lte(atendimentos.criadoEm, `${filtros.dataFim} 23:59:59`));

  const whereClause = condicoes.length > 0 ? and(...condicoes) : undefined;

  const [listaAtendimentos, totalResult] = await Promise.all([
    db.query.atendimentos.findMany({
      where: whereClause,
      offset: (filtros.pagina - 1) * filtros.porPagina,
      limit: filtros.porPagina,
      orderBy: [desc(atendimentos.criadoEm)],
      with: {
        escolaLocal: { columns: { nome: true } },
        usuario: { columns: { nomeCompleto: true } },
        paciente: { columns: { nomeEnc: true, dekCifrada: true, ivPii: true, tagPii: true } },
      },
    }),
    db.select({ total: count() }).from(atendimentos).where(whereClause),
  ]);

  const total = totalResult[0]?.total ?? 0;
  const kekHex = c.env.KEK_HEX;

  const atendimentosMapeados = await Promise.all(
    listaAtendimentos.map(async (a) => {
      let pacienteNome = 'Paciente Desconhecido';
      if (a.paciente) {
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
        escolaLocal: a.escolaLocal?.nome ?? 'Desconhecida',
        profissional: a.usuario?.nomeCompleto ?? 'Desconhecido',
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

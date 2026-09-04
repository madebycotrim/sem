import type { FastifyInstance } from 'fastify';
import { fichaAtendimentoSchema, filtroAtendimentoSchema } from '@sistema/shared';
import { prisma } from '../../infraestrutura/banco/prisma.js';
import { middlewareAutenticacao } from '../../middlewares/autenticacao.js';
import { autorizarPerfis } from '../../middlewares/autorizacao.js';
import { middlewareIdempotencia } from '../../middlewares/idempotencia.js';
import { registrarAuditoria } from '../../middlewares/auditoria.js';

/**
 * Rotas de Atendimentos — `/api/v1/atendimentos`
 *
 * Fluxo livre de registro, sem travas de quantidade por dia ou especialidade.
 * Idempotência obrigatória via `idempotencyKey` (UUID gerado no client).
 */
export async function rotasAtendimento(fastify: FastifyInstance): Promise<void> {
  const preHandler = [
    middlewareAutenticacao,
    autorizarPerfis(['ADMIN', 'TRIAGEM_RECEPCAO', 'PROFISSIONAL_SAUDE']),
  ];

  /**
   * POST /atendimentos
   * Registra um novo atendimento com verificação de idempotência.
   */
  fastify.post(
    '/atendimentos',
    { preHandler: [...preHandler, middlewareIdempotencia] },
    async (request, reply) => {
      const resultado = fichaAtendimentoSchema.safeParse(request.body);

      if (!resultado.success) {
        return reply.status(400).send({
          erro: 'Dados do atendimento inválidos.',
          detalhes: resultado.error.flatten().fieldErrors,
        });
      }

      const dados = resultado.data;

      // Verificar se paciente e escola existem
      const [paciente, escola] = await Promise.all([
        prisma.patient.findUnique({
          where: { id: dados.pacienteId },
          select: { id: true },
        }),
        prisma.schoolLocation.findUnique({
          where: { id: dados.escolaLocalId },
          select: { id: true },
        }),
      ]);

      if (!paciente) {
        return reply.status(404).send({ erro: 'Paciente não encontrado.' });
      }
      if (!escola) {
        return reply
          .status(404)
          .send({ erro: 'Escola/local de atendimento não encontrado.' });
      }

      // Verificar consentimento ativo para o paciente
      const consentimento = await prisma.consent.findFirst({
        where: { pacienteId: dados.pacienteId },
        orderBy: { criadoEm: 'desc' },
      });

      if (!consentimento) {
        return reply.status(422).send({
          erro:
            'Paciente não possui consentimento registrado. ' +
            'O consentimento do responsável legal é obrigatório (LGPD Art. 14).',
        });
      }

      const atendimento = await prisma.attendanceRecord.create({
        data: {
          pacienteId: dados.pacienteId,
          escolaLocalId: dados.escolaLocalId,
          userId: request.user.userId,
          especialidade: dados.especialidade,
          turno: dados.turno,
          resumo: dados.resumo,
          procedimentos: dados.procedimentos ?? null,
          insumosUtilizados: dados.insumosUtilizados ?? null,
          encaminhamentoExterno: dados.encaminhamentoExterno ?? null,
          idempotencyKey: dados.idempotencyKey,
        },
      });

      await registrarAuditoria({
        userId: request.user.userId,
        acao: 'CREATE',
        entidade: 'AttendanceRecord',
        entidadeId: atendimento.id,
        diffPosterior: {
          especialidade: dados.especialidade,
          turno: dados.turno,
          pacienteId: dados.pacienteId,
        },
        ip: request.ip,
      });

      return reply.status(201).send({
        id: atendimento.id,
        idempotencyKey: atendimento.idempotencyKey,
        especialidade: atendimento.especialidade,
        turno: atendimento.turno,
        criadoEm: atendimento.criadoEm,
      });
    }
  );

  /**
   * GET /atendimentos
   * Lista atendimentos com paginação e filtros.
   */
  fastify.get(
    '/atendimentos',
    { preHandler },
    async (request, reply) => {
      const resultado = filtroAtendimentoSchema.safeParse(request.query);

      if (!resultado.success) {
        return reply.status(400).send({
          erro: 'Filtros inválidos.',
          detalhes: resultado.error.flatten().fieldErrors,
        });
      }

      const filtros = resultado.data;

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
        prisma.attendanceRecord.findMany({
          where,
          skip: (filtros.pagina - 1) * filtros.porPagina,
          take: filtros.porPagina,
          orderBy: { criadoEm: 'desc' },
          include: {
            escolaLocal: { select: { nome: true } },
            usuario: { select: { nomeCompleto: true } },
          },
        }),
        prisma.attendanceRecord.count({ where }),
      ]);

      return reply.status(200).send({
        dados: atendimentos.map((a: any) => ({
          id: a.id,
          especialidade: a.especialidade,
          turno: a.turno,
          resumo: a.resumo,
          procedimentos: a.procedimentos,
          insumosUtilizados: a.insumosUtilizados,
          encaminhamentoExterno: a.encaminhamentoExterno,
          escolaLocal: a.escolaLocal.nome,
          profissional: a.usuario.nomeCompleto,
          criadoEm: a.criadoEm,
        })),
        total,
        pagina: filtros.pagina,
        porPagina: filtros.porPagina,
        totalPaginas: Math.ceil(total / filtros.porPagina),
      });
    }
  );
}

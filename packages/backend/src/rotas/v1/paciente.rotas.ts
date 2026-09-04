import type { FastifyInstance } from 'fastify';
import { criarPacienteSchema } from '@sistema/shared';
import { prisma } from '../../infraestrutura/banco/prisma.js';
import {
  criptografarPii,
  descriptografarPii,
} from '../../infraestrutura/criptografia/crypto.js';
import { middlewareAutenticacao } from '../../middlewares/autenticacao.js';
import { autorizarPerfis } from '../../middlewares/autorizacao.js';
import { registrarAuditoria } from '../../middlewares/auditoria.js';

/**
 * Rotas de Pacientes — `/api/v1/pacientes`
 *
 * Todos os dados PII são criptografados antes da persistência (AES-256-GCM + envelope).
 * A descriptografia ocorre apenas no momento da leitura, sob autenticação e autorização.
 */
export async function rotasPaciente(fastify: FastifyInstance): Promise<void> {
  const preHandler = [
    middlewareAutenticacao,
    autorizarPerfis(['ADMIN', 'TRIAGEM_RECEPCAO', 'PROFISSIONAL_SAUDE']),
  ];

  /**
   * POST /pacientes
   * Cadastra um novo paciente com PII criptografada.
   */
  fastify.post(
    '/pacientes',
    { preHandler },
    async (request, reply) => {
      const resultado = criarPacienteSchema.safeParse(request.body);

      if (!resultado.success) {
        return reply.status(400).send({
          erro: 'Dados do paciente inválidos.',
          detalhes: resultado.error.flatten().fieldErrors,
        });
      }

      const dados = resultado.data;
      const kekHex = process.env['KEK_HEX']!;

      // Criptografar PII em bloco (um DEK para todos os campos PII do registro)
      const piiTextoPlano = JSON.stringify({
        nome: dados.nome,
        cpf: dados.cpf,
        dataNascimento: dados.dataNascimento,
        telefone: dados.telefone ?? null,
      });

      const piiCifrada = criptografarPii(piiTextoPlano, kekHex);

      // Calcular data de retenção
      const retencaoDias = parseInt(
        process.env['PATIENT_DATA_RETENTION_DAYS'] ?? '365',
        10
      );
      const retentionExpiresAt = new Date();
      retentionExpiresAt.setDate(retentionExpiresAt.getDate() + retencaoDias);

      const paciente = await prisma.patient.create({
        data: {
          nomeEnc: piiCifrada.dadosCifrados,
          cpfEnc: '', // CPF está dentro do bloco cifrado
          dataNascimentoEnc: '', // Data está dentro do bloco cifrado
          telefoneEnc: null,
          dekCifrada: piiCifrada.dekCifrada,
          ivPii: piiCifrada.iv,
          tagPii: piiCifrada.tag,
          turma: dados.turma,
          escolaLocalId: dados.escolaLocalId,
          retentionExpiresAt,
        },
      });

      await registrarAuditoria({
        userId: request.user.userId,
        acao: 'CREATE',
        entidade: 'Patient',
        entidadeId: paciente.id,
        diffPosterior: { turma: dados.turma, escolaLocalId: dados.escolaLocalId },
        ip: request.ip,
      });

      return reply.status(201).send({
        id: paciente.id,
        turma: paciente.turma,
        escolaLocalId: paciente.escolaLocalId,
        criadoEm: paciente.criadoEm,
      });
    }
  );

  /**
   * GET /pacientes
   * Lista pacientes com paginação. PII descriptografada na resposta.
   */
  fastify.get(
    '/pacientes',
    { preHandler },
    async (request, reply) => {
      const query = request.query as { pagina?: string; porPagina?: string };
      const pagina = Math.max(1, parseInt(query.pagina ?? '1', 10));
      const porPagina = Math.min(100, Math.max(1, parseInt(query.porPagina ?? '20', 10)));

      const [pacientes, total] = await Promise.all([
        prisma.patient.findMany({
          skip: (pagina - 1) * porPagina,
          take: porPagina,
          orderBy: { criadoEm: 'desc' },
          include: { escolaLocal: { select: { nome: true } } },
        }),
        prisma.patient.count(),
      ]);

      const kekHex = process.env['KEK_HEX']!;

      const pacientesDescriptografados = pacientes.map((p: any) => {
        try {
          const piiJson = descriptografarPii(
            p.nomeEnc,
            p.dekCifrada,
            p.ivPii,
            p.tagPii,
            kekHex
          );
          const pii = JSON.parse(piiJson) as {
            nome: string;
            cpf: string;
            dataNascimento: string;
            telefone: string | null;
          };

          return {
            id: p.id,
            nome: pii.nome,
            cpf: pii.cpf,
            dataNascimento: pii.dataNascimento,
            telefone: pii.telefone,
            turma: p.turma,
            escolaLocal: p.escolaLocal.nome,
            criadoEm: p.criadoEm,
          };
        } catch {
          return {
            id: p.id,
            nome: '[ERRO DE DESCRIPTOGRAFIA]',
            cpf: '***',
            dataNascimento: '***',
            telefone: null,
            turma: p.turma,
            escolaLocal: p.escolaLocal.nome,
            criadoEm: p.criadoEm,
          };
        }
      });

      return reply.status(200).send({
        dados: pacientesDescriptografados,
        total,
        pagina,
        porPagina,
        totalPaginas: Math.ceil(total / porPagina),
      });
    }
  );

  /**
   * GET /pacientes/:id
   * Busca um paciente por ID com PII descriptografada.
   */
  fastify.get(
    '/pacientes/:id',
    { preHandler },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const paciente = await prisma.patient.findUnique({
        where: { id },
        include: {
          escolaLocal: { select: { nome: true } },
          consentimentos: true,
        },
      });

      if (!paciente) {
        return reply.status(404).send({ erro: 'Paciente não encontrado.' });
      }

      const kekHex = process.env['KEK_HEX']!;

      try {
        const piiJson = descriptografarPii(
          paciente.nomeEnc,
          paciente.dekCifrada,
          paciente.ivPii,
          paciente.tagPii,
          kekHex
        );
        const pii = JSON.parse(piiJson) as {
          nome: string;
          cpf: string;
          dataNascimento: string;
          telefone: string | null;
        };

        return reply.status(200).send({
          id: paciente.id,
          nome: pii.nome,
          cpf: pii.cpf,
          dataNascimento: pii.dataNascimento,
          telefone: pii.telefone,
          turma: paciente.turma,
          escolaLocal: paciente.escolaLocal.nome,
          consentimentos: paciente.consentimentos,
          criadoEm: paciente.criadoEm,
        });
      } catch {
        return reply.status(500).send({
          erro: 'Erro ao descriptografar dados do paciente.',
        });
      }
    }
  );
}

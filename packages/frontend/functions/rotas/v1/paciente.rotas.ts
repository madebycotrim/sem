import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { criarPacienteSchema } from '../../../compartilhado/index.js';
import { getPrisma } from '../../infraestrutura/banco/prisma.js';
import {
  criptografarPii,
  descriptografarPii,
} from '../../infraestrutura/criptografia/crypto.js';
import { middlewareAutenticacao, type AppVariables } from '../../middlewares/autenticacao.js';
import { autorizarPerfis } from '../../middlewares/autorizacao.js';
import { registrarAuditoria } from '../../middlewares/auditoria.js';
import type { Bindings } from '../../config/env.js';

export const rotasPaciente = new Hono<{ Bindings: Bindings; Variables: AppVariables }>();

// Proteção global do grupo de rotas de pacientes
rotasPaciente.use('*', middlewareAutenticacao);
rotasPaciente.use(
  '*',
  autorizarPerfis(['ADMIN', 'TRIAGEM_RECEPCAO', 'PROFISSIONAL_SAUDE'])
);

/**
 * POST /pacientes
 * Cadastra um novo paciente com dados PII criptografados (AES-256-GCM Envelope).
 */
rotasPaciente.post('/', zValidator('json', criarPacienteSchema), async (c) => {
  const dados = c.req.valid('json');
  const usuario = c.get('usuario');
  const prisma = getPrisma(c.env.DB);
  const kekHex = c.env.KEK_HEX;

  const piiTextoPlano = JSON.stringify({
    nome: dados.nome,
    cpf: dados.cpf,
    dataNascimento: dados.dataNascimento,
    telefone: dados.telefone ?? null,
  });

  const piiCifrada = await criptografarPii(piiTextoPlano, kekHex);

  const retencaoDias = Number(c.env.PATIENT_DATA_RETENTION_DAYS ?? 365);
  const retencaoExpiraEm = new Date();
  retencaoExpiraEm.setDate(retencaoExpiraEm.getDate() + retencaoDias);

  const paciente = await prisma.paciente.create({
    data: {
      nomeEnc: piiCifrada.dadosCifrados,
      cpfEnc: '',
      dataNascimentoEnc: '',
      telefoneEnc: null,
      dekCifrada: piiCifrada.dekCifrada,
      ivPii: piiCifrada.iv,
      tagPii: piiCifrada.tag,
      turma: dados.turma,
      escolaLocalId: dados.escolaLocalId,
      retencaoExpiraEm,
    },
  });

  const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1';

  await registrarAuditoria(prisma, {
    userId: usuario.userId,
    acao: 'CREATE',
    entidade: 'Paciente',
    entidadeId: paciente.id,
    diffPosterior: { turma: dados.turma, escolaLocalId: dados.escolaLocalId },
    ip,
  });

  return c.json(
    {
      id: paciente.id,
      turma: paciente.turma,
      escolaLocalId: paciente.escolaLocalId,
      criadoEm: paciente.criadoEm,
    },
    201
  );
});

/**
 * GET /pacientes
 * Lista pacientes com paginação e descriptografia segura na borda.
 */
rotasPaciente.get('/', async (c) => {
  const prisma = getPrisma(c.env.DB);
  const query = c.req.query();
  const pagina = Math.max(1, parseInt(query['pagina'] ?? '1', 10));
  const porPagina = Math.min(100, Math.max(1, parseInt(query['porPagina'] ?? '20', 10)));

  const [pacientes, total] = await Promise.all([
    prisma.paciente.findMany({
      skip: (pagina - 1) * porPagina,
      take: porPagina,
      orderBy: { criadoEm: 'desc' },
      include: { escolaLocal: { select: { nome: true } } },
    }),
    prisma.paciente.count(),
  ]);

  const kekHex = c.env.KEK_HEX;

  const pacientesDescriptografados = await Promise.all(
    pacientes.map(async (p: {
      id: string;
      nomeEnc: string;
      dekCifrada: string;
      ivPii: string;
      tagPii: string;
      turma: string;
      escolaLocal: { nome: string };
      criadoEm: Date;
    }) => {
      try {
        const piiJson = await descriptografarPii(
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
    })
  );

  return c.json({
    dados: pacientesDescriptografados,
    total,
    pagina,
    porPagina,
    totalPaginas: Math.ceil(total / porPagina),
  });
});

/**
 * GET /pacientes/:id
 * Busca um paciente por ID com PII descriptografada.
 */
rotasPaciente.get('/:id', async (c) => {
  const id = c.req.param('id');
  const prisma = getPrisma(c.env.DB);

  const paciente = await prisma.paciente.findUnique({
    where: { id },
    include: {
      escolaLocal: { select: { nome: true } },
      consentimentos: true,
    },
  });

  if (!paciente) {
    return c.json({ erro: 'Paciente não encontrado.' }, 404);
  }

  const kekHex = c.env.KEK_HEX;

  try {
    const piiJson = await descriptografarPii(
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

    return c.json({
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
    return c.json({ erro: 'Erro ao descriptografar dados do paciente.' }, 500);
  }
});

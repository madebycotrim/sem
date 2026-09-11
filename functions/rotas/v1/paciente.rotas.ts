import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { criarPacienteSchema, atualizarPacienteSchema } from '../../../compartilhado/index.js';
import { getDb, type AppDatabase } from '../../infraestrutura/banco/drizzle.js';
import { pacientes, escolasLocais, consentimentos } from '../../infraestrutura/banco/schema.js';
import { eq, and, desc, count } from 'drizzle-orm';
import {
  criptografarPii,
  descriptografarPii,
} from '../../infraestrutura/criptografia/crypto.js';
import { middlewareAutenticacao, type AppVariables } from '../../middlewares/autenticacao.js';
import { autorizarPerfis, autorizarAcao } from '../../middlewares/autorizacao.js';
import { registrarAuditoria } from '../../middlewares/auditoria.js';
import type { Bindings } from '../../config/env.js';

export const rotasPaciente = new Hono<{ Bindings: Bindings; Variables: AppVariables }>();

const normalizarCpf = (valor?: string | null) => (valor ?? '').replace(/\D/g, '').slice(0, 11);

const verificarCpfDuplicado = async (
  db: AppDatabase,
  cpf: string,
  kekHex: string,
  ignorarPacienteId?: string
) => {
  const cpfNormalizado = normalizarCpf(cpf);

  const pacientesList = await db.query.pacientes.findMany({
    where: eq(pacientes.ativo, true),
    columns: { id: true, nomeEnc: true, dekCifrada: true, ivPii: true, tagPii: true },
  });

  for (const paciente of pacientesList) {
    if (ignorarPacienteId && paciente.id === ignorarPacienteId) continue;

    try {
      const pii = JSON.parse(
        await descriptografarPii(
          paciente.nomeEnc,
          paciente.dekCifrada,
          paciente.ivPii,
          paciente.tagPii,
          kekHex
        )
      ) as { cpf?: string };

      if (normalizarCpf(pii.cpf) === cpfNormalizado && cpfNormalizado.length === 11) {
        return true;
      }
    } catch {
      // registro ilegível: ignora para não bloquear indevidamente um cadastro válido
    }
  }

  return false;
};

// Proteção global do grupo de rotas de pacientes
rotasPaciente.use('*', middlewareAutenticacao);
rotasPaciente.use(
  '*',
  autorizarPerfis(['BOOTSTRAP', 'ADMIN', 'TRIAGEM_RECEPCAO', 'PROFISSIONAL_SAUDE'])
);

/**
 * POST /pacientes
 * Cadastra um novo paciente com dados PII criptografados (AES-256-GCM Envelope).
 */
rotasPaciente.post('/', autorizarAcao('criarPaciente'), zValidator('json', criarPacienteSchema), async (c) => {
  const dados = c.req.valid('json');
  const usuario = c.get('usuario');
  const db = getDb(c.env.DB);
  const kekHex = c.env.KEK_HEX;
  const cpfNormalizado = normalizarCpf(dados.cpf);

  const escola = await db.query.escolasLocais.findFirst({
    where: and(eq(escolasLocais.id, dados.escolaLocalId), eq(escolasLocais.ativo, true)),
  });
  if (!escola) {
    return c.json({ erro: 'A instituição selecionada não está ativa.' }, 422);
  }

  if (cpfNormalizado.length === 11) {
    const cpfDuplicado = await verificarCpfDuplicado(db, cpfNormalizado, kekHex);
    if (cpfDuplicado) {
      return c.json({ erro: 'Já existe um paciente cadastrado com este CPF.' }, 409);
    }
  }

  const piiTextoPlano = JSON.stringify({
    nome: dados.nome,
    cpf: dados.cpf,
    dataNascimento: dados.dataNascimento,
    telefone: dados.telefone ?? null,
    sexo: dados.sexo ?? null,
  });

  const piiCifrada = await criptografarPii(piiTextoPlano, kekHex);

  const retencaoDias = Number(c.env.PATIENT_DATA_RETENTION_DAYS ?? 365);
  const retencaoExpiraEm = new Date();
  retencaoExpiraEm.setDate(retencaoExpiraEm.getDate() + retencaoDias);

  const [paciente] = await db.insert(pacientes).values({
    nomeEnc: piiCifrada.dadosCifrados,
    cpfEnc: '',
    dataNascimentoEnc: '',
    telefoneEnc: null,
    dekCifrada: piiCifrada.dekCifrada,
    ivPii: piiCifrada.iv,
    tagPii: piiCifrada.tag,
    turma: dados.turma,
    escolaLocalId: dados.escolaLocalId,
    retencaoExpiraEm: retencaoExpiraEm.toISOString(),
  }).returning();

  const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1';

  await registrarAuditoria(db, {
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
  const db = getDb(c.env.DB);
  const query = c.req.query();
  const pagina = Math.max(1, parseInt(query['pagina'] ?? '1', 10));
  const porPagina = Math.min(100, Math.max(1, parseInt(query['porPagina'] ?? '20', 10)));

  const [pacientesList, totalResult] = await Promise.all([
    db.query.pacientes.findMany({
      offset: (pagina - 1) * porPagina,
      limit: porPagina,
      where: eq(pacientes.ativo, true),
      orderBy: [desc(pacientes.criadoEm)],
      with: {
        escolaLocal: { columns: { nome: true } },
        consentimentos: {
          orderBy: [desc(consentimentos.criadoEm)],
          limit: 1,
        },
        atendimentos: {
          columns: { id: true },
        },
      },
    }),
    db.select({ total: count() }).from(pacientes).where(eq(pacientes.ativo, true)),
  ]);

  const total = totalResult[0]?.total ?? 0;
  const kekHex = c.env.KEK_HEX;

  const pacientesDescriptografados = await Promise.all(
    pacientesList.map(async (p) => {
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
          sexo?: string | null;
        };

        return {
          id: p.id,
          nome: pii.nome,
          cpf: pii.cpf,
          dataNascimento: pii.dataNascimento,
          telefone: null,
          sexo: pii.sexo ?? undefined,
          turma: p.turma,
          escolaLocal: p.escolaLocal?.nome ?? 'Desconhecida',
          atendimentosCount: p.atendimentos?.length ?? 0,
          termoConsentimentoStatus: (p.consentimentos[0]?.dataConsentimento && !p.consentimentos[0]?.consentimentoDispensado)
            ? 'ACEITO'
            : 'PENDENTE',
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
          escolaLocal: p.escolaLocal?.nome ?? 'Desconhecida',
          atendimentosCount: p.atendimentos?.length ?? 0,
          termoConsentimentoStatus: 'PENDENTE',
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
 * PATCH /pacientes/:id
 * Atualiza dados cadastrais sem expor ou duplicar campos PII em texto plano.
 */
rotasPaciente.patch('/:id', autorizarAcao('editarPaciente'), zValidator('json', atualizarPacienteSchema), async (c) => {
  const id = c.req.param('id');
  const dados = c.req.valid('json');
  const usuario = c.get('usuario');
  const db = getDb(c.env.DB);
  const existente = await db.query.pacientes.findFirst({ where: and(eq(pacientes.id, id), eq(pacientes.ativo, true)) });
  if (!existente) return c.json({ erro: 'Paciente não encontrado.' }, 404);

  if (dados.escolaLocalId) {
    const escola = await db.query.escolasLocais.findFirst({
      where: and(eq(escolasLocais.id, dados.escolaLocalId), eq(escolasLocais.ativo, true)),
    });
    if (!escola) return c.json({ erro: 'A instituição selecionada não está ativa.' }, 422);
  }

  let piiAtual: { nome: string; cpf: string; dataNascimento: string; telefone: string | null; sexo?: string | null };
  try {
    piiAtual = JSON.parse(await descriptografarPii(existente.nomeEnc, existente.dekCifrada, existente.ivPii, existente.tagPii, c.env.KEK_HEX));
  } catch {
    return c.json({ erro: 'Não foi possível atualizar os dados protegidos do paciente.' }, 500);
  }

  const cpfNovo = normalizarCpf(dados.cpf ?? piiAtual.cpf);
  if (cpfNovo.length === 11) {
    const cpfDuplicado = await verificarCpfDuplicado(db, cpfNovo, c.env.KEK_HEX, id);
    if (cpfDuplicado) {
      return c.json({ erro: 'Já existe outro paciente cadastrado com este CPF.' }, 409);
    }
  }

  const piiCifrada = await criptografarPii(JSON.stringify({
    nome: dados.nome ?? piiAtual.nome,
    cpf: dados.cpf ?? piiAtual.cpf,
    dataNascimento: dados.dataNascimento ?? piiAtual.dataNascimento,
    telefone: dados.telefone ?? piiAtual.telefone,
    sexo: dados.sexo ?? piiAtual.sexo ?? null,
  }), c.env.KEK_HEX);

  const [atualizado] = await db.update(pacientes).set({
    nomeEnc: piiCifrada.dadosCifrados,
    dekCifrada: piiCifrada.dekCifrada,
    ivPii: piiCifrada.iv,
    tagPii: piiCifrada.tag,
    turma: dados.turma ?? existente.turma,
    escolaLocalId: dados.escolaLocalId ?? existente.escolaLocalId,
    atualizadoEm: new Date().toISOString(),
  }).where(eq(pacientes.id, id)).returning();

  await registrarAuditoria(db, {
    userId: usuario.userId, acao: 'UPDATE', entidade: 'Paciente', entidadeId: id,
    diffAnterior: { turma: existente.turma, escolaLocalId: existente.escolaLocalId },
    diffPosterior: { turma: atualizado.turma, escolaLocalId: atualizado.escolaLocalId },
    ip: c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1',
  });

  return c.json({ id: atualizado.id, atualizadoEm: atualizado.atualizadoEm });
});

/** Arquiva, sem apagar o prontuário ou o histórico clínico. */
rotasPaciente.post('/:id/arquivar', autorizarAcao('arquivarPaciente'), async (c) => {
  const usuario = c.get('usuario');
  const db = getDb(c.env.DB);
  const id = c.req.param('id');
  const existente = await db.query.pacientes.findFirst({ where: and(eq(pacientes.id, id), eq(pacientes.ativo, true)) });
  if (!existente) return c.json({ erro: 'Paciente não encontrado.' }, 404);

  await db.update(pacientes).set({ ativo: false, atualizadoEm: new Date().toISOString() }).where(eq(pacientes.id, id));

  await registrarAuditoria(db, {
    userId: usuario.userId, acao: 'ARCHIVE', entidade: 'Paciente', entidadeId: id,
    diffAnterior: { ativo: true }, diffPosterior: { ativo: false },
    ip: c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1',
  });
  return c.json({ id, arquivado: true });
});

/**
 * GET /pacientes/:id
 * Busca um paciente por ID com PII descriptografada.
 */
rotasPaciente.get('/:id', async (c) => {
  const id = c.req.param('id');
  const db = getDb(c.env.DB);

  const paciente = await db.query.pacientes.findFirst({
    where: and(eq(pacientes.id, id), eq(pacientes.ativo, true)),
    with: {
      escolaLocal: { columns: { nome: true } },
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
      sexo?: string | null;
    };

    return c.json({ dados: {
        id: paciente.id,
        nome: pii.nome,
        cpf: pii.cpf,
        dataNascimento: pii.dataNascimento,
        telefone: pii.telefone,
        sexo: pii.sexo ?? undefined,
        turma: paciente.turma,
        escolaLocal: paciente.escolaLocal?.nome ?? 'Desconhecida',
        consentimentos: paciente.consentimentos,
        criadoEm: paciente.criadoEm,
      } });
  } catch {
    return c.json({ erro: 'Erro ao descriptografar dados do paciente.' }, 500);
  }
});

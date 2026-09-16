import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import {
  fichaAtendimentoSchema,
  filtroAtendimentoSchema,
  Especialidade,
  StatusAtendimento,
} from '../../../compartilhado/index.js';
import { getDb } from '../../infraestrutura/banco/drizzle.js';
import { atendimentos, pacientes, escolasLocais, usuarios, consentimentos } from '../../infraestrutura/banco/schema.js';
import { eq, and, desc, asc, count, gte, lte, sql } from 'drizzle-orm';
import { middlewareAutenticacao, type AppVariables } from '../../middlewares/autenticacao.js';
import { autorizarPerfis } from '../../middlewares/autorizacao.js';
import { middlewareIdempotencia } from '../../middlewares/idempotencia.js';
import { registrarAuditoria } from '../../middlewares/auditoria.js';
import { descriptografarPii } from '../../infraestrutura/criptografia/crypto.js';
import type { Bindings } from '../../config/env.js';
import { sanitizarTexto, sanitizarTextoOpcional } from '../../infraestrutura/sanitizacao.js';

export const rotasAtendimento = new Hono<{ Bindings: Bindings; Variables: AppVariables }>();

function mascararCpf(cpf?: string | null): string {
  if (!cpf) return 'Não informado';
  const limpo = cpf.replace(/\D/g, '');
  if (limpo.length !== 11) return cpf;
  return `${limpo.slice(0, 3)}.***.***-${limpo.slice(9, 11)}`;
}

const filtroRelatorioSchema = z.object({
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  escolaLocalId: z.string().uuid().optional(),
  especialidade: z.nativeEnum(Especialidade).optional(),
  status: z.nativeEnum(StatusAtendimento).optional(),
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

    // Prioriza o profissional selecionado na triagem; senão, só o próprio usuário se for profissional ativo
    const profissionalIdCandidato = dados.usuarioId ?? usuario.userId;

    const [paciente, escola, profissional] = await Promise.all([
      db.query.pacientes.findFirst({
        where: eq(pacientes.id, dados.pacienteId),
        columns: { id: true },
      }),
      db.query.escolasLocais.findFirst({
        where: eq(escolasLocais.id, dados.escolaLocalId),
        columns: { id: true },
      }),
      db.query.usuarios.findFirst({
        where: eq(usuarios.id, profissionalIdCandidato),
        columns: { id: true, perfil: true, ativo: true },
      }),
    ]);

    if (!paciente) {
      return c.json({ erro: 'Paciente não encontrado.' }, 404);
    }
    if (!escola) {
      return c.json({ erro: 'Escola/local de atendimento não encontrado.' }, 404);
    }
    if (!profissional) {
      return c.json({ erro: 'Profissional de saúde não encontrado.' }, 404);
    }

    const profissionalValido =
      profissional.perfil === 'PROFISSIONAL_SAUDE' && profissional.ativo === true;

    if (!profissionalValido) {
      if (!dados.usuarioId) {
        return c.json(
          { erro: 'Informe o profissional de saúde responsável pelo atendimento (usuarioId).' },
          400
        );
      }
      return c.json(
        { erro: 'O usuário informado não é um profissional de saúde ativo.' },
        400
      );
    }

    const profissionalId = profissional.id;

    // Regra estrita: um paciente/CPF não pode ter mais de uma consulta na mesma especialidade
    const consultaExistente = await db.query.atendimentos.findFirst({
      where: and(
        eq(atendimentos.pacienteId, dados.pacienteId),
        eq(atendimentos.especialidade, dados.especialidade)
      ),
      columns: { id: true, status: true, resumo: true, especialidade: true },
    });

    const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1';
    const entradaFilaEm = new Date().toISOString();

    // Se a consulta já existir para esta especialidade e paciente
    if (consultaExistente) {
      // Se a consulta já estiver CONCLUÍDA, bloqueia nova inserção duplicada
      if (consultaExistente.status === 'CONCLUIDO') {
        return c.json(
          {
            erro: `O paciente já possui uma consulta concluída na especialidade ${dados.especialidade}. Não é permitido cadastrar mais de uma consulta na mesma especialidade para o mesmo CPF/aluno.`,
            consultaExistenteId: consultaExistente.id,
          },
          409
        );
      }

      // Se estiver em andamento/agendada, atualiza a consulta existente preservando seu ID único
      const [atendimentoAtualizado] = await db
        .update(atendimentos)
        .set({
          usuarioId: profissionalId,
          resumo: sanitizarTexto(dados.resumo),
          procedimentos: sanitizarTextoOpcional(dados.procedimentos),
          status: dados.status,
          entradaFilaEm,
          atualizadoEm: new Date().toISOString(),
        })
        .where(eq(atendimentos.id, consultaExistente.id))
        .returning();

      await registrarAuditoria(db, {
        userId: usuario.userId,
        acao: 'UPDATE',
        entidade: 'Atendimento',
        entidadeId: consultaExistente.id,
        diffAnterior: { resumo: consultaExistente.resumo },
        diffPosterior: {
          resumo: dados.resumo,
          especialidade: dados.especialidade,
          usuarioId: profissionalId,
        },
        ip,
      });

      return c.json(
        {
          id: atendimentoAtualizado.id,
          idempotencyKey: atendimentoAtualizado.chaveIdempotencia,
          especialidade: atendimentoAtualizado.especialidade,
          status: atendimentoAtualizado.status,
          resumo: atendimentoAtualizado.resumo,
          criadoEm: atendimentoAtualizado.criadoEm,
          atualizadoEm: atendimentoAtualizado.atualizadoEm,
        },
        200
      );
    }

    const novoAtendimentoId = crypto.randomUUID();
    let atendimento;
    try {
      const agoraIso = new Date().toISOString();
      const [novoAtendimento] = await db.insert(atendimentos).values({
        id: novoAtendimentoId,
        pacienteId: dados.pacienteId,
        escolaLocalId: dados.escolaLocalId,
        usuarioId: profissionalId,
        especialidade: dados.especialidade,
        status: dados.status,
        resumo: sanitizarTexto(dados.resumo),
        procedimentos: sanitizarTextoOpcional(dados.procedimentos),
        chaveIdempotencia: dados.idempotencyKey || `atend:${novoAtendimentoId}`,
        entradaFilaEm,
        criadoEm: agoraIso,
        atualizadoEm: agoraIso,
      }).returning();
      atendimento = novoAtendimento;
    } catch (erro) {
      if (String(erro).toLowerCase().includes('unique')) {
        return c.json(
          {
            erro: `Já existe uma consulta registrada para este paciente na especialidade ${dados.especialidade}. Não é permitido mais de uma consulta na mesma especialidade para o mesmo CPF/aluno.`,
          },
          409
        );
      }
      throw erro;
    }

    await registrarAuditoria(db, {
      userId: usuario.userId,
      acao: 'CREATE',
      entidade: 'Atendimento',
      entidadeId: atendimento.id,
      diffPosterior: {
        especialidade: dados.especialidade,
        pacienteId: dados.pacienteId,
        usuarioId: profissionalId,
      },
      ip,
    });

    return c.json(
      {
        id: atendimento.id,
        idempotencyKey: atendimento.chaveIdempotencia,
        especialidade: atendimento.especialidade,
        status: atendimento.status,
        resumo: atendimento.resumo,
        criadoEm: atendimento.criadoEm,
      },
      201
    );
  }
);

const atualizarAtendimentoSchema = z.object({
  resumo: z.string().min(1, 'Resumo não pode ser vazio').max(5000).trim().optional(),
  procedimentos: z.string().max(5000).trim().optional().nullable(),
  status: z.enum(Object.values(StatusAtendimento) as [string, ...string[]]).optional(),
  /** Permite corrigir o profissional responsável (ex.: registros criados pela triagem) */
  usuarioId: z.string().uuid('ID do profissional deve ser um UUID válido').optional(),
});

/**
 * PATCH /atendimentos/:id
 * Atualiza campos do atendimento (resumo/prontuário, procedimentos, status, profissional).
 */
rotasAtendimento.patch('/:id', zValidator('json', atualizarAtendimentoSchema), async (c) => {
  const db = getDb(c.env.DB);
  const id = c.req.param('id');
  const dados = c.req.valid('json');
  const usuario = c.get('usuario');

  const atendimentoExistente = await db.query.atendimentos.findFirst({
    where: eq(atendimentos.id, id),
  });

  if (!atendimentoExistente) {
    return c.json({ erro: 'Atendimento não encontrado.' }, 404);
  }

  const camposParaAtualizar: Record<string, unknown> = {
    atualizadoEm: new Date().toISOString(),
  };

  if (dados.resumo !== undefined) camposParaAtualizar.resumo = sanitizarTexto(dados.resumo);
  if (dados.procedimentos !== undefined) camposParaAtualizar.procedimentos = sanitizarTextoOpcional(dados.procedimentos);
  if (dados.status !== undefined) camposParaAtualizar.status = dados.status;
  if (dados.status === StatusAtendimento.AGENDADO || dados.status === StatusAtendimento.CONFIRMADO) {
    camposParaAtualizar.entradaFilaEm = new Date().toISOString();
  }

  if (dados.usuarioId !== undefined) {
    const profissional = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, dados.usuarioId),
      columns: { id: true, perfil: true, ativo: true },
    });

    if (!profissional) {
      return c.json({ erro: 'Profissional de saúde não encontrado.' }, 404);
    }
    if (profissional.perfil !== 'PROFISSIONAL_SAUDE' || profissional.ativo !== true) {
      return c.json(
        { erro: 'O usuário informado não é um profissional de saúde ativo.' },
        400
      );
    }

    camposParaAtualizar.usuarioId = profissional.id;
  }

  const [atendimentoAtualizado] = await db
    .update(atendimentos)
    .set(camposParaAtualizar)
    .where(eq(atendimentos.id, id))
    .returning();

  const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1';
  await registrarAuditoria(db, {
    userId: usuario.userId,
    acao: 'UPDATE',
    entidade: 'Atendimento',
    entidadeId: id,
    diffAnterior: {
      status: atendimentoExistente.status,
      resumo: atendimentoExistente.resumo,
    },
    diffPosterior: camposParaAtualizar,
    ip,
  });

  return c.json(atendimentoAtualizado, 200);
});

const atualizarStatusSchema = z.object({
  status: z.enum(Object.values(StatusAtendimento) as [string, ...string[]]),
});

rotasAtendimento.patch('/:id/status', zValidator('json', atualizarStatusSchema), async (c) => {
  const db = getDb(c.env.DB);
  const usuario = c.get('usuario');
  const id = c.req.param('id');
  const { status } = c.req.valid('json');
  const existente = await db.query.atendimentos.findFirst({
    where: eq(atendimentos.id, id),
    columns: { status: true },
  });
  if (!existente) {
    return c.json({ erro: 'Atendimento não encontrado.' }, 404);
  }
  const agora = new Date().toISOString();
  const [atendimento] = await db
    .update(atendimentos)
    .set({
      status,
      atualizadoEm: agora,
      ...(status === StatusAtendimento.AGENDADO || status === StatusAtendimento.CONFIRMADO
        ? { entradaFilaEm: agora }
        : {}),
    })
    .where(eq(atendimentos.id, id))
    .returning({ id: atendimentos.id, status: atendimentos.status, atualizadoEm: atendimentos.atualizadoEm });

  await registrarAuditoria(db, {
    userId: usuario.userId,
    acao: 'UPDATE',
    entidade: 'Atendimento',
    entidadeId: id,
    diffAnterior: { status: existente.status },
    diffPosterior: { status },
    ip: c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1',
  });

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
    columns: { id: true, nomeCompleto: true, especialidade: true, registroProfissional: true, conselhoProfissional: true },
    orderBy: [asc(usuarios.nomeCompleto)],
  });

  return c.json({
    dados: profissionais.map((profissional) => ({
      id: profissional.id,
      nome: profissional.nomeCompleto,
      especialidade: profissional.especialidade,
      registro: profissional.registroProfissional,
      conselho: profissional.conselhoProfissional,
    })),
  });
});

/**
 * GET /atendimentos/analitico
 * Retorna todos os atendimentos para o Painel BI & Inteligência Clínica sem truncamento de paginação.
 * Respeita LGPD e otimiza a performance: extrai dados operacionais, relacionamentos e timestamps
 * sem a sobrecarga de descriptografia AES-GCM em massa.
 */
rotasAtendimento.get('/analitico', async (c) => {
  const db = getDb(c.env.DB);

  const [listaAtendimentos, totalPacientesRes, totalPendentesRes] = await Promise.all([
    db.query.atendimentos.findMany({
      columns: {
        id: true,
        especialidade: true,
        status: true,
        criadoEm: true,
        entradaFilaEm: true,
        pacienteId: true,
      },
      with: {
        escolaLocal: { columns: { id: true, nome: true } },
        usuario: { columns: { id: true, nomeCompleto: true } },
      },
      orderBy: [desc(atendimentos.criadoEm)],
    }),
    db.select({ total: count() }).from(pacientes).where(eq(pacientes.ativo, true)),
    db.select({ total: count() }).from(pacientes).where(
      and(
        eq(pacientes.ativo, true),
        sql`${pacientes.id} NOT IN (SELECT ${consentimentos.pacienteId} FROM ${consentimentos} WHERE ${consentimentos.dataConsentimento} IS NOT NULL AND (${consentimentos.consentimentoDispensado} IS NULL OR ${consentimentos.consentimentoDispensado} = 0))`
      )
    ),
  ]);

  const dados = listaAtendimentos.map((a) => ({
    id: a.id,
    pacienteId: a.pacienteId,
    pacienteNome: 'Paciente',
    especialidade: a.especialidade,
    status: a.status || 'CONCLUIDO',
    criadoEm: a.criadoEm,
    entradaFilaEm: a.entradaFilaEm ?? a.criadoEm,
    escolaNome: a.escolaLocal?.nome || 'Não informada',
    profissionalNome: a.usuario?.nomeCompleto || 'Profissional de Saúde',
  }));

  return c.json({
    dados,
    total: dados.length,
    totalPacientes: totalPacientesRes[0]?.total ?? 0,
    totalConsentimentosPendentes: totalPendentesRes[0]?.total ?? 0,
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
  if (filtros.status) condicoes.push(eq(atendimentos.status, filtros.status));
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
      pacienteId: true,
      especialidade: true,
      status: true,
      criadoEm: true,
    },
    with: {
      escolaLocal: { columns: { id: true, nome: true } },
      usuario: { columns: { id: true, nomeCompleto: true } },
    },
    orderBy: [desc(atendimentos.criadoEm)],
  });

  const porEspecialidade = new Map<string, { total: number }>();
  const porEscola = new Map<string, { id: string; nome: string; total: number }>();
  const porProfissional = new Map<string, { id: string; nome: string; total: number }>();
  const porStatus: Record<string, number> = {};
  const pacientesUnicosSet = new Set<string>();

  for (const atendimento of listaAtendimentos) {
    if (atendimento.pacienteId) {
      pacientesUnicosSet.add(atendimento.pacienteId);
    }

    const st = atendimento.status || 'CONCLUIDO';
    porStatus[st] = (porStatus[st] ?? 0) + 1;

    const especialidade = porEspecialidade.get(atendimento.especialidade) ?? { total: 0 };
    especialidade.total += 1;
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

  const total = listaAtendimentos.length;

  const serie = listaAtendimentos.reduce((acc: Record<string, number>, atendimento) => {
    const dia = (atendimento.criadoEm ?? '').slice(0, 10);
    if (dia) acc[dia] = (acc[dia] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const diasComAtendimento = Object.keys(serie).length;
  const mediaDiaria = diasComAtendimento > 0 ? Math.round((total / diasComAtendimento) * 10) / 10 : 0;

  let picoAtendimento: { data: string; total: number } | null = null;
  for (const [data, qtd] of Object.entries(serie)) {
    if (!picoAtendimento || qtd > picoAtendimento.total) {
      picoAtendimento = { data, total: qtd };
    }
  }

  return c.json({
    total,
    pacientesUnicos: pacientesUnicosSet.size,
    mediaDiaria,
    picoAtendimento,
    porStatus,
    porEspecialidade: Array.from(porEspecialidade, ([especialidade, valores]) => ({ especialidade, ...valores }))
      .sort((a, b) => b.total - a.total),
    porEscola: Array.from(porEscola.values()).sort((a, b) => b.total - a.total),
    porProfissional: Array.from(porProfissional.values()).sort((a, b) => b.total - a.total),
    serie,
  });
});

const sinteseIaSchema = z.object({
  totalGeral: z.number().int().nonnegative(),
  estudantesUnicos: z.number().int().nonnegative().optional(),
  pacientesUnicos: z.number().int().nonnegative().optional(),
  mediaDiaria: z.number().nonnegative(),
  pico: z.object({ data: z.string(), total: z.number() }).nullable().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  porEspecialidade: z.array(z.object({
    especialidade: z.string(),
    total: z.number(),
    pct: z.number().optional(),
  })),
  porEscola: z.array(z.object({
    nome: z.string(),
    total: z.number(),
  })).optional(),
  porProfissional: z.array(z.object({
    nome: z.string(),
    total: z.number(),
  })).optional(),
  porStatus: z.record(z.string(), z.number()).optional(),
  filtrosAtivos: z.object({
    escola: z.string().optional(),
    especialidade: z.string().optional(),
    profissional: z.string().optional(),
    status: z.string().optional(),
    periodo: z.string().optional(),
  }).optional(),
});

/**
 * POST /atendimentos/relatorio/sintese-ia
 * Gera Relatório Analítico Executivo e Operacional via Cloudflare Workers AI ou Fallback Local.
 * Respeita LGPD: recebe estritamente agregados estatísticos dos dados filtrados, SEM PII de alunos.
 * Zero frases motivacionais ou clichês — foco estrito em métricas, distribuição e status operacional.
 */
rotasAtendimento.post('/relatorio/sintese-ia', zValidator('json', sinteseIaSchema), async (c) => {
  const dados = c.req.valid('json');
  const qtdEstudantes = dados.estudantesUnicos ?? dados.pacientesUnicos ?? dados.totalGeral;

  // Função auxiliar de Fallback Algorítmico Local (Técnico, completo, analítico e sem clichês motivacionais)
  const gerarFallbackLocal = () => {
    if (dados.totalGeral === 0) {
      return {
        origem: 'ALGORITMO_LOCAL' as const,
        titulo: 'Relatório Analítico de Atendimentos Filtrados',
        resumo: 'Nenhum atendimento foi localizado para os parâmetros e filtros selecionados. Não há registros de consultas, especialidades ou unidades escolares a reportar no recorte atual.',
        pontos: [
          'Volume Geral: 0 atendimentos e 0 estudantes computados no recorte.',
          'Especialidades: Sem demanda registrada para os parâmetros atuais.',
          'Unidades Escolares: Nenhuma instituição com atendimentos registrados.',
          'Situação Operacional: Sem ocorrências de agendamento, realização ou cancelamento.',
        ],
        recomendacao: 'Ajuste os parâmetros de filtro (intervalo de datas, escola ou especialidade) para consultar outros períodos da operação.',
      };
    }

    // Ordenações analíticas
    const especialidadesOrdenadas = [...dados.porEspecialidade].sort((a, b) => b.total - a.total);
    const escolasOrdenadas = [...(dados.porEscola || [])].sort((a, b) => b.total - a.total);
    const profissionaisOrdenados = [...(dados.porProfissional || [])].sort((a, b) => b.total - a.total);

    const topEsp = especialidadesOrdenadas[0];
    const topEspNome = topEsp?.especialidade ?? 'Clínica Geral';
    const topEspTotal = topEsp?.total ?? 0;
    const topEspPct = topEsp && dados.totalGeral > 0 ? Math.round((topEspTotal / dados.totalGeral) * 100) : 0;

    const topEscolaItem = escolasOrdenadas[0];
    const topEscola = topEscolaItem?.nome ?? 'unidade escolar não identificada';
    const topEscolaTotal = topEscolaItem?.total ?? 0;
    const topEscolaPct = topEscolaItem && dados.totalGeral > 0 ? Math.round((topEscolaTotal / dados.totalGeral) * 100) : 0;
    const totalEscolasAtendidas = escolasOrdenadas.length;

    // Status operacionais
    const stMap = dados.porStatus ?? {};
    const totalConcluidos = stMap['CONCLUIDO'] ?? 0;
    const totalAgendados = stMap['AGENDADO'] ?? 0;
    const totalConfirmados = stMap['CONFIRMADO'] ?? 0;
    const totalEmAtendimento = stMap['EM_ATENDIMENTO'] ?? 0;
    const totalCancelados = stMap['CANCELADO'] ?? 0;
    const totalFaltas = stMap['FALTOU'] ?? 0;
    const taxaConclusao = dados.totalGeral > 0 ? Math.round((totalConcluidos / dados.totalGeral) * 100) : 0;

    // Concordâncias gramaticais precisas
    const textoAtendimentos = dados.totalGeral === 1 ? '1 atendimento' : `${dados.totalGeral.toLocaleString('pt-BR')} atendimentos`;
    const textoEstudantes = qtdEstudantes === 1 ? '1 estudante' : `${qtdEstudantes.toLocaleString('pt-BR')} estudantes distintos`;
    const textoEscolas = totalEscolasAtendidas === 1 ? '1 escola pública' : `${totalEscolasAtendidas} escolas públicas`;
    const textoMedia = dados.mediaDiaria === 1 ? '1 consulta/dia útil' : `${dados.mediaDiaria} consultas/dia útil`;
    const textoPico = dados.pico
      ? ` O pico de atividade operacional ocorreu em ${dados.pico.data}, com ${dados.pico.total === 1 ? '1 consulta realizada' : `${dados.pico.total} consultas realizadas`}.`
      : '';

    // Filtros aplicados em texto explicativo
    const filtrosDescricao: string[] = [];
    if (dados.filtrosAtivos?.escola) filtrosDescricao.push(`Escola: "${dados.filtrosAtivos.escola}"`);
    if (dados.filtrosAtivos?.especialidade) filtrosDescricao.push(`Especialidade: ${dados.filtrosAtivos.especialidade}`);
    if (dados.filtrosAtivos?.profissional) filtrosDescricao.push(`Profissional: ${dados.filtrosAtivos.profissional}`);
    if (dados.filtrosAtivos?.status) filtrosDescricao.push(`Situação: ${dados.filtrosAtivos.status}`);
    const textoFiltrosAplicados = filtrosDescricao.length > 0 ? ` (Filtros ativos: ${filtrosDescricao.join(' | ')})` : '';

    // Parágrafo 1: Escopo e Volume Geral
    const periodoTexto = dados.dataInicio && dados.dataFim
      ? `${dados.dataInicio} a ${dados.dataFim}`
      : (dados.dataInicio ? `a partir de ${dados.dataInicio}` : (dados.dataFim ? `até ${dados.dataFim}` : 'todo o período histórico'));
    const paragrafo1 = `O relatório consolidado para o período de ${periodoTexto}${textoFiltrosAplicados} totaliza ${textoAtendimentos}, abrangendo ${textoEstudantes} em ${textoEscolas} do Distrito Federal. O ritmo operacional registrou média de ${textoMedia}.${textoPico}`;

    // Parágrafo 2: Distribuição por Especialidade
    let paragrafo2 = '';
    if (especialidadesOrdenadas.length === 1) {
      paragrafo2 = `Em relação à área de atendimento, os dados contemplam integralmente a especialidade de ${topEspNome}, somando ${topEspTotal === 1 ? '1 consulta' : `${topEspTotal} consultas`} (100% do volume filtrado).`;
    } else if (especialidadesOrdenadas.length > 1) {
      const listaEsp = especialidadesOrdenadas
        .slice(0, 6)
        .map((e) => {
          const pct = Math.round((e.total / dados.totalGeral) * 100);
          return `${e.especialidade} com ${e.total} consulta(s) (${pct}%)`;
        })
        .join(', ');
      paragrafo2 = `A distribuição por especialidade apresenta a seguinte composição: ${listaEsp}. A especialidade de ${topEspNome} liderou a demanda no período selecionado, concentrando ${topEspPct}% de todos os atendimentos filtrados.`;
    } else {
      paragrafo2 = `Não houve discriminação de especialidade nos registros que compõem este filtro.`;
    }

    // Parágrafo 3: Unidades Escolares e Atuação Profissional
    let paragrafo3 = '';
    if (totalEscolasAtendidas === 1) {
      paragrafo3 = `No recorte territorial e institucional, todas as consultas foram concentradas na unidade "${topEscola}".`;
    } else if (totalEscolasAtendidas > 1) {
      const listaEscolas = escolasOrdenadas
        .slice(1, 4)
        .map((e) => `"${e.nome}" (${e.total} consultas, ${Math.round((e.total / dados.totalGeral) * 100)}%)`)
        .join(', ');
      paragrafo3 = `Quanto à abrangência institucional, as consultas foram realizadas em ${totalEscolasAtendidas} unidades escolares, com maior concentração na "${topEscola}", responsável por ${topEscolaTotal} atendimentos (${topEscolaPct}% da demanda filtrada), seguida por ${listaEscolas}.`;
    }

    if (profissionaisOrdenados.length > 0) {
      if (profissionaisOrdenados.length === 1) {
        paragrafo3 += ` As atividades foram conduzidas pelo profissional ${profissionaisOrdenados[0].nome}.`;
      } else {
        const topProf = profissionaisOrdenados[0];
        const pctProf = Math.round((topProf.total / dados.totalGeral) * 100);
        paragrafo3 += ` A assistência foi executada por ${profissionaisOrdenados.length} profissionais de saúde, com maior alocação de ${topProf.nome} (${topProf.total} consultas, ${pctProf}% da carga horária de atendimento).`;
      }
    }

    // Parágrafo 4: Situação Operacional e Taxa de Conclusão
    const pendencias = totalAgendados + totalConfirmados + totalEmAtendimento;
    const taxaPendencia = dados.totalGeral > 0 ? Math.round((pendencias / dados.totalGeral) * 100) : 0;
    const taxaFaltas = dados.totalGeral > 0 ? Math.round((totalFaltas / dados.totalGeral) * 100) : 0;
    const taxaCancelados = dados.totalGeral > 0 ? Math.round((totalCancelados / dados.totalGeral) * 100) : 0;

    let detalhesStatus = `Foram concluídos ${totalConcluidos} atendimento(s) (taxa de realização de ${taxaConclusao}%)`;
    if (pendencias > 0) {
      detalhesStatus += `, restando ${pendencias} em status agendado/confirmado (${taxaPendencia}%)`;
    }
    if (totalFaltas > 0) {
      detalhesStatus += `, com ${totalFaltas} falta(s) registrada(s) (absenteísmo de ${taxaFaltas}%)`;
    }
    if (totalCancelados > 0) {
      detalhesStatus += ` e ${totalCancelados} cancelamento(s) (${taxaCancelados}%)`;
    }
    detalhesStatus += '.';
    const paragrafo4 = `Sob o aspecto de execução operacional, o quadro de situações demonstra que: ${detalhesStatus}`;

    // Montagem dos 4 Cards Analíticos
    const pontoVolume = `Volume & Cobertura: ${textoAtendimentos} e ${textoEstudantes} atendidos em ${textoEscolas}, média de ${textoMedia}.`;
    const pontoEspecialidade = `Demanda por Especialidade: ${topEspNome} liderou com ${topEspTotal} consulta(s) (${topEspPct}% do volume filtrado).`;
    const pontoEscola = `Unidade em Destaque: "${topEscola}" concentrou ${topEscolaTotal} atendimento(s) (${topEscolaPct}% da demanda).`;
    const pontoStatus = `Situação Operacional: Taxa de conclusão de ${taxaConclusao}% (${totalConcluidos} concluído(s), ${totalFaltas} falta(s), ${totalCancelados} cancelamento(s)).`;

    return {
      origem: 'ALGORITMO_LOCAL' as const,
      titulo: 'Relatório Analítico de Atendimentos Filtrados',
      resumo: `${paragrafo1}\n\n${paragrafo2}\n\n${paragrafo3}\n\n${paragrafo4}`,
      pontos: [pontoVolume, pontoEspecialidade, pontoEscola, pontoStatus],
      recomendacao: `Manter dimensionamento logístico com prioridade para ${topEspNome} na unidade "${topEscola}", com controle de confirmação para assegurar a manutenção da taxa de conclusão em ${taxaConclusao}%.`,
    };
  };

  // Se Cloudflare Workers AI estiver disponível no runtime
  if (c.env.AI && typeof c.env.AI.run === 'function') {
    try {
      const promptSistema = `Você é um analista sênior de dados operacionais e auditor de saúde do projeto "Escola Cidadã – Saúde em Movimento" (UnB, SESI-DF e Finatec).

Sua tarefa é redigir um RELATÓRIO ANALÍTICO E OPERACIONAL COMPLETO com base ESTRITAMENTE nos dados numéricos e filtros fornecidos pelo usuário.

REGRAS DE CONTEÚDO E ESTILO (CRÍTICAS E OBRIGATÓRIAS):
1. PROIBIÇÃO ABSOLUTA DE FRASES MOTIVACIONAIS OU CLICHÊS:
   - NUNCA use frases motivacionais, emocionais, slogans ou de autoajuda (ex: NUNCA use frases como "melhora a autoestima dos estudantes", "alívio concreto para as famílias", "acolhimento dos jovens", "transformação de vidas").
   - O texto deve ser 100% técnico, analítico, formal, quantitativo e focado em governança e operações.

2. ESTRUTURA DO RESUMO (3 a 4 parágrafos densos e completos):
   - Parágrafo 1 (Escopo e Volume): Período, filtros aplicados, volume total de atendimentos, estudantes únicos, média diária e dia de pico.
   - Parágrafo 2 (Especialidades): Todas as especialidades filtradas, volumes de consultas e participações percentuais relativas.
   - Parágrafo 3 (Unidades e Profissionais): Cobertura territorial/escolar, distribuição de consultas por escola e alocação de profissionais de saúde.
   - Parágrafo 4 (Situação Operacional): Balanço de status (concluídos, agendados, cancelados, faltas) e taxa percentual de efetivação.

3. PONTOS DE DESTAQUE (4 CARDS OBRIGATÓRIOS, NO FORMATO "Título: Descrição"):
   - "Volume & Cobertura: [X atendimentos e Y estudantes em Z escolas, com média de W/dia]"
   - "Demanda por Especialidade: [Especialidade líder com X consultas e Y% do total]"
   - "Unidade em Destaque: [Escola com maior volume com X consultas e Y% da demanda]"
   - "Situação Operacional: [Taxa de conclusão de X%, com Y concluídos, Z faltas e W cancelamentos]"

4. RECOMENDAÇÃO TÉCNICA:
   - Uma orientação estritamente operacional e de suprimentos baseada nos gargalos ou maiores volumes identificados.

ESTRUTURA OBRIGATÓRIA DA RESPOSTA (JSON PURO):
Responda EXCLUSIVAMENTE em formato JSON sem cercaduras markdown:
{
  "titulo": "Relatório Analítico de Atendimentos Filtrados",
  "resumo": "Texto analítico em 3 a 4 parágrafos objetivos",
  "pontos": [
    "Volume & Cobertura: detalhe quantitativo",
    "Demanda por Especialidade: detalhe quantitativo",
    "Unidade em Destaque: detalhe quantitativo",
    "Situação Operacional: detalhe quantitativo"
  ],
  "recomendacao": "Diretriz operacional e logística objetiva"
}`;

      const promptUsuario = `Dados Consolidados das Ações no DF (Recorte Filtrado):
- Projeto: Escola Cidadã – Saúde em Movimento (UnB / SESI-DF / Finatec)
- Período: ${dados.dataInicio || 'Início'} até ${dados.dataFim || 'Atual'}
- Filtros Ativos: ${JSON.stringify(dados.filtrosAtivos ?? {})}
- Atendimentos Totais: ${dados.totalGeral}
- Estudantes Atendidos: ${qtdEstudantes}
- Média Diária: ${dados.mediaDiaria} consultas/dia útil ${dados.pico ? `(Pico de ${dados.pico.total} em ${dados.pico.data})` : ''}
- Atendimentos por Especialidade: ${dados.porEspecialidade.map((e) => `${e.especialidade}: ${e.total} (${e.pct ?? Math.round((e.total / Math.max(1, dados.totalGeral)) * 100)}%)`).join(', ') || 'Nenhuma'}
- Escolas Públicas Atendidas: ${dados.porEscola?.slice(0, 10).map((e) => `${e.nome}: ${e.total}`).join(', ') || 'Não discriminado'}
- Profissionais de Saúde: ${dados.porProfissional?.slice(0, 10).map((p) => `${p.nome}: ${p.total}`).join(', ') || 'Não discriminado'}
- Status Operacional: ${JSON.stringify(dados.porStatus ?? {})}`;

      const timeoutMs = 9000;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT_WORKERS_AI')), timeoutMs)
      );

      const aiPromise = c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { role: 'system', content: promptSistema },
          { role: 'user', content: promptUsuario },
        ],
        temperature: 0.2,
        max_tokens: 1200,
      });

      const resultado: any = await Promise.race([aiPromise, timeoutPromise]);
      let textoGerado = typeof resultado?.response === 'string' ? resultado.response.trim() : '';

      if (textoGerado) {
        textoGerado = textoGerado.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(textoGerado);
        if (parsed.resumo && Array.isArray(parsed.pontos)) {
          return c.json({
            origem: 'CLOUDFLARE_WORKERS_AI',
            modelo: '@cf/meta/llama-3-8b-instruct',
            titulo: parsed.titulo || 'Relatório Analítico de Atendimentos Filtrados',
            resumo: String(parsed.resumo),
            pontos: parsed.pontos.map((p: any) => String(p)),
            recomendacao: parsed.recomendacao ? String(parsed.recomendacao) : undefined,
          });
        }
      }
    } catch (erro) {
      console.warn('Falha ou timeout no Cloudflare Workers AI, acionando fallback local:', erro);
    }
  }

  // Fallback caso AI não esteja configurada ou ocorra erro
  return c.json(gerarFallbackLocal());
});

/**
 * GET /atendimentos/:id
 * Retorna dados detalhados de um atendimento específico.
 */
rotasAtendimento.get('/:id', async (c) => {
  const db = getDb(c.env.DB);
  const id = c.req.param('id');
  const atendimento = await db.query.atendimentos.findFirst({
    where: eq(atendimentos.id, id),
    with: {
      escolaLocal: { columns: { nome: true } },
      usuario: { columns: { nomeCompleto: true, conselhoProfissional: true, registroProfissional: true } },
    },
  });

  if (!atendimento) {
    return c.json({ erro: 'Atendimento não encontrado.' }, 404);
  }

  return c.json(atendimento);
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
  if (filtros.status) condicoes.push(eq(atendimentos.status, filtros.status));
  if (filtros.escolaLocalId) condicoes.push(eq(atendimentos.escolaLocalId, filtros.escolaLocalId));
  if (filtros.usuarioId) condicoes.push(eq(atendimentos.usuarioId, filtros.usuarioId));
  if (filtros.pacienteId) condicoes.push(eq(atendimentos.pacienteId, filtros.pacienteId));
  if (filtros.dataInicio) condicoes.push(gte(atendimentos.criadoEm, `${filtros.dataInicio} 00:00:00`));
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
        usuario: { columns: { nomeCompleto: true, conselhoProfissional: true, registroProfissional: true } },
        paciente: { columns: { nomeEnc: true, dekCifrada: true, ivPii: true, tagPii: true, turma: true } },
      },
    }),
    db.select({ total: count() }).from(atendimentos).where(whereClause),
  ]);

  const total = totalResult[0]?.total ?? 0;
  const kekHex = c.env.KEK_HEX;

  const atendimentosMapeados = await Promise.all(
    listaAtendimentos.map(async (a) => {
      let pacienteNome = 'Paciente Desconhecido';
      let pacienteCpf = 'Não informado';
      const pacienteTurma = a.paciente?.turma ?? 'Não informada';
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
          if (pii.cpf) {
            pacienteCpf = mascararCpf(pii.cpf);
          }
        } catch {
          pacienteNome = '[ERRO DE DESCRIPTOGRAFIA]';
        }
      }

      return {
        id: a.id,
        pacienteId: a.pacienteId,
        escolaLocalId: a.escolaLocalId,
        usuarioId: a.usuarioId,
        pacienteNome,
        pacienteCpf,
        pacienteTurma,
        especialidade: a.especialidade,
        status: a.status,
        entradaFilaEm: a.entradaFilaEm ?? a.criadoEm,
        resumo: a.resumo,
        procedimentos: a.procedimentos,
        escolaLocal: a.escolaLocal?.nome ?? 'Desconhecida',
        profissional: a.usuario?.nomeCompleto ?? 'Desconhecido',
        profissionalNome: a.usuario?.nomeCompleto ?? 'Desconhecido',
        profissionalConselho: a.usuario?.conselhoProfissional ?? null,
        profissionalRegistro: a.usuario?.registroProfissional ?? null,
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

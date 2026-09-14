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
import { atendimentos, pacientes, escolasLocais, usuarios } from '../../infraestrutura/banco/schema.js';
import { eq, and, desc, asc, count, gte, lte, inArray } from 'drizzle-orm';
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
  turno: z.nativeEnum(Turno).optional(),
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

    // Busca apenas consulta ATIVA em andamento/agendada para esta especialidade.
    // Consultas anteriores concluídas ou canceladas permitem a criação de um novo atendimento.
    const consultaExistente = await db.query.atendimentos.findFirst({
      where: and(
        eq(atendimentos.pacienteId, dados.pacienteId),
        eq(atendimentos.especialidade, dados.especialidade),
        inArray(atendimentos.status, ['AGENDADO', 'CONFIRMADO', 'EM_ATENDIMENTO'])
      ),
      columns: { id: true, resumo: true },
    });

    const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1';
    const entradaFilaEm = new Date().toISOString();

    // Se a consulta já existir para esta especialidade e paciente, atualiza os dados (ex: edição/continuação)
    if (consultaExistente) {
      const [atendimentoAtualizado] = await db
        .update(atendimentos)
        .set({
          usuarioId: profissionalId,
          resumo: sanitizarTexto(dados.resumo),
          procedimentos: sanitizarTextoOpcional(dados.procedimentos),
          insumosUtilizados: sanitizarTextoOpcional(dados.insumosUtilizados),
          encaminhamentoExterno: sanitizarTextoOpcional(dados.encaminhamentoExterno),
          status: dados.status,
          turno: dados.turno,
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
          turno: atendimentoAtualizado.turno,
          status: atendimentoAtualizado.status,
          resumo: atendimentoAtualizado.resumo,
          criadoEm: atendimentoAtualizado.criadoEm,
          atualizadoEm: atendimentoAtualizado.atualizadoEm,
        },
        200
      );
    }

    let atendimento;
    try {
      const [novoAtendimento] = await db.insert(atendimentos).values({
        pacienteId: dados.pacienteId,
        escolaLocalId: dados.escolaLocalId,
        usuarioId: profissionalId,
        especialidade: dados.especialidade,
        turno: dados.turno,
        status: dados.status,
        resumo: sanitizarTexto(dados.resumo),
        procedimentos: sanitizarTextoOpcional(dados.procedimentos),
        insumosUtilizados: sanitizarTextoOpcional(dados.insumosUtilizados),
        encaminhamentoExterno: sanitizarTextoOpcional(dados.encaminhamentoExterno),
        chaveIdempotencia: dados.idempotencyKey,
        entradaFilaEm,
      }).returning();
      atendimento = novoAtendimento;
    } catch (erro) {
      if (String(erro).toLowerCase().includes('unique')) {
        const [atendimentoRecuperado] = await db
          .update(atendimentos)
          .set({
            usuarioId: profissionalId,
            resumo: dados.resumo,
            procedimentos: dados.procedimentos ?? null,
            insumosUtilizados: dados.insumosUtilizados ?? null,
            encaminhamentoExterno: dados.encaminhamentoExterno ?? null,
            status: StatusAtendimento.CONCLUIDO,
            atualizadoEm: new Date().toISOString(),
          })
          .where(
            and(
              eq(atendimentos.pacienteId, dados.pacienteId),
              eq(atendimentos.especialidade, dados.especialidade)
            )
          )
          .returning();

        if (atendimentoRecuperado) {
          return c.json(atendimentoRecuperado, 200);
        }
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
        turno: dados.turno,
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
        turno: atendimento.turno,
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
  insumosUtilizados: z.string().max(2000).trim().optional().nullable(),
  encaminhamentoExterno: z.string().max(2000).trim().optional().nullable(),
  status: z.enum(Object.values(StatusAtendimento) as [string, ...string[]]).optional(),
  turno: z.nativeEnum(Turno).optional(),
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
  if (dados.insumosUtilizados !== undefined) camposParaAtualizar.insumosUtilizados = sanitizarTextoOpcional(dados.insumosUtilizados);
  if (dados.encaminhamentoExterno !== undefined) camposParaAtualizar.encaminhamentoExterno = sanitizarTextoOpcional(dados.encaminhamentoExterno);
  if (dados.status !== undefined) camposParaAtualizar.status = dados.status;
  if (dados.status === StatusAtendimento.AGENDADO || dados.status === StatusAtendimento.CONFIRMADO) {
    camposParaAtualizar.entradaFilaEm = new Date().toISOString();
  }
  if (dados.turno !== undefined) camposParaAtualizar.turno = dados.turno;

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
      turno: true,
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
  porStatus: z.record(z.string(), z.number()).optional(),
});

/**
 * POST /atendimentos/relatorio/sintese-ia
 * Gera Síntese Executiva e Parecer Clínico Operacional via Cloudflare Workers AI.
 * Respeita LGPD: recebe estritamente agregados estatísticos, SEM NENHUM dado identificável de aluno.
 */
rotasAtendimento.post('/relatorio/sintese-ia', zValidator('json', sinteseIaSchema), async (c) => {
  const dados = c.req.valid('json');
  const qtdEstudantes = dados.estudantesUnicos ?? dados.pacientesUnicos ?? dados.totalGeral;

  // Função auxiliar de Fallback Algorítmico Local (profissional, humano e acessível para a Gestão)
  const gerarFallbackLocal = () => {
    if (dados.totalGeral === 0) {
      return {
        origem: 'ALGORITMO_LOCAL' as const,
        titulo: 'Resumo das Ações de Saúde nas Escolas',
        resumo: 'Nenhum atendimento foi registrado no intervalo e filtros selecionados para o projeto Escola Cidadã – Saúde em Movimento (parceria UnB, SESI-DF e Finatec). O sistema permanece pronto para receber os novos registros da equipe itinerante.',
        pontos: [
          'Aguardando Registros: Nenhum atendimento encontrado com os filtros atuais.',
          'Dica de Consulta: Ajuste as datas ou escolas nos filtros acima para visualizar outros períodos.',
        ],
        recomendacao: 'Amplie o período nos filtros do cabeçalho para consultar atendimentos de outras semanas da ação itinerante.',
      };
    }

    const topEsp = dados.porEspecialidade[0];
    const topEspNome = topEsp?.especialidade ?? 'Clínica Geral';
    const topEspTotal = topEsp?.total ?? 0;
    const topEspPct = topEsp && dados.totalGeral > 0 ? Math.round((topEspTotal / dados.totalGeral) * 100) : 0;
    const topEscola = dados.porEscola?.[0]?.nome ?? 'escolas públicas da rede';
    const totalEscolasAtendidas = dados.porEscola?.length ?? 0;

    // Concordância gramatical estrita para singular e plural
    const textoAtendimentos = dados.totalGeral === 1 ? '1 atendimento' : `${dados.totalGeral} atendimentos`;
    const textoEstudantes = qtdEstudantes === 1 ? '1 estudante' : `${qtdEstudantes} estudantes`;
    const textoEscolas = totalEscolasAtendidas === 1 ? '1 escola pública' : `${totalEscolasAtendidas} escolas públicas`;
    const textoMedia = dados.mediaDiaria === 1 ? '1 consulta por dia útil' : `${dados.mediaDiaria} consultas por dia útil`;
    const textoPico = dados.pico
      ? ` O dia de maior atividade foi em ${dados.pico.data}, com ${dados.pico.total === 1 ? '1 consulta realizada' : `${dados.pico.total} consultas realizadas`}.`
      : '';

    const paragrafo1 = `No período avaliado (${dados.dataInicio || 'Início'} a ${dados.dataFim || 'Atual'}), o projeto Escola Cidadã – Saúde em Movimento, realizado em parceria pela Universidade de Brasília (UnB), SESI-DF e Finatec, realizou ${textoAtendimentos}, acolhendo diretamente ${textoEstudantes} em ${textoEscolas} do Distrito Federal. As equipes mantiveram um ritmo constante de atendimento, com média de ${textoMedia}.${textoPico}`;

    const paragrafo2 = `Entre as frentes de atendimento, a área de ${topEspNome} foi a mais procurada pelos jovens, somando ${topEspTotal === 1 ? '1 consulta' : `${topEspTotal} consultas`} (${topEspPct}% de todos os atendimentos do período). A unidade escolar com maior participação foi a "${topEscola}", demonstrando forte envolvimento da comunidade escolar com o cuidado preventivo e a promoção da saúde.`;

    const paragrafo3 = `Ao levar os profissionais de saúde diretamente para dentro das escolas públicas, a ação itinerante facilita o acesso ao cuidado, ajuda a melhorar a autoestima e o rendimento escolar dos estudantes, proporcionando um alívio concreto e acolhimento para as famílias do DF.`;

    return {
      origem: 'ALGORITMO_LOCAL' as const,
      titulo: 'Resumo das Ações de Saúde nas Escolas',
      resumo: `${paragrafo1}\n\n${paragrafo2}\n\n${paragrafo3}`,
      pontos: [
        `Alcance dos Estudantes: ${textoEstudantes} acolhidos em ${textoEscolas}, com média de ${textoMedia}.`,
        `Área Mais Procurada: ${topEspNome} liderou com ${topEspPct}% dos atendimentos da equipe itinerante.`,
        `Escola em Destaque: "${topEscola}" registrou a maior participação no período.`,
        `Cuidado nas Escolas: Ações no ambiente escolar que fortalecem a autoestima e o rendimento dos jovens.`,
      ],
      recomendacao: `Manter o cronograma itinerante e o apoio prioritário de insumos para a unidade "${topEscola}" e para os atendimentos de ${topEspNome}.`,
    };
  };

  // Se Cloudflare Workers AI estiver disponível no runtime
  if (c.env.AI && typeof c.env.AI.run === 'function') {
    try {
      const promptSistema = `Você é a coordenadora do projeto "Escola Cidadã – Saúde em Movimento", parceria entre a Universidade de Brasília (UnB), o Serviço Social da Indústria do Distrito Federal (SESI-DF) e a Fundação de Empreendimentos Científicos e Tecnológicos (Finatec). O projeto leva atendimento de saúde (odontologia, oftalmologia, fonoaudiologia, nutrição e apoio psicossocial/emocional) a estudantes das escolas públicas do Distrito Federal.

Sua missão é redigir um resumo executivo para a equipe de gestão e direção escolar.

DIRETRIZES DE COMUNICAÇÃO (MUITO IMPORTANTE):
1. Tom: Profissional, acolhedor, transparente e direto.
2. Vocabulário acessível: Use palavras simples e claras. NÃO use jargões difíceis (evite termos herméticos como "demanda epidemiológica", "resolutividade", "absenteísmo escolar", "intervenção clínica").
3. Impacto real: Mostre como o cuidado à saúde na escola melhora a autoestima, o desempenho nos estudos e traz alívio para as famílias.
4. Gramática e Concordância: Respeite rigorosamente singular e plural (ex: "1 atendimento", "1 estudante", "1 consulta por dia").
5. Privacidade (LGPD): Jamais invente ou mencione dados pessoais de alunos (nomes, CPFs). Trabalhe exclusivamente com os números consolidados informados.

ESTRUTURA OBRIGATÓRIA DA RESPOSTA (JSON PURO):
Responda EXCLUSIVAMENTE em formato JSON sem cercaduras markdown:
{
  "titulo": "Resumo das Ações de Saúde nas Escolas",
  "resumo": "Texto corrido de 2 a 3 parágrafos claros e profissionais explicando: 1) O total de atendimentos e estudantes atendidos nas escolas públicas do DF pelo projeto Escola Cidadã – Saúde em Movimento (UnB, SESI-DF e Finatec); 2) A especialidade com maior procura e como ela ajuda a saúde dos jovens; 3) O ritmo das atividades itinerantes e o benefício do acolhimento na escola para o bem-estar e o aprendizado.",
  "pontos": [
    "Alcance dos Estudantes: detalhe com número de estudantes e média diária",
    "Área Mais Procurada: especialidade mais atendida e percentual",
    "Escola em Destaque: escola com maior participação",
    "Cuidado nas Escolas: impacto positivo no bem-estar e no rendimento escolar"
  ],
  "recomendacao": "Orientação prática para o próximo ciclo de visitas e reforço de insumos."
}`;

      const promptUsuario = `Dados Consolidados das Ações no DF:
- Projeto: Escola Cidadã – Saúde em Movimento (UnB / SESI-DF / Finatec)
- Período: ${dados.dataInicio || 'Início'} até ${dados.dataFim || 'Atual'}
- Atendimentos Totais: ${dados.totalGeral}
- Estudantes Atendidos: ${qtdEstudantes}
- Média Diária: ${dados.mediaDiaria} consultas/dia útil ${dados.pico ? `(Pico de ${dados.pico.total} em ${dados.pico.data})` : ''}
- Atendimentos por Especialidade: ${dados.porEspecialidade.map((e) => `${e.especialidade}: ${e.total}`).join(', ') || 'Nenhuma'}
- Escolas Públicas Atendidas: ${dados.porEscola?.slice(0, 8).map((e) => `${e.nome}: ${e.total}`).join(', ') || 'Não discriminado'}
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
        max_tokens: 1000,
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
            titulo: parsed.titulo || 'Resumo das Ações de Saúde nas Escolas',
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
  if (filtros.turno) condicoes.push(eq(atendimentos.turno, filtros.turno));
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
        turno: a.turno,
        status: a.status,
        entradaFilaEm: a.entradaFilaEm ?? a.criadoEm,
        resumo: a.resumo,
        procedimentos: a.procedimentos,
        insumosUtilizados: a.insumosUtilizados,
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

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getDb } from '../../infraestrutura/banco/drizzle.js';
import {
  pacientes,
  escolasLocais,
  usuarios,
  atendimentos,
  consentimentos,
} from '../../infraestrutura/banco/schema.js';
import { eq, and, like, inArray } from 'drizzle-orm';
import {
  criptografarPii,
  gerarBlindIndex,
} from '../../infraestrutura/criptografia/crypto.js';
import { gerarHashSenha } from '../../infraestrutura/criptografia/senha.js';
import { middlewareAutenticacao, type AppVariables } from '../../middlewares/autenticacao.js';
import { autorizarPerfis } from '../../middlewares/autorizacao.js';
import { registrarAuditoria } from '../../middlewares/auditoria.js';
import {
  Especialidade,
  StatusAtendimento,
  Turno,
} from '../../../compartilhado/index.js';
import type { Bindings } from '../../config/env.js';
import { sanitizarTexto } from '../../infraestrutura/sanitizacao.js';

export const rotasImportacao = new Hono<{ Bindings: Bindings; Variables: AppVariables }>();

// Proteção da rota: exige autenticação e perfis autorizados
rotasImportacao.use('*', middlewareAutenticacao);
rotasImportacao.use(
  '*',
  autorizarPerfis(['BOOTSTRAP', 'ADMIN', 'TRIAGEM_RECEPCAO'])
);

// ─── Helpers de Normalização ────────────────────────────────────────────────

const normalizarTexto = (valor?: string | null): string =>
  (valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const normalizarCpf = (valor?: string | null): string =>
  (valor ?? '').replace(/\D/g, '').slice(0, 11);

const normalizarTelefone = (valor?: string | null): string | null => {
  if (!valor) return null;
  const limpo = valor.replace(/\D/g, '');
  return limpo.length >= 10 && limpo.length <= 11 ? limpo : null;
};

const normalizarEmail = (valor?: string | null): string | null => {
  if (!valor) return null;
  const limpo = valor.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpo) ? limpo : null;
};

/**
 * Converte datas variadas (ISO, BR DD/MM/AAAA, etc.) para o formato ISO AAAA-MM-DD
 */
export function normalizarDataIso(dataStr?: string | null): string | null {
  if (!dataStr) return null;
  const limpo = dataStr.trim();

  // AAAA-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(limpo)) {
    return limpo;
  }

  // DD/MM/AAAA ou DD-MM-AAAA
  const matchBr = limpo.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (matchBr) {
    const dia = matchBr[1].padStart(2, '0');
    const mes = matchBr[2].padStart(2, '0');
    const ano = matchBr[3];
    return `${ano}-${mes}-${dia}`;
  }

  // Objeto de data parseável
  const d = new Date(limpo);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }

  return null;
}

/**
 * Mapeia termos livres de especialidade para o enum oficial do sistema
 */
export function mapearEspecialidade(termo?: string | null): Especialidade {
  const norm = normalizarTexto(termo);
  if (norm.includes('oftalm') || norm.includes('vista') || norm.includes('olho')) {
    return Especialidade.OFTALMOLOGIA;
  }
  if (norm.includes('audio') || norm.includes('fono') || norm.includes('ouvid')) {
    return Especialidade.AUDIOMETRIA;
  }
  if (norm.includes('odont') || norm.includes('dent') || norm.includes('bucal')) {
    return Especialidade.ODONTOLOGIA;
  }
  if (norm.includes('psico') || norm.includes('mental')) {
    return Especialidade.PSICOLOGIA;
  }
  if (norm.includes('nutri') || norm.includes('aliment')) {
    return Especialidade.NUTRICAO;
  }

  // Fallback padrão se não identificado
  return Especialidade.OFTALMOLOGIA;
}

/**
 * Mapeia termos livres de situação/status para o enum oficial do sistema
 */
export function mapearStatusAtendimento(termo?: string | null): StatusAtendimento {
  const norm = normalizarTexto(termo);
  if (
    norm.includes('concluid') ||
    norm.includes('realizad') ||
    norm.includes('atendid') ||
    norm.includes('finalizad')
  ) {
    return StatusAtendimento.CONCLUIDO;
  }
  if (norm.includes('agendad') || norm.includes('marcad') || norm.includes('aguard')) {
    return StatusAtendimento.AGENDADO;
  }
  if (norm.includes('confirmad') || norm.includes('present')) {
    return StatusAtendimento.CONFIRMADO;
  }
  if (norm.includes('em atend') || norm.includes('andamento')) {
    return StatusAtendimento.EM_ATENDIMENTO;
  }
  if (norm.includes('cancelad') || norm.includes('desist')) {
    return StatusAtendimento.CANCELADO;
  }
  if (norm.includes('falt') || norm.includes('ausent') || norm.includes('nao compareceu')) {
    return StatusAtendimento.FALTOU;
  }

  return StatusAtendimento.CONCLUIDO;
}

/**
 * Mapeia turno com base no termo
 */
export function mapearTurno(termo?: string | null): Turno {
  const norm = normalizarTexto(termo);
  if (norm.includes('tarde') || norm.includes('vespert')) {
    return Turno.TARDE;
  }
  return Turno.MANHA;
}

/**
 * Extrai o nome canônico do profissional removendo títulos e honoríficos (Dr, Dra, Médico, etc.)
 * para garantir correspondência exata mesmo quando a planilha contém "Dr. Fulano" e o sistema "Fulano"
 */
export function extrairNomeCanonicoProfissional(nome?: string | null): string {
  if (!nome) return '';
  return normalizarTexto(nome)
    .replace(/^(dra?\.?|doutor[a]?|medic[oa]|enfermeir[oa]|dentista|psicolog[oa]|nutricionista)\s+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Schemas Zod ────────────────────────────────────────────────────────────

const itemImportacaoSchema = z.object({
  linhaOriginal: z.number().int().positive(),
  pacienteNome: z.string().min(1, 'Nome do paciente é obrigatório'),
  pacienteCpf: z.string().nullable().optional(),
  dataNascimento: z.string().nullable().optional(),
  pacienteEmail: z.string().nullable().optional(),
  pacienteTelefone: z.string().nullable().optional(),
  especialidade: z.string().min(1, 'Especialidade é obrigatória'),
  profissionalNome: z.string().min(1, 'Profissional é obrigatório'),
  situacao: z.string().optional().default('Concluído'),
  instituicaoNome: z.string().min(1, 'Instituição é obrigatória'),
  dataAtendimento: z.string().nullable().optional(),
  turno: z.string().nullable().optional(),
});

const processarLoteSchema = z.object({
  importacaoId: z.string().min(1).default(() => `imp_${Date.now()}`),
  itens: z.array(itemImportacaoSchema).min(1).max(250),
  opcoes: z
    .object({
      criarProfissionalSeNaoExistir: z.boolean().default(true),
      turmaPadrao: z.string().default('Geral'),
      turnoPadrao: z.enum(['MANHA', 'TARDE']).default('MANHA'),
      statusPadrao: z.string().default('CONCLUIDO'),
      abortarNoPrimeiroErro: z.boolean().default(true),
    })
    .optional()
    .default({}),
});

// ─── Endpoint: Metadados para Validação Prévia ──────────────────────────────
/**
 * GET /api/v1/importacao/metadados
 * Retorna as instituições cadastradas e profissionais existentes para pré-validação no frontend
 */
rotasImportacao.get('/metadados', async (c) => {
  const db = getDb(c.env.DB);

  const [escolas, listaUsuarios] = await Promise.all([
    db.query.escolasLocais.findMany({
      where: eq(escolasLocais.ativo, true),
      columns: { id: true, nome: true, cidade: true, uf: true },
    }),
    db.query.usuarios.findMany({
      where: eq(usuarios.ativo, true),
      columns: { id: true, nomeCompleto: true, perfil: true, especialidade: true },
    }),
  ]);

  return c.json({
    sucesso: true,
    escolas: escolas.map((e) => ({
      id: e.id,
      nome: e.nome,
      cidade: e.cidade,
      uf: e.uf,
    })),
    profissionais: listaUsuarios
      .filter((u) => u.perfil === 'PROFISSIONAL_SAUDE' || u.perfil === 'ADMIN' || u.perfil === 'BOOTSTRAP')
      .map((u) => ({
        id: u.id,
        nome: u.nomeCompleto,
        perfil: u.perfil,
        especialidade: u.especialidade,
      })),
  });
});

// ─── Endpoint: Processar Lote (Chunk) ───────────────────────────────────────
/**
 * POST /api/v1/importacao/processar-lote
 * Processa um lote de 50 a 100 consultas, vinculando alunos (criando com PII criptografada ou reaproveitando),
 * associando escolas locais existentes, profissionais de saúde e gerando as fichas de atendimento.
 */
rotasImportacao.post(
  '/processar-lote',
  zValidator('json', processarLoteSchema),
  async (c) => {
    const { importacaoId, itens, opcoes } = c.req.valid('json');
    const usuarioLogado = c.get('usuario');
    const db = getDb(c.env.DB);
    const kekHex = c.env.KEK_HEX;

    // 1. Cache em memória das escolas ativas para resolução O(1)
    const todasEscolas = await db.query.escolasLocais.findMany({
      where: eq(escolasLocais.ativo, true),
    });

    const mapaEscolasPorNomeNorm = new Map<string, typeof todasEscolas[number]>();
    for (const esc of todasEscolas) {
      mapaEscolasPorNomeNorm.set(normalizarTexto(esc.nome), esc);
    }

    // 2. Cache em memória dos usuários/profissionais existentes
    const todosUsuarios = await db.query.usuarios.findMany();

    const mapaUsuarios = new Map<string, typeof todosUsuarios[number]>();
    for (const u of todosUsuarios) {
      const uNorm = normalizarTexto(u.nomeCompleto);
      const uCanonico = extrairNomeCanonicoProfissional(u.nomeCompleto);
      mapaUsuarios.set(uNorm, u);
      if (uCanonico) {
        mapaUsuarios.set(uCanonico, u);
      }
    }

    // Hash de senha seguro pré-calculado para novos profissionais auto-provisionados
    let hashSenhaPadraoCache: string | null = null;
    const obterHashSenhaPadrao = async (): Promise<string> => {
      if (!hashSenhaPadraoCache) {
        hashSenhaPadraoCache = await gerarHashSenha(crypto.randomUUID().slice(0, 16) + 'Aa1@');
      }
      return hashSenhaPadraoCache;
    };

    let totalProcessados = 0;
    let pacientesCriados = 0;
    let pacientesReaproveitados = 0;
    let atendimentosCriados = 0;
    let profissionaisCriados = 0;
    const atendimentosCriadosIds: string[] = [];
    const pacientesCriadosIds: string[] = [];
    const profissionaisCriadosIds: string[] = [];
    const falhas: Array<{ linha: number; erro: string; detalhe?: string }> = [];

    const retencaoDias = Number(c.env.PATIENT_DATA_RETENTION_DAYS ?? 365);
    const retencaoExpiraEm = new Date();
    retencaoExpiraEm.setDate(retencaoExpiraEm.getDate() + retencaoDias);
    const retencaoExpiraEmIso = retencaoExpiraEm.toISOString();

    // Controle em memória para impedir mais de uma consulta na mesma especialidade para o mesmo paciente
    const consultasProcessadasSessao = new Set<string>();

    for (const item of itens) {
      totalProcessados++;
      try {
        // ── A. Vinculação com a Instituição ─────────────────────────────────
        const nomeInstituicaoNorm = normalizarTexto(item.instituicaoNome);
        let escola = mapaEscolasPorNomeNorm.get(nomeInstituicaoNorm);

        if (!escola) {
          // Tenta correspondência aproximada (se o nome informado contiver ou estiver contido no nome da escola)
          for (const [normEscola, esc] of mapaEscolasPorNomeNorm.entries()) {
            if (
              normEscola.includes(nomeInstituicaoNorm) ||
              nomeInstituicaoNorm.includes(normEscola)
            ) {
              escola = esc;
              break;
            }
          }
        }

        if (!escola) {
          const msgErro = `Instituição não encontrada no sistema: "${item.instituicaoNome}"`;
          falhas.push({
            linha: item.linhaOriginal,
            erro: msgErro,
            detalhe: 'Certifique-se de que a escola está cadastrada no módulo de Escolas.',
          });

          if (opcoes.abortarNoPrimeiroErro) {
            return c.json(
              {
                sucesso: false,
                abortado: true,
                importacaoId,
                erro: `Erro impeditivo na linha ${item.linhaOriginal}: ${msgErro}. Rollback acionado.`,
                totalProcessados,
                atendimentosCriados,
                pacientesCriados,
                pacientesReaproveitados,
                profissionaisCriados,
                atendimentosCriadosIds,
                pacientesCriadosIds,
                profissionaisCriadosIds,
                totalFalhas: falhas.length,
                falhas,
              },
              422
            );
          }
          continue;
        }

        // ── B. Vinculação Obrigatória ao Profissional de Saúde ───────────────
        const nomeOriginalProfissional = (item.profissionalNome || '').trim() || 'Profissional de Saúde';
        const nomeProfissionalNorm = normalizarTexto(nomeOriginalProfissional);
        const nomeProfissionalCanonico = extrairNomeCanonicoProfissional(nomeOriginalProfissional);
        const especialidadeEnum = mapearEspecialidade(item.especialidade);

        // 1. Busca direta por chave no mapa (nome normalizado ou canônico sem Dr./Dra.)
        let profissional =
          mapaUsuarios.get(nomeProfissionalNorm) ||
          (nomeProfissionalCanonico ? mapaUsuarios.get(nomeProfissionalCanonico) : undefined);

        // 2. Busca aproximada inteligente nos usuários já carregados
        if (!profissional) {
          for (const u of todosUsuarios) {
            const uNorm = normalizarTexto(u.nomeCompleto);
            const uCanonico = extrairNomeCanonicoProfissional(u.nomeCompleto);

            if (
              (nomeProfissionalCanonico && uCanonico && (uCanonico === nomeProfissionalCanonico || uCanonico.startsWith(nomeProfissionalCanonico) || nomeProfissionalCanonico.startsWith(uCanonico))) ||
              uNorm.includes(nomeProfissionalNorm) ||
              nomeProfissionalNorm.includes(uNorm)
            ) {
              profissional = u;
              break;
            }
          }
        }

        // 3. Se ainda não existir no sistema, provisiona como PROFISSIONAL_SAUDE ativo
        // garantindo que a consulta fique 100% vinculada a ele
        if (!profissional) {
          const slugNome = (nomeProfissionalCanonico || 'prof')
            .replace(/[^a-z0-9]/g, '.')
          const slugImportacao = importacaoId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
          const emailAuto = `prof.${slugNome}.${slugImportacao}.${crypto.randomUUID().slice(0, 4)}@catraki.saude`;
          const senhaHash = await obterHashSenhaPadrao();
          const novoUserId = crypto.randomUUID();

          const [novoUsuario] = await db
            .insert(usuarios)
            .values({
              id: novoUserId,
              email: emailAuto,
              senhaHash,
              nomeCompleto: sanitizarTexto(nomeOriginalProfissional),
              perfil: 'PROFISSIONAL_SAUDE',
              especialidade: especialidadeEnum,
              ativo: true,
            })
            .returning();

          profissional = novoUsuario;
          mapaUsuarios.set(nomeProfissionalNorm, profissional);
          if (nomeProfissionalCanonico) {
            mapaUsuarios.set(nomeProfissionalCanonico, profissional);
          }
          todosUsuarios.push(profissional);
          profissionaisCriados++;
          profissionaisCriadosIds.push(novoUserId);
        }

        // ── C. Deduplicação Inteligente de Pacientes ─────────────────────────
        let pacienteId: string | null = null;
        const cpfLimpo = normalizarCpf(item.pacienteCpf);

        if (cpfLimpo.length === 11) {
          const cpfHash = await gerarBlindIndex(cpfLimpo, kekHex);
          const pacienteExistente = await db.query.pacientes.findFirst({
            where: and(eq(pacientes.cpfHash, cpfHash), eq(pacientes.ativo, true)),
            columns: { id: true },
          });

          if (pacienteExistente) {
            pacienteId = pacienteExistente.id;
            pacientesReaproveitados++;
          }
        }

        if (!pacienteId) {
          const dataNascimentoIso = normalizarDataIso(item.dataNascimento);
          const piiTextoPlano = JSON.stringify({
            nome: sanitizarTexto(item.pacienteNome),
            cpf: cpfLimpo.length === 11 ? cpfLimpo : null,
            dataNascimento: dataNascimentoIso,
            telefone: normalizarTelefone(item.pacienteTelefone),
            email: normalizarEmail(item.pacienteEmail),
          });

          const piiCifrada = await criptografarPii(piiTextoPlano, kekHex);
          const cpfHash =
            cpfLimpo.length === 11 ? await gerarBlindIndex(cpfLimpo, kekHex) : null;

          const novoPacienteId = crypto.randomUUID();
          const [novoPaciente] = await db
            .insert(pacientes)
            .values({
              id: novoPacienteId,
              nomeEnc: piiCifrada.dadosCifrados,
              cpfEnc: '',
              cpfHash,
              dataNascimentoEnc: '',
              telefoneEnc: null,
              dekCifrada: piiCifrada.dekCifrada,
              ivPii: piiCifrada.iv,
              tagPii: piiCifrada.tag,
              turma: opcoes.turmaPadrao || 'Geral',
              escolaLocalId: escola.id,
              retencaoExpiraEm: retencaoExpiraEmIso,
              ativo: true,
            })
            .returning();

          pacienteId = novoPaciente.id;
          pacientesCriados++;
          pacientesCriadosIds.push(novoPaciente.id);
        }

        // ── D. Criação da Consulta (Atendimento com Unicidade por Especialidade) ─
        const statusEnum = item.situacao
          ? mapearStatusAtendimento(item.situacao)
          : (opcoes.statusPadrao as StatusAtendimento) || StatusAtendimento.CONCLUIDO;

        const turnoEnum = item.turno
          ? mapearTurno(item.turno)
          : (opcoes.turnoPadrao as Turno) || Turno.MANHA;

        // Regra Inegociável: Não permitir mais de uma consulta para o mesmo paciente/CPF na mesma especialidade
        const chavePacienteEspecialidade = `${pacienteId}:${especialidadeEnum}`;

        // 1. Checagem em memória na sessão atual do lote
        if (consultasProcessadasSessao.has(chavePacienteEspecialidade)) {
          falhas.push({
            linha: item.linhaOriginal,
            erro: `Consulta duplicada na planilha ignorada: o paciente já possui uma consulta registrada na especialidade "${especialidadeEnum}". Cada CPF/aluno só pode ter 1 consulta por especialidade.`,
            detalhe: item.pacienteNome ? `Paciente: ${item.pacienteNome}` : undefined,
          });
          continue;
        }

        // 2. Checagem no banco de dados para evitar duplicidade de especialidade
        const consultaExistenteBanco = await db.query.atendimentos.findFirst({
          where: and(
            eq(atendimentos.pacienteId, pacienteId),
            eq(atendimentos.especialidade, especialidadeEnum)
          ),
          columns: { id: true, status: true },
        });

        if (consultaExistenteBanco) {
          falhas.push({
            linha: item.linhaOriginal,
            erro: `Consulta duplicada ignorada: o paciente já possui uma consulta prévia cadastrada na especialidade "${especialidadeEnum}". Cada CPF/aluno só pode ter 1 consulta por especialidade.`,
            detalhe: item.pacienteNome ? `Paciente: ${item.pacienteNome}` : undefined,
          });
          continue;
        }

        // 3. Marca como processada na sessão para garantir unicidade estrita
        consultasProcessadasSessao.add(chavePacienteEspecialidade);

        const atendimentoId = crypto.randomUUID();
        // Prefixo de sessão que garante identificação unívoca para cancelamento atômico
        const chaveIdempotencia = `sess:${importacaoId}:${item.linhaOriginal}:${atendimentoId}`;
        const dataAtendimentoIso = normalizarDataIso(item.dataAtendimento);
        const dataCriacao = dataAtendimentoIso
          ? `${dataAtendimentoIso}T09:00:00-03:00`
          : new Date().toISOString();

        try {
          await db.insert(atendimentos).values({
            id: atendimentoId,
            pacienteId,
            escolaLocalId: escola.id,
            usuarioId: profissional.id,
            especialidade: especialidadeEnum,
            turno: turnoEnum,
            status: statusEnum,
            resumo: `Atendimento importado via planilha. Situação original: ${item.situacao || 'Concluído'}. Profissional: ${item.profissionalNome}.`,
            chaveIdempotencia,
            criadoEm: dataCriacao,
            atualizadoEm: dataCriacao,
          });

          atendimentosCriados++;
          atendimentosCriadosIds.push(atendimentoId);
        } catch (erroAtendimento: any) {
          if (
            erroAtendimento?.message?.includes('UNIQUE') ||
            erroAtendimento?.message?.includes('atendimentos_paciente_especialidade_key')
          ) {
            falhas.push({
              linha: item.linhaOriginal,
              erro: `Duplicidade evitada: o paciente já possui uma consulta cadastrada na especialidade "${especialidadeEnum}".`,
              detalhe: item.pacienteNome ? `Paciente: ${item.pacienteNome}` : undefined,
            });
          } else {
            throw erroAtendimento;
          }
        }
      } catch (erroItem: any) {
        const msg = erroItem?.message || 'Erro inesperado ao processar linha';
        falhas.push({
          linha: item.linhaOriginal,
          erro: msg,
          detalhe: item.pacienteNome ? `Paciente: ${item.pacienteNome}` : undefined,
        });

        if (opcoes.abortarNoPrimeiroErro) {
          return c.json(
            {
              sucesso: false,
              abortado: true,
              importacaoId,
              erro: `Erro na linha ${item.linhaOriginal}: ${msg}. Cancelamento automático ativado.`,
              totalProcessados,
              atendimentosCriados,
              pacientesCriados,
              pacientesReaproveitados,
              profissionaisCriados,
              atendimentosCriadosIds,
              pacientesCriadosIds,
              profissionaisCriadosIds,
              totalFalhas: falhas.length,
              falhas,
            },
            422
          );
        }
      }
    }

    // Auditoria resumida por lote para evitar sobrecarga de logs
    const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1';
    await registrarAuditoria(db, {
      userId: usuarioLogado.userId,
      acao: 'CREATE',
      entidade: 'Atendimento',
      entidadeId: `importacao-${importacaoId}`,
      diffPosterior: {
        importacaoId,
        totalProcessados,
        atendimentosCriados,
        pacientesCriados,
        pacientesReaproveitados,
        profissionaisCriados,
        totalFalhas: falhas.length,
      },
      ip,
    });

    return c.json({
      sucesso: true,
      importacaoId,
      totalProcessados,
      atendimentosCriados,
      pacientesCriados,
      pacientesReaproveitados,
      profissionaisCriados,
      atendimentosCriadosIds,
      pacientesCriadosIds,
      profissionaisCriadosIds,
      totalFalhas: falhas.length,
      falhas,
    });
  }
);

// ─── Endpoint: Rollback Atômico Total ───────────────────────────────────────

const rollbackSchema = z.object({
  importacaoId: z.string().min(1, 'ID da importação é obrigatório'),
  atendimentoIds: z.array(z.string()).optional().default([]),
  pacienteIds: z.array(z.string()).optional().default([]),
  usuarioIds: z.array(z.string()).optional().default([]),
});

/**
 * POST /api/v1/importacao/rollback
 * Executa reversão atômica de todos os dados criados durante uma sessão de importação:
 * 1. Remove atendimentos criados pela sessão (via chave_idempotencia LIKE 'sess:importacaoId:%' e lista de IDs)
 * 2. Remove consentimentos dos pacientes recém-criados
 * 3. Remove pacientes recém-criados (nunca remove pacientes pré-existentes)
 * 4. Remove usuários profissionais recém-criados (nunca remove usuários pré-existentes)
 */
rotasImportacao.post('/rollback', zValidator('json', rollbackSchema), async (c) => {
  const { importacaoId, atendimentoIds, pacienteIds, usuarioIds } = c.req.valid('json');
  const usuarioLogado = c.get('usuario');
  const db = getDb(c.env.DB);

  // ─── 1. Identificar TODOS os pacientes criados nesta sessão ─────────────────
  // Inclui IDs acumulados pelo frontend e pacientes marcados no consentimento da sessão
  const setPacientesIds = new Set<string>(pacienteIds.filter(Boolean));
  try {
    const consentimentosSessao = await db.query.consentimentos.findMany({
      where: eq(consentimentos.referenciaDocumento, `sess:${importacaoId}`),
      columns: { pacienteId: true },
    });
    for (const cs of consentimentosSessao) {
      if (cs.pacienteId) setPacientesIds.add(cs.pacienteId);
    }
  } catch (err) {
    console.error('Erro ao buscar consentimentos da sessão no rollback:', err);
  }

  const todosPacientesIds = Array.from(setPacientesIds);

  // ─── 2. Identificar TODOS os atendimentos criados nesta sessão ───────────────
  const setAtendimentosIds = new Set<string>(atendimentoIds.filter(Boolean));
  try {
    const atendimentosSessao = await db.query.atendimentos.findMany({
      where: like(atendimentos.chaveIdempotencia, `sess:${importacaoId}:%`),
      columns: { id: true },
    });
    for (const at of atendimentosSessao) {
      if (at.id) setAtendimentosIds.add(at.id);
    }
  } catch (err) {
    console.error('Erro ao buscar atendimentos da sessão no rollback:', err);
  }

  const todosAtendimentoIds = Array.from(setAtendimentosIds);

  // ─── 3. Identificar TODOS os profissionais criados nesta sessão ─────────────
  const setUsuariosIds = new Set<string>(usuarioIds.filter(Boolean));
  const slugImportacao = importacaoId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
  try {
    const usuariosSessao = await db.query.usuarios.findMany({
      where: and(
        like(usuarios.email, `%${slugImportacao}%`),
        eq(usuarios.perfil, 'PROFISSIONAL_SAUDE')
      ),
      columns: { id: true },
    });
    for (const u of usuariosSessao) {
      if (u.id) setUsuariosIds.add(u.id);
    }
  } catch (err) {
    console.error('Erro ao buscar usuários da sessão no rollback:', err);
  }

  const todosUsuariosIds = Array.from(setUsuariosIds);

  let atendimentosRemovidos = 0;
  let pacientesRemovidos = 0;
  let usuariosRemovidos = 0;

  // ─── PASSO 1: Remover Atendimentos (Elimina FKs dependentes de Pacientes e Usuários) ───
  try {
    // 1A. Exclusão por chave de idempotência da sessão
    await db
      .delete(atendimentos)
      .where(like(atendimentos.chaveIdempotencia, `sess:${importacaoId}:%`));

    // 1B. Exclusão por IDs acumulados de atendimentos
    if (todosAtendimentoIds.length > 0) {
      for (let i = 0; i < todosAtendimentoIds.length; i += 200) {
        const slice = todosAtendimentoIds.slice(i, i + 200);
        await db.delete(atendimentos).where(inArray(atendimentos.id, slice));
      }
    }

    // 1C. Exclusão de atendimentos vinculados aos pacientes criados nesta sessão
    if (todosPacientesIds.length > 0) {
      for (let i = 0; i < todosPacientesIds.length; i += 200) {
        const slice = todosPacientesIds.slice(i, i + 200);
        await db.delete(atendimentos).where(inArray(atendimentos.pacienteId, slice));
      }
    }

    atendimentosRemovidos = todosAtendimentoIds.length;
  } catch (err) {
    console.error('Erro ao remover atendimentos no rollback:', err);
  }

  // ─── PASSO 2: Remover Consentimentos dos Pacientes da Sessão ────────────────
  try {
    await db
      .delete(consentimentos)
      .where(eq(consentimentos.referenciaDocumento, `sess:${importacaoId}`));

    if (todosPacientesIds.length > 0) {
      for (let i = 0; i < todosPacientesIds.length; i += 200) {
        const slice = todosPacientesIds.slice(i, i + 200);
        await db.delete(consentimentos).where(inArray(consentimentos.pacienteId, slice));
      }
    }
  } catch (err) {
    console.error('Erro ao remover consentimentos no rollback:', err);
  }

  // ─── PASSO 3: Remover Pacientes da Sessão (Agora sem FKs em Atendimentos ou Consentimentos) ───
  if (todosPacientesIds.length > 0) {
    try {
      for (let i = 0; i < todosPacientesIds.length; i += 200) {
        const slice = todosPacientesIds.slice(i, i + 200);
        await db.delete(pacientes).where(inArray(pacientes.id, slice));
      }
      pacientesRemovidos = todosPacientesIds.length;
    } catch (err) {
      console.error('Erro ao remover pacientes no rollback:', err);
    }
  }

  // ─── PASSO 4: Remover Profissionais Auto-criados na Sessão ──────────────────
  if (todosUsuariosIds.length > 0) {
    try {
      for (let i = 0; i < todosUsuariosIds.length; i += 200) {
        const slice = todosUsuariosIds.slice(i, i + 200);
        await db
          .delete(usuarios)
          .where(and(inArray(usuarios.id, slice), eq(usuarios.perfil, 'PROFISSIONAL_SAUDE')));
      }
      usuariosRemovidos = todosUsuariosIds.length;
    } catch (err) {
      console.error('Erro ao remover usuários no rollback:', err);
    }
  }

  // Auditoria do Rollback
  const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '127.0.0.1';
  await registrarAuditoria(db, {
    userId: usuarioLogado.userId,
    acao: 'DELETE',
    entidade: 'Atendimento',
    entidadeId: `rollback-${importacaoId}`,
    diffPosterior: {
      importacaoId,
      atendimentosRemovidos,
      pacientesRemovidos,
      usuariosRemovidos,
    },
    ip,
  });

  return c.json({
    sucesso: true,
    mensagem: 'Rollback executado com sucesso. Todos os dados desta sessão foram excluídos.',
    revertidos: {
      atendimentos: atendimentosRemovidos,
      pacientes: pacientesRemovidos,
      usuarios: usuariosRemovidos,
    },
  });
});

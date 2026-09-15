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
import { middlewareAutenticacao, type AppVariables } from '../../middlewares/autenticacao.js';
import { autorizarPerfis } from '../../middlewares/autorizacao.js';
import { registrarAuditoria } from '../../middlewares/auditoria.js';
import {
  Especialidade,
  StatusAtendimento,
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

const normalizarCpf = (valor?: string | null): string => {
  if (!valor) return '';
  const limpo = valor.replace(/\D/g, '');
  if (limpo.length > 0 && limpo.length < 11) {
    return limpo.padStart(11, '0');
  }
  return limpo.slice(0, 11);
};

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

/**
 * O Cloudflare D1 limita estritamente cada query a 100 parâmetros SQL vinculados (?1 .. ?100).
 * Em operações de inserção em lote, o total de variáveis geradas pelo ORM é (linhas * colunas).
 * Exemplo: 10 pacientes com 15 colunas geram 150 variáveis (> 100), provocando D1_ERROR: too many SQL variables.
 *
 * Esta função particiona os registros em sub-lotes garantindo que nenhuma query individual exceda o teto
 * seguro de parâmetros (padrão: 75 parâmetros por query).
 */
export async function inserirEmSubLotesSeguros<T extends Record<string, any>>(
  db: any,
  tabela: any,
  registros: T[],
  maxParametrosPorQuery = 75
): Promise<void> {
  if (!registros || registros.length === 0) return;
  const colunasPorLinha = Math.max(1, Object.keys(registros[0]).length);
  const linhasPorSubLote = Math.max(1, Math.floor(maxParametrosPorQuery / colunasPorLinha));

  for (let i = 0; i < registros.length; i += linhasPorSubLote) {
    const chunk = registros.slice(i, i + linhasPorSubLote);
    await db.insert(tabela).values(chunk).onConflictDoNothing();
  }
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
});

const processarLoteSchema = z.object({
  importacaoId: z.string().min(1).default(() => `imp_${Date.now()}`),
  itens: z.array(itemImportacaoSchema).min(1).max(250),
  opcoes: z
    .object({
      criarProfissionalSeNaoExistir: z.boolean().default(true),
      turmaPadrao: z.string().default('Geral'),
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
      columns: { id: true, nome: true },
    });

    const mapaEscolasPorNomeNorm = new Map<string, typeof todasEscolas[number]>();
    for (const esc of todasEscolas) {
      mapaEscolasPorNomeNorm.set(normalizarTexto(esc.nome), esc);
    }

    // 2. Cache em memória dos usuários/profissionais existentes
    const todosUsuarios = await db.query.usuarios.findMany({
      columns: { id: true, nomeCompleto: true, perfil: true, especialidade: true },
    });

    const mapaUsuarios = new Map<string, typeof todosUsuarios[number]>();
    for (const u of todosUsuarios) {
      const uNorm = normalizarTexto(u.nomeCompleto);
      const uCanonico = extrairNomeCanonicoProfissional(u.nomeCompleto);
      mapaUsuarios.set(uNorm, u);
      if (uCanonico) {
        mapaUsuarios.set(uCanonico, u);
      }
    }

    // Hash seguro constante para profissionais auto-provisionados em lote (0ms CPU, impede HTTP 503)
    const HASH_SENHA_AUTO_PROVISIONADO =
      'pbkdf2:sha512:5000:00000000000000000000000000000000:00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

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

    // 3. Pré-cálculo em lote de hashes CPF e busca única de pacientes pré-existentes
    const mapaCpfParaHash = new Map<string, string>();
    const cpfsValidos = itens
      .map((item) => normalizarCpf(item.pacienteCpf))
      .filter((cpf) => cpf.length === 11);

    const cpfsUnicos = Array.from(new Set(cpfsValidos));
    if (cpfsUnicos.length > 0) {
      const hashesGerados = await Promise.all(
        cpfsUnicos.map((cpf) => gerarBlindIndex(cpf, kekHex))
      );
      cpfsUnicos.forEach((cpf, idx) => {
        mapaCpfParaHash.set(cpf, hashesGerados[idx]);
      });
    }

    const mapaPacientesPorHash = new Map<string, string>();
    const todosHashes = Array.from(new Set(mapaCpfParaHash.values()));
    if (todosHashes.length > 0) {
      // Chunking para inArray em sub-lotes de 50 para respeitar o limite estrito de 100 parâmetros do D1
      for (let i = 0; i < todosHashes.length; i += 50) {
        const chunkHashes = todosHashes.slice(i, i + 50);
        const pacientesExistentes = await db
          .select({
            id: pacientes.id,
            cpfHash: pacientes.cpfHash,
            ativo: pacientes.ativo,
          })
          .from(pacientes)
          .where(inArray(pacientes.cpfHash, chunkHashes));

        const pacientesInativosIds: string[] = [];
        for (const p of pacientesExistentes) {
          if (p.cpfHash) {
            mapaPacientesPorHash.set(p.cpfHash, p.id);
            if (!p.ativo) {
              pacientesInativosIds.push(p.id);
            }
          }
        }

        // Reativa silenciosamente pacientes pré-existentes que estavam marcados como inativos
        if (pacientesInativosIds.length > 0) {
          for (let j = 0; j < pacientesInativosIds.length; j += 50) {
            const chunkInativos = pacientesInativosIds.slice(j, j + 50);
            await db
              .update(pacientes)
              .set({ ativo: true, atualizadoEm: new Date().toISOString() })
              .where(inArray(pacientes.id, chunkInativos));
          }
        }
      }
    }

    // 4. Pré-busca em lote de atendimentos para os pacientes conhecidos (evita N queries e respeita D1)
    const idsPacientesConhecidos = Array.from(new Set(mapaPacientesPorHash.values()));
    const setConsultasExistentesBanco = new Set<string>();
    if (idsPacientesConhecidos.length > 0) {
      for (let i = 0; i < idsPacientesConhecidos.length; i += 50) {
        const chunkIds = idsPacientesConhecidos.slice(i, i + 50);
        const atendimentosBanco = await db.query.atendimentos.findMany({
          where: inArray(atendimentos.pacienteId, chunkIds),
          columns: { pacienteId: true, especialidade: true },
        });
        for (const at of atendimentosBanco) {
          setConsultasExistentesBanco.add(`${at.pacienteId}:${at.especialidade}`);
        }
      }
    }

    const novosUsuariosParaInserir: Array<typeof usuarios.$inferInsert> = [];
    const novosPacientesParaInserir: Array<typeof pacientes.$inferInsert> = [];
    const novosConsentimentosParaInserir: Array<typeof consentimentos.$inferInsert> = [];
    const novosAtendimentosParaInserir: Array<typeof atendimentos.$inferInsert> = [];

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

        // 3. Se ainda não existir no sistema, provisiona como PROFISSIONAL_SAUDE ativo em lote
        // garantindo que a consulta fique 100% vinculada a ele sem round-trip individual
        if (!profissional) {
          const novoUserId = crypto.randomUUID();
          const slugNome = (nomeProfissionalCanonico || 'prof').replace(/[^a-z0-9]/g, '.');
          const slugImportacao = importacaoId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
          const emailAuto = `prof.${slugNome}.${slugImportacao}.${novoUserId.slice(0, 8)}@catraki.saude`;

          const novoUsuarioObj = {
            id: novoUserId,
            email: emailAuto,
            senhaHash: HASH_SENHA_AUTO_PROVISIONADO,
            nomeCompleto: sanitizarTexto(nomeOriginalProfissional),
            perfil: 'PROFISSIONAL_SAUDE' as const,
            especialidade: especialidadeEnum,
            ativo: true,
          };

          novosUsuariosParaInserir.push(novoUsuarioObj);
          profissional = novoUsuarioObj as unknown as typeof todosUsuarios[number];
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
          const cpfHash = mapaCpfParaHash.get(cpfLimpo) ?? (await gerarBlindIndex(cpfLimpo, kekHex));
          const idExistente = mapaPacientesPorHash.get(cpfHash);
          if (idExistente) {
            pacienteId = idExistente;
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
            cpfLimpo.length === 11
              ? (mapaCpfParaHash.get(cpfLimpo) ?? (await gerarBlindIndex(cpfLimpo, kekHex)))
              : null;

          const novoPacienteId = crypto.randomUUID();
          const novoPacienteObj = {
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
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
          };

          novosPacientesParaInserir.push(novoPacienteObj);
          novosConsentimentosParaInserir.push({
            id: crypto.randomUUID(),
            pacienteId: novoPacienteId,
            consentidoPor: 'Importação de Planilha',
            dataConsentimento: new Date().toISOString(),
            referenciaDocumento: `sess:${importacaoId}`,
            consentimentoDispensado: true,
            justificativaDispensa: `Importado na sessão ${importacaoId}`,
          });
          pacienteId = novoPacienteId;
          if (cpfHash) {
            mapaPacientesPorHash.set(cpfHash, novoPacienteId);
          }
          pacientesCriados++;
          pacientesCriadosIds.push(novoPacienteId);
        }

        // ── D. Criação da Consulta (Atendimento com Unicidade por Especialidade) ─
        const statusEnum = item.situacao
          ? mapearStatusAtendimento(item.situacao)
          : (opcoes.statusPadrao as StatusAtendimento) || StatusAtendimento.CONCLUIDO;

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

        // 2. Checagem no cache em lote de atendimentos pré-existentes no banco
        if (setConsultasExistentesBanco.has(chavePacienteEspecialidade)) {
          falhas.push({
            linha: item.linhaOriginal,
            erro: `Consulta duplicada ignorada: o paciente já possui uma consulta prévia cadastrada na especialidade "${especialidadeEnum}". Cada CPF/aluno só pode ter 1 consulta por especialidade.`,
            detalhe: item.pacienteNome ? `Paciente: ${item.pacienteNome}` : undefined,
          });
          continue;
        }

        // 3. Marca como processada na sessão e no cache do banco para garantir unicidade estrita
        consultasProcessadasSessao.add(chavePacienteEspecialidade);
        setConsultasExistentesBanco.add(chavePacienteEspecialidade);

        const atendimentoId = crypto.randomUUID();
        // Prefixo de sessão que garante identificação unívoca para cancelamento atômico
        const chaveIdempotencia = `sess:${importacaoId}:${item.linhaOriginal}:${atendimentoId}`;
        const dataAtendimentoIso = normalizarDataIso(item.dataAtendimento);
        const dataCriacao = dataAtendimentoIso
          ? `${dataAtendimentoIso}T09:00:00-03:00`
          : new Date().toISOString();

        novosAtendimentosParaInserir.push({
          id: atendimentoId,
          pacienteId,
          escolaLocalId: escola.id,
          usuarioId: profissional.id,
          especialidade: especialidadeEnum,
          status: statusEnum,
          resumo: `Atendimento importado via planilha. Situação original: ${item.situacao || 'Concluído'}. Profissional: ${item.profissionalNome}.`,
          chaveIdempotencia,
          criadoEm: dataCriacao,
          atualizadoEm: dataCriacao,
        });

        atendimentosCriados++;
        atendimentosCriadosIds.push(atendimentoId);
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
              atendimentosCriados: 0,
              pacientesCriados: 0,
              pacientesReaproveitados,
              profissionaisCriados: 0,
              atendimentosCriadosIds: [],
              pacientesCriadosIds: [],
              profissionaisCriadosIds: [],
              totalFalhas: falhas.length,
              falhas,
            },
            422
          );
        }
      }
    }

    // ── E. Execução em Lote com Ordem Estrita de Chaves Estrangeiras no Cloudflare D1 ───
    // D1/SQLite exige que os registros pais existam no banco antes dos dependentes (Foreign Keys):
    // 1. usuarios (profissionais de saúde) - sem FK pendente
    // 2. pacientes (alunos) - depende de escolaLocalId (já existente no banco)
    // 3. consentimentos - depende de pacienteId (inserido no passo 2)
    // 4. atendimentos - depende de pacienteId, usuarioId e escolaLocalId (inseridos nos passos 1 e 2)
    //
    // LIMITAÇÃO CRÍTICA DO CLOUDFLARE D1:
    // O Cloudflare D1 limita cada consulta a no máximo 100 variáveis SQL vinculadas (?1 .. ?100).
    // Para inserções em massa, o total de variáveis geradas pelo ORM é (linhas * colunas).
    // Exemplo: 10 pacientes com 15 colunas geram 150 variáveis (> 100), provocando o erro
    // "D1_ERROR: too many SQL variables at offset 550: SQLITE_ERROR".
    // Usamos inserirEmSubLotesSeguros para nunca ultrapassar 75 variáveis por query.
    try {
      if (novosUsuariosParaInserir.length > 0) {
        await inserirEmSubLotesSeguros(db, usuarios, novosUsuariosParaInserir);
      }
      if (novosPacientesParaInserir.length > 0) {
        await inserirEmSubLotesSeguros(db, pacientes, novosPacientesParaInserir);
      }
      if (novosConsentimentosParaInserir.length > 0) {
        await inserirEmSubLotesSeguros(db, consentimentos, novosConsentimentosParaInserir);
      }
      if (novosAtendimentosParaInserir.length > 0) {
        await inserirEmSubLotesSeguros(db, atendimentos, novosAtendimentosParaInserir);
      }
    } catch (erroBanco: any) {
      const detalheErro =
        erroBanco?.cause?.message ||
        erroBanco?.message ||
        'Erro desconhecido de banco de dados';
      console.error('Erro na gravação em lote no D1:', detalheErro, erroBanco);
      return c.json(
        {
          sucesso: false,
          abortado: true,
          importacaoId,
          erro: `Falha na gravação em lote no banco de dados: ${detalheErro}.`,
          totalProcessados,
          atendimentosCriados: 0,
          pacientesCriados: 0,
          pacientesReaproveitados,
          profissionaisCriados: 0,
          atendimentosCriadosIds,
          pacientesCriadosIds,
          profissionaisCriadosIds,
          totalFalhas: falhas.length + 1,
          falhas: [
            ...falhas,
            { linha: 0, erro: detalheErro },
          ],
        },
        500
      );
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
  const prefixoSessao = `sess:${importacaoId}`;
  const slugImportacao = importacaoId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);

  const errosOcorridos: string[] = [];
  let atendimentosRemovidos = 0;
  let pacientesRemovidos = 0;
  let usuariosRemovidos = 0;

  // ─── 1. Identificar TODOS os pacientes criados nesta sessão ─────────────────
  const setPacientesIds = new Set<string>(pacienteIds.filter(Boolean));
  try {
    const consentimentosSessao = await db.query.consentimentos.findMany({
      where: eq(consentimentos.referenciaDocumento, prefixoSessao),
      columns: { pacienteId: true },
    });
    for (const cs of consentimentosSessao) {
      if (cs.pacienteId) setPacientesIds.add(cs.pacienteId);
    }
  } catch (err: any) {
    errosOcorridos.push(`Erro ao identificar consentimentos da sessão: ${err?.message}`);
  }

  // ─── 2. Identificar TODOS os atendimentos criados nesta sessão ───────────────
  const setAtendimentosIds = new Set<string>(atendimentoIds.filter(Boolean));
  try {
    const atendimentosSessao = await db.query.atendimentos.findMany({
      where: like(atendimentos.chaveIdempotencia, `${prefixoSessao}:%`),
      columns: { id: true, pacienteId: true },
    });
    for (const at of atendimentosSessao) {
      if (at.id) setAtendimentosIds.add(at.id);
    }
  } catch (err: any) {
    errosOcorridos.push(`Erro ao identificar atendimentos da sessão: ${err?.message}`);
  }

  // ─── 3. Identificar TODOS os profissionais criados nesta sessão ─────────────
  const setUsuariosIds = new Set<string>(usuarioIds.filter(Boolean));
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
  } catch (err: any) {
    errosOcorridos.push(`Erro ao identificar profissionais da sessão: ${err?.message}`);
  }

  const todosPacientesIds = Array.from(setPacientesIds);
  const todosAtendimentoIds = Array.from(setAtendimentosIds);
  const todosUsuariosIds = Array.from(setUsuariosIds);

  // ─── PASSO 1: Remover Atendimentos (Elimina FKs dependentes de Pacientes e Usuários) ───
  try {
    // 1A. Exclusão por chave de idempotência da sessão
    const del1 = await db
      .delete(atendimentos)
      .where(like(atendimentos.chaveIdempotencia, `${prefixoSessao}:%`))
      .returning({ id: atendimentos.id });
    atendimentosRemovidos += del1.length;

    // 1B. Exclusão por IDs acumulados de atendimentos restantes
    if (todosAtendimentoIds.length > 0) {
      for (let i = 0; i < todosAtendimentoIds.length; i += 50) {
        const slice = todosAtendimentoIds.slice(i, i + 50);
        const del2 = await db
          .delete(atendimentos)
          .where(inArray(atendimentos.id, slice))
          .returning({ id: atendimentos.id });
        atendimentosRemovidos += del2.length;
      }
    }

    // 1C. Exclusão de atendimentos vinculados aos pacientes criados nesta sessão
    if (todosPacientesIds.length > 0) {
      for (let i = 0; i < todosPacientesIds.length; i += 50) {
        const slice = todosPacientesIds.slice(i, i + 50);
        const del3 = await db
          .delete(atendimentos)
          .where(inArray(atendimentos.pacienteId, slice))
          .returning({ id: atendimentos.id });
        atendimentosRemovidos += del3.length;
      }
    }
  } catch (err: any) {
    console.error('Erro ao remover atendimentos no rollback:', err);
    errosOcorridos.push(`Erro ao remover atendimentos: ${err?.message}`);
  }

  // ─── PASSO 2: Remover Consentimentos dos Pacientes da Sessão ────────────────
  try {
    await db
      .delete(consentimentos)
      .where(eq(consentimentos.referenciaDocumento, prefixoSessao));

    if (todosPacientesIds.length > 0) {
      for (let i = 0; i < todosPacientesIds.length; i += 50) {
        const slice = todosPacientesIds.slice(i, i + 50);
        await db.delete(consentimentos).where(inArray(consentimentos.pacienteId, slice));
      }
    }
  } catch (err: any) {
    console.error('Erro ao remover consentimentos no rollback:', err);
    errosOcorridos.push(`Erro ao remover consentimentos: ${err?.message}`);
  }

  // ─── PASSO 3: Remover Pacientes da Sessão (Agora sem FKs em Atendimentos ou Consentimentos) ───
  if (todosPacientesIds.length > 0) {
    try {
      for (let i = 0; i < todosPacientesIds.length; i += 50) {
        const slice = todosPacientesIds.slice(i, i + 50);
        const delPac = await db
          .delete(pacientes)
          .where(inArray(pacientes.id, slice))
          .returning({ id: pacientes.id });
        pacientesRemovidos += delPac.length;
      }
    } catch (err: any) {
      console.error('Erro ao remover pacientes no rollback:', err);
      errosOcorridos.push(`Erro ao remover pacientes: ${err?.message}`);
    }
  }

  // ─── PASSO 4: Remover Profissionais Auto-criados na Sessão ──────────────────
  if (todosUsuariosIds.length > 0) {
    try {
      for (let i = 0; i < todosUsuariosIds.length; i += 50) {
        const slice = todosUsuariosIds.slice(i, i + 50);
        const delUsr = await db
          .delete(usuarios)
          .where(and(inArray(usuarios.id, slice), eq(usuarios.perfil, 'PROFISSIONAL_SAUDE')))
          .returning({ id: usuarios.id });
        usuariosRemovidos += delUsr.length;
      }
    } catch (err: any) {
      console.error('Erro ao remover usuários no rollback:', err);
      errosOcorridos.push(`Erro ao remover profissionais: ${err?.message}`);
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
      erros: errosOcorridos,
    },
    ip,
  });

  if (errosOcorridos.length > 0) {
    return c.json(
      {
        sucesso: false,
        erro: `Falha na exclusão de registros durante o rollback: ${errosOcorridos.join('; ')}`,
        revertidos: {
          atendimentos: atendimentosRemovidos,
          pacientes: pacientesRemovidos,
          usuarios: usuariosRemovidos,
        },
      },
      500
    );
  }

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

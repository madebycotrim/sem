import { randomUUID } from 'node:crypto';
import { logger } from '../logger/pino.js';

/**
 * Interface compatível com o PrismaClient.
 */
export interface IPrismaClient {
  user: any;
  schoolLocation: any;
  patient: any;
  consent: any;
  attendanceRecord: any;
  accessLog: any;
  auditLog: any;
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
}

/**
 * Cria uma camada de repositório em memória para desenvolvimento / scaffolding
 * quando o Prisma Client ainda não teve seus binários gerados.
 */
function criarPrismaInMemory(): IPrismaClient {
  logger.warn(
    '⚠️  Usando repositório Prisma in-memory (modo offline/scaffolding).'
  );

  const dadosUsuarios = new Map<string, any>([
    [
      'admin@saudeemmovimento.dev',
      {
        id: 'user-admin-001',
        email: 'admin@saudeemmovimento.dev',
        senhaHash: 'hash-dev',
        nomeCompleto: 'Administrador (Dev)',
        perfil: 'ADMIN',
        mfaAtivo: false,
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      },
    ],
    [
      'triador@saudeemmovimento.dev',
      {
        id: 'user-triador-001',
        email: 'triador@saudeemmovimento.dev',
        senhaHash: 'hash-dev',
        nomeCompleto: 'Triador de Campo',
        perfil: 'TRIADOR',
        mfaAtivo: false,
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      },
    ],
    [
      'medico@saudeemmovimento.dev',
      {
        id: 'user-medico-001',
        email: 'medico@saudeemmovimento.dev',
        senhaHash: 'hash-dev',
        nomeCompleto: 'Dr. Roberto Medeiros',
        perfil: 'PROFISSIONAL_SAUDE',
        mfaAtivo: false,
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      },
    ],
  ]);

  const dadosEscolas = new Map<string, any>([
    [
      'seed-escola-001',
      {
        id: 'seed-escola-001',
        nome: 'CEF 01 de Brasília',
        endereco: 'SGAS 601, Asa Sul',
        cidade: 'Brasília',
        uf: 'DF',
        ativo: true,
      },
    ],
  ]);

  const dadosPacientes = new Map<string, any>();
  const dadosConsentimentos = new Map<string, any>();
  const dadosAtendimentos = new Map<string, any>();
  const dadosAccessLogs: any[] = [];
  const dadosAuditLogs: any[] = [];

  function criarRepoGenerico(mapa: Map<string, any>) {
    return {
      async findUnique({ where, select }: any) {
        let item = null;
        if (where.id) item = mapa.get(where.id);
        else if (where.email) {
          for (const v of mapa.values()) {
            if (v.email === where.email) {
              item = v;
              break;
            }
          }
        } else if (where.idempotencyKey) {
          for (const v of mapa.values()) {
            if (v.idempotencyKey === where.idempotencyKey) {
              item = v;
              break;
            }
          }
        }
        if (!item) return null;
        if (select) {
          const resultado: any = {};
          for (const k of Object.keys(select)) {
            if (select[k]) resultado[k] = item[k];
          }
          return resultado;
        }
        return { ...item };
      },
      async findMany({ where, skip = 0, take = 50, include }: any = {}) {
        let lista = Array.from(mapa.values());
        if (where) {
          if (where.escolaLocalId) {
            lista = lista.filter((i) => i.escolaLocalId === where.escolaLocalId);
          }
          if (where.especialidade) {
            lista = lista.filter((i) => i.especialidade === where.especialidade);
          }
          if (where.usuarioId) {
            lista = lista.filter((i) => i.usuarioId === where.usuarioId);
          }
          if (where.ativo !== undefined) {
            lista = lista.filter((i) => i.ativo === where.ativo);
          }
        }
        const fatiada = lista.slice(skip, skip + take);
        if (include) {
          return fatiada.map((item) => {
            const copia = { ...item };
            if (include.escolaLocal) {
              copia.escolaLocal = dadosEscolas.get(item.escolaLocalId) || {
                nome: 'CEF 01 de Brasília',
              };
            }
            if (include.usuario) {
              copia.usuario = dadosUsuarios.get(item.usuarioId) || {
                nomeCompleto: 'Profissional de Campo',
              };
            }
            return copia;
          });
        }
        return fatiada;
      },
      async create({ data }: any) {
        const id = data.id || randomUUID();
        const novo = {
          id,
          ...data,
          criadoEm: data.criadoEm || new Date(),
          atualizadoEm: new Date(),
        };
        mapa.set(id, novo);
        return novo;
      },
      async upsert({ where, create, update }: any) {
        const existente = await this.findUnique({ where });
        if (existente) {
          const atualizado = { ...existente, ...update, atualizadoEm: new Date() };
          mapa.set(existente.id, atualizado);
          return atualizado;
        }
        return this.create({ data: create });
      },
      async count({ where }: any = {}) {
        return mapa.size;
      },
    };
  }

  return {
    user: criarRepoGenerico(dadosUsuarios),
    schoolLocation: criarRepoGenerico(dadosEscolas),
    patient: criarRepoGenerico(dadosPacientes),
    consent: criarRepoGenerico(dadosConsentimentos),
    attendanceRecord: criarRepoGenerico(dadosAtendimentos),
    accessLog: {
      async create({ data }: any) {
        const id = data.id || randomUUID();
        const novo = { id, ...data, criadoEm: new Date() };
        dadosAccessLogs.push(novo);
        return novo;
      },
      async findMany() {
        return dadosAccessLogs;
      },
    },
    auditLog: {
      async create({ data }: any) {
        const id = data.id || randomUUID();
        const novo = { id, ...data, criadoEm: new Date() };
        dadosAuditLogs.push(novo);
        return novo;
      },
      async findMany() {
        return dadosAuditLogs;
      },
    },
    async $connect() {},
    async $disconnect() {},
  };
}

let prismaInstancia: IPrismaClient;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require('@prisma/client');
  prismaInstancia = new PrismaClient({
    log:
      process.env['NODE_ENV'] === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
  });
} catch {
  prismaInstancia = criarPrismaInMemory();
}

export const prisma = prismaInstancia;

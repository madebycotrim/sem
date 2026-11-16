import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import type { Bindings } from '../../functions/config/env.js';
import { rotasV1 } from '../../functions/rotas/v1/index.js';

const app = new Hono<{ Bindings: Bindings }>();
app.route('/api/v1', rotasV1);

const JWT_SECRET = 'a'.repeat(64);
const KEK_HEX = 'b'.repeat(64);

function criarEnv(mockDb: any): Bindings {
  return {
    DB: mockDb,
    JWT_SECRET,
    KEK_HEX,
    CORS_ORIGINS: 'http://localhost',
    NODE_ENV: 'test',
  } as unknown as Bindings;
}

describe('Sigilo Médico, MFA e Regras de Cancelamento/Reativação', () => {
  it('deve bloquear acesso à API com 403 MFA_PENDENTE quando mfaAtivo=true e mfaVerificado não validado', async () => {
    const tokenSemMfa = await sign(
      {
        userId: 'admin-1',
        email: 'admin@saude.dev',
        perfil: 'ADMIN',
        jti: 'jti-mfa-1',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      JWT_SECRET
    );

    const mockDb = {
      query: {
        tokensRevogados: { findFirst: vi.fn().mockResolvedValue(null) },
        usuarios: {
          findFirst: vi.fn().mockResolvedValue({
            ativo: true,
            perfil: 'ADMIN',
            mfaAtivo: true,
          }),
        },
      },
    };

    const res = await app.request(
      '/api/v1/atendimentos/atend-1',
      { headers: { Authorization: `Bearer ${tokenSemMfa}` } },
      criarEnv(mockDb)
    );

    expect(res.status).toBe(403);
    const body = (await res.json()) as { codigo?: string };
    expect(body.codigo).toBe('MFA_PENDENTE');
  });

  it('deve ocultar resumo e procedimentos (sigiloRestrito=true) em GET /atendimentos/:id para quem não é o profissional responsável', async () => {
    const tokenAdmin = await sign(
      {
        userId: 'admin-1',
        email: 'admin@saude.dev',
        perfil: 'ADMIN',
        mfaVerificado: true,
        jti: 'jti-admin-1',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      JWT_SECRET
    );

    const mockDb = {
      query: {
        tokensRevogados: { findFirst: vi.fn().mockResolvedValue(null) },
        usuarios: {
          findFirst: vi.fn().mockResolvedValue({
            ativo: true,
            perfil: 'ADMIN',
            mfaAtivo: false,
          }),
        },
        atendimentos: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'atend-1',
            pacienteId: 'pac-1',
            escolaLocalId: 'esc-1',
            usuarioId: 'medico-1',
            especialidade: 'PSICOLOGIA',
            status: 'CONCLUIDO',
            resumo: 'Evolução clínica confidencial do paciente.',
            procedimentos: 'Atendimento individual.',
          }),
        },
      },
    };

    const res = await app.request(
      '/api/v1/atendimentos/atend-1',
      { headers: { Authorization: `Bearer ${tokenAdmin}` } },
      criarEnv(mockDb)
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { resumo: string | null; procedimentos: string | null; sigiloRestrito: boolean };
    expect(body.sigiloRestrito).toBe(true);
    expect(body.resumo).toBeNull();
    expect(body.procedimentos).toBeNull();
  });

  it('deve permitir ao próprio profissional responsável visualizar seu prontuário em GET /atendimentos/:id', async () => {
    const tokenMedico = await sign(
      {
        userId: 'medico-1',
        email: 'medico@saude.dev',
        perfil: 'PROFISSIONAL_SAUDE',
        jti: 'jti-med-1',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      JWT_SECRET
    );

    const mockDb = {
      query: {
        tokensRevogados: { findFirst: vi.fn().mockResolvedValue(null) },
        usuarios: {
          findFirst: vi.fn().mockResolvedValue({
            ativo: true,
            perfil: 'PROFISSIONAL_SAUDE',
            mfaAtivo: false,
          }),
        },
        atendimentos: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'atend-1',
            pacienteId: 'pac-1',
            escolaLocalId: 'esc-1',
            usuarioId: 'medico-1',
            especialidade: 'PSICOLOGIA',
            status: 'CONCLUIDO',
            resumo: 'Evolução clínica confidencial do paciente.',
            procedimentos: 'Atendimento individual.',
          }),
        },
      },
    };

    const res = await app.request(
      '/api/v1/atendimentos/atend-1',
      { headers: { Authorization: `Bearer ${tokenMedico}` } },
      criarEnv(mockDb)
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { resumo: string | null; procedimentos: string | null; sigiloRestrito: boolean };
    expect(body.sigiloRestrito).toBe(false);
    expect(body.resumo).toBe('Evolução clínica confidencial do paciente.');
  });

  it('deve bloquear reativação de consulta cancelada com 409 quando já existe outra consulta ativa/concluída na especialidade', async () => {
    const tokenAdmin = await sign(
      {
        userId: 'admin-1',
        email: 'admin@saude.dev',
        perfil: 'ADMIN',
        jti: 'jti-admin-2',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      JWT_SECRET
    );

    const mockFindFirstAtendimentos = vi
      .fn()
      // 1a chamada: busca o atendimento cancelado sendo reativado
      .mockResolvedValueOnce({
        id: 'atend-cancelado',
        status: 'CANCELADO',
        usuarioId: 'medico-1',
        pacienteId: 'pac-1',
        especialidade: 'PSICOLOGIA',
      })
      // 2a chamada: verificarConflitoEspecialidadeAtiva encontra outra consulta ativa
      .mockResolvedValueOnce({
        id: 'atend-ativo',
        status: 'CONFIRMADO',
        especialidade: 'PSICOLOGIA',
      });

    const mockDb = {
      query: {
        tokensRevogados: { findFirst: vi.fn().mockResolvedValue(null) },
        usuarios: {
          findFirst: vi.fn().mockResolvedValue({
            ativo: true,
            perfil: 'ADMIN',
            mfaAtivo: false,
          }),
        },
        atendimentos: { findFirst: mockFindFirstAtendimentos },
      },
    };

    const res = await app.request(
      '/api/v1/atendimentos/atend-cancelado/status',
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${tokenAdmin}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CONFIRMADO' }),
      },
      criarEnv(mockDb)
    );

    expect(res.status).toBe(409);
    const body = (await res.json()) as { erro?: string };
    expect(body.erro).toContain('PSICOLOGIA');
  });
});

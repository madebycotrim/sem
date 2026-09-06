import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import type { Bindings } from '../../functions/config/env.js';
import { rotasV1 } from '../../functions/rotas/v1/index.js';
import { gerarHashSenha } from '../../functions/infraestrutura/criptografia/senha.js';
import { sign } from 'hono/jwt';

const app = new Hono<{ Bindings: Bindings }>();
app.route('/api/v1', rotasV1);

describe('Rotas de Autenticação (Cloudflare Pages Functions + D1 PT-BR)', () => {
  const mockJwtSecret = 'a'.repeat(64);
  const mockKekHex = 'b'.repeat(64);

  it('deve realizar login com credenciais válidas e definir Cookie seguro', async () => {
    const senhaHash = await gerarHashSenha('SenhaCorreta@123');

    const mockPrisma = {
      usuario: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'user-001',
          email: 'medico@saude.dev',
          senhaHash,
          nomeCompleto: 'Dr. Teste',
          perfil: 'PROFISSIONAL_SAUDE',
          ativo: true,
          mfaAtivo: false,
        }),
      },
    };

    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'medico@saude.dev',
        senha: 'SenhaCorreta@123',
      }),
    }, {
      JWT_SECRET: mockJwtSecret,
      KEK_HEX: mockKekHex,
      CORS_ORIGINS: 'http://localhost:5173',
      DB: mockPrisma,
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.usuario.email).toBe('medico@saude.dev');
    expect(body.usuario.perfil).toBe('PROFISSIONAL_SAUDE');
    expect(body.token).toBeTruthy();

    const cookie = res.headers.get('set-cookie');
    expect(cookie).toContain('token=');
    expect(cookie).toContain('HttpOnly');
  });

  it('deve rejeitar login com senha incorreta', async () => {
    const senhaHash = await gerarHashSenha('SenhaCorreta@123');

    const mockPrisma = {
      usuario: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'user-001',
          email: 'medico@saude.dev',
          senhaHash,
          ativo: true,
          mfaAtivo: false,
        }),
      },
    };

    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'medico@saude.dev',
        senha: 'SenhaErrada@999',
      }),
    }, {
      JWT_SECRET: mockJwtSecret,
      KEK_HEX: mockKekHex,
      CORS_ORIGINS: 'http://localhost:5173',
      DB: mockPrisma,
    });

    expect(res.status).toBe(401);
    const body = (await res.json()) as any;
    expect(body.erro).toBe('Credenciais inválidas.');
  });

  it('deve realizar logout com sucesso e limpar cookie', async () => {
    const res = await app.request('/api/v1/auth/logout', {
      method: 'POST',
    }, {
      JWT_SECRET: mockJwtSecret,
      KEK_HEX: mockKekHex,
      CORS_ORIGINS: 'http://localhost:5173',
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.mensagem).toBe('Logout realizado com sucesso.');
    expect(res.headers.get('set-cookie')).toContain('Max-Age=0');
  });

  it('deve obter dados de /me quando autenticado com JWT válido', async () => {
    const token = await sign(
      {
        userId: 'user-001',
        email: 'medico@saude.dev',
        perfil: 'PROFISSIONAL_SAUDE',
        mfaVerificado: true,
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      mockJwtSecret,
      'HS256'
    );

    const mockPrisma = {
      usuario: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'user-001',
          email: 'medico@saude.dev',
          nomeCompleto: 'Dr. Teste',
          perfil: 'PROFISSIONAL_SAUDE',
          ativo: true,
          mfaAtivo: false,
          criadoEm: new Date(),
        }),
      },
    };

    const res = await app.request('/api/v1/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, {
      JWT_SECRET: mockJwtSecret,
      KEK_HEX: mockKekHex,
      CORS_ORIGINS: 'http://localhost:5173',
      DB: mockPrisma,
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.usuario.id).toBe('user-001');
    expect(body.usuario.nomeCompleto).toBe('Dr. Teste');
  });
});

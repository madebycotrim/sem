import { describe, it, expect, vi } from 'vitest';
import { 
  PerfilAcesso, 
  PERMISSOES_PADRAO, 
  type PermissoesPerfil 
} from '../../compartilhado/index.ts';
import { autorizarAcao, autorizarModulo } from '../../functions/middlewares/autorizacao.js';

/**
 * Funções espelho de avaliação de permissão (as mesmas utilizadas no ContextoPermissoes e no App.tsx)
 */
const resolverPermissoesPerfil = (
  perfil: PerfilAcesso | string,
  permissoesRbac: Partial<Record<PerfilAcesso, PermissoesPerfil>>
): PermissoesPerfil | undefined => {
  if (!perfil) return undefined;
  const pAcesso = perfil as PerfilAcesso;
  const padrao = PERMISSOES_PADRAO[pAcesso];
  const personalizadas = permissoesRbac[pAcesso];
  if (!personalizadas) return padrao;
  return {
    modulos: {
      ...padrao?.modulos,
      ...personalizadas.modulos,
    },
    acoes: {
      ...padrao?.acoes,
      ...personalizadas.acoes,
    },
  };
};

const avaliarAcessoModulo = (
  perfilLogado: string | null,
  modulo: keyof PermissoesPerfil['modulos'],
  permissoesRbac: Partial<Record<PerfilAcesso, PermissoesPerfil>>
): boolean => {
  if (!perfilLogado) return false;
  if (perfilLogado === 'BOOTSTRAP') return true;
  if (perfilLogado === 'ADMIN' && modulo === 'usuarios') return true;
  const config = resolverPermissoesPerfil(perfilLogado, permissoesRbac);
  return config?.modulos[modulo] === 'LIVRE';
};

const avaliarPermissaoAcao = (
  perfilLogado: string | null,
  acao: keyof PermissoesPerfil['acoes'],
  permissoesRbac: Partial<Record<PerfilAcesso, PermissoesPerfil>>
): boolean => {
  if (!perfilLogado) return false;
  if (perfilLogado === 'BOOTSTRAP') return true;
  const config = resolverPermissoesPerfil(perfilLogado, permissoesRbac);
  return config?.acoes[acao] === 'LIVRE';
};

describe('Sistema de Configuração de Permissões (RBAC)', () => {
  describe('Resolução de Permissões no Frontend (App / Contexto)', () => {
    it('deve usar PERMISSOES_PADRAO como fallback quando nenhuma customização estiver salva', () => {
      const permissoesVazias = {};

      // Triagem / Recepção padrão
      expect(avaliarAcessoModulo('TRIAGEM_RECEPCAO', 'pacientes', permissoesVazias)).toBe(true);
      expect(avaliarAcessoModulo('TRIAGEM_RECEPCAO', 'filaDia', permissoesVazias)).toBe(true);
      expect(avaliarAcessoModulo('TRIAGEM_RECEPCAO', 'bi', permissoesVazias)).toBe(false);
      expect(avaliarAcessoModulo('TRIAGEM_RECEPCAO', 'usuarios', permissoesVazias)).toBe(false);

      // Ações padrão da triagem
      expect(avaliarPermissaoAcao('TRIAGEM_RECEPCAO', 'criarPaciente', permissoesVazias)).toBe(true);
      expect(avaliarPermissaoAcao('TRIAGEM_RECEPCAO', 'exportarDados', permissoesVazias)).toBe(false);
    });

    it('deve aplicar restrições configuradas dinamicamente para o perfil ADMINISTRADOR', () => {
      const permissoesCustom: Partial<Record<PerfilAcesso, PermissoesPerfil>> = {
        ADMIN: {
          modulos: {
            ...PERMISSOES_PADRAO.ADMIN.modulos,
            bi: 'BLOQUEADO',
            relatorios: 'BLOQUEADO',
          },
          acoes: {
            ...PERMISSOES_PADRAO.ADMIN.acoes,
            exportarDados: 'BLOQUEADO',
          },
        },
      };

      // Módulos bloqueados dinamicamente no modal
      expect(avaliarAcessoModulo('ADMIN', 'bi', permissoesCustom)).toBe(false);
      expect(avaliarAcessoModulo('ADMIN', 'relatorios', permissoesCustom)).toBe(false);

      // Módulos não bloqueados continuam LIVRE
      expect(avaliarAcessoModulo('ADMIN', 'dashboard', permissoesCustom)).toBe(true);
      expect(avaliarAcessoModulo('ADMIN', 'pacientes', permissoesCustom)).toBe(true);

      // Ações configuradas
      expect(avaliarPermissaoAcao('ADMIN', 'exportarDados', permissoesCustom)).toBe(false);
      expect(avaliarPermissaoAcao('ADMIN', 'criarPaciente', permissoesCustom)).toBe(true);
    });

    it('deve manter proteção anti-bloqueio (anti-lockout) do módulo usuarios para ADMIN', () => {
      // Mesmo se configurado como BLOQUEADO, o módulo usuarios para ADMIN continua livre
      const permissoesComBloqueioAcidental: Partial<Record<PerfilAcesso, PermissoesPerfil>> = {
        ADMIN: {
          modulos: {
            ...PERMISSOES_PADRAO.ADMIN.modulos,
            usuarios: 'BLOQUEADO',
          },
          acoes: { ...PERMISSOES_PADRAO.ADMIN.acoes },
        },
      };

      expect(avaliarAcessoModulo('ADMIN', 'usuarios', permissoesComBloqueioAcidental)).toBe(true);
    });

    it('deve conceder acesso irrestrito ao superusuário BOOTSTRAP incondicionalmente', () => {
      const permissoesTudoBloqueado: Partial<Record<PerfilAcesso, PermissoesPerfil>> = {
        BOOTSTRAP: {
          modulos: {
            dashboard: 'BLOQUEADO',
            bi: 'BLOQUEADO',
            pacientes: 'BLOQUEADO',
            filaDia: 'BLOQUEADO',
            consultas: 'BLOQUEADO',
            escolas: 'BLOQUEADO',
            relatorios: 'BLOQUEADO',
            usuarios: 'BLOQUEADO',
            governanca: 'BLOQUEADO',
          },
          acoes: {
            criarPaciente: 'BLOQUEADO',
            editarPaciente: 'BLOQUEADO',
            arquivarPaciente: 'BLOQUEADO',
            exportarDados: 'BLOQUEADO',
          },
        },
      };

      expect(avaliarAcessoModulo('BOOTSTRAP', 'bi', permissoesTudoBloqueado)).toBe(true);
      expect(avaliarAcessoModulo('BOOTSTRAP', 'relatorios', permissoesTudoBloqueado)).toBe(true);
      expect(avaliarPermissaoAcao('BOOTSTRAP', 'exportarDados', permissoesTudoBloqueado)).toBe(true);
    });
  });

  describe('Middlewares de Autorização no Backend (Hono / Cloudflare Functions)', () => {
    const criarContextoFalso = (perfil: string | null, dbMock: any) => {
      return {
        get: vi.fn((chave: string) => {
          if (chave === 'usuario') {
            return perfil ? { userId: 'user-123', perfil } : null;
          }
          return null;
        }),
        json: vi.fn((dados: any, status: number) => ({ dados, status })),
        env: { DB: dbMock },
      } as any;
    };

    it('autorizarModulo deve liberar acesso quando módulo for permitido no PERMISSOES_PADRAO e sem config no banco', async () => {
      const dbMock = {
        query: {
          configuracoesRbac: {
            findFirst: vi.fn().mockResolvedValue(null),
          },
        },
      };

      const ctx = criarContextoFalso('PROFISSIONAL_SAUDE', dbMock);
      const next = vi.fn().mockResolvedValue(undefined);

      const middleware = autorizarModulo('consultas');
      await middleware(ctx, next);

      expect(next).toHaveBeenCalled();
    });

    it('autorizarModulo deve negar 403 quando módulo for restrito no PERMISSOES_PADRAO', async () => {
      const dbMock = {
        query: {
          configuracoesRbac: {
            findFirst: vi.fn().mockResolvedValue(null),
          },
        },
      };

      const ctx = criarContextoFalso('PROFISSIONAL_SAUDE', dbMock);
      const next = vi.fn().mockResolvedValue(undefined);

      const middleware = autorizarModulo('usuarios');
      await middleware(ctx, next);

      expect(next).not.toHaveBeenCalled();
      expect(ctx.json).toHaveBeenCalledWith(
        expect.objectContaining({ erro: expect.stringContaining('restrito') }),
        403
      );
    });

    it('autorizarAcao deve respeitar configuração customizada persistida no banco D1', async () => {
      const dbMock = {
        query: {
          configuracoesRbac: {
            findFirst: vi.fn().mockResolvedValue({
              acoes: JSON.stringify({ criarPaciente: 'BLOQUEADO' }),
            }),
          },
        },
      };

      // TRIAGEM_RECEPCAO por padrão pode criarPaciente, mas o banco diz BLOQUEADO
      const ctx = criarContextoFalso('TRIAGEM_RECEPCAO', dbMock);
      const next = vi.fn().mockResolvedValue(undefined);

      const middleware = autorizarAcao('criarPaciente');
      await middleware(ctx, next);

      expect(next).not.toHaveBeenCalled();
      expect(ctx.json).toHaveBeenCalledWith(
        expect.objectContaining({ erro: expect.stringContaining('restrita') }),
        403
      );
    });

    it('autorizarAcao deve permitir ação para BOOTSTRAP mesmo se configurado BLOQUEADO', async () => {
      const dbMock = {
        query: {
          configuracoesRbac: {
            findFirst: vi.fn(),
          },
        },
      };

      const ctx = criarContextoFalso('BOOTSTRAP', dbMock);
      const next = vi.fn().mockResolvedValue(undefined);

      const middleware = autorizarAcao('criarPaciente');
      await middleware(ctx, next);

      expect(next).toHaveBeenCalled();
    });
  });
});

import { createContext, useContext, type ReactNode } from 'react';
import { 
  type PermissoesPerfil, 
  type PerfilAcesso, 
  PERMISSOES_PADRAO 
} from '../../compartilhado/index.ts';

interface PermissoesContextData {
  permissoes: Partial<Record<PerfilAcesso, PermissoesPerfil>>;
  perfilLogado: PerfilAcesso | null;
  temAcessoModulo: (modulo: keyof PermissoesPerfil['modulos']) => boolean;
  temPermissaoAcao: (acao: keyof PermissoesPerfil['acoes']) => boolean;
}

const PermissoesContext = createContext<PermissoesContextData>({} as PermissoesContextData);

export const ProvedorPermissoes = ({ 
  children, 
  perfilLogado,
  permissoes,
}: { 
  children: ReactNode; 
  perfilLogado: PerfilAcesso | null;
  permissoes: Partial<Record<PerfilAcesso, PermissoesPerfil>>;
}) => {
  const obterPermissoesPerfil = (perfil: PerfilAcesso): PermissoesPerfil | undefined => {
    const padrao = PERMISSOES_PADRAO[perfil];
    const personalizadas = permissoes[perfil];
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

  const temAcessoModulo = (modulo: keyof PermissoesPerfil['modulos']) => {
    if (!perfilLogado) return false;
    // BOOTSTRAP tem acesso irrestrito
    if (perfilLogado === 'BOOTSTRAP') return true;
    // Prevenção de bloqueio: ADMIN sempre tem acesso ao gerenciamento de usuários/RBAC
    if (perfilLogado === 'ADMIN' && modulo === 'usuarios') return true;
    
    const perfilConfig = obterPermissoesPerfil(perfilLogado);
    return perfilConfig?.modulos[modulo] === 'LIVRE';
  };

  const temPermissaoAcao = (acao: keyof PermissoesPerfil['acoes']) => {
    if (!perfilLogado) return false;
    if (perfilLogado === 'BOOTSTRAP') return true;
    
    const perfilConfig = obterPermissoesPerfil(perfilLogado);
    return perfilConfig?.acoes[acao] === 'LIVRE';
  };

  return (
    <PermissoesContext.Provider value={{ permissoes, perfilLogado, temAcessoModulo, temPermissaoAcao }}>
      {children}
    </PermissoesContext.Provider>
  );
};

export const usePermissoes = () => {
  const context = useContext(PermissoesContext);
  if (!context) {
    throw new Error('usePermissoes deve ser usado dentro de um ProvedorPermissoes');
  }
  return context;
};

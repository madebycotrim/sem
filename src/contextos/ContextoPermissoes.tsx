import { createContext, useContext, type ReactNode } from 'react';
import { type PermissoesPerfil, type PerfilAcesso } from '../../compartilhado/index.ts';

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
  const temAcessoModulo = (modulo: keyof PermissoesPerfil['modulos']) => {
    if (!perfilLogado) return false;
    if (perfilLogado === 'BOOTSTRAP' || perfilLogado === 'ADMIN') return true;
    return permissoes[perfilLogado]?.modulos[modulo] === 'LIVRE';
  };

  const temPermissaoAcao = (acao: keyof PermissoesPerfil['acoes']) => {
    if (!perfilLogado) return false;
    if (perfilLogado === 'BOOTSTRAP' || perfilLogado === 'ADMIN') return true;
    return permissoes[perfilLogado]?.acoes[acao] === 'LIVRE';
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

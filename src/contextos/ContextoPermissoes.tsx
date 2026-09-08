import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { PERMISSOES_PADRAO, type PermissoesPerfil, type PerfilAcesso } from '../../compartilhado/index.ts';

interface PermissoesContextData {
  permissoes: Record<PerfilAcesso, PermissoesPerfil>;
  perfilLogado: PerfilAcesso | null;
  temAcessoModulo: (modulo: keyof PermissoesPerfil['modulos']) => boolean;
  temPermissaoAcao: (acao: keyof PermissoesPerfil['acoes']) => boolean;
}

const PermissoesContext = createContext<PermissoesContextData>({} as PermissoesContextData);

export const ProvedorPermissoes = ({ 
  children, 
  perfilLogado 
}: { 
  children: ReactNode; 
  perfilLogado: PerfilAcesso | null 
}) => {
  const [permissoes, setPermissoes] = useState<Record<PerfilAcesso, PermissoesPerfil>>(() => {
    const salva = localStorage.getItem('permissoes_rbac');
    return salva ? JSON.parse(salva) : PERMISSOES_PADRAO;
  });

  useEffect(() => {
    const handleAtualizacao = () => {
      const salva = localStorage.getItem('permissoes_rbac');
      if (salva) setPermissoes(JSON.parse(salva));
    };
    window.addEventListener('permissoes_atualizadas', handleAtualizacao);
    return () => window.removeEventListener('permissoes_atualizadas', handleAtualizacao);
  }, []);

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

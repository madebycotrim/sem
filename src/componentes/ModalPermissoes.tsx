import { useState, type FC, useEffect } from 'react';
import { Modal, BotaoModal } from './Modal.tsx';
import { 
  PERFIL_ACESSO_LABELS, 
  type PerfilAcesso, 
  type PermissoesPerfil 
} from '../../compartilhado/index.ts';
import { requisicaoApi } from '../servicos/api.ts';
import { Edit3, LayoutGrid, LockKeyhole, ShieldCheck, UserPlus } from 'lucide-react';

interface ModalPermissoesProps {
  aberto: boolean;
  aoFechar: () => void;
}

const NOME_MODULOS: Partial<Record<keyof PermissoesPerfil['modulos'], string>> = {
  dashboard: 'Dashboard (Métricas)',
  bi: 'Painel BI (Analytics)',
  pacientes: 'Cadastro de Pacientes',
  filaDia: 'Fila do Dia (Triagem)',
  consultas: 'Consultas / Atendimentos',
  escolas: 'Instituições de Ensino',
  relatorios: 'Relatórios Gerenciais',
  usuarios: 'Gestão de Usuários (RBAC)',
};

const NOME_ACOES: Record<keyof PermissoesPerfil['acoes'], string> = {
  criarPaciente: 'Cadastrar novos pacientes',
  editarPaciente: 'Editar dados de pacientes',
  arquivarPaciente: 'Arquivar registros de pacientes',
  exportarDados: 'Exportar relatórios em CSV/Excel',
};

// Componente Toggle Customizado
const ToggleSwitch: FC<{ ativo: boolean; desabilitado?: boolean; aoAlternar: () => void }> = ({ ativo, desabilitado, aoAlternar }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ativo}
      disabled={desabilitado}
      onClick={(e) => {
        e.stopPropagation();
        if (!desabilitado) aoAlternar();
      }}
      className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer items-center rounded-full p-1 border transition-all duration-200 ease-out focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-300/60 ${
        desabilitado ? 'opacity-50 cursor-not-allowed' : ''
      } ${
        ativo
          ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 border-blue-600/40 shadow-[0_3px_10px_rgba(37,99,235,0.35)]'
          : 'bg-slate-200/90 border-slate-300/70 hover:bg-slate-300/70'
      }`}
    >
      <span className="sr-only">Alternar configuração</span>
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.25)] ring-0 transition-transform duration-200 ease-out ${
          ativo ? 'translate-x-[22px]' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

export const ModalPermissoes: FC<ModalPermissoesProps> = ({ aberto, aoFechar }) => {
  const perfisParaConfigurar: PerfilAcesso[] = ['ADMIN', 'PROFISSIONAL_SAUDE', 'TRIAGEM_RECEPCAO', 'DPO'];
  const [perfilAtivo, setPerfilAtivo] = useState<PerfilAcesso>('PROFISSIONAL_SAUDE');
  const [estadoPermissoes, setEstadoPermissoes] = useState<Partial<Record<PerfilAcesso, PermissoesPerfil>>>({});
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  // Resetar estado ao abrir
  useEffect(() => {
    let montado = true;
    if (aberto) {
      setSalvo(false);
      const buscarDoServidor = async () => {
        try {
          const res = await requisicaoApi<{ permissoes: Partial<Record<PerfilAcesso, PermissoesPerfil>> }>('/rbac/permissoes');
          if (montado) {
            setEstadoPermissoes(res.permissoes);
          }
        } catch (e) {
          console.error('Falha ao buscar permissoes do servidor', e);
        }
      };
      buscarDoServidor();
    }
    return () => { montado = false; };
  }, [aberto]);

  const permissaoAtual = estadoPermissoes[perfilAtivo];
  const ehAdminGlobal = perfilAtivo === 'ADMIN' || perfilAtivo === 'BOOTSTRAP';

  const alternarModulo = (chave: keyof PermissoesPerfil['modulos']) => {
    if (ehAdminGlobal) return;
    setEstadoPermissoes((prev) => {
      const permissao = prev[perfilAtivo];
      if (!permissao) return prev;
      const valorAtual = permissao.modulos[chave];
      const novoValor = valorAtual === 'LIVRE' ? 'BLOQUEADO' : 'LIVRE';
      return {
        ...prev,
        [perfilAtivo]: {
          ...permissao,
          modulos: {
            ...permissao.modulos,
            [chave]: novoValor,
          },
        },
      };
    });
  };

  const alternarAcao = (chave: keyof PermissoesPerfil['acoes']) => {
    if (ehAdminGlobal) return;
    setEstadoPermissoes((prev) => {
      const permissao = prev[perfilAtivo];
      if (!permissao) return prev;
      const valorAtual = permissao.acoes[chave];
      const novoValor = valorAtual === 'LIVRE' ? 'BLOQUEADO' : 'LIVRE';
      return {
        ...prev,
        [perfilAtivo]: {
          ...permissao,
          acoes: {
            ...permissao.acoes,
            [chave]: novoValor,
          },
        },
      };
    });
  };

  const salvarAlteracoes = async () => {
    setSalvando(true);
    try {
      await requisicaoApi('/rbac/permissoes', {
        metodo: 'PUT',
        corpo: { permissoes: estadoPermissoes }
      });
      window.dispatchEvent(new CustomEvent('permissoes_atualizadas', { detail: estadoPermissoes }));
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
      aoFechar();
    } catch (e) {
      console.error('Erro ao salvar permissoes', e);
      alert('Falha ao salvar permissões no servidor. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Configuração de Permissões"
      subtitulo="Gerencie os acessos de cada perfil do sistema (RBAC)"
      tamanho="3xl"
      icone={<LayoutGrid className="w-5 h-5 text-blue-600" />}
      contentClassName="p-0"
      rodape={
        <>
          <BotaoModal
            variante="secundario"
            rotulo="Fechar"
            aoClicar={aoFechar}
          />
          <BotaoModal
            variante="primario"
            rotulo={salvo ? 'Permissões Salvas!' : 'Salvar Alterações'}
            carregando={salvando}
            aoClicar={salvarAlteracoes}
          />
        </>
      }
    >
      <div className="flex h-[560px] bg-[#f8fafc]">
        {/* Coluna Esquerda: Lista de Perfis */}
        <div className="w-[290px] bg-slate-100/80 border-r border-slate-200/80 flex flex-col pt-3 shrink-0 rounded-bl-[28px]">
          <div className="px-5 py-4 pb-2">
            <h3 className="text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
              Perfis de Acesso
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5">
            {perfisParaConfigurar.map((perfil) => (
              <button
                key={perfil}
                onClick={() => setPerfilAtivo(perfil)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-200 cursor-pointer border select-none ${
                  perfilAtivo === perfil
                    ? 'bg-gradient-to-r from-[#0066ff] to-[#0f6ae8] text-white shadow-[0_6px_18px_rgba(0,102,255,0.30)] border-blue-600/30 font-extrabold'
                    : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 border-transparent font-semibold'
                }`}
              >
                {perfil === 'ADMIN' && (
                  <ShieldCheck className={`w-4 h-4 shrink-0 ${perfilAtivo === perfil ? 'text-blue-100' : 'text-slate-400'}`} />
                )}
                {perfil === 'DPO' && (
                  <LockKeyhole className={`w-4 h-4 shrink-0 ${perfilAtivo === perfil ? 'text-blue-100' : 'text-slate-400'}`} />
                )}
                {perfil === 'PROFISSIONAL_SAUDE' && (
                  <ShieldCheck className={`w-4 h-4 shrink-0 ${perfilAtivo === perfil ? 'text-blue-100' : 'text-slate-400'}`} />
                )}
                {perfil === 'TRIAGEM_RECEPCAO' && (
                  <UserPlus className={`w-4 h-4 shrink-0 ${perfilAtivo === perfil ? 'text-blue-100' : 'text-slate-400'}`} />
                )}
                
                <div className="flex flex-col items-start text-left">
                  <span className="text-[13px] font-bold leading-tight">
                    {PERFIL_ACESSO_LABELS[perfil]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Coluna Direita: Toggles de Permissão */}
        <div className="flex-1 bg-white overflow-y-auto px-3 py-3 rounded-br-[28px]">
          <div className="mb-3 border-b border-slate-200/90 pb-2">
            <h2 className="text-lg font-bold text-slate-800 tracking-[-0.02em]">
              Permissões: {PERFIL_ACESSO_LABELS[perfilAtivo]}
            </h2>
            {ehAdminGlobal ? (
              <p className="text-[11.5px] font-semibold text-amber-700 mt-2 bg-amber-50 border border-amber-100 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5" />
                Acesso total e nativo. Administradores não podem ter permissões revogadas.
              </p>
            ) : (
              <p className="text-[12.5px] text-slate-500 mt-1.5">
                Configure os módulos e ações que este cargo pode realizar.
              </p>
            )}
          </div>

          <div className="space-y-4 pb-2">
            {/* Seção Módulos */}
            <section>
              <h3 className="text-[11px] font-extrabold text-blue-600 uppercase tracking-[0.12em] flex items-center gap-2 mb-3">
                <LayoutGrid className="w-4 h-4 text-blue-500" />
                Acesso aos Módulos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                {(Object.entries(NOME_MODULOS) as [keyof PermissoesPerfil['modulos'], string][]).map(([chave, label]) => {
                  const ativo = permissaoAtual?.modulos[chave] === 'LIVRE';
                  return (
                    <div
                      key={chave}
                      className="flex items-center justify-between p-2.5 bg-slate-50/90 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer group select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                      onClick={() => alternarModulo(chave)}
                    >
                      <span className="text-[13px] font-semibold text-slate-700">
                        {label}
                      </span>
                      <ToggleSwitch
                        ativo={ativo}
                        desabilitado={ehAdminGlobal}
                        aoAlternar={() => alternarModulo(chave)}
                      />
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Seção Ações */}
            <section>
              <h3 className="text-[11px] font-extrabold text-blue-600 uppercase tracking-[0.12em] flex items-center gap-2 mb-3">
                <Edit3 className="w-4 h-4 text-blue-500" />
                Ações Específicas
              </h3>
              <div className="flex flex-col gap-2">
                {(Object.entries(NOME_ACOES) as [keyof PermissoesPerfil['acoes'], string][]).map(([chave, label]) => {
                  const ativo = permissaoAtual?.acoes[chave] === 'LIVRE';
                  return (
                    <div
                      key={chave}
                      className="flex items-center justify-between p-2.5 bg-slate-50/90 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer group select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                      onClick={() => alternarAcao(chave)}
                    >
                      <span className="text-[13px] font-semibold text-slate-700">
                        {label}
                      </span>
                      <ToggleSwitch
                        ativo={ativo}
                        desabilitado={ehAdminGlobal}
                        aoAlternar={() => alternarAcao(chave)}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </Modal>
  );
};

import { useState, type FC, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { PerfilAcesso, PERFIL_ACESSO_LABELS } from '../../compartilhado/index.ts';
import { CabecalhoPagina } from './CabecalhoPagina.tsx';
import {
  useFiltroExcel,
  CabecalhoColunaExcel,
  BarraFiltrosAtivos,
  type ConfiguracaoColuna,
} from './tabelaExcel/index.ts';
import { obterEstiloAvatarGoogle } from '../utilitarios/avatarCor.ts';
import { Paginacao } from './Paginacao.tsx';
import { requisicaoApi } from '../servicos/api.ts';

import { ModalNovoUsuario, type FormNovoUsuario } from './ModalNovoUsuario.tsx';
import { ModalRedefinirSenhaUsuario } from './ModalRedefinirSenhaUsuario.tsx';
import { ModalPermissoes } from './ModalPermissoes.tsx';
import { Botao } from './Botao.tsx';

export interface UsuarioItem {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilAcesso;
  conselhoProfissional?: string;
  registroProfissional?: string;
  especialidade?: string;
  ativo: boolean;
  ultimoAcesso: string | null;
}

const formatarConselhoRegistro = (usuario: UsuarioItem) => {
  const conselho =
    usuario.conselhoProfissional === 'NAO_INFORMADO'
      ? 'Não informado'
      : usuario.conselhoProfissional === 'OUTRO'
        ? 'Outro'
        : usuario.conselhoProfissional
          ? `${usuario.conselhoProfissional}-DF`
          : null;

  return [conselho, usuario.registroProfissional].filter(Boolean).join(' ');
};

export const Usuarios: FC = () => {
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [modalPermissoesAberto, setModalPermissoesAberto] = useState(false);
  const [usuarioRedefinirSenha, setUsuarioRedefinirSenha] = useState<UsuarioItem | null>(null);
  const [menuAcoesAbertoId, setMenuAcoesAbertoId] = useState<string | null>(null);
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioItem | null>(null);
  const [usuarioArquivando, setUsuarioArquivando] = useState<UsuarioItem | null>(null);
  const [arquivando, setArquivando] = useState(false);

  const carregarUsuarios = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      const res = await requisicaoApi<{ dados: UsuarioItem[] }>('/usuarios');
      setUsuarios(res.dados || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setErro('Não foi possível carregar a lista de usuários.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  const colunasConfig = useMemo<ConfiguracaoColuna<UsuarioItem>[]>(
    () => [
      {
        id: 'nome',
        rotulo: 'USUÁRIO',
        tipo: 'texto',
        obterValor: (u) => u.nome,
      },
      {
        id: 'perfil',
        rotulo: 'PERFIL DE ACESSO',
        tipo: 'opcao',
        obterValor: (u) => u.perfil,
        formatarRotulo: (val) => PERFIL_ACESSO_LABELS[val as PerfilAcesso] || String(val),
      },
      {
        id: 'registroProfissional',
        rotulo: 'REGISTRO / ESPECIALIDADE',
        tipo: 'texto',
        obterValor: (u) => formatarConselhoRegistro(u) || u.especialidade || '',
        formatarRotulo: (val) => String(val),
      },
      {
        id: 'ultimoAcesso',
        rotulo: 'ÚLTIMO ACESSO',
        tipo: 'texto',
        obterValor: (u) => u.ultimoAcesso,
      },
    ],
    []
  );

  const filtroExcel = useFiltroExcel<UsuarioItem>({
    dados: usuarios,
    colunas: colunasConfig,
    buscaGeral: busca,
    funcaoBuscaGeral: (item, termo) =>
      item.nome.toLowerCase().includes(termo) ||
      item.email.toLowerCase().includes(termo) ||
      Boolean(item.conselhoProfissional && item.conselhoProfissional.toLowerCase().includes(termo)) ||
      Boolean(item.registroProfissional && item.registroProfissional.toLowerCase().includes(termo)),
  });

  const handleSalvarNovoUsuario = async (dados: FormNovoUsuario) => {
    if (usuarioEditando) {
      await requisicaoApi(`/usuarios/${usuarioEditando.id}`, {
        metodo: 'PUT',
        corpo: {
          nomeCompleto: dados.nomeCompleto,
          perfil: dados.perfil,
          conselhoProfissional: dados.conselhoProfissional,
          registroProfissional: dados.registroProfissional,
          especialidade: dados.especialidade,
        },
      });
    } else {
      await requisicaoApi('/usuarios', {
        metodo: 'POST',
        corpo: {
          nomeCompleto: dados.nomeCompleto,
          email: dados.email,
          perfil: dados.perfil,
          senha: dados.senhaTemporaria,
          conselhoProfissional: dados.conselhoProfissional,
          registroProfissional: dados.registroProfissional,
          especialidade: dados.especialidade,
        },
      });
    }

    await carregarUsuarios();
    setModalAberto(false);
    setUsuarioEditando(null);
  };

  const handleConfirmarArquivamento = async () => {
    if (!usuarioArquivando) return;
    try {
      setArquivando(true);
      await requisicaoApi(`/usuarios/${usuarioArquivando.id}`, {
        metodo: 'PUT',
        corpo: { ativo: false },
      });
      await carregarUsuarios();
    } catch (err) {
      console.error('Erro ao arquivar usuário:', err);
    } finally {
      setArquivando(false);
      setUsuarioArquivando(null);
    }
  };

  const { dadosFiltrados, temAlgumFiltroAtivo } = filtroExcel;
  const totalPaginas = Math.max(1, Math.ceil(dadosFiltrados.length / itensPorPagina));
  const paginaCorrigida = Math.min(paginaAtual, totalPaginas);
  const indiceInicio = (paginaCorrigida - 1) * itensPorPagina;
  const dadosPaginados = dadosFiltrados.slice(indiceInicio, indiceInicio + itensPorPagina);

  return (
    <div className="flex flex-col flex-1 animate-fade-in font-sans">
      {/* ─── Cabeçalho Fixo Modular ───────────────────────────────────────── */}
      <CabecalhoPagina
        titulo="Gestão de Usuários e Equipe"
        subtitulo="CONTROLE DE ACESSO RBAC (PAPÉIS) E PROFISSIONAIS REGISTRADOS"
        busca={{
          valor: busca,
          aoMudar: setBusca,
          placeholder: 'Buscar usuário por nome ou email...',
        }}
        acaoPrimaria={{
          rotulo: 'Convidar Profissional',
          aoClicar: () => setModalAberto(true),
        }}
        acoesExtras={
          <button
            type="button"
            onClick={() => setModalPermissoesAberto(true)}
            className="h-10 w-10 flex items-center justify-center text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm cursor-pointer active:scale-[0.98]"
            title="Matriz de Permissões"
          >
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M20 7h-9"/>
              <path d="M14 17H5"/>
              <circle cx="17" cy="17" r="3"/>
              <circle cx="7" cy="7" r="3"/>
            </svg>
          </button>
        }
        fixo={true}
      />

      {/* ─── Tabela de Registros com Sistema Excel ────────────────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col flex-1 min-h-[460px]">
        {/* Barra de Filtros Ativos Estilo Excel */}
        <BarraFiltrosAtivos estado={filtroExcel} entidadeNome="usuário(s)" />

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                <CabecalhoColunaExcel
                  colunaId="nome"
                  rotulo="PROFISSIONAL"
                  estado={filtroExcel}
                  className="px-4.5 py-3"
                />
                <CabecalhoColunaExcel
                  colunaId="perfil"
                  rotulo="PERFIL DE ACESSO (RBAC)"
                  estado={filtroExcel}
                  className="px-3.5 py-3"
                />
                <CabecalhoColunaExcel
                  colunaId="registroProfissional"
                  rotulo="REGISTRO / CONSELHO"
                  estado={filtroExcel}
                  className="px-3.5 py-3"
                />
                <CabecalhoColunaExcel
                  colunaId="ultimoAcesso"
                  rotulo="ÚLTIMO ACESSO"
                  estado={filtroExcel}
                  className="px-3.5 py-3"
                />
                <th scope="col" className="py-3 px-4 font-bold text-slate-600 text-right">
                  <span>AÇÕES</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {carregando ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-8 h-8 animate-spin text-blue-600 mb-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-xs font-semibold text-slate-600">Carregando profissionais da base de dados...</span>
                    </div>
                  </td>
                </tr>
              ) : erro ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      </div>
                      <p className="text-xs font-bold text-slate-800 mb-1">{erro}</p>
                      <Botao
                        variante="secundario"
                        tamanho="sm"
                        formato="pilula"
                        onClick={carregarUsuarios}
                        className="mt-2"
                      >
                        Tentar Novamente
                      </Botao>
                    </div>
                  </td>
                </tr>
              ) : dadosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto px-4">
                      <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3 ring-8 ring-blue-50/60 shadow-xs">
                        <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="8.5" cy="7" r="4" />
                          <line x1="20" y1="8" x2="20" y2="14" />
                          <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                      </div>

                      <h3 className="text-base font-bold text-slate-800 mb-1">
                        {temAlgumFiltroAtivo ? 'Nenhum usuário corresponde aos filtros' : 'Nenhum usuário encontrado'}
                      </h3>

                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        {temAlgumFiltroAtivo
                          ? 'Os filtros aplicados nas colunas ocultaram todos os profissionais.'
                          : 'Nenhum usuário cadastrado na equipe.'}
                      </p>

                      {temAlgumFiltroAtivo && (
                        <Botao
                          variante="secundario"
                          tamanho="sm"
                          formato="pilula"
                          onClick={() => filtroExcel.limparTodosFiltros()}
                        >
                          Limpar Filtros
                        </Botao>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                dadosPaginados.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors group border-b border-slate-100 last:border-0">
                    <td className="py-3 px-4.5 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const estilo = obterEstiloAvatarGoogle(u.nome);
                          return (
                            <div
                              style={estilo.style}
                              className="w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs select-none ring-2 ring-white"
                            >
                              {u.nome.charAt(0).toUpperCase()}
                            </div>
                          );
                        })()}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-slate-900 uppercase tracking-tight text-xs">
                              {u.nome}
                            </span>
                            {u.perfil === PerfilAcesso.PROFISSIONAL_SAUDE && (
                              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-sky-50 text-sky-700 shadow-xs border border-sky-100/70" title="Profissional de Saúde">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                                  <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                                  <circle cx="20" cy="10" r="2" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 font-normal">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3.5">
                      {(u.perfil === PerfilAcesso.ADMIN || u.perfil === PerfilAcesso.BOOTSTRAP) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-2xl text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                          {PERFIL_ACESSO_LABELS[u.perfil] || u.perfil}
                        </span>
                      )}
                      {u.perfil === PerfilAcesso.PROFISSIONAL_SAUDE && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-2xl text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                          <svg className="w-3 h-3 text-sky-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                          </svg>
                          {PERFIL_ACESSO_LABELS[u.perfil]}
                        </span>
                      )}
                      {u.perfil === PerfilAcesso.TRIAGEM_RECEPCAO && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-2xl text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                          </svg>
                          {PERFIL_ACESSO_LABELS[u.perfil]}
                        </span>
                      )}
                      {u.perfil === PerfilAcesso.DPO && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-2xl text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                          {PERFIL_ACESSO_LABELS[u.perfil]}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3.5 text-slate-600">
                      {u.perfil !== PerfilAcesso.PROFISSIONAL_SAUDE ? (
                        <span className="text-slate-400 italic">Não possui registro profissional</span>
                      ) : u.conselhoProfissional || u.registroProfissional ? (
                        <div>
                          <p className="font-semibold text-slate-800">
                            {formatarConselhoRegistro(u)}
                          </p>
                          <p className="text-[11px] text-slate-500">{u.especialidade}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Não informado</span>
                      )}
                    </td>

                    <td className="py-3 px-3.5 text-slate-500 font-mono text-[11px]">
                      {u.ultimoAcesso || 'Não informado'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 relative" onClick={(e) => e.stopPropagation()}>
                        {/* Botão Redefinir Senha */}
                        <button
                          type="button"
                          onClick={() => setUsuarioRedefinirSenha(u)}
                          className="inline-flex items-center justify-between gap-1.5 px-2.5 py-1.5 text-[11px] font-medium bg-white border rounded-xl transition-all active:scale-95 cursor-pointer shadow-2xs min-w-[125px]"
                          style={{ color: '#034b7f', borderColor: '#d0e9f3' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(3,75,127,0.04)'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#74c4d7'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fff'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#d0e9f3'; }}
                          title="Gerar nova senha temporária para o usuário"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#034b7f' }}>
                              <circle cx="7.5" cy="15.5" r="5.5" />
                              <path d="m21 2-9.6 9.6" />
                              <path d="m15.5 7.5 3 3L22 7l-3-3" />
                            </svg>
                            <span>Redefinir Senha</span>
                          </span>
                        </button>

                        {/* Dropdown de Opções */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setMenuAcoesAbertoId(menuAcoesAbertoId === u.id ? null : u.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-xl border transition-all cursor-pointer shadow-2xs ${
                              menuAcoesAbertoId === u.id
                                ? 'bg-slate-100 border-slate-300 text-slate-900'
                                : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span>Opções</span>
                            <svg className={`w-3 h-3 text-slate-400 transition-transform ${menuAcoesAbertoId === u.id ? 'rotate-180 text-slate-700' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>

                          {menuAcoesAbertoId === u.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setMenuAcoesAbertoId(null)} />
                              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200/95 rounded-2xl shadow-xl z-50 py-1.5 text-left text-xs animate-dropdown origin-top-right ring-1 ring-black/5">
                                <button
                                  type="button"
                                  onClick={() => { setMenuAcoesAbertoId(null); setUsuarioEditando(u); }}
                                  className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                  <span>Editar Usuário</span>
                                </button>
                                <div className="h-px bg-slate-100 my-1" />
                                <button
                                  type="button"
                                  onClick={() => { setMenuAcoesAbertoId(null); setUsuarioArquivando(u); }}
                                  className="w-full px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium transition-colors hover:text-red-700"
                                >
                                  <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                  </svg>
                                  <span>Arquivar Usuário</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="py-2 px-4 border-t border-slate-200/90 bg-slate-50/40">
          <Paginacao
            paginaAtual={paginaCorrigida}
            totalPaginas={totalPaginas}
            totalRegistros={dadosFiltrados.length}
            aoMudarPagina={(novaPagina) => setPaginaAtual(novaPagina)}
          />
        </div>
      </div>

      {/* ─── Modais ────────────────────────────────────────────────────────── */}
      <ModalNovoUsuario
        aberto={modalAberto || Boolean(usuarioEditando)}
        usuarioParaEditar={usuarioEditando}
        aoFechar={() => {
          setModalAberto(false);
          setUsuarioEditando(null);
        }}
        aoSalvar={handleSalvarNovoUsuario}
      />

      <ModalRedefinirSenhaUsuario
        aberto={Boolean(usuarioRedefinirSenha)}
        usuario={usuarioRedefinirSenha}
        aoFechar={() => setUsuarioRedefinirSenha(null)}
      />

      <ModalPermissoes
        aberto={modalPermissoesAberto}
        aoFechar={() => setModalPermissoesAberto(false)}
      />

      {usuarioArquivando &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px] font-sans animate-fade-in"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-modal">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100 shadow-2xs">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Arquivar Usuário</h3>
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Ação Restrita a Administradores</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Tem certeza que deseja arquivar o usuário <strong>{usuarioArquivando.nome}</strong>?
                Ele perderá imediatamente o acesso ao sistema, mas todos os registros e atividades vinculadas a ele serão preservados no histórico para auditoria.
              </p>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setUsuarioArquivando(null)}
                  disabled={arquivando}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer shadow-2xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarArquivamento}
                  disabled={arquivando}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-2xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {arquivando ? 'Arquivando...' : 'Arquivar Usuário'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

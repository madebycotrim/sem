import { useState, type FC, useMemo } from 'react';
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
import { censurarCpf } from './TabelaPacientes.tsx';

export interface UsuarioItem {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  perfil: PerfilAcesso;
  registroProfissional?: string;
  especialidade?: string;
  ativo: boolean;
  ultimoAcesso: string;
}

export const Usuarios: FC = () => {
  const [busca, setBusca] = useState('');
  const [perfilFiltro, setPerfilFiltro] = useState<string>('TODOS');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Usuários Mockados da Equipe de Campo
  const [usuarios] = useState<UsuarioItem[]>([
    {
      id: 'usr-01',
      nome: 'DRA. CAROLINA MENDES',
      email: 'carolina.mendes@catraki.com.br',
      cpf: '012.345.678-90',
      perfil: PerfilAcesso.PROFISSIONAL_SAUDE,
      registroProfissional: 'CRO-DF 12450',
      especialidade: 'Odontologia',
      ativo: true,
      ultimoAcesso: 'Hoje às 08:30',
    },
    {
      id: 'usr-02',
      nome: 'DR. FELIPE ARANTES',
      email: 'felipe.arantes@catraki.com.br',
      cpf: '234.567.890-12',
      perfil: PerfilAcesso.PROFISSIONAL_SAUDE,
      registroProfissional: 'CRM-DF 28900',
      especialidade: 'Oftalmologia',
      ativo: true,
      ultimoAcesso: 'Hoje às 07:45',
    },
    {
      id: 'usr-03',
      nome: 'MARIANA COELHO SILVA',
      email: 'mariana.silva@catraki.com.br',
      cpf: '345.678.901-23',
      perfil: PerfilAcesso.TRIAGEM_RECEPCAO,
      ativo: true,
      ultimoAcesso: 'Hoje às 07:15',
    },
    {
      id: 'usr-04',
      nome: 'GUSTAVO HENRIQUE BORGES',
      email: 'gustavo.borges@catraki.com.br',
      cpf: '456.789.012-34',
      perfil: PerfilAcesso.ADMIN,
      ativo: true,
      ultimoAcesso: 'Ontem às 18:20',
    },
    {
      id: 'usr-05',
      nome: 'JULIANA PEREIRA LIMA',
      email: 'juliana.lima@catraki.com.br',
      cpf: '567.890.123-45',
      perfil: PerfilAcesso.PROFISSIONAL_SAUDE,
      registroProfissional: 'CRN-DF 54120',
      especialidade: 'Nutrição',
      ativo: true,
      ultimoAcesso: 'Hoje às 08:10',
    },
  ]);

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
        obterValor: (u) => u.registroProfissional || u.especialidade || '',
        formatarRotulo: (val) => (val ? String(val) : 'Equipe de Apoio'),
      },
      {
        id: 'ultimoAcesso',
        rotulo: 'ÚLTIMO ACESSO',
        tipo: 'texto',
        obterValor: (u) => u.ultimoAcesso,
      },
      {
        id: 'ativo',
        rotulo: 'STATUS',
        tipo: 'opcao',
        obterValor: (u) => (u.ativo ? 'ATIVO' : 'INATIVO'),
        formatarRotulo: (val) => (val === 'ATIVO' ? 'Ativo' : 'Inativo'),
      },
    ],
    []
  );

  const dadosBase = useMemo(() => {
    return usuarios.filter((item) => {
      const matchPerfil = perfilFiltro === 'TODOS' || item.perfil === perfilFiltro;
      return matchPerfil;
    });
  }, [usuarios, perfilFiltro]);

  const filtroExcel = useFiltroExcel<UsuarioItem>({
    dados: dadosBase,
    colunas: colunasConfig,
    buscaGeral: busca,
    funcaoBuscaGeral: (item, termo) =>
      item.nome.toLowerCase().includes(termo) ||
      item.email.toLowerCase().includes(termo) ||
      item.cpf.includes(termo) ||
      Boolean(item.registroProfissional && item.registroProfissional.toLowerCase().includes(termo)),
  });

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
          placeholder: 'Buscar usuário por nome, email ou CPF...',
        }}
        seletor={{
          valor: perfilFiltro,
          aoMudar: setPerfilFiltro,
          placeholder: 'Todos os Perfis',
          opcoes: [
            { id: 'TODOS', nome: 'Todos os Perfis' },
            ...Object.entries(PERFIL_ACESSO_LABELS).map(([id, nome]) => ({ id, nome })),
          ],
        }}
        acaoPrimaria={{
          rotulo: 'Convidar Profissional',
          aoClicar: () => alert('Modal de Convite / Cadastro de Profissional em desenvolvimento.'),
        }}
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
                  colunaId="cpf"
                  rotulo="CPF"
                  estado={filtroExcel}
                  className="px-3.5 py-3"
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
                  <span>STATUS</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {dadosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
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
                        <button
                          type="button"
                          onClick={() => filtroExcel.limparTodosFiltros()}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl transition-all cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="1 4 1 10 7 10" />
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                          </svg>
                          <span>Limpar Filtros</span>
                        </button>
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
                          <span className="font-medium text-slate-900 uppercase tracking-tight text-xs">
                            {u.nome}
                          </span>
                          <span className="text-[11px] text-slate-500 font-normal">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3.5 font-mono text-slate-600 text-xs">
                      {u.cpf ? censurarCpf(u.cpf) : ''}
                    </td>

                    <td className="py-3 px-3.5">
                      {u.perfil === PerfilAcesso.ADMIN && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-2xl text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                          Gestor Geral (Administrador)
                        </span>
                      )}
                      {u.perfil === PerfilAcesso.PROFISSIONAL_SAUDE && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-2xl text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                          </svg>
                          Profissional Clínico
                        </span>
                      )}
                      {u.perfil === PerfilAcesso.TRIAGEM_RECEPCAO && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-2xl text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                          </svg>
                          Triagem & Recepção
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3.5 text-slate-600">
                      {u.registroProfissional ? (
                        <div>
                          <p className="font-semibold text-slate-800">{u.registroProfissional}</p>
                          <p className="text-[11px] text-slate-500">{u.especialidade}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Equipe de Apoio</span>
                      )}
                    </td>

                    <td className="py-3 px-3.5 text-slate-500 font-mono text-[11px]">
                      {u.ultimoAcesso}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Ativo
                      </span>
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
    </div>
  );
};

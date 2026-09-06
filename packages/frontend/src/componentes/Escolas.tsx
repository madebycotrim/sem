import { useState, type FC } from 'react';
import { CabecalhoPagina } from './CabecalhoPagina.tsx';
import { ModalNovaEscola } from './ModalNovaEscola.tsx';
import { Modal, BotaoModal } from './Modal.tsx';
import { requisicaoApi } from '../servicos/api.ts';

export interface EscolaPolo {
  id: string;
  nome: string;
  regiao: string;
  endereco: string;
  cnpj?: string;
  diretoriaRegional?: string;
  alunosMatriculados: number;
  totalAtendimentos?: number;
  unidadesMoveisEstacionadas?: number;
  status?: 'ESTACIONADA_HOJE' | 'PROGRAMADA' | 'CONCLUIDA';
}

export interface EscolasProps {
  escolas: EscolaPolo[];
  escolaAtivaId: string;
  aoSelecionarEscolaAtiva: (escolaId: string) => void;
  aoRecarregarEscolas: () => void;
}

export const Escolas: FC<EscolasProps> = ({
  escolas,
  escolaAtivaId,
  aoSelecionarEscolaAtiva,
  aoRecarregarEscolas,
}) => {
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [escolaEmEdicao, setEscolaEmEdicao] = useState<EscolaPolo | null>(null);
  const [escolaParaExcluir, setEscolaParaExcluir] = useState<EscolaPolo | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [menuOpcoesAbertoId, setMenuOpcoesAbertoId] = useState<string | null>(null);

  const filtradas = escolas.filter((e) =>
    e.nome.toLowerCase().includes(busca.toLowerCase()) ||
    e.regiao.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 animate-fade-in font-sans">
      {/* ─── Cabeçalho Fixo Modular ───────────────────────────────────────── */}
      <CabecalhoPagina
        titulo="Escolas"
        subtitulo="SELEÇÃO DA INSTITUIÇÃO ESCOLAR ONDE AS UNIDADES MOVEIS ESTÃO ESTACIONADAS"
        busca={{
          valor: busca,
          aoMudar: setBusca,
          placeholder: 'Buscar escola ou região...',
        }}
        acaoPrimaria={{
          rotulo: 'Nova Instituição',
          aoClicar: () => setModalAberto(true),
        }}
        fixo={true}
      />

      {/* Grid ou Estado Vazio de Instituições Escolares */}
      {filtradas.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[380px] py-16 px-4 my-auto text-center animate-fade-in">
          <div className="w-14 h-14 rounded-3xl bg-slate-100 border border-slate-200/80 text-slate-400 flex items-center justify-center mb-3.5 shadow-2xs">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M19 21V11l-6-4M3 21h18M5 21V7l8-4v18M9 9h1M9 13h1" />
            </svg>
          </div>
          <h3 className="text-sm font-extrabold text-slate-700 tracking-tight">
            {busca ? 'Nenhuma instituição encontrada' : 'Nenhuma instituição cadastrada'}
          </h3>
          <p className="mt-1 text-xs text-slate-400 font-medium max-w-xs leading-relaxed">
            {busca
              ? `Não encontramos registros para "${busca}". Tente buscar por outro termo.`
              : 'Não há instituições registradas no sistema até o momento.'}
          </p>
          {busca ? (
            <button
              type="button"
              onClick={() => setBusca('')}
              className="mt-4 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              Limpar filtro de busca
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setModalAberto(true)}
              className="mt-4 px-4.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Cadastrar Nova Instituição</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtradas.map((escola) => {
            const estaAtiva = escola.id === escolaAtivaId;
            return (
              <div
                key={escola.id}
                className={`p-5 rounded-3xl border transition-all duration-200 bg-white flex flex-col justify-between ${
                  estaAtiva
                    ? 'border-2 border-blue-500 ring-2 ring-blue-100 shadow-md'
                    : 'border-slate-200/90 hover:border-slate-300/90 shadow-2xs hover:shadow-xs'
                }`}
              >
                <div>
                  {/* Cabeçalho do Card */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold transition-colors shrink-0 ${
                        estaAtiva
                          ? 'bg-blue-50 border border-blue-200 text-blue-600'
                          : 'bg-slate-50 border border-slate-200/80 text-slate-500'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M3 21h18" />
                        <path d="M5 21V7l8-4v18" />
                        <path d="M19 21V11l-6-4" />
                        <path d="M9 9h1" />
                        <path d="M9 13h1" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-[#0b2545] leading-snug">{escola.nome}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{escola.regiao}</p>
                    </div>
                  </div>

                  {/* Endereço */}
                  <p className="text-xs text-slate-500 mb-3.5 font-normal flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-slate-500">{escola.endereco}</span>
                  </p>

                  {/* Métricas: Estudantes & Atendimentos */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/80 border border-slate-100 rounded-2xl text-xs mb-3.5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total de Estudantes</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{escola.alunosMatriculados || 0} estudantes</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total de Atendimentos</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{escola.totalAtendimentos ?? 0} atendimentos</p>
                    </div>
                  </div>

                  {/* Rodapé do Card: SELECIONAR INSTITUIÇÃO + Opções ⌄ no canto inferior */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {/* Botão Selecionar / Instituição Ativa */}
                    {estaAtiva ? (
                      <button
                        type="button"
                        onClick={() => aoSelecionarEscolaAtiva('')}
                        title="Clique para desativar esta instituição"
                        className="group h-7 inline-flex items-center gap-1.5 px-3.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 hover:bg-rose-600 text-white shadow-2xs shrink-0 transition-all cursor-pointer active:scale-95"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse group-hover:hidden" />
                        <svg className="w-3 h-3 hidden group-hover:block" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="group-hover:hidden">INSTITUIÇÃO ATIVA</span>
                        <span className="hidden group-hover:inline">DESATIVAR</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => aoSelecionarEscolaAtiva(escola.id)}
                        className="h-7 inline-flex items-center gap-1.5 px-3.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/90 shadow-2xs shrink-0 transition-all cursor-pointer active:scale-95"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400/80" />
                        <span>SELECIONAR INSTITUIÇÃO</span>
                      </button>
                    )}

                    {/* Botão Opções ⌄ em formato pílula */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setMenuOpcoesAbertoId(
                            menuOpcoesAbertoId === escola.id ? null : escola.id
                          )
                        }
                        className={`h-7 inline-flex items-center gap-1 px-3 text-xs font-semibold rounded-full border transition-all cursor-pointer shadow-2xs ${
                          menuOpcoesAbertoId === escola.id
                            ? 'bg-slate-100 border-slate-300 text-slate-900 ring-2 ring-slate-100'
                            : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span>Opções</span>
                        <svg
                          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                            menuOpcoesAbertoId === escola.id ? 'rotate-180 text-slate-700' : ''
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>

                      {menuOpcoesAbertoId === escola.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setMenuOpcoesAbertoId(null)}
                          />
                          <div className="absolute right-0 bottom-full mb-1.5 w-44 bg-white border border-slate-200/95 rounded-2xl shadow-xl z-50 py-1.5 text-left text-xs animate-dropdown origin-bottom-right ring-1 ring-black/5">
                            <button
                              type="button"
                              onClick={() => {
                                setMenuOpcoesAbertoId(null);
                                setEscolaEmEdicao(escola);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              <span>Editar Instituição</span>
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              type="button"
                              onClick={() => {
                                setMenuOpcoesAbertoId(null);
                                setEscolaParaExcluir(escola);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5 text-rose-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Excluir Instituição</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Criar / Editar Instituição */}
      <ModalNovaEscola
        aberto={modalAberto || !!escolaEmEdicao}
        escolaParaEditar={escolaEmEdicao}
        aoFechar={() => {
          setModalAberto(false);
          setEscolaEmEdicao(null);
        }}
        aoSucesso={() => {
          setModalAberto(false);
          setEscolaEmEdicao(null);
          aoRecarregarEscolas();
        }}
      />

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        aberto={!!escolaParaExcluir}
        aoFechar={() => setEscolaParaExcluir(null)}
        titulo="Excluir Instituição"
        subtitulo={escolaParaExcluir ? `Tem certeza que deseja remover "${escolaParaExcluir.nome}"?` : ''}
        tamanho="sm"
        icone={
          <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        }
        rodape={
          <>
            <BotaoModal
              variante="secundario"
              rotulo="Cancelar"
              aoClicar={() => setEscolaParaExcluir(null)}
            />
            <BotaoModal
              variante="perigo"
              rotulo="Sim, Excluir"
              carregando={excluindo}
              aoClicar={async () => {
                if (!escolaParaExcluir) return;
                setExcluindo(true);
                try {
                  await requisicaoApi(`/escolas/${escolaParaExcluir.id}`, { metodo: 'DELETE' });
                  if (escolaAtivaId === escolaParaExcluir.id) {
                    aoSelecionarEscolaAtiva('');
                  }
                  aoRecarregarEscolas();
                  setEscolaParaExcluir(null);
                } catch (erro) {
                } finally {
                  setExcluindo(false);
                }
              }}
            />
          </>
        }
      >
        <p className="text-xs text-slate-500 font-medium">
          Esta ação removerá a instituição do sistema. Ela não estará mais disponível para seleção de atendimentos.
        </p>
      </Modal>
    </div>
  );
};


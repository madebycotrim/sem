import { useState, type FC } from 'react';
import { CabecalhoPagina } from './CabecalhoPagina.tsx';
import { ModalNovaEscola } from './ModalNovaEscola.tsx';
import { Modal, BotaoModal } from './Modal.tsx';
import { requisicaoApi } from '../servicos/api.ts';
import { Building2, ChevronDown, MapPin, Pencil, Plus, Trash2, X } from 'lucide-react';

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
  podeGerenciar: boolean;
}

export const Escolas: FC<EscolasProps> = ({
  escolas,
  escolaAtivaId,
  aoSelecionarEscolaAtiva,
  aoRecarregarEscolas,
  podeGerenciar,
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
        acaoPrimaria={podeGerenciar ? {
          rotulo: 'Nova Instituição',
          aoClicar: () => setModalAberto(true),
        } : undefined}
        fixo={true}
      />

      {/* Grid ou Estado Vazio de Instituições Escolares */}
      {filtradas.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[380px] py-16 px-4 my-auto text-center animate-fade-in">
          <div className="w-14 h-14 rounded-3xl bg-slate-100 border border-slate-200/80 text-slate-400 flex items-center justify-center mb-3.5 shadow-2xs">
            <Building2 className="w-7 h-7" />
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
              <Plus className="w-3.5 h-3.5" />
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
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-[#0b2545] leading-snug">{escola.nome}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{escola.regiao}</p>
                    </div>
                  </div>

                  {/* Endereço */}
                  <p className="text-xs text-slate-500 mb-3.5 font-normal flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
                        <X className="w-3 h-3 hidden group-hover:block" />
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
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${menuOpcoesAbertoId === escola.id ? 'rotate-180 text-slate-700' : ''}`} />
                      </button>

                      {menuOpcoesAbertoId === escola.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setMenuOpcoesAbertoId(null)}
                          />
                          <div className="absolute right-0 bottom-full mb-1.5 w-44 bg-white border border-slate-200/95 rounded-2xl shadow-xl z-50 py-1.5 text-left text-xs animate-dropdown origin-bottom-right ring-1 ring-black/5">
                            {podeGerenciar && <button
                              type="button"
                              onClick={() => {
                                setMenuOpcoesAbertoId(null);
                                setEscolaEmEdicao(escola);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>Editar Instituição</span>
                            </button>}

                            {podeGerenciar && <div className="my-1 border-t border-slate-100" />}

                            {podeGerenciar && <button
                              type="button"
                              onClick={() => {
                                setMenuOpcoesAbertoId(null);
                                setEscolaParaExcluir(escola);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>Arquivar Instituição</span>
                            </button>}
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

      {/* Modal de Confirmação de Arquivamento */}
      <Modal
        aberto={!!escolaParaExcluir}
        aoFechar={() => setEscolaParaExcluir(null)}
        titulo="Arquivar Instituição"
        subtitulo={escolaParaExcluir ? `Tem certeza que deseja arquivar "${escolaParaExcluir.nome}"?` : ''}
        tamanho="sm"
        icone={
          <Trash2 className="w-5 h-5 text-rose-500" />
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
              rotulo="Sim, Arquivar"
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
                  console.error('Erro ao arquivar instituição:', erro);
                } finally {
                  setExcluindo(false);
                }
              }}
            />
          </>
        }
      >
        <p className="text-xs text-slate-500 font-medium">
          A instituição será ocultada das listagens para evitar novos vínculos, mas todos os registros de estudantes e atendimentos já realizados serão mantidos de forma segura no sistema.
        </p>
      </Modal>
    </div>
  );
};


import { useState, type FC } from 'react';
import { CabecalhoPagina } from './CabecalhoPagina.tsx';
import { ModalNovaEscola } from './ModalNovaEscola.tsx';
import { Modal, BotaoModal } from './Modal.tsx';
import { requisicaoApi } from '../servicos/api.ts';
import type { ItemAtendimentoLista } from './Atendimentos.tsx';
import {
  Activity,
  Apple,
  Brain,
  Building2,
  ChevronDown,
  Ear,
  Eye,
  GraduationCap,
  MapPin,
  Pencil,
  Smile,
  Stethoscope,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react';

export interface EscolaPolo {
  id: string;
  nome: string;
  regiao: string;
  endereco: string;
  cnpj?: string;
  diretoriaRegional?: string;
  alunosMatriculados: number;
  totalAtendimentos?: number;
  atendimentosPorEspecialidade?: Record<string, number>;
  unidadesMoveisEstacionadas?: number;
  status?: 'ESTACIONADA_HOJE' | 'PROGRAMADA' | 'CONCLUIDA';
}

export interface EscolasProps {
  escolas: EscolaPolo[];
  escolaAtivaId: string;
  aoSelecionarEscolaAtiva: (escolaId: string) => void;
  aoRecarregarEscolas: () => void;
  podeGerenciar: boolean;
  atendimentos?: ItemAtendimentoLista[];
}

interface ConfigEspecialidade {
  id: string;
  nome: string;
  icone: LucideIcon;
  fundo: string;
  borda: string;
  texto: string;
}

const ESPECIALIDADES_CATALOGO: ConfigEspecialidade[] = [
  { id: 'ODONTOLOGIA', nome: 'Odontologia', icone: Smile, fundo: 'bg-rose-50', borda: 'border-rose-200', texto: 'text-rose-700' },
  { id: 'PSICOLOGIA', nome: 'Psicologia', icone: Brain, fundo: 'bg-indigo-50', borda: 'border-indigo-200', texto: 'text-indigo-700' },
  { id: 'OFTALMOLOGIA', nome: 'Oftalmologia', icone: Eye, fundo: 'bg-teal-50', borda: 'border-teal-200', texto: 'text-teal-700' },
  { id: 'AUDIOMETRIA', nome: 'Audiometria', icone: Ear, fundo: 'bg-blue-50', borda: 'border-blue-200', texto: 'text-blue-700' },
  { id: 'NUTRICAO', nome: 'Nutrição', icone: Apple, fundo: 'bg-emerald-50', borda: 'border-emerald-200', texto: 'text-emerald-700' },
];

const normalizarTexto = (s?: string) =>
  (s || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const calcularMetricasEscola = (
  escola: EscolaPolo,
  atendimentos?: ItemAtendimentoLista[]
) => {
  const contagem: Record<string, number> = {
    ...(escola.atendimentosPorEspecialidade || {}),
  };

  if (atendimentos && atendimentos.length > 0) {
    const nomeEscolaNorm = normalizarTexto(escola.nome);

    const atendimentosDestaEscola = atendimentos.filter((a) => {
      if (a.escolaId && a.escolaId === escola.id) return true;
      const nomeAtendNorm = normalizarTexto(a.escolaNome);
      if (!nomeAtendNorm || nomeAtendNorm === 'nao informada') return false;
      return (
        nomeAtendNorm === nomeEscolaNorm ||
        nomeEscolaNorm.includes(nomeAtendNorm) ||
        nomeAtendNorm.includes(nomeEscolaNorm)
      );
    });

    if (atendimentosDestaEscola.length > 0) {
      const contagemLocal: Record<string, number> = {};
      for (const a of atendimentosDestaEscola) {
        if (a.especialidade) {
          const esp = a.especialidade.toUpperCase();
          contagemLocal[esp] = (contagemLocal[esp] || 0) + 1;
        }
      }
      Object.entries(contagemLocal).forEach(([esp, qtd]) => {
        contagem[esp] = Math.max(contagem[esp] || 0, qtd);
      });
    }
  }

  const todas = ESPECIALIDADES_CATALOGO.map((esp) => ({
    ...esp,
    total: contagem[esp.id] || 0,
  }));

  const ativas = todas.filter((esp) => esp.total > 0);

  const totalAtendimentosCalculado = Math.max(
    escola.totalAtendimentos ?? 0,
    ativas.reduce((acc, curr) => acc + curr.total, 0)
  );

  return { ativas, todas, totalAtendimentosCalculado };
};

export const Escolas: FC<EscolasProps> = ({
  escolas,
  escolaAtivaId,
  aoSelecionarEscolaAtiva,
  aoRecarregarEscolas,
  podeGerenciar,
  atendimentos,
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
        <div className="flex flex-1 min-h-[400px] flex-col items-center justify-center p-8 text-center my-auto animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100/80 text-slate-400 mb-3">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">
            {busca ? 'Nenhuma instituição encontrada' : 'Nenhuma instituição cadastrada'}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            {busca
              ? `Não encontramos registros para "${busca}". Tente buscar por outro termo.`
              : 'Não há instituições registradas no sistema até o momento.'}
          </p>
          {busca && (
            <button
              type="button"
              onClick={() => setBusca('')}
              className="mt-4 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              Limpar filtro de busca
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtradas.map((escola) => {
            const estaAtiva = escola.id === escolaAtivaId || escola.status === 'ESTACIONADA_HOJE';
            const { todas: todasEspecialidades, totalAtendimentosCalculado } = calcularMetricasEscola(escola, atendimentos);

            // Ordena com especialidades ativas primeiro (decrescente por volume) seguidas das zeradas
            const especialidadesOrdenadas = [...todasEspecialidades].sort((a, b) => {
              if (b.total !== a.total) {
                return b.total - a.total;
              }
              return 0;
            });
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

                  {/* Painel de Métricas da Escola */}
                  <div className="p-3.5 bg-slate-50/75 border border-slate-200/80 rounded-2xl mb-3.5 flex flex-col gap-3 shadow-2xs">
                    {/* Linha dos 2 Indicadores Principais (KPIs) */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Total de Estudantes */}
                      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs transition-all hover:border-slate-300/80">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block leading-none">
                            Total de Estudantes
                          </span>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-sm font-extrabold text-slate-800 font-mono leading-none">
                              {escola.alunosMatriculados || 0}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500">
                              {(escola.alunosMatriculados || 0) === 1 ? 'estudante' : 'estudantes'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Total de Atendimentos */}
                      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs transition-all hover:border-slate-300/80">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block leading-none">
                            Total de Atendimentos
                          </span>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-sm font-extrabold text-slate-800 font-mono leading-none">
                              {totalAtendimentosCalculado}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500">
                              {totalAtendimentosCalculado === 1 ? 'atendimento' : 'atendimentos'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* A BAIXO DE TOTAL DE ATENDIMENTO: Por Especialidade (Todas as 5 Especialidades Visíveis) */}
                    <div className="pt-2.5 border-t border-slate-200/70">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Activity className="w-3 h-3 text-blue-500" />
                          Por Especialidade
                        </span>
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                          {todasEspecialidades.filter((e) => e.total > 0).length} ativas de 5
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {especialidadesOrdenadas.map((esp) => {
                          const temAtendimento = esp.total > 0;
                          const Icone = esp.icone;
                          return (
                            <span
                              key={esp.id}
                              title={`${esp.nome}: ${esp.total} atendimento(s) nesta instituição`}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10.5px] font-semibold border transition-all duration-150 select-none ${
                                temAtendimento
                                  ? `${esp.fundo} ${esp.borda} ${esp.texto} shadow-2xs hover:scale-105 cursor-default`
                                  : 'bg-white/80 border-slate-200/90 text-slate-400 hover:border-slate-300 hover:text-slate-600 cursor-default'
                              }`}
                            >
                              <Icone className={`w-3.5 h-3.5 shrink-0 ${temAtendimento ? esp.texto : 'text-slate-400'}`} />
                              <span>{esp.nome}:</span>
                              <span
                                className={`font-mono text-[10px] font-extrabold ${
                                  temAtendimento ? 'px-1 py-0.2 rounded bg-white/90 text-slate-900 shadow-2xs border border-black/5' : 'text-slate-400'
                                }`}
                              >
                                {esp.total}
                              </span>
                            </span>
                          );
                        })}
                      </div>
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


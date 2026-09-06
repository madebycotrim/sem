import { useState, type FC } from 'react';
import { CabecalhoPagina } from './CabecalhoPagina.tsx';
import { ModalNovaEscola } from './ModalNovaEscola.tsx';

export interface EscolaPolo {
  id: string;
  nome: string;
  regiao: string;
  endereco: string;
  diretoriaRegional: string;
  alunosMatriculados: number;
  unidadesMoveisEstacionadas: number;
  status: 'ESTACIONADA_HOJE' | 'PROGRAMADA' | 'CONCLUIDA';
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

  const filtradas = escolas.filter((e) =>
    e.nome.toLowerCase().includes(busca.toLowerCase()) ||
    e.regiao.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 animate-fade-in font-sans">
      {/* ─── Cabeçalho Fixo Modular ───────────────────────────────────────── */}
      <CabecalhoPagina
        titulo="Escolas"
        subtitulo="SELEÇÃO DO POLO ESCOLAR ONDE AS UNIDADES CATRAKI ESTÃO ESTACIONADAS NO DIA"
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

      {/* Grid de Polos Escolares */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtradas.map((escola) => {
          const estaAtiva = escola.id === escolaAtivaId;
          return (
            <div
              key={escola.id}
              className={`p-5 rounded-2xl border transition-all duration-200 bg-white flex flex-col justify-between ${estaAtiva
                ? 'border-blue-500 ring-2 ring-blue-100 shadow-md'
                : 'border-slate-200/90 hover:border-slate-300/90 shadow-xs hover:shadow-sm'
                }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M3 21h18" />
                        <path d="M5 21V7l8-4v18" />
                        <path d="M19 21V11l-6-4" />
                        <path d="M9 9h1" />
                        <path d="M9 13h1" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0b2545]">{escola.nome}</h3>
                      <p className="text-xs text-slate-500 font-medium">{escola.regiao}</p>
                    </div>
                  </div>

                  {estaAtiva ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-blue-600 text-white uppercase tracking-wider shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Polo Ativo Hoje
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      {escola.status === 'PROGRAMADA' ? 'Programada' : 'Concluída'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mb-3 font-normal flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-slate-500">{escola.endereco}</span>
                </p>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/80 border border-slate-100 rounded-2xl mb-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Diretoria Regional</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{escola.diretoriaRegional}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alunos Matriculados</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{escola.alunosMatriculados} estudantes</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="1" y="3" width="15" height="13" rx="2" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <span>
                    {escola.unidadesMoveisEstacionadas > 0
                      ? `${escola.unidadesMoveisEstacionadas} Unidades Móveis no Local`
                      : 'Sem unidades hoje'}
                  </span>
                </span>

                {!estaAtiva ? (
                  <button
                    type="button"
                    onClick={() => aoSelecionarEscolaAtiva(escola.id)}
                    className="px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    Definir como Polo de Hoje
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Operação em Andamento
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Nova Instituição */}
      <ModalNovaEscola
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        aoSucesso={() => {
          setModalAberto(false);
          aoRecarregarEscolas();
        }}
      />
    </div>
  );
};

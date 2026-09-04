import { useState, type FC } from 'react';
import { CabecalhoPaginaSesi } from './CabecalhoPaginaSesi.tsx';

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

interface VisaoEscolasProps {
  escolaAtivaId: string;
  aoSelecionarEscolaAtiva: (escolaId: string) => void;
}

export const VisaoEscolas: FC<VisaoEscolasProps> = ({
  escolaAtivaId,
  aoSelecionarEscolaAtiva,
}) => {
  const [busca, setBusca] = useState('');

  const [escolas] = useState<EscolaPolo[]>([
    {
      id: 'seed-escola-001',
      nome: 'CEMEIT DE TAGUATINGA',
      regiao: 'Taguatinga / DF',
      endereco: 'QNF Área Especial 01, Taguatinga Norte',
      diretoriaRegional: 'CRE Taguatinga',
      alunosMatriculados: 1250,
      unidadesMoveisEstacionadas: 2,
      status: 'ESTACIONADA_HOJE',
    },
    {
      id: 'seed-escola-002',
      nome: 'CEF 01 DE BRASÍLIA',
      regiao: 'Plano Piloto / DF',
      endereco: 'EQS 106/306 Área Especial, Asa Sul',
      diretoriaRegional: 'CRE Plano Piloto',
      alunosMatriculados: 890,
      unidadesMoveisEstacionadas: 0,
      status: 'PROGRAMADA',
    },
    {
      id: 'seed-escola-003',
      nome: 'EC 10 DE CEILÂNDIA',
      regiao: 'Ceilândia / DF',
      endereco: 'QNM 15 Conjunto A, Ceilândia Sul',
      diretoriaRegional: 'CRE Ceilândia',
      alunosMatriculados: 940,
      unidadesMoveisEstacionadas: 0,
      status: 'PROGRAMADA',
    },
    {
      id: 'seed-escola-004',
      nome: 'CEF 02 DE SOBRADINHO',
      regiao: 'Sobradinho / DF',
      endereco: 'Quadra 04 Área Especial 02, Sobradinho',
      diretoriaRegional: 'CRE Sobradinho',
      alunosMatriculados: 760,
      unidadesMoveisEstacionadas: 0,
      status: 'CONCLUIDA',
    },
  ]);

  const filtradas = escolas.filter((e) =>
    e.nome.toLowerCase().includes(busca.toLowerCase()) ||
    e.regiao.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 anim-surgir font-sans">
      {/* ─── Cabeçalho Fixo Modular ───────────────────────────────────────── */}
      <CabecalhoPaginaSesi
        titulo="Escolas & Unidades Móveis"
        subtitulo="SELEÇÃO DO POLO ESCOLAR ONDE AS UNIDADES DO SESI ESTÃO ESTACIONADAS NO DIA"
        busca={{
          valor: busca,
          aoMudar: setBusca,
          placeholder: 'Buscar escola ou região...',
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
              className={`p-5 rounded-2xl border transition-all duration-200 bg-white flex flex-col justify-between shadow-2xs ${
                estaAtiva
                  ? 'border-blue-500 ring-2 ring-blue-100 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                      🏫
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0b2545]">{escola.nome}</h3>
                      <p className="text-xs text-slate-500 font-medium">{escola.regiao}</p>
                    </div>
                  </div>

                  {estaAtiva ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-600 text-white uppercase tracking-wider">
                      ★ Unidade Ativa Hoje
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      {escola.status === 'PROGRAMADA' ? 'Programada' : 'Concluída'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mb-3 font-normal">
                  📍 <span className="text-slate-500">{escola.endereco}</span>
                </p>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/80 rounded-xl mb-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Diretoria Regional</span>
                    <p className="font-semibold text-slate-800">{escola.diretoriaRegional}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Alunos Matriculados</span>
                    <p className="font-semibold text-slate-800">{escola.alunosMatriculados} estudantes</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">
                  🚐 {escola.unidadesMoveisEstacionadas > 0 ? `${escola.unidadesMoveisEstacionadas} Unidades no Local` : 'Sem unidades hoje'}
                </span>

                {!estaAtiva ? (
                  <button
                    type="button"
                    onClick={() => aoSelecionarEscolaAtiva(escola.id)}
                    className="px-3.5 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all cursor-pointer"
                  >
                    Definir como Polo de Hoje
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    ✓ Operação em Andamento
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

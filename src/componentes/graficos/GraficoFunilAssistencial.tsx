import { type FC } from 'react';
import { Filter, CheckCircle2, AlertCircle, ArrowDown } from 'lucide-react';

export interface EtapaFunil {
  id: string;
  rotulo: string;
  total: number;
  corHex: string;
  descricao: string;
}

interface GraficoFunilAssistencialProps {
  titulo: string;
  subtitulo?: string;
  etapas: EtapaFunil[];
  totalCancelados?: number;
  totalFaltas?: number;
}

export const GraficoFunilAssistencial: FC<GraficoFunilAssistencialProps> = ({
  titulo,
  subtitulo,
  etapas,
  totalCancelados = 0,
  totalFaltas = 0,
}) => {
  const baseTotal = etapas[0]?.total || 0;
  const totalConcluido = etapas[etapas.length - 1]?.total || 0;
  const taxaResolutividade = baseTotal > 0 ? ((totalConcluido / baseTotal) * 100).toFixed(1) : '0.0';

  return (
    <div className="flex flex-col min-h-[300px] rounded-2xl border border-slate-200/80 bg-slate-50/30 p-5 sm:p-6 shadow-2xs justify-between">
      {/* Cabeçalho */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#0b2545]">{titulo}</h3>
            {subtitulo && <p className="text-[11px] text-slate-400">{subtitulo}</p>}
          </div>
        </div>

        <span className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[11px] font-bold border ${
          baseTotal > 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
        }`}>
          <CheckCircle2 className={`h-3.5 w-3.5 ${baseTotal > 0 ? 'text-emerald-600' : 'text-slate-400'}`} />
          {baseTotal > 0 ? `${taxaResolutividade}% Eficácia Global` : 'Aguardando Dados'}
        </span>
      </div>

      {baseTotal === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 rounded-xl border border-dashed border-slate-200 bg-white/70 text-center my-auto">
          <Filter className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-600">Sem registros para projeção do funil</p>
          <p className="text-[11px] text-slate-400 mt-0.5">O pipeline assistencial será construído à medida que houver consultas registradas</p>
        </div>
      ) : (
        <div className="my-auto space-y-3 pt-2">
          {/* Etapas do Funil */}
          {etapas.map((etapa, idx) => {
            const percDaBase = ((etapa.total / baseTotal) * 100).toFixed(0);
            const larguraBarra = Math.max(Number(percDaBase), etapa.total > 0 ? 15 : 8);

            return (
              <div key={etapa.id} className="relative">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200/80 text-[10px] font-black text-slate-700">
                      {idx + 1}
                    </span>
                    <span>{etapa.rotulo}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400">{percDaBase}%</span>
                    <span className="font-extrabold text-[#0b2545] bg-white px-2 py-0.5 rounded-md border border-slate-200 text-xs">
                      {etapa.total}
                    </span>
                  </div>
                </div>

                {/* Barra do Funil */}
                <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/60 flex items-center">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out shadow-2xs"
                    style={{
                      width: `${larguraBarra}%`,
                      backgroundColor: etapa.corHex,
                    }}
                  />
                </div>

                {/* Seta de Transição entre etapas */}
                {idx < etapas.length - 1 && (
                  <div className="flex justify-center -my-1 opacity-40">
                    <ArrowDown className="h-3 w-3 text-slate-400" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Rodapé do Funil com Evasão / Absenteísmo */}
          {(totalCancelados > 0 || totalFaltas > 0) && (
            <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] font-semibold text-rose-800 bg-rose-50/60 p-2.5 rounded-xl border border-rose-100">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                Desistências e Não Comparecimentos:
              </span>
              <div className="flex items-center gap-3">
                <span>
                  Cancelados: <strong className="font-bold text-rose-900">{totalCancelados}</strong>
                </span>
                <span>
                  Faltas: <strong className="font-bold text-rose-900">{totalFaltas}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

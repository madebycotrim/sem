import { type FC, useState } from 'react';
import { BarChart2, Sun, Moon } from 'lucide-react';

export interface ItemColunaComparativa {
  categoria: string; // Ex: 'Seg', 'Ter', 'Qua'
  valorA: number; // Ex: Matutino
  valorB: number; // Ex: Vespertino
  rotuloA?: string;
  rotuloB?: string;
}

interface GraficoBarrasComparativasProps {
  titulo: string;
  subtitulo?: string;
  dados: ItemColunaComparativa[];
  rotuloSerieA?: string;
  rotuloSerieB?: string;
}

export const GraficoBarrasComparativas: FC<GraficoBarrasComparativasProps> = ({
  titulo,
  subtitulo,
  dados,
  rotuloSerieA = 'Matutino (Manhã)',
  rotuloSerieB = 'Vespertino (Tarde)',
}) => {
  const [itemHover, setItemHover] = useState<ItemColunaComparativa | null>(null);

  const maiorValor = Math.max(
    ...dados.map((d) => Math.max(d.valorA, d.valorB)),
    1
  );

  const totalA = dados.reduce((acc, d) => acc + d.valorA, 0);
  const totalB = dados.reduce((acc, d) => acc + d.valorB, 0);
  const totalGeral = totalA + totalB;

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200/80 bg-slate-50/30 p-5 sm:p-6 shadow-2xs">
      {/* Cabeçalho */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <BarChart2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#0b2545]">{titulo}</h3>
            {subtitulo && <p className="text-[11px] text-slate-400">{subtitulo}</p>}
          </div>
        </div>

        {/* Legenda dos turnos */}
        <div className="flex items-center gap-3 text-[11px] font-bold">
          <span className="flex items-center gap-1.5 text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            <Sun className="h-3 w-3 text-amber-500" />
            {rotuloSerieA}: <strong className="font-black">{totalA}</strong>
          </span>
          <span className="flex items-center gap-1.5 text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
            <Moon className="h-3 w-3 text-indigo-500" />
            {rotuloSerieB}: <strong className="font-black">{totalB}</strong>
          </span>
        </div>
      </div>

      {totalGeral === 0 ? (
        <div className="my-auto flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-xs font-medium text-slate-400">
          Nenhuma consulta registrada nos turnos do período
        </div>
      ) : (
        <div className="my-auto pt-4">
          {/* Eixo de colunas agrupadas */}
          <div className="flex h-44 items-end justify-between gap-2 sm:gap-4 border-b border-slate-200/80 px-2 pb-2">
            {dados.map((item) => {
              const alturaA = (item.valorA / maiorValor) * 100;
              const alturaB = (item.valorB / maiorValor) * 100;
              const isHovered = itemHover?.categoria === item.categoria;

              return (
                <div
                  key={item.categoria}
                  onMouseEnter={() => setItemHover(item)}
                  onMouseLeave={() => setItemHover(null)}
                  className={`flex-1 flex flex-col items-center justify-end h-full group cursor-pointer transition-all duration-200 ${
                    isHovered ? 'scale-105' : ''
                  }`}
                >
                  {/* Totalizador no topo do dia */}
                  <span className="text-[10px] font-extrabold text-slate-400 mb-1 group-hover:text-[#0b2545] transition-colors">
                    {item.valorA + item.valorB > 0 ? item.valorA + item.valorB : ''}
                  </span>

                  {/* Par de Colunas (Matutino / Vespertino) */}
                  <div className="flex items-end justify-center gap-1 w-full max-w-[42px] h-full">
                    {/* Coluna Matutino */}
                    <div
                      className="flex-1 rounded-t-lg bg-gradient-to-t from-blue-600 to-sky-400 shadow-xs transition-all duration-500 group-hover:brightness-110 relative"
                      style={{ height: `${Math.max(alturaA, item.valorA ? 10 : 3)}%` }}
                      title={`${item.categoria} - ${rotuloSerieA}: ${item.valorA}`}
                    >
                      {item.valorA > 0 && (
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.valorA}
                        </span>
                      )}
                    </div>

                    {/* Coluna Vespertino */}
                    <div
                      className="flex-1 rounded-t-lg bg-gradient-to-t from-indigo-600 to-purple-400 shadow-xs transition-all duration-500 group-hover:brightness-110 relative"
                      style={{ height: `${Math.max(alturaB, item.valorB ? 10 : 3)}%` }}
                      title={`${item.categoria} - ${rotuloSerieB}: ${item.valorB}`}
                    >
                      {item.valorB > 0 && (
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.valorB}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rótulo da Categoria (Seg, Ter, etc.) */}
                  <span
                    className={`mt-2 text-[10.5px] font-bold uppercase tracking-wider transition-colors ${
                      isHovered ? 'text-blue-700 font-black' : 'text-slate-500'
                    }`}
                  >
                    {item.categoria}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Dica / Resumo do dia focado */}
          {itemHover && (
            <div className="mt-3 flex items-center justify-center gap-4 text-xs font-bold text-slate-700 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs animate-fade-in">
              <span className="text-blue-900 font-extrabold uppercase">{itemHover.categoria}:</span>
              <span className="text-blue-700">Manhã: {itemHover.valorA} consultas</span>
              <span className="text-indigo-700">Tarde: {itemHover.valorB} consultas</span>
              <span className="text-slate-500 font-semibold">
                Total: {itemHover.valorA + itemHover.valorB}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

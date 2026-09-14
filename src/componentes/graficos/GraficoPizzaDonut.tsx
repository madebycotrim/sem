import { type FC, useState, useId } from 'react';

export interface ItemGraficoPizza {
  id: string;
  rotulo: string;
  valor: number;
  corHex: string;
  subrotulo?: string;
}

interface GraficoPizzaDonutProps {
  titulo: string;
  subtitulo?: string;
  dados: ItemGraficoPizza[];
  tamanho?: number;
  larguraAnel?: number;
  rotuloCentroPadrao?: string;
  subrotuloCentroPadrao?: string;
  iconeCabecalho?: React.ReactNode;
}

export const GraficoPizzaDonut: FC<GraficoPizzaDonutProps> = ({
  titulo,
  subtitulo,
  dados,
  tamanho = 220,
  larguraAnel = 28,
  rotuloCentroPadrao = 'Total',
  subrotuloCentroPadrao = 'consultas',
  iconeCabecalho,
}) => {
  const [fatiaHover, setFatiaHover] = useState<ItemGraficoPizza | null>(null);
  const idGradiente = useId();

  const total = dados.reduce((acc, item) => acc + item.valor, 0);

  // Raio do anel
  const raioExterno = tamanho / 2 - 10;
  const raioInterno = raioExterno - larguraAnel;
  const centro = tamanho / 2;

  // Calcula os arcos para cada fatia
  let acumuladorAngulo = -Math.PI / 2; // Começa no topo (12 horas)

  const fatias = dados
    .filter((d) => d.valor > 0)
    .map((item) => {
      const proporcao = total > 0 ? item.valor / total : 0;
      const anguloFatia = proporcao * 2 * Math.PI;

      const anguloInicial = acumuladorAngulo;
      const anguloFinal = acumuladorAngulo + anguloFatia;
      acumuladorAngulo = anguloFinal;

      // Se for quase 100%, recorta levemente para não quebrar a sintaxe do SVG arc
      const anguloEfetivoFinal = Math.min(anguloFinal, anguloInicial + 2 * Math.PI - 0.0001);

      const x1 = centro + raioExterno * Math.cos(anguloInicial);
      const y1 = centro + raioExterno * Math.sin(anguloInicial);
      const x2 = centro + raioExterno * Math.cos(anguloEfetivoFinal);
      const y2 = centro + raioExterno * Math.sin(anguloEfetivoFinal);

      const x3 = centro + raioInterno * Math.cos(anguloEfetivoFinal);
      const y3 = centro + raioInterno * Math.sin(anguloEfetivoFinal);
      const x4 = centro + raioInterno * Math.cos(anguloInicial);
      const y4 = centro + raioInterno * Math.sin(anguloInicial);

      const arcoGrande = anguloFatia > Math.PI ? 1 : 0;

      const path = [
        `M ${x1} ${y1}`,
        `A ${raioExterno} ${raioExterno} 0 ${arcoGrande} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${raioInterno} ${raioInterno} 0 ${arcoGrande} 0 ${x4} ${y4}`,
        'Z',
      ].join(' ');

      return {
        ...item,
        proporcao,
        percentual: (proporcao * 100).toFixed(1),
        path,
      };
    });

  const itemAtivo = fatiaHover || (fatias.length > 0 ? fatias[0] : null);

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200/80 bg-slate-50/30 p-5 sm:p-6 shadow-2xs">
      {/* Cabeçalho do Card */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-200/70 pb-3.5">
        <div className="flex items-center gap-2.5">
          {iconeCabecalho && (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              {iconeCabecalho}
            </div>
          )}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#0b2545]">{titulo}</h3>
            {subtitulo && <p className="text-[11px] text-slate-400">{subtitulo}</p>}
          </div>
        </div>
        <span className="rounded-xl bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 border border-slate-200/80">
          {total} registros
        </span>
      </div>

      {total === 0 ? (
        <div className="my-auto flex h-52 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-xs font-medium text-slate-400">
          Sem dados suficientes para exibição do gráfico
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto pt-2">
          {/* Gráfico Donut SVG */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg
              width={tamanho}
              height={tamanho}
              viewBox={`0 0 ${tamanho} ${tamanho}`}
              className="overflow-visible"
            >
              <defs>
                <filter id={`sombra-${idGradiente}`} x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
                </filter>
              </defs>

              {/* Fundo vazio circular sutil */}
              <circle
                cx={centro}
                cy={centro}
                r={(raioExterno + raioInterno) / 2}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={larguraAnel}
              />

              {/* Fatias renderizadas */}
              {fatias.map((fatia) => {
                const isHovered = fatiaHover?.id === fatia.id;
                return (
                  <path
                    key={fatia.id}
                    d={fatia.path}
                    fill={fatia.corHex}
                    filter={isHovered ? `url(#sombra-${idGradiente})` : undefined}
                    className="cursor-pointer transition-all duration-300 hover:opacity-95"
                    style={{
                      transformOrigin: `${centro}px ${centro}px`,
                      transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                      transition: 'transform 0.2s ease, opacity 0.2s ease',
                    }}
                    onMouseEnter={() => setFatiaHover(fatia)}
                    onMouseLeave={() => setFatiaHover(null)}
                  />
                );
              })}
            </svg>

            {/* Miolo Central Interativo */}
            <div
              className="pointer-events-none absolute flex flex-col items-center justify-center text-center max-w-[110px]"
              style={{
                width: raioInterno * 2 - 4,
                height: raioInterno * 2 - 4,
              }}
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate w-full px-1">
                {fatiaHover ? fatiaHover.rotulo : rotuloCentroPadrao}
              </span>
              <span className="text-2xl font-black text-[#0b2545] tracking-tight animate-fade-in">
                {fatiaHover ? fatiaHover.valor : total}
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                {fatiaHover ? `${((fatiaHover.valor / total) * 100).toFixed(1)}%` : subrotuloCentroPadrao}
              </span>
            </div>
          </div>

          {/* Legenda Lateral Interativa */}
          <div className="flex-1 w-full space-y-2">
            {dados.map((item) => {
              const perc = total > 0 ? ((item.valor / total) * 100).toFixed(1) : '0';
              const isHovered = itemAtivo?.id === item.id;

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setFatiaHover(item)}
                  onMouseLeave={() => setFatiaHover(null)}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all duration-200 cursor-pointer border ${
                    isHovered
                      ? 'bg-white border-blue-200 shadow-2xs scale-[1.01]'
                      : 'bg-white/60 border-slate-200/60 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="h-3 w-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: item.corHex }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{item.rotulo}</p>
                      {item.subrotulo && (
                        <p className="text-[10px] text-slate-400 truncate">{item.subrotulo}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-slate-400">{perc}%</span>
                    <span className="text-xs font-black text-[#0b2545] bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/80">
                      {item.valor}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

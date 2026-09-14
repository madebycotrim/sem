import { type FC, useState, useId } from 'react';
import { TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';

export interface PontoLinhaDoTempo {
  dataIso: string;
  rotulo: string; // Ex: '14/05' ou 'Segunda'
  total: number;
  detalhes?: string;
}

interface GraficoLinhaDoTempoProps {
  titulo: string;
  subtitulo?: string;
  pontos: PontoLinhaDoTempo[];
  altura?: number;
}

export const GraficoLinhaDoTempo: FC<GraficoLinhaDoTempoProps> = ({
  titulo,
  subtitulo,
  pontos,
  altura = 240,
}) => {
  const [pontoHover, setPontoHover] = useState<PontoLinhaDoTempo | null>(null);
  const [modoAcumulado, setModoAcumulado] = useState(false);
  const idGradiente = useId();

  // Dados calculados para exibição (diário ou acumulado)
  const dadosEfetivos = pontos.map((p, idx) => {
    if (!modoAcumulado) return p;
    const somaAteAqui = pontos.slice(0, idx + 1).reduce((acc, curr) => acc + curr.total, 0);
    return {
      ...p,
      total: somaAteAqui,
    };
  });

  const totalGeral = pontos.reduce((acc, p) => acc + p.total, 0);
  const valores = dadosEfetivos.map((p) => p.total);
  const maxValor = Math.max(...valores, 1);
  const minValor = 0;
  const media = pontos.length > 0 ? totalGeral / pontos.length : 0;

  // Dimensões internas do SVG
  const larguraSvg = 650;
  const paddingX = 45;
  const paddingTop = 30;
  const paddingBottom = 40;
  const alturaGrafico = altura - paddingTop - paddingBottom;
  const larguraGrafico = larguraSvg - paddingX * 2;

  // Mapeamento dos pontos em coordenadas cartesianas
  const coordenadas = dadosEfetivos.map((p, idx) => {
    const x =
      dadosEfetivos.length === 1
        ? larguraSvg / 2
        : paddingX + (idx / (dadosEfetivos.length - 1)) * larguraGrafico;
    const y = paddingTop + alturaGrafico - (p.total / maxValor) * alturaGrafico;
    return { x, y, ponto: p };
  });

  // Geração do path SVG com curva suave Bézier
  const gerarCaminhoSuave = () => {
    if (coordenadas.length === 0) return '';
    if (coordenadas.length === 1) {
      return `M ${coordenadas[0].x - 20} ${coordenadas[0].y} L ${coordenadas[0].x + 20} ${coordenadas[0].y}`;
    }

    let d = `M ${coordenadas[0].x} ${coordenadas[0].y}`;
    for (let i = 0; i < coordenadas.length - 1; i++) {
      const pAtual = coordenadas[i];
      const pProx = coordenadas[i + 1];
      const cx1 = pAtual.x + (pProx.x - pAtual.x) / 2;
      const cy1 = pAtual.y;
      const cx2 = pAtual.x + (pProx.x - pAtual.x) / 2;
      const cy2 = pProx.y;
      d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pProx.x} ${pProx.y}`;
    }
    return d;
  };

  const caminhoLinha = gerarCaminhoSuave();
  const caminhoArea =
    coordenadas.length > 0
      ? `${caminhoLinha} L ${coordenadas[coordenadas.length - 1].x} ${paddingTop + alturaGrafico} L ${coordenadas[0].x} ${paddingTop + alturaGrafico} Z`
      : '';

  // Ponto de maior pico
  const pontoPico = coordenadas.reduce(
    (max, c) => (c.ponto.total > (max?.ponto.total || 0) ? c : max),
    coordenadas[0]
  );

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200/80 bg-slate-50/30 p-5 sm:p-6 shadow-2xs">
      {/* Cabeçalho */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#0b2545]">{titulo}</h3>
            {subtitulo && <p className="text-[11px] text-slate-400">{subtitulo}</p>}
          </div>
        </div>

        {/* Controles de visualização */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-white p-1 border border-slate-200/80 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setModoAcumulado(false)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                !modoAcumulado
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              Frequência Diária
            </button>
            <button
              type="button"
              onClick={() => setModoAcumulado(true)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                modoAcumulado
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              Curva Acumulada
            </button>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 border border-slate-200/80">
            <Calendar className="h-3 w-3 text-blue-600" />
            {pontos.length} períodos
          </span>
        </div>
      </div>

      {pontos.length === 0 ? (
        <div className="my-auto flex h-52 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-xs font-medium text-slate-400">
          Nenhum registro cronológico encontrado no período filtrado
        </div>
      ) : (
        <div className="relative w-full overflow-hidden my-auto">
          {/* Métricas rápidas no topo do gráfico */}
          <div className="mb-2 flex items-center justify-between text-[11px] px-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-bold text-slate-600">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                Média:{' '}
                <strong className="text-blue-950 font-black">
                  {media.toFixed(1)} / período
                </strong>
              </span>
              {pontoPico && pontoPico.ponto.total > 0 && (
                <span className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <ArrowUpRight className="h-3 w-3" />
                  Pico: {pontoPico.ponto.total} ({pontoPico.ponto.rotulo})
                </span>
              )}
            </div>
            <span className="text-slate-400 font-semibold">
              Volume Máx: <strong className="text-slate-700">{maxValor}</strong>
            </span>
          </div>

          {/* Gráfico SVG Responsivo */}
          <div className="relative w-full">
            <svg
              viewBox={`0 0 ${larguraSvg} ${altura}`}
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id={`gradiente-${idGradiente}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.32" />
                  <stop offset="85%" stopColor="#2563eb" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
                <filter id={`glow-${idGradiente}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#2563eb" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Linhas de Grade Horizontais (Grid) */}
              {[0, 0.25, 0.5, 0.75, 1].map((fator) => {
                const yLinha = paddingTop + alturaGrafico * (1 - fator);
                const valorRef = Math.round(minValor + (maxValor - minValor) * fator);
                return (
                  <g key={fator}>
                    <line
                      x1={paddingX}
                      y1={yLinha}
                      x2={larguraSvg - paddingX}
                      y2={yLinha}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 8}
                      y={yLinha + 3.5}
                      textAnchor="end"
                      className="text-[9.5px] font-bold fill-slate-400"
                    >
                      {valorRef}
                    </text>
                  </g>
                );
              })}

              {/* Área Sombreada */}
              {caminhoArea && (
                <path
                  d={caminhoArea}
                  fill={`url(#gradiente-${idGradiente})`}
                  className="transition-all duration-500 ease-out"
                />
              )}

              {/* Linha da Curva Temporal */}
              {caminhoLinha && (
                <path
                  d={caminhoLinha}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={`url(#glow-${idGradiente})`}
                  className="transition-all duration-500 ease-out"
                />
              )}

              {/* Linha de Referência da Média */}
              {media > 0 && (
                <line
                  x1={paddingX}
                  y1={paddingTop + alturaGrafico - (media / maxValor) * alturaGrafico}
                  x2={larguraSvg - paddingX}
                  y2={paddingTop + alturaGrafico - (media / maxValor) * alturaGrafico}
                  stroke="#10b981"
                  strokeDasharray="3 3"
                  strokeWidth="1.5"
                  opacity="0.65"
                />
              )}

              {/* Pontos Interativos */}
              {coordenadas.map(({ x, y, ponto }) => {
                const isHovered = pontoHover?.dataIso === ponto.dataIso;
                const isPico = pontoPico && pontoPico.ponto.dataIso === ponto.dataIso && ponto.total > 0;

                return (
                  <g
                    key={ponto.dataIso}
                    className="cursor-pointer group"
                    onMouseEnter={() => setPontoHover(ponto)}
                    onMouseLeave={() => setPontoHover(null)}
                  >
                    {/* Área de clique invisível ampliada */}
                    <circle cx={x} cy={y} r="18" fill="transparent" />

                    {/* Halo de foco ao passar o mouse ou no ponto de pico */}
                    {(isHovered || isPico) && (
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? '9' : '7'}
                        fill={isPico ? '#f59e0b' : '#3b82f6'}
                        opacity={isHovered ? '0.25' : '0.2'}
                        className="animate-pulse"
                      />
                    )}

                    {/* Ponto Central */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? '5.5' : isPico ? '4.5' : '3.5'}
                      fill="#ffffff"
                      stroke={isPico ? '#f59e0b' : '#2563eb'}
                      strokeWidth={isHovered ? '3' : '2.5'}
                      className="transition-all duration-200"
                    />

                    {/* Rótulo do Eixo X em baixo */}
                    <text
                      x={x}
                      y={altura - 12}
                      textAnchor="middle"
                      className={`text-[9.5px] font-bold transition-colors ${
                        isHovered ? 'fill-blue-700 font-black' : 'fill-slate-500'
                      }`}
                    >
                      {ponto.rotulo}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Tooltip Dinâmico */}
            {pontoHover && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none z-20 rounded-xl border border-blue-200 bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-sm transition-all duration-200 text-center animate-fade-in">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {pontoHover.rotulo} {pontoHover.dataIso ? `(${pontoHover.dataIso})` : ''}
                </p>
                <p className="text-sm font-black text-[#0b2545]">
                  {pontoHover.total} <span className="text-xs font-semibold text-slate-500">consultas</span>
                </p>
                {pontoHover.detalhes && (
                  <p className="text-[10px] font-semibold text-blue-600">{pontoHover.detalhes}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

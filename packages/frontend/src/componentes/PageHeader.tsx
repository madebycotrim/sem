import { type FC, type ReactNode } from 'react';

interface PageHeaderProps {
  titulo: string;
  subtitulo: string;
  acoesDireitas?: ReactNode;
}

export const PageHeader: FC<PageHeaderProps> = ({
  titulo,
  subtitulo,
  acoesDireitas,
}) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
      <div>
        <h1 className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-[#0b2545] leading-tight font-sans">
          {titulo}
        </h1>
        <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mt-0.5">
          {subtitulo}
        </p>
      </div>

      {acoesDireitas && (
        <div className="flex items-center gap-2.5 flex-wrap">
          {acoesDireitas}
        </div>
      )}
    </header>
  );
};

import { Brain, Ear, Eye, Leaf, Sparkles, type LucideIcon } from 'lucide-react';
import { ESPECIALIDADE_LABELS, type Especialidade } from '../../compartilhado/index.ts';

export interface EstiloEspecialidade {
  icone: LucideIcon;
  barra: string;
  texto: string;
  fundo: string;
  borda: string;
}

export const obterEstiloEspecialidade = (especialidade?: string | null): EstiloEspecialidade => {
  switch (especialidade?.toUpperCase()) {
    case 'AUDIOMETRIA':
      return { icone: Ear, barra: '#3b82f6', texto: 'text-blue-700', fundo: 'bg-blue-50', borda: 'border-blue-200' };
    case 'NUTRICAO':
      return { icone: Leaf, barra: '#22c55e', texto: 'text-green-700', fundo: 'bg-green-50', borda: 'border-green-200' };
    case 'PSICOLOGIA':
      return { icone: Brain, barra: '#6366f1', texto: 'text-indigo-700', fundo: 'bg-indigo-50', borda: 'border-indigo-200' };
    case 'ODONTOLOGIA':
      return { icone: Sparkles, barra: '#f43f5e', texto: 'text-rose-700', fundo: 'bg-rose-50', borda: 'border-rose-200' };
    case 'OFTALMOLOGIA':
    case 'OTALMOLOGIA':
      return { icone: Eye, barra: '#14b8a6', texto: 'text-teal-700', fundo: 'bg-teal-50', borda: 'border-teal-200' };
    default:
      return { icone: Sparkles, barra: '#64748b', texto: 'text-slate-700', fundo: 'bg-slate-50', borda: 'border-slate-200' };
  }
};

export const obterNomeEspecialidade = (especialidade?: string | null) =>
  especialidade ? ESPECIALIDADE_LABELS[especialidade as Especialidade] ?? especialidade : 'Sem especialidade';

export const EspecialidadeBadge = ({
  especialidade,
  compacto = false,
}: {
  especialidade?: string | null;
  compacto?: boolean;
}) => {
  const estilo = obterEstiloEspecialidade(especialidade);
  const Icone = estilo.icone;

  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 rounded-full border font-semibold uppercase tracking-[0.08em] ${estilo.fundo} ${estilo.borda} ${estilo.texto} ${compacto ? 'px-2 py-1 text-[9px]' : 'px-2.5 py-1 text-[10px]'}`}>
      <Icone className={compacto ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5 shrink-0'} />
      <span className="truncate">{obterNomeEspecialidade(especialidade)}</span>
    </span>
  );
};

export const EspecialidadeIcone = ({ especialidade, className = 'h-4 w-4' }: { especialidade?: string | null; className?: string }) => {
  const Icone = obterEstiloEspecialidade(especialidade).icone;
  return <Icone className={className} />;
};

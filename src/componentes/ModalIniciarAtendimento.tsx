import { type FC, useState, useEffect, useRef } from 'react';
import {
  Building2,
  Check,
  FileText,
} from 'lucide-react';
import {
  Modal,
  BotaoModal,
  ModalCampo,
} from './Modal.tsx';
import { type Especialidade } from '../../compartilhado/index.ts';
import { EspecialidadeBadge, obterEstiloEspecialidade } from './EspecialidadeVisual.tsx';
import { censurarCpf } from './TabelaPacientes.tsx';

export interface DadosAtendimento {
  itemId: string;
  pacienteNome: string;
  cpf?: string;
  idade: number;
  escolaNome: string;
  especialidade: Especialidade;
  profissional?: string;
  profissionalRegistro?: string;
  horarioChegada: string;
}

export interface ModalIniciarAtendimentoProps {
  aberto: boolean;
  dados: DadosAtendimento | null;
  aoFechar: () => void;
  aoConfirmar: (itemId: string, anotacoes: string) => Promise<void> | void;
}

/** Gera iniciais do nome */
const obterIniciais = (nome: string): string => {
  const partes = nome.trim().split(' ');
  if (partes.length >= 2) return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
  return nome.charAt(0).toUpperCase();
};

/** Cores de avatar por letra */
const obterCorAvatar = (nome: string): string => {
  const cores = [
    'bg-blue-100 text-blue-700',
    'bg-violet-100 text-violet-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
  ];
  return cores[nome.charCodeAt(0) % cores.length];
};

export const ModalIniciarAtendimento: FC<ModalIniciarAtendimentoProps> = ({
  aberto,
  dados,
  aoFechar,
  aoConfirmar,
}) => {
  const [anotacoes, setAnotacoes] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Resetar e focar ao abrir
  useEffect(() => {
    if (aberto) {
      setAnotacoes('');
      setTimeout(() => textareaRef.current?.focus(), 200);
    }
  }, [aberto]);

  if (!dados) return null;

  const estilo = obterEstiloEspecialidade(dados.especialidade);
  const IconeEsp = estilo.icone;
  const iniciais = obterIniciais(dados.pacienteNome);
  const corAvatar = obterCorAvatar(dados.pacienteNome);

  const handleConfirmar = async () => {
    await aoConfirmar(dados.itemId, anotacoes.trim());
    aoFechar();
  };

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Finalizar Atendimento"
      subtitulo="Registre as informações da consulta antes de finalizar."
      tamanho="lg"
      icone={<Check className="w-5 h-5 text-blue-600" />}
      contentClassName="p-0"
      rodape={
        <>
          <BotaoModal variante="secundario" rotulo="Cancelar" aoClicar={aoFechar} />
          <BotaoModal
            variante="primario"
            rotulo={
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Finalizar Atendimento
              </span>
            }
            aoClicar={handleConfirmar}
          />
        </>
      }
    >
      <div className="bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_72%)] px-7 py-7 space-y-5">

        <div className="flex items-center justify-between gap-3 px-1">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-600">Etapa 2 de 2</p>
            <p className="mt-1 text-[13px] font-bold text-slate-800">Finalize o atendimento deste paciente</p>
          </div>
          <div className="flex items-center gap-1" aria-hidden="true">
            <span className="h-1.5 w-2 rounded-full bg-blue-300" />
            <span className="h-1.5 w-7 rounded-full bg-blue-600" />
          </div>
        </div>

        {/* ─── Card de Identificação ─────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 overflow-hidden">
          {/* Paciente selecionado */}
          <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-sm border border-white shadow-sm ${corAvatar}`}>
              {iniciais}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-extrabold text-slate-800 truncate">{dados.pacienteNome}</p>
              <p className="text-[11px] text-slate-400 font-medium">
                {dados.cpf ? `CPF: ${censurarCpf(dados.cpf)}` : 'CPF não informado'} · {dados.idade} anos
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg uppercase tracking-wide shrink-0">
              Selecionado
            </span>
          </div>

          {/* Instituição */}
          <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-100/80 border border-blue-200/60 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Instituição</p>
              <p className="text-[12.5px] font-bold text-slate-700 truncate">{dados.escolaNome}</p>
            </div>
          </div>

          {/* Profissional responsável */}
          <div className="px-4 py-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${estilo.fundo} border-current/20`}>
              <IconeEsp className={`w-4 h-4 ${estilo.texto}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profissional responsável</p>
              <div className="flex items-center gap-2 min-w-0">
                <p className="text-[12.5px] font-bold text-slate-700 truncate">{dados.profissional?.replace(/^Dr\.\s*/i, '') || 'Não informado'}</p>
                <EspecialidadeBadge especialidade={dados.especialidade} compacto />
              </div>
            </div>
          </div>

          {/* Horários e registro */}
          <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center gap-4 text-[11px] font-semibold text-slate-500">
            <span>Chegada: <span className="font-mono font-extrabold text-slate-800">{dados.horarioChegada}</span></span>
            <span className="w-px h-3 bg-slate-200" />
            <span>Início: <span className="font-mono font-extrabold text-slate-800">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span></span>
          </div>
        </div>

        {/* ─── Anotações da Consulta ─────────────────────────────────────── */}
        <ModalCampo
          rotulo="O que foi feito nesta consulta"
          dica="Descreva procedimentos, exames, orientações e condutas clínicas adotadas."
        >
          <div className="relative">
            <div className="absolute top-3 left-4 pointer-events-none">
              <FileText className="w-4 h-4 text-slate-300" />
            </div>
            <textarea
              ref={textareaRef}
              value={anotacoes}
              onChange={(e) => setAnotacoes(e.target.value)}
              placeholder="Descreva detalhadamente o que foi feito nesta consulta: procedimentos realizados, orientações dadas, condutas clínicas e evolução do paciente..."
              rows={7}
              className="w-full pl-10 pr-4 pt-3 pb-3 text-[13px] font-medium text-slate-800 bg-slate-50/80 border border-slate-200/90 rounded-xl outline-none resize-none transition-all duration-150 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-100 placeholder:text-slate-400 leading-relaxed"
            />
            {anotacoes.length > 0 && (
              <div className="absolute bottom-3 right-3">
                <span className="text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                  {anotacoes.length} caracteres
                </span>
              </div>
            )}
          </div>
        </ModalCampo>

      </div>
    </Modal>
  );
};

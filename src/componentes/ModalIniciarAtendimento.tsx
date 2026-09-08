import { type FC, useState, useEffect, useRef } from 'react';
import {
  Stethoscope,
  FileText,
  ClipboardList,
  Play,
} from 'lucide-react';
import {
  Modal,
  BotaoModal,
  ModalCampo,
} from './Modal.tsx';
import { ESPECIALIDADE_LABELS, type Especialidade } from '../../compartilhado/index.ts';
import { EspecialidadeBadge, obterEstiloEspecialidade } from './EspecialidadeVisual.tsx';

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
  aoConfirmar: (itemId: string, anotacoes: string) => void;
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
  const nomeEsp = ESPECIALIDADE_LABELS[dados.especialidade] || dados.especialidade;
  const iniciais = obterIniciais(dados.pacienteNome);
  const corAvatar = obterCorAvatar(dados.pacienteNome);

  const handleConfirmar = () => {
    aoConfirmar(dados.itemId, anotacoes.trim());
  };

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Iniciar Atendimento"
      subtitulo="Registre as informações da consulta antes de iniciar."
      tamanho="xl"
      icone={<Play className="w-5 h-5 text-blue-600" />}
      rodape={
        <>
          <BotaoModal variante="secundario" rotulo="Cancelar" aoClicar={aoFechar} />
          <BotaoModal
            variante="primario"
            rotulo={
              <span className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Iniciar Atendimento
              </span>
            }
            aoClicar={handleConfirmar}
          />
        </>
      }
    >
      <div className="px-6 py-5 space-y-4">

        {/* ─── Card de Identificação ─────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-hidden">
          {/* Linha de cor da especialidade */}
          <div className="h-1" style={{ backgroundColor: estilo.barra }} />

          <div className="px-4 py-4 flex items-start gap-4">
            {/* Avatar */}
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-extrabold text-base border border-white shadow-sm ${corAvatar}`}>
              {iniciais}
            </div>

            {/* Paciente info */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                Paciente
              </p>
              <h3 className="text-[15px] font-extrabold text-slate-900 leading-tight truncate">
                {dados.pacienteNome}
              </h3>
              <p className="text-[11.5px] text-slate-500 font-medium mt-0.5">
                {dados.idade} anos · {dados.escolaNome}
              </p>
            </div>

            {/* Separador */}
            <div className="w-px h-12 bg-slate-200 shrink-0 self-center" />

            {/* Profissional info */}
            {dados.profissional && (
              <div className="shrink-0 text-right min-w-0 max-w-[200px]">
                <div className="flex items-center justify-end gap-1 mb-0.5">
                  <Stethoscope className="w-3 h-3 text-slate-400" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Responsável
                  </p>
                </div>
                <p className="text-[13px] font-extrabold text-slate-800 leading-tight truncate">
                  {dados.profissional}
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-1.5 flex-wrap">
                  {dados.profissionalRegistro && (
                    <span className="text-[10.5px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                      {dados.profissionalRegistro}
                    </span>
                  )}
                  <EspecialidadeBadge especialidade={dados.especialidade} compacto />
                </div>
              </div>
            )}
          </div>

          {/* Rodapé info: horários + especialidade */}
          <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center gap-4 text-[11px] font-semibold text-slate-500">
            <span>
              Chegada:{' '}
              <span className="font-mono font-extrabold text-slate-800">{dados.horarioChegada}</span>
            </span>
            <span className="w-px h-3 bg-slate-200" />
            <span>
              Início:{' '}
              <span className="font-mono font-extrabold text-slate-800">
                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </span>
            <span className="w-px h-3 bg-slate-200" />
            <span className="flex items-center gap-1.5">
              <IconeEsp className="w-3.5 h-3.5" style={{ color: estilo.barra }} />
              <span style={{ color: estilo.barra }} className="font-bold">{nomeEsp}</span>
            </span>
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

        {/* ─── Info: Ação que será realizada ────────────────────────────── */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
          <ClipboardList className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[11.5px] font-medium text-blue-700 leading-relaxed">
            Ao confirmar, o paciente será movido para <strong className="font-extrabold">Em Atendimento</strong> e o atendimento ficará registrado no histórico clínico.
            As anotações são opcionais e podem ser complementadas após o atendimento.
          </p>
        </div>

      </div>
    </Modal>
  );
};

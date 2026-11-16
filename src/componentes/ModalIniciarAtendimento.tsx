import { type FC, useState, useEffect, useRef } from 'react';
import {
  Building2,
  Check,
  FileText,
  Loader2,
  Lock,
  AlertCircle,
} from 'lucide-react';
import {
  Modal,
  BotaoModal,
  ModalCampo,
} from './Modal.tsx';
import { type Especialidade, formatarHoraBrasilia } from '../../compartilhado/index.ts';
import { EspecialidadeBadge, obterEstiloEspecialidade } from './EspecialidadeVisual.tsx';
import { censurarCpf } from './TabelaPacientes.tsx';

export interface DadosAtendimento {
  itemId: string;
  atendimentoId?: string;
  pacienteId?: string;
  escolaId?: string;
  pacienteNome: string;
  cpf?: string;
  idade: number;
  escolaNome: string;
  especialidade: Especialidade;
  profissional?: string;
  profissionalId?: string;
  profissionalRegistro?: string;
  profissionalConselho?: string;
  horarioChegada: string;
  anotacoes?: string;
  sigiloRestrito?: boolean;
}

export interface ModalIniciarAtendimentoProps {
  aberto: boolean;
  dados: DadosAtendimento | null;
  aoFechar: () => void;
  aoConfirmar: (itemId: string, anotacoes: string, dados: DadosAtendimento) => Promise<void> | void;
  somenteLeitura?: boolean;
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

const TEXTO_PADRAO_ATENDIMENTO =
  'Atendimento realizado sem intercorrências. Paciente orientado quanto às condutas clínicas.';
const TEXTO_PLACEHOLDER_CHECKIN = 'Check-in realizado. Prontuário aguardando atendimento.';

export const ModalIniciarAtendimento: FC<ModalIniciarAtendimentoProps> = ({
  aberto,
  dados,
  aoFechar,
  aoConfirmar,
  somenteLeitura = false,
}) => {
  const ehTextoReal = (texto?: string) => {
    const limpo = (texto || '').trim();
    return Boolean(limpo) && limpo !== TEXTO_PLACEHOLDER_CHECKIN;
  };

  const obterTextoInicial = () => {
    if (somenteLeitura) return dados?.anotacoes || '';
    return ehTextoReal(dados?.anotacoes) ? (dados?.anotacoes || '') : TEXTO_PADRAO_ATENDIMENTO;
  };

  const [anotacoes, setAnotacoes] = useState(obterTextoInicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mantém dados existentes ao editar e foca ao abrir
  useEffect(() => {
    if (aberto) {
      setAnotacoes(obterTextoInicial());
      setErro(null);
      setSalvando(false);
      if (!somenteLeitura) {
        setTimeout(() => textareaRef.current?.focus(), 200);
      }
    }
  }, [aberto, dados?.anotacoes, dados?.itemId, somenteLeitura]);

  if (!dados) return null;

  const estilo = obterEstiloEspecialidade(dados.especialidade);
  const IconeEsp = estilo.icone;
  const iniciais = obterIniciais(dados.pacienteNome);
  const corAvatar = obterCorAvatar(dados.pacienteNome);

  const handleConfirmar = async () => {
    const textoLimpo = anotacoes.trim();

    try {
      setSalvando(true);
      setErro(null);
      await aoConfirmar(dados.itemId, textoLimpo, dados);
      aoFechar();
    } catch (err: any) {
      setErro(err?.message || 'Não foi possível salvar o atendimento no banco de dados. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const textoInicialAtual = obterTextoInicial().trim();
  const temAlteracoesNaoSalvas =
    !somenteLeitura &&
    anotacoes.trim().length > 0 &&
    anotacoes.trim() !== textoInicialAtual;

  return (
    <Modal
      aberto={aberto}
      aoFechar={() => {
        if (!salvando) aoFechar();
      }}
      temDadosPreenchidos={temAlteracoesNaoSalvas}
      titulo={somenteLeitura ? "Prontuário do Atendimento" : "Finalizar Atendimento"}
      subtitulo={somenteLeitura ? "Registro clínico e anotações do atendimento finalizado." : "Registre as informações da consulta antes de finalizar."}
      tamanho="lg"
      icone={somenteLeitura ? <FileText className="w-5 h-5 text-blue-600" /> : <Check className="w-5 h-5 text-blue-600" />}
      contentClassName="p-0"
      rodape={
        somenteLeitura ? (
          <BotaoModal
            variante="secundario"
            rotulo="Fechar"
            aoClicar={aoFechar}
          />
        ) : (
          <>
            <BotaoModal
              variante="secundario"
              rotulo="Cancelar"
              aoClicar={aoFechar}
              desabilitado={salvando}
            />
            <BotaoModal
              variante="primario"
              desabilitado={salvando}
              rotulo={
                <span className="flex items-center gap-2">
                  {salvando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando no banco...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Salvar Atendimento
                    </>
                  )}
                </span>
              }
              aoClicar={handleConfirmar}
            />
          </>
        )
      }
    >
      <div className="bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_72%)] px-7 py-7 space-y-5">

        {somenteLeitura ? (
          <div className="flex items-center justify-between gap-3 px-1">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl shadow-2xs">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Atendimento Concluído
              </span>
              <p className="mt-1 text-[13px] font-bold text-slate-800">Prontuário Clínico Registrado</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-xl">
              Modo de Leitura
            </span>
          </div>
        ) : (
          <div className="px-1">
            <p className="text-[13px] font-bold text-slate-800">Finalize o atendimento deste paciente</p>
          </div>
        )}

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
                <p className="text-[12.5px] font-bold text-slate-700 truncate">{dados.profissional?.replace(/^(Dr\.ª?|Dra?\.?)\s*/i, '') || 'Não informado'}</p>
                <EspecialidadeBadge especialidade={dados.especialidade} compacto />
              </div>
            </div>
          </div>

          {/* Horários e registro */}
          <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center gap-4 text-[11px] font-semibold text-slate-500">
            <span>Chegada: <span className="font-mono font-extrabold text-slate-800">{dados.horarioChegada}</span></span>
            <span className="w-px h-3 bg-slate-200" />
            <span>Início: <span className="font-mono font-extrabold text-slate-800">{formatarHoraBrasilia(new Date())}</span></span>
          </div>
        </div>

        {/* ─── Anotações da Consulta ─────────────────────────────────────── */}
        {somenteLeitura ? (
          <ModalCampo
            rotulo="Evolução e Conduta Clínica Registrada"
            dica="Anotações e procedimentos salvos pelo profissional responsável no encerramento da consulta."
          >
            {dados.sigiloRestrito ? (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/90 text-[13px] text-amber-900 leading-relaxed min-h-[130px] flex items-center">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-[13px] text-amber-950">
                      Conteúdo protegido por sigilo profissional
                    </p>
                    <p className="text-[12px] text-amber-800/90 leading-relaxed">
                      A evolução e a conduta clínica deste atendimento são restritas ao profissional de saúde responsável pelo registro (LGPD / Sigilo Profissional).
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/90 text-[13px] font-medium text-slate-800 leading-relaxed whitespace-pre-wrap select-text min-h-[130px]">
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    {anotacoes && anotacoes.trim() ? (
                      <p className="text-slate-800 font-normal leading-relaxed">{anotacoes}</p>
                    ) : (
                      <p className="text-slate-400 italic">Nenhuma anotação registrada para este atendimento.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </ModalCampo>
        ) : (
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
            {erro && (
              <div className="mt-2.5 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{erro}</span>
              </div>
            )}
          </ModalCampo>
        )}

      </div>
    </Modal>
  );
};

import { useState, useEffect } from 'react';
import type { ItemPaciente } from './TabelaPacientes.tsx';
import {
  validarComprovanteCatraki,
  type DetalhesValidacaoCatraki,
  sanitizarCpf,
} from '../servicos/servicoCatraki.ts';
import { Modal, BotaoModal } from './Modal.tsx';
import { Check, CircleAlert, ExternalLink, LoaderCircle, ShieldCheck } from 'lucide-react';

interface ModalValidacaoCatrakiProps {
  aberto: boolean;
  paciente: ItemPaciente | null;
  aoFechar: () => void;
}

export function ModalValidacaoCatraki({
  aberto,
  paciente,
  aoFechar,
}: ModalValidacaoCatrakiProps) {
  const [carregando, setCarregando] = useState(false);
  const [detalhes, setDetalhes] = useState<DetalhesValidacaoCatraki | null>(null);
  const [validadoComSucesso, setValidadoComSucesso] = useState(false);

  useEffect(() => {
    if (!aberto || !paciente) {
      setDetalhes(null);
      setValidadoComSucesso(false);
      return;
    }

    const carregarValidacao = async () => {
      setCarregando(true);
      const query = paciente.codigoValidacaoCatraki || sanitizarCpf(paciente.cpf);

      if (query) {
        const res = await validarComprovanteCatraki(query);
        if (res.success && res.valid && res.validation) {
          setDetalhes(res.validation);
          setValidadoComSucesso(true);
        } else {
          setDetalhes(null);
          setValidadoComSucesso(false);
        }
      } else {
        setDetalhes(null);
        setValidadoComSucesso(false);
      }
      setCarregando(false);
    };

    carregarValidacao();
  }, [aberto, paciente]);

  if (!paciente) return null;

  const dataAssinatura =
    detalhes?.signed_at_utc ||
    paciente.assinadoEmCatraki ||
    paciente.criadoEm ||
    new Date().toISOString();

  const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(dataAssinatura));

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={validadoComSucesso ? 'Autenticidade do Termo Catraki' : 'Verificação de Termo no Catraki'}
      subtitulo={validadoComSucesso ? 'Termo de Consentimento Localizado & Homologado' : 'Consulta por CPF na Base Oficial'}
      tamanho="lg"
      icone={
        <div className={validadoComSucesso ? 'text-emerald-600' : 'text-amber-600'}>
          <ShieldCheck className="w-5 h-5" />
        </div>
      }
      rodape={
        <BotaoModal
          variante="secundario"
          rotulo="Fechar"
          aoClicar={aoFechar}
        />
      }
    >
      <div className="space-y-4">
        {/* Card Estudante */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Estudante / Paciente
            </span>
            <span className="text-sm font-bold text-slate-900 block mt-0.5 truncate uppercase">
              {paciente.nome}
            </span>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
              <span>CPF: <strong className="font-mono text-slate-700">{paciente.cpf || 'Não informado'}</strong></span>
              <span>•</span>
              <span className="truncate">{paciente.escolaNome}</span>
            </div>
          </div>
          {validadoComSucesso ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Autorizado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Não Autorizado
            </span>
          )}
        </div>

        {carregando ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-500">
            <LoaderCircle className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-xs font-medium">Consultando API oficial do Catraki por CPF...</p>
          </div>
        ) : validadoComSucesso && detalhes ? (
          <div className="space-y-3.5 animate-fade-in text-xs text-slate-700">
            {/* Código Único de Validação Real */}
            <div className="bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Código Oficial de Autenticidade
                </span>
                <span className="text-sm sm:text-base font-extrabold text-emerald-950 font-mono tracking-wide block mt-0.5">
                  {detalhes.validation_code}
                </span>
              </div>
              <a
                href={`https://catraki---sesi.pages.dev/validar`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl text-[11px] transition-colors shadow-2xs whitespace-nowrap flex items-center gap-1 cursor-pointer"
              >
                <span>Conferir no Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Informações Estruturadas do Termo */}
            <div className="border border-slate-200/90 rounded-2xl p-4 space-y-2.5 bg-white shadow-2xs">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500">Status da Assinatura:</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Válida & Homologada
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500">Responsável que Assinou:</span>
                <span className="font-semibold text-slate-800">
                  {detalhes.signer_name} ({detalhes.signer_cpf_masked})
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500">Data e Hora da Assinatura:</span>
                <span className="font-medium text-slate-800">{dataFormatada}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500">Padrão Legal:</span>
                <span className="text-[11px] font-medium text-slate-700 text-right">
                  Art. 10, §2º da MP 2.200-2/2001 c/c Lei nº 14.063/2020
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Localização e IP:</span>
                <span className="font-mono text-[11px] text-slate-700">{detalhes.geolocation}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in text-xs text-slate-700">
            <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-2xl text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <CircleAlert className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                <span>Nenhum Termo Assinado Localizado no Catraki</span>
              </div>
              <p className="text-[11.5px] text-amber-800/90 leading-relaxed">
                O CPF <strong>{paciente.cpf || 'Não informado'}</strong> foi consultado na base de registros do Catraki, mas ainda não possui autorização digital assinada pelos pais ou responsáveis legais.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Como autorizar este estudante?
              </span>
              <p className="text-[11.5px] text-slate-600 leading-relaxed">
                O responsável legal pode realizar a assinatura digital em poucos segundos através do portal do projeto Escola Cidadã — Saúde em Movimento.
              </p>
              <a
                href="https://catraki---sesi.pages.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-colors shadow-xs cursor-pointer"
              >
                <span>Abrir Portal Catraki para Assinar Autorização</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

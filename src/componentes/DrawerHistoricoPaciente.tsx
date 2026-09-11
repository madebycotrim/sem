import { EspecialidadeBadge } from './EspecialidadeVisual.tsx';
import { type FC, useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ItemPaciente } from './TabelaPacientes.tsx';
import { requisicaoApi } from '../servicos/api.ts';
import { Activity, CalendarDays, Check, ChevronRight, CircleAlert, Clock3, FileText, LoaderCircle, X } from 'lucide-react';

export interface ItemHistoricoAtendimento {
  id: string;
  especialidade: string;
  status: 'CONCLUIDO' | 'AGENDADO' | 'EM_ANDAMENTO' | 'CANCELADO';
  data: string;
  hora: string;
  profissionalNome: string;
  profissionalRegistro: string;
  motivoConsulta: string;
  condutaClinica?: string;
  rawTimestamp?: number;
}

import type { ItemAtendimentoLista } from './Atendimentos.tsx';
import type { ItemFila } from './FilaDoDia.tsx';

export interface DrawerHistoricoPacienteProps {
  aberto: boolean;
  paciente: ItemPaciente | null;
  aoFechar: () => void;
  aoNovoAtendimento?: (paciente: ItemPaciente) => void;
  aoVerProntuario?: (atendimento: ItemHistoricoAtendimento) => void;
  itensFila?: ItemFila[];
  atendimentosLocais?: ItemAtendimentoLista[];
}

function normalizarStatus(status?: string): ItemHistoricoAtendimento['status'] {
  const s = String(status || '').toUpperCase();
  if (s === 'CONCLUIDO') return 'CONCLUIDO';
  if (s === 'EM_ATENDIMENTO' || s === 'EM_ANDAMENTO') return 'EM_ANDAMENTO';
  if (s === 'CANCELADO' || s === 'FALTOU') return 'CANCELADO';
  return 'AGENDADO';
}

// Função de parse seguro das datas
function formatarDataHora(dataString?: string) {
  if (!dataString) {
    const agora = new Date();
    return {
      data: agora.toLocaleDateString('pt-BR'),
      hora: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: agora.getTime(),
    };
  }

  // Se já estiver no formato brasileiro DD/MM/AAAA
  if (/^\d{2}\/\d{2}\/\d{4}/.test(dataString)) {
    const partes = dataString.slice(0, 10).split('/');
    const d = parseInt(partes[0], 10);
    const m = parseInt(partes[1], 10) - 1;
    const a = parseInt(partes[2], 10);
    const horaTexto = dataString.length > 10 ? dataString.slice(11).trim() : '--:--';
    const ts = new Date(a, m, d).getTime();
    return {
      data: dataString.slice(0, 10),
      hora: horaTexto,
      timestamp: isNaN(ts) ? Date.now() : ts,
    };
  }

  try {
    const limpa = dataString.includes(' ') && !dataString.includes('T')
      ? dataString.replace(' ', 'T')
      : dataString;
    const data = new Date(limpa);
    if (isNaN(data.getTime())) throw new Error('Data inválida');
    return {
      data: data.toLocaleDateString('pt-BR'),
      hora: data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: data.getTime(),
    };
  } catch {
    const agora = new Date();
    return {
      data: agora.toLocaleDateString('pt-BR'),
      hora: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: agora.getTime(),
    };
  }
}

export const DrawerHistoricoPaciente: FC<DrawerHistoricoPacienteProps> = ({
  aberto,
  paciente,
  aoFechar,
  aoNovoAtendimento,
  aoVerProntuario,
  itensFila = [],
  atendimentosLocais = [],
}) => {
  // Fechar no ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && aberto) {
        aoFechar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aberto, aoFechar]);

  const [historico, setHistorico] = useState<ItemHistoricoAtendimento[]>([]);
  const [carregando, setCarregando] = useState(false);

  const pacienteId = paciente?.id;
  const pacienteRef = useRef<ItemPaciente | null>(paciente);
  pacienteRef.current = paciente;
  const itensFilaRef = useRef<ItemFila[]>(itensFila);
  itensFilaRef.current = itensFila;
  const atendimentosLocaisRef = useRef<ItemAtendimentoLista[]>(atendimentosLocais);
  atendimentosLocaisRef.current = atendimentosLocais;

  useEffect(() => {
    if (!aberto || !pacienteId) {
      setHistorico([]);
      setCarregando(false);
      return;
    }

    let ativo = true;
    const buscarHistorico = async () => {
      setCarregando(true);
      try {
        let dadosApi: Array<Record<string, unknown>> = [];
        try {
          const primeiraPagina = await requisicaoApi<{
            dados: Array<Record<string, unknown>>;
            totalPaginas: number;
          }>(`/atendimentos?pacienteId=${encodeURIComponent(pacienteId)}&pagina=1&porPagina=100`);
          const paginasRestantes = Array.from(
            { length: Math.max(0, primeiraPagina.totalPaginas - 1) },
            (_, indice) => indice + 2
          );
          const respostasRestantes = await Promise.all(
            paginasRestantes.map((pagina) => requisicaoApi<{
              dados: Array<Record<string, unknown>>;
              totalPaginas: number;
            }>(`/atendimentos?pacienteId=${encodeURIComponent(paciente.id)}&pagina=${pagina}&porPagina=100`))
          );
          dadosApi = [primeiraPagina, ...respostasRestantes].flatMap((resposta) => resposta.dados || []);
        } catch {
          dadosApi = [];
        }

        if (!ativo) return;

        // Histórico completo do paciente: inclui consultas concluídas, em atendimento e agendadas
        const mapeadosApi: ItemHistoricoAtendimento[] = dadosApi.map((item) => {
          const status = normalizarStatus(String(item.status || 'CONCLUIDO'));
          const { data, hora, timestamp } = formatarDataHora(String(item.criadoEm || item.entradaFilaEm || ''));
          return {
            id: String(item.id),
            especialidade: String(item.especialidade || 'Geral'),
            status,
            data,
            hora,
            rawTimestamp: timestamp,
            profissionalNome: String(item.profissional || item.profissionalNome || 'Profissional de Saúde'),
            profissionalRegistro: String(item.profissionalRegistro || 'Registro Ativo'),
            motivoConsulta: String(item.resumo || (status === 'CONCLUIDO' ? 'Consulta clínica realizada' : 'Atendimento registrado no sistema')),
            condutaClinica: item.procedimentos || item.insumosUtilizados
              ? String(item.procedimentos || item.insumosUtilizados)
              : undefined,
          };
        });

        const idsExistentes = new Set(mapeadosApi.map((h) => h.id));

        // Mescla com atendimentosLocais (se houver atendimento recém-salvo em memória)
        const pacienteAtual = pacienteRef.current || paciente;
        const cpfLimpoPaciente = (pacienteAtual?.cpf || '').replace(/\D/g, '');
        const nomeNormalizadoPaciente = (pacienteAtual?.nome || '').trim().toLowerCase();
        const atendimentosLocais = atendimentosLocaisRef.current;
        const itensFila = itensFilaRef.current;

        const atendimentosLocaisPaciente: ItemHistoricoAtendimento[] = atendimentosLocais
          .filter((a) => {
            const mesmoId = a.pacienteId === pacienteId;
            const mesmoNome = Boolean(a.pacienteNome && a.pacienteNome.trim().toLowerCase() === nomeNormalizadoPaciente);
            return (mesmoId || mesmoNome) && !idsExistentes.has(a.id);
          })
          .map((a) => {
            idsExistentes.add(a.id);
            const status = normalizarStatus(a.status);
            const { data, hora, timestamp } = formatarDataHora(a.criadoEm || a.entradaFilaEm);
            return {
              id: a.id,
              especialidade: a.especialidade || 'Geral',
              status,
              data,
              hora,
              rawTimestamp: timestamp,
              profissionalNome: a.profissionalNome || 'Profissional de Saúde',
              profissionalRegistro: '',
              motivoConsulta: a.resumo || (status === 'CONCLUIDO' ? 'Consulta clínica realizada' : 'Atendimento registrado no sistema'),
              condutaClinica: undefined,
            };
          });

        // Mescla também com itens da Fila do Dia desse paciente
        const itensFilaPaciente: ItemHistoricoAtendimento[] = itensFila
          .filter((f) => {
            const cpfFila = (f.cpf || '').replace(/\D/g, '');
            const mesmoCpf = cpfLimpoPaciente.length === 11 && cpfFila === cpfLimpoPaciente;
            const mesmoNome = Boolean(f.pacienteNome && f.pacienteNome.trim().toLowerCase() === nomeNormalizadoPaciente);
            const mesmoId = f.pacienteId === pacienteId;
            const jaExiste = (f.atendimentoId && idsExistentes.has(f.atendimentoId)) || idsExistentes.has(f.id);
            return (mesmoId || mesmoCpf || mesmoNome) && !jaExiste;
          })
          .map((f) => {
            const idFinal = f.atendimentoId || f.id;
            idsExistentes.add(idFinal);
            idsExistentes.add(f.id);
            if (f.atendimentoId) idsExistentes.add(f.atendimentoId);

            const status = normalizarStatus(f.status);
            const parsed = formatarDataHora(f.dataChegada ? `${f.dataChegada} ${f.horarioChegada || ''}` : undefined);

            return {
              id: idFinal,
              especialidade: f.especialidade || 'Geral',
              status,
              data: f.dataChegada || parsed.data,
              hora: f.horarioChegada || parsed.hora,
              rawTimestamp: parsed.timestamp,
              profissionalNome: f.profissional || 'Profissional de Saúde',
              profissionalRegistro: f.profissionalRegistro || '',
              motivoConsulta: f.anotacoes || (status === 'CONCLUIDO' ? 'Consulta clínica realizada' : 'Paciente na fila de atendimento da unidade móvel'),
              condutaClinica: undefined,
            };
          });

        const listaFinal = [...mapeadosApi, ...atendimentosLocaisPaciente, ...itensFilaPaciente];
        listaFinal.sort((a, b) => {
          const statusPrioridade: Record<string, number> = {
            EM_ANDAMENTO: 1,
            AGENDADO: 2,
            CONCLUIDO: 3,
            CANCELADO: 4,
          };
          const prioA = statusPrioridade[a.status] || 99;
          const prioB = statusPrioridade[b.status] || 99;
          if (prioA !== prioB) return prioA - prioB;
          return (b.rawTimestamp || 0) - (a.rawTimestamp || 0);
        });

        setHistorico(listaFinal);
      } catch (err) {
        console.error('Erro ao buscar histórico do paciente:', err);
        if (ativo) setHistorico([]);
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    buscarHistorico();

    return () => { ativo = false; };
  }, [aberto, pacienteId]);

  if (!aberto || !paciente) return null;

  const totalRegistros = historico.length;

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-hidden font-sans" role="dialog" aria-modal="true" aria-labelledby="drawer-titulo">
      {/* Overlay Escuro com Animação Suave */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-250 ease-out animate-fade-in"
        onClick={aoFechar}
      />

      {/* Painel Lateral Deslizante */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <aside
          className="w-screen max-w-md sm:max-w-lg bg-slate-50 border-l border-slate-200/90 shadow-2xl flex flex-col animate-drawer"
          role="dialog"
          aria-labelledby="drawer-titulo"
        >
          {/* ─── Cabeçalho do Drawer ────────────────────────────────────────── */}
          <div className="px-5 py-4 bg-white border-b border-slate-200/90 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {/* Ícone de Documento em Badge Azul */}
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
                <FileText className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <h2 id="drawer-titulo" className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                  Histórico do Paciente
                </h2>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight truncate mt-0.5" title={paciente.nome}>
                  {paciente.nome}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-2">
              {/* Badge com quantidade de registros ou loading */}
              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-2xl text-[11px] font-bold border border-slate-200 shadow-2xs inline-flex items-center gap-1.5">
                {carregando ? (
                  <>
                    <LoaderCircle className="w-3 h-3 animate-spin text-blue-600" />
                    <span>Carregando...</span>
                  </>
                ) : (
                  <span>{totalRegistros} {totalRegistros === 1 ? 'registro' : 'registros'}</span>
                )}
              </span>

              {/* Botão Fechar (X) */}
              <button
                type="button"
                onClick={aoFechar}
                className="w-8 h-8 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                title="Fechar histórico (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ─── Conteúdo: Linha do Tempo de Atendimentos ──────────────────── */}
          <div className={`flex-1 overflow-y-auto p-5 ${carregando || historico.length === 0 ? 'flex flex-col items-center justify-center' : ''}`}>
            {carregando ? (
              /* Estado de Carregamento Suave */
              <div className="text-center max-w-xs mx-auto">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-2xs border border-blue-100">
                  <LoaderCircle className="w-6 h-6 animate-spin" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">Carregando histórico...</h3>
                <p className="text-[12.5px] text-slate-500 mt-1">
                  Buscando consultas e registros clínicos deste paciente.
                </p>
              </div>
            ) : historico.length === 0 ? (
              /* Estado Vazio Minimalista */
              <div className="text-center max-w-xs mx-auto -mt-10">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <CircleAlert className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">Nenhum atendimento registrado</h3>
                <p className="text-[13px] text-slate-500 mt-1">
                  Não há registros clínicos para este paciente.
                </p>
                {aoNovoAtendimento && (
                  <button
                    type="button"
                    onClick={() => {
                      aoFechar();
                      aoNovoAtendimento(paciente);
                    }}
                    className="mt-6 text-[13px] font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all cursor-pointer"
                  >
                    + Iniciar Primeiro Atendimento
                  </button>
                )}
              </div>
            ) : (
              /* Lista de Atendimentos com Cards 100% integrados */
              <div className="space-y-4">
                {historico.map((item) => {
                  const isConcluido = item.status === 'CONCLUIDO';

                  return (
                    <div
                      key={item.id}
                      className={`bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-colors space-y-3.5 relative overflow-hidden border-l-4 ${
                        isConcluido
                          ? 'border-l-emerald-500'
                          : item.status === 'EM_ANDAMENTO'
                            ? 'border-l-blue-500'
                            : item.status === 'CANCELADO'
                              ? 'border-l-rose-400'
                              : 'border-l-amber-400'
                      }`}
                    >
                      {/* Topo do Card: Especialidade e Status */}
                      <div className="flex items-center justify-between gap-2 relative z-10">
                        <EspecialidadeBadge especialidade={item.especialidade} compacto />

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-2xs ${
                            isConcluido
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                              : item.status === 'EM_ANDAMENTO'
                                ? 'bg-blue-50 text-blue-700 border-blue-200/80'
                                : item.status === 'CANCELADO'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                                  : 'bg-amber-50 text-amber-700 border-amber-200/80'
                          }`}
                        >
                          {isConcluido ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                          ) : item.status === 'EM_ANDAMENTO' ? (
                            <Activity className="w-3.5 h-3.5 text-blue-600" />
                          ) : item.status === 'CANCELADO' ? (
                            <X className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
                          ) : (
                            <Clock3 className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
                          )}
                          <span>
                            {item.status === 'CONCLUIDO'
                              ? 'CONCLUÍDO'
                              : item.status === 'EM_ANDAMENTO'
                                ? 'EM ATENDIMENTO'
                                : item.status === 'CANCELADO'
                                  ? 'CANCELADO'
                                  : 'AGENDADO'}
                          </span>
                        </span>
                      </div>

                      {/* Profissional e Data/Horário (Substituindo Registro Ativo) */}
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs border border-white">
                          <span className="font-bold text-[13px] tracking-tight">
                            {item.profissionalNome.replace(/^(DR\.|DRA\.)\s*/i, '').split(' ').map(n => n[0]).filter((_, i) => i < 2).join('').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-800 text-xs sm:text-sm truncate block" title={item.profissionalNome}>
                            {item.profissionalNome}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mt-0.5">
                            <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{item.data}</span>
                            {item.hora && (
                              <>
                                <span className="text-slate-300">•</span>
                                <Clock3 className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{item.hora}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bloco Motivo da Consulta (Citação destacada) */}
                      <div className="relative pl-3.5 py-2.5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-400 before:rounded-full bg-gradient-to-r from-blue-50/40 to-transparent rounded-r-2xl border-y border-r border-slate-100/50 relative z-10">
                        <p className="text-[9.5px] font-extrabold text-blue-600/90 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                          <FileText className="w-3 h-3" />
                          {isConcluido ? 'RESUMO CLÍNICO / PRONTUÁRIO' : 'DETALHES DO ATENDIMENTO'}
                        </p>
                        <p className="font-medium text-slate-700 text-[13px] leading-relaxed">
                          {item.motivoConsulta}
                        </p>
                        {item.condutaClinica && (
                          <div className="mt-2.5 pt-2.5 border-t border-slate-200/60">
                            <p className="text-[11.5px] text-slate-500 leading-relaxed">
                              <span className="font-semibold text-slate-600">Conduta / Procedimentos:</span> {item.condutaClinica}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Rodapé do Card: Ação Ver Prontuário */}
                      <div className="pt-2 flex items-center justify-between relative z-10">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          {isConcluido ? 'Prontuário Médico' : 'Fila de Atendimento'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (aoVerProntuario) {
                              aoVerProntuario(item);
                            } else if (aoNovoAtendimento) {
                              aoFechar();
                              aoNovoAtendimento(paciente);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-blue-600 font-bold rounded-xl transition-colors cursor-pointer text-[11px] group-hover:bg-blue-50 group-hover:text-blue-700"
                        >
                          <span>
                            {isConcluido
                              ? 'Ver Prontuário'
                              : item.status === 'EM_ANDAMENTO'
                                ? 'Continuar Atendimento'
                                : 'Abrir na Fila'}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>


        </aside>
      </div>
    </div>,
    document.body
  );
};

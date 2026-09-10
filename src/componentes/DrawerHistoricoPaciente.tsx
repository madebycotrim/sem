import { EspecialidadeBadge } from './EspecialidadeVisual.tsx';
import { type FC, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ItemPaciente } from './TabelaPacientes.tsx';
import { requisicaoApi } from '../servicos/api.ts';
import { CalendarDays, Check, ChevronRight, CircleAlert, Clock3, FileText, UserRound, X } from 'lucide-react';

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

// Função de parse seguro das datas da API
function formatarDataHora(dataString: string) {
  try {
    const data = new Date(dataString);
    if (isNaN(data.getTime())) throw new Error('Data inválida');
    return {
      data: data.toLocaleDateString('pt-BR'),
      hora: data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch {
    return { data: new Date().toLocaleDateString('pt-BR'), hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
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

  useEffect(() => {
    if (!aberto || !paciente) {
      setHistorico([]);
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
          }>(`/atendimentos?pacienteId=${encodeURIComponent(paciente.id)}&pagina=1&porPagina=100`);
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

        // Atendimentos do paciente vindos do banco/API
        const mapeadosApi: ItemHistoricoAtendimento[] = dadosApi.map((item) => {
          const { data, hora } = formatarDataHora(String(item.criadoEm || ''));
          return {
            id: String(item.id),
            especialidade: String(item.especialidade),
            status: (item.status || 'CONCLUIDO') as ItemHistoricoAtendimento['status'],
            data,
            hora,
            profissionalNome: String(item.profissional || 'Profissional de Saúde'),
            profissionalRegistro: 'Registro Ativo',
            motivoConsulta: String(item.resumo || 'Consulta clínica realizada'),
            condutaClinica: item.procedimentos || item.insumosUtilizados
              ? String(item.procedimentos || item.insumosUtilizados)
              : undefined,
          };
        });

        const idsExistentes = new Set(mapeadosApi.map((h) => h.id));

        // Mescla com atendimentosLocais (se houver atendimento recém-salvo em memória)
        const cpfLimpoPaciente = (paciente.cpf || '').replace(/\D/g, '');
        const atendimentosLocaisPaciente = atendimentosLocais
          .filter(
            (a) =>
              (a.pacienteId === paciente.id || a.pacienteNome === paciente.nome) &&
              !idsExistentes.has(a.id)
          )
          .map((a) => {
            const { data, hora } = formatarDataHora(a.criadoEm);
            idsExistentes.add(a.id);
            return {
              id: a.id,
              especialidade: a.especialidade,
              status: (a.status || 'CONCLUIDO') as ItemHistoricoAtendimento['status'],
              data,
              hora,
              profissionalNome: a.profissionalNome || 'Profissional de Saúde',
              profissionalRegistro: 'Registro Ativo',
              motivoConsulta: a.resumo || 'Consulta clínica realizada',
              condutaClinica: undefined,
            };
          });

        // Mescla também com itens da Fila do Dia desse paciente (caso esteja em atendimento ou com resumo na fila)
        const itensFilaPaciente = itensFila
          .filter((f) => {
            const cpfFila = (f.cpf || '').replace(/\D/g, '');
            const mesmoCpf = cpfLimpoPaciente.length === 11 && cpfFila === cpfLimpoPaciente;
            const mesmoNome = f.pacienteNome.trim().toLowerCase() === paciente.nome.trim().toLowerCase();
            const mesmoId = f.pacienteId === paciente.id;
            return (mesmoId || mesmoCpf || mesmoNome) && (!f.atendimentoId || !idsExistentes.has(f.atendimentoId));
          })
          .map((f) => {
            const data = f.dataChegada || new Date().toLocaleDateString('pt-BR');
            const hora = f.horarioChegada || '--:--';
            return {
              id: f.atendimentoId || f.id,
              especialidade: f.especialidade,
              status: (f.status === 'CONCLUIDO' ? 'CONCLUIDO' : f.status === 'CANCELADO' ? 'CANCELADO' : 'AGENDADO') as ItemHistoricoAtendimento['status'],
              data,
              hora,
              profissionalNome: f.profissional || 'Profissional de Saúde',
              profissionalRegistro: f.profissionalRegistro || 'Registro Ativo',
              motivoConsulta: f.anotacoes || 'Paciente em atendimento na unidade móvel',
              condutaClinica: undefined,
            };
          });

        const listaFinal = [...itensFilaPaciente, ...atendimentosLocaisPaciente, ...mapeadosApi];
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
  }, [paciente, aberto, itensFila, atendimentosLocais]);

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
              {/* Badge com quantidade de registros */}
              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-2xl text-[11px] font-bold border border-slate-200 shadow-2xs">
                {totalRegistros} {totalRegistros === 1 ? 'registro' : 'registros'}
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
          <div className={`flex-1 overflow-y-auto p-5 ${historico.length === 0 ? 'flex flex-col items-center justify-center' : ''}`}>
            {historico.length === 0 ? (
              /* Estado Vazio Minimalista */
              <div className="text-center max-w-xs mx-auto -mt-10">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <CircleAlert className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">Nenhum atendimento registrado</h3>
                <p className="text-[13px] text-slate-500 mt-1">
                  {carregando ? (
                    <span>Buscando histórico...</span>
                  ) : (
                    <span>Não há registros clínicos para este paciente.</span>
                  )}
                </p>
                {!carregando && aoNovoAtendimento && (
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
              /* Linha do Tempo com Cards */
              <div className="relative pl-10 space-y-8">
                {historico.map((item, index) => {
                  const isConcluido = item.status === 'CONCLUIDO';
                  const nextItem = historico[index + 1];
                  const nextIsConcluido = nextItem?.status === 'CONCLUIDO';

                  let gradientClasses = '';
                  if (nextItem) {
                    if (isConcluido && nextIsConcluido) gradientClasses = 'from-emerald-400 to-emerald-400';
                    else if (isConcluido && !nextIsConcluido) gradientClasses = 'from-emerald-400 via-slate-200 to-amber-400';
                    else if (!isConcluido && nextIsConcluido) gradientClasses = 'from-amber-400 via-slate-200 to-emerald-400';
                    else gradientClasses = 'from-amber-400 to-amber-400';
                  } else {
                    gradientClasses = isConcluido ? 'from-emerald-400 to-transparent' : 'from-amber-400 to-transparent';
                  }

                  return (
                    <div key={item.id} className="relative group/card">
                      {/* Linha vertical até o próximo item (ou fade no último) */}
                      {nextItem ? (
                        <div 
                          className={`absolute -left-[21px] top-8 bottom-[-64px] w-[2px] bg-gradient-to-b ${gradientClasses} z-0`} 
                          aria-hidden="true" 
                        />
                      ) : (
                        <div 
                          className={`absolute -left-[21px] top-8 h-24 w-[2px] bg-gradient-to-b ${gradientClasses} z-0`} 
                          aria-hidden="true" 
                        />
                      )}

                      {/* Ponto / Ícone da Linha do Tempo (Alinhamento perfeito) */}
                      <div
                        className={`absolute -left-[36px] top-4 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-transform duration-300 group-hover/card:scale-110 ${
                          isConcluido
                            ? 'bg-gradient-to-b from-emerald-400 to-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.4)]'
                            : 'bg-white text-amber-500 border-[2.5px] border-amber-400 shadow-[0_4px_12px_rgba(245,158,11,0.2)]'
                        }`}
                      >
                        {isConcluido ? (
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <Clock3 className="w-4 h-4 stroke-[2.5]" />
                        )}
                      </div>

                      {/* Card do Atendimento - Premium Design */}
                      <div className="bg-white border border-slate-200/70 rounded-[1.25rem] p-4 sm:p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_24px_-6px_rgba(6,81,237,0.15)] hover:-translate-y-0.5 transition-all duration-300 space-y-4 group/card relative overflow-hidden">
                        
                        {/* Decorador sutil de fundo */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl opacity-60 pointer-events-none" />

                        {/* Topo do Card: Especialidade e Status */}
                        <div className="flex items-center justify-between gap-2 relative z-10">
                          <EspecialidadeBadge especialidade={item.especialidade} compacto />

                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${
                              isConcluido
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100/80'
                                : 'bg-amber-50 text-amber-700 border-amber-100/80'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isConcluido ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                              }`}
                            />
                            {item.status === 'CONCLUIDO' ? 'CONCLUÍDO' : 'AGENDADO'}
                          </span>
                        </div>

                        {/* Profissional, Data e Horário */}
                        <div className="flex items-start justify-between gap-4 relative z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs border border-white">
                              <span className="font-bold text-[13px] tracking-tight">
                                {item.profissionalNome.replace(/^(DR\.|DRA\.)\s*/i, '').split(' ').map(n => n[0]).filter((_, i) => i < 2).join('').toUpperCase()}
                              </span>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-bold text-slate-800 text-sm truncate">
                                  {item.profissionalNome}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500 mt-0.5 flex items-center gap-1.5">
                                  <UserRound className="w-3 h-3 text-slate-400" />
                                  {item.profissionalRegistro}
                                </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0 bg-slate-50/80 p-2 rounded-xl border border-slate-100/80">
                            <div className="flex items-center gap-1.5 text-[10.5px] text-slate-700 font-bold">
                              <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                              {item.data}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 font-semibold">
                              <Clock3 className="w-3.5 h-3.5 text-slate-400" />
                              {item.hora}
                            </div>
                          </div>
                        </div>

                        {/* Bloco Motivo da Consulta (Citacão destacada) */}
                        <div className="relative pl-3.5 py-2.5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-300 before:rounded-full bg-gradient-to-r from-blue-50/40 to-transparent rounded-r-2xl border-y border-r border-slate-100/50 relative z-10">
                          <p className="text-[9.5px] font-extrabold text-blue-500/80 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                            <FileText className="w-3 h-3" />
                            MOTIVO DA CONSULTA
                          </p>
                          <p className="font-medium text-slate-700 text-[13px]">
                            {item.motivoConsulta}
                          </p>
                          {item.condutaClinica && (
                            <div className="mt-2.5 pt-2.5 border-t border-slate-200/60">
                                <p className="text-[11.5px] text-slate-500 leading-relaxed">
                                  <span className="font-semibold text-slate-600">Conduta:</span> {item.condutaClinica}
                                </p>
                            </div>
                          )}
                        </div>

                        {/* Rodapé do Card: Ação Ver Prontuário */}
                        <div className="pt-2 flex items-center justify-between relative z-10">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prontuário Médico</span>
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-blue-600 font-bold rounded-xl transition-colors cursor-pointer text-[11px] group-hover/card:bg-blue-50 group-hover/card:text-blue-700"
                          >
                            <span>Ver Prontuário</span>
                            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/card:translate-x-0.5" />
                          </button>
                        </div>
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

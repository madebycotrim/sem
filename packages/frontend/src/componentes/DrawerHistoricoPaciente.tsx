import { type FC, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ItemPaciente } from './TabelaPacientes.tsx';
import { requisicaoApi } from '../servicos/api.ts';

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

export interface DrawerHistoricoPacienteProps {
  aberto: boolean;
  paciente: ItemPaciente | null;
  aoFechar: () => void;
  aoNovoAtendimento?: (paciente: ItemPaciente) => void;
  aoVerProntuario?: (atendimento: ItemHistoricoAtendimento) => void;
}

// Função de parse seguro das datas da API
function formatarDataHora(dataString: string) {
  try {
    const data = new Date(dataString);
    return {
      data: data.toLocaleDateString('pt-BR'),
      hora: data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch {
    return { data: 'Não informada', hora: '--:--' };
  }
}

export const DrawerHistoricoPaciente: FC<DrawerHistoricoPacienteProps> = ({
  aberto,
  paciente,
  aoFechar,
  aoNovoAtendimento,
  aoVerProntuario,
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
        const resposta = await requisicaoApi<{ dados: any[] }>(`/atendimentos?pacienteId=${paciente.id}&porPagina=100`);
        if (!ativo) return;
        
        const mapeado = resposta.dados.map((item) => {
          const { data, hora } = formatarDataHora(item.criadoEm);
          return {
            id: item.id,
            especialidade: item.especialidade,
            status: 'CONCLUIDO' as const, // Todos salvos já são concluídos na base
            data,
            hora,
            profissionalNome: item.profissional,
            profissionalRegistro: 'Registro Ativo', // Poderia vir do perfil do usuário
            motivoConsulta: item.resumo || 'Consulta de rotina',
            condutaClinica: item.procedimentos || item.insumosUtilizados || undefined,
          };
        });

        setHistorico(mapeado);
      } catch (err) {
        console.error('Erro ao buscar histórico do paciente:', err);
        if (ativo) setHistorico([]);
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    buscarHistorico();

    return () => { ativo = false; };
  }, [paciente, aberto]);

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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* ─── Conteúdo: Linha do Tempo de Atendimentos ──────────────────── */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {historico.length === 0 ? (
              /* Estado Vazio */
              <div className="py-12 px-4 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-slate-800">Nenhum atendimento registrado</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    {carregando ? (
                      <span>Buscando histórico na base...</span>
                    ) : (
                      <span>Nenhum atendimento registrado no histórico clínico deste paciente.</span>
                    )}
                  </p>
                  {!carregando && aoNovoAtendimento && (
                    <button
                      type="button"
                      onClick={() => {
                        aoFechar();
                        aoNovoAtendimento(paciente);
                      }}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold text-white rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #034b7f 0%, #14438f 100%)' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span>Iniciar Primeiro Atendimento</span>
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
                          <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        )}
                      </div>

                      {/* Card do Atendimento - Premium Design */}
                      <div className="bg-white border border-slate-200/70 rounded-[1.25rem] p-4 sm:p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_24px_-6px_rgba(6,81,237,0.15)] hover:-translate-y-0.5 transition-all duration-300 space-y-4 group/card relative overflow-hidden">
                        
                        {/* Decorador sutil de fundo */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl opacity-60 pointer-events-none" />

                        {/* Topo do Card: Especialidade e Status */}
                        <div className="flex items-center justify-between gap-2 relative z-10">
                          <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100/60 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-2xs">
                            {item.especialidade}
                          </span>

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
                                  <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                  </svg>
                                  {item.profissionalRegistro}
                                </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0 bg-slate-50/80 p-2 rounded-xl border border-slate-100/80">
                            <div className="flex items-center gap-1.5 text-[10.5px] text-slate-700 font-bold">
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                              {item.data}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 font-semibold">
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              {item.hora}
                            </div>
                          </div>
                        </div>

                        {/* Bloco Motivo da Consulta (Citacão destacada) */}
                        <div className="relative pl-3.5 py-2.5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-300 before:rounded-full bg-gradient-to-r from-blue-50/40 to-transparent rounded-r-2xl border-y border-r border-slate-100/50 relative z-10">
                          <p className="text-[9.5px] font-extrabold text-blue-500/80 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
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
                            <svg className="w-3.5 h-3.5 transition-transform group-hover/card:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ─── Rodapé com Ação Rápida: + Novo Atendimento ─────────────────── */}
          <div className="p-4 bg-white border-t border-slate-200/90 shrink-0">
            {aoNovoAtendimento && (
              <button
                type="button"
                onClick={() => {
                  aoFechar();
                  aoNovoAtendimento(paciente);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl text-xs font-bold shadow-xs hover:shadow-sm transition-all active:scale-[0.99] cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Novo Atendimento para {paciente.nome.split(' ')[0]}</span>
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>,
    document.body
  );
};

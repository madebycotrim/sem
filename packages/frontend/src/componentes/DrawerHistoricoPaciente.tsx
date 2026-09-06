import { type FC, useEffect } from 'react';
import type { ItemPaciente } from './TabelaPacientes.tsx';

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

// Histórico ilustrativo pré-configurado por paciente ou gerador dinâmico
function obterHistoricoDoPaciente(paciente: ItemPaciente | null): ItemHistoricoAtendimento[] {
  if (!paciente) return [];

  // Dados fiéis ao mock de demonstração do sistema
  if (paciente.nome.toUpperCase().includes('ANA BEATRIZ') || paciente.nome.toUpperCase().includes('GABRIEL')) {
    return [
      {
        id: 'hist-001',
        especialidade: 'ODONTOLOGIA',
        status: 'AGENDADO',
        data: '31/08/2026',
        hora: '16:45',
        profissionalNome: 'BRÁULIO ANDRADE DA COSTA',
        profissionalRegistro: 'CRO 16448',
        motivoConsulta: 'Consulta',
        condutaClinica: 'Avaliação da arcada dentária, aplicação tópica de flúor e profilaxia preventiva.',
      },
      {
        id: 'hist-002',
        especialidade: 'AUDIOMETRIA',
        status: 'CONCLUIDO',
        data: '31/08/2026',
        hora: '15:30',
        profissionalNome: 'ANA CRISTINA RABELO PAIVA',
        profissionalRegistro: 'CREFONO 7245',
        motivoConsulta: 'Consulta',
        condutaClinica: 'Audiometria tonal limiar sem alterações bilaterais observadas.',
      },
    ];
  }

  if (paciente.atendimentosCount === 1) {
    return [
      {
        id: 'hist-003',
        especialidade: 'OFTALMOLOGIA',
        status: 'CONCLUIDO',
        data: '01/09/2026',
        hora: '09:15',
        profissionalNome: 'DRA. CAROLINA MENDES',
        profissionalRegistro: 'CRM-DF 28914',
        motivoConsulta: 'Triagem de acuidade visual com tabela de Snellen.',
        condutaClinica: 'Acuidade visual 20/20 OD e OE. Sem queixas no momento.',
      },
    ];
  }

  if (paciente.atendimentosCount >= 2) {
    return [
      {
        id: 'hist-004',
        especialidade: 'ODONTOLOGIA',
        status: 'CONCLUIDO',
        data: '28/08/2026',
        hora: '14:20',
        profissionalNome: 'DR. FELIPE ARANTES',
        profissionalRegistro: 'CRO 19302',
        motivoConsulta: 'Profilaxia e aplicação de flúor',
        condutaClinica: 'Tratamento preventivo e orientação de escovação escolar.',
      },
      {
        id: 'hist-005',
        especialidade: 'CLÍNICA MÉDICA',
        status: 'CONCLUIDO',
        data: '25/08/2026',
        hora: '10:00',
        profissionalNome: 'DR. MARCOS VINICIUS ALVES',
        profissionalRegistro: 'CRM-DF 31405',
        motivoConsulta: 'Triagem de saúde escolar e sinais vitais',
        condutaClinica: 'Sinais vitais normais para a idade. Encaminhado para odontologia.',
      },
    ];
  }

  return [];
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

  if (!aberto || !paciente) return null;

  const historico = obterHistoricoDoPaciente(paciente);
  const totalRegistros = historico.length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="drawer-titulo">
      {/* Backdrop com desfoque suave */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-250 ease-out animate-fade-in"
        onClick={aoFechar}
        aria-hidden="true"
      />

      {/* Painel Lateral Drawer à Direita */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          className="w-screen max-w-md sm:max-w-lg bg-slate-50/95 backdrop-blur-md border-l border-slate-200/90 shadow-2xl flex flex-col animate-drawer"
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
                  Este paciente ainda não possui consultas ou triagens realizadas no sistema.
                </p>
                {aoNovoAtendimento && (
                  <button
                    type="button"
                    onClick={() => {
                      aoFechar();
                      aoNovoAtendimento(paciente);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Iniciar Primeiro Atendimento</span>
                  </button>
                )}
              </div>
            ) : (
              /* Linha do Tempo com Cards */
              <div className="relative pl-6 space-y-5">
                {/* Linha vertical conectora */}
                <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-200" aria-hidden="true" />

                {historico.map((item) => {
                  const isConcluido = item.status === 'CONCLUIDO';
                  return (
                    <div key={item.id} className="relative group">
                      {/* Ponto / Ícone da Linha do Tempo */}
                      <div
                        className={`absolute -left-[30px] top-3.5 w-6 h-6 rounded-2xl flex items-center justify-center ring-4 ring-slate-50 text-white shadow-2xs z-10 ${
                          isConcluido
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                      >
                        {isConcluido ? (
                          <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        )}
                      </div>

                      {/* Card do Atendimento */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all space-y-3">
                        {/* Topo do Card: Especialidade e Status */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-2xl text-[11px] font-extrabold uppercase tracking-wider">
                            {item.especialidade}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-2xl text-[10.5px] font-bold border ${
                              isConcluido
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isConcluido ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                              }`}
                            />
                            {item.status === 'CONCLUIDO' ? 'CONCLUÍDO' : 'AGENDADO'}
                          </span>
                        </div>

                        {/* Bloco de Data e Horário */}
                        <div className="py-1.5 px-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 text-xs text-slate-700 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <span>{item.data}</span>
                          </div>
                          <span className="text-slate-300">•</span>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>{item.hora}</span>
                          </div>
                        </div>

                        {/* Profissional e Registro */}
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-6 h-6 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </div>
                          <span className="font-extrabold text-slate-800 uppercase tracking-tight text-xs">
                            {item.profissionalNome}
                          </span>
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-mono font-bold border border-slate-200">
                            {item.profissionalRegistro}
                          </span>
                        </div>

                        {/* Bloco Motivo da Consulta */}
                        <div className="p-3 bg-slate-50/80 border border-slate-100 rounded-2xl text-xs space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <span>MOTIVO DA CONSULTA</span>
                          </p>
                          <p className="font-semibold text-slate-800 italic">
                            {item.motivoConsulta}
                          </p>
                          {item.condutaClinica && (
                            <p className="text-[11px] text-slate-600 mt-1 pt-1 border-t border-slate-200/60 not-italic">
                              {item.condutaClinica}
                            </p>
                          )}
                        </div>

                        {/* Rodapé do Card: Ação Ver Prontuário */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-400 font-medium">Prontuário médico</span>
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
                            className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer text-xs"
                          >
                            <span>Ver Prontuário</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
    </div>
  );
};

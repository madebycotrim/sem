import { useState, type FC } from 'react';
import { Especialidade, Turno, ESPECIALIDADE_LABELS, TURNO_LABELS } from '@sistema/shared';
import { CabecalhoPaginaSesi } from './CabecalhoPaginaSesi.tsx';

export type StatusPresenca = 'AGUARDANDO' | 'EM_ATENDIMENTO' | 'CONCLUIDO';

export interface ItemFilaDoDia {
  id: string;
  pacienteNome: string;
  cpf?: string;
  idade: number;
  escolaNome: string;
  turno: Turno;
  especialidade: Especialidade;
  status: StatusPresenca;
  horarioChegada: string;
  prioridade: boolean;
}

interface VisaoFilaDoDiaProps {
  aoIniciarAtendimento: (paciente: { id: string; nome: string; especialidade: Especialidade; turno: Turno }) => void;
  aoNovoPaciente: () => void;
}

export const VisaoFilaDoDia: FC<VisaoFilaDoDiaProps> = ({
  aoIniciarAtendimento,
  aoNovoPaciente,
}) => {
  const [turnoSelecionado, setTurnoSelecionado] = useState<string>('TODOS');
  const [especialidadeSelecionada, setEspecialidadeSelecionada] = useState<string>('TODAS');
  const [busca, setBusca] = useState('');

  const [fila, setFila] = useState<ItemFilaDoDia[]>([
    {
      id: 'fila-01',
      pacienteNome: 'GABRIEL HENRIQUE SANTOS',
      cpf: '078.432.191-04',
      idade: 12,
      escolaNome: 'CEMEIT DE TAGUATINGA',
      turno: Turno.MANHA,
      especialidade: Especialidade.OFTALMOLOGIA,
      status: 'EM_ATENDIMENTO',
      horarioChegada: '08:15',
      prioridade: false,
    },
    {
      id: 'fila-02',
      pacienteNome: 'BEATRIZ LIMA DE OLIVEIRA',
      cpf: '065.912.331-88',
      idade: 10,
      escolaNome: 'CEMEIT DE TAGUATINGA',
      turno: Turno.MANHA,
      especialidade: Especialidade.ODONTOLOGIA,
      status: 'AGUARDANDO',
      horarioChegada: '08:30',
      prioridade: true,
    },
    {
      id: 'fila-03',
      pacienteNome: 'MATHEUS COSTA RIBEIRO',
      cpf: '088.231.990-11',
      idade: 9,
      escolaNome: 'CEMEIT DE TAGUATINGA',
      turno: Turno.MANHA,
      especialidade: Especialidade.AUDIOMETRIA,
      status: 'AGUARDANDO',
      horarioChegada: '08:45',
      prioridade: false,
    },
    {
      id: 'fila-04',
      pacienteNome: 'SOPHIA MENDES BARBOSA',
      cpf: '099.123.456-78',
      idade: 14,
      escolaNome: 'CEMEIT DE TAGUATINGA',
      turno: Turno.TARDE,
      especialidade: Especialidade.PSICOLOGIA,
      status: 'AGUARDANDO',
      horarioChegada: '13:10',
      prioridade: false,
    },
    {
      id: 'fila-05',
      pacienteNome: 'LUCAS ALVES FERREIRA',
      cpf: '034.887.129-33',
      idade: 11,
      escolaNome: 'CEMEIT DE TAGUATINGA',
      turno: Turno.TARDE,
      especialidade: Especialidade.NUTRICAO,
      status: 'CONCLUIDO',
      horarioChegada: '13:00',
      prioridade: false,
    },
  ]);

  const alternarStatus = (id: string, novoStatus: StatusPresenca) => {
    setFila((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: novoStatus } : item))
    );
  };

  const filtrados = fila.filter((item) => {
    const matchBusca =
      item.pacienteNome.toLowerCase().includes(busca.toLowerCase()) ||
      (item.cpf && item.cpf.includes(busca));
    const matchTurno = turnoSelecionado === 'TODOS' || item.turno === turnoSelecionado;
    const matchEsp =
      especialidadeSelecionada === 'TODAS' || item.especialidade === especialidadeSelecionada;
    return matchBusca && matchTurno && matchEsp;
  });

  const totalAguardando = fila.filter((f) => f.status === 'AGUARDANDO').length;
  const totalEmAtendimento = fila.filter((f) => f.status === 'EM_ATENDIMENTO').length;
  const totalConcluido = fila.filter((f) => f.status === 'CONCLUIDO').length;

  return (
    <div className="flex flex-col flex-1 anim-surgir font-sans">
      {/* ─── Cabeçalho Fixo Modular ───────────────────────────────────────── */}
      <CabecalhoPaginaSesi
        titulo="Fila do Dia / Triagem"
        subtitulo="GESTÃO DE ALUNOS E COMUNIDADE PRESENTES NO LOCAL — FLUXO LIVRE"
        busca={{
          valor: busca,
          aoMudar: setBusca,
          placeholder: 'Buscar aluno por nome ou CPF...',
        }}
        seletor={{
          valor: especialidadeSelecionada,
          aoMudar: setEspecialidadeSelecionada,
          placeholder: 'Todas as Especialidades',
          opcoes: [
            { id: 'TODAS', nome: 'Todas as Especialidades' },
            ...Object.entries(ESPECIALIDADE_LABELS).map(([id, nome]) => ({ id, nome })),
          ],
        }}
        acaoPrimaria={{
          rotulo: '+ Check-in / Novo Aluno',
          aoClicar: aoNovoPaciente,
        }}
        fixo={true}
      />

      {/* ─── Abas de Turno e Resumo da Fila ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        {/* Filtros de Turno */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs w-fit">
          <button
            type="button"
            onClick={() => setTurnoSelecionado('TODOS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              turnoSelecionado === 'TODOS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Todos os Turnos ({fila.length})
          </button>
          <button
            type="button"
            onClick={() => setTurnoSelecionado(Turno.MANHA)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              turnoSelecionado === Turno.MANHA
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            ☀️ {TURNO_LABELS[Turno.MANHA]}
          </button>
          <button
            type="button"
            onClick={() => setTurnoSelecionado(Turno.TARDE)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              turnoSelecionado === Turno.TARDE
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            ⛅ {TURNO_LABELS[Turno.TARDE]}
          </button>
        </div>

        {/* Badges de Status do Dia */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold">
            ⏳ Aguardando: {totalAguardando}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold">
            🩺 Em Atendimento: {totalEmAtendimento}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
            ✓ Concluídos: {totalConcluido}
          </span>
        </div>
      </div>

      {/* ─── Tabela da Fila de Presença ───────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden flex flex-col flex-1 min-h-[440px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                <th scope="col" className="py-2.5 px-4 font-bold text-slate-600">HORÁRIO</th>
                <th scope="col" className="py-2.5 px-4 font-bold text-slate-600">ALUNO / PACIENTE</th>
                <th scope="col" className="py-2.5 px-3 font-bold text-slate-600">ESPECIALIDADE</th>
                <th scope="col" className="py-2.5 px-3 font-bold text-slate-600">TURNO</th>
                <th scope="col" className="py-2.5 px-3 font-bold text-slate-600">STATUS DA FILA</th>
                <th scope="col" className="py-2.5 px-4 font-bold text-slate-600 text-right">CHAMADA & AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto px-4">
                      <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3 ring-8 ring-blue-50/60">
                        ⏱️
                      </div>
                      <h4 className="text-base font-bold text-slate-800 mb-1">Fila vazia para este filtro</h4>
                      <p className="text-xs text-slate-500 mb-3">
                        Nenhum aluno aguardando atendimento com os critérios selecionados.
                      </p>
                      <button
                        type="button"
                        onClick={aoNovoPaciente}
                        className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
                      >
                        + Adicionar à Fila do Dia
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtrados.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-700">
                      {item.horarioChegada}
                    </td>

                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{item.pacienteNome}</span>
                        {item.prioridade && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-100 text-rose-800 uppercase">
                            Prioridade
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {item.idade} anos • CPF: {item.cpf || 'Não informado'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {ESPECIALIDADE_LABELS[item.especialidade]}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      {TURNO_LABELS[item.turno]}
                    </td>

                    <td className="py-2.5 px-3">
                      {item.status === 'AGUARDANDO' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Aguardando
                        </span>
                      ) : item.status === 'EM_ATENDIMENTO' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          Em Atendimento
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Concluído
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'AGUARDANDO' && (
                          <button
                            type="button"
                            onClick={() => {
                              alternarStatus(item.id, 'EM_ATENDIMENTO');
                              aoIniciarAtendimento({
                                id: item.id,
                                nome: item.pacienteNome,
                                especialidade: item.especialidade,
                                turno: item.turno,
                              });
                            }}
                            className="px-3 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer"
                          >
                            📢 Chamar & Atender
                          </button>
                        )}
                        {item.status === 'EM_ATENDIMENTO' && (
                          <button
                            type="button"
                            onClick={() => alternarStatus(item.id, 'CONCLUIDO')}
                            className="px-3 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-all active:scale-95 cursor-pointer"
                          >
                            ✓ Concluir
                          </button>
                        )}
                        {item.status === 'CONCLUIDO' && (
                          <span className="text-[11px] text-slate-400 font-medium">Finalizado</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="py-2 px-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-400 select-none">
          <span>{filtrados.length} aluno(s) listado(s) na fila do dia</span>
          <span className="font-mono text-slate-400">Escola Cidadã — SESI / UnB</span>
        </div>
      </div>
    </div>
  );
};

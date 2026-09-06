import { useState, type FC } from 'react';
import { CabecalhoPagina } from './CabecalhoPagina.tsx';

export interface RelatoriosProps {
  escolas?: Array<{ id: string; nome: string }>;
}

export const Relatorios: FC<RelatoriosProps> = ({ escolas = [] }) => {
  const [escolaFiltro, setEscolaFiltro] = useState('');

  const metricasEspecialidade = [
    { especialidade: 'Oftalmologia', atendimentos: 142, encaminhamentos: 18, insumos: '142 kits descartáveis' },
    { especialidade: 'Odontologia', atendimentos: 189, encaminhamentos: 24, insumos: '189 kits clínicos + flúor' },
    { especialidade: 'Audiometria', atendimentos: 98, encaminhamentos: 12, insumos: '98 protetores / ponteiras' },
    { especialidade: 'Psicologia', atendimentos: 76, encaminhamentos: 9, insumos: 'Fichas de acolhimento' },
    { especialidade: 'Nutrição', atendimentos: 110, encaminhamentos: 15, insumos: 'Fitas antropométricas' },
  ];

  const faixasEtarias = [
    { faixa: '6 a 9 anos (Anos Iniciais)', total: 215, porcentagem: '35%' },
    { faixa: '10 a 14 anos (Anos Finais)', total: 278, porcentagem: '45%' },
    { faixa: '15 a 18 anos (Ensino Médio)', total: 92, porcentagem: '15%' },
    { faixa: 'Comunidade Escolar / Adultos', total: 30, porcentagem: '5%' },
  ];

  const totalGeral = metricasEspecialidade.reduce((acc, cur) => acc + cur.atendimentos, 0);

  const handleExportarPrestacaoContas = () => {
    const csvContent =
      'Especialidade,Total Atendimentos,Encaminhamentos,Insumos Utilizados\n' +
      metricasEspecialidade
        .map((m) => `"${m.especialidade}",${m.atendimentos},${m.encaminhamentos},"${m.insumos}"`)
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `prestacao_contas_catraki_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const opcoesEscola = [
    { id: '', nome: 'Todos os Polos' },
    ...escolas.map((e) => ({ id: e.id, nome: e.nome })),
  ];

  return (
    <div className="flex flex-col flex-1 animate-fade-in font-sans">
      {/* ─── Cabeçalho Fixo Modular ───────────────────────────────────────── */}
      <CabecalhoPagina
        titulo="Relatórios & Prestação de Contas"
        subtitulo="CONSOLIDAÇÃO E RELATÓRIOS ESTRATÉGICOS — CATRAKI GESTÃO"
        seletor={{
          valor: escolaFiltro,
          aoMudar: setEscolaFiltro,
          placeholder: 'Todas as Escolas / Polos',
          opcoes: opcoesEscola,
        }}
        aoExportar={handleExportarPrestacaoContas}
        acaoPrimaria={{
          rotulo: 'Baixar Prestação de Contas (CSV)',
          icone: (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          ),
          aoClicar: handleExportarPrestacaoContas,
        }}
        fixo={true}
      />

      {/* ─── Cartões de Destaque para Prestação de Contas ──────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:shadow-sm hover:border-slate-300/90 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total de Atendimentos</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-2xl border border-blue-100">
              Catraki Saúde
            </span>
          </div>
          <p className="text-3xl font-extrabold text-[#0b2545] mt-2 font-sans">{totalGeral}</p>
          <p className="text-xs text-slate-500 mt-1">Catraki — 5 Especialidades</p>
        </div>

        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:shadow-sm hover:border-slate-300/90 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Encaminhamentos ao SUS</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-2xl border border-indigo-100">
              Média Alta
            </span>
          </div>
          <p className="text-3xl font-extrabold text-[#0066ff] mt-2 font-sans">78</p>
          <p className="text-xs text-slate-500 mt-1">Óculos, cirurgias e tratamentos avançados</p>
        </div>

        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:shadow-sm hover:border-slate-300/90 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Termos LGPD Válidos</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-2xl border border-emerald-200">
              100% Auditável
            </span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2 font-sans">100%</p>
          <p className="text-xs text-slate-500 mt-1">Conformidade com o Art. 14 (Menores de idade)</p>
        </div>
      </div>

      {/* ─── Tabela 1: Atendimentos por Especialidade ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-4.5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#0b2545] uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>Atendimentos por Especialidade Clínica</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Consolidação Clínica</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                  <th className="py-3 px-4 font-bold text-slate-600">ESPECIALIDADE</th>
                  <th className="py-3 px-3 font-bold text-slate-600">ATENDIMENTOS</th>
                  <th className="py-3 px-3 font-bold text-slate-600">ENCAMINHADOS</th>
                  <th className="py-3 px-4 font-bold text-slate-600">INSUMOS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metricasEspecialidade.map((m) => (
                  <tr key={m.especialidade} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">{m.especialidade}</td>
                    <td className="py-3 px-3 font-bold text-[#0066ff] font-mono">{m.atendimentos}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono">{m.encaminhamentos}</td>
                    <td className="py-3 px-4 text-slate-500">{m.insumos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="py-2.5 px-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-400 select-none">
            <span>5 especialidades ativas</span>
            <span className="font-mono text-slate-400">Total: {totalGeral} fichas</span>
          </div>
        </div>

        {/* ─── Tabela 2: Distribuição por Faixa Etária ─────────────────────── */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-[#0b2545] uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                <span>Distribuição por Faixa Etária</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Demografia</span>
            </div>

            <div className="space-y-3.5 mt-2">
              {faixasEtarias.map((f) => (
                <div key={f.faixa}>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{f.faixa}</span>
                    <span className="font-mono font-bold text-[#0b2545]">{f.total} ({f.porcentagem})</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#0066ff] h-full rounded-full transition-all duration-500" style={{ width: f.porcentagem }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Auditoria e Validação Catraki</span>
            <span className="font-mono font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Dados Válidos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

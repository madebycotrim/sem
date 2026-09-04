import { useState, type FC } from 'react';
import { CabecalhoPaginaSesi } from './CabecalhoPaginaSesi.tsx';

export const VisaoRelatorios: FC = () => {
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
    link.setAttribute('download', `prestacao_contas_saude_movimento_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col flex-1 anim-surgir font-sans">
      {/* ─── Cabeçalho Fixo Modular ───────────────────────────────────────── */}
      <CabecalhoPaginaSesi
        titulo="Relatórios & Prestação de Contas"
        subtitulo="CONSOLIDAÇÃO DE DADOS PARA UNB, SESI-DF E FINATEC (AUDITÁVEL)"
        seletor={{
          valor: escolaFiltro,
          aoMudar: setEscolaFiltro,
          placeholder: 'Todas as Escolas / Polos',
          opcoes: [
            { id: '', nome: 'Todos os Polos do DF' },
            { id: 'cemeit', nome: 'CEMEIT DE TAGUATINGA' },
            { id: 'cef01', nome: 'CEF 01 DE BRASÍLIA' },
            { id: 'ec10', nome: 'EC 10 DE CEILÂNDIA' },
            { id: 'cef02', nome: 'CEF 02 DE SOBRADINHO' },
          ],
        }}
        aoExportar={handleExportarPrestacaoContas}
        acaoPrimaria={{
          rotulo: '📥 Baixar Prestação de Contas (CSV)',
          aoClicar: handleExportarPrestacaoContas,
        }}
        fixo={true}
      />

      {/* ─── Cartões de Destaque para Prestação de Contas ──────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total de Atendimentos</span>
          <p className="text-3xl font-extrabold text-[#0b2545] mt-1 font-sans">{totalGeral}</p>
          <p className="text-[11px] text-slate-500 mt-1">Escola Cidadã — 5 Especialidades</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Encaminhamentos ao SUS</span>
          <p className="text-3xl font-extrabold text-blue-600 mt-1 font-sans">78</p>
          <p className="text-[11px] text-slate-500 mt-1">Óculos, cirurgias e tratamentos avançados</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Termos LGPD Válidos</span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1 font-sans">100%</p>
          <p className="text-[11px] text-slate-500 mt-1">Conformidade com o Art. 14 (Menores de idade)</p>
        </div>
      </div>

      {/* ─── Tabela 1: Atendimentos por Especialidade ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#0b2545] uppercase tracking-wider">
              Atendimentos por Especialidade Clínica
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Parceria UnB / Finatec</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-4">Especialidade</th>
                  <th className="py-2.5 px-3">Atendimentos</th>
                  <th className="py-2.5 px-3">Encaminhados</th>
                  <th className="py-2.5 px-3">Insumos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metricasEspecialidade.map((m) => (
                  <tr key={m.especialidade} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{m.especialidade}</td>
                    <td className="py-2.5 px-3 font-bold text-blue-600 font-mono">{m.atendimentos}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">{m.encaminhamentos}</td>
                    <td className="py-2.5 px-3 text-slate-500">{m.insumos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Tabela 2: Distribuição por Faixa Etária ─────────────────────── */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#0b2545] uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
              Distribuição por Faixa Etária
            </h3>

            <div className="space-y-3">
              {faixasEtarias.map((f) => (
                <div key={f.faixa}>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{f.faixa}</span>
                    <span className="font-mono font-bold text-[#0b2545]">{f.total} ({f.porcentagem})</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#0066ff] h-full rounded-full" style={{ width: f.porcentagem }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Auditado por Finatec / UnB</span>
            <span className="font-mono font-bold text-emerald-600">✓ Dados Válidos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

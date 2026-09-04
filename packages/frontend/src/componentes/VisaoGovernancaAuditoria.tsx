import { useState, type FC } from 'react';
import { CabecalhoPaginaSesi } from './CabecalhoPaginaSesi.tsx';

export interface LogAcessoMarcoCivil {
  id: string;
  ipOrigem: string;
  timestampUtc: string;
  usuarioEmail: string;
  papel: string;
  metodo: string;
  rotaAcessada: string;
  statusCodigo: number;
  finalidadeLgpd: string;
}

export const VisaoGovernancaAuditoria: FC = () => {
  const [busca, setBusca] = useState('');

  const [logs] = useState<LogAcessoMarcoCivil[]>([
    {
      id: 'log-01',
      ipOrigem: '177.12.89.44',
      timestampUtc: '2026-09-04T12:35:10Z',
      usuarioEmail: 'camila.souza@sesidf.org.br',
      papel: 'PROFISSIONAL_SAUDE',
      metodo: 'POST',
      rotaAcessada: '/api/v1/atendimentos',
      statusCodigo: 201,
      finalidadeLgpd: 'Execução de tutela em saúde (Art. 7º, VIII e Art. 14)',
    },
    {
      id: 'log-02',
      ipOrigem: '177.12.89.44',
      timestampUtc: '2026-09-04T12:30:22Z',
      usuarioEmail: 'mariana.duarte@sesidf.org.br',
      papel: 'RECEPCAO',
      metodo: 'POST',
      rotaAcessada: '/api/v1/pacientes',
      statusCodigo: 201,
      finalidadeLgpd: 'Consentimento específico por responsável (Art. 14, § 1º)',
    },
    {
      id: 'log-03',
      ipOrigem: '189.6.140.21',
      timestampUtc: '2026-09-04T12:15:00Z',
      usuarioEmail: 'lucas.prado@sesidf.org.br',
      papel: 'PROFISSIONAL_SAUDE',
      metodo: 'GET',
      rotaAcessada: '/api/v1/pacientes/550e8400.../prontuario',
      statusCodigo: 200,
      finalidadeLgpd: 'Consulta clínica autorizada por profissional de saúde',
    },
    {
      id: 'log-04',
      ipOrigem: '164.41.200.10',
      timestampUtc: '2026-09-04T11:45:18Z',
      usuarioEmail: 'marcelo.carvalho@unb.br',
      papel: 'ADMINISTRADOR',
      metodo: 'GET',
      rotaAcessada: '/api/v1/relatorios/prestacao-contas',
      statusCodigo: 200,
      finalidadeLgpd: 'Prestação de contas e auditoria científica (Finatec/UnB)',
    },
  ]);

  const filtrados = logs.filter((l) =>
    l.usuarioEmail.toLowerCase().includes(busca.toLowerCase()) ||
    l.rotaAcessada.toLowerCase().includes(busca.toLowerCase()) ||
    l.ipOrigem.includes(busca)
  );

  return (
    <div className="flex flex-col flex-1 animate-fade-in font-sans">
      {/* ─── Cabeçalho Fixo Modular ───────────────────────────────────────── */}
      <CabecalhoPaginaSesi
        titulo="Governança & Auditoria LGPD"
        subtitulo="REGISTRO DE ACESSOS (MARCO CIVIL ART. 15) E RASTREABILIDADE DE DADOS DE MENORES (LGPD)"
        busca={{
          valor: busca,
          aoMudar: setBusca,
          placeholder: 'Buscar log por usuário, IP ou rota...',
        }}
        aoExportar={() => alert('Exportando trilha de auditoria completa.')}
        fixo={true}
      />

      {/* ─── Cards de Conformidade Regulatória ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
        <div className="bg-white border border-slate-200/90 p-4.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>⚖️</span>
            <span>Marco Civil (Art. 15)</span>
          </div>
          <p className="text-sm font-bold text-emerald-700">Retenção de 6 meses ativa</p>
          <p className="text-[11px] text-slate-400 mt-1">IP, timestamp UTC e identidade preservados</p>
        </div>

        <div className="bg-white border border-slate-200/90 p-4.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>🛡️</span>
            <span>Criptografia de Envelope</span>
          </div>
          <p className="text-sm font-bold text-blue-700">AES-256-GCM com KEK/DEK</p>
          <p className="text-[11px] text-slate-400 mt-1">Dados sensíveis cifrados individualmente</p>
        </div>

        <div className="bg-white border border-slate-200/90 p-4.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>👶</span>
            <span>LGPD Menores (Art. 14)</span>
          </div>
          <p className="text-sm font-bold text-emerald-700">Termo de Pais Registrado</p>
          <p className="text-[11px] text-slate-400 mt-1">Finalidade específica e revogabilidade garantida</p>
        </div>
      </div>

      {/* ─── Tabela de Trilha de Auditoria ─────────────────────────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col flex-1 min-h-[440px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                <th scope="col" className="py-3 px-4 font-bold text-slate-600">TIMESTAMP (UTC)</th>
                <th scope="col" className="py-3 px-3 font-bold text-slate-600">IP ORIGEM</th>
                <th scope="col" className="py-3 px-3 font-bold text-slate-600">OPERADOR</th>
                <th scope="col" className="py-3 px-3 font-bold text-slate-600">AÇÃO / ROTA</th>
                <th scope="col" className="py-3 px-3 font-bold text-slate-600">BASE LEGAL & FINALIDADE</th>
                <th scope="col" className="py-3 px-4 font-bold text-slate-600 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-700 font-bold">
                    {new Date(log.timestampUtc).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                    {log.ipOrigem}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-slate-800">{log.usuarioEmail}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{log.papel}</p>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {log.metodo}
                    </span>
                    <span className="ml-2 font-mono text-[11px] text-slate-700">{log.rotaAcessada}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-[11px]">
                    {log.finalidadeLgpd}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {log.statusCodigo} OK
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="py-2.5 px-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-400 select-none">
          <span>{filtrados.length} evento(s) de auditoria registrados</span>
          <span className="font-mono text-slate-400">Auditoria Imutável • Marco Civil Art. 15 & LGPD</span>
        </div>
      </div>
    </div>
  );
};

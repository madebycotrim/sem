import { useState, type FC, useMemo } from 'react';
import { CabecalhoPagina } from './CabecalhoPagina.tsx';
import {
  useFiltroExcel,
  CabecalhoColunaExcel,
  BarraFiltrosAtivos,
  type ConfiguracaoColuna,
} from './tabelaExcel/index.ts';

export interface LogAuditoriaItem {
  id: string;
  timestampUtc: string;
  ipOrigem: string;
  usuarioEmail: string;
  papel: string;
  metodo: string;
  rotaAcessada: string;
  finalidadeLgpd: string;
  statusCodigo: number;
}

export const GovernancaAuditoria: FC = () => {
  const [busca, setBusca] = useState('');

  // Logs Mockados de Auditoria Imutável (Marco Civil Art. 15 / LGPD)
  const [logs] = useState<LogAuditoriaItem[]>([
    {
      id: 'log-01',
      timestampUtc: '2026-03-01T11:30:15Z',
      ipOrigem: '177.12.89.44',
      usuarioEmail: 'carolina.mendes@catraki.com.br',
      papel: 'PROFISSIONAL_SAUDE',
      metodo: 'POST',
      rotaAcessada: '/api/v1/atendimentos',
      finalidadeLgpd: 'Tutela da Saúde (Art. 7, VIII)',
      statusCodigo: 201,
    },
    {
      id: 'log-02',
      timestampUtc: '2026-03-01T11:28:40Z',
      ipOrigem: '177.12.89.44',
      usuarioEmail: 'felipe.arantes@catraki.com.br',
      papel: 'PROFISSIONAL_SAUDE',
      metodo: 'GET',
      rotaAcessada: '/api/v1/pacientes/pac-02/historico',
      finalidadeLgpd: 'Acesso Prontuário Médico',
      statusCodigo: 200,
    },
    {
      id: 'log-03',
      timestampUtc: '2026-03-01T11:15:00Z',
      ipOrigem: '189.23.10.12',
      usuarioEmail: 'mariana.silva@catraki.com.br',
      papel: 'RECEPCAO',
      metodo: 'POST',
      rotaAcessada: '/api/v1/pacientes',
      finalidadeLgpd: 'Consentimento Pais Art. 14',
      statusCodigo: 201,
    },
    {
      id: 'log-04',
      timestampUtc: '2026-03-01T10:55:22Z',
      ipOrigem: '187.60.112.5',
      usuarioEmail: 'gustavo.borges@catraki.com.br',
      papel: 'ADMINISTRADOR',
      metodo: 'GET',
      rotaAcessada: '/api/v1/auditoria/logs',
      finalidadeLgpd: 'Cumprimento Obrigação Legal (Art. 15 MCI)',
      statusCodigo: 200,
    },
  ]);

  const colunasConfig = useMemo<ConfiguracaoColuna<LogAuditoriaItem>[]>(
    () => [
      {
        id: 'timestampUtc',
        rotulo: 'TIMESTAMP (UTC)',
        tipo: 'data',
        obterValor: (l) => l.timestampUtc,
        formatarRotulo: (val) => new Date(val).toLocaleString('pt-BR'),
      },
      {
        id: 'ipOrigem',
        rotulo: 'IP ORIGEM',
        tipo: 'texto',
        obterValor: (l) => l.ipOrigem,
      },
      {
        id: 'usuarioEmail',
        rotulo: 'OPERADOR',
        tipo: 'texto',
        obterValor: (l) => l.usuarioEmail,
      },
      {
        id: 'rotaAcessada',
        rotulo: 'AÇÃO / ROTA',
        tipo: 'texto',
        obterValor: (l) => `${l.metodo} ${l.rotaAcessada}`,
      },
      {
        id: 'finalidadeLgpd',
        rotulo: 'BASE LEGAL & FINALIDADE',
        tipo: 'texto',
        obterValor: (l) => l.finalidadeLgpd,
      },
      {
        id: 'statusCodigo',
        rotulo: 'STATUS',
        tipo: 'opcao',
        obterValor: (l) => `${l.statusCodigo} OK`,
        formatarRotulo: (val) => String(val),
      },
    ],
    []
  );

  const filtroExcel = useFiltroExcel<LogAuditoriaItem>({
    dados: logs,
    colunas: colunasConfig,
    buscaGeral: busca,
    funcaoBuscaGeral: (item, termo) =>
      item.usuarioEmail.toLowerCase().includes(termo) ||
      item.ipOrigem.includes(termo) ||
      item.rotaAcessada.toLowerCase().includes(termo) ||
      item.papel.toLowerCase().includes(termo) ||
      item.finalidadeLgpd.toLowerCase().includes(termo),
  });

  const { dadosFiltrados, temAlgumFiltroAtivo } = filtroExcel;

  return (
    <div className="flex flex-col flex-1 animate-fade-in font-sans">
      {/* ─── Cabeçalho Fixo Modular ───────────────────────────────────────── */}
      <CabecalhoPagina
        titulo="Governança, LGPD e Auditoria"
        subtitulo="TRILHA DE AUDITORIA IMUTÁVEL CONFORME MARCO CIVIL DA INTERNET (ART. 15)"
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
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <svg className="w-4 h-4 text-slate-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Marco Civil (Art. 15)</span>
          </div>
          <p className="text-sm font-bold text-emerald-700">Retenção de 6 meses ativa</p>
          <p className="text-[11px] text-slate-400 mt-1">IP, timestamp UTC e identidade preservados</p>
        </div>

        <div className="bg-white border border-slate-200/90 p-4.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <svg className="w-4 h-4 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>Criptografia de Envelope</span>
          </div>
          <p className="text-sm font-bold text-blue-700">AES-256-GCM com KEK/DEK</p>
          <p className="text-[11px] text-slate-400 mt-1">Dados sensíveis cifrados individualmente</p>
        </div>

        <div className="bg-white border border-slate-200/90 p-4.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>LGPD Menores (Art. 14)</span>
          </div>
          <p className="text-sm font-bold text-emerald-700">Termo de Pais Registrado</p>
          <p className="text-[11px] text-slate-400 mt-1">Finalidade específica e revogabilidade garantida</p>
        </div>
      </div>

      {/* ─── Tabela de Trilha de Auditoria com Filtros Excel ───────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col flex-1 min-h-[440px]">
        {/* Barra de Filtros Ativos */}
        <BarraFiltrosAtivos estado={filtroExcel} entidadeNome="evento(s) de auditoria" />

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                <CabecalhoColunaExcel
                  colunaId="timestampUtc"
                  rotulo="TIMESTAMP (UTC)"
                  estado={filtroExcel}
                  className="px-4"
                />
                <CabecalhoColunaExcel
                  colunaId="ipOrigem"
                  rotulo="IP ORIGEM"
                  estado={filtroExcel}
                />
                <CabecalhoColunaExcel
                  colunaId="usuarioEmail"
                  rotulo="OPERADOR"
                  estado={filtroExcel}
                />
                <CabecalhoColunaExcel
                  colunaId="rotaAcessada"
                  rotulo="AÇÃO / ROTA"
                  estado={filtroExcel}
                />
                <CabecalhoColunaExcel
                  colunaId="finalidadeLgpd"
                  rotulo="BASE LEGAL & FINALIDADE"
                  estado={filtroExcel}
                />
                <CabecalhoColunaExcel
                  colunaId="statusCodigo"
                  rotulo="STATUS"
                  estado={filtroExcel}
                  alinhamento="right"
                  className="px-4 text-right"
                />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dadosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto px-4">
                      <h4 className="text-base font-bold text-slate-800 mb-1">
                        {temAlgumFiltroAtivo ? 'Nenhum log com os filtros do Excel' : 'Nenhum log encontrado'}
                      </h4>
                      <p className="text-xs text-slate-500 mb-4">
                        {temAlgumFiltroAtivo
                          ? 'Os filtros aplicados nas colunas ocultaram todos os registros de log.'
                          : 'Nenhum registro de auditoria registrado.'}
                      </p>
                      {temAlgumFiltroAtivo && (
                        <button
                          type="button"
                          onClick={() => filtroExcel.limparTodosFiltros()}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl transition-all cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="1 4 1 10 7 10" />
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                          </svg>
                          <span>Limpar Filtros das Colunas</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                dadosFiltrados.map((log) => (
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
                      <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-2xl border border-blue-100">
                        {log.metodo}
                      </span>
                      <span className="ml-2 font-mono text-[11px] text-slate-700">{log.rotaAcessada}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px]">
                      {log.finalidadeLgpd}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {log.statusCodigo} OK
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="py-2.5 px-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-400 select-none">
          <span>
            {temAlgumFiltroAtivo
              ? `Mostrando ${dadosFiltrados.length} de ${logs.length} evento(s) filtrado(s)`
              : `${dadosFiltrados.length} evento(s) de auditoria registrado(s)`}
          </span>
          <span className="font-mono text-slate-400">Trilha Auditada em Tempo Real</span>
        </div>
      </div>
    </div>
  );
};

import { type FC } from 'react';
import { CabecalhoPaginaSesi } from './CabecalhoPaginaSesi.tsx';
import type { ItemFila } from '../servicos/filaOffline.ts';

interface VisaoFilaOfflineProps {
  itensFila: ItemFila[];
  estaOnline: boolean;
  aoSincronizar: () => void;
  estaSincronizando: boolean;
  aoLimparSincronizados: () => void;
}

export const VisaoFilaOffline: FC<VisaoFilaOfflineProps> = ({
  itensFila,
  estaOnline,
  aoSincronizar,
  estaSincronizando,
  aoLimparSincronizados,
}) => {
  const pendentes = itensFila.filter((i) => i.status === 'pendente');
  const sincronizados = itensFila.filter((i) => i.status === 'sincronizado');

  return (
    <div className="flex flex-col flex-1 anim-surgir">
      {/* ─── Cabeçalho Fixo Modular ───────────────────────────────────────── */}
      <CabecalhoPaginaSesi
        titulo="Fila de Sincronização & Armazenamento"
        subtitulo="MONITORAMENTO DO ARMAZENAMENTO LOCAL (INDEXEDDB) E CONTROLE DE CONEXÃO"
        sincronizacao={{
          aoSincronizar,
          estaSincronizando,
          itensPendentes: pendentes.length,
          rotulo: 'Sincronizar Catraki',
        }}
        acoesExtras={
          <button
            type="button"
            onClick={aoLimparSincronizados}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Remove itens já sincronizados do IndexedDB local"
          >
            Limpar Sincronizados
          </button>
        }
        fixo={true}
      />

      {/* Grid de Resumo de Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status da Rede</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${estaOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-sm font-bold text-slate-800">
              {estaOnline ? 'Online (Pronto para envio)' : 'Offline (Modo Campo)'}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fichas Pendentes</span>
          <p className="text-xl font-extrabold text-[#0b2545] mt-1 font-sans">
            {pendentes.length} registro(s)
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fichas Sincronizadas</span>
          <p className="text-xl font-extrabold text-emerald-600 mt-1 font-sans">
            {sincronizados.length} registro(s)
          </p>
        </div>
      </div>

      {/* Lista de Registros na Fila Local */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden flex flex-col flex-1 min-h-[380px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                <th scope="col" className="py-2.5 px-4 font-bold text-slate-600">CHAVE IDEMPOTÊNCIA</th>
                <th scope="col" className="py-2.5 px-3 font-bold text-slate-600">PACIENTE</th>
                <th scope="col" className="py-2.5 px-3 font-bold text-slate-600">ESPECIALIDADE</th>
                <th scope="col" className="py-2.5 px-3 font-bold text-slate-600">TENTATIVAS</th>
                <th scope="col" className="py-2.5 px-3 font-bold text-slate-600">STATUS</th>
                <th scope="col" className="py-2.5 px-4 font-bold text-slate-600 text-right">DATA CRIADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {itensFila.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <span className="text-2xl">📦</span>
                      <span className="text-xs font-semibold text-slate-600">Fila offline limpa</span>
                      <span className="text-[11px] text-slate-400">Nenhum atendimento retido no IndexedDB deste notebook.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                itensFila.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600">
                      {item.idempotencyKey ? `${item.idempotencyKey.slice(0, 18)}...` : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{item.dados.pacienteId || 'Novo Paciente'}</td>
                    <td className="py-2.5 px-3">{item.dados.especialidade}</td>
                    <td className="py-2.5 px-3 font-mono">{item.tentativas}x</td>
                    <td className="py-2.5 px-3">
                      {item.status === 'sincronizado' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Sincronizado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Pendente Envio
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(item.criadoEm).toLocaleTimeString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="py-2 px-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-400 select-none">
          <span>{itensFila.length} registro(s) no armazenamento local</span>
          <span className="font-mono text-slate-400">Proteção contra perda de dados • Marco Civil & LGPD</span>
        </div>
      </div>
    </div>
  );
};

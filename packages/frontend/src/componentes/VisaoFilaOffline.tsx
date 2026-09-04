import { type FC } from 'react';
import { PageHeader } from './PageHeader.tsx';
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
    <div className="flex flex-col flex-1">
      <PageHeader
        titulo="Fila Offline & Sincronização"
        subtitulo="MONITORAMENTO DO ARMAZENAMENTO LOCAL (INDEXEDDB) E CONTROLE DE CONEXÃO"
        acoesDireitas={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={aoLimparSincronizados}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              title="Remove itens já sincronizados do IndexedDB local"
            >
              Limpar Sincronizados
            </button>
            <button
              type="button"
              onClick={aoSincronizar}
              disabled={estaSincronizando}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {estaSincronizando ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Sincronizar Fila Agora</span>
                </>
              )}
            </button>
          </div>
        }
      />

      {/* Cards de Métricas da Fila */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pendentes de Envio</p>
            <p className="text-xl font-extrabold text-amber-600 mt-0.5">{pendentes.length}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            ⏳
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sincronizados com Servidor</p>
            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{sincronizados.length}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            ✓
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status do Dispositivo</p>
            <p className={`text-base font-extrabold mt-0.5 ${estaOnline ? 'text-emerald-700' : 'text-slate-600'}`}>
              {estaOnline ? 'Online (Conectado)' : 'Offline (Modo Campo)'}
            </p>
          </div>
          <div className={`w-3 h-3 rounded-full ${estaOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
        </div>
      </div>

      {/* Tabela de Itens da Fila */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden flex flex-col flex-1 min-h-[380px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                <th scope="col" className="py-2.5 px-4">CHAVE DE IDEMPOTÊNCIA</th>
                <th scope="col" className="py-2.5 px-3">STATUS</th>
                <th scope="col" className="py-2.5 px-3">TENTATIVAS</th>
                <th scope="col" className="py-2.5 px-3">DATA CRIAÇÃO LOCAL</th>
                <th scope="col" className="py-2.5 px-3">ÚLTIMO ERRO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {itensFila.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto px-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 ring-8 ring-emerald-50/50">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">Fila Local Vazia</h4>
                      <p className="text-xs text-slate-500">
                        Todos os atendimentos foram sincronizados com o servidor central.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                itensFila.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-700 text-[11px]">
                      {item.idempotencyKey}
                    </td>
                    <td className="py-2.5 px-3">
                      {item.status === 'sincronizado' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Sincronizado
                        </span>
                      ) : item.status === 'pendente' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Pendente
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                          Erro de Envio
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">
                      {item.tentativas}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {new Date(item.criadoEm).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2.5 px-3 text-red-600 text-[11px] italic">
                      {item.ultimoErro || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="py-2 px-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-400">
          <span>{itensFila.length} registro(s) no IndexedDB local</span>
          <span className="font-mono">Dexie.js Offline Store</span>
        </div>
      </div>
    </div>
  );
};

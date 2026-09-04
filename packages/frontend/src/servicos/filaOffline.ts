import Dexie, { type EntityTable } from 'dexie';
import type { StatusSincronizacao, FichaAtendimento } from '@sistema/shared';

/**
 * Item da fila offline armazenado no IndexedDB via Dexie.js.
 *
 * Quando a aplicação está offline, os atendimentos são enfileirados
 * localmente e sincronizados automaticamente ao reconectar.
 */
export interface ItemFila {
  id?: number;
  idempotencyKey: string;
  dados: FichaAtendimento;
  status: StatusSincronizacao;
  tentativas: number;
  ultimoErro?: string;
  criadoEm: string;
  atualizadoEm: string;
}

/**
 * Banco de dados local (IndexedDB) para fila offline de atendimentos.
 *
 * Usa Dexie.js para abstração limpa sobre IndexedDB com tipagem forte.
 * Os atendimentos pendentes são armazenados aqui quando o dispositivo
 * está offline e sincronizados via API quando a conexão é restaurada.
 */
class BancoFilaOffline extends Dexie {
  atendimentosPendentes!: EntityTable<ItemFila, 'id'>;

  constructor() {
    super('SaudeEmMovimentoFilaOffline');

    this.version(1).stores({
      atendimentosPendentes:
        '++id, idempotencyKey, status, criadoEm',
    });
  }
}

export const bancoOffline = new BancoFilaOffline();

/**
 * Enfileira um atendimento para sincronização posterior.
 *
 * @param ficha Dados da ficha de atendimento (validados pelo schema Zod)
 * @returns ID do item na fila local
 */
export async function enfileirarAtendimento(
  ficha: FichaAtendimento
): Promise<number> {
  const agora = new Date().toISOString();

  const id = await bancoOffline.atendimentosPendentes.add({
    idempotencyKey: ficha.idempotencyKey,
    dados: ficha,
    status: 'pendente',
    tentativas: 0,
    criadoEm: agora,
    atualizadoEm: agora,
  });

  return id as number;
}

/**
 * Sincroniza a fila de atendimentos pendentes com o backend.
 *
 * Processa a fila em ordem FIFO. Para cada item:
 * 1. Tenta enviar para a API
 * 2. Se sucesso: marca como 'sincronizado'
 * 3. Se erro 409 (duplicado): marca como 'sincronizado' (idempotência)
 * 4. Se outro erro: incrementa tentativas, marca como 'erro'
 *
 * @param urlBase URL base da API (ex: '/api/v1')
 * @returns Resultado da sincronização
 */
export async function sincronizarFila(
  urlBase: string = '/api/v1'
): Promise<{ sincronizados: number; erros: number }> {
  const pendentes = await bancoOffline.atendimentosPendentes
    .where('status')
    .anyOf(['pendente', 'erro'])
    .sortBy('criadoEm');

  let sincronizados = 0;
  let erros = 0;

  for (const item of pendentes) {
    if (!item.id) continue;

    try {
      await bancoOffline.atendimentosPendentes.update(item.id, {
        status: 'sincronizando' as StatusSincronizacao,
        atualizadoEm: new Date().toISOString(),
      });

      const resposta = await fetch(`${urlBase}/atendimentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(item.dados),
      });

      if (resposta.ok || resposta.status === 409) {
        // 409 = idempotencyKey já existe → já foi sincronizado anteriormente
        await bancoOffline.atendimentosPendentes.update(item.id, {
          status: 'sincronizado' as StatusSincronizacao,
          atualizadoEm: new Date().toISOString(),
        });
        sincronizados++;
      } else {
        const erro = await resposta.text();
        await bancoOffline.atendimentosPendentes.update(item.id, {
          status: 'erro' as StatusSincronizacao,
          tentativas: item.tentativas + 1,
          ultimoErro: `HTTP ${resposta.status}: ${erro.substring(0, 500)}`,
          atualizadoEm: new Date().toISOString(),
        });
        erros++;
      }
    } catch (erro) {
      // Erro de rede — provavelmente ainda offline
      if (item.id) {
        await bancoOffline.atendimentosPendentes.update(item.id, {
          status: 'erro' as StatusSincronizacao,
          tentativas: item.tentativas + 1,
          ultimoErro:
            erro instanceof Error ? erro.message : 'Erro de rede desconhecido',
          atualizadoEm: new Date().toISOString(),
        });
      }
      erros++;
    }
  }

  // Limpar itens sincronizados com mais de 24h
  const umDiaAtras = new Date(Date.now() - 86_400_000).toISOString();
  await bancoOffline.atendimentosPendentes
    .where('status')
    .equals('sincronizado')
    .filter((item) => item.atualizadoEm < umDiaAtras)
    .delete();

  return { sincronizados, erros };
}

/**
 * Conta os atendimentos pendentes de sincronização.
 */
export async function contarPendentes(): Promise<number> {
  return bancoOffline.atendimentosPendentes
    .where('status')
    .anyOf(['pendente', 'erro'])
    .count();
}

/**
 * Limpa registros sincronizados do IndexedDB local.
 */
export async function limparSincronizadosAntigos(tempoMs: number = 0): Promise<number> {
  const limite = new Date(Date.now() - tempoMs).toISOString();
  return bancoOffline.atendimentosPendentes
    .where('status')
    .equals('sincronizado')
    .filter((item) => item.atualizadoEm <= limite)
    .delete();
}

/**
 * Inicia o listener de reconexão para sync automático.
 *
 * Quando o navegador detecta reconexão (`navigator.onLine`),
 * dispara a sincronização da fila automaticamente.
 */
export function iniciarSyncAutomatico(): () => void {
  const handler = () => {
    if (navigator.onLine) {
      sincronizarFila().catch(console.error);
    }
  };

  window.addEventListener('online', handler);

  // Sync inicial se já estiver online
  if (navigator.onLine) {
    sincronizarFila().catch(console.error);
  }

  // Retorna cleanup function
  return () => window.removeEventListener('online', handler);
}


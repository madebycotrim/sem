import { useState, useRef, useEffect, type FC, type ChangeEvent, type DragEvent } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Download,
  Play,
  Pause,
  X,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { utils, read, writeFile } from 'xlsx';
import { requisicaoApi } from '../servicos/api.ts';
import { Botao } from './Botao.tsx';
import { formatarCpf } from '../utilitarios/mascaras.ts';

export interface ModalImportarPlanilhaProps {
  aberto: boolean;
  aoFechar: () => void;
  aoConcluirImportacao?: () => void;
}

interface LinhaPlanilhaBruta {
  [chave: string]: unknown;
}

interface LinhaNormalizada {
  linhaOriginal: number;
  pacienteNome: string;
  pacienteCpf: string | null;
  dataNascimento: string | null;
  pacienteEmail: string | null;
  pacienteTelefone: string | null;
  especialidade: string;
  profissionalNome: string;
  situacao: string;
  instituicaoNome: string;
  escolaEncontrada?: boolean;
}

interface ResumoDiagnostico {
  totalLinhas: number;
  escolasIdentificadas: string[];
  escolasNaoEncontradas: string[];
  profissionaisIdentificados: string[];
  alunosUnicosEstimados: number;
  especialidadesContagem: Record<string, number>;
  linhasValidas: LinhaNormalizada[];
  linhasInvalidas: Array<{ linha: number; motivo: string }>;
}

type EtapaImportacao = 'upload' | 'preview' | 'importing' | 'completed';

const normalizarTexto = (valor?: string | null): string =>
  (valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/** Converte datas da planilha (incluindo números seriais do Excel e DD/MM/AAAA) */
function formatarDataPlanilha(valor: unknown): string | null {
  if (!valor) return null;

  if (valor instanceof Date && !isNaN(valor.getTime())) {
    return valor.toISOString().slice(0, 10);
  }

  if (typeof valor === 'number') {
    // Serial do Excel (número de dias desde 1899-12-30)
    const milissegundosPorDia = 86400 * 1000;
    const dataCalculada = new Date((valor - 25569) * milissegundosPorDia);
    if (!isNaN(dataCalculada.getTime())) {
      return dataCalculada.toISOString().slice(0, 10);
    }
  }

  const str = String(valor).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  const matchBr = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (matchBr) {
    const dia = matchBr[1].padStart(2, '0');
    const mes = matchBr[2].padStart(2, '0');
    const ano = matchBr[3];
    return `${ano}-${mes}-${dia}`;
  }

  return str.slice(0, 10);
}

export const ModalImportarPlanilha: FC<ModalImportarPlanilhaProps> = ({
  aberto,
  aoFechar,
  aoConcluirImportacao,
}) => {
  const [etapa, setEtapa] = useState<EtapaImportacao>('upload');
  const [nomeArquivo, setNomeArquivo] = useState('');
  const [tamanhoArquivo, setTamanhoArquivo] = useState('');
  const [arrastando, setArrastando] = useState(false);
  const [analisandoArquivo, setAnalisandoArquivo] = useState(false);
  const [diagnostico, setDiagnostico] = useState<ResumoDiagnostico | null>(null);

  // Metadados do banco para validação
  const [escolasSistema, setEscolasSistema] = useState<Array<{ id: string; nome: string }>>([]);
  const [profissionaisSistema, setProfissionaisSistema] = useState<Array<{ id: string; nome: string }>>([]);

  // Opções de configuração
  const [tamanhoLote, setTamanhoLote] = useState(100);
  const [autoCriarProfissionais, setAutoCriarProfissionais] = useState(true);
  const [turmaPadrao, setTurmaPadrao] = useState('Geral');
  const [turnoPadrao, setTurnoPadrao] = useState<'MANHA' | 'TARDE'>('MANHA');

  // Estado da execução em lote
  const [loteAtual, setLoteAtual] = useState(0);
  const [totalLotes, setTotalLotes] = useState(0);
  const [progressoPercentual, setProgressoPercentual] = useState(0);
  const [tempoEstimadoSegundos, setTempoEstimadoSegundos] = useState<number | null>(null);
  const [pausado, setPausado] = useState(false);
  const canceladoRef = useRef(false);
  const pausadoRef = useRef(false);

  // Métricas acumuladas
  const [metricas, setMetricas] = useState({
    processados: 0,
    consultasCriadas: 0,
    alunosCriados: 0,
    alunosReaproveitados: 0,
    profissionaisCriados: 0,
    falhas: 0,
  });
  const [logs, setLogs] = useState<Array<{ timestamp: string; mensagem: string; tipo: 'info' | 'sucesso' | 'erro' | 'aviso' }>>([]);
  const [detalhesFalhas, setDetalhesFalhas] = useState<Array<{ linha: number; erro: string; detalhe?: string }>>([]);

  const inputArquivoRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Carrega metadados do backend ao abrir
  useEffect(() => {
    if (aberto) {
      requisicaoApi<{ sucesso: boolean; escolas: Array<{ id: string; nome: string }>; profissionais: Array<{ id: string; nome: string }> }>('/importacao/metadados')
        .then((res) => {
          if (res?.sucesso) {
            setEscolasSistema(res.escolas || []);
            setProfissionaisSistema(res.profissionais || []);
          }
        })
        .catch((err) => {
          console.error('Erro ao carregar metadados para importação:', err);
        });
    } else {
      // Resetar ao fechar
      setEtapa('upload');
      setDiagnostico(null);
      setNomeArquivo('');
      setPausado(false);
      canceladoRef.current = false;
      pausadoRef.current = false;
      setLogs([]);
      setDetalhesFalhas([]);
    }
  }, [aberto]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const adicionarLog = (mensagem: string, tipo: 'info' | 'sucesso' | 'erro' | 'aviso' = 'info') => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setLogs((prev) => [...prev.slice(-100), { timestamp, mensagem, tipo }]);
  };

  /**
   * Baixa uma planilha modelo com as colunas oficiais exigidas
   */
  const baixarPlanilhaModelo = () => {
    const cabecalhos = [
      'Paciente',
      'Patient Cpf',
      'Data de nascimento',
      'Patient Email',
      'Patient Phone',
      'Especialidade',
      'Profissional',
      'Situação',
      'Instituição',
    ];

    const exemplo1 = [
      'Lucas Gabriel da Silva',
      '123.456.789-01',
      '15/03/2012',
      'responsavel.lucas@email.com',
      '(61) 98765-4321',
      'Oftalmologia',
      'Dr. Roberto Mendes',
      'Concluído',
      escolasSistema[0]?.nome || 'ESCOLA CLASSE 01',
    ];

    const exemplo2 = [
      'Ana Beatriz Oliveira',
      '987.654.321-02',
      '22/07/2011',
      'ana.pais@email.com',
      '(61) 99123-4567',
      'Odontologia',
      'Dra. Juliana Ferreira',
      'Agendado',
      escolasSistema[0]?.nome || 'ESCOLA CLASSE 01',
    ];

    const ws = utils.aoa_to_sheet([cabecalhos, exemplo1, exemplo2]);
    // Definir larguras de coluna agradáveis
    ws['!cols'] = [
      { wch: 28 }, // Paciente
      { wch: 16 }, // CPF
      { wch: 18 }, // Nascimento
      { wch: 28 }, // Email
      { wch: 18 }, // Phone
      { wch: 18 }, // Especialidade
      { wch: 24 }, // Profissional
      { wch: 14 }, // Situação
      { wch: 32 }, // Instituição
    ];

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Consultas');
    writeFile(wb, 'modelo_importacao_consultas_catraki.xlsx');
  };

  /**
   * Processa o arquivo selecionado e monta o diagnóstico prévio
   */
  const processarArquivoSelecionado = async (file: File) => {
    setNomeArquivo(file.name);
    setTamanhoArquivo(`${(file.size / 1024).toFixed(1)} KB`);
    setAnalisandoArquivo(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = read(buffer, { type: 'array', cellDates: true });
      const primeiraAba = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[primeiraAba];
      const linhasJson = utils.sheet_to_json<LinhaPlanilhaBruta>(worksheet, { defval: '' });

      if (linhasJson.length === 0) {
        alert('A planilha selecionada está vazia.');
        setAnalisandoArquivo(false);
        return;
      }

      // Mapa de normalização de chaves de colunas
      const mapaChaves: Record<string, string> = {};
      const primeiraLinha = linhasJson[0];
      for (const chaveOriginal of Object.keys(primeiraLinha)) {
        const norm = normalizarTexto(chaveOriginal);
        if (norm === 'paciente' || norm.includes('nome do paciente') || norm === 'aluno') {
          mapaChaves['paciente'] = chaveOriginal;
        } else if (norm.includes('cpf')) {
          mapaChaves['cpf'] = chaveOriginal;
        } else if (norm.includes('nasc')) {
          mapaChaves['dataNascimento'] = chaveOriginal;
        } else if (norm.includes('email') || norm.includes('e-mail')) {
          mapaChaves['email'] = chaveOriginal;
        } else if (norm.includes('phone') || norm.includes('telef') || norm.includes('celular')) {
          mapaChaves['telefone'] = chaveOriginal;
        } else if (norm.includes('especialidade')) {
          mapaChaves['especialidade'] = chaveOriginal;
        } else if (norm.includes('profissi') || norm.includes('medico')) {
          mapaChaves['profissional'] = chaveOriginal;
        } else if (norm.includes('situac') || norm.includes('status')) {
          mapaChaves['situacao'] = chaveOriginal;
        } else if (norm.includes('institu') || norm.includes('escola') || norm.includes('polo')) {
          mapaChaves['instituicao'] = chaveOriginal;
        }
      }

      // Validação das colunas mínimas
      if (!mapaChaves['paciente'] || !mapaChaves['instituicao']) {
        alert(
          'Não foi possível identificar as colunas essenciais na planilha ("Paciente" e "Instituição"). Baixe o modelo oficial para conferir o formato.'
        );
        setAnalisandoArquivo(false);
        return;
      }

      // Cache das escolas cadastradas no sistema para checagem rápida
      const escolasNormSet = new Set(escolasSistema.map((e) => normalizarTexto(e.nome)));

      const linhasValidas: LinhaNormalizada[] = [];
      const linhasInvalidas: Array<{ linha: number; motivo: string }> = [];
      const escolasIdentificadasSet = new Set<string>();
      const escolasNaoEncontradasSet = new Set<string>();
      const profissionaisSet = new Set<string>();
      const alunosSet = new Set<string>();
      const especialidadesContagem: Record<string, number> = {};

      linhasJson.forEach((linha, idx) => {
        const linhaNum = idx + 2; // Cabeçalho está na linha 1
        const pacienteNome = String(linha[mapaChaves['paciente']] || '').trim();
        const instituicaoNome = String(linha[mapaChaves['instituicao']] || '').trim();
        const especialidade = String(linha[mapaChaves['especialidade']] || 'Oftalmologia').trim();
        const profissionalNome = String(linha[mapaChaves['profissional']] || 'Profissional Geral').trim();
        const situacao = String(linha[mapaChaves['situacao']] || 'Concluído').trim();
        const pacienteCpf = String(linha[mapaChaves['cpf']] || '').trim() || null;
        const dataNascimento = formatarDataPlanilha(linha[mapaChaves['dataNascimento']]);
        const pacienteEmail = String(linha[mapaChaves['email']] || '').trim() || null;
        const pacienteTelefone = String(linha[mapaChaves['telefone']] || '').trim() || null;

        if (!pacienteNome) {
          linhasInvalidas.push({ linha: linhaNum, motivo: 'Nome do paciente em branco' });
          return;
        }
        if (!instituicaoNome) {
          linhasInvalidas.push({ linha: linhaNum, motivo: 'Nome da instituição em branco' });
          return;
        }

        const instNorm = normalizarTexto(instituicaoNome);
        const escolaExiste = escolasNormSet.has(instNorm);

        if (escolaExiste) {
          escolasIdentificadasSet.add(instituicaoNome);
        } else {
          escolasNaoEncontradasSet.add(instituicaoNome);
        }

        if (profissionalNome) profissionaisSet.add(profissionalNome);
        alunosSet.add(pacienteCpf ? `cpf:${pacienteCpf.replace(/\D/g, '')}` : `nome:${pacienteNome.toLowerCase()}`);
        especialidadesContagem[especialidade] = (especialidadesContagem[especialidade] || 0) + 1;

        linhasValidas.push({
          linhaOriginal: linhaNum,
          pacienteNome,
          pacienteCpf,
          dataNascimento,
          pacienteEmail,
          pacienteTelefone,
          especialidade,
          profissionalNome,
          situacao,
          instituicaoNome,
          escolaEncontrada: escolaExiste,
        });
      });

      setDiagnostico({
        totalLinhas: linhasJson.length,
        escolasIdentificadas: Array.from(escolasIdentificadasSet),
        escolasNaoEncontradas: Array.from(escolasNaoEncontradasSet),
        profissionaisIdentificados: Array.from(profissionaisSet),
        alunosUnicosEstimados: alunosSet.size,
        especialidadesContagem,
        linhasValidas,
        linhasInvalidas,
      });

      setEtapa('preview');
    } catch (err: any) {
      console.error('Erro ao processar planilha:', err);
      alert(`Falha ao ler o arquivo: ${err?.message || 'Arquivo corrompido ou formato inválido'}`);
    } finally {
      setAnalisandoArquivo(false);
    }
  };

  const lidarDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastando(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processarArquivoSelecionado(e.dataTransfer.files[0]);
    }
  };

  const lidarSelecaoArquivo = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processarArquivoSelecionado(e.target.files[0]);
    }
  };

  const importacaoIdRef = useRef<string>('');
  const acumuladorIdsRef = useRef<{
    atendimentoIds: string[];
    pacienteIds: string[];
    usuarioIds: string[];
  }>({ atendimentoIds: [], pacienteIds: [], usuarioIds: [] });
  const [rollbackExecutado, setRollbackExecutado] = useState(false);
  const [motivoRollback, setMotivoRollback] = useState('');
  const [executandoRollback, setExecutandoRollback] = useState(false);

  /**
   * Executa reversão atômica de todos os dados gerados pela sessão atual
   */
  const executarRollback = async (motivo: string) => {
    setExecutandoRollback(true);
    adicionarLog(`Acionando Rollback Automático: ${motivo}...`, 'erro');
    adicionarLog('Excluindo todos os registros gerados nesta sessão para restaurar o banco ao estado original...', 'aviso');

    try {
      const res = await requisicaoApi<{
        sucesso: boolean;
        mensagem: string;
        revertidos: { atendimentos: number; pacientes: number; usuarios: number };
      }>('/importacao/rollback', {
        metodo: 'POST',
        corpo: {
          importacaoId: importacaoIdRef.current,
          atendimentoIds: acumuladorIdsRef.current.atendimentoIds,
          pacienteIds: acumuladorIdsRef.current.pacienteIds,
          usuarioIds: acumuladorIdsRef.current.usuarioIds,
        },
      });

      adicionarLog(
        `Rollback concluído: ${res?.revertidos?.atendimentos ?? 0} consultas, ${res?.revertidos?.pacientes ?? 0} novos alunos e ${res?.revertidos?.usuarios ?? 0} profissionais excluídos. Banco 100% íntegro.`,
        'aviso'
      );
      setRollbackExecutado(true);
      setMotivoRollback(motivo);
    } catch (err: any) {
      adicionarLog(`Falha ao contactar endpoint de rollback: ${err?.message || 'Erro desconhecido'}`, 'erro');
      setRollbackExecutado(true);
      setMotivoRollback(motivo);
    } finally {
      setExecutandoRollback(false);
      setTempoEstimadoSegundos(null);
      setEtapa('completed');
    }
  };

  /**
   * Dispara a importação em chunks sequenciais com feedback em tempo real
   */
  const iniciarImportacaoEmLote = async () => {
    if (!diagnostico || diagnostico.linhasValidas.length === 0) return;

    setEtapa('importing');
    canceladoRef.current = false;
    pausadoRef.current = false;
    setPausado(false);
    setRollbackExecutado(false);
    setMotivoRollback('');

    // Gera ID único de sessão para atomicidade e rastreabilidade
    importacaoIdRef.current = `imp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    acumuladorIdsRef.current = { atendimentoIds: [], pacienteIds: [], usuarioIds: [] };

    const linhas = diagnostico.linhasValidas;
    const tamanhoDoChunk = tamanhoLote;
    const totalChunks = Math.ceil(linhas.length / tamanhoDoChunk);
    setTotalLotes(totalChunks);

    setMetricas({
      processados: 0,
      consultasCriadas: 0,
      alunosCriados: 0,
      alunosReaproveitados: 0,
      profissionaisCriados: 0,
      falhas: 0,
    });
    setLogs([]);
    setDetalhesFalhas([]);

    adicionarLog(
      `Iniciando importação de ${linhas.length.toLocaleString('pt-BR')} consultas em ${totalChunks} lotes (${tamanhoDoChunk} linhas/lote) [Sessão: ${importacaoIdRef.current}]...`,
      'info'
    );

    const inicioGeral = Date.now();
    let processadosAcumulados = 0;
    let consultasCriadasAcumuladas = 0;
    let alunosCriadosAcumulados = 0;
    let alunosReaproveitadosAcumulados = 0;
    let profissionaisCriadosAcumulados = 0;
    let falhasAcumuladas = 0;
    const todasFalhas: Array<{ linha: number; erro: string; detalhe?: string }> = [];

    for (let i = 0; i < totalChunks; i++) {
      // Checa cancelamento
      if (canceladoRef.current) {
        adicionarLog('Cancelamento solicitado. Revertendo todos os lotes processados...', 'aviso');
        await executarRollback('Cancelado pelo usuário durante o processamento');
        return;
      }

      // Checa pausa
      while (pausadoRef.current) {
        await new Promise((r) => setTimeout(r, 400));
        if (canceladoRef.current) break;
      }
      if (canceladoRef.current) {
        adicionarLog('Cancelamento solicitado durante pausa. Revertendo lotes...', 'aviso');
        await executarRollback('Cancelado pelo usuário durante pausa');
        return;
      }

      setLoteAtual(i + 1);
      const chunk = linhas.slice(i * tamanhoDoChunk, (i + 1) * tamanhoDoChunk);

      try {
        const respostaLote = await requisicaoApi<{
          sucesso: boolean;
          abortado?: boolean;
          erro?: string;
          totalProcessados: number;
          atendimentosCriados: number;
          pacientesCriados: number;
          pacientesReaproveitados: number;
          profissionaisCriados: number;
          atendimentosCriadosIds?: string[];
          pacientesCriadosIds?: string[];
          profissionaisCriadosIds?: string[];
          totalFalhas: number;
          falhas: Array<{ linha: number; erro: string; detalhe?: string }>;
        }>('/importacao/processar-lote', {
          metodo: 'POST',
          corpo: {
            importacaoId: importacaoIdRef.current,
            itens: chunk,
            opcoes: {
              criarProfissionalSeNaoExistir: autoCriarProfissionais,
              turmaPadrao,
              turnoPadrao,
              abortarNoPrimeiroErro: true,
            },
          },
        });

        // Acumula IDs para garantia de rollback
        if (respostaLote?.atendimentosCriadosIds) {
          acumuladorIdsRef.current.atendimentoIds.push(...respostaLote.atendimentosCriadosIds);
        }
        if (respostaLote?.pacientesCriadosIds) {
          acumuladorIdsRef.current.pacienteIds.push(...respostaLote.pacientesCriadosIds);
        }
        if (respostaLote?.profissionaisCriadosIds) {
          acumuladorIdsRef.current.usuarioIds.push(...respostaLote.profissionaisCriadosIds);
        }

        // Se o usuário solicitou cancelamento durante a requisição, reverte tudo imediatamente
        if (canceladoRef.current) {
          adicionarLog('Cancelamento solicitado durante o lote. Revertendo todos os registros...', 'aviso');
          await executarRollback('Cancelado pelo usuário durante o processamento');
          return;
        }

        if (respostaLote && respostaLote.sucesso && !respostaLote.abortado) {
          processadosAcumulados += respostaLote.totalProcessados;
          consultasCriadasAcumuladas += respostaLote.atendimentosCriados;
          alunosCriadosAcumulados += respostaLote.pacientesCriados;
          alunosReaproveitadosAcumulados += respostaLote.pacientesReaproveitados;
          profissionaisCriadosAcumulados += respostaLote.profissionaisCriados;
          falhasAcumuladas += respostaLote.totalFalhas;

          if (respostaLote.falhas && respostaLote.falhas.length > 0) {
            todasFalhas.push(...respostaLote.falhas);
          }

          setMetricas({
            processados: processadosAcumulados,
            consultasCriadas: consultasCriadasAcumuladas,
            alunosCriados: alunosCriadosAcumulados,
            alunosReaproveitados: alunosReaproveitadosAcumulados,
            profissionaisCriados: profissionaisCriadosAcumulados,
            falhas: falhasAcumuladas,
          });

          const pct = Math.round((processadosAcumulados / linhas.length) * 100);
          setProgressoPercentual(pct);

          // Cálculo de tempo estimado restante
          const tempoDecorridoMs = Date.now() - inicioGeral;
          const velocidadePorLinha = tempoDecorridoMs / processadosAcumulados;
          const linhasRestantes = linhas.length - processadosAcumulados;
          const segundosRestantes = Math.max(1, Math.round((velocidadePorLinha * linhasRestantes) / 1000));
          setTempoEstimadoSegundos(segundosRestantes);

          adicionarLog(
            `Lote ${i + 1}/${totalChunks} concluído: +${respostaLote.atendimentosCriados} consultas, +${respostaLote.pacientesCriados} novos alunos (${pct}% concluído).`,
            'sucesso'
          );
        } else {
          // HOUVE ERRO OU ABORTO: EXCLUI TUDO AUTOMATICAMENTE
          const erroDescricao =
            respostaLote?.erro || `Inconsistência detectada no lote ${i + 1}. Cancelamento atômico acionado.`;
          adicionarLog(erroDescricao, 'erro');
          await executarRollback(erroDescricao);
          return;
        }
      } catch (err: any) {
        // HOUVE ERRO DE REDE/SERVIDOR: EXCLUI TUDO AUTOMATICAMENTE
        const erroDescricao = `Erro de comunicação no lote ${i + 1}: ${err?.message || 'Falha de conexão'}. Rollback automático acionado.`;
        adicionarLog(erroDescricao, 'erro');
        await executarRollback(erroDescricao);
        return;
      }
    }

    setDetalhesFalhas(todasFalhas);
    setTempoEstimadoSegundos(null);
    setProgressoPercentual(100);
    setEtapa('completed');
    adicionarLog('Processo de importação 100% finalizado com sucesso!', 'sucesso');
    aoConcluirImportacao?.();
  };

  const alternarPausa = () => {
    pausadoRef.current = !pausado;
    setPausado(!pausado);
    adicionarLog(pausado ? 'Importação retomada.' : 'Importação pausada temporariamente.', 'aviso');
  };

  const cancelarImportacao = () => {
    if (
      confirm(
        'Tem certeza de que deseja cancelar a importação? Todos os dados já processados nesta sessão serão revertidos e excluídos imediatamente para manter o banco íntegro.'
      )
    ) {
      canceladoRef.current = true;
    }
  };

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* ── Topo com Gradiente e Identidade Catraki ─────────────────────── */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">Importação Inteligente de Consultas</h3>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-emerald-950 rounded-full">
                  Alta Capacidade (+6.000)
                </span>
              </div>
              <p className="text-xs text-blue-100/90 font-medium">
                Vínculo automático de Alunos (LGPD), Escolas, Profissionais e Especialidades
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            disabled={etapa === 'importing'}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Conteúdo Central por Etapas ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ──── ETAPA 1: Upload e Seleção de Arquivo ─────────────────────── */}
          {etapa === 'upload' && (
            <div className="space-y-6">
              {/* Card explicativo e download do modelo */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/70 border border-blue-200/80">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-blue-950">
                      Estrutura oficial recomendada da planilha:
                    </p>
                    <p className="text-blue-900 leading-relaxed">
                      <span className="font-mono font-semibold bg-white/80 px-1 py-0.5 rounded border border-blue-200">
                        Paciente | Patient Cpf | Data de nascimento | Patient Email | Patient Phone | Especialidade | Profissional | Situação | Instituição
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={baixarPlanilhaModelo}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors shadow-2xs shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Baixar Planilha Modelo (.xlsx)
                </button>
              </div>

              {/* Zona de Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setArrastando(true);
                }}
                onDragLeave={() => setArrastando(false)}
                onDrop={lidarDrop}
                onClick={() => inputArquivoRef.current?.click()}
                className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  arrastando
                    ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-white'
                }`}
              >
                <input
                  ref={inputArquivoRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={lidarSelecaoArquivo}
                  className="hidden"
                />
                {analisandoArquivo ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-sm font-bold text-slate-700">Analisando e validando planilha...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="p-4 bg-blue-100/70 text-blue-700 rounded-full">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Arraste e solte o arquivo aqui ou <span className="text-blue-600 underline">clique para selecionar</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Formatos suportados: .xlsx, .xls ou .csv (arquivos grandes com mais de 6.000 consultas suportados)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ──── ETAPA 2: Pré-visualização e Diagnóstico Inteligente ───────── */}
          {etapa === 'preview' && diagnostico && (
            <div className="space-y-6">
              {/* Resumo do Arquivo */}
              <div className="flex items-center justify-between p-3.5 bg-slate-100 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">{nomeArquivo}</div>
                    <div className="text-[11px] text-slate-500">{tamanhoArquivo} • {diagnostico.totalLinhas.toLocaleString('pt-BR')} linhas lidas</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEtapa('upload');
                    setDiagnostico(null);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  Trocar arquivo
                </button>
              </div>

              {/* Cards de Métricas de Diagnóstico Prévio */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200">
                  <div className="text-[10px] font-black uppercase text-blue-700">Total Consultas</div>
                  <div className="text-xl font-black text-blue-950 mt-1">
                    {diagnostico.linhasValidas.length.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[10px] text-blue-700 mt-0.5">linhas prontas para carga</div>
                </div>

                <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200">
                  <div className="text-[10px] font-black uppercase text-purple-700">Alunos Únicos</div>
                  <div className="text-xl font-black text-purple-950 mt-1">
                    ~{diagnostico.alunosUnicosEstimados.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[10px] text-purple-700 mt-0.5">cadastros LGPD seguros</div>
                </div>

                <div className={`p-3.5 rounded-xl border ${diagnostico.escolasNaoEncontradas.length > 0 ? 'bg-amber-50/60 border-amber-200' : 'bg-emerald-50/60 border-emerald-200'}`}>
                  <div className={`text-[10px] font-black uppercase ${diagnostico.escolasNaoEncontradas.length > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    Escolas Mapeadas
                  </div>
                  <div className={`text-xl font-black mt-1 ${diagnostico.escolasNaoEncontradas.length > 0 ? 'text-amber-950' : 'text-emerald-950'}`}>
                    {diagnostico.escolasIdentificadas.length}
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5">
                    {diagnostico.escolasNaoEncontradas.length === 0 ? '100% encontradas' : `${diagnostico.escolasNaoEncontradas.length} não cadastradas`}
                  </div>
                </div>

                <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200">
                  <div className="text-[10px] font-black uppercase text-indigo-700">Profissionais</div>
                  <div className="text-xl font-black text-indigo-950 mt-1">
                    {diagnostico.profissionaisIdentificados.length}
                  </div>
                  <div className="text-[10px] text-indigo-700 mt-0.5">
                    {profissionaisSistema.length > 0
                      ? `${diagnostico.profissionaisIdentificados.filter((p) => profissionaisSistema.some((ps) => normalizarTexto(ps.nome) === normalizarTexto(p))).length} já cadastrados`
                      : 'profissionais mapeados'}
                  </div>
                </div>
              </div>

              {/* Alerta de Escolas Não Encontradas (se houver) */}
              {diagnostico.escolasNaoEncontradas.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 space-y-1">
                    <p className="font-bold">Atenção: Algumas instituições da planilha não foram encontradas no sistema:</p>
                    <p className="text-[11px] text-amber-800">
                      {diagnostico.escolasNaoEncontradas.join(', ')}
                    </p>
                    <p className="text-[10px] text-amber-700">
                      As consultas dessas escolas serão sinalizadas como erro para evitar inconsistência cadastral.
                    </p>
                  </div>
                </div>
              )}

              {/* Tabela de Amostragem (Primeiros 5 registros) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2.5 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs text-indigo-950 font-medium">
                  <Stethoscope className="w-4 h-4 text-indigo-700 shrink-0" />
                  <span>
                    <strong>Vínculo Obrigatório ao Profissional:</strong> Todas as consultas serão associadas diretamente ao ID do respectivo profissional de saúde (<code className="font-mono bg-white px-1 py-0.5 rounded border border-indigo-200 text-indigo-800">usuario_id</code>). Profissionais não cadastrados serão auto-criados para preservar 100% dos dados.
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Amostragem dos Dados Mapeados (Primeiros 5 Registros)
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">Verifique os vínculos antes de prosseguir</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Linha</th>
                        <th className="p-2.5">Aluno</th>
                        <th className="p-2.5">CPF</th>
                        <th className="p-2.5">Nascimento</th>
                        <th className="p-2.5">Especialidade</th>
                        <th className="p-2.5">Profissional</th>
                        <th className="p-2.5">Situação</th>
                        <th className="p-2.5">Instituição</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {diagnostico.linhasValidas.slice(0, 5).map((linha) => (
                        <tr key={linha.linhaOriginal} className="hover:bg-slate-50/80">
                          <td className="p-2.5 font-mono text-[11px] text-slate-400">#{linha.linhaOriginal}</td>
                          <td className="p-2.5 font-bold text-slate-900">{linha.pacienteNome}</td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-600">
                            {linha.pacienteCpf ? formatarCpf(linha.pacienteCpf) : <span className="text-slate-400 italic">Sem CPF</span>}
                          </td>
                          <td className="p-2.5 text-slate-600">{linha.dataNascimento || '-'}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                              {linha.especialidade}
                            </span>
                          </td>
                          <td className="p-2.5 font-medium">
                            <span className="inline-flex items-center gap-1.5 text-slate-800 font-semibold">
                              <Stethoscope className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              {linha.profissionalNome}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {linha.situacao}
                            </span>
                          </td>
                          <td className="p-2.5 font-medium">
                            <span className={`inline-flex items-center gap-1 ${linha.escolaEncontrada ? 'text-slate-900' : 'text-amber-700 font-bold'}`}>
                              {linha.instituicaoNome}
                              {!linha.escolaEncontrada && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Opções de Carga */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  Configurações de Processamento em Lote
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Tamanho do Lote (Chunk)
                    </label>
                    <select
                      value={tamanhoLote}
                      onChange={(e) => setTamanhoLote(Number(e.target.value))}
                      className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={50}>50 linhas por lote (Mais seguro)</option>
                      <option value={100}>100 linhas por lote (Recomendado)</option>
                      <option value={150}>150 linhas por lote (Mais rápido)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Turma Padrão para Novos Alunos
                    </label>
                    <input
                      type="text"
                      value={turmaPadrao}
                      onChange={(e) => setTurmaPadrao(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Geral ou Não Informada"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Turno Padrão da Consulta
                    </label>
                    <select
                      value={turnoPadrao}
                      onChange={(e) => setTurnoPadrao(e.target.value as 'MANHA' | 'TARDE')}
                      className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="MANHA">Manhã</option>
                      <option value="TARDE">Tarde</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCriarProfissionais}
                      onChange={(e) => setAutoCriarProfissionais(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-700 font-medium">
                      Auto-provisionar profissionais de saúde que ainda não existam no sistema para manter 100% das consultas vinculadas
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ──── ETAPA 3: Execução em Tempo Real (Chunking) ───────────────── */}
          {etapa === 'importing' && (
            <div className="space-y-6">
              {/* Barra de Progresso Principal */}
              <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl shadow-lg border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className={`w-5 h-5 text-blue-400 ${pausado ? '' : 'animate-spin'}`} />
                    <span className="text-sm font-black tracking-tight">
                      {pausado ? 'Importação Pausada' : `Processando Lote ${loteAtual} de ${totalLotes}...`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {tempoEstimadoSegundos !== null && (
                      <span className="text-xs font-mono text-indigo-300 bg-indigo-900/60 px-2.5 py-1 rounded-full border border-indigo-700/50">
                        Tempo estimado: ~{tempoEstimadoSegundos}s
                      </span>
                    )}
                    <span className="text-lg font-black text-emerald-400">{progressoPercentual}%</span>
                  </div>
                </div>

                {/* Barra de Progresso Animada */}
                <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${progressoPercentual}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                </div>

                {/* Painel de Métricas Vivas */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800/80 text-center">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Processados</div>
                    <div className="text-base font-black text-white">{metricas.processados.toLocaleString('pt-BR')}</div>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg">
                    <div className="text-[10px] text-emerald-400 uppercase font-bold">Consultas</div>
                    <div className="text-base font-black text-emerald-400">{metricas.consultasCriadas.toLocaleString('pt-BR')}</div>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg">
                    <div className="text-[10px] text-blue-400 uppercase font-bold">Novos Alunos</div>
                    <div className="text-base font-black text-blue-400">{metricas.alunosCriados.toLocaleString('pt-BR')}</div>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg">
                    <div className="text-[10px] text-purple-400 uppercase font-bold">Alunos Vinculados</div>
                    <div className="text-base font-black text-purple-400">{metricas.alunosReaproveitados.toLocaleString('pt-BR')}</div>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg">
                    <div className="text-[10px] text-rose-400 uppercase font-bold">Erros / Avisos</div>
                    <div className="text-base font-black text-rose-400">{metricas.falhas}</div>
                  </div>
                </div>
              </div>

              {/* Console de Eventos em Tempo Real */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                    Log de Execução em Tempo Real
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Stream ativo</span>
                </div>
                <div className="bg-slate-950 text-slate-200 font-mono text-[11px] p-3 rounded-xl h-44 overflow-y-auto border border-slate-800 space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                      <span
                        className={
                          log.tipo === 'sucesso'
                            ? 'text-emerald-400'
                            : log.tipo === 'erro'
                            ? 'text-rose-400 font-bold'
                            : log.tipo === 'aviso'
                            ? 'text-amber-400'
                            : 'text-slate-300'
                        }
                      >
                        {log.mensagem}
                      </span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>

              {/* Ações de Controle */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={alternarPausa}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  {pausado ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4 text-amber-600" />}
                  {pausado ? 'Continuar' : 'Pausar'}
                </button>
                <button
                  type="button"
                  onClick={cancelarImportacao}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 rounded-lg hover:bg-rose-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  Cancelar Importação
                </button>
              </div>
            </div>
          )}

          {/* ──── ETAPA 4: Conclusão ou Rollback ──────────────────────────── */}
          {etapa === 'completed' && (
            <div className="space-y-6 text-center py-4">
              {rollbackExecutado ? (
                <>
                  <div className="inline-flex p-4 bg-rose-100 text-rose-700 rounded-full mb-2 shadow-2xs">
                    <AlertTriangle className="w-12 h-12" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-rose-600 tracking-tight">
                      Importação Cancelada e Revertida (Rollback Atômico)
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 max-w-md mx-auto leading-relaxed">
                      Como ocorreu uma falha ou cancelamento, <strong>todas as consultas, novos alunos e profissionais criados nesta sessão foram imediatamente excluídos</strong> do banco de dados. Nenhum dado parcial foi gravado.
                    </p>
                    {motivoRollback && (
                      <div className="mt-3 p-3 bg-rose-50/80 border border-rose-200 rounded-xl max-w-lg mx-auto text-xs text-rose-900 font-medium text-left">
                        <span className="font-bold">Motivo do cancelamento:</span> {motivoRollback}
                      </div>
                    )}
                    {detalhesFalhas.length > 0 && (
                      <div className="mt-3 max-w-lg mx-auto p-3 bg-rose-50/50 border border-rose-200 rounded-xl text-left text-xs text-rose-800 space-y-1 max-h-36 overflow-y-auto">
                        <div className="font-bold mb-1">Linha(s) com erro que dispararam a reversão:</div>
                        {detalhesFalhas.slice(0, 5).map((f, idx) => (
                          <div key={idx} className="flex gap-2">
                            <span className="font-semibold text-rose-900">Linha {f.linha}:</span>
                            <span>{f.erro}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="inline-flex p-4 bg-emerald-100 text-emerald-700 rounded-full mb-2 shadow-2xs">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      Importação em Lote Concluída com Sucesso!
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                      Todos os registros da planilha foram processados, alunos cadastrados com criptografia LGPD e consultas vinculadas às instituições e profissionais.
                    </p>
                  </div>

                  {/* Grid com Balanço Final */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
                    <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="text-[10px] font-black uppercase text-emerald-700">Consultas Criadas</div>
                      <div className="text-2xl font-black text-emerald-950 mt-1">
                        {metricas.consultasCriadas.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-[10px] text-emerald-700 mt-0.5">registros no banco</div>
                    </div>

                    <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="text-[10px] font-black uppercase text-blue-700">Novos Alunos</div>
                      <div className="text-2xl font-black text-blue-950 mt-1">
                        {metricas.alunosCriados.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-[10px] text-blue-700 mt-0.5">cadastrados com PII cifrada</div>
                    </div>

                    <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="text-[10px] font-black uppercase text-purple-700">Alunos Vinculados</div>
                      <div className="text-2xl font-black text-purple-950 mt-1">
                        {metricas.alunosReaproveitados.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-[10px] text-purple-700 mt-0.5">reaproveitados por CPF</div>
                    </div>

                    <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-200">
                      <div className="text-[10px] font-black uppercase text-indigo-700">Profissionais</div>
                      <div className="text-2xl font-black text-indigo-950 mt-1">
                        {metricas.profissionaisCriados}
                      </div>
                      <div className="text-[10px] text-indigo-700 mt-0.5">auto-provisionados</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Rodapé com Ações ────────────────────────────────────────────── */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {etapa === 'upload' && 'Selecione a planilha para iniciar'}
            {etapa === 'preview' && `${diagnostico?.linhasValidas.length || 0} consultas identificadas`}
            {etapa === 'importing' && (executandoRollback ? 'Cancelando e excluindo dados...' : `Lote ${loteAtual} de ${totalLotes} em execução`)}
            {etapa === 'completed' && (rollbackExecutado ? 'Sessão revertida com sucesso' : 'Dados sincronizados com o banco')}
          </div>

          <div className="flex items-center gap-2">
            {etapa === 'preview' && (
              <>
                <Botao
                  variante="secundario"
                  onClick={() => {
                    setEtapa('upload');
                    setDiagnostico(null);
                  }}
                >
                  Voltar
                </Botao>
                <button
                  type="button"
                  onClick={iniciarImportacaoEmLote}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Iniciar Importação em Lote ({diagnostico?.linhasValidas.length || 0} Consultas)
                </button>
              </>
            )}

            {etapa === 'completed' && (
              rollbackExecutado ? (
                <>
                  <Botao
                    variante="secundario"
                    onClick={() => {
                      setEtapa('upload');
                      setDiagnostico(null);
                      setRollbackExecutado(false);
                      setMotivoRollback('');
                    }}
                  >
                    Tentar Novamente
                  </Botao>
                  <button
                    type="button"
                    onClick={aoFechar}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all cursor-pointer"
                  >
                    Fechar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={aoFechar}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all cursor-pointer"
                >
                  Concluir e Ver Resultados
                </button>
              )
            )}

            {etapa === 'upload' && (
              <Botao variante="secundario" onClick={aoFechar}>
                Fechar
              </Botao>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

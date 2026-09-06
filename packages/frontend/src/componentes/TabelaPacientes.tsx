import { type FC, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  useFiltroExcel,
  CabecalhoColunaExcel,
  BarraFiltrosAtivos,
  type ConfiguracaoColuna,
} from './tabelaExcel/index.ts';
import { obterEstiloAvatarGoogle } from '../utilitarios/avatarCor.ts';
import { Paginacao } from './Paginacao.tsx';

import { ModalValidacaoCatraki } from './ModalValidacaoCatraki.tsx';
import { CardHoverPaciente } from './CardHoverPaciente.tsx';

export interface ItemPaciente {
  id: string;
  nome: string;
  cpf?: string;
  dataNascimento: string;
  sexo?: string;
  escolaNome: string;
  termoConsentimentoStatus: 'ACEITO' | 'DISPENSADO' | 'PENDENTE';
  atendimentosCount: number;
  criadoEm: string;
  codigoValidacaoCatraki?: string;
  assinadoEmCatraki?: string;
  perfil?: string;
  turma?: string;
  telefone?: string;
  responsavelNome?: string;
}

export function calcularIdade(dataNascimento: string): number {
  if (!dataNascimento) return 0;
  const hoje = new Date();
  let ano = 0, mes = 0, dia = 0;
  if (/^\d{4}-\d{2}-\d{2}/.test(dataNascimento)) {
    const partes = dataNascimento.substring(0, 10).split('-');
    ano = parseInt(partes[0], 10);
    mes = parseInt(partes[1], 10) - 1;
    dia = parseInt(partes[2], 10);
  } else {
    const d = new Date(dataNascimento);
    if (isNaN(d.getTime())) return 0;
    ano = d.getFullYear();
    mes = d.getMonth();
    dia = d.getDate();
  }
  let idade = hoje.getFullYear() - ano;
  const m = hoje.getMonth() - mes;
  if (m < 0 || (m === 0 && hoje.getDate() < dia)) {
    idade--;
  }
  return Math.max(0, idade);
}

export function formatarSubtituloPaciente(paciente: ItemPaciente): string {
  const idade = calcularIdade(paciente.dataNascimento);
  const sexo = (paciente.sexo || '').trim().toUpperCase();
  const sexoRotulo =
    sexo.startsWith('F') || sexo === 'FEMININO'
      ? 'Feminino'
      : sexo.startsWith('M') || sexo === 'MASCULINO'
      ? 'Masculino'
      : paciente.sexo || '';

  if (idade > 0 && sexoRotulo) {
    return `${idade} anos • ${sexoRotulo}`;
  }
  if (idade > 0) {
    return `${idade} anos`;
  }
  if (sexoRotulo) {
    return sexoRotulo;
  }
  return 'Estudante';
}

export function formatarDataBR(dataStr: string | null | undefined): string {
  if (!dataStr) return 'Não informado';
  if (/^\d{4}-\d{2}-\d{2}/.test(dataStr)) {
    const [ano, mes, dia] = dataStr.substring(0, 10).split('-');
    return `${dia}/${mes}/${ano}`;
  }
  const d = new Date(dataStr);
  if (isNaN(d.getTime())) return dataStr;
  return d.toLocaleDateString('pt-BR');
}

interface TabelaPacientesProps {
  pacientes: ItemPaciente[];
  carregando: boolean;
  aoNovoPaciente: () => void;
  aoIniciarAtendimento: (paciente: ItemPaciente) => void;
  aoVerDetalhes: (paciente: ItemPaciente) => void;
  aoEditarPaciente?: (paciente: ItemPaciente) => void;
  aoExcluirPaciente?: (paciente: ItemPaciente) => void;
  ehAdminGeral?: boolean;
}

export const TabelaPacientes: FC<TabelaPacientesProps> = ({
  pacientes,
  carregando,
  aoNovoPaciente,
  aoIniciarAtendimento,
  aoVerDetalhes,
  aoEditarPaciente,
  aoExcluirPaciente,
  ehAdminGeral = true,
}) => {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const [menuAcoesAbertoId, setMenuAcoesAbertoId] = useState<string | null>(null);
  const [pacienteConfirmarExclusao, setPacienteConfirmarExclusao] = useState<ItemPaciente | null>(null);
  const [pacienteParaComprovante, setPacienteParaComprovante] = useState<ItemPaciente | null>(null);

  // Configuração das colunas para o Sistema Excel
  const colunasConfig = useMemo<ConfiguracaoColuna<ItemPaciente>[]>(
    () => [
      {
        id: 'nome',
        rotulo: 'PACIENTE',
        tipo: 'texto',
        obterValor: (p) => p.nome,
      },
      {
        id: 'termoConsentimentoStatus',
        rotulo: 'AUTORIZAÇÃO',
        tipo: 'opcao',
        obterValor: (p) => p.termoConsentimentoStatus,
        formatarRotulo: (val) => {
          if (val === 'ACEITO') return 'Autorizado';
          if (val === 'DISPENSADO') return 'Emergência Legal';
          return 'Não Autorizado';
        },
      },
      {
        id: 'escolaNome',
        rotulo: 'INSTITUIÇÃO',
        tipo: 'texto',
        obterValor: (p) => p.escolaNome,
      },
      {
        id: 'cpf',
        rotulo: 'CPF',
        tipo: 'texto',
        obterValor: (p) => p.cpf || '',
        formatarRotulo: (val) => (val ? String(val) : '(Não informado)'),
      },
      {
        id: 'dataNascimento',
        rotulo: 'NASCIMENTO',
        tipo: 'data',
        obterValor: (p) => p.dataNascimento,
        formatarRotulo: (val) => formatarDataBR(val),
      },
      {
        id: 'acoes',
        rotulo: 'AÇÕES',
        desabilitarFiltro: true,
        desabilitarOrdenacao: true,
      },
    ],
    []
  );

  const filtroExcel = useFiltroExcel<ItemPaciente>({
    dados: pacientes,
    colunas: colunasConfig,
  });

  const { dadosFiltrados, temAlgumFiltroAtivo } = filtroExcel;

  // Paginação
  const totalPaginas = Math.max(1, Math.ceil(dadosFiltrados.length / itensPorPagina));
  const paginaCorrigida = Math.min(paginaAtual, totalPaginas);
  const indiceInicio = (paginaCorrigida - 1) * itensPorPagina;
  const dadosPaginados = dadosFiltrados.slice(indiceInicio, indiceInicio + itensPorPagina);

  return (
    <div className="flex flex-col gap-4 flex-1">
      {/* ─── Tabela Principal Estilo Enterprise ───────────────────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col flex-1 min-h-[460px]">
        {/* ─── Barra de Filtros Ativos Estilo Excel ─────────────────────────── */}
        <BarraFiltrosAtivos estado={filtroExcel} entidadeNome="paciente(s)" />

        {/* ─── Tabela de Registros ────────────────────────────────────────── */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider select-none" style={{ color: '#034b7f' }}>
                <CabecalhoColunaExcel
                  colunaId="nome"
                  rotulo="PACIENTE"
                  estado={filtroExcel}
                  className="px-4.5 py-3.5"
                />
                <CabecalhoColunaExcel
                  colunaId="termoConsentimentoStatus"
                  rotulo="AUTORIZAÇÃO"
                  estado={filtroExcel}
                  className="px-3.5 py-3.5"
                />
                <CabecalhoColunaExcel
                  colunaId="escolaNome"
                  rotulo="INSTITUIÇÃO"
                  estado={filtroExcel}
                  className="px-3.5 py-3.5"
                />
                <CabecalhoColunaExcel
                  colunaId="cpf"
                  rotulo="CPF"
                  estado={filtroExcel}
                  className="px-3.5 py-3.5"
                />
                <CabecalhoColunaExcel
                  colunaId="dataNascimento"
                  rotulo="NASCIMENTO"
                  estado={filtroExcel}
                  className="px-3.5 py-3.5"
                />
                <th scope="col" className="py-3.5 px-4 font-semibold text-right text-[11px] tracking-wider" style={{ color: '#034b7f' }}>
                  <span>AÇÕES</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {carregando ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="w-7 h-7 animate-spin text-slate-600" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-xs font-medium text-slate-500">Carregando pacientes...</span>
                    </div>
                  </td>
                </tr>
              ) : dadosFiltrados.length === 0 ? (
                /* ─── Empty State ───── */
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto px-4">
                      <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3 ring-8 ring-slate-100/60 shadow-xs">
                        <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="8.5" cy="7" r="4" />
                          <line x1="20" y1="8" x2="20" y2="14" />
                          <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                      </div>

                      <h3 className="text-base font-bold text-slate-800 mb-1">
                        {temAlgumFiltroAtivo ? 'Nenhum paciente corresponde aos filtros aplicados' : 'Nenhum paciente encontrado'}
                      </h3>

                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        {temAlgumFiltroAtivo
                          ? 'Os filtros aplicados nas colunas ocultaram todos os resultados. Experimente limpar os filtros das colunas.'
                          : 'Não encontramos pacientes cadastrados no momento.'}
                      </p>

                      {temAlgumFiltroAtivo ? (
                        <button
                          type="button"
                          onClick={() => filtroExcel.limparTodosFiltros()}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="1 4 1 10 7 10" />
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                          </svg>
                          <span>Limpar Filtros das Colunas</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={aoNovoPaciente}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                          style={{ background: 'linear-gradient(135deg, #034b7f 0%, #14438f 100%)', boxShadow: '0 2px 8px rgba(3,75,127,0.25)' }}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <span>Cadastrar Novo Paciente</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                dadosPaginados.map((paciente) => (
                  <tr
                    key={paciente.id}
                    className="transition-colors group border-b border-slate-100 last:border-0"
                    style={{}}
                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'rgba(3,75,127,0.03)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent'; }}
                  >
                    {/* Nome do Paciente (Foto de Perfil com cor dinâmica + Nome escuro + Subtítulo + Hover Card) */}
                    <td className="py-3 px-4.5 font-semibold text-slate-900">
                      <CardHoverPaciente
                        paciente={paciente}
                        aoVerDetalhes={aoVerDetalhes}
                        aoIniciarAtendimento={aoIniciarAtendimento}
                      >
                        <div className="flex items-center gap-3">
                          {(() => {
                            const estilo = obterEstiloAvatarGoogle(paciente.nome);
                            return (
                              <div
                                style={estilo.style}
                                className="w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs select-none ring-2 ring-white"
                              >
                                {paciente.nome.charAt(0).toUpperCase()}
                              </div>
                            );
                          })()}
                          <div className="flex flex-col text-left">
                            <span className="font-medium text-slate-900 uppercase tracking-tight text-[12.5px]">
                              {paciente.nome}
                            </span>
                            <span className="text-[11px] text-slate-500 font-normal mt-0.5 flex items-center gap-1">
                              {formatarSubtituloPaciente(paciente)}
                            </span>
                          </div>
                        </div>
                      </CardHoverPaciente>
                    </td>

                    {/* Status do Consentimento LGPD */}
                    <td
                      className="py-3 px-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {paciente.termoConsentimentoStatus === 'ACEITO' ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPacienteParaComprovante(paciente);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100/90 shadow-2xs cursor-pointer transition-all active:scale-[0.98]"
                          title="Clique para conferir o comprovante e autenticidade Catraki"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Autorizado
                        </button>
                      ) : paciente.termoConsentimentoStatus === 'DISPENSADO' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border shadow-2xs" style={{ backgroundColor: 'rgba(3,75,127,0.06)', color: '#14438f', borderColor: 'rgba(3,75,127,0.2)' }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#14438f' }} />
                          Emergência Legal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100/90 text-slate-600 border border-slate-200/90 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Não Autorizado
                        </span>
                      )}
                    </td>

                    {/* Escola / Instituição */}
                    <td className="py-3 px-3.5">
                      <div
                        className="flex items-center gap-1.5 text-slate-700 text-[12px] font-medium truncate max-w-[220px]"
                        title={paciente.escolaNome}
                      >
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#74c4d7' }}>
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        <span className="truncate">{paciente.escolaNome}</span>
                      </div>
                    </td>

                    {/* CPF */}
                    <td className="py-3 px-3.5 font-mono text-slate-600 text-[12px]">
                      {paciente.cpf || <span className="text-slate-400 italic font-sans text-[11px]">Não informado</span>}
                    </td>

                    {/* Nascimento */}
                    <td className="py-3 px-3.5 text-slate-600 font-mono text-[12px]">
                      {formatarDataBR(paciente.dataNascimento)}
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 relative" onClick={(e) => e.stopPropagation()}>
                        {/* Botão Histórico / Prontuário */}
                        <button
                          type="button"
                          onClick={() => aoVerDetalhes(paciente)}
                          className="inline-flex items-center justify-between gap-1.5 px-2.5 py-1.5 text-[11px] font-medium bg-white border rounded-xl transition-all active:scale-95 cursor-pointer shadow-2xs min-w-[92px]"
                          style={{ color: '#034b7f', borderColor: '#d0e9f3' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(3,75,127,0.04)'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#74c4d7'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fff'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#d0e9f3'; }}
                          title={`${paciente.atendimentosCount || 0} ${
                            paciente.atendimentosCount === 1 ? 'consulta' : 'consultas'
                          } no histórico`}
                        >
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#034b7f' }}>
                              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Histórico</span>
                          </span>
                          <span
                            className={`ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full border transition-colors ${
                              (paciente.atendimentosCount || 0) > 0
                                ? ''
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}
                            style={(paciente.atendimentosCount || 0) > 0 ? { backgroundColor: 'rgba(3,75,127,0.08)', color: '#034b7f', borderColor: 'rgba(3,75,127,0.2)' } : {}}
                          >
                            {paciente.atendimentosCount || 0}
                          </span>
                        </button>

                        {/* Dropdown de Opções (Substitui os 3 pontinhos) */}
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuAcoesAbertoId(
                                menuAcoesAbertoId === paciente.id ? null : paciente.id
                              );
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-xl border transition-all cursor-pointer shadow-2xs ${
                              menuAcoesAbertoId === paciente.id
                                ? 'bg-slate-100 border-slate-300 text-slate-900'
                                : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700 hover:border-slate-300'
                            }`}
                            title="Mais opções do paciente"
                          >
                            <span>Opções</span>
                            <svg
                              className={`w-3 h-3 text-slate-400 transition-transform ${
                                menuAcoesAbertoId === paciente.id ? 'rotate-180 text-slate-700' : ''
                              }`}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>

                          {menuAcoesAbertoId === paciente.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuAcoesAbertoId(null);
                                }}
                              />
                              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200/95 rounded-2xl shadow-xl z-50 py-1.5 text-left text-xs animate-dropdown origin-top-right ring-1 ring-black/5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMenuAcoesAbertoId(null);
                                    aoIniciarAtendimento(paciente);
                                  }}
                                  className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#034b7f' }}>
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                  </svg>
                                  <span>Novo Atendimento</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMenuAcoesAbertoId(null);
                                    if (aoEditarPaciente) aoEditarPaciente(paciente);
                                  }}
                                  className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                  <span>Editar Paciente</span>
                                </button>
                                {paciente.termoConsentimentoStatus === 'ACEITO' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMenuAcoesAbertoId(null);
                                      setPacienteParaComprovante(paciente);
                                    }}
                                    className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                                  >
                                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                      <path d="m9 12 2 2 4-4" />
                                    </svg>
                                    <span>Comprovante Catraki</span>
                                  </button>
                                )}

                                {/* Opção Excluir Paciente — Apenas para Administrador Geral */}
                                {ehAdminGeral && (
                                  <>
                                    <div className="h-px bg-slate-100 my-1" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setMenuAcoesAbertoId(null);
                                        setPacienteConfirmarExclusao(paciente);
                                      }}
                                      className="w-full px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 cursor-pointer font-medium transition-colors"
                                    >
                                      <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        <line x1="10" y1="11" x2="10" y2="17" />
                                        <line x1="14" y1="11" x2="14" y2="17" />
                                      </svg>
                                      <span>Excluir Paciente</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Rodapé & Paginação da Tabela ─────────────────────────────────── */}
        <div className="py-2 px-4 border-t border-slate-200/90 bg-slate-50/40">
          <Paginacao
            paginaAtual={paginaCorrigida}
            totalPaginas={totalPaginas}
            totalRegistros={dadosFiltrados.length}
            aoMudarPagina={(novaPagina) => setPaginaAtual(novaPagina)}
          />
        </div>
      </div>

      {/* ─── Modal de Confirmação de Exclusão (Admin Geral) ────────────────── */}
      {pacienteConfirmarExclusao &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px] font-sans animate-fade-in"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-modal">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100 shadow-2xs">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Excluir Cadastro de Paciente</h3>
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Ação Restrita a Administradores</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Tem certeza que deseja remover o estudante <strong>{pacienteConfirmarExclusao.nome}</strong> (CPF: {pacienteConfirmarExclusao.cpf || 'Não informado'})?
                Esta ação excluirá o prontuário e o histórico da base ativa.
              </p>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPacienteConfirmarExclusao(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer shadow-2xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const p = pacienteConfirmarExclusao;
                    setPacienteConfirmarExclusao(null);
                    if (aoExcluirPaciente) aoExcluirPaciente(p);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-2xl shadow-xs transition-all cursor-pointer"
                >
                  Excluir Paciente
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ─── Modal de Validação / Comprovante Catraki ──────────────────────── */}
      <ModalValidacaoCatraki
        aberto={Boolean(pacienteParaComprovante)}
        paciente={pacienteParaComprovante}
        aoFechar={() => setPacienteParaComprovante(null)}
      />
    </div>
  );
};


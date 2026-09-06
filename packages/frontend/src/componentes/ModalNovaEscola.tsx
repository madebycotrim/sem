import { type FC, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { requisicaoApi } from '../servicos/api.ts';
import { criarEscolaSchema } from '../../compartilhado/index.js';

export interface ModalNovaEscolaProps { aberto: boolean; aoFechar: () => void; aoSucesso: () => void; }
type FormNovaEscola = z.input<typeof criarEscolaSchema>;
interface EmpresaBrasilApi { razao_social?: string; nome_fantasia?: string | null; descricao_tipo_de_logradouro?: string; logradouro?: string; numero?: string; complemento?: string; bairro?: string; municipio?: string | null; uf?: string; email?: string | null; ddd_telefone_1?: string; }

const somenteDigitos = (valor: string) => valor.replace(/\D/g, '').slice(0, 14);
const formatarCnpj = (valor: string) => valor.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2}\.\d{3})(\d)/, '$1.$2').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');

export const ModalNovaEscola: FC<ModalNovaEscolaProps> = ({ aberto, aoFechar, aoSucesso }) => {
  const [cnpjExibicao, setCnpjExibicao] = useState('');
  const [consultandoCnpj, setConsultandoCnpj] = useState(false);
  const [erroCnpj, setErroCnpj] = useState<string | null>(null);
  const [cnpjConsultado, setCnpjConsultado] = useState('');
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormNovaEscola>({ resolver: zodResolver(criarEscolaSchema), defaultValues: { alunosMatriculados: 0 } });

  useEffect(() => {
    if (!aberto) return;
    reset({ alunosMatriculados: 0 });
    setCnpjExibicao(''); setErroCnpj(null); setCnpjConsultado('');
  }, [aberto, reset]);
  useEffect(() => {
    const aoPressionarTecla = (evento: KeyboardEvent) => { if (evento.key === 'Escape') aoFechar(); };
    window.addEventListener('keydown', aoPressionarTecla);
    return () => window.removeEventListener('keydown', aoPressionarTecla);
  }, [aoFechar]);

  const consultarCnpj = async () => {
    const cnpj = somenteDigitos(cnpjExibicao);
    if (cnpj.length !== 14 || cnpj === cnpjConsultado || consultandoCnpj) return;
    setConsultandoCnpj(true); setErroCnpj(null);
    try {
      const resposta = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (!resposta.ok) throw new Error(resposta.status === 404 ? 'CNPJ não encontrado.' : 'Não foi possível consultar este CNPJ.');
      const empresa = await resposta.json() as EmpresaBrasilApi;
      const endereco = [[empresa.descricao_tipo_de_logradouro, empresa.logradouro].filter(Boolean).join(' '), empresa.numero, empresa.complemento, empresa.bairro].filter(Boolean).join(', ');
      setValue('nome', empresa.nome_fantasia || empresa.razao_social || '', { shouldValidate: true });
      setValue('endereco', endereco, { shouldValidate: true });
      setValue('cidade', empresa.municipio || '', { shouldValidate: true });
      setValue('uf', empresa.uf || '', { shouldValidate: true });
      setValue('telefone', empresa.ddd_telefone_1 || '', { shouldValidate: true });
      setValue('email', empresa.email || '', { shouldValidate: true });
      setValue('cnpj', cnpj, { shouldValidate: true }); setCnpjConsultado(cnpj);
    } catch (erro) {
      setCnpjConsultado(cnpj); setErroCnpj(erro instanceof Error ? erro.message : 'Falha ao consultar CNPJ.');
    } finally { setConsultandoCnpj(false); }
  };
  const onSubmit = async (dados: FormNovaEscola) => {
    try { await requisicaoApi('/escolas', { metodo: 'POST', corpo: dados }); aoSucesso(); aoFechar(); }
    catch (erro) { setErroCnpj(erro instanceof Error ? erro.message : 'Não foi possível cadastrar a instituição.'); }
  };
  if (!aberto) return null;
  const estiloInput = 'w-full h-9 px-3 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none transition focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400';

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 bg-slate-950/35 backdrop-blur-[1px]" role="dialog" aria-modal="true" aria-labelledby="titulo-nova-instituicao">
      <div className="w-full max-w-[672px] rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between px-6 pt-6 pb-4"><div><h2 id="titulo-nova-instituicao" className="text-[23px] leading-7 font-bold tracking-tight text-slate-800">Nova Instituição</h2><p className="mt-1 text-[13px] font-medium text-slate-500">Preencha os dados abaixo para cadastrar ou atualizar a instituição.</p></div><button type="button" onClick={aoFechar} aria-label="Fechar" className="p-1 text-slate-400 hover:text-slate-700 rounded-md">×</button></div>
        <form id="form-escola" onSubmit={handleSubmit(onSubmit)} className="px-6 pb-5 space-y-5">
          <section><h3 className="pb-2 text-[13px] font-bold tracking-wide text-blue-600 uppercase border-b border-slate-200">Dados principais</h3><div className="grid grid-cols-[1fr_180px] gap-5 mt-5">
            <Campo rotulo="Nome da instituição" obrigatorio erro={errors.nome?.message}><input {...register('nome')} className={estiloInput} placeholder="EX: CLÍNICA MUNICIPAL DE SAÚDE" /></Campo>
            <Campo rotulo="CNPJ" erro={erroCnpj ?? undefined}><div className="relative"><input value={cnpjExibicao} onChange={(evento) => { const cnpj = somenteDigitos(evento.target.value); setCnpjExibicao(formatarCnpj(cnpj)); setValue('cnpj', cnpj, { shouldValidate: false }); setErroCnpj(null); if (cnpj !== cnpjConsultado) setCnpjConsultado(''); }} onBlur={consultarCnpj} inputMode="numeric" maxLength={18} className={`${estiloInput} pr-8`} placeholder="00.000.000/0000-00" />{consultandoCnpj && <span className="absolute right-2.5 top-2.5 h-4 w-4 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />}</div></Campo>
          </div></section>
          <section><h3 className="pb-2 text-[13px] font-bold tracking-wide text-blue-600 uppercase border-b border-slate-200">Endereço e contato</h3><div className="mt-5 space-y-4">
            <Campo rotulo="Endereço completo" obrigatorio erro={errors.endereco?.message}><input {...register('endereco')} className={estiloInput} /></Campo>
            <div className="grid grid-cols-[2fr_1fr] gap-5"><Campo rotulo="Cidade" obrigatorio erro={errors.cidade?.message}><input {...register('cidade')} className={estiloInput} /></Campo><Campo rotulo="Estado" obrigatorio erro={errors.uf?.message}><input {...register('uf')} maxLength={2} className={`${estiloInput} uppercase`} /></Campo></div>
            <div className="grid grid-cols-2 gap-5"><Campo rotulo="Telefone" erro={errors.telefone?.message}><input {...register('telefone')} className={estiloInput} inputMode="tel" /></Campo><Campo rotulo="E-mail" erro={errors.email?.message}><input {...register('email')} className={estiloInput} type="email" /></Campo></div>
          </div></section>
        </form>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100"><button type="button" onClick={aoFechar} className="h-10 px-5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Cancelar</button><button type="submit" form="form-escola" disabled={isSubmitting} className="h-10 px-6 text-xs font-bold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50">{isSubmitting ? 'Criando...' : 'Criar'}</button></div>
      </div>
    </div>, document.body
  );
};

function Campo({ rotulo, obrigatorio = false, erro, children }: { rotulo: string; obrigatorio?: boolean; erro?: string; children: ReactNode }) {
  return <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-600">{rotulo} {obrigatorio && <span className="text-red-500">*</span>}<div className="mt-2">{children}</div>{erro && <span className="block mt-1 text-[10px] normal-case tracking-normal font-medium text-red-600">{erro}</span>}</label>;
}

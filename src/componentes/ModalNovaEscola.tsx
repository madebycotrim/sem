import { type FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { requisicaoApi } from '../servicos/api.ts';
import { criarEscolaSchema } from '../../compartilhado/index.js';
import type { EscolaPolo } from './Escolas.tsx';
import {
  Modal,
  ModalCampo,
  ModalSecao,
  BotaoModal,
  ESTILO_INPUT_MODAL,
} from './Modal.tsx';
import { Building2, LoaderCircle } from 'lucide-react';

export interface ModalNovaEscolaProps {
  aberto: boolean;
  escolaParaEditar?: EscolaPolo | null;
  aoFechar: () => void;
  aoSucesso: () => void;
}

type FormNovaEscola = z.input<typeof criarEscolaSchema>;

interface EmpresaBrasilApi {
  razao_social?: string;
  nome_fantasia?: string | null;
  descricao_tipo_de_logradouro?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string | null;
  uf?: string;
}

const somenteDigitos = (valor: string) => valor.replace(/\D/g, '').slice(0, 14);
const formatarCnpj = (valor: string) =>
  valor
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2}\.\d{3})(\d)/, '$1.$2')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');

export const ModalNovaEscola: FC<ModalNovaEscolaProps> = ({
  aberto,
  escolaParaEditar,
  aoFechar,
  aoSucesso,
}) => {
  const [cnpjExibicao, setCnpjExibicao] = useState('');
  const [consultandoCnpj, setConsultandoCnpj] = useState(false);
  const [erroCnpj, setErroCnpj] = useState<string | null>(null);
  const [cnpjConsultado, setCnpjConsultado] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormNovaEscola>({
    resolver: zodResolver(criarEscolaSchema),
    defaultValues: { alunosMatriculados: 0, nome: '', cnpj: '', endereco: '', cidade: '', uf: '' },
  });

  const nomeAtual = watch('nome');
  const enderecoAtual = watch('endereco');
  const cidadeAtual = watch('cidade');
  const ufAtual = watch('uf');

  const temDadosPreenchidos =
    isDirty ||
    !!cnpjExibicao ||
    !!(nomeAtual && nomeAtual.trim()) ||
    !!(enderecoAtual && enderecoAtual.trim()) ||
    !!(cidadeAtual && cidadeAtual.trim()) ||
    !!(ufAtual && ufAtual.trim());

  const resetarFormulario = () => {
    reset({ alunosMatriculados: 0, nome: '', cnpj: '', endereco: '', cidade: '', uf: '' });
    setCnpjExibicao('');
    setErroCnpj(null);
    setCnpjConsultado('');
  };

  useEffect(() => {
    if (aberto) {
      if (escolaParaEditar) {
        const partesRegiao = escolaParaEditar.regiao ? escolaParaEditar.regiao.split(' / ') : [];
        const cidade = partesRegiao[0] || '';
        const uf = partesRegiao[1] || '';
        const cnpjLimpo = escolaParaEditar.cnpj ? somenteDigitos(escolaParaEditar.cnpj) : '';
        const cnpjFormatado = cnpjLimpo ? formatarCnpj(cnpjLimpo) : '';

        setCnpjExibicao(cnpjFormatado);
        reset({
          nome: escolaParaEditar.nome,
          cnpj: cnpjLimpo,
          endereco: escolaParaEditar.endereco,
          cidade,
          uf,
          alunosMatriculados: escolaParaEditar.alunosMatriculados || 0,
        });

        if (!escolaParaEditar.cnpj && escolaParaEditar.id) {
          requisicaoApi<{ dados: { cnpj?: string } }>(`/escolas/${escolaParaEditar.id}`)
            .then((res) => {
              if (res?.dados?.cnpj) {
                const cnpjBuscado = somenteDigitos(res.dados.cnpj);
                const cnpjFormatadoBuscado = formatarCnpj(cnpjBuscado);
                setCnpjExibicao(cnpjFormatadoBuscado);
                setValue('cnpj', cnpjBuscado, { shouldValidate: true });
              }
            })
            .catch(() => {});
        }
      } else {
        resetarFormulario();
      }
    } else {
      resetarFormulario();
    }
  }, [aberto, escolaParaEditar]);

  const consultarCnpj = async () => {
    const cnpj = somenteDigitos(cnpjExibicao);
    if (cnpj.length !== 14 || cnpj === cnpjConsultado || consultandoCnpj) return;
    setConsultandoCnpj(true);
    setErroCnpj(null);

    try {
      const resposta = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (!resposta.ok) {
        throw new Error(
          resposta.status === 404
            ? 'CNPJ não encontrado.'
            : 'Não foi possível consultar este CNPJ.'
        );
      }
      const empresa = (await resposta.json()) as EmpresaBrasilApi;
      const endereco = [
        [empresa.descricao_tipo_de_logradouro, empresa.logradouro].filter(Boolean).join(' '),
        empresa.numero,
        empresa.complemento,
        empresa.bairro,
      ]
        .filter(Boolean)
        .join(', ');

      setValue('nome', empresa.nome_fantasia || empresa.razao_social || '', { shouldValidate: true });
      setValue('endereco', endereco, { shouldValidate: true });
      setValue('cidade', empresa.municipio || '', { shouldValidate: true });
      setValue('uf', empresa.uf || '', { shouldValidate: true });
      setValue('cnpj', cnpj, { shouldValidate: true });
      setCnpjConsultado(cnpj);
    } catch (erro) {
      setCnpjConsultado(cnpj);
      setErroCnpj(erro instanceof Error ? erro.message : 'Falha ao consultar CNPJ.');
    } finally {
      setConsultandoCnpj(false);
    }
  };

  const onSubmit = async (dados: FormNovaEscola) => {
    try {
      if (escolaParaEditar) {
        await requisicaoApi(`/escolas/${escolaParaEditar.id}`, { metodo: 'PUT', corpo: dados });
      } else {
        await requisicaoApi('/escolas', { metodo: 'POST', corpo: dados });
      }
      resetarFormulario();
      aoSucesso();
      aoFechar();
    } catch (erro) {
      setErroCnpj(erro instanceof Error ? erro.message : 'Não foi possível salvar a instituição.');
    }
  };

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      aoResetar={resetarFormulario}
      temDadosPreenchidos={temDadosPreenchidos}
      titulo={escolaParaEditar ? "Editar Instituição" : "Nova Instituição"}
      subtitulo={escolaParaEditar ? "Altere os dados da instituição conforme necessário" : "Preencha os dados abaixo para cadastrar um novo polo ou instituição"}
      tamanho="xl"
      icone={
        <Building2 className="w-5 h-5" />
      }
      rodape={
        <>
          <BotaoModal
            variante="secundario"
            rotulo="Cancelar"
            aoClicar={aoFechar}
          />
          <BotaoModal
            tipo="submit"
            formId="form-escola"
            variante="primario"
            rotulo={escolaParaEditar ? "Salvar Alterações" : "Salvar Instituição"}
            carregando={isSubmitting}
          />
        </>
      }
    >
      <form id="form-escola" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Dados Principais */}
        <ModalSecao titulo="Dados principais">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-5">
            <ModalCampo rotulo="Nome da instituição" obrigatorio erro={errors.nome?.message}>
              <input
                {...register('nome')}
                className={ESTILO_INPUT_MODAL}
                placeholder="Ex: CEF 01 DE BRASÍLIA"
              />
            </ModalCampo>

            <ModalCampo rotulo="CNPJ" erro={erroCnpj ?? undefined}>
              <div className="relative">
                <input
                  value={cnpjExibicao}
                  onChange={(evento) => {
                    const cnpj = somenteDigitos(evento.target.value);
                    setCnpjExibicao(formatarCnpj(cnpj));
                    setValue('cnpj', cnpj, { shouldValidate: false });
                    setErroCnpj(null);
                    if (cnpj !== cnpjConsultado) setCnpjConsultado('');
                  }}
                  onBlur={consultarCnpj}
                  inputMode="numeric"
                  maxLength={18}
                  className={`${ESTILO_INPUT_MODAL} pr-9`}
                  placeholder="00.000.000/0000-00"
                />
                {consultandoCnpj && (
                  <div className="absolute right-3 top-3 flex items-center text-blue-600">
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                  </div>
                )}
              </div>
            </ModalCampo>
          </div>
        </ModalSecao>

        {/* Endereço */}
        <ModalSecao titulo="Endereço">
          <div className="space-y-4">
            <ModalCampo rotulo="Endereço completo" obrigatorio erro={errors.endereco?.message}>
              <input
                {...register('endereco')}
                className={ESTILO_INPUT_MODAL}
                placeholder="Ex: EQS 106/306 Área Especial, Asa Sul"
              />
            </ModalCampo>

            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-5">
              <ModalCampo rotulo="Cidade" obrigatorio erro={errors.cidade?.message}>
                <input
                  {...register('cidade')}
                  className={ESTILO_INPUT_MODAL}
                  placeholder="Ex: Brasília"
                />
              </ModalCampo>

              <ModalCampo rotulo="Estado (UF)" obrigatorio erro={errors.uf?.message}>
                <input
                  {...register('uf')}
                  maxLength={2}
                  className={`${ESTILO_INPUT_MODAL} uppercase`}
                  placeholder="DF"
                />
              </ModalCampo>
            </div>
          </div>
        </ModalSecao>
      </form>
    </Modal>
  );
};

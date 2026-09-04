import { useState, type FC } from 'react';
import { CabecalhoPaginaSesi } from './CabecalhoPaginaSesi.tsx';

export interface UsuarioSistema {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  perfil: 'RECEPCAO' | 'PROFISSIONAL_SAUDE' | 'ADMINISTRADOR';
  registroProfissional?: string;
  especialidade?: string;
  ativo: boolean;
  ultimoAcesso: string;
}

export const VisaoUsuarios: FC = () => {
  const [busca, setBusca] = useState('');
  const [perfilFiltro, setPerfilFiltro] = useState('TODOS');

  const [usuarios] = useState<UsuarioSistema[]>([
    {
      id: 'usr-01',
      nome: 'Dra. Camila Souza',
      email: 'camila.souza@sesidf.org.br',
      cpf: '045.890.123-55',
      perfil: 'PROFISSIONAL_SAUDE',
      registroProfissional: 'CRM-DF 24.890',
      especialidade: 'Oftalmologia',
      ativo: true,
      ultimoAcesso: 'Hoje às 08:20',
    },
    {
      id: 'usr-02',
      nome: 'Dr. Lucas Prado',
      email: 'lucas.prado@sesidf.org.br',
      cpf: '012.776.432-11',
      perfil: 'PROFISSIONAL_SAUDE',
      registroProfissional: 'CRO-DF 14.332',
      especialidade: 'Odontologia',
      ativo: true,
      ultimoAcesso: 'Hoje às 08:15',
    },
    {
      id: 'usr-03',
      nome: 'Mariana Duarte',
      email: 'mariana.duarte@sesidf.org.br',
      cpf: '066.432.887-90',
      perfil: 'RECEPCAO',
      ativo: true,
      ultimoAcesso: 'Hoje às 07:50',
    },
    {
      id: 'usr-04',
      nome: 'Prof. Dr. Marcelo Carvalho (UnB)',
      email: 'marcelo.carvalho@unb.br',
      cpf: '002.998.441-20',
      perfil: 'ADMINISTRADOR',
      ativo: true,
      ultimoAcesso: 'Hoje às 09:10',
    },
  ]);

  const filtrados = usuarios.filter((u) => {
    const matchBusca =
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase()) ||
      u.cpf.includes(busca);
    const matchPerfil = perfilFiltro === 'TODOS' || u.perfil === perfilFiltro;
    return matchBusca && matchPerfil;
  });

  return (
    <div className="flex flex-col flex-1 animate-fade-in font-sans">
      {/* ─── Cabeçalho Fixo Modular ───────────────────────────────────────── */}
      <CabecalhoPaginaSesi
        titulo="Usuários & Perfis de Acesso"
        subtitulo="CONTROLE DE CONTAS E PERMISSÕES (RECEPÇÃO, CLÍNICO E ADMINISTRADOR)"
        busca={{
          valor: busca,
          aoMudar: setBusca,
          placeholder: 'Buscar usuário por nome, email ou CPF...',
        }}
        seletor={{
          valor: perfilFiltro,
          aoMudar: setPerfilFiltro,
          placeholder: 'Todos os Perfis',
          opcoes: [
            { id: 'TODOS', nome: 'Todos os Perfis' },
            { id: 'RECEPCAO', nome: 'Recepção (Triagem)' },
            { id: 'PROFISSIONAL_SAUDE', nome: 'Profissional de Saúde' },
            { id: 'ADMINISTRADOR', nome: 'Administrador (UnB/Sesi)' },
          ],
        }}
        acaoPrimaria={{
          rotulo: '+ Novo Usuário',
          aoClicar: () => alert('Modal de criação de usuário da equipe de campo.'),
        }}
        fixo={true}
      />

      {/* ─── Tabela de Usuários ───────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col flex-1 min-h-[460px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                <th scope="col" className="py-3 px-4 font-bold text-slate-600">USUÁRIO</th>
                <th scope="col" className="py-3 px-3 font-bold text-slate-600">PERFIL DE ACESSO</th>
                <th scope="col" className="py-3 px-3 font-bold text-slate-600">REGISTRO / ESPECIALIDADE</th>
                <th scope="col" className="py-3 px-3 font-bold text-slate-600">ÚLTIMO ACESSO</th>
                <th scope="col" className="py-3 px-4 font-bold text-slate-600 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtrados.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                        {u.nome.charAt(0)}
                      </div>
                      <div>
                        <p>{u.nome}</p>
                        <p className="text-[11px] font-normal text-slate-400 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    {u.perfil === 'ADMINISTRADOR' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        👑 Administrador
                      </span>
                    ) : u.perfil === 'PROFISSIONAL_SAUDE' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        🩺 Profissional de Saúde
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        📋 Recepção & Triagem
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-slate-600">
                    {u.registroProfissional ? (
                      <div>
                        <p className="font-semibold text-slate-800">{u.registroProfissional}</p>
                        <p className="text-[11px] text-slate-500">{u.especialidade}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Equipe de Apoio</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    {u.ultimoAcesso}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Ativo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="py-2.5 px-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-400 select-none">
          <span>{filtrados.length} usuário(s) cadastrado(s)</span>
          <span className="font-mono text-slate-400">Controle de Acesso RBAC • SESI / UnB</span>
        </div>
      </div>
    </div>
  );
};

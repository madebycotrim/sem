import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed inicial do banco de dados (100% em PT-BR).
 */
async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // --- Polos de atendimento padrão ---
  const escolas = [
    { id: '0a62d5b0-0d57-4f75-8969-8a0c2c5f7e01', nome: 'CEMEIT DE TAGUATINGA', endereco: 'Taguatinga', cidade: 'Brasília' },
    { id: '34b4c13f-d88c-4321-9c32-2acb046a5402', nome: 'CEF 01 DE BRASÍLIA', endereco: 'SGAS 601, Asa Sul', cidade: 'Brasília' },
    { id: 'af51d4c9-9c67-4b4f-b524-8c985d90b403', nome: 'EC 10 DE CEILÂNDIA', endereco: 'Ceilândia', cidade: 'Brasília' },
    { id: 'cd56f7b2-5801-4b9d-bf43-78c332a5f104', nome: 'CEF 02 DE SOBRADINHO', endereco: 'Sobradinho', cidade: 'Brasília' },
  ];
  await Promise.all(escolas.map((escola) => prisma.escolaLocal.upsert({
    where: { id: escola.id }, update: { nome: escola.nome, endereco: escola.endereco, cidade: escola.cidade, uf: 'DF' },
    create: { ...escola, uf: 'DF' },
  })));
  console.log(`✅ ${escolas.length} polos criados ou atualizados.`);

  // --- Usuário ADMIN padrão (senha: Admin@12345678) ---
  const { gerarHashSenha } = await import('../src/infraestrutura/criptografia/senha.js');
  const senhaHashDev = await gerarHashSenha('Admin@12345678');

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@saudeemmovimento.dev' },
    update: {},
    create: {
      email: 'admin@saudeemmovimento.dev',
      senhaHash: senhaHashDev,
      nomeCompleto: 'Administrador (Dev)',
      perfil: 'ADMIN',
      mfaAtivo: false,
    },
  });
  console.log(`✅ Usuário ADMIN criado: ${admin.email}`);

  console.log('🌱 Seed concluído com sucesso.');
}

main()
  .catch((erro) => {
    console.error('❌ Erro no seed:', erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed inicial do banco de dados (100% em PT-BR).
 */
async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // --- Escola/Local de exemplo ---
  const escola = await prisma.escolaLocal.upsert({
    where: { id: 'seed-escola-001' },
    update: {},
    create: {
      id: 'seed-escola-001',
      nome: 'CEF 01 de Brasília',
      endereco: 'SGAS 601, Asa Sul',
      cidade: 'Brasília',
      uf: 'DF',
    },
  });
  console.log(`✅ Escola criada: ${escola.nome}`);

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

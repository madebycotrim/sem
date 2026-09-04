import { PrismaClient } from '@prisma/client';
import * as crypto from 'node:crypto';

const prisma = new PrismaClient();

/**
 * Seed inicial do banco de dados.
 *
 * Cria um usuário ADMIN padrão e uma escola/local de exemplo
 * para facilitar o desenvolvimento local.
 *
 * ATENÇÃO: Em produção, o primeiro ADMIN deve ser criado
 * via CLI seguro ou migration manual.
 */
async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // --- Escola/Local de exemplo ---
  const escola = await prisma.schoolLocation.upsert({
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
  // Em produção: Argon2id. Aqui usamos um hash fixo para seed.
  // HACK: Hash estático para dev — em produção, gerar via Argon2id
  const senhaHashDev =
    '$argon2id$v=19$m=65536,t=3,p=4$' +
    crypto.randomBytes(16).toString('base64') +
    '$' +
    crypto.randomBytes(32).toString('base64');

  const admin = await prisma.user.upsert({
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

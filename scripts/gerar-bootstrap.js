import crypto from 'node:crypto';
import readline from 'node:readline';

/**
 * Utilitário para gerar o hash seguro (PBKDF2 SHA-512) e o comando SQL
 * para criar um usuário BOOTSTRAP / Administrador no banco Cloudflare D1
 * sem nenhum dado hardcoded.
 */

const ITERACOES_EDGERUNTIME = 5_000;

function gerarHashSenha(senhaTextoPlano, iteracoes = ITERACOES_EDGERUNTIME) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(senhaTextoPlano, salt, iteracoes, 64, 'sha512');
  return `pbkdf2:sha512:${iteracoes}:${salt.toString('hex')}:${hash.toString('hex')}`;
}

function parseArgumentos() {
  const args = process.argv.slice(2);
  const params = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) params.email = args[++i];
    if (args[i] === '--nome' && args[i + 1]) params.nome = args[++i];
    if (args[i] === '--senha' && args[i + 1]) params.senha = args[++i];
    if (args[i] === '--todos' || args[i] === '--all') params.todos = true;
  }
  return params;
}

async function perguntar(rl, pergunta, esconder = false) {
  return new Promise((resolve) => {
    rl.question(pergunta, (resposta) => {
      resolve(resposta.trim());
    });
  });
}

async function main() {
  let { email, nome, senha, todos } = parseArgumentos();

  if (!senha) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n============================================================');
    console.log('👤 CATRAKI — GERADOR DE SENHAS & BOOTSTRAP (EDGE 5.000 ITERAÇÕES)');
    console.log('============================================================\n');

    senha = await perguntar(rl, 'Senha de Acesso (ex: Sesi2026): ');
    if (!todos && (!email || !nome)) {
      const respTodos = await perguntar(rl, 'Deseja aplicar para TODOS os usuários do sistema? (s/n): ');
      if (respTodos.toLowerCase().startsWith('s')) {
        todos = true;
      } else {
        if (!nome) nome = await perguntar(rl, 'Nome Completo: ');
        if (!email) email = await perguntar(rl, 'E-mail: ');
      }
    }

    rl.close();
  }

  if (!senha) {
    console.error('❌ Erro: Senha de acesso é obrigatória.');
    process.exit(1);
  }

  const senhaHash = gerarHashSenha(senha);

  console.log('\n============================================================');
  console.log('🔑 HASH GERADO (5.000 iterações — compatível com Edge 10ms CPU):');
  console.log(senhaHash);
  console.log('============================================================\n');

  // Comando universal para TODOS os usuários cadastrados
  const sqlUpdateTodos = `UPDATE usuarios SET senha_hash = '${senhaHash}', atualizado_em = datetime('now');`;

  console.log('============================================================');
  console.log('🌐 COMANDO 1: ATUALIZAR TODOS OS USUÁRIOS DO SISTEMA');
  console.log('============================================================\n');
  console.log('🚀 PARA APLICAR EM PRODUÇÃO (CLOUDFLARE D1 REMOTO):');
  console.log(`npx wrangler d1 execute sem_catraki_db --remote --command="${sqlUpdateTodos}"\n`);
  console.log('💻 PARA APLICAR NO BANCO LOCAL:');
  console.log(`npx wrangler d1 execute sem_catraki_db --local --command="${sqlUpdateTodos}"\n`);

  if (email) {
    const id = crypto.randomUUID();
    const emailSanitizado = email.toLowerCase().replace(/'/g, "''");
    const nomeSanitizado = (nome || 'Administrador').replace(/'/g, "''");

    const sqlUpdateIndividual = `UPDATE usuarios SET senha_hash = '${senhaHash}', atualizado_em = datetime('now') WHERE email = '${emailSanitizado}';`;
    const sqlInsertIndividual = `INSERT INTO usuarios ( id, email, senha_hash, nome_completo, perfil, ativo, mfa_ativo, senha_temporaria, criado_em, atualizado_em ) VALUES ( '${id}', '${emailSanitizado}', '${senhaHash}', '${nomeSanitizado}', 'BOOTSTRAP', 1, 0, 0, datetime('now'), datetime('now') );`;

    console.log('============================================================');
    console.log(`👤 COMANDO 2: ESPECÍFICO PARA O USUÁRIO (${emailSanitizado})`);
    console.log('============================================================\n');
    console.log('🔄 Se o usuário já existe:');
    console.log(`npx wrangler d1 execute sem_catraki_db --remote --command="${sqlUpdateIndividual}"\n`);
    console.log('➕ Se for um novo usuário bootstrap:');
    console.log(`npx wrangler d1 execute sem_catraki_db --remote --command="${sqlInsertIndividual}"\n`);
  }
}

main();

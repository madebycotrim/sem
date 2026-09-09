import crypto from 'node:crypto';
import readline from 'node:readline';

/**
 * Utilitário para gerar o hash seguro (PBKDF2 SHA-512) e o comando SQL
 * para criar um usuário BOOTSTRAP / Administrador no banco Cloudflare D1
 * sem nenhum dado hardcoded.
 */

function gerarHashSenha(senhaTextoPlano) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(senhaTextoPlano, salt, 100_000, 64, 'sha512');
  return `pbkdf2:sha512:100000:${salt.toString('hex')}:${hash.toString('hex')}`;
}

function parseArgumentos() {
  const args = process.argv.slice(2);
  const params = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) params.email = args[++i];
    if (args[i] === '--nome' && args[i + 1]) params.nome = args[++i];
    if (args[i] === '--senha' && args[i + 1]) params.senha = args[++i];
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
  let { email, nome, senha } = parseArgumentos();

  if (!email || !nome || !senha) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n============================================================');
    console.log('👤 CATRAKI — GERADOR DE USUÁRIO BOOTSTRAP (SQL SEGURO)');
    console.log('============================================================\n');

    if (!nome) nome = await perguntar(rl, 'Nome Completo: ');
    if (!email) email = await perguntar(rl, 'E-mail: ');
    if (!senha) senha = await perguntar(rl, 'Senha de Acesso: ');

    rl.close();
  }

  if (!nome || !email || !senha) {
    console.error('❌ Erro: Nome, e-mail e senha são obrigatórios.');
    process.exit(1);
  }

  const id = crypto.randomUUID();
  const senhaHash = gerarHashSenha(senha);
  const emailSanitizado = email.toLowerCase().replace(/'/g, "''");
  const nomeSanitizado = nome.replace(/'/g, "''");

  const sql = `INSERT INTO usuarios (
  id,
  email,
  senha_hash,
  nome_completo,
  perfil,
  ativo,
  mfa_ativo,
  senha_temporaria,
  criado_em,
  atualizado_em
) VALUES (
  '${id}',
  '${emailSanitizado}',
  '${senhaHash}',
  '${nomeSanitizado}',
  'BOOTSTRAP',
  1,
  0,
  0,
  datetime('now'),
  datetime('now')
);`;

  console.log('\n============================================================');
  console.log('✅ COMANDO SQL GERADO (PRONTO PARA O CLOUDFLARE D1)');
  console.log('============================================================\n');
  console.log(sql);
  console.log('\n------------------------------------------------------------');
  console.log('🚀 PARA APLICAR DIRETAMENTE EM PRODUÇÃO (CLOUDFLARE D1):');
  console.log('------------------------------------------------------------\n');
  const sqlLinhaUnica = sql.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');
  console.log(`npx wrangler d1 execute sem_catraki_db --remote --command="${sqlLinhaUnica}"\n`);
  console.log('------------------------------------------------------------');
  console.log('💻 PARA APLICAR NO BANCO LOCAL:');
  console.log('------------------------------------------------------------\n');
  console.log(`npx wrangler d1 execute sem_catraki_db --local --command="${sqlLinhaUnica}"\n`);
}

main();

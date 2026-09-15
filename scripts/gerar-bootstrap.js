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
    console.log('👤 CATRAKI — GERADOR DE USUÁRIO BOOTSTRAP (SQL SEGURO - 5.000 ITERAÇÕES)');
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

  const sqlInsert = `INSERT INTO usuarios (
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

  const sqlUpdate = `UPDATE usuarios SET senha_hash = '${senhaHash}', atualizado_em = datetime('now') WHERE email = '${emailSanitizado}';`;

  console.log('\n============================================================');
  console.log('🔑 HASH GERADO (5.000 iterações — compatível com Edge 10ms CPU):');
  console.log(senhaHash);
  console.log('============================================================\n');

  console.log('------------------------------------------------------------');
  console.log('🔄 CASO 1: SE O USUÁRIO JÁ EXISTE NO BANCO (ATUALIZAR SENHA)');
  console.log('------------------------------------------------------------\n');
  const sqlUpdateLinha = sqlUpdate.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');
  console.log(`npx wrangler d1 execute sem_catraki_db --remote --command="${sqlUpdateLinha}"\n`);

  console.log('------------------------------------------------------------');
  console.log('➕ CASO 2: SE FOR UM NOVO USUÁRIO (CRIAR NO BANCO)');
  console.log('------------------------------------------------------------\n');
  const sqlInsertLinha = sqlInsert.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');
  console.log(`npx wrangler d1 execute sem_catraki_db --remote --command="${sqlInsertLinha}"\n`);
}

main();

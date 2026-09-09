import crypto from 'node:crypto';

/**
 * Utilitário para gerar chaves criptográficas seguras de alta entropia (256-bit CSPRNG)
 * para Produção (Cloudflare Pages, Hono e Envelope Encryption da LGPD).
 */
function gerarChavesProducao() {
  const jwtSecret = crypto.randomBytes(32).toString('hex');
  const kekHex = crypto.randomBytes(32).toString('hex');

  console.log('\n============================================================');
  console.log('🔒 CATRAKI — CHAVES CRIPTOGRÁFICAS DE ALTA SEGURANÇA (PRODUÇÃO)');
  console.log('============================================================\n');

  console.log('Copie e cole no painel do Cloudflare Pages:');
  console.log('👉 Settings > Environment Variables > Add variable\n');

  console.log('------------------------------------------------------------');
  console.log('1. JWT_SECRET (Tipo: Secret)');
  console.log(jwtSecret);
  console.log('\n2. KEK_HEX (Tipo: Secret)');
  console.log(kekHex);
  console.log('------------------------------------------------------------\n');

  console.log('⚠️  IMPORTANTE (BACKUP OBRIGATÓRIO):');
  console.log('Guarde o KEK_HEX imediatamente no seu cofre de senhas (Bitwarden, 1Password ou Google Senhas).');
  console.log('Se o KEK_HEX for perdido, os dados criptografados dos pacientes ficarão inacessíveis.\n');
}

gerarChavesProducao();

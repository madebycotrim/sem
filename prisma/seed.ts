async function main() {
  console.log('Seed desativado: cadastre dados somente pelos fluxos administrativos da API.');
}

main()
  .catch((erro) => {
    console.error('❌ Erro no seed:', erro);
    process.exit(1);
  })

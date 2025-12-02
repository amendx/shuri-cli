
const { program } = require("commander");
const { handleCreateAction } = require("./cli/cli-action.js");
const { applyOptionsToCommand } = require("./cli/cli-options.js");

async function runCli(argv) {
  program
    .name("shuri-cli")
    .description("CLI para criação de componentes Vue.js com estrutura padrão")
    .version("1.2.0");

  const newComponent = program
    .command("new <name>")
    .description("Cria componente Vue com estrutura completa")
    .action(handleCreateAction);

  applyOptionsToCommand(newComponent);

  await program.parseAsync(argv, { from: "user" });
}

module.exports = {
  runCli,
};

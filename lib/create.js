
const { program } = require("commander");
const { handleCreateAction } = require("./cli/cli-action.js");
const { applyOptionsToCommand } = require("./cli/cli-options.js");

async function runCli(argv) {
  program
    .name("shuri-cli")
    .description("Gerador de componentes Vue.js para o Shuri Design System")
    .version("0.1.0");

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

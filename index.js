const { runCli } = require("./lib/run-cli");
const { runProgrammatic } = require("./lib/run-programmatic");

async function run(command, options) {
  if (options && typeof options === "object")
    return await runProgrammatic(command, options);

  return await runCli(command);
}

module.exports = {
  runCli: run,
  run,
};

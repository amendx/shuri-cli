const { runCli } = require("./lib/create");
const { runProgrammatic } = require("./lib/programmatic");

async function run(command, options) {
  if (options && typeof options === "object")
    return await runProgrammatic(command, options);

  return await runCli(command);
}

module.exports = {
  runCli: run,
  run,
};

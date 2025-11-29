#!/usr/bin/env node

/**
 * Shuri CLI - Test & Example Runner
 *
 * Demonstrates CLI functionality with practical examples.
 * Shows all available options and expected outputs.
 */

const { spawn } = require("child_process");
const path = require("path");

const CLI_PATH = path.join(__dirname, "..", "bin", "shuri-cli.js");

console.log("🧪 Shuri CLI - Test & Examples");
console.log("===============================\n");

/**
 * Runs a CLI command and captures output
 */
function runCommand(args, description) {
  return new Promise((resolve) => {
    console.log(`📋 ${description}`);
    console.log(`💻 Command: shuri-cli ${args.join(" ")}`);
    console.log("📤 Output:");
    console.log("─".repeat(50));

    const child = spawn("node", [CLI_PATH, ...args], {
      stdio: "inherit",
    });

    child.on("close", (code) => {
      console.log("─".repeat(50));
      setTimeout(resolve, 500); // Small delay between tests
    });
  });
}

/**
 * Main test runner
 */
async function runTests() {
  console.log("🚀 Starting CLI Examples...\n");

  // 1. Help command
  await runCommand(["--help"], "Show help");

  // 2. Basic component (dry-run)
  await runCommand(["new", "MyButton", "--dry-run"], "Basic component");

  // 3. Advanced example with all options
  await runCommand(
    [
      "new",
      "StyledButton",
      "--style",
      "--out",
      "./custom/components",
      "--verbose",
      "--dry-run",
    ],
    "Advanced component with styling and custom directory"
  );

  console.log("✅ Examples completed!");

  console.log("\n📖 Common Usage:");
  console.log("shuri-cli new MyButton");
  console.log("shuri-cli new MyButton --style --out ./src/ui --verbose");
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };

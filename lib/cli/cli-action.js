/**
 * CLI Action Handler
 * 
 * Handles the main CLI command action with validation, logging, and error handling.
 * Extracted from create.js for better code organization and maintainability.
 * 
 * @module cli-action
 */

const { createComponent } = require("../create-component.js");
const { 
  isValidComponentType, 
  isValidStyleExtension, 
  getValidComponentTypesText, 
  getValidStyleExtensionsText 
} = require("./cli-options.js");

/**
 * Handles the CLI action for component creation
 * @param {string} name - Component name
 * @param {Object} options - CLI options
 */
async function handleCreateAction(name, options) {
  try {
    validateComponentType(component = 'component');
    validateComponentName(name);
    validateStyleExtension(options.styleExt);

    if (options.verbose) {
      logVerboseInfo(name, options);
    }

    const vueVersion = options.vue2 ? 2 : options.vue3 ? 3 : null;
    const result = await createComponent(name, {
      cwd: process.cwd(),
      out: options.out,
      styleExt: options.styleExt,
      noStyle: options.noStyle,
      noTest: options.noTest,
      force: options.force,
      dryRun: options.dryRun,
      vueVersion,
      useKebab: options.kebab,
    });

    if (result.dryRun) {
      handleDryRun(result);
      return;
    }

    if (!result.created) {
      handleCreationError(result);
      return;
    }

    handleSuccess(name, result, options);

  } catch (error) {
    handleUnexpectedError(error, options.verbose);
  }
}

/**
 * Validates component type
 */
function validateComponentType(component) {
  if (!isValidComponentType(component)) {
    console.error(`❌ Erro: Tipo '${component}' não suportado.`);
    console.error(`   Tipos disponíveis: ${getValidComponentTypesText()}`);
    console.error(`   Exemplo: shuri-cli new MeuBotao`);
    process.exit(1);
  }
}

/**
 * Validates component name
 */
function validateComponentName(name) {
  if (!name || name.trim() === "") {
    console.error(`❌ Erro: Nome do componente é obrigatório.`);
    console.error(`   Exemplo: shuri-cli new MeuBotao`);
    process.exit(1);
  }
}

/**
 * Validates style extension
 */
function validateStyleExtension(styleExt) {
  if (styleExt && !isValidStyleExtension(styleExt)) {
    console.error(`❌ Erro: Extensão '${styleExt}' não suportada.`);
    console.error(`   Extensões válidas: ${getValidStyleExtensionsText()}`);
    process.exit(1);
  }
}

/**
 * Logs verbose information
 */
function logVerboseInfo(name, options) {
  console.log(`🔍 Criando componente '${name}'...`);
  console.log(`    📂 Diretório: ${options.out || 'src/components'}`);
  console.log(`    🎨 Estilo: ${!options.noStyle ? `✓ (.${options.styleExt})` : '✗ (none)'}`);
  console.log(`    🧪 Teste: ${!options.noTest ? `✓ (${options.testExt})` : '✗ (none)'}`);
  console.log(`    📝 Formato: ${options.kebab ? 'kebab-case' : 'PascalCase'}`);
}

/**
 * Handles dry run output
 */
function handleDryRun(result) {
  console.log("🔍 Simulação (dry-run):");
  console.log("📁 Arquivos que serão criados:");
  result.actions.write.forEach(file => {
    console.log(`    ✓ ${file}`);
  });
}

/**
 * Handles creation errors
 */
function handleCreationError(result) {
  if (result.reason === "exists") {
    console.error(`❌ Erro: Diretório já existe em ${result.path}`);
    console.error(`    Use --force para sobrescrever ou escolha outro nome.`);
  } else {
    console.error(`❌ Erro: Falha ao criar componente em ${result.path}`);
    console.error(`    Verifique as permissões e tente novamente.`);
  }
  process.exit(1);
}

/**
 * Handles successful creation
 */
function handleSuccess(name, result, options) {
  console.log(`✅ Componente '${name}' criado com sucesso!`);
  console.log(`    🔍 Localização: ${result.path}`);
  
  // Always show created files (like dry-run does)
  console.log("📁 Arquivos criados:");
  if (result.actions && result.actions.write) {
    result.actions.write.forEach(file => {
      console.log(`    ✓ ${file}`);
    });
  }
  
  if (options.verbose) {
    console.log(`🎉 Pronto para usar! Importe com:`);
    const fileName = options.kebab ? name.toLowerCase() : name;
    const componentName = options.kebab ? 'Component' : name;
    console.log(`       ➡️   import ${componentName} from './${fileName}/${fileName}.vue'`);
  }
}

/**
 * Handles unexpected errors
 */
function handleUnexpectedError(error, verbose) {
  console.error(`💥 Erro inesperado: ${error.message}`);
  if (verbose) {
    console.error(error.stack);
  }
  process.exit(1);
}

module.exports = {
  handleCreateAction,
};
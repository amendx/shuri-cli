/**
 * CLI Action Handler
 * 
 * Handles the 'new' command action for creating Vue.js components
 * with standard structure, including optional documentation generation.
 *
 * Extracted from create.js for better code organization and maintainability.
 * 
 * @module cli-action
 */

const { createComponent } = require("../helpers/create-component.js");
const { generateComponentDocs, getDocumentationFilePaths } = require("../helpers/create-component-docs.js");
const { pascalCase, kebabCase } = require("../../helpers/string-utils.js");
const { getVueVersion } = require("../../helpers/get-vue-version.js");
const { 
  isValidComponentType, 
  isValidStyleExtension, 
  getValidComponentTypesText, 
  getValidStyleExtensionsText,
} = require("./cli-options.js");

/**
 * Handles the CLI action for component creation
 * @param {string} name - Component name
 * @param {Object} options - CLI options
 */
async function handleCreateAction(name, options) {
  try {
    validateComponentType((component = "component"));
    validateComponentName(name);
    validateStyleExtension(options.styleExt);

    if (options.verbose) {
      await logVerboseInfo(name, options);
    }

    const vueVersion = options.vue2 ? 2 : options.vue3 ? 3 : null;
    const result = await createComponent(name, {
      cwd: process.cwd(),
      root: options.root,
      out: options.out,
      styleExt: options.styleExt,
      noStyle: options.noStyle,
      noTest: options.noTest,
      noDocs: !options.docs,
      testExt: options.testExt,
      backup: options.backup || false,
      force: options.force,
      dryRun: options.dryRun,
      vueVersion,
      kebab: options.kebab,
    });

    if (result.dryRun) {
      handleDryRun(result, name, options);
      return;
    }

    if (!result.created) {
      handleCreationError(result);
      return;
    }

    await handleDocsGeneration(name, options, result);
    
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
async function logVerboseInfo(name, options) {
  // Detect Vue version for display
  const detectedVueVersion = await getVueVersion(process.cwd(), require("fs").promises, require("path"));
  const actualVueVersion = options.vue3 ? 3 : options.vue2 ? 2 : detectedVueVersion;
  const vueVersionText = actualVueVersion ? `Vue ${actualVueVersion}` : 'Vue (não detectado)';
  
  console.log(`🔍 Criando componente '${name}'...`);
  console.log(`    🛠  Root: ${options.root || name}`);
  console.log(`    📂 Diretório de saída: ${options.out || 'src/components'}`);
  console.log(`    🎨 Estilo: ${!options.noStyle ? `✓ (.${options.styleExt})` : '✗ (none)'}`);
  console.log(`    🧪 Teste: ${!options.noTest ? `✓ (${options.testExt})` : '✗ (none)'}`);
  console.log(`    📑 Documentação: ${options.docs ? '✓ (VuePress)' : '✗ (none)'}`);
  console.log(`    🎯 Versão: ${vueVersionText}`);
  console.log(`    📤 Formato: ${options.kebab ? 'kebab-case' : 'PascalCase'}`);
}

/**
 * Handles dry run output
 */
function handleDryRun(result, name, options) {
  console.log("🔍 Simulação (dry-run):");
  console.log("📁 Arquivos que serão criados:");
  
  // Show component files
  result.actions.write.forEach((file) => {
    console.log(`    ✓ ${file}`);
  });

  // Show documentation files if docs are enabled
  if (options.docs) {
    console.log("📚 Arquivos de documentação:");
    const docPaths = getDocumentationFilePaths({ 
      name: name, 
      root: options.root,
      rootDir: process.cwd() 
    });
    docPaths.forEach((file) => {
      console.log(`    ✓ ${file}`);
    });
    
    // Show config files that would be updated
    console.log("📝 Arquivos que seriam atualizados:");
    const docsDir = require("path").join(process.cwd(), "docs");
    console.log(`    ~ ${require("path").join(docsDir, ".vuepress", "config.js")}`);
    console.log(`    ~ ${require("path").join(process.cwd(), "src", "components", "index.js")}`);
  }
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
    result.actions.write.forEach((file) => {
      console.log(`    ✓ ${file}`);
    });
  }

  // Show docs creation summary
  if (options.docs && result.docsCreated) {
    const docsCount = Object.values(result.docsCreated).filter(Boolean).length;
    if (docsCount > 0) {
      console.log(`📚 Documentação criada: ${docsCount} arquivo${docsCount > 1 ? 's' : ''}`);
    }
  }
  
  if (options.verbose) console.log(`🎉 Pronto para usar! `);
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

/**
 * Handles documentation generation after component creation
 */
async function handleDocsGeneration(name, options, result) {
  if (!options.docs || options.dryRun) {
    if (options.verbose) {
      console.log(`📚 Documentação pulada (${!options.docs ? '--no-docs' : 'dry-run'} ativo)`);
    }
    return;
  }

  // Check Vue version for documentation compatibility
  const detectedVueVersion = await getVueVersion(process.cwd(), require("fs").promises, require("path"));
  const actualVueVersion = options.vue3 ? 3 : options.vue2 ? 2 : detectedVueVersion || 2; // Default to Vue 2 if not detected
  
  if (actualVueVersion === 3) {
    console.warn(`⚠️  Aviso: Geração de documentação não suportada para Vue 3`);
    console.warn(`    A documentação VuePress está preparada apenas para Vue 2 e VuePress v1`);
    console.warn(`    Use --no-docs para pular a geração de documentação`);
    if (options.verbose) {
      console.log(`📚 Documentação pulada (Vue 3 detectado)`);
    }
    return;
  }

  if (options.verbose) {
    console.log(`📚 Gerando documentação para '${name}'...`);
  }

  try {
    const docsResult = await generateComponentDocs({
      name,
      root: options.root,
      rootDir: process.cwd(),
      backup: options.backup || false,
      verbose: options.verbose || false
    });

    if (options.verbose) {
      console.log(`    ✅ Documentação criada:`);
      
      // Show created documentation files
      Object.entries(docsResult.created).forEach(([key, created]) => {
        const status = created ? '✓' : '⚠️ (já existe)';
        let fileType, fileName;
        
        switch(key) {
          case 'docsExampleMd':
            fileType = 'Documentação Markdown';
            fileName = `docs/components/${kebabCase(name)}.md`;
            break;
          case 'exampleVue':
            fileType = `Exemplo/${pascalCase(name)} Vue`;
            fileName = `docs/examples/${kebabCase(name)}/${kebabCase(name)}-example.vue`;
            break;
          case 'apiFile':
            fileType = 'API Documentation';
            fileName = `docs/components-api/${kebabCase(name)}-api.js`;
            break;
          default:
            fileType = key;
            fileName = '';
        }
        
        console.log(`        ${status} ${fileType}`);
        if (fileName && options.verbose) {
          console.log(`            📁 ${fileName}`);
        }
      });

      if (docsResult.edits) {
        console.log(`    🔧 Configurações atualizadas:`);
        
        // VuePress config details
        console.log(`        📝 VuePress Sidebar:`);
        console.log(`            • Adicionado: /components/${options.root ? kebabCase(options.root) : kebabCase(name)}`);
        console.log(`            📁 ${docsResult.edits.config}`);
        if (options.backup) {
          console.log(`            💾 Backup: ${docsResult.edits.config}.bak`);
        }
        
        // Components index details  
        console.log(`        📦 Components Index:`);
        console.log(`            • Import: ${pascalCase(name)} from './${options.root ? kebabCase(options.root) : kebabCase(name)}'`);
        console.log(`            • Export: ${pascalCase(name)} adicionado à lista`);
        console.log(`            📁 ${docsResult.edits.componentsIndex}`);
        if (options.backup) {
          console.log(`            💾 Backup: ${docsResult.edits.componentsIndex}.bak`);
        }
      }
    }
    
    // Add docs files to result for final summary
    if (!result.docsCreated) {
      result.docsCreated = docsResult.created;
    }
    
  } catch (error) {
    console.warn(`⚠️  Aviso: Falha ao gerar documentação: ${error.message}`);
    if (options.verbose) {
      console.warn(error.stack);
    }
  }
}

module.exports = {
  handleCreateAction,
};
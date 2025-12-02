/** VuePress Component Docs Generator
 *
 * Generates VuePress documentation files for a Vue component,
 * including markdown docs, example usage, and API reference.
 * Also updates VuePress config and components index.
 *
 * @module create-component-docs
 * @function generateComponentDocs
 * @param {Object} opts - Options object
 * @param {string} opts.name - Component name
 * @param {string} [opts.rootDir=process.cwd()] - Root directory for docs
 * @param {boolean} [opts.backup=false] - Whether to backup modified files
 * @returns {Promise<Object>} Documentation generation result
 */

const fs = require("fs").promises;
const path = require("path");

const { pascalCase, kebabCase } = require("../../helpers/string-utils.js");
const { docsMdTemplate, docsVueTemplate, docsApiTemplate } = require("../../helpers/templates/docs-templates.js");
const { getVueVersion } = require("../../helpers/get-vue-version.js");
const { addToComponentsIndex } = require("./components-index.js");
const { addToVuepressConfig } = require("./vuepress-config.js");

/* Auxiliary functions */
async function createDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    throw new Error(`Erro ao criar diretório ${dir}: ${e.message}`);
  }
}

async function createBackup(filePath) {
  try {
    await fs.access(filePath);
    const bak = `${filePath}.bak`;
    await fs.copyFile(filePath, bak);
    return bak;
  } catch (e) {
    return null;
  }
}

async function validateInputs(name, rootDir) {
  if (!name) throw new Error("name é obrigatório");
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("name deve ser uma string não vazia");
  }

  try {
    const stats = await fs.stat(rootDir);
    if (!stats.isDirectory()) {
      throw new Error(`rootDir ${rootDir} não é um diretório válido`);
    }
  } catch (e) {
    throw new Error(
      `rootDir ${rootDir} não existe ou não é acessível: ${e.message}`
    );
  }
}

function buildPaths(rootDir, kebab, pascal) {
  const docsDir = path.join(rootDir, "docs");
  const docsComponentsDir = path.join(docsDir, "components");
  const docsExamplesDir = path.join(docsDir, "examples", kebab);
  const docsComponentsApiDir = path.join(docsDir, "components-api");

  return {
    directories: {
      docs: docsDir,
      components: docsComponentsDir,
      examples: docsExamplesDir,
      api: docsComponentsApiDir,
    },
    files: {
      exampleVue: path.join(docsExamplesDir, `${kebab}-example.vue`),
      componentMd: path.join(docsComponentsDir, `${kebab}.md`),
      apiJs: path.join(docsComponentsApiDir, `${kebab}-api.js`),
      vuepressConfig: path.join(docsDir, ".vuepress", "config.js"),
      componentsIndex: path.join(rootDir, "src", "components", "index.js"),
    },
    relatives: {
      childPath: `/components/${kebab}`,
    },
    components: {
      importPath: kebab,
      importName: pascal,
    },
  };
}

function generateTemplates(pascal, kebab) {
  return {
    api: docsApiTemplate(pascal),
    markdown: docsMdTemplate(pascal, kebab),
    vue: docsVueTemplate(pascal, kebab),
  };
}

async function createDocumentationFiles(paths, templates, verbose = false) {
  const dirsToCreate = [
    paths.directories.components,
    paths.directories.examples,
    paths.directories.api,
  ];
  await Promise.all(dirsToCreate.map(createDir));

  const mdResult = await writeIfNotExists(paths.files.componentMd, templates.markdown, verbose);
  const vueResult = await writeIfNotExists(paths.files.exampleVue, templates.vue, verbose);
  const apiResult = await writeIfNotExists(paths.files.apiJs, templates.api, verbose);

  return {
    created: {
      docsComponentMd: mdResult.created,
      exampleVue: vueResult.created,
      apiFile: apiResult.created,
    },
    results: {
      markdown: mdResult,
      example: vueResult,
      api: apiResult,
    },
  };
}

/**
 * Adds a component to the components README.md in alphabetical order
 */
async function addToComponentsReadme(readmePath, componentName, componentPath, backup = false) {
  try {
    await fs.access(readmePath);
  } catch (e) {
    throw new Error(`Components README.md não encontrado em ${readmePath}`);
  }

  let content = await fs.readFile(readmePath, "utf8");
  const original = content;

  // Check if component already exists
  if (content.includes(`[${componentName}]`) || content.includes(`(${componentPath})`)) {
    return true; // Already exists
  }

  const lines = content.split('\n');
  let inserted = false;

  // Find the "Índice de Componentes" section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('## Índice de Componentes')) {
      // Find the list and insert in alphabetical order
      let j = i + 1;
      
      // Skip empty lines after the header
      while (j < lines.length && lines[j].trim() === '') {
        j++;
      }
      
      // Now we're in the list - collect all entries and sort them
      const newEntry = `- [${componentName}](${componentPath})`;
      const listEntries = [newEntry];
      let startIndex = j;
      
      // Skip empty lines after the header
      while (startIndex < lines.length && lines[startIndex].trim() === '') {
        startIndex++;
      }
      
      // Collect all existing list entries
      let currentIndex = startIndex;
      while (currentIndex < lines.length) {
        const currentLine = lines[currentIndex];
        
        // If we hit an empty line or non-list item, we've reached the end of the list
        if (!currentLine.startsWith('- [') || currentLine.trim() === '') {
          break;
        }
        
        listEntries.push(currentLine);
        currentIndex++;
      }
      
      // Sort all entries alphabetically (case-insensitive)
      listEntries.sort((a, b) => {
        const nameA = a.match(/- \[([^\]]+)\]/)?.[1] || '';
        const nameB = b.match(/- \[([^\]]+)\]/)?.[1] || '';
        return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
      });
      
      // Remove old entries and insert sorted ones
      const endIndex = currentIndex;
      const removedCount = endIndex - startIndex;
      lines.splice(startIndex, removedCount, ...listEntries);
      inserted = true;
      
      break;
    }
  }

  if (!inserted) {
    throw new Error("Não foi possível encontrar a seção 'Índice de Componentes' no README.md");
  }

  const newContent = lines.join('\n');
  
  if (newContent !== original) {
    if (backup) {
      await createBackup(readmePath);
    }
    await fs.writeFile(readmePath, newContent, "utf8");
  }

  return true;
}

async function updateConfigFiles(paths, componentName, backup = false) {
  const warnings = [];

  // Update VuePress config
  try {
    await addToVuepressConfig(paths.files.vuepressConfig, paths.relatives.childPath, backup);
  } catch (e) {
    warnings.push(`falha ao editar config.js automaticamente: ${e.message}`);
  }

  // Update components index
  try {
    // Ensure index file exists
    try {
      await fs.access(paths.files.componentsIndex);
    } catch {
      // Create a basic index.js if missing
      const base = `// Auto-generated components index\n\n`;
      await fs.writeFile(paths.files.componentsIndex, base, "utf8");
    }
    await addToComponentsIndex(
      paths.files.componentsIndex,
      paths.components.importPath,
      paths.components.importName,
      backup
    );
  } catch (e) {
    warnings.push(`falha ao editar src/components/index.js automaticamente: ${e.message}`);
  }

  // Update components README
  try {
    const componentsReadme = path.join(path.dirname(paths.files.vuepressConfig), "..", "components", "README.md");
    await addToComponentsReadme(componentsReadme, componentName, paths.relatives.childPath, backup);
  } catch (e) {
    warnings.push(`falha ao editar components/README.md automaticamente: ${e.message}`);
  }

  return { warnings };
}

async function writeIfNotExists(filePath, content, verbose = false) {
  try {
    await fs.access(filePath);
    if (verbose) {
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`    ⚠️  Arquivo já existe: ${relativePath}`);
    }
    return { created: false, reason: 'já existe' };
  } catch {
    await fs.writeFile(filePath, content, "utf8");
    if (verbose) {
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`    ✅ Arquivo criado: ${relativePath}`);
    }
    return { created: true };
  }
}

async function generateComponentDocs(opts = {}) {
  const { name, root, rootDir = process.cwd(), backup = false, verbose = false } = opts;

  // 1. Validate inputs
  await validateInputs(name, rootDir);

  // 2. Prepare component names
  const effectiveName = root || name; // Use root if provided, otherwise use name
  const kebab = kebabCase(effectiveName);
  const pascal = pascalCase(name); // Component class name should still use the original name

  // 3. Build all paths
  const paths = buildPaths(rootDir, kebab, pascal);

  // 4. Generate templates
  const templates = generateTemplates(pascal, kebab);

  // 5. Create documentation files
  const fileResults = await createDocumentationFiles(paths, templates, verbose);

  // 6. Update configuration files
  // Create display name: effective name with first letter capitalized
  const displayName = effectiveName.charAt(0).toUpperCase() + effectiveName.slice(1).toLowerCase().replace(/-/g, ' ');
  const { warnings } = await updateConfigFiles(paths, displayName, backup);

  // Show warnings if any
  warnings.forEach(warning => {
    console.warn("Aviso:", warning);
  });

  return {
    ...fileResults,
    edits: {
      config: paths.files.vuepressConfig,
      componentsIndex: paths.files.componentsIndex,
    },
  };
}

/**
 * Returns paths of documentation files that would be created (for dry-run preview)
 * @param {Object} opts - Options object
 * @param {string} opts.name - Component name  
 * @param {string} [opts.rootDir=process.cwd()] - Root directory for docs
 * @returns {Array<string>} Array of file paths that would be created
 */
function getDocumentationFilePaths(opts = {}) {
  const { name, root, rootDir = process.cwd() } = opts;
  
  if (!name || typeof name !== "string" || !name.trim()) {
    return [];
  }

  const effectiveName = root || name; // Use root if provided, otherwise use name
  const kebab = kebabCase(effectiveName);
  const pascal = pascalCase(name);
  const paths = buildPaths(rootDir, kebab, pascal);

  return [
    paths.files.componentMd,
    paths.files.exampleVue,
    paths.files.apiJs,
  ];
}

module.exports = { generateComponentDocs, getDocumentationFilePaths };

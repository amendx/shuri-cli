/**
 * Vue Component Generator
 *
 * Creates Vue.js components with optional styles and tests.
 * Auto-detects Vue version, supports PascalCase/kebab-case naming.
 *
 * @module create-component
 * @function createComponent
 * @param {string} name - Component name
 * @param {Object} options - Config options
 * @param {string} [options.cwd] - Working directory
 * @param {string} [options.root] - Root folder name
 * @param {string} [options.out] - Output directory
 * @param {number} [options.vueVersion] - Vue version (2|3)
 * @param {boolean} [options.kebab] - Use kebab-case naming
 * @param {string} [options.styleExt] - Style extension
 * @param {boolean} [options.noStyle] - Skip style file
 * @param {boolean} [options.noTest] - Skip test file
 * @param {boolean} [options.force] - Overwrite existing
 * @param {boolean} [options.dryRun] - Preview mode
 * @returns {Promise<Object>} Creation result
 *
 * @example
 * await createComponent('UserButton', { style: true, styleExt: 'scss' });
 */

const fs = require("fs").promises;
const path = require("path");

const { getVueTemplate, testTemplate, styleTemplate, indexTemplate } = require('../../helpers/templates');
const { pascalCase, kebabCase } = require("../../helpers/string-utils.js");
const { getVueVersion } = require("../../helpers/get-vue-version.js");

function createFilePaths(componentDir, fileName, options) {
  const indexFile = path.join(componentDir, "index.js");
  const componentFile = path.join(componentDir, `${fileName}.vue`);
  const testFile = path.join(
    componentDir,
    options.testExt ? `${fileName}.${options.testExt}` : `${fileName}.spec.js`
  );
  const styleFile = path.join(
    componentDir,
    options.styleExt ? `${fileName}.${options.styleExt}` : `${fileName}.css`
  );
  return {
    index: indexFile,
    component: componentFile,
    style: styleFile,
    test: testFile,
  };
}

function resolveComponentNames(name, options) {
  const pascalName = pascalCase(name);
  const kebabName = kebabCase(name);
  const fileName = options.kebab ? kebabName : pascalName;
  
  return { pascalName, kebabName, fileName };
}

function generateTemplateContent(names, vueVersion, files) {
  const { pascalName, kebabName, fileName } = names;
  
  return {
    component: getVueTemplate(pascalName, vueVersion),
    style: styleTemplate(kebabName, files.style),
    test: testTemplate(pascalName, vueVersion),
    index: indexTemplate(pascalName, fileName)
  };
}

async function checkComponentExists(componentDir, options) {
  try {
    await fs.access(componentDir);
    if (!options.force) {
      console.error(
        `O diretório ${componentDir} já existe. Use --force para sobrescrever.`
      );
      return { exists: true, path: componentDir };
    }
    return { exists: false };
  } catch (err) {
    return { exists: false };
  }
}

function createDryRunResponse(files) {
  return {
    created: true,
    dryRun: true,
    files: {
      index: files.index,
      component: files.component,
      style: files.style,
      test: files.test,
    },
    actions: {
      write: [files.component, files.index, files.style, files.test],
    },
  };
}

async function writeComponentFiles(componentDir, files, templates, options) {
  await fs.mkdir(componentDir, { recursive: true });
  
  const createdFiles = [files.component, files.index];
  
  await fs.writeFile(files.component, templates.component, "utf-8");
  await fs.writeFile(files.index, templates.index, "utf-8");
  
  if (options.noStyle !== true) {
    await fs.writeFile(files.style, templates.style, "utf-8");
    createdFiles.push(files.style);
  }

  if (options.noTest !== true) {
    await fs.writeFile(files.test, templates.test, "utf-8");
    createdFiles.push(files.test);
  }
  
  return createdFiles;
}

async function createComponent(name, options = {}) {
  const cwd = options.cwd || process.cwd();
  const outBase = options.out || path.join(cwd, "src", "components");
  const vueVersion = options.vueVersion || (await getVueVersion(cwd, fs, path)) || 3;

  const names = resolveComponentNames(name, options);
  const componentDir = options.root ? path.join(outBase, options.root) : path.join(outBase, names.fileName);
  const files = createFilePaths(componentDir, names.fileName, options);

  const existsCheck = await checkComponentExists(componentDir, options);
  if (existsCheck.exists) {
    return { created: false, reason: "já existe", path: componentDir };
  }

  const templates = generateTemplateContent(names, vueVersion, files);

  if (options.dryRun) {
    return createDryRunResponse(files);
  }

  const createdFiles = await writeComponentFiles(componentDir, files, templates, options);
  
  return { 
    created: true, 
    path: componentDir,
    actions: {
      write: createdFiles
    }
  };
}

module.exports = {
  createComponent,
};

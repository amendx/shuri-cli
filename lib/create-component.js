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
 * @param {string} [options.out] - Output directory
 * @param {number} [options.vueVersion] - Vue version (2|3)
 * @param {boolean} [options.useKebab] - Use kebab-case naming
 * @param {boolean} [options.style] - Include style file
 * @param {string} [options.styleExt] - Style extension
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

const { vue2Template, vue3Template } = require("../helpers/vue-templates");
const { testTemplate } = require("../helpers/test-templates");
const { styleTemplate } = require("../helpers/style-templates.js");
const { pascalCase, kebabCase } = require("../helpers/string-utils.js");
const { detectVueVersion } = require("./check-vue-version.js");

async function createComponent(name, options = {}) {
  const cwd = options.cwd || process.cwd();
  const outBase = options.out || path.join(cwd, "src", "components");
  const vueVersion =
    options.vueVersion || (await detectVueVersion(cwd, fs, path)) || 3;

  const pascal = pascalCase(name);
  const kebabName = kebabCase(name);

  const fileName = options.useKebab ? kebabName : pascal;

  const style = styleTemplate(pascal, kebabName);
  const test = testTemplate(pascal, vueVersion);

  const componentDir = path.join(outBase, fileName);
  const styleFileName = options.style
    ? options.styleExt
      ? `${fileName}.${options.styleExt}`
      : `${fileName}.css`
    : null;
  const componentFile = path.join(componentDir, `${fileName}.vue`);
  const testFile = path.join(componentDir, `${fileName}.spec.js`);
  const styleFile = styleFileName
    ? path.join(componentDir, styleFileName)
    : null;

  try {
    await fs.access(componentDir);
    if (!options.force) {
      console.error(
        `O diretório ${componentDir} já existe. Use --force para sobrescrever.`
      );
      return { created: false, reason: "exists", path: componentDir };
    }
  } catch (err) {
  }

  if (options.dryRun) {
    return {
      created: true,
      dryRun: true,
      files: {
        component: componentFile,
        style: styleFile,
        test: testFile,
      },
      actions: {
        write: [componentFile]
          .concat(styleFile ? [styleFile] : [])
          .concat([testFile]),
      },
    };
  }

  await fs.mkdir(componentDir, { recursive: true });
  const content =
    vueVersion === 3
      ? vue3Template(pascal, styleFileName)
      : vue2Template(pascal, styleFileName);
  await fs.writeFile(componentFile, content, "utf-8");

  if (styleFile) {
    await fs.writeFile(styleFile, style, "utf-8");
  }
  if (options.noTest !== true) {
    await fs.writeFile(testFile, test, "utf-8");
  }
  return { created: true, path: componentDir };
}

module.exports = {
  createComponent,
};

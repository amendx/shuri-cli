/**
 * Programmatic API for Shuri CLI
 * 
 * Provides a clean JavaScript API for component generation
 * without mixing CLI concerns with programmatic usage.
 */

const { createComponent } = require("./create-component.js");

/**
 * Programmatic component creation API
 * @param {string[]} command - Command array: ['new', 'ComponentName']
 * @param {Object} options - Component options
 * @param {string} [options.root] - Root folder name
 * @param {string} [options.out] - Output directory
 * @param {boolean} [options.style=false] - Include style file
 * @param {string} [options.styleExt='css'] - Style file extension
 * @param {boolean} [options.noTest=false] - Skip test file
 * @param {boolean} [options.noDocs=false] - Skip documentation generation
 * @param {boolean} [options.force=false] - Force overwrite
 * @param {boolean} [options.dryRun=false] - Dry run mode
 * @param {boolean} [options.kebab=false] - Use kebab-case naming
 * @param {boolean} [options.backup=false] - Create backup copy
 * @param {boolean} [options.vue2=false] - Use Vue 2 template
 * @param {boolean} [options.vue3=false] - Use Vue 3 template
 * @returns {Promise<Object>} Creation result
 */
async function runProgrammatic(command, options = {}) {
  const [cmd, name] = command;
  
  if (cmd !== 'new' || !name) {
    throw new Error('Invalid command. Use: runProgrammatic([\'new\', \'ComponentName\'], { options })');
  }
  
  return await createComponent(name, {
    cwd: process.cwd(),
    root: options.root,
    out: options.out,
    style: options.style || false,
    styleExt: options.styleExt || 'css',
    noTest: options.noTest || false,
    noDocs: options.noDocs || false,
    force: options.force || false,
    backup: options.backup || false,
    dryRun: options.dryRun || false,
    kebab: options.kebab || false,
    vueVersion: options.vue2 ? 2 : options.vue3 ? 3 : null,
  });
}

module.exports = {
  runProgrammatic,
};
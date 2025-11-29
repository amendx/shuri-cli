/**
 * Vue Version Detection Module
 * 
 * Automatically detects Vue.js major version (2 or 3) from project's package.json.
 * Checks both dependencies and devDependencies for Vue installation.
 * 
 * @module check-vue-version
 * @requires get-vue-version - Version string parser utility
 * 
 * @function detectVueVersion
 * @returns {Promise<number|null>} Vue major version (2 or 3) or null if not found
 * 
 * @example
 * const vueVersion = await detectVueVersion(...);
 * // Returns: 3 (for Vue 3.x), 2 (for Vue 2.x), or null (if not found)
 */

const { getVueMajor } = require("../helpers/get-vue-version.js");

async function detectVueVersion(cwd, fs, path) {
  try {
    const packageJsonPath = path.join(cwd, "package.json");
    const packageJsonData = await fs.readFile(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageJsonData);
    const checkVueDependency =
      packageJson.dependencies && packageJson.dependencies.vue;
    const checkDevDependency =
      packageJson.devDependencies && packageJson.devDependencies.vue;
    const vueVersion = checkVueDependency || checkDevDependency;
    if (!vueVersion) return null;

    const majorVersion = getVueMajor(vueVersion);
    if (majorVersion) return majorVersion;

    return null;
  } catch (error) {
    return null;
  }
}

module.exports = {
  detectVueVersion,
};
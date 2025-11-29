
/**
 * Vue Version Detection Utility
 * 
 * This module provides functionality to detect Vue.js major version (2 or 3) 
 * from package.json files in a given directory.
 * 
 * SUPPORTED VERSION FORMATS:
 * - Exact versions: "2.6.11", "3.0.0"
 * - Caret ranges(^): "^2.6.0", "^3.2.0"
 * - Tilde ranges(~): "~2.6.0", "~3.0.0"
 * - Comparison operators(>, <, >=, <=): ">=2.5.0", "<=3.0.0", ">2.0.0", "<4.0.0"
 * - Version prefixes(v): "v2.6.11", "v3.0.0"
 * - Complex ranges: ">=2.5 <3.0"
 * 
 * ALGORITHM:
 * 1. Reads package.json from specified directory
 * 2. Checks dependencies and devDependencies for Vue
 * 3. Parses version string to extract major version
 * 4. Returns 2 for Vue 2.x, 3 for Vue 3.x, or null if undetectable
 */

async function getVueVersion(cwd, fs, path) {
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

    const parseVueVersion = (v) => {
      if (!v || typeof v !== 'string') return null;

      const s = v.trim();

      const startsWithMajor = (major) => {
        const re = new RegExp(`^\\s*(?:v|\\^|~|>=|<=|>|<)?\\s*${major}(?:\\.|$)`);
        return re.test(s);
      };

      const hasCaretMajor = (major) => {
        const re = new RegExp(`\\^${major}(?:\\.|$)`);
        return re.test(s);
      };

      if (startsWithMajor(2)) return 2;
      if (startsWithMajor(3)) return 3;

      if (hasCaretMajor(2)) return 2;
      if (hasCaretMajor(3)) return 3;

      const fallback = s.match(/^\s*[^\d]*([0-9]+)(?=\.|$)/);
      if (fallback) {
        const major = Number(fallback[1]);
        if (major === 2 || major === 3) return major;
      }

      return null;
    };

    const majorVersion = parseVueVersion(vueVersion);
    if (majorVersion) return majorVersion;

    return null;
  } catch (error) {
    return null;
  }
}

module.exports = { getVueVersion };

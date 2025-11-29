
/**
 * Vue Version Parser Utility
 * 
 * This module provides functionality to extract the major version number (2 or 3) 
 * from Vue.js version strings commonly found in package.json files.
 * 
 * SUPPORTED VERSION FORMATS:
 * - Exact versions: "2.6.11", "3.0.0"
 * - Caret ranges(^): "^2.6.0", "^3.2.0"
 * - Tilde ranges(~): "~2.6.0", "~3.0.0"
 * - Comparison operators(>, <, >=, <=): ">=2.5.0", "<=3.0.0", ">2.0.0", "<4.0.0"
 * - Version prefixes(v): "v2.6.11", "v3.0.0"
 * - Complex ranges: ">=2.5 <3.0"
 * 
 * PARAMETERS:
 * @param {string} v - The Vue version string to parse
 * 
 * RETURNS:
 * @returns {number|null} - Returns 2 for Vue 2.x, 3 for Vue 3.x, or null if unidentifiable
 * 
 * ALGORITHM:
 * 1. Checks for explicit version starts (2.x or 3.x patterns)
 * 2. Searches for caret notation (^2 or ^3) 
 * 3. Fallback: extracts first major number from string
 * 4. Returns null if no valid Vue 2/3 version is detected
 */

function getVueMajor(v) {
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
}

module.exports = { getVueMajor };

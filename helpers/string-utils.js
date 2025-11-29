/** 
 * String Conversion Utilities
 * 
 * Provides functions to convert strings between different commonly used naming conventions.
 * 
 * SUPPORTED INPUT FORMATS:
 * - camelCase: "myComponentName", 
 * - PascalCase: "MyComponentName"
 * - kebab-case: "my-component-name"
 * - snake_case: "my_component_name"
 * - space separated: "my component name"
 * - Mixed formats: "my-Component Name"
 * 
 * FUNCTIONS:
 * 
 * pascalCase(str):
 * - Converts any string format to PascalCase
 * - First letter of each word is capitalized
 * - No separators between words
 * - Examples: "my component" → "MyComponent"
 * 
 * kebabCase(str):
 * - Converts any string format to kebab-case
 * - All lowercase with hyphens between words
 * - Examples: "My Component" → "my-component"
 */

function pascalCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
    .replace(/^[a-z]/, char => char.toUpperCase())
    .replace(/([a-z])([A-Z])/g, '$1$2');
}

function kebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_-]+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');
}
module.exports = {
  pascalCase,
  kebabCase
};

/** Generates a basic CSS style template for a given component name.
 *
 * @param {string} componentName - The name of the component (in PascalCase).
 * @param {string} kebabName - The component name in kebab-case.
 * @returns {string} - The style template as a string.
 */

const { kebabCase } = require("../string-utils.js");


function styleTemplate(componentName, kebabName) {
  return `.${kebabName} {
  display: block;
}
`;
}

module.exports = {
  styleTemplate,
};
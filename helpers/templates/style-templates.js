/**
 * Generates a style template for a given component name
 * supporting CSS, SCSS, and Stylus formats.
 *
 * @param {string} kebabName - The component name in kebab-case.
 * @returns {string} - The style template as a string.
 */
function styleTemplate(kebabName) {
  return `.${kebabName} {
  display: block;
}
`;
}

module.exports = {
  styleTemplate,
};

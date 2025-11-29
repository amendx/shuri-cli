/**
 * Template for the index.js file of a component.
 * @param {string} componentName - The name of the component.
 * @returns {string} The content of the index.js file.
 */

function indexTemplate(componentName) {
  return `
  import { registerComponent } from '@utils/plugins'
import ${componentName} from './${componentName}.vue'

const Plugin = {
  install(Vue) {
    registerComponent(Vue, ${componentName})
  },
}

export default Plugin
export { ${componentName} }
`;
}

module.exports = {
  indexTemplate,
};

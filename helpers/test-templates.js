/** Generates a test template for a Vue component.
 *
 * @param {string} componentName - The name of the Vue component.
 * @param {number} vueVersion - The major version of Vue (2 or 3).
 * @returns {string} - The test template as a string.
 */



function testTemplate(componentName, vueVersion) {
  return `import { mount } from '@vue/test-utils';
import ${componentName} from './${componentName}.vue';

describe('${componentName}', () => {
  it('mounts', () => {
    const wrapper = mount(${componentName});
    expect(wrapper.exists()).toBe(true);
  });
});
`;
}

module.exports = { testTemplate };
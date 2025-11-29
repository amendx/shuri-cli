/** Generates a test template for a Vue component.
 *
 * @param {string} componentName - The name of the Vue component.
 * @param {number} vueVersion - The major version of Vue (2 or 3).
 * @returns {string} - The test template as a string.
 */

function vue2TestTemplate(componentName, vueVersion) {
  return `import { shallowMount } from '@vue/test-utils';
import ${componentName} from './${componentName}.vue';

describe('${componentName}', () => {
  it('exporta um componente válido', () => {
    const wrapper = shallowMount(${componentName});
    expect(wrapper.exists()).toBe(true);
  });
});
`;
}

function vue3TestTemplate(componentName, vueVersion) {
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

function testTemplate(componentName, vueVersion) {
  const generators = {
    2: vue2TestTemplate,
    3: vue3TestTemplate,
  };

  return (generators[vueVersion] ?? vue2TestTemplate)(componentName);
}

module.exports = { testTemplate };
